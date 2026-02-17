# VIB3+ Gold Standard — Emergent Interlocking Systems

**Purpose**: This document defines VIB3+ as a **creative medium for living interfaces**. Not a visualization library you drop into a div — an ecosystem where every element has a VIB3 soul and they all breathe, respond, and interlock as one organism.

**What this is NOT**: A parameter reference table. See `DOCS/CONTROL_REFERENCE.md` for that.

**What this IS**: A motion vocabulary, coordination grammar, and composition rulebook for building interfaces where multiple VIB3+ instances and legacy animation systems work together to create emergent visual behavior.

**Audience**: Agents designing VIB3+ compositions, developers building multi-instance layouts, the SDK team evaluating "what good looks like."

**Sources**: Built on `DOCS/MULTIVIZ_CHOREOGRAPHY_PATTERNS.md` (multi-visualizer coordination), `DOCS/EXPANSION_DESIGN.md` (premium module specs), and deep shader analysis of all three rendering systems.

**Tier context**: Features marked **(PREMIUM)** require `@vib3code/premium`. Everything else works with the free `@vib3code/sdk`.

---

## The Three Parameter Modes

Every VIB3+ parameter exists in **three simultaneous modes**. Understanding these modes is the philosophical foundation — Section A below provides the concrete vocabulary.

### Mode 1: Continuous Mapping
Parameters are **functions of input state**, evaluated every frame. Not transitions — living mappings.

`parameter = f(input_state)` — Audio bands → visual params, touch position → rotation, tilt → dimension, scroll → 4D depth.

**The universal smoothing primitive**: `alpha = 1 - Math.exp(-dt / tau)`. Every continuous mapping uses EMA to avoid jumps. Never use `setTimeout` for visual parameter changes.

### Mode 2: Event Choreography
Discrete events trigger **Attack/Sustain/Release** envelopes:
- Tap → chaos burst (spike 0→0.9, decay over 500ms via EMA)
- System switch → crossfade (drain old / flood new over 1200ms)
- Beat detection → intensity flash (150ms attack, 2000ms release)

**Timing asymmetry** is essential: approach is faster than retreat (1:2 ratio). Explosion attack is faster than settle (1:13 ratio). This is what makes motions feel physical.

### Mode 3: Ambient Drift
Parameters breathe and drift **without input**:
- **Heartbeat**: `morphFactor += 0.15 * sin(t / 4)`, `intensity += 0.08 * sin(t / 2)` (2x harmonic)
- **Phase diversity**: `phase = elementIndex * 2.399` (golden angle) prevents mechanical unison
- **Frozen drift**: Prime-number periods (7s, 11s, 13s, 17s, 19s) create non-repeating slow evolution
- **Resting state is never still**: Every element should have at minimum a Heartbeat when idle

The motions in Section A below are the **vocabulary**. The coordination patterns in Section B are the **grammar**. Understanding these three modes tells you HOW to combine them.

---

## A. The Motion Language — Multi-Parameter Compound Sweeps

Every VIB3+ "motion" is a **coordinated multi-parameter sweep** that produces a recognizable physical effect. Single-parameter animation is meaningless — density without intensity is nothing. Rotation without speed is dead. These motions are the **words** of the VIB3+ language. Sections B–D are the grammar.

### Spatial Motions

#### Approach

The object moves toward the viewer. Density IS distance — this is the foundational spatial metaphor.

| Parameter | Start | End | Easing | Duration |
|-----------|-------|-----|--------|----------|
| `gridDensity` | 60 | 8 | easeOutQuad | 400–1200ms |
| `intensity` | 0.3 | 0.9 | easeOutQuad | same |
| `speed` | 0.2 | 1.2 | easeOutQuad | same |
| `dimension` | 4.2 | 3.0 | easeOutQuad | same |
| `chaos` | 0.02 | 0.15 | linear | same |
| CSS `scale` | 0.6 | 1.3 | easeOutQuad | same |
| CSS `blur` | 4px | 0px | easeOutQuad | same |
| CSS `box-shadow` | 2px | 40px | easeOutQuad | same |

**Shader math**: `gridDensity` controls `fract(pos * density * 0.08)` — fewer lattice repetitions = open structure = visual airiness. `dimension` controls `xyz / (dimension + w)` — tighter projection = dramatic 4D distortion. The combination of density↓ + dimension↓ + intensity↑ creates an unmistakable "coming toward you" sensation.

**Why easeOutQuad**: Approaching objects decelerate as they arrive. The parabolic easing mirrors physical deceleration. Linear approach feels mechanical.

```javascript
// Approach motion using TransitionAnimator
const animator = new TransitionAnimator(
    (name, value) => engine.setParameter(name, value),
    (name) => engine.getParameter(name)
);

animator.transition({
    gridDensity: 8, intensity: 0.9, speed: 1.2,
    dimension: 3.0, chaos: 0.15
}, 800, 'easeOutQuad', null, (progress) => {
    // CSS coordination on every frame
    const scale = 0.6 + progress * 0.7;
    const blur = 4 * (1 - progress);
    const shadow = 2 + progress * 38;
    container.style.transform = `scale(${scale})`;
    container.style.filter = `blur(${blur}px)`;
    container.style.boxShadow = `0 ${shadow}px ${shadow * 2}px rgba(0,0,0,${0.1 + progress * 0.4})`;
});
```

**Combines well with**: Color Flood (approaching + vivid), Portal Open (approaching + revealing 4D).

#### Retreat

The object recedes from the viewer. **Asymmetric timing** — retreat is SLOWER than approach. Things snap toward you (400ms) but drift away (800–2000ms). This asymmetry is what makes it feel physical.

| Parameter | Start | End | Easing | Duration |
|-----------|-------|-----|--------|----------|
| `gridDensity` | 8 | 60 | easeInQuad | 800–2000ms |
| `intensity` | 0.9 | 0.2 | easeInQuad | same |
| `speed` | 1.2 | 0.1 | easeInQuad | same |
| `dimension` | 3.0 | 4.5 | easeInQuad | same |
| `chaos` | 0.4 | 0.02 | easeInQuad | same |
| CSS `scale` | 1.3 | 0.4 | easeInQuad | same |
| CSS `blur` | 0 | 8px | easeInQuad | same |
| CSS `box-shadow` | 40px | 0px | easeInQuad | same |

**Why easeInQuad**: Retreating objects accelerate away from you. Slow start, fast exit. The inverse of approach.

**Combines well with**: Color Drain (retreating + monochrome), Crystallize (retreating + freezing).

#### Lift

The element lifts off its surface — becomes sparse, light, floating. The morph decrease is key: geometry shrinks as it lifts, like it's being pulled upward. Shadow SEPARATION proves it's floating.

| Parameter | Start | End | Easing | Duration |
|-----------|-------|-----|--------|----------|
| `gridDensity` | 40 | 14 | easeOutQuad | 400–800ms |
| `morphFactor` | 1.0 | 0.5 | easeOutQuad | same |
| `intensity` | 0.7 | 0.85 | linear | same |
| CSS `translateY` | 0 | -12px | easeOutQuad | same |
| CSS shadow `translateY` | 0 | 8px | easeOutQuad | same |
| CSS shadow `blur` | 4px | 12px | easeOutQuad | same |
| CSS shadow `scale` | 1.0 | 1.08 | easeOutQuad | same |

**Combines well with**: Heartbeat (lifted + breathing), Portal Open (lifted + revealing).

#### Ground

The element settles onto its surface. NOT the inverse of Lift — it's HEAVIER. morphFactor OVERSHOOTS to 1.3 then bounces to 1.0 (landing impact). Shadow slams down (snap then soft settle).

| Parameter | Start | End | Easing | Duration |
|-----------|-------|-----|--------|----------|
| `gridDensity` | 14 | 45 | easeInQuad | 500–1000ms |
| `morphFactor` | 0.5 | 1.0 | bounce | same |
| `intensity` | 0.85 | 0.6 | easeInQuad | same |
| CSS `translateY` | -12px | 0 | bounce | same |
| CSS shadow | 8px offset | 2px offset | easeOut | 200ms (snaps) |

The `bounce` easing on morphFactor overshoots to ~1.3 before settling at 1.0, creating the landing impact.

**Combines well with**: Crystallize (grounding + freezing into order).

#### Push-Pull Oscillation

Two elements counter-phased on a sine wave. When A approaches, B retreats. Counter-rotation (rot4dXW positive on A, negative on B) amplifies the spatial separation. Creates a continuous breathing depth field.

```javascript
function pushPullOscillation(time, engineA, engineB, containerA, containerB) {
    const t = time / 1000;
    const oscillation = Math.sin(t * Math.PI * 2 / 4); // 4-second period
    const pushA = (oscillation + 1) / 2;  // 0→1→0
    const pushB = 1 - pushA;              // 1→0→1

    // A approaches as B retreats
    engineA.setParameter('gridDensity', 8 + pushB * 52);  // 8 (close) → 60 (far)
    engineA.setParameter('intensity', 0.9 - pushB * 0.7);
    engineB.setParameter('gridDensity', 8 + pushA * 52);
    engineB.setParameter('intensity', 0.9 - pushA * 0.7);

    // Counter-rotation amplifies depth separation
    engineA.setParameter('rot4dXW', oscillation * 0.8);
    engineB.setParameter('rot4dXW', -oscillation * 0.8);

    // CSS tracks depth
    containerA.style.transform = `scale(${0.6 + pushA * 0.7})`;
    containerB.style.transform = `scale(${0.6 + pushB * 0.7})`;
}
```

