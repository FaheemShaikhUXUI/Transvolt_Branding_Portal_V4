"use client"

import * as React from "react"
import { OrgNode } from "@/lib/org-chart/types"
import { cn } from "@/lib/utils"

interface RequiredTileV2Props {
  node: OrgNode
  isSelected?: boolean
  onClick?: () => void
}

export function RequiredTileV2({ node, isSelected, onClick }: RequiredTileV2Props) {
  const quantity = node.metadata.requiredQuantity || 1
  const designation = node.metadata.designation || node.label

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative select-none rounded-lg bg-muted/40 border-2 border-dashed border-slate-400 dark:border-slate-600 px-3 py-2 transition-all duration-150 flex flex-col justify-center cursor-pointer shadow-sm min-w-[155px] max-w-[190px] h-[52px]",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      title={`Vacancy: ${designation} (Quantity: ${quantity})`}
    >
      <div className="font-semibold text-xs text-foreground truncate text-left flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full border border-slate-500 bg-slate-200 dark:bg-slate-700 shrink-0" />
        <span className="truncate">{designation}</span>
      </div>
      <div className="text-[11px] text-muted-foreground font-medium text-left mt-0.5">
        Required: <strong className="text-foreground">{quantity}</strong>
      </div>
    </div>
  )
}
