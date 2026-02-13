/**
 * VIB3+ MCP Tool Definitions
 * Workflow-oriented tools for agentic API consumption
 */

import { schemaRegistry } from '../../schemas/index.js';

/**
 * Tool definitions following MCP specification
 * Granularity matches workflows, not individual API endpoints
 */
export const toolDefinitions = {
    // Scene Management
    create_4d_visualization: {
        name: 'create_4d_visualization',
        description: 'Creates a complete 4D visualization scene with specified geometry and projection. Returns scene ID and metadata for subsequent operations.',
        inputSchema: {
            type: 'object',
            properties: {
                system: {
                    type: 'string',
                    enum: ['quantum', 'faceted', 'holographic'],
                    description: 'Visualization system to use'
                },
                geometry_index: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 23,
                    description: 'Geometry index: 0-7 base, 8-15 hypersphere core, 16-23 hypertetrahedron core'
                },
                projection: {
                    type: 'string',
                    enum: ['perspective', 'stereographic', 'orthographic'],
                    default: 'perspective',
                    description: 'Projection method for 4D to 3D mapping'
                }
            },
            required: ['system']
        }
    },

    set_rotation: {
        name: 'set_rotation',
        description: 'Sets 6D rotation angles across all six rotation planes. XY/XZ/YZ are 3D rotations, XW/YW/ZW are 4D hyperspace rotations that create inside-out effects.',
        inputSchema: {
            type: 'object',
            properties: {
                XY: { type: 'number', minimum: -6.28, maximum: 6.28, description: 'X-Y plane rotation (radians)' },
                XZ: { type: 'number', minimum: -6.28, maximum: 6.28, description: 'X-Z plane rotation (radians)' },
                YZ: { type: 'number', minimum: -6.28, maximum: 6.28, description: 'Y-Z plane rotation (radians)' },
                XW: { type: 'number', minimum: -6.28, maximum: 6.28, description: 'X-W hyperplane rotation (radians)' },
                YW: { type: 'number', minimum: -6.28, maximum: 6.28, description: 'Y-W hyperplane rotation (radians)' },
                ZW: { type: 'number', minimum: -6.28, maximum: 6.28, description: 'Z-W hyperplane rotation (radians)' }
            }
        }
    },

    set_visual_parameters: {
        name: 'set_visual_parameters',
        description: 'Adjusts visual rendering parameters like color, speed, chaos, and morphing. Returns updated state.',
        inputSchema: {
            type: 'object',
            properties: {
                hue: { type: 'integer', minimum: 0, maximum: 360, description: 'Base color hue in degrees' },
                saturation: { type: 'number', minimum: 0, maximum: 1, description: 'Color saturation' },
                intensity: { type: 'number', minimum: 0, maximum: 1, description: 'Brightness/intensity' },
                speed: { type: 'number', minimum: 0.1, maximum: 3, description: 'Animation speed multiplier' },
                chaos: { type: 'number', minimum: 0, maximum: 1, description: 'Randomization/turbulence' },
                morphFactor: { type: 'number', minimum: 0, maximum: 2, description: 'Shape transformation factor' },
                gridDensity: { type: 'number', minimum: 4, maximum: 100, description: 'Geometric detail level' },
                dimension: { type: 'number', minimum: 3.0, maximum: 4.5, description: 'Dimensional interpolation' }
            }
        }
    },

    switch_system: {
        name: 'switch_system',
        description: 'Switches between visualization systems (quantum, faceted, holographic). Destroys old system and creates new one.',
        inputSchema: {
            type: 'object',
            properties: {
                system: {
                    type: 'string',
                    enum: ['quantum', 'faceted', 'holographic'],
                    description: 'Target visualization system'
                }
            },
            required: ['system']
        }
    },

    change_geometry: {
        name: 'change_geometry',
        description: 'Changes the active geometry type. Supports 24 geometries: 8 base types x 3 core modes (base, hypersphere, hypertetrahedron).',
        inputSchema: {
            type: 'object',
            properties: {
                geometry_index: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 23,
                    description: 'Geometry index (0-7: base, 8-15: hypersphere core, 16-23: hypertetrahedron core)'
                },
                base_type: {
                    type: 'string',
                    enum: ['tetrahedron', 'hypercube', 'sphere', 'torus', 'klein_bottle', 'fractal', 'wave', 'crystal'],
                    description: 'Alternative: specify base geometry by name'
                },
                core_type: {
                    type: 'string',
                    enum: ['base', 'hypersphere', 'hypertetrahedron'],
                    default: 'base',
                    description: 'Core transformation to apply'
                }
            }
        }
    },

    get_state: {
        name: 'get_state',
        description: 'Returns complete current state including system, geometry, all parameters, and render info.',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    },

    randomize_parameters: {
        name: 'randomize_parameters',
        description: 'Randomizes all parameters for creative exploration. Returns new state.',
        inputSchema: {
            type: 'object',
            properties: {
                preserve_system: {
                    type: 'boolean',
                    default: true,
                    description: 'Keep current system, only randomize visual params'
                },
                preserve_geometry: {
                    type: 'boolean',
                    default: false,
                    description: 'Keep current geometry, only randomize other params'
                }
            }
        }
    },

    reset_parameters: {
        name: 'reset_parameters',
        description: 'Resets all parameters to default values.',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    },

    // Gallery Operations
    save_to_gallery: {
        name: 'save_to_gallery',
        description: 'Saves current state to a gallery slot (0-99). Slots 0-29 are defaults, 30-99 are custom.',
        inputSchema: {
            type: 'object',
            properties: {
                slot: {
                    type: 'integer',
                    minimum: 30,
                    maximum: 99,
                    description: 'Gallery slot to save to (30-99 for custom)'
                },
                name: {
                    type: 'string',
                    description: 'Optional name for the variation'
                }
            },
            required: ['slot']
        }
    },

    load_from_gallery: {
        name: 'load_from_gallery',
        description: 'Loads a saved variation from gallery slot.',
        inputSchema: {
            type: 'object',
            properties: {
                slot: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 99,
                    description: 'Gallery slot to load from'
                }
            },
            required: ['slot']
        }
    },

    // Query Tools
    search_geometries: {
        name: 'search_geometries',
        description: 'Returns list of available geometries with their properties. Use to discover geometry options.',
        inputSchema: {
            type: 'object',
            properties: {
                core_type: {
                    type: 'string',
                    enum: ['base', 'hypersphere', 'hypertetrahedron', 'all'],
                    default: 'all',
                    description: 'Filter by core type'
                }
            }
        }
    },

    get_parameter_schema: {
        name: 'get_parameter_schema',
        description: 'Returns full JSON schema for parameters with valid ranges and descriptions.',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    },

    // Onboarding Tools
    get_sdk_context: {
        name: 'get_sdk_context',
        description: 'Returns essential SDK context for agent onboarding. Call this first to understand the system.',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    },

    verify_knowledge: {
        name: 'verify_knowledge',
        description: 'Verifies agent has absorbed SDK context. Multiple choice quiz - submit letter answers (a/b/c/d).',
        inputSchema: {
            type: 'object',
            properties: {
                q1_rotation_planes: {
                    type: 'string',
                    enum: ['a', 'b', 'c', 'd'],
                    description: 'Q1: How many rotation planes? a)3 b)4 c)6 d)8'
                },
                q2_geometry_formula: {
                    type: 'string',
                    enum: ['a', 'b', 'c', 'd'],
                    description: 'Q2: Geometry encoding formula? a)base*3+core b)core*8+base c)base+core d)core*base'
                },
                q3_canvas_layers: {
                    type: 'string',
                    enum: ['a', 'b', 'c', 'd'],
                    description: 'Q3: Canvas layers per system? a)3 b)4 c)5 d)6'
                },
                q4_active_systems: {
                    type: 'string',
                    enum: ['a', 'b', 'c', 'd'],
                    description: 'Q4: Which are the 3 ACTIVE systems? a)quantum,faceted,holographic b)quantum,faceted,polychora c)faceted,holographic,polychora d)all four'
                },
                q5_base_geometries: {
                    type: 'string',
                    enum: ['a', 'b', 'c', 'd'],
                    description: 'Q5: How many base geometry types? a)6 b)8 c)10 d)24'
                },
                q6_core_types: {
                    type: 'string',
                    enum: ['a', 'b', 'c', 'd'],
                    description: 'Q6: Core warp types? a)base,sphere,cube b)base,hypersphere,hypertetrahedron c)none,partial,full d)2D,3D,4D'
                }
            },
            required: ['q1_rotation_planes', 'q2_geometry_formula', 'q3_canvas_layers']
        }
    },

    // ===== REACTIVITY TOOLS (Phase 6.5) =====

    set_reactivity_config: {
        name: 'set_reactivity_config',
        description: 'Set complete reactivity configuration for audio/tilt/interaction behavior. This controls how the visualization responds to audio input, device motion, and user interaction.',
        inputSchema: {
            type: 'object',
            properties: {
                audio: {
                    type: 'object',
                    description: 'Audio reactivity configuration',
                    properties: {
                        enabled: { type: 'boolean', description: 'Enable audio reactivity' },
                        globalSensitivity: { type: 'number', minimum: 0.1, maximum: 3.0, description: 'Overall audio sensitivity' }
                    }
                },
                tilt: {
                    type: 'object',
                    description: 'Device tilt configuration',
                    properties: {
                        enabled: { type: 'boolean', description: 'Enable tilt reactivity' },
                        sensitivity: { type: 'number', minimum: 0.1, maximum: 3.0, description: 'Tilt sensitivity' },
                        dramaticMode: { type: 'boolean', description: 'Enable dramatic (8x) mode' }
                    }
                },
                interaction: {
                    type: 'object',
                    description: 'Mouse/touch interaction configuration',
                    properties: {
                        enabled: { type: 'boolean', description: 'Enable interaction' },
                        mouseMode: { type: 'string', enum: ['rotation', 'velocity', 'shimmer', 'attract', 'repel', 'none'] },
                        clickMode: { type: 'string', enum: ['burst', 'blast', 'ripple', 'pulse', 'none'] },
                        scrollMode: { type: 'string', enum: ['cycle', 'wave', 'sweep', 'zoom', 'morph', 'none'] }
                    }
                }
            }
        }
    },

    get_reactivity_config: {
        name: 'get_reactivity_config',
        description: 'Get current reactivity configuration including audio, tilt, and interaction settings.',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    },

    configure_audio_band: {
        name: 'configure_audio_band',
        description: 'Configure a single audio frequency band (bass, mid, or high) with target parameter mappings.',
        inputSchema: {
            type: 'object',
            properties: {
                band: {
                    type: 'string',
                    enum: ['bass', 'mid', 'high'],
                    description: 'Frequency band to configure'
                },
                enabled: { type: 'boolean', description: 'Enable this band' },
                sensitivity: { type: 'number', minimum: 0.1, maximum: 3.0, description: 'Band sensitivity' },
                targets: {
                    type: 'array',
                    description: 'Parameter targets for this band',
                    items: {
                        type: 'object',
                        properties: {
                            param: { type: 'string', description: 'Target parameter name (e.g., morphFactor, chaos, speed)' },
                            weight: { type: 'number', description: 'Effect weight/strength' },
                            mode: { type: 'string', enum: ['add', 'multiply', 'replace', 'max', 'min'], default: 'add' }
                        }
                    }
                }
            },
            required: ['band']
        }
    },

    // ===== EXPORT TOOLS (Phase 6.5) =====

    export_package: {
        name: 'export_package',
        description: 'Export complete VIB3Package with visual state, reactivity config, and embed code. The package is self-contained and portable.',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Package name' },
                description: { type: 'string', description: 'Package description' },
                includeReactivity: { type: 'boolean', default: true, description: 'Include reactivity configuration' },
                includeEmbed: { type: 'boolean', default: true, description: 'Include embed code (HTML/JS/CSS)' },
                format: {
                    type: 'string',
                    enum: ['json', 'html', 'webcomponent'],
                    default: 'json',
                    description: 'Export format'
                }
            }
        }
    },

    // ===== PRESET TOOLS (Phase 6.6) =====

    apply_behavior_preset: {
        name: 'apply_behavior_preset',
        description: 'Apply a named behavior preset that configures reactivity for common use cases.',
        inputSchema: {
            type: 'object',
            properties: {
                preset: {
                    type: 'string',
                    enum: ['ambient', 'reactive', 'immersive', 'energetic', 'calm', 'cinematic'],
                    description: 'Preset name: ambient (minimal), reactive (audio-driven), immersive (full tilt), energetic (high speed), calm (slow/smooth), cinematic (dramatic rotations)'
                }
            },
            required: ['preset']
        }
    },

    list_behavior_presets: {
        name: 'list_behavior_presets',
        description: 'List all available behavior presets with descriptions.',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    },

    // ===== AGENT-POWER TOOLS (Phase 7 — Agent Harness) =====

    describe_visual_state: {
        name: 'describe_visual_state',
        description: 'Returns a structured natural-language description of the current visualization state. Useful for multimodal agents to understand what the visualization looks like without a screenshot. Includes system, geometry, color mood, motion character, and complexity assessment.',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    },

    batch_set_parameters: {
        name: 'batch_set_parameters',
        description: 'Atomically sets multiple parameters including rotation, visual, and system in one call. Prevents intermediate render states. More efficient than calling set_rotation + set_visual_parameters separately.',
        inputSchema: {
            type: 'object',
            properties: {
                system: {
                    type: 'string',
                    enum: ['quantum', 'faceted', 'holographic'],
                    description: 'Optional: switch system first'
                },
                geometry: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 23,
                    description: 'Geometry index'
                },
                rotation: {
                    type: 'object',
                    description: '6D rotation angles (all optional)',
                    properties: {
                        XY: { type: 'number', minimum: -6.28, maximum: 6.28 },
                        XZ: { type: 'number', minimum: -6.28, maximum: 6.28 },
                        YZ: { type: 'number', minimum: -6.28, maximum: 6.28 },
                        XW: { type: 'number', minimum: -6.28, maximum: 6.28 },
                        YW: { type: 'number', minimum: -6.28, maximum: 6.28 },
                        ZW: { type: 'number', minimum: -6.28, maximum: 6.28 }
                    }
                },
                visual: {
                    type: 'object',
                    description: 'Visual parameters (all optional)',
                    properties: {
                        hue: { type: 'integer', minimum: 0, maximum: 360 },
                        saturation: { type: 'number', minimum: 0, maximum: 1 },
                        intensity: { type: 'number', minimum: 0, maximum: 1 },
                        speed: { type: 'number', minimum: 0.1, maximum: 3 },
                        chaos: { type: 'number', minimum: 0, maximum: 1 },
                        morphFactor: { type: 'number', minimum: 0, maximum: 2 },
                        gridDensity: { type: 'number', minimum: 4, maximum: 100 },
                        dimension: { type: 'number', minimum: 3.0, maximum: 4.5 }
                    }
                },
                preset: {
                    type: 'string',
                    enum: ['ambient', 'reactive', 'immersive', 'energetic', 'calm', 'cinematic'],
                    description: 'Optional: apply behavior preset after setting params'
                }
            }
        }
    },

    create_timeline: {
        name: 'create_timeline',
        description: 'Creates a ParameterTimeline animation from a track specification. Supports multi-parameter keyframe animation with per-keyframe easing, BPM sync, and loop modes. Returns timeline ID for playback control.',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Timeline name' },
                duration_ms: { type: 'integer', minimum: 100, maximum: 600000, description: 'Total duration in milliseconds' },
                bpm: { type: 'number', minimum: 20, maximum: 300, description: 'Optional BPM for beat-sync quantization' },
                loop_mode: {
                    type: 'string',
                    enum: ['loop', 'bounce', 'once'],
                    default: 'once',
                    description: 'Playback loop mode'
                },
                tracks: {
                    type: 'object',
                    description: 'Parameter tracks. Each key is a parameter name, value is array of keyframes [{time, value, easing}]',
                    additionalProperties: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                time: { type: 'number', description: 'Time in ms from start' },
                                value: { type: 'number', description: 'Parameter value at this keyframe' },
                                easing: {
                                    type: 'string',
                                    enum: ['linear', 'easeIn', 'easeOut', 'easeInOut', 'quadIn', 'quadOut', 'cubicIn', 'cubicOut', 'elastic', 'bounce', 'spring', 'overshoot', 'sine', 'exponential'],
                                    default: 'easeInOut',
                                    description: 'Easing function for interpolation TO this keyframe'
                                }
                            },
                            required: ['time', 'value']
                        }
                    }
                }
            },
            required: ['duration_ms', 'tracks']
        }
    },

    play_transition: {
        name: 'play_transition',
        description: 'Plays a smooth animated transition from current parameter values to target values, or a sequence of transitions. Uses the TransitionAnimator system with configurable easing.',
        inputSchema: {
            type: 'object',
            properties: {
                sequence: {
                    type: 'array',
                    description: 'Array of transition steps. Each step smoothly animates to target params.',
                    items: {
                        type: 'object',
                        properties: {
                            params: {
                                type: 'object',
                                description: 'Target parameter values (any VIB3+ parameter)',
                                additionalProperties: { type: 'number' }
                            },
                            duration: { type: 'integer', minimum: 50, maximum: 30000, default: 1000, description: 'Step duration in ms' },
                            easing: {
                                type: 'string',
                                enum: ['linear', 'easeIn', 'easeOut', 'easeInOut', 'quadIn', 'quadOut', 'cubicIn', 'cubicOut', 'elastic', 'bounce', 'spring', 'overshoot', 'sine', 'exponential'],
                                default: 'easeInOut'
                            },
                            delay: { type: 'integer', minimum: 0, default: 0, description: 'Delay before this step starts (ms)' }
                        },
                        required: ['params']
                    }
                }
            },
            required: ['sequence']
        }
    },

    apply_color_preset: {
        name: 'apply_color_preset',
        description: 'Applies one of 22 themed color presets that set hue, saturation, intensity, and optionally post-processing to create a cohesive visual theme.',
        inputSchema: {
            type: 'object',
            properties: {
                preset: {
                    type: 'string',
                    enum: ['Ocean', 'Lava', 'Neon', 'Monochrome', 'Sunset', 'Aurora', 'Cyberpunk', 'Forest', 'Desert', 'Galaxy', 'Ice', 'Fire', 'Toxic', 'Royal', 'Pastel', 'Retro', 'Midnight', 'Tropical', 'Ethereal', 'Volcanic', 'Holographic', 'Vaporwave'],
                    description: 'Color preset name'
                }
            },
            required: ['preset']
        }
    },

    set_post_processing: {
        name: 'set_post_processing',
        description: 'Configures post-processing effects pipeline. Supports 14 composable effects and 7 preset chains. Effects are applied in order.',
        inputSchema: {
            type: 'object',
            properties: {
                effects: {
                    type: 'array',
                    description: 'Ordered list of effects to apply',
                    items: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                enum: ['bloom', 'chromaticAberration', 'vignette', 'filmGrain', 'scanlines', 'pixelate', 'blur', 'sharpen', 'colorGrade', 'noise', 'distort', 'glitch', 'rgbShift', 'feedback'],
                                description: 'Effect name'
                            },
                            intensity: { type: 'number', minimum: 0, maximum: 1, default: 0.5, description: 'Effect strength' },
                            enabled: { type: 'boolean', default: true }
                        },
                        required: ['name']
                    }
                },
                chain_preset: {
                    type: 'string',
                    description: 'Alternative: apply a named preset chain instead of individual effects'
                },
                clear_first: {
                    type: 'boolean',
                    default: true,
                    description: 'Clear existing effects before applying new ones'
                }
            }
        }
    },

    create_choreography: {
        name: 'create_choreography',
        description: 'Creates a multi-scene choreography specification with system transitions, timelines, audio config, and post-processing per scene. This is the most powerful agent tool — it allows designing complete synchronized visual performances that would be extremely difficult to create manually.',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Choreography name' },
                duration_ms: { type: 'integer', minimum: 1000, description: 'Total choreography duration' },
                bpm: { type: 'number', minimum: 20, maximum: 300, description: 'Optional BPM for beat sync' },
                scenes: {
                    type: 'array',
                    description: 'Ordered scene definitions. Each scene has a time range, system/geometry, and parameter timeline.',
                    items: {
                        type: 'object',
                        properties: {
                            time_start: { type: 'integer', minimum: 0, description: 'Scene start time (ms)' },
                            time_end: { type: 'integer', description: 'Scene end time (ms)' },
                            system: { type: 'string', enum: ['quantum', 'faceted', 'holographic'] },
                            geometry: { type: 'integer', minimum: 0, maximum: 23 },
                            transition_in: {
                                type: 'object',
                                description: 'How this scene enters (crossfade, cut, etc.)',
                                properties: {
                                    type: { type: 'string', enum: ['cut', 'crossfade', 'wipe', 'dissolve', 'zoom'] },
                                    duration: { type: 'integer', minimum: 0 }
                                }
                            },
                            tracks: {
                                type: 'object',
                                description: 'Parameter timeline tracks for this scene (same format as create_timeline)',
                                additionalProperties: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            time: { type: 'number' },
                                            value: { type: 'number' },
                                            easing: { type: 'string' }
                                        }
                                    }
                                }
                            },
                            color_preset: { type: 'string', description: 'Color preset for this scene' },
                            post_processing: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Post-processing effects active during this scene'
                            },
                            audio: {
                                type: 'object',
                                description: 'Audio reactivity config for this scene'
                            }
                        },
                        required: ['time_start', 'time_end', 'system']
                    }
                }
            },
            required: ['name', 'duration_ms', 'scenes']
        }
    },

    // ===== VISUAL FEEDBACK TOOLS (Phase 7.1 — Agent Harness) =====

    capture_screenshot: {
        name: 'capture_screenshot',
        description: 'Captures the current visualization as a base64-encoded PNG image by compositing all 5 canvas layers. Only works in browser context. Returns image data that multimodal agents can analyze for visual feedback.',
        inputSchema: {
            type: 'object',
            properties: {
                width: { type: 'integer', minimum: 64, maximum: 2048, default: 512, description: 'Output image width' },
                height: { type: 'integer', minimum: 64, maximum: 2048, default: 512, description: 'Output image height' },
                format: {
                    type: 'string',
                    enum: ['png', 'jpeg', 'webp'],
                    default: 'png',
                    description: 'Image format'
                },
                quality: { type: 'number', minimum: 0.1, maximum: 1.0, default: 0.92, description: 'JPEG/WebP quality' }
            }
        }
    },

    design_from_description: {
        name: 'design_from_description',
        description: 'Maps a natural-language aesthetic description to VIB3+ parameters. Understands emotions (serene, energetic, mysterious), styles (minimal, intricate, organic), colors (ocean, neon, cyberpunk), motion (flowing, pulsing, hypnotic), depth (deep, flat), and geometry (spherical, fractal, crystal). Combine multiple words for precise targeting.',
        inputSchema: {
            type: 'object',
            properties: {
                description: {
                    type: 'string',
                    description: 'Space-separated aesthetic descriptors. Examples: "serene ocean deep minimal", "energetic neon geometric", "mysterious galaxy intricate hypnotic"'
                },
                apply: {
                    type: 'boolean',
                    default: false,
                    description: 'If true, immediately apply the resolved parameters to the engine'
                }
            },
            required: ['description']
        }
    },

    get_aesthetic_vocabulary: {
        name: 'get_aesthetic_vocabulary',
        description: 'Returns the full vocabulary of aesthetic descriptor words organized by category (emotions, styles, colors, motion, depth, geometry). Use this to discover what descriptions the system understands.',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    },

    play_choreography: {
        name: 'play_choreography',
        description: 'Loads and plays a choreography specification on the engine. Requires a choreography spec (from create_choreography) or a stored choreography ID. Controls: play, pause, stop, seek.',
        inputSchema: {
            type: 'object',
            properties: {
                choreography: {
                    type: 'object',
                    description: 'Full choreography spec (from create_choreography output). Provide this OR choreography_id.'
                },
                choreography_id: {
                    type: 'string',
                    description: 'ID of a previously created choreography (from create_choreography)'
                },
                action: {
                    type: 'string',
                    enum: ['play', 'pause', 'stop', 'seek'],
                    default: 'play',
                    description: 'Playback action'
                },
                seek_percent: {
                    type: 'number',
                    minimum: 0,
                    maximum: 1,
                    description: 'For seek action: position as 0-1 percentage'
                },
                loop: {
                    type: 'boolean',
                    default: false,
                    description: 'Loop the choreography'
                }
            }
        }
    },

    control_timeline: {
        name: 'control_timeline',
        description: 'Controls playback of a previously created timeline (from create_timeline). Actions: play, pause, stop, seek, set_speed.',
        inputSchema: {
            type: 'object',
            properties: {
                timeline_id: {
                    type: 'string',
                    description: 'ID of the timeline to control'
                },
                action: {
                    type: 'string',
                    enum: ['play', 'pause', 'stop', 'seek', 'set_speed'],
                    description: 'Playback control action'
                },
                seek_percent: {
                    type: 'number',
                    minimum: 0,
                    maximum: 1,
                    description: 'For seek: position as 0-1 percentage'
                },
                speed: {
                    type: 'number',
                    minimum: 0.1,
                    maximum: 10,
                    description: 'For set_speed: playback speed multiplier'
                }
            },
            required: ['timeline_id', 'action']
        }
    }
};

