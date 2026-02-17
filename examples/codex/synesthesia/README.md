# Synesthesia — VIB3+ Flagship Example

This is the reference implementation of VIB3+. Not a demo — a working creative instrument. Two visualization engines running side-by-side, responding to audio, touch, and time, coordinated through a density seesaw where one engine's complexity is always the other's simplicity.

Open `index.html` in a browser. If you have a microphone, allow access. If you don't, synthetic audio keeps everything alive. Tap the screen. Hover the floating panel in the bottom-right. Press 1, 2, 3 to switch systems. Scroll to open a portal into the fourth dimension.

**This is what VIB3+ looks like when everything is connected.** Other codex entries will make different choices — fewer engines, different inputs, different aesthetics. But they all build on the same vocabulary shown here.

---

## How It's Built

```
synesthesia/
├── index.html         # ~40 lines. Loads CSS and JS. That's it.
├── synesthesia.css    # Layout + CSS variable bridge + state classes
├── synesthesia.js     # The orchestrator. Imports 6 SDK modules.
└── README.md          # You're reading it.
```

The HTML is intentionally thin. The CSS reacts to VIB3+ state through custom properties that update every frame. The JS does all the thinking — it imports the real SDK modules, creates two engine instances, wires up audio analysis, and runs a coordination loop.

**Why not a single file?** Because the point is showing how VIB3+ integrates into a real application. In production, your CSS needs to know about VIB3+ state (for borders, shadows, text color). Your HTML structure defines where the canvases go. Your JS orchestrates the creative logic. Separating them shows the integration pattern.

---

## The Two Engines

The primary engine fills the viewport. The secondary floats in a panel at the bottom-right. They're running different visualization systems (Faceted and Quantum by default) and they're *coordinated* — when one gets denser, the other gets sparser.

This coordination is the **Inverse Density Seesaw**. The total visual density across both engines stays roughly constant (~70). So when audio pushes the primary's `gridDensity` up to 55, the secondary drops to 15. It looks like one is feeding on the other's energy.

### Try changing the coordination:

- **Flip the seesaw** — In `pushSecondaryState()`, change `70 - s.gridDensity` to `s.gridDensity * 0.5`. Now both engines breathe together instead of against each other. Totally different feel.
- **Add a third engine** — Create another `VIB3Engine` with `{ system: 'holographic' }`, initialize it into a new container div, and give it its own coordination rule. Maybe it tracks the *difference* between primary and secondary density.
- **Break energy conservation** — Remove the inverse intensity line (`1.0 - s.intensity + 0.3`). Now both engines can be at full blast simultaneously. It's louder, less elegant, but sometimes that's what you want.
- **Swap the complement** — The secondary hue is `(primary + 180) % 360` — a perfect complement. Try `(primary + 120) % 360` for triadic color, or `(primary + 30) % 360` for analogous warmth. Each changes the emotional temperature.

---

## The CSS Variable Bridge

Every single frame, `updateCSSBridge()` pushes six values from VIB3+ state into CSS custom properties:

```css
--vib3-hue        /* 0-360, current dominant color */
--vib3-intensity   /* 0-1, overall brightness */
--vib3-density     /* 4-100, pattern complexity */
--vib3-speed       /* 0.1-3, animation speed */
--vib3-chaos       /* 0-1, randomness */
--vib3-saturation  /* 0-1, color vividity */
```

The CSS file uses these to color the HUD text, the audio meter bars, the secondary panel's border. But this is just scratching the surface.

### Things you can do with the CSS bridge:

- **Breathing backgrounds** — Add `background: hsl(var(--vib3-hue), 20%, calc(5% + var(--vib3-intensity) * 10%));` to `body`. The page background now subtly pulses with the music.
- **Text that reacts** — Put a heading on the page with `color: hsl(var(--vib3-hue), 60%, 70%); letter-spacing: calc(0.05em + var(--vib3-chaos) * 0.2em);`. The text spreads apart as chaos rises.
- **Dynamic blur** — Add `backdrop-filter: blur(calc(var(--vib3-chaos) * 20px));` to an overlay. When the visualization is calm, the overlay is clear. When chaos spikes, everything behind it smears.
- **Border animation** — The secondary panel already uses `border-color: hsla(var(--vib3-hue), 50%, 40%, 0.6)`. Try adding `border-width: calc(1px + var(--vib3-intensity) * 3px);` — the border thickens as intensity rises.
- **Conditional visibility** — CSS can't do `if`, but you can fake it: `opacity: max(0, calc(var(--vib3-chaos) - 0.3) * 5);` shows an element only when chaos exceeds 0.3.
- **Drive a progress bar, a navigation highlight, a card shadow** — anything CSS can style, VIB3+ can drive.

