# Arcade acceptance matrix

Status as of 2026-09-09. This matrix records current evidence for the original
[plan](../splendid-gathering-tulip.md) and its
[completion companion](../active/arcade_completion.md). A verified item has a
repeatable check or a directly inspected artifact. A partial item names its
remaining boundary.

## Game rules, movement, and progression

| Requirement | Status | Evidence and limitation |
| --- | --- | --- |
| Four connected, rotating template mazes | **Verified** | 59 Node tests include four maze checks; the level validator passes all four layouts. The browser driver advances through cycles 1-4 and reaches Cycle 5. |
| No broad open rooms or hidden-wall-looking traps | **Verified** | `tests/test_maze.mjs` forbids every open two-by-two walkable area; the normal validator also checks connectivity, tunnels, reachable pickups, and house paths. Visual review finds continuous walls and narrow corridors. |
| Buffered turns, reversals, tunnel travel, and collision handling | **Verified** | Simulation and browser checks cover these paths, including tunnel collision and real arrow-key steering. The long driver reports no diagnostics. |
| RNA primer pickup starts extension | **Verified** | Primer-count, pickup, death/re-prime, and coverage tests pass; the browser traversal deliberately re-primes after death. |
| Cycle clears at coverage target **or** all primers | **Verified** | Difficulty tests cover 50/60/70/80/90% targets; default Easy is 60%. Browser traversal clears all four cycles through normal play. |
| Enzyme personality, house release/return, frightened state | **Verified** | Lifecycle coverage drives all four enzymes through release, house exit, frightened expiry, and return behavior. Static images cannot establish animation cadence. |
| Chew-back fade and fresh re-extension | **Verified** | Browser traversal observes 35 same-cycle chew removals and five fresh-seed re-extensions. Strand browser tests check the 0.6-second fade, removal, and new seed. |
| Reagents, scoring, extra life, buddy/clamp behavior | **Verified** | Node tests cover timing and effects; the browser traversal collects three reagents. The clamp's visible, colored construction and shield behavior are source and browser-tested. |

## Rendering, interaction, and presentation

| Requirement | Status | Evidence and limitation |
| --- | --- | --- |
| Editable molecular player, primer, enemy, and death art | **Verified** | The source contains 22 editable sprite names, including `taq_denature.svg` and `strand_ribbon.svg`; atlas, browser, and visual review pass. |
| Organic double helix stays inside usable corridors | **Verified** | DPR 1 and DPR 2 full-nest browser checks pass. [Full nests](../../screenshots/full_nests.png) show varied paired strands and rungs without obscuring corridors. |
| Renderer readiness, DPR resize, and disposal | **Verified** | Browser tests exercise the current generation after resize, loaded sprites, and disposal rejection. |
| Cached degradation and repair performance | **Verified** | Full-frame browser evidence reports degradation p95 at or below 1.5 ms and re-extension p95 at or below 2.3 ms. These are browser measurements, not a mobile frame-rate guarantee. |
| 16:10 desktop cabinet and mobile layout | **Verified** | Browser geometry records desktop stage ratio 1.619 and board/dashboard bottom delta 1.7 px; the 400 px mobile view stacks readable controls and accepts a swipe. |
| Arrow keys, WASD, swipe, and dashboard focus | **Verified** | Arrow keys are the primary documented input; browser smoke tests cover keyboard focus and 400 px swipe input. |
| Dramatic death, celebration, scanlines, and independent sound controls | **Verified / sensory limit** | Static captures and source verify the visual states and controls. Earlier attended play feedback covered sound, scanlines, and pacing; static images cannot prove motion rhythm or audio mix. |

![Keyboard-driven cycle completion](../../screenshots/browser_cycle.png)

## Browser acceptance run

The long driver at `tests/playwright/e2e/browser_traversal.mjs` uses real
Playwright arrow-key events. Its observer is a detached copied projection with a
top-level freeze for safe route decisions; it is not recursively immutable and
does not mutate the running game. This is manual acceptance rather than a regular
CI test because its state-aware route is intentionally long.

| Cycle | Clear time | Deaths before clear | Final-edge interval |
| --- | ---: | ---: | ---: |
| 1 | 49.8 s | 1 | 5.2 s |
| 2 | 39.0 s | 0 | 1.8 s |
| 3 | 37.1 s | 0 | 2.9 s |
| 4 | 46.5 s | 0 | 8.8 s |

The same run reaches Cycle 5, collects three reagents, records 35 chew removals,
five fresh-seed re-extensions, and a re-prime after death, with no diagnostics.
It establishes browser finishability under controlled automation; it does not
measure human skill, subjective pacing, or real-time performance on every device.

## Release checks

- `./check_codebase.sh`: passed with 59 Node tests and four level validations.
- `./run_playwright_tests.sh`: passed 16 browser tests.
- `./build_github_pages.sh`: passed and produced the static `dist/` site.
- `source source_me.sh && python3 -m pytest tests/`: 1,051 passed in the final settled-tree run.
- `git diff --check`: passed during documentation closeout.

The build is ready for a GitHub Pages deployment workflow, but this repository
does not claim that an external deployment has been performed.
