"use client"

import * as React from "react"
import { OrgNode, EmploymentType } from "@/lib/org-chart/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { User, Users, Briefcase } from "lucide-react"

// Sample existing employee records to select from
const EXISTING_EMPLOYEE_MASTER = [
  { name: "Rajesh Sharma", designation: "Chief Technology Officer", id: "TV-2024-001", type: "EMPLOYEE" },
  { name: "Ananya Verma", designation: "Lead EV Powertrain Engineer", id: "TV-2024-002", type: "EMPLOYEE" },
  { name: "Vikram Patel", designation: "Head of Charging Infrastructure", id: "TV-2024-003", type: "EMPLOYEE" },
  { name: "Pooja Hegde", designation: "Senior Brand & Communications Manager", id: "TV-2024-004", type: "EMPLOYEE" },
  { name: "Arjun Mehta", designation: "Fleet Operations Lead", id: "TV-2024-005", type: "EMPLOYEE" },
  { name: "Sunita Deshmukh", designation: "VP, Safety & Compliance", id: "TV-2024-006", type: "EMPLOYEE" },
  { name: "Rahul Sharma", designation: "Service Engineer", id: "TV-2024-012", type: "EMPLOYEE" },
  { name: "Manoj Kulkarni", designation: "Senior Technician", id: "TV-2024-019", type: "EMPLOYEE" },
  { name: "Priya Shah", designation: "Financial Audit Consultant", id: "TV-CON-003", type: "CONSULTANT" },
  { name: "Rajesh Solanki", designation: "Duty Supervisor", id: "TV-2024-015", type: "EMPLOYEE" },
  { name: "Suresh Patil", designation: "Lead Pilot / Trainer", id: "TV-2024-022", type: "EMPLOYEE" },
  { name: "Deepa Nair", designation: "HR & Admin Executive", id: "TV-2024-025", type: "EMPLOYEE" },
  { name: "Vinod Pawar", designation: "Safety & Compliance Officer", id: "TV-2024-031", type: "EMPLOYEE" },
  { name: "Sachin Deshmukh", designation: "MIS & Telematics Support", id: "TV-2024-034", type: "EMPLOYEE" },
  { name: "Ramesh Yadav", designation: "Store Incharge", id: "TV-2024-038", type: "EMPLOYEE" },
  { name: "Santosh Shinde", designation: "Inventory Associate", id: "TV-2024-041", type: "EMPLOYEE" },
]

interface AddEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingNodes: OrgNode[]
  defaultParentId?: string | null
  onAdd: (empData: {
    name: string
    designation: string
    employeeId?: string
    employmentType: EmploymentType
    parentId: string | null
  }) => void
}

export function AddEmployeeDialog({
  open,
  onOpenChange,
  existingNodes,
  defaultParentId,
  onAdd,
}: AddEmployeeDialogProps) {
  const [sourceMode, setSourceMode] = React.useState<"MASTER" | "MANUAL">("MASTER")
  const [name, setName] = React.useState("")
  const [designation, setDesignation] = React.useState("")
  const [employeeId, setEmployeeId] = React.useState("")
  const [employmentType, setEmploymentType] = React.useState<EmploymentType>("EMPLOYEE")
  const [parentId, setParentId] = React.useState<string | null>(defaultParentId || null)

  React.useEffect(() => {
    if (open) {
      setName("")
      setDesignation("")
      setEmployeeId("")
      setEmploymentType("EMPLOYEE")
      setParentId(defaultParentId || null)
      setSourceMode("MASTER")
    }
  }, [open, defaultParentId])

  const handleSelectFromMaster = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = EXISTING_EMPLOYEE_MASTER.find((item) => item.id === e.target.value)
    if (selected) {
      setName(selected.name)
      setDesignation(selected.designation)
      setEmployeeId(selected.id)
      setEmploymentType(selected.type as EmploymentType)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !designation.trim()) return
    onAdd({
      name: name.trim(),
      designation: designation.trim(),
      employeeId: employeeId.trim() || undefined,
      employmentType,
      parentId: parentId || null,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <User className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Add Staff / Consultant</DialogTitle>
              <DialogDescription className="text-xs">
                Assign an employee or external consultant under a department or person.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Source Toggle Tabs */}
        <div className="flex rounded-lg bg-muted p-1 gap-1">
          <button
            type="button"
            onClick={() => setSourceMode("MASTER")}
            className={`flex-1 py-1 px-2 text-xs font-semibold rounded-md transition-all ${
              sourceMode === "MASTER"
                ? "bg-background shadow-xs text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Select from Employee Master
          </button>
          <button
            type="button"
            onClick={() => setSourceMode("MANUAL")}
            className={`flex-1 py-1 px-2 text-xs font-semibold rounded-md transition-all ${
              sourceMode === "MANUAL"
                ? "bg-background shadow-xs text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Enter Manually
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {sourceMode === "MASTER" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Select Existing Employee</label>
              <select
                onChange={handleSelectFromMaster}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- Choose Employee / Pilot / Staff --</option>
                {EXISTING_EMPLOYEE_MASTER.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — {emp.designation} ({emp.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Designation *</label>
              <input
                type="text"
                required
                placeholder="e.g. Service Engineer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Employee ID</label>
              <input
                type="text"
                placeholder="e.g. TV-2024-012"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Employment Type</label>
              <div className="flex gap-2 pt-1">
                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="empType"
                    checked={employmentType === "EMPLOYEE"}
                    onChange={() => setEmploymentType("EMPLOYEE")}
                    className="accent-emerald-600"
                  />
                  <span>● Employee</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="empType"
                    checked={employmentType === "CONSULTANT"}
                    onChange={() => setEmploymentType("CONSULTANT")}
                    className="accent-purple-600"
                  />
                  <span>● Consultant</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Reports To / Under Which Section or Person?
            </label>
            <select
              value={parentId || ""}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">(None / Direct Top Level)</option>
              {existingNodes.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.type}] {p.label} {p.metadata.designation ? `— ${p.metadata.designation}` : ""}
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
              className="bg-[#548235] hover:bg-[#466f2c] text-white cursor-pointer"
            >
              Add Staff Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
