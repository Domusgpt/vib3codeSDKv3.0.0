/**
 * ChoreographyExtensions — Premium Module 6
 * Extends ChoreographyPlayer scenes with layer_profile, layer_overrides,
 * triggers, and rotation_locks fields.
 *
 * @module @vib3code/premium/ChoreographyExtensions
 */

export class ChoreographyExtensions {
    /**
     * @param {import('../core/VIB3Engine.js').VIB3Engine} engine
     * @param {object} premium - The premium context with all modules
     */
    constructor(engine, premium) {
        this._engine = engine;
        this._premium = premium;
        this._colorPresets = null;
        this._transitionAnimator = null;
        this._choreographyPlayer = null;
        this._originalOnSceneChange = null;
    }

    /**
     * Attach to a ChoreographyPlayer instance.
     * Wraps onSceneChange to handle premium scene fields.
     * @param {object} choreographyPlayer - ChoreographyPlayer instance
     */
    attachToPlayer(choreographyPlayer) {
        this._choreographyPlayer = choreographyPlayer;

        // Save original callback
        this._originalOnSceneChange = choreographyPlayer.onSceneChange;

        // Wrap with premium scene handling
        choreographyPlayer.onSceneChange = (index, scene) => {
            // Call original callback if it exists
            if (this._originalOnSceneChange) {
                this._originalOnSceneChange(index, scene);
            }

            // Apply premium scene fields
            this._applyPremiumScene(index, scene);
        };
    }

    /**
     * Set the ColorPresetsSystem instance for color preset actions.
     * @param {object} colorPresets
     */
    setColorPresets(colorPresets) {
        this._colorPresets = colorPresets;
    }

    /**
     * Set the TransitionAnimator instance for smooth transitions.
     * @param {object} transitionAnimator
     */
    setTransitionAnimator(transitionAnimator) {
        this._transitionAnimator = transitionAnimator;
    }

    /**
     * Create an extended choreography spec with premium fields.
     * Validates that premium fields are well-formed.
     * @param {object} spec - Extended choreography specification
     * @returns {object} Validated spec
     */
    createExtendedChoreography(spec) {
        if (!spec || !spec.scenes || !Array.isArray(spec.scenes)) {
            throw new Error('Choreography spec must have a scenes array');
        }

        // Validate premium fields in each scene
        for (let i = 0; i < spec.scenes.length; i++) {
            const scene = spec.scenes[i];

            if (scene.layer_profile && typeof scene.layer_profile !== 'string') {
                throw new Error(`Scene ${i}: layer_profile must be a string`);
            }

            if (scene.layer_overrides) {
                if (typeof scene.layer_overrides !== 'object') {
                    throw new Error(`Scene ${i}: layer_overrides must be an object`);
                }
                const validLayers = ['background', 'shadow', 'content', 'highlight', 'accent'];
                for (const layer of Object.keys(scene.layer_overrides)) {
                    if (!validLayers.includes(layer)) {
                        throw new Error(`Scene ${i}: invalid layer "${layer}" in layer_overrides`);
                    }
                }
            }

            if (scene.triggers) {
                if (!Array.isArray(scene.triggers)) {
                    throw new Error(`Scene ${i}: triggers must be an array`);
                }
            }

            if (scene.rotation_locks) {
                if (typeof scene.rotation_locks !== 'object') {
                    throw new Error(`Scene ${i}: rotation_locks must be an object`);
                }
            }
        }

        return spec;
    }

    /** Apply premium-specific scene fields when a scene changes */
    _applyPremiumScene(index, scene) {
        if (!scene) return;

        // Apply layer profile
        if (scene.layer_profile && this._engine.activeSystem?.loadRelationshipProfile) {
            this._engine.activeSystem.loadRelationshipProfile(scene.layer_profile);
        }

        // Apply layer overrides
        if (scene.layer_overrides && this._engine.activeSystem?.layerGraph) {
            for (const [layer, config] of Object.entries(scene.layer_overrides)) {
                if (config.type) {
                    this._engine.activeSystem.layerGraph.setRelationship(layer, config.type, config.config);
                }
            }
        }

        // Register scene triggers
        if (scene.triggers && this._premium?.events) {
            this._premium.events.clearSceneTriggers();
            for (let i = 0; i < scene.triggers.length; i++) {
                const trigger = scene.triggers[i];
                this._premium.events.addSceneTrigger(
                    `scene_${index}_trigger_${i}`,
                    trigger
                );
            }
        }

        // Apply rotation locks
        if (scene.rotation_locks && this._premium?.rotationLock) {
            this._premium.rotationLock.unlockAll();
            for (const [axis, value] of Object.entries(scene.rotation_locks)) {
                this._premium.rotationLock.lockAxis(axis, value);
            }
        }

        // Apply per-layer geometry
        if (scene.layer_geometries && this._premium?.layerGeometry) {
            for (const [layer, geom] of Object.entries(scene.layer_geometries)) {
                this._premium.layerGeometry.setLayerGeometry(layer, geom);
            }
        }
    }

    destroy() {
        // Restore original callback
        if (this._choreographyPlayer && this._originalOnSceneChange !== null) {
            this._choreographyPlayer.onSceneChange = this._originalOnSceneChange;
        }
        this._engine = null;
        this._premium = null;
        this._choreographyPlayer = null;
        this._colorPresets = null;
        this._transitionAnimator = null;
    }
}
