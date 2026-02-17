# Synesthesia — VIB3+ Flagship Professional Example

The definitive demonstration of the VIB3+ SDK creative vocabulary. This is what the system looks like when used properly — two coordinated engines, all three parameter modes, full Gold Standard motion vocabulary, CSS integration, and autonomous choreography.

**This is the reference. Other codex entries diverge from here.**

## Architecture

```
synesthesia/
├── index.html         # Thin entry point (~40 lines) — loads CSS + JS module
├── synesthesia.css    # CSS variable bridge + layout + Approach/Retreat states
├── synesthesia.js     # Main orchestrator — imports actual SDK modules
└── README.md          # This file
```

**Why multi-file?** Professional usage of VIB3+ separates concerns: HTML provides structure, CSS reacts to VIB3+ state through custom properties, and JS orchestrates the SDK modules. A single-file demo doesn't show integration patterns.

## SDK Modules Used

```javascript
import { VIB3Engine } from '../../../src/core/VIB3Engine.js';
import { TransitionAnimator } from '../../../src/creative/TransitionAnimator.js';
import { ColorPresetsSystem } from '../../../src/creative/ColorPresetsSystem.js';
import { ChoreographyPlayer } from '../../../src/creative/ChoreographyPlayer.js';
import { PostProcessingPipeline } from '../../../src/creative/PostProcessingPipeline.js';
import { AestheticMapper } from '../../../src/creative/AestheticMapper.js';
```

| Module | Why |
|--------|-----|
| `VIB3Engine` | Two instances — primary (full viewport) + secondary (floating panel) |
| `TransitionAnimator` | One per engine — drives Approach/Retreat/Burst/Crystallize/Crossfade |
| `ColorPresetsSystem` | One per engine — themed color cycling (6 presets in rotation) |
| `ChoreographyPlayer` | 8-scene autonomous cycle (120s loop, activates after 30s idle) |
| `PostProcessingPipeline` | Bloom + chromatic aberration on primary |
| `AestheticMapper` | Available for NLP-to-parameter mapping |

## Gold Standard Sections Demonstrated

### Section A: The Motion Language

| Motion | Trigger | Implementation |
|--------|---------|----------------|
| **Approach** | Hover secondary panel | `density 60→8, intensity 0.3→0.9, dimension 4.2→3.0` (400ms easeOutQuad) |
| **Retreat** | Leave secondary panel | Reverse to personality defaults (800ms easeInQuad) |
| **Burst** | Tap/click | `chaos +0.3, speed +0.5` (150ms attack), EMA decay (2000ms release) |
| **Crystallize** | Long-press (800ms) | `chaos→0, speed→0.05, saturation→0.2, intensity→0.85` (3000ms) |
| **Color Flood** | Release from Crystallize | Personality defaults flood back (1500ms easeOut) |
| **Dimensional Crossfade** | System switch (1/2/3 keys) | Drain (400ms) → switch → flood with new personality (600ms) |
| **Portal Open** | Scroll wheel | ZW + XW rotation modulated by scroll depth |
| **Freeze/Thaw** | Double-tap / Spacebar | Enter frozen drift mode (prime-number periods) |

### Section B: Coordination Patterns

| Pattern | Implementation |
|---------|----------------|
| **Inverse Density Seesaw** | Primary density ↑ → secondary density ↓ (total ≈ 70) |
| **Energy Conservation** | `Σ(intensity) ≈ constant` across both engines |
| **Complement Hue** | Secondary hue = primary hue + 180° |
| **Mirror Rotation** | Secondary inverts XY, YZ, YW rotation planes |

### Section C: VIB3 + CSS Bridges

Every frame, six CSS custom properties are updated from VIB3+ state:
```css
--vib3-hue, --vib3-intensity, --vib3-density,
--vib3-speed, --vib3-chaos, --vib3-saturation
```

The CSS file uses these to drive:
- HUD label color (`hsl(var(--vib3-hue), 70%, 65%)`)
- Audio meter bar color
- Secondary panel border color
- Coordination label color (hue + 120°)
- Approach/Retreat CSS classes (scale, shadow, blur, border transitions)
- Crystallize state (desaturation + brightness)

### Section D: Autonomous Choreography

8 scenes × 15 seconds = 120-second cycle via `ChoreographyPlayer`:

