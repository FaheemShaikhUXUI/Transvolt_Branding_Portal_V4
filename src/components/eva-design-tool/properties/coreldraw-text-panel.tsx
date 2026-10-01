"use client"

import * as React from "react"
import { CanvasObject, ToolType } from "@/types/eva-editor"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Columns,
  Sparkles,
  Layers,
  Palette,
  SlidersHorizontal,
  Baseline,
  List,
  ListOrdered,
  Spline,
  CornerDownRight,
  Maximize2,
  FileText,
  Check,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { FontPicker } from "../ui/font-picker"
import { HsvColorPicker } from "../ui/hsv-color-picker"

export interface CorelDrawTextPanelProps {
  selectedObject: CanvasObject | null
  onUpdateObject: (updated: Partial<CanvasObject>) => void
  activeColor?: string
  onChangeActiveColor?: (color: string) => void
  onCreateTextObject?: () => void
}

const BRAND_PALETTE = [
  { name: "Pure Black", hex: "#000000" },
  { name: "Transvolt Green", hex: "#548235" },
  { name: "Corporate Blue", hex: "#4472c4" },
  { name: "Pure White", hex: "#ffffff" },
  { name: "Slate Dark", hex: "#1e293b" },
  { name: "Cool Off-White", hex: "#f8fafc" },
  { name: "Eco Lime", hex: "#84cc16" },
  { name: "Electric Cyan", hex: "#06b6d4" },
  { name: "Warning Amber", hex: "#f59e0b" },
  { name: "Danger Red", hex: "#ef4444" },
]

const FONT_FAMILIES = [
  { name: "Poppins", category: "Transvolt Brand", font: "Poppins, sans-serif" },
  { name: "Inter", category: "Modern Sans", font: "Inter, sans-serif" },
  { name: "Outfit", category: "Geometric Sans", font: "Outfit, sans-serif" },
  { name: "Montserrat", category: "Editorial", font: "Montserrat, sans-serif" },
  { name: "Roboto", category: "Clean Grotesk", font: "Roboto, sans-serif" },
  { name: "Open Sans", category: "Friendly Sans", font: "'Open Sans', sans-serif" },
  { name: "Lato", category: "Humanist Sans", font: "Lato, sans-serif" },
  { name: "Oswald", category: "Condensed Title", font: "Oswald, sans-serif" },
  { name: "Bebas Neue", category: "Bold Display", font: "'Bebas Neue', sans-serif" },
  { name: "Playfair Display", category: "Luxury Serif", font: "'Playfair Display', serif" },
  { name: "Merriweather", category: "Classic Serif", font: "Merriweather, serif" },
  { name: "Fira Code", category: "Monospace", font: "'Fira Code', monospace" },
  { name: "Great Vibes", category: "Cursive Script", font: "'Great Vibes', cursive" },
  { name: "Arial", category: "System Standard", font: "Arial, sans-serif" },
]

const FONT_WEIGHTS = [
  { label: "Thin (100)", value: "100" },
  { label: "Light (300)", value: "300" },
  { label: "Regular (400)", value: "normal" },
  { label: "Medium (500)", value: "medium" },
  { label: "SemiBold (600)", value: "600" },
  { label: "Bold (700)", value: "bold" },
  { label: "ExtraBold (800)", value: "800" },
  { label: "Black (900)", value: "900" },
]

const PT_PRESETS = [8, 10, 12, 14, 16, 18, 24, 28, 32, 36, 48, 64, 72]

