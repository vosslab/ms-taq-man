# Ms Taq Man - PCR arcade game (Solid + Canvas + SVG)

## Context

`ms-taq-man` is a fresh TypeScript template checkout: no `src/`, no game code, empty
`docs/CHANGELOG.md`. The goal is a browser arcade game with Ms Pac-Man-grade mechanics, reskinned
as PCR: the player is Taq polymerase running a DNA template maze, chased by nucleases and
inhibitors. Deliverable is a GitHub Pages-ready `dist/` built by the existing front-door scripts,
with hand-authored SVG artwork as the visual centerpiece.

Confirmed decisions:

- Flavor only. No quizzes, no teaching panels. PCR is the skin over arcade mechanics.
- Ms Pac-Man parity for everything except the pellet loop: four rotating mazes, four enemy
  personalities, moving bonus items, scatter/chase waves, frightened mode, tunnels, intermissions.
- **Core loop change:** pellets are **primers**, not dNTPs. Collecting a primer anneals it;
  everywhere Taq then walks it **extends DNA behind itself**, leaving a permanent synthesized
  strand. A cycle clears at the difficulty-scaled template-edge coverage target (default 60%) OR when every primer is collected.
  Synthesized DNA remains a visible tangled trail and a source of points.
- SolidJS owns the DOM shell (title, HUD, menus, interstitials, settings). Canvas owns the
  60fps game surface. Sprites are hand-authored `.svg` files. CSS owns theming and cabinet chrome.

## Theme mapping

| Ms Pac-Man | Ms Taq Man | Notes |
| --- | --- | --- |
| Ms Pac-Man | Taq polymerase, hairbow shaped as an Mg2+ cofactor | Mouth wedge is the active-site cleft |
| Maze | DNA template strand | Walls are the sugar-phosphate backbone |
| Pellet | **Primer** | Annealing site; picking one up arms extension |
| Eating dots | **Extending new strand along the path walked** | The trail is the score and the win condition |
| Power pellet | **Hot-start activator** (4 corners) | Frightened mode: enzymes denature |
| Blinky (chase) | `Exo`, 5'-3' exonuclease, red | Targets the player tile |
| Pinky (ambush) | `Dimer`, primer-dimer, pink | Targets 4 tiles ahead |
| Inky (flank) | `Chelate`, EDTA inhibitor, cyan | Vector-flip off Exo |
| Sue (shy) | `RNase`, RNase A, orange | Chases until within 8 tiles, then scatters |
| Fruit | Bench reagents: Mg2+, dNTP mix, BSA, DMSO, betaine, hot-start antibody, glycerol | Enters via tunnel, wanders, exits |
| Level | Thermal cycle | Interstitial: 95C denature / 55C anneal / 72C extend gauge |
| Score | Bases synthesized, plus `2^n copies` readout | Only fresh template scores |
| Death | Enzyme denatured | Taq unwinds into a random coil |

## The extension loop

This replaces dot-eating and is the one piece with no arcade precedent, so it is specified
concretely.

- The maze graph is a set of **edges** (tile-to-tile links along corridors). Coverage is tracked
  per edge, not per tile, so a corridor walked in either direction counts once.
- Taq starts each life **unprimed**: moving covers nothing. Walking over a **primer** anneals it
  and switches Taq to extending. Extending persists until death.
- While extending, every edge fully traversed is marked covered, scores bases, and paints a new
  strand ribbon onto the trail layer.
- Re-walking a covered edge scores nothing and paints nothing new, so the incentive matches
  classic dot-clearing: find fresh corridor.
- **Nucleases chew back.** When `Exo` (and, at higher cycles, `RNase`) crosses a covered edge, that
  edge degrades back to uncovered after a short delay and its ribbon fades out. Coverage is a
  contested resource, not a monotonic fill.
- Cycle clears at difficulty-scaled edge coverage (50/60/70/80/90%, default 60%) OR when all primers are collected (user revision). Primers respawn per cycle; a cycle needs at least one primer
  collected before any progress is possible.
- **Visual payoff:** each ribbon is drawn with a per-edge random seed (jitter, phase offset, slight
  overshoot past the junction), so repeated passes and re-extensions pile into a messy nest rather
  than a clean grid fill.

Tuning knobs live in the level table: primer count, chew-back delay, how many enzymes chew, and
whether extension survives death at high cycles.

## Architecture

Strict TS, ESM, `snake_case` filenames, Prettier two-space for TS (tabs are the Python rule only).
Every file stays well under the 1000-line source gate.

### Simulation core (pure, no DOM, no Solid - unit-testable via `node --test`)

- `src/game/coords.ts` - branded `TileX`/`TileY`/`EdgeId`, `Direction` union, tile/pixel
  conversion, tunnel wrap. Brand constructors are the only `as` casts in the repo.
- `src/game/maze.ts` - parse a maze from string rows into a typed grid; wall/door/tunnel queries;
  house geometry; **edge-graph construction and `EdgeId` encoding**.
