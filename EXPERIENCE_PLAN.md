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

---

## RED TEAM REPORT + ENHANCEMENTS

---

### Part 1: Failure Modes (Things That WILL Break)

#### 1.1 iOS DeviceMotion Permission Gate

**Issue**: On iOS 13+, `DeviceOrientationEvent` and `DeviceMotionEvent` require an explicit call to `DeviceOrientationEvent.requestPermission()`, which MUST be triggered from a user gesture (tap/click handler). Without this, all accelerometer/gyroscope data silently returns null. The plan references continuous accelerometer/gyro input but never describes a permission request flow. On iOS, the entire motion pipeline (Section 4) will be dead on arrival.

**Fix**: Add a mandatory "tap to begin" splash overlay on iOS devices. On the first user tap, call `DeviceOrientationEvent.requestPermission()` and `DeviceMotionEvent.requestPermission()` inside the click handler. Gate the motion pipeline initialization behind the resolved permission promise. If the user denies, fall back to the mouse/touch mapping table (Section 4, Mouse Fallback) and display a subtle indicator that motion input is unavailable. Detect iOS via `navigator.userAgent` or, more robustly, by checking `typeof DeviceOrientationEvent.requestPermission === 'function'`.

#### 1.2 Chrome AudioContext Autoplay Policy

**Issue**: Chrome (and most Chromium-based browsers) suspend `AudioContext` on creation. Calling `getUserMedia()` or creating an `AnalyserNode` before a user gesture means the entire audio pipeline (Section 3) produces silence. The `AudioContext.state` will be `'suspended'` and `getByteFrequencyData()` will return all zeros. The plan's continuous FFT analysis, onset detection, pitch tracking, and all 17 audio-to-parameter mappings will output flat zero.

**Fix**: Create the `AudioContext` early but immediately check `audioContext.state`. If `'suspended'`, register a one-time click/touchstart listener on `document` that calls `audioContext.resume()`. Do NOT call `getUserMedia` until the context is running. The "tap to begin" overlay from 1.1 can serve double duty: resume AudioContext AND request iOS motion permissions in the same gesture handler. Additionally, wrap `getUserMedia({ audio: true })` in a try/catch and handle the case where the user denies microphone access (see 1.4).

#### 1.3 getUserMedia Failure / No Microphone

**Issue**: `navigator.mediaDevices.getUserMedia({ audio: true })` can fail for multiple reasons: user denies permission, no microphone hardware exists (desktop without mic, kiosk displays), browser in HTTP context (getUserMedia requires HTTPS except on localhost), or the browser simply does not support it. The plan describes microphone-dependent features (FFT, breath detection, silence detection, speech recognition) as primary experience drivers. If getUserMedia fails, approximately 40% of the 42 continuous mappings go dead.

**Fix**: Wrap getUserMedia in a try/catch. On failure, activate a "no-audio" mode that:
1. Replaces microphone input with a built-in generative audio signal: use an `OscillatorNode` + `GainNode` feeding the `AnalyserNode` with a slowly evolving sine sweep (20Hz-2kHz, 30-second cycle). This gives the FFT pipeline synthetic data that still drives the geometry morphing and color shifts.
2. Alternatively, offer the user a "play audio file" option using an `<input type="file" accept="audio/*">` that feeds an `<audio>` element through `createMediaElementSource()` into the AnalyserNode.
3. Display a small non-intrusive indicator (pulsing mic icon with a slash) so the user knows audio input is unavailable.
4. All audio-dependent mappings in Section 3 still function; they just receive synthetic or file-based spectral data instead of live microphone input.

#### 1.4 All Sensors Denied -- Graceful Degradation

**Issue**: A paranoid user or restrictive browser policy could deny EVERY sensor: microphone, accelerometer, gyroscope, ambient light, battery, speech, and network info. The plan never describes what happens in this total-denial scenario. With no sensor input, the only remaining inputs are mouse/touch position and the system clock. The 42 continuous mappings collapse to roughly 8 (mouse position/velocity + time-of-day), and the experience becomes static and unresponsive.

**Fix**: Implement a degradation tier system:

| Tier | Available Inputs | Strategy |
|------|-----------------|----------|
| Full | All sensors | Plan as designed |
| No Audio | Mouse/touch, motion, environment | Synthetic audio oscillator drives FFT pipeline |
| No Motion | Mouse/touch, audio, environment | Mouse velocity maps to all 6 rotation planes (already in plan) |
| No Audio + No Motion | Mouse/touch, environment only | Synthetic audio + autonomous micro-sequences every 10s instead of 30s |
| Minimal | Mouse/touch + clock only | Auto-engage autonomous choreography as the BASE mode. User input modulates the choreography rather than driving from scratch. Reduce idle threshold from 30s to 5s |

The key insight: the autonomous sequence (Section 5) is the safety net. If the reactive layer has insufficient input, progressively blend in autonomous behavior. The experience should ALWAYS be visually active and interesting, even if the user is on a locked-down browser with a trackpad and nothing else.

#### 1.5 120Hz Display vs 30fps Background Tab

**Issue**: `requestAnimationFrame` fires at the display refresh rate. On a 120Hz iPad Pro or 144Hz gaming monitor, the render loop runs at 2x-2.4x the expected rate. Every time-dependent calculation that uses frame counting instead of `deltaTime` will run at double speed. Conversely, when the browser tab is backgrounded, rAF is throttled to ~1fps or paused entirely. The plan's smoothing constants (alpha = 0.15, 0.08, etc.) are frame-rate dependent -- at 120fps they produce half the smoothing effect, making parameters jittery; at 1fps they produce almost no smoothing.

**Fix**: All smoothing and velocity calculations MUST use `deltaTime` (from `performance.now()` delta between frames) rather than per-frame constants. Convert all EMA alpha values to time-based constants:

