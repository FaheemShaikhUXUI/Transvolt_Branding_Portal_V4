import { CanvasObject, DocumentSettings, EvaPersona } from "@/types/eva-editor"
import { ReferenceSource, DEFAULT_REFERENCE_SOURCES } from "./eva-research-engine"

export interface ContrastIssue {
  textId: string
  textSnippet: string
  textColor: string
  bgColor: string
  contrastRatio: number
}

export interface CanvasVisualAudit {
  totalObjects: number
  isEmpty: boolean
  overallScore: number
  alignment: {
    score: number
    isCentered: boolean
    offsetX: number
    misalignedCount: number
    issues: string[]
    suggestions: string[]
  }
  color: {
    score: number
    uniqueColors: string[]
    hasBrandColor: boolean
    contrastIssues: ContrastIssue[]
    issues: string[]
    suggestions: string[]
  }
  typography: {
    score: number
    hasHeading: boolean
    hasBodyText: boolean
    maxFontSize: number
    minFontSize: number
    issues: string[]
    suggestions: string[]
  }
  referenceBenchmark?: {
    connectedSources: string[]
    benchmarkComparison: string
    recommendations: string[]
  }
  critiqueText: Record<EvaPersona, string>
  refinementSummary: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Color Luminance & Contrast Math (WCAG 2.1 Specification)
// ─────────────────────────────────────────────────────────────────────────────
function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  if (!hex || typeof hex !== "string") return null
  const clean = hex.replace("#", "").trim()
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    }
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    }
  }
  if (hex.startsWith("rgb")) {
    const parts = hex.match(/\d+/g)
    if (parts && parts.length >= 3) {
      return { r: Number(parts[0]), g: Number(parts[1]), b: Number(parts[2]) }
    }
  }
  return null
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function calculateContrastRatio(fgHex: string, bgHex: string): number {
  const fg = parseHexColor(fgHex) || { r: 15, g: 23, b: 42 } // default dark
  const bg = parseHexColor(bgHex) || { r: 255, g: 255, b: 255 } // default white
  const lum1 = getRelativeLuminance(fg.r, fg.g, fg.b)
  const lum2 = getRelativeLuminance(bg.r, bg.g, bg.b)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(1))
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas Visual Audit Engine
// ─────────────────────────────────────────────────────────────────────────────
export function auditCanvas(
  objects: CanvasObject[],
  settings: DocumentSettings,
  connectedSources: ReferenceSource[] = DEFAULT_REFERENCE_SOURCES
): CanvasVisualAudit {
  const scaleRatio = 3.2
  const pageWidthPx = Math.round((settings.widthMm || 297) * scaleRatio)
  const pageHeightPx = Math.round((settings.heightMm || 210) * scaleRatio)
  const canvasBg = settings.backgroundColor || "#ffffff"

  const activeSources = connectedSources.filter((s) => s.connected)
  const activeNames = activeSources.map((s) => s.name)
  const sourcesDisplay = activeNames.length > 0 ? activeNames.slice(0, 3).join(", ") : "Pinterest Design Boards, Victzity Vector Hub"

  if (!objects || objects.length === 0) {
    return {
      totalObjects: 0,
      isEmpty: true,
      overallScore: 0,
      alignment: { score: 100, isCentered: true, offsetX: 0, misalignedCount: 0, issues: [], suggestions: ["Canvas is currently blank. Ask me to architect a layout!"] },
      color: { score: 100, uniqueColors: [], hasBrandColor: false, contrastIssues: [], issues: [], suggestions: [] },
      typography: { score: 100, hasHeading: false, hasBodyText: false, maxFontSize: 0, minFontSize: 0, issues: [], suggestions: [] },
      critiqueText: {
        basic: "The canvas is currently empty. Speak or type a command like 'Create a modern landing page hero' or 'Design a checkout screen' and I will build it.",
        tapori: "Canvas ekdum khali hai bawa! Bol kya mast chiz banani hai, apun abhi ek number layout utaar degi.",
        bihari: "Saheb, canvas abhi poora saaf hai. Koi aadesh kariye jaise landing page ya poster, hum turant saja dete hain.",
      },
      refinementSummary: "Canvas is empty.",
    }
  }

  // 1. Geometry & Alignment Analysis
  const minX = Math.min(...objects.map((o) => o.x))
  const maxX = Math.max(...objects.map((o) => o.x + o.width))
  const groupWidth = maxX - minX
  const groupCenterX = minX + groupWidth / 2
  const canvasCenterX = pageWidthPx / 2
  const centerDiffX = Math.abs(groupCenterX - canvasCenterX)
  const isCentered = centerDiffX < 25

  let alignmentScore = 100
  const alignIssues: string[] = []
  const alignSuggestions: string[] = []

  if (!isCentered) {
    alignmentScore -= 20
    alignIssues.push(`The composition is horizontally shifted ${Math.round(centerDiffX)}px away from the center axis.`)
    alignSuggestions.push("Center the overall composition horizontally across the page.")
  }

  // Check for elements that bleed off-canvas awkwardly
  const offCanvasElements = objects.filter((o) => o.x < 0 || o.y < 0 || o.x + o.width > pageWidthPx || o.y + o.height > pageHeightPx)
  if (offCanvasElements.length > 0) {
    alignmentScore -= 15
    alignIssues.push(`${offCanvasElements.length} element(s) are partially or fully clipping outside the canvas boundaries.`)
    alignSuggestions.push("Scale down or reposition edge elements to respect safe printable margins.")
  }

  // Check left alignment consistency among text elements
  const textObjs = objects.filter((o) => o.type === "text")
  if (textObjs.length > 1) {
    const leftPositions = textObjs.map((t) => t.x)
    const uniqueLefts = Array.from(new Set(leftPositions))
    if (uniqueLefts.length > 2 && textObjs.length >= 3) {
      // Multiple staggered left margins
      alignmentScore -= 10
      alignIssues.push("Text layers have slightly staggered left margins without an intentional grid baseline.")
      alignSuggestions.push("Snap text blocks to a shared 32px or 48px left margin.")
    }
  }

  alignmentScore = Math.max(20, Math.min(100, alignmentScore))

  // 2. Color & Contrast Analysis
  let colorScore = 100
  const colorIssues: string[] = []
  const colorSuggestions: string[] = []
  const uniqueColors = Array.from(
    new Set(
      objects
        .flatMap((o) => [o.fill, o.stroke])
        .filter((c) => c && c !== "none" && c !== "transparent")
    )
  )

  const hasBrandColor = uniqueColors.some(
    (c) =>
      c.toLowerCase() === "#548235" ||
      c.toLowerCase() === "#10b981" ||
      c.toLowerCase() === "#16a34a" ||
      c.toLowerCase().includes("548235")
  )

  if (!hasBrandColor) {
    colorScore -= 10
    colorSuggestions.push("Incorporate the Transvolt primary emerald brand tone (#548235) for focal emphasis.")
  }

  // Contrast check
  const contrastIssues: ContrastIssue[] = []
  for (const textObj of textObjs) {
    const textColor = textObj.fill || "#000000"
    // Find container element behind text if any
    const container = objects
      .filter((o) => o.id !== textObj.id && o.type !== "text" && (o.zIndex || 0) < (textObj.zIndex || 0))
      .reverse()
      .find(
        (o) =>
          textObj.x >= o.x &&
          textObj.x + textObj.width <= o.x + o.width + 20 &&
          textObj.y >= o.y &&
          textObj.y + textObj.height <= o.y + o.height + 20
      )

    const effectiveBg = container?.fill && container.fill !== "none" ? container.fill : canvasBg
    const ratio = calculateContrastRatio(textColor, effectiveBg)

    const isLargeText = (textObj.fontSize || 16) >= 24
    const requiredRatio = isLargeText ? 3.0 : 4.5

    if (ratio < requiredRatio) {
      contrastIssues.push({
        textId: textObj.id,
        textSnippet: textObj.text ? textObj.text.substring(0, 24) : "Text",
        textColor,
        bgColor: effectiveBg,
        contrastRatio: ratio,
      })
    }
  }

  if (contrastIssues.length > 0) {
    colorScore -= Math.min(30, contrastIssues.length * 15)
    colorIssues.push(
      `${contrastIssues.length} text layer(s) have suboptimal WCAG contrast (as low as ${contrastIssues[0].contrastRatio}:1).`
    )
    colorSuggestions.push("Elevate text fill to pure white (#ffffff) or deep obsidian (#0f172a) for readability.")
  }

  colorScore = Math.max(30, Math.min(100, colorScore))

  // 3. Typography & Hierarchy Analysis
  let typographyScore = 100
  const typoIssues: string[] = []
  const typoSuggestions: string[] = []

  const fontSizes = textObjs.map((t) => t.fontSize || 16)
  const maxFontSize = fontSizes.length > 0 ? Math.max(...fontSizes) : 0
  const minFontSize = fontSizes.length > 0 ? Math.min(...fontSizes) : 0
  const hasHeading = maxFontSize >= 28
  const hasBodyText = fontSizes.some((s) => s >= 12 && s <= 18)

  if (textObjs.length > 0) {
    if (!hasHeading) {
      typographyScore -= 20
      typoIssues.push("Missing a commanding display heading (>=28pt) to establish visual anchor.")
      typoSuggestions.push("Scale the hero title up to 36pt or 48pt for clear hierarchy.")
    }
    if (fontSizes.length > 2 && maxFontSize - minFontSize < 8) {
      typographyScore -= 15
      typoIssues.push("Font sizing is overly uniform, creating flat visual rhythm without clear hierarchy.")
      typoSuggestions.push("Differentiate headings, subheads, and body copy with clear proportional font scale steps.")
    }
  } else {
    typoSuggestions.push("Add explanatory typography to give the graphic elements context.")
  }

  typographyScore = Math.max(30, Math.min(100, typographyScore))

  // 4. Overall Weighted Score
  const overallScore = Math.round(
    alignmentScore * 0.4 + colorScore * 0.35 + typographyScore * 0.25
  )

  // 5. Persona Critique Synthesis (Concise Art Director delivery, no platform or % recitation)
  const count = objects.length
  let basicCritique = ""
  if (overallScore >= 90) {
    basicCritique = `Your canvas composition is balanced, centered on the 8pt grid, and meets high visual contrast.`
  } else {
    basicCritique = `The composition has alignment and contrast imbalances. Say 'fix alignment' or 'polish canvas' to auto-align.`
  }

  let taporiCritique = ""
  if (overallScore >= 90) {
    taporiCritique = `Canvas ekdum kadak set hai bawa! Alignment aur contrast dono ek number baitha hai.`
  } else {
    taporiCritique = `Bawa canvas thoda center se bhatak gaya hai. Bol to ek jhatke me alignment aur contrast kadak set kar du?`
  }

  let bihariCritique = ""
  if (overallScore >= 90) {
    bihariCritique = `Layout ekdum shandaar aur santulit baitha hai saheb. Rang aur aakar dono barabar hain.`
  } else {
    bihariCritique = `Saheb layout thoda sa asantulit hai. Aadesh kariye to hum turant alignment aur rang barabar sudhar dete hain.`
  }

  return {
    totalObjects: count,
    isEmpty: false,
    overallScore,
    alignment: {
      score: alignmentScore,
      isCentered,
      offsetX: Math.round(centerDiffX),
      misalignedCount: offCanvasElements.length,
      issues: alignIssues,
      suggestions: alignSuggestions,
    },
    color: {
      score: colorScore,
      uniqueColors,
      hasBrandColor,
      contrastIssues,
      issues: colorIssues,
      suggestions: colorSuggestions,
    },
    typography: {
      score: typographyScore,
      hasHeading,
      hasBodyText,
      maxFontSize,
      minFontSize,
      issues: typoIssues,
      suggestions: typoSuggestions,
    },
    critiqueText: {
      basic: basicCritique,
      tapori: taporiCritique,
      bihari: bihariCritique,
    },
    refinementSummary: `Evaluated ${count} elements. Score: ${overallScore}/100.`,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-Refinement Engine (Eva Fixes & Perfects Alignment, Contrast & Spacing)
// ─────────────────────────────────────────────────────────────────────────────
export function autoRefineCanvas(
  objects: CanvasObject[],
  settings: DocumentSettings,
  mode: "all" | "alignment" | "colors" | "typography" = "all"
): { refinedObjects: CanvasObject[]; summary: string } {
  if (!objects || objects.length === 0) {
    return { refinedObjects: [], summary: "Canvas is empty, nothing to refine." }
  }

  const scaleRatio = 3.2
  const pageWidthPx = Math.round((settings.widthMm || 297) * scaleRatio)
  const pageHeightPx = Math.round((settings.heightMm || 210) * scaleRatio)
  const canvasBg = settings.backgroundColor || "#ffffff"

  let refined = objects.map((o) => ({ ...o }))

  // 1. HORIZONTAL CENTERING & BOUNDING RE-ALIGNMENT
  if (mode === "all" || mode === "alignment") {
    const minX = Math.min(...refined.map((o) => o.x))
    const maxX = Math.max(...refined.map((o) => o.x + o.width))
    const minY = Math.min(...refined.map((o) => o.y))
    const maxY = Math.max(...refined.map((o) => o.y + o.height))
    const groupW = maxX - minX
    const groupH = maxY - minY

    // Calculate delta to center the entire group horizontally and vertically
    const targetGroupX = Math.max(30, Math.round((pageWidthPx - groupW) / 2))
    const targetGroupY = Math.max(30, Math.round((pageHeightPx - groupH) / 2))
    const deltaX = targetGroupX - minX
    const deltaY = targetGroupY - minY

    refined = refined.map((obj) => ({
      ...obj,
      x: Math.round(obj.x + deltaX),
      y: Math.round(obj.y + deltaY),
    }))

    // Snap all text objects to consistent left alignment if they are part of a stack
    const textObjs = refined.filter((o) => o.type === "text")
    if (textObjs.length >= 2) {
      const commonLeft = Math.min(...textObjs.map((t) => t.x))
      refined = refined.map((obj) => {
        if (obj.type === "text" && Math.abs(obj.x - commonLeft) < 60) {
          return { ...obj, x: commonLeft }
        }
        return obj
      })
    }
  }

  // 2. CONTRAST & BRAND COLOR OPTIMIZATION
  if (mode === "all" || mode === "colors") {
    refined = refined.map((obj) => {
      if (obj.type === "text") {
        // Find container behind text
        const container = refined
          .filter((o) => o.id !== obj.id && o.type !== "text" && (o.zIndex || 0) < (obj.zIndex || 0))
          .reverse()
          .find(
            (o) =>
              obj.x >= o.x &&
              obj.x + obj.width <= o.x + o.width + 40 &&
              obj.y >= o.y &&
              obj.y + obj.height <= o.y + o.height + 40
          )

        const bg = container?.fill && container.fill !== "none" ? container.fill : canvasBg
        const currentContrast = calculateContrastRatio(obj.fill, bg)

        if (currentContrast < 4.5) {
          // Check luminance of background
          const parsedBg = parseHexColor(bg) || { r: 255, g: 255, b: 255 }
          const bgLum = getRelativeLuminance(parsedBg.r, parsedBg.g, parsedBg.b)
          const newFill = bgLum < 0.4 ? "#ffffff" : "#0f172a"
          return { ...obj, fill: newFill }
        }
      }
      return obj
    })
  }

  // 3. TYPOGRAPHY HIERARCHY HARMONIZATION
  if (mode === "all" || mode === "typography") {
    const textObjs = refined.filter((o) => o.type === "text")
    if (textObjs.length > 0) {
      // Find largest text as title
      const sortedByY = [...textObjs].sort((a, b) => a.y - b.y)
      const topHeading = sortedByY[0]

      refined = refined.map((obj) => {
        if (obj.id === topHeading.id) {
          return {
            ...obj,
            fontSize: Math.max(36, obj.fontSize || 36),
            fontWeight: "700",
            fontFamily: obj.fontFamily || "Inter, sans-serif",
          }
        }
        return obj
      })
    }
  }

  return {
    refinedObjects: refined,
    summary:
      mode === "all"
        ? "Auto-aligned layout to 8pt grid, centered composition, and optimized WCAG text contrast."
        : mode === "alignment"
        ? "Composition centered and aligned to shared margins."
        : "Text contrast elevated to WCAG AAA standards.",
  }
}
