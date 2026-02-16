# VIB3+ Gold Standard — What Demonstrations Must Show

**Purpose**: This document defines what a VIB3+ showcase demo must demonstrate. It is grounded in deep analysis of the actual GLSL shader code, not marketing language. Every parameter sweep references the specific shader math that produces its visual effect. Every multi-layer pattern references real LayerRelationshipGraph API calls.

**Audience**: Developers building demos, agents designing visualizations, and the SDK team evaluating what "good" looks like.

**Tier context**: Patterns marked **(PREMIUM)** require `@vib3code/premium`. Unmarked patterns work with the free `@vib3code/sdk`.

---

## A. Parameter Sweep Vocabulary

Every VIB3+ parameter has a **physical meaning** when animated over time. This is the vocabulary agents and creative developers need to design intentional visual events — not random parameter tweening.

### Core Visual Parameters

| Parameter | Range | Sweep | Physical Meaning | Shader Reality |
|-----------|-------|-------|-----------------|----------------|
| `gridDensity` | 4–100 | 80→15 | Object becomes sparse, light, **lifts off surface** | `fract(p * density * 0.08)` — fewer lattice repetitions = open structure = visual airiness |
| `gridDensity` | 4–100 | 15→80 | Object becomes dense, heavy, **grounds to surface** | More repetitions per unit space = tighter pattern = visual weight and solidity |
| `morphFactor` | 0–2 | 0→2 | Geometry **inflating** — lattice amplitude doubles | Direct multiplier on geometry function output: `latticeFunction(pos) * u_morphFactor` |
| `morphFactor` | 0–2 | 2→0 | Geometry **collapsing to nothing** — visual vanishing | At 0, all geometry functions return 0 everywhere → flat black → gone |
| `chaos` | 0–1 | 0→0.6 | Structure **dissolving into noise** — destruction/explosion | `sin(x*7)*cos(y*11)*sin(z*13)` deterministic noise with prime frequencies overtakes clean lattice. At 0.6+ noise amplitude matches geometry amplitude |
| `chaos` | 0–1 | 0.6→0 | **Crystallizing from noise** — order emerging | Noise dampens, lattice structure becomes visible. The "birth" of geometry |
| `intensity` | 0–1 | 1→0 | **Fading, receding, becoming ambient** | Direct brightness multiplier. Combined with density↓ creates ghost/afterimage effect |
| `intensity` | 0–1 | 0→1 | **Materializing, approaching, asserting presence** | Object becomes fully lit. Combined with density↑ = solid, grounded appearance |
| `speed` | 0.1–3 | 0.3→2.5 | **Time acceleration — urgency building** | Scales `u_time * 0.0001 * u_speed` which drives Z and W coordinates of 4D exploration. Faster = more rapid evolution of the viewing slice through 4D space |
| `speed` | 0.1–3 | 2.5→0.3 | **Time deceleration — calming, freezing** | Slows the 4D exploration. At very low speed, patterns nearly freeze in place |
| `dimension` | 3.0–4.5 | 3.0→4.5 | **Pulling back from 4D** — less distortion, more "flat" | `xyz / (dimension + w)` perspective projection. Larger distance = less W-axis influence = approaching orthographic. **NOTE: Currently broken in SDK — hardcoded to 2.5 in all systems. Only works correctly in synesthesia.html.** |
| `dimension` | 3.0–4.5 | 4.5→3.0 | **Pushing into 4D** — extreme perspective distortion | Smaller distance = W-axis has dramatic effect = fish-eye-like 4D distortion |

### Color Parameters

| Parameter | Range | Sweep | Physical Meaning | Shader Reality |
|-----------|-------|-------|-----------------|----------------|
| `hue` | 0–360 | 0→360 | **Full spectrum rotation** — rainbow/celebration | Sin-wave color generation: `sin(hue/360 * 2π + offset)` per RGB channel (offsets: R=0, G=2π/3, B=4π/3). Full cycle = complete rainbow |
| `hue` | 0–360 | fixed | **Color identity** — brand/mood anchor | 0=red, 60=yellow, 120=green, 180=cyan, 240=blue, 300=magenta |
| `saturation` | 0–1 | 1→0 | **Draining to monochrome** — dramatic emphasis | `mix(vec3(gray), baseColor, u_saturation)`. At 0, pure grayscale. Used for "moment of silence" before a color explosion |
| `saturation` | 0–1 | 0→1 | **Color flooding in** — joyful, energetic reveal | Grayscale becomes full color. Combined with hue sweep = rainbow appearing from nothing |

