# VIB3+ SDK — OpenAI Agent Integration

> For OpenAI Assistants, GPTs, and function-calling agents.
> Version: 2.0.1


## Claude Code Skill Pack (ported for OpenAI use)

The Claude-focused skill context has been copied here so OpenAI agents can use the same high-signal workflow and domain constraints.

### Core Concepts (5 facts)

1. **3 active systems**: `quantum` (complex lattice), `faceted` (clean geometry), `holographic` (5-layer audio-reactive). Polychora is TBD.
2. **24 geometries**: `index = coreType * 8 + baseGeometry`. Cores: base(0), hypersphere(1), hypertetrahedron(2). Bases: tetrahedron, hypercube, sphere, torus, klein_bottle, fractal, wave, crystal.
3. **6D rotation**: XY, XZ, YZ (3D) + XW, YW, ZW (4D hyperspace). Range: -6.28 to 6.28 radians. Order: XY then XZ then YZ then XW then YW then ZW.
4. **5 canvas layers** per system: background, shadow, content, highlight, accent.
5. **Vitality System**: Global breath cycle (6s period, 0-1 sine wave) modulating all systems.

### Skill Workflow (OpenAI tool-calling equivalent)

```
1. vib3_create_visualization  → Create with system + geometry
2. vib3_set_rotation          → Set 6D rotation angles
3. vib3_set_visual_parameters → Tune hue, speed, chaos, intensity
4. vib3_apply_preset          → Apply preset (ambient/reactive/immersive/etc.)
5. vib3_get_state             → Inspect current state for iteration/export
```

### Prompting pattern for OpenAI agents

Use this structure when orchestrating multi-step visual design:

1. Ask for desired mood/style (e.g., "serene ocean deep").
2. Map request to system + geometry + rotation + visual params.
3. Call tools in the workflow order above.
4. Retrieve `vib3_get_state` and summarize what changed.
5. Offer one conservative and one experimental variation.

## Function Calling Schema

These can be registered as tools in an OpenAI Assistant or GPT:

```json
[
  {
    "type": "function",
    "function": {
      "name": "vib3_create_visualization",
      "description": "Create a 4D visualization. Systems: quantum (complex lattice), faceted (clean geometry), holographic (5-layer audio-reactive). 24 geometries: index = coreType * 8 + baseGeometry.",
      "parameters": {
        "type": "object",
        "properties": {
          "system": {"type": "string", "enum": ["quantum", "faceted", "holographic"]},
          "geometry_index": {"type": "integer", "minimum": 0, "maximum": 23},
          "projection": {"type": "string", "enum": ["perspective", "stereographic", "orthographic"]}
        },
        "required": ["system"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "vib3_set_rotation",
      "description": "Set 6D rotation. XY/XZ/YZ = 3D rotation. XW/YW/ZW = 4D hyperspace rotation (creates inside-out effects).",
      "parameters": {
        "type": "object",
        "properties": {
          "XY": {"type": "number", "minimum": -6.28, "maximum": 6.28},
          "XZ": {"type": "number", "minimum": -6.28, "maximum": 6.28},
          "YZ": {"type": "number", "minimum": -6.28, "maximum": 6.28},
          "XW": {"type": "number", "minimum": -6.28, "maximum": 6.28},
          "YW": {"type": "number", "minimum": -6.28, "maximum": 6.28},
          "ZW": {"type": "number", "minimum": -6.28, "maximum": 6.28}
        }
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "vib3_set_visual_parameters",
      "description": "Set visual parameters: hue (0-360), saturation (0-1), intensity (0-1), speed (0.1-3), chaos (0-1), morphFactor (0-2), gridDensity (4-100), dimension (3-4.5).",
      "parameters": {
        "type": "object",
        "properties": {
          "hue": {"type": "integer", "minimum": 0, "maximum": 360},
          "saturation": {"type": "number", "minimum": 0, "maximum": 1},
          "intensity": {"type": "number", "minimum": 0, "maximum": 1},
          "speed": {"type": "number", "minimum": 0.1, "maximum": 3},
          "chaos": {"type": "number", "minimum": 0, "maximum": 1},
          "morphFactor": {"type": "number", "minimum": 0, "maximum": 2},
          "gridDensity": {"type": "number", "minimum": 4, "maximum": 100},
          "dimension": {"type": "number", "minimum": 3.0, "maximum": 4.5}
        }
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "vib3_apply_preset",
      "description": "Apply a behavior preset. ambient=backgrounds, reactive=music, immersive=XR, energetic=high energy, calm=meditation, cinematic=video.",
      "parameters": {
        "type": "object",
        "properties": {
          "preset": {"type": "string", "enum": ["ambient", "reactive", "immersive", "energetic", "calm", "cinematic"]}
        },
        "required": ["preset"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "vib3_get_state",
      "description": "Get current visualization state (system, geometry, all parameters, rotation angles).",
      "parameters": {"type": "object", "properties": {}}
    }
  },
  {
    "type": "function",
    "function": {
      "name": "vib3_search_geometries",
      "description": "Browse all 24 geometry variants with descriptions. Filter by core_type: base, hypersphere, hypertetrahedron, or all.",
      "parameters": {
        "type": "object",
        "properties": {
          "core_type": {"type": "string", "enum": ["base", "hypersphere", "hypertetrahedron", "all"]}
        }
      }
    }
  }
]
```

## Geometry Quick Reference

| Index | Name | Core |
|-------|------|------|
| 0 | Tetrahedron | Base |
| 1 | Hypercube (Tesseract) | Base |
| 2 | Sphere | Base |
| 3 | Torus | Base |
| 4 | Klein Bottle | Base |
| 5 | Fractal | Base |
| 6 | Wave | Base |
| 7 | Crystal | Base |
| 8-15 | Same 8 + Hypersphere warp | Hypersphere |
| 16-23 | Same 8 + Hypertetra warp | Hypertetrahedron |

Formula: `index = core * 8 + base`

## Creative Quality Framework (Gold Standard v3)

Every VIB3+ visualization should exhibit three simultaneous parameter modes:

1. **Continuous Mapping** — Parameters as functions of input state every frame (audio→density, touch→rotation). Use EMA smoothing: `alpha = 1 - Math.exp(-dt / tau)`.
2. **Event Choreography** — Discrete events trigger Attack/Sustain/Release sequences (tap→chaos spike, beat→intensity flash).
3. **Ambient Drift** — Parameters breathe without input. Heartbeat: morph + intensity sine waves at different periods. Use prime-number periods to prevent mechanical loops.

**Design-Analyze-Enhance Loop**: Design your mappings → Analyze (is 4D visible? do events feel distinct?) → Enhance (layer the three modes, find emergent combinations).

**Reference docs**: `examples/dogfood/GOLD_STANDARD.md` (full vocabulary), `examples/codex/synesthesia/` (annotated golden reference).

## Integration Pattern

```python
# Python example using the VIB3+ MCP server
import subprocess, json

proc = subprocess.Popen(
    ["node", "src/agent/mcp/stdio-server.js"],
    stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True
)

def call_tool(name, args={}):
    msg = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                       "params": {"name": name, "arguments": args}})
    proc.stdin.write(msg + "\n")
    proc.stdin.flush()
    return json.loads(proc.stdout.readline())
```
