import { describe, it, expect, beforeEach } from 'vitest';
import {
    ReactivityConfig,
    TARGETABLE_PARAMETERS,
    AUDIO_BANDS,
    BLEND_MODES,
    INTERACTION_MODES,
    DEFAULT_REACTIVITY_CONFIG
} from '../../src/reactivity/ReactivityConfig.js';

describe('Constants', () => {
    it('TARGETABLE_PARAMETERS has all rotation params', () => {
        expect(TARGETABLE_PARAMETERS).toContain('rot4dXY');
        expect(TARGETABLE_PARAMETERS).toContain('rot4dXZ');
        expect(TARGETABLE_PARAMETERS).toContain('rot4dYZ');
        expect(TARGETABLE_PARAMETERS).toContain('rot4dXW');
        expect(TARGETABLE_PARAMETERS).toContain('rot4dYW');
        expect(TARGETABLE_PARAMETERS).toContain('rot4dZW');
    });

    it('TARGETABLE_PARAMETERS has visual params', () => {
        expect(TARGETABLE_PARAMETERS).toContain('gridDensity');
        expect(TARGETABLE_PARAMETERS).toContain('morphFactor');
        expect(TARGETABLE_PARAMETERS).toContain('chaos');
        expect(TARGETABLE_PARAMETERS).toContain('speed');
        expect(TARGETABLE_PARAMETERS).toContain('hue');
        expect(TARGETABLE_PARAMETERS).toContain('geometry');
    });

    it('AUDIO_BANDS has 3 bands', () => {
        expect(AUDIO_BANDS).toEqual(['bass', 'mid', 'high']);
    });

    it('BLEND_MODES has 5 modes', () => {
        expect(BLEND_MODES).toEqual(['add', 'multiply', 'replace', 'max', 'min']);
    });

    it('INTERACTION_MODES has mouse, click, scroll', () => {
        expect(INTERACTION_MODES).toHaveProperty('mouse');
        expect(INTERACTION_MODES).toHaveProperty('click');
        expect(INTERACTION_MODES).toHaveProperty('scroll');
        expect(INTERACTION_MODES.mouse).toContain('rotation');
        expect(INTERACTION_MODES.click).toContain('burst');
        expect(INTERACTION_MODES.scroll).toContain('cycle');
    });
});

describe('DEFAULT_REACTIVITY_CONFIG', () => {
    it('has audio, tilt, interaction sections', () => {
        expect(DEFAULT_REACTIVITY_CONFIG).toHaveProperty('audio');
        expect(DEFAULT_REACTIVITY_CONFIG).toHaveProperty('tilt');
        expect(DEFAULT_REACTIVITY_CONFIG).toHaveProperty('interaction');
    });

    it('audio is disabled by default', () => {
        expect(DEFAULT_REACTIVITY_CONFIG.audio.enabled).toBe(false);
    });

    it('tilt is disabled by default', () => {
        expect(DEFAULT_REACTIVITY_CONFIG.tilt.enabled).toBe(false);
    });

    it('interaction is enabled by default', () => {
        expect(DEFAULT_REACTIVITY_CONFIG.interaction.enabled).toBe(true);
    });
});

