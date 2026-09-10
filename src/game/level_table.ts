import { tileKey } from "./coords";
import type { Maze } from "./maze";

export const levels = [
  {
    playerSpeed: 5.5,
    enemySpeed: 4.6,
    frightened: 7,
    chewDelay: 4,
    chewers: 1,
    primerCount: 32,
    retainExtension: false,
  },
  {
    playerSpeed: 5.8,
    enemySpeed: 4.9,
    frightened: 6,
    chewDelay: 3.5,
    chewers: 1,
    primerCount: 28,
    retainExtension: false,
  },
  {
    playerSpeed: 6,
    enemySpeed: 5.2,
    frightened: 5,
    chewDelay: 3,
    chewers: 2,
    primerCount: 24,
    retainExtension: false,
  },
  {
    playerSpeed: 6.2,
    enemySpeed: 5.5,
    frightened: 4,
    chewDelay: 2.5,
    chewers: 2,
    primerCount: 20,
    retainExtension: true,
  },
] as const;
export type Level = (typeof levels)[number];
export function levelForCycle(cycle: number): Level {
  const level = levels[Math.min(levels.length - 1, Math.max(0, Math.floor(cycle) - 1))];
  if (!level) throw new Error("Missing cycle tuning");
  return level;
}
export function placePrimers(maze: Maze, count: number): Set<string> {
  const chosen = new Set<string>();
  const nearest = [...maze.primers].sort(
    (a, b) =>
      Math.hypot(a.x - maze.start.x, a.y - maze.start.y) -
      Math.hypot(b.x - maze.start.x, b.y - maze.start.y),
  );
  // Keep a primer reachable immediately after each fresh life.
  for (const position of nearest.slice(0, 4)) chosen.add(tileKey(position));
  for (let index = 0; index < count && maze.primers.length; index++) {
    const position = maze.primers[Math.floor((index * maze.primers.length) / count)];
    if (position) chosen.add(tileKey(position));
  }
  return chosen;
}
