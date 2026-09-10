// Original sixteen-bar arcade loop, synthesized locally without external assets.
const melody = [72, 76, 79, 83, 81, 79, 76, 74, 72, 76, 79, 84, 83, 79, 76, 71];
const roots = [48, 45, 53, 55];
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
      bus.gain.setTargetAtTime(playing ? 0.55 : 0, context.currentTime, 0.025);
      if (playing) next = context.currentTime + 0.03;
    }
    if (!playing) return;
    while (next < context.currentTime + 0.12) {
      const root = roots[Math.floor(step / 16) % roots.length] ?? 48;
      const lead = melody[step % melody.length] ?? 72;
      note(lead + root - 48, next, 0.14, 0.2, "square");
      if (step % 2 === 0) note(root + (step % 4 === 0 ? 0 : 12), next, 0.22, 0.45, "triangle");
      if (step % 4 === 0) note(36, next, 0.08, 0.3, "sine");
      next += 0.15;
      step++;
    }
  }
  function dispose(): void {
    if (context) void context.close();
  }
  return { unlock, update, dispose };
}
