import { Match, Switch } from "solid-js";
import type { JSX } from "solid-js";
import type { Game } from "../game/game_state";

export function Overlays(props: {
  phase: Game["phase"];
  paused: boolean;
  timer: number;
}): JSX.Element {
  return (
    <section class="phase-panel" aria-label="Cycle guidance">
      <Switch>
        <Match when={props.paused}>
          <h2>Take a breath</h2>
          <p>Press Escape on the maze or use the Resume game button.</p>
        </Match>
        <Match when={props.phase === "attract"}>
          <h2>Ready to replicate?</h2>
          <p>
            Start a cycle, then steer with arrow keys or WASD. On touch screens, swipe the maze.
          </p>
        </Match>
        <Match when={props.phase === "ready"}>
          <h2>Find your first primer</h2>
          <p>Anneal, then leave a double helix behind you.</p>
        </Match>
        <Match when={props.phase === "dying"}>
          <h2>Polymerase denatured</h2>
          <p>Your synthesized DNA stays on the template.</p>
        </Match>
        <Match when={props.phase === "game_over"}>
          <h2>Reaction complete</h2>
          <p>Start another run to beat your best score.</p>
        </Match>
        <Match when={props.phase === "cycle_complete"}>
          <h2>Template amplified!</h2>
          <p>Preparing the next thermal cycle.</p>
        </Match>
        <Match when={props.phase === "intermission"}>
          <h2>Thermal cycling</h2>
          <ol class="thermal-stages">
            <li classList={{ active: props.timer > 2 }}>95°C · Denature</li>
            <li classList={{ active: props.timer <= 2 && props.timer > 1 }}>55°C · Anneal</li>
            <li classList={{ active: props.timer <= 1 }}>72°C · Extend</li>
          </ol>
          <progress max="3" value={3 - props.timer} aria-label="Thermal cycle progress" />
        </Match>
      </Switch>
    </section>
  );
}
