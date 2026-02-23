# Codex Runtime Migration Map (Phase 2)

This map documents path consolidation for the landing/site orchestration layer.

## Canonical Runtime Location

`src/codex-runtime/landing-v3/`

## Old Path → Canonical Path

| Old path | Canonical path |
|---|---|
| `site/js/ContextPool.js` | `src/codex-runtime/landing-v3/ContextPool.js` |
| `site/js/adapters.js` | `src/codex-runtime/landing-v3/adapters.js` |
| `site/js/CardTiltSystem.js` | `src/codex-runtime/landing-v3/CardTiltSystem.js` |
| `site/js/choreography.js` | `src/codex-runtime/landing-v3/choreography.js` |
| `site/js/config.js` | `src/codex-runtime/landing-v3/config.js` |
| `site/js/overlay-choreography.js` | `src/codex-runtime/landing-v3/overlay-choreography.js` |
| `site/js/main.js` | `src/codex-runtime/landing-v3/main-core.js` + wrapper boot |
| `js/landing/ContextPool.js` | `src/codex-runtime/landing-v3/ContextPool.js` |
| `js/landing/adapters.js` | `src/codex-runtime/landing-v3/adapters.js` |
| `js/landing/CardTiltSystem.js` | `src/codex-runtime/landing-v3/CardTiltSystem.js` |
| `js/landing/choreography.js` | `src/codex-runtime/landing-v3/choreography.js` |
| `js/landing/config.js` | `src/codex-runtime/landing-v3/config.js` |
| `js/landing/overlay-choreography.js` | `src/codex-runtime/landing-v3/overlay-choreography.js` |
| `js/landing/main.js` | `src/codex-runtime/landing-v3/main-core.js` + wrapper boot |

## Wrapper Strategy

Legacy file paths are preserved as thin wrappers to avoid breaking HTML/module references.

- Wrapper files in `site/js/*` and `js/landing/*` now re-export canonical runtime modules.
- `site/js/main.js` and `js/landing/main.js` now call `bootLandingPage()` from canonical runtime.
- Site wrapper enables reveal choreography; landing wrapper disables it.

## Notes

- `site/js/reveal-choreography.js` remains site-local and is imported by canonical `main-core.js`.
- `backup-v2/` files are intentionally unchanged in this phase.


## Verification

Run this command to validate wrapper/canonical structure remains intact:

- `npm run verify:codex-runtime`

This guard helps prevent accidental re-introduction of duplicate runtime logic in legacy wrapper paths.


- The verifier also enforces a forbidden import policy in canonical runtime modules (guards against accidental `../../src/...` regressions).
