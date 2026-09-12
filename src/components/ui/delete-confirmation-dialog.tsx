"use client"

import * as React from "react"
import { AlertTriangle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  itemName?: string
  description?: string
  confirmText?: string
  onConfirm: () => void
  isDeleting?: boolean
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title = "Delete Confirmation",
  itemName,
  description,
  confirmText = "Yes, Delete",
  onConfirm,
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 overflow-hidden rounded-2xl border border-border/90 shadow-2xl bg-card">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div className="space-y-1.5 text-left flex-1">
            <DialogHeader className="p-0 space-y-1">
              <DialogTitle className="text-lg font-bold text-foreground">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                {description || (
                  <>
                    Are you sure you want to permanently delete{" "}
                    {itemName && <strong className="text-foreground font-semibold">"{itemName}"</strong>}? This action cannot be undone.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2.5 pt-4 mt-2 border-t border-border/70">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="rounded-xl px-4 h-9.5 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            disabled={isDeleting}
            className="rounded-xl px-4 h-9.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{isDeleting ? "Deleting..." : confirmText}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
