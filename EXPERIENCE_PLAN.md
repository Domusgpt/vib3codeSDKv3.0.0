# VIB3+ SYNESTHESIA ENGINE: Experience Plan

**Codename**: SYNESTHESIA
**Type**: Self-contained HTML experience (single file, zero dependencies beyond browser APIs)
**Target**: Desktop + Mobile (responsive, touch-first on mobile, mouse-first on desktop)
**Duration**: Infinite generative with 120-second autonomous choreography loop

---

## 1. Architecture

### Signal Flow

```
                     ┌──────────────────────────────────┐
                     │         SENSOR LAYER              │
                     │                                    │
                     │  Microphone ──► FFT Analyzer       │
                     │  Accelerometer/Gyro ──► Motion     │
                     │  Touch/Mouse ──► Pointer           │
                     │  Ambient Light ──► Lux             │
                     │  Battery API ──► Level             │
                     │  Speech Recognition ──► Phonemes   │
                     │  DeviceOrientation ──► Euler       │
                     │  Network Info ──► RTT/downlink     │
                     │  Clock ──► Hour/Minute             │
                     └──────────┬───────────────────────┘
                                │
                     ┌──────────▼───────────────────────┐
                     │       PROCESSING LAYER            │
                     │                                    │
                     │  AudioProcessor                    │
                     │    ├─ 2048-sample FFT              │
                     │    ├─ 8-band spectral decomp       │
                     │    ├─ Onset detector (transient)   │
                     │    ├─ Pitch tracker (autocorr)     │
                     │    └─ RMS energy envelope          │
                     │                                    │
                     │  MotionProcessor                   │
                     │    ├─ Kalman-filtered orientation   │
                     │    ├─ Shake detector (jerk calc)    │
                     │    ├─ Tilt → 6 rotation planes     │
                     │    └─ Velocity magnitude            │
                     │                                    │
                     │  GestureProcessor                  │
                     │    ├─ Double-tap detector           │
                     │    ├─ Pinch (distance tracking)     │
                     │    ├─ Two-finger rotation           │
                     │    ├─ Three-finger swipe            │
                     │    └─ Long press                    │
                     │                                    │
                     │  EnvironmentProcessor              │
                     │    ├─ Time-of-day palette index     │
                     │    ├─ Battery → warmth curve        │
                     │    ├─ Ambient light → intensity     │
                     │    ├─ Network → complexity cap      │
                     │    └─ Orientation change detect     │
                     │                                    │
                     │  SpeechProcessor                   │
                     │    ├─ Vowel classifier (a/e/i/o/u)  │
                     │    ├─ Consonant transient detect    │
                     │    └─ Syllable rhythm extractor     │
                     │                                    │
                     │  IdleDetector                      │
                     │    ├─ 30s no-input threshold        │
                     │    └─ Autonomous sequence trigger   │
                     └──────────┬───────────────────────┘
                                │
                     ┌──────────▼───────────────────────┐
                     │      PARAMETER MAPPING LAYER      │
                     │                                    │
                     │  MappingEngine                     │
                     │    ├─ 42 continuous mappings        │
                     │    ├─ 18 threshold triggers         │
                     │    ├─ 12 cross-modulation paths     │
                     │    ├─ Easing per mapping            │
                     │    └─ Smoothing per mapping         │
                     │                                    │
                     │  StateManager                      │
                     │    ├─ Current params (17 floats)    │
                     │    ├─ Frozen snapshot slot           │
                     │    ├─ Target params (for lerp)       │
                     │    ├─ Chaos decay tracker            │
                     │    └─ System transition state        │
                     └──────────┬───────────────────────┘
                                │
                     ┌──────────▼───────────────────────┐
                     │        RENDER LAYER               │
                     │                                    │
                     │  SystemOrchestrator                │
                     │    ├─ 3 WebGL canvases (stacked)   │
                     │    ├─ Active system selector        │
                     │    ├─ Cross-fade compositor         │
                     │    └─ System-specific shaders       │
                     │                                    │
                     │  ShaderManager                     │
                     │    ├─ Faceted fragment shader       │
                     │    ├─ Quantum fragment shader       │
                     │    ├─ Holographic fragment shader   │
                     │    └─ Uniform update pipeline       │
                     │                                    │
                     │  PostProcessor                     │
                     │    ├─ Bloom (via dual-canvas blend) │
                     │    └─ Chromatic aberration (shader) │
                     └──────────────────────────────────┘
```

### Canvas Architecture

Three overlaid `<canvas>` elements with CSS `mix-blend-mode` compositing:

| Canvas | Z-Index | Blend Mode | Purpose |
|--------|---------|------------|---------|
| `bg-canvas` | 1 | normal | Background system (full-screen shader) |
| `main-canvas` | 2 | screen | Primary active system |
| `overlay-canvas` | 3 | overlay | Transition cross-fade / highlight effects |

During system transitions, the outgoing system renders to `bg-canvas`, the incoming system renders to `main-canvas`, and a cross-fade opacity animation moves between them over the transition duration.

### State Machine

```
                    ┌──────────┐
         ┌────────►│  ACTIVE   │◄────────┐
         │          │ (reacting │         │
         │          │ to input) │         │
         │          └────┬──────┘         │
         │               │                │
    resume          idle 30s         any input
         │               │                │
         │          ┌────▼──────┐         │
         │          │AUTONOMOUS │─────────┘
         │          │(generative│
         │          │ sequence) │
         │          └───────────┘
         │
    ┌────┴──────┐
    │  FROZEN   │  (double-tap activates)
    │ (snapshot │  (params slowly drift from frozen point)
    │  + drift) │  (double-tap again exits)
    └───────────┘
```

---

## 2. Surprise Catalog

### 2.1 Audio-Frequency Geometry Morphing
**Trigger**: Continuous while audio active
**What it does**: Dominant frequency band doesn't just drive color -- it selects and morphs between geometry types. Sub-bass (20-80Hz) pulls toward Torus (geometry 3). Low-mids (80-300Hz) pull toward Hypercube (geometry 1). Mids (300Hz-2kHz) pull toward Sphere (geometry 2). Upper-mids (2-6kHz) pull toward Wave (geometry 6). Presence (6-10kHz) pulls toward Crystal (geometry 7). Air (10-20kHz) pulls toward Fractal (geometry 5). The `u_geometry` uniform cross-fades continuously between these using `u_morphFactor`, creating a geometry that literally shapeshifts to match the sound's spectral character.
**Parameters affected**: `geometry` (float interpolation 0-23), `morphFactor` (0-2)

