import { coverageTarget } from "../game/difficulty";
import { buddyActivity } from "../game/buddy";
import type { BuddyActivity } from "../game/buddy";
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
  buddyActivity: BuddyActivity;
  buddyStatus: string;
  buddyMeter: number;
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
  const [buddyActivitySignal, setBuddyActivity] = createSignal<BuddyActivity>("arriving");
  const [buddyStatus, setBuddyStatus] = createSignal("");
  const [buddyMeter, setBuddyMeter] = createSignal(0);
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
      const activity = buddyActivity(game.buddy);
      const buddyDisplay = describeBuddy(activity, game);
      setBuddyActivity(activity);
      setBuddyStatus(buddyDisplay.label);
      setBuddyMeter(buddyDisplay.meter);
      setBoosts(
        [
          game.rewards.combo >= 8
            ? `Synthesis x${Math.min(4, 1 + Math.floor(game.rewards.combo / 8))}`
            : "",
          game.rewards.speedTimer > 0 ? `Speed ${Math.ceil(game.rewards.speedTimer)}s` : "",
          game.rewards.shieldTimer > 0 ? `DNA shield ${Math.ceil(game.rewards.shieldTimer)}s` : "",
        ]
          .filter(Boolean)
          .join(" · "),
      );
      const phaseLabel: Record<Game["phase"], string> = {
        attract: "Ready to start",
        ready: "Get ready",
        playing: "Replicating",
        dying: "Refolding",
        game_over: "Run complete",
        cycle_complete: "Cycle complete",
        intermission: "Thermal cycling",
      };
      const copies = copyNumber(game.cycle - 1);
      setStatus(
        game.paused
          ? "Paused - Escape to resume"
          : game.phase === "intermission"
            ? thermal
            : game.phase === "dying"
              ? "ENZYME DENATURED - refolding for another run"
              : `Cycle ${game.cycle} - ${phaseLabel[game.phase]} - ${game.lives} ${game.lives === 1 ? "life" : "lives"} - ${copies} ${copies === "1" ? "copy" : "copies"}`,
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
    buddyActivity: buddyActivitySignal,
    buddyStatus,
    buddyMeter,
    collectedReagents,
    push,
  };
}

function describeBuddy(
  activity: BuddyActivity,
  game: Readonly<Game>,
): { label: string; meter: number } {
  switch (activity) {
    case "arriving":
      return game.time < 5
        ? { label: "Clamp arriving", meter: Math.min(100, (game.time / 5) * 100) }
        : { label: "Collect the clamp", meter: 100 };
    case "building":
      return { label: "Building violet DNA", meter: 100 };
    case "repairing":
      return { label: "Repairing DNA to violet", meter: 100 };
    case "shielding":
      return { label: "Shielding Taq", meter: (game.buddy.protection / 3) * 100 };
    case "distracting":
      return { label: "Distracting Exo", meter: (game.buddy.distraction / 4) * 100 };
    case "recharging":
      return { label: "Rescue recharging", meter: (1 - game.buddy.rescueTimer / 20) * 100 };
    case "following":
      return { label: "Following Taq", meter: 100 };
  }
}
