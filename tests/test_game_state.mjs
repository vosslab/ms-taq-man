import test from "node:test";
import assert from "node:assert/strict";
import { createGame, tick } from "../src/game/game_state.ts";

test("completed template advances through thermal intermission to the next maze", () => {
  const game = createGame();
  game.phase = "playing";
  game.enzymes = [];
  const previous = game.maze.rows;
  for (const edge of game.maze.edges.keys()) markEdge(game.coverage, edge);
  const bases = game.coverage.bases;
  tick(game, 0);
  assert.equal(game.phase, "cycle_complete");
  tick(game, 2);
  assert.equal(game.phase, "intermission");
  tick(game, 3);
  assert.notDeepEqual(game.maze.rows, previous);
  assert.equal(game.completedBases, bases);
  assert.equal(game.player.primed, false);
});
import { createActor } from "../src/game/actor.ts";
import { edgeId, tileKey } from "../src/game/coords.ts";
import { markEdge } from "../src/game/coverage.ts";

test("hot start makes a collision edible and awards the first chain", () => {
  const game = createGame();
  game.phase = "playing";
  game.activators.add(tileKey(game.player.actor.position));
  game.enzymes = [game.enzymes[0]];
  game.enzymes[0].actor = createActor(game.player.actor.position);
  tick(game, 1 / 60);
  assert.equal(game.enzymes[0].mode, "eaten");
  assert.equal(game.bonusScore, 200);
  assert.equal(game.lives, 3);
});
test("scheduled degradation preserves the strand until its due time", () => {
  const game = createGame();
  game.phase = "playing";
  game.enzymes = [];
  const edge = game.maze.edges.values().next().value;
  const id = edgeId(edge.a, edge.b);
  markEdge(game.coverage, id);
  game.chewQueue.set(id, 0.1);
  tick(game, 0.05);
  assert.equal(game.coverage.covered.has(id), true);
  tick(game, 0.05);
  assert.equal(game.coverage.covered.has(id), false);
});
