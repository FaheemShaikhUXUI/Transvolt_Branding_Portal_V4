"use client"

import * as React from "react"
import { Plus, UploadCloud, X, FileText, Image as ImageIcon, PenTool, ChevronDown, Check, Trash2, ArrowUpRight } from "lucide-react"
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

interface VariantData {
  id: string
  name: string
  files: {
    JPG: { file: File | null; previewUrl: string | null }
    PDF: { file: File | null; previewUrl: string | null }
    CDR: { file: File | null; previewUrl: string | null }
  }
}

type FileType = "JPG" | "PDF" | "CDR"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface FileTileUploadProps {
  type: FileType
  fileState: { file: File | null; previewUrl: string | null }
  onChange: (file: File | null) => void
  isRequired?: boolean
}

function FileTileUpload({ type, fileState, onChange, isRequired }: FileTileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const accept = type === "JPG" ? ".jpg,.jpeg,image/jpeg" : type === "PDF" ? ".pdf,application/pdf" : ".cdr"
  const typeTitle = type === "JPG" ? "JPG Image" : type === "PDF" ? "PDF File" : "CDR Vector"
  const badgeLabel = type === "JPG" ? "Preview Thumbnail" : type === "PDF" ? "Print Spec" : "CorelDraw Source"

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

      {fileState.file ? (
        <div className="relative rounded-xl border border-border bg-card p-3 flex flex-col justify-between h-36 overflow-hidden shadow-sm group">
          {type === "JPG" && fileState.previewUrl ? (
            <div className="relative w-full h-20 rounded-lg overflow-hidden bg-muted/40 flex items-center justify-center border border-border/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileState.previewUrl}
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
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                {type} File Ready
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate" title={fileState.file.name}>
                {fileState.file.name}
              </p>
              <p className="text-[10px] text-muted-foreground">{formatFileSize(fileState.file.size)}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => inputRef.current?.click()}
              >
                Change
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-full"
                onClick={() => onChange(null)}
                title="Remove file"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all duration-200 group select-none",
            isDragging
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-border/80 hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <div className="p-2.5 rounded-full bg-muted/60 group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary transition-colors mb-2">
            {type === "JPG" ? (
              <ImageIcon className="h-5 w-5" />
            ) : type === "PDF" ? (
              <FileText className="h-5 w-5" />
            ) : (
              <PenTool className="h-5 w-5" />
            )}
          </div>
          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
            Upload {type}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            Click or drag file here
          </span>
        </div>
      )}
    </div>
  )
}

interface AddVehicleBrandingModalProps {
  trigger?: React.ReactNode
  defaultCompany?: string
  defaultSiteLocation?: string
}

