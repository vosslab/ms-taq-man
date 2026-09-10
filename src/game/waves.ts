export type WaveMode = "scatter" | "chase";
// Four scatter windows, followed by permanent pursuit. Frightened time is excluded.
export function waveMode(elapsed: number, cycle: number): WaveMode {
  const durations = cycle === 1 ? [7, 20, 7, 20, 5, 20, 5] : [5, 20, 5, 20, 5, 30, 1];
  let remaining = elapsed;
  for (const [index, duration] of durations.entries()) {
    if (remaining < duration) return index % 2 === 0 ? "scatter" : "chase";
    remaining -= duration;
  }
  return "chase";
}
