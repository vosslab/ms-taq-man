export type ArcadeRewards = {
  combo: number;
  comboTimer: number;
  speedTimer: number;
  shieldTimer: number;
  message: string;
  messageTimer: number;
};
export function createRewards(): ArcadeRewards {
  return { combo: 0, comboTimer: 0, speedTimer: 0, shieldTimer: 0, message: "", messageTimer: 0 };
}
export function announce(rewards: ArcadeRewards, message: string): void {
  rewards.message = message;
  rewards.messageTimer = 2;
}
export function advanceRewards(rewards: ArcadeRewards, seconds: number): void {
  rewards.comboTimer = Math.max(0, rewards.comboTimer - seconds);
  rewards.speedTimer = Math.max(0, rewards.speedTimer - seconds);
  rewards.shieldTimer = Math.max(0, rewards.shieldTimer - seconds);
  rewards.messageTimer = Math.max(0, rewards.messageTimer - seconds);
  if (!rewards.comboTimer) rewards.combo = 0;
}
export function synthesisReward(rewards: ArcadeRewards): number {
  rewards.combo++;
  rewards.comboTimer = 3;
  const multiplier = Math.min(4, 1 + Math.floor(rewards.combo / 8));
  if (rewards.combo % 8 === 0) announce(rewards, `CHAIN REACTION! x${multiplier}`);
  return (multiplier - 1) * 10;
}
