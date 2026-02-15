/**
 * VIB3+ MCP Server
 * Model Context Protocol server for agentic integration
 */

import { toolDefinitions, getToolList, validateToolInput } from './tools.js';
import { schemaRegistry } from '../../schemas/index.js';
import { telemetry, EventType, withTelemetry } from '../telemetry/index.js';
import { AestheticMapper } from '../../creative/AestheticMapper.js';
import { ChoreographyPlayer } from '../../creative/ChoreographyPlayer.js';
import { ParameterTimeline } from '../../creative/ParameterTimeline.js';
import { ColorPresetsSystem } from '../../creative/ColorPresetsSystem.js';
import { TransitionAnimator } from '../../creative/TransitionAnimator.js';
import { PRESET_REGISTRY } from '../../render/LayerRelationshipGraph.js';

/**
 * Generate unique IDs
 */
function generateId(prefix = 'scene') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Geometry metadata lookup
 */
const BASE_GEOMETRIES = [
    { name: 'tetrahedron', vertices: 4, edges: 6, faces: 4 },
    { name: 'hypercube', vertices: 16, edges: 32, faces: 24 },
    { name: 'sphere', vertices: 'variable', edges: 'variable', faces: 'variable' },
    { name: 'torus', vertices: 'variable', edges: 'variable', faces: 'variable' },
    { name: 'klein_bottle', vertices: 'variable', edges: 'variable', faces: 'variable' },
    { name: 'fractal', vertices: 'variable', edges: 'variable', faces: 'variable' },
    { name: 'wave', vertices: 'variable', edges: 'variable', faces: 'variable' },
    { name: 'crystal', vertices: 8, edges: 12, faces: 6 }
];

const CORE_TYPES = ['base', 'hypersphere', 'hypertetrahedron'];

/**
 * MCP Server implementation
 */
export class MCPServer {
    constructor(engine = null) {
        this.engine = engine;
        this.sceneId = null;
        this.initialized = false;
        this._gallerySlots = new Map();
    }

    /**
     * Get or lazily create ColorPresetsSystem instance.
     * Requires engine for the parameter update callback.
     * @returns {ColorPresetsSystem|null}
     */
    _getColorPresets() {
        if (this._colorPresets) return this._colorPresets;
        if (!this.engine) return null;
        this._colorPresets = new ColorPresetsSystem(
            (name, value) => this.engine.setParameter(name, value)
        );
        return this._colorPresets;
    }

    /**
     * Get or lazily create TransitionAnimator instance.
     * Requires engine for the parameter update/get callbacks.
     * @returns {TransitionAnimator|null}
     */
    _getTransitionAnimator() {
        if (this._transitionAnimator) return this._transitionAnimator;
        if (!this.engine) return null;
        this._transitionAnimator = new TransitionAnimator(
            (name, value) => this.engine.setParameter(name, value),
            (name) => this.engine.getParameter(name)
        );
        return this._transitionAnimator;
    }

    buildResponse(operation, data, options = {}) {
        const response = {
            success: options.success ?? true,
            operation,
            timestamp: new Date().toISOString(),
            duration_ms: options.duration_ms ?? 0,
            ...data
        };
        return this.validateToolResponse(response);
    }

    validateToolResponse(response) {
        const validation = schemaRegistry.validate('toolResponse', response);
        if (!validation.valid) {
            telemetry.recordEvent(EventType.TOOL_INVOCATION_ERROR, {
                tool: response.operation,
                error: 'TOOL_RESPONSE_INVALID'
            });
            return {
                ...response,
                validation_errors: validation.errors
            };
        }
        return response;
    }

    /**
     * Set the VIB3 engine instance
     */
    setEngine(engine) {
        this.engine = engine;
        this.initialized = !!engine;
    }

    /**
     * Handle MCP tool call
     */
    async handleToolCall(toolName, args = {}) {
        const startTime = performance.now();

        // Validate input
        const validation = validateToolInput(toolName, args);
        if (!validation.valid) {
            telemetry.recordEvent(EventType.TOOL_INVOCATION_ERROR, {
                tool: toolName,
                error: validation.error.code
            });
            return this.buildResponse(toolName, { error: validation.error }, {
                success: false,
                duration_ms: performance.now() - startTime
            });
        }

        // Record start
        telemetry.recordEvent(EventType.TOOL_INVOCATION_START, { tool: toolName });

        try {
            let result;

            switch (toolName) {
                case 'create_4d_visualization':
                    result = await this.createVisualization(args);
                    break;
                case 'set_rotation':
                    result = this.setRotation(args);
                    break;
                case 'set_visual_parameters':
                    result = this.setVisualParameters(args);
                    break;
                case 'switch_system':
                    result = await this.switchSystem(args);
                    break;
                case 'change_geometry':
                    result = this.changeGeometry(args);
                    break;
                case 'get_state':
                    result = this.getState();
                    break;
                case 'randomize_parameters':
                    result = this.randomizeParameters(args);
                    break;
                case 'reset_parameters':
                    result = this.resetParameters();
                    break;
                case 'save_to_gallery':
                    result = this.saveToGallery(args);
                    break;
                case 'load_from_gallery':
                    result = this.loadFromGallery(args);
                    break;
                case 'search_geometries':
                    result = this.searchGeometries(args);
                    break;
                case 'get_parameter_schema':
                    result = this.getParameterSchema();
                    break;
                case 'get_sdk_context':
                    result = this.getSDKContext();
                    break;
                case 'verify_knowledge':
                    result = this.verifyKnowledge(args);
                    break;
                // Reactivity tools (Phase 6.5)
                case 'set_reactivity_config':
                    result = this.setReactivityConfig(args);
                    break;
                case 'get_reactivity_config':
                    result = this.getReactivityConfig();
                    break;
                case 'configure_audio_band':
                    result = this.configureAudioBand(args);
                    break;
                // Export tools (Phase 6.5)
                case 'export_package':
                    result = this.exportPackage(args);
                    break;
                // Preset tools (Phase 6.6)
                case 'apply_behavior_preset':
                    result = this.applyBehaviorPreset(args);
                    break;
                case 'list_behavior_presets':
                    result = this.listBehaviorPresets();
                    break;
                // Agent-power tools (Phase 7)
                case 'describe_visual_state':
                    result = this.describeVisualState();
                    break;
                case 'batch_set_parameters':
                    result = await this.batchSetParameters(args);
                    break;
                case 'create_timeline':
                    result = this.createTimeline(args);
                    break;
                case 'play_transition':
                    result = this.playTransition(args);
                    break;
                case 'apply_color_preset':
                    result = this.applyColorPreset(args);
                    break;
                case 'set_post_processing':
                    result = this.setPostProcessing(args);
                    break;
                case 'create_choreography':
                    result = this.createChoreography(args);
                    break;
                // Visual feedback tools (Phase 7.1)
                case 'capture_screenshot':
                    result = await this.captureScreenshot(args);
                    break;
                case 'design_from_description':
                    result = await this.designFromDescription(args);
                    break;
                case 'get_aesthetic_vocabulary':
                    result = this.getAestheticVocabulary();
                    break;
                case 'play_choreography':
                    result = await this.playChoreographyTool(args);
                    break;
                case 'control_timeline':
                    result = this.controlTimeline(args);
                    break;
                // Layer relationship tools (Phase 8)
                case 'set_layer_profile':
                    result = this.setLayerProfile(args);
                    break;
                case 'set_layer_relationship':
                    result = this.setLayerRelationship(args);
                    break;
                case 'set_layer_keystone':
                    result = this.setLayerKeystone(args);
                    break;
                case 'get_layer_config':
                    result = this.getLayerConfig();
                    break;
                case 'tune_layer_relationship':
                    result = this.tuneLayerRelationship(args);
                    break;
                default:
                    throw new Error(`Unknown tool: ${toolName}`);
            }

            // Record success
            const duration = performance.now() - startTime;
            telemetry.recordEvent(EventType.TOOL_INVOCATION_END, {
                tool: toolName,
                duration_ms: duration,
                success: true
            });

            return this.buildResponse(toolName, result, { duration_ms: duration });

        } catch (error) {
            const duration = performance.now() - startTime;
            telemetry.recordEvent(EventType.TOOL_INVOCATION_ERROR, {
                tool: toolName,
                duration_ms: duration,
                error: error.message
            });

            return this.buildResponse(toolName, {
                error: {
                    type: 'SystemError',
                    code: 'TOOL_EXECUTION_FAILED',
                    message: error.message,
                    suggestion: 'Check engine initialization and parameters',
                    retry_possible: true
                }
            }, { success: false, duration_ms: duration });
        }
    }

