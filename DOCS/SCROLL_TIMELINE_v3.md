# VIB3+ Landing Page — Complete Scroll Timeline v3

## GPU-First Redesign: Real Visualizers Everywhere

**Core principle**: Canvas2D (AmbientLattice) is ONLY for the cascade cards (small cards where GPU contexts would be wasted). Every section background, every dramatic moment uses REAL GPU systems — Quantum, Holographic, Faceted — in coordinated multi-system arrangements.

**ContextPool budget**: Max 3 concurrent. Sections are sequential + pinned, so we acquire/release at boundaries.

---

## SCROLL MAP (Approximate vh positions)

```
Position    Section              GPU Contexts Active        Multi-System Events
─────────── ──────────────────── ─────────────────────────── ─────────────────────────
0-800vh     OPENING              1: Quantum (opening)        Solo: canvas → text mask → lattice
~800vh      divider              0→1 swap                    Portal glow transition
800-900vh   HERO                 1: Quantum (hero)           Solo: parameter arc builds energy
~900vh      divider              1→1 swap                    Flash handoff hero→morph
900-2100vh  MORPH (pinned)       1: Q→H→F rotating          System swap choreography
~2100vh     divider              1→1                         Portal out
2100-2400vh PLAYGROUND           1: user-controlled          Interactive — user drives
~2400vh     divider              1→3 acquire                 Three-system awakening
2400-2600vh TRIPTYCH             3: Q+H+F split-screen       ★ CLIP-PATH TERRITORY WAR
~2600vh     divider              3→2 swap                    ★ TRIPTYCH→CASCADE HANDOFF
2600-3000vh CASCADE (pinned)     2: Q+H background           ★ DUAL GPU BEHIND CARDS
                                  + Canvas2D cards            GPU systems react to active card
~3000vh     divider              2→2 swap                    ★ CASCADE→ENERGY HANDOFF
3000-3250vh ENERGY (pinned)      2: Q bg + F card            ★ TWO-SYSTEM ENERGY EXCHANGE
~3250vh     divider              2→1                         Drain → agent
3250-3400vh AGENT                1: H background             GPU holographic behind code
~3400vh     divider              1→2 acquire                 ★ FINALE BUILDS
3400-3500vh CTA                  2: Q+F dueling              ★ DUAL SYSTEM FINALE
~3500vh     footer               0                           Silence
```

---

## SECTION-BY-SECTION CHOREOGRAPHY

### 1. OPENING (0-800vh) — Solo Quantum

**GPU**: 1 context (Quantum → `opening-canvas`)
**Multi-system**: None (intentional — solo introduction)

| Scroll %  | Phase                    | Parameters                          |
|-----------|--------------------------|-------------------------------------|
| 0-12%     | Dark canvas, subtle      | intensity: 0.3→0.5, geo: 11        |
| 12-35%    | Text letters cascade in  | hue: 220→280, rot4dXW accelerates   |
| 28-48%    | SVG mask: canvas through text | chaos: 0.05→0.4, speed rises    |
| 45-75%    | Lattice parallax layers  | gridDensity oscillates, dimension drops |
| 74-96%    | Text fades, lattice locks| speed settles, intensity peaks 0.85 |
| 96-100%   | Everything fades out     | intensity→0                         |

---

### 2. HERO (800-900vh) — Solo Quantum

**GPU**: 1 context (Quantum → `hero-canvas`)

| Scroll %  | Phase                    | Parameters                          |
|-----------|--------------------------|-------------------------------------|
| 0-25%     | Calm lattice, badges in  | geo: 3, speed: 0.4, chaos: 0.05    |
| 25-55%    | Geometry shift, energy builds | geo: 2→4, rot4dXW ramps, density↑ |
| 55-80%    | Peak energy              | hue sweeps 210→290, chaos↑, morph peaks |
| 80-100%   | Dramatic 4D rotation burst | rot4dZW spike, dimension drops     |

Content: Badge → title chars → subtitle → system label → scroll indicator

---

### 3. MORPH (900-2100vh pinned) — Rotating Single System

**GPU**: 1 context, swaps Q(stages 0-1) → H(stages 2-3) → F(stages 4-5)

6 stages, each ~200vh:
- **Emergence**: Low density, slow, Quantum
- **Dimensional Shift**: rot4dXW ramps, Quantum
- **Three Voices**: Voice labels appear, Holographic
- **Convergence**: Card grows, density peaks, Holographic
- **Spectral Rupture**: Card near-fullscreen, max chaos/speed, Faceted
- **Resolution**: Card shrinks, calm, Faceted

Card morphs: circle → rounded rect → holds → grows → near-fullscreen → medium

---

### 4. PLAYGROUND (2100-2400vh) — User-Controlled

**GPU**: 1 context (user picks Q/H/F)
No choreography — user drives all params via sliders.

