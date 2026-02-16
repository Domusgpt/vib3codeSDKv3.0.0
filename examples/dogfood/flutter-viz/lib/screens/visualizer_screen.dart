import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:vib3_flutter_viz/services/audio_service.dart';
import 'package:vib3_flutter_viz/models/vib3_params.dart';
import 'package:vib3_flutter_viz/widgets/control_panel.dart';

class VisualizerScreen extends StatefulWidget {
  const VisualizerScreen({super.key});

  @override
  State<VisualizerScreen> createState() => _VisualizerScreenState();
}

class _VisualizerScreenState extends State<VisualizerScreen> {
  late final WebViewController _controller;
  bool _ready = false;

  @override
  void initState() {
    super.initState();

    // Initialize WebViewController
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (String url) {
            setState(() { _ready = true; });
            _initVib3();
          },
        ),
      )
      ..loadFlutterAsset('assets/vib3_visualization.html');

    // Listen to audio updates
    final audioService = context.read<AudioService>();
    audioService.stream.listen(_onAudioData);
    audioService.start(); // Auto-start capture
  }

  void _initVib3() {
    // Set initial params
    final params = Vib3Params(); // Defaults
    _updateParams(params);
  }

  void _onAudioData(AudioData data) {
    if (!_ready) return;

    // Efficiently call updateAudio JS function
    _controller.runJavaScript(
      'if(window.updateAudio) window.updateAudio(${data.bass}, ${data.mid}, ${data.high});'
    );

    // Onset trigger
    if (data.onset) {
       _controller.runJavaScript('if(window.setParam) window.setParam("chaos", 0.8);');
       // Reset chaos after a bit (simulated in JS usually, but here explicit)
       Future.delayed(const Duration(milliseconds: 100), () {
         _controller.runJavaScript('if(window.setParam) window.setParam("chaos", 0.1);');
       });
    }
  }

  void _updateParams(Vib3Params params) {
    if (!_ready) return;

    // Batch update
    _controller.runJavaScript('''
      if(window.setSystem) window.setSystem(${params.system.index});
      if(window.setGeometry) window.setGeometry(${params.geometry});
      if(window.setParam) {
        window.setParam("hue", ${params.hue});
        window.setParam("saturation", ${params.saturation});
        window.setParam("intensity", ${params.intensity});
        window.setParam("gridDensity", ${params.gridDensity});
        window.setParam("morphFactor", ${params.morphFactor});
        window.setParam("speed", ${params.speed});
      }
    ''');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // WebView Layer
          WebViewWidget(controller: _controller),

          // HUD Layer
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Bar
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Audio Meter
                      Consumer<AudioService>(
                        builder: (context, audio, _) => _AudioMeter(audio: audio),
                      ),
                      // Info Badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white24),
                        ),
                        child: const Text(
                          'VIB3+ LIVE',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Controls Toggle
          Positioned(
            bottom: 30,
            left: 0,
            right: 0,
            child: Center(
              child: GestureDetector(
                onTap: () {
                  showModalBottomSheet(
                    context: context,
                    backgroundColor: const Color(0xFF161920),
                    isScrollControlled: true,
                    builder: (context) => ControlPanel(
                      onParamChange: _updateParams,
                    ),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6D28D9).withOpacity(0.9),
                    borderRadius: BorderRadius.circular(30),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF6D28D9).withOpacity(0.4),
                        blurRadius: 20,
                        spreadRadius: 2,
                      )
                    ],
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.tune, color: Colors.white, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'CONTROLS',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AudioMeter extends StatelessWidget {
  final AudioService audio;

  const _AudioMeter({required this.audio});

  @override
  Widget build(BuildContext context) {
    // Stream builder for live updates
    return StreamBuilder<AudioData>(
      stream: audio.stream,
      builder: (context, snapshot) {
        final data = snapshot.data;
        return Row(
          children: [
            Icon(
              audio.isCapturing ? Icons.mic : Icons.mic_off,
              color: audio.isCapturing ? Colors.greenAccent : Colors.grey,
              size: 16,
            ),
            const SizedBox(width: 8),
            // Simple bar visualization
            if (data != null)
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: data.bands.map((val) {
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 1),
                    width: 4,
                    height: 10 + val * 20,
                    color: Colors.white.withOpacity(0.5 + val * 0.5),
                  );
                }).toList(),
              ),
          ],
        );
      },
    );
  }
}