```
// Instead of: smoothed += 0.12 * (raw - smoothed)
// Use: smoothed += (1 - Math.exp(-deltaTime / timeConstant)) * (raw - smoothed)
// where timeConstant is in seconds (e.g., 0.1s for responsive, 0.3s for smooth)
```

For the autonomous choreography, use absolute timestamps (`performance.now()`) for scene progression, not frame-accumulated time. When a tab returns from background, calculate the elapsed time and jump to the correct position in the choreography rather than trying to fast-forward through missed frames.

Additionally, cap `deltaTime` at 100ms (10fps floor) to prevent physics explosions when returning from a backgrounded tab. If `deltaTime > 100ms`, treat it as a discontinuity: snap parameters to their target values rather than interpolating.

#### 1.6 Memory Leaks from Continuous FFT Analysis

**Issue**: Running `getByteFrequencyData()` and `getByteTimeDomainData()` into pre-allocated `Uint8Array` buffers at 60fps is inherently safe -- the buffers are reused. However, the plan describes several features that accumulate state without bound:
- Onset detection maintains a "running average" via EMA, which is fine.
- The hue shift in Surprise 2.13 permanently adds +15 degrees per onset. Over hours with music playing, this means thousands of hue shifts -- harmless numerically (modulo 360), but worth confirming the modulo is actually applied.
- The real risk is the `SpeechRecognition` API: in continuous mode, it produces `SpeechRecognitionResult` objects that are appended to `SpeechRecognitionResultList`. If results are not consumed and the reference is held, this list grows without bound. After hours, this can consume significant memory.
- Any `console.log` or debug output left in sensor handlers will fill the browser console buffer and consume memory.

**Fix**:
1. For SpeechRecognition: Use `interimResults: true` and process each result immediately. On each `onresult` event, extract the transcript, process it, and discard. Set `maxAlternatives: 1`. Restart the recognition session every 60 seconds to clear the internal result list.
2. For hue accumulation: Always apply `hue = hue % 360` after any addition. This is likely already implicit but must be explicitly enforced.
3. Remove all `console.log` from hot paths (sensor handlers, render loop, mapping engine). Use a debug flag that defaults to false.
4. For the spectral flux history used in onset detection: use a fixed-size ring buffer (e.g., 128 frames). Never use a growing array.
5. Profile with Chrome DevTools Memory tab after 2 hours of continuous operation. Set a memory budget of 50MB for the entire experience.

#### 1.7 Shake Detection False Positives

**Issue**: The shake threshold of 25 m/s^3 jerk magnitude (Surprise 2.3) will trigger frequently during walking (typical walking jerk: 15-30 m/s^3, depending on mounting), running (50-100 m/s^3), riding a bus or subway (20-60 m/s^3 on bumps), and even from typing on a laptop with an accelerometer. The "chaos explosion" effect is dramatic and disorienting. False positives will make the experience feel broken and uncontrollable for mobile users in motion.

**Fix**:
1. Raise the threshold to 40 m/s^3. True intentional shakes produce 60-120 m/s^3.
2. Require sustained high jerk: the jerk must exceed the threshold for at least 3 consecutive samples (50ms at 60fps) rather than a single spike. Walking produces spiky, periodic jolts; intentional shaking produces sustained high-amplitude oscillation.
3. Add a frequency check: compute the dominant frequency of the acceleration signal over a 500ms window. Walking is 1.5-2.5 Hz, running is 2.5-4 Hz, intentional shaking is 5-10 Hz. Only trigger on the higher frequency band.
4. Implement a global cooldown: after a shake triggers, suppress further shake detection for 8 seconds (not just the 5-second decay described in the plan). This prevents repeated triggers from transit vibrations.
5. Provide a user setting to disable shake entirely. Some users (accessibility, motion sensitivity) will want this off.

#### 1.8 SpeechRecognition Browser Compatibility

**Issue**: The Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) is only supported in Chrome (desktop and Android) and Edge. It is NOT supported in Firefox, Safari (desktop or iOS), Samsung Internet, or any WebKit-based iOS browser. This means Surprise 2.7 (Speech -> Geometric Structures) is unavailable to approximately 40% of web users (all iOS users, all Firefox users).

**Fix**: The plan already mentions a fallback: "audio amplitude envelope used to simulate rhythmic pattern detection via zero-crossing analysis." This is good but needs to be fleshed out:
1. When `window.SpeechRecognition` and `window.webkitSpeechRecognition` are both undefined, activate the zero-crossing fallback immediately, not lazily.
2. The zero-crossing analysis can approximate vowel vs. consonant detection: vowels have low zero-crossing rates (ZCR) and high energy, plosive consonants have high ZCR with energy spikes. Map low-ZCR high-energy segments to the vowel geometry table. Map high-ZCR energy transients to the consonant micro-chaos bursts.
3. Syllable rate can be approximated by counting amplitude envelope peaks above a threshold, with 150-400ms minimum spacing.
4. This fallback should be tested and tuned independently. Do not treat it as a second-class citizen -- it will be the experience for nearly half of users.

#### 1.9 AmbientLightSensor Availability

**Issue**: The `AmbientLightSensor` API (Surprise 2.4) is behind a flag in Chrome (`#enable-generic-sensor-extra-classes`), not available in Firefox, Safari, or Edge by default. Effectively zero real-world users will have this API active. The fallback described (1x1 pixel camera capture from getUserMedia) is clever but requires camera permission, which is a SEPARATE permission dialog and far more intrusive than microphone. Users will be alarmed by a camera permission request for a visualization.

