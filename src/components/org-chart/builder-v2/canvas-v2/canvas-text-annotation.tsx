"use client"

import * as React from "react"
import { TextAnnotation } from "@/lib/org-chart/types"
import { cn } from "@/lib/utils"

interface CanvasTextAnnotationProps {
  annotation: TextAnnotation
  isSelected?: boolean
  onSelect?: () => void
  onUpdate?: (updated: Partial<TextAnnotation>) => void
}

export function CanvasTextAnnotation({
  annotation,
  isSelected,
  onSelect,
  onUpdate,
}: CanvasTextAnnotationProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [text, setText] = React.useState(annotation.text)

  React.useEffect(() => {
    setText(annotation.text)
  }, [annotation.text])

  const hasBorder =
    annotation.borderStyle &&
    annotation.borderStyle !== "none" &&
    annotation.borderColor &&
    annotation.borderColor !== "transparent"

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.()
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        setIsEditing(true)
      }}
      className={cn(
        "group absolute select-none transition-none cursor-move z-15 hover:outline-1 hover:outline-dashed hover:outline-primary/40",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-md"
      )}
      style={{
        left: `${annotation.position.x}px`,
        top: `${annotation.position.y}px`,
        width: annotation.width ? `${annotation.width}px` : "auto",
        maxWidth: "480px",
        backgroundColor: annotation.bgColor || "transparent",
        borderColor: hasBorder ? annotation.borderColor : "transparent",
        borderWidth: hasBorder ? `${annotation.borderWidth || 1}px` : "0",
        borderStyle: (annotation.borderStyle as any) || "none",
        borderRadius: annotation.borderRadius !== undefined ? `${annotation.borderRadius}px` : "6px",
        padding: annotation.padding !== undefined ? `${annotation.padding}px` : "4px 8px",
        color: annotation.color || "#0f172a",
        fontFamily: annotation.fontFamily || "inherit",
        fontSize: annotation.fontSize ? `${annotation.fontSize}px` : "13px",
        fontWeight: annotation.fontWeight || "500",
        fontStyle: annotation.fontStyle || "normal",
        textDecoration: annotation.textDecoration || "none",
        textAlign: annotation.textAlign || "left",
        lineHeight: annotation.lineHeight ? `${annotation.lineHeight}` : "1.4",
        letterSpacing: annotation.letterSpacing !== undefined ? `${annotation.letterSpacing}px` : "normal",
        textTransform: annotation.textTransform || "none",
      }}
    >
      {isEditing ? (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            setIsEditing(false)
            onUpdate?.({ text })
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsEditing(false)
            }
          }}
          className="w-full min-h-[60px] bg-background/95 border border-primary p-2 rounded-md text-xs focus:outline-none resize-none shadow-sm"
          style={{
            fontFamily: annotation.fontFamily || "inherit",
            fontSize: annotation.fontSize ? `${annotation.fontSize}px` : "13px",
            color: annotation.color || "#0f172a",
          }}
        />
      ) : (
        <div className="whitespace-pre-wrap select-text">
          {annotation.text || "Double click to edit note..."}
        </div>
      )}
    </div>
  )
}
