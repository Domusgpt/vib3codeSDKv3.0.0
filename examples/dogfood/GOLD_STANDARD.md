# VIB3+ Gold Standard — Creative Composition Guide v3.0

**Version**: 3.0 — Feb 16, 2026
**Purpose**: Teach agents and developers the *vocabulary* of VIB3+ parameter behavior so they can compose their own creative expressions — not copy ours.

This document is **not a checklist**. It describes *types* of parameter behavior. Your job is to understand these types, then design compositions that serve your platform, your audience, and your creative intent. The synesthesia codex entry (`examples/codex/synesthesia/`) is one interpretation. Yours should be different.

---

## A. The Three Parameter Modes

Every parameter in VIB3+ exists in one of three simultaneous modes. Understanding these modes is the foundation of all creative work with the engine.

### Mode 1: Continuous Mapping

Parameters respond in real-time to the *current state* of an input source. Not a transition from A to B — a living function that maps input status to parameter value, every frame.

**The pattern**: `parameter = f(input_state)`

**Examples of continuous mappings** (these are types, not requirements — design your own):

| Input Source | Parameter | Mapping Shape | Why This Works |
|---|---|---|---|
| Audio bass level | gridDensity | Linear inverse: `lerp(60, 15, bass)` | Bass feels heavy; density = perceived distance; heavy = close = sparse |
| Audio mid level | speed | Linear: `lerp(0.3, 2.2, mid)` | Mid frequencies carry melody/energy; movement = energy |
| Audio RMS | intensity | Linear: `lerp(0.3, 0.9, rms)` | Overall volume = overall brightness |
| Spectral centroid | hue | Inverse: `(1 - centroid) * 0.6` | High-frequency content shifts toward warm; low toward cool |
| Touch X position | hue | Normalized: `touchX / screenWidth` | Spatial color control |
| Touch Y position | gridDensity | Inverse: `lerp(60, 10, touchY / screenHeight)` | Top of screen = close (sparse), bottom = far (dense) |
| Device tilt (beta) | dimension | Linear: `lerp(3.0, 4.5, tilt)` | Tilting reveals 4D depth |
| Scroll position | gridDensity | Linear: `lerp(60, 8, scrollProgress)` | Scrolling toward content = approaching it |
| Mouse velocity | chaos | Proportional: `min(1, velocity * 0.01)` | Fast movement = turbulence |
| Time of day | hue | Mapped: warm dawn, cool noon, warm dusk | Ambient mood tracking |

**The implementation primitive — EMA smoothing**:

Every continuous mapping uses exponential moving average to avoid jumps:

```javascript
// The universal smoothing pattern
// tau = time constant in seconds (lower = faster response)
const alpha = 1 - Math.exp(-dt / tau);
parameter += (target - parameter) * alpha;
```

Reference time constants from synesthesia.html:

| Parameter | tau (seconds) | Response Feel |
|---|---|---|
| speed | 0.08 | Snappy — tracks audio energy immediately |
| gridDensity | 0.10 | Quick — density shifts feel responsive |
| chaos | 0.10 | Quick — noise responds to input |
| morphFactor | 0.12 | Medium — shape changes feel weighted |
| intensity | 0.12 | Medium — brightness follows volume |
| saturation | 0.15 | Smooth — color richness shifts gradually |
| rotation velocity | 0.12-0.20 | Smooth — rotation feels inertial |
| dimension | 0.20 | Slow — 4D depth shifts feel heavy |
| hue | 0.25 | Slowest — color identity is persistent |

The hierarchy: structural parameters (speed, density) respond fast. Identity parameters (hue, dimension) respond slow. This creates a feeling of weight — the "body" reacts before the "soul."

**Mapping shapes beyond linear**:

| Shape | Formula | When to Use |
|---|---|---|
| Linear | `lerp(min, max, input)` | Default. Most natural |
| Exponential | `min + (max-min) * input * input` | Input has more effect at high values (crescendo) |
| Logarithmic | `min + (max-min) * log(1+input*9)/log(10)` | Input has more effect at low values (sensitivity) |
| Threshold | `input > 0.5 ? max : min` | Binary trigger from continuous input |
| Hysteresis | Threshold with different up/down values | Prevents jitter at boundary (onset detection) |
| Sinusoidal | `center + amplitude * sin(input * PI)` | Oscillation driven by input position |

