/**
 * Mat4x4_test.cpp - Unit tests for Mat4x4 4x4 matrix class
 *
 * Tests identity construction, matrix-vector multiplication, matrix-matrix
 * multiplication, determinant, transpose, rotation factories, and inversion.
 */

#include <gtest/gtest.h>
#include "math/Mat4x4.hpp"
#include "math/Vec4.hpp"
#include <cmath>
#include <numbers>

using namespace vib3;

static constexpr float kEpsilon = 1e-4f;
static constexpr float kPi = std::numbers::pi_v<float>;
static constexpr float kHalfPi = kPi / 2.0f;

// ============================================================================
// Construction
// ============================================================================

TEST(Mat4x4, DefaultConstructorIsIdentity) {
    Mat4x4 m;
    EXPECT_TRUE(m.isIdentity());
}

TEST(Mat4x4, IdentityFactory) {
    Mat4x4 m = Mat4x4::identity();
    EXPECT_TRUE(m.isIdentity());

    // Verify diagonal is 1, off-diagonal is 0
    for (size_t r = 0; r < 4; ++r) {
        for (size_t c = 0; c < 4; ++c) {
            if (r == c) {
                EXPECT_FLOAT_EQ(m.at(r, c), 1.0f);
            } else {
                EXPECT_FLOAT_EQ(m.at(r, c), 0.0f);
            }
        }
    }
}

TEST(Mat4x4, ZeroFactory) {
    Mat4x4 m = Mat4x4::zero();
    for (size_t r = 0; r < 4; ++r) {
        for (size_t c = 0; c < 4; ++c) {
            EXPECT_FLOAT_EQ(m.at(r, c), 0.0f);
        }
    }
}

TEST(Mat4x4, DiagonalConstructor) {
    Mat4x4 m(3.0f);
    EXPECT_FLOAT_EQ(m.at(0, 0), 3.0f);
    EXPECT_FLOAT_EQ(m.at(1, 1), 3.0f);
    EXPECT_FLOAT_EQ(m.at(2, 2), 3.0f);
    EXPECT_FLOAT_EQ(m.at(3, 3), 3.0f);
    EXPECT_FLOAT_EQ(m.at(0, 1), 0.0f);
    EXPECT_FLOAT_EQ(m.at(1, 0), 0.0f);
}

TEST(Mat4x4, ColumnConstructor) {
    Vec4 c0(1.0f, 0.0f, 0.0f, 0.0f);
    Vec4 c1(0.0f, 2.0f, 0.0f, 0.0f);
    Vec4 c2(0.0f, 0.0f, 3.0f, 0.0f);
    Vec4 c3(0.0f, 0.0f, 0.0f, 4.0f);
    Mat4x4 m(c0, c1, c2, c3);
    EXPECT_FLOAT_EQ(m.at(0, 0), 1.0f);
    EXPECT_FLOAT_EQ(m.at(1, 1), 2.0f);
    EXPECT_FLOAT_EQ(m.at(2, 2), 3.0f);
    EXPECT_FLOAT_EQ(m.at(3, 3), 4.0f);
}

// ============================================================================
// Element Access
// ============================================================================

TEST(Mat4x4, ColumnAccess) {
    Mat4x4 m = Mat4x4::identity();
    Vec4 col0 = m.column(0);
    EXPECT_FLOAT_EQ(col0.x, 1.0f);
    EXPECT_FLOAT_EQ(col0.y, 0.0f);
    EXPECT_FLOAT_EQ(col0.z, 0.0f);
    EXPECT_FLOAT_EQ(col0.w, 0.0f);
}

TEST(Mat4x4, RowAccess) {
    Mat4x4 m = Mat4x4::identity();
    Vec4 row0 = m.row(0);
    EXPECT_FLOAT_EQ(row0.x, 1.0f);
    EXPECT_FLOAT_EQ(row0.y, 0.0f);
    EXPECT_FLOAT_EQ(row0.z, 0.0f);
    EXPECT_FLOAT_EQ(row0.w, 0.0f);
}

TEST(Mat4x4, SetColumn) {
    Mat4x4 m = Mat4x4::zero();
    m.setColumn(1, Vec4(10.0f, 20.0f, 30.0f, 40.0f));
    EXPECT_FLOAT_EQ(m.at(0, 1), 10.0f);
    EXPECT_FLOAT_EQ(m.at(1, 1), 20.0f);
    EXPECT_FLOAT_EQ(m.at(2, 1), 30.0f);
    EXPECT_FLOAT_EQ(m.at(3, 1), 40.0f);
}