**Fix**: Replace the camera fallback entirely. Instead:
1. Use `prefers-color-scheme` media query as a binary dark/light signal.
2. Use the time-of-day palette (Surprise 2.6) as the primary ambient light proxy. It already adjusts for expected light conditions.
3. If the screen brightness API becomes available in the future, use it. For now, treat ambient light as a "nice to have" enhancement that activates only when the sensor is genuinely available -- do not prompt for camera permission as a fallback.
4. Mark this feature as progressive enhancement with zero user-facing degradation when absent.

#### 1.10 Battery API Deprecation

**Issue**: The `navigator.getBattery()` API (Surprise 2.5) was deprecated in Firefox (removed entirely) and is unavailable in Safari. It works in Chrome/Chromium on Android and desktop. On iOS, it is completely unavailable. The plan relies on it for color temperature mapping, urgency speed changes, and the dramatic "critical battery" pulsing effect.

**Fix**: Wrap `navigator.getBattery()` in a feature check. If unavailable, default to "80% battery" equivalent values (cool palette, no urgency modifications). The color temperature from time-of-day (Surprise 2.6) already provides the warm/cool variation that battery level was partially duplicating. Remove battery from the critical path entirely. It should be a subtle enhancement layer, not a core mapping. The "critical battery" red pulse effect is dramatic but affects very few users (who is watching visualizations at 5% battery?) -- it is safe to cut.

#### 1.11 Network Information API Support

**Issue**: `navigator.connection` (Surprise 2.11) is only available in Chrome and Samsung Internet on Android. It is not available in Safari, Firefox, or any iOS browser. The plan uses it to cap visual complexity, which is a proxy for device capability. Using network speed as a device capability proxy is also a flawed heuristic -- a fast Wi-Fi connection does not imply a powerful GPU, and vice versa.

**Fix**: Replace network-based complexity adjustment with actual performance measurement:
1. On load, run a 2-second GPU benchmark: render the most expensive shader (Quantum with Hypertetrahedron + Fractal, geometry 21) at full resolution and measure the average frame time.
2. If avg frame time > 20ms (below 50fps), drop to medium complexity tier.
3. If avg frame time > 33ms (below 30fps), drop to low complexity tier.
4. Continue monitoring frame time during operation. If the 60-frame rolling average drops below 45fps, dynamically reduce gridDensity by 10 and disable post-processing. If it recovers, gradually restore.
5. This approach is more accurate than network speed and works on every browser.

#### 1.12 Haptic API (navigator.vibrate) on iOS

**Issue**: `navigator.vibrate()` does not exist on iOS. Period. Not in Safari, not in Chrome on iOS, not in any iOS browser (they all use WebKit). The plan references haptic feedback in Surprises 2.3 (shake explosion), 2.10 (orientation change), 2.12 (rotation boundary clicks), and 2.13 (onset micro-pulse). On iOS, all of these calls will throw a TypeError or silently fail if not guarded.

**Fix**: Create a haptic abstraction function:
```javascript
function haptic(pattern) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
    // On iOS, use AudioContext to play a very short (10ms) low-frequency
    // sine burst at minimal volume as a psychoacoustic "thump" substitute.
    // This is not true haptics but provides subtle auditory feedback.
}
```
Guard every `navigator.vibrate()` call behind a check. Do not let haptic failure propagate. The experience must feel complete without haptics -- they are enhancement, not core feedback.

#### 1.13 Multi-Touch Gesture Conflicts with Browser Gestures

**Issue**: The plan defines pinch (2 fingers), rotation (2 fingers), three-finger swipe, four-finger tap, and five-finger press. Several of these conflict with browser/OS gestures:
- **Pinch**: Conflicts with browser pinch-to-zoom. On iOS Safari, pinch-to-zoom cannot be fully prevented by `touch-action: none` if the page is not in a standalone/PWA mode.
- **Two-finger rotation**: On macOS trackpad, this is a system gesture for Mission Control/Launchpad.
- **Three-finger swipe**: On iOS, this is the app switcher gesture. On Android, it can be screenshot or system navigation.
- **Four/five finger gestures**: On iPad, these are system gestures (app switching, home).

The plan's gesture system will fight the OS for control of these touches, producing unpredictable behavior.

**Fix**:
1. Add `touch-action: none` to the canvas element CSS AND set `{ passive: false }` on all touch event listeners, then call `e.preventDefault()` in `touchstart` and `touchmove`. This prevents browser zoom/scroll but NOT system-level gestures.
2. Limit custom gestures to 1-2 touches. Remove four-finger tap and five-finger press entirely -- they are unreliable due to OS conflicts and are nearly impossible to discover without instruction.
3. For three-finger swipe: make it optional, with a keyboard equivalent (arrow keys for system cycling, number keys for core type) that is the primary control on desktop.
4. Add a `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">` tag and set CSS `touch-action: manipulation` on the body to suppress double-tap-to-zoom delays.
5. Consider offering a fullscreen PWA mode via `manifest.json` where system gestures are reduced.

#### 1.14 WebGL Context Loss on Mobile

**Issue**: Mobile GPUs aggressively reclaim WebGL contexts when memory is low, the app is backgrounded, or another WebGL context is created. The plan has three simultaneous WebGL canvases. Creating 3 WebGL contexts on a mobile device with a 4-context limit means a FOURTH context (e.g., from an ad iframe or background tab) will cause one of the three to be lost. The existing codebase (QuantumVisualizer.js) has `webglcontextlost` and `webglcontextrestored` handlers, but the experience plan does not address how to handle mid-experience context loss.

