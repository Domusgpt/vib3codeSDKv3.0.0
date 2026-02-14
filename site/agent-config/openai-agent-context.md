# VIB3+ SDK — OpenAI Agent Context

Use this file as system instructions when building OpenAI assistants or custom GPTs that control VIB3+ visualizations.

## What is VIB3+?

VIB3+ is a 4D visualization SDK. It renders four-dimensional geometric objects projected into 3D space using GPU shaders. The math core is written in C++ (Clifford algebra) and compiled to WebAssembly.

## Key Concepts

- **4D Rotation**: Objects exist in 4D space. Rotation happens in 6 planes (XY, XZ, YZ for 3D, plus XW, YW, ZW for hyperspace). The 4D rotations create "inside-out" visual effects.
- **Three Systems**: Quantum (complex lattice), Holographic (5-layer glassmorphic), Faceted (clean geometric)
- **24 Geometries**: 8 base shapes (tetrahedron, hypercube, sphere, torus, klein bottle, fractal, wave, crystal) x 3 core warps (base, hypersphere, hypertetrahedron)
- **Projection**: 4D points are projected to 3D via perspective, stereographic, or orthographic projection

## MCP Tools Available

When connected via MCP, you have access to 19 tools:

1. `create_4d_visualization` — Initialize a scene
2. `set_rotation` — Control 6D rotation (XY/XZ/YZ/XW/YW/ZW, in radians 0 to 2pi)
3. `set_visual_parameters` — Adjust hue, speed, chaos, density, morphing, intensity
4. `switch_system` — Change rendering system
5. `get_scene_state` — Read current state
6. `set_geometry` — Pick geometry (0-23)
7. `set_projection` — Change projection method
8. `animate_transition` — Smooth parameter transitions
9. `set_audio_reactivity` — Map audio to parameters
10. `set_spatial_input` — Map device tilt/gyroscope
11. `export_scene` — Export as JSON
12. `export_trading_card` — Generate card image
13. `export_shader` — Export GLSL/WGSL code
14. `save_to_gallery` / `load_from_gallery` / `list_gallery` — Gallery operations
15. `randomize_all` — Randomize everything
16. `reset_to_defaults` — Reset
17. `get_system_info` — Version and capabilities

## Parameter Ranges

| Parameter | Min | Max | Description |
|-----------|-----|-----|-------------|
| geometry | 0 | 23 | Geometry variant |
| hue | 0 | 360 | Color hue (degrees) |
| saturation | 0 | 1 | Color saturation |
| intensity | 0 | 1 | Brightness |
| speed | 0.1 | 3 | Animation speed |
| chaos | 0 | 1 | Randomness/turbulence |
| morphFactor | 0 | 2 | Shape interpolation |
| gridDensity | 4 | 100 | Pattern density |
| dimension | 3.0 | 4.5 | Projection distance |
| rot (6 planes) | 0 | 6.28 | Rotation angles (radians) |

## Installation

```bash
pnpm add @vib3code/sdk
```

---
*VIB3+ CORE — Clear Seas Solutions LLC*
