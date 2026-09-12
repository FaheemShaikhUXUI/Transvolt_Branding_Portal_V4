"use client"

import * as React from "react"
import { Copy, AlertTriangle, Check, X, Image as ImageIcon, ArrowRight, Layers, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatFileSize } from "./add-photo-modal"

export interface DuplicateFileInfo {
  file: File
  reason: "already_exists" | "repeated_in_batch"
  existingPhotoUrl?: string
  existingPhotoName?: string
}

interface DuplicatePhotoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  duplicates: DuplicateFileInfo[]
  totalNewFilesCount: number
  onSkipDuplicates: () => void
  onKeepBoth: () => void
  onCancel: () => void
}

export function DuplicatePhotoDialog({
  open,
  onOpenChange,
  duplicates,
  totalNewFilesCount,
  onSkipDuplicates,
  onKeepBoth,
  onCancel,
}: DuplicatePhotoDialogProps) {
  // Generate real object URLs for incoming file previews
  const [filePreviews, setFilePreviews] = React.useState<Map<File, string>>(new Map())

  React.useEffect(() => {
    if (!open || duplicates.length === 0) return

    const map = new Map<File, string>()
    const createdUrls: string[] = []

    duplicates.forEach((item) => {
      try {
        const url = URL.createObjectURL(item.file)
        createdUrls.push(url)
        map.set(item.file, url)
      } catch (err) {
        console.error("Failed to generate preview url:", err)
      }
    })

    setFilePreviews(map)

    return () => {
      createdUrls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [open, duplicates])

  if (!open || duplicates.length === 0) return null

  const uniqueCount = Math.max(0, totalNewFilesCount - duplicates.length)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 40% Wider container: sm:max-w-[720px] w-[95vw], no clipping, generous spacing */}
      <DialogContent className="sm:max-w-[720px] w-[95vw] p-0 overflow-hidden border border-border shadow-2xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 pb-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/20">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 shadow-xs border border-amber-500/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                  Duplicate Photos Detected
                </DialogTitle>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  {duplicates.length} {duplicates.length > 1 ? "Files" : "File"}
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {duplicates.length} of {totalNewFilesCount} photo{totalNewFilesCount > 1 ? "s have" : " has"} identical filenames. Choose how you want to handle them.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body: Small Photo Thumbnails + Comparison Cards */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Review duplicate photos below with actual thumbnails and names:
            </span>
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Double Photos Identified
            </span>
          </div>

          {/* Scrollable list with generous right padding to prevent any scrollbar clipping */}
          <div className="max-h-[300px] overflow-y-auto overflow-x-hidden space-y-2.5 p-3.5 pr-4 rounded-xl border border-border/80 bg-muted/20 scrollbar-thin">
            {duplicates.map((item, idx) => {
              const incomingPreviewUrl = filePreviews.get(item.file)
              const hasExistingPhoto = Boolean(item.existingPhotoUrl)

              return (
                <div
                  key={idx}
                  className="w-full rounded-xl bg-card border border-border/70 p-3 sm:p-3.5 shadow-xs hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                >
                  {/* Left: Thumbnail(s) and File Details */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Visual Comparison: Existing thumbnail and/or incoming thumbnail */}
                    <div className="flex items-center gap-2 shrink-0">
                      {hasExistingPhoto && item.existingPhotoUrl ? (
                        <div className="flex items-center gap-1.5">
                          {/* Existing Photo in Gallery */}
                          <div className="relative group/thumb rounded-lg overflow-hidden border border-border/80 bg-muted shadow-2xs">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.existingPhotoUrl}
                              alt="Existing Photo"
                              className="w-13 h-13 sm:w-14 sm:h-14 object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-black/75 backdrop-blur-xs py-0.5 text-center">
                              <span className="text-[8px] font-bold text-white tracking-tight uppercase">
                                In Gallery
                              </span>
                            </div>
                          </div>

                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                        </div>
                      ) : null}

                      {/* Incoming Photo Thumbnail */}
                      <div className="relative group/thumb rounded-lg overflow-hidden border-2 border-amber-500/60 bg-muted shadow-2xs">
                        {incomingPreviewUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={incomingPreviewUrl}
                            alt={item.file.name}
                            className="w-13 h-13 sm:w-14 sm:h-14 object-cover"
                          />
                        ) : (
                          <div className="w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center bg-amber-500/10 text-amber-600">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-amber-600/90 backdrop-blur-xs py-0.5 text-center">
                          <span className="text-[8px] font-bold text-white tracking-tight uppercase">
                            Incoming
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Filename and Meta Details */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="font-bold text-xs sm:text-sm text-foreground truncate"
                          title={item.file.name}
                        >
                          {item.file.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-muted-foreground">
                        <span className="font-semibold px-1.5 py-0.5 rounded bg-muted text-foreground border border-border/60">
                          {formatFileSize(item.file.size)}
                        </span>
                        <span>•</span>
                        <span className="uppercase text-[10px] font-medium">
                          {item.file.name.split(".").pop() || "IMAGE"}
                        </span>
                        <span>•</span>
                        <span className="text-[10.5px] text-muted-foreground truncate">
                          {item.reason === "already_exists"
                            ? "Identical name already present"
                            : "Repeated in this batch"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Pill */}
                  <div className="shrink-0 flex items-center justify-end sm:justify-start">
                    <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 whitespace-nowrap flex items-center gap-1.5">
                      <AlertCircle className="h-3 w-3 text-amber-600 shrink-0" />
                      {item.reason === "already_exists" ? "Already in List" : "Repeated in Batch"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Explanation Text */}
          <div className="rounded-xl bg-muted/40 border border-border/60 p-3.5 flex items-start gap-2.5 text-xs text-muted-foreground">
            <Layers className="h-4 w-4 text-[#4472C4] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                How would you like to handle {duplicates.length > 1 ? "these photos" : "this photo"}?
              </p>
              <p className="text-[11.5px] leading-relaxed">
                • <strong>Keep Both (Side by Side)</strong> keeps the original filename without renaming and places matching photos directly next to each other so you can view similar photos side by side.<br />
                • <strong>Leave Existing &amp; Skip</strong> keeps your existing gallery unchanged and uploads only unique photos.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="m-0 p-4 sm:p-5 border-t border-border bg-card/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="text-xs h-9.5 px-4 cursor-pointer order-3 sm:order-1"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onKeepBoth}
            className="text-xs h-9.5 px-4 gap-2 cursor-pointer font-bold border-amber-500/30 hover:bg-amber-500/10 text-foreground order-2 hover:border-amber-500/50"
          >
            <Copy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Keep Both (Side by Side)
          </Button>

          <Button
            type="button"
            onClick={onSkipDuplicates}
            className="bg-[#4472C4] hover:bg-[#365ca0] text-white text-xs h-9.5 px-4 gap-2 cursor-pointer font-bold shadow-xs order-1 sm:order-3"
          >
            <Check className="h-4 w-4" />
            {uniqueCount > 0 ? `Skip Duplicates & Upload (${uniqueCount})` : "Leave Existing & Skip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
