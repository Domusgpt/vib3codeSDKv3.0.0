# REPORT 1: Onboarding & Architecture Decisions

**Date**: 2026-02-15
**SDK Version**: VIB3+ SDK v2.0.3
**Target**: Flutter music visualization app (Android + iOS) with home screen widgets

---

## SDK Onboarding Experience

### What went well

1. **CLAUDE.md is excellent**. The single-file project brief gives a comprehensive overview in ~15 minutes. The parameter ranges table, keyboard shortcuts, and project structure map are immediately actionable. This is one of the best project onboarding documents I have seen in an open-source SDK.

2. **synesthesia.html is the perfect reference artifact**. It demonstrates the complete audio-reactive pipeline in a single self-contained file: 8-band spectral decomposition, deltaTime-based EMA smoothing, spectral flux onset detection, and direct uniform mapping. The GLSL shared block is clean and extractable.

3. **Shader consistency across systems**. All three systems (Faceted, Quantum, Holographic) share identical 6D rotation matrix math and the same 8 lattice geometry functions. The rotation order (XY->XZ->YZ->XW->YW->ZW) is consistent everywhere. This means I can extract a single shared GLSL block for the Flutter WebView.

4. **24-geometry encoding is elegant**. `index = coreType * 8 + baseGeometry` is trivial to implement in Dart and trivial to decode in GLSL. The warp functions (hypersphere, hypertetrahedron) are well-documented.

### What caused friction

1. **Hue convention inconsistency**. FacetedSystem passes `u_hue` as 0-360 and divides by 360.0 in the shader. synesthesia.html passes it as 0-1. QuantumVisualizer passes it as 0-360 then divides by 360.0. HolographicVisualizer uses `this.variantParams.hue / 360`. There is no canonical "this is the right way" in the docs. I will standardize on 0-360 in Dart, normalize to 0-1 at the JavaScript bridge layer.

2. **Three rendering approaches for three systems**. Faceted uses `FacetedSystem` (bridge-based). Quantum uses `QuantumHolographicVisualizer` (direct GL, constructor-based). Holographic uses `HolographicVisualizer` (direct GL, constructor-based). For the Flutter WebView, I need to unify these into a single HTML file with three shader programs, similar to how synesthesia.html does it. This is the right approach but the SDK does not provide it out of the box for embedding.

3. **No official embed/iframe mode**. The SDK is designed for full-page rendering. There is no `<script src="vib3.min.js">` CDN bundle or `VIB3.embed(container)` API. For Flutter WebView, I must build a self-contained HTML asset. This is noted as a gap in CLAUDE.md ("CDN/UMD distribution for `<script>` tag usage" is listed as upcoming).

4. **HolographicVisualizer has different uniform naming**. It uses `u_density`, `u_speed`, `u_color`, `u_roleDensity`, `u_roleSpeed`, etc. instead of the shared `u_gridDensity`, `u_morphFactor` naming used by Faceted and Quantum. This means my unified shader HTML needs separate uniform setup per system, which adds complexity.

---

## Architecture Decisions

### Decision 1: WebView-based rendering (not native OpenGL)

**Rationale**: VIB3+ shaders are WebGL GLSL. Porting to native OpenGL ES or Metal/Vulkan would require rewriting all three fragment shaders plus the rotation math for a different shading language and render pipeline. The WebView approach lets me use the exact same GLSL code from the SDK.

**Tradeoff**: ~5-10ms latency on the Flutter-to-WebView JavaScript channel. For audio reactivity at 60fps, this means audio data arrives 1-2 frames late. Acceptable for music visualization but would be a problem for interactive instruments.

**Implementation**: `webview_flutter` package with `JavaScriptChannel` for bidirectional communication. Flutter sends JSON-encoded parameter updates, WebView calls back with frame timing data.

### Decision 2: Unified HTML asset with three shader programs

**Rationale**: Rather than loading three separate HTML files, I will build one `vib3_visualization.html` that compiles all three shader programs at init and switches between them via JavaScript calls from Flutter. This is the same pattern used in synesthesia.html.