    /**
     * Create a new visualization
     */
    async createVisualization(args) {
        const { system = 'quantum', geometry_index = 0, projection = 'perspective' } = args;

        if (this.engine) {
            await this.engine.switchSystem(system);
            if (geometry_index !== undefined) {
                this.engine.setParameter('geometry', geometry_index);
            }
        }

        this.sceneId = generateId('scene_4d');

        const baseIndex = geometry_index % 8;
        const coreIndex = Math.floor(geometry_index / 8);

        return {
            scene_id: this.sceneId,
            geometry: {
                index: geometry_index,
                base_type: BASE_GEOMETRIES[baseIndex].name,
                core_type: CORE_TYPES[coreIndex],
                vertex_count: BASE_GEOMETRIES[baseIndex].vertices,
                edge_count: BASE_GEOMETRIES[baseIndex].edges
            },
            system,
            projection,
            render_info: {
                complexity: geometry_index > 15 ? 'high' : geometry_index > 7 ? 'medium' : 'low',
                estimated_fps: 60
            },
            suggested_next_actions: ['set_rotation', 'set_visual_parameters', 'render_preview']
        };
    }

    /**
     * Set rotation parameters
     */
    setRotation(args) {
        if (this.engine) {
            if (args.XY !== undefined) this.engine.setParameter('rot4dXY', args.XY);
            if (args.XZ !== undefined) this.engine.setParameter('rot4dXZ', args.XZ);
            if (args.YZ !== undefined) this.engine.setParameter('rot4dYZ', args.YZ);
            if (args.XW !== undefined) this.engine.setParameter('rot4dXW', args.XW);
            if (args.YW !== undefined) this.engine.setParameter('rot4dYW', args.YW);
            if (args.ZW !== undefined) this.engine.setParameter('rot4dZW', args.ZW);

            telemetry.recordEvent(EventType.PARAMETER_CHANGE, { type: 'rotation' });
        }

        return {
            rotation_state: {
                XY: args.XY ?? 0,
                XZ: args.XZ ?? 0,
                YZ: args.YZ ?? 0,
                XW: args.XW ?? 0,
                YW: args.YW ?? 0,
                ZW: args.ZW ?? 0
            },
            suggested_next_actions: ['set_visual_parameters', 'render_preview']
        };
    }

    /**
     * Set visual parameters
     */
    setVisualParameters(args) {
        if (this.engine) {
            for (const [key, value] of Object.entries(args)) {
                this.engine.setParameter(key, value);
            }
            telemetry.recordEvent(EventType.PARAMETER_BATCH_CHANGE, {
                count: Object.keys(args).length
            });
        }

        return {
            parameters_updated: Object.keys(args),
            suggested_next_actions: ['render_preview', 'save_to_gallery']
        };
    }

    /**
     * Switch visualization system
     */
    async switchSystem(args) {
        const { system } = args;

        if (this.engine) {
            await this.engine.switchSystem(system);
            telemetry.recordEvent(EventType.SYSTEM_SWITCH, { system });
        }

        return {
            active_system: system,
            available_geometries: 24,
            suggested_next_actions: ['change_geometry', 'set_visual_parameters']
        };
    }

    /**
     * Change geometry
     */
    changeGeometry(args) {
        let geometryIndex = args.geometry_index;

        // Convert from base_type + core_type if provided
        if (args.base_type !== undefined) {
            const baseIndex = BASE_GEOMETRIES.findIndex(g => g.name === args.base_type);
            if (baseIndex === -1) {
                return {
                    error: {
                        type: 'ValidationError',
                        code: 'INVALID_BASE_TYPE',
                        message: `Unknown base type: ${args.base_type}`,
                        valid_options: BASE_GEOMETRIES.map(g => g.name),
                        suggestion: 'Use one of the valid base geometry types'
                    }
                };
            }

            const coreIndex = CORE_TYPES.indexOf(args.core_type || 'base');
            geometryIndex = coreIndex * 8 + baseIndex;
        }

        if (this.engine && geometryIndex !== undefined) {
            this.engine.setParameter('geometry', geometryIndex);
            telemetry.recordEvent(EventType.GEOMETRY_CHANGE, { geometry: geometryIndex });
        }

        const baseIndex = geometryIndex % 8;
        const coreIndex = Math.floor(geometryIndex / 8);

        return {
            geometry: {
                index: geometryIndex,
                base_type: BASE_GEOMETRIES[baseIndex].name,
                core_type: CORE_TYPES[coreIndex]
            },
            suggested_next_actions: ['set_rotation', 'set_visual_parameters']
        };
    }

    /**
     * Get current state
     */
    getState() {
        let params = {};
        let system = 'quantum';

        if (this.engine) {
            params = this.engine.getAllParameters();
            system = this.engine.getCurrentSystem();
        }

        const geometryIndex = params.geometry || 0;
        const baseIndex = geometryIndex % 8;
        const coreIndex = Math.floor(geometryIndex / 8);

        return {
            scene_id: this.sceneId,
            system,
            geometry: {
                index: geometryIndex,
                base_type: BASE_GEOMETRIES[baseIndex].name,
                core_type: CORE_TYPES[coreIndex]
            },
            rotation_state: {
                XY: params.rot4dXY || 0,
                XZ: params.rot4dXZ || 0,
                YZ: params.rot4dYZ || 0,
                XW: params.rot4dXW || 0,
                YW: params.rot4dYW || 0,
                ZW: params.rot4dZW || 0
            },
            visual: {
                dimension: params.dimension,
                gridDensity: params.gridDensity,
                morphFactor: params.morphFactor,
                chaos: params.chaos,
                speed: params.speed,
                hue: params.hue,
                intensity: params.intensity,
                saturation: params.saturation
            },
            suggested_next_actions: ['set_rotation', 'set_visual_parameters', 'save_to_gallery']
        };
    }

    /**
     * Randomize parameters
     */
    randomizeParameters(args) {
        if (this.engine) {
            this.engine.randomizeAll();
            telemetry.recordEvent(EventType.PARAMETER_RANDOMIZE, {});
        }

        return {
            ...this.getState(),
            randomized: true
        };
    }

    /**
     * Reset parameters
     */
    resetParameters() {
        if (this.engine) {
            this.engine.resetAll();
            telemetry.recordEvent(EventType.PARAMETER_RESET, {});
        }

        return {
            ...this.getState(),
            reset: true
        };
    }

    /**
     * Save to gallery
     */
    saveToGallery(args) {
        const { slot, name } = args;

        telemetry.recordEvent(EventType.GALLERY_SAVE, { slot });

        // Persist actual engine state if available
        if (this.engine) {
            const state = this.engine.exportState();
            this._gallerySlots.set(slot, {
                name: name || `Variation ${slot}`,
                saved_at: new Date().toISOString(),
                state
            });
        }

        return {
            slot,
            name: name || `Variation ${slot}`,
            saved_at: new Date().toISOString(),
            persisted: !!this.engine,
            gallery_size: this._gallerySlots.size,
            suggested_next_actions: ['load_from_gallery', 'randomize_parameters']
        };
    }

