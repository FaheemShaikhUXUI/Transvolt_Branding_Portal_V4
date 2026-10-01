"use client"

import * as React from "react"
import { GhostCursorState } from "@/types/eva-editor"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface EvaGhostCursorProps {
  cursorState: GhostCursorState
}

export function EvaGhostCursor({ cursorState }: EvaGhostCursorProps) {
  if (!cursorState.visible) return null

  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-500 ease-out select-none"
      style={{
        left: `${cursorState.x}px`,
        top: `${cursorState.y}px`,
        transform: "translate(-2px, -2px)",
      }}
    >
      {/* 1. Luminous Pulse Ring when Clicking */}
      {cursorState.isClicking && (
        <div className="absolute -inset-4 rounded-full border-2 border-cyan-400 bg-cyan-400/20 animate-ping pointer-events-none" />
      )}

      {/* 2. Sleek Custom AI Ghost Cursor Pointer (Cyan / Electric Blue Needle) */}
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        className={cn(
          "drop-shadow-[0_2px_12px_rgba(6,182,212,0.7)] transition-transform duration-150",
          cursorState.isClicking ? "scale-90" : "scale-100"
        )}
      >
        <path
          d="M 2 2 L 9 21 L 13 13 L 21 9 Z"
          fill="#06b6d4"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="9" r="2" fill="#ffffff" />
      </svg>

      {/* 3. Floating Agent Action Badge */}
      {cursorState.targetLabel && (
        <div className="absolute left-6 top-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-cyan-500/60 shadow-[0_4px_16px_rgba(6,182,212,0.3)] backdrop-blur-md whitespace-nowrap animate-in fade-in-50 zoom-in-95">
          <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-cyan-200">
            {cursorState.targetLabel}
          </span>
        </div>
      )}
    </div>
  )
}
