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

### Available MCP Tools (19)

| Tool | Description |
|------|-------------|
| `get_sdk_context` | Get full SDK context for onboarding (call this first) |
| `verify_knowledge` | Quiz to verify agent understands the SDK |
| `create_4d_visualization` | Create a visualization with system + geometry |
| `set_rotation` | Set 6D rotation (XY, XZ, YZ, XW, YW, ZW) |
| `set_visual_parameters` | Set hue, speed, chaos, intensity, etc. |
| `switch_system` | Switch between quantum/faceted/holographic |
| `change_geometry` | Change geometry (0-23 index or name+core) |
| `get_state` | Get current engine state |
| `randomize_parameters` | Randomize for creative exploration |
| `reset_parameters` | Reset to defaults |
| `save_to_gallery` | Save current state to gallery slot |
| `load_from_gallery` | Load from gallery slot |
| `search_geometries` | Browse all 24 geometry variants |
| `get_parameter_schema` | Get JSON schema for all parameters |
| `set_reactivity_config` | Configure audio/tilt/interaction |
| `get_reactivity_config` | Get current reactivity config |
| `configure_audio_band` | Configure bass/mid/high audio bands |
| `export_package` | Export as VIB3Package |
| `apply_behavior_preset` | Apply preset (ambient/reactive/immersive/energetic/calm/cinematic) |

### Available MCP Resources

| URI | Description |
|-----|-------------|
| `vib3://docs/claude-md` | Full technical reference |
| `vib3://docs/geometry-summary` | 24 geometry + 6D rotation reference |
| `vib3://docs/control-reference` | Parameter ranges and controls |
| `vib3://state/current` | Live engine state |

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

## Skill Packs (Claude Code + OpenAI)

Generated skill bundles for VIB3+ are in `agent-config/skills/`:

- `agent-config/skills/claude-code/`
  - `vib3-general-design`
  - `vib3-sdk-development`
- `agent-config/skills/openai/`
  - `vib3-general-design`
  - `vib3-sdk-development`

Zip artifacts are generated locally (not committed to git by default):

```bash
cd agent-config/skills
./build-skill-zips.sh
```

This script creates:
- `agent-config/skills/claude-code-skills-vib3.zip`
- `agent-config/skills/openai-skills-vib3.zip`
- `agent-config/skills/vib3-skills-all-formats.zip`

These skills include links to Anthropic Claude Code/MCP documentation and map directly to this repository's SDK docs.
