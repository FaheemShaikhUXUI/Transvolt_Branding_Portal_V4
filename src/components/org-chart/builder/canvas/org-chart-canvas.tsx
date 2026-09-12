"use client"

import * as React from "react"
import { OrgNode, OrgConnection, SectionBoundary, OrgFooter, CanvasPosition } from "@/lib/org-chart/types"
import { ExecutiveNode } from "../nodes/executive-node"
import { DepartmentNode } from "../nodes/department-node"
import { EmployeeNode } from "../nodes/employee-node"
import { ConsultantNode } from "../nodes/consultant-node"
import { RequiredPositionNode } from "../nodes/required-position-node"
import { CanvasConnectors } from "./canvas-connectors"
import { CanvasBoundary } from "./canvas-boundary"
import { CanvasFooter } from "./canvas-footer"
import { CanvasToolbar } from "./canvas-toolbar"
import { cn } from "@/lib/utils"

interface CanvasProps {
  nodes: OrgNode[]
  connections: OrgConnection[]
  boundaries: SectionBoundary[]
  footer: OrgFooter
  selectedNodeId: string | null
  selectedBoundaryId: string | null
  selectedConnectionId: string | null
  gridSnap?: boolean
  showPrintBounds?: boolean
  canUndo: boolean
  canRedo: boolean
  onSelectNode: (node: OrgNode | null) => void
  onSelectBoundary: (boundary: SectionBoundary | null) => void
  onSelectConnection: (connectionId: string | null) => void
  onUpdateNodePosition: (nodeId: string, newPos: CanvasPosition) => void
  onUpdateBoundary: (boundary: SectionBoundary) => void
  onDeleteBoundary: (boundaryId: string) => void
  onUpdateFooter: (footer: OrgFooter) => void
  onAutoArrange: () => void
  onUndo: () => void
  onRedo: () => void
  onEditNode?: (node: OrgNode) => void
  onChangeParent?: (node: OrgNode) => void
  onDuplicateNode?: (node: OrgNode) => void
  onDeleteNode?: (node: OrgNode) => void
  onConnectNode?: (node: OrgNode) => void
  onAddEmployeeToDept?: (deptId: string) => void
  onAddChildDept?: (parentId: string) => void
}

