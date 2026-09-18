"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Folder,
  FolderPlus,
  Upload,
  ArrowUp,
  Home,
  ChevronRight,
  Search,
  MoreVertical,
  Download,
  Edit3,
  Trash2,
  Eye,
  List,
  Grid,
  FileText,
  FileCode,
  Image as ImageIcon,
  RotateCcw,
  HardDrive,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronDown,
  X,
  Filter,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { V2Folder, V2File, BreadcrumbNode, ViewMode, SortField, SortDirection } from "@/lib/graphics-library-v2/types"
import { graphicsLibraryV2Service } from "@/lib/graphics-library-v2/graphics-library-v2-service"
import { CreateFolderDialog } from "./create-folder-dialog"
import { RenameDialog } from "./rename-dialog"
import { DeleteDialog } from "./delete-dialog"
import { FilePreviewDialog } from "./file-preview-dialog"
import { UploadProgressWidget, UploadItemProgress } from "./upload-progress-widget"
import { cn } from "@/lib/utils"

export type FilterType =
  | "all"
  | "folders"
  | "files"
  | "images"
  | "vectors"
  | "documents"
  | "archives"

export type FilterDate = "all" | "today" | "week" | "month" | "year"
export type FilterSize = "all" | "small" | "medium" | "large"
export type FilterScope = "current" | "all"

export interface FilterState {
  type: FilterType
  date: FilterDate
  size: FilterSize
  scope: FilterScope
}

const DEFAULT_FILTERS: FilterState = {
  type: "all",
  date: "all",
  size: "all",
  scope: "current",
}

function getTypeLabel(t: FilterType): string {
  switch (t) {
    case "folders":
      return "Folders Only"
    case "files":
      return "Files Only"
    case "images":
      return "Images (PNG, JPG)"
    case "vectors":
      return "Vectors & Design"
    case "documents":
      return "Documents (PDF, Doc)"
    case "archives":
      return "Archives (ZIP, RAR)"
    default:
      return "All Types"
  }
}

function getDateLabel(d: FilterDate): string {
  switch (d) {
    case "today":
      return "Today"
    case "week":
      return "Past 7 Days"
    case "month":
      return "Past 30 Days"
    case "year":
      return "This Year"
    default:
      return "Any Time"
  }
}

function getSizeLabel(s: FilterSize): string {
  switch (s) {
    case "small":
      return "< 1 MB"
    case "medium":
      return "1 – 10 MB"
    case "large":
      return "> 10 MB"
    default:
      return "Any Size"
  }
}

function parseFileSizeToBytes(sizeStr: string): number {
  if (!sizeStr) return 0
  const match = sizeStr.trim().match(/^([\d.]+)\s*([a-zA-Z]+)?$/)
  if (!match) return 0
  const val = parseFloat(match[1])
  const unit = (match[2] || "B").toUpperCase()
  if (unit.startsWith("K")) return val * 1024
  if (unit.startsWith("M")) return val * 1024 * 1024
  if (unit.startsWith("G")) return val * 1024 * 1024 * 1024
  return val
}

function matchesDateFilter(isoDate: string, filter: FilterDate): boolean {
  if (filter === "all") return true
  if (!isoDate) return false
  const itemDate = new Date(isoDate)
  if (isNaN(itemDate.getTime())) return true
  const now = new Date()
  const diffMs = now.getTime() - itemDate.getTime()
  const oneDay = 24 * 60 * 60 * 1000

  if (filter === "today") {
    return diffMs <= oneDay && diffMs >= -3600000
  }
  if (filter === "week") {
    return diffMs <= 7 * oneDay && diffMs >= -3600000
  }
  if (filter === "month") {
    return diffMs <= 30 * oneDay && diffMs >= -3600000
  }
  if (filter === "year") {
    return itemDate.getFullYear() === now.getFullYear()
  }
  return true
}

function matchesTypeFilter(format: string, filterType: FilterType): boolean {
  const fmt = (format || "").toUpperCase()
  switch (filterType) {
    case "images":
      return ["PNG", "JPG", "JPEG", "WEBP", "GIF"].includes(fmt)
    case "vectors":
      return ["SVG", "CDR", "AI", "EPS", "FIG", "PSD"].includes(fmt)
    case "documents":
      return ["PDF", "DOC", "DOCX", "TXT", "XLS", "XLSX", "PPT", "PPTX", "WORD"].includes(fmt)
    case "archives":
      return ["ZIP", "RAR", "7Z", "TAR", "GZ"].includes(fmt)
    default:
      return true
  }
}

