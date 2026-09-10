## 2026-09-09

### Additions and New Features

- Use a wide desktop cabinet with a square maze and side dashboard; stack the
  dashboard below the maze on narrow screens.

- Show hot-start seconds remaining and warn of expiry with flashing frightened
  sprites, using a steady outline for reduced-motion users.

- Clear each cycle at 50% edge coverage OR when all primers are collected, as requested.
  Update the progress meter and instructions to show both routes.

- Add an original synthesized arcade music loop with bass and percussion, a persisted
  music toggle, and silence during pauses and hidden-tab periods. Default is muted.

- Add a longer death sequence with impact ring, unfolding protein coil and fade;
  replace the white bonus placeholder with a magnesium reagent flask.

- Add an execution-ready arcade completion companion with explicit ownership,
  dependencies, missing artifacts, full-run acceptance, and evidence requirements.

- Start phase 1 of the PCR arcade plan: Solid application host, responsive canvas,
  cabinet color tokens, and Solid-aware production bundler.
- Add pure grid movement with buffered turns and mid-edge reversal, primer-armed
  player extension, and edge coverage accounting with degradation support.
- Wire fixed-step simulation, keyboard movement, primer pickup, strand preview,
  and score display into the browser. Final artwork and render caching remain pending.
- Add four enzyme targeting personalities and initial scatter/chase movement logic.
- Award one extra life at 10,000 total points and highlight uncovered corridors
  after fifteen seconds without new synthesis.
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

- Resolve cycle completion immediately after player movement, before same-frame
  enemy collisions or degradation can cancel a reached goal.

- Extract canvas setup, sprite drawing, strand compositing, and resize cleanup into
  the renderer module; the Solid app delegates drawing through its explicit interface.

- Make enabling music audible on the title screen and interstitials, increase the
  master level, and sustain notes before release. Pause and hidden-tab silence remain.

- Show primers remaining and current extension state. Correct death copy so it
  does not claim the accumulated strand is erased. Cycle-clear choice remains open.

- Count nearby primers within the level's placement budget instead of adding them
  on top; verify small and oversized requests against available sites.

- Give frightened enemies seeded, varied legal turns instead of scatter-corner
  targeting, with deterministic behavior checks.

- Keep music initialization within user gestures, handle unavailable audio explicitly,
  and verify the music preference survives a browser reload without runtime errors.

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
- Stop returning enemies exactly at the house during recovery, discarding remaining
  movement budget. Verify actual return, wait, and release in all four mazes.
- Regenerate formatted SVG sprite markup during builds and fingerprint script and
  stylesheet URLs so browsers fetch changed artwork and code.
- Connect enemies to the browser simulation with collision detection, three lives,
  death delay, and unprimed respawn. Final death animation remains pending.

### Developer Tests and Notes

- Verify final-primer completion through real movement following death and an
  unprimed respawn, without synthesizing half the maze or mutating completion state.

- Phase 1 passes the codebase gate, production build, and browser boot smoke test.
- Seven unit tests and the codebase gate pass after enemy integration. Chromium
  required execution outside the sandbox after macOS denied Mach port registration.
- Add the first connected maze, branded coordinates, bidirectional edge graph,
  tunnel handling, house exclusion, and cached static canvas painting for phase 2.
- Gameplay phases and browser acceptance remain outstanding.
- Add v1 save migration, malformed-save handling, storage-failure checks, and a
  400px browser control flow for movement and pause.
