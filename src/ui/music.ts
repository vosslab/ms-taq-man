// Original sixteen-bar arcade loop, synthesized locally without external assets.
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
    oscillator.type = type;
    oscillator.frequency.value = 440 * 2 ** ((pitch - 69) / 12);
    envelope.gain.setValueAtTime(0, when);
    envelope.gain.linearRampToValueAtTime(volume, when + 0.008);
    envelope.gain.setValueAtTime(volume * 0.65, when + duration * 0.65);
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    oscillator.connect(envelope);
    envelope.connect(bus);
    oscillator.start(when);
    oscillator.stop(when + duration + 0.01);
    oscillator.onended = (): void => {
      oscillator.disconnect();
      envelope.disconnect();
    };
  }
  async function unlock(): Promise<void> {
    if (!context) {
      context = new AudioContext();
      bus = context.createGain();
      bus.gain.value = 0;
      bus.connect(context.destination);
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
      if (lead) note(lead + root - 48, next, 0.13, 0.16, phrase === 2 ? "triangle" : "square");
      if (step % 8 === 0 && phrase !== 3) {
        for (const interval of [12, 16, 19]) note(root + interval, next, 0.8, 0.035, "sine");
      }
      if ([2, 4, 7].includes(phrase) && step % 2 === 1)
        note(root + 24 + [0, 7, 12, 7][Math.floor(step / 2) % 4]!, next, 0.1, 0.06, "triangle");
      if (step % 2 === 0 && (phrase !== 3 || step % 4 === 0))
        note(root + (step % 4 === 0 ? 0 : 12), next, 0.22, 0.45, "triangle");
      if (step % 4 === 0) note(36, next, 0.08, 0.3, "sine");
      if (step % 4 === 2) note(66, next, 0.045, 0.035, "triangle");
      next += step % 2 === 0 ? 0.16 : 0.14;
      step++;
    }
  }
  function dispose(): void {
    if (context) void context.close();
  }
  return { unlock, update, dispose };
}