### 6D Rotation Parameters

The six rotation planes are the **most powerful visual tools** in VIB3+. They are NOT "spin" — they are projections of 4-dimensional geometry through different viewing angles.

| Parameter | Range | Sweep | Physical Meaning | Shader Reality |
|-----------|-------|-------|-----------------|----------------|
| `rot4dXY` | -2π to 2π | 0→2π | **Screen-plane rotation** — geometry spins like a wheel | 4×4 matrix with cos/sin at positions (0,0), (0,1), (1,0), (1,1). Familiar 2D rotation. W-axis untouched |
| `rot4dXZ` | -2π to 2π | 0→π | **Forward/backward tilt** — leaning toward/away from camera | Rotates in the X-Z plane. Combined with CSS perspective = natural object tilt |
| `rot4dYZ` | -2π to 2π | 0→π | **Left/right tilt** — leaning sideways | Rotates in Y-Z plane. These 3 spatial rotations behave like familiar 3D object rotation |
| `rot4dXW` | -2 to 2 | 0→π | **Portal opening — reveals the 4th dimension** | `rotateXW()` mixes X and W axes. What was "invisible" in the W direction slides into the X (horizontal) view. This is THE signature VIB3+ effect — structure that didn't exist in 3D view materializes |
| `rot4dYW` | -2 to 2 | 0→π | **Vertical 4D fold — geometry flips inside-out** | Y-W plane rotation. Structures fold vertically into hyperspace. Combined with CSS perspective tilt = natural card-flip into the 4th dimension |
| `rot4dZW` | -2 to 2 | 0→π | **Depth 4D fold — things behind appear in front** | Z-W rotation. Reverses the apparent depth ordering from a 4D perspective. Creates uncanny "impossible space" effects |

**Combined rotation effects:**

| Combination | Visual Effect |
|-------------|--------------|
| XW + YW + ZW simultaneously | **Tumbling through hyperspace** — no stable 3D reference frame, full 4D exploration |
| XY fixed at 0, XW/YW/ZW animated | **"Flying through" a fixed plane** — screen orientation stable, 4D content streams past **(PREMIUM: requires axis locking)** |
| XW tied to CSS rotateY | **Portal card-flip** — physical card tilt directly maps to 4D revelation **(PREMIUM: requires CSSBridge)** |
| All 6 at different speeds | **Hyperspace kaleidoscope** — every view is unique, endlessly evolving |

**Critical note on range**: The 4D rotations (XW/YW/ZW) are limited to -2 to 2 radians (~-115° to 115°) while 3D rotations go full -2π to 2π. This is intentional — small 4D rotations produce dramatic visual change. Going beyond 2 radians wraps around and loses the "portal" metaphor.

### Geometry Parameter

| Parameter | Range | Sweep | Physical Meaning |
|-----------|-------|-------|-----------------|
| `geometry` | 0–23 | n→n | **Select the shape of reality** |

The 24 geometries encode: `index = coreWarp * 8 + baseShape`

**8 Base Shapes** (what the lattice pattern looks like):

| Index | Shape | What It Looks Like | Best For |
|-------|-------|-------------------|----------|
| 0 | Tetrahedron | Triangular crystalline lattice | Sharp, aggressive, mineral |
| 1 | Hypercube | Cubic grid with edge wireframes | Architectural, digital, structured |
| 2 | Sphere | Concentric shells with angular harmonics | Organic, planetary, breathing |
| 3 | Torus | Donut-shaped with lattice overlay | Portals, cycles, continuous flow |
| 4 | Klein Bottle | Angular lattice using all 4 coordinates | Impossible geometry, mathematical art |
| 5 | Fractal | Recursive `fract(p*2-1)` Menger-like holes | Infinite detail, cosmic, zooming |
| 6 | Wave | Triple sine interference pattern | Fluid, musical, oscillating |
| 7 | Crystal | Octahedral max-norm faceting | Gem-like, hard-edged, precious |

**3 Core Warps** (how the shape exists in 4D):

