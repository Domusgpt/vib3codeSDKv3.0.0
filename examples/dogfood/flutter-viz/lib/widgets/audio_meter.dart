import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../main.dart';
import '../models/vib3_params.dart';
import '../services/audio_service.dart';

/// 8-band vertical audio meter with onset indicator.
/// Matches synesthesia.html band layout: sub-bass → air.
class AudioMeter extends StatelessWidget {
  final AudioService audioService;

  const AudioMeter({super.key, required this.audioService});

  static const _bandLabels = ['Sub', 'Bass', 'Low', 'Mid', 'Hi-M', 'Pres', 'Bril', 'Air'];
  static const _bandColors = [
    Color(0xFF3B82F6), // sub-bass: blue
    Color(0xFF6366F1), // bass: indigo
    Color(0xFF8B5CF6), // low-mid: violet
    Color(0xFFA855F7), // mid: purple
    Color(0xFFD946EF), // upper-mid: fuchsia
    Color(0xFFEC4899), // presence: pink
    Color(0xFFF43F5E), // brilliance: rose
    Color(0xFFFB7185), // air: light rose
  ];

  @override
  Widget build(BuildContext context) {
    final state = context.watch<Vib3State>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Text(
                  'Audio',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.white.withValues(alpha: 0.7),
                  ),
                ),
                const SizedBox(width: 8),
                if (audioService.isSynthetic)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.amber.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'SYNTHETIC',
                      style: TextStyle(
                        fontSize: 9,
                        color: Colors.amber,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
              ],
            ),
            // Mic toggle
            GestureDetector(
              onTap: () {
                final enabled = !state.audioEnabled;
                state.setAudioEnabled(enabled);
                if (enabled) {
                  audioService.start();
                } else {
                  audioService.stop();
                }
              },
              child: Icon(
                state.audioEnabled ? Icons.mic : Icons.mic_off,
                size: 20,
                color: state.audioEnabled ? const Color(0xFF10B981) : Colors.white30,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),

        // 8-band meter
        StreamBuilder<AudioData>(
          stream: audioService.stream,
          builder: (context, snapshot) {
            final data = snapshot.data;
            final bands = data?.bands ?? List.filled(8, 0.0);
            final onset = data?.onset ?? false;

            return Container(
              height: 80,
              decoration: BoxDecoration(
                color: onset
                    ? Colors.white.withValues(alpha: 0.06)
                    : Colors.white.withValues(alpha: 0.03),
                borderRadius: BorderRadius.circular(10),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: List.generate(8, (i) {
                  final energy = (bands.length > i ? bands[i] : 0.0).clamp(0.0, 1.0);
                  final barHeight = 4.0 + energy * 56; // 4px min, 60px max

                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 50),
                            height: barHeight,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.bottomCenter,
                                end: Alignment.topCenter,
                                colors: [
                                  _bandColors[i].withValues(alpha: 0.4),
                                  _bandColors[i],
                                ],
                              ),
                              borderRadius: BorderRadius.circular(2),
                              boxShadow: energy > 0.6
                                  ? [BoxShadow(color: _bandColors[i].withValues(alpha: 0.4), blurRadius: 6)]
                                  : null,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _bandLabels[i],
                            style: TextStyle(
                              fontSize: 7,
                              color: Colors.white.withValues(alpha: 0.3),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ),
            );
          },
        ),
      ],
    );
  }
}
