import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'models/vib3_params.dart';
import 'services/audio_service.dart';
import 'services/preferences_service.dart';
import 'screens/visualizer_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const VIB3App());
}

class VIB3App extends StatelessWidget {
  const VIB3App({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => Vib3State()),
        Provider(create: (_) => AudioService()),
      ],
      child: MaterialApp(
        title: 'VIB3+ Visualizer',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          brightness: Brightness.dark,
          colorSchemeSeed: const Color(0xFFA855F7),
          useMaterial3: true,
          scaffoldBackgroundColor: Colors.black,
        ),
        home: const VisualizerScreen(),
      ),
    );
  }
}

/// Application state — wraps Vib3Params + UI state + audio control.
/// ChangeNotifier for Provider-based state management (lightweight, no Bloc/Riverpod).
class Vib3State extends ChangeNotifier {
  Vib3Params _params = Vib3Params();
  bool _audioEnabled = true;
  bool _autoRotate = true;
  bool _showHud = true;
  bool _initialized = false;
  Timer? _saveDebounce;

  final PreferencesService _prefs = PreferencesService();

  Vib3Params get params => _params;
  bool get audioEnabled => _audioEnabled;
  bool get autoRotate => _autoRotate;
  bool get showHud => _showHud;
  bool get initialized => _initialized;

  Vib3State() {
    _init();
  }

  Future<void> _init() async {
    await _prefs.init();
    _params = _prefs.loadParams();
    _audioEnabled = _prefs.audioEnabled;
    _autoRotate = _prefs.autoRotate;
    _showHud = _prefs.showHud;
    _initialized = true;
    notifyListeners();
  }

  void updateParam(String name, dynamic value) {
    switch (name) {
      case 'system':
        _params = _params.copyWith(system: value as Vib3System);
      case 'geometry':
        _params = _params.copyWith(geometry: value as int);
      case 'rot4dXY':
        _params = _params.copyWith(rot4dXY: (value as num).toDouble());
      case 'rot4dXZ':
        _params = _params.copyWith(rot4dXZ: (value as num).toDouble());
      case 'rot4dYZ':
        _params = _params.copyWith(rot4dYZ: (value as num).toDouble());
      case 'rot4dXW':
        _params = _params.copyWith(rot4dXW: (value as num).toDouble());
      case 'rot4dYW':
        _params = _params.copyWith(rot4dYW: (value as num).toDouble());
      case 'rot4dZW':
        _params = _params.copyWith(rot4dZW: (value as num).toDouble());
      case 'gridDensity':
        _params = _params.copyWith(gridDensity: (value as num).toDouble());
      case 'morphFactor':
        _params = _params.copyWith(morphFactor: (value as num).toDouble());
      case 'chaos':
        _params = _params.copyWith(chaos: (value as num).toDouble());
      case 'speed':
        _params = _params.copyWith(speed: (value as num).toDouble());
      case 'hue':
        _params = _params.copyWith(hue: (value as num).toDouble());
      case 'saturation':
        _params = _params.copyWith(saturation: (value as num).toDouble());
      case 'intensity':
        _params = _params.copyWith(intensity: (value as num).toDouble());
      case 'dimension':
        _params = _params.copyWith(dimension: (value as num).toDouble());
    }
    notifyListeners();
    _debounceSave();
  }

  void setSystem(Vib3System system) {
    _params = _params.copyWith(system: system);
    notifyListeners();
    _debounceSave();
  }

  void setGeometry(BaseGeometry base, CoreWarp warp) {
    _params.setGeometry(base, warp);
    _params = _params.copyWith(geometry: _params.geometry);
    notifyListeners();
    _debounceSave();
  }

  void setGeometryIndex(int index) {
    _params = _params.copyWith(geometry: index.clamp(0, 23));
    notifyListeners();
    _debounceSave();
  }

  void randomize() {
    final r = Random();
    _params = _params.copyWith(
      geometry: r.nextInt(24),
      rot4dXY: r.nextDouble() * 2 * pi,
      rot4dXZ: r.nextDouble() * 2 * pi,
      rot4dYZ: r.nextDouble() * 2 * pi,
      rot4dXW: r.nextDouble() * 2 * pi,
      rot4dYW: r.nextDouble() * 2 * pi,
      rot4dZW: r.nextDouble() * 2 * pi,
      gridDensity: 4.0 + r.nextDouble() * 96,
      morphFactor: r.nextDouble() * 2,
      chaos: r.nextDouble(),
      speed: 0.1 + r.nextDouble() * 2.9,
      hue: r.nextDouble() * 360,
      saturation: 0.3 + r.nextDouble() * 0.7,
      intensity: 0.2 + r.nextDouble() * 0.8,
      dimension: 3.0 + r.nextDouble() * 1.5,
    );
    notifyListeners();
    _debounceSave();
  }

  void reset() {
    _params = Vib3Params();
    notifyListeners();
    _debounceSave();
  }

  void setAudioEnabled(bool v) {
    _audioEnabled = v;
    _prefs.setAudioEnabled(v);
    notifyListeners();
  }

  void setAutoRotate(bool v) {
    _autoRotate = v;
    _prefs.setAutoRotate(v);
    notifyListeners();
  }

  void setShowHud(bool v) {
    _showHud = v;
    _prefs.setShowHud(v);
    notifyListeners();
  }

  void _debounceSave() {
    _saveDebounce?.cancel();
    _saveDebounce = Timer(const Duration(seconds: 2), () {
      _prefs.saveParams(_params);
    });
  }

  @override
  void dispose() {
    _saveDebounce?.cancel();
    super.dispose();
  }
}
