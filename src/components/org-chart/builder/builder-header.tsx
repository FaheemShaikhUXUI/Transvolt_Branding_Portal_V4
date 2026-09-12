"use client"

import * as React from "react"
import { OrganizationChart } from "@/lib/org-chart/types"
import { ArrowLeft, Save, Share2, Download, CheckCircle2, Clock, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface BuilderHeaderProps {
  chart: OrganizationChart
  isDirty: boolean
  lastSavedAt: Date | null
  onBack: () => void
  onSave: (asNewVersion?: boolean) => void
  onPublish: () => void
  onShare: () => void
  onExportPdf: () => void
  onExportPng: () => void
  onExportSvg: () => void
  onUpdateTitle: (title: string) => void
  onUpdateEffectiveDate: (date: string) => void
}

export function BuilderHeader({
  chart,
  isDirty,
  lastSavedAt,
  onBack,
  onSave,
  onPublish,
  onShare,
  onExportPdf,
  onExportPng,
  onExportSvg,
  onUpdateTitle,
  onUpdateEffectiveDate,
}: BuilderHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [titleValue, setTitleValue] = React.useState(chart.title)

  React.useEffect(() => {
    setTitleValue(chart.title)
  }, [chart.title])

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    if (titleValue.trim() && titleValue !== chart.title) {
      onUpdateTitle(titleValue.trim())
    }
  }

  return (
    <header className="h-16 border-b border-border/80 bg-background/95 backdrop-blur-md px-4 flex items-center justify-between gap-4 z-40 shrink-0 select-none">
      {/* LEFT AREA: Back button, Chart Title & Dates */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-9 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline font-medium">Back</span>
        </Button>

        <div className="h-5 w-[1px] bg-border/80" />

        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
                autoFocus
                className="text-sm font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-primary/40 focus:outline-none"
              />
            ) : (
              <h2
                onClick={() => setIsEditingTitle(true)}
                className="text-sm font-bold text-foreground truncate cursor-text hover:underline"
                title="Click to rename chart"
              >
                {chart.title}
              </h2>
            )}

            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 shrink-0",
                chart.status === "CURRENT" && "border-emerald-500/30 text-emerald-600 bg-emerald-500/10",
                chart.status === "DRAFT" && "border-amber-500/30 text-amber-600 bg-amber-500/10",
                chart.status === "ARCHIVED" && "border-slate-500/30 text-slate-500 bg-slate-500/10",
                chart.status === "FUTURE" && "border-blue-500/30 text-blue-600 bg-blue-500/10"
              )}
            >
              {chart.status} &bull; {chart.version}
            </Badge>
          </div>

          {/* Metadata Dates Strip */}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
            <span className="truncate">
              <strong>Site:</strong> {chart.siteLocation}
            </span>
            <span className="hidden md:inline">&bull;</span>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-foreground">Effective:</span>
              <input
                type="date"
                value={chart.effectiveFrom}
                onChange={(e) => onUpdateEffectiveDate(e.target.value)}
                className="bg-transparent border-b border-border/60 hover:border-primary text-foreground text-[11px] focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT AREA: Autosave status, Share, Download, Save, Publish */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Autosave feedback */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted-foreground mr-1">
          {isDirty ? (
            <span className="inline-flex items-center gap-1 text-amber-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Unsaved changes
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All changes saved
            </span>
          )}
        </div>

        {/* Share Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          className="h-8 text-xs gap-1.5 cursor-pointer font-medium"
          title="Create a secure 6-hour shareable link"
        >
          <Share2 className="h-3.5 w-3.5 text-blue-600" />
          <span className="hidden sm:inline">Share</span>
        </Button>

        {/* Download Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 cursor-pointer font-medium"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onExportPdf} className="text-xs cursor-pointer">
              Download as PDF (A3 Landscape)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPng} className="text-xs cursor-pointer">
              Download as High-Res PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportSvg} className="text-xs cursor-pointer">
              Download as SVG Vector
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Save Dropdown (Save Changes or Save as New Version) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 cursor-pointer font-medium"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onSave(false)} className="text-xs cursor-pointer">
              Save Changes (Current Version)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onSave(true)} className="text-xs cursor-pointer font-bold text-primary">
              Save as New Version...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Publish Official Button */}
        <Button
          size="sm"
          onClick={onPublish}
          className="h-8 text-xs gap-1.5 bg-[#548235] hover:bg-[#466f2c] text-white font-bold cursor-pointer shadow-sm"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Publish</span>
        </Button>
      </div>
    </header>
  )
}