- `src/game/maze_layouts.ts` - the four layouts plus per-maze palette keys. Split into `_a`/`_b`
  files if the line gate gets close.
- `src/game/coverage.ts` - the extension model: covered-edge set, mark/degrade, percent complete,
  bases-synthesized accounting, per-edge render seed.
- `src/game/actor.ts` - shared grid movement: cornering, tile centers, direction queueing, speed as
  a per-frame pixel budget.
- `src/game/player.ts` - Taq movement, input buffering, primed/unprimed state, edge-completion
  events, death timeline.
- `src/game/enzymes.ts` - four targeting functions, mode state (scatter/chase/frightened/eaten),
  house exit rules, reverse-on-mode-change, **chew-back emission**.
- `src/game/level_table.ts` - per-cycle tuning as an `as const` table; types derived from it.
- `src/game/bonus.ts` - reagent spawn, tunnel entry, wander, exit.
- `src/game/game_state.ts` - state machine (`attract`, `ready`, `playing`, `dying`,
  `cycle_complete`, `intermission`, `game_over`) and the central `record_event(GameEvent)` funnel.
- `src/game/score.ts` - base scoring, enzyme-chain doubling, extra-life threshold, copy-number math.
- `src/game/save.ts` - versioned `localStorage` schema with forward migration.

### Render (Canvas 2D)

- `src/render/maze_painter.ts` - renders maze walls once per maze to an offscreen canvas, blits.
- `src/render/strand_layer.ts` - persistent offscreen canvas for the DNA nest. New ribbons are
  stamped on edge completion; degraded edges are handled by repainting the covered set for that
  region. Never redrawn wholesale per frame.
- `src/render/sprite_atlas.ts` - loads generated SVG markup into `ImageBitmap`s at device pixel
  ratio; typed lookups.
- `src/render/canvas_renderer.ts` - per-frame composite: maze layer, strand layer, actors,
  overlays. Reads a read-only snapshot, holds no game logic.
- `src/render/animation.ts` - mouth cycle, frightened flash, primer pulse, ribbon fade-in, death
  unwind timing.

### Solid shell (DOM)

Solid owns everything outside the canvas, so HUD and menus are declarative, accessible, and
CSS-themeable while the game loop stays imperative.

- `src/ui/app.tsx` - root component: title screen, canvas host, HUD, overlays, settings.
- `src/ui/hud.tsx` - score, copies, coverage percent, lives, cycle badge, reagent tray.
- `src/ui/overlays.tsx` - ready/paused/game-over/intermission panels, thermal-cycle gauge.
- `src/ui/touch_controls.tsx` - min 56px d-pad for narrow screens.
- `src/ui/game_signals.ts` - the single bridge: the loop pushes a snapshot into Solid signals once
  per frame (or on change for slow-moving values); components read signals. No Solid primitive is
  ever read from inside the simulation.
- `src/ui/input.ts` - arrow keys, WASD, swipe; `Esc` to menu; full keyboard parity.
- `src/main.tsx` - entry: `render(App, root)`, boot the fixed-timestep loop, wire input.

Solid rules that apply here: components run once, so no React-shaped rerender assumptions; never
destructure props; use `<For>`/`<Show>`/`<Switch>` instead of `map()` and ternaries; derive with
`createMemo`, not effects writing signals; `batch()` the per-frame snapshot push so the HUD updates
once per frame; canvas element captured with a callback `ref`, torn down in `onCleanup`. No Solid
primitive is created or read inside `src/game/` or `src/render/`.

### Build divergence for Solid

The canonical `build_github_pages.sh` bundles with the esbuild CLI, which cannot load
`esbuild-plugin-solid`. Per `docs/TYPESCRIPT_STYLE.md`, Solid repos take the sanctioned JS-API
path:

- Add `pipeline/build.mjs` calling `esbuild.build(...)` with `solidPlugin()`.
- Repo-local edit to `build_github_pages.sh`: replace the inline `npx esbuild ...` call with
  `node pipeline/build.mjs`, keeping every other contract (wipe `dist/`, `tsc --noEmit`, copy
  `index.html`/`style.css`, write `.nojekyll`, assert outputs).
- `tsconfig.json` gets `"jsx": "preserve"`, `"jsxImportSource": "solid-js"` (repo-local, same
  class of documented divergence).
- Record all three in `docs/DESIGN_DECISIONS.md` as manual exceptions to re-apply after any
  template propagation run.
- Dependencies added to `package.json`: `solid-js`, `esbuild-plugin-solid`,
  `eslint-plugin-solid` (wired through the consumer-owned `eslint.config.local.js`).

### SVG art pipeline

`src/art/*.svg` are the editable source of truth: stable `viewBox`, semantic groups, unique IDs.
`tools/build_svg_art.mjs` reads them and writes `src/art/sprites_generated.ts`
(`Record<SpriteName, string>` of SVG markup), so no loader flag is needed. Generated module is
committed; regenerate after any art edit.

Art set:

- `taq_man.svg` - polymerase with fingers/thumb/palm domain silhouette, Mg2+ hairbow, mouth-open
  and mouth-closed groups.
