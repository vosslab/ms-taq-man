# Playing Ms Taq Man

Start a cycle and steer Taq polymerase through the template maze. Collect an RNA
primer to start leaving synthesized DNA behind you.

## Clear a cycle

Either goal advances the level:

- Cover **50% of the template edges** with DNA.
- Collect **every primer**.

You do not need both. Coverage counts corridor links, not screen pixels. Each
fully traversed fresh link scores 10 bases while Taq is primed. Walking the same
covered link again adds no score. Exo, and later RNase, can chew covered links
back after a delay; you can synthesize those links again.

## Controls

| Action | Control |
| --- | --- |
| Steer | Arrow keys or WASD |
| Queue a turn | Press the direction before reaching a junction |
| Reverse | Press the opposite direction |
| Touch steering | Direction pad or swipe on the maze |
| Pause or resume | Escape, main button, or center pad button |
| Begin or restart | Start cycle or Start new run |

Taq keeps moving until blocked. A queued turn takes effect at the next legal
tile center. If stopped against a wall, choose an open corridor. Keyboard
steering works even after clicking dashboard controls.

## Survive and score

The corner lightning activators temporarily denature enemies. Chase them while
protected to earn chain bonuses of 200, 400, 800, and 1600 points. Returning eyes
head back to the house. Watch the hot-start countdown before approaching enemies.

You begin with three lives and earn one extra life at 10,000 points. Death keeps
your synthesized DNA but normally removes your priming state: find another primer
before extending again. Starting at cycle four, extension survives death.

Moving reagent bonuses enter through a tunnel and eventually leave. Collect them
for extra points. Four maze layouts rotate as cycles advance. The copy counter
shows amplification progress separately from your score.

Fresh synthesis builds a combo if you keep finding new links within three seconds.
Every eight links increases the scoring multiplier, up to x4. Losing the combo
never removes points. Reagent pickups also help you:

| Reagent | Extra benefit |
| --- | --- |
| Mg2+ | Four seconds of hot-start protection |
| dNTP mix | 500 bonus points |
| BSA | Ten seconds without new chew-back; cancels pending chew-back |
| DMSO | Eight seconds of faster movement |
| Betaine | Starts a x4 synthesis combo |
| Hot-start antibody | Ten seconds of hot-start protection |
| Glycerol | Five seconds of speed and DNA protection |

The dashboard identifies the available reagent and shows active boosts. DNA
protection prevents chew-back; hot-start protection lets you capture enemies.

## Sound and display

- **Turn music on/off** controls the soundtrack.
- **Turn FX on/off** independently controls pickup, protection, reward, death,
  and completion cues.
- Both sound channels start muted. Browsers require a click before audio can play;
  after a reload, Start cycle unlocks enabled audio.
- **Scanline strength** adjusts the cabinet texture from 0 to 5. Zero turns it
  off; five gives the strongest CRT bands. The setting survives a reload.
- Reduced-motion preferences suppress scanlines and confetti and simplify death.

Sound preferences, scanlines, and your best score are stored in this browser.
Clearing browser storage removes them. A run itself is not saved. Switching to a
hidden tab pauses active play; resume when you return.

The desktop cabinet puts scores beside the square maze. Narrow screens place
the dashboard below it.
