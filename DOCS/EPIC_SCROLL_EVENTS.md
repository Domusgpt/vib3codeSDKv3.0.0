Last reviewed: 2026-02-17

# EPIC SCROLL EVENTS — VIB3+ Landing Page Choreography Plan

**20 scroll-driven events that combine GSAP, GPU visualizers, CSS effects, and masking layers
into a cinematic experience that showcases the VIB3+ 4D visualization engine.**

---

## Architecture Principles

### GPU Context Budget (Max 3 Concurrent)
- Sections with GPU visualizers: Opening, Hero, Morph, Playground, Energy Card
- Post-playground sections use Canvas2D (enhanced) or CSS effects
- Smart context swapping: release before acquire, flash-mask handoffs

### Parameter Coordination Rules
- **Density** drops as visual elements expand (inverse relationship)
- **Speed/chaos** rise during dramatic moments, settle in calm phases
- **Rotations** accumulate continuously for organic motion
- **Hue** follows emotional arcs (cool -> warm -> spectral -> calm)

### Layering System
```
z-index stack:
  70+ .... Fixed veils / flourishes (brief, over everything)
  60  .... Section transition overlays
  50  .... Foreground glassmorphic cards
  30  .... Content text / UI elements
  20  .... Masking/clipping layers (CSS clip-path driven by GSAP)
  10  .... Canvas visualizers (GPU or Canvas2D)
  1   .... Background gradients
  -1  .... Fixed ambient layer
```

### CSS Effects Toolkit
- `clip-path` morphing: polygon/circle/ellipse driven by scroll progress
- `backdrop-filter` intensity ramping with scroll
- `mix-blend-mode` (screen, overlay, difference) for layer compositing
- CSS `@property` animated gradients (conic, radial) for glow effects
- `mask-image` with animated gradients for soft reveal edges
- `filter: hue-rotate()` synced to visualizer hue parameter
- 3D transforms with `perspective-origin` tracking scroll position

---

## THE 20 EVENTS

---

### EVENT 1: Checker Grid Emergence
**Section**: Post-playground, replaces current triptych
**Duration**: 300vh scroll

**Concept**: A 4x3 grid of glassmorphic cards enters from alternating directions —
odd rows from left, even rows from right — then the cards do a geometric dance:
shrinking, rotating, and rearranging into a diamond pattern centered around a
Hypersphere-class visualizer that reveals through the negative space.

**Implementation**:
```
Phase A (0-30%): Cards stagger-enter from alternating edges
  - GSAP stagger with from:'edges', axis:'y'
  - Each card: opacity 0->1, x: +-120vw -> 0, rotation: +-15deg -> 0
  - Cards have backdrop-filter: blur(16px) + subtle visualizer Canvas2D

Phase B (30-60%): Geometric dance
  - Cards shrink (scale 0.85) and rotate (15deg) creating diamond gaps
  - Background GPU visualizer (Quantum, geometry:10 Hypersphere) fades in
  - clip-path on a mask layer morphs from rect -> diamond -> circle
  - Density sweeps from 4 to 60 as the diamond opens

Phase C (60-100%): Fractal layering
  - Cards layer on top of each other with z-stagger
  - Each subsequent card has +2px more blur
  - Creates "glassmorphic fractal depth" effect
  - Visualizer params: chaos ramps 0.1->0.8, speed 0.5->2.5
  - Cards finally compress to one stacked card, then expand to fill viewport
```

**Parameters animated**: geometry (3->10), gridDensity (4->60->24), chaos (0.1->0.8->0.1),
speed (0.5->2.5->0.8), hue (200->310->180), rot4dXW (0->4pi)

---

### EVENT 2: Density Wave Collision
**Section**: Within cascade or as standalone section
**Duration**: 200vh scroll

**Concept**: Two side-by-side visualizer panels with opposing density sweeps.
Left panel: density sweeps 4->80. Right panel: density sweeps 80->4.
When they "meet" at midpoint (both at ~42), the dividing line shatters,
both canvases merge into one full-width canvas with a 300ms flourish of
maximum chaos + speed, then settle into a new calm state.

