# Dev Track Session — February 6, 2026

**Branch**: `claude/review-changes-mlb3otup9gbf38nf-4wT2p`
**Merged from**: `claude/project-review-planning-NWnhW` (5 unmerged commits)
**Previous session**: `DOCS/DEV_TRACK_SESSION_2026-01-31.md`

---

## Session Goals

1. Audit the 5 unmerged commits since PR #79 (Exhale/Breath, VitalitySystem, shader rewrites)
2. Run full test suite + shader verification
3. Identify and fix all regressions and sync issues
4. Document current state clearly so development can continue confidently

---

## Starting State

### Branch Topology
```
cfe08e4  feat: add 'Exhale' breath modulation to all visualization systems
a859a8d  feat(core): add vitality system, polychora stub, and engine polish
7108fa4  fix(shaders): sync quantum/faceted shaders and fix flashing
1df128f  fix(faceted): fix wrong shader logic and sync glsl/wgsl
aa831a2  feat(holographic): implement exhale breathing effect and fix shader sync
2997f20  Merge pull request #79  <-- last merged state
```

### Initial Test Run
- **Tests**: 929 passed, **4 failed** (FacetedSystem contract compliance)
- **Shader Verifier**: FAILED — holographic missing 4 required uniforms, `u_breath` missing from external files

---

## Audit Findings

### 1. FacetedSystem Rewrite Broke Contract (4 test failures)

**Root cause**: FacetedSystem was rewritten to use `UnifiedRenderBridge` exclusively (commits `1df128f`, `7108fa4`, `cfe08e4`). The old `init()`, `resize()`, `dispose()` methods were removed. Tests in `RendererContract.test.js` expect them.

**Fix**: Added `init()`, `resize()`, `dispose()` as contract-compliant methods that delegate to the bridge-based equivalents.

**File**: `src/faceted/FacetedSystem.js`

### 2. WGSL Faceted Shader References Undeclared Struct Fields

**Root cause**: The inline WGSL in `FacetedSystem.js` references `u.mouse` (line 473, 483) and `u.roleIntensity` (line 505) but the `VIB3Uniforms` struct didn't declare `mouse` or `roleIntensity`.

**Fix**: Added `roleIntensity: f32` and `mouse: vec2<f32>` to the WGSL struct.

**File**: `src/faceted/FacetedSystem.js` (inline WGSL)

### 3. External Shader Files Missing `u_breath`

**Root cause**: The Exhale feature (commit `cfe08e4`) added `u_breath` to all 3 inline JS shaders and the verifier's embedded copies, but the external `.glsl` and `.wgsl` files were not updated.

**Files fixed**:
- `src/shaders/quantum/quantum.frag.glsl` — added `u_breath`, `u_bass`, `u_mid`, `u_high`
- `src/shaders/faceted/faceted.frag.glsl` — added `u_breath`
- `src/shaders/quantum/quantum.frag.wgsl` — replaced `_pad2` with `breath: f32`
- `src/shaders/faceted/faceted.frag.wgsl` — added `breath: f32`, removed padding

### 4. Holographic System Uses Non-Standard Uniform Names (By Design)

**Status**: NOT A BUG — documented as architectural decision.

The holographic system intentionally uses its own parameter names in GLSL:
- `u_density` instead of `u_gridDensity`
- `u_morph` instead of `u_morphFactor`
- `u_color` (vec3) instead of `u_hue` (float)
- No `u_dimension` (uses hardcoded 2.5 base + breath modulation)

The `HolographicVisualizer.mapParameterName()` method translates standard names to holographic names at the JS level. The WGSL path (via UnifiedRenderBridge) uses standard names because it goes through `packVIB3Uniforms()`.

This means the shader verifier will always report holographic GLSL as "missing required" for `u_gridDensity`, `u_morphFactor`, `u_hue`, `u_dimension`. This is expected.

### 5. PolychoraSystem Stub — Safe

**Status**: SAFE — no risk.

The stub at `src/polychora/PolychoraSystem.js` (77 lines):
- Defaults to `this.active = false`
- `render()` guards on `!this.active`
- Has a placeholder shader that does nothing
- `console.log('Polychora System initialized (Stub)')` on init
- Not imported by VIB3Engine or any active code path
- Only imported by VIB3Engine if someone explicitly adds it

