import { tick } from "../game/game_state";
import type { Game } from "../game/game_state";

// Rendering and UI publication happen once after all fixed simulation steps.
export function startGameLoop(game: Game, publish: () => void): () => void {
  let previous = performance.now();
  let accumulator = 0;
  let frame = 0;
  let stopped = false;
  function animate(now: number): void {
    if (stopped) return;
    accumulator += Math.max(0, Math.min(0.1, (now - previous) / 1000));
    previous = now;
    while (accumulator >= 1 / 60) {
      tick(game, 1 / 60);
      accumulator -= 1 / 60;
    }
    publish();
    if (!stopped) frame = requestAnimationFrame(animate);
  }
  frame = requestAnimationFrame(animate);
  return (): void => {
    stopped = true;
    cancelAnimationFrame(frame);
  };
}
