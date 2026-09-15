"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Filter,
  Lock,
  Plus,
  Trash2,
  ShieldAlert,
  RefreshCw,
  MoreHorizontal,
  CheckCheck,
  Car,
  Palette,
  Type,
  Compass,
  FileText,
  MonitorPlay,
  Monitor,
  Printer,
  IdCard,
  Zap,
  Image as ImageIcon,
  Layers,
} from "lucide-react"

const PAGE_ICON_MAP: Record<string, React.ElementType> = {
  "logo-color": Palette,
  "typography": Type,
  "brand-philosophy": Compass,
  "letterhead": FileText,
  "presentation": MonitorPlay,
  "digital-assets": Monitor,
  "printing-assets": Printer,
  "id-business-cards": IdCard,
  "vehicle-branding": Car,
  "charger-branding": Zap,
  "photos": ImageIcon,
  "graphics-library": Layers,
}

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AssetPageConfig } from "@/config/asset-pages"
import { useSearchParams } from "next/navigation"
import { EmptyState } from "./empty-state"
import { ColorPaletteSection } from "./color-palette-section"
import { AddAssetDialog } from "./add-asset-dialog"
import { EditCategoryAssetsDialog } from "./edit-asset-dialog"
import { AssetTile, Asset, FormatBadge, FolderIcon, WordIcon, PptIcon, PdfIcon, ApprovedStatusBadge } from "./asset-tile"
import { IdCardsTable } from "./id-cards-table"
import { IdCardsAccordionMenu } from "./id-cards-accordion"
import { PageGuidelinesAccordion } from "./page-guidelines-accordion"
import { InteractiveImageCanvas } from "./interactive-image-canvas"
import { AddVehicleBrandingModal } from "./add-vehicle-branding-modal"
import { VehicleBrandingTile } from "./vehicle-branding-tile"
import { VehicleBrandingSection } from "./vehicle-branding-section"
import { VehicleBrandingAccordion } from "./vehicle-branding-accordion"
import { AddChargerBrandingModal } from "./add-charger-branding-modal"
import { ChargerBrandingTile } from "./charger-branding-tile"
import { ChargerBrandingSection } from "./charger-branding-section"
import { ChargerBrandingAccordion } from "./charger-branding-accordion"
import { TypographySection } from "./typography-section"
import { BrandPhilosophySection } from "./brand-philosophy-section"
import { PhotosSection } from "./photos-section"
import { downloadGroupAsZip } from "@/lib/zip-utils"
import { useStats } from "@/lib/stats/stats-context"
import { useAssets } from "@/lib/assets/assets-context"
import { useAuth } from "@/lib/auth/auth-context"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AssetPageProps {
  config: AssetPageConfig
  initialAssets?: Asset[]
}

type FileType = "PNG" | "JPG" | "SVG" | "PDF" | "WORD" | "CDR"

import { Download } from "lucide-react"

function DownloadTab({ format, label, description, available, onClick }: { format: string; label: string; description: string; available: boolean; onClick: () => void }) {
  return (
    <button
      disabled={!available}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-lg border text-sm font-semibold transition-all text-left w-full select-none",
        available 
          ? "bg-card text-foreground border-border hover:bg-muted/80 hover:scale-[1.01] cursor-pointer shadow-sm" 
          : "bg-muted/20 text-muted-foreground/45 border-border/40 cursor-not-allowed opacity-50"
      )}
    >
      <FormatBadge format={format} />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="font-semibold text-xs tracking-wide truncate">{label}</span>
        <span className="text-[10px] text-muted-foreground font-normal truncate">
          {description}
        </span>
      </div>
      {available ? (
        <Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      ) : (
        <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-wider shrink-0">
          N/A
        </span>
      )}
    </button>
  )
}

