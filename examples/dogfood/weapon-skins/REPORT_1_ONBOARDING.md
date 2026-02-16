# REPORT 1: ONBOARDING -- Weapon Skin Modding Engine

**Author**: Dogfood Agent (Opus 4.6)
**Date**: 2026-02-15
**Task**: Build a weapon skin modding engine using VIB3+ 4D shader effects
**Time reading docs**: ~20 minutes across CLAUDE.md, 3 skill files, synesthesia.html, FacetedSystem.js, QuantumVisualizer.js

---

## What I Learned About VIB3+ Capabilities

### The Shader System Is Well-Documented and Consistent
The three visualization systems (Faceted, Quantum, Holographic) all share the same mathematical foundation:
- **6D rotation matrices** (XY, XZ, YZ, XW, YW, ZW) applied in strict order
- **fract()-based lattice geometry** (NOT raymarched SDFs -- this is called out explicitly and is critical)
- **4D perspective projection**: `vec3 proj = p.xyz * (d / (d + p.w))`
- **24 geometry variants**: 8 base geometries x 3 core warps (Base, Hypersphere, Hypertetrahedron)

The synesthesia.html example is an excellent reference -- it demonstrates how to extract the shared GLSL, build 3 independent shader programs, and hot-swap between them. The pattern of a shared GLSL preamble + system-specific main() functions is clean and reusable.

### Parameter API Is Clear
All parameters have well-defined ranges documented in CLAUDE.md:
- `geometry` (0-23), `hue` (0-360), `saturation` (0-1), `intensity` (0-1)
- `chaos` (0-1), `speed` (0.1-3), `gridDensity` (4-100), `morphFactor` (0-2)
- `dimension` (3.0-4.5), six rotation planes (0-2pi each)

### Reactivity Is Built Into the Shader Uniforms
The existing uniforms include `u_mouseIntensity`, `u_clickIntensity`, `u_mouse`, `u_bass`, `u_mid`, `u_high` -- all directly usable for weapon skin reactivity without inventing new patterns.

### The 5-Layer System Can Be Single-Pass
The vib3-create skill explicitly documents a single-pass 5-layer composite technique using GLSL blend math. For a single-canvas weapon skin preview, this is the way to go -- avoids the 5-canvas-per-system overhead.

---

## Architectural Plan

### Core Design: Weapon Shape Masking via SDF in Fragment Shader
Rather than using DOM-based clipping or canvas compositing, I will define weapon silhouettes as 2D signed distance functions (SDFs) directly in the fragment shader. This gives:
- Pixel-perfect weapon shape masking
- Smooth anti-aliased edges
- Mouse proximity detection relative to weapon surface (distance to SDF = proximity glow)
- No DOM complexity -- pure GPU

### Weapon Shapes (5 silhouettes)
1. **Combat Knife** -- simple blade + handle SDF
2. **Assault Rifle** -- stock + barrel + magazine profile
3. **Pistol** -- compact handgun silhouette
4. **Sniper Rifle** -- long barrel + scope
5. **Sword** -- fantasy blade with crossguard

Each weapon will be a separate SDF function. The active weapon determines which SDF masks the shader output.

### Shader Architecture
```
SHARED_GLSL (6D rotation, 4D projection, 8 lattice geometries, core warps, HSL)
  +-- Weapon SDF functions (knife, rifle, pistol, sniper, sword)
  +-- Faceted main() -- clean geometric skin
  +-- Quantum main() -- complex lattice skin
  +-- Holographic main() -- layered atmospheric skin
```

Each system's main() will:
1. Compute UV coordinates
2. Evaluate weapon SDF for masking + proximity glow
3. Apply 6D rotation + lattice geometry
4. Apply system-specific coloring
5. Composite with edge glow based on SDF distance
6. Output final color with weapon shape mask

### UI Layout (Dark Theme)
```
+--------------------------------------------------+
| HEADER: "VIB3+ WEAPON SKIN FORGE"                |
+--------------------------------------------------+
| LEFT PANEL (280px)  |  CENTER (flex)  | RIGHT (280px) |
| - Weapon selector   |  Weapon preview |  - Preset mgmt |
| - System selector   |  (WebGL canvas) |  - Comparison   |
| - Geometry picker   |                 |  - Export       |
| - Parameter sliders |                 |                 |
| - Rotation controls |                 |                 |
| - Reactivity config |                 |                 |
+--------------------------------------------------+
| FOOTER: Status bar / FPS / active geometry name   |
+--------------------------------------------------+
```

