/**
 * Fractal.cpp - 4D Iterated Function System Fractal
 *
 * Generates recursive subdivision geometry in 4D using an IFS approach.
 * Starts from an initial set of points and iteratively applies affine
 * contractions toward attractor vertices, building a self-similar
 * fractal structure (a 4D analogue of the Sierpinski tetrahedron).
 */

#include "math/Vec4.hpp"
#include <vector>
#include <cmath>
#include <numbers>
#include <cstdint>

namespace vib3 {

namespace {

/**
 * 4D Sierpinski-style attractor vertices.
 *
 * Five vertices of a regular 5-cell (pentatope) provide a natural
 * set of contraction centers for a 4D IFS.
 */
constexpr int kNumAttractors = 5;

Vec4 getAttractorVertex(int index) noexcept {
    // Regular pentatope vertices (5-cell), embedded in R4
    // These are the vertices of a regular simplex in 4D.
    switch (index) {
        case 0: return Vec4( 1.0f,  1.0f,  1.0f, -1.0f / std::numbers::sqrt2_v<float>);
        case 1: return Vec4( 1.0f, -1.0f, -1.0f, -1.0f / std::numbers::sqrt2_v<float>);
        case 2: return Vec4(-1.0f,  1.0f, -1.0f, -1.0f / std::numbers::sqrt2_v<float>);
        case 3: return Vec4(-1.0f, -1.0f,  1.0f, -1.0f / std::numbers::sqrt2_v<float>);
        case 4: return Vec4( 0.0f,  0.0f,  0.0f,  4.0f / std::numbers::sqrt2_v<float>);
        default: return Vec4::zero();
    }
}

/**
 * Simple deterministic hash for reproducible pseudo-random attractor selection.
 */
constexpr uint32_t hashStep(uint32_t seed) noexcept {
    seed ^= seed << 13;
    seed ^= seed >> 17;
    seed ^= seed << 5;
    return seed;
}

} // anonymous namespace

/**
 * Generate a 4D IFS fractal via the chaos game.
 *
 * Uses the classic chaos game algorithm: starting from a seed point,
 * repeatedly pick a random attractor and move halfway toward it.
 * After a warm-up period, the trajectory traces out the fractal.
 *
 * @param resolution Controls the number of output points (resolution^2 points)
 * @return Vector of 4D fractal points
 */
std::vector<Vec4> generateFractal(int resolution) noexcept {
    if (resolution < 4) resolution = 4;

    int numPoints = resolution * resolution;
    constexpr int warmUp = 64;
    constexpr float contractionFactor = 0.5f;

    std::vector<Vec4> vertices;
    vertices.reserve(static_cast<size_t>(numPoints));

    // Start at the origin
    Vec4 current = Vec4::zero();
    uint32_t seed = 0xDEADBEEF;

    // Warm-up iterations (discard to converge onto attractor)
    for (int i = 0; i < warmUp; ++i) {
        seed = hashStep(seed);
        int attIdx = static_cast<int>(seed % kNumAttractors);
        Vec4 target = getAttractorVertex(attIdx);
        current = current.lerp(target, contractionFactor);
    }

    // Generate fractal points
    for (int i = 0; i < numPoints; ++i) {
        seed = hashStep(seed);
        int attIdx = static_cast<int>(seed % kNumAttractors);
        Vec4 target = getAttractorVertex(attIdx);
        current = current.lerp(target, contractionFactor);
        vertices.push_back(current);
    }

    return vertices;
}

/**
 * Generate a 4D IFS fractal via recursive subdivision.
 *
 * Starts from attractor vertices and recursively subdivides midpoints
 * to a given depth, producing a deterministic point set.
 *
 * @param depth Recursion depth (0 = just vertices, each level multiplies points by 5)
 * @return Vector of 4D fractal points
 */
std::vector<Vec4> generateFractalSubdivision(int depth) noexcept {
    if (depth < 0) depth = 0;
    if (depth > 6) depth = 6; // Cap to avoid excessive memory

    std::vector<Vec4> current;
    current.reserve(static_cast<size_t>(kNumAttractors));

    // Seed with attractor vertices
    for (int i = 0; i < kNumAttractors; ++i) {
        current.push_back(getAttractorVertex(i));
    }

    // Recursive subdivision
    for (int d = 0; d < depth; ++d) {
        std::vector<Vec4> next;
        next.reserve(current.size() * static_cast<size_t>(kNumAttractors));

        for (const auto& point : current) {
            for (int a = 0; a < kNumAttractors; ++a) {
                Vec4 target = getAttractorVertex(a);
                next.push_back(point.lerp(target, 0.5f));
            }
        }

        current = std::move(next);
    }

    return current;
}

} // namespace vib3
