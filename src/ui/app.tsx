import { sprites } from "../art/sprites_generated";
import { createRenderer } from "../render/canvas_renderer";
import { createSignal, onCleanup, onMount } from "solid-js";
import type { JSX } from "solid-js";
import { createGame, recordEvent, startGame } from "../game/game_state";
import { startGameLoop } from "./game_loop";
import type { Direction } from "../game/coords";
import { defaultSave, readSave, writeSave } from "../game/save";
import { attachSwipe } from "./input";
import { createSoundEffects } from "./sound_effects";
import { createMusic } from "./music";
import { Overlays } from "./overlays";
import { Hud } from "./hud";
import { createGameSignals } from "./game_signals";
import { difficultyLabel } from "../game/difficulty";

export function App(): JSX.Element {
  let canvas!: HTMLCanvasElement;
  const game = createGame();
  const [difficulty, setDifficulty] = createSignal(game.difficulty);
  let rememberDifficulty: (value: number) => void = () => {};
  const hud = createGameSignals(game);
  const music = createMusic();
  const effects = createSoundEffects();
  const [fxMuted, setFxMuted] = createSignal(false);
  let rememberFx: (value: boolean) => void = () => {};
  async function toggleFx(): Promise<void> {
    if (fxMuted()) {
      try {
        await effects.unlock();
      } catch {
        setAudioMessage("Sound effects unavailable in this browser session.");
        return;
      }
    }
    setFxMuted(!fxMuted());
    rememberFx(fxMuted());
    setAudioMessage("");
  }
  const [muted, setMuted] = createSignal(false);
  const [scanlineStrength, setScanlineStrength] = createSignal(3);
  let rememberStrength: (value: number) => void = () => {};
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
    if (!fxMuted()) {
      try {
        await effects.unlock();
      } catch {
        setFxMuted(true);
      }
    }
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
  const [highScore, setHighScore] = createSignal(0);
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
    game.difficulty = save.difficulty;
    setDifficulty(save.difficulty);
    rememberDifficulty = (value: number): void => {
      game.difficulty = value;
      save.difficulty = value;
      if (storage) writeSave(storage, save);
    };
    setScanlineStrength(save.scanlines ? save.scanlineStrength : 0);
    rememberStrength = (value: number): void => {
      save.scanlineStrength = value;
      save.scanlines = value > 0;
      if (storage) writeSave(storage, save);
    };
    setFxMuted(save.fxMuted);
    rememberFx = (value: boolean): void => {
      save.fxMuted = value;
      if (storage) writeSave(storage, save);
    };
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
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      )
        return;
      const direction = keys[event.key] ?? keys[event.key.toLowerCase()];
      if (direction) {
        event.preventDefault();
        recordEvent(game, { type: "direction", direction });
      }
      if (event.key === "Escape") game.paused = !game.paused;
    }
    window.addEventListener("keydown", input);
    const stopLoop = startGameLoop(game, () => {
      music.update(!muted() && !game.paused && !document.hidden && game.phase !== "dying");
      effects.update(game, !fxMuted() && !document.hidden);
      renderer.draw();
      hud.push(game);
      const total = game.completedBases + game.coverage.bases + game.bonusScore;
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
    });
    onCleanup(() => {
      music.dispose();
      effects.dispose();
      persist();
      window.removeEventListener("pagehide", persist);
      document.removeEventListener("visibilitychange", hidden);
      detachSwipe();
      renderer.dispose();
      stopLoop();
      window.removeEventListener("keydown", input);
    });
  });
  return (
    <main class="cabinet">
      <header>
        <p class="eyebrow">THE POLYMERASE CHASE</p>
        <h1>
          <img
            class="game-logo"
            alt="Ms Taq Man"
            width="600"
            height="100"
            src={`data:image/svg+xml,${encodeURIComponent(sprites.logo_ms_taq_man)}`}
          />
        </h1>
      </header>
      <div class="game-stage">
        <section class="playfield" aria-label="Game board">
          <div
            class="maze-screen"
            classList={{ scanlines: scanlineStrength() > 0 }}
            style={{ "--scanline-opacity": String(0.14 + scanlineStrength() * 0.12) }}
          >
            <canvas
              ref={(element) => {
                canvas = element;
              }}
              aria-label="DNA template maze"
              tabindex="0"
            />
          </div>
        </section>
        <aside class="game-sidebar" aria-label="Game dashboard">
          <div class="dashboard-actions">
            <button
              onClick={() => {
                if (game.phase === "attract" || game.phase === "game_over") startGame(game);
                else game.paused = !game.paused;
                void unlockMusic();
                canvas.focus();
              }}
            >
              {hud.phase() === "attract"
                ? "Start cycle"
                : hud.phase() === "game_over"
                  ? "Start new run"
                  : hud.paused()
                    ? "Resume game"
                    : "Pause game"}
            </button>
            <button
              aria-pressed={!muted()}
              onClick={() => {
                void toggleMusic();
              }}
            >
              Turn music {muted() ? "on" : "off"}
            </button>
            <button
              onClick={() => {
                void toggleFx();
              }}
            >
              Turn FX {fxMuted() ? "on" : "off"}
            </button>
          </div>
          <span class="audio-message" aria-live="polite">
            {audioMessage()}
          </span>
          <div class="dashboard-settings">
            <label class="scanline-strength">
              Scanline strength:{" "}
              <output>{scanlineStrength() === 0 ? "Off" : scanlineStrength()}</output> / 5
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={scanlineStrength()}
                aria-label="Scanline strength"
                onInput={(event) => {
                  const value = event.currentTarget.valueAsNumber;
                  setScanlineStrength(value);
                  rememberStrength(value);
                }}
              />
            </label>
            <label class="scanline-strength">
              Difficulty: {difficulty()} / 5 · {difficultyLabel(difficulty())}
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={difficulty()}
                aria-label="Difficulty"
                onInput={(event) => {
                  const value = event.currentTarget.valueAsNumber;
                  setDifficulty(value);
                  rememberDifficulty(value);
                }}
              />
              Lower settings slow enemies and reduce required coverage. Change anytime.
            </label>
          </div>
          <Overlays phase={hud.phase()} paused={hud.paused()} timer={hud.transitionTimer()} />
          <Hud signals={hud} highScore={highScore()} />
        </aside>
      </div>
      <footer>Anneal. Extend. Survive.</footer>
    </main>
  );
}
