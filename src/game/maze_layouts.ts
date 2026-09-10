import { parseMaze } from "./maze";
import { extraLayouts } from "./maze_layouts_extra";

export const mazePalettes: readonly string[] = ["cyan", "rose", "violet", "amber"];
export function mazeForCycle(cycle: number): ReturnType<typeof parseMaze> {
  const index = (Math.max(1, Math.floor(cycle)) - 1) % 4;
  if (index === 0) return firstMaze();
  const rows = extraLayouts[index - 1];
  if (!rows) throw new Error("Missing maze layout");
  return parseMaze(rows);
}

// Corridor graph includes the tunnel link, but excludes the enzyme house.
export function firstMaze(): ReturnType<typeof parseMaze> {
  return parseMaze([
    "#####################",
    "#o........#........o#",
    "#.##.####.#.####.##.#",
    "#...................#",
    "#.##.#.#######.#.##.#",
    "#....#....#....#....#",
    "####.####.#.####.####",
    "####.#.........#.####",
    "####.#.##-##.#.#.####",
    "T......#HHH#........T",
    "####.#.#####.#.#.####",
    "####.#.......#.#.####",
    "####.#.#####.#.#.####",
    "#.........#.........#",
    "#.##.####.#.####.##.#",
    "#..#......P......#..#",
    "##.#.#.#######.#.#.##",
    "#....#....#....#....#",
    "#.#######.#.#######.#",
    "#o.................o#",
    "#####################",
  ]);
}