**Implementation**:
```
Phase A (0-45%): Opposing sweeps
  - Split-screen: left panel density 4->42, right panel 80->42
  - Speed inversely matched: left 0.5->1.5, right 1.5->0.5
  - Divider line (1px -> 4px) glows brighter as densities converge
  - Hue: left cool (195->230), right warm (340->300)

Phase B (45-55%): COLLISION — The "Woah" Moment
  - Divider shatters: pseudo-element fragments fly outward (GSAP)
  - Both panels merge: clip-path transitions from split to full
  - 300ms burst: chaos=1.0, speed=3.0, gridDensity=80, intensity=1.0
  - All 6 rotation planes animate simultaneously (tornado)
  - Screen flash (opacity pulse white->transparent, 100ms)
  - Camera shake: parent container translateX/Y oscillation (3 cycles, damped)

Phase C (55-100%): Resolution
  - Merged canvas settles: chaos 1.0->0.08, speed 3.0->0.5
  - Geometry morphs through 3 types rapidly then lands on Crystal (7)
  - Density settles to 28, hue to a warm golden (45)
  - Gentle rotation continues: rot4dXW accumulates slowly
```

---

### EVENT 3: Canvas Spill Through Cards
**Section**: Any section with foreground cards over background visualizer
**Duration**: 150vh scroll

**Concept**: Background visualizer appears to "spill" through the borders of
foreground glassmorphic cards. Achieved with CSS mask-image on the cards that
progressively reveals the background through animated clip paths shaped like
liquid blobs.

**Implementation**:
```
- Background: Full-viewport GPU visualizer (or Canvas2D)
- Foreground: 3-4 glassmorphic info cards
- Each card has a CSS mask-image: radial-gradient that expands on scroll
- The mask creates "liquid blob" holes that show the visualizer through the card
- As scroll progresses: blobs grow, merge, eventually card is 80% transparent
- Visualizer intensity increases proportionally to reveal area
- Card content (text) remains visible via a separate solid-backed inner div
- The "spill" follows a flow direction (top-left to bottom-right)

CSS trick:
  .spill-card {
    mask-image: radial-gradient(
      circle var(--spill-radius) at var(--spill-x) var(--spill-y),
      transparent 0%, black 100%
    );
  }
  // GSAP animates --spill-radius, --spill-x, --spill-y per card
```

---

### EVENT 4: Scroll Velocity Burst
**Section**: Global — triggers on fast scrolling anywhere
**Duration**: Instantaneous (500ms decay)

**Concept**: When the user scrolls fast, ALL visible visualizers
simultaneously burst into high-chaos, high-speed mode, then decay
back to their normal state. Creates a "wind through the page" feeling.

**Implementation**:
```
- Track scroll velocity: delta/time from Lenis or ScrollTrigger
- When velocity > threshold (2000px/s):
  - All visible adapters get temporary overrides:
    chaos: +0.4, speed: *2.0, intensity: +0.15
  - CSS: ambient-bg opacity pulses, noise-overlay intensity spikes
  - Scroll progress bar briefly brightens (glow effect)
  - Any glassmorphic cards get a brief blur-increase + scale(1.02)
- Decay: exponential ease-out over 500ms back to normal values
- Cooldown: 1s between triggers to prevent spam
```

---

### EVENT 5: Parallax Depth Reveal
**Section**: Replaces current triptych center column
**Duration**: 200vh scroll

**Concept**: Multiple layers at different z-depths separate on scroll,
revealing a deeper visualizer canvas underneath each layer. Like looking
through the pages of a book as they fan apart.

**Implementation**:
```
- 5 layers stacked at z=0 initially:
  Layer 1 (front): Glassmorphic panel with system name + icon
  Layer 2: Semi-transparent gradient with faint grid pattern
  Layer 3: Canvas2D visualizer (low intensity, geometry:7 Crystal)
  Layer 4: Second gradient layer with different angle
  Layer 5 (back): Full visualizer canvas (bright, geometry:10 Hypersphere)

- On scroll:
  Layer 1: translateZ(200px) + translateY(-30%), opacity 1->0
  Layer 2: translateZ(100px) + translateY(-15%), opacity reduces
  Layer 3: stays center, intensity 0.3->0.8
  Layer 4: translateZ(-50px), fades out
  Layer 5: translateZ(-100px), revealed at full intensity

- Each layer has its own subtle parallax rate
- Perspective origin tracks mouse for extra 3D feel
```

---

