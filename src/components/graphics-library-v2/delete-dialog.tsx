"use client"

import * as React from "react"
import { AlertTriangle, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemType: "folder" | "file"
  itemName: string
  onConfirm: () => void
}

export function DeleteDialog({
  open,
  onOpenChange,
  itemType,
  itemName,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-card border border-destructive/20 shadow-2xl rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-destructive capitalize">
                Delete {itemType}?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-1">
                Are you sure you want to permanently remove{" "}
                <span className="font-semibold text-foreground">"{itemName}"</span>?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {itemType === "folder" && (
          <div className="p-3 bg-destructive/5 rounded-xl border border-destructive/15 text-xs text-destructive">
            <span className="font-semibold">Notice:</span> Deleting this folder will
            permanently delete all subfolders and files contained inside it.
          </div>
        )}

        <DialogFooter className="pt-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl h-9 text-xs"
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
            className="rounded-xl h-9 text-xs font-semibold gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Confirm Delete</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
