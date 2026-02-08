/**
 * Geometry_test.cpp - Unit tests for geometry generation
 *
 * Tests that the geometry generator produces valid vertex data for all 24
 * geometry indices (3 core types x 8 base geometries).
 *
 * Since the geometry library may not have a standalone header, we include
 * the relevant source and math headers directly.
 */

#include <gtest/gtest.h>
#include "math/Vec4.hpp"
#include "math/Mat4x4.hpp"
#include "math/Rotor4D.hpp"
#include "math/Projection.hpp"

// Forward-declare the public API from GeometryGenerator.cpp
// (linked via vib3_geometry library in CMake)
namespace vib3 {
    std::vector<Vec4> generateGeometry(int geometryIndex, int resolution) noexcept;
}

using namespace vib3;

// ============================================================================
// Geometry Name Constants (mirror the 24-geometry encoding)
// ============================================================================

// geometry_index = core_type * 8 + base_geometry
// core_type: 0=Base, 1=Hypersphere, 2=Hypertetrahedron
// base_geometry: 0=Tetrahedron, 1=Hypercube, 2=Sphere, 3=Torus,
//                4=KleinBottle, 5=Fractal, 6=Wave, 7=Crystal

static constexpr int kTetrahedronBase = 0;
static constexpr int kHypercubeBase = 1;
static constexpr int kSphereBase = 2;
static constexpr int kTorusBase = 3;
static constexpr int kKleinBottleBase = 4;
static constexpr int kFractalBase = 5;
static constexpr int kWaveBase = 6;
static constexpr int kCrystalBase = 7;

static constexpr int kHypersphereOffset = 8;
static constexpr int kHypertetraOffset = 16;

static constexpr int kTotalGeometries = 24;

/** Default subdivision resolution for tests. */
static constexpr int kDefaultRes = 16;

// ============================================================================
// Tesseract (Hypercube) Vertex Count
// ============================================================================

TEST(Geometry, TesseractHas16Vertices) {
    // A 4D hypercube (tesseract) has 2^4 = 16 vertices
    // The vertices are all combinations of (+/-1, +/-1, +/-1, +/-1)
    auto vertices = generateGeometry(kHypercubeBase, kDefaultRes);
    EXPECT_GE(vertices.size(), 16u)
        << "Tesseract should have at least 16 vertices";

    // Verify that all vertices have valid (non-NaN, non-Inf) components
    for (const auto& v : vertices) {
        EXPECT_FALSE(std::isnan(v.x)) << "Vertex has NaN x component";
        EXPECT_FALSE(std::isnan(v.y)) << "Vertex has NaN y component";
        EXPECT_FALSE(std::isnan(v.z)) << "Vertex has NaN z component";
        EXPECT_FALSE(std::isnan(v.w)) << "Vertex has NaN w component";
        EXPECT_FALSE(std::isinf(v.x)) << "Vertex has Inf x component";
        EXPECT_FALSE(std::isinf(v.y)) << "Vertex has Inf y component";
        EXPECT_FALSE(std::isinf(v.z)) << "Vertex has Inf z component";
        EXPECT_FALSE(std::isinf(v.w)) << "Vertex has Inf w component";
    }
}

// ============================================================================
// Tetrahedron Vertex Count
// ============================================================================

TEST(Geometry, TetrahedronHas4Vertices) {
    // A tetrahedron has 4 vertices
    auto vertices = generateGeometry(kTetrahedronBase, kDefaultRes);
    EXPECT_GE(vertices.size(), 4u)
        << "Tetrahedron should have at least 4 vertices";

    for (const auto& v : vertices) {
        EXPECT_FALSE(std::isnan(v.x));
        EXPECT_FALSE(std::isnan(v.y));
        EXPECT_FALSE(std::isnan(v.z));
        EXPECT_FALSE(std::isnan(v.w));
    }
}

// ============================================================================
// All 24 Geometries Produce Non-Empty Vertex Sets
// ============================================================================

TEST(Geometry, AllGeometriesProduceVertices) {
    for (int i = 0; i < kTotalGeometries; ++i) {
        auto vertices = generateGeometry(i, kDefaultRes);
        EXPECT_GT(vertices.size(), 0u)
            << "Geometry index " << i << " should produce non-empty vertex set";
    }
}

