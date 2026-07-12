1. **Optimize `warpToCells` in `HypertetraCore.js`**
   - The original implementation calls `.map()` and recalculates the cell centers for *every* vertex in the loop, creating massive performance overhead in hot paths and generating garbage via `cellVerts[c].map()`.
   - Move the static cell center calculations *outside* the vertex loop to hoist invariant calculations.
   - Use a standard `for` loop to avoid `Array.map` closure allocation overhead if it applies, or at minimum hoist invariant variables. Note: returning an array populated via a standard `for` loop also provides measurable speedup.

2. **Verify Performance Improvement**
   - Use `node tests/benchmarks/hypertetra_warp_perf2.js` or similar to prove the change. (I'll run a script to see).

3. **Complete Pre-Commit Steps**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

4. **Add Journal Entry**
   - Add a critical learning about hoisting invariant geometric calculations out of vertex-processing loops to avoid O(V * C) allocations.

5. **Submit Change**
   - Create a PR prefixed with "⚡ Bolt: [performance improvement]".
