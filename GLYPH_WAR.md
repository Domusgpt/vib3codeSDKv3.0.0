# GLYPH_WAR — Agent Build Prompt

> **Dogfood target**: `@vib3code/sdk@2.0.3` + `/vib3-design` + `/vib3-dev` skills
> **Deliverable**: A playable 2-player real-time word duel rendered through the VIB3+ holographic layer stack with game-state-reactive 4D visuals.

---

## What You Are Building

**GLYPH_WAR** is a head-to-head word duel. Two players see the same randomized pile of letters. Each player races to spell the longest single word from that shared, finite pool. Letters are exclusive — if you take the `E`, your opponent can't use it. Each player gets one secret **Stash** slot (1 letter, hidden from opponent). Players can **Dissolve** their word at any time, releasing letters back to the pile, enabling bluffs and pivots. When a player is confident, they hit **ATTACK** — a 10-second sudden-death timer starts. The opponent must beat the attacking word's length or lose.

---

## Phase 1 — Visual Identity (`/vib3-design`)

Use the `/vib3-design` skill to design 4 visual states for the game. Each state is a VIB3+ parameter snapshot that maps to a game moment. The holographic system's 5-layer stack is the rendering target.

### State Definitions

| State | System | Geometry | Color Preset | Post-FX Chain | Key Parameters |
|-------|--------|----------|-------------|---------------|----------------|
| **Idle** (lobby/waiting) | `holographic` | `3` (Torus) | `Monochrome` | `Clean` | `speed: 0.3`, `chaos: 0`, `gridDensity: 12`, `dimension: 4.2`, `intensity: 0.3` |
| **Dueling** (active play) | `holographic` | `11` (Hypersphere+Torus) | `Cyberpunk` | `Holographic` | `speed: 1.0`, `chaos: 0.15`, `gridDensity: 24`, `dimension: 3.8`, `intensity: 0.6` |
| **Sudden Death** (ATTACK timer) | `holographic` | `17` (Hypertetra+Hypercube) | `Neon` | `Glitch Art` | `speed: 2.5`, `chaos: 0.7`, `gridDensity: 60`, `dimension: 3.2`, `intensity: 0.9` |
| **Victory** (round end) | `holographic` | `8` (Hypersphere+Tetra) | `Aurora` | `Cinematic` | `speed: 0.6`, `chaos: 0`, `gridDensity: 8`, `dimension: 4.0`, `intensity: 0.8` |

### Transitions Between States

Design these transitions using `TransitionAnimator`:

- **Idle → Dueling**: 800ms `easeOut` — hue sweeps from monochrome to cyberpunk, speed ramps up
- **Dueling → Sudden Death**: 300ms `elastic` — chaos spikes, gridDensity jumps, CA tears open
- **Sudden Death tick** (every second): Map remaining seconds to `chromaticAberration` strength: `CA = 0.02 + (1.0 - (secondsLeft / 10)) * 1.98` — at 1s left the screen is splitting apart
- **Any → Victory**: 1200ms `spring` — everything smooths out, speed drops, bloom swells

### Chromatic Aberration as Tension Meter

The **primary visual signal** of game tension is chromatic aberration intensity:

```
CA = 0.02                         // base (clean hologram)
CA += letterConflicts * 0.15      // +0.15 per letter both players want
CA += (1 - timerPercent) * 2.0    // during sudden death, maps inversely to time left
```

### Layer Roles (Parallax)

Map the 5 holographic layers to game depth:

| Layer | Canvas | Game Role | Parallax Factor |
|-------|--------|-----------|-----------------|
| `background` | `holo-background-canvas` | Deep void, slow rotation | 0.1x input |
| `shadow` | `holo-shadow-canvas` | Interference mesh, counter-rotates | 0.5x input |
| `content` | `holo-content-canvas` | Letter glyphs refract through this | 1.0x input |
| `highlight` | `holo-highlight-canvas` | Glow on active/contested letters | 1.5x input |
| `accent` | `holo-accent-canvas` | HUD bezel, fixed chromatic aberration | 0.0x (screen-fixed) |

### Timeline Choreography