### Reactivity System
- **Mouse proximity**: Distance from cursor to weapon SDF edge drives `u_mouseIntensity`
- **Click pulse**: Click triggers `u_clickIntensity` spike that decays over 500ms
- **Hover glow**: When cursor is near weapon edge (<0.05 SDF distance), add edge highlight
- **Parameter change animation**: When a slider changes, briefly boost `chaos` for visual feedback

### Preset Management
- Save/load presets to `localStorage` keyed by user-chosen name
- Each preset stores: system, geometry, all visual parameters, all rotation values
- Import/export as JSON for sharing between modders
- Built-in starter presets: "Dragon Fire", "Void Crystal", "Neon Circuit", "Arctic Storm", "Cosmic Blade"

### Side-by-Side Comparison
- Split the canvas into two halves
- Left shows Preset A, right shows Preset B
- Both render simultaneously with independent uniforms
- Useful for A/B testing skin variations

---

## SDK Documentation Gaps / Confusing Areas

### 1. Hue Range Inconsistency
CLAUDE.md says `hue: 0-360` in the parameter table, but the synesthesia.html example uses `hue: 0-1` (normalized). The Faceted shader divides by 360 (`u_hue / 360.0`), while the Quantum shader appears to expect 0-1 directly (`u_hue`). This inconsistency would confuse any developer building standalone artifacts -- you need to know which convention your shader expects.

**Impact on my build**: I will normalize hue to 0-1 in the shader and use 0-360 in the UI, dividing at the uniform-setting boundary. But I had to read two different shader source files to figure this out.

### 2. No Standalone Shader Extraction Guide
The skill files say "always read source files before generating shader code" but there is no guide for extracting VIB3+ shaders into standalone HTML artifacts. The synesthesia.html example is the closest thing, but it is 1280 lines and not documented as a reference pattern. A "How to build standalone VIB3+ demos" guide would save significant time.

### 3. Weapon/Object Masking Is Unexplored Territory
The SDK has no concept of applying shader output to arbitrary shapes. The 5-layer canvas architecture renders to full-screen rectangles. For game modding use cases (applying VIB3+ as a texture/skin), there is no SDK support for shape masking, UV mapping to mesh surfaces, or clipping regions. This is a significant gap for the gaming persona.

### 4. The `u_roleIntensity` Uniform Is a Code Smell
The Quantum shader uses `u_roleIntensity` with magic numbers (0.7, 1.0, 0.85, 0.6) to determine which layer is being rendered. This is fragile -- any slight floating-point deviation breaks the layer selection. A proper integer uniform (`u_layerIndex`) would be cleaner.

### 5. Breath Uniform Not in Synesthesia Example
The `u_breath` uniform from the VitalitySystem exists in the SDK shaders but is not present in synesthesia.html. For standalone builds, it is unclear whether this should be simulated or omitted.

---

## Concerns About Feasibility

### Weapon SDF Complexity
Building recognizable weapon silhouettes as SDFs is moderately complex but feasible. I will use combinations of box SDFs, circle SDFs, and smooth unions/subtractions. The shapes do not need to be photorealistic -- clean, recognizable silhouettes are sufficient for a modding tool.

### Single WebGL Context Budget
My design uses a single WebGL context with 3 compiled shader programs (one per system). This is well within the 16-context browser limit and matches the synesthesia.html pattern.

### Performance
A single fullscreen fragment shader with SDF masking + lattice geometry should run at 60fps on any modern GPU. The synesthesia.html example runs fine, and my shader will be comparable in complexity.

### No External Dependencies
Self-contained HTML requirement means no Three.js, no React, no build tools. This is actually fine -- the synesthesia.html example proves the pattern works. WebGL + vanilla JS + CSS is sufficient.

---

## Summary

The VIB3+ SDK provides excellent mathematical and shader foundations for this project. The 6D rotation math, fract()-based geometry, and 4D projection are well-documented and work correctly in standalone builds. The main gaps are around gaming-specific use cases (shape masking, mesh texturing) and minor documentation inconsistencies (hue range, standalone build patterns).

I am confident this build is feasible. The architectural plan is solid. Proceeding to implementation.