**Fix**:
1. Reduce to a single shared WebGL context. Use a single canvas and render all three systems to it. The plan's three-canvas architecture is a compositing convenience, but it triples the context count. Use a single WebGL canvas for the active system, and a second for cross-fade transitions. The overlay canvas can be a plain 2D canvas or CSS layer.
2. If keeping multiple contexts: listen for `webglcontextlost` on all canvases. On loss, display a CSS fallback (a gradient animation using CSS `@keyframes` and `hsl()`) that approximates the current color state. On `webglcontextrestored`, reinitialize shaders and uniforms from the current state manager.
3. Set `preserveDrawingBuffer: false` (already done in the codebase) to reduce memory pressure.
4. On context loss, do NOT immediately try to create a new context. Wait for the `webglcontextrestored` event. Trying to force a new context often fails and wastes the limited context budget.

#### 1.15 Canvas Blend-Mode Compositing Artifacts

**Issue**: The three-canvas architecture uses CSS `mix-blend-mode: screen` and `mix-blend-mode: overlay` for compositing. CSS blend modes are rendered by the browser compositor, which varies by GPU driver and browser. Known issues:
- On some Android devices, `mix-blend-mode: overlay` with WebGL canvases produces black rectangles or inverted colors.
- When `premultipliedAlpha: true` (set in the codebase), the alpha channel interacts with blend modes in non-intuitive ways. A canvas with premultiplied alpha composited with `screen` blend mode can produce washed-out or overly bright results.
- Safari on iOS occasionally flickers when multiple overlapping canvases with blend modes are animated simultaneously.
- Some Intel integrated GPUs on Windows render `mix-blend-mode` in software, causing severe performance drops.

**Fix**:
1. Test the three specific blend mode combinations on: iOS Safari, Android Chrome, Samsung Internet, Firefox desktop, and Chrome with Intel integrated graphics. Document known-bad configurations.
2. Provide a fallback rendering mode: single-canvas with no blend modes. Detect the need for fallback by rendering a test pattern to two small (16x16) canvases with blend modes and reading back the pixel values to verify correctness. If the readback does not match expected values, switch to single-canvas mode.
3. For the cross-fade during system transitions, prefer opacity animation on a single canvas rather than two canvases with blend modes. Render the outgoing frame to an offscreen canvas, then crossfade using `globalAlpha` on a 2D compositing canvas, or simply animate the WebGL canvas opacity with a CSS transition.

#### 1.16 requestAnimationFrame and Page Visibility

**Issue**: When the page is hidden (tab switched, phone locked), `requestAnimationFrame` stops firing. The plan does not describe what happens to stateful accumulators (rotation angles, hue drift, autonomous choreography position) when the page returns. If rotation angles were being accumulated by adding velocity * deltaTime, and deltaTime is suddenly 30 seconds (user switched tabs and came back), the rotation will jump by 30 * velocity radians -- producing a violent spin.

**Fix**: Listen for `document.visibilitychange`. When the page becomes hidden, record the timestamp. When it becomes visible again, calculate the elapsed time but cap the effective deltaTime for parameter updates at 100ms. For the autonomous choreography, jump to the correct scene position based on wall-clock time (modulo 120 seconds) rather than accumulating. For rotation angles, apply modulo 2*PI to prevent floating-point drift. For audio, discard the first 5 frames of FFT data after resuming (the buffers will contain stale data).

---

### Part 2: Performance Budget

#### 2.1 Fragment Shader GPU Cost

The Faceted fragment shader (the simplest of the three) performs the following per pixel:

| Operation | Approximate Cost (ALU ops) |
|-----------|---------------------------|
| UV normalization + 4D point creation | ~10 |
| 6 rotation matrices (each: 2 trig + 8 mul + 4 add) | ~6 x 16 = 96 |
| 6 matrix-vector multiplies (each: 16 mul + 12 add) | ~6 x 28 = 168 |
| 4D-to-3D projection (1 div + 3 mul) | ~5 |
| Core warp (Hypersphere or Hypertetra): trig, dot products, 6 more rotations | ~180 (when active, geometries 8-23) |
| Geometry function (1 of 8): fract, abs, min, sin/cos, atan | ~20-40 depending on type |
| Chaos noise (3 sin/cos) | ~12 |
| HSL-to-RGB color calculation (3 sin) | ~15 |
| Audio modulation, intensity, clamping | ~10 |
| **Total (Base geometry 0-7)** | **~340 ALU ops/pixel** |
| **Total (Warped geometry 8-23)** | **~520 ALU ops/pixel** |

The Quantum shader is heavier due to more complex lattice functions (vertex detection, edge rendering, face highlighting, pow() calls). Estimate: ~600-800 ALU ops/pixel.

The Holographic shader adds 5-layer processing with per-layer color palettes and RGB separation. If rendering all 5 layers in a single pass: ~900-1200 ALU ops/pixel. If each layer is a separate pass on a separate canvas, it is 5 x ~600 = ~3000 ALU ops/pixel total (but spread across 5 draw calls).

**At 1080p (1920x1080 = 2,073,600 pixels)**:

| System | Ops/pixel | Total ops/frame | At 60fps |
|--------|-----------|----------------|----------|
| Faceted (warped) | ~520 | ~1.08 billion | ~64.5 billion ops/s |
| Quantum | ~700 | ~1.45 billion | ~87.2 billion ops/s |
| Holographic (single pass) | ~1000 | ~2.07 billion | ~124.4 billion ops/s |

**iPhone 12 GPU (Apple A14, 4-core GPU)**: ~1.4 TFLOPS. At 60fps, that is ~23.3 GFLOPS per frame. The Faceted shader needs ~1.08 GFLOPS per frame, which is ~4.6% of the budget. The Quantum shader is ~6.2%. Even Holographic is ~8.9%. **This is comfortably feasible**, even considering that real-world GPU utilization is 50-70% of theoretical peak due to memory bandwidth, cache misses, and pipeline bubbles.

