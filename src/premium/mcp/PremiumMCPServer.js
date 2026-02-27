/**
 * PremiumMCPServer — Premium Module 8
 * Wraps the free SDK's MCPServer, adding premium tool handling with license validation.
 *
 * @module @vib3code/premium/mcp/PremiumMCPServer
 */

import { premiumToolDefinitions } from './premium-tools.js';

const PREMIUM_TOOL_NAMES = new Set(Object.keys(premiumToolDefinitions));

export class PremiumMCPServer {
    /**
     * @param {object} premium - The premium context from enablePremium()
     * @param {object} [baseMCPServer] - The free SDK's MCPServer instance (optional)
     */
    constructor(premium, baseMCPServer) {
        this._premium = premium;
        this._baseMCP = baseMCPServer;
    }

    /**
     * Get all premium tool definitions (for MCP tool listing).
     * @returns {object[]}
     */
    getToolDefinitions() {
        return Object.values(premiumToolDefinitions);
    }

    /**
     * Get combined tool definitions (free + premium).
     * @returns {object[]}
     */
    getAllToolDefinitions() {
        const freeTools = this._baseMCP?.getToolDefinitions?.() || [];
        return [...freeTools, ...this.getToolDefinitions()];
    }

    /**
     * Check if a tool name is a premium tool.
     * @param {string} toolName
     * @returns {boolean}
     */
    isPremiumTool(toolName) {
        return PREMIUM_TOOL_NAMES.has(toolName);
    }

    /**
     * Handle a premium tool call.
     * @param {string} toolName
     * @param {object} args
     * @returns {Promise<object>}
     */
    async handleToolCall(toolName, args = {}) {
        if (!PREMIUM_TOOL_NAMES.has(toolName)) {
            // Delegate to base MCP server for free tools
            if (this._baseMCP) {
                return this._baseMCP.handleToolCall(toolName, args);
            }
            return this._error(toolName, `Unknown tool: ${toolName}`);
        }

        // License check
        if (!this._premium || !this._premium.isLicensed()) {
            return {
                content: [{ type: 'text', text: `Tool "${toolName}" requires @vib3code/premium license.` }],
                isError: true
            };
        }

        const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

        try {
            let result;
            switch (toolName) {
                case 'set_shader_parameter':
                    result = this._handleSetShaderParameter(args);
                    break;
                case 'set_rotation_lock':
                    result = this._handleSetRotationLock(args);
                    break;
                case 'set_layer_geometry':
                    result = this._handleSetLayerGeometry(args);
                    break;
                case 'add_visual_trigger':
                    result = this._handleAddVisualTrigger(args);
                    break;
                case 'remove_visual_trigger':
                    result = this._handleRemoveVisualTrigger(args);
                    break;
                case 'list_visual_triggers':
                    result = this._handleListVisualTriggers();
                    break;
                case 'configure_css_bridge':
                    result = this._handleConfigureCSSBridge(args);
                    break;
                case 'create_premium_choreography':
                    result = this._handleCreatePremiumChoreography(args);
                    break;
                default:
                    return this._error(toolName, `Unhandled premium tool: ${toolName}`);
            }

            const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime;
            return this._success(toolName, result, duration);

        } catch (error) {
            const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime;
            return this._error(toolName, error.message, duration);
        }
    }

    // ─── Tool Handlers ───

    _handleSetShaderParameter(args) {
        const surface = this._premium.shaderSurface;
        surface.setParameters(args);
        return { parameters: surface.getAllParameters() };
    }

    _handleSetRotationLock(args) {
        const lock = this._premium.rotationLock;

        if (args.flightMode !== undefined) {
            lock.setFlightMode(args.flightMode);
            return { flightMode: args.flightMode, lockedAxes: lock.getLockedAxes() };
        }

        if (args.axes && args.locked !== undefined) {
            for (let i = 0; i < args.axes.length; i++) {
                const axis = args.axes[i];
                if (args.locked) {
                    const value = args.values?.[i];
                    lock.lockAxis(axis, value);
                } else {
                    lock.unlockAxis(axis);
                }
            }
        }

        return { lockedAxes: lock.getLockedAxes(), flightMode: lock.isFlightMode() };
    }

    _handleSetLayerGeometry(args) {
        const mixer = this._premium.layerGeometry;

        if (args.layer) {
            if (args.geometry !== undefined) {
                mixer.setLayerGeometry(args.layer, args.geometry);
            } else if (args.offset !== undefined) {
                mixer.setGeometryOffset(args.layer, args.offset);
            }
        }

        return { layerGeometries: mixer.getLayerGeometries() };
    }

    _handleAddVisualTrigger(args) {
        const events = this._premium.events;
        const { id, ...config } = args;
        events.addTrigger(id, config);
        return { id, added: true, totalTriggers: events.listTriggers().length };
    }

    _handleRemoveVisualTrigger(args) {
        this._premium.events.removeTrigger(args.id);
        return { id: args.id, removed: true };
    }

    _handleListVisualTriggers() {
        return { triggers: this._premium.events.listTriggers() };
    }

    _handleConfigureCSSBridge(args) {
        const bridge = this._premium.cssBridge;

        if (args.enabled === false) {
            bridge.stop();
            return { active: false };
        }

        if (args.enabled === true || Object.keys(args).length > 0) {
            bridge.start({
                outbound: args.outbound,
                inbound: args.inbound,
                parameters: args.parameters,
                inboundParameters: args.inboundParameters,
                throttle: args.throttle,
                normalize: args.normalize
            });
            return { active: true, options: bridge.getOptions() };
        }

        return { active: bridge.isActive() };
    }

    _handleCreatePremiumChoreography(args) {
        const ext = this._premium.choreography;
        const validated = ext.createExtendedChoreography(args);
        return {
            validated: true,
            scenes: validated.scenes.length,
            premiumFeatures: {
                layerProfiles: validated.scenes.filter(s => s.layer_profile).length,
                layerOverrides: validated.scenes.filter(s => s.layer_overrides).length,
                triggers: validated.scenes.reduce((n, s) => n + (s.triggers?.length || 0), 0),
                rotationLocks: validated.scenes.filter(s => s.rotation_locks).length
            }
        };
    }

    // ─── Response Builders ───

    _success(operation, data, duration) {
        return {
            success: true,
            operation,
            premium: true,
            timestamp: new Date().toISOString(),
            duration_ms: Math.round((duration || 0) * 100) / 100,
            ...data
        };
    }

    _error(operation, message, duration) {
        return {
            success: false,
            operation,
            premium: true,
            error: { message, type: 'PremiumToolError' },
            timestamp: new Date().toISOString(),
            duration_ms: Math.round((duration || 0) * 100) / 100,
        };
    }

    destroy() {
        this._premium = null;
        this._baseMCP = null;
    }
}
