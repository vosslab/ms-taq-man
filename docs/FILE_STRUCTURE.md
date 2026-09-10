# File structure

The editable game lives under `src/`. The build publishes only `dist/`.

| Path | Responsibility |
| --- | --- |
| `src/main.tsx` | Mount the Solid application |
| `src/index.html` | Browser host document |
| `src/style.css` | Cabinet layout, colors, controls, and scanlines |
| `src/game/` | Pure simulation: movement, mazes, enemies, coverage, rewards, settings schema |
| `src/render/` | Canvas composition, wall tracing, organic graph-aware strands, sprites, death, and celebration |
| `src/ui/` | Solid side dashboard, arrow/WASD and swipe input, fixed-step loop, signal bridge, and Web Audio |
| `src/art/*.svg` | Editable sprite sources |
| `src/art/sprites_generated.ts` | Generated SVG strings and sprite-name type |
| `pipeline/build.mjs` | Solid-aware esbuild bundle |
| `pipeline/cache_assets.mjs` | Version script and stylesheet URLs in build output |
| `tools/build_svg_art.mjs` | Regenerate the typed SVG markup module |
| `tools/capture_gameplay.mjs` | Capture a running local game for documentation |
| `tests/test_*.mjs` | Fast simulation and settings tests |
| `tests/playwright/` | Browser behavior, sprite-atlas, renderer-readiness, full-frame, and strand checks |
| `tests/playwright/repo_root.mjs` | Shared Git-root anchor; `repo_root.d.mts` supplies strict TypeScript declarations |
| `tests/playwright/e2e/browser_traversal.mjs` | Long manual acceptance driver using real arrow-key events and a detached game projection |
| `tests/test_*.py` | Repository hygiene checks |
| `test-results/` | Disposable browser screenshots and failure evidence |
| `docs/screenshots/` | Maintained documentation images |
| `docs/active_plans/` | Original plan, execution companion, and acceptance reports |

## Common edit locations

- Change speed, primer count, frightened duration, or chew delay in
  [level_table.ts](../src/game/level_table.ts). User difficulty scaling lives in
  [difficulty.ts](../src/game/difficulty.ts).
- Change corridor geometry in [maze_layouts.ts](../src/game/maze_layouts.ts) and
  [maze_layouts_extra.ts](../src/game/maze_layouts_extra.ts), then run the normal
  level validator to confirm connectivity, reachable pickups, house routes,
  tunnel links, and no open two-by-two room.
- Change win conditions, collision order, or reward handling in
  [game_state.ts](../src/game/game_state.ts).
- Change sprite source SVGs, then run `node tools/build_svg_art.mjs` or the normal
  build. Do not edit generated sprite strings by hand.
- Change organic strand geometry in [helix.ts](../src/render/helix.ts) together
  with its editable visual specification in [strand_ribbon.svg](../src/art/strand_ribbon.svg).
- Change dashboard presentation in [hud.tsx](../src/ui/hud.tsx) and
  [overlays.tsx](../src/ui/overlays.tsx); publish new values through
  [game_signals.ts](../src/ui/game_signals.ts).

## Front-door commands

Use [build_github_pages.sh](../build_github_pages.sh) to rebuild `dist/`,
[run_web_server.sh](../run_web_server.sh) for local play,
[check_codebase.sh](../check_codebase.sh) for source checks, and
[run_playwright_tests.sh](../run_playwright_tests.sh) for browser verification.
The check script includes all four production level validations. For the
recorded long browser acceptance, keep the built site running in one terminal
and run
`node tests/playwright/e2e/browser_traversal.mjs http://127.0.0.1:PORT/` in a
second terminal.

For behavior and data flow, see [CODE_ARCHITECTURE.md](CODE_ARCHITECTURE.md).
