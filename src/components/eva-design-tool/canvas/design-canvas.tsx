"use client"

import * as React from "react"
import {
  CanvasObject,
  DocumentSettings,
  ToolType,
  ShapeSubtype,
  PenNode,
  DocumentPage,
} from "@/types/eva-editor"
import { ShapeRegistry } from "@/core/editor/shape-registry"
import { Search, PenTool } from "lucide-react"
import { FrameToolIcon } from "../icons/frame-tool-icon"
import { DocumentNavigator } from "./document-navigator"
import { formatUnitValue } from "../top-bar/top-bar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import {
  buildPenSvgPath,
  extractPenNodesFromObject,
  computeBoundsFromNodes,
  convertNodeToSmooth,
  convertNodeToCorner,
  deleteNodeFromPath,
  insertNodeOnSegment,
} from "@/core/editor/anchor-utils"

// Authentic CorelDRAW / Illustrator Pen Tool Nib Cursor (Hotspot at tip: 2, 2)
const PEN_CURSOR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="m12 19 7-7 3 3-7 7-3-3z" fill="%23ffffff" stroke="%23000000" stroke-width="1.8" stroke-linejoin="round"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" fill="%23ffffff" stroke="%23000000" stroke-width="1.8" stroke-linejoin="round"/><path d="m2 2 7.586 7.586" stroke="%23000000" stroke-width="1.8" stroke-linecap="round"/><circle cx="11" cy="11" r="2" fill="%23000000"/></svg>`

// Authentic Illustrator / CorelDRAW Anchor Point Tool Cursor (Hotspot at tip: 12, 4)
const ANCHOR_CURSOR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 18L12 4L20 18" stroke="%23000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 18L12 4L20 18" stroke="%23ffffff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="4" r="2.5" fill="%232563eb" stroke="%23ffffff" stroke-width="1"/></svg>`

// ── Color Picker / Eyedropper Tool Cursors ──────────────────────────
// "Sample" mode cursor: empty pipette (click to pick color)
const EYEDROPPER_SAMPLE_CURSOR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none"><g transform="rotate(-45 14 14)"><rect x="11" y="2" width="6" height="16" rx="1" fill="%23ffffff" stroke="%23000000" stroke-width="1.5"/><path d="M11 14 L11 18 Q11 21 14 22 Q17 21 17 18 L17 14" fill="%23ffffff" stroke="%23000000" stroke-width="1.5"/><circle cx="14" cy="5" r="1.2" fill="%23555555"/><line x1="11" y1="9" x2="17" y2="9" stroke="%23999999" stroke-width="0.8"/></g><circle cx="4" cy="24" r="2" fill="%23007aff" stroke="%23ffffff" stroke-width="1"/></svg>`