    /**
     * Load from gallery — restores previously saved state
     */
    loadFromGallery(args) {
        const { slot } = args;

        telemetry.recordEvent(EventType.GALLERY_LOAD, { slot });

        const saved = this._gallerySlots.get(slot);
        if (saved && this.engine) {
            // Restore saved state
            this.engine.importState(saved.state);
            return {
                slot,
                name: saved.name,
                saved_at: saved.saved_at,
                loaded_at: new Date().toISOString(),
                restored: true,
                ...this.getState()
            };
        }

        if (!saved) {
            // No saved state — fall back to random variation
            if (this.engine) {
                const params = this.engine.parameters?.generateVariationParameters?.(slot) || {};
                this.engine.setParameters(params);
            }
            return {
                slot,
                loaded_at: new Date().toISOString(),
                restored: false,
                note: 'No saved state in this slot — generated random variation',
                ...this.getState()
            };
        }

        return {
            slot,
            loaded_at: new Date().toISOString(),
            restored: false,
            note: 'Engine not initialized — cannot apply state'
        };
    }

    /**
     * Search geometries
     */
    searchGeometries(args) {
        const { core_type = 'all' } = args;

        const geometries = [];
        for (let i = 0; i < 24; i++) {
            const baseIndex = i % 8;
            const coreIndex = Math.floor(i / 8);
            const coreTypeName = CORE_TYPES[coreIndex];

            if (core_type !== 'all' && coreTypeName !== core_type) continue;

            geometries.push({
                index: i,
                base_type: BASE_GEOMETRIES[baseIndex].name,
                core_type: coreTypeName,
                vertex_count: BASE_GEOMETRIES[baseIndex].vertices,
                edge_count: BASE_GEOMETRIES[baseIndex].edges,
                description: this.getGeometryDescription(baseIndex, coreIndex)
            });
        }

        return {
            count: geometries.length,
            geometries,
            encoding_formula: 'geometry_index = core_index * 8 + base_index'
        };
    }

    /**
     * Get geometry description
     */
    getGeometryDescription(baseIndex, coreIndex) {
        const baseDesc = {
            0: 'Simple 4-vertex lattice, fundamental polytope',
            1: '4D cube projection with 16 vertices and 32 edges',
            2: 'Radial harmonic sphere with smooth surfaces',
            3: 'Toroidal field with continuous surface',
            4: 'Non-orientable surface with topological twist',
            5: 'Recursive subdivision with self-similar structure',
            6: 'Sinusoidal interference patterns',
            7: 'Octahedral crystal structure'
        };

        const coreDesc = {
            0: 'Pure base geometry',
            1: 'Wrapped in 4D hypersphere using warpHypersphereCore()',
            2: 'Wrapped in 4D hypertetrahedron using warpHypertetraCore()'
        };

        return `${baseDesc[baseIndex]}. ${coreDesc[coreIndex]}`;
    }

    /**
     * Get parameter schema
     */
    getParameterSchema() {
        return {
            schema: schemaRegistry.getSchema('parameters'),
            usage: 'Validate parameters using this schema before setting them',
            suggested_next_actions: ['set_rotation', 'set_visual_parameters']
        };
    }

    /**
     * Get SDK context for agent onboarding
     */
    getSDKContext() {
        return {
            sdk_name: 'VIB3+ SDK',
            version: '1.9.0',
            purpose: 'General-purpose 4D rotation visualization SDK for plugins, extensions, wearables, and agentic use',

            quick_reference: {
                active_visualization_systems: 3,
                placeholder_systems: 1,
                rotation_planes: 6,
                base_geometries: 8,
                core_warp_types: 3,
                total_geometries: 24,
                canvas_layers_per_system: 5
            },

            systems: {
                ACTIVE: [
                    { name: 'quantum', description: 'Complex quantum lattice visualizations with 24 geometries' },
                    { name: 'faceted', description: 'Clean 2D geometric patterns with 4D rotation' },
                    { name: 'holographic', description: '5-layer audio-reactive holographic effects' }
                ],
                PLACEHOLDER_TBD: [
                    { name: 'polychora', status: 'TBD', description: '4D polytopes - placeholder, not production ready' }
                ]
            },

            geometry_encoding: {
                formula: 'geometry_index = core_index * 8 + base_index',
                base_geometries: ['tetrahedron', 'hypercube', 'sphere', 'torus', 'klein_bottle', 'fractal', 'wave', 'crystal'],
                core_types: ['base (0)', 'hypersphere (1)', 'hypertetrahedron (2)'],
                example: 'geometry 10 = hypersphere(sphere) because 1*8+2=10'
            },

            rotation_planes: {
                total: 6,
                '3D_space': ['XY', 'XZ', 'YZ'],
                '4D_hyperspace': ['XW', 'YW', 'ZW'],
                range: '-6.28 to 6.28 radians'
            },

            canvas_layers: {
                count: 5,
                names: ['background', 'shadow', 'content', 'highlight', 'accent']
            },

            knowledge_quiz: {
                IMPORTANT: 'Call verify_knowledge with multiple choice answers (a/b/c/d) to confirm understanding',
                questions: [
                    'Q1: How many rotation planes? a)3 b)4 c)6 d)8',
                    'Q2: Geometry encoding formula? a)base*3+core b)core*8+base c)base+core d)core*base',
                    'Q3: Canvas layers per system? a)3 b)4 c)5 d)6',
                    'Q4: Which are the 3 ACTIVE systems? a)quantum,faceted,holographic b)quantum,faceted,polychora c)all four d)none',
                    'Q5: How many base geometry types? a)6 b)8 c)10 d)24',
                    'Q6: Core warp types? a)base,sphere,cube b)base,hypersphere,hypertetrahedron c)2D,3D,4D d)none'
                ]
            },

            documentation: {
                primary: 'DOCS/SYSTEM_INVENTORY.md',
                geometry: '24-GEOMETRY-6D-ROTATION-SUMMARY.md',
                controls: 'DOCS/CONTROL_REFERENCE.md',
                cli: 'DOCS/CLI_ONBOARDING.md'
            },

            suggested_next_actions: ['verify_knowledge', 'create_4d_visualization', 'search_geometries']
        };
    }

