/**
 * VisualEventSystem — Premium Module 4
 * Threshold-based triggers that fire discrete state changes.
 * "When X happens, DO Y" — events, not continuous mappings.
 *
 * @module @vib3code/premium/VisualEventSystem
 */

const VALID_CONDITIONS = ['exceeds', 'drops_below', 'crosses', 'equals'];
const VALID_ACTION_TYPES = ['layer_profile', 'color_preset', 'set_parameters', 'transition', 'custom'];

export class VisualEventSystem {
    /**
     * @param {import('../core/VIB3Engine.js').VIB3Engine} engine
     * @param {object} [premium] - Premium context (for accessing other modules)
     */
    constructor(engine, premium) {
        this._engine = engine;
        this._premium = premium;
        this._triggers = new Map();       // id → TriggerConfig
        this._cooldowns = new Map();      // id → timestamp of last fire
        this._activeTimers = new Map();   // id → { timer, revertAction }
        this._listeners = new Map();      // eventName → Set of callbacks
        this._previousValues = new Map(); // source → previous value
        this._enabled = true;
        this._unsubscribe = null;
        this._rafId = null;
        this._sceneTriggerIds = new Set();

        this._startPolling();
    }

    /**
     * Add a trigger.
     * @param {string} id - Unique trigger identifier
     * @param {object} config - TriggerConfig
     */
    addTrigger(id, config) {
        this._validateConfig(config);
        this._triggers.set(id, {
            ...config,
            cooldown: config.cooldown ?? 1000
        });
    }

    /**
     * Remove a trigger.
     * @param {string} id
     */
    removeTrigger(id) {
        this._triggers.delete(id);
        this._cooldowns.delete(id);
        this._sceneTriggerIds.delete(id);
        const timer = this._activeTimers.get(id);
        if (timer) {
            clearTimeout(timer.timer);
            this._activeTimers.delete(id);
        }
    }

    /**
     * List all triggers.
     * @returns {object[]}
     */
    listTriggers() {
        const result = [];
        for (const [id, config] of this._triggers) {
            result.push({ id, ...config });
        }
        return result;
    }

    /**
     * Emit a custom event (for external code to trigger actions).
     * @param {string} eventName
     * @param {*} [data]
     */
    emit(eventName, data) {
        // Set custom event value for trigger evaluation
        this._previousValues.set(`custom.${eventName}`, data !== undefined ? data : 1);

        // Notify direct listeners
        const listeners = this._listeners.get(eventName);
        if (listeners) {
            for (const cb of listeners) {
                try { cb(data); } catch (_) { /* listener error */ }
            }
        }
    }

    /**
     * Subscribe to trigger fire events.
     * @param {string} eventName
     * @param {Function} callback
     * @returns {() => void} Unsubscribe function
     */
    on(eventName, callback) {
        if (!this._listeners.has(eventName)) {
            this._listeners.set(eventName, new Set());
        }
        this._listeners.get(eventName).add(callback);
        return () => this._listeners.get(eventName)?.delete(callback);
    }

    /**
     * Enable/disable the event system.
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this._enabled = enabled;
    }

    /**
     * Clear all triggers registered by scene changes.
     */
    clearSceneTriggers() {
        for (const id of this._sceneTriggerIds) {
            this.removeTrigger(id);
        }
        this._sceneTriggerIds.clear();
    }

    /**
     * Add a trigger tagged as a scene trigger (auto-cleared on scene change).
     * @param {string} id
     * @param {object} config
     */
    addSceneTrigger(id, config) {
        this.addTrigger(id, config);
        this._sceneTriggerIds.add(id);
    }

    /** Start the polling loop */
    _startPolling() {
        // Subscribe to parameter changes
        if (this._engine.onParameterChange) {
            this._unsubscribe = this._engine.onParameterChange((params) => {
                if (!this._enabled) return;
                this._evaluateTriggers(params);
            });
        }
    }

    /** Evaluate all triggers against current values */
    _evaluateTriggers(params) {
        const now = Date.now();

        for (const [id, config] of this._triggers) {
            // Check cooldown
            const lastFired = this._cooldowns.get(id) || 0;
            if (now - lastFired < config.cooldown) continue;

            // Get current value for the source
            const currentValue = this._getSourceValue(config.source, params);
            if (currentValue === null) continue;

            const previousValue = this._previousValues.get(config.source);
            this._previousValues.set(config.source, currentValue);

            // Evaluate condition
            let triggered = false;
            switch (config.condition) {
                case 'exceeds':
                    triggered = currentValue > config.threshold &&
                        (previousValue === undefined || previousValue <= config.threshold);
                    break;
                case 'drops_below':
                    triggered = currentValue < config.threshold &&
                        (previousValue === undefined || previousValue >= config.threshold);
                    break;
                case 'crosses':
                    if (previousValue !== undefined) {
                        triggered = (previousValue < config.threshold && currentValue >= config.threshold) ||
                            (previousValue >= config.threshold && currentValue < config.threshold);
                    }
                    break;
                case 'equals':
                    triggered = Math.abs(currentValue - config.threshold) < 0.01;
                    break;
            }

            if (triggered) {
                this._cooldowns.set(id, now);
                this._fireAction(id, config);
            }
        }
    }

