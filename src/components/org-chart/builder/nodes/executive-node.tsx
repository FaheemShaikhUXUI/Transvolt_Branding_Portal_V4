"use client"

import * as React from "react"
import { OrgNode } from "@/lib/org-chart/types"
import { Shield, MoreHorizontal, ArrowDownCircle, Trash2, Edit2, Copy, GitFork } from "lucide-react"
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

export function ExecutiveNode({
  node,
  isSelected,
  onSelect,
  onEdit,
  onChangeParent,
  onDuplicate,
  onDelete,
  onConnect,
}: NodeProps) {
  const isCeo = node.label.toLowerCase().includes("ceo") || node.label.toLowerCase().includes("chief")

  return (
    <div
      onClick={(e) => onSelect(node, e)}
      className={cn(
        "group relative flex flex-col justify-center px-4 py-2.5 rounded-lg border-2 shadow-md cursor-grab active:cursor-grabbing transition-all select-none",
        isCeo ? "bg-slate-900 border-slate-700 text-white" : "bg-blue-950 border-blue-800 text-white",
        isSelected && "ring-2 ring-[#4472C4] ring-offset-2 border-white shadow-xl"
      )}
      style={{
        width: node.width || 220,
        height: node.height || 64,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-emerald-400">
            <Shield className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold truncate text-white leading-tight">
              {node.label}
            </p>
            <p className="text-[10px] text-slate-300 truncate mt-0.5">
              {node.metadata.designation || "Executive Office"}
            </p>
          </div>
        </div>

        {/* Action Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="h-6 w-6 flex items-center justify-center rounded text-white/60 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
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
                <GitFork className="h-3.5 w-3.5" /> Change Parent
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

      {/* Connecting Ports */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-400 border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  )
}
