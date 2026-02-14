import { RendererContract } from '../RendererContracts.js';
import { FacetedSystem } from '../../faceted/FacetedSystem.js';

export class FacetedRendererAdapter extends RendererContract {
    constructor(system = new FacetedSystem()) {
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
