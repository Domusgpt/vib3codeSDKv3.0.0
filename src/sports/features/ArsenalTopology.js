/**
 * ArsenalTopology - Topological Data Analysis for Pitcher Arsenals
 *
 * Models a pitcher's arsenal as a point cloud in high-dimensional space
 * and applies TDA techniques to extract "shape of skill" features.
 *
 * Key Concepts:
 * - Arsenal Polytope: Convex hull of pitch types in kinematic space
 * - Persistence Homology: Topological features that persist across scales
 * - Cluster Stability: Consistency of pitch type separation
 *
 * @class ArsenalTopology
 */

export class ArsenalTopology {
    constructor(config = {}) {
        this.config = {
            // Feature dimensions for arsenal analysis
            features: [
                'release_speed',      // Velocity
                'release_spin_rate',  // Spin rate
                'pfx_x',              // Horizontal movement
                'pfx_z',              // Vertical movement
                'release_pos_x',      // Release point x
                'release_pos_z',      // Release point z
                'release_extension',  // Extension
                'spin_axis'           // Spin direction
            ],

            // Normalization parameters (league averages)
            normalization: {
                release_speed: { mean: 92, std: 5 },
                release_spin_rate: { mean: 2200, std: 400 },
                pfx_x: { mean: 0, std: 8 },
                pfx_z: { mean: 6, std: 6 },
                release_pos_x: { mean: -1, std: 1 },
                release_pos_z: { mean: 5.8, std: 0.5 },
                release_extension: { mean: 6.3, std: 0.5 },
                spin_axis: { mean: 180, std: 60 }
            },

            // Minimum pitches for reliable topology
            minPitchesPerType: 30,

            // Persistence threshold for significant features
            persistenceThreshold: 0.1,

            ...config
        };

        // Cache computed arsenals
        this.arsenalCache = new Map();
    }

    /**
     * Compute full arsenal topology for a pitcher
     * @param {Array} pitches - Array of pitch data
     * @param {string} pitcherId - Pitcher identifier for caching
     * @returns {Object} Arsenal topology analysis
     */
    computeArsenalTopology(pitches, pitcherId = null) {
        if (pitches.length < 50) {
            return null; // Need sufficient data
        }

        // Extract and normalize features
        const featureMatrix = this.extractFeatures(pitches);

        // Compute point cloud statistics
        const cloudStats = this.computeCloudStatistics(featureMatrix);

        // Compute arsenal convex hull (polytope volume)
        const polytope = this.computeArsenalPolytope(featureMatrix);

        // Cluster analysis by pitch type
        const clusters = this.analyzeClusters(pitches, featureMatrix);

        // Compute persistence homology (simplified)
        const persistence = this.computePersistence(featureMatrix);

        // Arsenal stability score
        const stability = this.computeArsenalStability(clusters);

        const result = {
            pitcherId,
            sampleSize: pitches.length,
            featureMatrix,
            cloudStats,
            polytope,
            clusters,
            persistence,
            stability,

            // Summary metrics
            metrics: {
                arsenalVolume: polytope.volume,
                arsenalSpread: cloudStats.avgPairwiseDistance,
                clusterSeparation: clusters.avgSeparation,
                stabilityScore: stability.overall,
                dominantPitchRatio: clusters.dominantRatio
            }
        };

        if (pitcherId) {
            this.arsenalCache.set(pitcherId, result);
        }

        return result;
    }

    /**
     * Extract and normalize feature matrix from pitches
     * @param {Array} pitches - Pitch data
     * @returns {Object} Normalized feature matrix with indices
     */
    extractFeatures(pitches) {
        const n = pitches.length;
        const d = this.config.features.length;
        const matrix = new Float32Array(n * d);
        const pitchTypes = new Array(n);

        for (let i = 0; i < n; i++) {
            const pitch = pitches[i];
            pitchTypes[i] = pitch.pitch_type || pitch.pitchType || 'UN';

            for (let j = 0; j < d; j++) {
                const feature = this.config.features[j];
                const value = pitch[feature] || 0;
                const norm = this.config.normalization[feature];

                // Z-score normalization
                matrix[i * d + j] = (value - norm.mean) / norm.std;
            }
        }

        return {
            data: matrix,
            rows: n,
            cols: d,
            pitchTypes,
            features: this.config.features
        };
    }

