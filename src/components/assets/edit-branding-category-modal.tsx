"use client"

import * as React from "react"
import {
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
  X,
  FileText,
  Image as ImageIcon,
  PenTool,
  AlertTriangle,
  RotateCw,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AutocompleteInput } from "@/components/ui/autocomplete-input"
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
import { useCompanyMaster } from "@/lib/company-master/company-master-context"
import { cn } from "@/lib/utils"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

export interface ExistingVariantItem {
  id: string
  name: string
  companyName: string
  siteLocation: string
  thumbnail?: string
  formats: {
    JPG?: { fileName: string; fileData: string }
    PDF?: { fileName: string; fileData: string }
    CDR?: { fileName: string; fileData: string }
  }
  status?: "active" | "hold"
  assetId: string
  variantIndex?: number
}

interface EditableVariantState {
  id: string
  assetId?: string
  isNew?: boolean
  name: string
  existingThumbnail?: string
  existingFormats: {
    JPG?: { fileName: string; fileData: string }
    PDF?: { fileName: string; fileData: string }
    CDR?: { fileName: string; fileData: string }
  }
  newFiles: {
    JPG: { file: File | null; previewUrl: string | null }
    PDF: { file: File | null; previewUrl: string | null }
    CDR: { file: File | null; previewUrl: string | null }
  }
}

type FileType = "JPG" | "PDF" | "CDR"

interface EditFileTileProps {
  type: FileType
  isRequired?: boolean
  existingFile?: { fileName: string; fileData: string }
  newFileState: { file: File | null; previewUrl: string | null }
  onChange: (file: File | null) => void
  onRemoveExisting?: () => void
}