| Warp | Geometry Range | What It Does |
|------|---------------|-------------|
| Base (0) | 0–7 | No 4D warp. Clean 3D lattice. Simplest, most readable |
| Hypersphere (1) | 8–15 | Projects through S³ (3-sphere). W = `sin(radius * freq + time)`. Creates breathing, organic 4D motion. The most "alive" looking warp |
| Hypertetrahedron (2) | 16–23 | 4 pentatope basis vectors create interference in W. Pentatope plane-proximity masking adds geometric cutouts. The most "alien" and complex warp |

**Geometry transitions**: The `geometry` uniform is a float. Animating between geometries (e.g., 0→1 over 500ms) creates a glitch-morph during the fractional period as `int(geometry)` jumps between lattice functions. This is an intentional aesthetic — not a bug.

### Premium Parameters (not yet in SDK)

| Parameter | Range | Visual Meaning | Implementation |
|-----------|-------|---------------|----------------|
| `projectionType` | 0/1/2 | Perspective / Stereographic / Orthographic projection | **(PREMIUM)** Currently only perspective exists. Stereographic preserves angles (conformal), orthographic drops W entirely |
| `uvScale` | 1–8 | Zoom level into the 4D lattice. Lower = zoomed in, fewer features visible. Higher = zoomed out, denser pattern | **(PREMIUM)** Currently hardcoded at 3.0 in all shaders as `uv * 3.0` |
| `lineThickness` | 0.005–0.15 | Wire thickness in lattice rendering. Thin = delicate, thick = bold | **(PREMIUM)** Smoothstep threshold in geometry functions, currently hardcoded at ~0.03 |
| `breathStrength` | 0–1 | How much the VitalitySystem 6-second sine cycle modulates intensity | **(PREMIUM)** Currently hardcoded: 0.3 (Faceted), 0.4 (Quantum), 0.5 (Holographic projection) |
| `autoRotationSpeed` | 0–0.5 per axis | Holographic auto-rotation speed per axis | **(PREMIUM)** Currently hardcoded: XY=0.1, XZ=0.12, YZ=0.08, XW=0.2, YW=0.15, ZW=0.25 |
| `particleSize` | 0.02–0.5 | Quantum system particle dot size | **(PREMIUM)** Currently hardcoded: 0.2 (shadow/content), 0.1 (highlight) |
| `layerAlpha` | 0–1 per layer | Per-layer transparency override | **(PREMIUM)** Currently hardcoded: 0.6/0.4/1.0/0.8/0.3 (bg/shadow/content/highlight/accent) |

---

## B. Multi-Layer Coordination Patterns

VIB3+ renders to 5 stacked canvases: **background, shadow, content, highlight, accent**. The LayerRelationshipGraph designates one layer as the **keystone** (driver) and derives all other layers through relationship functions.

The magic is NOT that each layer has different parameters — it's that the COORDINATED DIFFERENCE between layers creates physical illusions of depth, weight, motion, and space.

### Pattern 1: Card Lift-Off

**What it looks like**: A dense geometric card gradually becomes sparse and light, appearing to float upward from its surface. A cast shadow grows beneath it, anchoring the spatial illusion.

**Free tier** (uses existing LayerRelationshipGraph API):

```javascript
// Setup: holographic profile, content as keystone
engine.activeSystem.loadRelationshipProfile('holographic');

// The sweep: content density drops (lifts), shadow echoes with higher density (grows)
const animator = new TransitionAnimator(engine.createParameterCallback());

animator.sequence([
    {
        params: { gridDensity: 14, morphFactor: 0.5 },
        duration: 600,
        easing: 'easeOutQuad'
    },
    {
        params: { gridDensity: 28, morphFactor: 0.8 },
        duration: 800,
        easing: 'easeOut'
    }
]);
```

**What happens per layer** (via holographic profile relationships):
- **Content** (keystone): gridDensity 40→14 (sparse, lifts), morphFactor 1.0→0.5 (shrinks)
- **Shadow** (echo, densityScale 0.5): gridDensity derived 20→7 (ALSO sparse, but the CSS translateY offset makes it look like a growing distance between card and shadow)
- **Background** (complement): intensity inverts — as content dims via lower morph, background dims too creating "spotlight on the card"
- **Highlight** (harmonic): appears at golden-angle hue offset (220° + 137.5° = 357.5°), density at 2x harmonic

