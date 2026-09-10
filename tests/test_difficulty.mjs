import test from "node:test";
import assert from "node:assert/strict";
import { createGame, startGame, nextCycle, tick } from "../src/game/game_state.ts";
import { coverageTarget, enemySpeedMultiplier } from "../src/game/difficulty.ts";
import { markEdge } from "../src/game/coverage.ts";

test("difficulty scales enemy speed and survives restart and maze rotation", () => {
  const game = createGame();
  assert.equal(game.difficulty, 2);
  assert.equal(enemySpeedMultiplier(1), 0.6);
  assert.equal(enemySpeedMultiplier(4), 1);
  assert.equal(enemySpeedMultiplier(5), 1.1);
  game.difficulty = 1;
  startGame(game);
  assert.equal(game.difficulty, 1);
  nextCycle(game);
  assert.equal(game.difficulty, 1);
  game.phase = "game_over";
  startGame(game);
  assert.equal(game.difficulty, 1);
});

test("lower difficulty slows live enemies without changing player speed", async () => {
  const { createActor } = await import("../src/game/actor.ts");
  const { tile } = await import("../src/game/coords.ts");
  const games = [1, 4].map((difficulty) => {
    const game = createGame();
    game.phase = "playing";
    game.difficulty = difficulty;
    game.enzymes = game.enzymes.slice(0, 1);
    game.enzymes[0].actor = createActor(tile(5, 1));
    tick(game, 0.05);
    return game;
  });
  assert.ok(games[0].enzymes[0].actor.progress < games[1].enzymes[0].actor.progress);
  assert.equal(games[0].player.actor.progress, games[1].player.actor.progress);
});

test("each difficulty clears at its own coverage threshold", () => {
  for (const [difficulty, target] of [
    [1, 50],
    [2, 60],
    [3, 70],
    [4, 80],
    [5, 90],
  ]) {
    const game = createGame();
    const edges = [...game.maze.edges.keys()];
    const required = Math.ceil((edges.length * target) / 100);
    game.phase = "playing";
    game.difficulty = difficulty;
    game.enzymes = [];
    for (const edge of edges.slice(0, required - 1)) markEdge(game.coverage, edge);
    tick(game, 0);
    assert.equal(game.phase, "playing");
    markEdge(game.coverage, edges[required - 1]);
    tick(game, 0);
    assert.equal(game.phase, "cycle_complete");
    assert.equal(coverageTarget(difficulty), target);
  }
});
