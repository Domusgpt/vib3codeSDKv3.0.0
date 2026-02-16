# VIB3+ Codex — Reference Implementations

The codex is a collection of runnable VIB3+ visualizations that demonstrate different creative approaches using the vocabulary defined in the [Gold Standard](../dogfood/GOLD_STANDARD.md).

Each entry makes **different compositional choices**. There is no single "correct" way to use VIB3+. The codex exists to show that the same parameter vocabulary produces radically different outcomes depending on creative intent.

## Entries

| Entry | Focus | Key Creative Choice |
|---|---|---|
| [synesthesia](synesthesia/) | Audio-reactive ambient | All 8 audio bands drive distinct parameters; 4D rotation activates through audio |

### Planned

| Entry | Focus | Key Creative Choice |
|---|---|---|
| storm-glass | Weather-data-driven | External API as continuous input instead of audio |
| pulse-deck | DJ/VJ tool | Beat-synced transitions, BPM as master clock |
| meditation | Breath-synced, minimal | Slow breath input drives everything, minimal events |

## How to Read a Codex Entry

Each entry has:
- `index.html` — The runnable visualization (open in a browser)
- `README.md` — Documents the creative decisions: which Gold Standard patterns it uses, why, and what it chose NOT to use

## How to Add Your Own Entry

1. Create a directory under `examples/codex/your-name/`
2. Build a self-contained `index.html` that renders a VIB3+ visualization
3. Write a `README.md` explaining your creative choices (reference Gold Standard sections)
4. Your entry should demonstrate at least:
   - One or more continuous mappings (Mode 1)
   - One or more event choreographies (Mode 2)
   - Ambient drift on idle (Mode 3)
   - All 6 rotation axes active (including 4D)

The codex is open to agents, developers, and artists. The only requirement: make it YOURS, not a copy of synesthesia.

## Gold Standard Reference

See `examples/dogfood/GOLD_STANDARD.md` for the full creative vocabulary:
- **Section A**: The Three Parameter Modes (continuous mapping, event choreography, ambient drift)
- **Section B**: Parameter Vocabulary (audio mappings, event patterns, ambient patterns)
- **Section C**: Composition Principles (coupling, asymmetry, energy conservation)
- **Section D**: Reference Implementations (this codex)
- **Section E**: The Design-Analyze-Enhance Loop (the creative workflow)
- **Section F**: Audio Pipeline Reference (FFT, bands, onset detection)
- **Section G**: Multi-Instance Composition (coordination, roles, CSS bridges)
