"use client"

import * as React from "react"
import { OrgChartPageData } from "@/lib/org-chart/types"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  Copy,
  Trash2,
  Edit2,
  Plus,
  Check,
  Search,
  FileText,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

interface OrgChartDocumentNavigatorProps {
  pages: OrgChartPageData[]
  activePageIndex: number
  onSelectPage: (index: number) => void
  onInsertPageBefore: (index: number) => void
  onInsertPageAfter: (index: number) => void
  onDuplicatePage: (index: number) => void
  onDeletePage: (index: number) => void
  onRenamePage: (index: number, newTitle: string) => void
  onReorderPages?: (newPages: OrgChartPageData[]) => void
}

export function OrgChartDocumentNavigator({
  pages,
  activePageIndex,
  onSelectPage,
  onInsertPageBefore,
  onInsertPageAfter,
  onDuplicatePage,
  onDeletePage,
  onRenamePage,
  onReorderPages,
}: OrgChartDocumentNavigatorProps) {
  const safePages =
    pages && pages.length > 0
      ? pages
      : [{ id: "page-1", pageNumber: 1, title: "Page 1", nodes: [], connections: [], boundaries: [] }]
  const currentIndex = Math.max(0, Math.min(activePageIndex, safePages.length - 1))
  const activePage = safePages[currentIndex] || safePages[0]

  // Inline rename state
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
  const [editingTitle, setEditingTitle] = React.useState<string>("")
  const editInputRef = React.useRef<HTMLInputElement>(null)

  // Quick page jumper popup state
  const [isJumperOpen, setIsJumperOpen] = React.useState(false)
  const [jumperSearch, setJumperSearch] = React.useState("")
  const jumperRef = React.useRef<HTMLDivElement>(null)

  // Context menu state
  const [contextMenu, setContextMenu] = React.useState<{
    x: number
    y: number
    pageIndex: number
  } | null>(null)

  // Delete page confirmation dialog state
  const [pageToDelete, setPageToDelete] = React.useState<{
    index: number
    title: string
  } | null>(null)

  const promptDeletePage = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (safePages.length <= 1) {
      toast.error("Cannot delete the last remaining page in the document.")
      return
    }
    const target = safePages[index]
    setPageToDelete({
      index,
      title: target?.title || `Page ${index + 1}`,
    })
    setContextMenu(null)
  }

  // Drag and drop reordering state
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dropTarget, setDropTarget] = React.useState<{
    index: number
    position: "before" | "after"
  } | null>(null)

  const tabsContainerRef = React.useRef<HTMLDivElement>(null)
  const activeTabRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll active tab into view
  React.useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      })
    }
  }, [currentIndex])

  // Click outside listener for jumper & context menu
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (jumperRef.current && !jumperRef.current.contains(e.target as Node)) {
        setIsJumperOpen(false)
      }
      setContextMenu(null)
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsJumperOpen(false)
        setContextMenu(null)
        setEditingIndex(null)
      }
    }
    window.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Focus rename input on start
  React.useEffect(() => {
    if (editingIndex !== null && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingIndex])

  const handleStartRename = (pageIndex: number, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingIndex(pageIndex)
    setEditingTitle(currentTitle || `Page ${pageIndex + 1}`)
    setContextMenu(null)
  }

  const handleFinishRename = () => {
    if (editingIndex !== null && editingTitle.trim()) {
      onRenamePage(editingIndex, editingTitle.trim())
    }
    setEditingIndex(null)
  }

  const handleKeyDownRename = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFinishRename()
    } else if (e.key === "Escape") {
      setEditingIndex(null)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, pageIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY - 140,
      pageIndex,
    })
  }

  const handleFirstPage = () => {
    if (safePages.length > 0) onSelectPage(0)
  }

  const handlePrevPage = () => {
    if (currentIndex > 0) onSelectPage(currentIndex - 1)
  }

  const handleNextPage = () => {
    if (currentIndex < safePages.length - 1) onSelectPage(currentIndex + 1)
  }

  const handleLastPage = () => {
    if (safePages.length > 0) onSelectPage(safePages.length - 1)
  }

  // Filtered pages for jumper
  const filteredPages = safePages.filter((p, idx) => {
    if (!jumperSearch.trim()) return true
    const term = jumperSearch.toLowerCase()
    const pageTitle = (p.title || `Page ${idx + 1}`).toLowerCase()
    return pageTitle.includes(term) || `page ${idx + 1}`.includes(term) || `${idx + 1}` === term
  })

  return (
    <div
      id="org-chart-document-navigator"
      className="h-8.5 w-full bg-muted/90 dark:bg-[#18181b]/95 backdrop-blur-md border-t border-border/80 flex items-center px-1.5 select-none z-20 shrink-0 font-sans text-xs relative"
    >
      {/* ─── 1. Left Navigation Controls (CorelDRAW Style) ─ */}
      <div className="flex items-center gap-0.5 border-r border-border/70 pr-1.5 shrink-0">
        {/* Insert Page Before [+] (Left Side Plus: adds page before Page 1) */}
        <button
          type="button"
          onClick={() => onInsertPageBefore(0)}
          className="h-6.5 px-1.5 rounded hover:bg-background/80 active:bg-muted text-muted-foreground hover:text-[#2563eb] flex items-center gap-0.5 transition-colors cursor-pointer"
          title="Add Page Before Page 1 (Left Side Plus)"
        >
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-none stroke-currentColor stroke-[1.5]">
              <rect x="2" y="2" width="10" height="12" rx="1" />
              <line x1="1" y1="8" x2="7" y2="8" strokeWidth="2" stroke="#2563eb" />
              <line x1="4" y1="5" x2="4" y2="11" strokeWidth="2" stroke="#2563eb" />
            </svg>
          </div>
        </button>

        {/* First Page |◀ */}
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={handleFirstPage}
          className="h-6.5 w-6 rounded hover:bg-background/80 active:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
          title="First Page"
        >
          <svg viewBox="0 0 16 16" className="w-3 h-3 fill-currentColor">
            <rect x="2" y="3" width="2" height="10" rx="0.5" />
            <polygon points="13,3 5,8 13,13" />
          </svg>
        </button>

        {/* Previous Page ◀ */}
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={handlePrevPage}
          className="h-6.5 w-6 rounded hover:bg-background/80 active:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
          title="Previous Page"
        >
          <svg viewBox="0 0 16 16" className="w-3 h-3 fill-currentColor">
            <polygon points="11,3 4,8 11,13" />
          </svg>
        </button>

        {/* Interactive Page Jumper: "X of Y ▾" */}
        <div className="relative" ref={jumperRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsJumperOpen((prev) => !prev)
              setJumperSearch("")
            }}
            className={cn(
              "px-2 py-0.5 rounded text-[11px] font-mono font-medium text-foreground tracking-tight select-none flex items-center gap-1 hover:bg-background/80 transition-colors cursor-pointer",
              isJumperOpen && "bg-background shadow-xs text-[#2563eb]"
            )}
            title="Click to jump to any page"
          >
            <span className="font-bold text-[#2563eb]">{currentIndex + 1}</span>
            <span className="text-muted-foreground px-0.5">of</span>
            <span>{safePages.length}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5 opacity-70" />
          </button>

          {/* Quick Page Selector Dropdown Popout */}
          {isJumperOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-full left-0 mb-1.5 w-64 rounded-xl bg-card border border-border shadow-2xl p-2 space-y-1.5 text-xs animate-in fade-in zoom-in-95 duration-100 z-50 select-none"
            >
              <div className="flex items-center justify-between pb-1 border-b border-border/60">
                <span className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-[#2563eb]" />
                  Document Pages ({safePages.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onInsertPageAfter(safePages.length - 1)
                    setIsJumperOpen(false)
                  }}
                  className="px-1.5 py-0.5 rounded bg-[#2563eb]/10 hover:bg-[#2563eb]/20 text-[#2563eb] font-semibold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Add Page at End"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </div>

              {/* Search filter if more than 5 pages */}
              {safePages.length > 5 && (
                <div className="relative">
                  <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={jumperSearch}
                    onChange={(e) => setJumperSearch(e.target.value)}
                    placeholder="Search page..."
                    className="w-full h-7 pl-7 pr-2 rounded-lg bg-muted/50 border border-border/60 text-xs focus:outline-hidden focus:border-[#2563eb]"
                    autoFocus
                  />
                </div>
              )}

              {/* Scrollable list of all pages */}
              <div className="max-h-56 overflow-y-auto no-scrollbar space-y-0.5 pt-0.5">
                {filteredPages.map((p, idx) => {
                  const pIdx = safePages.findIndex((item) => item.id === p.id)
                  const isCurrent = pIdx === currentIndex

                  return (
                    <button
                      key={p.id || idx}
                      type="button"
                      onClick={() => {
                        onSelectPage(pIdx)
                        setIsJumperOpen(false)
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left",
                        isCurrent
                          ? "bg-[#2563eb]/15 text-[#2563eb] font-bold border border-[#2563eb]/30"
                          : "hover:bg-muted/70 text-foreground/80 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-muted text-muted-foreground">
                          #{pIdx + 1}
                        </span>
                        <span className="truncate">{p.title || `Page ${pIdx + 1}`}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono shrink-0 ml-2">
                        <span>{p.nodes?.length || 0} nodes</span>
                        {isCurrent && <Check className="h-3.5 w-3.5 text-[#2563eb] ml-0.5" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Next Page ▶ */}
        <button
          type="button"
          disabled={currentIndex === safePages.length - 1}
          onClick={handleNextPage}
          className="h-6.5 w-6 rounded hover:bg-background/80 active:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
          title="Next Page"
        >
          <svg viewBox="0 0 16 16" className="w-3 h-3 fill-currentColor">
            <polygon points="5,3 12,8 5,13" />
          </svg>
        </button>

        {/* Last Page ▶| */}
        <button
          type="button"
          disabled={currentIndex === safePages.length - 1}
          onClick={handleLastPage}
          className="h-6.5 w-6 rounded hover:bg-background/80 active:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
          title="Last Page"
        >
          <svg viewBox="0 0 16 16" className="w-3 h-3 fill-currentColor">
            <polygon points="3,3 11,8 3,13" />
            <rect x="12" y="3" width="2" height="10" rx="0.5" />
          </svg>
        </button>

        {/* Insert Page After [+] (Right Side Plus: adds page after last page) */}
        <button
          type="button"
          onClick={() => onInsertPageAfter(safePages.length - 1)}
          className="h-6.5 px-1.5 rounded hover:bg-background/80 active:bg-muted text-muted-foreground hover:text-[#16a34a] flex items-center gap-0.5 transition-colors cursor-pointer"
          title="Add Page After Last Page (Right Side Plus)"
        >
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-none stroke-currentColor stroke-[1.5]">
              <rect x="4" y="2" width="10" height="12" rx="1" />
              <line x1="9" y1="8" x2="15" y2="8" strokeWidth="2" stroke="#16a34a" />
              <line x1="12" y1="5" x2="12" y2="11" strokeWidth="2" stroke="#16a34a" />
            </svg>
          </div>
        </button>
      </div>

      {/* ─── 2. Center Tabs List (CorelDRAW Style Trapezoid Tabs) ─ */}
      <div
        ref={tabsContainerRef}
        className="flex-1 flex items-end overflow-x-auto no-scrollbar pl-1 h-full scroll-smooth"
      >
        {/* Left Side Plus (+) before active */}
        <button
          type="button"
          onClick={() => onInsertPageBefore(currentIndex)}
          className="h-6 w-6 mr-1 mb-0.5 rounded-full hover:bg-background/80 active:bg-muted text-muted-foreground hover:text-[#2563eb] hover:bg-[#2563eb]/10 flex items-center justify-center transition-colors cursor-pointer shrink-0 z-10"
          title="Add Page Before Current (+)"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {safePages.map((page, index) => {
          const isActive = index === currentIndex
          const isEditing = editingIndex === index
          const isBeingDragged = draggedIndex === index

          return (
            <div
              key={page.id || index}
              ref={isActive ? activeTabRef : undefined}
              draggable={!isEditing}
              onDragStart={(e) => {
                if (isEditing) return
                setDraggedIndex(index)
                e.dataTransfer.effectAllowed = "move"
              }}
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const rect = e.currentTarget.getBoundingClientRect()
                const position = e.clientX < rect.left + rect.width / 2 ? "before" : "after"
                setDropTarget({ index, position })
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (draggedIndex === null || dropTarget === null || draggedIndex === dropTarget.index) {
                  setDraggedIndex(null)
                  setDropTarget(null)
                  return
                }
                const nextPages = [...safePages]
                const [draggedPage] = nextPages.splice(draggedIndex, 1)
                let targetIndex = dropTarget.position === "before" ? dropTarget.index : dropTarget.index + 1
                if (draggedIndex < targetIndex) targetIndex--
                nextPages.splice(targetIndex, 0, draggedPage)
                onReorderPages?.(nextPages)
                setDraggedIndex(null)
                setDropTarget(null)
              }}
              onDragEnd={() => {
                setDraggedIndex(null)
                setDropTarget(null)
              }}
              onClick={() => onSelectPage(index)}
              onDoubleClick={(e) => handleStartRename(index, page.title || `Page ${index + 1}`, e)}
              onContextMenu={(e) => handleContextMenu(e, index)}
              className={cn(
                "relative group h-7 px-4.5 flex items-center justify-center cursor-grab active:cursor-grabbing transition-all -ml-1 text-[11px] shrink-0 select-none",
                isActive
                  ? "bg-background text-foreground font-bold shadow-xs z-10 border-t border-border/80"
                  : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground",
                isBeingDragged && "opacity-40 scale-95 ring-1 ring-dashed ring-[#2563eb]"
              )}
              style={{
                clipPath: "polygon(5px 0%, calc(100% - 5px) 0%, 100% 100%, 0% 100%)",
                minWidth: "75px",
                maxWidth: "140px",
              }}
              title={`${page.title || `Page ${index + 1}`} - Double click to rename, Right click for options`}
            >
              {/* Drop Target Insertion Line */}
              {dropTarget && dropTarget.index === index && !isBeingDragged && (
                <div
                  className={cn(
                    "absolute top-0 bottom-0 w-[3px] bg-[#2563eb] z-30 shadow-[0_0_8px_#2563eb] rounded-full pointer-events-none",
                    dropTarget.position === "before" ? "left-0" : "right-0"
                  )}
                />
              )}

              {/* Active Tab Top Highlight Accent Line */}
              {isActive && (
                <div className="absolute top-0 left-1 right-1 h-[2px] bg-[#2563eb] rounded-full" />
              )}

              {/* Tab Title or Inline Rename Input */}
              {isEditing ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={handleFinishRename}
                  onKeyDown={handleKeyDownRename}
                  onClick={(e) => e.stopPropagation()}
                  className="w-18 px-1 py-0 bg-background text-foreground border border-primary text-[11px] font-bold rounded focus:outline-hidden text-center"
                />
              ) : (
                <div className="flex items-center gap-1 min-w-0">
                  <span className="truncate select-none font-medium pointer-events-none">
                    {page.title || `Page ${index + 1}`}
                  </span>
                  {safePages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => promptDeletePage(index, e)}
                      className="ml-0.5 -mr-1.5 h-3.5 w-3.5 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                      title={`Delete ${page.title || `Page ${index + 1}`}`}
                    >
                      <X className="h-2.5 w-2.5 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Quick Add Page (+) Tab at end (Right Side Plus: adds page after last page) */}
        <button
          type="button"
          onClick={() => onInsertPageAfter(safePages.length - 1)}
          className="h-6 w-6 ml-1 mb-0.5 rounded-full hover:bg-background/80 active:bg-muted text-muted-foreground hover:text-[#16a34a] hover:bg-[#16a34a]/10 flex items-center justify-center transition-colors cursor-pointer shrink-0 z-10"
          title="Add Page After Last Page (+)"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ─── 3. Right Status / Page Details Section ─ */}
      <div className="flex items-center gap-2 pl-2 border-l border-border/70 shrink-0 text-muted-foreground font-mono text-[10.5px]">
        <span className="font-semibold text-foreground truncate max-w-[120px]">
          {activePage?.title || `Page ${currentIndex + 1}`}
        </span>
        <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded text-muted-foreground">
          {activePage?.nodes?.length || 0} items
        </span>
      </div>

      {/* ─── 4. Right-Click Context Menu ─ */}
      {contextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed bg-popover/95 backdrop-blur-md text-popover-foreground border border-border shadow-2xl rounded-xl p-1 w-44 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 select-none space-y-0.5"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            type="button"
            onClick={() => {
              onInsertPageBefore(contextMenu.pageIndex)
              setContextMenu(null)
            }}
            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-muted text-foreground flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>Insert Page Before</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onInsertPageAfter(contextMenu.pageIndex)
              setContextMenu(null)
            }}
            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-muted text-foreground flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#16a34a]" />
            <span>Insert Page After</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onDuplicatePage(contextMenu.pageIndex)
              setContextMenu(null)
            }}
            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-muted text-foreground flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Duplicate Page</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              const targetPage = safePages[contextMenu.pageIndex]
              handleStartRename(contextMenu.pageIndex, targetPage?.title || `Page ${contextMenu.pageIndex + 1}`, e)
            }}
            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-muted text-foreground flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Rename Page</span>
          </button>
          {safePages.length > 1 && (
            <div className="border-t border-border/70 my-1 pt-1">
              <button
                type="button"
                onClick={() => promptDeletePage(contextMenu.pageIndex)}
                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-destructive/10 text-destructive flex items-center gap-2 cursor-pointer transition-colors font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Page</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Page Confirmation Warning Dialog Modal */}
      <DeleteConfirmationDialog
        open={pageToDelete !== null}
        onOpenChange={(open) => !open && setPageToDelete(null)}
        title="Delete Page"
        itemName={pageToDelete?.title}
        description={`Are you sure you want to delete "${pageToDelete?.title}"? All hierarchy nodes, shapes, and boundaries on this page will be permanently removed.`}
        confirmText="Delete Page"
        onConfirm={() => {
          if (pageToDelete !== null) {
            onDeletePage(pageToDelete.index)
            setPageToDelete(null)
          }
        }}
      />
    </div>
  )
}