TEST(Mat4x4, SetRow) {
    Mat4x4 m = Mat4x4::zero();
    m.setRow(2, Vec4(10.0f, 20.0f, 30.0f, 40.0f));
    EXPECT_FLOAT_EQ(m.at(2, 0), 10.0f);
    EXPECT_FLOAT_EQ(m.at(2, 1), 20.0f);
    EXPECT_FLOAT_EQ(m.at(2, 2), 30.0f);
    EXPECT_FLOAT_EQ(m.at(2, 3), 40.0f);
}

// ============================================================================
// Matrix-Vector Multiplication
// ============================================================================

TEST(Mat4x4, IdentityTimesVectorIsVector) {
    Mat4x4 m = Mat4x4::identity();
    Vec4 v(1.0f, 2.0f, 3.0f, 4.0f);
    Vec4 result = m * v;
    EXPECT_FLOAT_EQ(result.x, 1.0f);
    EXPECT_FLOAT_EQ(result.y, 2.0f);
    EXPECT_FLOAT_EQ(result.z, 3.0f);
    EXPECT_FLOAT_EQ(result.w, 4.0f);
}

TEST(Mat4x4, ZeroMatrixTimesVectorIsZero) {
    Mat4x4 m = Mat4x4::zero();
    Vec4 v(1.0f, 2.0f, 3.0f, 4.0f);
    Vec4 result = m * v;
    EXPECT_FLOAT_EQ(result.x, 0.0f);
    EXPECT_FLOAT_EQ(result.y, 0.0f);
    EXPECT_FLOAT_EQ(result.z, 0.0f);
    EXPECT_FLOAT_EQ(result.w, 0.0f);
}

TEST(Mat4x4, MultiplyVec4MatchesOperator) {
    Mat4x4 m = Mat4x4::identity();
    Vec4 v(1.0f, 2.0f, 3.0f, 4.0f);
    Vec4 r1 = m * v;
    Vec4 r2 = m.multiplyVec4(v);
    EXPECT_FLOAT_EQ(r1.x, r2.x);
    EXPECT_FLOAT_EQ(r1.y, r2.y);
    EXPECT_FLOAT_EQ(r1.z, r2.z);
    EXPECT_FLOAT_EQ(r1.w, r2.w);
}

TEST(Mat4x4, ScaleMatrixTimesVector) {
    Mat4x4 m = Mat4x4::scale(2.0f, 3.0f, 4.0f, 5.0f);
    Vec4 v(1.0f, 1.0f, 1.0f, 1.0f);
    Vec4 result = m * v;
    EXPECT_NEAR(result.x, 2.0f, kEpsilon);
    EXPECT_NEAR(result.y, 3.0f, kEpsilon);
    EXPECT_NEAR(result.z, 4.0f, kEpsilon);
    EXPECT_NEAR(result.w, 5.0f, kEpsilon);
}

// ============================================================================
// Matrix-Matrix Multiplication
// ============================================================================

TEST(Mat4x4, IdentityTimesIdentityIsIdentity) {
    Mat4x4 a = Mat4x4::identity();
    Mat4x4 b = Mat4x4::identity();
    Mat4x4 result = a * b;
    EXPECT_TRUE(result.isIdentity());
}

TEST(Mat4x4, IdentityTimesMatrixIsMatrix) {
    Mat4x4 m = Mat4x4::scale(2.0f);
    Mat4x4 result = Mat4x4::identity() * m;
    for (size_t r = 0; r < 4; ++r) {
        for (size_t c = 0; c < 4; ++c) {
            EXPECT_NEAR(result.at(r, c), m.at(r, c), kEpsilon);
        }
    }
}

TEST(Mat4x4, MatrixTimesIdentityIsMatrix) {
    Mat4x4 m = Mat4x4::scale(3.0f);
    Mat4x4 result = m * Mat4x4::identity();
    for (size_t r = 0; r < 4; ++r) {
        for (size_t c = 0; c < 4; ++c) {
            EXPECT_NEAR(result.at(r, c), m.at(r, c), kEpsilon);
        }
    }
}

TEST(Mat4x4, ScaleMatrixMultiplication) {
    Mat4x4 s2 = Mat4x4::scale(2.0f);
    Mat4x4 s3 = Mat4x4::scale(3.0f);
    Mat4x4 result = s2 * s3;
    // scale(2) * scale(3) = scale(6)
    EXPECT_NEAR(result.at(0, 0), 6.0f, kEpsilon);
    EXPECT_NEAR(result.at(1, 1), 6.0f, kEpsilon);
    EXPECT_NEAR(result.at(2, 2), 6.0f, kEpsilon);
    EXPECT_NEAR(result.at(3, 3), 6.0f, kEpsilon);
}

