"use client"

import * as React from "react"
import { OrgNode } from "@/lib/org-chart/types"
import { cn } from "@/lib/utils"

interface ExecutiveTileV2Props {
  node: OrgNode
  isSelected?: boolean
  onClick?: () => void
}

export function ExecutiveTileV2({ node, isSelected, onClick }: ExecutiveTileV2Props) {
  const designation = node.metadata.designation || "Executive Leadership"

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative select-none rounded-lg bg-slate-900 border border-slate-700 text-white px-4 py-2.5 transition-all duration-150 flex flex-col justify-center items-center cursor-pointer shadow-md min-w-[180px] max-w-[240px] min-h-[50px]",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      title={`${node.label} • ${designation}`}
    >
      <div className="font-bold text-xs sm:text-sm text-center text-white leading-snug">
        {node.label}
      </div>
      <div className="text-[11px] text-slate-300 font-normal mt-0.5 text-center">
        {designation}
      </div>
    </div>
  )
}
