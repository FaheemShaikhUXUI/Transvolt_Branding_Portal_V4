"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface UnsavedChangesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStay: () => void
  onDiscard: () => void
  onSaveAndExit: () => void
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onStay,
  onDiscard,
  onSaveAndExit,
}: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle className="text-base font-bold">Unsaved Changes</DialogTitle>
          </div>
          <DialogDescription className="text-xs pt-1">
            You have unsaved modifications on this Organization Chart. Do you want to save before leaving?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onStay}
            className="cursor-pointer text-xs"
          >
            Stay on Page
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDiscard}
            className="text-destructive hover:text-destructive cursor-pointer text-xs"
          >
            Discard Changes
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSaveAndExit}
            className="bg-[#548235] hover:bg-[#466f2c] text-white cursor-pointer text-xs font-bold"
          >
            Save & Exit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