TEST(Mat4x4, CompoundMultiplication) {
    Mat4x4 m = Mat4x4::identity();
    m *= Mat4x4::scale(2.0f);
    EXPECT_NEAR(m.at(0, 0), 2.0f, kEpsilon);
    EXPECT_NEAR(m.at(1, 1), 2.0f, kEpsilon);
}

// ============================================================================
// Scalar Operations
// ============================================================================

TEST(Mat4x4, ScalarMultiplication) {
    Mat4x4 m = Mat4x4::identity();
    Mat4x4 result = m * 3.0f;
    EXPECT_NEAR(result.at(0, 0), 3.0f, kEpsilon);
    EXPECT_NEAR(result.at(1, 1), 3.0f, kEpsilon);
    EXPECT_NEAR(result.at(0, 1), 0.0f, kEpsilon);
}

TEST(Mat4x4, ScalarMultiplicationFreeFunction) {
    Mat4x4 m = Mat4x4::identity();
    Mat4x4 result = 5.0f * m;
    EXPECT_NEAR(result.at(0, 0), 5.0f, kEpsilon);
}

// ============================================================================
// Addition and Subtraction
// ============================================================================

TEST(Mat4x4, MatrixAddition) {
    Mat4x4 a = Mat4x4::identity();
    Mat4x4 b = Mat4x4::identity();
    Mat4x4 result = a + b;
    EXPECT_NEAR(result.at(0, 0), 2.0f, kEpsilon);
    EXPECT_NEAR(result.at(1, 1), 2.0f, kEpsilon);
    EXPECT_NEAR(result.at(0, 1), 0.0f, kEpsilon);
}

TEST(Mat4x4, MatrixSubtraction) {
    Mat4x4 a = Mat4x4::identity();
    Mat4x4 b = Mat4x4::identity();
    Mat4x4 result = a - b;
    // Should be zero matrix
    for (size_t r = 0; r < 4; ++r) {
        for (size_t c = 0; c < 4; ++c) {
            EXPECT_NEAR(result.at(r, c), 0.0f, kEpsilon);
        }
    }
}

// ============================================================================
// Determinant
// ============================================================================

TEST(Mat4x4, DeterminantOfIdentityIsOne) {
    Mat4x4 m = Mat4x4::identity();
    EXPECT_NEAR(m.determinant(), 1.0f, kEpsilon);
}

TEST(Mat4x4, DeterminantOfZeroIsZero) {
    Mat4x4 m = Mat4x4::zero();
    EXPECT_NEAR(m.determinant(), 0.0f, kEpsilon);
}

TEST(Mat4x4, DeterminantOfScaleMatrix) {
    Mat4x4 m = Mat4x4::scale(2.0f, 3.0f, 4.0f, 5.0f);
    // det(diag(2,3,4,5)) = 2*3*4*5 = 120
    EXPECT_NEAR(m.determinant(), 120.0f, kEpsilon);
}

TEST(Mat4x4, DeterminantOfUniformScale) {
    Mat4x4 m = Mat4x4::scale(2.0f);
    // det(2*I) = 2^4 = 16
    EXPECT_NEAR(m.determinant(), 16.0f, kEpsilon);
}

TEST(Mat4x4, DeterminantOfRotationIsOne) {
    // Rotation matrices have determinant 1
    Mat4x4 m = Mat4x4::rotationXY(0.5f);
    EXPECT_NEAR(m.determinant(), 1.0f, kEpsilon);
}

// ============================================================================
// Transpose
// ============================================================================

TEST(Mat4x4, TransposeOfIdentityIsIdentity) {
    Mat4x4 m = Mat4x4::identity();
    Mat4x4 t = m.transposed();
    EXPECT_TRUE(t.isIdentity());
}

TEST(Mat4x4, TransposeSwapsElements) {
    Mat4x4 m = Mat4x4::zero();
    m.at(0, 1) = 5.0f;
    m.at(1, 0) = 10.0f;
    Mat4x4 t = m.transposed();
    EXPECT_FLOAT_EQ(t.at(0, 1), 10.0f);
    EXPECT_FLOAT_EQ(t.at(1, 0), 5.0f);
}

