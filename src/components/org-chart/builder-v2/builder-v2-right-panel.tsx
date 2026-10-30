"use client"

import * as React from "react"
import {
  OrganizationChart,
  OrgNode,
  OrgConnection,
  SectionBoundary,
  BoundaryTitlePosition,
  TextAnnotation,
  OrgFooter,
  EmploymentType,
  OrgChartPageData,
  VehicleMatrix,
  ProjectInformation,
} from "@/lib/org-chart/types"
import { ChartShape } from "@/components/org-chart/builder-v2/shapes/types"
import { calculateManpowerSummary } from "@/lib/org-chart/rag-calculator"
import { MatrixBracketIcon } from "@/components/org-chart/builder-v2/canvas-v2/org-chart-footer-v2"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  UserPlus,
  Briefcase,
  Settings,
  Trash2,
  Copy,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Sparkles,
  SquareDashed,
  Type,
  ArrowRight,
  Search,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Truck,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  PaintBucket,
  SlidersHorizontal,
  Save,
  ChevronUp,
  MapPin,
  User,
  Calendar,
  Plus,
  Users,
  Shapes,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface RightPanelProps {
  chart: OrganizationChart
  selectedElement: {
    type: "node" | "connection" | "boundary" | "annotation" | "shape" | null
    id: string | null
  }
  onSelectElement: (type: "node" | "connection" | "boundary" | "annotation" | "shape" | null, id: string | null) => void
  onUpdateChartMeta: (meta: Partial<OrganizationChart>) => void
  onAddOrganization?: (name: string, code?: string, parentId?: string | null, color?: string) => void
  onAddDepartment: (name: string, code: string, parentId: string | null) => void
  onAddPerson: (
    name: string,
    designation: string,
    type: EmploymentType,
    parentId: string | null,
    extra?: { employeeId?: string; contact?: string; notes?: string }
  ) => void
  onAddRequired: (designation: string, quantity: number, parentId: string | null) => void
  onAddBoundary: (title: string, color?: string, borderStyle?: "dashed" | "solid") => void
  onAddAnnotation: (text: string, color?: string) => void
  onAddConnection: (source: string, target: string, type?: "orthogonal" | "bezier" | "straight") => void
  onUpdateNode: (nodeId: string, updates: Partial<OrgNode>) => void
  onChangeParent: (nodeId: string, newParentId: string | null) => void
  onDeleteNode: (nodeId: string) => void
  onDuplicateNode: (nodeId: string) => void
  onUpdateConnection: (connId: string, updates: Partial<OrgConnection>) => void
  onDeleteConnection: (connId: string) => void
  onUpdateBoundary: (boundaryId: string, updates: Partial<SectionBoundary>) => void
  onDeleteBoundary: (boundaryId: string) => void
  onUpdateAnnotation: (annId: string, updates: Partial<TextAnnotation>) => void
  onDeleteAnnotation: (annId: string) => void
  onUpdateShape?: (shapeId: string, updates: Partial<ChartShape>) => void
  onDeleteShape?: (shapeId: string) => void
  onDuplicateShape?: (shapeId: string) => void
  onUpdateFooter: (footer: OrgFooter) => void
  onSave?: (publish?: boolean) => Promise<void> | void
  isSaving?: boolean
  lastSavedAt?: Date | null
}

type TabKey = "add" | "structure" | "inspector" | "matrix" | "footer"
type AddSubTab = "organization" | "person" | "department" | "required" | "chargers" | "vehicles" | "container" | "text" | "connector"