### 2.2 Double-Tap Freeze + Drift
**Trigger**: Double-tap (mobile) or double-click (desktop) detected within 300ms
**What it does**: Captures complete parameter snapshot. Immediately freezes all audio/motion reactivity. Then initiates an ultra-slow evolutionary drift: each parameter begins a sinusoidal walk away from its frozen value, with different periods (7s to 47s, all prime numbers to avoid synchronization). The drift amplitude grows logarithmically over time -- starts imperceptible, becomes clearly visible after ~20 seconds. A second double-tap releases the freeze; all parameters snap back to live reactivity with an elastic easing over 800ms.
**Parameters affected**: All 17 parameters, each with independent drift period
**Drift periods (prime seconds)**: hue=7, saturation=11, intensity=13, chaos=17, speed=19, morphFactor=23, gridDensity=29, dimension=31, rot4dXY=37, rot4dXZ=41, rot4dYZ=43, rot4dXW=47, rot4dYW=53, rot4dZW=59, bass=61, mid=67, high=71

### 2.3 Shake Detection -> Chaos Explosion
**Trigger**: Accelerometer jerk magnitude exceeds 25 m/s^3 (calculated as derivative of acceleration), OR rapid mouse movement exceeding 3000px/s on desktop
**What it does**: Instantaneously sets `chaos` to 1.0, `speed` to 3.0, `intensity` to 1.0. Triggers a geometry "scatter" by cycling through 3 random geometry indices within 200ms. Then begins a 5-second exponential decay back to pre-shake values using `expoOut` easing. During the first 500ms, all 6 rotation planes receive random velocity impulses (0.5-2.0 rad/s) that themselves decay over the 5 seconds. If device supports haptic feedback, fires a 200ms heavy vibration pattern [100, 30, 50, 30, 20].
**Parameters affected**: chaos (1.0 -> pre), speed (3.0 -> pre), intensity (1.0 -> pre), geometry (rapid cycle then settle), all 6 rotation planes (impulse + decay)

### 2.4 Ambient Light Sensor -> Brightness Modulation
**Trigger**: `AmbientLightSensor` API (where available, primarily Android Chrome)
**What it does**: Maps lux reading to `intensity` and `saturation` via an S-curve. In darkness (<5 lux): intensity 0.3, saturation 0.95 (deep saturated colors for OLED beauty). Dim room (5-50 lux): intensity 0.5-0.7, saturation 0.8. Bright room (50-300 lux): intensity 0.8, saturation 0.7. Outdoor daylight (>300 lux): intensity 1.0, saturation 0.6, plus hue shift toward warmer tones (+20 degrees). All transitions smoothed with 2-second lerp.
**Fallback**: If API unavailable, uses camera ambient estimation via a 1x1 pixel canvas capture from getUserMedia (checking every 5 seconds), or defaults to mid-range values.
**Parameters affected**: intensity, saturation, hue (daylight bias)

### 2.5 Battery Level -> Color Temperature
**Trigger**: `navigator.getBattery()` API, polled every 30 seconds
**What it does**: Maps battery percentage to a color temperature curve:
- 100-60%: Cool palette (hue offset 0, base from time-of-day palette)
- 60-30%: Gradual warm shift (hue bias toward amber, +15 degrees at 30%)
- 30-15%: Warm/urgent (hue bias +30, saturation boost 0.1, speed increase 0.2)
- 15-5%: Hot reds (hue forces toward 0-10 range, intensity pulses at 0.5Hz)
- <5%: Critical -- slow pulse between blood red and black, speed drops to 0.3
- Charging state detected: hue sweeps through green-cyan (120-180), speed 0.8, morphFactor 1.5 (geometric "growth" feeling)
**Parameters affected**: hue (bias), saturation (boost), speed (urgency), intensity (pulse at critical)

### 2.6 Time-of-Day Palette
**Trigger**: Checked on load and every 60 seconds
**What it does**: Base color palette shifts across a 24-hour cycle. This establishes the "ground truth" hue that all other modulations are relative to.
- 00:00-04:00 (Deep Night): Midnight Purple preset values (hue 270, sat 0.7, int 0.4, speed 0.5)
- 04:00-06:00 (Pre-Dawn): Transition to Deep Space (hue 250, sat 0.6, int 0.35)
- 06:00-08:00 (Dawn): Golden Hour (hue 45, sat 0.8, int 0.7)
- 08:00-12:00 (Morning): Arctic Aurora (hue 160, sat 0.8, int 0.65)
- 12:00-14:00 (Midday): Ice Crystal (hue 190, sat 0.55, int 0.8)
- 14:00-17:00 (Afternoon): Coral Reef (hue 350, sat 0.7, int 0.65)
- 17:00-19:00 (Golden Hour): Sunset Gradient (hue 20, sat 0.85, int 0.75)
- 19:00-21:00 (Twilight): Retro Wave (hue 310, sat 0.9, int 0.8)
- 21:00-00:00 (Night): Cyberpunk Neon (hue 290, sat 0.95, int 0.85)

Transitions between periods use `sineInOut` easing over 10 minutes for imperceptible shifts.
**Parameters affected**: hue (base), saturation (base), intensity (base), speed (base)

