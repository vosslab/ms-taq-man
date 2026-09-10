import test from "node:test";
import assert from "node:assert/strict";
import { placePrimers } from "../src/game/level_table.ts";
import { parseMaze } from "../src/game/maze.ts";
import { createGame, nextCycle, tick } from "../src/game/game_state.ts";
test("primer placement respects its input budget and available sites", () => {
  const maze = parseMaze(["########", "#P.....#", "########"]);
  for (const requested of [0, 1, 3, 5, 9]) {
    assert.equal(placePrimers(maze, requested).size, Math.min(requested, maze.primers.length));
  }
  assert.ok(placePrimers(maze, 1).has("2,1"));
});

test("production cycles place their intended primer budgets", () => {
  const game = createGame();
  for (const expected of [32, 28, 24, 20]) {
    assert.equal(game.primers.size, expected);
    if (expected !== 20) nextCycle(game);
  }
});

test("death restores empty primers except for a retained cycle-four extension", () => {
  const game = createGame();
  game.phase = "dying";
  game.deathTimer = 0;
  game.primers.clear();
  tick(game, 0);
  assert.equal(game.primers.size, 32);
  nextCycle(game);
  nextCycle(game);
  nextCycle(game);
  game.phase = "dying";
  game.deathTimer = 0;
  game.player.primed = true;
  game.primers.clear();
  tick(game, 0);
  assert.equal(game.player.primed, true);
  assert.equal(game.primers.size, 0);
});
