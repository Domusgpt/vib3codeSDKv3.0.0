# VIB3+ SDK Status

This file is the single source of truth for high-level release status.

## Release metadata

| Field | Status |
|---|---|
| Current package version | `2.0.3` (from `package.json`) |
| Release date | Unreleased in repository changelog (pending release entry for `2.0.3`) |
| Supported platforms | Web browsers, Node.js CLI/MCP workflows, WASM runtime, Flutter integration, and framework wrappers (React/Vue/Svelte) |

## Test status

Test status is CI-linked (not hardcoded):

- Follow the baseline test/CI workflow in [`DOCS/CI_TESTING.md`](./CI_TESTING.md).
- Check your repository CI provider (GitHub Actions or equivalent pipeline) for live pass/fail state.

## Update policy

- Update this file whenever `package.json` version changes.
- Keep test status summary link-based (CI), not hardcoded with static pass-count numbers.
- If the version is unreleased, explicitly mark it as unreleased until changelog/release publication is completed.
