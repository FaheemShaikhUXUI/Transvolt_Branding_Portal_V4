"use client"

import * as React from "react"
import {
  Plus,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  Check,
  CheckCircle2,
  Loader2,
  Calendar,
  Sparkles,
  Building2,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAssets } from "@/lib/assets/assets-context"
import { Asset, PhotoItem } from "@/components/assets/asset-tile"
import {
  compressImage,
  formatFileSize,
  disambiguateFileName,
  PhotoCategory,
  insertPhotosSideBySide,
  getTodayYMD,
  parseToYMD,
  formatDisplayDate,
} from "./add-photo-modal"
import { DuplicatePhotoDialog, DuplicateFileInfo } from "./duplicate-photo-dialog"
import { saveOriginalPhotosBatch } from "@/lib/assets/photo-vault"
import { cn } from "@/lib/utils"

interface EditPhotoModalProps {
  collection: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditPhotoModal({
  collection,
  open,
  onOpenChange,
  onSuccess,
}: EditPhotoModalProps) {
  const { updateCustomAsset } = useAssets()

  const [title, setTitle] = React.useState(collection.name || "")
  const [category, setCategory] = React.useState<PhotoCategory>(
    (collection.subCategory as PhotoCategory) || "Events"
  )
  const [date, setDate] = React.useState<string>(() =>
    parseToYMD(collection.date || collection.createdAt)
  )
  const [photos, setPhotos] = React.useState<PhotoItem[]>(collection.photos || [])
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)

  // Duplicate Photo Detection State
  const [duplicateDialogOpen, setDuplicateDialogOpen] = React.useState(false)
  const [duplicateInfoList, setDuplicateInfoList] = React.useState<DuplicateFileInfo[]>([])
  const [pendingFilesBatch, setPendingFilesBatch] = React.useState<File[]>([])

  const addMoreInputRef = React.useRef<HTMLInputElement>(null)

  // Identify Duplicate Photos in current photos list
  const { duplicateCount, duplicateIds, extraCopiesCount } = React.useMemo(() => {
    const groups = new Map<string, PhotoItem[]>()
    photos.forEach((p) => {
      const norm = p.name.trim().toLowerCase()
      const list = groups.get(norm) || []
      list.push(p)
      groups.set(norm, list)
    })

    let totalDupPhotos = 0
    let totalExtraCopies = 0
    const dupIds = new Set<string>()

    groups.forEach((list) => {
      if (list.length > 1) {
        totalDupPhotos += list.length
        totalExtraCopies += list.length - 1
        for (let i = 1; i < list.length; i++) {
          dupIds.add(list[i].id)
        }
      }
    })

    return {
      duplicateCount: totalDupPhotos,
      extraCopiesCount: totalExtraCopies,
      duplicateIds: dupIds,
    }
  }, [photos])

  const [isRemovingDuplicates, setIsRemovingDuplicates] = React.useState(false)
  const [duplicatesRemovedMessage, setDuplicatesRemovedMessage] = React.useState(false)

  const handleDeleteAllDuplicates = async () => {
    if (duplicateCount === 0 || duplicateIds.size === 0) return
    setIsRemovingDuplicates(true)

    // Visual pacing for the smooth removal animation
    await new Promise((resolve) => setTimeout(resolve, 600))

    setPhotos((prev) => prev.filter((p) => !duplicateIds.has(p.id)))
    setIsRemovingDuplicates(false)
    setDuplicatesRemovedMessage(true)
    toast.success("All duplicate photos are removed")

    setTimeout(() => {
      setDuplicatesRemovedMessage(false)
    }, 3000)
  }

  // Sync state when collection or open status changes
  React.useEffect(() => {
    if (open) {
      setTitle(collection.name || "")
      setCategory((collection.subCategory as PhotoCategory) || "Events")
      setDate(parseToYMD(collection.date || collection.createdAt))
      setPhotos(collection.photos || [])
      setDuplicateDialogOpen(false)
      setDuplicateInfoList([])
      setPendingFilesBatch([])
      setIsRemovingDuplicates(false)
      setDuplicatesRemovedMessage(false)
    }
  }, [open, collection])

