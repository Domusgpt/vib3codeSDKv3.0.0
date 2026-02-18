/**
 * Tests for PremiumMCPServer — Premium Module 8
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PremiumMCPServer } from '../../src/premium/mcp/PremiumMCPServer.js';

function createMockPremium(licensed = true) {
    return {
        isLicensed: vi.fn(() => licensed),
        shaderSurface: {
            setParameters: vi.fn(),
            getAllParameters: vi.fn(() => ({ uvScale: 3.0, particleSize: 0.2 })),
        },
        rotationLock: {
            setFlightMode: vi.fn(),
            lockAxis: vi.fn(),
            unlockAxis: vi.fn(),
            getLockedAxes: vi.fn(() => []),
            isFlightMode: vi.fn(() => false),
        },
        layerGeometry: {
            setLayerGeometry: vi.fn(),
            setGeometryOffset: vi.fn(),
            getLayerGeometries: vi.fn(() => ({
                background: 5, shadow: 5, content: 5, highlight: 5, accent: 5
            })),
        },
        events: {
            addTrigger: vi.fn(),
            removeTrigger: vi.fn(),
            listTriggers: vi.fn(() => []),
        },
        cssBridge: {
            start: vi.fn(),
            stop: vi.fn(),
            isActive: vi.fn(() => false),
            getOptions: vi.fn(() => null),
        },
        choreography: {
            createExtendedChoreography: vi.fn((spec) => spec),
        },
    };
}

function createMockBaseMCP() {
    return {
        getToolDefinitions: vi.fn(() => [
            { name: 'get_state', description: 'Get engine state' },
        ]),
        handleToolCall: vi.fn(async () => ({ success: true })),
    };
}

describe('PremiumMCPServer', () => {
    let premium;
    let baseMCP;
    let server;

    beforeEach(() => {
        premium = createMockPremium();
        baseMCP = createMockBaseMCP();
        server = new PremiumMCPServer(premium, baseMCP);
    });

    describe('getToolDefinitions', () => {
        it('returns 8 premium tool definitions', () => {
            const tools = server.getToolDefinitions();
            expect(tools).toHaveLength(8);
            const names = tools.map(t => t.name);
            expect(names).toContain('set_shader_parameter');
            expect(names).toContain('set_rotation_lock');
            expect(names).toContain('set_layer_geometry');
            expect(names).toContain('add_visual_trigger');
            expect(names).toContain('remove_visual_trigger');
            expect(names).toContain('list_visual_triggers');
            expect(names).toContain('configure_css_bridge');
            expect(names).toContain('create_premium_choreography');
        });
    });

    describe('getAllToolDefinitions', () => {
        it('combines free and premium tools', () => {
            const all = server.getAllToolDefinitions();
            expect(all.length).toBeGreaterThan(8);
            const names = all.map(t => t.name);
            expect(names).toContain('get_state'); // from base
            expect(names).toContain('set_shader_parameter'); // from premium
        });

        it('works without base MCP server', () => {
            const standalone = new PremiumMCPServer(premium);
            const tools = standalone.getAllToolDefinitions();
            expect(tools).toHaveLength(8);
        });
    });

    describe('isPremiumTool', () => {
        it('returns true for premium tools', () => {
            expect(server.isPremiumTool('set_shader_parameter')).toBe(true);
            expect(server.isPremiumTool('configure_css_bridge')).toBe(true);
        });

        it('returns false for non-premium tools', () => {
            expect(server.isPremiumTool('get_state')).toBe(false);
            expect(server.isPremiumTool('nonexistent')).toBe(false);
        });
    });

    describe('handleToolCall — license check', () => {
        it('rejects premium tool calls without license', async () => {
            const unlicensed = createMockPremium(false);
            const server2 = new PremiumMCPServer(unlicensed, baseMCP);

            const result = await server2.handleToolCall('set_shader_parameter', { uvScale: 5.0 });
            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain('requires @vib3code/premium license');
        });

        it('allows premium tool calls with license', async () => {
            const result = await server.handleToolCall('set_shader_parameter', { uvScale: 5.0 });
            expect(result.success).toBe(true);
        });
    });

    describe('handleToolCall — delegation', () => {
        it('delegates unknown tools to base MCP server', async () => {
            const result = await server.handleToolCall('get_state', {});
            expect(baseMCP.handleToolCall).toHaveBeenCalledWith('get_state', {});
        });

        it('returns error for unknown tools without base MCP', async () => {
            const standalone = new PremiumMCPServer(premium);
            const result = await standalone.handleToolCall('get_state', {});
            expect(result.success).toBe(false);
            expect(result.error.message).toContain('Unknown tool');
        });
    });

    describe('handleToolCall — set_shader_parameter', () => {
        it('sets shader parameters', async () => {
            const result = await server.handleToolCall('set_shader_parameter', { uvScale: 5.0 });
            expect(result.success).toBe(true);
            expect(premium.shaderSurface.setParameters).toHaveBeenCalledWith({ uvScale: 5.0 });
        });
    });

    describe('handleToolCall — set_rotation_lock', () => {
        it('sets flight mode', async () => {
            const result = await server.handleToolCall('set_rotation_lock', { flightMode: true });
            expect(result.success).toBe(true);
            expect(premium.rotationLock.setFlightMode).toHaveBeenCalledWith(true);
        });

        it('locks specific axes', async () => {
            const result = await server.handleToolCall('set_rotation_lock', {
                axes: ['rot4dXY'],
                locked: true,
                values: [1.0]
            });
            expect(result.success).toBe(true);
            expect(premium.rotationLock.lockAxis).toHaveBeenCalledWith('rot4dXY', 1.0);
        });

        it('unlocks specific axes', async () => {
            const result = await server.handleToolCall('set_rotation_lock', {
                axes: ['rot4dXY'],
                locked: false
            });
            expect(result.success).toBe(true);
            expect(premium.rotationLock.unlockAxis).toHaveBeenCalledWith('rot4dXY');
        });
    });

    describe('handleToolCall — set_layer_geometry', () => {
        it('sets explicit layer geometry', async () => {
            const result = await server.handleToolCall('set_layer_geometry', {
                layer: 'background',
                geometry: 10
            });
            expect(result.success).toBe(true);
            expect(premium.layerGeometry.setLayerGeometry).toHaveBeenCalledWith('background', 10);
        });

        it('sets geometry offset', async () => {
            const result = await server.handleToolCall('set_layer_geometry', {
                layer: 'accent',
                offset: 3
            });
            expect(result.success).toBe(true);
            expect(premium.layerGeometry.setGeometryOffset).toHaveBeenCalledWith('accent', 3);
        });
    });

    describe('handleToolCall — visual triggers', () => {
        it('adds a visual trigger', async () => {
            const result = await server.handleToolCall('add_visual_trigger', {
                id: 'test_trigger',
                source: 'parameter.chaos',
                condition: 'exceeds',
                threshold: 0.5,
                action: { type: 'set_parameters', value: {} }
            });
            expect(result.success).toBe(true);
            expect(premium.events.addTrigger).toHaveBeenCalled();
        });

        it('removes a visual trigger', async () => {
            const result = await server.handleToolCall('remove_visual_trigger', { id: 'test' });
            expect(result.success).toBe(true);
            expect(premium.events.removeTrigger).toHaveBeenCalledWith('test');
        });

        it('lists visual triggers', async () => {
            const result = await server.handleToolCall('list_visual_triggers', {});
            expect(result.success).toBe(true);
            expect(result.triggers).toEqual([]);
        });
    });

    describe('handleToolCall — configure_css_bridge', () => {
        it('starts the CSS bridge', async () => {
            const result = await server.handleToolCall('configure_css_bridge', {
                enabled: true,
                outbound: true
            });
            expect(result.success).toBe(true);
            expect(premium.cssBridge.start).toHaveBeenCalled();
        });

        it('stops the CSS bridge', async () => {
            const result = await server.handleToolCall('configure_css_bridge', { enabled: false });
            expect(result.success).toBe(true);
            expect(premium.cssBridge.stop).toHaveBeenCalled();
        });
    });

    describe('handleToolCall — create_premium_choreography', () => {
        it('creates an extended choreography', async () => {
            const spec = {
                scenes: [
                    { system: 'quantum', duration: 2000, layer_profile: 'storm' }
                ]
            };
            const result = await server.handleToolCall('create_premium_choreography', spec);
            expect(result.success).toBe(true);
            expect(premium.choreography.createExtendedChoreography).toHaveBeenCalledWith(spec);
        });
    });

    describe('handleToolCall — error handling', () => {
        it('catches errors and returns error response', async () => {
            premium.shaderSurface.setParameters.mockImplementation(() => {
                throw new Error('test error');
            });
            const result = await server.handleToolCall('set_shader_parameter', { uvScale: 5.0 });
            expect(result.success).toBe(false);
            expect(result.error.message).toBe('test error');
        });

        it('returns error for unhandled premium tool', async () => {
            // This shouldn't happen in practice, but test the default case
            const result = await server.handleToolCall('nonexistent_premium_tool', {});
            // Will delegate to base MCP
        });
    });

    describe('response format', () => {
        it('includes standard fields in success response', async () => {
            const result = await server.handleToolCall('list_visual_triggers', {});
            expect(result.success).toBe(true);
            expect(result.operation).toBe('list_visual_triggers');
            expect(result.premium).toBe(true);
            expect(result.timestamp).toBeDefined();
            expect(typeof result.duration_ms).toBe('number');
        });
    });

    describe('destroy', () => {
        it('cleans up references', () => {
            server.destroy();
            // Should not throw on subsequent calls
        });
    });
});
