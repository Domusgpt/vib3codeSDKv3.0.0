/**
 * WarpFunctions.cpp - Core Type Warp Functions
 *
 * Provides warp transformations that modify base geometries to create
 * the three core type variants (Base, Hypersphere, Hypertetrahedron).
 *
 * Core type 0 (Base, index 0-7):   No warp, pure base geometry.
 * Core type 1 (Hypersphere, 8-15): Project onto 3-sphere surface.
 * Core type 2 (Hypertetra, 16-23): Warp toward pentatope vertices.
 */

#include "math/Vec4.hpp"
#include <vector>
#include <cmath>
#include <numbers>
#include <algorithm>

namespace vib3 {

/**
 * Project a 4D point onto the 3-sphere of given radius.
 *
 * Normalizes the point to lie on S3, then scales by `radius`.
 * If the point is at the origin, returns a default point on the sphere.
 *
 * @param point  Input 4D point
 * @param radius Radius of the target 3-sphere
 * @return Point projected onto S3 * radius
 */
Vec4 warpHypersphere(Vec4 point, float radius) noexcept {
    float len = point.length();

    if (len < 1e-8f) {
        // Degenerate case: return a default point on the sphere
        return Vec4(radius, 0.0f, 0.0f, 0.0f);
    }

    return point * (radius / len);
}

/**
 * Inverse stereographic projection from R3 to S3.
 *
 * Maps a 3D point (interpreted as x,y,z with w=0) onto the 3-sphere
 * using inverse stereographic projection from the north pole (0,0,0,1).
 *
 * @param point Input 4D point (only x,y,z used)
 * @return Point on unit S3
 */
Vec4 inverseStereographicToHypersphere(Vec4 point) noexcept {
    float r2 = point.x * point.x + point.y * point.y + point.z * point.z;
    float denom = 1.0f + r2;

    return Vec4(
        2.0f * point.x / denom,
        2.0f * point.y / denom,
        2.0f * point.z / denom,
        (r2 - 1.0f) / denom
    );
}

/**
 * Apply Hopf fibration mapping.
 *
 * Given a point on S3, returns its base point on S2 (the Hopf projection)
 * and the fiber angle. This is used to visualize toroidal structures
 * inherent in the 3-sphere.
 *
 * @param point Point on S3
 * @return Projected point (x,y,z = S2 base point, w = fiber angle)
 */
Vec4 hopfProject(Vec4 point) noexcept {
    // Normalize to ensure on S3
    Vec4 p = point.normalized();

    // Hopf map S3 -> S2:
    //   n1 = 2(x*z + y*w)
    //   n2 = 2(y*z - x*w)
    //   n3 = x^2 + y^2 - z^2 - w^2
    float n1 = 2.0f * (p.x * p.z + p.y * p.w);
    float n2 = 2.0f * (p.y * p.z - p.x * p.w);
    float n3 = p.x * p.x + p.y * p.y - p.z * p.z - p.w * p.w;

    // Fiber angle
    float fiberAngle = std::atan2(p.y, p.x) - std::atan2(p.w, p.z);

    return Vec4(n1, n2, n3, fiberAngle);
}

/**
 * Batch warp: project all points in a geometry onto S3.
 *
 * @param points Input geometry vertices
 * @param radius Radius of the target 3-sphere
 * @return Warped vertices on the 3-sphere
 */
std::vector<Vec4> warpHypersphereBatch(const std::vector<Vec4>& points,
                                        float radius) noexcept {
    std::vector<Vec4> result;
    result.reserve(points.size());

    for (const auto& p : points) {
        result.push_back(warpHypersphere(p, radius));
    }

    return result;
}

// ---- Hypertetrahedron (Pentatope) Warp ----

namespace {

/**
 * The 5 vertices of a regular 5-cell (pentatope) in R4.
 *
 * These are the vertices of the simplest regular 4D polytope,
 * the analogue of the tetrahedron in 4D.
 */
constexpr int kPentatopeVertexCount = 5;

Vec4 getPentatopeVertex(int index) noexcept {
    // Standard regular 5-cell vertices
    // Constructed so that all pairwise distances are equal.
    const float s = std::sqrt(2.0f / 5.0f);
    const float t = std::sqrt(2.0f / 3.0f);
    const float u = 1.0f / std::sqrt(3.0f);
    const float v = 1.0f / std::sqrt(15.0f);

    switch (index) {
        case 0: return Vec4( t,         0.0f,     0.0f,     -v);
        case 1: return Vec4(-u,         u,        0.0f,     -v);
        case 2: return Vec4(-u,        -u,        0.0f,     -v);
        case 3: return Vec4( 0.0f,      0.0f,     t,        -v);
        case 4: return Vec4( 0.0f,      0.0f,     0.0f,  4.0f * v);
        default: return Vec4::zero();
    }
}

} // anonymous namespace

/**
 * Warp a 4D point toward the nearest pentatope vertex.
 *
 * Finds the closest vertex of the regular 5-cell and interpolates
 * the point toward it, creating a tetrahedral clustering effect.
 * The interpolation factor is based on the inverse distance to
 * the nearest vertex, producing a gravitational pull effect.
 *
 * @param point Input 4D point
 * @return Warped point attracted toward nearest pentatope vertex
 */
Vec4 warpHypertetra(Vec4 point) noexcept {
    // Find nearest pentatope vertex
    int nearestIdx = 0;
    float nearestDist = point.distanceSquaredTo(getPentatopeVertex(0));

    for (int i = 1; i < kPentatopeVertexCount; ++i) {
        float dist = point.distanceSquaredTo(getPentatopeVertex(i));
        if (dist < nearestDist) {
            nearestDist = dist;
            nearestIdx = i;
        }
    }

    Vec4 nearest = getPentatopeVertex(nearestIdx);

    // Warp factor based on distance (closer = stronger pull)
    float dist = std::sqrt(nearestDist);
    float warpStrength = 1.0f / (1.0f + dist * 2.0f);

    // Interpolate toward the nearest pentatope vertex
    return point.lerp(nearest, warpStrength);
}

/**
 * Warp a 4D point onto the edges of the pentatope.
 *
 * Projects the point to the nearest edge of the 5-cell,
 * producing a skeletal wireframe appearance.
 *
 * @param point Input 4D point
 * @return Point projected onto nearest pentatope edge
 */
Vec4 warpToEdges(Vec4 point) noexcept {
    // 10 edges of the pentatope (all pairs of 5 vertices)
    constexpr int edgePairs[10][2] = {
        {0, 1}, {0, 2}, {0, 3}, {0, 4},
        {1, 2}, {1, 3}, {1, 4},
        {2, 3}, {2, 4},
        {3, 4}
    };

    Vec4 bestProjection = point;
    float bestDist = 1e10f;

    for (const auto& pair : edgePairs) {
        Vec4 a = getPentatopeVertex(pair[0]);
        Vec4 b = getPentatopeVertex(pair[1]);
        Vec4 edge = b - a;
        Vec4 toPoint = point - a;

        // Project onto edge (clamped to [0,1])
        float edgeLenSq = edge.dot(edge);
        if (edgeLenSq < 1e-10f) continue;

        float t = toPoint.dot(edge) / edgeLenSq;
        t = std::max(0.0f, std::min(1.0f, t));

        Vec4 projected = a.lerp(b, t);
        float dist = point.distanceSquaredTo(projected);

        if (dist < bestDist) {
            bestDist = dist;
            bestProjection = projected;
        }
    }

    return bestProjection;
}

/**
 * Batch warp: apply hypertetra warp to all points.
 *
 * @param points Input geometry vertices
 * @return Warped vertices attracted toward pentatope vertices
 */
std::vector<Vec4> warpHypertetraBatch(const std::vector<Vec4>& points) noexcept {
    std::vector<Vec4> result;
    result.reserve(points.size());

    for (const auto& p : points) {
        result.push_back(warpHypertetra(p));
    }

    return result;
}

} // namespace vib3
