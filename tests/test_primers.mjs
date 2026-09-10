import test from "node:test";
import assert from "node:assert/strict";
import { placePrimers } from "../src/game/level_table.ts";
import { parseMaze } from "../src/game/maze.ts";
test("primer placement respects its input budget and available sites", () => {
  const maze = parseMaze(["########", "#P.....#", "########"]);
  for (const requested of [0, 1, 3, 5, 9]) {
    assert.equal(placePrimers(maze, requested).size, Math.min(requested, maze.primers.length));
  }
  assert.ok(placePrimers(maze, 1).has("2,1"));
});
