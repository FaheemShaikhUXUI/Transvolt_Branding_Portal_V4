"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  PauseCircle,
  PlayCircle,
  Layers,
  FileCode,
  FileImage,
  FolderArchive,
  AlertCircle,
  Clock,
  Calendar,
  Check,
  X,
  Filter,
} from "lucide-react"

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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  GraphicCategory,
  GraphicFile,
} from "@/lib/graphics-repository/types"
import {
  graphicsService,
  formatGraphicDate,
} from "@/lib/graphics-repository/graphics-service"
import { GraphicsFormatBadge } from "./graphics-format-badge"
import { AddCategoryModal } from "./add-category-modal"
import { ReplaceFileDialog } from "./replace-file-dialog"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { cn } from "@/lib/utils"

export function GraphicsLibraryPage() {
  const [categories, setCategories] = React.useState<GraphicCategory[]>([])
  const [files, setFiles] = React.useState<GraphicFile[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({})

  // Filter & Sort State: 1. Recently Added (Default), 2. A-Z, 3. Search By Date
  type FilterSortMode = "recently-added" | "alphabetical" | "by-date"
  const [sortMode, setSortMode] = React.useState<FilterSortMode>("recently-added")
  const [filterDate, setFilterDate] = React.useState<string>("")

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [targetCategoryIdForAdd, setTargetCategoryIdForAdd] = React.useState<string | undefined>(undefined)

  const [replacingFile, setReplacingFile] = React.useState<GraphicFile | null>(null)
  const [isReplaceModalOpen, setIsReplaceModalOpen] = React.useState(false)

  const [deletingFile, setDeletingFile] = React.useState<GraphicFile | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)

  const [deletingCategory, setDeletingCategory] = React.useState<GraphicCategory | null>(null)
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = React.useState(false)

  // Load data on mount (categories remain closed by default)
  const refreshData = React.useCallback(() => {
    const loadedCategories = graphicsService.getCategories()
    const loadedFiles = graphicsService.getFiles()
    setCategories(loadedCategories)
    setFiles(loadedFiles)
  }, [])

  React.useEffect(() => {
    refreshData()
  }, [refreshData])

  // Toggle category collapse/expand
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  // Check if all categories are expanded
  const areAllExpanded =
    categories.length > 0 &&
    categories.every((cat) => !!expandedCategories[cat.id])

  // Expand all or collapse all toggle
  const toggleExpandAll = () => {
    if (areAllExpanded) {
      setExpandedCategories({})
    } else {
      const all: Record<string, boolean> = {}
      categories.forEach((cat) => {
        all[cat.id] = true
      })
      setExpandedCategories(all)
    }
  }

  // Quick action: Hold / Release Hold
  const handleToggleHold = (file: GraphicFile) => {
    try {
      const updated = graphicsService.toggleHold(file.id)
      refreshData()
      if (updated.status === "hold") {
        toast.warning(`"${file.name}" placed On Hold.`)
      } else {
        toast.success(`"${file.name}" released from Hold and is now Active.`)
      }
    } catch {
      toast.error("Failed to update status.")
    }
  }

  // Delete file confirm
  const handleConfirmDeleteFile = () => {
    if (!deletingFile) return
    try {
      graphicsService.deleteFile(deletingFile.id)
      refreshData()
      toast.error(`"${deletingFile.name}" permanently deleted.`)
      setIsDeleteModalOpen(false)
      setDeletingFile(null)
    } catch {
      toast.error("Failed to delete file.")
    }
  }

  // Delete category confirm
  const handleConfirmDeleteCategory = () => {
    if (!deletingCategory) return
    try {
      graphicsService.deleteCategory(deletingCategory.id)
      refreshData()
      toast.error(`Category "${deletingCategory.name}" and its files were deleted.`)
      setIsDeleteCategoryModalOpen(false)
      setDeletingCategory(null)
    } catch {
      toast.error("Failed to delete category.")
    }
  }

  // Open Add Category Modal optionally with preselected category
  const openAddCategoryModal = (catId?: string) => {
    setTargetCategoryIdForAdd(catId)
    setIsAddModalOpen(true)
  }

  // Helper to extract YYYY-MM-DD from ISO or date string
  const matchesTargetDate = (dateStr: string, targetYMD: string): boolean => {
    if (!dateStr || !targetYMD) return false
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return false
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      return `${y}-${m}-${day}` === targetYMD
    } catch {
      return false
    }
  }

  // Get timestamp for sorting recently added
  const getCategoryLatestTimestamp = (cat: GraphicCategory, catFiles: GraphicFile[]): number => {
    let latest = new Date(cat.createdAt).getTime()
    if (isNaN(latest)) latest = 0
    if (cat.updatedAt) {
      const up = new Date(cat.updatedAt).getTime()
      if (!isNaN(up) && up > latest) latest = up
    }
    catFiles.forEach((f) => {
      const ft = new Date(f.uploadedAt).getTime()
      if (!isNaN(ft) && ft > latest) latest = ft
    })
    return latest
  }

  // Auto-expand categories when a date filter is applied in "Search By Date" mode
  React.useEffect(() => {
    if (filterDate && sortMode === "by-date") {
      const matchingCatIds: Record<string, boolean> = {}
      categories.forEach((cat) => {
        const catFiles = files.filter((f) => f.categoryId === cat.id)
        const hasMatch =
          catFiles.some((f) => matchesTargetDate(f.uploadedAt, filterDate)) ||
          matchesTargetDate(cat.createdAt, filterDate)
        if (hasMatch) {
          matchingCatIds[cat.id] = true
        }
      })
      setExpandedCategories((prev) => ({ ...prev, ...matchingCatIds }))
    }
  }, [filterDate, sortMode, categories, files])

  // Filtered categories and files according to search query, date filter, and sort mode
  const filteredCategoriesWithFiles = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    // 1. Filter categories and files by search query and date
    let list = categories.map((cat) => {
      let catFiles = files.filter((f) => f.categoryId === cat.id)

      // Text search query filter
      if (q) {
        const catMatches = cat.name.toLowerCase().includes(q)
        const matchingFiles = catFiles.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.originalFileName.toLowerCase().includes(q) ||
            f.format.toLowerCase().includes(q)
        )
        catFiles = catMatches ? catFiles : matchingFiles
      }

      // Date search filter (when sortMode === "by-date" and a date is selected)
      if (sortMode === "by-date" && filterDate) {
        const catDateMatches = matchesTargetDate(cat.createdAt, filterDate)
        const matchingFiles = catFiles.filter((f) =>
          matchesTargetDate(f.uploadedAt, filterDate)
        )
        catFiles = catDateMatches ? catFiles : matchingFiles
      }

      // Has match check
      const hasMatch =
        (!q && (!filterDate || sortMode !== "by-date")) ||
        catFiles.length > 0 ||
        (q && cat.name.toLowerCase().includes(q)) ||
        (sortMode === "by-date" && filterDate && matchesTargetDate(cat.createdAt, filterDate))

      return {
        category: cat,
        files: catFiles,
        hasMatch,
      }
    }).filter((item) => item.hasMatch)

    // 2. Sort categories & files according to filter/sort option
    if (sortMode === "recently-added") {
      // 1. Recently Added On Top (Default)
      list.sort((a, b) => {
        const timeA = getCategoryLatestTimestamp(a.category, a.files)
        const timeB = getCategoryLatestTimestamp(b.category, b.files)
        return timeB - timeA
      })
      list.forEach((item) => {
        item.files.sort((fa, fb) => {
          const tA = new Date(fa.uploadedAt).getTime() || 0
          const tB = new Date(fb.uploadedAt).getTime() || 0
          return tB - tA
        })
      })
    } else if (sortMode === "alphabetical") {
      // 2. A-Z
      list.sort((a, b) => a.category.name.localeCompare(b.category.name))
      list.forEach((item) => {
        item.files.sort((fa, fb) => fa.name.localeCompare(fb.name))
      })
    } else if (sortMode === "by-date") {
      // 3. Search By Date (newest date first)
      list.sort((a, b) => {
        const timeA = new Date(a.category.createdAt).getTime() || 0
        const timeB = new Date(b.category.createdAt).getTime() || 0
        return timeB - timeA
      })
      list.forEach((item) => {
        item.files.sort((fa, fb) => {
          const tA = new Date(fa.uploadedAt).getTime() || 0
          const tB = new Date(fb.uploadedAt).getTime() || 0
          return tB - tA
        })
      })
    }

    return list
  }, [categories, files, searchQuery, sortMode, filterDate])

  // Total count of all files
  const totalFilesCount = files.length
  const totalCategoriesCount = categories.length

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 pb-12 w-full">
      {/* 1. Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border/60 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#4472C4]/10 text-[#4472C4] shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#4472C4]">
              Graphics Library
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Centralised library for storing and managing approved Transvolt graphics and creative files.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 pt-1 sm:pt-0">
          <Button
            onClick={() => openAddCategoryModal()}
            className="h-11 px-5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      {/* 2. Search & Filter Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search graphics, categories, or formats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-border/80 focus-visible:ring-[#4472C4] bg-card"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-2 h-9 px-3 rounded-xl border text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95 select-none shrink-0",
                    sortMode !== "recently-added" || filterDate
                      ? "border-[#4472C4]/60 bg-[#4472C4]/10 text-[#4472C4]"
                      : "border-border/80 bg-card hover:bg-muted/60 text-foreground"
                  )}
                >
                  <Filter className="h-3.5 w-3.5 text-[#4472C4]" />
                  <span>
                    {sortMode === "recently-added" && !filterDate
                      ? "Recently Added"
                      : sortMode === "alphabetical"
                      ? "A-Z"
                      : filterDate
                      ? `Date: ${formatGraphicDate(filterDate)}`
                      : "Search By Date"}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                </button>
              }
            />
            <DropdownMenuContent align="start" className="w-64 rounded-xl p-1.5 shadow-xl text-xs space-y-1">
              <div className="px-2 py-1 text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider">
                Filter & Sort
              </div>

              {/* 1. Recently Added On Top (Default) */}
              <DropdownMenuItem
                onClick={() => {
                  setSortMode("recently-added")
                  setFilterDate("")
                }}
                className={cn(
                  "flex items-center justify-between py-2 px-2.5 rounded-lg cursor-pointer",
                  sortMode === "recently-added" && !filterDate && "bg-[#4472C4]/10 text-[#4472C4] font-bold"
                )}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#4472C4]" />
                  <span>1. Recently Added On Top</span>
                </div>
                <span className="text-[9.5px] uppercase font-bold text-[#4472C4] bg-[#4472C4]/15 px-1.5 py-0.5 rounded border border-[#4472C4]/30">
                  Default
                </span>
              </DropdownMenuItem>

              {/* 2. A-Z */}
              <DropdownMenuItem
                onClick={() => {
                  setSortMode("alphabetical")
                  setFilterDate("")
                }}
                className={cn(
                  "flex items-center justify-between py-2 px-2.5 rounded-lg cursor-pointer",
                  sortMode === "alphabetical" && "bg-[#4472C4]/10 text-[#4472C4] font-bold"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#4472C4] px-1 rounded bg-[#4472C4]/15">A-Z</span>
                  <span>2. A-Z</span>
                </div>
                {sortMode === "alphabetical" && <Check className="h-3.5 w-3.5 text-[#4472C4]" />}
              </DropdownMenuItem>

              {/* 3. Search By Date */}
              <DropdownMenuItem
                onClick={() => {
                  setSortMode("by-date")
                }}
                className={cn(
                  "flex items-center justify-between py-2 px-2.5 rounded-lg cursor-pointer",
                  sortMode === "by-date" && "bg-[#4472C4]/10 text-[#4472C4] font-bold"
                )}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[#4472C4]" />
                  <span>3. Search By Date</span>
                </div>
                {sortMode === "by-date" && <Check className="h-3.5 w-3.5 text-[#4472C4]" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search by Date Picker Component (Appears when Search by Date is selected) */}
          {sortMode === "by-date" && (
            <div className="flex items-center gap-1.5 px-2.5 h-9 rounded-xl border border-[#4472C4]/40 bg-[#4472C4]/5 shadow-2xs animate-in fade-in-50 duration-200 shrink-0">
              <Calendar className="h-3.5 w-3.5 text-[#4472C4]" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent text-xs text-foreground focus:outline-hidden cursor-pointer"
                title="Select date to filter"
              />
              {filterDate && (
                <button
                  type="button"
                  onClick={() => setFilterDate("")}
                  className="text-muted-foreground hover:text-foreground text-xs p-0.5 cursor-pointer rounded"
                  title="Clear date"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* Active filter reset link */}
          {(filterDate || sortMode !== "recently-added" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSortMode("recently-added")
                setFilterDate("")
                setSearchQuery("")
              }}
              className="text-[11px] text-muted-foreground hover:text-[#4472C4] hover:underline cursor-pointer transition-colors px-1 whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Action Controls & Item Counts */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end text-xs text-muted-foreground font-medium shrink-0">
          {categories.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleExpandAll}
              className="h-8 px-2.5 text-xs rounded-xl border-border/80 text-muted-foreground hover:text-[#4472C4] hover:border-[#4472C4]/40 hover:bg-[#4472C4]/5 gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs font-semibold"
              title={areAllExpanded ? "Collapse all categories" : "Expand all categories"}
            >
              {areAllExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5 text-[#4472C4]" />
                  <span>Collapse All</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5 text-[#4472C4]" />
                  <span>Expand All</span>
                </>
              )}
            </Button>
          )}
          <span className="px-2.5 py-1 rounded-lg bg-muted/60 border border-border/60">
            {totalCategoriesCount} {totalCategoriesCount === 1 ? "Category" : "Categories"}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-muted/60 border border-border/60">
            {totalFilesCount} {totalFilesCount === 1 ? "Creative File" : "Creative Files"}
          </span>
        </div>
      </div>

      {/* 3. Main Graphics List / Table */}
      {categories.length === 0 ? (
        /* Empty State */
        <div className="border border-dashed border-border/90 rounded-2xl p-12 bg-card/60 text-center flex flex-col items-center justify-center my-6 shadow-xs">
          <div className="h-16 w-16 rounded-full bg-[#4472C4]/10 text-[#4472C4] flex items-center justify-center mb-4">
            <FolderArchive className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">No Graphics Available</h2>
          <p className="text-sm text-muted-foreground max-w-md mt-1.5 mb-6 leading-relaxed">
            Start building your Graphics Library by adding a category and uploading approved creative files.
          </p>
          <Button
            onClick={() => openAddCategoryModal()}
            className="h-11 px-5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
            <span>Add Category</span>
          </Button>
        </div>
      ) : filteredCategoriesWithFiles.length === 0 ? (
        /* Search / Filter Not Found State */
        <div className="border border-border/80 rounded-2xl p-12 bg-card text-center flex flex-col items-center justify-center my-4 shadow-xs">
          <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-bold text-foreground">No matching graphics or categories</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            {filterDate
              ? `No graphics or categories match the date "${formatGraphicDate(filterDate)}".`
              : `No items matched your search query "${searchQuery}".`}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("")
              setFilterDate("")
              setSortMode("recently-added")
            }}
            className="rounded-xl text-xs font-semibold cursor-pointer"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        /* Expandable Categories List with space between each category */
        <div className="w-full space-y-3.5">
          {/* Main List Column Headers Bar */}
          <div className="hidden sm:grid grid-cols-[80px_1fr_140px_110px] items-center px-5 py-2.5 rounded-xl bg-muted/40 border border-border/70 text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider select-none">
            <div className="text-center">Sr. No.</div>
            <div className="pl-2">Category Name</div>
            <div className="text-center">No. of Files</div>
            <div className="text-center">Action</div>
          </div>

          {/* Categories List */}
          <div className="space-y-3">
            {filteredCategoriesWithFiles.map(({ category, files: catFiles }, catIdx) => {
              const isExpanded = !!expandedCategories[category.id]
              const srNo = String(catIdx + 1).padStart(2, "0")

              return (
                <div
                  key={category.id}
                  className={cn(
                    "rounded-xl border transition-all duration-300 overflow-hidden bg-card",
                    isExpanded
                      ? "border-[#548235]/50 shadow-sm ring-1 ring-[#548235]/20"
                      : "border-[#CDE3FC] dark:border-[#1c385c] shadow-2xs hover:border-[#4472C4]/35 hover:shadow-xs"
                  )}
                >
                  {/* Category Row with dynamic interactive feedback */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() => toggleCategory(category.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        toggleCategory(category.id)
                      }
                    }}
                    className={cn(
                      "grid grid-cols-1 sm:grid-cols-[80px_1fr_140px_110px] items-center gap-2 sm:gap-0 px-4 sm:px-0 py-3.5 sm:py-3 cursor-pointer select-none transition-all duration-200 group active:scale-[0.997]",
                      isExpanded
                        ? "bg-[#EEF7E9] hover:bg-[#E5F2DC] dark:bg-[#0f230d] dark:hover:bg-[#153112]"
                        : "bg-[#F0F7FF] hover:bg-[#E3F0FF] dark:bg-[#0c1f36] dark:hover:bg-[#122c4d]"
                    )}
                  >
                    {/* 1. Sr. No. with interactive animated circular chevron button */}
                    <div className="flex items-center sm:justify-center gap-2.5 px-3">
                      <div
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                          isExpanded
                            ? "bg-[#548235] text-white shadow-xs rotate-90 scale-105"
                            : "bg-[#4472C4]/10 text-[#4472C4] group-hover:bg-[#4472C4]/20 group-hover:scale-110"
                        )}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                      <span
                        className={cn(
                          "font-mono text-xs font-bold transition-colors",
                          isExpanded ? "text-[#548235]" : "text-foreground"
                        )}
                      >
                        {srNo}
                      </span>
                    </div>

                    {/* 2. Category Name & description */}
                    <div className="flex flex-col min-w-0 px-3 sm:px-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-bold text-sm transition-all duration-200 truncate group-hover:translate-x-0.5",
                            isExpanded ? "text-[#385723] dark:text-[#88cb62]" : "text-foreground group-hover:text-[#4472C4]"
                          )}
                        >
                          {category.name}
                        </span>
                        {isExpanded && (
                          <span className="hidden sm:inline-flex text-[9.5px] uppercase font-bold tracking-wider text-[#548235] bg-white/90 dark:bg-card/90 px-2 py-0.5 rounded-full border border-[#548235]/30 shadow-2xs">
                            Expanded
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {category.description}
                        </span>
                      )}
                    </div>

                    {/* 3. No. of Files Badge */}
                    <div className="flex sm:justify-center px-3 sm:px-0">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-bold border transition-all duration-200 select-none group-hover:scale-105",
                          catFiles.length > 0
                            ? isExpanded
                              ? "bg-[#548235] text-white border-[#548235] shadow-2xs"
                              : "bg-[#4472C4]/10 text-[#4472C4] border-[#4472C4]/30"
                            : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {catFiles.length} {catFiles.length === 1 ? "File" : "Files"}
                      </span>
                    </div>

                    {/* 4. Action: Add File (+) Button & Delete Button */}
                    <div
                      className="flex items-center sm:justify-center gap-1.5 px-3 sm:px-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Plus Button */}
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <button
                              type="button"
                              onClick={() => openAddCategoryModal(category.id)}
                              className={cn(
                                "inline-flex items-center justify-center h-8 w-8 rounded-lg transition-all shadow-2xs active:scale-90 cursor-pointer",
                                isExpanded
                                  ? "border border-[#548235]/35 bg-white dark:bg-card hover:bg-[#548235] hover:text-white text-[#548235]"
                                  : "border border-[#CDE3FC] dark:border-[#1c385c] bg-white dark:bg-card hover:bg-[#4472C4] hover:text-white text-[#4472C4]"
                              )}
                            />
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <span className="text-xs">Add files to {category.name}</span>
                        </TooltipContent>
                      </Tooltip>

                      {/* Delete Button on Category Header right side of Plus button */}
                      {catFiles.length === 0 ? (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingCategory(category)
                                  setIsDeleteCategoryModalOpen(true)
                                }}
                                className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 transition-all shadow-2xs active:scale-90 cursor-pointer"
                              />
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <span className="text-xs">Delete Empty Category</span>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <button
                                type="button"
                                className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-[#CDE3FC] dark:border-[#1c385c] bg-white dark:bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-2xs cursor-pointer"
                              />
                            }
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Category Options</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5">
                            <DropdownMenuItem
                              onClick={() => openAddCategoryModal(category.id)}
                              className="gap-2 text-xs font-medium cursor-pointer rounded-lg py-1.5"
                            >
                              <Plus className="h-3.5 w-3.5 text-[#4472C4]" />
                              Add Files to Category
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem
                              onClick={() => {
                                setDeletingCategory(category)
                                setIsDeleteCategoryModalOpen(true)
                              }}
                              className="gap-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-500/10 cursor-pointer rounded-lg py-1.5"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete Full Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  {/* Smooth Animated Accordion Body */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: isExpanded ? "1fr" : "0fr",
                      transition: "grid-template-rows 320ms cubic-bezier(0.16, 1, 0.3, 1), opacity 280ms cubic-bezier(0.16, 1, 0.3, 1)",
                      opacity: isExpanded ? 1 : 0,
                      pointerEvents: isExpanded ? "auto" : "none",
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className={cn(
                        "border-t bg-card transition-colors duration-300",
                        isExpanded ? "border-[#548235]/30 dark:border-[#2f551c]" : "border-[#CDE3FC]/80 dark:border-[#1c385c]"
                      )}>
                      {catFiles.length === 0 ? (
                        <div className="py-7 px-6 text-center flex flex-col items-center justify-center">
                          <p className="text-xs text-muted-foreground font-medium">
                            No graphics uploaded in this category yet.
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAddCategoryModal(category.id)}
                              className="text-xs rounded-lg text-[#4472C4] border-[#4472C4]/30 hover:bg-[#4472C4]/10 gap-1.5 cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Upload First File
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDeletingCategory(category)
                                setIsDeleteCategoryModalOpen(true)
                              }}
                              className="text-xs rounded-lg text-red-600 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete Category
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-muted/30 text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40 select-none">
                                <th className="py-2.5 px-6 w-20 text-center">Sr. No.</th>
                                <th className="py-2.5 px-4 min-w-[240px]">Graphics Name</th>
                                <th className="py-2.5 px-4 w-40">Uploaded Date</th>
                                <th className="py-2.5 px-4 w-36 text-center">Available Format</th>
                                <th className="py-2.5 px-4 w-20 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 text-xs">
                              {catFiles.map((file, fileIdx) => {
                                const fileSrNo = String(fileIdx + 1).padStart(2, "0")
                                const isOnHold = file.status === "hold"

                                return (
                                  <tr
                                    key={file.id}
                                    className={cn(
                                      "transition-colors",
                                      isOnHold
                                        ? "bg-amber-500/5 hover:bg-amber-500/10"
                                        : "hover:bg-muted/30"
                                    )}
                                  >
                                    {/* File Sr. No. */}
                                    <td className="py-3 px-6 text-center font-mono text-[11px] font-semibold text-muted-foreground/70">
                                      {fileSrNo}
                                    </td>

                                    {/* Graphics Name */}
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2.5">
                                        <div
                                          className={cn(
                                            "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border",
                                            isOnHold
                                              ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
                                              : "bg-muted/60 border-border text-foreground"
                                          )}
                                        >
                                          {["JPG", "PNG", "SVG"].includes(file.format) ? (
                                            <FileImage className="h-3.5 w-3.5" />
                                          ) : (
                                            <FileCode className="h-3.5 w-3.5" />
                                          )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span
                                              className={cn(
                                                "font-semibold text-xs truncate max-w-xs sm:max-w-md",
                                                isOnHold
                                                  ? "text-muted-foreground line-through decoration-amber-500/60"
                                                  : "text-foreground"
                                              )}
                                              title={file.name}
                                            >
                                              {file.name}
                                            </span>

                                            {/* On Hold Status Tag */}
                                            {isOnHold && (
                                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[9.5px] font-bold text-amber-700 dark:text-amber-400 select-none">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                On Hold
                                              </span>
                                            )}

                                            {/* Version badge if versioned */}
                                            {file.version && file.version !== "v1.0" && (
                                              <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border">
                                                {file.version}
                                              </span>
                                            )}
                                          </div>

                                          <span className="text-[10px] text-muted-foreground mt-0.5">
                                            {file.originalFileName} • {file.fileSize || "1.0 MB"}
                                          </span>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Uploaded Date */}
                                    <td className="py-3 px-4 text-muted-foreground text-xs font-medium">
                                      {formatGraphicDate(file.uploadedAt)}
                                    </td>

                                    {/* Available File Format Badge */}
                                    <td className="py-3 px-4 text-center">
                                      <GraphicsFormatBadge format={file.format} />
                                    </td>

                                    {/* Three-Dot Action Menu */}
                                    <td className="py-3 px-4 text-center">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger
                                          render={
                                            <button
                                              type="button"
                                              className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                            />
                                          }
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                          <span className="sr-only">Actions</span>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40 rounded-xl p-1.5">
                                          {/* Replace */}
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setReplacingFile(file)
                                              setIsReplaceModalOpen(true)
                                            }}
                                            className="gap-2 text-xs font-medium cursor-pointer rounded-lg py-1.5"
                                          >
                                            <RefreshCw className="h-3.5 w-3.5 text-[#4472C4]" />
                                            Replace
                                          </DropdownMenuItem>

                                          {/* Hold / Release Hold */}
                                          <DropdownMenuItem
                                            onClick={() => handleToggleHold(file)}
                                            className="gap-2 text-xs font-medium cursor-pointer rounded-lg py-1.5"
                                          >
                                            {isOnHold ? (
                                              <>
                                                <PlayCircle className="h-3.5 w-3.5 text-emerald-600" />
                                                <span>Release Hold</span>
                                              </>
                                            ) : (
                                              <>
                                                <PauseCircle className="h-3.5 w-3.5 text-amber-600" />
                                                <span>Hold</span>
                                              </>
                                            )}
                                          </DropdownMenuItem>

                                          <DropdownMenuSeparator className="my-1" />

                                          {/* Delete */}
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setDeletingFile(file)
                                              setIsDeleteModalOpen(true)
                                            }}
                                            className="gap-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-500/10 cursor-pointer rounded-lg py-1.5"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Table Summary Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 rounded-xl border border-border/80 bg-muted/20 text-xs text-muted-foreground gap-2 select-none">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                Showing {filteredCategoriesWithFiles.length} of {totalCategoriesCount} categories
              </span>
              <span>•</span>
              <span>{totalFilesCount} total graphics</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  graphicsService.resetToDefault()
                  setExpandedCategories({})
                  setSortMode("recently-added")
                  setFilterDate("")
                  setSearchQuery("")
                  refreshData()
                  toast.success("Reset graphics library to default samples.")
                }}
                className="text-[11px] text-muted-foreground hover:text-[#4472C4] hover:underline cursor-pointer"
              >
                Reset to Default
              </button>
              <span className="text-[11px] font-mono text-muted-foreground/75">
                Transvolt Creative Asset Engine
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Add Category & Upload Files Modal */}
      <AddCategoryModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        categories={categories}
        preselectedCategoryId={targetCategoryIdForAdd}
        onSuccess={(catId) => {
          refreshData()
          setExpandedCategories((prev) => ({ ...prev, [catId]: true }))
        }}
      />

      {/* 5. Replace File Modal */}
      <ReplaceFileDialog
        open={isReplaceModalOpen}
        onOpenChange={setIsReplaceModalOpen}
        file={replacingFile}
        onSuccess={() => refreshData()}
      />

      {/* 6. Delete File Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Graphic File?"
        description="Are you sure you want to delete this graphic file? This action cannot be undone."
        itemName={deletingFile ? `${deletingFile.name} (${deletingFile.format})` : undefined}
        onConfirm={handleConfirmDeleteFile}
      />

      {/* 7. Delete Category Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteCategoryModalOpen}
        onOpenChange={setIsDeleteCategoryModalOpen}
        title={
          deletingCategory && files.filter((f) => f.categoryId === deletingCategory.id).length === 0
            ? "Delete Empty Category?"
            : "Delete Full Category?"
        }
        description={
          deletingCategory && files.filter((f) => f.categoryId === deletingCategory.id).length === 0
            ? "Are you sure you want to delete this empty category? This action cannot be undone."
            : `Are you sure you want to delete this category along with all ${
                deletingCategory
                  ? files.filter((f) => f.categoryId === deletingCategory.id).length
                  : 0
              } creative files inside it? This action cannot be undone.`
        }
        itemName={deletingCategory ? deletingCategory.name : undefined}
        onConfirm={handleConfirmDeleteCategory}
      />
    </div>
  )
}

export const GraphicsRepositoryPage = GraphicsLibraryPage
