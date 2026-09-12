"use client"

import * as React from "react"
import {
  UploadCloud,
  X,
  User,
  Briefcase,
  Building2,
  MapPin,
  Image as ImageIcon,
  Check,
  CheckCheck,
  Loader2,
  Camera,
  RefreshCw,
  Sparkles,
  Undo2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAssets } from "@/lib/assets/assets-context"
import { useCompanyMaster } from "@/lib/company-master/company-master-context"
import { Asset, PhotoItem } from "@/components/assets/asset-tile"
import { compressImage, formatFileSize } from "./add-photo-modal"
import { saveOriginalPhotosBatch } from "@/lib/assets/photo-vault"
import { removePhotoBackground } from "@/lib/utils/background-remover"
import { cn } from "@/lib/utils"

interface AddEmployeePhotoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface UploadedEmployeePhoto {
  file: File
  name: string
  size: number
  previewUrl: string
  originalUrl: string
  format: "JPG" | "PNG"
}

export function AddEmployeePhotoModal({
  open,
  onOpenChange,
  onSuccess,
}: AddEmployeePhotoModalProps) {
  const { addCustomAsset } = useAssets()
  const { getUniqueCompanyNames, getSitesForCompany, companies } = useCompanyMaster()

  // Form State
  const [employeeName, setEmployeeName] = React.useState("")
  const [designation, setDesignation] = React.useState("")
  const [company, setCompany] = React.useState("")
  const [siteLocation, setSiteLocation] = React.useState("")
  const [uploadedPhoto, setUploadedPhoto] = React.useState<UploadedEmployeePhoto | null>(null)
  const [originalPhotoBackup, setOriginalPhotoBackup] = React.useState<{
    previewUrl: string
    originalUrl: string
    name: string
    format: "JPG" | "PNG"
    size: number
  } | null>(null)
  const [isRemovingBg, setIsRemovingBg] = React.useState(false)
  const [isBgRemoved, setIsBgRemoved] = React.useState(false)

  const [isDragging, setIsDragging] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Companies & Sites from Company Master
  const companyOptions = React.useMemo(() => {
    const photoCompanies = getUniqueCompanyNames("photos")
    if (photoCompanies.length > 0) return photoCompanies
    return getUniqueCompanyNames()
  }, [getUniqueCompanyNames])

  const siteOptions = React.useMemo(() => {
    if (company) {
      const sites = getSitesForCompany(company, "photos")
      if (sites.length > 0) return sites
      const allCompanySites = getSitesForCompany(company)
      if (allCompanySites.length > 0) return allCompanySites
    }
    // Fallback: all active sites from Company Master
    const allSites = new Set<string>()
    companies.forEach((c) => {
      if (c.status !== "hold" && c.siteLocation) allSites.add(c.siteLocation)
    })
    return Array.from(allSites)
  }, [company, getSitesForCompany, companies])

  const resetForm = () => {
    setEmployeeName("")
    setDesignation("")
    setCompany("")
    setSiteLocation("")
    setUploadedPhoto(null)
    setOriginalPhotoBackup(null)
    setIsBgRemoved(false)
    setIsRemovingBg(false)
    setIsDragging(false)
    setIsSaving(false)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  // Handle single photo upload with strict PNG & JPG validation
  const handlePhotoFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase()
    const isPng = ext === "png" || file.type === "image/png"
    const isJpg = ext === "jpg" || ext === "jpeg" || file.type === "image/jpeg"

    if (!isPng && !isJpg) {
      toast.error("Invalid file format. Only PNG and JPG photos are allowed.")
      return
    }

    try {
      toast.info("Processing employee portrait...")
      const { previewUrl, originalUrl } = await compressImage(file)
      setUploadedPhoto({
        file,
        name: file.name,
        size: file.size,
        previewUrl,
        originalUrl,
        format: isPng ? "PNG" : "JPG",
      })
      setOriginalPhotoBackup(null)
      setIsBgRemoved(false)
      toast.success("Photo uploaded successfully!")
    } catch (err) {
      console.error("Error processing photo:", err)
      toast.error("Failed to process photo. Please try again.")
    }
  }

  // Pure-code in-browser background removal
  const handleRemoveBackground = async () => {
    if (!uploadedPhoto) return

    setIsRemovingBg(true)
    toast.info("Removing photo background...")

    try {
      // Back up original photo details before removal
      if (!originalPhotoBackup) {
        setOriginalPhotoBackup({
          previewUrl: uploadedPhoto.previewUrl,
          originalUrl: uploadedPhoto.originalUrl,
          name: uploadedPhoto.name,
          format: uploadedPhoto.format,
          size: uploadedPhoto.size,
        })
      }

      // Execute in-browser AI segmentation algorithm (PhotoRoom-style soft edge matting)
      const result = await removePhotoBackground(uploadedPhoto.originalUrl, {
        featherRadius: 1.8,
        edgeSharpness: 1.2,
        threshold: 0.45,
      })

      // Convert PNG result blob to File
      const baseName = uploadedPhoto.name.replace(/\.[^/.]+$/, "")
      const cleanName = `${baseName}-transparent.png`
      const pngFile = new File([result.blob], cleanName, { type: "image/png" })

      setUploadedPhoto({
        file: pngFile,
        name: cleanName,
        size: result.blob.size || Math.round(result.pngDataUrl.length * 0.75),
        previewUrl: result.pngDataUrl,
        originalUrl: result.pngDataUrl,
        format: "PNG",
      })

      setIsBgRemoved(true)
      toast.success("Background removed cleanly! Converted to transparent PNG.")
    } catch (err) {
      console.error("Background removal error:", err)
      toast.error("Failed to remove background. Please try another photo.")
    } finally {
      setIsRemovingBg(false)
    }
  }

  // Restore original photo with background
  const handleRestoreOriginalBg = () => {
    if (!originalPhotoBackup) return
    setUploadedPhoto((prev) => {
      if (!prev) return null
      return {
        ...prev,
        previewUrl: originalPhotoBackup.previewUrl,
        originalUrl: originalPhotoBackup.originalUrl,
        name: originalPhotoBackup.name,
        format: originalPhotoBackup.format,
        size: originalPhotoBackup.size,
      }
    })
    setIsBgRemoved(false)
    toast.info("Restored original photo with background.")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handlePhotoFile(files[0])
    }
    if (e.target) e.target.value = ""
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
      handlePhotoFile(e.dataTransfer.files[0])
    }
  }

  const handleSave = async () => {
    // 1. Validate Employee Name
    if (!employeeName.trim()) {
      toast.error("Please enter Employee Name.")
      return
    }

    // 2. Validate Designation
    if (!designation.trim()) {
      toast.error("Please enter Designation.")
      return
    }

    // 4. Validate Photo
    if (!uploadedPhoto) {
      toast.error("Please upload an Employee Photo in PNG or JPG format.")
      return
    }

    setIsSaving(true)

    try {
      const todayFormatted = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date())

      const photoId = "photo_emp_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36)

      // 100% Uncompressed original photo preserved to vault
      await saveOriginalPhotosBatch([
        {
          id: photoId,
          data: uploadedPhoto.originalUrl,
        },
      ])

      const photoItem: PhotoItem = {
        id: photoId,
        name: `${employeeName.trim()} - Portrait.${uploadedPhoto.format.toLowerCase()}`,
        url: uploadedPhoto.previewUrl || uploadedPhoto.originalUrl,
        thumbnailUrl: uploadedPhoto.previewUrl || uploadedPhoto.originalUrl,
        originalUrl: uploadedPhoto.originalUrl, // 100% UNTOUCHED ORIGINAL RAW PHOTO
        size: uploadedPhoto.size,
        type: uploadedPhoto.format === "PNG" ? "image/png" : "image/jpeg",
        uploadedAt: todayFormatted,
      }

      const newAsset: Asset = {
        id: "emp_photo_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        name: employeeName.trim(),
        designation: designation.trim(),
        companyName: company.trim() || undefined,
        siteLocation: siteLocation.trim() || undefined,
        category: "photos",
        subCategory: "Employee",
        status: "active",
        createdAt: todayFormatted,
        updatedAt: todayFormatted,
        createdBy: "Administrator",
        date: todayFormatted,
        thumbnail: uploadedPhoto.previewUrl || uploadedPhoto.originalUrl, // Lightweight thumbnail for fast circle render
        photos: [photoItem],
        formats: {
          [uploadedPhoto.format]: {
            fileName: `${employeeName.trim()} - Portrait.${uploadedPhoto.format.toLowerCase()}`,
            fileData: uploadedPhoto.originalUrl, // 100% ORIGINAL RAW QUALITY
          },
        },
      }

      addCustomAsset(newAsset)
      toast.success(`Employee "${employeeName.trim()}" added to photo repository!`)
      handleClose()
      onSuccess?.()
    } catch (err) {
      console.error("Error saving employee photo:", err)
      toast.error("Failed to save employee photo. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => (val ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-[620px] w-[95vw] max-h-[92vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border bg-card/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#4472C4]/10 text-[#4472C4]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                + Add Employee Photo
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Upload official employee portrait with designation and optional company details.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 1. Text Box: Employee Name */}
          <div className="space-y-1.5">
            <Label htmlFor="emp-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span>Employee Name</span>
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="emp-name"
                type="text"
                placeholder="e.g. Rajesh Sharma"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="pl-9.5 h-11 text-sm bg-background border-border focus-visible:ring-1 focus-visible:ring-[#4472C4]"
                autoFocus
              />
            </div>
          </div>

          {/* 2. Text Box: Designation */}
          <div className="space-y-1.5">
            <Label htmlFor="emp-designation" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span>Designation</span>
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="emp-designation"
                type="text"
                placeholder="e.g. Chief Technology Officer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="pl-9.5 h-11 text-sm bg-background border-border focus-visible:ring-1 focus-visible:ring-[#4472C4]"
              />
            </div>
          </div>

          {/* 3. Company / Site Location (Not mandatory, connected with Company Master) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-[#4472C4]" />
                <span>Company / Site Location</span>
              </Label>
              <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground py-0.5">
                Not Mandatory • Company Master
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Company Dropdown */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                  Company (Optional)
                </label>
                <div className="relative">
                  <select
                    value={company}
                    onChange={(e) => {
                      setCompany(e.target.value)
                      setSiteLocation("") // reset site when company changes
                    }}
                    className="w-full h-10 px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#4472C4] cursor-pointer"
                  >
                    <option value="">-- Select Company (Optional) --</option>
                    {companyOptions.map((comp) => (
                      <option key={comp} value={comp}>
                        {comp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Site Location Dropdown */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                  Site Location (Optional)
                </label>
                <div className="relative">
                  <select
                    value={siteLocation}
                    onChange={(e) => setSiteLocation(e.target.value)}
                    className="w-full h-10 px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#4472C4] cursor-pointer"
                  >
                    <option value="">-- Select Site Location (Optional) --</option>
                    {siteOptions.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Upload Photo (One Tile to Upload Photo in PNG & JPG Only) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-[#4472C4]" />
                <span>Upload Photo</span>
                <span className="text-red-500">*</span>
              </Label>
              <Badge className="bg-[#4472C4]/10 text-[#4472C4] border-[#4472C4]/20 text-[10px] font-bold uppercase tracking-wider py-0.5">
                PNG &amp; JPG Only
              </Badge>
            </div>

            {/* Hidden Single File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="hidden"
              onChange={handleFileChange}
            />

            {!uploadedPhoto ? (
              /* Upload Dropzone Tile (When no photo selected yet) */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none",
                  isDragging
                    ? "border-[#4472C4] bg-[#4472C4]/10 scale-[0.99]"
                    : "border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30 hover:border-[#4472C4] hover:bg-[#4472C4]/5"
                )}
              >
                <div className="p-3.5 rounded-full bg-[#4472C4]/10 text-[#4472C4] mb-3">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Click to upload employee photo or drag &amp; drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supported formats: <strong className="text-foreground">PNG</strong> or <strong className="text-foreground">JPG</strong> only (Max 25MB)
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-[11px] font-medium">
                  <span>Square 1:1 portrait recommended for best circular display</span>
                </div>
              </div>
            ) : (
              /* Uploaded Photo Preview Tile (Single tile with circular portrait preview & Remove BG action) */
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-4 min-w-0">
                  {/* Circular Portrait Preview with checkered transparency indicator when BG removed */}
                  <div
                    className={cn(
                      "relative w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 shadow-sm shrink-0",
                      isBgRemoved
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-neutral-100 dark:bg-neutral-800"
                        : "border-[#4472C4] bg-neutral-200 dark:bg-neutral-800"
                    )}
                    style={
                      isBgRemoved
                        ? {
                            backgroundImage:
                              "linear-gradient(45deg, rgba(150,150,150,0.2) 25%, transparent 25%), linear-gradient(-45deg, rgba(150,150,150,0.2) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(150,150,150,0.2) 75%), linear-gradient(-45deg, transparent 75%, rgba(150,150,150,0.2) 75%)",
                            backgroundSize: "12px 12px",
                            backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
                          }
                        : undefined
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadedPhoto.previewUrl}
                      alt="Employee Portrait Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#4472C4] text-white">
                        {uploadedPhoto.format}
                      </span>
                      {isBgRemoved ? (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCheck className="h-3 w-3" /> Transparent BG
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Ready
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-foreground truncate max-w-[200px] sm:max-w-[260px]" title={uploadedPhoto.name}>
                      {uploadedPhoto.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatFileSize(uploadedPhoto.size)} • {isBgRemoved ? "Smooth PNG Cutout" : "High Resolution"}
                    </p>
                  </div>
                </div>

                {/* Actions: Remove BG / Restore, Change, Remove */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {/* Remove BG Button */}
                  {!isBgRemoved ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleRemoveBackground}
                      disabled={isRemovingBg}
                      className="h-8 text-xs gap-1.5 cursor-pointer bg-gradient-to-r from-violet-600 to-[#4472C4] hover:from-violet-700 hover:to-[#365ca0] text-white shadow-xs font-semibold"
                      title="Remove background in pure in-browser code and convert to transparent PNG"
                    >
                      {isRemovingBg ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Removing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                          <span>Remove BG</span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRestoreOriginalBg}
                      className="h-8 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground border-border hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title="Restore original photo background"
                    >
                      <Undo2 className="h-3 w-3" />
                      <span>Restore BG</span>
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isRemovingBg}
                    className="h-8 text-xs gap-1.5 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  >
                    <RefreshCw className="h-3 w-3" /> Change
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadedPhoto(null)
                      setOriginalPhotoBackup(null)
                      setIsBgRemoved(false)
                    }}
                    disabled={isRemovingBg}
                    className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer px-2"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 px-6 border-t border-border bg-card/50 flex sm:justify-between items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSaving}
            className="text-xs cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !employeeName.trim() || !designation.trim() || !uploadedPhoto}
            className="bg-[#4472C4] hover:bg-[#365ca0] text-white gap-2 font-semibold shadow-sm cursor-pointer text-xs px-5 h-9.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Save Employee Photo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