    /** Get value for a source path */
    _getSourceValue(source, params) {
        if (source.startsWith('parameter.')) {
            const paramName = source.slice(10);
            return params[paramName] ?? null;
        }
        if (source.startsWith('audio.')) {
            const band = source.slice(6);
            return params[band] ?? (typeof window !== 'undefined' && window.audioReactive?.[band]) ?? null;
        }
        if (source.startsWith('custom.')) {
            return this._previousValues.get(source) ?? null;
        }
        return null;
    }

    /** Execute an action */
    _fireAction(id, config) {
        const action = config.action;
        if (!action) return;

        // Notify listeners
        const listeners = this._listeners.get(id);
        if (listeners) {
            for (const cb of listeners) {
                try { cb(config); } catch (_) { /* listener error */ }
            }
        }

        // Execute action
        switch (action.type) {
            case 'layer_profile':
                if (this._engine.activeSystem?.loadRelationshipProfile) {
                    this._engine.activeSystem.loadRelationshipProfile(action.value);
                }
                break;

            case 'color_preset':
                if (this._premium?.choreography?._colorPresets) {
                    this._premium.choreography._colorPresets.applyPreset(action.value, action.transition);
                }
                break;

            case 'set_parameters':
                if (action.transition && this._premium?.choreography?._transitionAnimator) {
                    this._premium.choreography._transitionAnimator.transition(
                        action.value,
                        action.duration || 500,
                        action.easing || 'easeOut'
                    );
                } else {
                    this._engine.setParameters(action.value);
                }
                break;

            case 'transition':
                if (this._premium?.choreography?._transitionAnimator) {
                    this._premium.choreography._transitionAnimator.transition(
                        action.value,
                        action.duration || 500,
                        action.easing || 'easeOut'
                    );
                } else {
                    this._engine.setParameters(action.value);
                }
                break;

            case 'custom':
                if (typeof action.value === 'function') {
                    action.value(this._engine, this._premium);
                }
                break;
        }

        // Set up revert timer if duration is specified
        if (action.duration && action.revertTo !== undefined) {
            const existingTimer = this._activeTimers.get(id);
            if (existingTimer) clearTimeout(existingTimer.timer);

            const timer = setTimeout(() => {
                this._revertAction(action);
                this._activeTimers.delete(id);
            }, action.duration);

            this._activeTimers.set(id, { timer, revertAction: action.revertTo });
        }
    }

    /** Revert an action */
    _revertAction(action) {
        switch (action.type) {
            case 'layer_profile':
                if (this._engine.activeSystem?.loadRelationshipProfile) {
                    this._engine.activeSystem.loadRelationshipProfile(action.revertTo);
                }
                break;
            case 'set_parameters':
            case 'transition':
                if (typeof action.revertTo === 'object') {
                    this._engine.setParameters(action.revertTo);
                }
                break;
        }
    }

    _validateConfig(config) {
        if (!config.source || typeof config.source !== 'string') {
            throw new Error('Trigger source is required');
        }
        if (!VALID_CONDITIONS.includes(config.condition)) {
            throw new Error(`Invalid condition: ${config.condition}. Must be one of: ${VALID_CONDITIONS.join(', ')}`);
        }
        if (typeof config.threshold !== 'number') {
            throw new Error('Trigger threshold must be a number');
        }
        if (!config.action || typeof config.action !== 'object') {
            throw new Error('Trigger action is required');
        }
        if (!VALID_ACTION_TYPES.includes(config.action.type)) {
            throw new Error(`Invalid action type: ${config.action.type}. Must be one of: ${VALID_ACTION_TYPES.join(', ')}`);
        }
    }

    destroy() {
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        for (const { timer } of this._activeTimers.values()) {
            clearTimeout(timer);
        }
        this._activeTimers.clear();
        this._triggers.clear();
        this._cooldowns.clear();
        this._listeners.clear();
        this._previousValues.clear();
        this._engine = null;
        this._premium = null;
    }
}
