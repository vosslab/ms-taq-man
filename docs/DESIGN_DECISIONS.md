# Design decisions

<!-- VENDORED HEADER: START -->
Record each durable decision about how this code and repository are shaped, once it is settled, with
the reasoning a later reader needs. Guidance Neil Voss states belongs in
[HUMAN_GUIDANCE.md](HUMAN_GUIDANCE.md), dated history in `docs/CHANGELOG.md`, open discussion in
`docs/active_plans/decisions/`. [PROPAGATED HEADER - ENTRIES BELOW ARE YOURS]
<!-- VENDORED HEADER: END -->

Write each decision as a level-three heading with these four fields. `Owner` names the
authoritative code or contract document, rather than a person.

```markdown
### <decision title>

**Decision.** <the durable direction>

**Why.** <the reason it was chosen>

**Consequence.** <the constraint a future change preserves>

**Owner.** <the authoritative code or contract doc>
```

## Software design

### Visible maintenance states

**Decision.** The renderer gives the enzyme house a fixed three-tile base with an open doorway,
renders queued chew-back as yellow DNA, and derives Buddy color and dashboard status from its live
activity. Buddy can reinforce ordinary player DNA into the clamp's violet/pink palette as well as
rebuild a chewed edge.

**Why.** The player needs to recognize the enemy spawn point, pending DNA loss, and Buddy's
contribution without inferring them from simulation details.

**Consequence.** Visual colors retain a matching text label in the HUD. Coverage ownership changes
increment the coverage revision so the cached strand layer repaints the new clamp palette.

**Owner.** `src/render/maze_painter.ts`, `src/render/strand_layer.ts`, `src/game/buddy.ts`,
`src/game/coverage.ts`, and `src/ui/hud.tsx`.

### Synchronous read-only renderer frame view

**Decision.** Canvas rendering consumes a recursively read-only live game view
after every completed fixed simulation batch. It does not deep-clone or freeze a
per-frame game snapshot.

**Why.** The browser runs the fixed simulation batch, synchronous canvas draw,
and HUD scalar publication in one run-to-completion task. Recursive `ReadOnly`
types preserve simulation ownership while avoiding allocation and copying of maze
graphs and coverage collections on every frame.

**Consequence.** Renderer and HUD code remain synchronous and read-only. Any
future asynchronous render, worker transfer, or deferred consumer must receive
an immutable frame snapshot at its boundary.

**Owner.** `src/ui/game_loop.ts`, `src/ui/app.tsx`, `src/render/canvas_renderer.ts`,
and `src/game/read_only.ts`.

### Graph-aware procedural strand ribbon

**Decision.** `src/art/strand_ribbon.svg` remains the editable visual specification
and atlas-reviewed source artifact. `src/render/helix.ts` is the graph-aware
production equivalent: it procedurally paints the paired backbones and base-pair
rungs along each covered edge.

**Why.** Per-edge seed variation, arbitrary edge direction, tunnel mouths,
re-extension identity, fading, and bounded dirty repair require geometry aligned
to the maze graph rather than repeated rectangular SVG stamping.

**Consequence.** Changes to the ribbon's color or helix language update the SVG
and procedural painter together, then rerun the SVG atlas and strand-render
browser checks. Acceptance retains full-nest visual review at desktop and 400px.

**Owner.** `src/art/strand_ribbon.svg`, `src/render/helix.ts`, and
`src/render/strand_layer.ts`.

### Script placement follows workflow ownership

**Decision.** Classify commands by audience, purpose, dependencies, and input/output boundary.
Standalone domain utilities use `tools/`; repository engineering uses `devel/`; primary workflows
and reusable behavior use the application; thin application delegates may use local `launchers/`.

**Why.** This separates standalone utilities from application entry points without forcing a
substantial utility into one file or treating every script directory as a generic launcher home.

**Consequence.** Tools remain independent of repository-local packages but may own helpers inside a
self-contained tool directory. `launchers/` remains optional and is not propagated by convention.