**However**: The plan describes rendering on up to 3 canvases simultaneously. If all three have active shaders rendering at 1080p, the cost triples. The cross-fade period is the danger zone. Recommendation: during cross-fades, render the outgoing system at half resolution (540p) to keep total GPU load under 20% of budget.

**Pixel 6 (Mali-G78 GPU)**: ~0.85 TFLOPS. Tighter budget. The Holographic system at full resolution uses ~14.6% of per-frame budget. Still feasible, but leaves less headroom for the browser compositor, Android system UI, and OS services. Monitor frame drops on mid-range Android specifically.

#### 2.2 Audio Processing CPU Cost

| Component | Cost per frame (at 60fps) |
|-----------|--------------------------|
| `getByteFrequencyData()` (1024 bins) | ~0.02ms (browser-optimized native call) |
| 8-band decomposition (mean of bin ranges) | ~0.01ms (simple arithmetic, ~930 additions + 8 divisions) |
| EMA smoothing (8 bands x 2 smoothing values) | <0.01ms |
| Spectral flux (1024 subtractions + 1024 max + 1 sum) | ~0.01ms |
| Spectral centroid (1024 mul + 1024 add + 1 div) | ~0.01ms |
| Spectral spread (1024 mul + sqrt) | ~0.01ms |
| Onset detection (1 comparison) | <0.001ms |
| Pitch tracking (autocorrelation: N log N for FFT-based, or ~N^2/4 for naive) | ~0.5ms if naive with 2048 samples, ~0.05ms if FFT-based |
| **Total audio processing** | **~0.1-0.6ms per frame** |

At 16.67ms per frame, audio processing is 0.6-3.6% of the frame budget. **Trivially affordable.** The one risk is naive autocorrelation for pitch tracking. Use FFT-based autocorrelation (compute FFT, square magnitudes, inverse FFT) or limit the autocorrelation to the 200-2000Hz range (bins 9-93 at 44.1kHz/2048) to reduce computation.

#### 2.3 Mapping Engine CPU Cost

42 continuous mappings + 12 cross-modulations per frame:

| Component | Cost per frame |
|-----------|---------------|
| 42 mapping evaluations (each: 1 easing function + 1 multiply + 1 smoothing EMA) | ~42 x ~5 ops = ~210 ops |
| 12 cross-modulation multipliers | ~12 x ~3 ops = ~36 ops |
| 17 parameter smoothing passes | ~17 x ~3 ops = ~51 ops |
| 6 rotation angle accumulations (add + modulo) | ~12 ops |
| 18 threshold checks | ~18 comparisons |
| **Total** | **~330 arithmetic operations** |

This is approximately **0.001ms** on any modern CPU. **Completely trivial.** The mapping engine could run at 1000fps without concern. The plan's worry about "42 continuous mappings + 12 cross-modulations" being expensive is unfounded -- this is about 1 microsecond of work.

#### 2.4 Canvas Blend-Mode Compositing Cost

CSS `mix-blend-mode` compositing of overlaid canvases is performed by the browser's compositor, which runs on the GPU. The compositing cost depends on the blend mode:

| Blend Mode | GPU Cost |
|-----------|----------|
| `normal` | 1 texture sample + alpha blend (~4 ops/pixel) |
| `screen` | 1 texture sample + screen formula: `1 - (1-a)*(1-b)` (~8 ops/pixel) |
| `overlay` | 1 texture sample + conditional formula (~12 ops/pixel) |

At 1080p with 3 layers: ~2M pixels x ~24 ops = ~48M ops. This is **negligible** compared to the fragment shader cost. The compositing itself is not the performance risk -- the risk is that some browsers fall back to CPU compositing for `mix-blend-mode` on canvases, in which case the cost jumps to ~2-5ms per frame (CPU pixel processing of 2M pixels x 3 layers). This is the scenario to detect and work around (see Part 1, item 1.15).

#### 2.5 Total Frame Budget Summary

| Component | Time (ms) | % of 16.67ms budget |
|-----------|-----------|---------------------|
| Audio processing | 0.1-0.6 | 0.6-3.6% |
| Mapping engine | <0.01 | <0.1% |
| Sensor reading + smoothing | <0.05 | <0.3% |
| Uniform upload to GPU | ~0.1 | 0.6% |
| Fragment shader (Quantum, warped) | 2-4 (GPU) | 12-24% (GPU) |
| Compositor blend modes | 0.5-1 (GPU) | 3-6% (GPU) |
| JS overhead (GC, event loop) | 1-2 | 6-12% |
| **Total estimated** | **4-8ms** | **24-48%** |

**Verdict**: The experience is feasible at 60fps on target devices with comfortable headroom. The primary risk is not per-frame cost but sustained thermal throttling on mobile -- after 5-10 minutes of continuous GPU load at 20-40%, mobile devices will throttle. Add a thermal management strategy: if frame time degrades by >30% from initial measurement, reduce gridDensity by 20% and consider rendering every other frame for the non-active canvases.

---

### Part 3: Enhancements That Multiply Impact

#### 3.1 Visual Coherence: From Mappings to Aesthetic Theory

The plan defines 42 input-to-parameter mappings, but there is no theory of WHY these mappings produce beauty rather than chaos. Without aesthetic constraints, the system is a random number generator with extra steps. Here is a framework:

**The Principle of Sympathetic Resonance**: Mappings feel "right" when the perceptual quality of the input matches the perceptual quality of the output. Bass is heavy, slow, and spatial -- it should map to large-scale, slow parameters (morphFactor, dimension, ZW rotation). Treble is bright, quick, and sharp -- it should map to small-scale, fast parameters (gridDensity, hue, intensity flicker). The current mapping table mostly follows this principle but violates it in a few places:
- Upper-mid energy maps to `chaos`. But upper-mids (2-6kHz) are the speech intelligibility range -- they carry structure, not chaos. Consider mapping spectral *flatness* (not energy) to chaos instead. A flat spectrum = noise = chaos. A peaked spectrum = tone = order.
- Spectral centroid maps to hue across the full 0-360 range. This produces jarring color jumps when the spectral content changes quickly (e.g., between vocal phrases and instrumental sections). Constrain the centroid-to-hue mapping to a 60-degree range centered on the time-of-day base hue. This keeps color coherent while still being audio-responsive.