**Duration**: Indefinite (ambient oscillation). 3–6 second period. Use as idle state for paired elements.

---

### 4D Motions

#### Portal Open

The signature VIB3+ effect. 3D orientation LOCKED, rot4dXW animated — geometry that was invisible in the W dimension slides into view. The card physically tilts via CSS as the portal opens.

| Parameter | Start | End | Easing | Duration |
|-----------|-------|-----|--------|----------|
| `rot4dXW` | 0 | 0.9 | easeInOut | 1000–1500ms |
| `rot4dXY/XZ/YZ` | current | LOCKED | — | — |
| `hue` | current | +40° | linear | same |
| `speed` | current | +0.3 | linear | same |
| `lineThickness` | 0.03 | 0.06 | easeOut | same **(PREMIUM)** |
| CSS `rotateY` | 0 | 13.5deg (synced to rot4dXW * 15) | easeInOut | same |

**Without PREMIUM**: Skip `lineThickness` and CSS sync. Animate rot4dXW manually. The 3D axes aren't locked, so add a brief freeze of their values during the portal animation:

```javascript
// Free tier portal open — approximate axis locking
const currentXY = engine.getParameter('rot4dXY');
const currentXZ = engine.getParameter('rot4dXZ');
const currentYZ = engine.getParameter('rot4dYZ');

animator.transition({ rot4dXW: 0.9, hue: currentHue + 40, speed: currentSpeed + 0.3 },
    1200, 'easeInOut', null, (progress) => {
        // Hold 3D axes steady (manual lock)
        engine.setParameter('rot4dXY', currentXY);
        engine.setParameter('rot4dXZ', currentXZ);
        engine.setParameter('rot4dYZ', currentYZ);
        // CSS sync
        card.style.transform = `perspective(800px) rotateY(${progress * 13.5}deg)`;
    }
);
```

**With PREMIUM**: `RotationLockSystem` handles axis locking, `CSSBridge` auto-syncs `--vib3-rot4dXW`.

**Combines well with**: Lift (card lifts + opens portal), Fly-Through (portal opens + you enter).

#### Fly-Through

The "spaceship window" effect. 3D axes ALL locked at 0. 4D axes animated at different speeds — content streams past a fixed viewport. The viewer flies through 4D space.

