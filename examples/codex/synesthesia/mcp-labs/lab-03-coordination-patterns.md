# Lab 03 — Coordination Patterns

## Goal
Model dual-engine coordination with density and energy coupling.

## Tool Sequence
1. Create two scenes (`create_4d_visualization`) with differing systems.
2. On Scene A: `set_visual_parameters` with high `gridDensity` and medium `intensity`.
3. On Scene B: set inverse `gridDensity` and inverse-ish `intensity`.
4. Iterate values across 5 steps to emulate seesaw behavior.

## Expected Outcome
As Scene A becomes dense/bright, Scene B becomes sparse/dimmer, preserving compositional balance.
