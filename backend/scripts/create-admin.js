import { randomUUID } from "node:crypto";
import { createDatabase } from "../src/db.js";
import { hashPassword } from "../src/security.js";
import { z } from "zod";
const d = z
  .object({
    name: z.string().min(2),
    email: z.email().transform((s) => s.toLowerCase()),
    password: z.string().min(12).max(128),
  })
  .safeParse({
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
if (!d.success) {
  console.error(
    "Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD (12+ characters) in backend/.env or your shell.",
  );
  process.exit(1);
}
const db = await createDatabase();
try {
  const u = d.data;
  await db.query(
    "INSERT INTO users(id,name,email,password_hash,role,verified) VALUES($1,$2,$3,$4,'admin',TRUE)",
    [randomUUID(), u.name, u.email, hashPassword(u.password)],
  );
  console.log(`Admin created: ${u.email}`);
} catch (e) {
  console.error(e.code === "23505" ? "This email already exists." : e.message);
  process.exitCode = 1;
} finally {
  await db.close();
}
