Last reviewed: 2026-02-17

# Strategic Roadmap

This roadmap maps product strategy goals from [`DOCS/PRODUCT_STRATEGY.md`](./PRODUCT_STRATEGY.md) to technical epics and the primary module ownership areas.

## Goal-to-Epic Mapping

| Strategy Goal | Technical Epic | Primary Module(s) | Representative Outcomes |
|---|---|---|---|
| Increase developer adoption and time-to-first-value | **Epic A: Engine Reliability & DX Foundation** | `src/core/` | Faster setup, safer defaults, stronger API consistency, fewer integration regressions |
| Expand production integrations across frameworks and tools | **Epic B: Integration Surface Expansion** | `src/integrations/` | Stable adapters, clearer compatibility matrix, improved framework lifecycle parity |
| Deliver differentiated high-end capabilities | **Epic C: Advanced Runtime Capability Layer** | `src/advanced/` | Maturity of XR/WebGPU/worker/MIDI/AI features with progressive enhancement |
| Enable AI-native and autonomous workflows | **Epic D: Agent Tooling & Automation Plane** | `src/agent/` | More robust MCP/CLI operations, automation-safe contracts, better observability |
| Prove performance and enterprise readiness | **Epic E: Measurable Quality & Operability** | `src/core/`, `src/integrations/`, `src/advanced/`, `src/agent/` | Telemetry-driven performance baselines, integration usage analytics, release confidence |

## Epic Details

### Epic A — Engine Reliability & DX Foundation (`src/core/`)
- Harden lifecycle management and error semantics.
- Improve parameter validation and migration compatibility.
- Establish performance budgets (frame-time, init time, memory envelopes).
- Expand deterministic test coverage for system switching and geometry/rotation paths.

### Epic B — Integration Surface Expansion (`src/integrations/`)
- Standardize adapter contracts across React/Vue/Svelte and other supported integrations.
- Improve SSR/hydration safety and runtime capability detection.
- Publish integration-level examples and troubleshooting baselines.
- Track adapter usage and breakage signals by runtime/framework version.

### Epic C — Advanced Runtime Capability Layer (`src/advanced/`)
- Mature feature gating and fallback behavior for XR/WebGPU/worker contexts.
- Define quality levels for advanced features with explicit hardware constraints.
- Improve interoperability between advanced modules and core parameter controls.
- Add scenario-based benchmarks for high-complexity scenes.

### Epic D — Agent Tooling & Automation Plane (`src/agent/`)
- Stabilize MCP and CLI command contracts for autonomous agents.
- Improve schema validation, command discoverability, and failure diagnostics.
- Add policy and safety guardrails for generated presets/actions.
- Instrument end-to-end agent workflows for reliability and latency.

### Epic E — Measurable Quality & Operability (Cross-cutting)
- Create a unified KPI pipeline for adoption, performance, and integration usage.
- Define release gates tied to strategy metrics (P95 frame-time, integration pass rates).
- Establish long-running regression suites across representative environments.
- Align docs and onboarding with telemetry-informed friction points.

## Suggested Milestones

| Milestone | Focus | Success Signal |
|---|---|---|
| **M1: Core Confidence** | Epic A + baseline Epic E instrumentation | Reduced regressions, improved startup latency, stronger API stability |
| **M2: Integration Scale** | Epic B + cross-framework QA | Higher integration adoption and lower support burden |
| **M3: Advanced Differentiation** | Epic C with measurable fallback quality | Increased use of advanced modules without reliability drop |
| **M4: Agentic Operations** | Epic D + operational telemetry | Reliable automated workflows and growing agent-tooling utilization |

## Module Ownership Summary
- **`src/core/`** anchors reliability, performance, and API continuity.
- **`src/integrations/`** drives ecosystem reach and developer adoption.
- **`src/advanced/`** delivers premium differentiation and future-facing capabilities.
- **`src/agent/`** enables AI-native operation, orchestration, and scale.
# VIB3 SDK Roadmap

This roadmap tracks delivery milestones by quarter with explicit status signals, ownership, and dependencies to active code paths.

## Status Legend

