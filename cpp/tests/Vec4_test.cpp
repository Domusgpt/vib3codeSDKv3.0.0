/**
 * Vec4_test.cpp - Unit tests for Vec4 4D vector class
 *
 * Tests construction, arithmetic, geometric operations, and static factories.
 */

#include <gtest/gtest.h>
#include "math/Vec4.hpp"
#include <cmath>

using namespace vib3;

// Tolerance for floating-point comparisons
static constexpr float kEpsilon = 1e-5f;

// ============================================================================
// Construction
// ============================================================================

TEST(Vec4, DefaultConstructorIsZero) {
    Vec4 v;
    EXPECT_FLOAT_EQ(v.x, 0.0f);
    EXPECT_FLOAT_EQ(v.y, 0.0f);
    EXPECT_FLOAT_EQ(v.z, 0.0f);
    EXPECT_FLOAT_EQ(v.w, 0.0f);
}

TEST(Vec4, ParameterizedConstructor) {
    Vec4 v(1.0f, 2.0f, 3.0f, 4.0f);
    EXPECT_FLOAT_EQ(v.x, 1.0f);
    EXPECT_FLOAT_EQ(v.y, 2.0f);
    EXPECT_FLOAT_EQ(v.z, 3.0f);
    EXPECT_FLOAT_EQ(v.w, 4.0f);
}

TEST(Vec4, ScalarConstructor) {
    Vec4 v(5.0f);
    EXPECT_FLOAT_EQ(v.x, 5.0f);
    EXPECT_FLOAT_EQ(v.y, 5.0f);
    EXPECT_FLOAT_EQ(v.z, 5.0f);
    EXPECT_FLOAT_EQ(v.w, 5.0f);
}

TEST(Vec4, ArrayConstructor) {
    std::array<float, 4> arr = {1.0f, 2.0f, 3.0f, 4.0f};
    Vec4 v(arr);
    EXPECT_FLOAT_EQ(v.x, 1.0f);
    EXPECT_FLOAT_EQ(v.y, 2.0f);
    EXPECT_FLOAT_EQ(v.z, 3.0f);
    EXPECT_FLOAT_EQ(v.w, 4.0f);
}

// ============================================================================
// Static Factories
// ============================================================================

TEST(Vec4, ZeroFactory) {
    Vec4 v = Vec4::zero();
    EXPECT_FLOAT_EQ(v.x, 0.0f);
    EXPECT_FLOAT_EQ(v.y, 0.0f);
    EXPECT_FLOAT_EQ(v.z, 0.0f);
    EXPECT_FLOAT_EQ(v.w, 0.0f);
}

TEST(Vec4, OneFactory) {
    Vec4 v = Vec4::one();
    EXPECT_FLOAT_EQ(v.x, 1.0f);
    EXPECT_FLOAT_EQ(v.y, 1.0f);
    EXPECT_FLOAT_EQ(v.z, 1.0f);
    EXPECT_FLOAT_EQ(v.w, 1.0f);
}

TEST(Vec4, UnitXFactory) {
    Vec4 v = Vec4::unitX();
    EXPECT_FLOAT_EQ(v.x, 1.0f);
    EXPECT_FLOAT_EQ(v.y, 0.0f);
    EXPECT_FLOAT_EQ(v.z, 0.0f);
    EXPECT_FLOAT_EQ(v.w, 0.0f);
}

TEST(Vec4, UnitYFactory) {
    Vec4 v = Vec4::unitY();
    EXPECT_FLOAT_EQ(v.x, 0.0f);
    EXPECT_FLOAT_EQ(v.y, 1.0f);
    EXPECT_FLOAT_EQ(v.z, 0.0f);
    EXPECT_FLOAT_EQ(v.w, 0.0f);
}

TEST(Vec4, UnitZFactory) {
    Vec4 v = Vec4::unitZ();
    EXPECT_FLOAT_EQ(v.x, 0.0f);
    EXPECT_FLOAT_EQ(v.y, 0.0f);
    EXPECT_FLOAT_EQ(v.z, 1.0f);
    EXPECT_FLOAT_EQ(v.w, 0.0f);
}

TEST(Vec4, UnitWFactory) {
    Vec4 v = Vec4::unitW();
    EXPECT_FLOAT_EQ(v.x, 0.0f);
    EXPECT_FLOAT_EQ(v.y, 0.0f);
    EXPECT_FLOAT_EQ(v.z, 0.0f);
    EXPECT_FLOAT_EQ(v.w, 1.0f);
}

// ============================================================================
// Element Access
// ============================================================================

