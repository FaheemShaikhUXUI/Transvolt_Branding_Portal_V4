"use client"

import * as React from "react"
import { FolderPlus, Palette, Check } from "lucide-react"
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
import { cn } from "@/lib/utils"

interface CreateFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentFolderName?: string
  onCreate: (name: string, color?: string) => void
}

const FOLDER_COLORS = [
  { label: "White", value: "#ffffff" },
  { label: "Emerald", value: "#059669" },
  { label: "Blue", value: "#2563eb" },
  { label: "Purple", value: "#7c3aed" },
  { label: "Amber", value: "#d97706" },
  { label: "Rose", value: "#e11d48" },
  { label: "Slate", value: "#475569" },
]

export function CreateFolderDialog({
  open,
  onOpenChange,
  currentFolderName,
  onCreate,
}: CreateFolderDialogProps) {
  const [name, setName] = React.useState("")
  const [selectedColor, setSelectedColor] = React.useState(FOLDER_COLORS[0].value)

  React.useEffect(() => {
    if (open) {
      setName("")
      setSelectedColor(FOLDER_COLORS[0].value) // default white
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate(name.trim(), selectedColor)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border border-border/80 shadow-2xl rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Create New Folder
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {currentFolderName
                  ? `Inside "${currentFolderName}"`
                  : "Inside Root Directory"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="folder-name" className="text-xs font-semibold text-foreground">
              Folder Name
            </Label>
            <Input
              id="folder-name"
              placeholder="e.g. Social Media Creatives"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl text-sm"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <div className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Folder Color Tag</span>
              </div>
              <span className="text-[11px] text-muted-foreground font-normal">
                {FOLDER_COLORS.find((c) => c.value === selectedColor)?.label || "White"}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {FOLDER_COLORS.map((col) => {
                const isColWhite = col.value.toLowerCase() === "#ffffff"
                const isSelected = selectedColor === col.value
                return (
                  <button
                    key={col.value}
                    type="button"
                    onClick={() => setSelectedColor(col.value)}
                    className={cn(
                      "h-7 w-7 rounded-full transition-all duration-150 flex items-center justify-center cursor-pointer",
                      isColWhite ? "border border-neutral-300 dark:border-neutral-600 shadow-2xs" : "",
                      isSelected
                        ? "ring-2 ring-offset-2 ring-primary scale-110 shadow-sm"
                        : "hover:scale-105 opacity-85 hover:opacity-100"
                    )}
                    style={{ backgroundColor: col.value }}
                    title={col.label}
                  >
                    {isSelected && (
                      <Check className={cn("h-3.5 w-3.5 stroke-[2.5]", isColWhite ? "text-neutral-800" : "text-white")} />
                    )}
                  </button>
                )
              })}
            </div>
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
              disabled={!name.trim()}
              className="rounded-xl h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Create Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
