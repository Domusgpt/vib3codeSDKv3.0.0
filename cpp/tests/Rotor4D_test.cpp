/**
 * Rotor4D_test.cpp - Unit tests for Rotor4D 4D rotation class
 *
 * Tests identity construction, plane-angle rotors, Euler6 composition,
 * sandwich product rotation, normalization, and reverse (conjugate).
 */

#include <gtest/gtest.h>
#include "math/Rotor4D.hpp"
#include "math/Vec4.hpp"
#include <cmath>
#include <numbers>

using namespace vib3;

static constexpr float kEpsilon = 1e-4f;
static constexpr float kPi = std::numbers::pi_v<float>;
static constexpr float kHalfPi = kPi / 2.0f;

// ============================================================================
// Identity Rotor
// ============================================================================

TEST(Rotor4D, DefaultConstructorIsIdentity) {
    Rotor4D r;
    EXPECT_FLOAT_EQ(r.s, 1.0f);
    EXPECT_FLOAT_EQ(r.xy, 0.0f);
    EXPECT_FLOAT_EQ(r.xz, 0.0f);
    EXPECT_FLOAT_EQ(r.yz, 0.0f);
    EXPECT_FLOAT_EQ(r.xw, 0.0f);
    EXPECT_FLOAT_EQ(r.yw, 0.0f);
    EXPECT_FLOAT_EQ(r.zw, 0.0f);
    EXPECT_FLOAT_EQ(r.xyzw, 0.0f);
}

TEST(Rotor4D, IdentityFactory) {
    Rotor4D r = Rotor4D::identity();
    EXPECT_FLOAT_EQ(r.s, 1.0f);
    EXPECT_FLOAT_EQ(r.xy, 0.0f);
    EXPECT_FLOAT_EQ(r.xz, 0.0f);
    EXPECT_FLOAT_EQ(r.yz, 0.0f);
    EXPECT_FLOAT_EQ(r.xw, 0.0f);
    EXPECT_FLOAT_EQ(r.yw, 0.0f);
    EXPECT_FLOAT_EQ(r.zw, 0.0f);
    EXPECT_FLOAT_EQ(r.xyzw, 0.0f);
}

TEST(Rotor4D, IdentityIsNormalized) {
    Rotor4D r = Rotor4D::identity();
    EXPECT_TRUE(r.isNormalized());
    EXPECT_NEAR(r.magnitude(), 1.0f, kEpsilon);
}

TEST(Rotor4D, IdentityRotationDoesNothing) {
    Rotor4D r = Rotor4D::identity();
    Vec4 v(1.0f, 2.0f, 3.0f, 4.0f);
    Vec4 rotated = r.rotate(v);
    EXPECT_NEAR(rotated.x, v.x, kEpsilon);
    EXPECT_NEAR(rotated.y, v.y, kEpsilon);
    EXPECT_NEAR(rotated.z, v.z, kEpsilon);
    EXPECT_NEAR(rotated.w, v.w, kEpsilon);
}

// ============================================================================
// fromPlaneAngle
// ============================================================================

TEST(Rotor4D, FromPlaneAngleZeroIsIdentity) {
    Rotor4D r = Rotor4D::fromPlaneAngle(RotationPlane::XY, 0.0f);
    EXPECT_NEAR(r.s, 1.0f, kEpsilon);
    EXPECT_NEAR(r.magnitude(), 1.0f, kEpsilon);
}

TEST(Rotor4D, FromPlaneAngleXY_HalfTurn) {
    // A rotor encoding angle theta has s = cos(theta/2), bivector = -sin(theta/2)
    Rotor4D r = Rotor4D::fromPlaneAngle(RotationPlane::XY, kPi);
    EXPECT_NEAR(r.s, std::cos(kPi / 2.0f), kEpsilon);
    EXPECT_TRUE(r.isNormalized());
}

TEST(Rotor4D, FromPlaneAngleXY_RotatesXtoY) {
    // Rotating unitX by pi/2 in the XY plane should give unitY
    Rotor4D r = Rotor4D::fromPlaneAngle(RotationPlane::XY, kHalfPi);
    Vec4 result = r.rotate(Vec4::unitX());
    EXPECT_NEAR(result.x, 0.0f, kEpsilon);
    EXPECT_NEAR(result.y, 1.0f, kEpsilon);
    EXPECT_NEAR(result.z, 0.0f, kEpsilon);
    EXPECT_NEAR(result.w, 0.0f, kEpsilon);
}

