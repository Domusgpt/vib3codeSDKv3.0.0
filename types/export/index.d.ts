/**
 * VIB3+ SDK Export Module Type Definitions
 * @module @vib3code/sdk/export
 */

// ─── Common Types ───

export interface VIB3Parameters {
    geometry?: number;
    gridDensity?: number;
    morphFactor?: number;
    chaos?: number;
    speed?: number;
    hue?: number;
    saturation?: number;
    intensity?: number;
    dimension?: number;
    rot4dXY?: number;
    rot4dXZ?: number;
    rot4dYZ?: number;
    rot4dXW?: number;
    rot4dYW?: number;
    rot4dZW?: number;
    system?: 'quantum' | 'faceted' | 'holographic';
    mouseIntensity?: number;
    clickIntensity?: number;
    bass?: number;
    mid?: number;
    high?: number;
    mouse?: [number, number];
}

// ─── ExportManager ───

export class ExportManager {
    engine: any;
    constructor(engine: any);
    setupFileInputs(): void;
    exportJSON(): void;
    saveToGallery(customName?: string | null): void;
    exportCSS(): void;
    exportHTML(): void;
    exportPNG(): void;
    importJSON(): void;
    importFolder(): void;
    handleJSONImport(event: Event): Promise<void>;
    handleFolderImport(event: Event): Promise<void>;
    validateConfiguration(config: Record<string, any>): boolean;
    loadConfiguration(config: Record<string, any>): void;
    saveAsCustomVariation(config: Record<string, any>): void;
    downloadFile(content: string, filename: string, mimeType: string): void;
    getGeometryName(index: number): string;
}

// ─── ShaderExporter ───

export interface ShaderExportConfig {
    system?: 'quantum' | 'faceted' | 'holographic';
    geometry?: number;
    hue?: number;
    saturation?: number;
    intensity?: number;
    gridDensity?: number;
    dimension?: number;
    morphFactor?: number;
    chaos?: number;
    speed?: number;
    rot4dXY?: number;
    rot4dXZ?: number;
    rot4dYZ?: number;
    rot4dXW?: number;
    rot4dYW?: number;
    rot4dZW?: number;
}

export class ShaderExporter {
    static getQuantumShader(): string;
    static getFacetedShader(): string;
    static getHolographicShader(): string;
    static exportHTML(config: ShaderExportConfig): string;
}

// ─── SVG Exporter ───

export interface SVGExportOptions {
    width?: number;
    height?: number;
    strokeWidth?: number;
    includeMetadata?: boolean;
    includeWatermark?: boolean;
    watermarkText?: string;
    backgroundColor?: string;
    precision?: number;
}

export function exportSVG(params: VIB3Parameters, options?: SVGExportOptions): string;
export function downloadSVG(params: VIB3Parameters, options?: SVGExportOptions, filename?: string): void;

// ─── CSS Exporter ───

export interface CSSExportOptions {
    prefix?: string;
    includeAnimations?: boolean;
    includeVariables?: boolean;
    includeKeyframes?: boolean;
}

export function exportCSS(params: VIB3Parameters, options?: CSSExportOptions): string;
export function downloadCSS(params: VIB3Parameters, options?: CSSExportOptions, filename?: string): void;
export function toStyleObject(params: VIB3Parameters, prefix?: string): Record<string, string>;

// ─── Lottie Exporter ───

export interface LottieExportOptions {
    width?: number;
    height?: number;
    fps?: number;
    duration?: number;
    includeMetadata?: boolean;
}

export function exportLottie(params: VIB3Parameters, options?: LottieExportOptions): Record<string, any>;
export function downloadLottie(params: VIB3Parameters, options?: LottieExportOptions, filename?: string): void;

// ─── VIB3 Package Exporter ───

export interface VIB3PackageOptions {
    includeReact?: boolean;
    includeVue?: boolean;
    includeSvelte?: boolean;
    includeCSS?: boolean;
}

export interface VIB3Package {
    id: string;
    version: string;
    created: string;
    visual_params: VIB3Parameters;
    reactivity_config: Record<string, any>;
    metadata: Record<string, any>;
    embed_code: string;
    html_embed: string;
    css_embed: string;
    js_embed: string;
    integrations: Record<string, string>;
}

export const VIB3_PACKAGE_VERSION: string;

export class VIB3PackageExporter {
    constructor(options?: VIB3PackageOptions);
    createPackage(visualParams: VIB3Parameters, reactivityConfig: Record<string, any>, metadata?: Record<string, any>): VIB3Package;
    generateEmbedCode(visualParams: VIB3Parameters, reactivityConfig: Record<string, any>, packageId: string): string;
    generateHTMLEmbed(visualParams: VIB3Parameters, reactivityConfig: Record<string, any>, packageId: string): string;
    generateCSSEmbed(visualParams: VIB3Parameters): string;
    generateJSEmbed(visualParams: VIB3Parameters, reactivityConfig: Record<string, any>, packageId: string): string;
    generateIntegrations(packageId: string, visualParams: VIB3Parameters): Record<string, string>;
    exportToJSON(package_: VIB3Package, pretty?: boolean): string;
    downloadPackage(package_: VIB3Package, filename?: string | null): void;
    downloadHTMLEmbed(package_: VIB3Package, filename?: string | null): void;
    static loadFromJSON(json: string): VIB3Package;
}

export function createVIB3Package(visualParams: VIB3Parameters, reactivityConfig: Record<string, any>, metadata?: Record<string, any>): VIB3Package;

// ─── Trading Card System ───

export type CardRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export interface CardState {
    system: 'quantum' | 'faceted' | 'holographic';
    geometry: number;
    geometryName: string;
    coreType: string;
    hue: number;
    saturation: number;
    intensity: number;
    gridDensity: number;
    dimension: number;
    morphFactor: number;
    chaos: number;
    speed: number;
    rot4dXW: number;
    rot4dYW: number;
    rot4dZW: number;
    rarity: CardRarity;
    rarityScore: number;
}

export class CardGeneratorBase {
    constructor();
    generateCard(state: CardState, canvasImage: string): string;
}

export class FacetedCardGenerator extends CardGeneratorBase {
    constructor();
}

export class QuantumCardGenerator extends CardGeneratorBase {
    constructor();
}

export class HolographicCardGenerator extends CardGeneratorBase {
    constructor();
}

export class TradingCardGenerator {
    engine: any;
    constructor(engine: any);
    detectCurrentSystem(): string;
    captureCurrentState(): CardState;
    getActiveGeometryIndex(): number;
    calculateRarity(params: VIB3Parameters): { rarity: CardRarity; score: number };
    generateClassicCard(state: CardState, canvasImage: string): string;
    generateSocialCard(state: CardState, canvasImage: string): string;
    generateVisualizationCode(state: CardState): string;
    generateLiveFacetedSystem(state: CardState): string;
    generateLiveQuantumSystem(state: CardState): string;
    generateLiveHolographicSystem(state: CardState): string;
    generateFacetedVisualizationCode(state: CardState): string;
    generateHolographicVisualizationCode(state: CardState): string;
    generateFallbackVisualizationCode(state: CardState): string;
    generateImageVisualization(imageData: string): string;
}

export class TradingCardManager {
    engine: any;
    constructor(engine: any);
}

// ─── Trading Card Systems (per-renderer) ───

export class TradingCardSystemFaceted {
    constructor();
}

export class TradingCardSystemHolographic {
    constructor();
}

export class TradingCardSystemQuantum {
    constructor();
}
