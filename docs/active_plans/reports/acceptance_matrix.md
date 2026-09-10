# Arcade acceptance ledger

Status as of 2026-09-09. Authority: the root
[splendid-gathering-tulip.md](../splendid-gathering-tulip.md) and the
[arcade_completion.md](../active/arcade_completion.md) companion.
This is an open ledger, not a completion certificate.

## Mechanics and architecture

| Requirement | Evidence | Status and remaining acceptance |
| --- | --- | --- |
| Four connected rotating mazes, edge graph, tunnels | Maze tests, four layout sources | Implemented; full playthrough of each remains |
| Primer pickup, full-edge extension, no duplicate score | Player and coverage tests | Verified in focused tests |
| Buffered turns, reversals, wall recovery | Player tests; keyboard-focus browser regression | Verified in focused tests; late-turn feel remains unmeasured |
| 50% template OR all primers clears cycle | Game-state tests and HUD wording | Verified transitions; actual traversal clear remains |
| Four targeting personalities, frightened choices, waves | Targeting and wave tests | Implemented; tunnel speed tuning and mode-transition parity need review |
| House return and timed release | Lifecycle tests across all four mazes | Verified focused lifecycle |
| Nuclease chew-back | Game-state delay test, strand seed tracking | Implemented; visible fade missing |
| Extra life, chain rewards, copy count, saves | Score, game-state, save tests | Implemented; all rewards still need central event funnel |
| Moving reagents and exits | Every-corridor exit tests across four mazes | Routing verified; distinct art and reagent tray missing |
| Death and thermal transitions | Simulation tests, procedural animation, overlays | Implemented; death visual acceptance remains |
| Fixed timestep, Solid snapshot bridge, HUD, overlays | game_loop, game_signals, hud, overlays modules | Implemented; render snapshot is shallow read-only |
| Cached maze and persistent strands | maze_painter, strand_layer | Implemented; full-nest performance and dirty-region correctness need rendered checks |
| DPR ImageBitmap atlas | sprite_atlas uses HTMLImageElement | Incomplete |

## Art and interaction

| Artifact or requirement | Current evidence | Remaining work |
| --- | --- | --- |
| taq_man.svg | Polymerase silhouette and bow | Mouth groups and animation |
| exo.svg, dimer.svg, chelate.svg, rnase.svg | Distinct silhouettes | Eye-direction groups and 16px/256px review |
| primer.svg | RNA-like strand | Pulse and size review |
| taq_denature.svg | Procedural death equivalent in animation.ts | Evaluate equivalent and document acceptance |
| frightened.svg, eaten_eyes.svg, hot_start.svg | Filters and primitive placeholders | Author and integrate |
| strand_ribbon.svg | Procedural double helix | Evaluate equivalent; fade, organic junctions, full-nest evidence |
| Seven reagent SVGs | Only reagent_magnesium.svg exists | Author other six and select by bonus |
| logo_ms_taq_man.svg, helix_backdrop.svg | Text header only | Author and integrate |
| Muted-default music, independent FX | Five browser smoke tests include persistence and music waveform | FX event waveform and attended listening remain |
| Scanlines, reduced motion | Saved toggle; reduced-motion CSS and animations | Browser preference acceptance remains |
| Light/dark palette and shared canvas tokens | Dark tokens; several hardcoded canvas colors | Incomplete |
| Responsive 16:10 cabinet and touch/keyboard parity | Desktop and 400px screenshots; focus regression | Latest full sidebar visual review remains |
| Victory celebration | Chromium cycle_celebration.png inspected | Actual traversal-triggered celebration and motion review remain |

## Release gates

- Latest codebase gate: 32 unit tests, TypeScript, lint, and formatting pass.
- Latest browser suite: five smoke tests pass; these do not clear a full cycle.
- Production build passes and emits dist with cache-versioned assets.
- Art atlas render test is missing.
- Python hygiene suite and attended local play gate remain unverified.
- Required README, usage, architecture, file structure, and decisions need final review.
- Full-run evidence must include each maze, a death/repriming run, visible chew-back,
  re-extension, bonus collection, keyboard-only play, and a completed nest.
- Record completion time, deaths, coverage history, and frame timing before tuning claims.
- Independent mechanics and visual review remains open.

## Next implementation sequence

1. Complete and render the missing sprite set and wire bonus-specific artwork.
2. Add chew-back fade and verify dirty regions and re-extension in Chromium.
3. Complete palette/settings and event-funnel gaps.
4. Run actual traversal acceptance on every maze, then finish documentation and gates.
