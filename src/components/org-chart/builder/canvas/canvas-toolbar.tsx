"use client"

import * as React from "react"
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Undo2,
  Redo2,
  Sparkles,
  Grid,
  FileCheck2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ToolbarProps {
  zoom: number
  canUndo: boolean
  canRedo: boolean
  gridSnap: boolean
  showPrintBounds: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onFitToScreen: () => void
  onUndo: () => void
  onRedo: () => void
  onAutoArrange: () => void
  onToggleGrid: () => void
  onTogglePrintBounds: () => void
}

export function CanvasToolbar({
  zoom,
  canUndo,
  canRedo,
  gridSnap,
  showPrintBounds,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
  onUndo,
  onRedo,
  onAutoArrange,
  onToggleGrid,
  onTogglePrintBounds,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 bg-background/90 dark:bg-card/90 backdrop-blur-md border border-border/80 rounded-xl p-1.5 shadow-lg select-none">
      {/* Undo / Redo */}
      <Button
        variant="ghost"
        size="icon"
        disabled={!canUndo}
        onClick={onUndo}
        className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={!canRedo}
        onClick={onRedo}
        className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="h-4 w-4" />
      </Button>

      <div className="h-4 w-[1px] bg-border/80 mx-1" />

      {/* Zoom Controls */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomOut}
        className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>

      <button
        type="button"
        onClick={onResetZoom}
        className="px-2 py-1 text-xs font-mono font-bold text-muted-foreground hover:text-foreground rounded hover:bg-muted cursor-pointer transition-colors"
        title="Click to reset zoom to 100%"
      >
        {Math.round(zoom * 100)}%
      </button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomIn}
        className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onFitToScreen}
        className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
        title="Fit to Screen"
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </Button>

      <div className="h-4 w-[1px] bg-border/80 mx-1" />

      {/* Auto Arrange */}
      <Button
        variant="outline"
        size="sm"
        onClick={onAutoArrange}
        className="h-8 text-xs font-bold gap-1.5 text-primary border-primary/30 hover:bg-primary/10 cursor-pointer shadow-2xs"
        title="Automatically arrange organization hierarchy"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Auto Arrange</span>
      </Button>

      <div className="h-4 w-[1px] bg-border/80 mx-1" />

      {/* Grid Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleGrid}
        className={cn(
          "h-8 w-8 cursor-pointer transition-colors",
          gridSnap ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
        )}
        title={gridSnap ? "Grid Snapping: ON" : "Grid Snapping: OFF"}
      >
        <Grid className="h-3.5 w-3.5" />
      </Button>

      {/* Print Bounds Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onTogglePrintBounds}
        className={cn(
          "h-8 w-8 cursor-pointer transition-colors",
          showPrintBounds
            ? "text-[#548235] bg-[#548235]/10"
            : "text-muted-foreground hover:text-foreground"
        )}
        title="Toggle A3 Landscape Print Area Boundaries"
      >
        <FileCheck2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
