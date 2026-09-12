"use client"

import * as React from "react"
import { OrgFooter } from "@/lib/org-chart/types"
import { Plus, Trash2, Edit2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FooterProps {
  footer: OrgFooter
  isEditable?: boolean
  onUpdateFooter?: (updated: OrgFooter) => void
}

export function CanvasFooter({ footer, isEditable = true, onUpdateFooter }: FooterProps) {
  if (!footer.enabled) return null

  const handleCellChange = (rowKey: "REQUIRED" | "AVAILABLE" | "GAP", colId: string, value: number) => {
    if (!onUpdateFooter) return
    const updatedRows = footer.manpowerRows.map((r) => {
      if (r.key === rowKey) {
        return {
          ...r,
          values: {
            ...r.values,
            [colId]: value,
          },
        }
      }
      return r
    })

    // Recalculate GAP row
    const reqRow = updatedRows.find((r) => r.key === "REQUIRED")
    const avlRow = updatedRows.find((r) => r.key === "AVAILABLE")
    const gapRow = updatedRows.find((r) => r.key === "GAP")

    if (reqRow && avlRow && gapRow) {
      footer.manpowerColumns.forEach((col) => {
        const req = reqRow.values[col.id] || 0
        const avl = avlRow.values[col.id] || 0
        gapRow.values[col.id] = avl - req
      })
    }

    onUpdateFooter({
      ...footer,
      manpowerRows: updatedRows,
    })
  }

  const handleAddColumn = () => {
    if (!onUpdateFooter) return
    const colName = prompt("Enter new column name (e.g. Technicians, Trainees):")
    if (!colName) return
    const colId = `col_${Date.now()}`
    const updatedCols = [...footer.manpowerColumns, { id: colId, label: colName }]
    const updatedRows = footer.manpowerRows.map((r) => ({
      ...r,
      values: { ...r.values, [colId]: 0 },
    }))
    onUpdateFooter({
      ...footer,
      manpowerColumns: updatedCols,
      manpowerRows: updatedRows,
    })
  }

  const handleVehicleChange = (type: "vehicles" | "chargers", field: "required" | "available", val: number) => {
    if (!onUpdateFooter) return
    onUpdateFooter({
      ...footer,
      vehicleMatrix: {
        ...footer.vehicleMatrix,
        [type]: {
          ...footer.vehicleMatrix[type],
          [field]: val,
        },
      },
    })
  }

  return (
    <div className="w-full mt-10 rounded-xl border border-border/80 bg-card p-5 shadow-sm text-foreground space-y-5">
      {/* 3 Main Grid Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* BLOCK 1: Project Information (4 Cols) */}
        <div className="md:col-span-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border/70 pb-4 md:pb-0 md:pr-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4472C4]">
              Project Information
            </span>
            <div className="mt-2 space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Project Name:</span>
                <span className="font-bold text-right truncate max-w-[200px]">
                  {footer.projectInfo.projectName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium text-right">{footer.projectInfo.projectLocation}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Project Code:</span>
                <span className="font-mono text-right">{footer.projectInfo.projectCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Project Manager:</span>
                <span className="font-semibold text-right">{footer.projectInfo.projectManager}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Effective Date:</span>
                <span className="font-bold text-[#548235] text-right">
                  {footer.projectInfo.effectiveDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BLOCK 2: Manpower RAG Matrix (5 Cols) */}
        <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-border/70 pb-4 md:pb-0 md:pr-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#548235]">
              Manpower RAG Matrix
            </span>
            {isEditable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddColumn}
                className="h-6 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Add Column
              </Button>
            )}
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-muted/60 text-muted-foreground text-[10px] uppercase font-bold">
                  <th className="p-1.5 text-left rounded-l">Status</th>
                  {footer.manpowerColumns.map((col) => (
                    <th key={col.id} className="p-1.5 px-2">
                      {col.label}
                    </th>
                  ))}
                  <th className="p-1.5 rounded-r bg-muted">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {footer.manpowerRows.map((row) => {
                  let total = 0
                  footer.manpowerColumns.forEach((c) => {
                    total += row.values[c.id] || 0
                  })

                  const isGap = row.key === "GAP"
                  const isReq = row.key === "REQUIRED"

                  return (
                    <tr key={row.key} className={cn(isGap && "bg-muted/30 font-bold")}>
                      <td className="p-1.5 text-left font-semibold">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1",
                            isReq && "text-slate-700 dark:text-slate-200",
                            row.key === "AVAILABLE" && "text-emerald-600 dark:text-emerald-400",
                            isGap && (total < 0 ? "text-rose-600" : "text-emerald-600")
                          )}
                        >
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full",
                              isReq && "bg-slate-500",
                              row.key === "AVAILABLE" && "bg-emerald-500",
                              isGap && (total < 0 ? "bg-rose-500" : "bg-emerald-500")
                            )}
                          />
                          {row.label}
                        </span>
                      </td>

                      {footer.manpowerColumns.map((col) => {
                        const val = row.values[col.id] ?? 0
                        return (
                          <td key={col.id} className="p-1.5">
                            {isEditable && !isGap ? (
                              <input
                                type="number"
                                value={val}
                                onChange={(e) =>
                                  handleCellChange(row.key, col.id, parseInt(e.target.value) || 0)
                                }
                                className="w-12 text-center bg-muted/40 border border-border/60 rounded px-1 py-0.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            ) : (
                              <span
                                className={cn(
                                  isGap && val < 0 && "text-rose-600 font-bold",
                                  isGap && val >= 0 && "text-emerald-600 font-bold"
                                )}
                              >
                                {val}
                              </span>
                            )}
                          </td>
                        )
                      })}

                      <td
                        className={cn(
                          "p-1.5 font-bold bg-muted/40",
                          isGap && total < 0 && "text-rose-600",
                          isGap && total >= 0 && "text-emerald-600"
                        )}
                      >
                        {total}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* BLOCK 3: Vehicles & Chargers Matrix (3 Cols) */}
        <div className="md:col-span-3 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4472C4]">
              Fleet & Infrastructure
            </span>
            <table className="w-full mt-2 text-xs text-center border-collapse">
              <thead>
                <tr className="bg-muted/60 text-muted-foreground text-[10px] uppercase font-bold">
                  <th className="p-1.5 text-left rounded-l">Asset</th>
                  <th className="p-1.5">Req</th>
                  <th className="p-1.5">Avl</th>
                  <th className="p-1.5 rounded-r bg-muted">Gap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {/* Vehicles Row */}
                <tr>
                  <td className="p-1.5 text-left font-semibold">Vehicles</td>
                  <td className="p-1.5">
                    {isEditable ? (
                      <input
                        type="number"
                        value={footer.vehicleMatrix.vehicles.required}
                        onChange={(e) =>
                          handleVehicleChange("vehicles", "required", parseInt(e.target.value) || 0)
                        }
                        className="w-10 text-center bg-muted/40 border border-border/60 rounded py-0.5 text-xs"
                      />
                    ) : (
                      footer.vehicleMatrix.vehicles.required
                    )}
                  </td>
                  <td className="p-1.5">
                    {isEditable ? (
                      <input
                        type="number"
                        value={footer.vehicleMatrix.vehicles.available}
                        onChange={(e) =>
                          handleVehicleChange("vehicles", "available", parseInt(e.target.value) || 0)
                        }
                        className="w-10 text-center bg-muted/40 border border-border/60 rounded py-0.5 text-xs"
                      />
                    ) : (
                      footer.vehicleMatrix.vehicles.available
                    )}
                  </td>
                  <td
                    className={cn(
                      "p-1.5 font-bold",
                      footer.vehicleMatrix.vehicles.available - footer.vehicleMatrix.vehicles.required < 0
                        ? "text-rose-600"
                        : "text-emerald-600"
                    )}
                  >
                    {footer.vehicleMatrix.vehicles.available - footer.vehicleMatrix.vehicles.required}
                  </td>
                </tr>

                {/* Chargers Row */}
                <tr>
                  <td className="p-1.5 text-left font-semibold">Chargers</td>
                  <td className="p-1.5">
                    {isEditable ? (
                      <input
                        type="number"
                        value={footer.vehicleMatrix.chargers.required}
                        onChange={(e) =>
                          handleVehicleChange("chargers", "required", parseInt(e.target.value) || 0)
                        }
                        className="w-10 text-center bg-muted/40 border border-border/60 rounded py-0.5 text-xs"
                      />
                    ) : (
                      footer.vehicleMatrix.chargers.required
                    )}
                  </td>
                  <td className="p-1.5">
                    {isEditable ? (
                      <input
                        type="number"
                        value={footer.vehicleMatrix.chargers.available}
                        onChange={(e) =>
                          handleVehicleChange("chargers", "available", parseInt(e.target.value) || 0)
                        }
                        className="w-10 text-center bg-muted/40 border border-border/60 rounded py-0.5 text-xs"
                      />
                    ) : (
                      footer.vehicleMatrix.chargers.available
                    )}
                  </td>
                  <td
                    className={cn(
                      "p-1.5 font-bold",
                      footer.vehicleMatrix.chargers.available - footer.vehicleMatrix.chargers.required < 0
                        ? "text-rose-600"
                        : "text-emerald-600"
                    )}
                  >
                    {footer.vehicleMatrix.chargers.available - footer.vehicleMatrix.chargers.required}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Legend & Notes Bar */}
      <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
          <span className="font-bold text-foreground text-[10px] uppercase tracking-wider">Legend:</span>
          {footer.legendItems.map((leg) => (
            <div key={leg.id} className="flex items-center gap-1.5">
              {leg.indicator === "dot" && (
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: leg.color }} />
              )}
              {leg.indicator === "ring" && (
                <span className="w-2 h-2 rounded-full border-2" style={{ borderColor: leg.color }} />
              )}
              {leg.indicator === "square" && (
                <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: leg.color }} />
              )}
              <span className="text-[11px] font-medium text-foreground">{leg.label}</span>
            </div>
          ))}
        </div>

        {footer.customNotes && (
          <p className="text-[11px] italic text-muted-foreground max-w-md truncate">
            {footer.customNotes}
          </p>
        )}
      </div>
    </div>
  )
}
