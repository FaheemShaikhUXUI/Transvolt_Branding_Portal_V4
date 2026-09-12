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
import { Link2, ArrowRight } from "lucide-react"

interface ConnectNodesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingNodes: OrgNode[]
  initialSourceNodeId?: string | null
  onConnect: (sourceId: string, targetId: string) => void
}

export function ConnectNodesDialog({
  open,
  onOpenChange,
  existingNodes,
  initialSourceNodeId,
  onConnect,
}: ConnectNodesDialogProps) {
  const [sourceId, setSourceId] = React.useState<string>("")
  const [targetId, setTargetId] = React.useState<string>("")

  React.useEffect(() => {
    if (open) {
      setSourceId(initialSourceNodeId || (existingNodes[0]?.id ?? ""))
      setTargetId(existingNodes.length > 1 ? existingNodes[1].id : "")
    }
  }, [open, initialSourceNodeId, existingNodes])

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourceId || !targetId || sourceId === targetId) return
    onConnect(sourceId, targetId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Link2 className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Connect Hierarchy Nodes</DialogTitle>
              <DialogDescription className="text-xs">
                Draw a dynamic connecting arrow between two organization entities.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleConnectSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">FROM (Reporting Parent)</label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {existingNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  [{n.type}] {n.label} {n.metadata.designation ? `(${n.metadata.designation})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center text-muted-foreground">
            <ArrowRight className="h-4 w-4 rotate-90 sm:rotate-0" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">TO (Reporting Child)</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {existingNodes.map((n) => (
                <option key={n.id} value={n.id} disabled={n.id === sourceId}>
                  [{n.type}] {n.label} {n.metadata.designation ? `(${n.metadata.designation})` : ""}
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
              disabled={!sourceId || !targetId || sourceId === targetId}
              className="bg-primary text-primary-foreground cursor-pointer"
            >
              Connect
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
