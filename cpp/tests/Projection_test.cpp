/**
 * Projection_test.cpp - Unit tests for 4D to 3D projection functions
 *
 * Tests perspective, stereographic, orthographic, oblique, and slice projections.
 */

#include <gtest/gtest.h>
#include "math/Projection.hpp"
#include "math/Vec4.hpp"
#include <cmath>

using namespace vib3;

static constexpr float kEpsilon = 1e-5f;

// ============================================================================
// Perspective Projection
// ============================================================================

TEST(Projection, PerspectiveOriginStaysAtOrigin) {
    Vec4 v(0.0f, 0.0f, 0.0f, 0.0f);
    Projection3D p = projectPerspective(v, 2.0f);
    EXPECT_NEAR(p.x, 0.0f, kEpsilon);
    EXPECT_NEAR(p.y, 0.0f, kEpsilon);
    EXPECT_NEAR(p.z, 0.0f, kEpsilon);
}

TEST(Projection, PerspectiveUnitXAtWZero) {
    // P = x * d / (d - w) = 1 * 2 / (2 - 0) = 1
    Vec4 v(1.0f, 0.0f, 0.0f, 0.0f);
    Projection3D p = projectPerspective(v, 2.0f);
    EXPECT_NEAR(p.x, 1.0f, kEpsilon);
    EXPECT_NEAR(p.y, 0.0f, kEpsilon);
    EXPECT_NEAR(p.z, 0.0f, kEpsilon);
}

TEST(Projection, PerspectiveScalesWithW) {
    // Point with w=1, d=2: factor = 2/(2-1) = 2
    Vec4 v(1.0f, 1.0f, 1.0f, 1.0f);
    Projection3D p = projectPerspective(v, 2.0f);
    EXPECT_NEAR(p.x, 2.0f, kEpsilon);
    EXPECT_NEAR(p.y, 2.0f, kEpsilon);
    EXPECT_NEAR(p.z, 2.0f, kEpsilon);
}

TEST(Projection, PerspectiveWithNegativeW) {
    // Point with w=-1, d=2: factor = 2/(2-(-1)) = 2/3
    Vec4 v(3.0f, 0.0f, 0.0f, -1.0f);
    Projection3D p = projectPerspective(v, 2.0f);
    EXPECT_NEAR(p.x, 2.0f, kEpsilon);
    EXPECT_NEAR(p.y, 0.0f, kEpsilon);
    EXPECT_NEAR(p.z, 0.0f, kEpsilon);
}

TEST(Projection, PerspectiveDefaultDistance) {
    // Default distance is 2.0
    Vec4 v(1.0f, 0.0f, 0.0f, 0.0f);
    Projection3D p = projectPerspective(v);
    EXPECT_NEAR(p.x, 1.0f, kEpsilon);
}

// ============================================================================
// Stereographic Projection
// ============================================================================

TEST(Projection, StereographicOriginStaysAtOrigin) {
    Vec4 v(0.0f, 0.0f, 0.0f, 0.0f);
    Projection3D p = projectStereographic(v);
    EXPECT_NEAR(p.x, 0.0f, kEpsilon);
    EXPECT_NEAR(p.y, 0.0f, kEpsilon);
    EXPECT_NEAR(p.z, 0.0f, kEpsilon);
}

TEST(Projection, StereographicUnitXAtWZero) {
    // P = x / (1 - w) = 1 / (1 - 0) = 1
    Vec4 v(1.0f, 0.0f, 0.0f, 0.0f);
    Projection3D p = projectStereographic(v);
    EXPECT_NEAR(p.x, 1.0f, kEpsilon);
    EXPECT_NEAR(p.y, 0.0f, kEpsilon);
    EXPECT_NEAR(p.z, 0.0f, kEpsilon);
}

TEST(Projection, StereographicWithNegativeW) {
    // P = x / (1 - w) = 1 / (1 - (-1)) = 1/2 = 0.5
    Vec4 v(1.0f, 0.0f, 0.0f, -1.0f);
    Projection3D p = projectStereographic(v);
    EXPECT_NEAR(p.x, 0.5f, kEpsilon);
    EXPECT_NEAR(p.y, 0.0f, kEpsilon);
}

TEST(Projection, StereographicAllComponents) {
    // P = xyz / (1 - w) = (2, 4, 6) / (1 - 0.5) = (4, 8, 12)
    Vec4 v(2.0f, 4.0f, 6.0f, 0.5f);
    Projection3D p = projectStereographic(v);
    EXPECT_NEAR(p.x, 4.0f, kEpsilon);
    EXPECT_NEAR(p.y, 8.0f, kEpsilon);
    EXPECT_NEAR(p.z, 12.0f, kEpsilon);
}