### EVENT 6: Phase Shift Bridge
**Section**: Between any two major sections
**Duration**: 100vh scroll

**Concept**: The current section's visualizer slowly builds structure
(density increases, speed decreases, chaos approaches zero) until it
reaches "crystalline perfection" — then SNAP — a sudden phase shift
where all parameters invert and the next section begins in "chaos birth"
before settling into its own personality.

**Implementation**:
```
Phase A (0-70%): Slow structure build
  - gridDensity: current -> 60 (slow, linear)
  - speed: current -> 0.1
  - chaos: current -> 0.01
  - intensity: gradually increases to 0.95
  - rot4dXW slows to near-zero
  - Hue slowly converges to pure white/zero-saturation

Phase B (70-75%): THE SNAP (250ms equivalent in scroll)
  - Instant parameter inversion:
    gridDensity: 60 -> 3, speed: 0.1 -> 3.0, chaos: 0.01 -> 0.9
  - Screen flash: white overlay 0->0.3->0 in 80ms
  - CSS: all glass cards get a brief scale(1.05) with elastic-out
  - Sound cue potential (not implemented, but designed for)

Phase C (75-100%): Chaos settles
  - New section's parameters ease in with elastic/spring curves
  - Like a bell that was struck — oscillating damped convergence
  - Hue overshoots target by 40deg then settles
  - Density overshoots then settles
  - Creates organic "alive" feeling
```

---

### EVENT 7: Glassmorphic Card Stack Dive
**Section**: Info section (Agent Integration or new)
**Duration**: 250vh scroll

**Concept**: 6 glassmorphic cards stack from the top of the viewport,
each one slightly larger and more blurred than the last, creating a
"diving deeper" effect. Each card contains different SDK info (MCP, React,
Vue, etc.) and when a card reaches center-screen, it expands and a
mini Canvas2D visualizer activates inside it showing relevant geometry.

**Implementation**:
```
- 6 cards initially off-screen above
- As user scrolls, each card slides down and stacks:
  Card 1: smallest (280px), blur(8px), geometry:0 Tetra, opacity 0.6
  Card 2: (320px), blur(12px), geometry:1 Hypercube, opacity 0.65
  ...
  Card 6: largest (480px), blur(24px), geometry:5 Fractal, opacity 0.8

- Active card (center viewport): expands to 90vw, blur reduces to 0
  - Canvas2D visualizer activates with relevant geometry
  - Card border glows with system color (quantum/holo/faceted)
  - Content fully readable

- Inactive cards: compressed at top/bottom, heavily blurred
- Creates a "deck of cards" browsing metaphor
- Scroll position maps to which card is active (snap-like behavior)
```

---

### EVENT 8: Rotation Tornado
**Section**: Dramatic transition moment (morph stage 5 enhanced)
**Duration**: 80vh scroll (brief, intense)

**Concept**: All 6 rotation planes animate simultaneously at different
speeds, creating a visual tornado effect. The visualizer canvas shakes
and pulses while glassmorphic elements orbit around it.

**Implementation**:
```
- rot4dXY: p * 12 (fast)
- rot4dXZ: p * 8 (medium)
- rot4dYZ: p * 6 (slower)
- rot4dXW: p * 16 (fastest — hyperspace)
- rot4dYW: sin(p * PI * 6) * 4 (oscillating)
- rot4dZW: cos(p * PI * 4) * 3 (oscillating, offset)

- Canvas container gets CSS animation: subtle rotation + scale oscillation
- 4 small glassmorphic "debris" elements orbit the canvas via GSAP motionPath
- Background ambient layer pulses in sync
- Speed ramps: 0.5 -> 3.0 -> 0.5
- Chaos ramps: 0.1 -> 0.9 -> 0.1
- Intensity stays high: 0.8-1.0

- Exit: everything decelerates with heavy easing (power4.out)
```

---

### EVENT 9: Expanding Info Cards with Visualizer Fill
**Section**: New section replacing static agent grid
**Duration**: 300vh scroll

**Concept**: Compact info cards (like the current agent cards) that expand
on scroll to reveal a full Canvas2D visualizer background. When collapsed,
they show just an icon + title. When expanded, the card becomes a
full-featured showcase with live visualization + description text.

