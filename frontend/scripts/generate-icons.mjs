import sharp from "sharp";
import { mkdir } from "node:fs/promises";
const source = new URL("../public/favicon.svg", import.meta.url);
const directory = new URL("../public/icons/", import.meta.url);
await mkdir(directory, { recursive: true });
for (const [name, size] of [["pwa-192", 192], ["pwa-512", 512], ["apple-touch-icon", 180]]) {
  await sharp(source.pathname).resize(size, size).png().toFile(new URL(`${name}.png`, directory).pathname);
}
const inset = await sharp(source.pathname).resize(352, 352).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#0d3558" } })
  .composite([{ input: inset, gravity: "centre" }]).png()
  .toFile(new URL("maskable-512.png", directory).pathname);
console.log("Generated HarborX icons from the existing anchor branding.");
