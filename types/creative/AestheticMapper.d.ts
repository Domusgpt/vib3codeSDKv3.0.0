/**
 * VIB3+ Aesthetic Mapper Type Definitions
 * Maps natural language descriptions to VIB3+ parameter ranges.
 */

export interface ParameterRange {
    min: number;
    max: number;
}

export interface AestheticMapping {
    params?: Record<string, ParameterRange>;
    suggested_system?: 'quantum' | 'faceted' | 'holographic';
    suggested_geometry?: number;
    color_preset?: string;
    effects?: string[];
}

export interface AestheticResult {
    params: Record<string, ParameterRange>;
    system: string | null;
    geometry: number | null;
    colorPreset: string | null;
    effects: string[];
    matchCount: number;
}

export interface AestheticValues {
    params: Record<string, number>;
    system: string | null;
    geometry: number | null;
    colorPreset: string | null;
    effects: string[];
}

export interface VocabularyEntry {
    word: string;
    category: string;
    mapping: AestheticMapping;
}

export class AestheticMapper {
    static VOCABULARY: Record<string, AestheticMapping>;

    constructor();

    /**
     * Map a text description to parameter ranges.
     * @param description - Natural language description (e.g., "energetic neon geometric")
     * @returns Mapped result with params, system, geometry, effects
     */
    mapDescription(description: string): AestheticResult;

    /**
     * Map a description to concrete parameter values (midpoints of ranges).
     * @param description - Natural language description
     * @returns Resolved values ready for engine.setParameter()
     */
    resolveToValues(description: string): AestheticValues;

    /**
     * Get all vocabulary words.
     * @returns Array of vocabulary entries
     */
    getVocabulary(): VocabularyEntry[];

    /**
     * Get vocabulary grouped by category.
     * @returns Object with category keys and arrays of words
     */
    getVocabularyByCategory(): Record<string, string[]>;
}
