import test from "node:test";
import assert from "node:assert/strict";
import { decodeSave, defaultSave, readSave, writeSave } from "../src/game/save.ts";
test("v1 high scores migrate with enabled audio defaults", () => {
  assert.deepEqual(decodeSave('{"version":1,"highScore":4200}'), {
    version: 2,
    highScore: 4200,
    muted: false,
    fxMuted: false,
    scanlines: true,
    scanlineStrength: 3,
    difficulty: 2,
  });
});
test("invalid and future saves cannot inject invalid scores", () => {
  for (const raw of ["null", "{", '{"version":2,"highScore":-1}', '{"version":99,"highScore":12}'])
    assert.deepEqual(decodeSave(raw), defaultSave());
});
test("storage errors leave the game usable", () => {
  assert.deepEqual(
    readSave({
      getItem() {
        throw new Error("denied");
      },
    }),
    defaultSave(),
  );
  assert.equal(
    writeSave(
      {
        setItem() {
          throw new Error("quota");
        },
      },
      defaultSave(),
    ),
    false,
  );
});
