# Narrative Scroll (Codex Entry)

This entry is the **Phase 3 transition bridge** that lifts the existing `site/` narrative choreography into the codex index so agents and humans can discover and run it from one place.

## Why this exists

- The project roadmap calls for converting the site narrative choreography into a codex prime example.
- This entry provides immediate discoverability while preserving the current production choreography runtime.
- It allows iterative hardening without blocking codex usage.

## Current architecture (transitional)

- `index.html` mounts `site/index.html` in an iframe shell.
- Header actions provide direct paths to codex, notes, and raw site runtime.
- Runtime execution still flows through canonical Phase 2 modules in `src/codex-runtime/landing-v3/`.

## Planned evolution (next iterations)

1. Replace iframe shell with direct entry-specific boot wiring.
2. Add codex coverage matrix for narrative patterns used by section choreography.
3. Add MCP-oriented lab notes for scroll choreography instrumentation.
4. Add deterministic checkpoint script for section/phase transitions.

## Relationship to migration plan

This entry satisfies the first Phase 3 target in `DOCS/CODEX_MIGRATION_PLAN.md` at a functional transitional level and establishes a stable place for incremental upgrades.
