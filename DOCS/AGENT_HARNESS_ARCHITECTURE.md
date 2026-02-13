# VIB3+ Agent Harness Architecture

**Purpose**: Close the feedback loop between AI agents and VIB3+ visualization, enabling agents to design ultra-intricate reactive choreographed visuals that would be impractical via manual UI.

---

## Current State (What Exists)

- 19 MCP tools for parameter control, system switching, gallery, reactivity, export
- Agent context packs for Claude and OpenAI
- Claude Code skills (`/vib3-design`, `/vib3-dev`) for design and development workflows
- Telemetry instrumentation on all tool calls

## New Additions (This Session)

- **7 new MCP tools** (26 total): `describe_visual_state`, `batch_set_parameters`, `create_timeline`, `play_transition`, `apply_color_preset`, `set_post_processing`, `create_choreography`
- **Claude Code skills**: `.claude/commands/vib3-design.md` and `.claude/commands/vib3-dev.md`
- **Shader validation hook**: Pre-commit hook for `.glsl`/`.wgsl` changes

---

## Recommended Next Steps

### Phase 1: Visual Feedback Loop (Highest Impact)

**Problem**: Agents set parameters but can't see the result. They're designing blind.

**Solution**: Screenshot capture + visual analysis pipeline.

#### 1A. `capture_screenshot` MCP Tool

Add a tool that captures the current visualization as an image:

```javascript
// Implementation approach:
// 1. Use canvas.toDataURL('image/png') on the content-canvas layer
// 2. Composite all 5 layers into a single image
// 3. Return base64-encoded PNG

capture_screenshot: {
    name: 'capture_screenshot',
    description: 'Captures current visualization as a base64 PNG image',
    inputSchema: {
        type: 'object',
        properties: {
            width: { type: 'integer', default: 512 },
            height: { type: 'integer', default: 512 },
            layers: { type: 'string', enum: ['all', 'content', 'composite'], default: 'composite' }
        }
    }
}
```

For multimodal agents (Claude with vision, GPT-4V), this enables:
1. Set parameters → capture → analyze → refine → capture → analyze...
2. "Make it more blue" → agent can verify the blue shift happened
3. A/B testing: capture state A, modify, capture state B, compare

#### 1B. Headless Rendering Server

For CI/automated pipelines where no browser is available:

```javascript
// Using Puppeteer or Playwright in headless mode
// Start VIB3+ in headless browser → apply MCP commands → capture frames
import puppeteer from 'puppeteer';

class HeadlessVIB3Renderer {
    async launch() {
        this.browser = await puppeteer.launch({ headless: true });
        this.page = await this.browser.newPage();
        await this.page.goto('http://localhost:3000'); // dev server
    }

    async captureFrame(params) {
        await this.page.evaluate((p) => {
            for (const [k, v] of Object.entries(p)) {
                window.engine.setParameter(k, v);
            }
        }, params);
        // Wait one frame
        await this.page.evaluate(() => new Promise(r => requestAnimationFrame(r)));
        return await this.page.screenshot({ type: 'png' });
    }
}
```

### Phase 2: Agent Choreography Runtime

**Problem**: `create_choreography` generates a JSON spec, but there's no runtime to play it back.

**Solution**: Build a `ChoreographyPlayer` class that consumes choreography JSON and orchestrates the engine.

```javascript
// src/creative/ChoreographyPlayer.js
export class ChoreographyPlayer {
    constructor(engine) {
        this.engine = engine;
        this.timeline = new ParameterTimeline((n, v) => engine.setParameter(n, v));
        this.transition = new TransitionAnimator(
            (n, v) => engine.setParameter(n, v),
            (n) => engine.getParameter(n)
        );
    }

    async loadChoreography(spec) {
        // Parse multi-scene choreography
        // Set up scene transitions
        // Wire timeline tracks per scene
        // Handle system switching at scene boundaries
    }

    play() { /* Start playback with scene management */ }
    pause() { /* Pause all active timelines/transitions */ }
    seek(timeMs) { /* Jump to specific time, load correct scene */ }
}
```

### Phase 3: Design-by-Description (Text → Visual)

**Problem**: Users describe what they want in natural language. Agents need to map that to parameters.

**Solution**: Extend `AIPresetGenerator.js` with a more structured mapping:

