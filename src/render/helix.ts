export type StrandColors = { primary: string; secondary: string; rungs: string };
export const defaultStrandColors: StrandColors = {
  primary: "#65efbb",
  secondary: "#84bfff",
  rungs: "#bddbb7",
};

export function drawHelix(
  context: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  phase = 0,
  colors: StrandColors = defaultStrandColors,
): void {
  const length = Math.hypot(bx - ax, by - ay);
  if (length === 0) return;
  // `phase` originates from the deterministic edge seed.  All variation remains
  // below one quarter of a tile, so a filled nest never hides a corridor choice.
  // Deterministic edge-level variation keeps a completed board from reading
  // as one repeated ladder while preserving a narrow, corridor-safe envelope.
  const amplitude = 2.5 + 1.5 * (0.5 + 0.5 * Math.sin(phase * 1.73));
  const wavelength = 13 + 10 * (0.5 + 0.5 * Math.cos(phase * 2.11));
  const bend = 2.1 * Math.sin(phase * 0.91);
  const skew = 0.8 * Math.cos(phase * 2.67);
  const rungCadence = 3.8 + 1.3 * (0.5 + 0.5 * Math.sin(phase * 3.41));
  const overshoot = 2.25;
  function center(x: number): number {
    const fraction = Math.max(0, Math.min(1, x / length));
    return bend * Math.sin(fraction * Math.PI) + skew * (fraction - 0.5);
  }
  function offset(x: number): number {
    return amplitude * Math.sin((x / wavelength) * Math.PI * 2 + phase);
  }
  context.save();
  context.translate(ax, ay);
  context.rotate(Math.atan2(by - ay, bx - ax));
  context.lineWidth = 1.15;
  for (let x = 1.5; x < length; x += rungCadence) {
    const middle = center(x);
    const twist = offset(x);
    context.strokeStyle = colors.rungs;
    context.beginPath();
    context.moveTo(x, middle + twist);
    context.lineTo(x, middle - twist);
    context.stroke();
  }
  for (const side of [-1, 1]) {
    context.strokeStyle = side === 1 ? colors.primary : colors.secondary;
    context.lineWidth = 1.95;
    context.beginPath();
    for (let x = -overshoot; x <= length + overshoot; x += 1.25) {
      const y = center(x) + side * offset(x);
      if (x === -overshoot) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }
  context.restore();
}
