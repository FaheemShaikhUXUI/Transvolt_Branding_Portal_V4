"use client"

import * as React from "react"
import {
  Calendar,
  Download,
  Eye,
  FileArchive,
  Filter,
  Image as ImageIcon,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Building2,
  Users,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  CheckCheck,
  Pencil,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAssets } from "@/lib/assets/assets-context"
import { Asset, PhotoItem } from "@/components/assets/asset-tile"
import { AddPhotoModal, PhotoCategory, compressImage, disambiguateFileName, insertPhotosSideBySide } from "./add-photo-modal"
import { AddEmployeePhotoModal } from "./add-employee-photo-modal"
import { EditEmployeePhotoModal } from "./edit-employee-photo-modal"
import { DuplicatePhotoDialog, DuplicateFileInfo } from "./duplicate-photo-dialog"
import { EditPhotoModal } from "./edit-photo-modal"
import { InteractiveImageCanvas } from "./interactive-image-canvas"
import { downloadGroupAsZip, downloadFileLossless } from "@/lib/zip-utils"
import { getOriginalPhoto, saveOriginalPhotosBatch } from "@/lib/assets/photo-vault"
import { removePhotoBackground } from "@/lib/utils/background-remover"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

interface PhotosSectionProps {
  searchQuery?: string
}

type MenuTab = "ALL" | "EVENTS" | "SITE" | "EMPLOYEE"

function formatEventDate(dateStr?: string): string {
  if (!dateStr) return "14 August 2026"
  const parsed = Date.parse(dateStr)
  if (!isNaN(parsed)) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(parsed))
  }
  return dateStr
}