TEST(Mat4x4, DoubleTransposeIsOriginal) {
    Mat4x4 m = Mat4x4::rotationXY(0.7f);
    Mat4x4 tt = m.transposed().transposed();
    for (size_t r = 0; r < 4; ++r) {
        for (size_t c = 0; c < 4; ++c) {
            EXPECT_NEAR(tt.at(r, c), m.at(r, c), kEpsilon);
        }
    }
}

TEST(Mat4x4, TransposeInPlace) {
    Mat4x4 m = Mat4x4::zero();
    m.at(0, 2) = 7.0f;
    m.transpose();
    EXPECT_FLOAT_EQ(m.at(2, 0), 7.0f);
    EXPECT_FLOAT_EQ(m.at(0, 2), 0.0f);
}

// ============================================================================
// Inverse
// ============================================================================

TEST(Mat4x4, InverseOfIdentityIsIdentity) {
    Mat4x4 m = Mat4x4::identity();
    Mat4x4 inv = m.inverse();
    EXPECT_TRUE(inv.isIdentity());
}

TEST(Mat4x4, InverseOfScaleMatrix) {
    Mat4x4 m = Mat4x4::scale(2.0f);
    Mat4x4 inv = m.inverse();
    // inverse of scale(2) should be scale(0.5)
    EXPECT_NEAR(inv.at(0, 0), 0.5f, kEpsilon);
    EXPECT_NEAR(inv.at(1, 1), 0.5f, kEpsilon);
    EXPECT_NEAR(inv.at(2, 2), 0.5f, kEpsilon);
    EXPECT_NEAR(inv.at(3, 3), 0.5f, kEpsilon);
}

TEST(Mat4x4, MatrixTimesInverseIsIdentity) {
    Mat4x4 m = Mat4x4::rotationXY(0.8f);
    Mat4x4 inv = m.inverse();
    Mat4x4 product = m * inv;
    EXPECT_TRUE(product.isIdentity(1e-4f));
}

// ============================================================================
// Rotation Matrices
// ============================================================================

TEST(Mat4x4, RotationXY_RotatesXtoY) {
    Mat4x4 m = Mat4x4::rotationXY(kHalfPi);
    Vec4 result = m * Vec4::unitX();
    EXPECT_NEAR(result.x, 0.0f, kEpsilon);
    EXPECT_NEAR(result.y, 1.0f, kEpsilon);
    EXPECT_NEAR(result.z, 0.0f, kEpsilon);
    EXPECT_NEAR(result.w, 0.0f, kEpsilon);
}

TEST(Mat4x4, RotationXZ_RotatesXtoZ) {
    Mat4x4 m = Mat4x4::rotationXZ(kHalfPi);
    Vec4 result = m * Vec4::unitX();
    EXPECT_NEAR(result.x, 0.0f, kEpsilon);
    EXPECT_NEAR(result.y, 0.0f, kEpsilon);
    EXPECT_NEAR(result.z, 1.0f, kEpsilon);
    EXPECT_NEAR(result.w, 0.0f, kEpsilon);
}

TEST(Mat4x4, RotationYZ_RotatesYtoZ) {
    Mat4x4 m = Mat4x4::rotationYZ(kHalfPi);
    Vec4 result = m * Vec4::unitY();
    EXPECT_NEAR(result.x, 0.0f, kEpsilon);
    EXPECT_NEAR(result.y, 0.0f, kEpsilon);
    EXPECT_NEAR(result.z, 1.0f, kEpsilon);
    EXPECT_NEAR(result.w, 0.0f, kEpsilon);
}

TEST(Mat4x4, RotationXW_RotatesXtoW) {
    Mat4x4 m = Mat4x4::rotationXW(kHalfPi);
    Vec4 result = m * Vec4::unitX();
    EXPECT_NEAR(result.x, 0.0f, kEpsilon);
    EXPECT_NEAR(result.y, 0.0f, kEpsilon);
    EXPECT_NEAR(result.z, 0.0f, kEpsilon);
    EXPECT_NEAR(result.w, 1.0f, kEpsilon);
}

TEST(Mat4x4, RotationYW_RotatesYtoW) {
    Mat4x4 m = Mat4x4::rotationYW(kHalfPi);
    Vec4 result = m * Vec4::unitY();
    EXPECT_NEAR(result.x, 0.0f, kEpsilon);
    EXPECT_NEAR(result.y, 0.0f, kEpsilon);
    EXPECT_NEAR(result.z, 0.0f, kEpsilon);
    EXPECT_NEAR(result.w, 1.0f, kEpsilon);
}

