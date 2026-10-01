"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Folder,
  ChevronDown,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sliders,
  Sparkles,
  Bot,
  Settings,
  Ruler,
  RotateCcw,
  MoveHorizontal,
  MoveVertical,
  Search,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DocumentSettings,
  MeasurementUnit,
  PageOrientation,
  PageSizePreset,
  ToolType,
} from "@/types/eva-editor"
import { FrameToolIcon } from "../icons/frame-tool-icon"
import { cn } from "@/lib/utils"

export interface FramePresetOption {
  name: string
  label: string
  category: "Print" | "Social" | "Screen" | "Stationery"
  widthMm: number
  heightMm: number
  widthPx: number
  heightPx: number
}

export const FRAME_PRESETS: FramePresetOption[] = [
  { name: "A4 Page", label: "A4 Landscape (318 × 210 mm)", category: "Print", widthMm: 318.0, heightMm: 210.0, widthPx: 1018, heightPx: 672 },
  { name: "A4 Portrait", label: "A4 Portrait (210 × 318 mm)", category: "Print", widthMm: 210.0, heightMm: 318.0, widthPx: 672, heightPx: 1018 },
  { name: "A3 Poster", label: "A3 Sheet (420 × 297 mm)", category: "Print", widthMm: 420.0, heightMm: 297.0, widthPx: 1344, heightPx: 950 },
  { name: "A5 Booklet", label: "A5 Sheet (210 × 148 mm)", category: "Print", widthMm: 210.0, heightMm: 148.0, widthPx: 672, heightPx: 474 },
  { name: "Instagram Square", label: "Instagram Post (1080 × 1080 px)", category: "Social", widthMm: 337.5, heightMm: 337.5, widthPx: 1080, heightPx: 1080 },
  { name: "Instagram Story", label: "Story / Reel (1080 × 1920 px)", category: "Social", widthMm: 337.5, heightMm: 600.0, widthPx: 1080, heightPx: 1920 },
  { name: "Full HD 1080p", label: "Full HD Screen (1920 × 1080 px)", category: "Screen", widthMm: 600.0, heightMm: 337.5, widthPx: 1920, heightPx: 1080 },
  { name: "Mobile Screen", label: "iPhone / Mobile (393 × 852 px)", category: "Screen", widthMm: 122.8, heightMm: 266.3, widthPx: 393, heightPx: 852 },
  { name: "Business Card", label: "Visiting Card (88.9 × 50.8 mm)", category: "Stationery", widthMm: 88.9, heightMm: 50.8, widthPx: 284, heightPx: 163 },
]

interface TopBarProps {
  settings: DocumentSettings
  onUpdateSettings: (updater: (prev: DocumentSettings) => DocumentSettings) => void
  activeTool: ToolType
  onSelectTool?: (tool: ToolType) => void
  onCreateFrame?: (preset: { name: string; widthPx: number; heightPx: number; widthMm: number; heightMm: number }) => void
  onOpenFilesModal: () => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  selectedObjectCount: number
  isEvaBotOpen?: boolean
  onToggleEvaBot?: () => void
}

export interface PagePresetItem {
  id: PageSizePreset
  name: string
  category: "ISO 'A' Series" | "ISO 'B' Series" | "North American (US)" | "Stationery & Marketing" | "Screen & Social" | "Custom"
  dimensionsText: string
  width: number
  height: number
}

