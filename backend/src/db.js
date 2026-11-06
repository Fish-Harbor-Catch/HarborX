import "dotenv/config";
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { PGlite } from "@electric-sql/pglite";
export async function createDatabase({
  url = process.env.DATABASE_URL,
  memory = false,
} = {}) {
  let db;
  if (url) {
    const pool = new pg.Pool({ connectionString: url, max: 10 });
    db = {
      kind: "postgresql",
      query: (sql, params = []) => pool.query(sql, params),
      transaction: async (fn) => {
        const c = await pool.connect();
        try {
          await c.query("BEGIN");
          const result = await fn(c);
          await c.query("COMMIT");
          return result;
        } catch (e) {
          await c.query("ROLLBACK");
          throw e;
        } finally {
          c.release();
        }
      },
      close: () => pool.end(),
    };
  } else {
    const path = fileURLToPath(new URL("../data/postgres", import.meta.url));
    if (!memory) mkdirSync(path, { recursive: true });
    const pglite = new PGlite(memory ? undefined : path);
    await pglite.waitReady;
    // A single embedded connection requires a queue around all queries and transactions.
    let tail = Promise.resolve();
    const serial = (fn) => {
      const next = tail.then(fn);
      tail = next.catch(() => {});
      return next;
    };
    db = {
      kind: "embedded-postgresql",
      query: (sql, params = []) => serial(() => pglite.query(sql, params)),
      transaction: (fn) => serial(() => pglite.transaction((c) => fn(c))),
      close: () => pglite.close(),
    };
  }
  const schema = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
  for (const statement of schema
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean))
    await db.query(statement);
  return db;
}
