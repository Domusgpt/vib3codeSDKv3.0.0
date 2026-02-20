/**
 * RotationLockSystem — Premium Module 2
 * Lock rotation axes at fixed values. Provides "flight mode" where
 * 3D rotations are locked while 4D rotations remain free.
 *
 * @module @vib3code/premium/RotationLockSystem
 */

const ROTATION_AXES = ['rot4dXY', 'rot4dXZ', 'rot4dYZ', 'rot4dXW', 'rot4dYW', 'rot4dZW'];
const AXES_3D = ['rot4dXY', 'rot4dXZ', 'rot4dYZ'];
const AXES_4D = ['rot4dXW', 'rot4dYW', 'rot4dZW'];

export class RotationLockSystem {
    /**
     * @param {import('../core/VIB3Engine.js').VIB3Engine} engine
     */
    constructor(engine) {
        this._engine = engine;
        this._locks = new Map(); // axisName → locked value
        this._flightMode = false;
        this._originalSetParameter = null;
        this._originalUpdateParams = null;

        this._install();
    }

    /** Install intercepts on the engine */
    _install() {
        const engine = this._engine;

        // Wrap setParameter to enforce locks
        this._originalSetParameter = engine.setParameter.bind(engine);
        engine.setParameter = (name, value) => {
            if (this._locks.has(name)) {
                return; // Axis is locked — silently ignore
            }
            this._originalSetParameter(name, value);
        };

        // Wrap updateCurrentSystemParameters to enforce locked values
        this._originalUpdateParams = engine.updateCurrentSystemParameters.bind(engine);
        engine.updateCurrentSystemParameters = () => {
            // Re-inject locked values before pushing to system
            for (const [axis, lockedValue] of this._locks) {
                engine.parameters.setParameter(axis, lockedValue);
            }
            this._originalUpdateParams();
        };
    }

    /**
     * Lock a specific rotation axis at current or specified value.
     * @param {string} axisName - One of rot4dXY, rot4dXZ, rot4dYZ, rot4dXW, rot4dYW, rot4dZW
     * @param {number} [value] - Lock value (defaults to current)
     */
    lockAxis(axisName, value) {
        if (!ROTATION_AXES.includes(axisName)) {
            throw new Error(`Invalid axis: ${axisName}. Must be one of: ${ROTATION_AXES.join(', ')}`);
        }
        const lockValue = value !== undefined ? value : this._engine.getParameter(axisName);
        this._locks.set(axisName, lockValue);
        // Immediately enforce
        this._engine.parameters.setParameter(axisName, lockValue);
        this._originalUpdateParams();
    }

    /**
     * Unlock a specific rotation axis.
     * @param {string} axisName
     */
    unlockAxis(axisName) {
        this._locks.delete(axisName);
    }

    /**
     * Enable/disable flight mode.
     * Flight mode locks all 3D rotations (XY/XZ/YZ) at current values,
     * leaving 4D rotations (XW/YW/ZW) free.
     * @param {boolean} enabled
     */
    setFlightMode(enabled) {
        this._flightMode = enabled;
        if (enabled) {
            for (const axis of AXES_3D) {
                this.lockAxis(axis);
            }
            for (const axis of AXES_4D) {
                this.unlockAxis(axis);
            }
        } else {
            for (const axis of AXES_3D) {
                this.unlockAxis(axis);
            }
        }
    }

    /**
     * Check if flight mode is active.
     * @returns {boolean}
     */
    isFlightMode() {
        return this._flightMode;
    }

    /**
     * Check if a specific axis is locked.
     * @param {string} axisName
     * @returns {boolean}
     */
    isLocked(axisName) {
        return this._locks.has(axisName);
    }

    /**
     * Get the locked value for an axis.
     * @param {string} axisName
     * @returns {number|null}
     */
    getLockedValue(axisName) {
        return this._locks.has(axisName) ? this._locks.get(axisName) : null;
    }

    /**
     * Get all locked axes.
     * @returns {string[]}
     */
    getLockedAxes() {
        return [...this._locks.keys()];
    }

    /**
     * Lock all rotation axes.
     * @param {object} [values] - Optional map of axis→value
     */
    lockAll(values) {
        for (const axis of ROTATION_AXES) {
            const val = values && values[axis] !== undefined ? values[axis] : this._engine.getParameter(axis);
            this._locks.set(axis, val);
        }
        this._originalUpdateParams();
    }

    /**
     * Unlock all rotation axes.
     */
    unlockAll() {
        this._locks.clear();
        this._flightMode = false;
    }

    /**
     * Export lock state for serialization.
     * @returns {object}
     */
    exportState() {
        return {
            locks: Object.fromEntries(this._locks),
            flightMode: this._flightMode
        };
    }

    /**
     * Import lock state.
     * @param {object} state
     */
    importState(state) {
        if (state.locks) {
            for (const [axis, value] of Object.entries(state.locks)) {
                if (ROTATION_AXES.includes(axis)) {
                    this._locks.set(axis, value);
                }
            }
        }
        if (state.flightMode !== undefined) {
            this._flightMode = state.flightMode;
        }
    }

    destroy() {
        // Restore original methods
        if (this._engine && this._originalSetParameter) {
            this._engine.setParameter = this._originalSetParameter;
        }
        if (this._engine && this._originalUpdateParams) {
            this._engine.updateCurrentSystemParameters = this._originalUpdateParams;
        }
        this._locks.clear();
        this._engine = null;
    }
}
