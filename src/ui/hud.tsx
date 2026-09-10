import type { JSX } from "solid-js";
import type { GameSignals } from "./game_signals";

export function Hud(props: { signals: GameSignals; highScore: number }): JSX.Element {
  return (
    <>
      <p class="reward-message" aria-live="polite">
        {props.signals.rewardMessage()}
      </p>
      <p>
        Bases <output aria-label="Bases synthesized">{props.signals.bases()}</output>
      </p>
      <p role="status">{props.signals.status()}</p>
      <p>
        Score {props.signals.score()} · Best{" "}
        <output aria-label="High score">{props.highScore}</output>
      </p>
      <label class="coverage-meter">
        Template{" "}
        <output aria-label="Template coverage">{props.signals.coverage().toFixed(1)}%</output> / 50%
        <progress
          max="50"
          value={Math.min(50, props.signals.coverage())}
          aria-label="Template synthesized"
        />
      </label>
      <p>
        <output aria-label="Primers remaining">{props.signals.primersLeft()}</output> primers left ·{" "}
        {props.signals.extending() ? "Extending DNA" : "Find an RNA primer to extend"}
      </p>
      <p>Clear the cycle: synthesize 50% OR collect every primer.</p>
      <p aria-label="Active boosts">{props.signals.boosts()}</p>
      <p aria-label="Hot-start protection">
        Hot start:{" "}
        {props.signals.hotStart() > 0 ? `${props.signals.hotStart()} seconds` : "inactive"}
      </p>
    </>
  );
}
