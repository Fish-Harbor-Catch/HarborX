import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { createDatabase } from "../src/db.js";
import { createApp } from "../src/app.js";
import { seedDemo, DEMO_PASSWORD } from "../src/seed.js";
let db, app, admin, seller, buyer, buyer2;
const login = async (email) => {
  const a = request.agent(app);
  const r = await a
    .post("/api/auth/login")
    .send({ email, password: DEMO_PASSWORD });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  return a;
};
const catchData = () => ({
  species: "Yellowfin Tuna",
  grade: "A",
  weight: 100,
  base_price: 1000,
  min_increment: 50,
  harbor: "Dikkowita",
  boat_name: "Test Boat 001",
  arrival_at: new Date(Date.now() + 3600000).toISOString(),
  notes: "Automated workflow test",
  image_key: "tuna",
});
async function freshLot() {
  const r = await seller.post("/api/lots").send(catchData());
  assert.equal(r.status, 201, JSON.stringify(r.body));
  return r.body.lot;
}
async function liveLot() {
  const l = await freshLot();
  assert.equal(
    (await admin.post(`/api/lots/${l.id}/publish`).send({})).status,
    200,
  );
  assert.equal(
    (await admin.post(`/api/lots/${l.id}/start-round`).send({ minutes: 10 }))
      .status,
    200,
  );
  return l;
}
before(async () => {
  db = await createDatabase({ url: null, memory: true });
  await seedDemo(db);
  app = createApp(db, {
    testing: true,
    secret: "test-secret-only-not-used-by-server",
  });
  admin = await login("admin@harborx.demo");
  seller = await login("seller@harborx.demo");
  buyer = await login("buyer@harborx.demo");
  buyer2 = await login("buyer2@harborx.demo");
});
after(async () => {
  await db?.close();
});
test("admin login rejects wrong passwords and retains a protected cookie session", async () => {
  const agent = request.agent(app);
  const rejected = await agent.post("/api/auth/login").send({
    email: "admin@harborx.demo",
    password: "incorrect-test-password",
  });
  assert.equal(rejected.status, 401);
  assert.equal(rejected.headers["set-cookie"], undefined);
  assert.equal((await agent.get("/api/auth/me")).status, 401);
  const accepted = await agent.post("/api/auth/login").send({
    email: "admin@harborx.demo",
    password: DEMO_PASSWORD,
  });
  assert.equal(accepted.status, 200);
  assert.equal(accepted.body.user.role, "admin");
  assert.equal(accepted.body.user.password_hash, undefined);
  const cookie = accepted.headers["set-cookie"][0];
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Lax/i);
  assert.match(cookie, /Max-Age=43200/i);
  assert.equal(
    (await agent.get("/api/auth/me")).body.user.id,
    accepted.body.user.id,
  );
  assert.equal((await agent.get("/api/users")).status, 200);
});
test("development supports local HTTP while production retains HTTPS upgrade policy", async () => {
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "development";
    const development = createApp(db, { testing: true });
    const local = await request(development).get("/api/health");
    assert.equal(local.status, 200);
    assert.ok(
      !local.headers["content-security-policy"].includes(
        "upgrade-insecure-requests",
      ),
    );
    process.env.NODE_ENV = "production";
    const production = createApp(db, { testing: true });
    const deployed = await request(production).get("/api/health");
    assert.ok(
      deployed.headers["content-security-policy"].includes(
        "upgrade-insecure-requests",
      ),
    );
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});
test("private routes require login and registration cannot create administrators", async () => {
  assert.equal((await request(app).get("/api/lots")).status, 401);
  assert.equal(
    (
      await request(app).post("/api/auth/register").send({
        name: "Fake Admin",
        email: "fake@example.com",
        password: "VeryLongPassword123!",
        role: "admin",
      })
    ).status,
    400,
  );
  assert.equal((await buyer.get("/api/users")).status, 403);
  assert.equal((await buyer.get("/api/reports/export")).status, 403);
});
test("registration validates email uniqueness, passwords and buyer verification", async () => {
  const a = request.agent(app);
  const payload = {
    name: "New Buyer",
    email: "new@example.com",
    password: "LongPassword123!",
    role: "buyer",
  };
  const r = await a.post("/api/auth/register").send(payload);
  assert.equal(r.status, 201);
  assert.equal(r.body.user.verified, false);
  assert.equal(r.body.user.password_hash, undefined);
  const l = await liveLot();
  assert.equal(
    (
      await a
        .post(`/api/lots/${l.id}/bids`)
        .send({ amount: 1000, request_key: randomUUID() })
    ).status,
    403,
  );
  assert.equal(
    (await request(app).post("/api/auth/register").send(payload)).status,
    409,
  );
  assert.equal(
    (await admin.patch(`/api/users/${r.body.user.id}`).send({ verified: true }))
      .status,
    200,
  );
  assert.equal(
    (
      await a
        .post(`/api/lots/${l.id}/bids`)
        .send({ amount: 1000, request_key: randomUUID() })
    ).status,
    201,
  );
});
test("offline catch retry is idempotent and pending catches remain private", async () => {
  const data = { ...catchData(), client_id: randomUUID() };
  const a = await seller.post("/api/lots").send(data),
    b = await seller.post("/api/lots").send(data);
  assert.equal(a.status, 201);
  assert.equal(b.status, 200);
  assert.equal(a.body.lot.id, b.body.lot.id);
  assert.equal(b.body.duplicate, true);
  assert.equal((await buyer.get(`/api/lots/${a.body.lot.id}`)).status, 403);
  assert.equal(
    (await seller.post(`/api/lots/${a.body.lot.id}/publish`).send({})).status,
    403,
  );
});
test("concurrent equal bids accept exactly one and retrying that bid creates no duplicate", async () => {
  const l = await liveLot();
  const k1 = randomUUID(),
    k2 = randomUUID();
  const results = await Promise.all([
    buyer
      .post(`/api/lots/${l.id}/bids`)
      .send({ amount: 1000, request_key: k1 }),
    buyer2
      .post(`/api/lots/${l.id}/bids`)
      .send({ amount: 1000, request_key: k2 }),
  ]);
  assert.deepEqual(results.map((x) => x.status).sort(), [201, 409]);
  const index = results.findIndex((x) => x.status === 201),
    agent = index === 0 ? buyer : buyer2,
    key = index === 0 ? k1 : k2;
  const repeat = await agent
    .post(`/api/lots/${l.id}/bids`)
    .send({ amount: 1000, request_key: key });
  assert.equal(repeat.status, 200);
  assert.equal(repeat.body.duplicate, true);
  const {
    rows: [n],
  } = await db.query("SELECT COUNT(*)::int AS n FROM bids WHERE lot_id=$1", [
    l.id,
  ]);
  assert.equal(n.n, 1);
  const other = await liveLot();
  assert.equal(
    (
      await agent
        .post(`/api/lots/${other.id}/bids`)
        .send({ amount: 1000, request_key: key })
    ).status,
    409,
  );
});
test("decimal bid increments use exact integer cents", async () => {
  const result = await seller
    .post("/api/lots")
    .send({ ...catchData(), base_price: 0.1, min_increment: 0.2 });
  assert.equal(result.status, 201);
  const id = result.body.lot.id;
  await admin.post(`/api/lots/${id}/publish`).send({});
  await admin.post(`/api/lots/${id}/start-round`).send({ minutes: 10 });
  assert.equal(
    (
      await buyer
        .post(`/api/lots/${id}/bids`)
        .send({ amount: 0.1, request_key: randomUUID() })
    ).status,
    201,
  );
  assert.equal(
    (
      await buyer2
        .post(`/api/lots/${id}/bids`)
        .send({ amount: 0.3, request_key: randomUUID() })
    ).status,
    201,
  );
});

