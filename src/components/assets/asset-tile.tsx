"use client"

import * as React from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Download, MoreHorizontal, RefreshCw, CheckCheck } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useAssets } from "@/lib/assets/assets-context"
import { useAuth } from "@/lib/auth/auth-context"
import { InteractiveImageCanvas } from "./interactive-image-canvas"
import { downloadFileLossless } from "@/lib/zip-utils"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export interface PhotoItem {
  id: string
  name: string
  url: string
  thumbnailUrl?: string
  size: number
  type: string
  uploadedAt: string
}

export interface Asset {
  id: string
  name: string
  category: string
  status: "active" | "hold" | "hidden" | "draft"
  createdAt: string
  updatedAt: string
  createdBy: string
  version?: string
  formats: {
    PNG?:  { fileName: string; fileData: string };
    JPG?:  { fileName: string; fileData: string };
    SVG?:  { fileName: string; fileData: string };
    PDF?:  { fileName: string; fileData: string };
    WORD?: { fileName: string; fileData: string };
    CDR?:  { fileName: string; fileData: string };
    PPT?:  { fileName: string; fileData: string };
  }
  thumbnail?: string
  categoryNumber?: string
  titleNumber?: string
  titleName?: string
  companyName?: string
  siteLocation?: string
  designation?: string
  setId?: string
  subCategory?: "Events" | "Site" | "Employee" | string
  date?: string
  photos?: PhotoItem[]
  variants?: {
    name: string
    thumbnail?: string
    formats: {
      JPG?: { fileName: string; fileData: string }
      PDF?: { fileName: string; fileData: string }
      CDR?: { fileName: string; fileData: string }
    }
  }[]
}

interface AssetTileProps {
  asset: Asset
  onSelect: () => void
}

const MIME_MAP = {
  JPG:  "image/jpeg",
  PNG:  "image/png",
  SVG:  "image/svg+xml",
  PDF:  "application/pdf",
  WORD: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  CDR:  "application/octet-stream",
  PPT:  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}

const FORMAT_DESCRIPTIONS = {
  JPG:  "Image File",
  PNG:  "Portable Network Graphic - Transparent",
  SVG:  "Scalable Vector Graphics",
  PDF:  "Portable Document Format",
  WORD: "Microsoft Word Document",
  CDR:  "CorelDraw File",
  PPT:  "PowerPoint Presentation",
}


// Brand colors for simple formats
const FORMAT_SIMPLE_ICONS: Record<string, { bg: string; text: string; label: string }> = {
  JPG:  { bg: "#F59E0B", text: "#fff", label: "JPG" },
  PNG:  { bg: "#3B82F6", text: "#fff", label: "PNG" },
  SVG:  { bg: "#8B5CF6", text: "#fff", label: "SVG" },
}

