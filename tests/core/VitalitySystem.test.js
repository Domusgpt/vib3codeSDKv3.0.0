import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VitalitySystem } from '../../src/core/VitalitySystem.js';

describe('VitalitySystem', () => {
    let vitality;

    beforeEach(() => {
        vitality = new VitalitySystem();
    });

    it('initializes with default state', () => {
        expect(vitality.time).toBe(0);
        expect(vitality.breath).toBe(0);
        expect(vitality.cycleDuration).toBe(6000);
        expect(vitality.isRunning).toBe(false);
    });

    it('starts the system', () => {
        vitality.start();
        expect(vitality.isRunning).toBe(true);
        expect(vitality.startTime).toBeDefined();
    });

    it('stops the system', () => {
        vitality.start();
        vitality.stop();
        expect(vitality.isRunning).toBe(false);
    });

    it('returns 0 when not running', () => {
        const result = vitality.update(16);
        expect(result).toBe(0);
    });

    it('returns breath value between 0 and 1', () => {
        vitality.start();
        const result = vitality.update(16);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
    });

    it('getBreath returns current breath value', () => {
        expect(vitality.getBreath()).toBe(0);
        vitality.start();
        vitality.update(16);
        expect(vitality.getBreath()).toBe(vitality.breath);
    });

    it('breath follows a cosine cycle', () => {
        vitality.start();

        // Immediately after start, breath should be near 0
        // (using -cos, at t=0 we get (1 - cos(0))/2 = 0)
        vi.spyOn(Date, 'now').mockReturnValue(vitality.startTime);
        vitality.update(0);
        expect(vitality.breath).toBeCloseTo(0, 1);

        // At quarter cycle (1500ms), breath should be ~0.5
        vi.spyOn(Date, 'now').mockReturnValue(vitality.startTime + 1500);
        vitality.update(0);
        expect(vitality.breath).toBeCloseTo(0.5, 1);

        // At half cycle (3000ms), breath should be ~1.0
        vi.spyOn(Date, 'now').mockReturnValue(vitality.startTime + 3000);
        vitality.update(0);
        expect(vitality.breath).toBeCloseTo(1.0, 1);

        // At 3/4 cycle (4500ms), breath should be ~0.5
        vi.spyOn(Date, 'now').mockReturnValue(vitality.startTime + 4500);
        vitality.update(0);
        expect(vitality.breath).toBeCloseTo(0.5, 1);

        // At full cycle (6000ms), breath should be ~0.0
        vi.spyOn(Date, 'now').mockReturnValue(vitality.startTime + 6000);
        vitality.update(0);
        expect(vitality.breath).toBeCloseTo(0.0, 1);

        vi.restoreAllMocks();
    });
});