### Mode 2: Event Choreography

Discrete events (tap, click, system switch, data alert, idle timeout) trigger choreographed multi-parameter sequences. Each event is a mini-composition with its own timing, easing, and dramatic arc.

**The pattern**: `on(event) -> sequence([{param, from, to, duration, easing}, ...])`

**The universal event shape: Attack, Sustain, Release**

Every event-driven parameter change follows this envelope:
- **Attack**: How fast the change happens (50-400ms). Faster = more violent. 150ms is "explosive." 400ms is "firm."
- **Sustain**: How long the peak holds (0-1000ms). 0ms = spike. 500ms = emphasis.
- **Release**: How slowly it decays back (200-3000ms). Longer release = more lingering impact.

**Easing as expressive timing**:

Easing isn't decoration — it's *how the motion feels*:

| Easing | Feel | Use For |
|---|---|---|
| `easeOutQuad` `t*(2-t)` | Decelerating arrival | Approach, things coming to rest |
| `easeInQuad` `t*t` | Accelerating departure | Retreat, things falling away |
| `easeInOutCubic` `t<.5?4*t*t*t:1-(-2*t+2)**3/2` | Smooth both ends | Dimensional shifts, system transitions |
| `exponentialOut` `1-Math.pow(2,-10*t)` | Fast attack, long tail | Explosions, impact decay |
| `bounce` | Overshoot + settle | Landing impacts, ground motions |
| `linear` | Constant rate | Continuous sweeps, hue rotation |

**Types of event choreography** (vocabulary, not requirements):

**Burst**: Any parameter spikes then decays. The universal "something happened."
- Fast attack (50-150ms), long release (500-2000ms), `exponentialOut`
- Works on chaos, speed, intensity, onset — anything that represents energy
- *You choose* which params burst on which event. Tap could burst chaos. Or intensity. Or both.

**Approach/Retreat**: Perceived distance changes via density-as-distance.
- Approach: density down + intensity up + dimension down (closer, brighter, more distorted). 400-800ms, `easeOutQuad`
- Retreat: density up + intensity down + dimension up (farther, dimmer, flatter). 800-2000ms, `easeInQuad`
- The asymmetry matters: approach is FASTER than retreat (things snap toward you, drift away). Minimum 1:2 ratio.

**Drain/Flood**: A parameter empties then refills (or the reverse). Energy transfer.
- Drain: param toward 0 (400-600ms, `easeInQuad`). Flood: 0 toward full (400-800ms, `easeOutCubic`)
- Not just for color — works on saturation, intensity, density, speed
- When one element Floods, another should Drain. Energy conservation: total stays constant.

**Storm**: Multi-parameter random oscillation. The visualization becomes weather.
- Each param oscillates at a different sine frequency: `center + amplitude * sin(t * freq)`
- Use incommensurate frequencies (primes, irrationals) so the pattern never exactly repeats
- chaos: 2s period. speed: 3s. density: 4s. hue: 7s. intensity: 5s.
- The periods don't matter as much as the fact that they're all different.

**Cascade**: A ripple across multiple elements.
- Fibonacci stagger: `[0, 1, 1, 2, 3, 5, 8, 13]` normalized to timing offsets
- Intensity diminishes with distance: `magnitude * (1 - distance * 0.3)`
- Each element runs the same motion but delayed and attenuated

**Fold/Portal**: 4D-specific. Lock 3D axes, animate 4D axes.
- rot4dXW 0 toward 0.9 reveals geometry hidden in the W dimension
- Lock rot4dXY/XZ/YZ during the fold (3D orientation stays stable)
- This is VIB3+'s signature motion — nothing else in the industry does this

### Mode 3: Ambient Drift

Even without input, the visualization breathes. Stillness looks dead. Ambient drift is the life support system.

**The pattern**: `parameter = base + amplitude * sin(t * frequency + phase)`

**Heartbeat — the universal resting state**:

Every idle visualization should pulse. The specifics don't matter as much as the principle: organic sine-wave oscillation on at least morphFactor and intensity.

