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
