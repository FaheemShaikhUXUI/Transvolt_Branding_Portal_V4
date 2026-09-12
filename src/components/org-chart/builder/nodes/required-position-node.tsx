"use client"

import * as React from "react"
import { OrgNode } from "@/lib/org-chart/types"
import { HelpCircle, MoreHorizontal, Trash2, Edit2, Copy, GitFork, ArrowDownCircle } from "lucide-react"
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

export function RequiredPositionNode({
  node,
  isSelected,
  onSelect,
  onEdit,
  onChangeParent,
  onDuplicate,
  onDelete,
  onConnect,
}: NodeProps) {
  const qty = node.metadata.requiredQuantity || 1

  return (
    <div
      onClick={(e) => onSelect(node, e)}
      className={cn(
        "group relative flex flex-col justify-between p-2.5 rounded-lg border-2 border-dashed shadow-xs cursor-grab active:cursor-grabbing transition-all select-none",
        "bg-amber-500/5 dark:bg-amber-950/20 border-amber-400/70 dark:border-amber-700/60 text-card-foreground hover:border-amber-500 hover:shadow-md",
        isSelected && "ring-2 ring-amber-500 ring-offset-2 border-amber-600 shadow-lg scale-[1.02]"
      )}
      style={{
        width: node.width || 190,
        height: node.height || 60,
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <HelpCircle className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate text-foreground leading-tight">
              {node.label}
            </p>
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium truncate">
              {node.metadata.employmentType === "CONSULTANT" ? "Consultant Vacancy" : "Open Position"}
            </p>
          </div>
        </div>

        {/* Action Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="h-5 w-5 flex items-center justify-center rounded text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(node)} className="gap-2 text-xs">
                <Edit2 className="h-3.5 w-3.5" /> Edit Vacancy
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

      <div className="flex items-center justify-between mt-1 pt-1 border-t border-amber-200 dark:border-amber-800/40">
        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800 dark:text-amber-300">
          <span className="w-2 h-2 rounded-full border border-amber-600 dark:border-amber-400 bg-amber-100 dark:bg-amber-900/50" />
          Required
        </span>
        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-900 dark:text-amber-200">
          Qty: {qty}
        </span>
      </div>

      {/* Connection Ports */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-600 border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  )
}
