import { EditorCommand } from "@/core/editor/editor-command-bus"
import { ToolType, EvaPersona, CanvasObject, DocumentSettings } from "@/types/eva-editor"
import {
  detectDesignArchetype,
  ReferenceSource,
  DEFAULT_REFERENCE_SOURCES,
  studyGraphicDesignStandards,
} from "./eva-research-engine"
import { buildArchitecturalDesign } from "./eva-design-architect"
import { replicateCanvasImageToVector } from "./eva-vectorizer"
import { buildLiveCommentary, getNextDynamicGreeting } from "./eva-persona-engine"
import { auditCanvas, autoRefineCanvas, CanvasVisualAudit } from "./eva-visual-critic"

export interface ParsedEvaIntent {
  rawTranscript: string
  command?: EditorCommand
  spokenResponse: string
  instantHandshake?: string
  researchPlatforms?: string[]
  actionLabel?: string
  targetTool?: ToolType
  targetCanvasPosition?: { x: number; y: number }
  requiresConfirmation?: boolean
  isArchitectural?: boolean
  visualAudit?: CanvasVisualAudit
}

const COLOR_MAP: Record<string, string> = {
  blue: "#2563eb",
  "dark blue": "#1e3a8a",
  "light blue": "#38bdf8",
  red: "#dc2626",
  green: "#16a34a",
  "transvolt green": "#548235",
  "emerald green": "#10b981",
  lime: "#84cc16",
  yellow: "#eab308",
  orange: "#f97316",
  purple: "#9333ea",
  pink: "#ec4899",
  white: "#ffffff",
  black: "#000000",
  gray: "#6b7280",
  grey: "#6b7280",
  "dark gray": "#1f2937",
  "light gray": "#e5e7eb",
  cyan: "#06b6d4",
  teal: "#14b8a6",
  gold: "#d97706",
  navy: "#0f172a",
}