test("minimum increment and round deadline are enforced by server", async () => {
  const l = await liveLot();
  assert.equal(
    (
      await buyer
        .post(`/api/lots/${l.id}/bids`)
        .send({ amount: 999, request_key: randomUUID() })
    ).status,
    409,
  );
  assert.equal(
    (
      await buyer
        .post(`/api/lots/${l.id}/bids`)
        .send({ amount: 1000, request_key: randomUUID() })
    ).status,
    201,
  );
  assert.equal(
    (
      await buyer2
        .post(`/api/lots/${l.id}/bids`)
        .send({ amount: 1049, request_key: randomUUID() })
    ).status,
    409,
  );
  assert.equal(
    (
      await buyer2
        .post(`/api/lots/${l.id}/bids`)
        .send({ amount: 1050, request_key: randomUUID() })
    ).status,
    201,
  );
  await db.query("UPDATE lots SET round_ends_at=$1 WHERE id=$2", [
    new Date(Date.now() - 1000).toISOString(),
    l.id,
  ]);
  assert.equal(
    (
      await buyer
        .post(`/api/lots/${l.id}/bids`)
        .send({ amount: 1100, request_key: randomUUID() })
    ).status,
    409,
  );
});
test("manager alone closes after arrival; weight changes after bids require relisting", async () => {
  const l = await liveLot();
  await buyer
    .post(`/api/lots/${l.id}/bids`)
    .send({ amount: 1000, request_key: randomUUID() });
  assert.equal(
    (await seller.post(`/api/lots/${l.id}/close`).send({})).status,
    403,
  );
  assert.equal(
    (await admin.post(`/api/lots/${l.id}/close`).send({})).status,
    409,
  );
  assert.equal(
    (await admin.post(`/api/lots/${l.id}/arrival`).send({ actual_weight: 90 }))
      .status,
    409,
  );
  assert.equal(
    (await admin.post(`/api/lots/${l.id}/arrival`).send({ actual_weight: 100 }))
      .status,
    200,
  );
  assert.equal(
    (await admin.post(`/api/lots/${l.id}/close`).send({})).status,
    409,
  );
  await admin.post(`/api/lots/${l.id}/end-round`).send({});
  assert.equal(
    (await admin.post(`/api/lots/${l.id}/close`).send({})).status,
    200,
  );
  const result = (await admin.get(`/api/lots/${l.id}`)).body.lot;
  assert.equal(result.status, "closed");
  assert.equal(Number(result.final_price), 100000);
  assert.equal(Number(result.commission), 5000);
  assert.ok(result.winner_id);
  assert.equal(
    (
      await buyer
        .post(`/api/lots/${l.id}/bids`)
        .send({ amount: 2000, request_key: randomUUID() })
    ).status,
    409,
  );
});
test("partial payments, overpayment protection and paid invoices", async () => {
  const l = await liveLot();
  await buyer
    .post(`/api/lots/${l.id}/bids`)
    .send({ amount: 1000, request_key: randomUUID() });
  await admin.post(`/api/lots/${l.id}/arrival`).send({ actual_weight: 100 });
  await admin.post(`/api/lots/${l.id}/end-round`).send({});
  await admin.post(`/api/lots/${l.id}/close`).send({});
  assert.equal(
    (
      await buyer
        .post(`/api/lots/${l.id}/payments`)
        .send({ amount: 10, reference: "test" })
    ).status,
    403,
  );
  assert.equal(
    (
      await admin
        .post(`/api/lots/${l.id}/payments`)
        .send({ amount: 40000, reference: "BANK-001" })
    ).status,
    201,
  );
  let r = (await admin.get(`/api/lots/${l.id}`)).body.lot;
  assert.equal(r.payment_status, "Partially Paid");
  assert.equal(r.balance, 60000);
  assert.equal(
    (
      await admin
        .post(`/api/lots/${l.id}/payments`)
        .send({ amount: 60001, reference: "BANK-002" })
    ).status,
    409,
  );
  assert.equal(
    (
      await admin
        .post(`/api/lots/${l.id}/payments`)
        .send({ amount: 60000, reference: "BANK-002" })
    ).status,
    201,
  );
  r = (await admin.get(`/api/lots/${l.id}`)).body.lot;
  assert.equal(r.payment_status, "Paid");
  assert.equal(r.balance, 0);
});
test("at most three bidding rounds, then unsold when no valid bids", async () => {
  const l = await liveLot();
  for (let n = 2; n <= 3; n++) {
    assert.equal(
      (await admin.post(`/api/lots/${l.id}/end-round`).send({})).status,
      200,
    );
    assert.equal(
      (await admin.post(`/api/lots/${l.id}/start-round`).send({ minutes: 5 }))
        .status,
      200,
    );
  }
  await admin.post(`/api/lots/${l.id}/end-round`).send({});
  assert.equal(
    (await admin.post(`/api/lots/${l.id}/start-round`).send({ minutes: 5 }))
      .status,
    409,
  );
  await admin.post(`/api/lots/${l.id}/arrival`).send({ actual_weight: 100 });
  assert.equal(
    (await admin.post(`/api/lots/${l.id}/close`).send({})).status,
    200,
  );
  assert.equal(
    (await admin.get(`/api/lots/${l.id}`)).body.lot.status,
    "unsold",
  );
});
test("cancelled lots preserve bids and audit history, but cannot accept further bids", async () => {
  const l = await liveLot();
  await buyer
    .post(`/api/lots/${l.id}/bids`)
    .send({ amount: 1000, request_key: randomUUID() });
  assert.equal(
    (
      await seller
        .post(`/api/lots/${l.id}/cancel`)
        .send({ reason: "Please withdraw" })
    ).status,
    403,
  );
  assert.equal(
    (
      await admin
        .post(`/api/lots/${l.id}/cancel`)
        .send({ reason: "Inspected catch weight mismatch" })
    ).status,
    200,
  );
  assert.equal(
    (
      await buyer
        .post(`/api/lots/${l.id}/bids`)
        .send({ amount: 1050, request_key: randomUUID() })
    ).status,
    409,
  );
  const r = (await admin.get(`/api/lots/${l.id}`)).body;
  assert.equal(r.bids.length, 1);
  assert.ok(r.events.some((e) => e.action === "Lot cancelled"));
});
test("malformed input, forbidden origins, logout and report access", async () => {
  assert.equal(
    (await seller.post("/api/lots").send({ ...catchData(), weight: -1 }))
      .status,
    400,
  );
  assert.equal((await admin.get("/api/lots/not-a-uuid")).status, 400);
  assert.equal(
    (
      await buyer
        .post("/api/auth/logout")
        .set("Origin", "https://untrusted.example")
        .send({})
    ).status,
    403,
  );
  const exportResult = await admin.get("/api/reports/export");
  assert.equal(exportResult.status, 200);
  assert.ok(exportResult.text.includes("payment_status"));
  const a = await login("buyer@harborx.demo");
  await a.post("/api/auth/logout").send({});
  assert.equal((await a.get("/api/auth/me")).status, 401);
});
