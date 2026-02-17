# VIB3+ Codex — Reference Implementations

The codex is a collection of runnable VIB3+ visualizations. Each one takes the same SDK — the same 24 geometries, six rotation planes, three rendering systems — and makes different creative choices with it. Same vocabulary, radically different outcomes.

Every entry is a complete, working application. Open it in a browser, interact with it, then read the source to understand the creative decisions behind it. The code is annotated with `[WHY]` comments that trace every choice back to the [Gold Standard](../dogfood/GOLD_STANDARD.md) vocabulary.

## Entries

| Entry | What It Is | What Makes It Different |
|---|---|---|
| [synesthesia](synesthesia/) | Audio-reactive ambient with two coordinated engines | Full Gold Standard vocabulary: 8 motions, density seesaw, CSS variable bridge, 8-scene autonomous choreography, per-system personality. The flagship — everything connected. |

### What's Coming

| Entry | Input Source | Creative Direction |
|---|---|---|
| storm-glass | Weather API data | External API as continuous input — temperature drives hue, pressure drives density, wind drives rotation. What does a weather front *look* like in 4D? |
| pulse-deck | DJ MIDI controller | Beat-synced transitions with BPM as master clock. Built for live performance — the visualization is the light show. |
| meditation | Breath sensor / timing | Slow breath input drives everything. Minimal events, long ambient drift cycles. The visualization should make you breathe slower. |

If you want to build one of these, the architecture is already designed. Or build something nobody's thought of yet.

## How to Read a Codex Entry

Each entry has at minimum:
- `index.html` — Open this in a browser. That's the first thing you do.
- `README.md` — Explains the creative decisions: which Gold Standard patterns are used, why, and — just as importantly — what was deliberately left out and what you could add or change.
- `.js` and `.css` files — Professional entries split concerns. The JS imports SDK modules and handles creative logic. The CSS reacts to VIB3+ state through custom properties.

**Read the README before the code.** The README tells you *why* decisions were made. The code tells you *how*. The why matters more.

## How to Add Your Own

1. Create `examples/codex/your-name/`
2. Build an `index.html` that creates at least one `VIB3Engine` instance
3. Write a `README.md` that explains your creative choices — not just what you built, but what you chose NOT to build and why
4. Your entry should demonstrate at least:
   - One continuous mapping (parameters as functions of input, every frame)
   - One event choreography (a discrete trigger with attack/sustain/release timing)
   - Ambient drift on idle (something keeps breathing when nobody's watching)
   - All 6 rotation axes active, including the 4D planes (XW, YW, ZW)

### What Makes a Good Entry

A good codex entry isn't just "another synesthesia with different colors." It makes a *different creative bet*:

- **Different input**: Audio is one input source. What about accelerometer data? WebSocket-streamed stock prices? Typing rhythm? Camera motion detection? Any source of changing numbers can drive VIB3+.
- **Different coordination**: Synesthesia uses Inverse Density Seesaw. What about two engines that *amplify* each other? Or one that's 5 seconds behind the other (temporal offset)?
- **Different aesthetics**: Synesthesia is immersive and ambient. What about a precise, Swiss-design dashboard where VIB3+ fills small cards? Or a brutalist layout where the visualization is clipped by harsh rectangles?
- **Different relationship with the user**: Synesthesia responds to taps and hovers. What about a visualization that responds to the *content* on the page — reading DOM text and feeding it through AestheticMapper?
- **Different temporal structure**: Synesthesia's choreography is 8 scenes x 15 seconds. What about a single 60-minute composition with slow-evolving parameter arcs? Or a visualization that cycles through all 24 geometries in 24 seconds, one per second?

The codex is open to agents, developers, and artists. The only requirement: make it yours.

## Gold Standard Reference

The full creative vocabulary is defined in `examples/dogfood/GOLD_STANDARD.md`. Here's where to find what:

- **Section A**: The 14 named motions — Approach, Retreat, Burst, Crystallize, Dimensional Crossfade, Portal Open, and more. Each has specific parameter profiles, timing envelopes, and easing curves.
- **Section B**: 7 coordination patterns for multi-instance setups — Inverse Density Seesaw, Energy Conservation, Temporal Offset, Role Hierarchy. How two or more VIB3+ instances talk to each other.
- **Section C**: 6 bridge patterns — CSS custom properties, GSAP timeline sync, scroll position mapping, camera motion, text content analysis. How VIB3+ connects to the rest of your application.
- **Section D**: Full interaction scenarios — end-to-end examples of how the vocabulary composes into complete experiences.
- **Section E**: CSS shape-breaking techniques — circles, slices, polygonal clips, diagonal splits. How to make the visualization break out of its rectangular container.
- **Section F**: Composition rules — EMA smoothing, timing asymmetry, mathematical intertwining, per-system personality, energy conservation math.
- **Section G**: Agent design patterns — the 6-step workflow for AI agents creating VIB3+ experiences, plus the Design-Analyze-Enhance loop.

You don't have to use everything. But you should know everything exists before deciding what to leave out.
