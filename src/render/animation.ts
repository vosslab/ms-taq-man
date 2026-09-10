export function drawDeath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  remaining: number,
  reducedMotion: boolean,
  denaturedTaq?: CanvasImageSource,
): void {
  const elapsed = 2.8 - remaining;
  const unfold = Math.min(1, Math.max(0, (elapsed - 0.25) / 1.6));
  context.save();
  context.translate(x, y);
  context.globalAlpha = Math.min(1, remaining / 0.6);
  if (reducedMotion) {
    if (denaturedTaq) context.drawImage(denaturedTaq, -14, -14, 28, 28);
    context.strokeStyle = "#ffce68";
    context.lineWidth = 3;
    context.beginPath();
    for (let i = 0; i <= 40; i++) {
      const px = i - 20;
      const py = Math.sin(i * 0.6) * 8;
      if (i === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    }
    context.stroke();
    context.restore();
    return;
  }
  const burst = Math.max(0, elapsed - 0.15);
  if (denaturedTaq) {
    const sourceFade = Math.max(0, 1 - elapsed / 0.78);
    context.save();
    context.globalAlpha *= sourceFade;
    context.rotate(-elapsed * 4.2);
    const sourceScale = 1 + elapsed * 1.8;
    context.scale(sourceScale, sourceScale);
    context.drawImage(denaturedTaq, -18, -18, 36, 36);
    context.restore();
  }
  for (let i = 0; i < 24; i++) {
    const angle = i * 2.39996;
    const distance = burst * (28 + (i % 5) * 12);
    context.save();
    context.translate(Math.cos(angle) * distance, Math.sin(angle) * distance + burst * burst * 12);
    context.rotate(angle + burst * (i % 2 ? 5 : -5));
    context.fillStyle = ["#ffce68", "#ff657d", "#74efbd"][i % 3] ?? "#ffffff";
    context.fillRect(-3, -2, 6 * Math.max(0.2, 1 - burst / 3), 4);
    context.restore();
  }
  context.rotate(elapsed * elapsed * 2.4);
  const zoom = 1 + unfold * unfold * 7;
  context.scale(zoom, zoom);
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
