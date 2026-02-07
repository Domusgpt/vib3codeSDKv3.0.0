/**
 * Tesseract.cpp - 4D Hypercube Geometry
 *
 * Generates the 16 vertices and 32 edges of a tesseract (4D cube).
 * Vertices are at all combinations of (+-1, +-1, +-1, +-1).
 */

#include "math/Vec4.hpp"
#include <vector>
#include <cstdint>

namespace vib3 {

/**
 * Generate the 16 vertices of a tesseract.
 *
 * A tesseract has vertices at every combination of (+-1, +-1, +-1, +-1).
 */
std::vector<Vec4> generateTesseractVertices() noexcept {
    std::vector<Vec4> vertices;
    vertices.reserve(16);

    for (uint8_t i = 0; i < 16; ++i) {
        float x = (i & 1) ? 1.0f : -1.0f;
        float y = (i & 2) ? 1.0f : -1.0f;
        float z = (i & 4) ? 1.0f : -1.0f;
        float w = (i & 8) ? 1.0f : -1.0f;
        vertices.emplace_back(x, y, z, w);
    }

    return vertices;
}

/**
 * Edge pair for a tesseract (indices into vertex array).
 */
struct Edge {
    int a, b;
};

/**
 * Generate the 32 edges of a tesseract.
 *
 * Two vertices share an edge if and only if they differ in exactly one coordinate.
 */
std::vector<Edge> generateTesseractEdges() noexcept {
    std::vector<Edge> edges;
    edges.reserve(32);

    for (int i = 0; i < 16; ++i) {
        for (int bit = 0; bit < 4; ++bit) {
            int j = i ^ (1 << bit);
            if (j > i) {
                edges.push_back({i, j});
            }
        }
    }

    return edges;
}

/**
 * Generate tesseract geometry with edge interpolation.
 *
 * Returns vertices along all edges, creating a wireframe mesh.
 * Each edge is subdivided into `resolution` segments, generating
 * intermediate points via linear interpolation.
 *
 * @param resolution Number of subdivisions per edge (minimum 2)
 * @return Vector of 4D points along all tesseract edges
 */
std::vector<Vec4> generateTesseract(int resolution) noexcept {
    if (resolution < 2) resolution = 2;

    auto baseVertices = generateTesseractVertices();
    auto edges = generateTesseractEdges();

    std::vector<Vec4> vertices;
    vertices.reserve(static_cast<size_t>(edges.size()) * static_cast<size_t>(resolution));

    for (const auto& edge : edges) {
        const Vec4& a = baseVertices[static_cast<size_t>(edge.a)];
        const Vec4& b = baseVertices[static_cast<size_t>(edge.b)];

        for (int i = 0; i < resolution; ++i) {
            float t = static_cast<float>(i) / static_cast<float>(resolution - 1);
            vertices.push_back(a.lerp(b, t));
        }
    }

    return vertices;
}

} // namespace vib3