describe('ReactivityConfig', () => {
    let config;

    beforeEach(() => {
        config = new ReactivityConfig();
    });

    describe('constructor', () => {
        it('starts with default config', () => {
            const cfg = config.getConfig();
            expect(cfg.audio.enabled).toBe(false);
            expect(cfg.tilt.enabled).toBe(false);
            expect(cfg.interaction.enabled).toBe(true);
        });

        it('accepts initial config override', () => {
            const custom = new ReactivityConfig({ audio: { enabled: true } });
            expect(custom.getConfig().audio.enabled).toBe(true);
        });
    });

    describe('getConfig returns deep copy', () => {
        it('modifying returned config does not affect original', () => {
            const cfg = config.getConfig();
            cfg.audio.enabled = true;
            expect(config.getConfig().audio.enabled).toBe(false);
        });
    });

    describe('section getters', () => {
        it('getAudioConfig returns audio section', () => {
            const audio = config.getAudioConfig();
            expect(audio).toHaveProperty('enabled');
            expect(audio).toHaveProperty('bands');
        });

        it('getTiltConfig returns tilt section', () => {
            const tilt = config.getTiltConfig();
            expect(tilt).toHaveProperty('enabled');
            expect(tilt).toHaveProperty('mappings');
        });

        it('getInteractionConfig returns interaction section', () => {
            const interaction = config.getInteractionConfig();
            expect(interaction).toHaveProperty('mouse');
            expect(interaction).toHaveProperty('click');
            expect(interaction).toHaveProperty('scroll');
        });
    });

    describe('audio setters', () => {
        it('setAudioEnabled toggles audio', () => {
            config.setAudioEnabled(true);
            expect(config.getConfig().audio.enabled).toBe(true);
            config.setAudioEnabled(false);
            expect(config.getConfig().audio.enabled).toBe(false);
        });

        it('setAudioBand updates band config', () => {
            config.setAudioBand('bass', { sensitivity: 2.0 });
            expect(config.getConfig().audio.bands.bass.sensitivity).toBe(2.0);
        });

        it('setAudioBand rejects invalid band', () => {
            expect(() => config.setAudioBand('invalid', {})).toThrow('Invalid audio band');
        });

        it('addAudioTarget adds a target', () => {
            const before = config.getConfig().audio.bands.bass.targets.length;
            config.addAudioTarget('bass', 'chaos', 0.5, 'add');
            const after = config.getConfig().audio.bands.bass.targets.length;
            expect(after).toBe(before + 1);
        });

        it('addAudioTarget rejects invalid band', () => {
            expect(() => config.addAudioTarget('invalid', 'chaos')).toThrow();
        });

        it('addAudioTarget rejects invalid parameter', () => {
            expect(() => config.addAudioTarget('bass', 'fake_param')).toThrow('Invalid parameter');
        });

        it('addAudioTarget rejects invalid blend mode', () => {
            expect(() => config.addAudioTarget('bass', 'chaos', 1, 'invalid')).toThrow('Invalid blend mode');
        });

        it('clearAudioTargets empties targets', () => {
            config.clearAudioTargets('bass');
            expect(config.getConfig().audio.bands.bass.targets).toHaveLength(0);
        });
    });

    describe('tilt setters', () => {
        it('setTiltEnabled toggles tilt', () => {
            config.setTiltEnabled(true);
            expect(config.getConfig().tilt.enabled).toBe(true);
        });

        it('setTiltDramaticMode toggles dramatic', () => {
            config.setTiltDramaticMode(true);
            expect(config.getConfig().tilt.dramaticMode).toBe(true);
        });

        it('setTiltSensitivity clamps value', () => {
            config.setTiltSensitivity(100);
            expect(config.getConfig().tilt.sensitivity).toBe(10);
            config.setTiltSensitivity(0.001);
            expect(config.getConfig().tilt.sensitivity).toBe(0.1);
        });

        it('setTiltMapping sets axis mapping', () => {
            config.setTiltMapping('alpha', 'rot4dYZ', 0.01);
            const mapping = config.getConfig().tilt.mappings.alpha;
            expect(mapping.target).toBe('rot4dYZ');
            expect(mapping.scale).toBe(0.01);
        });

        it('setTiltMapping rejects invalid axis', () => {
            expect(() => config.setTiltMapping('invalid', 'rot4dXY', 1)).toThrow('Invalid axis');
        });

        it('setTiltMapping rejects invalid parameter', () => {
            expect(() => config.setTiltMapping('alpha', 'fake', 1)).toThrow('Invalid parameter');
        });
    });

    describe('interaction setters', () => {
        it('setInteractionEnabled toggles', () => {
            config.setInteractionEnabled(false);
            expect(config.getConfig().interaction.enabled).toBe(false);
        });

        it('setMouseMode sets valid mode', () => {
            config.setMouseMode('velocity');
            expect(config.getConfig().interaction.mouse.mode).toBe('velocity');
        });

        it('setMouseMode rejects invalid mode', () => {
            expect(() => config.setMouseMode('invalid')).toThrow('Invalid mouse mode');
        });

        it('setClickMode sets valid mode', () => {
            config.setClickMode('ripple');
            expect(config.getConfig().interaction.click.mode).toBe('ripple');
        });

        it('setClickMode rejects invalid mode', () => {
            expect(() => config.setClickMode('invalid')).toThrow('Invalid click mode');
        });

        it('setScrollMode sets valid mode', () => {
            config.setScrollMode('zoom');
            expect(config.getConfig().interaction.scroll.mode).toBe('zoom');
        });

        it('setScrollMode rejects invalid mode', () => {
            expect(() => config.setScrollMode('invalid')).toThrow('Invalid scroll mode');
        });
    });

    describe('validation', () => {
        it('default config is valid', () => {
            const result = config.validate();
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('detects invalid audio sensitivity', () => {
            config.merge({ audio: { globalSensitivity: -1 } });
            const result = config.validate();
            expect(result.valid).toBe(false);
        });

        it('detects invalid tilt sensitivity', () => {
            config.merge({ tilt: { sensitivity: -1 } });
            const result = config.validate();
            expect(result.valid).toBe(false);
        });

        it('detects invalid mouse mode', () => {
            config.merge({ interaction: { mouse: { mode: 'invalid' } } });
            const result = config.validate();
            expect(result.valid).toBe(false);
        });

        it('detects invalid audio target parameter', () => {
            config.merge({
                audio: { bands: { bass: { targets: [{ param: 'fake', weight: 1, mode: 'add' }] } } }
            });
            const result = config.validate();
            expect(result.valid).toBe(false);
        });
    });

    describe('serialization', () => {
        it('toJSON returns valid JSON string', () => {
            const json = config.toJSON();
            expect(() => JSON.parse(json)).not.toThrow();
        });

        it('fromJSON creates config from string', () => {
            config.setAudioEnabled(true);
            const json = config.toJSON();
            const restored = ReactivityConfig.fromJSON(json);
            expect(restored.getConfig().audio.enabled).toBe(true);
        });

        it('fromJSON accepts object directly', () => {
            const restored = ReactivityConfig.fromJSON({ audio: { enabled: true } });
            expect(restored.getConfig().audio.enabled).toBe(true);
        });

        it('toMinimalJSON only includes differences', () => {
            const minimal = config.toMinimalJSON();
            expect(minimal).toBe('{}');
        });

        it('toMinimalJSON captures changes', () => {
            config.setAudioEnabled(true);
            const minimal = JSON.parse(config.toMinimalJSON());
            expect(minimal.audio.enabled).toBe(true);
        });
    });

    describe('clone / reset', () => {
        it('clone creates independent copy', () => {
            config.setAudioEnabled(true);
            const cloned = config.clone();
            cloned.setAudioEnabled(false);
            expect(config.getConfig().audio.enabled).toBe(true);
        });

        it('reset restores defaults', () => {
            config.setAudioEnabled(true);
            config.setTiltEnabled(true);
            config.reset();
            expect(config.getConfig().audio.enabled).toBe(false);
            expect(config.getConfig().tilt.enabled).toBe(false);
        });
    });
});
