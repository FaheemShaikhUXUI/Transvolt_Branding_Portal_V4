"use client"

import * as React from "react"
import {
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  AlertCircle,
  FileCheck2,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface UploadItemProgress {
  id: string
  name: string
  size: string
  format: string
  progress: number // 0 to 100
  status: "pending" | "uploading" | "completed" | "error"
}

interface UploadProgressWidgetProps {
  isOpen: boolean
  items: UploadItemProgress[]
  overallProgress: number
  onClose: () => void
}

export function UploadProgressWidget({
  isOpen,
  items,
  overallProgress,
  onClose,
}: UploadProgressWidgetProps) {
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  const isComplete =
    items.length > 0 && items.every((i) => i.status === "completed")
  const completedCount = items.filter((i) => i.status === "completed").length
  const totalCount = items.length

  // Auto-close 6 seconds after completion unless hovered
  React.useEffect(() => {
    if (!isComplete || isHovered || !isOpen) return
    const timer = setTimeout(() => {
      onClose()
    }, 6000)
    return () => clearTimeout(timer)
  }, [isComplete, isHovered, isOpen, onClose])

  if (!isOpen || items.length === 0) return null

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        boxShadow: "0 20px 40px -8px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1)",
      }}
      aria-label="Upload status"
      className="w-[340px] sm:w-[380px] max-w-[calc(100vw-48px)] bg-card/95 dark:bg-card/90 backdrop-blur-xl border border-border/90 rounded-2xl overflow-hidden transition-all duration-300"
    >
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3.5 py-3 bg-muted/40 border-b border-border/60 select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          {isComplete ? (
            <div className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          ) : (
            <div className="h-7 w-7 rounded-lg bg-emerald-600/15 text-emerald-600 flex items-center justify-center shrink-0">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground truncate">
                {isComplete
                  ? `Upload complete`
                  : totalCount > 1
                  ? `Uploading ${Math.min(completedCount + 1, totalCount)} of ${totalCount} files`
                  : `Uploading 1 file...`}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {isComplete ? `${totalCount}/${totalCount}` : `${Math.round(overallProgress)}%`}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {isComplete
                ? `${totalCount} ${totalCount === 1 ? "file" : "files"} saved successfully`
                : `${completedCount} of ${totalCount} completed`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Minimize / Expand button */}
          <button
            onClick={() => setIsMinimized((prev) => !prev)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── OVERALL PROGRESS BAR ────────────────────────────────────── */}
      <div className="h-1.5 w-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out",
            isComplete
              ? "bg-emerald-500"
              : "bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500"
          )}
          style={{ width: `${Math.min(100, Math.max(5, overallProgress))}%` }}
        />
      </div>

      {/* ── ITEMIZED FILE LIST (COLLAPSIBLE) ────────────────────────── */}
      {!isMinimized && (
        <div className="max-h-48 overflow-y-auto divide-y divide-border/40 p-2 space-y-1">
          {items.map((item) => {
            const isDone = item.status === "completed"
            const isUploading = item.status === "uploading"
            const isError = item.status === "error"

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/40 transition-colors text-xs gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0 font-bold text-[9px]">
                    {item.format.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.size}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isDone ? (
                    <div className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  ) : isUploading ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                      <span>{Math.round(item.progress)}%</span>
                      <Loader2 className="h-3 w-3 animate-spin" />
                    </div>
                  ) : isError ? (
                    <div className="flex items-center gap-1 text-destructive font-semibold text-[11px]">
                      <AlertCircle className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="text-muted-foreground flex items-center gap-1 text-[10px]">
                      <Clock className="h-3 w-3" />
                      <span>Pending</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </aside>
  )
}