One approach (from synesthesia.html):
- morphFactor: +/- 0.4 around 1.0, 4-second period
- intensity: +/- 0.1 around 0.7, 2-second period (2x harmonic of morphFactor)

The 2x harmonic is what makes it feel like breathing rather than rocking.

**Phase diversity — no two elements in sync**:

If you have multiple visualization instances, they should pulse at DIFFERENT phases. Synchronized pulsing looks mechanical. Phase-shifted pulsing looks organic.

Phase offset formula: `phase = elementIndex * 2.399` (golden angle in radians = 137.5 degrees). This maximizes phase separation for any number of elements.

**Frozen drift — even frozen things move**:

synesthesia.html's frozen mode uses prime-number oscillation periods (7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59 seconds) for each parameter. The amplitude grows logarithmically: `log(1 + elapsed * 0.1) * 0.05`. The result: a frozen snapshot that very slowly, imperceptibly drifts — alive but suspended.

**4D rotation as ambient behavior**:

In synesthesia.html, 4D rotation (XW/YW/ZW) defaults to zero velocity but activates through audio:
- Bass toward ZW velocity (multiplier 0.8, tau=0.2s)
- Upper-mid toward XW velocity (multiplier 0.6, tau=0.12s)

**If your app has no audio pipeline**, set base 4D velocities to non-zero:
```javascript
rotVel: [0.05, 0.03, 0.02, 0.04, 0.025, 0.015]
//       XY    XZ    YZ    XW    YW     ZW
```

The 4D axes should be slightly slower than 3D for characteristic "hyperspace drift." Without 4D rotation, VIB3+ is just a 3D renderer — the fourth dimension is the product's identity.

---

## B. Parameter Vocabulary

The named patterns from v2 are preserved here, reorganized by mode. These are *types* of behavior. Your implementation should use these as inspiration, not as a prescription.

### Continuous Mapping Patterns

**Audio-Driven Parameters** (from synesthesia.html reference):

| Audio Band | Maps To | Formula | Range | tau |
|---|---|---|---|---|
| Band 0 (sub-bass) + Band 1 (bass) | morphFactor | `lerp(0.2, 1.8, band[0]) + band[1] * 0.4` | 0.2-2.2 | 0.12s |
| Band 2 (low-mid) + Band 5 (presence) | gridDensity | `lerp(15, 60, band[2]) + band[5] * 20` | 15-80 | 0.10s |
| Band 3 (mid) | speed | `lerp(0.3, 2.2, band[3])` | 0.3-2.2 | 0.08s |
| Band 4 (upper-mid) | chaos | `lerp(0, 0.5, band[4]) + band[4] * 0.15` | 0-0.65 | 0.10s |
| Band 6 (brilliance) | saturation | `lerp(0.5, 1.0, band[6])` | 0.5-1.0 | 0.15s |
| Band 6 + RMS | intensity | `lerp(0.3, 0.9, rms) + band[6] * 0.2` | 0.3-1.1 | 0.12s |
| Band 7 (air) | dimension | `lerp(3.0, 3.3, band[7]) + 0.3` | 3.0-3.6 | 0.20s |
| Spectral centroid | hue | `(1 - centroid) * 0.6 + todHue * 0.4` | 0-1 | 0.25s |

These are ONE valid mapping. Another app might map bass to chaos (heavy = turbulent) or mid to hue (melody = color). The principle is: low frequencies drive heavyweight parameters (density, morph), high frequencies drive lightweight ones (hue, saturation).

**Rotation-Driven by Audio**:

| Audio Band | Axis | Multiplier | tau |
|---|---|---|---|
| Band 1 (bass) | ZW | 0.8 | 0.20s |
| Band 3 (mid) | XY | 1.2 | 0.15s |
| Band 4 (upper-mid) | XW | 0.6 | 0.12s |

**Spatial Input Patterns**:
- Touch drag: horizontal = hue, vertical = density (depth)
- Pinch: dimension control (closer pinch = lower dimension = more 4D distortion)
- Two-finger rotation: XW/YW rotation (revealing 4D directly)
- Scroll: density (scrolling toward = approaching)
- Tilt: dimension (tilting the "camera" through 4D space)

