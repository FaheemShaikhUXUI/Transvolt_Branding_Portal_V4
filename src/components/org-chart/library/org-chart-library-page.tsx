"use client"

import * as React from "react"
import { OrganizationChart, ChartStatus } from "@/lib/org-chart/types"
import { orgChartService } from "@/lib/org-chart/org-chart-service"
import { useCompanyMaster } from "@/lib/company-master/company-master-context"
import { useUserAccess } from "@/lib/user-access/user-access-context"
import {
  exportOrgChartToPrintPdf,
  exportOrgChartToPng,
  exportOrgChartToSvg,
} from "@/lib/org-chart/export-utils"
import { ChartCardItem } from "./chart-card-item"
import { ShareChartModal } from "./share-chart-modal"
import { DuplicateChartModal } from "./duplicate-chart-modal"
import { VersionHistoryModal } from "./version-history-modal"
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  Building2,
  Network,
  Calendar,
  Sparkles,
  Eye,
  Edit,
  Share2,
  Copy,
  Download,
  Archive,
  History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface LibraryPageProps {
  onOpenBuilder: (chart?: OrganizationChart, version?: "v1" | "v2") => void
}

export function OrgChartLibraryPage({ onOpenBuilder }: LibraryPageProps) {
  const { companies } = useCompanyMaster()
  const { users } = useUserAccess()

  const [charts, setCharts] = React.useState<OrganizationChart[]>([])
  const [loading, setLoading] = React.useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedSiteId, setSelectedSiteId] = React.useState<string>("ALL")
  const [selectedStatus, setSelectedStatus] = React.useState<ChartStatus | "ALL">("ALL")
  const [selectedDate, setSelectedDate] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"GRID" | "TABLE">("GRID")

  // Modals state
  const [shareChart, setShareChart] = React.useState<OrganizationChart | null>(null)
  const [duplicateChart, setDuplicateChart] = React.useState<OrganizationChart | null>(null)
  const [historySiteChart, setHistorySiteChart] = React.useState<OrganizationChart | null>(null)

  const loadCharts = React.useCallback(async () => {
    setLoading(true)
    const list = await orgChartService.getCharts({
      search: searchQuery || undefined,
      siteId: selectedSiteId !== "ALL" ? selectedSiteId : undefined,
      status: selectedStatus !== "ALL" ? selectedStatus : undefined,
      date: selectedDate || undefined,
    })
    setCharts(list)
    setLoading(false)
  }, [searchQuery, selectedSiteId, selectedStatus, selectedDate])

  React.useEffect(() => {
    loadCharts()
  }, [loadCharts])

  const handleDuplicate = async (
    sourceId: string,
    targetSiteId: string,
    targetSiteName: string,
    targetSiteLocation: string,
    newTitle: string
  ) => {
    try {
      const cloned = await orgChartService.duplicateChart(
        sourceId,
        targetSiteId,
        targetSiteName,
        targetSiteLocation,
        newTitle,
        "Super Admin"
      )
      toast.success("Organization Chart cloned successfully!")
      loadCharts()
      onOpenBuilder(cloned)
    } catch {
      toast.error("Failed to duplicate chart.")
    }
  }

  const handleArchive = async (chart: OrganizationChart) => {
    if (confirm(`Archive version "${chart.version}" for ${chart.siteLocation}? It will become historical record.`)) {
      await orgChartService.archiveChart(chart.id)
      toast.success("Chart archived.")
      loadCharts()
    }
  }

  // Group versions for history modal
  const historyVersions = React.useMemo(() => {
    if (!historySiteChart) return []
    return charts.filter((c) => c.siteId === historySiteChart.siteId)
  }, [charts, historySiteChart])

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full text-left">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#4472C4]/10 text-[#4472C4] shadow-xs shrink-0">
              <Network className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#4472C4]">
              Organization Chart
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
            Create, manage, and maintain organization structures across Head Office and project sites.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Create V1 Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenBuilder(undefined, "v1")}
            className="h-10 px-3.5 text-xs font-semibold gap-1.5 cursor-pointer hover:bg-muted"
            title="Create using Classic Canvas Editor V1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Chart V1</span>
          </Button>

          {/* Primary Create V2 Button */}
          <Button
            type="button"
            onClick={() => onOpenBuilder(undefined, "v2")}
            className="h-10 px-4 text-xs font-bold gap-2 bg-[#548235] hover:bg-[#466f2c] text-white shadow-sm cursor-pointer"
            title="Create using New Live Preview & Unified Form Studio V2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Organization Chart V2</span>
          </Button>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3.5 rounded-2xl border border-border/80 shadow-2xs">
        <div className="flex-1 flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Title, Site, Department, Person..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Site Filter */}
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="h-8 text-xs rounded-lg border border-input bg-background px-2.5 font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Locations & Sites</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.siteLocation}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ChartStatus | "ALL")}
            className="h-8 text-xs rounded-lg border border-input bg-background px-2.5 font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="CURRENT">Current Active</option>
            <option value="DRAFT">Draft</option>
            <option value="FUTURE">Future Effective</option>
            <option value="ARCHIVED">Archived / Historical</option>
          </select>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 h-8 px-2 rounded-lg border border-input bg-background text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-foreground text-xs focus:outline-none cursor-pointer"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate("")}
                className="text-[10px] text-muted-foreground hover:text-foreground ml-1"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5 shrink-0 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("GRID")}
            className={cn(
              "p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer",
              viewMode === "GRID"
                ? "bg-background shadow-xs text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Grid Cards"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("TABLE")}
            className={cn(
              "p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer",
              viewMode === "TABLE"
                ? "bg-background shadow-xs text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Table View"
          >
            <TableIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Empty State or Charts Content */}
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">Loading organization structures...</div>
      ) : charts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-border/80 bg-card/40 space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">No Organization Chart Created</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Create the first organization structure for this location, project site, or Head Office.
            </p>
          </div>
          <Button
            onClick={() => onOpenBuilder(undefined)}
            size="sm"
            className="gap-1.5 bg-[#548235] hover:bg-[#466f2c] text-white cursor-pointer font-bold mt-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Organization Chart</span>
          </Button>
        </div>
      ) : viewMode === "GRID" ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {charts.map((item, idx) => (
            <ChartCardItem
              key={item.id}
              chart={item}
              index={idx + 1}
              onOpen={(c, v) => onOpenBuilder(c, v || "v2")}
              onDuplicate={(c) => setDuplicateChart(c)}
              onShare={(c) => setShareChart(c)}
              onExportPdf={(c) => exportOrgChartToPrintPdf(c)}
              onExportPng={(c) => exportOrgChartToPng(c)}
              onExportSvg={(c) => exportOrgChartToSvg(c)}
              onViewHistory={(c) => setHistorySiteChart(c)}
              onArchive={handleArchive}
            />
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                  <th className="p-3 pl-4">Sr.</th>
                  <th className="p-3">Organization Chart Title</th>
                  <th className="p-3">Location / Site</th>
                  <th className="p-3">Effective Date</th>
                  <th className="p-3">Version</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Updated</th>
                  <th className="p-3">Author</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {charts.map((item, idx) => {
                  const isCurrent = item.status === "CURRENT"

                  return (
                    <tr
                      key={item.id}
                      className={cn("hover:bg-muted/30 transition-colors", isCurrent && "bg-emerald-500/2")}
                    >
                      <td className="p-3 pl-4 font-mono text-muted-foreground">{idx + 1}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => onOpenBuilder(item, "v2")}
                          className="font-bold text-foreground hover:text-primary transition-colors text-left"
                        >
                          {item.title}
                        </button>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-foreground">{item.siteLocation}</span>
                      </td>
                      <td className="p-3 font-semibold">{item.effectiveFrom}</td>
                      <td className="p-3 font-bold">{item.version}</td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold uppercase",
                            isCurrent && "border-emerald-500 text-emerald-600 bg-emerald-500/10",
                            item.status === "DRAFT" && "border-amber-500 text-amber-600",
                            item.status === "ARCHIVED" && "border-slate-400 text-slate-500",
                            item.status === "FUTURE" && "border-blue-500 text-blue-600"
                          )}
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(item.updatedAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-3 text-muted-foreground truncate max-w-[120px]">
                        {item.updatedBy || item.createdBy}
                      </td>
                      <td className="p-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenBuilder(item, "v2")}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Open & Edit (V2)"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShareChart(item)}
                            className="h-7 w-7 text-blue-600 hover:text-blue-700 cursor-pointer"
                            title="Share (6 Hours)"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setHistorySiteChart(item)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Version History"
                          >
                            <History className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDuplicateChart(item)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => exportOrgChartToPrintPdf(item)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Export PDF"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          {item.status !== "ARCHIVED" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleArchive(item)}
                              className="h-7 w-7 text-amber-600 hover:text-amber-700 cursor-pointer"
                              title="Archive"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <ShareChartModal
        open={!!shareChart}
        onOpenChange={(open) => !open && setShareChart(null)}
        chartId={shareChart ? shareChart.id : null}
        chartTitle={shareChart ? shareChart.title : ""}
      />

      <DuplicateChartModal
        open={!!duplicateChart}
        onOpenChange={(open) => !open && setDuplicateChart(null)}
        sourceChart={duplicateChart}
        onDuplicate={handleDuplicate}
      />

      <VersionHistoryModal
        open={!!historySiteChart}
        onOpenChange={(open) => !open && setHistorySiteChart(null)}
        siteName={historySiteChart ? historySiteChart.siteName : ""}
        siteLocation={historySiteChart ? historySiteChart.siteLocation : ""}
        versions={historyVersions}
        onOpenChart={(c) => onOpenBuilder(c)}
        onDuplicateChart={(c) => setDuplicateChart(c)}
        onExportChart={(c) => exportOrgChartToPrintPdf(c)}
      />
    </div>
  )
}
