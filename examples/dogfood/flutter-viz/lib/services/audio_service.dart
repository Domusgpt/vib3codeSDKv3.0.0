/// Audio capture and FFT analysis service for VIB3+ Flutter app.
///
/// Uses the `record` package to capture microphone audio, then performs
/// a simplified FFT decomposition into 8 frequency bands matching the
/// synesthesia.html pipeline.
///
/// Band ranges (for 44100 Hz sample rate, 2048-point FFT):
///   Band 0: bins 1-3     (21-65 Hz)   Sub-bass
///   Band 1: bins 3-9     (65-194 Hz)  Bass
///   Band 2: bins 9-23    (194-496 Hz) Low-mid
///   Band 3: bins 23-56   (496-1.2kHz) Mid
///   Band 4: bins 56-139  (1.2-3kHz)   Upper-mid
///   Band 5: bins 139-279 (3-6kHz)     Presence
///   Band 6: bins 279-558 (6-12kHz)    Brilliance
///   Band 7: bins 558-930 (12-20kHz)   Air
library;

import 'dart:async';
import 'dart:math';
import 'dart:typed_data';

import 'package:record/record.dart';
import 'package:permission_handler/permission_handler.dart';

import '../models/vib3_params.dart';

/// 8-band frequency ranges as FFT bin indices (44100 Hz, 2048 bins).
const List<List<int>> kBandRanges = [
  [1, 3],
  [3, 9],
  [9, 23],
  [23, 56],
  [56, 139],
  [139, 279],
  [279, 558],
  [558, 930],
];

class AudioService {
  final AudioRecorder _recorder = AudioRecorder();

  bool _isCapturing = false;
  bool _hasPermission = false;

  /// Smoothed 8-band energy values (0-1).
  final Float64List _bands = Float64List(8);

  /// Previous frame frequency data for spectral flux.
  Float64List? _prevBands;

  double _spectralFlux = 0.0;
  double _spectralFluxAvg = 0.0;
  int _onsetCount = 0;
  bool _lastOnset = false;

  /// Stream controller for audio data updates (~30 Hz).
  final _controller = StreamController<AudioData>.broadcast();

  /// Timer for synthetic audio when mic is unavailable.
  Timer? _syntheticTimer;

  /// Whether we are running in synthetic (demo) mode.
  bool _syntheticMode = false;

  // ── Public API ──

  bool get isCapturing => _isCapturing;
  bool get isSynthetic => _syntheticMode;
  Stream<AudioData> get stream => _controller.stream;

  /// Request microphone permission. Returns true if granted.
  Future<bool> requestPermission() async {
    final status = await Permission.microphone.request();
    _hasPermission = status.isGranted;
    return _hasPermission;
  }

  /// Start audio capture. Falls back to synthetic mode if mic unavailable.
  Future<void> start() async {
    if (_isCapturing) return;

    if (!_hasPermission) {
      await requestPermission();
    }

    if (_hasPermission) {
      try {
        // Check if recording is supported
        final canRecord = await _recorder.hasPermission();
        if (canRecord) {
          // Start recording to stream (PCM)
          final stream = await _recorder.startStream(
            const RecordConfig(
              encoder: AudioEncoder.pcm16bits,
              sampleRate: 44100,
              numChannels: 1,
              autoGain: true,
              echoCancel: true,
              noiseSuppress: true,
            ),
          );

          _isCapturing = true;
          _syntheticMode = false;

          // Process audio stream
          stream.listen(
            _processAudioChunk,
            onError: (e) {
              // Fall back to synthetic on error
              _startSynthetic();
            },
            onDone: () {
              if (_isCapturing) _startSynthetic();
            },
          );
          return;
        }
      } catch (e) {
        // Fall through to synthetic
      }
    }

    // Fallback: synthetic audio
    _startSynthetic();
  }

