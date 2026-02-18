Last reviewed: 2026-02-17

# Documentation Index

## Strategy & Planning
- [`PRODUCT_STRATEGY.md`](./PRODUCT_STRATEGY.md) — product direction, personas, differentiation, monetization assumptions, and success metrics.
- [`ROADMAP.md`](./ROADMAP.md) — strategy goals mapped to technical epics and module ownership.

## Core References
- [`SYSTEM_INVENTORY.md`](./SYSTEM_INVENTORY.md)
- [`CONTROL_REFERENCE.md`](./CONTROL_REFERENCE.md)
- [`CLI_ONBOARDING.md`](./CLI_ONBOARDING.md)
- [`REPO_MANIFEST.md`](./REPO_MANIFEST.md)

## Performance / Rendering / Platform
- [`WEBGPU_STATUS.md`](./WEBGPU_STATUS.md)
- [`XR_BENCHMARKS.md`](./XR_BENCHMARKS.md)
- [`RENDERER_LIFECYCLE.md`](./RENDERER_LIFECYCLE.md)
- [`GPU_DISPOSAL_GUIDE.md`](./GPU_DISPOSAL_GUIDE.md)

## Setup / Operations
- [`ENV_SETUP.md`](./ENV_SETUP.md)
- [`PROJECT_SETUP.md`](./PROJECT_SETUP.md)
- [`CI_TESTING.md`](./CI_TESTING.md)
# Documentation index

This folder contains active and archived project documentation.

## Archive policy

To keep links stable while allowing historical retention:

- **Active docs** live at `DOCS/<name>.md` and are referenced by default from onboarding and root docs.
- **Archived docs** live at `DOCS/archive/<name>.md` and must be labeled as archived anywhere they are linked.
- Before moving any doc to `DOCS/archive/`, update all inbound markdown links with:
  - `rg -n "<doc-name>.md" -g '*.md'`
- If a document is still intended as a primary reference, keep or restore a canonical copy at `DOCS/<name>.md` and add an archive notice in the archived variant.
- For date-stamped reports, prefer linking directly to `DOCS/archive/...` from inventories and READMEs with `(archived)` in the description.

## Link maintenance checklist

1. Search all markdown references before and after a move.
2. Update stale links in `README.md`, onboarding docs, and inventories first.
3. Confirm no stale references remain with:
   - `rg -n "DOCS/(SYSTEM_AUDIT_2026-01-30|DEV_TRACK_ANALYSIS)\.md" -g '*.md'`
# Documentation Index

This file is the root index for all project documentation.

## Start Here

Use these canonical documents first:

| Topic | Canonical document | Source of truth | Owner | Last reviewed |
|---|---|---|---|---|
| Architecture | [`DOCS/SYSTEM_INVENTORY.md`](./SYSTEM_INVENTORY.md) | ✅ System boundaries, modules, and capabilities | SDK Architecture | 2026-02-12 |
| Product Strategy | [`DOCS/LICENSING_TIERS.md`](./LICENSING_TIERS.md) | ✅ Packaging, positioning, and commercial model | Product | 2026-02-12 |
| Master Plan | [`DOCS/MASTER_PLAN_2026-01-31.md`](./MASTER_PLAN_2026-01-31.md) | ✅ Program-level priorities and sequencing | Program Management | 2026-02-12 |
| Dev Track | [`DOCS/DEV_TRACK_SESSION_2026-02-06.md`](./dev-tracks/DEV_TRACK_SESSION_2026-02-06.md) | ✅ Current implementation log and execution status | Engineering | 2026-02-12 |

## Reading Paths by Persona

### New engineer
1. [`DOCS/PROJECT_SETUP.md`](./PROJECT_SETUP.md)
2. [`DOCS/ENV_SETUP.md`](./ENV_SETUP.md)
3. [`DOCS/SYSTEM_INVENTORY.md`](./SYSTEM_INVENTORY.md)
4. [`DOCS/CONTROL_REFERENCE.md`](./CONTROL_REFERENCE.md)
5. [`DOCS/CI_TESTING.md`](./CI_TESTING.md)