TEST(Rotor4D, FromPlaneAngleXY_RotatesYtoNegX) {
    // Rotating unitY by pi/2 in XY plane should give -unitX
    Rotor4D r = Rotor4D::fromPlaneAngle(RotationPlane::XY, kHalfPi);
    Vec4 result = r.rotate(Vec4::unitY());
    EXPECT_NEAR(result.x, -1.0f, kEpsilon);
    EXPECT_NEAR(result.y, 0.0f, kEpsilon);
    EXPECT_NEAR(result.z, 0.0f, kEpsilon);
    EXPECT_NEAR(result.w, 0.0f, kEpsilon);
}

TEST(Rotor4D, FromPlaneAngleXZ_RotatesXtoZ) {
    Rotor4D r = Rotor4D::fromPlaneAngle(RotationPlane::XZ, kHalfPi);
    Vec4 result = r.rotate(Vec4::unitX());
    EXPECT_NEAR(result.x, 0.0f, kEpsilon);
    EXPECT_NEAR(result.y, 0.0f, kEpsilon);
    EXPECT_NEAR(result.z, 1.0f, kEpsilon);
    EXPECT_NEAR(result.w, 0.0f, kEpsilon);
}

TEST(Rotor4D, FromPlaneAngleYZ_RotatesYtoZ) {
    Rotor4D r = Rotor4D::fromPlaneAngle(RotationPlane::YZ, kHalfPi);
    Vec4 result = r.rotate(Vec4::unitY());
    EXPECT_NEAR(result.x, 0.0f, kEpsilon);
    EXPECT_NEAR(result.y, 0.0f, kEpsilon);
    EXPECT_NEAR(result.z, 1.0f, kEpsilon);
    EXPECT_NEAR(result.w, 0.0f, kEpsilon);
}

TEST(Rotor4D, FromPlaneAngleXW_RotatesXtoW) {
    // 4D rotation: XW plane, pi/2 should rotate X -> W
    Rotor4D r = Rotor4D::fromPlaneAngle(RotationPlane::XW, kHalfPi);
    Vec4 result = r.rotate(Vec4::unitX());
    EXPECT_NEAR(result.x, 0.0f, kEpsilon);
    EXPECT_NEAR(result.y, 0.0f, kEpsilon);
    EXPECT_NEAR(result.z, 0.0f, kEpsilon);
    EXPECT_NEAR(result.w, 1.0f, kEpsilon);
}

TEST(Rotor4D, FromPlaneAngleYW_RotatesYtoW) {
    Rotor4D r = Rotor4D::fromPlaneAngle(RotationPlane::YW, kHalfPi);
    Vec4 result = r.rotate(Vec4::unitY());
    EXPECT_NEAR(result.x, 0.0f, kEpsilon);
    EXPECT_NEAR(result.y, 0.0f, kEpsilon);
    EXPECT_NEAR(result.z, 0.0f, kEpsilon);
    EXPECT_NEAR(result.w, 1.0f, kEpsilon);
}

TEST(Rotor4D, FromPlaneAngleZW_RotatesZtoW) {
    Rotor4D r = Rotor4D::fromPlaneAngle(RotationPlane::ZW, kHalfPi);
    Vec4 result = r.rotate(Vec4::unitZ());
    EXPECT_NEAR(result.x, 0.0f, kEpsilon);
    EXPECT_NEAR(result.y, 0.0f, kEpsilon);
    EXPECT_NEAR(result.z, 0.0f, kEpsilon);
    EXPECT_NEAR(result.w, 1.0f, kEpsilon);
}

TEST(Rotor4D, PlaneRotationPreservesOrthogonalAxes) {
    // Rotation in XY plane should not affect Z or W components
    Rotor4D r = Rotor4D::fromPlaneAngle(RotationPlane::XY, kHalfPi);
    Vec4 zResult = r.rotate(Vec4::unitZ());
    EXPECT_NEAR(zResult.x, 0.0f, kEpsilon);
    EXPECT_NEAR(zResult.y, 0.0f, kEpsilon);
    EXPECT_NEAR(zResult.z, 1.0f, kEpsilon);
    EXPECT_NEAR(zResult.w, 0.0f, kEpsilon);

    Vec4 wResult = r.rotate(Vec4::unitW());
    EXPECT_NEAR(wResult.x, 0.0f, kEpsilon);
    EXPECT_NEAR(wResult.y, 0.0f, kEpsilon);
    EXPECT_NEAR(wResult.z, 0.0f, kEpsilon);
    EXPECT_NEAR(wResult.w, 1.0f, kEpsilon);
}