function matchesSizeFilter(fileSize: string, sizeFilter: FilterSize): boolean {
  if (sizeFilter === "all") return true
  const bytes = parseFileSizeToBytes(fileSize)
  const oneMB = 1024 * 1024
  const tenMB = 10 * 1024 * 1024

  switch (sizeFilter) {
    case "small":
      return bytes < oneMB
    case "medium":
      return bytes >= oneMB && bytes <= tenMB
    case "large":
      return bytes > tenMB
    default:
      return true
  }
}

export function GraphicsLibraryV2Page() {
  const router = useRouter()
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null)
  const [folders, setFolders] = React.useState<V2Folder[]>([])
  const [files, setFiles] = React.useState<V2File[]>([])
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbNode[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<ViewMode>("list")
  const [sortField, setSortField] = React.useState<SortField>("name")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc")
  const [isDraggingOver, setIsDraggingOver] = React.useState(false)

  // Filter state
  const [filters, setFilters] = React.useState<FilterState>(DEFAULT_FILTERS)
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
  const filterPopoverRef = React.useRef<HTMLDivElement>(null)

  // Close filter popover on outside click or Escape key
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterPopoverRef.current &&
        !filterPopoverRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsFilterOpen(false)
      }
    }

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isFilterOpen])

  // Count active non-default filters
  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    if (filters.type !== "all") count++
    if (filters.date !== "all") count++
    if (filters.size !== "all") count++
    if (filters.scope !== "current") count++
    return count
  }, [filters])

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  // Dialog States
  const [isCreateFolderOpen, setIsCreateFolderOpen] = React.useState(false)
  const [renameItem, setRenameItem] = React.useState<{
    id: string
    name: string
    type: "folder" | "file"
  } | null>(null)
  const [deleteItem, setDeleteItem] = React.useState<{
    id: string
    name: string
    type: "folder" | "file"
  } | null>(null)
  const [previewFile, setPreviewFile] = React.useState<V2File | null>(null)

  // Upload progress batch state
  const [uploadBatch, setUploadBatch] = React.useState<{
    isOpen: boolean
    items: UploadItemProgress[]
    overallProgress: number
  }>({
    isOpen: false,
    items: [],
    overallProgress: 0,
  })

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Load contents whenever currentFolderId changes
  const refreshData = React.useCallback(() => {
    const contents = graphicsLibraryV2Service.getContents(currentFolderId)
    setFolders(contents.folders)
    setFiles(contents.files)
    setBreadcrumbs(graphicsLibraryV2Service.getBreadcrumbs(currentFolderId))
  }, [currentFolderId])

  React.useEffect(() => {
    refreshData()
  }, [refreshData])

  const currentFolder = React.useMemo(() => {
    return graphicsLibraryV2Service.getFolderById(currentFolderId)
  }, [currentFolderId])

  // Navigate to parent folder (Up 1 level)
  const handleNavigateUp = () => {
    if (!currentFolderId) return
    const folder = graphicsLibraryV2Service.getFolderById(currentFolderId)
    setCurrentFolderId(folder ? folder.parentId : null)
  }

  // Filter & Sort
  const filteredFolders = React.useMemo(() => {
    // If type filter is set to files only or specific file formats, hide folders
    if (
      filters.type === "files" ||
      filters.type === "images" ||
      filters.type === "vectors" ||
      filters.type === "documents" ||
      filters.type === "archives"
    ) {
      return []
    }

    const sourceFolders =
      filters.scope === "all" ? graphicsLibraryV2Service.getFolders() : folders

    let result = sourceFolders
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((f) => f.name.toLowerCase().includes(q))
    }
    if (filters.date !== "all") {
      result = result.filter((f) => matchesDateFilter(f.updatedAt, filters.date))
    }

    return [...result].sort((a, b) => {
      let cmp = 0
      if (sortField === "name") cmp = a.name.localeCompare(b.name)
      else if (sortField === "updatedAt") cmp = a.updatedAt.localeCompare(b.updatedAt)
      return sortDirection === "asc" ? cmp : -cmp
    })
  }, [folders, filters, searchQuery, sortField, sortDirection])

  const filteredFiles = React.useMemo(() => {
    if (filters.type === "folders") {
      return []
    }

    const sourceFiles =
      filters.scope === "all" ? graphicsLibraryV2Service.getFiles() : files

    let result = sourceFiles
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.format.toLowerCase().includes(q)
      )
    }
    if (filters.type !== "all" && filters.type !== "files") {
      result = result.filter((f) => matchesTypeFilter(f.format, filters.type))
    }
    if (filters.date !== "all") {
      result = result.filter((f) => matchesDateFilter(f.updatedAt, filters.date))
    }
    if (filters.size !== "all") {
      result = result.filter((f) => matchesSizeFilter(f.fileSize, filters.size))
    }

    return [...result].sort((a, b) => {
      let cmp = 0
      if (sortField === "name") cmp = a.name.localeCompare(b.name)
      else if (sortField === "type") cmp = a.format.localeCompare(b.format)
      else if (sortField === "updatedAt") cmp = a.updatedAt.localeCompare(b.updatedAt)
      else if (sortField === "size") {
        const sizeA = parseFileSizeToBytes(a.fileSize)
        const sizeB = parseFileSizeToBytes(b.fileSize)
        cmp = sizeA - sizeB
      }
      return sortDirection === "asc" ? cmp : -cmp
    })
  }, [files, filters, searchQuery, sortField, sortDirection])

  // Folder creation handler
  const handleCreateFolder = (name: string, color?: string) => {
    graphicsLibraryV2Service.createFolder(name, currentFolderId, color)
    refreshData()
    toast.success(`Folder "${name}" created successfully.`)
  }

  // Interactive File upload handler with progress animation and counts
  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return
    const fileList = Array.from(uploadedFiles)
    const total = fileList.length

    const initialItems: UploadItemProgress[] = fileList.map((file, idx) => ({
      id: `upl-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      name: file.name,
      size: graphicsLibraryV2Service.formatBytes(file.size),
      format: graphicsLibraryV2Service.detectFormat(file.name),
      progress: 0,
      status: "pending",
    }))

    setUploadBatch({
      isOpen: true,
      items: initialItems,
      overallProgress: 8,
    })

    let completedCount = 0

    for (let i = 0; i < total; i++) {
      const file = fileList[i]
      const itemId = initialItems[i].id

      // Step 1: Mark active uploading item
      setUploadBatch((prev) => ({
        ...prev,
        items: prev.items.map((it) =>
          it.id === itemId ? { ...it, status: "uploading", progress: 25 } : it
        ),
      }))

      // Realistic progressive step for smooth interactive feedback
      await new Promise((r) => setTimeout(r, 120))

      setUploadBatch((prev) => ({
        ...prev,
        items: prev.items.map((it) =>
          it.id === itemId ? { ...it, progress: 65 } : it
        ),
      }))

      try {
        await graphicsLibraryV2Service.uploadSingleFile(file, currentFolderId)
        completedCount++

        // Immediately update page view so file pops up on the screen in real-time
        refreshData()

        const progressPercent = Math.round((completedCount / total) * 100)

        setUploadBatch((prev) => ({
          ...prev,
          overallProgress: progressPercent,
          items: prev.items.map((it) =>
            it.id === itemId
              ? { ...it, status: "completed", progress: 100 }
              : it
          ),
        }))
      } catch (err) {
        console.error("Upload error for", file.name, err)
        setUploadBatch((prev) => ({
          ...prev,
          items: prev.items.map((it) =>
            it.id === itemId ? { ...it, status: "error", progress: 100 } : it
          ),
        }))
      }

      await new Promise((r) => setTimeout(r, 80))
    }

    // Clear search filter so newly uploaded files are never hidden by an active search
    setSearchQuery("")
    refreshData()
    toast.success(
      total === 1
        ? `Uploaded "${fileList[0].name}" successfully!`
        : `Uploaded all ${total} files successfully!`
    )

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Rename handler
  const handleRenameConfirm = (newName: string) => {
    if (!renameItem) return
    if (renameItem.type === "folder") {
      graphicsLibraryV2Service.renameFolder(renameItem.id, newName)
      toast.success(`Folder renamed to "${newName}".`)
    } else {
      graphicsLibraryV2Service.renameFile(renameItem.id, newName)
      toast.success(`File renamed to "${newName}".`)
    }
    refreshData()
    setRenameItem(null)
  }

  // Delete handler
  const handleDeleteConfirm = () => {
    if (!deleteItem) return
    if (deleteItem.type === "folder") {
      graphicsLibraryV2Service.deleteFolder(deleteItem.id)
      toast.success(`Folder "${deleteItem.name}" deleted.`)
    } else {
      graphicsLibraryV2Service.deleteFile(deleteItem.id)
      toast.success(`File "${deleteItem.name}" deleted.`)
    }
    refreshData()
    setDeleteItem(null)
  }

  // Reset handler
  const handleResetDefaults = () => {
    graphicsLibraryV2Service.resetToDefaults()
    setCurrentFolderId(null)
    refreshData()
    toast.success("Reset library to sample hierarchy.")
  }

  // Drag & drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  // Format badge rendering helper
  const renderFormatBadge = (format: string) => {
    const fmt = format.toUpperCase()
    let colorClass = "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300"
    if (fmt === "PNG") colorClass = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400"
    else if (fmt === "JPG" || fmt === "JPEG") colorClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400"
    else if (fmt === "SVG") colorClass = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400"
    else if (fmt === "PDF") colorClass = "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400"
    else if (fmt === "CDR") colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400"
    else if (fmt === "WORD") colorClass = "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-400"
    else if (fmt === "PPT") colorClass = "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400"

    return (
      <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-md border tracking-wider", colorClass)}>
        {fmt}
      </span>
    )
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex flex-col -mt-3.5 text-foreground transition-colors"
    >
      {/* Hidden File Input with auto-reset onClick so Windows file dialog triggers reliably */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onClick={(e) => {
          ;(e.target as HTMLInputElement).value = ""
        }}
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-xs border-4 border-dashed border-primary rounded-2xl flex flex-col items-center justify-center p-8 pointer-events-none transition-all duration-200 animate-in fade-in">
          <div className="h-16 w-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4 shadow-xl">
            <Upload className="h-8 w-8 animate-bounce" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            Drop files here to upload
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Files will be stored inside{" "}
            <span className="font-semibold text-primary">
              "{currentFolder?.name || "Root Directory"}"
            </span>
          </p>
        </div>
      )}

      {/* ── TOP HEADER BAR ────────────────────────────────────────────── */}
      <div className="border-b border-border/80 bg-card/60 backdrop-blur-md px-4 sm:px-6 py-2.5 sm:py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center shadow-xs">
                <HardDrive className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                Graphics Library V2
              </h1>
              <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
                Explorer Storage
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Google Drive & Windows Explorer style storage with infinite nested folders, renaming & file uploads.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Search Input */}
            <div className="relative w-48 sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search files & folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-7 h-9 text-xs rounded-xl bg-background/80"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Button & Popover right side of search bar */}
            <div className="relative" ref={filterPopoverRef}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className={cn(
                  "h-9 rounded-xl text-xs font-medium gap-1.5 border transition-all shadow-xs cursor-pointer",
                  activeFiltersCount > 0
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 font-semibold ring-1 ring-emerald-500/30"
                    : "border-border/80 bg-background/80 hover:bg-muted text-foreground"
                )}
                title="Filter files and folders"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Filter</span>
                {activeFiltersCount > 0 && (
                  <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "h-3 w-3 text-muted-foreground transition-transform duration-200",
                    isFilterOpen && "rotate-180"
                  )}
                />
              </Button>

              {/* Filter Popover Dropdown */}
              {isFilterOpen && (
                <div className="absolute left-0 top-full mt-2 w-[340px] sm:w-[390px] z-50 rounded-2xl border border-border/80 bg-card p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  {/* Popover Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Filter Options</h4>
                        <p className="text-[10px] text-muted-foreground">Narrow down library assets</p>
                      </div>
                    </div>
                    {activeFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
                    {/* 1. Item Type */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Type & Format
                        </span>
                        {filters.type !== "all" && (
                          <span className="text-[10px] font-medium text-emerald-600">
                            {getTypeLabel(filters.type)}
                          </span>
                        )}
                      </div>
                      {/* Primary Categories */}
                      <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                        {(
                          [
                            { id: "all", label: "All Items" },
                            { id: "folders", label: "📁 Folders" },
                            { id: "files", label: "📄 Files" },
                          ] as const
                        ).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFilters((f) => ({ ...f, type: item.id }))}
                            className={cn(
                              "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-center border cursor-pointer",
                              filters.type === item.id
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold"
                                : "bg-muted/40 text-foreground border-border/60 hover:bg-muted"
                            )}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                      {/* Specific File Formats */}
                      <div className="grid grid-cols-2 gap-1.5">
                        {(
                          [
                            { id: "images", label: "🖼️ Images (PNG, JPG)" },
                            { id: "vectors", label: "📐 Vectors (SVG, CDR)" },
                            { id: "documents", label: "📑 Docs (PDF, Word)" },
                            { id: "archives", label: "📦 Archives (ZIP)" },
                          ] as const
                        ).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFilters((f) => ({ ...f, type: item.id }))}
                            className={cn(
                              "px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all text-left border truncate cursor-pointer",
                              filters.type === item.id
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold"
                                : "bg-muted/40 text-foreground border-border/60 hover:bg-muted"
                            )}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Date Modified */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Date Modified
                        </span>
                        {filters.date !== "all" && (
                          <span className="text-[10px] font-medium text-emerald-600">
                            {getDateLabel(filters.date)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center flex-wrap gap-1.5">
                        {(
                          [
                            { id: "all", label: "Any Time" },
                            { id: "today", label: "Today" },
                            { id: "week", label: "Past 7 Days" },
                            { id: "month", label: "Past 30 Days" },
                            { id: "year", label: "This Year" },
                          ] as const
                        ).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFilters((f) => ({ ...f, date: item.id }))}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border cursor-pointer",
                              filters.date === item.id
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold"
                                : "bg-muted/40 text-foreground border-border/60 hover:bg-muted"
                            )}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. File Size */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          File Size
                        </span>
                        {filters.size !== "all" && (
                          <span className="text-[10px] font-medium text-emerald-600">
                            {getSizeLabel(filters.size)}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(
                          [
                            { id: "all", label: "Any Size" },
                            { id: "small", label: "< 1 MB (Small)" },
                            { id: "medium", label: "1 – 10 MB (Medium)" },
                            { id: "large", label: "> 10 MB (Large)" },
                          ] as const
                        ).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFilters((f) => ({ ...f, size: item.id }))}
                            className={cn(
                              "px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all border text-center cursor-pointer",
                              filters.size === item.id
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold"
                                : "bg-muted/40 text-foreground border-border/60 hover:bg-muted"
                            )}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 4. Search Scope */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Search Scope
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFilters((f) => ({ ...f, scope: "current" }))}
                          className={cn(
                            "px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border text-center cursor-pointer",
                            filters.scope === "current"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold"
                              : "bg-muted/40 text-foreground border-border/60 hover:bg-muted"
                          )}
                        >
                          Current Folder
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilters((f) => ({ ...f, scope: "all" }))}
                          className={cn(
                            "px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border text-center cursor-pointer",
                            filters.scope === "all"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold"
                              : "bg-muted/40 text-foreground border-border/60 hover:bg-muted"
                          )}
                        >
                          All Subfolders (Deep)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Popover Footer */}
                  <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {filteredFolders.length} folders, {filteredFiles.length} files
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setIsFilterOpen(false)}
                      className="h-8 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 cursor-pointer"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Prompt & Notes Button */}
            <Button
              onClick={() => router.push("/graphics-library-v2/saved-prompts-notes")}
              variant="outline"
              size="sm"
              className="h-9 rounded-xl text-xs font-medium gap-1.5 border-border/80 bg-background/80 hover:bg-muted text-foreground shadow-xs cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Saved Prompt & Notes</span>
            </Button>

            {/* New Folder Button */}
            <Button
              onClick={() => setIsCreateFolderOpen(true)}
              size="sm"
              className="h-9 rounded-xl text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span>New Folder</span>
            </Button>

            {/* Upload Files Button */}
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              className="h-9 rounded-xl text-xs font-semibold gap-1.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 border-none shadow-xs transition-all duration-150 cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5 text-white dark:text-black" />
              <span>Upload Files</span>
            </Button>

            {/* View Mode Toggle (List vs Grid) */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-lg text-xs transition-colors",
                  viewMode === "list"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="List View (Windows Style)"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-lg text-xs transition-colors",
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Grid View (Drive Style)"
              >
                <Grid className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* More / Reset Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button className="h-9 w-9 rounded-xl border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              } />
              <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl p-1.5">
                <DropdownMenuItem
                  onClick={handleResetDefaults}
                  className="text-xs p-2 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-2" />
                  <span>Reset to Sample Library</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ── BREADCRUMB NAVIGATION RIBBON ───────────────────────────────── */}
      <div className="bg-card/40 border-b border-border/70 px-6 py-2.5 flex items-center justify-between text-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-0">
          {/* Back/Up one level button */}
          <button
            onClick={handleNavigateUp}
            disabled={!currentFolderId}
            className={cn(
              "p-1.5 rounded-lg transition-colors mr-1 shrink-0",
              currentFolderId
                ? "hover:bg-muted text-foreground cursor-pointer"
                : "text-muted-foreground/30 cursor-not-allowed"
            )}
            title="Up to parent folder (Alt + Up)"
          >
            <ArrowUp className="h-4 w-4" />
          </button>

          {/* Breadcrumb path chips */}
          <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap py-0.5">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1
              return (
                <React.Fragment key={crumb.id || "root"}>
                  {idx > 0 && (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                  )}
                  <button
                    onClick={() => setCurrentFolderId(crumb.id)}
                    className={cn(
                      "px-2 py-1 rounded-lg transition-colors flex items-center gap-1.5 text-xs",
                      isLast
                        ? "font-bold text-foreground bg-muted/60"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40 cursor-pointer"
                    )}
                  >
                    {idx === 0 && <Home className="h-3.5 w-3.5 text-primary shrink-0" />}
                    <span>{crumb.name}</span>
                  </button>
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Folder Stats pill */}
        <div className="text-[11px] text-muted-foreground whitespace-nowrap pl-4 shrink-0 font-medium">
          {filteredFolders.length} Folder{filteredFolders.length !== 1 ? "s" : ""},{" "}
          {filteredFiles.length} File{filteredFiles.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── ACTIVE FILTERS STRIP ────────────────────────────────────────── */}
      {activeFiltersCount > 0 && (
        <div className="bg-emerald-500/5 border-b border-emerald-500/20 px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs flex-wrap animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 mr-1">
              <SlidersHorizontal className="h-3 w-3" />
              Active Filters:
            </span>
            {filters.type !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-medium shadow-2xs">
                <span>Type: {getTypeLabel(filters.type)}</span>
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, type: "all" }))}
                  className="hover:text-destructive transition-colors ml-0.5 cursor-pointer"
                  title="Remove type filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.date !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-medium shadow-2xs">
                <span>Date: {getDateLabel(filters.date)}</span>
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, date: "all" }))}
                  className="hover:text-destructive transition-colors ml-0.5 cursor-pointer"
                  title="Remove date filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.size !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-medium shadow-2xs">
                <span>Size: {getSizeLabel(filters.size)}</span>
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, size: "all" }))}
                  className="hover:text-destructive transition-colors ml-0.5 cursor-pointer"
                  title="Remove size filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.scope !== "current" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-medium shadow-2xs">
                <span>Scope: All Subfolders</span>
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, scope: "current" }))}
                  className="hover:text-destructive transition-colors ml-0.5 cursor-pointer"
                  title="Switch to current folder only"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[11px] font-semibold text-muted-foreground hover:text-destructive underline transition-colors cursor-pointer ml-auto"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ──────────────────────────────────────────── */}
      <div className="flex-1 px-4 sm:px-6 py-4">
        {filteredFolders.length === 0 && filteredFiles.length === 0 ? (
          /* Empty Folder / Filter State */
          <div className="h-[420px] rounded-2xl border border-dashed border-border/80 flex flex-col items-center justify-center p-8 text-center bg-card/20">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 text-muted-foreground flex items-center justify-center mb-3">
              {activeFiltersCount > 0 ? (
                <SlidersHorizontal className="h-8 w-8 stroke-[1.5] text-emerald-600" />
              ) : (
                <Folder className="h-8 w-8 stroke-[1.5]" />
              )}
            </div>
            <h3 className="text-base font-bold text-foreground">
              {activeFiltersCount > 0
                ? "No matching items for selected filters"
                : searchQuery
                ? "No matching files or folders"
                : "This folder is empty"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">
              {activeFiltersCount > 0
                ? "No assets match your active filter criteria. Try selecting different filter options or reset filters."
                : searchQuery
                ? `No items found matching "${searchQuery}". Try a different keyword.`
                : "Drag & drop files here, or use the buttons below to create nested folders and upload assets."}
            </p>
            {activeFiltersCount > 0 || searchQuery ? (
              <div className="flex items-center gap-2.5">
                {activeFiltersCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResetFilters}
                    className="rounded-xl text-xs h-9 gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Filters</span>
                  </Button>
                )}
                {searchQuery && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSearchQuery("")}
                    className="rounded-xl text-xs h-9 gap-1.5 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Clear Search</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={() => setIsCreateFolderOpen(true)}
                  className="rounded-xl text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  <span>Create Subfolder</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl text-xs h-9 gap-1.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 border-none shadow-xs transition-all duration-150 cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5 text-white dark:text-black" />
                  <span>Upload Files</span>
                </Button>
              </div>
            )}
          </div>
        ) : viewMode === "list" ? (
          /* ── LIST VIEW (Windows Explorer Table) ─────────────────────── */
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-muted/40 text-xs">
                <TableRow className="border-b border-border/80 hover:bg-transparent">
                  <TableHead
                    onClick={() => toggleSort("name")}
                    className="cursor-pointer font-bold text-foreground select-none w-[45%]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Name</span>
                      <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort("type")}
                    className="cursor-pointer font-bold text-foreground select-none w-[15%]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Type</span>
                      <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-foreground select-none w-[15%]">
                    Size / Count
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort("updatedAt")}
                    className="cursor-pointer font-bold text-foreground select-none w-[15%]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date Modified</span>
                      <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[10%] text-right font-bold text-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs divide-y divide-border/60">
                {/* 1. Folders Rows */}
                {filteredFolders.map((folder) => {
                  const stats = graphicsLibraryV2Service.getFolderStats(folder.id)
                  return (
                    <TableRow
                      key={folder.id}
                      onDoubleClick={() => setCurrentFolderId(folder.id)}
                      className="group hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      {/* Name + Icon */}
                      <TableCell
                        onClick={() => setCurrentFolderId(folder.id)}
                        className="py-3 font-semibold text-foreground"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs",
                              folder.color?.toLowerCase() === "#ffffff"
                                ? "bg-white text-neutral-800 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                                : ""
                            )}
                            style={
                              folder.color?.toLowerCase() !== "#ffffff"
                                ? {
                                    backgroundColor: `${folder.color || "#2563eb"}15`,
                                    color: folder.color || "#2563eb",
                                  }
                                : undefined
                            }
                          >
                            <Folder className="h-4 w-4 fill-current opacity-90" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="truncate block group-hover:text-primary transition-colors">
                              {folder.name}
                            </span>
                            {filters.scope === "all" && folder.parentId && (
                              <span className="text-[10px] text-muted-foreground font-normal block truncate">
                                inside {graphicsLibraryV2Service.getFolderById(folder.parentId)?.name || "Root"}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Type */}
                      <TableCell onClick={() => setCurrentFolderId(folder.id)} className="text-muted-foreground">
                        <span className="text-xs text-muted-foreground font-medium">Folder</span>
                      </TableCell>

                      {/* Items Count */}
                      <TableCell onClick={() => setCurrentFolderId(folder.id)} className="text-muted-foreground">
                        {stats.subfolderCount + stats.fileCount === 0
                          ? "Empty"
                          : `${stats.subfolderCount} folders, ${stats.fileCount} files`}
                      </TableCell>

                      {/* Date */}
                      <TableCell onClick={() => setCurrentFolderId(folder.id)} className="text-muted-foreground">
                        {graphicsLibraryV2Service.formatDate(folder.updatedAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <button className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          } />
                          <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl p-1.5 text-xs">
                            <DropdownMenuItem
                              onClick={() => setCurrentFolderId(folder.id)}
                              className="p-2 rounded-lg cursor-pointer"
                            >
                              <Folder className="h-3.5 w-3.5 mr-2 text-primary" />
                              <span>Open Folder</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setRenameItem({
                                  id: folder.id,
                                  name: folder.name,
                                  type: "folder",
                                })
                              }
                              className="p-2 rounded-lg cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5 mr-2" />
                              <span>Rename Folder</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem
                              onClick={() =>
                                setDeleteItem({
                                  id: folder.id,
                                  name: folder.name,
                                  type: "folder",
                                })
                              }
                              className="p-2 rounded-lg cursor-pointer text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              <span>Delete Folder</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}

                {/* 2. Files Rows */}
                {filteredFiles.map((file) => (
                  <TableRow
                    key={file.id}
                    onDoubleClick={() => setPreviewFile(file)}
                    className="group hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    {/* Name + Icon */}
                    <TableCell
                      onClick={() => setPreviewFile(file)}
                      className="py-3 font-medium text-foreground"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          {["PNG", "JPG", "SVG"].includes(file.format.toUpperCase()) ? (
                            <ImageIcon className="h-4 w-4 text-emerald-600" />
                          ) : file.format.toUpperCase() === "PDF" ? (
                            <FileText className="h-4 w-4 text-red-500" />
                          ) : (
                            <FileCode className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="truncate block group-hover:text-primary transition-colors">
                            {file.name}
                          </span>
                          {filters.scope === "all" && (
                            <span className="text-[10px] text-muted-foreground font-normal block truncate">
                              📁 {graphicsLibraryV2Service.getFolderById(file.folderId)?.name || "Root Directory"}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Type Badge */}
                    <TableCell onClick={() => setPreviewFile(file)}>
                      {renderFormatBadge(file.format)}
                    </TableCell>

                    {/* Size */}
                    <TableCell onClick={() => setPreviewFile(file)} className="text-muted-foreground">
                      {file.fileSize}
                    </TableCell>

                    {/* Date */}
                    <TableCell onClick={() => setPreviewFile(file)} className="text-muted-foreground">
                      {graphicsLibraryV2Service.formatDate(file.updatedAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => graphicsLibraryV2Service.downloadFile(file)}
                          className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Download File"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          } />
                          <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl p-1.5 text-xs">
                            <DropdownMenuItem
                              onClick={() => setPreviewFile(file)}
                              className="p-2 rounded-lg cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5 mr-2 text-primary" />
                              <span>Preview Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => graphicsLibraryV2Service.downloadFile(file)}
                              className="p-2 rounded-lg cursor-pointer"
                            >
                              <Download className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                              <span>Download</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setRenameItem({
                                  id: file.id,
                                  name: file.name,
                                  type: "file",
                                })
                              }
                              className="p-2 rounded-lg cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5 mr-2" />
                              <span>Rename File</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem
                              onClick={() =>
                                setDeleteItem({
                                  id: file.id,
                                  name: file.name,
                                  type: "file",
                                })
                              }
                              className="p-2 rounded-lg cursor-pointer text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              <span>Delete File</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          /* ── GRID VIEW (Google Drive Style) ────────────────────────── */
          <div className="space-y-6">
            {/* Folders Section */}
            {filteredFolders.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Folders ({filteredFolders.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFolders.map((folder) => {
                    const stats = graphicsLibraryV2Service.getFolderStats(folder.id)
                    return (
                      <div
                        key={folder.id}
                        onDoubleClick={() => setCurrentFolderId(folder.id)}
                        className="group flex items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-card hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer select-none"
                      >
                        <div
                          onClick={() => setCurrentFolderId(folder.id)}
                          className="flex items-center gap-3 min-w-0 flex-1"
                        >
                          <div
                            className={cn(
                              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
                              folder.color?.toLowerCase() === "#ffffff"
                                ? "bg-white text-neutral-800 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                                : ""
                            )}
                            style={
                              folder.color?.toLowerCase() !== "#ffffff"
                                ? {
                                    backgroundColor: `${folder.color || "#2563eb"}15`,
                                    color: folder.color || "#2563eb",
                                  }
                                : undefined
                            }
                          >
                            <Folder className="h-5 w-5 fill-current opacity-90" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {folder.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                              {stats.subfolderCount + stats.fileCount} items
                              {filters.scope === "all" && folder.parentId && (
                                <span className="block text-[9px] text-primary/80 truncate font-medium">
                                  in {graphicsLibraryV2Service.getFolderById(folder.parentId)?.name || "Root"}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <button className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          } />
                          <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl p-1.5 text-xs">
                            <DropdownMenuItem
                              onClick={() => setCurrentFolderId(folder.id)}
                              className="p-2 rounded-lg cursor-pointer"
                            >
                              <Folder className="h-3.5 w-3.5 mr-2 text-primary" />
                              <span>Open Folder</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setRenameItem({
                                  id: folder.id,
                                  name: folder.name,
                                  type: "folder",
                                })
                              }
                              className="p-2 rounded-lg cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5 mr-2" />
                              <span>Rename</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem
                              onClick={() =>
                                setDeleteItem({
                                  id: folder.id,
                                  name: folder.name,
                                  type: "folder",
                                })
                              }
                              className="p-2 rounded-lg cursor-pointer text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Files Section */}
            {filteredFiles.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Files ({filteredFiles.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFiles.map((file) => {
                    const imgSrc = file.thumbnail || file.fileData
                    const isImage =
                      ["PNG", "JPG", "SVG"].includes(file.format.toUpperCase()) &&
                      imgSrc &&
                      (imgSrc.startsWith("data:image") ||
                        imgSrc.startsWith("blob:") ||
                        imgSrc.startsWith("/") ||
                        imgSrc.startsWith("http"))

                    return (
                      <div
                        key={file.id}
                        onDoubleClick={() => setPreviewFile(file)}
                        className="group flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer"
                      >
                        {/* Preview Thumbnail */}
                        <div
                          onClick={() => setPreviewFile(file)}
                          className="h-32 w-full bg-muted/30 border-b border-border/60 flex items-center justify-center p-3 relative overflow-hidden"
                        >
                          {isImage ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={imgSrc}
                              alt={file.name}
                              className="max-h-full max-w-full object-contain rounded transition-transform duration-200 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                              {file.format}
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            {renderFormatBadge(file.format)}
                          </div>
                        </div>

                        {/* File Details */}
                        <div className="p-3.5 flex items-center justify-between gap-2">
                          <div onClick={() => setPreviewFile(file)} className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                              {file.fileSize} • {graphicsLibraryV2Service.formatDate(file.updatedAt)}
                              {filters.scope === "all" && (
                                <span className="block text-[9px] text-primary/80 truncate font-medium mt-0.5">
                                  📁 {graphicsLibraryV2Service.getFolderById(file.folderId)?.name || "Root Directory"}
                                </span>
                              )}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => graphicsLibraryV2Service.downloadFile(file)}
                            className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODALS & DIALOGS ───────────────────────────────────────────── */}
      <CreateFolderDialog
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        currentFolderName={currentFolder?.name}
        onCreate={handleCreateFolder}
      />

      <RenameDialog
        open={!!renameItem}
        onOpenChange={(open) => !open && setRenameItem(null)}
        itemType={renameItem?.type || "folder"}
        currentName={renameItem?.name || ""}
        onRename={handleRenameConfirm}
      />

      <DeleteDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        itemType={deleteItem?.type || "folder"}
        itemName={deleteItem?.name || ""}
        onConfirm={handleDeleteConfirm}
      />

      <FilePreviewDialog
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
      />

      {/* ── INTERACTIVE BOTTOM-RIGHT UPLOAD WIDGET ─────────────────────── */}
      <UploadProgressWidget
        isOpen={uploadBatch.isOpen}
        items={uploadBatch.items}
        overallProgress={uploadBatch.overallProgress}
        onClose={() => setUploadBatch((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
