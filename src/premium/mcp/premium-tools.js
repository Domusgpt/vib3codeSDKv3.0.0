/**
 * Premium MCP Tool Definitions
 * 8 premium tools extending the free SDK's 36 tools.
 */

export const premiumToolDefinitions = {
    set_shader_parameter: {
        name: 'set_shader_parameter',
        description: 'Set fine-grained shader parameters including projection type, UV scale, line thickness, noise frequencies, breath strength, auto-rotation speed, particle size, and per-layer alpha (premium)',
        inputSchema: {
            type: 'object',
            properties: {
                projectionType: { type: 'integer', minimum: 0, maximum: 2, description: '0=perspective, 1=stereographic, 2=orthographic' },
                uvScale: { type: 'number', minimum: 1.0, maximum: 8.0, description: 'UV space zoom (default 3.0)' },
                lineThickness: { type: 'number', minimum: 0.005, maximum: 0.15, description: 'Wireframe line thickness' },
                noiseFrequency: { type: 'array', items: { type: 'number', minimum: 1, maximum: 50 }, minItems: 3, maxItems: 3, description: 'Chaos noise freq triple [x,y,z]' },
                breathStrength: { type: 'number', minimum: 0, maximum: 1, description: 'Breath modulation strength' },
                autoRotationSpeed: { type: 'array', items: { type: 'number', minimum: 0, maximum: 0.5 }, minItems: 6, maxItems: 6, description: 'Auto-rotation [XY,XZ,YZ,XW,YW,ZW]' },
                particleSize: { type: 'number', minimum: 0.02, maximum: 0.5, description: 'Quantum particle dot size' },
                layerAlpha: { type: 'object', description: 'Per-layer alpha {background,shadow,content,highlight,accent}' }
            }
        }
    },

    set_rotation_lock: {
        name: 'set_rotation_lock',
        description: 'Lock or unlock rotation axes. Use flight mode to lock 3D rotations while 4D rotates freely (premium)',
        inputSchema: {
            type: 'object',
            properties: {
                axes: { type: 'array', items: { type: 'string', enum: ['rot4dXY', 'rot4dXZ', 'rot4dYZ', 'rot4dXW', 'rot4dYW', 'rot4dZW'] }, description: 'Axes to lock/unlock' },
                locked: { type: 'boolean', description: 'true to lock, false to unlock' },
                values: { type: 'array', items: { type: 'number' }, description: 'Lock values (parallels axes array)' },
                flightMode: { type: 'boolean', description: 'Lock 3D, free 4D for portal effects' }
            }
        }
    },

    set_layer_geometry: {
        name: 'set_layer_geometry',
        description: 'Set geometry per layer. Each layer can render a different geometry variant (premium)',
        inputSchema: {
            type: 'object',
            properties: {
                layer: { type: 'string', enum: ['background', 'shadow', 'content', 'highlight', 'accent'], description: 'Target layer' },
                geometry: { type: 'integer', minimum: 0, maximum: 23, description: 'Explicit geometry index' },
                offset: { type: 'integer', minimum: -23, maximum: 23, description: 'Offset from keystone geometry' }
            }
        }
    },

    add_visual_trigger: {
        name: 'add_visual_trigger',
        description: 'Add a threshold-based event trigger. When a source crosses a threshold, an action fires (premium)',
        inputSchema: {
            type: 'object',
            required: ['id', 'source', 'condition', 'threshold', 'action'],
            properties: {
                id: { type: 'string', description: 'Unique trigger identifier' },
                source: { type: 'string', description: 'parameter.name, audio.band, or custom.event' },
                condition: { type: 'string', enum: ['exceeds', 'drops_below', 'crosses', 'equals'] },
                threshold: { type: 'number' },
                cooldown: { type: 'number', description: 'ms before re-trigger (default 1000)' },
                action: {
                    type: 'object',
                    required: ['type'],
                    properties: {
                        type: { type: 'string', enum: ['layer_profile', 'color_preset', 'set_parameters', 'transition', 'custom'] },
                        value: { description: 'Action value (profile name, preset name, params object)' },
                        duration: { type: 'number', description: 'ms to hold action state' },
                        revertTo: { description: 'State to revert to after duration' },
                        easing: { type: 'string' },
                        transition: { type: 'boolean' }
                    }
                }
            }
        }
    },

    remove_visual_trigger: {
        name: 'remove_visual_trigger',
        description: 'Remove a visual event trigger by ID (premium)',
        inputSchema: {
            type: 'object',
            required: ['id'],
            properties: {
                id: { type: 'string' }
            }
        }
    },

    list_visual_triggers: {
        name: 'list_visual_triggers',
        description: 'List all active visual event triggers (premium)',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    },

    configure_css_bridge: {
        name: 'configure_css_bridge',
        description: 'Configure live CSS custom property binding between VIB3+ and the DOM (premium)',
        inputSchema: {
            type: 'object',
            properties: {
                enabled: { type: 'boolean', description: 'Start or stop the bridge' },
                outbound: { type: 'boolean', description: 'Engine → CSS (default true)' },
                inbound: { type: 'boolean', description: 'CSS → Engine (default false)' },
                parameters: { type: 'array', items: { type: 'string' }, description: 'Params to bridge (default all)' },
                inboundParameters: { type: 'array', items: { type: 'string' }, description: 'CSS vars to watch inbound' },
                throttle: { type: 'number', description: 'ms throttle (default 16)' },
                normalize: { type: 'boolean', description: 'Normalize to 0-1 (default true)' }
            }
        }
    },

    create_premium_choreography: {
        name: 'create_premium_choreography',
        description: 'Create choreography with layer profiles, overrides, triggers, and rotation locks per scene (premium)',
        inputSchema: {
            type: 'object',
            required: ['scenes'],
            properties: {
                name: { type: 'string' },
                bpm: { type: 'number' },
                mode: { type: 'string', enum: ['once', 'loop'] },
                scenes: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            system: { type: 'string' },
                            geometry: { type: 'integer' },
                            duration: { type: 'number' },
                            transition_in: { type: 'object' },
                            tracks: { type: 'object' },
                            color_preset: { type: 'string' },
                            layer_profile: { type: 'string', description: 'Premium: layer relationship profile' },
                            layer_overrides: { type: 'object', description: 'Premium: per-layer relationship overrides' },
                            triggers: { type: 'array', description: 'Premium: scene-scoped event triggers' },
                            rotation_locks: { type: 'object', description: 'Premium: locked rotation axes' },
                            layer_geometries: { type: 'object', description: 'Premium: per-layer geometry indices' }
                        }
                    }
                }
            }
        }
    }
};
