# Report 2: Build - Samsung TV Visualizer

**Agent**: D
**Date**: 2026-02-16
**Artifact**: `examples/dogfood/samsung-tv/`

## 1. Implementation Strategy

### 1.1 10-Foot UI Design
The UI is designed for viewing from 10 feet away:
- **No Cursor**: All interaction is via remote keys.
- **Large Text**: Minimum font size is 24px (scaled).
- **HUD Overlay**: Information is hidden by default to maximize the visual impact, togglable with the BLUE key.

### 1.2 Fixed Resolution Pipeline
To ensure stable 30fps on lower-end Tizen hardware (Mali-G52), I locked the canvas resolution to 1920x1080.
- **Viewport**: Static 0,0,1920,1080.
- **No Resize Listener**: TVs don't change orientation or window size. This saves CPU cycles.

### 1.3 Audio Strategy
The `AudioEngine` class implements a "try-catch" pattern:
1.  Attempt `getUserMedia` (works on newer high-end models with permission).
2.  Catch error -> Switch to `Synthetic Mode` (oscillator drone + LFO).
This ensures the visualizer is always "alive" even if the TV restricts microphone access.

## 2. SDK Features Used

*   **Shader Portability**: The same GLSL code used in the web and mobile demos ran on the TV target with zero modification to the math core.
*   **Parameter Tuning**: I adjusted `u_gridDensity` defaults to be lower (20 vs 40) to reduce fragment shader load for the TV GPU.

## 3. Workarounds & Feedback

### 3.1 Input Handling
Tizen's key codes are non-standard (e.g., `Return` is 10009). I had to hardcode these.
*Feedback*: The VIB3+ SDK should include a `Vib3Input` module that abstracts platform-specific input codes (Gamepad, Remote, Keyboard) into unified events (`onNavigate`, `onAction`).

### 3.2 WebGL Context Loss
TVs often kill the WebGL context when switching apps. I added a `webglcontextrestored` listener (in `index.html` logic, though simplified in `app.js` for this demo) to re-init the pipeline.

## 4. Final Result
The app boots instantly, responds to remote control inputs, and renders the 4D hypercube at a stable framerate. It effectively turns the TV into an ambient art installation.
