# VIB3+ Landing Page & Marketing Handoff Prompt

**Copy this entire document as the initial prompt when starting a new session focused on the landing page, marketing site, and forward-facing aspects.**

---

## Context

You are continuing development on the **VIB3+ landing page** — the marketing/showcase site for the `@vib3code/sdk` npm package (a 4D visualization SDK). The landing page demonstrates the SDK's three rendering systems (Quantum, Faceted, Holographic) through an immersive scroll-driven experience with GSAP choreography.

**Repository:** `Domusgpt/vib34d-xr-quaternion-sdk`
**Landing page location:** `site/` directory (separated from SDK code as of 2026-02-13)
**Live URL:** GitHub Pages deploy from `docs/` + root
**Owner:** Clear Seas Solutions LLC / Paul Phillips

## Architecture

```
site/
├── index.html                    # Landing page (1977 lines, 9 scroll sections)
├── styles/
│   ├── overlay-accents.css       # CSS-only accent overlays (gradient washes, mirrors, particles)
│   └── reveal-layers.css         # Multi-layer parallax reveal system (NEW)
└── js/
    ├── main.js                   # Boot script — GPU context pool + section initialization
    ├── config.js                 # Section parameter presets (hero, morph stages, etc.)
    ├── adapters.js               # SDK system adapters (Quantum/Holographic/Faceted + AmbientLattice)
    ├── ContextPool.js            # WebGL context budget manager (max 3 concurrent)
    ├── CardTiltSystem.js         # Mouse/touch → CSS 3D tilt + visualizer param mapping
    ├── choreography.js           # Main GSAP ScrollTrigger choreography (83KB, all sections)
    ├── overlay-choreography.js   # CSS accent overlays (gradient wash, mirror, glow, particles)
    └── reveal-choreography.js    # Multi-layer parallax reveal transitions (NEW)

Root SDK demo (separate):
├── index.html                    # Clean SDK demo with toolbar (NOT the landing page)
```

**CDN Dependencies:** Lenis smooth scroll, GSAP 3.12.5, ScrollTrigger 3.12.5 (loaded dynamically with 5s timeout fallback)

**SDK Imports:** `site/js/adapters.js` imports directly from `../src/` (Quantum, Holographic, Faceted engines). This is intentional since the site lives in the monorepo.

## Current Page Sections (9 total, ~3050vh scroll)

| Section | Height | GPU Contexts | Systems | Key Feature |
|---------|--------|--------------|---------|-------------|
| Opening Cinematic | 800vh | 1 | Quantum | SVG text mask ("VIB3CODE") + lattice parallax |
| Hero | 100vh | 1 | Quantum | Title reveal + badge |
| Morph Experience | 1200vh | 1 (swaps) | Q→H→F | 6-stage card morphing with system swaps |
| Playground | static | 1 | User choice | Full parameter control (all 6D rotation planes) |
| Triptych | 200vh | 3 | Q+H+F | 3-system split-screen simultaneous render |
| Geometry Cascade | 400vh | 2+C2D | Q+H bg | Horizontal scroll cards with geometry showcase |
| Energy Transfer | 250vh | 2 | Q bg + F card | Interactive sweep demo |
| Agent Integration | static | 1 | Holographic | Download packs (MCP, Claude, OpenAI) |
| CTA | 100vh | 2 | Q+F diagonal | Installation code + links |

**Total GPU budget:** Max 3 concurrent WebGL contexts. ContextPool auto-evicts oldest.

## What's Working

### Choreography Engine (choreography.js — 83KB)
- **Depth Illusion Engine** — gridDensity = distance metaphor + CSS scale/blur/shadow
- **6 Coordination Modes** — opposition, convergence, call-response, heartbeat, energy-conservation, crossfade
- **Mathematical parameter curves** — Lissajous rotation, sine interference, exponential ramps
- **Section-specific timelines** — Each section has a pinned ScrollTrigger with multi-phase choreography
- **System swaps** — Morph section smoothly transitions Q→H→F with flash effects

### Overlay System (overlay-choreography.js — 35KB)
- 5 accent systems: GradientWash, MirrorReflection, EdgeGlowRing, ParticleField, CrossfadeBridge
- Quaternion-to-CSS bridge (feeds 4D rotation to CSS custom properties)
- AccentChoreographer master controller

### NEW: Reveal Layer System (reveal-choreography.js + reveal-layers.css)
- **Replaces ugly SVG section dividers** with dynamic transitions
- **8 transition patterns:** Iris aperture, diagonal bars, column split, glass panel retraction, bezel bar criss-cross, checkerboard dissolve
- **Persistent parallax field** — Subtle geometric depth texture at 0.3x scroll speed
- **Floating glassmorphic accent strips** — 3 colored lines at different parallax rates
- **Glow lines** — Luminous accent lines at section boundaries (replace SVG curves)
- **Section edge blending** — CSS gradient fades at section top/bottom (replace hard seams)

