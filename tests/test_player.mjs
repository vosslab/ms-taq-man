import test from "node:test";
import assert from "node:assert/strict";
import { parseMaze } from "../src/game/maze.ts";
import { createPlayer, advancePlayer } from "../src/game/player.ts";
import { tileKey } from "../src/game/coords.ts";
import { queueDirection } from "../src/game/actor.ts";

test("primer arms extension only after arrival and walls stop movement", () => {
  const maze = parseMaze(["######", "#P.  #", "######"]);
  const player = createPlayer(maze);
  const primers = new Set(maze.primers.map(tileKey));
  const edges = [];
  queueDirection(player.actor, "right");
  advancePlayer(player, maze, primers, 1, (id) => edges.push(id));
  assert.deepEqual(edges, []);
  advancePlayer(player, maze, primers, 10, (id) => edges.push(id));
  assert.equal(player.actor.position.x, 4);
  assert.equal(edges.length, 2);
});

test("a partial corridor reversal does not synthesize an entire edge", () => {
  const maze = parseMaze(["######", "#P.  #", "######"]);
  const player = createPlayer(maze);
  player.primed = true;
  const edges = [];
  queueDirection(player.actor, "right");
  advancePlayer(player, maze, new Set(), 0.4, (id) => edges.push(id));
  queueDirection(player.actor, "left");
  advancePlayer(player, maze, new Set(), 0.4, (id) => edges.push(id));
  assert.deepEqual(edges, []);
  queueDirection(player.actor, "right");
  advancePlayer(player, maze, new Set(), 1, (id) => edges.push(id));
  assert.equal(edges.length, 1);
});