---

### 5. TRIPTYCH (2400-2600vh) — ★ THREE-SYSTEM SPLIT-SCREEN

**GPU**: 3 contexts (Quantum left, Holographic center, Faceted right)

This is the first multi-system moment. All 3 visualization engines running simultaneously.

| Scroll %  | Phase                        | Coordination Event                      |
|-----------|------------------------------|-----------------------------------------|
| 0-15%     | Columns slide in             | Left dominates (40% width), right small (26%) |
| 15-30%    | Systems differentiate        | Triadic hue rotation, phase-locked 4D rotation at 120° offsets |
| 30-50%    | ★ CONVERGENCE                | Columns equalize, shared heartbeat peaks, hues pull toward unity |
| 50-70%    | Call & response              | Left chaos → center speed → right morph (chain reaction) |
| 70-85%    | Right dominates              | Split lines shift: right takes 40%, left shrinks to 26% |
| 85-100%   | ★ CRYSTALLIZATION BRIDGE     | All 3 systems: density↑↑, speed→0, chaos→0 (frozen moment) |

**Coordination signals** (all running simultaneously):
1. **Shared heartbeat**: `sin(p * PI * 2)` — pulse all 3 systems breathe to
2. **Energy conservation**: total intensity ≈ 2.0 distributed across 3 systems
3. **Triadic hue**: base rotates, each system 120° apart, converges at midpoint
4. **Phase-locked 4D**: rot4dXW at 0°, 120°, 240° — a coordinated 4D dance
5. **Density cross-feed**: left ramps up, right ramps down, center bridges
6. **Call & response**: left chaos → center speed → right morphFactor chain
7. **Mouse X shifts split lines**: cursor position moves column boundaries ±6%

---

### 6. CASCADE (2600-3000vh pinned) — ★ DUAL GPU + Canvas2D Cards

**GPU**: 2 contexts (Quantum + Holographic as shared background)
**Canvas2D**: AmbientLattice for individual card faces only

**NEW**: Two real GPU systems render as a SPLIT-SCREEN BACKGROUND behind the scrolling cards. As the active card changes, the GPU backgrounds react — one mirrors the card's geometry, the other plays the complementary opposite. The card scroll position drives the split line between the two GPU backgrounds.

| Scroll %  | Phase                         | GPU Background Behavior                |
|-----------|-------------------------------|----------------------------------------|
| 0-10%     | Cards enter with stagger      | Q+H backgrounds fade in, split 50/50   |
| 10-30%    | Card 0 active (Tetra, 190°)   | Q mirrors: geo 0, hue 190. H opposes: geo 16, hue 10 |
| 30-50%    | Card 1 active (HTorus, 300°)  | Q: geo 11, hue 300. H: geo 5, hue 120  |
| 50-70%    | Card 2 active (HTetra, 35°)   | Q: geo 16, hue 35. H: geo 2, hue 215   |
| 70-90%    | Card 3+ active                | Split line tracks card position         |
| 90-100%   | Cards exit, GPUs crystallize  | Both systems converge to same params    |

**Card-GPU coordination**:
- Active card's AmbientLattice params echo into GPU backgrounds (dampened)
- GPU backgrounds' rotation drives CSS `--q-xw` for card tilt effects
- Split between Q and H follows mouse X position ±15% from center
- When cards cross the GPU split line: flash transition, hue swap

---

### 7. ENERGY (3000-3250vh pinned) — ★ TWO-SYSTEM ENERGY EXCHANGE

**GPU**: 2 contexts (Quantum background + Faceted card)

Two real GPU systems that actively EXCHANGE energy through the GSAP timeline.

| Scroll %  | Phase                         | Multi-System Event                      |
|-----------|-------------------------------|-----------------------------------------|
| 0-15%     | BG awakens, card enters       | Q bg: low intensity. F card: rising from below |
| 15-30%    | Card overshoot + settle       | Q bg: responds to card motion — intensifies as card peaks |
| 30-50%    | Hold — tilt interactive       | Q bg + F card: counter-rotation. Card chaos → bg brightness |
| 50-60%    | ★ ENERGY DRAIN                | Card intensity drains TO background. Q bg: max intensity, hue shifts |
| 60-75%    | ★ GEOMETRY MORPH              | Card & bg swap geometries — card gets bg's geo, bg gets card's |
| 75-88%    | ★ ENERGY RETURN               | Background drains back TO card. Inverse of drain phase |
| 88-100%   | Card spins out                | Q bg fades, card exits with rotation    |

**"Energy Transfer" button**: Triggers full drain→morph→return cycle as a GSAP timeline independent of scroll:
1. Card: intensity 0.6→0.05, density 30→4, chaos spikes
2. Background: intensity 0.2→0.8, density 16→55, hue shifts 90°
3. Both: geometry swap, rot4dXW = PI
4. Reverse: everything smoothly returns over 2.5s

