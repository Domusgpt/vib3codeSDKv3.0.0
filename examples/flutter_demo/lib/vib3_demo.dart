/// VIB3+ Demo Screen
///
/// Complete demonstration of VIB3+ visualization with:
/// - Hybrid Rendering Architecture: Switch between Native Dart and WebGL Core
/// - Full-screen WebView integration of VIB3+ Engine (Ultra Tier)
/// - Native CustomPaint implementation (Dart Preview)
/// - Native UI controls for parameter manipulation

import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
// Import for Android-specific features if needed
// import 'package:webview_flutter_android/webview_flutter_android.dart';
// Import for iOS-specific features if needed
// import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';
import 'vib3_controller.dart';

enum RendererMode { webView, nativeDart }

class Vib3DemoScreen extends StatefulWidget {
  const Vib3DemoScreen({super.key});

  @override
  State<Vib3DemoScreen> createState() => _Vib3DemoScreenState();
}

class _Vib3DemoScreenState extends State<Vib3DemoScreen> with TickerProviderStateMixin {
  // WebView State
  late final WebViewController _webViewController;
  bool _isWebViewReady = false;
  String _currentDemo = 'index.html';

  // Native State
  late final AnimationController _bgAnimController;
  late final AnimationController _pulseController;

  // Shared State
  late final Vib3Controller _controller;
  RendererMode _rendererMode = RendererMode.webView;
  bool _showControls = true;