```javascript
// Emotional/aesthetic vocabulary → parameter ranges
const AESTHETIC_MAPS = {
    // Emotions
    serene:    { speed: [0.1, 0.3], chaos: [0, 0.05], intensity: [0.3, 0.5] },
    energetic: { speed: [2.0, 3.0], chaos: [0.5, 1.0], intensity: [0.7, 1.0] },
    mysterious:{ speed: [0.3, 0.6], chaos: [0.1, 0.3], hue: [220, 280], intensity: [0.2, 0.4] },
    joyful:    { speed: [1.0, 1.5], chaos: [0.2, 0.4], hue: [30, 60], intensity: [0.7, 0.9] },

    // Visual styles
    minimal:   { gridDensity: [4, 10], chaos: [0, 0.02], morphFactor: [0, 0.1] },
    intricate: { gridDensity: [40, 80], chaos: [0.1, 0.3], morphFactor: [0.3, 1.0] },
    organic:   { chaos: [0.3, 0.7], morphFactor: [0.5, 1.5], speed: [0.5, 1.0] },
    geometric: { chaos: [0, 0.05], gridDensity: [15, 30], morphFactor: [0, 0.2] },

    // Depth effects
    deep:      { dimension: [3.0, 3.3], gridDensity: [30, 60] },
    flat:      { dimension: [4.0, 4.5], gridDensity: [8, 15] },
    immersive: { dimension: [3.0, 3.5], rot4dXW: [0.5, 2.0], rot4dYW: [0.3, 1.5] }
};
```

### Phase 4: Collaborative Multi-Agent Workflow

Multiple agents working together on a choreography:

1. **Director Agent** — Defines the high-level narrative (scenes, moods, transitions)
2. **Color Agent** — Picks color presets and post-processing for each scene
3. **Motion Agent** — Designs rotation and parameter timelines
4. **Audio Agent** — Maps audio reactivity bands to parameters

Each agent uses the same MCP server, different tool subsets.

### Phase 5: Hooks for Agent Workflow

#### Pre-export validation hook

```bash
# .claude/settings.json — validate before export
{
    "hooks": {
        "PreToolCall": [
            {
                "tool": "export_package",
                "command": "node tools/validate-export.js"
            }
        ]
    }
}
```

#### Auto-gallery-save hook

After every `batch_set_parameters` or `create_choreography`, auto-save to a rotating gallery slot:

```bash
# .claude/settings.json
{
    "hooks": {
        "PostToolCall": [
            {
                "tool": "batch_set_parameters",
                "command": "echo 'Auto-saved state to gallery'"
            }
        ]
    }
}
```

---

## Architecture Diagram: Agent Feedback Loop

```
┌─────────────────────────────────────────────────────────┐
│                    AI AGENT (Claude/GPT)                  │
│                                                          │
│  1. describe_visual_state → understand current visual    │
│  2. batch_set_parameters  → change visualization         │
│  3. describe_visual_state → verify change                │
│  4. create_timeline       → design animation             │
│  5. create_choreography   → compose full performance     │
│  6. [future] capture_screenshot → get actual pixels      │
│                                                          │
└────────────────────┬────────────────────────────────────┘
                     │ MCP Protocol (stdio)
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    MCP SERVER (26 tools)                  │
│                                                          │
│  Tool handlers → VIB3Engine API → Render Pipeline        │
│                                                          │
│  Telemetry ← Event Stream ← Instrumentation             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    VIB3+ ENGINE                           │
│                                                          │
│  Quantum │ Faceted │ Holographic                         │
│  24 geometries × 6D rotation × creative tooling          │
│  Audio reactivity × Spatial input × Post-processing      │
│                                                          │
│  Output: 5-layer canvas composite                        │
└─────────────────────────────────────────────────────────┘
```

---

## Why This Matters

Agents can:
1. **Generate mathematically precise timelines** — 50+ parameter keyframes across 8+ tracks, perfectly synced to BPM, with easing functions humans couldn't manually coordinate
2. **Explore the parameter space systematically** — Try all 24 geometries × 3 systems × 6 rotation planes in seconds
3. **Design by description** — "Make it feel like being underwater at night" maps to specific parameter ranges
4. **Compose multi-scene choreographies** — 10+ scenes with cross-fades, system switches, and per-scene timelines
5. **Iterate without visual fatigue** — Agents don't get "used to" a look — they objectively assess parameter states

The agent harness transforms VIB3+ from a tool you use into a creative medium agents can compose with.
