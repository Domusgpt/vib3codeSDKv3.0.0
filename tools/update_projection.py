import re

file_path = 'src/math/Projection.js'

with open(file_path, 'r') as f:
    content = f.read()

# Replace perspective JSDoc and Implementation
perspective_old = r"""     * @param {Vec4} v - 4D point
     * @param {number} d - Distance parameter (typically 1.5-5)
     * @returns {Vec4} Projected point (w=0)
     */
    static perspective(v, d = 2, options = {}) {
        if (typeof d === 'object') {
            options = d;
            d = options.d ?? 2;
        }
        const epsilon = options.epsilon ?? DEFAULT_EPSILON;
        const denom = clampDenominator(d - v.w, epsilon);
        const scale = 1 / denom;
        return new Vec4(v.x * scale, v.y * scale, v.z * scale, 0);
    }"""

perspective_new = r"""     * @param {Vec4} v - 4D point
     * @param {number} d - Distance parameter (typically 1.5-5)
     * @param {object} [options] - Projection options
     * @param {Vec4} [target] - Optional target vector to write result to
     * @returns {Vec4} Projected point (w=0)
     */
    static perspective(v, d = 2, options = {}, target = null) {
        if (typeof d === 'object') {
            options = d;
            d = options.d ?? 2;
        }

        // Handle options overload or direct target argument
        if (!target && options && options.target) {
            target = options.target;
        }

        const epsilon = (options && options.epsilon) ?? DEFAULT_EPSILON;
        const denom = clampDenominator(d - v.w, epsilon);
        const scale = 1 / denom;

        if (target) {
            return target.set(v.x * scale, v.y * scale, v.z * scale, 0);
        }
        return new Vec4(v.x * scale, v.y * scale, v.z * scale, 0);
    }"""

if perspective_old in content:
    content = content.replace(perspective_old, perspective_new)
else:
    print("Could not find perspective implementation to replace.")
    # Attempt more robust search if exact match fails? No, simpler is safer for now.

# Replace perspectiveArray JSDoc and Implementation
perspective_array_old = r"""    /**
     * Project array of Vec4s using perspective projection
     * @param {Vec4[]} vectors
     * @param {number} d
     * @returns {Vec4[]}
     */
    static perspectiveArray(vectors, d = 2, options = {}) {
        return vectors.map(v => Projection.perspective(v, d, options));
    }"""

perspective_array_new = r"""    /**
     * Project array of Vec4s using perspective projection
     * @param {Vec4[]} vectors
     * @param {number} d
     * @param {object} [options]
     * @param {Vec4[]} [target] - Optional target array to write results to
     * @returns {Vec4[]}
     */
    static perspectiveArray(vectors, d = 2, options = {}, target = null) {
        // Handle options overload for 'd'
        if (typeof d === 'object') {
             options = d;
             d = options.d ?? 2;
        }

        if (!target) {
            return vectors.map(v => Projection.perspective(v, d, options));
        }

        const count = vectors.length;
        // Iterate and reuse
        for (let i = 0; i < count; i++) {
            const out = target[i];
            if (out) {
                Projection.perspective(vectors[i], d, options, out);
            } else {
                target[i] = Projection.perspective(vectors[i], d, options);
            }
        }

        return target;
    }"""

if perspective_array_old in content:
    content = content.replace(perspective_array_old, perspective_array_new)
else:
    print("Could not find perspectiveArray implementation to replace.")

with open(file_path, 'w') as f:
    f.write(content)

print("Updated Projection.js")
