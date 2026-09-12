"use client"

import * as React from "react"
import { OrgNode, OrganizationChart, EmploymentType } from "@/lib/org-chart/types"
import { Trash2, Edit2, GitFork, Copy, Sliders, Users, Building2, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InspectorProps {
  chart: OrganizationChart
  selectedNode: OrgNode | null
  existingNodes: OrgNode[]
  onUpdateNode: (updatedNode: OrgNode) => void
  onDeleteNode: (node: OrgNode) => void
  onChangeParent: (node: OrgNode) => void
  onDuplicateNode: (node: OrgNode) => void
}

export function BuilderInspectorPanel({
  chart,
  selectedNode,
  existingNodes,
  onUpdateNode,
  onDeleteNode,
  onChangeParent,
  onDuplicateNode,
}: InspectorProps) {
  if (!selectedNode) {
    // Summary of Organization Chart when nothing is selected
    const totalDepts = chart.nodes.filter((n) => n.type === "DEPARTMENT").length
    const totalEmployees = chart.nodes.filter((n) => n.type === "EMPLOYEE").length
    const totalConsultants = chart.nodes.filter((n) => n.type === "CONSULTANT").length
    const totalRequired = chart.nodes
      .filter((n) => n.type === "REQUIRED_POSITION")
      .reduce((sum, n) => sum + (n.metadata.requiredQuantity || 1), 0)

    return (
      <aside className="w-80 border-l border-border/80 bg-card/50 backdrop-blur-sm p-4 flex flex-col gap-4 overflow-y-auto shrink-0 select-none">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Sliders className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
            Chart Inspector
          </h3>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-3 space-y-3 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Hierarchy Statistics
          </span>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-lg font-black text-blue-600">{totalDepts}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Departments</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-lg font-black text-emerald-600">{totalEmployees}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Employees</p>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-lg font-black text-purple-600">{totalConsultants}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Consultants</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-lg font-black text-amber-600">{totalRequired}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Vacancies</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-2 p-3 rounded-lg border border-dashed border-border/80 bg-muted/20">
          <p className="font-semibold text-foreground">Click any node on the canvas</p>
          <p className="text-[11px] leading-relaxed">
            Select an executive, department, employee, or required position to inspect, modify properties, or change its parent live.
          </p>
        </div>
      </aside>
    )
  }

  // Node Selected View
  const parentNode = existingNodes.find((n) => n.id === selectedNode.parentId)

  const handleLabelChange = (val: string) => {
    onUpdateNode({
      ...selectedNode,
      label: val,
      metadata: {
        ...selectedNode.metadata,
        name: val,
      },
    })
  }

  const handleDesignationChange = (val: string) => {
    onUpdateNode({
      ...selectedNode,
      metadata: {
        ...selectedNode.metadata,
        designation: val,
      },
    })
  }

  const handleEmpIdChange = (val: string) => {
    onUpdateNode({
      ...selectedNode,
      metadata: {
        ...selectedNode.metadata,
        employeeId: val,
      },
    })
  }

  const handleQuantityChange = (qty: number) => {
    onUpdateNode({
      ...selectedNode,
      metadata: {
        ...selectedNode.metadata,
        requiredQuantity: qty,
      },
    })
  }

  const handleEmpTypeToggle = (type: EmploymentType) => {
    onUpdateNode({
      ...selectedNode,
      type: type === "CONSULTANT" ? "CONSULTANT" : "EMPLOYEE",
      metadata: {
        ...selectedNode.metadata,
        employmentType: type,
      },
    })
  }

  return (
    <aside className="w-80 border-l border-border/80 bg-card/50 backdrop-blur-sm p-4 flex flex-col gap-4 overflow-y-auto shrink-0 select-none">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-1.5">
          <Sliders className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
            Node Inspector
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted uppercase tracking-wider text-muted-foreground">
          {selectedNode.type}
        </span>
      </div>

      {/* Node Properties Form */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted-foreground">Title / Full Name</label>
          <input
            type="text"
            value={selectedNode.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full h-8 text-xs font-bold px-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {selectedNode.type !== "DEPARTMENT" && (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Designation</label>
            <input
              type="text"
              value={selectedNode.metadata.designation || ""}
              onChange={(e) => handleDesignationChange(e.target.value)}
              placeholder="e.g. Service Engineer"
              className="w-full h-8 text-xs px-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {/* Employee ID if employee or consultant */}
        {(selectedNode.type === "EMPLOYEE" || selectedNode.type === "CONSULTANT") && (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Employee ID</label>
            <input
              type="text"
              value={selectedNode.metadata.employeeId || ""}
              onChange={(e) => handleEmpIdChange(e.target.value)}
              placeholder="e.g. TV-2024-001"
              className="w-full h-8 text-xs font-mono px-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {/* Quantity if required position */}
        {selectedNode.type === "REQUIRED_POSITION" && (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">
              Required Headcount Quantity
            </label>
            <input
              type="number"
              min={1}
              value={selectedNode.metadata.requiredQuantity || 1}
              onChange={(e) => handleQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full h-8 text-xs font-bold px-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {/* Toggle between Employee & Consultant */}
        {(selectedNode.type === "EMPLOYEE" || selectedNode.type === "CONSULTANT") && (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Employment Classification</label>
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => handleEmpTypeToggle("EMPLOYEE")}
                className={`py-1 text-xs font-semibold rounded border cursor-pointer ${
                  selectedNode.type === "EMPLOYEE"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                ● Employee
              </button>
              <button
                type="button"
                onClick={() => handleEmpTypeToggle("CONSULTANT")}
                className={`py-1 text-xs font-semibold rounded border cursor-pointer ${
                  selectedNode.type === "CONSULTANT"
                    ? "bg-purple-500/15 border-purple-500 text-purple-700 dark:text-purple-300"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                ● Consultant
              </button>
            </div>
          </div>
        )}

        {/* Current Reporting Parent */}
        <div className="space-y-1 pt-1">
          <label className="text-[11px] font-semibold text-muted-foreground">Reports To</label>
          <div className="flex items-center justify-between p-2 rounded-md bg-muted/40 border text-xs">
            <span className="font-semibold truncate max-w-[170px]">
              {parentNode ? parentNode.label : "Top Level (Root)"}
            </span>
            <button
              type="button"
              onClick={() => onChangeParent(selectedNode)}
              className="text-[11px] text-primary hover:underline font-bold cursor-pointer"
            >
              Change
            </button>
          </div>
        </div>

        {/* Position coordinates */}
        <div className="pt-2 text-[10px] text-muted-foreground flex justify-between">
          <span>X: {Math.round(selectedNode.position.x)}px</span>
          <span>Y: {Math.round(selectedNode.position.y)}px</span>
          <span>W: {selectedNode.width || 190}px</span>
        </div>
      </div>

      {/* Node Actions */}
      <div className="pt-4 border-t border-border/60 space-y-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChangeParent(selectedNode)}
          className="w-full justify-start gap-2 h-8 text-xs cursor-pointer"
        >
          <GitFork className="h-3.5 w-3.5 text-primary" />
          <span>Change Parent</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onDuplicateNode(selectedNode)}
          className="w-full justify-start gap-2 h-8 text-xs cursor-pointer"
        >
          <Copy className="h-3.5 w-3.5" />
          <span>Duplicate Node</span>
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDeleteNode(selectedNode)}
          className="w-full justify-start gap-2 h-8 text-xs cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Node</span>
        </Button>
      </div>
    </aside>
  )
}