export function AddVehicleBrandingModal({ trigger, defaultCompany, defaultSiteLocation }: AddVehicleBrandingModalProps) {
  const { assets, addAssets } = useAssets()
  const { getUniqueCompanyNames, getUniqueSiteLocations, isCompanyOnHold, isSiteOnHold } = useCompanyMaster()
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [companyName, setCompanyName] = React.useState(defaultCompany || "")
  const [siteLocation, setSiteLocation] = React.useState(defaultSiteLocation || "")

  React.useEffect(() => {
    if (defaultCompany !== undefined) setCompanyName(defaultCompany)
    if (defaultSiteLocation !== undefined) setSiteLocation(defaultSiteLocation)
  }, [defaultCompany, defaultSiteLocation])

  const [variants, setVariants] = React.useState<VariantData[]>([
    {
      id: "var-1",
      name: "",
      files: {
        JPG: { file: null, previewUrl: null },
        PDF: { file: null, previewUrl: null },
        CDR: { file: null, previewUrl: null },
      },
    },
  ])
  const [activeVariantId, setActiveVariantId] = React.useState("var-1")

  // Connected to Company Master: Extract registered companies (excluding any on hold)
  const existingCompanies = React.useMemo(() => {
    const masterCompanies = getUniqueCompanyNames("vehicle-branding")
    const list = new Set<string>(masterCompanies)
    assets.forEach((a) => {
      if (a.companyName && a.companyName.trim() && !isCompanyOnHold(a.companyName.trim())) {
        list.add(a.companyName.trim())
      }
    })
    return Array.from(list).filter((c) => !isCompanyOnHold(c))
  }, [getUniqueCompanyNames, assets, isCompanyOnHold])

  // Connected to Company Master: Extract registered site locations (excluding any on hold)
  const existingSiteLocations = React.useMemo(() => {
    const masterLocations = getUniqueSiteLocations(companyName, "vehicle-branding")
    const list = new Set<string>(masterLocations)
    assets.forEach((a) => {
      if (a.category === "vehicle-branding" || a.titleName) {
        if (a.titleName && a.titleName.trim() && !isSiteOnHold(companyName, a.titleName.trim())) {
          list.add(a.titleName.trim())
        }
      }
    })
    return Array.from(list).filter((loc) => !isSiteOnHold(companyName, loc))
  }, [getUniqueSiteLocations, companyName, assets, isSiteOnHold])

  const handleAddVariant = () => {
    const newId = `var-${Date.now()}`
    const newVariant: VariantData = {
      id: newId,
      name: "",
      files: {
        JPG: { file: null, previewUrl: null },
        PDF: { file: null, previewUrl: null },
        CDR: { file: null, previewUrl: null },
      },
    }
    setVariants((prev) => [...prev, newVariant])
    setActiveVariantId(newId)
  }

  const handleRemoveVariant = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (variants.length <= 1) {
      toast.error("At least one vehicle variant is required.")
      return
    }
    const newVariants = variants.filter((v) => v.id !== id)
    setVariants(newVariants)
    if (activeVariantId === id) {
      setActiveVariantId(newVariants[0].id)
    }
  }

  const handleVariantNameChange = (id: string, name: string) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, name } : v))
    )
  }

  const handleFileChange = (variantId: string, type: FileType, file: File | null) => {
    if (file) {
      const previewUrl = type === "JPG" ? URL.createObjectURL(file) : null
      setVariants((prev) =>
        prev.map((v) =>
          v.id === variantId
            ? {
                ...v,
                files: {
                  ...v.files,
                  [type]: { file, previewUrl },
                },
              }
            : v
        )
      )
    } else {
      setVariants((prev) =>
        prev.map((v) =>
          v.id === variantId
            ? {
                ...v,
                files: {
                  ...v.files,
                  [type]: { file: null, previewUrl: null },
                },
              }
            : v
        )
      )
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve("")
    })
  }

  const resetForm = () => {
    setCompanyName(defaultCompany || "")
    setSiteLocation(defaultSiteLocation || "")
    const initialId = `var-${Date.now()}`
    setVariants([
      {
        id: initialId,
        name: "",
        files: {
          JPG: { file: null, previewUrl: null },
          PDF: { file: null, previewUrl: null },
          CDR: { file: null, previewUrl: null },
        },
      },
    ])
    setActiveVariantId(initialId)
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

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i]
      if (!v.name.trim()) {
        toast.error(`Please provide a name for Variant ${i + 1}.`)
        setActiveVariantId(v.id)
        return
      }
      if (!v.files.JPG.file) {
        toast.error(`Please upload a JPG thumbnail preview for Variant "${v.name.trim()}".`)
        setActiveVariantId(v.id)
        return
      }
    }

    setIsSubmitting(true)

    try {
      const processedVariants = await Promise.all(
        variants.map(async (v) => {
          const formats: Record<string, { fileName: string; fileData: string }> = {}

          let jpgBase64 = ""
          if (v.files.JPG.file) {
            jpgBase64 = await fileToBase64(v.files.JPG.file)
            formats.JPG = {
              fileName: v.files.JPG.file.name,
              fileData: jpgBase64,
            }
          }

          if (v.files.PDF.file) {
            const pdfBase64 = await fileToBase64(v.files.PDF.file)
            formats.PDF = {
              fileName: v.files.PDF.file.name,
              fileData: pdfBase64,
            }
          }

          if (v.files.CDR.file) {
            const cdrBase64 = await fileToBase64(v.files.CDR.file)
            formats.CDR = {
              fileName: v.files.CDR.file.name,
              fileData: cdrBase64,
            }
          }

          return {
            name: v.name.trim(),
            thumbnail: jpgBase64,
            formats,
          }
        })
      )

      // Create a separate asset tile for each variant under this Company and Site
      const newAssets = processedVariants.map((v) => ({
        name: v.name,
        companyName: trimmedCompany,
        titleName: trimmedLocation,
        category: "vehicle-branding",
        formats: v.formats,
        thumbnail: v.thumbnail,
        status: "active" as const,
      }))

      await addAssets("Vehicle Branding", newAssets, "vehicle-branding")

      toast.success(
        processedVariants.length > 1
          ? `${processedVariants.length} vehicle branding variant tiles added successfully!`
          : "Vehicle branding variant added successfully!"
      )
      setOpen(false)
      resetForm()
    } catch (err) {
      console.error(err)
      toast.error("Failed to add vehicle branding asset. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeVariant = variants.find((v) => v.id === activeVariantId) || variants[0]

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) resetForm()
    }}>
      <DialogTrigger
        render={
          (trigger as React.ReactElement) || (
            <Button className="h-11 px-5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer">
              <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
              <span>Add Asset</span>
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-4xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-2xl font-bold tracking-tight text-[#4472C4]">
            Add Vehicle Branding
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Configure vehicle branding specifications, specify variants, and upload preview images and production files.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          {/* Top Row: Category as Company & Site Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category as Company */}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="category-company" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Category as Company <span className="text-red-500">*</span>
              </Label>
              <AutocompleteInput
                id="category-company"
                options={existingCompanies}
                placeholder="Select or type company name..."
                value={companyName}
                onChange={setCompanyName}
                required
              />
            </div>

            {/* Site Location */}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="site-location" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Site Location <span className="text-red-500">*</span>
              </Label>
              <AutocompleteInput
                id="site-location"
                options={existingSiteLocations}
                placeholder="Select or type site location..."
                value={siteLocation}
                onChange={setSiteLocation}
                required
              />
            </div>
          </div>

          {/* Variant Tabs Container */}
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm">
            {/* Tab Header Bar */}
            <div className="bg-muted/40 border-b border-border/80 px-3 py-2 flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0 pl-1 mr-1">
                Variants:
              </span>
              {variants.map((v, idx) => {
                const isActive = v.id === activeVariantId
                const title = v.name.trim() ? v.name.trim() : `Variant ${idx + 1}`
                return (
                  <div
                    key={v.id}
                    onClick={() => setActiveVariantId(v.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border shrink-0 select-none",
                      isActive
                        ? "bg-background border-primary/40 text-primary shadow-xs"
                        : "bg-transparent border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    )}
                  >
                    <span className="truncate max-w-[140px]">{title}</span>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveVariant(v.id, e)}
                        className="p-0.5 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                        title="Remove Variant"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )
              })}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVariant}
                className="h-7 px-2.5 text-xs font-semibold gap-1.5 shrink-0 ml-auto border-dashed rounded-lg cursor-pointer hover:border-primary hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add More</span>
              </Button>
            </div>

            {/* Active Variant Panel */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Variant Name Input */}
              <div className="space-y-1.5 text-left">
                <Label htmlFor={`variant-name-${activeVariant.id}`} className="text-xs font-semibold text-foreground">
                  Vehicle Variant Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`variant-name-${activeVariant.id}`}
                  placeholder="e.g. Tata Ace EV - Full Body Livery, Mahindra Supro - Cab Wrap"
                  value={activeVariant.name}
                  onChange={(e) => handleVariantNameChange(activeVariant.id, e.target.value)}
                  className="h-10 rounded-lg"
                  required
                />
              </div>

              {/* 3 Upload Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <FileTileUpload
                  type="JPG"
                  isRequired
                  fileState={activeVariant.files.JPG}
                  onChange={(f) => handleFileChange(activeVariant.id, "JPG", f)}
                />
                <FileTileUpload
                  type="PDF"
                  fileState={activeVariant.files.PDF}
                  onChange={(f) => handleFileChange(activeVariant.id, "PDF", f)}
                />
                <FileTileUpload
                  type="CDR"
                  fileState={activeVariant.files.CDR}
                  onChange={(f) => handleFileChange(activeVariant.id, "CDR", f)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                resetForm()
              }}
              disabled={isSubmitting}
              className="rounded-xl px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl px-6 bg-[#4472C4] hover:bg-[#4472C4]/90 text-white font-semibold cursor-pointer shadow-sm"
            >
              {isSubmitting ? "Saving Assets..." : "Save Vehicle Branding"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
