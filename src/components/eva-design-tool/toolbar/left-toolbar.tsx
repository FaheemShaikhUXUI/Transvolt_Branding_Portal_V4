"use client"

import * as React from "react"
import ReactDOM from "react-dom"
import {
  MousePointer,
  Square,
  Circle,
  Star,
  Hexagon,
  Minus,
  Shapes,
  Check,
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
  Download,
  Share2,
  Globe,
  Cpu,
  Triangle,
  Pentagon,
  Diamond,
  Plus,
  ArrowRight,
} from "lucide-react"
import { ToolType, ShapeSubtype } from "@/types/eva-editor"
import { cn } from "@/lib/utils"
import { DropShadowIcon } from "../icons/drop-shadow-icon"
import { TransparencyGobletIcon } from "../icons/transparency-icon"

/* ─── Primary shape buttons (always visible in toolbar) ─────────── */
interface PrimaryShapeTool {
  id: string
  label: string
  tool: ToolType
  subtype?: ShapeSubtype
  icon: any
  shortcut: string
}

const PRIMARY_SHAPE_TOOLS: PrimaryShapeTool[] = [
  { id: "square", label: "Square", tool: "rectangle", icon: Square, shortcut: "R" },
  { id: "circle", label: "Circle", tool: "circle", icon: Circle, shortcut: "O" },
  { id: "line", label: "Line", tool: "shape", subtype: "line", icon: Minus, shortcut: "L" },
]

/* ─── "All Shapes" flyout items ─────────────────────────────────── */
export interface ShapeToolOption {
  id: string
  label: string
  tool: ToolType
  subtype: ShapeSubtype
  icon: any
  shortcut: string
}

export const SHAPE_TOOL_OPTIONS: ShapeToolOption[] = [
  { id: "star", label: "Star", tool: "shape", subtype: "star", icon: Star, shortcut: "S" },
  { id: "hexagon", label: "Hexagon", tool: "shape", subtype: "hexagon", icon: Hexagon, shortcut: "H" },
  { id: "triangle", label: "Triangle", tool: "shape", subtype: "triangle", icon: Triangle, shortcut: "G" },
  { id: "pentagon", label: "Pentagon", tool: "shape", subtype: "pentagon", icon: Pentagon, shortcut: "J" },
  { id: "diamond", label: "Diamond", tool: "shape", subtype: "diamond", icon: Diamond, shortcut: "D" },
  { id: "arrow", label: "Arrow", tool: "shape", subtype: "arrow", icon: ArrowRight, shortcut: "W" },
  { id: "cross", label: "Cross / Plus", tool: "shape", subtype: "cross", icon: Plus, shortcut: "+" },
]

interface LeftToolbarProps {
  activeTool: ToolType
  onSelectTool: (tool: ToolType) => void
  activeColor: string
  onChangeColor: (color: string) => void
  showRuler: boolean
  onToggleRuler: () => void
  activeShapeSubtype?: ShapeSubtype
  onChangeShapeSubtype?: (subtype: ShapeSubtype) => void
  // Bottom action dialog triggers
  onOpenExport: () => void
  onOpenShareLink: () => void
  onOpenReferenceSites: () => void
  onOpenToolKnowledge: () => void
  // Ghost cursor highlight target hook
  highlightedToolId?: string | null
}

