/**
 * Tests for LayerRelationshipGraph — keystone-driven inter-layer parameter system
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    LayerRelationshipGraph,
    LAYER_ORDER,
    PROFILES,
    PRESET_REGISTRY,
    echo,
    mirror,
    complement,
    harmonic,
    reactive,
    chase
} from '../../src/render/LayerRelationshipGraph.js';

// ============================================================================
// Graph Construction & Configuration
// ============================================================================

describe('LayerRelationshipGraph', () => {
    let graph;

    beforeEach(() => {
        graph = new LayerRelationshipGraph();
    });

    describe('construction', () => {
        it('defaults keystone to content', () => {
            expect(graph.keystone).toBe('content');
        });

        it('accepts a custom keystone', () => {
            const g = new LayerRelationshipGraph({ keystone: 'highlight' });
            expect(g.keystone).toBe('highlight');
        });

        it('loads a profile on construction', () => {
            const g = new LayerRelationshipGraph({ profile: 'holographic' });
            expect(g.activeProfile).toBe('holographic');
        });

        it('has null activeProfile when no profile loaded', () => {
            expect(graph.activeProfile).toBeNull();
        });
    });

    describe('setKeystone', () => {
        it('changes the keystone layer', () => {
            graph.setKeystone('highlight');
            expect(graph.keystone).toBe('highlight');
        });

        it('clears active profile', () => {
            graph.loadProfile('holographic');
            graph.setKeystone('accent');
            expect(graph.activeProfile).toBeNull();
        });

        it('throws on invalid layer name', () => {
            expect(() => graph.setKeystone('invalid')).toThrow(/Invalid layer name/);
        });
    });

    describe('setRelationship', () => {
        it('accepts a preset name string', () => {
            graph.setRelationship('background', 'echo');
            const result = graph.resolve({ density: 1.0 }, 'background', 0);
            expect(result.density).toBeLessThan(1.0); // echo attenuates
        });

        it('accepts a { preset, config } object', () => {
            graph.setRelationship('shadow', { preset: 'echo', config: { densityScale: 0.1 } });
            const result = graph.resolve({ density: 2.0 }, 'shadow', 0);
            expect(result.density).toBeCloseTo(0.2, 5);
        });

        it('accepts a custom function', () => {
            graph.setRelationship('accent', (kp) => ({
                ...kp,
                density: kp.density * 10
            }));
            const result = graph.resolve({ density: 1.0 }, 'accent', 0);
            expect(result.density).toBe(10);
        });

        it('throws on keystone layer', () => {
            expect(() => graph.setRelationship('content', 'echo')).toThrow(/Cannot set relationship on keystone/);
        });

        it('throws on invalid layer', () => {
            expect(() => graph.setRelationship('invalid', 'echo')).toThrow(/Invalid layer name/);
        });

        it('throws on unknown preset', () => {
            expect(() => graph.setRelationship('background', 'nonexistent')).toThrow(/Unknown relationship preset/);
        });

        it('throws on invalid relationship type', () => {
            expect(() => graph.setRelationship('background', 42)).toThrow(/must be a preset name/);
        });

        it('clears active profile on change', () => {
            graph.loadProfile('chord');
            graph.setRelationship('background', 'mirror');
            expect(graph.activeProfile).toBeNull();
        });
    });

    describe('setLayerShader', () => {
        it('assigns a shader to a layer', () => {
            graph.setLayerShader('accent', 'holographic-glitch');
            expect(graph.getLayerShader('accent')).toBe('holographic-glitch');
        });

        it('returns null for layers without explicit shader', () => {
            expect(graph.getLayerShader('background')).toBeNull();
        });

        it('throws on invalid layer', () => {
            expect(() => graph.setLayerShader('invalid', 'foo')).toThrow(/Invalid layer name/);
        });
    });
});

// ============================================================================
// Resolution
// ============================================================================

describe('Resolution', () => {
    it('returns keystone params unchanged for keystone layer', () => {
        const graph = new LayerRelationshipGraph({ keystone: 'content' });
        const params = { density: 1.5, hue: 200, speed: 0.8 };
        const result = graph.resolve(params, 'content', 0);
        expect(result).toEqual(params);
    });

    it('passes through keystone params for unconfigured layers', () => {
        const graph = new LayerRelationshipGraph();
        const params = { density: 1.5, hue: 200 };
        const result = graph.resolve(params, 'background', 0);
        expect(result).toEqual(params);
    });

    it('resolveAll returns params for all 5 layers', () => {
        const graph = new LayerRelationshipGraph({ profile: 'holographic' });
        const params = { density: 1.0, hue: 180, speed: 1.0, intensity: 0.5 };
        const resolved = graph.resolveAll(params, 0);

        expect(Object.keys(resolved)).toEqual(LAYER_ORDER);
        // Content (keystone) should be unchanged
        expect(resolved.content.density).toBe(1.0);
        // Background (echo) should be attenuated
        expect(resolved.background.density).toBeLessThan(1.0);
    });

    it('resolved layers are independent objects', () => {
        const graph = new LayerRelationshipGraph({ profile: 'holographic' });
        const params = { density: 1.0 };
        const resolved = graph.resolveAll(params, 0);

        resolved.background.density = 999;
        expect(resolved.content.density).toBe(1.0);
    });
});

// ============================================================================
// Preset Relationship Functions
// ============================================================================

describe('Preset: echo', () => {
    it('attenuates density and speed', () => {
        const fn = echo({ densityScale: 0.5, speedScale: 0.25 });
        const result = fn({ density: 2.0, speed: 4.0 }, 0);
        expect(result.density).toBeCloseTo(1.0);
        expect(result.speed).toBeCloseTo(1.0);
    });

    it('scales opacity', () => {
        const fn = echo({ opacity: 0.3 });
        const result = fn({ layerOpacity: 1.0 }, 0);
        expect(result.layerOpacity).toBeCloseTo(0.3);
    });

    it('uses defaults when no config', () => {
        const fn = echo();
        const result = fn({ density: 1.0, speed: 1.0, intensity: 0.5, layerOpacity: 1.0 }, 0);
        expect(result.density).toBeLessThan(1.0);
        expect(result.speed).toBeLessThan(1.0);
    });
});

describe('Preset: mirror', () => {
    it('shifts hue by 180 degrees by default', () => {
        const fn = mirror();
        const result = fn({ hue: 100 }, 0);
        expect(result.hue).toBe(280);
    });

    it('negates 4D rotation angles', () => {
        const fn = mirror();
        const result = fn({ rot4dXW: 1.5, rot4dYW: -0.5, rot4dZW: 2.0 }, 0);
        expect(result.rot4dXW).toBe(-1.5);
        expect(result.rot4dYW).toBe(0.5);
        expect(result.rot4dZW).toBe(-2.0);
    });

    it('respects invertRotation: false', () => {
        const fn = mirror({ invertRotation: false });
        const result = fn({ rot4dXW: 1.5 }, 0);
        expect(result.rot4dXW).toBe(1.5);
    });

    it('respects custom hueShift', () => {
        const fn = mirror({ hueShift: 120 });
        const result = fn({ hue: 100 }, 0);
        expect(result.hue).toBe(220);
    });

    it('wraps hue past 360', () => {
        const fn = mirror({ hueShift: 180 });
        const result = fn({ hue: 300 }, 0);
        expect(result.hue).toBe(120); // (300 + 180) % 360
    });
});

describe('Preset: complement', () => {
    it('shifts hue by 180', () => {
        const fn = complement();
        const result = fn({ hue: 90 }, 0);
        expect(result.hue).toBe(270);
    });

    it('inverts density around pivot', () => {
        const fn = complement({ densityPivot: 1.0 });
        const result = fn({ density: 0.3 }, 0);
        expect(result.density).toBeCloseTo(1.7); // 1.0 * 2 - 0.3
    });

    it('inverts chaos by default', () => {
        const fn = complement();
        const result = fn({ chaos: 0.2 }, 0);
        expect(result.chaos).toBeCloseTo(0.8);
    });

    it('respects chaosInvert: false', () => {
        const fn = complement({ chaosInvert: false });
        const result = fn({ chaos: 0.2 }, 0);
        expect(result.chaos).toBe(0.2);
    });

    it('clamps density to minimum 0.1', () => {
        const fn = complement({ densityPivot: 0.5 });
        const result = fn({ density: 5.0 }, 0);
        expect(result.density).toBeGreaterThanOrEqual(0.1);
    });
});

describe('Preset: harmonic', () => {
    it('multiplies density by harmonic', () => {
        const fn = harmonic({ densityHarmonic: 2 });
        const result = fn({ density: 1.0 }, 0);
        expect(result.density).toBe(2.0);
    });

    it('applies speed ratio', () => {
        const fn = harmonic({ speedRatio: 0.5 });
        const result = fn({ speed: 2.0 }, 0);
        expect(result.speed).toBe(1.0);
    });

    it('shifts hue by golden angle by default', () => {
        const fn = harmonic();
        const result = fn({ hue: 0 }, 0);
        expect(result.hue).toBeCloseTo(137.508, 2);
    });

    it('wraps hue past 360', () => {
        const fn = harmonic({ hueAngle: 137.508 });
        const result = fn({ hue: 300 }, 0);
        expect(result.hue).toBeCloseTo((300 + 137.508) % 360, 2);
    });
});

describe('Preset: reactive', () => {
    it('amplifies parameter changes over time', () => {
        const fn = reactive({ gain: 2.0, decay: 0.9 });
        // First call establishes baseline
        fn({ density: 1.0 }, 0);
        // Second call with change — should amplify the delta
        const result = fn({ density: 1.5 }, 16);
        expect(result.density).toBeGreaterThan(1.5);
    });

    it('decays accumulated delta toward zero', () => {
        const fn = reactive({ gain: 2.0, decay: 0.5 });
        fn({ density: 1.0 }, 0);
        fn({ density: 2.0 }, 16); // big change
        const result = fn({ density: 2.0 }, 32); // no change — delta decays
        // With decay=0.5 and no new delta, the accumulated delta halves
        expect(Math.abs(result.density - 2.0)).toBeLessThan(1.5);
    });

    it('handles first call gracefully (no previous params)', () => {
        const fn = reactive();
        const result = fn({ density: 1.0, hue: 180 }, 0);
        expect(result.density).toBe(1.0);
        expect(result.hue).toBe(180);
    });
});

describe('Preset: chase', () => {
    it('starts at keystone values', () => {
        const fn = chase({ lerpRate: 0.5 });
        const result = fn({ density: 2.0 }, 0);
        expect(result.density).toBe(2.0);
    });

    it('lerps toward keystone over multiple calls', () => {
        const fn = chase({ lerpRate: 0.5 });
        fn({ density: 0.0 }, 0); // start at 0
        const r1 = fn({ density: 1.0 }, 16); // target jumps to 1
        expect(r1.density).toBeCloseTo(0.5); // halfway
        const r2 = fn({ density: 1.0 }, 32);
        expect(r2.density).toBeCloseTo(0.75); // 3/4
    });

    it('lerpRate=1 follows instantly', () => {
        const fn = chase({ lerpRate: 1.0 });
        fn({ density: 0.0 }, 0);
        const result = fn({ density: 5.0 }, 16);
        expect(result.density).toBeCloseTo(5.0);
    });

    it('lerpRate near 0 barely moves', () => {
        const fn = chase({ lerpRate: 0.01 });
        fn({ density: 0.0 }, 0);
        const result = fn({ density: 100 }, 16);
        expect(result.density).toBeLessThan(2.0);
    });
});

// ============================================================================
// Profiles
// ============================================================================

describe('Profiles', () => {
    it('all profiles exist in PROFILES registry', () => {
        expect(Object.keys(PROFILES)).toEqual(
            expect.arrayContaining(['holographic', 'symmetry', 'chord', 'storm', 'legacy'])
        );
    });

    it('loadProfile configures keystone and relationships', () => {
        const graph = new LayerRelationshipGraph();
        graph.loadProfile('symmetry');
        expect(graph.keystone).toBe('content');
        expect(graph.activeProfile).toBe('symmetry');
    });

    it('throws on unknown profile', () => {
        const graph = new LayerRelationshipGraph();
        expect(() => graph.loadProfile('nonexistent')).toThrow(/Unknown profile/);
    });

    it('holographic profile produces different params per layer', () => {
        const graph = new LayerRelationshipGraph({ profile: 'holographic' });
        const params = { density: 1.0, hue: 200, speed: 1.0, intensity: 0.6, chaos: 0.3 };
        const resolved = graph.resolveAll(params, 0);

        // Each layer should have different opacity at minimum
        const opacities = LAYER_ORDER
            .filter(l => l !== 'content')
            .map(l => resolved[l].layerOpacity);
        const unique = new Set(opacities);
        expect(unique.size).toBeGreaterThan(1);
    });

    it('legacy profile replicates old static multiplier behavior', () => {
        const graph = new LayerRelationshipGraph({ profile: 'legacy' });
        const params = { density: 1.0, speed: 1.0, intensity: 0.5, layerOpacity: 1.0 };
        const bg = graph.resolve(params, 'background', 0);

        // Legacy echo config: opacity=0.2, densityScale=0.4, speedScale=0.2
        expect(bg.layerOpacity).toBeCloseTo(0.2, 1);
        expect(bg.density).toBeCloseTo(0.4, 1);
        expect(bg.speed).toBeCloseTo(0.2, 1);
    });

    it('storm profile makes all non-keystone layers reactive', () => {
        const graph = new LayerRelationshipGraph({ profile: 'storm' });
        const params = { density: 1.0 };
        // First frame: establishes baseline
        graph.resolveAll(params, 0);
        // Second frame with change
        const resolved = graph.resolveAll({ density: 2.0 }, 16);
        // All non-keystone layers should have density > 2.0 (amplified delta)
        for (const layer of ['background', 'shadow', 'highlight', 'accent']) {
            expect(resolved[layer].density).toBeGreaterThan(2.0);
        }
    });
});

// ============================================================================
// Serialization
// ============================================================================

describe('Serialization', () => {
    it('exportConfig captures keystone and relationships', () => {
        const graph = new LayerRelationshipGraph({ profile: 'holographic' });
        const config = graph.exportConfig();

        expect(config.keystone).toBe('content');
        expect(config.profile).toBe('holographic');
        expect(config.relationships).toBeDefined();
        expect(config.relationships.background).toHaveProperty('preset', 'echo');
    });

    it('exportConfig captures shader assignments', () => {
        const graph = new LayerRelationshipGraph();
        graph.setLayerShader('accent', 'glitch');
        const config = graph.exportConfig();
        expect(config.shaders.accent).toBe('glitch');
    });

    it('exportConfig marks custom functions as null', () => {
        const graph = new LayerRelationshipGraph();
        graph.setRelationship('background', () => ({ density: 0 }));
        const config = graph.exportConfig();
        expect(config.relationships.background).toBeNull();
    });

    it('importConfig restores from exported config', () => {
        const original = new LayerRelationshipGraph({ profile: 'chord' });
        original.setLayerShader('accent', 'special');
        const exported = original.exportConfig();

        const restored = new LayerRelationshipGraph();
        restored.importConfig(exported);

        expect(restored.activeProfile).toBe('chord');
        expect(restored.getLayerShader('accent')).toBe('special');
    });

    it('importConfig handles config without profile', () => {
        const graph = new LayerRelationshipGraph();
        graph.setRelationship('background', { preset: 'mirror', config: { hueShift: 90 } });
        const exported = graph.exportConfig();

        const restored = new LayerRelationshipGraph();
        restored.importConfig(exported);

        const result = restored.resolve({ hue: 100 }, 'background', 0);
        expect(result.hue).toBe(190); // 100 + 90
    });

    it('round-trip preserves behavior', () => {
        const graph = new LayerRelationshipGraph({ profile: 'symmetry' });
        const params = { density: 1.5, hue: 120, speed: 0.8, rot4dXW: 1.0 };

        const before = graph.resolveAll(params, 100);
        const exported = graph.exportConfig();

        const restored = new LayerRelationshipGraph();
        restored.importConfig(exported);
        const after = restored.resolveAll(params, 100);

        // Content (keystone) should match exactly
        expect(after.content).toEqual(before.content);
    });
});

// ============================================================================
// Static Properties
// ============================================================================

describe('Static properties', () => {
    it('profileNames includes all profiles', () => {
        expect(LayerRelationshipGraph.profileNames).toEqual(
            expect.arrayContaining(['holographic', 'symmetry', 'chord', 'storm', 'legacy'])
        );
    });

    it('presetNames includes all presets', () => {
        expect(LayerRelationshipGraph.presetNames).toEqual(
            expect.arrayContaining(['echo', 'mirror', 'complement', 'harmonic', 'reactive', 'chase'])
        );
    });
});

// ============================================================================
// LAYER_ORDER constant
// ============================================================================

describe('LAYER_ORDER', () => {
    it('has 5 layers in correct order', () => {
        expect(LAYER_ORDER).toEqual(['background', 'shadow', 'content', 'highlight', 'accent']);
    });
});

// ============================================================================
// PRESET_REGISTRY
// ============================================================================

describe('PRESET_REGISTRY', () => {
    it('has all 6 presets', () => {
        expect(Object.keys(PRESET_REGISTRY).sort()).toEqual(
            ['chase', 'complement', 'echo', 'harmonic', 'mirror', 'reactive']
        );
    });

    it('each preset is a factory function', () => {
        for (const [name, factory] of Object.entries(PRESET_REGISTRY)) {
            expect(typeof factory).toBe('function');
            const fn = factory();
            expect(typeof fn).toBe('function');
        }
    });
});