export function CorelDrawTextPanel({
  selectedObject,
  onUpdateObject,
  activeColor = "#000000",
  onChangeActiveColor = () => {},
  onCreateTextObject,
}: CorelDrawTextPanelProps) {
  const [activeTab, setActiveTab] = React.useState<"character" | "paragraph" | "frame">("character")
  const [isFillPickerOpen, setIsFillPickerOpen] = React.useState(false)
  const [isStrokePickerOpen, setIsStrokePickerOpen] = React.useState(false)
  const fillPickerRef = React.useRef<HTMLDivElement>(null)
  const strokePickerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (fillPickerRef.current && !fillPickerRef.current.contains(e.target as Node)) {
        setIsFillPickerOpen(false)
      }
      if (strokePickerRef.current && !strokePickerRef.current.contains(e.target as Node)) {
        setIsStrokePickerOpen(false)
      }
    }
    if (isFillPickerOpen || isStrokePickerOpen) {
      document.addEventListener("mousedown", handleOutside)
    }
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [isFillPickerOpen, isStrokePickerOpen])

  // Fallback values when no text object is selected
  const textContent = selectedObject?.text ?? "Transvolt Mobility"
  const textType = selectedObject?.textType ?? "artistic"
  const fontFamily = selectedObject?.fontFamily ?? "Poppins"
  const fontSize = selectedObject?.fontSize ?? 28
  const fontWeight = selectedObject?.fontWeight ?? "bold"
  const fontStyle = selectedObject?.fontStyle ?? "normal"
  const textDecoration = selectedObject?.textDecoration ?? "none"
  const textTransform = selectedObject?.textTransform ?? "none"
  const fontVariant = selectedObject?.fontVariant ?? "normal"
  const verticalScript = selectedObject?.verticalScript ?? "normal"
  const textAlign = selectedObject?.textAlign ?? "left"
  const verticalAlign = selectedObject?.verticalAlign ?? "top"
  const letterSpacing = selectedObject?.letterSpacing ?? 0
  const wordSpacing = selectedObject?.wordSpacing ?? 0
  const lineHeight = selectedObject?.lineHeight ?? 1.25
  const firstLineIndent = selectedObject?.firstLineIndent ?? 0
  const paragraphSpacingBefore = selectedObject?.paragraphSpacingBefore ?? 0
  const paragraphSpacingAfter = selectedObject?.paragraphSpacingAfter ?? 0
  const dropCap = Boolean(selectedObject?.dropCap)
  const dropCapLines = selectedObject?.dropCapLines ?? 2
  const listType = selectedObject?.listType ?? "none"
  const textColumns = selectedObject?.textColumns ?? 1
  const columnGutter = selectedObject?.columnGutter ?? 16
  const frameBackground = selectedObject?.frameBackground ?? "transparent"
  const frameBorderColor = selectedObject?.frameBorderColor ?? "transparent"
  const frameBorderWidth = selectedObject?.frameBorderWidth ?? 0
  const framePadding = selectedObject?.framePadding ?? 0
  const strokeBehindFill = Boolean(selectedObject?.strokeBehindFill)
  const horizontalScale = selectedObject?.horizontalScale ?? 100
  const verticalScale = selectedObject?.verticalScale ?? 100
  const baselineShift = selectedObject?.baselineShift ?? 0
  const textOrientation = selectedObject?.textOrientation ?? "horizontal"

  const currentFill = selectedObject?.fill ?? activeColor
  const currentStroke = selectedObject?.stroke ?? "none"
  const currentStrokeWidth = selectedObject?.strokeWidth ?? 0
  const currentShadowEnabled = Boolean(selectedObject?.shadowEnabled)
  const currentShadowBlur = selectedObject?.shadowBlur ?? 8
  const currentShadowOffsetX = selectedObject?.shadowOffsetX ?? 2
  const currentShadowOffsetY = selectedObject?.shadowOffsetY ?? 3
  const currentShadowColor = selectedObject?.shadowColor ?? "rgba(0,0,0,0.3)"

  // Quick helper to convert text to curves (CorelDRAW Ctrl+Q)
  const handleConvertToCurves = () => {
    if (!selectedObject) {
      toast.info("Please select a text object to convert to curves")
      return
    }
    // Convert text object to a path with vector anchor nodes
    const w = selectedObject.width || 200
    const h = selectedObject.height || 40
    // Generate smooth vector outline representation
    const sampleNodes = [
      { x: selectedObject.x, y: selectedObject.y },
      { x: selectedObject.x + w, y: selectedObject.y },
      { x: selectedObject.x + w, y: selectedObject.y + h },
      { x: selectedObject.x, y: selectedObject.y + h },
    ]
    onUpdateObject({
      type: "path",
      name: `${selectedObject.text || "Text"} (Curves)`,
      penNodes: sampleNodes,
      pathData: `M ${selectedObject.x} ${selectedObject.y} L ${selectedObject.x + w} ${selectedObject.y} L ${selectedObject.x + w} ${selectedObject.y + h} L ${selectedObject.x} ${selectedObject.y + h} Z`,
    })
    toast.success("Converted Text to Vector Curves (Ctrl + Q)")
  }

  // Toggle Artistic vs Paragraph Text (CorelDRAW Ctrl+F8)
  const handleToggleTextType = () => {
    const nextType = textType === "artistic" ? "paragraph" : "artistic"
    onUpdateObject({
      textType: nextType,
      width: nextType === "paragraph" ? Math.max(selectedObject?.width || 0, 320) : selectedObject?.width,
      height: nextType === "paragraph" ? Math.max(selectedObject?.height || 0, 160) : selectedObject?.height,
    })
    toast.success(
      nextType === "paragraph"
        ? "Converted to Paragraph Text Frame (Ctrl+F8)"
        : "Converted to Artistic Text (Ctrl+F8)"
    )
  }

  // Universal drag-to-scrub for text properties (hold left key & drag to adjust)
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
    <div className="space-y-4">
      {/* ─── COREL DRAW DOCKER HEADER ─────────────────────────────── */}
      <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/15 text-primary border border-primary/30">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-foreground text-xs">
                  CorelDRAW Text Docker
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/20 text-primary font-bold">
                  {textType === "paragraph" ? "Paragraph Frame" : "Artistic"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Comprehensive typography & frame properties
              </p>
            </div>
          </div>
        </div>

        {/* Quick CorelDRAW Mode Bar */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-primary/20">
          <Button
            size="sm"
            variant={textType === "artistic" ? "default" : "outline"}
            onClick={() => onUpdateObject({ textType: "artistic" })}
            className="flex-1 h-7 text-[11px] font-semibold gap-1"
            title="Artistic Text: Scalable headlines and logos"
          >
            <Type className="w-3.5 h-3.5" />
            Artistic
          </Button>
          <Button
            size="sm"
            variant={textType === "paragraph" ? "default" : "outline"}
            onClick={() =>
              onUpdateObject({
                textType: "paragraph",
                width: Math.max(selectedObject?.width || 0, 320),
                height: Math.max(selectedObject?.height || 0, 160),
              })
            }
            className="flex-1 h-7 text-[11px] font-semibold gap-1"
            title="Paragraph Text: Multi-line text frames with wrapping & margins"
          >
            <FileText className="w-3.5 h-3.5" />
            Paragraph
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleConvertToCurves}
            className="h-7 px-2 text-[10px] font-mono text-muted-foreground hover:text-foreground"
            title="Convert Text to Curves (CorelDRAW Ctrl+Q)"
          >
            Ctrl+Q
          </Button>
        </div>
      </div>

      {/* ─── LIVE TEXT CONTENT EDITOR ─────────────────────────────── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Live Text Content
          </Label>
          <span className="text-[10px] font-mono text-muted-foreground">
            {textContent.length} chars
          </span>
        </div>
        <textarea
          value={textContent}
          onChange={(e) => onUpdateObject({ text: e.target.value })}
          rows={textType === "paragraph" ? 4 : 2}
          className="w-full p-2.5 rounded-lg border border-border/80 bg-background text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-primary leading-relaxed resize-y"
          placeholder="Type or paste your text here..."
        />
      </div>

      {/* ─── COREL DRAW DOCKER TABS (Character / Paragraph / Frame) ── */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-muted/40 rounded-lg border border-border/70">
        <button
          type="button"
          onClick={() => setActiveTab("character")}
          className={cn(
            "py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1",
            activeTab === "character"
              ? "bg-background text-foreground shadow-xs border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Type className="w-3 h-3" />
          Character
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("paragraph")}
          className={cn(
            "py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1",
            activeTab === "paragraph"
              ? "bg-background text-foreground shadow-xs border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <AlignLeft className="w-3 h-3" />
          Paragraph
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("frame")}
          className={cn(
            "py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1",
            activeTab === "frame"
              ? "bg-background text-foreground shadow-xs border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Columns className="w-3 h-3" />
          Frame & Path
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ─── TAB 1: CHARACTER FORMATTING (CorelDRAW Character Tab) ── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab === "character" && (
        <div className="space-y-4">
          {/* 1. Font Family & Weight */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Font Family (Typeface)
            </Label>
            <FontPicker
              value={fontFamily}
              onChange={(font) => onUpdateObject({ fontFamily: font })}
            />

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-medium">Font Weight</span>
                <select
                  value={fontWeight}
                  onChange={(e) => onUpdateObject({ fontWeight: e.target.value })}
                  className="w-full h-7.5 px-2 rounded-lg border border-border/70 bg-background text-xs focus:outline-hidden font-medium"
                >
                  {FONT_WEIGHTS.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <span
                  onMouseDown={(e) =>
                    startScrubNumber(e, {
                      initialValue: fontSize,
                      axis: "x",
                      step: 1,
                      min: 6,
                      max: 288,
                      onUpdate: (val) => onUpdateObject({ fontSize: val }),
                    })
                  }
                  className="text-[10px] text-muted-foreground hover:text-primary font-medium cursor-ew-resize select-none transition-colors"
                  title="Hold Left Click & Drag to scrub Font Size"
                >
                  Font Size (pt)
                </span>
                <div className="flex items-center px-2 h-7.5 rounded-lg border border-border/70 bg-background font-mono">
                  <input
                    type="number"
                    min="6"
                    max="288"
                    value={Math.round(fontSize)}
                    onChange={(e) =>
                      onUpdateObject({ fontSize: Math.max(6, parseFloat(e.target.value) || 12) })
                    }
                    className="w-full text-right bg-transparent focus:outline-hidden font-bold"
                  />
                  <span
                    onMouseDown={(e) =>
                      startScrubNumber(e, {
                        initialValue: fontSize,
                        axis: "x",
                        step: 1,
                        min: 6,
                        max: 288,
                        onUpdate: (val) => onUpdateObject({ fontSize: val }),
                      })
                    }
                    className="text-[10px] text-muted-foreground hover:text-primary ml-1 cursor-ew-resize select-none font-bold"
                    title="Hold Left Click & Drag to scrub Font Size"
                  >
                    pt
                  </span>
                </div>
              </div>
            </div>

            {/* Point Size Quick Presets */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 overlay-scrollbar">
              {PT_PRESETS.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => onUpdateObject({ fontSize: pt })}
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 cursor-pointer border transition-colors",
                    Math.round(fontSize) === pt
                      ? "bg-primary text-primary-foreground border-primary font-bold"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/60"
                  )}
                >
                  {pt}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Character Style Modifiers (Bold, Italic, Underline, Strikethrough, Overline) */}
          <div className="space-y-1.5 pt-2 border-t border-border/60">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Character Style Modifiers
            </Label>
            <div className="grid grid-cols-5 gap-1 bg-background p-1 rounded-lg border border-border/70">
              {/* Bold */}
              <button
                type="button"
                onClick={() =>
                  onUpdateObject({
                    fontWeight:
                      fontWeight === "bold" || fontWeight === "700" || fontWeight === "800"
                        ? "normal"
                        : "bold",
                  })
                }
                className={cn(
                  "flex items-center justify-center h-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors",
                  (fontWeight === "bold" || fontWeight === "700" || fontWeight === "800") &&
                    "bg-primary/15 text-primary font-extrabold"
                )}
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              {/* Italic */}
              <button
                type="button"
                onClick={() =>
                  onUpdateObject({
                    fontStyle: fontStyle === "italic" ? "normal" : "italic",
                  })
                }
                className={cn(
                  "flex items-center justify-center h-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors",
                  fontStyle === "italic" && "bg-primary/15 text-primary font-extrabold"
                )}
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              {/* Underline */}
              <button
                type="button"
                onClick={() =>
                  onUpdateObject({
                    textDecoration:
                      textDecoration === "underline"
                        ? "none"
                        : textDecoration.includes("line-through")
                        ? "underline line-through"
                        : "underline",
                  })
                }
                className={cn(
                  "flex items-center justify-center h-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors",
                  textDecoration.includes("underline") && "bg-primary/15 text-primary font-extrabold"
                )}
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>

              {/* Strikethrough */}
              <button
                type="button"
                onClick={() =>
                  onUpdateObject({
                    textDecoration:
                      textDecoration === "line-through"
                        ? "none"
                        : textDecoration.includes("underline")
                        ? "underline line-through"
                        : "line-through",
                  })
                }
                className={cn(
                  "flex items-center justify-center h-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors",
                  textDecoration.includes("line-through") &&
                    "bg-primary/15 text-primary font-extrabold"
                )}
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>

              {/* Overline */}
              <button
                type="button"
                onClick={() =>
                  onUpdateObject({
                    textDecoration: textDecoration === "overline" ? "none" : "overline",
                  })
                }
                className={cn(
                  "flex items-center justify-center h-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors font-mono text-[11px]",
                  textDecoration === "overline" && "bg-primary/15 text-primary font-extrabold"
                )}
                title="Overline"
              >
                O̅
              </button>
            </div>
          </div>

          {/* 3. CorelDRAW Capitalization & Position (Superscript/Subscript) */}
          <div className="space-y-1.5 pt-2 border-t border-border/60">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Capitalization & Script
            </Label>
            <div className="grid grid-cols-5 gap-1 bg-background p-1 rounded-lg border border-border/70 text-xs">
              {/* As-is */}
              <button
                type="button"
                onClick={() => onUpdateObject({ textTransform: "none", fontVariant: "normal" })}
                className={cn(
                  "py-1 rounded text-[10px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer",
                  textTransform === "none" && fontVariant === "normal" && "bg-primary/15 text-primary font-bold"
                )}
                title="Normal Case"
              >
                Normal
              </button>
              {/* UPPERCASE */}
              <button
                type="button"
                onClick={() => onUpdateObject({ textTransform: "uppercase", fontVariant: "normal" })}
                className={cn(
                  "py-1 rounded text-[10px] font-bold hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer",
                  textTransform === "uppercase" && "bg-primary/15 text-primary font-bold"
                )}
                title="UPPERCASE (ALL CAPS)"
              >
                AA
              </button>
              {/* lowercase */}
              <button
                type="button"
                onClick={() => onUpdateObject({ textTransform: "lowercase", fontVariant: "normal" })}
                className={cn(
                  "py-1 rounded text-[10px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer",
                  textTransform === "lowercase" && "bg-primary/15 text-primary font-bold"
                )}
                title="lowercase"
              >
                aa
              </button>
              {/* Title Case */}
              <button
                type="button"
                onClick={() => onUpdateObject({ textTransform: "capitalize", fontVariant: "normal" })}
                className={cn(
                  "py-1 rounded text-[10px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer",
                  textTransform === "capitalize" && "bg-primary/15 text-primary font-bold"
                )}
                title="Title Case"
              >
                Aa
              </button>
              {/* Small Caps */}
              <button
                type="button"
                onClick={() => onUpdateObject({ textTransform: "none", fontVariant: fontVariant === "small-caps" ? "normal" : "small-caps" })}
                className={cn(
                  "py-1 rounded text-[10px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer font-serif",
                  fontVariant === "small-caps" && "bg-primary/15 text-primary font-bold"
                )}
                title="Small Caps (Aᴀ)"
              >
                Aᴀ
              </button>
            </div>

            {/* Superscript / Subscript Position Buttons */}
            <div className="grid grid-cols-3 gap-1 pt-1 bg-background p-1 rounded-lg border border-border/70 text-xs">
              <button
                type="button"
                onClick={() => onUpdateObject({ verticalScript: "normal" })}
                className={cn(
                  "py-1 rounded text-[10px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer",
                  verticalScript === "normal" && "bg-primary/15 text-primary font-bold"
                )}
                title="Standard Text Position"
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateObject({
                    verticalScript: verticalScript === "superscript" ? "normal" : "superscript",
                  })
                }
                className={cn(
                  "py-1 rounded text-[10px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer",
                  verticalScript === "superscript" && "bg-primary/15 text-primary font-bold"
                )}
                title="Superscript (e.g. m², X³)"
              >
                X² Super
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateObject({
                    verticalScript: verticalScript === "subscript" ? "normal" : "subscript",
                  })
                }
                className={cn(
                  "py-1 rounded text-[10px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer",
                  verticalScript === "subscript" && "bg-primary/15 text-primary font-bold"
                )}
                title="Subscript (e.g. H₂O, CO₂)"
              >
                X₂ Sub
              </button>
            </div>
          </div>

          {/* 4. Character Spacing, Kerning & Metrics */}
          <div className="space-y-2.5 pt-2 border-t border-border/60">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Kerning, Tracking & Spacing Metrics
            </Label>

            {/* Letter Spacing / Range Kerning */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Character Tracking (Kerning):</span>
                <span
                  onMouseDown={(e) =>
                    startScrubNumber(e, {
                      initialValue: letterSpacing,
                      axis: "x",
                      step: 0.5,
                      min: -5,
                      max: 30,
                      precision: 1,
                      onUpdate: (val) => onUpdateObject({ letterSpacing: val }),
                    })
                  }
                  className="font-mono font-bold text-foreground hover:text-primary cursor-ew-resize select-none px-1.5 py-0.5 rounded hover:bg-muted/70 transition-colors"
                  title="Hold Left Click & Drag to scrub Character Tracking"
                >
                  {letterSpacing} px
                </span>
              </div>
              <input
                type="range"
                min="-5"
                max="30"
                step="0.5"
                value={letterSpacing}
                onChange={(e) => onUpdateObject({ letterSpacing: parseFloat(e.target.value) || 0 })}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Word Spacing */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Word Spacing:</span>
                <span
                  onMouseDown={(e) =>
                    startScrubNumber(e, {
                      initialValue: wordSpacing,
                      axis: "x",
                      step: 1,
                      min: -5,
                      max: 40,
                      onUpdate: (val) => onUpdateObject({ wordSpacing: val }),
                    })
                  }
                  className="font-mono font-bold text-foreground hover:text-primary cursor-ew-resize select-none px-1.5 py-0.5 rounded hover:bg-muted/70 transition-colors"
                  title="Hold Left Click & Drag to scrub Word Spacing"
                >
                  {wordSpacing} px
                </span>
              </div>
              <input
                type="range"
                min="-5"
                max="40"
                step="1"
                value={wordSpacing}
                onChange={(e) => onUpdateObject({ wordSpacing: parseFloat(e.target.value) || 0 })}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Horizontal & Vertical Character Scaling */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
              <div className="p-2 rounded-lg border border-border/70 bg-background space-y-1">
                <span
                  onMouseDown={(e) =>
                    startScrubNumber(e, {
                      initialValue: horizontalScale,
                      axis: "x",
                      step: 1,
                      min: 50,
                      max: 200,
                      onUpdate: (val) => onUpdateObject({ horizontalScale: val }),
                    })
                  }
                  className="text-muted-foreground hover:text-primary block cursor-ew-resize select-none font-bold"
                  title="Hold Left Click & Drag to scrub Horizontal Scale"
                >
                  Horizontal Scale
                </span>
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    min="50"
                    max="200"
                    value={horizontalScale}
                    onChange={(e) =>
                      onUpdateObject({ horizontalScale: parseFloat(e.target.value) || 100 })
                    }
                    className="w-12 bg-transparent font-bold focus:outline-hidden text-right"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>

              <div className="p-2 rounded-lg border border-border/70 bg-background space-y-1">
                <span
                  onMouseDown={(e) =>
                    startScrubNumber(e, {
                      initialValue: verticalScale,
                      axis: "y",
                      step: 1,
                      min: 50,
                      max: 200,
                      onUpdate: (val) => onUpdateObject({ verticalScale: val }),
                    })
                  }
                  className="text-muted-foreground hover:text-primary block cursor-ns-resize select-none font-bold"
                  title="Hold Left Click & Drag to scrub Vertical Scale"
                >
                  Vertical Scale
                </span>
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    min="50"
                    max="200"
                    value={verticalScale}
                    onChange={(e) =>
                      onUpdateObject({ verticalScale: parseFloat(e.target.value) || 100 })
                    }
                    className="w-12 bg-transparent font-bold focus:outline-hidden text-right"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            {/* Baseline Shift */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Baseline Shift:</span>
                <span className="font-mono font-bold text-foreground">{baselineShift} px</span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                step="1"
                value={baselineShift}
                onChange={(e) => onUpdateObject({ baselineShift: parseFloat(e.target.value) || 0 })}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </div>

          {/* 5. Fill, Outline Stroke (CorelDRAW Outline Pen) */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Text Fill Color
              </Label>
              <span className="font-mono text-[11px] font-bold text-foreground">
                {currentFill.toUpperCase()}
              </span>
            </div>

            {/* Fill Color Trigger & Popover (Figma / Photoshop style) */}
            <div className="relative" ref={fillPickerRef}>
              <button
                type="button"
                onClick={() => setIsFillPickerOpen((prev) => !prev)}
                className={cn(
                  "w-full h-9 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all bg-background cursor-pointer",
                  isFillPickerOpen
                    ? "border-primary ring-1 ring-primary/40"
                    : "border-border/70 hover:border-border"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-5 h-5 rounded-md border border-black/20 shadow-2xs shrink-0"
                    style={{ backgroundColor: currentFill }}
                  />
                  <span className="font-mono font-bold text-foreground">
                    {currentFill.toUpperCase()}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-sans">
                  Choose Color
                  <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isFillPickerOpen && "transform rotate-180 text-primary")} />
                </span>
              </button>

              {isFillPickerOpen && (
                <div className="absolute top-full mt-1.5 left-0 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                  <HsvColorPicker
                    value={currentFill}
                    onChange={(hex) => onUpdateObject({ fill: hex })}
                  />
                </div>
              )}
            </div>

            {/* Quick Brand Swatches */}
            <div className="grid grid-cols-5 gap-1.5 pt-0.5">
              {BRAND_PALETTE.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => onUpdateObject({ fill: c.hex })}
                  className="h-5.5 rounded border border-black/15 shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>

            {/* Outline Stroke Controls with Enable/Disable Toggle */}
            <div className="p-3 rounded-xl border border-border/80 bg-background/60 space-y-2.5 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Baseline className="w-3.5 h-3.5 text-primary" />
                  Text Stroke (Outline)
                </span>
                {/* Enable / Disable Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={currentStroke !== "none" && (currentStrokeWidth || 0) > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onUpdateObject({
                          stroke: currentStroke === "none" ? "#000000" : currentStroke,
                          strokeWidth: currentStrokeWidth > 0 ? currentStrokeWidth : 2,
                        })
                      } else {
                        onUpdateObject({
                          stroke: "none",
                          strokeWidth: 0,
                        })
                        setIsStrokePickerOpen(false)
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* If Stroke is Disabled */}
              {!(currentStroke !== "none" && (currentStrokeWidth || 0) > 0) ? (
                <div className="py-2.5 text-center text-[11px] text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border/60">
                  Stroke disabled. Turn on toggle to configure outline.
                </div>
              ) : (
                /* If Stroke is Enabled: Show Full Properties of Stroke */
                <div className="space-y-2.5 pt-1 border-t border-border/50 animate-in fade-in-50 duration-150">
                  {/* Stroke Color with HSV Color Picker Popover */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-semibold">Stroke Color</span>
                    <div className="relative" ref={strokePickerRef}>
                      <button
                        type="button"
                        onClick={() => setIsStrokePickerOpen((prev) => !prev)}
                        className={cn(
                          "w-full h-8 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all bg-background cursor-pointer",
                          isStrokePickerOpen
                            ? "border-primary ring-1 ring-primary/40"
                            : "border-border/70 hover:border-border"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border border-black/20 shrink-0"
                            style={{ backgroundColor: currentStroke === "none" ? "#000000" : currentStroke }}
                          />
                          <span className="font-mono text-[11px] font-bold text-foreground">
                            {(currentStroke === "none" ? "#000000" : currentStroke).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-sans">
                          Pick Color
                          <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isStrokePickerOpen && "transform rotate-180 text-primary")} />
                        </span>
                      </button>

                      {isStrokePickerOpen && (
                        <div className="absolute top-full mt-1.5 left-0 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                          <HsvColorPicker
                            value={currentStroke === "none" ? "#000000" : currentStroke}
                            onChange={(hex) => onUpdateObject({ stroke: hex })}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stroke Width Slider & Input */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground font-medium">Stroke Width (Weight):</span>
                      <span className="font-mono font-bold text-foreground">{currentStrokeWidth} px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.5"
                        max="24"
                        step="0.5"
                        value={currentStrokeWidth || 1}
                        onChange={(e) => onUpdateObject({ strokeWidth: parseFloat(e.target.value) || 1 })}
                        className="w-full accent-primary cursor-pointer"
                      />
                      <input
                        type="number"
                        min="0.5"
                        max="64"
                        step="0.5"
                        value={currentStrokeWidth || 1}
                        onChange={(e) => onUpdateObject({ strokeWidth: Math.max(0.5, parseFloat(e.target.value) || 1) })}
                        className="w-12 h-6 text-center text-xs font-mono font-bold rounded border border-border/70 bg-background"
                      />
                    </div>
                  </div>

                  {/* CorelDRAW Signature: Outline Behind Fill */}
                  <label className="flex items-center justify-between pt-1 cursor-pointer select-none">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium text-foreground">
                        Behind Fill (CorelDRAW)
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        Keeps letterforms crisp under stroke
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={strokeBehindFill}
                      onChange={(e) => onUpdateObject({ strokeBehindFill: e.target.checked })}
                      className="rounded text-primary accent-primary cursor-pointer h-4 w-4"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ─── TAB 2: PARAGRAPH FORMATTING (CorelDRAW Paragraph Tab) ─ */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab === "paragraph" && (
        <div className="space-y-4">
          {/* 1. Horizontal Text Alignment */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Horizontal Alignment
            </Label>
            <div className="grid grid-cols-4 gap-1 bg-background p-1 rounded-lg border border-border/70">
              <button
                type="button"
                onClick={() => onUpdateObject({ textAlign: "left" })}
                className={cn(
                  "flex items-center justify-center h-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors",
                  textAlign === "left" && "bg-primary/15 text-primary font-bold"
                )}
                title="Align Left"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateObject({ textAlign: "center" })}
                className={cn(
                  "flex items-center justify-center h-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors",
                  textAlign === "center" && "bg-primary/15 text-primary font-bold"
                )}
                title="Align Center"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateObject({ textAlign: "right" })}
                className={cn(
                  "flex items-center justify-center h-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors",
                  textAlign === "right" && "bg-primary/15 text-primary font-bold"
                )}
                title="Align Right"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onUpdateObject({ textAlign: "justify" })}
                className={cn(
                  "flex items-center justify-center h-7 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors",
                  textAlign === "justify" && "bg-primary/15 text-primary font-bold"
                )}
                title="Full Justify"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Vertical Alignment (for Frame Text) */}
          <div className="space-y-1.5 pt-2 border-t border-border/60">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Vertical Frame Alignment
            </Label>
            <div className="grid grid-cols-3 gap-1 bg-background p-1 rounded-lg border border-border/70 text-xs">
              <button
                type="button"
                onClick={() => onUpdateObject({ verticalAlign: "top" })}
                className={cn(
                  "py-1 rounded text-[10px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer",
                  verticalAlign === "top" && "bg-primary/15 text-primary font-bold"
                )}
              >
                Top
              </button>
              <button
                type="button"
                onClick={() => onUpdateObject({ verticalAlign: "middle" })}
                className={cn(
                  "py-1 rounded text-[10px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer",
                  verticalAlign === "middle" && "bg-primary/15 text-primary font-bold"
                )}
              >
                Middle
              </button>
              <button
                type="button"
                onClick={() => onUpdateObject({ verticalAlign: "bottom" })}
                className={cn(
                  "py-1 rounded text-[10px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer",
                  verticalAlign === "bottom" && "bg-primary/15 text-primary font-bold"
                )}
              >
                Bottom
              </button>
            </div>
          </div>

          {/* 3. Line Spacing (Leading) */}
          <div className="space-y-1.5 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between text-[11px]">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Line Spacing (Leading)
              </Label>
              <span
                onMouseDown={(e) =>
                  startScrubNumber(e, {
                    initialValue: lineHeight,
                    axis: "x",
                    step: 0.05,
                    min: 0.8,
                    max: 2.5,
                    precision: 2,
                    onUpdate: (val) => onUpdateObject({ lineHeight: val }),
                  })
                }
                className="font-mono font-bold text-foreground hover:text-primary cursor-ew-resize select-none px-1.5 py-0.5 rounded hover:bg-muted/70 transition-colors"
                title="Hold Left Click & Drag to scrub Line Spacing"
              >
                {lineHeight}x
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={lineHeight}
              onChange={(e) => onUpdateObject({ lineHeight: parseFloat(e.target.value) || 1.2 })}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex items-center gap-1 pt-1">
              {[1.0, 1.15, 1.25, 1.5, 2.0].map((lh) => (
                <button
                  key={lh}
                  type="button"
                  onClick={() => onUpdateObject({ lineHeight: lh })}
                  className={cn(
                    "flex-1 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer text-center",
                    lineHeight === lh
                      ? "bg-primary text-primary-foreground border-primary font-bold"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/60"
                  )}
                >
                  {lh}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Indentation & Paragraph Spacing (CorelDRAW Indents) */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Indentation & Paragraph Margins
            </Label>
            <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
              <div className="p-2 rounded-lg border border-border/70 bg-background space-y-1">
                <span
                  onMouseDown={(e) =>
                    startScrubNumber(e, {
                      initialValue: firstLineIndent,
                      axis: "x",
                      step: 1,
                      min: 0,
                      max: 100,
                      onUpdate: (val) => onUpdateObject({ firstLineIndent: val }),
                    })
                  }
                  className="text-muted-foreground hover:text-primary block cursor-ew-resize select-none font-bold"
                  title="Hold Left Click & Drag to scrub First Line Indent"
                >
                  First Line Indent
                </span>
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={firstLineIndent}
                    onChange={(e) =>
                      onUpdateObject({ firstLineIndent: parseFloat(e.target.value) || 0 })
                    }
                    className="w-12 bg-transparent font-bold focus:outline-hidden text-right"
                  />
                  <span className="text-muted-foreground">px</span>
                </div>
              </div>

              <div className="p-2 rounded-lg border border-border/70 bg-background space-y-1">
                <span
                  onMouseDown={(e) =>
                    startScrubNumber(e, {
                      initialValue: paragraphSpacingAfter,
                      axis: "x",
                      step: 1,
                      min: 0,
                      max: 100,
                      onUpdate: (val) => onUpdateObject({ paragraphSpacingAfter: val }),
                    })
                  }
                  className="text-muted-foreground hover:text-primary block cursor-ew-resize select-none font-bold"
                  title="Hold Left Click & Drag to scrub Paragraph Spacing After"
                >
                  Space After Para
                </span>
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={paragraphSpacingAfter}
                    onChange={(e) =>
                      onUpdateObject({ paragraphSpacingAfter: parseFloat(e.target.value) || 0 })
                    }
                    className="w-12 bg-transparent font-bold focus:outline-hidden text-right"
                  />
                  <span className="text-muted-foreground">px</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Bullet & Numbered Lists */}
          <div className="space-y-1.5 pt-2 border-t border-border/60">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              List Format
            </Label>
            <div className="grid grid-cols-4 gap-1 bg-background p-1 rounded-lg border border-border/70 text-xs">
              <button
                type="button"
                onClick={() => onUpdateObject({ listType: "none" })}
                className={cn(
                  "py-1 rounded text-[10px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer",
                  listType === "none" && "bg-primary/15 text-primary font-bold"
                )}
              >
                None
              </button>
              <button
                type="button"
                onClick={() => onUpdateObject({ listType: "bullet" })}
                className={cn(
                  "py-1 rounded text-[10px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center gap-1",
                  listType === "bullet" && "bg-primary/15 text-primary font-bold"
                )}
                title="Bullet Points (•)"
              >
                <List className="w-3 h-3" />
                • Bullet
              </button>
              <button
                type="button"
                onClick={() => onUpdateObject({ listType: "number" })}
                className={cn(
                  "py-1 rounded text-[10px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center gap-1",
                  listType === "number" && "bg-primary/15 text-primary font-bold"
                )}
                title="Numbered List (1. 2. 3.)"
              >
                <ListOrdered className="w-3 h-3" />
                1. 2. 3.
              </button>
              <button
                type="button"
                onClick={() => onUpdateObject({ listType: "dash" })}
                className={cn(
                  "py-1 rounded text-[10px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer",
                  listType === "dash" && "bg-primary/15 text-primary font-bold"
                )}
                title="Dash List (-)"
              >
                — Dash
              </button>
            </div>
          </div>

          {/* 6. CorelDRAW Drop Cap Feature */}
          <div className="p-2.5 rounded-lg border border-border/70 bg-background space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-foreground">
                Drop Cap (CorelDRAW Initial Cap)
              </span>
              <input
                type="checkbox"
                checked={dropCap}
                onChange={(e) => onUpdateObject({ dropCap: e.target.checked })}
                className="rounded text-primary accent-primary cursor-pointer h-4 w-4"
              />
            </div>
            {dropCap && (
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50">
                <span className="text-muted-foreground">Lines to Drop:</span>
                <div className="flex items-center gap-1">
                  {[2, 3, 4].map((lines) => (
                    <button
                      key={lines}
                      type="button"
                      onClick={() => onUpdateObject({ dropCapLines: lines })}
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer",
                        dropCapLines === lines
                          ? "bg-primary text-primary-foreground border-primary font-bold"
                          : "bg-muted text-muted-foreground border-border/60"
                      )}
                    >
                      {lines} lines
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ─── TAB 3: FRAME & PATH (CorelDRAW Frame & Columns Tab) ─── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab === "frame" && (
        <div className="space-y-4">
          {/* 1. Frame Columns (Multi-Column Layout) */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Text Columns (Newspaper / Magazine)
            </Label>
            <div className="grid grid-cols-3 gap-1 bg-background p-1 rounded-lg border border-border/70 text-xs">
              <button
                type="button"
                onClick={() => onUpdateObject({ textColumns: 1 })}
                className={cn(
                  "py-1.5 rounded text-[11px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer text-center",
                  textColumns === 1 && "bg-primary/15 text-primary font-bold"
                )}
              >
                1 Column
              </button>
              <button
                type="button"
                onClick={() => onUpdateObject({ textColumns: 2 })}
                className={cn(
                  "py-1.5 rounded text-[11px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer text-center",
                  textColumns === 2 && "bg-primary/15 text-primary font-bold"
                )}
              >
                2 Columns
              </button>
              <button
                type="button"
                onClick={() => onUpdateObject({ textColumns: 3 })}
                className={cn(
                  "py-1.5 rounded text-[11px] font-medium hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer text-center",
                  textColumns === 3 && "bg-primary/15 text-primary font-bold"
                )}
              >
                3 Columns
              </button>
            </div>

            {textColumns > 1 && (
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-muted-foreground">Column Gutter Gap:</span>
                <div className="flex items-center px-1.5 h-6 rounded border border-border/70 bg-background font-mono text-[11px]">
                  <input
                    type="number"
                    min="4"
                    max="60"
                    value={columnGutter}
                    onChange={(e) =>
                      onUpdateObject({ columnGutter: parseFloat(e.target.value) || 16 })
                    }
                    className="w-8 text-right bg-transparent focus:outline-hidden"
                  />
                  <span className="text-[10px] text-muted-foreground ml-0.5">px</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Text Frame Appearance (Background tint & border) */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Frame Box Background & Inset
            </Label>

            {/* Inset Padding */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Frame Inset Padding:</span>
                <span className="font-mono font-bold text-foreground">{framePadding} px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={framePadding}
                onChange={(e) => onUpdateObject({ framePadding: parseFloat(e.target.value) || 0 })}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Frame Background Color */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-muted-foreground">Frame Background Tint:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateObject({ frameBackground: "transparent" })}
                  className={cn(
                    "px-2 py-0.5 text-[10px] rounded border cursor-pointer",
                    frameBackground === "transparent"
                      ? "bg-primary text-primary-foreground border-primary font-bold"
                      : "bg-background border-border/70 text-muted-foreground"
                  )}
                >
                  None
                </button>
                <input
                  type="color"
                  value={
                    frameBackground && frameBackground !== "transparent"
                      ? frameBackground
                      : "#ffffff"
                  }
                  onChange={(e) => onUpdateObject({ frameBackground: e.target.value })}
                  className="w-6 h-6 rounded border border-border/80 cursor-pointer bg-transparent"
                />
              </div>
            </div>

            {/* Frame Border */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-muted-foreground">Frame Border Width:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={
                    frameBorderColor && frameBorderColor !== "transparent"
                      ? frameBorderColor
                      : "#000000"
                  }
                  onChange={(e) => onUpdateObject({ frameBorderColor: e.target.value })}
                  className="w-6 h-6 rounded border border-border/80 cursor-pointer bg-transparent"
                />
                <div className="flex items-center px-1.5 h-6 rounded border border-border/70 bg-background font-mono text-[11px]">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={frameBorderWidth}
                    onChange={(e) =>
                      onUpdateObject({
                        frameBorderWidth: parseFloat(e.target.value) || 0,
                        frameBorderColor:
                          frameBorderColor === "transparent" ? "#000000" : frameBorderColor,
                      })
                    }
                    className="w-6 text-right bg-transparent focus:outline-hidden"
                  />
                  <span className="text-[10px] text-muted-foreground ml-0.5">px</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Text Orientation (Horizontal vs Vertical Writing Mode) */}
          <div className="space-y-1.5 pt-2 border-t border-border/60">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Text Orientation (CorelDRAW)
            </Label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onUpdateObject({ textOrientation: "horizontal" })}
                className={cn(
                  "py-2 rounded-lg border text-center font-medium transition-all cursor-pointer",
                  textOrientation === "horizontal"
                    ? "bg-primary/15 text-primary border-primary font-bold shadow-2xs"
                    : "bg-background border-border/70 text-muted-foreground hover:text-foreground"
                )}
              >
                Horizontal Text
              </button>
              <button
                type="button"
                onClick={() => onUpdateObject({ textOrientation: "vertical" })}
                className={cn(
                  "py-2 rounded-lg border text-center font-medium transition-all cursor-pointer",
                  textOrientation === "vertical"
                    ? "bg-primary/15 text-primary border-primary font-bold shadow-2xs"
                    : "bg-background border-border/70 text-muted-foreground hover:text-foreground"
                )}
              >
                Vertical Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
