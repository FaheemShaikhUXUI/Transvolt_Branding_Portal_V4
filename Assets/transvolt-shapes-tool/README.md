# Transvolt Organization Chart — Shapes Tool

This is a framework-level React/Next.js TypeScript module intended to be integrated into the existing Transvolt Branding Portal. Because the original application source was not provided, this package deliberately avoids assuming your existing canvas library or persistence schema.

## Files

- `src/components/organization-chart/shapes/ShapesEditor.tsx` — standalone SVG editor, library, drawing, selection, inspector, undo/redo, connector creation, and print-to-PDF fallback.
- `registry.ts` — reusable shape registry.
- `geometry.tsx` — vector geometry renderer.
- `types.ts` — document schema.
- `index.ts` — exports.

## Use

```tsx
import { ShapesEditor } from "@/components/organization-chart/shapes";

export default function ShapesWorkspace() {
  return (
    <ShapesEditor
      onDocumentChange={(document) => {
        // Adapt to the existing chart's debounced autosave API.
        // Persist document.shapes and document.connectors with the chart record.
      }}
      onExportPdf={(document, svg) => {
        // Optional: use your existing PDF export service/library.
        // `svg` contains the editor SVG serialization.
      }}
    />
  );
}
```

If `@/` is not configured, use the relative import path.

## Integration notes — read before merging

1. **Inspect and adapt the existing editor.** Do not mount this as a second editor beside the current chart. Move/reuse its shape registry, geometry renderer, and interaction logic inside the existing canvas implementation, or use this standalone component only if the existing canvas is SVG-compatible.
2. **Persistence:** `onDocumentChange` is an adapter callback, not a database implementation. Connect it to the portal's actual chart persistence service and merge the shapes into the existing chart schema. Avoid overwriting unrelated chart data.
3. **Existing node integration:** this starter models generic shapes and generic shape-to-shape connectors. To connect shapes to existing person/department nodes, extend the endpoint schema to `{type: "shape" | "person" | "department", id: string}` and adapt anchor calculations/rendering to the existing node model.
4. **PDF:** the default uses browser print-to-PDF as a fallback. For exact page sizing, vector preservation, page tiling, and footer integration, connect `onExportPdf` to the existing PDF renderer. Do not describe the fallback as production-grade multi-page PDF export.
5. **Canvas interaction:** this is a functional starter implementation, not a drop-in patch to an unseen application. Verify zoom transforms, resize handles, and selection event routing against your existing canvas library before production.
6. Install no dependencies; the component uses React and SVG.

## Known scope boundaries

The editor includes the requested shape library and basic interactions. Before production, the integration pass should improve:
- resize handles: this starter's generic resize path is bottom-right-oriented; implement directional resize math for all eight handles;
- zoom-at-cursor and fit-to-content (the controls are basic reset/zoom);
- robust pointer handling and undo history transaction boundaries;
- connector geometry, anchors, labels, and selection editing;
- text shape-specific rendering and rotated text handling;
- chart-wide persistence, concurrency, and exact PDF pagination.

These are called out explicitly so the integration is not mistaken for a fully production-validated patch without access to the host project.
