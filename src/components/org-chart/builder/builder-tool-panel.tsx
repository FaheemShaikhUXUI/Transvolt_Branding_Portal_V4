"use client"

import * as React from "react"
import { OrganizationChart, ChartType, OrgNode } from "@/lib/org-chart/types"
import { useCompanyMaster } from "@/lib/company-master/company-master-context"
import {
  Building2,
  UserPlus,
  HelpCircle,
  Link2,
  BoxSelect,
  Layers,
  Sparkles,
  MapPin,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ToolPanelProps {
  chart: OrganizationChart
  onUpdateChart: (partial: Partial<OrganizationChart>) => void
  onOpenAddDepartment: () => void
  onOpenAddEmployee: () => void
  onOpenAddRequired: () => void
  onOpenConnectDialog: () => void
  onAddBoundary: () => void
  onToggleFooter: () => void
}

export function BuilderToolPanel({
  chart,
  onUpdateChart,
  onOpenAddDepartment,
  onOpenAddEmployee,
  onOpenAddRequired,
  onOpenConnectDialog,
  onAddBoundary,
  onToggleFooter,
}: ToolPanelProps) {
  const { companies } = useCompanyMaster()

  const handleTypeChange = (type: ChartType) => {
    if (type === "HEAD_OFFICE") {
      const hoCompany = companies.find((c) => c.siteLocation.toLowerCase().includes("hq")) || companies[0]
      onUpdateChart({
        chartType: "HEAD_OFFICE",
        siteId: hoCompany?.id || "cm-1",
        siteName: hoCompany?.companyName || "Transvolt Mobility Private Limited",
        siteLocation: hoCompany?.siteLocation || "Mumbai HQ",
      })
    } else {
      const siteCompany = companies.find((c) => !c.siteLocation.toLowerCase().includes("hq")) || companies[1]
      onUpdateChart({
        chartType: "PROJECT_SITE",
        siteId: siteCompany?.id || "cm-2",
        siteName: siteCompany?.companyName || "Transvolt Mobility Private Limited",
        siteLocation: siteCompany?.siteLocation || "Mira-Bhayandar (MBMT)",
      })
    }
  }

  const handleSiteSelect = (siteId: string) => {
    const selected = companies.find((c) => c.id === siteId)
    if (selected) {
      onUpdateChart({
        siteId: selected.id,
        siteName: selected.companyName,
        siteLocation: selected.siteLocation,
        footer: {
          ...chart.footer,
          projectInfo: {
            ...chart.footer.projectInfo,
            projectName: `${selected.companyName} (${selected.siteLocation})`,
            projectLocation: selected.siteLocation,
          },
        },
      })
    }
  }

  return (
    <aside className="w-72 border-r border-border/80 bg-card/50 backdrop-blur-sm p-4 flex flex-col gap-5 overflow-y-auto shrink-0 select-none">
      {/* TOOL 01: Chart Title & Type */}
      <div className="space-y-2">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-primary" /> Chart Title
        </label>
        <input
          type="text"
          value={chart.title}
          onChange={(e) => onUpdateChart({ title: e.target.value })}
          placeholder="Enter chart title..."
          className="w-full h-8 text-xs font-semibold px-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* TOOL 02: Organization Location & Site */}
      <div className="space-y-2.5 rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-[#548235]" /> Organization Location
        </label>

        {/* Radio: Head Office vs Project Site */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleTypeChange("HEAD_OFFICE")}
            className={`py-1.5 px-2 rounded-md border font-semibold text-center transition-all cursor-pointer ${
              chart.chartType === "HEAD_OFFICE"
                ? "bg-primary/10 border-primary text-primary shadow-2xs"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            Head Office
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("PROJECT_SITE")}
            className={`py-1.5 px-2 rounded-md border font-semibold text-center transition-all cursor-pointer ${
              chart.chartType === "PROJECT_SITE"
                ? "bg-[#548235]/15 border-[#548235] text-[#548235] shadow-2xs"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            Project Site
          </button>
        </div>

        {/* Searchable site selector */}
        {chart.chartType === "PROJECT_SITE" && (
          <div className="space-y-1 pt-1">
            <span className="text-[10px] text-muted-foreground">Select Site / Project:</span>
            <select
              value={chart.siteId}
              onChange={(e) => handleSiteSelect(e.target.value)}
              className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.siteLocation} ({c.companyName})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TOOL 03-05: Creation Actions */}
      <div className="space-y-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
          Hierarchy Tools
        </span>

        <div className="grid grid-cols-1 gap-2">
          {/* Add Department */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAddDepartment}
            className="w-full justify-start gap-2 h-9 text-xs font-semibold bg-[#2563EB]/5 hover:bg-[#2563EB]/15 text-[#2563EB] border-[#2563EB]/30 cursor-pointer shadow-2xs"
          >
            <Building2 className="h-4 w-4" />
            <span>+ Add Department</span>
          </Button>

          {/* Add Employee */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAddEmployee}
            className="w-full justify-start gap-2 h-9 text-xs font-semibold bg-[#548235]/5 hover:bg-[#548235]/15 text-[#548235] border-[#548235]/30 cursor-pointer shadow-2xs"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Add Employee / Consultant</span>
          </Button>

          {/* Add Required Position */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAddRequired}
            className="w-full justify-start gap-2 h-9 text-xs font-semibold bg-amber-500/5 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-400/40 cursor-pointer shadow-2xs"
          >
            <HelpCircle className="h-4 w-4" />
            <span>+ Add Required Position</span>
          </Button>

          {/* Connect Nodes */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenConnectDialog}
            className="w-full justify-start gap-2 h-9 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
          >
            <Link2 className="h-4 w-4 text-primary" />
            <span>+ Connect Two Nodes</span>
          </Button>

          {/* Add Section Boundary */}
          <Button
            variant="outline"
            size="sm"
            onClick={onAddBoundary}
            className="w-full justify-start gap-2 h-9 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
          >
            <BoxSelect className="h-4 w-4 text-slate-500" />
            <span>+ Add Section Boundary</span>
          </Button>
        </div>
      </div>

      {/* TOOL 08: Document Footer Block */}
      <div className="rounded-xl border border-border/70 bg-card p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-primary" /> Document Footer
          </span>
          <button
            type="button"
            onClick={onToggleFooter}
            className={`text-xs font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
              chart.footer.enabled
                ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {chart.footer.enabled ? "Enabled" : "Disabled"}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Includes Manpower RAG Matrix, Fleet & Charger infrastructure status, and official legend.
        </p>
      </div>
    </aside>
  )
}
