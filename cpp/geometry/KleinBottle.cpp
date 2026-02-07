/**
 * KleinBottle.cpp - Non-Orientable Surface in 4D
 *
 * Generates points on the Klein bottle immersed in R4.
 *
 * The Klein bottle cannot be embedded in R3 without self-intersection,
 * but it can be properly embedded in R4. We use the standard
 * figure-eight parametrization lifted into the 4th dimension:
 *
 *   x = (a + b*cos(v)) * cos(u)
 *   y = (a + b*cos(v)) * sin(u)
 *   z = b * sin(v) * cos(u/2)
 *   w = b * sin(v) * sin(u/2)
 *
 * where u in [0, 2*pi), v in [0, 2*pi), and a > b > 0.
 */

#include "math/Vec4.hpp"
#include <vector>
#include <cmath>
#include <numbers>

namespace vib3 {

/**
 * Generate Klein bottle surface points in 4D.
 *
 * Uses the figure-eight immersion lifted to R4, which avoids
 * the self-intersection that occurs in R3.
 *
 * @param resolution Number of subdivisions for each parameter (total points = resolution^2)
 * @return Vector of 4D points on the Klein bottle surface
 */
std::vector<Vec4> generateKleinBottle(int resolution) noexcept {
    if (resolution < 4) resolution = 4;

    constexpr float twoPi = 2.0f * std::numbers::pi_v<float>;
    constexpr float a = 2.0f;  // Major radius
    constexpr float b = 1.0f;  // Minor radius

    std::vector<Vec4> vertices;
    vertices.reserve(static_cast<size_t>(resolution) * static_cast<size_t>(resolution));

    for (int iu = 0; iu < resolution; ++iu) {
        float u = twoPi * static_cast<float>(iu) / static_cast<float>(resolution);
        float cosU = std::cos(u);
        float sinU = std::sin(u);
        float halfU = u * 0.5f;
        float cosHalfU = std::cos(halfU);
        float sinHalfU = std::sin(halfU);

        for (int iv = 0; iv < resolution; ++iv) {
            float v = twoPi * static_cast<float>(iv) / static_cast<float>(resolution);
            float cosV = std::cos(v);
            float sinV = std::sin(v);

            float r = a + b * cosV;

            vertices.emplace_back(
                r * cosU,
                r * sinU,
                b * sinV * cosHalfU,
                b * sinV * sinHalfU
            );
        }
    }

    return vertices;
}

} // namespace vib3
