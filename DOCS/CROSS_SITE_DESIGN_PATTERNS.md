Last reviewed: 2026-02-17

# Cross-Site Design Pattern Synthesis

**Based on actual visual analysis of 4 reference sites via Playwright screenshots**
**Sites**: weare-simone.webflow.io, facetad.com, clickerss.com, tableside.com.au
**Date**: 2026-02-10

---

## Universal Patterns (Found in 3+ Sites)

### 1. Typography-as-Hero
**Simone**: Giant "SIMONE" wordmark fills viewport
**Clickerss**: Massive B&W portrait, then enormous serif text sections
**Tableside**: "FOOD & DRINK DIGITAL CREATIVES" in bold coral fills 70% of viewport
**Facetad**: Single sentence in vast emptiness

**What it means**: The hero section is ONE thing — either giant text or a giant image. No competing elements. No "learn more" buttons, no description paragraphs, no gradient overlays.

**VIB3+ action**: The opening cinematic must be ONLY the text mask + visualizer. Kill any secondary UI that competes with the hero moment.

### 2. Asymmetric Card Layouts
**Simone**: Zigzag case study cards (image RIGHT, then LEFT, then RIGHT)
**Facetad**: Text LEFT + floating image RIGHT (services section)
**Tableside**: 50/50 split cards (photo one side, text other side)
**Clickerss**: Text-image interweaving (overlapping, not split)

**What it means**: No site uses centered, symmetric card layouts. Everything is offset, asymmetric, or alternating. Visual rhythm comes from the alternation pattern.

**VIB3+ action**: Cascade cards should have asymmetric overlay positioning. Alternate text LEFT/RIGHT between cards. The card overlays shouldn't be centered — push them to one side.

### 3. Non-Rectangular Image Boundaries
**Facetad**: ALL images use parallelogram clip-paths
**Simone**: Rounded-corner containers (~24px radius)
**Facetad**: Diagonal section dividers (30-40 degree angle)
**Clickerss**: Images overlapping text boundaries

**What it means**: Rectangular images are boring. Every site transforms image boundaries through clip-paths, rounded corners, diagonal edges, or overlap.

**VIB3+ action**: The clip-path polygon morphing system (rect → hex → diamond → oct → narrow) is exactly right. Also consider adding parallelogram/skewed shapes to the shape vocabulary.

### 4. Extreme Negative Space
**Facetad**: Hero is 95% empty
**Simone**: Hero is pure text, no images
**Clickerss**: Large gaps between sections
**Tableside**: Generous padding around portfolio cards

**What it means**: Premium sites use MORE empty space, not less. The content is given room to breathe.

**VIB3+ action**: Resist the urge to pack every section with content. The morph experience should have moments of sparse visualization (low density, simple geometry) as breathing room between intense moments.

---

## Distinctive Patterns (Site-Specific but Highly Applicable)

### 5. Diagonal Section Dividers (Facetad)
All section boundaries use a consistent diagonal angle. Cream → photo → cream → red → cream transitions happen along diagonal slashes, never horizontal lines.

**VIB3+ action**: Section dividers could use CSS `clip-path: polygon()` with angled edges instead of straight horizontal borders. A 15-20 degree angle would add visual energy.

### 6. Hard Dark/Light Mode Switches (Simone)
Cream → dark teal happens as a sharp boundary. The entire palette inverts. No cross-fade.

**VIB3+ action**: The morph stages already switch visualization parameters sharply between stages. Could also switch the page background color sharply at section boundaries (not just the visualizer hue).

### 7. Text-Image Interweaving (Clickerss)
Typography at 100-200px+ runs through/behind portfolio images. Text and images share the same spatial zone.

**VIB3+ action**: Section titles could extend BEHIND the cascade cards, visible through the clip-path window. This creates depth between the text layer and the visualizer layer.

### 8. Scattered Floating Gallery (Facetad)
Portfolio images scattered across viewport at various sizes and positions, all in parallelogram shapes, overlapping each other.

**VIB3+ action**: Could be used for a "gallery" or "showcase" section where multiple small visualizer thumbnails float at different positions with skewed clip-paths, each showing a different geometry.

### 9. Color Palette Discipline (All Sites)
**Simone**: cream + dark teal + chartreuse green (3 colors)
**Facetad**: cream + terracotta red (2 colors)
**Clickerss**: white + black (2 colors)
**Tableside**: cream + coral + navy (3 colors)

**What it means**: Maximum 3 colors. The visualizer provides the color variety — the page itself should be restrained.

### 10. Footer Echo (Simone)
The hero's filled "SIMONE" becomes outlined/stroked at the footer. Same shape, different rendering.

**VIB3+ action**: The CTA section should echo the hero — same visualizer geometry but in a different system (e.g., Quantum in hero → Faceted outline in CTA) or with inverted parameters.

### 11. Marquee/Infinite Scroll (Simone)
"Work with us" repeats horizontally as a continuous scrolling marquee.

**VIB3+ action**: A parameter ticker or geometry name marquee could add persistent horizontal motion independent of vertical scroll.

---

## Priority Actions for VIB3+ Landing Page

### Immediate (Apply to existing choreography)
1. **Add parallelogram shapes** to SHAPES vocabulary in choreography.js (`skewR`, `skewL` with angled edges)
2. **Asymmetric overlay positioning** — alternate cascade-overlay text LEFT/RIGHT per card
3. **Increase negative space** — add padding/margins between morph stages
4. **Increase hero text size** — opening cinematic text should fill more viewport
5. **Add service/parameter metadata** to cascade card overlays (geometry name, system type)

### Medium-term (New section patterns)
6. **Diagonal section dividers** — angled `clip-path` on section boundaries
7. **Footer echo** — CTA section uses same geometry as hero but different system
8. **Split-color CTA** — vertical or diagonal color split in CTA section
9. **Text-behind-card** effect — section titles visible through clip-path windows

### Aspirational (Major new features)
10. **Scattered gallery section** — multiple small visualizer thumbnails floating with parallelogram clip-paths
11. **Horizontal marquee** — continuous ticker with geometry names or parameter readouts
12. **Variable card sizing** — some cascade cards appear larger/smaller via clip-path window size

---

*Synthesized from actual Playwright visual analysis of 4 reference sites.*
