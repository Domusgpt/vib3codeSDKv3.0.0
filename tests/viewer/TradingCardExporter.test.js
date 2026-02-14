import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TradingCardExporter, CardSize, FrameStyle, Rarity } from '../../src/viewer/TradingCardExporter.js';

describe('CardSize constants', () => {
    it('has all size presets with dimensions', () => {
        expect(CardSize.STANDARD).toEqual({ width: 750, height: 1050, name: 'Standard (2.5" x 3.5")' });
        expect(CardSize.MINI).toEqual({ width: 525, height: 735, name: 'Mini (1.75" x 2.45")' });
        expect(CardSize.JUMBO).toEqual({ width: 1050, height: 1470, name: 'Jumbo (3.5" x 4.9")' });
        expect(CardSize.SQUARE).toEqual({ width: 900, height: 900, name: 'Square (3" x 3")' });
        expect(CardSize.POSTER).toEqual({ width: 1800, height: 2400, name: 'Poster (6" x 8")' });
    });

    it('standard card maintains 5:7 ratio', () => {
        const ratio = CardSize.STANDARD.width / CardSize.STANDARD.height;
        expect(ratio).toBeCloseTo(5 / 7, 2);
    });
});

describe('FrameStyle constants', () => {
    it('has all frame styles', () => {
        expect(FrameStyle.NONE).toBe('none');
        expect(FrameStyle.SIMPLE).toBe('simple');
        expect(FrameStyle.HOLOGRAPHIC).toBe('holographic');
        expect(FrameStyle.QUANTUM).toBe('quantum');
        expect(FrameStyle.FACETED).toBe('faceted');
        expect(FrameStyle.VINTAGE).toBe('vintage');
        expect(FrameStyle.FUTURISTIC).toBe('futuristic');
    });

    it('has 7 frame styles', () => {
        expect(Object.keys(FrameStyle)).toHaveLength(7);
    });
});

describe('Rarity constants', () => {
    it('has all rarity levels', () => {
        expect(Rarity.COMMON.name).toBe('Common');
        expect(Rarity.UNCOMMON.name).toBe('Uncommon');
        expect(Rarity.RARE.name).toBe('Rare');
        expect(Rarity.EPIC.name).toBe('Epic');
        expect(Rarity.LEGENDARY.name).toBe('Legendary');
        expect(Rarity.MYTHIC.name).toBe('Mythic');
    });

    it('has 6 rarity levels', () => {
        expect(Object.keys(Rarity)).toHaveLength(6);
    });

    it('common and uncommon have no glow', () => {
        expect(Rarity.COMMON.glow).toBe(false);
        expect(Rarity.UNCOMMON.glow).toBe(false);
    });

    it('rare and above have glow', () => {
        expect(Rarity.RARE.glow).toBe(true);
        expect(Rarity.EPIC.glow).toBe(true);
        expect(Rarity.LEGENDARY.glow).toBe(true);
        expect(Rarity.MYTHIC.glow).toBe(true);
    });

    it('mythic has animated flag', () => {
        expect(Rarity.MYTHIC.animated).toBe(true);
    });

    it('all rarity levels have color', () => {
        for (const rarity of Object.values(Rarity)) {
            expect(typeof rarity.color).toBe('string');
            expect(rarity.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
    });
});

describe('TradingCardExporter', () => {
    let exporter;

    beforeEach(() => {
        exporter = new TradingCardExporter();
    });

    it('initializes with default config', () => {
        expect(exporter.config.size).toEqual(CardSize.STANDARD);
        expect(exporter.config.frameStyle).toBe(FrameStyle.HOLOGRAPHIC);
        expect(exporter.config.borderWidth).toBe(20);
        expect(exporter.config.cornerRadius).toBe(20);
        expect(exporter.config.quality).toBe(0.95);
        expect(exporter.config.showMetadata).toBe(true);
        expect(exporter.config.showRarity).toBe(true);
        expect(exporter.config.showStats).toBe(false);
    });

    it('accepts custom options', () => {
        const e = new TradingCardExporter({
            size: CardSize.JUMBO,
            frameStyle: FrameStyle.QUANTUM,
            quality: 0.8,
            showStats: true
        });
        expect(e.config.size).toEqual(CardSize.JUMBO);
        expect(e.config.frameStyle).toBe(FrameStyle.QUANTUM);
        expect(e.config.quality).toBe(0.8);
        expect(e.config.showStats).toBe(true);
    });

    it('has default metadata', () => {
        expect(exporter.metadata.title).toBe('VIB3+ Visualization');
        expect(exporter.metadata.subtitle).toBe('');
        expect(exporter.metadata.rarity).toEqual(Rarity.RARE);
        expect(exporter.metadata.system).toBe('quantum');
        expect(exporter.metadata.geometry).toBe(0);
        expect(exporter.metadata.variation).toBe(0);
    });

    it('creates export canvas (ctx may be null in non-browser env)', () => {
        expect(exporter.exportCanvas).toBeTruthy();
        // Canvas 2D context may not be available in test environment
        // In real browser, ctx would be a CanvasRenderingContext2D
    });

    it('initialize sets source canvas', () => {
        const canvas = document.createElement('canvas');
        const spy = vi.fn();
        exporter.on('initialized', spy);

        const result = exporter.initialize(canvas);
        expect(result).toBe(exporter);
        expect(exporter.sourceCanvas).toBe(canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('setSize updates canvas dimensions', () => {
        exporter.setSize(CardSize.JUMBO);
        expect(exporter.config.size).toEqual(CardSize.JUMBO);
        expect(exporter.exportCanvas.width).toBe(1050);
        expect(exporter.exportCanvas.height).toBe(1470);
    });

    it('setMetadata merges metadata', () => {
        exporter.setMetadata({ title: 'My Card', system: 'faceted', geometry: 5 });
        expect(exporter.metadata.title).toBe('My Card');
        expect(exporter.metadata.system).toBe('faceted');
        expect(exporter.metadata.geometry).toBe(5);
        // Untouched fields preserved
        expect(exporter.metadata.rarity).toEqual(Rarity.RARE);
    });

    it('exportCard throws without source canvas', async () => {
        // ctx is null in happy-dom; if present it would throw 'Source canvas not initialized'
        await expect(exporter.exportCard()).rejects.toThrow();
    });

    it('serializes to JSON', () => {
        const json = exporter.toJSON();
        expect(json).toHaveProperty('config');
        expect(json).toHaveProperty('metadata');
        expect(json.config.size).toEqual(CardSize.STANDARD);
        expect(json.metadata.title).toBe('VIB3+ Visualization');
    });

    it('restores from JSON', () => {
        const data = {
            config: { size: CardSize.SQUARE, quality: 0.7 },
            metadata: { title: 'Restored Card', geometry: 12 }
        };
        exporter.fromJSON(data);
        expect(exporter.config.quality).toBe(0.7);
        expect(exporter.metadata.title).toBe('Restored Card');
        expect(exporter.metadata.geometry).toBe(12);
    });

    it('exportCard requires canvas 2D context', async () => {
        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = 400;
        sourceCanvas.height = 300;
        exporter.initialize(sourceCanvas);

        // In happy-dom, canvas 2D context is not available
        // so exportCard will throw (ctx is null)
        if (!exporter.ctx) {
            await expect(exporter.exportCard('png')).rejects.toThrow();
        } else {
            const blob = await exporter.exportCard('png');
            expect(blob).toBeTruthy();
        }
    });
});
