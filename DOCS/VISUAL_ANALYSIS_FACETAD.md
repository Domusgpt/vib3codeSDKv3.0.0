Last reviewed: 2026-02-17

# Visual Analysis: facetad.com

**Captured: 2026-02-10 via Playwright with wheel-based scrolling**
**Method**: Real Chromium screenshots at 10 scroll positions (wheel events)
**Page height**: 15,082px (~16.8x viewport)

---

## Scroll Journey (Frame by Frame)

### s00 — Top (scrollY=0)
**Ultra-minimal hero: single line of text on vast cream emptiness**
- Background: warm cream/off-white (#F5F0EB range)
- Centered text: "We approach every facet of design with a sense of wonder."
- Text is small, light gray, serif — occupies maybe 5% of viewport
- Tiny chevron/scroll indicator below text
- No nav, no logo visible at top — just vast empty space above and below
- **Pattern**: Extreme negative space. The emptiness IS the design. Forces the eye to the single sentence.

### s01 — scrollY=1680
**Parallelogram image explosion around centered logo**
- FACET logo + "ARCHITECTURAL DESIGN" centered
- Tagline below logo
- 6+ architectural photos SCATTERED around the logo in **parallelogram/skewed clip-paths**
- Images are different sizes, at different angles/positions
- Images overlap each other and the logo text
- Some images partially exit viewport edges
- **Pattern**: Scattered parallelogram gallery. Images use CSS `transform: skew()` or `clip-path: polygon()` to create non-rectangular shapes. Creates a chaotic but visually rich collage effect.

### s02 — scrollY=3360
**Full parallelogram gallery — maximum density**
- ~20+ architectural photos visible, ALL in parallelogram shapes
- Images scattered across entire viewport at various sizes (small thumbnails to medium)
- FACET logo still centered but partially obscured by overlapping images
- Some images overlap each other creating depth layers
- Images appear to float at different z-levels
- **Pattern**: This is the peak of the scatter effect. The sheer density + non-rectangular shapes + overlap creates an effect like looking through a shattered window at many projects simultaneously. Very strong depth illusion.

### s03 — scrollY=5040
**Large diagonal project images**
- Two massive project photos with strong diagonal clip-path edges
- Top: building at dusk with warm-lit windows, cut diagonally
- Bottom-right: bright blue architectural image, also cut diagonally
- A red/orange geometric element visible at top-right (matching brand color)
- Images take up most of viewport, overlapping
- **Pattern**: From scattered small thumbnails, the images have GROWN into massive hero-sized images. The diagonal edges create dramatic slash transitions between photos. This is the parallelogram theme at architectural scale.

### s04 — scrollY=6720
**Single massive image with diagonal wipe to cream**
- Top-left: large project photo (modern building exterior with glass, lawn, outdoor seating)
- Diagonal edge cuts from top-left to bottom-right
- Below the diagonal: pure cream emptiness
- The diagonal creates a dramatic "wipe" transition from content to void
- **Pattern**: Diagonal section transition. Not horizontal, not curved — a sharp diagonal slash separates photo content from empty space. This is how facetad handles section boundaries.

### s05 — scrollY=8400
**Markets section: overlapping photos + text**
- Top: "MARKETS WE SERVE" heading in red/terracotta
- Two large photos side by side showing hospitality interior (bar/restaurant)
- Photos overlap slightly, creating a diptych
- Right side: "HOSPITALITY" heading in red italic + body text paragraph
- Classic asymmetric layout: images LEFT, text RIGHT
- **Pattern**: Asymmetric portfolio section — large overlapping photos paired with small text. The overlap between the two photos adds depth.

### s06 — scrollY=10080
**Services section: clean asymmetric layout**
- "OUR DESIGN SERVICES" heading top-left in small red text
- "ARCHITECTURE" heading in large red italic text, left side
- Body text paragraph below heading
- Large architectural rendering (aerial view of commercial building) floats right at ~55% width
- Image has subtle shadow/depth
- Clean, spacious layout with generous white space
- **Pattern**: Standard asymmetric card (text left, image right) but with extreme white space. The image is large and positioned to feel like it's floating above the page.

### s07 — scrollY=11760
**Services continued + diagonal color transition beginning**
- "OUR DESIGN SERVICES" still visible at top
- "FF&E" heading in red italic with body text, left side
- No image — text only section
- Bottom of viewport: the red/terracotta color BEGINS appearing as a diagonal band
- The diagonal enters from bottom-right, cutting upward to the left
- **Pattern**: The diagonal section divider is introducing the red brand color. It's the same diagonal slash pattern but now used for a full COLOR MODE TRANSITION (cream → red).

### s08 — scrollY=13440
**Full diagonal color split: red to cream**
- Top ~40%: solid red/terracotta (#C0392B range)
- Diagonal slash cuts from upper-left to lower-right
- Bottom ~60%: back to cream
- "START A CONVERSATION" in large red italic text on cream
- "Talk with one of our award-winning architects about your next project." body text
- "Schedule A Call" link in red
- **Pattern**: The CTA section uses the diagonal color split as a dramatic reveal. The red block slides away diagonally to reveal the CTA on cream. Creates a cinematic wipe effect.

### s09 — scrollY=14182 (bottom)
**Footer: diagonal split cream/red**
- Top-left: cream background with FACET logo + address + contact info
- Diagonal divider cuts from upper-right to lower-left
- Bottom-right: solid red/terracotta background with nav links + social links + subscribe form
- "SUBSCRIBE" heading with email input and "SUBMIT" button
- "Website by Novel" credit at bottom-left
- **Pattern**: Footer echoes the diagonal theme. The entire footer is split diagonally — warm cream on one side, brand red on the other. The diagonal is the site's signature visual motif from hero through footer.

---

## Key Design Patterns for VIB3+ Translation

### 1. Parallelogram/Skewed Image Gallery
Project images use non-rectangular clip-paths (parallelograms, rhomboids). Images are scattered at different sizes, positions, and overlap each other. This creates a shattered-glass collage effect with real depth.
**For VIB3+**: Cascade cards could use parallelogram clip-paths instead of rectangles. The clip-path morphing system already supports polygon interpolation — add skewed/angled shapes to the shape sequence.

### 2. Diagonal Section Dividers
Every section boundary uses a diagonal slash — not horizontal lines, not curves. The same angle (~30-40 degrees) is used consistently.
**For VIB3+**: Section dividers could use angled clip-paths or CSS `polygon()` instead of horizontal borders. The diagonal creates much more visual energy than straight horizontal lines.

### 3. Density Progression (Sparse → Dense → Sparse)
The page starts with extreme emptiness (one line of text), builds to maximum density (20+ scattered images), then relaxes back to spacious layouts before ending with another sparse CTA.
**For VIB3+**: The morph stages should follow this arc — start minimal, build to visual complexity peak, then settle.

### 4. Diagonal Color Mode Transitions
The cream → red transition doesn't happen at a horizontal boundary. A diagonal band of red slashes across the viewport, creating a cinematic wipe effect.
**For VIB3+**: Dark/light mode switches could use diagonal clip-path animations instead of straight horizontal borders.

### 5. Extreme Negative Space
The hero is 95% empty. Text occupies a tiny fraction of the viewport. This forces attention and creates anticipation.
**For VIB3+**: The opening cinematic should start sparse — let the visualizer breathe in vast empty space before the content builds up.

### 6. Consistent Brand Angle
The diagonal angle is THE signature of the site. It appears in: image clip-paths, section dividers, color transitions, footer layout. The same ~30deg angle repeats everywhere.
**For VIB3+**: Pick a consistent geometric motif and repeat it across different contexts — clip-paths, dividers, card shapes, overlay patterns.

---

*Analysis based on actual Playwright screenshots captured with wheel-event scrolling.*
