/**
 * AestheticMapper.js - Text-Description to VIB3+ Parameter Mapping
 *
 * Maps natural language aesthetic/emotional descriptions to VIB3+ parameter
 * ranges. Enables the `design_from_description` MCP tool and text-to-visual
 * agent workflows.
 *
 * Vocabulary is organized into categories: emotions, visual styles, color
 * themes, motion qualities, depth effects, and geometric characters. Multiple
 * descriptors can be combined (e.g., "serene organic ocean deep").
 *
 * @module creative/AestheticMapper
 * @version 1.0.0
 */

/**
 * @typedef {Object} ParameterRange
 * @property {number} min - Minimum value
 * @property {number} max - Maximum value
 */

/**
 * @typedef {Object} AestheticMapping
 * @property {Object<string, ParameterRange>} params - Parameter ranges
 * @property {string[]} [suggested_geometries] - Recommended geometry indices
 * @property {string} [suggested_system] - Recommended system
 * @property {string} [color_preset] - Recommended color preset
 * @property {string[]} [post_processing] - Recommended effects
 */

/**
 * Maps text descriptions to VIB3+ parameter configurations.
 *
 * @example
 * const mapper = new AestheticMapper();
 * const result = mapper.mapDescription('serene ocean deep minimal');
 * // result.params = { speed: 0.2, chaos: 0.02, hue: 200, ... }
 * // result.system = 'quantum'
 * // result.geometry = 11
 *
 * @example
 * // Get concrete parameter values (picks midpoint of ranges)
 * const concrete = mapper.resolveToValues('energetic neon geometric');
 */
export class AestheticMapper {
    constructor() {
        this._vocabulary = AestheticMapper.VOCABULARY;
    }

    /**
     * Map a text description to parameter ranges.
     * Accepts space-separated descriptor words.
     *
     * @param {string} description - Natural language description
     * @returns {Object} Mapped result with params, system, geometry, effects
     */
    mapDescription(description) {
        if (!description || typeof description !== 'string') {
            return this._defaultResult();
        }

        const words = description.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 0);

        // Accumulate parameter ranges from all matching descriptors
        const ranges = {};
        const systems = [];
        const geometries = [];
        const colorPresets = [];
        const effects = [];
        let matchCount = 0;

        for (const word of words) {
            const mapping = this._findMapping(word);
            if (!mapping) continue;
            matchCount++;

            // Merge parameter ranges (intersection — narrow toward overlap)
            if (mapping.params) {
                for (const [param, range] of Object.entries(mapping.params)) {
                    if (!ranges[param]) {
                        ranges[param] = { min: range.min, max: range.max };
                    } else {
                        // Narrow the range toward the intersection
                        ranges[param].min = Math.max(ranges[param].min, range.min);
                        ranges[param].max = Math.min(ranges[param].max, range.max);
                        // If ranges don't overlap, use the new range's midpoint
                        if (ranges[param].min > ranges[param].max) {
                            const mid = (range.min + range.max) / 2;
                            ranges[param].min = mid;
                            ranges[param].max = mid;
                        }
                    }
                }
            }

            if (mapping.suggested_system) systems.push(mapping.suggested_system);
            if (mapping.suggested_geometries) geometries.push(...mapping.suggested_geometries);
            if (mapping.color_preset) colorPresets.push(mapping.color_preset);
            if (mapping.post_processing) effects.push(...mapping.post_processing);
        }

        // Pick the most voted system, geometry, preset
        const system = this._mostCommon(systems) || 'quantum';
        const geometry = this._mostCommon(geometries) ?? 0;
        const colorPreset = this._mostCommon(colorPresets) || null;
        const uniqueEffects = [...new Set(effects)];

