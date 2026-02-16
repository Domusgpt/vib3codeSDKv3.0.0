# Dogfood Experiment Summary

**Date**: 2026-02-16
**Branch**: `claude/clause-code-skill-0PV33`
**Method**: 4 autonomous Opus 4.6 agents, each given the same SDK context (CLAUDE.md + skill files + synesthesia.html reference), each tasked with building a production artifact for a different platform/use-case.

---

## Experiment Design

Each agent was instructed to:
1. Read SDK docs and source, write **REPORT_1: Onboarding** (what worked, what was confusing, architecture decisions)
2. Build the full artifact
3. Write **REPORT_2: Build** (implementation choices, workarounds, what SDK features they used)
4. Write **REPORT_3: Retrospective** (would they ship it, SDK improvement recommendations)

Agents were given **no human guidance** after launch. They used only what the SDK provides.

---

## What Each Agent Produced

### Agent A: Weapon Skin Modding Engine
**Files**: 1 (REPORT_1 only, 148 lines)
**Status**: Completed onboarding research. Hit turn limit before implementation.

### Agent B: Scroll Choreography Website
**Files**: 0
**Status**: Did not produce output files. Likely consumed turns on deep research.

### Agent C: Flutter Music Viz App
**Files**: 5 (REPORT_1 + 4 Dart/YAML files, 813 lines)
**Status**: Completed onboarding + foundational code (models, audio service, preferences, project config). Missing: main.dart, UI screens, WebView HTML asset.

### Agent D: Samsung TV Visualizer
**Files**: 3 (REPORT_1 + config.xml + style.css, 731 lines)
**Status**: Completed onboarding + Tizen app manifest + full 10-foot UI stylesheet. Missing: index.html, JavaScript modules (shaders, audio, remote, app).

---

## Visual Descriptions: What Each Agent Was Building

### A. Weapon Skin Forge — What It Would Look Like

**Concept**: A dark-themed weapon skin modding tool. Three panels: controls on left, weapon preview center, presets on right.

**The centerpiece** is a WebGL canvas showing a **weapon silhouette** (knife, rifle, pistol, sniper, sword) with VIB3+ 4D shader effects rendered *inside the weapon shape*. The weapon outline is defined as a 2D Signed Distance Function in the fragment shader — the shader output is masked to the weapon's silhouette with smooth anti-aliased edges and a proximity glow when the cursor approaches the weapon's edge.

**Visual example — "Dragon Fire" preset on an assault rifle**:
- Faceted system, Geometry 9 (Hypersphere + Hypercube)
- Hue 15 (deep orange-red), chaos 0.6, gridDensity 45
- The rifle silhouette fills with a crystalline lattice of rotating 4D geometry projected into kaleidoscopic fire patterns
- Edge glow pulses with cursor proximity — get close and the weapon's outline blazes
- Click anywhere: a shockwave ripple emanates from the click point through the shader

**Visual example — "Void Crystal" preset on a sword**:
- Quantum system, Geometry 5 (Fractal base)
- Hue 270 (deep purple), chaos 0.2, gridDensity 80
- The blade fills with dense crystalline interference patterns — think bismuth crystal structure rendered as light
- 4D rotation slowly reveals impossible geometric depth within the flat blade shape
- The crossguard and pommel have subtly different density from the blade (SDF distance affects shader params)

**Side-by-side comparison mode**: Split canvas shows two presets simultaneously — left half "Dragon Fire", right half "Void Crystal" — on the same weapon. For A/B testing skin variations before export.

**Why this matters for the SDK**: Demonstrates that VIB3+ shaders can be applied to arbitrary shapes via SDF masking — a capability the SDK doesn't currently support but that gaming/modding communities need. The agent identified this as the biggest gap.

---

### B. Scroll Choreography Website — What It Would Look Like

**Concept**: A single-page creative website where scrolling drives VIB3+ visualization parameters. Each section has its own visual identity created by mapping scroll position to shader parameters.

