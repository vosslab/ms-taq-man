import { test, expect } from "@playwright/test";
import { sprites } from "../../src/art/sprites_generated";

test("all editable sprites render at 16px and 256px", async ({ page }) => {
  await page.setViewportSize({ width: 1120, height: 900 });
  await page.setContent(
    "<style>body{margin:16px;background:#09111f;color:#ecf8ff;font:14px system-ui}main{display:grid;grid-template-columns:repeat(4,256px);gap:16px}figure{margin:0}figcaption{margin-bottom:8px}img{display:block}</style><main></main>",
  );
  await page.evaluate((entries) => {
    const main = document.querySelector("main");
    for (const [name, markup] of entries) {
      const figure = document.createElement("figure");
      const caption = document.createElement("figcaption");
      caption.textContent = name;
      figure.append(caption);
      for (const size of [16, 256]) {
        const img = document.createElement("img");
        img.src = `data:image/svg+xml,${encodeURIComponent(markup)}`;
        img.alt = `${name} at ${size}px`;
        img.width = size;
        img.height = size;
        figure.append(img);
      }
      main?.append(figure);
    }
  }, Object.entries(sprites));
  await expect(page.getByRole("img")).toHaveCount(Object.keys(sprites).length * 2);
  await page.getByRole("img").evaluateAll(async (images) => {
    await Promise.all(
      images.map((image) => {
        if (!(image instanceof HTMLImageElement)) throw new Error("Expected image");
        return image.decode();
      }),
    );
  });
  await page.screenshot({ path: "test-results/sprite_atlas.png", fullPage: true });
});
