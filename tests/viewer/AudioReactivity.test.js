import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioReactivity, AudioSource, FrequencyBand } from '../../src/viewer/AudioReactivity.js';

describe('AudioSource constants', () => {
    it('has all source types', () => {
        expect(AudioSource.MICROPHONE).toBe('microphone');
        expect(AudioSource.FILE).toBe('file');
        expect(AudioSource.ELEMENT).toBe('element');
        expect(AudioSource.STREAM).toBe('stream');
    });
});

describe('FrequencyBand constants', () => {
    it('has all band definitions with Hz ranges', () => {
        expect(FrequencyBand.SUB_BASS).toEqual({ min: 20, max: 60 });
        expect(FrequencyBand.BASS).toEqual({ min: 60, max: 250 });
        expect(FrequencyBand.LOW_MID).toEqual({ min: 250, max: 500 });
        expect(FrequencyBand.MID).toEqual({ min: 500, max: 2000 });
        expect(FrequencyBand.HIGH_MID).toEqual({ min: 2000, max: 4000 });
        expect(FrequencyBand.PRESENCE).toEqual({ min: 4000, max: 6000 });
        expect(FrequencyBand.BRILLIANCE).toEqual({ min: 6000, max: 20000 });
    });

    it('has 7 frequency bands', () => {
        expect(Object.keys(FrequencyBand)).toHaveLength(7);
    });

    it('bands cover 20 Hz to 20000 Hz', () => {
        const minHz = Math.min(...Object.values(FrequencyBand).map(b => b.min));
        const maxHz = Math.max(...Object.values(FrequencyBand).map(b => b.max));
        expect(minHz).toBe(20);
        expect(maxHz).toBe(20000);
    });
});

describe('AudioReactivity', () => {
    let audio;

    beforeEach(() => {
        audio = new AudioReactivity();
    });

    afterEach(() => {
        audio.dispose();
    });

    it('initializes with default configuration', () => {
        expect(audio.config.fftSize).toBe(2048);
        expect(audio.config.smoothingTimeConstant).toBe(0.8);
        expect(audio.config.minDecibels).toBe(-90);
        expect(audio.config.maxDecibels).toBe(-10);
        expect(audio.config.beatThreshold).toBe(0.8);
        expect(audio.config.beatCooldown).toBe(100);
    });

    it('accepts custom options', () => {
        const a = new AudioReactivity({
            fftSize: 4096,
            smoothing: 0.5,
            beatThreshold: 0.6
        });
        expect(a.config.fftSize).toBe(4096);
        expect(a.config.smoothingTimeConstant).toBe(0.5);
        expect(a.config.beatThreshold).toBe(0.6);
        a.dispose();
    });

    it('starts with inactive state', () => {
        expect(audio.isActive).toBe(false);
        expect(audio.sourceType).toBeNull();
        expect(audio.audioContext).toBeNull();
        expect(audio.analyser).toBeNull();
    });

    it('has default feature values at zero', () => {
        expect(audio.features.volume).toBe(0);
        expect(audio.features.bass).toBe(0);
        expect(audio.features.mid).toBe(0);
        expect(audio.features.treble).toBe(0);
        expect(audio.features.energy).toBe(0);
        expect(audio.features.centroid).toBe(0);
        expect(audio.features.flatness).toBe(0);
    });

    it('has default 6D rotation mapping', () => {
        expect(audio.rotationMapping.xy).toEqual({ feature: 'bass', scale: 0.5, offset: 0 });
        expect(audio.rotationMapping.xz).toEqual({ feature: 'mid', scale: 0.3, offset: 0 });
        expect(audio.rotationMapping.yz).toEqual({ feature: 'treble', scale: 0.2, offset: 0 });
        expect(audio.rotationMapping.xw).toEqual({ feature: 'energy', scale: 0.4, offset: 0 });
        expect(audio.rotationMapping.yw).toEqual({ feature: 'centroid', scale: 0.3, offset: 0 });
        expect(audio.rotationMapping.zw).toEqual({ feature: 'flatness', scale: 0.2, offset: 0 });
    });

    it('calculates 6D rotation from features', () => {
        audio.features.bass = 0.5;
        audio.features.mid = 0.3;
        audio.features.treble = 0.1;
        audio.features.energy = 0.4;
        audio.features.centroid = 0.6;
        audio.features.flatness = 0.2;

        const rot = audio.get6DRotation();
        // xy = bass * 0.5 * 2PI = 0.5 * 0.5 * 2PI
        expect(rot.xy).toBeCloseTo(0.5 * 0.5 * Math.PI * 2, 4);
        // xz = mid * 0.3 * 2PI = 0.3 * 0.3 * 2PI
        expect(rot.xz).toBeCloseTo(0.3 * 0.3 * Math.PI * 2, 4);
    });

    it('returns zero rotation with zero features', () => {
        const rot = audio.get6DRotation();
        for (const val of Object.values(rot)) {
            expect(val).toBe(0);
        }
    });

    it('updates rotation mapping', () => {
        audio.setRotationMapping('xy', 'energy', 0.8, 0.1);
        expect(audio.rotationMapping.xy).toEqual({ feature: 'energy', scale: 0.8, offset: 0.1 });
    });

    it('ignores invalid plane in rotation mapping', () => {
        const before = { ...audio.rotationMapping };
        audio.setRotationMapping('invalid', 'bass', 1);
        expect(audio.rotationMapping).toEqual(before);
    });

    it('returns empty array for frequency data when not initialized', () => {
        expect(audio.getFrequencyData()).toEqual([]);
    });

    it('returns empty array for waveform data when not initialized', () => {
        expect(audio.getWaveformData()).toEqual([]);
    });

    it('serializes to JSON', () => {
        const json = audio.toJSON();
        expect(json).toHaveProperty('config');
        expect(json).toHaveProperty('rotationMapping');
        expect(json.config.fftSize).toBe(2048);
    });

    it('restores from JSON', () => {
        const data = {
            config: { fftSize: 4096, beatThreshold: 0.5 },
            rotationMapping: { xy: { feature: 'energy', scale: 1, offset: 0 } }
        };
        audio.fromJSON(data);
        expect(audio.config.fftSize).toBe(4096);
        expect(audio.config.beatThreshold).toBe(0.5);
        expect(audio.rotationMapping.xy.feature).toBe('energy');
    });

    it('disconnect resets state', () => {
        const spy = vi.fn();
        audio.on('disconnected', spy);
        audio.isActive = true;
        audio.sourceType = AudioSource.MICROPHONE;

        audio.disconnect();
        expect(audio.isActive).toBe(false);
        expect(audio.sourceType).toBeNull();
        expect(spy).toHaveBeenCalled();
    });

    it('dispose emits disposed event', () => {
        const spy = vi.fn();
        audio.on('disposed', spy);
        audio.dispose();
        expect(spy).toHaveBeenCalled();
    });

    it('beat detection tracks history', () => {
        expect(audio.beatHistory).toEqual([]);
        expect(audio.beatHistorySize).toBe(43);
        expect(audio.bpm).toBe(0);
        expect(audio.isBeat).toBe(false);
    });
});
