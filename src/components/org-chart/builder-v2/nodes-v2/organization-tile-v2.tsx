"use client"

import * as React from "react"
import { OrgNode } from "@/lib/org-chart/types"
import { cn } from "@/lib/utils"
import { Building2 } from "lucide-react"

interface OrganizationTileV2Props {
  node: OrgNode
  isSelected?: boolean
  onClick?: () => void
  onStartConnect?: (e: React.MouseEvent, nodeId: string, anchor: "top" | "bottom" | "left" | "right") => void
}

export function OrganizationTileV2({
  node,
  isSelected,
  onClick,
  onStartConnect,
}: OrganizationTileV2Props) {
  const [hovered, setHovered] = React.useState(false)
  const bgColor = node.metadata.bgColor || "#c2410c"
  const borderColor = node.metadata.color || "#9a3412"
  const textColor = node.metadata.textColor || "#ffffff"

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        color: textColor,
        width: node.width ? `${node.width}px` : undefined,
        maxWidth: node.width ? `${node.width}px` : undefined,
        minWidth: node.width ? `${node.width}px` : undefined,
        height: node.height ? `${node.height}px` : undefined,
        minHeight: node.height ? `${node.height}px` : undefined,
      }}
      className={cn(
        "group relative select-none rounded-xl px-4 py-3 transition-all duration-150 flex flex-col justify-center items-center cursor-pointer shadow-md min-w-[200px] max-w-[260px] min-h-[56px] border-2 hover:shadow-xl hover:brightness-105",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]"
      )}
      title={`${node.label} • Organization`}
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
            className="absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-orange-600 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125 transition-transform shadow-xs"
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
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-orange-600 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125 transition-transform shadow-xs"
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
            className="absolute top-1/2 -left-2 -translate-y-1/2 h-4 w-4 rounded-full bg-orange-600 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125 transition-transform shadow-xs"
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
            className="absolute top-1/2 -right-2 -translate-y-1/2 h-4 w-4 rounded-full bg-orange-600 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125 transition-transform shadow-xs"
            title="Drag to connect"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
        </>
      )}

      {/* Main Organization Label */}
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 opacity-90 shrink-0" />
        <span className="font-extrabold text-xs sm:text-[13px] text-center tracking-wide leading-snug">
          {node.label}
        </span>
      </div>

      {node.metadata.code && (
        <div className="text-[10px] opacity-80 mt-0.5 font-semibold tracking-wider uppercase">
          {node.metadata.code}
        </div>
      )}
    </div>
  )
}
