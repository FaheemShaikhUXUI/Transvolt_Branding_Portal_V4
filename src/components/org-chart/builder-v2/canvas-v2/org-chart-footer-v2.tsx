"use client"

import * as React from "react"
import { OrgFooter, OrgNode, ProjectInformation } from "@/lib/org-chart/types"
import { calculateManpowerSummary } from "@/lib/org-chart/rag-calculator"
import { ChevronDown, ChevronUp, Layers, Users, Zap, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FooterV2Props {
  footer: OrgFooter
  nodes: OrgNode[]
  companyName?: string
  siteLocation?: string
  projectManager?: string
  effectiveDate?: string
  onUpdateFooter?: (updated: OrgFooter) => void
  hideAccordionHeader?: boolean
}

/**
 * Exact Mathematical Matrix Symbol Icon (Image 2)
 */
export function MatrixBracketIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left Bracket */}
      <path d="M6 3H2V21H6V18.5H4.5V5.5H6V3Z" />
      {/* Right Bracket */}
      <path d="M18 3H22V21H18V18.5H19.5V5.5H18V3Z" />
      {/* 3x3 Grid of square blocks */}
      <rect x="6.8" y="5.8" width="2.6" height="2.6" rx="0.3" />
      <rect x="10.7" y="5.8" width="2.6" height="2.6" rx="0.3" />
      <rect x="14.6" y="5.8" width="2.6" height="2.6" rx="0.3" />

      <rect x="6.8" y="10.7" width="2.6" height="2.6" rx="0.3" />
      <rect x="10.7" y="10.7" width="2.6" height="2.6" rx="0.3" />
      <rect x="14.6" y="10.7" width="2.6" height="2.6" rx="0.3" />

      <rect x="6.8" y="15.6" width="2.6" height="2.6" rx="0.3" />
      <rect x="10.7" y="15.6" width="2.6" height="2.6" rx="0.3" />
      <rect x="14.6" y="15.6" width="2.6" height="2.6" rx="0.3" />
    </svg>
  )
}

