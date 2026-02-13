# VIB3+ Agent Integration

## MCP Server Setup

### Claude Desktop / Cursor / Any MCP Client

Add to your MCP settings (`claude_desktop_config.json` or equivalent):

```json
{
  "mcpServers": {
    "vib3": {
      "command": "node",
      "args": ["/path/to/vib3codeSDKv3.0.0/src/agent/mcp/stdio-server.js"]
    }
  }
}
```

Or if installed globally via npm:

```json
{
  "mcpServers": {
    "vib3": {
      "command": "vib3-mcp"
    }
  }
}
```

### Available MCP Tools (26)

**Onboarding & Query:**

| Tool | Description |
|------|-------------|
| `get_sdk_context` | Get full SDK context for onboarding (call this first) |
| `verify_knowledge` | Quiz to verify agent understands the SDK |
| `search_geometries` | Browse all 24 geometry variants |
| `get_parameter_schema` | Get JSON schema for all parameters |
| `get_state` | Get current engine state |
| `describe_visual_state` | Natural-language description of what the visualization looks like |

**Scene & Parameter Control:**

| Tool | Description |
|------|-------------|
| `create_4d_visualization` | Create a visualization with system + geometry |
| `set_rotation` | Set 6D rotation (XY, XZ, YZ, XW, YW, ZW) |
| `set_visual_parameters` | Set hue, speed, chaos, intensity, etc. |
| `batch_set_parameters` | Atomically set system + geometry + rotation + visual + preset in one call |
| `switch_system` | Switch between quantum/faceted/holographic |
| `change_geometry` | Change geometry (0-23 index or name+core) |
| `randomize_parameters` | Randomize for creative exploration |
| `reset_parameters` | Reset to defaults |

**Creative Design:**

| Tool | Description |
|------|-------------|
| `apply_color_preset` | Apply one of 22 themed color presets (Ocean, Neon, Cyberpunk, etc.) |
| `set_post_processing` | Configure 14 composable post-processing effects |
| `create_timeline` | Create multi-track keyframe animation with BPM sync |
| `play_transition` | Smooth animated transitions between visual states |
| `create_choreography` | Multi-scene coordinated performance with transitions |

**Reactivity & Audio:**

| Tool | Description |
|------|-------------|
| `set_reactivity_config` | Configure audio/tilt/interaction |
| `get_reactivity_config` | Get current reactivity config |
| `configure_audio_band` | Configure bass/mid/high audio bands |
| `apply_behavior_preset` | Apply preset (ambient/reactive/immersive/energetic/calm/cinematic) |

**Gallery & Export:**

| Tool | Description |
|------|-------------|
| `save_to_gallery` | Save current state to gallery slot |
| `load_from_gallery` | Load from gallery slot |
| `export_package` | Export as VIB3Package |

### Available MCP Resources

| URI | Description |
|-----|-------------|
| `vib3://docs/claude-md` | Full technical reference |
| `vib3://docs/geometry-summary` | 24 geometry + 6D rotation reference |
| `vib3://docs/control-reference` | Parameter ranges and controls |
| `vib3://state/current` | Live engine state |

## Claude Code Skills

Two Claude Code skills are available in `.claude/commands/`:

| Skill | Command | Purpose |
|-------|---------|---------|
| VIB3+ Design | `/vib3-design` | Design visualizations, choreograph timelines, create presets, build scroll animations |
| VIB3+ Dev | `/vib3-dev` | Extend the codebase — add geometries, shaders, MCP tools, tests, integrations |

### Usage

In Claude Code, type `/vib3-design` or `/vib3-dev` to activate the skill context. The design skill supports both live MCP control and artifact generation modes.

## Agent Packs

Pre-compiled context files optimized for different agent types:

| File | For | Content |
|------|-----|---------|
| `claude-agent-context.md` | Claude Code / Claude Desktop | Compact SDK reference + tool usage examples |
| `openai-agent-context.md` | OpenAI Assistants / GPTs | Function calling schema + examples |

## Quick Test

```bash
# Test MCP server locally
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | node src/agent/mcp/stdio-server.js
```