### 2.7 Speech -> Geometric Structures
**Trigger**: Web Speech API (SpeechRecognition) running continuously in the background
**What it does**: Converts detected speech patterns into geometric parameter changes:
- **Vowels map to geometry**: "ah" -> Sphere (open, round), "ee" -> Crystal (sharp, linear), "oh" -> Torus (round, hollow), "oo" -> Klein Bottle (enclosed, tunneling), "eh" -> Wave (mid-energy)
- **Consonant transients**: Plosives (p/t/k/b/d/g) trigger micro-chaos bursts (chaos += 0.3, decay 200ms). Fricatives (s/sh/f/th) increase gridDensity by 8 for 500ms. Nasals (m/n/ng) smooth morphFactor toward 1.5 over 300ms.
- **Syllable rhythm**: Detected syllable rate maps to `speed` parameter. Whisper (low energy) -> speed 0.3. Normal speech -> speed 1.0. Shouting (high energy) -> speed 2.5.
- **Word length**: Longer detected words increase `dimension` toward 4.5 (deeper 4D projection). Short words keep it at 3.5.
**Fallback**: If SpeechRecognition unavailable, audio amplitude envelope is used to simulate rhythmic pattern detection via zero-crossing analysis.
**Parameters affected**: geometry, chaos, gridDensity, morphFactor, speed, dimension

### 2.8 Multi-Touch Gestures
**Trigger**: Touch events with 1-5 simultaneous contacts

| Gesture | Detection | Effect |
|---------|-----------|--------|
| **Pinch** | Distance between 2 touches decreasing/increasing | Maps to `dimension` (3.0 to 4.5). Pinch in = collapse to 3D, spread = push into 4D. Easing: `easeOutQuad` |
| **Two-finger rotate** | Angle change between 2 touch points | Maps directly to `rot4dXW` and `rot4dYW` (the 4D hyperspace planes). Rotating your fingers literally rotates through hyperspace. Scale: 1 full finger rotation = 2pi radians |
| **Three-finger swipe** | 3 touches moving in same direction | Horizontal swipe: cycle between systems (left = previous, right = next). Vertical swipe up: increase core type (Base -> Hypersphere -> Hypertetrahedron). Vertical swipe down: decrease. Transition: 1200ms with `elastic` easing |
| **Four-finger tap** | 4 simultaneous touch contacts | Randomize all parameters with `bounce` easing over 2 seconds |
| **Five-finger press** | 5 touches held > 500ms | Reset to defaults with `sineInOut` over 3 seconds |
| **Single-finger drag** | 1 touch moving | Maps to `rot4dXY` (horizontal movement) and `rot4dXZ` (vertical movement). Standard 3D rotation feel |

### 2.9 Idle Detection -> Autonomous Generative Sequence
**Trigger**: No touch, mouse, accelerometer, or audio input for 30 seconds
**What it does**: Launches the 120-second choreographed autonomous sequence (see Section 5). Fades in autonomy smoothly over 3 seconds -- the user perceives the visualization "coming alive on its own." Any user input immediately interrupts with a 500ms transition back to reactive mode.
**Parameters affected**: All (see choreography section)

### 2.10 Screen Orientation Change -> Dramatic Transition
**Trigger**: `orientationchange` event or `matchMedia('(orientation: portrait)')` change
**What it does**: On orientation change:
1. Flash: intensity spikes to 1.0 for 100ms
2. System switch: cycles to the next visualization system with `elastic` easing
3. Geometry advance: moves to next core type (Base -> Hypersphere -> Hypertetra -> Base)
4. Rotation flourish: all 6 rotation planes receive a 1-radian impulse that decays over 2 seconds
5. Color shift: hue jumps by 120 degrees (triadic color shift)
6. Haptic: 150ms medium vibration

Total flourish duration: 2 seconds. All parameters return to reactive baselines via `easeOut`.
**Parameters affected**: intensity, system, geometry, all rotations, hue

### 2.11 Network Speed -> Complexity Adjustment
**Trigger**: `navigator.connection` API (where available), checked on load and every 60 seconds
**What it does**: Adjusts visual complexity to match network conditions (as a proxy for device capability):
- **Fast** (>10 Mbps downlink, <50ms RTT): gridDensity up to 80, all geometry types enabled (0-23), full chromatic aberration
- **Medium** (2-10 Mbps): gridDensity capped at 50, geometry types 0-15, reduced post-processing
- **Slow** (<2 Mbps): gridDensity capped at 30, geometry types 0-7, no post-processing
- **Offline**: gridDensity 20, geometry locked to Sphere (geometry 2), maximum smoothing to reduce redraws
**Parameters affected**: gridDensity (cap), geometry (range), morphFactor (complexity scaling)

### 2.12 Haptic Feedback at Rotation Plane Boundaries
**Trigger**: Any rotation uniform crosses a pi/2 boundary (0, pi/2, pi, 3pi/2, 2pi)
**What it does**: Fires a subtle 15ms haptic pulse via `navigator.vibrate(15)`. At pi boundaries (0, pi, 2pi) the pulse is stronger (30ms). This creates a tactile "click" sensation as you rotate through hyperspace, as though the geometry has stable configurations at right angles.
**Parameters affected**: None (haptic output only)

### 2.13 Audio Onset -> Flash + Geometry Stab
**Trigger**: Spectral flux exceeds 3x running average (detected transient/beat)
**What it does**: On each detected beat/onset:
1. `intensity` spikes by +0.3 (clamped to 1.0), decays over 150ms
2. `morphFactor` receives a 0.2 impulse, decays over 200ms
3. Current `hue` shifts by +15 degrees permanently (wrapping at 360)
4. Every 4th onset triggers a geometry base type increment (0->1->2->...->7->0)
5. Every 16th onset triggers a core type increment (0->8->16->0)
6. Haptic: 10ms micro-pulse
**Parameters affected**: intensity, morphFactor, hue, geometry (periodic)

### 2.14 Breath Detection via Microphone
**Trigger**: Low-frequency amplitude envelope (20-200Hz) with slow rise/fall characteristic (>1s cycle)
**What it does**: When breath pattern detected (distinct from speech or music by its regularity and bandwidth):
- Inhale (rising amplitude over >800ms): `dimension` increases 3.5 -> 4.2 (expanding into 4D), `speed` decreases to 0.3 (slowing)
- Exhale (falling amplitude over >800ms): `dimension` decreases 4.2 -> 3.5, `speed` increases to 1.5, `intensity` gently pulses
- Creates a meditative feedback loop where breathing literally controls the dimensionality of space
**Parameters affected**: dimension, speed, intensity