export function parseEvaCommand(
  transcript: string,
  userName: string = "",
  hasSelection: boolean = false,
  persona: EvaPersona = "basic",
  canvasObjects: CanvasObject[] = [],
  settings?: DocumentSettings,
  selectedIds: string[] = [],
  connectedSources: ReferenceSource[] = DEFAULT_REFERENCE_SOURCES
): ParsedEvaIntent {
  // Strip wake-words like "Hi Eva", "Hey Eva", "Hello Eva", or "Eva"
  const stripped = transcript.replace(/^(?:hi|hey|hello)?\s*eva[,\s:]*/i, "").trim()
  const lower = (stripped || transcript).toLowerCase().trim()
  const salutation = userName ? `${userName}, ` : ""

  const defaultSettings: DocumentSettings = settings || {
    fileName: "Untitled Document",
    pageSize: "A4",
    widthMm: 297,
    heightMm: 210,
    orientation: "landscape",
    unit: "mm",
    backgroundColor: "#ffffff",
    showRulers: true,
    zoom: 1,
    panX: 0,
    panY: 0,
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1. CASUAL GREETINGS
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.match(/^(hello|hi|hey|good morning|good afternoon|namaste|salam|ram ram|pranam)/)) {
    const greeting = getNextDynamicGreeting(persona, userName)
    return {
      rawTranscript: transcript,
      spokenResponse: greeting,
      actionLabel: "Greeting User",
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1.4. IMAGE VECTORIZATION & REPLICATION (PURE CODE CONVERSION OF CANVAS IMAGES)
  // ─────────────────────────────────────────────────────────────────────────
  const isImageReplicationQuery =
    lower.includes("replica") ||
    lower.includes("vectorize") ||
    lower.includes("convert to vector") ||
    lower.includes("trace") ||
    lower.includes("image on canvas") ||
    lower.includes("kept on canvas") ||
    lower.includes("same image in vector") ||
    lower.includes("same color and style") ||
    lower.includes("replicate") ||
    lower.includes("make vector of this") ||
    lower.includes("vector of this") ||
    lower.includes("vector version of this") ||
    lower.includes("this car design") ||
    lower.includes("this car image")

  if (isImageReplicationQuery) {
    const selectedImage = canvasObjects.find((o) => selectedIds.includes(o.id) && o.type === "image")
    const targetImage = selectedImage || canvasObjects.find((o) => o.type === "image")

    if (targetImage) {
      const { objects, detectedSubject } = replicateCanvasImageToVector(targetImage, lower)

      let spoken = `Understood: Vector replica of ${detectedSubject}. Created: Multi-layer vector structure with extracted color palette on the canvas.`
      if (persona === "tapori") {
        spoken = `Samajh gayi bawa! ${detectedSubject} ka ekdum solid vector replica extracted colors ke sath canvas pe saja diya hai!`
      } else if (persona === "bihari") {
        spoken = `Samajh gaye saheb! ${detectedSubject} khatir poora shandaar vector roop canvas par saja diye hain.`
      }

      return {
        rawTranscript: transcript,
        actionLabel: `Vectorizing ${detectedSubject}`,
        instantHandshake: `Vectorizing Image...`,
        spokenResponse: spoken,
        isArchitectural: true,
        command: {
          type: "CREATE_OBJECTS" as any,
          payload: {
            objects,
            description: `Vector Replica of ${detectedSubject}`,
          },
          description: `Vector Replica of ${detectedSubject}`,
        },
      }
    } else {
      let noImgSpoken = "No image found on the canvas to replicate. Please place an image on the canvas first."
      if (persona === "tapori") noImgSpoken = "Bawa canvas pe koi image dikh nahi rahi jisko vector banau! Pehle image daal fir bol."
      if (persona === "bihari") noImgSpoken = "Saheb canvas par koi tasveer nahi mili. Kripya pehle tasveer rakhiye."
      return {
        rawTranscript: transcript,
        spokenResponse: noImgSpoken,
        actionLabel: "No Image Found",
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1.5. VISUAL SELF-CRITIQUE & CANVAS JUDGMENT (EVA INSPECTS HER WORK)
  // ─────────────────────────────────────────────────────────────────────────
  const isCritiqueQuery =
    lower.includes("how does this look") ||
    lower.includes("how is my design") ||
    lower.includes("how is the design") ||
    lower.includes("critique") ||
    lower.includes("judge") ||
    lower.includes("review design") ||
    lower.includes("review canvas") ||
    lower.includes("check alignment") ||
    lower.includes("check color") ||
    lower.includes("check contrast") ||
    lower.includes("check typography") ||
    lower.includes("what do you think") ||
    lower.includes("is everything aligned") ||
    lower.includes("analyze layout") ||
    lower.includes("inspect canvas") ||
    lower.includes("inspect design") ||
    lower.includes("give feedback") ||
    lower.includes("audit") ||
    lower.includes("kaisa lag raha") ||
    lower.includes("kaisa bana") ||
    lower.includes("dekh ke bata") ||
    lower.includes("theek baa")

  if (isCritiqueQuery) {
    const audit = auditCanvas(canvasObjects, defaultSettings, connectedSources)
    const spoken = audit.critiqueText[persona]
    return {
      rawTranscript: transcript,
      actionLabel: `Visual Self-Critique (${audit.overallScore}/100)`,
      spokenResponse: spoken,
      visualAudit: audit,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1.6. AUTO-REFINE / FIX ALIGNMENT / ENHANCE CONTRAST (EVA POLISHES CANVAS)
  // ─────────────────────────────────────────────────────────────────────────
  const isFixAlignment =
    lower.includes("fix alignment") ||
    lower.includes("auto align") ||
    lower.includes("align everything") ||
    lower.includes("center everything") ||
    lower.includes("straighten") ||
    lower.includes("make alignment proper")

  const isFixColors =
    lower.includes("fix color") ||
    lower.includes("fix colors") ||
    lower.includes("improve contrast") ||
    lower.includes("fix contrast") ||
    lower.includes("better colors") ||
    lower.includes("fix text color")

  const isFixAll =
    lower.includes("fix design") ||
    lower.includes("improve design") ||
    lower.includes("polish canvas") ||
    lower.includes("polish design") ||
    lower.includes("apply critique") ||
    lower.includes("make it look professional") ||
    lower.includes("perfect the design") ||
    lower.includes("fix everything") ||
    lower.includes("clean up the canvas")

  if (isFixAlignment || isFixColors || isFixAll) {
    const mode = isFixAlignment ? "alignment" : isFixColors ? "colors" : "all"
    const { refinedObjects, summary } = autoRefineCanvas(canvasObjects, defaultSettings, mode)

    let spoken = `I've refined your canvas layout: ${summary}. Visual hierarchy and alignment are now centered on the 8pt grid.`
    if (persona === "tapori") {
      spoken = `Bidu ek jhatke me saara lafda khatam! Alignment aur contrast ekdum kadak set kar diya hai boss, full solid look!`
    } else if (persona === "bihari") {
      spoken = `Saheb, aadesh anusar hum poora alignment aur rang ekdum barabar baitha diye hain. Ab canvas ka roop dekhiye!`
    }

    return {
      rawTranscript: transcript,
      actionLabel: `Auto-Refining (${mode.toUpperCase()})`,
      command: {
        type: "AUTO_REFINE_CANVAS",
        payload: { objects: refinedObjects, mode, summary },
        description: `Auto-refined ${mode}`,
      },
      spokenResponse: spoken,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. MODAL & STUDIO CONTROLS (EVA HAS CONTROL OVER ENTIRE APP)
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes("export") || lower.includes("download") || lower.includes("save file") || lower.includes("pdf")) {
    let spoken = "Opening the Export Document hub."
    if (persona === "tapori") spoken = "Export ka hub khol diya bawa, file download kar le!"
    if (persona === "bihari") spoken = "Export window khol diye hain saheb, PDF ya image download kar lijiye."
    return {
      rawTranscript: transcript,
      actionLabel: "Opening Export Hub",
      command: { type: "OPEN_MODAL", payload: { modal: "export" } },
      spokenResponse: spoken,
    }
  }

  if (lower.includes("all files") || lower.includes("file manager") || lower.includes("open files") || lower.includes("show files")) {
    let spoken = "Accessing your workspace files and designs."
    if (persona === "tapori") spoken = "Files modal khol diya hai bidu, saari files idhar hai!"
    if (persona === "bihari") spoken = "Pura files list khol diye hain saheb."
    return {
      rawTranscript: transcript,
      actionLabel: "Opening File Manager",
      command: { type: "OPEN_MODAL", payload: { modal: "files" } },
      spokenResponse: spoken,
    }
  }

  if (lower.includes("reference") || lower.includes("connect website") || lower.includes("pinterest") || lower.includes("behance")) {
    let spoken = "Connecting to external design discovery platforms."
    if (persona === "tapori") spoken = "Connect Website ka scene on hai bawa, reference sites jud gayi!"
    if (persona === "bihari") spoken = "Connect Website portal khol diye hain, shandaar idea milenge."
    return {
      rawTranscript: transcript,
      actionLabel: "Opening Reference Sites",
      command: { type: "OPEN_MODAL", payload: { modal: "reference" } },
      spokenResponse: spoken,
    }
  }

  if (lower.includes("knowledge") || lower.includes("tool knowledge") || lower.includes("corel") || lower.includes("figma")) {
    return {
      rawTranscript: transcript,
      actionLabel: "Opening Tool Knowledge",
      command: { type: "OPEN_MODAL", payload: { modal: "knowledge" } },
      spokenResponse: "Accessing Eva's vector tool knowledge base.",
    }
  }

  if (lower.includes("saved prompts") || lower.includes("prompt") || lower.includes("notes")) {
    return {
      rawTranscript: transcript,
      actionLabel: "Opening Saved Prompts",
      command: { type: "OPEN_MODAL", payload: { modal: "saved_prompts" } },
      spokenResponse: "Retrieved your saved prompt templates and design notes.",
    }
  }

  if (lower.includes("share") || lower.includes("share link")) {
    return {
      rawTranscript: transcript,
      actionLabel: "Opening Share Hub",
      command: { type: "OPEN_MODAL", payload: { modal: "share" } },
      spokenResponse: "Generated a secure 6-hour share link for your artwork.",
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. CANVAS ZOOM, RULERS & DOCUMENT ORIENTATION
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes("zoom in")) {
    return {
      rawTranscript: transcript,
      actionLabel: "Zooming In",
      command: { type: "ZOOM", payload: { mode: "in" } },
      spokenResponse: "Zoomed into canvas.",
    }
  }

  if (lower.includes("zoom out")) {
    return {
      rawTranscript: transcript,
      actionLabel: "Zooming Out",
      command: { type: "ZOOM", payload: { mode: "out" } },
      spokenResponse: "Zoomed out of canvas.",
    }
  }

  if (lower.includes("reset zoom") || lower.includes("fit zoom") || lower.includes("zoom 100")) {
    return {
      rawTranscript: transcript,
      actionLabel: "Resetting Zoom",
      command: { type: "ZOOM", payload: { mode: "reset" } },
      spokenResponse: "Reset zoom to 100%.",
    }
  }

  if (lower.includes("ruler") || lower.includes("rulers")) {
    const show = lower.includes("show") || lower.includes("on")
    return {
      rawTranscript: transcript,
      actionLabel: "Toggling Rulers",
      command: { type: "TOGGLE_RULERS", payload: { show } },
      spokenResponse: show ? "Displaying canvas rulers." : "Rulers hidden.",
    }
  }

  if (lower.includes("landscape")) {
    return {
      rawTranscript: transcript,
      actionLabel: "Setting Landscape",
      command: { type: "SET_ORIENTATION", payload: { orientation: "landscape" } },
      spokenResponse: "Switched document orientation to landscape.",
    }
  }

  if (lower.includes("portrait")) {
    return {
      rawTranscript: transcript,
      actionLabel: "Setting Portrait",
      command: { type: "SET_ORIENTATION", payload: { orientation: "portrait" } },
      spokenResponse: "Switched document orientation to portrait.",
    }
  }

  if (lower.includes("clear canvas") || lower.includes("delete all") || lower.includes("blank canvas") || lower.includes("remove all")) {
    let spoken = "Cleared all objects from the workspace."
    if (persona === "tapori") spoken = "Poora canvas saaf kar diya bawa, ekdum fresh scene!"
    if (persona === "bihari") spoken = "Pura screen saaf kar diye hain saheb."
    return {
      rawTranscript: transcript,
      actionLabel: "Clearing Canvas",
      command: { type: "CLEAR_CANVAS" },
      spokenResponse: spoken,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. TOOL ACTIVATION & SWITCHING
  // ─────────────────────────────────────────────────────────────────────────
  if (/\b(pen tool|vector pen|switch to pen|use pen tool|activate pen)\b/i.test(lower)) {
    return {
      rawTranscript: transcript,
      targetTool: "pen",
      actionLabel: "Activating Pen Tool",
      command: { type: "CHANGE_TOOL", payload: { tool: "pen" } },
      spokenResponse: "Switched to vector Pen Tool. Click nodes to create Bézier curves.",
    }
  }

  if (/\b(pencil tool|freehand pencil|switch to pencil|use pencil|activate pencil)\b/i.test(lower)) {
    return {
      rawTranscript: transcript,
      targetTool: "pencil",
      actionLabel: "Activating Pencil Tool",
      command: { type: "CHANGE_TOOL", payload: { tool: "pencil" } },
      spokenResponse: "Pencil tool active for freehand sketching.",
    }
  }

  if (lower.includes("eyedropper") || lower.includes("color picker")) {
    return {
      rawTranscript: transcript,
      targetTool: "eyedropper",
      actionLabel: "Activating Eyedropper",
      command: { type: "CHANGE_TOOL", payload: { tool: "eyedropper" } },
      spokenResponse: "Eyedropper tool ready. Click any pixel on canvas to sample color.",
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. OBJECT TRANSFORMATIONS (RESIZE, ROTATE, ARRANGE)
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes("rotate")) {
    const angleMatch = lower.match(/\b(\d+)\b/)
    const angle = angleMatch ? parseInt(angleMatch[1]) : 45
    return {
      rawTranscript: transcript,
      actionLabel: `Rotating ${angle}°`,
      command: { type: "ROTATE_OBJECT", payload: { angle } },
      spokenResponse: `Rotated selected element by ${angle} degrees.`,
    }
  }

  if (lower.includes("bigger") || lower.includes("scale up") || lower.includes("enlarge") || lower.includes("double size")) {
    const factor = lower.includes("double") ? 2.0 : 1.3
    return {
      rawTranscript: transcript,
      actionLabel: "Enlarging Object",
      command: { type: "RESIZE_OBJECT", payload: { factor } },
      spokenResponse: "Scaled up the selected element.",
    }
  }

  if (lower.includes("smaller") || lower.includes("scale down") || lower.includes("shrink")) {
    return {
      rawTranscript: transcript,
      actionLabel: "Shrinking Object",
      command: { type: "RESIZE_OBJECT", payload: { factor: 0.7 } },
      spokenResponse: "Scaled down the selected element.",
    }
  }

  if (lower.includes("bring to front") || lower.includes("front")) {
    return {
      rawTranscript: transcript,
      actionLabel: "Bringing to Front",
      command: { type: "BRING_TO_FRONT" },
      spokenResponse: "Moved element to top layer.",
    }
  }

  if (lower.includes("send to back") || lower.includes("back")) {
    if (!lower.includes("welcome") && !lower.includes("background")) {
      return {
        rawTranscript: transcript,
        actionLabel: "Sending to Back",
        command: { type: "SEND_TO_BACK" },
        spokenResponse: "Moved element to background layer.",
      }
    }
  }

  if (lower.includes("duplicate") || lower.includes("clone") || lower.includes("copy")) {
    return {
      rawTranscript: transcript,
      actionLabel: "Duplicating Object",
      command: { type: "DUPLICATE_OBJECT" },
      spokenResponse: "Duplicated the selected object with Smart Offset.",
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. ARCHITECTURAL / HIGH-INTELLIGENCE DESIGN ASSETS (CONNECT WEBSITE)
  // ─────────────────────────────────────────────────────────────────────────
  const archetype = detectDesignArchetype(lower)
  if (archetype) {
    const study = studyGraphicDesignStandards(archetype.label, connectedSources)
    const objects = buildArchitecturalDesign(archetype.key, 180, 110, lower)
    const audit = auditCanvas(objects, defaultSettings, connectedSources)

    let spoken = `Understood: ${archetype.label}. Created: ${archetype.designFocus} on the canvas.`
    if (persona === "tapori") {
      spoken = `Samajh gayi bawa! ${archetype.label} ko ekdum kadak ${archetype.designFocus} ke sath canvas pe saja diya hai!`
    } else if (persona === "bihari") {
      spoken = `Samajh gaye saheb! ${archetype.label} khatir shandaar ${archetype.designFocus} canvas par utaar diye hain.`
    }

    return {
      rawTranscript: transcript,
      targetTool: "frame",
      actionLabel: `Architecting ${archetype.label}`,
      instantHandshake: `Creating ${archetype.label}...`,
      spokenResponse: spoken,
      researchPlatforms: study.activeSourceNames,
      isArchitectural: true,
      visualAudit: audit,
      targetCanvasPosition: { x: 480, y: 320 },
      command: {
        type: "CREATE_OBJECTS" as any,
        payload: {
          objects,
          description: archetype.label,
        },
        description: `Created ${archetype.label}`,
      },
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. CREATE RECTANGLE / SQUARE / BOX
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes("rectangle") || lower.includes("square") || lower.includes("box")) {
    const isSquare = lower.includes("square")
    let color = "#548235"
    for (const [name, hex] of Object.entries(COLOR_MAP)) {
      if (lower.includes(name)) {
        color = hex
        break
      }
    }

    let spoken = `Sure, ${salutation}I've crafted a precision vector ${isSquare ? "square" : "rectangle"} on the canvas.`
    if (persona === "tapori") {
      spoken = `Arey bidu, ekdum mast ${isSquare ? "square" : "rectangle"} canvas pe chipka diya hai. Ek number look hai!`
    } else if (persona === "bihari") {
      spoken = `Pranam! Raua khatir badhiya ${isSquare ? "square" : "rectangle"} canvas pe saja diye hain.`
    }

    return {
      rawTranscript: transcript,
      targetTool: "rectangle",
      actionLabel: "Drawing Rectangle",
      targetCanvasPosition: { x: 380, y: 280 },
      command: {
        type: "CREATE_OBJECT",
        payload: {
          type: "rectangle",
          name: isSquare ? "Square" : "Rectangle",
          width: isSquare ? 180 : 240,
          height: 180,
          fill: color,
          stroke: "#000000",
          strokeWidth: 2,
          opacity: 1,
          cornerRadius: lower.includes("round") ? 16 : 0,
        },
      },
      spokenResponse: spoken,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 8. CREATE CIRCLE / ELLIPSE / ROUND SHAPE
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes("circle") || lower.includes("ellipse") || lower.includes("oval") || lower.includes("round shape")) {
    let color = "#3b82f6"
    for (const [name, hex] of Object.entries(COLOR_MAP)) {
      if (lower.includes(name)) {
        color = hex
        break
      }
    }

    let spoken = `Done, ${salutation}I have placed a balanced vector circle on the canvas.`
    if (persona === "tapori") {
      spoken = `Ek number bidu! Kadak circle canvas pe thok diya hai apun ne.`
    } else if (persona === "bihari") {
      spoken = `Ee dekhiye saheb, ekdum gol shandaar circle canvas par utaar diye hain.`
    }

    return {
      rawTranscript: transcript,
      targetTool: "circle",
      actionLabel: "Drawing Circle",
      targetCanvasPosition: { x: 420, y: 300 },
      command: {
        type: "CREATE_OBJECT",
        payload: {
          type: "circle",
          name: "Circle",
          width: 180,
          height: 180,
          fill: color,
          stroke: "#000000",
          strokeWidth: 2,
          opacity: 1,
        },
      },
      spokenResponse: spoken,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 9. CREATE SHAPES (STAR, TRIANGLE, ARROW, HEXAGON, DIAMOND)
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes("star") || lower.includes("triangle") || lower.includes("arrow") || lower.includes("hexagon") || lower.includes("diamond")) {
    let subtype: any = "star"
    if (lower.includes("triangle")) subtype = "triangle"
    if (lower.includes("arrow")) subtype = "arrow"
    if (lower.includes("hexagon")) subtype = "hexagon"
    if (lower.includes("diamond")) subtype = "diamond"

    return {
      rawTranscript: transcript,
      targetTool: "shape",
      actionLabel: `Drawing ${subtype}`,
      targetCanvasPosition: { x: 400, y: 290 },
      command: {
        type: "CREATE_OBJECT",
        payload: {
          type: "shape",
          subtype,
          name: subtype.charAt(0).toUpperCase() + subtype.slice(1),
          width: 180,
          height: 180,
          fill: "#eab308",
          stroke: "#000000",
          strokeWidth: 2,
          opacity: 1,
        },
      },
      spokenResponse: `Created vector ${subtype} with precise geometric nodes.`,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 10. TEXT CREATION
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes("text") || lower.includes("write") || lower.includes("title") || lower.includes("saying")) {
    let extractedText = "Transvolt Mobility"
    const match = transcript.match(/(?:saying|write|text)\s+["']?([^"']+)["']?/i)
    if (match && match[1]) {
      extractedText = match[1].replace(/saying/i, "").trim()
    } else if (lower.includes("transvolt")) {
      extractedText = "Transvolt Mobility"
    }

    return {
      rawTranscript: transcript,
      targetTool: "text",
      actionLabel: "Adding Text",
      targetCanvasPosition: { x: 340, y: 220 },
      command: {
        type: "CREATE_OBJECT",
        payload: {
          type: "text",
          name: "Text Node",
          text: extractedText,
          fontSize: 32,
          fontFamily: "Poppins",
          fontWeight: lower.includes("bold") ? "bold" : "600",
          fill: lower.includes("white") ? "#ffffff" : "#000000",
          width: 340,
          height: 60,
          textAlign: "center",
        },
      },
      spokenResponse: `Added text: "${extractedText}".`,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 11. COLOR / FILL / BACKGROUND
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes("color") || lower.includes("make it") || lower.includes("fill") || lower.includes("turn")) {
    let matchedColor: string | null = null
    let colorName = ""

    for (const [name, hex] of Object.entries(COLOR_MAP)) {
      if (lower.includes(name)) {
        matchedColor = hex
        colorName = name
        break
      }
    }

    if (lower.includes("background") || lower.includes("canvas")) {
      if (matchedColor) {
        return {
          rawTranscript: transcript,
          actionLabel: "Changing Canvas BG",
          command: {
            type: "CHANGE_BACKGROUND",
            payload: { color: matchedColor },
          },
          spokenResponse: `Workspace background updated to ${colorName}.`,
        }
      }
    }

    if (matchedColor) {
      return {
        rawTranscript: transcript,
        targetTool: "color",
        actionLabel: `Applying ${colorName}`,
        command: {
          type: "SET_FILL",
          payload: { fill: matchedColor },
        },
        spokenResponse: `Changed fill color to ${colorName}.`,
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 12. OPACITY / SHADOW / ALIGN / UNDO / REDO / DELETE
  // ─────────────────────────────────────────────────────────────────────────
  if (lower.includes("transparent") || lower.includes("opacity")) {
    const numMatch = lower.match(/\b(\d+)\b/)
    const opacityVal = numMatch ? Math.min(100, Math.max(0, parseInt(numMatch[1]))) / 100 : 0.5
    return {
      rawTranscript: transcript,
      targetTool: "transparency",
      actionLabel: `Setting Opacity to ${Math.round(opacityVal * 100)}%`,
      command: {
        type: "SET_OPACITY",
        payload: { opacity: opacityVal },
      },
      spokenResponse: `Set opacity to ${Math.round(opacityVal * 100)}%.`,
    }
  }

  if (lower.includes("shadow")) {
    const disable = lower.includes("remove") || lower.includes("off")
    return {
      rawTranscript: transcript,
      targetTool: "shadow",
      actionLabel: disable ? "Removing Shadow" : "Applying Drop Shadow",
      command: {
        type: "SET_SHADOW",
        payload: {
          shadowEnabled: !disable,
          shadowBlur: 16,
          shadowOffsetX: 6,
          shadowOffsetY: 8,
          shadowColor: "rgba(0,0,0,0.35)",
        },
      },
      spokenResponse: disable ? "Removed drop shadow." : "Applied soft elevation drop shadow.",
    }
  }

  if (lower.includes("align") || lower.includes("center")) {
    return {
      rawTranscript: transcript,
      actionLabel: "Centering Object",
      command: {
        type: "ALIGN_OBJECT",
        payload: { alignment: "center" },
      },
      spokenResponse: "Aligned element to the canvas center.",
    }
  }

  if (lower.includes("undo") || lower.includes("go back")) {
    return { rawTranscript: transcript, command: { type: "UNDO" }, spokenResponse: "Reverted your last modification." }
  }

  if (lower.includes("redo")) {
    return { rawTranscript: transcript, command: { type: "REDO" }, spokenResponse: "Redone the action." }
  }

  if (lower.includes("delete") || lower.includes("remove")) {
    return { rawTranscript: transcript, command: { type: "DELETE_OBJECT" }, spokenResponse: "Removed the selected element." }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 13. UNIVERSAL DYNAMIC CREATION (EVA CAN CREATE ANYTHING!)
  // ─────────────────────────────────────────────────────────────────────────
  // If no other rule matched, synthesize a custom concept illustration for ANY prompt!
  const customObjects = buildArchitecturalDesign("concept_synthesis", 180, 110, lower)
  const study = studyGraphicDesignStandards(stripped || transcript, connectedSources)
  const audit = auditCanvas(customObjects, defaultSettings, connectedSources)

  const subjectName = (stripped || transcript).trim()
  let spoken = `Understood: ${subjectName}. Created: Structured vector composition with balanced visual hierarchy on the canvas.`
  if (persona === "tapori") {
    spoken = `Samajh gayi bawa! ${subjectName} ko ekdum solid vector geometry aur colors ke sath canvas pe saja diya hai!`
  } else if (persona === "bihari") {
    spoken = `Samajh gaye saheb! ${subjectName} khatir shandaar vector aakar canvas par saja diye hain.`
  }

  return {
    rawTranscript: transcript,
    targetTool: "frame",
    actionLabel: `Architecting ${subjectName}`,
    instantHandshake: `Creating ${subjectName}...`,
    spokenResponse: spoken,
    researchPlatforms: study.activeSourceNames,
    isArchitectural: true,
    visualAudit: audit,
    targetCanvasPosition: { x: 480, y: 320 },
    command: {
      type: "CREATE_OBJECTS" as any,
      payload: {
        objects: customObjects,
        description: subjectName,
      },
      description: `Created ${subjectName}`,
    },
  }
}