### Event Choreography Patterns

**Reference values** (these are ONE interpretation — adjust for your context):

| Pattern | Attack | Release | Key Params | Easing |
|---|---|---|---|---|
| Burst | 50-150ms | 500-2000ms | chaos up, speed up, onset=1 | exponentialOut |
| Approach | 400-800ms | — | density down, intensity up, dimension down | easeOutQuad |
| Retreat | 800-2000ms | — | density up, intensity down, dimension up | easeInQuad |
| Drain | 400-600ms | — | saturation toward 0, intensity toward 0.25 | easeInQuad |
| Flood | 400-800ms | — | saturation toward 1, intensity toward 0.85 | easeOutCubic |
| Explosion then Settle | 150ms / 2000ms | — | chaos 0 to 0.9 to 0.05, speed spikes | easeOut / easeInOut |
| Crystallize | 3000ms | — | chaos toward 0, speed toward 0, saturation down | easeInOut |
| Storm | Indefinite | — | All params sine-oscillate at different primes | sinusoidal |

**Approach/Retreat concrete values** (one example):
```
Approach: gridDensity 60 to 8, intensity 0.3 to 0.9, speed 0.2 to 1.2,
          dimension 4.2 to 3.0, chaos 0.02 to 0.15
          Duration: 400-1200ms, easing: easeOutQuad

Retreat:  gridDensity 8 to 60, intensity 0.9 to 0.2, speed 1.2 to 0.1,
          dimension 3.0 to 4.5, chaos 0.4 to 0.02
          Duration: 800-2000ms, easing: easeInQuad
```

**Explosion then Settle concrete values** (one example):
```
Attack (150ms, easeOut): chaos 0.1 to 0.9, speed 0.5 to 2.5,
                         gridDensity 30 to 10, intensity to 1.0
Release (2000ms, easeInOut): chaos 0.9 to 0.05, speed 2.5 to 0.3,
                              gridDensity 10 to 30, intensity 1.0 to 0.6
```

**4D-specific patterns**:

| Pattern | What Happens | Key Params |
|---|---|---|
| Portal Open | Lock 3D axes, animate rot4dXW 0 to 0.9 | rot4dXW, hue +40 degrees, speed +0.3 |
| Fly-Through | Lock 3D at 0, animate all 4D at different speeds | rot4dXW 0.2/s, YW 0.15/s, ZW 0.25/s |
| Dimensional Zoom | Push into 4D lattice | dimension 4.5 to 3.0, speed 1.0 to 0.4 |
| Inside-Out Fold | Fold through hyperspace | rot4dYW 0 to pi, intensity dips mid-fold |

### Ambient Patterns

**Heartbeat** (the universal resting state):
```
morphFactor: base +/- 0.4, period 4s    = Math.sin(t * PI/2) * 0.4 + 1.0
intensity:   base +/- 0.1, period 2s    = Math.sin(t * PI) * 0.1 + 0.7
Phase offset per element: index * 2.399 radians (golden angle)
```

**Storm** (multi-parameter oscillation):
```
chaos:       center 0.5, amp +/-0.3, period ~2s
speed:       center 1.5, amp +/-0.5, period ~3s
gridDensity: center 30,  amp +/-15,  period ~4s
hue:         center +/-30 degrees,   period ~7s
intensity:   center 0.6, amp +/-0.15, period ~5s
```

**Frozen drift** (prime-number periods for non-repeating slow evolution):
```
periods: [7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59] seconds
amplitude: log(1 + elapsed * 0.1) * 0.05  (grows logarithmically)
```

---

## C. Composition Principles

The three modes layer together. This section describes how to think about composing them.

### How the Modes Interact

At any moment, a parameter's value is the sum of:
1. **Continuous mapping** from current input state (audio level, touch position)
2. **Event choreography** that may be temporarily overriding the mapping
3. **Ambient drift** providing a baseline oscillation

When an event fires (tap, click), the event choreography temporarily takes control of affected parameters. When the event's release phase ends, continuous mapping resumes. Ambient drift runs underneath everything.

The practical implementation: events set a target and duration. The EMA smoothing in the render loop naturally blends back to the continuous mapping when the event stops driving.