**Owner.** [REPO_STYLE.md](REPO_STYLE.md#scripts-and-executables) and
[../tests/test_support_dirs_not_imported.py](../tests/test_support_dirs_not_imported.py)

### Pytest documentation has three roles

**Decision.** Ship `docs/PYTEST_STYLE.md` and `docs/PYTEST_AUTHORING_GUIDE.md`, and retain
`PYTEST_META_GUIDE.md` for template-specific pytest rules.

**Why.** The style guide defines permanent-test policy. The authoring guide provides shared pytest
implementation conventions. Template propagation, vendoring, and meta-test coverage serve starter
template maintenance.

**Consequence.** Keep policy in `PYTEST_STYLE.md`, implementation in
`PYTEST_AUTHORING_GUIDE.md`, and template-specific coverage in `PYTEST_META_GUIDE.md`.

**Owner.** [PYTEST_STYLE.md](PYTEST_STYLE.md) and
[PYTEST_AUTHORING_GUIDE.md](PYTEST_AUTHORING_GUIDE.md)

### Bash scripts stay small orchestration front doors

**Decision.** Track every nonignored `.sh` file below 100 physical lines and 8000 characters.

**Why.** Shell is appropriate for concise orchestration, but large scripts are difficult to read,
test, and safely maintain. A character ceiling prevents compressing complex code onto fewer lines.

**Consequence.** Simplify an oversized shell script or move its substantial logic to Python, where
the existing source-file gate permits fewer than 1000 lines.

**Owner.** [../tests/test_bash_script_line_limit.py](../tests/test_bash_script_line_limit.py)

## Dependencies

### Solid compilation requires local build exceptions

**Decision.** Use the esbuild Solid plugin through [../pipeline/build.mjs](../pipeline/build.mjs),
  preserve JSX with the Solid import source in [../tsconfig.json](../tsconfig.json), and invoke
  the builder from [../build_github_pages.sh](../build_github_pages.sh).

**Why.** The esbuild CLI cannot apply the Solid JSX compiler plugin.

**Consequence.** Reapply these manual exceptions after template propagation. Keep Solid lint
  configuration in the consumer-owned ESLint override. Runtime code is bundled locally;
  no CDN scripts are required (ASVS 15.2.3).

**Owner.** [../pipeline/build.mjs](../pipeline/build.mjs) and [SOLID_MODEL.md](SOLID_MODEL.md).

## Generated artifacts

### Graphify agent guidance lives in the propagated devel README

**Decision.** Document Graphify usage for downstream repositories in
[../devel/DEVEL_README.md](../devel/DEVEL_README.md), and do not run
`graphify claude install` or `graphify codex install`.

**Why.** A repository README is never shared between repositories, `AGENTS.md` arrives only when a
repository lacks one, and `docs/` files are replaced wholesale on sync, so a shared `docs/USAGE.md`
would overwrite each repository's own usage document. Files under `devel/` are shared by location.
The Graphify installers additionally write into `CLAUDE.md` and `AGENTS.md` and add a PreToolUse
hook, contending with how those two files are already maintained.

**Consequence.** Guidance that must reach every repository goes in `devel/DEVEL_README.md`.
Third-party tools do not write to `CLAUDE.md` or `AGENTS.md`.

**Owner.** [../devel/DEVEL_README.md](../devel/DEVEL_README.md)

### Rust test symbols leave the graph before clustering

**Decision.** In a Cargo repository, a fresh build extracts with `--no-cluster`, removes
`#[cfg(test)]` symbols from `graph.json`, then runs `cluster-only`. Graphify's own source is never
modified.

**Why.** Filtering at print time leaves the symbols in the graph, where they still distort
community detection, hub degree ranking, and connector spread. `cluster-only` re-clusters an
existing graph, which makes removing them before clustering possible without forking Graphify.
Spans are found with tree-sitter because a brace scan would have to reason about strings,
comments, and nested modules to be correct.

**Consequence.** The gate is `Cargo.toml`, so repositories without Rust run the original pipeline
unchanged. Pruning is limited to fresh builds: re-clustering renumbers communities, and a fresh
build is the only path that always relabels afterward, so stored labels cannot go stale.

**Owner.** [../devel/graphify_prune_tests.py](../devel/graphify_prune_tests.py)

### Graphify exposes recurring maintainer actions

**Decision.** The wrapper exposes automatic update, explicit fresh, context, and documentation
publication. `--svg` composes with fresh or update and also publishes an existing map by itself.
`--ollama` remains the one fresh-build fallback when the Claude allowance is exhausted.

**Why.** These are the maintainer's recurring tasks. Semantic extraction, global registration,
reflection, map-page generation, deep extraction, and forced shrinking add configuration without
serving the normal workflow.

**Consequence.** `--svg` writes both `docs/GRAPHIFY.md` and `docs/GRAPHIFY_map.svg`. Both are
recorded as non-shared because they describe the repository where they were generated.

**Owner.** [../devel/graphify_map_repo.py](../devel/graphify_map_repo.py)

### The committed graph figure is decorative

**Decision.** Generate the SVG directly from community membership and intercommunity edges. Show
at most the largest twelve communities, scale circles by membership, weight connecting lines, and
keep names and detail in Markdown rather than an SVG legend.

**Why.** Full Graphify exports grow with every symbol and embed font glyphs for labels that are not
readable at repository-map scale. A community-level figure preserves the important visual
relationships while Markdown provides accessible, searchable names and repository-derived prose.

**Consequence.** The figure conveys relative community scale and coupling rather than code-level
detail. Publication has no matplotlib, SVG-cleaning, or XML-parser dependency.

**Owner.** [../devel/graphify_docs_lib.py](../devel/graphify_docs_lib.py)

### Recent untracked Markdown links are temporary working-tree inputs

**Decision.** The Markdown link checker admits nonignored untracked regular files as sources and
targets only while their creation age is strictly less than 24 hours.

**Why.** Newly authored documentation often links to another new file before staging, while older,
ignored, missing, and outside-repository paths should continue to fail the GitHub-browsability gate.

**Consequence.** Git supplies candidates through `ls-files --others --exclude-standard`; one
captured current time classifies birth time, or ctime where birth time is unavailable.

**Owner.** [../tests/test_markdown_links.py](../tests/test_markdown_links.py)

### Graphify orientation filters test symbols instead of trusting the graph

**Decision.** `devel/graphify_context_lib.py` drops test scaffolding, repository-wide utility types,
and uninformative call targets before printing orientation.

**Why.** Graphify's Rust extractor indexes `#[cfg(test)] mod tests` contents as production symbols.
Those modules live inside `src/*.rs`, so no `.graphifyignore` rule can exclude them without also
dropping the production code in the same file. Separately, a symbol spanning most communities is a
utility type carrying no navigational information.

**Consequence.** This filter is presentational and remains the fallback, not the primary fix. A
Cargo repository now removes those symbols from the graph itself before clustering, so the filter
covers what pruning does not reach: incremental updates, and other languages whose inline test
conventions have no prune step.

**Owner.** [../devel/graphify_context_lib.py](../devel/graphify_context_lib.py)

### Graphify diagnostics and staleness checks stay advisory

**Decision.** Edge-fidelity diagnostics and the stale-map warning report findings and never fail a
build or suppress orientation.

**Why.** Graphify documents no reliable threshold for same-endpoint edge collapse, and repeated
endpoint pairs are legitimate in some codebases. Context mode exists to orient a reader, so a stale
map must still print in full.

**Consequence.** These checks print and continue. Context mode also reads the `needs_update` flag
file directly rather than shelling out, preserving its documented promise to print orientation
without running Graphify.

**Owner.** [../devel/graphify_map_repo.py](../devel/graphify_map_repo.py)
