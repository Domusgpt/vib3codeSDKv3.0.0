Last reviewed: 2026-02-17
# Optimization Plan: Core Math Library

## 1. Add `target` Parameters for Allocation-Free Operations

**Status:** High Impact / Medium Effort
**Currently:** `Mat4x4.multiply(m)` and `Mat4x4.multiplyVec4(v)` always return a `new` instance.
**Proposed:** Add an optional `target` parameter to write the result into an existing object.

### Implementation
```javascript
// Before
multiply(m) {
    const out = new Mat4x4();
    // ... compute ...
    return out;
}

// After
multiply(m, target = null) {
    const out = target || new Mat4x4();
    // ... compute ...
    return out;
}
```

### Cascading Changes
*   **Scene Graph (`Node4D.js`):** Update `updateWorldMatrix` to reuse a cached matrix instance instead of creating a new one every frame.
*   **Physics/Animation:** Update loops to reuse vector/matrix instances.

### Watch Outs
*   **Aliasing:** If `a.multiply(b, a)` is called (writing result back to operand), ensure the implementation handles this correctly. The current `multiplyInPlace` implementation handles this by caching values in local variables before writing to the array. Ensure new methods do the same.
*   **API Consistency:** Ensure `target` is consistently the last argument or follows a predictable pattern.

## 2. Implement `Vec4` Object Pooling (or Lightweight Structure)

**Status:** High Impact / High Complexity
**Currently:** `Vec4` allocates a `Float32Array(4)` per instance. This is heavy for the JS engine and GC.
**Proposed:**
1.  **Object Pool:** `Vec4.create()` grabs from a pool, `Vec4.release(v)` returns it.
2.  **Lightweight Class:** Use plain object `{x, y, z, w}` for intermediate math, only converting to `Float32Array` when uploading to GPU.

### Implementation (Object Pool)
```javascript
class Vec4Pool {
    static get() { return pool.pop() || new Vec4(); }
    static release(v) { pool.push(v); }
}
```

### Cascading Changes
*   **Usage:** Requires changing *every* `new Vec4()` call to `Vec4Pool.get()` and ensuring `release()` is called when done.
*   **Lifecycle Management:** Extremely error-prone in JS. Missing a release leaks memory; double-release corrupts data.

### Watch Outs
*   **Manual Memory Management:** This fights against the JS GC. Only worth it in extremely hot paths (e.g., particle systems, per-vertex operations).
*   **Alternatives:** Consider simply using `Float32Array` offsets directly for bulk data (Structure of Arrays).

## 3. Cache Common Constants

**Status:** Medium Impact / Low Effort
**Currently:** `Mat4x4.identity()` creates a new matrix every call.
**Proposed:** Add static read-only constants.

### Implementation
```javascript
class Mat4x4 {
    static get IDENTITY() {
        if (!this._identity) this._identity = new Mat4x4().setIdentity();
        return this._identity;
    }
}
```

### Cascading Changes
*   **Usage:** Replace `Mat4x4.identity()` with `Mat4x4.IDENTITY` where read-only access is needed.
*   **Cloning:** If modification is needed, use `Mat4x4.IDENTITY.clone()`.

### Watch Outs
*   **Accidental Mutation:** If someone does `Mat4x4.IDENTITY.translate(...)`, it corrupts the constant for everyone.
    *   *Mitigation:* `Object.freeze()` or similar protections (though this has a perf cost). Better to rely on convention or a `ReadonlyMat4x4` type if using TS.

## 4. Optimize Scene Graph with In-Place Operations

**Status:** High Impact / Medium Effort
**Currently:** `Node4D.updateMatrix` often chains operations: `T * R * S`.
**Proposed:** Use the new `multiplyInPlace` and `rotateXX` methods.

### Implementation
```javascript
// Node4D.updateLocalMatrix
this.localMatrix.setIdentity();
this.localMatrix.translate(this.position); // Needs implementation
this.localMatrix.rotateFromAngles(this.rotation); // Needs implementation/update
this.localMatrix.scale(this.scale); // Needs implementation
```

### Cascading Changes
*   **`Mat4x4` Extensions:** Need to implement `translate(v)`, `scale(v)` as in-place methods.
*   **Logic Updates:** Rewrite `Node4D` transform logic to be imperative/stateful rather than functional/immutable.

### Watch Outs
*   **Order of Operations:** Ensure `T * R * S` vs `S * R * T` order is preserved correctly when converting to in-place calls.
*   **Dirty Flags:** Ensure `localMatrix` update only happens when `position`, `rotation`, or `scale` changes.

## 5. Bulk Operations for Geometry

**Status:** High Impact / High Complexity
**Currently:** `Mat4x4.multiplyVec4` processes one vector at a time.
**Proposed:** `Mat4x4.multiplyArray(inputArray, outputArray, count)`

### Implementation
Operate directly on flat `Float32Array` buffers.

### Cascading Changes
*   **Geometry Generators:** Update to use bulk processing.

### Watch Outs
*   **SIMD:** Browsers are starting to support SIMD via WASM. This might be a better target for heavy bulk math than optimizing JS loops.
