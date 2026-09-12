"use client"

import * as React from "react"
import { OrganizationChart } from "@/lib/org-chart/types"
import {
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Download,
  Share2,
  Archive,
  History,
  Building2,
  MapPin,
  Calendar,
  Layers,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface ChartCardProps {
  chart: OrganizationChart
  index: number
  onOpen: (chart: OrganizationChart, version?: "v1" | "v2") => void
  onDuplicate: (chart: OrganizationChart) => void
  onShare: (chart: OrganizationChart) => void
  onExportPdf: (chart: OrganizationChart) => void
  onExportPng: (chart: OrganizationChart) => void
  onExportSvg: (chart: OrganizationChart) => void
  onViewHistory: (chart: OrganizationChart) => void
  onArchive: (chart: OrganizationChart) => void
}

export function ChartCardItem({
  chart,
  index,
  onOpen,
  onDuplicate,
  onShare,
  onExportPdf,
  onExportPng,
  onExportSvg,
  onViewHistory,
  onArchive,
}: ChartCardProps) {
  const isCurrent = chart.status === "CURRENT"
  const isHeadOffice = chart.chartType === "HEAD_OFFICE"

  const deptCount = chart.nodes.filter((n) => n.type === "DEPARTMENT").length
  const staffCount = chart.nodes.filter(
    (n) => n.type === "EMPLOYEE" || n.type === "CONSULTANT"
  ).length

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-foreground/20",
        isCurrent && "border-emerald-500/30 bg-emerald-500/2 shadow-xs"
      )}
    >
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-extrabold uppercase px-2 py-0.5",
                isHeadOffice
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-[#548235]/40 bg-[#548235]/10 text-[#548235]"
              )}
            >
              {isHeadOffice ? "Head Office" : "Project Site"}
            </Badge>

            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold uppercase px-2 py-0.5",
                chart.status === "CURRENT" && "border-emerald-500/40 text-emerald-600 bg-emerald-500/10",
                chart.status === "DRAFT" && "border-amber-500/40 text-amber-600 bg-amber-500/10",
                chart.status === "ARCHIVED" && "border-slate-400 text-slate-500 bg-slate-500/10",
                chart.status === "FUTURE" && "border-blue-500/40 text-blue-600 bg-blue-500/10"
              )}
            >
              {chart.status} &bull; {chart.version}
            </Badge>
          </div>

          {/* Quick Dropdown Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
                  title="More actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => onOpen(chart, "v2")} className="gap-2 text-xs font-bold text-primary">
                <Edit className="h-3.5 w-3.5 text-primary" /> Edit in V2 (Form Studio)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpen(chart, "v1")} className="gap-2 text-xs text-muted-foreground">
                <Edit className="h-3.5 w-3.5" /> Edit in V1 (Classic Canvas)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onShare(chart)} className="gap-2 text-xs">
                <Share2 className="h-3.5 w-3.5" /> Share (6h Link)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewHistory(chart)} className="gap-2 text-xs">
                <History className="h-3.5 w-3.5" /> Version History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(chart)} className="gap-2 text-xs">
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExportPdf(chart)} className="gap-2 text-xs">
                <Download className="h-3.5 w-3.5" /> Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportPng(chart)} className="gap-2 text-xs">
                <Download className="h-3.5 w-3.5" /> Export PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportSvg(chart)} className="gap-2 text-xs">
                <Download className="h-3.5 w-3.5" /> Export SVG
              </DropdownMenuItem>
              {chart.status !== "ARCHIVED" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onArchive(chart)}
                    className="gap-2 text-xs text-amber-600 focus:text-amber-700"
                  >
                    <Archive className="h-3.5 w-3.5" /> Archive Version
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <div>
          <h3
            onClick={() => onOpen(chart)}
            className="text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors cursor-pointer leading-snug line-clamp-2"
          >
            {chart.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5 text-[#548235] shrink-0" />
            <span className="truncate">{chart.siteLocation}</span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/60 text-center text-xs">
          <div>
            <p className="font-bold text-foreground">{deptCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Depts</p>
          </div>
          <div>
            <p className="font-bold text-foreground">{staffCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Staff</p>
          </div>
          <div>
            <p className="font-bold text-foreground">{chart.nodes.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Nodes</p>
          </div>
        </div>

        {/* Dates Info */}
        <div className="space-y-1 text-[11px] text-muted-foreground">
          <div className="flex justify-between">
            <span>Effective Date:</span>
            <strong className="text-foreground">{chart.effectiveFrom}</strong>
          </div>
          <div className="flex justify-between">
            <span>Last Updated:</span>
            <span>{new Date(chart.updatedAt).toLocaleDateString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span>Author:</span>
            <span className="truncate max-w-[120px]">{chart.updatedBy || chart.createdBy}</span>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center gap-2 pt-4 mt-2 border-t border-border/60">
        <Button
          size="sm"
          onClick={() => onOpen(chart, "v2")}
          className="flex-1 h-8 text-xs font-bold gap-1.5 bg-[#4472C4] hover:bg-[#3962aa] text-white cursor-pointer"
          title="Open in V2 Builder"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Open Chart (V2)</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onShare(chart)}
          className="h-8 px-2.5 text-xs gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
          title="Share (6 Hours)"
        >
          <Share2 className="h-3.5 w-3.5 text-blue-600" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onExportPdf(chart)}
          className="h-8 px-2.5 text-xs gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
          title="Download PDF"
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
