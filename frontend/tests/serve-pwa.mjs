// Browser tests use the real API and built shell with disposable PostgreSQL data.
import { createDatabase } from "../../backend/src/db.js";
import { createApp } from "../../backend/src/app.js";
import { seedDemo } from "../../backend/src/seed.js";
import express from "express";
import { readFile } from "node:fs/promises";
process.env.NODE_ENV = "development";
process.env.DEMO_SEED = "true";
process.env.CLIENT_ORIGIN = "http://127.0.0.1:4173";
const db = await createDatabase({ url: null, memory: true });
await seedDemo(db);
const app = express();
let workerVersion = 0;
let loseCatchConfirmation = false;
app.post("/__test/update-worker", (req, res) => res.json({ version: ++workerVersion }));
app.post("/__test/lose-catch-confirmation", (req, res) => {
  loseCatchConfirmation = true;
  res.json({ ready: true });
});
app.use((req, res, next) => {
  if (loseCatchConfirmation && req.method === "POST" && req.path === "/api/lots") {
    loseCatchConfirmation = false;
    const send = res.json;
    res.json = function (body) {
      // Fail only after the real handler has committed and confirmed the lot.
      // A server-side fixture also works with WebKit service-worker requests,
      // which browser page.route() cannot consistently intercept.
      if (res.statusCode < 400 && body.lot) {
        res.status(503);
        return send.call(this, { error: "Test-only lost confirmation after commit. Retry manually." });
      }
      return send.call(this, body);
    };
  }
  next();
});
app.get("/sw.js", async (req, res) => {
  const worker = await readFile(new URL("../dist/sw.js", import.meta.url), "utf8");
  res.set("Cache-Control", "no-cache").type("application/javascript")
    .send(`${worker}\n// Test deployment revision: ${workerVersion}\n`);
});
app.use(createApp(db, { testing: true }));
const server = app.listen(4173, "127.0.0.1");
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => {
  server.close(async () => { await db.close(); process.exit(0); });
});
