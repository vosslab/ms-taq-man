import { createActor, moveActor, queueDirection } from "./actor";
import type { Actor } from "./actor";
import { directions, edgeId, opposite, tile, vectors } from "./coords";
import type { Direction, EdgeId, Tile } from "./coords";
import { neighbor } from "./maze";
import type { Maze } from "./maze";
import { routeDirection } from "./routing";
import type { Level } from "./level_table";
import type { WaveMode } from "./waves";

export type EnzymeName = "exo" | "dimer" | "chelate" | "rnase";
export type Enzyme = {
  name: EnzymeName;
  actor: Actor;
  release: number;
  mode: "scatter" | "chase" | "frightened" | "eaten";
  randomState: number;
};
export function targetTile(
  name: EnzymeName,
  player: Tile,
  heading: Direction,
  exo: Tile,
  own: Tile,
  corner: Tile,
): Tile {
  const vector = vectors[heading];
  switch (name) {
    case "exo":
      return player;
    case "dimer":
      return tile(player.x + 4 * vector.x, player.y + 4 * vector.y);
    case "chelate":
      return tile(2 * (player.x + 2 * vector.x) - exo.x, 2 * (player.y + 2 * vector.y) - exo.y);
    case "rnase":
      return Math.hypot(own.x - player.x, own.y - player.y) >= 8 ? player : corner;
  }
}
export function createEnzymes(maze: Maze): Enzyme[] {
  const names: EnzymeName[] = ["exo", "dimer", "chelate", "rnase"];
  return names.map((name, index) => ({
    name,
    actor: createActor(maze.house),
    release: index * 3,
    mode: "scatter",
    randomState: 1729 + index * 7919,
  }));
}
export function chooseDirection(
  actor: Actor,
  maze: Maze,
  target: Tile,
  houseAccess: boolean,
): Direction {
  let candidates = directions.filter((direction) =>
    neighbor(maze, actor.position, direction, houseAccess),
  );
  const forward = candidates.filter((direction) => direction !== opposite[actor.direction]);
  if (forward.length) candidates = forward;
  let choice = candidates[0] ?? actor.direction;
  let best = Infinity;
  for (const direction of candidates) {
    const next = neighbor(maze, actor.position, direction, houseAccess);
    if (!next) continue;
    const distance = (next.x - target.x) ** 2 + (next.y - target.y) ** 2;
    if (distance < best) {
      best = distance;
      choice = direction;
    }
  }
  return choice;
}
export function frightenedDirection(enzyme: Enzyme, maze: Maze): Direction {
  const legal = directions.filter((direction) => neighbor(maze, enzyme.actor.position, direction));
  const forward = legal.filter((direction) => direction !== opposite[enzyme.actor.direction]);
  const choices = forward.length ? forward : legal;
  enzyme.randomState = (Math.imul(enzyme.randomState, 1664525) + 1013904223) >>> 0;
  return (
    choices[Math.floor((enzyme.randomState / 4294967296) * choices.length)] ??
    enzyme.actor.direction
  );
}
export function advanceEnzymes(
  enzymes: Enzyme[],
  maze: Maze,
  player: Actor,
  time: number,
  seconds: number,
  frightened: boolean,
  chew: (edge: EdgeId) => void,
  level: Level,
  wave: WaveMode,
): void {
  const exo = enzymes[0];
  if (!exo) return;
  const corners = [
    tile(maze.width - 2, 1),
    tile(1, 1),
    tile(maze.width - 2, maze.height - 2),
    tile(1, maze.height - 2),
  ];
  for (const [index, enzyme] of enzymes.entries()) {
    if (time < enzyme.release) continue;
    const mode = enzyme.mode === "eaten" ? "eaten" : frightened ? "frightened" : wave;
    const reversing = mode !== enzyme.mode;
    if (reversing) queueDirection(enzyme.actor, opposite[enzyme.actor.direction]);
    enzyme.mode = mode;
    function steer(): void {
      const position = enzyme.actor.position;
      const inHouse =
        maze.rows[position.y]?.[position.x] === "H" || maze.rows[position.y]?.[position.x] === "-";
      const corner = corners[index] ?? tile(1, 1);
      const target =
        mode === "eaten"
          ? maze.house
          : inHouse
            ? maze.houseExit
            : mode === "scatter" || mode === "frightened"
              ? corner
              : targetTile(
                  enzyme.name,
                  player.position,
                  player.direction,
                  exo!.actor.position,
                  position,
                  corner,
                );
      const transit = inHouse || mode === "eaten";
      enzyme.actor.queued = transit
        ? (routeDirection(maze, position, target) ?? enzyme.actor.direction)
        : mode === "frightened"
          ? frightenedDirection(enzyme, maze)
          : chooseDirection(enzyme.actor, maze, target, false);
    }
    if (!enzyme.actor.destination && !reversing) steer();
    moveActor(
      enzyme.actor,
      maze,
      seconds * (mode === "eaten" ? 8 : mode === "frightened" ? 2.8 : level.enemySpeed),
      (from, to): void | false => {
        if (
          (enzyme.name === "exo" || (enzyme.name === "rnase" && level.chewers > 1)) &&
          (mode === "chase" || mode === "scatter")
        )
          chew(edgeId(from, to));
        if (mode === "eaten" && to.x === maze.house.x && to.y === maze.house.y) {
          enzyme.mode = "scatter";
          enzyme.release = time + 2;
          return false;
        }
        steer();
      },
      true,
    );
  }
}