export function OrgChartCanvas({
  nodes,
  connections,
  boundaries,
  footer,
  selectedNodeId,
  selectedBoundaryId,
  selectedConnectionId,
  gridSnap = true,
  showPrintBounds = true,
  canUndo,
  canRedo,
  onSelectNode,
  onSelectBoundary,
  onSelectConnection,
  onUpdateNodePosition,
  onUpdateBoundary,
  onDeleteBoundary,
  onUpdateFooter,
  onAutoArrange,
  onUndo,
  onRedo,
  onEditNode,
  onChangeParent,
  onDuplicateNode,
  onDeleteNode,
  onConnectNode,
  onAddEmployeeToDept,
  onAddChildDept,
}: CanvasProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Pan & Zoom state
  const [zoom, setZoom] = React.useState(0.85)
  const [pan, setPan] = React.useState<CanvasPosition>({ x: 40, y: 30 })
  const [isPanning, setIsPanning] = React.useState(false)
  const [startPan, setStartPan] = React.useState<CanvasPosition>({ x: 0, y: 0 })
  const [activeGridSnap, setActiveGridSnap] = React.useState(gridSnap)
  const [activePrintBounds, setActivePrintBounds] = React.useState(showPrintBounds)

  // Dragging node state
  const [draggingNodeId, setDraggingNodeId] = React.useState<string | null>(null)
  const [dragOffset, setDragOffset] = React.useState<CanvasPosition>({ x: 0, y: 0 })

  // Handle Zoom Wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.05 : 0.05
      setZoom((prev) => Math.min(2.0, Math.max(0.25, Number((prev + delta).toFixed(2)))))
    } else {
      // Regular scroll pans vertically/horizontally
      setPan((prev) => ({
        x: prev.x - e.deltaX * 0.8,
        y: prev.y - e.deltaY * 0.8,
      }))
    }
  }

  // Handle Pan start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.target === containerRef.current)) {
      setIsPanning(true)
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      onSelectNode(null)
      onSelectBoundary(null)
      onSelectConnection(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      })
      return
    }

    if (draggingNodeId) {
      // Calculate canvas coordinates
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseCanvasX = (e.clientX - rect.left - pan.x) / zoom
      const mouseCanvasY = (e.clientY - rect.top - pan.y) / zoom

      let rawX = mouseCanvasX - dragOffset.x
      let rawY = mouseCanvasY - dragOffset.y

      // Snap to 10px grid if enabled
      if (activeGridSnap) {
        rawX = Math.round(rawX / 10) * 10
        rawY = Math.round(rawY / 10) * 10
      }

      onUpdateNodePosition(draggingNodeId, { x: rawX, y: rawY })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
    setDraggingNodeId(null)
  }

  const startDraggingNode = (node: OrgNode, e: React.MouseEvent) => {
    e.stopPropagation()
    onSelectNode(node)
    setDraggingNodeId(node.id)

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseCanvasX = (e.clientX - rect.left - pan.x) / zoom
    const mouseCanvasY = (e.clientY - rect.top - pan.y) / zoom

    setDragOffset({
      x: mouseCanvasX - node.position.x,
      y: mouseCanvasY - node.position.y,
    })
  }

  const handleZoomIn = () => setZoom((z) => Math.min(2.0, Number((z + 0.1).toFixed(2))))
  const handleZoomOut = () => setZoom((z) => Math.max(0.25, Number((z - 0.1).toFixed(2))))
  const handleResetZoom = () => {
    setZoom(1.0)
    setPan({ x: 60, y: 40 })
  }
  const handleFitToScreen = () => {
    if (!containerRef.current) return
    const { clientWidth, clientHeight } = containerRef.current
    // Calculate bounding box of nodes
    let maxX = 1600
    let maxY = 1100
    nodes.forEach((n) => {
      maxX = Math.max(maxX, n.position.x + (n.width || 200) + 80)
      maxY = Math.max(maxY, n.position.y + (n.height || 64) + 80)
    })
    const scaleX = (clientWidth - 80) / maxX
    const scaleY = (clientHeight - 80) / maxY
    const newZoom = Math.min(1.1, Math.max(0.3, Math.min(scaleX, scaleY)))
    setZoom(Number(newZoom.toFixed(2)))
    setPan({ x: 40, y: 30 })
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted/20 dark:bg-muted/10">
      {/* Floating Canvas Toolbar */}
      <div className="absolute top-4 left-4 z-30">
        <CanvasToolbar
          zoom={zoom}
          canUndo={canUndo}
          canRedo={canRedo}
          gridSnap={activeGridSnap}
          showPrintBounds={activePrintBounds}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onFitToScreen={handleFitToScreen}
          onUndo={onUndo}
          onRedo={onRedo}
          onAutoArrange={onAutoArrange}
          onToggleGrid={() => setActiveGridSnap((g) => !g)}
          onTogglePrintBounds={() => setActivePrintBounds((p) => !p)}
        />
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={cn(
          "w-full h-full cursor-crosshair active:cursor-grabbing relative overflow-hidden select-none",
          activeGridSnap && "bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)]"
        )}
      >
        {/* World Transform Layer (Panning & Zooming applied here) */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            transition: draggingNodeId ? "none" : "transform 0.05s ease-out",
          }}
          className="absolute inset-0 w-[3000px] h-[2200px]"
        >
          {/* Print Area Boundary Box (A3 Landscape: ~1650px x 1150px) */}
          {activePrintBounds && (
            <div className="absolute top-0 left-0 w-[1680px] h-[1200px] border-2 border-[#548235]/40 rounded-2xl pointer-events-none bg-background/5 shadow-inner">
              <div className="absolute top-2 right-4 flex items-center gap-1.5 text-[10px] font-bold text-[#548235] uppercase tracking-widest bg-background/90 px-2 py-0.5 rounded border border-[#548235]/30">
                A3 Landscape Print Area
              </div>
            </div>
          )}

          {/* Section Boundaries */}
          {boundaries.map((b) => (
            <CanvasBoundary
              key={b.id}
              boundary={b}
              isSelected={selectedBoundaryId === b.id}
              onSelect={(boundary) => {
                onSelectBoundary(boundary)
                onSelectNode(null)
              }}
              onUpdate={onUpdateBoundary}
              onDelete={onDeleteBoundary}
            />
          ))}

          {/* Connectors (SVG Orthogonal Lines) */}
          <CanvasConnectors
            connections={connections}
            nodes={nodes}
            selectedConnectionId={selectedConnectionId}
            onSelectConnection={onSelectConnection}
          />

          {/* Nodes Layer */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id

            const nodeProps = {
              node,
              isSelected,
              onSelect: (n: OrgNode, e: React.MouseEvent) => startDraggingNode(n, e),
              onEdit: onEditNode,
              onChangeParent,
              onDuplicate: onDuplicateNode,
              onDelete: onDeleteNode,
              onConnect: onConnectNode,
              onAddEmployee: onAddEmployeeToDept,
              onAddChildDept,
            }

            let Component = EmployeeNode
            if (node.type === "EXECUTIVE" || node.type === "MANAGEMENT") {
              Component = ExecutiveNode
            } else if (node.type === "DEPARTMENT") {
              Component = DepartmentNode
            } else if (node.type === "CONSULTANT") {
              Component = ConsultantNode
            } else if (node.type === "REQUIRED_POSITION") {
              Component = RequiredPositionNode
            }

            return (
              <div
                key={node.id}
                style={{
                  position: "absolute",
                  left: node.position.x,
                  top: node.position.y,
                  zIndex: isSelected ? 25 : 15,
                }}
              >
                <Component {...nodeProps} />
              </div>
            )
          })}

          {/* Structured Footer */}
          {footer.enabled && (
            <div
              style={{
                position: "absolute",
                top: Math.max(...nodes.map((n) => n.position.y + (n.height || 64)), 900) + 40,
                left: 40,
                width: 1540,
                zIndex: 10,
              }}
            >
              <CanvasFooter footer={footer} isEditable={true} onUpdateFooter={onUpdateFooter} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
