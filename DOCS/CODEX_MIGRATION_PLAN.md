# Codex Migration Plan

## Purpose
Consolidate favored exemplars (`site`, `js/landing`, `examples/dogfood`) into a coherent codex of prime VIB3+ implementation references.

## Scope
- Source tracks:
  - `examples/dogfood/samsung-tv`
  - `examples/dogfood/flutter-viz`
  - `site/`
  - `js/landing/`
- Target track:
  - `examples/codex/*`

## Phase 1 — Foundation (Current)
1. Metadata-driven catalog (`examples/codex/catalog.json`).
2. Gold Standard coverage matrix for active entries.
3. MCP lab packaging for agent workflows.
4. Deterministic QA protocol for visual review.

## Phase 2 — Runtime Consolidation ✅ (Completed 2026-02-21)
1. ✅ Extracted shared orchestration from `site/js` and `js/landing` into `src/codex-runtime/landing-v3/`.
2. ✅ Replaced duplicated implementations with import/boot wrappers in legacy paths.
3. ✅ Published migration map: `DOCS/CODEX_RUNTIME_MIGRATION_MAP.md`.

## Phase 3 — Entry Conversion 🚧 (In Progress)
1. ✅ Convert `site` narrative choreography into codex entry: `narrative-scroll` (transitional shell complete).
2. ⏳ Convert `dogfood/samsung-tv` into codex entry: `broadcast-tv`.
3. ⏳ Convert `dogfood/flutter-viz` into codex entry: `flutter-embed`.
4. ⏳ Add each entry's coverage matrix and MCP labs.

## Phase 4 — Quality Gate
An entry is "prime" when it passes:
1. Gold Standard traceability (coverage matrix complete).
2. Deterministic QA checkpoints.
3. Agent lab reproducibility.
4. Comment quality and architecture clarity review.
5. Screenshot-based visual acceptance pass.

## Ownership and Exit Criteria
- **Architecture**: shared runtime extracted and documented.
- **Creative Systems**: each entry demonstrates a distinct compositional bet.
- **Agent Experience**: each active entry has lab sequence + handoff schema.
- **Docs**: codex index, entry readme, and dev tracks stay in sync.
