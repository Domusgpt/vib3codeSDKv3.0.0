# Lab 01 — Scene Bootstrap

## Goal
Create a baseline scene and verify core system/tooling connectivity.

## Tool Sequence
1. `create_4d_visualization` with `{ system: "faceted", geometry_index: 11, projection: "perspective" }`
2. `set_visual_parameters` with `{ hue: 210, saturation: 0.8, intensity: 0.7, speed: 0.8, gridDensity: 28 }`
3. `get_scene_state`

## Expected Outcome
A stable faceted scene with medium density and cool hue baseline.

## Validation
Confirm returned state values match set ranges and scene renders with visible motion.
