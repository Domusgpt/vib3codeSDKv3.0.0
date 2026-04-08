/**
 * Tests for VisualEventSystem — Premium Module 4
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { VisualEventSystem } from '../../src/premium/VisualEventSystem.js';

function createMockEngine() {
    let listener = null;
    return {
        activeSystem: {
            loadRelationshipProfile: vi.fn()
        },
        onParameterChange: vi.fn((cb) => {
            listener = cb;
            return () => { listener = null; };
        }),
        setParameter: vi.fn(),
        setParameters: vi.fn(),
        getParameter: vi.fn(),
        _triggerParameterChange(params) {
            if (listener) listener(params);
        }
    };
}

describe('VisualEventSystem', () => {
    let engine;
    let events;

    beforeEach(() => {
        engine = createMockEngine();
        events = new VisualEventSystem(engine);
    });

    afterEach(() => {
        events.destroy();
    });

    describe('construction', () => {
        it('subscribes to engine parameter changes', () => {
            expect(engine.onParameterChange).toHaveBeenCalled();
        });

        it('starts with no triggers', () => {
            expect(events.listTriggers()).toEqual([]);
        });
    });

    describe('addTrigger', () => {
        it('adds a trigger with valid config', () => {
            events.addTrigger('test', {
                source: 'parameter.chaos',
                condition: 'exceeds',
                threshold: 0.5,
                action: { type: 'set_parameters', value: { hue: 180 } }
            });
            const triggers = events.listTriggers();
            expect(triggers).toHaveLength(1);
            expect(triggers[0].id).toBe('test');
        });

        it('defaults cooldown to 1000ms', () => {
            events.addTrigger('test', {
                source: 'parameter.chaos',
                condition: 'exceeds',
                threshold: 0.5,
                action: { type: 'set_parameters', value: { hue: 180 } }
            });
            const triggers = events.listTriggers();
            expect(triggers[0].cooldown).toBe(1000);
        });

        it('accepts custom cooldown', () => {
            events.addTrigger('test', {
                source: 'parameter.chaos',
                condition: 'exceeds',
                threshold: 0.5,
                cooldown: 500,
                action: { type: 'set_parameters', value: { hue: 180 } }
            });
            expect(events.listTriggers()[0].cooldown).toBe(500);
        });

        it('throws on missing source', () => {
            expect(() => events.addTrigger('test', {
                condition: 'exceeds',
                threshold: 0.5,
                action: { type: 'set_parameters' }
            })).toThrow(/source/);
        });

        it('throws on invalid condition', () => {
            expect(() => events.addTrigger('test', {
                source: 'parameter.chaos',
                condition: 'invalid',
                threshold: 0.5,
                action: { type: 'set_parameters' }
            })).toThrow(/Invalid condition/);
        });

        it('throws on non-number threshold', () => {
            expect(() => events.addTrigger('test', {
                source: 'parameter.chaos',
                condition: 'exceeds',
                threshold: 'high',
                action: { type: 'set_parameters' }
            })).toThrow(/threshold/);
        });

        it('throws on invalid action type', () => {
            expect(() => events.addTrigger('test', {
                source: 'parameter.chaos',
                condition: 'exceeds',
                threshold: 0.5,
                action: { type: 'invalid' }
            })).toThrow(/Invalid action type/);
        });
    });

    describe('removeTrigger', () => {
        it('removes a trigger by id', () => {
            events.addTrigger('t1', {
                source: 'parameter.chaos',
                condition: 'exceeds',
                threshold: 0.5,
                action: { type: 'set_parameters', value: {} }
            });
            events.removeTrigger('t1');
            expect(events.listTriggers()).toHaveLength(0);
        });

        it('is a no-op for non-existent trigger', () => {
            expect(() => events.removeTrigger('nonexistent')).not.toThrow();
        });
    });

    describe('trigger evaluation — exceeds', () => {
        it('fires when value crosses threshold upward', () => {
            const callback = vi.fn();
            events.addTrigger('chaos_high', {
                source: 'parameter.chaos',
                condition: 'exceeds',
                threshold: 0.7,
                cooldown: 0,
                action: { type: 'set_parameters', value: { hue: 180 } }
            });
            events.on('chaos_high', callback);

            // First update: below threshold
            engine._triggerParameterChange({ chaos: 0.3 });
            expect(callback).not.toHaveBeenCalled();

            // Second update: crosses above threshold
            engine._triggerParameterChange({ chaos: 0.8 });
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('does not fire when value stays above threshold', () => {
            const callback = vi.fn();
            events.addTrigger('chaos_high', {
                source: 'parameter.chaos',
                condition: 'exceeds',
                threshold: 0.5,
                cooldown: 0,
                action: { type: 'set_parameters', value: {} }
            });
            events.on('chaos_high', callback);

            engine._triggerParameterChange({ chaos: 0.6 });
            engine._triggerParameterChange({ chaos: 0.7 });
            // Should fire on first crossing, not on staying above
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('trigger evaluation — drops_below', () => {
        it('fires when value drops below threshold', () => {
            const callback = vi.fn();
            events.addTrigger('speed_low', {
                source: 'parameter.speed',
                condition: 'drops_below',
                threshold: 0.5,
                cooldown: 0,
                action: { type: 'set_parameters', value: {} }
            });
            events.on('speed_low', callback);

            engine._triggerParameterChange({ speed: 0.8 });
            engine._triggerParameterChange({ speed: 0.3 });
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('trigger evaluation — crosses', () => {
        it('fires when value crosses threshold in either direction', () => {
            const callback = vi.fn();
            events.addTrigger('intensity_cross', {
                source: 'parameter.intensity',
                condition: 'crosses',
                threshold: 0.5,
                cooldown: 0,
                action: { type: 'set_parameters', value: {} }
            });
            events.on('intensity_cross', callback);

            engine._triggerParameterChange({ intensity: 0.3 });
            engine._triggerParameterChange({ intensity: 0.6 }); // crosses up
            engine._triggerParameterChange({ intensity: 0.4 }); // crosses down
            expect(callback).toHaveBeenCalledTimes(2);
        });

        it('does not fire without a previous value', () => {
            const callback = vi.fn();
            events.addTrigger('intensity_cross', {
                source: 'parameter.intensity',
                condition: 'crosses',
                threshold: 0.5,
                cooldown: 0,
                action: { type: 'set_parameters', value: {} }
            });
            events.on('intensity_cross', callback);

            // First value — no previous, so no crossing
            engine._triggerParameterChange({ intensity: 0.6 });
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('trigger evaluation — equals', () => {
        it('fires when value approximately equals threshold', () => {
            const callback = vi.fn();
            events.addTrigger('exact', {
                source: 'parameter.chaos',
                condition: 'equals',
                threshold: 0.5,
                cooldown: 0,
                action: { type: 'set_parameters', value: {} }
            });
            events.on('exact', callback);

            engine._triggerParameterChange({ chaos: 0.501 }); // within 0.01 tolerance
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('action execution', () => {
        it('executes set_parameters action', () => {
            events.addTrigger('test', {
                source: 'parameter.chaos',
                condition: 'exceeds',
                threshold: 0.5,
                cooldown: 0,
                action: { type: 'set_parameters', value: { hue: 180, speed: 2.0 } }
            });

            engine._triggerParameterChange({ chaos: 0.3 });
            engine._triggerParameterChange({ chaos: 0.8 });
            expect(engine.setParameters).toHaveBeenCalledWith({ hue: 180, speed: 2.0 });
        });

        it('executes layer_profile action', () => {
            events.addTrigger('test', {
                source: 'parameter.chaos',
                condition: 'exceeds',
                threshold: 0.5,
                cooldown: 0,
                action: { type: 'layer_profile', value: 'storm' }
            });

            engine._triggerParameterChange({ chaos: 0.3 });
            engine._triggerParameterChange({ chaos: 0.8 });
            expect(engine.activeSystem.loadRelationshipProfile).toHaveBeenCalledWith('storm');
        });
    });

    describe('custom events', () => {
        it('emits custom events', () => {
            const callback = vi.fn();
            events.on('myEvent', callback);
            events.emit('myEvent', { foo: 'bar' });
            expect(callback).toHaveBeenCalledWith({ foo: 'bar' });
        });

        it('custom events can be trigger sources', () => {
            const callback = vi.fn();
            events.addTrigger('custom_test', {
                source: 'custom.mySignal',
                condition: 'exceeds',
                threshold: 0.5,
                cooldown: 0,
                action: { type: 'set_parameters', value: {} }
            });
            events.on('custom_test', callback);

            events.emit('mySignal', 0.3);
            engine._triggerParameterChange({}); // trigger evaluation
            events.emit('mySignal', 0.8);
            engine._triggerParameterChange({}); // trigger evaluation
            // The custom source should have crossed 0.5
        });
    });

    describe('scene triggers', () => {
        it('adds scene-scoped triggers', () => {
            events.addSceneTrigger('scene_t1', {
                source: 'parameter.chaos',
                condition: 'exceeds',
                threshold: 0.5,
                action: { type: 'set_parameters', value: {} }
            });
            expect(events.listTriggers()).toHaveLength(1);
        });

        it('clears scene triggers without affecting regular triggers', () => {
            events.addTrigger('regular', {
                source: 'parameter.chaos',
                condition: 'exceeds',
                threshold: 0.5,
                action: { type: 'set_parameters', value: {} }
            });
            events.addSceneTrigger('scene_t1', {
                source: 'parameter.speed',
                condition: 'exceeds',
                threshold: 1.0,
                action: { type: 'set_parameters', value: {} }
            });

            events.clearSceneTriggers();
            const triggers = events.listTriggers();
            expect(triggers).toHaveLength(1);
            expect(triggers[0].id).toBe('regular');
        });
    });

    describe('enable/disable', () => {
        it('disables trigger evaluation', () => {
            const callback = vi.fn();
            events.addTrigger('test', {
                source: 'parameter.chaos',
                condition: 'exceeds',
                threshold: 0.5,
                cooldown: 0,
                action: { type: 'set_parameters', value: {} }
            });
            events.on('test', callback);

            events.setEnabled(false);
            engine._triggerParameterChange({ chaos: 0.3 });
            engine._triggerParameterChange({ chaos: 0.8 });
            expect(callback).not.toHaveBeenCalled();
        });

        it('re-enables trigger evaluation', () => {
            events.setEnabled(false);
            events.setEnabled(true);
            // Should work normally again
        });
    });

    describe('destroy', () => {
        it('cleans up all state', () => {
            events.addTrigger('test', {
                source: 'parameter.chaos',
                condition: 'exceeds',
                threshold: 0.5,
                action: { type: 'set_parameters', value: {} }
            });
            events.destroy();
            expect(events.listTriggers()).toEqual([]);
        });
    });
});
