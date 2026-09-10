// Run with the URL printed by ./run_web_server.sh.
import { chromium } from "playwright";
import fs from "node:fs/promises";
const url = process.argv[2];
if (!url) throw new Error("Usage: node tools/capture_gameplay.mjs http://localhost:PORT/");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1200 } });
  await page.goto(url);
  await page.getByRole("button", { name: "Start cycle", exact: true }).click();
  await page.keyboard.press("ArrowLeft");
  await page.getByLabel("Bases synthesized").filter({ hasText: /[1-9]/ }).waitFor();
  await page.waitForTimeout(700);
  await page.keyboard.press("Escape");
  await fs.mkdir("docs/screenshots", { recursive: true });
  await page.screenshot({ path: "docs/screenshots/gameplay.png" });
} finally {
  await browser.close();
}
