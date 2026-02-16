# REPORT 1: Onboarding & Platform Research

**Date**: 2026-02-15
**Developer**: Dogfood Engineer
**Target**: Samsung Smart TV Tizen Web App -- Sound-Reactive 4D Visualizer
**SDK Version**: VIB3+ SDK v2.0.3

---

## SDK Onboarding Assessment

### What I Read

1. **CLAUDE.md** -- Full project reference (95,000+ lines, 570+ files, 1762 tests). Comprehensive and well-maintained. The "Common Gotchas" section alone saved me at least an hour of debugging.

2. **synesthesia.html** -- The gold standard reference. A single-file 1280-line artifact containing:
   - 3 hot-swappable shader programs (Faceted, Quantum, Holographic)
   - Shared GLSL block with 6D rotation matrices, 4D projection, 8 lattice geometry functions, 2 core warp functions (Hypersphere, Hypertetrahedron)
   - Full audio pipeline: Web Audio API, FFT, 8-band spectral decomposition, onset detection via spectral flux
   - Autonomous choreography system (8 scenes, 120s cycle, 14 easing functions)
   - Time-of-day palette system, battery awareness, shake detection
   - All self-contained, zero dependencies

3. **FacetedSystem.js** -- Production shader source. Notable differences from synesthesia.html:
   - Uses `u_hue / 360.0` (hue in degrees) vs synesthesia's normalized 0-1 range
   - Has `u_breath` uniform for VitalitySystem integration
   - Has `u_roleIntensity` for multi-layer canvas support
   - Includes WGSL variant for WebGPU path
   - Production class with initDirect(), bridge pattern, dispose lifecycle

4. **QuantumVisualizer.js** -- The "dense, complex" system. Key differences:
   - `pow(geometryIntensity, 1.5)` for more dramatic falloff
   - Holographic shimmer overlay
   - HSL color system with spectral centroid influence
   - 5-layer color system (background/shadow/content/highlight/accent) with per-layer RGB separation
   - Particle systems on content and highlight layers

5. **HolographicVisualizer.js** -- The "layered, atmospheric" system:
   - Breathing projection distance modulation (`u_breath * 0.5`)
   - Variant-based parameter generation (30 geometry variants mapped to 8 bases)
   - Role-based parameter multipliers per layer
   - Moire patterns, grid overlays, RGB glitch effects
   - Touch/scroll physics integration

### Key SDK Observations

**Strengths identified for TV platform**:
- Shared GLSL block is well-extracted in synesthesia.html -- perfect template for TV app
- All shaders are fullscreen-quad fragment shaders (no vertex geometry) -- ideal for GPU fill-rate on TV SoCs
- Audio pipeline is clean: 8-band decomposition maps directly to shader uniforms
- Rotation math is identical across all 3 systems (6 matrices, same order)
- 24-geometry system (8 base * 3 warps) provides plenty of variety for screensaver cycling

