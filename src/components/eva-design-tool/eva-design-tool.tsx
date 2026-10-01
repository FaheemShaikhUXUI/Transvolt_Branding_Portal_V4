"use client"

import * as React from "react"
import { TopBar } from "./top-bar/top-bar"
import { LeftToolbar } from "./toolbar/left-toolbar"
import { DesignCanvas } from "./canvas/design-canvas"
import { PropertiesPanel } from "./properties/properties-panel"
import { EvaBotPanel } from "./eva/eva-bot-panel"
import { EvaGhostCursor } from "./eva/eva-ghost-cursor"
import { AllFilesModal } from "./modals/all-files-modal"
import { ExportModal } from "./modals/export-modal"
import { ShareLinkModal } from "./modals/share-link-modal"
import { ReferenceSitesModal } from "./modals/reference-sites-modal"
import { ToolKnowledgeModal } from "./modals/tool-knowledge-modal"
import { SavedPromptsModal } from "./modals/saved-prompts-modal"
import {
  CanvasObject,
  DocumentSettings,
  ToolType,
  ShapeSubtype,
  GhostCursorState,
  EvaBotMessage,
  EvaExecutionMode,
  DocumentPage,
  EvaPersona,
} from "@/types/eva-editor"
import {
  extractPenNodesFromObject,
  buildPenSvgPath,
  computeBoundsFromNodes,
  convertNodeToSmooth,
  convertNodeToCorner,
  deleteNodeFromPath,
} from "@/core/editor/anchor-utils"
import { EditorCommandBus } from "@/core/editor/editor-command-bus"
import { EvaVoiceEngine } from "./eva/eva-voice-engine"
import { parseEvaCommand, ParsedEvaIntent } from "./eva/eva-intent-parser"
import { ReferenceSource, DEFAULT_REFERENCE_SOURCES } from "./eva/eva-research-engine"
import { toast } from "sonner"

/**
 * Ensures all pages retain strictly ordered sequential numbering:
 * "Page 1", "Page 2", "Page 3", ... while respecting user-customized names.
 */
export function resequencePages(pagesList: DocumentPage[]): DocumentPage[] {
  return pagesList.map((p, idx) => {
    const isDefault = !p.name || /^Page\s*\d*$/i.test(p.name.trim())
    if (isDefault) {
      return {
        ...p,
        name: `Page ${idx + 1}`,
      }
    }
    return p
  })
}

const INITIAL_PAGES: DocumentPage[] = [
  {
    id: "page-1",
    name: "Page 1",
    pageSize: "A4",
    widthMm: 210.0,
    heightMm: 297.0,
    orientation: "portrait",
    backgroundColor: "#ffffff",
  },
  {
    id: "page-2",
    name: "Page 2",
    pageSize: "A4",
    widthMm: 210.0,
    heightMm: 297.0,
    orientation: "portrait",
    backgroundColor: "#ffffff",
  },
  {
    id: "page-3",
    name: "Page 3",
    pageSize: "A4",
    widthMm: 210.0,
    heightMm: 297.0,
    orientation: "portrait",
    backgroundColor: "#ffffff",
  },
  {
    id: "page-4",
    name: "Page 4",
    pageSize: "A4",
    widthMm: 210.0,
    heightMm: 297.0,
    orientation: "portrait",
    backgroundColor: "#ffffff",
  },
]

const INITIAL_SETTINGS: DocumentSettings = {
  fileName: "Untitled1",
  pageSize: "A4",
  widthMm: 210.0,
  heightMm: 297.0,
  orientation: "portrait",
  unit: "mm",
  backgroundColor: "#ffffff",
  workspaceColor: "#cbd5e1",
  showRulers: true,
  zoom: 1,
  panX: 0,
  panY: 0,
  activePageId: "page-1",
}

// Initial seed object matching the screenshot (a rectangle on canvas)
const INITIAL_OBJECTS: CanvasObject[] = [
  {
    id: "rect-seed-1",
    name: "Rectangle 1",
    type: "rectangle",
    pageId: "page-1",
    x: 420,
    y: 380,
    width: 170,
    height: 140,
    rotation: 0,
    opacity: 1,
    fill: "#d1d5db",
    stroke: "#000000",
    strokeWidth: 2,
    cornerRadius: 0,
    blendMode: "normal",
    zIndex: 1,
  },
]