TEST(Vec4, SubscriptOperator) {
    Vec4 v(10.0f, 20.0f, 30.0f, 40.0f);
    EXPECT_FLOAT_EQ(v[0], 10.0f);
    EXPECT_FLOAT_EQ(v[1], 20.0f);
    EXPECT_FLOAT_EQ(v[2], 30.0f);
    EXPECT_FLOAT_EQ(v[3], 40.0f);
}

TEST(Vec4, SubscriptOperatorMutation) {
    Vec4 v;
    v[0] = 1.0f;
    v[1] = 2.0f;
    v[2] = 3.0f;
    v[3] = 4.0f;
    EXPECT_FLOAT_EQ(v.x, 1.0f);
    EXPECT_FLOAT_EQ(v.y, 2.0f);
    EXPECT_FLOAT_EQ(v.z, 3.0f);
    EXPECT_FLOAT_EQ(v.w, 4.0f);
}

// ============================================================================
// Arithmetic
// ============================================================================

TEST(Vec4, Addition) {
    Vec4 a(1.0f, 2.0f, 3.0f, 4.0f);
    Vec4 b(5.0f, 6.0f, 7.0f, 8.0f);
    Vec4 c = a + b;
    EXPECT_FLOAT_EQ(c.x, 6.0f);
    EXPECT_FLOAT_EQ(c.y, 8.0f);
    EXPECT_FLOAT_EQ(c.z, 10.0f);
    EXPECT_FLOAT_EQ(c.w, 12.0f);
}

TEST(Vec4, Subtraction) {
    Vec4 a(5.0f, 7.0f, 9.0f, 11.0f);
    Vec4 b(1.0f, 2.0f, 3.0f, 4.0f);
    Vec4 c = a - b;
    EXPECT_FLOAT_EQ(c.x, 4.0f);
    EXPECT_FLOAT_EQ(c.y, 5.0f);
    EXPECT_FLOAT_EQ(c.z, 6.0f);
    EXPECT_FLOAT_EQ(c.w, 7.0f);
}

TEST(Vec4, ScalarMultiplication) {
    Vec4 v(1.0f, 2.0f, 3.0f, 4.0f);
    Vec4 result = v * 2.0f;
    EXPECT_FLOAT_EQ(result.x, 2.0f);
    EXPECT_FLOAT_EQ(result.y, 4.0f);
    EXPECT_FLOAT_EQ(result.z, 6.0f);
    EXPECT_FLOAT_EQ(result.w, 8.0f);
}

TEST(Vec4, ScalarMultiplicationCommutative) {
    Vec4 v(1.0f, 2.0f, 3.0f, 4.0f);
    Vec4 result = 3.0f * v;
    EXPECT_FLOAT_EQ(result.x, 3.0f);
    EXPECT_FLOAT_EQ(result.y, 6.0f);
    EXPECT_FLOAT_EQ(result.z, 9.0f);
    EXPECT_FLOAT_EQ(result.w, 12.0f);
}

TEST(Vec4, ScalarDivision) {
    Vec4 v(2.0f, 4.0f, 6.0f, 8.0f);
    Vec4 result = v / 2.0f;
    EXPECT_FLOAT_EQ(result.x, 1.0f);
    EXPECT_FLOAT_EQ(result.y, 2.0f);
    EXPECT_FLOAT_EQ(result.z, 3.0f);
    EXPECT_FLOAT_EQ(result.w, 4.0f);
}

TEST(Vec4, Negation) {
    Vec4 v(1.0f, -2.0f, 3.0f, -4.0f);
    Vec4 neg = -v;
    EXPECT_FLOAT_EQ(neg.x, -1.0f);
    EXPECT_FLOAT_EQ(neg.y, 2.0f);
    EXPECT_FLOAT_EQ(neg.z, -3.0f);
    EXPECT_FLOAT_EQ(neg.w, 4.0f);
}

TEST(Vec4, CompoundAddition) {
    Vec4 a(1.0f, 2.0f, 3.0f, 4.0f);
    a += Vec4(10.0f, 20.0f, 30.0f, 40.0f);
    EXPECT_FLOAT_EQ(a.x, 11.0f);
    EXPECT_FLOAT_EQ(a.y, 22.0f);
    EXPECT_FLOAT_EQ(a.z, 33.0f);
    EXPECT_FLOAT_EQ(a.w, 44.0f);
}

TEST(Vec4, CompoundSubtraction) {
    Vec4 a(10.0f, 20.0f, 30.0f, 40.0f);
    a -= Vec4(1.0f, 2.0f, 3.0f, 4.0f);
    EXPECT_FLOAT_EQ(a.x, 9.0f);
    EXPECT_FLOAT_EQ(a.y, 18.0f);
    EXPECT_FLOAT_EQ(a.z, 27.0f);
    EXPECT_FLOAT_EQ(a.w, 36.0f);
}