// ============================================================================
// fromEuler6
// ============================================================================

TEST(Rotor4D, FromEuler6AllZerosIsIdentity) {
    Rotor4D r = Rotor4D::fromEuler6(0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f);
    EXPECT_NEAR(r.s, 1.0f, kEpsilon);
    EXPECT_TRUE(r.isNormalized());

    // Verify it acts as identity
    Vec4 v(1.0f, 2.0f, 3.0f, 4.0f);
    Vec4 result = r.rotate(v);
    EXPECT_NEAR(result.x, v.x, kEpsilon);
    EXPECT_NEAR(result.y, v.y, kEpsilon);
    EXPECT_NEAR(result.z, v.z, kEpsilon);
    EXPECT_NEAR(result.w, v.w, kEpsilon);
}

TEST(Rotor4D, FromEuler6ArrayOverload) {
    std::array<float, 6> angles = {0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f};
    Rotor4D r = Rotor4D::fromEuler6(angles);
    EXPECT_NEAR(r.s, 1.0f, kEpsilon);
    EXPECT_TRUE(r.isNormalized());
}

TEST(Rotor4D, FromEuler6SinglePlaneMatchesFromPlaneAngle) {
    float angle = 0.7f;
    Rotor4D fromEuler = Rotor4D::fromEuler6(angle, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f);
    Rotor4D fromPlane = Rotor4D::fromPlaneAngle(RotationPlane::XY, angle);

    // They should produce the same rotation on any vector
    Vec4 test(1.0f, 1.0f, 1.0f, 1.0f);
    Vec4 r1 = fromEuler.rotate(test);
    Vec4 r2 = fromPlane.rotate(test);
    EXPECT_NEAR(r1.x, r2.x, kEpsilon);
    EXPECT_NEAR(r1.y, r2.y, kEpsilon);
    EXPECT_NEAR(r1.z, r2.z, kEpsilon);
    EXPECT_NEAR(r1.w, r2.w, kEpsilon);
}

TEST(Rotor4D, FromEuler6ProducesNormalizedRotor) {
    Rotor4D r = Rotor4D::fromEuler6(0.5f, 0.3f, 0.2f, 0.1f, 0.4f, 0.6f);
    // The composed rotor should still be approximately unit
    EXPECT_NEAR(r.magnitude(), 1.0f, 0.01f);
}

// ============================================================================
// Normalization
// ============================================================================

TEST(Rotor4D, NormalizeMaintainsUnit) {
    Rotor4D r = Rotor4D::fromPlaneAngle(RotationPlane::XY, 1.0f);
    r.normalize();
    EXPECT_NEAR(r.magnitude(), 1.0f, kEpsilon);
    EXPECT_TRUE(r.isNormalized());
}

TEST(Rotor4D, NormalizedReturnsUnitRotor) {
    // Manually create a non-unit rotor
    Rotor4D r(2.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f);
    Rotor4D n = r.normalized();
    EXPECT_NEAR(n.magnitude(), 1.0f, kEpsilon);
    EXPECT_NEAR(n.s, 1.0f, kEpsilon);
}

TEST(Rotor4D, MagnitudeSquared) {
    Rotor4D r = Rotor4D::identity();
    EXPECT_NEAR(r.magnitudeSquared(), 1.0f, kEpsilon);
}

// ============================================================================
// Reverse (Conjugate)
// ============================================================================

