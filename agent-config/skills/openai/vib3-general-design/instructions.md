# VIB3 General Design (OpenAI Skill)

## Purpose
Translate creative intent into concrete VIB3+ scene configuration with rationale, variants, and implementation-ready function calls.

## Workflow
1. Pick system (`quantum`, `faceted`, `holographic`) based on aesthetic goal.
2. Pick geometry using `index = core * 8 + base`.
3. Set all 6 rotation planes (XY/XZ/YZ/XW/YW/ZW).
4. Tune color/motion parameters with explicit numeric values.
5. Return primary + alternate variant and tradeoffs.

## Required output format
- `system`
- `geometry_index` (+ decoded names)
- `rotation`
- `visual_parameters`
- `rationale`
- `alternative_variant`

## Constraints
- Keep values inside SDK ranges.
- Explain performance impact for dense settings.
- Prefer reproducible, copy-pasteable function-call payloads.
