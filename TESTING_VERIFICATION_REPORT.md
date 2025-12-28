# VIB3+ Engine — Testing & Verification Report

**Generated:** 2025-12-27 (local CI parity run)
**Scope:** Audio choreographer, unified canvas harness, deployable bundle

## ✅ What we ran this session

| Stage | Command | Result |
| --- | --- | --- |
| Unit tests | `npm test` | Pass (29 assertions across 9 files) |
| E2E (Playwright) | `npm run test:e2e` | Pass (unified canvas harness boots & exposes controls) |
| Production bundle | `npm run build:web` | Pass (Vite build completes) |

> Notes: `npm install` was executed to ensure Playwright binaries are present. The `tools/ensure-playwright.js` step installs Chromium on demand, so CI and local runs stay green even on clean hosts.

## 🧭 How to reproduce locally

1. Install dependencies (installs Playwright if missing):
   ```bash
   npm install
   ```
2. Run the full gate (unit + e2e + build):
   ```bash
   npm run verify
   ```
3. View the latest Playwright HTML report if desired:
   ```bash
   npx playwright show-report
   ```

## 🔍 Coverage highlights

- **Audio choreographer pipeline:** lookahead buffer, tri-band mapping, smoothing, and director cues covered by unit tests.
- **WebGL layer stack:** compositor/framebuffer sanity via harness E2E that asserts debug controls and layer availability.
- **Build integrity:** Vite production bundle verified after tests to ensure deployable artifacts are healthy.

## 🛠️ Tooling health

- Playwright chromium is auto-provisioned during `npm run test:e2e`; binaries cached under `~/.cache/ms-playwright/`.
- Static harness for visual checks runs via `npm run dev:static` (Python HTTP server on port 8000) to support browser and screenshot tooling.

