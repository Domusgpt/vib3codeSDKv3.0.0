/**
 * VIB3+ Choreography Player Type Definitions
 * Sequenced scene playback with transitions and timelines.
 */

export interface ChoreographyScene {
    name?: string;
    duration_ms?: number;
    system?: 'quantum' | 'faceted' | 'holographic';
    geometry?: number;
    parameters?: Record<string, number>;
    transition?: {
        type?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'snap';
        duration_ms?: number;
    };
    timeline?: Array<{
        time_ms: number;
        parameter: string;
        value: number;
        easing?: string;
    }>;
}

export interface ChoreographySpec {
    name?: string;
    description?: string;
    loop?: boolean;
    scenes: ChoreographyScene[];
    total_duration_ms?: number;
}

export interface ChoreographyPlayerOptions {
    onSceneChange?: (sceneIndex: number, scene: ChoreographyScene) => void;
    onComplete?: () => void;
    onTick?: (currentTime: number, totalDuration: number) => void;
}

export interface ChoreographyState {
    playing: boolean;
    currentTime: number;
    totalDuration: number;
    activeSceneIndex: number;
    activeSceneName: string | null;
    loopMode: 'once' | 'loop';
    playbackSpeed: number;
    progress: number;
    sceneCount: number;
}

export class ChoreographyPlayer {
    engine: any;
    spec: ChoreographySpec | null;
    playing: boolean;
    currentTime: number;
    playbackSpeed: number;
    loopMode: 'once' | 'loop';
    activeSceneIndex: number;

    constructor(engine: any, options?: ChoreographyPlayerOptions);

    /**
     * Load a choreography specification.
     * @param spec - Choreography data from MCP tool or JSON
     */
    load(spec: ChoreographySpec): void;

    /** Start or resume playback. */
    play(): void;

    /** Pause playback (retains position). */
    pause(): void;

    /** Stop playback and reset to beginning. */
    stop(): void;

    /**
     * Seek to a specific time in the choreography.
     * @param timeMs - Target time in milliseconds
     */
    seek(timeMs: number): void;

    /**
     * Seek to a percentage through the choreography.
     * @param percent - 0.0 to 1.0
     */
    seekToPercent(percent: number): void;

    /**
     * Get current playback state.
     * @returns Current player state
     */
    getState(): ChoreographyState;

    /** Clean up resources and stop playback. */
    destroy(): void;
}
