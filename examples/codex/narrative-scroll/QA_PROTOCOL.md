# Narrative Scroll QA Protocol

## Objective
Validate section-timed narrative choreography while ensuring pooled runtime behavior remains stable.

## Checkpoints
- T+0s: page loads and opening section is visible.
- T+10s: scroll progress indicator updates while scrolling.
- Mid-scroll: at least one section veil/reveal transition observed.
- Deep-scroll: triptych/cascade sections show active runtime transitions.

## Behavioral Expectations
- No hard visual discontinuities when crossing major section boundaries.
- ContextPool should maintain bounded active contexts.
- Scroll-driven choreography should continue if GSAP/Lenis load succeeds.

## Artifacts
- One screenshot at codex index entry listing.
- One screenshot of narrative-scroll shell running runtime.
