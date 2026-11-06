import { createDatabase } from "../src/db.js";
import { seedDemo } from "../src/seed.js";
if (process.env.NODE_ENV === "production")
  throw new Error("Demo seed is disabled in production.");
const db = await createDatabase();
await seedDemo(db);
await db.close();
console.log(
  "Demo records ready. See README.md for local demonstration accounts.",
);