TEST(Rotor4D, ReverseNegatesBivectors) {
    Rotor4D r(1.0f, 0.1f, 0.2f, 0.3f, 0.4f, 0.5f, 0.6f, 0.7f);
    Rotor4D rev = r.reverse();

    // Scalar stays the same
    EXPECT_FLOAT_EQ(rev.s, r.s);
    // Bivectors are negated
    EXPECT_FLOAT_EQ(rev.xy, -r.xy);
    EXPECT_FLOAT_EQ(rev.xz, -r.xz);
    EXPECT_FLOAT_EQ(rev.yz, -r.yz);
    EXPECT_FLOAT_EQ(rev.xw, -r.xw);
    EXPECT_FLOAT_EQ(rev.yw, -r.yw);
    EXPECT_FLOAT_EQ(rev.zw, -r.zw);
    // Pseudoscalar: grade-4 element, reverse keeps it the same
    EXPECT_FLOAT_EQ(rev.xyzw, r.xyzw);
}

TEST(Rotor4D, ReverseOfIdentityIsIdentity) {
    Rotor4D r = Rotor4D::identity();
    Rotor4D rev = r.reverse();
    EXPECT_FLOAT_EQ(rev.s, 1.0f);
    EXPECT_FLOAT_EQ(rev.xy, 0.0f);
    EXPECT_FLOAT_EQ(rev.xz, 0.0f);
    EXPECT_FLOAT_EQ(rev.yz, 0.0f);
}

TEST(Rotor4D, RotorTimesReverseGivesIdentityRotation) {
    // R * R_reverse should produce identity rotation
    Rotor4D r = Rotor4D::fromPlaneAngle(RotationPlane::XY, 1.0f);
    Rotor4D product = r * r.reverse();

    // The result should act as identity on any vector
    Vec4 v(1.0f, 2.0f, 3.0f, 4.0f);
    Vec4 result = product.rotate(v);
    EXPECT_NEAR(result.x, v.x, kEpsilon);
    EXPECT_NEAR(result.y, v.y, kEpsilon);
    EXPECT_NEAR(result.z, v.z, kEpsilon);
    EXPECT_NEAR(result.w, v.w, kEpsilon);
}

// ============================================================================
// Rotor Composition
// ============================================================================

TEST(Rotor4D, IdentityTimesRotorIsRotor) {
    Rotor4D id = Rotor4D::identity();
    Rotor4D r = Rotor4D::fromPlaneAngle(RotationPlane::XZ, 0.5f);
    Rotor4D product = id * r;

    Vec4 test(1.0f, 0.0f, 0.0f, 0.0f);
    Vec4 r1 = product.rotate(test);
    Vec4 r2 = r.rotate(test);
    EXPECT_NEAR(r1.x, r2.x, kEpsilon);
    EXPECT_NEAR(r1.y, r2.y, kEpsilon);
    EXPECT_NEAR(r1.z, r2.z, kEpsilon);
    EXPECT_NEAR(r1.w, r2.w, kEpsilon);
}

TEST(Rotor4D, TwoHalfTurnsMakeFullTurn) {
    // Two 90-degree rotations = 180-degree rotation
    Rotor4D half = Rotor4D::fromPlaneAngle(RotationPlane::XY, kHalfPi);
    Rotor4D full = half * half;

    // unitX rotated by pi in XY plane should become -unitX
    Vec4 result = full.rotate(Vec4::unitX());
    EXPECT_NEAR(result.x, -1.0f, kEpsilon);
    EXPECT_NEAR(result.y, 0.0f, kEpsilon);
    EXPECT_NEAR(result.z, 0.0f, kEpsilon);
    EXPECT_NEAR(result.w, 0.0f, kEpsilon);
}

// ============================================================================
// Rotation preserves length
// ============================================================================

TEST(Rotor4D, RotationPreservesLength) {
    Rotor4D r = Rotor4D::fromEuler6(0.5f, 0.3f, 0.7f, 0.2f, 0.4f, 0.1f);
    Vec4 v(1.0f, 2.0f, 3.0f, 4.0f);
    Vec4 rotated = r.rotate(v);
    EXPECT_NEAR(rotated.length(), v.length(), kEpsilon);
}

TEST(Rotor4D, RotationPreservesZeroVector) {
    Rotor4D r = Rotor4D::fromPlaneAngle(RotationPlane::XW, 1.0f);
    Vec4 result = r.rotate(Vec4::zero());
    EXPECT_NEAR(result.x, 0.0f, kEpsilon);
    EXPECT_NEAR(result.y, 0.0f, kEpsilon);
    EXPECT_NEAR(result.z, 0.0f, kEpsilon);
    EXPECT_NEAR(result.w, 0.0f, kEpsilon);
}

