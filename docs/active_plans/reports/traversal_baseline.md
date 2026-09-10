# Traversal and level-validation baseline

The production validation and traversal evidence now address the earlier concern
that generated-looking layouts could contain open spaces or hidden-wall traps.

## Layout validation

`./check_codebase.sh` runs `tests/e2e/validate_levels.mjs` for all four layouts.
Each level passes parsing, corridor connectivity, tunnel links, pickup
reachability, enzyme house-return paths, and a no-open-two-by-two-room check.
The regular Node suite adds direct maze assertions and currently contains 59 tests.

This validates topology and accessible routes; it does not replace subjective
playtesting of enemy pressure or visual legibility.

## Simulation traversal

The deterministic movement runner clears every maze at Chill and Easy through
normal movement, while enemies, collisions, primers, and coverage rules remain
active. A continuous default-Easy run reaches Cycle 5 after all four thermal
transitions, preserving carried bases and earning the normal extra-life path.

The win condition is deliberately an either/or rule: at default Easy, cover 60%
of template edges **or** collect every primer. Difficulty changes the coverage
goal to 50/60/70/80/90% from Chill through Wild; the all-primer route remains
valid for every difficulty.

## Browser comparison

The separate state-aware browser driver reaches Cycle 5 through real arrow-key
input. Its four clear times are 49.8, 39.0, 37.1, and 46.5 seconds. The run had
one intentional death in Cycle 1 and none in cycles 2-4. See
[browser_traversal.md](browser_traversal.md) for its method, re-prime, chew-back,
re-extension, and reagent evidence.

The simulation runner is a deterministic reachability baseline; the browser
driver establishes the same broad finishability claim in the rendered game.
Neither result quantifies a typical human player's win rate or establishes a
universal difficulty rating.