  @override
  void initState() {
    super.initState();
    _controller = Vib3Controller();

    // --- WebView Init ---
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (String url) {
            setState(() => _isWebViewReady = true);
            _updateWebViewParameters();
          },
        ),
      )
      ..addJavaScriptChannel(
        'Vib3Bridge',
        onMessageReceived: (JavaScriptMessage message) {
          debugPrint('Message from VIB3: ${message.message}');
        },
      );
    _loadAsset(_currentDemo);

    // --- Native Init ---
    _bgAnimController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    // --- Listeners ---
    _controller.addListener(_onControllerChanged);
  }

  @override
  void dispose() {
    _controller.removeListener(_onControllerChanged);
    _controller.dispose();
    _bgAnimController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  void _loadAsset(String filename) {
    String path;
    if (filename == 'index.html') {
      path = 'assets/vib3/index.html';
    } else {
      path = 'assets/vib3/examples/dogfood/$filename';
    }
    _webViewController.loadFlutterAsset(path);
  }

  void _onControllerChanged(Vib3Params params) {
    if (_rendererMode == RendererMode.webView && _isWebViewReady) {
      _updateWebViewParameters();
    } else if (_rendererMode == RendererMode.nativeDart) {
      setState(() {}); // Trigger rebuild for CustomPaint
    }
  }

  void _updateWebViewParameters() {
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
    _webViewController.runJavaScript(jsCode).catchError((_) {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. Renderer Layer
          if (_rendererMode == RendererMode.webView)
            _buildWebViewRenderer()
          else
            _buildNativeRenderer(),

          // 2. UI Overlay
          if (_showControls)
            SafeArea(
              child: Column(
                children: [
                  _buildHeader(),
                  const Spacer(),
                  if (_rendererMode == RendererMode.webView) _buildDemoSelector(),
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

  // --- Renderers ---

  Widget _buildWebViewRenderer() {
    return Stack(
      children: [
        WebViewWidget(controller: _webViewController),
        if (!_isWebViewReady)
          const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88))),
      ],
    );
  }

  Widget _buildNativeRenderer() {
    return AnimatedBuilder(
      animation: _bgAnimController,
      builder: (context, child) {
        // Native background effect
        final hue = (_bgAnimController.value * 360 + _controller.params.hue) % 360;
        return Stack(
          children: [
            Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.center,
                  radius: 1.5,
                  colors: [
                    HSLColor.fromAHSL(1.0, hue, 0.8, 0.15).toColor(),
                    HSLColor.fromAHSL(1.0, (hue + 60) % 360, 0.6, 0.05).toColor(),
                    Colors.black,
                  ],
                ),
              ),
            ),
            Center(
              child: CustomPaint(
                size: const Size(300, 300),
                painter: _GeometryPainter(
                  geometry: _controller.params.geometry,
                  rotation: _bgAnimController.value * math.pi * 2,
                  hue: _controller.params.hue,
                  rot4dXW: _controller.params.rot4dXW,
                  rot4dYW: _controller.params.rot4dYW,
                  rot4dZW: _controller.params.rot4dZW,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  // --- UI Components ---

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
          // Renderer Toggle
          DropdownButtonHideUnderline(
            child: DropdownButton<RendererMode>(
              value: _rendererMode,
              dropdownColor: Colors.black87,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Colors.purpleAccent,
              ),
              items: const [
                DropdownMenuItem(
                  value: RendererMode.webView,
                  child: Text('WEB ENGINE (ULTRA)'),
                ),
                DropdownMenuItem(
                  value: RendererMode.nativeDart,
                  child: Text('NATIVE DART (PREVIEW)'),
                ),
              ],
              onChanged: (mode) {
                if (mode != null) setState(() => _rendererMode = mode);
              },
            ),
          ),
          const Spacer(),
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: (_rendererMode == RendererMode.nativeDart || _isWebViewReady)
                  ? Colors.green
                  : Colors.red,
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
            DropdownMenuItem(value: 'crystal_labyrinth.html', child: Text('Crystal Labyrinth')),
            DropdownMenuItem(value: 'ultra_universe.html', child: Text('Ultra Universe')),
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
          Text(
            _rendererMode == RendererMode.webView ? '4D Rotation (JS Bridge)' : '4D Rotation (Native)',
            style: const TextStyle(color: Colors.white70, fontSize: 12),
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
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
        Expanded(
          child: Slider(
            value: value,
            min: 0,
            max: 6.28,
            activeColor: const Color(0xFF00FF88),
            inactiveColor: Colors.white24,
            onChanged: (v) {
              onChanged(v);
              _controller.setRotation();
            },
          ),
        ),
      ],
    );
  }
}

// --- Native Painter Logic (Restored) ---

class _GeometryPainter extends CustomPainter {
  final int geometry;
  final double rotation;
  final double hue;
  final double rot4dXW;
  final double rot4dYW;
  final double rot4dZW;

  _GeometryPainter({
    required this.geometry,
    required this.rotation,
    required this.hue,
    required this.rot4dXW,
    required this.rot4dYW,
    required this.rot4dZW,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final baseIndex = geometry % 8;

    final color = HSLColor.fromAHSL(1.0, hue, 0.8, 0.5).toColor();
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    final fillPaint = Paint()
      ..color = color.withOpacity(0.1)
      ..style = PaintingStyle.fill;

    // Apply 4D rotation impact on scale/w-depth
    final w4d = 1.0 + math.sin(rot4dXW) * 0.2 + math.cos(rot4dYW) * 0.15;
    final radius = 80.0 * w4d;

    canvas.save();
    canvas.translate(center.dx, center.dy);
    canvas.rotate(rotation + rot4dZW);

    // Simplified Native Render
    switch (baseIndex) {
      case 0: _drawPoly(canvas, 3, radius, paint, fillPaint); break;
      case 1: _drawHypercube(canvas, radius, paint, fillPaint, rot4dXW); break;
      case 2: canvas.drawCircle(Offset.zero, radius, paint); break;
      default: _drawPoly(canvas, baseIndex + 2, radius, paint, fillPaint); break;
    }

    canvas.restore();
  }

  void _drawPoly(Canvas canvas, int sides, double r, Paint paint, Paint fill) {
    final path = Path();
    for (int i = 0; i < sides; i++) {
      final angle = i * math.pi * 2 / sides - math.pi / 2;
      final x = math.cos(angle) * r;
      final y = math.sin(angle) * r;
      if (i == 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
    path.close();
    canvas.drawPath(path, fill);
    canvas.drawPath(path, paint);
  }

  void _drawHypercube(Canvas canvas, double r, Paint paint, Paint fill, double w) {
    final inner = r * 0.5;
    canvas.drawRect(Rect.fromCenter(center: Offset.zero, width: r * 2, height: r * 2), paint);

    canvas.save();
    canvas.rotate(w * 0.5);
    canvas.drawRect(Rect.fromCenter(center: Offset.zero, width: inner * 2, height: inner * 2), paint);
    canvas.restore();

    for (int i = 0; i < 4; i++) {
      final outerAngle = i * math.pi / 2 + math.pi / 4;
      final innerAngle = outerAngle + w * 0.5;
      canvas.drawLine(
        Offset(math.cos(outerAngle) * r * 1.414, math.sin(outerAngle) * r * 1.414),
        Offset(math.cos(innerAngle) * inner * 1.414, math.sin(innerAngle) * inner * 1.414),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _GeometryPainter oldDelegate) => true;
}