    /**
     * Verify agent knowledge of SDK (multiple choice)
     */
    verifyKnowledge(answers) {
        const correctAnswers = {
            q1_rotation_planes: 'c',      // 6 rotation planes
            q2_geometry_formula: 'b',     // core*8+base
            q3_canvas_layers: 'c',        // 5 layers
            q4_active_systems: 'a',       // quantum, faceted, holographic (polychora is TBD)
            q5_base_geometries: 'b',      // 8 base geometries
            q6_core_types: 'b'            // base, hypersphere, hypertetrahedron
        };

        const docReferences = {
            q1_rotation_planes: {
                topic: '6D ROTATION SYSTEM',
                doc: 'DOCS/SYSTEM_INVENTORY.md#the-6d-rotation-system',
                reason: '6 planes: XY, XZ, YZ (3D) + XW, YW, ZW (4D hyperspace)'
            },
            q2_geometry_formula: {
                topic: 'GEOMETRY ENCODING',
                doc: '24-GEOMETRY-6D-ROTATION-SUMMARY.md',
                reason: 'geometry = coreIndex * 8 + baseIndex. Example: 10 = 1*8+2 = hypersphere+sphere'
            },
            q3_canvas_layers: {
                topic: 'CANVAS LAYER SYSTEM',
                doc: 'DOCS/SYSTEM_INVENTORY.md#the-4-visualization-systems',
                reason: '5 layers: background, shadow, content, highlight, accent'
            },
            q4_active_systems: {
                topic: 'ACTIVE VS PLACEHOLDER SYSTEMS',
                doc: 'DOCS/SYSTEM_INVENTORY.md',
                reason: 'Only 3 ACTIVE: quantum, faceted, holographic. Polychora is TBD/placeholder!'
            },
            q5_base_geometries: {
                topic: 'BASE GEOMETRY TYPES',
                doc: '24-GEOMETRY-6D-ROTATION-SUMMARY.md',
                reason: '8 base: tetrahedron, hypercube, sphere, torus, klein, fractal, wave, crystal'
            },
            q6_core_types: {
                topic: 'CORE WARP TYPES',
                doc: '24-GEOMETRY-6D-ROTATION-SUMMARY.md',
                reason: '3 cores: base (no warp), hypersphere, hypertetrahedron'
            }
        };

        const results = {
            score: 0,
            max_score: 6,
            details: [],
            REVIEW_REQUIRED: []
        };

        // Check each answer
        for (const [question, correct] of Object.entries(correctAnswers)) {
            const given = answers[question]?.toLowerCase?.() || answers[question];
            if (given === correct) {
                results.score++;
                results.details.push({ question, status: '✓ CORRECT' });
            } else if (given !== undefined) {
                results.details.push({
                    question,
                    status: '✗ WRONG',
                    your_answer: given,
                    correct_answer: correct
                });
                results.REVIEW_REQUIRED.push(docReferences[question]);
            }
        }

        results.percentage = Math.round((results.score / results.max_score) * 100);

        // Build response
        if (results.REVIEW_REQUIRED.length > 0) {
            results.MESSAGE = `Score: ${results.score}/${results.max_score}. YOU MAY PROCEED but PLEASE review the topics below to avoid errors.`;
            results.URGENT = results.REVIEW_REQUIRED.map(ref => ({
                TOPIC: ref.topic,
                READ: ref.doc,
                WHY: ref.reason
            }));
        } else {
            results.MESSAGE = `PERFECT SCORE! You understand the VIB3+ SDK architecture.`;
        }

        results.suggested_next_actions = ['create_4d_visualization', 'get_state', 'search_geometries'];

        return results;
    }

    /**
     * Get available tools (for progressive disclosure)
     */
    listTools(includeSchemas = false) {
        if (includeSchemas) {
            return getToolList();
        }

        return Object.keys(toolDefinitions).map(name => ({
            name,
            description: toolDefinitions[name].description
        }));
    }

    // ===== REACTIVITY HANDLERS (Phase 6.5) =====

    /**
     * Set reactivity configuration
     */
    setReactivityConfig(args) {
        const { audio, tilt, interaction } = args;

        // Update via global reactivity manager if available (browser only)
        const isBrowser = typeof window !== 'undefined';
        if (isBrowser && window.reactivityManager) {
            if (audio) {
                if (audio.enabled !== undefined) window.audioEnabled = audio.enabled;
                if (audio.globalSensitivity !== undefined) {
                    window.reactivityManager.setAudioSensitivity?.(audio.globalSensitivity);
                }
            }
            if (tilt) {
                if (tilt.enabled !== undefined) window.toggleDeviceTilt?.();
                if (tilt.dramaticMode !== undefined) {
                    window.setDramaticMode?.(tilt.dramaticMode);
                }
            }
            if (interaction) {
                if (interaction.mouseMode) window.setMouseMode?.(interaction.mouseMode);
                if (interaction.clickMode) window.setClickMode?.(interaction.clickMode);
                if (interaction.scrollMode) window.setScrollMode?.(interaction.scrollMode);
            }
        }

        telemetry.recordEvent(EventType.PARAMETER_CHANGE, { type: 'reactivity' });

        return {
            updated: true,
            config: { audio: audio || {}, tilt: tilt || {}, interaction: interaction || {} },
            suggested_next_actions: ['get_reactivity_config', 'apply_behavior_preset']
        };
    }

    /**
     * Get current reactivity configuration
     */
    getReactivityConfig() {
        const isBrowser = typeof window !== 'undefined';
        return {
            config: {
                audio: {
                    enabled: isBrowser ? (window.audioEnabled || false) : false,
                    globalSensitivity: isBrowser ? (window.reactivityManager?.audioSensitivity || 1.0) : 1.0
                },
                tilt: {
                    enabled: isBrowser ? (window.deviceTiltHandler?.isEnabled || false) : false,
                    dramaticMode: isBrowser ? (window.dramaticMode || false) : false
                },
                interaction: {
                    enabled: isBrowser ? (window.interactivityEnabled !== false) : true,
                    mouseMode: isBrowser ? (window.currentMouseMode || 'rotation') : 'rotation',
                    clickMode: isBrowser ? (window.currentClickMode || 'burst') : 'burst',
                    scrollMode: isBrowser ? (window.currentScrollMode || 'cycle') : 'cycle'
                }
            },
            suggested_next_actions: ['set_reactivity_config', 'configure_audio_band', 'apply_behavior_preset']
        };
    }

    /**
     * Configure a single audio band
     */
    configureAudioBand(args) {
        const { band, enabled, sensitivity, targets } = args;

        const isBrowser = typeof window !== 'undefined';
        if (isBrowser && window.reactivityManager?.configureAudioBand) {
            window.reactivityManager.configureAudioBand(band, { enabled, sensitivity, targets });
        }

        telemetry.recordEvent(EventType.PARAMETER_CHANGE, { type: 'audio_band', band });

        return {
            band,
            updated: true,
            config: { enabled, sensitivity, targets },
            suggested_next_actions: ['get_reactivity_config', 'configure_audio_band']
        };
    }

    // ===== EXPORT HANDLERS (Phase 6.5) =====

    /**
     * Export VIB3Package
     */
    exportPackage(args) {
        const { name, description, includeReactivity = true, includeEmbed = true, format = 'json' } = args;

        const visualParams = this.getState()?.parameters || {};
        const isBrowser = typeof window !== 'undefined';
        const system = isBrowser ? (window.currentSystem || 'quantum') : 'quantum';
        const reactivityConfig = includeReactivity ? this.getReactivityConfig().config : null;

        const package_ = {
            id: generateId('pkg'),
            version: '2.0',
            type: 'vib3-package',
            name: name || `VIB3 ${system} Export`,
            description: description || 'Exported visualization package',
            created: new Date().toISOString(),
            system,
            visual: {
                parameters: visualParams,
                geometry: {
                    index: visualParams.geometry || 0,
                    coreIndex: Math.floor((visualParams.geometry || 0) / 8),
                    baseIndex: (visualParams.geometry || 0) % 8
                }
            }
        };

        if (includeReactivity && reactivityConfig) package_.reactivity = reactivityConfig;
        if (includeEmbed) {
            package_.embed = {
                html: `<div id="vib3-container" data-package="${package_.id}"></div>`,
                js: `VIB3.loadPackage(${JSON.stringify(package_.id)});`,
                iframe: `<iframe src="https://vib3.app/embed/${package_.id}" width="100%" height="400"></iframe>`
            };
        }

        return { package: package_, format, suggested_next_actions: ['save_to_gallery', 'apply_behavior_preset'] };
    }

    // ===== PRESET HANDLERS (Phase 6.6) =====