function EditFileTile({
  type,
  isRequired,
  existingFile,
  newFileState,
  onChange,
  onRemoveExisting,
}: EditFileTileProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const accept =
    type === "JPG" ? ".jpg,.jpeg,image/jpeg" : type === "PDF" ? ".pdf,application/pdf" : ".cdr"
  const typeTitle = type === "JPG" ? "JPG Image" : type === "PDF" ? "PDF File" : "CDR Vector"
  const badgeLabel =
    type === "JPG" ? "Preview Thumbnail" : type === "PDF" ? "Print Spec" : "CorelDraw Source"

  const hasNewFile = Boolean(newFileState.file)
  const hasExistingFile = Boolean(existingFile?.fileData)
  const hasFile = hasNewFile || hasExistingFile

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
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      onChange(droppedFile)
    }
  }

  const previewSrc = hasNewFile
    ? newFileState.previewUrl
    : hasExistingFile && type === "JPG"
    ? existingFile?.fileData
    : null

  const fileName = hasNewFile
    ? newFileState.file?.name
    : hasExistingFile
    ? existingFile?.fileName || `${type} File`
    : null

  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1">
          {typeTitle} {isRequired && <span className="text-red-500">*</span>}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
          {badgeLabel}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0] || null
          onChange(file)
          if (e.target) e.target.value = ""
        }}
      />

      {hasFile ? (
        <div className="relative rounded-xl border border-border bg-card p-3 flex flex-col justify-between h-36 overflow-hidden shadow-2xs group">
          {type === "JPG" && previewSrc ? (
            <div className="relative w-full h-20 rounded-lg overflow-hidden bg-muted/40 flex items-center justify-center border border-border/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt="JPG Preview"
                className="w-full h-full object-contain p-1"
              />
            </div>
          ) : (
            <div className="w-full h-20 rounded-lg bg-muted/40 flex flex-col items-center justify-center border border-border/40 gap-1">
              {type === "PDF" ? (
                <div className="h-10 w-10 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center font-black text-xs">
                  PDF
                </div>
              ) : (
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-xs">
                  CDR
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
            <span className="text-[11px] font-medium text-foreground truncate max-w-[130px]" title={fileName || ""}>
              {fileName}
            </span>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="h-6 w-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                title="Replace file"
                onClick={() => inputRef.current?.click()}
              >
                <RotateCw className="h-3 w-3" />
              </Button>
              {(!isRequired || hasNewFile) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="h-6 w-6 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                  title="Remove file"
                  onClick={() => {
                    if (hasNewFile) {
                      onChange(null)
                    } else if (onRemoveExisting) {
                      onRemoveExisting()
                    }
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "h-36 rounded-xl border-2 border-dashed border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-muted/40 flex flex-col items-center justify-center gap-2 p-3 transition-all cursor-pointer text-center",
            isDragging && "border-primary bg-primary/5"
          )}
        >
          <div className="p-2 rounded-full bg-background border border-border/60 shadow-2xs text-muted-foreground">
            {type === "JPG" ? (
              <ImageIcon className="h-4 w-4" />
            ) : type === "PDF" ? (
              <FileText className="h-4 w-4" />
            ) : (
              <PenTool className="h-4 w-4" />
            )}
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xs font-bold text-foreground">Upload {type}</span>
            <span className="text-[10px] text-muted-foreground">Click or drag file here</span>
          </div>
        </div>
      )}
    </div>
  )
}

interface EditBrandingCategoryModalProps {
  type: "vehicle" | "charger"
  companyName: string
  siteLocation: string
  variants: ExistingVariantItem[]
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function EditBrandingCategoryModal({
  type,
  companyName: initialCompany,
  siteLocation: initialSite,
  variants: initialVariants,
  trigger,
  onSuccess,
}: EditBrandingCategoryModalProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

  const { assets, updateCustomAsset, addCustomAsset, deleteAsset } = useAssets()
  const {
    getUniqueCompanyNames,
    getUniqueSiteLocations,
    addSiteLocation,
    isCompanyOnHold,
    isSiteOnHold,
  } = useCompanyMaster()

  const categorySlug = type === "vehicle" ? "vehicle-branding" : "charger-branding"
  const typeLabel = type === "vehicle" ? "Vehicle" : "Charger"
  const themeColor = type === "vehicle" ? "#4472C4" : "#548235"

  const [companyName, setCompanyName] = React.useState(initialCompany)
  const [siteLocation, setSiteLocation] = React.useState(initialSite)
  const [variants, setVariants] = React.useState<EditableVariantState[]>([])

  // Initialize editable state whenever modal opens or props change
  React.useEffect(() => {
    if (isOpen) {
      setCompanyName(initialCompany)
      setSiteLocation(initialSite)
      setVariants(
        initialVariants.map((v) => ({
          id: v.id,
          assetId: v.assetId,
          name: v.name,
          existingThumbnail: v.thumbnail || v.formats?.JPG?.fileData,
          existingFormats: { ...v.formats },
          newFiles: {
            JPG: { file: null, previewUrl: null },
            PDF: { file: null, previewUrl: null },
            CDR: { file: null, previewUrl: null },
          },
        }))
      )
    }
  }, [isOpen, initialCompany, initialSite, initialVariants])

  // Autocomplete options
  const existingCompanies = React.useMemo(() => {
    const masterCompanies = getUniqueCompanyNames(categorySlug)
    const list = new Set<string>(masterCompanies)
    assets.forEach((a) => {
      if (a.companyName && a.companyName.trim() && !isCompanyOnHold(a.companyName.trim())) {
        list.add(a.companyName.trim())
      }
    })
    return Array.from(list).filter((c) => !isCompanyOnHold(c))
  }, [getUniqueCompanyNames, assets, isCompanyOnHold, categorySlug])

  const existingSiteLocations = React.useMemo(() => {
    const masterLocations = getUniqueSiteLocations(companyName, categorySlug)
    const list = new Set<string>(masterLocations)
    assets.forEach((a) => {
      if (a.category === categorySlug || a.titleName) {
        if (a.titleName && a.titleName.trim() && !isSiteOnHold(companyName, a.titleName.trim())) {
          list.add(a.titleName.trim())
        }
      }
    })
    return Array.from(list).filter((loc) => !isSiteOnHold(companyName, loc))
  }, [getUniqueSiteLocations, companyName, assets, isSiteOnHold, categorySlug])

  const handleAddVariant = () => {
    const newId = `var-new-${Date.now()}`
    setVariants((prev) => [
      ...prev,
      {
        id: newId,
        isNew: true,
        name: "",
        existingFormats: {},
        newFiles: {
          JPG: { file: null, previewUrl: null },
          PDF: { file: null, previewUrl: null },
          CDR: { file: null, previewUrl: null },
        },
      },
    ])
  }

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 1) {
      toast.error(`At least one ${typeLabel.toLowerCase()} variant is required in this category.`)
      return
    }
    setVariants((prev) => prev.filter((v) => v.id !== id))
  }

  const handleVariantNameChange = (id: string, name: string) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, name } : v)))
  }

  const handleFileChange = (variantId: string, fileType: FileType, file: File | null) => {
    const previewUrl = file && fileType === "JPG" ? URL.createObjectURL(file) : null
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? {
              ...v,
              newFiles: {
                ...v.newFiles,
                [fileType]: { file, previewUrl },
              },
            }
          : v
      )
    )
  }

  const handleRemoveExistingFormat = (variantId: string, fileType: FileType) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v
        const updatedFormats = { ...v.existingFormats }
        delete updatedFormats[fileType]
        return {
          ...v,
          existingFormats: updatedFormats,
          existingThumbnail: fileType === "JPG" ? undefined : v.existingThumbnail,
        }
      })
    )
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve("")
    })
  }

  const handleDeleteFullCategory = () => {
    initialVariants.forEach((v) => {
      deleteAsset(v.assetId)
    })
    toast.success(`Deleted entire category "${initialCompany}" (${initialSite}).`)
    setShowDeleteConfirm(false)
    setIsOpen(false)
    onSuccess?.()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedCompany = companyName.trim()
    const trimmedLocation = siteLocation.trim()

    if (!trimmedCompany) {
      toast.error("Please enter or select Category as Company.")
      return
    }

    if (!trimmedLocation) {
      toast.error("Please enter or select Site Location.")
      return
    }

    if (variants.length === 0) {
      toast.error("At least one variant is required.")
      return
    }

    // Validation
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i]
      if (!v.name.trim()) {
        toast.error(`Please provide a name for Variant ${i + 1}.`)
        return
      }
      const hasJpg = v.newFiles.JPG.file || v.existingFormats.JPG?.fileData || v.existingThumbnail
      if (!hasJpg) {
        toast.error(`Please upload a JPG thumbnail preview for Variant "${v.name.trim()}".`)
        return
      }
    }

    setIsSubmitting(true)

    try {
      // 1. Delete removed variants that were in initialVariants
      const currentAssetIds = new Set(variants.filter((v) => !v.isNew && v.assetId).map((v) => v.assetId))
      initialVariants.forEach((initialV) => {
        if (!currentAssetIds.has(initialV.assetId)) {
          deleteAsset(initialV.assetId)
        }
      })

      // 2. Process all current variants
      for (const v of variants) {
        const formats: Record<string, { fileName: string; fileData: string }> = {
          ...v.existingFormats,
        }

        let thumbnail = v.existingThumbnail || formats.JPG?.fileData || ""

        if (v.newFiles.JPG.file) {
          const jpgBase64 = await fileToBase64(v.newFiles.JPG.file)
          formats.JPG = {
            fileName: v.newFiles.JPG.file.name,
            fileData: jpgBase64,
          }
          thumbnail = jpgBase64
        }

        if (v.newFiles.PDF.file) {
          const pdfBase64 = await fileToBase64(v.newFiles.PDF.file)
          formats.PDF = {
            fileName: v.newFiles.PDF.file.name,
            fileData: pdfBase64,
          }
        }

        if (v.newFiles.CDR.file) {
          const cdrBase64 = await fileToBase64(v.newFiles.CDR.file)
          formats.CDR = {
            fileName: v.newFiles.CDR.file.name,
            fileData: cdrBase64,
          }
        }

        if (v.isNew || !v.assetId) {
          // Add as brand new asset tile
          addCustomAsset({
            name: v.name.trim(),
            companyName: trimmedCompany,
            titleName: trimmedLocation,
            category: categorySlug,
            thumbnail,
            formats,
            status: "active",
            parentSlug: categorySlug,
          } as any)
        } else {
          // Update existing asset
          const existingAsset = assets.find((a) => a.id === v.assetId)
          if (existingAsset) {
            updateCustomAsset({
              ...existingAsset,
              name: v.name.trim(),
              companyName: trimmedCompany,
              titleName: trimmedLocation,
              thumbnail,
              formats,
            })
          }
        }
      }

      // Register company & site location in company master
      addSiteLocation(trimmedCompany, trimmedLocation, categorySlug)

      toast.success(
        `Updated category "${trimmedCompany}" (${trimmedLocation}) with ${variants.length} variant${
          variants.length === 1 ? "" : "s"
        }.`
      )
      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update category. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger ? (
            trigger
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
              title={`Edit Category: ${initialCompany}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="sm:max-w-5xl w-full max-w-[95vw] md:w-[950px] lg:w-[1050px] p-6 sm:p-8 max-h-[92vh] overflow-y-auto rounded-2xl">
          <DialogHeader className="space-y-1 pb-3 border-b border-border text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="p-2 rounded-xl text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  <Pencil className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight">
                    Edit {typeLabel} Branding Category
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Update company name, site location, and manage all variants in this category.
                  </DialogDescription>
                </div>
              </div>

              {/* Delete Category Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer gap-1.5 font-semibold"
                title="Delete full category and all its variants"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Delete Category</span>
              </Button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            {/* Top Grid: Category as Company & Site Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category as Company */}
              <div className="space-y-1.5 text-left">
                <Label htmlFor="edit-company-name" className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Category as Company <span className="text-red-500">*</span>
                </Label>
                <AutocompleteInput
                  id="edit-company-name"
                  options={existingCompanies}
                  placeholder="Select or type company name..."
                  value={companyName}
                  onChange={setCompanyName}
                  required
                />
              </div>

              {/* Site Location */}
              <div className="space-y-1.5 text-left">
                <Label htmlFor="edit-site-location" className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Site Location <span className="text-red-500">*</span>
                </Label>
                <AutocompleteInput
                  id="edit-site-location"
                  options={existingSiteLocations}
                  placeholder="Select or type site location..."
                  value={siteLocation}
                  onChange={setSiteLocation}
                  required
                />
              </div>
            </div>

            {/* Variants Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-0.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {typeLabel} Variants ({variants.length})
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Modify existing files or add new variants below
                </span>
              </div>

              <div className="space-y-4">
                {variants.map((variant, idx) => (
                  <div
                    key={variant.id}
                    className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 space-y-4 shadow-2xs relative"
                  >
                    {/* Variant Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          {variant.name.trim() ? variant.name.trim() : `Variant ${idx + 1}`}
                        </span>
                        {variant.isNew && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            New
                          </span>
                        )}
                      </div>

                      {variants.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVariant(variant.id)}
                          className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer gap-1"
                          title="Remove Variant"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </Button>
                      )}
                    </div>

                    {/* Variant Name Input */}
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor={`edit-variant-name-${variant.id}`} className="text-xs font-semibold text-foreground">
                        {typeLabel} Variant Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`edit-variant-name-${variant.id}`}
                        placeholder={
                          type === "vehicle"
                            ? "e.g. Tata Ace EV - Full Body Livery, Mahindra Supro - Cab Wrap"
                            : "e.g. 60kW DC Fast Charger - Side Panel, 120kW Dual Gun Livery"
                        }
                        value={variant.name}
                        onChange={(e) => handleVariantNameChange(variant.id, e.target.value)}
                        className="h-10 rounded-lg"
                        required
                      />
                    </div>

                    {/* 3 Upload / Preview Tiles */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <EditFileTile
                        type="JPG"
                        isRequired
                        existingFile={variant.existingFormats.JPG || (variant.existingThumbnail ? { fileName: "preview.jpg", fileData: variant.existingThumbnail } : undefined)}
                        newFileState={variant.newFiles.JPG}
                        onChange={(f) => handleFileChange(variant.id, "JPG", f)}
                      />
                      <EditFileTile
                        type="PDF"
                        existingFile={variant.existingFormats.PDF}
                        newFileState={variant.newFiles.PDF}
                        onChange={(f) => handleFileChange(variant.id, "PDF", f)}
                        onRemoveExisting={() => handleRemoveExistingFormat(variant.id, "PDF")}
                      />
                      <EditFileTile
                        type="CDR"
                        existingFile={variant.existingFormats.CDR}
                        newFileState={variant.newFiles.CDR}
                        onChange={(f) => handleFileChange(variant.id, "CDR", f)}
                        onRemoveExisting={() => handleRemoveExistingFormat(variant.id, "CDR")}
                      />
                    </div>
                  </div>
                ))}

                {/* Bottom Tile to Add New Variant */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddVariant}
                  className="w-full border-2 border-dashed border-border/80 hover:border-primary/60 hover:bg-primary/[0.04] text-foreground hover:text-primary py-7 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs font-semibold text-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Variant</span>
                </Button>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer gap-1 sm:hidden"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Category</span>
              </Button>

              <div className="flex items-center gap-3 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-xl px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl px-6 text-white font-semibold cursor-pointer shadow-sm"
                  style={{ backgroundColor: themeColor }}
                >
                  {isSubmitting ? "Saving Changes..." : "Save Category Changes"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Full Category Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={`Delete Category "${companyName}"?`}
        description={`Are you sure you want to delete the complete category for "${companyName}" (${siteLocation}) and all its ${variants.length} variant${variants.length === 1 ? "" : "s"}? This action cannot be undone.`}
        onConfirm={handleDeleteFullCategory}
      />
    </>
  )
}

