// Run with the URL printed by ./run_web_server.sh.
// Captures the 16:10 dark-mode desktop source used in the README.
// Trim gameplay.png with `mogrify -trim` before embedding it.
import { chromium } from "playwright";
import fs from "node:fs/promises";
const url = process.argv[2];
if (!url) throw new Error("Usage: node tools/capture_gameplay.mjs http://localhost:PORT/");

async function startAndPause(page) {
  await page.goto(url);
  await page.getByRole("button", { name: "Start cycle", exact: true }).click();
  await page.keyboard.press("ArrowLeft");
  await page.getByLabel("Bases synthesized").filter({ hasText: /[1-9]/ }).waitFor();
  await page.waitForTimeout(700);
  await page.keyboard.press("Escape");
}

const browser = await chromium.launch({ headless: true });
try {
  await fs.mkdir("docs/screenshots", { recursive: true });
  const desktop = await browser.newPage({
    viewport: { width: 1920, height: 1200 },
    colorScheme: "dark",
    reducedMotion: "no-preference",
  });
  await startAndPause(desktop);
  await desktop.screenshot({ path: "docs/screenshots/gameplay.png" });
} finally {
  await browser.close();
}
