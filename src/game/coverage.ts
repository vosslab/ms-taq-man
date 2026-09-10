import type { EdgeId } from "./coords";

export type Coverage = {
  covered: Set<EdgeId>;
  clampBuilt: Set<EdgeId>;
  revision: number;
  bases: number;
  seeds: Map<EdgeId, number>;
};
export function createCoverage(): Coverage {
  return { clampBuilt: new Set(), covered: new Set(), revision: 0, bases: 0, seeds: new Map() };
}
export function markEdge(coverage: Coverage, id: EdgeId, clamp = false): boolean {
  if (coverage.covered.has(id)) return false;
  coverage.covered.add(id);
  if (clamp) coverage.clampBuilt.add(id);
  else coverage.clampBuilt.delete(id);
  coverage.revision++;
  coverage.bases += 10;
  let seed = 17;
  for (const character of id) seed = (seed * 31 + character.charCodeAt(0)) >>> 0;
  coverage.seeds.set(id, seed + coverage.revision);
  return true;
}
export function reinforceEdge(coverage: Coverage, id: EdgeId): boolean {
  if (!coverage.covered.has(id) || coverage.clampBuilt.has(id)) return false;
  coverage.clampBuilt.add(id);
  coverage.revision++;
  return true;
}
export function degradeEdge(coverage: Coverage, id: EdgeId): boolean {
  if (!coverage.covered.delete(id)) return false;
  coverage.revision++;
  return true;
}
export function coveragePercent(coverage: Coverage, total: number): number {
  return total === 0 ? 0 : (coverage.covered.size / total) * 100;
}
