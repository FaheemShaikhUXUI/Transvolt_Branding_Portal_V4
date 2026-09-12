"use client"

import * as React from "react"
import {
  OrganizationChart,
  OrgNode,
  OrgConnection,
  SectionBoundary,
  OrgFooter,
  CanvasPosition,
} from "@/lib/org-chart/types"
import { orgChartService } from "@/lib/org-chart/org-chart-service"
import { autoLayoutOrgChart } from "@/lib/org-chart/auto-layout"
import {
  exportOrgChartToPrintPdf,
  exportOrgChartToPng,
  exportOrgChartToSvg,
} from "@/lib/org-chart/export-utils"
import { BuilderHeader } from "./builder-header"
import { BuilderToolPanel } from "./builder-tool-panel"
import { BuilderInspectorPanel } from "./builder-inspector-panel"
import { OrgChartCanvas } from "./canvas/org-chart-canvas"
import { AddDepartmentDialog } from "./dialogs/add-department-dialog"
import { AddEmployeeDialog } from "./dialogs/add-employee-dialog"
import { AddRequiredDialog } from "./dialogs/add-required-dialog"
import { ChangeParentDialog } from "./dialogs/change-parent-dialog"
import { ConnectNodesDialog } from "./dialogs/connect-nodes-dialog"
import { UnsavedChangesDialog } from "./dialogs/unsaved-changes-dialog"
import { toast } from "sonner"

interface BuilderPageProps {
  initialChart: OrganizationChart
  onBackToLibrary: () => void
  onOpenShareModal: (chartId: string) => void
}