// Official SVG icons for PDF, WORD, CDR, PPT (all standardized to 30x30px with rounded corners)
export function PdfIcon({ size = 30 }: { size?: number }) {
  return (
    <div 
      className="shrink-0 flex items-center justify-center overflow-hidden" 
      style={{ width: `${size}px`, height: `${size}px`, borderRadius: "6px", backgroundColor: "#EF4444" }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
        <g transform="translate(-3.6, -2.4) scale(1.2)">
          <path d="M0 0h24v24H0z" fill="none" />
          <path fill="#ffffff" d="M13 9h5.5L13 3.5zM6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m4.93 10.44c.41.9.93 1.64 1.53 2.15l.41.32c-.87.16-2.07.44-3.34.93l-.11.04l.5-1.04c.45-.87.78-1.66 1.01-2.4m6.48 3.81c.18-.18.27-.41.28-.66c.03-.2-.02-.39-.12-.55c-.29-.47-1.04-.69-2.28-.69l-1.29.07l-.87-.58c-.63-.52-1.2-1.43-1.6-2.56l.04-.14c.33-1.33.64-2.94-.02-3.6a.85.85 0 0 0-.61-.24h-.24c-.37 0-.7.39-.79.77c-.37 1.33-.15 2.06.22 3.27v.01c-.25.88-.57 1.9-1.08 2.93l-.96 1.8l-.89.49c-1.2.75-1.77 1.59-1.88 2.12c-.04.19-.02.36.05.54l.03.05l.48.31l.44.11c.81 0 1.73-.95 2.97-3.07l.18-.07c1.03-.33 2.31-.56 4.03-.75c1.03.51 2.24.74 3 .74c.44 0 .74-.11.91-.3m-.41-.71l.09.11c-.01.1-.04.11-.09.13h-.04l-.19.02c-.46 0-1.17-.19-1.9-.51c.09-.1.13-.1.23-.1c1.4 0 1.8.25 1.9.35M7.83 17c-.65 1.19-1.24 1.85-1.69 2c.05-.38.5-1.04 1.21-1.69zm3.02-6.91c-.23-.9-.24-1.63-.07-2.05l.07-.12l.15.05c.17.24.19.56.09 1.1l-.03.16l-.16.82z" />
        </g>
      </svg>
    </div>
  )
}

export function WordIcon({ size = 30 }: { size?: number }) {
  return (
    <div 
      className="shrink-0 flex items-center justify-center overflow-hidden" 
      style={{ width: `${size}px`, height: `${size}px`, borderRadius: "6px", backgroundColor: "#2B5797" }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48">
        <g transform="translate(-4.8, -4.8) scale(1.2)">
          <path fill="#2d92d4" d="M42.256,6H15.744C14.781,6,14,6.781,14,7.744v7.259h30V7.744C44,6.781,43.219,6,42.256,6z"/>
          <path fill="#2150a9" d="M14,33.054v7.202C14,41.219,14.781,42,15.743,42h26.513C43.219,42,44,41.219,44,40.256v-7.202H14z"/>
          <path fill="#2d83d4" d="M14 15.003H44V24.005000000000003H14z"/>
          <path fill="#2e70c9" d="M14 24.005H44V33.055H14z"/>
          <path fill="#00488d" d="M22.319,34H5.681C4.753,34,4,33.247,4,32.319V15.681C4,14.753,4.753,14,5.681,14h16.638C23.247,14,24,14.753,24,15.681v16.638C24,33.247,23.247,34,22.319,34z"/>
          <path fill="#fff" d="M18.403 19L16.857 26.264 15.144 19 12.957 19 11.19 26.489 9.597 19 7.641 19 9.985 29 12.337 29 14.05 21.311 15.764 29 18.015 29 20.359 19z"/>
        </g>
      </svg>
    </div>
  )
}

export function PptIcon({ size = 30 }: { size?: number }) {
  return (
    <div 
      className="shrink-0 flex items-center justify-center overflow-hidden" 
      style={{ width: `${size}px`, height: `${size}px`, borderRadius: "6px", backgroundColor: "#D24726" }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48">
        <g transform="translate(-4.8, -4.8) scale(1.2)">
          <path fill="#f37c56" d="M42.256,6H15.744C14.781,6,14,6.781,14,7.744v7.259h30V7.744C44,6.781,43.219,6,42.256,6z"/>
          <path fill="#cf3f21" d="M14,33.054v7.202C14,41.219,14.781,42,15.743,42h26.513C43.219,42,44,41.219,44,40.256v-7.202H14z"/>
          <path fill="#e65a36" d="M14 15.003H44V24.005000000000003H14z"/>
          <path fill="#df4827" d="M14 24.005H44V33.055H14z"/>
          <path fill="#b23218" d="M22.319,34H5.681C4.753,34,4,33.247,4,32.319V15.681C4,14.753,4.753,14,5.681,14h16.638C23.247,14,24,14.753,24,15.681v16.638C24,33.247,23.247,34,22.319,34z"/>
          <path fill="#fff" d="M10 19h5.5c2.5 0 4 1.3 4 3.5s-1.5 3.5-4 3.5H12.5V29H10V19zm2.5 5h2.8c1.2 0 1.8-.6 1.8-1.5s-.6-1.5-1.8-1.5h-2.8V24z"/>
        </g>
      </svg>
    </div>
  )
}

export function CdrIcon({ size = 30 }: { size?: number }) {
  return (
    <div 
      className="shrink-0 flex items-center justify-center overflow-hidden" 
      style={{ width: `${size}px`, height: `${size}px`, borderRadius: "6px", backgroundColor: "#00A650" }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={size - 2} height={size - 2} viewBox="0 0 24 24">
        <path fill="#ffffff" d="M10.651 0C10.265.019 9.4.272 8.584.657c-.816.39-3.696 2.161-3.752 6.536.072 4.145 3.847 11.191 6.397 13.455 0 0-4.141-6.952-4.439-13.013C6.488 1.575 10.651 0 10.651 0Zm2.679 0s4.159 1.575 3.861 7.635c-.299 6.061-4.439 13.013-4.439 13.013 2.547-2.264 6.324-9.31 6.396-13.455-.057-4.375-2.936-6.146-3.752-6.536C14.58.272 13.715.019 13.33 0Zm-1.38.019a1.088 1.088 0 0 0-.555.144C9.864.99 8.909 3.982 9.177 8.66c.185 3.242 1.009 7.291 2.422 11.988h.7c1.413-4.697 2.24-8.742 2.425-11.984.268-4.677-.688-7.674-2.219-8.501a1.088 1.088 0 0 0-.555-.144ZM7.017 1.066S2.543 2.909 3.431 8.225c.884 5.32 5.588 10.995 6.986 12.2.503.457-5.777-6.548-6.386-12.699-.291-2.323.39-4.9 2.986-6.66Zm9.966 0c2.595 1.76 3.276 4.337 2.985 6.66-.608 6.151-6.888 13.156-6.386 12.699 1.398-1.205 6.103-6.88 6.987-12.2.888-5.316-3.586-7.159-3.586-7.159Zm-6.815 20.78L10.647 24h2.599l.488-2.154h-3.566Z" />
      </svg>
    </div>
  )
}

export function FolderIcon({ size = 30 }: { size?: number }) {
  return (
    <div 
      className="shrink-0 flex items-center justify-center overflow-hidden" 
      style={{ width: `${size}px`, height: `${size}px`, borderRadius: "6px", backgroundColor: "#D97706" }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={size - 12} height={size - 12} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" fill="#ffffff" />
      </svg>
    </div>
  )
}

export function FormatBadge({ format }: { format: string }) {
  if (format === "PDF")  return <PdfIcon size={30} />
  if (format === "WORD") return <WordIcon size={30} />
  if (format === "PPT")  return <PptIcon size={30} />
  if (format === "CDR")  return <CdrIcon size={30} />
  const icon = FORMAT_SIMPLE_ICONS[format]
  if (!icon) return null
  return (
    <div style={{
      backgroundColor: icon.bg, color: icon.text,
      width: "30px", height: "30px", borderRadius: "6px", fontSize: "8.5px",
      fontWeight: 800, letterSpacing: "0.02em", display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0,
      fontFamily: "monospace",
    }}>
      {icon.label}
    </div>
  )
}


export function ApprovedStatusBadge({ 
  className, 
  zIndex = "z-10", 
  isRelative = false 
}: { 
  className?: string; 
  zIndex?: string; 
  isRelative?: boolean 
}) {
  return (
    <div 
      className={cn(
        "group/approved inline-flex items-center",
        isRelative ? "relative" : `absolute left-2.5 top-2.5 ${zIndex}`,
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Interactive Double Check Circle Icon */}
      <div 
        className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-600 shadow-xs backdrop-blur-xs transition-all duration-300 group-hover/approved:scale-115 group-hover/approved:border-emerald-500 group-hover/approved:bg-emerald-500/20 group-hover/approved:shadow-[0_0_12px_rgba(16,185,129,0.5)] cursor-default select-none dark:border-emerald-400/50 dark:text-emerald-400 dark:bg-emerald-400/10"
        style={{ filter: "drop-shadow(0 0 3px rgba(34, 197, 94, 0.4))" }}
      >
        <CheckCheck className="h-3 w-3 stroke-[2.5] transition-transform duration-300 group-hover/approved:rotate-[-6deg]" />
      </div>

      {/* Animated Floating Green Note */}
      <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2.5 z-40 whitespace-nowrap opacity-0 -translate-x-3 scale-90 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/approved:opacity-100 group-hover/approved:translate-x-0 group-hover/approved:scale-100">
        <div className="relative flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 px-3 py-1 text-[11px] font-bold text-white shadow-[0_4px_16px_rgba(16,185,129,0.45)] border border-emerald-300/40 backdrop-blur-md">
          {/* Animated Pulsing Beacon Dot */}
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-80" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white shadow-xs" />
          </span>
          <span className="tracking-tight drop-shadow-xs font-semibold">This Asset is Approved</span>

          {/* Pointing arrow pointing towards the double-check circle */}
          <span className="absolute -left-1 top-1/2 -translate-y-1/2 h-2 w-2 rotate-45 bg-emerald-600 border-l border-b border-emerald-300/40" />
        </div>
      </div>
    </div>
  )
}

export function AssetTile({ asset, onSelect }: AssetTileProps) {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [zoomLevel, setZoomLevel] = React.useState<number>(100)
  const { replaceAssetFormat, toggleHoldAsset, deleteAsset } = useAssets()
  const { user } = useAuth()
  
  const imageFormat = asset.formats.PNG || asset.formats.JPG || asset.formats.SVG
  const previewSrc = (asset.thumbnail && asset.thumbnail.trim().length > 0 && asset.thumbnail !== "mock-image-data")
    ? asset.thumbnail 
    : (asset.formats.PNG?.fileData && (asset.formats.PNG.fileData.startsWith("data:") || asset.formats.PNG.fileData.startsWith("http") || asset.formats.PNG.fileData.startsWith("/")))
      ? asset.formats.PNG.fileData
      : (asset.formats.JPG?.fileData && (asset.formats.JPG.fileData.startsWith("data:") || asset.formats.JPG.fileData.startsWith("http") || asset.formats.JPG.fileData.startsWith("/")))
        ? asset.formats.JPG.fileData
        : (asset.formats.SVG?.fileData && (asset.formats.SVG.fileData.startsWith("data:") || asset.formats.SVG.fileData.startsWith("http") || asset.formats.SVG.fileData.startsWith("<svg") || asset.formats.SVG.fileData.startsWith("/")))
          ? asset.formats.SVG.fileData
          : (imageFormat?.fileData && (imageFormat.fileData.startsWith("data:") || imageFormat.fileData.startsWith("http") || imageFormat.fileData.startsWith("/")))
            ? imageFormat.fileData
            : null

  const hasImage = !!previewSrc || (!!imageFormat?.fileData && imageFormat.fileData !== "mock-data" && imageFormat.fileData.length > 0)
  const isSuperAdmin = user?.role === "Super Admin"

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (previewSrc || (hasImage && imageFormat)) {
      setIsPreviewOpen(true)
    } else if (asset.formats.PPT || asset.category === "presentation" || asset.category?.toLowerCase().includes("presentation")) {
      if (asset.formats.PPT) {
        triggerFormatDownload("PPT")
        toast.success("Downloading PowerPoint presentation...")
      } else {
        toast.info("PowerPoint presentation asset.")
      }
    } else {
      toast.error("Preview image (PNG/JPG) not available for this asset.")
    }
  }

  const triggerFormatDownload = async (format: keyof typeof MIME_MAP) => {
    const formatData = asset.formats[format]
    if (!formatData?.fileData) return

    try {
      await downloadFileLossless(formatData.fileData, formatData.fileName)
      toast.success(`Downloaded ${formatData.fileName}`)
    } catch (err) {
      console.error("Download error:", err)
      toast.error(`Failed to download ${formatData.fileName}`)
    }
  }

  const handleDownloadZipClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const availableFormats = Object.keys(asset.formats).filter(f => asset.formats[f as any])
    if (availableFormats.length === 0) {
      toast.error("No download formats available.")
      return
    }

    const mockZipContent = `ZIP file archive\nAsset: ${asset.name}\nFormats included: ${availableFormats.join(", ")}\nDownloaded: ${new Date().toLocaleString()}`
    const file = new Blob([mockZipContent], { type: "application/zip" })
    const url = URL.createObjectURL(file)
    const element = document.createElement("a")
    element.href = url
    element.download = `${asset.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_all_assets.zip`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    URL.revokeObjectURL(url)
    toast.success(`Downloaded all formats for ${asset.name} as ZIP!`)
  }

  if (asset.category === "letterhead") {
    return (
      <>
        <div className="flex flex-col bg-card text-card-foreground rounded-xl border border-border/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group w-full relative">
          {/* Title & Admin Header */}
          <div className="p-3 px-4 border-b border-border/60 flex items-center justify-between gap-2">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Official Letterhead</span>
              <h3 className="font-semibold text-foreground text-sm truncate max-w-[160px]">{asset.name}</h3>
            </div>
            
            {/* Options Settings Popout Menu (Only available for Super Admins) */}
            {isSuperAdmin && (
              <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <button 
                      className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                      title="Asset Controls"
                    >
                      <MoreHorizontal className="h-4 w-4 shrink-0" />
                    </button>
                  } />
                  <DropdownMenuContent align="end" className="w-72 bg-card border border-border/80 p-2 rounded-xl shadow-2xl space-y-1.5">
                    {/* Replace sub-menu */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 focus:bg-accent/10 focus:scale-[1.02] text-foreground select-none hover:bg-muted w-full"
                      >
                        <div className="flex flex-col gap-0.5 text-left">
                          <span className="font-semibold text-xs tracking-wide">Replace Asset</span>
                          <span className="text-[10px] text-muted-foreground">Replace specific file formats</span>
                        </div>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="bg-card border border-border/80 p-2 rounded-xl shadow-2xl space-y-1 w-64">
                        {(["PNG", "JPG", "SVG", "PDF", "WORD", "CDR", "PPT"] as const).map((type) => (
                          <DropdownMenuItem
                            key={type}
                            onClick={(e) => {
                              e.stopPropagation()
                              const input = document.createElement("input")
                              input.type = "file"
                              input.accept = type === 'PNG' ? '.png' : type === 'JPG' ? '.jpg,.jpeg' : type === 'SVG' ? '.svg' : type === 'PDF' ? '.pdf' : type === 'WORD' ? '.doc,.docx' : type === 'PPT' ? '.ppt,.pptx' : '.cdr'
                              input.onchange = async (el) => {
                                const file = (el.target as HTMLInputElement).files?.[0]
                                if (file) {
                                  await replaceAssetFormat(asset.id, type, file)
                                  toast.success(`${type} variant replaced successfully.`)
                                }
                              }
                              input.click()
                            }}
                            className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted focus:bg-accent/10 focus:scale-[1.02] transition-all duration-200 select-none text-foreground w-full"
                          >
                            <FormatBadge format={type} />
                            <div className="flex flex-col gap-0.5 text-left flex-1 min-w-0">
                              <span className="font-semibold text-xs tracking-wide">Replace {type}</span>
                              <span className="text-[10px] text-muted-foreground truncate">Upload new {type} format</span>
                            </div>
                            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    
                    {/* Hold toggle */}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleHoldAsset(asset.id)
                        if (asset.status !== "hold") {
                          toast.warning("Asset status updated to: hold")
                        } else {
                          toast.info("Asset status updated to: active")
                        }
                      }}
                      className="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 focus:bg-accent/10 focus:scale-[1.02] text-foreground hover:bg-muted select-none"
                    >
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="font-semibold text-xs tracking-wide">
                          {asset.status === "hold" ? "Release Hold" : "Hold"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {asset.status === "hold" ? "Activate downloads for users" : "Temporarily disable downloads"}
                        </span>
                      </div>
                      <svg className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {asset.status === "hold" ? (
                          <>
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                            <polyline points="21 3 21 8 16 8" />
                          </>
                        ) : (
                          <>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </>
                        )}
                      </svg>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-border/60 my-1" />
                    
                    {/* Delete toggle */}
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteAsset(asset.id)
                        toast.error("Asset deleted successfully.")
                      }}
                      className="flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200 focus:bg-destructive/10 focus:scale-[1.02] text-destructive focus:text-destructive select-none"
                    >
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="font-bold text-xs tracking-wide">Delete Asset</span>
                        <span className="text-[10px] text-destructive/80 font-normal">Permanently remove this asset</span>
                      </div>
                      <svg className="h-3.5 w-3.5 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Side-by-side Header & Footer Preview Block */}
          <div 
            onClick={handleImageClick}
            className="grid grid-cols-2 h-36 border-b border-border/60 relative cursor-pointer"
          >
            {/* Approved Double Check Icon in Circle with Animated Green Hover Note */}
            <ApprovedStatusBadge zIndex="z-20" />

            {asset.status === "hold" && (
              <div className="absolute right-2 top-2 z-20">
                <Badge className="bg-amber-500 text-white border-amber-500 hover:bg-amber-600 shadow-xs">
                  Hold
                </Badge>
              </div>
            )}
            {/* Left Side: Header graphic preview */}
            <div className="border-r border-border/50 flex flex-col items-center justify-center p-3 relative overflow-hidden bg-[#e7e8ea] group-hover:bg-[#dfe0e2] transition-colors">
              <span className="absolute top-1 left-2 text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 select-none">Header</span>
              {hasImage && imageFormat ? (
                <img 
                  src={imageFormat.fileData} 
                  alt="Header Preview" 
                  className="w-full h-full object-cover object-top rounded shadow-sm border border-border/40 transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="text-[10px] text-muted-foreground/60 font-semibold select-none">No Header Preview</span>
              )}
            </div>

            {/* Right Side: Footer graphic preview */}
            <div className="flex flex-col items-center justify-center p-3 relative overflow-hidden bg-[#e7e8ea] group-hover:bg-[#dfe0e2] transition-colors">
              <span className="absolute top-1 left-2 text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 select-none">Footer</span>
              {hasImage && imageFormat ? (
                <img 
                  src={imageFormat.fileData} 
                  alt="Footer Preview" 
                  className="w-full h-full object-cover object-bottom rounded shadow-sm border border-border/40 transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="text-[10px] text-muted-foreground/60 font-semibold select-none">No Footer Preview</span>
              )}
            </div>
          </div>

          {/* Word File Banner/Button (Height 60px) */}
          <button
            disabled={!asset.formats.WORD}
            onClick={(e) => {
              e.stopPropagation()
              triggerFormatDownload("WORD")
            }}
            className={cn(
              "h-[60px] flex items-center justify-between p-3 px-4 transition-all w-full select-none border-t border-border/30",
              asset.formats.WORD 
                ? "bg-[#FEF3C7] text-[#78350F] hover:bg-[#FDE68A] cursor-pointer" 
                : "bg-muted/15 text-muted-foreground/40 cursor-not-allowed opacity-50"
            )}
          >
            <div className="flex items-center gap-3">
              <WordIcon size={30} />
              <div className="flex flex-col text-left">
                <span className="font-bold text-xs tracking-wide">Word File template</span>
                <span className="text-[10px] text-[#78350F]/70 font-normal">Click to download docx</span>
              </div>
            </div>
            <Download className="h-4 w-4 shrink-0 text-[#78350F] animate-pulse" />
          </button>
        </div>

        {/* Popout Lightbox Modal for Image Preview */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent 
            className="w-[98vw] max-w-[1550px] 2xl:max-w-[1750px] h-[88vh] p-0 overflow-hidden bg-black/25 border-0 ring-0 shadow-none rounded-2xl flex flex-col items-center justify-center outline-none text-white animate-in zoom-in-95 duration-200"
            overlayClassName="bg-black/15 backdrop-blur-[8px]"
            showCloseButton={true}
          >
            <DialogTitle className="sr-only">
              {asset.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Image preview lightbox popup.
            </DialogDescription>
            
            {hasImage && imageFormat && (
              <div className="w-full h-full relative flex items-center justify-center">
                <InteractiveImageCanvas 
                  src={imageFormat.fileData} 
                  alt={asset.name} 
                  title={asset.name}
                  subTitle="Transvolt Official Asset"
                />

                {/* Floating Quick Download Buttons */}
                <div className="absolute bottom-4 right-5 z-30 flex items-center gap-2">
                  {(["JPG", "PNG", "SVG", "PDF", "WORD", "CDR"] as const).map((format) => {
                    const formatData = asset.formats[format]
                    if (!formatData) return null
                    return (
                      <button
                        key={format}
                        onClick={() => triggerFormatDownload(format)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-black/40 hover:bg-black/60 border border-white/20 text-white backdrop-blur-sm transition-all cursor-pointer shadow-md"
                        title={`Download ${format}`}
                      >
                        <Download className="h-3 w-3" />
                        <span>{format}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <>
      <div 
        className="flex flex-col bg-card text-card-foreground rounded-xl border border-border/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group"
      >
        {/* Theme-adaptive image/preview area - clicking opens lightbox preview */}
        <div 
          onClick={handleImageClick}
          className="w-full h-36 flex items-center justify-center p-4 relative overflow-hidden transition-colors cursor-pointer" style={{ backgroundColor: "#e7e8ea" }}
        >
          {/* Approved Double Check Icon in Circle with Animated Green Hover Note */}
          <ApprovedStatusBadge zIndex="z-10" />

          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={previewSrc} 
              alt={asset.name} 
              className="max-h-full max-w-full object-scale-down transition-transform duration-300 ease-in-out group-hover:scale-105" 
            />
          ) : (asset.category === "presentation" || asset.category?.toLowerCase().includes("presentation") || !!asset.formats.PPT) ? (
            <div className="flex flex-col items-center justify-center gap-2 group-hover:scale-110 transition-transform duration-300 select-none">
              <PptIcon size={64} />
              <span className="text-[11px] font-extrabold text-[#D24726] tracking-wider uppercase drop-shadow-xs">PowerPoint PPT</span>
            </div>
          ) : asset.formats.WORD ? (
            <div className="flex flex-col items-center justify-center gap-2 group-hover:scale-110 transition-transform duration-300 select-none">
              <WordIcon size={64} />
              <span className="text-[11px] font-extrabold text-[#2B5797] tracking-wider uppercase drop-shadow-xs">Word Document</span>
            </div>
          ) : asset.formats.PDF ? (
            <div className="flex flex-col items-center justify-center gap-2 group-hover:scale-110 transition-transform duration-300 select-none">
              <PdfIcon size={64} />
              <span className="text-[11px] font-extrabold text-[#EF4444] tracking-wider uppercase drop-shadow-xs">PDF Document</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground/60 font-medium">No Preview</div>
          )}
          
          {/* Status Badge */}
          {asset.status === "hold" && (
            <div className="absolute right-2 top-2 z-10">
              <Badge className="bg-amber-500 text-white border-amber-500 hover:bg-amber-600 shadow-xs">
                Hold
              </Badge>
            </div>
          )}
        </div>
        
        {/* Label section — bottom area is not clickable; only icons trigger actions */}
        <div className="p-4 border-t border-border flex items-center justify-between gap-2 cursor-default">
          <h3 className="font-semibold text-foreground text-sm truncate text-left flex-1">
            {asset.name}
          </h3>
          
          {/* Action buttons group with Popout lists */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Download Popout Menu */}
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <button 
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                    title="Download File"
                  >
                    <Download className="h-4 w-4 shrink-0" />
                  </button>
                } />
                <DropdownMenuContent align="end" className="w-72 bg-card border border-border/80 p-2 rounded-xl shadow-2xl space-y-1.5">
                  {/* Format Options */}
                  {(["JPG", "PNG", "SVG", "PDF", "WORD", "CDR", "PPT"] as const).map((format) => {
                    const isAvailable = !!asset.formats[format]
                    const description = FORMAT_DESCRIPTIONS[format]
                    
                    return (
                      <DropdownMenuItem
                        key={format}
                        disabled={!isAvailable}
                        onClick={(e) => {
                          e.stopPropagation()
                          triggerFormatDownload(format)
                        }}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 focus:bg-accent/10 focus:scale-[1.02] select-none gap-2",
                          isAvailable
                            ? "text-foreground focus:text-primary hover:bg-muted"
                            : "opacity-40 cursor-not-allowed text-muted-foreground"
                        )}
                      >
                        {/* Format badge icon */}
                        <FormatBadge format={format} />
                        <div className="flex flex-col gap-0.5 text-left flex-1">
                          <span className="font-semibold text-xs tracking-wide">Download {format}</span>
                          <span className="text-[10px] text-muted-foreground">{description}</span>
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

                  <DropdownMenuSeparator className="bg-border/60 my-1" />

                  {/* Download All (Zip) - Unique Styling: Light Yellow Background, Folder Icon, Dark Amber Text */}
                  <DropdownMenuItem
                    onClick={handleDownloadZipClick}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer bg-[#FEF3C7] text-[#78350F] hover:bg-[#FDE68A] focus:bg-[#FDE68A] focus:scale-[1.02] transition-all duration-200 select-none shadow-md border border-[#FDE68A]/60"
                  >
                    <FolderIcon size={30} />
                    <div className="flex flex-col gap-0.5 text-left flex-1">
                      <span className="font-bold text-xs tracking-wide">Download All</span>
                      <span className="text-[10px] text-[#78350F]/80 font-normal">All in Zip folder</span>
                    </div>
                    <Download className="h-3.5 w-3.5 text-[#78350F] animate-bounce shrink-0" />
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border/60 my-1" />

                  {/* Share button */}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      const created = Date.now()
                      localStorage.setItem(`branding_share_${asset.id}_time`, created.toString())
                      const shareUrl = `${window.location.origin}/share/${asset.id}?t=${created}`
                      navigator.clipboard.writeText(shareUrl)
                      toast.success("7-Hour Secure Share link copied to clipboard!")
                    }}
                    className="flex items-center justify-between p-2 rounded-lg cursor-pointer border border-dashed border-[#4472C4]/40 text-[#4472C4] hover:bg-[#4472C4]/10 focus:bg-[#4472C4]/10 focus:scale-[1.02] transition-all duration-200 select-none"
                  >
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="font-bold text-xs tracking-wide">Share Asset</span>
                      <span className="text-[10px] text-[#4472C4]/80 font-normal">Copy unique public link</span>
                    </div>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Options Settings Popout Menu (Only available for Super Admins) */}
            {isSuperAdmin && (
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <button 
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                      title="Asset Controls"
                    >
                      <MoreHorizontal className="h-4 w-4 shrink-0" />
                    </button>
                  } />
                  <DropdownMenuContent align="end" className="w-72 bg-card border border-border/80 p-2 rounded-xl shadow-2xl space-y-1.5">
                    {/* Replace sub-menu */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 focus:bg-accent/10 focus:scale-[1.02] text-foreground select-none hover:bg-muted w-full"
                      >
                        <div className="flex flex-col gap-0.5 text-left">
                          <span className="font-semibold text-xs tracking-wide">Replace Asset</span>
                          <span className="text-[10px] text-muted-foreground">Replace specific file formats</span>
                        </div>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="bg-card border border-border/80 p-2 rounded-xl shadow-2xl space-y-1 w-64">
                        {(["PNG", "JPG", "SVG", "PDF", "WORD", "CDR", "PPT"] as const).map((type) => (
                          <DropdownMenuItem
                            key={type}
                            onClick={(e) => {
                              e.stopPropagation()
                              const input = document.createElement("input")
                              input.type = "file"
                              input.accept = type === 'PNG' ? '.png' : type === 'JPG' ? '.jpg,.jpeg' : type === 'SVG' ? '.svg' : type === 'PDF' ? '.pdf' : type === 'WORD' ? '.doc,.docx' : type === 'PPT' ? '.ppt,.pptx' : '.cdr'
                              input.onchange = async (el) => {
                                const file = (el.target as HTMLInputElement).files?.[0]
                                if (file) {
                                  await replaceAssetFormat(asset.id, type, file)
                                  toast.success(`${type} variant replaced successfully.`)
                                }
                              }
                              input.click()
                            }}
                            className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted focus:bg-accent/10 focus:scale-[1.02] transition-all duration-200 select-none text-foreground w-full"
                          >
                            <FormatBadge format={type} />
                            <div className="flex flex-col gap-0.5 text-left flex-1 min-w-0">
                              <span className="font-semibold text-xs tracking-wide">Replace {type}</span>
                              <span className="text-[10px] text-muted-foreground truncate">Upload new {type} format</span>
                            </div>
                            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    
                    {/* Hold toggle */}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleHoldAsset(asset.id)
                        if (asset.status !== "hold") {
                          toast.warning("Asset status updated to: hold")
                        } else {
                          toast.info("Asset status updated to: active")
                        }
                      }}
                      className="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 focus:bg-accent/10 focus:scale-[1.02] text-foreground hover:bg-muted select-none"
                    >
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="font-semibold text-xs tracking-wide">
                          {asset.status === "hold" ? "Release Hold" : "Hold"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {asset.status === "hold" ? "Activate downloads for users" : "Temporarily disable downloads"}
                        </span>
                      </div>
                      <svg className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {asset.status === "hold" ? (
                          <>
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                            <polyline points="21 3 21 8 16 8" />
                          </>
                        ) : (
                          <>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </>
                        )}
                      </svg>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-border/60 my-1" />
                    
                    {/* Delete toggle */}
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteAsset(asset.id)
                        toast.error("Asset deleted successfully.")
                      }}
                      className="flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200 focus:bg-destructive/10 focus:scale-[1.02] text-destructive focus:text-destructive select-none"
                    >
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="font-bold text-xs tracking-wide">Delete Asset</span>
                        <span className="text-[10px] text-destructive/80 font-normal">Permanently remove this asset</span>
                      </div>
                      <svg className="h-3.5 w-3.5 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popout Lightbox Modal for Image Preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent 
          className="w-[98vw] max-w-[1550px] 2xl:max-w-[1750px] h-[88vh] p-0 overflow-hidden bg-black/25 border-0 ring-0 shadow-none rounded-2xl flex flex-col items-center justify-center outline-none text-white animate-in zoom-in-95 duration-200"
          overlayClassName="bg-black/15 backdrop-blur-[8px]"
          showCloseButton={true}
        >
          <DialogTitle className="sr-only">
            {asset.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Image preview lightbox popup.
          </DialogDescription>
          
          {hasImage && imageFormat && (
            <div className="w-full h-full relative flex items-center justify-center">
              <InteractiveImageCanvas 
                src={imageFormat.fileData} 
                alt={asset.name} 
                title={asset.name}
                subTitle="Transvolt Official Asset"
              />

              {/* Floating Quick Download Buttons */}
              <div className="absolute bottom-4 right-5 z-30 flex items-center gap-2">
                {(["JPG", "PNG", "SVG", "PDF", "WORD", "CDR"] as const).map((format) => {
                  const formatData = asset.formats[format]
                  if (!formatData) return null
                  return (
                    <button
                      key={format}
                      onClick={() => triggerFormatDownload(format)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-black/40 hover:bg-black/60 border border-white/20 text-white backdrop-blur-sm transition-all cursor-pointer shadow-md"
                      title={`Download ${format}`}
                    >
                      <Download className="h-3 w-3" />
                      <span>{format}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