export const PAGE_PRESET_ITEMS: PagePresetItem[] = [
  // ISO 'A' Series
  { id: "A0", name: "A0", category: "ISO 'A' Series", dimensionsText: "841 × 1189 mm", width: 1189.0, height: 841.0 },
  { id: "A1", name: "A1", category: "ISO 'A' Series", dimensionsText: "594 × 841 mm", width: 841.0, height: 594.0 },
  { id: "A2", name: "A2", category: "ISO 'A' Series", dimensionsText: "420 × 594 mm", width: 594.0, height: 420.0 },
  { id: "A3", name: "A3", category: "ISO 'A' Series", dimensionsText: "297 × 420 mm", width: 420.0, height: 297.0 },
  { id: "A4", name: "A4", category: "ISO 'A' Series", dimensionsText: "210 × 297 mm", width: 297.0, height: 210.0 },
  { id: "A5", name: "A5", category: "ISO 'A' Series", dimensionsText: "148 × 210 mm", width: 210.0, height: 148.0 },
  { id: "A6", name: "A6", category: "ISO 'A' Series", dimensionsText: "105 × 148 mm", width: 148.0, height: 105.0 },

  // ISO 'B' Series
  { id: "B3", name: "B3", category: "ISO 'B' Series", dimensionsText: "353 × 500 mm", width: 500.0, height: 353.0 },
  { id: "B4", name: "B4", category: "ISO 'B' Series", dimensionsText: "250 × 353 mm", width: 353.0, height: 250.0 },
  { id: "B5", name: "B5", category: "ISO 'B' Series", dimensionsText: "176 × 250 mm", width: 250.0, height: 176.0 },
  { id: "B6", name: "B6", category: "ISO 'B' Series", dimensionsText: "125 × 176 mm", width: 176.0, height: 125.0 },

  // North American (US)
  { id: "Letter", name: "Letter", category: "North American (US)", dimensionsText: "8.5 × 11 in (216 × 279 mm)", width: 279.4, height: 215.9 },
  { id: "Legal", name: "Legal", category: "North American (US)", dimensionsText: "8.5 × 14 in (216 × 356 mm)", width: 355.6, height: 215.9 },
  { id: "Tabloid", name: "Tabloid / Ledger", category: "North American (US)", dimensionsText: "11 × 17 in (279 × 432 mm)", width: 431.8, height: 279.4 },
  { id: "Executive", name: "Executive", category: "North American (US)", dimensionsText: "7.25 × 10.5 in (184 × 267 mm)", width: 266.7, height: 184.2 },
  { id: "Statement", name: "Statement / Half-Letter", category: "North American (US)", dimensionsText: "5.5 × 8.5 in (140 × 216 mm)", width: 215.9, height: 139.7 },

  // Stationery & Marketing
  { id: "Business Card", name: "Visiting Card (US)", category: "Stationery & Marketing", dimensionsText: "3.5 × 2 in (88.9 × 50.8 mm)", width: 88.9, height: 50.8 },
  { id: "Postcard", name: "Standard Postcard", category: "Stationery & Marketing", dimensionsText: "6 × 4 in (152.4 × 101.6 mm)", width: 152.4, height: 101.6 },
  { id: "DL Envelope", name: "DL Envelope", category: "Stationery & Marketing", dimensionsText: "220 × 110 mm", width: 220.0, height: 110.0 },
  { id: "#10 Envelope", name: "#10 Commercial Envelope", category: "Stationery & Marketing", dimensionsText: "9.5 × 4.125 in (241 × 105 mm)", width: 241.3, height: 104.8 },

  // Screen & Social
  { id: "Full HD", name: "Full HD 1080p Screen", category: "Screen & Social", dimensionsText: "1920 × 1080 px (16:9)", width: 600.0, height: 337.5 },
  { id: "4K UHD", name: "4K UHD 2160p Screen", category: "Screen & Social", dimensionsText: "3840 × 2160 px (16:9)", width: 1200.0, height: 675.0 },
  { id: "Instagram Post", name: "Instagram Square Post", category: "Screen & Social", dimensionsText: "1080 × 1080 px (1:1)", width: 337.5, height: 337.5 },
  { id: "Instagram Story", name: "Instagram Story / Reel", category: "Screen & Social", dimensionsText: "1080 × 1920 px (9:16)", width: 337.5, height: 600.0 },

  // Custom
  { id: "Custom", name: "Custom Dimension", category: "Custom", dimensionsText: "User-defined width & height", width: 297.0, height: 210.0 },
]

const PAGE_PRESETS: Record<string, { width: number; height: number }> = Object.fromEntries(
  PAGE_PRESET_ITEMS.map((item) => [item.id, { width: item.width, height: item.height }])
)

export interface MeasurementUnitOption {
  id: MeasurementUnit
  label: string
  short: string
  description: string
}

export const MEASUREMENT_UNIT_OPTIONS: MeasurementUnitOption[] = [
  { id: "mm", label: "Millimeters", short: "mm", description: "Standard CorelDRAW Metric" },
  { id: "cm", label: "Centimeters", short: "cm", description: "Metric (1 cm = 10 mm)" },
  { id: "in", label: "Inches", short: "in", description: "US Standard (1 in = 25.4 mm)" },
  { id: "px", label: "Pixels", short: "px", description: "Digital Screen Units (1 mm = 3.2 px)" },
  { id: "pt", label: "Points", short: "pt", description: "Typography & Print (72 pt = 1 in)" },
  { id: "ft", label: "Feet", short: "ft", description: "Architectural & Large Formats" },
]

// ─── Mathematical Unit Conversion Utilities ─────────────────────────────────
// Scale ratio: 1 mm = 3.2 px (standard canvas viewing scale)
export function formatUnitValue(valMm: number, unit: MeasurementUnit): number {
  switch (unit) {
    case "px":
      return Math.round(valMm * 3.2)
    case "pt":
      return parseFloat(((valMm * 72) / 25.4).toFixed(1))
    case "in":
      return parseFloat((valMm / 25.4).toFixed(2))
    case "ft":
      return parseFloat((valMm / 304.8).toFixed(3))
    case "cm":
      return parseFloat((valMm / 10).toFixed(2))
    case "mm":
    default:
      return parseFloat(valMm.toFixed(1))
  }
}

export function parseUnitToMm(valInUnit: number, unit: MeasurementUnit): number {
  switch (unit) {
    case "px":
      return parseFloat((valInUnit / 3.2).toFixed(2))
    case "pt":
      return parseFloat(((valInUnit * 25.4) / 72).toFixed(2))
    case "in":
      return parseFloat((valInUnit * 25.4).toFixed(2))
    case "ft":
      return parseFloat((valInUnit * 304.8).toFixed(2))
    case "cm":
      return parseFloat((valInUnit * 10).toFixed(2))
    case "mm":
    default:
      return parseFloat(valInUnit.toFixed(2))
  }
}

