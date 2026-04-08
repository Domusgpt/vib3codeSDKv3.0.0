import { Mat4x4 } from '../src/math/Mat4x4.js';
import { Rotor4D } from '../src/math/Rotor4D.js';

let failed = false;

try {
    const m = new Mat4x4();
    if (!m.isIdentity()) {
        console.error("Mat4x4.isIdentity() failed for new Mat4x4()");
        failed = true;
    }

    m.set(0, 0, 0); // Change top-left element to 0
    if (m.isIdentity()) {
        console.error("Mat4x4.isIdentity() failed for modified Mat4x4");
        failed = true;
    }

    const r = new Rotor4D();
    if (!r.isIdentity()) {
        console.error("Rotor4D.isIdentity() failed for new Rotor4D()");
        failed = true;
    }

    r.s = 0; // Change scalar component
    if (r.isIdentity()) {
        console.error("Rotor4D.isIdentity() failed for modified Rotor4D");
        failed = true;
    }

    if (Mat4x4.IDENTITY === undefined) {
         console.error("Mat4x4.IDENTITY is undefined");
         failed = true;
    }

    if (Rotor4D.IDENTITY === undefined) {
         console.error("Rotor4D.IDENTITY is undefined");
         failed = true;
    }

    if (!failed) {
        console.log("All verifications passed!");
    } else {
        process.exit(1);
    }
} catch (e) {
    console.error("Verification crashed:", e);
    process.exit(1);
}
