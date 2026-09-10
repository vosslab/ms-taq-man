export function drawDeath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  remaining: number,
  reducedMotion: boolean,
): void {
  const elapsed = 2.8 - remaining;
  const unfold = Math.min(1, Math.max(0, (elapsed - 0.25) / 1.6));
  context.save();
  context.translate(x, y);
  context.globalAlpha = Math.min(1, remaining / 0.6);
  if (!reducedMotion) {
    context.strokeStyle = "#ffb46f";
    context.lineWidth = 2;
    context.globalAlpha *= Math.max(0, 1 - elapsed / 0.8);
    context.beginPath();
    context.arc(0, 0, 12 + elapsed * 32, 0, Math.PI * 2);
    context.stroke();
    context.globalAlpha = Math.min(1, remaining / 0.6);
  }
  context.lineWidth = 3;
  context.strokeStyle = "#ffce68";
  context.lineCap = "round";
  context.beginPath();
  for (let index = 0; index <= 100; index++) {
    const t = index / 100;
    const angle = t * Math.PI * 7;
    const radius = 5 + t * 7;
    const px = Math.cos(angle) * radius * (1 - unfold) + (t - 0.5) * 75 * unfold;
    const py =
      Math.sin(angle) * radius * (1 - unfold) + Math.sin(t * 22 + unfold * 3) * 10 * unfold;
    if (index === 0) context.moveTo(px, py);
    else context.lineTo(px, py);
  }
  context.stroke();
  context.restore();
}
