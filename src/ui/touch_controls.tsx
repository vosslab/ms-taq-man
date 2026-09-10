import type { JSX } from "solid-js";
import type { Direction } from "../game/coords";
export function TouchControls(props: {
  move: (direction: Direction) => void;
  pause: () => void;
}): JSX.Element {
  return (
    <nav class="touch-controls" aria-label="Movement controls">
      <button class="up" aria-label="Move up" onClick={() => props.move("up")}>
        ▲
      </button>
      <button class="left" aria-label="Move left" onClick={() => props.move("left")}>
        ◀
      </button>
      <button class="pause" aria-label="Pause or resume" onClick={() => props.pause()}>
        Ⅱ
      </button>
      <button class="right" aria-label="Move right" onClick={() => props.move("right")}>
        ▶
      </button>
      <button class="down" aria-label="Move down" onClick={() => props.move("down")}>
        ▼
      </button>
    </nav>
  );
}
