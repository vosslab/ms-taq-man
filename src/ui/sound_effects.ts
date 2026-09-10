import type { Game } from "../game/game_state";

export function createSoundEffects(): {
  unlock: () => Promise<void>;
  update: (game: Readonly<Game>, enabled: boolean) => void;
  dispose: () => void;
} {
  let context: AudioContext | undefined;
  let previousPhase: Game["phase"] = "attract";
  let primers = 0;
  let reward = 0;
  let protection = 0;
  function tone(notes: number[]): void {
    if (!context || context.state !== "running") return;
    const audio = context;
    notes.forEach((pitch, index) => {
      const when = audio.currentTime + index * 0.075;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = 440 * 2 ** ((pitch - 69) / 12);
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(0.09, when + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.16);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(when);
      oscillator.stop(when + 0.17);
      oscillator.onended = (): void => {
        oscillator.disconnect();
        gain.disconnect();
      };
    });
  }
  return {
    async unlock(): Promise<void> {
      context ??= new AudioContext();
      await context.resume();
      tone([72, 79]);
    },
    update(game, enabled): void {
      if (enabled && !game.paused) {
        if (game.phase !== previousPhase && game.phase === "dying") tone([72, 67, 60, 48]);
        else if (game.phase !== previousPhase && game.phase === "cycle_complete")
          tone([72, 76, 79, 84]);
        else if (game.frightened > protection) tone([60, 72, 84]);
        else if (game.bonusScore > reward) tone([76, 79, 88]);
        else if (game.primers.size < primers && game.phase === "playing") tone([76, 83]);
      }
      previousPhase = game.phase;
      primers = game.primers.size;
      reward = game.bonusScore;
      protection = game.frightened;
    },
    dispose(): void {
      if (context) void context.close();
    },
  };
}
