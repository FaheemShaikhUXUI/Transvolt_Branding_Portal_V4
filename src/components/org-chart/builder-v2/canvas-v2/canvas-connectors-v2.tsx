"use client"

import * as React from "react"
import { OrgConnection, OrgNode } from "@/lib/org-chart/types"
import { ChartShape } from "@/components/org-chart/builder-v2/shapes/types"

interface ConnectorsV2Props {
  connections: OrgConnection[]
  nodes: OrgNode[]
  shapes?: ChartShape[]
  selectedConnectionId?: string | null
  activeDrag?: {
    sourceId: string
    sourceAnchor: "top" | "bottom" | "left" | "right"
    currentX: number
    currentY: number
  } | null
  onSelectConnection?: (connectionId: string) => void
}

function getElementAnchorPoint(
  id: string,
  nodeMap: Map<string, OrgNode>,
  shapeMap: Map<string, ChartShape>,
  anchor: "top" | "bottom" | "left" | "right" = "bottom"
): { x: number; y: number } | null {
  const node = nodeMap.get(id)
  if (node) {
    const w = node.width || 180
    const h = node.height || 54
    switch (anchor) {
      case "top":
        return { x: node.position.x + w / 2, y: node.position.y }
      case "bottom":
        return { x: node.position.x + w / 2, y: node.position.y + h }
      case "left":
        return { x: node.position.x, y: node.position.y + h / 2 }
      case "right":
        return { x: node.position.x + w, y: node.position.y + h / 2 }
      default:
        return { x: node.position.x + w / 2, y: node.position.y + h }
    }
  }

  const shape = shapeMap.get(id)
  if (shape) {
    const w = shape.width || 120
    const h = shape.height || 80
    switch (anchor) {
      case "top":
        return { x: shape.x + w / 2, y: shape.y }
      case "bottom":
        return { x: shape.x + w / 2, y: shape.y + h }
      case "left":
        return { x: shape.x, y: shape.y + h / 2 }
      case "right":
        return { x: shape.x + w, y: shape.y + h / 2 }
      default:
        return { x: shape.x + w / 2, y: shape.y + h }
    }
  }

  return null
}

export function CanvasConnectorsV2({
  connections,
  nodes,
  shapes = [],
  selectedConnectionId,
  activeDrag,
  onSelectConnection,
}: ConnectorsV2Props) {
  const nodeMap = React.useMemo(() => {
    const map = new Map<string, OrgNode>()
    nodes.forEach((n) => map.set(n.id, n))
    return map
  }, [nodes])

  const shapeMap = React.useMemo(() => {
    const map = new Map<string, ChartShape>()
    shapes.forEach((s) => map.set(s.id, s))
    return map
  }, [shapes])

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-5 overflow-visible">
      <defs>
        {/* Default Arrowhead */}
        <marker
          id="conn-arrow-default"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748B" />
        </marker>

        {/* Selected Arrowhead */}
        <marker
          id="conn-arrow-selected"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563EB" />
        </marker>

        {/* Dragging Arrowhead */}
        <marker
          id="conn-arrow-dragging"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#16A34A" />
        </marker>
      </defs>

      {/* Render all established connections */}
      {connections.map((conn) => {
        const startPt = getElementAnchorPoint(conn.source, nodeMap, shapeMap, conn.sourceAnchor || "bottom")
        const endPt = getElementAnchorPoint(conn.target, nodeMap, shapeMap, conn.targetAnchor || "top")
        if (!startPt || !endPt) return null

        const isSelected = selectedConnectionId === conn.id
        const strokeColor = isSelected ? "#2563EB" : conn.color || "#64748B"

        let pathData = ""
        const style = (conn.type || "orthogonal").toLowerCase()

        if (style === "straight") {
          pathData = `M ${startPt.x} ${startPt.y} L ${endPt.x} ${endPt.y}`
        } else if (style === "bezier") {
          const dy = (endPt.y - startPt.y) / 2
          pathData = `M ${startPt.x} ${startPt.y} C ${startPt.x} ${startPt.y + dy}, ${endPt.x} ${endPt.y - dy}, ${endPt.x} ${endPt.y}`
        } else {
          // Orthogonal Elbow
          const midY = startPt.y + (endPt.y - startPt.y) / 2
          pathData = `M ${startPt.x} ${startPt.y} L ${startPt.x} ${midY} L ${endPt.x} ${midY} L ${endPt.x} ${endPt.y}`
        }

        return (
          <g key={conn.id} className="group">
            {/* Wide transparent hit area for easy selection */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth="16"
              className="pointer-events-auto cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onSelectConnection?.(conn.id)
              }}
            />

            {/* Visual Line */}
            <path
              d={pathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth={isSelected ? "2.5" : "1.75"}
              strokeDasharray={conn.dashed ? "5 4" : undefined}
              markerEnd={isSelected ? "url(#conn-arrow-selected)" : "url(#conn-arrow-default)"}
              className="transition-colors duration-150 pointer-events-none"
            />

            {/* Connection Label if present */}
            {conn.label && (
              <text
                x={(startPt.x + endPt.x) / 2}
                y={(startPt.y + endPt.y) / 2 - 6}
                fill="#475569"
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
                className="select-none pointer-events-none bg-white"
              >
                {conn.label}
              </text>
            )}
          </g>
        )
      })}

      {/* Render Active Dragging Preview Line */}
      {activeDrag && (
        <g className="pointer-events-none">
          {(() => {
            const startPt = getElementAnchorPoint(activeDrag.sourceId, nodeMap, shapeMap, activeDrag.sourceAnchor)
            if (!startPt) return null
            const endX = activeDrag.currentX
            const endY = activeDrag.currentY

            const midY = startPt.y + (endY - startPt.y) / 2
            const dragPath = `M ${startPt.x} ${startPt.y} L ${startPt.x} ${midY} L ${endX} ${midY} L ${endX} ${endY}`

            return (
              <path
                d={dragPath}
                fill="none"
                stroke="#16A34A"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                markerEnd="url(#conn-arrow-dragging)"
                className="animate-pulse"
              />
            )
          })()}
        </g>
      )}
    </svg>
  )
}