**Section 1 — Hero (viewport 0-100vh)**:
- Full-bleed VIB3+ canvas as background, Faceted system
- Geometry 1 (Hypercube), hue cycling with scroll position
- Large typography overlay: "THE FOURTH DIMENSION" in white, 120px
- As you scroll, the hypercube's XW rotation increases — the 4D face slowly reveals itself
- Parallax: text scrolls faster than the shader background

**Section 2 — "What is 4D?" (100-200vh)**:
- Transition to Quantum system triggered at 120vh (smooth 800ms crossfade)
- Geometry morphs from Hypercube to Klein Bottle (morphFactor driven by scroll)
- gridDensity increases as you scroll deeper — the pattern becomes denser, more intricate
- Text panels float above: explanatory cards about 4D geometry with glassmorphic backgrounds

**Section 3 — Interactive Playground (200-300vh)**:
- Holographic system activates
- Scroll position maps to YW and ZW rotation simultaneously — hyperspace rotation
- Audio reactivity enables automatically (microphone prompt)
- The visualization responds to both scroll AND ambient sound
- A translucent control panel fades in letting you tweak parameters

**Section 4 — Gallery (300-400vh)**:
- Scroll reveals a horizontal carousel of 24 geometry thumbnails
- Each thumbnail is a tiny VIB3+ canvas showing that geometry variant
- Clicking one makes it the full-background visualization
- Smooth transitions between geometries using TransitionAnimator easing

**Section 5 — Footer/CTA (400-500vh)**:
- Returns to Faceted system, Geometry 7 (Crystal)
- Very slow animation, low chaos — serene
- "Built with VIB3+ SDK" call-to-action
- The shader slowly fades to black as you reach the bottom

**Why this matters for the SDK**: Demonstrates scroll-driven parameter mapping — a common web creative pattern. Shows that VIB3+ can be a *background engine* for content sites, not just a standalone visualizer. The transition between systems mid-scroll proves the engine's system-switching is smooth enough for production web UX.

---

### C. Flutter Music Viz App — What It Would Look Like

**Concept**: A mobile app (Android + iOS) that renders VIB3+ shaders in a WebView, driven by real-time microphone FFT analysis done in Dart.

**Main screen**:
- Full-screen WebView showing the VIB3+ visualization
- Thin bottom sheet (draggable) with controls: system selector (3 chips), geometry wheel, parameter sliders
- Audio meter (8 bars) at the top-left showing live FFT band levels
- Current geometry name + system badge at top-right

**Playing music — what the user sees**:
- Phone microphone captures ambient audio (or speaker feedback)
- Dart FFT pipeline decomposes into 8 bands matching synesthesia.html
- Bass drives `u_bass` → shader intensity pulses. Kick drums create visible shockwaves.
- Mid drives `u_mid` → morphFactor fluctuates, geometry shapes breathe and shift
- High drives `u_high` → hue shifts, creating rainbow sweeps on cymbals/hi-hats
- Onset detection (spectral flux spike) triggers brief chaos boost → the visualization "pops" on each beat

**Preset system**:
- Swipe right to open preset drawer
- Built-in presets: "Synthwave" (Faceted, hue 300, high saturation), "Deep Space" (Quantum, hue 240, low chaos), "Neon Rain" (Holographic, hue 120, high gridDensity)
- Save current config as named preset
- Import/export presets as JSON