// "Apply" mode cursor: filled pipette (click to paste color)
const buildEyedropperApplyCursor = (hexColor: string) => {
  const encoded = hexColor.replace(/#/g, "%23")
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none"><g transform="rotate(-45 14 14)"><rect x="11" y="2" width="6" height="16" rx="1" fill="%23ffffff" stroke="%23000000" stroke-width="1.5"/><path d="M11 14 L11 18 Q11 21 14 22 Q17 21 17 18 L17 14" fill="${encoded}" stroke="%23000000" stroke-width="1.5"/><rect x="11.5" y="9.5" width="5" height="5" fill="${encoded}" rx="0.5"/><circle cx="14" cy="5" r="1.2" fill="%23555555"/></g><circle cx="4" cy="24" r="2.5" fill="${encoded}" stroke="%23ffffff" stroke-width="1.5"/></svg>`
}

interface DesignCanvasProps {
  settings: DocumentSettings
  onUpdateSettings?: (updater: (prev: DocumentSettings) => DocumentSettings) => void
  objects: CanvasObject[]
  selectedIds: string[]
  activeTool: ToolType
  onSelectObject: (id: string, isMulti: boolean) => void
  onClearSelection: () => void
  onSelectMultipleObjects?: (ids: string[]) => void
  onUpdateObject: (id: string, updates: Partial<CanvasObject>) => void
  onUpdateMultipleObjects?: (updatesMap: Record<string, Partial<CanvasObject>>) => void
  onCommitObjects?: () => void
  onCreateObject: (obj: CanvasObject) => void
  onFileDrop: (files: FileList) => void
  activeColor: string
  onChangeActiveColor?: (color: string) => void
  activeShapeSubtype?: ShapeSubtype
  // Multi-page Document Navigator props
  pages: DocumentPage[]
  activePageId: string
  onSelectPage: (pageId: string) => void
  onInsertPageBefore: (referencePageId: string) => void
  onInsertPageAfter: (referencePageId: string) => void
  onDuplicatePage: (pageId: string) => void
  onDeletePage: (pageId: string) => void
  onRenamePage: (pageId: string, newName: string) => void
  onReorderPages?: (newPages: DocumentPage[]) => void
  // Anchor Point Tool props
  selectedAnchorNodeIdx?: number | null
  onSelectAnchorNode?: (idx: number | null) => void
  onDeleteObject?: (id: string) => void
}

export function DesignCanvas({
  settings,
  onUpdateSettings = () => {},
  objects,
  selectedIds,
  activeTool,
  activeShapeSubtype = "star",
  onSelectObject,
  onClearSelection,
  onSelectMultipleObjects,
  onUpdateObject,
  onUpdateMultipleObjects,
  onCommitObjects,
  onCreateObject,
  onFileDrop,
  activeColor,
  onChangeActiveColor,
  pages,
  activePageId,
  onSelectPage,
  onInsertPageBefore,
  onInsertPageAfter,
  onDuplicatePage,
  onDeletePage,
  onRenamePage,
  onReorderPages,
  selectedAnchorNodeIdx = null,
  onSelectAnchorNode,
  onDeleteObject,
}: DesignCanvasProps) {
  const workspaceRef = React.useRef<HTMLDivElement>(null)
  const svgRef = React.useRef<SVGSVGElement>(null)

  // Anchor Point Tool State
  const [localSelectedNodeIdx, setLocalSelectedNodeIdx] = React.useState<number | null>(null)
  const activeAnchorIdx =
    selectedAnchorNodeIdx !== undefined && selectedAnchorNodeIdx !== null
      ? selectedAnchorNodeIdx
      : localSelectedNodeIdx

  const setActiveAnchorNode = (idx: number | null) => {
    setLocalSelectedNodeIdx(idx)
    if (onSelectAnchorNode) onSelectAnchorNode(idx)
  }

  const [anchorDragState, setAnchorDragState] = React.useState<{
    objId: string
    type: "node" | "handle-in" | "handle-out"
    nodeIdx: number
    startX: number
    startY: number
    initialNodes: PenNode[]
    isClosed: boolean
  } | null>(null)

  // Mouse coords for rulers
  const [mouseScreenPos, setMouseScreenPos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Panning State (Holding middle scroll wheel or Space+drag)
  const [isPanning, setIsPanning] = React.useState(false)
  const isPanningRef = React.useRef(false)
  const [isSpacePressed, setIsSpacePressed] = React.useState(false)
  const isSpacePressedRef = React.useRef(false)
  const panStartRef = React.useRef<{
    x: number
    y: number
    initialPanX: number
    initialPanY: number
  }>({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 })

  // Object Interaction State (Move, Resize, Pencil, Pen, Draw Frame, Draw Shape, Anchor Tool, Crop)
  const [isInteracting, setIsInteracting] = React.useState<
    | "move"
    | "resize"
    | "draw"
    | "draw-frame"
    | "draw-shape"
    | "pencil"
    | "pen"
    | "pen-move-node"
    | "anchor-move-node"
    | "anchor-drag-cpout"
    | "anchor-drag-cpin"
    | "crop-handle"
    | "marquee-select"
    | null
  >(null)

  // Marquee Selection Box State (Crossing Window Selection)
  const [marqueeBox, setMarqueeBox] = React.useState<{
    startX: number
    startY: number
    currentX: number
    currentY: number
    initialSelectedIds: string[]
    isShift: boolean
  } | null>(null)

  // ── CorelDRAW Crop Tool State ──────────────────────────────────────────
  const [cropState, setCropState] = React.useState<{
    targetIds?: string[]
    x: number
    y: number
    w: number
    h: number
    handle: string
    startX: number
    startY: number
    initX: number
    initY: number
    initW: number
    initH: number
    isDrawingNew?: boolean
  } | null>(null)

  // ── Color Picker / Eyedropper Two-Click State ──────────────────────
  const [eyedropperPhase, setEyedropperPhase] = React.useState<
    | "sample"  // First click: pick/sample color from object
    | "apply"   // Second click: paste/apply sampled color onto object
  >("sample")
  const [eyedropperSampledColor, setEyedropperSampledColor] = React.useState<string | null>(null)

  // Reset eyedropper state when switching tools
  React.useEffect(() => {
    if (activeTool !== "eyedropper") {
      setEyedropperPhase("sample")
      setEyedropperSampledColor(null)
    }
  }, [activeTool])

  // Draw-shape drag state
  const [drawShapeStart, setDrawShapeStart] = React.useState<{ x: number; y: number } | null>(null)
  const [drawShapeSubtype, setDrawShapeSubtype] = React.useState<"rectangle" | "circle" | ShapeSubtype>("rectangle")
  const [frameDrawStart, setFrameDrawStart] = React.useState<{ x: number; y: number } | null>(null)
  const [activeHandle, setActiveHandle] = React.useState<string | null>(null)
  const [interactionStart, setInteractionStart] = React.useState<{
    startX: number
    startY: number
    initialObjs: Record<
      string,
      {
        x: number
        y: number
        w: number
        h: number
        penNodes?: PenNode[]
        pathData?: string
        points?: { x: number; y: number }[]
      }
    >
  }>({ startX: 0, startY: 0, initialObjs: {} })

  // Inline text editing state (Figma / Photoshop / CorelDRAW style)
  const [editingText, setEditingText] = React.useState<{
    id: string
    x: number
    y: number
    text: string
    isNew: boolean
    fontSize: number
    fontFamily: string
    fontWeight: string
    fill: string
    stroke: string
    strokeWidth: number
  } | null>(null)
  const inlineTextareaRef = React.useRef<HTMLTextAreaElement>(null)

  const commitEditingText = React.useCallback(() => {
    if (!editingText) return
    const trimmed = editingText.text.trim()
    if (!trimmed) {
      // Discard empty text session - no dummy object left behind!
      setEditingText(null)
      return
    }

    if (editingText.isNew) {
      const newObj: CanvasObject = {
        id: editingText.id,
        name: "Text",
        type: "text",
        textType: "artistic",
        pageId: activePageId,
        text: trimmed,
        fontSize: editingText.fontSize || 28,
        fontFamily: editingText.fontFamily || "Poppins",
        fontWeight: editingText.fontWeight || "bold",
        fill: editingText.fill || activeColor || "#000000",
        stroke: editingText.stroke || "none",
        strokeWidth: editingText.strokeWidth || 0,
        x: editingText.x,
        y: editingText.y,
        width: Math.max(100, Math.round(trimmed.length * ((editingText.fontSize || 28) * 0.65))),
        height: Math.max(36, Math.round((editingText.fontSize || 28) * 1.4)),
        rotation: 0,
        opacity: 1,
        blendMode: "normal",
        zIndex: objects.length + 1,
      }
      onCreateObject(newObj)
      onSelectObject(newObj.id, false)
      toast.success("Text placed")
    } else {
      onUpdateObject(editingText.id, { text: trimmed })
    }
    setEditingText(null)
  }, [editingText, activePageId, activeColor, objects.length, onCreateObject, onSelectObject, onUpdateObject])

  // Pencil points tracking
  const [pencilPoints, setPencilPoints] = React.useState<{ x: number; y: number }[]>([])

  // Advance Pen tool Bézier Nodes and Handle Dragging
  const [penNodes, setPenNodes] = React.useState<PenNode[]>([])
  const [activeDragNodeIdx, setActiveDragNodeIdx] = React.useState<number | null>(null)
  const [penDragAnchor, setPenDragAnchor] = React.useState<{ x: number; y: number } | null>(null)
  const [currentCanvasMouse, setCurrentCanvasMouse] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Check if current mouse is close to first anchor point to close shape
  const isNearOrigin =
    activeTool === "pen" &&
    penNodes.length > 1 &&
    Math.hypot(currentCanvasMouse.x - penNodes[0].x, currentCanvasMouse.y - penNodes[0].y) < 22

  // Conversion: 1mm ≈ 3.2px at standard viewing scale
  const scaleRatio = 3.2
  const pageWidthPx = Math.round(settings.widthMm * scaleRatio)
  const pageHeightPx = Math.round(settings.heightMm * scaleRatio)

  // CorelDRAW Multi-Page Architecture: Each page holds its own vector objects stacked "behind" each other
  const visibleObjects = React.useMemo(() => {
    return objects.filter((o) => {
      if (o.type === "frame") return true
      return (o.pageId || "page-1") === activePageId
    })
  }, [objects, activePageId])

  // ─── Finalize Pen Path into a Crisp Vector Shape/Path ────────────────
  const finalizePenPath = React.useCallback(
    (isClosed: boolean = false) => {
      if (penNodes.length < 2) return

      const pathData = buildPenSvgPath(penNodes, isClosed)

      const allX = penNodes.flatMap((n) => [
        n.x,
        ...(n.cpIn ? [n.cpIn.x] : []),
        ...(n.cpOut ? [n.cpOut.x] : []),
      ])
      const allY = penNodes.flatMap((n) => [
        n.y,
        ...(n.cpIn ? [n.cpIn.y] : []),
        ...(n.cpOut ? [n.cpOut.y] : []),
      ])

      const minX = Math.min(...allX)
      const minY = Math.min(...allY)
      const maxX = Math.max(...allX)
      const maxY = Math.max(...allY)

      const newObj: CanvasObject = {
        id: `pen-${Date.now()}`,
        name: isClosed ? "Bézier Shape" : "Bézier Path",
        type: "path",
        pageId: activePageId,
        x: Math.round(minX),
        y: Math.round(minY),
        width: Math.max(15, Math.round(maxX - minX)),
        height: Math.max(15, Math.round(maxY - minY)),
        rotation: 0,
        opacity: 1,
        fill: isClosed ? activeColor : "none",
        stroke: isClosed ? "#000000" : activeColor,
        strokeWidth: 3,
        strokeLineCap: "round",
        strokeLineJoin: "round",
        blendMode: "normal",
        pathData,
        points: penNodes.map((n) => ({ x: n.x, y: n.y })),
        penNodes: [...penNodes],
        zIndex: objects.length + 1,
      }

      onCreateObject(newObj)
      setPenNodes([])
      setActiveDragNodeIdx(null)
      setPenDragAnchor(null)
      setIsInteracting(null)
      toast.success(isClosed ? "Closed Bézier shape created!" : "Bézier path completed!")
    },
    [penNodes, activeColor, objects.length, onCreateObject, activePageId]
  )

  // ─── Keyboard Shortcuts for Pen Tool (Enter to finish, Escape to cancel) ──
  React.useEffect(() => {
    if (activeTool !== "pen") return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return

      if (e.key === "Enter") {
        e.preventDefault()
        finalizePenPath(false)
      } else if (e.key === "Escape") {
        e.preventDefault()
        setPenNodes([])
        setActiveDragNodeIdx(null)
        setPenDragAnchor(null)
        setIsInteracting(null)
        toast.info("Pen drawing cancelled")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeTool, finalizePenPath])

  // ─── Keyboard Shortcuts for Anchor Tool (Delete / Backspace, Tab) ───
  React.useEffect(() => {
    if (activeTool !== "anchor") return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (activeAnchorIdx === null || selectedIds.length === 0) return
        const targetObj = objects.find((o) => selectedIds.includes(o.id))
        if (!targetObj) return

        const { nodes, isClosed } = extractPenNodesFromObject(targetObj)
        if (nodes.length <= 2) {
          toast.warning("Cannot delete node: path requires at least 2 points")
          return
        }

        e.preventDefault()
        const updated = deleteNodeFromPath(nodes, activeAnchorIdx)
        const bounds = computeBoundsFromNodes(updated)
        const pathData = buildPenSvgPath(updated, isClosed)
        onUpdateObject(targetObj.id, {
          type: "path",
          penNodes: updated,
          pathData,
          ...bounds,
        })
        setActiveAnchorNode(Math.max(0, activeAnchorIdx - 1))
        toast.success("Anchor point deleted")
        return
      }

      if (e.key === "Tab") {
        if (selectedIds.length === 0) return
        const targetObj = objects.find((o) => selectedIds.includes(o.id))
        if (!targetObj) return

        const { nodes } = extractPenNodesFromObject(targetObj)
        if (nodes.length === 0) return

        e.preventDefault()
        const nextIdx =
          activeAnchorIdx !== null ? (activeAnchorIdx + 1) % nodes.length : 0
        setActiveAnchorNode(nextIdx)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    activeTool,
    activeAnchorIdx,
    selectedIds,
    objects,
    onUpdateObject,
    onSelectAnchorNode,
  ])

  // ─── CorelDRAW Crop Tool Logic: Apply & Reset ──────────────────────────
  const applyCrop = React.useCallback(() => {
    if (!cropState || cropState.w < 10 || cropState.h < 10) {
      toast.warning("Please drag a crop area first")
      return
    }

    const { x: cx, y: cy, w: cw, h: ch, targetIds } = cropState

    // In CorelDRAW: If objects are selected, crop only them; otherwise crop all page objects
    const targets = targetIds && targetIds.length > 0
      ? visibleObjects.filter((o) => targetIds.includes(o.id))
      : visibleObjects.filter((o) => o.type !== "frame")

    if (targets.length === 0) {
      toast.info("No objects within crop area")
      setCropState(null)
      return
    }

    let croppedCount = 0
    let removedCount = 0

    targets.forEach((obj) => {
      const objRight = obj.x + obj.width
      const objBottom = obj.y + obj.height

      // Check overlap with crop box
      const overlapX1 = Math.max(obj.x, cx)
      const overlapY1 = Math.max(obj.y, cy)
      const overlapX2 = Math.min(objRight, cx + cw)
      const overlapY2 = Math.min(objBottom, cy + ch)

      if (overlapX2 <= overlapX1 || overlapY2 <= overlapY1) {
        // Outside crop area -> deleted in CorelDRAW
        if (onDeleteObject) {
          onDeleteObject(obj.id)
        } else {
          onUpdateObject(obj.id, { opacity: 0, locked: true })
        }
        removedCount++
      } else {
        // Intersects or inside crop area -> apply SVG crop clipping rect
        onUpdateObject(obj.id, {
          cropRect: {
            x: cx - obj.x,
            y: cy - obj.y,
            width: cw,
            height: ch,
          },
        })
        croppedCount++
      }
    })

    setCropState(null)
    toast.success(
      `Crop applied! (${croppedCount} object${croppedCount === 1 ? "" : "s"} cropped${
        removedCount > 0 ? `, ${removedCount} outside removed` : ""
      })`
    )
  }, [cropState, visibleObjects, onDeleteObject, onUpdateObject])

  const resetCrop = React.useCallback(() => {
    const targets =
      cropState?.targetIds && cropState.targetIds.length > 0
        ? cropState.targetIds
        : selectedIds.length > 0
        ? selectedIds
        : visibleObjects.map((o) => o.id)

    targets.forEach((id) => {
      onUpdateObject(id, { cropRect: undefined })
    })
    setCropState(null)
    toast.info("Crop removed from object(s)")
  }, [cropState, selectedIds, visibleObjects, onUpdateObject])

  // CorelDRAW Crop Shortcuts: Enter = Apply, Escape = Cancel
  React.useEffect(() => {
    if (activeTool !== "crop") return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      )
        return

      if (e.key === "Enter") {
        e.preventDefault()
        applyCrop()
      } else if (e.key === "Escape") {
        e.preventDefault()
        setCropState(null)
        toast.info("Crop cancelled")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeTool, applyCrop])

  // Auto-initialize Crop Area when switching to Crop Tool with selected objects
  React.useEffect(() => {
    if (activeTool === "crop") {
      if (selectedIds.length > 0) {
        const targetObjs = visibleObjects.filter((o) => selectedIds.includes(o.id))
        if (targetObjs.length > 0) {
          const minX = Math.min(...targetObjs.map((o) => o.x))
          const minY = Math.min(...targetObjs.map((o) => o.y))
          const maxX = Math.max(...targetObjs.map((o) => o.x + o.width))
          const maxY = Math.max(...targetObjs.map((o) => o.y + o.height))
          setCropState({
            targetIds: targetObjs.map((o) => o.id),
            x: minX,
            y: minY,
            w: Math.max(20, maxX - minX),
            h: Math.max(20, maxY - minY),
            handle: "",
            startX: 0,
            startY: 0,
            initX: minX,
            initY: minY,
            initW: Math.max(20, maxX - minX),
            initH: Math.max(20, maxY - minY),
          })
          return
        }
      }
      setCropState(null)
    } else {
      setCropState(null)
    }
  }, [activeTool]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── 1. Center Canvas On Mount ────────────────────────────────────────
  React.useEffect(() => {
    if (workspaceRef.current && settings.panX === 0 && settings.panY === 0) {
      const w = workspaceRef.current.clientWidth
      const h = workspaceRef.current.clientHeight
      const fitZoom = Math.min(
        1.0,
        Math.min((w - 140) / pageWidthPx, (h - 140) / pageHeightPx)
      )
      const initialZoom = Number(Math.max(0.35, fitZoom).toFixed(2))
      const cx = (w - pageWidthPx * initialZoom) / 2
      const cy = (h - pageHeightPx * initialZoom) / 2
      onUpdateSettings((prev) => ({
        ...prev,
        zoom: initialZoom,
        panX: Math.round(cx),
        panY: Math.round(cy),
      }))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── 2. Spacebar Detection for Panning ─────────────────────────────────
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        setIsSpacePressed(true)
        isSpacePressedRef.current = true
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false)
        isSpacePressedRef.current = false
        if (isPanningRef.current) {
          isPanningRef.current = false
          setIsPanning(false)
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Keep current settings in a ref for smooth rAF animation loops
  const currentSettingsRef = React.useRef(settings)
  React.useEffect(() => {
    currentSettingsRef.current = settings
  }, [settings])

  // Refs for smooth momentum zoom
  const targetZoomRef = React.useRef<number>(settings.zoom || 1)
  const targetPanXRef = React.useRef<number>(settings.panX || 0)
  const targetPanYRef = React.useRef<number>(settings.panY || 0)
  const isZoomingAnimRef = React.useRef<boolean>(false)
  const rafIdRef = React.useRef<number | null>(null)

  // Keep target refs in sync when zoom/pan changes from outside (e.g. presets, tool clicks)
  React.useEffect(() => {
    if (!isZoomingAnimRef.current) {
      targetZoomRef.current = settings.zoom || 1
      targetPanXRef.current = settings.panX || 0
      targetPanYRef.current = settings.panY || 0
    }
  }, [settings.zoom, settings.panX, settings.panY])

  // ─── 3. Mouse Wheel Zoom (Silky Soft, Smooth Momentum Centered at Cursor) ──
  React.useEffect(() => {
    const workspace = workspaceRef.current
    if (!workspace) return

    const handleWheel = (e: WheelEvent) => {
      // Don't intercept if scrolling inside popover or modal
      const target = e.target as HTMLElement | null
      if (target?.closest?.(".no-zoom") || target?.closest?.("[role='dialog']")) return

      e.preventDefault()

      const targetEl = svgRef.current || workspaceRef.current
      if (!targetEl) return

      const rect = targetEl.getBoundingClientRect()
      // Cursor coordinates relative to SVG canvas viewport
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // 1. Normalize wheel delta across mice, high-res mice, and trackpads
      let delta = e.deltaY
      if (e.deltaMode === 1) delta *= 16
      else if (e.deltaMode === 2) delta *= 100

      // Damped delta for silky softness (gentle 6-8% zoom per notch, micro-smooth on trackpads)
      const clampedDelta = Math.max(-120, Math.min(120, delta))
      const factor = Math.exp(-clampedDelta * 0.0011)

      const startTargetZoom = targetZoomRef.current
      const nextTargetZoom = Math.min(50.0, Math.max(0.05, startTargetZoom * factor))

      if (Math.abs(nextTargetZoom - startTargetZoom) < 0.0001) return

      // Anchor zoom mathematically around cursor position
      const targetPanX = mouseX - (mouseX - targetPanXRef.current) * (nextTargetZoom / startTargetZoom)
      const targetPanY = mouseY - (mouseY - targetPanYRef.current) * (nextTargetZoom / startTargetZoom)

      targetZoomRef.current = nextTargetZoom
      targetPanXRef.current = targetPanX
      targetPanYRef.current = targetPanY

      // Launch silky smooth requestAnimationFrame interpolation loop if not already running
      if (!isZoomingAnimRef.current) {
        isZoomingAnimRef.current = true

        const step = () => {
          const curZoom = currentSettingsRef.current.zoom || 1
          const curPanX = currentSettingsRef.current.panX || 0
          const curPanY = currentSettingsRef.current.panY || 0

          const diffZoom = targetZoomRef.current - curZoom
          const diffPanX = targetPanXRef.current - curPanX
          const diffPanY = targetPanYRef.current - curPanY

          // When settled within micro-threshold, snap to final target and terminate loop
          if (
            Math.abs(diffZoom) < 0.0008 &&
            Math.abs(diffPanX) < 0.35 &&
            Math.abs(diffPanY) < 0.35
          ) {
            onUpdateSettings((prev) => ({
              ...prev,
              zoom: Number(targetZoomRef.current.toFixed(4)),
              panX: Math.round(targetPanXRef.current),
              panY: Math.round(targetPanYRef.current),
            }))
            isZoomingAnimRef.current = false
            rafIdRef.current = null
            return
          }

          // Soft spring-like ease-out lerp factor (0.24 provides luxurious fluid cushion)
          const ease = 0.24
          const newZoom = curZoom + diffZoom * ease
          const newPanX = curPanX + diffPanX * ease
          const newPanY = curPanY + diffPanY * ease

          onUpdateSettings((prev) => ({
            ...prev,
            zoom: Number(newZoom.toFixed(4)),
            panX: Math.round(newPanX),
            panY: Math.round(newPanY),
          }))

          rafIdRef.current = requestAnimationFrame(step)
        }

        rafIdRef.current = requestAnimationFrame(step)
      }
    }

    workspace.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      workspace.removeEventListener("wheel", handleWheel)
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [onUpdateSettings])

  // ─── 4. Pan by Holding Scrolling Button (Middle Mouse Button / Space+Drag) ──
  // Native non-passive mousedown on workspace to completely prevent Windows browser autoscroll hijack
  React.useEffect(() => {
    const workspace = workspaceRef.current
    if (!workspace) return

    const handleMouseDownNative = (e: MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && isSpacePressedRef.current)) {
        e.preventDefault()
        e.stopPropagation()

        // Terminate any active momentum zoom loop so it doesn't fight pan
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current)
          rafIdRef.current = null
          isZoomingAnimRef.current = false
        }

        isPanningRef.current = true
        setIsPanning(true)
        panStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          initialPanX: currentSettingsRef.current.panX || 0,
          initialPanY: currentSettingsRef.current.panY || 0,
        }
      }
    }

    workspace.addEventListener("mousedown", handleMouseDownNative, { passive: false })
    return () => {
      workspace.removeEventListener("mousedown", handleMouseDownNative)
    }
  }, [])

  const handleWorkspaceMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && isSpacePressedRef.current)) {
      e.preventDefault()
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
        isZoomingAnimRef.current = false
      }
      isPanningRef.current = true
      setIsPanning(true)
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        initialPanX: currentSettingsRef.current.panX || 0,
        initialPanY: currentSettingsRef.current.panY || 0,
      }
    }
  }

  // Global Mouse Move and Up for Panning and Interactions
  React.useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isPanningRef.current) return
      e.preventDefault()

      const dx = e.clientX - panStartRef.current.x
      const dy = e.clientY - panStartRef.current.y
      const newPanX = Math.round(panStartRef.current.initialPanX + dx)
      const newPanY = Math.round(panStartRef.current.initialPanY + dy)

      // Keep target pan refs synchronized so mouse wheel zoom directly continues from new position
      targetPanXRef.current = newPanX
      targetPanYRef.current = newPanY

      onUpdateSettings((prev) => ({
        ...prev,
        panX: newPanX,
        panY: newPanY,
      }))
    }

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (e.button === 1 || e.button === 0) {
        if (isPanningRef.current) {
          isPanningRef.current = false
          setIsPanning(false)
        }
      }
    }

    const handleAuxClick = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    window.addEventListener("mousemove", handleGlobalMouseMove)
    window.addEventListener("mouseup", handleGlobalMouseUp)
    window.addEventListener("auxclick", handleAuxClick)
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove)
      window.removeEventListener("mouseup", handleGlobalMouseUp)
      window.removeEventListener("auxclick", handleAuxClick)
    }
  }, [onUpdateSettings])

  // Global mouse-up listener for marquee selection to prevent getting stuck
  React.useEffect(() => {
    if (isInteracting === "marquee-select") {
      const handleGlobalUp = () => {
        setMarqueeBox(null)
        setIsInteracting(null)
      }
      window.addEventListener("mouseup", handleGlobalUp)
      return () => window.removeEventListener("mouseup", handleGlobalUp)
    }
  }, [isInteracting])

  // ─── 5. Coordinates Transformation Helper ────────────────────────────
  // Converts client mouse coordinates to exact SVG sheet coordinates regardless of pan/zoom
  const getCanvasCoords = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = clientX - rect.left
    const mouseY = clientY - rect.top
    const z = settings.zoom || 1
    const x = (mouseX - (settings.panX || 0)) / z
    const y = (mouseY - (settings.panY || 0)) / z
    return { x: Math.round(x), y: Math.round(y) }
  }

  // Track cursor for rulers and object movements
  const handleWorkspaceMouseMove = (e: React.MouseEvent) => {
    if (workspaceRef.current) {
      const rect = workspaceRef.current.getBoundingClientRect()
      setMouseScreenPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    if (isPanning) return

    const { x, y } = getCanvasCoords(e.clientX, e.clientY)
    setCurrentCanvasMouse({ x, y })

    if (isInteracting === "marquee-select" && marqueeBox) {
      setMarqueeBox((prev) => (prev ? { ...prev, currentX: x, currentY: y } : null))

      const mMinX = Math.min(marqueeBox.startX, x)
      const mMinY = Math.min(marqueeBox.startY, y)
      const mMaxX = Math.max(marqueeBox.startX, x)
      const mMaxY = Math.max(marqueeBox.startY, y)

      // Find all visible objects that intersect (touch or are enclosed by) the marquee
      const hitIds = visibleObjects
        .filter((obj) => {
          if (obj.locked) return false
          const objMinX = obj.x
          const objMinY = obj.y
          const objMaxX = obj.x + obj.width
          const objMaxY = obj.y + obj.height
          return (
            objMinX <= mMaxX &&
            objMaxX >= mMinX &&
            objMinY <= mMaxY &&
            objMaxY >= mMinY
          )
        })
        .map((obj) => obj.id)

      const newSelected = marqueeBox.isShift
        ? Array.from(new Set([...marqueeBox.initialSelectedIds, ...hitIds]))
        : hitIds

      if (onSelectMultipleObjects) {
        onSelectMultipleObjects(newSelected)
      }
    } else if (isInteracting === "draw-shape") {
      // live preview driven by currentCanvasMouse set above
    } else if (isInteracting === "crop-handle" && cropState) {
      if (cropState.isDrawingNew) {
        // Dragging out a new crop marquee (CorelDRAW behavior)
        const nx = Math.min(cropState.startX, x)
        const ny = Math.min(cropState.startY, y)
        const nw = Math.abs(x - cropState.startX)
        const nh = Math.abs(y - cropState.startY)
        setCropState((prev) => (prev ? { ...prev, x: nx, y: ny, w: nw, h: nh } : null))
      } else {
        // Resizing or moving existing crop box
        const dx = x - cropState.startX
        const dy = y - cropState.startY
        const { initX, initY, initW, initH, handle } = cropState

        let nx = initX
        let ny = initY
        let nw = initW
        let nh = initH
        const minSize = 15

        if (handle === "move") {
          nx = initX + dx
          ny = initY + dy
        } else {
          if (handle.includes("e")) {
            nw = Math.max(minSize, initW + dx)
          }
          if (handle.includes("s")) {
            nh = Math.max(minSize, initH + dy)
          }
          if (handle.includes("w")) {
            const newX = Math.min(initX + initW - minSize, initX + dx)
            nw = initX + initW - newX
            nx = newX
          }
          if (handle.includes("n")) {
            const newY = Math.min(initY + initH - minSize, initY + dy)
            nh = initY + initH - newY
            ny = newY
          }
        }

        setCropState((prev) => (prev ? { ...prev, x: nx, y: ny, w: nw, h: nh } : null))
      }
    } else if (isInteracting === "move") {
      const dx = x - interactionStart.startX
      const dy = y - interactionStart.startY

      const updatesMap: Record<string, Partial<CanvasObject>> = {}
      const targetIds = Object.keys(interactionStart.initialObjs)

      targetIds.forEach((id) => {
        const initial = interactionStart.initialObjs[id]
        if (initial) {
          if (initial.penNodes && initial.penNodes.length > 0) {
            const isClosed = initial.pathData?.toUpperCase().includes("Z") ?? true
            const translatedNodes = initial.penNodes.map((n) => ({
              x: n.x + dx,
              y: n.y + dy,
              cpIn: n.cpIn ? { x: n.cpIn.x + dx, y: n.cpIn.y + dy } : null,
              cpOut: n.cpOut ? { x: n.cpOut.x + dx, y: n.cpOut.y + dy } : null,
            }))
            const newPathData = buildPenSvgPath(translatedNodes, isClosed)
            updatesMap[id] = {
              x: initial.x + dx,
              y: initial.y + dy,
              penNodes: translatedNodes,
              pathData: newPathData,
            }
          } else if (initial.points && initial.points.length > 0) {
            const translatedPoints = initial.points.map((p) => ({ x: p.x + dx, y: p.y + dy }))
            const newPathData = `M ${translatedPoints.map((p) => `${p.x} ${p.y}`).join(" L ")}`
            updatesMap[id] = {
              x: initial.x + dx,
              y: initial.y + dy,
              points: translatedPoints,
              pathData: newPathData,
            }
          } else {
            updatesMap[id] = {
              x: initial.x + dx,
              y: initial.y + dy,
            }
          }
        }
      })

      if (onUpdateMultipleObjects) {
        onUpdateMultipleObjects(updatesMap)
      } else {
        Object.entries(updatesMap).forEach(([id, upd]) => {
          onUpdateObject(id, upd)
        })
      }
    } else if (isInteracting === "resize" && activeHandle && selectedIds.length === 1) {
      const id = selectedIds[0]
      const initial = interactionStart.initialObjs[id]
      if (!initial) return

      const dx = x - interactionStart.startX
      const dy = y - interactionStart.startY

      let newW = initial.w
      let newH = initial.h
      let newX = initial.x
      let newY = initial.y

      if (activeHandle.includes("e")) newW = Math.max(10, initial.w + dx)
      if (activeHandle.includes("s")) newH = Math.max(10, initial.h + dy)
      if (activeHandle.includes("w")) {
        newW = Math.max(10, initial.w - dx)
        newX = initial.x + dx
      }
      if (activeHandle.includes("n")) {
        newH = Math.max(10, initial.h - dy)
        newY = initial.y + dy
      }

      onUpdateObject(id, { x: newX, y: newY, width: newW, height: newH })
    } else if (isInteracting === "pencil") {
      setPencilPoints((prev) => [...prev, { x, y }])
    } else if (isInteracting === "pen" && penDragAnchor && activeDragNodeIdx !== null) {
      const dx = x - penDragAnchor.x
      const dy = y - penDragAnchor.y
      const dist = Math.hypot(dx, dy)

      if (dist > 3) {
        let handleX = x
        let handleY = y

        // Shift key: Snap direction handle to 45 degree angle increments
        if (e.shiftKey) {
          const angle = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4)
          handleX = penDragAnchor.x + Math.cos(angle) * dist
          handleY = penDragAnchor.y + Math.sin(angle) * dist
        }

        // Symmetrical opposite handle
        const oppX = penDragAnchor.x - (handleX - penDragAnchor.x)
        const oppY = penDragAnchor.y - (handleY - penDragAnchor.y)

        setPenNodes((prev) => {
          if (activeDragNodeIdx >= prev.length) return prev
          const updated = [...prev]
          const node = { ...updated[activeDragNodeIdx] }
          node.cpOut = { x: Math.round(handleX), y: Math.round(handleY) }
          // Alt/Option key: break tangent symmetry (cusp); otherwise keep symmetric cpIn
          if (!e.altKey) {
            node.cpIn = { x: Math.round(oppX), y: Math.round(oppY) }
          }
          updated[activeDragNodeIdx] = node
          return updated
        })
      }
      return
    } else if (isInteracting === "pen-move-node" && activeDragNodeIdx !== null) {
      setPenNodes((prev) => {
        if (activeDragNodeIdx >= prev.length) return prev
        const updated = [...prev]
        const curr = updated[activeDragNodeIdx]
        const dx = x - curr.x
        const dy = y - curr.y
        updated[activeDragNodeIdx] = {
          x,
          y,
          cpIn: curr.cpIn ? { x: curr.cpIn.x + dx, y: curr.cpIn.y + dy } : null,
          cpOut: curr.cpOut ? { x: curr.cpOut.x + dx, y: curr.cpOut.y + dy } : null,
        }
        return updated
      })
      return
    } else if (isInteracting === "anchor-move-node" && anchorDragState) {
      const dx = x - anchorDragState.startX
      const dy = y - anchorDragState.startY
      const updatedNodes = anchorDragState.initialNodes.map((n, idx) => {
        if (idx !== anchorDragState.nodeIdx) return n
        return {
          x: n.x + dx,
          y: n.y + dy,
          cpIn: n.cpIn ? { x: n.cpIn.x + dx, y: n.cpIn.y + dy } : null,
          cpOut: n.cpOut ? { x: n.cpOut.x + dx, y: n.cpOut.y + dy } : null,
        }
      })
      const bounds = computeBoundsFromNodes(updatedNodes)
      const pathData = buildPenSvgPath(updatedNodes, anchorDragState.isClosed)
      onUpdateObject(anchorDragState.objId, {
        type: "path",
        penNodes: updatedNodes,
        pathData,
        ...bounds,
      })
      return
    } else if (isInteracting === "anchor-drag-cpout" && anchorDragState) {
      const updatedNodes = anchorDragState.initialNodes.map((n) => ({
        ...n,
        cpIn: n.cpIn ? { ...n.cpIn } : null,
        cpOut: n.cpOut ? { ...n.cpOut } : null,
      }))
      const node = updatedNodes[anchorDragState.nodeIdx]
      const initNode = anchorDragState.initialNodes[anchorDragState.nodeIdx]
      if (node && initNode) {
        const dx = x - node.x
        const dy = y - node.y
        const dist = Math.hypot(dx, dy)
        let handleX = x
        let handleY = y
        if (e.shiftKey) {
          const angle = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4)
          handleX = node.x + Math.cos(angle) * dist
          handleY = node.y + Math.sin(angle) * dist
        }
        node.cpOut = { x: Math.round(handleX), y: Math.round(handleY) }
        if (!e.altKey) {
          const inDist = initNode.cpIn
            ? Math.hypot(initNode.cpIn.x - initNode.x, initNode.cpIn.y - initNode.y)
            : dist
          const curAngle = Math.atan2(handleY - node.y, handleX - node.x)
          const oppAngle = curAngle + Math.PI
          const oppLen = inDist < 5 ? dist : inDist
          node.cpIn = {
            x: Math.round(node.x + Math.cos(oppAngle) * oppLen),
            y: Math.round(node.y + Math.sin(oppAngle) * oppLen),
          }
        }
        const bounds = computeBoundsFromNodes(updatedNodes)
        const pathData = buildPenSvgPath(updatedNodes, anchorDragState.isClosed)
        onUpdateObject(anchorDragState.objId, {
          type: "path",
          penNodes: updatedNodes,
          pathData,
          ...bounds,
        })
      }
      return
    } else if (isInteracting === "anchor-drag-cpin" && anchorDragState) {
      const updatedNodes = anchorDragState.initialNodes.map((n) => ({
        ...n,
        cpIn: n.cpIn ? { ...n.cpIn } : null,
        cpOut: n.cpOut ? { ...n.cpOut } : null,
      }))
      const node = updatedNodes[anchorDragState.nodeIdx]
      const initNode = anchorDragState.initialNodes[anchorDragState.nodeIdx]
      if (node && initNode) {
        const dx = x - node.x
        const dy = y - node.y
        const dist = Math.hypot(dx, dy)
        let handleX = x
        let handleY = y
        if (e.shiftKey) {
          const angle = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4)
          handleX = node.x + Math.cos(angle) * dist
          handleY = node.y + Math.sin(angle) * dist
        }
        node.cpIn = { x: Math.round(handleX), y: Math.round(handleY) }
        if (!e.altKey) {
          const outDist = initNode.cpOut
            ? Math.hypot(initNode.cpOut.x - initNode.x, initNode.cpOut.y - initNode.y)
            : dist
          const curAngle = Math.atan2(handleY - node.y, handleX - node.x)
          const oppAngle = curAngle + Math.PI
          const oppLen = outDist < 5 ? dist : outDist
          node.cpOut = {
            x: Math.round(node.x + Math.cos(oppAngle) * oppLen),
            y: Math.round(node.y + Math.sin(oppAngle) * oppLen),
          }
        }
        const bounds = computeBoundsFromNodes(updatedNodes)
        const pathData = buildPenSvgPath(updatedNodes, anchorDragState.isClosed)
        onUpdateObject(anchorDragState.objId, {
          type: "path",
          penNodes: updatedNodes,
          pathData,
          ...bounds,
        })
      }
      return
    }
  }

  const handleWorkspaceMouseUp = (e?: React.MouseEvent) => {
    if (isInteracting === "marquee-select") {
      if (marqueeBox) {
        const dragDist = Math.hypot(
          marqueeBox.currentX - marqueeBox.startX,
          marqueeBox.currentY - marqueeBox.startY
        )
        if (dragDist < 5 && !marqueeBox.isShift) {
          if (onSelectMultipleObjects) {
            onSelectMultipleObjects([])
          } else {
            onClearSelection()
          }
        }
      }
      setMarqueeBox(null)
      setIsInteracting(null)
      return
    }

    if (isInteracting && isInteracting.startsWith("anchor-")) {
      setIsInteracting(null)
      setAnchorDragState(null)
      return
    }

    // ── Commit crop drag on mouse-up (just finalize dragging, don't apply to objects) ──
    if (isInteracting === "crop-handle" && cropState) {
      setIsInteracting(null)
      // Just release the handle — crop stays editable until Enter/double-click
      setCropState((prev) => prev ? { ...prev, handle: "" } : null)
      return
    }

    // ── Finalize click-and-drag shape creation ──────────────────────────
    if (isInteracting === "draw-shape" && drawShapeStart) {
      const mx = currentCanvasMouse.x
      const my = currentCanvasMouse.y
      const rawW = Math.abs(mx - drawShapeStart.x)
      const rawH = Math.abs(my - drawShapeStart.y)
      const isShift = e?.shiftKey ?? false

      // Minimum drag threshold: 8px to avoid accidental creation on click
      if (rawW < 8 && rawH < 8) {
        setIsInteracting(null)
        setDrawShapeStart(null)
        return
      }

      // Shift = equal ratio (lock to square / circle)
      const finalW = isShift ? Math.max(rawW, rawH) : rawW
      const finalH = isShift ? Math.max(rawW, rawH) : rawH
      const originX = mx < drawShapeStart.x ? drawShapeStart.x - finalW : drawShapeStart.x
      const originY = my < drawShapeStart.y ? drawShapeStart.y - finalH : drawShapeStart.y

      if (drawShapeSubtype === "rectangle") {
        onCreateObject({
          id: `rect-${Date.now()}`,
          name: "Rectangle",
          type: "rectangle",
          pageId: activePageId,
          x: Math.round(originX),
          y: Math.round(originY),
          width: Math.max(10, Math.round(finalW)),
          height: Math.max(10, Math.round(finalH)),
          rotation: 0,
          opacity: 1,
          fill: activeColor,
          stroke: "#000000",
          strokeWidth: 2,
          cornerRadius: 0,
          blendMode: "normal",
          zIndex: objects.length + 1,
        })
      } else if (drawShapeSubtype === "circle") {
        onCreateObject({
          id: `circle-${Date.now()}`,
          name: "Circle",
          type: "circle",
          pageId: activePageId,
          x: Math.round(originX),
          y: Math.round(originY),
          width: Math.max(10, Math.round(finalW)),
          height: Math.max(10, Math.round(finalH)),
          rotation: 0,
          opacity: 1,
          fill: activeColor,
          stroke: "#000000",
          strokeWidth: 2,
          blendMode: "normal",
          zIndex: objects.length + 1,
        })
      } else {
        // Generic shape subtype
        const st = drawShapeSubtype as ShapeSubtype
        const isLine = st === "line"
        const shapeNames: Record<ShapeSubtype, string> = {
          star: "Star", hexagon: "Hexagon", line: "Line",
          triangle: "Triangle", polygon: "Polygon", pentagon: "Pentagon", arrow: "Arrow",
          diamond: "Diamond", cross: "Cross",
        }
        onCreateObject({
          id: `shape-${Date.now()}`,
          name: shapeNames[st] || "Shape",
          type: "shape",
          subtype: st,
          pageId: activePageId,
          x: Math.round(originX),
          y: Math.round(originY),
          width: Math.max(10, Math.round(finalW)),
          height: Math.max(isLine ? 4 : 10, Math.round(finalH)),
          rotation: 0,
          opacity: 1,
          fill: isLine ? "none" : activeColor,
          stroke: isLine ? activeColor : "#000000",
          strokeWidth: isLine ? 3 : 2,
          blendMode: "normal",
          zIndex: objects.length + 1,
        })
      }

      setIsInteracting(null)
      setDrawShapeStart(null)
      return
    }

    if (isInteracting === "pencil" && pencilPoints.length > 1) {
      const pathData = `M ${pencilPoints.map((p) => `${p.x} ${p.y}`).join(" L ")}`
      const newObj: CanvasObject = {
        id: `pencil-${Date.now()}`,
        name: "Pencil Stroke",
        type: "pencil",
        pageId: activePageId,
        x: 0,
        y: 0,
        width: pageWidthPx,
        height: pageHeightPx,
        rotation: 0,
        opacity: 1,
        fill: "none",
        stroke: activeColor,
        strokeWidth: 3,
        strokeLineCap: "round",
        strokeLineJoin: "round",
        blendMode: "normal",
        pathData,
        points: pencilPoints,
        zIndex: objects.length + 1,
      }
      onCreateObject(newObj)
      setPencilPoints([])
    } else if (isInteracting === "pen-move-node") {
      setIsInteracting(null)
      setActiveDragNodeIdx(null)
      setPenDragAnchor(null)
      return
    } else if (isInteracting === "pen") {
      setIsInteracting(null)
      const isClosing = activeDragNodeIdx === 0 && penNodes.length > 1
      setActiveDragNodeIdx(null)
      setPenDragAnchor(null)

      if (isClosing) {
        finalizePenPath(true)
      }
      return
    } else if (isInteracting === "draw-frame" && frameDrawStart) {
      const minX = Math.min(frameDrawStart.x, currentCanvasMouse.x)
      const minY = Math.min(frameDrawStart.y, currentCanvasMouse.y)
      const rawW = Math.abs(currentCanvasMouse.x - frameDrawStart.x)
      const rawH = Math.abs(currentCanvasMouse.y - frameDrawStart.y)

      const isQuickClick = rawW < 15 && rawH < 15
      const finalW = isQuickClick ? 672 : Math.max(50, rawW)
      const finalH = isQuickClick ? 474 : Math.max(50, rawH)
      const finalX = isQuickClick ? Math.round(frameDrawStart.x - finalW / 2) : minX
      const finalY = isQuickClick ? Math.round(frameDrawStart.y - finalH / 2) : minY

      const existingFrames = objects.filter((o) => o.type === "frame")
      const newFrame: CanvasObject = {
        id: `frame-${Date.now()}`,
        name: `Page ${existingFrames.length + 2}`,
        type: "frame",
        pageId: activePageId,
        x: finalX,
        y: finalY,
        width: finalW,
        height: finalH,
        rotation: 0,
        opacity: 1,
        fill: "#ffffff",
        stroke: "rgba(0,0,0,0.18)",
        strokeWidth: 1,
        blendMode: "normal",
        zIndex: 0,
      }

      onCreateObject(newFrame)
      onSelectObject(newFrame.id, false)
      setIsInteracting(null)
      setFrameDrawStart(null)
      toast.success(
        `Created ${newFrame.name} (${(finalW / scaleRatio).toFixed(1)} mm × ${(finalH / scaleRatio).toFixed(1)} mm)`
      )
      return
    }

    if (isInteracting === "move") {
      setIsInteracting(null)
      if (onCommitObjects) {
        onCommitObjects()
      }
      return
    }

    if (isInteracting === "crop-handle") {
      setIsInteracting(null)
      if (cropState?.isDrawingNew) {
        if (cropState.w < 10 || cropState.h < 10) {
          setCropState(null)
        } else {
          setCropState((prev) => (prev ? { ...prev, isDrawingNew: false } : null))
        }
      }
      return
    }

    setIsInteracting(null)
    setActiveHandle(null)
  }

  // ─── 6. Canvas Mouse Down (Create / Deselect / Tools) ─────────────────
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // If middle click or space-panning, ignore drawing
    if (e.button === 1 || isSpacePressedRef.current) {
      e.preventDefault()
      return
    }

    const isDrawingTool =
      activeTool === "crop" ||
      activeTool === "frame" ||
      activeTool === "pen" ||
      activeTool === "pencil" ||
      activeTool === "rectangle" ||
      activeTool === "circle" ||
      activeTool === "shape" ||
      activeTool === "text" ||
      activeTool === "zoom"

    if (!isDrawingTool) {
      const target = e.target as HTMLElement
      if (target.closest?.("[id^='canvas-obj-']") || target.closest?.("[id^='selection-handles-']")) {
        return
      }
    }

    const { x, y } = getCanvasCoords(e.clientX, e.clientY)

    if (activeTool === "crop") {
      // Check if clicking inside current crop box to move it
      if (
        cropState &&
        x >= cropState.x &&
        x <= cropState.x + cropState.w &&
        y >= cropState.y &&
        y <= cropState.y + cropState.h
      ) {
        setIsInteracting("crop-handle")
        setCropState((prev) =>
          prev
            ? {
                ...prev,
                handle: "move",
                startX: x,
                startY: y,
                initX: prev.x,
                initY: prev.y,
                initW: prev.w,
                initH: prev.h,
                isDrawingNew: false,
              }
            : null
        )
        return
      }

      // Otherwise: Drag to create a new crop marquee (CorelDRAW behavior)
      setIsInteracting("crop-handle")
      setCropState({
        targetIds: selectedIds,
        x,
        y,
        w: 0,
        h: 0,
        handle: "se",
        startX: x,
        startY: y,
        initX: x,
        initY: y,
        initW: 0,
        initH: 0,
        isDrawingNew: true,
      })
      return
    }

    if (activeTool === "select") {
      const isShift = e.shiftKey || e.ctrlKey
      setIsInteracting("marquee-select")
      setMarqueeBox({
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
        initialSelectedIds: isShift ? [...selectedIds] : [],
        isShift,
      })
      if (!isShift) {
        if (onSelectMultipleObjects) {
          onSelectMultipleObjects([])
        } else {
          onClearSelection()
        }
      }
    } else if (activeTool === "frame") {
      setIsInteracting("draw-frame")
      setFrameDrawStart({ x, y })
    } else if (activeTool === "rectangle" || activeTool === "circle" || activeTool === "shape") {
      // Start click-and-drag shape creation
      setIsInteracting("draw-shape")
      setDrawShapeStart({ x, y })
      setDrawShapeSubtype(
        activeTool === "rectangle" ? "rectangle" :
        activeTool === "circle" ? "circle" :
        activeShapeSubtype
      )
    } else if (activeTool === "text") {
      if (editingText) {
        commitEditingText()
      }
      const newId = `text-${Date.now()}`
      setEditingText({
        id: newId,
        x: Math.round(x),
        y: Math.round(y),
        text: "",
        isNew: true,
        fontSize: 28,
        fontFamily: "Poppins",
        fontWeight: "bold",
        fill: activeColor || "#000000",
        stroke: "none",
        strokeWidth: 0,
      })
      setTimeout(() => inlineTextareaRef.current?.focus(), 40)
      return
    } else if (activeTool === "pencil") {
      setIsInteracting("pencil")
      setPencilPoints([{ x, y }])
    } else if (activeTool === "pen") {
      // 1. Alt + Click on an existing node: Convert between smooth and sharp corner
      if (e.altKey && penNodes.length > 0) {
        const nodeIdx = penNodes.findIndex((n) => Math.hypot(x - n.x, y - n.y) < 20)
        if (nodeIdx !== -1) {
          setPenNodes((prev) => {
            const updated = [...prev]
            const curr = updated[nodeIdx]
            updated[nodeIdx] = { ...curr, cpIn: null, cpOut: null }
            return updated
          })
          toast.info("Converted anchor to sharp corner")
          return
        }
      }

      // 2. Ctrl / Cmd + Click on an existing node: Direct selection to reposition node
      if ((e.ctrlKey || e.metaKey) && penNodes.length > 0) {
        const nodeIdx = penNodes.findIndex((n) => Math.hypot(x - n.x, y - n.y) < 20)
        if (nodeIdx !== -1) {
          setIsInteracting("pen-move-node")
          setActiveDragNodeIdx(nodeIdx)
          setPenDragAnchor({ x: penNodes[nodeIdx].x, y: penNodes[nodeIdx].y })
          return
        }
      }

      // 3. Advance Bézier Pen Tool: check if clicking near start node to close path
      const isClosing = penNodes.length > 1 && Math.hypot(x - penNodes[0].x, y - penNodes[0].y) < 22

      if (isClosing) {
        setIsInteracting("pen")
        setActiveDragNodeIdx(0)
        setPenDragAnchor({ x: penNodes[0].x, y: penNodes[0].y })
      } else {
        const newNode: PenNode = { x, y, cpIn: null, cpOut: null }
        const newIdx = penNodes.length
        setPenNodes((prev) => [...prev, newNode])
        setIsInteracting("pen")
        setActiveDragNodeIdx(newIdx)
        setPenDragAnchor({ x, y })
      }
    } else if (activeTool === "zoom") {
      const isZoomOut = e.altKey || e.shiftKey
      const zoomFactor = isZoomOut ? 0.75 : 1.3
      const nextZoom = Number(Math.min(50.0, Math.max(0.05, settings.zoom * zoomFactor)).toFixed(2))
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const newPanX = mouseX - x * nextZoom
        const newPanY = mouseY - y * nextZoom
        onUpdateSettings((prev) => ({
          ...prev,
          zoom: nextZoom,
          panX: Math.round(newPanX),
          panY: Math.round(newPanY),
        }))
      }
    }
  }

  // Double Click Canvas to finalize Pen Path / Apply Crop
  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (activeTool === "pen" && penNodes.length > 1) {
      finalizePenPath(false)
      return
    }
    // CorelDRAW: double-click inside crop area = apply crop
    if (activeTool === "crop" && cropState && cropState.w >= 10 && cropState.h >= 10) {
      const { x: mx, y: my } = getCanvasCoords(e.clientX, e.clientY)
      if (
        mx >= cropState.x && mx <= cropState.x + cropState.w &&
        my >= cropState.y && my <= cropState.y + cropState.h
      ) {
        applyCrop()
        return
      }
    }
  }

  // ─── 7. Object Click & Tool Interactivity ────────────────────────────
  const handleObjectMouseDown = (e: React.MouseEvent, obj: CanvasObject) => {
    if (e.button === 1 || isSpacePressedRef.current) {
      e.preventDefault()
      return
    }

    // Pen, Pencil, Frame & Crop tools draw freely across the entire canvas, even over existing objects
    if (activeTool === "pen" || activeTool === "pencil" || activeTool === "frame" || activeTool === "crop") {
      handleCanvasMouseDown(e)
      return
    }

    if (activeTool === "text") {
      if (obj.type === "text") {
        setEditingText({
          id: obj.id,
          x: obj.x,
          y: obj.y,
          text: obj.text || "",
          isNew: false,
          fontSize: obj.fontSize || 28,
          fontFamily: obj.fontFamily || "Poppins",
          fontWeight: obj.fontWeight || "bold",
          fill: obj.fill || "#000000",
          stroke: obj.stroke || "none",
          strokeWidth: obj.strokeWidth || 0,
        })
        setTimeout(() => inlineTextareaRef.current?.focus(), 40)
        return
      }
      handleCanvasMouseDown(e)
      return
    }

    e.stopPropagation()

    // ── Tool Specific Direct Actions on Object ──
    if (activeTool === "eyedropper") {
      if (eyedropperPhase === "sample") {
        // ── First click: sample / pick color from this object ──
        const sampled = (obj.fill && obj.fill !== "none") ? obj.fill : (obj.stroke || "#000000")
        setEyedropperSampledColor(sampled)
        setEyedropperPhase("apply")
        if (onChangeActiveColor) {
          onChangeActiveColor(sampled)
        }
        toast.success(`Color Picked: ${sampled} — click any object to apply`)
      } else {
        // ── Second click: apply / paste the sampled color onto this object ──
        if (eyedropperSampledColor) {
          onUpdateObject(obj.id, { fill: eyedropperSampledColor })
          toast.success(`Applied ${eyedropperSampledColor} to ${obj.name || obj.type}`)
        }
        // Reset back to sample mode for the next pick cycle
        setEyedropperPhase("sample")
        setEyedropperSampledColor(null)
      }
      return
    }

    if (activeTool === "color") {
      onUpdateObject(obj.id, { fill: activeColor })
      toast.success(`Applied fill: ${activeColor}`)
      return
    }

    if (activeTool === "stroke") {
      const widths = [0, 2, 4, 8, 12]
      const nextWidth = widths[(widths.indexOf(obj.strokeWidth || 0) + 1) % widths.length]
      onUpdateObject(obj.id, { stroke: activeColor, strokeWidth: nextWidth })
      toast.success(`Stroke width set to ${nextWidth}px`)
      return
    }

    if (activeTool === "shadow") {
      const nextEnabled = !obj.shadowEnabled
      onUpdateObject(obj.id, {
        shadowEnabled: nextEnabled,
        shadowBlur: 16,
        shadowOffsetY: 8,
        shadowColor: "rgba(0,0,0,0.3)"
      })
      toast.success(`Drop shadow ${nextEnabled ? "enabled" : "disabled"}`)
      return
    }

    if (activeTool === "transparency") {
      const opacities = [1, 0.75, 0.5, 0.25]
      const currentIdx = opacities.findIndex((o) => Math.abs(o - obj.opacity) < 0.05)
      const nextOpacity = opacities[(currentIdx + 1) % opacities.length]
      onUpdateObject(obj.id, { opacity: nextOpacity })
      toast.success(`Opacity set to ${Math.round(nextOpacity * 100)}%`)
      return
    }

    if (activeTool === "blend") {
      const modes = ["normal", "multiply", "screen", "overlay", "darken", "lighten", "difference"]
      const nextMode = modes[(modes.indexOf(obj.blendMode || "normal") + 1) % modes.length]
      onUpdateObject(obj.id, { blendMode: nextMode as any })
      toast.success(`Blend mode: ${nextMode}`)
      return
    }

    if (activeTool === "zoom") {
      const { x, y } = getCanvasCoords(e.clientX, e.clientY)
      const isZoomOut = e.altKey || e.shiftKey
      const zoomFactor = isZoomOut ? 0.75 : 1.3
      const nextZoom = Number(Math.min(50.0, Math.max(0.05, settings.zoom * zoomFactor)).toFixed(2))
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const newPanX = mouseX - x * nextZoom
        const newPanY = mouseY - y * nextZoom
        onUpdateSettings((prev) => ({
          ...prev,
          zoom: nextZoom,
          panX: Math.round(newPanX),
          panY: Math.round(newPanY),
        }))
      }
      return
    }

    const isMulti = e.shiftKey
    if (!selectedIds.includes(obj.id)) {
      onSelectObject(obj.id, isMulti)
    }

    if (activeTool === "anchor") {
      const { x, y } = getCanvasCoords(e.clientX, e.clientY)
      // Ensure the object has penNodes so it can be edited as vector
      let activeNodes = obj.penNodes
      if (!activeNodes) {
        const { nodes, isClosed } = extractPenNodesFromObject(obj)
        const bounds = computeBoundsFromNodes(nodes)
        const pathData = buildPenSvgPath(nodes, isClosed)
        onUpdateObject(obj.id, {
          type: "path",
          penNodes: nodes,
          pathData,
          ...bounds,
        })
        activeNodes = nodes
      }
      // Select the anchor node closest to the user's click
      let closestIdx = 0
      let closestDist = Infinity
      activeNodes.forEach((n, idx) => {
        const dist = Math.hypot(n.x - x, n.y - y)
        if (dist < closestDist) {
          closestDist = dist
          closestIdx = idx
        }
      })
      setActiveAnchorNode(closestDist < 45 ? closestIdx : 0)
      return
    }

    if (activeTool === "select") {
      const { x, y } = getCanvasCoords(e.clientX, e.clientY)
      const initialObjs: Record<
        string,
        {
          x: number
          y: number
          w: number
          h: number
          penNodes?: PenNode[]
          pathData?: string
          points?: { x: number; y: number }[]
        }
      > = {}
      const targetIds = selectedIds.includes(obj.id) ? selectedIds : [obj.id]
      targetIds.forEach((id) => {
        const found = objects.find((o) => o.id === id)
        if (found) {
          initialObjs[id] = {
            x: found.x,
            y: found.y,
            w: found.width,
            h: found.height,
            penNodes: found.penNodes ? found.penNodes.map((n) => ({
              x: n.x,
              y: n.y,
              cpIn: n.cpIn ? { ...n.cpIn } : null,
              cpOut: n.cpOut ? { ...n.cpOut } : null,
            })) : undefined,
            pathData: found.pathData,
            points: found.points ? found.points.map((p) => ({ ...p })) : undefined,
          }
        }
      })

      setIsInteracting("move")
      setInteractionStart({ startX: x, startY: y, initialObjs })
    }
  }

  // ─── 8. Anchor Point Tool Handlers ───────────────────────────────────────
  const handleAnchorNodeMouseDown = (
    e: React.MouseEvent,
    obj: CanvasObject,
    nodeIdx: number
  ) => {
    e.stopPropagation()
    e.preventDefault()
    setActiveAnchorNode(nodeIdx)
    if (!selectedIds.includes(obj.id)) {
      onSelectObject(obj.id, false)
    }

    const { nodes, isClosed } = extractPenNodesFromObject(obj)

    if (e.altKey) {
      // Alt key: toggle corner vs smooth
      const isSmooth = Boolean(nodes[nodeIdx]?.cpIn || nodes[nodeIdx]?.cpOut)
      const updated = isSmooth
        ? convertNodeToCorner(nodes, nodeIdx)
        : convertNodeToSmooth(nodes, nodeIdx, isClosed)
      const bounds = computeBoundsFromNodes(updated)
      const pathData = buildPenSvgPath(updated, isClosed)
      onUpdateObject(obj.id, { type: "path", penNodes: updated, pathData, ...bounds })
      toast.info(isSmooth ? "Converted anchor to sharp corner" : "Converted anchor to smooth curve")
      return
    }

    const { x, y } = getCanvasCoords(e.clientX, e.clientY)
    setIsInteracting("anchor-move-node")
    setAnchorDragState({
      objId: obj.id,
      type: "node",
      nodeIdx,
      startX: x,
      startY: y,
      initialNodes: nodes.map((n) => ({ ...n })),
      isClosed,
    })
  }

  const handleAnchorNodeDoubleClick = (
    e: React.MouseEvent,
    obj: CanvasObject,
    nodeIdx: number
  ) => {
    e.stopPropagation()
    e.preventDefault()
    setActiveAnchorNode(nodeIdx)
    const { nodes, isClosed } = extractPenNodesFromObject(obj)
    const isSmooth = Boolean(nodes[nodeIdx]?.cpIn || nodes[nodeIdx]?.cpOut)
    const updated = isSmooth
      ? convertNodeToCorner(nodes, nodeIdx)
      : convertNodeToSmooth(nodes, nodeIdx, isClosed)
    const bounds = computeBoundsFromNodes(updated)
    const pathData = buildPenSvgPath(updated, isClosed)
    onUpdateObject(obj.id, { type: "path", penNodes: updated, pathData, ...bounds })
    toast.info(isSmooth ? "Converted anchor to sharp corner" : "Converted anchor to smooth curve")
  }

  const handleAnchorHandleMouseDown = (
    e: React.MouseEvent,
    obj: CanvasObject,
    nodeIdx: number,
    handleType: "in" | "out"
  ) => {
    e.stopPropagation()
    e.preventDefault()
    setActiveAnchorNode(nodeIdx)
    const { nodes, isClosed } = extractPenNodesFromObject(obj)
    const { x, y } = getCanvasCoords(e.clientX, e.clientY)
    setIsInteracting(handleType === "out" ? "anchor-drag-cpout" : "anchor-drag-cpin")
    setAnchorDragState({
      objId: obj.id,
      type: handleType === "out" ? "handle-out" : "handle-in",
      nodeIdx,
      startX: x,
      startY: y,
      initialNodes: nodes.map((n) => ({ ...n })),
      isClosed,
    })
  }

  const handlePathClickToAddNode = (
    e: React.MouseEvent,
    obj: CanvasObject
  ) => {
    if (activeTool !== "anchor") return
    e.stopPropagation()
    const { x, y } = getCanvasCoords(e.clientX, e.clientY)
    const { nodes, isClosed } = extractPenNodesFromObject(obj)
    const { newNodes, insertedIndex } = insertNodeOnSegment(nodes, { x, y }, isClosed)
    const bounds = computeBoundsFromNodes(newNodes)
    const pathData = buildPenSvgPath(newNodes, isClosed)
    onUpdateObject(obj.id, { type: "path", penNodes: newNodes, pathData, ...bounds })
    setActiveAnchorNode(insertedIndex)
    toast.success("Added new anchor point to path")
  }

  // ─── 8. Resize Node Click ────────────────────────────────────────────
  const handleResizeNodeMouseDown = (e: React.MouseEvent, handle: string) => {
    if (e.button === 1 || isSpacePressed) return
    e.stopPropagation()
    if (selectedIds.length !== 1) return
    const { x, y } = getCanvasCoords(e.clientX, e.clientY)

    const obj = objects.find((o) => o.id === selectedIds[0])
    if (!obj) return

    setIsInteracting("resize")
    setActiveHandle(handle)
    setInteractionStart({
      startX: x,
      startY: y,
      initialObjs: {
        [obj.id]: { x: obj.x, y: obj.y, w: obj.width, h: obj.height },
      },
    })
  }

  // ─── 9. Drag & Drop File Upload ──────────────────────────────────────
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileDrop(e.dataTransfer.files)
    }
  }

  // ─── 10. Fit & Reset Zoom Helpers ────────────────────────────────────
  const handleFitToScreen = () => {
    if (!workspaceRef.current) return
    const w = workspaceRef.current.clientWidth
    const h = workspaceRef.current.clientHeight
    const fitZoom = Math.min(
      1.0,
      Math.min((w - 140) / pageWidthPx, (h - 140) / pageHeightPx)
    )
    const roundedZoom = Number(Math.max(0.2, fitZoom).toFixed(2))
    const cx = (w - pageWidthPx * roundedZoom) / 2
    const cy = (h - pageHeightPx * roundedZoom) / 2
    onUpdateSettings((prev) => ({
      ...prev,
      zoom: roundedZoom,
      panX: Math.round(cx),
      panY: Math.round(cy),
    }))
  }

  const handleResetZoom100 = () => {
    const targetEl = svgRef.current || workspaceRef.current
    if (!targetEl) return
    const rect = targetEl.getBoundingClientRect()
    const cx = (rect.width - pageWidthPx) / 2
    const cy = (rect.height - pageHeightPx) / 2
    onUpdateSettings((prev) => ({
      ...prev,
      zoom: 1,
      panX: Math.round(cx),
      panY: Math.round(cy),
    }))
  }

  return (
    <div
      ref={workspaceRef}
      onMouseDown={handleWorkspaceMouseDown}
      onMouseMove={handleWorkspaceMouseMove}
      onMouseUp={handleWorkspaceMouseUp}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      style={{
        backgroundColor: settings.workspaceColor || undefined,
        cursor: isPanning
          ? "grabbing"
          : isSpacePressed
          ? "grab"
          : activeTool === "pen"
          ? `url('${PEN_CURSOR_SVG}') 2 2, crosshair`
          : activeTool === "anchor"
          ? `url('${ANCHOR_CURSOR_SVG}') 12 4, crosshair`
          : activeTool === "eyedropper" && eyedropperPhase === "apply" && eyedropperSampledColor
          ? `url('${buildEyedropperApplyCursor(eyedropperSampledColor)}') 4 24, copy`
          : activeTool === "eyedropper"
          ? `url('${EYEDROPPER_SAMPLE_CURSOR}') 4 24, crosshair`
          : undefined,
      }}
      className={cn(
        "relative flex-1 flex flex-col w-full h-full bg-[#9ca3af]/40 dark:bg-[#1e293b]/70 overflow-hidden select-none",
        isPanning
          ? "cursor-grabbing"
          : isSpacePressed
          ? "cursor-grab"
          : activeTool === "pen" || activeTool === "anchor"
          ? ""
          : activeTool === "select"
          ? "cursor-default"
          : activeTool === "text"
          ? "cursor-text"
          : activeTool === "zoom"
          ? "cursor-zoom-in"
          : activeTool === "eyedropper"
          ? ""
          : activeTool === "color" || activeTool === "stroke" || activeTool === "shadow" || activeTool === "transparency" || activeTool === "blend"
          ? "cursor-pointer"
          : "cursor-crosshair"
      )}
    >
      {/* ─── 1. Top Horizontal Ruler (Smooth slide & soft fade in/out) ──── */}
      <div
        className={cn(
          "w-full bg-card/90 backdrop-blur-md flex items-center z-10 shrink-0 overflow-hidden",
          "will-change-[height,opacity] transition-[height,opacity,border-color] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]",
          settings.showRulers
            ? "h-[17px] opacity-100 border-b border-border/70 pointer-events-auto"
            : "h-0 opacity-0 border-b-transparent pointer-events-none"
        )}
      >
        <div
          className={cn(
            "w-[17px] h-[17px] min-w-[17px] min-h-[17px] border-r border-border/70 shrink-0 bg-muted/40 font-mono text-[8px] flex items-center justify-center text-muted-foreground font-bold leading-none",
            "transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]",
            settings.showRulers ? "translate-y-0" : "-translate-y-2"
          )}
        >
          {settings.unit}
        </div>
        <svg
          className={cn(
            "w-full h-[17px] min-h-[17px] text-muted-foreground/60 font-mono text-[8px]",
            "transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]",
            settings.showRulers ? "translate-y-0" : "-translate-y-2"
          )}
        >
          {/* Ticks rendered with pan offset & zoom scaling */}
          {Array.from({ length: 80 }).map((_, i) => {
            const tickPos = (settings.panX || 0) + i * 50 * settings.zoom
            let tickValue: number = Math.round((i * 50) / scaleRatio)
            if (settings.unit === "px") {
              tickValue = i * 50
            } else if (settings.unit === "pt") {
              tickValue = Math.round(((i * 50) / scaleRatio) * (72 / 25.4))
            } else if (settings.unit === "in") {
              tickValue = parseFloat(((i * 50) / (scaleRatio * 25.4)).toFixed(2))
            } else if (settings.unit === "ft") {
              tickValue = parseFloat(((i * 50) / (scaleRatio * 304.8)).toFixed(3))
            } else if (settings.unit === "cm") {
              tickValue = parseFloat(((i * 50) / (scaleRatio * 10)).toFixed(1))
            }
            return (
              <g key={i} transform={`translate(${tickPos}, 0)`}>
                <line x1="0" y1="9" x2="0" y2="17" stroke="currentColor" strokeWidth="0.8" />
                <line x1="25" y1="12" x2="25" y2="17" stroke="currentColor" strokeWidth="0.6" />
                <text x="3" y="8" fill="currentColor">
                  {tickValue}
                </text>
              </g>
            )
          })}
          {/* Real-time Hairline indicator tracking cursor */}
          <line
            x1={mouseScreenPos.x}
            y1="0"
            x2={mouseScreenPos.x}
            y2="17"
            stroke="#06b6d4"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* ─── 2. Center Workspace (Vertical Ruler + Scaled Canvas Layer) ─ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Vertical Left Ruler (Smooth slide & soft fade in/out) */}
        <div
          className={cn(
            "h-full bg-card/90 backdrop-blur-md shrink-0 z-10 sticky left-0 overflow-hidden",
            "will-change-[width,opacity] transition-[width,opacity,border-color] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]",
            settings.showRulers
              ? "w-[17px] opacity-100 border-r border-border/70 pointer-events-auto"
              : "w-0 opacity-0 border-r-transparent pointer-events-none"
          )}
        >
          <svg
            className={cn(
              "w-[17px] min-w-[17px] h-full text-muted-foreground/60 font-mono text-[8px]",
              "transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]",
              settings.showRulers ? "translate-x-0" : "-translate-x-2"
            )}
          >
            {Array.from({ length: 80 }).map((_, i) => {
              const tickPos = (settings.panY || 0) + i * 50 * settings.zoom
              let tickValue: number = Math.round((i * 50) / scaleRatio)
              if (settings.unit === "px") {
                tickValue = i * 50
              } else if (settings.unit === "pt") {
                tickValue = Math.round(((i * 50) / scaleRatio) * (72 / 25.4))
              } else if (settings.unit === "in") {
                tickValue = parseFloat(((i * 50) / (scaleRatio * 25.4)).toFixed(2))
              } else if (settings.unit === "ft") {
                tickValue = parseFloat(((i * 50) / (scaleRatio * 304.8)).toFixed(3))
              } else if (settings.unit === "cm") {
                tickValue = parseFloat(((i * 50) / (scaleRatio * 10)).toFixed(1))
              }
              return (
                <g key={i} transform={`translate(0, ${tickPos})`}>
                  <line x1="9" y1="0" x2="17" y2="0" stroke="currentColor" strokeWidth="0.8" />
                  <line x1="12" y1="25" x2="17" y2="25" stroke="currentColor" strokeWidth="0.6" />
                  <text x="1.5" y="8" fill="currentColor">
                    {tickValue}
                  </text>
                </g>
              )
            })}
            <line
              x1="0"
              y1={mouseScreenPos.y}
              x2="17"
              y2={mouseScreenPos.y}
              stroke="#06b6d4"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* ─── 3. Full-Precision Infinite Vector SVG Viewport (CorelDRAW Quality) ── */}
        <div
          className="flex-1 h-full overflow-hidden relative"
          style={{
            backgroundColor: settings.workspaceColor || undefined,
          }}
        >
          {/* Floating Pen Tool Controls */}
          {activeTool === "pen" && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-background/90 dark:bg-card/90 backdrop-blur-md border border-[#548235]/40 shadow-lg select-none transition-all pointer-events-auto">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <PenTool className="w-3.5 h-3.5 text-[#548235]" />
                <span>Bézier Pen Tool</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#548235]/15 text-[#548235] font-bold">
                  {penNodes.length === 0
                    ? "Click to start"
                    : `${penNodes.length} anchor${penNodes.length > 1 ? "s" : ""}`}
                </span>
              </div>

              <div className="h-3.5 w-px bg-border/80" />

              {penNodes.length >= 2 && (
                <button
                  type="button"
                  onClick={() => finalizePenPath(false)}
                  className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#548235] hover:bg-[#436829] text-white transition-all shadow-xs cursor-pointer"
                  title="Finish open stroke path (Enter or Double-click)"
                >
                  Finish Path
                  <kbd className="text-[9px] px-1 bg-white/20 rounded font-mono">↵</kbd>
                </button>
              )}

              {penNodes.length >= 3 && (
                <button
                  type="button"
                  onClick={() => finalizePenPath(true)}
                  className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white transition-all shadow-xs cursor-pointer"
                  title="Close shape with active color fill"
                >
                  Close Shape
                </button>
              )}

              {penNodes.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setPenNodes([])
                    setActiveDragNodeIdx(null)
                    setPenDragAnchor(null)
                    setIsInteracting(null)
                    toast.info("Pen drawing cancelled")
                  }}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  title="Cancel drawing (Escape)"
                >
                  Cancel <kbd className="text-[9px] px-1 bg-muted rounded font-mono">Esc</kbd>
                </button>
              ) : (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  Click for corner • Drag for smooth curve • Shift for 45°
                </span>
              )}
            </div>
          )}

          {/* Floating Frame Tool Controls / Banner */}
          {activeTool === "frame" && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-background/90 dark:bg-card/90 backdrop-blur-md border border-[#548235]/40 shadow-lg select-none transition-all pointer-events-auto">
              <FrameToolIcon className="w-3.5 h-3.5 text-[#548235]" />
              <span className="text-xs font-semibold text-foreground">Frame Tool</span>
              <div className="h-3.5 w-px bg-border/80" />
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                Click & drag on canvas to draw any page size • Click to add standard page
              </span>
            </div>
          )}

          {/* Floating Anchor Point Tool Controls / Banner */}
          {activeTool === "anchor" && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-background/90 dark:bg-card/90 backdrop-blur-md border border-[#2563eb]/40 shadow-lg select-none transition-all pointer-events-auto">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2563eb] animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-foreground">Anchor Point Tool</span>
              <div className="h-3.5 w-px bg-border/80" />
              <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <span>Click & drag node</span>
                <span>•</span>
                <span>Drag handle to curve</span>
                <span>•</span>
                <span>Double-click to toggle smooth/corner</span>
                <span>•</span>
                <span>Click path to add point</span>
                <span>•</span>
                <kbd className="text-[9px] px-1 bg-muted rounded font-mono">Del</kbd> to delete
              </span>
            </div>
          )}

          {/* Floating Crop Tool Banner */}
          {activeTool === "crop" && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-background/90 dark:bg-card/90 backdrop-blur-md border border-[#10b981]/40 shadow-lg select-none transition-all pointer-events-auto">
              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-foreground">Crop Tool</span>
              <div className="h-3.5 w-px bg-border/80" />
              {cropState && cropState.w >= 10 && cropState.h >= 10 ? (
                <>
                  <button
                    type="button"
                    onClick={() => applyCrop()}
                    className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#10b981] hover:bg-[#0d9e72] text-white transition-all shadow-xs cursor-pointer"
                  >
                    ✓ Apply Crop
                  </button>
                  <button
                    type="button"
                    onClick={() => resetCrop()}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  >
                    Reset
                  </button>
                  <div className="h-3.5 w-px bg-border/80" />
                  <span className="text-[11px] text-muted-foreground">
                    <kbd className="text-[9px] px-1 bg-muted rounded font-mono">Enter</kbd> apply • <kbd className="text-[9px] px-1 bg-muted rounded font-mono">Esc</kbd> cancel • Double-click to apply
                  </span>
                </>
              ) : (
                <span className="text-[11px] text-muted-foreground">Drag on canvas to define crop area</span>
              )}
              <div className="h-3.5 w-px bg-border/80" />
              <button
                type="button"
                onClick={() => setCropState(null)}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                Exit <kbd className="text-[9px] px-1 bg-muted rounded font-mono">Esc</kbd>
              </button>
            </div>
          )}

          <svg
            ref={svgRef}
            id="canvas-viewport-svg"
            className="w-full h-full absolute inset-0 select-none overflow-hidden"
            style={{
              shapeRendering: "geometricPrecision",
              textRendering: "geometricPrecision",
              cursor: isPanning
                ? "grabbing"
                : isSpacePressed
                ? "grab"
                : activeTool === "pen"
                ? `url('${PEN_CURSOR_SVG}') 2 2, crosshair`
                : activeTool === "anchor"
                ? `url('${ANCHOR_CURSOR_SVG}') 12 4, crosshair`
                : activeTool === "eyedropper" && eyedropperPhase === "apply" && eyedropperSampledColor
                ? `url('${buildEyedropperApplyCursor(eyedropperSampledColor)}') 4 24, copy`
                : activeTool === "eyedropper"
                ? `url('${EYEDROPPER_SAMPLE_CURSOR}') 4 24, crosshair`
                : activeTool === "frame"
                ? "crosshair"
                : undefined,
            }}
            onMouseDown={handleCanvasMouseDown}
            onDoubleClick={handleCanvasDoubleClick}
          >
            <defs>
              <filter id="page-drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="12" stdDeviation="24" floodColor="#000000" floodOpacity="0.25" />
              </filter>
              <filter id="obj-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="6" dy="8" stdDeviation="8" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Direct Vector Transformation Matrix Layer */}
            <g
              id="canvas-transformed-layer"
              transform={`translate(${settings.panX || 0}, ${settings.panY || 0}) scale(${settings.zoom || 1})`}
            >
              {/* Document Dimension Label at Top (as seen in screenshot) */}
              <text
                x="0"
                y="-10"
                fontFamily="monospace"
                fontSize="12"
                fontWeight="bold"
                fill="#2563eb"
                className="select-none pointer-events-none"
              >
                {settings.pageSize}: {formatUnitValue(settings.widthMm, settings.unit)} {settings.unit} × {formatUnitValue(settings.heightMm, settings.unit)} {settings.unit}
              </text>

              {/* Central White Sheet Canvas Page (Always Pure White) */}
              <rect
                id="canvas-bg-sheet"
                x="0"
                y="0"
                width={pageWidthPx}
                height={pageHeightPx}
                fill="#ffffff"
                filter="url(#page-drop-shadow)"
                stroke="rgba(0,0,0,0.18)"
                strokeWidth={1 / (settings.zoom || 1)}
                style={{
                  transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1), height 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                className={
                  activeTool === "pen" || activeTool === "pencil"
                    ? "cursor-inherit"
                    : activeTool === "select"
                    ? "cursor-default"
                    : activeTool === "frame"
                    ? "cursor-crosshair"
                    : "cursor-inherit"
                }
              />

              {/* Render Canvas Objects (Frames render first as page sheets) */}
              {[...visibleObjects]
                .sort((a, b) => {
                  if (a.type === "frame" && b.type !== "frame") return -1
                  if (a.type !== "frame" && b.type === "frame") return 1
                  return (a.zIndex || 0) - (b.zIndex || 0)
                })
                .map((obj) => {
                const isSelected = selectedIds.includes(obj.id)
                const shadowFilter = obj.shadowEnabled ? "url(#obj-shadow)" : undefined
                const zoomFactor = settings.zoom || 1

                return (
                  <g
                    key={obj.id}
                    id={`canvas-obj-${obj.id}`}
                    onMouseDown={(e) => handleObjectMouseDown(e, obj)}
                    onDoubleClick={(e) => {
                      if (obj.type === "text") {
                        e.stopPropagation()
                        setEditingText({
                          id: obj.id,
                          x: obj.x,
                          y: obj.y,
                          text: obj.text || "",
                          isNew: false,
                          fontSize: obj.fontSize || 28,
                          fontFamily: obj.fontFamily || "Poppins",
                          fontWeight: obj.fontWeight || "bold",
                          fill: obj.fill || "#000000",
                          stroke: obj.stroke || "none",
                          strokeWidth: obj.strokeWidth || 0,
                        })
                        setTimeout(() => inlineTextareaRef.current?.focus(), 40)
                      }
                    }}
                    className={
                      activeTool === "select"
                        ? "cursor-move"
                        : activeTool === "frame" || activeTool === "anchor"
                        ? "cursor-crosshair"
                        : activeTool === "text"
                        ? "cursor-text"
                        : "cursor-inherit"
                    }
                    style={{
                      opacity: obj.opacity,
                      mixBlendMode: obj.blendMode as any,
                    }}
                  >
                    {/* Frame (Artboard Page like Main Page in Any Size) */}
                    {obj.type === "frame" && (
                      <g id={`frame-sheet-group-${obj.id}`}>
                        {/* Page Dimension Header Label (Identical to Main Page) */}
                        <text
                          x={obj.x}
                          y={obj.y - 10}
                          fontFamily="monospace"
                          fontSize="12"
                          fontWeight="bold"
                          fill="#2563eb"
                          className="select-none pointer-events-none"
                        >
                          {obj.name}: {(obj.width / scaleRatio).toFixed(1)} mm × {(obj.height / scaleRatio).toFixed(1)} mm
                        </text>

                        {/* Central White Sheet Canvas Page Rect with drop shadow */}
                        <rect
                          id={`canvas-frame-sheet-${obj.id}`}
                          x={obj.x}
                          y={obj.y}
                          width={obj.width}
                          height={obj.height}
                          fill={obj.fill || "#ffffff"}
                          filter="url(#page-drop-shadow)"
                          stroke={isSelected ? "#06b6d4" : "rgba(0,0,0,0.18)"}
                          strokeWidth={isSelected ? 1.5 / zoomFactor : 1 / zoomFactor}
                          className={
                            activeTool === "select"
                              ? "cursor-move"
                              : activeTool === "frame"
                              ? "cursor-crosshair"
                              : "cursor-default"
                          }
                        />
                      </g>
                    )}

                    {/* Rectangle */}
                    {obj.type === "rectangle" && (
                      <rect
                        x={obj.x}
                        y={obj.y}
                        width={obj.width}
                        height={obj.height}
                        rx={obj.cornerRadius || 0}
                        fill={obj.fill}
                        stroke={obj.stroke}
                        strokeWidth={obj.strokeWidth}
                        filter={shadowFilter}
                      />
                    )}

                    {/* Circle */}
                    {obj.type === "circle" && (
                      <ellipse
                        cx={obj.x + obj.width / 2}
                        cy={obj.y + obj.height / 2}
                        rx={obj.width / 2}
                        ry={obj.height / 2}
                        fill={obj.fill}
                        stroke={obj.stroke}
                        strokeWidth={obj.strokeWidth}
                        filter={shadowFilter}
                      />
                    )}

                    {/* Shapes */}
                    {obj.type === "shape" && obj.subtype && ShapeRegistry[obj.subtype] && (
                      <g transform={`translate(${obj.x}, ${obj.y})`} filter={shadowFilter}>
                        <path
                          d={ShapeRegistry[obj.subtype].generatePath(obj.width, obj.height)}
                          fill={obj.subtype === "line" ? "none" : obj.fill}
                          stroke={obj.subtype === "line" ? (obj.stroke !== "none" ? obj.stroke : obj.fill) : obj.stroke}
                          strokeWidth={obj.strokeWidth || (obj.subtype === "line" ? 3 : 2)}
                          strokeLinecap="round"
                        />
                      </g>
                    )}

                    {/* Pencil / Pen Paths */}
                    {(obj.type === "pencil" || obj.type === "path") && obj.pathData && (
                      <path
                        d={obj.pathData}
                        fill={obj.fill}
                        stroke={obj.stroke}
                        strokeWidth={obj.strokeWidth}
                        strokeLinecap={obj.strokeLineCap || "round"}
                        strokeLinejoin={obj.strokeLineJoin || "round"}
                        filter={shadowFilter}
                      />
                    )}

                    {/* CorelDRAW Text (Artistic & Paragraph Frame) */}
                    {obj.type === "text" && (
                      <g
                        transform={`translate(${obj.x}, ${obj.y})`}
                        filter={shadowFilter}
                        style={{ display: editingText?.id === obj.id ? "none" : undefined }}
                      >
                        {/* Optional Paragraph Frame Box Background & Border */}
                        {obj.textType === "paragraph" && (
                          <rect
                            x={0}
                            y={0}
                            width={Math.max(obj.width, 40)}
                            height={Math.max(obj.height, 24)}
                            fill={obj.frameBackground || "transparent"}
                            stroke={
                              obj.frameBorderWidth && obj.frameBorderWidth > 0
                                ? obj.frameBorderColor || "#000000"
                                : "transparent"
                            }
                            strokeWidth={obj.frameBorderWidth || 0}
                            className="pointer-events-none"
                          />
                        )}

                        <foreignObject
                          x={0}
                          y={0}
                          width={Math.max(obj.width, 40)}
                          height={Math.max(obj.height, 24)}
                          className="overflow-visible select-none pointer-events-none"
                        >
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              boxSizing: "border-box",
                              padding: `${obj.framePadding || 0}px`,
                              fontFamily: obj.fontFamily || "Poppins, sans-serif",
                              fontSize: `${obj.fontSize || 24}px`,
                              fontWeight: obj.fontWeight || "bold",
                              fontStyle: obj.fontStyle || "normal",
                              textDecoration: obj.textDecoration || "none",
                              textTransform: (obj.textTransform as any) || "none",
                              fontVariant: obj.fontVariant || "normal",
                              textAlign: obj.textAlign || "left",
                              letterSpacing: obj.letterSpacing ? `${obj.letterSpacing}px` : undefined,
                              wordSpacing: obj.wordSpacing ? `${obj.wordSpacing}px` : undefined,
                              lineHeight: obj.lineHeight || 1.25,
                              color: obj.fill || "#000000",
                              writingMode:
                                obj.textOrientation === "vertical" ? "vertical-rl" : "horizontal-tb",
                              columnCount: obj.textType === "paragraph" ? obj.textColumns || 1 : 1,
                              columnGap: `${obj.columnGutter || 16}px`,
                              textIndent: obj.firstLineIndent ? `${obj.firstLineIndent}px` : undefined,
                              verticalAlign:
                                obj.verticalScript === "superscript"
                                  ? "super"
                                  : obj.verticalScript === "subscript"
                                  ? "sub"
                                  : undefined,
                              transform: `scale(${((obj.horizontalScale || 100) / 100)}, ${
                                ((obj.verticalScale || 100) / 100)
                              }) translateY(${-(obj.baselineShift || 0)}px)`,
                              transformOrigin: "top left",
                              WebkitTextStroke:
                                obj.stroke && obj.stroke !== "none" && (obj.strokeWidth || 0) > 0
                                  ? `${obj.strokeWidth}px ${obj.stroke}`
                                  : undefined,
                              paintOrder: obj.strokeBehindFill ? "stroke fill" : "fill stroke",
                              whiteSpace: obj.textType === "paragraph" ? "pre-wrap" : "nowrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {obj.text || "Text Box"}
                          </div>
                        </foreignObject>
                      </g>
                    )}

                    {/* Image (with optional cropRect clipPath) */}
                    {obj.type === "image" && obj.src && (() => {
                      const cr = obj.cropRect
                      const clipId = `crop-clip-${obj.id}`
                      if (cr) {
                        return (
                          <g>
                            <defs>
                              <clipPath id={clipId}>
                                <rect x={obj.x + cr.x} y={obj.y + cr.y} width={cr.width} height={cr.height} />
                              </clipPath>
                            </defs>
                            <image
                              href={obj.src}
                              x={obj.x}
                              y={obj.y}
                              width={obj.width}
                              height={obj.height}
                              preserveAspectRatio="none"
                              clipPath={`url(#${clipId})`}
                              filter={shadowFilter}
                            />
                          </g>
                        )
                      }
                      return (
                        <image
                          href={obj.src}
                          x={obj.x}
                          y={obj.y}
                          width={obj.width}
                          height={obj.height}
                          preserveAspectRatio="none"
                          filter={shadowFilter}
                        />
                      )
                    })()}

                    {/* Crisp Selection Outline & Handles (matching screenshot) */}
                    {isSelected && activeTool !== "anchor" && (
                      <g id={`selection-box-${obj.id}`}>
                        {/* Solid cyan-blue highlight border around the object boundary */}
                        <rect
                          x={obj.x}
                          y={obj.y}
                          width={obj.width}
                          height={obj.height}
                          rx={obj.cornerRadius || 0}
                          fill="none"
                          stroke="#00a8ff"
                          strokeWidth={2 / zoomFactor}
                          pointerEvents="none"
                        />

                        {/* Handles (hidden during active marquee dragging for clean visual matching screenshot) */}
                        {!marqueeBox && (
                          <g id={`selection-handles-${obj.id}`}>
                            {[
                              { h: "nw", cx: obj.x, cy: obj.y, cursor: "nwse-resize" },
                              { h: "n", cx: obj.x + obj.width / 2, cy: obj.y, cursor: "ns-resize" },
                              { h: "ne", cx: obj.x + obj.width, cy: obj.y, cursor: "nesw-resize" },
                              { h: "e", cx: obj.x + obj.width, cy: obj.y + obj.height / 2, cursor: "ew-resize" },
                              { h: "se", cx: obj.x + obj.width, cy: obj.y + obj.height, cursor: "nwse-resize" },
                              { h: "s", cx: obj.x + obj.width / 2, cy: obj.y + obj.height, cursor: "ns-resize" },
                              { h: "sw", cx: obj.x, cy: obj.y + obj.height, cursor: "nesw-resize" },
                              { h: "w", cx: obj.x, cy: obj.y + obj.height / 2, cursor: "ew-resize" },
                            ].map((handle) => {
                              const hSize = 7.5 / zoomFactor
                              return (
                                <rect
                                  key={handle.h}
                                  x={handle.cx - hSize / 2}
                                  y={handle.cy - hSize / 2}
                                  width={hSize}
                                  height={hSize}
                                  fill="#ffffff"
                                  stroke="#00a8ff"
                                  strokeWidth={1.5 / zoomFactor}
                                  onMouseDown={(e) => handleResizeNodeMouseDown(e, handle.h)}
                                  style={{ cursor: handle.cursor }}
                                  className="hover:scale-125 transition-transform"
                                />
                              )
                            })}
                          </g>
                        )}
                      </g>
                    )}

                    {/* Vector Anchor Point Editor (when Anchor Tool is active on selected object) */}
                    {isSelected && activeTool === "anchor" && (
                      <g id={`anchor-editor-${obj.id}`}>
                        {/* 1. Path Outline Hairline (interactive: click anywhere to add anchor point) */}
                        <path
                          d={
                            obj.pathData ||
                            buildPenSvgPath(
                              extractPenNodesFromObject(obj).nodes,
                              extractPenNodesFromObject(obj).isClosed
                            )
                          }
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth={2 / zoomFactor}
                          strokeDasharray={`${4 / zoomFactor} ${3 / zoomFactor}`}
                          pointerEvents="stroke"
                          className="cursor-crosshair"
                          onClick={(e) => handlePathClickToAddNode(e, obj)}
                        >
                          <title>Click path outline to insert new anchor point</title>
                        </path>

                        {/* Generous invisible stroke to make clicking on the path boundary easy */}
                        <path
                          d={
                            obj.pathData ||
                            buildPenSvgPath(
                              extractPenNodesFromObject(obj).nodes,
                              extractPenNodesFromObject(obj).isClosed
                            )
                          }
                          fill="none"
                          stroke="transparent"
                          strokeWidth={Math.max(14, 18 / zoomFactor)}
                          pointerEvents="stroke"
                          className="cursor-crosshair"
                          onClick={(e) => handlePathClickToAddNode(e, obj)}
                        >
                          <title>Click to add anchor point</title>
                        </path>

                        {/* 2. Direction Tangent Handles for the selected anchor node */}
                        {(() => {
                          const nodes = obj.penNodes || extractPenNodesFromObject(obj).nodes
                          const selectedNode =
                            activeAnchorIdx !== null ? nodes[activeAnchorIdx] : null
                          if (!selectedNode) return null

                          return (
                            <g id="selected-anchor-tangents">
                              {/* In-handle line & circular tip */}
                              {selectedNode.cpIn && (
                                <g>
                                  <line
                                    x1={selectedNode.x}
                                    y1={selectedNode.y}
                                    x2={selectedNode.cpIn.x}
                                    y2={selectedNode.cpIn.y}
                                    stroke="#06b6d4"
                                    strokeWidth={1.5 / zoomFactor}
                                    pointerEvents="none"
                                  />
                                  {/* Generous invisible handle grip target */}
                                  <circle
                                    cx={selectedNode.cpIn.x}
                                    cy={selectedNode.cpIn.y}
                                    r={Math.max(10, 14 / zoomFactor)}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseDown={(e) =>
                                      handleAnchorHandleMouseDown(e, obj, activeAnchorIdx!, "in")
                                    }
                                  />
                                  <circle
                                    cx={selectedNode.cpIn.x}
                                    cy={selectedNode.cpIn.y}
                                    r={5 / zoomFactor}
                                    fill="#06b6d4"
                                    stroke="#ffffff"
                                    strokeWidth={1.5 / zoomFactor}
                                    className="cursor-pointer pointer-events-none"
                                  />
                                </g>
                              )}

                              {/* Out-handle line & circular tip */}
                              {selectedNode.cpOut && (
                                <g>
                                  <line
                                    x1={selectedNode.x}
                                    y1={selectedNode.y}
                                    x2={selectedNode.cpOut.x}
                                    y2={selectedNode.cpOut.y}
                                    stroke="#06b6d4"
                                    strokeWidth={1.5 / zoomFactor}
                                    pointerEvents="none"
                                  />
                                  {/* Generous invisible handle grip target */}
                                  <circle
                                    cx={selectedNode.cpOut.x}
                                    cy={selectedNode.cpOut.y}
                                    r={Math.max(10, 14 / zoomFactor)}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseDown={(e) =>
                                      handleAnchorHandleMouseDown(e, obj, activeAnchorIdx!, "out")
                                    }
                                  />
                                  <circle
                                    cx={selectedNode.cpOut.x}
                                    cy={selectedNode.cpOut.y}
                                    r={5 / zoomFactor}
                                    fill="#06b6d4"
                                    stroke="#ffffff"
                                    strokeWidth={1.5 / zoomFactor}
                                    className="cursor-pointer pointer-events-none"
                                  />
                                </g>
                              )}
                            </g>
                          )
                        })()}

                        {/* 3. Interactive Anchor Point Markers for ALL vertices */}
                        {(() => {
                          const nodes = obj.penNodes || extractPenNodesFromObject(obj).nodes
                          const nodeSize = 9 / zoomFactor

                          return nodes.map((node, nodeIdx) => {
                            const isNodeSelected = activeAnchorIdx === nodeIdx
                            const isSmooth = Boolean(node.cpIn || node.cpOut)

                            return (
                              <g key={`anchor-node-${nodeIdx}`} pointerEvents="all">
                                {isNodeSelected && (
                                  <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={9 / zoomFactor}
                                    fill="none"
                                    stroke="#06b6d4"
                                    strokeWidth={2 / zoomFactor}
                                    strokeDasharray={`${3 / zoomFactor} ${2 / zoomFactor}`}
                                    className="animate-pulse"
                                    pointerEvents="none"
                                  />
                                )}
                                {/* Invisible larger touch/click hit area */}
                                <circle
                                  cx={node.x}
                                  cy={node.y}
                                  r={Math.max(9, 14 / zoomFactor)}
                                  fill="transparent"
                                  className="cursor-move"
                                  onMouseDown={(e) => handleAnchorNodeMouseDown(e, obj, nodeIdx)}
                                  onDoubleClick={(e) => handleAnchorNodeDoubleClick(e, obj, nodeIdx)}
                                />
                                <rect
                                  x={node.x - nodeSize / 2}
                                  y={node.y - nodeSize / 2}
                                  width={nodeSize}
                                  height={nodeSize}
                                  fill={isNodeSelected ? "#2563eb" : "#ffffff"}
                                  stroke={isNodeSelected ? "#ffffff" : "#2563eb"}
                                  strokeWidth={1.5 / zoomFactor}
                                  rx={isSmooth ? nodeSize / 2 : 1}
                                  className={cn(
                                    "cursor-move transition-transform pointer-events-none",
                                    isNodeSelected && "shadow-lg"
                                  )}
                                >
                                  <title>
                                    {`Anchor #${nodeIdx + 1} (${isSmooth ? "Smooth" : "Corner"}) - Drag to move, Double-click to toggle, Alt+Drag to break`}
                                  </title>
                                </rect>
                              </g>
                            )
                          })
                        })()}
                      </g>
                    )}
                  </g>
                )
              })}

              {/* ── Active Inline Text Editor (Figma / Photoshop / CorelDRAW Style) ── */}
              {editingText && (
                <foreignObject
                  x={editingText.x}
                  y={editingText.y - 4}
                  width={Math.max(280, (editingText.text.length + 8) * ((editingText.fontSize || 28) * 0.7))}
                  height={Math.max(90, (editingText.fontSize || 28) * 2.8)}
                  className="overflow-visible pointer-events-auto z-50"
                >
                  <div
                    className="relative inline-block"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <textarea
                      ref={inlineTextareaRef}
                      value={editingText.text}
                      onChange={(e) => {
                        const val = e.target.value
                        setEditingText((prev) => (prev ? { ...prev, text: val } : null))
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          commitEditingText()
                        } else if (e.key === "Escape") {
                          e.preventDefault()
                          setEditingText(null)
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => commitEditingText(), 120)
                      }}
                      placeholder="Type text here..."
                      rows={1}
                      style={{
                        fontFamily: editingText.fontFamily || "Poppins, sans-serif",
                        fontSize: `${editingText.fontSize || 28}px`,
                        fontWeight: editingText.fontWeight || "bold",
                        color: editingText.fill || "#000000",
                        lineHeight: 1.25,
                        minWidth: "180px",
                        resize: "both",
                      }}
                      className="p-1.5 rounded-md border-2 border-primary bg-background/95 backdrop-blur-xs text-foreground focus:outline-hidden shadow-2xl"
                    />
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-card/95 border border-border/80 px-2 py-0.5 rounded shadow-sm w-fit mt-1 select-none pointer-events-none">
                      <span>Press <kbd className="font-mono font-bold text-foreground">Enter</kbd> to save</span>
                      <span>•</span>
                      <span><kbd className="font-mono font-bold text-foreground">Esc</kbd> to discard</span>
                    </div>
                  </div>
                </foreignObject>
              )}

              {/* ── Unified Multi-Selection Bounding Box & Group Mover (CorelDRAW Style) ── */}
              {selectedIds.length > 1 && activeTool === "select" && !marqueeBox && (() => {
                const selectedObjs = visibleObjects.filter((o) => selectedIds.includes(o.id))
                if (selectedObjs.length <= 1) return null

                const minX = Math.min(...selectedObjs.map((o) => o.x))
                const minY = Math.min(...selectedObjs.map((o) => o.y))
                const maxX = Math.max(...selectedObjs.map((o) => o.x + o.width))
                const maxY = Math.max(...selectedObjs.map((o) => o.y + o.height))
                const multiW = maxX - minX
                const multiH = maxY - minY
                const z = settings.zoom || 1

                return (
                  <g
                    id="multi-selection-group"
                    onMouseDown={(e) => {
                      if (e.button !== 0 || isSpacePressed) return
                      e.stopPropagation()
                      const { x, y } = getCanvasCoords(e.clientX, e.clientY)
                      const initialObjs: Record<
                        string,
                        {
                          x: number
                          y: number
                          w: number
                          h: number
                          penNodes?: PenNode[]
                          pathData?: string
                          points?: { x: number; y: number }[]
                        }
                      > = {}
                      selectedObjs.forEach((found) => {
                        initialObjs[found.id] = {
                          x: found.x,
                          y: found.y,
                          w: found.width,
                          h: found.height,
                          penNodes: found.penNodes
                            ? found.penNodes.map((n) => ({
                                x: n.x,
                                y: n.y,
                                cpIn: n.cpIn ? { ...n.cpIn } : null,
                                cpOut: n.cpOut ? { ...n.cpOut } : null,
                              }))
                            : undefined,
                          pathData: found.pathData,
                          points: found.points ? found.points.map((p) => ({ ...p })) : undefined,
                        }
                      })
                      setIsInteracting("move")
                      setInteractionStart({ startX: x, startY: y, initialObjs })
                    }}
                    className="cursor-move"
                  >
                    {/* Bounding box outline around ALL selected items */}
                    <rect
                      x={minX}
                      y={minY}
                      width={multiW}
                      height={multiH}
                      fill="transparent"
                      stroke="#00a8ff"
                      strokeWidth={1.5 / z}
                      strokeDasharray={`${5 / z} ${3 / z}`}
                      className="cursor-move"
                    />

                    {/* Corner & edge indicators */}
                    {[
                      { h: "nw", cx: minX, cy: minY },
                      { h: "n", cx: minX + multiW / 2, cy: minY },
                      { h: "ne", cx: maxX, cy: minY },
                      { h: "e", cx: maxX, cy: minY + multiH / 2 },
                      { h: "se", cx: maxX, cy: maxY },
                      { h: "s", cx: minX + multiW / 2, cy: maxY },
                      { h: "sw", cx: minX, cy: maxY },
                      { h: "w", cx: minX, cy: minY + multiH / 2 },
                    ].map((h) => {
                      const hSize = 7.5 / z
                      return (
                        <rect
                          key={h.h}
                          x={h.cx - hSize / 2}
                          y={h.cy - hSize / 2}
                          width={hSize}
                          height={hSize}
                          fill="#ffffff"
                          stroke="#00a8ff"
                          strokeWidth={1.5 / z}
                          className="pointer-events-none"
                        />
                      )
                    })}
                  </g>
                )
              })()}

              {/* ── Marquee Selection Box (Rubber-Band Dragging matching screenshot) ── */}
              {marqueeBox && (
                <g id="canvas-marquee-selection" className="pointer-events-none select-none">
                  <rect
                    x={Math.min(marqueeBox.startX, marqueeBox.currentX)}
                    y={Math.min(marqueeBox.startY, marqueeBox.currentY)}
                    width={Math.abs(marqueeBox.currentX - marqueeBox.startX)}
                    height={Math.abs(marqueeBox.currentY - marqueeBox.startY)}
                    fill="rgba(0, 168, 255, 0.04)"
                    stroke="#00a8ff"
                    strokeWidth={1.5 / (settings.zoom || 1)}
                    strokeDasharray={`${3.5 / (settings.zoom || 1)} ${3.5 / (settings.zoom || 1)}`}
                  />
                </g>
              )}

              {/* Real-time Frame Creation Preview */}
              {isInteracting === "draw-frame" && frameDrawStart && (
                <g id="frame-draw-preview" pointerEvents="none">
                  {(() => {
                    const minX = Math.min(frameDrawStart.x, currentCanvasMouse.x)
                    const minY = Math.min(frameDrawStart.y, currentCanvasMouse.y)
                    const w = Math.abs(currentCanvasMouse.x - frameDrawStart.x)
                    const h = Math.abs(currentCanvasMouse.y - frameDrawStart.y)
                    const z = settings.zoom || 1

                    return (
                      <>
                        <text
                          x={minX}
                          y={minY - 10}
                          fontFamily="monospace"
                          fontSize="12"
                          fontWeight="bold"
                          fill="#2563eb"
                        >
                          New Page: {(w / scaleRatio).toFixed(1)} mm × {(h / scaleRatio).toFixed(1)} mm ({w} × {h} px)
                        </text>
                        <rect
                          x={minX}
                          y={minY}
                          width={w}
                          height={h}
                          fill="#ffffff"
                          fillOpacity="0.85"
                          filter="url(#page-drop-shadow)"
                          stroke="#548235"
                          strokeWidth={2 / z}
                          strokeDasharray={`${6 / z} ${4 / z}`}
                        />
                      </>
                    )
                  })()}
                </g>
              )}

              {/* Real-time Shape Drag Creation Preview */}
              {isInteracting === "draw-shape" && drawShapeStart && (() => {
                const mx = currentCanvasMouse.x
                const my = currentCanvasMouse.y
                const rawW = Math.abs(mx - drawShapeStart.x)
                const rawH = Math.abs(my - drawShapeStart.y)
                const z = settings.zoom || 1
                // Live shift-lock preview: we can't read e.shiftKey here, so we just show the actual shape
                const previewX = Math.min(drawShapeStart.x, mx)
                const previewY = Math.min(drawShapeStart.y, my)
                const previewW = rawW
                const previewH = rawH
                const isCircle = drawShapeSubtype === "circle"
                const isLine = drawShapeSubtype === "line"
                const cx = previewX + previewW / 2
                const cy = previewY + previewH / 2
                return (
                  <g id="shape-draw-preview" pointerEvents="none">
                    <text
                      x={previewX}
                      y={previewY - 8}
                      fontFamily="monospace"
                      fontSize={11}
                      fontWeight="bold"
                      fill="#548235"
                    >
                      {`${Math.round(previewW)} × ${Math.round(previewH)} px`}
                      {` · Hold Shift for equal ratio`}
                    </text>
                    {isCircle ? (
                      <ellipse
                        cx={cx}
                        cy={cy}
                        rx={previewW / 2}
                        ry={previewH / 2}
                        fill={activeColor}
                        fillOpacity={0.15}
                        stroke={activeColor}
                        strokeWidth={1.5 / z}
                        strokeDasharray={`${5 / z} ${3 / z}`}
                      />
                    ) : isLine ? (
                      <line
                        x1={drawShapeStart.x}
                        y1={drawShapeStart.y}
                        x2={mx}
                        y2={my}
                        stroke={activeColor}
                        strokeWidth={2 / z}
                        strokeDasharray={`${5 / z} ${3 / z}`}
                        strokeLinecap="round"
                      />
                    ) : (
                      <rect
                        x={previewX}
                        y={previewY}
                        width={Math.max(1, previewW)}
                        height={Math.max(1, previewH)}
                        fill={activeColor}
                        fillOpacity={0.15}
                        stroke={activeColor}
                        strokeWidth={1.5 / z}
                        strokeDasharray={`${5 / z} ${3 / z}`}
                      />
                    )}
                  </g>
                )
              })()}

              {/* ─── Crop Tool Interactive Overlay ─── */}
              {activeTool === "crop" && cropState && (() => {
                const { x: cx, y: cy, w: cw, h: ch } = cropState
                const z = settings.zoom || 1
                // Use the full page bounds for the dark overlay
                const pageX = 0
                const pageY = 0
                const pageW = (settings.widthMm ? settings.widthMm * 3.2 : 1920)
                const pageH = (settings.heightMm ? settings.heightMm * 3.2 : 1080)
                const hSize = 9 / z
                const handles = [
                  { h: "nw", hx: cx,          hy: cy,          cursor: "nwse-resize" },
                  { h: "n",  hx: cx + cw / 2,  hy: cy,          cursor: "ns-resize"   },
                  { h: "ne", hx: cx + cw,       hy: cy,          cursor: "nesw-resize" },
                  { h: "e",  hx: cx + cw,       hy: cy + ch / 2, cursor: "ew-resize"   },
                  { h: "se", hx: cx + cw,       hy: cy + ch,     cursor: "nwse-resize" },
                  { h: "s",  hx: cx + cw / 2,  hy: cy + ch,     cursor: "ns-resize"   },
                  { h: "sw", hx: cx,            hy: cy + ch,     cursor: "nesw-resize" },
                  { h: "w",  hx: cx,            hy: cy + ch / 2, cursor: "ew-resize"   },
                ]
                // Compute dark mask extent — covers entire visible viewport
                const vp = {
                  x: pageX - 5000,
                  y: pageY - 5000,
                  w: pageW + 10000,
                  h: pageH + 10000,
                }
                return (
                  <g id="crop-overlay">
                    {/* Dark mask: SVG path with a cut-out for the crop region */}
                    <path
                      d={`M ${vp.x} ${vp.y} H ${vp.x + vp.w} V ${vp.y + vp.h} H ${vp.x} Z M ${cx} ${cy} V ${cy + ch} H ${cx + cw} V ${cy} Z`}
                      fill="rgba(0,0,0,0.50)"
                      fillRule="evenodd"
                      pointerEvents="none"
                    />

                    {/* Rule-of-thirds grid inside crop area */}
                    {[1, 2].map((i) => (
                      <g key={i} pointerEvents="none">
                        <line x1={cx + cw * i / 3} y1={cy} x2={cx + cw * i / 3} y2={cy + ch} stroke="rgba(255,255,255,0.3)" strokeWidth={0.8 / z} />
                        <line x1={cx} y1={cy + ch * i / 3} x2={cx + cw} y2={cy + ch * i / 3} stroke="rgba(255,255,255,0.3)" strokeWidth={0.8 / z} />
                      </g>
                    ))}

                    {/* Crop border */}
                    <rect
                      x={cx} y={cy} width={cw} height={ch}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth={1.5 / z}
                      style={{ cursor: "move" }}
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        const { x: mx, y: my } = getCanvasCoords(e.clientX, e.clientY)
                        setCropState((prev) => prev ? {
                          ...prev, handle: "move",
                          startX: mx, startY: my,
                          initX: prev.x, initY: prev.y, initW: prev.w, initH: prev.h,
                        } : null)
                        setIsInteracting("crop-handle")
                      }}
                    />

                    {/* Size label */}
                    <text x={cx} y={cy - 8 / z} fontFamily="monospace" fontSize={11 / z} fontWeight="bold" fill="#ffffff" pointerEvents="none">
                      {`${Math.round(cw)} × ${Math.round(ch)} px`}
                    </text>

                    {/* 8 Crop Handles */}
                    {handles.map((hd) => (
                      <rect
                        key={hd.h}
                        x={hd.hx - hSize / 2}
                        y={hd.hy - hSize / 2}
                        width={hSize}
                        height={hSize}
                        fill="#ffffff"
                        stroke="#10b981"
                        strokeWidth={1.5 / z}
                        rx={1.5 / z}
                        style={{ cursor: hd.cursor }}
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          const { x: mx, y: my } = getCanvasCoords(e.clientX, e.clientY)
                          setCropState((prev) => prev ? {
                            ...prev, handle: hd.h,
                            startX: mx, startY: my,
                            initX: prev.x, initY: prev.y, initW: prev.w, initH: prev.h,
                          } : null)
                          setIsInteracting("crop-handle")
                        }}
                      />
                    ))}
                  </g>
                )
              })()}

              {/* Real-time Freehand Pencil Stroke Preview */}
              {isInteracting === "pencil" && pencilPoints.length > 1 && (
                <path
                  d={`M ${pencilPoints.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
                  fill="none"
                  stroke={activeColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* ─── Real-time Bézier Pen Path Preview & Direction Handles ─── */}
              {activeTool === "pen" && penNodes.length > 0 && (
                <g id="pen-tool-preview" pointerEvents="none">
                  {/* 1. Established Bézier Path Segments */}
                  {penNodes.length > 1 && (
                    <path
                      d={buildPenSvgPath(penNodes, false)}
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth={2.5 / (settings.zoom || 1)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* 2. Live Rubber-band Bézier Segment to Cursor (or connecting to origin) */}
                  {currentCanvasMouse.x !== 0 && currentCanvasMouse.y !== 0 && (
                    (() => {
                      const last = penNodes[penNodes.length - 1]
                      const target = isNearOrigin ? penNodes[0] : currentCanvasMouse
                      let rubberD = ""

                      if (isNearOrigin) {
                        if (last.cpOut && penNodes[0].cpIn) {
                          rubberD = `M ${last.x} ${last.y} C ${last.cpOut.x} ${last.cpOut.y}, ${penNodes[0].cpIn.x} ${penNodes[0].cpIn.y}, ${penNodes[0].x} ${penNodes[0].y}`
                        } else if (last.cpOut) {
                          rubberD = `M ${last.x} ${last.y} C ${last.cpOut.x} ${last.cpOut.y}, ${penNodes[0].x} ${penNodes[0].y}, ${penNodes[0].x} ${penNodes[0].y}`
                        } else if (penNodes[0].cpIn) {
                          rubberD = `M ${last.x} ${last.y} C ${last.x} ${last.y}, ${penNodes[0].cpIn.x} ${penNodes[0].cpIn.y}, ${penNodes[0].x} ${penNodes[0].y}`
                        } else {
                          rubberD = `M ${last.x} ${last.y} L ${penNodes[0].x} ${penNodes[0].y}`
                        }
                      } else {
                        if (last.cpOut) {
                          rubberD = `M ${last.x} ${last.y} C ${last.cpOut.x} ${last.cpOut.y}, ${target.x} ${target.y}, ${target.x} ${target.y}`
                        } else {
                          rubberD = `M ${last.x} ${last.y} L ${target.x} ${target.y}`
                        }
                      }

                      return (
                        <path
                          d={rubberD}
                          fill="none"
                          stroke={isNearOrigin ? "#10b981" : "#06b6d4"}
                          strokeWidth={2 / (settings.zoom || 1)}
                          strokeDasharray={`${4 / (settings.zoom || 1)} ${3 / (settings.zoom || 1)}`}
                          strokeOpacity={0.85}
                        />
                      )
                    })()
                  )}

                  {/* 3. Direction Handle Tangent Lines & Control Point Dots */}
                  {penNodes.map((node, idx) => {
                    const z = settings.zoom || 1
                    const dotSize = 6 / z
                    return (
                      <g key={`handles-${idx}`}>
                        {/* Outgoing Handle */}
                        {node.cpOut && (
                          <>
                            <line
                              x1={node.x}
                              y1={node.y}
                              x2={node.cpOut.x}
                              y2={node.cpOut.y}
                              stroke="#ec4899"
                              strokeWidth={1.5 / z}
                              strokeOpacity={0.9}
                            />
                            <circle
                              cx={node.cpOut.x}
                              cy={node.cpOut.y}
                              r={dotSize / 2}
                              fill="#ec4899"
                              stroke="#ffffff"
                              strokeWidth={1 / z}
                            />
                          </>
                        )}
                        {/* Incoming Handle */}
                        {node.cpIn && (
                          <>
                            <line
                              x1={node.x}
                              y1={node.y}
                              x2={node.cpIn.x}
                              y2={node.cpIn.y}
                              stroke="#ec4899"
                              strokeWidth={1.5 / z}
                              strokeOpacity={0.9}
                            />
                            <circle
                              cx={node.cpIn.x}
                              cy={node.cpIn.y}
                              r={dotSize / 2}
                              fill="#ec4899"
                              stroke="#ffffff"
                              strokeWidth={1 / z}
                            />
                          </>
                        )}
                      </g>
                    )
                  })}

                  {/* 4. Anchor Point Square Nodes */}
                  {penNodes.map((p, idx) => {
                    const z = settings.zoom || 1
                    const hSize = (idx === 0 ? 9 : 7) / z
                    const isStart = idx === 0
                    return (
                      <g key={`node-${idx}`}>
                        {isStart && isNearOrigin && (
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={14 / z}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth={2 / z}
                            strokeDasharray="3 2"
                          />
                        )}
                        <rect
                          x={p.x - hSize / 2}
                          y={p.y - hSize / 2}
                          width={hSize}
                          height={hSize}
                          fill={isStart ? (isNearOrigin ? "#10b981" : "#06b6d4") : "#ffffff"}
                          stroke={isStart ? "#ffffff" : "#06b6d4"}
                          strokeWidth={1.5 / z}
                          rx={1 / z}
                        />
                      </g>
                    )
                  })}

                  {/* 5. Closing Loop (o) Badge near cursor when near origin */}
                  {isNearOrigin && (
                    <g
                      transform={`translate(${currentCanvasMouse.x + 14 / (settings.zoom || 1)}, ${
                        currentCanvasMouse.y + 14 / (settings.zoom || 1)
                      })`}
                    >
                      <circle
                        r={4.5 / (settings.zoom || 1)}
                        fill="#ffffff"
                        stroke="#10b981"
                        strokeWidth={1.5 / (settings.zoom || 1)}
                      />
                    </g>
                  )}
                </g>
              )}
            </g>
          </svg>

          {/* ─── 4. Compact Zoom Percentage Indicator (Equal Spacing & Transparent Blur) ── */}
          <div
            onClick={handleResetZoom100}
            className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background/25 hover:bg-background/45 backdrop-blur-md border border-border/50 shadow-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer select-none text-[11px] group"
            title="Zoom: Click to reset to 100%"
          >
            <Search className="h-3 w-3 text-muted-foreground group-hover:text-[#548235] transition-colors" />
            <span className="font-mono font-medium text-foreground">
              {Math.round(settings.zoom * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. Authentic CorelDRAW Document Navigator Docked Bottom Bar ─ */}
      <DocumentNavigator
        pages={pages}
        activePageId={activePageId}
        onSelectPage={onSelectPage}
        onInsertPageBefore={onInsertPageBefore}
        onInsertPageAfter={onInsertPageAfter}
        onDuplicatePage={onDuplicatePage}
        onDeletePage={onDeletePage}
        onRenamePage={onRenamePage}
        onReorderPages={onReorderPages}
      />
    </div>
  )
}
