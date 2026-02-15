/**
 * MultiCanvasBridge - Multi-canvas rendering orchestrator for VIB3+
 *
 * The Quantum and Holographic visualization systems use a 5-layer canvas
 * architecture (background, shadow, content, highlight, accent) where each
 * layer has its own WebGL/WebGPU context. This bridge manages multiple
 * UnifiedRenderBridge instances — one per canvas — and coordinates shader
 * compilation, uniform updates, and rendering across all layers.
 *
 * Layer parameters are derived through a LayerRelationshipGraph, where one
 * layer acts as the keystone (driver) and others derive their state through
 * configurable relationship functions — not static multipliers.
 *
 * Usage:
 *   const multi = new MultiCanvasBridge();
 *   await multi.initialize({
 *       canvases: { background, shadow, content, highlight, accent },
 *       preferWebGPU: true,
 *       relationshipProfile: 'holographic' // or 'symmetry', 'chord', 'storm'
 *   });
 *
 *   multi.compileShaderAll('holographic', shaderSources);
 *   multi.setKeystoneUniforms({ u_time: t, u_density: 1.0, u_hue: 320 });
 *   multi.renderAll('holographic');
 */

import { UnifiedRenderBridge } from './UnifiedRenderBridge.js';
import { LayerRelationshipGraph, LAYER_ORDER as GRAPH_LAYER_ORDER } from './LayerRelationshipGraph.js';

/**
 * Default layer configuration — used as fallback when no relationship graph
 * is active (legacy mode). Preserved for backward compatibility only.
 * @deprecated Use LayerRelationshipGraph profiles instead.
 */
const DEFAULT_LAYER_CONFIG = {
    background: { layerScale: 1.0, layerOpacity: 0.2, densityMult: 0.4, speedMult: 0.2 },
    shadow:     { layerScale: 1.0, layerOpacity: 0.4, densityMult: 0.8, speedMult: 0.3 },
    content:    { layerScale: 1.0, layerOpacity: 0.8, densityMult: 1.0, speedMult: 0.5 },
    highlight:  { layerScale: 1.0, layerOpacity: 0.6, densityMult: 1.5, speedMult: 0.8 },
    accent:     { layerScale: 1.0, layerOpacity: 0.3, densityMult: 2.5, speedMult: 0.4 }
};

/**
 * Standard layer order (back to front).
 */
const LAYER_ORDER = GRAPH_LAYER_ORDER;

export class MultiCanvasBridge {
    constructor() {
        /** @type {Map<string, UnifiedRenderBridge>} layer name → bridge */
        this._bridges = new Map();

        /** @type {Map<string, HTMLCanvasElement>} layer name → canvas */
        this._canvases = new Map();

        /** @type {object} Shared uniforms applied to all layers */
        this._sharedUniforms = {};

        /** @type {Map<string, object>} Per-layer uniform overrides */
        this._layerUniforms = new Map();

        /** @type {Map<string, object>} Per-layer config (opacity, density, speed) — legacy fallback */
        this._layerConfig = new Map();

        /** @type {boolean} */
        this._initialized = false;

        /** @type {string|null} Active backend type (set after init) */
        this._backendType = null;

        /** @type {LayerRelationshipGraph|null} */
        this._relationshipGraph = null;

        /** @type {number} Frame time counter for relationship resolution */
        this._frameTime = 0;
    }

    /**
     * Initialize bridges for all canvases.
     *
     * @param {object} options
     * @param {object} options.canvases - Map of layer name → HTMLCanvasElement
     * @param {boolean} [options.preferWebGPU=true] - Try WebGPU for each canvas
     * @param {boolean} [options.debug=false]
     * @param {object} [options.layerConfig] - Override default layer configuration (legacy)
     * @param {string} [options.relationshipProfile] - Named relationship profile to load
     * @param {LayerRelationshipGraph} [options.relationshipGraph] - Pre-configured graph instance
     * @returns {Promise<void>}
     */
    async initialize(options) {
        const {
            canvases,
            preferWebGPU = true,
            debug = false,
            layerConfig = {},
            relationshipProfile,
            relationshipGraph
        } = options;

        // Initialize bridges in parallel
        const entries = Object.entries(canvases);
        const results = await Promise.allSettled(
            entries.map(async ([layerName, canvas]) => {
                const bridge = await UnifiedRenderBridge.create(canvas, { preferWebGPU, debug });
                return { layerName, canvas, bridge };
            })
        );

        for (const result of results) {
            if (result.status === 'fulfilled') {
                const { layerName, canvas, bridge } = result.value;
                this._bridges.set(layerName, bridge);
                this._canvases.set(layerName, canvas);

                // Apply legacy layer config (user override > default)
                const config = {
                    ...(DEFAULT_LAYER_CONFIG[layerName] || {}),
                    ...(layerConfig[layerName] || {})
                };
                this._layerConfig.set(layerName, config);
                this._layerUniforms.set(layerName, {});

                if (!this._backendType) {
                    this._backendType = bridge.getBackendType();
                }
            } else {
                console.error(`MultiCanvasBridge: Failed to init layer "${result.reason}"`);
            }
        }

        // Set up relationship graph
        if (relationshipGraph instanceof LayerRelationshipGraph) {
            this._relationshipGraph = relationshipGraph;
        } else if (relationshipProfile) {
            this._relationshipGraph = new LayerRelationshipGraph({ profile: relationshipProfile });
        }

        this._initialized = this._bridges.size > 0;
        if (debug) {
            const graphInfo = this._relationshipGraph
                ? ` [graph: ${this._relationshipGraph.activeProfile || 'custom'}]`
                : ' [legacy mode]';
            console.log(`MultiCanvasBridge: ${this._bridges.size}/${entries.length} layers initialized (${this._backendType})${graphInfo}`);
        }
    }

