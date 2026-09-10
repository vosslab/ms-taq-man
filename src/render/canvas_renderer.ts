import { actorLocation } from "../game/actor";
import { tileKey } from "../game/coords";
import { paintMaze } from "./maze_painter";
import { loadSprites } from "./sprite_atlas";
import { createStrandLayer } from "./strand_layer";
import { drawDeath } from "./animation";
import type { Game } from "../game/game_state";
export function createRenderer(
  canvas: HTMLCanvasElement,
  game: Readonly<Game>,
): { draw: () => void; dispose: () => void } {
  const atlas = loadSprites();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const strands = createStrandLayer();
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable");
  let maze = game.maze;
  const layer = document.createElement("canvas");
  layer.width = maze.width * 24;
  layer.height = maze.height * 24;
  const layerContext = layer.getContext("2d");
  if (!layerContext) throw new Error("Maze layer is unavailable");
  const backbone = getComputedStyle(document.documentElement).getPropertyValue("--color-backbone");
  paintMaze(layerContext, maze, 24, backbone);
  function resize(): void {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    context?.clearRect(0, 0, canvas.width, canvas.height);
    context?.drawImage(layer, 0, 0, canvas.width, canvas.height);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  function draw(): void {
    if (!context) return;
    if (maze !== game.maze) {
      maze = game.maze;
      if (layerContext) paintMaze(layerContext, maze, 24, backbone);
    }
    context.setTransform(canvas.width / layer.width, 0, 0, canvas.height / layer.height, 0, 0);
    context.clearRect(0, 0, layer.width, layer.height);
    context.drawImage(layer, 0, 0);
    strands.paint(context, maze, game.coverage);
    if (game.phase === "playing" && game.time - game.lastProgressTime > 15) {
      context.save();
      context.strokeStyle = "#fff1a3";
      context.globalAlpha = 0.35 + 0.25 * Math.sin(game.time * 3);
      context.lineWidth = 2;
      context.setLineDash([3, 5]);
      for (const edge of maze.edges.values()) {
        if (game.coverage.covered.has(edge.id) || edge.tunnel) continue;
        context.beginPath();
        context.moveTo((edge.a.x + 0.5) * 24, (edge.a.y + 0.5) * 24);
        context.lineTo((edge.b.x + 0.5) * 24, (edge.b.y + 0.5) * 24);
        context.stroke();
      }
      context.restore();
    }
    context.fillStyle = "#ffdc70";
    for (const primer of maze.primers) {
      const sprite = atlas.get("primer");
      if (game.primers.has(tileKey(primer)) && sprite?.complete && sprite.naturalWidth)
        context.drawImage(sprite, (primer.x + 0.5) * 24 - 9, (primer.y + 0.5) * 24 - 4.5, 18, 9);
    }
    const location = actorLocation(game.player.actor, maze);
    for (const activator of maze.activators) {
      if (!game.activators.has(tileKey(activator))) continue;
      context.beginPath();
      context.arc((activator.x + 0.5) * 24, (activator.y + 0.5) * 24, 6, 0, Math.PI * 2);
      context.fill();
    }
    const taq = atlas.get("taq_man");
    if (game.phase === "dying") {
      drawDeath(context, location.x * 24, location.y * 24, game.deathTimer, reducedMotion.matches);
    } else if (taq?.complete && taq.naturalWidth) {
      context.save();
      context.translate(location.x * 24, location.y * 24);
      const angle = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
      context.rotate(angle[game.player.actor.direction]);
      context.drawImage(taq, -14, -14, 28, 28);
      context.restore();
    }
    const enzymeColors = {
      exo: "#ff657d",
      dimer: "#f79cdc",
      chelate: "#64def3",
      rnase: "#ffad67",
    };
    for (const enzyme of game.enzymes) {
      const enemy = actorLocation(enzyme.actor, maze);
      const sprite = atlas.get(enzyme.name);
      if (sprite?.complete && sprite.naturalWidth && enzyme.mode !== "eaten") {
        context.save();
        if (enzyme.mode === "frightened") {
          const expiring = game.frightened < 2;
          const flash =
            expiring && !reducedMotion.matches && Math.floor(game.frightened * 4) % 2 === 0;
          context.filter = flash
            ? "brightness(0) invert(1)"
            : "grayscale(1) sepia(1) hue-rotate(160deg) saturate(3)";
          if (expiring && reducedMotion.matches) {
            context.strokeStyle = "#fff0a0";
            context.lineWidth = 2;
            context.strokeRect(enemy.x * 24 - 14, enemy.y * 24 - 14, 28, 28);
          }
        }
        context.drawImage(sprite, enemy.x * 24 - 13, enemy.y * 24 - 13, 26, 26);
        context.restore();
        continue;
      }
      context.fillStyle =
        enzyme.mode === "eaten"
          ? "#ffffff"
          : enzyme.mode === "frightened"
            ? "#5b75ff"
            : enzymeColors[enzyme.name];
      context.beginPath();
      context.arc(enemy.x * 24, enemy.y * 24, enzyme.mode === "eaten" ? 4 : 9, 0, Math.PI * 2);
      context.fill();
    }
    if (game.bonus) {
      const reagent = actorLocation(game.bonus.actor, maze);
      const bonusSprite = atlas.get("reagent_magnesium");
      if (bonusSprite?.complete && bonusSprite.naturalWidth)
        context.drawImage(bonusSprite, reagent.x * 24 - 14, reagent.y * 24 - 14, 28, 28);
    }
  }
  return { draw, dispose: () => observer.disconnect() };
}
