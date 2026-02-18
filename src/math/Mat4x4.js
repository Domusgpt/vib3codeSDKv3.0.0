/**
 * Mat4x4 - 4x4 Matrix Class
 *
 * Column-major layout for WebGL/GPU compatibility.
 * Used for 4D transformations including all 6 rotation planes.
 *
 * Memory layout (column-major):
 * | m[0]  m[4]  m[8]   m[12] |
 * | m[1]  m[5]  m[9]   m[13] |
 * | m[2]  m[6]  m[10]  m[14] |
 * | m[3]  m[7]  m[11]  m[15] |
 *
 * @example
 * const rotXW = Mat4x4.rotationXW(Math.PI / 4);
 * const transformed = rotXW.multiplyVec4(vec4);
 */

import { Vec4 } from './Vec4.js';

export class Mat4x4 {
    /**
     * Create a new 4x4 matrix
     * Default is identity matrix
     * @param {Float32Array|number[]} [elements] - 16 elements in column-major order
     */
    constructor(elements = null) {
        this.data = new Float32Array(16);

        if (elements) {
            if (elements.length !== 16) {
                throw new Error('Mat4x4 requires exactly 16 elements');
            }
            this.data.set(elements);
        } else {
            // Default to identity
            this.data[0] = 1;
            this.data[5] = 1;
            this.data[10] = 1;
            this.data[15] = 1;
        }
    }

