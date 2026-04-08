# Visual Event Patterns — Premium Module 4

**Module**: `VisualEventSystem`

## Overview

The VisualEventSystem enables threshold-based triggers: "When X crosses threshold Y, do Z." This is event choreography (Gold Standard Mode 2) — discrete state changes triggered by parameter values, audio bands, or custom events.

## Anatomy of a Trigger

```javascript
premium.events.addTrigger('trigger_id', {
    source: 'parameter.chaos',       // What to watch
    condition: 'exceeds',            // When to fire
    threshold: 0.7,                  // Threshold value
    cooldown: 1000,                  // Min ms between fires (default 1000)
    action: {
        type: 'set_parameters',      // What to do
        value: { hue: 0, speed: 2 }, // Action payload
        duration: 500,               // Hold duration (optional)
        revertTo: { hue: 180, speed: 1 }, // Revert state (optional)
        easing: 'easeOut',           // Transition easing (optional)
        transition: true             // Use TransitionAnimator (optional)
    }
});
```

## Sources

| Source format | Description | Example |
|---------------|-------------|---------|
| `parameter.<name>` | Engine parameter value | `parameter.chaos`, `parameter.speed` |
| `audio.<band>` | Audio frequency band | `audio.bass`, `audio.mid`, `audio.treble` |
| `custom.<name>` | Custom event from `events.emit()` | `custom.beatDetected` |

## Conditions

| Condition | Fires when... |
|-----------|---------------|
| `exceeds` | Value crosses above threshold (was below, now above) |
| `drops_below` | Value crosses below threshold (was above, now below) |
| `crosses` | Value crosses threshold in either direction |
| `equals` | Value is within 0.01 of threshold |

## Action Types

| Type | What it does | `value` format |
|------|-------------|----------------|
| `layer_profile` | Loads a layer relationship profile | Profile name string |
| `color_preset` | Applies a color preset | Preset name string |
| `set_parameters` | Sets engine parameters directly | `{ param: value }` object |
| `transition` | Smooth parameter transition | `{ param: value }` object |
| `custom` | Calls a custom function | `function(engine, premium)` |

## Patterns

### Audio-Reactive Layer Switching

```javascript
// Switch to "storm" profile when bass hits hard
premium.events.addTrigger('bass_storm', {
    source: 'audio.bass',
    condition: 'exceeds',
    threshold: 0.8,
    cooldown: 2000,
    action: {
        type: 'layer_profile',
        value: 'storm',
        duration: 3000,
        revertTo: 'holographic'
    }
});
```

### Chaos Burst

```javascript
// When chaos exceeds 0.7, flash red and boost speed
premium.events.addTrigger('chaos_burst', {
    source: 'parameter.chaos',
    condition: 'exceeds',
    threshold: 0.7,
    cooldown: 1500,
    action: {
        type: 'transition',
        value: { hue: 0, speed: 2.5, intensity: 1.0 },
        duration: 800,
        revertTo: { hue: 180, speed: 1.0, intensity: 0.7 },
        easing: 'easeOut',
        transition: true
    }
});
```

### Beat Detection Pulse

```javascript
// Custom beat detector emits events
premium.events.addTrigger('beat_pulse', {
    source: 'custom.beat',
    condition: 'exceeds',
    threshold: 0.5,
    cooldown: 200,
    action: {
        type: 'set_parameters',
        value: { intensity: 1.0, chaos: 0.6 },
        duration: 150,
        revertTo: { intensity: 0.7, chaos: 0.2 }
    }
});

// Your beat detector
audioAnalyzer.onBeat(() => {
    premium.events.emit('beat', 1.0);
});
```

### Scene-Scoped Triggers

Triggers registered as scene triggers are automatically cleared when the scene changes:

```javascript
// Via choreography extensions
const spec = {
    scenes: [
        {
            system: 'quantum',
            duration: 5000,
            triggers: [
                {
                    source: 'parameter.chaos',
                    condition: 'exceeds',
                    threshold: 0.6,
                    action: { type: 'color_preset', value: 'Cyberpunk Neon' }
                }
            ]
        }
    ]
};
```

## Subscribing to Trigger Fires

```javascript
// Listen for when a specific trigger fires
const unsub = premium.events.on('chaos_burst', (config) => {
    console.log('Chaos burst fired!', config);
});

// Clean up
unsub();
```

## MCP Tools

```json
// Add trigger
{ "tool": "add_visual_trigger", "args": { "id": "bass_hit", "source": "audio.bass", "condition": "exceeds", "threshold": 0.8, "action": { "type": "set_parameters", "value": { "hue": 0 } } } }

// Remove trigger
{ "tool": "remove_visual_trigger", "args": { "id": "bass_hit" } }

// List all triggers
{ "tool": "list_visual_triggers" }
```
