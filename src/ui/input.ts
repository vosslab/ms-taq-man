import type { Direction } from "../game/coords";
export function attachSwipe(
  canvas: HTMLCanvasElement,
  move: (direction: Direction) => void,
): () => void {
  let start: { x: number; y: number; id: number } | undefined;
  function down(event: PointerEvent): void {
    start = { x: event.clientX, y: event.clientY, id: event.pointerId };
    canvas.setPointerCapture(event.pointerId);
  }
  function drag(event: PointerEvent): void {
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.hypot(dx, dy) < 14) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
    start = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }
  function end(): void {
    start = undefined;
  }
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", drag);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  return () => {
    canvas.removeEventListener("pointerdown", down);
    canvas.removeEventListener("pointermove", drag);
    canvas.removeEventListener("pointerup", end);
    canvas.removeEventListener("pointercancel", end);
  };
}