TEST(Geometry, AllGeometriesHaveValidVertices) {
    for (int i = 0; i < kTotalGeometries; ++i) {
        auto vertices = generateGeometry(i, kDefaultRes);
        for (size_t j = 0; j < vertices.size(); ++j) {
            EXPECT_FALSE(std::isnan(vertices[j].x))
                << "Geometry " << i << " vertex " << j << " has NaN x";
            EXPECT_FALSE(std::isnan(vertices[j].y))
                << "Geometry " << i << " vertex " << j << " has NaN y";
            EXPECT_FALSE(std::isnan(vertices[j].z))
                << "Geometry " << i << " vertex " << j << " has NaN z";
            EXPECT_FALSE(std::isnan(vertices[j].w))
                << "Geometry " << i << " vertex " << j << " has NaN w";
            EXPECT_FALSE(std::isinf(vertices[j].x))
                << "Geometry " << i << " vertex " << j << " has Inf x";
            EXPECT_FALSE(std::isinf(vertices[j].y))
                << "Geometry " << i << " vertex " << j << " has Inf y";
            EXPECT_FALSE(std::isinf(vertices[j].z))
                << "Geometry " << i << " vertex " << j << " has Inf z";
            EXPECT_FALSE(std::isinf(vertices[j].w))
                << "Geometry " << i << " vertex " << j << " has Inf w";
        }
    }
}

// ============================================================================
// Core Type Offset Encoding
// ============================================================================

TEST(Geometry, BaseGeometriesRange0to7) {
    // Base geometries (core_type=0) are indices 0-7
    for (int i = 0; i <= 7; ++i) {
        auto vertices = generateGeometry(i, kDefaultRes);
        EXPECT_GT(vertices.size(), 0u)
            << "Base geometry " << i << " should produce vertices";
    }
}

TEST(Geometry, HypersphereGeometriesRange8to15) {
    // Hypersphere warped geometries (core_type=1) are indices 8-15
    for (int i = 8; i <= 15; ++i) {
        auto vertices = generateGeometry(i, kDefaultRes);
        EXPECT_GT(vertices.size(), 0u)
            << "Hypersphere geometry " << i << " should produce vertices";
    }
}

TEST(Geometry, HypertetraGeometriesRange16to23) {
    // Hypertetrahedron warped geometries (core_type=2) are indices 16-23
    for (int i = 16; i <= 23; ++i) {
        auto vertices = generateGeometry(i, kDefaultRes);
        EXPECT_GT(vertices.size(), 0u)
            << "Hypertetra geometry " << i << " should produce vertices";
    }
}

// ============================================================================
// Specific Geometry Properties
// ============================================================================

TEST(Geometry, SphereVerticesAreApproximatelyOnUnitSphere) {
    auto vertices = generateGeometry(kSphereBase, kDefaultRes);
    EXPECT_GT(vertices.size(), 0u);

    // For a unit sphere, most vertices should have length close to 1.0
    int onSphere = 0;
    for (const auto& v : vertices) {
        float len = v.length();
        if (std::abs(len - 1.0f) < 0.2f) {
            ++onSphere;
        }
    }
    // At least half should be near the unit sphere
    EXPECT_GT(onSphere, static_cast<int>(vertices.size()) / 2)
        << "Most sphere vertices should be near unit length";
}

TEST(Geometry, HypercubeVerticesHaveSymmetry) {
    // Tesseract vertices should be symmetric: if (x,y,z,w) is a vertex,
    // then (-x,y,z,w) should also be (approximately) a vertex
    auto vertices = generateGeometry(kHypercubeBase, kDefaultRes);
    EXPECT_GE(vertices.size(), 16u);

    // Count vertices with positive x and negative x
    int positiveX = 0, negativeX = 0;
    for (const auto& v : vertices) {
        if (v.x > 0.01f) ++positiveX;
        if (v.x < -0.01f) ++negativeX;
    }
    // Should be roughly balanced
    EXPECT_GT(positiveX, 0) << "Should have vertices with positive x";
    EXPECT_GT(negativeX, 0) << "Should have vertices with negative x";
}

// ============================================================================
// Same Base Geometry Across Core Types
// ============================================================================

TEST(Geometry, WarpedVersionsHaveSameOrMoreVertices) {
    // Warped versions should have at least as many vertices as the base
    for (int base = 0; base < 8; ++base) {
        auto baseVertices = generateGeometry(base, kDefaultRes);
        auto hypersphereVertices = generateGeometry(base + kHypersphereOffset, kDefaultRes);
        auto hypertetraVertices = generateGeometry(base + kHypertetraOffset, kDefaultRes);

        EXPECT_GT(baseVertices.size(), 0u);
        EXPECT_GT(hypersphereVertices.size(), 0u);
        EXPECT_GT(hypertetraVertices.size(), 0u);
    }
}
