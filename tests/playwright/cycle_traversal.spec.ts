import { test, expect } from "@playwright/test";

// Recorded arrow-key route through cycle one; no game-state injection.
const route: readonly { time: number; direction: string }[] = [
  { time: 1000, direction: "left" },
  { time: 1017, direction: "up" },
  { time: 1550, direction: "down" },
  { time: 1733, direction: "right" },
  { time: 2100, direction: "up" },
  { time: 2650, direction: "down" },
  { time: 2833, direction: "right" },
  { time: 3383, direction: "down" },
  { time: 3750, direction: "left" },
  { time: 4300, direction: "down" },
  { time: 4667, direction: "right" },
  { time: 6117, direction: "up" },
  { time: 6483, direction: "left" },
  { time: 6667, direction: "up" },
  { time: 7017, direction: "right" },
  { time: 7200, direction: "up" },
  { time: 7567, direction: "left" },
  { time: 8117, direction: "up" },
  { time: 9933, direction: "left" },
  { time: 10300, direction: "down" },
  { time: 10667, direction: "left" },
  { time: 11200, direction: "down" },
  { time: 11567, direction: "left" },
  { time: 12483, direction: "down" },
  { time: 13200, direction: "right" },
  { time: 14300, direction: "up" },
  { time: 14667, direction: "right" },
  { time: 17017, direction: "up" },
  { time: 18483, direction: "left" },
  { time: 19017, direction: "down" },
  { time: 19750, direction: "right" },
  { time: 20300, direction: "up" },
  { time: 20667, direction: "right" },
  { time: 21567, direction: "up" },
  { time: 22117, direction: "down" },
  { time: 22300, direction: "right" },
  { time: 22667, direction: "up" },
  { time: 23033, direction: "right" },
  { time: 24483, direction: "down" },
  { time: 24850, direction: "left" },
  { time: 25400, direction: "down" },
  { time: 26483, direction: "right" },
  { time: 28133, direction: "down" },
  { time: 28850, direction: "left" },
  { time: 29400, direction: "down" },
  { time: 29767, direction: "right" },
  { time: 29950, direction: "down" },
  { time: 30300, direction: "left" },
];

test("arrow-key traversal synthesizes enough DNA to celebrate a cycle", async ({ page }) => {
  test.setTimeout(60000);
  await page.clock.install({ time: new Date("2026-09-09T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-09-09T12:00:01Z"));
  await page.goto("/");
  await page.getByRole("button", { name: "Start cycle", exact: true }).click();
  let elapsed = 0;
  for (const event of route) {
    await page.clock.runFor(event.time - elapsed);
    await page.keyboard.press(
      "Arrow" + event.direction[0]?.toUpperCase() + event.direction.slice(1),
    );
    elapsed = event.time;
  }
  await page.clock.runFor(30483 + 500 - elapsed);
  await expect(
    page.getByRole("status").filter({ hasText: "Cycle 1 - Cycle complete" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Template amplified!" })).toBeVisible();
});