TEST(Vec4, CompoundScalarMultiply) {
    Vec4 a(1.0f, 2.0f, 3.0f, 4.0f);
    a *= 5.0f;
    EXPECT_FLOAT_EQ(a.x, 5.0f);
    EXPECT_FLOAT_EQ(a.y, 10.0f);
    EXPECT_FLOAT_EQ(a.z, 15.0f);
    EXPECT_FLOAT_EQ(a.w, 20.0f);
}

TEST(Vec4, CompoundScalarDivide) {
    Vec4 a(10.0f, 20.0f, 30.0f, 40.0f);
    a /= 10.0f;
    EXPECT_FLOAT_EQ(a.x, 1.0f);
    EXPECT_FLOAT_EQ(a.y, 2.0f);
    EXPECT_FLOAT_EQ(a.z, 3.0f);
    EXPECT_FLOAT_EQ(a.w, 4.0f);
}

// ============================================================================
// Geometric Operations
// ============================================================================

TEST(Vec4, DotProduct) {
    Vec4 a(1.0f, 2.0f, 3.0f, 4.0f);
    Vec4 b(5.0f, 6.0f, 7.0f, 8.0f);
    // 1*5 + 2*6 + 3*7 + 4*8 = 5 + 12 + 21 + 32 = 70
    EXPECT_FLOAT_EQ(a.dot(b), 70.0f);
}

TEST(Vec4, DotProductOrthogonal) {
    // Unit vectors are orthogonal
    EXPECT_FLOAT_EQ(Vec4::unitX().dot(Vec4::unitY()), 0.0f);
    EXPECT_FLOAT_EQ(Vec4::unitX().dot(Vec4::unitZ()), 0.0f);
    EXPECT_FLOAT_EQ(Vec4::unitX().dot(Vec4::unitW()), 0.0f);
    EXPECT_FLOAT_EQ(Vec4::unitY().dot(Vec4::unitZ()), 0.0f);
    EXPECT_FLOAT_EQ(Vec4::unitY().dot(Vec4::unitW()), 0.0f);
    EXPECT_FLOAT_EQ(Vec4::unitZ().dot(Vec4::unitW()), 0.0f);
}

TEST(Vec4, DotProductFreeFunction) {
    Vec4 a(1.0f, 0.0f, 0.0f, 0.0f);
    Vec4 b(0.0f, 1.0f, 0.0f, 0.0f);
    EXPECT_FLOAT_EQ(dot(a, b), 0.0f);
    EXPECT_FLOAT_EQ(dot(a, a), 1.0f);
}

TEST(Vec4, LengthOfUnitVectors) {
    EXPECT_FLOAT_EQ(Vec4::unitX().length(), 1.0f);
    EXPECT_FLOAT_EQ(Vec4::unitY().length(), 1.0f);
    EXPECT_FLOAT_EQ(Vec4::unitZ().length(), 1.0f);
    EXPECT_FLOAT_EQ(Vec4::unitW().length(), 1.0f);
}

TEST(Vec4, LengthSquared) {
    Vec4 v(1.0f, 2.0f, 3.0f, 4.0f);
    // 1 + 4 + 9 + 16 = 30
    EXPECT_FLOAT_EQ(v.lengthSquared(), 30.0f);
}

TEST(Vec4, LengthGeneral) {
    Vec4 v(3.0f, 4.0f, 0.0f, 0.0f);
    EXPECT_FLOAT_EQ(v.length(), 5.0f);
}

TEST(Vec4, LengthZeroVector) {
    EXPECT_FLOAT_EQ(Vec4::zero().length(), 0.0f);
}

TEST(Vec4, NormalizeUnitVector) {
    Vec4 v = Vec4::unitX().normalized();
    EXPECT_NEAR(v.x, 1.0f, kEpsilon);
    EXPECT_NEAR(v.y, 0.0f, kEpsilon);
    EXPECT_NEAR(v.z, 0.0f, kEpsilon);
    EXPECT_NEAR(v.w, 0.0f, kEpsilon);
}

TEST(Vec4, NormalizeGeneralVector) {
    Vec4 v(3.0f, 4.0f, 0.0f, 0.0f);
    Vec4 n = v.normalized();
    EXPECT_NEAR(n.length(), 1.0f, kEpsilon);
    EXPECT_NEAR(n.x, 0.6f, kEpsilon);
    EXPECT_NEAR(n.y, 0.8f, kEpsilon);
}

