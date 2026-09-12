"use client"

import * as React from "react"
import { OrgNode } from "@/lib/org-chart/types"
import { cn } from "@/lib/utils"

interface DepartmentTileV2Props {
  node: OrgNode
  isSelected?: boolean
  onClick?: () => void
}

export function DepartmentTileV2({ node, isSelected, onClick }: DepartmentTileV2Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative select-none rounded-lg bg-[#1e40af] text-white px-4 py-2.5 transition-all duration-150 flex flex-col justify-center items-center cursor-pointer shadow-md min-w-[170px] max-w-[220px] min-h-[46px] border border-blue-950",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      title={node.label}
    >
      <div className="font-bold text-xs sm:text-sm text-center text-white tracking-wide leading-snug">
        {node.label}
      </div>
      {node.metadata.departmentCode && (
        <div className="text-[10px] text-blue-200 mt-0.5 font-medium">
          {node.metadata.departmentCode}
        </div>
      )}
    </div>
  )
}
