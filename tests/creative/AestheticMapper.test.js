import { describe, it, expect, beforeEach } from 'vitest';
import { AestheticMapper } from '../../src/creative/AestheticMapper.js';

describe('AestheticMapper', () => {
    let mapper;

    beforeEach(() => {
        mapper = new AestheticMapper();
    });

    describe('constructor', () => {
        it('initializes with vocabulary', () => {
            expect(mapper._vocabulary).toBe(AestheticMapper.VOCABULARY);
        });
    });

    describe('mapDescription', () => {
        it('maps a single emotion word', () => {
            const result = mapper.mapDescription('serene');
            expect(result.matched_words).toBe(1);
            expect(result.total_words).toBe(1);
            expect(result.params).toHaveProperty('speed');
            expect(result.params.speed.min).toBeLessThanOrEqual(result.params.speed.max);
        });

        it('maps multiple words from different categories', () => {
            const result = mapper.mapDescription('serene ocean deep');
            expect(result.matched_words).toBe(3);
            expect(result.total_words).toBe(3);
            expect(result.system).toBeDefined();
            expect(typeof result.geometry).toBe('number');
        });

        it('narrows parameter ranges with multiple words', () => {
            const serene = mapper.mapDescription('serene');
            const combined = mapper.mapDescription('serene calm');

            // Combined ranges should be equal or narrower
            if (serene.params.speed && combined.params.speed) {
                expect(combined.params.speed.min).toBeGreaterThanOrEqual(serene.params.speed.min);
                expect(combined.params.speed.max).toBeLessThanOrEqual(serene.params.speed.max);
            }
        });

        it('returns default result for empty input', () => {
            const result = mapper.mapDescription('');
            expect(result.matched_words).toBe(0);
            expect(result.system).toBe('quantum');
            expect(result.geometry).toBe(0);
        });

        it('returns default result for null input', () => {
            const result = mapper.mapDescription(null);
            expect(result.matched_words).toBe(0);
        });

        it('handles unrecognized words gracefully', () => {
            const result = mapper.mapDescription('asdf xyz123');
            expect(result.matched_words).toBe(0);
            expect(result.total_words).toBe(2);
        });

        it('strips non-alphanumeric characters', () => {
            const result = mapper.mapDescription('serene! ocean?? deep...');
            expect(result.matched_words).toBe(3);
        });

        it('is case-insensitive', () => {
            const lower = mapper.mapDescription('serene');
            const upper = mapper.mapDescription('SERENE');
            expect(lower.matched_words).toBe(upper.matched_words);
        });

        it('echoes the original description', () => {
            const result = mapper.mapDescription('energetic neon');
            expect(result.description_echo).toBe('energetic neon');
        });

        it('maps color words to color presets', () => {
            const result = mapper.mapDescription('ocean');
            expect(result.color_preset).toBe('Ocean');
        });

        it('maps style words to post-processing effects', () => {
            const result = mapper.mapDescription('glitchy');
            expect(result.post_processing.length).toBeGreaterThan(0);
            expect(result.post_processing).toContain('glitch');
        });

        it('maps geometry descriptor words to suggested geometries', () => {
            const result = mapper.mapDescription('spherical');
            expect(result.geometry).toBeGreaterThanOrEqual(0);
            expect(result.geometry).toBeLessThanOrEqual(23);
        });

        it('picks the most-voted system from multiple words', () => {
            // quantum is suggested by: energetic, chaotic, mysterious, intricate, abstract, glitchy
            const result = mapper.mapDescription('energetic chaotic intricate');
            expect(result.system).toBe('quantum');
        });

        it('deduplicates post-processing effects', () => {
            // Both energetic and cyberpunk suggest bloom
            const result = mapper.mapDescription('energetic cyberpunk');
            const bloomCount = result.post_processing.filter(e => e === 'bloom').length;
            expect(bloomCount).toBeLessThanOrEqual(1);
        });
    });

    describe('resolveToValues', () => {
        it('returns concrete midpoint values', () => {
            const result = mapper.resolveToValues('serene ocean');
            expect(typeof result.params.speed).toBe('number');
            expect(result.params.speed).toBeGreaterThan(0);
        });

        it('includes system and geometry', () => {
            const result = mapper.resolveToValues('energetic neon');
            expect(result.system).toBeDefined();
            expect(typeof result.geometry).toBe('number');
        });

        it('includes color_preset and post_processing', () => {
            const result = mapper.resolveToValues('cyberpunk glitchy');
            expect(result.color_preset).toBeDefined();
            expect(Array.isArray(result.post_processing)).toBe(true);
        });

        it('midpoint values are within the mapped ranges', () => {
            const mapped = mapper.mapDescription('calm ocean deep');
            const resolved = mapper.resolveToValues('calm ocean deep');

            for (const [param, value] of Object.entries(resolved.params)) {
                const range = mapped.params[param];
                if (range) {
                    expect(value).toBeGreaterThanOrEqual(range.min);
                    expect(value).toBeLessThanOrEqual(range.max);
                }
            }
        });
    });

    describe('getVocabulary', () => {
        it('returns a sorted array of all vocabulary words', () => {
            const vocab = mapper.getVocabulary();
            expect(Array.isArray(vocab)).toBe(true);
            expect(vocab.length).toBeGreaterThan(50); // 60+ words expected

            // Verify sorted
            for (let i = 1; i < vocab.length; i++) {
                expect(vocab[i] >= vocab[i - 1]).toBe(true);
            }
        });

        it('contains no duplicates', () => {
            const vocab = mapper.getVocabulary();
            const unique = [...new Set(vocab)];
            expect(vocab.length).toBe(unique.length);
        });

        it('includes words from all categories', () => {
            const vocab = mapper.getVocabulary();
            expect(vocab).toContain('serene');     // emotion
            expect(vocab).toContain('minimal');    // style
            expect(vocab).toContain('ocean');      // color
            expect(vocab).toContain('slow');       // motion
            expect(vocab).toContain('deep');       // depth
            expect(vocab).toContain('spherical');  // geometry
        });
    });

    describe('getVocabularyByCategory', () => {
        it('returns an object keyed by category', () => {
            const byCategory = mapper.getVocabularyByCategory();
            expect(byCategory).toHaveProperty('emotions');
            expect(byCategory).toHaveProperty('styles');
            expect(byCategory).toHaveProperty('colors');
            expect(byCategory).toHaveProperty('motion');
            expect(byCategory).toHaveProperty('depth');
            expect(byCategory).toHaveProperty('geometry');
        });

        it('each category contains word arrays', () => {
            const byCategory = mapper.getVocabularyByCategory();
            for (const [category, words] of Object.entries(byCategory)) {
                expect(Array.isArray(words)).toBe(true);
                expect(words.length).toBeGreaterThan(0);
            }
        });

        it('emotions category has 10 words', () => {
            const byCategory = mapper.getVocabularyByCategory();
            expect(byCategory.emotions.length).toBe(10);
            expect(byCategory.emotions).toContain('serene');
            expect(byCategory.emotions).toContain('energetic');
            expect(byCategory.emotions).toContain('dreamy');
        });
    });

    describe('VOCABULARY static', () => {
        it('has 6 categories', () => {
            const categories = Object.keys(AestheticMapper.VOCABULARY);
            expect(categories.length).toBe(6);
        });

        it('each vocabulary entry has valid params structure', () => {
            for (const [category, mappings] of Object.entries(AestheticMapper.VOCABULARY)) {
                for (const [word, mapping] of Object.entries(mappings)) {
                    expect(mapping).toHaveProperty('params');
                    for (const [param, range] of Object.entries(mapping.params)) {
                        expect(typeof range.min).toBe('number');
                        expect(typeof range.max).toBe('number');
                        expect(range.min).toBeLessThanOrEqual(range.max);
                    }
                }
            }
        });

        it('parameter ranges are within VIB3+ valid bounds', () => {
            const bounds = {
                speed: [0.1, 3.0],
                chaos: [0, 1],
                intensity: [0, 1],
                saturation: [0, 1],
                morphFactor: [0, 2],
                hue: [0, 360],
                gridDensity: [4, 100],
                dimension: [3.0, 4.5]
            };

            for (const [category, mappings] of Object.entries(AestheticMapper.VOCABULARY)) {
                for (const [word, mapping] of Object.entries(mappings)) {
                    for (const [param, range] of Object.entries(mapping.params)) {
                        if (bounds[param]) {
                            expect(range.min).toBeGreaterThanOrEqual(bounds[param][0]);
                            expect(range.max).toBeLessThanOrEqual(bounds[param][1]);
                        }
                    }
                }
            }
        });
    });

    describe('partial matching', () => {
        it('matches partial words via substring', () => {
            // "geometric" should match "geometric" vocabulary entry
            const result = mapper.mapDescription('geometric');
            expect(result.matched_words).toBe(1);
        });
    });

    describe('real-world design descriptions', () => {
        it('handles "serene ocean deep organic"', () => {
            const result = mapper.resolveToValues('serene ocean deep organic');
            expect(result.params.speed).toBeLessThan(1.0);
            expect(result.params.chaos).toBeLessThanOrEqual(0.5);
        });

        it('handles "energetic neon glitchy fast"', () => {
            const result = mapper.resolveToValues('energetic neon glitchy fast');
            expect(result.params.speed).toBeGreaterThan(1.0);
        });

        it('handles "mysterious galaxy deep cinematic"', () => {
            const result = mapper.resolveToValues('mysterious galaxy deep cinematic');
            expect(result.post_processing.length).toBeGreaterThan(0);
        });
    });
});
