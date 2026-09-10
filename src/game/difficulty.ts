export function enemySpeedMultiplier(difficulty: number): number {
  return [0.6, 0.75, 0.9, 1, 1.1][Math.max(0, Math.min(4, Math.round(difficulty) - 1))] ?? 0.75;
}
export function difficultyLabel(difficulty: number): string {
  return ["Chill", "Easy", "Lively", "Classic", "Wild"][difficulty - 1] ?? "Easy";
}
export function coverageTarget(difficulty: number): number {
  return [50, 60, 70, 80, 90][Math.max(0, Math.min(4, Math.round(difficulty) - 1))] ?? 60;
}
