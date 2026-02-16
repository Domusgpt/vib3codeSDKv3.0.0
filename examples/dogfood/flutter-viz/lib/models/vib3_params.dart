/// VIB3+ parameter models for the Flutter visualization app.
///
/// These mirror the SDK's parameter definitions from src/core/Parameters.js
/// and the uniform interface used by synesthesia.html.
library;

import 'dart:convert';

/// The three VIB3+ visualization systems.
enum Vib3System {
  faceted(0, 'Faceted', 'Clean geometric patterns'),
  quantum(1, 'Quantum', 'Dense lattice structures'),
  holographic(2, 'Holographic', 'Layered atmospheric');

  const Vib3System(this.index, this.label, this.description);

  final int index;
  final String label;
  final String description;

  static Vib3System fromIndex(int i) =>
      Vib3System.values.firstWhere((s) => s.index == i, orElse: () => faceted);
}

/// The 8 base geometry types.
enum BaseGeometry {
  tetrahedron(0, 'Tetrahedron'),
  hypercube(1, 'Hypercube'),
  sphere(2, 'Sphere'),
  torus(3, 'Torus'),
  kleinBottle(4, 'Klein Bottle'),
  fractal(5, 'Fractal'),
  wave(6, 'Wave'),
  crystal(7, 'Crystal');

  const BaseGeometry(this.index, this.label);

  final int index;
  final String label;

  static BaseGeometry fromIndex(int i) =>
      BaseGeometry.values.firstWhere((g) => g.index == i, orElse: () => hypercube);
}

/// The 3 core warp types.
enum CoreWarp {
  base(0, 'Base', 'No warp'),
  hypersphere(1, 'Hypersphere', 'S3 projection'),
  hypertetrahedron(2, 'Hypertetra', 'Pentatope warp');

  const CoreWarp(this.index, this.label, this.description);

  final int index;
  final String label;
  final String description;

  static CoreWarp fromIndex(int i) =>
      CoreWarp.values.firstWhere((w) => w.index == i, orElse: () => base);
}

/// All visualization parameters sent to the WebView shader.
///
/// Ranges match CLAUDE.md "Parameter Ranges" table:
///   geometry:    0-23
///   rot4d*:      0-2pi
///   gridDensity: 4-100
///   morphFactor: 0-2
///   chaos:       0-1
///   speed:       0.1-3
///   hue:         0-360
///   saturation:  0-1
///   intensity:   0-1
///   dimension:   3.0-4.5
class Vib3Params {
  Vib3System system;
  int geometry; // 0-23 (coreType * 8 + baseGeometry)

  // 6D rotation (radians, 0-2*pi)
  double rot4dXY;
  double rot4dXZ;
  double rot4dYZ;
  double rot4dXW;
  double rot4dYW;
  double rot4dZW;

  // Visual parameters
  double gridDensity; // 4-100
  double morphFactor; // 0-2
  double chaos; // 0-1
  double speed; // 0.1-3
  double hue; // 0-360
  double saturation; // 0-1
  double intensity; // 0-1
  double dimension; // 3.0-4.5

  Vib3Params({
    this.system = Vib3System.faceted,
    this.geometry = 1,
    this.rot4dXY = 0.0,
    this.rot4dXZ = 0.0,
    this.rot4dYZ = 0.0,
    this.rot4dXW = 0.0,
    this.rot4dYW = 0.0,
    this.rot4dZW = 0.0,
    this.gridDensity = 20.0,
    this.morphFactor = 0.3,
    this.chaos = 0.05,
    this.speed = 0.5,
    this.hue = 270.0,
    this.saturation = 0.7,
    this.intensity = 0.4,
    this.dimension = 3.2,
  });

  /// Decode base geometry from the combined index.
  BaseGeometry get baseGeometry => BaseGeometry.fromIndex(geometry % 8);

  /// Decode core warp from the combined index.
  CoreWarp get coreWarp => CoreWarp.fromIndex(geometry ~/ 8);

  /// Set geometry from base + core warp.
  void setGeometry(BaseGeometry base, CoreWarp warp) {
    geometry = warp.index * 8 + base.index;
  }

  /// Serialize to JSON for the WebView JavaScript bridge.
  String toJson() {
    return jsonEncode({
      'system': system.index,
      'geometry': geometry,
      'rot4dXY': rot4dXY,
      'rot4dXZ': rot4dXZ,
      'rot4dYZ': rot4dYZ,
      'rot4dXW': rot4dXW,
      'rot4dYW': rot4dYW,
      'rot4dZW': rot4dZW,
      'gridDensity': gridDensity,
      'morphFactor': morphFactor,
      'chaos': chaos,
      'speed': speed,
      'hue': hue,
      'saturation': saturation,
      'intensity': intensity,
      'dimension': dimension,
    });
  }