Design a `ParameterTimeline` sequence for the **Sudden Death** countdown (10 seconds):

```
t=0s:    hue=200, chaos=0.3, speed=1.5, gridDensity=30
t=3s:    hue=320, chaos=0.5, speed=2.0, gridDensity=45    (easeIn)
t=7s:    hue=0,   chaos=0.8, speed=2.8, gridDensity=70    (exponential)
t=9s:    hue=0,   chaos=1.0, speed=3.0, gridDensity=100   (elastic)
t=10s:   FLASH — invert 100ms, then snap to Victory state
```

---

## Phase 2 — Game Engine (`/vib3-dev`)

Use the `/vib3-dev` skill to build the game logic as a module that sits on top of the SDK.

### File Structure

```
src/games/glyph-war/
├── GlyphWarGame.js          # Game state machine + rules engine
├── LetterPool.js            # Shared letter pool with exclusivity logic
├── PlayerState.js           # Per-player state (word, stash, score)
├── GlyphWarVisualizer.js    # VIB3Engine integration + state-reactive params
├── GlyphWarUI.js            # DOM overlay (letter tiles, word slots, stash, timer)
└── dictionary.js            # Word validation (embed a small valid-word set or use a check fn)
```

### Core Rules (implement exactly)

1. **Letter Pool**: Generate 10-14 random letters per round. Vowel ratio: ~35%. Letters are objects `{ char, id, owner: null|'p1'|'p2'|'pool', stashed: false }`.
2. **Exclusivity**: When a player takes a letter from the pool, `owner` flips to their ID. The opponent's UI greys it out instantly.
3. **Word Building**: Players tap letters to append to their word. Word is public (opponent sees it). Only one word at a time.
4. **Stash**: Each player can stash exactly 1 letter (hidden from opponent). Stashing removes it from pool AND from visibility. Un-stashing returns it to the player's hand (not pool).
5. **Dissolve**: Player can dissolve their word — all letters return to pool (`owner: null`). This is the bluff/pivot mechanic.
6. **ATTACK**: Player locks their word and starts a 10-second timer. During this time:
   - Attacker's word is frozen (cannot change).
   - Defender can still build/dissolve/stash.
   - If defender builds a longer word before timer expires → defender wins.
   - If timer expires → attacker wins.
   - If defender ATTACKs back with a longer word → roles swap, timer resets.
7. **Validation**: On ATTACK, the word must be a valid English word. Invalid = auto-lose.
8. **Round**: Best of 3 rounds. Letters re-randomize each round.

### VIB3 Integration (`GlyphWarVisualizer.js`)

```javascript
import { VIB3Engine } from '../../core/VIB3Engine.js';
import { PostProcessingPipeline } from '../../creative/PostProcessingPipeline.js';
import { TransitionAnimator } from '../../creative/TransitionAnimator.js';
import { ColorPresetsSystem } from '../../creative/ColorPresetsSystem.js';
import { ParameterTimeline } from '../../creative/ParameterTimeline.js';

// Initialize engine with holographic system
// Bind game state changes to TransitionAnimator sequences
// Map letter conflicts to chromaticAberration in real-time
// Run ParameterTimeline during sudden death
// Apply parallax factors to layer-specific parameters
```

Wire up these reactive bindings:

| Game Event | VIB3 Response |
|------------|---------------|
| Letter grabbed | `rot4dXW += 0.1` per letter held (4D depth shift) |
| Letter conflict (both want same letter) | `chromaticAberration += 0.15`, highlight layer pulses |
| Word growing (rapid placement) | `speed` tweens up, shadow layer opacity increases |
| Dissolve triggered | Geometry snaps to points (`morphFactor: 2.0`), VHS scanline glitch 200ms |
| ATTACK pressed | Transition to Sudden Death state, start timeline |
| Victory | Transition to Victory state, bloom swell |

### UI Layer (`GlyphWarUI.js`)

DOM overlay rendered on top of the VIB3 canvas stack:

