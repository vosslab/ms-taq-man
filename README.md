# Ms Taq Man

A playable molecular-biology arcade game for science learners and retro-game fans: steer Taq
polymerase through DNA mazes, collect RNA primers, and build a glowing double helix while escaping
animated enzyme foes.

**[Play Ms Taq Man on GitHub Pages](https://vosslab.github.io/ms-taq-man/)**

## Anneal. Extend. Survive.

Prime your route, synthesize the maze behind you, and use molecular power-ups to stay ahead of four
enzyme rivals. Clear a cycle by covering **60% of the template at default Easy difficulty** or by
collecting every primer.

<!-- screenshots:begin (managed by screenshot-docs) -->
![Paused dark-mode game showing Taq polymerase extending a double helix through the 16:10 DNA maze and dashboard](docs/screenshots/gameplay.png)
<!-- screenshots:end -->

The content-trimmed dark-mode capture keeps the game's 16:10 desktop cabinet, active synthesis, and
cycle goals visible in one view.

## Play your first cycle

1. Open the [live game](https://vosslab.github.io/ms-taq-man/) and select **Start cycle**.
2. Steer with the arrow keys or WASD. Press Left from the starting position to reach a nearby
   primer.
3. Keep moving to extend a double helix through fresh corridors. Queue turns before junctions.
4. Cover the target percentage or collect every primer to begin the next thermal cycle.

On touchscreens, swipe on the maze. Set difficulty to **1 - Chill** for slower enemies, and use
Escape or the main button to pause. Music and effects default to on and start after you select
**Start cycle**. Your best score and settings survive browser reloads, but an active run does not.

## What makes it molecular

- Four rotating DNA mazes and four enzyme personalities keep the chase changing.
- Hot-start activators denature your rivals so Taq can capture them for chain bonuses.
- A collectible sliding clamp helps synthesize, repair, and protect DNA.
- Reagents grant speed, protection, combo boosts, or bonus points.
- Chill-to-Wild difficulty, separate music and FX controls, adjustable CRT scanlines, and
  reduced-motion support let you tune the experience.

## Run locally

You need Node.js with npm and Python 3.12. From this checkout:

```bash
npm ci
source source_me.sh
./run_web_server.sh
```

The launcher builds the game into `dist/` and serves it on a local port. Open the
localhost URL shown in the terminal, then start a cycle. Stop the server with Ctrl-C.
Use HTTP rather than opening the HTML file directly.

## Learn more

- [docs/USAGE.md](docs/USAGE.md): controls, scoring, reagent powers, difficulty, and sound.
- [docs/CODE_ARCHITECTURE.md](docs/CODE_ARCHITECTURE.md): simulation, rendering, UI, and audio
  boundaries for contributors.
- [docs/FILE_STRUCTURE.md](docs/FILE_STRUCTURE.md): source locations, generated art, and verification
  commands.
- [docs/CHANGELOG.md](docs/CHANGELOG.md): current changes and fixes.

## License

Source code: [LICENSE.MIT](LICENSE.MIT).
