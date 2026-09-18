// Type definitions for Graphics Library V2 (Infinite nested folders & files)

export type V2FileFormat =
  | "PNG"
  | "JPG"
  | "SVG"
  | "PDF"
  | "CDR"
  | "WORD"
  | "PPT"
  | "AI"
  | "EPS"
  | "ZIP"
  | "OTHER"

export interface V2Folder {
  id: string
  name: string
  parentId: string | null // null means at root
  color?: string // optional accent color badge
  createdAt: string
  updatedAt: string
}

export interface V2File {
  id: string
  folderId: string | null // null means at root
  name: string
  originalFileName: string
  format: V2FileFormat | string
  fileSize: string // e.g., "1.4 MB"
  thumbnail?: string // small thumbnail preview data URL
  fileData?: string // base64 / data URL or file path for preview/download
  createdAt: string
  updatedAt: string
}

export interface BreadcrumbNode {
  id: string | null // null represents Root
  name: string
}

export type ViewMode = "list" | "grid"
export type SortField = "name" | "updatedAt" | "size" | "type"
export type SortDirection = "asc" | "desc"