**Implementation**:
```
- 4 cards in 2x2 grid, initially compact (200x120px)
- Each card has a hidden Canvas2D visualizer covering its full area

- Scroll triggers sequential expansion:
  Card 1 expands (0-25%): width 200->90vw, height 120->60vh
    - Visualizer fades in (opacity 0->0.6 behind content)
    - Content text slides in from bottom
    - Adjacent cards slide out of way (translateX/Y)

  Card 1 contracts, Card 2 expands (25-50%)...etc.

- Each card has different system:
  Card 1: Quantum, geometry:11 (Hypersphere Torus), hue:210
  Card 2: Faceted, geometry:16 (HT-Tetra), hue:310
  Card 3: Holographic, geometry:7 (Crystal), hue:45
  Card 4: Quantum, geometry:5 (Fractal), hue:160

- Expanded card params animate:
  gridDensity sweeps, rotation accumulates, hue shifts
```

---

### EVENT 10: Chromatic Hue Wave
**Section**: Global overlay effect during specific scroll ranges
**Duration**: 150vh scroll

**Concept**: A chromatic wave sweeps across the page — all visible
visualizers have their hue parameter swept in a wave pattern with
a phase offset based on vertical position. Creates a "rainbow washing
over the page" effect.

**Implementation**:
```
- Track scroll progress in a specific section
- For each visible Canvas2D/GPU adapter:
  - Calculate phase offset based on element's Y position
  - Hue = baseHue + sin(progress * PI * 2 - phaseOffset) * 180
  - This creates a traveling wave of color change

- CSS accompaniment:
  - ambient-bg gradient hues shift in sync
  - Scroll progress bar color changes
  - Glassmorphic card borders get hue-rotate() filter

- Duration: sweeps across over ~150vh of scroll
- Clean entry/exit: hue offsets ease in from 0 and ease back to 0
```

---

### EVENT 11: Dual Canvas Lock & Diverge
**Section**: New dramatic section
**Duration**: 200vh scroll

**Concept**: Two visualizer canvases (left/right split) start with
completely different settings. Over scroll, their parameters converge
to identical values (the "lock"). Hold for a beat. Then they diverge
explosively in opposite directions.

**Implementation**:
```
Phase A (0-40%): Convergence
  Left:  geometry 3->7, hue 200->180, density 40->24, speed 0.3->0.6
  Right: geometry 7->7, hue 340->180, density 8->24, speed 1.5->0.6
  - Divider line between them brightens as they converge
  - Both rotations align to same values

Phase B (40-55%): THE LOCK
  - Both canvases perfectly synchronized
  - Divider line pulses bright cyan
  - Brief scale(1.02) on both containers
  - A shared glow effect appears at the divider
  - Parameters held steady — creates tension through stillness

Phase C (55-100%): Explosive Divergence
  Left:  geometry->5(Fractal), hue->60(gold), density->80, speed->2.5, chaos->0.7
  Right: geometry->4(Klein), hue->300(magenta), density->4, speed->0.2, chaos->0.0
  - Divider shatters (pseudo-element animation)
  - Each canvas gets a brief directional blur (left blurs left, right blurs right)
  - Scale: left 1.05 (growing), right 0.95 (shrinking)
  - Creates visual "explosion" from the center
```

---

### EVENT 12: Scroll-Locked Geometry Canon
**Section**: Cascade replacement
**Duration**: 400vh scroll

**Concept**: Like a musical canon/round, the same geometry morphing sequence
plays across 6 cards with time offsets. Card 1 starts the sequence,
Card 2 starts the same sequence 1 beat later, etc. Creates a beautiful
wave of synchronized-but-offset motion.

**Implementation**:
```
- 6 cards in horizontal scroll or stacked layout
- Each card cycles through geometries: 0->3->7->11->16->5->0
- Timing offset: card N starts at progress (N * 0.12)
- Within each card's cycle:
  - Geometry snaps at thresholds
  - Hue, density, speed interpolate smoothly
  - Brief flash on geometry change (card border pulse)

- Phase offsets create a "wave" visible across all cards:
  At any scroll position, each card shows a different geometry
  but they're all part of the same sequence

- Additional: rotation accumulates differently per card
  Card 1: rot4dXW dominates, Card 2: rot4dYW dominates, etc.
  Creates varied visual interest despite same base sequence
```

---

