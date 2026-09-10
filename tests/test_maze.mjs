import test from "node:test";
import assert from "node:assert/strict";
import { parseMaze, neighbor, walkable } from "../src/game/maze.ts";
import { edgeId, tile, directions, opposite } from "../src/game/coords.ts";
import { firstMaze, mazeForCycle } from "../src/game/maze_layouts.ts";

test("four connected templates rotate back to the first maze", () => {
  const layouts = [1, 2, 3, 4].map(mazeForCycle);
  assert.equal(new Set(layouts.map((maze) => maze.rows.join("\n"))).size, 4);
  assert.deepEqual(mazeForCycle(5).rows, layouts[0].rows);
});

test("corridor edges are bidirectional including tunnel wrap", () => {
  const maze = parseMaze(["#####", "T.P.T", "#####"]);
  for (const position of maze.corridors) {
    for (const direction of directions) {
      const next = neighbor(maze, position, direction);
      if (!next) continue;
      assert.deepEqual(neighbor(maze, next, opposite[direction]), position);
      assert.ok(maze.edges.has(edgeId(position, next)));
    }
  }
  assert.deepEqual(neighbor(maze, tile(0, 1), "left"), tile(4, 1));
});
test("walls and house are excluded from the template graph", () => {
  const maze = firstMaze();
  for (const edge of maze.edges.values()) {
    assert.ok(walkable(maze, edge.a) && walkable(maze, edge.b));
  }
  assert.equal(walkable(maze, maze.house), false);
});

test("production mazes have narrow corridors without open two-by-two rooms", () => {
  for (let cycle = 1; cycle <= 4; cycle++) {
    const maze = mazeForCycle(cycle);
    for (let y = 0; y < maze.height - 1; y++) {
      for (let x = 0; x < maze.width - 1; x++) {
        const room = [
          [x, y],
          [x + 1, y],
          [x, y + 1],
          [x + 1, y + 1],
        ].every(([a, b]) => walkable(maze, tile(a, b)));
        assert.equal(room, false, `Open room in cycle ${cycle} at ${x},${y}`);
      }
    }
  }
});
