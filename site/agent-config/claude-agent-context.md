# VIB3+ SDK — Claude Agent Context

Use this file as system context when building Claude agents that control VIB3+ visualizations via MCP.

## SDK Overview

VIB3+ is a 4D visualization SDK with:
- **C++ WASM Core** — Cl(4,0) Clifford algebra rotors for mathematically rigorous 4D rotation
- **WebGPU/WebGL dual backend** — GPU-accelerated rendering with automatic fallback
- **3 rendering systems** — Quantum (lattice), Holographic (5-layer glassmorphic), Faceted (clean 2D geometric)
- **24 geometry variants** — 8 base shapes x 3 core types (Base, Hypersphere, Hypertetrahedron)
- **6D rotation** — All 6 rotation planes: XY, XZ, YZ (3D) + XW, YW, ZW (4D hyperspace)
- **MCP server** — 19 tools for full programmatic control

## MCP Tool Reference

### Scene Management
- `create_4d_visualization` — Create a scene with system, geometry, and projection
- `get_scene_state` — Get current parameter state
- `switch_system` — Switch between quantum/holographic/faceted
- `reset_to_defaults` — Reset all parameters
- `get_system_info` — Get SDK version and capabilities

### Geometry & Rotation
- `set_geometry` — Set geometry index (0-23)
- `set_rotation` — Set 6D rotation angles (XY, XZ, YZ, XW, YW, ZW in radians)
- `set_projection` — Set projection method (perspective, stereographic, orthographic)

### Visual Parameters
- `set_visual_parameters` — Set hue (0-360), saturation (0-1), intensity (0-1), speed (0.1-3), chaos (0-1), morphFactor (0-2), gridDensity (4-100), dimension (3.0-4.5)
- `randomize_all` — Randomize all parameters

### Animation & Reactivity
- `animate_transition` — Smooth transition between parameter states
- `set_audio_reactivity` — Configure audio-reactive parameter mapping
- `set_spatial_input` — Configure spatial input (tilt, gyroscope, etc.)

### Export & Gallery
- `export_scene` — Export current scene as JSON
- `export_trading_card` — Generate a trading card image
- `export_shader` — Export GLSL/WGSL shader code
- `save_to_gallery` — Save current state to gallery
- `load_from_gallery` — Load a saved state
- `list_gallery` — List all saved states

## Example Usage

```javascript
// Create a quantum visualization with a hypersphere torus
await mcp.callTool('create_4d_visualization', {
  system: 'quantum',
  geometry_index: 11,
  projection: 'perspective'
});

// Set 4D hyperspace rotation
await mcp.callTool('set_rotation', {
  XW: 1.57,
  YW: 0.8,
  ZW: 0.3
});

// Adjust visual parameters
await mcp.callTool('set_visual_parameters', {
  hue: 280,
  chaos: 0.4,
  speed: 1.5,
  gridDensity: 32
});
```

## Geometry Index Reference

| Index | Name | Core Type |
|-------|------|-----------|
| 0 | Tetrahedron | Base |
| 1 | Hypercube | Base |
| 2 | Sphere | Base |
| 3 | Torus | Base |
| 4 | Klein Bottle | Base |
| 5 | Fractal | Base |
| 6 | Wave | Base |
| 7 | Crystal | Base |
| 8-15 | Hyper-{shape} | Hypersphere |
| 16-23 | HT-{shape} | Hypertetrahedron |

## Installation

```bash
pnpm add @vib3code/sdk
```

---
*VIB3+ CORE — Clear Seas Solutions LLC*
