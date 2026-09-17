"use client"

import * as React from "react"
import {
  Plus,
  UploadCloud,
  X,
  Calendar,
  Image as ImageIcon,
  Trash2,
  Check,
  Loader2,
  CheckCircle2,
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAssets } from "@/lib/assets/assets-context"
import { Asset, PhotoItem } from "@/components/assets/asset-tile"
import { DuplicatePhotoDialog, DuplicateFileInfo } from "./duplicate-photo-dialog"
import { saveOriginalPhotosBatch } from "@/lib/assets/photo-vault"
import { cn } from "@/lib/utils"

export type PhotoCategory = "Events" | "Site" | "Employee"

interface UploadedPhoto {
  id: string
  file: File
  name: string
  size: number
  previewUrl: string // Fast thumbnail for gallery cards and grid previews
  base64: string // Original quality raw data
  originalUrl: string // 100% UNCOMPRESSED, UNRESIZED ORIGINAL PHOTO/VIDEO
  format: "JPG" | "PNG" | "MP4" | "VIDEO"
  isVideo?: boolean
}

interface UploadProgressState {
  isUploading: boolean
  current: number
  total: number
  currentFileName: string
}

interface AddPhotoModalProps {
  defaultCategory?: PhotoCategory
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

export function disambiguateFileName(name: string, existingNames: Set<string>): string {
  if (!existingNames.has(name.trim().toLowerCase())) {
    existingNames.add(name.trim().toLowerCase())
    return name
  }

  const dotIndex = name.lastIndexOf(".")
  const base = dotIndex !== -1 ? name.substring(0, dotIndex) : name
  const ext = dotIndex !== -1 ? name.substring(dotIndex) : ""

  let counter = 1
  let newName = `${base} (${counter})${ext}`
  while (existingNames.has(newName.trim().toLowerCase())) {
    counter++
    newName = `${base} (${counter})${ext}`
  }

  existingNames.add(newName.trim().toLowerCase())
  return newName
}

/**
 * Inserts photos into an existing array such that photos with matching names
 * are placed side-by-side (immediately following the last matching photo).
 */
export function insertPhotosSideBySide<T extends { name: string }>(
  existing: T[],
  incoming: T[]
): T[] {
  const result = [...existing]
  for (const item of incoming) {
    const norm = item.name.trim().toLowerCase()
    let lastMatchIdx = -1
    for (let i = result.length - 1; i >= 0; i--) {
      if (result[i].name.trim().toLowerCase() === norm) {
        lastMatchIdx = i
        break
      }
    }

    if (lastMatchIdx !== -1) {
      result.splice(lastMatchIdx + 1, 0, item)
    } else {
      result.push(item)
    }
  }
  return result
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Returns today's date in YYYY-MM-DD format for HTML5 date inputs
 */
export function getTodayYMD(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Parses any date string (ISO, formatted, etc.) into YYYY-MM-DD
 */
export function parseToYMD(dateStr?: string): string {
  if (!dateStr) return getTodayYMD()
  const timestamp = Date.parse(dateStr)
  if (isNaN(timestamp)) return getTodayYMD()
  const d = new Date(timestamp)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Formats YYYY-MM-DD into a clean human-readable date string e.g. "07 Sep 2026"
 */
export function formatDisplayDate(ymd: string): string {
  if (!ymd) return ""
  const parts = ymd.split("-")
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    const d = new Date(year, month, day)
    if (!isNaN(d.getTime())) {
      return new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(d)
    }
  }
  return ymd
}


/**
 * Reads original uncompressed, unresized photo file as Data URL
 * Preserves 100% full original resolution and image quality without any degradation.
 */
export async function readOriginalImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      resolve((event.target?.result as string) || "")
    }
    reader.onerror = () => resolve("")
    reader.readAsDataURL(file)
  })
}

/**
 * Generates a lightweight, optimized thumbnail for gallery cards and grid browsing.
 * Keeps memory usage tiny and thumbnail scrolling silky-smooth (60 FPS) while the original
 * raw photo is safely preserved in 100% full uncompressed quality for the Photo Viewer and downloads.
 */
