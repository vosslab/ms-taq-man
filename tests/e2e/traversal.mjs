import { routeDirection } from "../../src/game/routing.ts";
import assert from "node:assert/strict";
import { createGame, startGame, nextCycle, tick, recordEvent } from "../../src/game/game_state.ts";
import { directions, tileKey, opposite } from "../../src/game/coords.ts";
import { neighbor } from "../../src/game/maze.ts";
function choose(game, start) {
  const queue = [{ p: start, first: undefined, d: 0 }];
  const seen = new Set([tileKey(start)]);
  let best;
  let score = Infinity;
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    const key = tileKey(node.p);
    if (node.first && (game.primers.has(key) || game.activators.has(key))) {
      const danger =
        game.frightened > 0
          ? 0
          : game.enzymes
              .filter((e) => e.mode !== "eaten")
              .reduce(
                (n, e) =>
                  n +
                  Math.max(
                    0,
                    5 - Math.hypot(e.actor.position.x - node.p.x, e.actor.position.y - node.p.y),
                  ) *
                    2,
                0,
              );
      const value = node.d + danger - (game.activators.has(key) ? 3 : 0);
      if (value < score) {
        score = value;
        best = node.first;
      }
    }
    for (const dir of directions) {
      const p = neighbor(game.maze, node.p, dir);
      if (!p || seen.has(tileKey(p))) continue;
      seen.add(tileKey(p));
      queue.push({ p, first: node.first ?? dir, d: node.d + 1 });
    }
  }
  return best;
}
for (const difficulty of [1, 2])
  for (let cycle = 1; cycle <= 4; cycle++) {
    const g = createGame();
    while (g.cycle < cycle) nextCycle(g);
    g.difficulty = difficulty;
    g.phase = "playing";
    let steps = 0;
    let rescues = 0;
    let previous = 0;
    for (; steps < 60 * 180 && g.phase !== "cycle_complete" && g.phase !== "game_over"; steps++) {
      if (g.phase === "playing") {
        const a = g.player.actor;
        const start = a.destination ?? a.position;
        const direction = choose(g, start);
        if (direction && (!a.destination || direction !== opposite[a.direction]))
          recordEvent(g, { type: "direction", direction });
      }
      tick(g, 1 / 60);
      if (g.buddy.rescueTimer > previous) rescues++;
      previous = g.buddy.rescueTimer;
    }
    assert.equal(
      g.phase,
      "cycle_complete",
      `Cycle ${cycle} at difficulty ${difficulty} must clear through movement`,
    );
    console.log(
      JSON.stringify({
        difficulty,
        cycle,
        phase: g.phase,
        seconds: Math.round(steps / 60),
        lives: g.lives,
        coverage: Math.round((100 * g.coverage.covered.size) / g.maze.edges.size),
        primers: g.primers.size,
        rescues,
        clampCollected: g.buddy.active,
      }),
    );
  }

// Keep one live run through celebrations, thermal phases, and maze rotation.
const run = createGame();
startGame(run);
const completed = new Set();
const phases = new Set();
let elapsed = 0;
for (; elapsed < 60 * 240 && run.cycle < 5 && run.phase !== "game_over"; elapsed++) {
  phases.add(run.phase);
  if (run.phase === "cycle_complete") completed.add(run.cycle);
  if (run.phase === "playing") {
    const actor = run.player.actor;
    const direction = choose(run, actor.destination ?? actor.position);
    if (direction && (!actor.destination || direction !== opposite[actor.direction]))
      recordEvent(run, { type: "direction", direction });
  }
  tick(run, 1 / 60);
}
assert.deepEqual([...completed], [1, 2, 3, 4]);
assert.ok(phases.has("ready") && phases.has("intermission"));
assert.ok(run.completedBases > 0 && run.cycle === 5);
console.log(
  JSON.stringify({
    continuousRun: true,
    cycle: run.cycle,
    seconds: Math.round(elapsed / 60),
    lives: run.lives,
    completedBases: run.completedBases,
  }),
);

// Recruit the optional helper by walking to it after it appears.
for (let cycle = 1; cycle <= 4; cycle++) {
  const game = createGame();
  while (game.cycle < cycle) nextCycle(game);
  game.phase = "playing";
  let steps = 0;
  for (; steps < 60 * 30 && !game.buddy.active && game.phase !== "game_over"; steps++) {
    if (game.phase === "playing" && game.time >= 5) {
      const actor = game.player.actor;
      const direction = routeDirection(
        game.maze,
        actor.destination ?? actor.position,
        game.buddy.actor.position,
        false,
      );
      if (direction && (!actor.destination || direction !== opposite[actor.direction]))
        recordEvent(game, { type: "direction", direction });
    }
    tick(game, 1 / 60);
  }
  assert.ok(game.buddy.active, `Clamp must be reachable through movement in cycle ${cycle}`);
  console.log(
    JSON.stringify({ clampPickupCycle: cycle, seconds: Math.round(steps / 60), lives: game.lives }),
  );
}
