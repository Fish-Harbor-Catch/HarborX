import { randomUUID } from "node:crypto";
import { hashPassword } from "./security.js";
export const DEMO_PASSWORD = "HarborXDemo2026!";
export async function seedDemo(db) {
  const {
    rows: [r],
  } = await db.query("SELECT COUNT(*)::int AS count FROM users");
  if (r.count > 0) return;
  const admin = randomUUID(),
    seller = randomUUID(),
    seller2 = randomUUID(),
    buyer = randomUUID(),
    buyer2 = randomUUID();
  const password = hashPassword(DEMO_PASSWORD);
  await db.transaction(async (c) => {
    for (const [id, name, email, role, boat] of [
      [admin, "Nimal Perera", "admin@harborx.demo", "admin", ""],
      [
        seller,
        "Kasun Fernando",
        "seller@harborx.demo",
        "seller",
        "Ocean Pearl LK-2048",
      ],
      [
        seller2,
        "Dinesh Silva",
        "dinesh@harborx.demo",
        "seller",
        "Sea Breeze LK-1702",
      ],
      [buyer, "Aarsan Traders", "buyer@harborx.demo", "buyer", ""],
      [buyer2, "Southern Seafood", "buyer2@harborx.demo", "buyer", ""],
    ])
      await c.query(
        "INSERT INTO users(id,name,email,password_hash,role,boat_name,phone,verified) VALUES($1,$2,$3,$4,$5,$6,$7,TRUE)",
        [id, name, email, password, role, boat, "+94 77 123 4567"],
      );
    const items = [
      [
        "Yellowfin Tuna",
        "A",
        120,
        1800,
        "Dikkowita",
        "tuna",
        "live",
        seller,
        2150,
        buyer,
        2,
      ],
      [
        "Seer Fish",
        "A",
        65,
        2400,
        "Negombo",
        "seer",
        "live",
        seller2,
        2600,
        buyer2,
        1,
      ],
      [
        "Skipjack Tuna",
        "B",
        180,
        950,
        "Galle",
        "tuna",
        "scheduled",
        seller,
        null,
        null,
        0,
      ],
      [
        "Prawns",
        "A",
        45,
        2200,
        "Dikkowita",
        "prawns",
        "pending",
        seller,
        null,
        null,
        0,
      ],
      [
        "Sardine",
        "A",
        220,
        550,
        "Mirissa",
        "sardine",
        "closed",
        seller,
        650,
        buyer,
        3,
      ],
      [
        "Mackerel",
        "B",
        85,
        800,
        "Negombo",
        "mackerel",
        "closed",
        seller2,
        1000,
        buyer,
        2,
      ],
    ];
    for (let i = 0; i < items.length; i++) {
      const [
          species,
          grade,
          weight,
          base,
          harbor,
          image,
          status,
          owner,
          highest,
          leader,
          round,
        ] = items[i],
        id = randomUUID(),
        closed = status === "closed";
      const arrival = new Date(Date.now() + (i - 1) * 45 * 60000),
        ends = status === "live" ? new Date(Date.now() + 90 * 60000) : null,
        total = closed ? weight * highest : null;
      await c.query(
        "INSERT INTO lots(id,code,seller_id,species,grade,weight,base_price,min_increment,harbor,boat_name,arrival_at,image_key,status,round,round_ends_at,highest_bid,highest_buyer_id,arrived,actual_weight,winner_id,final_price,commission,commission_rate,payment_due_at,closed_at,created_at,notes) VALUES($1,$2,$3,$4,$5,$6,$7,50,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)",
        [
          id,
          `HX-00${248 + i}`,
          owner,
          species,
          grade,
          weight,
          base,
          harbor,
          owner === seller ? "Ocean Pearl LK-2048" : "Sea Breeze LK-1702",
          arrival.toISOString(),
          image,
          status,
          round,
          ends?.toISOString() || null,
          highest,
          leader,
          closed,
          closed ? weight : null,
          closed ? leader : null,
          total,
          closed ? total * 0.05 : null,
          closed ? 5 : null,
          closed
            ? new Date(
                Date.now() + (i === 4 ? 24 : -24) * 3600000,
              ).toISOString()
            : null,
          closed ? new Date(Date.now() - 86400000).toISOString() : null,
          new Date(Date.now() - (6 - i) * 3600000).toISOString(),
          "Fresh catch, stored on ice. Collection at the harbor after auction manager verification.",
        ],
      );
      if (highest) {
        for (let n = 0; n < 3; n++)
          await c.query(
            "INSERT INTO bids(id,lot_id,buyer_id,amount,round,request_key,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)",
            [
              randomUUID(),
              id,
              n === 2 ? leader : n === 0 ? buyer : buyer2,
              highest - (2 - n) * 50,
              round,
              randomUUID(),
              new Date(Date.now() - (3 - n) * 900000).toISOString(),
            ],
          );
      }
      if (closed && i === 4)
        await c.query(
          "INSERT INTO payments(id,lot_id,amount,reference,recorded_by) VALUES($1,$2,$3,$4,$5)",
          [randomUUID(), id, 40000, "BANK-DEMO-001", admin],
        );
      await c.query(
        "INSERT INTO audit_events(id,lot_id,actor_id,action,detail) VALUES($1,$2,$3,$4,$5)",
        [
          randomUUID(),
          id,
          admin,
          closed
            ? "Auction closed"
            : status === "live"
              ? "Round started"
              : "Catch registered",
          closed
            ? "Winning bid recorded. Payment is due within 48 hours."
            : `${species} · ${weight} kg · ${harbor} harbor`,
        ],
      );
    }
  });
}
