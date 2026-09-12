"use client"

import * as React from "react"
import {
  Download,
  MoreVertical,
  BookOpen,
  Eye,
  Printer,
  FileDown,
  Copy,
  UploadCloud,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  getStoredBrandBookMetadata,
  saveCustomBrandBookToDB,
  downloadTransvoltBrandBook,
  brandBookPreviewPages,
  BrandBookMetadata,
} from "@/lib/brand-book/brand-book-service"
import { cn } from "@/lib/utils"

export function BrandBookTile({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const [meta, setMeta] = React.useState<BrandBookMetadata>(() => getStoredBrandBookMetadata())
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [activePageIndex, setActivePageIndex] = React.useState(0)
  const [isDownloading, setIsDownloading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  // Sync stored metadata on mount
  React.useEffect(() => {
    setMeta(getStoredBrandBookMetadata())
  }, [])

  const handleDownload = async (variant: "standard" | "print" | "web" = "standard") => {
    try {
      setIsDownloading(true)
      const label =
        variant === "print"
          ? "Print Ready (300 DPI)"
          : variant === "web"
          ? "Web / Digital"
          : "Official Brand Book"
      toast.info(`Preparing Transvolt Brand Book [${label}]...`)
      await downloadTransvoltBrandBook(variant)
      toast.success(`Downloaded Transvolt Brand Book (${variant === "print" ? "Print" : "PDF"}) successfully!`)
    } catch (err) {
      console.error("Failed to download brand book:", err)
      toast.error("Failed to download brand book. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCopyLink = () => {
    if (typeof window === "undefined") return
    const url = `${window.location.origin}/Transvolt_Brand_Book_2026.pdf`
    navigator.clipboard.writeText(url)
    toast.success("Copied Transvolt Brand Book link to clipboard!")
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      toast.error("Please select a valid PDF document.")
      return
    }

    try {
      toast.info(`Uploading "${file.name}" as official Brand Book...`)
      const updatedDate = await saveCustomBrandBookToDB(file)
      setMeta(getStoredBrandBookMetadata())
      toast.success(`Updated Transvolt Brand Book to "${file.name}"! Last updated: ${updatedDate}`)
    } catch (err) {
      console.error("Error uploading custom brand book:", err)
      toast.error("Failed to save custom brand book.")
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const activePage = brandBookPreviewPages[activePageIndex]

  return (
    <>
      {/* Hidden file input for uploading/replacing brand book */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Brand Book Tile in Menu Panel */}
      <div className={cn("border-t border-sidebar-border/40 mt-auto bg-sidebar/40 relative overflow-hidden transition-all duration-300 ease-out", isCollapsed ? "p-2" : "p-3")}>
        {/* Collapsed Mode Icon Button */}
        <div
          className={cn(
            "flex items-center justify-center transition-all duration-250 ease-out",
            isCollapsed
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-75 pointer-events-none absolute inset-x-2 top-2"
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button
                type="button"
                className="h-10 w-10 rounded-xl bg-[#4472C4]/15 hover:bg-[#4472C4]/25 text-[#4472C4] border border-[#4472C4]/30 flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-2xs relative"
                title="Download Transvolt Brand Book"
                aria-label="Transvolt Brand Book"
              >
                <BookOpen className="h-4 w-4" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#4472C4] text-[8px] text-white font-bold">
                  <Download className="h-2 w-2" />
                </span>
              </button>
            } />
            <DropdownMenuContent
              align="start"
              side="right"
              sideOffset={12}
              className="w-56 bg-popover border border-border p-1.5 rounded-xl shadow-xl space-y-0.5 z-50 text-xs"
            >
              <div className="px-2 py-1.5 border-b border-border/50">
                <p className="font-bold text-foreground">Transvolt Brand Book</p>
                <p className="text-[10px] text-muted-foreground">Updated: {meta.lastUpdated}</p>
              </div>
              <DropdownMenuItem
                onClick={() => handleDownload("standard")}
                className="cursor-pointer py-1.5 px-2 rounded-md hover:bg-accent flex items-center gap-2 font-medium text-primary"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF ({meta.fileSize})</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsPreviewOpen(true)}
                className="cursor-pointer py-1.5 px-2 rounded-md hover:bg-accent flex items-center gap-2"
              >
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Preview Brand Book</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Expanded Mode Card */}
        <div
          className={cn(
            "transition-all duration-300 ease-out",
            isCollapsed
              ? "opacity-0 scale-95 pointer-events-none max-h-0 overflow-hidden"
              : "opacity-100 scale-100 pointer-events-auto max-h-[240px]"
          )}
        >
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/35 dark:bg-sidebar-accent/20 p-3 space-y-2.5 shadow-2xs backdrop-blur-xs transition-all hover:border-[#4472C4]/40">
            {/* Header with Title in bold and Last Updated Date */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-[#4472C4]/15 text-[#4472C4] shrink-0">
                  <BookOpen className="h-3.5 w-3.5" />
                </div>
                <h4 className="text-xs font-bold text-sidebar-foreground tracking-tight leading-snug">
                  Download Transvolt Brand Book
                </h4>
              </div>

              {/* Last updated date above the Download Button */}
              <p className="text-[11px] text-muted-foreground font-medium pl-0.5">
                Last updated: {meta.lastUpdated}
              </p>
            </div>

            {/* Button Row: Download Button + small options button nearby it */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <Button
                onClick={() => handleDownload("standard")}
                disabled={isDownloading}
                className="flex-1 h-8 px-3 text-xs font-semibold bg-[#4472C4] hover:bg-[#365ca0] text-white rounded-lg shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <button
                    type="button"
                    className="h-8 w-8 shrink-0 rounded-lg border border-sidebar-border/80 bg-background/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground flex items-center justify-center transition-colors cursor-pointer"
                    title="More Brand Book Options"
                    aria-label="Brand Book Options"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                } />

                <DropdownMenuContent
                  align="end"
                  side="top"
                  sideOffset={6}
                  className="w-56 bg-popover border border-border p-1.5 rounded-xl shadow-xl space-y-0.5 z-50 text-xs"
                >
                  <DropdownMenuItem
                    onClick={() => setIsPreviewOpen(true)}
                    className="cursor-pointer py-1.5 px-2 rounded-md hover:bg-accent flex items-center gap-2"
                  >
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Preview Brand Book</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleDownload("print")}
                    className="cursor-pointer py-1.5 px-2 rounded-md hover:bg-accent flex items-center gap-2"
                  >
                    <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Download Print PDF (300 DPI)</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleDownload("web")}
                    className="cursor-pointer py-1.5 px-2 rounded-md hover:bg-accent flex items-center gap-2"
                  >
                    <FileDown className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Download Web / Digital PDF</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem
                    onClick={handleCopyLink}
                    className="cursor-pointer py-1.5 px-2 rounded-md hover:bg-accent flex items-center gap-2"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Copy Direct Link</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer py-1.5 px-2 rounded-md hover:bg-accent flex items-center gap-2 text-primary"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Upload / Replace PDF...</span>
                  </DropdownMenuItem>

                  <div className="pt-1 mt-1 border-t border-border/50 px-2 py-1 text-[10px] text-muted-foreground flex items-center justify-between">
                    <span>{meta.version}</span>
                    <span className="font-mono">{meta.fileSize}</span>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Brand Book Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-border/80 shadow-2xl rounded-2xl">
          <DialogHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/30">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#4472C4]/15 text-[#4472C4] uppercase tracking-wider">
                    {activePage.badge}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    Page {activePage.pageNum} of {brandBookPreviewPages.length}
                  </span>
                </div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  Transvolt Brand Book • {activePage.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {activePage.summary}
                </DialogDescription>
              </div>

              <Button
                size="sm"
                onClick={() => handleDownload("standard")}
                className="bg-[#4472C4] hover:bg-[#365ca0] text-white text-xs gap-1.5 font-semibold shrink-0 cursor-pointer shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF</span>
              </Button>
            </div>
          </DialogHeader>

          {/* Modal Scrollable Page Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Color swatches layout if Page 3 */}
            {activePage.swatches ? (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Official Corporate Color Palette
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {activePage.swatches.map((swatch) => (
                    <div
                      key={swatch.name}
                      className="rounded-xl border border-border/70 p-3 bg-card space-y-2 shadow-2xs"
                    >
                      <div className={cn("h-16 rounded-lg w-full shadow-inner", swatch.colorClass)} />
                      <div className="space-y-0.5 text-left">
                        <p className="text-xs font-bold text-foreground">{swatch.name}</p>
                        <p className="text-[10px] text-muted-foreground">{swatch.role}</p>
                        <div className="pt-1.5 border-t border-border/40 font-mono text-[10px] text-muted-foreground space-y-0.5">
                          <p>HEX: <span className="font-semibold text-foreground">{swatch.hex}</span></p>
                          <p>RGB: {swatch.rgb}</p>
                          <p>CMYK: {swatch.cmyk}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Standard sections */}
            {activePage.sections?.map((sec, idx) => (
              <div key={idx} className="rounded-xl border border-border/70 p-4 bg-muted/20 space-y-2 text-left">
                <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#4472C4]" />
                  {sec.heading}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {sec.content}
                </p>
              </div>
            ))}
          </div>

          {/* Modal Footer with pagination & download */}
          <DialogFooter className="p-3 sm:p-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
                disabled={activePageIndex === 0}
                className="h-8 text-xs gap-1 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActivePageIndex((prev) => Math.min(brandBookPreviewPages.length - 1, prev + 1))}
                disabled={activePageIndex === brandBookPreviewPages.length - 1}
                className="h-8 text-xs gap-1 cursor-pointer"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewOpen(false)}
                className="h-8 text-xs cursor-pointer"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => handleDownload("standard")}
                className="h-8 bg-[#4472C4] hover:bg-[#365ca0] text-white text-xs gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