  /// Create from persisted map.
  factory Vib3Params.fromMap(Map<String, dynamic> m) {
    return Vib3Params(
      system: Vib3System.fromIndex(m['system'] as int? ?? 0),
      geometry: m['geometry'] as int? ?? 1,
      rot4dXY: (m['rot4dXY'] as num?)?.toDouble() ?? 0.0,
      rot4dXZ: (m['rot4dXZ'] as num?)?.toDouble() ?? 0.0,
      rot4dYZ: (m['rot4dYZ'] as num?)?.toDouble() ?? 0.0,
      rot4dXW: (m['rot4dXW'] as num?)?.toDouble() ?? 0.0,
      rot4dYW: (m['rot4dYW'] as num?)?.toDouble() ?? 0.0,
      rot4dZW: (m['rot4dZW'] as num?)?.toDouble() ?? 0.0,
      gridDensity: (m['gridDensity'] as num?)?.toDouble() ?? 20.0,
      morphFactor: (m['morphFactor'] as num?)?.toDouble() ?? 0.3,
      chaos: (m['chaos'] as num?)?.toDouble() ?? 0.05,
      speed: (m['speed'] as num?)?.toDouble() ?? 0.5,
      hue: (m['hue'] as num?)?.toDouble() ?? 270.0,
      saturation: (m['saturation'] as num?)?.toDouble() ?? 0.7,
      intensity: (m['intensity'] as num?)?.toDouble() ?? 0.4,
      dimension: (m['dimension'] as num?)?.toDouble() ?? 3.2,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'system': system.index,
      'geometry': geometry,
      'rot4dXY': rot4dXY,
      'rot4dXZ': rot4dXZ,
      'rot4dYZ': rot4dYZ,
      'rot4dXW': rot4dXW,
      'rot4dYW': rot4dYW,
      'rot4dZW': rot4dZW,
      'gridDensity': gridDensity,
      'morphFactor': morphFactor,
      'chaos': chaos,
      'speed': speed,
      'hue': hue,
      'saturation': saturation,
      'intensity': intensity,
      'dimension': dimension,
    };
  }

  Vib3Params copyWith({
    Vib3System? system,
    int? geometry,
    double? rot4dXY,
    double? rot4dXZ,
    double? rot4dYZ,
    double? rot4dXW,
    double? rot4dYW,
    double? rot4dZW,
    double? gridDensity,
    double? morphFactor,
    double? chaos,
    double? speed,
    double? hue,
    double? saturation,
    double? intensity,
    double? dimension,
  }) {
    return Vib3Params(
      system: system ?? this.system,
      geometry: geometry ?? this.geometry,
      rot4dXY: rot4dXY ?? this.rot4dXY,
      rot4dXZ: rot4dXZ ?? this.rot4dXZ,
      rot4dYZ: rot4dYZ ?? this.rot4dYZ,
      rot4dXW: rot4dXW ?? this.rot4dXW,
      rot4dYW: rot4dYW ?? this.rot4dYW,
      rot4dZW: rot4dZW ?? this.rot4dZW,
      gridDensity: gridDensity ?? this.gridDensity,
      morphFactor: morphFactor ?? this.morphFactor,
      chaos: chaos ?? this.chaos,
      speed: speed ?? this.speed,
      hue: hue ?? this.hue,
      saturation: saturation ?? this.saturation,
      intensity: intensity ?? this.intensity,
      dimension: dimension ?? this.dimension,
    );
  }
}

/// Audio analysis data sent from the Dart FFT pipeline to the WebView.
class AudioData {
  final List<double> bands; // 8 frequency bands, 0-1
  double bass; // bands[1]
  double mid; // bands[3]
  double high; // bands[6]
  double spectralFlux;
  bool onset;

  AudioData({
    List<double>? bands,
    this.bass = 0.0,
    this.mid = 0.0,
    this.high = 0.0,
    this.spectralFlux = 0.0,
    this.onset = false,
  }) : bands = bands ?? List.filled(8, 0.0);

  /// Serialize for the WebView bridge.
  String toJson() {
    return jsonEncode({
      'bands': bands,
      'bass': bass,
      'mid': mid,
      'high': high,
      'spectralFlux': spectralFlux,
      'onset': onset,
    });
  }
}

/// A saved preset combining system + geometry + visual params.
class Vib3Preset {
  final String name;
  final Vib3Params params;
  final DateTime createdAt;

  Vib3Preset({
    required this.name,
    required this.params,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'params': params.toMap(),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory Vib3Preset.fromMap(Map<String, dynamic> m) {
    return Vib3Preset(
      name: m['name'] as String,
      params: Vib3Params.fromMap(m['params'] as Map<String, dynamic>),
      createdAt: DateTime.parse(m['createdAt'] as String),
    );
  }
}
