import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MCPServer } from '../../src/agent/mcp/MCPServer.js';

// ── Mock engine factory ──
function createMockEngine() {
    const engine = {
        parameters: { hue: 200, speed: 1.0, chaos: 0, intensity: 0.5, geometry: 0 },
        currentSystemName: 'quantum',
        setParameter: vi.fn(function (name, value) {
            engine.parameters[name] = value;
        }),
        getParameter: vi.fn(function (name) {
            return engine.parameters[name] ?? 0;
        }),
        getAllParameters: vi.fn(function () {
            return { ...engine.parameters };
        }),
        switchSystem: vi.fn(async function (system) {
            engine.currentSystemName = system;
        }),
        getCurrentSystem: vi.fn(function () {
            return engine.currentSystemName;
        })
    };
    return engine;
}

describe('MCPServer — Phase 7.1 Harness Tools', () => {
    let server;
    let engine;

    beforeEach(() => {
        engine = createMockEngine();
        server = new MCPServer(engine);
    });

    // ─────────────────────────────────────────────────────────────
    // design_from_description
    // ─────────────────────────────────────────────────────────────
    describe('designFromDescription', () => {
        it('maps a description to parameters without applying', async () => {
            const result = await server.designFromDescription({
                description: 'serene ocean deep',
                apply: false
            });
            expect(result.description).toBe('serene ocean deep');
            expect(result.applied).toBe(false);
            expect(result.matched_words).toBeGreaterThan(0);
            expect(result.resolved).toBeDefined();
            expect(result.resolved.system).toBeDefined();
            expect(result.resolved.params).toBeDefined();
        });

        it('applies parameters to engine when apply=true', async () => {
            const result = await server.designFromDescription({
                description: 'energetic neon',
                apply: true
            });
            expect(result.applied).toBe(true);
            expect(engine.setParameter).toHaveBeenCalled();
        });

        it('switches system when apply=true', async () => {
            await server.designFromDescription({
                description: 'energetic neon',
                apply: true
            });
            expect(engine.switchSystem).toHaveBeenCalled();
        });

        it('lazily creates aesthetic mapper', async () => {
            expect(server._aestheticMapper).toBeUndefined();
            await server.designFromDescription({ description: 'calm' });
            expect(server._aestheticMapper).toBeDefined();
        });

        it('reuses aesthetic mapper on subsequent calls', async () => {
            await server.designFromDescription({ description: 'calm' });
            const mapper = server._aestheticMapper;
            await server.designFromDescription({ description: 'energetic' });
            expect(server._aestheticMapper).toBe(mapper);
        });

        it('returns parameter_ranges in addition to resolved values', async () => {
            const result = await server.designFromDescription({
                description: 'ocean deep',
                apply: false
            });
            expect(result.parameter_ranges).toBeDefined();
            expect(result.resolved.params).toBeDefined();
        });
    });

    // ─────────────────────────────────────────────────────────────
    // getAestheticVocabulary
    // ─────────────────────────────────────────────────────────────
    describe('getAestheticVocabulary', () => {
        it('returns vocabulary by category', () => {
            const result = server.getAestheticVocabulary();
            expect(result.vocabulary).toBeDefined();
            expect(result.vocabulary.emotions).toBeDefined();
            expect(result.vocabulary.styles).toBeDefined();
        });

        it('returns all words as flat list', () => {
            const result = server.getAestheticVocabulary();
            expect(Array.isArray(result.all_words)).toBe(true);
            expect(result.all_words.length).toBeGreaterThan(50);
        });

        it('returns word count', () => {
            const result = server.getAestheticVocabulary();
            expect(result.word_count).toBe(result.all_words.length);
        });

        it('includes usage instructions', () => {
            const result = server.getAestheticVocabulary();
            expect(result.usage).toContain('design_from_description');
        });
    });

    // ─────────────────────────────────────────────────────────────
    // captureScreenshot (Node.js — should return environment error)
    // ─────────────────────────────────────────────────────────────
    describe('captureScreenshot', () => {
        it('returns an error in test environment (no real canvas)', async () => {
            const result = await server.captureScreenshot({});
            expect(result.error).toBeDefined();
            // happy-dom provides `document` but canvas 2D context returns null,
            // so we get CANVAS_CONTEXT_FAILED rather than NO_BROWSER_CONTEXT
            expect(['NO_BROWSER_CONTEXT', 'CANVAS_CONTEXT_FAILED']).toContain(result.error.code);
        });

        it('accepts width/height/format/quality args without crashing', async () => {
            const result = await server.captureScreenshot({
                width: 1024,
                height: 768,
                format: 'jpeg',
                quality: 0.8
            });
            // Returns an error in test env, but args are accepted
            expect(result.error).toBeDefined();
            expect(['NO_BROWSER_CONTEXT', 'CANVAS_CONTEXT_FAILED']).toContain(result.error.code);
        });
    });

    // ─────────────────────────────────────────────────────────────
    // createChoreography + playChoreographyTool
    // ─────────────────────────────────────────────────────────────
    describe('createChoreography', () => {
        it('creates a choreography spec', () => {
            const result = server.createChoreography({
                name: 'Test Show',
                duration_ms: 10000,
                scenes: [
                    { time_start: 0, time_end: 5000, system: 'quantum', geometry: 0 },
                    { time_start: 5000, time_end: 10000, system: 'holographic', geometry: 5 }
                ]
            });
            expect(result.choreography_id).toBeDefined();
            expect(result.name).toBe('Test Show');
            expect(result.scene_count).toBe(2);
            expect(result.choreography_json).toBeDefined();
        });

        it('stores choreography for later retrieval', () => {
            const result = server.createChoreography({
                name: 'Stored',
                duration_ms: 5000,
                scenes: [{ time_start: 0, time_end: 5000, system: 'quantum' }]
            });
            expect(server._choreographies).toBeDefined();
            expect(server._choreographies.has(result.choreography_id)).toBe(true);
        });
    });

    describe('playChoreographyTool', () => {
        it('plays a choreography by spec', async () => {
            const spec = {
                id: 'test_play',
                name: 'Play Test',
                duration_ms: 5000,
                scenes: [{ time_start: 0, time_end: 5000, system: 'quantum', geometry: 0 }]
            };
            const result = await server.playChoreographyTool({
                choreography: spec,
                action: 'play'
            });
            expect(result.action).toBe('play');
            expect(result.state).toBeDefined();
        });

        it('plays a choreography by ID', async () => {
            const created = server.createChoreography({
                name: 'ID Test',
                duration_ms: 5000,
                scenes: [{ time_start: 0, time_end: 5000, system: 'quantum' }]
            });
            const result = await server.playChoreographyTool({
                choreography_id: created.choreography_id,
                action: 'play'
            });
            expect(result.action).toBe('play');
        });

        it('returns error when no spec or id provided', async () => {
            const result = await server.playChoreographyTool({ action: 'play' });
            expect(result.error).toBeDefined();
            expect(result.error.code).toBe('NO_CHOREOGRAPHY');
        });

        it('supports pause/stop/seek actions', async () => {
            const spec = {
                duration_ms: 5000,
                scenes: [{ time_start: 0, time_end: 5000, system: 'quantum' }]
            };
            await server.playChoreographyTool({ choreography: spec, action: 'play' });

            const pause = await server.playChoreographyTool({ action: 'pause' });
            expect(pause.action).toBe('pause');

            const seek = await server.playChoreographyTool({ action: 'seek', seek_percent: 0.5 });
            expect(seek.action).toBe('seek');

            const stop = await server.playChoreographyTool({ action: 'stop' });
            expect(stop.action).toBe('stop');
        });

        it('supports loop mode', async () => {
            const spec = {
                duration_ms: 5000,
                scenes: [{ time_start: 0, time_end: 5000, system: 'quantum' }]
            };
            await server.playChoreographyTool({
                choreography: spec,
                action: 'play',
                loop: true
            });
            expect(server._choreographyPlayer.loopMode).toBe('loop');
        });
    });

    // ─────────────────────────────────────────────────────────────
    // createTimeline + controlTimeline
    // ─────────────────────────────────────────────────────────────
    describe('createTimeline', () => {
        it('creates a timeline and returns its ID', () => {
            const result = server.createTimeline({
                duration_ms: 4000,
                tracks: {
                    hue: [
                        { time: 0, value: 0 },
                        { time: 4000, value: 360 }
                    ]
                }
            });
            expect(result.timeline_id).toBeDefined();
            expect(result.duration_ms).toBe(4000);
        });
    });

    describe('controlTimeline', () => {
        it('returns error for unknown timeline', () => {
            const result = server.controlTimeline({
                timeline_id: 'nonexistent',
                action: 'play'
            });
            expect(result.error).toBeDefined();
            expect(result.error.code).toBe('TIMELINE_NOT_FOUND');
        });

        it('materializes and controls a created timeline', () => {
            const created = server.createTimeline({
                duration_ms: 4000,
                tracks: {
                    hue: [
                        { time: 0, value: 0 },
                        { time: 4000, value: 360, easing: 'linear' }
                    ]
                }
            });

            const playResult = server.controlTimeline({
                timeline_id: created.timeline_id,
                action: 'play'
            });
            expect(playResult.timeline_id).toBe(created.timeline_id);
            expect(playResult.action).toBe('play');
        });

        it('supports set_speed action', () => {
            const created = server.createTimeline({
                duration_ms: 4000,
                tracks: { hue: [{ time: 0, value: 0 }, { time: 4000, value: 360 }] }
            });

            const result = server.controlTimeline({
                timeline_id: created.timeline_id,
                action: 'set_speed',
                speed: 2.0
            });
            expect(result.playbackSpeed).toBe(2.0);
        });

        it('clamps speed to valid range', () => {
            const created = server.createTimeline({
                duration_ms: 4000,
                tracks: { hue: [{ time: 0, value: 0 }, { time: 4000, value: 360 }] }
            });

            server.controlTimeline({
                timeline_id: created.timeline_id,
                action: 'set_speed',
                speed: 100
            });
            const result = server.controlTimeline({
                timeline_id: created.timeline_id,
                action: 'set_speed',
                speed: 100
            });
            expect(result.playbackSpeed).toBeLessThanOrEqual(10);
        });
    });

    // ─────────────────────────────────────────────────────────────
    // describeVisualState
    // ─────────────────────────────────────────────────────────────
    describe('describeVisualState', () => {
        it('returns a description of the current state', () => {
            const result = server.describeVisualState();
            expect(result).toBeDefined();
            // The result should contain state information
            expect(typeof result).toBe('object');
        });
    });
});
