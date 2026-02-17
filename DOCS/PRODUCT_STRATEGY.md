Last reviewed: 2026-02-17

# Product Strategy

## Purpose
VIB3+ SDK is positioned as a programmable 4D/6D visualization platform for product teams, creative technologists, and AI-native experiences that need high-fidelity real-time graphics with practical integration pathways.

## Target Users & Personas

| Persona | Primary Goals | Key Needs from VIB3+ |
|---|---|---|
| **Creative Developer** (web/interactive engineer) | Ship differentiated visual experiences quickly | Stable core engine APIs, fast iteration, framework adapters, predictable performance |
| **Experience Designer / Technical Artist** | Produce immersive scenes and effects with minimal low-level shader work | Rich preset system, post-processing/easing/timeline controls, export options |
| **Platform Integrator** (SaaS/product team) | Embed visuals into production apps with operational confidence | Clear lifecycle model, telemetry hooks, testability, long-term compatibility |
| **AI/Agent Builder** | Automate generation, tuning, and operation of visual scenes | Agent tooling, MCP/CLI interfaces, machine-readable docs, guardrails |
| **Immersive/XR Team** | Extend visuals to VR/AR and spatial interfaces | Advanced rendering path, input abstraction, GPU-aware architecture |

## Core Use-Cases
1. **Interactive Product Surfaces:** add performant, controllable visual systems to dashboards, landing pages, and app canvases.
2. **Creative Production Pipelines:** drive visuals via presets, timelines, and reactive input for streaming/live-performance contexts.
3. **Cross-Framework SDK Embeds:** integrate once and deploy in React/Vue/Svelte and custom JS runtimes.
4. **AI-Orchestrated Visual Systems:** use agent APIs to generate, mutate, and validate visual behaviors programmatically.
5. **Advanced Runtime Modes:** run high-end features (WebXR, compute, worker rendering, MIDI, AI preset generation) where supported.

## Differentiation
- **Unified 4D/6D control model** across multiple systems instead of one-off demos.
- **Production-oriented SDK structure** with clear module boundaries for core, integrations, advanced capabilities, and agent tooling.
- **Agent-first operability** (MCP + CLI + telemetry orientation) to support autonomous and assisted workflows.
- **Breadth of integration targets** (frameworks, creative tools, exports) that reduce adoption friction.
- **Performance-conscious architecture** that can scale from standard web canvases to XR/compute-enabled environments.

## Monetization & Licensing Assumptions
- **Open-core distribution assumption:** MIT-licensed base SDK remains the adoption driver.
- **Commercial expansion assumptions:** monetizable add-ons can include premium integrations, enterprise support, managed tooling, and hosted collaboration/telemetry services.
- **Tiering hypothesis:**
  - **Community:** core engine + basic integrations.
  - **Pro:** advanced feature packs, commercial support SLA, enhanced export/tooling.
  - **Enterprise:** governance features, private support, compliance-oriented integration hardening.
- **Success dependency:** maintain low-friction developer onboarding while creating high-value operational capabilities for teams running VIB3+ at scale.

## Success Metrics

### Adoption Metrics
- Weekly active projects using VIB3+ SDK.
- Net-new installs and retained projects after 30/90 days.
- Conversion rate from prototype usage to production deployment.

### Performance Metrics
- Median and P95 frame-time under representative scenes.
- GPU/CPU utilization envelopes across supported devices.
- Initialization latency and system-switch latency.

### Integration Usage Metrics
- Usage distribution across framework integrations (`react`, `vue`, `svelte`, etc.).
- Activation rate of advanced modules (XR, WebGPU, worker, MIDI, AI).
- Agent tooling usage (CLI commands, MCP tool call volume, successful automated workflows).

## Strategy-to-Architecture Alignment
Strategy execution depends on keeping the following module families healthy and composable:
- **Engine/core quality:** `src/core/`
- **Integrations:** `src/integrations/`
- **Advanced features:** `src/advanced/`
- **Agent tooling:** `src/agent/`

Roadmap-level epics that operationalize these goals are documented in [`DOCS/ROADMAP.md`](./ROADMAP.md).