This is why the bridge matters. VIB3+ isn't just a canvas effect — it's a state machine that can animate your entire UI.

---

## Audio Reactivity

The audio pipeline processes 8 frequency bands from either a real microphone or synthetic sine waves:

| Band | Frequency Range | What It Drives | Why |
|------|----------------|----------------|-----|
| 0 (Sub-bass) | 20-60 Hz | `morphFactor` | Deep bass = heavy geometry distortion |
| 1 (Bass) | 60-200 Hz | `morphFactor` + ZW rotation | Kick drums push 4D rotation |
| 2 (Low-mid) | 200-500 Hz | `gridDensity` + YW rotation | Body of the sound = visual complexity |
| 3 (Mid) | 500-2 kHz | `speed` + XY rotation | Melody = movement speed |
| 4 (Upper-mid) | 2-6 kHz | `chaos` + XW rotation | Harmonics = visual turbulence |
| 5 (Presence) | 6-12 kHz | `gridDensity` (secondary) | Vocal presence adds texture |
| 6 (Brilliance) | 12-24 kHz | `saturation` + `intensity` | Bright audio = vivid color |
| 7 (Air) | 24+ kHz | `dimension` | Highest frequencies open 4D depth |

### Experiment with the mappings:

- **Swap bass and treble** — Make sub-bass drive `dimension` and air drive `morphFactor`. Now bass notes open portals and high frequencies cause distortion. Very different spatial feel.
- **Add a threshold** — Change `lerp(0, 0.5, b[4])` to `b[4] > 0.3 ? lerp(0, 0.5, b[4]) : 0`. Now chaos only kicks in when upper-mid is loud enough. Cleaner at low volumes, explosive at high.
- **Make one band rule everything** — Set all parameters to track `b[1]` (bass) with different scaling. Now a kick drum controls the entire visual universe. Brutal but effective for EDM visuals.
- **Remove audio entirely** — Delete `applyContinuousMappings()` from the render loop. Now only ambient drift and events drive the visuals. It becomes a meditative experience — the visualization breathes on its own heartbeat cycle.
- **Feed in different data** — Replace the audio bands with any 8 numbers between 0 and 1. Stock prices. Weather data. Heart rate. Typing speed. The mapping table works with *any* normalized input.

---

## Named Motions

Each user interaction triggers a choreographed response — not a single parameter change, but a *motion* with attack timing, sustain, and release:

### Burst (tap/click)
Chaos and speed spike instantly (150ms), then EMA-decay back to baseline over ~2 seconds. The 4D ZW rotation also gets a velocity kick. It's the most satisfying interaction — you feel the impact because the attack is 13x faster than the release.

**Modify it**: Change the burst from chaos+speed to `dimension: 3.0` (a 4D slam) or `saturation: 0` (a color drain that recovers). Each creates a different emotional beat.

### Crystallize (long-press)
Hold for 800ms and the visualization freezes into a crystal — chaos drops to zero, speed almost stops, saturation drains, but intensity rises to compensate. It takes 3 full seconds to complete. Release and color floods back.

**Modify it**: Try crystallizing into a *different* state — high chaos instead of zero, creating a "frozen storm." Or make it crystallize the secondary engine too, but with a 500ms delay (cascade effect).

### Dimensional Crossfade (system switch)
When you press 1, 2, or 3, the current system doesn't just snap to the new one. It *drains* first (intensity and speed fade to near-zero over 400ms), then the system switches, then the new system *floods in* with its personality parameters over 600ms. The CSS adds an opacity pulse during the transition.

**Modify it**: Make the crossfade slower (2000ms drain, 3000ms flood) for a more dramatic scene change. Or add a geometry randomize during the switch — `engine.setParameter('geometry', Math.floor(Math.random() * 24))` in the drain callback. Now every system switch is also a surprise.

