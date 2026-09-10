import test from "node:test";
import assert from "node:assert/strict";
import { parseMaze } from "../src/game/maze.ts";
import { createPlayer, advancePlayer } from "../src/game/player.ts";
import { tileKey } from "../src/game/coords.ts";
import { queueDirection, createActor, moveActor } from "../src/game/actor.ts";

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

test("returning from a partial reversal permits junction steering without an edge event", () => {
  const maze = parseMaze(["#####", "#...#", "#.P.#", "#####"]);
  const actor = createActor(maze.start);
  const edges = [];
  queueDirection(actor, "right");
  moveActor(actor, maze, 0.25, (from, to) => edges.push([from, to]));
  queueDirection(actor, "left");
  moveActor(
    actor,
    maze,
    0.5,
    (from, to) => edges.push([from, to]),
    false,
    () => {
      actor.queued = "up";
    },
  );
  assert.equal(actor.direction, "up");
  assert.equal(actor.progress, 0.25);
  assert.deepEqual(edges, []);
});

test("an early turn stays buffered until the junction and movement resumes from a wall", () => {
  const maze = parseMaze(["#######", "###...#", "#P..###", "#######"]);
  const player = createPlayer(maze);
  const primers = new Set(maze.primers.map(tileKey));
  queueDirection(player.actor, "right");
  advancePlayer(player, maze, primers, 0.25, () => {});
  queueDirection(player.actor, "up");
  advancePlayer(player, maze, primers, 2.75, () => {});
  assert.equal(tileKey(player.actor.position), "3,1");
  assert.equal(player.actor.destination, undefined);
  queueDirection(player.actor, "right");
  advancePlayer(player, maze, primers, 1, () => {});
  assert.equal(tileKey(player.actor.position), "4,1");
});
