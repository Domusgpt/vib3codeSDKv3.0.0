# VIB3+ Multi-Visualizer Choreography Patterns

**Generated: 2026-02-09**
**Companion to**: DOCS/REFERENCE_SCROLL_ANALYSIS.md
**Purpose**: Translate reference site scroll patterns into VIB3+ multi-visualizer coordinated events using Quantum, Holographic, and Faceted systems with density-based depth illusions, mathematical intertwining, layered overlaps, and multi-parameter coordination.

---

## Table of Contents

1. [Depth Illusion Engine](#1-depth-illusion-engine)
2. [Multi-Visualizer Coordination Modes](#2-multi-visualizer-coordination-modes)
3. [Section-by-Section Choreography Upgrades](#3-section-by-section-choreography-upgrades)
4. [Accent & Texture Effects Library](#4-accent--texture-effects-library)
5. [Mathematical Intertwining Functions](#5-mathematical-intertwining-functions)
6. [Implementation Priority Map](#6-implementation-priority-map)

---

## 1. Depth Illusion Engine

*Inspired by: clickerss (scale+shadow), simone (card overlap), facetad (multi-layer blend), tableside (blur-to-sharp)*

### 1A. Density-as-Distance

**Core concept**: `gridDensity` directly correlates with perceived distance. High density = far away (many small elements), low density = close up (few large elements). Combined with CSS scale + shadow, this creates a powerful **faux-3D depth tunnel**.

```javascript
// Density-Distance Function
// As an element "approaches" the viewer:
//   gridDensity: 60 → 8    (far → close)
//   CSS scale:   0.6 → 1.3  (small → large)
//   shadow:      2px → 40px  (flat → floating)
//   blur:        4px → 0px   (out-of-focus → sharp)
//   intensity:   0.3 → 0.9   (dim → bright)

function depthApproach(progress, adapter, container) {
  const p = smoothstep(progress);

  // Visualizer params: density drops as element "approaches"
  adapter.setParams({
    gridDensity: lerp(60, 8, p),
    intensity: lerp(0.3, 0.9, p),
    speed: lerp(0.2, 1.2, p),
    dimension: lerp(4.2, 3.0, p),  // projection distance narrows
  });

  // CSS depth illusion on container
  const scale = lerp(0.6, 1.3, p);
  const shadow = lerp(2, 40, p);
  const blur = lerp(4, 0, p);
  container.style.transform = `scale(${scale})`;
  container.style.boxShadow = `0 ${shadow}px ${shadow * 2}px rgba(0,0,0,${0.1 + p * 0.4})`;
  container.style.filter = `blur(${blur}px)`;
}
```

### 1B. Density-as-Distance RETREAT (Inverse)

```javascript
// Element receding: the opposite trajectory
// Creates the "sinking away" depth effect
function depthRetreat(progress, adapter, container) {
  const p = smoothstep(progress);
  adapter.setParams({
    gridDensity: lerp(8, 60, p),    // close → far
    intensity: lerp(0.9, 0.2, p),   // bright → dim
    speed: lerp(1.2, 0.1, p),       // fast → frozen
    dimension: lerp(3.0, 4.5, p),   // tight → distant
    chaos: lerp(0.4, 0.02, p),      // alive → crystallized
  });

  const scale = lerp(1.3, 0.4, p);
  const shadow = lerp(40, 0, p);
  const blur = lerp(0, 8, p);
  container.style.transform = `scale(${scale})`;
  container.style.boxShadow = `0 ${shadow}px ${shadow * 2}px rgba(0,0,0,${0.5 - p * 0.4})`;
  container.style.filter = `blur(${blur}px)`;
}
```

### 1C. Push-Pull Depth Oscillation

*Inspired by: facetad's lerp:0.1 momentum, clickerss's video zoom*

Two visualizers on the same screen, one approaching while the other retreats. Creates a continuous depth "breathing" effect.

```javascript
// Two-system push-pull: when A approaches, B retreats
function pushPullDepth(progress, adapterA, adapterB, containerA, containerB) {
  const p = progress;
  const oscillation = Math.sin(p * Math.PI * 2);
  const push = (oscillation + 1) / 2;  // 0→1→0→1
  const pull = 1 - push;

  depthApproach(push, adapterA, containerA);
  depthRetreat(push, adapterB, containerB);

  // Counter-rotation amplifies the depth separation
  adapterA.setParam('rot4dXW', p * Math.PI * 2);
  adapterB.setParam('rot4dXW', -p * Math.PI * 2);
}
```

### 1D. Faux-Shadow System

**CSS shadow technique**: A dedicated shadow element below each visualizer canvas that responds to the visualizer's depth state.

```css
.viz-depth-shadow {
  position: absolute;
  bottom: -20px;
  left: 10%;
  width: 80%;
  height: 30px;
  background: radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%);
  transform: scaleX(var(--shadow-width, 1)) scaleY(var(--shadow-height, 1));
  filter: blur(var(--shadow-blur, 8px));
  opacity: var(--shadow-opacity, 0.5);
  transition: all 0.3s ease-out;
}
```

```javascript
// Shadow responds to density (depth proxy)
function updateDepthShadow(shadowEl, adapter) {
  const density = adapter.params.gridDensity || 20;
  const intensity = adapter.params.intensity || 0.5;

  // High density (far) = wide, faint shadow
  // Low density (close) = narrow, strong shadow
  const depthFactor = 1 - (density - 4) / 56;  // 0 (far) to 1 (close)
  shadowEl.style.setProperty('--shadow-width', lerp(1.5, 0.7, depthFactor));
  shadowEl.style.setProperty('--shadow-height', lerp(0.3, 1.2, depthFactor));
  shadowEl.style.setProperty('--shadow-blur', lerp(20, 4, depthFactor) + 'px');
  shadowEl.style.setProperty('--shadow-opacity', lerp(0.2, 0.6, depthFactor));
}
```

---

## 2. Multi-Visualizer Coordination Modes

### 2A. OPPOSITION MODE (Dueling Systems)

*Inspired by: clickerss's entry/exit easing complementarity, CTA section's current approach*

Two visualizers with mathematically opposed parameters. Everything one does, the other inverts.

```javascript
const oppositionRules = {
  hue:         (base) => (base + 180) % 360,
  rot4dXW:     (val)  => -val,
  rot4dYW:     (val)  => -val * 0.7,
  gridDensity: (val)  => 64 - val,         // inverse density
  intensity:   (val)  => 1.0 - val,        // inverse brightness
  speed:       (val)  => 2.0 - val,        // inverse speed
  chaos:       (val)  => 0.7 - val,        // inverse chaos
  morphFactor: (val)  => 2.0 - val,        // inverse morph
};

function applyOpposition(primaryAdapter, secondaryAdapter, primaryParams) {
  primaryAdapter.setParams(primaryParams);
  const oppParams = {};
  for (const [key, fn] of Object.entries(oppositionRules)) {
    if (primaryParams[key] !== undefined) {
      oppParams[key] = fn(primaryParams[key]);
    }
  }
  secondaryAdapter.setParams(oppParams);
}
```

**Container behavior**: Split-screen with a divider line that pulses with the opposition intensity. When systems are maximally opposed, the divider glows brightest.

### 2B. CONVERGENCE MODE (Unity Pull)

*Inspired by: simone's dark/light mode threshold, wix-studio's entry/exit complementarity*

Two or three visualizers that start in different states and are pulled toward identical parameters over a scroll range.

```javascript
function convergenceMode(progress, adapters, targetParams) {
  const conv = smoothstep(progress);

  adapters.forEach((adapter, i) => {
    const currentParams = adapter.params;
    const merged = {};

    for (const [key, targetVal] of Object.entries(targetParams)) {
      const currentVal = currentParams[key] || 0;
      // Each system converges at its own rate (stagger)
      const systemConv = smoothstep(clamp01((conv - i * 0.1) / (1 - i * 0.1)));
      merged[key] = lerp(currentVal, targetVal, systemConv);
    }

    adapter.setParams(merged);
  });
}
```

**Depth effect during convergence**: As systems converge, density equalizes → all elements appear at the same depth plane → visual "flattening" that then SNAPS to a unified deep field (density drops together). The convergence-then-snap creates a "gravity well" illusion.

### 2C. CALL-AND-RESPONSE MODE (Chain Reaction)

*Inspired by: tableside's hamburger stagger, simone's SplitType character cascade*

System A's chaos drives System B's speed, which drives System C's morphFactor. A parameter cascade with temporal delay.

```javascript
function callAndResponse(progress, adapters, delayMs = 200) {
  const [A, B, C] = adapters;
  const p = progress;

  // A leads: chaos ramps with scroll
  const aChaos = 0.1 + p * 0.6;
  A.setParams({ chaos: aChaos, speed: 0.5 + p * 1.0 });

  // B responds to A's chaos (with delay via temporal smoothing)
  // In practice, use a lerped "delayed" value
  const bSpeed = 0.3 + aChaos * 1.5;
  B.setParams({ speed: bSpeed, intensity: 0.4 + aChaos * 0.4 });

  // C responds to B's speed
  const cMorph = 0.2 + bSpeed * 0.5;
  C.setParams({ morphFactor: cMorph, gridDensity: 10 + bSpeed * 20 });

  // The chain creates a cascading wave: A acts, B reacts, C resolves
}
```

### 2D. HEARTBEAT MODE (Synchronized Pulse)

*Inspired by: clickerss's marquee rhythm, current triptych implementation*

All systems share a sinusoidal pulse. Parameters oscillate around their base values in phase-locked harmony.

```javascript
function heartbeatPulse(time, adapters, baseParams, amplitude = 0.3) {
  const beat = Math.sin(time * Math.PI * 2 / 3000);  // 3-second cycle
  const subBeat = Math.sin(time * Math.PI * 4 / 3000) * 0.5;  // harmonic

  adapters.forEach((adapter, i) => {
    const phase = (i * Math.PI * 2) / adapters.length;  // phase offset per system
    const localBeat = Math.sin(time * Math.PI * 2 / 3000 + phase);

    adapter.setParams({
      intensity: baseParams[i].intensity + localBeat * amplitude * 0.4,
      speed: baseParams[i].speed + localBeat * amplitude * 0.6,
      gridDensity: baseParams[i].gridDensity + localBeat * amplitude * 15,
      rot4dXW: baseParams[i].rot4dXW + time / 1000 + phase,
    });
  });
}
```

### 2E. ENERGY TRANSFER MODE (Conservation)

*Inspired by: facetad's multi-layer compositing, current energy section*

Total energy across all systems remains constant. When one system gains intensity, others lose proportionally.

```javascript
const TOTAL_ENERGY = 2.0;  // Total intensity budget

function energyConservation(adapters, energyDistribution) {
  // energyDistribution: array of weights that sum to 1.0
  // e.g., [0.6, 0.25, 0.15] → system A gets 60% of energy

  const sum = energyDistribution.reduce((a, b) => a + b, 0);
  const normalized = energyDistribution.map(e => e / sum);

  adapters.forEach((adapter, i) => {
    const energy = TOTAL_ENERGY * normalized[i];
    adapter.setParams({
      intensity: Math.min(0.95, energy),
      speed: 0.2 + energy * 0.8,
      chaos: 0.05 + energy * 0.3,
      gridDensity: lerp(50, 8, energy / TOTAL_ENERGY),  // energy → density inverse
    });
  });
}
```

### 2F. DIMENSIONAL CROSSFADE (System Morph)

*Inspired by: simone's dark/light threshold, wix-studio's OutIn transition*

One visualizer system fades out (density → max, intensity → 0, blur → max) while another fades in from behind it.

```javascript
function dimensionalCrossfade(progress, outAdapter, inAdapter, outContainer, inContainer) {
  const p = smoothstep(progress);

  // OUTGOING: crystallize → freeze → fade
  outAdapter.setParams({
    gridDensity: lerp(20, 60, p),
    speed: lerp(0.8, 0.0, p),
    chaos: lerp(0.3, 0.0, p),
    intensity: lerp(0.8, 0.0, p),
  });
  outContainer.style.opacity = 1 - p;
  outContainer.style.filter = `blur(${p * 12}px)`;
  outContainer.style.transform = `scale(${1 - p * 0.15})`;

  // INCOMING: emerge → accelerate → bloom
  inAdapter.setParams({
    gridDensity: lerp(60, 20, p),
    speed: lerp(0.0, 0.8, p),
    chaos: lerp(0.0, 0.2, p),
    intensity: lerp(0.0, 0.8, p),
  });
  inContainer.style.opacity = p;
  inContainer.style.filter = `blur(${(1 - p) * 12}px)`;
  inContainer.style.transform = `scale(${0.85 + p * 0.15})`;
}
```

---

## 3. Section-by-Section Choreography Upgrades

### 3A. OPENING — Depth Tunnel Reveal

*Pattern source: simone (SplitType text rise), tableside (blur-to-sharp)*

**Current**: Canvas parameter evolution + text cascade + lattice layers
**Upgrade**: Add **density-driven depth tunnel** where the viewer appears to fly through the visualization.

```
Phase 1 (0-15%): BLACK → DISTANT
  - gridDensity: 60 → 45 (far field emerges from darkness)
  - intensity: 0 → 0.3
  - CSS: background-color transitions from #000 to transparent
  - Shadow: none (too far away)
  - Text: invisible

Phase 2 (15-35%): DISTANT → APPROACHING
  - gridDensity: 45 → 20 (structures become visible)
  - intensity: 0.3 → 0.6
  - scale(0.7) → scale(0.95) on canvas container
  - Shadow appears beneath canvas
  - Text chars begin y:100% rise (SplitType pattern)

Phase 3 (35-55%): TEXT MASK DEPTH INTERPLAY
  - Canvas BEHIND text mask: gridDensity oscillates 18-30
  - When density LOW (close): text appears to float ABOVE the visualization
  - When density HIGH (far): text sinks INTO the visualization
  - This oscillation creates a breathing depth effect

Phase 4 (55-75%): LATTICE PARALLAX + DENSITY LAYERS
  - 3 lattice decorations at DIFFERENT densities:
    - Lattice 1: density 40 (background, slow parallax, low intensity)
    - Lattice 2: density 22 (midground, medium parallax)
    - Lattice 3: density 10 (foreground, fast parallax, high intensity)
  - Each lattice layer is a visual placeholder, not a separate GPU —
    the MAIN canvas density oscillates to create the illusion

Phase 5 (75-95%): RETREAT TO PORTAL
  - depthRetreat() — density ramps 20 → 55
  - scale shrinks, shadow widens and fades
  - blur increases
  - Text fades via opacity AND blur (rack-focus exit)

Phase 6 (95-100%): PORTAL SNAP
  - Instant density spike to 60 (maximum distance)
  - intensity → 0
  - CSS: clip-path circle(0%) at center — closes like an iris
```

### 3B. TRIPTYCH — Clip-Path Territory War with Depth Layers

*Pattern source: simone (card overlap), facetad (z-index depth)*

**Current**: 3-system split-screen with clip-path, heartbeat, convergence
**Upgrade**: Each system at a DIFFERENT perceived depth, with depth shifting during scroll.

```
Depth Assignment (scroll-driven):

Phase 1 (0-30%): Quantum FOREGROUND, Holographic MID, Faceted BACK
  Quantum:    density 10, scale 1.15, sharp, bright, narrow clip (30%)
  Holographic: density 25, scale 1.0, slight blur, medium, wide clip (40%)
  Faceted:    density 45, scale 0.85, blurred, dim, widest clip (30%)

  Shadow: Quantum casts shadow ONTO Holographic
  Overlap: 5% overlap zones where clip-paths intersect
  In overlap zones: mix-blend-mode: screen creates glowing seams

Phase 2 (30-50%): DEPTH ROTATION — systems swap depth planes
  Quantum retreats: density 10→35, scale shrinks, blur increases
  Faceted advances: density 45→15, scale grows, sharpens
  Holographic holds as anchor

  THE SWAP creates a dramatic "things passing through each other" moment
  During swap: all 3 clip-paths converge to 33.3% (equal space)
  Chaos spikes on all 3 systems during the crossover point

Phase 3 (50-70%): Faceted FOREGROUND, Holographic MID, Quantum BACK
  Mirror of Phase 1 but with different systems in different positions
  Now Faceted casts shadow onto Holographic

Phase 4 (70-85%): CONVERGENCE COLLAPSE
  All 3 systems converge to SAME depth:
  - density all → 28
  - scale all → 1.0
  - blur all → 0
  - Shadow disappears (all on same plane)
  - Clip-paths equalize perfectly

Phase 5 (85-100%): CRYSTALLIZATION
  From unified depth, all systems simultaneously:
  - density: 28 → 55 (retreat together into distance)
  - speed → 0 (freeze)
  - chaos → 0 (perfect order)
  - intensity → 0.9 (bright but still)
  - This is the "frozen crystal" moment before cascade transition
```

### 3C. CASCADE — Horizontal Depth Carousel

*Pattern source: clickerss (video scale zoom), simone (alternating card offset)*

**Current**: Dual GPU background + Canvas2D cards with ripple
**Upgrade**: Cards exist at different depth planes. Active card APPROACHES viewer.

```
Card Depth Carousel:

ACTIVE CARD:
  - depthApproach(pulse) on the Canvas2D renderer
  - CSS: scale 1.25, shadow 40px, no blur
  - Canvas density: 8 (close, large structures)
  - Shadow element below card: narrow, intense

ADJACENT CARDS (±1):
  - Partial approach: density 20, scale 1.05
  - Slight shadow, no blur
  - Ripple: active card's chaos echoes here (dampened 60%)

FAR CARDS (±2+):
  - depthRetreat: density 40, scale 0.85
  - blur(2px), dim shadow
  - Minimal parameter activity

GPU BACKGROUND DEPTH RESPONSE:
  When active card has LOW density (close):
    - GPU backgrounds go HIGH density (far) — backgrounds recede
    - Background blur increases
    - Background intensity dims
  When card transitions (between active states):
    - Brief moment where card and background are at SAME density
    - Split-line PULSES (border glow) during this depth-match moment

PARALLAX SPEED DIFFERENTIATION:
  - Cards scroll at 1.0x normal speed
  - GPU left background: 0.7x (parallax lag, creates depth)
  - GPU right background: 1.3x (parallax lead, creates foreground feel)
  - This speed difference + density difference = strong depth tunnel
```

### 3D. ENERGY — Push-Pull Depth Dance

*Pattern source: facetad (momentum), tableside (blur-to-sharp)*

**Current**: Quantum bg + Faceted card with energy exchange
**Upgrade**: Full push-pull depth oscillation where systems trade depth positions.

```
7-Phase Depth Dance:

Phase 1 — EMERGENCE (0-15%):
  Card enters from MAXIMUM DEPTH:
    density 60, scale 0.4, blur 12px, intensity 0.1
  Background at MINIMUM DEPTH:
    density 10, scale 1.0, sharp, intensity 0.7
  Result: card appears to emerge from deep within the background

Phase 2 — APPROACH (15-30%):
  Card: depthApproach() — density drops, scale grows, sharpens
  Background: depthRetreat() — density rises, scale holds, dims slightly
  Cross-point at ~22%: both momentarily at same density (22)
  At cross-point: flash + chaos spike on both systems

Phase 3 — HOLD + TILT DEPTH (30-50%):
  Both at moderate depth, but TILT INTERACTION creates micro-depth:
  - Mouse left: card density DROPS (closer), bg density RISES (further)
  - Mouse right: inverse
  - This creates a see-saw depth effect driven by mouse position
  - Shadow beneath card: shape tracks mouse position

Phase 4 — DRAIN (50-60%):
  Card RETREATS while background ADVANCES:
  - Card: density 15→45, scale 1.0→0.8, blur increases
  - Background: density 30→8, intensity surges, shadow intensifies
  - Energy bar drains visually
  - Card's shadow LENGTHENS (element receding = longer shadow)

Phase 5 — GEOMETRY SWAP (60-75%):
  While at different depths, geometries swap:
  - Card gets background's geometry (at card's current high density → looks alien)
  - Background gets card's geometry (at bg's current low density → looks intimate)
  - rot4dXW = PI on both (dramatic rotation during swap)

Phase 6 — RETURN (75-88%):
  Inverse of drain — card approaches, background retreats
  - Card: density 45→12, scale 0.8→1.1 (OVERSHOOT), sharpens
  - Background: density 8→35, dims, blurs
  - Energy bar refills

Phase 7 — EXIT SPIN (88-100%):
  Card spins and retreats to infinity:
  - density: 12→60 (spinning into distance)
  - rot4dXW: 0→PI*4 (rapid rotation)
  - scale: 1.1→0.3
  - blur: 0→16px
  - Shadow: collapses to point beneath spinning card
```

### 3E. CTA — Opposition→Unity Depth Convergence

*Pattern source: simone (dark/light threshold), wix-studio (entry/exit complementarity)*

**Current**: Dual GPU with diagonal split, opposition→convergence→unity
**Upgrade**: Systems start at opposite depth extremes, converge to single unified depth.

```
3-Act Depth Story:

ACT I — MAXIMUM SEPARATION (0-40%):
  Quantum (left): FOREGROUND
    density 8, scale 1.2, shadow intense, sharp, warm hues
  Faceted (right): BACKGROUND
    density 50, scale 0.7, shadow faint, blurred, cool hues

  The diagonal split line has a DEPTH GRADIENT:
    Left side of line: dark shadow (Quantum casting)
    Right side of line: subtle glow (Faceted glowing from behind)

  Split line itself: 3px gradient border that shifts from
    warm (Quantum's hue) to cool (Faceted's hue)

ACT II — DEPTH CROSSOVER (40-70%):
  Systems swap depth positions through each other:
  - Quantum: density 8→50, scale 1.2→0.7, blur increases
  - Faceted: density 50→8, scale 0.7→1.2, sharpens

  THE CROSSOVER MOMENT (at ~55%):
  - Both at density 28, scale 1.0 — same depth plane
  - Diagonal split dissolves momentarily (clip-path → full overlap)
  - Both systems visible at 50% opacity — BLEND MOMENT
  - mix-blend-mode: screen on the overlap creates a unified glow
  - Chaos spikes to 0.6 on both — maximum visual energy

  After crossover:
  - Faceted now in foreground, Quantum in background
  - Split reforms but from the opposite direction

ACT III — UNITY (70-100%):
  Both systems converge to SAME parameters AND same depth:
  - density both → 20 (comfortable middle distance)
  - scale both → 1.0
  - blur both → 0
  - hue both → unified hue (220)
  - rot4dXW both → identical rotation
  - chaos both → 0.1 (calm)
  - intensity both → 0.7

  Split line: fades to invisible (clip-path dissolves)
  Both canvases: opacity → 0.5 each, creating a unified composite

  Final state: two systems are mathematically indistinguishable
  CTA text sits at the unified depth — perfectly clear, perfectly stable
  Shadow beneath CTA content matches the unified depth
```

---

## 4. Accent & Texture Effects Library

### 4A. Solid Color Divider Bars

*Inspired by: simone (mode switching), all sites (section transitions)*

Colored bars that split a single visualizer canvas into multiple visual zones.

```css
.viz-divider-bar {
  position: absolute;
  width: 100%;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    hsla(var(--bar-hue), 70%, 55%, 0.8) 20%,
    hsla(var(--bar-hue), 70%, 55%, 1.0) 50%,
    hsla(var(--bar-hue), 70%, 55%, 0.8) 80%,
    transparent 100%
  );
  box-shadow: 0 0 12px hsla(var(--bar-hue), 60%, 50%, 0.4);
  transform: translateY(var(--bar-y));
  transition: transform 0.6s ease-out;
}
```

```javascript
// Bars move with scroll, creating scan-line depth effect
// Multiple bars at different y-positions create a "holographic grid" over the visualizer
function animateDividerBars(scrollProgress, bars) {
  bars.forEach((bar, i) => {
    const offset = i / bars.length;
    const y = ((scrollProgress + offset) % 1) * 100;
    bar.style.setProperty('--bar-y', `${y}%`);
    bar.style.setProperty('--bar-hue', 200 + scrollProgress * 160);
  });
}
```

### 4B. Vignette Depth Frame

CSS vignette overlay that intensifies depth perception by darkening edges.

```css
.viz-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse at center,
    transparent 40%,
    rgba(0, 0, 0, var(--vignette-strength, 0.3)) 100%
  );
  z-index: 2;
}
```

```javascript
// Vignette tightens as element approaches (density drops)
function updateVignette(vignetteEl, density) {
  const depthFactor = 1 - (density - 4) / 56;
  vignetteEl.style.setProperty('--vignette-strength', lerp(0.1, 0.5, depthFactor));
}
```

### 4C. Chromatic Aberration Border

Split-color borders on visualizer containers that shift with 4D rotation.

```css
.viz-chromatic-border {
  position: relative;
}
.viz-chromatic-border::before,
.viz-chromatic-border::after {
  content: '';
  position: absolute;
  inset: -2px;
  border: 2px solid transparent;
  border-radius: inherit;
  pointer-events: none;
}
.viz-chromatic-border::before {
  border-color: hsla(var(--chroma-hue-a), 80%, 60%, 0.4);
  transform: translate(var(--chroma-offset, 1px), calc(var(--chroma-offset, 1px) * -1));
}
.viz-chromatic-border::after {
  border-color: hsla(var(--chroma-hue-b), 80%, 60%, 0.4);
  transform: translate(calc(var(--chroma-offset, 1px) * -1), var(--chroma-offset, 1px));
}
```

```javascript
// Chromatic offset driven by 4D rotation speed
function updateChromaticBorder(container, adapter) {
  const rotSpeed = Math.abs(adapter.params.rot4dXW || 0) +
                   Math.abs(adapter.params.rot4dYW || 0);
  const offset = Math.min(4, rotSpeed * 0.5);
  const hue = adapter.params.hue || 200;
  container.style.setProperty('--chroma-offset', offset + 'px');
  container.style.setProperty('--chroma-hue-a', hue - 30);
  container.style.setProperty('--chroma-hue-b', hue + 30);
}
```

### 4D. Particle Trail Overlay (CSS-only)

```css
@keyframes particle-drift {
  0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
  100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
}
.particle-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.particle-overlay span {
  position: absolute;
  width: 3px; height: 3px;
  border-radius: 50%;
  background: hsla(var(--particle-hue, 200), 70%, 70%, 0.8);
  animation: particle-drift var(--particle-duration, 3s) linear infinite;
  animation-delay: var(--particle-delay, 0s);
}
```

### 4E. Glow Seam (Between Visualizers)

When two visualizers share a border, the seam itself glows based on their combined energy.

```css
.viz-seam {
  position: absolute;
  width: 4px;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(
    180deg,
    transparent 0%,
    hsla(var(--seam-hue), 80%, 60%, var(--seam-intensity)) 30%,
    hsla(var(--seam-hue), 80%, 70%, var(--seam-intensity)) 50%,
    hsla(var(--seam-hue), 80%, 60%, var(--seam-intensity)) 70%,
    transparent 100%
  );
  filter: blur(var(--seam-blur, 4px));
  z-index: 10;
}
```

```javascript
// Seam intensity = product of both systems' chaos
function updateGlowSeam(seamEl, adapterA, adapterB) {
  const combinedChaos = (adapterA.params.chaos || 0) * (adapterB.params.chaos || 0);
  const intensity = Math.min(1, combinedChaos * 10);
  const hue = ((adapterA.params.hue || 200) + (adapterB.params.hue || 200)) / 2;
  seamEl.style.setProperty('--seam-intensity', intensity.toFixed(2));
  seamEl.style.setProperty('--seam-hue', Math.round(hue));
  seamEl.style.setProperty('--seam-blur', lerp(8, 2, intensity) + 'px');
}
```

---

## 5. Mathematical Intertwining Functions

### 5A. Golden Ratio Density Cascade

Systems' densities follow golden ratio relationships.

```javascript
const PHI = 1.618033988749;

function goldenDensityCascade(baseDensity, systemCount) {
  return Array.from({ length: systemCount }, (_, i) => {
    return baseDensity * Math.pow(PHI, i) % 56 + 4;  // Keep in 4-60 range
  });
}
```

### 5B. Lissajous Rotation Intertwining

Two systems' 4D rotations follow Lissajous curves — creating mesmerizing interlinked patterns.

```javascript
function lissajousRotations(time, adapterA, adapterB, freqRatio = 3/2) {
  const t = time / 1000;
  // System A: simple frequency
  adapterA.setParam('rot4dXW', Math.sin(t * 2) * Math.PI);
  adapterA.setParam('rot4dYW', Math.cos(t * 2) * Math.PI * 0.7);

  // System B: frequency ratio creates Lissajous knot
  adapterB.setParam('rot4dXW', Math.sin(t * 2 * freqRatio) * Math.PI);
  adapterB.setParam('rot4dYW', Math.cos(t * 2 * freqRatio + Math.PI / 4) * Math.PI * 0.7);

  // Phase shift creates figure-8 patterns when viewed together
}
```

### 5C. Fibonacci Stagger Timing

Element reveals follow Fibonacci timing for natural-feeling cascades.

```javascript
function fibonacciStagger(elementCount) {
  const fibs = [0, 1];
  for (let i = 2; i < elementCount + 2; i++) {
    fibs.push(fibs[i-1] + fibs[i-2]);
  }
  const max = fibs[fibs.length - 1];
  return fibs.slice(2).map(f => f / max);  // Normalized 0-1
}

// Usage: stagger delays that feel organic
const delays = fibonacciStagger(6);
// [0.08, 0.13, 0.21, 0.34, 0.55, 1.0] — accelerating cascade
```

### 5D. Sine-Product Interference Pattern

Two systems' densities multiply as sine waves, creating interference patterns.

```javascript
function sineInterference(progress, adapterA, adapterB) {
  const freqA = 3, freqB = 5;  // Different frequencies
  const waveA = Math.sin(progress * Math.PI * freqA);
  const waveB = Math.sin(progress * Math.PI * freqB);

  // Interference product: creates beating pattern
  const interference = (waveA * waveB + 1) / 2;

  adapterA.setParam('gridDensity', 10 + waveA * waveA * 30);  // Always positive
  adapterB.setParam('gridDensity', 10 + waveB * waveB * 30);

  // The PRODUCT drives a shared parameter (e.g., shared glow intensity)
  return interference;  // Use for glow seam, vignette, etc.
}
```

### 5E. Exponential Crescendo + Logarithmic Calm

*Inspired by: current speed crescendo, simone's mode threshold*

```javascript
// Dramatic build: slow start, explosive acceleration
function exponentialBuild(progress, adapter) {
  const exp = Math.pow(progress, 3);  // cubic acceleration
  adapter.setParams({
    speed: 0.3 + exp * 2.5,
    chaos: 0.05 + exp * 0.7,
    intensity: 0.4 + exp * 0.5,
    gridDensity: 20 + exp * 35,
  });
}

// Calm recovery: fast initial relief, slow final settle
function logarithmicCalm(progress, adapter) {
  const log = 1 - Math.pow(1 - progress, 3);  // cubic deceleration
  adapter.setParams({
    speed: 2.8 - log * 2.5,
    chaos: 0.75 - log * 0.7,
    intensity: 0.9 - log * 0.5,
    gridDensity: 55 - log * 35,
  });
}
```

### 5F. Complementary Hue Breathing

Two systems breathe between complementary colors, with the breathing rate tied to scroll position.

```javascript
function complementaryBreathing(time, scrollProgress, adapterA, adapterB) {
  const breathRate = 0.5 + scrollProgress * 2;  // Faster as you scroll
  const breath = Math.sin(time / 1000 * breathRate * Math.PI * 2);

  const baseHue = 200 + scrollProgress * 160;
  const complementary = (baseHue + 180) % 360;

  // A breathes between base and complement
  adapterA.setParam('hue', lerp(baseHue, complementary, (breath + 1) / 2));
  // B breathes inversely
  adapterB.setParam('hue', lerp(complementary, baseHue, (breath + 1) / 2));

  // When both are at the SAME hue (crossover point):
  // Brief chaos spike — the "collision" moment
  const hueDiff = Math.abs(adapterA.params.hue - adapterB.params.hue);
  if (hueDiff < 10) {
    adapterA.setParam('chaos', 0.5);
    adapterB.setParam('chaos', 0.5);
  }
}
```

---

## 6. Implementation Priority Map

### Tier 1: HIGH IMPACT, MODERATE EFFORT

| Pattern | Section | Visual Impact | Effort |
|---------|---------|--------------|--------|
| **Density-as-Distance** (1A/1B) | All sections | Transforms depth perception | Medium — parameter math only |
| **Faux-Shadow System** (1D) | All visualizer containers | Grounds elements in space | Low — CSS + 5 lines JS |
| **Push-Pull Depth** (1C) | Energy, CTA | Dramatic depth oscillation | Medium — coordinate 2 systems |
| **Glow Seam** (4E) | Triptych, CTA, Cascade | Living borders between systems | Low — CSS + 3 lines JS |
| **Vignette Frame** (4B) | All GPU sections | Focuses attention, adds depth | Low — CSS + 2 lines JS |

### Tier 2: HIGH IMPACT, HIGHER EFFORT

| Pattern | Section | Visual Impact | Effort |
|---------|---------|--------------|--------|
| **Triptych Depth Rotation** (3B) | Triptych | Systems swap depth planes | High — 5-phase choreography |
| **Energy Depth Dance** (3D) | Energy | Full push-pull with geometry swap | High — 7-phase timeline |
| **Opposition→Unity** (3E) | CTA | Depth convergence finale | High — 3-act structure |
| **Dimensional Crossfade** (2F) | Section transitions | Blur/fade between systems | Medium — per boundary |

### Tier 3: ACCENT EFFECTS

| Pattern | Where | Impact | Effort |
|---------|-------|--------|--------|
| **Chromatic Border** (4C) | Morph card, Energy card | Rotation-responsive border glow | Low |
| **Divider Bars** (4A) | Opening, Agent | Scan-line holographic overlay | Low |
| **Particle Trail** (4D) | CTA, Energy | Ambient movement | Low |
| **Fibonacci Stagger** (5C) | Cascade, Agent cards | Natural reveal timing | Low |

### Tier 4: MATHEMATICAL BEAUTY

| Pattern | Where | Impact | Effort |
|---------|-------|--------|--------|
| **Lissajous Rotations** (5B) | Triptych, CTA | Interlinked rotation patterns | Low — parameter math |
| **Sine Interference** (5D) | Triptych | Beating density patterns | Low |
| **Complementary Breathing** (5F) | Energy, CTA | Hue collision moments | Low |
| **Golden Ratio Density** (5A) | Triptych | Naturally proportioned depths | Low |
| **Exponential/Log Crescendo** (5E) | Agent crescendo | More dramatic build/calm | Low |

---

## Quick Reference: Depth Illusion Parameters

| Parameter | Close (Approaching) | Far (Retreating) | Unit |
|-----------|-------------------|-----------------|------|
| gridDensity | 4-12 | 45-60 | count |
| intensity | 0.7-0.95 | 0.1-0.3 | 0-1 |
| speed | 0.8-1.5 | 0.05-0.2 | multiplier |
| chaos | 0.2-0.5 | 0.0-0.05 | 0-1 |
| dimension | 3.0-3.3 | 4.0-4.5 | projection distance |
| CSS scale | 1.1-1.3 | 0.4-0.7 | multiplier |
| CSS blur | 0px | 6-16px | px |
| CSS shadow | 30-50px tight | 0-4px wide | px |

---

*End of Multi-Visualizer Choreography Patterns.*
*See DOCS/REFERENCE_SCROLL_ANALYSIS.md for the source analysis.*
*See DOCS/SCROLL_TIMELINE_v3.md for the current implementation.*
