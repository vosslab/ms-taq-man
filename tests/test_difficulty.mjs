import test from "node:test";
import assert from "node:assert/strict";
import { createGame, startGame, nextCycle } from "../src/game/game_state.ts";
import { enemySpeedMultiplier } from "../src/game/difficulty.ts";

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
  const { tick } = await import("../src/game/game_state.ts");
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
