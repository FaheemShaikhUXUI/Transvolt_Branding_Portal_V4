"use client"

import * as React from "react"
import { OrgNode } from "@/lib/org-chart/types"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, UserCheck } from "lucide-react"

interface PersonTileV2Props {
  node: OrgNode
  childCount?: number
  isCollapsed?: boolean
  isSelected?: boolean
  onClick?: () => void
  onToggleCollapse?: (e: React.MouseEvent) => void
  onStartConnect?: (e: React.MouseEvent, nodeId: string, anchor: "top" | "bottom" | "left" | "right") => void
}

export function PersonTileV2({
  node,
  childCount = 0,
  isCollapsed = false,
  isSelected,
  onClick,
  onToggleCollapse,
  onStartConnect,
}: PersonTileV2Props) {
  const [hovered, setHovered] = React.useState(false)
  const isConsultant = node.metadata.employmentType === "CONSULTANT" || node.type === "CONSULTANT"
  const isHod = node.metadata.employmentType === "HOD" || node.type === "HOD"
  const designation = node.metadata.designation || (isHod ? "Head of Department" : isConsultant ? "Consultant" : "Staff Member")

  // Default color schemes when not overridden by inspector metadata
  const defaultBg = isHod ? "#15803d" : isConsultant ? "#ea580c" : "#ffffff"
  const defaultBorder = isHod ? "#166534" : isConsultant ? "#c2410c" : "#94a3b8"
  const defaultTextColor = (isHod || isConsultant) ? "#ffffff" : "#0f172a"

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: node.metadata.bgColor || defaultBg,
        borderColor: node.metadata.color || defaultBorder,
        color: node.metadata.textColor || defaultTextColor,
        width: node.width ? `${node.width}px` : undefined,
        maxWidth: node.width ? `${node.width}px` : undefined,
        minWidth: node.width ? `${node.width}px` : undefined,
        height: node.height ? `${node.height}px` : undefined,
        minHeight: node.height ? `${node.height}px` : undefined,
      }}
      className={cn(
        "group relative select-none rounded-xl px-3.5 py-2 transition-all duration-150 flex flex-col justify-center cursor-pointer shadow-xs min-w-[165px] max-w-[210px] min-h-[54px] hover:shadow-md border-2",
        // Fallback border styles if metadata color is not specified
        !node.metadata.color && (
          isHod
            ? "border-[#166534]"
            : isConsultant
            ? "border-[#c2410c]"
            : "border-slate-300 dark:border-slate-600"
        ),
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]"
      )}
      title={`${node.label} • ${designation} (${isHod ? "Head of Department" : isConsultant ? "Consultant" : "Employee"})`}
    >
      {/* Drag-to-connect anchor points (Visible on hover or selection) */}
      {(hovered || isSelected) && onStartConnect && (
        <>
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onStartConnect(e, node.id, "top")
            }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-slate-700 dark:bg-slate-200 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125 transition-transform"
            title="Drag to connect"
          >
            <span className="h-1 w-1 rounded-full bg-white dark:bg-slate-900" />
          </div>

          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onStartConnect(e, node.id, "bottom")
            }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-slate-700 dark:bg-slate-200 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125 transition-transform"
            title="Drag to connect"
          >
            <span className="h-1 w-1 rounded-full bg-white dark:bg-slate-900" />
          </div>

          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onStartConnect(e, node.id, "left")
            }}
            className="absolute top-1/2 -left-2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-slate-700 dark:bg-slate-200 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125 transition-transform"
            title="Drag to connect"
          >
            <span className="h-1 w-1 rounded-full bg-white dark:bg-slate-900" />
          </div>

          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onStartConnect(e, node.id, "right")
            }}
            className="absolute top-1/2 -right-2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-slate-700 dark:bg-slate-200 border-2 border-white cursor-crosshair z-30 flex items-center justify-center hover:scale-125 transition-transform"
            title="Drag to connect"
          >
            <span className="h-1 w-1 rounded-full bg-white dark:bg-slate-900" />
          </div>
        </>
      )}

      {/* Top Header: Name & Type Indicator Dot */}
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        <div
          className="font-bold text-xs sm:text-[13px] truncate text-left leading-tight"
          style={{ color: node.metadata.textColor || defaultTextColor }}
        >
          {node.label}
        </div>
        <span
          className={cn(
            "h-2 w-2 rounded-full shrink-0",
            isHod ? "bg-emerald-300" : isConsultant ? "bg-[#fed7aa]" : "bg-slate-400"
          )}
          title={isHod ? "Head of Department" : isConsultant ? "Consultant" : "Employee"}
        />
      </div>

      {/* Thin Designation */}
      <div
        className="font-normal text-[11px] truncate text-left mt-0.5 leading-tight"
        style={{
          color: node.metadata.textColor
            ? undefined
            : isHod
            ? "#bbf7d0"
            : isConsultant
            ? "#fed7aa"
            : undefined,
        }}
      >
        {designation}
      </div>

      {/* Accordion Expand/Collapse Badge if node has child reports */}
      {childCount > 0 && onToggleCollapse && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleCollapse(e)
          }}
          className={cn(
            "mt-1.5 self-start flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-all cursor-pointer",
            isCollapsed
              ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 hover:bg-amber-200"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
          title={isCollapsed ? `Expand ${childCount} reports` : "Collapse reports"}
        >
          {isCollapsed ? (
            <>
              <ChevronRight className="h-3 w-3" />
              <span>+{childCount} reports</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              <span>{childCount} reports</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
