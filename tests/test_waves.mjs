import test from "node:test";
import assert from "node:assert/strict";
import { waveMode } from "../src/game/waves.ts";
import { createGame, tick } from "../src/game/game_state.ts";
test("waves end in permanent pursuit", () => {
  assert.equal(waveMode(0, 1), "scatter");
  assert.equal(waveMode(8, 1), "chase");
  assert.equal(waveMode(10000, 1), "chase");
});
test("frightened mode suspends the wave clock", () => {
  const game = createGame();
  game.phase = "playing";
  game.enzymes = [];
  game.frightened = 2;
  tick(game, 0.1);
  assert.equal(game.waveTime, 0);
  game.frightened = 0;
  tick(game, 0.1);
  assert.ok(game.waveTime > 0);
});
