# Human guidance

- Enable music and sound effects by default for first-time players.

- Keep the GitHub README user-facing. Link directly to the live GitHub Pages game and use a
  content-trimmed dark-mode capture of the 16:10 desktop game layout.

- Maze layouts should form clear corridors without broad open floor areas,
  especially around the enzyme house and tunnel approaches.

- Favor arrow keys for steering; the on-screen direction pad is unnecessary.

- Add an automated level-validation check that prevents open-space and hidden-wall
  traps before a maze can ship.

- Lean further into the logo's playful style details; the additional flair is welcome.

- Give buddy/clamp-built DNA a different color so its contribution is visible.

- Buddy help must be understandable: its DNA construction should be visible,
  and it should not unexpectedly cause ghosts to be eaten.

- Give the ghost house a fixed base and shape with a proper doorway. Show what Buddy is doing
  with both color and a right-panel status bar; let it build and repair DNA into the clamp palette.

- Turn DNA yellow before enemy chew-back removes it, and let primer pellets rotate slowly in place.

- Default template coverage to advance is 60%; difficulty raises or lowers it.
  Collecting every primer remains an alternate cycle-clear condition.

- The buddy should appear as a pickup and have a molecular theme, such as a
  DNA sliding clamp or another protein that makes Taq more efficient.

- Keep the wild, fun features, and add automatic help to make the game easier:
  a buddy or pet can distract enemies, repair DNA, or build template.

<!-- VENDORED HEADER: START -->
Record the durable guidance Neil Voss states, or approves for preservation here, in his own words:
first person or close paraphrase, one to three lines per bullet. Material he supplies as a source
may inform [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md) once it is settled, and an entry of uncertain
origin belongs there too. Rules: [REPO_STYLE.md](REPO_STYLE.md).
[PROPAGATED HEADER - ENTRIES BELOW ARE YOURS]
<!-- VENDORED HEADER: END -->

## Decision priority

## Review expectations

- Superseded by the difficulty-scaled target above: the earlier rule used 50%
  template coverage OR every primer to advance the level.

- Superseded by the difficulty-scaled target above: covering the entire screen
  was too hard, so the earlier requested target was 50% or every primer.

- Classify one-time rebuild checks separately from permanent pytest. Keep only deterministic,
  offline, quick behavior contracts; when in doubt, remove the test.

## Working style

- Make the game approximately 16:10, moving score and numbers into a side panel.

- Dream big. Build on the ambition already present; make the work more excellent,
  durable, and complete through concrete next steps and dispatchable tasks.
- Connect adjacent wall tiles into smooth boundaries. Make pickups resemble RNA primers,
  trails resemble a helix, enemies have distinct shapes, and Taq resemble polymerase.

- I want `tools/` for optional standalone user utilities that remain independent of repository-local
  packages, `devel/` for repository engineering, and the application for primary workflows and
  reusable behavior. A standalone tool may be a self-contained directory with its own helpers.
- A repository may use `launchers/` for thin application delegates when it needs them. Keep that
  convention optional rather than making it a propagated directory requirement.
- Use positive, action-oriented instructions for AI agents. State the desired artifact, action, and
  evidence with phrases such as "Use Y" or "Do X", and omit boundaries that do not aid the task.
- Ship `docs/PYTEST_STYLE.md` and `docs/PYTEST_AUTHORING_GUIDE.md`: the style guide defines
  permanent pytest policy, while the authoring guide explains implementation. Keep template-only
  propagation, vendoring, and meta-test coverage in `PYTEST_META_GUIDE.md`.
- I want Bash shell scripts to stay under 100 lines and 8000 characters. Simplify an oversized
  script or move substantial logic to Python, which has the existing 1000-line source limit.
- I normally use Graphify update or fresh, sometimes context, and now the published map. Keep this
  command line to those recurring actions, with Ollama available when my Claude usage is maxed out.
- Let one Graphify run update or rebuild the data and publish `docs/GRAPHIFY.md` with its compact
  community SVG. Never put the full per-symbol export under `docs/`.
- Let Markdown link checks include newly created, nonignored untracked files for their first 24
  hours. Keep ignored files unavailable.

- Lower the music volume; label the music control with the action it performs,
  because Music on / Music off was ambiguous.

- Make the music more interesting and provide separate music and sound-effect controls.
- Vary the music more and make the death animation even more over the top.
- Make level completion more exciting with flashing wall colors and lots of confetti.
- Make death fill the game board: turn the walls and game black and white while
  the unraveled polymerase spins and zooms in.
- Make the additions crazy fun and probably easier, not harder: wild spectacle
  and helpful rewards rather than extra difficulty.
- Keep the scanline effect and make it more obvious; the subtle version was too hard to see.
- Keep chain-reaction messages off the game board; they block play.
- Make scanlines adjustable from 1 to 5, with an even stronger effect available.
- Use one 0-5 scanline strength control; 0 means off.
- Move the music toward modern game music rather than simple 1980s arcade sounds;
  use your musical judgment.
- Add a difficulty scale, for example by adjusting enemy speed.