---

### 8. AGENT (3250-3400vh) — Single GPU Background

**GPU**: 1 context (Holographic → `agent-canvas`)

**NEW**: Replace Canvas2D with Holographic GPU system. The 5-layer glassmorphic holographic system is perfect behind glassmorphic agent cards — visual language matches.

| Scroll %  | Phase                        | GPU Behavior                           |
|-----------|------------------------------|----------------------------------------|
| 0-20%     | Header reveals               | H: low intensity, geo 3, slow          |
| 20-60%    | Agent cards stagger in       | H: each card reveal triggers a density pulse |
| 60-80%    | Code block reveals           | H: hue shifts toward code-highlight colors |
| 80-100%   | ★ CRESCENDO BUILD            | H: speed↑↑, chaos↑↑, density↑↑, vignette closes |

**Speed crescendo** (pre-CTA dramatic tension):
- 60% → 80%: All params accelerate exponentially
- 80% → 88%: THE SILENCE — everything drops to zero, full black
- 88% → 100%: Gentle rebirth — minimal intensity, slow speed, setting up CTA

---

### 9. CTA (3400-3500vh) — ★ DUAL SYSTEM FINALE

**GPU**: 2 contexts (Quantum + Faceted as dueling finales)

**NEW**: The final section gets TWO real GPU systems that DUEL — split screen, opposing parameters, converging at the end to create a unified "come together" moment.

| Scroll %  | Phase                         | Multi-System Event                      |
|-----------|-------------------------------|-----------------------------------------|
| 0-20%     | Emerge from silence           | Q left, F right — both at intensity 0.1, slowly rising |
| 20-40%    | Systems differentiate         | Q: cool hues, high density, slow. F: warm, low density, fast |
| 40-60%    | ★ OPPOSITION                  | Q + F: opposing rotations, complementary hues, fighting |
| 60-80%    | ★ CONVERGENCE                 | Systems pull toward matching params — hues merge, speed syncs |
| 80-100%   | ★ UNITY                       | Both match: same hue, same rotation, same geometry — ONE SYSTEM |

**Split line**: Diagonal (not vertical) — rotates from 45° to 0° (horizontal) to vertical during scroll.

---

## CROSS-SECTION COORDINATION EVENTS

### A. Triptych → Cascade Handoff (~2600vh)
1. Triptych's 3 GPUs crystallize (density max, speed zero, frozen)
2. Release 1 GPU (Faceted), keep Quantum + acquire Holographic for cascade BG
3. Flash transition on divider SVG
4. Cascade cards stagger-appear with chaos burst

### B. Cascade → Energy Handoff (~3000vh)
1. Cascade's dual BG systems converge to identical params
2. Release Holographic, swap Quantum to energy-bg, acquire Faceted for energy card
3. Energy card enters from below through cascade's frozen background

### C. Energy → Agent Handoff (~3250vh)
1. Energy's dual GPUs drain (card spins out, background fades)
2. Release both, acquire 1 Holographic for agent background
3. Agent section fades in over holographic backdrop

### D. Agent → CTA Handoff (~3400vh)
1. Agent Holographic accelerates in speed crescendo
2. THE SILENCE — everything drops to black
3. Release Holographic, acquire Quantum + Faceted for CTA finale
4. Dual systems emerge from darkness

---

## GPU CONTEXT LIFECYCLE (Max 3 Concurrent)

```
Section     | Slot 1          | Slot 2          | Slot 3
─────────── | ─────────────── | ─────────────── | ───────────────
Opening     | Quantum         |                 |
Hero        | Quantum         |                 |
Morph       | Q/H/F rotating  |                 |
Playground  | Q/H/F user      |                 |
Triptych    | Quantum         | Holographic     | Faceted
Cascade     | Quantum         | Holographic     |
Energy      | Quantum         | Faceted         |
Agent       | Holographic     |                 |
CTA         | Quantum         | Faceted         |
```

Peak usage: Triptych at 3/3. All other multi-system sections use 2/3.

---

## MOUSE/TOUCH REACTIVITY (Global)

Every visible GPU system responds to mouse position:
- **Triptych**: Mouse X shifts clip-path split lines (columns fight for space)
- **Cascade**: Mouse X shifts GPU background split line
- **Energy**: Mouse drives card tilt + background counter-rotation
- **CTA**: Mouse shifts diagonal split line angle
- **All sections**: Mouse Y drives subtle intensity modulation on visible GPU systems

---

## CANVAS2D (AmbientLattice) — MINIMAL USAGE

AmbientLattice ONLY used for:
1. **Cascade card faces** (4-6 small cards — GPU contexts would be wasted on small canvases)

NOT used for: energy background, agent background, CTA background (all now GPU)
