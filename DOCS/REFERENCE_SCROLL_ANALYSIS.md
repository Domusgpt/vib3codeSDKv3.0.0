# Reference Site Scroll Effect Analysis

**Updated: 2026-02-10**
**Status**: PARTIAL — Source-code analysis only. Visual analysis pending.

---

## Methodology Disclosure

**IMPORTANT**: This analysis was conducted by parsing HTML/CSS source code via HTTP fetch, NOT by visually observing the rendered sites. This means:

### What we CAN extract from source code:
- CSS transition/animation durations and easing functions
- Framework identification (Wix, Webflow, GSAP, Lenis, etc.)
- CSS class naming patterns and state management
- Static layout structure (grids, positioning)
- CSS custom property systems
- Blend modes, filter declarations, transform properties

### What we CANNOT see from source code:
- **Actual visual scroll choreography** (how elements move together during scroll)
- **Runtime GSAP/ScrollTrigger timelines** (JS-driven, not in static HTML)
- **Canvas/WebGL rendered effects** (runtime only)
- **The "feel"** — timing, rhythm, perceived depth, visual weight
- **Color schemes in context** (computed styles at render time)
- **Interaction feedback** (hover states, click responses in context)
- **Responsive behavior** (layout at different breakpoints)

### What needs to happen:
Playwright-based systematic screenshots at scroll intervals (every 100px or 5% of page height) + interaction capture (hover states, click sequences). See `tools/site-analyzer.mjs` for the automated tool.

---

## Sites to Analyze

| # | URL | Framework (from source) | Status |
|---|-----|------------------------|--------|
| 1 | clickerss.com | Wix Thunderbolt + View Transitions API | Source parsed |
| 2 | facetad.com | Wix Thunderbolt + Lenis | Source parsed |
| 3 | tableside.com.au | Wix Thunderbolt | Source parsed |
| 4 | wix.com/studio/inspiration/space | Wix Studio | Source parsed |
| 5 | weare-simone.webflow.io | Webflow + GSAP + Lenis + SplitType | Source parsed |
| 6 | wix.com template 3630 | Wix | Minimal data |

---

## Source-Code Findings (Verified from HTML/CSS)

### CSS Transition Patterns Observed

These are real CSS properties found in the source. We can confirm the DEFINITIONS exist — but not how they look when rendered.

**clickerss.com:**
- View Transition API with named groups (header-group, footer-group, page-group)
- Slide transitions: 0.6s `cubic-bezier(.83,0,.17,1)`
- Multi-state opacity classes with different easings per state
- Marquee animation: `40s linear infinite` with pause-on-hover
- Mask-image reveals with position/size CSS variables

**facetad.com:**
- Lenis smooth scroll: `lerp: 0.1`, `wheelMultiplier: 0.7`
- 4-layer background compositing (base + masked image + blend overlay + shadow)
- Dynamic z-index via `data-z-counter` attributes
- `mix-blend-mode: plus-lighter` and `overlay` on interactive elements
- 3-state color choreography via `--corvid-*` CSS variables

**tableside.com.au:**
- Blur-to-sharp load: `blur(9px) → blur(0)` over 0.8s
- Fixed pinned overlay layer system
- 9+ hamburger icon animation variants with multi-line stagger
- Sub-menu 4-property coordinated animation (arrow + bg + opacity + height)

**weare-simone.webflow.io:**
- SplitType character-level text reveals with `y: "100%"` stagger
- Dark/light mode threshold switching at 2% viewport band
- GSAP Flip.js navigation shape morphing (0.4s power2.out)
- Portfolio card overlap: alternating 40% right offset with z-stacking
- Continuous spinner: `spin 10s linear infinite`

---

## Patterns to Verify Visually

These patterns were INFERRED from CSS class names but need visual confirmation:

1. **Multi-stage opacity choreography** — Do elements actually breathe through states, or is it just class toggling?
2. **Character reveal from below** — Does the SplitType animation actually create a depth illusion?
3. **Blur rack-focus** — How does the blur(9px→0) transition feel at scroll speed?
4. **Layer compositing depth** — Do the 4 background layers actually create parallax-like depth?
5. **Dark/light threshold** — How dramatic is the 2% band color flip?
6. **Card overlap stacking** — Does the 40% offset create real depth or just messy layout?
7. **Lenis momentum** — How does lerp:0.1 + wheelMultiplier:0.7 actually feel to scroll?

---

## Visual Analysis Plan

When Playwright is working, run the systematic analyzer on each site:

```
For each site:
  1. Full-page screenshot at load
  2. Screenshots every 200px of scroll (capture scroll position + viewport)
  3. Screenshots of each section at: entering viewport, centered, leaving viewport
  4. Hover state captures on interactive elements
  5. Menu open/close animation frames
  6. Extract computed styles at each scroll position for key elements
```

Output: `DOCS/screenshots/{site-name}/scroll-{position}.png` + computed-style JSON

---

*This document will be updated with actual visual findings once Playwright screenshots are captured.*
