# State-aware browser traversal

On 2026-09-09, `tests/playwright/e2e/browser_traversal.mjs` completed four
cycles against the built site and reached Cycle 5. The driver sends real
Playwright arrow-key events to the normal input handler. It does not fill
coverage, remove primers, trigger transitions, or otherwise mutate gameplay.

For routing only, its test bundle exposes a detached copied projection of the
live game with a top-level freeze. That projection is intentionally not described
as recursively immutable: nested copied collections remain ordinary copies. It
is sufficient for observation because the driver never writes it or the live game.

![Cycle completion from the browser traversal](../../screenshots/browser_cycle.png)

## Recorded run

| Cycle | Clear time | Deaths before clear | Final-edge interval |
| --- | ---: | ---: | ---: |
| 1 | 49.8 s | 1 | 5.2 s |
| 2 | 39.0 s | 0 | 1.8 s |
| 3 | 37.1 s | 0 | 2.9 s |
| 4 | 46.5 s | 0 | 8.8 s |

The route also collected three moving reagents, observed 35 same-cycle chew-back
removals, observed five re-extensions with fresh render seeds, and intentionally
re-primed after a death. It emitted no diagnostics.

## How to repeat it

Build the static site, then serve it in one terminal:

```bash
./build_github_pages.sh
./run_web_server.sh
```

Use the port printed by the server. In a second terminal, point the driver at
that local URL:

```bash
node tests/playwright/e2e/browser_traversal.mjs http://127.0.0.1:PORT/
```

The driver is a manual acceptance lane, not regular CI: it is intentionally
longer and uses observation-driven steering, so the short browser suite remains
the stable regression gate.

## Scope limit

The run proves browser finishability with real keyboard input across all four
mazes under controlled automation. It does not prove human skill, subjective
difficulty, controller feel, audio quality, or real-time performance on every
device. Earlier attended play feedback covers sound, scanlines, and pacing; the
automated browser suite covers deterministic behavior separately.
