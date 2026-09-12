"use client"

import * as React from "react"
import { GraphicFileFormat } from "@/lib/graphics-repository/types"
import { cn } from "@/lib/utils"

interface GraphicsFormatBadgeProps {
  format: GraphicFileFormat | string
  className?: string
  size?: "sm" | "md"
}

export function GraphicsFormatBadge({ format, className, size = "md" }: GraphicsFormatBadgeProps) {
  const norm = (format || "OTHER").toUpperCase()

  const formatStyles: Record<string, string> = {
    AI: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/35",
    CDR: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/35",
    PDF: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/35",
    SVG: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/35",
    PNG: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/35",
    JPG: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/35",
    JPEG: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/35",
    PPT: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/35",
    PPTX: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/35",
    EPS: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/35",
    OTHER: "bg-muted text-muted-foreground border-border",
  }

  const style = formatStyles[norm] || formatStyles.OTHER

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-bold tracking-wider rounded-md border select-none font-mono",
        size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10.5px]",
        style,
        className
      )}
    >
      {norm}
    </span>
  )
}
