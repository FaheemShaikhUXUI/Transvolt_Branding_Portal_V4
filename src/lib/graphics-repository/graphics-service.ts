import { GraphicCategory, GraphicFile, GraphicFileFormat } from "./types"
import { DEFAULT_GRAPHIC_CATEGORIES, DEFAULT_GRAPHIC_FILES } from "./seed-data"

const STORAGE_KEYS = {
  CATEGORIES: "transvolt_graphics_categories_v1",
  FILES: "transvolt_graphics_files_v1",
}

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

export function formatGraphicDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const day = d.getDate().toString().padStart(2, "0")
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = months[d.getMonth()]
    const year = d.getFullYear()
    return `${day} ${month} ${year}`
  } catch {
    return dateStr
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

export function getFileExtension(filename: string): string {
  const parts = filename.split(".")
  return parts.length > 1 ? parts.pop()!.toUpperCase() : ""
}

export function detectFileFormat(filename: string): GraphicFileFormat {
  const ext = getFileExtension(filename).toUpperCase()
  switch (ext) {
    case "JPG":
    case "JPEG":
      return "JPG"
    case "PNG":
      return "PNG"
    case "SVG":
      return "SVG"
    case "PDF":
      return "PDF"
    case "CDR":
      return "CDR"
    case "PPT":
    case "PPTX":
      return "PPT"
    case "AI":
      return "AI"
    case "EPS":
      return "EPS"
    default:
      return "OTHER"
  }
}

export const graphicsService = {
  getCategories(): GraphicCategory[] {
    if (!isBrowser()) return DEFAULT_GRAPHIC_CATEGORIES
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
    if (!raw) {
      this.saveCategories(DEFAULT_GRAPHIC_CATEGORIES)
      return DEFAULT_GRAPHIC_CATEGORIES
    }
    try {
      return JSON.parse(raw)
    } catch {
      return DEFAULT_GRAPHIC_CATEGORIES
    }
  },

  saveCategories(categories: GraphicCategory[]): void {
    if (!isBrowser()) return
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
  },

  getFiles(categoryId?: string): GraphicFile[] {
    if (!isBrowser()) {
      return categoryId
        ? DEFAULT_GRAPHIC_FILES.filter((f) => f.categoryId === categoryId)
        : DEFAULT_GRAPHIC_FILES
    }
    const raw = localStorage.getItem(STORAGE_KEYS.FILES)
    let files: GraphicFile[] = DEFAULT_GRAPHIC_FILES
    if (!raw) {
      this.saveFiles(DEFAULT_GRAPHIC_FILES)
    } else {
      try {
        files = JSON.parse(raw)
      } catch {
        files = DEFAULT_GRAPHIC_FILES
      }
    }
    return categoryId ? files.filter((f) => f.categoryId === categoryId) : files
  },

  saveFiles(files: GraphicFile[]): void {
    if (!isBrowser()) return
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files))
  },

  addCategory(name: string, description?: string): GraphicCategory {
    const categories = this.getCategories()
    const trimmed = name.trim()
    const existing = categories.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    )
    if (existing) {
      throw new Error(`Category "${trimmed}" already exists.`)
    }

    const newCat: GraphicCategory = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      description: description?.trim() || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updated = [newCat, ...categories]
    this.saveCategories(updated)
    return newCat
  },

  addFiles(
    categoryId: string,
    fileItems: Array<{
      name: string
      originalFileName: string
      format: GraphicFileFormat
      fileSize?: string
      fileData?: string
    }>
  ): GraphicFile[] {
    const existingFiles = this.getFiles()
    const newFiles: GraphicFile[] = fileItems.map((item, idx) => ({
      id: `gf-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      categoryId,
      name: item.name.trim() || item.originalFileName.replace(/\.[^/.]+$/, ""),
      originalFileName: item.originalFileName,
      format: item.format,
      fileSize: item.fileSize || "1.0 MB",
      fileData: item.fileData || "",
      uploadedAt: new Date().toISOString(),
      status: "active",
      version: "v1.0",
    }))

    const updated = [...newFiles, ...existingFiles]
    this.saveFiles(updated)
    return newFiles
  },

  replaceFile(
    fileId: string,
    newData: {
      name?: string
      originalFileName: string
      format: GraphicFileFormat
      fileSize?: string
      fileData?: string
    }
  ): GraphicFile {
    const files = this.getFiles()
    const targetIdx = files.findIndex((f) => f.id === fileId)
    if (targetIdx === -1) throw new Error("File not found.")

    const existing = files[targetIdx]
    let nextVersion = "v2.0"
    if (existing.version) {
      const match = existing.version.match(/v(\d+)(\.(\d+))?/)
      if (match) {
        const major = parseInt(match[1], 10) + 1
        nextVersion = `v${major}.0`
      }
    }

    const updatedFile: GraphicFile = {
      ...existing,
      name: newData.name || existing.name,
      originalFileName: newData.originalFileName,
      format: newData.format,
      fileSize: newData.fileSize || existing.fileSize,
      fileData: newData.fileData || existing.fileData,
      replacedAt: new Date().toISOString(),
      version: nextVersion,
    }

    files[targetIdx] = updatedFile
    this.saveFiles(files)
    return updatedFile
  },

  toggleHold(fileId: string): GraphicFile {
    const files = this.getFiles()
    const targetIdx = files.findIndex((f) => f.id === fileId)
    if (targetIdx === -1) throw new Error("File not found.")

    const existing = files[targetIdx]
    const updatedFile: GraphicFile = {
      ...existing,
      status: existing.status === "hold" ? "active" : "hold",
    }

    files[targetIdx] = updatedFile
    this.saveFiles(files)
    return updatedFile
  },

  deleteFile(fileId: string): void {
    const files = this.getFiles()
    const filtered = files.filter((f) => f.id !== fileId)
    this.saveFiles(filtered)
  },

  deleteCategory(categoryId: string): void {
    const categories = this.getCategories().filter((c) => c.id !== categoryId)
    const files = this.getFiles().filter((f) => f.categoryId !== categoryId)
    this.saveCategories(categories)
    this.saveFiles(files)
  },

  resetToDefault(): void {
    if (!isBrowser()) return
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES)
    localStorage.removeItem(STORAGE_KEYS.FILES)
    this.saveCategories(DEFAULT_GRAPHIC_CATEGORIES)
    this.saveFiles(DEFAULT_GRAPHIC_FILES)
  },
}
