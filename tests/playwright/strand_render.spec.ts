import { expect, test, type Page } from "@playwright/test";
import { build } from "esbuild";
import { REPO_ROOT } from "./repo_root.mjs";

type Edge = { a: { x: number; y: number }; b: { x: number; y: number }; tunnel: boolean };
type Maze = { width: number; height: number; edges: Map<string, Edge> };
type Coverage = {
  covered: Set<string>;
  clampBuilt: Set<string>;
  revision: number;
  bases: number;
  seeds: Map<string, number>;
};
type StrandLayer = {
  paint: (
    context: CanvasRenderingContext2D,
    maze: Maze,
    coverage: Coverage,
    time: number,
    reducedMotion: boolean,
    chewQueue?: ReadonlyMap<string, number>,
  ) => void;
};
type StrandHarness = {
  createCoverage: () => Coverage;
  createStrandLayer: () => StrandLayer;
  degradeEdge: (coverage: Coverage, id: string) => boolean;
  markEdge: (coverage: Coverage, id: string, clamp?: boolean) => boolean;
  reinforceEdge: (coverage: Coverage, id: string) => boolean;
  mazeForCycle: (cycle: number) => Maze;
  paintMaze: (context: CanvasRenderingContext2D, maze: Maze, size: number, color: string) => void;
};

declare global {
  interface Window {
    strandHarness: StrandHarness;
  }
}

const BUNDLE_ENTRY = [
  'export { createStrandLayer } from "./src/render/strand_layer";',
  'export { createCoverage, markEdge, reinforceEdge, degradeEdge } from "./src/game/coverage";',
  'export { mazeForCycle } from "./src/game/maze_layouts";',
  'export { paintMaze } from "./src/render/maze_painter";',
].join("\n");

let strandBundle = "";

test.beforeAll(async () => {
  const result = await build({
    stdin: { contents: BUNDLE_ENTRY, resolveDir: REPO_ROOT },
    bundle: true,
    format: "iife",
    globalName: "strandHarness",
    write: false,
  });
  const output = result.outputFiles[0];
  if (!output) throw new Error("esbuild did not create the strand harness");
  strandBundle = output.text;
});

async function loadStrandHarness(page: Page): Promise<void> {
  await page.goto("/");
  await page.addScriptTag({ content: strandBundle });
  await expect.poll(() => page.evaluate(() => typeof window.strandHarness)).toBe("object");
}

test("strand layer limits tunnel repairs to the two tunnel mouths", async ({ page }) => {
  await loadStrandHarness(page);
  const result = await page.evaluate(() => {
    const maze = window.strandHarness.mazeForCycle(1);
    const coverage = window.strandHarness.createCoverage();
    const ids = [...maze.edges.keys()];
    for (const id of ids) window.strandHarness.markEdge(coverage, id);
    const tunnelEntry = [...maze.edges.entries()].find(([, edge]) => edge.tunnel);
    if (!tunnelEntry) throw new Error("Cycle 1 has no tunnel edge");
    const [tunnelId, tunnel] = tunnelEntry;
    const layer = window.strandHarness.createStrandLayer();
    const canvas = document.createElement("canvas");
    canvas.width = maze.width * 24;
    canvas.height = maze.height * 24;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context unavailable");
    layer.paint(context, maze, coverage, 0, false);
    const before = context.getImageData(0, 0, canvas.width, canvas.height).data;
    window.strandHarness.degradeEdge(coverage, tunnelId);
    context.clearRect(0, 0, canvas.width, canvas.height);
    layer.paint(context, maze, coverage, 0.61, false);
    const after = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const tileSize = canvas.width / maze.width;
    const left = Math.min((tunnel.a.x + 0.5) * tileSize, (tunnel.b.x + 0.5) * tileSize);
    const right = Math.max((tunnel.a.x + 0.5) * tileSize, (tunnel.b.x + 0.5) * tileSize);
    const row = (tunnel.a.y + 0.5) * tileSize;
    // A tunnel mouth is one corridor tile wide.  This public maze dimension
    // deliberately avoids encoding the renderer's private repair margin.
    const mouthAllowance = Math.ceil(tileSize / 2);
    let changedPixels = 0;
    let leftMouthPixels = 0;
    let rightMouthPixels = 0;
    let outsideMouths = 0;
    let centralSpanChanged = 0;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const offset = (y * canvas.width + x) * 4;
        if (
          before[offset] === after[offset] &&
          before[offset + 1] === after[offset + 1] &&
          before[offset + 2] === after[offset + 2] &&
          before[offset + 3] === after[offset + 3]
        )
          continue;
        changedPixels++;
        const inLeftMouth =
          x <= left + mouthAllowance && y >= row - mouthAllowance && y <= row + mouthAllowance;
        const inRightMouth =
          x >= right - mouthAllowance && y >= row - mouthAllowance && y <= row + mouthAllowance;
        if (inLeftMouth) leftMouthPixels++;
        if (inRightMouth) rightMouthPixels++;
        if (!inLeftMouth && !inRightMouth) outsideMouths++;
        if (
          x >= left + tileSize &&
          x <= right - tileSize &&
          y >= row - mouthAllowance &&
          y <= row + mouthAllowance
        )
          centralSpanChanged++;
      }
    }
    const middleOffset = (Math.round(row) * canvas.width + Math.floor(canvas.width / 2)) * 4;
    const unrelatedOffset = (48 * canvas.width + Math.floor(canvas.width / 2)) * 4;
    const same = (offset: number): boolean =>
      before[offset] === after[offset] &&
      before[offset + 1] === after[offset + 1] &&
      before[offset + 2] === after[offset + 2] &&
      before[offset + 3] === after[offset + 3];
    return {
      changedPixels,
      leftMouthPixels,
      rightMouthPixels,
      outsideMouths,
      centralSpanChanged,
      middleUnchanged: same(middleOffset),
      unrelatedUnchanged: same(unrelatedOffset),
    };
  });
  expect(result.changedPixels).toBeGreaterThan(0);
  expect(result.leftMouthPixels).toBeGreaterThan(0);
  expect(result.rightMouthPixels).toBeGreaterThan(0);
  expect(result.outsideMouths).toBe(0);
  expect(result.centralSpanChanged).toBe(0);
  expect(result.middleUnchanged).toBe(true);
  expect(result.unrelatedUnchanged).toBe(true);
});

