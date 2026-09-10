import type { JSX } from "solid-js";
import { For, Show } from "solid-js";
import { sprites } from "../art/sprites_generated";
import { reagentSprite } from "../render/sprite_atlas";
import type { GameSignals } from "./game_signals";

export function Hud(props: { signals: GameSignals; highScore: number }): JSX.Element {
  return (
    <>
      <p class="reward-message" aria-live="polite">
        {props.signals.rewardMessage()}
      </p>
      <div class="score-grid">
        <p class="stat bases-stat">
          Bases <output aria-label="Bases synthesized">{props.signals.bases()}</output>
        </p>

        <p class="stat score-stat">
          Score <output>{props.signals.score()}</output>
        </p>
        <p class="stat best-stat">
          Best <output aria-label="High score">{props.highScore}</output>
        </p>
      </div>
      <p class="run-status" role="status">
        {props.signals.status()}
      </p>
      <section class="progress-group" aria-label="Cycle goals">
        <label class="coverage-meter">
          Template{" "}
          <output aria-label="Template coverage">{props.signals.coverage().toFixed(1)}%</output> /{" "}
          {props.signals.coverageGoal()}%
          <progress
            max={props.signals.coverageGoal()}
            value={Math.min(props.signals.coverageGoal(), props.signals.coverage())}
            aria-label="Template synthesized"
          />
        </label>
        <p>
          <output aria-label="Primers remaining">{props.signals.primersLeft()}</output> primers left
          · {props.signals.extending() ? "Extending DNA" : "Find an RNA primer to extend"}
        </p>
        <p>Clear the cycle: synthesize {props.signals.coverageGoal()}% OR collect every primer.</p>
      </section>
      <section class="helper-group" aria-label="Helper and boosts">
        <div class="buddy-status" data-activity={props.signals.buddyActivity()}>
          <p>
            Buddy clamp <output>{props.signals.buddyStatus()}</output>
          </p>
          <progress
            max="100"
            value={props.signals.buddyMeter()}
            aria-label={`Buddy status: ${props.signals.buddyStatus()}`}
          />
        </div>
        <p class="dna-key">
          DNA: <span class="taq-key">Taq = green/blue</span>;{" "}
          <span class="clamp-key">clamp = violet/pink</span>;{" "}
          <span class="warning-key">yellow = enemy chew-back warning</span>.
        </p>
        <p aria-label="Active boosts">{props.signals.boosts()}</p>
        <p aria-label="Available reagent">{props.signals.reagent()}</p>
        <Show when={props.signals.collectedReagents().length > 0}>
          <div class="reagent-tray" aria-label="Collected reagents">
            <For each={props.signals.collectedReagents()}>
              {(name) => (
                <img
                  width="32"
                  height="32"
                  alt={name}
                  title={name}
                  src={`data:image/svg+xml,${encodeURIComponent(sprites[reagentSprite(name)])}`}
                />
              )}
            </For>
          </div>
        </Show>
        <p aria-label="Hot-start protection">
          Hot start:{" "}
          {props.signals.hotStart() > 0 ? `${props.signals.hotStart()} seconds` : "inactive"}
        </p>
      </section>
    </>
  );
}
