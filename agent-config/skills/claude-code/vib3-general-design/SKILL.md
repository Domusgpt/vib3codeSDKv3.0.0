---
name: vib3-general-design
description: Use when users want to ideate, design, or tune VIB3+ scenes (system choice, geometry selection, color/motion tuning, behavior presets, and export-ready visual direction) without deep SDK refactoring.
---

# VIB3 General Design Skill

## Overview
This skill helps an agent turn creative intent into production-ready VIB3+ scene settings. It focuses on system selection (quantum/faceted/holographic), geometry strategy, 6D rotation styling, visual parameter tuning, and export/embedding decisions.

## When to use this skill
Use this skill when requests include:
- "Design a look" / "make a style system" / "create presets"
- Picking a system for a brand, campaign, or UX context
- Tuning geometry, color, speed, chaos, and projection for an aesthetic target
- Preparing output for web embeds, demos, exports, or presentations

## Workflow
1. **Classify the creative intent**
   - Decide if the target is clean/precise (faceted), dense/technical (quantum), or layered/immersive (holographic).
2. **Select geometry + core warp**
   - Use `index = core * 8 + base` with 24 total geometry variants.
3. **Set movement language**
   - Apply 6D rotations in canonical order: `XY -> XZ -> YZ -> XW -> YW -> ZW`.
4. **Tune visual parameters**
   - Start with hue, saturation, intensity, speed, chaos, morphFactor, gridDensity, dimension.
5. **Apply behavior constraints**
   - Select calmer vs energetic profiles, reactivity mode, and projection.
6. **Output a clear implementation packet**
   - Return concrete values, why each was chosen, and optional MCP/OpenAI function calls.

## Output contract
Always provide:
- Final system + geometry index (and decoded base/core names)
- Rotation values for all six planes
- A compact parameter table with exact values
- One "safer" and one "bolder" variant
- Notes on accessibility/performance tradeoffs

## References
Load these only when needed:
- `references/anthropic-claude-sources.md` for real Claude Code documentation links.
- `references/vib3-design-reference.md` for SDK-specific design and control constraints.
