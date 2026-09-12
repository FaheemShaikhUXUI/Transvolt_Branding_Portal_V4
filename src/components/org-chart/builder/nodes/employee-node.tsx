"use client"

import * as React from "react"
import { OrgNode } from "@/lib/org-chart/types"
import { User, MoreHorizontal, Trash2, Edit2, Copy, GitFork, ArrowDownCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface NodeProps {
  node: OrgNode
  isSelected: boolean
  onSelect: (node: OrgNode, e: React.MouseEvent) => void
  onEdit?: (node: OrgNode) => void
  onChangeParent?: (node: OrgNode) => void
  onDuplicate?: (node: OrgNode) => void
  onDelete?: (node: OrgNode) => void
  onConnect?: (node: OrgNode) => void
}

export function EmployeeNode({
  node,
  isSelected,
  onSelect,
  onEdit,
  onChangeParent,
  onDuplicate,
  onDelete,
  onConnect,
}: NodeProps) {
  return (
    <div
      onClick={(e) => onSelect(node, e)}
      className={cn(
        "group relative flex flex-col justify-between p-2.5 rounded-lg border shadow-xs cursor-grab active:cursor-grabbing transition-all select-none",
        "bg-card border-border/80 text-card-foreground hover:border-foreground/30 hover:shadow-md",
        isSelected && "ring-2 ring-emerald-500 ring-offset-2 border-emerald-500 shadow-lg scale-[1.02]"
      )}
      style={{
        width: node.width || 190,
        height: node.height || 64,
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <User className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate text-foreground leading-tight">
              {node.label}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {node.metadata.designation || "Staff"}
            </p>
          </div>
        </div>

        {/* Action Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(node)} className="gap-2 text-xs">
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
            )}
            {onChangeParent && (
              <DropdownMenuItem onClick={() => onChangeParent(node)} className="gap-2 text-xs">
                <GitFork className="h-3.5 w-3.5" /> Change Reports To
              </DropdownMenuItem>
            )}
            {onConnect && (
              <DropdownMenuItem onClick={() => onConnect(node)} className="gap-2 text-xs">
                <ArrowDownCircle className="h-3.5 w-3.5" /> Connect to...
              </DropdownMenuItem>
            )}
            {onDuplicate && (
              <DropdownMenuItem onClick={() => onDuplicate(node)} className="gap-2 text-xs">
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(node)}
                className="gap-2 text-xs text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/40">
        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Employee
        </span>
        {node.metadata.employeeId && (
          <span className="text-[9px] text-muted-foreground font-mono">
            {node.metadata.employeeId}
          </span>
        )}
      </div>

      {/* Connection Ports */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-border border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  )
}