test("chewed strands fade, disappear, and restart with a fresh seeded ribbon", async ({ page }) => {
  await loadStrandHarness(page);
  const result = await page.evaluate(() => {
    const maze = window.strandHarness.mazeForCycle(1);
    const coverage = window.strandHarness.createCoverage();
    const entry = [...maze.edges.entries()].find(([, edge]) => !edge.tunnel);
    if (!entry) throw new Error("Cycle 1 has no ordinary edge");
    const [id, edge] = entry;
    window.strandHarness.markEdge(coverage, id);
    const firstSeed = coverage.seeds.get(id);
    if (firstSeed === undefined) throw new Error("Coverage did not seed the original ribbon");
    const layer = window.strandHarness.createStrandLayer();
    const canvas = document.createElement("canvas");
    canvas.width = maze.width * 24;
    canvas.height = maze.height * 24;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context unavailable");
    const bounds = {
      left: Math.min((edge.a.x + 0.5) * 24, (edge.b.x + 0.5) * 24) - 8,
      top: Math.min((edge.a.y + 0.5) * 24, (edge.b.y + 0.5) * 24) - 8,
      width: Math.abs(edge.a.x - edge.b.x) * 24 + 17,
      height: Math.abs(edge.a.y - edge.b.y) * 24 + 17,
    };
    const signature = (): { alpha: number; checksum: number } => {
      const pixels = context.getImageData(
        bounds.left,
        bounds.top,
        bounds.width,
        bounds.height,
      ).data;
      let alpha = 0;
      let checksum = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        const value = pixels[index + 3] ?? 0;
        alpha += value;
        checksum = (checksum + value * (index + 1)) >>> 0;
      }
      return { alpha, checksum };
    };
    layer.paint(context, maze, coverage, 0, false);
    const original = signature();
    window.strandHarness.degradeEdge(coverage, id);
    context.clearRect(0, 0, canvas.width, canvas.height);
    // The degradation frame records the fade start. The following frame must
    // show the visibly reduced 0.6-second fade rather than a new full-opacity start.
    layer.paint(context, maze, coverage, 0, false);
    context.clearRect(0, 0, canvas.width, canvas.height);
    layer.paint(context, maze, coverage, 0.3, false);
    const fading = signature();
    context.clearRect(0, 0, canvas.width, canvas.height);
    layer.paint(context, maze, coverage, 0.61, false);
    const gone = signature();
    window.strandHarness.markEdge(coverage, id);
    const secondSeed = coverage.seeds.get(id);
    if (secondSeed === undefined) throw new Error("Coverage did not seed the repaired ribbon");
    context.clearRect(0, 0, canvas.width, canvas.height);
    layer.paint(context, maze, coverage, 0.62, false);
    const rebuilt = signature();
    return { original, fading, gone, rebuilt, firstSeed, secondSeed };
  });
  expect(result.original.alpha).toBeGreaterThan(0);
  expect(result.fading.alpha).toBeGreaterThan(0);
  expect(result.fading.alpha).toBeLessThan(result.original.alpha);
  expect(result.gone.alpha).toBe(0);
  expect(result.rebuilt.alpha).toBeGreaterThan(0);
  expect(result.secondSeed).not.toBe(result.firstSeed);
  expect(result.rebuilt.checksum).not.toBe(result.original.checksum);
});

