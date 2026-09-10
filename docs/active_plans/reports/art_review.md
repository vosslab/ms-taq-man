# Sprite review

Reviewed the Chromium atlas from `tests/playwright/art_render.spec.ts` on
2026-09-09. It renders every current SVG at 16px and 256px. The captured artifact
is `test-results/sprite_atlas.png`; rerun `./run_playwright_tests.sh` to regenerate it.

## Current results

- All sixteen SVGs decode and display without clipped silhouettes in the atlas.
- Exo, Dimer, Chelate, and RNase retain distinct outer shapes at 16px. Their
  personalities still need directional eye cues; color alone is not the only cue.
- Taq's palm, fingers, thumb, and bow read clearly at 256px. At 16px the golden
  open cleft and green bow remain visible. Active-site opening animation is missing.
- Frightened coil and returning eyes are recognizably different states at both sizes.
- Hot-start lightning is visible inside its circular border at 16px.
- Seven reagent silhouettes remain distinguishable: antibody Y, crystal, shield,
  speed flask, paired vials, droplet, and magnesium flask. The Mg label is readable
  at large size; the small sprite relies on silhouette and the dashboard description.
- Primer geometry preserves its wide aspect ratio inside the atlas's square image
  box. Its actual in-game rendering is 18x9, with a gentle pulse.

## Remaining acceptance

- Review all state transitions during actual play, especially crowded junctions.
- Add active-site animation and directional eye groups.
- Complete the logo and attract background, then include them in visual review.
- Validate contrast against a future light palette and maximum scanline strength.
- Full-nest readability and chew-back fading need separate board captures.

These findings establish static sprite readability only. They do not establish
complete artwork or full-game visual acceptance.