export function OrgChartFooterV2({
  footer,
  nodes,
  companyName = "Transvolt Mobility Private Limited",
  siteLocation = "Site Operations",
  projectManager = "Project Head",
  effectiveDate = "2026-09-01",
  onUpdateFooter,
  hideAccordionHeader = false,
}: FooterV2Props) {
  const [isExpanded, setIsExpanded] = React.useState(true)

  // Live calculated manpower summary
  const summary = React.useMemo(() => {
    return calculateManpowerSummary(nodes, footer)
  }, [nodes, footer])

  // Fleet assets calculations
  const fleetVehicles = footer.vehicleMatrix?.vehicles || { required: 50, available: 50 }
  const fleetChargers = footer.vehicleMatrix?.chargers || { required: 10, available: 10 }
  const fleetInfra = footer.vehicleMatrix?.infrastructure || { required: 4, available: 4 }

  const vehicleGap = fleetVehicles.available - fleetVehicles.required
  const chargerGap = fleetChargers.available - fleetChargers.required
  const infraGap = fleetInfra.available - fleetInfra.required

  if (!footer || footer.enabled === false) return null

  // If accordion header is hidden (inside bottom dock tile), render 3 sections directly!
  if (hideAccordionHeader) {
    return (
      <div className="w-full text-foreground select-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border/70 text-xs">
          {/* SECTION A: Company & Project Information (3 Cols) */}
          <div className="lg:col-span-3 p-3.5 space-y-2.5 bg-muted/10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4472C4]">
              Section A: Project Information
            </span>

            <div className="space-y-1.5 pt-0.5 text-[11px]">
              <div className="flex justify-between items-baseline py-0.5 border-b border-border/40">
                <span className="text-muted-foreground">Company:</span>
                <span className="font-semibold text-right truncate max-w-[170px]" title={companyName}>
                  {companyName}
                </span>
              </div>

              <div className="flex justify-between items-baseline py-0.5 border-b border-border/40">
                <span className="text-muted-foreground">Site / Location:</span>
                <span className="font-semibold text-right truncate max-w-[170px]" title={siteLocation}>
                  {siteLocation}
                </span>
              </div>

              <div className="flex justify-between items-baseline py-0.5 border-b border-border/40">
                <span className="text-muted-foreground">Project Manager:</span>
                <span className="font-semibold text-right">{projectManager}</span>
              </div>

              <div className="flex justify-between items-baseline py-0.5 border-b border-border/40">
                <span className="text-muted-foreground">Effective Date:</span>
                <span className="font-bold text-[#548235] text-right">{effectiveDate}</span>
              </div>

              <div className="flex justify-between items-baseline pt-0.5">
                <span className="text-muted-foreground">Total Personnel:</span>
                <span className="font-extrabold text-foreground">{summary.totalAvailable} Active</span>
              </div>
            </div>
          </div>

          {/* SECTION B: Manpower RAG Matrix (Live Derived) (6 Cols) */}
          <div className="lg:col-span-6 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#548235] flex items-center gap-1.5">
                <Users className="h-3 w-3" />
                Section B: Manpower RAG Matrix (Live Auto-Calculated)
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {summary.rows.length} Department{summary.rows.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="overflow-x-auto no-scrollbar border border-border/60 rounded-xl bg-card">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/60 text-[10px] uppercase font-bold text-muted-foreground">
                    <th className="py-1 px-2.5">Department</th>
                    <th className="py-1 px-1.5 text-center font-mono">Emp</th>
                    <th className="py-1 px-1.5 text-center font-mono">Cons</th>
                    <th className="py-1 px-1.5 text-center font-mono font-bold text-foreground">Avail</th>
                    <th className="py-1 px-1.5 text-center font-mono">Req</th>
                    <th className="py-1 px-1.5 text-center font-mono">Gap</th>
                    <th className="py-1 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {summary.rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-3 text-center text-xs text-muted-foreground italic">
                        No departments mapped. Total chart active headcount is shown below.
                      </td>
                    </tr>
                  ) : (
                    summary.rows.map((row) => (
                      <tr key={row.departmentName} className="hover:bg-muted/20 transition-colors">
                        <td className="py-1 px-2.5 font-semibold text-foreground truncate max-w-[140px]" title={row.departmentName}>
                          {row.departmentName}
                        </td>
                        <td className="py-1 px-1.5 text-center font-mono text-emerald-600">{row.employees}</td>
                        <td className="py-1 px-1.5 text-center font-mono text-amber-600">{row.consultants}</td>
                        <td className="py-1 px-1.5 text-center font-mono font-bold text-foreground">{row.available}</td>
                        <td className="py-1 px-1.5 text-center font-mono text-muted-foreground">{row.required}</td>
                        <td
                          className={cn(
                            "py-1 px-1.5 text-center font-mono font-bold",
                            row.gap < 0 ? "text-red-600" : row.gap > 0 ? "text-emerald-600" : "text-muted-foreground"
                          )}
                        >
                          {row.gap > 0 ? `+${row.gap}` : row.gap}
                        </td>
                        <td className="py-1 px-2 text-center">
                          <span
                            className={cn(
                              "inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase",
                              row.status === "GREEN"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : row.status === "AMBER"
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                : "bg-red-500/15 text-red-700 dark:text-red-300"
                            )}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                  {/* Totals Row */}
                  <tr className="bg-muted/30 font-bold border-t-2 border-border/80 text-[11px]">
                    <td className="py-1.5 px-2.5 text-foreground">Total Manpower</td>
                    <td className="py-1.5 px-1.5 text-center font-mono text-emerald-600">{summary.totalEmployees}</td>
                    <td className="py-1.5 px-1.5 text-center font-mono text-amber-600">{summary.totalConsultants}</td>
                    <td className="py-1.5 px-1.5 text-center font-mono font-black text-foreground">{summary.totalAvailable}</td>
                    <td className="py-1.5 px-1.5 text-center font-mono text-muted-foreground">{summary.totalRequired}</td>
                    <td
                      className={cn(
                        "py-1.5 px-1.5 text-center font-mono font-black",
                        summary.totalGap < 0 ? "text-red-600" : summary.totalGap > 0 ? "text-emerald-600" : "text-muted-foreground"
                      )}
                    >
                      {summary.totalGap > 0 ? `+${summary.totalGap}` : summary.totalGap}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <span
                        className={cn(
                          "inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase",
                          summary.ragStatus === "GREEN"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : summary.ragStatus === "AMBER"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                            : "bg-red-500/15 text-red-700 dark:text-red-300"
                        )}
                      >
                        {summary.ragStatus}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION C: Fleet & Infrastructure Matrix (3 Cols) */}
          <div className="lg:col-span-3 p-3.5 space-y-2 bg-muted/10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2E75B6] flex items-center gap-1.5">
              <Zap className="h-3 w-3" />
              Section C: Fleet &amp; Infrastructure
            </span>

            <div className="border border-border/60 rounded-xl bg-card overflow-hidden">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/60 text-[10px] uppercase font-bold text-muted-foreground">
                    <th className="py-1 px-2.5">Asset</th>
                    <th className="py-1 px-1.5 text-center font-mono">Req</th>
                    <th className="py-1 px-1.5 text-center font-mono">Avail</th>
                    <th className="py-1 px-1.5 text-center font-mono">Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  <tr>
                    <td className="py-1 px-2.5 font-semibold">Electric Vehicles</td>
                    <td className="py-1 px-1.5 text-center font-mono">{fleetVehicles.required}</td>
                    <td className="py-1 px-1.5 text-center font-mono font-bold text-foreground">{fleetVehicles.available}</td>
                    <td
                      className={cn(
                        "py-1 px-1.5 text-center font-mono font-bold",
                        vehicleGap < 0 ? "text-red-600" : "text-emerald-600"
                      )}
                    >
                      {vehicleGap > 0 ? `+${vehicleGap}` : vehicleGap}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2.5 font-semibold">EV Chargers</td>
                    <td className="py-1 px-1.5 text-center font-mono">{fleetChargers.required}</td>
                    <td className="py-1 px-1.5 text-center font-mono font-bold text-foreground">{fleetChargers.available}</td>
                    <td
                      className={cn(
                        "py-1 px-1.5 text-center font-mono font-bold",
                        chargerGap < 0 ? "text-red-600" : "text-emerald-600"
                      )}
                    >
                      {chargerGap > 0 ? `+${chargerGap}` : chargerGap}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2.5 font-semibold">Charging Bays</td>
                    <td className="py-1 px-1.5 text-center font-mono">{fleetInfra.required}</td>
                    <td className="py-1 px-1.5 text-center font-mono font-bold text-foreground">{fleetInfra.available}</td>
                    <td
                      className={cn(
                        "py-1 px-1.5 text-center font-mono font-bold",
                        infraGap < 0 ? "text-red-600" : "text-emerald-600"
                      )}
                    >
                      {infraGap > 0 ? `+${infraGap}` : infraGap}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md shadow-lg text-foreground overflow-hidden select-none">
      {/* Header Bar with Toggle */}
      <div className="h-10 px-4 bg-muted/30 border-b border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span>OPERATIONAL METRICS &amp; RAG MATRIX</span>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
              summary.ragStatus === "GREEN"
                ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10"
                : summary.ragStatus === "AMBER"
                ? "border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10"
                : "border-red-500/40 text-red-700 dark:text-red-300 bg-red-500/10"
            )}
          >
            {summary.ragStatus === "GREEN" ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : summary.ragStatus === "AMBER" ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            <span>{summary.ragLabel}</span>
          </Badge>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <span>{isExpanded ? "Collapse Metrics" : "Expand Metrics"}</span>
          {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Main 3 Sections */}
      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border/70 text-xs">
          {/* SECTION A: Company & Project Information (3 Cols) */}
          <div className="lg:col-span-3 p-4 space-y-3 bg-muted/10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4472C4]">
              Section A: Project Information
            </span>

            <div className="space-y-2 pt-1 text-[11px]">
              <div className="flex justify-between items-baseline py-0.5 border-b border-border/40">
                <span className="text-muted-foreground">Company:</span>
                <span className="font-semibold text-right truncate max-w-[170px]" title={companyName}>
                  {companyName}
                </span>
              </div>

              <div className="flex justify-between items-baseline py-0.5 border-b border-border/40">
                <span className="text-muted-foreground">Site / Location:</span>
                <span className="font-semibold text-right truncate max-w-[170px]" title={siteLocation}>
                  {siteLocation}
                </span>
              </div>

              <div className="flex justify-between items-baseline py-0.5 border-b border-border/40">
                <span className="text-muted-foreground">Project Manager:</span>
                <span className="font-semibold text-right">{projectManager}</span>
              </div>

              <div className="flex justify-between items-baseline py-0.5 border-b border-border/40">
                <span className="text-muted-foreground">Effective Date:</span>
                <span className="font-bold text-[#548235] text-right">{effectiveDate}</span>
              </div>

              <div className="flex justify-between items-baseline py-0.5">
                <span className="text-muted-foreground">Total Personnel:</span>
                <span className="font-mono font-bold text-foreground text-right">
                  {summary.totalAvailable} Active
                </span>
              </div>
            </div>
          </div>

          {/* SECTION B: Manpower RAG Matrix (6 Cols) */}
          <div className="lg:col-span-6 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#548235] flex items-center gap-1.5">
                <Users className="h-3 w-3" />
                Section B: Manpower RAG Matrix (Live Auto-Calculated)
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {summary.rows.length} Departments
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border/80">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-muted/60 text-muted-foreground text-[10px] font-semibold border-b border-border">
                    <th className="py-1.5 px-2.5">Department</th>
                    <th className="py-1.5 px-2 text-center">Emp</th>
                    <th className="py-1.5 px-2 text-center">Cons</th>
                    <th className="py-1.5 px-2 text-center font-bold text-foreground">Avail</th>
                    <th className="py-1.5 px-2 text-center">Req</th>
                    <th className="py-1.5 px-2 text-center font-bold">Gap</th>
                    <th className="py-1.5 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-medium">
                  {summary.rows.map((row) => (
                    <tr key={row.departmentId} className="hover:bg-muted/40 transition-colors">
                      <td className="py-1.5 px-2.5 truncate max-w-[160px] font-semibold text-foreground">
                        {row.departmentName}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono text-[#16a34a]">{row.employees}</td>
                      <td className="py-1.5 px-2 text-center font-mono text-[#ea580c]">{row.consultants}</td>
                      <td className="py-1.5 px-2 text-center font-mono font-bold text-foreground">{row.available}</td>
                      <td className="py-1.5 px-2 text-center font-mono text-muted-foreground">{row.required}</td>
                      <td
                        className={cn(
                          "py-1.5 px-2 text-center font-mono font-bold",
                          row.gap < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                        )}
                      >
                        {row.gap > 0 ? `+${row.gap}` : row.gap}
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <span
                          className={cn(
                            "inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                            row.gap < 0
                              ? "bg-red-500/10 text-red-700 dark:text-red-300"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          )}
                        >
                          {row.gap < 0 ? `-${Math.abs(row.gap)} Vac` : "Full"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-muted/50 font-bold border-t-2 border-border text-foreground">
                    <td className="py-1.5 px-2.5">Total Manpower</td>
                    <td className="py-1.5 px-2 text-center font-mono text-[#16a34a]">{summary.totalEmployees}</td>
                    <td className="py-1.5 px-2 text-center font-mono text-[#ea580c]">{summary.totalConsultants}</td>
                    <td className="py-1.5 px-2 text-center font-mono text-foreground">{summary.totalAvailable}</td>
                    <td className="py-1.5 px-2 text-center font-mono text-muted-foreground">{summary.totalRequired}</td>
                    <td
                      className={cn(
                        "py-1.5 px-2 text-center font-mono",
                        summary.totalGap < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {summary.totalGap > 0 ? `+${summary.totalGap}` : summary.totalGap}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <span
                        className={cn(
                          "inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                          summary.totalGap < 0 ? "bg-red-500/20 text-red-700" : "bg-emerald-500/20 text-emerald-700"
                        )}
                      >
                        {summary.ragStatus}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION C: Fleet & Infrastructure (3 Cols) */}
          <div className="lg:col-span-3 p-4 space-y-2 bg-muted/10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <Zap className="h-3 w-3" />
              Section C: Fleet &amp; Infrastructure
            </span>

            <div className="overflow-x-auto rounded-lg border border-border/80">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-muted/60 text-muted-foreground text-[10px] font-semibold border-b border-border">
                    <th className="py-1.5 px-2">Asset</th>
                    <th className="py-1.5 px-1.5 text-center">Req</th>
                    <th className="py-1.5 px-1.5 text-center">Avail</th>
                    <th className="py-1.5 px-1.5 text-center font-bold">Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-medium">
                  <tr>
                    <td className="py-1.5 px-2 font-semibold">Electric Vehicles</td>
                    <td className="py-1.5 px-1.5 text-center font-mono">{fleetVehicles.required}</td>
                    <td className="py-1.5 px-1.5 text-center font-mono font-bold text-foreground">{fleetVehicles.available}</td>
                    <td
                      className={cn(
                        "py-1.5 px-1.5 text-center font-mono font-bold",
                        vehicleGap < 0 ? "text-red-600" : "text-emerald-600"
                      )}
                    >
                      {vehicleGap > 0 ? `+${vehicleGap}` : vehicleGap}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 font-semibold">EV Chargers</td>
                    <td className="py-1.5 px-1.5 text-center font-mono">{fleetChargers.required}</td>
                    <td className="py-1.5 px-1.5 text-center font-mono font-bold text-foreground">{fleetChargers.available}</td>
                    <td
                      className={cn(
                        "py-1.5 px-1.5 text-center font-mono font-bold",
                        chargerGap < 0 ? "text-red-600" : "text-emerald-600"
                      )}
                    >
                      {chargerGap > 0 ? `+${chargerGap}` : chargerGap}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 font-semibold">Charging Bays</td>
                    <td className="py-1.5 px-1.5 text-center font-mono">{fleetInfra.required}</td>
                    <td className="py-1.5 px-1.5 text-center font-mono font-bold text-foreground">{fleetInfra.available}</td>
                    <td
                      className={cn(
                        "py-1.5 px-1.5 text-center font-mono font-bold",
                        infraGap < 0 ? "text-red-600" : "text-emerald-600"
                      )}
                    >
                      {infraGap > 0 ? `+${infraGap}` : infraGap}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
