// Manual browser acceptance driver for the shipped game bundle.
// Selector contract: src/ui/app.tsx supplies Start cycle; the test-only bundle
// supplies window.__msTaqObserve without changing production source.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { build } from "esbuild";
import { solidPlugin } from "esbuild-plugin-solid";
import { REPO_ROOT } from "../repo_root.mjs";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:8791/";
const resultDirectory = path.join(REPO_ROOT, "test-results");
const keyFor = (position) => `${position.x},${position.y}`;
const arrows = { up: "ArrowUp", left: "ArrowLeft", down: "ArrowDown", right: "ArrowRight" };
const vectors = {
  up: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
  down: { x: 0, y: 1 },
  right: { x: 1, y: 0 },
};
const opposite = { up: "down", left: "right", down: "up", right: "left" };

function snapshotSource(source) {
  const needle = "export function createGame(): {";
  assert.ok(source.includes(needle), "test bundle could not find createGame() for observation");
  const observer = `
export function createGame() {
  const game = initialGame();
  if (!globalThis.__msTaqObserve) {
    globalThis.__msTaqObserve = () => Object.freeze({
      phase: game.phase, cycle: game.cycle, time: game.time, lives: game.lives, deathTimer: game.deathTimer,
      difficulty: game.difficulty,
      rows: [...game.maze.rows], width: game.maze.width, height: game.maze.height,
      edgeCount: game.maze.edges.size, primers: [...game.primers], activators: [...game.activators],
      player: { primed: game.player.primed, actor: structuredClone(game.player.actor) },
      buddy: { active: game.buddy.active, actor: structuredClone(game.buddy.actor) },
      enzymes: game.enzymes.map((enzyme) => ({ mode: enzyme.mode, actor: structuredClone(enzyme.actor) })),
      coverage: { covered: [...game.coverage.covered], seeds: [...game.coverage.seeds] },
      chewQueue: [...game.chewQueue], frightened: game.frightened,
      bonus: game.bonus ? { name: game.bonus.name, actor: structuredClone(game.bonus.actor) } : undefined,
      collectedReagents: [...game.collectedReagents], bonusSpawns: game.bonusSpawns,
    });
  }
  return game;
}`;
  return source.replace(needle, "function initialGame(): {") + observer;
}

async function testBundle() {
  const entry = path.join(REPO_ROOT, "src/main.tsx");
  const bundled = await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    write: false,
    plugins: [
      {
        name: "ms-taq-read-only-observer",
        setup(pluginBuild) {
          pluginBuild.onLoad({ filter: /game_state\.ts$/ }, async (args) => ({
            contents: snapshotSource(await readFile(args.path, "utf8")),
            loader: "ts",
          }));
        },
      },
      solidPlugin(),
    ],
  });
  const output = bundled.outputFiles[0];
  assert.ok(output, "esbuild did not produce a browser bundle");
  return output.text;
}

function mazeAt(game, position) {
  return game.rows[position.y]?.[position.x] ?? "#";
}

function neighbor(game, position, direction) {
  const vector = vectors[direction];
  let x = position.x + vector.x;
  const y = position.y + vector.y;
  if (x < 0 || x >= game.width) {
    if (mazeAt(game, position) !== "T") return undefined;
    x = (x + game.width) % game.width;
    if (mazeAt(game, { x, y }) !== "T") return undefined;
  }
  const cell = mazeAt(game, { x, y });
  return cell !== "#" && cell !== "H" && cell !== "-" ? { x, y } : undefined;
}