TEST(Vec4, NormalizeInPlace) {
    Vec4 v(0.0f, 0.0f, 3.0f, 4.0f);
    v.normalize();
    EXPECT_NEAR(v.length(), 1.0f, kEpsilon);
}

TEST(Vec4, IsNormalized) {
    EXPECT_TRUE(Vec4::unitX().isNormalized());
    EXPECT_TRUE(Vec4::unitY().isNormalized());
    EXPECT_FALSE(Vec4(2.0f, 0.0f, 0.0f, 0.0f).isNormalized());
    EXPECT_FALSE(Vec4::zero().isNormalized());
}

TEST(Vec4, IsZero) {
    EXPECT_TRUE(Vec4::zero().isZero());
    EXPECT_TRUE(Vec4(0.0f, 0.0f, 0.0f, 0.0f).isZero());
    EXPECT_FALSE(Vec4::unitX().isZero());
    EXPECT_FALSE(Vec4(1e-7f, 0.0f, 0.0f, 0.0f).isZero());
}

// ============================================================================
// Distance
// ============================================================================

TEST(Vec4, DistanceToSelf) {
    Vec4 v(1.0f, 2.0f, 3.0f, 4.0f);
    EXPECT_FLOAT_EQ(v.distanceTo(v), 0.0f);
}

TEST(Vec4, DistanceBetweenPoints) {
    Vec4 a(0.0f, 0.0f, 0.0f, 0.0f);
    Vec4 b(3.0f, 4.0f, 0.0f, 0.0f);
    EXPECT_FLOAT_EQ(a.distanceTo(b), 5.0f);
}

TEST(Vec4, DistanceSymmetric) {
    Vec4 a(1.0f, 2.0f, 3.0f, 4.0f);
    Vec4 b(5.0f, 6.0f, 7.0f, 8.0f);
    EXPECT_FLOAT_EQ(a.distanceTo(b), b.distanceTo(a));
}

TEST(Vec4, DistanceFreeFunction) {
    Vec4 a(0.0f, 0.0f, 0.0f, 0.0f);
    Vec4 b(1.0f, 0.0f, 0.0f, 0.0f);
    EXPECT_FLOAT_EQ(distance(a, b), 1.0f);
}

// ============================================================================
// Interpolation
// ============================================================================

TEST(Vec4, LerpEndpoints) {
    Vec4 a(0.0f, 0.0f, 0.0f, 0.0f);
    Vec4 b(10.0f, 20.0f, 30.0f, 40.0f);

    Vec4 start = a.lerp(b, 0.0f);
    EXPECT_FLOAT_EQ(start.x, 0.0f);
    EXPECT_FLOAT_EQ(start.y, 0.0f);

    Vec4 end = a.lerp(b, 1.0f);
    EXPECT_FLOAT_EQ(end.x, 10.0f);
    EXPECT_FLOAT_EQ(end.y, 20.0f);
}

TEST(Vec4, LerpMidpoint) {
    Vec4 a(0.0f, 0.0f, 0.0f, 0.0f);
    Vec4 b(10.0f, 20.0f, 30.0f, 40.0f);
    Vec4 mid = a.lerp(b, 0.5f);
    EXPECT_FLOAT_EQ(mid.x, 5.0f);
    EXPECT_FLOAT_EQ(mid.y, 10.0f);
    EXPECT_FLOAT_EQ(mid.z, 15.0f);
    EXPECT_FLOAT_EQ(mid.w, 20.0f);
}

// ============================================================================
// Component-wise Operations
// ============================================================================

TEST(Vec4, ComponentMin) {
    Vec4 a(1.0f, 5.0f, 3.0f, 8.0f);
    Vec4 b(4.0f, 2.0f, 6.0f, 1.0f);
    Vec4 m = a.min(b);
    EXPECT_FLOAT_EQ(m.x, 1.0f);
    EXPECT_FLOAT_EQ(m.y, 2.0f);
    EXPECT_FLOAT_EQ(m.z, 3.0f);
    EXPECT_FLOAT_EQ(m.w, 1.0f);
}

TEST(Vec4, ComponentMax) {
    Vec4 a(1.0f, 5.0f, 3.0f, 8.0f);
    Vec4 b(4.0f, 2.0f, 6.0f, 1.0f);
    Vec4 m = a.max(b);
    EXPECT_FLOAT_EQ(m.x, 4.0f);
    EXPECT_FLOAT_EQ(m.y, 5.0f);
    EXPECT_FLOAT_EQ(m.z, 6.0f);
    EXPECT_FLOAT_EQ(m.w, 8.0f);
}

