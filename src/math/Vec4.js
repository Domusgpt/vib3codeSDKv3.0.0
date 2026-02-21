/**
 * Vec4 - 4D Vector Class
 *
 * Represents a point or direction in 4-dimensional space.
 * Uses plain numeric properties internally for minimal allocation overhead.
 * GPU-compatible Float32Array created on demand via toFloat32Array().
 *
 * @example
 * const v = new Vec4(1, 2, 3, 0.5);
 * const normalized = v.normalize();
 * const dot = v.dot(other);
 */

export class Vec4 {
    /**
     * Create a new 4D vector
     * @param {number} x - X component
     * @param {number} y - Y component
     * @param {number} z - Z component
     * @param {number} w - W component (4th dimension)
     */
    constructor(x = 0, y = 0, z = 0, w = 0) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
    }

    // Property accessors
    get x() { return this._x; }
    set x(v) { this._x = v; }

    get y() { return this._y; }
    set y(v) { this._y = v; }

    get z() { return this._z; }
    set z(v) { this._z = v; }

    get w() { return this._w; }
    set w(v) { this._w = v; }

    /**
     * Backward-compatible .data getter.
     * Returns a Float32Array snapshot of current values.
     * Note: writes to the returned array do NOT propagate back.
     * Use setComponent(index, value) for index-based mutation.
     * @returns {Float32Array}
     */
    get data() {
        return new Float32Array([this._x, this._y, this._z, this._w]);
    }

    /**
     * Set a component by index (0=x, 1=y, 2=z, 3=w)
     * @param {number} index - Component index (0-3)
     * @param {number} value - New value
     * @returns {Vec4} this
     */
    setComponent(index, value) {
        switch (index) {
            case 0: this._x = value; break;
            case 1: this._y = value; break;
            case 2: this._z = value; break;
            case 3: this._w = value; break;
        }
        return this;
    }

    /**
     * Get a component by index (0=x, 1=y, 2=z, 3=w)
     * @param {number} index - Component index (0-3)
     * @returns {number}
     */
    getComponent(index) {
        switch (index) {
            case 0: return this._x;
            case 1: return this._y;
            case 2: return this._z;
            case 3: return this._w;
            default: return 0;
        }
    }

    /**
     * Create a Vec4 from an array
     * @param {number[]|Float32Array} arr - Array with at least 4 elements
     * @returns {Vec4}
     */
    static fromArray(arr) {
        return new Vec4(arr[0] || 0, arr[1] || 0, arr[2] || 0, arr[3] || 0);
    }

    /**
     * Create a copy of this vector
     * @returns {Vec4}
     */
    clone() {
        return new Vec4(this._x, this._y, this._z, this._w);
    }

    /**
     * Copy values from another vector
     * @param {Vec4} v - Source vector
     * @returns {Vec4} this (for chaining)
     */
    copy(v) {
        this._x = v._x;
        this._y = v._y;
        this._z = v._z;
        this._w = v._w;
        return this;
    }

    /**
     * Set all components
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} w
     * @returns {Vec4} this
     */
    set(x, y, z, w) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
        return this;
    }

    /**
     * Add another vector (immutable unless target provided)
     * @param {Vec4} v
     * @param {Vec4} [target=null] - Optional target vector
     * @returns {Vec4} New vector or target
     */
    add(v, target = null) {
        if (target) {
            target._x = this._x + v._x;
            target._y = this._y + v._y;
            target._z = this._z + v._z;
            target._w = this._w + v._w;
            return target;
        }
        return new Vec4(
            this._x + v._x,
            this._y + v._y,
            this._z + v._z,
            this._w + v._w
        );
    }

    /**
     * Add another vector in place (mutable)
     * @param {Vec4} v
     * @returns {Vec4} this
     */
    addInPlace(v) {
        this._x += v._x;
        this._y += v._y;
        this._z += v._z;
        this._w += v._w;
        return this;
    }

    /**
     * Subtract another vector (immutable unless target provided)
     * @param {Vec4} v
     * @param {Vec4} [target=null] - Optional target vector
     * @returns {Vec4} New vector or target
     */
    sub(v, target = null) {
        if (target) {
            target._x = this._x - v._x;
            target._y = this._y - v._y;
            target._z = this._z - v._z;
            target._w = this._w - v._w;
            return target;
        }
        return new Vec4(
            this._x - v._x,
            this._y - v._y,
            this._z - v._z,
            this._w - v._w
        );
    }

    /**
     * Subtract another vector in place (mutable)
     * @param {Vec4} v
     * @returns {Vec4} this
     */
    subInPlace(v) {
        this._x -= v._x;
        this._y -= v._y;
        this._z -= v._z;
        this._w -= v._w;
        return this;
    }

    /**
     * Multiply by scalar (immutable unless target provided)
     * @param {number} s
     * @param {Vec4} [target=null] - Optional target vector
     * @returns {Vec4} New vector or target
     */
    scale(s, target = null) {
        if (target) {
            target._x = this._x * s;
            target._y = this._y * s;
            target._z = this._z * s;
            target._w = this._w * s;
            return target;
        }
        return new Vec4(
            this._x * s,
            this._y * s,
            this._z * s,
            this._w * s
        );
    }

    /**
     * Multiply by scalar in place (mutable)
     * @param {number} s
     * @returns {Vec4} this
     */
    scaleInPlace(s) {
        this._x *= s;
        this._y *= s;
        this._z *= s;
        this._w *= s;
        return this;
    }

    /**
     * Component-wise multiply (Hadamard product)
     * @param {Vec4} v
     * @param {Vec4} [target=null] - Optional target vector
     * @returns {Vec4} New vector or target
     */
    multiply(v, target = null) {
        if (target) {
            target._x = this._x * v._x;
            target._y = this._y * v._y;
            target._z = this._z * v._z;
            target._w = this._w * v._w;
            return target;
        }
        return new Vec4(
            this._x * v._x,
            this._y * v._y,
            this._z * v._z,
            this._w * v._w
        );
    }

    /**
     * Negate vector (immutable unless target provided)
     * @param {Vec4} [target=null] - Optional target vector
     * @returns {Vec4} New vector or target
     */
    negate(target = null) {
        if (target) {
            target._x = -this._x;
            target._y = -this._y;
            target._z = -this._z;
            target._w = -this._w;
            return target;
        }
        return new Vec4(-this._x, -this._y, -this._z, -this._w);
    }

    /**
     * Negate vector in place (mutable)
     * @returns {Vec4} this
     */
    negateInPlace() {
        this._x = -this._x;
        this._y = -this._y;
        this._z = -this._z;
        this._w = -this._w;
        return this;
    }

    /**
     * Dot product with another vector
     * @param {Vec4} v
     * @returns {number}
     */
    dot(v) {
        return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
    }

    /**
     * Squared length of vector (faster than length())
     * @returns {number}
     */
    lengthSquared() {
        return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
    }

    /**
     * Length (magnitude) of vector
     * @returns {number}
     */
    length() {
        return Math.sqrt(this.lengthSquared());
    }

    /**
     * Distance to another vector
     * @param {Vec4} v
     * @returns {number}
     */
    distanceTo(v) {
        return this.sub(v).length();
    }

    /**
     * Squared distance to another vector (faster)
     * @param {Vec4} v
     * @returns {number}
     */
    distanceToSquared(v) {
        return this.sub(v).lengthSquared();
    }

    /**
     * Normalize to unit length (immutable unless target provided)
     * @param {Vec4} [target=null] - Optional target vector
     * @returns {Vec4} New normalized vector or target
     */
    normalize(target = null) {
        const len = this.length();
        if (len < 1e-10) {
            if (target) {
                target._x = 0;
                target._y = 0;
                target._z = 0;
                target._w = 0;
                return target;
            }
            return new Vec4(0, 0, 0, 0);
        }
        return this.scale(1 / len, target);
    }

    /**
     * Normalize in place (mutable)
     * @returns {Vec4} this
     */
    normalizeInPlace() {
        const len = this.length();
        if (len < 1e-10) {
            this.set(0, 0, 0, 0);
            return this;
        }
        return this.scaleInPlace(1 / len);
    }

    /**
     * Linear interpolation to another vector
     * @param {Vec4} v - Target vector
     * @param {number} t - Interpolation factor (0-1)
     * @param {Vec4} [target=null] - Optional target vector
     * @returns {Vec4} New interpolated vector or target
     */
    lerp(v, t, target = null) {
        if (target) {
            target._x = this._x + (v._x - this._x) * t;
            target._y = this._y + (v._y - this._y) * t;
            target._z = this._z + (v._z - this._z) * t;
            target._w = this._w + (v._w - this._w) * t;
            return target;
        }
        return new Vec4(
            this._x + (v._x - this._x) * t,
            this._y + (v._y - this._y) * t,
            this._z + (v._z - this._z) * t,
            this._w + (v._w - this._w) * t
        );
    }

    /**
     * Check if approximately equal to another vector
     * @param {Vec4} v
     * @param {number} epsilon - Tolerance (default 1e-6)
     * @returns {boolean}
     */
    equals(v, epsilon = 1e-6) {
        return (
            Math.abs(this._x - v._x) < epsilon &&
            Math.abs(this._y - v._y) < epsilon &&
            Math.abs(this._z - v._z) < epsilon &&
            Math.abs(this._w - v._w) < epsilon
        );
    }

    /**
     * Check if zero vector
     * @param {number} epsilon
     * @returns {boolean}
     */
    isZero(epsilon = 1e-10) {
        return this.lengthSquared() < epsilon * epsilon;
    }

    /**
     * Project 4D point to 3D using perspective projection
     * Projects from 4D to 3D by dividing by (d - w)
     * @param {number|object} d - Distance parameter (usually 2-5) or options object
     * @param {object|Vec4} [options] - Projection options or target vector
     * @param {Vec4} [target] - Target vector to store result
     * @returns {Vec4} Projected point (w component is 0)
     */
    projectPerspective(d = 2, options = {}, target = null) {
        if (typeof d === 'object') {
            // usage: projectPerspective({ distance: 2, ... }, target?)
            if (options instanceof Vec4) {
                target = options;
            }
            options = d;
            d = options.distance ?? options.d ?? 2;
        } else {
            // usage: projectPerspective(d, options?, target?)
            // usage: projectPerspective(d, target?)
            if (options instanceof Vec4) {
                target = options;
                options = {};
            }
        }

        options = options || {};

        const epsilon = options.epsilon ?? 1e-5;
        const denom = d - this._w;
        const clamped = Math.abs(denom) < epsilon ? (denom >= 0 ? epsilon : -epsilon) : denom;
        const scale = 1 / clamped;

        if (target) {
            target._x = this._x * scale;
            target._y = this._y * scale;
            target._z = this._z * scale;
            target._w = 0;
            return target;
        }

        return new Vec4(this._x * scale, this._y * scale, this._z * scale, 0);
    }

    /**
     * Project 4D point to 3D using stereographic projection
     * Maps 4D hypersphere to 3D space
     * @param {object|Vec4} [options] - Projection options or target vector
     * @param {Vec4} [target] - Target vector to store result
     * @returns {Vec4} Projected point (w component is 0)
     */
    projectStereographic(options = {}, target = null) {
        if (options instanceof Vec4) {
            target = options;
            options = {};
        }

        options = options || {};

        const epsilon = options.epsilon ?? 1e-5;
        const denom = 1 - this._w;
        const clamped = Math.abs(denom) < epsilon ? (denom >= 0 ? epsilon : -epsilon) : denom;
        const scale = 1 / clamped;

        if (target) {
            target._x = this._x * scale;
            target._y = this._y * scale;
            target._z = this._z * scale;
            target._w = 0;
            return target;
        }

        return new Vec4(this._x * scale, this._y * scale, this._z * scale, 0);
    }

    /**
     * Project 4D point to 3D using orthographic projection
     * Simply drops the W component
     * @param {Vec4} [target=null] - Optional target vector
     * @returns {Vec4} Projected point (w component is 0) or target
     */
    projectOrthographic(target = null) {
        if (target) {
            target._x = this._x;
            target._y = this._y;
            target._z = this._z;
            target._w = 0;
            return target;
        }
        return new Vec4(this._x, this._y, this._z, 0);
    }

    /**
     * Convert to array
     * @returns {number[]}
     */
    toArray() {
        return [this._x, this._y, this._z, this._w];
    }

    /**
     * Convert to Float32Array (for GPU upload)
     * @returns {Float32Array}
     */
    toFloat32Array() {
        return new Float32Array([this._x, this._y, this._z, this._w]);
    }

    /**
     * Get XYZ components as a 3D array
     * @returns {number[]}
     */
    toArray3() {
        return [this._x, this._y, this._z];
    }

    /**
     * String representation
     * @param {number} precision - Decimal places
     * @returns {string}
     */
    toString(precision = 3) {
        return `Vec4(${this._x.toFixed(precision)}, ${this._y.toFixed(precision)}, ${this._z.toFixed(precision)}, ${this._w.toFixed(precision)})`;
    }

    /**
     * JSON representation
     * @returns {object}
     */
    toJSON() {
        return { x: this._x, y: this._y, z: this._z, w: this._w };
    }

    // Static factory methods for common vectors

    /** Zero vector */
    static zero() {
        return new Vec4(0, 0, 0, 0);
    }

    /** Unit vector along X axis */
    static unitX() {
        return new Vec4(1, 0, 0, 0);
    }

    /** Unit vector along Y axis */
    static unitY() {
        return new Vec4(0, 1, 0, 0);
    }

    /** Unit vector along Z axis */
    static unitZ() {
        return new Vec4(0, 0, 1, 0);
    }

    /** Unit vector along W axis */
    static unitW() {
        return new Vec4(0, 0, 0, 1);
    }

    /** Vector with all ones */
    static one() {
        return new Vec4(1, 1, 1, 1);
    }

    /**
     * Create random unit vector on 4D hypersphere
     * Uses Gaussian distribution for uniform distribution on sphere
     * @returns {Vec4}
     */
    static randomUnit() {
        // Box-Muller transform for Gaussian random numbers
        const u1 = Math.random();
        const u2 = Math.random();
        const u3 = Math.random();
        const u4 = Math.random();

        const r1 = Math.sqrt(-2 * Math.log(u1));
        const r2 = Math.sqrt(-2 * Math.log(u3));

        const x = r1 * Math.cos(2 * Math.PI * u2);
        const y = r1 * Math.sin(2 * Math.PI * u2);
        const z = r2 * Math.cos(2 * Math.PI * u4);
        const w = r2 * Math.sin(2 * Math.PI * u4);

        return new Vec4(x, y, z, w).normalizeInPlace();
    }

    /**
     * Create random vector with components in [0, 1]
     * @returns {Vec4}
     */
    static random() {
        return new Vec4(
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random()
        );
    }

    /**
     * Create random vector with components in [-1, 1]
     * @returns {Vec4}
     */
    static randomSigned() {
        return new Vec4(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        );
    }
}

export default Vec4;