function route(game, start, targets, avoidEnemies = true) {
  const wanted = new Set(targets.map(keyFor));
  const enemyDistance = (position) =>
    game.enzymes
      .filter((enemy) => enemy.mode !== "eaten" && enemy.mode !== "frightened")
      .reduce(
        (nearest, enemy) =>
          Math.min(
            nearest,
            Math.hypot(
              Math.min(
                Math.abs(enemy.actor.position.x - position.x),
                game.width - Math.abs(enemy.actor.position.x - position.x),
              ),
              enemy.actor.position.y - position.y,
            ),
          ),
        Number.POSITIVE_INFINITY,
      );
  const queue = [{ position: start, first: undefined, distance: 0, risk: 0 }];
  const seen = new Set();
  while (queue.length) {
    queue.sort((a, b) => a.distance + a.risk - (b.distance + b.risk));
    const node = queue.shift();
    if (!node) break;
    const nodeKey = keyFor(node.position);
    if (seen.has(nodeKey)) continue;
    seen.add(nodeKey);
    if (node.first && wanted.has(nodeKey)) return node.first;
    for (const direction of Object.keys(vectors)) {
      const next = neighbor(game, node.position, direction);
      if (!next || seen.has(keyFor(next))) continue;
      const separation = enemyDistance(next);
      // Competent play treats an unfrightened enzyme's two-tile neighborhood as
      // a blocked corridor. If every route is close, retain it with a steep cost
      // rather than stranding Taq at a dead end.
      if (avoidEnemies && separation < 1.25 && !wanted.has(keyFor(next))) continue;
      const risk = avoidEnemies ? Math.max(0, 3 - separation) ** 2 * 30 : 0;
      queue.push({
        position: next,
        first: node.first ?? direction,
        distance: node.distance + 1,
        risk: node.risk + risk,
      });
    }
  }
  return avoidEnemies ? route(game, start, targets, false) : undefined;
}

function actorStart(actor) {
  return actor.destination ?? actor.position;
}

function actorLocation(game, actor) {
  const vector = vectors[actor.direction];
  return {
    x: (actor.position.x + vector.x * actor.progress + 0.5 + game.width) % game.width,
    y: actor.position.y + vector.y * actor.progress + 0.5,
  };
}

function closestEnzyme(game) {
  const player = actorLocation(game, game.player.actor);
  return game.enzymes
    .filter((enzyme) => enzyme.mode !== "eaten" && enzyme.mode !== "frightened")
    .reduce((nearest, enzyme) => {
      const enemy = actorLocation(game, enzyme.actor);
      const dx = Math.abs(player.x - enemy.x);
      return Math.min(nearest, Math.hypot(Math.min(dx, game.width - dx), player.y - enemy.y));
    }, Number.POSITIVE_INFINITY);
}

function emergencyReverse(game) {
  const player = actorLocation(game, game.player.actor);
  let nearest;
  for (const enzyme of game.enzymes) {
    if (enzyme.mode === "eaten" || enzyme.mode === "frightened") continue;
    const enemy = actorLocation(game, enzyme.actor);
    let dx = enemy.x - player.x;
    if (Math.abs(dx) > game.width / 2) dx -= Math.sign(dx) * game.width;
    const dy = enemy.y - player.y;
    const distance = Math.hypot(dx, dy);
    if (!nearest || distance < nearest.distance) nearest = { dx, dy, distance };
  }
  if (!nearest || nearest.distance >= 2.5) return undefined;
  const movement = vectors[game.player.actor.direction];
  // A hostile enzyme is closing from ahead on this corridor: reverse at once.
  // queueDirection supports this mid-edge turn, so this remains a normal arrow-key move.
  return movement.x * nearest.dx + movement.y * nearest.dy > 0
    ? opposite[game.player.actor.direction]
    : undefined;
}

function positionTargets(items) {
  return items.map((item) => {
    if (typeof item !== "string")
      throw new TypeError(`observer target must be a tile key string, received ${typeof item}`);
    const match = /^(\d+),(\d+)$/.exec(item);
    if (!match) throw new TypeError(`invalid observer tile key: ${item}`);
    const position = { x: Number(match[1]), y: Number(match[2]) };
    if (!Number.isFinite(position.x) || !Number.isFinite(position.y))
      throw new TypeError(`observer tile key did not produce finite coordinates: ${item}`);
    return position;
  });
}

async function observe(page) {
  return page.evaluate(() => window.__msTaqObserve?.());
}

async function pressDirection(page, game, direction) {
  if (direction) await page.keyboard.press(arrows[direction]);
}

