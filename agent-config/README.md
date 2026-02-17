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

### Available MCP Tools (31)

**Onboarding & Query:**

| Tool | Description |
|------|-------------|
| `get_sdk_context` | Get full SDK context for onboarding (call this first) |
| `verify_knowledge` | Quiz to verify agent understands the SDK |
| `search_geometries` | Browse all 24 geometry variants |
| `get_parameter_schema` | Get JSON schema for all parameters |
| `get_state` | Get current engine state |
| `describe_visual_state` | Natural-language description of what the visualization looks like |
| `get_aesthetic_vocabulary` | List all aesthetic descriptor words by category |

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
| `control_timeline` | Play/pause/stop/seek/speed control for created timelines |
| `play_transition` | Smooth animated transitions between visual states |
| `create_choreography` | Multi-scene coordinated performance with transitions |
| `play_choreography` | Load and play choreography specs with play/pause/stop/seek |
| `design_from_description` | Map natural-language description to VIB3+ parameters |

**Visual Feedback:**

| Tool | Description |
|------|-------------|
| `capture_screenshot` | Capture visualization as base64 PNG (browser context only) |

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
| `openai-agent-context.md` | OpenAI Assistants / GPTs | Function calling schema + examples + copied Claude skill workflow |

## How to use this in Codex and ChatGPT

### 1) Codex (skills + local agent workflows)

Codex skills are installed under `$CODEX_HOME/skills` (usually `~/.codex/skills`).

```bash
# List installable curated skills
python3 /opt/codex/skills/.system/skill-installer/scripts/list-curated-skills.py

# Install a skill from a GitHub repo/path
python3 /opt/codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo <owner>/<repo> \
  --path <path/to/skill>
```

After install, restart Codex so the new skill is loaded.

### 2) ChatGPT (custom GPT / Assistant setup)

ChatGPT does not currently load Codex `SKILL.md` folders directly. To use the same behavior in ChatGPT:

1. Put `agent-config/openai-agent-context.md` into your GPT/Assistant instructions or knowledge files.
2. Register the functions from the **Function Calling Schema** section in that file as tools/actions.
3. Run this MCP server (`src/agent/mcp/stdio-server.js`) behind your tool bridge so those functions call real SDK operations.

In short: Codex uses installed skills directly, while ChatGPT generally uses instruction/context files + registered tools.

## Quick Test

```bash
# Test MCP server locally
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | node src/agent/mcp/stdio-server.js
```