### Approach/Retreat (hover secondary panel)
Hover the floating panel and it scales up, sharpens, and its visualization simplifies (density drops from 60 to 8). Meanwhile, the primary engine does the opposite — gets denser and dimmer. Leave the panel and everything reverses, but *slower* (800ms vs 400ms).

**Modify it**: Wire Approach/Retreat to scroll position instead of hover. As you scroll down a page, the secondary approaches. Scroll back up, it retreats. Now you have a scroll-reactive visualization panel for a real website.

---

## Autonomous Choreography

After 30 seconds of no input, the `ChoreographyPlayer` kicks in with an 8-scene loop that cycles through systems, geometries, and color presets over 120 seconds. Any input breaks out of autonomous mode immediately.

### Customize the choreography:

The `CHOREOGRAPHY_SPEC` constant near the top of `synesthesia.js` defines all 8 scenes. Each scene has:

```javascript
{
  system: 'faceted',          // Which rendering system
  geometry: 5,                 // Which of the 24 geometry variants
  transition_in: { duration: 800, easing: 'easeOut' },
  tracks: { morphFactor: [{ time: 0, value: 0.5 }, { time: 15000, value: 1.5 }] },
  color_preset: 'Neon Pulse',
  post_processing: ['bloom']
}
```

**Ideas to try**:
- **Shorter scenes** — Change 15s to 5s per scene. The autonomous mode becomes frantic — 8 system+geometry changes in 40 seconds.
- **Longer, driftier** — 60s per scene (480s total). Each scene has time to develop. Add more track keyframes so parameters evolve within each scene.
- **Audio-reactive choreography** — Keep `applyContinuousMappings()` running during autonomous mode (it already does). The choreography sets the *structure* while audio sets the *texture*. Try amplifying the audio influence: `lerp(0.3, 2.2, b[3])` → `lerp(0.3, 3.0, b[3])`.
- **Single-system journey** — Set all 8 scenes to the same system but different geometries. Now the choreography is a tour through 8 different 4D shapes in one rendering style.
- **Build your own** — Add a 9th scene. Try geometry `20` (Hyper-T Sphere) with `'Sunset Warm'` preset and a chaos track that builds from 0 to 0.4. Does it fit the arc?

---

## Per-System Personality

This is one of the most important patterns in VIB3+. Each visualization system has a *character*:

**Faceted** is clean. Low chaos (0-0.15), moderate density (15-35), slow speed (0.3-0.8). Think Swiss design, geometric precision, tiled kaleidoscopes. It looks best when you let the geometry speak — don't push chaos above 0.2 or it fights the aesthetic.

**Quantum** is dense. Higher chaos (0.1-0.4), more density (25-60), faster speed (0.5-1.5). Think particle accelerators, crystalline lattices, mathematical complexity. It can handle — and rewards — aggressive audio modulation.

**Holographic** is atmospheric. Moderate everything, but wider dimension range (3.4-4.2). Think iridescent soap bubbles, aurora borealis, layered glass. The 5-layer canvas stack gives it depth that the others don't have. Slow movements reveal the layering.

### Experiment with personality:

- **Crank Faceted's chaos to 0.5** — It breaks the clean aesthetic but creates glitchy, generative art. Sometimes breaking the rules is the point.
- **Drop Quantum's speed to 0.1** — The dense lattice barely moves. It becomes a frozen crystalline sculpture. Beautiful for hero backgrounds.
- **Push Holographic's dimension to 4.5** — Maximum 4D projection distance. The geometry flattens and layers start to separate visually. Eerie.
- **Create your own personality** — Add a `dark` key to `PERSONALITY` with `chaos: [0.3, 0.8], intensity: [0.1, 0.3], saturation: [0.0, 0.2]`. Dark, desaturated, turbulent. Use it for horror game UI.

---

## The Three Parameter Modes

Everything in synesthesia runs three systems simultaneously:

**Mode 1 (Continuous Mapping)** — Every frame, audio bands are read and mapped to visual parameters through EMA smoothing. This isn't "audio triggers a change" — it's "audio *is* the parameter." When bass drops, morphFactor drops. When it rises, morphFactor rises. The mapping is *continuous*, not event-based.

The tau values (time constants) control how fast each parameter responds. Speed has tau=0.08s (almost instant response to audio), while hue has tau=0.25s (slow, smooth color shifts). This means a drum hit instantly changes speed but slowly shifts color — the visual equivalent of timbre vs pitch.

