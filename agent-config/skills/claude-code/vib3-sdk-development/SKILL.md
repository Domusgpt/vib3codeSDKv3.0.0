---
name: vib3-sdk-development
description: Use when implementing, debugging, testing, or extending VIB3+ SDK modules (rendering systems, geometry pipeline, agent tooling, integrations, lifecycle/disposal contracts, and CI-safe changes).
---

# VIB3 SDK Development Skill

## Overview
This skill guides reliable engineering work across the VIB3+ SDK: architecture-aware edits, renderer contract safety, testing discipline, and agent/MCP integration correctness.

## When to use this skill
Use for:
- New SDK features, refactors, or bug fixes
- Rendering or shader lifecycle issues
- Geometry/rotation correctness and cross-backend parity
- Agent tooling, CLI, MCP, telemetry, and export pipeline changes
- Test plan creation and CI hardening

## Workflow
1. **Map the target subsystem**
   - Identify owner modules in `src/core`, system folder(s), and related tests/types/docs.
2. **Confirm constraints before editing**
   - Preserve 6D rotation order and renderer lifecycle/disposal guarantees.
3. **Implement minimal, coherent patch**
   - Keep behavior changes explicit; avoid incidental refactors.
4. **Validate at three levels**
   - Unit tests, integration/e2e where impacted, and build/lint/type checks if available.
5. **Document operational impact**
   - Update docs/agent context when behavior or public interfaces change.

## Required quality gates
- Use `pnpm` workflows (not npm).
- Ensure no contract break in canvas lifecycle/disposal paths.
- If touching agent/MCP interfaces, include usage example and schema consistency check.
- If touching visuals, capture/verify representative render outputs when feasible.

## References
Load these only as needed:
- `references/anthropic-claude-sources.md` for Claude + MCP canonical docs.
- `references/vib3-dev-reference.md` for architecture, lifecycle, and testing map.