// ============================================================================
// Orthographic Projection
// ============================================================================

TEST(Projection, OrthographicDropsW) {
    Vec4 v(1.0f, 2.0f, 3.0f, 99.0f);
    Projection3D p = projectOrthographic(v);
    EXPECT_NEAR(p.x, 1.0f, kEpsilon);
    EXPECT_NEAR(p.y, 2.0f, kEpsilon);
    EXPECT_NEAR(p.z, 3.0f, kEpsilon);
}

TEST(Projection, OrthographicOriginStaysAtOrigin) {
    Vec4 v(0.0f, 0.0f, 0.0f, 0.0f);
    Projection3D p = projectOrthographic(v);
    EXPECT_NEAR(p.x, 0.0f, kEpsilon);
    EXPECT_NEAR(p.y, 0.0f, kEpsilon);
    EXPECT_NEAR(p.z, 0.0f, kEpsilon);
}

TEST(Projection, OrthographicIgnoresW) {
    // Two points differing only in W should project to the same 3D point
    Vec4 v1(5.0f, 6.0f, 7.0f, 0.0f);
    Vec4 v2(5.0f, 6.0f, 7.0f, 100.0f);
    Projection3D p1 = projectOrthographic(v1);
    Projection3D p2 = projectOrthographic(v2);
    EXPECT_NEAR(p1.x, p2.x, kEpsilon);
    EXPECT_NEAR(p1.y, p2.y, kEpsilon);
    EXPECT_NEAR(p1.z, p2.z, kEpsilon);
}

TEST(Projection, OrthographicNegativeValues) {
    Vec4 v(-3.0f, -4.0f, -5.0f, 10.0f);
    Projection3D p = projectOrthographic(v);
    EXPECT_NEAR(p.x, -3.0f, kEpsilon);
    EXPECT_NEAR(p.y, -4.0f, kEpsilon);
    EXPECT_NEAR(p.z, -5.0f, kEpsilon);
}

// ============================================================================
// Oblique Projection
// ============================================================================

TEST(Projection, ObliqueOriginStaysAtOrigin) {
    Vec4 v(0.0f, 0.0f, 0.0f, 0.0f);
    Projection3D p = projectOblique(v);
    EXPECT_NEAR(p.x, 0.0f, kEpsilon);
    EXPECT_NEAR(p.y, 0.0f, kEpsilon);
    EXPECT_NEAR(p.z, 0.0f, kEpsilon);
}

TEST(Projection, ObliqueWithWZeroMatchesOrthographic) {
    Vec4 v(1.0f, 2.0f, 3.0f, 0.0f);
    Projection3D pObl = projectOblique(v);
    Projection3D pOrt = projectOrthographic(v);
    EXPECT_NEAR(pObl.x, pOrt.x, kEpsilon);
    EXPECT_NEAR(pObl.y, pOrt.y, kEpsilon);
    EXPECT_NEAR(pObl.z, pOrt.z, kEpsilon);
}

TEST(Projection, ObliqueAddsShear) {
    // With default shear (0.5, 0.5, 0.0), w=2:
    // x' = x + shearX*w = 1 + 0.5*2 = 2
    // y' = y + shearY*w = 0 + 0.5*2 = 1
    // z' = z + shearZ*w = 0 + 0.0*2 = 0
    Vec4 v(1.0f, 0.0f, 0.0f, 2.0f);
    Projection3D p = projectOblique(v, 0.5f, 0.5f, 0.0f);
    EXPECT_NEAR(p.x, 2.0f, kEpsilon);
    EXPECT_NEAR(p.y, 1.0f, kEpsilon);
    EXPECT_NEAR(p.z, 0.0f, kEpsilon);
}

// ============================================================================
// Slice Projection
// ============================================================================

TEST(Projection, SliceAtOriginValidForWZero) {
    Vec4 v(1.0f, 2.0f, 3.0f, 0.0f);
    SliceResult sr = projectSlice(v, 0.0f, 0.1f, true);
    EXPECT_TRUE(sr.valid);
    EXPECT_NEAR(sr.point.x, 1.0f, kEpsilon);
    EXPECT_NEAR(sr.point.y, 2.0f, kEpsilon);
    EXPECT_NEAR(sr.point.z, 3.0f, kEpsilon);
    EXPECT_NEAR(sr.alpha, 1.0f, kEpsilon); // At center of slice
}

TEST(Projection, SliceOutsideThicknessIsInvalid) {
    Vec4 v(1.0f, 2.0f, 3.0f, 5.0f);
    SliceResult sr = projectSlice(v, 0.0f, 0.1f, true);
    EXPECT_FALSE(sr.valid);
}

