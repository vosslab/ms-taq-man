import test from "node:test";
import assert from "node:assert/strict";
import { createGame, recordEvent, tick } from "../src/game/game_state.ts";
import { parseMaze } from "../src/game/maze.ts";
import { createPlayer } from "../src/game/player.ts";
import { createBonus } from "../src/game/bonus.ts";
import { createActor } from "../src/game/actor.ts";

test("score events grant an extra life immediately and only once", () => {
  const game = createGame();
  game.bonusScore = 9900;
  recordEvent(game, { type: "bonus", points: 100 });
  assert.equal(game.lives, 4);
  assert.equal(game.rewards.message, "EXTRA POLYMERASE! +1 LIFE");
  recordEvent(game, { type: "capture_enzyme" });
  assert.equal(game.lives, 4);
});

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

test("default 60 percent coverage clears the cycle while primers remain", () => {
  const game = createGame();
  game.phase = "playing";
  game.enzymes = [];
  const edges = [...game.maze.edges.keys()];
  for (const edge of edges.slice(0, Math.ceil(edges.length * 0.6) - 1))
    markEdge(game.coverage, edge);
  tick(game, 0);
  assert.equal(game.phase, "playing");
  markEdge(game.coverage, edges[Math.ceil(edges.length * 0.6) - 1]);
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

test("reagents can be collected across the tunnel wrap", () => {
  const game = createGame();
  game.phase = "playing";
  game.enzymes = [];
  const left = game.maze.corridors.find((position) => position.x === 0);
  const right = game.maze.corridors.find((position) => position.x === game.maze.width - 1);
  game.player.actor = createActor(left);
  game.player.actor.direction = "left";
  game.player.actor.queued = "left";
  game.player.actor.destination = right;
  game.player.actor.progress = 0.4;
  game.bonus = createBonus(game.maze, 1);
  game.bonus.actor = createActor(right);
  game.bonus.actor.direction = "right";
  game.bonus.actor.destination = left;
  game.bonus.actor.progress = 0.4;
  tick(game, 0);
  assert.equal(game.bonus, undefined);
  assert.equal(game.bonusScore, 100);
  assert.deepEqual(game.collectedReagents, ["Mg2+"]);
});

test("Recruited clamp rescues a collision, then needs time to recharge", () => {
  const game = createGame();
  game.buddy.active = true;
  game.phase = "playing";
  game.enzymes[0].actor = { ...game.player.actor };
  tick(game, 0);
  assert.equal(game.lives, 3);
  assert.ok(game.frightened > 0 && game.buddy.rescueTimer > 0);
  game.frightened = 0;
  game.enzymes[0].mode = "chase";
  tick(game, 0);
  assert.equal(game.phase, "dying");
});

test("Recruited clamp builds template without changing the primer goal or player combo", () => {
  const game = createGame();
  const edge = game.maze.edges.keys().next().value;
  const primers = game.primers.size;
  recordEvent(game, { type: "buddy_extend", edge });
  assert.ok(game.coverage.covered.has(edge));
  assert.equal(game.primers.size, primers);
  assert.equal(game.rewards.combo, 0);
});

test("Recruited clamp moves through corridors and synthesizes during ordinary play", () => {
  const game = createGame();
  game.buddy.active = true;
  game.phase = "playing";
  game.enzymes = [];
  for (let i = 0; i < 300; i++) tick(game, 1 / 60);
  assert.ok(game.coverage.covered.size > 0);
  assert.ok(
    game.maze.corridors.some(
      (p) => p.x === game.buddy.actor.position.x && p.y === game.buddy.actor.position.y,
    ),
  );
});

test("sliding clamp must appear and be collected before it helps", () => {
  const game = createGame();
  game.phase = "playing";
  game.enzymes = [];
  game.player.actor = createActor(game.buddy.actor.position);
  tick(game, 0);
  assert.equal(game.buddy.active, false);
  game.time = 5;
  tick(game, 0);
  assert.equal(game.buddy.active, true);
});

test("an uncollected clamp cannot rescue a collision", () => {
  const game = createGame();
  game.phase = "playing";
  game.enzymes[0].actor = createActor(game.player.actor.position);
  tick(game, 0);
  assert.equal(game.phase, "dying");
});

test("lowering difficulty applies its coverage goal to the current cycle", () => {
  const game = createGame();
  game.phase = "playing";
  game.difficulty = 5;
  const edges = [...game.maze.edges.keys()];
  for (const edge of edges.slice(0, Math.ceil(edges.length * 0.5))) markEdge(game.coverage, edge);
  tick(game, 0);
  assert.equal(game.phase, "playing");
  game.difficulty = 1;
  tick(game, 0);
  assert.equal(game.phase, "cycle_complete");
});