    static BEHAVIOR_PRESETS = {
        ambient: {
            name: 'Ambient',
            description: 'Calm, slow, minimal reactivity - perfect for backgrounds',
            config: {
                audio: { enabled: false },
                tilt: { enabled: true, sensitivity: 0.3, dramaticMode: false },
                interaction: { mouseMode: 'shimmer', clickMode: 'none', scrollMode: 'none' }
            },
            visualOverrides: { speed: 0.3, chaos: 0.1 }
        },
        reactive: {
            name: 'Reactive',
            description: 'High audio reactivity - responds to music/sound',
            config: {
                audio: { enabled: true, globalSensitivity: 1.5 },
                tilt: { enabled: false },
                interaction: { mouseMode: 'rotation', clickMode: 'burst', scrollMode: 'cycle' }
            },
            visualOverrides: { speed: 1.0, chaos: 0.3 }
        },
        immersive: {
            name: 'Immersive',
            description: 'Full tilt control with dramatic rotations',
            config: {
                audio: { enabled: true, globalSensitivity: 0.8 },
                tilt: { enabled: true, sensitivity: 1.0, dramaticMode: true },
                interaction: { mouseMode: 'velocity', clickMode: 'ripple', scrollMode: 'zoom' }
            },
            visualOverrides: { speed: 0.8 }
        },
        energetic: {
            name: 'Energetic',
            description: 'Fast, chaotic, high-energy visuals',
            config: {
                audio: { enabled: true, globalSensitivity: 2.0 },
                tilt: { enabled: true, sensitivity: 1.5, dramaticMode: true },
                interaction: { mouseMode: 'velocity', clickMode: 'blast', scrollMode: 'wave' }
            },
            visualOverrides: { speed: 2.5, chaos: 0.8, morphFactor: 1.5 }
        },
        calm: {
            name: 'Calm',
            description: 'Slow, smooth, meditative patterns',
            config: {
                audio: { enabled: false },
                tilt: { enabled: true, sensitivity: 0.2, dramaticMode: false },
                interaction: { mouseMode: 'shimmer', clickMode: 'pulse', scrollMode: 'none' }
            },
            visualOverrides: { speed: 0.2, chaos: 0.05, morphFactor: 0.3 }
        },
        cinematic: {
            name: 'Cinematic',
            description: 'Dramatic rotations, smooth transitions for video',
            config: {
                audio: { enabled: false },
                tilt: { enabled: false },
                interaction: { mouseMode: 'none', clickMode: 'none', scrollMode: 'none' }
            },
            visualOverrides: { speed: 0.5, chaos: 0.2 }
        }
    };

    /**
     * Apply a behavior preset
     */
    applyBehaviorPreset(args) {
        const { preset } = args;
        const presetConfig = MCPServer.BEHAVIOR_PRESETS[preset];

        if (!presetConfig) {
            return {
                error: {
                    type: 'ValidationError',
                    code: 'INVALID_PRESET',
                    message: `Unknown preset: ${preset}`,
                    valid_options: Object.keys(MCPServer.BEHAVIOR_PRESETS)
                }
            };
        }

        this.setReactivityConfig(presetConfig.config);

        if (presetConfig.visualOverrides && this.engine) {
            for (const [param, value] of Object.entries(presetConfig.visualOverrides)) {
                this.engine.setParameter(param, value);
            }
        }

        telemetry.recordEvent(EventType.PARAMETER_CHANGE, { type: 'preset', preset });

        return {
            preset,
            applied: true,
            name: presetConfig.name,
            description: presetConfig.description,
            config: presetConfig.config,
            visualOverrides: presetConfig.visualOverrides,
            suggested_next_actions: ['get_reactivity_config', 'set_visual_parameters', 'export_package']
        };
    }

    /**
     * List available behavior presets
     */
    listBehaviorPresets() {
        return {
            count: Object.keys(MCPServer.BEHAVIOR_PRESETS).length,
            presets: Object.entries(MCPServer.BEHAVIOR_PRESETS).map(([key, value]) => ({
                id: key,
                name: value.name,
                description: value.description
            })),
            suggested_next_actions: ['apply_behavior_preset']
        };
    }

    // ===== AGENT-POWER TOOLS (Phase 7 — Agent Harness) =====

    /**
     * Generate a natural-language description of the current visual state.
     * Enables text-only agents to "see" what the visualization looks like.
     */
    describeVisualState() {
        const state = this.getState();
        const params = state.visual || {};
        const rotation = state.rotation_state || {};
        const geometry = state.geometry || {};

        // Color description from hue
        const hue = params.hue || 0;
        const colorName = hue < 15 ? 'red' : hue < 45 ? 'orange' : hue < 75 ? 'yellow' :
            hue < 150 ? 'green' : hue < 195 ? 'cyan' : hue < 255 ? 'blue' :
            hue < 285 ? 'purple' : hue < 330 ? 'magenta' : 'red';
        const satDesc = (params.saturation || 0.8) > 0.7 ? 'vivid' :
            (params.saturation || 0.8) > 0.4 ? 'moderate' : 'desaturated';
        const intensityDesc = (params.intensity || 0.5) > 0.7 ? 'bright' :
            (params.intensity || 0.5) > 0.3 ? 'medium brightness' : 'dim';

        // Motion description
        const speed = params.speed || 1.0;
        const speedDesc = speed > 2.0 ? 'rapidly' : speed > 1.0 ? 'moderately' :
            speed > 0.4 ? 'slowly' : 'very slowly';
        const chaos = params.chaos || 0;
        const chaosDesc = chaos > 0.7 ? 'highly turbulent' : chaos > 0.3 ? 'somewhat organic' :
            chaos > 0.05 ? 'subtly alive' : 'perfectly still';

        // 4D rotation activity
        const has4D = Math.abs(rotation.XW || 0) > 0.1 ||
            Math.abs(rotation.YW || 0) > 0.1 ||
            Math.abs(rotation.ZW || 0) > 0.1;
        const rotDesc = has4D ? 'with visible 4D hyperspace rotation (inside-out morphing)' :
            'in standard 3D orientation';

        // Density/complexity
        const density = params.gridDensity || 10;
        const densityDesc = density > 50 ? 'extremely intricate' : density > 25 ? 'detailed' :
            density > 12 ? 'moderate detail' : 'bold and sparse';

        // Projection
        const dim = params.dimension || 3.8;
        const projDesc = dim < 3.3 ? 'dramatic fish-eye distortion' :
            dim < 3.8 ? 'moderate perspective depth' : 'subtle, flattened perspective';

        const description = [
            `A ${satDesc} ${colorName} ${geometry.core_type || 'base'} ${geometry.base_type || 'tetrahedron'}`,
            `rendered in the ${state.system || 'quantum'} system.`,
            `The pattern is ${densityDesc} and ${chaosDesc},`,
            `animating ${speedDesc} ${rotDesc}.`,
            `Color is ${intensityDesc} with ${projDesc}.`,
            params.morphFactor > 0.5 ? `Shape is morphing between geometries (factor: ${params.morphFactor}).` : ''
        ].filter(Boolean).join(' ');

        return {
            description,
            mood: this._assessMood(params),
            complexity: density > 40 ? 'high' : density > 15 ? 'medium' : 'low',
            motion_level: speed > 1.5 ? 'high' : speed > 0.5 ? 'medium' : 'low',
            has_4d_rotation: has4D,
            color_family: colorName,
            suggested_next_actions: ['set_visual_parameters', 'set_rotation', 'batch_set_parameters']
        };
    }

    /**
     * Assess the emotional mood of the current visual state
     */
    _assessMood(params) {
        const hue = params.hue || 0;
        const speed = params.speed || 1.0;
        const chaos = params.chaos || 0;
        const intensity = params.intensity || 0.5;

        if (speed < 0.3 && chaos < 0.1) return 'serene';
        if (speed > 2.0 && chaos > 0.6) return 'chaotic';
        if (hue > 180 && hue < 260 && intensity < 0.5) return 'mysterious';
        if (hue > 0 && hue < 60 && intensity > 0.6) return 'warm';
        if (hue > 150 && hue < 200 && speed < 0.8) return 'tranquil';
        if (chaos > 0.5 && speed > 1.5) return 'energetic';
        if (intensity > 0.8) return 'vibrant';
        return 'balanced';
    }

