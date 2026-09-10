import { createRenderer } from "../render/canvas_renderer";
import { createSignal, onCleanup, onMount } from "solid-js";
import type { JSX } from "solid-js";
import { createGame, recordEvent, startGame, tick } from "../game/game_state";
import { copyNumber } from "../game/score";
import type { Direction } from "../game/coords";
import { defaultSave, readSave, writeSave } from "../game/save";
import { TouchControls } from "./touch_controls";
import { attachSwipe } from "./input";
import { coveragePercent } from "../game/coverage";
import { createMusic } from "./music";

export function App(): JSX.Element {
  let canvas!: HTMLCanvasElement;
  const game = createGame();
  const music = createMusic();
  const [muted, setMuted] = createSignal(true);
  const [audioMessage, setAudioMessage] = createSignal("");
  let rememberSound: (value: boolean) => void = () => {};
  async function toggleMusic(): Promise<void> {
    if (muted()) {
      try {
        await music.unlock();
      } catch {
        setAudioMessage("Audio unavailable in this browser session.");
        return;
      }
    }
    setMuted(!muted());
    rememberSound(muted());
    setAudioMessage("");
  }
  async function unlockMusic(): Promise<void> {
    if (muted()) return;
    try {
      await music.unlock();
    } catch {
      setMuted(true);
      setAudioMessage("Audio unavailable in this browser session.");
    }
  }
  function move(direction: Direction): void {
    recordEvent(game, { type: "direction", direction });
  }
  const [bases, setBases] = createSignal(0);
  const [status, setStatus] = createSignal("Ready - three lives");
  const [highScore, setHighScore] = createSignal(0);
  const [score, setScore] = createSignal(0);
  const [coverage, setCoverage] = createSignal(0);
  const [primersLeft, setPrimersLeft] = createSignal(game.primers.size);
  const [extending, setExtending] = createSignal(false);
  const [hotStart, setHotStart] = createSignal(0);
  onMount(() => {
    const detachSwipe = attachSwipe(canvas, move);
    let save = defaultSave();
    let storage: Storage | undefined;
    try {
      storage = window.localStorage;
    } catch {
      storage = undefined;
    }
    if (storage) save = readSave(storage);
    setMuted(save.muted);
    rememberSound = (value: boolean): void => {
      save.muted = value;
      if (storage) writeSave(storage, save);
    };
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
    const renderer = createRenderer(canvas, game);
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
      music.update(!muted() && !game.paused && !document.hidden && game.phase !== "dying");
      accumulator += Math.min(0.1, (now - previous) / 1000);
      previous = now;
      while (accumulator >= 1 / 60) {
        tick(game, 1 / 60);
        accumulator -= 1 / 60;
      }
      renderer.draw();
      setBases(game.completedBases + game.coverage.bases);
      setCoverage(coveragePercent(game.coverage, game.maze.edges.size));
      setPrimersLeft(game.primers.size);
      setExtending(game.player.primed);
      setHotStart(Math.ceil(game.frightened));
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
            : game.phase === "dying"
              ? "ENZYME DENATURED - refolding for another run"
              : `Cycle ${game.cycle} - ${game.phase} - ${game.lives} lives - ${copyNumber(game.cycle - 1)} copies`,
      );
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    onCleanup(() => {
      music.dispose();
      persist();
      window.removeEventListener("pagehide", persist);
      document.removeEventListener("visibilitychange", hidden);
      detachSwipe();
      renderer.dispose();
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
      <div class="game-stage">
      <canvas
        ref={(element) => {
          canvas = element;
        }}
        aria-label="DNA template maze"
        tabindex="0"
      />
      <aside class="game-sidebar" aria-label="Game dashboard">
      <button
        onClick={() => {
          startGame(game);
          void unlockMusic();
          canvas.focus();
        }}
      >
        Start cycle
      </button>
      <button
        aria-pressed={!muted()}
        onClick={() => {
          void toggleMusic();
        }}
      >
        Music {muted() ? "off" : "on"}
      </button>
      <span aria-live="polite">{audioMessage()}</span>
      <p>
        Bases <output aria-label="Bases synthesized">{bases()}</output>
      </p>
      <p role="status">{status()}</p>
      <p>
        Score {score()} · Best <output aria-label="High score">{highScore()}</output>
      </p>
      <label class="coverage-meter">
        Template <output aria-label="Template coverage">{coverage().toFixed(1)}%</output> / 50%
        <progress max="50" value={Math.min(50, coverage())} aria-label="Template synthesized" />
      </label>
      <p>
        <output aria-label="Primers remaining">{primersLeft()}</output> primers left ·{" "}
        {extending() ? "Extending DNA" : "Find an RNA primer to extend"}
      </p>
      <p>Clear the cycle: synthesize 50% OR collect every primer.</p>
      <p aria-label="Hot-start protection">
        Hot start: {hotStart() > 0 ? `${hotStart()} seconds` : "inactive"}
      </p>
      <TouchControls
        move={move}
        pause={() => {
          game.paused = !game.paused;
        }}
      />
      </aside>
      </div>
      <footer>Anneal. Extend. Survive.</footer>
    </main>
  );
}
