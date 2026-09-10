import { opposite, vectors, wrap } from "./coords";
import type { Direction, Tile } from "./coords";
import { neighbor } from "./maze";
import type { Maze } from "./maze";

export type Actor = {
  position: Tile;
  destination: Tile | undefined;
  progress: number;
  direction: Direction;
  queued: Direction;
  traversalStart: Tile;
};
export function createActor(position: Tile): Actor {
  return {
    position,
    destination: undefined,
    progress: 0,
    direction: "left",
    queued: "left",
    traversalStart: position,
  };
}
export function queueDirection(actor: Actor, direction: Direction): void {
  actor.queued = direction;
  if (actor.destination && direction === opposite[actor.direction]) {
    const previous = actor.position;
    actor.position = actor.destination;
    actor.destination = previous;
    actor.progress = 1 - actor.progress;
    actor.direction = direction;
  }
}
export function moveActor(
  actor: Actor,
  maze: Maze,
  distance: number,
  arrived: (from: Tile, to: Tile) => void | false,
  houseAccess = false,
): void {
  let budget = distance;
  while (budget > 0) {
    if (!actor.destination) {
      const turn = neighbor(maze, actor.position, actor.queued, houseAccess);
      if (turn) actor.direction = actor.queued;
      actor.destination = turn ?? neighbor(maze, actor.position, actor.direction, houseAccess);
      if (!actor.destination) return;
      actor.traversalStart = actor.position;
    }
    const step = Math.min(budget, 1 - actor.progress);
    actor.progress += step;
    budget -= step;
    if (actor.progress >= 1 - 1e-9) {
      const from = actor.position;
      actor.position = actor.destination;
      actor.destination = undefined;
      actor.progress = 0;
      if (
        actor.traversalStart.x !== actor.position.x ||
        actor.traversalStart.y !== actor.position.y
      ) {
        if (arrived(from, actor.position) === false) return;
      }
    }
  }
}
export function actorLocation(actor: Actor, maze: Maze): { x: number; y: number } {
  const delta = vectors[actor.direction];
  return {
    x: wrap(actor.position.x + delta.x * actor.progress + 0.5, maze.width),
    y: actor.position.y + delta.y * actor.progress + 0.5,
  };
}
