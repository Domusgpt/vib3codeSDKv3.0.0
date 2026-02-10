# Visual Analysis: weare-simone.webflow.io

**Captured: 2026-02-10 via Playwright with wheel-based scrolling**
**Method**: Real Chromium screenshots at 8 scroll positions (wheel events trigger Lenis/GSAP)
**Page height**: 12,062px (~13.4x viewport)

---

## Scroll Journey (Frame by Frame)

### s00 — Top (scrollY=0)
**Giant "SIMONE" wordmark fills ~80% of viewport width**
- Background: warm cream/off-white with subtle noise texture
- Typography: black, extremely bold condensed sans-serif, all caps
- Text takes up full viewport — no other content visible except:
  - Small "SIMONE" logo top-left (dark teal, tiny)
  - Green pill-shaped nav button top-right with dot indicators
  - Minimal nav links: "Work", "About", "Contact"
- **Pattern**: Hero section is JUST typography. No images, no gradients. The text IS the design. Massive scale creates impact.

### s01 — scrollY=2400
**Complete mode switch: cream → dark teal**
- Background: deep dark teal (#0A3239 range) with subtle noise texture
- Large white serif/display text: "What if we could alter reality *for the better?*"
- "for the better?" in lime/chartreuse green (#CCFF66)
- Below: smaller body text (cream colored) explaining studio mission
- Content sits within a large rounded-corner container (~24px radius)
- **Pattern**: DRAMATIC full-palette inversion at section boundary. The entire color scheme flips. This is the "dark/light mode threshold" pattern.

### s02 — scrollY=4800
**Asymmetric case study card (IKEA)**
- Still dark teal background
- Large serif heading: "Transform how we browse"
- Small body text on left side
- IKEA logo (white on dark)
- Green pill button: "View case study" with arrow
- **Product image floats right**: desk lamp in dark tones, offset ~60% to the right
- Below: "Turn up the magic" heading beginning to enter viewport
- **Pattern**: Asymmetric card layout. Text content LEFT, floating product image RIGHT. The image is positioned outside the text column — creates overlap depth.

### s03 — scrollY=7200
**Sephora + Nike stacked case studies**
- Top: Sephora section ending — "Draw people into your world..." text top-right
- Sephora logo centered, "View case study" green pill
- Red 3D cosmetic product floats LEFT (~25% from left edge)
- Bottom half: Nike "Get people moving" section beginning
- Nike logo at bottom
- **Pattern**: Alternating asymmetry — IKEA had image RIGHT, Sephora has image LEFT, Nike will have image RIGHT. This creates a zigzag visual rhythm as you scroll.

### s04 — scrollY=9600
**Client logos strip on cream background**
- Mode switch BACK to light: cream/off-white background
- Three logos visible: Dior, Monzo, Disney
- Very clean, minimal spacing
- Logos are small and muted (dark teal on cream)
- **Pattern**: Palate cleanser section. After intense dark case studies, a minimal light section resets visual fatigue. Brief breathing room.

### s05 — scrollY=11162 (bottom)
**CTA footer with marquee**
- Mode switch back to dark teal
- "Ready to alter reality?" centered heading (small, white)
- GIANT horizontal marquee: "Work with us" repeated, scrolling horizontally
- Green circular CTA button between the marquee text repetitions
- Below the marquee: "SIMONE" in massive OUTLINED/STROKE typography (no fill, just border)
- Footer bar: © 2026, Instagram, LinkedIn, "Site by Kin", 1% Planet badge
- **Pattern**: The footer echoes the hero — same giant "SIMONE" text but now as outlined strokes instead of filled. Creates bookend/closure. The horizontal marquee adds perpetual motion.

---

## Key Design Patterns for VIB3+ Translation

### 1. Typography-As-Hero
The hero section has NOTHING except giant text. No background effects, no images. The text IS the visual impact. For VIB3+: the opening cinematic should let the visualizer fill the entire space without competing with too many UI elements.

### 2. Hard Dark/Light Mode Switches
Sections don't cross-fade between modes — they SNAP. Cream → dark teal is a sharp boundary (though with Lenis smoothing it feels smooth). For VIB3+: system/parameter presets should change sharply at section boundaries, not gradually.

### 3. Zigzag Asymmetric Cards
Case study cards alternate: image-right → image-left → image-right. This creates visual rhythm and prevents monotony. For VIB3+: cascade cards or triptych panels should have alternating asymmetry rather than centered symmetry.

### 4. Floating Product Objects
Images are positioned OUTSIDE their text columns, overlapping into adjacent space. This creates real depth layers. For VIB3+: visualizer canvases could extend beyond their logical containers, bleeding into adjacent sections.

### 5. Marquee CTA
"Work with us" scrolls infinitely horizontally. This adds persistent motion that's independent of scroll position. For VIB3+: a parameter-driven text ticker or rotating geometry showcase could serve the same purpose.

### 6. Outlined Typography Echo
The hero's filled "SIMONE" becomes outlined/stroked at the footer. The same shape, different rendering. For VIB3+: the same geometry could be shown in different visualization systems at different scroll positions (Quantum fill → Faceted outline).

### 7. Subtle Noise Texture
Both light and dark backgrounds have a visible noise/grain texture overlay. This adds tactile quality and prevents "flat digital" feeling. For VIB3+: a CSS grain overlay on sections would add this same warmth.

---

*Analysis based on actual Playwright screenshots captured with wheel-event scrolling.*