// Custom Letterhead Component for separate assets with rich interactive UI
function SeparateLetterheadCard({ 
  headerAsset, 
  footerAsset, 
  wordAsset,
  categoryTitle,
  titleNumber,
  titleName,
  companyName,
}: { 
  headerAsset?: Asset; 
  footerAsset?: Asset; 
  wordAsset?: Asset; 
  categoryTitle: string;
  titleNumber: string;
  titleName: string;
  companyName: string;
}) {
  const { deleteAsset, replaceAssetFormat } = useAssets()
  const { user } = useAuth()
  const { incrementDownload } = useStats()
  const [copied, setCopied] = React.useState(false)
  const [zoomLevel, setZoomLevel] = React.useState<number>(100)
  const [previewModal, setPreviewModal] = React.useState<{
    open: boolean
    title: string
    subTitle: string
    imgUrl: string
    asset?: Asset
  } | null>(null)
  const isSuperAdmin = user?.role === "Super Admin"

  const headerImg = headerAsset?.formats.PNG?.fileData || headerAsset?.formats.JPG?.fileData || headerAsset?.thumbnail
  const footerImg = footerAsset?.formats.PNG?.fileData || footerAsset?.formats.JPG?.fileData || footerAsset?.thumbnail

  const triggerFormatDownload = (asset: Asset, format: string) => {
    const formatData = asset.formats[format]
    if (!formatData?.fileData) return

    const mimeType = format === "WORD" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "image/png"
    const element = document.createElement("a")
    
    if (formatData.fileData.startsWith("data:")) {
      fetch(formatData.fileData)
        .then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob)
          element.href = url
          element.download = formatData.fileName
          document.body.appendChild(element)
          element.click()
          document.body.removeChild(element)
          URL.revokeObjectURL(url)
        })
    } else {
      const file = new Blob([formatData.fileData], { type: mimeType })
      const url = URL.createObjectURL(file)
      element.href = url
      element.download = formatData.fileName
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      URL.revokeObjectURL(url)
    }
    toast.success(`Downloaded ${formatData.fileName}`)
  }

  const handleDownloadAll = async () => {
    const filesToZip: { fileName: string; fileData: string }[] = []

    if (headerAsset) {
      const fmt = Object.keys(headerAsset.formats)[0] || "JPG"
      const formatData = headerAsset.formats[fmt as keyof typeof headerAsset.formats]
      if (formatData?.fileData) {
        filesToZip.push({
          fileName: formatData.fileName || `Header_${companyName.replace(/[^a-zA-Z0-9]+/g, "_")}.${fmt.toLowerCase()}`,
          fileData: formatData.fileData,
        })
        incrementDownload()
      }
    }

    if (footerAsset) {
      const fmt = Object.keys(footerAsset.formats)[0] || "JPG"
      const formatData = footerAsset.formats[fmt as keyof typeof footerAsset.formats]
      if (formatData?.fileData) {
        filesToZip.push({
          fileName: formatData.fileName || `Footer_${companyName.replace(/[^a-zA-Z0-9]+/g, "_")}.${fmt.toLowerCase()}`,
          fileData: formatData.fileData,
        })
        incrementDownload()
      }
    }

    if (wordAsset) {
      const formatData = wordAsset.formats.WORD
      if (formatData?.fileData) {
        filesToZip.push({
          fileName: formatData.fileName || `${companyName.replace(/[^a-zA-Z0-9]+/g, "_")}_Template.docx`,
          fileData: formatData.fileData,
        })
        incrementDownload()
      }
    }

    if (filesToZip.length === 0) {
      toast.error("No files available to download in this set.")
      return
    }

    try {
      const cleanName = companyName.replace(/[^a-zA-Z0-9]+/g, "_")
      const zipFileName = `${cleanName}_Letterhead_Set.zip`
      toast.info(`Preparing ${filesToZip.length} files in ZIP...`)
      await downloadGroupAsZip(zipFileName, filesToZip)
      toast.success(`Downloaded all letterhead files as ZIP!`)
    } catch (error) {
      console.error("ZIP download failed:", error)
      toast.error("Failed to generate ZIP archive.")
    }
  }

  const handleCopyName = () => {
    navigator.clipboard.writeText(companyName)
    setCopied(true)
    toast.info(`Copied "${companyName}" to clipboard`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group/card flex flex-col bg-card text-card-foreground rounded-2xl border border-border/80 p-6 shadow-sm hover:shadow-xl hover:border-[#548235]/40 hover:-translate-y-1 transition-all duration-300 w-full relative text-left space-y-5 flex-1 min-w-[290px] lg:basis-[calc(33.333%-16px)] max-w-full">
      {/* Top Bar: Serial Badge, Title Name & Company Name + All Download Button */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col text-left space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <ApprovedStatusBadge isRelative />
            {/* Thin Line Title Number and Title Name (Gray Color) */}
            <span className="text-sm font-medium text-muted-foreground tracking-wide">
              {titleNumber} - {titleName}
            </span>
          </div>

          {/* Company Name with Copy Action on Hover */}
          <div className="flex items-center gap-2 group/name">
            <h3 className="text-lg font-black tracking-tight text-foreground line-clamp-1">
              {companyName}
            </h3>
            <button
              onClick={handleCopyName}
              className="opacity-0 group-hover/name:opacity-100 transition-opacity p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground text-xs"
              title="Copy company name"
            >
              {copied ? "✓" : "⧉"}
            </button>
          </div>
        </div>
        
        {/* Outline All Download Pill Button with Micro-Bounce */}
        <button
          onClick={handleDownloadAll}
          className="group/btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#548235] text-[#548235] hover:bg-[#548235] hover:text-white transition-all text-xs font-extrabold cursor-pointer select-none shrink-0 shadow-sm active:scale-95 duration-200"
          title="Download all formats in this set"
        >
          <span className="group-hover/btn:translate-y-0.5 transition-transform duration-200 font-bold text-xs">
            ↓
          </span>
          <span>All</span>
        </button>
      </div>

      {/* Grid: Header & Footer Side-by-Side Preview Containers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left Container: Header Graphic Preview */}
        <div className="bg-muted/25 hover:bg-muted/45 border border-border/70 rounded-xl p-3.5 min-h-[145px] flex flex-col justify-between relative overflow-hidden group/header transition-colors">
          {/* Header Label & Tag */}
          <div className="flex items-center justify-between z-10">
            <span className="font-bold text-xs text-foreground/85 tracking-wide">
              Header
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-background/80 border border-border/60 text-muted-foreground uppercase">
              JPG
            </span>
          </div>

          {/* Interactive Image Preview Area (Opens Dedicated Image Viewer) */}
          <div 
            onClick={() => {
              if (headerImg) {
                setPreviewModal({
                  open: true,
                  title: `${companyName} - Header`,
                  subTitle: `${titleNumber} - ${titleName}`,
                  imgUrl: headerImg,
                  asset: headerAsset
                })
              }
            }}
            className="flex-1 w-full flex items-center justify-center py-2.5 min-h-[70px] overflow-hidden cursor-pointer relative group/preview"
            title="Click to open image viewer"
          >
            {headerImg ? (
              <>
                <img 
                  src={headerImg} 
                  alt="Header Preview" 
                  className="max-h-[64px] object-contain rounded border border-border/30 shadow-sm transition-transform duration-300 group-hover/preview:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center rounded">
                  <span className="bg-background/95 text-foreground text-[10px] font-extrabold px-2 py-1 rounded shadow-md border border-border/80">
                    🔍 View
                  </span>
                </div>
              </>
            ) : (
              <span className="text-xs text-muted-foreground/60 select-none">No Preview</span>
            )}
          </div>

          {/* Floating Glass Action Box (Bottom Right) */}
          <div className="absolute bottom-2.5 right-2.5 bg-background/90 backdrop-blur-sm border border-border/80 rounded-lg p-1 flex items-center gap-1 shadow-sm z-20">
            {headerAsset && (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  const fmt = Object.keys(headerAsset.formats)[0] || "JPG"
                  triggerFormatDownload(headerAsset, fmt)
                }}
                className="p-1 rounded hover:bg-[#548235]/15 hover:text-[#548235] text-muted-foreground transition-all cursor-pointer"
                title="Download Header JPG"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            )}
            {isSuperAdmin && headerAsset && (
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                } />
                <DropdownMenuContent align="end" className="w-56 bg-card border border-border/80 p-2 rounded-xl shadow-2xl space-y-1">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = ".png,.jpg,.jpeg,.svg"
                      input.onchange = async (el) => {
                        const file = (el.target as HTMLInputElement).files?.[0]
                        if (file) {
                          const fmt = Object.keys(headerAsset.formats)[0] || "JPG"
                          await replaceAssetFormat(headerAsset.id, fmt, file)
                          toast.success("Header image replaced successfully.")
                        }
                      }
                      input.click()
                    }}
                    className="text-xs p-2 rounded-lg cursor-pointer hover:bg-muted"
                  >
                    Replace Image
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteAsset(headerAsset.id)
                      toast.error("Header asset deleted.")
                    }}
                    className="text-xs text-destructive hover:bg-destructive/10 p-2 rounded-lg cursor-pointer"
                  >
                    Delete Header Asset
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Right Container: Footer Graphic Preview */}
        <div className="bg-muted/25 hover:bg-muted/45 border border-border/70 rounded-xl p-3.5 min-h-[145px] flex flex-col justify-between relative overflow-hidden group/footer transition-colors">
          {/* Footer Label & Tag */}
          <div className="flex items-center justify-between z-10">
            <span className="font-bold text-xs text-foreground/85 tracking-wide">
              Footer
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-background/80 border border-border/60 text-muted-foreground uppercase">
              JPG
            </span>
          </div>

          {/* Interactive Image Preview Area (Opens Dedicated Image Viewer) */}
          <div 
            onClick={() => {
              if (footerImg) {
                setPreviewModal({
                  open: true,
                  title: `${companyName} - Footer`,
                  subTitle: `${titleNumber} - ${titleName}`,
                  imgUrl: footerImg,
                  asset: footerAsset
                })
              }
            }}
            className="flex-1 w-full flex items-center justify-center py-2.5 min-h-[70px] overflow-hidden cursor-pointer relative group/preview"
            title="Click to open image viewer"
          >
            {footerImg ? (
              <>
                <img 
                  src={footerImg} 
                  alt="Footer Preview" 
                  className="max-h-[64px] object-contain rounded border border-border/30 shadow-sm transition-transform duration-300 group-hover/preview:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center rounded">
                  <span className="bg-background/95 text-foreground text-[10px] font-extrabold px-2 py-1 rounded shadow-md border border-border/80">
                    🔍 View
                  </span>
                </div>
              </>
            ) : (
              <span className="text-xs text-muted-foreground/60 select-none">No Preview</span>
            )}
          </div>

          {/* Floating Glass Action Box (Bottom Right) */}
          <div className="absolute bottom-2.5 right-2.5 bg-background/90 backdrop-blur-sm border border-border/80 rounded-lg p-1 flex items-center gap-1 shadow-sm z-20">
            {footerAsset && (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  const fmt = Object.keys(footerAsset.formats)[0] || "JPG"
                  triggerFormatDownload(footerAsset, fmt)
                }}
                className="p-1 rounded hover:bg-[#548235]/15 hover:text-[#548235] text-muted-foreground transition-all cursor-pointer"
                title="Download Footer JPG"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            )}
            {isSuperAdmin && footerAsset && (
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                } />
                <DropdownMenuContent align="end" className="w-56 bg-card border border-border/80 p-2 rounded-xl shadow-2xl space-y-1">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = ".png,.jpg,.jpeg,.svg"
                      input.onchange = async (el) => {
                        const file = (el.target as HTMLInputElement).files?.[0]
                        if (file) {
                          const fmt = Object.keys(footerAsset.formats)[0] || "JPG"
                          await replaceAssetFormat(footerAsset.id, fmt, file)
                          toast.success("Footer image replaced successfully.")
                        }
                      }
                      input.click()
                    }}
                    className="text-xs p-2 rounded-lg cursor-pointer hover:bg-muted"
                  >
                    Replace Image
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteAsset(footerAsset.id)
                      toast.error("Footer asset deleted.")
                    }}
                    className="text-xs text-destructive hover:bg-destructive/10 p-2 rounded-lg cursor-pointer"
                  >
                    Delete Footer Asset
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Row: Word File Row (60px high) */}
      <div className="bg-muted/25 hover:bg-muted/45 border border-border/70 rounded-xl p-3 px-4 h-[60px] flex items-center justify-between relative overflow-hidden group/word transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center">
            <WordIcon size={26} />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-xs text-foreground/90">Word File</span>
            <span className="text-[10px] text-muted-foreground font-medium">Editable Template (.docx)</span>
          </div>
        </div>

        {/* Action Box */}
        <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm border border-border/80 rounded-lg p-1 shadow-sm">
          {wordAsset && (
            <button 
              onClick={(e) => {
                e.stopPropagation()
                triggerFormatDownload(wordAsset, "WORD")
              }}
              className="p-1 rounded hover:bg-blue-500/15 hover:text-blue-600 text-muted-foreground transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold px-2"
              title="Download Word Template"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Docx</span>
            </button>
          )}
          {isSuperAdmin && wordAsset && (
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              } />
              <DropdownMenuContent align="end" className="w-56 bg-card border border-border/80 p-2 rounded-xl shadow-2xl space-y-1">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    const input = document.createElement("input")
                    input.type = "file"
                    input.accept = ".doc,.docx"
                    input.onchange = async (el) => {
                      const file = (el.target as HTMLInputElement).files?.[0]
                      if (file) {
                        await replaceAssetFormat(wordAsset.id, "WORD", file)
                        toast.success("Word file replaced successfully.")
                      }
                    }
                    input.click()
                  }}
                  className="text-xs p-2 rounded-lg cursor-pointer hover:bg-muted"
                >
                  Replace Word File
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteAsset(wordAsset.id)
                    toast.error("Word asset deleted.")
                  }}
                  className="text-xs text-destructive hover:bg-destructive/10 p-2 rounded-lg cursor-pointer"
                >
                  Delete Word Asset
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Dedicated High-Res Image Viewer Lightbox Modal */}
      <Dialog open={!!previewModal?.open} onOpenChange={(open) => { if (!open) { setPreviewModal(null); setZoomLevel(100); } }}>
        <DialogContent 
          className="w-[98vw] max-w-[1550px] 2xl:max-w-[1750px] h-[88vh] p-0 overflow-hidden bg-black/25 border-0 ring-0 shadow-none rounded-2xl flex flex-col items-center justify-center"
          overlayClassName="bg-black/15 backdrop-blur-[8px]"
          showCloseButton={true}
        >
          <DialogTitle className="sr-only">
            {previewModal?.title || "Image Viewer"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {previewModal?.subTitle || "High-resolution letterhead preview"}
          </DialogDescription>

          {/* Interactive Image Canvas with Scroll Zoom & Hold Left Click Pan */}
          <div className="w-full h-full relative flex items-center justify-center">
            {previewModal?.imgUrl && (
              <InteractiveImageCanvas 
                src={previewModal.imgUrl} 
                alt={previewModal.title || "Preview"} 
                title={previewModal.title}
                subTitle={previewModal.subTitle}
              />
            )}

            {/* Floating Quick Download Icon Button */}
            {previewModal?.asset && (
              <button
                onClick={() => {
                  const fmt = Object.keys(previewModal.asset!.formats)[0] || "JPG"
                  triggerFormatDownload(previewModal.asset!, fmt)
                }}
                className="absolute bottom-4 right-5 z-30 flex items-center justify-center h-8 w-8 rounded-full bg-[#548235] text-white hover:bg-[#60963c] transition-all shadow-md active:scale-90 cursor-pointer"
                title="Download High-Res JPG"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function AssetPage({ config, initialAssets = [] }: AssetPageProps) {
  const { assets: allAssets, deleteAsset, toggleHoldAsset, replaceAssetFormat, customCategories, addAssets, getCategoryConfig } = useAssets()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("q") ?? ""
  const { incrementDownload } = useStats()
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null)

  const isSuperAdmin = user?.role === "Super Admin"

  // Find all category slugs that belong to this page (main + subcategories)
  const activeSlugs = React.useMemo(() => {
    const slugs = [config.slug]
    Object.values(customCategories).forEach((cat: any) => {
      if (cat.parentSlug === config.slug) {
        slugs.push(cat.slug)
      }
    })
    return slugs
  }, [config.slug, customCategories])

  // Filter assets matching these categories
  const assets = React.useMemo(() => {
    return allAssets.filter((a: any) => activeSlugs.includes(a.category))
  }, [allAssets, activeSlugs])

  // Group assets by category slug
  const groupedAssets = React.useMemo(() => {
    const groups: Record<string, Asset[]> = {}
    assets.forEach((asset: any) => {
      const catSlug = asset.category || config.slug
      if (!groups[catSlug]) {
        groups[catSlug] = []
      }
      groups[catSlug].push(asset)
    })
    return groups
  }, [assets, config.slug])

  // Determine the render order of the groups
  const categoryOrder = React.useMemo(() => {
    const subCats = Object.values(customCategories)
      .filter((cat: any) => cat.parentSlug === config.slug)
      .map((cat) => cat.slug)
    
    return [config.slug, ...subCats].filter(slug => groupedAssets[slug]?.length > 0)
  }, [config.slug, customCategories, groupedAssets])

  // Calculate total count of search-matched assets across all groups
  const totalFilteredCount = React.useMemo(() => {
    let count = 0
    categoryOrder.forEach(slug => {
      const catAssets = groupedAssets[slug] || []
      const filtered = catAssets.filter(asset => 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      count += filtered.length
    })
    return count
  }, [categoryOrder, groupedAssets, searchQuery])

  // Get selected asset state live from context
  const activeSelectedAsset = React.useMemo(() => {
    if (!selectedAsset) return null
    return allAssets.find(a => a.id === selectedAsset.id) || null
  }, [allAssets, selectedAsset])

  const triggerDownload = (fileName: string, fileData: string, mimeType: string) => {
    incrementDownload()
    const element = document.createElement("a")
    
    if (fileData.startsWith("data:")) {
      fetch(fileData)
        .then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob)
          element.href = url
          element.download = fileName
          document.body.appendChild(element)
          element.click()
          document.body.removeChild(element)
          URL.revokeObjectURL(url)
        })
      toast.success(`Downloaded ${fileName}`)
      return
    }

    const file = new Blob([fileData], { type: mimeType })
    const url = URL.createObjectURL(file)
    element.href = url
    element.download = fileName
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${fileName}`)
  }

  // Count total letterhead sets across all letterhead categories on the page
  const totalLetterheadSetsCount = React.useMemo(() => {
    let total = 0
    categoryOrder.forEach((slug) => {
      const catAssets = groupedAssets[slug] || []
      if (catAssets.length === 0) return

      const setMap = new Map<string, Asset[]>()
      catAssets.forEach((asset) => {
        let key = asset.setId
        if (!key) {
          const cleaned = (asset.companyName || asset.name)
            .replace(/\s*(header|footer|word|file)\s*/gi, "")
            .trim()
          if (cleaned && cleaned.toLowerCase() !== "letterhead") {
            key = `comp_${cleaned.toLowerCase()}`
          } else {
            key = `legacy_${asset.category}`
          }
        }
        if (!setMap.has(key)) {
          setMap.set(key, [])
        }
        setMap.get(key)!.push(asset)
      })
      total += setMap.size
    })
    return total
  }, [categoryOrder, groupedAssets])

  const PageIcon = PAGE_ICON_MAP[config.slug] || Layers

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#4472C4]/10 text-[#4472C4] shadow-xs shrink-0">
              <PageIcon className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#4472C4]">{config.title}</h1>
          </div>
          {config.slug !== "id-business-cards" && config.slug !== "typography" && config.slug !== "photos" && config.slug !== "brand-philosophy" && (
            <div className="mt-4 sm:mt-0 flex-shrink-0">
              {config.slug === "vehicle-branding" ? (
                <AddVehicleBrandingModal />
              ) : config.slug === "charger-branding" ? (
                <AddChargerBrandingModal />
              ) : (
                <AddAssetDialog
                  config={config}
                  defaultTitleNumber={config.slug === "letterhead" ? String(totalLetterheadSetsCount) : undefined}
                  onAdd={async (data) => {
                    await addAssets(data.category, data.tiles, config.slug)
                  }}
                />
              )}
            </div>
          )}
        </div>
        {config.slug === "letterhead" ? (
          <PageGuidelinesAccordion
            title="Letterhead Guidelines & Usage Standards"
            subtitle="Corporate communication standards, entity selection & authorization policy"
          >
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 items-start w-full">
              <div className="lg:col-span-4 flex flex-col gap-4 text-left">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The Transvolt letterhead is an official corporate identity asset used for formal communication across all departments, business units, subsidiaries, and authorized representatives of the company. Since Transvolt operates through multiple functions and locations, there may be different approved letterhead designs for specific legal entities, regional offices, or business purposes. Each letterhead has been officially designed and approved for its intended use and must be used only in the appropriate context.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Always use the officially approved Transvolt letterhead provided by the Branding or Corporate Communications team. Do not create, redesign, modify, or replicate the letterhead using your own layouts, colors, logos, typography, or graphic elements. Any alteration to the approved design—including changes to the logo, colors, margins, header, footer, contact details, typography, spacing, or document structure—is strictly prohibited.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Before issuing any official communication, ensure that the correct letterhead version is selected based on the company entity, department, office location, or business purpose. Using an incorrect or unauthorized letterhead may result in misrepresentation of the company and could lead to the document being considered unofficial or invalid.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed border-l-2 border-red-500/50 pl-3 italic bg-red-500/5 py-1.5 rounded-r">
                  Only documents issued on approved Transvolt letterheads should be treated as official corporate communications. Any document prepared on an unapproved, modified, or self-designed letterhead shall <strong className="font-extrabold text-red-500 dark:text-red-400">not</strong> be considered an official Transvolt document and may be rejected by internal teams, clients, vendors, government authorities, or other stakeholders.
                </p>
              </div>
              
              <div className="lg:col-span-3 bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <div className="p-1 rounded bg-[#548235]/10 text-[#548235]">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#548235] tracking-wide uppercase">Letterhead Usage Standards</h3>
                </div>
                <ul className="space-y-3 text-left">
                  {[
                    "Use only the officially approved Transvolt letterhead templates.",
                    "Select the correct letterhead based on the relevant company entity, department, or office.",
                    "Do not recreate or design a new letterhead under any circumstances.",
                    "Do not modify the approved layout, logo, colors, fonts, spacing, or contact information.",
                    "Ensure the letterhead is used for official business communication only.",
                    "Maintain the original file format and print quality when producing hard copies.",
                    "Any outdated or superseded letterhead should be discontinued immediately.",
                    "For digital documents and PDFs, use only the latest approved electronic letterhead template."
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground font-medium leading-relaxed">
                      <span className="flex-shrink-0 mt-0.5 h-3.5 w-3.5 rounded-full bg-[#548235]/15 text-[#548235] flex items-center justify-center font-bold text-[9px]">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-muted-foreground/60 leading-relaxed border-t border-border pt-3">
                  Following these guidelines ensures consistency, authenticity, and professionalism in every official communication, while preserving the integrity and credibility of the Transvolt brand.
                </p>
              </div>
            </div>
          </PageGuidelinesAccordion>
        ) : config.slug === "logo-color" ? (
          <PageGuidelinesAccordion
            title="Logo & Colour Usage Guidelines & Specifications"
            subtitle="Official brand assets, typography, colour palette values & quick usage rules"
          >
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 items-start w-full text-left">
              {/* Left Column: Guidelines & Narrative */}
              <div className="lg:col-span-4 flex flex-col gap-5 text-left">
                {/* Section 1: Logo & Colour Usage Guidelines */}
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-[#4472C4] tracking-tight">
                    Logo &amp; Colour Usage Guidelines
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    The Transvolt logo is our primary brand asset and must be used consistently across all digital and print mediums. Always use officially approved files from this portal. Do not recreate, redraw, modify, or substitute the logo. Its colours, proportions, typography, and composition must remain exact. Never alter the logo by changing colours, distorting, rotating, adding shadows, gradients, or other visual effects.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Maintain the original aspect ratio when resizing and ensure adequate clear space around the logo for maximum legibility. Choose the appropriate version according to background contrast. <strong className="text-foreground font-bold">All communications must use the official logo versions hosted on this portal.</strong> The assets listed below are the authorized brand files for digital platforms, marketing collaterals, merchandise, vehicle branding, and physical signage.
                  </p>
                </div>

                {/* Section 2: Colour Theme Usage Guidelines */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <h3 className="text-base font-extrabold text-[#548235] tracking-tight">
                    Colour Theme Usage Guidelines
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    The Transvolt colour palette defines our visual identity and must be applied consistently across all touchpoints. This portal is the <strong className="text-foreground font-semibold">single source of truth</strong> for all branding requirements. Always use the exact approved colour values provided and avoid visual approximations or custom variations.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Apply the colour system purposefully to build a recognizable, professional identity. Primary colours lead key brand elements and communications, while secondary and accent colours provide structured support according to brand guidelines.
                  </p>
                </div>

                {/* Section 3: Warning Callout Box */}
                <div className="border-l-2 border-red-500/60 pl-3.5 italic bg-red-500/5 py-2 rounded-r text-xs text-muted-foreground leading-relaxed">
                  <strong className="font-bold text-red-500 dark:text-red-400 not-italic block mb-0.5">
                    ⚠️ Warning &amp; Authorization Policy
                  </strong>
                  <strong className="text-foreground/90 font-semibold not-italic">Only approved logo files and colour specifications from this portal are authorized for official use.</strong> Do not use outdated assets, modified graphics, or unapproved color values. Any deviation weakens brand consistency. When in doubt, consult the Branding team before proceeding.
                </div>
              </div>
              
              {/* Right Column: Quick Usage Rules Cards */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                {/* Card 1: Quick Logo Usage Rules */}
                <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-3.5">
                  <div className="flex items-center gap-2 border-b border-border pb-2.5">
                    <div className="p-1 rounded bg-[#4472C4]/10 text-[#4472C4]">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-xs text-[#4472C4] tracking-wide uppercase">Quick Logo Usage Rules</h3>
                  </div>
                  <ul className="space-y-2.5 text-left">
                    {[
                      { title: "Use Approved Logos Only", desc: "Select logos exclusively from latest portal assets." },
                      { title: "Do Not Modify", desc: "Never change colours, proportions, typography, or shape." },
                      { title: "Maintain Proportions", desc: "Always preserve original aspect ratio when resizing." },
                      { title: "Respect Clear Space", desc: "Maintain sufficient space around logo for visibility." },
                      { title: "Use the Right Version", desc: "Select appropriate approved logo for background." },
                      { title: "No Effects or Distortion", desc: "Do not add shadows, outlines, or distort the logo." },
                      { title: "Do Not Recreate", desc: "Do not redraw or manually reproduce the logo." },
                      { title: "Check Before Publishing", desc: "Verify final logo matches an approved version." },
                    ].map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground font-medium leading-tight">
                        <span className="flex-shrink-0 mt-0.5 h-3.5 w-3.5 rounded-full bg-[#4472C4]/15 text-[#4472C4] flex items-center justify-center font-bold text-[9px]">
                          ✓
                        </span>
                        <span><strong className="text-foreground/90 font-semibold">{rule.title}</strong> — {rule.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card 2: Quick Colour Usage Rules */}
                <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-3.5">
                  <div className="flex items-center gap-2 border-b border-border pb-2.5">
                    <div className="p-1 rounded bg-[#548235]/10 text-[#548235]">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-xs text-[#548235] tracking-wide uppercase">Quick Colour Usage Rules</h3>
                  </div>
                  <ul className="space-y-2.5 text-left">
                    {[
                      { title: "Use Approved Colours Only", desc: "Select colours from official Transvolt palette." },
                      { title: "Use Exact Values", desc: "Follow approved HEX, RGB, CMYK, or Pantone codes." },
                      { title: "Maintain Consistency", desc: "Same approved colours across digital and print." },
                      { title: "Primary Colours First", desc: "Use primary colours for major brand elements." },
                      { title: "Do Not Guess Colours", desc: "Never pick colours by eyeballing screenshots." },
                      { title: "Maintain Contrast", desc: "Ensure sufficient contrast for accessibility." },
                      { title: "Verify Before Production", desc: "Check artwork against palette before sending to print." },
                    ].map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground font-medium leading-tight">
                        <span className="flex-shrink-0 mt-0.5 h-3.5 w-3.5 rounded-full bg-[#548235]/15 text-[#548235] flex items-center justify-center font-bold text-[9px]">
                          ✓
                        </span>
                        <span><strong className="text-foreground/90 font-semibold">{rule.title}</strong> — {rule.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </PageGuidelinesAccordion>
        ) : config.slug === "presentation" ? (
          <PageGuidelinesAccordion
            title="Presentation (PowerPoint) Guidelines & Best Practices"
            subtitle="Corporate slide decks, Poppins typography hierarchy, safe margins & projection standards"
          >
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 items-start w-full text-left">
              {/* Left Column: Guidelines & Narrative */}
              <div className="lg:col-span-4 flex flex-col gap-4 text-left">
                <div className="space-y-3">
                  <h3 className="text-base font-extrabold text-[#4472C4] tracking-tight">
                    Presentation (PowerPoint) Guidelines
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Official PowerPoint presentations represent Transvolt before clients, investors, government authorities, and corporate stakeholders. All presentation templates hosted on this portal are officially verified and approved for corporate communication.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    <strong className="text-foreground font-semibold">Use only the presentation templates provided on this portal.</strong> Any self-generated, custom-designed, or third-party presentation themes are strictly unauthorized and will not be recognized or accepted as official Transvolt presentations.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    When creating presentations, adhere strictly to approved layouts, brand colors, typography hierarchy (<strong className="text-foreground font-semibold">Poppins</strong> typeface), and clean visual spacing. Maintain high-resolution diagrams and infographics over dense text blocks to ensure clarity during live meetings and projections.
                  </p>
                </div>

                {/* Warning / Compliance Callout Box */}
                <div className="border-l-2 border-red-500/60 pl-3.5 bg-red-500/5 py-2.5 rounded-r text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-red-500 dark:text-red-400 font-bold block mb-0.5">
                    ⚠️ Mandatory Authorization Policy
                  </strong>
                  Only presentations built using the verified templates from this portal are authorized. Self-generated or unapproved presentation designs are not accepted for any official business correspondence.
                </div>
              </div>
              
              {/* Right Column: Standards & Best Practices Cards */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                {/* Card 1: Presentation Usage Standards */}
                <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 border-b border-border pb-2.5">
                    <div className="p-1 rounded bg-[#4472C4]/10 text-[#4472C4]">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-xs text-[#4472C4] tracking-wide uppercase">Usage Standards</h3>
                  </div>
                  <ul className="space-y-2 text-left">
                    {[
                      { title: "Portal Templates Only", desc: "Use only approved presentation decks from this portal." },
                      { title: "No Self-Generated Themes", desc: "Custom or third-party themes are not accepted." },
                      { title: "Brand Colors & Fonts", desc: "Use official palette and Poppins typography." },
                      { title: "No Layout Modifications", desc: "Keep margins, headers, and logo positions intact." },
                      { title: "Export to PDF", desc: "Preserve font rendering when sharing across devices." },
                    ].map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground font-medium leading-tight">
                        <span className="flex-shrink-0 mt-0.5 h-3.5 w-3.5 rounded-full bg-[#4472C4]/15 text-[#4472C4] flex items-center justify-center font-bold text-[9px]">
                          ✓
                        </span>
                        <span><strong className="text-foreground/90 font-semibold">{rule.title}</strong> — {rule.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card 2: Presentation Best Practices */}
                <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 border-b border-border pb-2.5">
                    <div className="p-1 rounded bg-[#548235]/10 text-[#548235]">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-xs text-[#548235] tracking-wide uppercase">Best Practices</h3>
                  </div>
                  <ul className="space-y-2 text-left">
                    {[
                      { title: "Official Cover Slide", desc: "Lead with the standardized title slide." },
                      { title: "Visuals Over Text", desc: "Replace large text blocks with infographics & charts." },
                      { title: "White Space & Clarity", desc: "Keep slides clean with strong visual hierarchy." },
                      { title: "Consistent Icons", desc: "Maintain uniform icon styles and line weights." },
                      { title: "Screen & Projector Ready", desc: "Ensure strong contrast for crisp projection." },
                    ].map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground font-medium leading-tight">
                        <span className="flex-shrink-0 mt-0.5 h-3.5 w-3.5 rounded-full bg-[#548235]/15 text-[#548235] flex items-center justify-center font-bold text-[9px]">
                          ✓
                        </span>
                        <span><strong className="text-foreground/90 font-semibold">{rule.title}</strong> — {rule.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </PageGuidelinesAccordion>
        ) : config.slug === "digital-assets" ? (
          <PageGuidelinesAccordion
            title="Digital Assets Guidelines & Specifications"
            subtitle="Social media creatives, email headers, web banners & platform safe margins"
          >
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 items-start w-full text-left">
              {/* Left Column: Guidelines & Narrative */}
              <div className="lg:col-span-4 flex flex-col gap-4 text-left">
                <div className="space-y-3">
                  <h3 className="text-base font-extrabold text-[#4472C4] tracking-tight">
                    Digital Assets Guidelines
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Digital creatives maintain Transvolt&apos;s brand identity across online platforms, social media, email campaigns, web graphics, and digital advertising. Every asset represents the company and must communicate a consistent, professional, and modern visual experience.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    <strong className="text-foreground font-semibold">Use only the officially approved digital asset templates from this portal.</strong> Do not create custom design themes or alter approved templates by changing logos, brand colors, typography, or iconography without prior clearance from Corporate Communications.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    All creatives must be high-resolution, visually clean, and tailored to target platform dimensions and safe margins. Visuals should reinforce Transvolt&apos;s commitment to innovation, technology, and green mobility.
                  </p>
                </div>

                {/* Warning / Compliance Callout Box */}
                <div className="border-l-2 border-red-500/60 pl-3.5 bg-red-500/5 py-2.5 rounded-r text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-red-500 dark:text-red-400 font-bold block mb-0.5">
                    ⚠️ Mandatory Authorization Policy
                  </strong>
                  Only digital assets created using verified templates from this portal are authorized. Unapproved designs or self-generated graphics are strictly prohibited and will not be accepted as official Transvolt communications.
                </div>
              </div>
              
              {/* Right Column: Categories & Usage Standards Cards */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                {/* Card 1: Digital Assets Include */}
                <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 border-b border-border pb-2.5">
                    <div className="p-1 rounded bg-[#4472C4]/10 text-[#4472C4]">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-xs text-[#4472C4] tracking-wide uppercase">Digital Assets Include</h3>
                  </div>
                  <ul className="space-y-2 text-left">
                    {[
                      { title: "Social Media Creatives", desc: "Posts & stories for LinkedIn, X, Instagram & Facebook." },
                      { title: "Emailers & Newsletters", desc: "Corporate email headers and newsletter templates." },
                      { title: "Web & Ad Banners", desc: "Website banners, landing visuals & Google display ads." },
                      { title: "Announcements & Events", desc: "Product launches, webinars, festive & recruitment posts." },
                      { title: "Screen Displays & Infographics", desc: "Digital signage, app promotion & data graphics." },
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground font-medium leading-tight">
                        <span className="flex-shrink-0 mt-0.5 h-3.5 w-3.5 rounded-full bg-[#4472C4]/15 text-[#4472C4] flex items-center justify-center font-bold text-[9px]">
                          ✓
                        </span>
                        <span><strong className="text-foreground/90 font-semibold">{item.title}</strong> — {item.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card 2: Usage Standards */}
                <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 border-b border-border pb-2.5">
                    <div className="p-1 rounded bg-[#548235]/10 text-[#548235]">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-xs text-[#548235] tracking-wide uppercase">Usage Standards</h3>
                  </div>
                  <ul className="space-y-2 text-left">
                    {[
                      { title: "Portal Templates Only", desc: "Build solely upon approved portal templates." },
                      { title: "Exact Colors & Fonts", desc: "Adhere to official HEX codes and Poppins typography." },
                      { title: "Platform Safe Zones", desc: "Follow platform aspect ratios and safe margin specs." },
                      { title: "No Distortion", desc: "Never stretch, recolor, outline, or recreate logos." },
                      { title: "Pre-Publish Verification", desc: "Verify copy, spelling, and brand compliance before release." },
                    ].map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground font-medium leading-tight">
                        <span className="flex-shrink-0 mt-0.5 h-3.5 w-3.5 rounded-full bg-[#548235]/15 text-[#548235] flex items-center justify-center font-bold text-[9px]">
                          ✓
                        </span>
                        <span><strong className="text-foreground/90 font-semibold">{rule.title}</strong> — {rule.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </PageGuidelinesAccordion>
        ) : config.slug === "printing-assets" ? (
          <PageGuidelinesAccordion
            title="Print Assets Guidelines & Production Standards"
            subtitle="Corporate collateral, print specifications, high-durability materials & authorization policy"
          >
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-5 items-start w-full text-left">
              {/* Left Column: Guidelines Narrative & Brand Consistency Policy (Refined by 5%) */}
              <div className="lg:col-span-4 flex flex-col gap-3.5 text-left">
                <div className="space-y-2.5">
                  <h3 className="text-base font-extrabold text-[#4472C4] tracking-tight">
                    Print Assets Guidelines
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Print assets are an essential part of Transvolt&apos;s corporate identity and represent the company across business operations, customer interactions, events, marketing, and official communications. Every printed material should consistently reflect the Transvolt brand by following approved design standards, ensuring a professional, recognizable, and high-quality appearance.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    The Print Assets library contains all officially approved artwork and templates for printed communication. These include corporate stationery, marketing collateral, promotional materials, operational documents, event branding, packaging, signage, and other printed media. Every print asset has been developed using approved logos, color palettes, typography, and layout systems to maintain consistency across all physical touchpoints.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    <strong className="text-foreground font-semibold">Always use the officially approved print artwork and templates provided through the Transvolt Brand Portal or internal document repository.</strong> Do not create new layouts, redesign existing templates, or modify approved branding elements without prior authorization from Corporate Communications. Any unauthorized changes to logos, colors, typography, spacing, layouts, or imagery compromise brand integrity and must be avoided.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Before sending any artwork for production, ensure that the latest approved print files are used and verify that all content is reviewed for branding, spelling, formatting, dimensions, and print quality. <strong className="text-foreground font-semibold">Only production-ready artwork should be shared with printers or external vendors.</strong>
                  </p>
                </div>

                {/* Brand Consistency & Authorization Policy Callout Box */}
                <div className="border-l-2 border-[#548235] pl-3.5 bg-[#548235]/5 py-2.5 rounded-r text-xs text-muted-foreground leading-relaxed space-y-1">
                  <strong className="text-[#548235] font-bold block text-xs tracking-wide uppercase">
                    🛡️ Brand Consistency &amp; Authorization Policy
                  </strong>
                  <p>
                    Every printed item represents the Transvolt brand in the physical world. Consistent application of approved print assets strengthens brand recognition, builds trust with stakeholders, and reflects our commitment to quality and professionalism.
                  </p>
                  <p className="font-medium text-foreground/90">
                    Any printed material produced using unapproved templates, modified branding, or self-designed layouts shall <strong className="font-extrabold text-red-500 dark:text-red-400">not</strong> be considered an official Transvolt asset and may be rejected for internal or external use.
                  </p>
                </div>
              </div>
              
              {/* Right Column: Cards (Print Assets Include, Usage Standards) */}
              <div className="lg:col-span-3 flex flex-col gap-3.5">
                {/* Card 1: Print Assets Include (Compact 3-Column Grid) */}
                <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-sm space-y-2">
                  <div className="flex items-center gap-1.5 border-b border-border pb-2">
                    <div className="p-1 rounded bg-[#4472C4]/10 text-[#4472C4]">
                      <ShieldAlert className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="font-bold text-xs text-[#4472C4] tracking-wide uppercase">Print Assets Include</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1 text-left">
                    {[
                      "Business Cards", "Letterheads", "Envelopes",
                      "ID Cards", "Company Profiles", "Brochures",
                      "Flyers & Leaflets", "Catalogues", "Datasheets",
                      "Posters & Banners", "Standees", "Certificates",
                      "Invoice Books", "Receipt Books", "Registers",
                      "Notepads", "Folders", "Presentation Covers",
                      "Packaging Labels", "Product Stickers", "Vehicle Branding",
                      "Safety Signages", "Office Branding", "Event Collateral"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-[10.5px] text-muted-foreground font-medium">
                        <span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-[#4472C4]/15 text-[#4472C4] flex items-center justify-center font-bold text-[7.5px]">
                          ✓
                        </span>
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 2: Print Asset Usage Standards (Reduced by 25%) */}
                <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-sm space-y-2">
                  <div className="flex items-center gap-1.5 border-b border-border pb-2">
                    <div className="p-1 rounded bg-[#548235]/10 text-[#548235]">
                      <ShieldAlert className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="font-bold text-xs text-[#548235] tracking-wide uppercase">Print Asset Usage Standards</h3>
                  </div>
                  <ul className="space-y-1.5 text-left">
                    {[
                      { title: "Approved Templates Only", desc: "Use only official portal artwork." },
                      { title: "Follow Brand System", desc: "Adhere to approved logos, palette, and typography." },
                      { title: "No Redesigning", desc: "Never recreate or modify official materials." },
                      { title: "High-Resolution Output", desc: "Use vector assets for crisp print reproduction." },
                      { title: "Margins & Safe Zones", desc: "Maintain specified trim, margins, and bleed areas." },
                      { title: "Preserve Aspect Ratio", desc: "Never stretch, compress, or distort brand assets." },
                      { title: "Color Specifications", desc: "Prepare artwork in approved CMYK or Pantone values." },
                      { title: "Pre-Print Proofreading", desc: "Check copy, dimensions, and finishing before print." },
                      { title: "Prior Approvals", desc: "Obtain clearance prior to final press runs." },
                      { title: "Archive Final Files", desc: "Store only final approved print-ready deliverables." },
                    ].map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-muted-foreground font-medium leading-tight">
                        <span className="flex-shrink-0 mt-0.5 h-3 w-3 rounded-full bg-[#548235]/15 text-[#548235] flex items-center justify-center font-bold text-[8px]">
                          ✓
                        </span>
                        <span><strong className="text-foreground/90 font-semibold">{rule.title}</strong> — {rule.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </PageGuidelinesAccordion>
        ) : config.slug === "id-business-cards" ? (
          <IdCardsAccordionMenu />
        ) : config.slug === "vehicle-branding" ? (
          <VehicleBrandingAccordion />
        ) : config.slug === "charger-branding" ? (
          <ChargerBrandingAccordion />
        ) : config.slug === "typography" ? null : config.slug === "photos" ? null : config.slug === "brand-philosophy" ? null : config.description ? (
          <PageGuidelinesAccordion
            title={`${config.title} Guidelines & Specifications`}
            subtitle={`Official branding requirements, standards & assets for ${config.title}`}
          >
            <p className="text-muted-foreground whitespace-pre-line text-left w-full text-xs leading-relaxed">
              {config.description}
            </p>
          </PageGuidelinesAccordion>
        ) : null}
      </div>

      {config.slug === "id-business-cards" ? (
        <div className="w-full -mt-4">
          <IdCardsTable />
        </div>
      ) : config.slug === "vehicle-branding" ? (
        <VehicleBrandingSection searchQuery={searchQuery} />
      ) : config.slug === "charger-branding" ? (
        <ChargerBrandingSection searchQuery={searchQuery} />
      ) : config.slug === "typography" ? (
        <TypographySection />
      ) : config.slug === "brand-philosophy" ? (
        <BrandPhilosophySection />
      ) : config.slug === "photos" ? (
        <PhotosSection searchQuery={searchQuery} />
      ) : assets.length > 0 ? (
        <>
          {totalFilteredCount > 0 ? (
            <div className="space-y-8">
              {(() => {
                let globalLetterheadIndex = 0

                return categoryOrder.map((slug) => {
                  const catConfig = slug === config.slug ? config : customCategories[slug]
                  const catAssets = groupedAssets[slug] || []
                  
                  const filteredCatAssets = catAssets.filter(asset => 
                    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )

                  if (filteredCatAssets.length === 0) return null

                  // If letterhead, group assets into unified company sets
                  const letterheadSets: Array<{
                    key: string
                    titleNumber: string
                    titleName: string
                    companyName: string
                    headerAsset?: Asset
                    footerAsset?: Asset
                    wordAsset?: Asset
                  }> = []

                  if (config.slug === "letterhead") {
                    const setMap = new Map<string, Asset[]>()
                    filteredCatAssets.forEach((asset) => {
                      let key = asset.setId
                      if (!key) {
                        const cleaned = (asset.companyName || asset.name)
                          .replace(/\s*(header|footer|word|file)\s*/gi, "")
                          .trim()
                        if (cleaned && cleaned.toLowerCase() !== "letterhead") {
                          key = `comp_${cleaned.toLowerCase()}`
                        } else {
                          key = `legacy_${asset.category}`
                        }
                      }

                      if (!setMap.has(key)) {
                        setMap.set(key, [])
                      }
                      setMap.get(key)!.push(asset)
                    })

                    setMap.forEach((setAssets, key) => {
                      const headerAsset = setAssets.find((a) => a.name.toLowerCase().includes("header"))
                      const footerAsset = setAssets.find((a) => a.name.toLowerCase().includes("footer"))
                      const wordAsset = setAssets.find(
                        (a) => a.name.toLowerCase().includes("word") || a.formats.WORD
                      )

                      const sample = headerAsset || footerAsset || wordAsset || setAssets[0]

                      let compName = sample.companyName
                      if (!compName) {
                        const raw = sample.name
                        compName = raw.replace(/\s*(header|footer|word|file)\s*/gi, "").trim()
                        if (!compName || compName.toLowerCase() === "letterhead") {
                          compName = "Transvolt Official Document"
                        }
                      }

                      const tName = sample.titleName || catConfig?.title || "General Document"

                      // Sequential global counting from 0 across all categories
                      const tNum = String(globalLetterheadIndex)
                      globalLetterheadIndex++

                      letterheadSets.push({
                        key,
                        titleNumber: tNum,
                        titleName: tName,
                        companyName: compName,
                        headerAsset: headerAsset || setAssets[0],
                        footerAsset: footerAsset || setAssets[0],
                        wordAsset: wordAsset || setAssets[0],
                      })
                    })
                  }

                  return (
                    // Category Tile: Single in row full width, containing child Company Letterhead tiles
                    <div 
                      key={slug} 
                      className="bg-muted/30 border border-border/80 rounded-2xl p-6 space-y-4 w-full"
                    >
                      {/* Category Name on top left */}
                      <div className="flex items-center justify-between pb-2 border-b border-border/60">
                        <h2 className="font-extrabold uppercase tracking-wider text-left" style={{ fontSize: "22px", color: "#548235" }}>
                          {catConfig?.title || "Assets"}
                        </h2>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground font-medium mr-1.5">
                            {config.slug === "letterhead" ? `${letterheadSets.length} company set(s)` : `${filteredCatAssets.length} asset(s)`}
                          </span>

                          {/* Edit Icon -> Opens 'Edit Asset' form containing all assets in this category */}
                          <EditCategoryAssetsDialog
                            config={config}
                            categorySlug={slug}
                            categoryTitle={catConfig?.title || slug}
                            assets={filteredCatAssets}
                          />

                          {config.slug === "vehicle-branding" ? (
                            <AddVehicleBrandingModal
                              defaultCompany={catConfig?.title}
                              trigger={
                                <Button 
                                  variant="ghost" 
                                  size="icon-sm" 
                                  className="h-7 w-7 rounded-full hover:bg-muted text-muted-foreground flex items-center justify-center cursor-pointer"
                                  title={`Add vehicle branding to ${catConfig?.title}`}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              }
                            />
                          ) : config.slug === "charger-branding" ? (
                            <AddChargerBrandingModal
                              defaultCompany={catConfig?.title}
                              trigger={
                                <Button 
                                  variant="ghost" 
                                  size="icon-sm" 
                                  className="h-7 w-7 rounded-full hover:bg-muted text-muted-foreground flex items-center justify-center cursor-pointer"
                                  title={`Add charger branding to ${catConfig?.title}`}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              }
                            />
                          ) : (
                            <AddAssetDialog
                              config={config}
                              categoryOverride={catConfig?.title}
                              defaultTitleNumber={config.slug === "letterhead" ? String(totalLetterheadSetsCount) : undefined}
                              onAdd={async (data) => {
                                await addAssets(data.category, data.tiles, config.slug)
                              }}
                              trigger={
                                <Button 
                                  variant="ghost" 
                                  size="icon-sm" 
                                  className="h-7 w-7 rounded-full hover:bg-muted text-muted-foreground flex items-center justify-center cursor-pointer"
                                  title={`Add assets to ${catConfig?.title}`}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              }
                            />
                          )}
                        </div>
                      </div>

                      {/* Dynamic child white asset tiles list */}
                      {config.slug === "letterhead" ? (
                        <div className="flex flex-wrap gap-6 w-full items-stretch">
                          {letterheadSets.map((set) => (
                            <SeparateLetterheadCard
                              key={set.key}
                              headerAsset={set.headerAsset}
                              footerAsset={set.footerAsset}
                              wordAsset={set.wordAsset}
                              categoryTitle={catConfig?.title || "Letterhead Set"}
                              titleNumber={set.titleNumber}
                              titleName={set.titleName}
                              companyName={set.companyName}
                            />
                          ))}
                        </div>
                      ) : (
                        <div
                          className="grid gap-6"
                          style={{ gridTemplateColumns: `repeat(${Math.min(filteredCatAssets.length, 4)}, 1fr)` }}
                        >
                          {filteredCatAssets.map((asset) => (
                            <AssetTile 
                              key={asset.id} 
                              asset={asset} 
                              onSelect={() => setSelectedAsset(asset)} 
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              })()}
            </div>
          ) : (
            <div className="py-14 flex flex-col items-center justify-center text-center border-2 border-dashed border-border/60 rounded-2xl bg-card/30 p-8 my-4">
              <Car className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <h3 className="text-base font-semibold text-foreground">No Assets Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                {searchQuery ? `No assets match "${searchQuery}".` : 'Click the black "+ Add Asset" button above to add assets.'}
              </p>
            </div>
          )}
        </>
      ) : null}

      {/* Official Color Palette — only on logo-color page */}
      {config.slug === "logo-color" && <ColorPaletteSection />}

      {/* Side Detail Panel / Smooth Slide-out Sheet */}
      <Sheet open={!!activeSelectedAsset} onOpenChange={(open) => { if (!open) setSelectedAsset(null) }}>
        <SheetContent className="sm:max-w-md p-6 overflow-y-auto">
          <SheetHeader className="border-b pb-4 mb-4">
            <SheetTitle>Asset Formats & Info</SheetTitle>
            <SheetDescription>
              Download files or manage asset properties.
            </SheetDescription>
          </SheetHeader>
          
          {activeSelectedAsset && (
            <div className="flex flex-col gap-6">
              {/* Category Title */}
              <div>
                <span className="text-xs font-bold uppercase text-neutral-400 dark:text-neutral-500">Category</span>
                <p className="text-lg font-bold text-[#4472C4] mt-0.5">
                  {getCategoryConfig(activeSelectedAsset.category)?.title || activeSelectedAsset.category}
                </p>
              </div>

              {/* Asset Title */}
              <div>
                <span className="text-xs font-bold uppercase text-neutral-400 dark:text-neutral-500">Asset Title</span>
                <p className="text-base font-semibold mt-0.5">{activeSelectedAsset.name}</p>
              </div>

              {/* Image Preview */}
              <div>
                <span className="text-xs font-bold uppercase text-muted-foreground">Image Preview</span>
                <div className="mt-1 aspect-video w-full rounded-lg bg-checkerboard border border-border p-2 flex items-center justify-center overflow-hidden">
                  {(() => {
                    const isSelectedLogo = activeSelectedAsset.category === "logo-color"
                      || activeSelectedAsset.category?.toLowerCase().includes("logo")
                      || activeSelectedAsset.name?.toLowerCase().includes("logo")
                      || activeSelectedAsset.titleName?.toLowerCase().includes("logo")
                      || (getCategoryConfig(activeSelectedAsset.category) as any)?.parentSlug === "logo-color"

                    const detailPreviewSrc = isSelectedLogo
                      ? (activeSelectedAsset.formats.PNG?.fileData 
                          || (activeSelectedAsset.formats as any)?.png?.fileData 
                          || activeSelectedAsset.formats.SVG?.fileData 
                          || (activeSelectedAsset.thumbnail && !activeSelectedAsset.thumbnail.startsWith("data:image/jpeg") ? activeSelectedAsset.thumbnail : null))
                      : ((activeSelectedAsset.thumbnail && !activeSelectedAsset.thumbnail.startsWith("data:image/jpeg")) 
                          ? activeSelectedAsset.thumbnail 
                          : (activeSelectedAsset.formats.PNG?.fileData || activeSelectedAsset.thumbnail || activeSelectedAsset.formats.JPG?.fileData || null))

                    if (detailPreviewSrc) {
                      return (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={detailPreviewSrc} 
                          alt={activeSelectedAsset.name} 
                          className="max-h-full max-w-full object-scale-down rounded-md" 
                        />
                      )
                    }

                    if (activeSelectedAsset.category === "presentation" || activeSelectedAsset.category?.toLowerCase().includes("presentation") || !!activeSelectedAsset.formats.PPT) {
                      return (
                        <div className="flex flex-col items-center justify-center gap-2 select-none">
                          <PptIcon size={56} />
                          <span className="text-[11px] font-extrabold text-[#D24726] tracking-wider uppercase">PowerPoint Deck</span>
                        </div>
                      )
                    }

                    if (activeSelectedAsset.formats.WORD) {
                      return (
                        <div className="flex flex-col items-center justify-center gap-2 select-none">
                          <WordIcon size={56} />
                          <span className="text-[11px] font-extrabold text-[#2B5797] tracking-wider uppercase">Word Document</span>
                        </div>
                      )
                    }

                    if (activeSelectedAsset.formats.PDF) {
                      return (
                        <div className="flex flex-col items-center justify-center gap-2 select-none">
                          <PdfIcon size={56} />
                          <span className="text-[11px] font-extrabold text-[#EF4444] tracking-wider uppercase">PDF Document</span>
                        </div>
                      )
                    }

                    return (
                      <span className="text-xs text-muted-foreground/60 font-medium">
                        No Image Preview Available
                      </span>
                    )
                  })()}
                </div>
              </div>

              {/* Uploaded Date */}
              <div>
                <span className="text-xs font-bold uppercase text-muted-foreground">Uploaded Date</span>
                <p className="text-sm mt-0.5">{activeSelectedAsset.updatedAt}</p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">Status:</span>
                <Badge className={cn(
                  activeSelectedAsset.status === "active" ? "bg-green-500 hover:bg-green-600" : "bg-amber-500 hover:bg-amber-600"
                )}>
                  {activeSelectedAsset.status}
                </Badge>
              </div>

              {/* Download Options */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase text-neutral-400 dark:text-neutral-500">Download Options</span>
                <div className="flex flex-col gap-2.5">
                  <DownloadTab 
                    format="JPG"
                    label="Download JPG" 
                    description="Image File"
                    available={!!activeSelectedAsset.formats.JPG}
                    onClick={() => triggerDownload(activeSelectedAsset.formats.JPG?.fileName || `${activeSelectedAsset.name}.jpg`, activeSelectedAsset.formats.JPG?.fileData || "", "image/jpeg")}
                  />
                  <DownloadTab 
                    format="PNG"
                    label="Download PNG" 
                    description="Portable Network Graphic - Transparent"
                    available={!!activeSelectedAsset.formats.PNG}
                    onClick={() => triggerDownload(activeSelectedAsset.formats.PNG?.fileName || `${activeSelectedAsset.name}.png`, activeSelectedAsset.formats.PNG?.fileData || "", "image/png")}
                  />
                  <DownloadTab 
                    format="SVG"
                    label="Download SVG" 
                    description="Scalable Vector Graphics"
                    available={!!activeSelectedAsset.formats.SVG}
                    onClick={() => triggerDownload(activeSelectedAsset.formats.SVG?.fileName || `${activeSelectedAsset.name}.svg`, activeSelectedAsset.formats.SVG?.fileData || "", "image/svg+xml")}
                  />
                  <DownloadTab 
                    format="PDF"
                    label="Download PDF" 
                    description="Portable Document Format"
                    available={!!activeSelectedAsset.formats.PDF}
                    onClick={() => triggerDownload(activeSelectedAsset.formats.PDF?.fileName || `${activeSelectedAsset.name}.pdf`, "%PDF-1.4 mock pdf payload", "application/pdf")}
                  />
                  <DownloadTab 
                    format="WORD"
                    label="Download WORD" 
                    description="Microsoft Word Document"
                    available={!!activeSelectedAsset.formats.WORD}
                    onClick={() => triggerDownload(activeSelectedAsset.formats.WORD?.fileName || `${activeSelectedAsset.name}.docx`, "DOCX mock payload", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
                  />
                  <DownloadTab 
                    format="CDR"
                    label="Download CDR" 
                    description="CorelDraw File"
                    available={!!activeSelectedAsset.formats.CDR}
                    onClick={() => triggerDownload(activeSelectedAsset.formats.CDR?.fileName || `${activeSelectedAsset.name}.cdr`, "RIFF mock cdr payload", "application/octet-stream")}
                  />
                  <DownloadTab 
                    format="PPT"
                    label="Download PPT" 
                    description="PowerPoint Presentation"
                    available={!!activeSelectedAsset.formats.PPT}
                    onClick={() => triggerDownload(activeSelectedAsset.formats.PPT?.fileName || `${activeSelectedAsset.name}.pptx`, "PPTX mock payload", "application/vnd.openxmlformats-officedocument.presentationml.presentation")}
                  />

                  {/* Download All Zip button - Unique Styling: Light Yellow Background, Folder Icon, Dark Amber Text */}
                  <button
                    onClick={() => {
                      incrementDownload()
                      const mockZipContent = `ZIP file archive\nAsset: ${activeSelectedAsset.name}\nFormats included: ${Object.keys(activeSelectedAsset.formats).filter(f => activeSelectedAsset.formats[f as any]).join(", ")}\nDownloaded: ${new Date().toLocaleString()}`
                      const file = new Blob([mockZipContent], { type: "application/zip" })
                      const url = URL.createObjectURL(file)
                      const element = document.createElement("a")
                      element.href = url
                      element.download = `${activeSelectedAsset.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_all_assets.zip`
                      document.body.appendChild(element)
                      element.click()
                      document.body.removeChild(element)
                      URL.revokeObjectURL(url)
                      toast.success(`Downloaded all formats as ZIP!`)
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-lg text-sm font-semibold transition-all text-left w-full bg-[#FEF3C7] text-[#78350F] hover:bg-[#FDE68A] cursor-pointer shadow-md mt-2.5 border border-[#FDE68A]/60 select-none"
                  >
                    <FolderIcon size={30} />
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="font-semibold text-xs tracking-wide">Download All Zip</span>
                      <span className="text-[10px] font-normal text-[#78350F]/80 truncate">
                        All available formats inside a single ZIP archive
                      </span>
                    </div>
                    <Download className="h-3.5 w-3.5 text-[#78350F] shrink-0 animate-bounce" />
                  </button>
                </div>
              </div>

              {/* Super Admin Actions Panel */}
              {isSuperAdmin && (
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6 mt-2 flex flex-col gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-amber-500">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Super Admin Controls</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Hold Action */}
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        toggleHoldAsset(activeSelectedAsset.id)
                        if (activeSelectedAsset.status !== "hold") {
                          toast.warning("Asset status updated to: hold")
                        } else {
                          toast.info("Asset status updated to: active")
                        }
                      }}
                    >
                      {activeSelectedAsset.status === "hold" ? "Release Hold" : "Hold"}
                    </Button>
                    
                    {/* Delete Action */}
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        deleteAsset(activeSelectedAsset.id)
                        setSelectedAsset(null)
                        toast.error("Asset deleted successfully.")
                      }}
                    >
                      Delete
                    </Button>
                  </div>

                  {/* Add Variant / Replace actions */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-neutral-500">Add Variant or Replace File:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {(["PNG", "JPG", "SVG", "PDF", "CDR"] as FileType[]).map((type) => (
                        <Button 
                          key={type}
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs font-medium" 
                          onClick={() => {
                            const input = document.createElement("input")
                            input.type = "file"
                            input.accept = type === 'PNG' ? '.png' : type === 'JPG' ? '.jpg,.jpeg' : type === 'SVG' ? '.svg' : type === 'PDF' ? '.pdf' : '.cdr'
                            input.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) {
                                await replaceAssetFormat(activeSelectedAsset.id, type, file)
                                toast.success(`${type} variant updated successfully.`)
                              }
                            }
                            input.click()
                          }}
                        >
                          {activeSelectedAsset.formats[type] ? `Replace ${type}` : `Add ${type}`}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