/**
 * Get all tool definitions as array for MCP registration
 */
export function getToolList() {
    return Object.values(toolDefinitions);
}

/**
 * Get tool names only (for progressive disclosure)
 */
export function getToolNames() {
    return Object.keys(toolDefinitions);
}

/**
 * Get single tool definition by name
 */
export function getTool(name) {
    return toolDefinitions[name] || null;
}

/**
 * Validate tool input against schema
 */
export function validateToolInput(toolName, input) {
    const tool = toolDefinitions[toolName];
    if (!tool) {
        return {
            valid: false,
            error: {
                type: 'NotFoundError',
                code: 'TOOL_NOT_FOUND',
                message: `Tool '${toolName}' not found`,
                valid_options: Object.keys(toolDefinitions),
                suggestion: 'Use get_parameter_schema or search_geometries to discover available tools'
            }
        };
    }

    if (!input || typeof input !== 'object') {
        return {
            valid: false,
            error: {
                type: 'ValidationError',
                code: 'INVALID_INPUT',
                message: 'Input must be a non-null object',
                suggestion: 'Provide a valid JSON object as input'
            }
        };
    }

    // Check required fields
    const required = tool.inputSchema.required || [];
    for (const field of required) {
        if (!(field in input)) {
            return {
                valid: false,
                error: {
                    type: 'ValidationError',
                    code: 'MISSING_REQUIRED_FIELD',
                    message: `Missing required field: ${field}`,
                    parameter: field,
                    suggestion: `Provide the '${field}' parameter`
                }
            };
        }
    }

    // Reject excessively large input payloads (> 64 KB serialized)
    try {
        if (JSON.stringify(input).length > 64 * 1024) {
            return {
                valid: false,
                error: {
                    type: 'ValidationError',
                    code: 'INPUT_TOO_LARGE',
                    message: 'Input payload exceeds 64 KB size limit',
                    suggestion: 'Reduce the size of the input data'
                }
            };
        }
    } catch {
        return {
            valid: false,
            error: {
                type: 'ValidationError',
                code: 'INVALID_INPUT',
                message: 'Input is not serializable',
                suggestion: 'Provide a valid JSON object as input'
            }
        };
    }

    // Validate property types and ranges against schema
    const MAX_STRING_LENGTH = 1024;
    const properties = tool.inputSchema.properties || {};
    const errors = [];
    for (const [key, value] of Object.entries(input)) {
        const propSchema = properties[key];
        if (!propSchema) continue; // Skip unknown properties

        if (propSchema.type === 'number' || propSchema.type === 'integer') {
            const num = Number(value);
            if (!Number.isFinite(num)) {
                errors.push(`${key}: must be a finite number`);
                continue;
            }
            if (propSchema.minimum !== undefined && num < propSchema.minimum) {
                errors.push(`${key}: ${num} is below minimum ${propSchema.minimum}`);
            }
            if (propSchema.maximum !== undefined && num > propSchema.maximum) {
                errors.push(`${key}: ${num} exceeds maximum ${propSchema.maximum}`);
            }
        }
        if (propSchema.type === 'string') {
            if (typeof value !== 'string') {
                errors.push(`${key}: must be a string`);
                continue;
            }
            if (value.length > MAX_STRING_LENGTH) {
                errors.push(`${key}: string exceeds maximum length of ${MAX_STRING_LENGTH}`);
                continue;
            }
            if (propSchema.enum && !propSchema.enum.includes(value)) {
                errors.push(`${key}: '${value}' is not one of [${propSchema.enum.join(', ')}]`);
            }
        }
        if (propSchema.type === 'boolean' && typeof value !== 'boolean') {
            errors.push(`${key}: must be a boolean`);
        }
    }

    if (errors.length > 0) {
        return {
            valid: false,
            error: {
                type: 'ValidationError',
                code: 'INVALID_PARAMETERS',
                message: errors.join('; '),
                suggestion: 'Use get_parameter_schema to see valid ranges'
            }
        };
    }

    return { valid: true };
}

export default toolDefinitions;
