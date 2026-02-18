# Lab 02 — Rotation Grammar

## Goal
Demonstrate 3D vs 4D rotational character differences.

## Tool Sequence
1. `set_rotation` with `{ XY: 0.4, XZ: 0.2, YZ: 0.1, XW: 0.0, YW: 0.0, ZW: 0.0 }`
2. Observe 3D-only behavior.
3. `set_rotation` with `{ XY: 0.1, XZ: 0.1, YZ: 0.1, XW: 1.2, YW: 0.8, ZW: 0.6 }`
4. Observe 4D-dominant behavior.

## Expected Outcome
4D planes produce inside-out and impossible-fold effects not present in 3D-only rotation.
