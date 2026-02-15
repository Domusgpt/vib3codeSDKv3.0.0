/**
 * LayerReactivityBridge TypeScript Definitions
 */

import { LayerRelationshipGraph } from './LayerRelationshipGraph';
import { LayerPresetManager } from './LayerPresetManager';

export interface ModulationMapping {
    source: 'audio' | 'tilt' | 'mouse' | 'click' | 'custom';
    channel: string;
    layerName: string;
    configKey: string;
    scale: number;
    baseline: number;
    min?: number;
    max?: number;
    mode?: 'add' | 'multiply';
}

export interface InputState {
    audio?: { bass?: number; mid?: number; high?: number; energy?: number };
    tilt?: { alpha?: number; beta?: number; gamma?: number };
    mouse?: { x?: number; y?: number; velocityX?: number; velocityY?: number };
    click?: { intensity?: number };
    custom?: Record<string, number>;
}

export interface ReactivityBridgeConfig {
    profile: string | null;
    mappings: ModulationMapping[];
    active: boolean;
}

export declare const MODULATION_PROFILES: Record<string, ModulationMapping[]>;

export declare class LayerReactivityBridge {
    constructor(graph: LayerRelationshipGraph, presetManager?: LayerPresetManager | null);

    /** Add a single modulation mapping. */
    addModulation(
        source: string,
        channel: string,
        layerName: string,
        configKey: string,
        options?: Partial<Pick<ModulationMapping, 'scale' | 'baseline' | 'min' | 'max' | 'mode'>>
    ): void;

    /** Remove all modulation mappings for a specific layer. */
    removeModulationsForLayer(layerName: string): number;

    /** Remove all modulation mappings. */
    clearModulations(): void;

    /** Load a pre-built modulation profile. */
    loadModulationProfile(profileName: string): boolean;

    /** Available modulation profile names. */
    static readonly profileNames: string[];

    /** Active modulation profile name. */
    readonly activeProfile: string | null;

    /** All current modulation mappings. */
    readonly mappings: ModulationMapping[];

    /** Enable modulation processing. */
    activate(): void;

    /** Disable modulation processing. */
    deactivate(): void;

    /** Whether modulation is active. */
    readonly isActive: boolean;

    /** Process input state and apply modulations. */
    update(inputState: InputState): Record<string, Record<string, number>>;

    /** Export modulation configuration. */
    exportConfig(): ReactivityBridgeConfig;

    /** Import modulation configuration. */
    importConfig(config: ReactivityBridgeConfig): void;
}

export default LayerReactivityBridge;
