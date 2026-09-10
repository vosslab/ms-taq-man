import { directions, tileKey } from "./coords";
import type { Direction, Tile } from "./coords";
import { neighbor } from "./maze";
import type { Maze } from "./maze";

// House transit uses shortest paths; chase personalities retain arcade targeting.
export function routeDirection(maze: Maze, start: Tile, target: Tile): Direction | undefined {
  const queue: { position: Tile; first: Direction | undefined }[] = [
    { position: start, first: undefined },
  ];
  const visited = new Set([tileKey(start)]);
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];
    if (!current) continue;
    if (tileKey(current.position) === tileKey(target)) return current.first;
    for (const direction of directions) {
      const next = neighbor(maze, current.position, direction, true);
      if (!next || visited.has(tileKey(next))) continue;
      visited.add(tileKey(next));
      queue.push({ position: next, first: current.first ?? direction });
    }
  }
  return undefined;
}
