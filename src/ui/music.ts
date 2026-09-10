import { createDrums } from "./drums";
// Original electronic arrangement, synthesized locally without external assets.
const melody = [72, 76, 79, 83, 81, 79, 76, 74, 72, 76, 79, 84, 83, 79, 76, 71];
const roots = [48, 45, 53, 55];
const response = [79, 0, 76, 74, 72, 0, 67, 71, 72, 76, 0, 79, 76, 74, 71, 0];
const bridge = [81, 79, 0, 76, 74, 72, 0, 67, 69, 72, 76, 0, 74, 71, 67, 0];
const finale = [72, 79, 84, 0, 83, 79, 76, 0, 74, 77, 81, 84, 83, 0, 79, 71];
export function createMusic(): {
  unlock: () => Promise<void>;
  update: (playing: boolean) => void;
  dispose: () => void;
} {
  let context: AudioContext | undefined;
  let bus: GainNode | undefined;
  let drums: ReturnType<typeof createDrums> | undefined;
  let next = 0;
  let step = 0;
  let active = false;
  function note(
    pitch: number,
    when: number,
    duration: number,
    volume: number,
    type: OscillatorType,
  ): void {
    if (!context || !bus) return;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(pitch < 60 ? 900 : 4200, when);
    filter.frequency.exponentialRampToValueAtTime(pitch < 60 ? 220 : 1100, when + duration);
    oscillator.type = type;
    oscillator.frequency.value = 440 * 2 ** ((pitch - 69) / 12);
    envelope.gain.setValueAtTime(0, when);
    envelope.gain.linearRampToValueAtTime(volume, when + 0.008);
    envelope.gain.setValueAtTime(volume * 0.65, when + duration * 0.65);
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(bus);
    oscillator.start(when);
    oscillator.stop(when + duration + 0.01);
    oscillator.onended = (): void => {
      oscillator.disconnect();
      filter.disconnect();
      envelope.disconnect();
    };
  }
  async function unlock(): Promise<void> {
    if (!context) {
      context = new AudioContext();
      bus = context.createGain();
      bus.gain.value = 0;
      bus.connect(context.destination);
      drums = createDrums(context, bus);
    }
    await context.resume();
  }
  function update(playing: boolean): void {
    if (!context || !bus || context.state !== "running") return;
    if (playing !== active) {
      active = playing;
      bus.gain.setTargetAtTime(playing ? 0.25 : 0, context.currentTime, 0.025);
      if (playing) next = context.currentTime + 0.03;
    }
    if (!playing) return;
    while (next < context.currentTime + 0.12) {
      const root = roots[Math.floor(step / 16) % roots.length] ?? 48;
      const phrase = Math.floor(step / 64) % 8;
      const themes = [melody, response, bridge, response, finale, bridge, melody, finale];
      const lead = themes[phrase]?.[step % melody.length] ?? 0;
      if (lead && (step % 4 !== 3 || phrase === 7))
        note(lead + root - 48, next, 0.28, 0.14, "triangle");
      if (step % 8 === 0 && phrase !== 3) {
        for (const interval of [12, 16, 19, 23]) note(root + interval, next, 1.05, 0.03, "sine");
      }
      if ([2, 4, 7].includes(phrase) && step % 2 === 1)
        note(root + 24 + [0, 7, 12, 7][Math.floor(step / 2) % 4]!, next, 0.1, 0.06, "triangle");
      if ([0, 3, 6].includes(step % 8) && phrase !== 3)
        note(root - 12 + (step % 8 === 6 ? 7 : 0), next, 0.24, 0.35, "triangle");
      if (step % 8 === 0 || (phrase !== 3 && step % 8 === 3)) drums?.("kick", next);
      if (phrase !== 3 && step % 4 === 2) drums?.("snare", next);
      if (phrase !== 3) drums?.("hat", next, step % 2 ? 0.65 : 1);
      if (phrase === 7 && step % 16 >= 14) drums?.("snare", next + 0.075, 0.45);
      next += step % 2 === 0 ? 0.16 : 0.14;
      step++;
    }
  }
  function dispose(): void {
    if (context) void context.close();
  }
  return { unlock, update, dispose };
}