    /**
     * Create identity matrix
     * @returns {Mat4x4}
     */
    static identity() {
        return new Mat4x4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    /**
     * Get read-only identity matrix
     * @returns {Mat4x4}
     */
    static get IDENTITY() {
        if (!this._IDENTITY) {
            this._IDENTITY = Mat4x4.identity();
            Object.freeze(this._IDENTITY);
            // Cannot freeze Float32Array in some environments/strict modes directly
            // but we freeze the wrapper object.
        }
        return this._IDENTITY;
    }

    /**
     * Create zero matrix
     * @returns {Mat4x4}
     */
    static zero() {
        return new Mat4x4(new Float32Array(16));
    }

    /**
     * Get read-only zero matrix
     * @returns {Mat4x4}
     */
    static get ZERO() {
        if (!this._ZERO) {
            this._ZERO = Mat4x4.zero();
            Object.freeze(this._ZERO);
        }
        return this._ZERO;
    }

    /**
     * Clone this matrix
     * @returns {Mat4x4}
     */
    clone() {
        return new Mat4x4(this.data);
    }

    /**
     * Copy from another matrix
     * @param {Mat4x4} m
     * @returns {Mat4x4} this
     */
    copy(m) {
        this.data.set(m.data);
        return this;
    }

    /**
     * Get element at row, column
     * @param {number} row - 0-3
     * @param {number} col - 0-3
     * @returns {number}
     */
    get(row, col) {
        return this.data[col * 4 + row];
    }

    /**
     * Set element at row, column
     * @param {number} row - 0-3
     * @param {number} col - 0-3
     * @param {number} value
     * @returns {Mat4x4} this
     */
    set(row, col, value) {
        this.data[col * 4 + row] = value;
        return this;
    }

    /**
     * Get column as Vec4
     * @param {number} col - 0-3
     * @returns {Vec4}
     */
    getColumn(col) {
        const i = col * 4;
        return new Vec4(this.data[i], this.data[i + 1], this.data[i + 2], this.data[i + 3]);
    }

    /**
     * Set column from Vec4
     * @param {number} col - 0-3
     * @param {Vec4} v
     * @returns {Mat4x4} this
     */
    setColumn(col, v) {
        const i = col * 4;
        this.data[i] = v.x;
        this.data[i + 1] = v.y;
        this.data[i + 2] = v.z;
        this.data[i + 3] = v.w;
        return this;
    }

    /**
     * Get row as Vec4
     * @param {number} row - 0-3
     * @returns {Vec4}
     */
    getRow(row) {
        return new Vec4(
            this.data[row],
            this.data[row + 4],
            this.data[row + 8],
            this.data[row + 12]
        );
    }

    /**
     * Set row from Vec4
     * @param {number} row - 0-3
     * @param {Vec4} v
     * @returns {Mat4x4} this
     */
    setRow(row, v) {
        this.data[row] = v.x;
        this.data[row + 4] = v.y;
        this.data[row + 8] = v.z;
        this.data[row + 12] = v.w;
        return this;
    }

    /**
     * Multiply two matrices
     * @param {Mat4x4} m - Right operand
     * @param {Mat4x4} [target] - Optional target to write result to
     * @returns {Mat4x4} Result matrix (target or new)
     */
    multiply(m, target = null) {
        const out = target || new Mat4x4();
        const r = out.data;
        const a = this.data;
        const b = m.data;

        // Cache inputs in local variables to support aliasing (out === a or out === b)
        const a00 = a[0], a01 = a[4], a02 = a[8], a03 = a[12];
        const a10 = a[1], a11 = a[5], a12 = a[9], a13 = a[13];
        const a20 = a[2], a21 = a[6], a22 = a[10], a23 = a[14];
        const a30 = a[3], a31 = a[7], a32 = a[11], a33 = a[15];

        const b00 = b[0], b01 = b[4], b02 = b[8], b03 = b[12];
        const b10 = b[1], b11 = b[5], b12 = b[9], b13 = b[13];
        const b20 = b[2], b21 = b[6], b22 = b[10], b23 = b[14];
        const b30 = b[3], b31 = b[7], b32 = b[11], b33 = b[15];

        r[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
        r[1] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
        r[2] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
        r[3] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;

        r[4] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
        r[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
        r[6] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
        r[7] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;

        r[8] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
        r[9] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
        r[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
        r[11] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;

        r[12] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;
        r[13] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;
        r[14] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;
        r[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;

        return out;
    }

    /**
     * Multiply in place (this = this * m)
     * @param {Mat4x4} m
     * @returns {Mat4x4} this
     */
    multiplyInPlace(m) {
        const a = this.data;
        const b = m.data;

        // Cache values to avoid aliasing issues and repeated array access
        const a00 = a[0], a01 = a[4], a02 = a[8], a03 = a[12];
        const a10 = a[1], a11 = a[5], a12 = a[9], a13 = a[13];
        const a20 = a[2], a21 = a[6], a22 = a[10], a23 = a[14];
        const a30 = a[3], a31 = a[7], a32 = a[11], a33 = a[15];

        const b00 = b[0], b01 = b[4], b02 = b[8], b03 = b[12];
        const b10 = b[1], b11 = b[5], b12 = b[9], b13 = b[13];
        const b20 = b[2], b21 = b[6], b22 = b[10], b23 = b[14];
        const b30 = b[3], b31 = b[7], b32 = b[11], b33 = b[15];

        // Column 0
        a[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
        a[1] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
        a[2] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
        a[3] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;

        // Column 1
        a[4] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
        a[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
        a[6] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
        a[7] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;

        // Column 2
        a[8] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
        a[9] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
        a[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
        a[11] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;

        // Column 3
        a[12] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;
        a[13] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;
        a[14] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;
        a[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;

        return this;
    }

    /**
     * Pre-multiply (this = m * this)
     * @param {Mat4x4} m
     * @returns {Mat4x4} this
     */
    preMultiplyInPlace(m) {
        const result = m.multiply(this);
        this.data.set(result.data);
        return this;
    }

    /**
     * Transform a Vec4 by this matrix
     * @param {Vec4} v
     * @param {Vec4} [target] - Optional target to write result to
     * @returns {Vec4} Transformed vector (target or new)
     */
    multiplyVec4(v, target = null) {
        const m = this.data;
        const x = v.x, y = v.y, z = v.z, w = v.w;

        if (target) {
            target.set(
                m[0] * x + m[4] * y + m[8] * z + m[12] * w,
                m[1] * x + m[5] * y + m[9] * z + m[13] * w,
                m[2] * x + m[6] * y + m[10] * z + m[14] * w,
                m[3] * x + m[7] * y + m[11] * z + m[15] * w
            );
            return target;
        }

        return new Vec4(
            m[0] * x + m[4] * y + m[8] * z + m[12] * w,
            m[1] * x + m[5] * y + m[9] * z + m[13] * w,
            m[2] * x + m[6] * y + m[10] * z + m[14] * w,
            m[3] * x + m[7] * y + m[11] * z + m[15] * w
        );
    }

    /**
     * Transform array of Vec4s by this matrix
     * @param {Vec4[]} vectors
     * @returns {Vec4[]} Transformed vectors
     */
    multiplyVec4Array(vectors) {
        return vectors.map(v => this.multiplyVec4(v));
    }

    /**
     * Transform a Float32Array of packed vec4s (x,y,z,w,x,y,z,w,...)
     * @param {Float32Array} packed - Input packed vectors
     * @param {Float32Array} [output] - Optional output buffer
     * @returns {Float32Array} Transformed packed vectors
     */
    multiplyPackedVec4(packed, output = null) {
        const count = packed.length / 4;
        const result = output || new Float32Array(packed.length);
        const m = this.data;

        for (let i = 0; i < count; i++) {
            const offset = i * 4;
            const x = packed[offset];
            const y = packed[offset + 1];
            const z = packed[offset + 2];
            const w = packed[offset + 3];

            result[offset] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
            result[offset + 1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
            result[offset + 2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
            result[offset + 3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
        }

        return result;
    }

    /**
     * Add another matrix
     * @param {Mat4x4} m
     * @param {Mat4x4} [target]
     * @returns {Mat4x4} Result matrix
     */
    add(m, target = null) {
        const out = target || new Mat4x4();
        for (let i = 0; i < 16; i++) {
            out.data[i] = this.data[i] + m.data[i];
        }
        return out;
    }

    /**
     * Multiply by scalar
     * @param {number} s
     * @param {Mat4x4} [target]
     * @returns {Mat4x4} Result matrix
     */
    scale(s, target = null) {
        const out = target || new Mat4x4();
        for (let i = 0; i < 16; i++) {
            out.data[i] = this.data[i] * s;
        }
        return out;
    }

    /**
     * Transpose matrix
     * @returns {Mat4x4} New transposed matrix
     */
    transpose() {
        const m = this.data;
        return new Mat4x4([
            m[0], m[4], m[8], m[12],
            m[1], m[5], m[9], m[13],
            m[2], m[6], m[10], m[14],
            m[3], m[7], m[11], m[15]
        ]);
    }

    /**
     * Transpose in place
     * @returns {Mat4x4} this
     */
    transposeInPlace() {
        const m = this.data;
        let tmp;

        tmp = m[1]; m[1] = m[4]; m[4] = tmp;
        tmp = m[2]; m[2] = m[8]; m[8] = tmp;
        tmp = m[3]; m[3] = m[12]; m[12] = tmp;
        tmp = m[6]; m[6] = m[9]; m[9] = tmp;
        tmp = m[7]; m[7] = m[13]; m[13] = tmp;
        tmp = m[11]; m[11] = m[14]; m[14] = tmp;

        return this;
    }

    /**
     * Calculate determinant
     * @returns {number}
     */
    determinant() {
        const m = this.data;

        const a00 = m[0], a01 = m[4], a02 = m[8], a03 = m[12];
        const a10 = m[1], a11 = m[5], a12 = m[9], a13 = m[13];
        const a20 = m[2], a21 = m[6], a22 = m[10], a23 = m[14];
        const a30 = m[3], a31 = m[7], a32 = m[11], a33 = m[15];

        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;

        return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    }

    /**
     * Calculate inverse matrix
     * @param {Mat4x4} [target] - Optional target to write result to
     * @returns {Mat4x4|null} Inverse matrix or null if singular
     */
    inverse(target = null) {
        const out = target || new Mat4x4();
        const m = this.data;
        const inv = out.data;

        // Cache values if target is this (aliasing)
        let m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15;
        if (out === this) {
            m0=m[0]; m1=m[1]; m2=m[2]; m3=m[3];
            m4=m[4]; m5=m[5]; m6=m[6]; m7=m[7];
            m8=m[8]; m9=m[9]; m10=m[10]; m11=m[11];
            m12=m[12]; m13=m[13]; m14=m[14]; m15=m[15];
            // Use local vars for calculation
        } else {
             // Direct access is safe
             m0=m[0]; m1=m[1]; m2=m[2]; m3=m[3];
             m4=m[4]; m5=m[5]; m6=m[6]; m7=m[7];
             m8=m[8]; m9=m[9]; m10=m[10]; m11=m[11];
             m12=m[12]; m13=m[13]; m14=m[14]; m15=m[15];
        }

        inv[0] = m5 * m10 * m15 - m5 * m11 * m14 - m9 * m6 * m15 +
            m9 * m7 * m14 + m13 * m6 * m11 - m13 * m7 * m10;

        inv[4] = -m4 * m10 * m15 + m4 * m11 * m14 + m8 * m6 * m15 -
            m8 * m7 * m14 - m12 * m6 * m11 + m12 * m7 * m10;

        inv[8] = m4 * m9 * m15 - m4 * m11 * m13 - m8 * m5 * m15 +
            m8 * m7 * m13 + m12 * m5 * m11 - m12 * m7 * m9;

        inv[12] = -m4 * m9 * m14 + m4 * m10 * m13 + m8 * m5 * m14 -
            m8 * m6 * m13 - m12 * m5 * m10 + m12 * m6 * m9;

        inv[1] = -m1 * m10 * m15 + m1 * m11 * m14 + m9 * m2 * m15 -
            m9 * m3 * m14 - m13 * m2 * m11 + m13 * m3 * m10;

        inv[5] = m0 * m10 * m15 - m0 * m11 * m14 - m8 * m2 * m15 +
            m8 * m3 * m14 + m12 * m2 * m11 - m12 * m3 * m10;

        inv[9] = -m0 * m9 * m15 + m0 * m11 * m13 + m8 * m1 * m15 -
            m8 * m3 * m13 - m12 * m1 * m11 + m12 * m3 * m9;

        inv[13] = m0 * m9 * m14 - m0 * m10 * m13 - m8 * m1 * m14 +
            m8 * m2 * m13 + m12 * m1 * m10 - m12 * m2 * m9;

        inv[2] = m1 * m6 * m15 - m1 * m7 * m14 - m5 * m2 * m15 +
            m5 * m3 * m14 + m13 * m2 * m7 - m13 * m3 * m6;

        inv[6] = -m0 * m6 * m15 + m0 * m7 * m14 + m4 * m2 * m15 -
            m4 * m3 * m14 - m12 * m2 * m7 + m12 * m3 * m6;

        inv[10] = m0 * m5 * m15 - m0 * m7 * m13 - m4 * m1 * m15 +
            m4 * m3 * m13 + m12 * m1 * m7 - m12 * m3 * m5;

        inv[14] = -m0 * m5 * m14 + m0 * m6 * m13 + m4 * m1 * m14 -
            m4 * m2 * m13 - m12 * m1 * m6 + m12 * m2 * m5;

        inv[3] = -m1 * m6 * m11 + m1 * m7 * m10 + m5 * m2 * m11 -
            m5 * m3 * m10 - m9 * m2 * m7 + m9 * m3 * m6;

        inv[7] = m0 * m6 * m11 - m0 * m7 * m10 - m4 * m2 * m11 +
            m4 * m3 * m10 + m8 * m2 * m7 - m8 * m3 * m6;

        inv[11] = -m0 * m5 * m11 + m0 * m7 * m9 + m4 * m1 * m11 -
            m4 * m3 * m9 - m8 * m1 * m7 + m8 * m3 * m5;

        inv[15] = m0 * m5 * m10 - m0 * m6 * m9 - m4 * m1 * m10 +
            m4 * m2 * m9 + m8 * m1 * m6 - m8 * m2 * m5;

        const det = m0 * inv[0] + m1 * inv[4] + m2 * inv[8] + m3 * inv[12];

        if (Math.abs(det) < 1e-10) {
            return null; // Singular matrix
        }

        const invDet = 1 / det;
        for (let i = 0; i < 16; i++) {
            inv[i] *= invDet;
        }

        return out;
    }

    /**
     * Check if approximately equal to another matrix
     * @param {Mat4x4} m
     * @param {number} epsilon
     * @returns {boolean}
     */
    equals(m, epsilon = 1e-6) {
        for (let i = 0; i < 16; i++) {
            if (Math.abs(this.data[i] - m.data[i]) > epsilon) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if this is identity matrix
     * @param {number} epsilon
     * @returns {boolean}
     */
    isIdentity(epsilon = 1e-6) {
        return this.equals(Mat4x4.identity(), epsilon);
    }

    /**
     * Check if orthogonal (rotation matrix)
     * @param {number} epsilon
     * @returns {boolean}
     */
    isOrthogonal(epsilon = 1e-6) {
        const product = this.multiply(this.transpose());
        return product.isIdentity(epsilon);
    }

    /**
     * Get the Float32Array for GPU upload
     * @returns {Float32Array}
     */
    toFloat32Array() {
        return new Float32Array(this.data);
    }

    /**
     * Convert to 2D array (row-major for readability)
     * @returns {number[][]}
     */
    toArray2D() {
        return [
            [this.data[0], this.data[4], this.data[8], this.data[12]],
            [this.data[1], this.data[5], this.data[9], this.data[13]],
            [this.data[2], this.data[6], this.data[10], this.data[14]],
            [this.data[3], this.data[7], this.data[11], this.data[15]]
        ];
    }

    /**
     * String representation
     * @param {number} precision
     * @returns {string}
     */
    toString(precision = 3) {
        const rows = this.toArray2D();
        return rows.map(row =>
            '| ' + row.map(v => v.toFixed(precision).padStart(8)).join(' ') + ' |'
        ).join('\n');
    }

    /**
     * JSON representation
     * @returns {object}
     */
    toJSON() {
        return { data: Array.from(this.data), columnMajor: true };
    }

    /**
     * Create from JSON
     * @param {object} json
     * @returns {Mat4x4}
     */
    static fromJSON(json) {
        return new Mat4x4(json.data);
    }

    // ========== IN-PLACE ROTATIONS ==========

    /**
     * Rotate in XY plane in place
     * @param {number} angle
     * @returns {Mat4x4} this
     */
    rotateXY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const m = this.data;

        for (let i = 0; i < 4; i++) {
            const a0 = m[i];      // Col 0
            const a1 = m[i + 4];  // Col 1
            m[i]     = a0 * c + a1 * s;
            m[i + 4] = -a0 * s + a1 * c;
        }
        return this;
    }

    /**
     * Rotate in XZ plane in place
     * @param {number} angle
     * @returns {Mat4x4} this
     */
    rotateXZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const m = this.data;

        for (let i = 0; i < 4; i++) {
            const a0 = m[i];      // Col 0
            const a2 = m[i + 8];  // Col 2
            m[i]     = a0 * c - a2 * s;
            m[i + 8] = a0 * s + a2 * c;
        }
        return this;
    }

    /**
     * Rotate in YZ plane in place
     * @param {number} angle
     * @returns {Mat4x4} this
     */
    rotateYZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const m = this.data;

        for (let i = 0; i < 4; i++) {
            const a1 = m[i + 4];  // Col 1
            const a2 = m[i + 8];  // Col 2
            m[i + 4] = a1 * c + a2 * s;
            m[i + 8] = -a1 * s + a2 * c;
        }
        return this;
    }

    /**
     * Rotate in XW plane in place
     * @param {number} angle
     * @returns {Mat4x4} this
     */
    rotateXW(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const m = this.data;

        for (let i = 0; i < 4; i++) {
            const a0 = m[i];       // Col 0
            const a3 = m[i + 12];  // Col 3
            m[i]      = a0 * c + a3 * s;
            m[i + 12] = -a0 * s + a3 * c;
        }
        return this;
    }

    /**
     * Rotate in YW plane in place
     * @param {number} angle
     * @returns {Mat4x4} this
     */
    rotateYW(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const m = this.data;

        for (let i = 0; i < 4; i++) {
            const a1 = m[i + 4];   // Col 1
            const a3 = m[i + 12];  // Col 3
            m[i + 4]  = a1 * c + a3 * s;
            m[i + 12] = -a1 * s + a3 * c;
        }
        return this;
    }

    /**
     * Rotate in ZW plane in place
     * @param {number} angle
     * @returns {Mat4x4} this
     */
    rotateZW(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const m = this.data;

        for (let i = 0; i < 4; i++) {
            const a2 = m[i + 8];   // Col 2
            const a3 = m[i + 12];  // Col 3
            m[i + 8]  = a2 * c + a3 * s;
            m[i + 12] = -a2 * s + a3 * c;
        }
        return this;
    }

    // ========== ROTATION MATRICES FOR ALL 6 PLANES ==========

    /**
     * Create XY plane rotation matrix (standard Z-axis rotation in 3D)
     * @param {number} angle - Rotation angle in radians
     * @returns {Mat4x4}
     */
    static rotationXY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Mat4x4([
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    /**
     * Create XZ plane rotation matrix (standard Y-axis rotation in 3D)
     * @param {number} angle - Rotation angle in radians
     * @returns {Mat4x4}
     */
    static rotationXZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Mat4x4([
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        ]);
    }

    /**
     * Create YZ plane rotation matrix (standard X-axis rotation in 3D)
     * @param {number} angle - Rotation angle in radians
     * @returns {Mat4x4}
     */
    static rotationYZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Mat4x4([
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        ]);
    }

    /**
     * Create XW plane rotation matrix (4D hyperspace rotation)
     * Creates "inside-out" effect when w approaches viewer
     * @param {number} angle - Rotation angle in radians
     * @returns {Mat4x4}
     */
    static rotationXW(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Mat4x4([
            c, 0, 0, s,
            0, 1, 0, 0,
            0, 0, 1, 0,
            -s, 0, 0, c
        ]);
    }

    /**
     * Create YW plane rotation matrix (4D hyperspace rotation)
     * @param {number} angle - Rotation angle in radians
     * @returns {Mat4x4}
     */
    static rotationYW(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Mat4x4([
            1, 0, 0, 0,
            0, c, 0, s,
            0, 0, 1, 0,
            0, -s, 0, c
        ]);
    }

    /**
     * Create ZW plane rotation matrix (4D hyperspace rotation)
     * @param {number} angle - Rotation angle in radians
     * @returns {Mat4x4}
     */
    static rotationZW(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Mat4x4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, c, s,
            0, 0, -s, c
        ]);
    }

    /**
     * Create rotation matrix from plane name and angle
     * @param {string} plane - One of 'XY', 'XZ', 'YZ', 'XW', 'YW', 'ZW'
     * @param {number} angle - Rotation angle in radians
     * @returns {Mat4x4}
     */
    static rotation(plane, angle) {
        switch (plane.toUpperCase()) {
            case 'XY': return Mat4x4.rotationXY(angle);
            case 'XZ': return Mat4x4.rotationXZ(angle);
            case 'YZ': return Mat4x4.rotationYZ(angle);
            case 'XW': return Mat4x4.rotationXW(angle);
            case 'YW': return Mat4x4.rotationYW(angle);
            case 'ZW': return Mat4x4.rotationZW(angle);
            default:
                throw new Error(`Invalid rotation plane: ${plane}`);
        }
    }

    /**
     * Create combined rotation matrix from all 6 angles
     * Order: XY, XZ, YZ, XW, YW, ZW
     *
     * @param {object} angles - Rotation angles
     * @param {number} [angles.xy=0] - XY plane rotation
     * @param {number} [angles.xz=0] - XZ plane rotation
     * @param {number} [angles.yz=0] - YZ plane rotation
     * @param {number} [angles.xw=0] - XW plane rotation
     * @param {number} [angles.yw=0] - YW plane rotation
     * @param {number} [angles.zw=0] - ZW plane rotation
     * @returns {Mat4x4}
     */
    static rotationFromAngles(angles) {
        let result = Mat4x4.identity();

        if (angles.xy) result.rotateXY(angles.xy);
        if (angles.xz) result.rotateXZ(angles.xz);
        if (angles.yz) result.rotateYZ(angles.yz);
        if (angles.xw) result.rotateXW(angles.xw);
        if (angles.yw) result.rotateYW(angles.yw);
        if (angles.zw) result.rotateZW(angles.zw);

        return result;
    }

    /**
     * Create rotation matrix from parameter format (rot4dXY, rot4dXZ, etc.)
     * @param {object} params - Parameters object
     * @returns {Mat4x4}
     */
    static rotationFromParameters(params) {
        return Mat4x4.rotationFromAngles({
            xy: params.rot4dXY || 0,
            xz: params.rot4dXZ || 0,
            yz: params.rot4dYZ || 0,
            xw: params.rot4dXW || 0,
            yw: params.rot4dYW || 0,
            zw: params.rot4dZW || 0
        });
    }

    // ========== OTHER TRANSFORMATIONS ==========

    /**
     * Create uniform scale matrix
     * @param {number} s - Scale factor
     * @returns {Mat4x4}
     */
    static uniformScale(s) {
        return new Mat4x4([
            s, 0, 0, 0,
            0, s, 0, 0,
            0, 0, s, 0,
            0, 0, 0, s
        ]);
    }

    /**
     * Create non-uniform scale matrix
     * @param {number} sx
     * @param {number} sy
     * @param {number} sz
     * @param {number} sw
     * @returns {Mat4x4}
     */
    static scale(sx, sy, sz, sw = 1) {
        return new Mat4x4([
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, sw
        ]);
    }

    /**
     * Create translation matrix (affine, in 5D homogeneous coordinates conceptually)
     * Note: For 4D translation, we'd need 5x5 matrices
     * This creates a shear that approximates translation for small displacements
     * @param {number} tx
     * @param {number} ty
     * @param {number} tz
     * @param {number} tw
     * @returns {Mat4x4}
     */
    static translation(tx, ty, tz, tw = 0) {
        // For true 4D translation, you need 5D homogeneous coordinates
        // This is a placeholder that adds the translation to the W column
        return new Mat4x4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1 + tw
        ]);
    }
}

export default Mat4x4;
