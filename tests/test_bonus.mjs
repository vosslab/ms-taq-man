import test from "node:test";
import assert from "node:assert/strict";
import { createBonus, advanceBonus } from "../src/game/bonus.ts";
import { mazeForCycle } from "../src/game/maze_layouts.ts";
import { createActor } from "../src/game/actor.ts";
import { tileKey } from "../src/game/coords.ts";
test("reagents enter and eventually exit all four mazes", () => {
  for (const cycle of [1, 2, 3, 4]) {
    const maze = mazeForCycle(cycle);
    const bonus = createBonus(maze, cycle);
    assert.equal(bonus.actor.position.x, 0);
    for (let frame = 0; frame < 6000 && !bonus.finished; frame++) advanceBonus(bonus, maze, 1 / 60);
    assert.equal(bonus.finished, true);
  }
});

test("exiting reagents reach the tunnel from every corridor and stop there", () => {
  for (const cycle of [1, 2, 3, 4]) {
    const maze = mazeForCycle(cycle);
    const exit = maze.corridors.find((position) => position.x === maze.width - 1);
    assert.ok(exit);
    for (const start of maze.corridors) {
      const bonus = createBonus(maze, cycle);
      bonus.actor = createActor(start);
      bonus.age = 12;
      advanceBonus(bonus, maze, maze.corridors.length);
      assert.equal(bonus.finished, true, `cycle ${cycle}, start ${tileKey(start)}`);
      assert.equal(tileKey(bonus.actor.position), tileKey(exit));
      assert.equal(bonus.actor.destination, undefined);
      advanceBonus(bonus, maze, 1);
      assert.equal(tileKey(bonus.actor.position), tileKey(exit));
    }
  }
});

test("reagents tour upper and lower interior corridors before exiting", () => {
  for (const cycle of [1, 2, 3, 4]) {
    const maze = mazeForCycle(cycle);
    const bonus = createBonus(maze, cycle);
    const visited = new Set();
    let upper = false;
    let lower = false;
    for (let frame = 0; frame < 2400; frame++) {
      advanceBonus(bonus, maze, 1 / 60);
      const position = bonus.actor.position;
      visited.add(tileKey(position));
      upper ||= position.y < maze.height / 3 && position.x > maze.width / 3;
      lower ||= position.y > (maze.height * 2) / 3 && position.x > maze.width / 3;
    }
    assert.ok(visited.size > 30, `cycle ${cycle} remained near its entry`);
    assert.ok(upper && lower, `cycle ${cycle} did not tour both halves`);
  }
});
