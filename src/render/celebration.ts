const colors = ["#ffdc70", "#74efbd", "#f79cdc", "#64def3", "#ffad67"];

export function drawCelebration(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  remaining: number,
  reducedMotion: boolean,
): void {
  const elapsed = Math.max(0, 2 - remaining);
  context.save();
  if (!reducedMotion) {
    for (let burst = 0; burst < 5; burst++) {
      const age = elapsed - burst * 0.3;
      if (age < 0) continue;
      const originX = width * (burst % 2 ? 0.8 : 0.2);
      const originY = height * (0.35 + (burst % 3) * 0.1);
      for (let piece = 0; piece < 42; piece++) {
        const angle = piece * 2.39996 + burst;
        const speed = 55 + (piece % 9) * 14;
        const x = originX + Math.cos(angle) * speed * age;
        const y = originY + Math.sin(angle) * speed * age + 70 * age * age;
        context.save();
        context.translate(x, y);
        context.rotate(angle + age * (piece % 2 ? 5 : -5));
        context.globalAlpha = Math.min(1, Math.max(0, 2 - age));
        context.fillStyle = colors[piece % colors.length] ?? "#ffffff";
        context.fillRect(-3, -2, 6, 4);
        context.restore();
      }
    }
  }
  const bannerWidth = Math.min(width - 32, 340);
  context.fillStyle = "#09111fee";
  context.strokeStyle = "#ffdc70";
  context.lineWidth = 3;
  context.fillRect((width - bannerWidth) / 2, height * 0.42, bannerWidth, 68);
  context.strokeRect((width - bannerWidth) / 2, height * 0.42, bannerWidth, 68);
  context.textAlign = "center";
  context.fillStyle = "#ffdc70";
  context.font = "bold 24px system-ui";
  context.fillText("CYCLE COMPLETE!", width / 2, height * 0.42 + 30);
  context.fillStyle = "#ecf8ff";
  context.font = "14px system-ui";
  context.fillText("Beautiful synthesis.", width / 2, height * 0.42 + 52);
  context.restore();
}
