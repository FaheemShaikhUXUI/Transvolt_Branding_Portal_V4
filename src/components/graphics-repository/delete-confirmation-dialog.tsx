"use client"

import * as React from "react"
import { AlertTriangle } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  itemName?: string
  onConfirm: () => void
  isDeleting?: boolean
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-6 rounded-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 mx-auto">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-lg font-bold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {itemName && (
          <div className="p-3 my-2 rounded-xl bg-muted/40 border border-border/80 text-center">
            <span className="text-xs font-mono font-bold text-foreground break-all">
              {itemName}
            </span>
          </div>
        )}

        <DialogFooter className="flex flex-row items-center justify-center gap-2 pt-2 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="flex-1 rounded-xl text-xs h-9 font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl text-xs h-9 font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm"
          >
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
