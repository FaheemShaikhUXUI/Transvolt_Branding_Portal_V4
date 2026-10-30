"use client"

import * as React from "react"
import { OrgNode } from "@/lib/org-chart/types"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, Users, Plus } from "lucide-react"

interface DepartmentTileV2Props {
  node: OrgNode
  childCount?: number
  isCollapsed?: boolean
  isSelected?: boolean
  onClick?: () => void
  onToggleCollapse?: (e: React.MouseEvent) => void
  onStartConnect?: (e: React.MouseEvent, nodeId: string, anchor: "top" | "bottom" | "left" | "right") => void
}

export function DepartmentTileV2({
  node,
  childCount = 0,
  isCollapsed = false,
  isSelected,
  onClick,
  onToggleCollapse,
  onStartConnect,
}: DepartmentTileV2Props) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: node.metadata.bgColor || undefined,
        borderColor: node.metadata.color || undefined,
        color: node.metadata.textColor || undefined,
        width: node.width ? `${node.width}px` : undefined,
        maxWidth: node.width ? `${node.width}px` : undefined,
        minWidth: node.width ? `${node.width}px` : undefined,
        height: node.height ? `${node.height}px` : undefined,
        minHeight: node.height ? `${node.height}px` : undefined,
      }}
      className={cn(
        "group relative select-none rounded-xl bg-[#1e40af] text-white px-3.5 py-2.5 transition-all duration-150 flex flex-col justify-center items-center cursor-pointer shadow-md min-w-[175px] max-w-[230px] min-h-[48px] border border-blue-900 hover:shadow-lg hover:border-blue-700",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]"
      )}
      title={node.label}
    >
      {/* Drag-to-connect anchor points (Visible on hover or selection) */}
      {(hovered || isSelected) && onStartConnect && (
        <>
          {/* Top Anchor */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onStartConnect(e, node.id, "top")
            }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-blue-500 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125 transition-transform"
            title="Drag to connect"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>

          {/* Bottom Anchor */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onStartConnect(e, node.id, "bottom")
            }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-blue-500 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125 transition-transform"
            title="Drag to connect"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>

          {/* Left Anchor */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onStartConnect(e, node.id, "left")
            }}
            className="absolute top-1/2 -left-2 -translate-y-1/2 h-4 w-4 rounded-full bg-blue-500 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125 transition-transform"
            title="Drag to connect"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>

          {/* Right Anchor */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onStartConnect(e, node.id, "right")
            }}
            className="absolute top-1/2 -right-2 -translate-y-1/2 h-4 w-4 rounded-full bg-blue-500 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125 transition-transform"
            title="Drag to connect"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
        </>
      )}

      {/* Main Department Label */}
      <div className="font-bold text-xs sm:text-[13px] text-center text-white tracking-wide leading-snug">
        {node.label}
      </div>

      {node.metadata.departmentCode && (
        <div className="text-[10px] text-blue-200 mt-0.5 font-medium tracking-wider">
          {node.metadata.departmentCode}
        </div>
      )}

      {/* Accordion Expand/Collapse Badge if node has child nodes */}
      {childCount > 0 && onToggleCollapse && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleCollapse(e)
          }}
          className={cn(
            "mt-1.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-all cursor-pointer",
            isCollapsed
              ? "bg-amber-400 text-slate-900 hover:bg-amber-300 shadow-xs"
              : "bg-blue-900/80 text-blue-100 hover:bg-blue-800"
          )}
          title={isCollapsed ? `Expand ${childCount} members` : "Collapse branch"}
        >
          {isCollapsed ? (
            <>
              <ChevronRight className="h-3 w-3" />
              <span>+{childCount} staff</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              <span>{childCount} team</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
