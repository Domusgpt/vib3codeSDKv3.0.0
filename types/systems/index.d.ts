/**
 * Visualization Systems TypeScript Definitions
 * QuantumEngine, FacetedSystem, RealHolographicSystem
 */

import { ParameterManager, VIB3Parameters } from '../core';

// ============================================================================
// Common
// ============================================================================

/** Canvas set for 5-layer rendering */
export interface CanvasSet {
    background: HTMLCanvasElement;
    shadow: HTMLCanvasElement;
    content: HTMLCanvasElement;
    highlight: HTMLCanvasElement;
    accent: HTMLCanvasElement;
}

/** Audio data for reactivity */
export interface AudioData {
    bass: number;
    mid: number;
    high: number;
    energy?: number;
}

/** Render mode: direct WebGL or via UnifiedRenderBridge */
export type RenderMode = 'direct' | 'bridge';

// ============================================================================
// QuantumEngine
// ============================================================================

export interface QuantumEngineOptions {
    /** Auto-start render loop (default: true) */
    autoStart?: boolean;
    /** Single canvas override for content-only mode */
    canvas?: HTMLCanvasElement;
    /** Multi-canvas set for 5-layer mode */
    canvases?: CanvasSet;
}

/**
 * Quantum visualization system.
 * Renders quantum-inspired lattice patterns via procedural fragment shaders.
 * Supports 5-layer canvas architecture and audio/gesture reactivity.
 */
export declare class QuantumEngine {
    visualizers: any[];
    parameters: ParameterManager;
    isActive: boolean;
    autoStart: boolean;
    canvasOverride: HTMLCanvasElement | null;
    canvasSet: CanvasSet | null;
    audioData: AudioData;

    constructor(options?: QuantumEngineOptions);

    /** Initialize quantum system (creates visualizers, sets up reactivity). */
    init(): void;

    /** Create visualizers for all 5 layers (or single content layer). */
    createVisualizers(): void;

    /** Start the render loop. */
    startRenderLoop(): void;

    /** Stop the render loop. */
    stopRenderLoop(): void;

    /** Update parameters on all visualizers. */
    updateParameters(params: Partial<VIB3Parameters>): void;

    /** Set active state. */
    setActive(active: boolean): void;

    /** Destroy all visualizers and clean up resources. */
    destroy(): void;

    /** Switch to a geometry variant by index. */
    switchVariant(index: number): void;

    /** Get current audio data. */
    getAudioData(): AudioData;

    /** Toggle audio reactivity. */
    toggleAudio(): Promise<boolean>;
}

// ============================================================================
// FacetedSystem
// ============================================================================

export interface FacetedSystemOptions {
    /** Prefer WebGPU rendering (default: true) */
    preferWebGPU?: boolean;
    /** Single canvas override */
    canvas?: HTMLCanvasElement;
    /** Auto-start render loop (default: true) */
    autoStart?: boolean;
}

/**
 * Faceted visualization system.
 * Renders precise 2D geometric patterns from 4D rotation.
 * Supports WebGL and WebGPU via UnifiedRenderBridge.
 * All 24 geometry variants with HSL color control.
 */
export declare class FacetedSystem {
    canvas: HTMLCanvasElement | null;
    gl: WebGLRenderingContext | null;
    program: WebGLProgram | null;
    isActive: boolean;
    animationFrameId: number | null;
    startTime: number;

    /** Uniform locations for shader parameters */
    uniforms: Record<string, WebGLUniformLocation | null>;

    /** Current parameter values */
    currentParams: {
        geometry: number;
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
    };

    constructor(options?: FacetedSystemOptions);

    /** Initialize with WebGL/WebGPU context. */
    init(canvas?: HTMLCanvasElement): Promise<boolean>;

    /** Start the render loop. */
    startRenderLoop(): void;

    /** Stop the render loop. */
    stopRenderLoop(): void;

    /** Update parameters. */
    updateParameters(params: Partial<VIB3Parameters>): void;

    /** Set active state. */
    setActive(active: boolean): void;

    /** Handle canvas resize. */
    resize(width: number, height: number, dpr?: number): void;

    /** Destroy and clean up all resources. */
    destroy(): void;

    /** Get the active backend type ('webgl' | 'webgpu'). */
    getBackendType(): string;
}

// ============================================================================
// RealHolographicSystem
// ============================================================================

export interface HolographicSystemOptions {
    /** Single canvas override for content-only mode */
    canvas?: HTMLCanvasElement;
    /** Multi-canvas set for 5-layer mode */
    canvases?: CanvasSet;
    /** Named relationship profile to load (default: 'holographic') */
    relationshipProfile?: 'holographic' | 'symmetry' | 'chord' | 'storm' | 'legacy';
}

/**
 * Holographic visualization system.
 * Renders through 5-layer glassmorphic canvas stack with per-layer shaders.
 * Native microphone input for audio reactivity with beat/melody detection.
 */
export declare class RealHolographicSystem {
    visualizers: any[];
    currentVariant: number;
    totalVariants: number;
    isActive: boolean;
    canvasOverride: HTMLCanvasElement | null;
    canvasSet: CanvasSet | null;
    audioEnabled: boolean;
    audioContext: AudioContext | null;
    audioData: AudioData;
    variantNames: string[];

    constructor(options?: HolographicSystemOptions);

    /** Initialize holographic system. */
    initialize(): void;

    /** Create visualizers for all 5 layers. */
    createVisualizers(): void;

    /** Start the render loop. */
    startRenderLoop(): void;

    /** Stop the render loop. */
    stopRenderLoop(): void;

    /** Update parameters on all visualizers. */
    updateParameters(params: Partial<VIB3Parameters>): void;

    /** Set active state. */
    setActive(active: boolean): void;

    /** Destroy all visualizers and clean up resources. */
    destroy(): void;

    /** Switch to a variant by index. */
    switchVariant(index: number): void;

    /** Toggle audio reactivity. */
    toggleAudio(): Promise<boolean>;

    /** Get variant name by index. */
    getVariantName(index: number): string;

    /** The layer relationship graph instance. */
    readonly layerGraph: import('../render/LayerRelationshipGraph').LayerRelationshipGraph;

    /** Load a relationship profile by name. */
    loadRelationshipProfile(profileName: 'holographic' | 'symmetry' | 'chord' | 'storm' | 'legacy'): void;

    /** Set the keystone (driver) layer. */
    setKeystone(layerName: 'background' | 'shadow' | 'content' | 'highlight' | 'accent'): void;

    /** Set the relationship for a dependent layer. */
    setLayerRelationship(
        layerName: 'background' | 'shadow' | 'content' | 'highlight' | 'accent',
        relationship: string | Function | { preset: string; config?: Record<string, unknown> }
    ): void;
}
