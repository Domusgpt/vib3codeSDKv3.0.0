# Dogfood Strategy: Leveraging 4-Agent Experiment Results

**Date**: 2026-02-16
**Context**: 4 autonomous agents are each building a production-quality artifact using VIB3+ SDK, writing 3 self-assessment reports each. This document captures how we extract maximum value from these experiments.

---

## Part 1: SDK Analysis & Improvement

### 1.1 Report Mining Protocol

Each agent writes 3 reports (12 total). Extract these categories:

| Category | What to look for | Action |
|----------|-----------------|--------|
| **Documentation gaps** | "I couldn't find...", "unclear whether...", "had to reverse-engineer..." | File issues, update CLAUDE.md and DOCS/ |
| **API friction** | "Workaround required...", "parameter range inconsistency...", "hue 0-1 vs 0-360" | Fix in source, ensure consistency |
| **Missing features** | "SDK has no concept of...", "no support for..." | Add to ROADMAP.md as feature requests |
| **Architecture feedback** | "Pattern X worked well...", "Pattern Y was fragile..." | Capture as best practices |
| **Shader correctness** | "Rotation order mismatch...", "projection formula differs..." | Verify against WASM reference |

### 1.2 Known Issues Already Surfaced (from Weapon Skins REPORT_1)

1. **Hue range inconsistency** — CLAUDE.md says 0-360, some shaders expect 0-1
   - **Fix**: Standardize on 0-360 in API, divide at uniform boundary in all shaders
   - **Files**: `src/faceted/FacetedSystem.js`, `src/quantum/QuantumVisualizer.js`

2. **No standalone shader extraction guide**
   - **Fix**: Create `DOCS/STANDALONE_BUILD_GUIDE.md` documenting the synesthesia.html pattern
   - Reference the shared GLSL preamble + system-specific main() approach

3. **No shape masking / object texturing support**
   - **Fix**: Add to ROADMAP as "Gaming Integration" feature
   - Design: SDF masking utilities, UV mapping helpers, mesh texture export

4. **`u_roleIntensity` uses magic floats instead of integer layer index**
   - **Fix**: Add `u_layerIndex` integer uniform alongside existing float for backwards compat

5. **`u_breath` undocumented for standalone builds**
   - **Fix**: Document in standalone build guide; provide fallback sine wave formula

### 1.3 Cross-Agent Analysis Matrix

When all 4 complete, build this comparison:

| Dimension | Weapon Skins | Scroll Site | Flutter App | Samsung TV |
|-----------|-------------|-------------|-------------|------------|
| Time to onboard | | | | |
| Lines of shader code reused | | | | |
| Workarounds needed | | | | |
| SDK features used | | | | |
| SDK features missing | | | | |
| Final quality (1-5) | | | | |
| Would agent ship it? | | | | |

---

## Part 2: Demo & Product Strategy

### 2.1 SDK Homepage Demo Gallery

These artifacts become the **"Built with VIB3+"** showcase on the SDK homepage/README.

**Proposed layout** (for GitHub Pages at `domusgpt.github.io/vib3codeSDKv3.0.0/`):

```
/examples/
  index.html              ← Gallery landing page (NEW — needs to be built)
  synesthesia.html        ← Existing flagship demo
  opal-choreography.html  ← Existing choreography demo
  layer-dynamics-demo.html ← Existing layer demo
  dogfood/
    index.html            ← Dogfood gallery page (NEW)
    weapon-skins/         ← "Gaming VFX" use case
    scroll-site/          ← "Creative Web" use case
    flutter-viz/          ← "Mobile Apps" use case
    samsung-tv/           ← "Smart TV / IoT" use case
```

### 2.2 Gallery Landing Page Design

Create `examples/index.html` — a visual gallery that:
- Shows thumbnail/preview of each demo
- Links to live demos
- Groups by category (Flagship, Use Cases, Platform Demos)
- Matches VIB3+ dark theme aesthetic
- Uses a subtle VIB3+ shader as background (eat our own dogfood)

### 2.3 Per-Artifact Product Potential

| Artifact | Standalone Product? | SDK Demo Value | Target Audience |
|----------|-------------------|----------------|-----------------|
| **Weapon Skins** | Yes — game modding tool market | Shows GPU masking + reactivity | Game devs, modding communities |
| **Scroll Site** | Template — sell as creative template | Shows scroll-driven params + typography | Creative agencies, portfolio sites |
| **Flutter App** | Yes — app store submission ready | Shows cross-platform + audio reactive | Mobile devs, music app makers |
| **Samsung TV** | Yes — TV app store submission ready | Shows platform adaptation + 10-foot UI | IoT/TV devs, ambient display market |

### 2.4 README Badge / Showcase Section

Add to main README.md:

```markdown
## Built with VIB3+

| | | | |
|:---:|:---:|:---:|:---:|
| [Weapon Skin Forge](examples/dogfood/weapon-skins/) | [4D Scroll Experience](examples/dogfood/scroll-site/) | [Flutter Viz App](examples/dogfood/flutter-viz/) | [Samsung TV Visualizer](examples/dogfood/samsung-tv/) |
| Gaming VFX | Creative Web | Mobile Apps | Smart TV |
```

---

## Part 3: Continuous Dogfooding Framework

### 3.1 Repeat This Experiment

This 4-agent pattern is reusable. Future dogfood rounds could target:
- **Unity/Unreal plugin** — Can an agent build a game engine integration?
- **Figma plugin** — Agent builds the actual Figma plugin from `src/integrations/FigmaPlugin.js`
- **VS Code extension** — Live VIB3+ preview in the editor
- **Slack bot** — Generates VIB3+ visualizations from slash commands
- **AR filter** — Instagram/Snapchat AR lens using VIB3+ shaders

### 3.2 Agent Feedback Loop

```
Agent builds artifact
  → Writes 3 reports
    → Reports feed into SDK improvement tickets
      → SDK improves
        → Next agent round produces better artifacts
```

Each round should measurably reduce:
- Onboarding time (better docs)
- Workaround count (better APIs)
- Report complaints (fewer friction points)

### 3.3 Quality Metrics to Track

- **Shader authenticity score**: Does the artifact use real 6D rotation + fract() lattice + 4D projection? (binary)
- **Lines of workaround code**: Code that shouldn't be necessary if SDK were better
- **Agent autonomy**: Did the agent need human intervention? (should be zero)
- **Cross-platform parity**: Same shader math across all 4 artifacts?
- **Report specificity**: Actionable feedback vs vague complaints

---

## Part 4: Immediate Next Steps

1. **When agents finish**: Commit all output, push to branch
2. **Build gallery page**: `examples/index.html` with live links
3. **Mine all 12 reports**: Extract every SDK issue into GitHub issues
4. **Fix P0 issues**: Hue inconsistency, standalone build guide
5. **Update README**: Add "Built with VIB3+" showcase section
6. **Publish**: Push to main, trigger Pages deployment, share URLs

---

*This strategy doc itself is an artifact of the dogfooding process — meta-level feedback on how to systematize SDK quality improvement through autonomous agent testing.*
