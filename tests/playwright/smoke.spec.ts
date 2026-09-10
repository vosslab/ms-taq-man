import { expect, test } from "@playwright/test";

// Selector contract: src/ui/app.tsx exposes the title and named canvas.
test("cabinet boots with a responsive canvas", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Ms Taq Man" })).toBeVisible();
  await expect(page.getByLabel("DNA template maze")).toBeVisible();
  await page.getByRole("button", { name: "Start cycle" }).click();
  await page.getByLabel("DNA template maze").press("ArrowLeft");
  await expect(page.getByLabel("Bases synthesized")).not.toHaveText("0");
  await page.screenshot({ path: "test-results/connected_walls.png", fullPage: true });
  await page.getByLabel("DNA template maze").press("Escape");
  const highScore = await page.getByLabel("High score", { exact: true }).textContent();
  await page.reload();
  await expect(page.getByLabel("High score", { exact: true })).toHaveText(highScore ?? "");
});

test("400px touch controls are reachable and steer the player", async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Start cycle" }).click();
  await page.getByRole("button", { name: "Move left", exact: true }).click();
  await expect(page.getByLabel("Bases synthesized")).not.toHaveText("0");
  await page.getByRole("button", { name: "Pause or resume" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Paused" })).toBeVisible();
  await page.screenshot({ path: "test-results/mobile_controls.png", fullPage: true });
});
