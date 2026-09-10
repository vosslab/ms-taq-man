## 2026-09-09

### Additions and New Features

- Start phase 1 of the PCR arcade plan: Solid application host, responsive canvas,
  cabinet color tokens, and Solid-aware production bundler.
- Add pure grid movement with buffered turns and mid-edge reversal, primer-armed
  player extension, and edge coverage accounting with degradation support.
- Wire fixed-step simulation, keyboard movement, primer pickup, strand preview,
  and score display into the browser. Final artwork and render caching remain pending.
- Add four enzyme targeting personalities and initial scatter/chase movement logic.
- Add a touch D-pad, pause control, swipe steering, and visible keyboard focus.
- Author three additional maze arrangements and a four-cycle layout selector.
- Add seven cycle-selected reagent bonuses with tunnel entry, timed wandering,
  exit routing, collection, and bonus points; sprite art remains pending.
- Add cycle tuning for movement, frightened duration, primer placement, Exo/RNase
  chew-back, and high-cycle extension retention after death.
- Advance completed templates through a thermal intermission into the next maze,
  retaining bases and lives while resetting coverage, primers, and actors.
- Add hot-start pickup, frightened speed and collision behavior, enzyme-chain scoring,
  returning enemy state, and delayed Exo degradation of covered edges.

### Fixes and Maintenance

- Route eaten enzymes through the maze graph to the house; derive the house exit
  from its door instead of assuming one layout's coordinates.
- Join wall tiles into rounded continuous boundaries. Add editable polymerase,
  RNA primer and four distinct enzyme sprites; draw synthesized DNA as a helix.
- Preserve high scores on page exit and hidden-tab transitions; pause hidden games.
  Add a live coverage percentage and progress meter, plus browser reload verification.
- Cache DNA helix stamps on a persistent layer, repaint degraded regions, and
  show covered tunnel edges at both screen boundaries.
- Replace endlessly repeating scatter/chase with finite wave schedules and
  permanent late pursuit; frightened mode pauses the wave clock.
- Track the original traversal endpoint through reversals so partial out-and-back
  movement cannot score a full DNA edge.
- Connect enemies to the browser simulation with collision detection, three lives,
  death delay, and unprimed respawn. Final death animation remains pending.

### Developer Tests and Notes

- Phase 1 passes the codebase gate, production build, and browser boot smoke test.
- Seven unit tests and the codebase gate pass after enemy integration. Chromium
  required execution outside the sandbox after macOS denied Mach port registration.
- Add the first connected maze, branded coordinates, bidirectional edge graph,
  tunnel handling, house exclusion, and cached static canvas painting for phase 2.
- Gameplay phases and browser acceptance remain outstanding.
- Add v1 save migration, malformed-save handling, storage-failure checks, and a
  400px browser control flow for movement and pause.
