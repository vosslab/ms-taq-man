import { createActor, moveActor } from "./actor";
import type { Actor } from "./actor";
import { edgeId, tileKey } from "./coords";
import type { EdgeId } from "./coords";
import type { Maze } from "./maze";

export type Player = { actor: Actor; primed: boolean };
export function createPlayer(maze: Maze): Player {
  return { actor: createActor(maze.start), primed: false };
}
export function advancePlayer(
  player: Player,
  maze: Maze,
  primers: Set<string>,
  distance: number,
  extend: (id: EdgeId) => void,
): void {
  moveActor(player.actor, maze, distance, (from, to) => {
    if (player.primed) extend(edgeId(from, to));
    if (primers.delete(tileKey(to))) player.primed = true;
  });
}