async function main() {
  const bundle = await testBundle();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const diagnostics = [];
  page.on("pageerror", (error) => diagnostics.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") diagnostics.push(`console: ${message.text()}`);
  });
  await page.route("**/main.js*", async (routeRequest) => {
    await routeRequest.fulfill({ contentType: "application/javascript", body: bundle });
  });

  const events = {
    deaths: 0,
    primedAfterRespawn: false,
    reagentCollections: 0,
    chewRemovals: 0,
    chewReextensions: 0,
    cycles: [],
  };
  const cycleMetrics = new Map();
  const removedSeeds = new Map();
  let preceding = undefined;
  let lastProgress = "";
  try {
    await page.clock.install();
    await page.goto(baseUrl);
    await page.getByRole("slider", { name: "Difficulty", exact: true }).waitFor();
    await page.clock.pauseAt(new Date(Date.now() + 1_000));
    await page.getByRole("slider", { name: "Difficulty", exact: true }).focus();
    await page.keyboard.press("Home");
    await page.getByRole("button", { name: "Start cycle", exact: true }).click();
    let seekingDeath = true;
    let awaitingPrimer = false;
    let deathShot = false;
    const clearLimit = 15_000;
    const framesPerDecision = 6;
    for (let iteration = 0; iteration < clearLimit; iteration++) {
      const game = await observe(page);
      assert.ok(game, "test bundle did not provide a game snapshot");
      const target = [0, 50, 60, 70, 80, 90][game.difficulty];
      assert.ok(target, `unsupported observed difficulty: ${game.difficulty}`);
      const metrics = cycleMetrics.get(game.cycle) ?? {
        cycle: game.cycle,
        ticks: 0,
        deaths: 0,
        coverageHistory: [],
        nextCoverageSample: 0,
        thresholdAt: undefined,
        finalEdgeSeconds: undefined,
      };
      cycleMetrics.set(game.cycle, metrics);
      const elapsedSeconds = metrics.ticks / 60;
      const coveragePercent = (100 * game.coverage.covered.length) / game.edgeCount;
      if (elapsedSeconds >= metrics.nextCoverageSample) {
        metrics.coverageHistory.push({
          seconds: Math.round(elapsedSeconds * 10) / 10,
          coverage: Math.round(coveragePercent * 10) / 10,
        });
        metrics.nextCoverageSample += 5;
      }
      if (metrics.thresholdAt === undefined && coveragePercent >= target * 0.9)
        metrics.thresholdAt = elapsedSeconds;
      const progress = `${game.cycle}/${game.phase}`;
      if (progress !== lastProgress || iteration % 600 === 0) {
        console.log(
          JSON.stringify({
            driver: "progress",
            decisions: iteration,
            simulatedSeconds: Math.round(game.time * 10) / 10,
            cycle: game.cycle,
            phase: game.phase,
            lives: game.lives,
            primers: game.primers.length,
            coverage: Math.round((100 * game.coverage.covered.length) / game.edgeCount),
            deaths: events.deaths,
            reagents: events.reagentCollections,
            chewRemovals: events.chewRemovals,
            chewReextensions: events.chewReextensions,
          }),
        );
        lastProgress = progress;
      }
      if (preceding?.phase === "playing" && game.phase === "dying") {
        events.deaths++;
        metrics.deaths++;
      }
      if (
        !deathShot &&
        game.phase === "dying" &&
        game.deathTimer <= 1.5 &&
        game.deathTimer >= 1.2
      ) {
        await page.screenshot({
          path: path.join(resultDirectory, "browser_mid_death.png"),
          fullPage: true,
        });
        deathShot = true;
      }
      if (preceding?.phase === "dying" && game.phase === "playing") {
        assert.equal(game.player.primed, false, "respawn must reset this cycle's extension state");
        awaitingPrimer = true;
      }
      if (awaitingPrimer && game.player.primed) {
        events.primedAfterRespawn = true;
        awaitingPrimer = false;
      }
      if (preceding && preceding.cycle === game.cycle) {
        const oldCoverage = new Set(preceding.coverage.covered);
        const newCoverage = new Set(game.coverage.covered);
        for (const edge of oldCoverage) {
          if (!newCoverage.has(edge)) {
            events.chewRemovals++;
            removedSeeds.set(edge, preceding.coverage.seeds.find(([id]) => id === edge)?.[1]);
          }
        }
        for (const edge of newCoverage) {
          if (!oldCoverage.has(edge) && removedSeeds.has(edge)) {
            const former = removedSeeds.get(edge);
            const current = game.coverage.seeds.find(([id]) => id === edge)?.[1];
            if (former !== current) {
              events.chewReextensions++;
              removedSeeds.delete(edge);
            }
          }
        }
        events.reagentCollections += Math.max(
          0,
          game.collectedReagents.length - preceding.collectedReagents.length,
        );
      } else if (preceding) {
        removedSeeds.clear();
      }
      if (game.phase === "cycle_complete") {
        const already = events.cycles.some((cycle) => cycle.cycle === game.cycle);
        if (!already && game.cycle <= 4) {
          events.cycles.push({
            cycle: game.cycle,
            controlledSeconds: Math.round(elapsedSeconds * 10) / 10,
            coverage: Math.round((100 * game.coverage.covered.length) / game.edgeCount),
            primersLeft: game.primers.length,
            lives: game.lives,
            reagents: game.collectedReagents.length,
            chewRemovals: events.chewRemovals,
            chewReextensions: events.chewReextensions,
            deaths: metrics.deaths,
            coverageHistory: metrics.coverageHistory,
            finalEdgeSeconds:
              metrics.thresholdAt === undefined
                ? undefined
                : Math.round((elapsedSeconds - metrics.thresholdAt) * 10) / 10,
          });
          await page.screenshot({
            path: path.join(resultDirectory, `browser_cycle_${game.cycle}.png`),
            fullPage: true,
          });
        }
      }
      if (game.cycle >= 5) break;
      if (game.phase === "game_over")
        throw new Error(
          `run reached game over before cycle 5: ${JSON.stringify({
            cycle: game.cycle,
            simulatedTime: game.time,
            lives: game.lives,
            primers: game.primers.length,
            deaths: events.deaths,
          })}`,
        );
      if (game.phase === "playing") {
        const player = actorStart(game.player.actor);
        let direction = seekingDeath ? undefined : emergencyReverse(game);
        if (seekingDeath) {
          direction = route(
            game,
            player,
            game.enzymes.map((enemy) => enemy.actor.position),
            false,
          );
        } else if (!direction && awaitingPrimer) {
          direction = route(game, player, [
            ...positionTargets(game.primers),
            ...positionTargets(game.activators),
          ]);
        } else if (!direction && events.reagentCollections === 0 && game.bonus) {
          direction = route(game, player, [game.bonus.actor.position]);
        } else if (!direction) {
          const reextension = [...removedSeeds.keys()].flatMap((edge) =>
            edge.split(":").map((part) => {
              const [x, y] = part.split(",").map(Number);
              return { x, y };
            }),
          );
          const activators = positionTargets(game.activators);
          // Take an available activator before a long unprotected collection
          // route. This is the same deliberate safety choice a capable arcade
          // player makes: it buys a frightened window, then resumes collection.
          const threatened = closestEnzyme(game) < 4;
          const helperPickup =
            !game.buddy.active && game.time >= 5 ? [game.buddy.actor.position] : [];
          direction = route(
            game,
            player,
            helperPickup.length > 0
              ? helperPickup
              : game.frightened <= 0 && activators.length > 0 && threatened
                ? activators
                : [
                    ...(events.chewReextensions === 0 ? reextension : []),
                    ...positionTargets(game.primers),
                    ...activators,
                  ],
          );
        }
        await pressDirection(page, game, direction);
      }
      if (events.deaths) seekingDeath = false;
      preceding = game;
      // With enemies nearby, take a fresh keyboard decision every 60 Hz tick.
      // In an empty corridor, six exact ticks avoid needless browser round trips.
      const decisionFrames = closestEnzyme(game) < 5 ? 1 : framesPerDecision;
      for (let frame = 0; frame < decisionFrames; frame++) {
        await page.clock.runFor(1000 / 60);
        metrics.ticks++;
      }
    }
    assert.equal(events.cycles.length, 4, "ordinary keyboard movement must clear cycles 1-4");
    assert.ok(events.deaths >= 1, "must observe one ordinary enemy death");
    assert.ok(events.primedAfterRespawn, "respawn must later collect a primer and become primed");
    assert.ok(events.reagentCollections >= 1, "must collect a moving reagent bonus");
    assert.ok(events.chewRemovals >= 1, "must observe enemy chew-back removing coverage");
    assert.ok(events.chewReextensions >= 1, "must observe ordinary re-extension of a chewed edge");
    assert.deepEqual(diagnostics, [], `browser diagnostics:\n${diagnostics.join("\n")}`);
    console.log(JSON.stringify({ simulated: true, ...events }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