### 2.15 Microphone Silence -> Night Mode
**Trigger**: RMS audio energy below -60dB for >10 continuous seconds (after audio was active)
**What it does**: Gradually transitions to a sleep-like state: speed drops to 0.2, intensity to 0.3, chaos to 0.02, gridDensity to 10, all rotation velocities halve. Color shifts to Midnight Purple preset over 8 seconds using `sineInOut`. The visualization becomes a gentle, barely-moving ambient light. First sound above -40dB jolts it awake with a mini version of the shake explosion (chaos 0.5 for 2 seconds).
**Parameters affected**: speed, intensity, chaos, gridDensity, rotations, hue/saturation

---

## 3. Audio Pipeline

### FFT Configuration

```
Source:           getUserMedia({ audio: true }) OR <audio> element
AnalyserNode:     fftSize = 2048 (1024 frequency bins)
Smoothing:        smoothingTimeConstant = 0.8
Sample Rate:      Native (typically 44100 or 48000)
Update Rate:      Every requestAnimationFrame (target 60fps)
```

### 8-Band Spectral Decomposition

| Band | Frequency Range | Bin Range (44.1kHz) | Name |
|------|----------------|---------------------|------|
| 0 | 20-60 Hz | 1-3 | Sub-bass |
| 1 | 60-200 Hz | 3-9 | Bass |
| 2 | 200-500 Hz | 9-23 | Low-mid |
| 3 | 500-1200 Hz | 23-56 | Mid |
| 4 | 1200-3000 Hz | 56-139 | Upper-mid |
| 5 | 3000-6000 Hz | 139-279 | Presence |
| 6 | 6000-12000 Hz | 279-558 | Brilliance |
| 7 | 12000-20000 Hz | 558-930 | Air |

### Band Energy Calculation

For each band: take the mean of `getByteFrequencyData()` values within the bin range, normalize to 0.0-1.0, apply per-band gain, then smooth with exponential moving average (alpha = 0.15 for responsive, 0.05 for smooth).

### Parameter Mapping Table (Audio -> VIB3)

| Audio Signal | Target Parameter | Range | Easing | Smoothing | Notes |
|-------------|-----------------|-------|--------|-----------|-------|
| Sub-bass energy | `morphFactor` | 0.2 - 1.8 | `easeOutQuad` | 0.12 | Deep bass literally reshapes geometry |
| Bass energy | `morphFactor` (additive) | +0.0 - +0.4 | `easeOut` | 0.15 | Combined with sub-bass for full low-end response |
| Bass energy | `rot4dZW` velocity | 0.0 - 0.8 rad/s | `linear` | 0.2 | Bass drives the deepest hyperspace rotation |
| Low-mid energy | `gridDensity` | 15 - 60 | `easeInOut` | 0.1 | Low-mids fill in pattern density |
| Mid energy | `speed` | 0.3 - 2.2 | `easeOutQuad` | 0.08 | Mids control animation tempo |
| Mid energy | `rot4dXY` velocity | 0.0 - 1.2 rad/s | `linear` | 0.15 | Mids spin the primary rotation |
| Upper-mid energy | `rot4dXW` velocity | 0.0 - 0.6 rad/s | `easeOut` | 0.12 | Upper-mids activate 4D rotation |
| Upper-mid energy | `chaos` | 0.0 - 0.5 | `easeInOut` | 0.1 | Vocal presence adds structured chaos |
| Presence energy | `gridDensity` (additive) | +0 - +20 | `easeOut` | 0.08 | High detail in presence range |
| Presence energy | `hue` shift | +0 - +30 deg | `linear` | 0.2 | Bright frequencies shift color |
| Brilliance energy | `saturation` | 0.5 - 1.0 | `easeOut` | 0.15 | Brilliance saturates color |
| Brilliance energy | `intensity` | +0.0 - +0.2 | `linear` | 0.1 | Adds brightness in highs |
| Air energy | `dimension` modulation | +0.0 - +0.3 | `easeOut` | 0.2 | Barely-audible air pushes into 4D |
| RMS energy (total) | `intensity` (base) | 0.3 - 0.9 | `easeInOut` | 0.12 | Overall loudness = overall brightness |
| Spectral flux | onset trigger | threshold: 3x avg | n/a | n/a | See Surprise 2.13 |
| Spectral centroid | `hue` (continuous) | 0 - 360 (full range) | `sineInOut` | 0.25 | Bright sound = blue/violet, dark = red/orange |
| Spectral spread | `chaos` (additive) | +0.0 - +0.3 | `easeOut` | 0.15 | Wide spectra = more chaos |

### Onset Detection Algorithm

```
spectral_flux[frame] = sum(max(0, magnitude[bin] - prev_magnitude[bin]))  for all bins
running_avg = EMA(spectral_flux, alpha=0.05)
onset_detected = spectral_flux[frame] > running_avg * 3.0
```

Onset cooldown: 100ms minimum between detections to prevent double-triggers.

### Pitch Tracking (Simplified Autocorrelation)

Used for the speech-to-geometry mapping. Compute autocorrelation of the time-domain buffer, find the first peak after the initial falloff. Map detected pitch to geometry suggestion (low pitch = large geometry like Torus, high pitch = fine geometry like Crystal).

---

## 4. Motion Pipeline

### Accelerometer/Gyroscope Processing

**Data source**: `DeviceOrientationEvent` (alpha, beta, gamma) on mobile, `DeviceMotionEvent` for accelerometer.

### Orientation -> 6D Rotation Mapping

| Device Axis | Rotation Plane | Scale Factor | Range | Notes |
|-------------|---------------|--------------|-------|-------|
| gamma (left/right tilt) | `rot4dXY` | 0.015 rad/degree | -90..90 deg | Primary 3D rotation around Z |
| beta (front/back tilt) | `rot4dXZ` | 0.015 rad/degree | -180..180 deg | Primary 3D rotation around Y |
| alpha (compass heading) | `rot4dYZ` | 0.008 rad/degree | 0..360 deg | Slow compass rotation |
| gamma velocity | `rot4dXW` | 0.3 rad per rad/s | continuous | Tilt speed opens hyperspace |
| beta velocity | `rot4dYW` | 0.3 rad per rad/s | continuous | Tilt speed opens hyperspace |
| alpha velocity | `rot4dZW` | 0.2 rad per rad/s | continuous | Heading change speed |

