import test from "node:test";
import assert from "node:assert/strict";
import { enzymePoints, copyNumber } from "../src/game/score.ts";
test("enzyme chains double up to the fourth enemy", () => {
  assert.equal(enzymePoints(1), enzymePoints(0) * 2);
  assert.equal(enzymePoints(4), enzymePoints(3));
});
test("copy count retains integer precision", () => {
  assert.equal(copyNumber(3), "8");
  assert.equal(BigInt(copyNumber(60)), 2n ** 60n);
});