export function OrgChartBuilderPage({
  initialChart,
  onBackToLibrary,
  onOpenShareModal,
}: BuilderPageProps) {
  // Main Chart State
  const [chart, setChart] = React.useState<OrganizationChart>(initialChart)
  const [isDirty, setIsDirty] = React.useState(false)
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null)

  // Selection State
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null)
  const [selectedBoundaryId, setSelectedBoundaryId] = React.useState<string | null>(null)
  const [selectedConnectionId, setSelectedConnectionId] = React.useState<string | null>(null)

  // Dialog States
  const [addDeptOpen, setAddDeptOpen] = React.useState(false)
  const [addDeptParentId, setAddDeptParentId] = React.useState<string | null>(null)
  const [addEmpOpen, setAddEmpOpen] = React.useState(false)
  const [addEmpParentId, setAddEmpParentId] = React.useState<string | null>(null)
  const [addReqOpen, setAddReqOpen] = React.useState(false)
  const [addReqParentId, setAddReqParentId] = React.useState<string | null>(null)
  const [changeParentOpen, setChangeParentOpen] = React.useState(false)
  const [changeParentNode, setChangeParentNode] = React.useState<OrgNode | null>(null)
  const [connectOpen, setConnectOpen] = React.useState(false)
  const [connectSourceId, setConnectSourceId] = React.useState<string | null>(null)
  const [unsavedOpen, setUnsavedOpen] = React.useState(false)

  // Undo / Redo History Stack
  const [history, setHistory] = React.useState<OrganizationChart[]>([initialChart])
  const [historyIndex, setHistoryIndex] = React.useState(0)

  const pushState = React.useCallback(
    (newChart: OrganizationChart) => {
      setChart(newChart)
      setIsDirty(true)
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1)
        next.push(newChart)
        return next
      })
      setHistoryIndex((prev) => prev + 1)
    },
    [historyIndex]
  )

  const handleUndo = React.useCallback(() => {
    if (historyIndex > 0) {
      const prevChart = history[historyIndex - 1]
      setChart(prevChart)
      setHistoryIndex((prev) => prev - 1)
      setIsDirty(true)
    }
  }, [history, historyIndex])

  const handleRedo = React.useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextChart = history[historyIndex + 1]
      setChart(nextChart)
      setHistoryIndex((prev) => prev + 1)
      setIsDirty(true)
    }
  }, [history, historyIndex])

  // Keyboard shortcut listener (Ctrl+Z, Ctrl+Y)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault()
        handleUndo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "Z"))) {
        e.preventDefault()
        handleRedo()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleUndo, handleRedo])

  // Autosave simulation (every 25 seconds if dirty)
  React.useEffect(() => {
    if (!isDirty) return
    const timer = setTimeout(() => {
      orgChartService.saveChart(chart).then(() => {
        setIsDirty(false)
        setLastSavedAt(new Date())
      })
    }, 25000)
    return () => clearTimeout(timer)
  }, [chart, isDirty])

  // Save Logic
  const handleSave = async (asNewVersion = false) => {
    if (asNewVersion) {
      const nextVer = prompt("Enter new version label (e.g. v4.1, v5.0):", "v" + (parseFloat(chart.version.replace("v", "")) + 0.1).toFixed(1))
      if (!nextVer) return
      const changeNote = prompt("Enter Version Change Summary:", "Updated organization structure") || ""
      const newChart = await orgChartService.createVersion(
        chart.id,
        nextVer,
        chart.effectiveFrom,
        changeNote,
        "Super Admin"
      )
      setChart(newChart)
      setIsDirty(false)
      setLastSavedAt(new Date())
      toast.success(`Saved as New Version ${newChart.version}!`)
    } else {
      const saved = await orgChartService.saveChart(chart)
      setChart(saved)
      setIsDirty(false)
      setLastSavedAt(new Date())
      toast.success("Organization Chart saved successfully!")
    }
  }

  // Publish Logic
  const handlePublish = async () => {
    if (confirm("Publish this Organization Chart as the official active structure for this site?")) {
      const published = await orgChartService.saveChart({
        ...chart,
        status: "CURRENT",
      })
      setChart(published)
      setIsDirty(false)
      setLastSavedAt(new Date())
      toast.success("Organization Chart published officially!")
    }
  }

  // Back Button with Unsaved Warning
  const handleBackRequest = () => {
    if (isDirty) {
      setUnsavedOpen(true)
    } else {
      onBackToLibrary()
    }
  }

  // Add Department
  const handleAddDepartment = (deptData: { name: string; code?: string; parentId: string | null }) => {
    const newDeptId = `node-dept-${Date.now()}`
    const parent = chart.nodes.find((n) => n.id === deptData.parentId)

    const newPos: CanvasPosition = parent
      ? { x: parent.position.x, y: parent.position.y + 120 }
      : { x: 700, y: 560 }

    const newDeptNode: OrgNode = {
      id: newDeptId,
      type: "DEPARTMENT",
      label: deptData.name,
      parentId: deptData.parentId,
      position: newPos,
      width: 190,
      height: 52,
      metadata: {
        code: deptData.code,
        department: deptData.name,
        color: "#2563EB",
      },
    }

    const updatedConnections = [...chart.connections]
    if (deptData.parentId) {
      updatedConnections.push({
        id: `conn-${Date.now()}`,
        source: deptData.parentId,
        target: newDeptId,
        type: "orthogonal",
      })
    }

    pushState({
      ...chart,
      nodes: [...chart.nodes, newDeptNode],
      connections: updatedConnections,
    })
    setSelectedNodeId(newDeptId)
    toast.success(`Department "${deptData.name}" added!`)
  }

  // Add Employee
  const handleAddEmployee = (empData: {
    name: string
    designation: string
    employeeId?: string
    employmentType: "EMPLOYEE" | "CONSULTANT"
    parentId: string | null
  }) => {
    const newEmpId = `node-emp-${Date.now()}`
    const parent = chart.nodes.find((n) => n.id === empData.parentId)

    const newPos: CanvasPosition = parent
      ? { x: parent.position.x, y: parent.position.y + 80 }
      : { x: 700, y: 640 }

    const newEmpNode: OrgNode = {
      id: newEmpId,
      type: empData.employmentType,
      label: empData.name,
      parentId: empData.parentId,
      position: newPos,
      width: 190,
      height: 64,
      metadata: {
        name: empData.name,
        designation: empData.designation,
        employeeId: empData.employeeId,
        employmentType: empData.employmentType,
      },
    }

    const updatedConnections = [...chart.connections]
    if (empData.parentId) {
      updatedConnections.push({
        id: `conn-${Date.now()}`,
        source: empData.parentId,
        target: newEmpId,
        type: "orthogonal",
      })
    }

    pushState({
      ...chart,
      nodes: [...chart.nodes, newEmpNode],
      connections: updatedConnections,
    })
    setSelectedNodeId(newEmpId)
    toast.success(`${empData.employmentType === "CONSULTANT" ? "Consultant" : "Employee"} "${empData.name}" added!`)
  }

  // Add Required Position
  const handleAddRequired = (data: {
    designation: string
    quantity: number
    employmentType: "EMPLOYEE" | "CONSULTANT"
    parentId: string | null
  }) => {
    const newReqId = `node-req-${Date.now()}`
    const parent = chart.nodes.find((n) => n.id === data.parentId)

    const newPos: CanvasPosition = parent
      ? { x: parent.position.x, y: parent.position.y + 80 }
      : { x: 700, y: 720 }

    const newReqNode: OrgNode = {
      id: newReqId,
      type: "REQUIRED_POSITION",
      label: data.designation,
      parentId: data.parentId,
      position: newPos,
      width: 190,
      height: 60,
      metadata: {
        designation: data.designation,
        requiredQuantity: data.quantity,
        employmentType: data.employmentType,
      },
    }

    const updatedConnections = [...chart.connections]
    if (data.parentId) {
      updatedConnections.push({
        id: `conn-${Date.now()}`,
        source: data.parentId,
        target: newReqId,
        type: "orthogonal",
      })
    }

    pushState({
      ...chart,
      nodes: [...chart.nodes, newReqNode],
      connections: updatedConnections,
    })
    setSelectedNodeId(newReqId)
    toast.success(`Required position "${data.designation}" (Qty: ${data.quantity}) added!`)
  }

  // Connect Nodes
  const handleConnectNodes = (sourceId: string, targetId: string) => {
    const alreadyConnected = chart.connections.some(
      (c) => c.source === sourceId && c.target === targetId
    )
    if (alreadyConnected) {
      toast.info("These nodes are already connected.")
      return
    }

    const newConn: OrgConnection = {
      id: `conn-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: "orthogonal",
    }

    // Also update target node's parentId if null
    const updatedNodes = chart.nodes.map((n) => {
      if (n.id === targetId && !n.parentId) {
        return { ...n, parentId: sourceId }
      }
      return n
    })

    pushState({
      ...chart,
      nodes: updatedNodes,
      connections: [...chart.connections, newConn],
    })
    toast.success("Nodes connected successfully!")
  }

  // Change Parent
  const handleChangeParent = (nodeId: string, newParentId: string | null) => {
    const updatedNodes = chart.nodes.map((n) => {
      if (n.id === nodeId) {
        return { ...n, parentId: newParentId }
      }
      return n
    })

    // Update or create connection
    let updatedConnections = chart.connections.filter((c) => c.target !== nodeId)
    if (newParentId) {
      updatedConnections.push({
        id: `conn-${Date.now()}`,
        source: newParentId,
        target: nodeId,
        type: "orthogonal",
      })
    }

    pushState({
      ...chart,
      nodes: updatedNodes,
      connections: updatedConnections,
    })
    toast.success("Reporting hierarchy updated!")
  }

  // Node Deletion
  const handleDeleteNode = (node: OrgNode) => {
    const childCount = chart.nodes.filter((n) => n.parentId === node.id).length
    if (childCount > 0) {
      if (!confirm(`"${node.label}" has ${childCount} reporting items. Deleting this node will unparent them. Proceed?`)) {
        return
      }
    }

    const updatedNodes = chart.nodes
      .filter((n) => n.id !== node.id)
      .map((n) => (n.parentId === node.id ? { ...n, parentId: null } : n))

    const updatedConnections = chart.connections.filter(
      (c) => c.source !== node.id && c.target !== node.id
    )

    pushState({
      ...chart,
      nodes: updatedNodes,
      connections: updatedConnections,
    })
    if (selectedNodeId === node.id) setSelectedNodeId(null)
    toast.success(`Node "${node.label}" deleted.`)
  }

  // Duplicate Node
  const handleDuplicateNode = (node: OrgNode) => {
    const copyId = `node-copy-${Date.now()}`
    const duplicated: OrgNode = {
      ...JSON.parse(JSON.stringify(node)),
      id: copyId,
      label: `${node.label} (Copy)`,
      position: { x: node.position.x + 30, y: node.position.y + 30 },
    }

    pushState({
      ...chart,
      nodes: [...chart.nodes, duplicated],
    })
    setSelectedNodeId(copyId)
    toast.success(`Duplicated "${node.label}".`)
  }

  // Auto Arrange
  const handleAutoArrange = () => {
    const layout = autoLayoutOrgChart(chart.nodes, chart.connections, chart.boundaries)
    pushState({
      ...chart,
      nodes: layout.nodes,
      connections: layout.connections,
      boundaries: layout.boundaries,
    })
    toast.success("Hierarchy auto-arranged cleanly!")
  }

  // Add Section Boundary
  const handleAddBoundary = () => {
    const title = prompt("Enter section boundary name (e.g. PROJECT SITE, HEAD OFFICE):", "NEW SECTION")
    if (!title) return

    const newBnd: SectionBoundary = {
      id: `bnd-${Date.now()}`,
      title: title.trim(),
      position: { x: 100, y: 400 },
      width: 1200,
      height: 400,
      color: "#4472C4",
    }

    pushState({
      ...chart,
      boundaries: [...chart.boundaries, newBnd],
    })
    setSelectedBoundaryId(newBnd.id)
    toast.success(`Section boundary "${title}" created!`)
  }

  const selectedNode = chart.nodes.find((n) => n.id === selectedNodeId) || null

  return (
    <div className="flex flex-col w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
      {/* 1. Header */}
      <BuilderHeader
        chart={chart}
        isDirty={isDirty}
        lastSavedAt={lastSavedAt}
        onBack={handleBackRequest}
        onSave={handleSave}
        onPublish={handlePublish}
        onShare={() => onOpenShareModal(chart.id)}
        onExportPdf={() => exportOrgChartToPrintPdf(chart)}
        onExportPng={() => exportOrgChartToPng(chart)}
        onExportSvg={() => exportOrgChartToSvg(chart)}
        onUpdateTitle={(title) => pushState({ ...chart, title })}
        onUpdateEffectiveDate={(effectiveFrom) => pushState({ ...chart, effectiveFrom })}
      />

      {/* 2. Three-Part Builder Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Tool Panel */}
        <BuilderToolPanel
          chart={chart}
          onUpdateChart={(partial) => pushState({ ...chart, ...partial })}
          onOpenAddDepartment={() => {
            setAddDeptParentId(selectedNodeId)
            setAddDeptOpen(true)
          }}
          onOpenAddEmployee={() => {
            setAddEmpParentId(selectedNodeId)
            setAddEmpOpen(true)
          }}
          onOpenAddRequired={() => {
            setAddReqParentId(selectedNodeId)
            setAddReqOpen(true)
          }}
          onOpenConnectDialog={() => {
            setConnectSourceId(selectedNodeId)
            setConnectOpen(true)
          }}
          onAddBoundary={handleAddBoundary}
          onToggleFooter={() =>
            pushState({
              ...chart,
              footer: { ...chart.footer, enabled: !chart.footer.enabled },
            })
          }
        />

        {/* Center Live Canvas */}
        <div className="flex-1 h-full relative overflow-hidden">
          <OrgChartCanvas
            nodes={chart.nodes}
            connections={chart.connections}
            boundaries={chart.boundaries}
            footer={chart.footer}
            selectedNodeId={selectedNodeId}
            selectedBoundaryId={selectedBoundaryId}
            selectedConnectionId={selectedConnectionId}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onSelectNode={(node) => {
              setSelectedNodeId(node ? node.id : null)
              if (node) {
                setSelectedBoundaryId(null)
                setSelectedConnectionId(null)
              }
            }}
            onSelectBoundary={(boundary) => {
              setSelectedBoundaryId(boundary ? boundary.id : null)
              if (boundary) {
                setSelectedNodeId(null)
                setSelectedConnectionId(null)
              }
            }}
            onSelectConnection={(connId) => {
              setSelectedConnectionId(connId)
              if (connId) {
                setSelectedNodeId(null)
                setSelectedBoundaryId(null)
              }
            }}
            onUpdateNodePosition={(id, pos) => {
              const updated = chart.nodes.map((n) => (n.id === id ? { ...n, position: pos } : n))
              setChart((prev) => ({ ...prev, nodes: updated }))
              setIsDirty(true)
            }}
            onUpdateBoundary={(updated) => {
              pushState({
                ...chart,
                boundaries: chart.boundaries.map((b) => (b.id === updated.id ? updated : b)),
              })
            }}
            onDeleteBoundary={(bId) => {
              pushState({
                ...chart,
                boundaries: chart.boundaries.filter((b) => b.id !== bId),
              })
              setSelectedBoundaryId(null)
            }}
            onUpdateFooter={(updatedFooter) => {
              pushState({
                ...chart,
                footer: updatedFooter,
              })
            }}
            onAutoArrange={handleAutoArrange}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onEditNode={(node) => setSelectedNodeId(node.id)}
            onChangeParent={(node) => {
              setChangeParentNode(node)
              setChangeParentOpen(true)
            }}
            onDuplicateNode={handleDuplicateNode}
            onDeleteNode={handleDeleteNode}
            onConnectNode={(node) => {
              setConnectSourceId(node.id)
              setConnectOpen(true)
            }}
            onAddEmployeeToDept={(deptId) => {
              setAddEmpParentId(deptId)
              setAddEmpOpen(true)
            }}
            onAddChildDept={(parentId) => {
              setAddDeptParentId(parentId)
              setAddDeptOpen(true)
            }}
          />
        </div>

        {/* Right Inspector Panel */}
        <BuilderInspectorPanel
          chart={chart}
          selectedNode={selectedNode}
          existingNodes={chart.nodes}
          onUpdateNode={(updated) => {
            pushState({
              ...chart,
              nodes: chart.nodes.map((n) => (n.id === updated.id ? updated : n)),
            })
          }}
          onDeleteNode={handleDeleteNode}
          onChangeParent={(node) => {
            setChangeParentNode(node)
            setChangeParentOpen(true)
          }}
          onDuplicateNode={handleDuplicateNode}
        />
      </div>

      {/* Dialogs */}
      <AddDepartmentDialog
        open={addDeptOpen}
        onOpenChange={setAddDeptOpen}
        existingNodes={chart.nodes}
        defaultParentId={addDeptParentId}
        onAdd={handleAddDepartment}
      />

      <AddEmployeeDialog
        open={addEmpOpen}
        onOpenChange={setAddEmpOpen}
        existingNodes={chart.nodes}
        defaultParentId={addEmpParentId}
        onAdd={handleAddEmployee}
      />

      <AddRequiredDialog
        open={addReqOpen}
        onOpenChange={setAddReqOpen}
        existingNodes={chart.nodes}
        defaultParentId={addReqParentId}
        onAdd={handleAddRequired}
      />

      <ChangeParentDialog
        open={changeParentOpen}
        onOpenChange={setChangeParentOpen}
        targetNode={changeParentNode}
        existingNodes={chart.nodes}
        onChangeParent={handleChangeParent}
      />

      <ConnectNodesDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        existingNodes={chart.nodes}
        initialSourceNodeId={connectSourceId}
        onConnect={handleConnectNodes}
      />

      <UnsavedChangesDialog
        open={unsavedOpen}
        onOpenChange={setUnsavedOpen}
        onStay={() => setUnsavedOpen(false)}
        onDiscard={() => {
          setUnsavedOpen(false)
          onBackToLibrary()
        }}
        onSaveAndExit={async () => {
          await handleSave(false)
          setUnsavedOpen(false)
          onBackToLibrary()
        }}
      />
    </div>
  )
}
