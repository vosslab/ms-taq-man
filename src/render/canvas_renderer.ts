import type { ReadOnly } from "../game/read_only";
import { drawEnemy } from "./enemy_animation";
import { actorLocation } from "../game/actor";
import { tileKey } from "../game/coords";
import { paintMaze } from "./maze_painter";
import { loadSprites, reagentSprite } from "./sprite_atlas";
import { createStrandLayer } from "./strand_layer";
import { drawDeath } from "./animation";
import { drawCelebration } from "./celebration";
import type { Game } from "../game/game_state";
export function createRenderer(
  canvas: HTMLCanvasElement,
  game: ReadOnly<Game>,
): { draw: () => void; dispose: () => void } {
  const atlas = loadSprites();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const style = getComputedStyle(document.documentElement);
  const strands = createStrandLayer({
    primary: style.getPropertyValue("--color-strand").trim(),
    secondary: style.getPropertyValue("--color-strand-secondary").trim(),
    rungs: style.getPropertyValue("--color-strand-rungs").trim(),
  });
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable");
  let maze = game.maze;
  const layer = document.createElement("canvas");
  layer.width = maze.width * 24;
  layer.height = maze.height * 24;
  const deathBoard = document.createElement("canvas");
  deathBoard.width = layer.width;
  deathBoard.height = layer.height;
  const deathInk = deathBoard.getContext("2d");
  const layerContext = layer.getContext("2d");
  if (!layerContext) throw new Error("Maze layer is unavailable");
  const backbone = style.getPropertyValue("--color-backbone");
  paintMaze(layerContext, maze, 24, backbone);
  function resize(): void {
    const ratio = window.devicePixelRatio || 1;
    atlas.resize(ratio);
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
    context.save();
    if (game.phase === "cycle_complete") {
      const hue = reducedMotion.matches ? 45 : Math.floor((2 - game.transitionTimer) * 3) * 65;
      context.filter = `hue-rotate(${hue}deg) brightness(1.3)`;
    }
    context.drawImage(layer, 0, 0);
    context.restore();
    if (game.phase === "attract") {
      const backdrop = atlas.get("helix_backdrop");
      if (backdrop) context.drawImage(backdrop, 0, 0, layer.width, layer.height);
    }
    strands.paint(context, maze, game.coverage, game.time, reducedMotion.matches);
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
      if (game.primers.has(tileKey(primer)) && sprite) {
        const pulse = reducedMotion.matches
          ? 1
          : 1 + 0.12 * Math.sin(game.time * 3 + primer.x + primer.y);
        context.drawImage(
          sprite,
          (primer.x + 0.5) * 24 - 9 * pulse,
          (primer.y + 0.5) * 24 - 4.5 * pulse,
          18 * pulse,
          9 * pulse,
        );
      }
    }
    if (game.buddy.buildGlow > 0 && game.buddy.lastBuilt) {
      const edge = maze.edges.get(game.buddy.lastBuilt);
      if (edge) {
        context.save();
        context.globalAlpha = Math.min(1, game.buddy.buildGlow);
        context.strokeStyle = "#f2fff4";
        context.lineWidth = 5;
        context.beginPath();
        if (edge.tunnel) {
          for (const end of [edge.a, edge.b]) {
            context.moveTo((end.x + 0.5) * 24, (end.y + 0.5) * 24);
            context.lineTo(end.x === 0 ? 0 : layer.width, (end.y + 0.5) * 24);
          }
        } else {
          context.moveTo((edge.a.x + 0.5) * 24, (edge.a.y + 0.5) * 24);
          context.lineTo((edge.b.x + 0.5) * 24, (edge.b.y + 0.5) * 24);
        }
        context.stroke();
        context.restore();
      }
    }
    const buddy = actorLocation(game.buddy.actor, maze);
    const buddySprite = atlas.get("buddy");
    if (buddySprite && game.phase !== "attract" && (game.buddy.active || game.time >= 5)) {
      context.save();
      if (!game.buddy.active || game.buddy.distraction > 0) {
        context.strokeStyle = "#9cf0ce";
        context.lineWidth = 2;
        context.beginPath();
        context.arc(buddy.x * 24, buddy.y * 24, 14, 0, Math.PI * 2);
        context.stroke();
      }
      context.drawImage(buddySprite, buddy.x * 24 - 10, buddy.y * 24 - 10, 20, 20);
      context.restore();
    }
    const location = actorLocation(game.player.actor, maze);
    if (game.buddy.protection > 0) {
      context.save();
      context.strokeStyle = "#9cf0ce";
      context.lineWidth = 3;
      context.beginPath();
      context.arc(location.x * 24, location.y * 24, 17, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    }
    for (const activator of maze.activators) {
      if (!game.activators.has(tileKey(activator))) continue;
      const power = atlas.get("hot_start");
      if (power)
        context.drawImage(
          power,
          (activator.x + 0.5) * 24 - 9,
          (activator.y + 0.5) * 24 - 9,
          18,
          18,
        );
    }
    const closing =
      !reducedMotion.matches &&
      game.player.actor.destination !== undefined &&
      Math.floor(game.time * 8) % 2 === 1;
    const taq = atlas.get(closing ? "taq_man_closed" : "taq_man");
    if (game.phase !== "dying" && taq) {
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
      const sprite = atlas.get(
        enzyme.mode === "eaten"
          ? "eaten_eyes"
          : enzyme.mode === "frightened"
            ? "frightened"
            : enzyme.name,
        enzyme.actor.direction,
      );
      if (sprite) {
        context.save();
        if (enzyme.mode === "frightened") {
          const expiring = game.frightened < 2;
          const flash =
            expiring && !reducedMotion.matches && Math.floor(game.frightened * 4) % 2 === 0;
          context.filter = flash ? "brightness(0) invert(1)" : "none";
          if (expiring && reducedMotion.matches) {
            context.strokeStyle = "#fff0a0";
            context.lineWidth = 2;
            context.strokeRect(enemy.x * 24 - 14, enemy.y * 24 - 14, 28, 28);
          }
        }
        context.translate(enemy.x * 24, enemy.y * 24);
        drawEnemy(context, sprite, enzyme, game.time, reducedMotion.matches);
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
      const bonusSprite = atlas.get(reagentSprite(game.bonus.name));
      if (bonusSprite)
        context.drawImage(bonusSprite, reagent.x * 24 - 14, reagent.y * 24 - 14, 28, 28);
    }
    if (game.phase === "dying") {
      if (deathInk) {
        deathInk.clearRect(0, 0, deathBoard.width, deathBoard.height);
        deathInk.drawImage(canvas, 0, 0, deathBoard.width, deathBoard.height);
        context.save();
        context.filter = "grayscale(1) brightness(0.65)";
        context.drawImage(deathBoard, 0, 0);
        context.restore();
      }
      const elapsed = Math.max(0, 2.8 - game.deathTimer);
      const travel = reducedMotion.matches ? 0 : Math.min(1, elapsed / 0.8);
      const x = location.x * 24 * (1 - travel) + (layer.width / 2) * travel;
      const y = location.y * 24 * (1 - travel) + (layer.height / 2) * travel;
      drawDeath(context, x, y, game.deathTimer, reducedMotion.matches);
    }
    if (game.phase === "cycle_complete")
      drawCelebration(
        context,
        layer.width,
        layer.height,
        game.transitionTimer,
        reducedMotion.matches,
      );
  }
  return {
    draw,
    dispose: (): void => {
      observer.disconnect();
      atlas.dispose();
    },
  };
}
