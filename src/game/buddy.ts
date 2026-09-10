import { createActor, moveActor } from "./actor";
import type { Actor } from "./actor";
import { edgeId } from "./coords";
import type { EdgeId } from "./coords";
import type { Maze } from "./maze";
import { routeDirection } from "./routing";

export function createBuddy(maze: Maze): {
  protection: number;
  lastBuilt: EdgeId | undefined;
  buildGlow: number;
  active: boolean;
  actor: Actor;
  buildTimer: number;
  rescueTimer: number;
  distraction: number;
  pulseTimer: number;
} {
  return {
    protection: 0,
    lastBuilt: undefined,
    buildGlow: 0,
    active: false,
    actor: createActor(
      maze.corridors.find(
        (p) => Math.abs(p.x - maze.start.x) + Math.abs(p.y - maze.start.y) === 3,
      ) ?? maze.start,
    ),
    buildTimer: 0,
    rescueTimer: 0,
    distraction: 0,
    pulseTimer: 6,
  };
}
export type Buddy = ReturnType<typeof createBuddy>;
export function advanceBuddy(
  buddy: Buddy,
  maze: Maze,
  player: Actor,
  seconds: number,
  build: (edge: EdgeId) => void,
): void {
  if (!buddy.active) return;
  buddy.protection = Math.max(0, buddy.protection - seconds);
  buddy.buildGlow = Math.max(0, buddy.buildGlow - seconds);
  buddy.buildTimer = Math.max(0, buddy.buildTimer - seconds);
  buddy.rescueTimer = Math.max(0, buddy.rescueTimer - seconds);
  buddy.distraction = Math.max(0, buddy.distraction - seconds);
  buddy.pulseTimer -= seconds;
  if (buddy.pulseTimer <= 0) {
    buddy.distraction = 4;
    buddy.pulseTimer = 12;
  }
  function steer(): void {
    buddy.actor.queued =
      routeDirection(maze, buddy.actor.position, player.position, false) ?? buddy.actor.direction;
  }
  if (!buddy.actor.destination) steer();
  moveActor(buddy.actor, maze, seconds * 3.4, (from, to) => {
    if (buddy.buildTimer <= 0) {
      build(edgeId(from, to));
      buddy.buildTimer = 2;
    }
    steer();
  });
}
