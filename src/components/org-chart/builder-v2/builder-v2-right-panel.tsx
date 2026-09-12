"use client"

import * as React from "react"
import {
  OrganizationChart,
  OrgNode,
  OrgFooter,
  EmploymentType,
} from "@/lib/org-chart/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Building2,
  UserPlus,
  Briefcase,
  Settings,
  Trash2,
  Copy,
  FolderTree,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

interface RightPanelProps {
  chart: OrganizationChart
  selectedNodeId: string | null
  onSelectNode: (id: string | null) => void
  onUpdateChartMeta: (meta: Partial<OrganizationChart>) => void
  onAddDepartment: (name: string, code: string, parentId: string | null) => void
  onAddPerson: (
    name: string,
    designation: string,
    type: EmploymentType,
    parentId: string | null
  ) => void
  onAddRequired: (
    designation: string,
    quantity: number,
    parentId: string | null
  ) => void
  onUpdateNode: (nodeId: string, updates: Partial<OrgNode>) => void
  onChangeParent: (nodeId: string, newParentId: string | null) => void
  onDeleteNode: (nodeId: string) => void
  onDuplicateNode: (nodeId: string) => void
  onUpdateFooter: (footer: OrgFooter) => void
}

type TabKey = "add" | "structure" | "inspector" | "details" | "footer"