export function TopBar({
  settings,
  onUpdateSettings,
  activeTool,
  onSelectTool = () => {},
  onCreateFrame,
  onOpenFilesModal,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  selectedObjectCount: _selectedObjectCount,
  isEvaBotOpen = false,
  onToggleEvaBot = () => {},
}: TopBarProps) {
  const router = useRouter()
  const [isEditingName, setIsEditingName] = React.useState(false)
  const [isFrameMenuOpen, setIsFrameMenuOpen] = React.useState(false)
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = React.useState(false)
  const [isPageSizeOpen, setIsPageSizeOpen] = React.useState(false)
  const [pageSizeSearch, setPageSizeSearch] = React.useState("")
  const [isUnitMenuOpen, setIsUnitMenuOpen] = React.useState(false)
  const [customFrameW, setCustomFrameW] = React.useState<string>("210")
  const [customFrameH, setCustomFrameH] = React.useState<string>("297")
  const frameMenuRef = React.useRef<HTMLDivElement>(null)
  const settingsMenuRef = React.useRef<HTMLDivElement>(null)
  const pageSizeMenuRef = React.useRef<HTMLDivElement>(null)
  const unitMenuRef = React.useRef<HTMLDivElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const activeUnitOption =
    MEASUREMENT_UNIT_OPTIONS.find((u) => u.id === settings.unit) || MEASUREMENT_UNIT_OPTIONS[0]

  // Filtered preset groups for search
  const filteredCategories = React.useMemo(() => {
    const q = pageSizeSearch.trim().toLowerCase()
    const categories: { category: string; items: PagePresetItem[] }[] = []
    const map = new Map<string, PagePresetItem[]>()

    PAGE_PRESET_ITEMS.forEach((item) => {
      if (
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.dimensionsText.toLowerCase().includes(q)
      ) {
        const list = map.get(item.category) || []
        list.push(item)
        map.set(item.category, list)
      }
    })

    map.forEach((items, category) => {
      categories.push({ category, items })
    })

    return categories
  }, [pageSizeSearch])

  // Local width & height inputs synchronized with active measurement unit
  const [widthInput, setWidthInput] = React.useState<string>(() =>
    formatUnitValue(settings.widthMm, settings.unit).toString()
  )
  const [heightInput, setHeightInput] = React.useState<string>(() =>
    formatUnitValue(settings.heightMm, settings.unit).toString()
  )

  // Automatically update input numbers whenever width, height, or unit changes
  React.useEffect(() => {
    setWidthInput(formatUnitValue(settings.widthMm, settings.unit).toString())
    setHeightInput(formatUnitValue(settings.heightMm, settings.unit).toString())
  }, [settings.widthMm, settings.heightMm, settings.unit])

  const handleWidthChange = (val: string) => {
    setWidthInput(val)
    const num = parseFloat(val)
    if (!isNaN(num) && num > 0) {
      const widthMm = parseUnitToMm(num, settings.unit)
      onUpdateSettings((prev) => ({
        ...prev,
        widthMm,
        pageSize: "Custom",
      }))
    }
  }

  const handleHeightChange = (val: string) => {
    setHeightInput(val)
    const num = parseFloat(val)
    if (!isNaN(num) && num > 0) {
      const heightMm = parseUnitToMm(num, settings.unit)
      onUpdateSettings((prev) => ({
        ...prev,
        heightMm,
        pageSize: "Custom",
      }))
    }
  }

  const handleWidthBlur = () => {
    const num = parseFloat(widthInput)
    if (!isNaN(num) && num > 0) {
      const widthMm = parseUnitToMm(num, settings.unit)
      onUpdateSettings((prev) => ({
        ...prev,
        widthMm,
        pageSize: "Custom",
      }))
    } else {
      setWidthInput(formatUnitValue(settings.widthMm, settings.unit).toString())
    }
  }

  const handleHeightBlur = () => {
    const num = parseFloat(heightInput)
    if (!isNaN(num) && num > 0) {
      const heightMm = parseUnitToMm(num, settings.unit)
      onUpdateSettings((prev) => ({
        ...prev,
        heightMm,
        pageSize: "Custom",
      }))
    } else {
      setHeightInput(formatUnitValue(settings.heightMm, settings.unit).toString())
    }
  }

  // Interactive drag-to-scrub for Width & Height arrows (hold left key & drag to resize canvas)
  const handleStartScrub = (
    dimension: "width" | "height",
    e: React.MouseEvent
  ) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const startY = e.clientY
    const isWidth = dimension === "width"
    const currentMm = isWidth ? settings.widthMm : settings.heightMm
    const initialUnitVal = formatUnitValue(currentMm, settings.unit)

    const originalCursor = document.body.style.cursor
    const originalUserSelect = document.body.style.userSelect
    document.body.style.cursor = isWidth ? "ew-resize" : "ns-resize"
    document.body.style.userSelect = "none"

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault()

      let deltaPx = 0
      if (isWidth) {
        deltaPx = moveEvent.clientX - startX
      } else {
        const deltaY = -(moveEvent.clientY - startY)
        const deltaX = moveEvent.clientX - startX
        deltaPx = Math.abs(deltaY) >= Math.abs(deltaX) ? deltaY : deltaX
      }

      let step = 0.5
      if (settings.unit === "px") step = 1.0
      else if (settings.unit === "in" || settings.unit === "ft") step = 0.05
      else if (settings.unit === "cm") step = 0.1

      if (moveEvent.shiftKey) step *= 10
      if (moveEvent.altKey) step *= 0.1

      const rawVal = initialUnitVal + deltaPx * step
      const minVal = settings.unit === "px" ? 10 : 1
      const clampedVal = Math.max(minVal, rawVal)
      const precision = settings.unit === "px" ? 0 : settings.unit === "in" || settings.unit === "ft" ? 2 : 1
      const roundedVal = parseFloat(clampedVal.toFixed(precision))

      const formattedStr = roundedVal.toString()
      if (isWidth) {
        setWidthInput(formattedStr)
        const widthMm = parseUnitToMm(roundedVal, settings.unit)
        onUpdateSettings((prev) => ({
          ...prev,
          widthMm,
          pageSize: "Custom",
        }))
      } else {
        setHeightInput(formattedStr)
        const heightMm = parseUnitToMm(roundedVal, settings.unit)
        onUpdateSettings((prev) => ({
          ...prev,
          heightMm,
          pageSize: "Custom",
        }))
      }
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

  // Close frame, settings, page size & unit dropdowns on outside click or Escape
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (pageSizeMenuRef.current && !pageSizeMenuRef.current.contains(e.target as Node)) {
        setIsPageSizeOpen(false)
      }
      if (unitMenuRef.current && !unitMenuRef.current.contains(e.target as Node)) {
        setIsUnitMenuOpen(false)
      }
      if (frameMenuRef.current && !frameMenuRef.current.contains(e.target as Node)) {
        setIsFrameMenuOpen(false)
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setIsSettingsMenuOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPageSizeOpen(false)
        setIsUnitMenuOpen(false)
        setIsFrameMenuOpen(false)
        setIsSettingsMenuOpen(false)
      }
    }
    if (isPageSizeOpen || isUnitMenuOpen || isFrameMenuOpen || isSettingsMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isPageSizeOpen, isUnitMenuOpen, isFrameMenuOpen, isSettingsMenuOpen])

  const handlePageSizeChange = (preset: PageSizePreset) => {
    const item = PAGE_PRESET_ITEMS.find((p) => p.id === preset)
    if (!item) {
      onUpdateSettings((prev) => ({ ...prev, pageSize: preset }))
      setIsPageSizeOpen(false)
      return
    }

    if (preset === "Custom") {
      onUpdateSettings((prev) => ({ ...prev, pageSize: "Custom" }))
      setIsPageSizeOpen(false)
      return
    }

    onUpdateSettings((prev) => {
      const isNaturallyVertical = preset === "Instagram Story"
      const targetOrientation = isNaturallyVertical ? "portrait" : prev.orientation
      const larger = Math.max(item.width, item.height)
      const smaller = Math.min(item.width, item.height)

      return {
        ...prev,
        pageSize: preset,
        orientation: targetOrientation,
        widthMm: targetOrientation === "landscape" ? larger : smaller,
        heightMm: targetOrientation === "landscape" ? smaller : larger,
      }
    })
    setIsPageSizeOpen(false)
  }

  const handleSetOrientation = (target: PageOrientation) => {
    onUpdateSettings((prev) => {
      if (prev.orientation === target) return prev
      return {
        ...prev,
        orientation: target,
        widthMm: prev.heightMm,
        heightMm: prev.widthMm,
      }
    })
  }

  const handleToggleOrientation = () => {
    onUpdateSettings((prev) => {
      const nextOrientation: PageOrientation =
        prev.orientation === "landscape" ? "portrait" : "landscape"
      return {
        ...prev,
        orientation: nextOrientation,
        widthMm: prev.heightMm,
        heightMm: prev.widthMm,
      }
    })
  }

  return (
    <header className="h-12 w-full bg-card/95 backdrop-blur-md border-b border-border/80 px-3 flex items-center justify-between gap-2 shrink-0 select-none relative z-50 overflow-visible">
      {/* ─── Left Section ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-visible">
        {/* Back Button to Portal */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="h-8 px-2 rounded-md hover:bg-muted text-foreground/80 hover:text-foreground shrink-0 gap-1 text-xs font-medium"
          title="Return to Transvolt Branding Portal"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Portal</span>
        </Button>

        {/* Files Button (Folder icon + "Files" as in screenshot) */}
        <button
          onClick={onOpenFilesModal}
          className="h-8 flex items-center gap-1.5 px-2.5 rounded-md border border-border/70 hover:border-amber-500/50 bg-background/60 hover:bg-muted/30 text-xs font-semibold text-foreground transition-all shrink-0 cursor-pointer"
          title="Open All Files & Projects"
        >
          <Folder className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span>Files</span>
        </button>

        {/* File Name: Untitled1 (Editable input) */}
        <div className="h-8 flex items-center gap-1.5 px-2.5 rounded-md border border-border/60 bg-background/40 hover:bg-background/80 transition-all text-xs shrink-0">
          <span className="text-muted-foreground font-medium">File Name:</span>
          <input
            type="text"
            value={settings.fileName}
            onChange={(e) =>
              onUpdateSettings((prev) => ({ ...prev, fileName: e.target.value }))
            }
            className="w-24 sm:w-28 font-semibold text-foreground bg-transparent focus:outline-hidden"
          />
        </div>

        {/* Document Page Size Selector (Custom Popover matching CorelDRAW / Figma standard) */}
        <div className="relative shrink-0" ref={pageSizeMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsPageSizeOpen((prev) => {
                const next = !prev
                if (next) {
                  setPageSizeSearch("")
                  setTimeout(() => searchInputRef.current?.focus(), 60)
                }
                return next
              })
            }}
            className={cn(
              "h-8 px-2.5 rounded-md border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none",
              isPageSizeOpen
                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                : "border-border/60 bg-background/60 hover:bg-background text-foreground hover:border-border"
            )}
            title="Choose Page Size (CorelDRAW Preset Standards)"
          >
            <span className="truncate max-w-[90px]">{settings.pageSize}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
                isPageSizeOpen && "transform rotate-180 text-primary"
              )}
            />
          </button>

          {isPageSizeOpen && (
            <div
              className="absolute top-full mt-1.5 left-0 z-50 w-72 sm:w-80 rounded-xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl p-1.5 flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
              style={{ maxHeight: "420px" }}
            >
              {/* Header & Quick Search */}
              <div className="p-1 pb-1.5 border-b border-border/50">
                <div className="flex items-center justify-between px-1 pb-1">
                  <span className="text-[11px] font-bold text-foreground">CorelDRAW Page Sizes</span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {PAGE_PRESET_ITEMS.length} presets
                  </span>
                </div>
                <div className="relative flex items-center mt-1">
                  <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={pageSizeSearch}
                    onChange={(e) => setPageSizeSearch(e.target.value)}
                    placeholder="Search size (e.g. A4, Letter, 1080)..."
                    className="w-full pl-8 pr-6 py-1 text-xs rounded-md bg-muted/40 border border-border/50 placeholder:text-muted-foreground focus:outline-hidden focus:border-primary/60 focus:bg-background transition-all"
                  />
                  {pageSizeSearch && (
                    <button
                      type="button"
                      onClick={() => setPageSizeSearch("")}
                      className="absolute right-2 text-[10px] text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Categories List */}
              <div className="overflow-y-auto divide-y divide-border/30 scrollbar-thin py-1 pr-0.5">
                {filteredCategories.map((group) => (
                  <div key={group.category} className="py-1 first:pt-0.5 last:pb-0.5">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                      <span>{group.category}</span>
                      <span className="text-[9px] font-normal opacity-70">
                        {group.items.length}
                      </span>
                    </div>
                    <div className="space-y-0.5 mt-0.5">
                      {group.items.map((item) => {
                        const isSelected = settings.pageSize === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handlePageSizeChange(item.id)}
                            className={cn(
                              "w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between text-xs transition-colors cursor-pointer group",
                              isSelected
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-foreground hover:bg-muted/70 hover:text-foreground"
                            )}
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="font-semibold text-xs leading-tight flex items-center gap-1.5">
                                {item.name}
                                {isSelected && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                                )}
                              </span>
                              <span className="text-[10px] text-muted-foreground group-hover:text-muted-foreground/90 font-mono mt-0.5">
                                {item.dimensionsText}
                              </span>
                            </div>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {filteredCategories.length === 0 && (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No page sizes found for &ldquo;{pageSizeSearch}&rdquo;
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Size Selection Mode (Pixels, Millimeters, etc.) - Custom Popover Menu */}
        <div className="relative shrink-0" ref={unitMenuRef}>
          <button
            type="button"
            onClick={() => setIsUnitMenuOpen((prev) => !prev)}
            className={cn(
              "h-8 px-2.5 rounded-md border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none",
              isUnitMenuOpen
                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                : "border-border/60 bg-background/60 hover:bg-background text-foreground hover:border-border"
            )}
            title="Measurement Unit Mode"
          >
            <span>{activeUnitOption.label}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
                isUnitMenuOpen && "transform rotate-180 text-primary"
              )}
            />
          </button>

          {isUnitMenuOpen && (
            <div
              className="absolute top-full mt-1.5 left-0 z-50 w-60 rounded-xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl p-1.5 flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
            >
              <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50 mb-1 flex items-center justify-between">
                <span>Measurement Units</span>
                <span className="text-[9px] font-normal opacity-70">CorelDRAW</span>
              </div>
              <div className="space-y-0.5">
                {MEASUREMENT_UNIT_OPTIONS.map((opt) => {
                  const isSelected = settings.unit === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onUpdateSettings((prev) => ({
                          ...prev,
                          unit: opt.id,
                        }))
                        setIsUnitMenuOpen(false)
                      }}
                      className={cn(
                        "w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between text-xs transition-colors cursor-pointer group",
                        isSelected
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-semibold text-xs leading-tight flex items-center gap-1.5">
                          {opt.label}
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-muted text-muted-foreground">
                            {opt.short}
                          </span>
                        </span>
                        <span className="text-[10px] text-muted-foreground group-hover:text-muted-foreground/90 mt-0.5">
                          {opt.description}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Dimensions: Width (Horizontal) & Height (Vertical) with interactive scrub arrows */}
        <div className="flex items-center h-8 rounded-md border border-border/60 bg-background/50 overflow-hidden font-mono text-xs shrink-0 select-none">
          {/* Width Input Section (Horizontal) */}
          <div className="flex items-center justify-center px-2.5 h-full gap-1.5 border-r border-border/60">
            <button
              type="button"
              onMouseDown={(e) => handleStartScrub("width", e)}
              className="cursor-ew-resize p-1 -m-1 rounded hover:bg-muted/70 text-muted-foreground/75 hover:text-primary transition-colors flex items-center justify-center select-none active:scale-95 group"
              title="Click & drag to scrub width (Shift for 10x, Alt for precision)"
              aria-label="Drag to adjust width"
            >
              <MoveHorizontal className="w-3.5 h-3.5 group-hover:scale-110 transition-transform shrink-0" />
            </button>
            <input
              type="text"
              inputMode="decimal"
              value={widthInput}
              onChange={(e) => handleWidthChange(e.target.value)}
              onBlur={handleWidthBlur}
              style={{ width: `${Math.max(3, (widthInput || "").length)}ch` }}
              className="text-xs bg-transparent text-center font-medium focus:outline-hidden font-mono"
              title={`Page Width (Horizontal) in ${settings.unit}`}
            />
            <span className="text-[10px] text-muted-foreground">{settings.unit}</span>
          </div>

          {/* Height Input Section (Vertical) */}
          <div className="flex items-center justify-center px-2.5 h-full gap-1.5">
            <button
              type="button"
              onMouseDown={(e) => handleStartScrub("height", e)}
              className="cursor-ns-resize p-1 -m-1 rounded hover:bg-muted/70 text-muted-foreground/75 hover:text-primary transition-colors flex items-center justify-center select-none active:scale-95 group"
              title="Click & drag to scrub height (Shift for 10x, Alt for precision)"
              aria-label="Drag to adjust height"
            >
              <MoveVertical className="w-3.5 h-3.5 group-hover:scale-110 transition-transform shrink-0" />
            </button>
            <input
              type="text"
              inputMode="decimal"
              value={heightInput}
              onChange={(e) => handleHeightChange(e.target.value)}
              onBlur={handleHeightBlur}
              style={{ width: `${Math.max(3, (heightInput || "").length)}ch` }}
              className="text-xs bg-transparent text-center font-medium focus:outline-hidden font-mono"
              title={`Page Height (Vertical) in ${settings.unit}`}
            />
            <span className="text-[10px] text-muted-foreground">{settings.unit}</span>
          </div>
        </div>

        {/* Frame Tool (F) - Create page like main page in any size */}
        <div ref={frameMenuRef} className="relative shrink-0 flex items-center">
          <div className="flex items-center h-8 rounded-md border border-border/70 overflow-hidden">
            <button
              type="button"
              onClick={() => {
                onSelectTool("frame")
                setIsFrameMenuOpen((prev) => !prev)
              }}
              className={cn(
                "h-8 px-2.5 flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer select-none",
                activeTool === "frame"
                  ? "bg-[#548235] text-white font-bold"
                  : "bg-background/70 hover:bg-muted/60 text-foreground"
              )}
              title="Frame Tool (F): Click to activate and open page presets"
            >
              <FrameToolIcon className={cn("w-4 h-4", activeTool === "frame" ? "text-white" : "text-foreground")} />
              <span className="hidden sm:inline">Frame</span>
            </button>

            {/* Split arrow dropdown to choose presets or custom frame size */}
            <button
              type="button"
              onClick={() => setIsFrameMenuOpen((prev) => !prev)}
              className={cn(
                "h-8 px-1.5 border-l border-border/60 flex items-center justify-center transition-all cursor-pointer",
                activeTool === "frame"
                  ? "bg-[#436829] text-white"
                  : "bg-background/70 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
              )}
              title="Frame Tool Presets & Page Sizes"
            >
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isFrameMenuOpen && "rotate-180")} />
            </button>
          </div>

          {/* Frame Presets Dropdown Popover */}
          {isFrameMenuOpen && (
            <div className="absolute top-full mt-1.5 left-0 z-[100] w-80 rounded-xl bg-card dark:bg-[#18181b] border border-border/80 shadow-2xl p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <FrameToolIcon className="w-4 h-4 text-[#548235]" />
                  <span className="text-xs font-bold text-foreground">Frame & Page Presets</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">Hotkey: F</span>
              </div>

              {/* Quick Draw Instruction */}
              <button
                type="button"
                onClick={() => {
                  onSelectTool("frame")
                  setIsFrameMenuOpen(false)
                }}
                className={cn(
                  "w-full text-left p-2.5 rounded-lg border text-xs text-foreground flex items-center justify-between group cursor-pointer transition-all",
                  activeTool === "frame"
                    ? "bg-[#548235]/15 border-[#548235]/40"
                    : "bg-primary/5 hover:bg-primary/10 border-primary/20"
                )}
              >
                <div>
                  <div className="font-semibold text-primary flex items-center gap-1.5">
                    <span>📐 Draw Custom Page</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Click & drag on canvas to draw any size</div>
                </div>
                <span className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded font-bold",
                  activeTool === "frame"
                    ? "bg-[#548235] text-white"
                    : "bg-primary/20 text-primary"
                )}>
                  {activeTool === "frame" ? "Active" : "Select"}
                </span>
              </button>

              {/* Standard Page Presets List */}
              <div className="max-h-60 overflow-y-auto space-y-1 overlay-scrollbar pr-0.5">
                <div className="text-[10px] font-semibold text-muted-foreground px-1 py-0.5 uppercase tracking-wider">
                  Page Presets
                </div>
                {FRAME_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      if (onCreateFrame) {
                        onCreateFrame(preset)
                      }
                      setIsFrameMenuOpen(false)
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted/80 text-xs text-foreground flex items-center justify-between group cursor-pointer transition-all"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-medium truncate">{preset.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{preset.widthMm} × {preset.heightMm} mm</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground shrink-0 group-hover:bg-[#548235] group-hover:text-white transition-colors">
                      + Add
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom Size Inputs */}
              <div className="pt-2 border-t border-border/70 space-y-1.5">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Exact Dimension (mm)
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center px-2 h-7.5 rounded border border-border/70 bg-background/50 flex-1">
                    <input
                      type="number"
                      placeholder="W (mm)"
                      value={customFrameW}
                      onChange={(e) => setCustomFrameW(e.target.value)}
                      className="w-full text-xs bg-transparent focus:outline-hidden text-right font-mono"
                    />
                    <span className="text-[9px] text-muted-foreground ml-1">mm</span>
                  </div>
                  <span className="text-muted-foreground text-xs">×</span>
                  <div className="flex items-center px-2 h-7.5 rounded border border-border/70 bg-background/50 flex-1">
                    <input
                      type="number"
                      placeholder="H (mm)"
                      value={customFrameH}
                      onChange={(e) => setCustomFrameH(e.target.value)}
                      className="w-full text-xs bg-transparent focus:outline-hidden text-right font-mono"
                    />
                    <span className="text-[9px] text-muted-foreground ml-1">mm</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const w = parseFloat(customFrameW) || 210
                      const h = parseFloat(customFrameH) || 297
                      if (onCreateFrame) {
                        onCreateFrame({
                          name: `Page ${w}×${h}`,
                          widthMm: w,
                          heightMm: h,
                          widthPx: Math.round(w * 3.2),
                          heightPx: Math.round(h * 3.2),
                        })
                      }
                      setIsFrameMenuOpen(false)
                    }}
                    className="h-7.5 px-3 rounded bg-[#548235] hover:bg-[#436829] text-white text-[11px] font-semibold transition-all shrink-0 cursor-pointer shadow-xs"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Page Orientation Segmented Control (Portrait & Landscape icons without text) */}
        <div
          className="h-8 px-1 rounded-md border border-border/70 bg-card/90 dark:bg-card/70 flex items-center gap-0.5 shrink-0 select-none"
          title={`Orientation: ${settings.orientation === "landscape" ? "Landscape" : "Portrait"}`}
        >
          {/* Portrait Icon */}
          <button
            type="button"
            onClick={() => handleSetOrientation("portrait")}
            className={cn(
              "h-6.5 w-6.5 rounded-sm flex items-center justify-center transition-all duration-300 ease-out cursor-pointer bg-transparent hover:bg-muted/40 active:scale-90",
              settings.orientation === "portrait"
                ? "scale-105"
                : "opacity-55 hover:opacity-100 scale-100"
            )}
            title="Portrait"
            aria-label="Portrait orientation"
          >
            <svg
              width="14"
              height="20"
              viewBox="0 0 14 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0 transition-all duration-300 ease-out"
            >
              <rect
                x="1.5"
                y="1.5"
                width="11"
                height="17"
                rx="4"
                stroke={settings.orientation === "portrait" ? "#007aff" : "#334155"}
                strokeWidth={settings.orientation === "portrait" ? "2.5" : "2.2"}
                className="transition-all duration-300 ease-out"
              />
            </svg>
          </button>

          {/* Landscape Icon */}
          <button
            type="button"
            onClick={() => handleSetOrientation("landscape")}
            className={cn(
              "h-6.5 w-6.5 rounded-sm flex items-center justify-center transition-all duration-300 ease-out cursor-pointer bg-transparent hover:bg-muted/40 active:scale-90",
              settings.orientation === "landscape"
                ? "scale-105"
                : "opacity-55 hover:opacity-100 scale-100"
            )}
            title="Landscape"
            aria-label="Landscape orientation"
          >
            <svg
              width="20"
              height="14"
              viewBox="0 0 20 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0 transition-all duration-300 ease-out"
            >
              <rect
                x="1.5"
                y="1.5"
                width="17"
                height="11"
                rx="4"
                stroke={settings.orientation === "landscape" ? "#007aff" : "#334155"}
                strokeWidth={settings.orientation === "landscape" ? "2.5" : "2.2"}
                className="transition-all duration-300 ease-out"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Right Section: Undo, Redo & Background Color Box ───── */}
      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
        <Button
          size="icon"
          variant="ghost"
          disabled={!canUndo}
          onClick={onUndo}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          disabled={!canRedo}
          onClick={onRedo}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        {/* Divider */}
        <div className="h-4 w-px bg-border/60 mx-0.5" />

        {/* Single box for selection of background color (behind the page) - 20% smaller */}
        <div
          className="relative h-6 w-6 rounded-md border border-black/15 dark:border-white/20 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 overflow-hidden hover:ring-2 hover:ring-primary/40 group"
          style={{
            backgroundColor:
              settings.workspaceColor && /^#[0-9A-Fa-f]{6}$/.test(settings.workspaceColor)
                ? settings.workspaceColor
                : "#cbd5e1",
          }}
          title={`Background Color (Behind Page): ${(
            settings.workspaceColor || "#cbd5e1"
          ).toUpperCase()}`}
        >
          <input
            type="color"
            value={
              settings.workspaceColor && /^#[0-9A-Fa-f]{6}$/.test(settings.workspaceColor)
                ? settings.workspaceColor
                : "#cbd5e1"
            }
            onChange={(e) =>
              onUpdateSettings((prev) => ({
                ...prev,
                workspaceColor: e.target.value,
              }))
            }
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            aria-label="Select background color behind page"
          />
        </div>

        {/* Small button for Eva Bot on right side of BG color selection button (Neon Blue & Green slowly cycling circle) */}
        <button
          type="button"
          onClick={onToggleEvaBot}
          className={cn(
            "h-8 w-8 rounded-full border flex items-center justify-center transition-all duration-300 relative shrink-0 cursor-pointer animate-neon-bot",
            isEvaBotOpen
              ? "scale-105 ring-2 ring-current"
              : "hover:scale-110 active:scale-95"
          )}
          title={isEvaBotOpen ? "Close Eva Bot" : "Open Eva Bot (AI Assistant)"}
          aria-label="Toggle Eva Bot"
        >
          <Bot className="h-4.5 w-4.5 drop-shadow-[0_0_4px_currentColor] transition-transform duration-300" />
          {isEvaBotOpen && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
            </span>
          )}
        </button>

        {/* Settings Button next to Eva Bot */}
        <div ref={settingsMenuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsSettingsMenuOpen((prev) => !prev)}
            className={cn(
              "h-8 w-8 rounded-lg border border-border/70 flex items-center justify-center transition-all cursor-pointer shadow-2xs group",
              isSettingsMenuOpen
                ? "bg-muted text-foreground border-foreground/30 shadow-xs"
                : "bg-background/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
            )}
            title="Design Tool Settings & Preferences"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
          </button>

          {/* Settings Popover Dropdown */}
          {isSettingsMenuOpen && (
            <div className="absolute right-0 top-full mt-2 z-[100] w-64 rounded-xl bg-card border border-border/80 shadow-2xl p-2.5 space-y-2.5 animate-in fade-in zoom-in-95 duration-100 select-none">
              <div className="px-1.5 py-1 text-[11px] font-bold text-foreground flex items-center justify-between border-b border-border/60 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Settings className="h-3.5 w-3.5 text-primary" />
                  Tool Preferences
                </span>
                <span className="text-[9px] font-mono text-muted-foreground uppercase">Options</span>
              </div>

              {/* Display & Rulers */}
              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1.5">
                  Display & Guides
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      showRulers: !prev.showRulers,
                    }))
                  }
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs hover:bg-muted/70 cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Show Rulers</span>
                  </span>
                  <input
                    type="checkbox"
                    readOnly
                    checked={settings.showRulers}
                    className="accent-[#007aff] cursor-pointer"
                  />
                </button>
              </div>

              {/* Measurement Units */}
              <div className="space-y-1 pt-1.5 border-t border-border/60">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1.5">
                  Measurement Unit
                </div>
                <div className="grid grid-cols-5 gap-1 text-[10px] font-mono">
                  {(["mm", "px", "in", "pt", "ft"] as MeasurementUnit[]).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          unit: u,
                        }))
                      }
                      className={cn(
                        "py-1 rounded border text-center font-bold cursor-pointer transition-all uppercase",
                        settings.unit === u
                          ? "border-[#007aff] bg-[#007aff]/15 text-[#007aff]"
                          : "border-border/70 hover:bg-muted/60 text-muted-foreground"
                      )}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Canvas Zoom Reset */}
              <div className="pt-1.5 border-t border-border/60">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      zoom: 1,
                      panX: 0,
                      panY: 0,
                    }))
                  }
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs hover:bg-muted/70 text-foreground cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Reset Canvas (100%)</span>
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">Ctrl+0</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
