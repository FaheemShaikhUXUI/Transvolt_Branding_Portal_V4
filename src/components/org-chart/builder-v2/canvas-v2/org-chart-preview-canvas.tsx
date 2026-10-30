"use client"

import * as React from "react"
import {
  OrgNode,
  OrgConnection,
  SectionBoundary,
  TextAnnotation,
  OrgFooter,
  OrgChartPageData,
} from "@/lib/org-chart/types"
import { OrganizationTileV2 } from "../nodes-v2/organization-tile-v2"
import { ExecutiveTileV2 } from "../nodes-v2/executive-tile-v2"
import { DepartmentTileV2 } from "../nodes-v2/department-tile-v2"
import { PersonTileV2 } from "../nodes-v2/person-tile-v2"
import { RequiredTileV2 } from "../nodes-v2/required-tile-v2"
import { CanvasConnectorsV2 } from "./canvas-connectors-v2"
import { CanvasGroupRectangle, ResizeDirection } from "./canvas-group-rectangle"
import { CanvasTextAnnotation } from "./canvas-text-annotation"
import { OrgChartFooterV2, MatrixBracketIcon } from "./org-chart-footer-v2"
import { ActiveCanvasTool } from "../toolbar-v2/canvas-left-toolbar"
import { ChartShape, ShapeKind } from "../shapes/types"
import { CanvasShapeItem } from "../shapes/canvas-shape-item"
import { ShapeDefs, ShapeGeometry } from "../shapes/geometry"
import { getShapeDefinition } from "../shapes/registry"
import { ZoomIn, ZoomOut, Maximize2, Compass, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PAGE_MARGIN_X = 60
const PAGE_MARGIN_Y = 60
const PAGE_HEADER_HEIGHT = 56
const PAGE_WIDTH = 1680

interface PreviewCanvasProps {
  nodes: OrgNode[]
  connections: OrgConnection[]
  boundaries: SectionBoundary[]
  annotations?: TextAnnotation[]
  shapes?: ChartShape[]
  footer: OrgFooter
  chartTitle?: string
  siteName?: string
  companyName?: string
  siteLocation?: string
  projectManager?: string
  effectiveDate?: string
  activeTool: ActiveCanvasTool
  activeShapeKind?: ShapeKind
  selectedElement: {
    type: "node" | "connection" | "boundary" | "annotation" | "shape" | null
    id: string | null
  }
  pages?: OrgChartPageData[]
  activePageIndex?: number
  onSelectPage?: (pageIndex: number) => void
  onAddPage?: () => void
  onDeletePage?: (pageIndex: number) => void
  onSelectElement: (type: "node" | "connection" | "boundary" | "annotation" | "shape" | null, id: string | null) => void
  onUpdateNodePosition: (nodeId: string, newPos: { x: number; y: number }) => void
  onUpdateBoundaryPosition: (boundaryId: string, newPos: { x: number; y: number }) => void
  onUpdateBoundary?: (boundaryId: string, updates: Partial<SectionBoundary>) => void
  onUpdateAnnotationPosition: (annotationId: string, newPos: { x: number; y: number }) => void
  onUpdateAnnotation: (annotationId: string, updates: Partial<TextAnnotation>) => void
  onUpdateShapePosition?: (shapeId: string, newPos: { x: number; y: number }) => void
  onUpdateShapeSize?: (shapeId: string, newSize: { width: number; height: number; x: number; y: number }) => void
  onUpdateShapeText?: (shapeId: string, text: string) => void
  onConnectNodes: (sourceId: string, targetId: string, sourceAnchor?: string, targetAnchor?: string) => void
  onToggleNodeCollapse: (nodeId: string) => void
  onAddAnnotationAt: (pos: { x: number; y: number }) => void
  onAddBoundaryAt: (pos: { x: number; y: number }, size?: { width: number; height: number }) => void
  onAddShapeAt?: (kind: ShapeKind, pos: { x: number; y: number }) => void
  onAddShapeWithBounds?: (kind: ShapeKind, bounds: { x: number; y: number; width: number; height: number }) => void
  onCancelTool?: () => void
  showAlignmentGuides?: boolean
  viewAction?: "fit" | "reset" | null
  onViewActionHandled?: () => void
}

export function OrgChartPreviewCanvas({
  nodes,
  connections,
  boundaries,
  annotations = [],
  shapes = [],
  footer,
  chartTitle,
  siteName,
  companyName,
  siteLocation,
  projectManager,
  effectiveDate,
  activeTool,
  activeShapeKind = "process",
  selectedElement,
  showAlignmentGuides = true,
  pages = [],
  activePageIndex = 0,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onSelectElement,
  onUpdateNodePosition,
  onUpdateBoundaryPosition,
  onUpdateBoundary,
  onUpdateAnnotationPosition,
  onUpdateAnnotation,
  onUpdateShapePosition,
  onUpdateShapeSize,
  onUpdateShapeText,
  onConnectNodes,
  onToggleNodeCollapse,
  onAddAnnotationAt,
  onAddBoundaryAt,
  onAddShapeAt,
  onAddShapeWithBounds,
  onCancelTool,
  viewAction,
  onViewActionHandled,
}: PreviewCanvasProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Viewport State: Zoom (0.1 to 5.0) and Pan (centered by default)
  const [zoom, setZoom] = React.useState(0.7)
  const [pan, setPan] = React.useState({ x: 60, y: 30 })

  // Panning State (Supports middle mouse wheel click button === 1 and right-click button === 2)
  const [isPanning, setIsPanning] = React.useState(false)
  const [panStart, setPanStart] = React.useState({ x: 0, y: 0 })

  // 4-Sided Resizing State for Dotted Grouping Rectangles
  const [resizingBoundary, setResizingBoundary] = React.useState<{
    id: string
    direction: ResizeDirection
    startX: number
    startY: number
    origX: number
    origY: number
    origWidth: number
    origHeight: number
  } | null>(null)

  // Active Arrow / Connector Source for Click-to-Connect
  const [connectorSourceId, setConnectorSourceId] = React.useState<string | null>(null)

  // Live Drawing Draft for Shapes and Boundaries
  const [drawingDraft, setDrawingDraft] = React.useState<{
    mode: "shape" | "rect"
    kind?: ShapeKind
    startX: number
    startY: number
    currentX: number
    currentY: number
  } | null>(null)

  // Dragging State for Nodes / Objects
  const [draggingObj, setDraggingObj] = React.useState<{
    type: "node" | "boundary" | "annotation"
    id: string
    startX: number
    startY: number
    origX: number
    origY: number
    multiOrigPos?: Map<string, { x: number; y: number }>
  } | null>(null)

  // Marquee Selection Box State (Hold and drag right key or Selection tool drag)
  const [selectionMarquee, setSelectionMarquee] = React.useState<{
    startX: number
    startY: number
    currentX: number
    currentY: number
  } | null>(null)

  // Multi-selected item IDs from Marquee Selection
  const [multiSelectedIds, setMultiSelectedIds] = React.useState<Set<string>>(new Set())

  // Drag-to-connect active state
  const [activeConnect, setActiveConnect] = React.useState<{
    sourceId: string
    sourceAnchor: "top" | "bottom" | "left" | "right"
    currentX: number
    currentY: number
  } | null>(null)

  // Smart Alignment Guidelines active state
  type CanvasAlignmentGuide = {
    orientation: "vertical" | "horizontal"
    position: number
    start: number
    end: number
    type: "top" | "bottom" | "left" | "right" | "center"
    label: string
  }
  const [activeGuides, setActiveGuides] = React.useState<CanvasAlignmentGuide[]>([])

  // Matrix popout modal state
  const [isMatrixOpen, setIsMatrixOpen] = React.useState(false)

  // Escape key closes matrix modal
  React.useEffect(() => {
    if (!isMatrixOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMatrixOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isMatrixOpen])

  // Convert mouse screen coordinates to canvas-space coordinates (clean 1:1 infinite open space)
  const screenToCanvasCoords = React.useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 }
      const rect = containerRef.current.getBoundingClientRect()
      return {
        x: (clientX - rect.left - pan.x) / zoom,
        y: (clientY - rect.top - pan.y) / zoom,
      }
    },
    [pan.x, pan.y, zoom]
  )

  // Subtree calculation: identify which nodes are hidden due to a collapsed ancestor (circular reference protected)
  const collapsedHiddenNodeIds = React.useMemo(() => {
    const hidden = new Set<string>()

    const hideDescendants = (parentId: string, visited = new Set<string>()) => {
      if (visited.has(parentId)) return
      visited.add(parentId)
      nodes
        .filter((n) => n.parentId === parentId)
        .forEach((child) => {
          hidden.add(child.id)
          hideDescendants(child.id, visited)
        })
    }

    nodes.forEach((node) => {
      if (node.collapsed) {
        hideDescendants(node.id)
      }
    })

    return hidden
  }, [nodes])

  // Cache of live rendered DOM element dimensions for pixel-perfect snapping and guidelines
  const domNodeDimsRef = React.useRef<Map<string, { width: number; height: number }>>(new Map())

  const getDOMNodeDimensions = React.useCallback(
    (nodeId: string, fallbackNode?: OrgNode): { width: number; height: number } => {
      if (domNodeDimsRef.current.has(nodeId)) {
        const cached = domNodeDimsRef.current.get(nodeId)!
        if (cached.width > 0 && cached.height > 0) return cached
      }
      if (typeof document !== "undefined") {
        const el = document.getElementById(`canvas-node-${nodeId}`)
        if (el) {
          const tile = (el.firstElementChild as HTMLElement) || el
          const w = tile.offsetWidth || el.offsetWidth
          const h = tile.offsetHeight || el.offsetHeight
          if (w > 0 && h > 0) {
            const dims = { width: w, height: h }
            domNodeDimsRef.current.set(nodeId, dims)
            return dims
          }
        }
      }
      const type = fallbackNode?.type
      const defaultW = type === "ORGANIZATION" ? 200 : type === "EXECUTIVE" ? 190 : type === "DEPARTMENT" ? 175 : 165
      const defaultH = type === "ORGANIZATION" ? 56 : 52
      return {
        width: fallbackNode?.width || defaultW,
        height: fallbackNode?.height || defaultH,
      }
    },
    []
  )

  const refreshNodeDimensions = React.useCallback(() => {
    domNodeDimsRef.current.clear()
    if (typeof document === "undefined") return
    nodes.forEach((n) => {
      const el = document.getElementById(`canvas-node-${n.id}`)
      if (el) {
        const tile = (el.firstElementChild as HTMLElement) || el
        const w = tile.offsetWidth || el.offsetWidth
        const h = tile.offsetHeight || el.offsetHeight
        if (w > 0 && h > 0) {
          domNodeDimsRef.current.set(n.id, { width: w, height: h })
        }
      }
    })
  }, [nodes])

  React.useEffect(() => {
    refreshNodeDimensions()
  }, [nodes, refreshNodeDimensions])

  // Helper to compute bounding box for any object
  const getObjectBounds = React.useCallback(
    (
      type: "node" | "boundary" | "annotation" | "shape",
      id: string,
      currentPos?: { x: number; y: number }
    ): { x: number; y: number; width: number; height: number } | null => {
      if (type === "node") {
        const n = nodes.find((item) => item.id === id)
        if (!n) return null
        const dims = getDOMNodeDimensions(id, n)
        return {
          x: currentPos ? currentPos.x : n.position.x,
          y: currentPos ? currentPos.y : n.position.y,
          width: dims.width,
          height: dims.height,
        }
      }
      if (type === "boundary") {
        const b = boundaries.find((item) => item.id === id)
        if (!b) return null
        return {
          x: currentPos ? currentPos.x : b.position.x,
          y: currentPos ? currentPos.y : b.position.y,
          width: b.width,
          height: b.height,
        }
      }
      if (type === "annotation") {
        const a = annotations.find((item) => item.id === id)
        if (!a) return null
        let w = a.width || 160
        let h = a.height || 40
        if (typeof document !== "undefined") {
          const el = document.getElementById(`canvas-annotation-${id}`)
          if (el && el.offsetWidth > 0) {
            w = el.offsetWidth
            h = el.offsetHeight
          }
        }
        return {
          x: currentPos ? currentPos.x : a.position.x,
          y: currentPos ? currentPos.y : a.position.y,
          width: w,
          height: h,
        }
      }
      if (type === "shape") {
        const s = shapes.find((item) => item.id === id)
        if (!s) return null
        return {
          x: currentPos ? currentPos.x : s.x,
          y: currentPos ? currentPos.y : s.y,
          width: s.width,
          height: s.height,
        }
      }
      return null
    },
    [nodes, boundaries, annotations, shapes, getDOMNodeDimensions]
  )

  // Super Advanced Alignment Guideline and Magnetic Snap Engine (TOP, Bottom, Left, Right, Center)
  const calculateAlignmentGuides = React.useCallback(
    (
      movingType: "node" | "boundary" | "annotation" | "shape",
      movingId: string,
      rawPos: { x: number; y: number },
      excludedIds?: Set<string>
    ): { snappedPos: { x: number; y: number }; guides: CanvasAlignmentGuide[] } => {
      const movingBounds = getObjectBounds(movingType, movingId, rawPos)
      if (!movingBounds) return { snappedPos: rawPos, guides: [] }

      const SNAP_THRESHOLD = 7
      const NEARBY_DISTANCE = 1600

      let snappedX = rawPos.x
      let snappedY = rawPos.y
      const guides: CanvasAlignmentGuide[] = []

      const mWidth = movingBounds.width
      const mHeight = movingBounds.height
      const mLeft = rawPos.x
      const mRight = rawPos.x + mWidth
      const mCenterX = rawPos.x + mWidth / 2
      const mTop = rawPos.y
      const mBottom = rawPos.y + mHeight
      const mCenterY = rawPos.y + mHeight / 2

      type CandidateBox = { id: string; left: number; right: number; centerX: number; top: number; bottom: number; centerY: number }
      const candidates: CandidateBox[] = []

      // 1. Other Nodes
      nodes.forEach((n) => {
        if (n.id === movingId || (excludedIds && excludedIds.has(n.id)) || collapsedHiddenNodeIds.has(n.id)) return
        const dims = getDOMNodeDimensions(n.id, n)
        const w = dims.width
        const h = dims.height
        const l = n.position.x
        const t = n.position.y
        candidates.push({
          id: n.id,
          left: l,
          right: l + w,
          centerX: l + w / 2,
          top: t,
          bottom: t + h,
          centerY: t + h / 2,
        })
      })

      // 2. Shapes
      shapes.forEach((s) => {
        if (s.id === movingId || (excludedIds && excludedIds.has(s.id))) return
        candidates.push({
          id: s.id,
          left: s.x,
          right: s.x + s.width,
          centerX: s.x + s.width / 2,
          top: s.y,
          bottom: s.y + s.height,
          centerY: s.y + s.height / 2,
        })
      })

      // 3. Boundaries
      boundaries.forEach((b) => {
        if (b.id === movingId || (excludedIds && excludedIds.has(b.id))) return
        candidates.push({
          id: b.id,
          left: b.position.x,
          right: b.position.x + b.width,
          centerX: b.position.x + b.width / 2,
          top: b.position.y,
          bottom: b.position.y + b.height,
          centerY: b.position.y + b.height / 2,
        })
      })

      // 4. Annotations
      annotations.forEach((a) => {
        if (a.id === movingId || (excludedIds && excludedIds.has(a.id))) return
        let w = a.width || 160
        let h = a.height || 40
        if (typeof document !== "undefined") {
          const el = document.getElementById(`canvas-annotation-${a.id}`)
          if (el && el.offsetWidth > 0) {
            w = el.offsetWidth
            h = el.offsetHeight
          }
        }
        candidates.push({
          id: a.id,
          left: a.position.x,
          right: a.position.x + w,
          centerX: a.position.x + w / 2,
          top: a.position.y,
          bottom: a.position.y + h,
          centerY: a.position.y + h / 2,
        })
      })

      let minDiffX = SNAP_THRESHOLD + 1
      let bestSnapX: number | null = null
      let snapTypeX: "left" | "right" | "center" | "left-right" | "right-left" | null = null

      let minDiffY = SNAP_THRESHOLD + 1
      let bestSnapY: number | null = null
      let snapTypeY: "top" | "bottom" | "center" | "top-bottom" | "bottom-top" | null = null

      for (const c of candidates) {
        if (Math.abs(c.centerX - mCenterX) > NEARBY_DISTANCE && Math.abs(c.centerY - mCenterY) > NEARBY_DISTANCE) {
          continue
        }

        // === VERTICAL SNAP SEARCH (X matching: Center, Left, Right) ===
        const diffCenterX = Math.abs(mCenterX - c.centerX)
        if (diffCenterX <= SNAP_THRESHOLD && diffCenterX < minDiffX) {
          minDiffX = diffCenterX
          bestSnapX = c.centerX - mWidth / 2
          snapTypeX = "center"
        }

        const diffLeftLeft = Math.abs(mLeft - c.left)
        if (diffLeftLeft <= SNAP_THRESHOLD && diffLeftLeft < minDiffX) {
          minDiffX = diffLeftLeft
          bestSnapX = c.left
          snapTypeX = "left"
        }

        const diffRightRight = Math.abs(mRight - c.right)
        if (diffRightRight <= SNAP_THRESHOLD && diffRightRight < minDiffX) {
          minDiffX = diffRightRight
          bestSnapX = c.right - mWidth
          snapTypeX = "right"
        }

        const diffLeftRight = Math.abs(mLeft - c.right)
        if (diffLeftRight <= SNAP_THRESHOLD && diffLeftRight < minDiffX) {
          minDiffX = diffLeftRight
          bestSnapX = c.right
          snapTypeX = "left-right"
        }

        const diffRightLeft = Math.abs(mRight - c.left)
        if (diffRightLeft <= SNAP_THRESHOLD && diffRightLeft < minDiffX) {
          minDiffX = diffRightLeft
          bestSnapX = c.left - mWidth
          snapTypeX = "right-left"
        }

        // === HORIZONTAL SNAP SEARCH (Y matching: Center, Top, Bottom) ===
        const diffCenterY = Math.abs(mCenterY - c.centerY)
        if (diffCenterY <= SNAP_THRESHOLD && diffCenterY < minDiffY) {
          minDiffY = diffCenterY
          bestSnapY = c.centerY - mHeight / 2
          snapTypeY = "center"
        }

        const diffTopTop = Math.abs(mTop - c.top)
        if (diffTopTop <= SNAP_THRESHOLD && diffTopTop < minDiffY) {
          minDiffY = diffTopTop
          bestSnapY = c.top
          snapTypeY = "top"
        }

        const diffBottomBottom = Math.abs(mBottom - c.bottom)
        if (diffBottomBottom <= SNAP_THRESHOLD && diffBottomBottom < minDiffY) {
          minDiffY = diffBottomBottom
          bestSnapY = c.bottom - mHeight
          snapTypeY = "bottom"
        }

        const diffTopBottom = Math.abs(mTop - c.bottom)
        if (diffTopBottom <= SNAP_THRESHOLD && diffTopBottom < minDiffY) {
          minDiffY = diffTopBottom
          bestSnapY = c.bottom
          snapTypeY = "top-bottom"
        }

        const diffBottomTop = Math.abs(mBottom - c.top)
        if (diffBottomTop <= SNAP_THRESHOLD && diffBottomTop < minDiffY) {
          minDiffY = diffBottomTop
          bestSnapY = c.top - mHeight
          snapTypeY = "bottom-top"
        }
      }

      if (bestSnapX !== null) {
        snappedX = Math.round(bestSnapX)
      }
      if (bestSnapY !== null) {
        snappedY = Math.round(bestSnapY)
      }

      // Collect all guidelines matching the snapped position (can show both top & bottom, corners, etc.)
      const sLeft = snappedX
      const sRight = snappedX + mWidth
      const sCenterX = snappedX + mWidth / 2
      const sTop = snappedY
      const sBottom = snappedY + mHeight
      const sCenterY = snappedY + mHeight / 2

      const EXT = 45 // Extension past the objects (exactly matching reference image)
      const guideMap = new Map<string, CanvasAlignmentGuide>()

      for (const c of candidates) {
        if (Math.abs(c.centerX - sCenterX) > NEARBY_DISTANCE && Math.abs(c.centerY - sCenterY) > NEARBY_DISTANCE) {
          continue
        }

        // Vertical guidelines (thin red dotted lines)
        if (bestSnapX !== null) {
          const startY = Math.min(sTop, c.top) - EXT
          const endY = Math.max(sBottom, c.bottom) + EXT

          const addVerticalGuide = (pos: number, type: "left" | "right" | "center", label: string) => {
            const key = `v-${Math.round(pos)}`
            const existing = guideMap.get(key)
            if (existing) {
              existing.start = Math.min(existing.start, startY)
              existing.end = Math.max(existing.end, endY)
            } else {
              guideMap.set(key, { orientation: "vertical", position: pos, start: startY, end: endY, type, label })
            }
          }

          const isLeftLeft = Math.abs(sLeft - c.left) <= 1.5
          const isRightRight = Math.abs(sRight - c.right) <= 1.5
          const isLeftRight = Math.abs(sLeft - c.right) <= 1.5
          const isRightLeft = Math.abs(sRight - c.left) <= 1.5
          const isCenter = Math.abs(sCenterX - c.centerX) <= 1.5

          if (isLeftLeft) {
            addVerticalGuide(c.left, "left", "Left")
          }
          if (isRightRight) {
            addVerticalGuide(c.right, "right", "Right")
          }
          if (isLeftRight) {
            addVerticalGuide(c.right, "left", "Left")
          }
          if (isRightLeft) {
            addVerticalGuide(c.left, "right", "Right")
          }
          // Show center guide when centered; if both left and right edges already match, center is redundant unless snapped to center
          if (isCenter && (!isLeftLeft || !isRightRight || snapTypeX === "center")) {
            addVerticalGuide(c.centerX, "center", "Center")
          }
        }

        // Horizontal guidelines (thin red dotted lines)
        if (bestSnapY !== null) {
          const startX = Math.min(sLeft, c.left) - EXT
          const endX = Math.max(sRight, c.right) + EXT

          const addHorizontalGuide = (pos: number, type: "top" | "bottom" | "center", label: string) => {
            const key = `h-${Math.round(pos)}`
            const existing = guideMap.get(key)
            if (existing) {
              existing.start = Math.min(existing.start, startX)
              existing.end = Math.max(existing.end, endX)
            } else {
              guideMap.set(key, { orientation: "horizontal", position: pos, start: startX, end: endX, type, label })
            }
          }

          const isTopTop = Math.abs(sTop - c.top) <= 1.5
          const isBottomBottom = Math.abs(sBottom - c.bottom) <= 1.5
          const isTopBottom = Math.abs(sTop - c.bottom) <= 1.5
          const isBottomTop = Math.abs(sBottom - c.top) <= 1.5
          const isCenter = Math.abs(sCenterY - c.centerY) <= 1.5

          if (isTopTop) {
            addHorizontalGuide(c.top, "top", "Top")
          }
          if (isBottomBottom) {
            addHorizontalGuide(c.bottom, "bottom", "Bottom")
          }
          if (isTopBottom) {
            addHorizontalGuide(c.bottom, "top", "Top")
          }
          if (isBottomTop) {
            addHorizontalGuide(c.top, "bottom", "Bottom")
          }
          // Show horizontal center guide when centered; if both top and bottom already match, center is redundant unless snapped to center
          if (isCenter && (!isTopTop || !isBottomBottom || snapTypeY === "center")) {
            addHorizontalGuide(c.centerY, "center", "Center")
          }
        }
      }

      guideMap.forEach((g) => guides.push(g))

      return {
        snappedPos: { x: snappedX, y: snappedY },
        guides,
      }
    },
    [nodes, boundaries, annotations, shapes, collapsedHiddenNodeIds, getObjectBounds, getDOMNodeDimensions]
  )

  // Count child reports/subordinates for each node
  const directChildCountMap = React.useMemo(() => {
    const map = new Map<string, number>()
    nodes.forEach((node) => {
      if (node.parentId) {
        map.set(node.parentId, (map.get(node.parentId) || 0) + 1)
      }
    })
    return map
  }, [nodes])

  // Reset View handler: centers view in the open canvas
  const handleResetView = React.useCallback(() => {
    if (!containerRef.current) return
    setZoom(0.85)
    setPan({ x: 80, y: 80 })
  }, [])

  // Fit to screen calculation across all open elements
  const handleFitToScreen = React.useCallback(() => {
    if (!containerRef.current || (nodes.length === 0 && boundaries.length === 0 && shapes.length === 0)) {
      handleResetView()
      return
    }

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity

    nodes.forEach((n) => {
      if (collapsedHiddenNodeIds.has(n.id)) return
      const dims = getDOMNodeDimensions(n.id, n)
      minX = Math.min(minX, n.position.x)
      minY = Math.min(minY, n.position.y)
      maxX = Math.max(maxX, n.position.x + dims.width)
      maxY = Math.max(maxY, n.position.y + dims.height)
    })

    boundaries.forEach((b) => {
      minX = Math.min(minX, b.position.x)
      minY = Math.min(minY, b.position.y)
      maxX = Math.max(maxX, b.position.x + b.width)
      maxY = Math.max(maxY, b.position.y + b.height)
    })

    shapes.forEach((s) => {
      minX = Math.min(minX, s.x)
      minY = Math.min(minY, s.y)
      maxX = Math.max(maxX, s.x + s.width)
      maxY = Math.max(maxY, s.y + s.height)
    })

    if (minX === Infinity) {
      handleResetView()
      return
    }

    const boundsW = Math.max(maxX - minX + 160, 600)
    const boundsH = Math.max(maxY - minY + 160, 400)

    const cWidth = containerRef.current.clientWidth || 1000
    const cHeight = containerRef.current.clientHeight || 700

    const scaleX = cWidth / boundsW
    const scaleY = cHeight / boundsH
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY) * 0.9, 0.25), 1.5)

    const panX = (cWidth - (maxX - minX) * newZoom) / 2 - minX * newZoom
    const panY = (cHeight - (maxY - minY) * newZoom) / 2 - minY * newZoom

    setZoom(newZoom)
    setPan({ x: panX, y: panY })
  }, [nodes, boundaries, shapes, collapsedHiddenNodeIds, handleResetView])

  // Auto-center sheet on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleResetView()
    }, 60)
    return () => clearTimeout(timer)
  }, [handleResetView])

  // Handle external toolbar view actions (Fit to Screen, Reset View)
  React.useEffect(() => {
    if (viewAction === "fit") {
      handleFitToScreen()
      onViewActionHandled?.()
    } else if (viewAction === "reset") {
      handleResetView()
      onViewActionHandled?.()
    }
  }, [viewAction, handleFitToScreen, handleResetView, onViewActionHandled])

  // Zoom-at-cursor implementation
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const zoomFactor = e.deltaY < 0 ? 1.09 : 0.91
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.1), 5.0)

    // Anchor point calculation
    const scaleRatio = newZoom / zoom
    const newPanX = mouseX - (mouseX - pan.x) * scaleRatio
    const newPanY = mouseY - (mouseY - pan.y) * scaleRatio

    setZoom(newZoom)
    setPan({ x: newPanX, y: newPanY })
  }

  // Mouse Down handler (handles canvas background click, middle-button panning, and tool drawing)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // 1. Scrolling button (middle click, e.button === 1) or Hand Tool = Canvas Pan
    if (e.button === 1 || activeTool === "hand") {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      return
    }

    // 2. Hold and drag right key (e.button === 2) -> Marquee Selection Box
    if (e.button === 2) {
      e.preventDefault()
      const coords = screenToCanvasCoords(e.clientX, e.clientY)
      setSelectionMarquee({
        startX: coords.x,
        startY: coords.y,
        currentX: coords.x,
        currentY: coords.y,
      })
      return
    }

    // 2b. Left key when rectangle tool is active
    if (e.button === 0 && activeTool === "rectangle") {
      e.preventDefault()
      const coords = screenToCanvasCoords(e.clientX, e.clientY)
      setDrawingDraft({
        mode: "rect",
        startX: coords.x,
        startY: coords.y,
        currentX: coords.x,
        currentY: coords.y,
      })
      return
    }

    // 3. Shapes tool: Click or Drag on canvas to draw active shape!
    if (e.button === 0 && activeTool === "shapes") {
      e.preventDefault()
      const coords = screenToCanvasCoords(e.clientX, e.clientY)
      setDrawingDraft({
        mode: "shape",
        kind: activeShapeKind || "process",
        startX: coords.x,
        startY: coords.y,
        currentX: coords.x,
        currentY: coords.y,
      })
      return
    }

    // 4. Text tool: Click to place text annotation at coordinates
    if (e.button === 0 && activeTool === "text") {
      e.preventDefault()
      const coords = screenToCanvasCoords(e.clientX, e.clientY)
      onAddAnnotationAt(coords)
      return
    }

    // 5. Left click in Select mode or on empty canvas
    if (e.button === 0) {
      const target = e.target as HTMLElement
      const isInteractiveElement = !!target.closest(
        "[data-node-id], [data-shape-id], [data-annotation-id], [data-boundary-id], button, input, textarea, select, a"
      )

      if (!isInteractiveElement) {
        if (activeTool === "connector") {
          setConnectorSourceId(null)
          setActiveConnect(null)
          return
        }

        // Clicked empty background: clear selection and allow marquee selection drag
        onSelectElement(null, null)
        setMultiSelectedIds(new Set())
        const coords = screenToCanvasCoords(e.clientX, e.clientY)
        setSelectionMarquee({
          startX: coords.x,
          startY: coords.y,
          currentX: coords.x,
          currentY: coords.y,
        })
      }
    }
  }

  // Double click handler on canvas surface
  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const isInteractiveElement = !!target.closest(
      "[data-node-id], [data-shape-id], [data-annotation-id], [data-boundary-id], button, input, textarea, select, a"
    )
    if (!isInteractiveElement && activeTool === "select") {
      const coords = screenToCanvasCoords(e.clientX, e.clientY)
      onAddAnnotationAt(coords)
    }
  }

  // Global Mouse Move handler on canvas
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Live Marquee Selection Preview
    if (selectionMarquee) {
      const coords = screenToCanvasCoords(e.clientX, e.clientY)
      setSelectionMarquee((prev) =>
        prev
          ? {
              ...prev,
              currentX: coords.x,
              currentY: coords.y,
            }
          : null
      )
      return
    }

    // Live shape or rectangle drawing preview
    if (drawingDraft) {
      const coords = screenToCanvasCoords(e.clientX, e.clientY)
      setDrawingDraft((prev) =>
        prev
          ? {
              ...prev,
              currentX: coords.x,
              currentY: coords.y,
            }
          : null
      )
      return
    }

    // Panning canvas
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
      return
    }

    // 4-Sided scaling of boundary rectangle
    if (resizingBoundary) {
      const dx = (e.clientX - resizingBoundary.startX) / zoom
      const dy = (e.clientY - resizingBoundary.startY) / zoom
      let newX = resizingBoundary.origX
      let newY = resizingBoundary.origY
      let newW = resizingBoundary.origWidth
      let newH = resizingBoundary.origHeight

      if (resizingBoundary.direction.includes("e")) {
        newW = Math.max(40, Math.round(resizingBoundary.origWidth + dx))
      }
      if (resizingBoundary.direction.includes("w")) {
        const w = Math.max(40, Math.round(resizingBoundary.origWidth - dx))
        newX = Math.round(resizingBoundary.origX + (resizingBoundary.origWidth - w))
        newW = w
      }
      if (resizingBoundary.direction.includes("s")) {
        newH = Math.max(30, Math.round(resizingBoundary.origHeight + dy))
      }
      if (resizingBoundary.direction.includes("n")) {
        const h = Math.max(30, Math.round(resizingBoundary.origHeight - dy))
        newY = Math.round(resizingBoundary.origY + (resizingBoundary.origHeight - h))
        newH = h
      }

      if (onUpdateBoundary) {
        onUpdateBoundary(resizingBoundary.id, {
          position: { x: newX, y: newY },
          width: newW,
          height: newH,
        })
      } else {
        onUpdateBoundaryPosition(resizingBoundary.id, { x: newX, y: newY })
      }
      return
    }

    // Drag-to-connect preview or click-to-connect active tracking
    if (activeConnect) {
      const coords = screenToCanvasCoords(e.clientX, e.clientY)
      setActiveConnect((prev) =>
        prev
          ? {
              ...prev,
              currentX: coords.x,
              currentY: coords.y,
            }
          : null
      )
      return
    }

    // Dragging an element (Node, Boundary, Annotation)
    if (draggingObj) {
      const dx = (e.clientX - draggingObj.startX) / zoom
      const dy = (e.clientY - draggingObj.startY) / zoom

      let newPos = {
        x: Math.round(draggingObj.origX + dx),
        y: Math.round(draggingObj.origY + dy),
      }

      if (showAlignmentGuides) {
        const { snappedPos, guides } = calculateAlignmentGuides(
          draggingObj.type,
          draggingObj.id,
          newPos,
          draggingObj.multiOrigPos ? new Set(draggingObj.multiOrigPos.keys()) : undefined
        )
        newPos = snappedPos
        setActiveGuides(guides)
      } else {
        if (activeGuides.length > 0) setActiveGuides([])
      }

      if (draggingObj.type === "node") {
        onUpdateNodePosition(draggingObj.id, newPos)
        // If moving a node that is part of multi-selection, translate others too!
        if (draggingObj.multiOrigPos && draggingObj.multiOrigPos.size > 0) {
          const deltaX = newPos.x - draggingObj.origX
          const deltaY = newPos.y - draggingObj.origY
          draggingObj.multiOrigPos.forEach((orig, otherId) => {
            onUpdateNodePosition(otherId, {
              x: Math.round(orig.x + deltaX),
              y: Math.round(orig.y + deltaY),
            })
          })
        }
      } else if (draggingObj.type === "boundary") {
        onUpdateBoundaryPosition(draggingObj.id, newPos)
      } else if (draggingObj.type === "annotation") {
        onUpdateAnnotationPosition(draggingObj.id, newPos)
      }
    }
  }

  // Mouse Up handler
  const handleCanvasMouseUp = React.useCallback(() => {
    // 1. Resolve Marquee Selection
    if (selectionMarquee) {
      const minX = Math.min(selectionMarquee.startX, selectionMarquee.currentX)
      const maxX = Math.max(selectionMarquee.startX, selectionMarquee.currentX)
      const minY = Math.min(selectionMarquee.startY, selectionMarquee.currentY)
      const maxY = Math.max(selectionMarquee.startY, selectionMarquee.currentY)
      const width = maxX - minX
      const height = maxY - minY

      if (width > 8 && height > 8) {
        const enclosedNodeIds: string[] = []
        nodes.forEach((n) => {
          if (collapsedHiddenNodeIds.has(n.id)) return
          const dims = getDOMNodeDimensions(n.id, n)
          const nw = dims.width
          const nh = dims.height
          const nx1 = n.position.x
          const ny1 = n.position.y
          const nx2 = nx1 + nw
          const ny2 = ny1 + nh
          // Check box intersection
          if (nx1 < maxX && nx2 > minX && ny1 < maxY && ny2 > minY) {
            enclosedNodeIds.push(n.id)
          }
        })

        const enclosedShapeIds: string[] = []
        shapes.forEach((s) => {
          const sx2 = s.x + s.width
          const sy2 = s.y + s.height
          if (s.x < maxX && sx2 > minX && s.y < maxY && sy2 > minY) {
            enclosedShapeIds.push(s.id)
          }
        })

        const enclosedBoundaryIds: string[] = []
        boundaries.forEach((b) => {
          const bx2 = b.position.x + b.width
          const by2 = b.position.y + b.height
          if (b.position.x < maxX && bx2 > minX && b.position.y < maxY && by2 > minY) {
            enclosedBoundaryIds.push(b.id)
          }
        })

        const enclosedAnnIds: string[] = []
        annotations.forEach((a) => {
          const aw = a.width || 200
          const ah = a.height || 50
          const ax2 = a.position.x + aw
          const ay2 = a.position.y + ah
          if (a.position.x < maxX && ax2 > minX && a.position.y < maxY && ay2 > minY) {
            enclosedAnnIds.push(a.id)
          }
        })

        const allSelected = new Set([
          ...enclosedNodeIds,
          ...enclosedShapeIds,
          ...enclosedBoundaryIds,
          ...enclosedAnnIds,
        ])
        setMultiSelectedIds(allSelected)

        if (enclosedNodeIds.length > 0) {
          onSelectElement("node", enclosedNodeIds[0])
        } else if (enclosedShapeIds.length > 0) {
          onSelectElement("shape", enclosedShapeIds[0])
        } else if (enclosedBoundaryIds.length > 0) {
          onSelectElement("boundary", enclosedBoundaryIds[0])
        } else if (enclosedAnnIds.length > 0) {
          onSelectElement("annotation", enclosedAnnIds[0])
        } else {
          onSelectElement(null, null)
        }
      } else {
        setMultiSelectedIds(new Set())
      }

      setSelectionMarquee(null)
      return
    }

    if (drawingDraft) {
      const minX = Math.round(Math.min(drawingDraft.startX, drawingDraft.currentX))
      const minY = Math.round(Math.min(drawingDraft.startY, drawingDraft.currentY))
      const rawW = Math.round(Math.abs(drawingDraft.currentX - drawingDraft.startX))
      const rawH = Math.round(Math.abs(drawingDraft.currentY - drawingDraft.startY))

      if (drawingDraft.mode === "shape") {
        const shapeKind = drawingDraft.kind || activeShapeKind || "process"
        const def = getShapeDefinition(shapeKind)
        const finalW = rawW >= 15 ? rawW : (def.defaultWidth || 140)
        const finalH = rawH >= 15 ? rawH : (def.defaultHeight || 80)
        if (onAddShapeWithBounds) {
          onAddShapeWithBounds(shapeKind, {
            x: minX,
            y: minY,
            width: finalW,
            height: finalH,
          })
        } else if (onAddShapeAt) {
          onAddShapeAt(shapeKind, { x: minX, y: minY })
        }
      } else if (drawingDraft.mode === "rect") {
        const finalW = rawW >= 15 ? rawW : 480
        const finalH = rawH >= 15 ? rawH : 280
        onAddBoundaryAt({ x: minX, y: minY }, { width: finalW, height: finalH })
      }
      setDrawingDraft(null)
      return
    }

    setIsPanning(false)
    setDraggingObj(null)
    setActiveGuides([])
    setResizingBoundary(null)
    if (!connectorSourceId) {
      setActiveConnect(null)
    }
  }, [
    selectionMarquee,
    nodes,
    shapes,
    boundaries,
    annotations,
    collapsedHiddenNodeIds,
    onSelectElement,
    drawingDraft,
    activeShapeKind,
    onAddShapeWithBounds,
    onAddShapeAt,
    onAddBoundaryAt,
    connectorSourceId,
  ])

  // Window-level pointer safety listener: ensure smooth dragging & no lost mouseup
  React.useEffect(() => {
    if (!drawingDraft && !isPanning && !resizingBoundary && !draggingObj && !selectionMarquee) return

    const handleWindowMove = (e: MouseEvent) => {
      if (selectionMarquee) {
        const coords = screenToCanvasCoords(e.clientX, e.clientY)
        setSelectionMarquee((prev) => (prev ? { ...prev, currentX: coords.x, currentY: coords.y } : null))
      }
      if (drawingDraft) {
        const coords = screenToCanvasCoords(e.clientX, e.clientY)
        setDrawingDraft((prev) => (prev ? { ...prev, currentX: coords.x, currentY: coords.y } : null))
      }
      if (draggingObj) {
        const dx = (e.clientX - draggingObj.startX) / zoom
        const dy = (e.clientY - draggingObj.startY) / zoom

        let newPos = {
          x: Math.round(draggingObj.origX + dx),
          y: Math.round(draggingObj.origY + dy),
        }

        if (showAlignmentGuides) {
          const { snappedPos, guides } = calculateAlignmentGuides(
            draggingObj.type,
            draggingObj.id,
            newPos,
            draggingObj.multiOrigPos ? new Set(draggingObj.multiOrigPos.keys()) : undefined
          )
          newPos = snappedPos
          setActiveGuides(guides)
        } else {
          if (activeGuides.length > 0) setActiveGuides([])
        }

        if (draggingObj.type === "node") {
          onUpdateNodePosition(draggingObj.id, newPos)
          if (draggingObj.multiOrigPos && draggingObj.multiOrigPos.size > 0) {
            const deltaX = newPos.x - draggingObj.origX
            const deltaY = newPos.y - draggingObj.origY
            draggingObj.multiOrigPos.forEach((orig, otherId) => {
              onUpdateNodePosition(otherId, {
                x: Math.round(orig.x + deltaX),
                y: Math.round(orig.y + deltaY),
              })
            })
          }
        } else if (draggingObj.type === "boundary") {
          onUpdateBoundaryPosition(draggingObj.id, newPos)
        } else if (draggingObj.type === "annotation") {
          onUpdateAnnotationPosition(draggingObj.id, newPos)
        }
      }
      if (resizingBoundary) {
        const dx = (e.clientX - resizingBoundary.startX) / zoom
        const dy = (e.clientY - resizingBoundary.startY) / zoom
        let newX = resizingBoundary.origX
        let newY = resizingBoundary.origY
        let newW = resizingBoundary.origWidth
        let newH = resizingBoundary.origHeight

        if (resizingBoundary.direction.includes("e")) {
          newW = Math.max(40, Math.round(resizingBoundary.origWidth + dx))
        }
        if (resizingBoundary.direction.includes("w")) {
          const w = Math.max(40, Math.round(resizingBoundary.origWidth - dx))
          newX = Math.round(resizingBoundary.origX + (resizingBoundary.origWidth - w))
          newW = w
        }
        if (resizingBoundary.direction.includes("s")) {
          newH = Math.max(30, Math.round(resizingBoundary.origHeight + dy))
        }
        if (resizingBoundary.direction.includes("n")) {
          const h = Math.max(30, Math.round(resizingBoundary.origHeight - dy))
          newY = Math.round(resizingBoundary.origY + (resizingBoundary.origHeight - h))
          newH = h
        }

        if (onUpdateBoundary) {
          onUpdateBoundary(resizingBoundary.id, {
            position: { x: newX, y: newY },
            width: newW,
            height: newH,
          })
        } else {
          onUpdateBoundaryPosition(resizingBoundary.id, { x: newX, y: newY })
        }
      }
    }

    const handleWindowUp = () => {
      handleCanvasMouseUp()
    }

    window.addEventListener("mousemove", handleWindowMove)
    window.addEventListener("mouseup", handleWindowUp)
    return () => {
      window.removeEventListener("mousemove", handleWindowMove)
      window.removeEventListener("mouseup", handleWindowUp)
    }
  }, [
    drawingDraft,
    isPanning,
    resizingBoundary,
    draggingObj,
    selectionMarquee,
    screenToCanvasCoords,
    handleCanvasMouseUp,
    zoom,
    onUpdateBoundary,
    onUpdateBoundaryPosition,
    showAlignmentGuides,
    calculateAlignmentGuides,
    onUpdateNodePosition,
    onUpdateAnnotationPosition,
  ])

  // Node or Shape Click handler for Arrow Tool (Source -> Destination)
  const handleNodeClick = (elementId: string) => {
    if (activeTool === "connector") {
      if (!connectorSourceId) {
        // Step 1: Select source element
        setConnectorSourceId(elementId)
        const node = nodes.find((n) => n.id === elementId)
        const shape = shapes.find((s) => s.id === elementId)
        if (node) {
          const dims = getDOMNodeDimensions(node.id, node)
          setActiveConnect({
            sourceId: elementId,
            sourceAnchor: "bottom",
            currentX: node.position.x + dims.width / 2,
            currentY: node.position.y + dims.height,
          })
        } else if (shape) {
          setActiveConnect({
            sourceId: elementId,
            sourceAnchor: "bottom",
            currentX: shape.x + (shape.width || 120) / 2,
            currentY: shape.y + (shape.height || 80),
          })
        }
      } else if (connectorSourceId !== elementId) {
        // Step 2: Establish connection to destination element (Node or Shape)
        onConnectNodes(connectorSourceId, elementId, "bottom", "top")
        setConnectorSourceId(null)
        setActiveConnect(null)
      } else {
        // Deselect if clicked same element
        setConnectorSourceId(null)
        setActiveConnect(null)
      }
      return
    }
    const isShape = shapes.some((s) => s.id === elementId)
    onSelectElement(isShape ? "shape" : "node", elementId)
  }

  // Start drag-to-connect from a node anchor point
  const handleStartConnect = (
    e: React.MouseEvent,
    nodeId: string,
    anchor: "top" | "bottom" | "left" | "right"
  ) => {
    const coords = screenToCanvasCoords(e.clientX, e.clientY)
    setActiveConnect({
      sourceId: nodeId,
      sourceAnchor: anchor,
      currentX: coords.x,
      currentY: coords.y,
    })
  }

  // Drop connection target handler on a node
  const handleDropConnectOnNode = (targetNodeId: string) => {
    if (activeConnect && activeConnect.sourceId !== targetNodeId) {
      onConnectNodes(
        activeConnect.sourceId,
        targetNodeId,
        activeConnect.sourceAnchor,
        "top"
      )
      setConnectorSourceId(null)
      setActiveConnect(null)
    }
  }

  // Lowest element Y coordinate to position the footer cleanly
  const lowestY = React.useMemo(() => {
    if (nodes.length === 0) return 600
    let maxY = 0
    nodes.forEach((n) => {
      if (!collapsedHiddenNodeIds.has(n.id)) {
        maxY = Math.max(maxY, n.position.y + (n.height || 60))
      }
    })
    return maxY + 100
  }, [nodes, collapsedHiddenNodeIds])

  // Visible connections (exclude lines connected to hidden collapsed nodes)
  const visibleConnections = React.useMemo(() => {
    return connections.filter(
      (c) => !collapsedHiddenNodeIds.has(c.source) && !collapsedHiddenNodeIds.has(c.target)
    )
  }, [connections, collapsedHiddenNodeIds])

  return (
    <div
      ref={containerRef}
      id="canvas-bg"
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onDoubleClick={handleCanvasDoubleClick}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      onAuxClick={(e) => {
        if (e.button === 1) e.preventDefault()
      }}
      className={`relative w-full h-full overflow-hidden select-none ${
        activeTool === "hand" || isPanning
          ? "cursor-grab active:cursor-grabbing"
          : activeTool === "text"
          ? "cursor-text"
          : activeTool === "rectangle" || activeTool === "connector" || activeTool === "shapes"
          ? "cursor-crosshair"
          : "cursor-default"
      }`}
      style={{
        backgroundColor: "#f4f5f8",
        backgroundImage: `radial-gradient(circle, rgba(15, 23, 42, 0.06) 1.2px, transparent 1.2px)`,
        backgroundSize: `${12 * zoom}px ${12 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Active Draw Mode Banner / HUD */}
      {activeTool !== "select" && activeTool !== "hand" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-full border border-blue-500/40 bg-card/95 backdrop-blur-md shadow-xl text-xs font-semibold text-foreground animate-in fade-in slide-in-from-top-2 select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span>
            {activeTool === "shapes" && `✏️ Drawing Shape: ${getShapeDefinition(activeShapeKind).label}`}
            {activeTool === "rectangle" && "📐 Drawing Grouping Rectangle"}
            {activeTool === "text" && "🔤 Click canvas to place Text"}
            {activeTool === "connector" && "🔗 Select source & target nodes to connect"}
          </span>
          <span className="text-[11px] text-muted-foreground font-normal">
            (Click or drag on canvas)
          </span>
          {onCancelTool && (
            <button
              type="button"
              onClick={onCancelTool}
              className="ml-1 px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80 text-[11px] font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-colors flex items-center gap-1"
              title="Cancel drawing mode (Esc)"
            >
              <X className="h-3 w-3" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      )}

      {/* Floating Canvas View Controls (Top-Right: 30% smaller, frosted glass blur) */}
      <div
        className="absolute top-3 right-3 z-30 flex items-center gap-1 rounded-lg border border-border/40 bg-background/25 dark:bg-background/30 backdrop-blur-[12px] px-2 py-1 shadow-xs select-none transition-all hover:bg-background/50 hover:border-border/60 hover:shadow-md scale-[0.72] origin-top-right"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-foreground/70 hover:text-foreground hover:bg-foreground/10 cursor-pointer"
          onClick={() => setZoom((z) => Math.max(0.1, Math.round((z - 0.1) * 10) / 10))}
          title="Zoom Out (-)"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>

        <span className="min-w-[40px] text-center font-mono text-xs font-bold text-foreground/90">
          {Math.round(zoom * 100)}%
        </span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-foreground/70 hover:text-foreground hover:bg-foreground/10 cursor-pointer"
          onClick={() => setZoom((z) => Math.min(5.0, Math.round((z + 0.1) * 10) / 10))}
          title="Zoom In (+)"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>

        <div className="h-3.5 w-px bg-border/40 mx-0.5" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-xs font-semibold text-foreground/75 hover:text-foreground hover:bg-foreground/10 cursor-pointer gap-1"
          onClick={handleFitToScreen}
          title="Fit Chart to Viewport"
        >
          <Maximize2 className="h-3 w-3 text-primary" />
          <span>Fit</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-xs font-semibold text-foreground/75 hover:text-foreground hover:bg-foreground/10 cursor-pointer gap-1"
          onClick={handleResetView}
          title="Reset View"
        >
          <Compass className="h-3 w-3 text-emerald-600" />
          <span>Reset</span>
        </Button>
      </div>

      {/* Main Scaled & Panned Viewport */}
      <div
        id="org-chart-canvas-content"
        className="absolute transform-gpu origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: "3600px",
          height: "2800px",
        }}
      >
        {/* Open Canvas Elements Layer */}
            {/* Layer 0: Live Shape & Rectangle Creation Preview */}
            {drawingDraft && (() => {
              const rx = Math.min(drawingDraft.startX, drawingDraft.currentX)
              const ry = Math.min(drawingDraft.startY, drawingDraft.currentY)
              const rw = Math.max(12, Math.abs(drawingDraft.currentX - drawingDraft.startX))
              const rh = Math.max(12, Math.abs(drawingDraft.currentY - drawingDraft.startY))

              if (drawingDraft.mode === "shape") {
                const shapeKind = drawingDraft.kind || activeShapeKind || "process"
                const def = getShapeDefinition(shapeKind)
                return (
                  <div
                    className="absolute pointer-events-none z-50 select-none transition-none"
                    style={{
                      left: `${rx}px`,
                      top: `${ry}px`,
                      width: `${rw}px`,
                      height: `${rh}px`,
                    }}
                  >
                    <svg
                      className="w-full h-full overflow-visible"
                      viewBox={`0 0 ${rw} ${rh}`}
                    >
                      <ShapeGeometry
                        shape={{
                          id: "drawing-shape-preview",
                          kind: shapeKind,
                          x: rx,
                          y: ry,
                          width: rw,
                          height: rh,
                          fill: "rgba(37, 99, 235, 0.12)",
                          stroke: "#2563EB",
                          strokeWidth: 2,
                          strokeStyle: "dashed",
                          rotation: 0,
                        } as any}
                        kind={shapeKind}
                        width={rw}
                        height={rh}
                        fill="rgba(37, 99, 235, 0.12)"
                        stroke="#2563EB"
                        strokeWidth={2}
                        strokeStyle="dashed"
                        preview
                      />
                    </svg>
                    <div className="absolute -top-7 left-0 flex items-center gap-1.5 bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider whitespace-nowrap">
                      <span>{def.label}</span>
                      <span className="opacity-90 font-mono text-[9px]">
                        {Math.round(rw)} × {Math.round(rh)}
                      </span>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  className="absolute pointer-events-none rounded-2xl z-50 transition-none"
                  style={{
                    left: `${rx}px`,
                    top: `${ry}px`,
                    width: `${rw}px`,
                    height: `${rh}px`,
                    border: "2px dashed #2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.08)",
                    boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.35)",
                  }}
                >
                  <div className="absolute top-2.5 left-3.5 flex items-center gap-1.5 bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                    <span>NEW RECTANGLE</span>
                    <span className="opacity-80 font-mono text-[9px]">
                      {Math.round(rw)} × {Math.round(rh)}
                    </span>
                  </div>
                </div>
              )
            })()}

        {/* Marquee Selection Box Layer (Right Key Drag) */}
        {selectionMarquee && (
          <div
            style={{
              position: "absolute",
              left: Math.min(selectionMarquee.startX, selectionMarquee.currentX),
              top: Math.min(selectionMarquee.startY, selectionMarquee.currentY),
              width: Math.abs(selectionMarquee.currentX - selectionMarquee.startX),
              height: Math.abs(selectionMarquee.currentY - selectionMarquee.startY),
              border: "1.5px dashed #0088ff",
              backgroundColor: "rgba(0, 136, 255, 0.07)",
              pointerEvents: "none",
              zIndex: 9999,
              borderRadius: "2px",
            }}
          />
        )}

        {/* Layer 1: Grouping Rectangles (Background) */}
        {boundaries.map((boundary) => (
          <div
            key={boundary.id}
            onMouseDown={(e) => {
              if (e.button === 1) {
                e.preventDefault()
                setIsPanning(true)
                setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
                return
              }
              if (e.button === 2) {
                e.preventDefault()
                const coords = screenToCanvasCoords(e.clientX, e.clientY)
                setSelectionMarquee({
                  startX: coords.x,
                  startY: coords.y,
                  currentX: coords.x,
                  currentY: coords.y,
                })
                return
              }
              if (activeTool === "select" && e.button === 0) {
                e.stopPropagation()
                refreshNodeDimensions()
                onSelectElement("boundary", boundary.id)
                setDraggingObj({
                  type: "boundary",
                  id: boundary.id,
                  startX: e.clientX,
                  startY: e.clientY,
                  origX: boundary.position.x,
                  origY: boundary.position.y,
                })
              }
            }}
          >
            <CanvasGroupRectangle
              boundary={boundary}
              isSelected={
                (selectedElement.type === "boundary" && selectedElement.id === boundary.id) ||
                multiSelectedIds.has(boundary.id)
              }
              onSelect={() => onSelectElement("boundary", boundary.id)}
              onResizeStart={(e, direction) => {
                e.stopPropagation()
                onSelectElement("boundary", boundary.id)
                setResizingBoundary({
                  id: boundary.id,
                  direction,
                  startX: e.clientX,
                  startY: e.clientY,
                  origX: boundary.position.x,
                  origY: boundary.position.y,
                  origWidth: boundary.width,
                  origHeight: boundary.height,
                })
              }}
            />
          </div>
        ))}

        {/* Layer 2: Connectors SVG Layer */}
        <CanvasConnectorsV2
          connections={visibleConnections}
          nodes={nodes}
          shapes={shapes}
          selectedConnectionId={
            selectedElement.type === "connection" ? selectedElement.id : null
          }
          activeDrag={activeConnect}
          onSelectConnection={(id) => onSelectElement("connection", id)}
        />

        {/* Layer 3: Freehand Text Annotations */}
        {annotations.map((ann) => (
          <div
            key={ann.id}
            id={`canvas-annotation-${ann.id}`}
            data-annotation-id={ann.id}
            onMouseDown={(e) => {
              if (e.button === 1) {
                e.preventDefault()
                setIsPanning(true)
                setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
                return
              }
              if (e.button === 2) {
                e.preventDefault()
                const coords = screenToCanvasCoords(e.clientX, e.clientY)
                setSelectionMarquee({
                  startX: coords.x,
                  startY: coords.y,
                  currentX: coords.x,
                  currentY: coords.y,
                })
                return
              }
              if (activeTool === "select" && e.button === 0) {
                e.stopPropagation()
                refreshNodeDimensions()
                onSelectElement("annotation", ann.id)
                setDraggingObj({
                  type: "annotation",
                  id: ann.id,
                  startX: e.clientX,
                  startY: e.clientY,
                  origX: ann.position.x,
                  origY: ann.position.y,
                })
              }
            }}
          >
            <CanvasTextAnnotation
              annotation={ann}
              isSelected={
                (selectedElement.type === "annotation" && selectedElement.id === ann.id) ||
                multiSelectedIds.has(ann.id)
              }
              onSelect={() => onSelectElement("annotation", ann.id)}
              onUpdate={(updates) => onUpdateAnnotation(ann.id, updates)}
            />
          </div>
        ))}

        {/* Layer 3.5: Shapes (Vector Flowcharts, Connectors & Symbols) */}
        <svg className="absolute inset-0 pointer-events-none w-0 h-0 overflow-visible">
          <ShapeDefs />
        </svg>
        {shapes.map((shp) => (
          <CanvasShapeItem
            key={shp.id}
            shape={shp}
            zoom={zoom}
            isSelected={
              (selectedElement.type === "shape" && selectedElement.id === shp.id) ||
              multiSelectedIds.has(shp.id) ||
              connectorSourceId === shp.id
            }
            isInteractive={activeTool === "select" || activeTool === "connector"}
            isConnecting={activeTool === "connector" || !!activeConnect}
            onSelect={(e) => {
              e.stopPropagation()
              refreshNodeDimensions()
              if (activeTool === "connector") {
                handleNodeClick(shp.id)
              } else {
                onSelectElement("shape", shp.id)
              }
            }}
            onStartConnect={handleStartConnect}
            onDropConnect={handleDropConnectOnNode}
            onUpdatePosition={(id, pos) => {
              if (showAlignmentGuides) {
                const { snappedPos, guides } = calculateAlignmentGuides("shape", id, pos)
                setActiveGuides(guides)
                onUpdateShapePosition?.(id, snappedPos)
              } else {
                onUpdateShapePosition?.(id, pos)
              }
            }}
            onDragEnd={() => setActiveGuides([])}
            onUpdateSize={(id, size) => onUpdateShapeSize?.(id, size)}
            onUpdateText={(id, text) => onUpdateShapeText?.(id, text)}
          />
        ))}

        {/* Layer 4: Hierarchy Nodes */}
        {nodes.map((node) => {
          if (collapsedHiddenNodeIds.has(node.id)) return null

          const isSelected =
            (selectedElement.type === "node" && selectedElement.id === node.id) ||
            multiSelectedIds.has(node.id) ||
            connectorSourceId === node.id
          const childCount = directChildCountMap.get(node.id) || 0

          let NodeComponent: React.ReactNode = null
          if (node.type === "ORGANIZATION") {
            NodeComponent = (
              <OrganizationTileV2
                node={node}
                isSelected={isSelected}
                onClick={() => handleNodeClick(node.id)}
                onStartConnect={handleStartConnect}
              />
            )
          } else if (node.type === "EXECUTIVE" || node.type === "MANAGEMENT") {
            NodeComponent = (
              <ExecutiveTileV2
                node={node}
                isSelected={isSelected}
                onClick={() => handleNodeClick(node.id)}
                onStartConnect={handleStartConnect}
              />
            )
          } else if (node.type === "DEPARTMENT") {
            NodeComponent = (
              <DepartmentTileV2
                node={node}
                childCount={childCount}
                isCollapsed={node.collapsed || false}
                isSelected={isSelected}
                onClick={() => handleNodeClick(node.id)}
                onToggleCollapse={() => onToggleNodeCollapse(node.id)}
                onStartConnect={handleStartConnect}
              />
            )
          } else if (node.type === "REQUIRED_POSITION") {
            NodeComponent = (
              <RequiredTileV2
                node={node}
                isSelected={isSelected}
                onClick={() => handleNodeClick(node.id)}
                onStartConnect={handleStartConnect}
              />
            )
          } else {
            // Employee or Consultant
            NodeComponent = (
              <PersonTileV2
                node={node}
                childCount={childCount}
                isCollapsed={node.collapsed || false}
                isSelected={isSelected}
                onClick={() => handleNodeClick(node.id)}
                onToggleCollapse={() => onToggleNodeCollapse(node.id)}
                onStartConnect={handleStartConnect}
              />
            )
          }

          return (
            <div
              key={node.id}
              id={`canvas-node-${node.id}`}
              data-node-id={node.id}
              onMouseUp={() => handleDropConnectOnNode(node.id)}
              onClick={(e) => {
                e.stopPropagation()
                handleNodeClick(node.id)
              }}
              onMouseDown={(e) => {
                // 1. Scrolling button = Pan
                if (e.button === 1) {
                  e.preventDefault()
                  setIsPanning(true)
                  setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
                  return
                }
                // 2. Right mouse button = Marquee Selection Box
                if (e.button === 2) {
                  e.preventDefault()
                  const coords = screenToCanvasCoords(e.clientX, e.clientY)
                  setSelectionMarquee({
                    startX: coords.x,
                    startY: coords.y,
                    currentX: coords.x,
                    currentY: coords.y,
                  })
                  return
                }
                if (activeTool === "select" && e.button === 0) {
                  e.stopPropagation()
                  refreshNodeDimensions()
                  onSelectElement("node", node.id)
                  // Multi-selection drag support
                  const multiOrigPos = new Map<string, { x: number; y: number }>()
                  if (multiSelectedIds.has(node.id)) {
                    nodes.forEach((n) => {
                      if (multiSelectedIds.has(n.id) && n.id !== node.id) {
                        multiOrigPos.set(n.id, { x: n.position.x, y: n.position.y })
                      }
                    })
                  }
                  setDraggingObj({
                    type: "node",
                    id: node.id,
                    startX: e.clientX,
                    startY: e.clientY,
                    origX: node.position.x,
                    origY: node.position.y,
                    multiOrigPos,
                  })
                }
              }}
              className={`absolute pointer-events-auto transition-transform ${
                activeTool === "connector"
                  ? connectorSourceId === node.id
                    ? "ring-2 ring-blue-500 scale-105 shadow-lg rounded-xl cursor-crosshair"
                    : "hover:ring-2 hover:ring-blue-400 hover:scale-102 rounded-xl cursor-crosshair"
                  : ""
              }`}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                zIndex: isSelected ? 35 : 15,
              }}
            >
              {NodeComponent}
            </div>
          )
        })}

        {/* Layer 5: Alignment Guidelines (Dotted red thin line with 50% opacity) */}
        {showAlignmentGuides && activeGuides.length > 0 && (
          <svg className="absolute inset-0 pointer-events-none z-50 overflow-visible w-full h-full">
            {activeGuides.map((guide, idx) => (
              <line
                key={`canvas-guide-${idx}`}
                x1={guide.orientation === "vertical" ? guide.position : guide.start}
                y1={guide.orientation === "vertical" ? guide.start : guide.position}
                x2={guide.orientation === "vertical" ? guide.position : guide.end}
                y2={guide.orientation === "vertical" ? guide.end : guide.position}
                stroke="#dc2626"
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.5}
              />
            ))}
          </svg>
        )}

      </div>

      {/* Morphing Bottom Matrix Tile (Icon-only collapsed -> Smooth full-width bottom dock) */}
      {footer && (
        <div
          className={cn(
            "absolute z-40 transition-all duration-300 ease-out select-none",
            isMatrixOpen
              ? "bottom-0 left-0 right-0 w-full h-[290px] max-h-[42vh] rounded-t-2xl border-t border-border/80 bg-card/98 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
              : "bottom-4 left-4 w-11 h-11 rounded-xl border border-border/80 bg-card/95 hover:bg-card text-foreground backdrop-blur-md shadow-lg hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center overflow-hidden"
          )}
          onClick={!isMatrixOpen ? () => setIsMatrixOpen(true) : undefined}
          title={!isMatrixOpen ? "Operations & RAG Matrix" : undefined}
        >
          {!isMatrixOpen ? (
            /* 1. Show only icon when collapsed (Image 2 Matrix Bracket Icon) */
            <div className="relative flex items-center justify-center w-full h-full text-foreground hover:text-[#548235] transition-colors">
              <MatrixBracketIcon className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          ) : (
            /* 2. Expanded bottom tile stuck at bottom with fit in width and minimum height */
            <div className="flex flex-col h-full w-full animate-in fade-in duration-200">
              {/* Top Header Bar with Close Button */}
              <div className="h-10 px-4 border-b border-border/70 flex items-center justify-between bg-muted/30 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-md bg-[#548235]/15 text-[#548235] flex items-center justify-center">
                    <MatrixBracketIcon className="h-4 w-4 text-[#548235]" />
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-wide text-foreground">
                    Operations &amp; Live Manpower RAG Matrix
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-2 hidden sm:inline">
                    {siteLocation || siteName || "Transvolt Project Site"} &bull; Effective: {effectiveDate || "Current"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMatrixOpen(false)
                  }}
                  className="h-7 w-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Bottom Tile Content: OrgChartFooterV2 (with nested accordion removed!) */}
              <div className="p-3 overflow-y-auto flex-1 no-scrollbar bg-background/50">
                <OrgChartFooterV2
                  footer={footer}
                  nodes={nodes}
                  companyName={companyName}
                  siteLocation={siteLocation}
                  projectManager={projectManager}
                  effectiveDate={effectiveDate}
                  hideAccordionHeader={true}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
