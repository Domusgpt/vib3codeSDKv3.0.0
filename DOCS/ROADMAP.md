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
