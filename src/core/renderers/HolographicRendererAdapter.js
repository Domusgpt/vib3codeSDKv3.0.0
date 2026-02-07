import { RendererContract } from '../RendererContracts.js';
import { RealHolographicSystem } from '../../holograms/RealHolographicSystem.js';

export class HolographicRendererAdapter extends RendererContract {
    constructor(system = new RealHolographicSystem({ autoStart: false })) {
        super();
        this.system = system;
    }

    init() {
        return true;
    }

    resize() {
        // Visualizers handle their own resizing.
    }

    render() {
        this.system.renderFrame();
    }

    setActive(active) {
        this.system.setActive(active);
    }

    dispose() {
        this.system.setActive(false);
    }
}