| Scene | System | Geometry | Preset | Character |
|-------|--------|----------|--------|-----------|
| 1 | Faceted | Hypercube [1] | Ocean Deep | Clean geometric drift |
| 2 | Quantum | Hyper-S Torus [11] | Galaxy | Dense crystalline chaos |
| 3 | Holographic | Hyper-S Wave [14] | Aurora | Atmospheric shimmer |
| 4 | Faceted | Fractal [5] | Neon Pulse | Morphing complexity |
| 5 | Quantum | Hyper-T Tetra [16] | Cyberpunk Neon | Fast energy |
| 6 | Holographic | Torus [3] | Sunset Warm | Warm density build |
| 7 | Faceted | Hyper-T Wave [22] | Ocean Deep | Calm chaos arc |
| 8 | Quantum | Hyper-S Cube [9] | Galaxy | Intensity crescendo |

### Section E: Per-System Personality

Switching systems changes parameter ranges, not just shaders:

| System | gridDensity | speed | chaos | dimension | Character |
|--------|------------|-------|-------|-----------|-----------|
| Faceted | 15-35 | 0.3-0.8 | 0.0-0.15 | 3.6-4.0 | Clean, precise |
| Quantum | 25-60 | 0.5-1.5 | 0.1-0.4 | 3.2-3.8 | Dense, crystalline |
| Holographic | 20-50 | 0.4-1.2 | 0.05-0.3 | 3.4-4.2 | Atmospheric |

### Section F: Composition Rules

- **EMA smoothing everywhere**: `alpha = 1 - exp(-dt / tau)`. Tau values range from 0.08s (speed) to 0.25s (hue).
- **Timing asymmetry**: Approach 400ms / Retreat 800ms. Burst 150ms / Decay 2000ms.
- **Energy conservation**: When primary intensity rises, secondary drops.
- **4D rotation dominant**: Base velocities XW=0.08, YW=0.06, ZW=0.05 rad/s (faster than 3D axes).

### Section G: The Three Parameter Modes

All three modes run simultaneously:

1. **Continuous Mapping (Mode 1)**: 8 audio bands → all visual params via EMA. Spectral centroid → hue. Time-of-day → hue base (40%). Bass → ZW rotation. Mid → XY. Upper-mid → XW.
2. **Event Choreography (Mode 2)**: Burst, Crystallize, Crossfade, Portal Open, Freeze — each with distinct timing profiles.
3. **Ambient Drift (Mode 3)**: Heartbeat (morphFactor ±0.4 at 4s, intensity ±0.1 at 2s) when audio quiet. Frozen drift with 14 prime-number periods (7-59s). Autonomous choreography after 30s idle.

## Controls

| Input | Action |
|-------|--------|
| Tap/click | Burst |
| Long-press (800ms) | Crystallize (release for Color Flood) |
| Double-tap / Space | Toggle freeze mode |
| Horizontal swipe | Cycle geometry |
| Vertical swipe | Cycle system |
| Scroll wheel | Portal Open (4D rotation) |
| Hover secondary panel | Approach/Retreat |
| 1/2/3 | Switch primary system |
| 4 | Cycle secondary system |
| C | Cycle color preset |
| Arrow keys / HJKL | Navigate geometry (base + core type) |
| R | Random geometry |
| F | Fullscreen |
| A | Resume audio context |

## What This Entry CHOSE

- **Two engines, not one**: Shows coordination patterns (Inverse Density, Energy Conservation, Mirror Rotation)
- **All named motions**: Every discrete event has a choreographed response
- **CSS bridge**: DOM elements react to visualization state in real-time
- **Autonomous mode**: ChoreographyPlayer runs 8-scene cycle after idle
- **Audio everywhere**: Even synthetic audio keeps parameters alive
- **4D dominant**: Hyperspace rotation is the primary visual effect

## What Another Entry Might Do Differently

- **Single engine** with 5-layer CanvasManager for layer-specific effects
- **MIDI input** instead of audio (pulse-deck entry)
- **External API data** instead of microphone (storm-glass entry)
- **Minimal events** with breath-synced input (meditation entry)
- **GSAP timeline integration** for production choreography
- **Three.js scene embedding** for mixed 3D+4D experiences