**The Rule of Dominant Voice**: At any moment, one input source should be the "lead" and others should be "accompaniment." If audio is loud and motion is still, audio should own 80% of the parameter influence and motion should be subtle modulation. If the user is actively tilting the device but there is no audio, motion should dominate. Implement this as a dynamic gain system:
```
audioInfluence = clamp(audioRMS / (audioRMS + motionMagnitude + 0.01), 0.1, 0.9)
motionInfluence = 1.0 - audioInfluence
```
Apply these as multipliers to their respective mapping groups. This prevents the "everything is driving everything" problem where all inputs compete equally and the result is visual mud.

**Color Palette Locking**: Instead of letting hue roam freely across 360 degrees, lock the experience to one of the 22 color presets' hue neighborhoods at any given time. Audio and motion can shift hue within a +/-30 degree range of the active preset's base hue. The only events that should trigger a full palette change are: system switch, orientation change, or the autonomous choreography. This ensures that at any given moment, the colors are harmonious rather than random.

**Geometry Transition Whitelist**: Not all geometry-to-geometry transitions look good. Transitioning from Torus (3) to Fractal (5) can produce visual garbage at intermediate morphFactor values. Create a transition affinity matrix (8x8) that rates how aesthetically pleasing each transition is. Favor high-affinity transitions and use rapid cuts (100ms) for low-affinity ones instead of slow morphs. Example high-affinity pairs: Sphere<->Torus, Hypercube<->Crystal, Wave<->Fractal. Example low-affinity pairs: Klein Bottle<->Tetrahedron.

#### 3.2 Narrative Arc: Emotional Choreography

The current 8-scene autonomous sequence has an energy arc but not an emotional one. Energy goes: low -> medium -> high -> peak -> shift -> storm -> intense -> calm. This is a hill shape. Here is how to give it EMOTIONAL resonance:

**Reframe as a 5-Act Structure**:

| Act | Scenes | Emotion | Musical Analogy |
|-----|--------|---------|-----------------|
| I: Awakening | 1 | Wonder, curiosity | Piano solo, pp |
| II: Discovery | 2-3 | Excitement, energy | Strings enter, crescendo |
| III: Transcendence | 4-5 | Awe, surrender | Full orchestra, fff |
| IV: Turbulence | 6-7 | Tension, disorientation | Dissonance, irregular rhythm |
| V: Resolution | 8 | Peace, integration | Return to piano, pp, but richer |

**Key insight for Scene 8 (Resolution)**: Do NOT return to exactly Scene 1's values. The return should be to values that are SIMILAR but subtly different -- slightly warmer hue (+15 degrees), slightly higher base dimension (3.3 instead of 3.2), slightly slower rotation but in a different plane combination. This creates the feeling of "we have been changed by the journey" rather than "we are back to the beginning." The loop seam should be felt as a threshold crossing, not a reset.

**Add a Breath Beat**: The choreography lacks rhythmic structure. Add a global "breath" oscillation that persists across all scenes: a sine wave with a 6-second period that gently modulates intensity by +/-0.05 and speed by +/-0.1. This creates an organic, living quality -- like the visualization is breathing. During Act III (Transcendence), shorten the breath to 3 seconds (excitement). During Act V (Resolution), lengthen it to 10 seconds (deep calm). This single addition will make the autonomous sequence feel alive rather than mechanical.

**Punctuation Moments**: Add 3 "punctuation" micro-events at the act boundaries:
- End of Act I (scene 1->2 transition): A single, slow "inhale" -- dimension rises from 3.2 to 3.8 over 2 seconds with `easeIn`, then the system switch happens at the peak.
- End of Act III (scene 5->6 transition): A "shatter" -- all rotations receive a random impulse, chaos spikes to 0.7 for 300ms, and intensity flashes to 1.0 for 100ms. This is the "storm arrives" moment.
- End of Act IV (scene 7->8 transition): A "hush" -- speed drops to 0.1 for 1 second with `expoOut`, then gradually rises to Scene 8 values. The silence before the resolution.

#### 3.3 Memory: Adaptive User Modeling

This is the enhancement that transforms the experience from "interactive art" to "intelligent art."

**Behavior Accumulator**: Maintain a running profile of user behavior patterns over the session:

```javascript
const userProfile = {
    // Spatial preference: where does the mouse/touch spend the most time?
    spatialHeatmap: new Float32Array(16), // 4x4 grid, accumulated dwell time

    // Temporal preference: does the user interact in bursts or continuously?
    interactionCadence: 0, // 0 = continuous, 1 = bursty

    // Audio response: which frequency bands correlate with user interaction?
    audioInteractionCorrelation: new Float32Array(8), // per-band correlation

    // Preferred system: track time spent in each system after manual switches
    systemPreference: [0, 0, 0], // Faceted, Quantum, Holographic

    // Preferred geometry range: which geometries does the user return to?
    geometryAffinity: new Float32Array(24),

    // Interaction intensity: does the user prefer subtle or dramatic?
    dramaticPreference: 0.5, // 0 = subtle, 1 = dramatic
};
```

