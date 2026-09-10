import { expect, test, type Page } from "@playwright/test";
import { build } from "esbuild";
import { REPO_ROOT } from "./repo_root.mjs";

const BOARD_PIXELS = 21 * 24;
const SAMPLE_COUNT = 12;
const FRAME_BUDGET_MS = 16.7;

type ScenarioResult = {
  cycle: number;
  dpr: number;
  cssWidth: number;
  cssHeight: number;
  width: number;
  height: number;
  alphaPixels: number;
  loadedSprites: string[];
  paintedSprites: string[];
  degradeSamples: number[];
  reextendSamples: number[];
  degradeTiming: Timing;
  reextendTiming: Timing;
};

type Timing = {
  meanMs: number;
  p95Ms: number;
  maxMs: number;
};

type FullFrameHarness = {
  createGame: () => unknown;
  createRenderer: (
    canvas: HTMLCanvasElement,
    game: unknown,
  ) => {
    draw: () => void;
    ready: () => Promise<void>;
    spriteStatus: () => { loaded: string[]; requested: string[] };
    dispose: () => void;
  };
  createBonus: (maze: unknown, cycle: number) => unknown;
  degradeEdge: (coverage: unknown, edge: string) => boolean;
  markEdge: (coverage: unknown, edge: string, clamp?: boolean) => boolean;
  nextCycle: (game: unknown) => void;
  loadSprites: () => {
    ready: () => Promise<void>;
    status: () => { generation: number; loaded: string[] };
    resize: (ratio: number) => void;
    dispose: () => void;
  };
};

declare global {
  interface Window {
    fullFrameHarness: FullFrameHarness;
  }
}

const BUNDLE_ENTRY = [
  'export { createGame, nextCycle } from "./src/game/game_state";',
  'export { createRenderer } from "./src/render/canvas_renderer";',
  'export { createBonus } from "./src/game/bonus";',
  'export { degradeEdge, markEdge } from "./src/game/coverage";',
  'export { loadSprites } from "./src/render/sprite_atlas";',
].join("\n");

let harnessBundle = "";

test.beforeAll(async () => {
  const result = await build({
    stdin: { contents: BUNDLE_ENTRY, resolveDir: REPO_ROOT },
    bundle: true,
    format: "iife",
    globalName: "fullFrameHarness",
    write: false,
  });
  const output = result.outputFiles[0];
  if (!output) throw new Error("esbuild did not create the full-frame renderer harness");
  harnessBundle = output.text;
});

async function loadHarness(page: Page): Promise<void> {
  await page.goto("/");
  await page.addScriptTag({ content: harnessBundle });
  await expect.poll(() => page.evaluate(() => typeof window.fullFrameHarness)).toBe("object");
}

test("sprite readiness follows the latest resize generation and disposal", async ({ page }) => {
  await loadHarness(page);
  const result = await page.evaluate(async () => {
    const atlas = window.fullFrameHarness.loadSprites();
    await atlas.ready();
    const first = atlas.status();
    atlas.resize(2);
    await atlas.ready();
    const second = atlas.status();
    atlas.dispose();
    let disposalRejected = false;
    try {
      await atlas.ready();
    } catch {
      disposalRejected = true;
    }
    return { first, second, disposalRejected };
  });
  expect(result.first.loaded).toContain("taq_man");
  expect(result.second.generation).toBeGreaterThan(result.first.generation);
  expect(result.second.loaded).toEqual(expect.arrayContaining(["taq_man", "exo", "buddy"]));
  expect(result.disposalRejected).toBe(true);
});