**CSS coordination** (for full spatial illusion):
```css
/* Shadow canvas positioned below content with growing offset */
.shadow-layer {
    transform: translateY(8px) scale(1.05);
    filter: blur(4px);
    opacity: 0.6;
    transition: transform 600ms ease-out, opacity 600ms ease-out;
}
.shadow-layer.lifted {
    transform: translateY(16px) scale(1.12);
    opacity: 0.8;
}
```

### Pattern 2: Portal Opening

**What it looks like**: A card tips to one side, and as it tilts, the VIB3+ visualization within it rotates in 4D — revealing geometry that wasn't visible from the flat view. The tilt IS the portal. The background shifts slowly in sympathy, creating parallax depth.

**Premium tier** (requires axis locking + CSSBridge):

```javascript
import { enablePremium } from '@vib3code/premium';

const premium = enablePremium(engine, { licenseKey });

// Lock 3D rotations so the card stays "flat" — only 4D rotates
premium.rotationLock.lockAxis('rot4dXY', 0);
premium.rotationLock.lockAxis('rot4dXZ', 0);
premium.rotationLock.lockAxis('rot4dYZ', 0);

// CSSBridge: shader state drives CSS transform
premium.cssBridge.start({
    target: document.querySelector('.card'),
    parameters: ['rot4dXW'],
    throttle: 16
});

// Now CSS can sync card tilt to 4D rotation:
// .card { transform: perspective(800px) rotateY(calc(var(--vib3-rot4dXW) * 15deg)); }

// Animate XW to open the portal
animator.transition({ rot4dXW: 0.9 }, 1200, 'easeInOut');
```

**What happens per layer:**
- **Content** (keystone): rot4dXW 0→0.9, other rotations LOCKED at 0
- **Shadow** (mirror): rot4dXW INVERTS → -0.9. Creates a "mirror portal" beneath
- **Background** (chase, lerpRate 0.1): rot4dXW slowly follows to ~0.3 by the time content reaches 0.9. This lag creates **parallax depth** — background moves slower than foreground
- **Highlight** (harmonic): hue shifts by golden angle, density at integer multiple — crystalline shimmer at portal edges

### Pattern 3: Explosion → Settle

**What it looks like**: Chaos spikes instantly — the geometry shatters into noise. Reactive layers amplify the shockwave. Then everything gradually settles back as the reactive relationships decay.

**Premium tier** (requires VisualEventSystem):

```javascript
// Setup: storm profile for maximum reactive gain
engine.activeSystem.loadRelationshipProfile('storm');

// Event trigger: when chaos exceeds 0.7, layer profile switches to storm for 2s
premium.events.addTrigger('chaos_explosion', {
    source: 'parameter.chaos',
    condition: 'exceeds',
    threshold: 0.7,
    cooldown: 3000,
    action: {
        type: 'layer_profile',
        value: 'storm',
        duration: 2000,
        revertTo: 'holographic'
    }
});

// The explosion
animator.sequence([
    { params: { chaos: 0.9, speed: 2.5 }, duration: 150, easing: 'easeOut' },
    { params: { chaos: 0.1, speed: 0.6 }, duration: 2000, easing: 'easeInOut' }
]);
```

**What happens per layer** (storm profile — all reactive):
- **Content** (keystone): chaos 0→0.9 spike, speed↑
- **Shadow** (reactive, gain 1.5): amplifies chaos delta → goes to ~1.35 momentarily (clamped to 1.0). Expanding shockwave
- **Highlight** (reactive, gain 2.5): amplifies MORE → extremely bright flash
- **Accent** (reactive, gain 4.0): maximum amplification → the "shrapnel" that flies furthest
- **Background** (reactive, gain 1.0): 1:1 with keystone — the world itself shakes

After the spike, all reactive layers DECAY back toward keystone as the `accumulatedDelta` diminishes (decay parameter in reactive config). Content returns to 0.1 chaos over 2s; reactive layers overshoot and oscillate down.

### Pattern 4: Breathing Card

**What it looks like**: A gentle, organic pulse — the geometry subtly inflates and deflates like breathing. The shadow breathes too, but softer. A highlight shimmers on each "inhale" peak.

