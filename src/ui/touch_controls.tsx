import type { JSX } from "solid-js";
import type { Direction } from "../game/coords";
export function TouchControls(props: {
  move: (direction: Direction) => void;
  pause: () => void;
}): JSX.Element {
  return (
    <nav class="touch-controls" aria-label="Movement controls">
      <button class="up" aria-label="Move up" onClick={() => props.move("up")}>
        &#9650;
      </button>
      <button class="left" aria-label="Move left" onClick={() => props.move("left")}>
        &#9664;
      </button>
      <button class="pause" aria-label="Pause or resume" onClick={() => props.pause()}>
        &#8545;
      </button>
      <button class="right" aria-label="Move right" onClick={() => props.move("right")}>
        &#9654;
      </button>
      <button class="down" aria-label="Move down" onClick={() => props.move("down")}>
        &#9660;
      </button>
    </nav>
  );
}