**Key insight**: Static tilt maps to 3D rotation planes (XY, XZ, YZ), while the *rate of tilting* maps to 4D rotation planes (XW, YW, ZW). This means gently holding the phone tilted gives a stable 3D rotation, while actively moving it opens up hyperspace dimensions. Stillness = 3D. Motion = 4D.

### Smoothing

All orientation values pass through a simple Kalman-inspired filter:

```
smoothed = smoothed + 0.12 * (raw - smoothed)  // per frame at 60fps
velocity = (current - previous) / deltaTime
smoothed_velocity = smoothed_velocity + 0.08 * (velocity - smoothed_velocity)
```

### Shake Detection

```
jerk = (acceleration[t] - acceleration[t-1]) / deltaTime
jerk_magnitude = sqrt(jerk.x^2 + jerk.y^2 + jerk.z^2)
shake_detected = jerk_magnitude > 25.0  // m/s^3
```

### Mouse Fallback (Desktop)

| Mouse Input | Rotation Plane | Mapping |
|-------------|---------------|---------|
| X position (normalized 0-1) | `rot4dXY` | (mouseX - 0.5) * 2.0 * PI |
| Y position (normalized 0-1) | `rot4dXZ` | (mouseY - 0.5) * 2.0 * PI |
| X velocity | `rot4dXW` | clamp(velX / 1000, -1, 1) * 0.5 * PI |
| Y velocity | `rot4dYW` | clamp(velY / 1000, -1, 1) * 0.5 * PI |
| Scroll wheel delta | `rot4dZW` | delta * 0.01 (accumulated) |
| Mouse speed (magnitude) | `rot4dYZ` | clamp(speed / 2000, 0, 1) * 0.3 * PI |

---

## 5. Choreography Timeline (Autonomous Sequence)

The autonomous sequence is a 120-second loop divided into 8 scenes. Each scene specifies target values for all parameters, the visualization system, geometry index, transition easing, and scene duration. Between scenes, transitions are handled with the specified easing over 2-second windows.

### Scene Table

| # | Time | Duration | System | Geometry | Hue | Sat | Int | Chaos | Speed | Morph | Grid | Dim | Easing In | Color Preset Ref |
|---|------|----------|--------|----------|-----|-----|-----|-------|-------|-------|------|-----|-----------|-----------------|
| 1 | 0:00 | 15s | Faceted | 1 (Hypercube) | 270 | 0.7 | 0.4 | 0.05 | 0.5 | 0.3 | 20 | 3.2 | `easeIn` | Midnight Purple |
| 2 | 0:15 | 15s | Faceted | 9 (Hyper+Hypercube) | 160 | 0.8 | 0.65 | 0.2 | 0.8 | 0.8 | 35 | 3.6 | `easeInOut` | Arctic Aurora |
| 3 | 0:30 | 15s | Quantum | 5 (Fractal) | 290 | 0.95 | 0.85 | 0.35 | 1.4 | 1.0 | 50 | 3.8 | `elastic` | Cyberpunk Neon |
| 4 | 0:45 | 15s | Quantum | 19 (HyperTetra+Torus) | 30 | 0.9 | 0.9 | 0.5 | 2.0 | 1.5 | 65 | 4.0 | `backOut` | Solar Flare |
| 5 | 1:00 | 15s | Holographic | 8 (Hyper+Tetra) | 0 | 0.85 | 0.75 | 0.2 | 1.0 | 1.2 | 45 | 4.2 | `bounce` | Holographic Rainbow |
| 6 | 1:15 | 15s | Holographic | 22 (HyperTetra+Wave) | 220 | 0.6 | 0.5 | 0.65 | 1.3 | 0.9 | 55 | 4.5 | `cubic` | Thunderstorm |
| 7 | 1:30 | 15s | Quantum | 16 (HyperTetra+Tetra) | 10 | 0.85 | 0.75 | 0.45 | 1.2 | 1.4 | 40 | 3.8 | `expoOut` | Volcanic |
| 8 | 1:45 | 15s | Faceted | 2 (Sphere) | 200 | 0.75 | 0.55 | 0.1 | 0.6 | 0.5 | 25 | 3.3 | `sineInOut` | Ocean Deep |

### Per-Scene Rotation Keyframes

Each scene has its own rotation trajectory. Rotations are specified as angular velocities (rad/s) that create smooth continuous rotation during the scene.

| Scene | XY vel | XZ vel | YZ vel | XW vel | YW vel | ZW vel |
|-------|--------|--------|--------|--------|--------|--------|
| 1 | 0.05 | 0.03 | 0.02 | 0.0 | 0.0 | 0.0 |
| 2 | 0.08 | 0.06 | 0.04 | 0.02 | 0.01 | 0.0 |
| 3 | 0.12 | 0.10 | 0.08 | 0.06 | 0.04 | 0.02 |
| 4 | 0.15 | 0.12 | 0.10 | 0.10 | 0.08 | 0.06 |
| 5 | 0.10 | 0.08 | 0.06 | 0.12 | 0.10 | 0.08 |
| 6 | 0.06 | 0.15 | 0.04 | 0.08 | 0.12 | 0.10 |
| 7 | 0.20 | 0.05 | 0.15 | 0.05 | 0.06 | 0.12 |
| 8 | 0.03 | 0.02 | 0.01 | 0.01 | 0.01 | 0.01 |

### Intra-Scene Micro-Keyframes

Within each 15-second scene, additional micro-keyframes create interest:

**Scene 1 (Emergence)**:
- t+0s: gridDensity 10, morphFactor 0
- t+5s: gridDensity 20, morphFactor 0.3 (easeIn)
- t+10s: gridDensity 20, morphFactor 0.3, hue +10 (linear)
- t+13s: begin intensity ramp to Scene 2 values (easeInOut)

**Scene 3 (Cyberpunk Burst)**:
- t+0s: chaos 0.1
- t+2s: chaos 0.35 (easeOut)
- t+4s: chaos 0.35, micro geometry flicker (5->5->6->5 at 200ms intervals)
- t+7s: chaos 0.5 peak (elastic)
- t+10s: chaos 0.35 (easeOut)
- t+12s: speed ramp from 1.4 to 1.8 (easeIn)
- t+14s: intensity flash 1.0 for 200ms then back (bounce)