    /**
     * Check if the bridge is initialized.
     * @returns {boolean}
     */
    get initialized() {
        return this._initialized;
    }

    /**
     * Get the active backend type.
     * @returns {string|null}
     */
    get backendType() {
        return this._backendType;
    }

    /**
     * Get layer names in render order.
     * @returns {string[]}
     */
    get layerNames() {
        return LAYER_ORDER.filter(name => this._bridges.has(name));
    }

    /**
     * Get the bridge for a specific layer.
     * @param {string} layerName
     * @returns {UnifiedRenderBridge|undefined}
     */
    getBridge(layerName) {
        return this._bridges.get(layerName);
    }

    // ========================================================================
    // Layer Relationship Graph
    // ========================================================================

    /**
     * Get the active relationship graph. Creates one with 'holographic' profile
     * if none exists.
     * @returns {LayerRelationshipGraph}
     */
    get relationshipGraph() {
        if (!this._relationshipGraph) {
            this._relationshipGraph = new LayerRelationshipGraph({ profile: 'holographic' });
        }
        return this._relationshipGraph;
    }

    /**
     * Set or replace the relationship graph.
     * @param {LayerRelationshipGraph} graph
     */
    set relationshipGraph(graph) {
        this._relationshipGraph = graph;
    }

    /**
     * Load a named relationship profile.
     * @param {string} profileName - holographic, symmetry, chord, storm, legacy
     */
    loadRelationshipProfile(profileName) {
        this.relationshipGraph.loadProfile(profileName);
    }

    /**
     * Set the keystone (driver) layer.
     * @param {string} layerName
     */
    setKeystone(layerName) {
        this.relationshipGraph.setKeystone(layerName);
    }

    /**
     * Set the relationship for a dependent layer.
     * @param {string} layerName
     * @param {string|Function|Object} relationship - Preset name, function, or { preset, config }
     */
    setLayerRelationship(layerName, relationship) {
        this.relationshipGraph.setRelationship(layerName, relationship);
    }

    // ========================================================================
    // Shader Compilation
    // ========================================================================

    /**
     * Compile shaders on all layer bridges.
     *
     * @param {string} shaderName - e.g. 'holographic'
     * @param {object} sources - { glslVertex, glslFragment, wgslFragment }
     * @returns {{ succeeded: string[], failed: string[] }}
     */
    compileShaderAll(shaderName, sources) {
        const succeeded = [];
        const failed = [];

        for (const [layerName, bridge] of this._bridges) {
            const ok = bridge.compileShader(shaderName, sources);
            if (ok) {
                succeeded.push(layerName);
            } else {
                failed.push(layerName);
            }
        }

        return { succeeded, failed };
    }

    /**
     * Compile a shader on a single layer.
     *
     * @param {string} layerName
     * @param {string} shaderName
     * @param {object} sources
     * @returns {boolean}
     */
    compileShader(layerName, shaderName, sources) {
        const bridge = this._bridges.get(layerName);
        if (!bridge) return false;
        return bridge.compileShader(shaderName, sources);
    }

    // ========================================================================
    // Uniform Management
    // ========================================================================

    /**
     * Set uniforms shared across all layers (e.g. time, resolution, geometry).
     * When a relationship graph is active, these are treated as keystone parameters.
     *
     * @param {object} uniforms
     */
    setSharedUniforms(uniforms) {
        this._sharedUniforms = uniforms;
    }

    /**
     * Alias for setSharedUniforms when using relationship graph mode.
     * Makes intent clearer — these are the keystone's parameters.
     *
     * @param {object} uniforms - Keystone parameters to derive other layers from
     */
    setKeystoneUniforms(uniforms) {
        this._sharedUniforms = uniforms;
    }

