import { coverageTarget } from "../game/difficulty";
import { batch, createSignal } from "solid-js";
import type { Accessor } from "solid-js";
import type { Game } from "../game/game_state";
import { coveragePercent } from "../game/coverage";
import { copyNumber } from "../game/score";
import { reagentDescription } from "../game/bonus";

type HudValues = {
  phase: Game["phase"];
  paused: boolean;
  transitionTimer: number;
  bases: number;
  status: string;
  score: number;
  coverage: number;
  coverageGoal: number;
  primersLeft: number;
  extending: boolean;
  hotStart: number;
  boosts: string;
  rewardMessage: string;
  reagent: string;
  collectedReagents: readonly string[];
};
export type GameSignals = { [Key in keyof HudValues]: Accessor<HudValues[Key]> } & {
  push: (game: Readonly<Game>) => void;
};

export function createGameSignals(initial: Readonly<Game>): GameSignals {
  const [phase, setPhase] = createSignal(initial.phase);
  const [paused, setPaused] = createSignal(initial.paused);
  const [transitionTimer, setTransitionTimer] = createSignal(initial.transitionTimer);
  const [bases, setBases] = createSignal(0);
  const [status, setStatus] = createSignal("");
  const [score, setScore] = createSignal(0);
  const [coverageGoal, setCoverageGoal] = createSignal(coverageTarget(initial.difficulty));
  const [coverage, setCoverage] = createSignal(0);
  const [primersLeft, setPrimersLeft] = createSignal(initial.primers.size);
  const [extending, setExtending] = createSignal(initial.player.primed);
  const [hotStart, setHotStart] = createSignal(0);
  const [boosts, setBoosts] = createSignal("");
  const [rewardMessage, setRewardMessage] = createSignal("");
  const [reagent, setReagent] = createSignal("");
  const [collectedReagents, setCollectedReagents] = createSignal<readonly string[]>([]);

  function push(game: Readonly<Game>): void {
    const thermal =
      game.transitionTimer > 2
        ? "95C DENATURE"
        : game.transitionTimer > 1
          ? "55C ANNEAL"
          : "72C EXTEND";
    batch(() => {
      setPhase(game.phase);
      setPaused(game.paused);
      setTransitionTimer(game.transitionTimer);
      setBases(game.completedBases + game.coverage.bases);
      setScore(game.completedBases + game.coverage.bases + game.bonusScore);
      setCoverageGoal(coverageTarget(game.difficulty));
      setCoverage(coveragePercent(game.coverage, game.maze.edges.size));
      setPrimersLeft(game.primers.size);
      setExtending(game.player.primed);
      setHotStart(Math.ceil(game.frightened));
      setCollectedReagents(game.collectedReagents);
      setReagent(game.bonus ? `${game.bonus.name}: ${reagentDescription(game.bonus.name)}` : "");
      setRewardMessage(game.rewards.messageTimer > 0 ? game.rewards.message : "");
      setBoosts(
        [
          game.buddy.protection > 0
            ? `Clamp shield ${Math.ceil(game.buddy.protection)}s - enemies cannot hurt you`
            : !game.buddy.active
              ? game.time < 5
                ? "Sliding clamp arriving soon"
                : "Collect the mint protein ring to recruit your helper"
              : game.buddy.rescueTimer > 0
                ? `Clamp rescue recharges in ${Math.ceil(game.buddy.rescueTimer)}s`
                : "Clamp rescue ready",
          game.rewards.combo >= 8
            ? `Synthesis x${Math.min(4, 1 + Math.floor(game.rewards.combo / 8))}`
            : "",
          game.rewards.speedTimer > 0 ? `Speed ${Math.ceil(game.rewards.speedTimer)}s` : "",
          game.rewards.shieldTimer > 0 ? `DNA shield ${Math.ceil(game.rewards.shieldTimer)}s` : "",
        ]
          .filter(Boolean)
          .join(" · "),
      );
      setStatus(
        game.paused
          ? "Paused - Escape to resume"
          : game.phase === "intermission"
            ? thermal
            : game.phase === "dying"
              ? "ENZYME DENATURED - refolding for another run"
              : `Cycle ${game.cycle} - ${game.phase} - ${game.lives} lives - ${copyNumber(game.cycle - 1)} copies`,
      );
    });
  }
  push(initial);
  return {
    phase,
    paused,
    transitionTimer,
    bases,
    status,
    score,
    coverage,
    coverageGoal,
    primersLeft,
    extending,
    hotStart,
    boosts,
    rewardMessage,
    reagent,
    collectedReagents,
    push,
  };
}
