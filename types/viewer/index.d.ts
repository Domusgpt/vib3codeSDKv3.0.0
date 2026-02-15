/**
 * Viewer Module TypeScript Definitions
 * ViewerPortal, ViewerInputHandler, GalleryUI, CardBending,
 * AudioReactivity, TradingCardExporter
 */

// ============================================================================
// ViewerPortal
// ============================================================================

/** Portal display mode */
export type PortalMode = 'card' | 'fullscreen' | 'embedded' | 'pip';

/** Projection type for 4D→3D */
export type ProjectionType = 'perspective' | 'stereographic' | 'orthographic';

/** 6D rotation state */
export interface RotationState {
    XY: number;
    XZ: number;
    YZ: number;
    XW: number;
    YW: number;
    ZW: number;
}

export interface ViewerPortalOptions {
    mode?: PortalMode;
    projection?: ProjectionType;
    enableMouse?: boolean;
    enableOrientation?: boolean;
}

/**
 * Viewer portal for displaying 4D visualizations.
 * Supports multiple display modes, input handling, and export.
 */
export declare class ViewerPortal {
    mode: PortalMode;
    projection: ProjectionType;
    rotation: RotationState;

    constructor(options?: ViewerPortalOptions);

    /** Set display mode. */
    setMode(mode: PortalMode): void;

    /** Set projection type. */
    setProjection(projection: ProjectionType): void;

    /** Set rotation on a specific plane. */
    setRotation(plane: string, angle: number): void;

    /** Get all rotation values. */
    getRotation(): RotationState;

    /** Export current view as image data URL. */
    exportImage(format?: string, quality?: number): string;

    /** Destroy and clean up. */
    destroy(): void;
}

// ============================================================================
// ViewerInputHandler
// ============================================================================

/** Input source type */
export type InputSource = 'keyboard' | 'mouse' | 'wheel' | 'touch' | 'orientation' | 'gamepad';

/** Input preset */
export type InputPreset = 'default' | 'gaming' | 'presentation' | 'accessibility';

/**
 * Universal input handler for viewer interactions.
 * Supports keyboard, mouse, wheel, touch, orientation, and gamepad.
 */
export declare class ViewerInputHandler {
    constructor(options?: { preset?: InputPreset });

    /** Enable/disable an input source. */
    setEnabled(source: InputSource, enabled: boolean): void;

    /** Load an input preset. */
    loadPreset(preset: InputPreset): void;

    /** Get current input state. */
    getState(): Record<string, any>;

    /** Destroy all listeners. */
    destroy(): void;
}

// ============================================================================
// GalleryUI
// ============================================================================

/** Gallery view mode */
export type GalleryViewMode = 'grid' | 'list' | 'carousel';

/** Gallery sort option */
export type GallerySortBy = 'date' | 'name' | 'system' | 'geometry';

/**
 * Gallery UI for browsing and managing saved visualizations.
 * Supports 100 variation slots per system with search, sort, and filter.
 */
export declare class GalleryUI {
    viewMode: GalleryViewMode;
    sortBy: GallerySortBy;
    searchQuery: string;
    currentPage: number;

    constructor(options?: { viewMode?: GalleryViewMode; sortBy?: GallerySortBy });

    /** Set view mode. */
    setViewMode(mode: GalleryViewMode): void;

    /** Set sort order. */
    setSortBy(sort: GallerySortBy): void;

    /** Render the gallery. */
    render(): void;

    /** Destroy and clean up. */
    destroy(): void;
}

// ============================================================================
// CardBending
// ============================================================================

/** Bend preset name */
export type BendPreset = 'flat' | 'gentle' | 'dramatic' | 'extreme' | 'wave' | 'twist';

/**
 * Card bending system mapping physical bend to 6D rotation.
 * Supports orientation input and parallax layer effects.
 */
export declare class CardBending {
    constructor();

    /** Apply a bend preset. */
    applyPreset(preset: BendPreset): void;

    /** Get 6D rotation mapping from current bend state. */
    getRotationMapping(): RotationState;

    /** Serialize current state. */
    serialize(): object;

    /** Deserialize from saved state. */
    deserialize(data: object): void;
}

// ============================================================================
// AudioReactivity (viewer)
// ============================================================================

/** Audio frequency band */
export type FrequencyBand = 'bass' | 'mid' | 'high' | 'sub' | 'presence';

/**
 * Audio reactivity system for viewer.
 * Maps frequency bands to rotation and visual parameter changes.
 */
export declare class AudioReactivity {
    constructor(options?: { bands?: FrequencyBand[] });

    /** Get rotation mapping from audio data. */
    getRotationMapping(): Partial<RotationState>;

    /** Serialize configuration. */
    serialize(): object;

    /** Deserialize configuration. */
    deserialize(data: object): void;
}

// ============================================================================
// TradingCardExporter
// ============================================================================

/** Card size (5:7 aspect ratio) */
export interface CardSize {
    width: number;
    height: number;
    label: string;
}

/** Frame style for trading cards */
export type FrameStyle = 'none' | 'simple' | 'ornate' | 'holographic' | 'neon';

/** Rarity level */
export type RarityLevel = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

/**
 * Exports visualizations as trading card images.
 * Supports multiple sizes, frame styles, rarity levels, and metadata.
 */
export declare class TradingCardExporter {
    constructor();

    /** Get available card sizes (all 5:7 ratio). */
    getCardSizes(): CardSize[];

    /** Get available frame styles. */
    getFrameStyles(): FrameStyle[];

    /** Get available rarity levels. */
    getRarityLevels(): RarityLevel[];

    /** Export a trading card image. */
    exportCard(options: {
        canvas: HTMLCanvasElement;
        size?: CardSize;
        frame?: FrameStyle;
        rarity?: RarityLevel;
        title?: string;
        metadata?: Record<string, string>;
    }): Promise<Blob | null>;

    /** Serialize exporter configuration. */
    serialize(): object;
}