## Known Issues & Priorities

### HIGH PRIORITY — Visual Quality
1. **Rectangular layout problem** — Despite excellent choreography math, everything is constrained to rectangular cards. Need organic shapes (SVG blob paths, fluid bezier boundaries, non-rectilinear clip-paths).
2. **Predictable symmetry** — Triptych is perfect 33/33/33, CTA is 50/50 diagonal, energy is centered. Need asymmetry and visual tension.
3. **Universal accent treatment** — Every card gets the same vignette+shadow+glow+chroma. Differentiate: some sections should get unique treatments while others stay minimal.
4. **Mobile experience** — 3050vh total scroll on mobile is excessive. Canvas count should drop to 1 concurrent. Cascade horizontal scroll breaks at small viewports (6 cards at 88vw).

### MEDIUM PRIORITY — Functionality
5. **AmbientLattice anti-pattern** — 580-line Canvas2D renderer in adapters.js duplicates SDK geometry. Should use SDK's FacetedSystem with reduced GPU overhead instead.
6. **No audio demo** — Audio reactivity is a key SDK feature but not demonstrated anywhere on the landing page. Add a toggle or auto-detect section.
7. **No SpatialInput demo** — Device tilt/gyroscope is a selling point but not shown. Consider a "tilt your phone" section.
8. **Agent section download links** — Point to `agent-config/` which may not exist in the site/ directory. Verify paths.

### LOW PRIORITY — Polish
9. **Performance profiling** — Mirror/MultiInstance overlays copy canvases via 2D context (CPU-bound). Profile on low-end devices.
10. **Accessibility** — Many decorative elements lack `aria-hidden`. Heading hierarchy has duplicate `<h1>`. Keyboard navigation untested.
11. **Cascade card clip-path morphing** — The 8-point polygon system (rect/hex/diamond/oct) is clever but all shapes share the same bounding box. More dramatic shape variation needed.

## GSAP Pattern Reference (From Visual Codex)

These patterns were studied and should inform future development:

### Stagger Patterns
- `from: "center"` with elastic easing for outward reveals
- Grid-based: `stagger: { grid: [rows, cols], from: "edges", amount: 1.2 }`
- Function-based: `each: (i) => i * 0.05 + Math.random() * 0.1`

### 3D Transforms
- Z-depth emergence: `fromTo(el, { z: -500, scale: 0 }, { z: 0, scale: 1 })`
- Multi-axis spin: `{ rotationX: 720, rotationY: 540, rotationZ: 360 }` with elastic
- `perspective: 1000px` on body, `transform-style: preserve-3d` on containers

### Filter/Blur
- Progressive blur reveal: `fromTo(el, { filter: "blur(20px)" }, { filter: "blur(0px)" })`
- Layered blur stack: 3 layers at different blur levels, stagger `"<0.2"` relative timing
- Glassmorphism: `backdrop-filter: blur(20px)` on panels

### Multi-Visualizer Choreography
- 5-phase scroll modes: Intro→Grid→Carousel→Expand→Finale
- Impulse system: `targets.impulse = Math.min(targets.impulse + intensity, 1.5)`, decays at 92%/frame
- Scrub smoothing: `scrub: 0.3` (300ms delay)

## Design Direction

The current page has **world-class mathematical choreography** trapped in a **rigid rectangular grid**. The goal is to break free with:

1. **Multiple parallax layers** — Not just 2. Different areas should have different layer counts and behaviors (columns in one area, concentric iris in another, diagonal bars in a third).
2. **Negative space** — Solid layers with cutouts that reveal visualizers. The visualizers shine THROUGH the design, not inside rectangular boxes.
3. **Organic boundaries** — SVG blob paths, fluid beziers, non-rectangular clip-paths. Nothing should be a perfect rectangle.
4. **Asymmetrical compositions** — Break the grid. Unequal column widths, off-center elements, visual tension.
5. **Varied visual vocabulary** — Not every section needs every effect. Some should be minimal and clean, others dramatic and layered.
6. **Glass morphism as a design language** — Frosted glass panels that slide, morph, and shatter to reveal content.

## Commands

```bash
# From project root:
pnpm dev                         # Opens dev server (default: docs gallery)
# Then navigate to /site/index.html for landing page
# Or / for SDK demo

# To verify no SDK regressions:
pnpm test
```

## Session Instructions

1. Read `site/index.html` for the full HTML structure
2. Read `site/js/choreography.js` for the existing scroll timeline (it's 83KB — skim the section-level functions)
3. Read `site/js/reveal-choreography.js` for the new overlay layer system
4. **Do not break existing choreography** — the new system layers ON TOP
5. Test in browser after changes — the page relies on CDN-loaded GSAP
6. Focus on the visual quality issues listed above
7. Use the GSAP pattern reference for implementation guidance
