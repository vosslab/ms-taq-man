import type { Enzyme } from "../game/enzymes";
import { vectors } from "../game/coords";

// Motion stays centered on the collision position; simulation time freezes on pause.
export function drawEnemy(
  context: CanvasRenderingContext2D,
  sprite: CanvasImageSource,
  enzyme: Enzyme,
  time: number,
  reducedMotion: boolean,
): void {
  context.save();
  if (!reducedMotion) {
    const phase = time * 9 + { exo: 0, dimer: 1.7, chelate: 3.2, rnase: 4.8 }[enzyme.name];
    const wave = Math.sin(phase);
    if (enzyme.mode === "eaten") {
      const heading = vectors[enzyme.actor.direction];
      context.strokeStyle = "#c6f3ff";
      context.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const trail = 12 + i * 3 + ((time * 18) % 3);
        context.globalAlpha = 0.5 - i * 0.12;
        context.beginPath();
        context.moveTo(-heading.x * trail + heading.y * 3, -heading.y * trail - heading.x * 3);
        context.lineTo(-heading.x * (trail + 3), -heading.y * (trail + 3));
        context.stroke();
      }
      context.globalAlpha = 1;
      context.scale(1 + wave * 0.04, 1 - wave * 0.04);
    } else if (enzyme.mode === "frightened") {
      context.rotate(Math.sin(time * 24) * 0.09);
      context.scale(1 + wave * 0.09, 1 - wave * 0.09);
    } else {
      switch (enzyme.name) {
        case "exo": {
          const snap = Math.max(0, Math.sin(phase * 0.8)) ** 6;
          context.scale(1 + snap * 0.16, 1 - snap * 0.12);
          context.rotate(wave * 0.055);
          break;
        }
        case "dimer":
          context.transform(1, wave * 0.07, Math.cos(phase) * 0.14, 1, 0, 0);
          context.scale(1 - wave * 0.07, 1 + wave * 0.09);
          break;
        case "chelate":
          context.strokeStyle = "#64def3";
          context.globalAlpha = 0.25 + 0.15 * wave;
          context.lineWidth = 1;
          context.beginPath();
          context.arc(0, 0, 14 + wave * 1.5, phase * 0.2, phase * 0.2 + Math.PI * 1.5);
          context.stroke();
          context.globalAlpha = 1;
          context.scale(1 + wave * 0.07, 1 + wave * 0.07);
          break;
        case "rnase":
          context.rotate(wave * 0.13);
          context.scale(1 + wave * 0.1, 1 - wave * 0.1);
          break;
      }
    }
  }
  context.drawImage(sprite, -13, -13, 26, 26);
  context.restore();
}