- **Letter Pile**: Scattered (CSS `transform: rotate(random)`) letter tiles in center. Not a grid — a messy pile. Tap to grab.
- **Player Word Slots**: Bottom (P1) and Top (P2, flipped). Shows current word as tiles.
- **Stash Slot**: Small pocket icon next to each player's word. Drag a letter in/out.
- **ATTACK Button**: Pulses when word length >= 3. Triggers sudden death.
- **Timer**: 10-second countdown bar during sudden death. Visually synced with CA intensity.
- **Score**: Best of 3 pips.

Style: Dark background, letters rendered as frosted-glass tiles with `backdrop-filter: blur(8px)`, borders glow with the current VIB3 hue parameter.

### Dictionary

Embed a compact valid-word check. Options (pick one):
- Inline a Set of ~5000 common 3-10 letter English words
- Use a Trie for prefix validation (enables "is this a valid start?" feedback)
- Fetch from an API (only if offline fallback exists)

For the dogfood, a hardcoded Set of ~5000 words is fine. Keep it simple.

---

## Phase 3 — Test Harness

Write tests following the existing SDK test patterns (`tests/` directory, Vitest + happy-dom).

### Required Tests

```
tests/games/glyph-war/
├── letter-pool.test.js       # Pool generation, vowel ratio, exclusivity
├── player-state.test.js      # Word building, stash, dissolve
├── game-rules.test.js        # ATTACK flow, timer, validation, win conditions
└── visualizer-binding.test.js # VIB3 parameter changes on game events
```

**Key test cases:**
- Letter exclusivity: P1 takes letter → P2 cannot take same letter
- Dissolve releases: P1 dissolves → letters return to pool
- Stash is hidden: P1 stashes letter → P2's available letters don't include it
- ATTACK timer: Attacker wins if timer expires with longer word
- ATTACK counter: Defender builds longer word → defender wins
- Invalid word: ATTACK with non-dictionary word → instant loss
- Visualizer: Game state change triggers correct VIB3 parameter transition
- CA mapping: Letter conflicts increase chromaticAberration proportionally

---

## Phase 4 — Entry Point

Create `src/games/glyph-war/index.html` as a standalone harness:

```html
<!-- Mounts VIB3 container + game UI overlay -->
<!-- Loads GlyphWarGame as ES module -->
<!-- Two-player: split-screen or pass-and-play for dogfood -->
<!-- For dogfood: single device, P1=bottom half, P2=top half (phone orientation) -->
```

Add an npm script:
```json
"glyph-war": "npx vite src/games/glyph-war/index.html --port 3460 --open"
```

---

## Success Criteria

The build is done when:

1. `npm run glyph-war` opens a playable 2-player word duel in browser
2. VIB3 holographic layers render behind the game UI with the 4 visual states
3. Transitions between states are smooth and use the SDK's `TransitionAnimator`
4. Chromatic aberration visually maps to game tension (conflicts + timer)
5. The sudden death timeline plays the 10-second escalation sequence
6. All tests pass: `npm test -- tests/games/glyph-war/`
7. The game is fun for 60 seconds — that's the bar

---

## Skills Usage Checklist

This prompt exercises:

- [x] `/vib3-design` — Visual state design, transition choreography, timeline, layer mapping, post-FX
- [x] `/vib3-dev` — New module creation, VIB3Engine integration, parameter binding, test authoring
- [x] `VIB3Engine` constructor + `initialize()` + `switchSystem('holographic')`
- [x] `setParameter()` / `getParameter()` for all 14 standard params
- [x] `PostProcessingPipeline` with `chromaticAberration`, `bloom`, `glitch`, `scanlines`
- [x] `TransitionAnimator.transition()` and `.sequence()`
- [x] `ColorPresetsSystem.applyPreset()` for 4 presets
- [x] `ParameterTimeline` with keyframes and BPM-independent timing
- [x] 5-layer holographic canvas stack with per-layer parameter modulation
- [x] 6D rotation params (`rot4dXW`) driven by game state
- [x] Geometry switching across states (indices 3, 8, 11, 17)
- [x] Test patterns matching existing SDK test suite

---

*This is a dogfood. If something in the SDK doesn't work the way this prompt assumes, file it as a bug, fix it, and keep going.*