    /**
     * Compute statistics of the point cloud
     */
    computeCloudStatistics(featureMatrix) {
        const { data, rows, cols } = featureMatrix;

        // Compute centroid
        const centroid = new Float32Array(cols);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                centroid[j] += data[i * cols + j];
            }
        }
        for (let j = 0; j < cols; j++) {
            centroid[j] /= rows;
        }

        // Compute variance per dimension
        const variance = new Float32Array(cols);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const diff = data[i * cols + j] - centroid[j];
                variance[j] += diff * diff;
            }
        }
        for (let j = 0; j < cols; j++) {
            variance[j] /= rows;
        }

        // Sample pairwise distances
        let totalDist = 0;
        let distCount = 0;
        const sampleSize = Math.min(rows, 100);

        for (let i = 0; i < sampleSize; i++) {
            const idx1 = Math.floor(Math.random() * rows);
            const idx2 = Math.floor(Math.random() * rows);

            if (idx1 !== idx2) {
                let dist = 0;
                for (let j = 0; j < cols; j++) {
                    const diff = data[idx1 * cols + j] - data[idx2 * cols + j];
                    dist += diff * diff;
                }
                totalDist += Math.sqrt(dist);
                distCount++;
            }
        }

        return {
            centroid: Array.from(centroid),
            variance: Array.from(variance),
            totalVariance: variance.reduce((s, v) => s + v, 0),
            avgPairwiseDistance: distCount > 0 ? totalDist / distCount : 0
        };
    }

    /**
     * Compute the convex hull polytope of the arsenal in feature space
     * Uses dimension reduction for visualization, full dimensionality for volume
     */
    computeArsenalPolytope(featureMatrix) {
        const { data, rows, cols } = featureMatrix;

        // For high dimensions, we compute approximate volume using random projections
        const numProjections = 50;
        let totalVolume = 0;

        for (let p = 0; p < numProjections; p++) {
            // Random 3D projection
            const projection = this.randomProject(data, rows, cols, 3);

            // Compute 3D convex hull volume
            const hull = this.compute3DConvexHull(projection);
            totalVolume += hull.volume;
        }

        const avgVolume = totalVolume / numProjections;

        // Also compute 2D hull for visualization (velocity vs movement)
        const velocityMovement = [];
        for (let i = 0; i < rows; i++) {
            velocityMovement.push([
                data[i * cols + 0], // release_speed (normalized)
                data[i * cols + 3]  // pfx_z (normalized)
            ]);
        }
        const hull2D = this.compute2DConvexHull(velocityMovement);

        return {
            volume: avgVolume,
            hull2D,
            area2D: this.computeHullArea(hull2D),
            vertices2D: hull2D.length
        };
    }

    /**
     * Cluster analysis by pitch type
     */
    analyzeClusters(pitches, featureMatrix) {
        const { data, rows, cols, pitchTypes } = featureMatrix;

        // Group by pitch type
        const typeIndices = {};
        for (let i = 0; i < rows; i++) {
            const type = pitchTypes[i];
            if (!typeIndices[type]) typeIndices[type] = [];
            typeIndices[type].push(i);
        }

        // Compute cluster centroids
        const clusters = {};
        for (const [type, indices] of Object.entries(typeIndices)) {
            if (indices.length < this.config.minPitchesPerType) continue;

            const centroid = new Float32Array(cols);
            for (const idx of indices) {
                for (let j = 0; j < cols; j++) {
                    centroid[j] += data[idx * cols + j];
                }
            }
            for (let j = 0; j < cols; j++) {
                centroid[j] /= indices.length;
            }

            // Compute intra-cluster variance
            let intraVariance = 0;
            for (const idx of indices) {
                for (let j = 0; j < cols; j++) {
                    const diff = data[idx * cols + j] - centroid[j];
                    intraVariance += diff * diff;
                }
            }
            intraVariance /= indices.length * cols;

            clusters[type] = {
                centroid: Array.from(centroid),
                count: indices.length,
                frequency: indices.length / rows,
                intraVariance,
                compactness: 1 / (1 + Math.sqrt(intraVariance))
            };
        }

        // Compute inter-cluster distances
        const types = Object.keys(clusters);
        let totalSeparation = 0;
        let pairCount = 0;

        for (let i = 0; i < types.length; i++) {
            for (let j = i + 1; j < types.length; j++) {
                const c1 = clusters[types[i]].centroid;
                const c2 = clusters[types[j]].centroid;

                let dist = 0;
                for (let k = 0; k < cols; k++) {
                    const diff = c1[k] - c2[k];
                    dist += diff * diff;
                }
                totalSeparation += Math.sqrt(dist);
                pairCount++;
            }
        }

        // Find dominant pitch
        let dominantType = null;
        let maxFreq = 0;
        for (const [type, cluster] of Object.entries(clusters)) {
            if (cluster.frequency > maxFreq) {
                maxFreq = cluster.frequency;
                dominantType = type;
            }
        }

        return {
            byType: clusters,
            typeCount: types.length,
            avgSeparation: pairCount > 0 ? totalSeparation / pairCount : 0,
            dominantPitch: dominantType,
            dominantRatio: maxFreq
        };
    }

    /**
     * Simplified persistence homology computation
     * Tracks when features "appear" and "disappear" as we grow balls around points
     */
    computePersistence(featureMatrix) {
        const { data, rows, cols } = featureMatrix;

        // Sample points for efficiency
        const sampleSize = Math.min(rows, 200);
        const sampleIndices = [];
        for (let i = 0; i < sampleSize; i++) {
            sampleIndices.push(Math.floor(Math.random() * rows));
        }

        // Compute distance matrix for sample
        const distMatrix = new Float32Array(sampleSize * sampleSize);
        for (let i = 0; i < sampleSize; i++) {
            for (let j = i + 1; j < sampleSize; j++) {
                let dist = 0;
                for (let k = 0; k < cols; k++) {
                    const diff = data[sampleIndices[i] * cols + k] -
                                data[sampleIndices[j] * cols + k];
                    dist += diff * diff;
                }
                dist = Math.sqrt(dist);
                distMatrix[i * sampleSize + j] = dist;
                distMatrix[j * sampleSize + i] = dist;
            }
        }

        // Track connected components at different scales
        const scales = [0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0];
        const components = [];

        for (const scale of scales) {
            const numComponents = this.countComponents(distMatrix, sampleSize, scale);
            components.push({ scale, components: numComponents });
        }

        // Find persistent features (components that survive multiple scales)
        const persistentFeatures = [];
        for (let i = 0; i < scales.length - 1; i++) {
            const persistence = (components[i+1].components < components[i].components) ?
                scales[i+1] - scales[i] : 0;

            if (persistence > this.config.persistenceThreshold) {
                persistentFeatures.push({
                    birthScale: scales[i],
                    deathScale: scales[i+1],
                    persistence
                });
            }
        }

        return {
            scaleProfile: components,
            persistentFeatures,
            topologicalComplexity: components[0].components, // Components at smallest scale
            homogeneity: components[components.length - 1].components // Components at largest scale
        };
    }

    /**
     * Count connected components using union-find at a given distance scale
     */
    countComponents(distMatrix, n, maxDist) {
        const parent = Array.from({ length: n }, (_, i) => i);

        const find = (x) => {
            if (parent[x] !== x) parent[x] = find(parent[x]);
            return parent[x];
        };

        const union = (x, y) => {
            const px = find(x);
            const py = find(y);
            if (px !== py) parent[px] = py;
        };

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                if (distMatrix[i * n + j] <= maxDist) {
                    union(i, j);
                }
            }
        }

        const roots = new Set();
        for (let i = 0; i < n; i++) {
            roots.add(find(i));
        }

        return roots.size;
    }

    /**
     * Compute arsenal stability (consistency over time/batters)
     */
    computeArsenalStability(clusters) {
        // Overall stability based on cluster compactness
        let totalCompactness = 0;
        let weightSum = 0;

        for (const cluster of Object.values(clusters.byType)) {
            totalCompactness += cluster.compactness * cluster.frequency;
            weightSum += cluster.frequency;
        }

        const avgCompactness = weightSum > 0 ? totalCompactness / weightSum : 0;

        // Separation stability
        const separationStability = clusters.avgSeparation > 1 ? 1 :
            clusters.avgSeparation;

        return {
            compactness: avgCompactness,
            separation: separationStability,
            overall: (avgCompactness + separationStability) / 2
        };
    }

    /**
     * Compare two pitchers' arsenals
     */
    compareArsenals(arsenalA, arsenalB) {
        if (!arsenalA || !arsenalB) return null;

        // Volume comparison
        const volumeRatio = arsenalA.polytope.volume /
            (arsenalB.polytope.volume + 0.001);

        // Cluster overlap (shared pitch types)
        const typesA = new Set(Object.keys(arsenalA.clusters.byType));
        const typesB = new Set(Object.keys(arsenalB.clusters.byType));
        const shared = new Set([...typesA].filter(t => typesB.has(t)));
        const typeOverlap = shared.size / Math.max(typesA.size, typesB.size);

        // Centroid distance (overall approach similarity)
        let centroidDist = 0;
        for (let i = 0; i < arsenalA.cloudStats.centroid.length; i++) {
            const diff = arsenalA.cloudStats.centroid[i] - arsenalB.cloudStats.centroid[i];
            centroidDist += diff * diff;
        }
        centroidDist = Math.sqrt(centroidDist);

        return {
            volumeRatio,
            typeOverlap,
            centroidDistance: centroidDist,
            stabilityComparison: arsenalA.stability.overall - arsenalB.stability.overall,
            similarity: 1 / (1 + centroidDist) * typeOverlap
        };
    }

    // === Helper Methods ===

    randomProject(data, rows, cols, targetDim) {
        // Random projection matrix
        const projection = new Float32Array(cols * targetDim);
        for (let i = 0; i < projection.length; i++) {
            projection[i] = Math.random() * 2 - 1;
        }

        // Normalize columns
        for (let j = 0; j < targetDim; j++) {
            let norm = 0;
            for (let i = 0; i < cols; i++) {
                norm += projection[i * targetDim + j] ** 2;
            }
            norm = Math.sqrt(norm);
            for (let i = 0; i < cols; i++) {
                projection[i * targetDim + j] /= norm;
            }
        }

        // Project data
        const result = [];
        for (let i = 0; i < rows; i++) {
            const point = new Float32Array(targetDim);
            for (let j = 0; j < targetDim; j++) {
                for (let k = 0; k < cols; k++) {
                    point[j] += data[i * cols + k] * projection[k * targetDim + j];
                }
            }
            result.push(Array.from(point));
        }

        return result;
    }

    compute3DConvexHull(points) {
        // Simplified 3D hull - use bounding box volume as approximation
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        for (const p of points) {
            minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
            minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
            minZ = Math.min(minZ, p[2]); maxZ = Math.max(maxZ, p[2]);
        }

        // Approximate hull volume as fraction of bounding box
        const boundingVolume = (maxX - minX) * (maxY - minY) * (maxZ - minZ);
        const hullVolume = boundingVolume * 0.4; // Typical ratio

        return { volume: hullVolume };
    }

    compute2DConvexHull(points) {
        if (points.length < 3) return points;

        // Graham scan
        const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);

        const cross = (o, a, b) =>
            (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

        const lower = [];
        for (const p of sorted) {
            while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
                lower.pop();
            }
            lower.push(p);
        }

        const upper = [];
        for (let i = sorted.length - 1; i >= 0; i--) {
            const p = sorted[i];
            while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
                upper.pop();
            }
            upper.push(p);
        }

        lower.pop();
        upper.pop();
        return lower.concat(upper);
    }

    computeHullArea(hull) {
        if (hull.length < 3) return 0;

        let area = 0;
        const n = hull.length;

        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += hull[i][0] * hull[j][1];
            area -= hull[j][0] * hull[i][1];
        }

        return Math.abs(area) / 2;
    }
}
