// Type definitions for Enterprise Organization Chart System
// Backend-ready models for Supabase / PostgreSQL / REST API integration

export type ChartType = "HEAD_OFFICE" | "PROJECT_SITE"

export type ChartStatus = "CURRENT" | "DRAFT" | "ARCHIVED" | "FUTURE"

export type EmploymentType = "EMPLOYEE" | "CONSULTANT"

export type OrgNodeType =
  | "EXECUTIVE"
  | "MANAGEMENT"
  | "DEPARTMENT"
  | "EMPLOYEE"
  | "CONSULTANT"
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
  metadata: {
    name?: string
    designation?: string
    department?: string
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
  }
}

export interface OrgConnection {
  id: string
  source: string // node ID
  target: string // node ID
  type?: "orthogonal" | "bezier" | "straight"
  label?: string
  color?: string
  dashed?: boolean
}

export interface SectionBoundary {
  id: string
  title: string
  position: CanvasPosition
  width: number
  height: number
  color?: string
  nodeIds?: string[] // optional grouping of node IDs inside
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
}

export interface OrgFooter {
  enabled: boolean
  projectInfo: ProjectInformation
  manpowerColumns: ManpowerColumn[]
  manpowerRows: ManpowerRow[]
  vehicleMatrix: VehicleMatrix
  legendItems: LegendItem[]
  customNotes?: string
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

export interface OrganizationChart {
  id: string
  title: string
  chartType: ChartType
  siteId: string // References CompanyMaster record id
  siteName: string
  siteLocation: string
  version: string // e.g. "v1.0"
  status: ChartStatus
  effectiveFrom: string // YYYY-MM-DD
  effectiveTo?: string // YYYY-MM-DD
  createdAt: string // ISO string
  updatedAt: string // ISO string
  createdBy: string
  updatedBy: string
  changeSummary?: string
  nodes: OrgNode[]
  connections: OrgConnection[]
  boundaries: SectionBoundary[]
  footer: OrgFooter
  canvasSettings: CanvasSettings
  isTemplate?: boolean
}

export interface OrgChartFilter {
  search?: string
  siteId?: string
  status?: ChartStatus | "ALL"
  date?: string
}
