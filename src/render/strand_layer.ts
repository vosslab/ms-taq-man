import type { Maze } from "../game/maze";
import type { Coverage } from "../game/coverage";
import type { EdgeId } from "../game/coords";
import { drawHelix } from "./helix";

export function createStrandLayer(): {
  paint: (context: CanvasRenderingContext2D, maze: Maze, coverage: Coverage) => void;
} {
  const layer = document.createElement("canvas");
  const candidate = layer.getContext("2d");
  if (!candidate) throw new Error("Strand canvas unavailable");
  const ink = candidate;
  let previousMaze: Maze | undefined;
  let revision = -1;
  const drawn = new Set<EdgeId>();
  function stamp(maze: Maze, coverage: Coverage, id: EdgeId): void {
    const edge = maze.edges.get(id);
    if (!edge || !ink) return;
    const jitter = (((coverage.seeds.get(id) ?? 0) % 7) - 3) * 0.3;
    const ax = (edge.a.x + 0.5) * 24;
    const ay = (edge.a.y + 0.5) * 24 + jitter;
    const bx = (edge.b.x + 0.5) * 24;
    const by = (edge.b.y + 0.5) * 24 + jitter;
    if (edge.tunnel) {
      drawHelix(ink, ax, ay, edge.a.x === 0 ? 0 : layer.width, ay);
      drawHelix(ink, bx, by, edge.b.x === 0 ? 0 : layer.width, by);
    } else drawHelix(ink, ax, ay, bx, by);
  }
  function paint(context: CanvasRenderingContext2D, maze: Maze, coverage: Coverage): void {
    if (maze !== previousMaze) {
      layer.width = maze.width * 24;
      layer.height = maze.height * 24;
      previousMaze = maze;
      drawn.clear();
      revision = -1;
    }
    if (coverage.revision !== revision) {
      const removed = [...drawn].filter((id) => !coverage.covered.has(id));
      for (const id of removed) {
        const edge = maze.edges.get(id);
        if (!edge) continue;
        const left = Math.min(edge.a.x, edge.b.x) * 24;
        const top = Math.min(edge.a.y, edge.b.y) * 24;
        const width = (Math.abs(edge.a.x - edge.b.x) + 1) * 24;
        const height = (Math.abs(edge.a.y - edge.b.y) + 1) * 24;
        ink.save();
        ink.beginPath();
        ink.rect(left, top, width, height);
        ink.clip();
        ink.clearRect(left, top, width, height);
        for (const covered of coverage.covered) stamp(maze, coverage, covered);
        ink.restore();
        drawn.delete(id);
      }
      for (const id of coverage.covered) {
        if (!drawn.has(id)) {
          stamp(maze, coverage, id);
          drawn.add(id);
        }
      }
      revision = coverage.revision;
    }
    context.drawImage(layer, 0, 0);
  }
  return { paint };
}
