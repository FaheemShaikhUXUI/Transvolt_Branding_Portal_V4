"use client"

import * as React from "react"
import { SectionBoundary } from "@/lib/org-chart/types"
import { Trash2, Edit2, Move } from "lucide-react"
import { cn } from "@/lib/utils"

interface BoundaryProps {
  boundary: SectionBoundary
  isSelected: boolean
  onSelect: (boundary: SectionBoundary, e: React.MouseEvent) => void
  onUpdate: (boundary: SectionBoundary) => void
  onDelete: (boundaryId: string) => void
}

export function CanvasBoundary({
  boundary,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: BoundaryProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [title, setTitle] = React.useState(boundary.title)

  const handleTitleSubmit = () => {
    setIsEditing(false)
    if (title.trim() && title !== boundary.title) {
      onUpdate({ ...boundary, title: title.trim() })
    }
  }

  return (
    <div
      onClick={(e) => onSelect(boundary, e)}
      className={cn(
        "group absolute rounded-2xl border-2 border-dashed transition-all pointer-events-none z-1 select-none",
        "bg-slate-500/5 dark:bg-slate-400/5 border-slate-300 dark:border-slate-700",
        isSelected && "border-[#4472C4] ring-2 ring-[#4472C4]/30 shadow-sm"
      )}
      style={{
        left: boundary.position.x,
        top: boundary.position.y,
        width: boundary.width,
        height: boundary.height,
      }}
    >
      {/* Title Header Badge - pointer-events-auto so user can click to select or edit */}
      <div className="absolute top-2.5 left-4 flex items-center gap-2 pointer-events-auto">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
            autoFocus
            className="text-xs font-black uppercase tracking-wider bg-background border px-2 py-0.5 rounded shadow-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        ) : (
          <span
            onDoubleClick={() => setIsEditing(true)}
            className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-background/80 dark:bg-card/80 px-2.5 py-1 rounded-md border border-border/60 backdrop-blur-xs cursor-text"
          >
            {boundary.title}
          </span>
        )}

        {/* Boundary Controls */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-background/90 border border-border/60 rounded-md px-1 py-0.5 shadow-xs">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground"
            title="Edit Title"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(boundary.id)
            }}
            className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-destructive"
            title="Delete Section Boundary"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
