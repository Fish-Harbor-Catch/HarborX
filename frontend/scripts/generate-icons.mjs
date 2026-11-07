import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const sourcePath = fileURLToPath(new URL("../public/favicon.svg", import.meta.url));
const directoryUrl = new URL("../public/icons/", import.meta.url);
const directoryPath = fileURLToPath(directoryUrl);
await mkdir(directoryPath, { recursive: true });
for (const [name, size] of [["pwa-192", 192], ["pwa-512", 512], ["apple-touch-icon", 180]]) {
  await sharp(sourcePath).resize(size, size).png().toFile(fileURLToPath(new URL(`${name}.png`, directoryUrl)));
}
const inset = await sharp(sourcePath).resize(352, 352).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#0d3558" } })
  .composite([{ input: inset, gravity: "centre" }]).png()
  .toFile(fileURLToPath(new URL("maskable-512.png", directoryUrl)));
console.log("Generated HarborX icons from the existing anchor branding.");