export function LeftToolbar({
  activeTool,
  onSelectTool,
  activeColor,
  onChangeColor,
  showRuler,
  onToggleRuler,
  activeShapeSubtype = "star",
  onChangeShapeSubtype,
  onOpenExport,
  onOpenShareLink,
  onOpenReferenceSites,
  onOpenToolKnowledge,
  highlightedToolId,
}: LeftToolbarProps) {
  // Popout state for "All Shapes" flyout
  const [isShapesMenuOpen, setIsShapesMenuOpen] = React.useState(false)
  const shapesMenuRef = React.useRef<HTMLDivElement>(null)
  const shapesButtonRef = React.useRef<HTMLButtonElement>(null)
  const [popoutPos, setPopoutPos] = React.useState({ top: 0, left: 0 })

  // Close popout on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        shapesMenuRef.current && !shapesMenuRef.current.contains(e.target as Node) &&
        shapesButtonRef.current && !shapesButtonRef.current.contains(e.target as Node)
      ) {
        setIsShapesMenuOpen(false)
      }
    }
    if (isShapesMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick)
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [isShapesMenuOpen])

  // Determine what's shown as the flyout face icon
  const activeAllShapesOpt =
    SHAPE_TOOL_OPTIONS.find(
      (opt) => activeTool === "shape" && activeShapeSubtype === opt.subtype
    ) || SHAPE_TOOL_OPTIONS[0]

  // Is any "All Shapes" item currently active?
  const isAllShapesActive =
    activeTool === "shape" &&
    SHAPE_TOOL_OPTIONS.some((opt) => opt.subtype === activeShapeSubtype)

  const otherTools: { id: ToolType; label: string; icon: any; shortcut?: string }[] = [
    { id: "pencil", label: "Free Hand Pencil Tool", icon: Pencil, shortcut: "N" },
    { id: "pen", label: "Advance Pen Tool", icon: PenTool, shortcut: "P" },
    { id: "anchor", label: "Edit Anchor Point Tool", icon: Network, shortcut: "A" },
    { id: "text", label: "Text Tool", icon: Type, shortcut: "T" },
    { id: "crop", label: "Crop Tool", icon: Crop, shortcut: "C" },
    { id: "transparency", label: "Transparent Tool", icon: TransparencyGobletIcon },
    { id: "shadow", label: "Drop Shadow Tool", icon: DropShadowIcon },
    { id: "eyedropper", label: "Color Picker", icon: Pipette, shortcut: "I" },
    { id: "blend", label: "Blending Options Tool", icon: Blend },
    { id: "stroke", label: "Stroke Tool", icon: Minus },
    { id: "color", label: "Color Tool", icon: Square },
  ]

  const handleToolClick = (toolId: ToolType) => {
    onSelectTool(toolId)
  }

  return (
    <aside
      id="eva-left-toolbar"
      className="w-11 bg-card/95 backdrop-blur-md border-r border-border/80 flex flex-col justify-between py-2 items-center select-none shrink-0 z-20 overflow-y-auto no-scrollbar"
    >
      {/* ─── Top Design Tools ──────────────────────────────────────── */}
      <div className="flex flex-col gap-1 items-center w-full px-1">
        {/* 1. Selection Tool */}
        <button
          id="tool-btn-select"
          onClick={() => onSelectTool("select")}
          className={cn(
            "relative group flex items-center justify-center h-7.5 w-7.5 rounded-lg transition-all duration-150 cursor-pointer",
            activeTool === "select"
              ? "text-[#007aff]"
              : "text-foreground/75 hover:bg-muted/50 hover:text-foreground",
            highlightedToolId === "select" && "ring-4 ring-cyan-400 bg-cyan-400/20 text-cyan-500 scale-110"
          )}
          title="Selection Tool (V)"
        >
          <MousePointer className="h-3.5 w-3.5 shrink-0" />
          <div className="absolute left-10 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg font-medium">
            Selection Tool <span className="opacity-60 ml-1">[V]</span>
          </div>
        </button>

        {/* ─── 2. Primary Shape Tools (Square, Circle, Line) ─────── */}
        {PRIMARY_SHAPE_TOOLS.map((t) => {
          const Icon = t.icon
          const isActive =
            (t.tool === "rectangle" && activeTool === "rectangle") ||
            (t.tool === "circle" && activeTool === "circle") ||
            (t.tool === "shape" && activeTool === "shape" && activeShapeSubtype === t.subtype)

          return (
            <button
              key={t.id}
              id={`tool-btn-${t.id}`}
              onClick={() => {
                onSelectTool(t.tool)
                if (t.subtype && onChangeShapeSubtype) {
                  onChangeShapeSubtype(t.subtype)
                }
              }}
              className={cn(
                "relative group flex items-center justify-center h-7.5 w-7.5 rounded-lg transition-all duration-200 ease-out cursor-pointer active:scale-90",
                isActive
                  ? "bg-[#007aff]/15 text-[#007aff] shadow-2xs font-semibold ring-1 ring-[#007aff]/30"
                  : "text-foreground/75 hover:bg-muted/50 hover:text-foreground",
                highlightedToolId === t.tool && "ring-4 ring-cyan-400 bg-cyan-400/20 text-cyan-500 scale-110"
              )}
              title={`${t.label} (${t.shortcut})`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <div className="absolute left-10 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg font-medium">
                {t.label} <span className="opacity-60 ml-1">[{t.shortcut}]</span>
              </div>
            </button>
          )
        })}

        {/* ─── 3. "All Shapes" Flyout ────────────────────────────── */}
        <div className="relative">
          <button
            ref={shapesButtonRef}
            id="tool-btn-all-shapes"
            onClick={() => {
              if (!isShapesMenuOpen && shapesButtonRef.current) {
                const rect = shapesButtonRef.current.getBoundingClientRect()
                setPopoutPos({ top: rect.top, left: rect.right + 8 })
              }
              setIsShapesMenuOpen((prev) => !prev)
              if (!isAllShapesActive) {
                onSelectTool(activeAllShapesOpt.tool)
                if (onChangeShapeSubtype) {
                  onChangeShapeSubtype(activeAllShapesOpt.subtype)
                }
              }
            }}
            className={cn(
              "relative group flex items-center justify-center h-7.5 w-7.5 rounded-lg transition-all duration-150 cursor-pointer",
              isAllShapesActive
                ? "bg-[#007aff]/15 text-[#007aff] shadow-2xs font-semibold ring-1 ring-[#007aff]/30"
                : "text-foreground/75 hover:bg-muted/50 hover:text-foreground",
              highlightedToolId === "shape" &&
                "ring-4 ring-cyan-400 bg-cyan-400/20 text-cyan-500 scale-110"
            )}
            title={`All Shapes: ${activeAllShapesOpt.label}`}
          >
            {/* Show face icon as the last-selected All Shapes item */}
            {React.createElement(activeAllShapesOpt.icon, { className: "h-3.5 w-3.5 shrink-0" })}

            {/* Small corner flyout triangle indicator (CorelDRAW / Adobe style) */}
            <svg
              className="absolute bottom-0.5 right-0.5 w-2 h-2 text-foreground/50 pointer-events-none"
              viewBox="0 0 6 6"
              fill="currentColor"
            >
              <polygon points="6,0 6,6 0,6" />
            </svg>

            {/* Hover Tooltip (when popout is closed) */}
            {!isShapesMenuOpen && (
              <div className="absolute left-10 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg font-medium">
                All Shapes <span className="opacity-60 ml-1">({activeAllShapesOpt.label})</span>
              </div>
            )}
          </button>

          {/* Portal-based Popout Menu */}
          {isShapesMenuOpen && typeof document !== "undefined" && ReactDOM.createPortal(
            <div
              ref={shapesMenuRef}
              style={{
                position: "fixed",
                top: popoutPos.top,
                left: popoutPos.left,
                zIndex: 99999,
              }}
              className="w-52 rounded-xl bg-card dark:bg-[#18181b] border border-border/80 shadow-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 select-none"
            >
              <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between border-b border-border/60 mb-1">
                <span className="flex items-center gap-1.5">
                  <Shapes className="h-3 w-3 text-[#007aff]" />
                  All Shapes
                </span>
                <span className="text-[9px] font-mono opacity-60">Flyout</span>
              </div>

              {SHAPE_TOOL_OPTIONS.map((opt) => {
                const OptIcon = opt.icon
                const isOptionSelected =
                  activeTool === "shape" && activeShapeSubtype === opt.subtype

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectTool(opt.tool)
                      if (onChangeShapeSubtype) {
                        onChangeShapeSubtype(opt.subtype)
                      }
                      setIsShapesMenuOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer group",
                      isOptionSelected
                        ? "bg-[#10b981]/15 text-[#10b981] font-bold border border-[#10b981]/30"
                        : "text-foreground/80 hover:text-foreground hover:bg-muted/70"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <OptIcon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isOptionSelected
                            ? "text-[#10b981]"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span>{opt.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <kbd className="text-[10px] font-mono px-1 rounded bg-muted text-muted-foreground border border-border/50">
                        {opt.shortcut}
                      </kbd>
                      {isOptionSelected && <Check className="h-3.5 w-3.5 text-[#007aff]" />}
                    </div>
                  </button>
                )
              })}
            </div>,
            document.body
          )}
        </div>

        {/* 3. Remaining Tools */}
        {otherTools.map((t) => {
          const Icon = t.icon
          const isActive = activeTool === t.id
          const isHighlighted = highlightedToolId === t.id

          // Color tool renders active color swatch
          if (t.id === "color") {
            return (
              <div
                key={t.id}
                id={`tool-btn-${t.id}`}
                onClick={() => onSelectTool("color")}
                className={cn(
                  "relative group flex items-center justify-center h-7.5 w-7.5 rounded-lg border transition-all cursor-pointer mt-0.5",
                  isActive
                    ? "border-[#007aff] ring-2 ring-[#007aff] scale-105"
                    : "border-border/80 hover:border-foreground/50",
                  isHighlighted && "ring-4 ring-cyan-400 animate-pulse"
                )}
                title="Color Tool: Fill Color Swatch"
              >
                <div
                  className="h-4 w-4 rounded shadow-2xs border border-black/20"
                  style={{ backgroundColor: activeColor }}
                />
              </div>
            )
          }

          return (
            <button
              key={t.id}
              id={`tool-btn-${t.id}`}
              onClick={() => handleToolClick(t.id)}
              className={cn(
                "relative group flex items-center justify-center h-7.5 w-7.5 rounded-lg transition-all duration-200 ease-out cursor-pointer active:scale-90",
                isActive
                  ? "bg-[#007aff]/15 text-[#007aff] shadow-2xs font-semibold ring-1 ring-[#007aff]/30"
                  : "text-foreground/75 hover:bg-muted/50 hover:text-foreground",
                isHighlighted && "ring-4 ring-cyan-400 bg-cyan-400/20 text-cyan-500 scale-110"
              )}
              title={`${t.label} ${t.shortcut ? `(${t.shortcut})` : ""}`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />

              {/* Tooltip on hover */}
              <div className="absolute left-10 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg font-medium">
                {t.label} {t.shortcut && <span className="opacity-60 ml-1">[{t.shortcut}]</span>}
              </div>
            </button>
          )
        })}
      </div>

      {/* ─── Bottom Actions Bar (Export, Share, Ref Sites, Knowledge) ── */}
      <div className="flex flex-col gap-1 items-center w-full px-1 pt-2 border-t border-border/60 mt-1">
        {/* Export: Pop-out Tab */}
        <button
          onClick={onOpenExport}
          className="group relative flex items-center justify-center h-7 w-7 rounded-lg text-foreground/75 hover:bg-muted/60 hover:text-foreground transition-all cursor-pointer"
          title="Export Artwork (JPG, PNG, SVG, CDR, AI, PDF)"
        >
          <Download className="h-3.5 w-3.5" />
          <div className="absolute left-10 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
            Export Artwork (JPG, PNG, SVG, CDR, AI)
          </div>
        </button>

        {/* File Share for 6 Hour Link */}
        <button
          onClick={onOpenShareLink}
          className="group relative flex items-center justify-center h-7 w-7 rounded-lg text-foreground/75 hover:bg-muted/60 hover:text-foreground transition-all cursor-pointer"
          title="File Share for 6 Hour Link"
        >
          <Share2 className="h-3.5 w-3.5" />
          <div className="absolute left-10 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
            File Share for 6 Hour Link
          </div>
        </button>

        {/* Connect Reference Sites for Research */}
        <button
          onClick={onOpenReferenceSites}
          className="group relative flex items-center justify-center h-7 w-7 rounded-lg text-foreground/75 hover:bg-muted/60 hover:text-foreground transition-all cursor-pointer"
          title="Connect Reference Sites for Research (Pinterest, Magnific, Victzity)"
        >
          <Globe className="h-3.5 w-3.5" />
          <div className="absolute left-10 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
            Connect Reference Sites (Pinterest, Magnific, Victzity)
          </div>
        </button>

        {/* Upload Tool Knowledge */}
        <button
          onClick={onOpenToolKnowledge}
          className="group relative flex items-center justify-center h-7 w-7 rounded-lg text-foreground/75 hover:bg-muted/60 hover:text-foreground transition-all cursor-pointer"
          title="Upload Tool Knowledge for Eva Bot (Corel, Figma, etc.)"
        >
          <Cpu className="h-3.5 w-3.5" />
          <div className="absolute left-10 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
            Upload Tool Knowledge (Corel, Figma, Photoshop)
          </div>
        </button>
      </div>
    </aside>
  )
}
