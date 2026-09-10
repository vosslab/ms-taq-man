# Strand rendering acceptance

The production strand layer is graph-aware. It paints two colored backbones and
base-pair rungs along maze edges with deterministic seed variation, rather than
stamping a rectangular sprite into corridors. `src/art/strand_ribbon.svg` remains
the editable, atlas-reviewed visual specification for that production equivalent.
The durable ownership decision is recorded in
[DESIGN_DECISIONS.md](../../DESIGN_DECISIONS.md).

![Four fully synthesized templates](../../screenshots/full_nests.png)

The focused Playwright check writes its disposable gallery to `test-results/`.
After visual review, deliberately copy the accepted gallery to
`docs/screenshots/full_nests.png` when refreshing this report.

## Browser evidence

`tests/playwright/strand_render.spec.ts` passes in Chromium and verifies:

- Tunnel degradation changes only the two local tunnel-mouth regions; unrelated
  pixels remain unchanged.
- An ordinary chewed strand fades for 0.6 seconds, disappears, and re-extension
  obtains a fresh seed and pixel signature.
- All four full mazes paint at DPR 1 and DPR 2 without exceptions, preserving
  both backbone colors and visible rungs.
- Cached and repair timings are finite, reported for review rather than asserted
  as machine-specific limits.

`tests/playwright/full_frame_render.spec.ts` additionally exercises the complete
renderer, atlas readiness, resize generation, and disposal. Its full-frame
degradation p95 is at or below 1.5 ms; re-extension p95 is at or below 2.3 ms.
These browser results are comfortably below a 16.7 ms frame interval, but they do
not claim a mobile or compositor-wide performance guarantee.

## Visual review

The maintained full-nest capture shows varied wave cadence, amplitude, bend,
skew, and junction behavior across edges and cycles. It retains a recognizably
double-stranded molecular appearance, makes clamp-built violet/pink DNA distinct
from Taq-built green/blue DNA, and leaves corridor choices legible. This closes
the former regular-ladder concern without allowing trail geometry to spill into
walls.

Future visual changes must update the editable ribbon and procedural painter
together, then rerun the SVG-atlas and strand-render browser checks.
