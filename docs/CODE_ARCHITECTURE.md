# Code architecture

The game separates mutable simulation, canvas rendering, and the Solid dashboard.
The browser owns a single game instance; there is no server or account service.

## Simulation

[game_state.ts](../src/game/game_state.ts) owns phases, collision resolution,
cycle transitions, lives, pickups, and scheduled degradation. Its fixed-step
entry point is `tick`. Simulation modules import neither Solid nor browser APIs.

[maze.ts](../src/game/maze.ts) parses tile layouts and builds an undirected
corridor-edge graph. House cells are excluded from player coverage. Movement
uses tile positions plus edge progress; completed traversals notify the player
extension model. A reversal that returns to its starting tile does not synthesize
an entire edge.

The production layouts are deliberately narrow, connected corridors. The regular
level validator checks parsing, connectivity, tunnel links, pickup reachability,
house-return paths, and forbids open two-by-two walkable rooms so a layout cannot
create the open-space or hidden-wall traps the game previously risked.

[coverage.ts](../src/game/coverage.ts) stores covered edges, earned bases, and
render seeds. Degradation removes coverage without subtracting earned points.
Cycle clearance checks the difficulty-scaled coverage target (50/60/70/80/90%,
with Easy at 60%) OR no remaining primers immediately after player movement,
before enemy updates can undo that success.

[enzymes.ts](../src/game/enzymes.ts) owns targeting, mode transitions, house
transit, and chew-back emission. Ordinary targeting uses arcade personalities;
house transit uses shortest-path routing. Cycle tuning and user difficulty are
separate: difficulty scales live enemy speed, while eaten eyes retain return speed.

[arcade_rewards.ts](../src/game/arcade_rewards.ts) owns combo and boost timers.
Reagent pickup effects are applied by game_state. The central event funnel
handles direction, player and buddy extension, bonus points, and enzyme captures.
Extra-life checks run immediately after scoring events.

## Browser lifecycle

[app.tsx](../src/ui/app.tsx) creates the game, renderer, sound controllers, input
listeners, and persistence callbacks. Solid cleanup removes listeners, cancels
the loop, disconnects the resize observer, and closes audio contexts.

[game_loop.ts](../src/ui/game_loop.ts) advances at 1/60 second, caps catch-up at
0.1 seconds per animation frame, and then publishes once. Publication renders
the canvas, updates sound, and pushes dashboard values through
[game_signals.ts](../src/ui/game_signals.ts). That bridge batches Solid updates;
simulation never reads UI signals.

Keyboard input is window-scoped so dashboard focus does not disable steering.
Editable fields and modified shortcuts retain their normal behavior. Swipe and
keyboard input call the same direction event path.

## Rendering and audio

[canvas_renderer.ts](../src/render/canvas_renderer.ts) composites a cached maze,
persistent strand layer, and SVG actors. It consumes a recursively read-only live
game view synchronously after a fixed simulation batch; it is not an immutable
snapshot. Wall tracing preserves multiple outgoing boundaries at diagonal contacts.
Strand seeds detect degradation and re-extension between rendered frames.

[helix.ts](../src/render/helix.ts) paints graph-aligned organic paired backbones
and base-pair rungs. [strand_ribbon.svg](../src/art/strand_ribbon.svg) is the
editable, atlas-reviewed visual specification for that runtime equivalent rather
than a rectangle stamped directly into corridors. The strand layer caches complete
coverage, fades chew-back locally, and repairs only affected edge regions.

Death composites a grayscale board before drawing the enlarged coil. Cycle
completion adds wall color changes, confetti, and a banner. Live reward messages
stay in the dashboard. Reduced-motion preferences simplify these effects.

Editable SVG sources live in `src/art`, including the denaturing polymerase and
strand-ribbon specifications. The build generates TypeScript markup with
[build_svg_art.mjs](../tools/build_svg_art.mjs). The current 22-name atlas loads
DPR-scaled ImageBitmaps, including directional enemy variants. Resizing replaces
bitmaps; renderer disposal closes them.

Music and FX use independent Web Audio contexts and persisted mute controls.
The soundtrack schedules short look-ahead phrases; drums synthesize noise and
pitched envelopes. No external audio files are fetched.

## Persistence and build

[save.ts](../src/game/save.ts) validates localStorage values, migrates older
settings, and tolerates unavailable storage. Saved data includes best score,
audio settings, scanlines, and difficulty. Active runs are not persisted.

[build_github_pages.sh](../build_github_pages.sh) generates SVG markup, typechecks,
bundles Solid through the esbuild JavaScript API, and emits the standalone dist
site. Asset hashes in URLs prevent stale script and stylesheet reuse.

Browser acceptance includes a state-aware manual traversal driver that uses real
arrow-key events and observes a detached copied projection of the game. It is
deliberately outside the short regular suite because it is a long acceptance run,
not a stable CI oracle. Current evidence is recorded in
[acceptance_matrix.md](active_plans/reports/acceptance_matrix.md).
