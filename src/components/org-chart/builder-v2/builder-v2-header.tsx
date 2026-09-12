"use client"

import * as React from "react"
import { ArrowLeft, Save, Share2, Download, CheckCircle2, Sparkles, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BuilderV2HeaderProps {
  title: string
  version: string
  status: string
  effectiveDate: string
  isDirty: boolean
  lastSavedAt: Date | null
  onBack: () => void
  onSave: (publish?: boolean) => void
  onOpenShareModal: () => void
  onAutoArrange: () => void
  onExportPdf: () => void
  onExportPng: () => void
  onExportSvg: () => void
}

export function BuilderV2Header({
  title,
  version,
  status,
  effectiveDate,
  isDirty,
  lastSavedAt,
  onBack,
  onSave,
  onOpenShareModal,
  onAutoArrange,
  onExportPdf,
  onExportPng,
  onExportSvg,
}: BuilderV2HeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-4 flex items-center justify-between gap-3 shrink-0 select-none z-20">
      {/* LEFT: Back & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 gap-1.5 text-xs font-semibold hover:bg-muted cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>

        <div className="h-5 w-px bg-border shrink-0" />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-foreground truncate max-w-sm">
              {title}
            </h1>
            <Badge
              variant="outline"
              className="text-[10px] font-bold border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 shrink-0"
            >
              V2 Engine
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] font-bold border-emerald-500/30 text-emerald-600 bg-emerald-500/10 shrink-0"
            >
              {version}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
            <span>Effective: <strong>{effectiveDate}</strong></span>
            {lastSavedAt && (
              <>
                <span>&bull;</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Saved {lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </>
            )}
            {isDirty && (
              <span className="text-amber-500 font-medium animate-pulse">
                &bull; Unsaved edits
              </span>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Auto Arrange Layout Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAutoArrange}
          className="h-8 text-xs font-semibold gap-1.5 cursor-pointer hover:bg-muted border-dashed"
          title="Auto arrange tree hierarchy"
        >
          <Wand2 className="h-3.5 w-3.5 text-primary" />
          <span className="hidden md:inline">Auto Arrange</span>
        </Button>

        {/* Share Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenShareModal}
          className="h-8 text-xs font-semibold gap-1.5 cursor-pointer hover:bg-muted"
        >
          <Share2 className="h-3.5 w-3.5 text-blue-500" />
          <span className="hidden sm:inline">Share (6h)</span>
        </Button>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="h-8 px-3 inline-flex items-center justify-center rounded-md border border-input bg-background text-xs font-semibold gap-1.5 cursor-pointer hover:bg-muted"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Export</span>
              </button>
            }
          />
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

        {/* Save Draft */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSave(false)}
          className="h-8 text-xs font-bold gap-1.5 cursor-pointer hover:bg-muted"
        >
          <Save className="h-3.5 w-3.5" />
          <span>Save Draft</span>
        </Button>

        {/* Publish Button */}
        <Button
          type="button"
          size="sm"
          onClick={() => onSave(true)}
          className="h-8 text-xs font-bold gap-1.5 bg-[#548235] hover:bg-[#456b2b] text-white cursor-pointer shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Publish</span>
        </Button>
      </div>
    </header>
  )
}
