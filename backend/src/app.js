import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import jwt from "jsonwebtoken";
import { randomUUID, randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z, ZodError } from "zod";
import { hashPassword, checkPassword, publicUser } from "./security.js";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fail = (condition, status, message) => {
  if (condition) throw new HttpError(status, message);
};
const uuid = z.string().uuid();
const money = z.coerce
  .number()
  .positive()
  .max(10000000)
  .refine(
    (v) => Math.abs(v * 100 - Math.round(v * 100)) < 0.00001,
    "Use at most two decimal places.",
  );
const catchSchema = z.object({
  species: z.enum([
    "Yellowfin Tuna",
    "Skipjack Tuna",
    "Sardine",
    "Seer Fish",
    "Prawns",
    "Mackerel",
    "Other",
  ]),
  grade: z.enum(["A", "B", "C"]),
  weight: money.max(50000),
  base_price: money,
  min_increment: money.default(50),
  harbor: z.enum([
    "Dikkowita",
    "Negombo",
    "Galle",
    "Mirissa",
    "Trincomalee",
    "Beruwala",
    "Other",
  ]),
  boat_name: z.string().trim().min(2).max(100),
  arrival_at: z.iso.datetime(),
  notes: z.string().max(1000).default(""),
  image_key: z
    .enum(["tuna", "sardine", "seer", "prawns", "mackerel"])
    .default("tuna"),
});
export function createApp(
  db,
  {
    secret = process.env.JWT_SECRET || randomBytes(48).toString("hex"),
    testing = false,
  } = {},
) {
  const app = express();
  const production = process.env.NODE_ENV === "production";
  const secureCookie = production && process.env.COOKIE_SECURE !== "false";
  const origins = (
    process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173"
  )
    .split(",")
    .map((x) => x.trim());
  const commissionRate = Number(process.env.COMMISSION_RATE || 5),
    dueHours = Number(process.env.PAYMENT_DUE_HOURS || 48);
  if (
    !Number.isFinite(commissionRate) ||
    commissionRate < 0 ||
    commissionRate > 100 ||
    !Number.isFinite(dueHours) ||
    dueHours <= 0
  )
    throw new Error("Invalid commission or payment due configuration.");
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'self'"],
          // Safari upgrades even localhost assets to HTTPS with this directive.
          // Keep production enforcement; local HTTP development has no TLS server.
          upgradeInsecureRequests: production ? [] : null,
        },
      },
    }),
  );
  const originAllowed = (req) => {
    const origin = req.headers.origin;
    if (!origin || origins.includes(origin)) return true;
    try {
      const u = new URL(origin);
      return (
        ["http:", "https:"].includes(u.protocol) && u.host === req.get("host")
      );
    } catch {
      return false;
    }
  };
  app.use(
    cors((req, cb) =>
      cb(null, { origin: originAllowed(req), credentials: true }),
    ),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && !originAllowed(req))
      return next(new HttpError(403, "This browser origin is not allowed."));
    next();
  });
  if (!testing)
    app.use(
      "/api",
      rateLimit({
        windowMs: 60000,
        limit: 300,
        standardHeaders: "draft-8",
        legacyHeaders: false,
      }),
    );
  const authLimit = testing
    ? (req, res, next) => next()
    : rateLimit({
        windowMs: 15 * 60000,
        limit: 40,
        message: {
          error: "Too many attempts. Please try again in 15 minutes.",
        },
      });
  const route = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
  const session = route(async (req, res, next) => {
    const cookies = Object.fromEntries(
      (req.headers.cookie || "").split(";").map((x) => x.trim().split("=")),
    );
    const token = cookies.harborx_session;
    fail(!token, 401, "Please log in to continue.");
    let payload;
    try {
      payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
    } catch {
      throw new HttpError(401, "Your session expired. Please log in again.");
    }
    const {
      rows: [u],
    } = await db.query("SELECT * FROM users WHERE id=$1", [payload.sub]);
    fail(!u || !u.active, 401, "This account is unavailable.");
    req.user = publicUser(u);
    next();
  });
  const roles =
    (...allowed) =>
    (req, res, next) =>
      allowed.includes(req.user.role)
        ? next()
        : next(new HttpError(403, "Your role cannot perform this action."));
  const setSession = (res, user) =>
    res.cookie(
      "harborx_session",
      jwt.sign({ sub: user.id }, secret, {
        algorithm: "HS256",
        expiresIn: "12h",
      }),
      {
        httpOnly: true,
        secure: secureCookie,
        sameSite: "lax",
        maxAge: 12 * 3600000,
        path: "/",
      },
    );
  const audit = (c, lot, actor, action, detail) =>
    c.query(
      "INSERT INTO audit_events(id,lot_id,actor_id,action,detail) VALUES($1,$2,$3,$4,$5)",
      [randomUUID(), lot, actor, action, detail],
    );
  const getLot = async (c, id, lock = false) => {
    uuid.parse(id);
    const {
      rows: [lot],
    } = await c.query(
      `SELECT * FROM lots WHERE id=$1${lock ? " FOR UPDATE" : ""}`,
      [id],
    );
    fail(!lot, 404, "Auction lot not found.");
    return lot;
  };
  const lotQuery = `SELECT l.*,u.name AS seller_name,w.name AS winner_name,
  (SELECT COUNT(*)::int FROM bids b WHERE b.lot_id=l.id) AS bid_count,
  COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.lot_id=l.id),0) AS paid_amount
  FROM lots l JOIN users u ON u.id=l.seller_id LEFT JOIN users w ON w.id=l.winner_id`;
  const decorate = (l) => {
    const paid = Number(l.paid_amount || 0),
      total = Number(l.final_price || 0);
    return {
      ...l,
      payment_status:
        l.status !== "closed"
          ? "—"
          : paid >= total
            ? "Paid"
            : new Date(l.payment_due_at) < new Date()
              ? "Overdue"
              : paid > 0
                ? "Partially Paid"
                : "Pending",
      balance: Math.max(0, total - paid),
    };
  };
  app.get(
    "/api/health",
    route(async (req, res) => {
      await db.query("SELECT 1");
      res.json({
        status: "ok",
        database: db.kind,
        demo: process.env.DEMO_SEED === "true",
        commission_rate: commissionRate,
      });
    }),
  );
  app.post(
    "/api/auth/register",
    authLimit,
    route(async (req, res) => {
      const data = z
        .object({
          name: z.string().trim().min(2).max(80),
          email: z
            .email()
            .max(254)
            .transform((v) => v.toLowerCase()),
          password: z.string().min(12).max(128),
          role: z.enum(["seller", "buyer"]),
          phone: z.string().max(30).default(""),
          boat_name: z.string().max(100).default(""),
        })
        .parse(req.body);
      const {
        rows: [u],
      } = await db.query(
        "INSERT INTO users(id,name,email,password_hash,role,phone,boat_name,verified) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
        [
          randomUUID(),
          data.name,
          data.email,
          hashPassword(data.password),
          data.role,
          data.phone,
          data.boat_name,
          data.role === "seller",
        ],
      );
      setSession(res, u);
      res.status(201).json({ user: publicUser(u) });
    }),
  );
  app.post(
    "/api/auth/login",
    authLimit,
    route(async (req, res) => {
      const { email, password } = z
        .object({
          email: z.email().transform((x) => x.toLowerCase()),
          password: z.string().max(128),
        })
        .parse(req.body);
      const {
        rows: [u],
      } = await db.query("SELECT * FROM users WHERE email=$1", [email]);
      fail(
        !u || !u.active || !checkPassword(password, u.password_hash),
        401,
        "Incorrect email or password.",
      );
      setSession(res, u);
      res.json({ user: publicUser(u) });
    }),
  );
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("harborx_session", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookie,
    });
    res.json({ ok: true });
  });
  app.get("/api/auth/me", session, (req, res) => res.json({ user: req.user }));
  app.patch(
    "/api/auth/profile",
    session,
    route(async (req, res) => {
      const d = z
        .object({
          name: z.string().trim().min(2).max(80),
          phone: z.string().max(30),
          boat_name: z.string().max(100),
        })
        .parse(req.body);
      const {
        rows: [u],
      } = await db.query(
        "UPDATE users SET name=$1,phone=$2,boat_name=$3 WHERE id=$4 RETURNING *",
        [d.name, d.phone, d.boat_name, req.user.id],
      );
      res.json({ user: publicUser(u) });
    }),
  );
  app.get(
    "/api/lots",
    session,
    route(async (req, res) => {
      const { rows } = await db.query(
        `${lotQuery} WHERE ($1::text='admin' OR l.seller_id=$2 OR l.status NOT IN ('pending','cancelled')) ORDER BY l.created_at DESC`,
        [req.user.role, req.user.id],
      );
      res.json({ lots: rows.map(decorate) });
    }),
  );
  app.get(
    "/api/lots/:id",
    session,
    route(async (req, res) => {
      const id = uuid.parse(req.params.id);
      const {
        rows: [l],
      } = await db.query(`${lotQuery} WHERE l.id=$1`, [id]);
      fail(!l, 404, "Lot not found.");
      fail(
        req.user.role !== "admin" &&
          l.seller_id !== req.user.id &&
          ["pending", "cancelled"].includes(l.status),
        403,
        "This lot is not published.",
      );
      // Buyers see bid amounts and their own identity; other bidder identities are private.
      const { rows: bids } = await db.query(
        `SELECT b.id,b.amount,b.round,b.created_at,CASE WHEN $2::text='admin' OR b.buyer_id=$3 THEN u.name ELSE 'Verified buyer' END AS buyer_name,(b.buyer_id=$3) AS is_mine FROM bids b JOIN users u ON u.id=b.buyer_id WHERE b.lot_id=$1 ORDER BY b.created_at DESC,b.amount DESC`,
        [id, req.user.role, req.user.id],
      );
      const { rows: events } = await db.query(
        "SELECT action,detail,created_at FROM audit_events WHERE lot_id=$1 ORDER BY created_at DESC LIMIT 30",
        [id],
      );
      res.json({ lot: decorate(l), bids, events });
    }),
  );
  app.post(
    "/api/lots",
    session,
    roles("seller"),
    route(async (req, res) => {
      const d = catchSchema.parse(req.body);
      const id = req.body.client_id
        ? uuid.parse(req.body.client_id)
        : randomUUID();
      const result = await db.transaction(async (c) => {
        // Offline retries reuse client_id, so a lost response cannot create a second lot.
        const {
          rows: [existing],
        } = await c.query("SELECT * FROM lots WHERE id=$1", [id]);
        if (existing) {
          fail(
            existing.seller_id !== req.user.id,
            409,
            "Catch identifier already in use.",
          );
          return { lot: existing, duplicate: true };
        }
        const code = `HX-${randomUUID().slice(0, 8).toUpperCase()}`;
        const {
          rows: [lot],
        } = await c.query(
          "INSERT INTO lots(id,code,seller_id,species,grade,weight,base_price,min_increment,harbor,boat_name,arrival_at,notes,image_key) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *",
          [
            id,
            code,
            req.user.id,
            d.species,
            d.grade,
            d.weight,
            d.base_price,
            d.min_increment,
            d.harbor,
            d.boat_name,
            d.arrival_at,
            d.notes,
            d.image_key,
          ],
        );
        await audit(
          c,
          id,
          req.user.id,
          "Catch registered",
          "Catch submitted for auction manager review.",
        );
        return { lot };
      });
      res.status(result.duplicate ? 200 : 201).json(result);
    }),
  );
  app.patch(
    "/api/lots/:id",
    session,
    roles("seller"),
    route(async (req, res) => {
      const d = catchSchema.parse(req.body);
      const lot = await db.transaction(async (c) => {
        const l = await getLot(c, req.params.id, true);
        fail(
          l.seller_id !== req.user.id,
          403,
          "This catch belongs to another seller.",
        );
        fail(
          l.status !== "pending",
          409,
          "Only catches awaiting review can be edited.",
        );
        const {
          rows: [updated],
        } = await c.query(
          "UPDATE lots SET species=$1,grade=$2,weight=$3,base_price=$4,min_increment=$5,harbor=$6,boat_name=$7,arrival_at=$8,notes=$9,image_key=$10 WHERE id=$11 RETURNING *",
          [
            d.species,
            d.grade,
            d.weight,
            d.base_price,
            d.min_increment,
            d.harbor,
            d.boat_name,
            d.arrival_at,
            d.notes,
            d.image_key,
            l.id,
          ],
        );
        await audit(
          c,
          l.id,
          req.user.id,
          "Catch edited",
          "Pending catch details updated.",
        );
        return updated;
      });
      res.json({ lot });
    }),
  );
  app.post(
    "/api/lots/:id/bids",
    session,
    roles("buyer"),
    route(async (req, res) => {
      fail(
        !req.user.verified,
        403,
        "The auction manager must verify your buyer account before you can bid.",
      );
      const { amount, request_key } = z
        .object({ amount: money, request_key: uuid })
        .parse(req.body);
      const result = await db.transaction(async (c) => {
        const l = await getLot(c, req.params.id, true);
        const {
          rows: [previous],
        } = await c.query(
          "SELECT * FROM bids WHERE buyer_id=$1 AND request_key=$2",
          [req.user.id, request_key],
        );
        if (previous) {
          fail(
            previous.lot_id !== l.id || Number(previous.amount) !== amount,
            409,
            "This request key was already used for a different bid.",
          );
          return { bid: previous, duplicate: true };
        }
        fail(
          l.status !== "live" ||
            !l.round_ends_at ||
            new Date(l.round_ends_at) <= new Date(),
          409,
          "This bidding round is closed.",
        );
        fail(
          l.seller_id === req.user.id,
          403,
          "You cannot bid on your own catch.",
        );
        const minimumCents =
          l.highest_bid === null
            ? Math.round(Number(l.base_price) * 100)
            : Math.round(Number(l.highest_bid) * 100) +
              Math.round(Number(l.min_increment) * 100);
        const minimum = minimumCents / 100;
        fail(
          Math.round(amount * 100) < minimumCents,
          409,
          `The minimum accepted bid is LKR ${minimum.toFixed(2)} per kg. Refresh the auction and try again.`,
        );
        const {
          rows: [bid],
        } = await c.query(
          "INSERT INTO bids(id,lot_id,buyer_id,amount,round,request_key) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
          [randomUUID(), l.id, req.user.id, amount, l.round, request_key],
        );
        await c.query(
          "UPDATE lots SET highest_bid=$1,highest_buyer_id=$2 WHERE id=$3",
          [amount, req.user.id, l.id],
        );
        return { bid };
      });
      res.status(result.duplicate ? 200 : 201).json(result);
    }),
  );
  app.get(
    "/api/my-bids",
    session,
    roles("buyer"),
    route(async (req, res) => {
      const { rows } = await db.query(
        "SELECT b.*,l.code,l.species,l.status,l.highest_bid,l.winner_id,l.highest_buyer_id,l.round_ends_at FROM bids b JOIN lots l ON l.id=b.lot_id WHERE b.buyer_id=$1 ORDER BY b.created_at DESC",
        [req.user.id],
      );
      res.json({ bids: rows });
    }),
  );
  app.post(
    "/api/lots/:id/publish",
    session,
    roles("admin"),
    route(async (req, res) => {
      await db.transaction(async (c) => {
        const l = await getLot(c, req.params.id, true);
        fail(
          l.status !== "pending",
          409,
          "Only pending catches can be published.",
        );
        await c.query("UPDATE lots SET status='scheduled' WHERE id=$1", [l.id]);
        await audit(
          c,
          l.id,
          req.user.id,
          "Lot published",
          "Approved and visible to buyers.",
        );
      });
      res.json({ ok: true });
    }),
  );
  app.post(
    "/api/lots/:id/start-round",
    session,
    roles("admin"),
    route(async (req, res) => {
      const { minutes } = z
        .object({
          minutes: z.coerce.number().int().min(1).max(120).default(10),
        })
        .parse(req.body);
      await db.transaction(async (c) => {
        const l = await getLot(c, req.params.id, true);
        fail(
          !["scheduled", "live"].includes(l.status),
          409,
          "Publish the lot before starting a round.",
        );
        fail(
          l.round >= 3,
          409,
          "This auction has already used its three rounds.",
        );
        fail(
          l.status === "live" && new Date(l.round_ends_at) > new Date(),
          409,
          "End the current round before starting another.",
        );
        await c.query(
          "UPDATE lots SET status='live',round=round+1,round_ends_at=$1 WHERE id=$2",
          [new Date(Date.now() + minutes * 60000).toISOString(), l.id],
        );
        await audit(
          c,
          l.id,
          req.user.id,
          "Round started",
          `Round ${l.round + 1}; duration ${minutes} minutes.`,
        );
      });
      res.json({ ok: true });
    }),
  );
  app.post(
    "/api/lots/:id/end-round",
    session,
    roles("admin"),
    route(async (req, res) => {
      await db.transaction(async (c) => {
        const l = await getLot(c, req.params.id, true);
        fail(l.status !== "live", 409, "No active round.");
        await c.query("UPDATE lots SET round_ends_at=NOW() WHERE id=$1", [
          l.id,
        ]);
        await audit(
          c,
          l.id,
          req.user.id,
          "Round ended",
          `Round ${l.round} ended by auction manager.`,
        );
      });
      res.json({ ok: true });
    }),
  );
  app.post(
    "/api/lots/:id/arrival",
    session,
    roles("admin"),
    route(async (req, res) => {
      const { actual_weight } = z
        .object({ actual_weight: money.max(50000) })
        .parse(req.body);
      await db.transaction(async (c) => {
        const l = await getLot(c, req.params.id, true);
        fail(
          !["scheduled", "live"].includes(l.status),
          409,
          "Arrival can only be confirmed for a published, unfinished auction.",
        );
        fail(
          l.arrived &&
            l.highest_bid !== null &&
            Number(l.actual_weight) !== actual_weight,
          409,
          "Cancel and relist to change a verified weight after bids.",
        );
        fail(
          actual_weight !== Number(l.weight),
          409,
          "Weight differs from the advertised weight. Cancel and relist the lot so buyers can bid on the corrected quantity.",
        );
        await c.query(
          "UPDATE lots SET arrived=TRUE,actual_weight=$1 WHERE id=$2",
          [actual_weight, l.id],
        );
        await audit(
          c,
          l.id,
          req.user.id,
          "Arrival verified",
          `Inspected weight: ${actual_weight} kg.`,
        );
      });
      res.json({ ok: true });
    }),
  );
  app.post(
    "/api/lots/:id/close",
    session,
    roles("admin"),
    route(async (req, res) => {
      await db.transaction(async (c) => {
        const l = await getLot(c, req.params.id, true);
        fail(
          !["scheduled", "live"].includes(l.status),
          409,
          "This auction cannot be closed.",
        );
        fail(
          !l.arrived || !l.actual_weight,
          409,
          "Confirm the boat arrival and inspected weight before closing.",
        );
        fail(
          l.status === "live" && new Date(l.round_ends_at) > new Date(),
          409,
          "End the current bidding round before closing.",
        );
        if (l.highest_bid === null) {
          await c.query(
            "UPDATE lots SET status='unsold',closed_at=NOW(),round_ends_at=NULL WHERE id=$1",
            [l.id],
          );
          await audit(
            c,
            l.id,
            req.user.id,
            "Unsold",
            "No valid bids. Seller may create a new lot.",
          );
          return;
        }
        const total =
          Math.round(Number(l.actual_weight) * Number(l.highest_bid) * 100) /
          100;
        const commission = Math.round(total * commissionRate) / 100;
        await c.query(
          "UPDATE lots SET status='closed',winner_id=highest_buyer_id,final_price=$1,commission=$2,commission_rate=$3,payment_due_at=$4,closed_at=NOW(),round_ends_at=NULL WHERE id=$5",
          [
            total,
            commission,
            commissionRate,
            new Date(Date.now() + dueHours * 3600000).toISOString(),
            l.id,
          ],
        );
        await audit(
          c,
          l.id,
          req.user.id,
          "Auction closed",
          `Highest valid bid won; total LKR ${total.toFixed(2)}.`,
        );
      });
      res.json({ ok: true });
    }),
  );
  app.post(
    "/api/lots/:id/cancel",
    session,
    roles("admin", "seller"),
    route(async (req, res) => {
      const { reason } = z
        .object({ reason: z.string().trim().min(5).max(500) })
        .parse(req.body);
      await db.transaction(async (c) => {
        const l = await getLot(c, req.params.id, true);
        fail(
          ["closed", "cancelled", "unsold"].includes(l.status),
          409,
          "This auction has already ended.",
        );
        if (req.user.role === "seller")
          fail(
            l.seller_id !== req.user.id || l.status !== "pending",
            403,
            "Sellers may only withdraw their own pending catches. Ask the manager to cancel a published lot.",
          );
        await c.query(
          "UPDATE lots SET status='cancelled',cancel_reason=$1,round_ends_at=NULL WHERE id=$2",
          [reason, l.id],
        );
        await audit(c, l.id, req.user.id, "Lot cancelled", reason);
      });
      res.json({ ok: true });
    }),
  );
  app.get(
    "/api/payments",
    session,
    route(async (req, res) => {
      const { rows } = await db.query(
        `${lotQuery} WHERE l.status='closed' AND ($1::text='admin' OR l.seller_id=$2 OR l.winner_id=$2) ORDER BY l.closed_at DESC`,
        [req.user.role, req.user.id],
      );
      res.json({ invoices: rows.map(decorate) });
    }),
  );
  app.get(
    "/api/lots/:id/payments",
    session,
    route(async (req, res) => {
      const l = await getLot(db, req.params.id);
      fail(
        req.user.role !== "admin" &&
          l.seller_id !== req.user.id &&
          l.winner_id !== req.user.id,
        403,
        "You cannot view these payment records.",
      );
      const { rows } = await db.query(
        "SELECT p.id,p.amount,p.reference,p.created_at,u.name AS recorded_by FROM payments p JOIN users u ON u.id=p.recorded_by WHERE lot_id=$1 ORDER BY p.created_at DESC",
        [l.id],
      );
      res.json({ payments: rows });
    }),
  );
  app.post(
    "/api/lots/:id/payments",
    session,
    roles("admin"),
    route(async (req, res) => {
      const { amount, reference } = z
        .object({ amount: money, reference: z.string().trim().min(3).max(100) })
        .parse(req.body);
      await db.transaction(async (c) => {
        const l = await getLot(c, req.params.id, true);
        fail(l.status !== "closed", 409, "Payments require a completed sale.");
        const {
          rows: [p],
        } = await c.query(
          "SELECT COALESCE(SUM(amount),0) AS paid FROM payments WHERE lot_id=$1",
          [l.id],
        );
        fail(
          Math.round((amount + Number(p.paid)) * 100) >
            Math.round(Number(l.final_price) * 100),
          409,
          "This payment exceeds the outstanding balance.",
        );
        await c.query(
          "INSERT INTO payments(id,lot_id,amount,reference,recorded_by) VALUES($1,$2,$3,$4,$5)",
          [randomUUID(), l.id, amount, reference, req.user.id],
        );
        await audit(
          c,
          l.id,
          req.user.id,
          "Payment recorded",
          `LKR ${amount.toFixed(2)}; reference ${reference}.`,
        );
      });
      res.status(201).json({ ok: true });
    }),
  );
  app.get(
    "/api/users",
    session,
    roles("admin"),
    route(async (req, res) => {
      const { rows } = await db.query(
        "SELECT id,name,email,phone,role,verified,active,boat_name,created_at FROM users ORDER BY created_at DESC",
      );
      res.json({ users: rows });
    }),
  );
  app.patch(
    "/api/users/:id",
    session,
    roles("admin"),
    route(async (req, res) => {
      const id = uuid.parse(req.params.id);
      const d = z
        .object({
          verified: z.boolean().optional(),
          active: z.boolean().optional(),
        })
        .refine((v) => v.verified !== undefined || v.active !== undefined)
        .parse(req.body);
      fail(
        id === req.user.id,
        409,
        "You cannot change your own account status.",
      );
      await db.transaction(async (c) => {
        const {
          rows: [u],
        } = await c.query("SELECT * FROM users WHERE id=$1 FOR UPDATE", [id]);
        fail(!u, 404, "User not found.");
        fail(
          u.role === "admin",
          403,
          "Admin accounts are managed through the provisioning script.",
        );
        await c.query("UPDATE users SET verified=$1,active=$2 WHERE id=$3", [
          d.verified ?? u.verified,
          d.active ?? u.active,
          id,
        ]);
        await audit(
          c,
          null,
          req.user.id,
          "User updated",
          `${u.email}: verified=${d.verified ?? u.verified}, active=${d.active ?? u.active}`,
        );
      });
      res.json({ ok: true });
    }),
  );
  app.get(
    "/api/activity",
    session,
    route(async (req, res) => {
      const { rows } = await db.query(
        `SELECT a.action,a.detail,a.created_at,l.code FROM audit_events a LEFT JOIN lots l ON l.id=a.lot_id WHERE $1::text='admin' OR l.seller_id=$2 OR l.winner_id=$2 OR a.actor_id=$2 ORDER BY a.created_at DESC LIMIT 25`,
        [req.user.role, req.user.id],
      );
      res.json({ events: rows });
    }),
  );
  app.get(
    "/api/reports",
    session,
    roles("admin"),
    route(async (req, res) => {
      const { rows } = await db.query(`${lotQuery} ORDER BY l.created_at DESC`);
      res.json({
        lots: rows.map(decorate),
        generated_at: new Date().toISOString(),
      });
    }),
  );
  app.get(
    "/api/reports/export",
    session,
    roles("admin"),
    route(async (req, res) => {
      const { rows } = await db.query(`${lotQuery} ORDER BY l.created_at DESC`);
      const cell = (v) => {
        let s = String(v ?? "");
        if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
        return '"' + s.replaceAll('"', '""') + '"';
      };
      const columns = [
        "code",
        "species",
        "harbor",
        "seller_name",
        "weight",
        "actual_weight",
        "status",
        "round",
        "highest_bid",
        "winner_name",
        "final_price",
        "commission",
        "paid_amount",
        "payment_status",
        "closed_at",
      ];
      res
        .set({
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition":
            'attachment; filename="HarborX-auction-report.csv"',
        })
        .send(
          "\uFEFF" +
            [
              columns.join(","),
              ...rows
                .map(decorate)
                .map((l) => columns.map((k) => cell(l[k])).join(",")),
            ].join("\r\n"),
        );
    }),
  );
  const dist = fileURLToPath(new URL("../../frontend/dist", import.meta.url));
  if (existsSync(dist)) {
    app.use(
      express.static(dist, {
        setHeaders(res, path) {
          // Let the browser discover new workers and manifests on each visit.
          // Versioned JS/CSS remain safe to precache in the public app shell.
          if (/\/(?:sw\.js|index\.html|manifest\.webmanifest)$/.test(path))
            res.set("Cache-Control", "no-cache");
        },
      }),
    );
    app.get("/{*path}", (req, res, next) =>
      req.path.startsWith("/api/")
        ? next()
        : res.sendFile(`${dist}/index.html`),
    );
  }
  app.use((req, res) => res.status(404).json({ error: "Endpoint not found." }));
  app.use((err, req, res, next) => {
    if (err instanceof ZodError)
      return res.status(400).json({
        error: err.issues
          .map((i) => `${i.path.join(".") || "Input"}: ${i.message}`)
          .join(" "),
      });
    if (err.code === "23505")
      return res
        .status(409)
        .json({ error: "This email or record already exists." });
    if (err.type === "entity.parse.failed")
      return res.status(400).json({ error: "Invalid JSON request." });
    if (!err.status && !testing) console.error(err);
    res.status(err.status || 500).json({
      error: err.status
        ? err.message
        : "Something went wrong. Please try again.",
    });
  });
  return app;
}
