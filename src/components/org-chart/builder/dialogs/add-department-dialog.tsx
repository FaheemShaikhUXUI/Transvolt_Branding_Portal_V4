"use client"

import * as React from "react"
import { OrgNode } from "@/lib/org-chart/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"

interface AddDepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingNodes: OrgNode[]
  defaultParentId?: string | null
  onAdd: (deptData: { name: string; code?: string; parentId: string | null }) => void
}

export function AddDepartmentDialog({
  open,
  onOpenChange,
  existingNodes,
  defaultParentId,
  onAdd,
}: AddDepartmentDialogProps) {
  const [name, setName] = React.useState("")
  const [code, setCode] = React.useState("")
  const [parentId, setParentId] = React.useState<string | null>(defaultParentId || null)

  React.useEffect(() => {
    if (open) {
      setName("")
      setCode("")
      setParentId(defaultParentId || null)
    }
  }, [open, defaultParentId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({
      name: name.trim(),
      code: code.trim() || undefined,
      parentId: parentId || null,
    })
    onOpenChange(false)
  }

  // Potential parent nodes: Executive, Management, Department
  const eligibleParents = existingNodes.filter(
    (n) => n.type === "EXECUTIVE" || n.type === "MANAGEMENT" || n.type === "DEPARTMENT"
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Add Department</DialogTitle>
              <DialogDescription className="text-xs">
                Create a department card and position it under a reporting section.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Department Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Operations, Engineering & Maintenance, Store"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Department Code (Optional)</label>
            <input
              type="text"
              placeholder="e.g. OPS-03, EM-01"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Under Which Section / Parent?</label>
            <select
              value={parentId || ""}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">(None - Top Level)</option>
              {eligibleParents.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.type}] {p.label} {p.metadata.designation ? `(${p.metadata.designation})` : ""}
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
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer"
            >
              Add Department
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