**How to use it**:
1. **Spatial bias**: If the user consistently hovers in the top-right, bias the geometry's visual center of mass toward the top-right by offsetting the UV coordinates in the shader by a small amount (0.05-0.15 units, smoothed over 30 seconds). The visualization gravitates toward the user's attention.
2. **Audio-interaction correlation**: If the user tends to interact (touch/mouse activity increases) during bass-heavy moments, gradually increase the bass mapping gains by 20-40% over 5 minutes. The system learns to emphasize the audio features the user responds to.
3. **Dramatic preference**: If the user frequently triggers shake (dramatic) or avoids the freeze mode (prefers dynamism), gradually increase the chaos floor from 0 to 0.1 and the speed floor from 0.1 to 0.5. If the user prefers freeze and slow mouse movements, decrease the chaos maximum from 1.0 to 0.5 and increase smoothing constants by 30%.
4. **System preference**: During autonomous mode, weight scene system selection toward the user's preferred system. If they spend 70% of manual time in Quantum, the autonomous sequence should use Quantum for 4 of 8 scenes instead of the default 2-3.

**Decay**: All profile values decay toward neutral with a 10-minute half-life. If the user changes behavior, the system adapts within 5-10 minutes. This prevents the profile from getting "stuck."

**Privacy**: All data stays in JavaScript variables (session-scoped). Nothing is persisted to localStorage or sent to any server.

#### 3.4 Social/Shared State: Synchronized Visuals

**Lightweight approach (no server required)**:

Two users can share a synchronized experience by sharing a URL containing:
- A `seed` parameter (64-bit integer) that determines all pseudo-random choices (autonomous choreography variations, noise seeds, initial hue offset).
- A `t0` parameter (Unix timestamp in ms) that establishes the shared time origin.

```
https://example.com/synesthesia?seed=8472619305&t0=1708012800000
```

Both devices use `performance.now() - (Date.now() - t0)` to compute a shared time reference. The autonomous choreography and all time-based parameter calculations use this shared time instead of local time. Since the choreography is deterministic given a time value, both devices will show identical visuals during autonomous mode.

