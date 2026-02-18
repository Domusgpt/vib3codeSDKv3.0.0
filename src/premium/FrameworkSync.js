/**
 * FrameworkSync — Premium Module 7
 * Bidirectional state sync between VIB3+ engine and React/Vue/Svelte frameworks.
 * Generates enhanced framework code with engine→framework state subscription.
 *
 * @module @vib3code/premium/FrameworkSync
 */

export class FrameworkSync {
    /**
     * @param {import('../core/VIB3Engine.js').VIB3Engine} engine
     */
    constructor(engine) {
        this._engine = engine;
        this._syncCallbacks = new Set();
        this._unsubscribe = null;
        this._throttleMs = 16; // ~60fps
        this._lastPush = 0;

        this._install();
    }

    /** Install parameter change listener for framework sync */
    _install() {
        this._unsubscribe = this._engine.onParameterChange((params, meta) => {
            const now = Date.now();
            if (now - this._lastPush < this._throttleMs) return;
            this._lastPush = now;

            for (const cb of this._syncCallbacks) {
                try { cb(params, meta); } catch (_) { /* sync error */ }
            }
        });
    }

    /**
     * Register a framework state sync callback.
     * Called whenever engine parameters change (throttled).
     * @param {(params: object, meta?: object) => void} callback
     * @returns {() => void} Unsubscribe
     */
    onSync(callback) {
        this._syncCallbacks.add(callback);
        return () => this._syncCallbacks.delete(callback);
    }

    /**
     * Set throttle interval for sync callbacks.
     * @param {number} ms
     */
    setThrottle(ms) {
        this._throttleMs = Math.max(0, ms);
    }

    /**
     * Generate enhanced React hook code with bidirectional sync.
     * @returns {string} JavaScript source code for enhanced useVib3() hook
     */
    generateReactHook() {
        return `
import { useState, useEffect, useRef, useCallback } from 'react';
import { VIB3Engine } from '@vib3code/sdk';

export function useVib3(containerId = 'vib3-container', initialOptions = {}) {
    const engineRef = useRef(null);
    const [parameters, setParameters] = useState({});
    const [initialized, setInitialized] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const engine = new VIB3Engine(initialOptions);
        engineRef.current = engine;

        engine.initialize(containerId)
            .then((ok) => {
                if (ok) {
                    setInitialized(true);
                    setParameters(engine.getAllParameters());

                    // Premium: subscribe to engine parameter changes
                    engine.onParameterChange((params, meta) => {
                        setParameters(prev => {
                            const changed = meta?.changed || Object.keys(params);
                            const hasChange = changed.some(k => prev[k] !== params[k]);
                            return hasChange ? { ...prev, ...params } : prev;
                        });
                    });
                } else {
                    setError(new Error('Engine initialization failed'));
                }
            })
            .catch(setError);

        return () => {
            engine.destroy();
            engineRef.current = null;
        };
    }, [containerId]);

    const setParameter = useCallback((name, value) => {
        engineRef.current?.setParameter(name, value);
    }, []);

    const switchSystem = useCallback((system) => {
        return engineRef.current?.switchSystem(system);
    }, []);

    return { engine: engineRef.current, parameters, initialized, error, setParameter, switchSystem };
}`;
    }

    /**
     * Generate enhanced Vue composable code with bidirectional sync.
     * @returns {string} JavaScript source code
     */
    generateVueComposable() {
        return `
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { VIB3Engine } from '@vib3code/sdk';

export function useVib3(containerId = 'vib3-container', initialOptions = {}) {
    const engine = ref(null);
    const parameters = reactive({});
    const initialized = ref(false);
    const error = ref(null);

    onMounted(async () => {
        const eng = new VIB3Engine(initialOptions);
        try {
            const ok = await eng.initialize(containerId);
            if (ok) {
                engine.value = eng;
                initialized.value = true;
                Object.assign(parameters, eng.getAllParameters());

                // Premium: subscribe to engine parameter changes
                eng.onParameterChange((params) => {
                    Object.assign(parameters, params);
                });
            } else {
                error.value = new Error('Engine initialization failed');
            }
        } catch (e) {
            error.value = e;
        }
    });

    onUnmounted(() => {
        engine.value?.destroy();
        engine.value = null;
    });

    function setParameter(name, value) {
        engine.value?.setParameter(name, value);
    }

    function switchSystem(system) {
        return engine.value?.switchSystem(system);
    }

    return { engine, parameters, initialized, error, setParameter, switchSystem };
}`;
    }

    /**
     * Generate enhanced Svelte store code with bidirectional sync.
     * @returns {string} JavaScript source code
     */
    generateSvelteStore() {
        return `
import { writable, derived } from 'svelte/store';
import { VIB3Engine } from '@vib3code/sdk';

export function createVib3Store(containerId = 'vib3-container', initialOptions = {}) {
    const store = writable({
        engine: null,
        parameters: {},
        initialized: false,
        error: null
    });

    async function initialize() {
        const engine = new VIB3Engine(initialOptions);
        try {
            const ok = await engine.initialize(containerId);
            if (ok) {
                store.update(s => ({
                    ...s,
                    engine,
                    initialized: true,
                    parameters: engine.getAllParameters()
                }));

                // Premium: subscribe to engine parameter changes
                engine.onParameterChange((params) => {
                    store.update(s => ({
                        ...s,
                        parameters: { ...s.parameters, ...params }
                    }));
                });
            } else {
                store.update(s => ({ ...s, error: new Error('Init failed') }));
            }
        } catch (e) {
            store.update(s => ({ ...s, error: e }));
        }
    }

    function destroy() {
        store.update(s => {
            s.engine?.destroy();
            return { engine: null, parameters: {}, initialized: false, error: null };
        });
    }

    return { subscribe: store.subscribe, initialize, destroy };
}`;
    }

    destroy() {
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
        this._syncCallbacks.clear();
        this._engine = null;
    }
}
