import test from "node:test";
import assert from "node:assert/strict";
import { firstMaze } from "../src/game/maze_layouts.ts";
import { routeDirection } from "../src/game/routing.ts";
import { neighbor } from "../src/game/maze.ts";
import { tileKey } from "../src/game/coords.ts";

test("eyes reach the house from every corridor without cycling", () => {
  const maze = firstMaze();
  for (const start of maze.corridors) {
    let position = start;
    const visited = new Set();
    while (tileKey(position) !== tileKey(maze.house)) {
      assert.equal(visited.has(tileKey(position)), false);
      visited.add(tileKey(position));
      const direction = routeDirection(maze, position, maze.house);
      assert.ok(direction);
      position = neighbor(maze, position, direction, true);
    }
  }
});
