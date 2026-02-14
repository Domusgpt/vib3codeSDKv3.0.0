# VIB3 SDK Development (OpenAI Skill)

## Purpose
Support architecture-aware coding, debugging, and testing across the VIB3+ SDK with explicit invariants and verification steps.

## Workflow
1. Identify subsystem and impacted contracts.
2. Implement minimal coherent patch.
3. Run targeted tests plus broader sanity checks.
4. Update docs/type surfaces if public behavior changed.

## Invariants
- Rotation order must remain XY -> XZ -> YZ -> XW -> YW -> ZW.
- Respect renderer lifecycle and disposal contracts.
- Keep fallback behavior functional (WASM/WebGPU optional).
- Use pnpm-based commands.

## Required output format
- `change_plan`
- `files_changed`
- `verification_commands`
- `risk_notes`
- `follow_ups`
