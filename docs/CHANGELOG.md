## 2026-09-09

### Additions and New Features

- Preserve the successful 48-input browser route as a controlled-clock Playwright
  acceptance test, asserting cycle completion and the amplified-template guidance
  through keyboard input alone.

- Verify a production-browser cycle through 48 arrow-key inputs and the normal
  animation loop. Easy clears at 60.3% with three lives; capture the resulting
  celebration and document the controlled-clock evidence limits.

- Test clamp shielding against simultaneous overlapping enemies across repeated
  collision checks: lives remain intact, capture score stays zero, and enemies
  retain their normal state.

- Replace internal phase identifiers in the dashboard with readable labels such
  as Replicating and Run complete; use correct singular life/copy wording.

- Run the production-level validator from check_codebase.sh so corridor geometry,
  reachability, house routing, and tunnel checks are part of normal verification.

- Group dashboard controls, settings, score tiles, cycle goals, and helper status
  with consistent spacing and distinct number colors. Collapse empty message gaps.
- Add `node --import tsx tests/e2e/validate_levels.mjs` to check all four layouts:
  parsing/connectivity, no open 2x2 rooms, pickup reachability, enemy house-return
  paths, and tunnel links. All four pass.

- Tighten cycles 2-4 into single-tile corridors, removing broad floor patches
  around the enzyme house and tunnels and pruning resulting empty spurs. Add a
  production-layout invariant forbidding open 2x2 rooms. Verify connectivity,
  house return, reagent tours, clamp pickup, and all Chill/Easy traversal runs.
- Revised-layout continuous Easy traversal reaches cycle 5 with two lives in
  139 simulated seconds. Cycle 2 costs the driver two lives; human difficulty
  equivalence is not established by these movement checks.

- Remove the on-screen direction pad and its unused component/styles. Lead with
  arrow-key steering, retain WASD and maze swipes, and update controls documentation
  and the narrow-layout keyboard regression.

- Move the direction pad directly beneath the maze, keeping steering controls
  near the board on mobile instead of below the long dashboard. Keep one shared
  control instance and preserve scanline bounds around the canvas only.

- Embellish the logo with a molecular bow, nucleotide beads, layered lettering,
  a curved neon underline, and gently shimmering stars. Respect reduced motion.

- Refresh README gameplay evidence for the current logo, 60-percent default,
  light cabinet, collectible-clamp prompt, and DNA color key. Capture the full
  document so taller dashboard content and the footer are not cropped.

- Add browser regression coverage for live system light/dark cabinet switching
  and reduced-motion scanline suppression without changing the saved setting.

- Extend the clamp event regression to verify rendered ownership metadata and
  document persistent strand colors and color changes after rebuilding.

- Color clamp-built DNA violet/pink while Taq DNA stays green/blue, with a
  dashboard key. Track the builder per synthesis event, preserve color on
  rewalks and chew fades, and switch provenance only when an edge is rebuilt.

- Show clamp construction feedback on both tunnel mouths for a wrapped DNA
  edge, instead of omitting its glow or drawing a line across the maze.

- Make clamp assistance explicit: highlight each newly built DNA edge and
  announce added bases. Replace rescue-triggered frightened mode with a visible
  three-second collision shield, so rescue no longer makes enemies edible.

- Cancel active and scheduled FX voices when effects are disabled, the game is
  paused or hidden, or the controller is disposed. Verify mute and pause stop
  scheduled notes in Chromium Web Audio, preventing residual sound tails.

- Revalidate traversal with difficulty-scaled coverage: all Chill/Easy maze runs
  pass, and the continuous Easy run reaches cycle 5 in 139 simulated seconds.
  Synchronize active plans with the user's 60-percent default revision.

- Add browser coverage for the default 60 percent goal, live 90/50 percent
  difficulty endpoints, updated instructions, and persistence across reload.

- Scale template coverage goals with difficulty: 50/60/70/80/90 percent from
  Chill through Wild, with default Easy at 60 percent. Update the meter and
  instructions live, retain all-primers completion, and test a mid-cycle decrease.

- Revalidate repository hygiene after the gameplay, art, and documentation work:
  all 1,035 Python checks pass. Refresh the acceptance ledger for current test
  counts, tunnel behavior, read-only rendering, branding, and light-mode styling.

- Slow live enemies to 65% of their current speed on tunnel tiles and adjacent
  traversals. Preserve returning-eye speed and player movement; test both cases.

- Read strand primary, secondary, and rung colors from the root CSS palette
  when creating the renderer, alongside the existing backbone color. Pass the
  palette through cached drawing and chew fades, including tunnel strands.

- Add movement-driven clamp pickup acceptance on all four layouts. Each ring
  is reachable and recruits the helper in 6-7 simulated seconds with enemies
  active and no lives lost.

- Give canvas rendering and its maze/strand painters recursively read-only
  state types, including maps, sets, arrays, and nested actors. Preserve branded
  coordinates and live observation without per-frame cloning. This is a compile-
  time ownership boundary, not a runtime frozen snapshot.

- Follow the system light-color preference for cabinet background, dashboard,
  buttons, and readable amber/green accents. Preserve the dark game board and
  reagent tray. Inspect the light cabinet and verify live switching to dark.

