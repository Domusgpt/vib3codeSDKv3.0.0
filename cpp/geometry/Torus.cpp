/**
 * Torus.cpp - Clifford Torus in 4D
 *
 * Generates points on the Clifford torus, which is the product of
 * two circles embedded in 4D: S1 x S1 in R4.
 *
 * The Clifford torus is a flat torus that lies on the 3-sphere S3.
 * Parametrization:
 *   x = cos(u) * r1
 *   y = sin(u) * r1
 *   z = cos(v) * r2
 *   w = sin(v) * r2
 * where r1^2 + r2^2 = 1 for it to lie on S3 (r1 = r2 = 1/sqrt(2)).
 */

#include "math/Vec4.hpp"
#include <vector>
#include <cmath>
#include <numbers>

namespace vib3 {

/**
 * Generate the Clifford torus in 4D.
 *
 * Uses the standard parametrization with equal radii r1 = r2 = 1/sqrt(2),
 * which places the torus on the unit 3-sphere. The two angles u and v
 * each range over [0, 2*pi).
 *
 * @param resolution Number of subdivisions for each angle (total points = resolution^2)
 * @return Vector of 4D points on the Clifford torus
 */
std::vector<Vec4> generateTorus(int resolution) noexcept {
    if (resolution < 4) resolution = 4;

    constexpr float twoPi = 2.0f * std::numbers::pi_v<float>;
    // Equal radii for Clifford torus on S3
    constexpr float r = 1.0f / std::numbers::sqrt2_v<float>;

    std::vector<Vec4> vertices;
    vertices.reserve(static_cast<size_t>(resolution) * static_cast<size_t>(resolution));

    for (int iu = 0; iu < resolution; ++iu) {
        float u = twoPi * static_cast<float>(iu) / static_cast<float>(resolution);
        float cosU = std::cos(u);
        float sinU = std::sin(u);

        for (int iv = 0; iv < resolution; ++iv) {
            float v = twoPi * static_cast<float>(iv) / static_cast<float>(resolution);
            float cosV = std::cos(v);
            float sinV = std::sin(v);

            vertices.emplace_back(
                r * cosU,
                r * sinU,
                r * cosV,
                r * sinV
            );
        }
    }

    return vertices;
}

} // namespace vib3