**Mode 2 (Event Choreography)** — Discrete moments: a tap, a system switch, a beat detection, a long-press. Each triggers a specific motion with its own timing envelope. These *interrupt* the continuous mappings briefly, then EMA smoothing brings everything back to the audio-driven baseline.

**Mode 3 (Ambient Drift)** — When nothing is happening (no audio, no input), parameters don't freeze — they breathe. `morphFactor` oscillates ±0.4 at a 4-second period. `intensity` pulses ±0.1 at 2 seconds. In frozen mode, 14 prime-number oscillation periods (7s, 11s, 13s... up to 59s) create an evolving drift that never quite repeats.

### Experiment with modes:

- **Disable Mode 1** — Comment out `applyContinuousMappings(dt)`. Now only events and drift drive the visuals. It's calmer, more contemplative.
- **Disable Mode 3** — Remove `applyAmbientDrift()`. When audio stops, everything freezes dead. Notice how lifeless it feels — this is why Mode 3 exists.
- **Amplify Mode 2** — Double the burst values: `chaos + 0.6` instead of `+ 0.3`. Events become much more dramatic, punching through the continuous audio mapping.
- **Add a new Mode 2 event** — Hook up a keyboard shortcut that triggers a "Gravity Well": `dimension` snaps to 3.0 (maximum 4D distortion) over 200ms, then slowly releases to 3.8 over 5 seconds. The geometry warps inward like it's being pulled into a black hole.

---

## EMA Smoothing

Every parameter transition in synesthesia uses the same formula:

```javascript
value = current + (target - current) * (1 - Math.exp(-dt / tau))
```

This is exponential moving average. Lower tau = faster response. It's frame-rate independent (the `dt` division handles variable frame timing), it can't overshoot, and it produces naturally organic motion.

**Why not `setTimeout` or CSS transitions?** Because you need parameters to be responsive *and* smooth simultaneously. A `setTimeout` would ignore audio changes during the delay. A CSS transition can't be interrupted and redirected mid-flight. EMA can — every frame, the target can change and the value smoothly reorients toward the new target.

| Parameter | Tau | Response | Feels like... |
|-----------|-----|----------|---------------|
| speed | 0.08s | Near-instant | A tap response |
| gridDensity | 0.10s | Very fast | A drum hit |
| chaos | 0.10s | Very fast | Crackling electricity |
| morphFactor | 0.12s | Fast | Stretching rubber |
| intensity | 0.12s | Fast | A flashbulb |
| saturation | 0.15s | Medium | A sunrise |
| rotation | 0.15s | Medium | Turning a wheel |
| dimension | 0.20s | Slow | Opening a door |
| hue | 0.25s | Slowest | Seasons changing |

**Experiment**: Change hue's tau from 0.25 to 0.02. Color now tracks audio centroid almost instantly — the visualization strobes rainbow. Change speed's tau from 0.08 to 1.0. Now speed changes are glacial — the visualization ignores rapid audio changes and only responds to sustained energy shifts.

---

## 4D Rotation

The most distinctive feature of VIB3+. Objects exist in 4D space, and rotation in 4D has *six* independent planes (not three like 3D). The 4D planes — XW, YW, ZW — produce visual effects that can't happen in three dimensions: geometry folding through itself, faces appearing and disappearing, impossible intersections.

In synesthesia, the 4D rotation axes are deliberately *faster* than the 3D ones:

```
XY: 0.04 rad/s  (3D, slowest)
XZ: 0.03 rad/s  (3D)
YZ: 0.02 rad/s  (3D, very slow)
XW: 0.08 rad/s  (4D, 2x fastest 3D)
YW: 0.06 rad/s  (4D)
ZW: 0.05 rad/s  (4D)
```

This means the 4D rotation is the dominant visual motion. The object constantly reveals its four-dimensional structure — faces that don't exist in 3D slide into view, edges that should be parallel start diverging, familiar shapes become alien.

### Experiment:

