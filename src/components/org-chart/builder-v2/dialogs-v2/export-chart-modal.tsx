"use client"

import * as React from "react"
import { OrganizationChart, OrgNode, SectionBoundary, TextAnnotation, OrgConnection, OrgFooter } from "@/lib/org-chart/types"
import {
  exportOrgChartToPrintPdf,
  exportOrgChartToPng,
  exportOrgChartToSvg,
  calculateAutoFitTransform,
  formatDateDMY,
  PdfExportOptions,
  ExportScope,
} from "@/lib/org-chart/export-utils"
import { calculateManpowerSummary } from "@/lib/org-chart/rag-calculator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Download,
  FileText,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Share2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Printer,
  Sparkles,
  Layers,
  X,
  FileCode,
  Users,
  Zap,
} from "lucide-react"
import { MatrixBracketIcon } from "@/components/org-chart/builder-v2/canvas-v2/org-chart-footer-v2"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ExportChartModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chart: OrganizationChart
  activePageIndex?: number
}

export function ExportChartModal({
  open,
  onOpenChange,
  chart,
  activePageIndex = 0,
}: ExportChartModalProps) {
  // A) Format selection: PDF vs Image (PNG/SVG)
  const [format, setFormat] = React.useState<"PDF" | "IMAGE">("PDF")
  const [imageType, setImageType] = React.useState<"PNG" | "SVG">("PNG")

  // B) Export Pages: Current Page, All Pages, Range
  const [pageScope, setPageScope] = React.useState<ExportScope>("CURRENT")
  const totalPages = Math.max(1, chart.pages?.length || 1)
  const [rangeFrom, setRangeFrom] = React.useState<number>(1)
  const [rangeTo, setRangeTo] = React.useState<number>(totalPages)

  // C) Page Size & Orientation (Default: Landscape with A3)
  const [orientation, setOrientation] = React.useState<"landscape" | "portrait">("landscape")
  const [pageSize, setPageSize] = React.useState<"A0" | "A1" | "A2" | "A3" | "A4">("A3")

  // Preview Page index (which page is currently visible in preview pane)
  const [previewPageIndex, setPreviewPageIndex] = React.useState<number>(activePageIndex)

  // CorelDraw-style Zoom and Pan controls for preview
  const [zoom, setZoom] = React.useState<number>(0.38)
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const dragStartRef = React.useRef({ x: 0, y: 0 })

  // Keep preview index in sync with activePageIndex on open
  React.useEffect(() => {
    if (open) {
      setPreviewPageIndex(Math.max(0, Math.min(activePageIndex, totalPages - 1)))
      setRangeTo(totalPages)
      // Auto-fit initial zoom depending on orientation
      setZoom(orientation === "portrait" ? 0.32 : 0.38)
      setPan({ x: 0, y: 0 })
    }
  }, [open, activePageIndex, totalPages, orientation])

  // Get active preview page data
  const previewPageData = React.useMemo(() => {
    const pages = chart.pages && chart.pages.length > 0 ? chart.pages : []
    const p = pages[previewPageIndex]
    if (p) {
      return {
        pageNumber: previewPageIndex + 1,
        title: p.title || `Page ${previewPageIndex + 1}`,
        nodes: p.nodes || [],
        connections: p.connections || [],
        boundaries: p.boundaries || [],
        annotations: p.annotations || [],
        shapes: p.shapes || [],
        footer: p.footer || chart.footer,
      }
    }
    return {
      pageNumber: 1,
      title: chart.title || "Main Organization Chart",
      nodes: chart.nodes || [],
      connections: chart.connections || [],
      boundaries: chart.boundaries || [],
      annotations: chart.annotations || [],
      shapes: chart.shapes || [],
      footer: chart.footer,
    }
  }, [chart, previewPageIndex])

  const sheetWidth = orientation === "portrait" ? 1100 : 1600
  const sheetHeight = orientation === "portrait" ? 1600 : 1100
  const footerH = 240
  const availH = sheetHeight - 82 - footerH

  const { scale, transX, transY } = React.useMemo(() => {
    return calculateAutoFitTransform(
      previewPageData.nodes || [],
      previewPageData.boundaries || [],
      previewPageData.shapes || [],
      previewPageData.annotations || [],
      { left: 24, top: 82, width: sheetWidth - 48, height: availH }
    )
  }, [previewPageData, sheetWidth, sheetHeight, availH])

  const summary = React.useMemo(() => {
    return calculateManpowerSummary(previewPageData.nodes || [], previewPageData.footer)
  }, [previewPageData])

  // CorelDraw Interactive Zoom Handlers
  const handleWheelZoom = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89
    setZoom((prev) => Math.min(2.5, Math.max(0.15, Math.round(prev * zoomFactor * 100) / 100)))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      setIsDragging(true)
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const resetView = () => {
    setZoom(orientation === "portrait" ? 0.32 : 0.38)
    setPan({ x: 0, y: 0 })
  }

  // Common export options payload
  const getExportOptions = (): PdfExportOptions => ({
    scope: pageScope,
    activePageIndex: previewPageIndex,
    fromPage: Math.max(1, Math.min(rangeFrom, totalPages)),
    toPage: Math.max(rangeFrom, Math.min(rangeTo, totalPages)),
    pageSize,
    orientation,
    includeFooter: true,        // Hardcoded: always with matrix footer
    includeMetadata: true,      // Hardcoded: always with executive black header
    includeAnnotations: true,
  })

  // F) Final Export Execution (Download to Hard Drive)
  const handleFinalExport = () => {
    if (format === "PDF") {
      exportOrgChartToPrintPdf(chart, getExportOptions())
      toast.success(`PDF booklet export initiated (${pageSize} ${orientation}).`)
    } else {
      if (imageType === "PNG") {
        exportOrgChartToPng(chart, getExportOptions())
        toast.success(`High-Resolution PNG downloaded to your computer.`)
      } else {
        exportOrgChartToSvg(chart, getExportOptions())
        toast.success(`Scalable SVG Vector downloaded to your computer.`)
      }
    }
    onOpenChange(false)
  }

  // E) Share Option (Empty function as requested for future plan)
  const handleShareClick = () => {
    // Empty function as requested by user
    toast.info("Share feature configured. Custom share flow will be connected.")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        style={{ width: "calc(100vw - 200px)", maxWidth: "calc(100vw - 200px)" }}
        className="w-[calc(100vw-200px)] !max-w-[calc(100vw-200px)] sm:!max-w-[calc(100vw-200px)] h-[90vh] max-h-[920px] p-0 overflow-hidden rounded-2xl border border-border shadow-2xl flex flex-col bg-background select-none"
      >
        {/* Top Popout Bar */}
        <div className="h-14 bg-black text-white px-6 flex items-center justify-between shrink-0 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-emerald-400">
              <Download className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-white tracking-tight">
                Export Studio &bull; {chart.siteName || chart.title || "Organization Chart"}
              </DialogTitle>
              <p className="text-[10px] text-zinc-400 font-normal">
                CorelDraw-style Interactive Zoom &bull; Print-Ready Executive Layout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="h-3 w-3" />
              Auto-Fit Active
            </span>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Studio Body: Left Preview (60%) + Right Configuration (40%) */}
        <div className="flex flex-1 min-h-0 w-full overflow-hidden">
          {/* ============================================================== */}
          {/* 1. LEFT SIDE: CorelDraw-Style Zoomable Canvas Preview           */}
          {/* ============================================================== */}
          <div
            className="flex-1 h-full min-w-0 bg-zinc-200/70 dark:bg-zinc-950/80 relative overflow-hidden flex flex-col border-r border-border cursor-grab active:cursor-grabbing"
            onWheel={handleWheelZoom}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Floating CorelDraw Zoom Toolbar */}
            <div className="absolute top-3 left-3 z-30 flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-2 py-1.5 rounded-xl border border-border shadow-md text-xs font-semibold">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.15, Math.round((z - 0.08) * 100) / 100))}
                className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Zoom Out (-)"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>

              <span className="px-2 text-[11px] font-mono font-bold text-foreground min-w-[46px] text-center">
                {Math.round(zoom * 100)}%
              </span>

              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.5, Math.round((z + 0.08) * 100) / 100))}
                className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Zoom In (+)"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>

              <div className="h-4 w-px bg-border mx-1" />

              <button
                type="button"
                onClick={resetView}
                className="h-7 px-2 flex items-center gap-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer text-[10px] font-medium transition-colors"
                title="Fit to Screen"
              >
                <Maximize2 className="h-3 w-3" />
                <span>Fit</span>
              </button>
            </div>

            {/* Hint Badge */}
            <div className="absolute top-3 right-3 z-30 pointer-events-none">
              <span className="px-2.5 py-1 rounded-lg bg-black/60 text-white text-[10px] backdrop-blur-sm">
                Scroll to zoom &bull; Drag to pan
              </span>
            </div>

            {/* Central Transform Canvas Viewport */}
            <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden relative">
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.08s ease-out",
                  width: `${sheetWidth}px`,
                  height: `${sheetHeight}px`,
                }}
                className="relative bg-white shadow-2xl rounded-sm overflow-hidden shrink-0 border border-border/80"
              >
                {/* 1. Executive Top Header (Solid Black Banner) */}
                <div className="absolute top-0 left-0 right-0 h-[60px] bg-black text-white px-8 flex items-center justify-between z-20">
                  <div className="flex flex-col justify-center">
                    <h1 className="text-[17px] font-bold text-white tracking-tight leading-tight">
                      {chart.siteName || chart.title || "Name of the Organization Chart"}
                    </h1>
                    <p className="text-[11px] text-zinc-300 font-normal leading-tight mt-0.5">
                      Organization Structure
                    </p>
                  </div>

                  <div className="flex items-center">
                    <img
                      src="/logos/SVG/Logo_White.svg"
                      alt="Transvolt"
                      className="h-6 w-auto object-contain"
                    />
                  </div>
                </div>

                {/* Sub-header Date Bar */}
                <div className="absolute top-[64px] right-8 text-[9.5px] text-zinc-500 font-medium z-20">
                  Date Created: {formatDateDMY(chart.createdAt)} | Date Updated: {formatDateDMY(chart.updatedAt)}
                </div>

                {/* 2. Middle Content Auto-Fitted Canvas */}
                <div
                  className="absolute left-0 top-0 pointer-events-none z-10"
                  style={{
                    width: `${sheetWidth}px`,
                    height: `${sheetHeight}px`,
                    transform: `translate(${transX.toFixed(2)}px, ${transY.toFixed(2)}px) scale(${scale.toFixed(4)})`,
                    transformOrigin: "0 0",
                  }}
                >
                  {/* Connectors */}
                  <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                    {(previewPageData.connections || []).map((c) => {
                      const sNode = previewPageData.nodes.find((n) => n.id === c.source)
                      const tNode = previewPageData.nodes.find((n) => n.id === c.target)
                      if (!sNode || !tNode) return null
                      const sx = sNode.position.x + (sNode.width || 180) / 2
                      const sy = sNode.position.y + (sNode.height || 60)
                      const tx = tNode.position.x + (tNode.width || 180) / 2
                      const ty = tNode.position.y
                      const midY = sy + (ty - sy) / 2
                      return (
                        <path
                          key={c.id}
                          d={`M ${sx} ${sy} L ${sx} ${midY} L ${tx} ${midY} L ${tx} ${ty}`}
                          fill="none"
                          stroke={c.color || "#64748b"}
                          strokeWidth="2"
                        />
                      )
                    })}
                  </svg>

                  {/* Boundaries */}
                  {(previewPageData.boundaries || []).map((b) => (
                    <div
                      key={b.id}
                      style={{
                        position: "absolute",
                        left: `${b.position.x}px`,
                        top: `${b.position.y}px`,
                        width: `${b.width}px`,
                        height: `${b.height}px`,
                        border: `1.5px dashed ${b.color || "#548235"}`,
                        borderRadius: "12px",
                        backgroundColor: "rgba(248, 250, 252, 0.45)",
                      }}
                    >
                      {b.title && (
                        <span
                          style={{
                            position: "absolute",
                            top: "8px",
                            left: "14px",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: b.color || "#548235",
                          }}
                        >
                          {b.title}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Shapes */}
                  {(previewPageData.shapes || []).map((s) => (
                    <div
                      key={s.id}
                      style={{
                        position: "absolute",
                        left: `${s.x}px`,
                        top: `${s.y}px`,
                        width: `${s.width}px`,
                        height: `${s.height}px`,
                        backgroundColor: s.fill || "#f1f5f9",
                        border: `${s.strokeWidth || 1.5}px ${s.strokeStyle || "solid"} ${s.stroke || "#94a3b8"}`,
                        borderRadius: s.kind === "circle" ? "50%" : s.kind === "rounded-rectangle" ? "8px" : "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: s.textColor || "#0f172a",
                        fontSize: `${s.fontSize || 12}px`,
                      }}
                    >
                      {s.text}
                    </div>
                  ))}

                  {/* Nodes (Exact Match to Live Canvas Tiles & Custom Colors) */}
                  {(previewPageData.nodes || []).map((n) => {
                    const isOrg = n.type === "ORGANIZATION"
                    const isExec = n.type === "EXECUTIVE" || n.type === "MANAGEMENT"
                    const isDept = n.type === "DEPARTMENT"
                    const isHod = n.type === "HOD" || n.metadata.employmentType === "HOD"
                    const isConsultant = n.type === "CONSULTANT" || n.metadata.employmentType === "CONSULTANT"
                    const isRequired = n.type === "REQUIRED_POSITION"

                    let bg = "#ffffff"
                    let border = "#94a3b8" // White and gray stroke for employee
                    let textColor = "#0f172a"
                    let subColor = "#64748b"
                    let borderStyle = "solid"

                    if (isOrg) {
                      bg = "#c2410c"
                      border = "#9a3412"
                      textColor = "#ffffff"
                      subColor = "#ffedd5"
                    } else if (isExec) {
                      bg = "#0f172a"
                      border = "#334155"
                      textColor = "#ffffff"
                      subColor = "#cbd5e1"
                    } else if (isDept) {
                      bg = "#1e40af"
                      border = "#1e3a8a"
                      textColor = "#ffffff"
                      subColor = "#bfdbfe"
                    } else if (isHod) {
                      bg = "#15803d" // Green Color Default
                      border = "#166534"
                      textColor = "#ffffff"
                      subColor = "#bbf7d0"
                    } else if (isConsultant) {
                      bg = "#ea580c" // Yellow shed Orange default
                      border = "#c2410c"
                      textColor = "#ffffff"
                      subColor = "#fed7aa"
                    } else if (isRequired) {
                      bg = "#f8fafc"
                      border = "#94a3b8"
                      textColor = "#334155"
                      subColor = "#64748b"
                      borderStyle = "dashed"
                    }

                    // Respect any custom override colors configured in Inspector
                    if (n.metadata.bgColor) bg = n.metadata.bgColor
                    if (n.metadata.color) border = n.metadata.color
                    if (n.metadata.textColor) textColor = n.metadata.textColor

                    const subtitle =
                      n.metadata.departmentCode ||
                      n.metadata.code ||
                      n.metadata.designation ||
                      n.metadata.department ||
                      (isRequired && n.metadata.requiredQuantity ? `${n.metadata.requiredQuantity} Vacancies` : "") ||
                      ""

                    return (
                      <div
                        key={n.id}
                        style={{
                          position: "absolute",
                          left: `${n.position.x}px`,
                          top: `${n.position.y}px`,
                          width: `${n.width || 190}px`,
                          height: `${n.height || 60}px`,
                          backgroundColor: bg,
                          border: `1.5px ${borderStyle} ${border}`,
                          borderRadius: "12px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "6px 12px",
                          color: textColor,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          boxSizing: "border-box",
                        }}
                      >
                        <span
                          className="text-[12px] font-bold tracking-tight text-center truncate w-full"
                          style={{ color: textColor }}
                        >
                          {n.label}
                        </span>
                        {subtitle && (
                          <span
                            className="text-[10px] text-center truncate w-full mt-0.5 font-medium tracking-wide"
                            style={{ color: subColor }}
                          >
                            {subtitle}
                          </span>
                        )}
                        {n.metadata.employeeId && (
                          <span className="text-[9px] text-slate-400 mt-0.5 font-mono">
                            #{n.metadata.employeeId}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* 3. Bottom Operations & Live Manpower RAG Matrix (Exact Match to Image 2) */}
                <div className="absolute bottom-0 left-0 right-0 h-[245px] bg-white border-t border-border/80 shadow-md z-20 flex flex-col overflow-hidden text-slate-800">
                  {/* Top Matrix Title Bar */}
                  <div className="h-9 px-4 bg-white border-b border-border/70 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-[#16a34a]/15 text-[#16a34a]">
                        <MatrixBracketIcon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wide text-foreground">
                        OPERATIONS &amp; LIVE MANPOWER RAG MATRIX
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-2">
                        {chart.siteLocation || chart.siteName || "Transvolt Project Site"} &bull; Effective: {chart.effectiveFrom || "2026-10-28"}
                      </span>
                    </div>
                    <X className="h-3.5 w-3.5 text-muted-foreground opacity-50" />
                  </div>

                  {/* 3 Columns Section Grid */}
                  <div className="grid grid-cols-12 divide-x divide-border/60 bg-white flex-1 min-h-0 text-[11px]">
                    {/* SECTION A: PROJECT INFORMATION (3 cols) */}
                    <div className="col-span-3 p-3 space-y-2 bg-slate-50/40 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563eb] block mb-1.5">
                          SECTION A: PROJECT INFORMATION
                        </span>
                        <div className="space-y-1 text-[10.5px]">
                          <div className="flex justify-between items-baseline py-0.5 border-b border-border/30">
                            <span className="text-muted-foreground">Company:</span>
                            <span className="font-semibold text-right truncate max-w-[145px] text-slate-900" title={chart.companyName || chart.siteName || "Transvolt Mobility Private Limited"}>
                              {chart.companyName || chart.siteName || "Transvolt Mobility Private Limited"}
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline py-0.5 border-b border-border/30">
                            <span className="text-muted-foreground">Site / Location:</span>
                            <span className="font-semibold text-right truncate max-w-[145px] text-slate-900">
                              {chart.siteLocation || "Site Operations"}
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline py-0.5 border-b border-border/30">
                            <span className="text-muted-foreground">Project Manager:</span>
                            <span className="font-semibold text-right text-slate-900">
                              {chart.projectManager || previewPageData.footer?.projectInfo?.projectManager || "Project Head"}
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline py-0.5 border-b border-border/30">
                            <span className="text-muted-foreground">Effective Date:</span>
                            <span className="font-bold text-[#16a34a] text-right">
                              {chart.effectiveFrom || "2026-10-28"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-baseline pt-1 border-t border-border/40 text-[10.5px]">
                        <span className="text-muted-foreground">Total Personnel:</span>
                        <span className="font-extrabold text-slate-900">{summary.totalAvailable} Active</span>
                      </div>
                    </div>

                    {/* SECTION B: MANPOWER RAG MATRIX (LIVE AUTO-CALCULATED) (6 cols) */}
                    <div className="col-span-6 p-3 space-y-1.5 bg-white flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#16a34a] flex items-center gap-1.5">
                          <Users className="h-3 w-3" />
                          SECTION B: MANPOWER RAG MATRIX (LIVE AUTO-CALCULATED)
                        </span>
                        <span className="text-[9.5px] text-muted-foreground font-mono">
                          {summary.rows.length} Department{summary.rows.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="border border-border/60 rounded-lg overflow-hidden bg-white flex-1 flex flex-col justify-between">
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead>
                            <tr className="bg-slate-100/80 border-b border-border/60 text-[9px] uppercase font-bold text-slate-600">
                              <th className="py-1 px-2">DEPARTMENT</th>
                              <th className="py-1 px-1 text-center font-mono">EMP</th>
                              <th className="py-1 px-1 text-center font-mono">CONS</th>
                              <th className="py-1 px-1 text-center font-mono">AVAIL</th>
                              <th className="py-1 px-1 text-center font-mono">REQ</th>
                              <th className="py-1 px-1 text-center font-mono">GAP</th>
                              <th className="py-1 px-1 text-center">STATUS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {summary.rows.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="py-3 px-2 text-center text-muted-foreground italic text-[10px]">
                                  No departments mapped. Total chart active headcount is shown below.
                                </td>
                              </tr>
                            ) : (
                              summary.rows.slice(0, 3).map((r) => (
                                <tr key={r.departmentName}>
                                  <td className="py-0.5 px-2 font-medium truncate max-w-[150px]">{r.departmentName}</td>
                                  <td className="py-0.5 px-1 text-center font-mono text-[#16a34a] font-semibold">{r.employees}</td>
                                  <td className="py-0.5 px-1 text-center font-mono text-amber-600 font-semibold">{r.consultants}</td>
                                  <td className="py-0.5 px-1 text-center font-mono font-bold text-slate-900">{r.available}</td>
                                  <td className="py-0.5 px-1 text-center font-mono text-slate-500">{r.required}</td>
                                  <td className="py-0.5 px-1 text-center font-mono font-bold text-[#16a34a]">{r.gap >= 0 ? `+${r.gap}` : r.gap}</td>
                                  <td className="py-0.5 px-1 text-center">
                                    <span className="px-1 py-0.2 rounded text-[8px] font-bold uppercase bg-emerald-500/15 text-emerald-700">
                                      {r.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>

                        {/* Total Manpower Row */}
                        <div className="bg-slate-100/90 border-t border-border/80 px-2 py-1 flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-900">Total Manpower</span>
                          <div className="flex items-center gap-3 font-mono text-[10px]">
                            <span className="text-[#16a34a]" title="Employees">{summary.totalEmployees}</span>
                            <span className="text-amber-600" title="Consultants">{summary.totalConsultants}</span>
                            <span className="font-black text-slate-900" title="Available">{summary.totalAvailable}</span>
                            <span className="text-slate-500" title="Required">{summary.totalRequired}</span>
                            <span className="text-[#16a34a] font-black" title="Gap">{summary.totalGap >= 0 ? `+${summary.totalGap}` : summary.totalGap}</span>
                            <span className="px-1.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase bg-emerald-500/20 text-emerald-700">
                              {summary.ragStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION C: FLEET & INFRASTRUCTURE (3 cols) */}
                    <div className="col-span-3 p-3 space-y-1.5 bg-slate-50/40 flex flex-col justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563eb] flex items-center gap-1.5">
                        <Zap className="h-3 w-3" />
                        SECTION C: FLEET &amp; INFRASTRUCTURE
                      </span>

                      <div className="border border-border/60 rounded-lg overflow-hidden bg-white">
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead>
                            <tr className="bg-slate-100/80 border-b border-border/60 text-[9px] uppercase font-bold text-slate-600">
                              <th className="py-1 px-2">ASSET</th>
                              <th className="py-1 px-1 text-center font-mono">REQ</th>
                              <th className="py-1 px-1 text-center font-mono">AVAIL</th>
                              <th className="py-1 px-1 text-center font-mono">GAP</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40 font-medium">
                            <tr>
                              <td className="py-1 px-2 font-semibold">Electric Vehicles</td>
                              <td className="py-1 px-1 text-center font-mono text-slate-600">{previewPageData.footer?.vehicleMatrix?.vehicles?.required || 50}</td>
                              <td className="py-1 px-1 text-center font-mono font-bold text-slate-900">{previewPageData.footer?.vehicleMatrix?.vehicles?.available || 50}</td>
                              <td className="py-1 px-1 text-center font-mono font-bold text-[#16a34a]">
                                {(previewPageData.footer?.vehicleMatrix?.vehicles?.available || 50) - (previewPageData.footer?.vehicleMatrix?.vehicles?.required || 50) >= 0 ? "+0" : "-"}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1 px-2 font-semibold">EV Chargers</td>
                              <td className="py-1 px-1 text-center font-mono text-slate-600">{previewPageData.footer?.vehicleMatrix?.chargers?.required || 8}</td>
                              <td className="py-1 px-1 text-center font-mono font-bold text-slate-900">{previewPageData.footer?.vehicleMatrix?.chargers?.available || 8}</td>
                              <td className="py-1 px-1 text-center font-mono font-bold text-[#16a34a]">
                                {(previewPageData.footer?.vehicleMatrix?.chargers?.available || 8) - (previewPageData.footer?.vehicleMatrix?.chargers?.required || 8) >= 0 ? "+0" : "-"}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1 px-2 font-semibold">Charging Bays</td>
                              <td className="py-1 px-1 text-center font-mono text-slate-600">{previewPageData.footer?.vehicleMatrix?.infrastructure?.required || 4}</td>
                              <td className="py-1 px-1 text-center font-mono font-bold text-slate-900">{previewPageData.footer?.vehicleMatrix?.infrastructure?.available || 4}</td>
                              <td className="py-1 px-1 text-center font-mono font-bold text-[#16a34a]">
                                {(previewPageData.footer?.vehicleMatrix?.infrastructure?.available || 4) - (previewPageData.footer?.vehicleMatrix?.infrastructure?.required || 4) >= 0 ? "+0" : "-"}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="text-[9px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/30">
                        <span>Fleet Status: <strong className="text-[#16a34a]">100% Operational</strong></span>
                        <span>Audit: <strong className="text-slate-700">Approved</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Preview Page Navigator */}
            {totalPages > 1 && (
              <div className="h-10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-border px-4 flex items-center justify-between shrink-0 z-30">
                <span className="text-xs text-muted-foreground font-medium">
                  Previewing Sheet: <strong>{previewPageData.title}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={previewPageIndex <= 0}
                    onClick={() => setPreviewPageIndex((p) => Math.max(0, p - 1))}
                    className="h-7 w-7 p-0 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-semibold">
                    Page {previewPageIndex + 1} of {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={previewPageIndex >= totalPages - 1}
                    onClick={() => setPreviewPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                    className="h-7 w-7 p-0 cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* 2. RIGHT SIDE: Export Options & Configuration Panel             */}
          {/* ============================================================== */}
          <div className="w-[390px] xl:w-[410px] shrink-0 h-full flex flex-col bg-card overflow-hidden">
            <div className="flex-1 p-5 space-y-4 overflow-y-auto text-xs">
              {/* Option A: Format Selection (PDF vs Image) */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>A) Format Selection</span>
                  <span className="text-[10px] font-medium text-muted-foreground">Print &amp; Vector</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat("PDF")}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer gap-1.5",
                      format === "PDF"
                        ? "border-[#548235] bg-[#548235]/10 text-foreground font-bold shadow-xs ring-1 ring-[#548235]"
                        : "border-border hover:bg-muted text-muted-foreground font-medium"
                    )}
                  >
                    <FileText className={cn("h-5 w-5", format === "PDF" ? "text-[#548235]" : "text-muted-foreground")} />
                    <span>PDF Document</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat("IMAGE")}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer gap-1.5",
                      format === "IMAGE"
                        ? "border-[#548235] bg-[#548235]/10 text-foreground font-bold shadow-xs ring-1 ring-[#548235]"
                        : "border-border hover:bg-muted text-muted-foreground font-medium"
                    )}
                  >
                    <ImageIcon className={cn("h-5 w-5", format === "IMAGE" ? "text-[#548235]" : "text-muted-foreground")} />
                    <span>Image Export</span>
                  </button>
                </div>

                {/* Sub-format for Image */}
                {format === "IMAGE" && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setImageType("PNG")}
                      className={cn(
                        "py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all",
                        imageType === "PNG"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      High-Res PNG
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageType("SVG")}
                      className={cn(
                        "py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all",
                        imageType === "SVG"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      Vector SVG
                    </button>
                  </div>
                )}
              </div>

              {/* Option B: Export Pages Options */}
              <div className="space-y-2 pt-1 border-t border-border/60">
                <Label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>B) Export Pages Options</span>
                  <span className="text-[10px] text-muted-foreground">{totalPages} Total</span>
                </Label>
                <div className="space-y-1.5">
                  {/* Current Page */}
                  <button
                    type="button"
                    onClick={() => setPageScope("CURRENT")}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-xl border text-left cursor-pointer transition-all",
                      pageScope === "CURRENT"
                        ? "border-[#548235] bg-[#548235]/10 text-foreground font-bold ring-1 ring-[#548235]"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <span>Current Page ({previewPageIndex + 1}: &ldquo;{previewPageData.title}&rdquo;)</span>
                    {pageScope === "CURRENT" && <CheckCircle2 className="h-4 w-4 text-[#548235]" />}
                  </button>

                  {/* All Pages */}
                  <button
                    type="button"
                    onClick={() => setPageScope("ALL")}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-xl border text-left cursor-pointer transition-all",
                      pageScope === "ALL"
                        ? "border-[#548235] bg-[#548235]/10 text-foreground font-bold ring-1 ring-[#548235]"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <span>All Pages (Complete {totalPages}-Page Booklet)</span>
                    {pageScope === "ALL" && <CheckCircle2 className="h-4 w-4 text-[#548235]" />}
                  </button>

                  {/* Range Option */}
                  <button
                    type="button"
                    onClick={() => setPageScope("RANGE")}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-xl border text-left cursor-pointer transition-all",
                      pageScope === "RANGE"
                        ? "border-[#548235] bg-[#548235]/10 text-foreground font-bold ring-1 ring-[#548235]"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <span>Select Page Range (From... To...)</span>
                    {pageScope === "RANGE" && <CheckCircle2 className="h-4 w-4 text-[#548235]" />}
                  </button>

                  {pageScope === "RANGE" && (
                    <div className="flex items-center gap-2 p-2 bg-muted/40 rounded-xl border border-border">
                      <div className="flex-1">
                        <span className="text-[10px] text-muted-foreground block mb-0.5">From Page:</span>
                        <input
                          type="number"
                          min={1}
                          max={totalPages}
                          value={rangeFrom}
                          onChange={(e) => setRangeFrom(Math.max(1, Math.min(Number(e.target.value), totalPages)))}
                          className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs font-semibold"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] text-muted-foreground block mb-0.5">To Page:</span>
                        <input
                          type="number"
                          min={rangeFrom}
                          max={totalPages}
                          value={rangeTo}
                          onChange={(e) => setRangeTo(Math.max(rangeFrom, Math.min(Number(e.target.value), totalPages)))}
                          className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs font-semibold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Option C: Page Size & Orientation */}
              <div className="space-y-2 pt-1 border-t border-border/60">
                <Label className="text-xs font-bold text-foreground">
                  C) Page Size &amp; Orientation
                </Label>

                {/* Orientation Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation("landscape")}
                    className={cn(
                      "py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all",
                      orientation === "landscape"
                        ? "bg-[#548235] text-white border-[#548235] shadow-xs"
                        : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Landscape (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation("portrait")}
                    className={cn(
                      "py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all",
                      orientation === "portrait"
                        ? "bg-[#548235] text-white border-[#548235] shadow-xs"
                        : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Portrait
                  </button>
                </div>

                {/* Page Size Selector */}
                <div className="space-y-1">
                  <span className="text-[10px] font-medium text-muted-foreground block">
                    Paper Standard:
                  </span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(["A3", "A4", "A2", "A1", "A0"] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setPageSize(sz)}
                        className={cn(
                          "py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center",
                          pageSize === sz
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Strong Auto-Fit Guarantee Pill */}
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                    <strong>Auto-Fit Guarantee:</strong> Entire organization chart scales dynamically to fit 100% inside printable margins on every page.
                  </p>
                </div>
              </div>

              {/* Option D: Hard-Coded Header and Matrix Footer */}
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#548235] shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-foreground block">
                      Executive Header &amp; Matrix Space Footer
                    </span>
                    <span className="text-[9.5px] text-muted-foreground">
                      Locked: Always included in official export
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  Locked
                </span>
              </div>

              {/* Option E: Share Option (Empty function for future plan) */}
              <div className="pt-1 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleShareClick}
                  className="w-full h-9 text-xs font-semibold gap-2 border-blue-500/40 text-blue-600 hover:bg-blue-500/10 cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share Option (Link / Access)</span>
                </Button>
              </div>
            </div>

            {/* F) Bottom Action Footer (Final Export Button) */}
            <div className="p-4 border-t border-border bg-muted/20 shrink-0 flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-10 px-4 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleFinalExport}
                className="flex-1 h-10 text-xs font-bold gap-2 bg-[#548235] hover:bg-[#466f2c] text-white shadow-sm cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>
                  Export &amp; Download {format === "PDF" ? `PDF (${pageSize})` : `${imageType} Image`}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
