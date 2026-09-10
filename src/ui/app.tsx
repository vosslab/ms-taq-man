import { createSignal, onCleanup, onMount } from "solid-js";
import type { JSX } from "solid-js";
import { createGame, recordEvent, startGame, tick } from "../game/game_state";
import { copyNumber } from "../game/score";
import { actorLocation } from "../game/actor";
import { tileKey } from "../game/coords";
import type { Direction } from "../game/coords";
import { paintMaze } from "../render/maze_painter";
import { defaultSave, readSave, writeSave } from "../game/save";
import { loadSprites } from "../render/sprite_atlas";
import { createStrandLayer } from "../render/strand_layer";
import { TouchControls } from "./touch_controls";
import { attachSwipe } from "./input";
import { coveragePercent } from "../game/coverage";

export function App(): JSX.Element {
  let canvas!: HTMLCanvasElement;
  const game = createGame();
  function move(direction: Direction): void {
    recordEvent(game, { type: "direction", direction });
  }
  const [bases, setBases] = createSignal(0);
  const [status, setStatus] = createSignal("Ready - three lives");
  const [highScore, setHighScore] = createSignal(0);
  const [score, setScore] = createSignal(0);
  const [coverage, setCoverage] = createSignal(0);
  onMount(() => {
    const detachSwipe = attachSwipe(canvas, move);
    const atlas = loadSprites();
    const strands = createStrandLayer();
    let save = defaultSave();
    let storage: Storage | undefined;
    try {
      storage = window.localStorage;
    } catch {
      storage = undefined;
    }
    if (storage) save = readSave(storage);
    setHighScore(save.highScore);
    let persistedScore = save.highScore;
    function persist(): void {
      if (storage && save.highScore > persistedScore && writeSave(storage, save))
        persistedScore = save.highScore;
    }
    function hidden(): void {
      if (document.hidden) {
        persist();
        game.paused = game.phase === "playing" || game.paused;
      }
    }
    window.addEventListener("pagehide", persist);
    document.addEventListener("visibilitychange", hidden);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D is unavailable");
    let maze = game.maze;
    const layer = document.createElement("canvas");
    layer.width = maze.width * 24;
    layer.height = maze.height * 24;
    const layerContext = layer.getContext("2d");
    if (!layerContext) throw new Error("Maze layer is unavailable");
    const backbone = getComputedStyle(document.documentElement).getPropertyValue(
      "--color-backbone",
    );
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
    const keys: Record<string, Direction> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
    };
    function input(event: KeyboardEvent): void {
      const direction = keys[event.key];
      if (direction) {
        event.preventDefault();
        recordEvent(game, { type: "direction", direction });
      }
      if (event.key === "Escape") game.paused = !game.paused;
    }
    canvas.addEventListener("keydown", input);
    let previous = performance.now();
    let accumulator = 0;
    let frame = 0;
    function animate(now: number): void {
      accumulator += Math.min(0.1, (now - previous) / 1000);
      previous = now;
      while (accumulator >= 1 / 60) {
        tick(game, 1 / 60);
        accumulator -= 1 / 60;
      }
      if (!context) return;
      if (maze !== game.maze) {
        maze = game.maze;
        if (layerContext) paintMaze(layerContext, maze, 24, backbone);
      }
      context.setTransform(canvas.width / layer.width, 0, 0, canvas.height / layer.height, 0, 0);
      context.clearRect(0, 0, layer.width, layer.height);
      context.drawImage(layer, 0, 0);
      strands.paint(context, maze, game.coverage);
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
      if (taq?.complete && taq.naturalWidth) {
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
          if (enzyme.mode === "frightened")
            context.filter = "grayscale(1) sepia(1) hue-rotate(160deg) saturate(3)";
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
        context.fillStyle = "#ffffff";
        context.fillRect(reagent.x * 24 - 6, reagent.y * 24 - 8, 12, 16);
      }
      setBases(game.completedBases + game.coverage.bases);
      setCoverage(coveragePercent(game.coverage, game.maze.edges.size));
      const total = game.completedBases + game.coverage.bases + game.bonusScore;
      setScore(total);
      if (total > save.highScore) {
        save.highScore = total;
        setHighScore(total);
      }
      if (
        (game.phase === "dying" || game.phase === "cycle_complete" || game.phase === "game_over") &&
        save.highScore > persistedScore &&
        storage
      ) {
        persist();
      }
      const thermal =
        game.transitionTimer > 2
          ? "95C DENATURE"
          : game.transitionTimer > 1
            ? "55C ANNEAL"
            : "72C EXTEND";
      setStatus(
        game.paused
          ? "Paused - Escape to resume"
          : game.phase === "intermission"
            ? thermal
            : `Cycle ${game.cycle} - ${game.phase} - ${game.lives} lives - ${copyNumber(game.cycle - 1)} copies`,
      );
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    onCleanup(() => {
      persist();
      window.removeEventListener("pagehide", persist);
      document.removeEventListener("visibilitychange", hidden);
      detachSwipe();
      observer.disconnect();
      cancelAnimationFrame(frame);
      canvas.removeEventListener("keydown", input);
    });
  });
  return (
    <main class="cabinet">
      <header>
        <p class="eyebrow">THE POLYMERASE CHASE</p>
        <h1>Ms Taq Man</h1>
      </header>
      <button
        onClick={() => {
          startGame(game);
          canvas.focus();
        }}
      >
        Start cycle
      </button>
      <p>
        Bases <output aria-label="Bases synthesized">{bases()}</output>
      </p>
      <p role="status">{status()}</p>
      <p>
        Score {score()} · Best <output aria-label="High score">{highScore()}</output>
      </p>
      <label class="coverage-meter">
        Template <output aria-label="Template coverage">{coverage().toFixed(1)}%</output>
        <progress max="100" value={coverage()} aria-label="Template synthesized" />
      </label>
      <canvas
        ref={(element) => {
          canvas = element;
        }}
        aria-label="DNA template maze"
        tabindex="0"
      />
      <TouchControls
        move={move}
        pause={() => {
          game.paused = !game.paused;
        }}
      />
      <footer>Anneal. Extend. Survive.</footer>
    </main>
  );
}