- **Kill 3D rotation entirely** — Set XY, XZ, YZ velocities to 0. Now *only* 4D rotation is visible. The object just... morphs. No familiar spinning. Deeply strange.
- **Kill 4D rotation** — Set XW, YW, ZW to 0. Now it looks like a normal 3D rotating object. Notice how much less interesting it is — that difference is the entire value proposition of VIB3+.
- **One 4D axis only** — Set all rotation to 0 except ZW at 0.15. The geometry flips through the W dimension along a single plane. Each geometry responds differently — try it with Klein Bottle (geometry 4) for mind-bending results.
- **Audio-driven 4D only** — Remove the audio→XY mapping and amplify audio→XW/YW/ZW. Now the 3D orientation is static while the 4th dimension pulses with the music.
- **Scroll portal** — The scroll wheel already modulates ZW rotation. Try scrolling slowly and watch the geometry unfold through the 4th dimension. This is what "Portal Open" means — you're literally scrolling through hyperspace.

---

## Adding Your Own Elements

The synesthesia architecture is designed to be extended, not just observed:

### Add a text overlay that reacts to VIB3+

In `index.html`, add a div. In `synesthesia.css`, style it with CSS variables. Done — it reacts automatically because the bridge updates every frame.

```html
<div id="title" style="
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-size: 60px; font-weight: 100; z-index: 8; pointer-events: none;
  color: hsl(var(--vib3-hue), 60%, 70%);
  opacity: calc(0.1 + var(--vib3-intensity) * 0.3);
  letter-spacing: calc(0.05em + var(--vib3-chaos) * 0.5em);
">YOUR TITLE</div>
```

### Add a third engine

In `synesthesia.js`, create another `VIB3Engine({ system: 'holographic' })`, initialize it into a new container, and give it its own coordination rule in `pushSecondaryState`. Maybe it tracks the *average* of primary and secondary intensity.

### Hook up MIDI

Import `MIDIController` from `../../../src/advanced/MIDIController.js`. Map MIDI CC values to parameters. Now a hardware knob controls `chaos` while audio controls everything else.

### Feed it real-time data

Replace the audio processing in `processAudio()` with a WebSocket that receives normalized values (0-1) for each of the 8 bands. Stock tickers, IoT sensors, game telemetry — anything that produces numbers can drive VIB3+.

### Build a control panel

Add HTML sliders that call `engine.setParameter()` directly. You can override any parameter the audio pipeline sets — the EMA smoothing means your manual control and the audio will blend together naturally.

---

## Controls Quick Reference

| Input | What Happens |
|-------|-------------|
| Tap / click | **Burst** — chaos spike, speed kick, ZW rotation pulse |
| Long-press (800ms) | **Crystallize** — everything freezes into a bright, still crystal |
| Release from crystallize | **Color Flood** — parameters rush back to personality defaults |
| Double-tap / Space | **Freeze/Thaw** — enter frozen drift mode with prime-number oscillation |
| Horizontal swipe | Cycle through 8 base geometries |
| Vertical swipe | Cycle through 3 visualization systems |
| Scroll wheel | **Portal Open** — rotate through the 4th dimension |
| Hover secondary panel | **Approach** — panel grows, simplifies, brightens; primary retreats |
| Leave secondary panel | **Retreat** — panel shrinks back, primary recovers |
| 1 / 2 / 3 | Switch primary to Faceted / Quantum / Holographic with crossfade |
| 4 | Cycle secondary system |
| C | Cycle color preset (primary and secondary get complementary presets) |
| Arrow keys / HJKL | Navigate geometry grid (base type + core warp) |
| R | Random geometry with onset flash |
| F | Fullscreen toggle |
| A | Resume audio context (if browser suspended it) |

---

## What You're Looking At

When synesthesia is running with audio, here's what's happening simultaneously on every frame:

1. Audio FFT is processed into 8 frequency bands
2. Each band drives a specific parameter through EMA smoothing (Mode 1)
3. If audio is quiet, heartbeat oscillation keeps parameters breathing (Mode 3)
4. Rotation accumulates on all 6 axes (4D faster than 3D)
5. Onset detection watches for beats and triggers bursts automatically
6. Parameters are pushed to the primary engine
7. Secondary engine receives inverted density, complementary hue, mirrored rotation, and conserved intensity
8. Six CSS custom properties update from the primary state
9. The HUD, meter, panel border, and any other CSS-driven elements react
10. If idle for 30s, the ChoreographyPlayer starts its 8-scene cycle
11. Any user input immediately breaks autonomous mode and takes control

All of this is ~1189 lines of JavaScript importing 6 SDK modules. No raw WebGL, no inline shaders, no manual canvas management. That's the point — VIB3+ handles the rendering. You handle the creative logic.