**Concerns for TV platform**:
- Fragment shader complexity (especially Quantum's 5-layer system) may tax TV GPUs
- Samsung Tizen TVs use ARM Mali or Vivante GPUs -- mediump precision may be needed
- No existing touch/remote abstraction -- everything assumes mouse/touch
- Audio capture on TV is fundamentally different from browser mic access

---

## Tizen Platform Research

### Target Platform: Samsung Tizen 5.0+ (2020+ TVs)

**Web Engine**: Chromium-based (varies by TV model year):
- 2020 TVs: Chromium ~63
- 2021 TVs: Chromium ~76
- 2022+ TVs: Chromium ~85+

**WebGL Support**:
- WebGL 1.0: Universal across all Tizen 5.0+ TVs
- WebGL 2.0: Available on 2021+ models (Chromium 76+)
- Strategy: Target WebGL 1.0 for maximum compatibility, use `precision mediump float` for Mali GPUs

**GPU Hardware**:
- Entry/Mid-range: ARM Mali-G52 or Mali-G72 (2-4 cores)
- High-end: ARM Mali-G76 or Mali-G78 (6-12 cores)
- Fill rate: Significantly lower than desktop GPUs -- expect 1-3 Gpixels/s vs 50+ on desktop
- Impact: Fragment-heavy shaders at 4K resolution (3840x2160 = 8.3M pixels) will be the bottleneck

### Audio Capture Strategy

**Primary Challenge**: Samsung TVs do not expose `getUserMedia()` for system audio capture. The browser sandbox prohibits capturing TV audio output directly.

**Available APIs**:

1. **Tizen AudioControl API** (`tizen.tvaudiocontrol`):
   - `setVolumeChangeListener()` -- volume level only, not audio data
   - No FFT/waveform access
   - Verdict: Insufficient for real-time audio reactivity

2. **Web Audio API (AudioContext)**:
   - Available on Tizen 5.0+ but `getUserMedia` requires microphone hardware
   - Smart TVs do have microphones (for voice assistants) but access is restricted
   - Privilege: `http://tizen.org/privilege/mediacapture`

3. **Loopback / MediaRecorder approach**:
   - Not available -- Tizen does not expose system audio as a MediaStream

**Chosen Strategy: Hybrid Microphone + Synthetic Fallback**

1. Attempt `getUserMedia({audio: true})` with `mediacapture` privilege
2. If microphone is available, capture ambient room audio (TV speakers will feed back into mic)
3. If denied, fall back to synthetic audio oscillator (same approach as synesthesia.html)
4. The synthetic mode produces evolving FFT data for visually interesting autonomous mode
5. Include sensitivity slider to account for microphone distance from speakers

This is the same strategy synesthesia.html uses, and it is the only viable approach on Tizen. The speaker-to-microphone feedback loop is actually decent for bass and mid frequency detection -- high frequencies attenuate but that is acceptable.

### TV Remote Control UX Design

**Samsung Smart Remote Key Codes** (from Samsung DTV Web API documentation):

| Button | KeyCode | KeyName | Use in App |
|--------|---------|---------|------------|
| Arrow Up | 38 | ArrowUp | Navigate menu up |
| Arrow Down | 40 | ArrowDown | Navigate menu down |
| Arrow Left | 37 | ArrowLeft | Decrease value / Prev geometry |
| Arrow Right | 39 | ArrowRight | Increase value / Next geometry |
| Enter/Select | 13 | Enter | Confirm selection |
| Back/Return | 10009 | XF86Back | Close menu / Exit app |
| Red (A) | 403 | ColorF0Red | Switch to Faceted |
| Green (B) | 404 | ColorF1Green | Switch to Quantum |
| Yellow (C) | 405 | ColorF2Yellow | Switch to Holographic |
| Blue (D) | 406 | ColorF3Blue | Toggle HUD/menu |
| Play | 415 | MediaPlay | Resume animation |
| Pause | 19 | MediaPause | Freeze visualization |
| Play/Pause | 10252 | MediaPlayPause | Toggle freeze |
| Stop | 413 | MediaStop | Reset to defaults |
| Channel Up | 427 | ChannelUp | Next geometry group |
| Channel Down | 428 | ChannelDown | Prev geometry group |
| Volume Up | 447 | VolumeUp | Increase sensitivity |
| Volume Down | 448 | VolumeDown | Decrease sensitivity |
| Info | 457 | Info | Show/hide HUD |
| 0-9 | 48-57 | 0-9 | Direct geometry selection |

**Key Registration**: Tizen requires explicit key registration via:
```javascript
tizen.tvinputdevice.registerKey('ColorF0Red');
tizen.tvinputdevice.registerKey('ColorF1Green');
// etc.
```

Volume keys are typically intercepted by the system. We will need to use Channel Up/Down as alternatives for sensitivity control if volume keys are unavailable.

**Navigation Model**:
- Minimal on-screen UI -- this is a visualizer, not a menu-driven app
- HUD overlay toggled by Blue button
- D-pad left/right cycles geometries when HUD is hidden
- D-pad up/down adjusts parameters when HUD is visible
- Color buttons always work for system switching regardless of HUD state

### Performance Budget

**Target**: Stable 30fps at 1920x1080 (most TVs output 1080p for apps even on 4K panels)

| Resource | Budget | Notes |
|----------|--------|-------|
| Frame time | < 33ms | 30fps minimum |
| Fragment shader ALU | ~50 instructions/pixel | Mali-G52 limit |
| Texture samples | 0 | We use procedural only |
| Draw calls/frame | 1 | Single fullscreen quad |
| JS heap | < 30MB | Tizen has limited memory |
| Audio processing | < 2ms/frame | FFT on 2048 samples |
| GC pauses | < 5ms | Pre-allocate typed arrays |

**Optimization strategies**:
- Render at 960x540 and upscale (TV upscalers are good) -- 4x fewer pixels
- `precision mediump float` in all shaders
- Reduce lattice iteration counts for TV (3 fractal iterations instead of 4)
- Use `requestAnimationFrame` with frame skip logic if behind
- Pre-allocate all Float32Arrays in audio pipeline

---

## Architecture Decision

I will base the TV app on the **synesthesia.html** architecture rather than the SDK module system. Reasons:

1. **Self-contained**: No module imports, no build step, no bundler needed. Tizen apps must be fully packaged.
2. **Proven audio pipeline**: The 8-band decomposition and onset detection work perfectly for what we need.
3. **All three shaders in one file**: The shared GLSL approach reduces code duplication.
4. **Performance-proven**: synesthesia.html is designed for mobile -- same constraints as TV.

I will split the monolith into logical modules (`shaders.js`, `audio.js`, `remote.js`, `app.js`) for maintainability while keeping them loadable via `<script>` tags (no ES module import on older Tizen Chromium versions).

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| GPU too slow for complex shaders | High | Render at 540p, reduce shader complexity, frame skip |
| No audio capture | Medium | Synthetic fallback with evolving oscillator |
| Volume keys intercepted by system | Low | Use Channel Up/Down instead |
| WebGL 1.0 only (old TVs) | Medium | Already targeting WebGL 1.0 -- no WebGL 2 features used |
| App store rejection | Medium | Follow Samsung design guidelines, include proper config.xml |
| Memory pressure from GC | Medium | Pre-allocate all typed arrays, avoid object creation in render loop |

---

## Conclusion

The VIB3+ SDK's shader math is well-suited for a TV visualizer. The synesthesia.html artifact is an excellent starting point that already handles the audio-reactive pipeline. The main challenges are Tizen-specific: audio capture limitations, remote control adaptation, and GPU performance on ARM Mali hardware. I am confident these are solvable with the hybrid audio approach and resolution downscaling.

Proceeding to build.
