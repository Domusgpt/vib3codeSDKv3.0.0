1. Modify `Scene4D.js` to eliminate `Vec4` allocations in tree traversals.
   - Specifically, target methods like `findNodesInSphere`, `findNearestNode`, and `raycast`.
   - In `findNodesInSphere`:
     - Instead of `node.worldPosition.sub(center).lengthSquared()`, extract components directly:
       `const wm = node.worldMatrix; const dx = wm.get(0, 3) - center._x;` ... `const dist = dx*dx + dy*dy + dz*dz + dw*dw;`
   - In `findNearestNode`:
     - Same direct component extraction from `worldMatrix` to avoid `node.worldPosition` (allocates 1 Vec4) and `.sub(point)` (allocates 1 Vec4).
   - In `raycast`:
     - Avoid `.sub()` which allocates a new Vec4. Use component-wise math.

2. Document this finding in `.jules/bolt.md`.
   - Title: 2026-07-28 - Avoid Vec4 allocations in tree traversal
   - Learning: `node.worldPosition` instantiates a new `Vec4` every time it is accessed. Combined with `.sub()`, this creates massive GC pressure during scene queries (like finding nodes in a radius).
   - Action: For hot paths like scene traversal, bypass `worldPosition` getter and extract coordinates directly from `worldMatrix` using `wm.get(i, 3)`.

3. Complete pre commit steps to make sure proper testing, verifications, reviews and reflections are done.
4. Submit the change with "⚡ Bolt: [performance improvement] Scene4D tree traversal zero-allocation".