**Scene 4 (Solar Eruption)**:
- t+0s: morphFactor 1.0
- t+3s: morphFactor 1.5 (backOut)
- t+5s: chaos spike 0.8 for 500ms then 0.5 (elastic)
- t+7s: hue oscillation begins (30 +/- 15 at 0.5Hz)
- t+10s: gridDensity ramp 65->80 (easeIn)
- t+13s: all rotations double speed for 2s (anticipation for system switch)

**Scene 5 (Holographic Bloom)**:
- t+0s: dimension 4.0 (carried from Scene 4)
- t+2s: dimension 4.2 (easeInOut) -- push deeper into 4D
- t+5s: intensity oscillation 0.6-0.9 at 0.3Hz (sinusoidal)
- t+8s: hue begins full-spectrum sweep (0->360 over 7 seconds, linear)
- t+12s: morphFactor pulse 1.2->1.5->1.2 (bounce, 1 second)

**Scene 6 (Storm)**:
- t+0s: chaos 0.3
- t+1s: chaos 0.65 (expoIn)
- t+3s: intensity flash (0.5->1.0->0.5 over 400ms, bounce) -- "lightning"
- t+5s: another flash
- t+7s: another flash, with hue shift +40
- t+9s: gridDensity spike 55->75->55 over 1.5s (elastic)
- t+11s: chaos begins decay 0.65->0.4 (easeOut)
- t+14s: speed drops 1.3->0.8 (easeOut) -- storm passing

**Scene 8 (Return to Calm)**:
- t+0s: All parameters begin smooth converge to Scene 1 start values
- t+5s: gridDensity reaches 15 (sineInOut)
- t+8s: chaos reaches 0.02 (sineInOut)
- t+10s: speed reaches 0.4 (sineInOut)
- t+12s: All rotations decelerating
- t+14.5s: Seamless loop point back to Scene 1

---

## 6. Shader Architecture

### Approach: Three Complete Fragment Shaders, Hot-Swappable

The experience embeds three complete GLSL fragment shaders inline in the HTML, directly extracted and adapted from the VIB3+ SDK source:

#### Shader 1: Faceted (from `FacetedSystem.js`)
- Full 6D rotation matrix set (rotateXY through rotateZW)
- `project4Dto3D()` perspective projection with variable `u_dimension`
- `applyCoreWarp()` with both `warpHypersphereCore()` and `warpHypertetraCore()`
- `geometryFunction()` with all 8 base geometry types
- HSL color via sin-wave with `u_hue`, `u_saturation` control
- Audio uniforms: `u_bass`, `u_mid`, `u_high`
- Audio-reactive density: `1.0 + u_bass * 0.3`
- Mouse interaction via `u_mouseIntensity`, `u_clickIntensity`

#### Shader 2: Quantum (from `QuantumVisualizer.js`)
- Same rotation and projection pipeline
- Superior lattice functions: `tetrahedronLattice`, `hypercubeLattice`, `sphereLattice`, `torusLattice`, `kleinLattice`, `fractalLattice`, `waveLattice`, `crystalLattice`
- Each lattice has vertex detection, edge rendering, and face highlighting
- HSL-to-RGB conversion for proper color control
- Per-layer color palette system (`getLayerColorPalette`)
- Extreme RGB separation per layer for holographic shimmer
- Higher visual fidelity with `pow(geometryIntensity, 1.5)` dramatic falloff

#### Shader 3: Holographic (from `HolographicVisualizer.js`)
- Same core geometry pipeline as Quantum
- Additional holographic shimmer: `sin(uv.x * 20.0 + timeSpeed * 5.0) * cos(uv.y * 15.0 + timeSpeed * 3.0) * 0.1`
- 5-layer color palette system with per-layer hue offsets (background, shadow, content, highlight, accent)
- Extreme RGB channel separation with layer-specific patterns
- Breath modulation via `u_breath` uniform
- Higher base intensity and glow

### System Switching

When the orchestrator switches systems:
1. Current system's canvas opacity begins fading (0ms to 800ms, `easeIn`)
2. At 400ms, new system's shader program activates on the main canvas
3. New system's canvas opacity fades in (400ms to 1200ms, `easeOut`)
4. Total cross-fade: 1200ms, with 400ms overlap

### Uniform Update Pipeline

Every frame, a single `updateUniforms()` call sets all uniforms on the active shader program:

```
u_time          <- performance.now() - startTime
u_resolution    <- [canvas.width, canvas.height]
u_mouse         <- [normalizedMouseX, normalizedMouseY]
u_geometry      <- stateManager.geometry (float, 0-23)
u_gridDensity   <- stateManager.gridDensity (4-100)
u_morphFactor   <- stateManager.morphFactor (0-2)
u_chaos         <- stateManager.chaos (0-1)
u_speed         <- stateManager.speed (0.1-3)
u_hue           <- stateManager.hue / 360.0 (normalized 0-1 for Quantum/Holo, raw for Faceted)
u_intensity     <- stateManager.intensity (0-1)
u_saturation    <- stateManager.saturation (0-1)
u_dimension     <- stateManager.dimension (3.0-4.5)
u_rot4dXY       <- stateManager.rot4dXY (0-2pi)
u_rot4dXZ       <- stateManager.rot4dXZ (0-2pi)
u_rot4dYZ       <- stateManager.rot4dYZ (0-2pi)
u_rot4dXW       <- stateManager.rot4dXW (0-2pi)
u_rot4dYW       <- stateManager.rot4dYW (0-2pi)
u_rot4dZW       <- stateManager.rot4dZW (0-2pi)
u_mouseIntensity <- stateManager.mouseIntensity (0-1)
u_clickIntensity <- stateManager.clickIntensity (0-1, decaying)
u_bass          <- audioProcessor.bands[1] (0-1)
u_mid           <- audioProcessor.bands[3] (0-1)
u_high          <- audioProcessor.bands[6] (0-1)
u_breath        <- stateManager.breath (0-1)
u_roleIntensity <- layer role indicator (for Holographic only)
```

### Geometry Switching (Float Interpolation)

