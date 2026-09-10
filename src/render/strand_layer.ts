import type { StrandColors } from "./helix";
import type { ReadOnly } from "../game/read_only";
import type { Maze } from "../game/maze";
import type { Coverage } from "../game/coverage";
import type { EdgeId } from "../game/coords";
import { drawHelix, defaultStrandColors } from "./helix";

export function createStrandLayer(colors: StrandColors = defaultStrandColors): {
  paint: (
    context: CanvasRenderingContext2D,
    maze: ReadOnly<Maze>,
    coverage: ReadOnly<Coverage>,
    time: number,
    reducedMotion: boolean,
    chewQueue?: ReadonlyMap<EdgeId, number>,
  ) => void;
} {
  type DrawnStrand = { seed: number; clamp: boolean };
  const layer = document.createElement("canvas");
  const candidate = layer.getContext("2d");
  if (!candidate) throw new Error("Strand canvas unavailable");
  const ink = candidate;
  let previousMaze: ReadOnly<Maze> | undefined;
  let revision = -1;
  const drawn = new Map<EdgeId, DrawnStrand>();
  const fading = new Map<EdgeId, { seed: number; started: number; clamp: boolean }>();
  const dirtyMargin = 8;
  function stamp(
    ink: CanvasRenderingContext2D,
    maze: ReadOnly<Maze>,
    id: EdgeId,
    seed: number,
    clamp: boolean,
    warning = false,
  ): void {
    const edge = maze.edges.get(id);
    if (!edge || !ink) return;
    const inkColors = warning
      ? { primary: "#ffd166", secondary: "#ffe8a3", rungs: "#fff8cf" }
      : clamp
        ? { primary: "#d4a0ff", secondary: "#ff9ce4", rungs: "#f8ddff" }
        : colors;
    const jitter = ((seed % 13) - 6) * 0.18;
    const phase = ((seed % 101) / 101) * Math.PI * 2 + ((seed >> 3) % 17) * 0.07;
    const ax = (edge.a.x + 0.5) * 24;
    const ay = (edge.a.y + 0.5) * 24 + jitter;
    const bx = (edge.b.x + 0.5) * 24;
    const by = (edge.b.y + 0.5) * 24 + jitter;
    if (edge.tunnel) {
      drawHelix(ink, ax, ay, edge.a.x === 0 ? 0 : layer.width, ay, phase, inkColors);
      drawHelix(ink, bx, by, edge.b.x === 0 ? 0 : layer.width, by, phase, inkColors);
    } else drawHelix(ink, ax, ay, bx, by, phase, inkColors);
  }
  function paint(
    context: CanvasRenderingContext2D,
    maze: ReadOnly<Maze>,
    coverage: ReadOnly<Coverage>,
    time: number,
    reducedMotion: boolean,
    chewQueue?: ReadonlyMap<EdgeId, number>,
  ): void {
    if (maze !== previousMaze) {
      layer.width = maze.width * 24;
      layer.height = maze.height * 24;
      previousMaze = maze;
      drawn.clear();
      fading.clear();
      revision = -1;
    }
    if (coverage.revision !== revision) {
      const changed = new Set<EdgeId>();
      for (const [id, previous] of drawn) {
        const clamp = coverage.clampBuilt.has(id);
        if (
          !coverage.covered.has(id) ||
          previous.seed !== coverage.seeds.get(id) ||
          previous.clamp !== clamp
        ) {
          changed.add(id);
          if (!coverage.covered.has(id) && !reducedMotion)
            fading.set(id, { seed: previous.seed, started: time, clamp: previous.clamp });
        }
      }
      for (const id of coverage.covered) {
        const seed = coverage.seeds.get(id) ?? 0;
        const clamp = coverage.clampBuilt.has(id);
        const previous = drawn.get(id);
        if (!previous || previous.seed !== seed || previous.clamp !== clamp) changed.add(id);
        fading.delete(id);
      }
      // Clip the union once so intersecting repairs never double-stamp a strand.
      ink.save();
      let hasDirtyRegion = false;
      function addDirtyRegion(left: number, top: number, right: number, bottom: number): void {
        const clippedLeft = Math.max(0, left);
        const clippedTop = Math.max(0, top);
        const clippedRight = Math.min(layer.width, right);
        const clippedBottom = Math.min(layer.height, bottom);
        if (clippedLeft >= clippedRight || clippedTop >= clippedBottom) return;
        ink.rect(clippedLeft, clippedTop, clippedRight - clippedLeft, clippedBottom - clippedTop);
        hasDirtyRegion = true;
      }
      ink.beginPath();
      for (const id of changed) {
        const edge = maze.edges.get(id);
        if (!edge) continue;
        const ax = (edge.a.x + 0.5) * 24;
        const ay = (edge.a.y + 0.5) * 24;
        const bx = (edge.b.x + 0.5) * 24;
        const by = (edge.b.y + 0.5) * 24;
        if (edge.tunnel) {
          // Tunnel strands are two short mouth segments.  Keeping them separate
          // prevents a changed tunnel edge from dirtying the whole board row.
          function addTunnelMouth(x: number, y: number): void {
            if (x < layer.width / 2)
              addDirtyRegion(0, y - dirtyMargin, x + dirtyMargin, y + dirtyMargin);
            else addDirtyRegion(x - dirtyMargin, y - dirtyMargin, layer.width, y + dirtyMargin);
          }
          addTunnelMouth(ax, ay);
          addTunnelMouth(bx, by);
        } else {
          addDirtyRegion(
            Math.min(ax, bx) - dirtyMargin,
            Math.min(ay, by) - dirtyMargin,
            Math.max(ax, bx) + dirtyMargin,
            Math.max(ay, by) + dirtyMargin,
          );
        }
      }
      if (hasDirtyRegion) {
        ink.clip();
        ink.clearRect(0, 0, layer.width, layer.height);
        drawn.clear();
        for (const id of coverage.covered) {
          const seed = coverage.seeds.get(id) ?? 0;
          const clamp = coverage.clampBuilt.has(id);
          stamp(ink, maze, id, seed, clamp);
          drawn.set(id, { seed, clamp });
        }
      }
      ink.restore();
      revision = coverage.revision;
    }
    context.drawImage(layer, 0, 0);
    for (const [id, due] of chewQueue ?? []) {
      if (!coverage.covered.has(id) || due <= time) continue;
      const seed = coverage.seeds.get(id) ?? 0;
      stamp(context, maze, id, seed, coverage.clampBuilt.has(id), true);
    }
    if (reducedMotion) fading.clear();
    for (const [id, fade] of fading) {
      const remaining = 1 - Math.max(0, time - fade.started) / 0.6;
      if (remaining <= 0) {
        fading.delete(id);
        continue;
      }
      context.save();
      context.globalAlpha *= remaining;
      stamp(context, maze, id, fade.seed, fade.clamp);
      context.restore();
    }
  }
  return { paint };
}
