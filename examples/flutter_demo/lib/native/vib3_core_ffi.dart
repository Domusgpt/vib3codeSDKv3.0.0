/// VIB3+ Native Core Bindings (FFI)
///
/// Binds to the C++ core library via Dart FFI.
/// Mirrors the API defined in cpp/bindings/c_api.h

import 'dart:ffi';
import 'dart:io';
import 'package:ffi/ffi.dart';

// --- C Structs ---

final class Vib3Vec4 extends Struct {
  @Float()
  external double x;

  @Float()
  external double y;

  @Float()
  external double z;

  @Float()
  external double w;
}

final class Vib3Mat4x4 extends Struct {
  @Array(16)
  external Array<Float> data;
}

// --- C Function Signatures ---

// Vec4
typedef vib3_vec4_create_c = Vib3Vec4 Function(Float x, Float y, Float z, Float w);
typedef vib3_vec4_create_dart = Vib3Vec4 Function(double x, double y, double z, double w);

typedef vib3_vec4_add_c = Vib3Vec4 Function(Vib3Vec4 a, Vib3Vec4 b);
typedef vib3_vec4_add_dart = Vib3Vec4 Function(Vib3Vec4 a, Vib3Vec4 b);

// Mat4x4
typedef vib3_mat4x4_identity_c = Vib3Mat4x4 Function();
typedef vib3_mat4x4_identity_dart = Vib3Mat4x4 Function();

typedef vib3_mat4x4_multiply_vec4_c = Vib3Vec4 Function(Vib3Mat4x4 m, Vib3Vec4 v);
typedef vib3_mat4x4_multiply_vec4_dart = Vib3Vec4 Function(Vib3Mat4x4 m, Vib3Vec4 v);

typedef vib3_mat4x4_rotation_from_angles_c = Vib3Mat4x4 Function(
    Float xy, Float xz, Float yz, Float xw, Float yw, Float zw);
typedef vib3_mat4x4_rotation_from_angles_dart = Vib3Mat4x4 Function(
    double xy, double xz, double yz, double xw, double yw, double zw);

typedef vib3_project_stereographic_c = Vib3Vec4 Function(Vib3Vec4 v, Float dim);
typedef vib3_project_stereographic_dart = Vib3Vec4 Function(Vib3Vec4 v, double dim);

// --- Native Library Wrapper ---

class Vib3Core {
  static final DynamicLibrary _lib = _loadLibrary();

  static DynamicLibrary _loadLibrary() {
    if (Platform.isAndroid) {
      return DynamicLibrary.open('libvib3_core.so');
    }
    if (Platform.isIOS) {
      return DynamicLibrary.process();
    }
    if (Platform.isMacOS) {
      return DynamicLibrary.open('libvib3_core.dylib');
    }
    if (Platform.isWindows) {
      return DynamicLibrary.open('vib3_core.dll');
    }
    throw UnsupportedError('Unknown platform: ${Platform.operatingSystem}');
  }

  // --- Functions ---

  static final vib3_vec4_create_dart createVec4 =
      _lib.lookupFunction<vib3_vec4_create_c, vib3_vec4_create_dart>('vib3_vec4_create');

  static final vib3_mat4x4_identity_dart identity =
      _lib.lookupFunction<vib3_mat4x4_identity_c, vib3_mat4x4_identity_dart>('vib3_mat4x4_identity');

  static final vib3_mat4x4_multiply_vec4_dart transform =
      _lib.lookupFunction<vib3_mat4x4_multiply_vec4_c, vib3_mat4x4_multiply_vec4_dart>('vib3_mat4x4_multiply_vec4');

  static final vib3_mat4x4_rotation_from_angles_dart rotation =
      _lib.lookupFunction<vib3_mat4x4_rotation_from_angles_c, vib3_mat4x4_rotation_from_angles_dart>(
          'vib3_mat4x4_rotation_from_angles');

  static final vib3_project_stereographic_dart project =
      _lib.lookupFunction<vib3_project_stereographic_c, vib3_project_stereographic_dart>(
          'vib3_project_stereographic');
}
