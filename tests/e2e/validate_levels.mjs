import assert from "node:assert/strict";
import { mazeForCycle } from "../../src/game/maze_layouts.ts";
import { walkable } from "../../src/game/maze.ts";
import { tile, tileKey } from "../../src/game/coords.ts";
import { routeDirection } from "../../src/game/routing.ts";

for (let cycle = 1; cycle <= 4; cycle++) {
  // Parsing rejects malformed rows, unknown cells, and disconnected corridors.
  const maze = mazeForCycle(cycle);
  for (let y = 0; y < maze.height - 1; y++) {
    for (let x = 0; x < maze.width - 1; x++) {
      const cells = [tile(x, y), tile(x + 1, y), tile(x, y + 1), tile(x + 1, y + 1)];
      assert.ok(!cells.every((p) => walkable(maze, p)), `Cycle ${cycle}: open room at ${x},${y}`);
    }
  }
  for (const point of [...maze.primers, ...maze.activators, maze.houseExit]) {
    assert.ok(
      tileKey(point) === tileKey(maze.start) || routeDirection(maze, maze.start, point, false),
      `Cycle ${cycle}: unreachable pickup/house exit at ${tileKey(point)}`,
    );
  }
  for (const point of maze.corridors) {
    assert.ok(
      routeDirection(maze, point, maze.house),
      `Cycle ${cycle}: enemy cannot return from ${tileKey(point)}`,
    );
  }
  assert.ok(
    [...maze.edges.values()].some((edge) => edge.tunnel),
    `Cycle ${cycle}: missing tunnel link`,
  );
  console.log(
    `Cycle ${cycle}: PASS - ${maze.corridors.length} corridor tiles, ${maze.edges.size} edges; narrow, connected, reachable`,
  );
}
