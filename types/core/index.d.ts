/**
 * Core Module TypeScript Definitions
 * CanvasManager, ParameterManager, ParameterMapper, VitalitySystem,
 * RendererContracts, UnifiedResourceManager
 */

// ============================================================================
// CanvasManager
// ============================================================================

/** 5-layer canvas names */
export type CanvasLayer = 'background' | 'shadow' | 'content' | 'highlight' | 'accent';

/**
 * Manages 5-layer canvas architecture per visualization system.
 * Creates, tracks, and destroys canvases with WebGL context cleanup.
 */
export declare class CanvasManager {
    readonly containerId: string;
    readonly container: HTMLElement | null;
    currentSystem: string | null;
    createdCanvases: HTMLCanvasElement[];
    registeredContexts: Map<string, WebGLRenderingContext>;

    constructor(containerId?: string);

    /** Create 5 canvases for a system (tears down previous). Returns canvas IDs. */
    createSystemCanvases(systemName: string): string[];

    /** Track a WebGL context for cleanup on destroy. */
    registerContext(canvasId: string, gl: WebGLRenderingContext): void;

    /** Destroy all canvases and force-lose WebGL contexts. */
    destroy(): void;
}

// ============================================================================
// ParameterManager
// ============================================================================

/** Parameter definition for validation */
export interface ParameterDef {
    min: number;
    max: number;
    step: number;
    type: 'int' | 'float';
}

/** Full parameter set */
export interface VIB3Parameters {
    variation: number;
    rot4dXY: number;
    rot4dXZ: number;
    rot4dYZ: number;
    rot4dXW: number;
    rot4dYW: number;
    rot4dZW: number;
    dimension: number;
    gridDensity: number;
    morphFactor: number;
    chaos: number;
    speed: number;
    hue: number;
    intensity: number;
    saturation: number;
    geometry: number;
    [key: string]: number;
}

/** Exported configuration format */
export interface ParameterConfiguration {
    version: string;
    timestamp: string;
    parameters: VIB3Parameters;
    validation: Record<string, ParameterDef>;
}

/**
 * Unified parameter control for all visualization systems.
 * Provides validation, clamping, randomization, HSV conversion,
 * export/import, and variation generation.
 */
export declare class ParameterManager {
    params: VIB3Parameters;
    parameterDefs: Record<string, ParameterDef>;
    defaults: VIB3Parameters;

    constructor();

    /** Get all current parameters (copy). */
    getAllParameters(): VIB3Parameters;

    /** Set a single parameter with validation and clamping. Returns success. */
    setParameter(name: string, value: number): boolean;

    /** Set multiple parameters at once. */
    setParameters(params: Partial<VIB3Parameters>): void;

    /** Reset all parameters to defaults. */
    resetToDefaults(): void;

    /** Randomize all visual parameters within valid ranges. */
    randomize(): void;

    /** Export full configuration with validation schema. */
    exportConfiguration(): ParameterConfiguration;

    /** Load a previously exported configuration. */
    loadConfiguration(config: ParameterConfiguration): void;

    /** Generate a variation with controlled deviation. */
    generateVariation(baseParams: VIB3Parameters, deviation: number): VIB3Parameters;

    /** Convert current HSV parameters to RGB. */
    getColorRGB(): { r: number; g: number; b: number };
}

// ============================================================================
// ParameterMapper
// ============================================================================

/** System name for parameter mapping */
export type MappableSystem = 'vib34d' | 'holographic' | 'polychora';

/**
 * Translates parameters between different visualization system formats.
 * Handles cross-system pollination with influence blending.
 */
export declare class ParameterMapper {
    mappings: Record<string, { to: Record<string, string>; from: Record<string, string> }>;

    constructor();

    /** Translate parameters from one system format to another. */
    translate(params: Record<string, any>, fromSystem: MappableSystem, toSystem: MappableSystem): Record<string, any>;

    /** Merge parameters with weighted blending. */
    merge(base: Record<string, any>, overlay: Record<string, any>, influence?: number): Record<string, any>;

    /** Get unified schema spanning all systems. */
    getUnifiedSchema(): Record<string, ParameterDef>;

    /** Get default values for a system. */
    getDefaults(system: MappableSystem): Record<string, any>;

    /** Get valid ranges for a system. */
    getRanges(system: MappableSystem): Record<string, { min: number; max: number }>;

    /** Cross-pollinate: blend parameters from source system into target. */
    crossPollinate(sourceParams: Record<string, any>, sourceSystem: MappableSystem, targetSystem: MappableSystem, influence?: number): Record<string, any>;
}

// ============================================================================
// VitalitySystem
// ============================================================================

/**
 * Generates a global rhythmic breath cycle (6-second sine wave)
 * that modulates all visualization systems for organic animation feel.
 */
export declare class VitalitySystem {
    time: number;
    breath: number;
    cycleDuration: number;
    isRunning: boolean;

    constructor();

    /** Start the breath cycle. */
    start(): void;

    /** Stop the breath cycle. */
    stop(): void;

    /** Update and return current breath value (0-1). */
    update(deltaTime?: number): number;

    /** Get current breath value without updating. */
    getBreath(): number;
}

// ============================================================================
// RendererContracts
// ============================================================================

/** Frame state passed to render() */
export interface FrameState {
    time?: number;
    params?: Record<string, number>;
    audio?: { bass: number; mid: number; high: number; energy?: number };
}

/**
 * Abstract renderer contract — base class for all visualization systems.
 * Methods: init, resize, render, setActive, dispose.
 */
export declare class RendererContract {
    init(context?: any): boolean | Promise<boolean>;
    resize(width: number, height: number, pixelRatio?: number): void;
    render(frameState?: FrameState): void;
    setActive(active: boolean): void;
    dispose(): void;
}

/**
 * Adapter providing default implementations of the RendererContract.
 * Systems can extend this for easier compliance.
 */
export declare class RendererContractAdapter extends RendererContract {
    protected _initialized: boolean;
    protected _active: boolean;
    constructor();
}

/** Verify that an object implements the RendererContract interface. */
export declare function verifyRendererContract(instance: any): {
    valid: boolean;
    missing: string[];
    errors: string[];
};

/**
 * Contract for resource managers used by renderer systems.
 */
export declare class ResourceManagerContract {
    register(type: string, handle: any, disposer?: () => void, options?: { bytes?: number; label?: string }): any;
    release(type: string, handle: any): boolean;
    dispose(type: string, handle: any): boolean;
    disposeAll(): void;
    getStats(): { totalResources: number; totalBytes: number };
}

// ============================================================================
// UnifiedResourceManager
// ============================================================================

/** GPU resource types managed by UnifiedResourceManager */
export type GPUResourceType = 'textures' | 'buffers' | 'programs' | 'framebuffers';

/**
 * Manages GPU resource lifecycle with memory budgeting and eviction.
 * Tracks textures, buffers, programs, and framebuffers.
 */
export declare class UnifiedResourceManager {
    readonly gl: WebGLRenderingContext;
    resources: Record<GPUResourceType, Map<string, any>>;
    memoryBudget: number;
    currentUsage: number;
    onMemoryPressure: (() => void) | null;

    constructor(gl: WebGLRenderingContext);

    /** Calculate memory budget based on device capabilities. */
    calculateMemoryBudget(): number;

    /** Handle memory pressure (evict unused resources). */
    handleMemoryPressure(): void;

    /** Dispose all tracked resources and stop monitoring. */
    dispose(): void;
}
