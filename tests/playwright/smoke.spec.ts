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
  await page.getByRole("button", { name: "Turn music on", exact: true }).click();
  await expect(page.getByRole("button", { name: "Turn music off", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("html")).toHaveAttribute("data-audio-detected", "yes");
  await page.reload();
  await expect(page.getByRole("button", { name: "Turn music off", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Start cycle" }).click();
  await expect(page.getByLabel("Bases synthesized")).not.toHaveText("0");
  await page.getByRole("button", { name: "Turn music off", exact: true }).click();
  await expect(page.getByRole("button", { name: "Turn music on", exact: true })).toBeVisible();
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

test("400px layout supports keyboard steering and pause", async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Start cycle" }).click();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByLabel("Bases synthesized")).not.toHaveText("0");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("status").filter({ hasText: "Paused" })).toBeVisible();
  await page.screenshot({ path: "test-results/mobile_controls.png", fullPage: true });
});

test("music and FX controls remain independent after reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Turn FX on", exact: true }).click();
  await expect(page.getByRole("button", { name: "Turn FX off", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Turn music on", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Turn FX off", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Turn music on", exact: true }).click();
  await page.getByRole("button", { name: "Turn FX off", exact: true }).click();
  await expect(page.getByRole("button", { name: "Turn music off", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Turn FX on", exact: true })).toBeVisible();
});

test("dashboard focus does not disable keyboard movement", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start cycle" }).click();
  const setting = page.getByRole("button", { name: "Turn FX on", exact: true });
  await setting.click();
  await expect(page.getByRole("button", { name: "Turn FX off", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByLabel("Bases synthesized")).not.toHaveText("0");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Resume game" })).toBeVisible();
});

test("scanline strength saves endpoints and keyboard adjustment does not steer", async ({
  page,
}) => {
  await page.goto("/");
  const strength = page.getByRole("slider", { name: "Scanline strength" });
  await strength.focus();
  await page.keyboard.press("Home");
  await expect(strength).toHaveValue("0");
  await expect(page.locator(".maze-screen")).not.toHaveClass(/scanlines/);
  await page.reload();
  await expect(strength).toHaveValue("0");
  await strength.focus();
  await page.keyboard.press("End");
  await expect(strength).toHaveValue("5");
  await expect(page.locator(".maze-screen")).toHaveClass(/scanlines/);
  await page.reload();
  await expect(strength).toHaveValue("5");
  await expect(page.getByLabel("Bases synthesized")).toHaveText("0");
});

test("difficulty updates the coverage target and persists after reload", async ({ page }) => {
  await page.goto("/");
  const target = page.getByRole("progressbar", { name: "Template synthesized", exact: true });
  const difficulty = page.getByRole("slider", { name: "Difficulty", exact: true });
  await expect(target).toHaveAttribute("max", "60");
  await difficulty.focus();
  await page.keyboard.press("End");
  await expect(target).toHaveAttribute("max", "90");
  await expect(
    page.getByText("Clear the cycle: synthesize 90% OR collect every primer."),
  ).toBeVisible();
  await page.reload();
  await expect(target).toHaveAttribute("max", "90");
  await difficulty.focus();
  await page.keyboard.press("Home");
  await expect(target).toHaveAttribute("max", "50");
});

test("system theme changes the cabinet and reduced motion suppresses scanlines", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/");
  const sidebar = page.locator(".game-sidebar");
  await expect(sidebar).toHaveCSS("background-color", "rgb(255, 255, 255)");
  const screen = page.locator(".maze-screen");
  await expect(screen).toHaveClass(/scanlines/);
  expect(await screen.evaluate((el) => getComputedStyle(el, "::after").display)).toBe("none");
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "no-preference" });
  await expect(sidebar).toHaveCSS("background-color", "rgb(16, 32, 49)");
  expect(await screen.evaluate((el) => getComputedStyle(el, "::after").display)).not.toBe("none");
});
