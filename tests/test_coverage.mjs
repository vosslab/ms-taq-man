import test from "node:test";
import assert from "node:assert/strict";
import { edgeId, tile } from "../src/game/coords.ts";
import {
  createCoverage,
  markEdge,
  reinforceEdge,
  degradeEdge,
  coveragePercent,
} from "../src/game/coverage.ts";

test("an edge scores once in either direction until degraded", () => {
  const coverage = createCoverage();
  const a = tile(1, 1),
    b = tile(2, 1);
  markEdge(coverage, edgeId(a, b));
  const bases = coverage.bases;
  markEdge(coverage, edgeId(b, a));
  assert.equal(coverage.bases, bases);
  degradeEdge(coverage, edgeId(a, b));
  assert.equal(coveragePercent(coverage, 1), 0);
  markEdge(coverage, edgeId(a, b));
  assert.equal(coveragePercent(coverage, 1), 100);
});

test("strand ownership persists on rewalk and changes only when rebuilt", () => {
  const coverage = createCoverage();
  const id = edgeId(tile(1, 1), tile(2, 1));
  markEdge(coverage, id, true);
  markEdge(coverage, id);
  assert.ok(coverage.clampBuilt.has(id));
  degradeEdge(coverage, id);
  markEdge(coverage, id);
  assert.equal(coverage.clampBuilt.has(id), false);
});

test("clamp reinforcement changes the strand palette without inflating synthesis", () => {
  const coverage = createCoverage();
  const id = edgeId(tile(1, 1), tile(2, 1));
  markEdge(coverage, id);
  const before = { bases: coverage.bases, revision: coverage.revision };
  const reinforced = reinforceEdge(coverage, id);
  assert.deepEqual(
    { reinforced, clampBuilt: coverage.clampBuilt.has(id), bases: coverage.bases - before.bases },
    { reinforced: true, clampBuilt: true, bases: 0 },
  );
  assert.equal(coverage.revision, before.revision + 1);
});