    /**
     * Atomically set multiple parameter categories in one call
     */
    async batchSetParameters(args) {
        const { system, geometry, rotation, visual, preset } = args;

        // Switch system first if requested
        if (system && this.engine) {
            await this.engine.switchSystem(system);
        }

        // Set geometry
        if (geometry !== undefined && this.engine) {
            this.engine.setParameter('geometry', geometry);
        }

        // Set rotation
        if (rotation) {
            const rotMap = { XY: 'rot4dXY', XZ: 'rot4dXZ', YZ: 'rot4dYZ',
                            XW: 'rot4dXW', YW: 'rot4dYW', ZW: 'rot4dZW' };
            for (const [key, value] of Object.entries(rotation)) {
                if (value !== undefined && this.engine) {
                    this.engine.setParameter(rotMap[key], value);
                }
            }
        }

        // Set visual parameters
        if (visual && this.engine) {
            for (const [key, value] of Object.entries(visual)) {
                this.engine.setParameter(key, value);
            }
        }

        // Apply preset last (overrides relevant params)
        if (preset) {
            this.applyBehaviorPreset({ preset });
        }

        telemetry.recordEvent(EventType.PARAMETER_BATCH_CHANGE, {
            count: (rotation ? Object.keys(rotation).length : 0) +
                   (visual ? Object.keys(visual).length : 0) +
                   (system ? 1 : 0) + (geometry !== undefined ? 1 : 0)
        });

        return {
            ...this.getState(),
            batch_applied: true,
            suggested_next_actions: ['describe_visual_state', 'save_to_gallery', 'create_timeline']
        };
    }

    /**
     * Create a ParameterTimeline from agent specification
     */
    createTimeline(args) {
        const { name, duration_ms, bpm, loop_mode = 'once', tracks } = args;

        const timelineId = generateId('timeline');

        // Validate tracks have properly sorted keyframes
        const validatedTracks = {};
        for (const [param, keyframes] of Object.entries(tracks)) {
            validatedTracks[param] = keyframes
                .map(kf => ({
                    time: Math.max(0, Math.min(kf.time, duration_ms)),
                    value: kf.value,
                    easing: kf.easing || 'easeInOut'
                }))
                .sort((a, b) => a.time - b.time);
        }

        // Build timeline data for ParameterTimeline consumption
        const timelineData = {
            id: timelineId,
            name: name || `Timeline ${timelineId}`,
            duration: duration_ms,
            bpm: bpm || null,
            loopMode: loop_mode,
            tracks: validatedTracks
        };

        // If engine is available, create and start the timeline
        if (this.engine) {
            // Store for later retrieval
            if (!this._timelines) this._timelines = new Map();
            this._timelines.set(timelineId, timelineData);
        }

        return {
            timeline_id: timelineId,
            name: timelineData.name,
            duration_ms,
            bpm: bpm || null,
            loop_mode,
            track_count: Object.keys(validatedTracks).length,
            tracks_summary: Object.entries(validatedTracks).map(([param, kfs]) => ({
                parameter: param,
                keyframe_count: kfs.length,
                value_range: [
                    Math.min(...kfs.map(k => k.value)),
                    Math.max(...kfs.map(k => k.value))
                ]
            })),
            load_code: `const tl = new ParameterTimeline((n, v) => engine.setParameter(n, v));\ntl.importTimeline(${JSON.stringify(timelineData)});\ntl.play();`,
            suggested_next_actions: ['play_transition', 'describe_visual_state', 'save_to_gallery']
        };
    }

    /**
     * Play a smooth transition sequence
     */
    playTransition(args) {
        const { sequence } = args;

        const transitionId = generateId('transition');

        // Validate and normalize the sequence
        const normalizedSequence = sequence.map((step, i) => ({
            params: step.params,
            duration: step.duration || 1000,
            easing: step.easing || 'easeInOut',
            delay: step.delay || 0
        }));

        const totalDuration = normalizedSequence.reduce(
            (sum, step) => sum + step.duration + step.delay, 0
        );

        // Execute live if engine available
        let executing = false;
        const animator = this._getTransitionAnimator();
        if (animator) {
            const seqId = animator.sequence(normalizedSequence);
            executing = !!seqId;
        }

        return {
            transition_id: transitionId,
            executing,
            step_count: normalizedSequence.length,
            total_duration_ms: totalDuration,
            steps: normalizedSequence.map((step, i) => ({
                index: i,
                params: Object.keys(step.params),
                duration: step.duration,
                easing: step.easing,
                delay: step.delay
            })),
            load_code: executing ? null : `const animator = new TransitionAnimator(\n  (n, v) => engine.setParameter(n, v),\n  (n) => engine.getParameter(n)\n);\nanimator.sequence(${JSON.stringify(normalizedSequence)});`,
            suggested_next_actions: ['describe_visual_state', 'create_timeline', 'save_to_gallery']
        };
    }

    /**
     * Apply a named color preset
     */
    applyColorPreset(args) {
        const { preset, transition = true, duration = 800 } = args;

        const colorSystem = this._getColorPresets();

        if (colorSystem) {
            // Use real ColorPresetsSystem — full preset library with transitions
            const config = colorSystem.getPreset(preset);
            if (!config) {
                const allPresets = colorSystem.getPresets().map(p => p.name);
                return {
                    error: {
                        type: 'ValidationError',
                        code: 'INVALID_COLOR_PRESET',
                        message: `Unknown color preset: ${preset}`,
                        valid_options: allPresets
                    }
                };
            }

            colorSystem.applyPreset(preset, transition, duration);

            return {
                preset,
                applied: { hue: config.hue, saturation: config.saturation, intensity: config.intensity },
                transition: transition ? { enabled: true, duration } : { enabled: false },
                full_config: config,
                suggested_next_actions: ['set_post_processing', 'describe_visual_state', 'set_visual_parameters']
            };
        }

        // Fallback: no engine, return preset metadata for artifact mode
        return {
            preset,
            applied: null,
            load_code: `const colors = new ColorPresetsSystem((n, v) => engine.setParameter(n, v));\ncolors.applyPreset('${preset}', ${transition}, ${duration});`,
            suggested_next_actions: ['set_post_processing', 'describe_visual_state', 'set_visual_parameters']
        };
    }

    /**
     * Configure post-processing effects pipeline
     */
    setPostProcessing(args) {
        const { effects, chain_preset, clear_first = true } = args;

        // Try to execute live in browser context
        let executing = false;
        if (typeof document !== 'undefined') {
            try {
                const target = document.getElementById('viz-container')
                    || document.querySelector('.vib3-container')
                    || document.querySelector('canvas')?.parentElement;

                if (target) {
                    // Lazy-init pipeline, importing dynamically to avoid Node.js issues
                    if (!this._postPipeline) {
                        // PostProcessingPipeline imported statically would fail in Node;
                        // it's already a known browser-only module, so guard at runtime
                        const { PostProcessingPipeline: PPP } = { PostProcessingPipeline: globalThis.PostProcessingPipeline };
                        if (PPP) {
                            this._postPipeline = new PPP(target);
                        }
                    }

                    if (this._postPipeline) {
                        if (clear_first) this._postPipeline.clearChain?.();
                        if (chain_preset) {
                            this._postPipeline.loadPresetChain(chain_preset);
                        } else if (effects) {
                            for (const e of effects) {
                                this._postPipeline.addEffect(e.name, { intensity: e.intensity || 0.5, ...e });
                            }
                        }
                        this._postPipeline.apply();
                        executing = true;
                    }
                }
            } catch { /* fall through to code generation */ }
        }

        return {
            applied: true,
            executing,
            effects: effects || [],
            chain_preset: chain_preset || null,
            cleared_previous: clear_first,
            load_code: executing ? null : (effects ?
                `const pipeline = new PostProcessingPipeline(document.getElementById('viz-container'));\n${effects.map(e => `pipeline.addEffect('${e.name}', { intensity: ${e.intensity || 0.5} });`).join('\n')}\npipeline.apply();` :
                `const pipeline = new PostProcessingPipeline(document.getElementById('viz-container'));\npipeline.loadPresetChain('${chain_preset}');\npipeline.apply();`),
            suggested_next_actions: ['describe_visual_state', 'apply_color_preset', 'create_choreography']
        };
    }

