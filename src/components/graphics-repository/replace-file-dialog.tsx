"use client"

import * as React from "react"
import { toast } from "sonner"
import { RefreshCw, UploadCloud, AlertCircle } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { GraphicFile } from "@/lib/graphics-repository/types"
import {
  detectFileFormat,
  formatBytes,
  graphicsService,
} from "@/lib/graphics-repository/graphics-service"
import { GraphicsFormatBadge } from "./graphics-format-badge"

interface ReplaceFileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: GraphicFile | null
  onSuccess: () => void
}

const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.svg,.pdf,.cdr,.ppt,.pptx,.ai,.eps"

export function ReplaceFileDialog({
  open,
  onOpenChange,
  file,
  onSuccess,
}: ReplaceFileDialogProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [customName, setCustomName] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (file && open) {
      setCustomName(file.name)
      setSelectedFile(null)
      setIsSaving(false)
    }
  }, [file, open])

  if (!file) return null

  const handleSave = async () => {
    if (!selectedFile) {
      toast.error("Please choose a replacement file.")
      return
    }

    setIsSaving(true)
    try {
      const format = detectFileFormat(selectedFile.name)
      graphicsService.replaceFile(file.id, {
        name: customName.trim() || undefined,
        originalFileName: selectedFile.name,
        format,
        fileSize: formatBytes(selectedFile.size),
      })

      toast.success(`Replaced "${file.name}" with new version!`)
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to replace file.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/60">
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-[#4472C4]" />
            Replace Graphic File
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Upload a revised version while preserving existing record history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Current File Info */}
          <div className="p-3 rounded-xl border border-border/70 bg-muted/30 space-y-1.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
              Current File Details
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground truncate">
                {file.name}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <GraphicsFormatBadge format={file.format} size="sm" />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">
                  {file.version || "v1.0"}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              Original: {file.originalFileName} ({file.fileSize || "N/A"})
            </p>
          </div>

          {/* New Name (Optional Edit) */}
          <div className="space-y-1.5">
            <Label htmlFor="replace-file-name" className="text-xs font-bold text-foreground">
              Graphic Title
            </Label>
            <Input
              id="replace-file-name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="h-9 text-xs focus-visible:ring-[#4472C4]"
            />
          </div>

          {/* New File Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground">
              Select Replacement File <span className="text-red-500">*</span>
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setSelectedFile(f)
              }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/80 hover:border-[#4472C4]/70 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-muted/20 text-center"
            >
              <UploadCloud className="h-6 w-6 text-[#4472C4] mb-1" />
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-foreground">
                    {selectedFile.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {formatBytes(selectedFile.size)} • Click to change
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-semibold text-foreground">
                    Click to select replacement file
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    JPG, PNG, SVG, PDF, CDR, PPT, AI
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-3 border-t border-border/60 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="rounded-xl text-xs h-9 font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !selectedFile}
            className="rounded-xl text-xs h-9 font-bold bg-[#4472C4] hover:bg-[#3b63ab] text-white shadow-sm"
          >
            {isSaving ? "Replacing..." : "Confirm Replacement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
