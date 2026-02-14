# VIB3+ Example Choreographies

Pre-built choreography specs for the `create_choreography` / `play_choreography` MCP tools and `ChoreographyPlayer` class.

## Choreographies

| File | Duration | BPM | Scenes | Character |
|------|----------|-----|--------|-----------|
| `cosmic-journey.json` | 60s | 120 | 3 | Deep ocean → galactic fractal → neon geometry |
| `meditation-breath.json` | 30s | — | 1 | Calm, looping, breathing, single-scene ambient |
| `energy-burst.json` | 20s | 140 | 3 | Explosive chaos → crystalline freeze → neon spin |

## Usage

### Via MCP tools (Live Mode)

```json
// Load the JSON file content and pass to play_choreography
{"tool": "play_choreography", "args": {"choreography": <contents of cosmic-journey.json>, "action": "play", "loop": true}}
```

### Via JavaScript

```javascript
import { ChoreographyPlayer } from '@vib3code/sdk/creative/ChoreographyPlayer';

const spec = await fetch('./examples/choreographies/cosmic-journey.json').then(r => r.json());
const player = new ChoreographyPlayer(engine);
player.load(spec);
player.loopMode = 'loop';
player.play();
```

### Via create_choreography → play_choreography workflow

```json
// 1. Create a choreography (or modify one of these examples)
{"tool": "create_choreography", "args": {"name": "My Show", "duration_ms": 30000, "scenes": [...]}}

// 2. Play it
{"tool": "play_choreography", "args": {"choreography_id": "<returned_id>", "action": "play"}}

// 3. Monitor
{"tool": "describe_visual_state"}

// 4. Transport controls
{"tool": "play_choreography", "args": {"action": "seek", "seek_percent": 0.5}}
{"tool": "play_choreography", "args": {"action": "pause"}}
{"tool": "play_choreography", "args": {"action": "stop"}}
```

## Design Notes

- **Scene tracks use scene-local time**: In each scene's `tracks`, `time: 0` means the start of that scene, not the start of the choreography.
- **Crossfade transitions** fade intensity to 0, switch system/geometry, then fade back in.
- **BPM sync**: When `bpm` is set, the ParameterTimeline can quantize keyframes to beat boundaries.
- **Loop-safe**: `meditation-breath.json` is designed to loop seamlessly (start and end values match).
- **Intensity fade-out**: `energy-burst.json` fades intensity to 0 at the end for clean loop or stop.