test("queued chew-back overlays DNA yellow before its deadline", async ({ page }) => {
  await loadStrandHarness(page);
  const result = await page.evaluate(() => {
    const maze = window.strandHarness.mazeForCycle(1);
    const coverage = window.strandHarness.createCoverage();
    const entry = [...maze.edges.entries()].find(([, edge]) => !edge.tunnel);
    if (!entry) throw new Error("Cycle 1 has no ordinary edge");
    const [id] = entry;
    window.strandHarness.markEdge(coverage, id);
    const layer = window.strandHarness.createStrandLayer();
    const canvas = document.createElement("canvas");
    canvas.width = maze.width * 24;
    canvas.height = maze.height * 24;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context unavailable");
    const ink = context;
    function yellowPixels(): number {
      const pixels = ink.getImageData(0, 0, canvas.width, canvas.height).data;
      let count = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        if (
          pixels[index] === 255 &&
          pixels[index + 1] === 209 &&
          pixels[index + 2] === 102 &&
          pixels[index + 3] === 255
        )
          count++;
      }
      return count;
    }
    layer.paint(ink, maze, coverage, 0, false, new Map([[id, 1]]));
    const warning = yellowPixels();
    ink.clearRect(0, 0, canvas.width, canvas.height);
    layer.paint(ink, maze, coverage, 1, false, new Map([[id, 1]]));
    const atDeadline = yellowPixels();
    return { warning, atDeadline };
  });
  expect(result.warning).toBeGreaterThan(0);
  expect(result.atDeadline).toBe(0);
});

test("clamp reinforcement repaints covered DNA from green to violet", async ({ page }) => {
  await loadStrandHarness(page);
  const result = await page.evaluate(() => {
    const maze = window.strandHarness.mazeForCycle(1);
    const coverage = window.strandHarness.createCoverage();
    const entry = [...maze.edges.entries()].find(([, edge]) => !edge.tunnel);
    if (!entry) throw new Error("Cycle 1 has no ordinary edge");
    const [id] = entry;
    window.strandHarness.markEdge(coverage, id);
    const layer = window.strandHarness.createStrandLayer();
    const canvas = document.createElement("canvas");
    canvas.width = maze.width * 24;
    canvas.height = maze.height * 24;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context unavailable");
    const ink = context;
    function colorPixels(red: number, green: number, blue: number): number {
      const pixels = ink.getImageData(0, 0, canvas.width, canvas.height).data;
      let count = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        if (
          pixels[index] === red &&
          pixels[index + 1] === green &&
          pixels[index + 2] === blue &&
          pixels[index + 3] === 255
        )
          count++;
      }
      return count;
    }
    layer.paint(ink, maze, coverage, 0, false);
    const originalGreen = colorPixels(101, 239, 187);
    window.strandHarness.reinforceEdge(coverage, id);
    ink.clearRect(0, 0, canvas.width, canvas.height);
    layer.paint(ink, maze, coverage, 0.1, false);
    const reinforcedViolet = colorPixels(212, 160, 255);
    return { originalGreen, reinforcedViolet };
  });
  expect(result.originalGreen).toBeGreaterThan(0);
  expect(result.reinforcedViolet).toBeGreaterThan(0);
});