**Free tier**:

```javascript
// Profile: holographic (echo shadow, harmonic highlight)
engine.activeSystem.loadRelationshipProfile('holographic');

// Create a breathing timeline (independent of VitalitySystem breath)
const timeline = new ParameterTimeline(engine.createParameterCallback(), {
    bpm: 15,  // 4-second breath cycle
    loop: true
});

timeline.addTrack('morphFactor', [
    { time: 0, value: 0.6 },
    { time: 0.5, value: 1.4, easing: 'sineInOut' },
    { time: 1.0, value: 0.6, easing: 'sineInOut' }
]);

timeline.play();
```

**Per layer:**
- **Content** (keystone): morphFactor oscillates 0.6↔1.4 (4s period, sine)
- **Shadow** (echo, 0.4x intensity): morphFactor echo'd at 0.24↔0.56 — visible but subtle pulse
- **Highlight** (harmonic, densityHarmonic 2): density at 2x → dense sparkle on morph peaks, hue shifted by golden angle
- **Background** (complement): morph inverted around pivot → COUNTER-breathes (exhales when content inhales). Creates depth oscillation

### Pattern 5: Geometry Cascade (Premium)

**What it looks like**: Each layer renders a DIFFERENT geometry. Content shows Hypercube (1), shadow shows its hypertetra warp variant (17), background shows its hypersphere variant (9). As the content geometry changes, other layers follow — but the background is on a delay, creating a visual "trail" of previous geometries.

**Premium tier** (requires per-layer geometry):

```javascript
// Per-layer geometry assignment
premium.layerGeometry.setLayerGeometry('content', 1);    // Hypercube base
premium.layerGeometry.setLayerGeometry('shadow', 17);     // Hypertetra Hypercube
premium.layerGeometry.setLayerGeometry('background', 9);  // Hypersphere Hypercube
premium.layerGeometry.setLayerGeometry('highlight', 1);   // Same as content
premium.layerGeometry.setLayerGeometry('accent', 17);     // Same as shadow

// Background on slow chase (geometry transitions slowly)
engine.activeSystem.layerGraph.setRelationship('background', 'chase', {
    lerpRate: 0.05  // Very slow follow
});

// When content geometry changes, background lerps slowly toward it
// creating a visual history / trail effect
```

---

## C. Shape-Breaking via CSS Occlusion

VIB3+ canvases are rectangular by default. But a showcase demo should NEVER look like a rectangle on a page. CSS layers OVER and AROUND the canvas break the form.

### Technique 1: Card Mask

The simplest and most common. Canvas container has rounded corners and hidden overflow.

```html
<div class="vib3-card">
    <canvas id="vib3-content"></canvas>
    <!-- Additional layer canvases stacked absolutely -->
</div>
```

```css
.vib3-card {
    width: 400px;
    height: 260px;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

The `box-shadow` is CSS (not a shader layer). The shader's shadow layer handles INTRA-visualization depth. CSS handles INTER-element depth on the page.

### Technique 2: Text Cutout

Large typography where VIB3+ shaders show through the letter forms.

```css
.vib3-text-cutout {
    position: relative;
    font-size: 120px;
    font-weight: 900;
    background: black;
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
}
/* Canvas positioned behind the text element */
.vib3-text-cutout canvas {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: -1;
}
```

Alternative approach using `mix-blend-mode`:
```css
.text-overlay {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: black;
    color: white;
    font-size: 120px;
    mix-blend-mode: multiply;
    /* White text becomes transparent against the canvas below */
    /* Black background blocks the canvas */
}
```

### Technique 3: Organic Blob Mask

SVG clip-path with animated curves. The blob shape can be driven by VIB3+ parameters **(PREMIUM: via CSSBridge)**.

```html
<svg width="0" height="0">
    <defs>
        <clipPath id="blob" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0 C0.8,0 1,0.2 1,0.5 C1,0.8 0.8,1 0.5,1 C0.2,1 0,0.8 0,0.5 C0,0.2 0.2,0 0.5,0Z" />
        </clipPath>
    </defs>
</svg>

<div class="vib3-blob" style="clip-path: url(#blob);">
    <canvas id="vib3-canvas"></canvas>
