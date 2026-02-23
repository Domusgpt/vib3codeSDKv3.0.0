# Verification Walkthrough: VIB3+ Hybrid Build

This document provides a step-by-step guide to verifying the VIB3+ Ultra expansion, focusing on the Hybrid Flutter Demo (Native + WebView) and the Math Optimizations.

## 1. Prerequisites

Ensure you have the following installed:
*   **Flutter SDK** (3.24.0 or compatible)
*   **Node.js** (v18+) & `npm`
*   **Android SDK** (if building APK locally)

## 2. Verify Core Math Optimizations

We have refactored `Mat4x4` to use allocation-free static methods. To verify this didn't break the math:

1.  Navigate to the repository root.
2.  Run the verification script:
    ```bash
    node tools/verify_math_opt.mjs
    ```
3.  **Expected Output:**
    ```
    Verifying Mat4x4 optimizations...
    Test: Identity Matrix
    Test: Static Multiply
    Test: Rotation XY Out
    ✅ Mat4x4 Optimizations Verified!
    ```

## 3. Verify Web Assets (Ultra Tier)

The "Ultra Tier" runs inside a WebView. We must ensure the web assets are built correctly.

1.  Build the web project:
    ```bash
    npm install
    npm run build:web
    ```
2.  Verify the output in `dist/`:
    *   `dist/index.html` (Main Gallery)
    *   `dist/examples/dogfood/crystal_labyrinth.html` (Ultra Game Demo)
    *   `dist/examples/dogfood/ultra_universe.html` (Multi-Instance Demo)

## 4. Build & Run Hybrid Flutter Demo

This demo allows you to switch between **Native Dart** rendering and the **Ultra Web Engine**.

### A. Setup
1.  Navigate to the Flutter project:
    ```bash
    cd examples/flutter_demo
    ```
2.  Install dependencies:
    ```bash
    flutter pub get
    ```
3.  **Crucial Step:** Copy web assets to the Flutter assets directory (CI does this automatically, but locally you must do it manually):
    ```bash
    # From repo root
    mkdir -p examples/flutter_demo/assets/vib3/
    cp -r dist/* examples/flutter_demo/assets/vib3/
    ```

### B. Run on Device/Emulator
1.  Run the app:
    ```bash
    flutter run
    ```
2.  **Verify Hybrid Mode:**
    *   **Default:** App opens in **WEB ENGINE (ULTRA)** mode. You should see the high-fidelity VIB3+ WebGL visualization.
    *   **Interaction:** Use the dropdown in the header to switch demos (e.g., "Crystal Labyrinth").
    *   **Native Check:** Use the dropdown in the header to switch to **NATIVE DART (PREVIEW)**. You should see a simplified, CPU-rendered version. This proves native Dart integration is active.

### C. Build APK
1.  Build the release APK:
    ```bash
    flutter build apk --release
    ```
    *Note: R8 shrinking is disabled to prevent configuration issues with Play Store libraries in this demo.*
2.  Install `build/app/outputs/flutter-apk/app-release.apk` on your Android device.

## 5. Troubleshooting

*   **"White Screen" in Web Mode:** Ensure you ran Step 3 (Copy assets). The WebView needs local files.
*   **Build Errors (Android):** Ensure you are using NDK 25.1.8937393 (configured in `build.gradle`) or allow the Gradle plugin to install it.