### EVENT 13: Background Bleed Through
**Section**: Any text-heavy section
**Duration**: 100vh scroll

**Concept**: Glassmorphic cards start fully opaque, then progressively
become transparent on scroll, revealing the visualizer background.
The "bleed" follows the text — letters themselves act as windows
into the visualization via CSS text clipping.

**Implementation**:
```
- Text elements get: background-clip: text with visualizer-colored gradient
- Initially: text color is solid white (gradient hidden)
- On scroll: text becomes background-clip:text, revealing gradient through letters
- Simultaneously: card backdrop-filter blur decreases (24px -> 0px)
- Card background alpha decreases: rgba(255,255,255,0.04) -> 0.01
- Creates effect of text "dissolving into" the visualization

CSS:
  .bleed-text {
    background: linear-gradient(
      var(--scroll-angle),
      hsl(var(--scroll-hue), 70%, 60%),
      hsl(calc(var(--scroll-hue) + 60), 60%, 50%)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: rgba(255,255,255, var(--text-opacity));
  }
```

---

### EVENT 14: Speed Crescendo -> Silence
**Section**: Pre-CTA dramatic moment
**Duration**: 150vh scroll

**Concept**: All visible elements gradually accelerate — visualizer speed,
CSS animation durations shorten, parallax rates increase, everything
builds to a frantic peak... then INSTANT SILENCE. Everything freezes.
Brief black screen. Then the CTA section fades in gently from nothing.

**Implementation**:
```
Phase A (0-80%): The Build
  - All visible Canvas2D: speed * (1 + progress * 4)
  - All CSS animations: animation-duration scales down
  - Noise overlay opacity increases (0.02 -> 0.08)
  - Ambient bg pulsation speeds up
  - Any rotating elements spin faster
  - Parallax multiplier increases
  - Screen edges get subtle vignette (closing in)

Phase B (80-85%): THE SILENCE
  - All animation stops (speed = 0, chaos = 0)
  - Screen goes to near-black (ambient-bg opacity -> 0)
  - Noise overlay spikes then drops
  - Everything holds perfectly still
  - 1-2 seconds of pure stillness (in scroll terms)

Phase C (85-100%): Gentle Rebirth
  - CTA content fades in from center (scale 0.9 -> 1, blur 8 -> 0)
  - Single visualizer restarts at low intensity, low speed
  - Clean, calm, contrasted against the chaos that preceded it
  - The "silence" makes the CTA feel important
```

---

### EVENT 15: Masking Layer Morph Reveal
**Section**: Hero -> Morph transition (replaces current veil)
**Duration**: 100vh scroll

**Concept**: Instead of a faint glassmorphic square, a CSS clip-path
on the section container morphs from the hero's shape into the morph's
shape. The clip-path reveals the morph canvas underneath while the hero
canvas is still visible outside the clip.

**Implementation**:
```
- Hero section and Morph section overlap by 100vh
- A clip-path on the morph container morphs:
  circle(0% at 50% 50%)           // start: nothing visible
  circle(10% at 50% 50%)          // small portal opens
  ellipse(30% 20% at 50% 50%)     // stretches
  polygon(25% 10%, 75% 10%, 90% 50%, 75% 90%, 25% 90%, 10% 50%)  // hexagonal
  circle(75% at 50% 50%)          // nearly full
  inset(0%)                       // full viewport

- During clip animation:
  - Edge of clip-path gets a glow effect (drop-shadow on clip container)
  - Morph visualizer starts with high intensity at the reveal edge
  - Hero visualizer accelerates as it's being "consumed"
  - Creates a "portal opening" feeling instead of a vague veil
```

---

### EVENT 16: Tilt-Reactive Particle Grid
**Section**: Cascade cards enhancement
**Duration**: Always active while cards are visible

**Concept**: Each cascade card has a CSS-only particle grid (dots) that
reacts to mouse tilt. The dots closest to the cursor grow, shift color,
and create a "displacement field" effect. The particles complement
the Canvas2D visualizer underneath.

