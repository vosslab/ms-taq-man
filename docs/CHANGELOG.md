## 2026-09-09

### Additions and New Features

- Refresh README with a verified live link, first-cycle example, local launch
  instructions, current status, and documentation routes. Capture the current
  cabinet in docs/screenshots/gameplay.png and embed it in the managed block.
- Add tools/capture_gameplay.mjs for repeatable screenshot refreshes against the
  local preview URL. Capture is 1920x1200 and includes all dashboard controls.

- Document current simulation, rendering, browser lifecycle, audio, persistence,
  and build boundaries, including known differences from the target architecture.

- Replace frightened enemy recolors with an editable unraveled-protein sprite,
  retaining expiry flashing and reduced-motion outlines.

- Add a saved 1-5 difficulty slider controlling enemy speed, from 60% to 110%
  of cycle tuning. Default to Easy (75%); changes apply during play.

- Shift the soundtrack toward playful electronic music: filtered plucks, syncopated
  low bass, seventh chords, synthesized kick/snare/hi-hats, and drum fills.

- Describe available reagent powers in the dashboard and document combo scoring
  and the seven helpful pickup effects in the player guide.

- Consolidate scanlines into one 0-5 slider, with zero disabling the effect.

- Add persisted scanline strength from 1 to 5, defaulting to 3. Retain the separate
  off switch and reduced-motion behavior; validate saved strength values.

- Add fresh-synthesis combo bonuses, TAQ ATTACK callouts, and helpful reagent
  powers: protection, speed, bonus points, and combo boosts. Keep enemy tuning
  and the 50% template OR all primers goal unchanged.

- Make death a full-board scene: desaturate and dim the maze and actors, draw the
  coil last, move it to center, and spin and zoom it across the board.

- Add the player guide covering both cycle-clear goals, queued turns, priming,
  enemies, bonuses, sound settings, and browser persistence; link it from README.

- Replace hot-start dots and returning-enzyme circles with editable activator
  and eyes SVG sprites.

- Celebrate cycle clearance with changing wall colors, five confetti bursts, and
  a victory banner. Reduced motion keeps a steady wall glow and banner.

- Add a persisted scanline toggle with a noninteractive cabinet overlay, suppressed
  when the browser requests reduced motion.

- Expand the soundtrack to eight sections with four lead themes and a sparse
  breakdown. Add spinning molecular debris and a larger unfolding death coil;
  reduced motion uses a static fading coil.

- Add alternating musical phrases, chord pads, swing, and layered arpeggios at
  the quieter volume. Add independent persisted FX control and synthesized cues
  for primers, protection, rewards, death, and cycle completion.

- Make the main control contextual: start a cycle, pause, resume, or start a new
  run after game over.

- Add state-specific cycle guidance and a three-stage thermal progress gauge
  to the side dashboard, including start, ready, pause, death, and game-over feedback.

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

- Let enemies steer at a junction reached after a partial reversal without
  falsely reporting a completed edge or skipping the turn with leftover movement.

- Repair plan links after the source plan moved under active_plans, and encode
  touch-control glyphs as character references for repository encoding compliance.

- Verify live enemy movement scales with difficulty while player speed stays
  fixed, and document all five difficulty levels.

- Verify collection effects for all reagent powers, including bonus points,
  boost timers, combo activation, and cancellation of scheduled chew-back.

- Add browser coverage for keyboard-adjusted scanline endpoints and persistence,
  and update the player guide for the unified slider.

- Move live combo and reward announcements into reserved dashboard space so
  they cannot obscure the maze during play.

- Apply reagent protection to collisions on the pickup frame, closing a timing
  gap where an enemy could still kill Taq before its frightened state updated.

- Strengthen scanlines to a visible two-pixel dark band every five pixels with
  a subtle highlight between bands.

- Preserve both wall outlines at diagonal tile contacts. The previous single-edge
  vertex map could drop boundaries and make collision walls appear to be open floor.

- Add an explicit acceptance ledger separating focused test evidence from missing
  artwork, full-run gameplay, performance, and release gates.

- Verify that early player turns remain queued until a legal junction and that
  a legal direction resumes movement after a wall stop.

- Keep arrow/WASD controls active when dashboard buttons have focus, avoiding
  apparent movement lockups after changing settings. Preserve editable-field
  input and modified browser shortcuts.

- Extract fixed-timestep scheduling and cancellation from App into the game loop
  module; publish rendering and dashboard state once per animation frame.

- Detect strand replacement by render seed even when degradation and re-extension
  occur between frames. Vary helix phase per edge for a less uniform DNA trail.

- Extract the side dashboard's score and progress displays into the planned HUD
  component, consuming the batched simulation signals.

- Lower music master gain from 0.55 to 0.25 and label the sound button with its
  action: Turn music on / Turn music off.

- Move simulation-to-dashboard updates into a single batched Solid signal bridge.
  Keep simulation state independent of UI reactivity.

- Preserve enemy mode-change reversals at tile centers instead of overwriting
  them with normal targeting. Check center and mid-edge transitions.

- Route exiting reagents only through legal corridors and stop movement at the
  exit immediately. Verify return from every corridor in all four mazes.

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
