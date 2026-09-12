"use client"

import * as React from "react"
import { OrgNode } from "@/lib/org-chart/types"
import {
  Building2,
  MoreHorizontal,
  UserPlus,
  Trash2,
  Edit2,
  Copy,
  GitFork,
  ArrowDownCircle,
  Plus,
} from "lucide-react"
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
  onAddEmployee?: (departmentId: string) => void
  onAddChildDept?: (parentId: string) => void
}

export function DepartmentNode({
  node,
  isSelected,
  onSelect,
  onEdit,
  onChangeParent,
  onDuplicate,
  onDelete,
  onConnect,
  onAddEmployee,
  onAddChildDept,
}: NodeProps) {
  return (
    <div
      onClick={(e) => onSelect(node, e)}
      className={cn(
        "group relative flex flex-col justify-center px-3 py-2 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing transition-all select-none",
        "bg-[#2563EB] dark:bg-[#1D4ED8] border-[#1D4ED8] text-white",
        isSelected && "ring-2 ring-emerald-500 ring-offset-2 border-white shadow-xl scale-[1.02]"
      )}
      style={{
        width: node.width || 190,
        height: node.height || 52,
      }}
    >
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/15 text-white">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate text-white leading-tight">
              {node.label}
            </p>
            {node.metadata.code && (
              <span className="text-[9px] uppercase tracking-wider text-blue-200">
                {node.metadata.code}
              </span>
            )}
          </div>
        </div>

        {/* Action Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="h-6 w-6 flex items-center justify-center rounded text-white/70 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {onAddEmployee && (
              <DropdownMenuItem
                onClick={() => onAddEmployee(node.id)}
                className="gap-2 text-xs font-medium text-emerald-600 focus:text-emerald-700"
              >
                <UserPlus className="h-3.5 w-3.5" /> + Add Employee
              </DropdownMenuItem>
            )}
            {onAddChildDept && (
              <DropdownMenuItem onClick={() => onAddChildDept(node.id)} className="gap-2 text-xs">
                <Plus className="h-3.5 w-3.5" /> + Add Sub-Department
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(node)} className="gap-2 text-xs">
                <Edit2 className="h-3.5 w-3.5" /> Edit Department
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

      {/* Top & Bottom Connecting Ports */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-300 border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  )
}