        return {
            matched_words: matchCount,
            total_words: words.length,
            params: ranges,
            system,
            geometry: typeof geometry === 'number' ? geometry : parseInt(geometry, 10),
            color_preset: colorPreset,
            post_processing: uniqueEffects,
            description_echo: description
        };
    }

    /**
     * Resolve a description to concrete parameter values (midpoint of ranges).
     *
     * @param {string} description - Natural language description
     * @returns {Object} Concrete parameter values ready for engine.setParameter()
     */
    resolveToValues(description) {
        const mapped = this.mapDescription(description);
        const values = {};

        for (const [param, range] of Object.entries(mapped.params)) {
            values[param] = (range.min + range.max) / 2;
        }

        return {
            system: mapped.system,
            geometry: mapped.geometry,
            params: values,
            color_preset: mapped.color_preset,
            post_processing: mapped.post_processing
        };
    }

    /**
     * Get all known descriptor words.
     * @returns {string[]}
     */
    getVocabulary() {
        const words = new Set();
        for (const category of Object.values(this._vocabulary)) {
            for (const word of Object.keys(category)) {
                words.add(word);
            }
        }
        return [...words].sort();
    }

    /**
     * Get vocabulary organized by category.
     * @returns {Object<string, string[]>}
     */
    getVocabularyByCategory() {
        const result = {};
        for (const [category, mappings] of Object.entries(this._vocabulary)) {
            result[category] = Object.keys(mappings);
        }
        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Internal
    // ─────────────────────────────────────────────────────────────────────────

    _findMapping(word) {
        for (const category of Object.values(this._vocabulary)) {
            if (category[word]) return category[word];
        }
        // Try partial matching for compound descriptors
        for (const category of Object.values(this._vocabulary)) {
            for (const [key, mapping] of Object.entries(category)) {
                if (word.includes(key) || key.includes(word)) return mapping;
            }
        }
        return null;
    }

    _mostCommon(arr) {
        if (arr.length === 0) return null;
        const counts = {};
        for (const item of arr) {
            counts[item] = (counts[item] || 0) + 1;
        }
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    }

    _defaultResult() {
        return {
            matched_words: 0,
            total_words: 0,
            params: {},
            system: 'quantum',
            geometry: 0,
            color_preset: null,
            post_processing: [],
            description_echo: ''
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Vocabulary
    // ─────────────────────────────────────────────────────────────────────────

    static VOCABULARY = {
        // ── Emotions ──
        emotions: {
            serene: {
                params: {
                    speed: { min: 0.1, max: 0.3 },
                    chaos: { min: 0, max: 0.05 },
                    intensity: { min: 0.3, max: 0.5 },
                    morphFactor: { min: 0, max: 0.2 }
                },
                suggested_system: 'faceted',
                color_preset: 'Ethereal'
            },
            calm: {
                params: {
                    speed: { min: 0.1, max: 0.4 },
                    chaos: { min: 0, max: 0.08 },
                    intensity: { min: 0.3, max: 0.6 },
                    gridDensity: { min: 8, max: 20 }
                },
                suggested_system: 'faceted',
                color_preset: 'Ice'
            },
            peaceful: {
                params: {
                    speed: { min: 0.15, max: 0.35 },
                    chaos: { min: 0, max: 0.03 },
                    intensity: { min: 0.4, max: 0.6 }
                },
                suggested_system: 'holographic',
                color_preset: 'Pastel'
            },
            energetic: {
                params: {
                    speed: { min: 2.0, max: 3.0 },
                    chaos: { min: 0.5, max: 1.0 },
                    intensity: { min: 0.7, max: 1.0 },
                    morphFactor: { min: 0.8, max: 2.0 }
                },
                suggested_system: 'quantum',
                color_preset: 'Neon',
                post_processing: ['bloom', 'chromaticAberration']
            },
            chaotic: {
                params: {
                    speed: { min: 1.5, max: 3.0 },
                    chaos: { min: 0.7, max: 1.0 },
                    intensity: { min: 0.6, max: 1.0 },
                    morphFactor: { min: 1.0, max: 2.0 },
                    gridDensity: { min: 30, max: 80 }
                },
                suggested_system: 'quantum',
                post_processing: ['glitch', 'rgbShift', 'noise']
            },
            mysterious: {
                params: {
                    speed: { min: 0.3, max: 0.6 },
                    chaos: { min: 0.1, max: 0.3 },
                    hue: { min: 220, max: 280 },
                    intensity: { min: 0.2, max: 0.4 },
                    dimension: { min: 3.0, max: 3.4 }
                },
                suggested_system: 'quantum',
                color_preset: 'Midnight',
                post_processing: ['vignette']
            },
            joyful: {
                params: {
                    speed: { min: 1.0, max: 1.5 },
                    chaos: { min: 0.2, max: 0.4 },
                    hue: { min: 30, max: 60 },
                    intensity: { min: 0.7, max: 0.9 },
                    saturation: { min: 0.7, max: 1.0 }
                },
                suggested_system: 'holographic',
                color_preset: 'Tropical'
            },
            melancholic: {
                params: {
                    speed: { min: 0.2, max: 0.5 },
                    chaos: { min: 0.05, max: 0.15 },
                    hue: { min: 200, max: 260 },
                    intensity: { min: 0.2, max: 0.4 },
                    saturation: { min: 0.3, max: 0.5 }
                },
                suggested_system: 'quantum',
                color_preset: 'Galaxy',
                post_processing: ['vignette', 'filmGrain']
            },
            angry: {
                params: {
                    speed: { min: 2.0, max: 3.0 },
                    chaos: { min: 0.6, max: 1.0 },
                    hue: { min: 0, max: 20 },
                    intensity: { min: 0.8, max: 1.0 }
                },
                suggested_system: 'quantum',
                color_preset: 'Fire',
                post_processing: ['chromaticAberration', 'distort']
            },
            dreamy: {
                params: {
                    speed: { min: 0.3, max: 0.7 },
                    chaos: { min: 0.1, max: 0.25 },
                    intensity: { min: 0.5, max: 0.7 },
                    saturation: { min: 0.4, max: 0.7 },
                    dimension: { min: 3.3, max: 3.8 }
                },
                suggested_system: 'holographic',
                color_preset: 'Vaporwave',
                post_processing: ['bloom', 'blur']
            }
        },

        // ── Visual Styles ──
        styles: {
            minimal: {
                params: {
                    gridDensity: { min: 4, max: 10 },
                    chaos: { min: 0, max: 0.02 },
                    morphFactor: { min: 0, max: 0.1 }
                },
                suggested_system: 'faceted'
            },
            intricate: {
                params: {
                    gridDensity: { min: 40, max: 80 },
                    chaos: { min: 0.1, max: 0.3 },
                    morphFactor: { min: 0.3, max: 1.0 }
                },
                suggested_system: 'quantum',
                suggested_geometries: [5, 13, 21]  // fractal variants
            },
            organic: {
                params: {
                    chaos: { min: 0.3, max: 0.7 },
                    morphFactor: { min: 0.5, max: 1.5 },
                    speed: { min: 0.5, max: 1.0 },
                    gridDensity: { min: 15, max: 35 }
                },
                suggested_geometries: [3, 11, 2, 10]  // torus, hypersphere-torus, sphere variants
            },
            geometric: {
                params: {
                    chaos: { min: 0, max: 0.05 },
                    gridDensity: { min: 15, max: 30 },
                    morphFactor: { min: 0, max: 0.2 }
                },
                suggested_system: 'faceted',
                suggested_geometries: [0, 1, 7, 8, 9, 16]  // tetra, cube, crystal
            },
            abstract: {
                params: {
                    chaos: { min: 0.2, max: 0.6 },
                    morphFactor: { min: 0.5, max: 1.5 },
                    dimension: { min: 3.0, max: 3.5 }
                },
                suggested_system: 'quantum',
                suggested_geometries: [4, 12, 20, 5, 13]  // klein, fractal variants
            },
            crystalline: {
                params: {
                    chaos: { min: 0, max: 0.1 },
                    gridDensity: { min: 20, max: 50 },
                    intensity: { min: 0.6, max: 0.9 },
                    saturation: { min: 0.5, max: 0.8 }
                },
                suggested_system: 'faceted',
                suggested_geometries: [7, 15, 23],  // crystal variants
                color_preset: 'Ice'
            },
            glitchy: {
                params: {
                    chaos: { min: 0.5, max: 1.0 },
                    speed: { min: 1.5, max: 3.0 },
                    morphFactor: { min: 1.0, max: 2.0 }
                },
                suggested_system: 'quantum',
                post_processing: ['glitch', 'rgbShift', 'scanlines', 'noise']
            },
            cinematic: {
                params: {
                    speed: { min: 0.3, max: 0.6 },
                    chaos: { min: 0.1, max: 0.25 },
                    intensity: { min: 0.5, max: 0.7 }
                },
                suggested_system: 'holographic',
                post_processing: ['vignette', 'filmGrain', 'colorGrade']
            }
        },

        // ── Color Themes ──
        colors: {
            ocean: {
                params: {
                    hue: { min: 180, max: 220 },
                    saturation: { min: 0.6, max: 0.9 }
                },
                color_preset: 'Ocean',
                suggested_geometries: [6, 14, 3, 11]  // wave, torus variants
            },
            fire: {
                params: {
                    hue: { min: 0, max: 30 },
                    saturation: { min: 0.8, max: 1.0 },
                    intensity: { min: 0.7, max: 1.0 }
                },
                color_preset: 'Fire'
            },
            ice: {
                params: {
                    hue: { min: 180, max: 210 },
                    saturation: { min: 0.3, max: 0.6 },
                    intensity: { min: 0.6, max: 0.9 }
                },
                color_preset: 'Ice',
                suggested_geometries: [7, 15, 23]  // crystal variants
            },
            neon: {
                params: {
                    hue: { min: 270, max: 330 },
                    saturation: { min: 0.9, max: 1.0 },
                    intensity: { min: 0.8, max: 1.0 }
                },
                color_preset: 'Neon',
                post_processing: ['bloom']
            },
            sunset: {
                params: {
                    hue: { min: 15, max: 45 },
                    saturation: { min: 0.7, max: 0.9 },
                    intensity: { min: 0.6, max: 0.8 }
                },
                color_preset: 'Sunset'
            },
            forest: {
                params: {
                    hue: { min: 100, max: 140 },
                    saturation: { min: 0.5, max: 0.7 }
                },
                color_preset: 'Forest'
            },
            galaxy: {
                params: {
                    hue: { min: 240, max: 280 },
                    saturation: { min: 0.6, max: 0.9 },
                    intensity: { min: 0.3, max: 0.5 }
                },
                color_preset: 'Galaxy',
                suggested_geometries: [2, 10, 18]  // sphere variants
            },
            cyberpunk: {
                params: {
                    hue: { min: 260, max: 300 },
                    saturation: { min: 0.8, max: 1.0 },
                    intensity: { min: 0.7, max: 0.9 }
                },
                color_preset: 'Cyberpunk',
                post_processing: ['bloom', 'scanlines', 'chromaticAberration']
            },
            monochrome: {
                params: {
                    saturation: { min: 0, max: 0.1 },
                    intensity: { min: 0.4, max: 0.7 }
                },
                color_preset: 'Monochrome'
            },
            warm: {
                params: {
                    hue: { min: 10, max: 50 },
                    saturation: { min: 0.6, max: 0.9 },
                    intensity: { min: 0.6, max: 0.8 }
                },
                color_preset: 'Lava'
            },
            cool: {
                params: {
                    hue: { min: 180, max: 240 },
                    saturation: { min: 0.5, max: 0.8 }
                },
                color_preset: 'Ocean'
            }
        },

        // ── Motion Qualities ──
        motion: {
            slow: {
                params: { speed: { min: 0.1, max: 0.4 } }
            },
            fast: {
                params: { speed: { min: 2.0, max: 3.0 } }
            },
            flowing: {
                params: {
                    speed: { min: 0.5, max: 1.0 },
                    chaos: { min: 0.1, max: 0.3 },
                    morphFactor: { min: 0.3, max: 0.8 }
                },
                suggested_geometries: [6, 14, 3, 11]  // wave, torus variants
            },
            pulsing: {
                params: {
                    speed: { min: 0.8, max: 1.5 },
                    morphFactor: { min: 0.5, max: 1.5 }
                }
            },
            breathing: {
                params: {
                    speed: { min: 0.2, max: 0.5 },
                    morphFactor: { min: 0.2, max: 0.6 },
                    chaos: { min: 0.02, max: 0.1 }
                }
            },
            spinning: {
                params: {
                    speed: { min: 1.0, max: 2.0 }
                },
                // Implies 4D rotation
                suggested_geometries: [1, 9, 17]  // hypercube variants (best spinning)
            },
            hypnotic: {
                params: {
                    speed: { min: 0.5, max: 0.8 },
                    chaos: { min: 0.05, max: 0.15 },
                    dimension: { min: 3.0, max: 3.4 }
                },
                suggested_system: 'quantum'
            },
            turbulent: {
                params: {
                    chaos: { min: 0.6, max: 1.0 },
                    speed: { min: 1.0, max: 2.5 }
                }
            },
            frozen: {
                params: {
                    speed: { min: 0.1, max: 0.1 },
                    chaos: { min: 0, max: 0 }
                }
            }
        },

        // ── Depth Effects ──
        depth: {
            deep: {
                params: {
                    dimension: { min: 3.0, max: 3.3 },
                    gridDensity: { min: 30, max: 60 }
                }
            },
            flat: {
                params: {
                    dimension: { min: 4.0, max: 4.5 },
                    gridDensity: { min: 8, max: 15 }
                }
            },
            immersive: {
                params: {
                    dimension: { min: 3.0, max: 3.5 }
                }
            },
            distant: {
                params: {
                    dimension: { min: 4.0, max: 4.5 },
                    intensity: { min: 0.2, max: 0.4 },
                    gridDensity: { min: 40, max: 80 }
                }
            },
            close: {
                params: {
                    dimension: { min: 3.0, max: 3.3 },
                    intensity: { min: 0.7, max: 1.0 },
                    gridDensity: { min: 4, max: 12 }
                }
            }
        },

        // ── Geometry Descriptors ──
        geometry: {
            spherical: {
                suggested_geometries: [2, 10, 18],
                params: {}
            },
            cubic: {
                suggested_geometries: [1, 9, 17],
                params: {}
            },
            toroidal: {
                suggested_geometries: [3, 11, 19],
                params: {}
            },
            fractal: {
                suggested_geometries: [5, 13, 21],
                params: { gridDensity: { min: 20, max: 60 } }
            },
            wavy: {
                suggested_geometries: [6, 14, 22],
                params: { chaos: { min: 0.1, max: 0.3 } }
            },
            crystal: {
                suggested_geometries: [7, 15, 23],
                params: {}
            },
            simplex: {
                suggested_geometries: [0, 8, 16],
                params: {}
            },
            twisted: {
                suggested_geometries: [4, 12, 20],  // klein bottle
                params: { morphFactor: { min: 0.3, max: 1.0 } }
            }
        }
    };
}
