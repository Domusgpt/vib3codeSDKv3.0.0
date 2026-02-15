/**
 * LayerRelationshipGraph — TypeScript definitions
 *
 * Keystone-driven inter-layer parameter system for the VIB3+ 5-layer canvas architecture.
 */

/** Standard layer names, back to front */
export type LayerName = 'background' | 'shadow' | 'content' | 'highlight' | 'accent';

/** Layer order array */
export declare const LAYER_ORDER: readonly LayerName[];

/**
 * A relationship function takes keystone parameters and time,
 * and returns derived parameters for a dependent layer.
 */
export type RelationshipFn = (keystoneParams: Record<string, unknown>, time: number) => Record<string, unknown>;

/** Available preset relationship names */
export type RelationshipPreset = 'echo' | 'mirror' | 'complement' | 'harmonic' | 'reactive' | 'chase';

/** Available profile names */
export type RelationshipProfileName = 'holographic' | 'symmetry' | 'chord' | 'storm' | 'legacy';

// ============================================================================
// Preset Configs
// ============================================================================

export interface EchoConfig {
    opacity?: number;
    densityScale?: number;
    speedScale?: number;
    intensityScale?: number;
}

export interface MirrorConfig {
    opacity?: number;
    invertRotation?: boolean;
    hueShift?: number;
}

export interface ComplementConfig {
    opacity?: number;
    densityPivot?: number;
    chaosInvert?: boolean;
}

export interface HarmonicConfig {
    opacity?: number;
    densityHarmonic?: number;
    speedRatio?: number;
    hueAngle?: number;
}

export interface ReactiveConfig {
    opacity?: number;
    gain?: number;
    decay?: number;
}

export interface ChaseConfig {
    opacity?: number;
    lerpRate?: number;
}

/** Union of all preset config types */
export type PresetConfig = EchoConfig | MirrorConfig | ComplementConfig | HarmonicConfig | ReactiveConfig | ChaseConfig;

/** Serializable relationship specification */
export interface RelationshipConfig {
    preset: RelationshipPreset;
    config?: PresetConfig;
}

// ============================================================================
// Profiles
// ============================================================================

export interface LayerRelationshipProfile {
    keystone: LayerName;
    relationships: Partial<Record<LayerName, RelationshipConfig>>;
}

// ============================================================================
// Export/Import
// ============================================================================

export interface LayerRelationshipExport {
    keystone: LayerName;
    profile: RelationshipProfileName | null;
    relationships: Partial<Record<LayerName, RelationshipConfig | null>>;
    shaders: Partial<Record<LayerName, string>>;
}

// ============================================================================
// Preset Factories
// ============================================================================

export declare function echo(config?: EchoConfig): RelationshipFn;
export declare function mirror(config?: MirrorConfig): RelationshipFn;
export declare function complement(config?: ComplementConfig): RelationshipFn;
export declare function harmonic(config?: HarmonicConfig): RelationshipFn;
export declare function reactive(config?: ReactiveConfig): RelationshipFn;
export declare function chase(config?: ChaseConfig): RelationshipFn;

export declare const PRESET_REGISTRY: Record<RelationshipPreset, (...args: any[]) => RelationshipFn>;
export declare const PROFILES: Record<RelationshipProfileName, LayerRelationshipProfile>;

// ============================================================================
// LayerRelationshipGraph
// ============================================================================

export interface LayerRelationshipGraphOptions {
    keystone?: LayerName;
    profile?: RelationshipProfileName;
}

export declare class LayerRelationshipGraph {
    constructor(config?: LayerRelationshipGraphOptions);

    /** The current keystone (driver) layer */
    readonly keystone: LayerName;

    /** Currently active profile name, or null if custom */
    readonly activeProfile: RelationshipProfileName | null;

    /** Available profile names */
    static readonly profileNames: RelationshipProfileName[];

    /** Available preset relationship names */
    static readonly presetNames: RelationshipPreset[];

    /** Set the keystone (driver) layer */
    setKeystone(layerName: LayerName): void;

    /**
     * Set the relationship for a dependent layer.
     * Accepts a preset name, a custom function, or a { preset, config } object.
     */
    setRelationship(
        layerName: LayerName,
        relationship: RelationshipPreset | RelationshipFn | RelationshipConfig
    ): void;

    /** Set the shader program for a specific layer */
    setLayerShader(layerName: LayerName, shaderName: string): void;

    /** Get the shader name for a layer (null = use default) */
    getLayerShader(layerName: LayerName): string | null;

    /** Load a named profile, configuring the full graph at once */
    loadProfile(profileName: RelationshipProfileName): void;

    /** Resolve parameters for a single dependent layer */
    resolve(
        keystoneParams: Record<string, unknown>,
        layerName: LayerName,
        time: number
    ): Record<string, unknown>;

    /** Resolve parameters for all layers at once */
    resolveAll(
        keystoneParams: Record<string, unknown>,
        time: number
    ): Record<LayerName, Record<string, unknown>>;

    /** Export the graph configuration for saving */
    exportConfig(): LayerRelationshipExport;

    /** Import a graph configuration */
    importConfig(config: LayerRelationshipExport): void;
}

export default LayerRelationshipGraph;
