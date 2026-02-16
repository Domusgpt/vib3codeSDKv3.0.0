import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:vib3_flutter_viz/services/audio_service.dart';
import 'package:vib3_flutter_viz/services/preferences_service.dart';
import 'package:vib3_flutter_viz/screens/visualizer_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize services
  final prefs = PreferencesService();
  await prefs.init();

  final audio = AudioService();
  // Don't await init() here, let the UI handle permissions and startup

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: prefs),
        Provider<AudioService>.value(value: audio),
      ],
      child: const Vib3App(),
    ),
  );
}

class Vib3App extends StatelessWidget {
  const Vib3App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VIB3+ Visualizer',
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6D28D9),
          brightness: Brightness.dark,
          background: const Color(0xFF0F1115),
          surface: const Color(0xFF161920),
        ),
        fontFamily: 'Inter',
        scaffoldBackgroundColor: const Color(0xFF0F1115),
      ),
      home: const VisualizerScreen(),
    );
  }
}
