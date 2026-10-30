"use client"

import * as React from "react"
import { ChartShape } from "./types"
import { ShapeGeometry } from "./geometry"
import { cn } from "@/lib/utils"

interface CanvasShapeItemProps {
  shape: ChartShape
  isSelected: boolean
  isInteractive?: boolean
  zoom?: number
  isConnecting?: boolean
  onSelect: (e: React.MouseEvent) => void
  onUpdatePosition: (id: string, newPos: { x: number; y: number }) => void
  onDragEnd?: () => void
  onUpdateSize?: (id: string, newSize: { width: number; height: number; x: number; y: number }) => void
  onUpdateText?: (id: string, text: string) => void
  onStartConnect?: (e: React.MouseEvent, shapeId: string, anchor: "top" | "bottom" | "left" | "right") => void
  onDropConnect?: (shapeId: string) => void
}

export function CanvasShapeItem({
  shape,
  isSelected,
  isInteractive = true,
  zoom = 1,
  isConnecting = false,
  onSelect,
  onUpdatePosition,
  onDragEnd,
  onUpdateSize,
  onUpdateText,
  onStartConnect,
  onDropConnect,
}: CanvasShapeItemProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [isEditingText, setIsEditingText] = React.useState(false)
  const [textValue, setTextValue] = React.useState(shape.text || "")
  const dragRef = React.useRef<{
    startX: number
    startY: number
    shapeX: number
    shapeY: number
  }>({ startX: 0, startY: 0, shapeX: 0, shapeY: 0 })

  const resizeRef = React.useRef<{
    startX: number
    startY: number
    startWidth: number
    startHeight: number
    startShapeX: number
    startShapeY: number
    handle: string
  } | null>(null)

  React.useEffect(() => {
    setTextValue(shape.text || "")
  }, [shape.text])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isInteractive || isEditingText) return
    if (e.button !== 0) return
    e.stopPropagation()
    onSelect(e as unknown as React.MouseEvent)

    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      shapeX: shape.x,
      shapeY: shape.y,
    }

    const currentZoom = zoom || 1
    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - dragRef.current.startX) / currentZoom
      const dy = (moveEvent.clientY - dragRef.current.startY) / currentZoom
      onUpdatePosition(shape.id, {
        x: Math.max(0, Math.round(dragRef.current.shapeX + dx)),
        y: Math.max(0, Math.round(dragRef.current.shapeY + dy)),
      })
    }

    const handlePointerUp = () => {
      setIsDragging(false)
      onDragEnd?.()
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
  }

  const handleResizeStart = (e: React.PointerEvent, handle: string) => {
    e.stopPropagation()
    if (!onUpdateSize) return

    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: shape.width,
      startHeight: shape.height,
      startShapeX: shape.x,
      startShapeY: shape.y,
      handle,
    }

    const currentZoom = zoom || 1
    const handleResizeMove = (moveEvent: PointerEvent) => {
      if (!resizeRef.current) return
      const dx = (moveEvent.clientX - resizeRef.current.startX) / currentZoom
      const dy = (moveEvent.clientY - resizeRef.current.startY) / currentZoom
      const startW = resizeRef.current.startWidth
      const startH = resizeRef.current.startHeight
      const startX = resizeRef.current.startShapeX
      const startY = resizeRef.current.startShapeY

      let newW = startW
      let newH = startH
      let newX = startX
      let newY = startY

      const isCorner =
        handle === "nw" || handle === "ne" || handle === "sw" || handle === "se"

      if (isCorner) {
        // Proportionate scaling for all corner points: preserves exact aspect ratio
        const denom = startW * startW + startH * startH
        let projDelta = 0

        if (handle === "se") {
          projDelta = (dx * startW + dy * startH) / denom
          const minScale = Math.max(24 / startW, 20 / startH)
          const scale = Math.max(minScale, 1 + projDelta)
          newW = Math.round(startW * scale)
          newH = Math.round(startH * scale)
          newX = startX
          newY = startY
        } else if (handle === "ne") {
          projDelta = (dx * startW + (-dy) * startH) / denom
          const minScale = Math.max(24 / startW, 20 / startH)
          const scale = Math.max(minScale, 1 + projDelta)
          newW = Math.round(startW * scale)
          newH = Math.round(startH * scale)
          newX = startX
          newY = Math.round(startY + startH - newH)
        } else if (handle === "sw") {
          projDelta = ((-dx) * startW + dy * startH) / denom
          const minScale = Math.max(24 / startW, 20 / startH)
          const scale = Math.max(minScale, 1 + projDelta)
          newW = Math.round(startW * scale)
          newH = Math.round(startH * scale)
          newX = Math.round(startX + startW - newW)
          newY = startY
        } else if (handle === "nw") {
          projDelta = ((-dx) * startW + (-dy) * startH) / denom
          const minScale = Math.max(24 / startW, 20 / startH)
          const scale = Math.max(minScale, 1 + projDelta)
          newW = Math.round(startW * scale)
          newH = Math.round(startH * scale)
          newX = Math.round(startX + startW - newW)
          newY = Math.round(startY + startH - newH)
        }
      } else {
        // 4-Sided edge handles: scale independently in one dimension
        if (handle.includes("e")) {
          newW = Math.max(30, Math.round(startW + dx))
        }
        if (handle.includes("w")) {
          const w = Math.max(30, Math.round(startW - dx))
          newX = Math.round(startX + (startW - w))
          newW = w
        }
        if (handle.includes("s")) {
          newH = Math.max(20, Math.round(startH + dy))
        }
        if (handle.includes("n")) {
          const h = Math.max(20, Math.round(startH - dy))
          newY = Math.round(startY + (startH - h))
          newH = h
        }
      }

      onUpdateSize(shape.id, {
        width: newW,
        height: newH,
        x: newX,
        y: newY,
      })
    }

    const handleResizeUp = () => {
      resizeRef.current = null
      window.removeEventListener("pointermove", handleResizeMove)
      window.removeEventListener("pointerup", handleResizeUp)
    }

    window.addEventListener("pointermove", handleResizeMove)
    window.addEventListener("pointerup", handleResizeUp)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditingText(true)
  }

  const handleTextBlur = () => {
    setIsEditingText(false)
    if (onUpdateText && textValue !== shape.text) {
      onUpdateText(shape.id, textValue)
    }
  }

  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <div
      style={{
        position: "absolute",
        left: `${shape.x}px`,
        top: `${shape.y}px`,
        width: `${shape.width}px`,
        height: `${shape.height}px`,
        transform: shape.rotation ? `rotate(${shape.rotation}deg)` : undefined,
        zIndex: shape.zIndex || 5,
      }}
      className={cn(
        "group select-none transition-shadow duration-100",
        isInteractive && "cursor-move",
        isSelected && "ring-2 ring-blue-500/80 ring-offset-2 ring-offset-background"
      )}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseUp={() => onDropConnect?.(shape.id)}
      data-shape-id={shape.id}
    >
      {/* SVG Canvas for Vector Shape */}
      <svg
        viewBox={`0 0 ${shape.width} ${shape.height}`}
        width="100%"
        height="100%"
        className="overflow-visible block"
      >
        <ShapeGeometry shape={{ ...shape, text: isEditingText ? "" : shape.text }} />
      </svg>

      {/* Inline Text Editor on Double Click */}
      {isEditingText && (
        <textarea
          autoFocus
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onBlur={handleTextBlur}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsEditingText(false)
            }
          }}
          className="absolute inset-0 m-auto w-[85%] h-[60%] resize-none text-center bg-white/95 dark:bg-slate-900/95 border border-blue-500 rounded p-1 text-xs outline-none shadow-md z-30"
          style={{
            fontSize: `${shape.fontSize || 13}px`,
            color: shape.textColor || "#111827",
            fontWeight: shape.fontWeight || 500,
          }}
        />
      )}

      {/* Selection & Hover Handles (4 Corners + 4 Side Edges, exactly like Grouping Rectangle) */}
      {(isSelected || isHovered) && isInteractive && !isEditingText && (
        <>
          {/* 4-Sided Scaling Edge Handles (Scale from all four sides) */}
          {/* Top Edge */}
          <div
            onPointerDown={(e) => handleResizeStart(e, "n")}
            className="absolute -top-1.5 left-3 right-3 h-3 cursor-ns-resize z-20 flex items-center justify-center hover:opacity-100"
            title="Scale Top (Drag to resize)"
          >
            <div className="h-1 w-8 rounded-full bg-primary/60 hover:bg-primary transition-colors" />
          </div>

          {/* Bottom Edge */}
          <div
            onPointerDown={(e) => handleResizeStart(e, "s")}
            className="absolute -bottom-1.5 left-3 right-3 h-3 cursor-ns-resize z-20 flex items-center justify-center hover:opacity-100"
            title="Scale Bottom (Drag to resize)"
          >
            <div className="h-1 w-8 rounded-full bg-primary/60 hover:bg-primary transition-colors" />
          </div>

          {/* Left Edge */}
          <div
            onPointerDown={(e) => handleResizeStart(e, "w")}
            className="absolute -left-1.5 top-3 bottom-3 w-3 cursor-ew-resize z-20 flex items-center justify-center hover:opacity-100"
            title="Scale Left (Drag to resize)"
          >
            <div className="w-1 h-8 rounded-full bg-primary/60 hover:bg-primary transition-colors" />
          </div>

          {/* Right Edge */}
          <div
            onPointerDown={(e) => handleResizeStart(e, "e")}
            className="absolute -right-1.5 top-3 bottom-3 w-3 cursor-ew-resize z-20 flex items-center justify-center hover:opacity-100"
            title="Scale Right (Drag to resize)"
          >
            <div className="w-1 h-8 rounded-full bg-primary/60 hover:bg-primary transition-colors" />
          </div>

          {/* 4 Corner Scaling Handles (Proportionate Scaling) */}
          {/* Top-Left */}
          <div
            onPointerDown={(e) => handleResizeStart(e, "nw")}
            className="absolute -top-2 -left-2 w-4 h-4 cursor-nwse-resize rounded-full bg-background border-2 border-primary shadow-xs z-30 hover:scale-125 transition-transform"
            title="Scale Proportionately (Top-Left)"
          />
          {/* Top-Right */}
          <div
            onPointerDown={(e) => handleResizeStart(e, "ne")}
            className="absolute -top-2 -right-2 w-4 h-4 cursor-nesw-resize rounded-full bg-background border-2 border-primary shadow-xs z-30 hover:scale-125 transition-transform"
            title="Scale Proportionately (Top-Right)"
          />
          {/* Bottom-Left */}
          <div
            onPointerDown={(e) => handleResizeStart(e, "sw")}
            className="absolute -bottom-2 -left-2 w-4 h-4 cursor-nesw-resize rounded-full bg-background border-2 border-primary shadow-xs z-30 hover:scale-125 transition-transform"
            title="Scale Proportionately (Bottom-Left)"
          />
          {/* Bottom-Right */}
          <div
            onPointerDown={(e) => handleResizeStart(e, "se")}
            className="absolute -bottom-2 -right-2 w-4 h-4 cursor-nwse-resize rounded-full bg-background border-2 border-primary shadow-xs z-30 hover:scale-125 transition-transform"
            title="Scale Proportionately (Bottom-Right)"
          />
        </>
      )}
    </div>
  )
}