export async function generateFastThumbnail(source: File | string, maxDim: number = 480, quality: number = 0.8): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(typeof source === "string" ? source : "")
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"

    const processImg = () => {
      try {
        let width = img.naturalWidth || img.width
        let height = img.naturalHeight || img.height
        if (!width || !height) {
          resolve(typeof source === "string" ? source : "")
          return
        }

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(typeof source === "string" ? source : "")
          return
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, width, height)

        const thumbUrl = canvas.toDataURL("image/jpeg", quality)
        resolve(thumbUrl)
      } catch {
        resolve(typeof source === "string" ? source : "")
      }
    }

    img.onerror = () => {
      resolve(typeof source === "string" ? source : "")
    }

    if (typeof source === "string") {
      img.onload = processImg
      img.src = source
    } else {
      const url = URL.createObjectURL(source)
      img.onload = () => {
        URL.revokeObjectURL(url)
        processImg()
      }
      img.src = url
    }
  })
}

/**
 * Checks if a file or item is a video by MIME type or extension
 */
export function isVideoFile(file: File | { name: string; type?: string }): boolean {
  if (file.type && file.type.toLowerCase().startsWith("video/")) return true
  const name = (file.name || "").toLowerCase()
  const videoExts = [".mp4", ".webm", ".mov", ".m4v", ".avi", ".mkv", ".ogv", ".3gp"]
  return videoExts.some((ext) => name.endsWith(ext))
}

/**
 * Extracts a crisp video frame thumbnail via HTML5 video + canvas
 */
export async function generateVideoThumbnail(source: File | string, maxDim: number = 480): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve("")
      return
    }

    try {
      const video = document.createElement("video")
      video.preload = "metadata"
      video.muted = true
      video.playsInline = true
      const url = typeof source === "string" ? source : URL.createObjectURL(source)
      video.src = url

      video.onloadeddata = () => {
        video.currentTime = Math.min(0.5, (video.duration || 1) / 2)
      }

      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas")
          let width = video.videoWidth || 480
          let height = video.videoHeight || 270
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(video, 0, 0, width, height)
            const thumbUrl = canvas.toDataURL("image/jpeg", 0.8)
            if (typeof source !== "string") URL.revokeObjectURL(url)
            resolve(thumbUrl)
            return
          }
        } catch {}
        if (typeof source !== "string") URL.revokeObjectURL(url)
        resolve("")
      }

      video.onerror = () => {
        if (typeof source !== "string") URL.revokeObjectURL(url)
        resolve("")
      }
    } catch {
      resolve("")
    }
  })
}