**CLAUDE.md** already documents: "Polychora is TBD — not production ready, disabled in UI"

### 6. VitalitySystem Integration — Clean

**Status**: GOOD — well-integrated, graceful fallback.

`VitalitySystem.js` (53 lines):
- Simple sine-wave breath cycle: `(1 - cos(angle)) * 0.5` over 6-second period
- Returns 0 when not running
- Integrated into VIB3Engine via `_startGlobalLoop()` using `requestAnimationFrame`
- Pushes `{ breath }` to active system via `updateParameters()`
- Graceful shutdown in `VIB3Engine.destroy()`: calls `vitality.stop()`

All 3 systems handle missing breath gracefully:
- Quantum: `this.params.breath || 0.0`
- Faceted: `'breath' in params` check, defaults to 0
- Holographic: Falls back to local sine wave if `breath` not provided

### 7. Triple-Copy Shader Problem (Systemic Risk)

**Status**: DOCUMENTED — not fixed this session, needs architectural decision.

Each shader exists in 3 places:
1. **Inline in JS** (e.g., `QuantumVisualizer.js` line 251-774) — the actual runtime code
2. **External .glsl/.wgsl files** (e.g., `src/shaders/quantum/quantum.frag.glsl`) — for external tools/reference
3. **Verifier's embedded copies** (e.g., `tools/shader-sync-verify.js` line 571-596) — for Node.js static analysis

Any shader change requires updating all 3 copies manually. This has already caused issues twice (commits `1df128f` and `7108fa4`).

**Recommendation for next session**: Refactor the verifier to read from the external files on disk (using `fs.readFileSync`), and consider loading inline shaders from external files at build time. This would reduce to 2 copies, with the verifier checking external↔inline parity.

---

## Post-Fix State

### Test Results: 933 passed, 0 failed (43 test files)

### Shader Verifier Summary

| System | Required | Status |
|--------|----------|--------|
| Quantum | 17/17 | All required present (GLSL+WGSL) |
| Faceted | 17/17 | All required present (GLSL+WGSL) |
| Holographic | 13/17 | Missing 4 in GLSL (by design — uses non-standard names) |

**u_breath**: GLSL+WGSL across all 3 systems

### Remaining Warnings (all expected/non-blocking)
- Quantum GLSL missing recommended: `u_bass`, `u_mid`, `u_high` (handled in JS via `window.audioReactive`)
- Holographic GLSL uses system-specific names for 4 required uniforms (by-design)
- WGSL shaders have extra layer/density/speed uniforms for WebGPU uniform buffer layout

---

## Files Changed This Session

| File | Change |
|------|--------|
| `src/faceted/FacetedSystem.js` | Added `init()`, `resize()`, `dispose()` contract methods; added `roleIntensity` + `mouse` to WGSL struct |
| `src/shaders/quantum/quantum.frag.glsl` | Added `u_bass`, `u_mid`, `u_high`, `u_breath` uniforms |
| `src/shaders/faceted/faceted.frag.glsl` | Added `u_breath` uniform |
| `src/shaders/quantum/quantum.frag.wgsl` | Replaced `_pad2` with `breath: f32` |
| `src/shaders/faceted/faceted.frag.wgsl` | Added `breath: f32`, removed padding |

---

## Merge Recommendation

**Do NOT merge yet.** Current branch is good for continued development. Recommended milestone to merge at:

1. The triple-copy shader problem is addressed (verifier reads from disk)
2. Holographic uniform naming is either standardized or the verifier is taught to handle the mapping
3. The `u_breath` modulation is visually verified in a browser (not just structurally correct)

The current state is **stable and clean** — all tests pass, all required uniforms are present where needed, and the architectural issues are documented. Safe to develop further on this branch.

---

## Next Steps (Prioritized)

1. **Refactor shader-sync-verify.js** to read external .glsl/.wgsl files from disk instead of embedded copies
2. **Visual QA** the Exhale/Breath modulation in a browser to confirm it looks correct
3. **Consider standardizing** Holographic GLSL to use standard uniform names (would require rewriting the holographic shader's internal parameter flow)
4. **Add `u_bass`/`u_mid`/`u_high`** to Quantum GLSL shader for direct audio reactivity (currently handled in JS)
5. **Update CLAUDE.md** to document the VitalitySystem and Exhale feature