TEST(Vec4, Abs) {
    Vec4 v(-1.0f, 2.0f, -3.0f, 4.0f);
    Vec4 a = v.abs();
    EXPECT_FLOAT_EQ(a.x, 1.0f);
    EXPECT_FLOAT_EQ(a.y, 2.0f);
    EXPECT_FLOAT_EQ(a.z, 3.0f);
    EXPECT_FLOAT_EQ(a.w, 4.0f);
}

TEST(Vec4, Clamp) {
    Vec4 v(-1.0f, 0.5f, 2.0f, 0.0f);
    Vec4 lo(0.0f, 0.0f, 0.0f, 0.0f);
    Vec4 hi(1.0f, 1.0f, 1.0f, 1.0f);
    Vec4 c = v.clamp(lo, hi);
    EXPECT_FLOAT_EQ(c.x, 0.0f);
    EXPECT_FLOAT_EQ(c.y, 0.5f);
    EXPECT_FLOAT_EQ(c.z, 1.0f);
    EXPECT_FLOAT_EQ(c.w, 0.0f);
}

// ============================================================================
// Projection and Reflection
// ============================================================================

TEST(Vec4, ProjectOnto) {
    Vec4 v(3.0f, 4.0f, 0.0f, 0.0f);
    Vec4 onto(1.0f, 0.0f, 0.0f, 0.0f);
    Vec4 proj = v.projectOnto(onto);
    EXPECT_NEAR(proj.x, 3.0f, kEpsilon);
    EXPECT_NEAR(proj.y, 0.0f, kEpsilon);
    EXPECT_NEAR(proj.z, 0.0f, kEpsilon);
    EXPECT_NEAR(proj.w, 0.0f, kEpsilon);
}

TEST(Vec4, ReflectAcrossNormal) {
    // Reflect (1, -1, 0, 0) across the Y-axis normal (0, 1, 0, 0)
    Vec4 v(1.0f, -1.0f, 0.0f, 0.0f);
    Vec4 normal(0.0f, 1.0f, 0.0f, 0.0f);
    Vec4 r = v.reflect(normal);
    EXPECT_NEAR(r.x, 1.0f, kEpsilon);
    EXPECT_NEAR(r.y, 1.0f, kEpsilon);
}

// ============================================================================
// Comparison
// ============================================================================

TEST(Vec4, Equality) {
    Vec4 a(1.0f, 2.0f, 3.0f, 4.0f);
    Vec4 b(1.0f, 2.0f, 3.0f, 4.0f);
    EXPECT_TRUE(a == b);
    EXPECT_FALSE(a != b);
}

TEST(Vec4, Inequality) {
    Vec4 a(1.0f, 2.0f, 3.0f, 4.0f);
    Vec4 b(1.0f, 2.0f, 3.0f, 5.0f);
    EXPECT_FALSE(a == b);
    EXPECT_TRUE(a != b);
}

// ============================================================================
// Data Pointer
// ============================================================================

TEST(Vec4, DataPointerAccess) {
    Vec4 v(1.0f, 2.0f, 3.0f, 4.0f);
    const float* p = v.ptr();
    EXPECT_FLOAT_EQ(p[0], 1.0f);
    EXPECT_FLOAT_EQ(p[1], 2.0f);
    EXPECT_FLOAT_EQ(p[2], 3.0f);
    EXPECT_FLOAT_EQ(p[3], 4.0f);
}

// ============================================================================
// 4D -> 3D Projections (member functions)
// ============================================================================

TEST(Vec4, PerspectiveProjectionAtOrigin) {
    Vec4 v(0.0f, 0.0f, 0.0f, 0.0f);
    auto proj = v.projectPerspective(2.0f);
    EXPECT_NEAR(proj[0], 0.0f, kEpsilon);
    EXPECT_NEAR(proj[1], 0.0f, kEpsilon);
    EXPECT_NEAR(proj[2], 0.0f, kEpsilon);
}

TEST(Vec4, StereographicProjectionAtOrigin) {
    Vec4 v(0.0f, 0.0f, 0.0f, 0.0f);
    auto proj = v.projectStereographic();
    EXPECT_NEAR(proj[0], 0.0f, kEpsilon);
    EXPECT_NEAR(proj[1], 0.0f, kEpsilon);
    EXPECT_NEAR(proj[2], 0.0f, kEpsilon);
}

TEST(Vec4, OrthographicProjectionDropsW) {
    Vec4 v(1.0f, 2.0f, 3.0f, 99.0f);
    auto proj = v.projectOrthographic();
    EXPECT_FLOAT_EQ(proj[0], 1.0f);
    EXPECT_FLOAT_EQ(proj[1], 2.0f);
    EXPECT_FLOAT_EQ(proj[2], 3.0f);
}
