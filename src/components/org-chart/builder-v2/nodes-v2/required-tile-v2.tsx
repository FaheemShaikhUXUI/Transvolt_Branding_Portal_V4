"use client"

import * as React from "react"
import { OrgNode } from "@/lib/org-chart/types"
import { cn } from "@/lib/utils"

interface RequiredTileV2Props {
  node: OrgNode
  isSelected?: boolean
  onClick?: () => void
  onStartConnect?: (e: React.MouseEvent, nodeId: string, anchor: "top" | "bottom" | "left" | "right") => void
}

export function RequiredTileV2({
  node,
  isSelected,
  onClick,
  onStartConnect,
}: RequiredTileV2Props) {
  const [hovered, setHovered] = React.useState(false)
  const quantity = node.metadata.requiredQuantity || 1
  const designation = node.metadata.designation || node.label

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
        "group relative select-none rounded-xl bg-card/90 border-2 border-dashed border-slate-400 dark:border-slate-600 px-3.5 py-2 transition-all duration-150 flex flex-col justify-center cursor-pointer shadow-xs min-w-[165px] max-w-[210px] min-h-[54px] hover:border-slate-600 dark:hover:border-slate-400 hover:shadow-md",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]"
      )}
      title={`Vacancy: ${designation} (Required Quantity: ${quantity})`}
    >
      {(hovered || isSelected) && onStartConnect && (
        <>
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onStartConnect(e, node.id, "top")
            }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-slate-500 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125"
            title="Drag to connect"
          >
            <span className="h-1 w-1 rounded-full bg-white" />
          </div>
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onStartConnect(e, node.id, "bottom")
            }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-slate-500 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125"
            title="Drag to connect"
          >
            <span className="h-1 w-1 rounded-full bg-white" />
          </div>
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onStartConnect(e, node.id, "left")
            }}
            className="absolute top-1/2 -left-2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-slate-500 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125"
            title="Drag to connect"
          >
            <span className="h-1 w-1 rounded-full bg-white" />
          </div>
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onStartConnect(e, node.id, "right")
            }}
            className="absolute top-1/2 -right-2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-slate-500 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125"
            title="Drag to connect"
          >
            <span className="h-1 w-1 rounded-full bg-white" />
          </div>
        </>
      )}

      <div className="font-semibold text-xs sm:text-[13px] text-foreground truncate text-left flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full border border-slate-500 bg-slate-200 dark:bg-slate-700 shrink-0" />
        <span className="truncate">{designation}</span>
      </div>
      <div className="text-[11px] text-muted-foreground font-medium text-left mt-0.5">
        Required: <strong className="text-foreground font-bold">{quantity}</strong>
      </div>
    </div>
  )
}
