# Plan: PCR arcade completion

## Context

This execution companion preserves the full scope of
[splendid-gathering-tulip.md](../splendid-gathering-tulip.md).
Current source includes four connected mazes, movement, coverage, targeting, waves,
bonuses, saves, and six SVG sprites. Browser evidence covers basic movement, mobile
controls, and reload persistence. It does not yet establish a complete, enjoyable run.

The previous checks passed 22 unit tests. That is implementation evidence, not arcade
acceptance. Every item below remains open until its own evidence exists.

## Objectives

- Deliver an immediately readable, responsive PCR chase game with a satisfying complete run.
- Make synthesis feel tangible: RNA primers start extension, helix ribbons accumulate,
  nucleases visibly chew them back, and a completed maze becomes a tangled DNA nest.
- Preserve the user's connected, rounded walls and recognizable molecular characters.
- Finish every original-plan artifact or record an explicit, justified equivalent with
  matching acceptance evidence. Missing files do not disappear from scope through renaming.

## Design philosophy

Use the scientific method: measure pacing through real runs and adjust the owning level
table. Fix the design where runtime behavior contradicts the rules. Dream big by finishing
the distinctive coverage mechanic and visual payoff before adding unrelated features.

## Scope

All original mechanics, four mazes, sprite set, animations, settings, audio, architecture,
documentation, build contracts, and acceptance gates remain in scope. The tasks below
strengthen their implementation and define observable completion.

## Non-goals

Quizzes, accounts, online leaderboards, and new gameplay modes are outside this plan.
Publishing to GitHub is a separate external action; a Pages-ready build is required here.

## Implementation plan

Each task has one owner. Owners are dispatch roles, not claims that agents are running.
Every implementation handoff includes changed paths, checks, limitations, and evidence.

| ID | Owner and owned paths | Depends on | Deliverable and success criteria |
| --- | --- | --- | --- |
| A1 | Acceptance owner: `docs/active_plans/reports/acceptance_matrix.md` | none | Enumerate every original requirement, artifact, invariant, and command. Map each to current source and direct evidence; label missing, partial, or verified. Include all gaps below. |
| A2 | Simulation owner: `src/game/`, behavior tests | A1 | Verify full-edge traversal, reversal, house exit/return/release, tunnel collision and speed, frightened reversals and random decisions, finite waves, primer recovery after death, exact primer-count tuning, extra-life timing, bonus wander/exit, and cycle transitions. Route all rewardable events through the event funnel. |
| A3 | Architecture owner: `src/ui/`, `src/render/`, `src/main.tsx` | A2 | Extract the imperative loop and renderer from App. Implement snapshot bridge, HUD and overlays with Solid ownership and cleanup. Rendering consumes read-only state; no simulation reads Solid. Preserve behavior through the refactor. |
| A4 | Art owner: `src/art/*.svg`, art review document | A1 | Complete death coil, frightened, eyes, hot-start, strand ribbon, seven reagents, logo, backdrop, and player mouth/eye-direction groups. Keep distinct silhouettes and semantic SVG groups. Inspect every sprite at 16px and 256px. Deliver source assets without editing the generated atlas. |
| A5 | Rendering owner: `src/render/`, atlas generator | A3, A4 | Load the complete typed atlas at device scale; animate active-site cleft, primer pulse, frightened expiry flash, and death unwind. Add seeded strand phase/overshoot, re-extension variation, and visible chew-back fade with bounded dirty-region repaint. Validate full-maze performance. |
| A6 | Interaction owner: `src/ui/`, `src/style.css` | A3 | Finish attract screen, ready/pause/game-over panels, thermal gauge and intermission animation; contextual start/restart, Escape menu, and keyboard/touch parity. Add muted-by-default audio and persisted settings, reduced-motion support, scanline toggle, light/dark palettes, reagent tray, and readable current priming state. |
| A7 | Acceptance owner: `tests/playwright/`, `tests/e2e/`, screenshots | A2, A5, A6 | Demonstrate full cycle clearance through movement, death/repriming, all four rotations, chew-back removal and re-extension, bonus collection, save reload, and keyboard-only play. Capture 400px and desktop evidence, full nest, and sprite atlas. Run attended play for pacing and readability. |
| A8 | Documentation owner: README and project docs | A7 | Complete usage, architecture, file structure, decisions, human guidance, changelog, and final acceptance matrix. Run all prescribed gates and report exact limitations. |

Execution order: A1 first, then A2 and A4 can proceed independently. A3 follows A2;
A5 and A6 share UI/render boundaries and run serially unless ownership is narrowed in
their dispatch briefs. A7 precedes final documentation closure. Maximum independent
doers initially: two. Parallel-plan ready: yes for A2/A4 only; other work is dependency-led.

## Acceptance criteria

- A1 provides a requirement-by-requirement ledger, including named original artifacts.
- A2 tests properties and meaningful transitions with inline deterministic inputs.
  End-to-end runs and rendered evidence stay outside the fast unit lane.
- A7 clears a cycle through actual traversal, with enemies and chew-back active. Directly
  filling the covered-edge set proves a transition only; it cannot prove finishability.
- Every maze has full-cycle evidence. Repeat a cycle after a death to expose primer starvation.
- The finished nest is recognizably double-stranded and organic at desktop and 400px.
  Connected wall boundaries remain continuous; sprites do not obscure traversable choices.
- Record frame timing on a named browser/device during a full nest and simultaneous
  chew-back. Target a 60fps budget; investigate sustained frame work exceeding 16.7ms.
- Pacing report records completion time, deaths, final-edge search time, and net coverage
  over time. If coverage stalls, change level tuning or enemy behavior from this evidence;
  preserve the user-revised difficulty-scaled edge coverage (50/60/70/80/90%, default 60%) OR all primers win condition.
- An independent review checks mechanics and visual results against the original plan.
  Visual criticism identifies a specific readability, feedback, control, or layout failure.

## Validation

Run `./check_codebase.sh`, `./build_github_pages.sh`, `./run_playwright_tests.sh`,
`./run_web_server.sh`, and `source source_me.sh && pytest tests/`.
Run Python only through the repository's Python 3.12 bootstrap.
Record fresh results in A1's matrix. A passing smoke test is scoped to its actual journey.

## Risks

- Coverage pacing: A2 owns tuning; A7 supplies real traversal evidence and final-edge timing.
- House/door routing: A2 tests actual actor updates and release, not only graph reachability.
- Rendering cost and trail correctness: A5 checks degradation, same-frame re-extension,
  tunnel dirty regions, and cumulative nest appearance under load.
- Shared files: the manager serializes UI/render integration and owns generated atlas updates.
- Template propagation: A8 records Solid build, JSX configuration, and generator exceptions.

## Completion criteria

Close only when the original plan and this companion have direct evidence for every
requirement, all required gates pass, and full-run visual and gameplay acceptance is recorded.
Until then, publish precise progress without claiming the full game is complete.
