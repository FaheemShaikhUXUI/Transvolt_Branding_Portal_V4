"use client"

import * as React from "react"
import { OrganizationChart } from "@/lib/org-chart/types"
import { OrgChartCanvas } from "@/components/org-chart/builder/canvas/org-chart-canvas"
import {
  exportOrgChartToPrintPdf,
  exportOrgChartToPng,
  exportOrgChartToSvg,
} from "@/lib/org-chart/export-utils"
import { Clock, Download, ShieldAlert, Building2, MapPin, Calendar, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SharedViewerProps {
  chart: OrganizationChart | null
  isExpired: boolean
  remainingMs: number
}

export function SharedOrgChartViewer({ chart, isExpired, remainingMs }: SharedViewerProps) {
  const [timeLeft, setTimeLeft] = React.useState(remainingMs)

  React.useEffect(() => {
    setTimeLeft(remainingMs)
    if (remainingMs <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [remainingMs])

  if (isExpired || timeLeft <= 0 || !chart) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <div className="max-w-md w-full p-8 rounded-2xl border border-destructive/30 bg-destructive/5 space-y-4 shadow-sm">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">Share Link Expired</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This organization chart link was valid for 6 hours and has expired for security and compliance.
            </p>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            Please contact the administrator or organization chart owner to request a fresh share link.
          </p>
        </div>
      </div>
    )
  }

  // Format countdown: X hours Y mins Z secs
  const hours = Math.floor(timeLeft / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-background text-foreground">
      {/* 1. Top Expiry Banner */}
      <div className="h-8 bg-amber-500/15 border-b border-amber-500/25 px-4 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-semibold text-[11px]">
            Shareable link expires in:{" "}
            <strong>
              {hours}h {minutes}m {seconds}s
            </strong>
          </span>
        </div>
        <span className="text-[10px] text-amber-800 dark:text-amber-300 hidden sm:inline font-medium">
          Official Transvolt Read-Only Document
        </span>
      </div>

      {/* 2. Viewer Header */}
      <header className="h-16 border-b border-border/80 bg-card/60 backdrop-blur-md px-6 flex items-center justify-between gap-4 shrink-0 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#548235]/10 text-[#548235]">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-foreground truncate">
                {chart.title}
              </h1>
              <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/40 text-emerald-600 bg-emerald-500/10">
                {chart.version}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[#548235]" />
                {chart.siteLocation}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Effective: <strong>{chart.effectiveFrom}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Export action */}
        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="h-8 text-xs font-bold gap-1.5 bg-[#548235] hover:bg-[#466f2c] text-white cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Chart</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => exportOrgChartToPrintPdf(chart)} className="text-xs cursor-pointer">
                Download as PDF (A3 Landscape)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportOrgChartToPng(chart)} className="text-xs cursor-pointer">
                Download as High-Res PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportOrgChartToSvg(chart)} className="text-xs cursor-pointer">
                Download as SVG Vector
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* 3. Read-Only Canvas */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <OrgChartCanvas
          nodes={chart.nodes}
          connections={chart.connections}
          boundaries={chart.boundaries}
          footer={chart.footer}
          selectedNodeId={null}
          selectedBoundaryId={null}
          selectedConnectionId={null}
          canUndo={false}
          canRedo={false}
          onSelectNode={() => {}}
          onSelectBoundary={() => {}}
          onSelectConnection={() => {}}
          onUpdateNodePosition={() => {}}
          onUpdateBoundary={() => {}}
          onDeleteBoundary={() => {}}
          onUpdateFooter={() => {}}
          onAutoArrange={() => {}}
          onUndo={() => {}}
          onRedo={() => {}}
        />
      </div>
    </div>
  )
}
