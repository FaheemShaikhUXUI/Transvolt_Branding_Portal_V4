// Type definitions for Enterprise Organization Chart System
// Backend-ready models for Supabase / PostgreSQL / REST API integration

export type ChartType = "HEAD_OFFICE" | "PROJECT_SITE"

export type ChartStatus = "CURRENT" | "DRAFT" | "ARCHIVED" | "FUTURE"

export type EmploymentType = "EMPLOYEE" | "HOD" | "CONSULTANT"

export type OrgNodeType =
  | "ORGANIZATION"
  | "EXECUTIVE"
  | "MANAGEMENT"
  | "DEPARTMENT"
  | "EMPLOYEE"
  | "CONSULTANT"
  | "HOD"
  | "REQUIRED_POSITION"

export interface CanvasPosition {
  x: number
  y: number
}

export interface OrgNode {
  id: string
  type: OrgNodeType
  label: string
  parentId: string | null
  siteId?: string
  departmentId?: string
  employeeId?: string
  position: CanvasPosition
  width?: number
  height?: number
  collapsed?: boolean
  metadata: {
    name?: string
    designation?: string
    department?: string
    departmentCode?: string
    employeeId?: string
    employmentType?: EmploymentType
    requiredQuantity?: number
    code?: string
    color?: string
    bgColor?: string
    description?: string
    avatar?: string
    email?: string
    contact?: string
    notes?: string
    siteLocation?: string
    reportsTo?: string
  }
}

export interface OrgConnection {
  id: string
  source: string // node ID
  target: string // node ID
  type?: "orthogonal" | "bezier" | "straight" | "ORTHOGONAL" | "BEZIER" | "STRAIGHT"
  label?: string
  color?: string
  dashed?: boolean
  arrowStart?: boolean
  arrowEnd?: boolean
  sourceAnchor?: "top" | "bottom" | "left" | "right"
  targetAnchor?: "top" | "bottom" | "left" | "right"
}

export type BoundaryTitlePosition =
  | "top-left-outside"
  | "top-center-outside"
  | "top-right-outside"
  | "bottom-left-outside"
  | "bottom-center-outside"
  | "bottom-right-outside"
  | "top-left-inside"
  | "top-center-inside"
  | "top-right-inside"
  | "bottom-left-inside"
  | "bottom-center-inside"
  | "bottom-right-inside"

export interface SectionBoundary {
  id: string
  title: string
  position: CanvasPosition
  width: number
  height: number
  color?: string
  strokeWidth?: number
  bgColor?: string
  borderStyle?: "dashed" | "dotted" | "solid"
  borderRadius?: number
  borderRadiusIndividual?: {
    topLeft?: number
    topRight?: number
    bottomRight?: number
    bottomLeft?: number
  }
  titlePosition?: BoundaryTitlePosition
  nodeIds?: string[] // optional grouping of node IDs inside
  locked?: boolean
}

export interface TextAnnotation {
  id: string
  text: string
  position: CanvasPosition
  fontSize?: number
  fontWeight?: string
  fontFamily?: string
  fontStyle?: "normal" | "italic"
  textDecoration?: "none" | "underline" | "line-through"
  textAlign?: "left" | "center" | "right" | "justify"
  color?: string
  bgColor?: string
  borderColor?: string
  borderStyle?: "none" | "solid" | "dashed" | "dotted"
  borderWidth?: number
  borderRadius?: number
  padding?: number
  lineHeight?: number
  letterSpacing?: number
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize"
  width?: number
  height?: number
  locked?: boolean
}

// Manpower RAG Matrix: Columns and Rows
export interface ManpowerColumn {
  id: string
  label: string // e.g., "Pilots", "Staff On Roll", "Staff Outsource"
}

export interface ManpowerRow {
  key: "REQUIRED" | "AVAILABLE" | "GAP"
  label: string
  values: Record<string, number> // columnId -> number
}

// Vehicle & Charger Matrix
export interface VehicleMatrix {
  vehicles: { required: number; available: number }
  chargers: { required: number; available: number }
  infrastructure?: { required: number; available: number }
}

export interface LegendItem {
  id: string
  label: string
  color: string
  indicator?: "dot" | "ring" | "square" | "dashed"
  type?: OrgNodeType | "GAP" | "AVAILABLE"
}

export interface ProjectInformation {
  projectName: string
  projectLocation: string
  projectCode: string
  projectManager: string
  effectiveDate: string
  companyName?: string
  clientName?: string
}

export interface OrgFooter {
  enabled: boolean
  projectInfo: ProjectInformation
  manpowerColumns: ManpowerColumn[]
  manpowerRows: ManpowerRow[]
  vehicleMatrix: VehicleMatrix
  legendItems: LegendItem[]
  customNotes?: string
  // Legacy / fallback compatibility
  projectInformation?: {
    projectName: string
    projectLocation: string
    effectiveDate: string
  }
  manpowerMatrix?: {
    columns: string[]
    rows: { label: string; values: Record<string, number> }[]
  }
  vehicleChargerMatrix?: {
    columns: string[]
    rows: { label: string; values: Record<string, number> }[]
  }
  legend?: { id: string; label: string; color: string; type: string }[]
}

export interface CanvasSettings {
  zoom: number
  pan: CanvasPosition
  gridSnap: boolean
  gridVisible: boolean
  printArea: "A3_LANDSCAPE" | "A4_LANDSCAPE" | "A2_LANDSCAPE" | "CUSTOM"
  showPrintBounds: boolean
}

export interface OrgChartVersionSummary {
  version: string
  effectiveFrom: string
  effectiveTo?: string
  createdAt: string
  createdBy: string
  changeSummary?: string
}

import type { ChartShape } from "@/components/org-chart/builder-v2/shapes/types"

export interface OrgChartPageData {
  id: string
  pageNumber: number
  title?: string
  nodes: OrgNode[]
  connections: OrgConnection[]
  boundaries: SectionBoundary[]
  annotations?: TextAnnotation[]
  shapes?: ChartShape[]
  footer?: OrgFooter
}

export interface OrganizationChart {
  id: string
  title: string
  chartType: ChartType
  siteId: string // References CompanyMaster record id
  siteName: string
  siteLocation: string
  companyName?: string
  clientName?: string
  projectManager?: string
  version: string // e.g. "v1.0"
  status: ChartStatus
  effectiveFrom: string // YYYY-MM-DD
  effectiveTo?: string // YYYY-MM-DD
  createdAt: string // ISO string
  updatedAt: string // ISO string
  createdBy: string
  updatedBy: string
  changeSummary?: string
  isBasicInfoSaved?: boolean
  nodes: OrgNode[]
  connections: OrgConnection[]
  boundaries: SectionBoundary[]
  annotations?: TextAnnotation[]
  shapes?: ChartShape[]
  footer: OrgFooter
  canvasSettings: CanvasSettings
  layoutDirection?: "TB" | "LR"
  isTemplate?: boolean
  pages?: OrgChartPageData[]
  activePageIndex?: number
}

export interface OrgChartFilter {
  search?: string
  siteId?: string
  status?: ChartStatus | "ALL"
  date?: string
}