    /**
     * Set per-layer uniform overrides. Applied after relationship resolution.
     *
     * @param {string} layerName
     * @param {object} uniforms
     */
    setLayerUniforms(layerName, uniforms) {
        const existing = this._layerUniforms.get(layerName) || {};
        this._layerUniforms.set(layerName, { ...existing, ...uniforms });
    }

    /**
     * Update the legacy layer configuration.
     * @deprecated Use setLayerRelationship() instead.
     *
     * @param {string} layerName
     * @param {object} config - Partial config update
     */
    setLayerConfig(layerName, config) {
        const existing = this._layerConfig.get(layerName) || {};
        this._layerConfig.set(layerName, { ...existing, ...config });
    }

    /**
     * Build the merged uniform set for a specific layer.
     *
     * When a relationship graph is active:
     *   1. Shared uniforms are treated as keystone parameters
     *   2. The graph resolves derived parameters for the layer
     *   3. Per-layer overrides are applied on top
     *
     * Legacy fallback (no graph):
     *   Priority: shared < layer config < layer overrides
     *
     * @param {string} layerName
     * @returns {object}
     */
    _buildLayerUniforms(layerName) {
        const overrides = this._layerUniforms.get(layerName) || {};

        if (this._relationshipGraph) {
            // Relationship graph mode: resolve layer params from keystone
            const resolved = this._relationshipGraph.resolve(
                this._sharedUniforms,
                layerName,
                this._frameTime
            );

            // Map relationship output to shader uniforms
            return {
                ...resolved,
                u_layerOpacity: resolved.layerOpacity || resolved.u_layerOpacity || 1.0,
                ...overrides
            };
        }

        // Legacy mode: static multipliers
        const config = this._layerConfig.get(layerName) || {};
        return {
            ...this._sharedUniforms,
            u_layerScale: config.layerScale || 1.0,
            u_layerOpacity: config.layerOpacity || 1.0,
            u_densityMult: config.densityMult || 1.0,
            u_speedMult: config.speedMult || 1.0,
            ...overrides
        };
    }

    // ========================================================================
    // Rendering
    // ========================================================================

    /**
     * Render all layers in order.
     *
     * When a relationship graph is active, each layer may use a different shader
     * as assigned by graph.setLayerShader(). The shaderName parameter serves as
     * the default for layers without an explicit shader assignment.
     *
     * @param {string} shaderName - Default shader program to use
     * @param {object} [options]
     * @param {number[]} [options.clearColor] - RGBA clear color
     * @param {number} [options.time] - Frame time for relationship resolution
     */
    renderAll(shaderName, options = {}) {
        if (options.time !== undefined) {
            this._frameTime = options.time;
        } else {
            this._frameTime += 16; // ~60fps fallback
        }

        for (const layerName of this.layerNames) {
            // Per-layer shader from relationship graph, or default
            const layerShader = (this._relationshipGraph
                ? this._relationshipGraph.getLayerShader(layerName)
                : null) || shaderName;

            this.renderLayer(layerName, layerShader, options);
        }
    }

    /**
     * Render a single layer.
     *
     * @param {string} layerName
     * @param {string} shaderName
     * @param {object} [options]
     */
    renderLayer(layerName, shaderName, options = {}) {
        const bridge = this._bridges.get(layerName);
        if (!bridge) return;

        const uniforms = this._buildLayerUniforms(layerName);
        bridge.setUniforms(uniforms);
        bridge.render(shaderName, {
            clearColor: options.clearColor || [0, 0, 0, 0],
            clear: true
        });
    }

    // ========================================================================
    // Canvas Management
    // ========================================================================

    /**
     * Resize all canvases.
     *
     * @param {number} width - CSS width
     * @param {number} height - CSS height
     * @param {number} [pixelRatio=1]
     */
    resizeAll(width, height, pixelRatio = 1) {
        for (const [, bridge] of this._bridges) {
            bridge.resize(width, height, pixelRatio);
        }
    }

    /**
     * Get the number of active layers.
     * @returns {number}
     */
    get layerCount() {
        return this._bridges.size;
    }

    // ========================================================================
    // Cleanup
    // ========================================================================

    /**
     * Dispose all bridges and clear state.
     */
    dispose() {
        for (const [, bridge] of this._bridges) {
            bridge.dispose();
        }
        this._bridges.clear();
        this._canvases.clear();
        this._layerUniforms.clear();
        this._layerConfig.clear();
        this._sharedUniforms = {};
        this._initialized = false;
        this._backendType = null;
        this._relationshipGraph = null;
        this._frameTime = 0;
    }
}

export { DEFAULT_LAYER_CONFIG, LAYER_ORDER };
export default MultiCanvasBridge;
