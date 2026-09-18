"use client"

import * as React from "react"
import { Download, FileText, Calendar, HardDrive, Tag } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { V2File } from "@/lib/graphics-library-v2/types"
import { graphicsLibraryV2Service } from "@/lib/graphics-library-v2/graphics-library-v2-service"

interface FilePreviewDialogProps {
  file: V2File | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FilePreviewDialog({
  file,
  open,
  onOpenChange,
}: FilePreviewDialogProps) {
  const [previewSrc, setPreviewSrc] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    let active = true
    if (file && open) {
      graphicsLibraryV2Service.getFilePreviewUrl(file).then((url) => {
        if (active) setPreviewSrc(url)
      })
    } else {
      setPreviewSrc(undefined)
    }
    return () => {
      active = false
    }
  }, [file, open])

  if (!file) return null

  const isImage =
    ["PNG", "JPG", "SVG"].includes(file.format.toUpperCase()) &&
    previewSrc &&
    (previewSrc.startsWith("data:image") ||
      previewSrc.startsWith("blob:") ||
      previewSrc.startsWith("/") ||
      previewSrc.startsWith("http"))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] bg-card border border-border/80 shadow-2xl rounded-2xl p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-4 border-b border-border/70 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <DialogTitle className="text-sm font-bold text-foreground truncate">
              {file.name}
            </DialogTitle>
          </div>
          <Button
            size="sm"
            onClick={() => graphicsLibraryV2Service.downloadFile(file)}
            className="rounded-xl h-8 text-xs font-semibold gap-1.5 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </Button>
        </DialogHeader>

        {/* Content / Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center bg-muted/20 min-h-[260px]">
          {isImage ? (
            <div className="relative max-h-[380px] w-full flex items-center justify-center p-4 rounded-xl border border-border/50 bg-background/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt={file.name}
                className="max-h-[320px] max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shadow-xs">
                {file.format}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground pt-1">
                  Preview not rendered for {file.format} files. You can download the file below.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Metadata Details Bar */}
        <div className="p-4 bg-muted/40 border-t border-border/70 grid grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Format</p>
              <p className="font-semibold text-foreground truncate">{file.format}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Size</p>
              <p className="font-semibold text-foreground truncate">{file.fileSize}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Last Modified</p>
              <p className="font-semibold text-foreground truncate">
                {graphicsLibraryV2Service.formatDate(file.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
