/**
 * Wave.cpp - Sinusoidal Interference Pattern in 4D
 *
 * Generates a grid of 4D points with sinusoidal wave displacement.
 * The base grid lies in the XZ plane, with Y and W components driven
 * by interference of multiple wave sources.
 */

#include "math/Vec4.hpp"
#include <vector>
#include <cmath>
#include <numbers>

namespace vib3 {

/**
 * Generate a 4D sinusoidal interference pattern.
 *
 * Creates a resolution x resolution grid in the XZ plane, centered at
 * the origin. The Y component is displaced by the sum of three wave
 * sources with different frequencies, and the W component uses a
 * cross-wave pattern, producing a rich 4D interference field.
 *
 * @param resolution Number of grid points along each axis (total = resolution^2)
 * @return Vector of 4D points with wave displacement
 */
std::vector<Vec4> generateWave(int resolution) noexcept {
    if (resolution < 4) resolution = 4;

    constexpr float pi = std::numbers::pi_v<float>;

    // Grid extends from -gridExtent to +gridExtent
    constexpr float gridExtent = 2.0f;

    // Wave parameters: {frequency, amplitude, phase offset X, phase offset Z}
    struct WaveSource {
        float freq;
        float ampY;
        float ampW;
        float phaseX;
        float phaseZ;
    };

    constexpr WaveSource waves[] = {
        { 1.0f,  0.5f, 0.3f, 0.0f,        0.0f        },  // Primary wave
        { 2.3f,  0.25f, 0.15f, pi * 0.5f,  pi * 0.25f  },  // Secondary wave
        { 3.7f,  0.125f, 0.1f, pi * 0.75f, pi * 0.6f   },  // Tertiary wave
    };
    constexpr int numWaves = 3;

    std::vector<Vec4> vertices;
    vertices.reserve(static_cast<size_t>(resolution) * static_cast<size_t>(resolution));

    float step = (2.0f * gridExtent) / static_cast<float>(resolution - 1);

    for (int ix = 0; ix < resolution; ++ix) {
        float x = -gridExtent + static_cast<float>(ix) * step;

        for (int iz = 0; iz < resolution; ++iz) {
            float z = -gridExtent + static_cast<float>(iz) * step;

            float y = 0.0f;
            float w = 0.0f;

            // Sum contributions from all wave sources
            for (int wi = 0; wi < numWaves; ++wi) {
                const auto& ws = waves[wi];
                float phX = ws.freq * x * pi + ws.phaseX;
                float phZ = ws.freq * z * pi + ws.phaseZ;

                // Y displacement: circular wave pattern
                y += ws.ampY * std::sin(phX) * std::cos(phZ);

                // W displacement: cross-interference pattern
                w += ws.ampW * std::cos(phX + phZ);
            }

            vertices.emplace_back(x, y, z, w);
        }
    }

    return vertices;
}

} // namespace vib3
