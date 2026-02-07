# VIB3+ SDK — Agent Context Pack (Claude)

> Precompiled context for Claude Code, Claude Desktop, and Claude API agents.
> Version: 2.0.1 | Systems: 3 | Geometries: 24 | Rotation planes: 6

## Core Concepts (5 facts)

1. **3 active systems**: `quantum` (complex lattice), `faceted` (clean geometry), `holographic` (5-layer audio-reactive). Polychora is TBD.
2. **24 geometries**: `index = coreType * 8 + baseGeometry`. Cores: base(0), hypersphere(1), hypertetrahedron(2). Bases: tetrahedron, hypercube, sphere, torus, klein_bottle, fractal, wave, crystal.
3. **6D rotation**: XY, XZ, YZ (3D) + XW, YW, ZW (4D hyperspace). Range: -6.28 to 6.28 radians. Order: XY then XZ then YZ then XW then YW then ZW.
4. **5 canvas layers** per system: background, shadow, content, highlight, accent.
5. **Vitality System**: Global breath cycle (6s period, 0-1 sine wave) modulating all systems.

## MCP Tool Workflow

```
1. get_sdk_context          → Understand the system
2. create_4d_visualization  → Create with system + geometry
3. set_rotation             → Set 6D rotation angles
4. set_visual_parameters    → Tune hue, speed, chaos, intensity
5. apply_behavior_preset    → Apply preset (ambient/reactive/immersive)
6. export_package           → Export as portable package
```

## Parameter Quick Reference

| Parameter | Range | Default | What it does |
|-----------|-------|---------|-------------|
| geometry | 0-23 | 0 | Geometry variant |
| rot4dXY..ZW | -6.28..6.28 | 0 | 6D rotation (radians) |
| hue | 0-360 | 200 | Color hue |
| saturation | 0-1 | 0.8 | Color saturation |
| intensity | 0-1 | 0.5 | Brightness |
| speed | 0.1-3.0 | 1.0 | Animation speed |
| chaos | 0-1 | 0 | Randomness/turbulence |
| morphFactor | 0-2 | 0 | Shape interpolation |
| gridDensity | 4-100 | 10 | Pattern density |
| dimension | 3.0-4.5 | 3.8 | 4D projection distance |

## Behavior Presets

| Preset | Speed | Chaos | Audio | Tilt | Best for |
|--------|-------|-------|-------|------|----------|
| ambient | 0.3 | 0.1 | off | gentle | Backgrounds |
| reactive | 1.0 | 0.3 | on (1.5x) | off | Music viz |
| immersive | 0.8 | - | on | dramatic | XR/mobile |
| energetic | 2.5 | 0.8 | on (2.0x) | dramatic | High energy |
| calm | 0.2 | 0.05 | off | gentle | Meditation |
| cinematic | 0.5 | 0.2 | off | off | Video/recording |

## Example: Create a hypersphere torus with warm colors

```json
{"tool": "create_4d_visualization", "args": {"system": "quantum", "geometry_index": 11}}
{"tool": "set_rotation", "args": {"XW": 0.5, "YW": 0.3, "ZW": 0.8}}
{"tool": "set_visual_parameters", "args": {"hue": 30, "speed": 0.6, "intensity": 0.8, "chaos": 0.15}}
```

Geometry 11 = hypersphere(1) * 8 + torus(3) = index 11.
