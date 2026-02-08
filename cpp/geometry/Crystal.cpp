/**
 * Crystal.cpp - Octahedral / Crystalline Structure in 4D
 *
 * Generates vertices and edge geometry for crystalline structures
 * in 4D: the regular octahedron (cross-polytope) and its dual,
 * extended with 4D vertices along the W axis.
 *
 * The 4D cross-polytope (hyperoctahedron / 16-cell) has 8 vertices
 * at the 4 axis-aligned unit positions and their negations.
 */

#include "math/Vec4.hpp"
#include <vector>
#include <cmath>
#include <numbers>

namespace vib3 {

/**
 * Generate the 8 vertices of a 4D cross-polytope (hyperoctahedron / 16-cell).
 *
 * Vertices lie at (+-1, 0, 0, 0), (0, +-1, 0, 0), (0, 0, +-1, 0), (0, 0, 0, +-1).
 */
std::vector<Vec4> generateCrossPolytopeVertices() noexcept {
    std::vector<Vec4> vertices;
    vertices.reserve(8);

    vertices.emplace_back( 1.0f,  0.0f,  0.0f,  0.0f);
    vertices.emplace_back(-1.0f,  0.0f,  0.0f,  0.0f);
    vertices.emplace_back( 0.0f,  1.0f,  0.0f,  0.0f);
    vertices.emplace_back( 0.0f, -1.0f,  0.0f,  0.0f);
    vertices.emplace_back( 0.0f,  0.0f,  1.0f,  0.0f);
    vertices.emplace_back( 0.0f,  0.0f, -1.0f,  0.0f);
    vertices.emplace_back( 0.0f,  0.0f,  0.0f,  1.0f);
    vertices.emplace_back( 0.0f,  0.0f,  0.0f, -1.0f);

    return vertices;
}

/**
 * Generate crystalline geometry with edge interpolation.
 *
 * The 4D cross-polytope has 24 edges: every pair of non-antipodal vertices
 * is connected (i.e., vertices i and j are connected unless they lie on
 * the same axis). Each edge is subdivided into `resolution` segments.
 *
 * Additionally generates midpoint vertices for a dual-lattice structure
 * (the 4D hypercube formed by the dual vertices at the edge midpoints).
 *
 * @param resolution Number of subdivisions per edge (minimum 2)
 * @return Vector of 4D points forming the crystal wireframe
 */
std::vector<Vec4> generateCrystal(int resolution) noexcept {
    if (resolution < 2) resolution = 2;

    auto baseVertices = generateCrossPolytopeVertices();

    // Edges of the 16-cell: connect every pair of vertices that are
    // NOT antipodal (not on the same axis).
    // 8 vertices, 24 edges total.
    struct Edge { int a, b; };
    std::vector<Edge> edges;
    edges.reserve(24);

    for (int i = 0; i < 8; ++i) {
        for (int j = i + 1; j < 8; ++j) {
            // Antipodal pairs: (0,1), (2,3), (4,5), (6,7)
            // Skip if on same axis (differ by 1 and i is even)
            if ((i ^ j) == 1 && (i % 2 == 0)) {
                continue;
            }
            edges.push_back({i, j});
        }
    }

    std::vector<Vec4> vertices;
    vertices.reserve(edges.size() * static_cast<size_t>(resolution) + 16);

    // Edge wireframe
    for (const auto& edge : edges) {
        const Vec4& a = baseVertices[static_cast<size_t>(edge.a)];
        const Vec4& b = baseVertices[static_cast<size_t>(edge.b)];

        for (int i = 0; i < resolution; ++i) {
            float t = static_cast<float>(i) / static_cast<float>(resolution - 1);
            vertices.push_back(a.lerp(b, t));
        }
    }

    // Dual vertices (tesseract / hypercube dual): midpoints of faces
    // These are the 16 vertices of the dual polytope at (+-0.5, +-0.5, +-0.5, +-0.5)
    for (int i = 0; i < 16; ++i) {
        float x = (i & 1) ? 0.5f : -0.5f;
        float y = (i & 2) ? 0.5f : -0.5f;
        float z = (i & 4) ? 0.5f : -0.5f;
        float w = (i & 8) ? 0.5f : -0.5f;
        vertices.emplace_back(x, y, z, w);
    }

    return vertices;
}

} // namespace vib3
