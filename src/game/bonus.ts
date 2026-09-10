import { createActor, moveActor } from "./actor";
import type { Actor } from "./actor";
import { directions, tileKey } from "./coords";
import { neighbor } from "./maze";
import type { Maze } from "./maze";
import { routeDirection } from "./routing";

export const reagents = [
  "Mg2+",
  "dNTP mix",
  "BSA",
  "DMSO",
  "betaine",
  "hot-start antibody",
  "glycerol",
];
export type Bonus = {
  actor: Actor;
  name: string;
  points: number;
  age: number;
  turns: number;
  exiting: boolean;
  finished: boolean;
};
export function createBonus(maze: Maze, cycle: number): Bonus {
  const entry = maze.corridors.find((position) => position.x === 0);
  if (!entry) throw new Error("Reagent entry requires a tunnel");
  const actor = createActor(entry);
  actor.direction = "right";
  actor.queued = "right";
  return {
    actor,
    name: reagents[(cycle - 1) % reagents.length] ?? "Mg2+",
    points: 100 * Math.min(7, cycle),
    age: 0,
    turns: 0,
    exiting: false,
    finished: false,
  };
}
export function advanceBonus(bonus: Bonus, maze: Maze, seconds: number): void {
  if (bonus.finished) return;
  bonus.age += seconds;
  bonus.exiting = bonus.age >= 12;
  const exit = maze.corridors.find((position) => position.x === maze.width - 1);
  if (!exit) throw new Error("Reagent exit requires a tunnel");
  const exitTile = exit;
  function steer(): void | false {
    if (bonus.exiting) {
      if (tileKey(bonus.actor.position) === tileKey(exitTile)) {
        bonus.finished = true;
        return false;
      }
      bonus.actor.queued = routeDirection(maze, bonus.actor.position, exitTile, false) ?? "right";
      return;
    }
    const candidates = directions.filter((direction) =>
      neighbor(maze, bonus.actor.position, direction),
    );
    bonus.actor.queued = candidates[bonus.turns++ % candidates.length] ?? "right";
  }
  if (!bonus.actor.destination && bonus.age > seconds && steer() === false) return;
  moveActor(bonus.actor, maze, seconds * 3, steer);
}
