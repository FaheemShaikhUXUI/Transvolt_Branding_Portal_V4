"use client"

import * as React from "react"
import {
  OrganizationChart,
  OrgNode,
  OrgConnection,
  SectionBoundary,
  OrgFooter,
  EmploymentType,
} from "@/lib/org-chart/types"
import { orgChartService } from "@/lib/org-chart/org-chart-service"
import { autoLayoutOrgChart } from "@/lib/org-chart/auto-layout"
import {
  exportOrgChartToPrintPdf,
  exportOrgChartToPng,
  exportOrgChartToSvg,
} from "@/lib/org-chart/export-utils"
import { BuilderV2Header } from "./builder-v2-header"
import { BuilderV2RightPanel } from "./builder-v2-right-panel"
import { OrgChartPreviewCanvas } from "./canvas-v2/org-chart-preview-canvas"
import { useSidebar } from "@/components/layout/sidebar-context"
import { toast } from "sonner"

interface BuilderV2PageProps {
  initialChart: OrganizationChart
  onBackToLibrary: () => void
  onOpenShareModal: (chartId: string) => void
}

export function OrgChartBuilderV2Page({
  initialChart,
  onBackToLibrary,
  onOpenShareModal,
}: BuilderV2PageProps) {
  // Sidebar auto-collapse when entering Builder V2
  const { setIsCollapsed } = useSidebar()
  React.useEffect(() => {
    setIsCollapsed(true)
    // Do not auto-reopen on unmount; only small arrow controls it as requested by user
  }, [setIsCollapsed])

  // Chart State
  const [chart, setChart] = React.useState<OrganizationChart>(() => {
    const layout = autoLayoutOrgChart(
      initialChart.nodes || [],
      initialChart.connections || [],
      initialChart.boundaries || []
    )
    return {
      ...initialChart,
      nodes: layout.nodes,
      connections: layout.connections,
      boundaries: layout.boundaries,
    }
  })

  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null)
  const [isDirty, setIsDirty] = React.useState(false)
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null)

  // Auto layout helper
  const runAutoLayout = React.useCallback(
    (nodes: OrgNode[], connections: OrgConnection[], boundaries: SectionBoundary[] = []) => {
      return autoLayoutOrgChart(nodes, connections, boundaries)
    },
    []
  )

  // 1. Add Department
  const handleAddDepartment = (name: string, code: string, parentId: string | null) => {
    const newDeptId = `dept-${Date.now()}`
    const targetParent = parentId || chart.nodes[0]?.id || null

    const newDeptNode: OrgNode = {
      id: newDeptId,
      type: "DEPARTMENT",
      label: name,
      parentId: targetParent,
      position: { x: 0, y: 0 },
      width: 190,
      height: 50,
      metadata: {
        department: name,
        departmentCode: code || undefined,
        color: "#1e40af",
      },
    }

    const updatedNodes = [...chart.nodes, newDeptNode]
    let updatedConnections = [...chart.connections]

    if (targetParent) {
      updatedConnections.push({
        id: `conn-${targetParent}-${newDeptId}`,
        source: targetParent,
        target: newDeptId,
        type: "ORTHOGONAL",
      })
    }

    const layout = runAutoLayout(updatedNodes, updatedConnections, chart.boundaries)

    setChart((prev) => ({
      ...prev,
      nodes: layout.nodes,
      connections: layout.connections,
      boundaries: layout.boundaries,
    }))
    setSelectedNodeId(newDeptId)
    setIsDirty(true)
  }

  // 2. Add Person (Employee / Consultant)
  const handleAddPerson = (
    name: string,
    designation: string,
    type: EmploymentType,
    parentId: string | null
  ) => {
    const newPersonId = `person-${Date.now()}`
    const targetParent = parentId || chart.nodes[0]?.id || null

    const newPersonNode: OrgNode = {
      id: newPersonId,
      type: type === "CONSULTANT" ? "CONSULTANT" : "EMPLOYEE",
      label: name,
      parentId: targetParent,
      position: { x: 0, y: 0 },
      width: 175,
      height: 54,
      metadata: {
        designation,
        employmentType: type,
      },
    }

    const updatedNodes = [...chart.nodes, newPersonNode]
    let updatedConnections = [...chart.connections]

    if (targetParent) {
      updatedConnections.push({
        id: `conn-${targetParent}-${newPersonId}`,
        source: targetParent,
        target: newPersonId,
        type: "ORTHOGONAL",
      })
    }

    const layout = runAutoLayout(updatedNodes, updatedConnections, chart.boundaries)

    setChart((prev) => ({
      ...prev,
      nodes: layout.nodes,
      connections: layout.connections,
      boundaries: layout.boundaries,
    }))
    setSelectedNodeId(newPersonId)
    setIsDirty(true)
  }

  // 3. Add Required Vacancy Position
  const handleAddRequired = (
    designation: string,
    quantity: number,
    parentId: string | null
  ) => {
    const newReqId = `req-${Date.now()}`
    const targetParent = parentId || chart.nodes[0]?.id || null

    const newReqNode: OrgNode = {
      id: newReqId,
      type: "REQUIRED_POSITION",
      label: `Required: ${quantity}`,
      parentId: targetParent,
      position: { x: 0, y: 0 },
      width: 175,
      height: 54,
      metadata: {
        designation,
        requiredQuantity: quantity,
      },
    }

    const updatedNodes = [...chart.nodes, newReqNode]
    let updatedConnections = [...chart.connections]

    if (targetParent) {
      updatedConnections.push({
        id: `conn-${targetParent}-${newReqId}`,
        source: targetParent,
        target: newReqId,
        type: "ORTHOGONAL",
      })
    }

    const layout = runAutoLayout(updatedNodes, updatedConnections, chart.boundaries)

    setChart((prev) => ({
      ...prev,
      nodes: layout.nodes,
      connections: layout.connections,
      boundaries: layout.boundaries,
    }))
    setSelectedNodeId(newReqId)
    setIsDirty(true)
  }

  // 4. Update Node Properties
  const handleUpdateNode = (nodeId: string, updates: Partial<OrgNode>) => {
    setChart((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
    }))
    setIsDirty(true)
  }

  // 5. Change Parent
  const handleChangeParent = (nodeId: string, newParentId: string | null) => {
    let updatedConnections = chart.connections.filter((c) => c.target !== nodeId)
    if (newParentId) {
      updatedConnections.push({
        id: `conn-${newParentId}-${nodeId}`,
        source: newParentId,
        target: nodeId,
        type: "ORTHOGONAL",
      })
    }

    const updatedNodes = chart.nodes.map((n) =>
      n.id === nodeId ? { ...n, parentId: newParentId } : n
    )

    const layout = runAutoLayout(updatedNodes, updatedConnections, chart.boundaries)

    setChart((prev) => ({
      ...prev,
      nodes: layout.nodes,
      connections: layout.connections,
      boundaries: layout.boundaries,
    }))
    setIsDirty(true)
    toast.success("Reporting line reorganized!")
  }

  // 6. Delete Node
  const handleDeleteNode = (nodeId: string) => {
    if (chart.nodes.length <= 1) {
      toast.error("Cannot delete the only root node")
      return
    }

    const targetNode = chart.nodes.find((n) => n.id === nodeId)
    const newNodes = chart.nodes.filter((n) => n.id !== nodeId)
    const newConnections = chart.connections.filter(
      (c) => c.source !== nodeId && c.target !== nodeId
    )

    const layout = runAutoLayout(newNodes, newConnections, chart.boundaries)

    setChart((prev) => ({
      ...prev,
      nodes: layout.nodes,
      connections: layout.connections,
      boundaries: layout.boundaries,
    }))

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null)
    }
    setIsDirty(true)
    toast.success(`Removed "${targetNode?.label || "node"}" from chart`)
  }

  // 7. Duplicate Node
  const handleDuplicateNode = (nodeId: string) => {
    const nodeToDup = chart.nodes.find((n) => n.id === nodeId)
    if (!nodeToDup) return

    const newId = `${nodeToDup.id}-copy-${Date.now()}`
    const duplicatedNode: OrgNode = {
      ...JSON.parse(JSON.stringify(nodeToDup)),
      id: newId,
      label: `${nodeToDup.label} (Copy)`,
    }

    const updatedNodes = [...chart.nodes, duplicatedNode]
    let updatedConnections = [...chart.connections]

    if (nodeToDup.parentId) {
      updatedConnections.push({
        id: `conn-${nodeToDup.parentId}-${newId}`,
        source: nodeToDup.parentId,
        target: newId,
        type: "ORTHOGONAL",
      })
    }

    const layout = runAutoLayout(updatedNodes, updatedConnections, chart.boundaries)

    setChart((prev) => ({
      ...prev,
      nodes: layout.nodes,
      connections: layout.connections,
      boundaries: layout.boundaries,
    }))
    setSelectedNodeId(newId)
    setIsDirty(true)
    toast.success(`Duplicated "${nodeToDup.label}"`)
  }

  // 8. Manual Trigger of Auto Arrange
  const handleManualAutoArrange = () => {
    const layout = runAutoLayout(chart.nodes, chart.connections, chart.boundaries)
    setChart((prev) => ({
      ...prev,
      nodes: layout.nodes,
      connections: layout.connections,
      boundaries: layout.boundaries,
    }))
    toast.success("Hierarchy auto-arranged with clean spacing!")
  }

  // 9. Update Footer & Matrices
  const handleUpdateFooter = (newFooter: OrgFooter) => {
    setChart((prev) => ({
      ...prev,
      footer: newFooter,
    }))
    setIsDirty(true)
  }

  // 10. Update Chart Metadata
  const handleUpdateChartMeta = (meta: Partial<OrganizationChart>) => {
    setChart((prev) => ({
      ...prev,
      ...meta,
    }))
    setIsDirty(true)
  }

  // 11. Save / Publish
  const handleSave = async (publish = false) => {
    try {
      const toSave = {
        ...chart,
        status: publish ? ("CURRENT" as const) : chart.status,
      }
      const saved = await orgChartService.saveChart(toSave)
      setChart(saved)
      setIsDirty(false)
      setLastSavedAt(new Date())
      toast.success(
        publish
          ? `Organization Chart "${saved.title}" published as CURRENT version!`
          : "Draft saved successfully!"
      )
    } catch {
      toast.error("Failed to save chart. Please try again.")
    }
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-background text-foreground">
      {/* 1. Builder V2 Header */}
      <BuilderV2Header
        title={chart.title}
        version={chart.version}
        status={chart.status}
        effectiveDate={chart.effectiveFrom}
        isDirty={isDirty}
        lastSavedAt={lastSavedAt}
        onBack={onBackToLibrary}
        onSave={handleSave}
        onOpenShareModal={() => onOpenShareModal(chart.id)}
        onAutoArrange={handleManualAutoArrange}
        onExportPdf={() => exportOrgChartToPrintPdf(chart)}
        onExportPng={() => exportOrgChartToPng(chart)}
        onExportSvg={() => exportOrgChartToSvg(chart)}
      />

      {/* 2. Workspace: Canvas (Left/Center) + Unified Control Center (Right) */}
      <div className="flex flex-1 w-full h-[calc(100%-3.5rem)] overflow-hidden">
        {/* CENTER / LEFT: Live Preview Canvas (Non-editable, live auto-arranged preview) */}
        <div className="flex-1 h-full relative overflow-hidden">
          <OrgChartPreviewCanvas
            nodes={chart.nodes}
            connections={chart.connections}
            boundaries={chart.boundaries}
            footer={chart.footer}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        </div>

        {/* RIGHT: Unified Control Center Panel */}
        <BuilderV2RightPanel
          chart={chart}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onUpdateChartMeta={handleUpdateChartMeta}
          onAddDepartment={handleAddDepartment}
          onAddPerson={handleAddPerson}
          onAddRequired={handleAddRequired}
          onUpdateNode={handleUpdateNode}
          onChangeParent={handleChangeParent}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
          onUpdateFooter={handleUpdateFooter}
        />
      </div>
    </div>
  )
}