When the geometry target changes, `u_geometry` is NOT snapped -- it's linearly interpolated over 500ms. Because the shader uses `floor()` to determine discrete geometry type, intermediate float values create a "glitch morph" effect at the transition boundary. The `morphFactor` is simultaneously boosted during geometry transitions to amplify the cross-fade feeling.

---

## 7. Parameter Keyframe Count

### Continuous Mappings: 42

Audio (17 mappings from Section 3 table) + Motion (12 mappings: 6 orientation->rotation, 6 velocity->rotation) + Gestures (6 mappings: pinch->dimension, 2-finger->2 rotations, drag->2 rotations, speed->rot4dYZ) + Environment (7 mappings: time->4 params, battery->3 params)

### Threshold Triggers: 18

- Audio onset detection: 6 parameter effects (intensity spike, morphFactor impulse, hue shift, geometry cycle, core type cycle, haptic)
- Shake detection: 5 parameter effects (chaos, speed, intensity, geometry scatter, rotation impulses)
- Double-tap: 2 states (freeze toggle)
- Orientation change: 5 parameter effects (intensity flash, system switch, geometry advance, rotation flourish, hue jump)

### Cross-Modulations: 12

Mappings that multiply or gate other mappings:
1. Audio RMS gates motion sensitivity (silence = low motion response)
2. Chaos level modulates audio onset threshold (high chaos = less sensitive)
3. Battery level scales maximum intensity
4. Ambient light scales saturation range
5. Network speed caps gridDensity maximum
6. Freeze state disables all audio/motion mappings
7. Idle state disables all reactive mappings (replaced by choreography)
8. Speech detection temporarily overrides audio-geometry mapping
9. Breath detection scales dimension mapping range
10. Time-of-day shifts all hue mappings by base offset
11. Shake cooldown suppresses onset detection for 5 seconds
12. System type modulates which audio bands are dominant

### Autonomous Choreography Keyframes

- 8 scenes x 17 base parameters = 136 scene-level keyframes
- 8 scenes x 6 rotation velocities = 48 rotation keyframes
- 6 scenes with micro-keyframes, averaging 7 micro-keyframes each = ~42 micro-keyframes
- Scene transition keyframes (7 transitions x ~10 interpolated params) = 70 transition keyframes

**Total explicit keyframes: ~296**

### Per-Frame Computed Values

Each frame, the parameter mapping layer computes:
- 42 continuous mapping outputs
- 12 cross-modulation multipliers
- 17 smoothed parameter values
- 6 rotation angle accumulations
- 8 audio band energies
- 3 derived audio features (spectral centroid, flux, spread)
- 3 motion-derived values (jerk magnitude, velocity magnitude, heading change rate)

**Per-frame computed values: ~91**

### Total Coordinated State Dimensions

Across the full experience, at any given frame, the state is determined by the interaction of:
- 42 continuous input-to-parameter mappings
- 18 possible threshold events
- 12 cross-modulations
- ~296 choreography keyframes (when autonomous)
- 91 per-frame computations
- 3 possible system states (Faceted, Quantum, Holographic)
- 24 possible geometry indices
- 14 easing functions available for transitions

**Total unique state dimensions: ~481**

---

## 8. Why This Is Impossible to Hand-Craft

### The Combinatorial Explosion

A human designer working manually would face the following:

**1. Cross-domain expertise requirement**: This experience requires simultaneous deep knowledge of WebGL/GLSL shader programming, Web Audio API (FFT analysis, onset detection, pitch tracking), device sensor APIs (accelerometer, gyroscope, ambient light, battery, network), gesture recognition (multi-touch tracking, shake detection), speech recognition, state machine design, animation easing theory, color theory (HSL manipulation, temperature curves, time-of-day palettes), and 4D geometric algebra (rotation planes, projection distances). No single human typically holds all of these at working depth.

**2. The mapping matrix is 42 x 17 x 14**: 42 input signals mapping to 17 output parameters with 14 possible easing functions means 9,996 possible mapping configurations. Each one needs specific range, scale, smoothing, and easing choices that interact with every other mapping. A human would need to test each combination's feel, which at 30 seconds per test would take 83 hours of continuous testing just for the mappings -- and that's without considering the cross-modulations.

**3. Micro-keyframe timing**: The 6 scenes with micro-keyframes contain timing decisions at 200ms granularity across 15-second windows. For each scene, the designer must decide: which of 17 parameters gets a micro-keyframe, at what exact time, with what target value, with what easing, for what duration. With just 5 decision points per micro-keyframe and 7 micro-keyframes per scene, that's 5^7 = 78,125 possible configurations per scene, and 78,125^6 = 2.27 x 10^29 possible micro-keyframe arrangements across all scenes.

**4. Rotation velocity coordination**: The 8-scene rotation table has 48 values (8 scenes x 6 planes) that must produce smooth, non-repetitive, aesthetically pleasing 4D rotation paths. The interaction between simultaneous rotations in 6 planes produces emergent patterns (Lissajous-like figures in 4D projected to 3D) that are impossible to predict without simulation. A human would need to watch each combination play out and adjust, but changing one velocity affects the perceived pattern of all others.

**5. Surprise interaction matrix**: The 15 surprise behaviors can co-occur. Shake + audio onset + orientation change could all trigger simultaneously. The system must handle 2^15 = 32,768 possible combinations of active surprises, with each combination producing a different parameter state. Ensuring no combination produces visual artifacts (like chaos=1.0 + intensity=1.0 + speed=3.0 + all rotations at maximum velocity) requires bounds checking across all 32,768 states.

**6. Audio-geometry morphing specificity**: The mapping of 8 frequency bands to specific geometry types and the float-interpolation of `u_geometry` to create cross-fade effects requires precise knowledge of how each of the 8 lattice functions behaves at boundary values, which geometries produce aesthetically pleasing intermediate states, and which transitions should be favored or avoided. This is a 64-entry preference matrix (8 from x 8 to) that a human would need to evaluate by watching each transition.

**7. The drift periods in freeze mode**: Using 17 prime numbers as drift periods creates a phase pattern that takes LCM(7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71) = approximately 3.26 x 10^21 seconds (~1.03 x 10^14 years) before repeating. This means the frozen-drift state is effectively never-repeating, which is a mathematical property a human might aspire to but would not verify.

