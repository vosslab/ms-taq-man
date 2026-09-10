// Run with the URL printed by ./run_web_server.sh.
// Captures the desktop 16:10 cabinet and the stacked mobile dashboard.
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
  const desktop = await browser.newPage({ viewport: { width: 1920, height: 1200 } });
  await startAndPause(desktop);
  await desktop.screenshot({ path: "docs/screenshots/gameplay.png" });

  const mobile = await browser.newPage({ viewport: { width: 400, height: 900 } });
  await startAndPause(mobile);
  await mobile.screenshot({ path: "docs/screenshots/gameplay_mobile.png", fullPage: true });
} finally {
  await browser.close();
}