- Revalidate all eight maze/difficulty traversals and the continuous four-cycle
  run after making the helper collectible. All clear; update evidence to record
  the changed times, one lost life, and clamp collection status.

- Replace the automatic pet with a collectible sliding-clamp-inspired protein
  ring. It appears five seconds into each cycle and must be picked up before
  helping. Update artwork, dashboard prompts, and usage; test pickup gating and
  verify an uncollected clamp cannot rescue collisions.

- Add the editable Ms Taq Man wordmark over a double helix and integrate it in
  the responsive header. Add a faint helix backdrop shown only in attract mode.

- Give synthesized helices seeded curvature and variable width, with slight
  overlap past junctions. Inspect all four full-coverage boards after repeated
  repairs; preserve corridor visibility and deterministic strand geometry.

- Capture all four fully synthesized mazes after repeated chewing and repair.
  Record strand-only Chromium timings with readback and explicitly retain
  whole-game performance and organic-nest appearance as unfinished acceptance.

- Refresh the acceptance ledger and architecture guide for the implemented
  event funnel, DPR atlas, directional animation, strand fade, reagent tray,
  and movement-driven cycle acceptance. Preserve remaining release gates.

- Extend traversal acceptance to one uninterrupted default-Easy run through four
  cycles, celebrations, and thermal transitions. It reaches cycle 5 with four
  lives and 5,010 carried bases in 121 simulated seconds.

- Add a reproducible movement-driven acceptance runner for all four mazes at
  Chill and Easy. All eight runs clear with active enemies and Pip, preserving
  three lives; record timings and the limits of this simulation evidence.

- Animate enemy personalities: Exo snaps, Dimer twists, Chelate pulses with an
  orbital arc, and RNase wobbles. Frightened coils shiver and returning eyes trail
  speed strokes. Keep collision centers and speeds unchanged; simulation time
  freezes poses on pause and reduced motion uses static sprites.
- Inspect six animation states in Chromium across six frames; verify changing
  pixels during motion and identical frames with reduced motion enabled.

- Add Pip, an automatic lab buddy with editable mint pet artwork. Pip follows
  corridor paths, builds or repairs template, distracts Exo from a distance, and
  rescues a dangerous collision with three seconds of protection before a
  20-second recharge. Show rescue readiness in the dashboard; preserve primer goals.
- Verify buddy rescue/recharge, ordinary traversal and synthesis, and unchanged
  primer/combo behavior with game tests; inspect the sprite at 16px and 110px.

- Add editable eye-white and directional-pupil groups to all four enemy SVGs.
  Cache four directional bitmap variants and select them from actor movement;
  returning eyes also follow direction. Inspect all 20 variants in Chromium
  at 16px and 110px, preserving the distinct enemy silhouettes.

- Rasterize the SVG atlas into device-pixel-ratio ImageBitmaps, regenerate on
  renderer resize, and close replaced or disposed bitmaps. Chromium verified all
  17 sprites decode, 2x dimensions, and bitmap cleanup.

- Fade chewed strands over 0.6 seconds using simulation time; pause freezes the
  fade, reduced motion removes immediately, and re-extension cancels old residue.
- Repair one bounding dirty region per coverage revision to prevent repeated
  stamping at overlapping strand repairs. Chromium checks verified changing fade
  frames and repaired alpha within 4/255 of a fresh render (raster rounding).

- Add the file-structure guide with source ownership, generated artifacts,
  common edit locations, and canonical build and verification commands.

- Show the seven most recent collected reagents as accessible sprite trophies in
  the dashboard, retained across cycles and reset for a new run.

- Animate the moving polymerase's active-site cleft with an editable closed-thumb
  sprite variant. Keep a steady open state while stopped or under reduced motion.

- Add the planned browser atlas capture, decoding every SVG and rendering each at
  16px and 256px into test-results/sprite_atlas.png.

- Add six distinct reagent SVGs and select the matching sprite for each pickup:
  paired dNTP vials, BSA shield, DMSO speed flask, betaine crystal, antibody, and glycerol drop.

- Add a gentle, staggered primer pulse to make remaining pickups easier to spot;
  reduced-motion users see steady sprites and paused games freeze the pulse.

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

- Add a four-maze regression requiring reagent tours to reach upper and lower
  interior corridors instead of repeatedly visiting tunnel-adjacent tiles.

- Replace reagent turn cycling, which trapped pickups near the tunnel, with
  routes through corner activators. Allow 40 seconds of touring before exit.

- Record an actual-traversal baseline with enemies and chew-back active across
  all four mazes. The naive primer-seeking driver lost every run; full-run
  acceptance remains open and tuning is unchanged pending stronger evidence.

- Use wrapped horizontal distance for reagent collection at tunnel exits, matching
  the collision geometry already used for enemies.

- Award the 10,000-point extra life immediately inside score events, before a
  later collision can consume the last life. Add a dashboard reward announcement.

- Route reagent point awards and enzyme-chain captures through the central game
  event funnel, preserving existing scoring and pickup effects.

- Record a visual review of all sixteen current SVGs at 16px and 256px, including
  silhouette findings and remaining animation and in-game acceptance gaps.

- Refresh the acceptance ledger with completed reagent/state sprites, scanline
  persistence, current test results, and inspected desktop/death captures.

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
