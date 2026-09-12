"use client"

import * as React from "react"
import { OrgConnection, OrgNode } from "@/lib/org-chart/types"

interface ConnectorsProps {
  connections: OrgConnection[]
  nodes: OrgNode[]
  selectedConnectionId?: string | null
  onSelectConnection?: (connectionId: string) => void
  onDeleteConnection?: (connectionId: string) => void
}

export function CanvasConnectors({
  connections,
  nodes,
  selectedConnectionId,
  onSelectConnection,
  onDeleteConnection,
}: ConnectorsProps) {
  const nodeMap = React.useMemo(() => {
    const map = new Map<string, OrgNode>()
    nodes.forEach((n) => map.set(n.id, n))
    return map
  }, [nodes])

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-5 overflow-visible">
      <defs>
        <marker
          id="org-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748B" />
        </marker>
        <marker
          id="org-arrow-selected"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563EB" />
        </marker>
      </defs>

      {connections.map((conn) => {
        const sourceNode = nodeMap.get(conn.source)
        const targetNode = nodeMap.get(conn.target)
        if (!sourceNode || !targetNode) return null

        const sx = sourceNode.position.x + (sourceNode.width || 190) / 2
        const sy = sourceNode.position.y + (sourceNode.height || 60)
        const tx = targetNode.position.x + (targetNode.width || 190) / 2
        const ty = targetNode.position.y

        // Compute orthogonal elbow path
        const midY = sy + (ty - sy) / 2
        const pathData = `M ${sx} ${sy} L ${sx} ${midY} L ${tx} ${midY} L ${tx} ${ty}`

        const isSelected = selectedConnectionId === conn.id

        return (
          <g key={conn.id} className="group">
            {/* Wider transparent stroke for easy clicking */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth="14"
              className="pointer-events-auto cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onSelectConnection?.(conn.id)
              }}
            />
            {/* Visual line */}
            <path
              d={pathData}
              fill="none"
              stroke={isSelected ? "#2563EB" : conn.color || "#64748B"}
              strokeWidth={isSelected ? "2.5" : "1.5"}
              strokeDasharray={conn.dashed ? "4 4" : undefined}
              markerEnd={isSelected ? "url(#org-arrow-selected)" : "url(#org-arrow)"}
              className="transition-colors duration-200 pointer-events-none"
            />
          </g>
        )
      })}
    </svg>
  )
}
