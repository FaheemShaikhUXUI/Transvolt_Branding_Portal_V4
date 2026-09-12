"use client"

import * as React from "react"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RejectRequestDialogProps {
  isOpen: boolean
  email: string
  onConfirm: () => void
  onCancel: () => void
  isRejecting?: boolean
}

export function RejectRequestDialog({
  isOpen,
  email,
  onConfirm,
  onCancel,
  isRejecting = false,
}: RejectRequestDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onCancel}
      />

      {/* Dialog Card */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-destructive/30 bg-background p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        style={{
          boxShadow: "0 20px 45px -10px rgba(239, 68, 68, 0.2), 0 0 25px rgba(0, 0, 0, 0.4)",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/15 text-destructive ring-1 ring-destructive/30">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground tracking-tight">
              Reject Access Request?
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to reject this access request?
            </p>

            <div className="mt-3 rounded-xl border border-border bg-muted/40 p-2.5 text-xs font-mono text-foreground font-semibold truncate">
              {email}
            </div>

            <p className="mt-2 text-[11px] text-muted-foreground">
              This request will be marked as <span className="font-semibold text-destructive">Rejected</span> and archived in history.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isRejecting}
            className="rounded-xl px-4 text-xs font-medium"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isRejecting}
            className="rounded-xl px-4 text-xs font-bold shadow-md shadow-destructive/25 gap-1.5"
          >
            {isRejecting ? "Rejecting..." : "Reject"}
          </Button>
        </div>
      </div>
    </div>
  )
}
