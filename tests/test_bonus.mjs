import test from "node:test";
import assert from "node:assert/strict";
import { createBonus, advanceBonus } from "../src/game/bonus.ts";
import { mazeForCycle } from "../src/game/maze_layouts.ts";
test("reagents enter and eventually exit all four mazes", () => {
  for (const cycle of [1, 2, 3, 4]) {
    const maze = mazeForCycle(cycle);
    const bonus = createBonus(maze, cycle);
    assert.equal(bonus.actor.position.x, 0);
    for (let frame = 0; frame < 6000 && !bonus.finished; frame++) advanceBonus(bonus, maze, 1 / 60);
    assert.equal(bonus.finished, true);
  }
});