test("full renderer stays measurable across complete nests at DPR 1 and DPR 2", async ({
  page,
}) => {
  await loadHarness(page);
  const results = await page.evaluate(
    async ({ boardPixels, sampleCount }) => {
      type MutableGame = {
        cycle: number;
        maze: { edges: Map<string, unknown> };
        coverage: {
          covered: Set<string>;
          clampBuilt: Set<string>;
        };
        phase: string;
        time: number;
        lastProgressTime: number;
        buddy: {
          active: boolean;
          protection: number;
          buildGlow: number;
          lastBuilt: string | undefined;
          distraction: number;
        };
        bonus: unknown;
      };
      const scenarios: ScenarioResult[] = [];
      const gallery = document.createElement("main");
      gallery.style.cssText = `display:grid;grid-template-columns:repeat(2,${boardPixels}px);gap:12px;padding:12px;background:#09111f`;
      document.body.replaceChildren(gallery);

      function summarize(samples: number[]): Timing {
        const sorted = [...samples].sort((left, right) => left - right);
        const total = samples.reduce((sum, value) => sum + value, 0);
        const meanMs = total / samples.length;
        const p95Index = Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1);
        const p95Ms = sorted[p95Index] ?? 0;
        const maxMs = sorted[sorted.length - 1] ?? 0;
        return { meanMs, p95Ms, maxMs };
      }

      for (const dpr of [1, 2]) {
        Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: dpr });
        for (let cycle = 1; cycle <= 4; cycle++) {
          const game = window.fullFrameHarness.createGame() as MutableGame;
          while (game.cycle < cycle) window.fullFrameHarness.nextCycle(game);
          game.phase = "playing";
          game.time = 16;
          game.lastProgressTime = 16;
          const edgeIds = [...game.maze.edges.keys()];
          for (const [index, edge] of edgeIds.entries())
            window.fullFrameHarness.markEdge(game.coverage, edge, index % 6 === 0);
          const representative = edgeIds.find((edge) => !edge.includes("0,")) ?? edgeIds[0];
          if (!representative) throw new Error("Maze did not contain a renderer edge");
          game.buddy.active = true;
          game.buddy.protection = 2;
          game.buddy.buildGlow = 1;
          game.buddy.lastBuilt = representative;
          game.buddy.distraction = 1;
          game.bonus = window.fullFrameHarness.createBonus(game.maze, cycle);

          const canvas = document.createElement("canvas");
          canvas.className = "game-canvas";
          canvas.style.cssText = `width:${boardPixels}px;height:${boardPixels}px`;
          // The production resize observer sizes this backing store from devicePixelRatio.
          // Set it here before construction so each scenario can exercise both resolutions
          // within one browser context without a production-only sizing hook.
          canvas.width = boardPixels * dpr;
          canvas.height = boardPixels * dpr;
          canvas.setAttribute("aria-label", `Full frame cycle ${cycle} DPR ${dpr}`);
          gallery.append(canvas);
          const renderer = window.fullFrameHarness.createRenderer(canvas, game);
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          await renderer.ready();
          renderer.draw();
          const initialStatus = renderer.spriteStatus();
          const degradeSamples: number[] = [];
          const reextendSamples: number[] = [];
          for (let sample = 0; sample < sampleCount; sample++) {
            game.time += 0.08;
            window.fullFrameHarness.degradeEdge(game.coverage, representative);
            const degradedStarted = performance.now();
            renderer.draw();
            degradeSamples.push(performance.now() - degradedStarted);
            window.fullFrameHarness.markEdge(game.coverage, representative, sample % 2 === 0);
            game.time += 0.08;
            const reextendedStarted = performance.now();
            renderer.draw();
            reextendSamples.push(performance.now() - reextendedStarted);
          }
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas context unavailable for full-frame inspection");
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
          let alphaPixels = 0;
          for (let index = 3; index < pixels.length; index += 4)
            if ((pixels[index] ?? 0) > 0) alphaPixels++;
          scenarios.push({
            cycle,
            dpr,
            cssWidth: canvas.clientWidth,
            cssHeight: canvas.clientHeight,
            width: canvas.width,
            height: canvas.height,
            alphaPixels,
            loadedSprites: initialStatus.loaded,
            paintedSprites: initialStatus.requested,
            degradeSamples,
            reextendSamples,
            degradeTiming: summarize(degradeSamples),
            reextendTiming: summarize(reextendSamples),
          });
          renderer.dispose();
        }
      }
      return scenarios;
    },
    { boardPixels: BOARD_PIXELS, sampleCount: SAMPLE_COUNT },
  );

  for (const result of results) {
    expect(result.cssWidth).toBeGreaterThan(0);
    expect(result.cssHeight).toBeGreaterThan(0);
    expect(Math.abs(result.width - result.cssWidth * result.dpr)).toBeLessThanOrEqual(
      4 * result.dpr,
    );
    expect(Math.abs(result.height - result.cssHeight * result.dpr)).toBeLessThanOrEqual(
      4 * result.dpr,
    );
    expect(result.alphaPixels).toBeGreaterThan(BOARD_PIXELS);
    expect(result.loadedSprites).toEqual(
      expect.arrayContaining(["taq_man", "exo", "dimer", "chelate", "rnase", "buddy"]),
    );
    expect(result.paintedSprites).toEqual(
      expect.arrayContaining(["taq_man", "exo", "dimer", "chelate", "rnase", "buddy"]),
    );
    expect(result.loadedSprites).toContain(reagentSpriteName(result.cycle));
    expect(result.paintedSprites).toContain(reagentSpriteName(result.cycle));
    expect(result.degradeSamples).toHaveLength(SAMPLE_COUNT);
    expect(result.reextendSamples).toHaveLength(SAMPLE_COUNT);
    for (const sample of [...result.degradeSamples, ...result.reextendSamples])
      expect(Number.isFinite(sample)).toBe(true);
    for (const timing of [result.degradeTiming, result.reextendTiming]) {
      expect(Number.isFinite(timing.meanMs)).toBe(true);
      expect(Number.isFinite(timing.p95Ms)).toBe(true);
      expect(Number.isFinite(timing.maxMs)).toBe(true);
    }
  }
  console.info(
    `Full-frame renderer timing (${FRAME_BUDGET_MS}ms frame budget): ${results
      .map(
        (result) =>
          `C${result.cycle} DPR${result.dpr} degrade mean ${result.degradeTiming.meanMs.toFixed(2)}ms ` +
          `p95 ${result.degradeTiming.p95Ms.toFixed(2)}ms max ${result.degradeTiming.maxMs.toFixed(2)}ms; ` +
          `reextend mean ${result.reextendTiming.meanMs.toFixed(2)}ms ` +
          `p95 ${result.reextendTiming.p95Ms.toFixed(2)}ms max ${result.reextendTiming.maxMs.toFixed(2)}ms`,
      )
      .join(" | ")}`,
  );
  await page.screenshot({ path: "test-results/full_frame_render.png", fullPage: true });
});

function reagentSpriteName(cycle: number): string {
  const reagentSprites = ["reagent_magnesium", "reagent_dntp", "reagent_bsa", "reagent_dmso"];
  const sprite = reagentSprites[cycle - 1];
  if (!sprite) throw new Error(`No expected reagent sprite for cycle ${cycle}`);
  return sprite;
}
