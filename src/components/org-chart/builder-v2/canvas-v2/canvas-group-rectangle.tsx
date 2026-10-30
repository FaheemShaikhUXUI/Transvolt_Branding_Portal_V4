"use client"

import * as React from "react"
import { SectionBoundary, BoundaryTitlePosition } from "@/lib/org-chart/types"
import { cn } from "@/lib/utils"

export type ResizeDirection = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se"

interface GroupRectangleProps {
  boundary: SectionBoundary
  isSelected?: boolean
  onSelect?: () => void
  onUpdate?: (updates: Partial<SectionBoundary>) => void
  onResizeStart?: (e: React.MouseEvent, direction: ResizeDirection) => void
}

function getTitlePositionClass(pos?: BoundaryTitlePosition): string {
  switch (pos) {
    case "top-center-outside":
      return "bottom-full left-1/2 -translate-x-1/2 mb-2"
    case "top-right-outside":
      return "bottom-full right-1 mb-2"
    case "bottom-left-outside":
      return "top-full left-1 mt-2"
    case "bottom-center-outside":
      return "top-full left-1/2 -translate-x-1/2 mt-2"
    case "bottom-right-outside":
      return "top-full right-1 mt-2"
    case "top-left-inside":
      return "top-2.5 left-3.5"
    case "top-center-inside":
      return "top-2.5 left-1/2 -translate-x-1/2"
    case "top-right-inside":
      return "top-2.5 right-3.5"
    case "bottom-left-inside":
      return "bottom-2.5 left-3.5"
    case "bottom-center-inside":
      return "bottom-2.5 left-1/2 -translate-x-1/2"
    case "bottom-right-inside":
      return "bottom-2.5 right-3.5"
    case "top-left-outside":
    default:
      return "bottom-full left-1 mb-2"
  }
}

export function CanvasGroupRectangle({
  boundary,
  isSelected,
  onSelect,
  onUpdate,
  onResizeStart,
}: GroupRectangleProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  // Compute 4 corner curves (individual or uniform)
  const borderRadiusStyle = boundary.borderRadiusIndividual
    ? `${boundary.borderRadiusIndividual.topLeft ?? boundary.borderRadius ?? 16}px ${
        boundary.borderRadiusIndividual.topRight ?? boundary.borderRadius ?? 16
      }px ${
        boundary.borderRadiusIndividual.bottomRight ?? boundary.borderRadius ?? 16
      }px ${
        boundary.borderRadiusIndividual.bottomLeft ?? boundary.borderRadius ?? 16
      }px`
    : `${boundary.borderRadius !== undefined ? boundary.borderRadius : 16}px`

  const strokeWidth = boundary.strokeWidth ?? 1.5
  const strokeColor = boundary.color || "#548235"
  const lineStyle =
    boundary.borderStyle === "dotted"
      ? "dotted"
      : boundary.borderStyle === "solid"
      ? "solid"
      : "dashed"

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.()
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group absolute select-none transition-none cursor-move z-2",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md"
      )}
      style={{
        left: `${boundary.position.x}px`,
        top: `${boundary.position.y}px`,
        width: `${boundary.width}px`,
        height: `${boundary.height}px`,
        borderColor: strokeColor,
        borderWidth: `${strokeWidth}px`,
        borderStyle: lineStyle,
        borderRadius: borderRadiusStyle,
        backgroundColor: boundary.bgColor || "rgba(248, 250, 252, 0.4)",
      }}
    >
      {/* Container Title Tag: Positionable on any side, outside top-left by default */}
      {boundary.title && (
        <div
          className={cn(
            "absolute flex items-center gap-2 pointer-events-none z-10 transition-none",
            getTitlePositionClass(boundary.titlePosition)
          )}
        >
          <span
            className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm whitespace-nowrap"
            style={{
              color: strokeColor,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: `1.5px solid ${strokeColor}60`,
            }}
          >
            {boundary.title}
          </span>
        </div>
      )}

      {/* 4-Sided Scaling Edge Handles (Scale from all four sides) */}
      {/* Top Edge */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart?.(e, "n")
        }}
        className="absolute -top-1.5 left-3 right-3 h-3 cursor-ns-resize z-20 flex items-center justify-center hover:opacity-100"
        title="Scale Top (Drag to resize)"
      >
        {(isHovered || isSelected) && (
          <div className="h-1 w-8 rounded-full bg-primary/60 hover:bg-primary transition-colors" />
        )}
      </div>

      {/* Bottom Edge */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart?.(e, "s")
        }}
        className="absolute -bottom-1.5 left-3 right-3 h-3 cursor-ns-resize z-20 flex items-center justify-center hover:opacity-100"
        title="Scale Bottom (Drag to resize)"
      >
        {(isHovered || isSelected) && (
          <div className="h-1 w-8 rounded-full bg-primary/60 hover:bg-primary transition-colors" />
        )}
      </div>

      {/* Left Edge */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart?.(e, "w")
        }}
        className="absolute -left-1.5 top-3 bottom-3 w-3 cursor-ew-resize z-20 flex items-center justify-center hover:opacity-100"
        title="Scale Left (Drag to resize)"
      >
        {(isHovered || isSelected) && (
          <div className="w-1 h-8 rounded-full bg-primary/60 hover:bg-primary transition-colors" />
        )}
      </div>

      {/* Right Edge */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation()
          onResizeStart?.(e, "e")
        }}
        className="absolute -right-1.5 top-3 bottom-3 w-3 cursor-ew-resize z-20 flex items-center justify-center hover:opacity-100"
        title="Scale Right (Drag to resize)"
      >
        {(isHovered || isSelected) && (
          <div className="w-1 h-8 rounded-full bg-primary/60 hover:bg-primary transition-colors" />
        )}
      </div>

      {/* 4 Corner Scaling Handles */}
      {(isHovered || isSelected) && (
        <>
          {/* Top-Left */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onResizeStart?.(e, "nw")
            }}
            className="absolute -top-2 -left-2 w-4 h-4 cursor-nwse-resize rounded-full bg-background border-2 border-primary shadow-xs z-30 hover:scale-125 transition-transform"
            title="Scale Top-Left"
          />
          {/* Top-Right */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onResizeStart?.(e, "ne")
            }}
            className="absolute -top-2 -right-2 w-4 h-4 cursor-nesw-resize rounded-full bg-background border-2 border-primary shadow-xs z-30 hover:scale-125 transition-transform"
            title="Scale Top-Right"
          />
          {/* Bottom-Left */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onResizeStart?.(e, "sw")
            }}
            className="absolute -bottom-2 -left-2 w-4 h-4 cursor-nesw-resize rounded-full bg-background border-2 border-primary shadow-xs z-30 hover:scale-125 transition-transform"
            title="Scale Bottom-Left"
          />
          {/* Bottom-Right */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onResizeStart?.(e, "se")
            }}
            className="absolute -bottom-2 -right-2 w-4 h-4 cursor-nwse-resize rounded-full bg-background border-2 border-primary shadow-xs z-30 hover:scale-125 transition-transform"
            title="Scale Bottom-Right"
          />
        </>
      )}
    </div>
  )
}
