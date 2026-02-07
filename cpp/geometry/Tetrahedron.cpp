/**
 * Tetrahedron.cpp - 3D Simplex Embedded in 4D
 *
 * Generates vertices and edge geometry for a regular tetrahedron
 * embedded in 4D space (w = 0).
 */

#include "math/Vec4.hpp"
#include <vector>
#include <cmath>
#include <numbers>

namespace vib3 {

/**
 * Generate the 4 vertices of a regular tetrahedron in 4D.
 *
 * The tetrahedron is centered at the origin with unit edge length,
 * embedded in the w=0 hyperplane. Vertices are placed so that the
 * centroid lies at the origin.
 */
std::vector<Vec4> generateTetrahedronVertices() noexcept {
    // Regular tetrahedron vertices centered at origin
    // Using the standard construction: one vertex up, three forming
    // an equilateral triangle below.
    constexpr float a = 1.0f;
    const float h = a * std::sqrt(2.0f / 3.0f);
    const float r = a / std::sqrt(3.0f);

    // Vertical offset to center at origin
    const float yOff = -h / 4.0f;

    std::vector<Vec4> vertices;
    vertices.reserve(4);

    // Top vertex
    vertices.emplace_back(0.0f, 3.0f * h / 4.0f + yOff, 0.0f, 0.0f);

    // Bottom triangle
    vertices.emplace_back(0.0f, yOff, r, 0.0f);
    vertices.emplace_back(-r * std::sqrt(3.0f) / 2.0f, yOff, -r / 2.0f, 0.0f);
    vertices.emplace_back( r * std::sqrt(3.0f) / 2.0f, yOff, -r / 2.0f, 0.0f);

    return vertices;
}

/**
 * Generate tetrahedron geometry with edge interpolation.
 *
 * Subdivides each of the 6 edges into `resolution` segments and
 * returns all interpolated points.
 *
 * @param resolution Number of subdivisions per edge (minimum 2)
 * @return Vector of 4D points along all tetrahedron edges
 */
std::vector<Vec4> generateTetrahedron(int resolution) noexcept {
    if (resolution < 2) resolution = 2;

    auto baseVertices = generateTetrahedronVertices();

    // 6 edges for a tetrahedron: every pair of 4 vertices
    constexpr int edgePairs[6][2] = {
        {0, 1}, {0, 2}, {0, 3},
        {1, 2}, {1, 3}, {2, 3}
    };

    std::vector<Vec4> vertices;
    vertices.reserve(6 * static_cast<size_t>(resolution));

    for (const auto& pair : edgePairs) {
        const Vec4& a = baseVertices[static_cast<size_t>(pair[0])];
        const Vec4& b = baseVertices[static_cast<size_t>(pair[1])];

        for (int i = 0; i < resolution; ++i) {
            float t = static_cast<float>(i) / static_cast<float>(resolution - 1);
            vertices.push_back(a.lerp(b, t));
        }
    }

    return vertices;
}

} // namespace vib3
