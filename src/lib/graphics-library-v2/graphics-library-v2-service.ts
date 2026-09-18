import { V2Folder, V2File, BreadcrumbNode, V2FileFormat } from "./types"
import { INITIAL_V2_FOLDERS, INITIAL_V2_FILES } from "./seed-data"
import { idbSetFile, idbGetFile, idbDeleteFile } from "./idb-storage"

const STORAGE_KEY_FOLDERS = "transvolt_graphics_library_v2_folders"
const STORAGE_KEY_FILES = "transvolt_graphics_library_v2_files"

class GraphicsLibraryV2Service {
  private inMemoryUrls: Map<string, string> = new Map()
  private cachedFolders: V2Folder[] | null = null
  private cachedFiles: V2File[] | null = null

  private isBrowser(): boolean {
    return typeof window !== "undefined"
  }

  public getFolders(): V2Folder[] {
    if (this.cachedFolders) return this.cachedFolders
    if (!this.isBrowser()) return INITIAL_V2_FOLDERS
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FOLDERS)
      if (stored) {
        this.cachedFolders = JSON.parse(stored)
        return this.cachedFolders!
      }
    } catch (e) {
      console.error("Failed to load V2 folders from localStorage", e)
    }
    this.cachedFolders = [...INITIAL_V2_FOLDERS]
    this.saveFolders(this.cachedFolders)
    return this.cachedFolders
  }

  public getFiles(): V2File[] {
    if (this.cachedFiles) return this.cachedFiles
    if (!this.isBrowser()) return INITIAL_V2_FILES
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FILES)
      if (stored) {
        this.cachedFiles = JSON.parse(stored)
        return this.cachedFiles!
      }
    } catch (e) {
      console.error("Failed to load V2 files from localStorage", e)
    }
    this.cachedFiles = [...INITIAL_V2_FILES]
    this.saveFiles(this.cachedFiles)
    return this.cachedFiles
  }

  public saveFolders(folders: V2Folder[]): void {
    this.cachedFolders = folders
    if (!this.isBrowser()) return
    try {
      localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders))
    } catch (e) {
      console.error("Failed to save V2 folders to localStorage", e)
    }
  }

  public saveFiles(files: V2File[]): void {
    this.cachedFiles = files
    if (!this.isBrowser()) return
    try {
      // Clean large data before saving to localStorage to prevent quota exceeded errors
      const sanitized = files.map((f) => {
        if (f.fileData && (f.fileData.length > 50000 || f.fileData.startsWith("blob:"))) {
          return {
            ...f,
            fileData: undefined, // actual binary is in IndexedDB or in-memory map
          }
        }
        return f
      })
      localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(sanitized))
    } catch (e) {
      console.warn("localStorage quota exceeded, saving files metadata without heavy payloads", e)
      try {
        const lightweight = files.map((f) => ({
          id: f.id,
          folderId: f.folderId || null,
          name: f.name,
          originalFileName: f.originalFileName,
          format: f.format,
          fileSize: f.fileSize,
          thumbnail: f.thumbnail && f.thumbnail.length < 30000 ? f.thumbnail : undefined,
          createdAt: f.createdAt,
          updatedAt: f.updatedAt,
        }))
        localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(lightweight))
      } catch (innerErr) {
        console.error("Critical: Could not store V2 files to localStorage", innerErr)
      }
    }
  }

  public getContents(currentFolderId: string | null): {
    folders: V2Folder[]
    files: V2File[]
  } {
    const allFolders = this.getFolders()
    const allFiles = this.getFiles()

    const folders = allFolders.filter((f) =>
      currentFolderId ? f.parentId === currentFolderId : !f.parentId
    )
    const files = allFiles.filter((f) =>
      currentFolderId ? f.folderId === currentFolderId : !f.folderId
    )

    return { folders, files }
  }

  public getFolderById(folderId: string | null): V2Folder | null {
    if (!folderId) return null
    const allFolders = this.getFolders()
    return allFolders.find((f) => f.id === folderId) || null
  }

  public getBreadcrumbs(currentFolderId: string | null): BreadcrumbNode[] {
    const crumbs: BreadcrumbNode[] = [{ id: null, name: "Graphics Library V2" }]
    if (!currentFolderId) return crumbs

    const allFolders = this.getFolders()
    const chain: BreadcrumbNode[] = []
    let currId: string | null = currentFolderId

    const visited = new Set<string>()

    while (currId && !visited.has(currId)) {
      visited.add(currId)
      const folder = allFolders.find((f) => f.id === currId)
      if (!folder) break
      chain.unshift({ id: folder.id, name: folder.name })
      currId = folder.parentId
    }

    return [...crumbs, ...chain]
  }

  public createFolder(
    name: string,
    parentId: string | null,
    color?: string
  ): V2Folder {
    const allFolders = this.getFolders()
    const newFolder: V2Folder = {
      id: `fld-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: name.trim() || "New Folder",
      parentId: parentId || null,
      color: color || "#2563eb",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [newFolder, ...allFolders]
    this.saveFolders(updated)
    return newFolder
  }

  public renameFolder(folderId: string, newName: string): V2Folder | null {
    const allFolders = this.getFolders()
    const trimmed = newName.trim()
    if (!trimmed) return null

    let renamed: V2Folder | null = null
    const updated = allFolders.map((f) => {
      if (f.id === folderId) {
        renamed = {
          ...f,
          name: trimmed,
          updatedAt: new Date().toISOString(),
        }
        return renamed
      }
      return f
    })

    if (renamed) {
      this.saveFolders(updated)
    }
    return renamed
  }

  public deleteFolder(folderId: string): void {
    const allFolders = this.getFolders()
    const allFiles = this.getFiles()

    const toDeleteIds = new Set<string>([folderId])
    let addedAny = true

    while (addedAny) {
      addedAny = false
      for (const f of allFolders) {
        if (f.parentId && toDeleteIds.has(f.parentId) && !toDeleteIds.has(f.id)) {
          toDeleteIds.add(f.id)
          addedAny = true
        }
      }
    }

    const remainingFolders = allFolders.filter((f) => !toDeleteIds.has(f.id))
    const filesToDelete = allFiles.filter(
      (f) => f.folderId && toDeleteIds.has(f.folderId)
    )
    const remainingFiles = allFiles.filter(
      (f) => !f.folderId || !toDeleteIds.has(f.folderId)
    )

    // Clean up binaries
    filesToDelete.forEach((f) => {
      this.inMemoryUrls.delete(f.id)
      idbDeleteFile(f.id).catch(() => {})
    })

    this.saveFolders(remainingFolders)
    this.saveFiles(remainingFiles)
  }

  public async uploadSingleFile(
    file: File,
    folderId: string | null
  ): Promise<V2File> {
    const format = this.detectFormat(file.name)
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`

    // 1. Create immediate object URL
    let memUrl = ""
    try {
      memUrl = URL.createObjectURL(file)
      this.inMemoryUrls.set(fileId, memUrl)
    } catch (e) {
      console.warn("URL.createObjectURL failed", e)
    }

    const item: V2File = {
      id: fileId,
      folderId: folderId || null,
      name: file.name,
      originalFileName: file.name,
      format,
      fileSize: this.formatBytes(file.size),
      fileData: memUrl || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // 2. Add to allFiles and update cache & storage IMMEDIATELY so it is 100% visible!
    const allFiles = this.getFiles()
    const updated = [item, ...allFiles]
    this.saveFiles(updated)

    // 3. In background without blocking: generate thumbnail and save to IndexedDB
    this.persistFileInBackground(file, fileId, format)

    return item
  }

  private async persistFileInBackground(file: File, fileId: string, format: string) {
    try {
      if (["PNG", "JPG"].includes(format)) {
        const thumb = await this.createThumbnail(file)
        if (thumb) {
          const allFiles = this.getFiles()
          const updated = allFiles.map((f) =>
            f.id === fileId ? { ...f, thumbnail: thumb } : f
          )
          this.saveFiles(updated)
        }
      }
    } catch (err) {
      console.warn("Thumbnail background failed", err)
    }

    try {
      const fullDataUrl = await this.fileToDataUrl(file)
      if (fullDataUrl) {
        await idbSetFile(fileId, fullDataUrl)
      }
    } catch (err) {
      console.warn("IndexedDB background failed", err)
    }
  }

  public async uploadFiles(
    files: File[],
    folderId: string | null
  ): Promise<V2File[]> {
    const createdItems: V2File[] = []
    for (const file of files) {
      const item = await this.uploadSingleFile(file, folderId)
      createdItems.push(item)
    }
    return createdItems
  }

  public renameFile(fileId: string, newName: string): V2File | null {
    const allFiles = this.getFiles()
    const trimmed = newName.trim()
    if (!trimmed) return null

    let renamed: V2File | null = null
    const updated = allFiles.map((f) => {
      if (f.id === fileId) {
        renamed = {
          ...f,
          name: trimmed,
          updatedAt: new Date().toISOString(),
        }
        return renamed
      }
      return f
    })

    if (renamed) {
      this.saveFiles(updated)
    }
    return renamed
  }

  public deleteFile(fileId: string): void {
    this.inMemoryUrls.delete(fileId)
    idbDeleteFile(fileId).catch(() => {})

    const allFiles = this.getFiles()
    const remaining = allFiles.filter((f) => f.id !== fileId)
    this.saveFiles(remaining)
  }

  public async getFileDownloadUrl(file: V2File): Promise<string> {
    const mem = this.inMemoryUrls.get(file.id)
    if (mem) return mem

    const idbData = await idbGetFile(file.id)
    if (idbData) return idbData

    if (file.fileData) return file.fileData
    if (file.thumbnail) return file.thumbnail

    // Fallback: create plain text blob
    const blob = new Blob([`Transvolt Asset: ${file.name}`], { type: "text/plain" })
    return URL.createObjectURL(blob)
  }

  public async downloadFile(file: V2File): Promise<void> {
    const url = await this.getFileDownloadUrl(file)
    const a = document.createElement("a")
    a.href = url
    a.download = file.originalFileName || file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  public async getFilePreviewUrl(file: V2File): Promise<string | undefined> {
    const mem = this.inMemoryUrls.get(file.id)
    if (mem) return mem

    const idbData = await idbGetFile(file.id)
    if (idbData) return idbData

    return file.thumbnail || file.fileData
  }

  public resetToDefaults(): void {
    this.inMemoryUrls.clear()
    this.cachedFolders = [...INITIAL_V2_FOLDERS]
    this.cachedFiles = [...INITIAL_V2_FILES]
    this.saveFolders(this.cachedFolders)
    this.saveFiles(this.cachedFiles)
  }

  public getFolderStats(folderId: string): { subfolderCount: number; fileCount: number } {
    const allFolders = this.getFolders()
    const allFiles = this.getFiles()
    const subfolders = allFolders.filter((f) => f.parentId === folderId)
    const files = allFiles.filter((f) => f.folderId === folderId)
    return { subfolderCount: subfolders.length, fileCount: files.length }
  }

  // Helpers
  public detectFormat(fileName: string): V2FileFormat {
    const ext = fileName.split(".").pop()?.toUpperCase() || ""
    if (ext === "PNG") return "PNG"
    if (ext === "JPG" || ext === "JPEG") return "JPG"
    if (ext === "SVG") return "SVG"
    if (ext === "PDF") return "PDF"
    if (ext === "CDR") return "CDR"
    if (ext === "DOC" || ext === "DOCX") return "WORD"
    if (ext === "PPT" || ext === "PPTX") return "PPT"
    if (ext === "AI") return "AI"
    if (ext === "EPS") return "EPS"
    if (ext === "ZIP" || ext === "RAR" || ext === "7Z") return "ZIP"
    return "OTHER"
  }

  public formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  public formatDate(dateString: string): string {
    try {
      const d = new Date(dateString)
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateString
    }
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve) => {
      // 5-second safety timeout so large files don't lock forever
      const timeout = setTimeout(() => resolve(""), 5000)
      const reader = new FileReader()
      reader.onload = (e) => {
        clearTimeout(timeout)
        resolve((e.target?.result as string) || "")
      }
      reader.onerror = () => {
        clearTimeout(timeout)
        resolve("")
      }
      reader.readAsDataURL(file)
    })
  }

  private createThumbnail(file: File): Promise<string> {
    return new Promise((resolve) => {
      // 500ms safety timeout
      const timeout = setTimeout(() => resolve(""), 500)
      try {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
          clearTimeout(timeout)
          URL.revokeObjectURL(url)
          try {
            const canvas = document.createElement("canvas")
            const maxDim = 160
            let w = img.width || 100
            let h = img.height || 100
            if (w > h) {
              if (w > maxDim) {
                h = Math.round((h * maxDim) / w)
                w = maxDim
              }
            } else {
              if (h > maxDim) {
                w = Math.round((w * maxDim) / h)
                h = maxDim
              }
            }
            canvas.width = Math.max(1, w)
            canvas.height = Math.max(1, h)
            const ctx = canvas.getContext("2d")
            if (ctx) {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
              resolve(canvas.toDataURL("image/jpeg", 0.6))
            } else {
              resolve("")
            }
          } catch {
            resolve("")
          }
        }
        img.onerror = () => {
          clearTimeout(timeout)
          URL.revokeObjectURL(url)
          resolve("")
        }
        img.src = url
      } catch {
        clearTimeout(timeout)
        resolve("")
      }
    })
  }
}

export const graphicsLibraryV2Service = new GraphicsLibraryV2Service()