TEST(Projection, SliceAtEdgeHasLowAlpha) {
    // Point at sliceW + thickness should have alpha near 0
    float sliceW = 0.0f;
    float thickness = 1.0f;
    Vec4 v(1.0f, 0.0f, 0.0f, 0.9f); // Near the edge
    SliceResult sr = projectSlice(v, sliceW, thickness, true);
    if (sr.valid) {
        EXPECT_LT(sr.alpha, 0.5f);
    }
}

// ============================================================================
// Projection3D Helper
// ============================================================================

TEST(Projection, Projection3DDefaultConstructor) {
    Projection3D p;
    EXPECT_FLOAT_EQ(p.x, 0.0f);
    EXPECT_FLOAT_EQ(p.y, 0.0f);
    EXPECT_FLOAT_EQ(p.z, 0.0f);
}

TEST(Projection, Projection3DToArray) {
    Projection3D p(1.0f, 2.0f, 3.0f);
    auto arr = p.toArray();
    EXPECT_FLOAT_EQ(arr[0], 1.0f);
    EXPECT_FLOAT_EQ(arr[1], 2.0f);
    EXPECT_FLOAT_EQ(arr[2], 3.0f);
}

// ============================================================================
// Batch Projections
// ============================================================================

TEST(Projection, BatchPerspectiveEmpty) {
    std::vector<Vec4> empty;
    auto result = projectPerspectiveBatch(empty, 2.0f);
    EXPECT_TRUE(result.empty());
}

TEST(Projection, BatchPerspectiveSinglePoint) {
    std::vector<Vec4> points = {Vec4(1.0f, 0.0f, 0.0f, 0.0f)};
    auto result = projectPerspectiveBatch(points, 2.0f);
    EXPECT_EQ(result.size(), 1u);
    EXPECT_NEAR(result[0].x, 1.0f, kEpsilon);
}

TEST(Projection, BatchPerspectiveMultiplePoints) {
    std::vector<Vec4> points = {
        Vec4(0.0f, 0.0f, 0.0f, 0.0f),
        Vec4(1.0f, 0.0f, 0.0f, 0.0f),
        Vec4(0.0f, 1.0f, 0.0f, 0.0f)
    };
    auto result = projectPerspectiveBatch(points, 2.0f);
    EXPECT_EQ(result.size(), 3u);
}

TEST(Projection, BatchStereographic) {
    std::vector<Vec4> points = {Vec4(1.0f, 0.0f, 0.0f, 0.0f)};
    auto result = projectStereographicBatch(points);
    EXPECT_EQ(result.size(), 1u);
    EXPECT_NEAR(result[0].x, 1.0f, kEpsilon);
}

TEST(Projection, BatchOrthographic) {
    std::vector<Vec4> points = {Vec4(1.0f, 2.0f, 3.0f, 99.0f)};
    auto result = projectOrthographicBatch(points);
    EXPECT_EQ(result.size(), 1u);
    EXPECT_NEAR(result[0].x, 1.0f, kEpsilon);
    EXPECT_NEAR(result[0].y, 2.0f, kEpsilon);
    EXPECT_NEAR(result[0].z, 3.0f, kEpsilon);
}

TEST(Projection, ProjectToFloatArray) {
    std::vector<Vec4> points = {
        Vec4(1.0f, 2.0f, 3.0f, 0.0f),
        Vec4(4.0f, 5.0f, 6.0f, 0.0f)
    };
    auto result = projectToFloatArray(points, 2.0f);
    // 2 points * 3 floats each = 6
    EXPECT_EQ(result.size(), 6u);
    EXPECT_NEAR(result[0], 1.0f, kEpsilon); // first point x
    EXPECT_NEAR(result[1], 2.0f, kEpsilon); // first point y
    EXPECT_NEAR(result[2], 3.0f, kEpsilon); // first point z
}

// ============================================================================
// ProjectionParams defaults
// ============================================================================

TEST(Projection, ProjectionParamsDefaults) {
    auto params = ProjectionParams::defaults();
    EXPECT_FLOAT_EQ(params.distance, 2.0f);
    EXPECT_FLOAT_EQ(params.viewerW, 0.0f);
    EXPECT_FLOAT_EQ(params.sliceW, 0.0f);
    EXPECT_FLOAT_EQ(params.sliceThickness, 0.1f);
}

// ============================================================================
// SliceResult::invalid
// ============================================================================

TEST(Projection, SliceResultInvalid) {
    auto sr = SliceResult::invalid();
    EXPECT_FALSE(sr.valid);
    EXPECT_FLOAT_EQ(sr.alpha, 0.0f);
}
