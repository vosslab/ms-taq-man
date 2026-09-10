import test from "node:test";
import assert from "node:assert/strict";
import { createRewards, synthesisReward, advanceRewards } from "../src/game/arcade_rewards.ts";

test("fresh synthesis earns capped bonus chains and timeout only resets the combo", () => {
  const rewards = createRewards();
  for (let i = 0; i < 7; i++) assert.equal(synthesisReward(rewards), 0);
  assert.equal(synthesisReward(rewards), 10);
  assert.equal(rewards.message, "CHAIN REACTION! x2");
  for (let i = 0; i < 40; i++) assert.ok(synthesisReward(rewards) <= 30);
  rewards.shieldTimer = 10;
  advanceRewards(rewards, 4);
  assert.equal(rewards.combo, 0);
  assert.equal(rewards.shieldTimer, 6);
  assert.equal(synthesisReward(rewards), 0);
});