**8. Real-time constraint satisfaction**: All 91 per-frame computations must complete within 16.67ms (60fps) on mobile hardware. Balancing audio FFT analysis, motion processing, mapping calculations, cross-modulations, and shader uniform updates requires careful ordering and caching that emerges from the system architecture, not from manual optimization passes.

---

## Appendix A: Full Preset Reference (from ColorPresetsSystem.js)

The 22 built-in presets available for time-of-day and choreography reference:

| Preset | Hue | Sat | Int | HueShift | Speed | Chaos | Category |
|--------|-----|-----|-----|----------|-------|-------|----------|
| Cyberpunk Neon | 290 | 0.95 | 0.85 | 30 | 1.4 | 0.35 | Futuristic |
| Ocean Deep | 200 | 0.75 | 0.55 | 15 | 0.6 | 0.1 | Nature |
| Solar Flare | 30 | 0.9 | 0.9 | 25 | 2.0 | 0.5 | Cosmic |
| Midnight Purple | 270 | 0.7 | 0.4 | 10 | 0.5 | 0.05 | Dark |
| Arctic Aurora | 160 | 0.8 | 0.65 | 50 | 0.8 | 0.2 | Nature |
| Volcanic | 10 | 0.85 | 0.75 | 15 | 1.2 | 0.45 | Elemental |
| Forest Mystic | 130 | 0.6 | 0.5 | 20 | 0.7 | 0.15 | Nature |
| Retro Wave | 310 | 0.9 | 0.8 | 40 | 1.5 | 0.3 | Retro |
| Quantum Void | 240 | 0.5 | 0.3 | 5 | 0.4 | 0.6 | Cosmic |
| Golden Hour | 45 | 0.8 | 0.7 | 10 | 0.5 | 0.05 | Warm |
| Ice Crystal | 190 | 0.55 | 0.8 | 8 | 0.6 | 0.08 | Elemental |
| Blood Moon | 0 | 0.85 | 0.5 | 10 | 0.7 | 0.25 | Dark |
| Digital Rain | 120 | 0.9 | 0.7 | 5 | 1.8 | 0.4 | Futuristic |
| Sunset Gradient | 20 | 0.85 | 0.75 | 35 | 0.5 | 0.1 | Warm |
| Deep Space | 250 | 0.6 | 0.35 | 20 | 0.3 | 0.15 | Cosmic |
| Toxic Green | 100 | 0.95 | 0.8 | 10 | 1.6 | 0.5 | Futuristic |
| Royal Purple | 280 | 0.75 | 0.6 | 12 | 0.8 | 0.12 | Elegant |
| Coral Reef | 350 | 0.7 | 0.65 | 25 | 0.7 | 0.2 | Nature |
| Thunderstorm | 220 | 0.6 | 0.5 | 15 | 1.3 | 0.65 | Elemental |
| Holographic Rainbow | 0 | 0.85 | 0.75 | 120 | 1.0 | 0.2 | Special |
| Lavender Dream | 260 | 0.5 | 0.6 | 8 | 0.4 | 0.03 | Elegant |
| Amber Glow | 38 | 0.85 | 0.65 | 8 | 0.6 | 0.08 | Warm |

## Appendix B: Full Easing Function Reference (from TransitionAnimator.js)

14 available easing functions for keyframe interpolation:

| Name | Type | Character |
|------|------|-----------|
| `linear` | Constant velocity | Mechanical, predictable |
| `easeIn` | Cubic acceleration | Slow start, fast finish |
| `easeOut` | Cubic deceleration | Fast start, gentle landing |
| `easeInOut` | Cubic S-curve | Smooth start and finish |
| `easeInQuad` | Quadratic acceleration | Gentler acceleration than cubic |
| `easeOutQuad` | Quadratic deceleration | Gentler deceleration than cubic |
| `bounce` | Bouncing ball | Playful, physical feel |
| `elastic` | Spring oscillation | Overshoots then settles, organic |
| `cubic` | Cubic Bezier | Identical to easeInOut in this implementation |
| `backOut` | Overshoot return | Slightly exceeds target then returns |
| `backIn` | Pull-back | Retreats before advancing |
| `expoOut` | Exponential decel | Very fast start, very gentle end |
| `expoIn` | Exponential accel | Very slow start, explosive end |
| `sineInOut` | Sinusoidal S-curve | Most natural, organic feeling |

## Appendix C: Geometry Quick Reference

| Index | Core | Base | Name |
|-------|------|------|------|
| 0 | Base | Tetrahedron | 4-vertex simplex lattice |
| 1 | Base | Hypercube | Tesseract projection |
| 2 | Base | Sphere | Radial harmonic |
| 3 | Base | Torus | Toroidal field |
| 4 | Base | Klein Bottle | Non-orientable surface |
| 5 | Base | Fractal | Recursive subdivision |
| 6 | Base | Wave | Sinusoidal interference |
| 7 | Base | Crystal | Octahedral structure |
| 8 | Hypersphere | Tetrahedron | S3-projected simplex |
| 9 | Hypersphere | Hypercube | S3-projected tesseract |
| 10 | Hypersphere | Sphere | S3-projected harmonic |
| 11 | Hypersphere | Torus | Hopf fibration torus |
| 12 | Hypersphere | Klein Bottle | S3-projected non-orientable |
| 13 | Hypersphere | Fractal | S3-projected fractal |
| 14 | Hypersphere | Wave | S3-projected interference |
| 15 | Hypersphere | Crystal | S3-projected octahedral |
| 16 | HyperTetra | Tetrahedron | Pentatope simplex |
| 17 | HyperTetra | Hypercube | Pentatope tesseract |
| 18 | HyperTetra | Sphere | Pentatope harmonic |
| 19 | HyperTetra | Torus | Pentatope toroidal |
| 20 | HyperTetra | Klein Bottle | Pentatope non-orientable |
| 21 | HyperTetra | Fractal | Pentatope fractal |
| 22 | HyperTetra | Wave | Pentatope interference |
| 23 | HyperTetra | Crystal | Pentatope octahedral |

---

**End of Plan. Ready for red-team review and enhancement before implementation.**
