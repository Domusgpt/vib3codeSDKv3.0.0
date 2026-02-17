Last reviewed: 2026-02-17

# Building VIB3+ Ultra for Android

This guide explains how to build the "Crystal Labyrinth" demo as an Android APK using the existing Flutter integration.

## Prerequisites

- Flutter SDK installed
- Android Studio / Android SDK installed
- Connected Android device or emulator

## Quick Build (GitHub Actions)

The repository includes a workflow `.github/workflows/flutter-apk.yml` that automatically builds an APK on push to `examples/flutter_demo/`.

To trigger a build for the Crystal Labyrinth demo:
1.  Copy the built web assets to the Flutter assets directory (see Local Build below).
2.  Push changes.
3.  Download the artifact from the Actions tab.

## Local Build Instructions

1.  **Build the Web Demo**
    Run the Vite build to bundle the Crystal Labyrinth demo:
    ```bash
    npm install
    npm run build:web
    ```
    This will output optimized files to `dist/`.

2.  **Prepare Flutter Assets**
    Copy the build output to the Flutter project's asset folder:
    ```bash
    mkdir -p examples/flutter_demo/assets/vib3/
    cp -r dist/* examples/flutter_demo/assets/vib3/
    ```

3.  **Configure Entry Point**
    Open `examples/flutter_demo/lib/vib3_controller.dart` and ensure the WebView points to the local index file or the deployed GitHub Pages URL:
    `https://<your-username>.github.io/vib3codeSDK/examples/dogfood/crystal_labyrinth.html`

4.  **Build APK**
    Navigate to the Flutter directory and build:
    ```bash
    cd examples/flutter_demo
    flutter build apk --release
    ```

5.  **Install**
    ```bash
    flutter install
    ```

## VIB3Link Networking on Android

For multi-user features (`VIB3Link`) to work on Android:
- Ensure the device has internet access.
- If using local dev server, use `adb reverse tcp:5173 tcp:5173` to forward ports.
