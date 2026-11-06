import "dotenv/config";
import { createDatabase } from "./db.js";
import { createApp } from "./app.js";
import { seedDemo } from "./seed.js";
const production = process.env.NODE_ENV === "production";
if (
  production &&
  (!process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32 ||
    !process.env.DATABASE_URL ||
    process.env.DEMO_SEED === "true")
)
  throw new Error(
    "Production requires DATABASE_URL, JWT_SECRET (32+ characters), and DEMO_SEED=false.",
  );
const db = await createDatabase();
const demo =
  process.env.DEMO_SEED === "true" ||
  (!production &&
    process.env.DEMO_SEED !== "false" &&
    !process.env.DATABASE_URL);
process.env.DEMO_SEED = String(demo);
if (demo) await seedDemo(db);
const app = createApp(db);
const port = Number(process.env.PORT || 5050);
const server = app.listen(port, "0.0.0.0");
try {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.once("listening", resolve);
  });
} catch (error) {
  await db.close();
  throw new Error(
    `HarborX API could not listen on port ${port} (${error.code || "listen failed"}). Check the listening process and backend/.env PORT.`,
  );
}
console.log(
  `HarborX API: http://localhost:${server.address().port} | ${db.kind}${demo ? " | demo accounts enabled" : ""}`,
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(async () => {
      await db.close();
      process.exit(0);
    }),
  );
