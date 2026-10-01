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

interface CreateAudioFolderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyName?: string
  siteLocation?: string
  onCreateFolder: (folderName: string, colorTag: string) => void
}

const FOLDER_COLORS = [
  { label: "Blue", value: "#4472C4" },
  { label: "Green", value: "#548235" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Teal", value: "#0d9488" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Slate", value: "#64748b" },
]

export function CreateAudioFolderModal({
  open,
  onOpenChange,
  companyName,
  siteLocation,
  onCreateFolder,
}: CreateAudioFolderModalProps) {
  const [name, setName] = React.useState("")
  const [selectedColor, setSelectedColor] = React.useState(FOLDER_COLORS[0].value)

  React.useEffect(() => {
    if (open) {
      setName("")
      setSelectedColor(FOLDER_COLORS[0].value)
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreateFolder(name.trim(), selectedColor)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-card text-card-foreground border-border shadow-2xl p-6 rounded-2xl">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#4472C4]/10 text-[#4472C4]">
              <FolderPlus className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-[#4472C4]">
              Create New Folder
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {companyName
              ? `Creating folder inside ${companyName} (${siteLocation})`
              : "Organize audio tracks into folders"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3 text-left">
          <div className="space-y-1.5">
            <Label htmlFor="audio-folder-name" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Folder Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="audio-folder-name"
              placeholder="e.g. IVR Announcements, Depot Safety Alerts..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-lg border-border/80 bg-muted/20 focus:bg-background text-foreground text-sm"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-foreground">
              <div className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-[#4472C4]" />
                <span>Folder Color Tag</span>
              </div>
              <span className="text-[11px] text-muted-foreground font-semibold normal-case">
                {FOLDER_COLORS.find((c) => c.value === selectedColor)?.label || "Blue"}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {FOLDER_COLORS.map((col) => {
                const isSelected = selectedColor === col.value
                return (
                  <button
                    key={col.value}
                    type="button"
                    onClick={() => setSelectedColor(col.value)}
                    className={cn(
                      "h-8 w-8 rounded-full transition-all duration-150 flex items-center justify-center cursor-pointer",
                      isSelected
                        ? "ring-2 ring-offset-2 ring-[#4472C4] scale-110 shadow-sm"
                        : "hover:scale-105 opacity-80 hover:opacity-100"
                    )}
                    style={{ backgroundColor: col.value }}
                    title={col.label}
                  >
                    {isSelected && <Check className="h-4 w-4 text-white stroke-[3]" />}
                  </button>
                )
              })}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="rounded-xl px-6 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold cursor-pointer shadow-sm"
            >
              Create Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
