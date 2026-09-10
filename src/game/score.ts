export function enzymePoints(chain: number): number {
  return 200 * 2 ** Math.min(3, Math.max(0, chain));
}
export function copyNumber(cycle: number): string {
  return (2n ** BigInt(Math.max(0, Math.floor(cycle)))).toString();
}
