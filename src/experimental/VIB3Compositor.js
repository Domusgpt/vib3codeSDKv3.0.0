/**
 * VIB3Compositor - Visual Layering and Scene Management
 *
 * Handles the complexity of rendering multiple VIB3+ instances into a cohesive visual.
 * Manages DOM structure, Z-indexing, masking, and blend modes for "Universe" rendering.
 *
 * @experimental
 */
export class VIB3Compositor {
    constructor(containerId = 'vib3-universe') {
        this.containerId = containerId;
        this.layers = []; // Ordered list of layer configs
        this.activeInstances = new Map(); // instanceId -> DOM element

        // Ensure container exists
        if (typeof document !== 'undefined') {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = containerId;
                this.container.style.position = 'relative';
                this.container.style.width = '100vw';
                this.container.style.height = '100vh';
                this.container.style.overflow = 'hidden';
                document.body.appendChild(this.container);
            }
        }
    }

    /**
     * Register a VIB3 instance to be composited.
     * @param {string} instanceId - Unique ID for the VIB3 instance
     * @param {HTMLElement} canvasElement - The canvas element of the VIB3 instance
     * @param {object} options - Layer configuration (zIndex, blendMode, opacity)
     */
    addInstance(instanceId, canvasElement, options = {}) {
        if (this.activeInstances.has(instanceId)) {
            console.warn(`VIB3Compositor: Instance ${instanceId} already registered.`);
            return;
        }

        // Apply default styles for compositing
        canvasElement.style.position = 'absolute';
        canvasElement.style.top = '0';
        canvasElement.style.left = '0';
        canvasElement.style.width = '100%';
        canvasElement.style.height = '100%';

        // Apply options
        this.updateLayer(instanceId, options);

        this.container.appendChild(canvasElement);
        this.activeInstances.set(instanceId, canvasElement);
        this.layers.push(instanceId);

        console.log(`VIB3Compositor: Added instance ${instanceId}`);
    }

    /**
     * Remove a VIB3 instance from the compositor.
     * @param {string} instanceId
     */
    removeInstance(instanceId) {
        if (this.activeInstances.has(instanceId)) {
            const canvasElement = this.activeInstances.get(instanceId);
            if (canvasElement.parentNode) {
                canvasElement.parentNode.removeChild(canvasElement);
            }
            this.activeInstances.delete(instanceId);
            this.layers = this.layers.filter(id => id !== instanceId);
            console.log(`VIB3Compositor: Removed instance ${instanceId}`);
        }
    }

    /**
     * Update visual properties of a layer.
     * @param {string} instanceId
     * @param {object} options - { zIndex, blendMode, opacity, visible }
     */
    updateLayer(instanceId, options) {
        const canvasElement = this.activeInstances.get(instanceId);
        if (!canvasElement) return;

        if (options.zIndex !== undefined) canvasElement.style.zIndex = options.zIndex;
        if (options.blendMode !== undefined) canvasElement.style.mixBlendMode = options.blendMode;
        if (options.opacity !== undefined) canvasElement.style.opacity = options.opacity;
        if (options.visible !== undefined) canvasElement.style.display = options.visible ? 'block' : 'none';

        // Handle masking if provided (experimental CSS mask)
        if (options.maskImage) {
            canvasElement.style.webkitMaskImage = `url(${options.maskImage})`;
            canvasElement.style.maskImage = `url(${options.maskImage})`;
        }
    }

    /**
     * Reorder layers based on a list of IDs.
     * @param {string[]} order - Array of instance IDs, from bottom to top
     */
    setLayerOrder(order) {
        order.forEach((id, index) => {
            this.updateLayer(id, { zIndex: index });
        });
        this.layers = order;
    }

    /**
     * Clear all instances.
     */
    clear() {
        this.activeInstances.forEach((el, id) => {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
        this.activeInstances.clear();
        this.layers = [];
    }
}