| Parameter | Value | Notes |
|-----------|-------|-------|
| `rot4dXY/XZ/YZ` | LOCKED at 0 | **(PREMIUM)** RotationLockSystem |
| `rot4dXW` | 0.2 rad/s continuous | Animated via rAF loop |
| `rot4dYW` | 0.15 rad/s continuous | Different speed = non-repeating |
| `rot4dZW` | 0.25 rad/s continuous | Three irrational-ratio speeds |
| `gridDensity` | 8–12 | LOW — close-up (you're IN the structure) |
| `speed` | 2.0–2.5 | HIGH — content moves fast |
| `chaos` | 0.1–0.2 | Slight turbulence |
| CSS `perspective-origin` | tracks mouse | Parallax steering |

```javascript
// Fly-through animation loop (PREMIUM)
premium.rotationLock.lockAxis('rot4dXY', 0);
premium.rotationLock.lockAxis('rot4dXZ', 0);
premium.rotationLock.lockAxis('rot4dYZ', 0);

engine.setParameter('gridDensity', 10);
engine.setParameter('speed', 2.2);

let lastTime = 0;
function flyFrame(time) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    const xw = engine.getParameter('rot4dXW') + 0.2 * dt;
    const yw = engine.getParameter('rot4dYW') + 0.15 * dt;
    const zw = engine.getParameter('rot4dZW') + 0.25 * dt;

    engine.setParameter('rot4dXW', xw % (Math.PI * 2));
    engine.setParameter('rot4dYW', yw % (Math.PI * 2));
    engine.setParameter('rot4dZW', zw % (Math.PI * 2));

    requestAnimationFrame(flyFrame);
}
requestAnimationFrame(flyFrame);
```

**Free tier approximation**: Manually set rot4dXY/XZ/YZ each frame. Less reliable (other systems might override), but functional.

**Geometry changes mid-flight**: Switching geometry during Fly-Through creates the sensation of entering different "regions" of 4D space. Geometry 11 (hypersphere + torus) feels like a tunnel, geometry 5 (fractal) feels like zooming through infinite structure.

#### Dimensional Zoom

Push into the 4D lattice. dimension drops from 4.5 (flat) to 3.0 (extreme perspective distortion). At dimension 3.0, you're INSIDE the 4D structure.

| Parameter | Start | End | Easing | Duration |
|-----------|-------|-----|--------|----------|
| `dimension` | 4.5 | 3.0 | easeInOut | 1500–3000ms |
| `uvScale` | 1 | 4 | easeInOut | same **(PREMIUM)** |
| `lineThickness` | 0.03 | 0.08 | easeOut | same **(PREMIUM)** |
| `speed` | 1.0 | 0.4 | easeInOut | same (closer = slower) |

**Combines well with**: Approach (immersive combined Approach + Dimensional Zoom is overwhelming).

#### Inside-Out Fold

rot4dYW 0→π — geometry folds vertically through hyperspace. Combined with CSS perspective + rotateX, the card tips backward and the geometry folds INTO itself. For page transitions, modal reveals, card flips that show a different 4D face.

| Parameter | Start | End | Easing | Duration |
|-----------|-------|-----|--------|----------|
| `rot4dYW` | 0 | π (3.14) | easeInOut | 800–1200ms |
| `intensity` | 0.8 | 0.3→0.8 | sineInOut | same (dips mid-fold) |
| CSS `rotateX` | 0 | -15deg | easeInOut | same (card tips backward) |
| CSS `perspective` | 1000px | 600px | linear | same (tightens) |

**Combines well with**: Dimensional Crossfade (fold out one system, fold in another).

---

### Energy Motions

#### Explosion → Settle

Structure shatters instantly. The attack MUST be fast (150ms). Slow explosions feel wrong — they're "dissolves." Explosions are violence.

| Phase | Parameters | Duration | Easing |
|-------|-----------|----------|--------|
| **Attack** | chaos 0.1→0.9, speed 0.5→2.5, gridDensity 30→10, intensity spike to 1.0 | 150ms | easeOut |
| **Release** | chaos 0.9→0.05, speed 2.5→0.3, gridDensity 10→30, intensity 1.0→0.6 | 2000ms | easeInOut |

```javascript
animator.sequence([
    { params: { chaos: 0.9, speed: 2.5, gridDensity: 10, intensity: 1.0 },
      duration: 150, easing: 'easeOut' },
    { params: { chaos: 0.05, speed: 0.3, gridDensity: 30, intensity: 0.6 },
      duration: 2000, easing: 'easeInOut' }
]);
```

**Combines well with**: Cascade Chain (explosion ripples through adjacent elements).

#### Crystallize

Order emerging from noise. NOT the reverse of Explosion — Crystallize is SLOW (3000ms). The chaos doesn't explode backward; it freezes gradually, like water crystallizing. Saturation drains as order forms (frozen things are colorless).

| Parameter | Start | End | Easing | Duration |
|-----------|-------|-----|--------|----------|
| `chaos` | 0.6 | 0 | easeInOut | 3000ms |
| `speed` | 1.0 | 0 | easeInOut | 3000ms |
| `gridDensity` | current | current (holds) | — | — |
| `saturation` | 0.8 | 0.3 | easeInOut | 3000ms |
| `intensity` | 0.5 | 0.85 | easeOut | 3000ms |

The density holds steady — structure doesn't move, it clarifies. The brightness increase combined with saturation decrease creates the "ice forming" visual.

**Combines well with**: Ground (settling + crystallizing), Narrative Arc (page going to sleep).

#### Storm

All parameters oscillating randomly within bounded ranges. The "unstable equilibrium" state — never fully ordered, never fully destroyed, never repeating. For screensavers, idle states, ambient backgrounds.

| Parameter | Min | Max | Oscillation |
|-----------|-----|-----|-------------|
| `chaos` | 0.4 | 0.8 | Random walk, 2s period |
| `speed` | 1.5 | 2.5 | Sine, 3s period |
| `gridDensity` | 15 | 40 | Random walk, 4s period |
| `hue` | base ± 30° | — | Sine, 7s period |
| `intensity` | 0.5 | 0.8 | Sine, 5s period |

All oscillations at different periods so the combination never repeats within human attention span. Use prime or irrational-ratio periods for maximum non-repetition.

```javascript
// Storm motion via rAF loop
function storm(time) {
    const t = time / 1000;
    engine.setParameter('chaos', 0.6 + 0.2 * Math.sin(t * 1.1));
    engine.setParameter('speed', 2.0 + 0.5 * Math.sin(t * 0.7));
    engine.setParameter('gridDensity', 27 + 12 * Math.sin(t * 0.53));
    engine.setParameter('hue', baseHue + 30 * Math.sin(t * 0.31));
    engine.setParameter('intensity', 0.65 + 0.15 * Math.sin(t * 0.41));
    requestAnimationFrame(storm);
}
```

#### Pulse / Heartbeat

The universal resting state. **Every idle element should have this.** morphFactor oscillates on a sine wave, intensity follows at 2x harmonic, CSS shadow pulses in phase. 4-second period. Elements that are perfectly still look dead.

| Parameter | Center | Amplitude | Period | Phase |
|-----------|--------|-----------|--------|-------|
| `morphFactor` | 1.0 | ±0.4 | 4s | 0 |
| `intensity` | 0.7 | ±0.1 | 2s (2x harmonic) | 0 |
| CSS shadow Y | 4px | ±2px | 4s | 0 |

**Critical**: Different elements MUST be at different phases. Synchronized pulsing looks mechanical. Phase-shifted pulsing looks organic. Assign phase = element index × golden angle (137.5°):

```javascript
// Per-element heartbeat with golden-angle phase offset
function heartbeat(time, engine, container, elementIndex) {
    const t = time / 1000;
    const phase = elementIndex * 2.399; // golden angle in radians

    const morph = 1.0 + 0.4 * Math.sin(t * Math.PI / 2 + phase);
    const intensity = 0.7 + 0.1 * Math.sin(t * Math.PI + phase);
    const shadowY = 4 + 2 * Math.sin(t * Math.PI / 2 + phase);

    engine.setParameter('morphFactor', morph);
    engine.setParameter('intensity', intensity);
    container.style.boxShadow = `0 ${shadowY}px ${shadowY * 3}px rgba(0,0,0,0.25)`;
}
```

#### Color Drain

Yield visual energy. Element becomes monochrome and dim. Used when another element needs to claim attention.

| Parameter | Start | End | Easing | Duration |
|-----------|-------|-----|--------|----------|
| `saturation` | current | 0 | easeOut | 400–800ms |
| `intensity` | current | 0.25 | easeOut | same |

#### Color Flood

Claim visual energy. Element gains full color and brightness. The CONSERVATION rule: when one element Floods, another must Drain. Total visual energy stays constant.

| Parameter | Start | End | Easing | Duration |
|-----------|-------|-----|--------|----------|
| `saturation` | 0 | 1.0 | easeOut | 400–800ms |
| `hue` | gray | target hue | easeOut | same |
| `intensity` | 0.25 | 0.85 | easeOut | same |

---

### Texture Motions (PREMIUM)

#### Moiré Shimmer **(PREMIUM)**

lineThickness micro-oscillation at specific density/thickness ratios that create visible interference patterns. Only works at sweet spots — document them:
- density 28–32 + thickness 0.025–0.04 → visible moiré
- density 48–52 + thickness 0.015–0.025 → fine moiré
- rot4dXY at 0.001 rad/s shifts the pattern imperceptibly

#### Particle Dissolve **(PREMIUM)**

particleSize 0.2→0.02 + chaos↑ + speed↑ + intensity↓ + CSS opacity fade. Dots shrink and scatter. 800–1200ms.

#### Wire Frame Reveal **(PREMIUM)**

lineThickness 0→0.08 over 800ms + gridDensity↓ (fewer lines = each more visible). The geometry "draws itself" as lines thicken from invisible.

---

## B. Emergent Interlocking Systems — VIB3 + VIB3

This section defines what VIB3+ IS as a product. Not "put a canvas on a page" — every element on the page has a VIB3 soul. They observe each other. They respond to the same user events. The coordinated behavior between them IS the experience.

### The Coordination Architecture

Each `VIB3Engine` instance is fully independent — own `CanvasManager`, own parameter state, own `ReactivityManager`. No global singletons. You can create as many as your GPU handles.

Coordination happens through a **thin JS bridge**:

```javascript
// The Coordination Layer pattern
class VIB3Coordinator {
    constructor() {
        this.engines = new Map();     // name → { engine, container, role }
        this.animators = new Map();   // name → TransitionAnimator
    }

    register(name, engine, container, role = 'supporting') {
        this.engines.set(name, { engine, container, role });
        this.animators.set(name, new TransitionAnimator(
            (param, val) => engine.setParameter(param, val),
            (param) => engine.getParameter(param)
        ));
    }

    // Subscribe one engine to another's parameter changes
    link(sourceName, targetName, transformFn) {
        const source = this.engines.get(sourceName);
        source.engine.onParameterChange((param, value) => {
            const target = this.engines.get(targetName);
            const transformed = transformFn(param, value);
            if (transformed !== null) {
                target.engine.setParameter(transformed.param, transformed.value);
            }
        });
    }

    // Trigger a named motion on a specific engine
    motion(engineName, motionFn, ...args) {
        const { engine, container } = this.engines.get(engineName);
        const animator = this.animators.get(engineName);
        motionFn(engine, container, animator, ...args);
    }

    // Trigger coordinated motions on ALL engines
    broadcast(motionFn, ...args) {
        for (const [name, { engine, container }] of this.engines) {
            const animator = this.animators.get(name);
            motionFn(engine, container, animator, name, ...args);
        }
    }
}
```

This Coordination Layer doesn't exist in the SDK (yet). The Gold Standard documents the **patterns** for building it. Every pattern below uses real `VIB3Engine` API calls.

---

### Pattern 1: Inverse Density — "The Seesaw"

Two canvases: foreground (button/card) and background. When foreground density decreases (Approach), background density increases (Retreat). Visual weight is conserved — the sum stays roughly constant.

**Setup**:
- Button canvas: `faceted`, geometry 7 (crystal), base density 30, intensity 0.6
- Background canvas: `holographic`, base density 25, intensity 0.4

**On hover**:

```javascript
const buttonAnimator = new TransitionAnimator(
    (p, v) => buttonEngine.setParameter(p, v),
    (p) => buttonEngine.getParameter(p)
);
const bgAnimator = new TransitionAnimator(
    (p, v) => bgEngine.setParameter(p, v),
    (p) => bgEngine.getParameter(p)
);

card.addEventListener('mouseenter', () => {
    // Button: Approach (fast, 400ms)
    buttonAnimator.transition({
        gridDensity: 12, intensity: 0.85, speed: 0.3, dimension: 3.2
    }, 400, 'easeOutQuad', null, (progress) => {
        card.style.transform = `translateY(-4px) scale(${1 + progress * 0.02})`;
        card.style.boxShadow = `0 ${4 + progress * 12}px ${16 + progress * 24}px rgba(0,0,0,0.3)`;
    });
    // Button hue warms (+15°)
    buttonAnimator.transition({ hue: baseHue + 15 }, 400, 'linear');

    // Background: Retreat (SLOWER, 600ms)
    bgAnimator.transition({
        gridDensity: 40, intensity: 0.25, speed: 0.15
    }, 600, 'easeInQuad', null, (progress) => {
        bgContainer.style.filter = `brightness(${0.85 - progress * 0.15})`;
    });
    // Background hue cools (-10°)
    bgAnimator.transition({ hue: baseHue - 10 }, 600, 'linear');
});

card.addEventListener('mouseleave', () => {
    // Both return — but at DIFFERENT rates
    buttonAnimator.transition({
        gridDensity: 30, intensity: 0.6, speed: 0.8, dimension: 3.5, hue: baseHue
    }, 300, 'easeInOut', null, (progress) => {
        card.style.transform = `translateY(0) scale(1)`;
        card.style.boxShadow = `0 4px 16px rgba(0,0,0,0.2)`;
    });
    bgAnimator.transition({
        gridDensity: 25, intensity: 0.4, speed: 0.5, hue: baseHue
    }, 500, 'easeInOut', null, (progress) => {
        bgContainer.style.filter = `brightness(1)`;
    });
});
```

**The key insight**: The timing difference. Button snaps forward (400ms easeOutQuad). Background lazily recedes (600ms easeInQuad). On leave: button returns fast (300ms), background returns slower (500ms). This differential timing creates perceived depth because **closer things react faster**.

---

### Pattern 2: Focus Lock — "The Moment of Attention"

When ANY VIB3 element receives keyboard focus (tab navigation, click), the world freezes and drains — except the focused element, which claims ALL visual energy.

```javascript
const allEngines = [buttonEngine, cardEngine, bgEngine, feature1Engine, feature2Engine];
const savedStates = new Map();

function applyFocusLock(focusedEngine) {
    // Save current states for restoration
    allEngines.forEach((eng, i) => {
        savedStates.set(eng, {
            speed: eng.getParameter('speed'),
            chaos: eng.getParameter('chaos'),
            intensity: eng.getParameter('intensity'),
            saturation: eng.getParameter('saturation')
        });
    });

    allEngines.forEach(eng => {
        const animator = new TransitionAnimator(
            (p, v) => eng.setParameter(p, v),
            (p) => eng.getParameter(p)
        );

        if (eng === focusedEngine) {
            // Focused: claim energy — vivid, still, crisp
            animator.transition({
                speed: 0, chaos: 0, intensity: 0.9, saturation: 1.0
            }, 200, 'easeOut');
        } else {
            // Others: yield energy — grey ghosts
            animator.transition({
                speed: 0, chaos: 0, intensity: 0.3, saturation: 0.15
            }, 200, 'easeOut');
        }
    });
}

function releaseFocusLock(previouslyFocusedEngine) {
    allEngines.forEach(eng => {
        const saved = savedStates.get(eng);
        const animator = new TransitionAnimator(
            (p, v) => eng.setParameter(p, v),
            (p) => eng.getParameter(p)
        );

        if (eng === previouslyFocusedEngine) {
            // Flash of remembrance — intensity spike then settle
            animator.sequence([
                { params: { intensity: 1.0 }, duration: 100, easing: 'easeOut' },
                { params: saved, duration: 600, easing: 'easeInOut' }
            ]);
        } else {
            animator.transition(saved, 600, 'easeInOut');
        }
    });
}

// Wire to DOM
document.querySelectorAll('.vib3-element').forEach((el, i) => {
    el.addEventListener('focusin', () => applyFocusLock(allEngines[i]));
    el.addEventListener('focusout', () => releaseFocusLock(allEngines[i]));
});
```

**The effect**: User attention literally DRAINS life from everything except what they're focused on. On blur, the previously-focused element gets a 100ms intensity spike (flash of remembrance) before settling.

---

### Pattern 3: Click Cascade — "The Asymmetric Ripple"

On click: the clicked card's density decreases 70% parabolically, the background does an inverse 35% increase with similar parabolic timing, both return to normal. The ASYMMETRY is the design: card moves MORE (70%) but FASTER (400ms), background moves LESS (35%) but SLOWER (500ms). Creates a "splash."

```javascript
card.addEventListener('click', () => {
    const cardDensity = cardEngine.getParameter('gridDensity');
    const bgDensity = bgEngine.getParameter('gridDensity');
    const cardSpeed = cardEngine.getParameter('speed');
    const bgSpeed = bgEngine.getParameter('speed');

    // Card: density drops 70% — fast, parabolic
    cardAnimator.sequence([
        {
            params: {
                gridDensity: cardDensity * 0.3,  // 70% decrease
                hue: currentHue + 30,             // warms
                speed: 2.0                        // jolts
            },
            duration: 400,
            easing: 'easeOutQuad'
        },
        {
            params: {
                gridDensity: cardDensity,         // return to normal
                hue: currentHue,
                speed: cardSpeed
            },
            duration: 800,
            easing: 'easeInOut'
        }
    ]);

    // Background: density increases 35% — slower, parabolic
    bgAnimator.sequence([
        {
            params: {
                gridDensity: bgDensity * 1.35,   // 35% increase
                hue: bgHue - 10,                  // cools
                speed: 2.0
            },
            duration: 500,
            easing: 'easeOutQuad'
        },
        {
            params: {
                gridDensity: bgDensity,
                hue: bgHue,
                speed: bgSpeed
            },
            duration: 1000,
            easing: 'easeInOut'
        }
    ]);

    // Barely perceptible 4D nudge — the click "tips" the view
    cardAnimator.transition({ rot4dXW: currentXW + 0.1 }, 300, 'easeOut');
    setTimeout(() => {
        cardAnimator.transition({ rot4dXW: currentXW }, 800, 'easeInOut');
    }, 300);
});
```

---

### Pattern 4: Color / Energy Transfer — "Conservation Law"

Total visual energy across all instances is conserved. When one element Claims energy, others Yield it. Color literally FLOWS between elements.

```javascript
function transferEnergy(fromEngines, toEngine, toAnimator) {
    const fromHue = fromEngines[0].getParameter('hue'); // take the source's color

    // Recipient: Color Flood — claims energy
    toAnimator.transition({
        saturation: 1.0,
        intensity: 0.85,
        hue: fromHue  // TAKES the source's hue
    }, 500, 'easeOut');

    // Sources: Color Drain — yield energy
    fromEngines.forEach(eng => {
        const animator = new TransitionAnimator(
            (p, v) => eng.setParameter(p, v),
            (p) => eng.getParameter(p)
        );
        animator.transition({
            saturation: 0,
            intensity: 0.2
        }, 600, 'easeInQuad');  // Drain is slower than Flood
    });
}

// Energy distribution with 3+ elements
// Weights: 60% active, 25% adjacent, 15% rest
function distributeEnergy(engines, activeIndex) {
    const TOTAL_INTENSITY = 2.0; // budget
    engines.forEach((eng, i) => {
        const animator = new TransitionAnimator(
            (p, v) => eng.setParameter(p, v), (p) => eng.getParameter(p)
        );
        let weight;
        if (i === activeIndex) weight = 0.6;
        else if (Math.abs(i - activeIndex) === 1) weight = 0.25;
        else weight = 0.15;

        const energy = TOTAL_INTENSITY * weight;
        animator.transition({
            intensity: Math.min(0.95, energy),
            saturation: weight > 0.3 ? 1.0 : weight * 3,
            speed: 0.2 + energy * 0.5
        }, 400, 'easeOut');
    });
}
```

---

### Pattern 5: Cascade Chain — "The Domino Effect"

N canvases in a row (nav items, card carousel, dashboard panels). Click on one triggers a cascading wave through the others with diminishing intensity and Fibonacci timing.

```javascript
function cascadeFrom(engines, containers, sourceIndex) {
    // Fibonacci stagger timing (from MULTIVIZ §5C)
    const fibs = [0, 1, 1, 2, 3, 5, 8, 13];
    const maxFib = fibs[engines.length + 1] || 13;

    engines.forEach((eng, i) => {
        const distance = Math.abs(i - sourceIndex);
        if (distance === 0) return; // source handles itself

        const delay = (fibs[distance + 1] / maxFib) * 300; // 0-300ms Fibonacci spread
        const intensity = Math.max(0.1, 1.0 - distance * 0.3); // 70%, 40%, 10%...

        setTimeout(() => {
            const animator = new TransitionAnimator(
                (p, v) => eng.setParameter(p, v), (p) => eng.getParameter(p)
            );
            const currentChaos = eng.getParameter('chaos');
            const currentDensity = eng.getParameter('gridDensity');
            const currentXW = eng.getParameter('rot4dXW');

            // Diminished explosion
            animator.sequence([
                {
                    params: {
                        chaos: currentChaos + 0.5 * intensity,
                        gridDensity: currentDensity * (1 - 0.3 * intensity),
                        rot4dXW: currentXW + 0.15 * intensity
                    },
                    duration: 150 + distance * 50,
                    easing: 'easeOut'
                },
                {
                    params: {
                        chaos: currentChaos,
                        gridDensity: currentDensity,
                        rot4dXW: currentXW
                    },
                    duration: 1000 + distance * 200,
                    easing: 'easeInOut'
                }
            ]);
        }, delay);
    });
}
```

---

### Pattern 6: Dimensional Crossfade — "System Morphing"

One visualization system fades out while another fades in. At the 50% crossover point, both exist simultaneously at medium density and partial opacity — quantum and holographic blended. Ref: MULTIVIZ §2F.

```javascript
function dimensionalCrossfade(progress, outEngine, inEngine, outContainer, inContainer) {
    // OUTGOING: Crystallize → fade
    outEngine.setParameter('gridDensity', 20 + progress * 40);
    outEngine.setParameter('speed', 0.8 * (1 - progress));
    outEngine.setParameter('chaos', 0.3 * (1 - progress));
    outEngine.setParameter('intensity', 0.8 * (1 - progress));
    outContainer.style.opacity = 1 - progress;
    outContainer.style.filter = `blur(${progress * 12}px)`;
    outContainer.style.transform = `scale(${1 - progress * 0.15})`;

    // INCOMING: emerge from crystal
    inEngine.setParameter('gridDensity', 60 - progress * 40);
    inEngine.setParameter('speed', progress * 0.8);
    inEngine.setParameter('chaos', progress * 0.2);
    inEngine.setParameter('intensity', progress * 0.8);
    inContainer.style.opacity = progress;
    inContainer.style.filter = `blur(${(1 - progress) * 12}px)`;
    inContainer.style.transform = `scale(${0.85 + progress * 0.15})`;
}

// Drive with scroll via IntersectionObserver threshold array
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            const progress = entry.intersectionRatio;
            dimensionalCrossfade(progress, quantumEngine, holoEngine, quantumEl, holoEl);
        });
    },
    { threshold: Array.from({ length: 20 }, (_, i) => i / 19) }
);
```

**System pair aesthetics**:
- quantum↔faceted: sharp mathematical morph (both geometric, different densities)
- quantum↔holographic: dense→layered (structural shift)
- faceted↔holographic: clean→atmospheric (mood shift)

---

### Pattern 7: Narrative Arc — "Telling a Story"

The page as a whole has a VIB3 narrative. Not a single interaction — a lifecycle.

| Page State | All VIB3 Canvases | Duration |
|-----------|-------------------|----------|
| **Load** | Crystal state — chaos 0, speed 0, saturation 0.2, intensity 0.8. Frozen, monochrome, beautiful but dead. | 0–first interaction |
| **Wake** | First click/scroll: Explosion from crystal → Storm. The page "wakes up." | 150ms attack + 2s settle |
| **Explore** | Active browsing: Heartbeat on idle elements, Approach/Retreat on hover, Focus Lock on focus, Click Cascade on click. Full motion vocabulary. | Indefinite |
| **Sleep** | 30s no interaction: gradual Retreat + Crystallize across ALL canvases. Colors drain. Speed falls. The gallery goes back to sleep. | 8–15s transition |
| **Re-wake** | Any interaction during sleep: immediate Explosion→Storm→Settle. Then back to Explore state. | 150ms + 2s |

The story: frozen → awake → exploring → sleeping → reawakening. The VIB3 layer IS the life of the page.

```javascript
// Narrative arc state machine
let narrativeState = 'crystal';
let idleTimer = null;

function setNarrativeState(newState) {
    clearTimeout(idleTimer);
    narrativeState = newState;

    switch (newState) {
        case 'crystal':
            allEngines.forEach(eng => {
                const anim = getAnimator(eng);
                anim.transition({
                    chaos: 0, speed: 0, saturation: 0.2, intensity: 0.8
                }, 10000, 'easeInOut');
            });
            break;

        case 'wake':
            allEngines.forEach((eng, i) => {
                const anim = getAnimator(eng);
                setTimeout(() => {
                    anim.sequence([
                        { params: { chaos: 0.8, speed: 2.0, saturation: 0.9, intensity: 1.0 },
                          duration: 150, easing: 'easeOut' },
                        { params: { chaos: 0.2, speed: 0.6, saturation: 0.8, intensity: 0.7 },
                          duration: 2000, easing: 'easeInOut' }
                    ]);
                }, i * 80); // staggered wake
            });
            setTimeout(() => setNarrativeState('explore'), 2500);
            break;

        case 'explore':
            // Enable all interaction handlers
            startIdleWatch();
            break;

        case 'sleep':
            allEngines.forEach(eng => {
                const anim = getAnimator(eng);
                anim.transition({
                    chaos: 0, speed: 0, saturation: 0.2, intensity: 0.8, gridDensity: 50
                }, 12000, 'easeInOut');
            });
            break;
    }
}

function startIdleWatch() {
    idleTimer = setTimeout(() => setNarrativeState('sleep'), 30000);
}

// Any interaction resets idle / wakes from sleep
document.addEventListener('pointerdown', () => {
    if (narrativeState === 'crystal' || narrativeState === 'sleep') {
        setNarrativeState('wake');
    } else {
        clearTimeout(idleTimer);
        startIdleWatch();
    }
});
```

---

## C. VIB3 + Non-VIB3 — The Hybrid Ecosystem

VIB3 handles the mathematical/4D/multi-parameter complexity. Legacy animation systems handle positioning, layout, and familiar web transforms. The power is in how they INTERLOCK.

**Principle**: VIB3 owns the VISUAL MATH. The animation library owns the TIMING. The bridge between them is parameter-driven.

### Bridge 1: VIB3 → CSS Custom Properties

On every parameter change, update CSS custom properties on target elements. CSS uses them in `calc()` for transforms, colors, filters.

```javascript
// Manual bridge (free tier)
engine.onParameterChange((param, value) => {
    document.documentElement.style.setProperty(`--vib3-${param}`, value);
});
```

CSS can now consume VIB3 state:
```css
.card {
    /* Corners round with chaos */
    border-radius: calc(12px + var(--vib3-chaos, 0) * 20px);
    /* Glow intensity tracks engine intensity */
    box-shadow: 0 0 calc(var(--vib3-intensity, 0.5) * 40px) hsla(var(--vib3-hue, 200), 70%, 60%, 0.3);
    /* Subtle rotation linked to rot4dXW */
    transform: perspective(1000px) rotateY(calc(var(--vib3-rot4dXW, 0) * 5deg));
}
```

**PREMIUM**: `CSSBridge` module does this automatically at 60fps with throttling, parameter whitelisting, and bidirectional sync.

### Bridge 2: GSAP / Framer Motion → VIB3

ScrollTrigger drives Approach/Retreat motions. The animation library owns scroll position; VIB3 owns the visual math.

```javascript
// GSAP ScrollTrigger → VIB3 Approach
gsap.to({}, {
    scrollTrigger: {
        trigger: '.hero-section',
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
        onUpdate: (self) => {
            const p = self.progress;
            // Approach motion driven by scroll
            engine.setParameter('gridDensity', 60 - p * 52);
            engine.setParameter('intensity', 0.3 + p * 0.6);
            engine.setParameter('speed', 0.2 + p * 1.0);
            engine.setParameter('dimension', 4.2 - p * 1.2);
        }
    }
});
```

```javascript
// Framer Motion useMotionValue → VIB3
const scrollY = useMotionValue(0);
const density = useTransform(scrollY, [0, 1000], [60, 8]);

useEffect(() => {
    return density.onChange(v => engine.setParameter('gridDensity', v));
}, [engine]);
```

### Bridge 3: Audio → Multi-Engine

Web Audio AnalyserNode with per-band routing to different engines.

```javascript
const analyser = audioContext.createAnalyser();
const dataArray = new Uint8Array(analyser.frequencyBinCount);

function audioFrame() {
    analyser.getByteFrequencyData(dataArray);
    const bins = dataArray.length;

    // Bass (0-10%) → background density (heavy bass = dense = close)
    const bass = average(dataArray, 0, bins * 0.1) / 255;
    bgEngine.setParameter('gridDensity', 50 - bass * 40);

    // Mid (10-50%) → foreground rotation speed
    const mid = average(dataArray, bins * 0.1, bins * 0.5) / 255;
    fgEngine.setParameter('speed', 0.3 + mid * 2.0);

    // High (50-100%) → foreground hue shift
    const high = average(dataArray, bins * 0.5, bins) / 255;
    fgEngine.setParameter('hue', baseHue + high * 60);

    // Onset detection → Explosion on all
    if (bass > 0.85 && prevBass < 0.7) {
        allEngines.forEach(eng => {
            const anim = new TransitionAnimator((p,v) => eng.setParameter(p,v));
            anim.sequence([
                { params: { chaos: 0.8, speed: 2.5 }, duration: 100, easing: 'easeOut' },
                { params: { chaos: 0.1, speed: 0.6 }, duration: 1500, easing: 'easeInOut' }
            ]);
        });
    }
    prevBass = bass;

    requestAnimationFrame(audioFrame);
}
```

### Bridge 4: Three.js Compositing

VIB3 offscreen canvas as Three.js texture, or layered divs where VIB3 canvases sit between Three.js layers.

```javascript
// VIB3 canvas as Three.js texture
const vib3Canvas = engine.getCanvasElement(); // primary content canvas
const texture = new THREE.CanvasTexture(vib3Canvas);
texture.needsUpdate = true;

const material = new THREE.MeshBasicMaterial({ map: texture });
const plane = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), material);
scene.add(plane);

// Update texture each frame
function threeFrame() {
    texture.needsUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(threeFrame);
}
```

### Bridge 5: Scroll Depth Tunnel

Background, midground, and foreground VIB3 canvases at different scroll parallax rates. Density tracks depth.

```javascript
window.addEventListener('scroll', () => {
    const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight);

    // Background: 0.3x speed (slow = far)
    const bgProgress = progress * 0.3;
    bgEngine.setParameter('gridDensity', 50 - bgProgress * 20);  // stays dense (far)
    bgContainer.style.transform = `translateY(${-bgProgress * 200}px)`;

    // Midground: 0.7x speed
    const midProgress = progress * 0.7;
    midEngine.setParameter('gridDensity', 35 - midProgress * 15);
    midContainer.style.transform = `translateY(${-midProgress * 200}px)`;

    // Foreground: 1.0x speed (fast = close)
    fgEngine.setParameter('gridDensity', 20 - progress * 12);  // goes sparse (close)
    fgContainer.style.transform = `translateY(${-progress * 200}px)`;
});
```

### Bridge 6: Page Transitions via 4D Fold

The 4D Inside-Out Fold IS the page transition. No separate transition library needed.

```javascript
async function navigateTo(url) {
    // Current page: fold out
    const foldOutPromise = new Promise(resolve => {
        currentAnimator.transition({ rot4dYW: Math.PI }, 600, 'easeInOut',
            resolve,
            (progress) => {
                currentPage.style.transform =
                    `perspective(800px) rotateX(${-progress * 15}deg)`;
                currentPage.style.opacity = 1 - progress * 0.5;
            }
        );
    });

    await foldOutPromise;

    // Load new page content (SPA)
    await loadContent(url);

    // New page: unfold in
    newAnimator.transition({ rot4dYW: 0 }, 800, 'easeOut', null,
        (progress) => {
            newPage.style.transform =
                `perspective(800px) rotateX(${(1 - progress) * 15}deg)`;
            newPage.style.opacity = 0.5 + progress * 0.5;
        }
    );
}
```

### Non-Obvious Compositions

Push VIB3+ into places visualization has never been:

**VIB3 as a progress bar**: Canvas stretches full-width. Left-to-right density gradient via custom shader or by animating the clip-path to reveal low-density (approaching) region. Completion = low density = arrived.

**VIB3 as a loading state**: Storm motion with accelerating Heartbeat. As data loads (0→100%), Heartbeat period decreases from 6s to 1s (faster = closer to done). On complete: Crystallize snap (order from chaos = data loaded).

**VIB3 as a cursor trail**: Tiny (40×40) VIB3 canvas follows mouse via `pointermove`. Density INVERSE to mouse velocity — stopped = dense point, fast = sparse trail. Geometry changes based on page section.

**VIB3 as notification toast**: Appear with Explosion (150ms). Hue encodes severity: error=0 (red), warning=40 (amber), success=120 (green), info=200 (blue). Auto-dismiss with Crystallize (2s). Manual dismiss with Retreat (400ms).

**VIB3 as form validation**: Each input has a tiny VIB3 canvas (inline, 20×20). Valid field: Crystallize (calm blue, ordered). Invalid: Storm with hue 0 (chaotic red). When ALL fields valid: all inputs' canvases enter synchronized Heartbeat (same phase = unity = "ready to submit").

---

## D. Full Interaction Scenarios — End-to-End

Three complete scenarios with every parameter, timing, CSS property, and DOM event specified. An agent reads one of these and BUILDS it.

### Scenario 1: E-Commerce Product Page

**Layout**:

| Element | VIB3 System | Geometry | Base Density | Base Intensity | Role |
|---------|------------|----------|-------------|---------------|------|
| Full-bleed background | holographic | 11 (hypersphere torus) | 45 | 0.25 | Ambient |
| Product card (center) | faceted | 7 (crystal) | 25 | 0.6 | Protagonist |
| Feature card A (left) | quantum | 2 (sphere) | 35 | 0.45 | Supporting |
| Feature card B (right) | quantum | 16 (hypertetra tetra) | 35 | 0.45 | Supporting |
| CTA button | faceted | 0 (tetrahedron) | 20 | 0.55 | Call to action |

**Idle state**: All elements in Heartbeat at different phases.

| Element | Heartbeat Period | Phase Offset | Notes |
|---------|-----------------|--------------|-------|
| Background | 6s | 0 | Slowest pulse — ambient |
| Product card | 4s | 2.399 rad (golden angle) | Moderate pulse |
| Feature A | 4s | 4.798 rad | Same period, different phase |
| Feature B | 4s | 7.197 rad | Same period, different phase |
| CTA button | 2s | 1.2 rad | Fastest pulse — calls attention |

**Hover on product card**:

| Target | Motion | Duration | Easing | Details |
|--------|--------|----------|--------|---------|
| Product card | Approach | 400ms | easeOutQuad | density 25→10, intensity 0.6→0.85, hue +15° |
| Background | Retreat | 600ms | easeInQuad | density 45→55, intensity 0.25→0.15 |
| Features A & B | Fade | 400ms | easeOut | intensity 0.45→0.25, speed 0.8→0.4 |
| CTA button | Heartbeat accelerate | 400ms | — | period 2s→1s (faster pulsing) |
| Product card CSS | translateY(-4px), shadow grows, scale(1.02) | 400ms | easeOutQuad | — |
| Background CSS | brightness(0.7) | 600ms | easeInQuad | — |

**Click on product card**:

| Target | Motion | Duration | Easing | Details |
|--------|--------|----------|--------|---------|
| Product card | Click Cascade source | 400ms attack, 800ms return | easeOutQuad | density decreases 70% (25→7.5), hue +30° |
| Background | Click Cascade inverse | 500ms attack, 1000ms return | easeOutQuad | density increases 35% (55→74), hue -10° |
| Features A & B | Cascade wave | 150ms delay each | easeOut | 40% intensity explosion ripple |
| All engines | Speed spike | 100ms | — | speed→2.0 then return over 500ms |
| Product card | 4D nudge | 300ms + 800ms | easeOut/easeInOut | rot4dXW +0.1 then return |
| Product card CSS | scale(1.02)→scale(1.0) | 600ms | easeOut | — |

**Tab to CTA button (focus)**:

| Target | Motion | Duration | Easing | Details |
|--------|--------|----------|--------|---------|
| CTA button | Focus Lock claim | 200ms | easeOut | intensity→0.9, saturation→1.0, speed→0 |
| ALL others | Focus Lock yield | 200ms | easeOut | intensity→0.3, saturation→0.15, speed→0 |
| CTA button | Color Transfer | 500ms | easeOut | Takes background's hue (220) |
| Background | Color Drain | 600ms | easeInQuad | saturation→0 |

**Enter on CTA button**: Explosion motion (150ms chaos spike) → triggers purchase flow.

**Scroll (IntersectionObserver)**:

| Scroll Event | Motion | Details |
|-------------|--------|---------|
| Section enters viewport | Approach per card | Fibonacci stagger (0, 80ms, 130ms, 210ms) |
| Section exits viewport | Retreat per card | All simultaneously, 1200ms |
| Between sections | Background Dimensional Crossfade | holographic→quantum→faceted cycling per section |

---

### Scenario 2: Interactive Data Dashboard

**Layout**: Three panels across — left metric (quantum), center visualization (holographic, 2x width), right metric (faceted). All connected to real-time data feed.

**Data update → VIB3 mapping**:

| Data Event | VIB3 Response | Parameters |
|-----------|---------------|------------|
| Metric increases | Approach + hue warms | density↓, intensity↑, hue +20° |
| Metric decreases | Retreat + hue cools | density↑, intensity↓, hue -20° |
| Anomaly detected | Explosion on affected panel + Cascade wave to adjacent | chaos spike to 0.8, 150ms attack |
| Threshold crossed | Color Transfer — exceeded panel Claims energy | saturation→1.0 on source, →0 on others |

**Cross-panel Call-and-Response** (MULTIVIZ §2C):

```
Left panel chaos → Center panel speed → Right panel morphFactor
    (3:2 ratio)         (5:3 ratio)          (response)
```

As data flows from left to right through the pipeline, visual energy cascades in the same direction. Left panel's chaos level drives center panel's animation speed, which drives right panel's morph intensity. The visual flow MATCHES the data flow.

**Audio alerts**: Anomaly alarm sound → bass-band drives center panel density spike. Warning tone → high-band shifts all panels hue toward red. Resolution tone → all panels Crystallize briefly then return.

---

### Scenario 3: Creative Portfolio — Art Gallery

Five sections, each a VIB3 artwork. Scroll navigates between them.

**Section 1 — "The Approach"**: Full-viewport VIB3 canvas (holographic, geometry 11). Page load starts at maximum retreat: density 60, CSS blur 12px, intensity 0.1, opacity 0.3. Scroll drives Approach over 100vh. At bottom of section: fully approached — density 8, no blur, intensity 0.9, filling the screen. The viewer has "walked up to the painting."

```javascript
const approachObserver = new IntersectionObserver((entries) => {
    const ratio = entries[0].intersectionRatio;
    section1Engine.setParameter('gridDensity', 60 - ratio * 52);
    section1Engine.setParameter('intensity', 0.1 + ratio * 0.8);
    section1Engine.setParameter('speed', 0.1 + ratio * 1.1);
    section1Container.style.filter = `blur(${12 * (1 - ratio)}px)`;
    section1Container.style.opacity = 0.3 + ratio * 0.7;
}, { threshold: Array.from({ length: 50 }, (_, i) => i / 49) });
```

**Section 2 — "The Portal"**: Card element in center with faceted VIB3 canvas. Full-bleed holographic background behind it. On click:
1. Card executes Portal Open motion (rot4dXW 0→0.9, CSS rotateY synced, 1200ms)
2. Background begins Fly-Through motion (3D locked, 4D animated, density LOW)
3. The card becomes a WINDOW into 4D space flying past
4. Mouse position steers CSS `perspective-origin` for parallax inside the portal

**Section 3 — "The Conversation"**: Two VIB3 canvases side by side in Opposition mode (MULTIVIZ §2A). Everything one does, the other inverts: `hue → +180°`, `gridDensity → 64-val`, `intensity → 1-val`. Lissajous rotation intertwining (MULTIVIZ §5B) — XW and YW on both canvases trace figure-8 patterns. Glow seam between them (MULTIVIZ §4E) pulses with their combined chaos product.

**Section 4 — "The Explosion"**: Audio-reactive. Three engines: left (quantum), center (holographic), right (faceted). Microphone input splits:
- Bass (20–200Hz) → center density (heavy bass = dense = immersive)
- Mid (200–2kHz) → all rotation speed (melody = movement)
- High (2k–20kHz) → left + right hue shift (sparkle)
- BPM detection → synchronized Heartbeat (all engines pulse to the beat)
- Onset detection → Explosion + Cascade Chain (center explodes, wave ripples outward)

**Section 5 — "The Sleep"**: All VIB3 canvases gradually Crystallize (30s). Colors drain (saturation→0.2). Speed falls (→0). Chaos settles (→0). The gallery goes back to sleep. Any interaction → immediate Explosion→Storm→Settle transition. Then the sleep cycle restarts.

---

## E. Shape-Breaking — CSS Occlusion in Multi-Instance Context

VIB3+ canvases are rectangular by default. A gold standard demo NEVER looks like rectangles on a page. CSS layers over and around canvases break the form — and in multi-instance layouts, the CSS techniques themselves become part of the coordination system.

### Card Masks

Rounded corners + hidden overflow. The CSS shadow is INTER-element depth (card floating above page). The shader's shadow layer is INTRA-visualization depth (geometry floating within card).

```css
.vib3-card {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### Text Cutouts

Large typography where VIB3 shaders show through letter forms via `background-clip: text` or `mix-blend-mode: multiply`.

```css
.vib3-text-cutout {
    font-size: 120px;
    font-weight: 900;
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
}
```

### Organic Blob Masks

SVG `clip-path` with animated curves. **PREMIUM**: CSSBridge drives blob morphing via `--vib3-chaos`:

```css
.vib3-blob {
    clip-path: url(#organic-blob);
    border-radius: calc(30% + var(--vib3-chaos, 0) * 20%);
}
```

### Negative Space

Dark panels with polygon cutouts revealing the visualizer. Multiple cutouts on one page, each showing different engine states.

### Parallax Stacks

CSS `perspective` + `translateZ` — VIB3 canvases at different z-depths. Each depth gets a different base density (farther = denser) for consistent spatial metaphor.

```css
.parallax-container { perspective: 1000px; }
.vib3-bg { transform: translateZ(-200px) scale(1.4); /* gridDensity: 45 */ }
.vib3-mid { transform: translateZ(0); /* gridDensity: 25 */ }
.vib3-fg { transform: translateZ(100px) scale(0.9); /* gridDensity: 12 */ }
```

### NEW: Glow Seam Between Instances

When two VIB3 canvases share a border, the seam glows based on combined energy. Ref: MULTIVIZ §4E.

```css
.viz-seam {
    position: absolute;
    width: 4px;
    background: linear-gradient(180deg,
        transparent 0%,
        hsla(var(--seam-hue), 80%, 60%, var(--seam-intensity)) 30%,
        hsla(var(--seam-hue), 80%, 70%, var(--seam-intensity)) 50%,
        hsla(var(--seam-hue), 80%, 60%, var(--seam-intensity)) 70%,
        transparent 100%);
    filter: blur(var(--seam-blur, 4px));
}
```

```javascript
// Seam intensity = product of adjacent chaos values
function updateGlowSeam(seamEl, engineA, engineB) {
    const chaos = (engineA.getParameter('chaos') || 0) * (engineB.getParameter('chaos') || 0);
    const intensity = Math.min(1, chaos * 10);
    const hue = ((engineA.getParameter('hue') || 200) + (engineB.getParameter('hue') || 200)) / 2;
    seamEl.style.setProperty('--seam-intensity', intensity.toFixed(2));
    seamEl.style.setProperty('--seam-hue', Math.round(hue));
    seamEl.style.setProperty('--seam-blur', (8 - intensity * 6) + 'px');
}
```

### NEW: Chromatic Aberration Border

Split-color borders where offset is driven by 4D rotation SPEED (not position). Fast rotation = visible chromatic split. Ref: MULTIVIZ §4C.

```javascript
function updateChromaticBorder(container, engine) {
    const rotSpeed = Math.abs(engine.getParameter('rot4dXW') || 0) +
                     Math.abs(engine.getParameter('rot4dYW') || 0);
    const offset = Math.min(4, rotSpeed * 0.5);
    const hue = engine.getParameter('hue') || 200;
    container.style.setProperty('--chroma-offset', offset + 'px');
    container.style.setProperty('--chroma-hue-a', hue - 30);
    container.style.setProperty('--chroma-hue-b', hue + 30);
}
```

### NEW: Depth Vignette

Vignette tightens as element Approaches (density drops → closer → tunnel vision). Ref: MULTIVIZ §4B.

```javascript
function updateVignette(vignetteEl, engine) {
    const density = engine.getParameter('gridDensity') || 30;
    const depthFactor = 1 - (density - 4) / 56;  // 0 (far) → 1 (close)
    vignetteEl.style.setProperty('--vignette-strength', (0.1 + depthFactor * 0.4).toFixed(2));
}
```

### NEW: Cross-Canvas Clip-Path Territory

Two VIB3 canvases share clip-path territory. As one Approaches (density drops), its clip-path EXPANDS, eating into the other's territory. The approaching canvas takes over screen space.

```javascript
function updateTerritory(engineA, engineB, containerA, containerB) {
    const densityA = engineA.getParameter('gridDensity') || 30;
    const densityB = engineB.getParameter('gridDensity') || 30;
    // Lower density = closer = more territory
    const depthA = 1 - (densityA - 4) / 56;
    const depthB = 1 - (densityB - 4) / 56;
    const splitPoint = depthA / (depthA + depthB); // 0.5 when equal
    containerA.style.clipPath = `inset(0 ${(1 - splitPoint) * 100}% 0 0)`;
    containerB.style.clipPath = `inset(0 0 0 ${splitPoint * 100}%)`;
}
```

### NEW: VIB3-Driven CSS Mask **(PREMIUM)**

CSSBridge outputs `--vib3-chaos` which drives SVG mask distortion. The mask shape is ALIVE, driven by the shader state.

```svg
<feTurbulence baseFrequency="0.02" numOctaves="3" result="turbulence">
    <animate attributeName="baseFrequency" dur="5s" values="0.02;0.05;0.02" repeatCount="indefinite"/>
</feTurbulence>
<feDisplacementMap in="SourceGraphic" in2="turbulence"
    scale="var(--vib3-chaos-scaled, 10)" xChannelSelector="R" yChannelSelector="G"/>
```

---

## F. Composition Rules & Mathematical Intertwining

These rules separate GOOD VIB3 composition from random parameter noise. Every multi-instance layout should be tested against these.

### Rule 1: Energy Conservation

Total intensity across all instances should stay roughly constant. When one gains, others lose. The page should never become uniformly bright (sensory overload) or uniformly dark (dead).

```
Σ(intensity[i]) ≈ constant across all interactions
```

**Test**: During hover/focus/click, sum all engine intensities before and after. Should be within ±15%.

### Rule 2: Timing Asymmetry

Approach is ALWAYS faster than Retreat. Explosion is ALWAYS faster than Crystallize. Attack < Release. This matches physical intuition — gravity accelerates approach, friction slows retreat.

| Motion Pair | Fast | Slow | Ratio |
|-------------|------|------|-------|
| Approach ↔ Retreat | 400–800ms | 800–2000ms | 1:2 minimum |
| Explosion ↔ Settle | 150ms | 2000ms | 1:13 |
| Color Flood ↔ Color Drain | 400ms | 600ms | 1:1.5 |
| Focus Lock apply ↔ release | 200ms | 600ms | 1:3 |

**Test**: Is the arrival faster than the departure? If not, it feels wrong.

### Rule 3: Phase Diversity

In Heartbeat/Pulse states, every element MUST be at a different phase. Synchronized pulsing looks mechanical (like a clock). Phase-shifted pulsing looks organic (like breathing).

**Implementation**: Phase = elementIndex × golden angle (2.399 radians = 137.5°). This guarantees maximum phase separation for any number of elements.

**Test**: Visually — do all elements pulse at the same time? If yes, add phase offsets.

### Rule 4: Parameter Coupling

Never animate a single parameter alone. Parameters that change together create physical meaning. Parameters that change alone create confusion.

| If you change... | Also change... | Why |
|-----------------|---------------|-----|
| `gridDensity` | `intensity`, `speed` | Close = bright + fast, far = dim + slow |
| `rot4dXW/YW/ZW` | `speed` (slightly) | Rotating = alive |
| `chaos` | `saturation` (inverse) | Chaos = washed, order = vivid |
| `morphFactor` | `intensity` (correlated) | Inflating = brighter, collapsing = dimmer |
| `speed` | `chaos` (slightly) | Fast = turbulent, slow = calm |

**Test**: Does each parameter change reinforce the others, or create contradictions?

### Rule 5: Hierarchy of Response

Foreground elements respond MORE and FASTER. Background elements respond LESS and SLOWER. This creates depth through differential responsiveness.

| Role | Duration Multiplier | Magnitude Multiplier | Delay |
|------|--------------------|--------------------|-------|
| Protagonist (foreground) | 1.0x | 1.0x | 0ms |
| Supporting (midground) | 1.3x | 0.6x | 50ms |
| Ambient (background) | 1.8x | 0.3x | 100ms |

**Test**: On any interaction, does the foreground react first and strongest? If background and foreground respond identically, depth is lost.

### Rule 6: The Resting State is Never Still

Every element should have at minimum a Heartbeat pulse when idle. VIB3 elements that are perfectly still look dead — like a loading screen that froze. The pulse is imperceptible consciously but the brain registers it as "alive."

Minimum idle state: morphFactor ± 0.2, intensity ± 0.05, 4–6 second period.

**Test**: Stare at an idle element for 10 seconds. Does it feel alive? If not, add Heartbeat.

### Mathematical Intertwining Functions

From MULTIVIZ §5 — the functions that create emergent patterns when applied across multiple engines:

**Golden Ratio Density Cascade** (§5A): N engines with densities at φ-spaced intervals. `densities = [base, base*φ%56+4, base*φ²%56+4, ...]`. Naturally proportioned depth layers.

**Lissajous Rotation Intertwining** (§5B): Two engines' rot4dXW/YW trace Lissajous curves at frequency ratio 3:2. Creates figure-8 interlinked rotation patterns. Visually entrancing when both canvases are visible.

**Fibonacci Stagger Timing** (§5C): Element reveal delays follow Fibonacci sequence (normalized): `[0.08, 0.13, 0.21, 0.34, 0.55, 1.0]`. Creates organic-feeling cascades rather than mechanical linear timing.

**Sine-Product Interference** (§5D): Two engines' densities multiply as sine waves at different frequencies. Creates beating patterns — moments of constructive and destructive interference in density.

**Complementary Hue Breathing** (§5F): Two engines breathe between complementary colors (hue ± 180°). At crossover points (both at same hue), chaos spikes — the "color collision" moment.

**Exponential Crescendo + Logarithmic Calm** (§5E): `build = progress³` (slow start, explosive finish). `calm = 1 - (1-progress)³` (fast relief, slow settle). For dramatic build-up sequences.

### EMA Smoothing — The Universal Primitive

Every continuous mapping (Mode 1) uses Exponential Moving Average to avoid jumps:

```javascript
alpha = 1 - Math.exp(-dt / tau)
value = value + (target - value) * alpha
```

**Reference tau values** (seconds — lower = faster response):

| Parameter | tau | Why |
|-----------|-----|-----|
| speed | 0.08 | Most responsive — speed changes should feel immediate |
| gridDensity | 0.10 | Fast — density = distance metaphor, should track input |
| chaos | 0.10 | Fast — turbulence responds quickly |
| morphFactor | 0.12 | Medium — shape changes need smoothing |
| intensity | 0.12 | Medium — brightness changes are noticeable |
| saturation | 0.15 | Medium-slow — color vividness shifts gradually |
| rotation | 0.12-0.20 | Medium — rotation velocity changes need momentum |
| dimension | 0.20 | Slow — 4D projection distance is heavy, dramatic |
| hue | 0.25 | Slowest — hue shifts should be gradual, never jarring |

**Use EMA for continuous mappings (Mode 1). Use TransitionAnimator for event choreography (Mode 2).**

### Per-System Creative Personality

When switching systems, change parameter RANGES — not just the shader. Each system has a natural character:

| System | gridDensity | speed | chaos | dimension | Character |
|--------|------------|-------|-------|-----------|-----------|
| Faceted | 15-35 | 0.3-0.8 | 0.0-0.15 | 3.6-4.0 | Clean, precise, geometric |
| Quantum | 25-60 | 0.5-1.5 | 0.1-0.4 | 3.2-3.8 | Dense, crystalline, mathematical |
| Holographic | 20-50 | 0.4-1.2 | 0.05-0.3 | 3.4-4.2 | Atmospheric, layered, ethereal |

On system switch: transition base parameters to the new personality range over 800ms using TransitionAnimator. A system switch that only changes the shader looks broken — the quantum lattice at faceted's low chaos looks wrong.

---

## G. Agent Design Patterns

How an AI agent should USE this vocabulary to design VIB3 compositions. This section is the agent's creative playbook.

### Step 1: Start with the Narrative

What story does the page tell? Map it to an emotional arc:

| Narrative | Arc | VIB3 Lifecycle |
|-----------|-----|---------------|
| Product discovery | Curiosity → interest → desire → action | Crystal → Approach → Focus Lock → Explosion (CTA) |
| Portfolio showcase | Calm → wonder → immersion → reflection | Heartbeat → Portal Open → Fly-Through → Crystallize |
| Dashboard monitoring | Vigilance → alert → response → calm | Heartbeat → Explosion (anomaly) → Focus Lock → Settle |
| Music experience | Stillness → rhythm → crescendo → release | Crystal → Heartbeat (BPM) → Storm → Crystallize |
| Storytelling | Setup → tension → climax → resolution | Approach → Opposition → Explosion → Convergence |

### Step 2: Assign Roles

Every VIB3 element has a role. The role determines its base state, responsiveness, and visual weight.

| Role | Base Density | Base Intensity | Heartbeat Period | Response Speed | Response Magnitude |
|------|-------------|---------------|-----------------|---------------|-------------------|
| **Protagonist** | 20–30 (close) | 0.6–0.7 | 3–4s | Fast (1.0x) | Full (1.0x) |
| **Supporting** | 30–40 (mid) | 0.4–0.5 | 4–5s | Moderate (1.3x) | Partial (0.6x) |
| **Ambient** | 40–55 (far) | 0.2–0.3 | 5–7s | Slow (1.8x) | Subtle (0.3x) |
| **Call to Action** | 15–25 (close) | 0.5–0.6 | 1.5–2.5s (fast) | Fastest (0.8x) | Full (1.0x) |

### Step 3: Choose Coordination Mode

What relationship should elements have?

| Desired Feel | Coordination Pattern | When to Use |
|-------------|---------------------|-------------|
| **Tension / contrast** | Opposition (B Pattern 1) | Dueling elements, choice moments |
| **Resolution / unity** | Convergence→Snap | After tension, final CTA, loading complete |
| **Flow / narrative** | Call-and-Response (B Pattern 5) | Data pipelines, sequential reveals |
| **Ambient / alive** | Heartbeat (A motion) | Idle states, backgrounds, awaiting input |
| **Attention / focus** | Focus Lock (B Pattern 2) | Form fields, selected items, modals |
| **Impact / event** | Click Cascade (B Pattern 3) | Buttons, cards, interactive triggers |
| **Transfer / transition** | Energy Transfer (B Pattern 4) | Mode switches, highlight changes |

### Step 4: Layer the Motions

Motions stack. Each layer adds without overriding:

1. **Base layer**: Heartbeat (always running, gives life)
2. **Interaction layer**: Approach/Retreat, Focus Lock, Click Cascade (triggered by DOM events)
3. **Transition layer**: Dimensional Crossfade, Inside-Out Fold (page navigation)
4. **Narrative layer**: Crystal→Wake→Explore→Sleep lifecycle (page-level state machine)

Higher layers override lower layers' parameters during their active period, then lower layers resume.

### Step 5: Test the Feel

Before building, describe in words what the interaction SHOULD feel like. Then verify each parameter contributes to that feeling.

> "When I hover the card, it should feel like the card lifts toward me and everything else fades into the background. Like picking up a photograph from a table."

Check: Does density decrease? (Yes → sparse = light = floating). Does CSS translateY change? (Yes → physically lifts). Does background dim? (Yes → attention narrows). Does background retreat? (Yes → depth increases). Does the card shadow grow? (Yes → floating above surface).

If any parameter CONTRADICTS the feeling (e.g., intensity decreasing when the card should feel "picked up and vivid"), fix it.

### Step 6: Conservation Check

Before shipping, verify:

- [ ] **Energy constant**: Sum all intensities before and after each interaction. Within ±15%?
- [ ] **Timing asymmetric**: Is every approach faster than its retreat?
- [ ] **Phases diverse**: Do idle elements pulse at different times?
- [ ] **Parameters coupled**: Does every density change come with intensity + speed changes?
- [ ] **Hierarchy maintained**: Does foreground react faster and stronger than background?
- [ ] **Never still**: Does every idle element have a Heartbeat?

### Design-Analyze-Enhance Loop

Complementary to the 6-step narrative workflow above — this loop operates during implementation:

1. **Design** — After absorbing the Gold Standard vocabulary, plan parameter timelines and input mappings for YOUR platform and audience. Choose which motions, coordination patterns, and bridges to use.

2. **Analyze** — Self-evaluate the implementation:
   - Is 4D rotation visible? (XW/YW/ZW axes should have non-zero base velocity)
   - Do events feel distinct from ambient? (Burst vs Heartbeat should be clearly different)
   - Is audio reactivity noticeable? (Parameters should visibly respond to audio input)
   - Are the three modes visually distinguishable?
   - Does timing asymmetry feel physical? (Approach faster than Retreat)

3. **Enhance** — Find emergent combinations:
   - What if audio onset triggers a burst while heartbeat is running?
   - What if scroll depth drives 4D rotation while hover drives Approach?
   - Layer the three modes together. The magic is in the interactions.

**Reference implementations**: See `examples/codex/` for annotated examples that demonstrate different creative approaches. The synesthesia entry (`examples/codex/synesthesia/`) is the golden reference showing the full vocabulary in action.

---

*VIB3+ SDK — Clear Seas Solutions LLC*
*Gold Standard Specification v2.0+v3 — Feb 17, 2026*
*Built on: MULTIVIZ_CHOREOGRAPHY_PATTERNS.md, EXPANSION_DESIGN.md, TransitionAnimator API*
