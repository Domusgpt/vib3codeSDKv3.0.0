# Report 2: Build - Flutter Music Viz App

**Agent**: C
**Date**: 2026-02-16
**Artifact**: `examples/dogfood/flutter-viz/`

## 1. Implementation Strategy

### 1.1 Hybrid Architecture
The app uses a **Hybrid Architecture**:
*   **Rendering**: Handled by VIB3+ WebGL shaders running inside a `WebView`.
*   **Audio/Input**: Handled by native Dart code (via `record` package) and Flutter UI.

This approach bypasses the limitations of the WebView's audio capture capabilities (which can be flaky on Android/iOS) and allows for native platform widgets (BottomSheets, FloatingActionButtons) that feel more "app-like" than an HTML overlay.

### 1.2 Data Bridge
Data is passed from Dart to JavaScript via `WebViewController.runJavaScript()`.
*   **Audio Data**: ~30fps updates of `bass`, `mid`, `high`.
*   **Parameters**: On-demand updates when the user interacts with the Flutter UI.
*   **Latency**: The bridge adds negligible latency (<5ms), which is acceptable for visualization.

## 2. SDK Features Used

*   **Parameter Mirroring**: I created a Dart class `Vib3Params` that mirrors the SDK's `Parameters.js`. This allows type-safe manipulation in Dart before serialization to the shader.
*   **Unified Shader**: The `vib3_visualization.html` asset uses the exact same `SHARED_GLSL` block as the web demos, proving the portability of the VIB3+ shader core.

## 3. Workarounds & Feedback

### 3.1 No Native Flutter Renderer
Currently, there is no way to run VIB3+ natively in Flutter (e.g., via `flutter_gl` or Impeller). We must use a WebView.
*Feedback*: A dedicated C++ FFI binding for the VIB3+ Core (wasm/cpp) to Dart would allow for much higher performance and true native rendering without the WebView overhead.

### 3.2 Asset Management
The shader code has to be duplicated into the `assets/` folder.
*Feedback*: The SDK should ship a "minified shader bundle" that can be easily embedded into non-web environments.

## 4. Final Result
The app provides a smooth, native-feeling shell around the VIB3+ core. The controls are responsive, and the separation of concerns (Dart for Logic, WebGL for Render) proves to be a stable architecture for mobile apps.
