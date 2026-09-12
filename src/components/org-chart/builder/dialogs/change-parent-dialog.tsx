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
import { GitFork } from "lucide-react"

interface ChangeParentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetNode: OrgNode | null
  existingNodes: OrgNode[]
  onChangeParent: (nodeId: string, newParentId: string | null) => void
}

export function ChangeParentDialog({
  open,
  onOpenChange,
  targetNode,
  existingNodes,
  onChangeParent,
}: ChangeParentDialogProps) {
  const [selectedParentId, setSelectedParentId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (targetNode) {
      setSelectedParentId(targetNode.parentId)
    }
  }, [targetNode, open])

  if (!targetNode) return null

  // Prevent circular hierarchy: node cannot report to itself or its descendants
  const getDescendantIds = (nodeId: string): string[] => {
    const directChildren = existingNodes.filter((n) => n.parentId === nodeId).map((n) => n.id)
    const subChildren = directChildren.flatMap(getDescendantIds)
    return [...directChildren, ...subChildren]
  }

  const invalidParentIds = new Set([targetNode.id, ...getDescendantIds(targetNode.id)])
  const eligibleParents = existingNodes.filter((n) => !invalidParentIds.has(n.id))

  const handleSave = () => {
    onChangeParent(targetNode.id, selectedParentId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GitFork className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Change Reporting Hierarchy</DialogTitle>
              <DialogDescription className="text-xs">
                Restructure who &ldquo;{targetNode.label}&rdquo; reports to.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="rounded-md border bg-muted/40 p-3 text-xs">
            <p className="font-semibold text-foreground">Target Node: {targetNode.label}</p>
            <p className="text-muted-foreground mt-0.5">
              Type: {targetNode.type} &bull; Current Parent:{" "}
              {existingNodes.find((n) => n.id === targetNode.parentId)?.label || "None (Root)"}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Select New Parent / Section</label>
            <select
              value={selectedParentId || ""}
              onChange={(e) => setSelectedParentId(e.target.value || null)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">(None - Top Level Node)</option>
              {eligibleParents.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.type}] {p.label} {p.metadata.designation ? `— ${p.metadata.designation}` : ""}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground">
              Circular dependencies are prevented automatically.
            </p>
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
              type="button"
              size="sm"
              onClick={handleSave}
              className="bg-primary text-primary-foreground cursor-pointer"
            >
              Update Parent
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