export function BuilderV2RightPanel({
  chart,
  selectedNodeId,
  onSelectNode,
  onUpdateChartMeta,
  onAddDepartment,
  onAddPerson,
  onAddRequired,
  onUpdateNode,
  onChangeParent,
  onDeleteNode,
  onDuplicateNode,
  onUpdateFooter,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = React.useState<TabKey>("add")

  // Local state for Add Department form
  const [deptName, setDeptName] = React.useState("")
  const [deptCode, setDeptCode] = React.useState("")
  const [deptParentId, setDeptParentId] = React.useState<string>("ROOT")

  // Local state for Add Person form
  const [personName, setPersonName] = React.useState("")
  const [personDesignation, setPersonDesignation] = React.useState("")
  const [personType, setPersonType] = React.useState<EmploymentType>("EMPLOYEE")
  const [personParentId, setPersonParentId] = React.useState<string>("ROOT")

  // Local state for Add Required form
  const [reqDesignation, setReqDesignation] = React.useState("")
  const [reqQuantity, setReqQuantity] = React.useState<number>(1)
  const [reqParentId, setReqParentId] = React.useState<string>("ROOT")

  // Selected node object
  const selectedNode = React.useMemo(() => {
    return chart.nodes.find((n) => n.id === selectedNodeId) || null
  }, [chart.nodes, selectedNodeId])

  // Switch to inspector tab automatically when a node is selected
  React.useEffect(() => {
    if (selectedNodeId) {
      setActiveTab("inspector")
    }
  }, [selectedNodeId])

  // Department and supervisor options for parents
  const parentOptions = React.useMemo(() => {
    return chart.nodes.filter(
      (n) =>
        n.type === "DEPARTMENT" ||
        n.type === "EXECUTIVE" ||
        n.type === "MANAGEMENT" ||
        (n.type === "EMPLOYEE" &&
          (n.metadata.designation?.toLowerCase().includes("manager") ||
            n.metadata.designation?.toLowerCase().includes("lead") ||
            n.metadata.designation?.toLowerCase().includes("head") ||
            n.metadata.designation?.toLowerCase().includes("supervisor")))
    )
  }, [chart.nodes])

  // All valid potential parents for selected node (excluding self and descendants)
  const safeParentOptions = React.useMemo(() => {
    if (!selectedNode) return chart.nodes
    const descendantIds = new Set<string>()
    const findChildren = (pid: string) => {
      chart.nodes
        .filter((n) => n.parentId === pid)
        .forEach((c) => {
          descendantIds.add(c.id)
          findChildren(c.id)
        })
    }
    findChildren(selectedNode.id)
    return chart.nodes.filter(
      (n) => n.id !== selectedNode.id && !descendantIds.has(n.id)
    )
  }, [chart.nodes, selectedNode])

  // Handle Add Department Submit
  const handleAddDepartmentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!deptName.trim()) {
      toast.error("Please enter a department name")
      return
    }
    const parent = deptParentId === "ROOT" ? null : deptParentId
    onAddDepartment(deptName.trim(), deptCode.trim(), parent)
    setDeptName("")
    setDeptCode("")
    toast.success(`Department "${deptName}" added to organization chart!`)
  }

  // Handle Add Person Submit
  const handleAddPersonSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!personName.trim()) {
      toast.error("Please enter the person's name")
      return
    }
    if (!personDesignation.trim()) {
      toast.error("Please enter designation")
      return
    }
    const parent = personParentId === "ROOT" ? null : personParentId
    onAddPerson(personName.trim(), personDesignation.trim(), personType, parent)
    setPersonName("")
    setPersonDesignation("")
    toast.success(`${personType === "EMPLOYEE" ? "Employee" : "Consultant"} added!`)
  }

  // Handle Add Required Submit
  const handleAddRequiredSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reqDesignation.trim()) {
      toast.error("Please enter position designation")
      return
    }
    const parent = reqParentId === "ROOT" ? null : reqParentId
    onAddRequired(reqDesignation.trim(), reqQuantity, parent)
    setReqDesignation("")
    setReqQuantity(1)
    toast.success("Required vacancy position added!")
  }

  return (
    <div className="w-[380px] lg:w-[420px] h-full flex flex-col border-l border-border bg-card/95 backdrop-blur-md shadow-lg select-none">
      {/* Panel Header */}
      <div className="h-14 px-4 border-b border-border flex items-center justify-between shrink-0 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1e40af]/10 text-[#1e40af] dark:text-blue-400">
            <Settings className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Control Center (V2)</h3>
            <p className="text-[10px] text-muted-foreground">Form-driven live chart builder</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-bold border-blue-500/40 text-blue-600 bg-blue-500/10">
          V2 Engine
        </Badge>
      </div>

      {/* Tabs Bar */}
      <div className="px-3 pt-2 border-b border-border/80 bg-background/50">
        <div className="grid grid-cols-5 w-full h-8 text-[11px] p-0.5 rounded-lg bg-muted/60">
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`text-[11px] px-1 py-1 rounded-md transition-all font-semibold cursor-pointer ${
              activeTab === "add"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            + Add
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("structure")}
            className={`text-[11px] px-1 py-1 rounded-md transition-all font-semibold cursor-pointer ${
              activeTab === "structure"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tree
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("inspector")}
            className={`text-[11px] px-1 py-1 rounded-md transition-all font-semibold cursor-pointer ${
              activeTab === "inspector"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Inspect
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`text-[11px] px-1 py-1 rounded-md transition-all font-semibold cursor-pointer ${
              activeTab === "details"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("footer")}
            className={`text-[11px] px-1 py-1 rounded-md transition-all font-semibold cursor-pointer ${
              activeTab === "footer"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Footer
          </button>
        </div>
      </div>

      {/* TAB 1: + ADD NEW NODES */}
      {activeTab === "add" && (
        <div className="flex-1 overflow-hidden m-0 p-0">
          <ScrollArea className="h-[calc(100vh-10.5rem)] px-4 py-3">
            <div className="space-y-6 pb-6">
              {/* SECTION A: Add Person (Employee / Consultant) */}
              <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <UserPlus className="h-4 w-4 text-[#16a34a]" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Add Person (Employee / Consultant)
                  </span>
                </div>

                <form onSubmit={handleAddPersonSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">Person Name *</Label>
                    <Input
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="h-8 text-xs bg-background"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">Designation *</Label>
                    <Input
                      value={personDesignation}
                      onChange={(e) => setPersonDesignation(e.target.value)}
                      placeholder="e.g. Service Engineer"
                      className="h-8 text-xs bg-background"
                      required
                    />
                  </div>

                  {/* Employment Type Selector: Green vs Orange */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-foreground">Employment Classification</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPersonType("EMPLOYEE")}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border-2 text-xs font-bold transition-all cursor-pointer ${
                          personType === "EMPLOYEE"
                            ? "border-[#16a34a] bg-[#16a34a]/10 text-[#16a34a]"
                            : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#16a34a]" />
                        <span>Employee</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPersonType("CONSULTANT")}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border-2 text-xs font-bold transition-all cursor-pointer ${
                          personType === "CONSULTANT"
                            ? "border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c]"
                            : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ea580c]" />
                        <span>Consultant</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {personType === "EMPLOYEE"
                        ? "Green border stroke tile (Direct roll personnel)"
                        : "Orange border stroke tile (External / Consultant personnel)"}
                    </p>
                  </div>

                  {/* Parent Selector */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">Reports To / Under Section</Label>
                    <select
                      value={personParentId}
                      onChange={(e) => setPersonParentId(e.target.value)}
                      className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="ROOT">Top Level (Project / Executive)</option>
                      {parentOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label} ({opt.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-8 text-xs font-bold bg-[#16a34a] hover:bg-[#15803d] text-white cursor-pointer shadow-sm"
                  >
                    + Add to Preview Canvas
                  </Button>
                </form>
              </div>

              {/* SECTION B: Add Department */}
              <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <Building2 className="h-4 w-4 text-[#1e40af]" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Add Department (Blue Header)
                  </span>
                </div>

                <form onSubmit={handleAddDepartmentSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">Department Name *</Label>
                    <Input
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      placeholder="e.g. Operations"
                      className="h-8 text-xs bg-background"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">Code / Subtitle (Optional)</Label>
                    <Input
                      value={deptCode}
                      onChange={(e) => setDeptCode(e.target.value)}
                      placeholder="e.g. OPS"
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">Under Which Section / Parent?</Label>
                    <select
                      value={deptParentId}
                      onChange={(e) => setDeptParentId(e.target.value)}
                      className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="ROOT">Top Level / Project Manager</option>
                      {parentOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-8 text-xs font-bold bg-[#1e40af] hover:bg-[#1d4ed8] text-white cursor-pointer shadow-sm"
                  >
                    + Add Department Tile
                  </Button>
                </form>
              </div>

              {/* SECTION C: Add Required Vacancy Position */}
              <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Add Sanctioned / Required Vacancy
                  </span>
                </div>

                <form onSubmit={handleAddRequiredSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">Position Designation *</Label>
                    <Input
                      value={reqDesignation}
                      onChange={(e) => setReqDesignation(e.target.value)}
                      placeholder="e.g. Senior Technician"
                      className="h-8 text-xs bg-background"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">Required Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      max={150}
                      value={reqQuantity}
                      onChange={(e) => setReqQuantity(parseInt(e.target.value, 10) || 1)}
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">Under Department</Label>
                    <select
                      value={reqParentId}
                      onChange={(e) => setReqParentId(e.target.value)}
                      className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="ROOT">Top Level</option>
                      {parentOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full h-8 text-xs font-bold border-dashed border-slate-400 dark:border-slate-600 hover:bg-muted cursor-pointer"
                  >
                    + Add Required Vacancy Tile
                  </Button>
                </form>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* TAB 2: STRUCTURE / HIERARCHY TREE */}
      {activeTab === "structure" && (
        <div className="flex-1 overflow-hidden m-0 p-0">
          <ScrollArea className="h-[calc(100vh-10.5rem)] px-4 py-3">
            <div className="space-y-2 pb-6">
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <div className="flex items-center gap-1.5">
                  <FolderTree className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">Chart Hierarchy</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {chart.nodes.length} Nodes
                </Badge>
              </div>

              {/* Node Tree List */}
              <div className="space-y-1 pt-1">
                {chart.nodes.map((node) => {
                  const isSelected = node.id === selectedNodeId
                  const isConsultant = node.metadata.employmentType === "CONSULTANT"

                  return (
                    <div
                      key={node.id}
                      onClick={() => onSelectNode(node.id)}
                      className={`group flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? "bg-primary/10 border-primary text-primary font-bold shadow-sm"
                          : "bg-card border-border hover:bg-muted/60 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {node.type === "EXECUTIVE" ? (
                          <span className="h-2 w-2 rounded-full bg-slate-900 dark:bg-slate-100 shrink-0" />
                        ) : node.type === "DEPARTMENT" ? (
                          <span className="h-2 w-2 rounded-full bg-[#1e40af] shrink-0" />
                        ) : isConsultant ? (
                          <span className="h-2 w-2 rounded-full bg-[#ea580c] shrink-0" />
                        ) : node.type === "REQUIRED_POSITION" ? (
                          <span className="h-2 w-2 rounded-full border border-slate-500 bg-slate-200 shrink-0" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-[#16a34a] shrink-0" />
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold">{node.label}</div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {node.metadata.designation || node.type}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteNode(node.id)
                          }}
                          title="Delete Node"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* TAB 3: INSPECTOR / EDIT SELECTED NODE */}
      {activeTab === "inspector" && (
        <div className="flex-1 overflow-hidden m-0 p-0">
          <ScrollArea className="h-[calc(100vh-10.5rem)] px-4 py-3">
            {selectedNode ? (
              <div className="space-y-4 pb-6">
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      Selected Node
                    </span>
                    <h4 className="text-sm font-extrabold text-foreground truncate">
                      {selectedNode.label}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedNode.metadata.designation || selectedNode.type}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() => onDuplicateNode(selectedNode.id)}
                      title="Duplicate Node"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                      onClick={() => onDeleteNode(selectedNode.id)}
                      title="Delete Node"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">Node Label / Name</Label>
                    <Input
                      value={selectedNode.label}
                      onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  {selectedNode.type !== "DEPARTMENT" && (
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-foreground">Designation</Label>
                      <Input
                        value={selectedNode.metadata.designation || ""}
                        onChange={(e) =>
                          onUpdateNode(selectedNode.id, {
                            metadata: { ...selectedNode.metadata, designation: e.target.value },
                          })
                        }
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                  )}

                  {/* Employment Type Toggle if person */}
                  {(selectedNode.type === "EMPLOYEE" || selectedNode.type === "CONSULTANT") && (
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-foreground">Personnel Type</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateNode(selectedNode.id, {
                              type: "EMPLOYEE",
                              metadata: { ...selectedNode.metadata, employmentType: "EMPLOYEE" },
                            })
                          }
                          className={`py-1.5 text-xs font-bold rounded-lg border-2 cursor-pointer ${
                            selectedNode.metadata.employmentType === "EMPLOYEE"
                              ? "border-[#16a34a] bg-[#16a34a]/10 text-[#16a34a]"
                              : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          ● Employee (Green)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateNode(selectedNode.id, {
                              type: "CONSULTANT",
                              metadata: { ...selectedNode.metadata, employmentType: "CONSULTANT" },
                            })
                          }
                          className={`py-1.5 text-xs font-bold rounded-lg border-2 cursor-pointer ${
                            selectedNode.metadata.employmentType === "CONSULTANT"
                              ? "border-[#ea580c] bg-[#ea580c]/10 text-[#ea580c]"
                              : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          ● Consultant (Orange)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Vacancy quantity */}
                  {selectedNode.type === "REQUIRED_POSITION" && (
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-foreground">Required Quantity</Label>
                      <Input
                        type="number"
                        min={1}
                        value={selectedNode.metadata.requiredQuantity || 1}
                        onChange={(e) =>
                          onUpdateNode(selectedNode.id, {
                            metadata: {
                              ...selectedNode.metadata,
                              requiredQuantity: parseInt(e.target.value, 10) || 1,
                            },
                          })
                        }
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                  )}

                  {/* Change Parent / Reporting Line */}
                  <div className="space-y-1 pt-1">
                    <Label className="text-[11px] font-semibold text-foreground">
                      Reports To / Parent Section
                    </Label>
                    <select
                      value={selectedNode.parentId || "ROOT"}
                      onChange={(e) => {
                        const newParent = e.target.value === "ROOT" ? null : e.target.value
                        onChangeParent(selectedNode.id, newParent)
                      }}
                      className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="ROOT">Top Level / Independent</option>
                      {safeParentOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label} ({opt.metadata.designation || opt.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 border-2 border-dashed border-border rounded-xl">
                <Sparkles className="h-8 w-8 text-muted-foreground/60" />
                <h4 className="text-xs font-bold text-foreground">No Node Selected</h4>
                <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                  Click on any tile in the live canvas or choose an item in the &quot;Tree&quot; tab to inspect and edit its details.
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {/* TAB 4: CHART DETAILS & METADATA */}
      {activeTab === "details" && (
        <div className="flex-1 overflow-hidden m-0 p-0">
          <ScrollArea className="h-[calc(100vh-10.5rem)] px-4 py-3">
            <div className="space-y-4 pb-6">
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-foreground">Chart Title</Label>
                  <Input
                    value={chart.title}
                    onChange={(e) => onUpdateChartMeta({ title: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-foreground">Location Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateChartMeta({ chartType: "HEAD_OFFICE", siteLocation: "Corporate Head Office" })}
                      className={`py-1 text-xs font-bold rounded-lg border cursor-pointer ${
                        chart.chartType === "HEAD_OFFICE"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      Head Office
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateChartMeta({ chartType: "PROJECT_SITE" })}
                      className={`py-1 text-xs font-bold rounded-lg border cursor-pointer ${
                        chart.chartType === "PROJECT_SITE"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      Project Site
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-foreground">Site / Branch Name</Label>
                  <Input
                    value={chart.siteName}
                    onChange={(e) => onUpdateChartMeta({ siteName: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-foreground">Location Description</Label>
                  <Input
                    value={chart.siteLocation}
                    onChange={(e) => onUpdateChartMeta({ siteLocation: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">Effective From</Label>
                    <Input
                      type="date"
                      value={chart.effectiveFrom}
                      onChange={(e) => onUpdateChartMeta({ effectiveFrom: e.target.value })}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-foreground">Version</Label>
                    <Input
                      value={chart.version}
                      onChange={(e) => onUpdateChartMeta({ version: e.target.value })}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* TAB 5: FOOTER & MATRIX */}
      {activeTab === "footer" && (
        <div className="flex-1 overflow-hidden m-0 p-0">
          <ScrollArea className="h-[calc(100vh-10.5rem)] px-4 py-3">
            <div className="space-y-4 pb-6">
              {/* Manpower Matrix Values */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <span className="text-xs font-bold text-foreground">Manpower RAG Numbers</span>

                <div className="space-y-2">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Pilots Required vs Available</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Required"
                      value={chart.footer.manpowerMatrix.rows[0]?.values["Pilots"] || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0
                        const newFooter = { ...chart.footer }
                        newFooter.manpowerMatrix.rows[0].values["Pilots"] = val
                        // Recompute gap
                        const avail = newFooter.manpowerMatrix.rows[1].values["Pilots"] || 0
                        newFooter.manpowerMatrix.rows[2].values["Pilots"] = val - avail
                        onUpdateFooter(newFooter)
                      }}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      placeholder="Available"
                      value={chart.footer.manpowerMatrix.rows[1]?.values["Pilots"] || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0
                        const newFooter = { ...chart.footer }
                        newFooter.manpowerMatrix.rows[1].values["Pilots"] = val
                        const req = newFooter.manpowerMatrix.rows[0].values["Pilots"] || 0
                        newFooter.manpowerMatrix.rows[2].values["Pilots"] = req - val
                        onUpdateFooter(newFooter)
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Staff On Roll Required vs Available</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Required"
                      value={chart.footer.manpowerMatrix.rows[0]?.values["Staff On Roll"] || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0
                        const newFooter = { ...chart.footer }
                        newFooter.manpowerMatrix.rows[0].values["Staff On Roll"] = val
                        const avail = newFooter.manpowerMatrix.rows[1].values["Staff On Roll"] || 0
                        newFooter.manpowerMatrix.rows[2].values["Staff On Roll"] = val - avail
                        onUpdateFooter(newFooter)
                      }}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      placeholder="Available"
                      value={chart.footer.manpowerMatrix.rows[1]?.values["Staff On Roll"] || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0
                        const newFooter = { ...chart.footer }
                        newFooter.manpowerMatrix.rows[1].values["Staff On Roll"] = val
                        const req = newFooter.manpowerMatrix.rows[0].values["Staff On Roll"] || 0
                        newFooter.manpowerMatrix.rows[2].values["Staff On Roll"] = req - val
                        onUpdateFooter(newFooter)
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
