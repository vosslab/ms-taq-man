import { createActor, moveActor } from "./actor";
import type { Actor } from "./actor";
import { tileKey } from "./coords";
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
export function reagentDescription(name: string): string {
  switch (name) {
    case "Mg2+":
      return "4 seconds of hot-start protection";
    case "dNTP mix":
      return "500 extra points";
    case "BSA":
      return "10 seconds of DNA protection from chew-back";
    case "DMSO":
      return "8 seconds of faster movement";
    case "betaine":
      return "Start a x4 synthesis combo";
    case "hot-start antibody":
      return "10 seconds of hot-start protection";
    case "glycerol":
      return "5 seconds of speed and DNA protection";
    default:
      return "Bonus points";
  }
}
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
  bonus.exiting = bonus.age >= 40;
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
    const stops = maze.activators.length ? maze.activators : [maze.start];
    let target = stops[bonus.turns % stops.length] ?? maze.start;
    if (tileKey(bonus.actor.position) === tileKey(target)) {
      bonus.turns++;
      target = stops[bonus.turns % stops.length] ?? maze.start;
    }
    bonus.actor.queued = routeDirection(maze, bonus.actor.position, target, false) ?? "right";
  }
  if (!bonus.actor.destination && bonus.age > seconds && steer() === false) return;
  moveActor(bonus.actor, maze, seconds * 3, steer);
}
