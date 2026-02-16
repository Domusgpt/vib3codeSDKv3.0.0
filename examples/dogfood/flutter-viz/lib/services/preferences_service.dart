/// Persistent preferences service for VIB3+ Flutter app.
///
/// Stores user settings (last system, geometry, visual params, presets)
/// via SharedPreferences.
library;

import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/vib3_params.dart';

class PreferencesService {
  static const _keyParams = 'vib3_params';
  static const _keyPresets = 'vib3_presets';
  static const _keyAudioEnabled = 'vib3_audio_enabled';
  static const _keyAutoRotate = 'vib3_auto_rotate';
  static const _keyShowHud = 'vib3_show_hud';

  SharedPreferences? _prefs;

  /// Initialize SharedPreferences. Call once at app startup.
  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  SharedPreferences get _p {
    if (_prefs == null) {
      throw StateError(
          'PreferencesService.init() must be called before accessing preferences');
    }
    return _prefs!;
  }

  // ── Parameter persistence ──

  /// Save current visualization parameters.
  Future<void> saveParams(Vib3Params params) async {
    await _p.setString(_keyParams, jsonEncode(params.toMap()));
  }

  /// Load saved visualization parameters, or return defaults.
  Vib3Params loadParams() {
    final raw = _p.getString(_keyParams);
    if (raw == null) return Vib3Params();
    try {
      return Vib3Params.fromMap(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return Vib3Params();
    }
  }

  // ── Preset persistence ──

  /// Save a named preset.
  Future<void> savePreset(Vib3Preset preset) async {
    final presets = loadPresets();
    // Replace if name exists, otherwise add
    final idx = presets.indexWhere((p) => p.name == preset.name);
    if (idx >= 0) {
      presets[idx] = preset;
    } else {
      presets.add(preset);
    }
    await _savePresetList(presets);
  }

  /// Delete a preset by name.
  Future<void> deletePreset(String name) async {
    final presets = loadPresets();
    presets.removeWhere((p) => p.name == name);
    await _savePresetList(presets);
  }

  /// Load all saved presets.
  List<Vib3Preset> loadPresets() {
    final raw = _p.getString(_keyPresets);
    if (raw == null) return [];
    try {
      final list = jsonDecode(raw) as List;
      return list
          .map((e) => Vib3Preset.fromMap(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> _savePresetList(List<Vib3Preset> presets) async {
    await _p.setString(
        _keyPresets, jsonEncode(presets.map((p) => p.toMap()).toList()));
  }

  // ── App settings ──

  bool get audioEnabled => _p.getBool(_keyAudioEnabled) ?? true;
  Future<void> setAudioEnabled(bool v) => _p.setBool(_keyAudioEnabled, v);

  bool get autoRotate => _p.getBool(_keyAutoRotate) ?? true;
  Future<void> setAutoRotate(bool v) => _p.setBool(_keyAutoRotate, v);

  bool get showHud => _p.getBool(_keyShowHud) ?? true;
  Future<void> setShowHud(bool v) => _p.setBool(_keyShowHud, v);
}