- `taq_denature.svg` - death frames, enzyme unwinding to a coil.
- `exo.svg`, `dimer.svg`, `chelate.svg`, `rnase.svg` - four antagonists with distinct silhouettes
  (not recolors), each with eye-direction groups.
- `frightened.svg`, `eaten_eyes.svg` - denatured and eyes-only return states.
- `primer.svg` - annealing hairpin pellet, pulsing.
- `hot_start.svg` - corner power item.
- `strand_ribbon.svg` - the double-helix ribbon tile the strand layer stamps and jitters.
- `reagent_*.svg` - seven bonus reagents.
- `logo_ms_taq_man.svg` - wordmark over a double helix.
- `helix_backdrop.svg` - attract-mode background.

Quality bar per sprite: recognizable silhouette first, two or three fill values per material,
restrained highlights, no gradients that muddy at 16px. Verified by rendering at 16px and 256px.

### CSS direction

Arcade cabinet framing around the canvas: dark lab-clean ground, neon backbone strokes, subtle CRT
scanline behind `prefers-reduced-motion` and a toggle. One token vocabulary
(`--color-backbone`, `--color-primer`, `--color-strand`, `--color-exo`, ...) drives both CSS chrome
and the canvas palette (read once via `getComputedStyle`), so one palette edit changes everything.
Full light/dark handling, fluid `clamp()` scale, min 56px touch targets.

## Build phases

Each phase ends green on `./check_codebase.sh`.

1. **Scaffold**: Solid + plugin deps, `pipeline/build.mjs`, `build_github_pages.sh` divergence,
   tsconfig JSX fields, `src/index.html`, `src/style.css` tokens, `src/main.tsx` with a blank
   resizing canvas.
2. **Maze**: layouts, parser, edge graph, `maze_painter`, static render of maze one.
3. **Player**: actor movement, cornering, tunnels, primer pickup, primed state.
4. **Extension**: `coverage.ts`, `strand_layer.ts`, edge-completion scoring, nest rendering,
   coverage percent in the HUD, cycle-clear condition.
5. **Enzymes**: house exit, four targeting functions, wave table, collisions, lives, death.
6. **Hot start**: frightened mode, chain scoring, eaten-eyes return; enzyme chew-back of covered
   edges.
7. **Cycle loop**: maze rotation, level table, thermal-cycle interstitial, bonus reagents, game
   over, versioned high-score save.
8. **Art pass**: author every SVG, wire generator and atlas, replace placeholders.
9. **Polish**: attract mode, intermissions, CSS shell, touch controls, audio muted by default.
10. **Docs and tests**: README first paragraph (About-safe prose, live Pages URL below it),
    `docs/USAGE.md`, `docs/CODE_ARCHITECTURE.md`, `docs/FILE_STRUCTURE.md`,
    `docs/DESIGN_DECISIONS.md`, `docs/CHANGELOG.md` entries per phase.

## Tests

- `tests/test_maze.mjs` - inline small layout; wall/tunnel queries and edge-graph invariants
  (every corridor edge is bidirectional, no edge crosses a wall).
- `tests/test_coverage.mjs` - mark, re-mark, degrade; percent monotonic under marking; a walked
  loop covers each edge once.
- `tests/test_targeting.mjs` - each enzyme's target tile for fixed inputs; Chelate's vector flip;
  RNase's distance switch.
- `tests/test_score.mjs` - chain doubling, copy-number math.
- `tests/test_save.mjs` - forward migration from a v1 blob.
- `tests/playwright/smoke.spec.ts` - boots over HTTP, arrow key moves Taq, primer pickup raises
  coverage, HUD reachable by role.
- `tests/playwright/art_render.spec.ts` - screenshots the sprite atlas at 16px and 256px into
  `test-results/` for the art review pass.

Existing Python hygiene gates run unchanged.

## Verification

```bash
./check_codebase.sh          # tsc, eslint, prettier, node --test
./run_playwright_tests.sh    # browser smoke + art render
./run_web_server.sh          # local play-test on a random port
source source_me.sh && pytest tests/    # repo hygiene gates
```

Manual acceptance: clear one cycle by covering the template, die once, confirm maze rotation,
confirm chew-back visibly removes strand, confirm the finished maze reads as a tangled nest,
confirm high score survives reload, confirm keyboard-only play, confirm layout at 400px wide.

## Open risks

- Coverage-as-win-condition changes pacing versus dot-eating: a cycle can stall if the last uncovered
  edges sit behind an enzyme camp. Mitigation is the level table (primer count, chew-back rate) plus
  a HUD hint that pulses remaining uncovered corridors after a stall timeout.
- Strand layer performance: stamping is cheap, but a mass degrade could force a large repaint.
  Mitigation is dirty-rect repaint per degraded edge.
- The Solid build divergence must be re-applied after any template propagation run.
- Four hand-authored mazes plus ~15 sprites is the bulk of the wall time. Phases 1-7 use
  placeholder shapes so gameplay is testable before the art pass.
