/**
 * LayerPresetManager TypeScript Definitions
 */

import { LayerRelationshipGraph } from './LayerRelationshipGraph';

export interface PresetMetadata {
    description?: string;
    author?: string;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
}

export interface LayerPreset {
    name: string;
    config: ReturnType<LayerRelationshipGraph['exportConfig']>;
    metadata: PresetMetadata;
}

export interface PresetLibrary {
    version: string;
    type: 'vib3_layer_presets';
    exportedAt: string;
    count: number;
    presets: Record<string, LayerPreset>;
}

export interface PresetManagerOptions {
    storage?: Storage | null;
    storageKey?: string;
}

export declare class LayerPresetManager {
    constructor(graph: LayerRelationshipGraph, options?: PresetManagerOptions);

    /** Save the current graph state as a named preset. */
    save(name: string, metadata?: Partial<PresetMetadata>): LayerPreset;

    /** Load a preset by name into the live graph. */
    load(name: string): boolean;

    /** Delete a user preset. */
    delete(name: string): boolean;

    /** Check if a preset exists (user or built-in). */
    has(name: string): boolean;

    /** Get a preset's data without loading it. */
    get(name: string): LayerPreset | null;

    /** List all available presets. */
    list(): { user: string[]; builtIn: string[] };

    /** List all preset names as a flat array. */
    listAll(): string[];

    /** Number of user presets. */
    readonly count: number;

    /** Tune a layer's relationship config at runtime. */
    tune(layerName: string, configOverrides: Record<string, unknown>): boolean;

    /** Get the current config for a layer. */
    getLayerConfig(layerName: string): { preset: string; config: Record<string, unknown> } | null;

    /** Export all user presets as a library. */
    exportLibrary(): PresetLibrary;

    /** Import presets from a library. */
    importLibrary(library: PresetLibrary, options?: { overwrite?: boolean }): { imported: number; skipped: number };

    /** Clear all user presets. */
    clear(): void;
}

export default LayerPresetManager;
