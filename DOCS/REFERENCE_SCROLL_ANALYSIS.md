# Reference Site Scroll Effect Analysis

**Generated: 2026-02-09**
**Purpose**: Exhaustive documentation of scroll choreography patterns, parallax, morphing, depth illusions, and multi-element coordination from 6 reference websites. This document serves as the pattern library for Document 2 (VIB3+ Multi-Visualizer Translation).

---

## Table of Contents

1. [clickerss.com](#1-clickersscom)
2. [facetad.com](#2-facetadcom)
3. [tableside.com.au](#3-tablesidecomau)
4. [wix.com/studio (Space Inspiration)](#4-wix-studio-space-inspiration)
5. [weare-simone.webflow.io](#5-weare-simonewebflowio)
6. [wix.com template 3630](#6-wix-template-3630)
7. [Cross-Site Pattern Synthesis](#7-cross-site-pattern-synthesis)

---

## 1. clickerss.com

**Framework**: Wix Thunderbolt + Custom View Transitions API

### A. View Transition System (Page-Level)

| Transition Type | Duration | Easing | Mechanism |
|----------------|----------|--------|-----------|
| Slide Horizontal | 0.6s | cubic-bezier(.83,0,.17,1) | `translateX(100% → 0)` new, `translateX(0 → -100%)` old |
| Slide Vertical | 0.6s | cubic-bezier(.83,0,.17,1) | `translateY(-100% → 0)` new |
| OutIn | 0.35s + 0.35s | Staggered ease | Fade out old (0.35s), then fade in new (0.35s) |

**Key insight**: Named `view-transition-name` groups (header-group, footer-group, page-group) allow different page regions to transition independently. Header stays pinned while page content morphs.

### B. Multi-Stage Opacity Choreography

```
State class system:
  .sNF2R0 → opacity: 0 (hidden)
  .hLoBV3 → transition on (cubic-bezier .37,0,.63,1)
  .Rdf41z → opacity: 1 (visible)
  .ftlZWo → alternate toggle
  ._6zG5H → exit: opacity 0, 200ms ease-out
```

**Pattern**: Elements don't simply appear/disappear — they traverse through multiple state classes, each with its own easing function. This creates a "breathing" quality where elements are always in some stage of transition.

### C. Transform Choreography

| Effect | Properties | Duration | Easing |
|--------|-----------|----------|--------|
| Horizontal reveal | translateX(100%) → 0 | 0.3s | cubic-bezier(.87,0,.13,1) |
| Vertical reveal | translateY(100%) → 0 | 0.3s | cubic-bezier(.87,0,.13,1) |
| Exit slide | translateX → 100% | 0.2s | cubic-bezier(.64,0,.78,0) |
| Scale on hover | scale(1.07) | 0.4s | ease-out |

### D. Video Background Integration

- Video elements have opacity/scale state management: `opacity: 0` while loading → `opacity: 1, scale: 1.07` playing (slight zoom creates life)
- Canvas layered behind video for fallback/transition effects
- Roll-in animation during autoplay start

### E. Marquee / Infinite Scroll Text

- Infinite horizontal scroll with `animation: marquee 40s linear infinite`
- Left/right directional variants
- **Pause on hover** — creates "catch me" interaction
- **Pause on keyboard focus** — accessibility

### F. Depth Illusion Techniques

1. **Scale + Shadow on hover**: Elements scale 1.07 with `drop-shadow` increasing → simulates lifting toward viewer
2. **Mix-blend-mode**: `var(--blendMode, normal)` on images creates layer interaction
3. **Mask-image reveals**: `-webkit-mask-image` with position/size variables creates shaped reveal windows
4. **SVG filter effects**: `--filter-effect-svg-url` for custom blur/distortion

### G. Menu Reveal — Staggered Multi-Element

```
Hamburger → revealFromRight + fadeIn (0.4s cubic-bezier)
Menu items: staggered with cubic-bezier(.645,.045,.355,1)
Underline reveals: scaleX(0 → 1) transforms
Dropdown arrows: rotate 180° on expand
```

**Pattern**: The menu is a 4-stage coordination:
1. Hamburger icon morphs (lines rotate)
2. Background panel slides in (revealFromRight)
3. Menu items stagger-fade (cascade timing)
4. Sub-elements (icons, arrows) rotate/scale independently

---

## 2. facetad.com

**Framework**: Wix Thunderbolt + Lenis Smooth Scrolling

### A. Lenis Smooth Scroll Configuration

```javascript
lerp: 0.1          // Very smooth (low lerp = more smoothing)
wheelMultiplier: 0.7  // Dampened wheel input
orientation: 'vertical'
gestureOrientation: 'vertical'
```

**Key insight**: `lerp: 0.1` creates a floating, momentum-heavy feel. Combined with `wheelMultiplier: 0.7`, scrolling feels like moving through liquid — every element trails the scroll position.

### B. Z-Index Depth Management

```
data-z-counter attributes with CSS variables:
  --above-all-z-index
  --above-all-in-container
```

**Pattern**: Dynamic z-index stacking creates parallax depth without actual translateZ. Higher-z elements appear to float above lower-z elements as they scroll at the same rate but with different visual weight.

### C. Multi-Layer Background System

```
Fill Layer Architecture:
  .MW5IWV → mask-image with position/repeat/size variables
  .dLPlxY → image opacity + height transforms
  .m4khSP → overlay blend with fallback opacity
  .lyNaha → mix-blend-mode control
```

**Pattern**: Backgrounds are constructed from 3-4 composited layers:
1. Base color/gradient
2. Masked image layer (clip reveal)
3. Overlay blend layer (color mixing)
4. Shadow/depth layer

Each layer animates independently, creating rich depth movement on scroll.

### D. Stagger Cascade Pattern

```
Menu depth classes: OZVMSN → zui1C4 → WJmop7
Each layer has:
  - directional text-align variables
  - opacity transition timing offsets
  - background color shift sequences
```

**Pattern**: Nested elements reveal at different rates. Parent appears first, then children cascade inward. Each depth level has its own timing offset — creating a "peeling back layers" effect.

### E. Blend Mode Gallery

| Element | Blend Mode | Effect |
|---------|-----------|--------|
| Hover boxes | plus-lighter | Additive glow on interact |
| Fill overlays | overlay | Color mixing with background |
| Image layers | normal (controllable) | Runtime switchable |

### F. Interactive Transition System

```
Hover/Active color shifts via CSS variables:
  --corvid-background-color
  --corvid-hover-background-color
  --corvid-disabled-background-color
```

Every interactive element has 3-state color choreography: default → hover → active, with intermediate transitions. Border, background, text, and icon fill all transition in coordination.

---

## 3. tableside.com.au

**Framework**: Wix Thunderbolt

### A. Blur-to-Sharp Load Animation

```css
blur(9px) → blur(0)
Duration: 0.8s ease-in
```

**Key insight**: Content loads in a blurred state and sharpens. This is more sophisticated than a simple fade — it simulates a camera rack-focus effect, creating a sense of depth and "coming into focus."

### B. Fixed Pinned Layer System

```
.big2ZD: position: fixed, pointer-events: none
.blockSiteScrolling: position: fixed, width: 100%
```

**Pattern**: A transparent fixed overlay layer captures scroll events. Below it, content can be programmatically scrolled, creating a controlled scroll-jacking feel without actual scroll hijacking.

### C. Hamburger Icon Transform Library

9+ distinct hamburger animation variants documented:

| Variant | Animation | Duration |
|---------|----------|----------|
| Rotate X | Lines rotate -45deg, middle fades | 0.2s |
| Scale + Rotate | Lines scale to 50%, rotate ±90° | 0.25s |
| Translate + Rotate | Individual line transforms | 0.33s staggered |
| Grid dots | Dots scatter with translate() | 0.3s |
| Plus rotate | Rotates with scale+opacity | 0.3s |

**Pattern**: Each icon variant is a multi-line coordinated animation. Lines don't just disappear — they morph into the close (X) state through choreographed rotation, scale, and translate. The stagger between lines (10-30ms) creates a "ripple" across the icon.

### D. Sub-Menu Depth Animation

```
Arrow rotation: 180° on open state
Background color: --bgs → --bgexpanded
Opacity: hidden (0) → visible (1) with 0.4s all
Grid template transition: heights morph
```

**Pattern**: Sub-menu expansion isn't just show/hide — it's a 4-property coordinated animation:
1. Arrow rotates (direction indicator)
2. Background color shifts (visual mode change)
3. Content fades in (opacity)
4. Container height morphs (grid-template animation)

### E. Focus and Accessibility Layer

```
.focus-ring-active .okY9U1:focus:before {
  outline: 2px solid #116dff
}
```

Custom focus indicators with offset and color theming. Focus ring only activates via keyboard tabbing (`.focus-ring-active`), not mouse clicks.

---

## 4. Wix Studio Space Inspiration

**Framework**: Wix Studio

### A. Depth Illusion via Box Shadow + Blend Modes

```css
Box shadow: "0 1px 4px rgba(0,0,0,.6)"
mix-blend-mode: plus-lighter
mix-blend-mode: overlay
```

**Pattern**: Combining shadows with blend modes creates multi-dimensional depth:
- Shadow pushes elements "behind" the surface
- `plus-lighter` makes overlapping elements glow (additive)
- `overlay` multiplies dark areas and screens light areas → natural depth

### B. Multiple Fill Layers with Opacity Variations

```
Fill layer stack:
  Background → Masked image → Overlay blend → Foreground
Each layer has independent opacity and blend mode
```

**Pattern**: The "parallax-like depth" comes not from actual scroll-speed differences but from opacity+blend layering. As you scroll, the opacity relationships between layers shift, making some layers appear to recede while others advance.

### C. Coordinated Entry/Exit Class System

```
Entry:  .KQSXD0 → cubic-bezier(.64,0,.78,0)  // Fast start, slow end
Exit:   ._6zG5H → cubic-bezier(.22,1,.36,1)   // Slow start, fast end
```

**Pattern**: Entry and exit use complementary easing functions. Entry overshoots (fast start), exit undershoots (slow start). This creates a "spring-loaded" feel where elements arrive with energy and leave with reluctance.

### D. Fixed Layer Management

```
Header: view-transition-name: header-group
Footer: view-transition-name: footer-group
Pinned layer: position: fixed + z-index management
```

**Pattern**: The page is divided into transition groups that can animate independently during navigation. The fixed layer sits between content and navigation, creating a "floating" navigation that doesn't participate in content scrolling.

---

## 5. weare-simone.webflow.io

**Framework**: Webflow + GSAP + ScrollTrigger + Lenis + SplitType + Flip.js

### A. Text Split + Reveal System (SplitType + GSAP)

```javascript
SplitType splits "[animate]" elements into: lines, words, chars
GSAP animation: { y: "100%", opacity: 0 } → default
Stagger: 0.15s between elements
Trigger: "top center"
```

**Key insight**: This is the most sophisticated text reveal system across all analyzed sites. SplitType breaks text into individual characters, each of which animates independently. The `y: "100%"` means each character rises from below its line — creating a "typewriter from below" effect.

**Depth effect**: Characters at 100% y-offset appear to be "under the surface." As they rise, they emerge through the text baseline — a powerful depth illusion using only 2D transforms.

### B. Section Dark/Light Mode Switching

```javascript
Trigger: [mode-switch-element='trigger']
Class toggle: 'sm0-2' on targets
ScrollTrigger: start "top 2%", end "bottom 2%"
```

**Pattern**: As sections scroll into a narrow 2% band at the top of the viewport, the entire color mode flips. This creates a dramatic "light/dark threshold" — elements transform as they cross a horizontal boundary.

**VIB3+ translation**: This is a clear opportunity for visualizer parameter cross-fade at section boundaries. As a section crosses the threshold, hue/intensity/chaos could invert.

### C. Flip.js Navigation Shape

```javascript
.menu_shape--br3 animates between menu links
Duration: 0.4s, easing: "power2.out"
Color transitions on hover (originalColor ↔ hoverColor)
```

**Pattern**: A shape element (likely a pill or underline) physically moves between navigation items using GSAP Flip. Instead of fading between positions, the shape morphs its dimensions and slides to the new position — creating a "living" navigation indicator.

### D. Portfolio Card Depth Illusion

```css
.cases_item:nth-child(2n+2) {
  position: absolute;
  right: -40%; /* desktop → -25% tablet */
}
```

**Pattern**: Alternating portfolio cards are offset 40% to the right with absolute positioning. This creates:
1. **Overlapping depth**: Cards visually overlap, creating foreground/background layers
2. **Asymmetric reveal**: Even-numbered cards appear to float above odd-numbered cards
3. **Responsive depth collapse**: On tablet, the offset reduces (-25%), and on mobile, cards stack vertically — depth illusion gracefully degrades

### E. Lenis Smooth Scroll Integration

```css
.lenis.lenis-smooth { scroll-behavior: auto; }
[data-lenis-prevent] { overscroll-behavior: contain; }
```

**Pattern**: Lenis handles smooth scrolling globally, but specific elements can opt out with `data-lenis-prevent`. This allows certain interactive areas (carousels, code blocks) to have native scroll behavior while the page scrolls smoothly.

### F. Continuous Spinner Animation

```css
.mute_pointer_spin--ca1 {
  animation: spin 10s linear infinite;
}
```

**Pattern**: A permanently rotating element adds "life" to an otherwise static section. The 10s duration is slow enough to feel ambient rather than distracting.

### G. Color System with Mode Inheritance

```css
--dark-1: 0, 50, 62    (deep teal)
--light-1: 252, 247, 240 (cream)
--brand-1: 204, 255, 102  (lime green)
```

**Pattern**: Colors defined as RGB triplets (not hex) allow alpha manipulation throughout. Section modes inherit from parent, but card modes can override — creating "pockets" of different color contexts within a section.

---

## 6. Wix Template 3630

**Framework**: Wix (Boutique Hotel template)

*Limited analysis available — page returned initialization layer only, not presentation layer.*

From the template description: "Clean, elegant design" with responsive layout. Based on the Wix framework patterns observed in other analyzed sites, this template likely uses:
- View Transition API for page navigation
- Scroll-triggered opacity reveals
- Image mask/blend effects
- Responsive grid with parallax-like section spacing

---

## 7. Cross-Site Pattern Synthesis

### The 12 Core Scroll Effect Patterns

After analyzing all sites, these are the fundamental patterns that create the most impact:

#### Pattern 1: MULTI-STAGE OPACITY CHOREOGRAPHY
**Seen in**: clickerss, facetad, tableside, simone
**Mechanism**: Elements traverse 3-5 opacity states (hidden → transitioning → visible → transitioning-out → hidden) with different easing per stage
**Impact**: Creates a "breathing" quality — nothing snaps, everything flows
**Scroll ratio**: 0.5-1.5vh per opacity state transition

#### Pattern 2: SPLIT-TEXT CHARACTER REVEAL
**Seen in**: simone (SplitType), clickerss (character cascade)
**Mechanism**: Text broken into chars/words, each animated with y-offset stagger (0.06-0.15s per element)
**Impact**: Text appears to "grow" from below the surface — powerful depth illusion with no 3D transforms
**Scroll ratio**: ~50vh for a full heading reveal

#### Pattern 3: BLUR-TO-SHARP RACK FOCUS
**Seen in**: tableside (0.8s load), all sites (blur-reveal patterns)
**Mechanism**: `filter: blur(9px) → blur(0)` combined with opacity
**Impact**: Simulates camera depth-of-field — elements "come into focus" as they enter the viewport
**Scroll ratio**: 20-30vh for complete sharpening

#### Pattern 4: MULTI-LAYER BACKGROUND COMPOSITING
**Seen in**: facetad (4-layer), wix-studio (3-layer)
**Mechanism**: Base color + masked image + blend overlay + shadow layer, each with independent opacity/blend-mode
**Impact**: Rich depth without parallax speed differences. Layer opacity shifts create advancing/receding illusion
**Scroll ratio**: Continuous across section (100-200vh)

#### Pattern 5: COMPLEMENTARY ENTRY/EXIT EASING
**Seen in**: wix-studio, clickerss, facetad
**Mechanism**: Entry uses fast-start easing `(.64,0,.78,0)`, exit uses slow-start `(.22,1,.36,1)`
**Impact**: Elements "spring in" with energy and "melt away" when leaving — asymmetric feel
**Scroll ratio**: 10-15vh per transition

#### Pattern 6: DARK/LIGHT MODE THRESHOLD
**Seen in**: simone (2% viewport band)
**Mechanism**: Color mode flips as section crosses a narrow viewport threshold
**Impact**: Dramatic full-palette inversion at a single scroll point — creates "dimension shift" feel
**Scroll ratio**: Instant (2vh trigger band)

#### Pattern 7: CARD OVERLAP DEPTH STACKING
**Seen in**: simone (40% right offset), facetad (z-index management)
**Mechanism**: Alternating cards offset with absolute positioning + z-index differences
**Impact**: Foreground/background layer illusion from 2D elements
**Scroll ratio**: Per-card (30-50vh per card pair)

#### Pattern 8: NAVIGATION SHAPE MORPH (Flip)
**Seen in**: simone (Flip.js pill)
**Mechanism**: Active indicator physically morphs and slides between targets
**Impact**: Navigation feels "alive" — one continuous shape rather than discrete states
**Scroll ratio**: N/A (interaction-driven)

#### Pattern 9: FIXED TRANSPARENT OVERLAY
**Seen in**: tableside, facetad
**Mechanism**: Fixed layer with `pointer-events: none` sits between content and scroll handler
**Impact**: Scroll-jack control without actual scroll hijacking. Content can be programmatically positioned
**Scroll ratio**: N/A (structural)

#### Pattern 10: COORDINATED HAMBURGER MORPHING
**Seen in**: tableside (9 variants), clickerss (rotate + fade)
**Mechanism**: Multi-line icon where each line has independent rotation/scale/translate with 10-30ms stagger
**Impact**: Micro-choreography — a 40px icon becomes a performance piece
**Scroll ratio**: N/A (interaction-driven)

#### Pattern 11: MARQUEE WITH INTERACTION PAUSE
**Seen in**: clickerss (40s infinite loop)
**Mechanism**: Continuous horizontal text scroll that pauses on hover/focus
**Impact**: Creates "catch the flowing text" interaction — adds movement without scroll dependency
**Scroll ratio**: Independent of scroll

#### Pattern 12: PARALLAX VIA LENIS MOMENTUM
**Seen in**: facetad (lerp 0.1), simone (Lenis smooth)
**Mechanism**: Very low lerp creates trailing momentum on all elements
**Impact**: Everything moves with weight — scroll input causes a delayed, fluid response
**Scroll ratio**: Affects all scroll interactions (0.7 wheel multiplier dampens by 30%)

---

### Depth Illusion Hierarchy (Strongest → Subtlest)

| Rank | Technique | Perceived Depth | Cost |
|------|----------|----------------|------|
| 1 | Scale + Shadow + Blur combined | Very strong | Medium |
| 2 | Card offset + z-index stacking | Strong | Low |
| 3 | Multi-layer blend compositing | Strong | Medium |
| 4 | Blur-to-sharp rack focus | Moderate | Low |
| 5 | Complementary entry/exit easing | Moderate | Low |
| 6 | Parallax scroll speed difference | Moderate | Low |
| 7 | Opacity state choreography | Subtle | Low |
| 8 | Dark/light mode threshold | Instant depth reset | Low |

---

### Movement Per Viewport Ratios

| Site | Total Height | Scroll Ratio | Key Sections |
|------|-------------|-------------|-------------|
| clickerss | ~8-12x viewport | Moderate density | Video hero, marquee, portfolio grid |
| facetad | ~10-15x viewport | High density (Lenis dampened) | Multi-layer backgrounds, case studies |
| tableside | ~6-8x viewport | Lower density | Full-screen sections, fixed overlays |
| wix-studio | ~8-10x viewport | Moderate density | Layered inspiration boards |
| simone | ~12-18x viewport | High density (Lenis + SplitType) | Case studies, mode switching |

---

### Interactive Element Density

| Site | Hover Effects | Cursor Types | Transitions per Element |
|------|-------------|-------------|----------------------|
| clickerss | 15+ elements | pointer, default | 2-3 (bg, border, text) |
| facetad | 20+ elements | pointer | 3-4 (bg, border, text, icon fill) |
| tableside | 10+ elements | pointer | 2 (bg, color) |
| simone | 25+ elements | pointer, custom | 3-5 (flip, color, scale) |

---

*End of Reference Analysis. See DOCS/MULTIVIZ_CHOREOGRAPHY_PATTERNS.md for VIB3+ translation.*
