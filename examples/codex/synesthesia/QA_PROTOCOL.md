# Synesthesia Deterministic QA Protocol

## Objective
Validate motion legibility, coordination coherence, and Gold Standard behavior against deterministic checkpoints.

## Test Profiles

1. **Quiet Idle**: synthetic audio only, no interaction for 35s.
2. **Pulse**: manual clicks every 1s for 10s.
3. **Burst Sweep**: click + long press + release sequence.
4. **Portal Scroll**: slow scroll wheel sweeps for ZW/XW modulation.

## Timestamped Checkpoints

- **T+00s**: baseline state initialized; both engines visible.
- **T+15s**: continuous mapping active; no autonomous choreography yet.
- **T+30s**: choreography should arm.
- **T+31s**: mode label should indicate autonomous scene index.
- **T+45s**: at least one scene transition observed.

## Parameter Expectations

- **Approach**: grid density decreases, intensity rises, dimension decreases.
- **Retreat**: reverse with slower release curve.
- **Burst**: attack <= 200ms equivalent visual feel, release > 1.5s.
- **Crystallize**: chaos/speed trend toward 0 and saturation lowers.
- **Color Flood**: saturation and hue motion restore quickly.
- **Seesaw**: secondary density remains inverse-correlated with primary.

## Artifact Checklist

- Screenshot during normal active mode.
- Screenshot during approach/retreat interaction.
- Console trace of key mode changes (active/autonomous).
- Optional state snapshot JSON for primary and secondary parameter vectors.

## Review Rubric

- **Motion legibility**: can a reviewer identify named motions without code context?
- **Coordination coherence**: do dual engines read as related but distinct roles?
- **Transition quality**: no jarring discontinuities except intentional burst attacks.
- **Annotation quality**: code comments align with visible behavior.
