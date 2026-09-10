import { expect, test } from "@playwright/test";

// Selector contract: src/ui/app.tsx exposes the title and named canvas.
test("music is opt-in and remembers the setting after reload", async ({ page }) => {
  await page.addInitScript(() => {
    // Preserve the native method; the probe calls it with the original context receiver.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const createGain = AudioContext.prototype.createGain;
    AudioContext.prototype.createGain = function (): GainNode {
      const gain = createGain.call(this);
      if (!document.documentElement.dataset.audioProbe) {
        document.documentElement.dataset.audioProbe = "yes";
        const analyser = this.createAnalyser();
        gain.connect(analyser);
        const samples = new Float32Array(analyser.fftSize);
        function measure(): void {
          analyser.getFloatTimeDomainData(samples);
          const peak = Math.max(...samples.map(Math.abs));
          if (peak > 0.005) document.documentElement.dataset.audioDetected = "yes";
          else requestAnimationFrame(measure);
        }
        requestAnimationFrame(measure);
      }
      return gain;
    };
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Music off", exact: true }).click();
  await expect(page.getByRole("button", { name: "Music on", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("html")).toHaveAttribute("data-audio-detected", "yes");
  await page.reload();
  await expect(page.getByRole("button", { name: "Music on", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Start cycle" }).click();
  await expect(page.getByLabel("Bases synthesized")).not.toHaveText("0");
  await page.getByRole("button", { name: "Music on", exact: true }).click();
  await expect(page.getByRole("button", { name: "Music off", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
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
