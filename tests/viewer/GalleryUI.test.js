import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GalleryUI, ViewMode, SortBy } from '../../src/viewer/GalleryUI.js';

describe('ViewMode constants', () => {
    it('has all view modes', () => {
        expect(ViewMode.GRID).toBe('grid');
        expect(ViewMode.LIST).toBe('list');
        expect(ViewMode.CAROUSEL).toBe('carousel');
    });
});

describe('SortBy constants', () => {
    it('has all sort options', () => {
        expect(SortBy.INDEX).toBe('index');
        expect(SortBy.NAME).toBe('name');
        expect(SortBy.SYSTEM).toBe('system');
        expect(SortBy.RECENTLY_MODIFIED).toBe('recentlyModified');
        expect(SortBy.FAVORITES).toBe('favorites');
    });
});

describe('GalleryUI', () => {
    let gallery;

    beforeEach(() => {
        gallery = new GalleryUI();
    });

    afterEach(() => {
        gallery.dispose();
    });

    it('initializes with default state', () => {
        expect(gallery.viewMode).toBe(ViewMode.GRID);
        expect(gallery.sortBy).toBe(SortBy.INDEX);
        expect(gallery.filterSystem).toBeNull();
        expect(gallery.searchQuery).toBe('');
        expect(gallery.selectedIndex).toBe(0);
        expect(gallery.pageSize).toBe(20);
        expect(gallery.currentPage).toBe(0);
    });

    it('accepts custom options', () => {
        const g = new GalleryUI({
            viewMode: ViewMode.LIST,
            sortBy: SortBy.NAME,
            pageSize: 10,
            thumbnailSize: 200,
            gridColumns: 4
        });
        expect(g.viewMode).toBe(ViewMode.LIST);
        expect(g.sortBy).toBe(SortBy.NAME);
        expect(g.pageSize).toBe(10);
        expect(g.config.thumbnailSize).toBe(200);
        expect(g.config.gridColumns).toBe(4);
        g.dispose();
    });

    it('has default configuration', () => {
        expect(gallery.config.thumbnailSize).toBe(150);
        expect(gallery.config.previewDelay).toBe(300);
        expect(gallery.config.animatePreview).toBe(true);
        expect(gallery.config.showLabels).toBe(true);
        expect(gallery.config.gridColumns).toBe(5);
    });

    it('generates 30 default variations', () => {
        // Call internal method to generate default variation
        const v0 = gallery._getDefaultVariation(0);
        expect(v0.name).toContain('Tetrahedron');
        expect(v0.name).toContain('quantum');
        expect(v0.system).toBe('quantum');
        expect(v0.geometry).toBe(0);

        const v10 = gallery._getDefaultVariation(10);
        expect(v10.system).toBe('faceted');

        const v20 = gallery._getDefaultVariation(20);
        expect(v20.system).toBe('holographic');
    });

    it('generates custom variation slots for index >= 30', () => {
        const v30 = gallery._getDefaultVariation(30);
        expect(v30.name).toBe('Custom 1');
        expect(v30.system).toBeNull();
        expect(v30.geometry).toBe(0);

        const v99 = gallery._getDefaultVariation(99);
        expect(v99.name).toBe('Custom 70');
    });

    it('geometry names in default variations', () => {
        const names = ['Tetrahedron', 'Hypercube', 'Sphere', 'Torus',
            'Klein Bottle', 'Fractal', 'Wave', 'Crystal',
            'Hypersphere Tetra', 'Hypersphere Cube'];
        for (let i = 0; i < 10; i++) {
            const v = gallery._getDefaultVariation(i);
            expect(v.name).toContain(names[i]);
        }
    });

    it('system color mapping', () => {
        expect(gallery._getSystemColor('quantum')).toBe('#00ff88');
        expect(gallery._getSystemColor('faceted')).toBe('#ff4488');
        expect(gallery._getSystemColor('holographic')).toBe('#44aaff');
        expect(gallery._getSystemColor(null)).toBe('#888');
        expect(gallery._getSystemColor('unknown')).toBe('#888');
    });

    it('system gradient mapping', () => {
        expect(gallery._getSystemGradient('quantum')).toContain('#00ff88');
        expect(gallery._getSystemGradient('faceted')).toContain('#ff4488');
        expect(gallery._getSystemGradient('holographic')).toContain('#44aaff');
        expect(gallery._getSystemGradient(null)).toContain('#333');
    });

    it('initializes with container', () => {
        const container = document.createElement('div');
        const mockEngine = {};
        const mockGallery = null;

        const spy = vi.fn();
        gallery.on('initialized', spy);

        const result = gallery.initialize(container, mockEngine, mockGallery);
        expect(result).toBe(gallery);
        expect(gallery.container).toBe(container);
        expect(gallery.engine).toBe(mockEngine);
        expect(spy).toHaveBeenCalled();
    });

    it('loads 100 variations on initialize', () => {
        const container = document.createElement('div');
        gallery.initialize(container, {}, null);
        expect(gallery._variations).toHaveLength(100);
    });

    it('first 30 variations are marked as default', () => {
        const container = document.createElement('div');
        gallery.initialize(container, {}, null);
        for (let i = 0; i < 30; i++) {
            expect(gallery._variations[i].isDefault).toBe(true);
        }
        for (let i = 30; i < 100; i++) {
            expect(gallery._variations[i].isDefault).toBe(false);
        }
    });

    it('filters by system', () => {
        const container = document.createElement('div');
        gallery.initialize(container, {}, null);

        gallery.filterSystem = 'quantum';
        gallery._applyFilters();
        // All returned should be quantum
        expect(gallery._filteredVariations.length).toBeGreaterThan(0);
        expect(gallery._filteredVariations.every(v => v.system === 'quantum')).toBe(true);
    });

    it('filters by search query', () => {
        const container = document.createElement('div');
        gallery.initialize(container, {}, null);

        gallery.searchQuery = 'torus';
        gallery._applyFilters();
        expect(gallery._filteredVariations.length).toBeGreaterThan(0);
        expect(gallery._filteredVariations.every(v =>
            v.name.toLowerCase().includes('torus')
        )).toBe(true);
    });

    it('sorts by name', () => {
        const container = document.createElement('div');
        gallery.initialize(container, {}, null);

        gallery.sortBy = SortBy.NAME;
        gallery._applyFilters();
        for (let i = 1; i < gallery._filteredVariations.length; i++) {
            const cmp = gallery._filteredVariations[i - 1].name
                .localeCompare(gallery._filteredVariations[i].name);
            expect(cmp).toBeLessThanOrEqual(0);
        }
    });

    it('sorts by system', () => {
        const container = document.createElement('div');
        gallery.initialize(container, {}, null);

        gallery.sortBy = SortBy.SYSTEM;
        gallery._applyFilters();
        // Verify ordering: items with null system should come last
        const systemValues = gallery._filteredVariations.map(v => v.system || 'zzz');
        for (let i = 1; i < systemValues.length; i++) {
            expect(systemValues[i - 1].localeCompare(systemValues[i])).toBeLessThanOrEqual(0);
        }
    });

    it('resets page on filter', () => {
        gallery.currentPage = 5;
        gallery._applyFilters();
        expect(gallery.currentPage).toBe(0);
    });

    it('setSelection updates index and emits', () => {
        const container = document.createElement('div');
        gallery.initialize(container, {}, null);

        const spy = vi.fn();
        gallery.on('select', spy);
        gallery.setSelection(15);
        expect(gallery.selectedIndex).toBe(15);
        expect(spy).toHaveBeenCalled();
    });

    it('setSelection ignores out of range', () => {
        const container = document.createElement('div');
        gallery.initialize(container, {}, null);

        gallery.setSelection(-1);
        expect(gallery.selectedIndex).toBe(0);

        gallery.setSelection(200);
        expect(gallery.selectedIndex).toBe(0);
    });

    it('getSelection returns current variation', () => {
        const container = document.createElement('div');
        gallery.initialize(container, {}, null);

        gallery.selectedIndex = 5;
        const sel = gallery.getSelection();
        expect(sel.index).toBe(5);
    });

    it('dispose clears container and cache', () => {
        const container = document.createElement('div');
        gallery.initialize(container, {}, null);

        const spy = vi.fn();
        gallery.on('disposed', spy);
        gallery.dispose();
        expect(container.innerHTML).toBe('');
        expect(spy).toHaveBeenCalled();
    });

    it('refresh reloads and re-renders', () => {
        const container = document.createElement('div');
        gallery.initialize(container, {}, null);

        const spy = vi.fn();
        gallery.on('refresh', spy);
        gallery.refresh();
        expect(spy).toHaveBeenCalled();
    });
});
