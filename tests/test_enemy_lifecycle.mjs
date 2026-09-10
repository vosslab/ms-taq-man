import test from "node:test";
import assert from "node:assert/strict";
import { createEnzymes, advanceEnzymes } from "../src/game/enzymes.ts";
import { createActor } from "../src/game/actor.ts";
import { mazeForCycle } from "../src/game/maze_layouts.ts";
import { levelForCycle } from "../src/game/level_table.ts";
import { tileKey } from "../src/game/coords.ts";
import { tile } from "../src/game/coords.ts";
import { parseMaze } from "../src/game/maze.ts";

test("mode changes reverse enemies at centers and between centers", () => {
  const maze = parseMaze(["#######", "#.....#", "#..P..#", "#.....#", "#######"]);
  for (const progress of [0, 0.25]) {
    const enemies = createEnzymes(maze).slice(0, 1);
    const enemy = enemies[0];
    enemy.actor = createActor(maze.start);
    enemy.actor.direction = "right";
    enemy.actor.queued = "right";
    enemy.actor.progress = progress;
    if (progress) enemy.actor.destination = tile(4, 2);
    advanceEnzymes(
      enemies,
      maze,
      createActor(tile(5, 2)),
      1,
      1 / 60,
      false,
      () => {},
      levelForCycle(1),
      "chase",
    );
    assert.equal(enemy.actor.direction, "left");
    assert.equal(enemy.mode, "chase");
  }
});

test("eaten enemies return, stop at the house, and leave after recovery", () => {
  for (const cycle of [1, 2, 3, 4]) {
    const maze = mazeForCycle(cycle);
    const enemies = createEnzymes(maze).slice(0, 1);
    const enemy = enemies[0];
    enemy.actor = createActor(maze.start);
    enemy.mode = "eaten";
    const player = createActor(maze.start);
    let time = 0;
    while (enemy.mode === "eaten" && time < 60) {
      time += 1 / 60;
      advanceEnzymes(
        enemies,
        maze,
        player,
        time,
        1 / 60,
        false,
        () => {},
        levelForCycle(cycle),
        "chase",
      );
    }
    assert.equal(tileKey(enemy.actor.position), tileKey(maze.house));
    assert.equal(enemy.actor.progress, 0);
    advanceEnzymes(
      enemies,
      maze,
      player,
      time + 1,
      1 / 60,
      false,
      () => {},
      levelForCycle(cycle),
      "chase",
    );
    assert.equal(enemy.actor.progress, 0);
    time += 2;
    for (let frame = 0; frame < 300; frame++) {
      time += 1 / 60;
      advanceEnzymes(
        enemies,
        maze,
        player,
        time,
        1 / 60,
        false,
        () => {},
        levelForCycle(cycle),
        "chase",
      );
    }
    assert.notEqual(tileKey(enemy.actor.position), tileKey(maze.house));
  }
});
