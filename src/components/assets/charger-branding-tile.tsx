"use client"

import * as React from "react"
import { Download, MoreHorizontal, FileImage, Trash2, RefreshCw, Zap } from "lucide-react"
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

export interface ChargerVariantItem {
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

interface ChargerBrandingTileProps {
  variant: ChargerVariantItem
  onDelete?: () => void
  onHoldToggle?: () => void
}

export function ChargerBrandingTile({ variant, onDelete, onHoldToggle }: ChargerBrandingTileProps) {
  const { replaceAssetFormat } = useAssets()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)

  const imageSrc = variant.thumbnail || variant.formats.JPG?.fileData

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
              <Zap className="h-10 w-10 stroke-[1.5] text-amber-500/60" />
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
                        {isAvailable && (
                          <Download className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                        )}
                      </DropdownMenuItem>
                    )
                  })}

                  <DropdownMenuSeparator className="my-1" />

                  {/* Download All as ZIP */}
                  <DropdownMenuItem
                    onClick={handleDownloadZip}
                    className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-primary/10 text-primary font-medium text-xs transition-all duration-200 select-none"
                  >
                    <FolderIcon className="h-4 w-4 text-primary" />
                    <span>Download All Formats (.ZIP)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Settings 3-dots Menu */}
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                      title="More Options"
                    >
                      <MoreHorizontal className="h-4 w-4 shrink-0" />
                    </button>
                  }
                />
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-card border border-border/80 p-1.5 rounded-xl shadow-2xl space-y-0.5 text-xs"
                >
                  {/* Put On Hold / Release Hold */}
                  {onHoldToggle && (
                    <DropdownMenuItem
                      onClick={onHoldToggle}
                      className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted transition-all duration-150"
                    >
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          variant.status === "hold" ? "bg-emerald-500" : "bg-amber-500"
                        )}
                      />
                      <span>
                        {variant.status === "hold" ? "Activate Variant" : "Put Variant On Hold"}
                      </span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="my-1" />

                  {/* Replace Files Submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted transition-all duration-150">
                      <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Replace File</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-48 bg-card border border-border/80 p-1.5 rounded-xl shadow-2xl space-y-0.5 text-xs">
                      <DropdownMenuItem
                        onClick={() => handleReplaceFile("JPG")}
                        className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted"
                      >
                        <FormatBadge format="JPG" />
                        <span>Replace JPG</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleReplaceFile("PDF")}
                        className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted"
                      >
                        <FormatBadge format="PDF" />
                        <span>Replace PDF</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleReplaceFile("CDR")}
                        className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted"
                      >
                        <FormatBadge format="CDR" />
                        <span>Replace CDR</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator className="my-1" />

                  {/* Delete Option */}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => setDeleteConfirmOpen(true)}
                      className="flex items-center gap-2 p-2 rounded-lg cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-150"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      <span>Delete Variant</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Charger Branding Variant"
        description={`Are you sure you want to delete "${variant.name}" under ${variant.companyName} (${variant.siteLocation})? This action cannot be undone.`}
        onConfirm={() => {
          if (onDelete) onDelete()
        }}
      />

      {/* Interactive Expandable Image Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-4xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between gap-4">
              <span className="truncate">{variant.name}</span>
              <span className="text-xs font-normal text-muted-foreground shrink-0">
                {variant.companyName} • {variant.siteLocation}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Interactive high-resolution preview. Use zoom, rotate, and pan controls to inspect details.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <InteractiveImageCanvas
              src={imageSrc || ""}
              alt={variant.name}
              className="h-[550px] w-full"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
            <div className="flex items-center gap-1.5">
              {(["JPG", "PDF", "CDR"] as const).map((format) => {
                const isAvail = !!variant.formats[format]
                return (
                  <Button
                    key={format}
                    variant="outline"
                    size="sm"
                    disabled={!isAvail}
                    onClick={() => handleDownloadFormat(format)}
                    className="h-8 text-xs gap-1.5 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{format}</span>
                  </Button>
                )
              })}
            </div>

            <Button
              size="sm"
              onClick={handleDownloadZip}
              className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              <FolderIcon className="h-3.5 w-3.5" />
              <span>Download All (ZIP)</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
