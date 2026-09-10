import { directions, edgeId, tile, tileKey, vectors, wrap } from "./coords";
import type { Direction, EdgeId, Tile } from "./coords";

export type Edge = { id: EdgeId; a: Tile; b: Tile; tunnel: boolean };
export type Maze = {
  rows: readonly string[];
  width: number;
  height: number;
  edges: Map<EdgeId, Edge>;
  corridors: Tile[];
  start: Tile;
  house: Tile;
  houseExit: Tile;
  primers: Tile[];
  activators: Tile[];
};
export function cell(maze: Maze, position: Tile): string {
  return maze.rows[position.y]?.[position.x] ?? "#";
}
export function walkable(maze: Maze, position: Tile, houseAccess = false): boolean {
  const value = cell(maze, position);
  return value !== "#" && (houseAccess || (value !== "H" && value !== "-"));
}
export function neighbor(
  maze: Maze,
  from: Tile,
  direction: Direction,
  houseAccess = false,
): Tile | undefined {
  const delta = vectors[direction];
  let x = from.x + delta.x;
  const y = from.y + delta.y;
  if (x < 0 || x >= maze.width) {
    if (cell(maze, from) !== "T") return undefined;
    x = wrap(x, maze.width);
    if (cell(maze, tile(x, y)) !== "T") return undefined;
  }
  const result = tile(x, y);
  return walkable(maze, result, houseAccess) ? result : undefined;
}
export function parseMaze(rows: readonly string[]): Maze {
  const width = rows[0]?.length ?? 0;
  if (width < 3 || rows.some((row) => row.length !== width || /[^#.PHTo -]/.test(row))) {
    throw new Error("Maze must be rectangular and contain only known cells");
  }
  const maze: Maze = {
    rows,
    width,
    height: rows.length,
    edges: new Map(),
    corridors: [],
    start: tile(1, 1),
    house: tile(1, 1),
    houseExit: tile(1, 1),
    primers: [],
    activators: [],
  };
  let starts = 0;
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < width; x++) {
      const position = tile(x, y);
      const value = cell(maze, position);
      if (value === "P") {
        maze.start = position;
        starts++;
      }
      if (value === "H") maze.house = position;
      if (value === ".") maze.primers.push(position);
      if (value === "o") maze.activators.push(position);
      if (walkable(maze, position)) maze.corridors.push(position);
    }
  }
  if (starts !== 1) throw new Error("Maze requires exactly one player spawn");
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < width; x++) {
      if (cell(maze, tile(x, y)) !== "-") continue;
      const exit = directions
        .map((direction) => neighbor(maze, tile(x, y), direction))
        .find((position) => position !== undefined);
      if (!exit) throw new Error("House door must connect to a corridor");
      maze.houseExit = exit;
    }
  }
  for (const a of maze.corridors) {
    for (const direction of directions) {
      const b = neighbor(maze, a, direction);
      if (!b) continue;
      const id = edgeId(a, b);
      maze.edges.set(id, { id, a, b, tunnel: Math.abs(a.x - b.x) > 1 });
    }
  }
  const visited = new Set<string>();
  const pending = [maze.start];
  while (pending.length) {
    const position = pending.pop();
    if (!position || visited.has(tileKey(position))) continue;
    visited.add(tileKey(position));
    for (const direction of directions) {
      const next = neighbor(maze, position, direction);
      if (next && !visited.has(tileKey(next))) pending.push(next);
    }
  }
  if (visited.size !== maze.corridors.length) throw new Error("Maze has unreachable template");
  return maze;
}
