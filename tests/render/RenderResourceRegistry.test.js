import { describe, it, expect, beforeEach } from 'vitest';
import { RenderResourceRegistry } from '../../src/render/RenderResourceRegistry.js';

describe('RenderResourceRegistry', () => {
    let registry;

    beforeEach(() => {
        registry = new RenderResourceRegistry({ trackHistory: true });
    });

    describe('register', () => {
        it('registers a resource and tracks it', () => {
            const handle = { id: 'buf1' };
            const entry = registry.register('buffer', handle);
            expect(entry).not.toBeNull();
            expect(entry.handle).toBe(handle);
        });

        it('returns null for null handle', () => {
            const entry = registry.register('buffer', null);
            expect(entry).toBeNull();
        });

        it('increments allocation counter', () => {
            registry.register('buffer', { id: 1 });
            registry.register('buffer', { id: 2 });
            const stats = registry.getStats();
            expect(stats.totalResources).toBe(2);
        });

        it('tracks bytes', () => {
            registry.register('texture', { id: 't1' }, null, { bytes: 1024 });
            const stats = registry.getStats();
            expect(stats.totalBytes).toBe(1024);
        });

        it('stores label', () => {
            registry.register('shader', { id: 's1' }, null, { label: 'main-shader' });
            const resources = registry.getResourcesByType('shader');
            expect(resources[0].label).toBe('main-shader');
        });
    });

    describe('release', () => {
        it('releases a registered resource', () => {
            const handle = { id: 'buf1' };
            registry.register('buffer', handle, null, { bytes: 512 });
            const released = registry.release('buffer', handle);
            expect(released).toBe(true);
            expect(registry.getStats().totalResources).toBe(0);
            expect(registry.getStats().totalBytes).toBe(0);
        });

        it('returns false for unknown type', () => {
            expect(registry.release('buffer', {})).toBe(false);
        });

        it('returns false for unknown handle', () => {
            registry.register('buffer', { id: 1 });
            expect(registry.release('buffer', { id: 2 })).toBe(false);
        });
    });

    describe('dispose', () => {
        it('calls disposer function and releases', () => {
            let disposed = false;
            const handle = { id: 'buf1' };
            registry.register('buffer', handle, () => { disposed = true; }, { bytes: 256 });
            const result = registry.dispose('buffer', handle);
            expect(result).toBe(true);
            expect(disposed).toBe(true);
            expect(registry.getStats().totalResources).toBe(0);
        });

        it('handles missing disposer gracefully', () => {
            const handle = { id: 'buf1' };
            registry.register('buffer', handle);
            expect(registry.dispose('buffer', handle)).toBe(true);
        });

        it('handles disposer that throws', () => {
            const handle = { id: 'bad' };
            registry.register('buffer', handle, () => { throw new Error('dispose fail'); });
            // Should not throw
            expect(registry.dispose('buffer', handle)).toBe(true);
        });
    });

    describe('disposeType', () => {
        it('disposes all resources of a type', () => {
            let count = 0;
            for (let i = 0; i < 5; i++) {
                registry.register('buffer', { id: i }, () => { count++; });
            }
            const disposed = registry.disposeType('buffer');
            expect(disposed).toBe(5);
            expect(count).toBe(5);
            expect(registry.getStats().totalResources).toBe(0);
        });

        it('returns 0 for unknown type', () => {
            expect(registry.disposeType('unknown')).toBe(0);
        });
    });

    describe('disposeAll', () => {
        it('disposes all resources across types', () => {
            let count = 0;
            registry.register('buffer', { id: 1 }, () => { count++; });
            registry.register('texture', { id: 2 }, () => { count++; });
            registry.register('shader', { id: 3 }, () => { count++; });
            registry.disposeAll();
            expect(count).toBe(3);
            expect(registry.getStats().totalResources).toBe(0);
            expect(registry.getStats().totalBytes).toBe(0);
        });
    });

    describe('getStats', () => {
        it('returns per-type breakdown', () => {
            registry.register('buffer', { id: 1 }, null, { bytes: 100 });
            registry.register('buffer', { id: 2 }, null, { bytes: 200 });
            registry.register('texture', { id: 3 }, null, { bytes: 1000 });
            const stats = registry.getStats();
            expect(stats.byType.buffer.count).toBe(2);
            expect(stats.byType.buffer.bytes).toBe(300);
            expect(stats.byType.texture.count).toBe(1);
            expect(stats.byType.texture.bytes).toBe(1000);
        });
    });

    describe('getDiagnostics', () => {
        it('includes peak tracking', () => {
            registry.register('buffer', { id: 1 }, null, { bytes: 500 });
            registry.register('buffer', { id: 2 }, null, { bytes: 500 });
            const diag = registry.getDiagnostics();
            expect(diag.peak.resources).toBe(2);
            expect(diag.peak.bytes).toBe(1000);
        });

        it('includes lifetime stats', () => {
            const h = { id: 1 };
            registry.register('buffer', h);
            registry.release('buffer', h);
            const diag = registry.getDiagnostics();
            expect(diag.lifetime.totalAllocations).toBe(1);
            expect(diag.lifetime.totalDeallocations).toBe(1);
            expect(diag.lifetime.netAllocations).toBe(0);
        });
    });

    describe('frame delta tracking', () => {
        it('tracks resource changes per frame', () => {
            registry.register('buffer', { id: 1 });
            registry.beginFrame();
            registry.register('buffer', { id: 2 });
            registry.register('buffer', { id: 3 });
            const delta = registry.endFrame();
            expect(delta.resources).toBe(2);
        });
    });

    describe('history', () => {
        it('records alloc and free events', () => {
            const h = { id: 1 };
            registry.register('buffer', h, null, { bytes: 100, label: 'test' });
            registry.release('buffer', h);
            const history = registry.getHistory();
            expect(history).toHaveLength(2);
            expect(history[0].action).toBe('alloc');
            expect(history[1].action).toBe('free');
        });

        it('filters by type', () => {
            registry.register('buffer', { id: 1 });
            registry.register('texture', { id: 2 });
            const bufHistory = registry.getHistory({ type: 'buffer' });
            expect(bufHistory).toHaveLength(1);
        });

        it('trims to history limit', () => {
            const reg = new RenderResourceRegistry({ trackHistory: true, historyLimit: 5 });
            for (let i = 0; i < 10; i++) {
                reg.register('buffer', { id: i });
            }
            expect(reg.getHistory().length).toBeLessThanOrEqual(5);
        });
    });

    describe('getResourcesByType', () => {
        it('returns resource details', () => {
            registry.register('buffer', { id: 1 }, null, { bytes: 256, label: 'vbo' });
            const resources = registry.getResourcesByType('buffer');
            expect(resources).toHaveLength(1);
            expect(resources[0].label).toBe('vbo');
            expect(resources[0].bytes).toBe(256);
            expect(resources[0].age).toBeGreaterThanOrEqual(0);
        });

        it('returns empty for unknown type', () => {
            expect(registry.getResourcesByType('unknown')).toEqual([]);
        });
    });

    describe('formatBytes', () => {
        it('summary string is well-formed', () => {
            registry.register('buffer', { id: 1 }, null, { bytes: 1048576 });
            const summary = registry.getSummaryString();
            expect(summary).toContain('Resources: 1');
            expect(summary).toContain('MB');
        });
    });

    describe('exportDiagnosticsJSON', () => {
        it('returns valid JSON', () => {
            registry.register('buffer', { id: 1 }, null, { bytes: 100 });
            const json = registry.exportDiagnosticsJSON();
            const parsed = JSON.parse(json);
            expect(parsed.diagnostics).toBeDefined();
            expect(parsed.history).toBeDefined();
        });
    });
});