  /// Stop audio capture.
  Future<void> stop() async {
    _isCapturing = false;
    _syntheticTimer?.cancel();
    _syntheticTimer = null;
    try {
      await _recorder.stop();
    } catch (_) {}
  }

  /// Dispose resources.
  void dispose() {
    stop();
    _controller.close();
    _recorder.dispose();
  }

  // ── Internal: Real audio processing ──

  void _processAudioChunk(List<int> data) {
    if (!_isCapturing) return;

    // Convert PCM16 bytes to float samples
    final byteData = Uint8List.fromList(data);
    final samples = Float64List(byteData.length ~/ 2);
    for (var i = 0; i < samples.length; i++) {
      final lo = byteData[i * 2];
      final hi = byteData[i * 2 + 1];
      var value = (hi << 8) | lo;
      if (value >= 0x8000) value -= 0x10000;
      samples[i] = value / 32768.0;
    }

    // Simple magnitude spectrum via DFT on first 1024 samples
    final n = min(1024, samples.length);
    final magnitudes = Float64List(n ~/ 2);

    for (var k = 0; k < magnitudes.length; k++) {
      double re = 0, im = 0;
      for (var i = 0; i < n; i++) {
        final angle = -2.0 * pi * k * i / n;
        re += samples[i] * cos(angle);
        im += samples[i] * sin(angle);
      }
      magnitudes[k] = sqrt(re * re + im * im) / n;
    }

    _updateBands(magnitudes);
  }

  void _updateBands(Float64List magnitudes) {
    final dt = 1.0 / 30.0; // ~30 Hz update rate

    for (var b = 0; b < 8; b++) {
      final lo = kBandRanges[b][0];
      final hi = min(kBandRanges[b][1], magnitudes.length);
      if (lo >= hi) continue;

      double sum = 0;
      for (var i = lo; i < hi; i++) {
        sum += magnitudes[i];
      }
      final raw = sum / (hi - lo);

      // EMA smoothing: alpha = 1 - exp(-dt/tc), tc ~ 0.1s
      final alpha = 1 - exp(-dt / 0.1);
      _bands[b] += (raw - _bands[b]) * alpha;
    }

    // Spectral flux for onset detection
    _prevBands ??= Float64List(8);
    double flux = 0;
    for (var i = 0; i < 8; i++) {
      final diff = _bands[i] - _prevBands![i];
      if (diff > 0) flux += diff;
      _prevBands![i] = _bands[i];
    }

    final fluxAlpha = 1 - exp(-dt / 0.3);
    _spectralFluxAvg += (flux - _spectralFluxAvg) * fluxAlpha;
    _spectralFlux = flux;

    _lastOnset = flux > _spectralFluxAvg * 3.0 && flux > 0.05;
    if (_lastOnset) _onsetCount++;

    _emitData();
  }

  // ── Internal: Synthetic audio ──

  void _startSynthetic() {
    _isCapturing = true;
    _syntheticMode = true;

    var t = 0.0;
    final rng = Random();

    _syntheticTimer = Timer.periodic(const Duration(milliseconds: 33), (_) {
      t += 0.033;

      // Generate slowly evolving synthetic band energies
      for (var b = 0; b < 8; b++) {
        final freq = 0.1 + b * 0.05;
        final target =
            (sin(t * freq * 2 * pi) * 0.5 + 0.5) * (0.3 + rng.nextDouble() * 0.2);
        final alpha = 1 - exp(-0.033 / 0.15);
        _bands[b] += (target - _bands[b]) * alpha;
      }

      // Synthetic onset every ~2s
      _lastOnset = rng.nextDouble() < 0.015;
      if (_lastOnset) _onsetCount++;

      _emitData();
    });
  }

  void _emitData() {
    if (_controller.isClosed) return;

    final data = AudioData(
      bands: List<double>.from(_bands),
      bass: _bands[1],
      mid: _bands[3],
      high: _bands[6],
      spectralFlux: _spectralFlux,
      onset: _lastOnset,
    );
    _controller.add(data);
  }
}