**Implementation**:
```
- Each card gets a pseudo-element grid:
  background: radial-gradient(circle 2px, rgba(0,240,255,0.3) 99%, transparent);
  background-size: 20px 20px;

- CardTiltSystem already tracks mouse position
- CSS custom properties from tilt system drive:
  --tilt-x, --tilt-y -> mask-position of a radial-gradient
  This creates a "lens" effect where dots near cursor appear brighter

- The grid background-size animates with scroll:
  Starts at 30px (sparse) -> 12px (dense) as card becomes active
  Creates "particles condensing" effect

- blend-mode: screen composites the dots over the Canvas2D visualizer
```

---

### EVENT 17: Dimension Warp Gate
**Section**: New standalone 150vh section
**Duration**: 150vh scroll

**Concept**: The 4D `dimension` parameter creates a "wormhole" visual.
A circular portal grows from center screen, edges glow and distort,
and through it you see a completely different visualization (different
system, different parameters). On completion, you've "traveled through"
to the new visual universe.

**Implementation**:
```
- Outer visualizer: Quantum, geometry:7, dimension:3.0 (close projection)
- Inner visualizer (through portal): Faceted, geometry:16, dimension:4.5 (far)

- Portal circle: CSS clip-path circle on inner canvas
  circle(0% at 50% 50%) -> circle(55% at 50% 50%)

- Portal edge effects:
  - Concentric glowing rings (box-shadow on clipped container)
  - border: 3px solid with animated conic-gradient
  - The edge "breathes" (radius oscillates +-3%)

- Outer canvas params during transit:
  dimension: 3.0 -> 3.0 (stays close, dramatic)
  speed: 0.5 -> 2.0 (accelerates as portal grows)
  chaos: 0.1 -> 0.5 (destabilizes)

- Inner canvas params:
  dimension: 4.5 -> 3.5 (focuses as portal opens)
  intensity: 0.0 -> 0.9 (revealed)
  hue: contrasting to outer (outer:200, inner:340)
```

---

### EVENT 18: Scroll Push / Element Displacement
**Section**: Any section with cards
**Duration**: Continuous during scroll

**Concept**: Elements appear to be "pushed" by the scroll direction.
When scrolling down, cards tilt slightly backward (rotateX positive)
and the visualizer canvas inside them shifts upward slightly, creating
the illusion that scroll force is physically pushing the elements.

**Implementation**:
```
- Track scroll velocity (from Lenis)
- Apply to all .tilt-card elements:
  rotateX: velocity * 0.02deg (caps at 8deg)
  translateY: velocity * 0.05px (caps at 15px)

- Canvas content inside cards gets opposing shift:
  The visualizer render offset shifts opposite to scroll direction
  Creates parallax WITHIN each card

- When scroll stops: spring animation back to neutral
  Uses GSAP elastic ease for organic overshoot

- Pairs with rot4dXW parameter:
  Scroll velocity maps to rot4dXW offset
  Fast scrolling = 4D rotation visible in the visualizer
  Creates "scroll drives the fourth dimension" metaphor
```

---

### EVENT 19: Energy Cascade Flow
**Section**: Full page, connecting multiple sections
**Duration**: Full page scroll

**Concept**: A visual "energy" appears to flow from top to bottom of the
page through connected visualizer elements. Each section "receives" energy
from the one above and "passes" it to the one below. Manifested as:
- Intensity peaks moving downward faster than scroll
- Color hue shifting in a consistent direction
- Glow effects that "drip" from section to section

**Implementation**:
```
- Global scroll tracker: each Canvas2D/GPU adapter gets an
  "energy level" based on: scroll proximity + upstream energy

- Energy propagation:
  When Section N's progress > 0.7, Section N+1 starts receiving energy
  Manifested as: intensity +0.2, a warm hue shift (+20), subtle glow

- CSS: Section dividers get animated gradient that flows downward:
  background: linear-gradient(180deg, glow-color at var(--energy-pos), transparent)
  --energy-pos animates from 0% to 100% as energy passes through

- Between sections: "energy drip" particles (CSS-only, radial-gradient dots)
  that fall downward with gravity-like timing

- Creates cohesive "living" page where everything is connected
```

---

### EVENT 20: Finale Supernova
**Section**: Pre-CTA climax (replaces current energy exit)
**Duration**: 50vh scroll (brief, intense)

**Concept**: Every parameter simultaneously maxes out for a brief
"supernova" moment — maximum density, maximum speed, maximum chaos,
maximum intensity, all rotations spinning, full spectrum hue cycling —
then SNAP to black, then gentle fade into CTA.

