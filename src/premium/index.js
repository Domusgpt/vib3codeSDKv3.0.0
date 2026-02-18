/**
 * VIB3+ Premium SDK — Entry Point
 * One-function activation: enablePremium(engine, options) → premium context
 *
 * @module @vib3code/premium
 */

import { ShaderParameterSurface } from './ShaderParameterSurface.js';
import { RotationLockSystem } from './RotationLockSystem.js';
import { LayerGeometryMixer } from './LayerGeometryMixer.js';
import { VisualEventSystem } from './VisualEventSystem.js';
import { CSSBridge } from './CSSBridge.js';
import { ChoreographyExtensions } from './ChoreographyExtensions.js';
import { FrameworkSync } from './FrameworkSync.js';
import { PremiumMCPServer } from './mcp/PremiumMCPServer.js';

const FEATURE_MODULES = {
    shaderSurface: 'ShaderParameterSurface',
    rotationLock: 'RotationLockSystem',
    layerGeometry: 'LayerGeometryMixer',
    events: 'VisualEventSystem',
    cssBridge: 'CSSBridge',
    choreography: 'ChoreographyExtensions',
    frameworkSync: 'FrameworkSync',
    mcp: 'PremiumMCPServer'
};

/**
 * Enable premium features on a VIB3Engine instance.
 *
 * @param {import('../core/VIB3Engine.js').VIB3Engine} engine - The VIB3Engine to extend
 * @param {object} [options={}]
 * @param {string} [options.licenseKey] - Premium license key
 * @param {string[]} [options.features=['all']] - Which features to enable
 * @param {object} [options.baseMCPServer] - The free SDK's MCPServer instance (for MCP wrapping)
 * @returns {PremiumContext} Premium context with all enabled modules
 */
export function enablePremium(engine, options = {}) {
    if (!engine) {
        throw new Error('enablePremium() requires a VIB3Engine instance');
    }

    const licenseKey = options.licenseKey || '';
    const features = options.features || ['all'];
    const enableAll = features.includes('all');

    // Validate license key
    const licensed = validateLicenseKey(licenseKey);

    // Build the premium context object
    const premium = {
        _engine: engine,
        _licensed: licensed,
        _licenseKey: licenseKey,
        _modules: {},

        /** Check if this premium instance is licensed */
        isLicensed() {
            return this._licensed;
        },

        /** Get the license key */
        getLicenseKey() {
            return this._licenseKey;
        },

        /** Get list of enabled feature names */
        getEnabledFeatures() {
            return Object.keys(this._modules);
        },

        /** Destroy all premium modules and clean up */
        destroy() {
            for (const mod of Object.values(this._modules)) {
                if (mod && typeof mod.destroy === 'function') {
                    mod.destroy();
                }
            }
            this._modules = {};
            this._engine = null;
            this._licensed = false;
        }
    };

    // Each module is individually try/caught so one broken module doesn't
    // prevent the rest from loading. Failed modules log a warning and are
    // left as undefined on the premium context — callers should use
    // optional chaining (premium.shaderSurface?.setParameters()).

    // Module 1: ShaderParameterSurface
    if (enableAll || features.includes('shaderSurface')) {
        try {
            const shaderSurface = new ShaderParameterSurface(engine);
            premium.shaderSurface = shaderSurface;
            premium._modules.shaderSurface = shaderSurface;
        } catch (e) {
            console.warn('[VIB3+ Premium] ShaderParameterSurface failed to initialize:', e.message);
        }
    }

    // Module 2: RotationLockSystem
    if (enableAll || features.includes('rotationLock')) {
        try {
            const rotationLock = new RotationLockSystem(engine);
            premium.rotationLock = rotationLock;
            premium._modules.rotationLock = rotationLock;
        } catch (e) {
            console.warn('[VIB3+ Premium] RotationLockSystem failed to initialize:', e.message);
        }
    }

    // Module 3: LayerGeometryMixer
    if (enableAll || features.includes('layerGeometry')) {
        try {
            const layerGeometry = new LayerGeometryMixer(engine);
            premium.layerGeometry = layerGeometry;
            premium._modules.layerGeometry = layerGeometry;
        } catch (e) {
            console.warn('[VIB3+ Premium] LayerGeometryMixer failed to initialize:', e.message);
        }
    }

    // Module 4: VisualEventSystem
    if (enableAll || features.includes('events')) {
        try {
            const events = new VisualEventSystem(engine, premium);
            premium.events = events;
            premium._modules.events = events;
        } catch (e) {
            console.warn('[VIB3+ Premium] VisualEventSystem failed to initialize:', e.message);
        }
    }

    // Module 5: CSSBridge
    if (enableAll || features.includes('cssBridge')) {
        try {
            const cssBridge = new CSSBridge(engine);
            premium.cssBridge = cssBridge;
            premium._modules.cssBridge = cssBridge;
        } catch (e) {
            console.warn('[VIB3+ Premium] CSSBridge failed to initialize:', e.message);
        }
    }

    // Module 6: ChoreographyExtensions
    if (enableAll || features.includes('choreography')) {
        try {
            const choreography = new ChoreographyExtensions(engine, premium);
            premium.choreography = choreography;
            premium._modules.choreography = choreography;
        } catch (e) {
            console.warn('[VIB3+ Premium] ChoreographyExtensions failed to initialize:', e.message);
        }
    }

    // Module 7: FrameworkSync
    if (enableAll || features.includes('frameworkSync')) {
        try {
            const frameworkSync = new FrameworkSync(engine);
            premium.frameworkSync = frameworkSync;
            premium._modules.frameworkSync = frameworkSync;
        } catch (e) {
            console.warn('[VIB3+ Premium] FrameworkSync failed to initialize:', e.message);
        }
    }

    // Module 8: PremiumMCPServer
    if (enableAll || features.includes('mcp')) {
        try {
            const mcp = new PremiumMCPServer(premium, options.baseMCPServer);
            premium.mcp = mcp;
            premium._modules.mcp = mcp;
        } catch (e) {
            console.warn('[VIB3+ Premium] PremiumMCPServer failed to initialize:', e.message);
        }
    }

    // Register as a plugin on the engine
    if (typeof engine.registerPlugin === 'function') {
        engine.registerPlugin({
            name: '@vib3code/premium',
            attach(_engine) { /* already attached above */ },
            destroy() { premium.destroy(); }
        });
    }

    return premium;
}

/**
 * Validate a license key.
 * In production, this would check against a server or local signature.
 * For now: any non-empty key is valid (allows dev/testing).
 *
 * @param {string} key
 * @returns {boolean}
 */
function validateLicenseKey(key) {
    if (!key || typeof key !== 'string') return false;
    // Minimum key length of 8 characters
    if (key.length < 8) return false;
    return true;
}

// Re-export all modules for direct access
export { ShaderParameterSurface } from './ShaderParameterSurface.js';
export { RotationLockSystem } from './RotationLockSystem.js';
export { LayerGeometryMixer } from './LayerGeometryMixer.js';
export { VisualEventSystem } from './VisualEventSystem.js';
export { CSSBridge } from './CSSBridge.js';
export { ChoreographyExtensions } from './ChoreographyExtensions.js';
export { FrameworkSync } from './FrameworkSync.js';
export { PremiumMCPServer } from './mcp/PremiumMCPServer.js';
export { premiumToolDefinitions } from './mcp/premium-tools.js';