// ============================================================================
// Inverse
// ============================================================================

TEST(Rotor4D, InverseUndoesRotation) {
    Rotor4D r = Rotor4D::fromPlaneAngle(RotationPlane::YZ, 0.8f);
    Rotor4D inv = r.inverse();
    Vec4 v(1.0f, 2.0f, 3.0f, 4.0f);
    Vec4 rotated = r.rotate(v);
    Vec4 unrotated = inv.rotate(rotated);
    EXPECT_NEAR(unrotated.x, v.x, kEpsilon);
    EXPECT_NEAR(unrotated.y, v.y, kEpsilon);
    EXPECT_NEAR(unrotated.z, v.z, kEpsilon);
    EXPECT_NEAR(unrotated.w, v.w, kEpsilon);
}

// ============================================================================
// Matrix Conversion
// ============================================================================

TEST(Rotor4D, IdentityRotorGivesIdentityMatrix) {
    Rotor4D r = Rotor4D::identity();
    Mat4x4 m = r.toMatrix();
    EXPECT_TRUE(m.isIdentity());
}

TEST(Rotor4D, MatrixRotationMatchesSandwichProduct) {
    Rotor4D r = Rotor4D::fromPlaneAngle(RotationPlane::XY, kHalfPi);
    Mat4x4 m = r.toMatrix();

    Vec4 v = Vec4::unitX();
    Vec4 rotorResult = r.rotate(v);
    Vec4 matResult = m * v;

    EXPECT_NEAR(rotorResult.x, matResult.x, kEpsilon);
    EXPECT_NEAR(rotorResult.y, matResult.y, kEpsilon);
    EXPECT_NEAR(rotorResult.z, matResult.z, kEpsilon);
    EXPECT_NEAR(rotorResult.w, matResult.w, kEpsilon);
}

// ============================================================================
// Interpolation
// ============================================================================

TEST(Rotor4D, SlerpEndpoints) {
    Rotor4D a = Rotor4D::identity();
    Rotor4D b = Rotor4D::fromPlaneAngle(RotationPlane::XY, kPi);

    // t=0 should give a
    Rotor4D s0 = a.slerp(b, 0.0f);
    Vec4 v0 = s0.rotate(Vec4::unitX());
    Vec4 va = a.rotate(Vec4::unitX());
    EXPECT_NEAR(v0.x, va.x, kEpsilon);
    EXPECT_NEAR(v0.y, va.y, kEpsilon);

    // t=1 should give b
    Rotor4D s1 = a.slerp(b, 1.0f);
    Vec4 v1 = s1.rotate(Vec4::unitX());
    Vec4 vb = b.rotate(Vec4::unitX());
    EXPECT_NEAR(v1.x, vb.x, kEpsilon);
    EXPECT_NEAR(v1.y, vb.y, kEpsilon);
}

// ============================================================================
// Comparison and toArray
// ============================================================================

TEST(Rotor4D, EqualityOperator) {
    Rotor4D a = Rotor4D::identity();
    Rotor4D b = Rotor4D::identity();
    EXPECT_TRUE(a == b);
}

TEST(Rotor4D, ToArrayRoundTrip) {
    Rotor4D r(1.0f, 0.1f, 0.2f, 0.3f, 0.4f, 0.5f, 0.6f, 0.7f);
    auto arr = r.toArray();
    EXPECT_EQ(arr.size(), 8u);
    EXPECT_FLOAT_EQ(arr[0], r.s);
    EXPECT_FLOAT_EQ(arr[1], r.xy);
    EXPECT_FLOAT_EQ(arr[2], r.xz);
    EXPECT_FLOAT_EQ(arr[3], r.yz);
    EXPECT_FLOAT_EQ(arr[4], r.xw);
    EXPECT_FLOAT_EQ(arr[5], r.yw);
    EXPECT_FLOAT_EQ(arr[6], r.zw);
    EXPECT_FLOAT_EQ(arr[7], r.xyzw);
}

// ============================================================================
// Dot product between rotors
// ============================================================================

TEST(Rotor4D, DotProductWithSelf) {
    Rotor4D r = Rotor4D::fromPlaneAngle(RotationPlane::XY, 0.5f);
    float d = r.dot(r);
    EXPECT_NEAR(d, r.magnitudeSquared(), kEpsilon);
}