</div>
```

**Premium**: With CSSBridge, the blob shape can morph in response to `chaos`:
```css
/* --vib3-chaos drives the blob's border-radius via CSSBridge */
.vib3-blob {
    border-radius: calc(30% + var(--vib3-chaos, 0) * 20%);
}
```

### Technique 4: Negative Space Layout

Dark panels with polygon cutouts revealing the visualizer.

```css
.vib3-negative-space {
    position: relative;
    background: #0a0a0a;
}
.vib3-negative-space::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: #0a0a0a;
    clip-path: polygon(
        0% 0%, 100% 0%, 100% 100%, 0% 100%,    /* outer rect */
        10% 15%, 10% 85%, 60% 85%, 60% 15%      /* inner cutout */
    );
    pointer-events: none;
    z-index: 10;
}
```

Multiple cutouts on one page, each showing different layer configurations.

### Technique 5: Parallax Stack

Multiple canvas containers at different z-depths using CSS `perspective` + `translateZ`.

```css
.parallax-container {
    perspective: 1000px;
    perspective-origin: 50% 50%;
}
.vib3-layer-bg {
    transform: translateZ(-200px) scale(1.4);
    /* Further back, scaled up to compensate, moves slower on scroll */
}
.vib3-layer-content {
    transform: translateZ(0);
    /* At the default plane */
}
.vib3-layer-highlight {
    transform: translateZ(100px) scale(0.9);
    /* Closer, moves faster, creates depth pop */
}
```

This creates REAL parallax (not just offset tricks) when combined with scroll or mouse-driven perspective-origin changes.

---

## D. Fully-Specified Choreography: "Card Lifts and Reveals Portal"

A 5-second visual event specified at the parameter level. This is what an agent would generate and what a ChoreographyPlayer would execute.

### Setup

```javascript
const choreography = {
    name: 'Card Lifts and Reveals Portal',
    duration: 5000,
    initial: {
        system: 'holographic',
        geometry: 16,  // Hypertetra + Tetrahedron
        layer_profile: 'holographic',
        params: {
            gridDensity: 40,
            morphFactor: 1.0,
            rot4dXW: 0, rot4dXY: 0, rot4dXZ: 0, rot4dYZ: 0,
            rot4dYW: 0, rot4dZW: 0,
            chaos: 0.1,
            intensity: 0.7,
            hue: 220,
            saturation: 0.85,
            speed: 0.8,
            dimension: 3.5
        }
    },
    scenes: [/* see below */]
};
```

### Timeline

#### T=0ms: Resting State

All parameters at initial values. Content layer renders geometry 16 (hypertetra tetrahedron) with medium density (40), full morph (1.0), no rotation. CSS card is flat: `transform: perspective(800px) rotateX(0) rotateY(0)`.

**Per-layer state** (holographic profile):
| Layer | Relationship | Derived gridDensity | Derived intensity | Derived hue |
|-------|-------------|--------------------|--------------------|-------------|
| background | echo(0.3, 0.5, 0.3, 0.4) | 20 | 0.28 | 220 |
| shadow | complement | ~40 (inverted around pivot) | ~0.3 (inverted) | 40 (+180°) |
| content | keystone | 40 | 0.7 | 220 |
| highlight | harmonic(2, 0.5, golden) | 80 (2x harmonic) | ~0.7 | 357.5 (+137.5°) |
| accent | reactive(2.0, 0.85) | 40 (no delta yet) | 0.7 | 220 |

#### T=0–600ms: The Lift

**TransitionAnimator step 1** — easing: `easeOutQuad`

| Parameter | Start | End | Easing |
|-----------|-------|-----|--------|
| `gridDensity` | 40 | 14 | easeOutQuad |
| `morphFactor` | 1.0 | 0.5 | easeOutQuad |
| `rot4dXW` | 0 | 0.4 | easeOutQuad |
| `intensity` | 0.7 | 0.8 | linear |

**Per-layer derived values at T=600ms:**
| Layer | gridDensity | intensity | hue | Notes |
|-------|------------|-----------|-----|-------|
| background | 7 (echo 0.5x) | 0.32 | 220 | Dimmed, sparse |
| shadow | ~62 (complement inverted) | ~0.2 | 40 | Denser than content — the "surface left behind" |
| content | 14 | 0.8 | 220 | Sparse, bright — lifted |
| highlight | 28 (harmonic 2x) | 0.8 | 357.5 | Visible shimmer |
| accent | ~14 + small reactive delta | ~0.8 | 220 | Slight overshoot from reactive tracking |

**CSS at T=600ms:**
```css
.card { transform: perspective(800px) rotateY(6deg); }
.shadow-layer { transform: translateY(10px) scale(1.08); opacity: 0.75; }
```

**(PREMIUM)**: CSSBridge auto-sets `--vib3-rot4dXW: 0.4` on the card element. CSS reads it:
```css
.card { transform: perspective(800px) rotateY(calc(var(--vib3-rot4dXW) * 15deg)); }
/* At 0.4: rotateY(6deg) */
```

#### T=600–1200ms: The Portal Opens

**TransitionAnimator step 2** — easing: `easeInOut`

| Parameter | Start | End | Easing |
|-----------|-------|-----|--------|
| `rot4dXW` | 0.4 | 0.9 | easeInOut |
| `hue` | 220 | 260 | linear |
| `chaos` | 0.1 | 0.15 | linear |

**(PREMIUM)** rot4dXY, rot4dXZ, rot4dYZ all LOCKED at 0 via RotationLockSystem. Without locking, the screen-plane orientation would drift.

**Per-layer derived values at T=1200ms:**
| Layer | rot4dXW | Notes |
|-------|---------|-------|
| background (chase 0.1) | ~0.45 | Still catching up — parallax! |
| shadow (mirror) | -0.9 | Inverted — mirror portal |
| content (keystone) | 0.9 | Deep into 4D |
| highlight (harmonic) | 0.9 | Same rotation, golden-angle hue |
| accent (reactive, gain 2.0) | ~1.3 (clamped) | Overshooting the XW rotation delta |

**CSS at T=1200ms:**
```css
.card { transform: perspective(800px) rotateY(13.5deg); }
/* Card is visibly tilted — the portal metaphor is physical */
```

#### T=1200–2000ms: Settle

**TransitionAnimator step 3** — compound easing

| Parameter | Start | End | Easing |
|-----------|-------|-----|--------|
| `gridDensity` | 14 | 28 | easeOut |
| `morphFactor` | 0.5 | 0.8 | easeOut |
| `rot4dXW` | 0.9 | 0.5 | easeInQuad |
| `hue` | 260 | 240 | linear |
| `chaos` | 0.15 | 0.05 | easeOut |

Chase relationships lerp toward keystone over 800ms. Accent reactive decays naturally (`gain * decay^frames`, decay=0.85).

**CSS at T=2000ms:**
```css
.card { transform: perspective(800px) rotateY(7.5deg); }
.shadow-layer { transform: translateY(6px) scale(1.04); opacity: 0.65; }
```

#### T=2000–5000ms: Ambient Hold

Content breathes via VitalitySystem (6-second sine cycle on intensity). Speed drops 0.8→0.5 (calming). Chaos settles to 0.05. Shadow chase lerpRate drops to 0.02 (near-frozen, stabilized depth).

This is the "landing state" — the card has lifted, partially opened a portal, and now rests in a slightly elevated, gently breathing position. The portal remains partially open (rot4dXW=0.5) revealing 4D structure.

---

## E. What the Gold Standard Demo Page Must Include

A gold standard demo HTML page should:

1. **Multiple VIB3+ canvases** — not one. At minimum: a card (masked, 400×260), a background (full-bleed, low intensity), and possibly a text-cutout header
2. **CSS occlusion** — at least 2 techniques (card mask + text cutout or negative space)
3. **Choreographed events** — not random drift. Specific parameter sweeps with specific easing, triggered by scroll, click, or timer
4. **Layer coordination visible** — shadow offset that grows/shrinks, highlight that appears/disappears, background that dims/brightens in response to content changes
5. **Physical metaphors** — density = weight, 4D rotation = portal, morph = breathing. The parameters are doing something an observer can name
6. **Audio-reactive section** — at least one section where audio input drives parameters meaningfully (bass→density, high→hue, not just "everything pulses")
7. **Free vs Premium markers** — clearly indicate which effects require `@vib3code/premium`

---

*VIB3+ SDK — Clear Seas Solutions LLC*
*Gold Standard Specification v1.0 — Feb 16, 2026*
