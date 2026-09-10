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
  ) => void;
} {
  const layer = document.createElement("canvas");
  const candidate = layer.getContext("2d");
  if (!candidate) throw new Error("Strand canvas unavailable");
  const ink = candidate;
  let previousMaze: ReadOnly<Maze> | undefined;
  let revision = -1;
  const drawn = new Map<EdgeId, number>();
  const fading = new Map<EdgeId, { seed: number; started: number }>();
  function stamp(
    ink: CanvasRenderingContext2D,
    maze: ReadOnly<Maze>,
    id: EdgeId,
    seed: number,
  ): void {
    const edge = maze.edges.get(id);
    if (!edge || !ink) return;
    const jitter = ((seed % 7) - 3) * 0.3;
    const phase = ((seed % 101) / 101) * Math.PI * 2;
    const ax = (edge.a.x + 0.5) * 24;
    const ay = (edge.a.y + 0.5) * 24 + jitter;
    const bx = (edge.b.x + 0.5) * 24;
    const by = (edge.b.y + 0.5) * 24 + jitter;
    if (edge.tunnel) {
      drawHelix(ink, ax, ay, edge.a.x === 0 ? 0 : layer.width, ay, phase, colors);
      drawHelix(ink, bx, by, edge.b.x === 0 ? 0 : layer.width, by, phase, colors);
    } else drawHelix(ink, ax, ay, bx, by, phase, colors);
  }
  function paint(
    context: CanvasRenderingContext2D,
    maze: ReadOnly<Maze>,
    coverage: ReadOnly<Coverage>,
    time: number,
    reducedMotion: boolean,
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
      for (const [id, seed] of drawn) {
        if (!coverage.covered.has(id) || seed !== coverage.seeds.get(id)) {
          changed.add(id);
          if (!coverage.covered.has(id) && !reducedMotion) fading.set(id, { seed, started: time });
        }
      }
      for (const id of coverage.covered) {
        if (drawn.get(id) !== coverage.seeds.get(id)) changed.add(id);
        fading.delete(id);
      }
      // Clip the union once so intersecting repairs never double-stamp a strand.
      ink.save();
      let left = layer.width;
      let top = layer.height;
      let right = 0;
      let bottom = 0;
      for (const id of changed) {
        const edge = maze.edges.get(id);
        if (!edge) continue;
        left = Math.min(left, Math.min(edge.a.x, edge.b.x) * 24);
        top = Math.min(top, Math.min(edge.a.y, edge.b.y) * 24);
        right = Math.max(right, (Math.max(edge.a.x, edge.b.x) + 1) * 24);
        bottom = Math.max(bottom, (Math.max(edge.a.y, edge.b.y) + 1) * 24);
      }
      ink.beginPath();
      ink.rect(left, top, Math.max(0, right - left), Math.max(0, bottom - top));
      ink.clip();
      ink.clearRect(0, 0, layer.width, layer.height);
      drawn.clear();
      for (const id of coverage.covered) {
        const seed = coverage.seeds.get(id) ?? 0;
        stamp(ink, maze, id, seed);
        drawn.set(id, seed);
      }
      ink.restore();
      revision = coverage.revision;
    }
    context.drawImage(layer, 0, 0);
    if (reducedMotion) fading.clear();
    for (const [id, fade] of fading) {
      const remaining = 1 - Math.max(0, time - fade.started) / 0.6;
      if (remaining <= 0) {
        fading.delete(id);
        continue;
      }
      context.save();
      context.globalAlpha *= remaining;
      stamp(context, maze, id, fade.seed);
      context.restore();
    }
  }
  return { paint };
}
