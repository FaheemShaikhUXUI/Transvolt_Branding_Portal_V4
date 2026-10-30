"use client"

import * as React from "react"
import { SHAPE_REGISTRY, SHAPE_CATEGORIES } from "./registry"
import { ShapeIconPreview } from "./geometry"
import { ShapeKind, ShapeCategory } from "./types"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ShapesLibraryPopoverProps {
  isOpen: boolean
  onClose: () => void
  onSelectShape: (kind: ShapeKind) => void
}

export function ShapesLibraryPopover({
  isOpen,
  onClose,
  onSelectShape,
}: ShapesLibraryPopoverProps) {
  const [search, setSearch] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All")

  if (!isOpen) return null

  const filteredShapes = SHAPE_REGISTRY.filter((shape) => {
    const matchesSearch =
      shape.label.toLowerCase().includes(search.toLowerCase()) ||
      shape.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      selectedCategory === "All" || shape.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div
      className="absolute left-[62px] top-12 z-50 w-80 max-h-[520px] flex flex-col rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 select-none text-foreground"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-3 border-b border-border/80 flex items-center justify-between gap-2 bg-muted/40">
        <div>
          <h3 className="text-xs font-bold text-foreground">Shapes Library</h3>
          <p className="text-[10px] text-muted-foreground">Flowcharts, connectors & basic symbols</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="px-3 py-2 border-b border-border/60">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 35+ shapes..."
            className="h-8 pl-8 text-xs bg-background rounded-lg border-border/80"
            autoFocus
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-3 py-1.5 border-b border-border/60 flex items-center gap-1 overflow-x-auto no-scrollbar bg-muted/20">
        {["All", ...SHAPE_CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all shrink-0 cursor-pointer",
              selectedCategory === cat
                ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Shapes Grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-3 gap-2 max-h-[340px]">
        {filteredShapes.length === 0 ? (
          <div className="col-span-3 py-8 text-center text-xs text-muted-foreground">
            No shapes match &quot;{search}&quot;
          </div>
        ) : (
          filteredShapes.map((shape) => (
            <button
              key={shape.kind}
              type="button"
              onClick={() => {
                onSelectShape(shape.kind)
                onClose()
              }}
              className="flex flex-col items-center justify-center p-2 rounded-lg border border-border/70 bg-card hover:bg-blue-50/70 dark:hover:bg-blue-950/30 hover:border-blue-400 transition-all cursor-pointer group hover:scale-[1.03] shadow-2xs"
              title={shape.description}
            >
              <div className="h-9 w-14 flex items-center justify-center mb-1 transition-transform group-hover:scale-105">
                <ShapeIconPreview kind={shape.kind} className="max-h-8 max-w-12" />
              </div>
              <span className="text-[10px] font-medium text-foreground text-center truncate w-full group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {shape.label}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