### Parameter Coupling

Parameters don't change in isolation. Physical metaphors create coupling:

| If You Change | Also Consider Changing | Why |
|---|---|---|
| gridDensity (distance) | intensity, speed | Close = bright + fast. Far = dim + slow |
| rot4dXW/YW/ZW (4D rotation) | speed (slightly) | Rotating = alive. Speed should track |
| chaos | saturation (inverse) | Chaos = washed out. Order = vivid |
| morphFactor | intensity (correlated) | Inflating = brighter. Collapsing = dimmer |
| speed | chaos (slightly) | Fast = turbulent. Slow = calm |

### Timing Asymmetry

Every motion pair has an asymmetry. Things snap toward you and drift away. Explosions are instant and settle is slow. This is what makes motion feel physical.

| Pair | Fast Direction | Slow Direction | Ratio |
|---|---|---|---|
| Approach / Retreat | Approach 400-800ms | Retreat 800-2000ms | 1:2 minimum |
| Explosion / Settle | Attack 150ms | Release 2000ms | 1:13 |
| Flood / Drain | Flood 400ms | Drain 600ms | 1:1.5 |
| Focus apply / release | Apply 200ms | Release 600ms | 1:3 |

### Energy Conservation

Total visual intensity across all visualization instances should stay roughly constant:

`sum(intensity[i]) is roughly constant (within +/-15%)`

When one element Floods (intensity toward 0.85), others should Drain (intensity toward 0.25). When one Approaches (bright), the background Retreats (dim). This creates focus without overload.

### Hierarchy of Response

In multi-element compositions, elements respond differently based on their role:

| Role | Duration | Magnitude | Delay | Example |
|---|---|---|---|---|
| Protagonist (foreground) | 1.0x | 1.0x | 0ms | Featured card, active element |
| Supporting (midground) | 1.3x | 0.6x | 50ms | Related content, secondary elements |
| Ambient (background) | 1.8x | 0.3x | 100ms | Page background, atmosphere |

Foreground reacts fast and strong. Background reacts slow and subtle. This creates perceived depth through timing, not just visual layering.

### The Density-as-Distance Metaphor

`gridDensity` directly correlates with perceived depth:
- High density (40-100) = intricate, far, like looking at a distant crystal
- Low density (4-15) = bold, close, like structure surrounding you

This is foundational. When something approaches: density goes DOWN. When something retreats: density goes UP. The shader math: `fract(position * density * 0.08)` — fewer repetitions = more open space = closer.

### Per-System Personality

The three visualization systems have distinct aesthetic characters. When switching systems, consider changing parameter defaults to match:

| System | Character | Suggested Ranges |
|---|---|---|
| Faceted | Clean, geometric, precise | density 25-40, chaos 0.02-0.15, speed 0.4-0.9, saturation 0.8-1.0 |
| Quantum | Dense, crystalline, complex | density 40-70, chaos 0.2-0.5, speed 0.8-1.5, saturation 0.5-0.8 |
| Holographic | Atmospheric, layered, soft | density 15-30, chaos 0.1-0.3, speed 0.3-0.7, saturation 0.4-0.7 |

These aren't hard rules. A clean quantum visualization or a chaotic faceted one can be striking. But the defaults should match the system's natural strength.

---

## D. Reference Implementations

The `examples/codex/` directory contains runnable implementations that demonstrate different creative approaches using this vocabulary. Each entry makes different compositional choices.

### Synesthesia (Audio-Reactive Ambient)

**Location**: `examples/codex/synesthesia/`

