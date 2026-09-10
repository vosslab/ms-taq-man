# File structure

The editable game lives under `src/`. The build publishes only `dist/`.

| Path | Responsibility |
| --- | --- |
| `src/main.tsx` | Mount the Solid application |
| `src/index.html` | Browser host document |
| `src/style.css` | Cabinet layout, colors, controls, and scanlines |
| `src/game/` | Pure simulation: movement, mazes, enemies, coverage, rewards, settings schema |
| `src/render/` | Canvas composition, wall tracing, strands, sprites, death, and celebration |
| `src/ui/` | Solid dashboard, input, fixed-step loop, signal bridge, and Web Audio |
| `src/art/*.svg` | Editable sprite sources |
| `src/art/sprites_generated.ts` | Generated SVG strings and sprite-name type |
| `pipeline/build.mjs` | Solid-aware esbuild bundle |
| `pipeline/cache_assets.mjs` | Version script and stylesheet URLs in build output |
| `tools/build_svg_art.mjs` | Regenerate the typed SVG markup module |
| `tools/capture_gameplay.mjs` | Capture a running local game for documentation |
| `tests/test_*.mjs` | Fast simulation and settings tests |
| `tests/playwright/` | Browser behavior checks and sprite atlas capture |
| `tests/test_*.py` | Repository hygiene checks |
| `test-results/` | Disposable browser screenshots and failure evidence |
| `docs/screenshots/` | Maintained documentation images |
| `docs/active_plans/` | Original plan, execution companion, and acceptance reports |

## Common edit locations

- Change speed, primer count, frightened duration, or chew delay in
  [level_table.ts](../src/game/level_table.ts). User difficulty scaling lives in
  [difficulty.ts](../src/game/difficulty.ts).
- Change corridor geometry in [maze_layouts.ts](../src/game/maze_layouts.ts) and
  [maze_layouts_extra.ts](../src/game/maze_layouts_extra.ts).
- Change win conditions, collision order, or reward handling in
  [game_state.ts](../src/game/game_state.ts).
- Change sprite source SVGs, then run `node tools/build_svg_art.mjs` or the normal
  build. Do not edit generated sprite strings by hand.
- Change dashboard presentation in [hud.tsx](../src/ui/hud.tsx) and
  [overlays.tsx](../src/ui/overlays.tsx); publish new values through
  [game_signals.ts](../src/ui/game_signals.ts).

## Front-door commands

Use [build_github_pages.sh](../build_github_pages.sh) to rebuild `dist/`,
[run_web_server.sh](../run_web_server.sh) for local play,
[check_codebase.sh](../check_codebase.sh) for source checks, and
[run_playwright_tests.sh](../run_playwright_tests.sh) for browser verification.

For behavior and data flow, see [CODE_ARCHITECTURE.md](CODE_ARCHITECTURE.md).
