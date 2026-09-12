"use client"

import * as React from "react"
import { OrgNode, OrgConnection, SectionBoundary, OrgFooter } from "@/lib/org-chart/types"
import { ExecutiveTileV2 } from "../nodes-v2/executive-tile-v2"
import { DepartmentTileV2 } from "../nodes-v2/department-tile-v2"
import { PersonTileV2 } from "../nodes-v2/person-tile-v2"
import { RequiredTileV2 } from "../nodes-v2/required-tile-v2"
import { CanvasConnectors } from "../../builder/canvas/canvas-connectors"
import { CanvasBoundary } from "../../builder/canvas/canvas-boundary"
import { CanvasFooter } from "../../builder/canvas/canvas-footer"
import { ZoomIn, ZoomOut, Maximize2, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PreviewCanvasProps {
  nodes: OrgNode[]
  connections: OrgConnection[]
  boundaries: SectionBoundary[]
  footer: OrgFooter
  selectedNodeId: string | null
  onSelectNode: (nodeId: string | null) => void
}

export function OrgChartPreviewCanvas({
  nodes,
  connections,
  boundaries,
  footer,
  selectedNodeId,
  onSelectNode,
}: PreviewCanvasProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = React.useState(0.85)
  const [pan, setPan] = React.useState({ x: 80, y: 40 })
  const [isPanning, setIsPanning] = React.useState(false)
  const [startPan, setStartPan] = React.useState({ x: 0, y: 0 })

  // Auto-fit to screen function
  const handleFitToScreen = React.useCallback(() => {
    if (!containerRef.current || nodes.length === 0) return

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    nodes.forEach((n) => {
      minX = Math.min(minX, n.position.x)
      minY = Math.min(minY, n.position.y)
      maxX = Math.max(maxX, n.position.x + (n.width || 180))
      maxY = Math.max(maxY, n.position.y + (n.height || 60))
    })

    // Include footer in bounding box
    if (footer) {
      maxY = Math.max(maxY, maxY + 250)
    }

    const pad = 80
    const boundsWidth = Math.max(maxX - minX + pad * 2, 800)
    const boundsHeight = Math.max(maxY - minY + pad * 2, 600)

    const cWidth = containerRef.current.clientWidth || 1000
    const cHeight = containerRef.current.clientHeight || 700

    const scaleX = cWidth / boundsWidth
    const scaleY = cHeight / boundsHeight
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY) * 0.9, 0.4), 1.2)

    setZoom(newZoom)
    setPan({
      x: (cWidth - (boundsWidth * newZoom)) / 2 - (minX * newZoom) + (pad * newZoom),
      y: 30 - (minY * newZoom) + (pad * newZoom * 0.5),
    })
  }, [nodes, footer])

  // Mouse pan handlers on canvas background
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if left click on canvas background
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === "svg" || (e.target as HTMLElement).id === "canvas-bg") {
      setIsPanning(true)
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      onSelectNode(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    })
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.3), 2.2))
  }

  // Find lowest node to place footer
  const lowestY = React.useMemo(() => {
    if (nodes.length === 0) return 600
    let maxY = 0
    nodes.forEach((n) => {
      maxY = Math.max(maxY, n.position.y + (n.height || 60))
    })
    return maxY + 90
  }, [nodes])

  return (
    <div
      ref={containerRef}
      id="canvas-bg"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className="relative w-full h-full overflow-hidden bg-slate-50/70 dark:bg-slate-950/70 select-none cursor-grab active:cursor-grabbing"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(148, 163, 184, 0.22) 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
    >
      {/* Floating Canvas View Controls */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 rounded-xl border border-border/80 bg-card/90 px-2.5 py-1.5 shadow-md backdrop-blur-md">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <span className="min-w-[44px] text-center font-mono text-xs font-semibold text-foreground">
          {Math.round(zoom * 100)}%
        </span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-0.5" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer gap-1"
          onClick={handleFitToScreen}
          title="Fit Chart to Viewport"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span>Fit</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer gap-1"
          onClick={() => {
            setZoom(0.85)
            setPan({ x: 80, y: 40 })
          }}
          title="Reset View"
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Reset</span>
        </Button>
      </div>

      {/* Live Preview Watermark Indicator */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          Live Preview Mode (Managed via Right Panel)
        </span>
      </div>

      {/* Scaled & Panned Canvas Viewport */}
      <div
        id="org-chart-canvas-content"
        className="absolute transform-gpu transition-transform duration-75 origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: "2800px",
          height: "2200px",
        }}
      >
        {/* 1. Section Boundaries */}
        {boundaries.map((boundary) => (
          <CanvasBoundary
            key={boundary.id}
            boundary={boundary}
            isSelected={false}
            onSelect={() => {}}
            onUpdate={() => {}}
            onDelete={() => {}}
          />
        ))}

        {/* 2. Connectors SVG Layer */}
        <CanvasConnectors
          connections={connections}
          nodes={nodes}
          selectedConnectionId={null}
          onSelectConnection={() => {}}
        />

        {/* 3. Organization Nodes Layer (Preview Only: Non-Draggable) */}
        {nodes.map((node) => {
          const isSelected = node.id === selectedNodeId

          let NodeComponent: React.ReactNode = null
          if (node.type === "EXECUTIVE" || node.type === "MANAGEMENT") {
            NodeComponent = (
              <ExecutiveTileV2
                node={node}
                isSelected={isSelected}
                onClick={() => onSelectNode(node.id)}
              />
            )
          } else if (node.type === "DEPARTMENT") {
            NodeComponent = (
              <DepartmentTileV2
                node={node}
                isSelected={isSelected}
                onClick={() => onSelectNode(node.id)}
              />
            )
          } else if (node.type === "REQUIRED_POSITION") {
            NodeComponent = (
              <RequiredTileV2
                node={node}
                isSelected={isSelected}
                onClick={() => onSelectNode(node.id)}
              />
            )
          } else {
            // Employee or Consultant
            NodeComponent = (
              <PersonTileV2
                node={node}
                isSelected={isSelected}
                onClick={() => onSelectNode(node.id)}
              />
            )
          }

          return (
            <div
              key={node.id}
              className="absolute pointer-events-auto"
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                zIndex: isSelected ? 30 : 15,
              }}
            >
              {NodeComponent}
            </div>
          )
        })}

        {/* 4. Canvas Footer Section */}
        {footer && (
          <div
            className="absolute left-8 pointer-events-auto"
            style={{
              top: `${lowestY}px`,
              width: "1550px",
              zIndex: 10,
            }}
          >
            <CanvasFooter footer={footer} onUpdate={() => {}} />
          </div>
        )}
      </div>
    </div>
  )
}