- **Planned**: Not started, scoped for target quarter.
- **In Progress**: Active engineering work is underway.
- **Blocked**: Waiting on dependency, design decision, or infra.
- **Done**: Delivered and verified.

## What changed this week

- Consolidated historical session logs into `DOCS/dev-tracks/` so day-to-day notes are archived but still discoverable from milestones.
- Added this quarterly roadmap as the single front door for progress and status.
- Linked current milestones to concrete code-path dependencies and evidence docs to reduce context-hunting.

## 2026 Q1 Milestones

| Milestone | Status | Owner | Target date | Dependency links (code paths) | Evidence |
|---|---|---|---|---|---|
| Stabilize core rendering + lifecycle contracts | **In Progress** | Core Runtime Team | 2026-03-31 | `src/core/`, `src/core/renderers/`, `src/viewer/` | [Dev Track 2026-02-06](dev-tracks/DEV_TRACK_SESSION_2026-02-06.md), [Renderer lifecycle notes](RENDERER_LIFECYCLE.md) |
| Ship MCP/agent integration hardening | **In Progress** | Agent Platform Team | 2026-03-31 | `src/agent/`, `src/integrations/`, `tools/` | [Dev Track 2026-02-06](dev-tracks/DEV_TRACK_SESSION_2026-02-06.md), [CLI onboarding](CLI_ONBOARDING.md) |
| Eliminate known export + packaging regressions | **Done** | Release Engineering | 2026-02-15 | `src/export/`, `types/`, `tools/` | [Dev Track 2026-01-31](dev-tracks/DEV_TRACK_SESSION_2026-01-31.md), [Master plan](MASTER_PLAN_2026-01-31.md) |

## 2026 Q2 Milestones

| Milestone | Status | Owner | Target date | Dependency links (code paths) | Evidence |
|---|---|---|---|---|---|
| Advanced visualization subsystem parity | **Planned** | Graphics Team | 2026-06-30 | `src/advanced/`, `src/shaders/`, `src/holograms/` | [WebGPU status](WEBGPU_STATUS.md), [XR benchmarks](XR_BENCHMARKS.md) |
| Cross-platform integration SDK examples refresh | **Planned** | Developer Experience Team | 2026-06-15 | `src/integrations/`, `examples/`, `tools/` | [Project setup](PROJECT_SETUP.md), [Env setup](ENV_SETUP.md) |
| Observability + telemetry export baseline | **Blocked** | Data & Ops | 2026-06-30 | `src/telemetry/`, `tools/`, `src/core/` | [Telemetry exports](TELEMETRY_EXPORTS.md), [CI testing](CI_TESTING.md) |

## 2026 Q3 Milestones

| Milestone | Status | Owner | Target date | Dependency links (code paths) | Evidence |
|---|---|---|---|---|---|
| Public API reference + docs site automation | **Planned** | Documentation Team | 2026-09-30 | `src/`, `types/`, `tools/` | [Repo manifest](REPO_MANIFEST.md), [System inventory](SYSTEM_INVENTORY.md) |
| Production-ready web tooling for builders | **Planned** | Tooling Team | 2026-09-15 | `tools/`, `src/integrations/`, `src/cli/` | [CLI onboarding](CLI_ONBOARDING.md), [Export formats](EXPORT_FORMATS.md) |

## 2026 Q4 Milestones

| Milestone | Status | Owner | Target date | Dependency links (code paths) | Evidence |
|---|---|---|---|---|---|
| Platform reliability + perf hardening | **Planned** | Platform Team | 2026-12-15 | `src/core/`, `src/advanced/`, `tools/` | [GPU disposal guide](GPU_DISPOSAL_GUIDE.md), [CI testing](CI_TESTING.md) |
| Community and ecosystem expansion package | **Planned** | Ecosystem Team | 2026-12-31 | `src/integrations/`, `examples/`, `tools/` | [Cross-site design patterns](CROSS_SITE_DESIGN_PATTERNS.md), [Multiviz choreography](MULTIVIZ_CHOREOGRAPHY_PATTERNS.md) |

## Historical log policy

- Detailed, date-based implementation logs live in `DOCS/archive/` or `DOCS/dev-tracks/`.
- Roadmap milestones link to those logs as evidence, so progress is visible without opening multiple dated files.
