# GPU disposal patterns

This guide documents safe GPU resource disposal patterns to prevent memory leaks across rendering backends.

## Resource lifecycle checklist
1. Track GPU resources (buffers, textures, programs) with explicit IDs.
2. Register resources in a central manager so you can dispose by scope.
3. Dispose resources when:
   - a scene is torn down
   - a renderer is swapped
   - a pack export completes

## Suggested manager flow
- `registerResource(type, id, handle, bytes)`
- `releaseResource(type, id)`
- `disposeAll()` on shutdown or system change

## Guardrails
- Do not rely on GC to release GPU memory.
- Always null references after deletion to prevent re-use.
- Track memory budgets and evict least-recently-used resources when needed.
