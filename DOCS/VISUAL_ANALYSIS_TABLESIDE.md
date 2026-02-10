# Visual Analysis: tableside.com.au

**Captured: 2026-02-10 via Playwright with wheel-based scrolling**
**Method**: Real Chromium screenshots at 5 scroll positions (wheel events)
**Page height**: 8,370px (~9.3x viewport)

---

## Scroll Journey (Frame by Frame)

### s00 — Top (scrollY=0)
**Bold typography hero with warm palette**
- Background: warm cream/beige (#F5EDE4 range)
- "TABLESIDE" logo top-left in coral/orange + "CREATIVES" subscript
- Hamburger menu (three lines) top-right in coral
- MASSIVE bold sans-serif text: "FOOD & DRINK DIGITAL CREATIVES" in coral/orange (#E85D3A range)
- Text fills ~70% of viewport, extremely bold weight (900+), tight line-height
- Below hero: "HOSPITALITY MARKETING AUSTRALIA" in black, right-aligned
- "WHAT WE DO" label left side
- Large body text in coral: "Crafting bold, unforgettable brands through content to propel hospitality and food & beverage businesses towards sustainable growth and standout success."
- Social links: INSTAGRAM, FACEBOOK, LINKEDIN, TIKTOK — right-aligned, stacked
- Chat widget bottom-right
- **Pattern**: Typography-as-hero with strong brand color. The hero text IS the brand statement, rendered in the signature coral color at maximum weight. Social links positioned as a sidebar element right-aligned.

### s01 — scrollY=2400
**Portfolio card: asymmetric split layout**
- Large food photography LEFT (~50% viewport width): close-up of artisanal pizza
- Card text RIGHT: "ROCCELLA EAST MELB" restaurant name + orange icon
- "WEB, CONTENT, PAID, SOCIAL & EDM" service tags + "+ INFO" link in coral
- Below: second portfolio card beginning — dark photo of restaurant interior
- "STEER DINING ROOM" title overlaid on dark photo, bottom-left
- **Pattern**: Asymmetric portfolio cards. Image takes one half, text the other. The split is ~50/50 with generous spacing. Different cards have different background treatments (light photo vs dark atmospheric photo).

### s02 — scrollY=4800
**Small dark portfolio card**
- Dark restaurant interior photo with chefs in white uniforms
- "WAGYU YA TEPPANYAKI" title overlaid top in white
- "WEB, CONTENT, PAID, SOCIALS & EDM" service tags bottom-left
- "YAKIKAMI" title visible below
- Card appears much smaller than previous cards (~40% viewport height)
- **Pattern**: Variable card sizing. Not all portfolio cards are the same size. This card is notably smaller and darker than the previous ones, creating visual rhythm through size variation.

### s03 — scrollY=7200
**CTA section with strong color**
- Solid coral/orange background filling top ~40% of viewport
- "READY TO TAKE A SEAT AT OUR TABLE?" in large white text, centered
- "BOOK FREE STRATEGY SESSION" button: white border on coral background, centered
- Below CTA: split-color footer section
  - LEFT half: warm cream with contact info, address, phone, hours
  - RIGHT half: dark navy (#1A1A3E) with food photography (overhead table shot with multiple dishes)
  - Photo floats slightly above the navy background edge

### s04 — scrollY=7470 (bottom)
**Footer nav + legal**
- Footer navigation bar: HOME, WORK, SERVICES, ABOUT US, JOBS, CONTACT, NEWS (left-aligned in coral)
- Social links: INSTAGRAM, FACEBOOK, LINKEDIN (right-aligned in coral)
- Bottom bar: Privacy Policy, "TABLESIDE" centered logo, © 2024
- **Pattern**: Footer uses the brand coral for all link text against cream background. Clean horizontal nav layout.

---

## Key Design Patterns for VIB3+ Translation

### 1. Three-Tone Palette (Cream + Coral + Navy)
The site uses exactly three colors consistently: warm cream background, coral/orange for typography and accents, dark navy for contrast sections. No gradients, no additional colors.
**For VIB3+**: A disciplined three-tone palette could anchor the landing page — e.g., dark background + one accent hue from the visualizer + white text.

### 2. Variable Portfolio Card Sizing
Portfolio cards are NOT uniform. Some span full viewport height, others are compact. Some have light photos, others have dark atmospheric shots. Size variation creates rhythm.
**For VIB3+**: Cascade cards don't all need to be the same size. The clip-path morphing system could make some cards appear larger (wider window) and others more compact (narrower window), even though the underlying card is the same size.

### 3. Split-Color Sections
The contact/footer area uses a vertical split: cream on the left, navy on the right, with a food photo bridging the two zones. This creates a strong compositional split.
**For VIB3+**: Could use a vertical split in the CTA or feature sections — one half showing one visualization system, the other showing a different one.

### 4. CTA as Bold Color Block
The CTA section is a solid block of coral color with white text. Simple, bold, impossible to scroll past without noticing.
**For VIB3+**: The CTA section could use a solid color block with a visualizer running behind it at low opacity, creating color + depth.

### 5. Service Tags as Metadata
Each portfolio card lists specific services (WEB, CONTENT, PAID, SOCIAL & EDM) in small uppercase text. This adds information density without cluttering the visual.
**For VIB3+**: Cascade cards could show parameter metadata (geometry name, system type, hue value) in small utility text that adds technical depth.

---

*Analysis based on actual Playwright screenshots captured with wheel-event scrolling.*
