# HYPERSTORM — VIB3+ Premium Codex Entry

**Focus**: Premium Module Dogfood (all 8 modules exercised together)
**Input**: Mobile-first touch + canvas gestures, desktop keyboard fallback
**Systems**: All three (Quantum, Faceted, Holographic) with live switching

## What This Demonstrates

Hyperstorm is a reference implementation for building on VIB3+ Premium. It exercises
all 8 premium modules in a single mobile-first interactive demo, while remaining fully
functional when premium is unavailable (graceful degradation).

### Gold Standard v3 Patterns

| Mode | Implementation |
|------|---------------|
| **Mode 1 — Continuous Mapping** | CSSBridge pumps engine parameters to CSS custom properties every frame. All UI chrome (HUD blur, dock glow, title color, vignette, scanlines) derives from `--vib3-hue`, `--vib3-chaos`, `--vib3-intensity`, etc. The UI is a living extension of the visualization. |
| **Mode 2 — Event Choreography** | 8 named motions with Attack/Sustain/Release envelopes: burst, crystallize, portal, fly-through, dimensional zoom, storm, system switch, choreography show. 4 autonomous triggers (chaos_burst, intensity_flash, dimension_dive, storm_peak) fire when parameter thresholds are crossed. |
| **Mode 3 — Ambient Drift** | 6 parameters breathe with independent prime-number periods (2s, 4s, 7s, 11s, 13s, 17s). Combined drift doesn't repeat for ~19 hours. All drift uses EMA smoothing with per-parameter tau values. |

### Premium Modules Used

| # | Module | What Hyperstorm Does With It |
|---|--------|------------------------------|
| 1 | ShaderParameterSurface | Sets projection type, UV scale, noise frequencies, per-layer alpha, auto-rotation speeds |
| 2 | RotationLockSystem | Flight mode during portal and fly-through motions |
| 3 | LayerGeometryMixer | Different geometries on different canvas layers for visual depth |
| 4 | VisualEventSystem | 4 autonomous triggers that create emergent cascading effects |
| 5 | CSSBridge | Real-time engine→CSS parameter bridge (with JS fallback) |
| 6 | ChoreographyExtensions | Used indirectly through the choreography show sequence |
| 7 | FrameworkSync | HUD readout updates on sync events |
| 8 | PremiumMCPServer | Tool count verification at init |

### Key Patterns to Copy

**Dynamic premium import** (never top-level):
```javascript
try {
    const { enablePremium } = await import('../../../src/premium/index.js');
    premium = enablePremium(engine, { licenseKey: 'key', features: ['all'] });
} catch (premErr) {
    console.warn('Premium unavailable:', premErr.message);
    premium = null;
}
```

**Optional chaining on every premium call**:
```javascript
premium?.shaderSurface?.setParameters({ uvScale: 4.0 });
premium?.rotationLock?.setFlightMode(true);
```

**JS fallback when CSSBridge is unavailable**:
```javascript
if (!premium) updateCSSVars();  // manual CSS var writes in tick loop
```

**Per-system personality ranges** (don't use full range on every system):
```javascript
const PERSONALITY = {
    faceted:     { gridDensity: [15, 35], speed: [0.3, 0.8], chaos: [0.0, 0.15] },
    quantum:     { gridDensity: [25, 60], speed: [0.5, 1.5], chaos: [0.1, 0.4] },
    holographic: { gridDensity: [20, 50], speed: [0.4, 1.2], chaos: [0.05, 0.3] },
};
```

## Controls

### Mobile (Primary)

| Gesture | Action |
|---------|--------|
| Tap canvas | Burst (chaos spike) |
| Hold 600ms | Crystallize (freeze) |
| Swipe horizontal | Cycle system |
| Swipe vertical | Cycle geometry |
| Two-finger tap | Portal open |
| Pinch in/out | Dimension zoom / portal |
| Dock buttons | All 8 named motions |

### Desktop (Fallback)

| Key | Action |
|-----|--------|
| b | Burst |
| c | Crystallize |
| p | Portal |
| f | Fly-through (toggle) |
| d | Dimensional zoom |
| s | Storm mode (toggle) |
| Space | Cycle system |
| x | Choreography show |

## What Was Deliberately Left Out

- **Audio reactivity**: Hyperstorm focuses on touch/gesture input. See the synesthesia
  codex entry for audio-reactive patterns.
- **Microphone input**: Would require user permission prompt which breaks the instant-on
  experience.
- **MIDI**: Desktop-only feature, Hyperstorm is mobile-first.
- **Post-processing**: PostProcessingPipeline is a free SDK module, not a premium one.
  Including it would muddy the premium dogfood focus.

## What Could Be Added

- **Accelerometer input**: Map device tilt to 4D rotation planes (XW/YW/ZW) for hands-free
  ambient mode.
- **Audio analysis**: Add microphone toggle button to dock, map beat detection to burst events.
- **Preset gallery**: Save/load parameter snapshots to localStorage via the gallery buttons.
- **Shareable URLs**: Encode current state in URL hash for sharing specific visual configurations.

## Files

| File | Lines | Purpose |
|------|-------|---------|
| `index.html` | ~140 | Semantic HTML structure. No inline styles. |
| `hyperstorm.css` | ~450 | Mobile-first CSS with [WHY] comments. CSSBridge-driven. |
| `hyperstorm.js` | ~910 | All logic. Dense [WHY] comments explaining every Gold Standard decision. |
