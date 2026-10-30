"use client"

import * as React from "react"
import {
  ArrowLeft,
  Save,
  Share2,
  Download,
  CheckCircle2,
  Sparkles,
  Wand2,
  Building2,
  ChevronDown,
  X,
  Loader2,
  Undo2,
  Redo2,
  AlertTriangle,
  SplitSquareVertical,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OrganizationChart } from "@/lib/org-chart/types"
import { cn } from "@/lib/utils"

interface BuilderV2HeaderProps {
  chart?: OrganizationChart
  title: string
  version: string
  status: string
  effectiveDate: string
  isDirty: boolean
  isSaving?: boolean
  lastSavedAt: Date | null
  onUpdateChartMeta?: (meta: Partial<OrganizationChart>) => void
  onBack: () => void
  onSave?: (publish?: boolean, metaUpdates?: Partial<OrganizationChart>) => void
  onOpenShareModal: () => void
  onAutoArrange: () => void
  showAlignmentGuides?: boolean
  onToggleAlignmentGuides?: () => void
  onExportPdf: () => void
  onExportPng: () => void
  onExportSvg: () => void
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
}

function formatDateDisplay(dateStr?: string | null): string {
  if (!dateStr) {
    const today = new Date()
    const d = String(today.getDate()).padStart(2, "0")
    const m = String(today.getMonth() + 1).padStart(2, "0")
    const y = today.getFullYear()
    return `${d}-${m}-${y}`
  }
  try {
    const dObj = new Date(dateStr)
    if (isNaN(dObj.getTime())) return String(dateStr)
    const d = String(dObj.getDate()).padStart(2, "0")
    const m = String(dObj.getMonth() + 1).padStart(2, "0")
    const y = dObj.getFullYear()
    return `${d}-${m}-${y}`
  } catch {
    return String(dateStr)
  }
}

