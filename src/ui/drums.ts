export function createDrums(
  context: AudioContext,
  output: AudioNode,
): (kind: "kick" | "snare" | "hat", when: number, accent?: number) => void {
  const noise = context.createBuffer(1, Math.ceil(context.sampleRate * 0.25), context.sampleRate);
  const samples = noise.getChannelData(0);
  let seed = 1729;
  for (let i = 0; i < samples.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    samples[i] = seed / 2147483648 - 1;
  }
  return (kind, when, accent = 1): void => {
    const envelope = context.createGain();
    const duration = kind === "kick" ? 0.25 : kind === "snare" ? 0.16 : 0.045;
    envelope.gain.setValueAtTime(0.0001, when);
    envelope.gain.exponentialRampToValueAtTime(
      (kind === "kick" ? 0.65 : kind === "snare" ? 0.18 : 0.055) * accent,
      when + 0.003,
    );
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    envelope.connect(output);
    if (kind === "kick") {
      const oscillator = context.createOscillator();
      oscillator.frequency.setValueAtTime(140, when);
      oscillator.frequency.exponentialRampToValueAtTime(42, when + 0.12);
      oscillator.connect(envelope);
      oscillator.start(when);
      oscillator.stop(when + duration);
      oscillator.onended = (): void => {
        oscillator.disconnect();
        envelope.disconnect();
      };
    } else {
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      source.buffer = noise;
      filter.type = "highpass";
      filter.frequency.value = kind === "snare" ? 1000 : 6500;
      source.connect(filter);
      filter.connect(envelope);
      source.start(when);
      source.stop(when + duration);
      source.onended = (): void => {
        source.disconnect();
        filter.disconnect();
        envelope.disconnect();
      };
    }
  };
}
