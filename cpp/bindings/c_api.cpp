#include "c_api.h"
#include "../math/Vec4.hpp"
#include "../math/Mat4x4.hpp"
#include "../math/Projection.hpp"

using namespace vib3;

// --- Conversion Helpers ---
inline Vec4 toCpp(const Vib3Vec4& v) {
    return Vec4(v.x, v.y, v.z, v.w);
}

inline Vib3Vec4 toC(const Vec4& v) {
    return {v.x, v.y, v.z, v.w};
}

inline Mat4x4 toCpp(const Vib3Mat4x4& m) {
    Mat4x4 out;
    std::copy(std::begin(m.data), std::end(m.data), out.data.begin());
    return out;
}

inline Vib3Mat4x4 toC(const Mat4x4& m) {
    Vib3Mat4x4 out;
    std::copy(m.data.begin(), m.data.end(), std::begin(out.data));
    return out;
}

// --- Implementation ---

extern "C" {

// Vec4
VIB3_API Vib3Vec4 vib3_vec4_create(float x, float y, float z, float w) {
    return {x, y, z, w};
}

VIB3_API Vib3Vec4 vib3_vec4_add(Vib3Vec4 a, Vib3Vec4 b) {
    return toC(toCpp(a) + toCpp(b));
}

VIB3_API Vib3Vec4 vib3_vec4_scale(Vib3Vec4 v, float s) {
    return toC(toCpp(v) * s);
}

VIB3_API float vib3_vec4_length(Vib3Vec4 v) {
    return toCpp(v).length();
}

// Mat4x4
VIB3_API Vib3Mat4x4 vib3_mat4x4_identity() {
    return toC(Mat4x4::identity());
}

VIB3_API Vib3Mat4x4 vib3_mat4x4_multiply(Vib3Mat4x4 a, Vib3Mat4x4 b) {
    return toC(toCpp(a) * toCpp(b));
}

VIB3_API Vib3Vec4 vib3_mat4x4_multiply_vec4(Vib3Mat4x4 m, Vib3Vec4 v) {
    return toC(toCpp(m) * toCpp(v));
}

// Rotation
VIB3_API Vib3Mat4x4 vib3_mat4x4_rotation_from_angles(
    float xy, float xz, float yz,
    float xw, float yw, float zw
) {
    return toC(Mat4x4::rotationFromAngles(xy, xz, yz, xw, yw, zw));
}

// Projection
VIB3_API Vib3Vec4 vib3_project_stereographic(Vib3Vec4 v, float dimension) {
    // Note: C++ core projection typically returns Projection3D (x,y,z)
    // We map it to Vib3Vec4 with w=1.0 for simplicity in Dart
    auto proj = projectStereographic(toCpp(v), dimension);
    return {proj.x, proj.y, proj.z, 1.0f};
}

}