  // Core processing pipeline
  const runUploadPipeline = async (filesToProcess: { file: File; customName?: string }[]) => {
    if (filesToProcess.length === 0) return

    setIsProcessing(true)

    try {
      const newItems: PhotoItem[] = []
      const todayFormatted = new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date())

      for (const item of filesToProcess) {
        const file = item.file
        const displayName = item.customName || file.name
        const isEventOrSite = category === "Events" || category === "Site"
        const { base64, previewUrl, originalUrl } = await compressImage(file, isEventOrSite)
        newItems.push({
          id: "photo_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          name: displayName,
          url: previewUrl || originalUrl, // Fast lightweight thumbnail
          thumbnailUrl: previewUrl || originalUrl, // Fast lightweight thumbnail
          originalUrl: originalUrl, // 100% UNTOUCHED ORIGINAL RAW PHOTO
          size: file.size,
          type: file.type || "image/jpeg",
          uploadedAt: todayFormatted,
        })
      }

      setPhotos((prev) => insertPhotosSideBySide(prev, newItems))
      toast.success(`Added ${newItems.length} new photo${newItems.length > 1 ? "s" : ""}.`)
    } catch (err) {
      console.error("Error processing photos:", err)
      toast.error("Failed to process some photos. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle adding more photos with smart duplicate identification
  const processFiles = async (fileList: FileList | File[]) => {
    const validFiles: File[] = []
    let hasInvalid = false

    Array.from(fileList).forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase()
      const isJpg = ext === "jpg" || ext === "jpeg" || file.type === "image/jpeg"
      const isPng = ext === "png" || file.type === "image/png"

      if (isJpg || isPng) {
        validFiles.push(file)
      } else {
        hasInvalid = true
      }
    })

    if (hasInvalid) {
      toast.warning("Only JPG and PNG images are allowed. Non-JPG/PNG files were excluded.")
    }

    if (validFiles.length === 0) return

    // Smart duplicate photo identification by filename
    const duplicates: DuplicateFileInfo[] = []
    const seenInBatch = new Set<string>()

    validFiles.forEach((file) => {
      const normalizedName = file.name.trim().toLowerCase()
      const existingMatch = photos.find((p) => p.name.trim().toLowerCase() === normalizedName)

      if (existingMatch) {
        duplicates.push({
          file,
          reason: "already_exists",
          existingPhotoUrl: existingMatch.url,
          existingPhotoName: existingMatch.name,
        })
      } else if (seenInBatch.has(normalizedName)) {
        duplicates.push({
          file,
          reason: "repeated_in_batch",
        })
      } else {
        seenInBatch.add(normalizedName)
      }
    })

    if (duplicates.length > 0) {
      setDuplicateInfoList(duplicates)
      setPendingFilesBatch(validFiles)
      setDuplicateDialogOpen(true)
      return
    }

    // No duplicates: proceed directly
    runUploadPipeline(validFiles.map((f) => ({ file: f })))
  }

  // Duplicate Resolution Actions
  const handleSkipDuplicates = () => {
    const duplicateFileSet = new Set(duplicateInfoList.map((d) => d.file))
    const nonDuplicates = pendingFilesBatch.filter((f) => !duplicateFileSet.has(f))

    setDuplicateDialogOpen(false)

    if (nonDuplicates.length > 0) {
      toast.info(`Skipping duplicates. Uploading ${nonDuplicates.length} new unique photo(s).`)
      runUploadPipeline(nonDuplicates.map((f) => ({ file: f })))
    } else {
      toast.info("Duplicate photos skipped. Existing photos left unchanged.")
    }

    setPendingFilesBatch([])
    setDuplicateInfoList([])
  }

  const handleKeepBoth = () => {
    // Keep both photos with original names (no renaming!) and display side-by-side
    const batch = pendingFilesBatch.map((f) => ({ file: f, customName: f.name }))

    setDuplicateDialogOpen(false)
    toast.info(`Keeping both photos side-by-side with original names.`)
    runUploadPipeline(batch)

    setPendingFilesBatch([])
    setDuplicateInfoList([])
  }

