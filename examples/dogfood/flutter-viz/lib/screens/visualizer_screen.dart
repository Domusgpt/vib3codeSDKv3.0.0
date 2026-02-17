import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../main.dart';
import '../models/vib3_params.dart';
import '../services/audio_service.dart';
import '../widgets/system_selector.dart';
import '../widgets/geometry_wheel.dart';
import '../widgets/audio_meter.dart';
import '../widgets/parameter_sliders.dart';

class VisualizerScreen extends StatefulWidget {
  const VisualizerScreen({super.key});

  @override
  State<VisualizerScreen> createState() => _VisualizerScreenState();
}

class _VisualizerScreenState extends State<VisualizerScreen> {
  late WebViewController _webController;
  bool _webViewReady = false;
  StreamSubscription<AudioData>? _audioSub;
  Vib3Params? _lastSentParams;

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  void _initWebView() {
    _webController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.black)
      ..addJavaScriptChannel(
        'VIB3Bridge',
        onMessageReceived: (msg) {
          try {
            final data = jsonDecode(msg.message);
            if (data['type'] == 'ready') {
              setState(() => _webViewReady = true);
              _sendParams();
              _startAudioBridge();
            }
          } catch (_) {}
        },
      )
      ..loadFlutterAsset('assets/vib3_visualization.html');
  }

  void _sendParams() {
    if (!_webViewReady) return;
    final state = context.read<Vib3State>();
    final p = state.params;

    // Only send if params changed
    if (_lastSentParams != null && _paramsEqual(_lastSentParams!, p)) return;
    _lastSentParams = p.copyWith();

    final json = jsonEncode(p.toJson());
    _webController.runJavaScript('VIB3.updateParams($json)');
  }

  bool _paramsEqual(Vib3Params a, Vib3Params b) {
    return a.system == b.system &&
        a.geometry == b.geometry &&
        a.hue == b.hue &&
        a.saturation == b.saturation &&
        a.intensity == b.intensity &&
        a.chaos == b.chaos &&
        a.speed == b.speed &&
        a.morphFactor == b.morphFactor &&
        a.gridDensity == b.gridDensity &&
        a.dimension == b.dimension &&
        a.rot4dXY == b.rot4dXY &&
        a.rot4dXZ == b.rot4dXZ &&
        a.rot4dYZ == b.rot4dYZ &&
        a.rot4dXW == b.rot4dXW &&
        a.rot4dYW == b.rot4dYW &&
        a.rot4dZW == b.rot4dZW;
  }

  void _startAudioBridge() {
    final state = context.read<Vib3State>();
    final audio = context.read<AudioService>();

    if (state.audioEnabled) {
      audio.start();
      _audioSub = audio.stream.listen((data) {
        if (!_webViewReady) return;
        final json = jsonEncode(data.toJson());
        _webController.runJavaScript('VIB3.updateAudio($json)');
      });
    }
  }

  @override
  void dispose() {
    _audioSub?.cancel();
    context.read<AudioService>().dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<Vib3State>(
        builder: (context, state, _) {
          // Send params to WebView when state changes
          if (_webViewReady) {
            WidgetsBinding.instance.addPostFrameCallback((_) => _sendParams());
          }

          return Stack(
            children: [
              // Layer 1: WebGL WebView (fills screen)
              Positioned.fill(
                child: WebViewWidget(controller: _webController),
              ),

              // Layer 2: HUD overlay (toggleable)
              if (state.showHud)
                Positioned(
                  top: MediaQuery.of(context).padding.top + 12,
                  left: 16,
                  right: 16,
                  child: _buildHud(state),
                ),

              // Layer 3: Bottom controls sheet
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: _buildControlSheet(state),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildHud(Vib3State state) {
    final p = state.params;
    final base = BaseGeometry.fromIndex(p.geometry % 8);
    final warp = CoreWarp.fromIndex(p.geometry ~/ 8);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // System label
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.black54,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            p.system.label.toUpperCase(),
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: _systemColor(p.system),
              letterSpacing: 1.5,
            ),
          ),
        ),
        // Geometry label
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.black54,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            '${warp.index > 0 ? "${warp.label} " : ""}${base.label}  [${p.geometry}]',
            style: const TextStyle(fontSize: 14, color: Colors.white70),
          ),
        ),
      ],
    );
  }

  Widget _buildControlSheet(Vib3State state) {
    return DraggableScrollableSheet(
      initialChildSize: 0.08,
      minChildSize: 0.08,
      maxChildSize: 0.75,
      snap: true,
      snapSizes: const [0.08, 0.4, 0.75],
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.92),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            border: Border(
              top: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
            ),
          ),
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: [
              // Drag handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // System selector
              const SystemSelector(),
              const SizedBox(height: 16),

              // Geometry wheel
              const GeometryWheel(),
              const SizedBox(height: 16),

              // Audio meter
              AudioMeter(audioService: context.read<AudioService>()),
              const SizedBox(height: 16),

              // Parameter sliders
              const ParameterSliders(),
              const SizedBox(height: 32),
            ],
          ),
        );
      },
    );
  }

  Color _systemColor(Vib3System system) {
    switch (system) {
      case Vib3System.faceted:
        return const Color(0xFF3B82F6);
      case Vib3System.quantum:
        return const Color(0xFFA855F7);
      case Vib3System.holographic:
        return const Color(0xFF10B981);
    }
  }
}
