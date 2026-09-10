export function drawHelix(
  context: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): void {
  const length = Math.hypot(bx - ax, by - ay);
  context.save();
  context.translate(ax, ay);
  context.rotate(Math.atan2(by - ay, bx - ax));
  context.lineWidth = 1.3;
  for (let x = 0; x <= length; x += 4) {
    const offset = 3.5 * Math.sin((x / 24) * Math.PI * 2);
    context.strokeStyle = "#bddbb7";
    context.beginPath();
    context.moveTo(x, offset);
    context.lineTo(x, -offset);
    context.stroke();
  }
  for (const side of [-1, 1]) {
    context.strokeStyle = side === 1 ? "#65efbb" : "#84bfff";
    context.lineWidth = 1.8;
    context.beginPath();
    for (let x = 0; x <= length; x++) {
      const y = side * 3.5 * Math.sin((x / 24) * Math.PI * 2);
      if (x === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }
  context.restore();
}