export function createVideoPlaceholderSvg(name: string): string {
  const safeName = (name || "Video").replace(/&/g, "&amp;").substring(0, 30)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270">
    <rect width="480" height="270" fill="#0F172A"/>
    <circle cx="240" cy="135" r="42" fill="#E11D48" opacity="0.9"/>
    <polygon points="232,120 256,135 232,150" fill="#ffffff"/>
    <text x="240" y="210" font-family="sans-serif" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle">${safeName}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/**
 * Reads 100% full-resolution untouched photo or video for Viewer & lossless downloads,
 * while generating a fast lightweight thumbnail for smooth gallery grid browsing.
 */
export async function compressImage(
  file: File,
  isEventOrSite: boolean = false
): Promise<{ base64: string; previewUrl: string; originalUrl: string; isVideo?: boolean }> {
  if (isVideoFile(file)) {
    const maxDim = isEventOrSite ? 240 : 480
    const videoThumb = await generateVideoThumbnail(file, maxDim)
    const previewUrl = videoThumb || createVideoPlaceholderSvg(file.name)
    const originalUrl = await readOriginalImage(file)
    return {
      base64: originalUrl,
      originalUrl,
      previewUrl,
      isVideo: true,
    }
  }

  const originalUrl = await readOriginalImage(file)
  const maxDim = isEventOrSite ? 144 : 480
  const quality = isEventOrSite ? 0.65 : 0.8
  const previewUrl = await generateFastThumbnail(file, maxDim, quality)
  return {
    base64: originalUrl, // 100% untouched original photo
    originalUrl, // 100% untouched original photo
    previewUrl: previewUrl || originalUrl, // Fast lightweight thumbnail for smooth gallery browsing
    isVideo: false,
  }
}

export function AddPhotoModal({
  defaultCategory = "Events",
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSuccess,
}: AddPhotoModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = (val: boolean) => {
    if (isControlled) {
      setControlledOpen?.(val)
    } else {
      setInternalOpen(val)
    }
  }

  const { addCustomAsset } = useAssets()

  // Form State (Contextually adapts to Events, Site, or Employee)
  const [category, setCategory] = React.useState<PhotoCategory>(defaultCategory)
  const [title, setTitle] = React.useState("")
  const [date, setDate] = React.useState<string>(() => getTodayYMD())
  const [photos, setPhotos] = React.useState<UploadedPhoto[]>([])
  const [isSaving, setIsSaving] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)

  // Sync category with defaultCategory when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCategory(defaultCategory)
      setDate((prev) => prev || getTodayYMD())
    }
  }, [isOpen, defaultCategory])

  const isSite = category === "Site"
  const isEmployee = category === "Employee"

  const modalTitle = isSite
    ? "+ Add Site Photos & Videos"
    : isEmployee
    ? "+ Add Employee Photos"
    : "+ Add Event Photos & Videos"

  const modalDescription = isSite
    ? "Upload official site infrastructure photography and videos, charging hubs, depots & installations."
    : isEmployee
    ? "Upload official employee, leadership & team photography."
    : "Upload official company event photography, videos, conferences, summits & celebrations."

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
    : "e.g., Annual Green Mobility Summit 2026"

  const fallbackTitlePrefix = isSite ? "Site" : isEmployee ? "Employee" : "Event"
  const galleryName = isSite ? "Site" : isEmployee ? "Employee" : "Events"

  // Smart Animated Uploading Progress State
  const [uploadProgress, setUploadProgress] = React.useState<UploadProgressState>({
    isUploading: false,
    current: 0,
    total: 0,
    currentFileName: "",
  })

  // Duplicate Photo Detection State
  const [duplicateDialogOpen, setDuplicateDialogOpen] = React.useState(false)
  const [duplicateInfoList, setDuplicateInfoList] = React.useState<DuplicateFileInfo[]>([])
  const [pendingFilesBatch, setPendingFilesBatch] = React.useState<File[]>([])

  // File input refs
  const initialInputRef = React.useRef<HTMLInputElement>(null)
  const addMoreInputRef = React.useRef<HTMLInputElement>(null)

  // Identify Duplicate Photos in the current photos list
  const { duplicateCount, duplicateIds, extraCopiesCount } = React.useMemo(() => {
    const groups = new Map<string, UploadedPhoto[]>()
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

    // Automatically disappear after 3 seconds
    setTimeout(() => {
      setDuplicatesRemovedMessage(false)
    }, 3000)
  }

  // Formatted auto-date fallback
  const todayDateFormatted = React.useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date())
  }, [])

  const resetForm = () => {
    setTitle("")
    setDate(getTodayYMD())
    setPhotos([])
    setIsSaving(false)
    setIsDragging(false)
    setUploadProgress({
      isUploading: false,
      current: 0,
      total: 0,
      currentFileName: "",
    })
    setDuplicateDialogOpen(false)
    setDuplicateInfoList([])
    setPendingFilesBatch([])
    setIsRemovingDuplicates(false)
    setDuplicatesRemovedMessage(false)
  }

  const handleClose = () => {
    resetForm()
    setIsOpen(false)
  }

  // Core upload pipeline with animated live count
  const runUploadPipeline = async (filesToUpload: { file: File; customName?: string }[]) => {
    if (filesToUpload.length === 0) return

    setUploadProgress({
      isUploading: true,
      current: 0,
      total: filesToUpload.length,
      currentFileName: filesToUpload[0]?.customName || filesToUpload[0]?.file.name || "",
    })

    try {
      const newPhotos: UploadedPhoto[] = []

      for (let i = 0; i < filesToUpload.length; i++) {
        const item = filesToUpload[i]
        const file = item.file
        const displayName = item.customName || file.name
        const ext = file.name.split(".").pop()?.toLowerCase()
        const isVideo = isVideoFile(file)
        const isPng = ext === "png" || file.type === "image/png"
        const format: "JPG" | "PNG" | "MP4" | "VIDEO" = isVideo ? "MP4" : isPng ? "PNG" : "JPG"

        setUploadProgress({
          isUploading: true,
          current: i + 1,
          total: filesToUpload.length,
          currentFileName: displayName,
        })

        const isEventOrSite = category === "Events" || category === "Site"
        const { previewUrl, originalUrl } = await compressImage(file, isEventOrSite)

        const photoObj: UploadedPhoto = {
          id: (isVideo ? "video_" : "photo_") + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          file,
          name: displayName,
          size: file.size,
          previewUrl,
          base64: originalUrl,
          originalUrl,
          format,
          isVideo,
        }

        newPhotos.push(photoObj)
        // Incremental state update: insert side-by-side next to matching photo name if one exists
        setPhotos((prev) => {
          const norm = photoObj.name.trim().toLowerCase()
          let lastMatchIdx = -1
          for (let i = prev.length - 1; i >= 0; i--) {
            if (prev[i].name.trim().toLowerCase() === norm) {
              lastMatchIdx = i
              break
            }
          }
          if (lastMatchIdx !== -1) {
            const updated = [...prev]
            updated.splice(lastMatchIdx + 1, 0, photoObj)
            return updated
          }
          return [...prev, photoObj]
        })

        // Visual pacing so user experiences the interactive animation
        await new Promise((r) =>
          setTimeout(r, Math.max(70, Math.min(160, 1400 / filesToUpload.length)))
        )
      }

      toast.success(`Successfully uploaded ${newPhotos.length} photo${newPhotos.length > 1 ? "s" : ""}!`)
    } catch (err) {
      console.error("Error processing photos:", err)
      toast.error("Failed to process some photos. Please try again.")
    } finally {
      setUploadProgress((prev) => ({
        ...prev,
        isUploading: false,
      }))
    }
  }

  // Handle incoming files with smart duplicate identification (accepts JPG, PNG, and MP4 / any video format)
  const processFiles = async (fileList: FileList | File[]) => {
    const validFiles: File[] = []
    let hasInvalid = false

    Array.from(fileList).forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase()
      const isJpg = ext === "jpg" || ext === "jpeg" || file.type === "image/jpeg"
      const isPng = ext === "png" || file.type === "image/png"
      const isWebp = ext === "webp" || file.type === "image/webp"
      const isVideo = isVideoFile(file)

      if (isJpg || isPng || isWebp || isVideo) {
        validFiles.push(file)
      } else {
        hasInvalid = true
      }
    })

    if (hasInvalid) {
      toast.warning("Only JPG, PNG images and video files (MP4, WebM, MOV) are allowed.")
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
          existingPhotoUrl: existingMatch.previewUrl || existingMatch.base64,
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
    // Keep both photos with original names (no renaming!) and display side by side
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

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  const handleSave = async () => {
    // Only show error if no photos are selected at all
    if (photos.length === 0) {
      toast.error("Please upload at least one JPG or PNG photo before saving.")
      return
    }

    setIsSaving(true)

    try {
      const finalDate = date || getTodayYMD()
      const formattedDate = formatDisplayDate(finalDate) || todayDateFormatted
      // Auto-assign title if left blank so it never fails
      const finalTitle = title.trim() || `${fallbackTitlePrefix} - ${formattedDate}`

      // Save full-resolution original photos to IndexedDB photo vault
      await saveOriginalPhotosBatch(photos.map((p) => ({ id: p.id, data: p.originalUrl || p.base64 })))

      const photoItems: PhotoItem[] = photos.map((p) => ({
        id: p.id,
        name: p.name,
        url: p.previewUrl || p.originalUrl, // Lightweight thumbnail for smooth gallery browsing
        thumbnailUrl: p.previewUrl || p.originalUrl, // Lightweight thumbnail for smooth gallery browsing
        originalUrl: p.originalUrl || p.base64, // 100% ORIGINAL RAW QUALITY (STORED IN VAULT)
        size: p.size,
        type: p.isVideo ? (p.file.type || "video/mp4") : p.format === "PNG" ? "image/png" : "image/jpeg",
        uploadedAt: formattedDate,
      }))

      const primaryPhoto = photos[0]
      const primaryFormat = primaryPhoto.isVideo ? "JPG" : primaryPhoto.format

      const newAsset: Asset = {
        id: "photo_col_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        name: finalTitle,
        category: "photos",
        subCategory: category,
        status: "active",
        createdAt: formattedDate,
        updatedAt: formattedDate,
        createdBy: "Administrator",
        date: formattedDate,
        thumbnail: primaryPhoto.previewUrl || primaryPhoto.originalUrl, // Fast lightweight thumbnail
        photos: photoItems,
        formats: {
          [primaryFormat]: {
            fileName: primaryPhoto.name,
            fileData: primaryPhoto.originalUrl || primaryPhoto.base64, // 100% ORIGINAL RAW QUALITY
          },
        },
      }

      addCustomAsset(newAsset)
      toast.success(`${fallbackTitlePrefix} photos "${finalTitle}" saved successfully!`)
      handleClose()
      onSuccess?.()
    } catch (err) {
      console.error("Error saving photos:", err)
      toast.error("Failed to save photos. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const percent = uploadProgress.total > 0
    ? Math.round((uploadProgress.current / uploadProgress.total) * 100)
    : 0

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => (open ? setIsOpen(true) : handleClose())}>
      <DialogTrigger
        render={
          (trigger as React.ReactElement) || (
            <Button className="h-11 px-5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer">
              <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
              <span>Add Photo</span>
            </Button>
          )
        }
      />

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
                <Sparkles className="h-5 w-5" />
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

        {/* Form Body with Scroll (Category Selection Removed as requested) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1) Title of Event/Site / Images (Text Box) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {titleInputLabel}
              </Label>
              <span className="text-[10px] text-muted-foreground font-normal">
                (Optional • Defaults to date if left blank)
              </span>
            </div>
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

          {/* 3) Upload Tile: Multiple JPG & PNG only + (+) Add More Button */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span>Upload Photos</span>
                <span className="text-red-500">*</span>
              </Label>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded border">
                JPG &amp; PNG Only
              </span>
            </div>

            {/* Hidden Input for Initial Selection */}
            <input
              ref={initialInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,.m4v,.mkv,.avi,image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) processFiles(e.target.files)
                e.target.value = ""
              }}
            />

            {/* Hidden Input for (+) Add More */}
            <input
              ref={addMoreInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,.m4v,.mkv,.avi,image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) processFiles(e.target.files)
                e.target.value = ""
              }}
            />

            {/* If NO photos uploaded yet: Show large dropzone tile */}
            {photos.length === 0 && !uploadProgress.isUploading ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => initialInputRef.current?.click()}
                className={cn(
                  "relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all text-center",
                  isDragging
                    ? "border-[#4472C4] bg-[#4472C4]/10 scale-[0.99]"
                    : "border-border/80 bg-muted/20 hover:border-[#4472C4]/70 hover:bg-[#4472C4]/5"
                )}
              >
                <div className="p-3.5 rounded-full bg-[#4472C4]/10 text-[#4472C4] mb-3">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Click to select photos or videos, or drag &amp; drop here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload multiple media • JPG, PNG &amp; MP4 (all video formats supported)
                </p>
              </div>
            ) : (
              /* If photos uploaded or actively uploading: Show preview grid with (+) Add More tile */
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative rounded-xl border border-border bg-card overflow-hidden shadow-xs flex flex-col animate-in fade-in zoom-in-95 duration-200"
                    >
                      {/* Image Thumbnail Preview */}
                      <div className="relative aspect-4/3 w-full bg-muted overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.previewUrl}
                          alt={photo.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Format & Duplicate Badges */}
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                          <span
                            className={cn(
                              "text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs tracking-wider",
                              photo.isVideo || photo.format === "MP4"
                                ? "bg-purple-600 text-white"
                                : photo.format === "PNG"
                                ? "bg-emerald-600 text-white"
                                : "bg-blue-600 text-white"
                            )}
                          >
                            {photo.isVideo ? "▶ MP4" : photo.format}
                          </span>

                          {photos.filter((p) => p.name.trim().toLowerCase() === photo.name.trim().toLowerCase()).length > 1 && (
                            <span className="text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded shadow-xs tracking-wider bg-amber-500 text-neutral-900 border border-amber-600/30">
                              Duplicate
                            </span>
                          )}
                        </div>

                        {/* Delete/Remove Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemovePhoto(photo.id)
                          }}
                          className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white hover:bg-red-600 transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Photo Details Footer */}
                      <div className="p-2 flex flex-col gap-0.5 bg-card">
                        <span className="text-[11px] font-medium text-foreground truncate" title={photo.name}>
                          {photo.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatFileSize(photo.size)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Active Uploading Skeleton Tile */}
                  {uploadProgress.isUploading && (
                    <div className="aspect-4/3 rounded-xl border-2 border-[#4472C4]/40 bg-[#4472C4]/5 flex flex-col items-center justify-center p-3 text-center animate-pulse">
                      <Loader2 className="h-6 w-6 text-[#4472C4] animate-spin mb-1.5" />
                      <span className="text-xs font-bold text-[#4472C4]">
                        Uploading #{uploadProgress.current}...
                      </span>
                      <span className="text-[9.5px] text-muted-foreground truncate max-w-[90px] mt-0.5">
                        {uploadProgress.currentFileName}
                      </span>
                    </div>
                  )}

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
                    title="Upload more photos"
                  >
                    <div className="p-2 rounded-full bg-muted text-foreground mb-1.5">
                      <Plus className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold tracking-wide">
                      + Add More
                    </span>
                    <span className="text-[9.5px] text-muted-foreground mt-0.5">
                      JPG or PNG
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 
          Footer with Smart & Amazing Animation Loading System at absolute left side
        */}
        {/* 
          Footer with Interactive Smart Animation Loading System & Exactly Equal Spacing (Left, Top, Bottom)
        */}
        <DialogFooter className="m-0 p-5 border-t border-border bg-card/60 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          {/* 
            ABSOLUTE LEFT SIDE: Smart & Amazing Interactive Animation Loading System
          */}
          <div className="flex items-center mr-auto">
            {uploadProgress.isUploading ? (
              /* Sleek, interactive smart HUD capsule with radial progress ring & equal spacing */
              <div className="relative overflow-hidden flex items-center gap-3.5 p-3 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/75 to-sky-50/90 dark:from-blue-950/60 dark:via-slate-900/70 dark:to-indigo-950/60 border border-blue-200/80 dark:border-blue-700/60 shadow-[0_4px_24px_-4px_rgba(68,114,196,0.22)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_6px_28px_-2px_rgba(68,114,196,0.30)] w-full sm:w-auto animate-in fade-in zoom-in-95 duration-200">
                {/* SVG Animated Circular Progress Dial */}
                <div className="relative flex items-center justify-center shrink-0 w-11 h-11">
                  <svg className="w-11 h-11 -rotate-90 transform" viewBox="0 0 44 44">
                    {/* Background track circle */}
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      className="text-blue-200/60 dark:text-blue-900/40"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    {/* Dynamic progress circle */}
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke="url(#uploadGradient)"
                      strokeWidth="3.5"
                      strokeDasharray={113.1}
                      strokeDashoffset={113.1 - (113.1 * percent) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-300 ease-out"
                    />
                    <defs>
                      <linearGradient id="uploadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4472C4" />
                        <stop offset="50%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Center percentage badge */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10.5px] font-black text-foreground tabular-nums tracking-tighter">
                      {percent}%
                    </span>
                  </div>
                </div>

                {/* Content & Metrics */}
                <div className="flex flex-col gap-1 min-w-[210px] sm:min-w-[250px]">
                  {/* Top row: Pulse radar beacon + photo count badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4472C4] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4472C4]"></span>
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4472C4] dark:text-blue-400">
                        Uploading Photos
                      </span>
                    </div>

                    <span className="text-xs font-black text-foreground tabular-nums">
                      <span className="text-[#4472C4] dark:text-blue-400 font-extrabold text-sm">{uploadProgress.current}</span>
                      <span className="text-muted-foreground font-normal mx-0.5">/</span>
                      {uploadProgress.total}
                    </span>
                  </div>

                  {/* Flowing Glowing Progress Bar */}
                  <div className="relative w-full h-2 rounded-full bg-blue-200/50 dark:bg-blue-950/60 overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-[#4472C4] via-sky-400 to-indigo-500 rounded-full transition-all duration-300 ease-out relative"
                      style={{ width: `${percent}%` }}
                    >
                      {/* Animated Shimmer beam traveling continuously */}
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer-fast" />
                    </div>
                  </div>

                  {/* Bottom active file info ticker */}
                  <div className="flex items-center justify-between text-[10.5px] text-muted-foreground">
                    <span className="truncate max-w-[170px] sm:max-w-[210px] font-medium flex items-center gap-1">
                      <ImageIcon className="h-3 w-3 text-[#4472C4] shrink-0" />
                      <span className="truncate">{uploadProgress.currentFileName || "Processing image..."}</span>
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-wide">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ) : photos.length > 0 ? (
              /* Spacious, celebratory ready-to-save card with breathing room */
              <div className="flex items-center gap-3 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 shadow-sm backdrop-blur-xs transition-all animate-in fade-in duration-300">
                <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold leading-tight">
                    All {photos.length} Photo{photos.length !== 1 ? "s" : ""} Successfully Uploaded
                  </span>
                  <span className="text-[10.5px] text-emerald-700/80 dark:text-emerald-400/80">
                    Ready to save to {galleryName} gallery
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                JPG &amp; PNG photos supported • Unlimited uploads
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Duplicate Button, Auto-disappearing Message, Cancel & Save Buttons */}
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
                disabled={isRemovingDuplicates || isSaving || uploadProgress.isUploading}
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
              onClick={handleClose}
              disabled={isSaving || uploadProgress.isUploading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || uploadProgress.isUploading || photos.length === 0}
              className="bg-[#4472C4] hover:bg-[#365ca0] text-white min-w-[95px] font-semibold cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
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