**Creative choices this implementation makes**:
- Continuous mapping: All 8 audio bands drive distinct parameters (see table in Section B)
- 4D rotation activates through audio bass/mid/presence (not static velocity)
- Event choreography: Tap = burst, three-finger swipe = system switch, scroll = ZW rotation, pinch = dimension
- Ambient: 8-scene autonomous choreography with 15-second scenes, 120-second total cycle
- Frozen mode: Prime-number drift periods for non-repeating slow evolution
- System switching: 1200ms crossfade (opacity only — parameters don't change)

**What another implementation might do differently**:
- Map bass to chaos instead of bass to morphFactor (heavy = turbulent vs heavy = heavy)
- Use static 4D velocity instead of audio-driven (for non-audio contexts)
- Change parameters on system switch (per-system personality)
- Use different event triggers (data events, scroll position, time-of-day)

### Future Codex Entries (planned)

| Entry | Focus | Different Creative Choice |
|---|---|---|
| Storm Glass | Weather-data-driven | Data API as continuous input instead of audio |
| Pulse Deck | DJ/VJ tool | Beat-synced transitions, BPM as master clock |
| Meditation | Breath-synced, minimal | Slow breath input drives everything, minimal events |

The codex is open — you can add your own entries. See `examples/codex/README.md` for the format.

---

## E. The Design-Analyze-Enhance Loop

This is the workflow for creating a new VIB3+ visualization. Don't start by coding — start by designing.

### Step 1: Design

After absorbing the vocabulary in Sections A-C, plan your composition:

1. **What inputs does your platform have?** Audio? Touch? Scroll? Tilt? Data feeds? Keyboard?
2. **Map inputs to parameters** (Mode 1). Which input drives which parameter? What mapping shape? What time constant?
3. **What events occur?** User taps, data alerts, system switches, idle timeouts? What choreography does each trigger? (Mode 2)
4. **What does idle look like?** What ambient drift runs when nothing is happening? (Mode 3)
5. **How do the modes interact?** When audio is driving density AND a tap triggers an Approach, what wins? (The tap wins temporarily, then audio resumes — EMA handles this naturally.)

### Step 2: Build

Implement using EMA smoothing as your universal primitive. Every parameter change — whether from audio, events, or ambient — flows through the same smoothing:

```javascript
// In your render loop, for EVERY parameter:
const alpha = 1 - Math.exp(-dt / tau);
param += (target - param) * alpha;
```

Events temporarily set a new target. Continuous mappings update the target every frame. Ambient drift modulates the base target. The EMA blends them all smoothly.

Ensure all 6 rotation axes are active. The 4D axes (XW/YW/ZW) are the product's signature — without them, you're just rendering 3D with extra steps.

### Step 3: Analyze

Run your visualization and critically evaluate:

| Question | What to Look For |
|---|---|
| Is 4D rotation visible? | Objects should morph through hyperspace, not just spin in 3D |
| Do events feel distinct? | Each event type should produce a visually different response |
| Is audio reactivity visible? | Bass should visibly change the visualization (density, morph) |
| Are system switches distinct? | Faceted/Quantum/Holographic should look and feel different |
| Does the idle state breathe? | Stare for 10 seconds — does it feel alive or dead? |
| Are interactions theatrical? | Touch should produce dramatic, visible change (not subtle) |
| Does timing feel physical? | Approach faster than retreat? Explosions instant, settles slow? |
| Is energy conserved? | When one thing brightens, does another dim? |

### Step 4: Enhance

Look for emergent combinations:

- What happens when audio onset triggers a Burst while Heartbeat is already running? (The burst should layer on top — the heartbeat doesn't stop)
- What if touch-drag hue shift interacts with audio-driven hue? (Both contribute — the visual becomes richer)
- Can you chain events? (Tap then Burst then if bass is high, chain into Storm)
- Can continuous mappings feed into each other? (Audio-driven speed then speed drives chaos slightly)

The goal isn't to implement all patterns from Section B. It's to understand the three modes, compose them for your context, and let interesting behavior emerge from their interaction.

---

## F. Audio Pipeline Reference

For implementations that use audio reactivity, here are the technical specifics from the synesthesia reference.

### FFT Setup
```javascript
analyser.fftSize = 2048;           // 1024 frequency bins
analyser.smoothingTimeConstant = 0.8;
// Sample rate 44100Hz, bin width approx 21.5 Hz
```

### 8-Band Frequency Ranges
```javascript
const BAND_RANGES = [
  [1,3],     // Band 0: Sub-bass    (21-65 Hz)
  [3,9],     // Band 1: Bass        (65-193 Hz)
  [9,23],    // Band 2: Low-mid     (193-495 Hz)
  [23,56],   // Band 3: Mid         (495-1204 Hz)
  [56,139],  // Band 4: Upper-mid   (1204-2989 Hz)
  [139,279], // Band 5: Presence    (2989-6001 Hz)
  [279,558], // Band 6: Brilliance  (6001-12003 Hz)
  [558,930]  // Band 7: Air         (12003-20000 Hz)
];
```

### Band Normalization
```javascript
for (let b = 0; b < 8; b++) {
  let sum = 0;
  const [lo, hi] = BAND_RANGES[b];
  for (let i = lo; i < hi && i < freqData.length; i++) sum += freqData[i];
  const raw = sum / ((hi - lo) * 255);
  const alpha = 1 - Math.exp(-dt / 0.1);
  bands[b] += (raw - bands[b]) * alpha;
}
```

### Onset Detection
```javascript
// Spectral flux: sum of positive frequency bin changes
let flux = 0;
for (let i = 0; i < freqData.length; i++) {
  const diff = freqData[i] / 255 - prevFreqData[i];
  if (diff > 0) flux += diff;
  prevFreqData[i] = freqData[i] / 255;
}

// Running average with slow EMA
const fluxAlpha = 1 - Math.exp(-dt / 0.3);
spectralFluxAvg += (flux - spectralFluxAvg) * fluxAlpha;

// Trigger: flux > 3x average AND absolute > 0.5
if (flux > spectralFluxAvg * 3.0 && flux > 0.5) {
  onAudioOnset(); // Fire burst event
}
// Cooldown: 100ms minimum between onsets
```

### Synthetic Audio Fallback

For environments without microphone access, generate synthetic audio with evolving sine waves:

```javascript
// Per band: frequency + random modulation
for (let b = 0; b < 8; b++) {
  bands[b] = 0.3 + 0.2 * Math.sin(time * (0.5 + b * 0.3) + b * 1.7);
  bands[b] *= 0.8 + 0.2 * Math.sin(time * 0.1 + b); // slow envelope
}
```

---

## G. Multi-Instance Composition

When multiple VIB3Engine instances run on the same page, they should interact — not just coexist.

### Coordination Patterns

| Pattern | Description | Implementation |
|---|---|---|
| **Opposition** | When A approaches, B retreats | Link density inversely: `B.density = maxDensity - A.density + minDensity` |
| **Echo** | B follows A with delay | B targets A's values but with slower tau (0.5s vs 0.12s) |
| **Cascade** | Ripple across N elements | Fibonacci stagger: each element fires same motion at increasing delay |
| **Focus Lock** | One claims energy, others yield | Active: intensity toward 0.9, saturation toward 1.0. Others: toward 0.3 / 0.15 |
| **Energy Transfer** | Visual energy flows between instances | Recipient floods as source drains. Total sum of intensity stays constant |

### Role Assignment

| Role | Base Density | Intensity | Heartbeat Period | Response Speed |
|---|---|---|---|---|
| Protagonist | 20-30 | 0.6-0.7 | 3-4s | 1.0x |
| Supporting | 30-40 | 0.4-0.5 | 4-5s | 1.3x slower |
| Ambient | 40-55 | 0.2-0.3 | 5-7s | 1.8x slower |
| CTA / Focus | 15-25 | 0.5-0.6 | 1.5-2.5s (fast) | 0.8x faster |

### CSS Integration Bridges

VIB3+ parameters can drive CSS custom properties for unified visual language:

```javascript
// Push VIB3 state to CSS
document.documentElement.style.setProperty('--vib3-chaos', chaos);
document.documentElement.style.setProperty('--vib3-intensity', intensity);
document.documentElement.style.setProperty('--vib3-hue', hue * 360);
```

```css
/* CSS consumes */
.card { border-radius: calc(12px + var(--vib3-chaos, 0) * 20px); }
.background { filter: brightness(calc(0.5 + var(--vib3-intensity, 0.5) * 0.5)); }
```

---

*VIB3+ SDK — Clear Seas Solutions LLC*
*Gold Standard Specification v3.0 — Feb 16, 2026*
*Built on: synesthesia.html reference implementation, TransitionAnimator API, MULTIVIZ_CHOREOGRAPHY_PATTERNS.md*
