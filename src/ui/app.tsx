import { createRenderer } from "../render/canvas_renderer";
import { createSignal, onCleanup, onMount } from "solid-js";
import type { JSX } from "solid-js";
import { createGame, recordEvent, startGame } from "../game/game_state";
import { startGameLoop } from "./game_loop";
import type { Direction } from "../game/coords";
import { defaultSave, readSave, writeSave } from "../game/save";
import { TouchControls } from "./touch_controls";
import { attachSwipe } from "./input";
import { createSoundEffects } from "./sound_effects";
import { createMusic } from "./music";
import { Overlays } from "./overlays";
import { Hud } from "./hud";
import { createGameSignals } from "./game_signals";

export function App(): JSX.Element {
  let canvas!: HTMLCanvasElement;
  const game = createGame();
  const hud = createGameSignals(game);
  const music = createMusic();
  const effects = createSoundEffects();
  const [fxMuted, setFxMuted] = createSignal(true);
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
  const [muted, setMuted] = createSignal(true);
  const [scanlines, setScanlines] = createSignal(false);
  let rememberScanlines: (value: boolean) => void = () => {};
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
    setScanlines(save.scanlines);
    rememberScanlines = (value: boolean): void => {
      save.scanlines = value;
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
        <h1>Ms Taq Man</h1>
      </header>
      <div class="game-stage">
        <div class="maze-screen" classList={{ scanlines: scanlines() }}>
          <canvas
            ref={(element) => {
              canvas = element;
            }}
            aria-label="DNA template maze"
            tabindex="0"
          />
        </div>
        <aside class="game-sidebar" aria-label="Game dashboard">
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
          <span aria-live="polite">{audioMessage()}</span>
          <button
            onClick={() => {
              setScanlines(!scanlines());
              rememberScanlines(scanlines());
            }}
          >
            Turn scanlines {scanlines() ? "off" : "on"}
          </button>
          <Overlays phase={hud.phase()} paused={hud.paused()} timer={hud.transitionTimer()} />
          <Hud signals={hud} highScore={highScore()} />
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
