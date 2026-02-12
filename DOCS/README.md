# Documentation index

This folder contains active and archived project documentation.

## Archive policy

To keep links stable while allowing historical retention:

- **Active docs** live at `DOCS/<name>.md` and are referenced by default from onboarding and root docs.
- **Archived docs** live at `DOCS/archive/<name>.md` and must be labeled as archived anywhere they are linked.
- Before moving any doc to `DOCS/archive/`, update all inbound markdown links with:
  - `rg -n "<doc-name>.md" -g '*.md'`
- If a document is still intended as a primary reference, keep or restore a canonical copy at `DOCS/<name>.md` and add an archive notice in the archived variant.
- For date-stamped reports, prefer linking directly to `DOCS/archive/...` from inventories and READMEs with `(archived)` in the description.

## Link maintenance checklist

1. Search all markdown references before and after a move.
2. Update stale links in `README.md`, onboarding docs, and inventories first.
3. Confirm no stale references remain with:
   - `rg -n "DOCS/(SYSTEM_AUDIT_2026-01-30|DEV_TRACK_ANALYSIS)\.md" -g '*.md'`
