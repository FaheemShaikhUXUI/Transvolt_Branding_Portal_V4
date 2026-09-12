"use client"

import * as React from "react"
import { OrgNode } from "@/lib/org-chart/types"
import { cn } from "@/lib/utils"

interface PersonTileV2Props {
  node: OrgNode
  isSelected?: boolean
  onClick?: () => void
}

export function PersonTileV2({ node, isSelected, onClick }: PersonTileV2Props) {
  const isConsultant = node.metadata.employmentType === "CONSULTANT"
  const designation = node.metadata.designation || "Staff Member"

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative select-none rounded-lg bg-card px-3 py-2 transition-all duration-150 flex flex-col justify-center cursor-pointer shadow-sm min-w-[155px] max-w-[190px] h-[52px]",
        // Green border for Employee, Orange border for Consultant
        isConsultant
          ? "border-2 border-[#ea580c] dark:border-[#f97316]"
          : "border-2 border-[#16a34a] dark:border-[#22c55e]",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      title={`${node.label} • ${designation} (${isConsultant ? "Consultant" : "Employee"})`}
    >
      {/* Bold Name - Left Aligned */}
      <div className="font-bold text-xs sm:text-sm text-foreground truncate text-left leading-tight">
        {node.label}
      </div>

      {/* Gray Thin Designation - Left Aligned */}
      <div className="font-normal text-[11px] text-muted-foreground truncate text-left mt-0.5 leading-tight">
        {designation}
      </div>
    </div>
  )
}