**Implementation**:
```
Phase A (0-60%): The Build (compressed crescendo)
  ALL visible adapters simultaneously:
  - gridDensity: current -> 80
  - speed: current -> 3.0
  - chaos: current -> 1.0
  - intensity: current -> 1.0
  - morphFactor: current -> 2.0
  - All 6 rotations: accumulate fast
  - Hue: cycles through full 360 rapidly

Phase B (60-70%): SUPERNOVA (peak)
  - All params AT MAXIMUM simultaneously
  - Screen white flash (opacity 0.5, 150ms)
  - Canvas scale: 1.0 -> 1.15 (overflows container)
  - Every glassmorphic element glows maximum
  - noise-overlay peaks at 0.1
  - CSS hue-rotate on ambient-bg spins fast

Phase C (70-80%): SNAP TO BLACK
  - Instant: all intensity -> 0, all speed -> 0
  - Canvas opacity -> 0
  - Pure black screen
  - ambient-bg opacity -> 0
  - Everything stops

Phase D (80-100%): CTA Rebirth
  - Single center point of light (radial-gradient, r: 0 -> 50vw)
  - CTA text fades in within the light
  - One visualizer restarts at whisper-level: intensity 0.1, speed 0.2
  - Contrast with the supernova makes it feel significant
```

---

## IMPLEMENTATION PRIORITY

### Tier 1: Must Ship (Core Fixes + Best Events)
1. **Fix Canvas2D Renderer** — Much more vibrant, layered, glow effects
2. **Event 15: Masking Layer Morph Reveal** — Replaces broken section veils
3. **Event 6: Phase Shift Bridge** — Replaces faint transition squares
4. **Event 1: Checker Grid Emergence** — Replaces broken triptych
5. **Event 9: Expanding Info Cards** — Replaces broken agent section

### Tier 2: High Impact
6. **Event 2: Density Wave Collision** — The "meeting in the middle" moment
7. **Event 14: Speed Crescendo -> Silence** — Pre-CTA drama
8. **Event 4: Scroll Velocity Burst** — Global reactivity boost
9. **Event 3: Canvas Spill Through Cards** — Masking layer showcase
10. **Event 18: Scroll Push / Element Displacement** — Physics feel

### Tier 3: Polish & Delight
11. **Event 8: Rotation Tornado** — Morph stage 5 enhancement
12. **Event 10: Chromatic Hue Wave** — Color spectacle
13. **Event 11: Dual Canvas Lock & Diverge** — Tension/release
14. **Event 7: Card Stack Dive** — Navigation metaphor
15-20. Remaining events as time permits

---

## CSS EFFECT LIBRARY

### Quaternion-Driven CSS Properties
```css
/* These are set by JavaScript based on 4D rotation state */
:root {
  --q-xw: 0;  /* Current rot4dXW normalized 0-1 */
  --q-yw: 0;  /* Current rot4dYW normalized 0-1 */
  --q-zw: 0;  /* Current rot4dZW normalized 0-1 */
  --q-intensity: 0;  /* sqrt(xw^2 + yw^2 + zw^2) / max */
}

/* Elements that react to 4D rotation state */
.quaternion-glow {
  box-shadow: 0 0 calc(20px + var(--q-intensity) * 40px)
    hsla(calc(var(--scroll-hue) + var(--q-xw) * 60), 70%, 50%,
         calc(0.05 + var(--q-intensity) * 0.15));
}

.quaternion-skew {
  transform: skewX(calc(var(--q-xw) * 5deg))
             skewY(calc(var(--q-yw) * 3deg));
}

.quaternion-hue {
  filter: hue-rotate(calc(var(--q-zw) * 30deg));
}
```

### Scroll-Reactive CSS Animations
```css
@property --reveal-progress {
  syntax: '<number>';
  initial-value: 0;
  inherits: true;
}

.scroll-clip-reveal {
  clip-path: circle(calc(var(--reveal-progress) * 80%) at 50% 50%);
}

.scroll-blur-fade {
  filter: blur(calc((1 - var(--reveal-progress)) * 12px));
  opacity: var(--reveal-progress);
}
```

---

*VIB3+ CORE — Clear Seas Solutions LLC*
*Epic Scroll Events v1.0 — 2026-02-08*
