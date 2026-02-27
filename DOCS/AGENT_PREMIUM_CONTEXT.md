# Agent Premium Context — MCP Premium Tools

**For AI agents controlling VIB3+ with premium features.**

## Premium Tool Summary

The premium tier adds 8 MCP tools on top of the free SDK's 36 tools, totaling 44 tools.

### Premium Tools

| Tool | Description |
|------|-------------|
| `set_shader_parameter` | Fine-grained shader control: projection, UV scale, line thickness, noise frequencies, breath strength, auto-rotation, particle size, per-layer alpha |
| `set_rotation_lock` | Lock/unlock rotation axes, enable flight mode (3D locked, 4D free) |
| `set_layer_geometry` | Set different geometry for each of the 5 canvas layers |
| `add_visual_trigger` | Add threshold-based event trigger |
| `remove_visual_trigger` | Remove a trigger by ID |
| `list_visual_triggers` | List all active triggers |
| `configure_css_bridge` | Start/stop/configure CSS custom property binding |
| `create_premium_choreography` | Extended choreography with layer profiles, triggers, rotation locks per scene |

## License Requirement

All premium tools require a valid license. Calling a premium tool without a license returns:
```json
{
    "content": [{ "type": "text", "text": "Tool \"set_shader_parameter\" requires @vib3code/premium license." }],
    "isError": true
}
```

## Tool Schemas

### set_shader_parameter

```json
{
    "projectionType": 1,
    "uvScale": 5.0,
    "lineThickness": 0.08,
    "noiseFrequency": [13, 17, 23],
    "breathStrength": 0.6,
    "autoRotationSpeed": [0.0, 0.0, 0.0, 0.3, 0.25, 0.35],
    "particleSize": 0.15,
    "layerAlpha": { "background": 0.3, "shadow": 0.2, "content": 1.0, "highlight": 0.9, "accent": 0.1 }
}
```

### set_rotation_lock

```json
// Flight mode (lock 3D, free 4D)
{ "flightMode": true }

// Lock specific axes
{ "axes": ["rot4dXY", "rot4dXZ"], "locked": true, "values": [0.0, 1.57] }

// Unlock axes
{ "axes": ["rot4dXY"], "locked": false }
```

### set_layer_geometry

```json
// Explicit geometry
{ "layer": "background", "geometry": 10 }

// Offset from keystone
{ "layer": "accent", "offset": 3 }
```

### add_visual_trigger

```json
{
    "id": "bass_flash",
    "source": "audio.bass",
    "condition": "exceeds",
    "threshold": 0.8,
    "cooldown": 1000,
    "action": {
        "type": "set_parameters",
        "value": { "intensity": 1.0, "hue": 0 },
        "duration": 300,
        "revertTo": { "intensity": 0.7, "hue": 180 }
    }
}
```

### configure_css_bridge

```json
{ "enabled": true, "outbound": true, "inbound": false, "parameters": ["hue", "intensity"], "throttle": 16, "normalize": true }
```

### create_premium_choreography

```json
{
    "name": "portal_sequence",
    "bpm": 120,
    "mode": "loop",
    "scenes": [
        {
            "system": "quantum",
            "geometry": 16,
            "duration": 4000,
            "layer_profile": "storm",
            "rotation_locks": { "rot4dXY": 0.0, "rot4dXZ": 0.0, "rot4dYZ": 0.0 },
            "layer_geometries": { "background": 10, "accent": 18 },
            "triggers": [
                {
                    "source": "parameter.chaos",
                    "condition": "exceeds",
                    "threshold": 0.7,
                    "action": { "type": "color_preset", "value": "Cyberpunk Neon" }
                }
            ]
        }
    ]
}
```

## Agent Workflow — Premium-Enhanced

1. **Create base visualization** using free tools (`create_4d_visualization`, `switch_system`, `set_visual_parameters`)
2. **Fine-tune shaders** with `set_shader_parameter` for precise visual control
3. **Set up layer geometry** with `set_layer_geometry` for visual depth
4. **Add event triggers** with `add_visual_trigger` for reactive behavior
5. **Create choreography** with `create_premium_choreography` for multi-scene sequences
6. **Optionally enable CSS bridge** for web integration

## Creative Patterns

### Portal Effect
```
1. set_rotation_lock { flightMode: true }           // Lock 3D, free 4D
2. set_shader_parameter { projectionType: 1 }       // Stereographic projection
3. set_layer_geometry { layer: "background", offset: 8 }  // Different geometry per layer
4. add_visual_trigger { source: "parameter.chaos", condition: "exceeds", threshold: 0.7, action: { type: "layer_profile", value: "storm" } }
```

### Audio Storm
```
1. add_visual_trigger { source: "audio.bass", condition: "exceeds", threshold: 0.8, action: { type: "set_parameters", value: { chaos: 0.9, intensity: 1.0 }, duration: 300, revertTo: { chaos: 0.2, intensity: 0.7 } } }
2. add_visual_trigger { source: "audio.treble", condition: "exceeds", threshold: 0.6, action: { type: "color_preset", value: "Electric Blue" } }
3. set_shader_parameter { breathStrength: 0.8, noiseFrequency: [3, 5, 7] }
```
