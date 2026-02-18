# Lab 02 — Context Pool Lifecycle

## Goal
Validate context budget behavior during narrative transitions.

## Procedure
1. Open DevTools console and monitor runtime logs.
2. Scroll across sections that trigger new runtime acquisitions.
3. Confirm old contexts are released as new sections become active.
4. Confirm visual continuity during acquire/release transitions.

## Expected Outcome
ContextPool enforces bounded concurrent contexts while preserving narrative flow.
