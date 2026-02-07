/**
 * GeometryGenerator.cpp - Main Geometry Factory
 *
 * Dispatches to individual geometry generators based on geometry index.
 * Uses the VIB3+ encoding: index = coreType * 8 + baseGeometry
 *
 * Core types:
 *   0 = Base (index 0-7)      - Pure base geometry
 *   1 = Hypersphere (index 8-15)  - Projected onto 3-sphere
 *   2 = Hypertetrahedron (index 16-23) - Warped toward pentatope
 *
 * Base geometries (0-7):
 *   0 = Tetrahedron    4 = Klein Bottle
 *   1 = Hypercube      5 = Fractal
 *   2 = Sphere         6 = Wave
 *   3 = Torus          7 = Crystal
 */

#include "math/Vec4.hpp"
#include <vector>
#include <algorithm>

namespace vib3 {

// ---- Forward declarations of individual generators ----

// geometry/Tetrahedron.cpp
std::vector<Vec4> generateTetrahedron(int resolution) noexcept;

// geometry/Tesseract.cpp
std::vector<Vec4> generateTesseract(int resolution) noexcept;

// geometry/Sphere.cpp
std::vector<Vec4> generateSphere(int resolution) noexcept;

// geometry/Torus.cpp
std::vector<Vec4> generateTorus(int resolution) noexcept;

// geometry/KleinBottle.cpp
std::vector<Vec4> generateKleinBottle(int resolution) noexcept;

// geometry/Fractal.cpp
std::vector<Vec4> generateFractal(int resolution) noexcept;

// geometry/Wave.cpp
std::vector<Vec4> generateWave(int resolution) noexcept;

// geometry/Crystal.cpp
std::vector<Vec4> generateCrystal(int resolution) noexcept;

// geometry/WarpFunctions.cpp
Vec4 warpHypersphere(Vec4 point, float radius) noexcept;
std::vector<Vec4> warpHypersphereBatch(const std::vector<Vec4>& points, float radius) noexcept;
Vec4 warpHypertetra(Vec4 point) noexcept;
std::vector<Vec4> warpHypertetraBatch(const std::vector<Vec4>& points) noexcept;

// ---- Geometry index encoding ----

/**
 * Maximum valid geometry index (3 core types x 8 base geometries - 1).
 */
constexpr int kMaxGeometryIndex = 23;

/**
 * Number of base geometry types.
 */
constexpr int kBaseGeometryCount = 8;

/**
 * Decompose a geometry index into core type and base geometry.
 *
 * @param geometryIndex Combined index (0-23)
 * @param coreType Output: 0=Base, 1=Hypersphere, 2=Hypertetrahedron
 * @param baseGeometry Output: 0-7 base geometry type
 */
constexpr void decodeGeometryIndex(int geometryIndex,
                                    int& coreType,
                                    int& baseGeometry) noexcept {
    coreType = geometryIndex / kBaseGeometryCount;
    baseGeometry = geometryIndex % kBaseGeometryCount;
}

/**
 * Encode core type and base geometry into a geometry index.
 *
 * @param coreType 0=Base, 1=Hypersphere, 2=Hypertetrahedron
 * @param baseGeometry 0-7 base geometry type
 * @return Combined geometry index (0-23)
 */
constexpr int encodeGeometryIndex(int coreType, int baseGeometry) noexcept {
    return coreType * kBaseGeometryCount + baseGeometry;
}

// ---- Internal dispatch ----

namespace {

/**
 * Generate base geometry vertices for a given base type.
 */
std::vector<Vec4> generateBaseGeometry(int baseGeometry, int resolution) noexcept {
    switch (baseGeometry) {
        case 0: return generateTetrahedron(resolution);
        case 1: return generateTesseract(resolution);
        case 2: return generateSphere(resolution);
        case 3: return generateTorus(resolution);
        case 4: return generateKleinBottle(resolution);
        case 5: return generateFractal(resolution);
        case 6: return generateWave(resolution);
        case 7: return generateCrystal(resolution);
        default:
            // Unknown base geometry, return empty
            return {};
    }
}

/**
 * Apply core type warp to a set of base vertices.
 */
std::vector<Vec4> applyWarp(int coreType, std::vector<Vec4> vertices) noexcept {
    switch (coreType) {
        case 0:
            // Base: no warp
            return vertices;

        case 1:
            // Hypersphere: project all vertices onto S3
            return warpHypersphereBatch(vertices, 1.0f);

        case 2:
            // Hypertetrahedron: warp toward pentatope vertices
            return warpHypertetraBatch(vertices);

        default:
            // Unknown core type, return unmodified
            return vertices;
    }
}

} // anonymous namespace

// ---- Public API ----

/**
 * Generate 4D geometry for a given geometry index.
 *
 * This is the main entry point for the geometry library. It decodes the
 * geometry index into a base geometry type and core type warp, generates
 * the base geometry, and then applies the appropriate warp transformation.
 *
 * @param geometryIndex Combined geometry index (0-23)
 *   - 0-7:   Base geometries (no warp)
 *   - 8-15:  Hypersphere-warped geometries
 *   - 16-23: Hypertetrahedron-warped geometries
 *
 * @param resolution Controls the level of detail. Higher values produce
 *   more vertices. The exact meaning varies by geometry type but generally
 *   represents subdivisions per dimension. Typical range: 4-100.
 *
 * @return Vector of 4D vertices. Empty if geometryIndex is out of range.
 */
std::vector<Vec4> generateGeometry(int geometryIndex, int resolution) noexcept {
    // Clamp to valid range
    if (geometryIndex < 0 || geometryIndex > kMaxGeometryIndex) {
        return {};
    }

    if (resolution < 2) resolution = 2;
    if (resolution > 256) resolution = 256;

    int coreType = 0;
    int baseGeometry = 0;
    decodeGeometryIndex(geometryIndex, coreType, baseGeometry);

    // Generate base geometry
    std::vector<Vec4> vertices = generateBaseGeometry(baseGeometry, resolution);

    // Apply core type warp
    return applyWarp(coreType, std::move(vertices));
}

/**
 * Get the name string for a base geometry type.
 *
 * @param baseGeometry Base geometry index (0-7)
 * @return Human-readable name, or "Unknown" if out of range
 */
const char* getBaseGeometryName(int baseGeometry) noexcept {
    switch (baseGeometry) {
        case 0: return "Tetrahedron";
        case 1: return "Hypercube";
        case 2: return "Sphere";
        case 3: return "Torus";
        case 4: return "Klein Bottle";
        case 5: return "Fractal";
        case 6: return "Wave";
        case 7: return "Crystal";
        default: return "Unknown";
    }
}

/**
 * Get the name string for a core type.
 *
 * @param coreType Core type index (0-2)
 * @return Human-readable name, or "Unknown" if out of range
 */
const char* getCoreTypeName(int coreType) noexcept {
    switch (coreType) {
        case 0: return "Base";
        case 1: return "Hypersphere";
        case 2: return "Hypertetrahedron";
        default: return "Unknown";
    }
}

/**
 * Get a full descriptive name for a geometry index.
 *
 * Combines core type and base geometry names, e.g.
 * "Hypersphere Torus" for index 11.
 *
 * @param geometryIndex Combined index (0-23)
 * @param buffer Output buffer (must be at least 64 chars)
 * @param bufferSize Size of the output buffer
 * @return Number of characters written (excluding null terminator)
 */
int getGeometryName(int geometryIndex, char* buffer, int bufferSize) noexcept {
    if (!buffer || bufferSize <= 0) return 0;

    int coreType = 0;
    int baseGeometry = 0;
    decodeGeometryIndex(geometryIndex, coreType, baseGeometry);

    const char* coreName = getCoreTypeName(coreType);
    const char* baseName = getBaseGeometryName(baseGeometry);

    int written = 0;

    if (coreType == 0) {
        // Base type: just use geometry name
        for (int i = 0; baseName[i] != '\0' && written < bufferSize - 1; ++i) {
            buffer[written++] = baseName[i];
        }
    } else {
        // Compound name: "CoreType BaseGeometry"
        for (int i = 0; coreName[i] != '\0' && written < bufferSize - 1; ++i) {
            buffer[written++] = coreName[i];
        }
        if (written < bufferSize - 1) {
            buffer[written++] = ' ';
        }
        for (int i = 0; baseName[i] != '\0' && written < bufferSize - 1; ++i) {
            buffer[written++] = baseName[i];
        }
    }

    buffer[written] = '\0';
    return written;
}

} // namespace vib3