export function PhotosSection({ searchQuery: externalSearch = "" }: PhotosSectionProps) {
  const { assets, deleteAsset, updateCustomAsset } = useAssets()

  // Active Menu Tab matching attached image
  const [activeTab, setActiveTab] = React.useState<MenuTab>("EVENTS")
  const [internalSearch, setInternalSearch] = React.useState("")
  const searchQuery = (externalSearch || internalSearch).trim().toLowerCase()

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<Asset | null>(null)
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = React.useState(false)
  const [editEmployeeTarget, setEditEmployeeTarget] = React.useState<Asset | null>(null)

  // Direct (+) Photo Upload State & Ref
  const [directUploadTarget, setDirectUploadTarget] = React.useState<Asset | null>(null)
  const directFileInputRef = React.useRef<HTMLInputElement>(null)

  // Direct Upload Duplicate Detection State
  const [duplicateDialogOpen, setDuplicateDialogOpen] = React.useState(false)
  const [duplicateInfoList, setDuplicateInfoList] = React.useState<DuplicateFileInfo[]>([])
  const [pendingDirectBatch, setPendingDirectBatch] = React.useState<File[]>([])

  const handleTriggerDirectUpload = (collection: Asset) => {
    setDirectUploadTarget(collection)
    directFileInputRef.current?.click()
  }

  const runDirectUpload = async (filesToProcess: { file: File; customName?: string }[]) => {
    if (!directUploadTarget || filesToProcess.length === 0) return

    try {
      toast.info(`Uploading ${filesToProcess.length} photo${filesToProcess.length > 1 ? "s" : ""}...`)
      const newItems: PhotoItem[] = []
      const todayFormatted = new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date())

      for (const item of filesToProcess) {
        const file = item.file
        const displayName = item.customName || file.name
        const isEventOrSite = directUploadTarget.subCategory !== "Employee"
        const { previewUrl, originalUrl } = await compressImage(file, isEventOrSite)
        newItems.push({
          id: "photo_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          name: displayName,
          url: previewUrl || originalUrl, // Lightweight thumbnail for smooth grid browsing
          thumbnailUrl: previewUrl || originalUrl, // Lightweight thumbnail for smooth grid browsing
          originalUrl: originalUrl, // 100% UNTOUCHED ORIGINAL RAW PHOTO
          size: file.size,
          type: file.type || "image/jpeg",
          uploadedAt: todayFormatted,
        })
      }

      // Persist full-res original photos to IndexedDB vault
      try {
        await saveOriginalPhotosBatch(newItems.map((p) => ({ id: p.id, data: p.originalUrl })))
      } catch (vaultErr) {
        console.warn("Could not save to photo-vault:", vaultErr)
      }

      const currentPhotos = directUploadTarget.photos || []
      const updatedPhotos = insertPhotosSideBySide(currentPhotos, newItems)
      const primaryPhoto = updatedPhotos[0]

      const updatedCollection: Asset = {
        ...directUploadTarget,
        photos: updatedPhotos,
        thumbnail: primaryPhoto?.thumbnailUrl || primaryPhoto?.url || directUploadTarget.thumbnail,
        updatedAt: todayFormatted,
        formats: {
          ...directUploadTarget.formats,
          [primaryPhoto?.type?.includes("png") ? "PNG" : "JPG"]: {
            fileName: primaryPhoto?.name || "photo.jpg",
            fileData: (primaryPhoto as any)?.originalUrl || primaryPhoto?.url || "",
          },
        },
      }

      updateCustomAsset(updatedCollection)
      toast.success(`Added ${newItems.length} photo(s) to "${directUploadTarget.name}"!`)
    } catch (err) {
      console.error("Direct photo upload failed:", err)
      toast.error("Failed to add photos. Please try again.")
    } finally {
      setDirectUploadTarget(null)
      setPendingDirectBatch([])
      setDuplicateInfoList([])
    }
  }

  const handleDirectFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !directUploadTarget) return

    const validFiles: File[] = []
    let hasInvalid = false

    Array.from(files).forEach((file) => {
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

    if (e.target) e.target.value = ""
    if (validFiles.length === 0) return

    // Check duplicates against collection photos
    const currentPhotos = directUploadTarget.photos || []
    const duplicates: DuplicateFileInfo[] = []
    const seenInBatch = new Set<string>()

    validFiles.forEach((file) => {
      const normalizedName = file.name.trim().toLowerCase()
      const existingMatch = currentPhotos.find((p) => p.name.trim().toLowerCase() === normalizedName)

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
      setPendingDirectBatch(validFiles)
      setDuplicateDialogOpen(true)
      return
    }

    runDirectUpload(validFiles.map((f) => ({ file: f })))
  }

  const handleSkipDirectDuplicates = () => {
    const duplicateFileSet = new Set(duplicateInfoList.map((d) => d.file))
    const nonDuplicates = pendingDirectBatch.filter((f) => !duplicateFileSet.has(f))

    setDuplicateDialogOpen(false)

    if (nonDuplicates.length > 0) {
      toast.info(`Skipping duplicates. Uploading ${nonDuplicates.length} new unique photo(s).`)
      runDirectUpload(nonDuplicates.map((f) => ({ file: f })))
    } else {
      toast.info("Duplicate photos skipped. Existing photos left unchanged.")
      setDirectUploadTarget(null)
      setPendingDirectBatch([])
      setDuplicateInfoList([])
    }
  }

  const handleKeepBothDirect = () => {
    if (!directUploadTarget) return
    // Keep both photos with original names (no renaming!) and display side by side
    const batch = pendingDirectBatch.map((f) => ({ file: f, customName: f.name }))

    setDuplicateDialogOpen(false)
    toast.info(`Keeping both photos side-by-side with original names.`)
    runDirectUpload(batch)
  }

  const handleCancelDirectDuplicates = () => {
    setDuplicateDialogOpen(false)
    setPendingDirectBatch([])
    setDuplicateInfoList([])
    setDirectUploadTarget(null)
  }

  // Lightbox State
  const [activeLightbox, setActiveLightbox] = React.useState<{
    collection: Asset
    photoIndex: number
  } | null>(null)
  const [lightboxOriginalUrl, setLightboxOriginalUrl] = React.useState<string | null>(null)
  const activeThumbnailRef = React.useRef<HTMLButtonElement>(null)

  // Hydrate 100% uncompressed original photo into Lightbox Viewer (never compressed)
  React.useEffect(() => {
    if (!activeLightbox) {
      setLightboxOriginalUrl(null)
      return
    }

    const currentPhoto = activeLightbox.collection.photos?.[activeLightbox.photoIndex] || activeLightbox.collection.photos?.[0]
    const formatData = activeLightbox.collection.formats?.PNG?.fileData || activeLightbox.collection.formats?.JPG?.fileData

    if (!currentPhoto) {
      setLightboxOriginalUrl(formatData || activeLightbox.collection.thumbnail || null)
      return
    }

    // Immediately pick the best available full-resolution candidate
    const initialBest = (currentPhoto as any).originalUrl || formatData || currentPhoto.url || activeLightbox.collection.thumbnail || null
    setLightboxOriginalUrl(initialBest)

    // Asynchronously resolve highest quality original from IndexedDB photo vault
    let isMounted = true
    const photoId = currentPhoto.id
    const colId = activeLightbox.collection.id

    const resolveVault = async () => {
      if (photoId) {
        const vaultData = await getOriginalPhoto(photoId)
        if (isMounted && vaultData) {
          setLightboxOriginalUrl(vaultData)
          return
        }
      }
      if (colId) {
        const colVaultData = await getOriginalPhoto(colId)
        if (isMounted && colVaultData) {
          setLightboxOriginalUrl(colVaultData)
          return
        }
      }
    }

    resolveVault().catch(() => {})

    return () => {
      isMounted = false
    }
  }, [activeLightbox])

  // Accordion Expanded State
  const [expandedCollections, setExpandedCollections] = React.useState<Record<string, boolean>>({})

  const toggleAccordion = (id: string) => {
    setExpandedCollections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Delete State
  const [deleteTarget, setDeleteTarget] = React.useState<Asset | null>(null)

  // Extract all photo assets
  const photoAssets = React.useMemo(() => {
    return assets.filter((a) => a.category === "photos")
  }, [assets])

  // Filter by Active Tab & Search
  const filteredAssets = React.useMemo(() => {
    return photoAssets.filter((asset) => {
      // Tab matching
      if (activeTab === "EVENTS") {
        if (asset.subCategory && asset.subCategory !== "Events") return false
      } else if (activeTab === "SITE") {
        if (asset.subCategory !== "Site") return false
      } else if (activeTab === "EMPLOYEE") {
        if (asset.subCategory !== "Employee") return false
      }

      // Search matching
      if (!searchQuery) return true
      const nameMatch = asset.name?.toLowerCase().includes(searchQuery)
      const dateMatch = asset.date?.toLowerCase().includes(searchQuery) || asset.createdAt?.toLowerCase().includes(searchQuery)
      const catMatch = asset.subCategory?.toLowerCase().includes(searchQuery)
      const designationMatch = asset.designation?.toLowerCase().includes(searchQuery)
      const companyMatch = asset.companyName?.toLowerCase().includes(searchQuery)
      const siteMatch = asset.siteLocation?.toLowerCase().includes(searchQuery)
      return nameMatch || dateMatch || catMatch || designationMatch || companyMatch || siteMatch
    })
  }, [photoAssets, activeTab, searchQuery])

  // Total count of photos across current filtered collections
  const totalPhotosCount = React.useMemo(() => {
    return filteredAssets.reduce((sum, item) => sum + (item.photos?.length || 1), 0)
  }, [filteredAssets])

  // Download a single employee portrait in full original quality
  const handleDownloadEmployeePhoto = async (emp: Asset) => {
    const photo = emp.photos?.[0]
    const vaultUrl = (photo?.id ? await getOriginalPhoto(photo.id) : null) || (await getOriginalPhoto(emp.id))
    const formatUrl = emp.formats?.PNG?.fileData || emp.formats?.JPG?.fileData
    const photoUrl = vaultUrl || formatUrl || (photo as any)?.originalUrl || photo?.url || emp.thumbnail

    if (!photoUrl) {
      toast.error("Photo not available for download.")
      return
    }

    const isPng =
      photo?.type?.includes("png") ||
      photo?.name?.toLowerCase().endsWith(".png") ||
      photoUrl.startsWith("data:image/png")
    const ext = isPng ? "png" : "jpg"
    const fileName = `${emp.name} - Portrait.${ext}`

    try {
      await downloadFileLossless(photoUrl, fileName)
      toast.success(`Downloaded "${fileName}" in 100% original quality`)
    } catch (err) {
      console.error("Download failed:", err)
      toast.error("Failed to download employee photo.")
    }
  }

  // Remove background directly for an existing employee asset
  const handleRemoveBgForEmployee = async (emp: Asset) => {
    const photo = emp.photos?.[0]
    const currentUrl = (photo ? await getOriginalPhoto(photo.id) : null) || photo?.url || emp.thumbnail
    if (!currentUrl) {
      toast.error("Photo not available.")
      return
    }

    toast.info(`Removing background for ${emp.name}...`)

    try {
      const result = await removePhotoBackground(currentUrl, {
        featherRadius: 1.8,
        edgeSharpness: 1.2,
        threshold: 0.45,
      })

      const photoId = "photo_emp_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
      await saveOriginalPhotosBatch([{ id: photoId, data: result.pngDataUrl }])

      const cleanName = `${emp.name} - Portrait-nobg.png`
      const todayFormatted = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date())

      const updatedPhoto: PhotoItem = {
        id: photoId,
        name: cleanName,
        url: result.pngDataUrl,
        thumbnailUrl: result.pngDataUrl,
        size: result.blob.size || Math.round(result.pngDataUrl.length * 0.75),
        type: "image/png",
        uploadedAt: todayFormatted,
      }

      const updatedAsset: Asset = {
        ...emp,
        thumbnail: result.pngDataUrl,
        updatedAt: todayFormatted,
        photos: [updatedPhoto],
        formats: {
          PNG: {
            fileName: cleanName,
            fileData: result.pngDataUrl,
          },
        },
      }

      updateCustomAsset(updatedAsset)
      toast.success(`Background removed cleanly for "${emp.name}"! Converted to transparent PNG.`)
    } catch (err) {
      console.error("Error removing employee background:", err)
      toast.error("Failed to remove background.")
    }
  }

  // Download all photos in a collection as a ZIP in 100% original quality
  const handleDownloadAllZip = async (collection: Asset) => {
    const photosList = collection.photos || []
    if (photosList.length === 0) {
      const fallbackUrl =
        (await getOriginalPhoto(collection.id)) ||
        collection.formats?.PNG?.fileData ||
        collection.formats?.JPG?.fileData ||
        collection.thumbnail

      if (fallbackUrl) {
        await downloadFileLossless(fallbackUrl, `${collection.name}.jpg`)
        toast.success(`Downloaded ${collection.name}.jpg in 100% original quality`)
      }
      return
    }

    try {
      toast.info(`Preparing 100% original-quality ZIP archive with ${photosList.length} photo(s)...`)
      const filesToZip = await Promise.all(
        photosList.map(async (p, idx) => {
          const originalData =
            (await getOriginalPhoto(p.id)) ||
            (await getOriginalPhoto(collection.id)) ||
            collection.formats?.PNG?.fileData ||
            collection.formats?.JPG?.fileData ||
            (p as any).originalUrl ||
            p.url
          return {
            fileName: p.name || `${collection.name}_photo_${idx + 1}.jpg`,
            fileData: originalData,
          }
        })
      )

      const safeName = (collection.name || "photos").replace(/[^a-z0-9_-]/gi, "_")
      await downloadGroupAsZip(`${safeName}_photos.zip`, filesToZip)
      toast.success(`Downloaded ${safeName}_photos.zip in 100% original quality`)
    } catch (err) {
      console.error("ZIP download failed:", err)
      toast.error("Failed to package ZIP archive. Try downloading individual photos.")
    }
  }

  // Download a single photo in 100% uncompressed original quality
  const handleDownloadSinglePhoto = async (photo: PhotoItem, collectionName: string) => {
    try {
      const originalData =
        (await getOriginalPhoto(photo.id)) ||
        (photo as any).originalUrl ||
        photo.url
      const fileName = photo.name || `${collectionName}.jpg`
      await downloadFileLossless(originalData, fileName)
      toast.success(`Downloaded original "${fileName}" in 100% quality`)
    } catch (err) {
      console.error("Single photo download error:", err)
      try {
        await downloadFileLossless(photo.url, photo.name || `${collectionName}.jpg`)
        toast.success(`Downloaded ${photo.name}`)
      } catch (innerErr) {
        toast.error("Failed to download photo.")
      }
    }
  }

  // Is current active lightbox an employee?
  const isEmployeeLightbox = activeLightbox?.collection.subCategory === "Employee"

  // Active photo item in current lightbox
  const currentPhotoItem: PhotoItem | undefined = React.useMemo(() => {
    if (!activeLightbox) return undefined
    const photos = activeLightbox.collection.photos
    if (photos && photos.length > 0) {
      return photos[activeLightbox.photoIndex] || photos[0]
    }
    return {
      id: activeLightbox.collection.id,
      name: activeLightbox.collection.name,
      url: activeLightbox.collection.thumbnail || "",
      thumbnailUrl: activeLightbox.collection.thumbnail || "",
      size: 0,
      type: "image/jpeg",
      uploadedAt: activeLightbox.collection.createdAt,
    } as PhotoItem
  }, [activeLightbox])

  // Thumbnail list for the bottom strip:
  // If Employee tab, show all filtered employee photos
  // If Events/Site, show all photos in current collection
  const lightboxThumbnails = React.useMemo(() => {
    if (!activeLightbox) return []
    if (isEmployeeLightbox) {
      return filteredAssets
        .filter((a) => a.subCategory === "Employee")
        .map((emp) => {
          const photo = emp.photos?.[0]
          const thumbUrl =
            photo?.thumbnailUrl ||
            photo?.url ||
            emp.thumbnail ||
            (photo as any)?.originalUrl ||
            emp.formats?.PNG?.fileData ||
            emp.formats?.JPG?.fileData ||
            ""
          return {
            id: emp.id,
            name: emp.name,
            url: thumbUrl,
            thumbnailUrl: thumbUrl,
            employeeAsset: emp,
          }
        })
    }
    const photos = activeLightbox.collection.photos || []
    if (photos.length > 0) {
      return photos.map((p) => {
        const thumbUrl = p.thumbnailUrl || p.url || (p as any).originalUrl
        return {
          id: p.id,
          name: p.name,
          url: thumbUrl,
          thumbnailUrl: thumbUrl,
          photoItem: p,
        }
      })
    }
    if (activeLightbox.collection.thumbnail) {
      return [
        {
          id: activeLightbox.collection.id,
          name: activeLightbox.collection.name,
          url: activeLightbox.collection.thumbnail,
          thumbnailUrl: activeLightbox.collection.thumbnail,
        },
      ]
    }
    return []
  }, [activeLightbox, isEmployeeLightbox, filteredAssets])

  // Navigation: go to Previous photo or employee
  const handleLightboxPrevious = React.useCallback(() => {
    if (!activeLightbox) return
    if (isEmployeeLightbox) {
      const empList = filteredAssets.filter((a) => a.subCategory === "Employee")
      if (empList.length <= 1) return
      const currentIdx = empList.findIndex((a) => a.id === activeLightbox.collection.id)
      const prevIdx = currentIdx > 0 ? currentIdx - 1 : empList.length - 1
      setActiveLightbox({ collection: empList[prevIdx], photoIndex: 0 })
    } else {
      const photos = activeLightbox.collection.photos || []
      if (photos.length <= 1) return
      const prevIdx = activeLightbox.photoIndex > 0 ? activeLightbox.photoIndex - 1 : photos.length - 1
      setActiveLightbox({ ...activeLightbox, photoIndex: prevIdx })
    }
  }, [activeLightbox, isEmployeeLightbox, filteredAssets])

  // Navigation: go to Next photo or employee
  const handleLightboxNext = React.useCallback(() => {
    if (!activeLightbox) return
    if (isEmployeeLightbox) {
      const empList = filteredAssets.filter((a) => a.subCategory === "Employee")
      if (empList.length <= 1) return
      const currentIdx = empList.findIndex((a) => a.id === activeLightbox.collection.id)
      const nextIdx = currentIdx < empList.length - 1 ? currentIdx + 1 : 0
      setActiveLightbox({ collection: empList[nextIdx], photoIndex: 0 })
    } else {
      const photos = activeLightbox.collection.photos || []
      if (photos.length <= 1) return
      const nextIdx = activeLightbox.photoIndex < photos.length - 1 ? activeLightbox.photoIndex + 1 : 0
      setActiveLightbox({ ...activeLightbox, photoIndex: nextIdx })
    }
  }, [activeLightbox, isEmployeeLightbox, filteredAssets])

  // Keyboard navigation for lightbox
  React.useEffect(() => {
    if (!activeLightbox) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        handleLightboxPrevious()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        handleLightboxNext()
      } else if (e.key === "Escape") {
        setActiveLightbox(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeLightbox, handleLightboxPrevious, handleLightboxNext])

  // Auto-scroll active thumbnail into view in bottom row
  React.useEffect(() => {
    if (activeThumbnailRef.current) {
      activeThumbnailRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      })
    }
  }, [activeLightbox?.photoIndex, activeLightbox?.collection.id])

  // Guarantee 100% uncompressed original photo resolution in Photo Viewer
  const currentPhotoUrl = React.useMemo(() => {
    if (lightboxOriginalUrl && lightboxOriginalUrl.length > 500) {
      return lightboxOriginalUrl
    }
    const candidates: (string | undefined | null)[] = [
      lightboxOriginalUrl,
      (currentPhotoItem as any)?.originalUrl,
      currentPhotoItem?.url,
      activeLightbox?.collection.formats?.PNG?.fileData,
      activeLightbox?.collection.formats?.JPG?.fileData,
      activeLightbox?.collection.thumbnail,
    ]
    const valid = candidates.filter((c): c is string => typeof c === "string" && c.length > 0)
    if (valid.length === 0) return ""
    const sorted = [...valid].sort((a, b) => b.length - a.length)
    return sorted[0]
  }, [lightboxOriginalUrl, currentPhotoItem, activeLightbox])

  const lightboxTitle = activeLightbox?.collection.name || "Photo Viewer"

  const lightboxSubTitle = React.useMemo(() => {
    if (!activeLightbox) return ""
    if (isEmployeeLightbox) {
      return [
        activeLightbox.collection.designation,
        activeLightbox.collection.companyName,
        activeLightbox.collection.siteLocation,
      ]
        .filter(Boolean)
        .join(" • ") || "Official Employee Photo"
    }
    const totalPhotos = activeLightbox.collection.photos?.length || 1
    const photoNum = `Photo ${activeLightbox.photoIndex + 1} of ${totalPhotos}`
    const dateStr = formatEventDate(activeLightbox.collection.date || activeLightbox.collection.createdAt)
    const photoName = currentPhotoItem?.name
    return `${photoNum} • ${dateStr}${photoName ? ` • ${photoName}` : ""}`
  }, [activeLightbox, isEmployeeLightbox, currentPhotoItem])

  // Active Category for the +Add modal
  const defaultModalCategory: PhotoCategory =
    activeTab === "SITE" ? "Site" : activeTab === "EMPLOYEE" ? "Employee" : "Events"

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in-50">
      {/* 
        ========================================================================
        ATTACHED IMAGE TYPE OF MENU: EVENTS, SITE, EMPLOYEE
        Clean, minimalist uppercase text, generous tracking, solid underline indicator
        ========================================================================
      */}
      <div className="w-full bg-card border-y border-border/80 px-4 sm:px-8 py-1 shadow-xs">
        <nav
          className="flex items-center justify-start sm:justify-start gap-8 sm:gap-14 overflow-x-auto no-scrollbar py-2"
          aria-label="Photo Categories"
        >
          {[
            { id: "EVENTS" as MenuTab, label: "EVENTS" },
            { id: "SITE" as MenuTab, label: "SITE" },
            { id: "EMPLOYEE" as MenuTab, label: "EMPLOYEE" },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative py-2.5 text-xs sm:text-sm font-semibold tracking-[0.24em] uppercase transition-all cursor-pointer whitespace-nowrap select-none",
                  isActive
                    ? "text-foreground font-bold"
                    : "text-muted-foreground/75 hover:text-foreground"
                )}
              >
                {tab.label}
                {/* Clean, sleek underline indicator as shown in attached image */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-foreground rounded-full transition-all" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Toolbar: Search, Count summary, and +Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={
              activeTab === "EMPLOYEE"
                ? "Search employees by name, designation, or location..."
                : `Search ${activeTab.toLowerCase()} photos by title or date...`
            }
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            className="pl-9.5 h-10 bg-background border-border text-xs sm:text-sm rounded-lg"
          />
        </div>

        {/* Right side: Count & +Add Button */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs text-muted-foreground hidden sm:inline-block">
            {activeTab === "EMPLOYEE" ? (
              <>
                <strong>{filteredAssets.length}</strong> employee{filteredAssets.length !== 1 ? "s" : ""}
              </>
            ) : (
              <>
                <strong>{filteredAssets.length}</strong> collection{filteredAssets.length !== 1 ? "s" : ""} (
                <strong>{totalPhotosCount}</strong> photo{totalPhotosCount !== 1 ? "s" : ""})
              </>
            )}
          </span>

          {activeTab === "EMPLOYEE" ? (
            <Button
              onClick={() => setIsAddEmployeeModalOpen(true)}
              className="h-11 px-5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
              <span>Add Employee Photo</span>
            </Button>
          ) : (
            <AddPhotoModal
              defaultCategory={defaultModalCategory}
              open={isAddModalOpen}
              onOpenChange={setIsAddModalOpen}
              trigger={
                <Button className="h-11 px-5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer">
                  <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
                  <span>Add Photo</span>
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* Gallery Content */}
      {filteredAssets.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 my-4 space-y-4">
          <div className="p-4 rounded-full bg-[#4472C4]/10 text-[#4472C4]">
            {activeTab === "EMPLOYEE" ? <Users className="h-10 w-10" /> : <ImageIcon className="h-10 w-10" />}
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-lg font-bold text-foreground">
              {searchQuery
                ? `No matching ${activeTab === "EMPLOYEE" ? "employees" : "photos"} found`
                : activeTab === "EMPLOYEE"
                ? "No employee photos uploaded yet"
                : `No ${activeTab.toLowerCase()} photos uploaded yet`}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {searchQuery
                ? `No records matched "${searchQuery}". Try a different name, designation, or keyword.`
                : activeTab === "EMPLOYEE"
                ? "Upload official employee portraits with designation and optional company details."
                : `Upload official ${activeTab.toLowerCase()} photography with multiple JPG & PNG photos.`}
            </p>
          </div>
          <Button
            onClick={() => {
              if (activeTab === "EMPLOYEE") {
                setIsAddEmployeeModalOpen(true)
              } else {
                setIsAddModalOpen(true)
              }
            }}
            className="h-11 px-5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
            <span>Add {activeTab === "SITE" ? "Site" : activeTab === "EMPLOYEE" ? "Employee" : "Events"} Photo{activeTab === "EMPLOYEE" ? "" : "s"}</span>
          </Button>
        </div>
      ) : activeTab === "EMPLOYEE" ? (
        /* ========================================================================
           EMPLOYEE PHOTO REPOSITORY (NO GROUPS)
           Each one photo in a Circle with below that his name and below that thin text his designation only
           ======================================================================== */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10 justify-items-center py-6 w-full">
          {filteredAssets.map((emp) => {
            const photo = emp.photos?.[0]
            const photoUrl =
              photo?.thumbnailUrl ||
              photo?.url ||
              emp.thumbnail ||
              (photo as any)?.originalUrl ||
              emp.formats?.PNG?.fileData ||
              emp.formats?.JPG?.fileData ||
              ""

            return (
              <div
                key={emp.id}
                className="group flex flex-col items-center text-center w-full max-w-[170px] relative select-none"
              >
                {/* 1. Photo in Circle */}
                <div
                  onClick={() => setActiveLightbox({ collection: emp, photoIndex: 0 })}
                  className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-700/80 bg-neutral-100 dark:bg-neutral-800/80 shadow-xs group-hover:shadow-md group-hover:border-[#4472C4] hover:scale-105 transition-all duration-300 cursor-pointer shrink-0"
                  title={`Click to view ${emp.name}'s photo in full resolution`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt={emp.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover overlay with eye icon */}
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white drop-shadow-md" />
                  </div>
                </div>

                {/* Floating Options Menu Trigger on Hover */}
                <div className="absolute top-0 right-1 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          className="p-1.5 rounded-full bg-background/95 hover:bg-muted border border-border/80 text-foreground shadow-xs cursor-pointer transition-colors"
                          title="Employee Options"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-40 text-xs">
                      <DropdownMenuItem
                        onClick={() => setActiveLightbox({ collection: emp, photoIndex: 0 })}
                        className="cursor-pointer text-xs"
                      >
                        <Eye className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        View Full Photo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEditEmployeeTarget(emp)}
                        className="cursor-pointer text-xs"
                      >
                        <Pencil className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDownloadEmployeePhoto(emp)}
                        className="cursor-pointer text-xs"
                      >
                        <Download className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        Download Photo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRemoveBgForEmployee(emp)}
                        className="cursor-pointer text-xs text-violet-600 dark:text-violet-400"
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-2 text-violet-500" />
                        Remove Background
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(emp)}
                        className="text-red-600 focus:text-red-600 cursor-pointer text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* 2. Below that his name */}
                <h4
                  className="mt-3 font-semibold text-sm sm:text-base text-foreground tracking-tight text-center line-clamp-1 max-w-full px-1"
                  title={emp.name}
                >
                  {emp.name}
                </h4>

                {/* 3. Below that thin text his designation only */}
                <p
                  className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 font-light text-center line-clamp-2 max-w-full leading-snug px-1"
                  title={emp.designation || ""}
                >
                  {emp.designation || "Employee"}
                </p>
              </div>
            )
          })}
        </div>
      ) : (
        /* Photo Collections (Horizontal Tile matching Events & Site layout) */
        <div className="flex flex-col gap-6 w-full">
          {filteredAssets.map((collection) => {
            const photosList = collection.photos || []
            const photoCount = photosList.length || (collection.thumbnail ? 1 : 0)
            const formattedDate = formatEventDate(collection.date || collection.createdAt)

            // Slot array: display up to 8 tiles across
            const TOTAL_SLOTS = 8
            const displayedPhotos = photosList.slice(0, TOTAL_SLOTS)
            const emptySlotsCount = Math.max(0, TOTAL_SLOTS - (displayedPhotos.length || (collection.thumbnail ? 1 : 0)))
            const isExpanded = !!expandedCollections[collection.id]

            const isSite = collection.subCategory === "Site"
            const typeLabel = isSite ? "Site" : "Event"

            return (
              <div
                key={collection.id}
                className="w-full rounded-[24px] border border-neutral-200 dark:border-neutral-800 bg-card p-6 sm:p-7 shadow-xs hover:shadow-sm transition-all flex flex-col gap-5 text-left"
              >
                {/* Header Row: Event/Site Name & Subtitle on Left, Action Icons on Right */}
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Event/Site Name & Subtitle */}
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      {collection.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-normal">
                      Date: {formattedDate} | Total Photos: {photoCount}
                    </p>
                  </div>

                  {/* Right: Action Icons (Edit, Plus, Download, More Options) */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* 1) Edit Icon */}
                    <button
                      type="button"
                      onClick={() => setEditTarget(collection)}
                      className="p-1.5 text-neutral-500 hover:text-foreground hover:bg-muted/70 rounded-lg transition-colors cursor-pointer"
                      title={`Edit ${typeLabel} & Manage Photos`}
                    >
                      <Pencil className="h-5 w-5" />
                    </button>

                    {/* 2) Plus (+) Icon */}
                    <button
                      type="button"
                      onClick={() => handleTriggerDirectUpload(collection)}
                      className="p-1.5 text-neutral-500 hover:text-foreground hover:bg-muted/70 rounded-lg transition-colors cursor-pointer"
                      title="Add Photos Directly"
                    >
                      <Plus className="h-5 w-5" />
                    </button>

                    {/* 3) Download Icon */}
                    <button
                      type="button"
                      onClick={() => handleDownloadAllZip(collection)}
                      className="p-1.5 text-neutral-500 hover:text-foreground hover:bg-muted/70 rounded-lg transition-colors cursor-pointer"
                      title="Download All Photos (ZIP)"
                    >
                      <Download className="h-5 w-5" />
                    </button>

                    {/* 4) More Options Icon (...) */}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <button
                            type="button"
                            className="p-1.5 text-neutral-500 hover:text-foreground hover:bg-muted/70 rounded-lg transition-colors cursor-pointer"
                            title="More Options"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={() => setEditTarget(collection)}
                          className="cursor-pointer text-xs"
                        >
                          <Pencil className="h-4 w-4 mr-2 text-muted-foreground" />
                          Edit {typeLabel}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTriggerDirectUpload(collection)}
                          className="cursor-pointer text-xs"
                        >
                          <Plus className="h-4 w-4 mr-2 text-muted-foreground" />
                          Add Photos
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setActiveLightbox({ collection, photoIndex: 0 })}
                          className="cursor-pointer text-xs"
                        >
                          <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                          View Photos
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownloadAllZip(collection)}
                          className="cursor-pointer text-xs"
                        >
                          <Download className="h-4 w-4 mr-2 text-muted-foreground" />
                          Download ZIP
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(collection)}
                          className="text-red-600 focus:text-red-600 cursor-pointer text-xs"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete {typeLabel}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Main Body: Horizontal Row of 8 Rounded Photo Thumbnails */}
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-3.5 w-full">
                  {/* Real Photo Tiles */}
                  {displayedPhotos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      onClick={() => setActiveLightbox({ collection, photoIndex: idx })}
                      className="group relative aspect-4/3 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/50 cursor-pointer shadow-2xs hover:opacity-95 hover:scale-[1.02] transition-all select-none"
                      title={photo.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.thumbnailUrl || photo.url || (photo as any).originalUrl}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="h-4 w-4 text-white drop-shadow-sm" />
                      </div>
                    </div>
                  ))}

                  {/* Fallback if single thumbnail and no photos list */}
                  {displayedPhotos.length === 0 && collection.thumbnail && (
                    <div
                      onClick={() => setActiveLightbox({ collection, photoIndex: 0 })}
                      className="group relative aspect-4/3 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/50 cursor-pointer shadow-2xs hover:opacity-95 hover:scale-[1.02] transition-all select-none"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={collection.thumbnail}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Placeholder Slots to complete the 8-tile row layout as shown in the example image */}
                  {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                    <div
                      key={`slot_${idx}`}
                      className="aspect-4/3 rounded-xl bg-neutral-100/90 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/30 transition-colors"
                    />
                  ))}
                </div>

                {/* Smooth Accordion Expansion Area */}
                <div
                  className={cn(
                    "grid transition-all duration-500 ease-in-out overflow-hidden",
                    isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden space-y-3">
                    {photosList.length > TOTAL_SLOTS ? (
                      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-3.5 w-full pt-1">
                        {photosList.slice(TOTAL_SLOTS).map((photo, idx) => {
                          const actualIdx = TOTAL_SLOTS + idx
                          return (
                            <div
                              key={photo.id}
                              onClick={() => setActiveLightbox({ collection, photoIndex: actualIdx })}
                              className="group relative aspect-4/3 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/50 cursor-pointer shadow-2xs hover:opacity-95 hover:scale-[1.02] transition-all select-none"
                              title={photo.name}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={photo.thumbnailUrl || photo.url || (photo as any).originalUrl}
                                alt={photo.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye className="h-4 w-4 text-white drop-shadow-sm" />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      /* Detailed interactive photo cards when 8 or fewer photos */
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
                        {photosList.map((photo, idx) => (
                          <div
                            key={photo.id}
                            className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-2.5 flex items-center gap-3 text-left shadow-2xs"
                          >
                            <div
                              onClick={() => setActiveLightbox({ collection, photoIndex: idx })}
                              className="h-12 w-14 rounded-lg overflow-hidden shrink-0 bg-muted cursor-pointer border border-border/60 hover:opacity-90 transition-opacity"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={photo.thumbnailUrl || photo.url || (photo as any).originalUrl} alt={photo.name} className="h-full w-full object-cover" loading="lazy" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate" title={photo.name}>
                                {photo.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground uppercase font-medium">
                                {photo.type?.includes("png") ? "PNG" : "JPG"} • {photo.size ? `${(photo.size / (1024 * 1024)).toFixed(1)} MB` : "Image"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDownloadSinglePhoto(photo, collection.name)}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                              title="Download this photo"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Pill Button on the Right: "Show All" / "Show Less" */}
                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(collection.id)}
                    className="inline-flex items-center justify-center rounded-full border border-blue-400 bg-blue-50/40 hover:bg-blue-100/80 dark:bg-blue-950/30 dark:hover:bg-blue-900/50 dark:border-blue-500/60 text-[#4472C4] dark:text-blue-400 text-xs font-semibold px-4 py-1 transition-all shadow-2xs cursor-pointer select-none"
                  >
                    {isExpanded ? "Show Less" : "Show All"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Hidden File Input for Direct (+) Photo Upload */}
      <input
        ref={directFileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="hidden"
        onChange={handleDirectFileChange}
      />

      {/* Edit Photo Collection Modal */}
      {editTarget && (
        <EditPhotoModal
          collection={editTarget}
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
        />
      )}

      {/* Add Employee Photo Modal */}
      <AddEmployeePhotoModal
        open={isAddEmployeeModalOpen}
        onOpenChange={setIsAddEmployeeModalOpen}
      />

      {/* Edit Employee Photo Modal */}
      <EditEmployeePhotoModal
        employee={editEmployeeTarget}
        open={!!editEmployeeTarget}
        onOpenChange={(open) => !open && setEditEmployeeTarget(null)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteAsset(deleteTarget.id)
            const isEmp = deleteTarget.subCategory === "Employee"
            toast.success(`${isEmp ? "Employee photo" : "Photo collection"} "${deleteTarget.name}" deleted.`)
            setDeleteTarget(null)
          }
        }}
        title={`Delete ${deleteTarget?.subCategory === "Employee" ? "Employee Photo" : deleteTarget?.subCategory === "Site" ? "Site" : "Event"}`}
        description={`Are you sure you want to delete "${deleteTarget?.name}"? ${deleteTarget?.subCategory === "Employee" ? "This employee photo will be permanently removed from the repository." : "All photos in this collection will be permanently removed."}`}
      />

      {/* Full-Screen Interactive Lightbox Viewer (Letterhead-style frosted canvas with row list of photos) */}
      {activeLightbox && (
        <Dialog
          open={!!activeLightbox}
          onOpenChange={(open) => !open && setActiveLightbox(null)}
        >
          <DialogContent
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[98vw] max-w-[1550px] 2xl:max-w-[1750px] h-[88vh] p-0 overflow-hidden bg-black/25 border-0 ring-0 shadow-2xl rounded-2xl flex flex-col items-center justify-between outline-none text-white select-none animate-in zoom-in-95 duration-200"
            overlayClassName="bg-black/15 backdrop-blur-[8px]"
            showCloseButton={true}
          >
            <DialogTitle className="sr-only">
              {lightboxTitle || "Photo Viewer"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {lightboxSubTitle || "Photo repository high-resolution preview"}
            </DialogDescription>

            {/* Main Stage: Interactive Image Canvas (Letterhead engine with wheel zoom, drag-to-pan & zoom slider) */}
            <div className="relative w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden">
              {currentPhotoUrl ? (
                <InteractiveImageCanvas
                  key={currentPhotoUrl}
                  src={currentPhotoUrl}
                  alt={lightboxTitle}
                  title={lightboxTitle}
                  subTitle={lightboxSubTitle}
                />
              ) : (
                <div className="text-white/60 text-sm">No photo available</div>
              )}

              {/* Navigation Chevrons (Previous / Next) */}
              {lightboxThumbnails.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handleLightboxPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/35 hover:bg-black/65 border border-white/15 text-white backdrop-blur-md transition-all cursor-pointer z-30 shadow-lg active:scale-95 hover:scale-105"
                    title="Previous photo (Left Arrow)"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={handleLightboxNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/35 hover:bg-black/65 border border-white/15 text-white backdrop-blur-md transition-all cursor-pointer z-30 shadow-lg active:scale-95 hover:scale-105"
                    title="Next photo (Right Arrow)"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Bar: Row of all Photos + Quick Actions */}
            <div className="w-full bg-black/35 backdrop-blur-md border-t border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 z-30 shrink-0">
              {/* Left: Category Badge & Original Quality indicator */}
              <div className="hidden sm:flex items-center gap-2.5 shrink-0">
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white shadow-xs",
                    activeLightbox.collection.subCategory === "Events"
                      ? "bg-purple-600/90"
                      : activeLightbox.collection.subCategory === "Site"
                      ? "bg-blue-600/90"
                      : "bg-emerald-600/90"
                  )}
                >
                  {activeLightbox.collection.subCategory || "Events"}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  <span>Original Quality</span>
                </div>
              </div>

              {/* Center: List of all photos in rows / thumbnail strip */}
              {lightboxThumbnails.length > 1 ? (
                <div
                  onWheel={(e) => {
                    if (e.deltaY !== 0) {
                      e.currentTarget.scrollLeft += e.deltaY
                    }
                  }}
                  className="flex-1 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar py-1 px-2 max-w-full"
                >
                  {lightboxThumbnails.map((item, idx) => {
                    const isCurrent = isEmployeeLightbox
                      ? activeLightbox.collection.id === item.id
                      : activeLightbox.photoIndex === idx

                    return (
                      <button
                        key={item.id || idx}
                        ref={isCurrent ? activeThumbnailRef : undefined}
                        type="button"
                        onClick={() => {
                          if (isEmployeeLightbox) {
                            const emp = filteredAssets.find((a) => a.id === item.id)
                            if (emp) setActiveLightbox({ collection: emp, photoIndex: 0 })
                          } else {
                            setActiveLightbox({ ...activeLightbox, photoIndex: idx })
                          }
                        }}
                        className={cn(
                          "relative h-11 w-14 sm:h-12 sm:w-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 shadow-sm",
                          isCurrent
                            ? "border-[#548235] ring-2 ring-[#548235]/60 scale-105 opacity-100"
                            : "border-white/20 opacity-50 hover:opacity-90 hover:scale-102"
                        )}
                        title={item.name}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url || item.thumbnailUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 bg-black/75 text-[9px] text-white/90 px-1 font-mono font-bold rounded-tl leading-tight">
                          {idx + 1}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex-1" />
              )}

              {/* Right: Quick Download Actions (Letterhead style green button & ZIP) */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Download Single Photo Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isEmployeeLightbox) {
                      handleDownloadEmployeePhoto(activeLightbox.collection)
                    } else if (currentPhotoItem) {
                      handleDownloadSinglePhoto(currentPhotoItem, activeLightbox.collection.name)
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#548235] text-white hover:bg-[#60963c] transition-all text-xs font-bold shadow-md active:scale-95 cursor-pointer"
                  title="Download photo in original quality"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download Photo</span>
                </button>

                {/* Download All (ZIP) button */}
                {!isEmployeeLightbox && (activeLightbox.collection.photos?.length || 0) > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDownloadAllZip(activeLightbox.collection)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all text-xs font-bold shadow-sm active:scale-95 cursor-pointer hidden md:flex"
                    title="Download all collection photos as ZIP"
                  >
                    <FileArchive className="h-3.5 w-3.5 text-blue-400" />
                    <span>All (ZIP)</span>
                  </button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Duplicate Photo Detection & Resolution Popout for Direct Upload */}
      <DuplicatePhotoDialog
        open={duplicateDialogOpen}
        onOpenChange={setDuplicateDialogOpen}
        duplicates={duplicateInfoList}
        totalNewFilesCount={pendingDirectBatch.length}
        onSkipDuplicates={handleSkipDirectDuplicates}
        onKeepBoth={handleKeepBothDirect}
        onCancel={handleCancelDirectDuplicates}
      />
    </div>
  )
}
