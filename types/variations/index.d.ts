/**
 * Variations Module TypeScript Definitions
 */

import { VIB3Parameters } from '../core';

/** Variation slot */
export interface VariationSlot {
    index: number;
    parameters: VIB3Parameters;
    name: string;
    system: string;
    geometry: number;
    timestamp: string;
    thumbnail?: string;
}

/** Variation generation options */
export interface VariationOptions {
    /** Base parameters to deviate from */
    baseParams: VIB3Parameters;
    /** Amount of deviation (0-1) */
    deviation?: number;
    /** Lock specific parameters from changing */
    locked?: string[];
    /** System to generate for */
    system?: string;
}

/**
 * Manages 100 variation slots per system for exploring parameter space.
 */
export declare class VariationManager {
    slots: VariationSlot[];
    maxSlots: number;

    constructor(maxSlots?: number);

    /** Generate a variation from base parameters. */
    generate(options: VariationOptions): VariationSlot;

    /** Generate multiple variations at once. */
    generateBatch(options: VariationOptions, count: number): VariationSlot[];

    /** Get a slot by index. */
    getSlot(index: number): VariationSlot | undefined;

    /** Save a variation to a slot. */
    saveSlot(index: number, slot: VariationSlot): void;

    /** Clear a slot. */
    clearSlot(index: number): void;

    /** Clear all slots. */
    clearAll(): void;

    /** Export all slots as JSON. */
    exportAll(): string;

    /** Import slots from JSON. */
    importAll(json: string): void;
}
