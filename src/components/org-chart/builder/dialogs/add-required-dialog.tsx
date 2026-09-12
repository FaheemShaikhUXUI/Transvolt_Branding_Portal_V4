"use client"

import * as React from "react"
import { OrgNode, EmploymentType } from "@/lib/org-chart/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

interface AddRequiredDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingNodes: OrgNode[]
  defaultParentId?: string | null
  onAdd: (data: {
    designation: string
    quantity: number
    employmentType: EmploymentType
    parentId: string | null
  }) => void
}

export function AddRequiredDialog({
  open,
  onOpenChange,
  existingNodes,
  defaultParentId,
  onAdd,
}: AddRequiredDialogProps) {
  const [designation, setDesignation] = React.useState("")
  const [quantity, setQuantity] = React.useState<number>(1)
  const [employmentType, setEmploymentType] = React.useState<EmploymentType>("EMPLOYEE")
  const [parentId, setParentId] = React.useState<string | null>(defaultParentId || null)

  React.useEffect(() => {
    if (open) {
      setDesignation("")
      setQuantity(1)
      setEmploymentType("EMPLOYEE")
      setParentId(defaultParentId || null)
    }
  }, [open, defaultParentId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!designation.trim() || quantity < 1) return
    onAdd({
      designation: designation.trim(),
      quantity,
      employmentType,
      parentId: parentId || null,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Add Required Position</DialogTitle>
              <DialogDescription className="text-xs">
                Specify sanctioned headcount or open vacancy positions for manpower planning.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Position / Designation *</label>
            <input
              type="text"
              required
              placeholder="e.g. EV Charger Specialist, Bus Pilot, Store Keeper"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Required Quantity *</label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Engagement Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="EMPLOYEE">● Regular Employee</option>
                <option value="CONSULTANT">● Consultant / Outsource</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Under Which Department / Section?</label>
            <select
              value={parentId || ""}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">(None / Direct Parent)</option>
              {existingNodes.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.type}] {p.label}
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
              className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
            >
              Add Required Position
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
