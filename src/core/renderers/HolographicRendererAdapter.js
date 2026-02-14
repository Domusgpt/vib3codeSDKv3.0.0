import { RendererContract } from '../RendererContracts.js';
import { RealHolographicSystem } from '../../holograms/RealHolographicSystem.js';

export class HolographicRendererAdapter extends RendererContract {
    constructor(system = new RealHolographicSystem({ autoStart: false })) {
        super();
        this.system = system;
    }

    init(context = {}) {
        return this.system.init ? this.system.init(context) : true;
    }

    resize(width, height, pixelRatio = 1) {
        if (this.system.resize) {
            this.system.resize(width, height, pixelRatio);
        }
    }

    render(frameState) {
        if (this.system.render) {
            this.system.render(frameState);
        }
    }

    setActive(active) {
        this.system.setActive(active);
    }

    dispose() {
        this.system.dispose();
    }
}
