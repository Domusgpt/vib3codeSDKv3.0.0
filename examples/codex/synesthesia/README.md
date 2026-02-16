# Synesthesia — Audio-Reactive Ambient Visualization

The original VIB3+ reference implementation, rebuilt as an annotated codex entry demonstrating all three parameter modes from the Gold Standard.

## Creative Decisions

### Continuous Mappings (Mode 1)
- **Audio drives everything**: All 8 FFT bands map to distinct parameters (morphFactor, gridDensity, speed, chaos, saturation, intensity, dimension, hue)
- **4D rotation is audio-driven, not static**: Bass drives ZW, mid drives XY, upper-mid drives XW. When audio is silent, 4D axes fall to base velocity (not zero)
- **Spectral centroid drives hue**: Not a specific band — the overall "brightness" of the audio shifts color
- **Time-of-day modulates hue base**: Warm at dawn/dusk, cool at noon (blended 40% with centroid)

Why audio for everything: Synesthesia literally means "hearing colors." Every parameter should feel like you can hear it change.

### Event Choreography (Mode 2)
- **Tap/click**: Burst pattern — chaos spike + intensity flash, exponential decay over 500ms
- **Three-finger swipe**: System switch with 1200ms opacity crossfade
- **Scroll wheel**: Direct ZW rotation control (the W axis responds to scroll depth)
- **Pinch gesture**: Dimension control (pinch = lower dimension = more 4D distortion)
- **Double-tap**: Toggle frozen mode (prime-number drift)
- **Audio onset**: Automatic burst on beat detection (spectral flux > 3x average)

Why no Approach/Retreat: This is an ambient visualization, not a UI. Distance metaphors are less relevant than immersion. Another entry (like a product page) would use Approach/Retreat extensively.

### Ambient Drift (Mode 3)
- **Autonomous choreography**: 8 scenes x 15 seconds = 120-second cycle (activates after 30s idle)
- **Frozen drift**: Prime-number oscillation periods (7-59 seconds) with logarithmic amplitude growth
- **Heartbeat**: Not explicit — audio provides the pulse. When audio is silent, morphFactor and intensity get sine modulation at 4s/2s periods

Why 8 scenes: Enough variety to feel like a journey, short enough that each scene has clear character. The 15-second duration matches typical attention spans for ambient content.

### What This Entry Does NOT Use
- **Approach/Retreat**: No density-as-distance metaphor (ambient, not spatial)
- **Energy conservation**: Single instance — no other element to conserve with
- **Per-system parameter defaults**: Parameters stay constant on system switch (only shader changes)
- **CSS integration bridges**: No DOM elements to drive — pure canvas

### Gold Standard Sections Referenced
- A.1 (Continuous Mapping): Audio-to-parameter tables, EMA time constants
- A.2 (Event Choreography): Burst pattern for tap and onset
- A.3 (Ambient Drift): Frozen drift with prime periods, heartbeat fallback
- B (Parameter Vocabulary): Audio-driven parameter table, rotation-driven by audio
- F (Audio Pipeline Reference): FFT setup, band ranges, onset detection

## Technical Notes

- **Hue convention**: Internal 0-1 (shader space). If integrating with Dart/external, convert to 0-360 at the boundary
- **EMA smoothing**: Every parameter uses `1 - Math.exp(-dt / tau)` — no setTimeout, no instant snaps
- **Synthetic audio**: Falls back to sine-wave oscillators when mic is unavailable
- **All 6 rotation axes active**: 3D axes have base velocity; 4D axes activate through audio (with non-zero fallback)
