"use client"

import * as React from "react"
import { OrgNode } from "@/lib/org-chart/types"
import { cn } from "@/lib/utils"

interface ExecutiveTileV2Props {
  node: OrgNode
  isSelected?: boolean
  onClick?: () => void
  onStartConnect?: (e: React.MouseEvent, nodeId: string, anchor: "top" | "bottom" | "left" | "right") => void
}

export function ExecutiveTileV2({
  node,
  isSelected,
  onClick,
  onStartConnect,
}: ExecutiveTileV2Props) {
  const [hovered, setHovered] = React.useState(false)
  const designation = node.metadata.designation || "Executive Leadership"

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
        "group relative select-none rounded-xl bg-slate-900 border border-slate-700 text-white px-4 py-2.5 transition-all duration-150 flex flex-col justify-center items-center cursor-pointer shadow-md min-w-[190px] max-w-[250px] min-h-[52px] hover:shadow-xl hover:border-slate-500",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]"
      )}
      title={`${node.label} • ${designation}`}
    >
      {(hovered || isSelected) && onStartConnect && (
        <>
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onStartConnect(e, node.id, "top")
            }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-blue-400 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125"
            title="Drag to connect"
          >
            <span className="h-1 w-1 rounded-full bg-white" />
          </div>
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onStartConnect(e, node.id, "bottom")
            }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-blue-400 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125"
            title="Drag to connect"
          >
            <span className="h-1 w-1 rounded-full bg-white" />
          </div>
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onStartConnect(e, node.id, "left")
            }}
            className="absolute top-1/2 -left-2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-blue-400 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125"
            title="Drag to connect"
          >
            <span className="h-1 w-1 rounded-full bg-white" />
          </div>
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onStartConnect(e, node.id, "right")
            }}
            className="absolute top-1/2 -right-2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-blue-400 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125"
            title="Drag to connect"
          >
            <span className="h-1 w-1 rounded-full bg-white" />
          </div>
        </>
      )}

      <div className="font-bold text-xs sm:text-[13px] text-center text-white leading-snug">
        {node.label}
      </div>
      <div className="text-[11px] text-slate-300 font-normal mt-0.5 text-center">
        {designation}
      </div>
    </div>
  )
}