  const handleCancelDuplicateResolution = () => {
    setDuplicateDialogOpen(false)
    setPendingFilesBatch([])
    setDuplicateInfoList([])
  }

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a Title of Images.")
      return
    }

    if (photos.length === 0) {
      toast.error("Collection must contain at least one photo.")
      return
    }

    setIsSaving(true)

    try {
      const nowFormatted = new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date())

      const finalDate = date || getTodayYMD()
      const formattedDate = formatDisplayDate(finalDate) || nowFormatted

      const primaryPhoto = photos[0]

      // Persist full-res original photos in IndexedDB photo-vault (never compressed or downscaled)
      try {
        await saveOriginalPhotosBatch(
          photos.map((p) => ({
            id: p.id,
            data: (p as any).originalUrl || p.url,
          }))
        )
      } catch (vaultErr) {
        console.warn("Could not batch save to photo-vault:", vaultErr)
      }

      const updatedCollection: Asset = {
        ...collection,
        name: title.trim(),
        subCategory: category,
        date: formattedDate,
        updatedAt: nowFormatted,
        thumbnail: primaryPhoto.thumbnailUrl || primaryPhoto.url,
        photos,
        formats: {
          ...collection.formats,
          [primaryPhoto.type?.includes("png") ? "PNG" : "JPG"]: {
            fileName: primaryPhoto.name,
            fileData: (primaryPhoto as any).originalUrl || primaryPhoto.url,
          },
        },
      }

      updateCustomAsset(updatedCollection)
      toast.success(`Updated "${title.trim()}" successfully!`)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error("Failed to update collection:", err)
      toast.error("Failed to update collection. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const isSite = category === "Site"
  const isEmployee = category === "Employee"

  const modalTitle = isSite
    ? "Edit Site Photos"
    : isEmployee
    ? "Edit Employee Photos"
    : "Edit Event Photos"

  const modalDescription = isSite
    ? "Update site collection title, add new photos, or delete existing photos."
    : isEmployee
    ? "Update employee album title, add new photos, or delete existing photos."
    : "Update collection title, add new photos, or delete existing photos."

  const titleInputLabel = isSite
    ? "Title of Site / Images"
    : isEmployee
    ? "Title of Album / Images"
    : "Title of Event / Images"

  const dateInputLabel = isSite
    ? "Date of Site"
    : isEmployee
    ? "Date of Album"
    : "Date of Event"

  const titlePlaceholder = isSite
    ? "e.g., Bandra Kurla Complex Charging Hub"
    : isEmployee
    ? "e.g., Annual Leadership Team Offsite"
    : "e.g., Annual Green Fleet Summit 2026"

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[940px] w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border bg-card/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#4472C4]/10 text-[#4472C4]">
              {isSite ? (
                <Building2 className="h-5 w-5" />
              ) : isEmployee ? (
                <Users className="h-5 w-5" />
              ) : (
                <ImageIcon className="h-5 w-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {modalTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {modalDescription}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Hidden Input for Adding More */}
        <input
          ref={addMoreInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files)
            e.target.value = ""
          }}
        />

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1) Title of Images */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span>{titleInputLabel}</span>
              <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={titlePlaceholder}
              className="h-10.5 text-sm bg-background border-border focus-visible:ring-1 focus-visible:ring-[#4472C4]"
            />
          </div>

          {/* 2) Date of Event / Site (Editable, defaults to current date) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#4472C4]" />
                <span>{dateInputLabel}</span>
              </Label>
              {date === getTodayYMD() ? (
                <span className="text-[10.5px] font-semibold text-[#548235] bg-[#548235]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="h-3 w-3" /> Default: Today ({formatDisplayDate(date)})
                </span>
              ) : (
                <span className="text-[10.5px] font-semibold text-[#4472C4] bg-[#4472C4]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Selected: {formatDisplayDate(date)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10.5 text-sm bg-background border-border focus-visible:ring-1 focus-visible:ring-[#4472C4] cursor-pointer"
                />
              </div>
              {date !== getTodayYMD() && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDate(getTodayYMD())}
                  className="h-10.5 text-xs text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                >
                  Reset Today
                </Button>
              )}
            </div>
          </div>



          {/* 3) Photos Management (Preview Grid + (+) Add More Tile + Delete button) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span>Manage Photos ({photos.length})</span>
              </Label>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded border">
                JPG &amp; PNG Only
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative rounded-xl border border-border bg-card overflow-hidden shadow-xs flex flex-col"
                >
                  <div className="relative aspect-4/3 w-full bg-muted overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                      <span
                        className={cn(
                          "text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs tracking-wider text-white",
                          photo.type?.includes("png") ? "bg-emerald-600" : "bg-blue-600"
                        )}
                      >
                        {photo.type?.includes("png") ? "PNG" : "JPG"}
                      </span>

                      {photos.filter((p) => p.name.trim().toLowerCase() === photo.name.trim().toLowerCase()).length > 1 && (
                        <span className="text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded shadow-xs tracking-wider bg-amber-500 text-neutral-900 border border-amber-600/30">
                          Duplicate
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemovePhoto(photo.id)
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white hover:bg-red-600 transition-colors cursor-pointer"
                      title="Delete photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="p-2 flex flex-col gap-0.5 bg-card">
                    <span className="text-[11px] font-medium text-foreground truncate" title={photo.name}>
                      {photo.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {photo.size ? formatFileSize(photo.size) : "Photo"}
                    </span>
                  </div>
                </div>
              ))}

              {/* Dynamic (+) Add More Photos Tile */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => addMoreInputRef.current?.click()}
                className={cn(
                  "aspect-4/3 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 cursor-pointer transition-all text-center select-none",
                  isDragging
                    ? "border-[#4472C4] bg-[#4472C4]/15 scale-[0.98]"
                    : "border-border/80 bg-muted/20 hover:border-[#4472C4] hover:bg-[#4472C4]/5 text-muted-foreground hover:text-[#4472C4]"
                )}
                title="Add more photos"
              >
                <div className="p-2 rounded-full bg-muted text-foreground mb-1.5">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold tracking-wide">+ Add More</span>
                <span className="text-[9.5px] text-muted-foreground mt-0.5">JPG or PNG</span>
              </div>
            </div>

            {isProcessing && (
              <div className="flex items-center gap-2 text-xs text-[#4472C4] pt-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Compressing &amp; uploading new photos...</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="m-0 p-5 border-t border-border bg-card/60 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          {/* Absolute Left Side: Status / count / uploading indicator */}
          <div className="flex items-center mr-auto">
            {isProcessing ? (
              <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-[#4472C4]/10 border border-[#4472C4]/25 shadow-xs animate-in fade-in duration-200">
                <Loader2 className="h-4 w-4 text-[#4472C4] animate-spin shrink-0" />
                <span className="text-xs font-bold text-foreground">
                  Processing new photos...
                </span>
              </div>
            ) : photos.length > 0 ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  ✓ <strong className="font-bold">{photos.length}</strong> photo{photos.length !== 1 ? "s" : ""} in collection
                </span>
              </div>
            ) : null}
          </div>

          {/* Right Side: Duplicate Button, Auto-disappearing Message, Cancel & Save Buttons */}
          <div className="flex items-center justify-end gap-2.5 shrink-0 flex-wrap">
            {/* If duplicates removed message is active (auto-disappears in 3 seconds): */}
            {duplicatesRemovedMessage && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-right-3 duration-300">
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>All duplicate photos are removed</span>
              </div>
            )}

            {/* Delete All Duplicates button (next to Cancel button, shows count) */}
            {duplicateCount > 0 && !duplicatesRemovedMessage && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDeleteAllDuplicates}
                disabled={isRemovingDuplicates || isSaving || isProcessing}
                className="h-9 px-3 gap-1.5 cursor-pointer text-xs font-bold border-red-300 dark:border-red-800/60 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/70 text-red-600 dark:text-red-400 hover:text-red-700 shadow-2xs transition-all animate-in fade-in slide-in-from-right-2 duration-200"
                title={`Remove ${extraCopiesCount} duplicate ${extraCopiesCount > 1 ? "copies" : "copy"} and keep 1 unique photo of each`}
              >
                {isRemovingDuplicates ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Removing duplicates...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span>Delete Duplicates ({duplicateCount})</span>
                  </>
                )}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving || isProcessing}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isProcessing || photos.length === 0}
              className="bg-[#4472C4] hover:bg-[#365ca0] text-white min-w-[110px] font-semibold cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Duplicate Photo Detection & Resolution Popout */}
    <DuplicatePhotoDialog
      open={duplicateDialogOpen}
      onOpenChange={setDuplicateDialogOpen}
      duplicates={duplicateInfoList}
      totalNewFilesCount={pendingFilesBatch.length}
      onSkipDuplicates={handleSkipDuplicates}
      onKeepBoth={handleKeepBoth}
      onCancel={handleCancelDuplicateResolution}
    />
    </>
  )
}
