"use client"

import * as React from "react"
import {
  OrganizationChart,
  OrgNode,
  OrgConnection,
  SectionBoundary,
  TextAnnotation,
  OrgFooter,
  EmploymentType,
  OrgChartPageData,
  OrgNodeType,
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
import { OrgChartDocumentNavigator } from "./canvas-v2/org-chart-document-navigator"
import { CanvasLeftToolbar, ActiveCanvasTool } from "./toolbar-v2/canvas-left-toolbar"
import { ExportChartModal } from "./dialogs-v2/export-chart-modal"
import { ChartShape, ShapeKind } from "./shapes/types"
import { getShapeDefinition } from "./shapes/registry"
import { useSidebar } from "@/components/layout/sidebar-context"
import { toast } from "sonner"

interface BuilderV2PageProps {
  initialChart: OrganizationChart
  onBackToLibrary: () => void
  onOpenShareModal: (chartId: string) => void
}

type SelectedElement = {
  type: "node" | "connection" | "boundary" | "annotation" | "shape" | null
  id: string | null
}

function syncChartPages(c: OrganizationChart, pageIdx: number): OrganizationChart {
  const pages =
    c.pages && c.pages.length > 0
      ? [...c.pages]
      : [
          {
            id: "page-1",
            pageNumber: 1,
            title: "Page 1",
            nodes: c.nodes,
            connections: c.connections,
            boundaries: c.boundaries,
            annotations: c.annotations || [],
            shapes: c.shapes || [],
            footer: c.footer,
          },
        ]

  const safeIdx = Math.max(0, Math.min(pageIdx, pages.length - 1))
  pages[safeIdx] = {
    ...pages[safeIdx],
    nodes: c.nodes,
    connections: c.connections,
    boundaries: c.boundaries,
    annotations: c.annotations || [],
    shapes: c.shapes || [],
    footer: c.footer,
  }

  return {
    ...c,
    pages,
    activePageIndex: safeIdx,
  }
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
  }, [setIsCollapsed])

  // Active Tool state
  const [activeTool, setActiveTool] = React.useState<ActiveCanvasTool>("select")
  const [activeShapeKind, setActiveShapeKind] = React.useState<ShapeKind>("process")

  // Selected Element state
  const [selectedElement, setSelectedElement] = React.useState<SelectedElement>({
    type: null,
    id: null,
  })

  // Export Modal state
  const [exportModalOpen, setExportModalOpen] = React.useState(false)

  // Active Page Index state
  const [activePageIndex, setActivePageIndex] = React.useState<number>(
    initialChart.activePageIndex ?? 0
  )

  // Canvas View Action (Fit / Reset)
  const [canvasViewAction, setCanvasViewAction] = React.useState<"fit" | "reset" | null>(null)

  // Smart Alignment Guidelines Toggle state (Default ON)
  const [showAlignmentGuides, setShowAlignmentGuides] = React.useState<boolean>(true)

  // Chart State initialized with layout and pages
  const [chart, setChart] = React.useState<OrganizationChart>(() => {
    const layout = autoLayoutOrgChart(
      initialChart.nodes || [],
      initialChart.connections || [],
      initialChart.boundaries || []
    )
    const cleanBoundaries = (bList: SectionBoundary[] = []) =>
      bList.filter((b) => {
        const title = (b.title || "").toUpperCase()
        return !title.includes("PROJECT") && !title.includes("ZONE")
      })

    const cleanedPages = (initialChart.pages && initialChart.pages.length > 0
      ? initialChart.pages
      : [
          {
            id: "page-1",
            pageNumber: 1,
            title: "Page 1",
            nodes: layout.nodes,
            connections: layout.connections,
            boundaries: cleanBoundaries(layout.boundaries),
            annotations: initialChart.annotations || [],
            footer: initialChart.footer,
          },
        ]
    ).map((p) => ({
      ...p,
      boundaries: cleanBoundaries(p.boundaries),
    }))

    const initialPages: OrgChartPageData[] = cleanedPages

    const activeIdx = initialChart.activePageIndex ?? 0
    const activePage = initialPages[activeIdx] || initialPages[0]

    return {
      ...initialChart,
      pages: initialPages,
      activePageIndex: activeIdx,
      nodes:
        activePage.nodes && activePage.nodes.length > 0
          ? activePage.nodes
          : initialChart.nodes && initialChart.nodes.length > 0
          ? initialChart.nodes
          : layout.nodes,
      connections:
        activePage.connections && activePage.connections.length > 0
          ? activePage.connections
          : initialChart.connections || layout.connections,
      boundaries: cleanBoundaries(activePage.boundaries || initialChart.boundaries || layout.boundaries),
      annotations: activePage.annotations || initialChart.annotations || [],
      shapes: activePage.shapes || initialChart.shapes || [],
    }
  })

  // Sync if initialChart prop changes
  React.useEffect(() => {
    if (initialChart && initialChart.id !== chart.id) {
      setChart(initialChart)
    }
  }, [initialChart?.id])

  // Handle Page Selection
  const handleSelectPage = React.useCallback(
    (targetIndex: number) => {
      if (targetIndex === activePageIndex) return
      setChart((prev) => {
        const pages =
          prev.pages && prev.pages.length > 0
            ? [...prev.pages]
            : [
                {
                  id: "page-1",
                  pageNumber: 1,
                  title: "Page 1",
                  nodes: prev.nodes,
                  connections: prev.connections,
                  boundaries: prev.boundaries,
                  annotations: prev.annotations || [],
                  footer: prev.footer,
                },
              ]

        // Save current active page
        pages[activePageIndex] = {
          ...pages[activePageIndex],
          nodes: prev.nodes,
          connections: prev.connections,
          boundaries: prev.boundaries,
          annotations: prev.annotations || [],
          shapes: prev.shapes || [],
          footer: prev.footer,
        }

        const targetPage = pages[targetIndex] || {
          id: `page-${targetIndex + 1}`,
          pageNumber: targetIndex + 1,
          title: `Page ${targetIndex + 1}`,
          nodes: [],
          connections: [],
          boundaries: [],
          annotations: [],
          shapes: [],
          footer: prev.footer,
        }

        return {
          ...prev,
          pages,
          activePageIndex: targetIndex,
          nodes: targetPage.nodes || [],
          connections: targetPage.connections || [],
          boundaries: targetPage.boundaries || [],
          annotations: targetPage.annotations || [],
          shapes: targetPage.shapes || [],
        }
      })
      setSelectedElement({ type: null, id: null })
      setActivePageIndex(targetIndex)
    },
    [activePageIndex]
  )

  // Handle Add New Page (appends to end)
  const handleAddPage = React.useCallback(() => {
    setChart((prev) => {
      const pages =
        prev.pages && prev.pages.length > 0
          ? [...prev.pages]
          : [
              {
                id: "page-1",
                pageNumber: 1,
                title: "Page 1",
                nodes: prev.nodes,
                connections: prev.connections,
                boundaries: prev.boundaries,
                annotations: prev.annotations || [],
                footer: prev.footer,
              },
            ]

      pages[activePageIndex] = {
        ...pages[activePageIndex],
        nodes: prev.nodes,
        connections: prev.connections,
        boundaries: prev.boundaries,
        annotations: prev.annotations || [],
        footer: prev.footer,
      }

      const newPageNumber = pages.length + 1
      const newPage: OrgChartPageData = {
        id: `page-${Date.now()}`,
        pageNumber: newPageNumber,
        title: `Page ${newPageNumber}`,
        nodes: [
          {
            id: `node-${Date.now()}`,
            type: "EXECUTIVE",
            label: prev.projectManager || "Project Manager",
            parentId: null,
            position: { x: 480, y: 70 },
            width: 220,
            height: 65,
            metadata: {
              name: prev.projectManager || "Project Manager",
              designation: "Project Head",
              employmentType: "EMPLOYEE",
              color: "#1e293b",
            },
          },
        ],
        connections: [],
        boundaries: [],
        annotations: [],
        footer: { ...prev.footer },
      }

      const updatedPages = [...pages, newPage]
      const newIndex = updatedPages.length - 1
      setActivePageIndex(newIndex)
      toast.success(`Page ${newPageNumber} added!`)

      return {
        ...prev,
        pages: updatedPages,
        activePageIndex: newIndex,
        nodes: newPage.nodes,
        connections: newPage.connections,
        boundaries: newPage.boundaries,
        annotations: newPage.annotations,
      }
    })
    setSelectedElement({ type: null, id: null })
    setIsDirty(true)
  }, [activePageIndex])

  // Insert Page Before specified index
  const handleInsertPageBefore = React.useCallback(
    (refIndex: number) => {
      setChart((prev) => {
        const pages =
          prev.pages && prev.pages.length > 0
            ? [...prev.pages]
            : [
                {
                  id: "page-1",
                  pageNumber: 1,
                  title: "Page 1",
                  nodes: prev.nodes,
                  connections: prev.connections,
                  boundaries: prev.boundaries,
                  annotations: prev.annotations || [],
                  footer: prev.footer,
                },
              ]

        pages[activePageIndex] = {
          ...pages[activePageIndex],
          nodes: prev.nodes,
          connections: prev.connections,
          boundaries: prev.boundaries,
          annotations: prev.annotations || [],
          footer: prev.footer,
        }

        const insertAt = Math.max(0, refIndex)
        const newPageNum = pages.length + 1
        const newPage: OrgChartPageData = {
          id: `page-${Date.now()}`,
          pageNumber: newPageNum,
          title: `Page ${newPageNum}`,
          nodes: [
            {
              id: `node-${Date.now()}`,
              type: "EXECUTIVE",
              label: prev.projectManager || "Project Manager",
              parentId: null,
              position: { x: 480, y: 70 },
              width: 220,
              height: 65,
              metadata: {
                name: prev.projectManager || "Project Manager",
                designation: "Project Head",
                employmentType: "EMPLOYEE",
                color: "#1e293b",
              },
            },
          ],
          connections: [],
          boundaries: [],
          annotations: [],
          footer: { ...prev.footer },
        }

        pages.splice(insertAt, 0, newPage)
        setActivePageIndex(insertAt)
        toast.success(`Page inserted at position ${insertAt + 1}!`)

        return {
          ...prev,
          pages,
          activePageIndex: insertAt,
          nodes: newPage.nodes,
          connections: newPage.connections,
          boundaries: newPage.boundaries,
          annotations: newPage.annotations,
        }
      })
      setSelectedElement({ type: null, id: null })
      setIsDirty(true)
    },
    [activePageIndex]
  )

  // Insert Page After specified index
  const handleInsertPageAfter = React.useCallback(
    (refIndex: number) => {
      setChart((prev) => {
        const pages =
          prev.pages && prev.pages.length > 0
            ? [...prev.pages]
            : [
                {
                  id: "page-1",
                  pageNumber: 1,
                  title: "Page 1",
                  nodes: prev.nodes,
                  connections: prev.connections,
                  boundaries: prev.boundaries,
                  annotations: prev.annotations || [],
                  footer: prev.footer,
                },
              ]

        pages[activePageIndex] = {
          ...pages[activePageIndex],
          nodes: prev.nodes,
          connections: prev.connections,
          boundaries: prev.boundaries,
          annotations: prev.annotations || [],
          footer: prev.footer,
        }

        const insertAt = Math.min(pages.length, refIndex + 1)
        const newPageNum = pages.length + 1
        const newPage: OrgChartPageData = {
          id: `page-${Date.now()}`,
          pageNumber: newPageNum,
          title: `Page ${newPageNum}`,
          nodes: [
            {
              id: `node-${Date.now()}`,
              type: "EXECUTIVE",
              label: prev.projectManager || "Project Manager",
              parentId: null,
              position: { x: 480, y: 70 },
              width: 220,
              height: 65,
              metadata: {
                name: prev.projectManager || "Project Manager",
                designation: "Project Head",
                employmentType: "EMPLOYEE",
                color: "#1e293b",
              },
            },
          ],
          connections: [],
          boundaries: [],
          annotations: [],
          footer: { ...prev.footer },
        }

        pages.splice(insertAt, 0, newPage)
        setActivePageIndex(insertAt)
        toast.success(`Page added!`)

        return {
          ...prev,
          pages,
          activePageIndex: insertAt,
          nodes: newPage.nodes,
          connections: newPage.connections,
          boundaries: newPage.boundaries,
          annotations: newPage.annotations,
        }
      })
      setSelectedElement({ type: null, id: null })
      setIsDirty(true)
    },
    [activePageIndex]
  )

  // Duplicate Page
  const handleDuplicatePage = React.useCallback(
    (pageIndex: number) => {
      setChart((prev) => {
        const pages =
          prev.pages && prev.pages.length > 0
            ? [...prev.pages]
            : [
                {
                  id: "page-1",
                  pageNumber: 1,
                  title: "Page 1",
                  nodes: prev.nodes,
                  connections: prev.connections,
                  boundaries: prev.boundaries,
                  annotations: prev.annotations || [],
                  footer: prev.footer,
                },
              ]

        pages[activePageIndex] = {
          ...pages[activePageIndex],
          nodes: prev.nodes,
          connections: prev.connections,
          boundaries: prev.boundaries,
          annotations: prev.annotations || [],
          footer: prev.footer,
        }

        const sourcePage = pages[pageIndex]
        if (!sourcePage) return prev

        const insertAt = pageIndex + 1
        const duplicatedPage: OrgChartPageData = {
          ...JSON.parse(JSON.stringify(sourcePage)),
          id: `page-${Date.now()}`,
          title: `${sourcePage.title || `Page ${pageIndex + 1}`} (Copy)`,
        }

        pages.splice(insertAt, 0, duplicatedPage)
        setActivePageIndex(insertAt)
        toast.success("Page duplicated!")

        return {
          ...prev,
          pages,
          activePageIndex: insertAt,
          nodes: duplicatedPage.nodes,
          connections: duplicatedPage.connections,
          boundaries: duplicatedPage.boundaries,
          annotations: duplicatedPage.annotations,
        }
      })
      setSelectedElement({ type: null, id: null })
      setIsDirty(true)
    },
    [activePageIndex]
  )

  // Delete Page (with safety guard for single remaining page)
  const handleDeletePage = React.useCallback(
    (pageIndex: number) => {
      setChart((prev) => {
        const pages =
          prev.pages && prev.pages.length > 0
            ? [...prev.pages]
            : [
                {
                  id: "page-1",
                  pageNumber: 1,
                  title: "Page 1",
                  nodes: prev.nodes,
                  connections: prev.connections,
                  boundaries: prev.boundaries,
                  annotations: prev.annotations || [],
                  shapes: prev.shapes || [],
                  footer: prev.footer,
                },
              ]

        if (pages.length <= 1) {
          toast.error("Cannot delete the only page in document")
          return prev
        }

        const deletedTitle = pages[pageIndex]?.title || `Page ${pageIndex + 1}`
        pages.splice(pageIndex, 1)

        // Renumber remaining pages
        pages.forEach((p, idx) => {
          p.pageNumber = idx + 1
        })

        // Determine new active page index
        let nextIndex = activePageIndex
        if (pageIndex === activePageIndex) {
          nextIndex = Math.max(0, pageIndex - 1)
        } else if (pageIndex < activePageIndex) {
          nextIndex = Math.max(0, activePageIndex - 1)
        }
        if (nextIndex >= pages.length) {
          nextIndex = pages.length - 1
        }

        const targetPage = pages[nextIndex] || pages[0]
        setActivePageIndex(nextIndex)
        toast.success(`"${deletedTitle}" deleted`)

        return {
          ...prev,
          pages,
          activePageIndex: nextIndex,
          nodes: targetPage?.nodes || [],
          connections: targetPage?.connections || [],
          boundaries: targetPage?.boundaries || [],
          annotations: targetPage?.annotations || [],
          shapes: targetPage?.shapes || [],
        }
      })
      setSelectedElement({ type: null, id: null })
      setIsDirty(true)
    },
    [activePageIndex]
  )

  // Rename Page
  const handleRenamePage = React.useCallback(
    (pageIndex: number, newTitle: string) => {
      setChart((prev) => {
        const pages = prev.pages && prev.pages.length > 0 ? [...prev.pages] : []
        if (pages[pageIndex]) {
          pages[pageIndex] = {
            ...pages[pageIndex],
            title: newTitle,
          }
        }
        return {
          ...prev,
          pages,
        }
      })
      setIsDirty(true)
      toast.success("Page renamed")
    },
    []
  )

  // Reorder Pages
  const handleReorderPages = React.useCallback(
    (newPages: OrgChartPageData[]) => {
      setChart((prev) => {
        const activePageId = prev.pages?.[activePageIndex]?.id
        const newIndex = Math.max(
          0,
          newPages.findIndex((p) => p.id === activePageId)
        )
        setActivePageIndex(newIndex)
        return {
          ...prev,
          pages: newPages,
          activePageIndex: newIndex,
        }
      })
      setIsDirty(true)
    },
    [activePageIndex]
  )

  // Undo / Redo History Stacks
  const [history, setHistory] = React.useState<OrganizationChart[]>([chart])
  const [historyIndex, setHistoryIndex] = React.useState<number>(0)

  // Autosave tracking
  const [isDirty, setIsDirty] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(new Date())

  // Push to history helper
  const pushHistory = React.useCallback(
    (newChart: OrganizationChart) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1)
        return [...next, newChart]
      })
      setHistoryIndex((prev) => prev + 1)
    },
    [historyIndex]
  )

  // Undo Handler
  const handleUndo = React.useCallback(() => {
    if (historyIndex > 0) {
      const prevChart = history[historyIndex - 1]
      setChart(prevChart)
      setHistoryIndex((idx) => idx - 1)
      setIsDirty(true)
      toast.info("Action undone")
    }
  }, [history, historyIndex])

  // Redo Handler
  const handleRedo = React.useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextChart = history[historyIndex + 1]
      setChart(nextChart)
      setHistoryIndex((idx) => idx + 1)
      setIsDirty(true)
      toast.info("Action redone")
    }
  }, [history, historyIndex])

  // Auto layout helper
  const runAutoLayout = React.useCallback(
    (
      nodes: OrgNode[],
      connections: OrgConnection[],
      boundaries: SectionBoundary[] = []
    ) => {
      return autoLayoutOrgChart(nodes, connections, boundaries)
    },
    []
  )

  // Debounced Autosave (700ms)
  React.useEffect(() => {
    if (!isDirty) return

    const timer = setTimeout(async () => {
      try {
        setIsSaving(true)
        const syncedChart = syncChartPages(chart, activePageIndex)
        const saved = await orgChartService.saveChart(syncedChart)
        setIsDirty(false)
        setIsSaving(false)
        setLastSavedAt(new Date())
      } catch (err) {
        setIsSaving(false)
        console.error("Autosave error:", err)
      }
    }, 700)

    return () => clearTimeout(timer)
  }, [chart, isDirty, activePageIndex])

  // Helper to compute smart visible canvas positions for newly added nodes
  const computeNewNodePosition = React.useCallback(
    (
      nodes: OrgNode[],
      targetParentId: string | null,
      nodeWidth: number = 180,
      nodeHeight: number = 56
    ): { x: number; y: number } => {
      const MAX_X = 1450
      const MIN_X = 60

      const parent = nodes.find((n) => n.id === targetParentId)
      if (parent) {
        const siblings = nodes.filter((n) => n.parentId === targetParentId)
        if (siblings.length === 0) {
          return {
            x: Math.min(MAX_X, Math.max(MIN_X, Math.round(parent.position.x + ((parent.width || 180) - nodeWidth) / 2))),
            y: Math.round(parent.position.y + (parent.height || 60) + 70),
          }
        }
        const rightmost = siblings.reduce((prev, curr) =>
          curr.position.x > prev.position.x ? curr : prev
        )
        const nextX = Math.round(rightmost.position.x + (rightmost.width || nodeWidth) + 30)
        if (nextX + nodeWidth > MAX_X) {
          // Wrap to next row so node stays visibly within the document page sheet
          return {
            x: Math.max(MIN_X, parent.position.x - 180),
            y: Math.round(rightmost.position.y + nodeHeight + 35),
          }
        }
        return {
          x: nextX,
          y: Math.round(rightmost.position.y),
        }
      }

      // Root / standalone level
      if (nodes.length > 0) {
        const rootNodes = nodes.filter((n) => !n.parentId)
        if (rootNodes.length > 0) {
          const rightmostRoot = rootNodes.reduce((prev, curr) =>
            curr.position.x > prev.position.x ? curr : prev
          )
          const nextX = Math.round(rightmostRoot.position.x + (rightmostRoot.width || nodeWidth) + 40)
          if (nextX + nodeWidth > MAX_X) {
            return {
              x: MIN_X,
              y: Math.round(rightmostRoot.position.y + nodeHeight + 40),
            }
          }
          return {
            x: nextX,
            y: Math.round(rightmostRoot.position.y),
          }
        }
        let maxY = 0
        let lastX = 480
        nodes.forEach((n) => {
          maxY = Math.max(maxY, n.position.y + (n.height || 60))
          lastX = n.position.x
        })
        return {
          x: Math.min(MAX_X, Math.max(MIN_X, lastX)),
          y: maxY + 50,
        }
      }

      return { x: 480, y: 70 }
    },
    []
  )

  // 0. Add Organization (Root / Enterprise Entity)
  const handleAddOrganization = (
    name: string,
    code?: string,
    parentId?: string | null,
    color?: string
  ) => {
    const newOrgId = `org-${Date.now()}`
    const targetParent = parentId ?? null
    const newPos = computeNewNodePosition(chart.nodes, targetParent, 210, 56)

    const newOrgNode: OrgNode = {
      id: newOrgId,
      type: "ORGANIZATION",
      label: name,
      parentId: targetParent,
      position: newPos,
      width: 210,
      height: 56,
      metadata: {
        name,
        code: code || undefined,
        bgColor: color || "#c2410c",
        color: color || "#9a3412",
        textColor: "#ffffff",
      },
    }

    const updatedNodes = [...chart.nodes, newOrgNode]
    const updatedConnections = [...chart.connections]

    if (targetParent) {
      updatedConnections.push({
        id: `conn-${targetParent}-${newOrgId}`,
        source: targetParent,
        target: newOrgId,
        type: "orthogonal",
      })
    }

    const nextChart = syncChartPages(
      {
        ...chart,
        nodes: updatedNodes,
        connections: updatedConnections,
      },
      activePageIndex
    )

    setChart(nextChart)
    pushHistory(nextChart)
    setSelectedElement({ type: "node", id: newOrgId })
    setIsDirty(true)
    toast.success(`Organization "${name}" added!`)
  }

  // 1. Add Department
  const handleAddDepartment = (name: string, code: string, parentId: string | null) => {
    const newDeptId = `dept-${Date.now()}`
    const targetParent = parentId || (chart.nodes.length > 0 ? chart.nodes[0]?.id : null)
    const newPos = computeNewNodePosition(chart.nodes, targetParent, 195, 52)

    const newDeptNode: OrgNode = {
      id: newDeptId,
      type: "DEPARTMENT",
      label: name,
      parentId: targetParent,
      position: newPos,
      width: 195,
      height: 52,
      metadata: {
        department: name,
        departmentCode: code || undefined,
        color: "#1e40af",
      },
    }

    const updatedNodes = [...chart.nodes, newDeptNode]
    const updatedConnections = [...chart.connections]

    if (targetParent) {
      updatedConnections.push({
        id: `conn-${targetParent}-${newDeptId}`,
        source: targetParent,
        target: newDeptId,
        type: "orthogonal",
      })
    }

    const nextChart = syncChartPages(
      {
        ...chart,
        nodes: updatedNodes,
        connections: updatedConnections,
      },
      activePageIndex
    )

    setChart(nextChart)
    pushHistory(nextChart)
    setSelectedElement({ type: "node", id: newDeptId })
    setIsDirty(true)
  }

  // 2. Add Person (Employee / Consultant)
  const handleAddPerson = (
    name: string,
    designation: string,
    type: EmploymentType,
    parentId: string | null,
    extra?: { employeeId?: string; contact?: string; notes?: string }
  ) => {
    const newPersonId = `person-${Date.now()}`
    const targetParent = parentId || (chart.nodes.length > 0 ? chart.nodes[0]?.id : null)
    const newPos = computeNewNodePosition(chart.nodes, targetParent, 180, 56)

    let defaultBgColor = "#ffffff"
    let defaultBorderColor = "#94a3b8"
    let defaultTextColor = "#0f172a"
    let nodeType: OrgNodeType = "EMPLOYEE"

    if (type === "HOD") {
      nodeType = "HOD"
      defaultBgColor = "#15803d" // Green Color Default
      defaultBorderColor = "#166534"
      defaultTextColor = "#ffffff"
    } else if (type === "CONSULTANT") {
      nodeType = "CONSULTANT"
      defaultBgColor = "#ea580c" // Yellow shed Orange default
      defaultBorderColor = "#c2410c"
      defaultTextColor = "#ffffff"
    } else {
      nodeType = "EMPLOYEE"
      defaultBgColor = "#ffffff" // White and gray stroke
      defaultBorderColor = "#94a3b8"
      defaultTextColor = "#0f172a"
    }

    const newPersonNode: OrgNode = {
      id: newPersonId,
      type: nodeType,
      label: name,
      parentId: targetParent,
      position: newPos,
      width: 180,
      height: 56,
      metadata: {
        name,
        designation,
        employmentType: type,
        bgColor: defaultBgColor,
        color: defaultBorderColor,
        textColor: defaultTextColor,
        employeeId: extra?.employeeId,
        contact: extra?.contact,
        notes: extra?.notes,
      },
    }

    const updatedNodes = [...chart.nodes, newPersonNode]
    const updatedConnections = [...chart.connections]

    if (targetParent) {
      updatedConnections.push({
        id: `conn-${targetParent}-${newPersonId}`,
        source: targetParent,
        target: newPersonId,
        type: "orthogonal",
      })
    }

    const nextChart = syncChartPages(
      {
        ...chart,
        nodes: updatedNodes,
        connections: updatedConnections,
      },
      activePageIndex
    )

    setChart(nextChart)
    pushHistory(nextChart)
    setSelectedElement({ type: "node", id: newPersonId })
    setIsDirty(true)
  }

  // 3. Add Required Vacancy Position
  const handleAddRequired = (
    designation: string,
    quantity: number,
    parentId: string | null
  ) => {
    const newReqId = `req-${Date.now()}`
    const targetParent = parentId || (chart.nodes.length > 0 ? chart.nodes[0]?.id : null)
    const newPos = computeNewNodePosition(chart.nodes, targetParent, 180, 54)

    const newReqNode: OrgNode = {
      id: newReqId,
      type: "REQUIRED_POSITION",
      label: designation,
      parentId: targetParent,
      position: newPos,
      width: 180,
      height: 54,
      metadata: {
        designation,
        requiredQuantity: quantity,
      },
    }

    const updatedNodes = [...chart.nodes, newReqNode]
    const updatedConnections = [...chart.connections]

    if (targetParent) {
      updatedConnections.push({
        id: `conn-${targetParent}-${newReqId}`,
        source: targetParent,
        target: newReqId,
        type: "orthogonal",
      })
    }

    const nextChart = syncChartPages(
      {
        ...chart,
        nodes: updatedNodes,
        connections: updatedConnections,
      },
      activePageIndex
    )

    setChart(nextChart)
    pushHistory(nextChart)
    setSelectedElement({ type: "node", id: newReqId })
    setIsDirty(true)
  }

  // 4. Add Grouping Boundary
  const handleAddBoundary = (
    title: string,
    color = "#548235",
    borderStyle: "dashed" | "solid" = "dashed"
  ) => {
    const newId = `bnd-${Date.now()}`
    const newBoundary: SectionBoundary = {
      id: newId,
      title,
      position: { x: 100, y: 200 },
      width: 600,
      height: 380,
      color,
      borderStyle,
      titlePosition: "top-left-outside",
      borderRadius: 16,
      strokeWidth: 1.5,
    }

    const nextChart = syncChartPages(
      {
        ...chart,
        boundaries: [...chart.boundaries, newBoundary],
      },
      activePageIndex
    )

    setChart(nextChart)
    pushHistory(nextChart)
    setSelectedElement({ type: "boundary", id: newId })
    setIsDirty(true)
  }

  // 5. Add Text Annotation
  const handleAddAnnotation = (text: string, color = "#0f172a") => {
    const newId = `ann-${Date.now()}`
    const newAnnotation: TextAnnotation = {
      id: newId,
      text,
      position: { x: 120, y: 150 },
      color,
      fontSize: 13,
      fontWeight: "500",
      bgColor: "transparent",
      borderColor: "transparent",
      borderStyle: "none",
    }

    const nextChart = {
      ...chart,
      annotations: [...(chart.annotations || []), newAnnotation],
    }

    setChart(nextChart)
    pushHistory(nextChart)
    setSelectedElement({ type: "annotation", id: newId })
    setIsDirty(true)
  }

  // 6. Add Connection
  const handleAddConnection = (
    sourceId: string,
    targetId: string,
    typeOrSourceAnchor?: string,
    targetAnchor?: string,
    optionalType?: "orthogonal" | "bezier" | "straight"
  ) => {
    // Avoid duplicate connection
    const exists = chart.connections.some(
      (c) => c.source === sourceId && c.target === targetId
    )
    if (exists) {
      toast.error("Relationship already exists")
      return
    }

    let resolvedType: "orthogonal" | "bezier" | "straight" = "orthogonal"
    let resolvedSourceAnchor: "top" | "bottom" | "left" | "right" | undefined = undefined
    let resolvedTargetAnchor: "top" | "bottom" | "left" | "right" | undefined = undefined

    if (
      typeOrSourceAnchor === "orthogonal" ||
      typeOrSourceAnchor === "bezier" ||
      typeOrSourceAnchor === "straight"
    ) {
      resolvedType = typeOrSourceAnchor
    } else if (typeOrSourceAnchor) {
      resolvedSourceAnchor = typeOrSourceAnchor as any
      resolvedTargetAnchor = (targetAnchor as any) || "top"
      if (optionalType) resolvedType = optionalType
    }

    const newConn: OrgConnection = {
      id: `conn-${sourceId}-${targetId}-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: resolvedType,
      sourceAnchor: resolvedSourceAnchor,
      targetAnchor: resolvedTargetAnchor,
    }

    const nextChart = {
      ...chart,
      connections: [...chart.connections, newConn],
    }

    setChart(nextChart)
    pushHistory(nextChart)
    setSelectedElement({ type: "connection", id: newConn.id })
    setIsDirty(true)
    toast.success("Relationship established!")
  }

  // 7. Update Node Position
  const handleUpdateNodePosition = (nodeId: string, newPos: { x: number; y: number }) => {
    setChart((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, position: newPos } : n)),
    }))
    setIsDirty(true)
  }

  // 8. Update Boundary Position
  const handleUpdateBoundaryPosition = (boundaryId: string, newPos: { x: number; y: number }) => {
    setChart((prev) => ({
      ...prev,
      boundaries: prev.boundaries.map((b) =>
        b.id === boundaryId ? { ...b, position: newPos } : b
      ),
    }))
    setIsDirty(true)
  }

  // 8b. Update Boundary Size and Properties
  const handleUpdateBoundary = (boundaryId: string, updates: Partial<SectionBoundary>) => {
    setChart((prev) => ({
      ...prev,
      boundaries: prev.boundaries.map((b) =>
        b.id === boundaryId ? { ...b, ...updates } : b
      ),
    }))
    setIsDirty(true)
  }

  // 9. Update Annotation Position
  const handleUpdateAnnotationPosition = (annotationId: string, newPos: { x: number; y: number }) => {
    setChart((prev) => ({
      ...prev,
      annotations: (prev.annotations || []).map((a) =>
        a.id === annotationId ? { ...a, position: newPos } : a
      ),
    }))
    setIsDirty(true)
  }

  // 10. Update Node Properties
  const handleUpdateNode = (nodeId: string, updates: Partial<OrgNode>) => {
    const nextChart = {
      ...chart,
      nodes: chart.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
    }
    setChart(nextChart)
    pushHistory(nextChart)
    setIsDirty(true)
  }

  // 11. Change Node Parent
  const handleChangeParent = (nodeId: string, newParentId: string | null) => {
    let updatedConnections = chart.connections.filter((c) => c.target !== nodeId)
    if (newParentId) {
      updatedConnections.push({
        id: `conn-${newParentId}-${nodeId}`,
        source: newParentId,
        target: nodeId,
        type: "orthogonal",
      })
    }

    const updatedNodes = chart.nodes.map((n) =>
      n.id === nodeId ? { ...n, parentId: newParentId } : n
    )

    const layout = runAutoLayout(updatedNodes, updatedConnections, chart.boundaries)
    const nextChart = {
      ...chart,
      nodes: layout.nodes,
      connections: layout.connections,
      boundaries: layout.boundaries,
    }

    setChart(nextChart)
    pushHistory(nextChart)
    setIsDirty(true)
    toast.success("Reporting line updated!")
  }

  // 12. Delete Node
  const handleDeleteNode = (nodeId: string) => {
    if (chart.nodes.length <= 1) {
      toast.error("Cannot delete the only root element")
      return
    }

    const targetNode = chart.nodes.find((n) => n.id === nodeId)
    const newNodes = chart.nodes.filter((n) => n.id !== nodeId)
    const newConnections = chart.connections.filter(
      (c) => c.source !== nodeId && c.target !== nodeId
    )

    const layout = runAutoLayout(newNodes, newConnections, chart.boundaries)
    const nextChart = {
      ...chart,
      nodes: layout.nodes,
      connections: layout.connections,
      boundaries: layout.boundaries,
    }

    setChart(nextChart)
    pushHistory(nextChart)
    if (selectedElement.id === nodeId) {
      setSelectedElement({ type: null, id: null })
    }
    setIsDirty(true)
    toast.success(`Removed "${targetNode?.label || "node"}"`)
  }

  // 13. Duplicate Node
  const handleDuplicateNode = (nodeId: string) => {
    const nodeToDup = chart.nodes.find((n) => n.id === nodeId)
    if (!nodeToDup) return

    const newId = `${nodeToDup.id}-copy-${Date.now()}`
    const duplicatedNode: OrgNode = {
      ...JSON.parse(JSON.stringify(nodeToDup)),
      id: newId,
      label: `${nodeToDup.label} (Copy)`,
      position: { x: nodeToDup.position.x + 30, y: nodeToDup.position.y + 30 },
    }

    const updatedNodes = [...chart.nodes, duplicatedNode]
    let updatedConnections = [...chart.connections]

    if (nodeToDup.parentId) {
      updatedConnections.push({
        id: `conn-${nodeToDup.parentId}-${newId}`,
        source: nodeToDup.parentId,
        target: newId,
        type: "orthogonal",
      })
    }

    const nextChart = {
      ...chart,
      nodes: updatedNodes,
      connections: updatedConnections,
    }

    setChart(nextChart)
    pushHistory(nextChart)
    setSelectedElement({ type: "node", id: newId })
    setIsDirty(true)
    toast.success(`Duplicated "${nodeToDup.label}"`)
  }

  // 14. Toggle Accordion Collapse on Node
  const handleToggleNodeCollapse = (nodeId: string) => {
    setChart((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        n.id === nodeId ? { ...n, collapsed: !n.collapsed } : n
      ),
    }))
    setIsDirty(true)
  }

  // 15. Delete Selected Element (Keyboard shortcut / toolbar button)
  const handleDeleteSelected = React.useCallback(() => {
    if (!selectedElement.id) return

    if (selectedElement.type === "node") {
      handleDeleteNode(selectedElement.id)
    } else if (selectedElement.type === "connection") {
      setChart((prev) => ({
        ...prev,
        connections: prev.connections.filter((c) => c.id !== selectedElement.id),
      }))
      setSelectedElement({ type: null, id: null })
      setIsDirty(true)
      toast.success("Connector removed")
    } else if (selectedElement.type === "boundary") {
      setChart((prev) => ({
        ...prev,
        boundaries: prev.boundaries.filter((b) => b.id !== selectedElement.id),
      }))
      setSelectedElement({ type: null, id: null })
      setIsDirty(true)
      toast.success("Grouping container removed")
    } else if (selectedElement.type === "annotation") {
      setChart((prev) => ({
        ...prev,
        annotations: (prev.annotations || []).filter((a) => a.id !== selectedElement.id),
      }))
      setSelectedElement({ type: null, id: null })
      setIsDirty(true)
      toast.success("Annotation deleted")
    } else if (selectedElement.type === "shape") {
      setChart((prev) => ({
        ...prev,
        shapes: (prev.shapes || []).filter((s) => s.id !== selectedElement.id),
      }))
      setSelectedElement({ type: null, id: null })
      setIsDirty(true)
      toast.success("Shape deleted")
    }
  }, [selectedElement, chart.nodes.length])

  // Shape Actions
  const handleAddShape = (kind: ShapeKind, pos?: { x: number; y: number }) => {
    const def = getShapeDefinition(kind)
    const newId = `shape-${Date.now()}`
    const targetX = pos ? pos.x : 380 + Math.round(Math.random() * 50)
    const targetY = pos ? pos.y : 200 + Math.round(Math.random() * 50)
    const newShape: ChartShape = {
      id: newId,
      kind,
      x: Math.round(targetX),
      y: Math.round(targetY),
      width: def.defaultWidth || 140,
      height: def.defaultHeight || 80,
      rotation: 0,
      text: def.canContainText ? (kind === "text" ? "Text label" : def.label) : "",
      fill: kind === "text" || def.isLine ? "transparent" : "#eff6ff",
      fillOpacity: 1,
      stroke: "#2563EB",
      strokeWidth: 2,
      strokeStyle: "solid",
      fontSize: 13,
      fontWeight: 500,
      textColor: "#1e3a8a",
      textAlign: "middle",
      locked: false,
      zIndex: 10,
    }

    const nextChart = syncChartPages(
      {
        ...chart,
        shapes: [...(chart.shapes || []), newShape],
      },
      activePageIndex
    )
    setChart(nextChart)
    pushHistory(nextChart)
    setSelectedElement({ type: "shape", id: newId })
    setActiveTool("select")
    setIsDirty(true)
    toast.success(`${def.label} shape added!`)
  }

  const handleAddShapeWithBounds = (
    kind: ShapeKind,
    bounds: { x: number; y: number; width: number; height: number }
  ) => {
    const def = getShapeDefinition(kind)
    const newId = `shape-${Date.now()}`
    const newShape: ChartShape = {
      id: newId,
      kind,
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.max(24, Math.round(bounds.width)),
      height: Math.max(24, Math.round(bounds.height)),
      rotation: 0,
      text: def.canContainText ? (kind === "text" ? "Text label" : def.label) : "",
      fill: kind === "text" || def.isLine ? "transparent" : "#eff6ff",
      fillOpacity: 1,
      stroke: "#2563EB",
      strokeWidth: 2,
      strokeStyle: "solid",
      fontSize: 13,
      fontWeight: 500,
      textColor: "#1e3a8a",
      textAlign: "middle",
      locked: false,
      zIndex: 10,
    }

    const nextChart = syncChartPages(
      {
        ...chart,
        shapes: [...(chart.shapes || []), newShape],
      },
      activePageIndex
    )
    setChart(nextChart)
    pushHistory(nextChart)
    setSelectedElement({ type: "shape", id: newId })
    setActiveTool("select")
    setIsDirty(true)
    toast.success(`${def.label} created!`)
  }

  const handleUpdateShapePosition = (shapeId: string, newPos: { x: number; y: number }) => {
    setChart((prev) => ({
      ...prev,
      shapes: (prev.shapes || []).map((s) => (s.id === shapeId ? { ...s, ...newPos } : s)),
    }))
    setIsDirty(true)
  }

  const handleUpdateShapeSize = (
    shapeId: string,
    newSize: { width: number; height: number; x: number; y: number }
  ) => {
    setChart((prev) => ({
      ...prev,
      shapes: (prev.shapes || []).map((s) => (s.id === shapeId ? { ...s, ...newSize } : s)),
    }))
    setIsDirty(true)
  }

  const handleUpdateShapeText = (shapeId: string, text: string) => {
    setChart((prev) => ({
      ...prev,
      shapes: (prev.shapes || []).map((s) => (s.id === shapeId ? { ...s, text } : s)),
    }))
    setIsDirty(true)
  }

  const handleUpdateShape = (shapeId: string, updates: Partial<ChartShape>) => {
    setChart((prev) => {
      const nextChart = {
        ...prev,
        shapes: (prev.shapes || []).map((s) => (s.id === shapeId ? { ...s, ...updates } : s)),
      }
      return syncChartPages(nextChart, activePageIndex)
    })
    setIsDirty(true)
  }

  const handleDeleteShape = (shapeId: string) => {
    setChart((prev) => {
      const nextChart = {
        ...prev,
        shapes: (prev.shapes || []).filter((s) => s.id !== shapeId),
        connections: prev.connections.filter((c) => c.source !== shapeId && c.target !== shapeId),
      }
      return syncChartPages(nextChart, activePageIndex)
    })
    setSelectedElement({ type: "node", id: null })
    setIsDirty(true)
    toast.success("Shape deleted")
  }

  const handleDuplicateShape = (shapeId: string) => {
    const existing = chart.shapes?.find((s) => s.id === shapeId)
    if (!existing) return
    const newId = `shape-${Date.now()}`
    const duplicated: ChartShape = {
      ...existing,
      id: newId,
      x: existing.x + 30,
      y: existing.y + 30,
    }
    const nextChart = syncChartPages(
      {
        ...chart,
        shapes: [...(chart.shapes || []), duplicated],
      },
      activePageIndex
    )
    setChart(nextChart)
    pushHistory(nextChart)
    setSelectedElement({ type: "shape", id: newId })
    setIsDirty(true)
    toast.success("Shape duplicated")
  }

  // 16. Manual Auto Arrange
  const handleManualAutoArrange = () => {
    const layout = runAutoLayout(chart.nodes, chart.connections, chart.boundaries)
    const nextChart = {
      ...chart,
      nodes: layout.nodes,
      connections: layout.connections,
      boundaries: layout.boundaries,
    }
    setChart(nextChart)
    pushHistory(nextChart)
    setIsDirty(true)
    toast.success("Chart hierarchy auto-arranged with clean spacing!")
  }

  // 17. Save & Publish
  const handleSave = async (
    publish = false,
    metaUpdates?: Partial<OrganizationChart>
  ) => {
    try {
      setIsSaving(true)
      const baseChart = metaUpdates ? { ...chart, ...metaUpdates } : chart

      const currentPages =
        baseChart.pages && baseChart.pages.length > 0
          ? [...baseChart.pages]
          : [
              {
                id: "page-1",
                pageNumber: 1,
                title: "Page 1",
                nodes: baseChart.nodes,
                connections: baseChart.connections,
                boundaries: baseChart.boundaries,
                annotations: baseChart.annotations || [],
                shapes: baseChart.shapes || [],
                footer: baseChart.footer,
              },
            ]
      const safeIdx = Math.max(0, Math.min(activePageIndex, (currentPages.length || 1) - 1))
      if (currentPages[safeIdx]) {
        currentPages[safeIdx] = {
          ...currentPages[safeIdx],
          nodes: baseChart.nodes,
          connections: baseChart.connections,
          boundaries: baseChart.boundaries,
          annotations: baseChart.annotations || [],
          shapes: baseChart.shapes || [],
          footer: baseChart.footer,
        }
      }
      const isBasicInfoValid = Boolean(
        (baseChart.title || initialChart.title)?.trim() &&
        baseChart.clientName?.trim() &&
        baseChart.siteLocation?.trim() &&
        (metaUpdates?.isBasicInfoSaved ?? baseChart.isBasicInfoSaved) === true
      )
      const toSave = {
        ...baseChart,
        pages: currentPages,
        activePageIndex: safeIdx,
        status: publish ? ("CURRENT" as const) : baseChart.status,
        isBasicInfoSaved: isBasicInfoValid,
      }
      const saved = await orgChartService.saveChart(toSave)
      setChart(saved)
      setIsDirty(false)
      setIsSaving(false)
      setLastSavedAt(new Date())

      // Silently update browser URL if needed so refresh keeps this chart
      if (typeof window !== "undefined" && !window.location.search.includes(`id=${saved.id}`)) {
        window.history.replaceState(null, "", `/organization-chart?mode=builder&id=${saved.id}`)
      }

      toast.success(
        publish
          ? `Chart "${saved.title}" published as CURRENT version!`
          : "Draft saved successfully!"
      )
    } catch {
      setIsSaving(false)
      toast.error("Failed to save chart. Please try again.")
    }
  }

  // Handle Back to Library with auto-flush if unsaved changes exist
  const handleBack = async () => {
    if (
      isDirty &&
      chart.title?.trim() &&
      chart.clientName?.trim() &&
      chart.siteLocation?.trim()
    ) {
      await handleSave(false)
    }
    onBackToLibrary()
  }

  // Keyboard Shortcuts Hook
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in form field
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return
      }

      // Ctrl+Z: Undo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault()
        handleUndo()
        return
      }

      // Ctrl+Shift+Z or Ctrl+Y: Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y")
      ) {
        e.preventDefault()
        handleRedo()
        return
      }

      // Ctrl+S: Save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        handleSave(false)
        return
      }

      // Delete / Backspace: Delete selected
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        handleDeleteSelected()
        return
      }

      // Tool shortcuts
      if (e.key.toLowerCase() === "v") {
        setActiveTool("select")
      } else if (e.key.toLowerCase() === "h") {
        setActiveTool("hand")
      } else if (e.key.toLowerCase() === "r") {
        setActiveTool("rectangle")
      } else if (e.key.toLowerCase() === "c") {
        setActiveTool("connector")
      } else if (e.key.toLowerCase() === "t") {
        setActiveTool("text")
      } else if (e.key.toLowerCase() === "s") {
        setActiveTool("shapes")
      } else if (e.key === "Escape") {
        setSelectedElement({ type: null, id: null })
        setActiveTool("select")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleUndo, handleRedo, handleDeleteSelected, handleSave])

  // Auto-Save Effect: silently debounced auto-save 1200ms after changes
  // Auto Save ONLY works when user fills and saves basic info (Title, Client Name, and Site Location)
  React.useEffect(() => {
    const isBasicInfoSaved = Boolean(
      chart.title?.trim() &&
      chart.clientName?.trim() &&
      chart.siteLocation?.trim() &&
      chart.isBasicInfoSaved === true
    )
    if (!isDirty || isSaving || !isBasicInfoSaved) return

    const timer = setTimeout(async () => {
      try {
        setIsSaving(true)
        const currentPages =
          chart.pages && chart.pages.length > 0
            ? [...chart.pages]
            : [
                {
                  id: "page-1",
                  pageNumber: 1,
                  title: "Page 1",
                  nodes: chart.nodes,
                  connections: chart.connections,
                  boundaries: chart.boundaries,
                  annotations: chart.annotations || [],
                  shapes: chart.shapes || [],
                  footer: chart.footer,
                },
              ]
        const safeIdx = Math.max(0, Math.min(activePageIndex, (currentPages.length || 1) - 1))
        if (currentPages[safeIdx]) {
          currentPages[safeIdx] = {
            ...currentPages[safeIdx],
            nodes: chart.nodes,
            connections: chart.connections,
            boundaries: chart.boundaries,
            annotations: chart.annotations || [],
            shapes: chart.shapes || [],
            footer: chart.footer,
          }
        }
        const toSave = {
          ...chart,
          pages: currentPages,
          activePageIndex: safeIdx,
          isBasicInfoSaved: true,
        }
        const saved = await orgChartService.saveChart(toSave)
        setChart(saved)
        setIsDirty(false)
        setIsSaving(false)
        setLastSavedAt(new Date())
      } catch {
        setIsSaving(false)
      }
    }, 1200)

    return () => clearTimeout(timer)
  }, [isDirty, chart, activePageIndex, isSaving])

  return (
    <div className="flex flex-col w-full max-w-full h-full flex-1 min-h-0 overflow-hidden bg-background text-foreground select-none">
      {/* 1. Header Action Bar */}
      <BuilderV2Header
        chart={chart}
        title={chart.title}
        version={chart.version}
        status={chart.status}
        effectiveDate={chart.effectiveFrom}
        isDirty={isDirty}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        onUpdateChartMeta={(meta) => {
          setChart((prev) => ({ ...prev, ...meta }))
          setIsDirty(true)
        }}
        onBack={handleBack}
        onSave={handleSave}
        onOpenShareModal={() => setExportModalOpen(true)}
        onAutoArrange={handleManualAutoArrange}
        showAlignmentGuides={showAlignmentGuides}
        onToggleAlignmentGuides={() => setShowAlignmentGuides((prev) => !prev)}
        onExportPdf={() => setExportModalOpen(true)}
        onExportPng={() => setExportModalOpen(true)}
        onExportSvg={() => setExportModalOpen(true)}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* 2. Workspace: Canvas (Center) + Freehand Tools (Left) + Control Center (Right) */}
      <div className="flex flex-1 min-h-0 w-full max-w-full h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] overflow-hidden relative">
        {/* LEFT: Vertical Freehand Canvas Tools */}
        <CanvasLeftToolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          activeShapeKind={activeShapeKind}
          onSelectShapeKind={(kind) => {
            setActiveShapeKind(kind)
            setActiveTool("shapes")
          }}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          hasSelection={!!selectedElement.id}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onDeleteSelected={handleDeleteSelected}
          onFitToScreen={() => setCanvasViewAction("fit")}
          onResetView={() => setCanvasViewAction("reset")}
          onAddShape={handleAddShape}
        />

        {/* CENTER: Infinite Organization Chart Canvas + Docked Page Navigator */}
        <div className="flex-1 min-w-0 h-full relative overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 relative overflow-hidden">
            <OrgChartPreviewCanvas
              viewAction={canvasViewAction}
              onViewActionHandled={() => setCanvasViewAction(null)}
              nodes={chart.nodes}
              connections={chart.connections}
              boundaries={chart.boundaries}
              annotations={chart.annotations || []}
              shapes={chart.shapes || []}
              footer={chart.footer}
              chartTitle={chart.title}
              siteName={chart.siteName}
              companyName={chart.companyName || chart.siteName}
              siteLocation={chart.siteLocation}
              projectManager={chart.projectManager || chart.footer?.projectInfo?.projectManager}
              effectiveDate={chart.effectiveFrom}
              showAlignmentGuides={showAlignmentGuides}
              activeTool={activeTool}
              activeShapeKind={activeShapeKind}
              onCancelTool={() => setActiveTool("select")}
              selectedElement={selectedElement}
              onSelectElement={(type, id) => setSelectedElement({ type, id })}
              onUpdateNodePosition={handleUpdateNodePosition}
              onUpdateBoundaryPosition={handleUpdateBoundaryPosition}
              onUpdateBoundary={handleUpdateBoundary}
              onUpdateAnnotationPosition={handleUpdateAnnotationPosition}
              onUpdateAnnotation={(id, updates) =>
                setChart((prev) => ({
                  ...prev,
                  annotations: (prev.annotations || []).map((a) =>
                    a.id === id ? { ...a, ...updates } : a
                  ),
                }))
              }
              onUpdateShapePosition={handleUpdateShapePosition}
              onUpdateShapeSize={handleUpdateShapeSize}
              onUpdateShapeText={handleUpdateShapeText}
              onAddShapeAt={(kind, pos) => handleAddShape(kind, pos)}
              onAddShapeWithBounds={handleAddShapeWithBounds}
              onConnectNodes={handleAddConnection}
              onToggleNodeCollapse={handleToggleNodeCollapse}
              onAddAnnotationAt={(pos) => {
                const newId = `ann-${Date.now()}`
                const newAnn: TextAnnotation = {
                  id: newId,
                  text: "Project note...",
                  position: pos,
                  fontSize: 13,
                  fontWeight: "500",
                  color: "#0f172a",
                  bgColor: "transparent",
                  borderColor: "transparent",
                  borderStyle: "none",
                }
                const nextChart = syncChartPages(
                  {
                    ...chart,
                    annotations: [...(chart.annotations || []), newAnn],
                  },
                  activePageIndex
                )
                setChart(nextChart)
                pushHistory(nextChart)
                setSelectedElement({ type: "annotation", id: newId })
                setActiveTool("select")
                setIsDirty(true)
              }}
              onAddBoundaryAt={(pos, size) => {
                const newId = `bnd-${Date.now()}`
                const newBnd: SectionBoundary = {
                  id: newId,
                  title: "NEW PROJECT ZONE",
                  position: pos,
                  width: size?.width || 480,
                  height: size?.height || 280,
                  color: "#548235",
                  borderStyle: "dashed",
                  titlePosition: "top-left-outside",
                  borderRadius: 16,
                  strokeWidth: 1.5,
                }
                const nextChart = syncChartPages(
                  {
                    ...chart,
                    boundaries: [...chart.boundaries, newBnd],
                  },
                  activePageIndex
                )
                setChart(nextChart)
                pushHistory(nextChart)
                setSelectedElement({ type: "boundary", id: newId })
                setActiveTool("select")
                setIsDirty(true)
                toast.success("New rectangle created!")
              }}
            />
          </div>

          {/* DOCKED BOTTOM BAR: CorelDRAW / Eva-Design-Tool Document Navigator */}
          <OrgChartDocumentNavigator
            pages={chart.pages || []}
            activePageIndex={activePageIndex}
            onSelectPage={handleSelectPage}
            onInsertPageBefore={handleInsertPageBefore}
            onInsertPageAfter={handleInsertPageAfter}
            onDuplicatePage={handleDuplicatePage}
            onDeletePage={handleDeletePage}
            onRenamePage={handleRenamePage}
            onReorderPages={handleReorderPages}
          />
        </div>

        {/* RIGHT: Context-Aware Control Center Panel */}
        <BuilderV2RightPanel
          chart={chart}
          selectedElement={selectedElement}
          onSelectElement={(type, id) => setSelectedElement({ type, id })}
          onUpdateChartMeta={(meta) => {
            setChart((prev) => ({ ...prev, ...meta }))
            setIsDirty(true)
          }}
          onAddOrganization={handleAddOrganization}
          onAddDepartment={handleAddDepartment}
          onAddPerson={handleAddPerson}
          onAddRequired={handleAddRequired}
          onAddBoundary={handleAddBoundary}
          onAddAnnotation={handleAddAnnotation}
          onAddConnection={handleAddConnection}
          onUpdateNode={handleUpdateNode}
          onChangeParent={handleChangeParent}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
          onUpdateConnection={(id, updates) => {
            setChart((prev) => ({
              ...prev,
              connections: prev.connections.map((c) =>
                c.id === id ? { ...c, ...updates } : c
              ),
            }))
            setIsDirty(true)
          }}
          onDeleteConnection={(id) => {
            setChart((prev) => ({
              ...prev,
              connections: prev.connections.filter((c) => c.id !== id),
            }))
            setSelectedElement({ type: null, id: null })
            setIsDirty(true)
          }}
          onUpdateBoundary={(id, updates) => {
            setChart((prev) => ({
              ...prev,
              boundaries: prev.boundaries.map((b) =>
                b.id === id ? { ...b, ...updates } : b
              ),
            }))
            setIsDirty(true)
          }}
          onDeleteBoundary={(id) => {
            setChart((prev) => ({
              ...prev,
              boundaries: prev.boundaries.filter((b) => b.id !== id),
            }))
            setSelectedElement({ type: null, id: null })
            setIsDirty(true)
          }}
          onUpdateAnnotation={(id, updates) => {
            setChart((prev) => ({
              ...prev,
              annotations: (prev.annotations || []).map((a) =>
                a.id === id ? { ...a, ...updates } : a
              ),
            }))
            setIsDirty(true)
          }}
          onDeleteAnnotation={(id) => {
            setChart((prev) => ({
              ...prev,
              annotations: (prev.annotations || []).filter((a) => a.id !== id),
            }))
            setSelectedElement({ type: null, id: null })
            setIsDirty(true)
          }}
          onUpdateShape={handleUpdateShape}
          onDeleteShape={handleDeleteShape}
          onDuplicateShape={handleDuplicateShape}
          onUpdateFooter={(newFooter) => {
            setChart((prev) => ({ ...prev, footer: newFooter }))
            setIsDirty(true)
          }}
          onSave={handleSave}
          isSaving={isSaving}
          lastSavedAt={lastSavedAt}
        />
      </div>

      {/* Export & Share Modal with Page Selection Prompt */}
      <ExportChartModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        chart={React.useMemo(() => {
          const pages = chart.pages && chart.pages.length > 0 ? [...chart.pages] : []
          const safeIdx = Math.max(0, Math.min(activePageIndex, (pages.length || 1) - 1))
          if (pages[safeIdx]) {
            pages[safeIdx] = {
              ...pages[safeIdx],
              nodes: chart.nodes,
              connections: chart.connections,
              boundaries: chart.boundaries,
              annotations: chart.annotations,
              shapes: chart.shapes,
              footer: chart.footer,
            }
          } else if (pages.length === 0) {
            pages.push({
              id: "page-1",
              pageNumber: 1,
              title: chart.title || "Page 1",
              nodes: chart.nodes,
              connections: chart.connections,
              boundaries: chart.boundaries,
              annotations: chart.annotations,
              shapes: chart.shapes,
              footer: chart.footer,
            })
          }
          return {
            ...chart,
            pages,
            activePageIndex: safeIdx,
          }
        }, [chart, activePageIndex])}
        activePageIndex={activePageIndex}
      />
    </div>
  )
}
