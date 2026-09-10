# Arcade acceptance ledger

Status as of 2026-09-09. Authority:
[splendid-gathering-tulip.md](../splendid-gathering-tulip.md) and the
[arcade_completion.md](../active/arcade_completion.md) companion.
This is an open ledger, not a completion certificate.

## Mechanics and architecture

| Requirement | Evidence | Status and remaining acceptance |
| --- | --- | --- |
| Four connected rotating mazes, edge graph, tunnels | Maze tests, four layout sources | All four clear through simulation traversal at Chill and Easy; browser playthrough remains |
| Primer pickup, full-edge extension, no duplicate score | Player and coverage tests | Verified in focused tests |
| Buffered turns, reversals, wall recovery | Player tests; keyboard-focus browser regression | Verified in focused tests; late-turn feel remains unmeasured |
| 50% template OR all primers clears cycle | Game-state tests and HUD wording | Both goals exercised through movement; continuous Easy run reaches cycle 5 |
| Four targeting personalities, frightened choices, waves | Targeting and wave tests | Tunnel slowdown implemented and tested; mode-transition parity needs review |
| House return and timed release | Lifecycle tests across all four mazes | Verified focused lifecycle |
| Nuclease chew-back | Game-state delay test, strand seed tracking | 0.6s fade implemented; Chromium fade and repair comparison passed |
| Extra life, chain rewards, copy count, saves | Score, game-state, save tests | Direction, extension, buddy extension, bonuses, and captures use recordEvent; extra-life threshold centralized |
| Moving reagents and exits | Every-corridor exit tests across four mazes | Routing and whole-board tours verified; seven sprites and collected-reagent tray integrated |
| Death and thermal transitions | Simulation tests, procedural animation, overlays | Implemented; full-board death screenshot inspected; motion acceptance remains |
| Fixed timestep, Solid snapshot bridge, HUD, overlays | game_loop, game_signals, hud, overlays modules | Recursively read-only live view; frozen snapshot remains a distinct unresolved requirement |
| Cached maze and persistent strands | maze_painter, strand_layer | Dirty-region repaired alpha within 4/255 of fresh Chromium render; full-nest performance remains |
| DPR ImageBitmap atlas | SVG decode, DPR rasterization, bitmap replacement and disposal | Chromium verified all 17 sprites, doubled dimensions at 2x, and closed resources |

Simulation traversal evidence and command are recorded in
[traversal_baseline.md](traversal_baseline.md). The continuous run includes
celebrations, thermal transitions, retained bases, and an earned extra life.

## Art and interaction

| Artifact or requirement | Current evidence | Remaining work |
| --- | --- | --- |
| taq_man.svg | Polymerase silhouette and bow | Open/closed thumb sprites animate movement; reduced motion stays open |
| exo.svg, dimer.svg, chelate.svg, rnase.svg | Distinct silhouettes | Directional eye groups and personality animations implemented; atlas and motion frames inspected |
| primer.svg | RNA-like strand and staggered pulse | In-game pulse review remains |
| taq_denature.svg | Procedural death equivalent in animation.ts | Evaluate equivalent and document acceptance |
| frightened.svg, eaten_eyes.svg, hot_start.svg | Authored, integrated, inspected at 16px and 256px | In-game state-transition acceptance remains |
| strand_ribbon.svg | Procedural double helix | Fade implemented; evaluate procedural equivalent, organic junctions, and full-nest evidence |
| Seven reagent SVGs | All seven authored, integrated by bonus name, inspected at 16px and 256px | Actual collection visual acceptance remains |
| logo_ms_taq_man.svg, helix_backdrop.svg | Editable SVG wordmark and attract backdrop integrated | Atlas decoding and rendered inspection passed |
| Muted-default music, independent FX | Six browser smoke tests include persistence and music waveform | FX event waveform and attended listening remain |
| Scanlines, reduced motion | Saved 0-5 slider; endpoint reload browser tests; reduced-motion CSS and animations | Browser preference acceptance remains |
| Light/dark palette and shared canvas tokens | System light/dark cabinet; backbone and strand colors read from CSS | Remaining sprite/effect palette tokens need review |
| Responsive 16:10 cabinet and touch/keyboard parity | Desktop and 400px screenshots; focus regression | Current desktop cabinet captured and inspected; latest mobile review remains |
| Victory celebration | Chromium cycle_celebration.png inspected | Actual traversal-triggered celebration and motion review remain |

## Release gates

- Latest codebase gate: 47 unit tests, TypeScript, lint, and formatting pass.
- Latest browser suite: six smoke tests and one art atlas test pass; these do not clear a full cycle.
- Production build passes and emits dist with cache-versioned assets.
- Art atlas test decodes authored SVGs and captures 16px/256px renders.
- Python hygiene: 1,035 checks passed. Local launcher was run successfully for README capture.
- Attended full-run play acceptance remains unverified.
- Required README, usage, architecture, file structure, and decisions need final review.
- Full-run evidence must include each maze, a death/repriming run, visible chew-back,
  re-extension, bonus collection, keyboard-only play, and a completed nest.
- Record completion time, deaths, coverage history, and frame timing before tuning claims.
- Independent mechanics and visual review remains open.

## Next implementation sequence

1. Complete remaining logo/backdrop artwork and resolve procedural-art equivalents.
2. Verify full-nest rendering, organic junctions, and frame timing.
3. Complete light/dark palette and shared canvas tokens.
4. Run browser traversal and remaining visual gates, then finalize documentation and review.
