import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CardBending, BendPreset } from '../../src/viewer/CardBending.js';

describe('BendPreset constants', () => {
    it('has all preset values', () => {
        expect(BendPreset.NONE).toBe('none');
        expect(BendPreset.SUBTLE).toBe('subtle');
        expect(BendPreset.STANDARD).toBe('standard');
        expect(BendPreset.DRAMATIC).toBe('dramatic');
        expect(BendPreset.HOLOGRAPHIC).toBe('holographic');
    });
});

describe('CardBending', () => {
    let bender;

    beforeEach(() => {
        bender = new CardBending();
    });

    afterEach(() => {
        bender.dispose();
    });

    it('initializes with default state', () => {
        expect(bender.bendX).toBe(0);
        expect(bender.bendY).toBe(0);
        expect(bender.bendZ).toBe(0);
        expect(bender.preset).toBe(BendPreset.STANDARD);
        expect(bender.isAnimating).toBe(false);
    });

    it('accepts constructor options', () => {
        const b = new CardBending({
            preset: BendPreset.DRAMATIC,
            xyCoeff: 0.5,
            smoothing: 0.2
        });
        expect(b.preset).toBe(BendPreset.DRAMATIC);
        expect(b.rotationMapping.xy).toBe(0.5);
        expect(b._smoothing).toBe(0.2);
        b.dispose();
    });

    it('uses preset configuration', () => {
        const b = new CardBending({ preset: BendPreset.HOLOGRAPHIC });
        expect(b.config.maxBend).toBe(20);
        expect(b.config.shimmerIntensity).toBe(1.0);
        expect(b.config.parallaxDepth).toBe(30);
        b.dispose();
    });

    it('sets bend values with clamping', () => {
        bender.setBend(0.5, -0.3, 0.1);
        expect(bender._targetBend.x).toBe(0.5);
        expect(bender._targetBend.y).toBe(-0.3);
        expect(bender._targetBend.z).toBe(0.1);
    });

    it('clamps bend values to -1/1 range', () => {
        bender.setBend(5, -5, 3);
        expect(bender._targetBend.x).toBe(1);
        expect(bender._targetBend.y).toBe(-1);
        expect(bender._targetBend.z).toBe(1);
    });

    it('sets bend from position', () => {
        const el = document.createElement('div');
        bender.element = el;
        const rect = { left: 0, top: 0, width: 200, height: 100 };
        bender.setBendFromPosition(100, 50, rect);
        // At center, normalized x=0, y=0 → setBend(-0*0.8, 0*0.8) ≈ (0,0)
        expect(bender._targetBend.x).toBeCloseTo(0, 1);
        expect(bender._targetBend.y).toBeCloseTo(0, 1);
    });

    it('sets bend from position at edge', () => {
        bender.element = document.createElement('div');
        const rect = { left: 0, top: 0, width: 200, height: 100 };
        bender.setBendFromPosition(200, 100, rect);
        // x = 1, y = 1 → setBend(-1*0.8, 1*0.8, 0) = (-0.8, 0.8, 0)
        expect(bender._targetBend.x).toBeCloseTo(-0.8, 1);
        expect(bender._targetBend.y).toBeCloseTo(0.8, 1);
    });

    it('does nothing when setBendFromPosition without element', () => {
        bender.setBendFromPosition(100, 100);
        expect(bender._targetBend.x).toBe(0);
    });

    it('sets bend from device orientation', () => {
        bender.setBendFromOrientation(30, 20);
        // beta=30 → 30/45 = 0.667, gamma=20 → 20/45 = 0.444
        expect(bender._targetBend.x).toBeCloseTo(30 / 45, 2);
        expect(bender._targetBend.y).toBeCloseTo(20 / 45, 2);
    });

    it('clamps orientation bend', () => {
        bender.setBendFromOrientation(90, -90);
        expect(bender._targetBend.x).toBe(1);
        expect(bender._targetBend.y).toBe(-1);
    });

    it('calculates 6D rotation from bend', () => {
        bender.bendX = 0.5;
        bender.bendY = 0.3;
        bender.bendZ = 0.1;

        const rot = bender.get6DRotation();
        expect(rot).toHaveProperty('xy');
        expect(rot).toHaveProperty('xz');
        expect(rot).toHaveProperty('yz');
        expect(rot).toHaveProperty('xw');
        expect(rot).toHaveProperty('yw');
        expect(rot).toHaveProperty('zw');

        // xy = bendZ * xy_coeff * PI = 0.1 * 0.2 * PI
        expect(rot.xy).toBeCloseTo(0.1 * 0.2 * Math.PI, 4);
        // xz = bendY * xz_coeff * PI = 0.3 * 0.3 * PI
        expect(rot.xz).toBeCloseTo(0.3 * 0.3 * Math.PI, 4);
        // yz = bendX * yz_coeff * PI = 0.5 * 0.3 * PI
        expect(rot.yz).toBeCloseTo(0.5 * 0.3 * Math.PI, 4);
        // xw = bendY * xw_coeff * PI = 0.3 * 0.5 * PI
        expect(rot.xw).toBeCloseTo(0.3 * 0.5 * Math.PI, 4);
        // yw = bendX * yw_coeff * PI = 0.5 * 0.5 * PI
        expect(rot.yw).toBeCloseTo(0.5 * 0.5 * Math.PI, 4);
        // zw = bendX*bendY * zw_coeff * PI = 0.15 * 0.1 * PI
        expect(rot.zw).toBeCloseTo(0.15 * 0.1 * Math.PI, 4);
    });

    it('returns zero rotation when bends are zero', () => {
        const rot = bender.get6DRotation();
        for (const val of Object.values(rot)) {
            expect(val).toBe(0);
        }
    });

    it('changes preset and emits event', () => {
        const spy = vi.fn();
        bender.on('presetChanged', spy);
        bender.setPreset(BendPreset.DRAMATIC);
        expect(bender.preset).toBe(BendPreset.DRAMATIC);
        expect(bender.config.maxBend).toBe(30);
        expect(spy).toHaveBeenCalledWith(BendPreset.DRAMATIC);
    });

    it('ignores invalid preset', () => {
        bender.setPreset('invalid_preset');
        expect(bender.preset).toBe(BendPreset.STANDARD);
    });

    it('serializes to JSON', () => {
        bender.bendX = 0.4;
        bender.bendY = -0.2;
        bender.bendZ = 0.1;
        const json = bender.toJSON();
        expect(json.bendX).toBe(0.4);
        expect(json.bendY).toBe(-0.2);
        expect(json.bendZ).toBe(0.1);
        expect(json.preset).toBe(BendPreset.STANDARD);
        expect(json).toHaveProperty('config');
        expect(json).toHaveProperty('rotationMapping');
        expect(json).toHaveProperty('rotation6D');
    });

    it('restores from JSON', () => {
        const data = {
            preset: BendPreset.SUBTLE,
            bendX: 0.3,
            bendY: -0.5,
            bendZ: 0,
            rotationMapping: { xy: 0.1, xz: 0.1, yz: 0.1, xw: 0.1, yw: 0.1, zw: 0.1 }
        };
        bender.fromJSON(data);
        expect(bender.preset).toBe(BendPreset.SUBTLE);
        expect(bender._targetBend.x).toBe(0.3);
        expect(bender._targetBend.y).toBe(-0.5);
        expect(bender.rotationMapping.xy).toBe(0.1);
    });

    it('initializes on element and starts animation', () => {
        const el = document.createElement('div');
        const parent = document.createElement('div');
        parent.appendChild(el);

        const spy = vi.fn();
        bender.on('initialized', spy);

        const result = bender.initialize(el);
        expect(result).toBe(bender);
        expect(bender.element).toBe(el);
        expect(bender.isAnimating).toBe(true);
        expect(spy).toHaveBeenCalled();
    });

    it('creates shimmer overlay on initialize', () => {
        const el = document.createElement('div');
        const parent = document.createElement('div');
        parent.appendChild(el);

        bender.initialize(el);
        expect(bender.shimmerOverlay).toBeTruthy();
        expect(bender.shimmerOverlay.tagName).toBe('DIV');
    });

    it('creates parallax layers', () => {
        const el = document.createElement('div');
        const parent = document.createElement('div');
        parent.appendChild(el);
        bender.initialize(el);

        const layers = bender.createParallaxLayers(3);
        expect(layers).toHaveLength(3);
        expect(bender.parallaxLayers).toHaveLength(3);
    });

    it('dispose cleans up element and overlays', () => {
        const el = document.createElement('div');
        const parent = document.createElement('div');
        parent.appendChild(el);
        bender.initialize(el);

        const spy = vi.fn();
        bender.on('disposed', spy);
        bender.dispose();

        expect(bender.element).toBeNull();
        expect(bender.shimmerOverlay).toBeNull();
        expect(bender.parallaxLayers).toHaveLength(0);
        expect(spy).toHaveBeenCalled();
    });
});