### AI agent
1. [`DOCS/CLI_ONBOARDING.md`](./CLI_ONBOARDING.md)
2. [`DOCS/REPO_MANIFEST.md`](./REPO_MANIFEST.md)
3. [`DOCS/SYSTEM_INVENTORY.md`](./SYSTEM_INVENTORY.md)
4. [`DOCS/MASTER_PLAN_2026-01-31.md`](./MASTER_PLAN_2026-01-31.md)
5. Latest dev track session (currently [`DOCS/DEV_TRACK_SESSION_2026-02-06.md`](./dev-tracks/DEV_TRACK_SESSION_2026-02-06.md))

### Product lead
1. [`DOCS/LICENSING_TIERS.md`](./LICENSING_TIERS.md)
2. [`DOCS/MASTER_PLAN_2026-01-31.md`](./MASTER_PLAN_2026-01-31.md)
3. [`DOCS/WEBGPU_STATUS.md`](./WEBGPU_STATUS.md)
4. [`DOCS/XR_BENCHMARKS.md`](./XR_BENCHMARKS.md)
5. [`DOCS/TELEMETRY_EXPORTS.md`](./TELEMETRY_EXPORTS.md)

### Contributor
1. [`CONTRIBUTING.md`](../CONTRIBUTING.md)
2. [`DOCS/PROJECT_SETUP.md`](./PROJECT_SETUP.md)
3. [`DOCS/CI_TESTING.md`](./CI_TESTING.md)
4. [`DOCS/RENDERER_LIFECYCLE.md`](./RENDERER_LIFECYCLE.md)
5. [`DOCS/GPU_DISPOSAL_GUIDE.md`](./GPU_DISPOSAL_GUIDE.md)

## Documentation Taxonomy

| Category | Scope | Primary files |
|---|---|---|
| Architecture | Runtime model, systems, lifecycles, controls | [`SYSTEM_INVENTORY.md`](./SYSTEM_INVENTORY.md) **(SOT)**, [`RENDERER_LIFECYCLE.md`](./RENDERER_LIFECYCLE.md), [`CONTROL_REFERENCE.md`](./CONTROL_REFERENCE.md), [`GPU_DISPOSAL_GUIDE.md`](./GPU_DISPOSAL_GUIDE.md) |
| Planning | Strategy, roadmap, execution direction | [`MASTER_PLAN_2026-01-31.md`](./MASTER_PLAN_2026-01-31.md) **(SOT)**, [`DEV_TRACK_SESSION_2026-02-06.md`](./dev-tracks/DEV_TRACK_SESSION_2026-02-06.md) **(SOT for active sprint log)**, [`DEV_TRACK_SESSION_2026-01-31.md`](./dev-tracks/DEV_TRACK_SESSION_2026-01-31.md), [`LICENSING_TIERS.md`](./LICENSING_TIERS.md) **(SOT for product packaging)** |
| Operations | Setup, CI, runbooks, observability | [`PROJECT_SETUP.md`](./PROJECT_SETUP.md) **(SOT for project bootstrap)**, [`ENV_SETUP.md`](./ENV_SETUP.md), [`CI_TESTING.md`](./CI_TESTING.md), [`OBS_SETUP_GUIDE.md`](./OBS_SETUP_GUIDE.md), [`TELEMETRY_EXPORTS.md`](./TELEMETRY_EXPORTS.md) |
| Analysis | Benchmarks, visual analysis, design studies | [`WEBGPU_STATUS.md`](./WEBGPU_STATUS.md), [`XR_BENCHMARKS.md`](./XR_BENCHMARKS.md), [`CROSS_SITE_DESIGN_PATTERNS.md`](./CROSS_SITE_DESIGN_PATTERNS.md), `VISUAL_ANALYSIS_*.md`, [`REFERENCE_SCROLL_ANALYSIS.md`](./REFERENCE_SCROLL_ANALYSIS.md) |
| Archive | Historical plans and audits retained for traceability | [`archive/`](./archive/) including [`archive/SYSTEM_AUDIT_2026-01-30.md`](./archive/SYSTEM_AUDIT_2026-01-30.md), [`archive/STRATEGIC_BLUEPRINT_2026-01-07.md`](./archive/STRATEGIC_BLUEPRINT_2026-01-07.md), [`archive/SESSION_LOG_2026-01-07.md`](./archive/SESSION_LOG_2026-01-07.md) |

## Source of Truth Rules

- Each topic should have one authoritative file; supporting docs should link back to that canonical file.
- When creating a new doc, assign it to a taxonomy category and mark whether it is canonical or supporting.
- If a canonical file changes, update `Last reviewed` and verify inbound links from this index.
