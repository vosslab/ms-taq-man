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
  const amplitude = 3.1 + 0.7 * Math.sin(phase);
  const bend = 1.8 * Math.cos(phase * 1.7);
  const overshoot = 1.2;
  function center(x: number): number {
    return bend * Math.sin((Math.max(0, Math.min(length, x)) / length) * Math.PI);
  }
  function offset(x: number): number {
    return amplitude * Math.sin((x / 24) * Math.PI * 2 + phase);
  }
  context.save();
  context.translate(ax, ay);
  context.rotate(Math.atan2(by - ay, bx - ax));
  context.lineWidth = 1.3;
  for (let x = 0; x <= length; x += 4) {
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
    context.lineWidth = 1.8;
    context.beginPath();
    for (let x = -overshoot; x <= length + overshoot; x++) {
      const y = center(x) + side * offset(x);
      if (x === -overshoot) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }
  context.restore();
}