During reactive mode, visuals diverge (each user's sensors are different), but the BASE state (time-of-day palette, autonomous seed) remains shared. When both users go idle, they converge back to identical autonomous visuals within 3 seconds.

**Enhanced approach (WebRTC Data Channel)**:

For true real-time sync, use a WebRTC peer connection with a data channel:
1. User A generates an offer, serializes it as a compact URL or QR code.
2. User B scans/clicks the link, generates an answer.
3. Both connect over a data channel.
4. Every 100ms, each peer sends a compressed state packet: 17 parameter floats (68 bytes) + system ID (1 byte) + geometry (1 byte) = 70 bytes per update. At 10 updates/second, this is 700 bytes/second -- trivial bandwidth.
5. Each device renders a weighted blend: 70% own sensors, 30% peer state. The result is visuals that are recognizably similar but not identical -- like two dancers performing the same choreography with personal style.

**Signaling**: Use a free TURN/STUN service (e.g., Google's public STUN servers) and exchange signaling data via a simple copy-paste or QR code. No backend server needed.

#### 3.5 Export Moment: Capturable Artifacts

The user should be able to "freeze" what they are seeing and take it with them. Three export formats:

**1. Screenshot (PNG/JPEG)**: Capture the current composite of all canvases.
- Implementation: Create a temporary canvas at 2x resolution. Draw each visible WebGL canvas onto it using `drawImage()` in the correct z-order with the correct `globalCompositeOperation` matching the CSS blend modes. Call `toDataURL('image/png')`. Trigger a download or share via `navigator.share()` on mobile.
- Timing: Capture on a UI button press OR automatically capture when the user double-taps (the "freeze" gesture) -- save the frozen frame as a bonus.
- Add a subtle watermark: "VIB3+ SYNESTHESIA" in 8pt transparent text in the bottom-right corner.

**2. Animated Loop (GIF/WebM)**: Capture a 3-6 second loop.
- Implementation: Use `MediaRecorder` API on a canvas captured via `captureStream(30)`. Record for 4 seconds, stop, and provide the blob as a download. WebM is natively supported in Chrome; for broader compatibility, use a JS-based GIF encoder (e.g., gif.js) but warn that GIF encoding is slow (5-15 seconds for a 4-second loop).
- Better alternative: Record a 4-second WebM and offer it as the primary format. On iOS where MediaRecorder may not support WebM, fall back to a series of PNG frames assembled client-side.

**3. Parameter Snapshot (JSON)**: Export the exact state as a shareable JSON blob.
- Contains: all 17 parameters, active system, geometry index, all 6 rotation angles, color preset name, timestamp, and the seed value.
- This can be shared as a URL query parameter (base64-encoded) that, when opened, initializes the experience to that exact state.
- This is the most faithful export and enables "preset sharing" between users.

**4. Live Wallpaper / Screensaver Embed (HTML snippet)**:
- Generate a minimal self-contained HTML file (~50KB) that contains just the active shader, the frozen parameter state, and a gentle autonomous drift. The user gets a file they can set as a browser new-tab page, an Electron screensaver, or embed in an iframe.

#### 3.6 Accessibility

**Deaf Users**:
- The experience should be fully functional without audio. The "no microphone" fallback (Part 1, item 1.3) handles this technically, but the UX should be intentional, not accidental.
- Offer a "Visual Only" mode toggle that disables the microphone permission prompt entirely and replaces all audio-driven mappings with enhanced motion and touch mappings. Double the sensitivity of tilt-to-rotation. Add touch-pressure (where available via `Touch.force`) as a substitute for audio intensity.
- For the autonomous choreography, audio-absent mode should increase the emphasis on geometric and color transitions to compensate for the missing audio-reactive dimension.

**Blind or Low-Vision Users**:
- This is primarily a visual experience, but there is value in the audio and haptic dimensions.
- Offer an "Audio Description" mode where the SpeechSynthesis API narrates state changes: "Switching to Quantum system. Geometry: Hypersphere Fractal. Colors shifting to Cyberpunk Neon." Narrate only major transitions (system switch, geometry change, scene change in autonomous mode), not continuous parameter updates.
- Amplify the haptic feedback layer: instead of subtle 15ms pulses, use longer patterns (50-100ms) that encode parameter state. Different vibration rhythms for different systems. Rotation boundary crossings use distinct patterns (short-short for 3D planes, long for 4D planes).
- Use screen reader ARIA live regions to announce system and scene transitions.

**Reduced Motion (prefers-reduced-motion)**:
- Check `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- If active: set all rotation velocities to 0 (no autorotation, only user-driven). Reduce `speed` maximum from 3.0 to 0.5. Disable the shake explosion (Surprise 2.3) entirely. Disable the orientation change flourish (Surprise 2.10). Slow all transitions from their specified duration to 3x the duration. Disable the geometry flicker micro-keyframes in the choreography.
- The experience becomes a gentle, slowly-evolving color field that responds to touch and audio but does not spin, flash, or shake.

**Photosensitivity / Epilepsy**:
- The onset flash (Surprise 2.13: intensity spikes by +0.3 with 150ms decay) and the orientation change flash (intensity spikes to 1.0 for 100ms) could trigger photosensitive epilepsy if occurring at 3-30Hz.
- Add a photosensitivity guard: track the number of intensity spikes > 0.7 in any 1-second window. If more than 3 spikes occur, suppress further spikes for 2 seconds and reduce the intensity ceiling to 0.6.
- Honor `prefers-reduced-motion` as a signal to disable ALL flash effects.
- On first load, display a brief (3 second, dismissable) warning: "This experience contains flashing lights and motion. Tap to adjust." Link to a settings panel with a "reduce flashing" toggle.

**Motor Impairment**:
- The multi-touch gesture system (Section 2.8) assumes manual dexterity. Ensure that every gesture has a keyboard equivalent and that the keyboard controls are documented in an accessible help panel.
- Support switch access: a single-button input mode where each tap cycles through a predetermined sequence of system states. This is minimal but ensures the experience is not completely locked out for switch users.

#### 3.7 Easter Eggs: Hidden Behaviors That Reward Exploration

**1. The Konami Code**: Up-Up-Down-Down-Left-Right-Left-Right-B-A (keyboard) or the equivalent swipe pattern on touch. Activates a hidden 9th scene in the autonomous choreography: "Polychora Preview" -- uses the Hypertetrahedron + Crystal geometry (index 23) with all 6 rotation planes at maximum velocity (0.5 rad/s), chaos 0.0, morphFactor 2.0, dimension 4.5, and the Holographic Rainbow preset with 120-degree hue shift cycling. This runs for 10 seconds, then returns to normal operation. It is a glimpse at the eventual Polychora system that the CLAUDE.md marks as "TBD placeholder."

**2. Midnight Activation**: If the experience is running at exactly midnight (00:00:00 local time, checked within a 2-second window), trigger a unique "New Day" event: all parameters simultaneously lerp to zero (total darkness) over 3 seconds, hold for 2 seconds of pure black, then bloom back to the Deep Night palette over 5 seconds with the dimension slowly climbing from 3.0 to 4.5. A once-per-day event that rewards the persistent user.

**3. The Silence Reward**: If the user achieves complete silence (RMS < -70dB) for 60 continuous seconds with the microphone active (not just absent), activate "Void Mode": the background color inverts (dark becomes light, light becomes dark), geometry switches to Klein Bottle (index 4), all rotations stop, and the only animation is a very slow (0.05 Hz) pulsing of the dimension parameter between 3.0 and 4.5. This creates a meditative, breathing space that feels like a reward for stillness. Any sound above -50dB gently transitions back to normal over 5 seconds.

**4. Harmonic Resonance**: If the microphone detects a sustained pure tone (spectral energy concentrated in a single frequency band for > 3 seconds -- someone humming or playing a sustained note), match the geometry to the note: C = Tetrahedron, D = Hypercube, E = Sphere, F = Torus, G = Klein Bottle, A = Fractal, B = Wave. Lock the geometry to that note's shape and morph the hue to match the frequency (lower = warmer, higher = cooler). The visualization becomes a visual instrument. Release when the tone stops.

**5. Golden Ratio Rotation**: If the user manually sets any rotation plane to exactly 2.399 radians (the golden angle, 137.508 degrees) by dragging precisely, all other rotation planes smoothly align to golden ratio multiples of each other (2.399, 4.798 mod 2pi = 1.215, 1.215*1.618 mod 2pi = ...). This produces the most aesthetically pleasing, non-repeating rotation pattern possible. A subtle golden spiral overlay flashes for 500ms to signal the easter egg activation.

**6. Browser Console Message**: When the developer console is opened (detectable via `window.outerHeight - window.innerHeight > 200` heuristic or a `debugger` timing check), display a message in the console using styled `console.log`:
```
%c VIB3+ SYNESTHESIA %c Try typing: vib3.secret('tesseract')
```
If the user calls `window.vib3.secret('tesseract')` from the console, all geometry indices cycle through 0-23 in rapid succession (50ms each, total 1.2 seconds) while all rotation planes spin at 3.0 rad/s. A developer treat.

**7. Device Flip**: If the device is held upside down (beta > 150 degrees or beta < -150 degrees) for more than 3 seconds, mirror the shader output horizontally and vertically (multiply UV by -1), invert the hue (hue += 180 degrees), and reverse all rotation directions. The world is literally upside down. Flipping back restores normal operation with a 1-second elastic transition.

---

**End of Red Team Report + Enhancements.**
