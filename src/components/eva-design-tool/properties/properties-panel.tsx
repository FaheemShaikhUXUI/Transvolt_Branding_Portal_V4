"use client"

import * as React from "react"
import {
  CanvasObject,
  DocumentSettings,
  ToolType,
  ShapeSubtype,
  BlendMode,
  MeasurementUnit,
} from "@/types/eva-editor"
import { extractPenNodesFromObject } from "@/core/editor/anchor-utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropShadowIcon } from "../icons/drop-shadow-icon"
import { TransparencyGobletIcon } from "../icons/transparency-icon"
import { HsvColorPicker } from "../ui/hsv-color-picker"

const PRESET_SWATCHES = [
  "#548235", // Brand Forest Green
  "#3E72C4", // Corel / Royal Blue
  "#FFFFFF", // Pure White
  "#000000", // Pure Black
  "#1E293B", // Dark Slate
  "#F8FAFC", // Light Ghost Gray
  "#84CC16", // Lime Green
  "#06B6D4", // Electric Cyan
  "#F59E0B", // Bright Orange
  "#EF4444", // Crimson Red
]
import {
  MousePointer,
  Square,
  Circle,
  Star,
  Pencil,
  PenTool,
  Network,
  Type,
  Crop,
  Layers,
  Sparkles,
  Search,
  Ruler,
  Pipette,
  Blend,
  Minus,
  Palette,
  Trash2,
  Copy,
  ChevronDown,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Lock,
  Unlock,
  Check,
  Grid,
  Maximize2,
  Sliders,
  Move,
  Eye,
  SlidersHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { FrameToolIcon } from "../icons/frame-tool-icon"
import { CorelDrawTextPanel } from "./coreldraw-text-panel"

export interface PropertiesPanelProps {
  activeTool: ToolType
  onSelectTool?: (tool: ToolType) => void
  selectedObject: CanvasObject | null
  selectedIds?: string[]
  objects?: CanvasObject[]
  onUpdateObject: (updated: Partial<CanvasObject>) => void
  onDeleteObject: () => void
  onDuplicateObject: () => void
  activeColor?: string
  onChangeActiveColor?: (color: string) => void
  documentSettings: DocumentSettings
  onUpdateDocumentSettings: (updater: (prev: DocumentSettings) => DocumentSettings) => void
  onAlign?: (alignment: "left" | "center" | "right" | "top" | "middle" | "bottom") => void
  onLayerOrder?: (action: "front" | "forward" | "backward" | "back") => void
  onFlip?: (axis: "horizontal" | "vertical") => void
  // Anchor Point Tool props
  selectedAnchorNodeIdx?: number | null
  onSelectAnchorNode?: (idx: number | null) => void
  onConvertToSmooth?: () => void
  onConvertToCorner?: () => void
  onRetractHandles?: () => void
  onDeleteAnchor?: () => void
  onUpdateAnchorNode?: (nodeIdx: number, newX: number, newY: number) => void
}

const BRAND_PALETTE = [
  { name: "Transvolt Green", hex: "#548235" },
  { name: "Corporate Blue", hex: "#4472c4" },
  { name: "Pure White", hex: "#ffffff" },
  { name: "Pure Black", hex: "#000000" },
  { name: "Slate Dark", hex: "#1e293b" },
  { name: "Cool Off-White", hex: "#f8fafc" },
  { name: "Eco Lime", hex: "#84cc16" },
  { name: "Electric Cyan", hex: "#06b6d4" },
  { name: "Warning Amber", hex: "#f59e0b" },
  { name: "Danger Red", hex: "#ef4444" },
]

const TOOL_META: Record<
  ToolType,
  { name: string; icon: any; shortcut?: string; desc: string }
> = {
  select: { name: "Selection Tool", icon: MousePointer, shortcut: "V", desc: "Select, move, transform & align elements" },
  frame: { name: "Frame Tool", icon: FrameToolIcon, shortcut: "F", desc: "Create & resize pages of any custom size" },
  rectangle: { name: "Square / Rectangle Tool", icon: Square, shortcut: "R", desc: "Geometric rectangles & rounded shapes" },
  circle: { name: "Circle / Ellipse Tool", icon: Circle, shortcut: "O", desc: "Circles, ellipses, rings & pie arcs" },
  shape: { name: "Any Shape Tool", icon: Star, shortcut: "S", desc: "Stars, polygons, triangles & custom vertices" },
  pencil: { name: "Free Hand Pencil Tool", icon: Pencil, shortcut: "N", desc: "Freehand vector sketching & smoothing" },
  pen: { name: "Advance Pen Tool", icon: PenTool, shortcut: "P", desc: "Precision Bézier curves & path anchors" },
  anchor: { name: "Edit Anchor Point Tool", icon: Network, shortcut: "A", desc: "Sub-path node editing & handle control" },
  text: { name: "CorelDRAW Text Tool", icon: Type, shortcut: "F8 / T", desc: "Typography, character metrics, outline pen & frame docker" },
  crop: { name: "Crop Tool", icon: Crop, shortcut: "C", desc: "Artboard & vector object framing" },
  transparency: { name: "Transparent Tool", icon: TransparencyGobletIcon, desc: "Alpha masking, opacity & layer blending" },
  shadow: { name: "Drop Shadow Tool", icon: DropShadowIcon, desc: "Multi-direction blurs, spread & elevation" },
  zoom: { name: "Zoom Tool", icon: Search, shortcut: "Z", desc: "Viewport scale, mouse focus & navigation" },
  ruler: { name: "Show Ruler", icon: Ruler, desc: "Measurement units, grids & snap guidelines" },
  eyedropper: { name: "Color Picker", icon: Pipette, shortcut: "I", desc: "Sample pixels, hex codes & color palette" },
  blend: { name: "Blending Options Tool", icon: Blend, desc: "Compositing blend modes & group knockouts" },
  stroke: { name: "Stroke Tool", icon: Minus, desc: "Weight, dash patterns, caps & corner joins" },
  color: { name: "Color Tool", icon: Palette, desc: "Solid fills, linear & radial gradients" },
}

export function PropertiesPanel({
  activeTool = "select",
  onSelectTool = () => {},
  selectedObject,
  selectedIds = [],
  objects = [],
  onUpdateObject,
  onDeleteObject,
  onDuplicateObject,
  activeColor = "#548235",
  onChangeActiveColor = () => {},
  documentSettings,
  onUpdateDocumentSettings,
  onAlign = () => {},
  onLayerOrder = () => {},
  onFlip = () => {},
  selectedAnchorNodeIdx = null,
  onSelectAnchorNode,
  onConvertToSmooth,
  onConvertToCorner,
  onRetractHandles,
  onDeleteAnchor,
  onUpdateAnchorNode,
}: PropertiesPanelProps) {
  // Local state for tools without an active object selected
  const [aspectLocked, setAspectLocked] = React.useState(false)
  const [independentCorners, setIndependentCorners] = React.useState(false)
  const [cornerRadii, setCornerRadii] = React.useState({ tl: 0, tr: 0, br: 0, bl: 0 })
  const [shapeSubtype, setShapeSubtype] = React.useState<ShapeSubtype>("star")
  const [shapePoints, setShapePoints] = React.useState(5)
  const [innerRatio, setInnerRatio] = React.useState(42)
  const [pencilSmooth, setPencilSmooth] = React.useState("medium")
  const [pressureSim, setPressureSim] = React.useState(true)
  const [cropPreset, setCropPreset] = React.useState("free")
  const [donutHole, setDonutHole] = React.useState(0)
  const [startAngle, setStartAngle] = React.useState(0)
  const [endAngle, setEndAngle] = React.useState(360)
  const [recentColors, setRecentColors] = React.useState<string[]>([
    "#548235",
    "#4472c4",
    "#1e293b",
    "#ffffff",
    "#000000",
  ])
  const [copiedHex, setCopiedHex] = React.useState(false)

  // Current values reflecting selectedObject OR fallback active state
  const currentFill = selectedObject?.fill ?? activeColor
  const currentStroke = selectedObject?.stroke ?? "#000000"
  const currentStrokeWidth = selectedObject?.strokeWidth ?? 2
  const currentOpacity = selectedObject?.opacity ?? 1
  const currentCornerRadius = selectedObject?.cornerRadius ?? 0
  const currentBlendMode = selectedObject?.blendMode ?? "normal"
  const currentShadowEnabled = Boolean(selectedObject?.shadowEnabled)
  const currentShadowBlur = selectedObject?.shadowBlur ?? 16
  const currentShadowOffsetX = selectedObject?.shadowOffsetX ?? 0
  const currentShadowOffsetY = selectedObject?.shadowOffsetY ?? 8
  const currentShadowColor = selectedObject?.shadowColor ?? "rgba(0,0,0,0.25)"
  const currentRotation = selectedObject?.rotation ?? 0

  const handleColorChange = (hex: string) => {
    if (selectedObject) {
      onUpdateObject({ fill: hex })
    }
    onChangeActiveColor(hex)
    if (!recentColors.includes(hex)) {
      setRecentColors((prev) => [hex, ...prev.slice(0, 7)])
    }
  }

  const handleCopyColor = (val: string) => {
    navigator.clipboard.writeText(val)
    setCopiedHex(true)
    toast.success(`Copied ${val} to clipboard!`)
    setTimeout(() => setCopiedHex(false), 1500)
  }

  const activeMeta = TOOL_META[activeTool] || TOOL_META.select
  const ActiveIcon = activeMeta.icon

  // Universal drag-to-scrub for numerical shape properties (hold left key & drag to adjust)
  const startScrubNumber = (
    e: React.MouseEvent,
    config: {
      initialValue: number
      axis?: "x" | "y"
      step?: number
      min?: number
      max?: number
      precision?: number
      onUpdate: (val: number) => void
    }
  ) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const startY = e.clientY
    const { initialValue, axis = "x", step = 1, min = -Infinity, max = Infinity, precision = 0, onUpdate } = config

    const originalCursor = document.body.style.cursor
    const originalUserSelect = document.body.style.userSelect
    document.body.style.cursor = axis === "y" ? "ns-resize" : "ew-resize"
    document.body.style.userSelect = "none"

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault()

      let delta = 0
      if (axis === "x") {
        delta = moveEvent.clientX - startX
      } else {
        const deltaY = -(moveEvent.clientY - startY)
        const deltaX = moveEvent.clientX - startX
        delta = Math.abs(deltaY) >= Math.abs(deltaX) ? deltaY : deltaX
      }

      let currentStep = step
      if (moveEvent.shiftKey) currentStep *= 10
      if (moveEvent.altKey) currentStep *= 0.1

      const raw = initialValue + delta * currentStep
      const clamped = Math.min(max, Math.max(min, raw))
      const factor = Math.pow(10, precision)
      const rounded = Math.round(clamped * factor) / factor

      onUpdate(rounded)
    }

    const onMouseUp = () => {
      document.body.style.cursor = originalCursor
      document.body.style.userSelect = originalUserSelect
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }

  return (
    <aside className="w-full h-full bg-card/95 backdrop-blur-md flex flex-col select-none overflow-hidden text-xs">
      {/* ─── 1. Header: Dynamic Tool Title & Selection Badge ──────── */}
      <div className="p-3 border-b border-border/80 bg-muted/20 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#007aff]/10 text-[#007aff] border border-[#007aff]/25">
              <ActiveIcon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-foreground text-xs leading-none">
                  {activeMeta.name}
                </span>
                {activeMeta.shortcut && (
                  <span className="text-[10px] font-mono px-1 rounded bg-background/80 border border-border text-muted-foreground">
                    {activeMeta.shortcut}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[180px]">
                {activeMeta.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Selected Object Indicator & Quick Actions */}
        {selectedObject && (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-background/70 border border-[#548235]/30">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-2 h-2 rounded-full bg-[#548235] animate-pulse shrink-0" />
              <span className="font-bold text-foreground text-[11px] truncate">
                {selectedObject.name || selectedObject.type}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                #{selectedObject.id.slice(-4)}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="icon"
                variant="ghost"
                onClick={onDuplicateObject}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                title="Duplicate Object (Ctrl+D)"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onDeleteObject}
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                title="Delete Object (Delete)"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 2. Scrollable Body: Specific Tool Detailed Properties ─── */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 overlay-scrollbar">
        {/* ─── A. SELECTION TOOL PROPERTIES ───────────────────────── */}
        {activeTool === "select" && (
          <div className="space-y-4">
            {selectedObject ? (
              <>
                {/* Transform Geometry */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Transform
                    </Label>
                    <button
                      onClick={() => setAspectLocked(!aspectLocked)}
                      className={cn(
                        "p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer transition-colors",
                        aspectLocked && "text-[#548235] font-bold"
                      )}
                      title={aspectLocked ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
                    >
                      {aspectLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div className="flex items-center px-2 h-7.5 rounded-lg border border-border/70 bg-background/50">
                      <span
                        onMouseDown={(e) =>
                          selectedObject &&
                          startScrubNumber(e, {
                            initialValue: selectedObject.x,
                            axis: "x",
                            step: 1,
                            onUpdate: (x) => onUpdateObject({ x }),
                          })
                        }
                        className="text-[10px] text-muted-foreground hover:text-primary font-bold w-4 cursor-ew-resize select-none hover:bg-muted/70 rounded text-center transition-colors"
                        title="Click & drag to scrub X position (Shift: 10x, Alt: 0.1x)"
                      >
                        X
                      </span>
                      <input
                        type="number"
                        value={Math.round(selectedObject.x)}
                        onChange={(e) =>
                          onUpdateObject({ x: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full text-right bg-transparent focus:outline-hidden"
                      />
                    </div>
                    <div className="flex items-center px-2 h-7.5 rounded-lg border border-border/70 bg-background/50">
                      <span
                        onMouseDown={(e) =>
                          selectedObject &&
                          startScrubNumber(e, {
                            initialValue: selectedObject.y,
                            axis: "y",
                            step: 1,
                            onUpdate: (y) => onUpdateObject({ y }),
                          })
                        }
                        className="text-[10px] text-muted-foreground hover:text-primary font-bold w-4 cursor-ns-resize select-none hover:bg-muted/70 rounded text-center transition-colors"
                        title="Click & drag to scrub Y position (Shift: 10x, Alt: 0.1x)"
                      >
                        Y
                      </span>
                      <input
                        type="number"
                        value={Math.round(selectedObject.y)}
                        onChange={(e) =>
                          onUpdateObject({ y: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full text-right bg-transparent focus:outline-hidden"
                      />
                    </div>
                    <div className="flex items-center px-2 h-7.5 rounded-lg border border-border/70 bg-background/50">
                      <span
                        onMouseDown={(e) =>
                          selectedObject &&
                          startScrubNumber(e, {
                            initialValue: selectedObject.width,
                            axis: "x",
                            step: 1,
                            min: 5,
                            onUpdate: (w) => {
                              if (aspectLocked && selectedObject.width > 0) {
                                const ratio = selectedObject.height / selectedObject.width
                                onUpdateObject({ width: w, height: Math.round(w * ratio) })
                              } else {
                                onUpdateObject({ width: w })
                              }
                            },
                          })
                        }
                        className="text-[10px] text-muted-foreground hover:text-primary font-bold w-4 cursor-ew-resize select-none hover:bg-muted/70 rounded text-center transition-colors"
                        title="Click & drag to scrub Width (Shift: 10x, Alt: 0.1x)"
                      >
                        W
                      </span>
                      <input
                        type="number"
                        value={Math.round(selectedObject.width)}
                        onChange={(e) => {
                          const w = Math.max(5, parseFloat(e.target.value) || 5)
                          if (aspectLocked && selectedObject.width > 0) {
                            const ratio = selectedObject.height / selectedObject.width
                            onUpdateObject({ width: w, height: Math.round(w * ratio) })
                          } else {
                            onUpdateObject({ width: w })
                          }
                        }}
                        className="w-full text-right bg-transparent focus:outline-hidden"
                      />
                    </div>
                    <div className="flex items-center px-2 h-7.5 rounded-lg border border-border/70 bg-background/50">
                      <span
                        onMouseDown={(e) =>
                          selectedObject &&
                          startScrubNumber(e, {
                            initialValue: selectedObject.height,
                            axis: "y",
                            step: 1,
                            min: 5,
                            onUpdate: (h) => {
                              if (aspectLocked && selectedObject.height > 0) {
                                const ratio = selectedObject.width / selectedObject.height
                                onUpdateObject({ height: h, width: Math.round(h * ratio) })
                              } else {
                                onUpdateObject({ height: h })
                              }
                            },
                          })
                        }
                        className="text-[10px] text-muted-foreground hover:text-primary font-bold w-4 cursor-ns-resize select-none hover:bg-muted/70 rounded text-center transition-colors"
                        title="Click & drag to scrub Height (Shift: 10x, Alt: 0.1x)"
                      >
                        H
                      </span>
                      <input
                        type="number"
                        value={Math.round(selectedObject.height)}
                        onChange={(e) => {
                          const h = Math.max(5, parseFloat(e.target.value) || 5)
                          if (aspectLocked && selectedObject.height > 0) {
                            const ratio = selectedObject.width / selectedObject.height
                            onUpdateObject({ height: h, width: Math.round(h * ratio) })
                          } else {
                            onUpdateObject({ height: h })
                          }
                        }}
                        className="w-full text-right bg-transparent focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Rotation & Flip Controls */}
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Rotation & Flip
                    </Label>
                    <span
                      onMouseDown={(e) =>
                        startScrubNumber(e, {
                          initialValue: currentRotation,
                          axis: "x",
                          step: 1,
                          onUpdate: (r) => onUpdateObject({ rotation: Math.round(((r % 360) + 360) % 360) }),
                        })
                      }
                      className="font-mono text-xs text-foreground hover:text-primary font-semibold cursor-ew-resize select-none px-1.5 py-0.5 rounded hover:bg-muted/70 transition-colors"
                      title="Click & drag to scrub Rotation angle (Shift: 10x, Alt: 0.1x)"
                    >
                      {Math.round(currentRotation)}°
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={Math.round(currentRotation)}
                      onChange={(e) =>
                        onUpdateObject({ rotation: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full accent-[#548235] cursor-pointer"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          onUpdateObject({ rotation: (currentRotation - 90 + 360) % 360 })
                        }
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Rotate -90°"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          onUpdateObject({ rotation: (currentRotation + 90) % 360 })
                        }
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Rotate +90°"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onFlip("horizontal")}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Flip Horizontal"
                      >
                        <FlipHorizontal className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onFlip("vertical")}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Flip Vertical"
                      >
                        <FlipVertical className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Alignment Actions */}
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Alignment
                  </Label>
                  <div className="grid grid-cols-6 gap-1 bg-background/50 p-1 rounded-lg border border-border/70">
                    <button
                      onClick={() => onAlign("left")}
                      className="flex items-center justify-center h-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Align Left"
                    >
                      <AlignLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onAlign("center")}
                      className="flex items-center justify-center h-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Align Center Horizontal"
                    >
                      <AlignCenter className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onAlign("right")}
                      className="flex items-center justify-center h-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Align Right"
                    >
                      <AlignRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onAlign("top")}
                      className="flex items-center justify-center h-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Align Top"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onAlign("middle")}
                      className="flex items-center justify-center h-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Align Middle Vertical"
                    >
                      <AlignJustify className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onAlign("bottom")}
                      className="flex items-center justify-center h-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Align Bottom"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Layer Arrangement */}
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Layer Ordering
                  </Label>
                  <div className="grid grid-cols-4 gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onLayerOrder("front")}
                      className="h-7 text-[10px] gap-1 px-1.5"
                      title="Bring to Front"
                    >
                      <ChevronsUp className="h-3 w-3" />
                      Front
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onLayerOrder("forward")}
                      className="h-7 text-[10px] gap-1 px-1.5"
                      title="Bring Forward"
                    >
                      <ArrowUp className="h-3 w-3" />
                      Forward
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onLayerOrder("backward")}
                      className="h-7 text-[10px] gap-1 px-1.5"
                      title="Send Backward"
                    >
                      <ArrowDown className="h-3 w-3" />
                      Back
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onLayerOrder("back")}
                      className="h-7 text-[10px] gap-1 px-1.5"
                      title="Send to Back"
                    >
                      <ChevronsDown className="h-3 w-3" />
                      Bottom
                    </Button>
                  </div>
                </div>

                {/* CorelDRAW Text Docker inside Selection Tool when a text object is selected */}
                {selectedObject.type === "text" && (
                  <div className="pt-2 border-t border-border/60">
                    <CorelDrawTextPanel
                      selectedObject={selectedObject}
                      onUpdateObject={onUpdateObject}
                      activeColor={activeColor}
                      onChangeActiveColor={onChangeActiveColor}
                    />
                  </div>
                )}
              </>
            ) : (
              /* No selection: Document Summary */
              <div className="space-y-3.5 py-1">
                <div className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-xs">Canvas Artboard</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#548235]/15 text-[#548235] font-bold">
                      {documentSettings.pageSize}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {documentSettings.widthMm} × {documentSettings.heightMm} mm ({documentSettings.unit})
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Orientation: <span className="capitalize">{documentSettings.orientation}</span> • Zoom: {Math.round(documentSettings.zoom * 100)}%
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border border-border/60 bg-background/50 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Layers Overview</span>
                  <p className="text-[11px] text-foreground font-semibold">
                    {objects.length} vector object{objects.length === 1 ? "" : "s"} on canvas
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Click any element on canvas to inspect, or select a drawing tool on the left toolbar.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── FRAME TOOL PROPERTIES ───────────────────────────────── */}
        {activeTool === "frame" && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
              <div className="flex items-center gap-2">
                <FrameToolIcon className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Frame & Page Creator</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Click and drag anywhere on the canvas to draw a page like the main page in any custom size. Or pick a preset:
              </p>
            </div>

            {/* Quick Presets inside Panel */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Page Presets
              </Label>
              <div className="space-y-1">
                {[
                  { name: "A4 Landscape", mm: "318 × 210 mm", w: 1018, h: 672 },
                  { name: "A4 Portrait", mm: "210 × 318 mm", w: 672, h: 1018 },
                  { name: "A3 Sheet", mm: "420 × 297 mm", w: 1344, h: 950 },
                  { name: "Instagram Square", mm: "1080 × 1080 px", w: 1080, h: 1080 },
                  { name: "Full HD Screen", mm: "1920 × 1080 px", w: 1920, h: 1080 },
                  { name: "Mobile Screen", mm: "393 × 852 px", w: 393, h: 852 },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      if (selectedObject && selectedObject.type === "frame") {
                        onUpdateObject({ width: item.w, height: item.h, name: item.name })
                        toast.success(`Resized page to ${item.name}`)
                      } else {
                        toast.info("Click & drag on canvas to draw, or use top header preset to add page")
                      }
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg border border-border/60 hover:bg-muted/60 text-xs text-foreground flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground block font-mono">{item.mm}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">Select</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedObject && selectedObject.type === "frame" && (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Page Fill Color
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedObject.fill || "#ffffff"}
                    onChange={(e) => onUpdateObject({ fill: e.target.value })}
                    className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={selectedObject.fill || "#ffffff"}
                    onChange={(e) => onUpdateObject({ fill: e.target.value })}
                    className="flex-1 h-7.5 px-2 text-xs font-mono uppercase bg-background/50 border border-border rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── B. RECTANGLE TOOL PROPERTIES ───────────────────────── */}
        {activeTool === "rectangle" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Corner Radius
              </Label>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">All Corners:</span>
                <span
                  onMouseDown={(e) =>
                    startScrubNumber(e, {
                      initialValue: currentCornerRadius,
                      axis: "x",
                      step: 1,
                      min: 0,
                      max: 200,
                      onUpdate: (r) => onUpdateObject({ cornerRadius: r }),
                    })
                  }
                  className="font-mono text-xs font-bold text-foreground hover:text-primary cursor-ew-resize select-none px-1.5 py-0.5 rounded hover:bg-muted/70 transition-colors"
                  title="Click & drag to scrub Corner Radius"
                >
                  {currentCornerRadius}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={currentCornerRadius}
                onChange={(e) =>
                  onUpdateObject({ cornerRadius: parseFloat(e.target.value) || 0 })
                }
                className="w-full accent-[#548235] cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-muted-foreground">Independent 4 Corners</span>
                <Checkbox
                  checked={independentCorners}
                  onCheckedChange={(c) => setIndependentCorners(Boolean(c))}
                />
              </div>

              {independentCorners && (
                <div className="grid grid-cols-4 gap-1 pt-1 font-mono text-[10px]">
                  <div className="p-1 rounded border border-border/70 bg-background/50 text-center">
                    <span
                      onMouseDown={(e) =>
                        startScrubNumber(e, {
                          initialValue: cornerRadii.tl,
                          axis: "x",
                          step: 1,
                          min: 0,
                          max: 200,
                          onUpdate: (val) => {
                            setCornerRadii((p) => ({ ...p, tl: val }))
                            onUpdateObject({ cornerRadius: val })
                          },
                        })
                      }
                      className="text-muted-foreground hover:text-primary block text-[9px] font-bold cursor-ew-resize select-none px-1 rounded hover:bg-muted/70 transition-colors"
                      title="Hold Left Click & Drag to scrub Top-Left Corner Radius"
                    >
                      TL
                    </span>
                    <input
                      type="number"
                      value={cornerRadii.tl}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        setCornerRadii((p) => ({ ...p, tl: val }))
                        onUpdateObject({ cornerRadius: val })
                      }}
                      className="w-full text-center bg-transparent focus:outline-hidden"
                    />
                  </div>
                  <div className="p-1 rounded border border-border/70 bg-background/50 text-center">
                    <span
                      onMouseDown={(e) =>
                        startScrubNumber(e, {
                          initialValue: cornerRadii.tr,
                          axis: "x",
                          step: 1,
                          min: 0,
                          max: 200,
                          onUpdate: (val) => {
                            setCornerRadii((p) => ({ ...p, tr: val }))
                          },
                        })
                      }
                      className="text-muted-foreground hover:text-primary block text-[9px] font-bold cursor-ew-resize select-none px-1 rounded hover:bg-muted/70 transition-colors"
                      title="Hold Left Click & Drag to scrub Top-Right Corner Radius"
                    >
                      TR
                    </span>
                    <input
                      type="number"
                      value={cornerRadii.tr}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        setCornerRadii((p) => ({ ...p, tr: val }))
                      }}
                      className="w-full text-center bg-transparent focus:outline-hidden"
                    />
                  </div>
                  <div className="p-1 rounded border border-border/70 bg-background/50 text-center">
                    <span
                      onMouseDown={(e) =>
                        startScrubNumber(e, {
                          initialValue: cornerRadii.br,
                          axis: "x",
                          step: 1,
                          min: 0,
                          max: 200,
                          onUpdate: (val) => {
                            setCornerRadii((p) => ({ ...p, br: val }))
                          },
                        })
                      }
                      className="text-muted-foreground hover:text-primary block text-[9px] font-bold cursor-ew-resize select-none px-1 rounded hover:bg-muted/70 transition-colors"
                      title="Hold Left Click & Drag to scrub Bottom-Right Corner Radius"
                    >
                      BR
                    </span>
                    <input
                      type="number"
                      value={cornerRadii.br}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        setCornerRadii((p) => ({ ...p, br: val }))
                      }}
                      className="w-full text-center bg-transparent focus:outline-hidden"
                    />
                  </div>
                  <div className="p-1 rounded border border-border/70 bg-background/50 text-center">
                    <span
                      onMouseDown={(e) =>
                        startScrubNumber(e, {
                          initialValue: cornerRadii.bl,
                          axis: "x",
                          step: 1,
                          min: 0,
                          max: 200,
                          onUpdate: (val) => {
                            setCornerRadii((p) => ({ ...p, bl: val }))
                          },
                        })
                      }
                      className="text-muted-foreground hover:text-primary block text-[9px] font-bold cursor-ew-resize select-none px-1 rounded hover:bg-muted/70 transition-colors"
                      title="Hold Left Click & Drag to scrub Bottom-Left Corner Radius"
                    >
                      BL
                    </span>
                    <input
                      type="number"
                      value={cornerRadii.bl}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        setCornerRadii((p) => ({ ...p, bl: val }))
                      }}
                      className="w-full text-center bg-transparent focus:outline-hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Fill & Stroke */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Fill Color
                </Label>
                <span className="font-mono text-[11px] font-bold text-foreground">
                  {currentFill}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentFill.startsWith("#") ? currentFill : "#548235"}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-7.5 w-10 rounded border border-border/80 cursor-pointer bg-transparent"
                />
                <Input
                  value={currentFill}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-7.5 text-xs font-mono uppercase"
                />
              </div>
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {BRAND_PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => handleColorChange(c.hex)}
                    className="h-5.5 rounded border border-black/15 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Controls */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Stroke
                </Label>
                <div className="flex items-center px-1.5 h-6 rounded border border-border/70 bg-background/50 font-mono text-[11px]">
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={currentStrokeWidth}
                    onChange={(e) =>
                      onUpdateObject({ strokeWidth: Math.max(0, parseFloat(e.target.value) || 0) })
                    }
                    className="w-8 text-right bg-transparent focus:outline-hidden"
                  />
                  <span
                    onMouseDown={(e) =>
                      startScrubNumber(e, {
                        initialValue: currentStrokeWidth,
                        axis: "x",
                        step: 0.5,
                        min: 0,
                        max: 60,
                        precision: 1,
                        onUpdate: (sw) => onUpdateObject({ strokeWidth: sw }),
                      })
                    }
                    className="text-[10px] text-muted-foreground hover:text-primary ml-0.5 cursor-ew-resize select-none font-bold px-1 rounded hover:bg-muted"
                    title="Click & drag to scrub Stroke Width"
                  >
                    px
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentStroke.startsWith("#") ? currentStroke : "#000000"}
                  onChange={(e) => onUpdateObject({ stroke: e.target.value })}
                  className="h-7 w-8 rounded border border-border/80 cursor-pointer bg-transparent"
                />
                <Input
                  value={currentStroke}
                  onChange={(e) => onUpdateObject({ stroke: e.target.value })}
                  className="h-7 text-xs font-mono uppercase"
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── C. CIRCLE / ELLIPSE TOOL PROPERTIES ────────────────── */}
        {activeTool === "circle" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Circle Geometry
              </Label>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Donut Hole / Inner Ring:</span>
                <span
                  onMouseDown={(e) =>
                    startScrubNumber(e, {
                      initialValue: donutHole,
                      axis: "x",
                      step: 1,
                      min: 0,
                      max: 85,
                      onUpdate: (dh) => setDonutHole(dh),
                    })
                  }
                  className="font-mono text-xs font-bold text-foreground hover:text-primary cursor-ew-resize select-none px-1.5 py-0.5 rounded hover:bg-muted/70 transition-colors"
                  title="Click & drag to scrub Donut Hole"
                >
                  {donutHole}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="85"
                value={donutHole}
                onChange={(e) => setDonutHole(Number(e.target.value))}
                className="w-full accent-[#548235] cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                <div className="p-2 rounded-lg border border-border/70 bg-background/50">
                  <span
                    onMouseDown={(e) =>
                      startScrubNumber(e, {
                        initialValue: startAngle,
                        axis: "x",
                        step: 1,
                        min: 0,
                        max: 360,
                        onUpdate: (sa) => setStartAngle(sa),
                      })
                    }
                    className="text-muted-foreground hover:text-primary block cursor-ew-resize select-none font-bold"
                    title="Click & drag to scrub Start Angle"
                  >
                    Start Angle
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <input
                      type="number"
                      min="0"
                      max="360"
                      value={startAngle}
                      onChange={(e) => setStartAngle(Number(e.target.value))}
                      className="w-12 bg-transparent font-bold focus:outline-hidden"
                    />
                    <span className="text-muted-foreground">deg</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg border border-border/70 bg-background/50">
                  <span
                    onMouseDown={(e) =>
                      startScrubNumber(e, {
                        initialValue: endAngle,
                        axis: "x",
                        step: 1,
                        min: 0,
                        max: 360,
                        onUpdate: (ea) => setEndAngle(ea),
                      })
                    }
                    className="text-muted-foreground hover:text-primary block cursor-ew-resize select-none font-bold"
                    title="Click & drag to scrub End Angle"
                  >
                    End Angle
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <input
                      type="number"
                      min="0"
                      max="360"
                      value={endAngle}
                      onChange={(e) => setEndAngle(Number(e.target.value))}
                      className="w-12 bg-transparent font-bold focus:outline-hidden"
                    />
                    <span className="text-muted-foreground">deg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fill & Stroke */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Fill Color
                </Label>
                <span className="font-mono text-[11px] font-bold text-foreground">
                  {currentFill}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentFill.startsWith("#") ? currentFill : "#548235"}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-7.5 w-10 rounded border border-border/80 cursor-pointer bg-transparent"
                />
                <Input
                  value={currentFill}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-7.5 text-xs font-mono uppercase"
                />
              </div>
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {BRAND_PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => handleColorChange(c.hex)}
                    className="h-5.5 rounded border border-black/15 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── D. ANY SHAPE TOOL (STAR, TRIANGLE, POLYGON) ────────── */}
        {activeTool === "shape" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Shape Subtype
              </Label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "star", name: "Star" },
                  { id: "hexagon", name: "Hexagon" },
                  { id: "triangle", name: "Triangle" },
                  { id: "pentagon", name: "Pentagon" },
                  { id: "diamond", name: "Diamond" },
                  { id: "arrow", name: "Arrow" },
                  { id: "cross", name: "Cross" },
                  { id: "line", name: "Line" },
                  { id: "polygon", name: "Polygon" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setShapeSubtype(s.id as ShapeSubtype)
                      if (selectedObject) {
                        onUpdateObject({ subtype: s.id as ShapeSubtype, name: s.name })
                      }
                    }}
                    className={cn(
                      "px-2 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all capitalize text-center",
                      (selectedObject?.subtype || shapeSubtype) === s.id
                        ? "border-[#548235] bg-[#548235]/15 text-[#548235] font-bold"
                        : "border-border/70 hover:bg-muted/50 text-foreground"
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Points / Vertices:</span>
                <span
                  onMouseDown={(e) =>
                    startScrubNumber(e, {
                      initialValue: shapePoints,
                      axis: "x",
                      step: 1,
                      min: 3,
                      max: 32,
                      onUpdate: (pts) => setShapePoints(pts),
                    })
                  }
                  className="font-mono text-xs font-bold text-foreground hover:text-primary cursor-ew-resize select-none px-1.5 py-0.5 rounded hover:bg-muted/70 transition-colors"
                  title="Click & drag to scrub Points/Vertices"
                >
                  {shapePoints}
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="16"
                value={shapePoints}
                onChange={(e) => setShapePoints(Number(e.target.value))}
                className="w-full accent-[#548235] cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground">Star Inner Depth:</span>
                <span
                  onMouseDown={(e) =>
                    startScrubNumber(e, {
                      initialValue: innerRatio,
                      axis: "x",
                      step: 1,
                      min: 10,
                      max: 90,
                      onUpdate: (r) => setInnerRatio(r),
                    })
                  }
                  className="font-mono text-xs font-bold text-foreground hover:text-primary cursor-ew-resize select-none px-1.5 py-0.5 rounded hover:bg-muted/70 transition-colors"
                  title="Click & drag to scrub Star Inner Depth"
                >
                  {innerRatio}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={innerRatio}
                onChange={(e) => setInnerRatio(Number(e.target.value))}
                className="w-full accent-[#548235] cursor-pointer"
              />
            </div>

            {/* Fill & Stroke */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Fill Color
                </Label>
                <span className="font-mono text-[11px] font-bold text-foreground">
                  {currentFill}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentFill.startsWith("#") ? currentFill : "#548235"}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-7.5 w-10 rounded border border-border/80 cursor-pointer bg-transparent"
                />
                <Input
                  value={currentFill}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-7.5 text-xs font-mono uppercase"
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── E. FREE HAND PENCIL TOOL PROPERTIES ────────────────── */}
        {activeTool === "pencil" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Brush / Stroke Size
                </Label>
                <span
                  onMouseDown={(e) =>
                    startScrubNumber(e, {
                      initialValue: currentStrokeWidth,
                      axis: "x",
                      step: 0.5,
                      min: 1,
                      max: 40,
                      precision: 1,
                      onUpdate: (sw) => onUpdateObject({ strokeWidth: sw }),
                    })
                  }
                  className="font-mono text-xs font-bold text-foreground hover:text-primary cursor-ew-resize select-none px-1.5 py-0.5 rounded hover:bg-muted/70 transition-colors"
                  title="Hold Left Click & Drag to scrub Brush / Stroke Size"
                >
                  {currentStrokeWidth}px
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                value={currentStrokeWidth}
                onChange={(e) =>
                  onUpdateObject({ strokeWidth: Math.max(1, parseFloat(e.target.value) || 1) })
                }
                className="w-full accent-[#548235] cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Curve Smoothing
              </Label>
              <div className="grid grid-cols-3 gap-1.5">
                {["none", "medium", "high"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setPencilSmooth(lvl)}
                    className={cn(
                      "px-2 py-1.5 rounded-lg border text-xs capitalize cursor-pointer",
                      pencilSmooth === lvl
                        ? "border-[#548235] bg-[#548235]/15 text-[#548235] font-bold"
                        : "border-border/70 hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-muted-foreground">Pressure Simulation</span>
                <Checkbox
                  checked={pressureSim}
                  onCheckedChange={(c) => setPressureSim(Boolean(c))}
                />
              </div>
            </div>

            {/* Stroke Color */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Pencil Color
                </Label>
                <span className="font-mono text-[11px] font-bold text-foreground">
                  {currentStroke}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentStroke.startsWith("#") ? currentStroke : "#548235"}
                  onChange={(e) => onUpdateObject({ stroke: e.target.value })}
                  className="h-7.5 w-10 rounded border border-border/80 cursor-pointer bg-transparent"
                />
                <Input
                  value={currentStroke}
                  onChange={(e) => onUpdateObject({ stroke: e.target.value })}
                  className="h-7.5 text-xs font-mono uppercase"
                />
              </div>
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {BRAND_PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => onUpdateObject({ stroke: c.hex })}
                    className="h-5.5 rounded border border-black/15 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── F. ADVANCE PEN TOOL PROPERTIES ─────────────────────── */}
        {activeTool === "pen" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Bézier Path Mode
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button className="px-2.5 py-2 rounded-lg border border-[#548235] bg-[#548235]/15 text-[#548235] font-bold text-xs text-left cursor-pointer">
                  Smooth Curve
                  <span className="block text-[10px] text-muted-foreground font-normal mt-0.5">
                    Continuous tangents
                  </span>
                </button>
                <button className="px-2.5 py-2 rounded-lg border border-border/70 hover:bg-muted text-foreground text-xs text-left cursor-pointer">
                  Sharp Corner
                  <span className="block text-[10px] text-muted-foreground font-normal mt-0.5">
                    Independent cusps
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Stroke Width</span>
                <span
                  onMouseDown={(e) =>
                    startScrubNumber(e, {
                      initialValue: currentStrokeWidth,
                      axis: "x",
                      step: 0.5,
                      min: 1,
                      max: 30,
                      precision: 1,
                      onUpdate: (sw) => onUpdateObject({ strokeWidth: sw }),
                    })
                  }
                  className="font-mono text-xs font-bold text-foreground hover:text-primary cursor-ew-resize select-none px-1.5 py-0.5 rounded hover:bg-muted/70 transition-colors"
                  title="Hold Left Click & Drag to scrub Stroke Width"
                >
                  {currentStrokeWidth}px
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={currentStrokeWidth}
                onChange={(e) =>
                  onUpdateObject({ strokeWidth: parseFloat(e.target.value) || 1 })
                }
                className="w-full accent-[#548235] cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground">Snap to Grid</span>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Close Path on Finish</span>
                <Checkbox defaultChecked />
              </div>
            </div>
          </div>
        )}

        {/* ─── G. EDIT ANCHOR POINT TOOL ──────────────────────────── */}
        {activeTool === "anchor" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Anchor Point Operations
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onConvertToSmooth}
                  className="h-8 text-xs font-semibold hover:bg-emerald-500/15 hover:text-emerald-600 hover:border-emerald-500/40 cursor-pointer"
                  disabled={!selectedObject || selectedAnchorNodeIdx === null}
                  title="Convert selected node into a smooth Bézier curve point"
                >
                  Convert to Smooth
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onConvertToCorner}
                  className="h-8 text-xs font-semibold hover:bg-blue-500/15 hover:text-blue-600 hover:border-blue-500/40 cursor-pointer"
                  disabled={!selectedObject || selectedAnchorNodeIdx === null}
                  title="Convert selected node into a sharp corner point"
                >
                  Convert to Corner
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetractHandles}
                  className="h-8 text-xs font-semibold hover:bg-amber-500/15 hover:text-amber-600 hover:border-amber-500/40 cursor-pointer"
                  disabled={!selectedObject || selectedAnchorNodeIdx === null}
                  title="Retract tangent direction handles"
                >
                  Retract Handles
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDeleteAnchor}
                  className="h-8 text-xs font-semibold hover:bg-destructive/15 hover:text-destructive hover:border-destructive/40 cursor-pointer"
                  disabled={!selectedObject || selectedAnchorNodeIdx === null}
                  title="Delete the selected anchor point from the vector path"
                >
                  Delete Anchor
                </Button>
              </div>
            </div>

            {/* Live Node Inspector */}
            {selectedObject ? (() => {
              const { nodes } = extractPenNodesFromObject(selectedObject)
              const safeIdx =
                selectedAnchorNodeIdx !== null && selectedAnchorNodeIdx < nodes.length
                  ? selectedAnchorNodeIdx
                  : nodes.length > 0
                  ? 0
                  : null
              const activeNode = safeIdx !== null ? nodes[safeIdx] : null
              const isSmooth = Boolean(activeNode?.cpIn || activeNode?.cpOut)

              return (
                <div className="p-3 rounded-xl border border-border/70 bg-card/60 space-y-2.5 text-xs">
                  {/* Node Selector and Type Header */}
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground">
                        {activeNode ? `Anchor Node #${safeIdx! + 1}` : "No Node"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        (of {nodes.length})
                      </span>
                    </div>

                    {activeNode && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isSmooth) {
                            onConvertToCorner?.()
                          } else {
                            onConvertToSmooth?.()
                          }
                        }}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer",
                          isSmooth
                            ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border border-emerald-500/30"
                            : "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border border-blue-500/30"
                        )}
                        title="Click to toggle between smooth curve and sharp corner"
                      >
                        {isSmooth ? "Smooth Curve" : "Sharp Corner"}
                      </button>
                    )}
                  </div>

                  {/* Previous / Next Node Quick Navigation */}
                  {nodes.length > 1 && (
                    <div className="flex items-center justify-between text-[11px] gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const prevIdx =
                            safeIdx !== null ? (safeIdx - 1 + nodes.length) % nodes.length : 0
                          onSelectAnchorNode?.(prevIdx)
                        }}
                        className="h-6.5 text-[10px] px-2 flex-1 font-mono"
                      >
                        ← Prev Node
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const nextIdx =
                            safeIdx !== null ? (safeIdx + 1) % nodes.length : 0
                          onSelectAnchorNode?.(nextIdx)
                        }}
                        className="h-6.5 text-[10px] px-2 flex-1 font-mono"
                      >
                        Next Node →
                      </Button>
                    </div>
                  )}

                  {/* Editable Coordinate Inputs */}
                  {activeNode && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Coordinates (px)
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="flex items-center px-2 py-1 rounded bg-muted/50 border border-border/50 gap-1.5">
                          <span
                            onMouseDown={(e) =>
                              startScrubNumber(e, {
                                initialValue: activeNode.x,
                                axis: "x",
                                step: 1,
                                onUpdate: (val) => onUpdateAnchorNode?.(safeIdx!, val, activeNode.y),
                              })
                            }
                            className="text-muted-foreground hover:text-primary font-bold cursor-ew-resize select-none px-1 rounded hover:bg-muted/70 transition-colors"
                            title="Hold Left Click & Drag to scrub Node X coordinate"
                          >
                            X:
                          </span>
                          <input
                            type="number"
                            value={Math.round(activeNode.x)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0
                              onUpdateAnchorNode?.(safeIdx!, val, activeNode.y)
                            }}
                            className="w-full bg-transparent font-bold text-foreground focus:outline-hidden text-right"
                          />
                        </div>
                        <div className="flex items-center px-2 py-1 rounded bg-muted/50 border border-border/50 gap-1.5">
                          <span
                            onMouseDown={(e) =>
                              startScrubNumber(e, {
                                initialValue: activeNode.y,
                                axis: "y",
                                step: 1,
                                onUpdate: (val) => onUpdateAnchorNode?.(safeIdx!, activeNode.x, val),
                              })
                            }
                            className="text-muted-foreground hover:text-primary font-bold cursor-ns-resize select-none px-1 rounded hover:bg-muted/70 transition-colors"
                            title="Hold Left Click & Drag to scrub Node Y coordinate"
                          >
                            Y:
                          </span>
                          <input
                            type="number"
                            value={Math.round(activeNode.y)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0
                              onUpdateAnchorNode?.(safeIdx!, activeNode.x, val)
                            }}
                            className="w-full bg-transparent font-bold text-foreground focus:outline-hidden text-right"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tangent Handle Status */}
                  {activeNode && isSmooth && (
                    <div className="p-2 rounded-lg bg-background/50 border border-border/50 space-y-1 text-[10px] text-muted-foreground font-mono">
                      <div className="flex justify-between">
                        <span>Handle In:</span>
                        <span className="font-bold text-foreground">
                          {activeNode.cpIn ? `(${activeNode.cpIn.x}, ${activeNode.cpIn.y})` : "none"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Handle Out:</span>
                        <span className="font-bold text-foreground">
                          {activeNode.cpOut ? `(${activeNode.cpOut.x}, ${activeNode.cpOut.y})` : "none"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })() : (
              <div className="p-3 rounded-xl border border-dashed border-border/70 text-center text-xs text-muted-foreground">
                Select any vector shape or path to edit its anchor points.
              </div>
            )}

            <div className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-1.5">
              <span className="font-bold text-foreground text-xs">Anchor Point Tool Guide</span>
              <ul className="text-[11px] text-muted-foreground leading-relaxed space-y-1 list-disc pl-3">
                <li><b className="text-foreground">Click & Drag Node:</b> Repositions the anchor point in 2D space.</li>
                <li><b className="text-foreground">Drag Handle Tip:</b> Rotates & stretches Bézier curve tangent.</li>
                <li><b className="text-foreground">Double-Click Node:</b> Toggles between sharp corner & smooth curve.</li>
                <li><b className="text-foreground">Click Path Edge:</b> Inserts a new anchor point on the path.</li>
                <li><b className="text-foreground">Shift + Drag Handle:</b> Snaps angle to 45° increments.</li>
                <li><b className="text-foreground">Alt + Drag Handle:</b> Breaks symmetry into sharp cusp.</li>
                <li><b className="text-foreground">Delete / Backspace:</b> Removes selected anchor point.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ─── H. COREL DRAW COMPREHENSIVE TEXT DOCKER ─────────────── */}
        {activeTool === "text" && (
          <CorelDrawTextPanel
            selectedObject={selectedObject?.type === "text" ? selectedObject : null}
            onUpdateObject={(updates) => {
              if (selectedObject) {
                onUpdateObject(updates)
              } else {
                toast.info("Click anywhere on canvas with Text Tool to place text with these settings")
              }
            }}
            activeColor={activeColor}
            onChangeActiveColor={onChangeActiveColor}
          />
        )}

        {/* ─── I. CROP TOOL PROPERTIES ────────────────────────────── */}
        {activeTool === "crop" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Aspect Ratio Preset
              </Label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "free", name: "Freeform" },
                  { id: "1:1", name: "1:1 Square" },
                  { id: "16:9", name: "16:9 HD" },
                  { id: "4:3", name: "4:3 Standard" },
                  { id: "9:16", name: "9:16 Story" },
                  { id: "3:2", name: "3:2 Print" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCropPreset(c.id)}
                    className={cn(
                      "px-2 py-1.5 rounded-lg border text-xs cursor-pointer text-center",
                      cropPreset === c.id
                        ? "border-[#548235] bg-[#548235]/15 text-[#548235] font-bold"
                        : "border-border/70 hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Rule of Thirds Grid</span>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Lock Composition</span>
                <Checkbox />
              </div>
              <div className="pt-2 flex gap-2">
                <Button size="sm" className="flex-1 bg-[#548235] hover:bg-[#466e2c] text-white">
                  Apply Crop
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ─── J. TRANSPARENT TOOL PROPERTIES ─────────────────────── */}
        {activeTool === "transparency" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Master Opacity
                </Label>
                <span
                  onMouseDown={(e) =>
                    startScrubNumber(e, {
                      initialValue: Math.round(currentOpacity * 100),
                      axis: "x",
                      step: 1,
                      min: 0,
                      max: 100,
                      onUpdate: (op) => onUpdateObject({ opacity: op / 100 }),
                    })
                  }
                  className="font-mono text-xs font-bold text-foreground hover:text-primary cursor-ew-resize select-none px-1.5 py-0.5 rounded hover:bg-muted/70 transition-colors"
                  title="Click & drag to scrub Master Opacity"
                >
                  {Math.round(currentOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(currentOpacity * 100)}
                onChange={(e) =>
                  onUpdateObject({ opacity: Number(e.target.value) / 100 })
                }
                className="w-full accent-[#548235] cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Blend Mode
              </Label>
              <select
                value={currentBlendMode}
                onChange={(e) =>
                  onUpdateObject({ blendMode: e.target.value as BlendMode })
                }
                className="w-full h-8 px-2.5 rounded-lg border border-border/70 bg-background/50 text-xs font-medium focus:outline-hidden capitalize"
              >
                <option value="normal">Normal</option>
                <option value="multiply">Multiply (Darken)</option>
                <option value="screen">Screen (Lighten)</option>
                <option value="overlay">Overlay (Contrast)</option>
                <option value="darken">Darken</option>
                <option value="lighten">Lighten</option>
                <option value="soft-light">Soft Light</option>
                <option value="hard-light">Hard Light</option>
                <option value="difference">Difference (Invert)</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Isolate Blending Group</span>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Invert Alpha Mask</span>
                <Checkbox />
              </div>
            </div>
          </div>
        )}

        {/* ─── K. DROP SHADOW TOOL PROPERTIES ─────────────────────── */}
        {activeTool === "shadow" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Enable Shadow
              </Label>
              <Checkbox
                checked={currentShadowEnabled}
                onCheckedChange={(c) => onUpdateObject({ shadowEnabled: Boolean(c) })}
              />
            </div>

            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Blur Radius</span>
                  <span
                    onMouseDown={(e) =>
                      startScrubNumber(e, {
                        initialValue: currentShadowBlur,
                        axis: "x",
                        step: 1,
                        min: 0,
                        max: 80,
                        onUpdate: (b) => onUpdateObject({ shadowBlur: b }),
                      })
                    }
                    className="font-mono text-xs font-bold text-foreground hover:text-primary cursor-ew-resize select-none px-1.5 py-0.5 rounded hover:bg-muted/70 transition-colors"
                    title="Hold Left Click & Drag to scrub Shadow Blur"
                  >
                    {currentShadowBlur}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={currentShadowBlur}
                  onChange={(e) =>
                    onUpdateObject({ shadowBlur: Number(e.target.value) })
                  }
                  className="w-full accent-[#548235] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Vertical Offset (Y)</span>
                  <span
                    onMouseDown={(e) =>
                      startScrubNumber(e, {
                        initialValue: currentShadowOffsetY,
                        axis: "y",
                        step: 1,
                        min: -50,
                        max: 80,
                        onUpdate: (oy) => onUpdateObject({ shadowOffsetY: oy }),
                      })
                    }
                    className="font-mono text-xs font-bold text-foreground hover:text-primary cursor-ns-resize select-none px-1.5 py-0.5 rounded hover:bg-muted/70 transition-colors"
                    title="Hold Left Click & Drag to scrub Shadow Y Offset"
                  >
                    {currentShadowOffsetY}px
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="50"
                  value={currentShadowOffsetY}
                  onChange={(e) =>
                    onUpdateObject({ shadowOffsetY: Number(e.target.value) })
                  }
                  className="w-full accent-[#548235] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Horizontal Offset (X)</span>
                  <span
                    onMouseDown={(e) =>
                      startScrubNumber(e, {
                        initialValue: currentShadowOffsetX,
                        axis: "x",
                        step: 1,
                        min: -50,
                        max: 50,
                        onUpdate: (ox) => onUpdateObject({ shadowOffsetX: ox }),
                      })
                    }
                    className="font-mono text-xs font-bold text-foreground hover:text-primary cursor-ew-resize select-none px-1.5 py-0.5 rounded hover:bg-muted/70 transition-colors"
                    title="Hold Left Click & Drag to scrub Shadow X Offset"
                  >
                    {currentShadowOffsetX}px
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={currentShadowOffsetX}
                  onChange={(e) =>
                    onUpdateObject({ shadowOffsetX: Number(e.target.value) })
                  }
                  className="w-full accent-[#548235] cursor-pointer"
                />
              </div>

              {/* Shadow Presets */}
              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Quick Presets
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onUpdateObject({
                        shadowEnabled: true,
                        shadowBlur: 8,
                        shadowOffsetY: 4,
                        shadowOffsetX: 0,
                      })
                    }
                    className="h-7 text-[10px]"
                  >
                    Subtle Float
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onUpdateObject({
                        shadowEnabled: true,
                        shadowBlur: 24,
                        shadowOffsetY: 12,
                        shadowOffsetX: 0,
                      })
                    }
                    className="h-7 text-[10px]"
                  >
                    Elevated Card
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onUpdateObject({
                        shadowEnabled: true,
                        shadowBlur: 0,
                        shadowOffsetY: 6,
                        shadowOffsetX: 6,
                      })
                    }
                    className="h-7 text-[10px]"
                  >
                    Crisp Pop
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onUpdateObject({
                        shadowEnabled: true,
                        shadowBlur: 20,
                        shadowOffsetY: 0,
                        shadowOffsetX: 0,
                        shadowColor: "rgba(84, 130, 53, 0.4)",
                      })
                    }
                    className="h-7 text-[10px] text-[#548235]"
                  >
                    Transvolt Glow
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── L. ZOOM TOOL PROPERTIES ────────────────────────────── */}
        {activeTool === "zoom" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Viewport Zoom
                </Label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="5"
                    max="5000"
                    value={Math.round(documentSettings.zoom * 100)}
                    onChange={(e) => {
                      const val = Math.min(5000, Math.max(5, Number(e.target.value) || 5))
                      onUpdateDocumentSettings((prev) => ({
                        ...prev,
                        zoom: val / 100,
                      }))
                    }}
                    className="w-16 h-6 px-1.5 rounded border border-border/70 bg-background text-right font-mono text-xs font-bold text-[#548235] focus:outline-hidden"
                  />
                  <span
                    onMouseDown={(e) =>
                      startScrubNumber(e, {
                        initialValue: Math.round(documentSettings.zoom * 100),
                        axis: "x",
                        step: 5,
                        min: 5,
                        max: 5000,
                        onUpdate: (z) => onUpdateDocumentSettings((prev) => ({ ...prev, zoom: z / 100 })),
                      })
                    }
                    className="font-mono text-xs font-bold text-[#548235] hover:opacity-80 cursor-ew-resize select-none px-1 rounded hover:bg-muted/70 transition-colors"
                    title="Hold Left Click & Drag to scrub Zoom Scale"
                  >
                    %
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="5"
                max="5000"
                step="5"
                value={Math.round(documentSettings.zoom * 100)}
                onChange={(e) =>
                  onUpdateDocumentSettings((prev) => ({
                    ...prev,
                    zoom: Math.min(50, Math.max(0.05, Number(e.target.value) / 100)),
                  }))
                }
                className="w-full accent-[#548235] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
                <span>5% (Min)</span>
                <span>100% (Actual)</span>
                <span>5000% (Max)</span>
              </div>
            </div>

            {/* Quick Zoom Presets */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Preset Scales (5% – 5000%)
              </Label>
              <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px]">
                {[5, 25, 50, 100, 200, 500, 1000, 5000].map((pct) => (
                  <button
                    key={pct}
                    onClick={() =>
                      onUpdateDocumentSettings((prev) => ({
                        ...prev,
                        zoom: pct / 100,
                      }))
                    }
                    className={cn(
                      "h-7 rounded border font-semibold cursor-pointer transition-colors",
                      Math.round(documentSettings.zoom * 100) === pct
                        ? "border-[#548235] bg-[#548235]/15 text-[#548235] font-bold"
                        : "border-border/70 hover:bg-muted text-foreground"
                    )}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-1">
              <span className="font-bold text-foreground text-xs">Mouse Navigation Tips</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                • <strong>Mouse Wheel:</strong> Zooms in/out centered directly at your cursor location.
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                • <strong>Hold Scroll Wheel:</strong> Click & drag the middle button to pan freely.
              </p>
            </div>
          </div>
        )}

        {/* ─── M. RULER & GUIDES TOOL PROPERTIES ─────────────────── */}
        {activeTool === "ruler" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Measurement & Rulers
              </Label>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Show Horizontal & Vertical Rulers</span>
                <Checkbox
                  checked={documentSettings.showRulers}
                  onCheckedChange={(c) =>
                    onUpdateDocumentSettings((prev) => ({
                      ...prev,
                      showRulers: Boolean(c),
                    }))
                  }
                />
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-muted-foreground block mb-1">Measurement Unit</span>
                <select
                  value={documentSettings.unit}
                  onChange={(e) =>
                    onUpdateDocumentSettings((prev) => ({
                      ...prev,
                      unit: e.target.value as MeasurementUnit,
                    }))
                  }
                  className="w-full h-8 px-2.5 rounded-lg border border-border/70 bg-background/50 text-xs font-medium focus:outline-hidden"
                >
                  <option value="px">Pixels (px)</option>
                  <option value="mm">Milimeter (mm)</option>
                  <option value="pt">Points (pt)</option>
                  <option value="in">Inches (in)</option>
                  <option value="ft">Feet (ft)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Snapping & Alignment
              </Label>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Snap to Grid</span>
                  <Checkbox defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Snap to Guides</span>
                  <Checkbox defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Snap to Objects</span>
                  <Checkbox defaultChecked />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── N. COLOR PICKER / EYEDROPPER TOOL ───────────────────── */}
        {activeTool === "eyedropper" && (
          <div className="space-y-3">
            {/* White-Theme 2D HSV Color Picker matching Image 2 */}
            <HsvColorPicker
              value={activeColor}
              onChange={handleColorChange}
              theme="light"
            />

            {/* Fill Color Preset Swatches matching Image 1 */}
            <div className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Fill Color
                </span>
                <span className="font-mono text-xs font-bold text-neutral-800">
                  {activeColor.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => handleColorChange(hex)}
                    className={cn(
                      "h-7 rounded-lg border shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer",
                      hex.toUpperCase() === "#FFFFFF" || hex.toUpperCase() === "#F8FAFC"
                        ? "border-neutral-300"
                        : "border-black/15",
                      activeColor.toUpperCase() === hex.toUpperCase() && "ring-2 ring-primary ring-offset-1"
                    )}
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── O. BLENDING OPTIONS TOOL ───────────────────────────── */}
        {activeTool === "blend" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Layer Blend Mode
              </Label>
              <select
                value={currentBlendMode}
                onChange={(e) =>
                  onUpdateObject({ blendMode: e.target.value as BlendMode })
                }
                className="w-full h-8 px-2.5 rounded-lg border border-border/70 bg-background/50 text-xs font-medium focus:outline-hidden capitalize"
              >
                <option value="normal">Normal</option>
                <option value="multiply">Multiply (Darken)</option>
                <option value="screen">Screen (Lighten)</option>
                <option value="overlay">Overlay (Contrast)</option>
                <option value="darken">Darken</option>
                <option value="lighten">Lighten</option>
                <option value="soft-light">Soft Light</option>
                <option value="hard-light">Hard Light</option>
                <option value="difference">Difference</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Fill Opacity vs Stroke</span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {Math.round(currentOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(currentOpacity * 100)}
                onChange={(e) =>
                  onUpdateObject({ opacity: Number(e.target.value) / 100 })
                }
                className="w-full accent-[#548235] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ─── P. STROKE TOOL PROPERTIES ──────────────────────────── */}
        {activeTool === "stroke" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Stroke Weight
                </Label>
                <div className="flex items-center px-1.5 h-6 rounded border border-border/70 bg-background/50 font-mono text-[11px]">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={currentStrokeWidth}
                    onChange={(e) =>
                      onUpdateObject({ strokeWidth: Math.max(0, parseFloat(e.target.value) || 0) })
                    }
                    className="w-8 text-right bg-transparent focus:outline-hidden"
                  />
                  <span
                    onMouseDown={(e) =>
                      startScrubNumber(e, {
                        initialValue: currentStrokeWidth,
                        axis: "x",
                        step: 0.5,
                        min: 0,
                        max: 60,
                        precision: 1,
                        onUpdate: (sw) => onUpdateObject({ strokeWidth: sw }),
                      })
                    }
                    className="text-[10px] text-muted-foreground hover:text-primary ml-0.5 cursor-ew-resize select-none font-bold px-1 rounded hover:bg-muted transition-colors"
                    title="Hold Left Click & Drag to scrub Stroke Weight"
                  >
                    px
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={currentStrokeWidth}
                onChange={(e) =>
                  onUpdateObject({ strokeWidth: Math.max(0, parseFloat(e.target.value) || 0) })
                }
                className="w-full accent-[#548235] cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Stroke Color
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentStroke.startsWith("#") ? currentStroke : "#000000"}
                  onChange={(e) => onUpdateObject({ stroke: e.target.value })}
                  className="h-7 w-8 rounded border border-border/80 cursor-pointer bg-transparent"
                />
                <Input
                  value={currentStroke}
                  onChange={(e) => onUpdateObject({ stroke: e.target.value })}
                  className="h-7 text-xs font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {BRAND_PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => onUpdateObject({ stroke: c.hex })}
                    className="h-5.5 rounded border border-black/15 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Dash Style
              </Label>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                <button
                  onClick={() => onUpdateObject({ strokeDashArray: undefined })}
                  className="px-2 py-1.5 rounded-lg border border-border/70 hover:bg-muted text-center cursor-pointer"
                >
                  Solid ──
                </button>
                <button
                  onClick={() => onUpdateObject({ strokeDashArray: "8 6" })}
                  className="px-2 py-1.5 rounded-lg border border-border/70 hover:bg-muted text-center cursor-pointer"
                >
                  Dashed - -
                </button>
                <button
                  onClick={() => onUpdateObject({ strokeDashArray: "2 4" })}
                  className="px-2 py-1.5 rounded-lg border border-border/70 hover:bg-muted text-center cursor-pointer"
                >
                  Dotted • •
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Q. COLOR TOOL PROPERTIES ───────────────────────────── */}
        {activeTool === "color" && (
          <div className="space-y-3">
            {/* White-Theme 2D HSV Color Picker matching Image 2 */}
            <HsvColorPicker
              value={currentFill}
              onChange={handleColorChange}
              theme="light"
            />

            {/* Fill Color Preset Swatches matching Image 1 */}
            <div className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Fill Color
                </span>
                <span className="font-mono text-xs font-bold text-neutral-800">
                  {currentFill.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => handleColorChange(hex)}
                    className={cn(
                      "h-7 rounded-lg border shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer",
                      hex.toUpperCase() === "#FFFFFF" || hex.toUpperCase() === "#F8FAFC"
                        ? "border-neutral-300"
                        : "border-black/15",
                      currentFill.toUpperCase() === hex.toUpperCase() && "ring-2 ring-primary ring-offset-1"
                    )}
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </aside>
  )
}
