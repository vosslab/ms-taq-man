import fs from "node:fs/promises";
import { createHash } from "node:crypto";

let html = await fs.readFile("dist/index.html", "utf8");
for (const asset of ["main.js", "style.css"]) {
  const bytes = await fs.readFile(`dist/${asset}`);
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
  html = html.replaceAll(`"${asset}"`, `"${asset}?v=${hash}"`);
}
await fs.writeFile("dist/index.html", html);
