"use client"

import * as React from "react"
import { OrganizationChart } from "@/lib/org-chart/types"
import { useCompanyMaster } from "@/lib/company-master/company-master-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

interface DuplicateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceChart: OrganizationChart | null
  onDuplicate: (
    sourceChartId: string,
    targetSiteId: string,
    targetSiteName: string,
    targetSiteLocation: string,
    newTitle: string
  ) => void
}

export function DuplicateChartModal({
  open,
  onOpenChange,
  sourceChart,
  onDuplicate,
}: DuplicateModalProps) {
  const { companies } = useCompanyMaster()
  const [selectedSiteId, setSelectedSiteId] = React.useState("")
  const [newTitle, setNewTitle] = React.useState("")

  React.useEffect(() => {
    if (sourceChart && open) {
      setSelectedSiteId(companies[0]?.id || "")
      setNewTitle(`Copy of ${sourceChart.title}`)
    }
  }, [sourceChart, open, companies])

  if (!sourceChart) return null

  const handleDuplicateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const target = companies.find((c) => c.id === selectedSiteId) || companies[0]
    if (!target || !newTitle.trim()) return

    onDuplicate(
      sourceChart.id,
      target.id,
      target.companyName,
      target.siteLocation,
      newTitle.trim()
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Copy className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Duplicate Organization Chart</DialogTitle>
              <DialogDescription className="text-xs">
                Clone this structure, departments, and footer matrices to another site or draft.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleDuplicateSubmit} className="space-y-4 pt-2">
          <div className="rounded-md border bg-muted/40 p-3 text-xs">
            <p className="font-semibold text-foreground">Source: {sourceChart.title}</p>
            <p className="text-muted-foreground mt-0.5">
              Original Site: {sourceChart.siteLocation} &bull; Version: {sourceChart.version}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">New Chart Title *</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Which Site / Location Should This Chart Belong To? *
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.siteLocation} &mdash; {c.companyName}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-primary text-primary-foreground cursor-pointer font-bold"
            >
              Clone Structure
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
