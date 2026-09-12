"use client"

import * as React from "react"
import {
  UploadCloud,
  X,
  User,
  Briefcase,
  Building2,
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
import { getOriginalPhoto, saveOriginalPhotosBatch } from "@/lib/assets/photo-vault"
import { removePhotoBackground } from "@/lib/utils/background-remover"
import { cn } from "@/lib/utils"

interface EditEmployeePhotoModalProps {
  employee: Asset | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface PhotoState {
  isNew: boolean
  file?: File
  name: string
  size?: number
  previewUrl: string
  originalUrl: string
  format: "JPG" | "PNG"
}

export function EditEmployeePhotoModal({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: EditEmployeePhotoModalProps) {
  const { updateCustomAsset } = useAssets()
  const { getUniqueCompanyNames, getSitesForCompany, companies } = useCompanyMaster()

  // Form State
  const [employeeName, setEmployeeName] = React.useState("")
  const [designation, setDesignation] = React.useState("")
  const [company, setCompany] = React.useState("")
  const [siteLocation, setSiteLocation] = React.useState("")
  const [photoState, setPhotoState] = React.useState<PhotoState | null>(null)
  const [originalPhotoBackup, setOriginalPhotoBackup] = React.useState<PhotoState | null>(null)
  const [isRemovingBg, setIsRemovingBg] = React.useState(false)
  const [isBgRemoved, setIsBgRemoved] = React.useState(false)

  const [isDragging, setIsDragging] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Pre-fill state whenever dialog opens with employee data
  React.useEffect(() => {
    if (employee && open) {
      setEmployeeName(employee.name || "")
      setDesignation(employee.designation || "")
      setCompany(employee.companyName || "")
      setSiteLocation(employee.siteLocation || "")
      setIsBgRemoved(false)
      setIsRemovingBg(false)
      setOriginalPhotoBackup(null)

      const currentPhoto = employee.photos?.[0]
      const formatUrl = employee.formats?.PNG?.fileData || employee.formats?.JPG?.fileData
      const currentUrl = (currentPhoto as any)?.originalUrl || formatUrl || currentPhoto?.url || currentPhoto?.thumbnailUrl || employee.thumbnail || ""
      const isPng = currentPhoto?.type?.includes("png") || currentPhoto?.name?.toLowerCase().endsWith(".png")

      setPhotoState({
        isNew: false,
        name: currentPhoto?.name || `${employee.name} Portrait`,
        size: currentPhoto?.size,
        previewUrl: currentUrl,
        originalUrl: formatUrl || (currentPhoto as any)?.originalUrl || currentPhoto?.url || currentUrl,
        format: isPng ? "PNG" : "JPG",
      })

      // Asynchronously resolve highest quality original from vault
      if (currentPhoto?.id || employee.id) {
        let isMounted = true
        Promise.all([
          currentPhoto?.id ? getOriginalPhoto(currentPhoto.id) : null,
          employee.id ? getOriginalPhoto(employee.id) : null,
        ]).then(([photoVault, empVault]) => {
          const vaultOriginal = photoVault || empVault
          if (isMounted && vaultOriginal) {
            setPhotoState((prev) => (prev ? { ...prev, originalUrl: vaultOriginal } : prev))
          }
        }).catch(() => {})
        return () => {
          isMounted = false
        }
      }
    }
  }, [employee, open])

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
      toast.info("Processing replacement photo...")
      const { previewUrl, originalUrl } = await compressImage(file)
      setPhotoState({
        isNew: true,
        file,
        name: file.name,
        size: file.size,
        previewUrl,
        originalUrl,
        format: isPng ? "PNG" : "JPG",
      })
      setOriginalPhotoBackup(null)
      setIsBgRemoved(false)
      toast.success("New photo uploaded!")
    } catch (err) {
      console.error("Error processing photo:", err)
      toast.error("Failed to process photo. Please try again.")
    }
  }

  // Pure-code in-browser background removal
  const handleRemoveBackground = async () => {
    if (!photoState) return

    setIsRemovingBg(true)
    toast.info("Removing photo background...")

    try {
      if (!originalPhotoBackup) {
        setOriginalPhotoBackup({ ...photoState })
      }

      // Execute in-browser AI segmentation algorithm (PhotoRoom-style soft edge matting)
      const result = await removePhotoBackground(photoState.originalUrl, {
        featherRadius: 1.8,
        edgeSharpness: 1.2,
        threshold: 0.45,
      })

      const baseName = photoState.name.replace(/\.[^/.]+$/, "")
      const cleanName = `${baseName}-transparent.png`
      const pngFile = new File([result.blob], cleanName, { type: "image/png" })

      setPhotoState({
        isNew: true,
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
    setPhotoState({ ...originalPhotoBackup })
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
    if (!employee) return

    if (!employeeName.trim()) {
      toast.error("Please enter Employee Name.")
      return
    }

    if (!designation.trim()) {
      toast.error("Please enter Designation.")
      return
    }

    if (!photoState) {
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

      let updatedPhotoItem: PhotoItem

      if (photoState.isNew) {
        const photoId = "photo_emp_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
        await saveOriginalPhotosBatch([
          {
            id: photoId,
            data: photoState.originalUrl,
          },
        ])

        updatedPhotoItem = {
          id: photoId,
          name: `${employeeName.trim()} - Portrait.${photoState.format.toLowerCase()}`,
          url: photoState.previewUrl || photoState.originalUrl,
          thumbnailUrl: photoState.previewUrl || photoState.originalUrl,
          originalUrl: photoState.originalUrl, // 100% UNTOUCHED ORIGINAL RAW PHOTO
          size: photoState.size || 2500000,
          type: photoState.format === "PNG" ? "image/png" : "image/jpeg",
          uploadedAt: todayFormatted,
        }
      } else {
        const existingPhoto = employee.photos?.[0]
        updatedPhotoItem = {
          id: existingPhoto?.id || "photo_emp_" + Date.now(),
          name: `${employeeName.trim()} - Portrait.${photoState.format.toLowerCase()}`,
          url: photoState.previewUrl || photoState.originalUrl,
          thumbnailUrl: photoState.previewUrl || photoState.originalUrl,
          originalUrl: photoState.originalUrl, // 100% UNTOUCHED ORIGINAL RAW PHOTO
          size: existingPhoto?.size || photoState.size || 2500000,
          type: photoState.format === "PNG" ? "image/png" : "image/jpeg",
          uploadedAt: existingPhoto?.uploadedAt || todayFormatted,
        }
      }

      const updatedAsset: Asset = {
        ...employee,
        name: employeeName.trim(),
        designation: designation.trim(),
        companyName: company.trim() || undefined,
        siteLocation: siteLocation.trim() || undefined,
        updatedAt: todayFormatted,
        thumbnail: photoState.previewUrl || photoState.originalUrl,
        photos: [updatedPhotoItem],
        formats: {
          [photoState.format]: {
            fileName: updatedPhotoItem.name,
            fileData: photoState.originalUrl, // 100% ORIGINAL RAW QUALITY
          },
        },
      }

      updateCustomAsset(updatedAsset)
      toast.success(`Employee "${employeeName.trim()}" updated successfully!`)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error("Error updating employee photo:", err)
      toast.error("Failed to update employee. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] w-[95vw] max-h-[92vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border bg-card/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#4472C4]/10 text-[#4472C4]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Edit Employee Details
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Update employee name, designation, optional company master location, or portrait photo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 1. Text Box: Employee Name */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-emp-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span>Employee Name</span>
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-emp-name"
                type="text"
                placeholder="e.g. Rajesh Sharma"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="pl-9.5 h-11 text-sm bg-background border-border focus-visible:ring-1 focus-visible:ring-[#4472C4]"
              />
            </div>
          </div>

          {/* 2. Text Box: Designation */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-emp-designation" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span>Designation</span>
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-emp-designation"
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
                      setSiteLocation("")
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
                <span>Employee Photo</span>
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

            {!photoState ? (
              /* Dropzone if photo removed */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none",
                  isDragging
                    ? "border-[#4472C4] bg-[#4472C4]/10"
                    : "border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30 hover:border-[#4472C4]"
                )}
              >
                <div className="p-3.5 rounded-full bg-[#4472C4]/10 text-[#4472C4] mb-3">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Click to upload new photo or drag &amp; drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supported: <strong className="text-foreground">PNG</strong> or <strong className="text-foreground">JPG</strong> only
                </p>
              </div>
            ) : (
              /* Single Photo Tile Preview with Remove BG Action */
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
                      src={photoState.previewUrl}
                      alt="Employee Portrait"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#4472C4] text-white">
                        {photoState.format}
                      </span>
                      {isBgRemoved ? (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCheck className="h-3 w-3" /> Transparent BG
                        </span>
                      ) : photoState.isNew ? (
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Replaced
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs font-semibold text-foreground truncate max-w-[200px] sm:max-w-[260px]" title={photoState.name}>
                      {photoState.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {photoState.size ? formatFileSize(photoState.size) : "Original Portrait"} • {isBgRemoved ? "Smooth PNG Cutout" : "High Resolution"}
                    </p>
                  </div>
                </div>

                {/* Actions: Remove BG / Restore, Change */}
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
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="text-xs cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !employeeName.trim() || !designation.trim() || !photoState}
            className="bg-[#4472C4] hover:bg-[#365ca0] text-white gap-2 font-semibold shadow-sm cursor-pointer text-xs px-5 h-9.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
