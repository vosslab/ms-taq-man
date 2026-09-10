import test from "node:test";
import assert from "node:assert/strict";
import { targetTile } from "../src/game/enzymes.ts";
import { tile } from "../src/game/coords.ts";

test("chase and ambush select player and four tiles ahead", () => {
  const player = tile(5, 5);
  assert.deepEqual(targetTile("exo", player, "up", tile(1, 1), tile(2, 2), tile(0, 0)), player);
  assert.deepEqual(
    targetTile("dimer", player, "up", tile(1, 1), tile(2, 2), tile(0, 0)),
    tile(5, 1),
  );
});
test("Chelate reflects the ahead target around Exo", () => {
  assert.deepEqual(
    targetTile("chelate", tile(5, 5), "right", tile(3, 2), tile(2, 2), tile(0, 0)),
    tile(11, 8),
  );
});
test("RNase retreats nearby and pursues at distance", () => {
  assert.deepEqual(
    targetTile("rnase", tile(5, 5), "up", tile(1, 1), tile(6, 5), tile(0, 0)),
    tile(0, 0),
  );
  assert.deepEqual(
    targetTile("rnase", tile(5, 5), "up", tile(1, 1), tile(13, 5), tile(0, 0)),
    tile(5, 5),
  );
});
