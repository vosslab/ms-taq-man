# Traversal baseline

## Difficulty-scaled target revalidation

After the user's revision to 60% default coverage (50/60/70/80/90% by difficulty),
all eight Chill/Easy traversal runs still clear. Easy cycle 1 reaches 60% in 29s;
Easy cycles 2-4 collect all primers in 30s, 29s, and 26s. Easy cycle 3 loses one
life. The continuous Easy run reaches cycle 5 in 139 simulated seconds with three
lives and 5,200 carried bases. Clamp pickup checks still succeed in 6-7 seconds.
Earlier timing tables below describe prior rules and remain historical evidence.

## Collectible-clamp revalidation

After changing the helper to a pickup, reran the same driver without adding any
clamp-seeking behavior. All eight independent runs still clear. Current times:

| Difficulty | Cycle 1 | Cycle 2 | Cycle 3 | Cycle 4 |
| --- | --- | --- | --- | --- |
| Chill | 24s | 26s | 20s | 23s |
| Easy | 23s | 30s | 29s | 26s |

Easy cycle 3 loses one life; the other independent runs retain three. The continuous
Easy run reaches cycle 5 in 132 simulated seconds with three lives and 4,920 carried
bases. Earlier automatic-helper numbers below are historical, not current results.
The runner now reports whether each independent run actually collected the clamp.

An additional movement-driven pickup check waits for the clamp to appear, then
routes Taq to it with enemies still active. All four pickups succeed in 6-7
simulated seconds with three lives retained. This establishes corridor reachability
and actual movement-triggered recruitment on every layout.

## Buffered traversal acceptance

After adding Pip, run `node --import tsx tests/e2e/traversal.mjs` from the repo root.
The deterministic driver buffers turns toward nearby primers and activators,
penalizes targets near enemies, and leaves simulation rules active. It never fills
coverage or removes primers directly. Each maze starts independently with three
lives. All eight runs cleared through movement on 2026-09-09:

| Difficulty | Cycle 1 | Cycle 2 | Cycle 3 | Cycle 4 |
| --- | --- | --- | --- | --- |
| Chill | 23s, 50% | 26s, all primers | 20s, all primers | 23s, all primers |
| Easy | 23s, 50% | 30s, 50% | 20s, all primers | 25s, 50% |

Every run retained three lives. Easy cycle 3 used Pip's rescue once. These are
simulation times, not performance timings. The improved driver and addition of
Pip both differ from the earlier baseline, so this is not a controlled measure of
Pip's effect. This proves traversal finishability for these deterministic runs;
browser input, human pacing, and a continuous multi-cycle run remain separate gates.

The runner now also starts a single default-Easy game through `startGame`, steers
through cycles 1-4, and lets every celebration and thermal transition tick normally.
It reaches cycle 5 in 121 simulated seconds with four lives (including an earned
extra life) and 5,010 carried bases. Assertions verify all four clears, ready and
intermission phases, and retained base progress. This closes the simulation-level
continuous-run gap; browser controls and human play remain unverified.

## Earlier unbuffered baseline

2026-09-09: ran the current simulation at 60 fixed steps per second, independently
starting each of the four cycles with three lives and default Easy difficulty.
Enemies, collisions, pickups, and chew-back remained active. No coverage or primer
sets were directly filled or cleared.

The disposable driver chose a shortest route to the nearest remaining primer when
the player was exactly at a tile center. It did not avoid enemies, deliberately
seek activators, or optimize fresh coverage. This is a weak baseline, not a model
of skilled or typical human play.

| Cycle | Outcome | Seconds | Primers remaining | Coverage |
| --- | --- | --- | --- | --- |
| 1 | Game over | 52 | 13 | 44% |
| 2 | Game over | 51 | 16 | 24% |
| 3 | Game over | 23 | 5 | 22% |
| 4 | Game over | 43 | 17 | 9% |

## Interpretation and next check

This experiment does not establish finishability, and it is insufficient evidence
for changing enemy tuning. It confirms that focused transition tests must not be
reported as full-run acceptance. The cycle-one run approached the coverage goal
through actual movement, but none cleared a cycle.

Next, use a driver that queues turns before tile centers and avoids nearby active
enemies, and record its controls for reproducibility. Compare runs at Chill and
Easy. Follow that with browser traversal and human play for control feel, readable
hazards, and pacing. Preserve the 50% coverage OR all primers win condition.
