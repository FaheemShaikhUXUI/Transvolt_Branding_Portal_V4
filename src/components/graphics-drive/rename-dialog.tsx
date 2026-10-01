"use client"

import * as React from "react"
import { Edit3 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface RenameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemType: "folder" | "file"
  currentName: string
  onRename: (newName: string) => void
}

export function RenameDialog({
  open,
  onOpenChange,
  itemType,
  currentName,
  onRename,
}: RenameDialogProps) {
  const [name, setName] = React.useState(currentName)

  React.useEffect(() => {
    setName(currentName)
  }, [currentName, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onRename(name.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-card border border-border/80 shadow-2xl rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-foreground">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground capitalize">
                Rename {itemType}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter a new name for this {itemType}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="rename-input" className="text-xs font-semibold text-foreground">
              Name
            </Label>
            <Input
              id="rename-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl text-sm"
              autoFocus
            />
          </div>

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
              type="submit"
              disabled={!name.trim() || name.trim() === currentName}
              className="rounded-xl h-9 text-xs font-semibold bg-primary text-primary-foreground"
            >
              Save Name
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
