/// VIB3+ Demo Screen
///
/// Complete demonstration of VIB3+ visualization with:
/// - Full-screen WebView integration of VIB3+ Engine
/// - Native UI controls for parameter manipulation
/// - Bridge for bi-directional communication

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
// Import for Android-specific features if needed
// import 'package:webview_flutter_android/webview_flutter_android.dart';
// Import for iOS-specific features if needed
// import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';
import 'vib3_controller.dart';

class Vib3DemoScreen extends StatefulWidget {
  const Vib3DemoScreen({super.key});

  @override
  State<Vib3DemoScreen> createState() => _Vib3DemoScreenState();
}

class _Vib3DemoScreenState extends State<Vib3DemoScreen> {
  late final WebViewController _webViewController;
  late final Vib3Controller _controller;
  bool _isWebViewReady = false;
  bool _showControls = true;
  String _currentDemo = 'index.html'; // Default to main gallery

  @override
  void initState() {
    super.initState();
    _controller = Vib3Controller();

    // Initialize WebViewController
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            // Update loading bar.
          },
          onPageStarted: (String url) {},
          onPageFinished: (String url) {
            setState(() {
              _isWebViewReady = true;
            });
            // Inject initial parameters once loaded
            _updateWebViewParameters();
          },
          onWebResourceError: (WebResourceError error) {},
        ),
      )
      ..addJavaScriptChannel(
        'Vib3Bridge',
        onMessageReceived: (JavaScriptMessage message) {
          // Handle messages from JS
          debugPrint('Message from VIB3: ${message.message}');
        },
      );

    // Load initial asset
    _loadAsset(_currentDemo);

    // Listen to controller changes to update WebView
    _controller.addListener(_onControllerChanged);
  }

  void _loadAsset(String filename) {
    // Determine path based on filename
    // Main index is at root of assets/vib3/
    // Demos are in examples/dogfood/
    String path;
    if (filename == 'index.html') {
      path = 'assets/vib3/index.html';
    } else {
      path = 'assets/vib3/examples/dogfood/$filename';
    }

    _webViewController.loadFlutterAsset(path);
  }

  void _onControllerChanged(Vib3Params params) {
    if (!_isWebViewReady) return;
    _updateWebViewParameters();
  }

  void _updateWebViewParameters() {
    // Map Dart params to JS calls
    // Example: window.vib3.setParam('rot4dXW', value)
    // This assumes the JS side exposes a global 'vib3' object or similar hook.
    // If not, we rely on the WebView simply rendering the content.
    // For now, let's try to update basic parameters if the hook exists.

    final p = _controller.params;
    final jsCode = '''
      if (window.vib3Engine) {
        window.vib3Engine.setParameter('rot4dXW', ${p.rot4dXW});
        window.vib3Engine.setParameter('rot4dYW', ${p.rot4dYW});
        window.vib3Engine.setParameter('rot4dZW', ${p.rot4dZW});
        window.vib3Engine.setParameter('speed', ${p.speed});
        window.vib3Engine.setParameter('intensity', ${p.intensity});
        window.vib3Engine.setParameter('hue', ${p.hue});
      }
    ''';

    _webViewController.runJavaScript(jsCode).catchError((e) {
      // Ignore errors if JS bridge isn't ready
    });
  }

  @override
  void dispose() {
    _controller.removeListener(_onControllerChanged);
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. WebView (The VIB3+ Visuals)
          WebViewWidget(controller: _webViewController),

          // 2. Loading Indicator
          if (!_isWebViewReady)
            const Center(
              child: CircularProgressIndicator(color: Color(0xFF00FF88)),
            ),

          // 3. UI Overlay
          if (_showControls)
            SafeArea(
              child: Column(
                children: [
                  _buildHeader(),
                  const Spacer(),
                  _buildDemoSelector(),
                  const SizedBox(height: 10),
                  _buildControlsPanel(),
                ],
              ),
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => setState(() => _showControls = !_showControls),
        backgroundColor: const Color(0xFF00FF88).withOpacity(0.8),
        mini: true,
        child: Icon(
          _showControls ? Icons.visibility_off : Icons.visibility,
          color: Colors.black,
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: Colors.black54,
      child: Row(
        children: [
          const Text(
            'VIB3+',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF00FF88),
              letterSpacing: 2,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            'Ultra',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Colors.purpleAccent,
              letterSpacing: 1,
            ),
          ),
          const Spacer(),
          // Connection status indicator
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: _isWebViewReady ? Colors.green : Colors.red,
              shape: BoxShape.circle,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDemoSelector() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.black87,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white24),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _currentDemo,
          dropdownColor: Colors.black87,
          style: const TextStyle(color: Colors.white, fontSize: 14),
          icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF00FF88)),
          isDense: true,
          items: const [
            DropdownMenuItem(value: 'index.html', child: Text('Standard Gallery')),
            DropdownMenuItem(value: 'crystal_labyrinth.html', child: Text('Crystal Labyrinth (Game)')),
            DropdownMenuItem(value: 'ultra_universe.html', child: Text('Ultra Universe (Multi-Instance)')),
          ],
          onChanged: (value) {
            if (value != null && value != _currentDemo) {
              setState(() {
                _currentDemo = value;
                _isWebViewReady = false;
              });
              _loadAsset(value);
            }
          },
        ),
      ),
    );
  }

  Widget _buildControlsPanel() {
    // Only show native controls for the standard gallery where we might inject JS
    // For specific demos, they have their own UI or logic.
    if (_currentDemo != 'index.html') return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.black87,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            '4D Rotation Control',
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
          _buildSlider(
            label: 'XW',
            value: _controller.params.rot4dXW,
            onChanged: (v) => setState(() => _controller.params.rot4dXW = v),
          ),
          _buildSlider(
            label: 'YW',
            value: _controller.params.rot4dYW,
            onChanged: (v) => setState(() => _controller.params.rot4dYW = v),
          ),
           _buildSlider(
            label: 'ZW',
            value: _controller.params.rot4dZW,
            onChanged: (v) => setState(() => _controller.params.rot4dZW = v),
          ),
        ],
      ),
    );
  }

  Widget _buildSlider({
    required String label,
    required double value,
    required ValueChanged<double> onChanged,
  }) {
    return Row(
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 12),
        ),
        Expanded(
          child: Slider(
            value: value,
            min: 0,
            max: 6.28,
            activeColor: const Color(0xFF00FF88),
            inactiveColor: Colors.white24,
            onChanged: (v) {
              onChanged(v);
              _controller.setRotation(); // Trigger update
            },
          ),
        ),
      ],
    );
  }
}
