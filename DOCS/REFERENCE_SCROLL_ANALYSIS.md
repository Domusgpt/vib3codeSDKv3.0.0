# Reference Site Scroll Effect Analysis

**Updated: 2026-02-10**
**Status**: COMPLETE — Visual analysis via Playwright screenshots + source-code parsing.

---

## Methodology

### Phase 1: Source-Code Analysis (HTML/CSS parsing)
Extracted CSS transition durations, easing functions, framework IDs, class patterns.

### Phase 2: Visual Analysis (Playwright screenshots)
Captured real Chromium screenshots at 8-11 scroll positions per site using wheel-based scrolling (triggers Lenis/GSAP animations). Tool: `tools/site-analyzer.mjs` with local proxy forwarder.

---

## Sites Analyzed

| # | URL | Framework | Status |
|---|-----|-----------|--------|
| 1 | weare-simone.webflow.io | Webflow + GSAP + Lenis + SplitType | COMPLETE |
| 2 | facetad.com | Wix Thunderbolt + Lenis | COMPLETE |
| 3 | clickerss.com | Wix Thunderbolt + View Transitions API | COMPLETE |
| 4 | tableside.com.au | Wix Thunderbolt | COMPLETE |
| 5 | wix.com/studio/inspiration/space | Wix Studio | 404 (page removed) |

### Detailed Analysis Documents
- `DOCS/VISUAL_ANALYSIS_SIMONE.md` — Frame-by-frame + 7 design patterns
- `DOCS/VISUAL_ANALYSIS_FACETAD.md` — Frame-by-frame + 6 design patterns
- `DOCS/VISUAL_ANALYSIS_CLICKERSS.md` — Frame-by-frame + 5 design patterns
- `DOCS/VISUAL_ANALYSIS_TABLESIDE.md` — Frame-by-frame + 5 design patterns
- `DOCS/CROSS_SITE_DESIGN_PATTERNS.md` — Synthesized actionable patterns + priority actions

---

## Source-Code Findings (Verified from HTML/CSS)

### CSS Transition Patterns

**clickerss.com:**
- View Transition API with named groups (header-group, footer-group, page-group)
- Slide transitions: 0.6s `cubic-bezier(.83,0,.17,1)`
- Multi-state opacity classes with different easings per state
- Marquee animation: `40s linear infinite` with pause-on-hover
- **Visual confirmation**: Massive B&W hero photo, serif text-image interweaving, typography-as-CTA footer

**facetad.com:**
- Lenis smooth scroll: `lerp: 0.1`, `wheelMultiplier: 0.7`
- 4-layer background compositing (base + masked image + blend overlay + shadow)
- Dynamic z-index via `data-z-counter` attributes
- **Visual confirmation**: Parallelogram clip-path images, diagonal section dividers, scattered gallery with z-stacking, diagonal cream→red color transition

**tableside.com.au:**
- Blur-to-sharp load: `blur(9px) → blur(0)` over 0.8s
- Fixed pinned overlay layer system
- 9+ hamburger icon animation variants with multi-line stagger
- **Visual confirmation**: Bold coral/cream/navy three-tone palette, variable-size portfolio cards, split-color footer (vertical cream/navy)

**weare-simone.webflow.io:**
- SplitType character-level text reveals with `y: "100%"` stagger
- Dark/light mode threshold switching at 2% viewport band
- GSAP Flip.js navigation shape morphing (0.4s power2.out)
- **Visual confirmation**: Giant wordmark hero, hard cream→dark-teal mode switch, zigzag asymmetric case study cards, floating product images, marquee CTA, outlined typography echo at footer

---

## Visual Findings Summary

### Pattern Verification Results

| Pattern (from CSS) | Visual Result |
|---|---|
| Multi-stage opacity | Could not test — requires interaction capture |
| Character reveal from below | SplitType present but needs JS trigger, not visible in static screenshots |
| Blur rack-focus | Not visible in screenshots — happens at load time |
| 4-layer compositing depth | Facetad confirms depth via parallelogram z-stacking, not traditional parallax |
| Dark/light threshold (Simone) | CONFIRMED — hard snap at section boundary, very dramatic |
| Card overlap stacking | CONFIRMED (Simone) — creates real depth with zigzag alternation |
| Lenis momentum | Cannot test in screenshots — requires scroll-feel testing |

### Newly Discovered Patterns (Not in source code)

These patterns were discovered through visual analysis that could NOT be inferred from source code:

1. **Parallelogram clip-path galleries** (Facetad) — images all use skewed non-rectangular shapes
2. **Diagonal section dividers** (Facetad) — 30-40deg angle, consistent site-wide
3. **Text-image interweaving** (Clickerss) — massive text overlaps/shares space with images
4. **Variable card sizing** (Tableside) — portfolio cards deliberately vary in height
5. **Split-color sections** (Tableside) — vertical cream/navy split in footer
6. **Extreme negative space** (Facetad) — hero is 95% empty, one line of text
7. **Typography-as-CTA** (Clickerss) — viewport-filling text IS the call-to-action
8. **Footer typography echo** (Simone) — hero's filled wordmark becomes outlined strokes at footer

---

*Analysis complete. See CROSS_SITE_DESIGN_PATTERNS.md for actionable VIB3+ implementation plan.*
