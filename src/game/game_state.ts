import { createBuddy, advanceBuddy } from "./buddy";
import { actorLocation, queueDirection } from "./actor";
import { advanceEnzymes, createEnzymes } from "./enzymes";
import { tileKey } from "./coords";
import type { Direction, EdgeId } from "./coords";
import { createCoverage, degradeEdge, markEdge, reinforceEdge } from "./coverage";
import { enzymePoints } from "./score";
import { firstMaze, mazeForCycle } from "./maze_layouts";
import { advancePlayer, createPlayer } from "./player";
import { levelForCycle, placePrimers } from "./level_table";
import { advanceBonus, createBonus } from "./bonus";
import type { Bonus } from "./bonus";
import { waveMode } from "./waves";
import { enemySpeedMultiplier, coverageTarget } from "./difficulty";
import { createRewards, advanceRewards, synthesisReward, announce } from "./arcade_rewards";

export type GameEvent =
  | { type: "extend"; edge: EdgeId }
  | { type: "buddy_extend"; edge: EdgeId }
  | { type: "direction"; direction: Direction }
  | { type: "bonus"; points: number }
  | { type: "capture_enzyme" };
export function createGame(): {
  buddy: ReturnType<typeof createBuddy>;
  collectedReagents: string[];
  difficulty: number;
  rewards: ReturnType<typeof createRewards>;
  maze: ReturnType<typeof firstMaze>;
  player: ReturnType<typeof createPlayer>;
  coverage: ReturnType<typeof createCoverage>;
  primers: Set<string>;
  enzymes: ReturnType<typeof createEnzymes>;
  lives: number;
  deathTimer: number;
  activators: Set<string>;
  frightened: number;
  chain: number;
  bonusScore: number;
  extraLifeAwarded: boolean;
  lastProgressTime: number;
  bonus: Bonus | undefined;
  bonusSpawns: number;
  cycle: number;
  completedBases: number;
  transitionTimer: number;
  chewQueue: Map<EdgeId, number>;
  phase:
    "attract" | "ready" | "playing" | "dying" | "game_over" | "cycle_complete" | "intermission";
  paused: boolean;
  time: number;
  waveTime: number;
} {
  const maze = firstMaze();
  return {
    buddy: createBuddy(maze),
    collectedReagents: [],
    difficulty: 2,
    rewards: createRewards(),
    maze,
    player: createPlayer(maze),
    coverage: createCoverage(),
    primers: placePrimers(maze, levelForCycle(1).primerCount),
    enzymes: createEnzymes(maze),
    lives: 3,
    deathTimer: 0,
    activators: new Set(maze.activators.map(tileKey)),
    frightened: 0,
    chain: 0,
    bonusScore: 0,
    extraLifeAwarded: false,
    lastProgressTime: 0,
    bonus: undefined,
    bonusSpawns: 0,
    cycle: 1,
    completedBases: 0,
    transitionTimer: 0,
    chewQueue: new Map(),
    phase: "attract",
    paused: false,
    time: 0,
    waveTime: 0,
  };
}
export type Game = ReturnType<typeof createGame>;
export function startGame(game: Game): void {
  if (game.phase !== "attract" && game.phase !== "game_over") return;
  Object.assign(game, createGame(), { difficulty: game.difficulty });
  game.phase = "ready";
  game.transitionTimer = 1;
}
export function nextCycle(game: Game): void {
  game.rewards = createRewards();
  game.completedBases += game.coverage.bases;
  game.cycle++;
  game.bonus = undefined;
  game.bonusSpawns = 0;
  game.maze = mazeForCycle(game.cycle);
  game.coverage = createCoverage();
  game.player = createPlayer(game.maze);
  game.buddy = createBuddy(game.maze);
  game.enzymes = createEnzymes(game.maze);
  game.primers = placePrimers(game.maze, levelForCycle(game.cycle).primerCount);
  game.activators = new Set(game.maze.activators.map(tileKey));
  game.chewQueue.clear();
  game.frightened = 0;
  game.chain = 0;
  game.time = 0;
  game.lastProgressTime = 0;
  game.waveTime = 0;
  game.phase = "ready";
  game.transitionTimer = 1;
}
export function recordEvent(game: Game, event: GameEvent): void {
  if (event.type === "direction") queueDirection(game.player.actor, event.direction);
  else if (event.type === "bonus") game.bonusScore += event.points;
  else if (event.type === "capture_enzyme") {
    const points = enzymePoints(game.chain++);
    announce(game.rewards, `TAQ ATTACK! +${points}`);
    game.bonusScore += points;
  } else if (markEdge(game.coverage, event.edge, event.type === "buddy_extend")) {
    game.lastProgressTime = game.time;
    if (event.type === "extend") game.bonusScore += synthesisReward(game.rewards);
  }
  if (event.type !== "direction") awardExtraLife(game);
}
function awardExtraLife(game: Game): void {
  if (
    !game.extraLifeAwarded &&
    game.completedBases + game.coverage.bases + game.bonusScore >= 10000
  ) {
    game.lives++;
    game.extraLifeAwarded = true;
    announce(game.rewards, "EXTRA POLYMERASE! +1 LIFE");
  }
}
export function tick(game: Game, seconds: number): void {
  const level = levelForCycle(game.cycle);
  if (game.paused) return;
  if (game.phase === "ready" || game.phase === "cycle_complete" || game.phase === "intermission") {
    game.transitionTimer -= seconds;
    if (game.transitionTimer <= 0) {
      if (game.phase === "ready") game.phase = "playing";
      else if (game.phase === "cycle_complete") {
        game.phase = "intermission";
        game.transitionTimer = 3;
      } else nextCycle(game);
    }
    return;
  }
  if (game.phase === "dying") {
    game.deathTimer -= seconds;
    if (game.deathTimer <= 0) {
      const retained = game.player.primed && level.retainExtension;
      game.player = createPlayer(game.maze);
      game.player.primed = retained;
      if (!retained && game.primers.size === 0)
        game.primers = placePrimers(game.maze, level.primerCount);
      game.enzymes = createEnzymes(game.maze);
      game.time = 0;
      game.lastProgressTime = 0;
      game.waveTime = 0;
      game.frightened = 0;
      game.chewQueue.clear();
      game.phase = game.lives > 0 ? "playing" : "game_over";
    }
    return;
  }
  if (game.phase !== "playing" || game.paused) return;
  game.time += seconds;
  advanceRewards(game.rewards, seconds);
  awardExtraLife(game);
  if (game.frightened <= 0) game.waveTime += seconds;
  game.frightened = Math.max(0, game.frightened - seconds);
  advancePlayer(
    game.player,
    game.maze,
    game.primers,
    seconds * level.playerSpeed * (game.rewards.speedTimer > 0 ? 1.2 : 1),
    (edge) => recordEvent(game, { type: "extend", edge }),
  );
  if (!game.buddy.active && game.time >= 5) {
    const playerPosition = actorLocation(game.player.actor, game.maze);
    const pickup = actorLocation(game.buddy.actor, game.maze);
    const dx = Math.abs(playerPosition.x - pickup.x);
    if (Math.hypot(Math.min(dx, game.maze.width - dx), playerPosition.y - pickup.y) < 0.7) {
      game.buddy.active = true;
      announce(game.rewards, "CLAMP LOADED! Helper recruited");
    }
  }
  advanceBuddy(game.buddy, game.maze, game.player.actor, seconds, (edge) => {
    const repairingChewedDNA = game.chewQueue.delete(edge);
    if (!game.coverage.covered.has(edge)) {
      game.buddy.lastBuilt = edge;
      game.buddy.buildGlow = 1.2;
      game.buddy.lastAction = repairingChewedDNA ? "repairing" : "building";
      game.buddy.actionTimer = 1.2;
      announce(
        game.rewards,
        repairingChewedDNA ? "CLAMP REPAIRED DNA +10 bases" : "CLAMP BUILT DNA +10 bases",
      );
      recordEvent(game, { type: "buddy_extend", edge });
    } else if (reinforceEdge(game.coverage, edge)) {
      game.buddy.lastBuilt = edge;
      game.buddy.buildGlow = 1.2;
      game.buddy.lastAction = "repairing";
      game.buddy.actionTimer = 1.2;
      announce(game.rewards, "CLAMP REPAIRED DNA - violet strand reinforced");
    }
  });
  // Reaching either goal completes the player's turn before enemies can undo it.
  if (
    game.coverage.covered.size * 100 >= game.maze.edges.size * coverageTarget(game.difficulty) ||
    game.primers.size === 0
  ) {
    game.phase = "cycle_complete";
    game.transitionTimer = 2;
    return;
  }
  if (game.activators.delete(tileKey(game.player.actor.position))) {
    announce(game.rewards, "TAQ ATTACK!");
    game.frightened = level.frightened;
    game.chain = 0;
  }
  advanceEnzymes(
    game.enzymes,
    game.maze,
    game.player.actor,
    game.time,
    seconds,
    game.frightened > 0,
    (edge) => {
      if (
        game.rewards.shieldTimer <= 0 &&
        game.coverage.covered.has(edge) &&
        !game.chewQueue.has(edge)
      )
        game.chewQueue.set(edge, game.time + level.chewDelay);
    },
    level,
    waveMode(game.waveTime, game.cycle),
    enemySpeedMultiplier(game.difficulty),
    game.buddy.distraction > 0 &&
      Math.hypot(
        game.buddy.actor.position.x - game.player.actor.position.x,
        game.buddy.actor.position.y - game.player.actor.position.y,
      ) > 4
      ? game.buddy.actor.position
      : undefined,
  );
  for (const [edge, due] of game.chewQueue) {
    if (due <= game.time) {
      degradeEdge(game.coverage, edge);
      game.chewQueue.delete(edge);
    }
  }
  const player = actorLocation(game.player.actor, game.maze);
  if (!game.bonus && game.bonusSpawns < 2 && game.time >= 15 + game.bonusSpawns * 30) {
    game.bonus = createBonus(game.maze, game.cycle);
    game.bonusSpawns++;
  }
  if (game.bonus) {
    advanceBonus(game.bonus, game.maze, seconds);
    const reagent = actorLocation(game.bonus.actor, game.maze);
    const reagentDx = Math.abs(player.x - reagent.x);
    if (Math.hypot(Math.min(reagentDx, game.maze.width - reagentDx), player.y - reagent.y) < 0.7) {
      const name = game.bonus.name;
      game.collectedReagents = [...game.collectedReagents.slice(-6), name];
      announce(game.rewards, `${name.toUpperCase()} BOOST!`);
      if (name === "Mg2+") game.frightened = Math.max(game.frightened, 4);
      if (name === "dNTP mix") recordEvent(game, { type: "bonus", points: 500 });
      if (name === "BSA") {
        game.rewards.shieldTimer = 10;
        game.chewQueue.clear();
      }
      if (name === "DMSO") game.rewards.speedTimer = 8;
      if (name === "betaine") {
        game.rewards.combo = 24;
        game.rewards.comboTimer = 10;
      }
      if (name === "hot-start antibody") game.frightened = Math.max(game.frightened, 10);
      if (name === "glycerol") {
        game.rewards.speedTimer = 5;
        game.rewards.shieldTimer = 5;
        game.chewQueue.clear();
      }
      recordEvent(game, { type: "bonus", points: game.bonus.points });
      game.bonus = undefined;
    } else if (game.bonus.finished) game.bonus = undefined;
  }
  for (const enzyme of game.enzymes) {
    const enemy = actorLocation(enzyme.actor, game.maze);
    const dx = Math.abs(player.x - enemy.x);
    if (Math.hypot(Math.min(dx, game.maze.width - dx), player.y - enemy.y) < 0.65) {
      if (enzyme.mode === "eaten") continue;
      if (enzyme.mode === "frightened" || game.frightened > 0) {
        recordEvent(game, { type: "capture_enzyme" });
        enzyme.mode = "eaten";
        continue;
      }
      if (game.buddy.protection > 0) continue;
      if (game.buddy.active && game.buddy.rescueTimer <= 0) {
        game.buddy.rescueTimer = 20;
        game.buddy.protection = 3;
        announce(game.rewards, "CLAMP SHIELD! Pass through enemies for 3s");
        continue;
      }
      game.lives--;
      game.rewards = createRewards();
      game.deathTimer = 2.8;
      game.phase = "dying";
      return;
    }
  }
}
