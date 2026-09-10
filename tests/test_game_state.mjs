import test from "node:test";
import assert from "node:assert/strict";
import { createGame, recordEvent, tick } from "../src/game/game_state.ts";
import { parseMaze } from "../src/game/maze.ts";
import { createPlayer } from "../src/game/player.ts";
import { createBonus } from "../src/game/bonus.ts";
import { createActor } from "../src/game/actor.ts";

test("protection reagents protect on the pickup frame before an enemy collision", () => {
  for (const name of ["Mg2+", "hot-start antibody"]) {
    const game = createGame();
    game.phase = "playing";
    game.bonus = createBonus(game.maze, 1);
    game.bonus.name = name;
    game.bonus.actor = createActor(game.maze.start);
    game.enzymes = game.enzymes.slice(0, 1);
    game.enzymes[0].actor = createActor(game.maze.start);
    tick(game, 0);
    assert.equal(game.phase, "playing");
    assert.equal(game.lives, 3);
    assert.equal(game.enzymes[0].mode, "eaten");
    assert.ok(game.frightened >= 4);
    assert.equal(game.bonus, undefined);
  }
});

test("walking onto the last primer advances after an unprimed respawn", () => {
  const game = createGame();
  game.maze = parseMaze(["########", "#P.... #", "########"]);
  game.player = createPlayer(game.maze);
  game.primers = new Set(["2,1", "3,1"]);
  game.enzymes = [];
  game.activators.clear();
  game.phase = "playing";
  recordEvent(game, { type: "direction", direction: "right" });
  tick(game, 1 / 5.5);
  assert.equal(game.primers.size, 1);
  game.phase = "dying";
  game.deathTimer = 0.1;
  tick(game, 0.1);
  game.enzymes = [];
  assert.equal(game.player.primed, false);
  recordEvent(game, { type: "direction", direction: "right" });
  tick(game, 2 / 5.5);
  assert.equal(game.phase, "cycle_complete");
  assert.equal(game.coverage.covered.size, 0);
});

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

import { edgeId, tileKey } from "../src/game/coords.ts";
import { markEdge } from "../src/game/coverage.ts";

test("half coverage clears the cycle while primers remain", () => {
  const game = createGame();
  game.phase = "playing";
  game.enzymes = [];
  const edges = [...game.maze.edges.keys()];
  for (const edge of edges.slice(0, Math.ceil(edges.length / 2) - 1)) markEdge(game.coverage, edge);
  tick(game, 0);
  assert.equal(game.phase, "playing");
  markEdge(game.coverage, edges[Math.ceil(edges.length / 2) - 1]);
  tick(game, 0);
  assert.equal(game.phase, "cycle_complete");
  assert.ok(game.primers.size > 0);
});
test("collecting all primers clears even with no template coverage", () => {
  const game = createGame();
  game.phase = "playing";
  game.enzymes = [];
  game.primers.clear();
  tick(game, 0);
  assert.equal(game.phase, "cycle_complete");
  assert.equal(game.coverage.covered.size, 0);
});

test("cycle completion wins over a simultaneous enemy collision", () => {
  const game = createGame();
  game.phase = "playing";
  game.primers.clear();
  game.enzymes[0].actor = createActor(game.player.actor.position);
  const lives = game.lives;
  tick(game, 0);
  assert.equal(game.phase, "cycle_complete");
  assert.equal(game.lives, lives);
});

test("extra life is awarded once when total score crosses its threshold", () => {
  const game = createGame();
  game.phase = "playing";
  game.enzymes = [];
  game.bonusScore = 10000;
  const lives = game.lives;
  tick(game, 0);
  tick(game, 0);
  assert.equal(game.lives, lives + 1);
});

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

test("each reagent grants its helpful power on collection", () => {
  for (const name of ["dNTP mix", "BSA", "DMSO", "betaine", "glycerol"]) {
    const game = createGame();
    game.phase = "playing";
    game.enzymes = [];
    game.bonus = createBonus(game.maze, 1);
    game.bonus.name = name;
    game.bonus.actor = createActor(game.maze.start);
    const edge = game.maze.edges.keys().next().value;
    game.chewQueue.set(edge, 20);
    tick(game, 0);
    assert.equal(game.bonus, undefined);
    assert.equal(game.lives, 3);
    assert.equal(game.bonusScore, name === "dNTP mix" ? 600 : 100);
    if (name === "BSA" || name === "glycerol") {
      assert.equal(game.rewards.shieldTimer, name === "BSA" ? 10 : 5);
      assert.equal(game.chewQueue.size, 0);
    }
    if (name === "DMSO" || name === "glycerol")
      assert.equal(game.rewards.speedTimer, name === "DMSO" ? 8 : 5);
    if (name === "betaine") {
      assert.equal(game.rewards.combo, 24);
      assert.equal(game.rewards.comboTimer, 10);
    }
  }
});