**Key difference from synesthesia.html**: My HTML will not include audio analysis (that happens in Dart), autonomous choreography, or motion sensors. It is a pure rendering surface. All intelligence lives in Dart.

### Decision 3: Flutter-side FFT via audio capture plugins

**Rationale**: Web Audio API does not work inside Android/iOS WebViews (no microphone access, no MediaStream). Audio capture must happen natively. I will use `flutter_audio_capture` or `record` for mic input and process FFT in Dart.

**Pipeline design**:
```
Microphone -> Flutter audio plugin -> Raw PCM samples
  -> Dart FFT (custom, no heavy dependency)
  -> 8-band energy decomposition (same band ranges as synesthesia.html)
  -> JSON bridge to WebView
  -> Shader uniforms (u_bass, u_mid, u_high + full 8-band array)
```

**Band ranges** (matching synesthesia.html for 44100Hz):
```
Band 0: bins 1-3     (21-65 Hz)     Sub-bass
Band 1: bins 3-9     (65-194 Hz)    Bass
Band 2: bins 9-23    (194-496 Hz)   Low-mid
Band 3: bins 23-56   (496-1.2kHz)   Mid
Band 4: bins 56-139  (1.2-3kHz)     Upper-mid
Band 5: bins 139-279 (3-6kHz)       Presence
Band 6: bins 279-558 (6-12kHz)      Brilliance
Band 7: bins 558-930 (12-20kHz)     Air
```

### Decision 4: State management via ChangeNotifier (not Riverpod/Bloc)

**Rationale**: This is a single-screen app with a small state surface. Using ChangeNotifier + Provider keeps dependencies minimal and the code readable without requiring bloc/riverpod knowledge. The state is: current system (enum), geometry index (int), 11 float parameters, 8 audio bands, and user preferences.

### Decision 5: Home screen widget strategy

**Android (AppWidget)**: Will use a `WebView` inside the widget via `RemoteViews` with a custom approach -- actually, Android AppWidgets cannot render WebViews. Instead, I will render a static/animated preview using the widget's `RemoteViews` with a `Canvas`-based approach, or use a periodic screenshot from the main app's WebView cached as a bitmap. More realistically, the widget will show the current preset name, geometry icon, and a gradient background derived from the current hue, with a tap-to-launch action.

**iOS (WidgetKit)**: WidgetKit is SwiftUI-based and timeline-driven. Similar constraints -- no WebView in widgets. The widget will display current state info and a color-derived background. A live activity extension could theoretically show animated content but that is out of scope.

**Honest assessment**: True "live visualization" in home screen widgets is not feasible on either platform. The widgets will be informational/decorative with tap-to-launch. This is a real limitation of mobile widget APIs, not the SDK.

### Decision 6: Shader extraction strategy

I will extract the shared GLSL from synesthesia.html (lines 39-182) and the three system-specific fragment shaders. The synesthesia.html versions are the most portable since they already handle the unified uniform set. The original system files (FacetedSystem.js, QuantumVisualizer.js, HolographicVisualizer.js) have system-specific extras (roleIntensity, breath, density variants) that I will omit for the Flutter version to keep the WebView shader simple and matching the synesthesia pattern.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| WebView WebGL not available on old devices | Low (WebGL is supported on Android 5+ / iOS 8+) | Fallback to static gradient |
| Audio latency > 30ms through JS bridge | Medium | Batch updates, send at 30fps not 60fps |
| WebView performance on low-end Android | Medium | Cap canvas resolution at 720p, reduce grid density |
| App Store rejection for background audio | Low | Proper audio session configuration |
| Widget rendering limitations | Certain | Accept informational widget, not live viz |

---

## Time Estimate

| Component | Estimated effort |
|-----------|-----------------|
| vib3_visualization.html (shader asset) | 45 min |
| Dart models + services | 30 min |
| Flutter UI (screens, controls) | 45 min |
| Android widget config | 20 min |
| iOS widget config | 20 min |
| Testing + polish | 30 min |
| Reports 2 & 3 | 20 min |

**Total**: ~3.5 hours for a production-quality first pass.