test("all maze cycles paint non-empty double-stranded nests at DPR 1 and DPR 2", async ({
  page,
}, testInfo) => {
  await loadStrandHarness(page);
  const results = await page.evaluate(() => {
    const measurements: {
      cycle: number;
      dpr: number;
      nonTransparentPixels: number;
      primaryPixels: number;
      secondaryPixels: number;
      clampPrimaryPixels: number;
      clampSecondaryPixels: number;
      cachedMs: number;
      repairMs: number;
    }[] = [];
    const gallery = document.createElement("main");
    gallery.dataset.testId = "strand-nest-gallery";
    gallery.style.cssText =
      "display:grid;width:max-content;grid-template-columns:repeat(2,252px);gap:12px;padding:12px;background:#09111f";
    document.body.replaceChildren(gallery);
    for (const dpr of [1, 2]) {
      for (let cycle = 1; cycle <= 4; cycle++) {
        const maze = window.strandHarness.mazeForCycle(cycle);
        const coverage = window.strandHarness.createCoverage();
        const ids = [...maze.edges.keys()];
        for (const [index, id] of ids.entries())
          window.strandHarness.markEdge(coverage, id, index % 7 === 0);
        const layer = window.strandHarness.createStrandLayer();
        const canvas = document.createElement("canvas");
        canvas.width = maze.width * 24 * dpr;
        canvas.height = maze.height * 24 * dpr;
        canvas.style.cssText = "width:252px;height:252px;background:#09111f";
        // The DPR 2 render is measured below but stays detached: the gallery is
        // a readable one-panel-per-cycle visual artifact, not a density test.
        if (dpr === 1) {
          const panel = document.createElement("figure");
          panel.style.cssText =
            "margin:0;display:grid;gap:4px;color:#ecf8ff;font:600 14px system-ui";
          const caption = document.createElement("figcaption");
          caption.textContent = `Cycle ${cycle} · Taq green/blue · clamp violet/pink`;
          panel.append(caption, canvas);
          gallery.append(panel);
        }
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas context unavailable");
        context.scale(dpr, dpr);
        layer.paint(context, maze, coverage, 0, false);
        const alpha = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let nonTransparentPixels = 0;
        let primaryPixels = 0;
        let secondaryPixels = 0;
        let clampPrimaryPixels = 0;
        let clampSecondaryPixels = 0;
        for (let index = 3; index < alpha.length; index += 4) {
          if ((alpha[index] ?? 0) > 0) nonTransparentPixels++;
          if (alpha[index - 3] === 101 && alpha[index - 2] === 239 && alpha[index - 1] === 187)
            primaryPixels++;
          if (alpha[index - 3] === 132 && alpha[index - 2] === 191 && alpha[index - 1] === 255)
            secondaryPixels++;
          if (alpha[index - 3] === 212 && alpha[index - 2] === 160 && alpha[index - 1] === 255)
            clampPrimaryPixels++;
          if (alpha[index - 3] === 255 && alpha[index - 2] === 156 && alpha[index - 1] === 228)
            clampSecondaryPixels++;
        }
        const cachedStarted = performance.now();
        for (let iteration = 0; iteration < 20; iteration++) {
          context.clearRect(0, 0, maze.width * 24, maze.height * 24);
          layer.paint(context, maze, coverage, iteration / 60, false);
          context.getImageData(0, 0, canvas.width, canvas.height);
        }
        const cachedMs = (performance.now() - cachedStarted) / 20;
        const repairStarted = performance.now();
        const repairId = ids[0];
        if (!repairId) throw new Error("Maze has no edges");
        for (let iteration = 0; iteration < 10; iteration++) {
          window.strandHarness.degradeEdge(coverage, repairId);
          context.clearRect(0, 0, maze.width * 24, maze.height * 24);
          layer.paint(context, maze, coverage, 5 + iteration, false);
          window.strandHarness.markEdge(coverage, repairId);
          context.clearRect(0, 0, maze.width * 24, maze.height * 24);
          layer.paint(context, maze, coverage, 5 + iteration + 0.1, false);
          context.getImageData(0, 0, canvas.width, canvas.height);
        }
        const repairMs = (performance.now() - repairStarted) / 20;
        measurements.push({
          cycle,
          dpr,
          nonTransparentPixels,
          primaryPixels,
          secondaryPixels,
          clampPrimaryPixels,
          clampSecondaryPixels,
          cachedMs,
          repairMs,
        });
      }
    }
    return measurements;
  });
  for (const result of results) {
    expect(result.nonTransparentPixels).toBeGreaterThan(0);
    expect(result.primaryPixels).toBeGreaterThan(0);
    expect(result.secondaryPixels).toBeGreaterThan(0);
    expect(result.clampPrimaryPixels).toBeGreaterThan(0);
    expect(result.clampSecondaryPixels).toBeGreaterThan(0);
    expect(Number.isFinite(result.cachedMs)).toBe(true);
    expect(Number.isFinite(result.repairMs)).toBe(true);
  }
  const summary = results
    .map(
      (result) =>
        `cycle ${result.cycle} DPR ${result.dpr}: cached ${result.cachedMs.toFixed(3)} ms, repair ${result.repairMs.toFixed(3)} ms`,
    )
    .join("; ");
  testInfo.annotations.push({
    type: "performance",
    description: `${summary}; compare with 16.7 ms`,
  });
  console.info(`strand render performance: ${summary}; compare with 16.7 ms`);
  await page.locator('[data-test-id="strand-nest-gallery"]').screenshot({
    path: testInfo.outputPath("full_nests.png"),
  });
});