TEST(Mat4x4, RotationZW_RotatesZtoW) {
    Mat4x4 m = Mat4x4::rotationZW(kHalfPi);
    Vec4 result = m * Vec4::unitZ();
    EXPECT_NEAR(result.x, 0.0f, kEpsilon);
    EXPECT_NEAR(result.y, 0.0f, kEpsilon);
    EXPECT_NEAR(result.z, 0.0f, kEpsilon);
    EXPECT_NEAR(result.w, 1.0f, kEpsilon);
}

TEST(Mat4x4, RotationZeroAngleIsIdentity) {
    Mat4x4 m = Mat4x4::rotationXY(0.0f);
    EXPECT_TRUE(m.isIdentity());
}

TEST(Mat4x4, RotationFromAnglesAllZerosIsIdentity) {
    Mat4x4 m = Mat4x4::rotationFromAngles(0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f);
    EXPECT_TRUE(m.isIdentity());
}

TEST(Mat4x4, RotationFromAnglesArrayOverload) {
    std::array<float, 6> angles = {0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f};
    Mat4x4 m = Mat4x4::rotationFromAngles(angles);
    EXPECT_TRUE(m.isIdentity());
}

TEST(Mat4x4, RotationIsOrthogonal) {
    Mat4x4 m = Mat4x4::rotationFromAngles(0.3f, 0.5f, 0.7f, 0.1f, 0.2f, 0.4f);
    EXPECT_TRUE(m.isOrthogonal(1e-3f));
}

TEST(Mat4x4, RotationDeterminantIsOne) {
    Mat4x4 m = Mat4x4::rotationFromAngles(0.3f, 0.5f, 0.7f, 0.1f, 0.2f, 0.4f);
    EXPECT_NEAR(m.determinant(), 1.0f, kEpsilon);
}

TEST(Mat4x4, RotationPreservesVectorLength) {
    Mat4x4 m = Mat4x4::rotationFromAngles(0.5f, 0.3f, 0.7f, 0.2f, 0.4f, 0.1f);
    Vec4 v(1.0f, 2.0f, 3.0f, 4.0f);
    Vec4 rotated = m * v;
    EXPECT_NEAR(rotated.length(), v.length(), kEpsilon);
}

// ============================================================================
// Scale
// ============================================================================

TEST(Mat4x4, UniformScaleMatrix) {
    Mat4x4 m = Mat4x4::scale(3.0f);
    EXPECT_FLOAT_EQ(m.at(0, 0), 3.0f);
    EXPECT_FLOAT_EQ(m.at(1, 1), 3.0f);
    EXPECT_FLOAT_EQ(m.at(2, 2), 3.0f);
    EXPECT_FLOAT_EQ(m.at(3, 3), 3.0f);
}

TEST(Mat4x4, ScaleFromVec4) {
    Vec4 s(2.0f, 3.0f, 4.0f, 5.0f);
    Mat4x4 m = Mat4x4::scale(s);
    EXPECT_FLOAT_EQ(m.at(0, 0), 2.0f);
    EXPECT_FLOAT_EQ(m.at(1, 1), 3.0f);
    EXPECT_FLOAT_EQ(m.at(2, 2), 4.0f);
    EXPECT_FLOAT_EQ(m.at(3, 3), 5.0f);
}

// ============================================================================
// Comparison
// ============================================================================

TEST(Mat4x4, EqualityOperator) {
    Mat4x4 a = Mat4x4::identity();
    Mat4x4 b = Mat4x4::identity();
    EXPECT_TRUE(a == b);
    EXPECT_FALSE(a != b);
}

TEST(Mat4x4, InequalityOperator) {
    Mat4x4 a = Mat4x4::identity();
    Mat4x4 b = Mat4x4::scale(2.0f);
    EXPECT_FALSE(a == b);
    EXPECT_TRUE(a != b);
}

// ============================================================================
// Data Pointer
// ============================================================================

TEST(Mat4x4, DataPointerAccess) {
    Mat4x4 m = Mat4x4::identity();
    const float* p = m.ptr();
    // Column-major: first column is [1,0,0,0]
    EXPECT_FLOAT_EQ(p[0], 1.0f);
    EXPECT_FLOAT_EQ(p[1], 0.0f);
    EXPECT_FLOAT_EQ(p[2], 0.0f);
    EXPECT_FLOAT_EQ(p[3], 0.0f);
    // Second column starts at index 4: [0,1,0,0]
    EXPECT_FLOAT_EQ(p[4], 0.0f);
    EXPECT_FLOAT_EQ(p[5], 1.0f);
}
