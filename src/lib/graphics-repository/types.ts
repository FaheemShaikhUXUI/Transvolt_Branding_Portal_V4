// Type definitions for Graphics Library

export type GraphicFileFormat =
  | "JPG"
  | "PNG"
  | "SVG"
  | "PDF"
  | "CDR"
  | "PPT"
  | "AI"
  | "EPS"
  | "OTHER"

export type GraphicFileStatus = "active" | "hold"

export interface GraphicFile {
  id: string
  categoryId: string
  name: string
  originalFileName: string
  format: GraphicFileFormat
  fileSize?: string
  fileData?: string
  uploadedAt: string // ISO string or formatted date
  status: GraphicFileStatus
  version?: string
  replacedAt?: string
}

export interface GraphicCategory {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface UploadFileItem {
  id: string
  file: File | null
  name: string
  format: GraphicFileFormat
  size: string
  previewUrl?: string
}