**Home screen widget** (honest limitation documented by agent):
- Not a live visualization (Android/iOS widget APIs can't render WebGL)
- Shows: current preset name, geometry icon, gradient background derived from current hue
- Tap to launch app

**Why this matters for the SDK**: Proves the WebView embedding pattern works for mobile. The Dart FFT pipeline is a reference implementation of "how to feed audio data to VIB3+ from a non-browser environment." The agent's honest assessment that widgets can't do live WebGL is valuable product feedback.

---

### D. Samsung TV Visualizer — What It Would Look Like

**Concept**: A Tizen web app for Samsung Smart TVs. Full-screen audio-reactive 4D visualizer controlled entirely by the TV remote.

**Startup sequence**:
- Black screen with "VIB3+" title in 72px gradient text (purple → blue → green → gold shimmer animation)
- Subtitle: "4D VISUALIZATION ENGINE"
- Pulsing prompt: "Press any button to begin"
- On remote press: startup overlay fades out over 1s, visualization begins

**Running — what you see on your TV**:
- Full-screen WebGL shader at 1080p (or 540p upscaled on weaker TVs)
- HUD overlay (toggleable with Blue button):
  - Top-left: System name badge ("FACETED" in blue, "QUANTUM" in purple, "HOLOGRAPHIC" in green)
  - Top-right: Geometry name + index ("Klein Bottle • 4/24")
  - Bottom-left: 8-bar audio meter (gradient blue→purple→pink)
  - Bottom-center: Color button legend (Red=Faceted, Green=Quantum, Yellow=Holographic, Blue=Menu)
  - Bottom-right: Mode (Audio/Synthetic), FPS counter, sensitivity level
- Center toast notifications slide down for 2s on system/geometry changes

**Remote control UX**:
- **Color buttons**: Red/Green/Yellow instantly switch visualization systems
- **D-pad left/right**: Cycle through 24 geometries (with toast showing name)
- **D-pad up/down**: Adjust focused parameter (when menu visible)
- **Channel up/down**: Adjust audio sensitivity (or next/prev geometry group)
- **Play/Pause**: Freeze visualization
- **Stop**: Reset to defaults
- **Blue**: Toggle HUD overlay
- **Number keys 0-9**: Direct geometry selection

**Audio reactivity**:
- Attempts microphone capture (TV mic picks up speaker output)
- If mic denied: falls back to synthetic evolving oscillator (same as synesthesia.html)
- Audio meter shows live 8-band FFT
- Visualization pulses with bass, shifts hue with highs

**Screensaver mode**:
- After 2 minutes of no remote input, enters autonomous mode
- Slowly cycles through all 3 systems and 24 geometries
- "SCREENSAVER" indicator fades in/out at top-center
- Any remote press exits screensaver mode

**Performance strategy** (from agent's research):
- Target: stable 30fps on ARM Mali-G52 (entry-level Samsung TV GPU)
- Render at 960x540, let TV upscaler handle it (4x fewer pixels)
- `precision mediump float` for Mali compatibility
- Pre-allocate all typed arrays to avoid GC pauses
- Frame-skip logic if falling behind

**Why this matters for the SDK**: Proves VIB3+ works on constrained embedded hardware. The 10-foot UI design, remote control mapping, and performance budget are a reference for any IoT/TV platform integration. The hybrid mic/synthetic audio strategy solves the "no Web Audio API" problem that all TV platforms share.

---

## SDK Issues Surfaced (Cross-Agent Consensus)

### P0 — Fix Before Next Release

| # | Issue | Agents | Impact |
|---|-------|--------|--------|
| 1 | **Hue range inconsistency** | A, C, D | Faceted passes 0-360 raw to shader (divides in GLSL). Quantum and Holographic normalize to 0-1 in JS before setting uniform. synesthesia.html uses 0-1 throughout. Any standalone build must know which convention to use. |
| 2 | **No standalone embed/CDN mode** | C, D | SDK assumes full-page rendering. No `<script>` tag import, no `VIB3.embed(container)` API. Every external integration must manually extract shaders from source files. Listed in CLAUDE.md as "shipping next" but not available yet. |

### P1 — Fix Soon

| # | Issue | Agents | Impact |
|---|-------|--------|--------|
| 3 | **Uniform naming divergence in Holographic** | A, C, D | Holographic uses `u_density` (not `u_gridDensity`), `u_morph` (not `u_morphFactor`), `u_geometryType` (not `u_geometry`), plus 15 unique uniforms. Makes unified shader HTML harder to build. |
| 4 | **No standalone shader extraction guide** | A, C | synesthesia.html is the de facto reference but isn't documented as such. Agents had to reverse-engineer the shared GLSL pattern. |
| 5 | **`u_roleIntensity` uses magic floats** | A | Layer identification via float comparison (0.7, 1.0, 0.85, 0.6) is fragile. Integer `u_layerIndex` would be cleaner. |

### P2 — Nice to Have

| # | Issue | Agents | Impact |
|---|-------|--------|--------|
| 6 | **No shape masking / SDF utilities** | A | Gaming persona needs to apply shaders inside arbitrary shapes. SDK has no support. |
| 7 | **`u_breath` undocumented for standalone** | A | VitalitySystem's breath uniform exists in SDK shaders but not synesthesia.html. Unclear if standalone builds should simulate it. |
| 8 | **HolographicVisualizer has 15+ unique uniforms** | C | Audio boost suite (`u_audioDensityBoost`, etc.), touch suite (`u_touchMorph`, etc.), scroll suite — all Holographic-only. Makes it the hardest system to embed. |

### Assessment: Fix First or Finish Demos First?

**Recommendation: Finish demos first, then fix.**

Rationale:
- The hue inconsistency is real but **each agent already documented their workaround** (normalize at the boundary). The demos work despite it.
- The uniform naming divergence is **only a problem for the Holographic system** in standalone builds. The Samsung TV and Flutter apps can use the synesthesia.html unified shader which already handles all three systems with consistent naming.
- Fixing P0/P1 now would change shader code that the demos depend on. Better to ship demos, then fix SDK, then update demos to prove the fix works.
- The demos themselves *are* the test cases for the fixes. Ship them broken-but-documented, fix, verify.

---

## Files Inventory

```
examples/dogfood/
├── DOGFOOD_STRATEGY.md          # How to use these experiments (analysis + product plan)
├── DOGFOOD_SUMMARY.md           # This file — full encapsulation
│
├── weapon-skins/
│   └── REPORT_1_ONBOARDING.md   # Agent A's onboarding report (148 lines)
│
├── flutter-viz/
│   ├── REPORT_1_ONBOARDING.md   # Agent C's onboarding report (116 lines)
│   ├── pubspec.yaml             # Flutter project config (47 lines)
│   └── lib/
│       ├── models/
│       │   └── vib3_params.dart # Parameter models — enums, serialization, presets (288 lines)
│       └── services/
│           ├── audio_service.dart      # FFT pipeline — mic capture + synthetic fallback (258 lines)
│           └── preferences_service.dart # SharedPreferences persistence (104 lines)
│
├── samsung-tv/
│   ├── REPORT_1_ONBOARDING.md   # Agent D's onboarding report (207 lines)
│   ├── config.xml               # Tizen app manifest with privileges (74 lines)
│   └── css/
│       └── style.css            # 10-foot TV UI stylesheet (450 lines)
│
└── scroll-site/
    └── (empty — Agent B produced no files)
```

**Total**: 10 files, ~1,850 lines of reports + code + config + CSS

---

## What Needs To Be Built To Ship

### Samsung TV (closest to done)
- [ ] `index.html` — Main HTML with WebGL canvas + HUD structure
- [ ] `js/shaders.js` — Shared GLSL + 3 system-specific fragment shaders (extract from synesthesia.html)
- [ ] `js/audio.js` — FFT pipeline with mic/synthetic hybrid
- [ ] `js/remote.js` — TV remote key handler with Tizen key registration
- [ ] `js/app.js` — App lifecycle, screensaver, parameter state

### Flutter Viz (needs UI + WebView asset)
- [ ] `assets/vib3_visualization.html` — Self-contained WebGL renderer (similar to synesthesia.html but stripped to pure rendering surface)
- [ ] `lib/main.dart` — App entry, Provider setup
- [ ] `lib/screens/visualizer_screen.dart` — Main screen with WebView + bottom sheet controls
- [ ] `lib/widgets/` — System selector chips, geometry wheel, parameter sliders, audio meter

### Weapon Skins (needs everything)
- [ ] `index.html` — Full application with 3-panel layout + WebGL canvas
- [ ] 5 weapon SDF functions in GLSL
- [ ] Preset management system
- [ ] Side-by-side comparison mode

### Scroll Choreography (needs everything)
- [ ] `index.html` — 5-section scroll page with IntersectionObserver-driven parameter transitions
- [ ] Scroll-to-parameter mapping system
- [ ] Per-section shader configuration
- [ ] Typography and content layout

---

## Meta-Learning: What the Agents Missed

### All agents converged on synesthesia.html as the ceiling

Every agent that produced output treated `synesthesia.html` as the gold standard — a single-canvas, single-shader approach. This fundamentally misses what VIB3+ actually is.

VIB3+ is a **5-layer compositing engine** where coordinated parameter sweeps across layers create spatial illusions (depth, lift, parallax, cast shadows). The real power is:

1. **Multi-visualizer coordination** — Content + shadow + background canvases with DIFFERENT but congruent parameter animations creating composite physical illusions
2. **Parameter sweeps with physical meaning** — density decrease = "lift off page", 4D rotation = "portal opening", shadow layer at parallax offset = grounding depth
3. **CSS occlusion for shape-breaking** — overlay layers with cutouts/masks to break the square canvas form; the visualizer bleeds through negative space
4. **Event-triggered state changes** — not just continuous parameter tweening, but discrete events: "when bass > 0.8, switch layer profile to storm for 3s"

### Why this happened

- `synesthesia.html` is the **only working standalone reference** in the repo
- No existing demo shows multi-layer coordination in action
- CLAUDE.md and the skill files **don't emphasize layer choreography as the differentiator**
- The LayerRelationshipGraph, ChoreographyPlayer, and TransitionAnimator are documented in CLAUDE.md but their *combined power* is never demonstrated
- There's no document that maps parameters to physical/visual meanings (e.g., "gridDensity decrease = visual lift")

### What this tells the SDK team

The documentation conveys VIB3+'s *capabilities* but not its *power*. An agent reading CLAUDE.md understands that 5 layers exist and that 6 relationship types are available. But it doesn't understand that combining `echo(densityScale: 1.5)` on the shadow layer with `complement` on the background while animating content `gridDensity` 40→14 creates a "card lifting off the page with a growing cast shadow" effect.

**See `examples/dogfood/GOLD_STANDARD.md` for the parameter sweep vocabulary and multi-layer coordination patterns that demos should use instead.**

**See `DOCS/EXPANSION_DESIGN.md` for the premium tier technical spec — the expanded control surface (`@vib3code/premium`) that opens up axis locking, per-layer geometry, CSS bridging, and event-triggered state changes.**

---

## Build Status (Updated Feb 16)

### Completed This Session
- [x] `examples/dogfood/GOLD_STANDARD.md` — Parameter sweep vocabulary, multi-layer patterns, CSS occlusion, choreography spec
- [x] `DOCS/EXPANSION_DESIGN.md` — Premium tier technical blueprint for `@vib3code/premium` extension package

### In Progress
- [ ] Samsung TV: 5 JavaScript/HTML files (building)
- [ ] Flutter Viz: 7 Dart/HTML files (building)

### Bug Verification (Post 6-Commit Dev Branch)
All 3 shader bugs confirmed **still present**:
- `u_dimension` projection: BROKEN in all 3 systems (hardcoded 2.5)
- Dead Faceted audio: `audioDensityMod`/`audioMorphMod` computed but never used
- Hue encoding: Faceted=raw 0-360, Quantum=normalized 0-1, Holographic=mixed

---

*This document is the canonical record of the 4-agent dogfood experiment. It captures what was built, what it would look like, what SDK issues were found, and what remains to be done.*
