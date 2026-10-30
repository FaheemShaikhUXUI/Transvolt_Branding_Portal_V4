"use client"

import * as React from "react"
import {
  MousePointer,
  SquareDashed,
  ArrowRight,
  Type,
  Shapes,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ShapeKind } from "../shapes/types"
import { ShapesLibraryPopover } from "../shapes/shapes-library-popover"

export type ActiveCanvasTool =
  | "select"
  | "hand"
  | "rectangle"
  | "connector"
  | "text"
  | "shapes"

interface LeftToolbarProps {
  activeTool: ActiveCanvasTool
  setActiveTool: (tool: ActiveCanvasTool) => void
  activeShapeKind?: ShapeKind
  onSelectShapeKind?: (kind: ShapeKind) => void
  canUndo?: boolean
  canRedo?: boolean
  hasSelection?: boolean
  onUndo?: () => void
  onRedo?: () => void
  onDeleteSelected?: () => void
  onFitToScreen?: () => void
  onResetView?: () => void
  onAddShape?: (kind: ShapeKind) => void
}

export function CanvasLeftToolbar({
  activeTool,
  setActiveTool,
  activeShapeKind = "process",
  onSelectShapeKind,
  canUndo,
  canRedo,
  hasSelection,
  onUndo,
  onRedo,
  onDeleteSelected,
  onFitToScreen,
  onResetView,
  onAddShape,
}: LeftToolbarProps) {
  const [shapesPopoverOpen, setShapesPopoverOpen] = React.useState(false)
  return (
    <TooltipProvider>
      <div className="relative w-14 h-full z-40 flex flex-col items-center py-3 px-1.5 gap-1.5 border-r border-border/90 bg-card select-none shrink-0 shadow-sm">
        {/* Tool 1: Select / Move */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => setActiveTool("select")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-all cursor-pointer",
                  activeTool === "select"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title="Select & Move (V)"
              >
                <MousePointer className="h-4 w-4" />
              </button>
            }
          />
          <TooltipContent side="right" className="text-xs font-medium">
            <span>Select &amp; Move</span>
            <kbd className="ml-2 rounded bg-muted px-1 py-0.5 text-[10px] font-mono">V</kbd>
          </TooltipContent>
        </Tooltip>

        <div className="h-px w-8 bg-border/80 my-0.5" />


        {/* Tool 2: Add Grouping Rectangle */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => setActiveTool("rectangle")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md transition-all cursor-pointer",
                  activeTool === "rectangle"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <SquareDashed className="h-4 w-4" />
              </button>
            }
          />
          <TooltipContent side="right" className="text-xs font-medium">
            <span>Add Grouping Rectangle</span>
            <kbd className="ml-2 rounded bg-muted px-1 py-0.5 text-[10px] font-mono">R</kbd>
          </TooltipContent>
        </Tooltip>

        {/* Tool 3: Draw Connector / Arrow */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => setActiveTool("connector")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md transition-all cursor-pointer",
                  activeTool === "connector"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            }
          />
          <TooltipContent side="right" className="text-xs font-medium">
            <span>Draw Connector / Arrow</span>
            <kbd className="ml-2 rounded bg-muted px-1 py-0.5 text-[10px] font-mono">C</kbd>
          </TooltipContent>
        </Tooltip>

        {/* Tool 4: Text Annotation */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => setActiveTool("text")}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md transition-all cursor-pointer",
                  activeTool === "text"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Type className="h-4 w-4" />
              </button>
            }
          />
          <TooltipContent side="right" className="text-xs font-medium">
            <span>Text Annotation</span>
            <kbd className="ml-2 rounded bg-muted px-1 py-0.5 text-[10px] font-mono">T</kbd>
          </TooltipContent>
        </Tooltip>

        {/* Tool 5: Shapes Tool (Flowcharts, Diagrams & Basic Shapes) */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => {
                  if (activeTool === "shapes") {
                    setShapesPopoverOpen((prev) => !prev)
                  } else {
                    setActiveTool("shapes")
                    setShapesPopoverOpen(true)
                  }
                }}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md transition-all cursor-pointer relative",
                  activeTool === "shapes" || shapesPopoverOpen
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title="Shapes Tool (S)"
              >
                <Shapes className="h-4 w-4" />
              </button>
            }
          />
          <TooltipContent side="right" className="text-xs font-medium">
            <span>Shapes Library (Flowchart &amp; Symbols)</span>
            <kbd className="ml-2 rounded bg-muted px-1 py-0.5 text-[10px] font-mono">S</kbd>
          </TooltipContent>
        </Tooltip>

        {/* Shapes Library Flyout Popover */}
        <ShapesLibraryPopover
          isOpen={shapesPopoverOpen}
          onClose={() => setShapesPopoverOpen(false)}
          onSelectShape={(kind) => {
            onSelectShapeKind?.(kind)
            setActiveTool("shapes")
            setShapesPopoverOpen(false)
          }}
        />

        {/* Empty area stretching full till the bottom */}
        <div className="flex-1 w-full" />
      </div>
    </TooltipProvider>
  )
}
