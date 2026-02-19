# Synesthesia Gold Standard Coverage Matrix

This file is the audit layer for Synesthesia. It maps Gold Standard vocabulary to concrete implementation points and runtime checks.

| Section | Pattern | Status | Implementation Anchor | Activation | Validation Hint |
|---|---|---|---|---|---|
| A | Approach/Retreat | full | `onSecondaryApproach` / `onSecondaryRetreat` | hover enter/leave | Fast approach, slow retreat on floating panel |
| A | Burst | full | `onBurst` | click/tap + onset | fast chaos/speed attack with release |
| A | Crystallize/Color Flood | full | `onCrystallize` / `onColorFlood` | long press + release | freeze + desaturate then vivid recovery |
| B | Inverse Density Seesaw | full | `pushSecondaryState` | continuous | one density up while the other goes down |
| B | Energy Conservation | full | `pushSecondaryState` | continuous | approximate total visual energy preserved |
| C | CSS Variable Bridge | full | `updateCSSBridge` | every frame | HUD/meter/border sync to VIB3 state |
| D | 8-scene Narrative Arc | full | `ChoreographyPlayer` config | idle 30s | autonomous scene progression starts |
| F | Timing Asymmetry | full | 400ms vs 800ms transitions | hover interactions | approach reads urgent, retreat reads relaxed |
| F | EMA smoothing | full | `ema()` + per-param tau values | continuous mapping | smooth responses with no parameter snaps |
| G | Agent Design Loop | partial | docs + labs + QA protocol | implementation process | design/analyze/enhance loop is documented |

## Machine-readable Source

Use `gold-standard-coverage.json` when building linting or dashboard tooling.
