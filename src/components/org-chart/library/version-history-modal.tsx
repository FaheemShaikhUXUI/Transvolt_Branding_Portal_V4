"use client"

import * as React from "react"
import { OrganizationChart } from "@/lib/org-chart/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, Eye, Edit3, Copy, Download, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface VersionHistoryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  siteName: string
  siteLocation: string
  versions: OrganizationChart[]
  onOpenChart: (chart: OrganizationChart) => void
  onDuplicateChart: (chart: OrganizationChart) => void
  onExportChart: (chart: OrganizationChart) => void
}

export function VersionHistoryModal({
  open,
  onOpenChange,
  siteName,
  siteLocation,
  versions,
  onOpenChart,
  onDuplicateChart,
  onExportChart,
}: VersionHistoryProps) {
  // Sort versions by effective date descending
  const sorted = [...versions].sort(
    (a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime()
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <History className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Chart Version History</DialogTitle>
              <DialogDescription className="text-xs">
                Audit trail and historical organization structures for {siteLocation}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 space-y-3">
          {sorted.map((item) => {
            const isCurrent = item.status === "CURRENT"

            return (
              <div
                key={item.id}
                className={cn(
                  "flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border transition-all gap-3",
                  isCurrent
                    ? "border-emerald-500/40 bg-emerald-500/5 shadow-xs"
                    : "border-border/80 bg-card hover:bg-muted/40"
                )}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground truncate">
                      {item.version}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold uppercase",
                        isCurrent && "border-emerald-500 text-emerald-600 bg-emerald-500/10",
                        item.status === "ARCHIVED" && "border-slate-400 text-slate-500",
                        item.status === "DRAFT" && "border-amber-500 text-amber-600",
                        item.status === "FUTURE" && "border-blue-500 text-blue-600"
                      )}
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground truncate">{item.title}</p>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Effective: <strong>{item.effectiveFrom}</strong>
                    </span>
                    <span>&bull;</span>
                    <span>By: {item.updatedBy || item.createdBy}</span>
                  </div>

                  {item.changeSummary && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic pt-1">
                      &ldquo;{item.changeSummary}&rdquo;
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onOpenChart(item)
                      onOpenChange(false)
                    }}
                    className="h-7 px-2 text-xs gap-1 cursor-pointer"
                    title="Open in Builder"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Open</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onDuplicateChart(item)
                      onOpenChange(false)
                    }}
                    className="h-7 px-2 text-xs cursor-pointer text-muted-foreground hover:text-foreground"
                    title="Duplicate as new chart"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onExportChart(item)}
                    className="h-7 px-2 text-xs cursor-pointer text-muted-foreground hover:text-foreground"
                    title="Download PDF"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter className="pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