export function BuilderV2RightPanel({
  chart,
  selectedElement,
  onSelectElement,
  onUpdateChartMeta,
  onAddOrganization,
  onAddDepartment,
  onAddPerson,
  onAddRequired,
  onAddBoundary,
  onAddAnnotation,
  onAddConnection,
  onUpdateNode,
  onChangeParent,
  onDeleteNode,
  onDuplicateNode,
  onUpdateConnection,
  onDeleteConnection,
  onUpdateBoundary,
  onDeleteBoundary,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onUpdateShape,
  onDeleteShape,
  onDuplicateShape,
  onUpdateFooter,
  onSave,
  isSaving = false,
  lastSavedAt,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = React.useState<TabKey>("add")
  const [addSubTab, setAddSubTab] = React.useState<AddSubTab>("person")

  // Form states: Add Organization
  const [orgName, setOrgName] = React.useState("")
  const [orgCode, setOrgCode] = React.useState("")
  const [orgParentId, setOrgParentId] = React.useState<string>("ROOT")
  const [orgColor, setOrgColor] = React.useState("#c2410c") // Default Dark Orange

  // Form states: Add Person
  const [personName, setPersonName] = React.useState("")
  const [personDesignation, setPersonDesignation] = React.useState("")
  const [personType, setPersonType] = React.useState<EmploymentType>("EMPLOYEE")
  const [personParentId, setPersonParentId] = React.useState<string>("ROOT")
  const [personEmpId, setPersonEmpId] = React.useState("")
  const [personContact, setPersonContact] = React.useState("")
  const [quickAddMode, setQuickAddMode] = React.useState(false)

  // Form states: Add Department
  const [deptName, setDeptName] = React.useState("")
  const [deptCode, setDeptCode] = React.useState("")
  const [deptParentId, setDeptParentId] = React.useState<string>("ROOT")

  // Form states: Add Required Position
  const [reqDesignation, setReqDesignation] = React.useState("")
  const [reqQuantity, setReqQuantity] = React.useState<number>(1)
  const [reqParentId, setReqParentId] = React.useState<string>("ROOT")

  // Form states: Add Container / Rectangle
  const [containerTitle, setContainerTitle] = React.useState("PROJECT SITE DIVISION")
  const [containerColor, setContainerColor] = React.useState("#548235")
  const [containerStyle, setContainerStyle] = React.useState<"dashed" | "solid">("dashed")

  // Form states: Add Text Annotation
  const [annotationText, setAnnotationText] = React.useState("")

  // Form states: Add Connector
  const [connSource, setConnSource] = React.useState("")
  const [connTarget, setConnTarget] = React.useState("")
  const [connType, setConnType] = React.useState<"orthogonal" | "bezier" | "straight">("orthogonal")

  // Form states: Add Chargers & Vehicles (Matrix Infrastructure)
  const [chargerReq, setChargerReq] = React.useState<number>(8)
  const [chargerAvail, setChargerAvail] = React.useState<number>(8)
  const [vehicleReq, setVehicleReq] = React.useState<number>(50)
  const [vehicleAvail, setVehicleAvail] = React.useState<number>(50)

  React.useEffect(() => {
    if (chart.footer?.vehicleMatrix) {
      setChargerReq(chart.footer.vehicleMatrix.chargers?.required ?? 8)
      setChargerAvail(chart.footer.vehicleMatrix.chargers?.available ?? 8)
      setVehicleReq(chart.footer.vehicleMatrix.vehicles?.required ?? 50)
      setVehicleAvail(chart.footer.vehicleMatrix.vehicles?.available ?? 50)
    }
  }, [chart.footer])

  // Tree search query
  const [treeSearch, setTreeSearch] = React.useState("")

  // Active Selected Element Objects
  const selectedNode = React.useMemo(() => {
    if (selectedElement.type !== "node" || !selectedElement.id) return null
    return chart.nodes.find((n) => n.id === selectedElement.id) || null
  }, [chart.nodes, selectedElement])

  const selectedConnection = React.useMemo(() => {
    if (selectedElement.type !== "connection" || !selectedElement.id) return null
    return chart.connections.find((c) => c.id === selectedElement.id) || null
  }, [chart.connections, selectedElement])

  const selectedBoundary = React.useMemo(() => {
    if (selectedElement.type !== "boundary" || !selectedElement.id) return null
    return chart.boundaries.find((b) => b.id === selectedElement.id) || null
  }, [chart.boundaries, selectedElement])

  const selectedAnnotation = React.useMemo(() => {
    if (selectedElement.type !== "annotation" || !selectedElement.id) return null
    return chart.annotations?.find((a) => a.id === selectedElement.id) || null
  }, [chart.annotations, selectedElement])

  const selectedShape = React.useMemo(() => {
    if (selectedElement.type !== "shape" || !selectedElement.id) return null
    return chart.shapes?.find((s) => s.id === selectedElement.id) || null
  }, [chart.shapes, selectedElement])

  // Automatically switch to inspector tab when an element is selected
  React.useEffect(() => {
    if (selectedElement.id) {
      setActiveTab("inspector")
    }
  }, [selectedElement.id])

  // Department & Management options for parent selectors
  const parentOptions = React.useMemo(() => {
    return chart.nodes.filter(
      (n) =>
        n.type === "ORGANIZATION" ||
        n.type === "DEPARTMENT" ||
        n.type === "EXECUTIVE" ||
        n.type === "MANAGEMENT" ||
        (n.type === "EMPLOYEE" &&
          (n.metadata.designation?.toLowerCase().includes("manager") ||
            n.metadata.designation?.toLowerCase().includes("lead") ||
            n.metadata.designation?.toLowerCase().includes("head")))
    )
  }, [chart.nodes])

  // Cycle detection & safe parent options
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
    return chart.nodes.filter((n) => n.id !== selectedNode.id && !descendantIds.has(n.id))
  }, [chart.nodes, selectedNode])

  // Tree filter logic
  const filteredTreeNodes = React.useMemo(() => {
    if (!treeSearch.trim()) return chart.nodes
    const q = treeSearch.toLowerCase()
    return chart.nodes.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        (n.metadata.designation && n.metadata.designation.toLowerCase().includes(q)) ||
        (n.metadata.department && n.metadata.department.toLowerCase().includes(q))
    )
  }, [chart.nodes, treeSearch])

  // Check for orphan nodes
  const orphanNodes = React.useMemo(() => {
    const nodeIds = new Set(chart.nodes.map((n) => n.id))
    return chart.nodes.filter((n) => n.parentId && !nodeIds.has(n.parentId))
  }, [chart.nodes])

  // Submit Add Person
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
    onAddPerson(personName.trim(), personDesignation.trim(), personType, parent, {
      employeeId: personEmpId.trim() || undefined,
      contact: personContact.trim() || undefined,
    })

    if (!quickAddMode) {
      setPersonName("")
      setPersonDesignation("")
      setPersonEmpId("")
      setPersonContact("")
    } else {
      setPersonName("")
    }
    toast.success(`${personType === "EMPLOYEE" ? "Employee" : "Consultant"} added to chart!`)
  }

  // Submit Add Organization
  const handleAddOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgName.trim()) {
      toast.error("Please enter an organization name")
      return
    }
    const parent = orgParentId === "ROOT" ? null : orgParentId
    if (onAddOrganization) {
      onAddOrganization(orgName.trim(), orgCode.trim() || undefined, parent, orgColor)
    }
    setOrgName("")
    setOrgCode("")
  }

  // Submit Add Department
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
    toast.success(`Department "${deptName}" added!`)
  }

  // Submit Add Required Vacancy
  const handleAddRequiredSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reqDesignation.trim()) {
      toast.error("Please enter vacancy position title")
      return
    }
    const parent = reqParentId === "ROOT" ? null : reqParentId
    onAddRequired(reqDesignation.trim(), reqQuantity, parent)
    setReqDesignation("")
    setReqQuantity(1)
    toast.success("Required vacancy tile created!")
  }

  // Submit Add Grouping Container
  const handleAddContainerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!containerTitle.trim()) {
      toast.error("Please enter a container title")
      return
    }
    onAddBoundary(containerTitle.trim(), containerColor, containerStyle)
    toast.success(`Grouping rectangle "${containerTitle}" added!`)
  }

  // Submit Add Annotation
  const handleAddAnnotationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!annotationText.trim()) {
      toast.error("Please enter text annotation content")
      return
    }
    onAddAnnotation(annotationText.trim())
    setAnnotationText("")
    toast.success("Text annotation added!")
  }

  // Submit Add / Update Chargers (Directly updates Matrix without affecting org chart canvas)
  const handleUpdateChargersSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const currentFooter = chart.footer || {
      enabled: true,
      projectInfo: { projectName: "", projectLocation: "", projectCode: "", projectManager: "", effectiveDate: "" },
      manpowerColumns: [],
      manpowerRows: [],
      vehicleMatrix: { vehicles: { required: 50, available: 50 }, chargers: { required: 8, available: 8 } },
      legendItems: [],
    }
    const updatedFooter: OrgFooter = {
      ...currentFooter,
      vehicleMatrix: {
        ...currentFooter.vehicleMatrix,
        chargers: { required: chargerReq, available: chargerAvail },
      },
    }
    onUpdateFooter(updatedFooter)
    toast.success(`EV Chargers updated in Matrix (${chargerAvail} Available, ${chargerReq} Required)`)
  }

  // Submit Add / Update Vehicles (Directly updates Matrix without affecting org chart canvas)
  const handleUpdateVehiclesSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const currentFooter = chart.footer || {
      enabled: true,
      projectInfo: { projectName: "", projectLocation: "", projectCode: "", projectManager: "", effectiveDate: "" },
      manpowerColumns: [],
      manpowerRows: [],
      vehicleMatrix: { vehicles: { required: 50, available: 50 }, chargers: { required: 8, available: 8 } },
      legendItems: [],
    }
    const updatedFooter: OrgFooter = {
      ...currentFooter,
      vehicleMatrix: {
        ...currentFooter.vehicleMatrix,
        vehicles: { required: vehicleReq, available: vehicleAvail },
      },
    }
    onUpdateFooter(updatedFooter)
    toast.success(`Electric Vehicles updated in Matrix (${vehicleAvail} Available, ${vehicleReq} Required)`)
  }

  // Submit Add Connector
  const handleAddConnectorSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!connSource || !connTarget) {
      toast.error("Please select both source and destination nodes")
      return
    }
    if (connSource === connTarget) {
      toast.error("Source and destination cannot be the same node")
      return
    }
    onAddConnection(connSource, connTarget, connType)
    toast.success("Connection line established!")
  }

  return (
    <div className="w-[289px] sm:w-[306px] xl:w-[323px] max-w-[calc(100vw-60px)] h-full min-h-full flex flex-col border-l border-border bg-card/95 backdrop-blur-md shadow-xl select-none text-foreground shrink-0 overflow-hidden">
      {/* Tabs Navigation */}
      <div className="px-2 pt-2 pb-1.5 border-b border-border/80 bg-background/50 shrink-0">
        <div className="grid grid-cols-4 w-full h-8 text-[10.5px] p-0.5 rounded-lg bg-zinc-200/90 dark:bg-zinc-800/90 border border-zinc-300/40 dark:border-zinc-700/40">
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={cn(
              "text-[10.5px] px-0.5 py-1 rounded-md transition-all font-semibold cursor-pointer truncate",
              activeTab === "add"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            + Add
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("structure")}
            className={cn(
              "text-[10.5px] px-0.5 py-1 rounded-md transition-all font-semibold cursor-pointer truncate",
              activeTab === "structure"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Tree
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("inspector")}
            className={cn(
              "text-[10.5px] px-0.5 py-1 rounded-md transition-all font-semibold cursor-pointer relative truncate",
              activeTab === "inspector"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Inspect
            {selectedElement.id && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            className={cn(
              "text-[10.5px] px-0.5 py-1 rounded-md transition-all font-semibold cursor-pointer truncate",
              activeTab === "matrix" || activeTab === "footer"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Matrix
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB A: + ADD (Person, Department, Vacancy, Container, Text, Connector)     */}
      {/* ========================================================================= */}
      {activeTab === "add" && (
        <div className="flex-1 min-h-0 overflow-hidden m-0 p-0 flex flex-col">
          {/* Sub-selector for Add types (Person first by default, Department, Vacancy, Organization) */}
          <div className="p-3 border-b border-border/70 bg-muted/15 shrink-0">
            <div className="grid grid-cols-2 gap-2 w-full">
              {[
                { id: "person", label: "Person" },
                { id: "department", label: "Department" },
                { id: "required", label: "Vacancy" },
                { id: "organization", label: "Organization" },
              ].map((item) => {
                const isActive = addSubTab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAddSubTab(item.id as AddSubTab)}
                    className={cn(
                      "h-9 w-full rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center text-center px-1 select-none",
                      isActive
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold shadow-xs ring-1 ring-zinc-900/20 dark:ring-white/20"
                        : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 hover:border-border"
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pt-3 pb-44 overscroll-contain">
            {/* SUB-TAB 0: Add Organization */}
            {addSubTab === "organization" && (
              <form onSubmit={handleAddOrgSubmit} className="space-y-3.5 pb-6">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-[#c2410c]/15 text-[#c2410c]">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#c2410c]">Add Organization</span>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Organization Name *</Label>
                  <Input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Transvolt Mobility Private Limited"
                    className="h-8 text-xs bg-background"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Code / Subtitle (Optional)</Label>
                  <Input
                    value={orgCode}
                    onChange={(e) => setOrgCode(e.target.value)}
                    placeholder="e.g. HQ-GLOBAL"
                    className="h-8 text-xs bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Parent / Reporting Section</Label>
                  <select
                    value={orgParentId}
                    onChange={(e) => setOrgParentId(e.target.value)}
                    className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="ROOT">Top Level (Root Enterprise Node)</option>
                    {parentOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} ({opt.metadata.designation || opt.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Organization Tile Color Picker */}
                <div className="space-y-1.5 pt-1">
                  <Label className="text-[11px] font-semibold">Default Tile Color (Dark Orange)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={orgColor}
                      onChange={(e) => setOrgColor(e.target.value)}
                      className="h-8 w-9 rounded-md border border-input cursor-pointer p-0.5 bg-background shrink-0"
                    />
                    <Input
                      value={orgColor}
                      onChange={(e) => setOrgColor(e.target.value)}
                      className="h-8 text-xs font-mono uppercase"
                    />
                  </div>
                  {/* Quick Color Swatches */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {[
                      { label: "Dark Orange", color: "#c2410c" },
                      { label: "Electric Orange", color: "#ea580c" },
                      { label: "Deep Blue", color: "#1e40af" },
                      { label: "Slate Black", color: "#0f172a" },
                      { label: "Forest Green", color: "#15803d" },
                    ].map((swatch) => (
                      <button
                        key={swatch.color}
                        type="button"
                        title={swatch.label}
                        onClick={() => setOrgColor(swatch.color)}
                        className={cn(
                          "h-5 w-5 rounded-full border transition-transform cursor-pointer",
                          orgColor === swatch.color ? "ring-2 ring-primary ring-offset-1 scale-110" : "hover:scale-105"
                        )}
                        style={{ backgroundColor: swatch.color }}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-8.5 text-xs font-bold gap-1.5 bg-[#c2410c] hover:bg-[#9a3412] text-white cursor-pointer shadow-sm"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>+ Add Organization Tile</span>
                </Button>
              </form>
            )}
            {/* SUB-TAB 1: Add Person */}
            {addSubTab === "person" && (
              <form onSubmit={handleAddPersonSubmit} className="space-y-3.5 pb-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-[#16a34a]" />
                    <span className="text-xs font-bold uppercase tracking-wider">Add Person</span>
                  </div>
                  <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quickAddMode}
                      onChange={(e) => setQuickAddMode(e.target.checked)}
                      className="rounded border-input h-3 w-3"
                    />
                    <span>Quick-Add Mode</span>
                  </label>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Person Full Name *</Label>
                  <Input
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="h-8 text-xs bg-background"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Designation *</Label>
                  <Input
                    value={personDesignation}
                    onChange={(e) => setPersonDesignation(e.target.value)}
                    placeholder="e.g. Senior Service Engineer"
                    className="h-8 text-xs bg-background"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Employment Classification</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPersonType("EMPLOYEE")}
                      className={cn(
                        "flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg border-2 text-[10.5px] font-bold transition-all cursor-pointer select-none",
                        personType === "EMPLOYEE"
                          ? "border-slate-500 bg-slate-100 text-slate-900 dark:border-slate-400 dark:bg-slate-800 dark:text-slate-100 shadow-xs"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                      <span className="truncate">Employee</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPersonType("HOD")}
                      className={cn(
                        "flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg border-2 text-[10.5px] font-bold transition-all cursor-pointer select-none",
                        personType === "HOD"
                          ? "border-[#16a34a] bg-[#16a34a]/15 text-[#15803d] dark:text-[#22c55e] shadow-xs"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <span className="h-2 w-2 rounded-full bg-[#16a34a] shrink-0" />
                      <span className="truncate">Head of Dept</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPersonType("CONSULTANT")}
                      className={cn(
                        "flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg border-2 text-[10.5px] font-bold transition-all cursor-pointer select-none",
                        personType === "CONSULTANT"
                          ? "border-[#ea580c] bg-[#ea580c]/15 text-[#ea580c] shadow-xs"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <span className="h-2 w-2 rounded-full bg-[#ea580c] shrink-0" />
                      <span className="truncate">Consultant</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Reports To / Department</Label>
                  <select
                    value={personParentId}
                    onChange={(e) => setPersonParentId(e.target.value)}
                    className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="ROOT">Top Level / Independent</option>
                    {parentOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} ({opt.metadata.designation || opt.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Employee ID (Optional)</Label>
                    <Input
                      value={personEmpId}
                      onChange={(e) => setPersonEmpId(e.target.value)}
                      placeholder="e.g. TV-2026-042"
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Contact / Phone</Label>
                    <Input
                      value={personContact}
                      onChange={(e) => setPersonContact(e.target.value)}
                      placeholder="+91..."
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className={cn(
                    "w-full h-8 text-xs font-bold gap-1.5 text-white cursor-pointer shadow-sm",
                    personType === "HOD"
                      ? "bg-[#15803d] hover:bg-[#166534]"
                      : personType === "CONSULTANT"
                      ? "bg-[#ea580c] hover:bg-[#c2410c]"
                      : "bg-slate-700 hover:bg-slate-800"
                  )}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>
                    + Add {personType === "HOD" ? "Head of Department" : personType === "CONSULTANT" ? "Consultant" : "Employee"}
                  </span>
                </Button>
              </form>
            )}

            {/* SUB-TAB 2: Add Department */}
            {addSubTab === "department" && (
              <form onSubmit={handleAddDepartmentSubmit} className="space-y-3.5 pb-6">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <Building2 className="h-4 w-4 text-[#1e40af]" />
                  <span className="text-xs font-bold uppercase tracking-wider">Add Department</span>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Department Name *</Label>
                  <Input
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="e.g. Quality Assurance & OHS"
                    className="h-8 text-xs bg-background"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Department Code / Subtitle</Label>
                  <Input
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    placeholder="e.g. QA-04"
                    className="h-8 text-xs bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Parent Department / Lead</Label>
                  <select
                    value={deptParentId}
                    onChange={(e) => setDeptParentId(e.target.value)}
                    className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="ROOT">Top Level (Executive Reporting)</option>
                    {parentOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} ({opt.metadata.designation || opt.type})
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full h-8 text-xs font-bold gap-1.5 bg-[#1e40af] hover:bg-[#1d3596] text-white cursor-pointer shadow-sm"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>+ Add Department Section</span>
                </Button>
              </form>
            )}

            {/* SUB-TAB 3: Add Required Vacancy */}
            {addSubTab === "required" && (
              <form onSubmit={handleAddRequiredSubmit} className="space-y-3.5 pb-6">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">Add Required Vacancy</span>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Position Title *</Label>
                  <Input
                    value={reqDesignation}
                    onChange={(e) => setReqDesignation(e.target.value)}
                    placeholder="e.g. EV Battery Technician"
                    className="h-8 text-xs bg-background"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Required Quantity *</Label>
                  <Input
                    type="number"
                    min={1}
                    value={reqQuantity}
                    onChange={(e) => setReqQuantity(parseInt(e.target.value, 10) || 1)}
                    className="h-8 text-xs bg-background"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Department / Reporting</Label>
                  <select
                    value={reqParentId}
                    onChange={(e) => setReqParentId(e.target.value)}
                    className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
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
                  className="w-full h-8 text-xs font-bold border-dashed border-slate-400 hover:bg-muted cursor-pointer"
                >
                  + Add Vacancy Tile
                </Button>
              </form>
            )}

            {/* SUB-TAB 4: Add Grouping Container */}
            {addSubTab === "container" && (
              <form onSubmit={handleAddContainerSubmit} className="space-y-3.5 pb-6">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <SquareDashed className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider">Add Grouping Container</span>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Container Title *</Label>
                  <Input
                    value={containerTitle}
                    onChange={(e) => setContainerTitle(e.target.value)}
                    placeholder="e.g. PROJECT SITE (MBMT DEPOT)"
                    className="h-8 text-xs bg-background"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Border Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={containerColor}
                      onChange={(e) => setContainerColor(e.target.value)}
                      className="h-8 w-12 rounded cursor-pointer border border-input bg-background"
                    />
                    <Input
                      value={containerColor}
                      onChange={(e) => setContainerColor(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Border Stroke Style</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setContainerStyle("dashed")}
                      className={cn(
                        "py-1 text-xs font-semibold rounded-lg border cursor-pointer",
                        containerStyle === "dashed"
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      Dashed Stroke
                    </button>
                    <button
                      type="button"
                      onClick={() => setContainerStyle("solid")}
                      className={cn(
                        "py-1 text-xs font-semibold rounded-lg border cursor-pointer",
                        containerStyle === "solid"
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      Solid Stroke
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-8 text-xs font-bold gap-1.5 cursor-pointer shadow-sm"
                >
                  <SquareDashed className="h-3.5 w-3.5" />
                  <span>+ Place Container on Canvas</span>
                </Button>
              </form>
            )}

            {/* SUB-TAB 5: Add Text Annotation */}
            {addSubTab === "text" && (
              <form onSubmit={handleAddAnnotationSubmit} className="space-y-3.5 pb-6">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <Type className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider">Add Text Annotation</span>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Note / Annotation Content *</Label>
                  <textarea
                    rows={3}
                    value={annotationText}
                    onChange={(e) => setAnnotationText(e.target.value)}
                    placeholder="e.g. Phase-II Operations sanctioned by CEO office on 01-Sep-2026."
                    className="w-full p-2 text-xs rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-8 text-xs font-bold gap-1.5 cursor-pointer shadow-sm"
                >
                  <Type className="h-3.5 w-3.5" />
                  <span>+ Add Note to Canvas</span>
                </Button>
              </form>
            )}

            {/* SUB-TAB 6: Add Connector Line */}
            {addSubTab === "connector" && (
              <form onSubmit={handleAddConnectorSubmit} className="space-y-3.5 pb-6">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider">Connect Two Elements</span>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Source Node *</Label>
                  <select
                    value={connSource}
                    onChange={(e) => setConnSource(e.target.value)}
                    className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  >
                    <option value="">Select source element...</option>
                    {chart.nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.metadata.designation || n.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Target Node *</Label>
                  <select
                    value={connTarget}
                    onChange={(e) => setConnTarget(e.target.value)}
                    className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  >
                    <option value="">Select destination element...</option>
                    {chart.nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.metadata.designation || n.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Line Style</Label>
                  <select
                    value={connType}
                    onChange={(e) => setConnType(e.target.value as any)}
                    className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background"
                  >
                    <option value="orthogonal">Orthogonal / Elbow Line</option>
                    <option value="bezier">Curved Bezier Line</option>
                    <option value="straight">Direct Straight Line</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full h-8 text-xs font-bold gap-1.5 cursor-pointer shadow-sm"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>+ Create Connection</span>
                </Button>
              </form>
            )}

            {/* SUB-TAB 7: Add / Configure Chargers (Displays on Matrix, no effect on Org Chart) */}
            {addSubTab === "chargers" && (
              <form onSubmit={handleUpdateChargersSubmit} className="space-y-3.5 pb-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-[#16a34a]/15 text-[#16a34a]">
                      <Zap className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider block">Add EV Chargers</span>
                      <span className="text-[9.5px] text-muted-foreground">Matrix Fleet Infrastructure (no canvas clutter)</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10.5px] text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                  Directly configures chargers in <strong>Section C: Fleet &amp; Infrastructure Matrix</strong> without creating nodes on the canvas.
                </div>

                <div className="space-y-3 rounded-xl border border-border bg-card p-3.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Available / Operational Chargers</Label>
                    <Input
                      type="number"
                      min={0}
                      value={chargerAvail}
                      onChange={(e) => setChargerAvail(parseInt(e.target.value, 10) || 0)}
                      className="h-8 text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Required Chargers</Label>
                    <Input
                      type="number"
                      min={0}
                      value={chargerReq}
                      onChange={(e) => setChargerReq(parseInt(e.target.value, 10) || 0)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                    <span className="text-muted-foreground">Matrix Net Gap:</span>
                    <span className={cn(
                      "font-bold font-mono text-xs",
                      chargerAvail - chargerReq < 0 ? "text-red-600" : "text-[#16a34a]"
                    )}>
                      {chargerAvail - chargerReq >= 0 ? `+${chargerAvail - chargerReq}` : chargerAvail - chargerReq}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setChargerAvail((prev) => prev + 1)}
                      className="h-7 text-[10.5px] font-semibold rounded-md border border-border bg-muted/40 hover:bg-muted cursor-pointer"
                    >
                      + 1 Available
                    </button>
                    <button
                      type="button"
                      onClick={() => setChargerAvail((prev) => prev + 5)}
                      className="h-7 text-[10.5px] font-semibold rounded-md border border-border bg-muted/40 hover:bg-muted cursor-pointer"
                    >
                      + 5 Available
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-8.5 text-xs font-bold gap-2 bg-[#548235] hover:bg-[#466f2c] text-white shadow-xs cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Update Chargers in Matrix</span>
                </Button>
              </form>
            )}

            {/* SUB-TAB 8: Add / Configure Vehicles (Displays on Matrix, no effect on Org Chart) */}
            {addSubTab === "vehicles" && (
              <form onSubmit={handleUpdateVehiclesSubmit} className="space-y-3.5 pb-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-[#2563eb]/15 text-[#2563eb]">
                      <Truck className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider block">Add Fleet Vehicles</span>
                      <span className="text-[9.5px] text-muted-foreground">Matrix Fleet Infrastructure (no canvas clutter)</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10.5px] text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                  Directly configures electric vehicles in <strong>Section C: Fleet &amp; Infrastructure Matrix</strong> without creating nodes on the canvas.
                </div>

                <div className="space-y-3 rounded-xl border border-border bg-card p-3.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Available / Active Fleet EVs</Label>
                    <Input
                      type="number"
                      min={0}
                      value={vehicleAvail}
                      onChange={(e) => setVehicleAvail(parseInt(e.target.value, 10) || 0)}
                      className="h-8 text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Required Fleet EVs</Label>
                    <Input
                      type="number"
                      min={0}
                      value={vehicleReq}
                      onChange={(e) => setVehicleReq(parseInt(e.target.value, 10) || 0)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                    <span className="text-muted-foreground">Matrix Net Gap:</span>
                    <span className={cn(
                      "font-bold font-mono text-xs",
                      vehicleAvail - vehicleReq < 0 ? "text-red-600" : "text-[#16a34a]"
                    )}>
                      {vehicleAvail - vehicleReq >= 0 ? `+${vehicleAvail - vehicleReq}` : vehicleAvail - vehicleReq}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setVehicleAvail((prev) => prev + 5)}
                      className="h-7 text-[10.5px] font-semibold rounded-md border border-border bg-muted/40 hover:bg-muted cursor-pointer"
                    >
                      + 5 EVs
                    </button>
                    <button
                      type="button"
                      onClick={() => setVehicleAvail((prev) => prev + 10)}
                      className="h-7 text-[10.5px] font-semibold rounded-md border border-border bg-muted/40 hover:bg-muted cursor-pointer"
                    >
                      + 10 EVs
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-8.5 text-xs font-bold gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xs cursor-pointer"
                >
                  <Truck className="h-3.5 w-3.5" />
                  <span>Update Vehicles in Matrix</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB B: STRUCTURE / HIERARCHY TREE                                          */}
      {/* ========================================================================= */}
      {activeTab === "structure" && (
        <div className="flex-1 min-h-0 overflow-hidden m-0 p-0 flex flex-col">
          {/* Search Bar */}
          <div className="p-3 border-b border-border/70 bg-muted/10 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search hierarchy nodes..."
                value={treeSearch}
                onChange={(e) => setTreeSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pt-3 pb-44 overscroll-contain">
            <div className="space-y-2 pb-6">
              {/* Warnings / Orphan check */}
              {orphanNodes.length > 0 && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{orphanNodes.length} orphan node(s) detected without active parent.</span>
                </div>
              )}

              <div className="flex items-center justify-between pb-1 border-b border-border/80 text-xs">
                <span className="font-bold text-foreground">Hierarchy Nodes</span>
                <Badge variant="secondary" className="text-[10px]">
                  {filteredTreeNodes.length} Elements
                </Badge>
              </div>

              {/* Node List */}
              <div className="space-y-1 pt-1">
                {filteredTreeNodes.map((node) => {
                  const isSelected =
                    selectedElement.type === "node" && selectedElement.id === node.id
                  const isConsultant = node.metadata.employmentType === "CONSULTANT"

                  return (
                    <div
                      key={node.id}
                      onClick={() => onSelectElement("node", node.id)}
                      className={cn(
                        "group flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all",
                        isSelected
                          ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                          : "bg-card border-border hover:bg-muted/60 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {node.type === "EXECUTIVE" ? (
                          <span className="h-2 w-2 rounded-full bg-slate-900 shrink-0" />
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
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB C: CONTEXT-AWARE INSPECTOR                                             */}
      {/* ========================================================================= */}
      {activeTab === "inspector" && (
        <div className="flex-1 min-h-0 overflow-hidden m-0 p-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pt-3 pb-44 overscroll-contain">
            {/* Case 1: Person / Department / Vacancy Node Selected */}
            {selectedNode && (
              <div className="space-y-4 pb-6">
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1 mr-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      Selected {selectedNode.type}
                    </span>
                    <h4 className="text-sm font-extrabold text-foreground truncate">
                      {selectedNode.label}
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {selectedNode.metadata.designation || selectedNode.type}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() => onDuplicateNode(selectedNode.id)}
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                      onClick={() => onDeleteNode(selectedNode.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Title / Name</Label>
                    <Input
                      value={selectedNode.label}
                      onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  {selectedNode.type !== "DEPARTMENT" && (
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Designation</Label>
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

                  {/* Personnel Type Toggle (Employee, Head of Dept, Consultant) */}
                  {(selectedNode.type === "EMPLOYEE" ||
                    selectedNode.type === "CONSULTANT" ||
                    selectedNode.type === "HOD") && (
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold">Personnel Classification</Label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateNode(selectedNode.id, {
                              type: "EMPLOYEE",
                              metadata: {
                                ...selectedNode.metadata,
                                employmentType: "EMPLOYEE",
                                bgColor: "#ffffff",
                                color: "#94a3b8",
                                textColor: "#0f172a",
                              },
                            })
                          }
                          className={cn(
                            "py-1.5 px-1 text-[10.5px] font-bold rounded-lg border-2 cursor-pointer flex items-center justify-center gap-1",
                            selectedNode.metadata.employmentType === "EMPLOYEE" || selectedNode.type === "EMPLOYEE"
                              ? "border-slate-500 bg-slate-100 text-slate-900 dark:border-slate-400 dark:bg-slate-800 dark:text-slate-100 shadow-xs"
                              : "border-border bg-background text-muted-foreground"
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                          <span className="truncate">Employee</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateNode(selectedNode.id, {
                              type: "HOD",
                              metadata: {
                                ...selectedNode.metadata,
                                employmentType: "HOD",
                                bgColor: "#15803d",
                                color: "#166534",
                                textColor: "#ffffff",
                              },
                            })
                          }
                          className={cn(
                            "py-1.5 px-1 text-[10.5px] font-bold rounded-lg border-2 cursor-pointer flex items-center justify-center gap-1",
                            selectedNode.metadata.employmentType === "HOD" || selectedNode.type === "HOD"
                              ? "border-[#16a34a] bg-[#16a34a]/15 text-[#15803d] dark:text-[#22c55e] shadow-xs"
                              : "border-border bg-background text-muted-foreground"
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a] shrink-0" />
                          <span className="truncate">Head of Dept</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateNode(selectedNode.id, {
                              type: "CONSULTANT",
                              metadata: {
                                ...selectedNode.metadata,
                                employmentType: "CONSULTANT",
                                bgColor: "#ea580c",
                                color: "#c2410c",
                                textColor: "#ffffff",
                              },
                            })
                          }
                          className={cn(
                            "py-1.5 px-1 text-[10.5px] font-bold rounded-lg border-2 cursor-pointer flex items-center justify-center gap-1",
                            selectedNode.metadata.employmentType === "CONSULTANT" || selectedNode.type === "CONSULTANT"
                              ? "border-[#ea580c] bg-[#ea580c]/15 text-[#ea580c] shadow-xs"
                              : "border-border bg-background text-muted-foreground"
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#ea580c] shrink-0" />
                          <span className="truncate">Consultant</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Required Vacancy Quantity */}
                  {selectedNode.type === "REQUIRED_POSITION" && (
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Required Quantity</Label>
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
                    <Label className="text-[11px] font-semibold">Reports To / Parent Section</Label>
                    <select
                      value={selectedNode.parentId || "ROOT"}
                      onChange={(e) => {
                        const newParent = e.target.value === "ROOT" ? null : e.target.value
                        onChangeParent(selectedNode.id, newParent)
                      }}
                      className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="ROOT">Top Level / Independent</option>
                      {safeParentOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label} ({opt.metadata.designation || opt.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Position Coordinates & Dimensions */}
                  <div className="space-y-2 pt-1">
                    {/* Row 1: X & Y Axis */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">X Axis</Label>
                        <Input
                          type="number"
                          value={selectedNode.position.x}
                          onChange={(e) =>
                            onUpdateNode(selectedNode.id, {
                              position: { ...selectedNode.position, x: parseInt(e.target.value, 10) || 0 },
                            })
                          }
                          className="h-7 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Y Axis</Label>
                        <Input
                          type="number"
                          value={selectedNode.position.y}
                          onChange={(e) =>
                            onUpdateNode(selectedNode.id, {
                              position: { ...selectedNode.position, y: parseInt(e.target.value, 10) || 0 },
                            })
                          }
                          className="h-7 text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Row 2: Width & Height */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Width</Label>
                        <Input
                          type="number"
                          min="80"
                          max="800"
                          value={
                            selectedNode.width ??
                            (selectedNode.type === "ORGANIZATION"
                              ? 220
                              : selectedNode.type === "EXECUTIVE"
                              ? 190
                              : selectedNode.type === "DEPARTMENT"
                              ? 195
                              : 180)
                          }
                          onChange={(e) =>
                            onUpdateNode(selectedNode.id, {
                              width: Math.max(80, parseInt(e.target.value, 10) || 80),
                            })
                          }
                          className="h-7 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Height</Label>
                        <Input
                          type="number"
                          min="36"
                          max="500"
                          value={
                            selectedNode.height ??
                            (selectedNode.type === "ORGANIZATION"
                              ? 56
                              : selectedNode.type === "EXECUTIVE"
                              ? 52
                              : selectedNode.type === "DEPARTMENT"
                              ? 48
                              : 54)
                          }
                          onChange={(e) =>
                            onUpdateNode(selectedNode.id, {
                              height: Math.max(36, parseInt(e.target.value, 10) || 36),
                            })
                          }
                          className="h-7 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tile Styles & Color Customization (For Every Selected Tile) */}
                <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between pb-1 border-b border-border/60">
                    <div className="flex items-center gap-1.5">
                      <PaintBucket className="h-3.5 w-3.5 text-primary" />
                      <Label className="text-[11px] font-bold uppercase tracking-wider">Tile Styles &amp; Color</Label>
                    </div>
                    {(selectedNode.metadata.bgColor || selectedNode.metadata.color || selectedNode.metadata.textColor) && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedMeta = { ...selectedNode.metadata }
                          delete updatedMeta.bgColor
                          delete updatedMeta.color
                          delete updatedMeta.textColor
                          onUpdateNode(selectedNode.id, { metadata: updatedMeta })
                          toast.info("Tile style reset to default")
                        }}
                        className="text-[10px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                      >
                        Reset Style
                      </button>
                    )}
                  </div>

                  {/* Quick Color Swatches */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-muted-foreground">Quick Palette</Label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { name: "Dark Orange", bg: "#c2410c", border: "#9a3412", text: "#ffffff" },
                        { name: "Electric Orange", bg: "#ea580c", border: "#c2410c", text: "#ffffff" },
                        { name: "Navy Blue", bg: "#1e40af", border: "#1e3a8a", text: "#ffffff" },
                        { name: "Slate Black", bg: "#0f172a", border: "#1e293b", text: "#ffffff" },
                        { name: "Forest Green", bg: "#15803d", border: "#166534", text: "#ffffff" },
                        { name: "Emerald", bg: "#16a34a", border: "#15803d", text: "#ffffff" },
                        { name: "Amber Gold", bg: "#d97706", border: "#b45309", text: "#ffffff" },
                        { name: "Crimson", bg: "#b91c1c", border: "#991b1b", text: "#ffffff" },
                        { name: "Deep Purple", bg: "#7e22ce", border: "#6b21a8", text: "#ffffff" },
                        { name: "Clean White", bg: "#ffffff", border: "#cbd5e1", text: "#0f172a" },
                      ].map((swatch) => {
                        const isCurrent =
                          (selectedNode.metadata.bgColor || (selectedNode.type === "ORGANIZATION" ? "#c2410c" : selectedNode.type === "DEPARTMENT" ? "#1e40af" : "")) === swatch.bg
                        return (
                          <button
                            key={swatch.bg}
                            type="button"
                            title={swatch.name}
                            onClick={() => {
                              onUpdateNode(selectedNode.id, {
                                metadata: {
                                  ...selectedNode.metadata,
                                  bgColor: swatch.bg,
                                  color: swatch.border,
                                  textColor: swatch.text,
                                },
                              })
                            }}
                            className={cn(
                              "h-6 rounded-md border transition-all cursor-pointer relative flex items-center justify-center",
                              isCurrent ? "ring-2 ring-primary ring-offset-1 scale-105 z-10" : "hover:scale-105"
                            )}
                            style={{ backgroundColor: swatch.bg, borderColor: swatch.border }}
                          >
                            {isCurrent && (
                              <CheckCircle2
                                className={cn("h-3 w-3", swatch.text === "#ffffff" ? "text-white" : "text-black")}
                              />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Custom Background Color Picker */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Fill / Background</Label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={selectedNode.metadata.bgColor || (selectedNode.type === "ORGANIZATION" ? "#c2410c" : selectedNode.type === "DEPARTMENT" ? "#1e40af" : "#ffffff")}
                          onChange={(e) =>
                            onUpdateNode(selectedNode.id, {
                              metadata: { ...selectedNode.metadata, bgColor: e.target.value },
                            })
                          }
                          className="h-7 w-7 rounded border border-input cursor-pointer p-0.5 bg-background shrink-0"
                        />
                        <Input
                          value={selectedNode.metadata.bgColor || (selectedNode.type === "ORGANIZATION" ? "#c2410c" : selectedNode.type === "DEPARTMENT" ? "#1e40af" : "#ffffff")}
                          onChange={(e) =>
                            onUpdateNode(selectedNode.id, {
                              metadata: { ...selectedNode.metadata, bgColor: e.target.value },
                            })
                          }
                          className="h-7 text-xs font-mono uppercase px-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Border / Stroke</Label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={selectedNode.metadata.color || (selectedNode.type === "ORGANIZATION" ? "#9a3412" : selectedNode.type === "DEPARTMENT" ? "#1e3a8a" : "#16a34a")}
                          onChange={(e) =>
                            onUpdateNode(selectedNode.id, {
                              metadata: { ...selectedNode.metadata, color: e.target.value },
                            })
                          }
                          className="h-7 w-7 rounded border border-input cursor-pointer p-0.5 bg-background shrink-0"
                        />
                        <Input
                          value={selectedNode.metadata.color || (selectedNode.type === "ORGANIZATION" ? "#9a3412" : selectedNode.type === "DEPARTMENT" ? "#1e3a8a" : "#16a34a")}
                          onChange={(e) =>
                            onUpdateNode(selectedNode.id, {
                              metadata: { ...selectedNode.metadata, color: e.target.value },
                            })
                          }
                          className="h-7 text-xs font-mono uppercase px-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Text Color Switcher */}
                  <div className="space-y-1 pt-1">
                    <Label className="text-[10px] text-muted-foreground">Text Color</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateNode(selectedNode.id, {
                            metadata: { ...selectedNode.metadata, textColor: "#ffffff" },
                          })
                        }
                        className={cn(
                          "h-7 rounded-md border text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer bg-zinc-900 text-white",
                          selectedNode.metadata.textColor === "#ffffff" ? "ring-2 ring-primary ring-offset-1 font-bold" : "opacity-80 hover:opacity-100"
                        )}
                      >
                        White Text
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateNode(selectedNode.id, {
                            metadata: { ...selectedNode.metadata, textColor: "#0f172a" },
                          })
                        }
                        className={cn(
                          "h-7 rounded-md border text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer bg-white text-zinc-900 border-zinc-300",
                          selectedNode.metadata.textColor === "#0f172a" ? "ring-2 ring-primary ring-offset-1 font-bold" : "opacity-80 hover:opacity-100"
                        )}
                      >
                        Dark Text
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Case 2: Connection Line Selected */}
            {selectedConnection && (
              <div className="space-y-4 pb-6">
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      Selected Connector
                    </span>
                    <h4 className="text-xs font-bold text-foreground">Hierarchy Relationship</h4>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                    onClick={() => onDeleteConnection(selectedConnection.id)}
                    title="Delete Connector"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Connector Type</Label>
                    <select
                      value={selectedConnection.type || "orthogonal"}
                      onChange={(e) =>
                        onUpdateConnection(selectedConnection.id, { type: e.target.value as any })
                      }
                      className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background"
                    >
                      <option value="orthogonal">Orthogonal / Elbow</option>
                      <option value="bezier">Curved Bezier</option>
                      <option value="straight">Straight Line</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Optional Label</Label>
                    <Input
                      value={selectedConnection.label || ""}
                      onChange={(e) =>
                        onUpdateConnection(selectedConnection.id, { label: e.target.value })
                      }
                      placeholder="e.g. Reports Directly"
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="conn-dashed"
                      checked={selectedConnection.dashed || false}
                      onChange={(e) =>
                        onUpdateConnection(selectedConnection.id, { dashed: e.target.checked })
                      }
                      className="rounded border-input h-3.5 w-3.5"
                    />
                    <label htmlFor="conn-dashed" className="text-xs font-medium cursor-pointer">
                      Dashed Stroke
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Case 3: Grouping Container Selected */}
            {selectedBoundary && (
              <div className="space-y-4 pb-12">
                {/* Header */}
                <div className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
                      Rectangle Properties
                    </span>
                    <h4 className="text-xs font-bold text-foreground truncate">
                      {selectedBoundary.title || "Untitled Zone"}
                    </h4>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                    onClick={() => onDeleteBoundary(selectedBoundary.id)}
                    title="Delete Rectangle"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* 1. Name & Any-Side Placement */}
                <div className="space-y-3 rounded-xl border border-border bg-card p-3.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Zone / Rectangle Name</Label>
                    <Input
                      value={selectedBoundary.title}
                      onChange={(e) =>
                        onUpdateBoundary(selectedBoundary.id, { title: e.target.value })
                      }
                      placeholder="e.g. PROJECT SITE OPERATIONS"
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Name Placement (Any Side)</Label>
                    <select
                      value={selectedBoundary.titlePosition || "top-left-outside"}
                      onChange={(e) =>
                        onUpdateBoundary(selectedBoundary.id, {
                          titlePosition: e.target.value as BoundaryTitlePosition,
                        })
                      }
                      className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <optgroup label="Outside the Box (Recommended)">
                        <option value="top-left-outside">Top-Left (Outside - Default)</option>
                        <option value="top-center-outside">Top-Center (Outside)</option>
                        <option value="top-right-outside">Top-Right (Outside)</option>
                        <option value="bottom-left-outside">Bottom-Left (Outside)</option>
                        <option value="bottom-center-outside">Bottom-Center (Outside)</option>
                        <option value="bottom-right-outside">Bottom-Right (Outside)</option>
                      </optgroup>
                      <optgroup label="Inside the Box">
                        <option value="top-left-inside">Top-Left (Inside)</option>
                        <option value="top-center-inside">Top-Center (Inside)</option>
                        <option value="top-right-inside">Top-Right (Inside)</option>
                        <option value="bottom-left-inside">Bottom-Left (Inside)</option>
                        <option value="bottom-center-inside">Bottom-Center (Inside)</option>
                        <option value="bottom-right-inside">Bottom-Right (Inside)</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* 2. Line Type (Dotted, Plain / Solid, Dashed) */}
                <div className="space-y-2 rounded-xl border border-border bg-card p-3.5">
                  <Label className="text-[11px] font-semibold">Line Type (Stroke Style)</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { val: "dotted", label: "Dotted" },
                      { val: "solid", label: "Plain (Solid)" },
                      { val: "dashed", label: "Dashed" },
                    ].map((style) => (
                      <Button
                        key={style.val}
                        type="button"
                        variant={
                          (selectedBoundary.borderStyle || "dashed") === style.val
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="h-8 text-xs font-semibold"
                        onClick={() =>
                          onUpdateBoundary(selectedBoundary.id, {
                            borderStyle: style.val as any,
                          })
                        }
                      >
                        {style.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 3. Stroke Thickness & Colors (Stroke & Fill) */}
                <div className="space-y-3 rounded-xl border border-border bg-card p-3.5">
                  {/* Stroke Thickness */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Stroke Thickness</Label>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-7 text-xs font-bold"
                        onClick={() => {
                          const cur = selectedBoundary.strokeWidth ?? 1.5
                          onUpdateBoundary(selectedBoundary.id, {
                            strokeWidth: Math.max(1, cur - 0.5),
                          })
                        }}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        step="0.5"
                        min="1"
                        max="12"
                        value={selectedBoundary.strokeWidth ?? 1.5}
                        onChange={(e) =>
                          onUpdateBoundary(selectedBoundary.id, {
                            strokeWidth: parseFloat(e.target.value) || 1.5,
                          })
                        }
                        className="h-8 text-xs font-mono text-center px-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-7 text-xs font-bold"
                        onClick={() => {
                          const cur = selectedBoundary.strokeWidth ?? 1.5
                          onUpdateBoundary(selectedBoundary.id, {
                            strokeWidth: Math.min(12, cur + 0.5),
                          })
                        }}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Stroke Color */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Stroke Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedBoundary.color || "#548235"}
                        onChange={(e) =>
                          onUpdateBoundary(selectedBoundary.id, { color: e.target.value })
                        }
                        className="h-8 w-10 rounded cursor-pointer border border-input bg-background"
                      />
                      <Input
                        value={selectedBoundary.color || "#548235"}
                        onChange={(e) =>
                          onUpdateBoundary(selectedBoundary.id, { color: e.target.value })
                        }
                        className="h-8 text-xs font-mono uppercase"
                      />
                    </div>
                    {/* Quick Swatches */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {["#548235", "#1e3a8a", "#0f172a", "#b91c1c", "#ea580c", "#6b21a8", "#64748b"].map(
                        (col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => onUpdateBoundary(selectedBoundary.id, { color: col })}
                            className="h-5 w-5 rounded-full border border-border cursor-pointer transition-transform hover:scale-110 shadow-2xs"
                            style={{ backgroundColor: col }}
                            title={col}
                          />
                        )
                      )}
                    </div>
                  </div>

                  {/* Fill Color */}
                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-semibold">Fill Color</Label>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateBoundary(selectedBoundary.id, {
                            bgColor:
                              selectedBoundary.bgColor && selectedBoundary.bgColor !== "transparent"
                                ? "transparent"
                                : "rgba(248, 250, 252, 0.4)",
                          })
                        }
                        className="text-[10px] text-primary hover:underline cursor-pointer"
                      >
                        {selectedBoundary.bgColor === "transparent" ? "Enable Fill" : "Transparent"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={
                          selectedBoundary.bgColor && selectedBoundary.bgColor.startsWith("#")
                            ? selectedBoundary.bgColor
                            : "#f8fafc"
                        }
                        onChange={(e) =>
                          onUpdateBoundary(selectedBoundary.id, { bgColor: e.target.value })
                        }
                        className="h-8 w-10 rounded cursor-pointer border border-input bg-background"
                      />
                      <Input
                        value={selectedBoundary.bgColor || "rgba(248, 250, 252, 0.4)"}
                        onChange={(e) =>
                          onUpdateBoundary(selectedBoundary.id, { bgColor: e.target.value })
                        }
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Four-Side Curves (Corner Radius) */}
                <div className="space-y-3 rounded-xl border border-border bg-card p-3.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-semibold">Four Side Curves (Corner Radius)</Label>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {selectedBoundary.borderRadius !== undefined ? `${selectedBoundary.borderRadius}px` : "16px"}
                    </span>
                  </div>

                  {/* Uniform Curve Slider */}
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="48"
                      value={selectedBoundary.borderRadius !== undefined ? selectedBoundary.borderRadius : 16}
                      onChange={(e) =>
                        onUpdateBoundary(selectedBoundary.id, {
                          borderRadius: parseInt(e.target.value, 10),
                          borderRadiusIndividual: undefined,
                        })
                      }
                      className="flex-1 cursor-pointer accent-primary"
                    />
                    <Input
                      type="number"
                      min="0"
                      max="48"
                      value={selectedBoundary.borderRadius !== undefined ? selectedBoundary.borderRadius : 16}
                      onChange={(e) =>
                        onUpdateBoundary(selectedBoundary.id, {
                          borderRadius: parseInt(e.target.value, 10) || 0,
                          borderRadiusIndividual: undefined,
                        })
                      }
                      className="h-8 w-14 text-xs font-mono text-center"
                    />
                  </div>

                  {/* Individual 4 Corner Controls */}
                  <div className="pt-2 border-t border-border/60 space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Individual 4 Corner Curves
                    </Label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">Top-Left</span>
                        <Input
                          type="number"
                          min="0"
                          max="48"
                          value={
                            selectedBoundary.borderRadiusIndividual?.topLeft ??
                            selectedBoundary.borderRadius ??
                            16
                          }
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0
                            const current = selectedBoundary.borderRadiusIndividual || {
                              topLeft: selectedBoundary.borderRadius ?? 16,
                              topRight: selectedBoundary.borderRadius ?? 16,
                              bottomRight: selectedBoundary.borderRadius ?? 16,
                              bottomLeft: selectedBoundary.borderRadius ?? 16,
                            }
                            onUpdateBoundary(selectedBoundary.id, {
                              borderRadiusIndividual: { ...current, topLeft: val },
                            })
                          }}
                          className="h-7 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">Top-Right</span>
                        <Input
                          type="number"
                          min="0"
                          max="48"
                          value={
                            selectedBoundary.borderRadiusIndividual?.topRight ??
                            selectedBoundary.borderRadius ??
                            16
                          }
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0
                            const current = selectedBoundary.borderRadiusIndividual || {
                              topLeft: selectedBoundary.borderRadius ?? 16,
                              topRight: selectedBoundary.borderRadius ?? 16,
                              bottomRight: selectedBoundary.borderRadius ?? 16,
                              bottomLeft: selectedBoundary.borderRadius ?? 16,
                            }
                            onUpdateBoundary(selectedBoundary.id, {
                              borderRadiusIndividual: { ...current, topRight: val },
                            })
                          }}
                          className="h-7 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">Bottom-Left</span>
                        <Input
                          type="number"
                          min="0"
                          max="48"
                          value={
                            selectedBoundary.borderRadiusIndividual?.bottomLeft ??
                            selectedBoundary.borderRadius ??
                            16
                          }
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0
                            const current = selectedBoundary.borderRadiusIndividual || {
                              topLeft: selectedBoundary.borderRadius ?? 16,
                              topRight: selectedBoundary.borderRadius ?? 16,
                              bottomRight: selectedBoundary.borderRadius ?? 16,
                              bottomLeft: selectedBoundary.borderRadius ?? 16,
                            }
                            onUpdateBoundary(selectedBoundary.id, {
                              borderRadiusIndividual: { ...current, bottomLeft: val },
                            })
                          }}
                          className="h-7 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground">Bottom-Right</span>
                        <Input
                          type="number"
                          min="0"
                          max="48"
                          value={
                            selectedBoundary.borderRadiusIndividual?.bottomRight ??
                            selectedBoundary.borderRadius ??
                            16
                          }
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0
                            const current = selectedBoundary.borderRadiusIndividual || {
                              topLeft: selectedBoundary.borderRadius ?? 16,
                              topRight: selectedBoundary.borderRadius ?? 16,
                              bottomRight: selectedBoundary.borderRadius ?? 16,
                              bottomLeft: selectedBoundary.borderRadius ?? 16,
                            }
                            onUpdateBoundary(selectedBoundary.id, {
                              borderRadiusIndividual: { ...current, bottomRight: val },
                            })
                          }}
                          className="h-7 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Dimensions */}
                <div className="space-y-3 rounded-xl border border-border bg-card p-3.5">
                  <Label className="text-[11px] font-semibold">Dimensions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Width (px)</Label>
                      <Input
                        type="number"
                        value={selectedBoundary.width}
                        onChange={(e) =>
                          onUpdateBoundary(selectedBoundary.id, {
                            width: parseInt(e.target.value, 10) || 200,
                          })
                        }
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Height (px)</Label>
                      <Input
                        type="number"
                        value={selectedBoundary.height}
                        onChange={(e) =>
                          onUpdateBoundary(selectedBoundary.id, {
                            height: parseInt(e.target.value, 10) || 100,
                          })
                        }
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Case 4: Text Annotation Selected (CorelDRAW Text Property Panel) */}
            {selectedAnnotation && (
              <div className="space-y-4 pb-6">
                {/* Header */}
                <div className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
                      Text Properties (Corel Inspector)
                    </span>
                    <h4 className="text-xs font-bold text-foreground truncate">
                      {selectedAnnotation.text || "Note"}
                    </h4>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                    onClick={() => onDeleteAnnotation(selectedAnnotation.id)}
                    title="Delete Annotation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* 1. Text Content */}
                <div className="space-y-1.5 rounded-xl border border-border bg-card p-3.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-semibold">Content</Label>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {selectedAnnotation.text.length} chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={selectedAnnotation.text}
                    onChange={(e) =>
                      onUpdateAnnotation(selectedAnnotation.id, { text: e.target.value })
                    }
                    className="w-full p-2 text-xs rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                    placeholder="Enter text annotation content..."
                  />
                </div>

                {/* 2. Character & Typography Panel */}
                <div className="space-y-3 rounded-xl border border-border bg-card p-3.5">
                  <div className="flex items-center gap-1.5 border-b border-border/60 pb-1.5">
                    <Type className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Typography</span>
                  </div>

                  {/* Font Family */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Font Family</Label>
                    <select
                      value={selectedAnnotation.fontFamily || "Inter, sans-serif"}
                      onChange={(e) =>
                        onUpdateAnnotation(selectedAnnotation.id, { fontFamily: e.target.value })
                      }
                      className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="Inter, sans-serif">Inter (Clean Sans)</option>
                      <option value="Roboto, sans-serif">Roboto (Modern Sans)</option>
                      <option value="Outfit, sans-serif">Outfit (Display Sans)</option>
                      <option value="Poppins, sans-serif">Poppins (Geometric)</option>
                      <option value="Montserrat, sans-serif">Montserrat (Geometric Sans)</option>
                      <option value="Arial, sans-serif">Arial (Standard Sans)</option>
                      <option value="Georgia, serif">Georgia (Editorial Serif)</option>
                      <option value="'Times New Roman', serif">Times New Roman (Classic)</option>
                      <option value="'Courier New', monospace">Courier New (Monospace)</option>
                    </select>
                  </div>

                  {/* Font Size & Weight Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Font Size</Label>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-7 text-xs font-bold"
                          onClick={() => {
                            const cur = selectedAnnotation.fontSize || 13
                            onUpdateAnnotation(selectedAnnotation.id, {
                              fontSize: Math.max(9, cur - 1),
                            })
                          }}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={selectedAnnotation.fontSize || 13}
                          onChange={(e) =>
                            onUpdateAnnotation(selectedAnnotation.id, {
                              fontSize: parseInt(e.target.value, 10) || 13,
                            })
                          }
                          className="h-8 text-xs font-mono text-center px-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-7 text-xs font-bold"
                          onClick={() => {
                            const cur = selectedAnnotation.fontSize || 13
                            onUpdateAnnotation(selectedAnnotation.id, {
                              fontSize: Math.min(72, cur + 1),
                            })
                          }}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Font Weight</Label>
                      <select
                        value={selectedAnnotation.fontWeight || "500"}
                        onChange={(e) =>
                          onUpdateAnnotation(selectedAnnotation.id, { fontWeight: e.target.value })
                        }
                        className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background"
                      >
                        <option value="400">Regular (400)</option>
                        <option value="500">Medium (500)</option>
                        <option value="600">Semi-Bold (600)</option>
                        <option value="700">Bold (700)</option>
                        <option value="800">Extra Bold (800)</option>
                        <option value="900">Black (900)</option>
                      </select>
                    </div>
                  </div>

                  {/* Character Styles: Bold, Italic, Underline, Strikethrough */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Character Style</Label>
                    <div className="grid grid-cols-4 gap-1.5">
                      <Button
                        type="button"
                        variant={selectedAnnotation.fontWeight === "700" ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-xs font-bold"
                        onClick={() =>
                          onUpdateAnnotation(selectedAnnotation.id, {
                            fontWeight: selectedAnnotation.fontWeight === "700" ? "500" : "700",
                          })
                        }
                        title="Bold"
                      >
                        <Bold className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant={selectedAnnotation.fontStyle === "italic" ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() =>
                          onUpdateAnnotation(selectedAnnotation.id, {
                            fontStyle: selectedAnnotation.fontStyle === "italic" ? "normal" : "italic",
                          })
                        }
                        title="Italic"
                      >
                        <Italic className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant={
                          selectedAnnotation.textDecoration === "underline" ? "default" : "outline"
                        }
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() =>
                          onUpdateAnnotation(selectedAnnotation.id, {
                            textDecoration:
                              selectedAnnotation.textDecoration === "underline" ? "none" : "underline",
                          })
                        }
                        title="Underline"
                      >
                        <Underline className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant={
                          selectedAnnotation.textDecoration === "line-through"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() =>
                          onUpdateAnnotation(selectedAnnotation.id, {
                            textDecoration:
                              selectedAnnotation.textDecoration === "line-through"
                                ? "none"
                                : "line-through",
                          })
                        }
                        title="Strikethrough"
                      >
                        <Strikethrough className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Text Transform / Case */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Text Case</Label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: "Aa", val: "none", title: "As Entered" },
                        { label: "AA", val: "uppercase", title: "UPPERCASE" },
                        { label: "aa", val: "lowercase", title: "lowercase" },
                        { label: "Ab", val: "capitalize", title: "Capitalize" },
                      ].map((item) => (
                        <Button
                          key={item.val}
                          type="button"
                          variant={
                            (selectedAnnotation.textTransform || "none") === item.val
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="h-7 text-xs font-mono"
                          onClick={() =>
                            onUpdateAnnotation(selectedAnnotation.id, {
                              textTransform: item.val as any,
                            })
                          }
                          title={item.title}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Paragraph & Alignment Panel */}
                <div className="space-y-3 rounded-xl border border-border bg-card p-3.5">
                  <div className="flex items-center gap-1.5 border-b border-border/60 pb-1.5">
                    <AlignLeft className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Paragraph &amp; Flow</span>
                  </div>

                  {/* Alignment buttons */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Alignment</Label>
                    <div className="grid grid-cols-4 gap-1.5">
                      <Button
                        type="button"
                        variant={
                          (selectedAnnotation.textAlign || "left") === "left"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="h-7"
                        onClick={() =>
                          onUpdateAnnotation(selectedAnnotation.id, { textAlign: "left" })
                        }
                        title="Align Left"
                      >
                        <AlignLeft className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant={
                          selectedAnnotation.textAlign === "center" ? "default" : "outline"
                        }
                        size="sm"
                        className="h-7"
                        onClick={() =>
                          onUpdateAnnotation(selectedAnnotation.id, { textAlign: "center" })
                        }
                        title="Align Center"
                      >
                        <AlignCenter className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant={
                          selectedAnnotation.textAlign === "right" ? "default" : "outline"
                        }
                        size="sm"
                        className="h-7"
                        onClick={() =>
                          onUpdateAnnotation(selectedAnnotation.id, { textAlign: "right" })
                        }
                        title="Align Right"
                      >
                        <AlignRight className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant={
                          selectedAnnotation.textAlign === "justify" ? "default" : "outline"
                        }
                        size="sm"
                        className="h-7"
                        onClick={() =>
                          onUpdateAnnotation(selectedAnnotation.id, { textAlign: "justify" })
                        }
                        title="Justify"
                      >
                        <AlignJustify className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Line Height & Letter Spacing */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Line Height</Label>
                      <select
                        value={selectedAnnotation.lineHeight || 1.4}
                        onChange={(e) =>
                          onUpdateAnnotation(selectedAnnotation.id, {
                            lineHeight: parseFloat(e.target.value) || 1.4,
                          })
                        }
                        className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background"
                      >
                        <option value="1.0">1.0 (Tight)</option>
                        <option value="1.2">1.2 (Compact)</option>
                        <option value="1.4">1.4 (Normal)</option>
                        <option value="1.6">1.6 (Relaxed)</option>
                        <option value="2.0">2.0 (Double)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Letter Spacing</Label>
                      <select
                        value={selectedAnnotation.letterSpacing ?? 0}
                        onChange={(e) =>
                          onUpdateAnnotation(selectedAnnotation.id, {
                            letterSpacing: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background font-mono"
                      >
                        <option value="-0.5">-0.5px</option>
                        <option value="0">0px (Default)</option>
                        <option value="1">+1.0px</option>
                        <option value="2">+2.0px</option>
                        <option value="3">+3.0px</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Color & Body Fill Panel */}
                <div className="space-y-3 rounded-xl border border-border bg-card p-3.5">
                  <div className="flex items-center gap-1.5 border-b border-border/60 pb-1.5">
                    <PaintBucket className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Color &amp; Body Fill</span>
                  </div>

                  {/* Text Color */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold">Text Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedAnnotation.color || "#0f172a"}
                        onChange={(e) =>
                          onUpdateAnnotation(selectedAnnotation.id, { color: e.target.value })
                        }
                        className="h-8 w-10 rounded cursor-pointer border border-input bg-background"
                      />
                      <Input
                        value={selectedAnnotation.color || "#0f172a"}
                        onChange={(e) =>
                          onUpdateAnnotation(selectedAnnotation.id, { color: e.target.value })
                        }
                        className="h-8 text-xs font-mono uppercase"
                      />
                    </div>
                    {/* Quick Swatches */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {["#0f172a", "#1e3a8a", "#15803d", "#b91c1c", "#6b21a8", "#c2410c", "#475569"].map(
                        (col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => onUpdateAnnotation(selectedAnnotation.id, { color: col })}
                            className="h-5 w-5 rounded-full border border-border cursor-pointer transition-transform hover:scale-110 shadow-2xs"
                            style={{ backgroundColor: col }}
                            title={col}
                          />
                        )
                      )}
                    </div>
                  </div>

                  {/* Background Body Fill (Toggleable, Defaults to Transparent) */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bg-fill-toggle" className="text-[11px] font-semibold cursor-pointer">
                        Background Body Fill
                      </Label>
                      <input
                        id="bg-fill-toggle"
                        type="checkbox"
                        checked={
                          !!selectedAnnotation.bgColor &&
                          selectedAnnotation.bgColor !== "transparent"
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            onUpdateAnnotation(selectedAnnotation.id, {
                              bgColor: "rgba(255, 255, 255, 0.95)",
                            })
                          } else {
                            onUpdateAnnotation(selectedAnnotation.id, {
                              bgColor: "transparent",
                            })
                          }
                        }}
                        className="rounded border-input h-3.5 w-3.5 cursor-pointer"
                      />
                    </div>

                    {selectedAnnotation.bgColor && selectedAnnotation.bgColor !== "transparent" && (
                      <div className="space-y-1.5 pl-2 border-l-2 border-primary/40">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={
                              selectedAnnotation.bgColor.startsWith("#")
                                ? selectedAnnotation.bgColor
                                : "#ffffff"
                            }
                            onChange={(e) =>
                              onUpdateAnnotation(selectedAnnotation.id, { bgColor: e.target.value })
                            }
                            className="h-7 w-9 rounded cursor-pointer border border-input bg-background"
                          />
                          <Input
                            value={selectedAnnotation.bgColor}
                            onChange={(e) =>
                              onUpdateAnnotation(selectedAnnotation.id, { bgColor: e.target.value })
                            }
                            className="h-7 text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Outline / Border Panel */}
                <div className="space-y-3 rounded-xl border border-border bg-card p-3.5">
                  <div className="flex items-center gap-1.5 border-b border-border/60 pb-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Outline / Border</span>
                  </div>

                  {/* Border Style */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Border Style</Label>
                    <select
                      value={selectedAnnotation.borderStyle || "none"}
                      onChange={(e) =>
                        onUpdateAnnotation(selectedAnnotation.id, {
                          borderStyle: e.target.value as any,
                          borderColor:
                            e.target.value === "none"
                              ? "transparent"
                              : selectedAnnotation.borderColor &&
                                selectedAnnotation.borderColor !== "transparent"
                              ? selectedAnnotation.borderColor
                              : "#94a3b8",
                        })
                      }
                      className="w-full h-8 px-2 text-xs rounded-lg border border-input bg-background"
                    >
                      <option value="none">None (No Outline)</option>
                      <option value="solid">Solid Stroke</option>
                      <option value="dashed">Dashed Stroke</option>
                      <option value="dotted">Dotted Stroke</option>
                    </select>
                  </div>

                  {selectedAnnotation.borderStyle && selectedAnnotation.borderStyle !== "none" && (
                    <div className="space-y-2 pt-1 pl-2 border-l-2 border-primary/40">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold">Border Color</Label>
                          <input
                            type="color"
                            value={
                              selectedAnnotation.borderColor &&
                              selectedAnnotation.borderColor !== "transparent"
                                ? selectedAnnotation.borderColor
                                : "#94a3b8"
                            }
                            onChange={(e) =>
                              onUpdateAnnotation(selectedAnnotation.id, { borderColor: e.target.value })
                            }
                            className="h-7 w-full rounded cursor-pointer border border-input bg-background"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold">Corner Radius</Label>
                          <select
                            value={selectedAnnotation.borderRadius ?? 6}
                            onChange={(e) =>
                              onUpdateAnnotation(selectedAnnotation.id, {
                                borderRadius: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className="w-full h-7 px-1.5 text-xs rounded border border-input bg-background"
                          >
                            <option value="0">0px (Sharp)</option>
                            <option value="4">4px</option>
                            <option value="8">8px</option>
                            <option value="12">12px</option>
                            <option value="999">Pill / Circle</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Shape Inspector */}
            {selectedShape && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Shapes className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground capitalize">
                        {selectedShape.kind.replace(/-/g, " ")} Shape
                      </h4>
                      <p className="text-[10px] text-muted-foreground">Vector shape properties</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {onDuplicateShape && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Duplicate shape"
                        onClick={() => onDuplicateShape(selectedShape.id)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {onDeleteShape && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        title="Delete shape"
                        onClick={() => onDeleteShape(selectedShape.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Text Content & Typography */}
                <div className="space-y-2.5 p-3 rounded-lg border border-border bg-card/50">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                      <Type className="h-3.5 w-3.5 text-primary" />
                      Text Content
                    </Label>
                    <span className="text-[10px] text-muted-foreground">Editable label</span>
                  </div>
                  <Input
                    value={selectedShape.text || ""}
                    onChange={(e) =>
                      onUpdateShape &&
                      onUpdateShape(selectedShape.id, { text: e.target.value })
                    }
                    placeholder="Type shape text..."
                    className="h-8 text-xs bg-background"
                  />

                  {/* Typography options */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Font Size</Label>
                      <select
                        value={selectedShape.fontSize || 13}
                        onChange={(e) =>
                          onUpdateShape &&
                          onUpdateShape(selectedShape.id, {
                            fontSize: parseInt(e.target.value, 10) || 13,
                          })
                        }
                        className="w-full h-7 px-1.5 text-xs rounded border border-input bg-background"
                      >
                        <option value="11">11px</option>
                        <option value="12">12px</option>
                        <option value="13">13px</option>
                        <option value="14">14px</option>
                        <option value="16">16px</option>
                        <option value="18">18px</option>
                        <option value="20">20px</option>
                        <option value="24">24px</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Weight</Label>
                      <select
                        value={selectedShape.fontWeight || 500}
                        onChange={(e) =>
                          onUpdateShape &&
                          onUpdateShape(selectedShape.id, {
                            fontWeight: parseInt(e.target.value, 10) || 500,
                          })
                        }
                        className="w-full h-7 px-1.5 text-xs rounded border border-input bg-background"
                      >
                        <option value="400">Regular</option>
                        <option value="500">Medium</option>
                        <option value="600">Semibold</option>
                        <option value="700">Bold</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Text Color</Label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={selectedShape.textColor || "#1e3a8a"}
                          onChange={(e) =>
                            onUpdateShape &&
                            onUpdateShape(selectedShape.id, { textColor: e.target.value })
                          }
                          className="h-7 w-full rounded cursor-pointer border border-input bg-background p-0.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fill Color */}
                <div className="space-y-2.5 p-3 rounded-lg border border-border bg-card/50">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                      <PaintBucket className="h-3.5 w-3.5 text-primary" />
                      Fill Color
                    </Label>
                    <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedShape.fill === "transparent"}
                        onChange={(e) =>
                          onUpdateShape &&
                          onUpdateShape(selectedShape.id, {
                            fill: e.target.checked ? "transparent" : "#eff6ff",
                          })
                        }
                        className="rounded border-input text-primary focus:ring-primary h-3 w-3"
                      />
                      Transparent
                    </label>
                  </div>

                  {selectedShape.fill !== "transparent" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Color</Label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={
                              selectedShape.fill && selectedShape.fill !== "transparent"
                                ? selectedShape.fill
                                : "#eff6ff"
                            }
                            onChange={(e) =>
                              onUpdateShape &&
                              onUpdateShape(selectedShape.id, { fill: e.target.value })
                            }
                            className="h-7 w-10 rounded cursor-pointer border border-input bg-background p-0.5"
                          />
                          <Input
                            value={selectedShape.fill || "#eff6ff"}
                            onChange={(e) =>
                              onUpdateShape &&
                              onUpdateShape(selectedShape.id, { fill: e.target.value })
                            }
                            className="h-7 text-xs font-mono bg-background"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Fill Opacity</Label>
                        <select
                          value={selectedShape.fillOpacity ?? 1}
                          onChange={(e) =>
                            onUpdateShape &&
                            onUpdateShape(selectedShape.id, {
                              fillOpacity: parseFloat(e.target.value),
                            })
                          }
                          className="w-full h-7 px-1.5 text-xs rounded border border-input bg-background"
                        >
                          <option value="1">100% (Solid)</option>
                          <option value="0.8">80%</option>
                          <option value="0.6">60%</option>
                          <option value="0.4">40%</option>
                          <option value="0.2">20%</option>
                          <option value="0.1">10%</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Preset Quick Fill Palette */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {[
                      "#eff6ff",
                      "#f0fdf4",
                      "#fefce8",
                      "#fef2f2",
                      "#faf5ff",
                      "#f1f5f9",
                      "#ffffff",
                    ].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          onUpdateShape && onUpdateShape(selectedShape.id, { fill: c })
                        }
                        className={`h-5 w-5 rounded-full border transition-transform hover:scale-110 ${
                          selectedShape.fill === c ? "ring-2 ring-primary ring-offset-1" : "border-border"
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                {/* Stroke Color & Thickness */}
                <div className="space-y-2.5 p-3 rounded-lg border border-border bg-card/50">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                      Stroke & Border
                    </Label>
                    <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedShape.stroke === "transparent"}
                        onChange={(e) =>
                          onUpdateShape &&
                          onUpdateShape(selectedShape.id, {
                            stroke: e.target.checked ? "transparent" : "#2563EB",
                          })
                        }
                        className="rounded border-input text-primary focus:ring-primary h-3 w-3"
                      />
                      No Stroke
                    </label>
                  </div>

                  {selectedShape.stroke !== "transparent" && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Stroke Color</Label>
                          <input
                            type="color"
                            value={
                              selectedShape.stroke && selectedShape.stroke !== "transparent"
                                ? selectedShape.stroke
                                : "#2563EB"
                            }
                            onChange={(e) =>
                              onUpdateShape &&
                              onUpdateShape(selectedShape.id, { stroke: e.target.value })
                            }
                            className="h-7 w-full rounded cursor-pointer border border-input bg-background p-0.5"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Thickness</Label>
                          <select
                            value={selectedShape.strokeWidth ?? 2}
                            onChange={(e) =>
                              onUpdateShape &&
                              onUpdateShape(selectedShape.id, {
                                strokeWidth: parseInt(e.target.value, 10) || 1,
                              })
                            }
                            className="w-full h-7 px-1.5 text-xs rounded border border-input bg-background font-medium"
                          >
                            <option value="1">1px (Thin)</option>
                            <option value="2">2px (Default)</option>
                            <option value="3">3px (Medium)</option>
                            <option value="4">4px (Bold)</option>
                            <option value="6">6px (Heavy)</option>
                            <option value="8">8px (Thick)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Style</Label>
                          <select
                            value={selectedShape.strokeStyle || "solid"}
                            onChange={(e) =>
                              onUpdateShape &&
                              onUpdateShape(selectedShape.id, {
                                strokeStyle: e.target.value as "solid" | "dashed" | "dotted",
                              })
                            }
                            className="w-full h-7 px-1.5 text-xs rounded border border-input bg-background"
                          >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                          </select>
                        </div>
                      </div>

                      {/* Stroke Quick Swatches */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {[
                          "#2563EB",
                          "#0ea5e9",
                          "#10b981",
                          "#f59e0b",
                          "#ef4444",
                          "#8b5cf6",
                          "#64748b",
                          "#0f172a",
                        ].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() =>
                              onUpdateShape && onUpdateShape(selectedShape.id, { stroke: c })
                            }
                            className={`h-5 w-5 rounded-full border transition-transform hover:scale-110 ${
                              selectedShape.stroke === c
                                ? "ring-2 ring-primary ring-offset-1"
                                : "border-border"
                            }`}
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dimensions */}
                <div className="space-y-2 p-3 rounded-lg border border-border bg-card/50">
                  <Label className="text-[11px] font-semibold text-foreground">Size (px)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Width</Label>
                      <Input
                        type="number"
                        min="20"
                        max="2000"
                        value={Math.round(selectedShape.width)}
                        onChange={(e) =>
                          onUpdateShape &&
                          onUpdateShape(selectedShape.id, {
                            width: Math.max(20, parseInt(e.target.value, 10) || 20),
                          })
                        }
                        className="h-7 text-xs bg-background"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Height</Label>
                      <Input
                        type="number"
                        min="20"
                        max="2000"
                        value={Math.round(selectedShape.height)}
                        onChange={(e) =>
                          onUpdateShape &&
                          onUpdateShape(selectedShape.id, {
                            height: Math.max(20, parseInt(e.target.value, 10) || 20),
                          })
                        }
                        className="h-7 text-xs bg-background"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State when nothing is selected */}
            {!selectedNode && !selectedConnection && !selectedBoundary && !selectedAnnotation && !selectedShape && (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 border-2 border-dashed border-border rounded-xl">
                <Sparkles className="h-8 w-8 text-muted-foreground/60" />
                <h4 className="text-xs font-bold text-foreground">No Element Selected</h4>
                <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                  Click on any person tile, department, connector line, shape, or annotation on the canvas to inspect and edit its properties.
                </p>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* TAB E: MATRIX CONFIGURATION (All Sections: Project Info, RAG, Fleet)       */}
      {/* ========================================================================= */}
      {(activeTab === "matrix" || activeTab === "footer") && (() => {
        const summary = calculateManpowerSummary(chart.nodes, chart.footer)
        const currentProjectInfo = chart.footer?.projectInfo || {
          companyName: chart.companyName || "Transvolt Mobility Private Limited",
          projectName: chart.companyName || "Transvolt Mobility Private Limited",
          projectLocation: chart.siteLocation || "Site Operations",
          projectCode: "",
          projectManager: chart.projectManager || "Project Head",
          effectiveDate: chart.effectiveFrom || "2026-09-01",
        }

        const compName = chart.companyName || currentProjectInfo.companyName || currentProjectInfo.projectName || "Transvolt Mobility Private Limited"
        const siteLoc = chart.siteLocation || currentProjectInfo.projectLocation || "Site Operations"
        const projMgr = chart.projectManager || currentProjectInfo.projectManager || "Project Head"
        const effDate = chart.effectiveFrom || currentProjectInfo.effectiveDate || "2026-09-01"

        const handleUpdateProjectInfoField = (field: "companyName" | "projectLocation" | "projectManager" | "effectiveDate", val: string) => {
          const currentFooter = chart.footer || {
            enabled: true,
            projectInfo: {
              projectName: compName,
              projectLocation: siteLoc,
              projectCode: "",
              projectManager: projMgr,
              effectiveDate: effDate,
              companyName: compName,
            },
            manpowerColumns: [],
            manpowerRows: [],
            vehicleMatrix: { vehicles: { required: 50, available: 50 }, chargers: { required: 8, available: 8 }, infrastructure: { required: 4, available: 4 } },
            legendItems: [],
          }

          const updatedFooter: OrgFooter = {
            ...currentFooter,
            projectInfo: {
              ...currentFooter.projectInfo,
              [field]: val,
              ...(field === "companyName" ? { projectName: val } : {}),
            },
          }
          onUpdateFooter(updatedFooter)

          // Mirror top-level chart metadata so canvas headers and export modals stay 100% in sync
          if (field === "companyName") onUpdateChartMeta({ companyName: val })
          else if (field === "projectLocation") onUpdateChartMeta({ siteLocation: val })
          else if (field === "projectManager") onUpdateChartMeta({ projectManager: val })
          else if (field === "effectiveDate") onUpdateChartMeta({ effectiveFrom: val })
        }

        const fleetVehicles = chart.footer?.vehicleMatrix?.vehicles || { required: 50, available: 50 }
        const fleetChargers = chart.footer?.vehicleMatrix?.chargers || { required: 8, available: 8 }
        const fleetInfra = chart.footer?.vehicleMatrix?.infrastructure || { required: 4, available: 4 }

        const vehicleGap = (fleetVehicles.available ?? 0) - (fleetVehicles.required ?? 0)
        const chargerGap = (fleetChargers.available ?? 0) - (fleetChargers.required ?? 0)
        const infraGap = (fleetInfra.available ?? 0) - (fleetInfra.required ?? 0)

        const handleUpdateFleet = (
          category: "vehicles" | "chargers" | "infrastructure",
          key: "required" | "available",
          val: number
        ) => {
          const currentFooter = chart.footer || {
            enabled: true,
            projectInfo: {
              projectName: compName,
              projectLocation: siteLoc,
              projectCode: "",
              projectManager: projMgr,
              effectiveDate: effDate,
              companyName: compName,
            },
            manpowerColumns: [],
            manpowerRows: [],
            vehicleMatrix: { vehicles: { required: 50, available: 50 }, chargers: { required: 8, available: 8 }, infrastructure: { required: 4, available: 4 } },
            legendItems: [],
          }

          const updatedFooter: OrgFooter = {
            ...currentFooter,
            vehicleMatrix: {
              ...currentFooter.vehicleMatrix,
              [category]: {
                ...(currentFooter.vehicleMatrix?.[category] || { required: 0, available: 0 }),
                [key]: val,
              },
            },
          }
          onUpdateFooter(updatedFooter)
        }

        return (
          <div className="flex-1 min-h-0 overflow-hidden m-0 p-0 flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3.5 pt-3 pb-44 overscroll-contain space-y-3.5">
              
              {/* MASTER DRAWER TOGGLE */}
              <div className="rounded-xl border border-border/80 bg-card p-3 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MatrixBracketIcon className="h-4 w-4 text-[#548235]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground">Bottom Metrics Footer</span>
                    <p className="text-[10px] text-muted-foreground">Show Company info, RAG matrix &amp; Fleet</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={chart.footer?.enabled ?? true}
                  onChange={(e) =>
                    onUpdateFooter({
                      ...chart.footer,
                      enabled: e.target.checked,
                    })
                  }
                  className="rounded border-input h-4 w-4 cursor-pointer accent-primary"
                />
              </div>

              {/* SECTION A: PROJECT INFORMATION */}
              <div className="rounded-xl border border-blue-500/20 bg-card/90 shadow-xs p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wide text-[#4472C4] flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    Section A: Project Information
                  </span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono text-[#4472C4] border-[#4472C4]/40 bg-[#4472C4]/10">
                    Editable
                  </Badge>
                </div>

                {/* Company Name */}
                <div className="space-y-1">
                  <Label className="text-[10.5px] font-semibold text-muted-foreground flex items-center gap-1">
                    Company Name
                  </Label>
                  <Input
                    value={compName}
                    onChange={(e) => handleUpdateProjectInfoField("companyName", e.target.value)}
                    placeholder="e.g. Transvolt Mobility Private Limited"
                    className="h-8 text-xs font-medium"
                  />
                </div>

                {/* Site / Location */}
                <div className="space-y-1">
                  <Label className="text-[10.5px] font-semibold text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground/70" />
                    Site / Location
                  </Label>
                  <Input
                    value={siteLoc}
                    onChange={(e) => handleUpdateProjectInfoField("projectLocation", e.target.value)}
                    placeholder="e.g. Central Hub Operations"
                    className="h-8 text-xs"
                  />
                </div>

                {/* Project Manager & Effective Date */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10.5px] font-semibold text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground/70" />
                      Manager
                    </Label>
                    <Input
                      value={projMgr}
                      onChange={(e) => handleUpdateProjectInfoField("projectManager", e.target.value)}
                      placeholder="Project Head"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10.5px] font-semibold text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground/70" />
                      Effective Date
                    </Label>
                    <Input
                      type="date"
                      value={effDate}
                      onChange={(e) => handleUpdateProjectInfoField("effectiveDate", e.target.value)}
                      className="h-8 text-xs font-mono font-bold text-[#548235]"
                    />
                  </div>
                </div>

                {/* Live Personnel Readout */}
                <div className="rounded-lg bg-muted/40 p-2 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground font-medium">Total Personnel:</span>
                  <span className="font-extrabold text-foreground font-mono">
                    {summary.totalAvailable} Active
                  </span>
                </div>
              </div>

              {/* SECTION B: MANPOWER RAG MATRIX */}
              <div className="rounded-xl border border-emerald-500/20 bg-card/90 shadow-xs p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wide text-[#548235] flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Section B: Manpower Matrix
                  </span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                      summary.ragStatus === "GREEN"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                        : summary.ragStatus === "AMBER"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                        : "bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30"
                    )}
                  >
                    {summary.ragStatus}
                  </span>
                </div>

                {/* KPI Metric Chips */}
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="p-1.5 rounded-lg bg-muted/40 border border-border/40">
                    <div className="text-[9.5px] text-muted-foreground font-semibold uppercase">Avail</div>
                    <div className="text-xs font-black font-mono text-foreground">{summary.totalAvailable}</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-[9.5px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase">Emp</div>
                    <div className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">{summary.totalEmployees}</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="text-[9.5px] text-amber-700 dark:text-amber-400 font-semibold uppercase">Cons</div>
                    <div className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">{summary.totalConsultants}</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-muted/40 border border-border/40">
                    <div className="text-[9.5px] text-muted-foreground font-semibold uppercase">Gap</div>
                    <div className={cn("text-xs font-bold font-mono", summary.totalGap < 0 ? "text-red-600" : summary.totalGap > 0 ? "text-emerald-600" : "text-muted-foreground")}>
                      {summary.totalGap > 0 ? `+${summary.totalGap}` : summary.totalGap}
                    </div>
                  </div>
                </div>

                {/* Department Distribution Table */}
                <div className="border border-border/60 rounded-lg bg-background/50 overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/50 text-[9px] uppercase font-bold text-muted-foreground">
                        <th className="py-1 px-2">Dept</th>
                        <th className="py-1 px-1 text-center font-mono">Emp</th>
                        <th className="py-1 px-1 text-center font-mono">Cons</th>
                        <th className="py-1 px-1 text-center font-mono font-bold">Avail</th>
                        <th className="py-1 px-1 text-center font-mono">Req</th>
                        <th className="py-1 px-1.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {summary.rows.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-2.5 px-2 text-center text-[10px] text-muted-foreground italic">
                            No departments mapped. Total chart active headcount is shown above.
                          </td>
                        </tr>
                      ) : (
                        summary.rows.map((row) => (
                          <tr key={row.departmentName} className="hover:bg-muted/20">
                            <td className="py-1 px-2 font-semibold truncate max-w-[85px]" title={row.departmentName}>
                              {row.departmentName}
                            </td>
                            <td className="py-1 px-1 text-center font-mono text-emerald-600">{row.employees}</td>
                            <td className="py-1 px-1 text-center font-mono text-amber-600">{row.consultants}</td>
                            <td className="py-1 px-1 text-center font-mono font-bold text-foreground">{row.available}</td>
                            <td className="py-1 px-1 text-center font-mono text-muted-foreground">{row.required}</td>
                            <td className="py-1 px-1.5 text-center">
                              <span
                                className={cn(
                                  "inline-block px-1 py-0.2 rounded text-[8.5px] font-black uppercase",
                                  row.status === "GREEN"
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                    : row.status === "AMBER"
                                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                    : "bg-red-500/15 text-red-700 dark:text-red-300"
                                )}
                              >
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Quick Add Required Shortcut */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveTab("add")
                    setAddSubTab("required")
                  }}
                  className="w-full h-7 text-[10.5px] gap-1 text-[#548235] border-[#548235]/40 hover:bg-[#548235]/10"
                >
                  <Plus className="h-3 w-3" />
                  + Add Required Position / Vacancy
                </Button>
              </div>

              {/* SECTION C: FLEET & INFRASTRUCTURE */}
              <div className="rounded-xl border border-sky-500/20 bg-card/90 shadow-xs p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wide text-[#2E75B6] flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    Section C: Fleet &amp; Infra
                  </span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono text-[#2E75B6] border-[#2E75B6]/40 bg-[#2E75B6]/10">
                    Live Sync
                  </Badge>
                </div>

                {/* Electric Vehicles */}
                <div className="space-y-1.5 p-2 rounded-lg bg-muted/20 border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5 text-blue-600" />
                      Electric Vehicles
                    </span>
                    <span className={cn("text-[10px] font-mono font-bold px-1.5 py-0.2 rounded", vehicleGap < 0 ? "bg-red-500/15 text-red-600" : "bg-emerald-500/15 text-emerald-600")}>
                      Gap: {vehicleGap > 0 ? `+${vehicleGap}` : vehicleGap}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9.5px] text-muted-foreground">Req Target</span>
                      <Input
                        type="number"
                        min="0"
                        value={fleetVehicles.required ?? 50}
                        onChange={(e) => handleUpdateFleet("vehicles", "required", parseInt(e.target.value, 10) || 0)}
                        className="h-7 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[9.5px] text-muted-foreground">Available</span>
                      <Input
                        type="number"
                        min="0"
                        value={fleetVehicles.available ?? 50}
                        onChange={(e) => handleUpdateFleet("vehicles", "available", parseInt(e.target.value, 10) || 0)}
                        className="h-7 text-xs font-mono font-bold text-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* EV Fast Chargers */}
                <div className="space-y-1.5 p-2 rounded-lg bg-muted/20 border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      EV Fast Chargers
                    </span>
                    <span className={cn("text-[10px] font-mono font-bold px-1.5 py-0.2 rounded", chargerGap < 0 ? "bg-red-500/15 text-red-600" : "bg-emerald-500/15 text-emerald-600")}>
                      Gap: {chargerGap > 0 ? `+${chargerGap}` : chargerGap}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9.5px] text-muted-foreground">Req Target</span>
                      <Input
                        type="number"
                        min="0"
                        value={fleetChargers.required ?? 8}
                        onChange={(e) => handleUpdateFleet("chargers", "required", parseInt(e.target.value, 10) || 0)}
                        className="h-7 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[9.5px] text-muted-foreground">Available</span>
                      <Input
                        type="number"
                        min="0"
                        value={fleetChargers.available ?? 8}
                        onChange={(e) => handleUpdateFleet("chargers", "available", parseInt(e.target.value, 10) || 0)}
                        className="h-7 text-xs font-mono font-bold text-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* Charging Bays */}
                <div className="space-y-1.5 p-2 rounded-lg bg-muted/20 border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <SquareDashed className="h-3.5 w-3.5 text-emerald-600" />
                      Charging Bays
                    </span>
                    <span className={cn("text-[10px] font-mono font-bold px-1.5 py-0.2 rounded", infraGap < 0 ? "bg-red-500/15 text-red-600" : "bg-emerald-500/15 text-emerald-600")}>
                      Gap: {infraGap > 0 ? `+${infraGap}` : infraGap}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9.5px] text-muted-foreground">Req Target</span>
                      <Input
                        type="number"
                        min="0"
                        value={fleetInfra.required ?? 4}
                        onChange={(e) => handleUpdateFleet("infrastructure", "required", parseInt(e.target.value, 10) || 0)}
                        className="h-7 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[9.5px] text-muted-foreground">Available</span>
                      <Input
                        type="number"
                        min="0"
                        value={fleetInfra.available ?? 4}
                        onChange={(e) => handleUpdateFleet("infrastructure", "available", parseInt(e.target.value, 10) || 0)}
                        className="h-7 text-xs font-mono font-bold text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )
      })()}
    </div>
  )
}
