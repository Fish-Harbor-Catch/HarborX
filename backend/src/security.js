import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function checkPassword(password, encoded) {
  try {
    const [salt, hash] = encoded.split(":");
    const expected = Buffer.from(hash, "hex");
    const actual = scryptSync(password, salt, 64);
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  } catch {
    return false;
  }
}
export const publicUser = (row) => {
  const { password_hash, ...safe } = row;
  return safe;
};