export function BuilderV2Header({
  chart,
  title,
  version,
  status,
  effectiveDate,
  isDirty,
  isSaving,
  lastSavedAt,
  onUpdateChartMeta,
  onBack,
  onSave,
  onOpenShareModal,
  onAutoArrange,
  showAlignmentGuides = true,
  onToggleAlignmentGuides,
  onExportPdf,
  onExportPng,
  onExportSvg,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: BuilderV2HeaderProps) {
  const [isAccordionOpen, setIsAccordionOpen] = React.useState(false)
  const accordionRef = React.useRef<HTMLDivElement>(null)

  // 3 Mandatory fields: Org. Chart Title, Client Name, Site Location
  const hasMandatoryInfo = Boolean(
    (chart?.title || title)?.trim() &&
    chart?.clientName?.trim() &&
    chart?.siteLocation?.trim()
  )
  const isBasicInfoSaved = Boolean(
    hasMandatoryInfo && chart?.isBasicInfoSaved === true
  )

  const handleSaveBasicInfo = () => {
    const chartTitle = (chart?.title || title || "").trim()
    const client = (chart?.clientName || "").trim()
    const location = (chart?.siteLocation || "").trim()

    if (!chartTitle) {
      toast.error("Org. Chart Title is mandatory to Auto Save.")
      return
    }
    if (!client) {
      toast.error("Client Name is mandatory to Auto Save.")
      return
    }
    if (!location) {
      toast.error("Site Location is mandatory to Auto Save.")
      return
    }

    const metaUpdates: Partial<OrganizationChart> = {
      title: chartTitle,
      clientName: client,
      siteLocation: location,
      isBasicInfoSaved: true,
      updatedAt: new Date().toISOString(),
    }

    onUpdateChartMeta?.(metaUpdates)
    if (onSave) {
      onSave(false, metaUpdates)
    }
    setIsAccordionOpen(false)
    toast.success("Basic info saved! Auto Save is now enabled.")
  }

  // Smooth click-outside and Escape key handling to close accordion
  React.useEffect(() => {
    if (!isAccordionOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (accordionRef.current && !accordionRef.current.contains(e.target as Node)) {
        setIsAccordionOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsAccordionOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isAccordionOpen])

  return (
    <header className="h-14 border-b border-border bg-card/95 backdrop-blur-md flex items-center shrink-0 select-none z-40 w-full max-w-full relative">
      {/* Top-Left Corner Box matching toolbar column (w-14 = 56px) */}
      <div className="w-14 h-full border-r border-border flex items-center justify-center shrink-0 bg-card">
        <button
          type="button"
          onClick={onBack}
          className="h-10 w-10 rounded-full bg-[#0066FF] hover:bg-[#0055d4] active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs group"
          title="Back"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-white stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Main Header Content */}
      <div className="flex-1 min-w-0 h-full px-3.5 sm:px-4 flex items-center justify-between gap-2 relative">
        {/* LEFT: Accordion Pill with Dropdown over canvas */}
        <div ref={accordionRef} className="relative z-50">
          <button
            type="button"
            onClick={() => setIsAccordionOpen((prev) => !prev)}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer select-none text-left group",
              isAccordionOpen
                ? "bg-muted/60"
                : !isBasicInfoSaved
                  ? "bg-amber-500/10 border-2 border-amber-500/70 ring-2 ring-amber-400/40 animate-pulse shadow-xs"
                  : "hover:bg-muted/40"
            )}
            title={!isBasicInfoSaved ? "Mandatory Basic Information required - Click to fill" : "Click to expand Organization Chart Setup"}
            aria-expanded={isAccordionOpen}
          >
            {/* Green Building Icon Container (Exact match to image) */}
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#548235]/15 text-[#548235] border border-[#548235]/25 shrink-0 font-bold group-hover:scale-105 transition-transform shadow-2xs">
              <Building2 className="h-4 w-4" />
            </div>

            {/* Title & Subtitle */}
            <div className="min-w-0 max-w-[190px] sm:max-w-[240px] md:max-w-[280px]">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-[13px] font-bold text-foreground truncate">
                  {chart?.title || title || "New Org Chart Setup"}
                </h3>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">
                {chart?.siteLocation || chart?.clientName
                  ? `${[chart?.siteLocation, chart?.clientName].filter(Boolean).join(" • ")} • ${chart?.version || version || "v1.0"}`
                  : "Setup Title, Client & Site Location"}
              </p>
            </div>

            {/* Status Badge & Chevron (Exact match to image) */}
            <div className="flex items-center gap-1.5 shrink-0 ml-1">
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0",
                  status === "CURRENT"
                    ? "border-emerald-500/40 text-emerald-600 bg-emerald-500/10"
                    : "border-amber-500/40 text-amber-600 bg-amber-500/10"
                )}
              >
                {status === "CURRENT" ? "Active" : "Draft"}
              </Badge>
              <div
                className={cn(
                  "p-0.5 rounded text-muted-foreground group-hover:text-foreground transition-transform duration-200 shrink-0",
                  isAccordionOpen && "rotate-180 text-foreground"
                )}
              >
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </button>

          {/* Smooth Floating Dropdown Over Everything (Does NOT extend header height) */}
          {isAccordionOpen && (
            <div
              className="absolute top-[calc(100%+8px)] left-0 z-50 w-[360px] sm:w-[420px] max-w-[calc(100vw-32px)] rounded-2xl border border-border/80 bg-card/98 backdrop-blur-xl shadow-2xl p-4 animate-in fade-in-50 zoom-in-95 duration-150 space-y-3.5 select-none"
              style={{
                boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
              }}
            >
              {/* Header inside popup */}
              <div className="flex items-center justify-between pb-1 border-b border-border/70">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-[#548235]" />
                  <span className="text-xs font-bold text-foreground">
                    Basic Information Setup
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {lastSavedAt && (
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Saved {lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsAccordionOpen(false)}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Form Groups strictly according to user instructions */}
              <div className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
                {/* Tile Group 1: (Mandatory to Auto Save) */}
                <div className="rounded-xl border border-amber-500/35 bg-amber-500/[0.04] p-3 space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-amber-500/25">
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 tracking-tight">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-black">
                        1
                      </span>
                      Tile Group 1: (Mandatory to Auto Save)
                    </span>
                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                      Required *
                    </span>
                  </div>

                  {/* 1. Org. Chart Title */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground/90">
                      Org. Chart Title <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <Input
                      value={chart?.title ?? title ?? ""}
                      onChange={(e) => onUpdateChartMeta?.({ title: e.target.value })}
                      placeholder="e.g. Organization Structure: New Project"
                      className="h-8 text-xs rounded-lg bg-background border-border/80 focus-visible:ring-1"
                    />
                  </div>

                  {/* 2. Client Name */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground/90">
                      Client Name <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <Input
                      value={chart?.clientName ?? ""}
                      onChange={(e) => onUpdateChartMeta?.({ clientName: e.target.value })}
                      placeholder="e.g. BEST, MSRTC, etc."
                      className="h-8 text-xs rounded-lg bg-background border-border/80 focus-visible:ring-1"
                    />
                  </div>

                  {/* 3. Site Location */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground/90">
                      Site Location <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <Input
                      value={chart?.siteLocation ?? ""}
                      onChange={(e) => onUpdateChartMeta?.({ siteLocation: e.target.value })}
                      placeholder="e.g. Bandra, Turbhe, etc."
                      className="h-8 text-xs rounded-lg bg-background border-border/80 focus-visible:ring-1"
                    />
                  </div>
                </div>

                {/* Tile Group 2 */}
                <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                    <span className="text-[11px] font-bold text-foreground/80 flex items-center gap-1.5 tracking-tight">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-muted-foreground/20 text-foreground text-[10px] font-black">
                        2
                      </span>
                      Tile Group 2
                    </span>
                    <span className="text-[9px] font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full">
                      Not Mandatory
                    </span>
                  </div>

                  {/* 1. Project Manager / Head */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground/85">
                      Project Manager / Head
                    </Label>
                    <Input
                      value={chart?.projectManager || chart?.footer?.projectInfo?.projectManager || ""}
                      onChange={(e) => onUpdateChartMeta?.({ projectManager: e.target.value })}
                      placeholder="e.g. Mr. Rajesh Patil"
                      className="h-8 text-xs rounded-lg bg-background border-border/80"
                    />
                  </div>

                  {/* 2. Created Date (Auto) | Updated Date (Auto) */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-semibold text-foreground/85">Created Date</Label>
                        <span className="text-[10px] text-muted-foreground font-normal">(Auto)</span>
                      </div>
                      <div className="h-8 px-2.5 flex items-center rounded-lg bg-muted/50 border border-border/70 text-xs text-muted-foreground font-mono select-text">
                        {formatDateDisplay(chart?.createdAt)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-semibold text-foreground/85">Updated Date</Label>
                        <span className="text-[10px] text-muted-foreground font-normal">(Auto)</span>
                      </div>
                      <div className="h-8 px-2.5 flex items-center rounded-lg bg-muted/50 border border-border/70 text-xs text-muted-foreground font-mono select-text">
                        {formatDateDisplay(chart?.updatedAt || (lastSavedAt ? lastSavedAt.toISOString() : null))}
                      </div>
                    </div>
                  </div>

                  {/* 3. Effective Date | Version No. */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-semibold text-foreground/85">Effective Date</Label>
                        <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                      </div>
                      <Input
                        type="date"
                        value={chart?.effectiveFrom || effectiveDate || ""}
                        onChange={(e) => onUpdateChartMeta?.({ effectiveFrom: e.target.value })}
                        className="h-8 text-xs rounded-lg bg-background border-border/80"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-semibold text-foreground/85">Version No.</Label>
                        <span className="text-[10px] text-muted-foreground font-normal">(Edit later)</span>
                      </div>
                      <Input
                        value={chart?.version || version || "v1.0"}
                        onChange={(e) => onUpdateChartMeta?.({ version: e.target.value })}
                        placeholder="v1.0"
                        className="h-8 text-xs rounded-lg bg-background border-border/80"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Changes Button */}
                <Button
                  type="button"
                  onClick={handleSaveBasicInfo}
                  className="w-full h-8.5 rounded-lg text-xs font-bold gap-2 bg-[#548235] hover:bg-[#466f2c] text-white shadow-xs cursor-pointer mt-1 transition-all"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </Button>
              </div>
            </div>
          )}
        </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
        {/* Undo / Redo Buttons */}
        <div className="flex items-center gap-0.5 mr-0.5 border border-border/60 bg-muted/30 rounded-md p-0.5">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded transition-all",
              canUndo
                ? "text-muted-foreground hover:bg-background hover:text-foreground cursor-pointer shadow-2xs"
                : "opacity-35 cursor-not-allowed text-muted-foreground"
            )}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded transition-all",
              canRedo
                ? "text-muted-foreground hover:bg-background hover:text-foreground cursor-pointer shadow-2xs"
                : "opacity-35 cursor-not-allowed text-muted-foreground"
            )}
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Alignment Guidelines Toggle Button (Left side of Auto Arrange) */}
        <Button
          type="button"
          variant={showAlignmentGuides ? "default" : "outline"}
          size="sm"
          onClick={onToggleAlignmentGuides}
          className={cn(
            "h-8 px-2 sm:px-2.5 text-xs font-semibold gap-1.5 cursor-pointer shrink-0 transition-all select-none",
            showAlignmentGuides
              ? "bg-[#0066FF] hover:bg-[#0055d4] text-white shadow-xs border-[#0066FF]"
              : "hover:bg-muted text-muted-foreground border-border"
          )}
          title={showAlignmentGuides ? "Alignment Guidelines: ON (Click to toggle OFF)" : "Alignment Guidelines: OFF (Click to toggle ON)"}
          aria-pressed={showAlignmentGuides}
        >
          <SplitSquareVertical className={cn("h-3.5 w-3.5", showAlignmentGuides ? "text-white" : "text-muted-foreground")} />
          <span className="hidden xl:inline">Guides</span>
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full shrink-0 transition-colors",
              showAlignmentGuides ? "bg-emerald-300 shadow-[0_0_6px_rgba(110,231,183,0.9)]" : "bg-muted-foreground/40"
            )}
          />
        </Button>

        {/* Auto Arrange Layout Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAutoArrange}
          className="h-8 px-2 sm:px-2.5 text-xs font-semibold gap-1.5 cursor-pointer hover:bg-muted border-dashed shrink-0"
          title="Auto arrange tree hierarchy"
        >
          <Wand2 className="h-3.5 w-3.5 text-primary" />
          <span className="hidden xl:inline">Auto Arrange</span>
        </Button>

        {/* Share Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenShareModal}
          className="h-8 px-2 sm:px-2.5 text-xs font-semibold gap-1.5 cursor-pointer hover:bg-muted shrink-0"
        >
          <Share2 className="h-3.5 w-3.5 text-blue-500" />
          <span className="hidden sm:inline">Share</span>
        </Button>

        {/* Export Button (Directly opens Large Export Studio Modal) */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExportPdf}
          className="h-8 px-2 sm:px-2.5 text-xs font-semibold gap-1.5 cursor-pointer hover:bg-muted shrink-0"
        >
          <Download className="h-3.5 w-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Export</span>
        </Button>

        {/* Auto Save Status Badge (Uniform fixed width so Auto-saved, Unsaved, and Saving tiles never shift) */}
        {!isBasicInfoSaved ? (
          <button
            type="button"
            onClick={() => setIsAccordionOpen(true)}
            title="Click to fill and save mandatory Basic Information"
            className="h-8 w-[188px] min-w-[188px] rounded-lg bg-zinc-950 dark:bg-black text-amber-400 border border-amber-500/70 hover:border-amber-400 text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 select-none shadow-xs cursor-pointer transition-all whitespace-nowrap active:scale-[0.98]"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="whitespace-nowrap tracking-tight">Save Basic Info.</span>
          </button>
        ) : isSaving ? (
          <div className="h-8 w-[188px] min-w-[188px] rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 select-none shadow-xs whitespace-nowrap">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500 shrink-0" />
            <span className="whitespace-nowrap">Saving...</span>
          </div>
        ) : isDirty ? (
          <div className="h-8 w-[188px] min-w-[188px] rounded-lg border border-border bg-muted/40 text-muted-foreground text-xs font-medium flex items-center justify-center gap-1.5 shrink-0 select-none shadow-xs whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
            <span className="whitespace-nowrap">Unsaved changes</span>
          </div>
        ) : (
          <div className="h-8 w-[188px] min-w-[188px] rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 select-none shadow-xs whitespace-nowrap">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">
              Auto-saved {lastSavedAt ? lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }) : ""}
            </span>
          </div>
        )}
      </div>
      </div>
    </header>
  )
}