    /**
     * Create a multi-scene choreography — the most powerful agent composition tool
     */
    createChoreography(args) {
        const { name, duration_ms, bpm, scenes } = args;

        const choreographyId = generateId('choreo');

        // Validate scene time ranges don't exceed duration
        const validatedScenes = scenes.map((scene, i) => ({
            index: i,
            time_start: Math.max(0, scene.time_start),
            time_end: Math.min(scene.time_end, duration_ms),
            system: scene.system,
            geometry: scene.geometry ?? 0,
            transition_in: scene.transition_in || { type: 'cut', duration: 0 },
            tracks: scene.tracks || {},
            color_preset: scene.color_preset || null,
            post_processing: scene.post_processing || [],
            audio: scene.audio || null
        }));

        const choreography = {
            id: choreographyId,
            name: name || `Choreography ${choreographyId}`,
            duration_ms,
            bpm: bpm || null,
            scene_count: validatedScenes.length,
            scenes: validatedScenes
        };

        // Store for later retrieval
        if (!this._choreographies) this._choreographies = new Map();
        this._choreographies.set(choreographyId, choreography);

        return {
            choreography_id: choreographyId,
            name: choreography.name,
            duration_ms,
            bpm: bpm || null,
            scene_count: validatedScenes.length,
            scenes_summary: validatedScenes.map(s => ({
                index: s.index,
                time: `${s.time_start}ms → ${s.time_end}ms`,
                system: s.system,
                geometry: s.geometry,
                transition: s.transition_in.type,
                track_count: Object.keys(s.tracks).length,
                color_preset: s.color_preset,
                effects: s.post_processing
            })),
            choreography_json: JSON.stringify(choreography, null, 2),
            suggested_next_actions: ['describe_visual_state', 'export_package']
        };
    }

    // ===== VISUAL FEEDBACK TOOLS (Phase 7.1 — Agent Harness) =====

