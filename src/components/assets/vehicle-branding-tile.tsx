"use client"

import * as React from "react"
import { Download, MoreHorizontal, FileImage, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { downloadGroupAsZip } from "@/lib/zip-utils"
import { useAssets } from "@/lib/assets/assets-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { FormatBadge, FolderIcon, ApprovedStatusBadge } from "./asset-tile"
import { InteractiveImageCanvas } from "./interactive-image-canvas"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

export interface VehicleVariantItem {
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

interface VehicleBrandingTileProps {
  variant: VehicleVariantItem
  onDelete?: () => void
  onHoldToggle?: () => void
}

export function VehicleBrandingTile({ variant, onDelete, onHoldToggle }: VehicleBrandingTileProps) {
  const { replaceAssetFormat } = useAssets()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)

  const imageSrc = variant.thumbnail || variant.formats.JPG?.fileData

  const activeFormats = React.useMemo(() => {
    const list: ("JPG" | "PDF" | "CDR")[] = []
    const supported = ["JPG", "PDF", "CDR"] as const
    supported.forEach((fmt) => {
      const item = variant.formats?.[fmt]
      if (item && (item.fileData || item.fileName)) {
        list.push(fmt)
      }
    })
    if (list.length === 0 && (variant.thumbnail || variant.formats?.JPG)) {
      list.push("JPG")
    }
    return list
  }, [variant.formats, variant.thumbnail])

  const handleDownloadFormat = (type: "JPG" | "PDF" | "CDR") => {
    const file = variant.formats[type]
    if (!file?.fileData) {
      toast.error(`${type} file is not available for this variant.`)
      return
    }

    const mimeType =
      type === "JPG"
        ? "image/jpeg"
        : type === "PDF"
        ? "application/pdf"
        : "application/octet-stream"

    const element = document.createElement("a")
    if (file.fileData.startsWith("data:")) {
      fetch(file.fileData)
        .then((res) => res.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob)
          element.href = url
          element.download = file.fileName || `${variant.name}.${type.toLowerCase()}`
          document.body.appendChild(element)
          element.click()
          document.body.removeChild(element)
          URL.revokeObjectURL(url)
        })
    } else {
      const blob = new Blob([file.fileData], { type: mimeType })
      const url = URL.createObjectURL(blob)
      element.href = url
      element.download = file.fileName || `${variant.name}.${type.toLowerCase()}`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      URL.revokeObjectURL(url)
    }
    toast.success(`Downloaded ${file.fileName || `${variant.name} ${type}`}`)
  }

  const handleDownloadZip = async () => {
    const filesToDownload: { fileName: string; fileData: string }[] = []

    if (variant.formats.JPG?.fileData) {
      filesToDownload.push({
        fileName: variant.formats.JPG.fileName || `${variant.name}.jpg`,
        fileData: variant.formats.JPG.fileData,
      })
    }
    if (variant.formats.PDF?.fileData) {
      filesToDownload.push({
        fileName: variant.formats.PDF.fileName || `${variant.name}.pdf`,
        fileData: variant.formats.PDF.fileData,
      })
    }
    if (variant.formats.CDR?.fileData) {
      filesToDownload.push({
        fileName: variant.formats.CDR.fileName || `${variant.name}.cdr`,
        fileData: variant.formats.CDR.fileData,
      })
    }

    if (filesToDownload.length === 0) {
      toast.error("No files available to download.")
      return
    }

    const zipName = `${variant.companyName}_${variant.siteLocation}_${variant.name}`.replace(
      /[^a-zA-Z0-9_-]/g,
      "_"
    )

    toast.info(`Preparing zip for ${variant.name}...`)
    try {
      await downloadGroupAsZip(zipName, filesToDownload)
      toast.success(`Downloaded files for ${variant.name}`)
    } catch (err) {
      console.error(err)
      toast.error("Failed to package files for download.")
    }
  }

  const handleReplaceFile = (type: "JPG" | "PDF" | "CDR") => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = type === "JPG" ? ".jpg,.jpeg" : type === "PDF" ? ".pdf" : ".cdr"
    input.onchange = async (el) => {
      const file = (el.target as HTMLInputElement).files?.[0]
      if (file) {
        await replaceAssetFormat(variant.assetId, type, file)
        toast.success(`${type} file replaced successfully.`)
      }
    }
    input.click()
  }

  return (
    <>
      <div className="flex flex-col bg-card text-card-foreground rounded-xl border border-border/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 group w-full relative">
        {/* 1) Image Area */}
        <div
          onClick={() => {
            if (imageSrc) setIsPreviewOpen(true)
          }}
          className={cn(
            "h-52 w-full relative flex items-center justify-center p-4 bg-muted/20 overflow-hidden border-b border-border/60 select-none",
            imageSrc ? "cursor-pointer" : "cursor-default"
          )}
          title={imageSrc ? "Click to expand preview" : undefined}
        >
          {/* Approved Double Check Icon Badge */}
          <ApprovedStatusBadge zIndex="z-10" />

          {/* Hold Badge */}
          {variant.status === "hold" && (
            <div className="absolute right-2 top-2 z-10">
              <Badge className="bg-amber-500 text-white border-amber-500 hover:bg-amber-600 shadow-xs text-[10px] font-bold">
                Hold
              </Badge>
            </div>
          )}

          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={variant.name}
              className="max-h-full max-w-full object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground/40">
              <FileImage className="h-10 w-10 stroke-[1.5]" />
              <span className="text-[11px] font-medium">No JPG Preview</span>
            </div>
          )}
        </div>

        {/* 2) Below Image: Variant Name on left and opposite side Download & Setting options */}
        <div className="p-3.5 px-4 flex items-center justify-between gap-2 cursor-default bg-card border-t border-border">
          <h3
            className="font-semibold text-foreground text-sm truncate text-left flex-1"
            title={variant.name}
          >
            {variant.name}
          </h3>

          {/* Right side: Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Download Popout Menu */}
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                      title="Download Files"
                    >
                      <Download className="h-4 w-4 shrink-0" />
                    </button>
                  }
                />
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-card border border-border/80 p-2 rounded-xl shadow-2xl space-y-1"
                >
                  {(["JPG", "PDF", "CDR"] as const).map((format) => {
                    const isAvailable = !!variant.formats[format]
                    const label =
                      format === "JPG"
                        ? "Preview Image"
                        : format === "PDF"
                        ? "Production Print Spec"
                        : "CorelDraw Source"

                    return (
                      <DropdownMenuItem
                        key={format}
                        disabled={!isAvailable}
                        onClick={() => handleDownloadFormat(format)}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 select-none",
                          isAvailable
                            ? "hover:bg-muted text-foreground"
                            : "opacity-40 cursor-not-allowed text-muted-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <FormatBadge format={format} />
                          <div className="flex flex-col text-left">
                            <span className="font-semibold text-xs">Download {format}</span>
                            <span className="text-[10px] text-muted-foreground">{label}</span>
                          </div>
                        </div>
                        {isAvailable ? (
                          <Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        ) : (
                          <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-wider shrink-0">
                            N/A
                          </span>
                        )}
                      </DropdownMenuItem>
                    )
                  })}

                  <DropdownMenuSeparator className="my-1 bg-border/60" />

                  {/* Download All (Zip) with amber button style */}
                  <DropdownMenuItem
                    onClick={handleDownloadZip}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer bg-[#FEF3C7] text-[#78350F] hover:bg-[#FDE68A] focus:bg-[#FDE68A] font-semibold text-xs border border-[#FDE68A]/60 transition-all select-none shadow-xs"
                  >
                    <FolderIcon size={24} />
                    <div className="flex flex-col text-left flex-1 min-w-0">
                      <span>Download All (Zip)</span>
                      <span className="text-[10px] text-[#78350F]/70 font-normal truncate">
                        All variant files
                      </span>
                    </div>
                    <Download className="h-3.5 w-3.5 text-[#78350F] shrink-0" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Setting Options Popout Menu */}
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                      title="Variant Settings"
                    >
                      <MoreHorizontal className="h-4 w-4 shrink-0" />
                    </button>
                  }
                />
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-card border border-border/80 p-2 rounded-xl shadow-2xl space-y-1"
                >
                  {/* Replace File Submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div className="flex flex-col gap-0.5 text-left">
                          <span>Replace File</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {activeFormats.length > 0
                              ? `Active (${activeFormats.join(", ")})`
                              : "No active formats"}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-48 p-1.5">
                      {activeFormats.length > 0 ? (
                        activeFormats.map((type) => (
                          <DropdownMenuItem
                            key={type}
                            onClick={() => handleReplaceFile(type)}
                            className="p-2 text-xs cursor-pointer flex items-center justify-between"
                          >
                            <span>Replace {type}</span>
                            <FormatBadge format={type} />
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="p-2 text-center text-xs text-muted-foreground select-none">
                          No active formats to replace
                        </div>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  {/* Hold toggle */}
                  <DropdownMenuItem
                    onClick={() => onHoldToggle?.()}
                    className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted text-xs font-semibold"
                  >
                    <span>{variant.status === "hold" ? "Release Hold" : "Put on Hold"}</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 bg-border/60" />

                  {/* Delete Variant */}
                  <DropdownMenuItem
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="flex items-center justify-between p-2 rounded-lg cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 text-xs font-bold"
                  >
                    <span>Delete Variant</span>
                    <Trash2 className="h-3.5 w-3.5" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Popout Lightbox Modal for Image Preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent
          className="w-[98vw] max-w-[1550px] 2xl:max-w-[1750px] h-[88vh] p-0 overflow-hidden bg-black/30 border-0 ring-0 shadow-none rounded-2xl flex flex-col items-center justify-center outline-none text-white animate-in zoom-in-95 duration-200"
          overlayClassName="bg-black/20 backdrop-blur-[8px]"
          showCloseButton={true}
        >
          <DialogTitle className="sr-only">{variant.name}</DialogTitle>
          <DialogDescription className="sr-only">
            Vehicle branding variant image preview lightbox
          </DialogDescription>

          {imageSrc && (
            <div className="w-full h-full relative flex items-center justify-center">
              <InteractiveImageCanvas
                src={imageSrc}
                alt={variant.name}
                title={variant.name}
                subTitle={`${variant.companyName} • ${variant.siteLocation}`}
              />

              {/* Floating Quick Download Buttons */}
              <div className="absolute bottom-4 right-5 z-30 flex items-center gap-2">
                {(["JPG", "PDF", "CDR"] as const).map((format) => {
                  const formatData = variant.formats[format]
                  if (!formatData) return null
                  return (
                    <button
                      key={format}
                      onClick={() => handleDownloadFormat(format)}
                      className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{format}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* System Generated Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Vehicle Variant?"
        itemName={variant.name}
        description={`Are you sure you want to delete the variant "${variant.name}" from ${variant.companyName} (${variant.siteLocation})? This action cannot be undone.`}
        confirmText="Yes, Delete"
        onConfirm={() => onDelete?.()}
      />
    </>
  )
}
