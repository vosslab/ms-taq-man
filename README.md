# Ms Taq Man

A playful browser chase game for arcade fans: steer Taq polymerase through DNA mazes, collect RNA primers, and leave a glowing double-helix trail. Escape nucleases, grab reagent powers, and clear half the template to advance.

[Play in your browser](https://vosslab.github.io/ms-taq-man/)

## Synthesize your escape route

Collect a primer, then turn fresh corridors into DNA. Clear a cycle by covering
**50% of template edges OR collecting every primer**. You never need both.

<!-- screenshots:begin (managed by screenshot-docs) -->
![Paused game showing Taq's helix trail, connected maze walls, and the side dashboard with difficulty and scanline sliders](docs/screenshots/gameplay.png)
<!-- screenshots:end -->

The screenshot shows an actual run paused after collecting a primer and extending
DNA. The dashboard stays beside the maze on desktop and stacks below it on phones.

- Four rotating mazes and four enzyme personalities keep the chase changing.
- Hot-start activators turn the tables: chase the frightened, unraveled enzymes.
- Helpful reagents grant speed, protection, combo boosts, or bonus points.
- Choose difficulty from Chill to Wild; Easy is the default.
- Independent music and FX controls, adjustable CRT scanlines, and reduced-motion support.

**Status:** playable and actively developed. Some reagent artwork and visual polish
remain unfinished; full-run acceptance across every maze is still in progress.

## Your first cycle

Click **Start cycle**, then use arrow keys or WASD. Press Left from the starting
position to reach a nearby primer; keep moving and watch your helix and base count
grow. Queue turns before junctions. Use Escape or the pause button to take a break.

On touchscreens, use the direction pad or swipe on the maze. Set difficulty to
**1 - Chill** for slower enemies. Music and effects start muted; their buttons say
what clicking will do. Your best score and settings survive browser reloads.

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

To generate the GitHub Pages-ready site without starting a server:

```bash
./build_github_pages.sh
```

## Guides and development

- [docs/USAGE.md](docs/USAGE.md): controls, scoring, reagent powers, difficulty, and sound.
- [docs/CODE_ARCHITECTURE.md](docs/CODE_ARCHITECTURE.md): simulation, rendering, UI, and audio boundaries.
- [docs/CHANGELOG.md](docs/CHANGELOG.md): current changes and fixes.

Run `./check_codebase.sh` for TypeScript, lint, formatting, and simulation tests.
Run `./run_playwright_tests.sh` for browser checks after building. Repository hygiene
checks use `source source_me.sh && python3 -m pytest tests/`.

To refresh the screenshot, start the local server and run
`node tools/capture_gameplay.mjs http://localhost:PORT/` with its printed port.

## License

Source code: [LICENSE.MIT](LICENSE.MIT).
