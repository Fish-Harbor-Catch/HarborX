import fs from "node:fs";
import { fileURLToPath } from "node:url";

const targetPath = fileURLToPath(new URL("../frontend/src/i18n.jsx", import.meta.url));

if (!fs.existsSync(targetPath)) {
  console.error(`Could not locate i18n file at: ${targetPath}`);
  process.exit(1);
}

const content = fs.readFileSync(targetPath, "utf8");
const match = content.match(/export const TRANSLATIONS = ({[\s\S]*?^};\n)/m);
if (!match) {
  console.error("Could not find TRANSLATIONS in i18n.jsx");
  process.exit(1);
}

// Evaluate object literal safely
const fn = new Function("return " + match[1]);
const TRANSLATIONS = fn();

const en = Object.keys(TRANSLATIONS.en || {});
const ta = Object.keys(TRANSLATIONS.ta || {});
const si = Object.keys(TRANSLATIONS.si || {});

console.log("Translation key counts:");
console.log(`- English (EN): ${en.length} keys`);
console.log(`- Tamil (TA):   ${ta.length} keys`);
console.log(`- Sinhala (SI): ${si.length} keys`);

const missingInTa = en.filter(k => !(k in TRANSLATIONS.ta));
const missingInSi = en.filter(k => !(k in TRANSLATIONS.si));

let failed = false;

if (missingInTa.length > 0) {
  console.error(`\nMissing in Tamil (TA) [${missingInTa.length} keys]:`);
  console.error(missingInTa);
  failed = true;
}

if (missingInSi.length > 0) {
  console.error(`\nMissing in Sinhala (SI) [${missingInSi.length} keys]:`);
  console.error(missingInSi);
  failed = true;
}

if (failed) {
  console.error("\nFAILURE: Translation key parity mismatch detected!");
  process.exit(1);
}

console.log("\nSUCCESS: 100% Translation Key Parity across all 3 languages!");
process.exit(0);