    /**
     * Capture the current visualization as a base64 PNG by compositing all canvas layers.
     * Only works in browser context where canvases exist.
     */
    async captureScreenshot(args) {
        const { width = 512, height = 512, format = 'png', quality = 0.92 } = args;

        const isBrowser = typeof document !== 'undefined';
        if (!isBrowser) {
            return {
                error: {
                    type: 'EnvironmentError',
                    code: 'NO_BROWSER_CONTEXT',
                    message: 'capture_screenshot requires a browser context with canvas elements',
                    suggestion: 'Use the headless renderer tool (tools/headless-renderer.js) for Node.js environments'
                }
            };
        }

        try {
            // Create composite canvas
            const composite = document.createElement('canvas');
            composite.width = width;
            composite.height = height;
            const ctx = composite.getContext('2d');

            if (!ctx) {
                return {
                    error: { type: 'SystemError', code: 'CANVAS_CONTEXT_FAILED', message: 'Could not get 2D context for compositing' }
                };
            }

            // Fill with black background
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);

            // Find all visualization canvases and composite them in z-order
            const canvases = document.querySelectorAll('canvas.visualization-canvas');
            const sortedCanvases = Array.from(canvases).sort((a, b) => {
                const zA = parseInt(a.style.zIndex || '0', 10);
                const zB = parseInt(b.style.zIndex || '0', 10);
                return zA - zB;
            });

            for (const canvas of sortedCanvases) {
                if (canvas.width > 0 && canvas.height > 0) {
                    ctx.drawImage(canvas, 0, 0, width, height);
                }
            }

            // If no canvases found, try to find any canvas at all
            if (sortedCanvases.length === 0) {
                const anyCanvas = document.querySelector('canvas');
                if (anyCanvas && anyCanvas.width > 0) {
                    ctx.drawImage(anyCanvas, 0, 0, width, height);
                }
            }

            // Convert to data URL
            const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
            const dataUrl = composite.toDataURL(mimeType, quality);
            const base64 = dataUrl.split(',')[1];

            // Clean up
            composite.remove();

            return {
                format,
                width,
                height,
                mime_type: mimeType,
                data_url: dataUrl,
                base64_length: base64.length,
                canvas_count: sortedCanvases.length,
                suggested_next_actions: ['describe_visual_state', 'set_visual_parameters', 'batch_set_parameters']
            };
        } catch (err) {
            return {
                error: {
                    type: 'SystemError',
                    code: 'SCREENSHOT_FAILED',
                    message: err.message,
                    suggestion: 'Check that canvas elements exist and are rendered'
                }
            };
        }
    }

    /**
     * Map a natural-language description to VIB3+ parameters using AestheticMapper.
     */
    async designFromDescription(args) {
        const { description, apply = false } = args;

        if (!this._aestheticMapper) {
            this._aestheticMapper = new AestheticMapper();
        }

        const mapped = this._aestheticMapper.mapDescription(description);
        const resolved = this._aestheticMapper.resolveToValues(description);

        // Apply to engine if requested
        if (apply && this.engine) {
            if (resolved.system) {
                await this.engine.switchSystem(resolved.system);
            }
            if (resolved.geometry !== undefined) {
                this.engine.setParameter('geometry', resolved.geometry);
            }
            for (const [param, value] of Object.entries(resolved.params)) {
                this.engine.setParameter(param, value);
            }
        }

        return {
            description,
            applied: apply,
            matched_words: mapped.matched_words,
            total_words: mapped.total_words,
            resolved: {
                system: resolved.system,
                geometry: resolved.geometry,
                params: resolved.params,
                color_preset: resolved.color_preset,
                post_processing: resolved.post_processing
            },
            parameter_ranges: mapped.params,
            suggested_next_actions: apply
                ? ['describe_visual_state', 'capture_screenshot', 'create_timeline']
                : ['design_from_description', 'batch_set_parameters']
        };
    }

    /**
     * Return the full aesthetic vocabulary by category.
     */
    getAestheticVocabulary() {
        if (!this._aestheticMapper) {
            this._aestheticMapper = new AestheticMapper();
        }

        return {
            vocabulary: this._aestheticMapper.getVocabularyByCategory(),
            all_words: this._aestheticMapper.getVocabulary(),
            word_count: this._aestheticMapper.getVocabulary().length,
            usage: 'Pass space-separated words to design_from_description. Example: "serene ocean deep minimal"',
            suggested_next_actions: ['design_from_description']
        };
    }

    /**
     * Load and play a choreography.
     */
    async playChoreographyTool(args) {
        const { choreography, choreography_id, action = 'play', seek_percent, loop = false } = args;

        // Resolve choreography spec
        let spec = choreography;
        if (!spec && choreography_id && this._choreographies) {
            spec = this._choreographies.get(choreography_id);
        }

        if (!spec && action === 'play') {
            return {
                error: {
                    type: 'ValidationError',
                    code: 'NO_CHOREOGRAPHY',
                    message: 'Provide a choreography spec or a valid choreography_id',
                    suggestion: 'Use create_choreography first, then pass the result here'
                }
            };
        }

        // Create or reuse player
        if (!this._choreographyPlayer && this.engine) {
            this._choreographyPlayer = new ChoreographyPlayer(this.engine, {
                onSceneChange: (index, scene) => {
                    telemetry.recordEvent(EventType.PARAMETER_CHANGE, {
                        type: 'choreography_scene',
                        scene_index: index,
                        system: scene.system
                    });
                }
            });
        }

        if (!this._choreographyPlayer) {
            return {
                error: {
                    type: 'SystemError',
                    code: 'NO_ENGINE',
                    message: 'Engine not initialized — cannot play choreography',
                    suggestion: 'Initialize the VIB3Engine first'
                }
            };
        }

        const player = this._choreographyPlayer;

        switch (action) {
            case 'play':
                if (spec) {
                    player.load(spec);
                    player.loopMode = loop ? 'loop' : 'once';
                }
                player.play();
                break;
            case 'pause':
                player.pause();
                break;
            case 'stop':
                player.stop();
                break;
            case 'seek':
                if (seek_percent !== undefined) {
                    player.seekToPercent(seek_percent);
                }
                break;
        }

        return {
            action,
            state: player.getState(),
            suggested_next_actions: action === 'play'
                ? ['play_choreography', 'capture_screenshot', 'describe_visual_state']
                : ['play_choreography']
        };
    }

    /**
     * Control a previously created timeline.
     */
    controlTimeline(args) {
        const { timeline_id, action, seek_percent, speed } = args;

        if (!this._liveTimelines) this._liveTimelines = new Map();

        let tl = this._liveTimelines.get(timeline_id);

        // If timeline not live yet, try to create it from stored data
        if (!tl && this._timelines && this._timelines.has(timeline_id) && this.engine) {
            const data = this._timelines.get(timeline_id);

            tl = new ParameterTimeline(
                (name, value) => this.engine.setParameter(name, value)
            );

            // Build import-compatible format
            const importData = {
                type: 'vib3-parameter-timeline',
                version: '1.0.0',
                duration: data.duration,
                loopMode: data.loopMode || 'once',
                bpm: data.bpm || 120,
                tracks: {}
            };

            for (const [param, keyframes] of Object.entries(data.tracks)) {
                importData.tracks[param] = {
                    enabled: true,
                    keyframes: keyframes.map(kf => ({
                        time: kf.time,
                        value: kf.value,
                        easing: kf.easing || 'easeInOut'
                    }))
                };
            }

            tl.importTimeline(importData);
            this._liveTimelines.set(timeline_id, tl);
        }

        if (!tl) {
            return {
                error: {
                    type: 'ValidationError',
                    code: 'TIMELINE_NOT_FOUND',
                    message: `Timeline '${timeline_id}' not found`,
                    suggestion: 'Create a timeline first with create_timeline'
                }
            };
        }

        switch (action) {
            case 'play':
                tl.play();
                break;
            case 'pause':
                tl.pause();
                break;
            case 'stop':
                tl.stop();
                break;
            case 'seek':
                if (seek_percent !== undefined) {
                    tl.seekToPercent(seek_percent);
                }
                break;
            case 'set_speed':
                if (speed !== undefined) {
                    tl.playbackSpeed = Math.max(0.1, Math.min(10, speed));
                }
                break;
        }

        return {
            timeline_id,
            action,
            playing: tl.playing,
            currentTime: tl.currentTime,
            duration: tl.duration,
            progress: tl.duration > 0 ? tl.currentTime / tl.duration : 0,
            playbackSpeed: tl.playbackSpeed,
            suggested_next_actions: ['control_timeline', 'describe_visual_state', 'capture_screenshot']
        };
    }

    // ====================================================================
    // Layer Relationship Tools (Phase 8)
    // ====================================================================

    /**
     * Get the holographic system's layer graph (if available).
     * @private
     * @returns {import('../../render/LayerRelationshipGraph.js').LayerRelationshipGraph|null}
     */
    _getLayerGraph() {
        if (!this.engine) return null;
        // Try to access the current system's layer graph
        const system = this.engine.currentSystem || this.engine._activeSystem;
        if (system && system.layerGraph) {
            return system.layerGraph;
        }
        if (system && system._layerGraph) {
            return system._layerGraph;
        }
        return null;
    }

    /**
     * Load a named layer relationship profile.
     */
    setLayerProfile(args) {
        const { profile } = args;
        const graph = this._getLayerGraph();

        if (!graph) {
            return {
                error: 'Layer relationship graph not available. Switch to holographic system first.',
                suggested_next_actions: ['switch_system']
            };
        }

        graph.loadProfile(profile);
        telemetry.recordEvent(EventType.PARAMETER_CHANGE, { type: 'layer_profile', profile });

        return {
            profile,
            keystone: graph.keystone,
            active_profile: graph.activeProfile,
            available_profiles: ['holographic', 'symmetry', 'chord', 'storm', 'legacy'],
            suggested_next_actions: ['get_layer_config', 'set_layer_relationship', 'tune_layer_relationship']
        };
    }

    /**
     * Set relationship for a specific layer.
     */
    setLayerRelationship(args) {
        const { layer, relationship, config } = args;
        const graph = this._getLayerGraph();

        if (!graph) {
            return {
                error: 'Layer relationship graph not available. Switch to holographic system first.',
                suggested_next_actions: ['switch_system']
            };
        }

        if (config) {
            graph.setRelationship(layer, { preset: relationship, config });
        } else {
            graph.setRelationship(layer, relationship);
        }

        telemetry.recordEvent(EventType.PARAMETER_CHANGE, {
            type: 'layer_relationship', layer, relationship
        });

        return {
            layer,
            relationship,
            config: config || {},
            keystone: graph.keystone,
            suggested_next_actions: ['get_layer_config', 'tune_layer_relationship', 'describe_visual_state']
        };
    }

    /**
     * Change the keystone (driver) layer.
     */
    setLayerKeystone(args) {
        const { layer } = args;
        const graph = this._getLayerGraph();

        if (!graph) {
            return {
                error: 'Layer relationship graph not available. Switch to holographic system first.',
                suggested_next_actions: ['switch_system']
            };
        }

        graph.setKeystone(layer);
        telemetry.recordEvent(EventType.PARAMETER_CHANGE, { type: 'layer_keystone', layer });

        return {
            keystone: layer,
            note: 'Other layers\' relationships are preserved. Set new relationships for the old keystone if needed.',
            suggested_next_actions: ['set_layer_relationship', 'get_layer_config']
        };
    }

    /**
     * Get current layer configuration.
     */
    getLayerConfig() {
        const graph = this._getLayerGraph();

        if (!graph) {
            return {
                error: 'Layer relationship graph not available. Switch to holographic system first.',
                suggested_next_actions: ['switch_system']
            };
        }

        const config = graph.exportConfig();

        return {
            keystone: config.keystone,
            active_profile: config.profile,
            relationships: config.relationships,
            shaders: config.shaders,
            available_profiles: ['holographic', 'symmetry', 'chord', 'storm', 'legacy'],
            available_presets: ['echo', 'mirror', 'complement', 'harmonic', 'reactive', 'chase'],
            suggested_next_actions: ['set_layer_profile', 'set_layer_relationship', 'tune_layer_relationship']
        };
    }

    /**
     * Tune a layer's relationship config.
     */
    tuneLayerRelationship(args) {
        const { layer, config: configOverrides } = args;
        const graph = this._getLayerGraph();

        if (!graph) {
            return {
                error: 'Layer relationship graph not available. Switch to holographic system first.',
                suggested_next_actions: ['switch_system']
            };
        }

        const graphConfig = graph.exportConfig();
        const currentRel = graphConfig.relationships[layer];

        if (!currentRel || !currentRel.preset) {
            return {
                error: `Layer "${layer}" has no tunable preset relationship. Set one first with set_layer_relationship.`,
                suggested_next_actions: ['set_layer_relationship']
            };
        }

        const factory = PRESET_REGISTRY[currentRel.preset];
        if (!factory) {
            return {
                error: `Unknown preset "${currentRel.preset}" on layer "${layer}".`,
                suggested_next_actions: ['set_layer_relationship']
            };
        }

        const newConfig = { ...(currentRel.config || {}), ...configOverrides };
        graph.setRelationship(layer, { preset: currentRel.preset, config: newConfig });

        telemetry.recordEvent(EventType.PARAMETER_CHANGE, {
            type: 'layer_tune', layer, tuned_keys: Object.keys(configOverrides)
        });

        return {
            layer,
            preset: currentRel.preset,
            previous_config: currentRel.config,
            new_config: newConfig,
            suggested_next_actions: ['get_layer_config', 'describe_visual_state', 'capture_screenshot']
        };
    }
}

// Singleton instance
export const mcpServer = new MCPServer();
export default mcpServer;
