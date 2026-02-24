#ifndef VIB3_C_API_H
#define VIB3_C_API_H

#ifdef __cplusplus
extern "C" {
#endif

// --- Macros ---
#ifdef _WIN32
    #ifdef VIB3_EXPORT
        #define VIB3_API __declspec(dllexport)
    #else
        #define VIB3_API __declspec(dllimport)
    #endif
#else
    #define VIB3_API __attribute__((visibility("default")))
#endif

// --- Structs ---
typedef struct {
    float x, y, z, w;
} Vib3Vec4;

typedef struct {
    float data[16]; // Column-major
} Vib3Mat4x4;

// --- Math Functions ---

// Vec4
VIB3_API Vib3Vec4 vib3_vec4_create(float x, float y, float z, float w);
VIB3_API Vib3Vec4 vib3_vec4_add(Vib3Vec4 a, Vib3Vec4 b);
VIB3_API Vib3Vec4 vib3_vec4_scale(Vib3Vec4 v, float s);
VIB3_API float vib3_vec4_length(Vib3Vec4 v);

// Mat4x4
VIB3_API Vib3Mat4x4 vib3_mat4x4_identity();
VIB3_API Vib3Mat4x4 vib3_mat4x4_multiply(Vib3Mat4x4 a, Vib3Mat4x4 b);
VIB3_API Vib3Vec4 vib3_mat4x4_multiply_vec4(Vib3Mat4x4 m, Vib3Vec4 v);

// Rotation
VIB3_API Vib3Mat4x4 vib3_mat4x4_rotation_from_angles(
    float xy, float xz, float yz,
    float xw, float yw, float zw
);

// Projection
// Returns a Vec4 where x,y,z are projected coordinates and w is unused (or depth)
VIB3_API Vib3Vec4 vib3_project_stereographic(Vib3Vec4 v, float dimension);

#ifdef __cplusplus
}
#endif

#endif // VIB3_C_API_H