export function EvaDesignTool() {
  // Document State
  const [pages, setPages] = React.useState<DocumentPage[]>(INITIAL_PAGES)
  const [activePageId, setActivePageId] = React.useState<string>("page-1")
  const [settings, setSettings] = React.useState<DocumentSettings>(INITIAL_SETTINGS)
  const [objects, setObjects] = React.useState<CanvasObject[]>(INITIAL_OBJECTS)
  const [selectedIds, setSelectedIds] = React.useState<string[]>(["rect-seed-1"])
  const [activeTool, setActiveTool] = React.useState<ToolType>("rectangle")
  const [activeShapeSubtype, setActiveShapeSubtype] = React.useState<ShapeSubtype>("star")
  const [activeColor, setActiveColor] = React.useState<string>("#548235") // Transvolt Green

  // Modals State
  const [isFilesModalOpen, setIsFilesModalOpen] = React.useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false)
  const [isRefSitesModalOpen, setIsRefSitesModalOpen] = React.useState(false)
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = React.useState(false)
  const [isSavedPromptsOpen, setIsSavedPromptsOpen] = React.useState(false)

  // Ghost Cursor & Voice Engine State
  const [ghostCursor, setGhostCursor] = React.useState<GhostCursorState>({
    visible: false,
    x: 0,
    y: 0,
  })
  const [highlightedToolId, setHighlightedToolId] = React.useState<string | null>(null)
  const [isListening, setIsListening] = React.useState(false)
  const [isMuted, setIsMuted] = React.useState(false)
  const [userName, setUserName] = React.useState("")
  const [executionMode, setExecutionMode] = React.useState<EvaExecutionMode>("auto")
  const [activePersona, setActivePersona] = React.useState<EvaPersona>("basic")
  const [isSpeaking, setIsSpeaking] = React.useState(false)
  const [vadProgress, setVadProgress] = React.useState<{ silenceMs: number; progressPercent: number; isLocked: boolean } | null>(null)
  const [wakeWordDetected, setWakeWordDetected] = React.useState(false)
  const [activeResearchSource, setActiveResearchSource] = React.useState<string[] | null>(null)
  const [referenceSources, setReferenceSources] = React.useState<ReferenceSource[]>(DEFAULT_REFERENCE_SOURCES)
  const [pendingAction, setPendingAction] = React.useState<{
    label: string
    execute: () => void
  } | null>(null)

  // Floating Draggable Eva Bot State
  const [isEvaBotOpen, setIsEvaBotOpen] = React.useState(false)
  const [evaBotPos, setEvaBotPos] = React.useState<{ x: number; y: number } | null>(null)
  const isDraggingBotRef = React.useRef(false)
  const dragBotOffsetRef = React.useRef({ x: 0, y: 0 })
  const evaBotPanelRef = React.useRef<HTMLDivElement>(null)

  // Default initial position for Eva Bot: current bottom-right place
  React.useEffect(() => {
    if (isEvaBotOpen && !evaBotPos && typeof window !== "undefined") {
      const panelWidth = 340
      const panelHeight = 520
      const initX = Math.max(16, window.innerWidth - panelWidth - 16)
      const initY = Math.max(60, window.innerHeight - panelHeight - 16)
      setEvaBotPos({ x: initX, y: initY })
    }
  }, [isEvaBotOpen, evaBotPos])

  const handleStartDragEvaBot = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return

    isDraggingBotRef.current = true
    const rect = evaBotPanelRef.current?.getBoundingClientRect()
    const startX = rect ? rect.left : (evaBotPos?.x ?? 0)
    const startY = rect ? rect.top : (evaBotPos?.y ?? 0)
    dragBotOffsetRef.current = {
      x: e.clientX - startX,
      y: e.clientY - startY,
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingBotRef.current) return
      const newX = moveEvent.clientX - dragBotOffsetRef.current.x
      const newY = moveEvent.clientY - dragBotOffsetRef.current.y
      const boundedX = Math.max(8, Math.min(window.innerWidth - 340 - 8, newX))
      const boundedY = Math.max(56, Math.min(window.innerHeight - 100, newY))
      setEvaBotPos({ x: boundedX, y: boundedY })
    }

    const handleMouseUp = () => {
      isDraggingBotRef.current = false
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  // Conversation Log
  const [messages, setMessages] = React.useState<EvaBotMessage[]>([
    {
      id: "msg-init",
      sender: "eva",
      text: "Namaste! I'm Eva, speaking with NeerjaExpressive voice (English - India). Speak or type your instructions, and I'll create and style your vector artwork on the canvas.",
      timestamp: "Just now",
    },
  ])

  // Command Bus & History
  const commandBusRef = React.useRef<EditorCommandBus>(new EditorCommandBus())
  const voiceEngineRef = React.useRef<EvaVoiceEngine | null>(null)

  // Initialize Voice Engine & Command Bus on mount
  React.useEffect(() => {
    voiceEngineRef.current = new EvaVoiceEngine()
    commandBusRef.current.pushState(objects, selectedIds, settings, "Initial Document")
    return () => {
      voiceEngineRef.current?.stopListening()
      voiceEngineRef.current?.stopSpeaking()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Global Keyboard Shortcuts (Undo, Redo, Copy, Paste, Cut, Duplicate, Alignments, Distribution, Tools)
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 1. Never intercept when user is typing in inputs or editable elements
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return
      }

      const key = e.key.toLowerCase()
      const code = e.code
      const isCtrl = e.ctrlKey || e.metaKey
      const isShift = e.shiftKey

      // ─── 1. UNDO: Ctrl + Z ─────────────────────────────────────────
      if (isCtrl && !isShift && key === "z") {
        e.preventDefault()
        handleUndo()
        return
      }

      // ─── 2. REDO: Ctrl + Shift + Z or Ctrl + Y ─────────────────────
      if ((isCtrl && isShift && key === "z") || (isCtrl && key === "y")) {
        e.preventDefault()
        handleRedo()
        return
      }

      // ─── 3. COPY: Ctrl + C ─────────────────────────────────────────
      if (isCtrl && !isShift && key === "c") {
        e.preventDefault()
        handleCopy()
        return
      }

      // ─── 4. PASTE: Ctrl + V ────────────────────────────────────────
      if (isCtrl && !isShift && key === "v") {
        e.preventDefault()
        handlePaste()
        return
      }

      // ─── 5. CUT: Ctrl + X ──────────────────────────────────────────
      if (isCtrl && !isShift && key === "x") {
        e.preventDefault()
        handleCut()
        return
      }

      // ─── 6. DUPLICATE OBJECT: Ctrl + D (CorelDRAW Smart Duplicate) ─
      if (isCtrl && !isShift && key === "d") {
        e.preventDefault()
        handleDuplicateSelected()
        return
      }

      // ─── 7. DISTRIBUTE EQUAL SPACING: Ctrl + Shift + No. 5 ─────────
      if (
        isCtrl &&
        isShift &&
        (key === "5" || key === "%" || code === "Digit5" || code === "Numpad5")
      ) {
        e.preventDefault()
        handleDistributeEqualSpacing()
        return
      }

      // ─── 8. VERTICAL: LEFT ALIGN (Ctrl + No. 4) ────────────────────
      if (
        isCtrl &&
        !isShift &&
        (key === "4" || code === "Digit4" || code === "Numpad4")
      ) {
        e.preventDefault()
        handleAlign("left")
        toast.success("Vertical: Left Align (Ctrl + 4)")
        return
      }

      // ─── 9. VERTICAL: RIGHT ALIGN (Ctrl + No. 6) ───────────────────
      if (
        isCtrl &&
        !isShift &&
        (key === "6" || code === "Digit6" || code === "Numpad6")
      ) {
        e.preventDefault()
        handleAlign("right")
        toast.success("Vertical: Right Align (Ctrl + 6)")
        return
      }

      // ─── 10. VERTICAL: CENTER ALIGN (Ctrl + No. 5) ─────────────────
      if (
        isCtrl &&
        !isShift &&
        (key === "5" || code === "Digit5" || code === "Numpad5")
      ) {
        e.preventDefault()
        handleAlign("center")
        toast.success("Vertical: Center Align (Ctrl + 5)")
        return
      }

      // ─── 11. HORIZONTAL: TOP ALIGN (Shift + No. 8) ─────────────────
      if (
        isShift &&
        !isCtrl &&
        (key === "8" || key === "*" || code === "Digit8" || code === "Numpad8")
      ) {
        e.preventDefault()
        handleAlign("top")
        toast.success("Horizontal: Top Align (Shift + 8)")
        return
      }

      // ─── 12. HORIZONTAL: BOTTOM ALIGN (Shift + No. 2) ──────────────
      if (
        isShift &&
        !isCtrl &&
        (key === "2" || key === "@" || code === "Digit2" || code === "Numpad2")
      ) {
        e.preventDefault()
        handleAlign("bottom")
        toast.success("Horizontal: Bottom Align (Shift + 2)")
        return
      }

      // ─── 13. HORIZONTAL: CENTER ALIGN (Shift + No. 5) ──────────────
      if (
        isShift &&
        !isCtrl &&
        (key === "5" || key === "%" || code === "Digit5" || code === "Numpad5")
      ) {
        e.preventDefault()
        handleAlign("middle")
        toast.success("Horizontal: Center Align (Shift + 5)")
        return
      }

      // Select All: Ctrl + A
      if (isCtrl && !isShift && key === "a") {
        e.preventDefault()
        setSelectedIds(objects.map((o) => o.id))
        return
      }

      // Zoom In: Ctrl + Plus / Equal (max 5000%)
      if (isCtrl && (key === "+" || key === "=")) {
        e.preventDefault()
        setSettings((prev) => ({
          ...prev,
          zoom: Math.min(50.0, Number((prev.zoom * 1.25).toFixed(3))),
        }))
        return
      }

      // Zoom Out: Ctrl + Minus (min 5%)
      if (isCtrl && (key === "-" || key === "_")) {
        e.preventDefault()
        setSettings((prev) => ({
          ...prev,
          zoom: Math.max(0.05, Number((prev.zoom / 1.25).toFixed(3))),
        }))
        return
      }

      // Zoom 100%: Ctrl + 0
      if (isCtrl && key === "0") {
        e.preventDefault()
        setSettings((prev) => ({
          ...prev,
          zoom: 1.0,
        }))
        return
      }

      // Delete Selected: Delete or Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length > 0) {
          e.preventDefault()
          handleDeleteSelected()
        }
        return
      }

      // Escape to Deselect
      if (e.key === "Escape") {
        setSelectedIds([])
        return
      }

      // CorelDRAW Page Navigation Shortcuts: PageDown (Next Page), PageUp (Previous Page)
      if (e.key === "PageDown") {
        e.preventDefault()
        const idx = pages.findIndex((p) => p.id === activePageId)
        if (idx < pages.length - 1) {
          handleSelectPage(pages[idx + 1].id)
        }
        return
      }
      if (e.key === "PageUp") {
        e.preventDefault()
        const idx = pages.findIndex((p) => p.id === activePageId)
        if (idx > 0) {
          handleSelectPage(pages[idx - 1].id)
        }
        return
      }

      // Tool Switching Hotkeys (Single key)
      if (!isCtrl && !isShift && !e.altKey) {
        if (key === "v") setActiveTool("select")
        else if (key === "f") setActiveTool("frame")
        else if (key === "r") setActiveTool("rectangle")
        else if (key === "o") setActiveTool("circle")
        else if (key === "s") {
          setActiveTool("shape")
          setActiveShapeSubtype("star")
        } else if (key === "h") {
          setActiveTool("shape")
          setActiveShapeSubtype("hexagon")
        } else if (key === "l") {
          setActiveTool("shape")
          setActiveShapeSubtype("line")
        } else if (key === "n") setActiveTool("pencil")
        else if (key === "p") setActiveTool("pen")
        else if (key === "a") setActiveTool("anchor")
        else if (key === "t") setActiveTool("text")
        else if (key === "c") setActiveTool("crop")
        else if (key === "z") setActiveTool("zoom")
        else if (key === "i") setActiveTool("eyedropper")
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown)
    return () => window.removeEventListener("keydown", handleGlobalKeyDown)
  }, [objects, selectedIds, settings, pages, activePageId, activeShapeSubtype])

  // ─── CorelDRAW Multi-Page Document Synchronizer ───────────────────────
  // Keep active page dimensions and background in sync whenever document settings change
  React.useEffect(() => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              pageSize: settings.pageSize,
              widthMm: settings.widthMm,
              heightMm: settings.heightMm,
              orientation: settings.orientation,
              backgroundColor: settings.backgroundColor,
            }
          : p
      )
    )
  }, [
    settings.pageSize,
    settings.widthMm,
    settings.heightMm,
    settings.orientation,
    settings.backgroundColor,
    activePageId,
  ])

  // ─── Multi-Page Navigation & Manipulation Handlers ───────────────────
  const handleSelectPage = (pageId: string) => {
    const target = pages.find((p) => p.id === pageId)
    if (!target) return
    setActivePageId(pageId)
    setSettings((prev) => ({
      ...prev,
      pageSize: target.pageSize,
      widthMm: target.widthMm,
      heightMm: target.heightMm,
      orientation: target.orientation,
      backgroundColor: target.backgroundColor || "#ffffff",
      activePageId: pageId,
    }))
    setSelectedIds([])
  }

  const handleInsertPageBefore = (referencePageId?: string) => {
    const newId = `page-${Date.now()}`
    const refIndex = referencePageId ? pages.findIndex((p) => p.id === referencePageId) : 0
    const insertIndex = refIndex >= 0 ? refIndex : 0
    const newPage: DocumentPage = {
      id: newId,
      name: "Page",
      pageSize: settings.pageSize,
      widthMm: settings.widthMm,
      heightMm: settings.heightMm,
      orientation: settings.orientation,
      backgroundColor: "#ffffff",
    }
    const nextPages = [...pages]
    nextPages.splice(insertIndex, 0, newPage)
    const updated = resequencePages(nextPages)
    setPages(updated)
    setActivePageId(newId)
    setSelectedIds([])
    const assignedIndex = updated.findIndex((p) => p.id === newId)
    toast.success(`Inserted Page ${assignedIndex + 1}`)
  }

  const handleInsertPageAfter = (referencePageId?: string) => {
    const newId = `page-${Date.now()}`
    const refIndex = referencePageId ? pages.findIndex((p) => p.id === referencePageId) : pages.length - 1
    const insertIndex = refIndex >= 0 ? refIndex + 1 : pages.length
    const newPage: DocumentPage = {
      id: newId,
      name: "Page",
      pageSize: settings.pageSize,
      widthMm: settings.widthMm,
      heightMm: settings.heightMm,
      orientation: settings.orientation,
      backgroundColor: "#ffffff",
    }
    const nextPages = [...pages]
    nextPages.splice(insertIndex, 0, newPage)
    const updated = resequencePages(nextPages)
    setPages(updated)
    setActivePageId(newId)
    setSelectedIds([])
    const assignedIndex = updated.findIndex((p) => p.id === newId)
    toast.success(`Added Page ${assignedIndex + 1}`)
  }

  const handleReorderPages = (reordered: DocumentPage[]) => {
    const updated = resequencePages(reordered)
    setPages(updated)
    toast.success("Pages reordered")
  }

  const handleDuplicatePage = (pageId: string) => {
    const srcIndex = pages.findIndex((p) => p.id === pageId)
    if (srcIndex === -1) return
    const srcPage = pages[srcIndex]
    const newId = `page-${Date.now()}`
    const newPage: DocumentPage = {
      ...srcPage,
      id: newId,
      name: "Page",
    }

    // Duplicate all objects belonging to this page
    const pageObjs = objects.filter(
      (o) => o.pageId === pageId || (!o.pageId && pageId === "page-1")
    )
    const clonedObjs: CanvasObject[] = pageObjs.map((o) => ({
      ...o,
      id: `${o.type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pageId: newId,
    }))

    const nextPages = [...pages]
    nextPages.splice(srcIndex + 1, 0, newPage)
    const updated = resequencePages(nextPages)
    setPages(updated)
    setObjects((prev) => [...prev, ...clonedObjs])
    setActivePageId(newId)
    setSelectedIds([])
    const assignedIndex = updated.findIndex((p) => p.id === newId)
    toast.success(`Duplicated to Page ${assignedIndex + 1}`)
  }

  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) {
      toast.error("Document must contain at least one page.")
      return
    }
    const delIndex = pages.findIndex((p) => p.id === pageId)
    if (delIndex === -1) return
    const pageToDelete = pages[delIndex]
    const remaining = pages.filter((p) => p.id !== pageId)
    const updated = resequencePages(remaining)
    const nextActive = updated[Math.min(delIndex, updated.length - 1)].id
    setPages(updated)
    // Remove objects tied to deleted page
    setObjects((prev) =>
      prev.filter((o) => o.pageId !== pageId && (o.pageId || "page-1") !== pageId)
    )
    handleSelectPage(nextActive)
    toast.info(`Deleted ${pageToDelete.name}`)
  }

  const handleRenamePage = (pageId: string, newName: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, name: newName } : p))
    )
    toast.success(`Page renamed to "${newName}"`)
  }

  // Undo / Redo
  const handleUndo = () => {
    const prev = commandBusRef.current.undo()
    if (prev) {
      setObjects(prev.objects)
      setSelectedIds(prev.selectedIds)
      setSettings(prev.settings)
      toast.info(`Undid: ${prev.actionDescription}`)
    }
  }

  const handleRedo = () => {
    const next = commandBusRef.current.redo()
    if (next) {
      setObjects(next.objects)
      setSelectedIds(next.selectedIds)
      setSettings(next.settings)
      toast.info(`Redid: ${next.actionDescription}`)
    }
  }

  // Object Updates with History Recording
  const updateObjectsAndRecord = (
    newObjects: CanvasObject[],
    newSelectedIds: string[] = selectedIds,
    actionDesc: string = "Edit"
  ) => {
    setObjects(newObjects)
    setSelectedIds(newSelectedIds)
    commandBusRef.current.pushState(newObjects, newSelectedIds, settings, actionDesc)
  }

  const handleCreateObject = (obj: CanvasObject) => {
    const objWithPage: CanvasObject = {
      ...obj,
      pageId: obj.pageId || activePageId,
    }
    const updated = [...objects, objWithPage]
    updateObjectsAndRecord(updated, [objWithPage.id], `Create ${objWithPage.name}`)
  }

  const handleCreateObjects = (newObjs: CanvasObject[], actionDesc: string = "Create Elements") => {
    const objsWithPage: CanvasObject[] = newObjs.map((obj, i) => ({
      ...obj,
      pageId: obj.pageId || activePageId,
      zIndex: objects.length + 1 + i,
    }))
    const updated = [...objects, ...objsWithPage]
    const newIds = objsWithPage.map((o) => o.id)
    updateObjectsAndRecord(updated, newIds, actionDesc)
  }

  const handleCreatePresetFrame = (preset: {
    name: string
    widthPx: number
    heightPx: number
    widthMm: number
    heightMm: number
  }) => {
    const mainPageRight = Math.round(settings.widthMm * 3.2)
    const existingFrames = objects.filter((o) => o.type === "frame")
    const rightmostX = existingFrames.reduce(
      (max, f) => Math.max(max, f.x + f.width),
      mainPageRight
    )

    const newFrame: CanvasObject = {
      id: `frame-${Date.now()}`,
      name: preset.name || `Page ${existingFrames.length + 2}`,
      type: "frame",
      x: rightmostX + 60,
      y: 0,
      width: preset.widthPx,
      height: preset.heightPx,
      rotation: 0,
      opacity: 1,
      fill: "#ffffff",
      stroke: "rgba(0,0,0,0.18)",
      strokeWidth: 1,
      blendMode: "normal",
      zIndex: 0,
    }

    handleCreateObject(newFrame)
    setSelectedIds([newFrame.id])
    toast.success(
      `Created ${newFrame.name} (${preset.widthMm.toFixed(1)} mm × ${preset.heightMm.toFixed(1)} mm)`
    )
  }

  const handleUpdateSelectedObject = (updates: Partial<CanvasObject>) => {
    if (selectedIds.length === 0) return
    const updated = objects.map((obj) =>
      selectedIds.includes(obj.id) ? { ...obj, ...updates } : obj
    )
    updateObjectsAndRecord(updated, selectedIds, "Update Properties")
  }

  // CorelDRAW Smart Duplicate Offset Tracking
  const duplicateOffsetRef = React.useRef<{ dx: number; dy: number }>({ dx: 25, dy: 25 })
  const lastDuplicationRef = React.useRef<{
    sourceId: string
    sourceX: number
    sourceY: number
    duplicatedIds: string[]
  } | null>(null)

  // Clipboard for Copy / Cut / Paste
  const clipboardRef = React.useRef<CanvasObject[]>([])

  const handleCopy = () => {
    if (selectedIds.length === 0) return
    const selectedObjs = objects.filter((o) => selectedIds.includes(o.id))
    if (selectedObjs.length === 0) return
    clipboardRef.current = JSON.parse(JSON.stringify(selectedObjs))
    toast.success(`Copied ${selectedObjs.length} object${selectedObjs.length > 1 ? "s" : ""} (Ctrl + C)`)
  }

  const handleCut = () => {
    if (selectedIds.length === 0) return
    const selectedObjs = objects.filter((o) => selectedIds.includes(o.id))
    if (selectedObjs.length === 0) return
    clipboardRef.current = JSON.parse(JSON.stringify(selectedObjs))
    handleDeleteSelected()
    toast.info(`Cut ${selectedObjs.length} object${selectedObjs.length > 1 ? "s" : ""} (Ctrl + X)`)
  }

  const handlePaste = () => {
    if (clipboardRef.current.length === 0) {
      toast.info("Clipboard is empty. Copy (Ctrl+C) or Cut (Ctrl+X) an object first.")
      return
    }
    const pasted: CanvasObject[] = []
    const newIds: string[] = []

    clipboardRef.current.forEach((obj) => {
      const copy: CanvasObject = {
        ...JSON.parse(JSON.stringify(obj)),
        id: `${obj.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: `${obj.name || obj.type} Copy`,
        x: Math.round(obj.x + 20),
        y: Math.round(obj.y + 20),
        pageId: activePageId,
        zIndex: objects.length + pasted.length + 1,
      }
      pasted.push(copy)
      newIds.push(copy.id)
    })

    // Cascade next paste position slightly
    clipboardRef.current = clipboardRef.current.map((o) => ({ ...o, x: o.x + 20, y: o.y + 20 }))

    updateObjectsAndRecord([...objects, ...pasted], newIds, "Paste Objects")
    toast.success(`Pasted ${pasted.length} object${pasted.length > 1 ? "s" : ""} (Ctrl + V)`)
  }

  const handleUpdateSingleObject = (id: string, updates: Partial<CanvasObject>) => {
    // CorelDRAW Smart Duplicate Offset Tracking:
    // If the moved object was duplicated, compute and remember the displacement relative to original source!
    if (lastDuplicationRef.current && lastDuplicationRef.current.duplicatedIds.includes(id)) {
      if (updates.x !== undefined || updates.y !== undefined) {
        const currentObj = objects.find((o) => o.id === id)
        const newX = updates.x !== undefined ? updates.x : (currentObj?.x ?? 0)
        const newY = updates.y !== undefined ? updates.y : (currentObj?.y ?? 0)
        const dx = newX - lastDuplicationRef.current.sourceX
        const dy = newY - lastDuplicationRef.current.sourceY
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          duplicateOffsetRef.current = { dx, dy }
        }
      }
    }
    setObjects((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj))
    )
  }

  // Multi-Object Synchronized Simultaneous Updates
  const handleUpdateMultipleObjects = (updatesMap: Record<string, Partial<CanvasObject>>) => {
    setObjects((prev) =>
      prev.map((obj) => (updatesMap[obj.id] ? { ...obj, ...updatesMap[obj.id] } : obj))
    )
  }

  // Commit simultaneous move to undo/redo history
  const handleCommitMove = () => {
    setObjects((currentObjs) => {
      commandBusRef.current.pushState(currentObjs, selectedIds, settings, "Move Selected Objects")
      return currentObjs
    })
  }

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return
    const updated = objects.filter((obj) => !selectedIds.includes(obj.id))
    updateObjectsAndRecord(updated, [], "Delete Object")
    toast.info("Selected object deleted")
  }

  const handleDeleteSingleObject = (id: string) => {
    const updated = objects.filter((obj) => obj.id !== id)
    updateObjectsAndRecord(updated, selectedIds.filter((item) => item !== id), "Delete Object")
  }

  // CorelDRAW Smart Duplicate with continuous placement offset
  const handleDuplicateSelected = () => {
    if (selectedIds.length === 0) return
    const selectedObjs = objects.filter((o) => selectedIds.includes(o.id))
    if (selectedObjs.length === 0) return

    const duplicated: CanvasObject[] = []
    const newIds: string[] = []
    const currentOffset = duplicateOffsetRef.current
    const firstSource = { id: selectedObjs[0].id, x: selectedObjs[0].x, y: selectedObjs[0].y }

    objects.forEach((obj) => {
      duplicated.push(obj)
      if (selectedIds.includes(obj.id)) {
        const copy: CanvasObject = {
          ...JSON.parse(JSON.stringify(obj)),
          id: `${obj.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: `${obj.name || obj.type} Copy`,
          x: Math.round(obj.x + currentOffset.dx),
          y: Math.round(obj.y + currentOffset.dy),
          zIndex: objects.length + duplicated.length + 1,
        }
        duplicated.push(copy)
        newIds.push(copy.id)
      }
    })

    if (newIds.length > 0) {
      lastDuplicationRef.current = {
        sourceId: firstSource.id,
        sourceX: firstSource.x,
        sourceY: firstSource.y,
        duplicatedIds: newIds,
      }
    }

    updateObjectsAndRecord(duplicated, newIds, "Duplicate Object")
    toast.success(`Duplicated ${newIds.length} object${newIds.length > 1 ? "s" : ""} (Ctrl + D)`)
  }

  // Distribute Equal Spacing (Ctrl + Shift + 5)
  const handleDistributeEqualSpacing = () => {
    const selectedObjs = objects.filter((o) => selectedIds.includes(o.id))
    if (selectedObjs.length < 2) {
      toast.info("Select at least 2 objects to distribute equal spacing")
      return
    }

    const minX = Math.min(...selectedObjs.map((o) => o.x))
    const maxX = Math.max(...selectedObjs.map((o) => o.x + o.width))
    const minY = Math.min(...selectedObjs.map((o) => o.y))
    const maxY = Math.max(...selectedObjs.map((o) => o.y + o.height))

    const spanX = maxX - minX
    const spanY = maxY - minY

    let updated = [...objects]

    if (spanX >= spanY) {
      // Distribute Horizontally
      const sorted = [...selectedObjs].sort((a, b) => a.x - b.x)
      const totalWidth = sorted.reduce((sum, o) => sum + o.width, 0)
      const totalGap = (maxX - minX) - totalWidth
      const gap = sorted.length > 1 ? totalGap / (sorted.length - 1) : 0

      let curX = minX
      const posMap: Record<string, number> = {}
      sorted.forEach((o) => {
        posMap[o.id] = Math.round(curX)
        curX += o.width + gap
      })
      updated = updated.map((o) => (posMap[o.id] !== undefined ? { ...o, x: posMap[o.id] } : o))
      updateObjectsAndRecord(updated, selectedIds, "Distribute Horizontally")
      toast.success("Distributed Equal Spacing Horizontally (Ctrl + Shift + 5)")
    } else {
      // Distribute Vertically
      const sorted = [...selectedObjs].sort((a, b) => a.y - b.y)
      const totalHeight = sorted.reduce((sum, o) => sum + o.height, 0)
      const totalGap = (maxY - minY) - totalHeight
      const gap = sorted.length > 1 ? totalGap / (sorted.length - 1) : 0

      let curY = minY
      const posMap: Record<string, number> = {}
      sorted.forEach((o) => {
        posMap[o.id] = Math.round(curY)
        curY += o.height + gap
      })
      updated = updated.map((o) => (posMap[o.id] !== undefined ? { ...o, y: posMap[o.id] } : o))
      updateObjectsAndRecord(updated, selectedIds, "Distribute Vertically")
      toast.success("Distributed Equal Spacing Vertically (Ctrl + Shift + 5)")
    }
  }

  // Alignment Handlers
  const handleAlign = (alignment: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
    if (selectedIds.length === 0) return
    const scaleRatio = 3.2
    const pageWidthPx = Math.round(settings.widthMm * scaleRatio)
    const pageHeightPx = Math.round(settings.heightMm * scaleRatio)

    const selectedObjs = objects.filter((o) => selectedIds.includes(o.id))
    if (selectedObjs.length === 0) return

    let updated = [...objects]

    if (selectedObjs.length > 1) {
      const minX = Math.min(...selectedObjs.map((o) => o.x))
      const maxX = Math.max(...selectedObjs.map((o) => o.x + o.width))
      const minY = Math.min(...selectedObjs.map((o) => o.y))
      const maxY = Math.max(...selectedObjs.map((o) => o.y + o.height))
      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2

      updated = updated.map((obj) => {
        if (!selectedIds.includes(obj.id)) return obj
        let newX = obj.x
        let newY = obj.y
        if (alignment === "left") newX = minX
        if (alignment === "center") newX = centerX - obj.width / 2
        if (alignment === "right") newX = maxX - obj.width
        if (alignment === "top") newY = minY
        if (alignment === "middle") newY = centerY - obj.height / 2
        if (alignment === "bottom") newY = maxY - obj.height
        return { ...obj, x: Math.round(newX), y: Math.round(newY) }
      })
    } else {
      const obj = selectedObjs[0]
      let newX = obj.x
      let newY = obj.y
      if (alignment === "left") newX = 20
      if (alignment === "center") newX = (pageWidthPx - obj.width) / 2
      if (alignment === "right") newX = pageWidthPx - obj.width - 20
      if (alignment === "top") newY = 20
      if (alignment === "middle") newY = (pageHeightPx - obj.height) / 2
      if (alignment === "bottom") newY = pageHeightPx - obj.height - 20

      updated = updated.map((o) => (o.id === obj.id ? { ...o, x: Math.round(newX), y: Math.round(newY) } : o))
    }

    updateObjectsAndRecord(updated, selectedIds, `Align ${alignment}`)
  }

  // Layer Ordering Handlers
  const handleLayerOrder = (action: "front" | "forward" | "backward" | "back") => {
    if (selectedIds.length === 0) return
    let updated = [...objects]
    const currentMaxZ = Math.max(...objects.map((o) => o.zIndex || 0), 1)
    const currentMinZ = Math.min(...objects.map((o) => o.zIndex || 0), 1)

    updated = updated.map((obj) => {
      if (!selectedIds.includes(obj.id)) return obj
      let newZ = obj.zIndex || 1
      if (action === "front") newZ = currentMaxZ + 1
      if (action === "back") newZ = Math.max(0, currentMinZ - 1)
      if (action === "forward") newZ = (obj.zIndex || 1) + 1
      if (action === "backward") newZ = Math.max(0, (obj.zIndex || 1) - 1)
      return { ...obj, zIndex: newZ }
    })

    updated.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
    updateObjectsAndRecord(updated, selectedIds, `Layer ${action}`)
  }

  // Flip Rotation Handler
  const handleFlip = (axis: "horizontal" | "vertical") => {
    if (selectedIds.length === 0) return
    const updated = objects.map((obj) => {
      if (!selectedIds.includes(obj.id)) return obj
      const currentRot = obj.rotation || 0
      const newRot = axis === "horizontal" ? (360 - currentRot) % 360 : (180 - currentRot + 360) % 360
      return { ...obj, rotation: newRot }
    })
    updateObjectsAndRecord(updated, selectedIds, `Flip ${axis}`)
  }

  // Anchor Point Tool State & Operations
  const [selectedAnchorNodeIdx, setSelectedAnchorNodeIdx] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (activeTool === "anchor") {
      if (selectedObject) {
        if (!selectedObject.penNodes) {
          const { nodes, isClosed } = extractPenNodesFromObject(selectedObject)
          const bounds = computeBoundsFromNodes(nodes)
          const pathData = buildPenSvgPath(nodes, isClosed)
          handleUpdateSingleObject(selectedObject.id, {
            type: "path",
            penNodes: nodes,
            pathData,
            ...bounds,
          })
        }
        if (selectedAnchorNodeIdx === null) {
          setSelectedAnchorNodeIdx(0)
        }
      }
    } else {
      setSelectedAnchorNodeIdx(null)
    }
  }, [activeTool, selectedIds])

  const handleUpdateAnchorNode = (nodeIdx: number, newX: number, newY: number) => {
    if (!selectedObject) return
    const { nodes, isClosed } = extractPenNodesFromObject(selectedObject)
    if (nodeIdx < 0 || nodeIdx >= nodes.length) return
    const updatedNodes = nodes.map((n, idx) => {
      if (idx !== nodeIdx) return n
      const dx = newX - n.x
      const dy = newY - n.y
      return {
        x: newX,
        y: newY,
        cpIn: n.cpIn ? { x: n.cpIn.x + dx, y: n.cpIn.y + dy } : null,
        cpOut: n.cpOut ? { x: n.cpOut.x + dx, y: n.cpOut.y + dy } : null,
      }
    })
    const bounds = computeBoundsFromNodes(updatedNodes)
    const pathData = buildPenSvgPath(updatedNodes, isClosed)
    handleUpdateSelectedObject({
      type: "path",
      penNodes: updatedNodes,
      pathData,
      ...bounds,
    })
  }

  const handleConvertToSmooth = () => {
    if (!selectedObject || selectedAnchorNodeIdx === null) return
    const { nodes, isClosed } = extractPenNodesFromObject(selectedObject)
    const updatedNodes = convertNodeToSmooth(nodes, selectedAnchorNodeIdx, isClosed)
    const bounds = computeBoundsFromNodes(updatedNodes)
    const pathData = buildPenSvgPath(updatedNodes, isClosed)
    handleUpdateSelectedObject({
      type: "path",
      penNodes: updatedNodes,
      pathData,
      ...bounds,
    })
    toast.success("Converted anchor point to smooth Bézier curve")
  }

  const handleConvertToCorner = () => {
    if (!selectedObject || selectedAnchorNodeIdx === null) return
    const { nodes, isClosed } = extractPenNodesFromObject(selectedObject)
    const updatedNodes = convertNodeToCorner(nodes, selectedAnchorNodeIdx)
    const bounds = computeBoundsFromNodes(updatedNodes)
    const pathData = buildPenSvgPath(updatedNodes, isClosed)
    handleUpdateSelectedObject({
      type: "path",
      penNodes: updatedNodes,
      pathData,
      ...bounds,
    })
    toast.info("Converted anchor point to sharp corner")
  }

  const handleRetractHandles = () => {
    handleConvertToCorner()
  }

  const handleDeleteAnchor = () => {
    if (!selectedObject || selectedAnchorNodeIdx === null) return
    const { nodes, isClosed } = extractPenNodesFromObject(selectedObject)
    if (nodes.length <= 2) {
      toast.warning("Cannot delete node: path requires at least 2 points")
      return
    }
    const updatedNodes = deleteNodeFromPath(nodes, selectedAnchorNodeIdx)
    const bounds = computeBoundsFromNodes(updatedNodes)
    const pathData = buildPenSvgPath(updatedNodes, isClosed)
    handleUpdateSelectedObject({
      type: "path",
      penNodes: updatedNodes,
      pathData,
      ...bounds,
    })
    setSelectedAnchorNodeIdx(Math.max(0, selectedAnchorNodeIdx - 1))
    toast.success("Anchor point deleted")
  }

  // File Drag & Drop on Canvas
  const handleFileDrop = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const src = e.target?.result as string
          const newImg: CanvasObject = {
            id: `img-${Date.now()}`,
            name: file.name,
            type: "image",
            src,
            x: 200,
            y: 180,
            width: 260,
            height: 200,
            rotation: 0,
            opacity: 1,
            fill: "transparent",
            stroke: "none",
            strokeWidth: 0,
            blendMode: "normal",
            zIndex: objects.length + 1,
          }
          handleCreateObject(newImg)
          toast.success(`Imported ${file.name}!`)
        }
        reader.readAsDataURL(file)
      } else {
        toast.info(`Imported ${file.name} to project library.`)
      }
    })
  }

  // ─── Eva Agentic Execution & Ghost Cursor Sequence ──────────────────
  const executeEvaAction = (intent: ParsedEvaIntent) => {
    // Show Connect Website research badge if external platforms were engaged
    if (intent.researchPlatforms && intent.researchPlatforms.length > 0) {
      setActiveResearchSource(intent.researchPlatforms)
      setTimeout(() => setActiveResearchSource(null), 5000)
    }

    if (intent.actionLabel) {
      toast.success(intent.actionLabel)
    }

    const targetTool = intent.targetTool
    const toolBtn = targetTool ? document.getElementById(`tool-btn-${targetTool}`) : null
    const toolRect = toolBtn?.getBoundingClientRect()

    // 1. Execute canvas/document command immediately so the user sees results instantly
    if (intent.command) {
      applyEditorCommand(intent.command)
    }

    // 2. Stream spoken response / live commentary immediately
    if (intent.spokenResponse) {
      voiceEngineRef.current?.speak(intent.spokenResponse)
    }

    // 3. If a specific tool was requested, glide ghost cursor toward it
    if (toolRect && targetTool && !intent.isArchitectural) {
      setGhostCursor({
        visible: true,
        x: toolRect.left + 15,
        y: toolRect.top + 15,
        targetLabel: intent.actionLabel || `Selecting ${targetTool}`,
      })
      setHighlightedToolId(targetTool)

      setTimeout(() => {
        setGhostCursor((prev) => ({ ...prev, isClicking: true }))
        setActiveTool(targetTool)

        setTimeout(() => {
          setGhostCursor({ visible: false, x: 0, y: 0 })
          setHighlightedToolId(null)
        }, 500)
      }, 350)
    }

    // Add to message log with persona stamp
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: "eva",
        persona: activePersona,
        text: intent.spokenResponse,
        timestamp: "Just now",
        actionPerformed: intent.actionLabel,
        researchSource: intent.researchPlatforms ? intent.researchPlatforms.join(", ") : undefined,
      },
    ])
  }

  // Command Bus Execution Handler
  const applyEditorCommand = (command: any) => {
    switch (command.type) {
      case "CREATE_OBJECT":
        const newObj: CanvasObject = {
          ...command.payload,
          id: `${command.payload.type}-${Date.now()}`,
          x: command.payload.x || 360,
          y: command.payload.y || 260,
          rotation: 0,
          zIndex: objects.length + 1,
        }
        handleCreateObject(newObj)
        break

      case "CREATE_OBJECTS":
        if (Array.isArray(command.payload?.objects)) {
          handleCreateObjects(
            command.payload.objects,
            command.payload.description || "Created Design Elements"
          )
        }
        break

      case "AUTO_REFINE_CANVAS":
        if (Array.isArray(command.payload?.objects)) {
          updateObjectsAndRecord(
            command.payload.objects,
            selectedIds,
            command.payload.summary || "Auto-Refined Canvas"
          )
        }
        break

      case "SET_FILL":
        if (selectedIds.length > 0) {
          handleUpdateSelectedObject({ fill: command.payload.fill })
          setActiveColor(command.payload.fill)
        }
        break

      case "SET_OPACITY":
        if (selectedIds.length > 0) {
          handleUpdateSelectedObject({ opacity: command.payload.opacity })
        }
        break

      case "SET_SHADOW":
        if (selectedIds.length > 0) {
          handleUpdateSelectedObject(command.payload)
        }
        break

      case "ALIGN_OBJECT":
        if (selectedIds.length > 0) {
          // Center selected object on sheet
          const scaleRatio = 3.2
          const cx = (settings.widthMm * scaleRatio) / 2
          const cy = (settings.heightMm * scaleRatio) / 2
          const targetObj = objects.find((o) => o.id === selectedIds[0])
          if (targetObj) {
            handleUpdateSelectedObject({
              x: Math.round(cx - targetObj.width / 2),
              y: Math.round(cy - targetObj.height / 2),
            })
          }
        }
        break

      case "CHANGE_BACKGROUND":
        setSettings((prev) => ({
          ...prev,
          workspaceColor: command.payload.color,
        }))
        break

      case "DELETE_OBJECT":
        handleDeleteSelected()
        break

      case "CHANGE_TOOL":
        if (command.payload?.tool) {
          setActiveTool(command.payload.tool)
          if (command.payload?.subtype) {
            setActiveShapeSubtype(command.payload.subtype)
          }
        }
        break

      case "OPEN_MODAL":
        switch (command.payload?.modal) {
          case "export":
            setIsExportModalOpen(true)
            break
          case "files":
            setIsFilesModalOpen(true)
            break
          case "reference":
          case "connect_website":
            setIsRefSitesModalOpen(true)
            break
          case "knowledge":
            setIsKnowledgeModalOpen(true)
            break
          case "saved_prompts":
            setIsSavedPromptsOpen(true)
            break
          case "share":
            setIsShareModalOpen(true)
            break
        }
        break

      case "ZOOM":
        if (command.payload?.mode === "in") {
          setSettings((prev) => ({ ...prev, zoom: Math.min(5, Number(((prev.zoom || 1) + 0.25).toFixed(2))) }))
        } else if (command.payload?.mode === "out") {
          setSettings((prev) => ({ ...prev, zoom: Math.max(0.2, Number(((prev.zoom || 1) - 0.25).toFixed(2))) }))
        } else if (command.payload?.mode === "reset") {
          setSettings((prev) => ({ ...prev, zoom: 1 }))
        }
        break

      case "TOGGLE_RULERS":
        setSettings((prev) => ({
          ...prev,
          showRulers: command.payload?.show !== undefined ? command.payload.show : !prev.showRulers,
        }))
        break

      case "SET_ORIENTATION":
        if (command.payload?.orientation) {
          setSettings((prev) => ({
            ...prev,
            orientation: command.payload.orientation,
          }))
        }
        break

      case "CLEAR_CANVAS":
        updateObjectsAndRecord([], [], "Clear Canvas")
        break

      case "ROTATE_OBJECT":
        if (selectedIds.length > 0) {
          const angle = command.payload?.angle || 45
          const target = objects.find((o) => o.id === selectedIds[0])
          if (target) {
            handleUpdateSelectedObject({ rotation: (target.rotation + angle) % 360 })
          }
        }
        break

      case "RESIZE_OBJECT":
        if (selectedIds.length > 0) {
          const factor = command.payload?.factor || 1.3
          const target = objects.find((o) => o.id === selectedIds[0])
          if (target) {
            handleUpdateSelectedObject({
              width: Math.max(20, Math.round(target.width * factor)),
              height: Math.max(20, Math.round(target.height * factor)),
            })
          }
        }
        break

      case "SET_STROKE":
        if (selectedIds.length > 0) {
          handleUpdateSelectedObject({
            stroke: command.payload?.stroke,
            strokeWidth: command.payload?.strokeWidth ?? 2,
          })
        }
        break

      case "BRING_TO_FRONT":
        if (selectedIds.length > 0) {
          const maxZ = objects.reduce((max, o) => Math.max(max, o.zIndex), 0)
          handleUpdateSelectedObject({ zIndex: maxZ + 1 })
        }
        break

      case "SEND_TO_BACK":
        if (selectedIds.length > 0) {
          const minZ = objects.reduce((min, o) => Math.min(min, o.zIndex), 1)
          handleUpdateSelectedObject({ zIndex: Math.max(0, minZ - 1) })
        }
        break

      case "DUPLICATE_OBJECT":
        handleDuplicateSelected()
        break

      case "UNDO":
        handleUndo()
        break

      case "REDO":
        handleRedo()
        break

      default:
        break
    }
  }

  // Handle incoming voice or text from user
  const handleUserPrompt = (text: string) => {
    // 1. Add user query to conversation log
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text,
        timestamp: "Just now",
      },
    ])

    // 2. Parse command intent with active persona, canvas awareness, and document settings
    const hasSel = selectedIds.length > 0
    const intent = parseEvaCommand(
      text,
      userName,
      hasSel,
      activePersona,
      objects,
      settings,
      selectedIds,
      referenceSources
    )

    // 3. Execution based on Auto Proceed vs Ask For Proceed
    if (executionMode === "ask" && intent.command && intent.actionLabel) {
      setPendingAction({
        label: intent.actionLabel,
        execute: () => {
          setPendingAction(null)
          executeEvaAction(intent)
        },
      })
      voiceEngineRef.current?.speak(
        `I understand you'd like to ${intent.actionLabel}. Shall I proceed?`
      )
    } else {
      executeEvaAction(intent)
    }
  }

  // Persona Switch Handler
  const handlePersonaChange = (newPersona: EvaPersona) => {
    setActivePersona(newPersona)
    voiceEngineRef.current?.setPersona(newPersona)
    voiceEngineRef.current?.triggerDynamicGreeting(userName, (greetingText) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-persona-${Date.now()}`,
          sender: "eva",
          persona: newPersona,
          text: greetingText,
          timestamp: "Just now",
        },
      ])
    })
    toast.success(`Eva persona tone switched to ${newPersona.toUpperCase()}`)
  }

  // Play Dynamic Greeting Trigger (Non-repeating queue)
  const handlePlayDynamicGreeting = () => {
    voiceEngineRef.current?.triggerDynamicGreeting(userName, (greetingText) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-greet-${Date.now()}`,
          sender: "eva",
          persona: activePersona,
          text: greetingText,
          timestamp: "Just now",
        },
      ])
    })
  }

  // Toggle Voice Recognition with 2000ms VAD and Wake Word Filter
  const handleToggleListening = () => {
    if (isListening) {
      voiceEngineRef.current?.stopListening()
      setIsListening(false)
      setVadProgress(null)
      setWakeWordDetected(false)
      toast.info("Eva stopped listening.")
    } else {
      if (!voiceEngineRef.current?.isSpeechSupported()) {
        toast.error("Speech recognition is not supported in this browser. You can type commands in Eva Bot's chat!")
        return
      }

      voiceEngineRef.current?.setPersona(activePersona)
      voiceEngineRef.current?.setWakeWordCallback(setWakeWordDetected)
      voiceEngineRef.current?.setVadProgressCallback(setVadProgress)
      voiceEngineRef.current?.setSpeakingStateCallback(setIsSpeaking)

      voiceEngineRef.current?.startListening(
        (transcript, isFinal) => {
          if (isFinal) {
            setVadProgress(null)
            setWakeWordDetected(false)
            handleUserPrompt(transcript)
          }
        },
        (error) => {
          toast.error(error)
          setIsListening(false)
          setVadProgress(null)
          setWakeWordDetected(false)
        },
        (listening) => {
          setIsListening(listening)
          if (!listening) {
            setVadProgress(null)
            setWakeWordDetected(false)
          }
        },
        true // explicit manual turn on button click
      )
      toast.success("Eva is listening with 2000ms VAD! Say 'Hi Eva' or speak your design command.")
    }
  }

  const handleToggleMute = () => {
    const muted = voiceEngineRef.current?.toggleMute()
    setIsMuted(Boolean(muted))
    toast.info(muted ? "Eva voice muted" : "Eva voice enabled")
  }


  // Selected Object reference for Property Panel
  const selectedObject = objects.find((o) => selectedIds.includes(o.id)) || null

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden relative select-none">
      {/* ─── 1. TOP APPLICATION BAR ─────────────────────────────────── */}
      <TopBar
        settings={settings}
        onUpdateSettings={setSettings}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onCreateFrame={handleCreatePresetFrame}
        onOpenFilesModal={() => setIsFilesModalOpen(true)}
        canUndo={commandBusRef.current.canUndo()}
        canRedo={commandBusRef.current.canRedo()}
        onUndo={handleUndo}
        onRedo={handleRedo}
        selectedObjectCount={selectedIds.length}
        isEvaBotOpen={isEvaBotOpen}
        onToggleEvaBot={() => setIsEvaBotOpen((prev) => !prev)}
      />

      {/* ─── 2. MAIN WORKSPACE ROW (Toolbar + Canvas + Properties + Eva) ─ */}
      <div className="flex flex-1 min-h-0 relative overflow-hidden">
        {/* Left Vertical Design Toolbar */}
        <LeftToolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          activeColor={activeColor}
          onChangeColor={setActiveColor}
          showRuler={settings.showRulers}
          onToggleRuler={() =>
            setSettings((prev) => ({ ...prev, showRulers: !prev.showRulers }))
          }
          onOpenExport={() => setIsExportModalOpen(true)}
          onOpenShareLink={() => setIsShareModalOpen(true)}
          onOpenReferenceSites={() => setIsRefSitesModalOpen(true)}
          onOpenToolKnowledge={() => setIsKnowledgeModalOpen(true)}
          highlightedToolId={highlightedToolId}
          activeShapeSubtype={activeShapeSubtype}
          onChangeShapeSubtype={setActiveShapeSubtype}
        />

        {/* Central Design Canvas */}
        <DesignCanvas
          settings={settings}
          onUpdateSettings={setSettings}
          objects={objects}
          selectedIds={selectedIds}
          activeTool={activeTool}
          activeShapeSubtype={activeShapeSubtype}
          onSelectObject={(id, isMulti) => {
            if (isMulti) {
              setSelectedIds((prev) =>
                prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
              )
            } else {
              setSelectedIds([id])
            }
          }}
          onSelectMultipleObjects={setSelectedIds}
          onClearSelection={() => setSelectedIds([])}
          onUpdateObject={handleUpdateSingleObject}
          onUpdateMultipleObjects={handleUpdateMultipleObjects}
          onCommitObjects={handleCommitMove}
          onCreateObject={handleCreateObject}
          onFileDrop={handleFileDrop}
          activeColor={activeColor}
          onChangeActiveColor={setActiveColor}
          pages={pages}
          activePageId={activePageId}
          onSelectPage={handleSelectPage}
          onInsertPageBefore={handleInsertPageBefore}
          onInsertPageAfter={handleInsertPageAfter}
          onDuplicatePage={handleDuplicatePage}
          onDeletePage={handleDeletePage}
          onRenamePage={handleRenamePage}
          onReorderPages={handleReorderPages}
          selectedAnchorNodeIdx={selectedAnchorNodeIdx}
          onSelectAnchorNode={setSelectedAnchorNodeIdx}
          onDeleteObject={handleDeleteSingleObject}
        />

        {/* Right Column: Properties Inspector */}
        <div className="flex flex-col h-full w-80 shrink-0 border-l border-border/80 bg-card/95 z-20 overflow-hidden">
          {/* Selected Tools Contextual Properties */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <PropertiesPanel
              activeTool={activeTool}
              onSelectTool={setActiveTool}
              selectedObject={selectedObject}
              selectedIds={selectedIds}
              objects={objects}
              onUpdateObject={handleUpdateSelectedObject}
              onDeleteObject={handleDeleteSelected}
              onDuplicateObject={handleDuplicateSelected}
              activeColor={activeColor}
              onChangeActiveColor={setActiveColor}
              documentSettings={settings}
              onUpdateDocumentSettings={setSettings}
              onAlign={handleAlign}
              onLayerOrder={handleLayerOrder}
              onFlip={handleFlip}
              selectedAnchorNodeIdx={selectedAnchorNodeIdx}
              onSelectAnchorNode={setSelectedAnchorNodeIdx}
              onConvertToSmooth={handleConvertToSmooth}
              onConvertToCorner={handleConvertToCorner}
              onRetractHandles={handleRetractHandles}
              onDeleteAnchor={handleDeleteAnchor}
              onUpdateAnchorNode={handleUpdateAnchorNode}
            />
          </div>
        </div>
      </div>

      {/* ─── 3. EVA GHOST CURSOR (Agentic Visual Demonstration) ─────── */}
      <EvaGhostCursor cursorState={ghostCursor} />

      {/* ─── 4. MODALS & POP-OUT WINDOWS ────────────────────────────── */}
      <AllFilesModal
        open={isFilesModalOpen}
        onOpenChange={setIsFilesModalOpen}
        onOpenSavedPrompts={() => setIsSavedPromptsOpen(true)}
      />

      <ExportModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        fileName={settings.fileName}
        onExecuteExport={(format, transparentBg, scale) => {
          toast.success(`Exporting ${settings.fileName}.${format.toLowerCase()} at ${scale}x scale!`)
        }}
      />

      <ShareLinkModal
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        fileName={settings.fileName}
      />

      <ReferenceSitesModal
        open={isRefSitesModalOpen}
        onOpenChange={setIsRefSitesModalOpen}
        sources={referenceSources}
        onSourcesChange={setReferenceSources}
      />

      <ToolKnowledgeModal
        open={isKnowledgeModalOpen}
        onOpenChange={setIsKnowledgeModalOpen}
      />

      <SavedPromptsModal
        open={isSavedPromptsOpen}
        onOpenChange={setIsSavedPromptsOpen}
        onApplyPrompt={(promptText) => {
          handleUserPrompt(promptText)
        }}
      />
      {/* ─── 4. FLOATING DRAGGABLE EVA BOT AI ASSISTANT ────────────── */}
      {isEvaBotOpen && (
        <div
          ref={evaBotPanelRef}
          style={{
            position: "fixed",
            left: evaBotPos ? `${evaBotPos.x}px` : undefined,
            top: evaBotPos ? `${evaBotPos.y}px` : undefined,
            right: evaBotPos ? undefined : "16px",
            bottom: evaBotPos ? undefined : "16px",
            zIndex: 60,
            width: "340px",
          }}
          className="shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        >
          <EvaBotPanel
            isListening={isListening}
            isMuted={isMuted}
            isSpeaking={isSpeaking}
            onToggleListening={handleToggleListening}
            onToggleMute={handleToggleMute}
            userName={userName}
            onUserNameChange={setUserName}
            messages={messages}
            onSendMessage={handleUserPrompt}
            executionMode={executionMode}
            onExecutionModeChange={setExecutionMode}
            activePersona={activePersona}
            onPersonaChange={handlePersonaChange}
            vadProgress={vadProgress}
            wakeWordDetected={wakeWordDetected}
            activeResearchSource={activeResearchSource}
            connectedSourcesCount={referenceSources.filter((s) => s.connected).length}
            onOpenReferenceSites={() => setIsRefSitesModalOpen(true)}
            onPlayGreeting={handlePlayDynamicGreeting}
            pendingAction={pendingAction}
            onCancelPendingAction={() => setPendingAction(null)}
            onTestVoice={() => {
              voiceEngineRef.current?.triggerDynamicGreeting(userName)
            }}
            onClose={() => setIsEvaBotOpen(false)}
            onDragStart={handleStartDragEvaBot}
          />
        </div>
      )}
    </div>
  )
}
