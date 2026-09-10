import test from "node:test";
import assert from "node:assert/strict";
import { createEnzymes, advanceEnzymes } from "../src/game/enzymes.ts";
import { actorLocation, createActor } from "../src/game/actor.ts";
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

test("all enzymes hold in the house, then cross the exit on their release schedule", () => {
  const maze = mazeForCycle(1);
  const player = createActor(maze.start);
  const enzymes = createEnzymes(maze);
  const releaseStates = new Map();
  const exitArrival = new Map();
  const frame = 1 / 60;

  for (const enzyme of enzymes) {
    assert.deepEqual(
      {
        position: tileKey(enzyme.actor.position),
        destination: enzyme.actor.destination,
        progress: enzyme.actor.progress,
      },
      { position: tileKey(maze.house), destination: undefined, progress: 0 },
    );
  }

  for (let tick = 0; tick <= 16 * 60; tick++) {
    const time = tick * frame;
    for (const enzyme of enzymes) {
      if (enzyme.release > 0 && Math.abs(time - (enzyme.release - frame)) < 1e-9) {
        releaseStates.set(enzyme.name, {
          position: tileKey(enzyme.actor.position),
          destination: enzyme.actor.destination,
          progress: enzyme.actor.progress,
        });
      }
    }
    advanceEnzymes(
      enzymes,
      maze,
      player,
      time,
      frame,
      false,
      () => {},
      levelForCycle(1),
      "scatter",
    );
    for (const enzyme of enzymes) {
      if (tileKey(enzyme.actor.position) === tileKey(maze.houseExit)) {
        exitArrival.set(enzyme.name, exitArrival.get(enzyme.name) ?? time);
      }
    }
  }

  releaseStates.set(enzymes[0].name, {
    position: tileKey(maze.house),
    destination: undefined,
    progress: 0,
  });
  for (const enzyme of enzymes) {
    const state = releaseStates.get(enzyme.name);
    assert.deepEqual(state, {
      position: tileKey(maze.house),
      destination: undefined,
      progress: 0,
    });
  }
  for (const enzyme of enzymes) {
    assert.ok(
      exitArrival.get(enzyme.name) >= enzyme.release,
      `${enzyme.name} reaches the corridor through the house exit after release`,
    );
  }
});

test("hot-start entry and expiry reverse an enzyme mid-edge while it moves", () => {
  const maze = parseMaze(["#######", "#.....#", "#..P..#", "#.....#", "#######"]);
  const enemy = createEnzymes(maze)[0];
  assert.ok(enemy);
  enemy.actor = createActor(maze.start);
  enemy.actor.direction = "right";
  enemy.actor.queued = "right";
  enemy.actor.destination = tile(4, 2);
  enemy.actor.progress = 0.25;
  enemy.mode = "chase";
  const enemies = [enemy];
  const player = createActor(tile(5, 2));
  const beforeEntry = actorLocation(enemy.actor, maze).x;
  advanceEnzymes(enemies, maze, player, 1, 1 / 60, true, () => {}, levelForCycle(1), "chase");
  const afterEntry = actorLocation(enemy.actor, maze).x;
  assert.equal(enemy.actor.direction, "left");
  assert.equal(enemy.mode, "frightened");
  assert.ok(afterEntry < beforeEntry, "frightened entry moves back along the active edge");
  const beforeExpiry = afterEntry;
  advanceEnzymes(enemies, maze, player, 2, 1 / 60, false, () => {}, levelForCycle(1), "chase");
  const afterExpiry = actorLocation(enemy.actor, maze).x;
  assert.equal(enemy.actor.direction, "right");
  assert.equal(enemy.mode, "chase");
  assert.ok(afterExpiry > beforeExpiry, "frightened expiry moves forward along the active edge");
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

test("tunnels slow live enemies but preserve returning-eye speed", () => {
  function progress(row, mode) {
    const maze = parseMaze(["#####", row, "#####"]);
    const enemies = createEnzymes(maze).slice(0, 1);
    const enemy = enemies[0];
    enemy.mode = mode;
    enemy.actor = createActor(tile(0, 1));
    enemy.actor.direction = "right";
    enemy.actor.queued = "right";
    enemy.actor.destination = tile(1, 1);
    advanceEnzymes(
      enemies,
      maze,
      createActor(maze.start),
      1,
      0.01,
      false,
      () => {},
      levelForCycle(1),
      "chase",
    );
    return enemy.actor.progress;
  }
  assert.ok(progress("T.P.T", "chase") < progress("..P..", "chase"));
  assert.equal(progress("T.P.T", "eaten"), progress("..P..", "eaten"));
});
