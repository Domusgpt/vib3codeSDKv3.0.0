import { Projection } from '../../src/math/Projection.js';
import { Vec4 } from '../../src/math/Vec4.js';

function validate() {
    let success = true;

    const v1 = new Vec4(1, 2, 3, 4);
    const v2 = new Vec4(5, 6, 7, 8);
    const vectors = [v1, v2];

    // Orthographic Validation
    const orthoAlloc = Projection.orthographicArray(vectors);
    const orthoTarget = [new Vec4(), new Vec4()];
    Projection.orthographicArray(vectors, orthoTarget);

    if (orthoAlloc[0].x !== orthoTarget[0].x || orthoAlloc[0].y !== orthoTarget[0].y) {
        console.error("Orthographic target projection failed.");
        success = false;
    }

    // Stereographic Validation
    const stereoAlloc = Projection.stereographicArray(vectors);
    const stereoTarget = [new Vec4(), new Vec4()];
    Projection.stereographicArray(vectors, {}, stereoTarget);

    if (stereoAlloc[0].x !== stereoTarget[0].x || stereoAlloc[0].y !== stereoTarget[0].y) {
        console.error("Stereographic target projection failed.");
        success = false;
    }

    if (success) {
        console.log("All verifications passed.");
    }
}

validate();
