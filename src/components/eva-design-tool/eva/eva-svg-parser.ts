import { CanvasObject, BlendMode } from "@/types/eva-editor"

/**
 * Pure TypeScript SVG-to-Canvas Parser (Zero external AI / Zero external plugin)
 * Parses standard SVG markup into native Eva CanvasObject elements.
 */
export function parseSvgToCanvasObjects(
  svgString: string,
  baseX: number = 200,
  baseY: number = 100,
  targetWidth: number = 400
): CanvasObject[] {
  const ts = Date.now()
  const objects: CanvasObject[] = []

  if (typeof window === "undefined" || !svgString) {
    return objects
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgString, "image/svg+xml")
    const svgEl = doc.querySelector("svg")
    if (!svgEl) return objects

    // Determine native viewBox or width/height
    const viewBoxAttr = svgEl.getAttribute("viewBox")
    let vbWidth = 500
    let vbHeight = 500
    if (viewBoxAttr) {
      const parts = viewBoxAttr.split(/[\s,]+/).map(Number)
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        vbWidth = parts[2]
        vbHeight = parts[3]
      }
    } else {
      vbWidth = parseFloat(svgEl.getAttribute("width") || "500") || 500
      vbHeight = parseFloat(svgEl.getAttribute("height") || "500") || 500
    }

    const scale = targetWidth / vbWidth
    const scaledHeight = vbHeight * scale

    let zIndex = 1

    // Walk through child elements
    const elements = svgEl.querySelectorAll("path, rect, circle, ellipse, polygon, polyline")
    elements.forEach((el, index) => {
      const tagName = el.tagName.toLowerCase()
      const fill = el.getAttribute("fill") || "#000000"
      const stroke = el.getAttribute("stroke") || "none"
      const strokeWidth = parseFloat(el.getAttribute("stroke-width") || "1") || 1
      const opacity = parseFloat(el.getAttribute("opacity") || "1") || 1

      if (tagName === "rect") {
        const x = parseFloat(el.getAttribute("x") || "0") * scale + baseX
        const y = parseFloat(el.getAttribute("y") || "0") * scale + baseY
        const width = parseFloat(el.getAttribute("width") || "100") * scale
        const height = parseFloat(el.getAttribute("height") || "100") * scale
        const rx = parseFloat(el.getAttribute("rx") || "0") * scale

        objects.push({
          id: `svg-rect-${ts}-${index}`,
          name: `Vector Rect ${index + 1}`,
          type: "rectangle",
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height),
          rotation: 0,
          opacity,
          fill: fill === "none" ? "transparent" : fill,
          stroke,
          strokeWidth: Math.round(strokeWidth * scale) || 1,
          cornerRadius: Math.round(rx),
          blendMode: "normal" as BlendMode,
          zIndex: zIndex++,
        })
      } else if (tagName === "circle") {
        const cx = parseFloat(el.getAttribute("cx") || "0") * scale + baseX
        const cy = parseFloat(el.getAttribute("cy") || "0") * scale + baseY
        const r = parseFloat(el.getAttribute("r") || "50") * scale

        objects.push({
          id: `svg-circle-${ts}-${index}`,
          name: `Vector Circle ${index + 1}`,
          type: "circle",
          x: Math.round(cx - r),
          y: Math.round(cy - r),
          width: Math.round(r * 2),
          height: Math.round(r * 2),
          rotation: 0,
          opacity,
          fill: fill === "none" ? "transparent" : fill,
          stroke,
          strokeWidth: Math.round(strokeWidth * scale) || 1,
          blendMode: "normal" as BlendMode,
          zIndex: zIndex++,
        })
      } else if (tagName === "path") {
        const d = el.getAttribute("d")
        if (d) {
          objects.push({
            id: `svg-path-${ts}-${index}`,
            name: `Vector Path ${index + 1}`,
            type: "path",
            pathData: d,
            x: Math.round(baseX),
            y: Math.round(baseY),
            width: Math.round(targetWidth),
            height: Math.round(scaledHeight),
            rotation: 0,
            opacity,
            fill: fill === "none" ? "transparent" : fill,
            stroke,
            strokeWidth: Math.round(strokeWidth * scale) || 1,
            blendMode: "normal" as BlendMode,
            zIndex: zIndex++,
          })
        }
      }
    })
  } catch (err) {
    console.warn("Error parsing SVG string to CanvasObjects:", err)
  }

  return objects
}
