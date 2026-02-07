/**
 * Sphere.cpp - 3-Sphere (S3) Surface Points
 *
 * Generates points on the 3-sphere (hypersphere) in 4D using
 * Hopf coordinates (psi, theta, phi) parametrization.
 */

#include "math/Vec4.hpp"
#include <vector>
#include <cmath>
#include <numbers>

namespace vib3 {

/**
 * Generate points on S3 using Hopf coordinate parametrization.
 *
 * The 3-sphere is parametrized by three angles:
 *   x = cos(psi) * cos(theta)
 *   y = cos(psi) * sin(theta)
 *   z = sin(psi) * cos(phi)
 *   w = sin(psi) * sin(phi)
 *
 * where psi in [0, pi/2], theta in [0, 2pi), phi in [0, 2pi).
 *
 * @param resolution Controls sampling density. Total points = resolution^2 * resolution/2
 * @return Vector of 4D points on the unit 3-sphere
 */
std::vector<Vec4> generateSphere(int resolution) noexcept {
    if (resolution < 4) resolution = 4;

    constexpr float pi = std::numbers::pi_v<float>;
    constexpr float twoPi = 2.0f * std::numbers::pi_v<float>;
    constexpr float halfPi = std::numbers::pi_v<float> / 2.0f;

    // Number of steps for each angle
    int psiSteps = resolution / 2;
    int thetaSteps = resolution;
    int phiSteps = resolution;

    if (psiSteps < 2) psiSteps = 2;

    std::vector<Vec4> vertices;
    vertices.reserve(static_cast<size_t>(psiSteps) *
                     static_cast<size_t>(thetaSteps) *
                     static_cast<size_t>(phiSteps));

    for (int ip = 0; ip < psiSteps; ++ip) {
        float psi = halfPi * static_cast<float>(ip) / static_cast<float>(psiSteps - 1);
        float cosPsi = std::cos(psi);
        float sinPsi = std::sin(psi);

        for (int it = 0; it < thetaSteps; ++it) {
            float theta = twoPi * static_cast<float>(it) / static_cast<float>(thetaSteps);
            float cosTheta = std::cos(theta);
            float sinTheta = std::sin(theta);

            for (int iphi = 0; iphi < phiSteps; ++iphi) {
                float phi = twoPi * static_cast<float>(iphi) / static_cast<float>(phiSteps);
                float cosPhi = std::cos(phi);
                float sinPhi = std::sin(phi);

                vertices.emplace_back(
                    cosPsi * cosTheta,
                    cosPsi * sinTheta,
                    sinPsi * cosPhi,
                    sinPsi * sinPhi
                );
            }
        }
    }

    return vertices;
}

/**
 * Generate points on S3 using the Hopf fibration structure.
 *
 * The Hopf fibration maps S3 -> S2, with each fiber being a great circle.
 * This produces points organized along Hopf fibers, useful for
 * visualizing the fibration structure.
 *
 * @param numFibers Number of base points on S2
 * @param pointsPerFiber Number of points along each Hopf circle
 * @return Vector of 4D points on the unit 3-sphere
 */
std::vector<Vec4> generateHopfFibration(int numFibers, int pointsPerFiber) noexcept {
    if (numFibers < 4) numFibers = 4;
    if (pointsPerFiber < 8) pointsPerFiber = 8;

    constexpr float pi = std::numbers::pi_v<float>;
    constexpr float twoPi = 2.0f * std::numbers::pi_v<float>;

    // Distribute base points on S2 using a spiral
    int sqrtFibers = static_cast<int>(std::sqrt(static_cast<float>(numFibers)));
    if (sqrtFibers < 2) sqrtFibers = 2;

    std::vector<Vec4> vertices;
    vertices.reserve(static_cast<size_t>(numFibers) * static_cast<size_t>(pointsPerFiber));

    for (int fi = 0; fi < sqrtFibers; ++fi) {
        float baseTheta = pi * static_cast<float>(fi) / static_cast<float>(sqrtFibers - 1);

        for (int fj = 0; fj < sqrtFibers; ++fj) {
            float basePhi = twoPi * static_cast<float>(fj) / static_cast<float>(sqrtFibers);

            // Base point on S2
            float halfTheta = baseTheta * 0.5f;
            float cosHalf = std::cos(halfTheta);
            float sinHalf = std::sin(halfTheta);

            // Trace the Hopf fiber (great circle in S3) for this base point
            for (int p = 0; p < pointsPerFiber; ++p) {
                float t = twoPi * static_cast<float>(p) / static_cast<float>(pointsPerFiber);

                float cosT = std::cos(t);
                float sinT = std::sin(t);
                float cosBP = std::cos(basePhi + t);
                float sinBP = std::sin(basePhi + t);

                vertices.emplace_back(
                    cosHalf * cosT,
                    cosHalf * sinT,
                    sinHalf * cosBP,
                    sinHalf * sinBP
                );
            }
        }
    }

    return vertices;
}

} // namespace vib3
