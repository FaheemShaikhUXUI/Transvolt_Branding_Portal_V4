"use client"

import * as React from "react"
import { DocumentPage } from "@/types/eva-editor"
import { cn } from "@/lib/utils"
import {
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Copy,
  Trash2,
  Edit2,
  Plus,
  Check,
  Search,
  FileText,
} from "lucide-react"

interface DocumentNavigatorProps {
  pages: DocumentPage[]
  activePageId: string
  onSelectPage: (pageId: string) => void
  onInsertPageBefore: (referencePageId: string) => void
  onInsertPageAfter: (referencePageId: string) => void
  onDuplicatePage: (pageId: string) => void
  onDeletePage: (pageId: string) => void
  onRenamePage: (pageId: string, newName: string) => void
  onReorderPages?: (newPages: DocumentPage[]) => void
}

export function DocumentNavigator({
  pages,
  activePageId,
  onSelectPage,
  onInsertPageBefore,
  onInsertPageAfter,
  onDuplicatePage,
  onDeletePage,
  onRenamePage,
  onReorderPages,
}: DocumentNavigatorProps) {
  const currentIndex = Math.max(
    0,
    pages.findIndex((p) => p.id === activePageId)
  )
  const activePage = pages[currentIndex] || pages[0]

  // Inline rename state
  const [editingPageId, setEditingPageId] = React.useState<string | null>(null)
  const [editingName, setEditingName] = React.useState<string>("")
  const editInputRef = React.useRef<HTMLInputElement>(null)

  // Quick page jumper popup state
  const [isJumperOpen, setIsJumperOpen] = React.useState(false)
  const [jumperSearch, setJumperSearch] = React.useState("")
  const jumperRef = React.useRef<HTMLDivElement>(null)

  // Context menu state
  const [contextMenu, setContextMenu] = React.useState<{
    x: number
    y: number
    pageId: string
  } | null>(null)

  // Drag and drop reordering state
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dropTarget, setDropTarget] = React.useState<{
    index: number
    position: "before" | "after"
  } | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (editingPageId) return
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", index.toString())
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "move"
    if (draggedIndex === null) return
    const rect = e.currentTarget.getBoundingClientRect()
    const midX = rect.left + rect.width / 2
    const position = e.clientX < midX ? "before" : "after"
    setDropTarget({ index, position })
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedIndex === null || dropTarget === null) return
    if (draggedIndex !== dropTarget.index) {
      const nextPages = [...pages]
      const [draggedPage] = nextPages.splice(draggedIndex, 1)
      let targetIndex = dropTarget.position === "before" ? dropTarget.index : dropTarget.index + 1
      if (draggedIndex < targetIndex) {
        targetIndex -= 1
      }
      nextPages.splice(targetIndex, 0, draggedPage)
      onReorderPages?.(nextPages)
    }
    setDraggedIndex(null)
    setDropTarget(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDropTarget(null)
  }

  const tabsContainerRef = React.useRef<HTMLDivElement>(null)
  const activeTabRef = React.useRef<HTMLDivElement>(null)

  // Scroll visibility indicators
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  const updateScrollIndicators = React.useCallback(() => {
    const el = tabsContainerRef.current
    if (!el) return
    const hasOverflow = el.scrollWidth > el.clientWidth + 2
    setCanScrollLeft(hasOverflow && el.scrollLeft > 4)
    setCanScrollRight(
      hasOverflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 4
    )
  }, [])

  // Auto-scroll to active tab whenever activePageId changes or pages change
  React.useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      })
    }
    // Update scroll buttons
    setTimeout(updateScrollIndicators, 150)
  }, [activePageId, pages.length, updateScrollIndicators])

  // Mouse wheel horizontal scroll on tabs strip
  React.useEffect(() => {
    const el = tabsContainerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
        updateScrollIndicators()
      }
    }

    el.addEventListener("wheel", handleWheel, { passive: false })
    el.addEventListener("scroll", updateScrollIndicators)
    window.addEventListener("resize", updateScrollIndicators)

    updateScrollIndicators()

    return () => {
      el.removeEventListener("wheel", handleWheel)
      el.removeEventListener("scroll", updateScrollIndicators)
      window.removeEventListener("resize", updateScrollIndicators)
    }
  }, [updateScrollIndicators])

  // Close context menu & jumper on click outside
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      setContextMenu(null)
      if (jumperRef.current && !jumperRef.current.contains(e.target as Node)) {
        setIsJumperOpen(false)
      }
    }
    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [])

  // Auto focus inline rename input
  React.useEffect(() => {
    if (editingPageId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingPageId])

  const handleStartRename = (page: DocumentPage, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingPageId(page.id)
    setEditingName(page.name)
    setContextMenu(null)
  }

  const handleFinishRename = () => {
    if (editingPageId && editingName.trim()) {
      onRenamePage(editingPageId, editingName.trim())
    }
    setEditingPageId(null)
  }

  const handleKeyDownRename = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFinishRename()
    } else if (e.key === "Escape") {
      setEditingPageId(null)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, pageId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY - 140, // pop above bottom bar
      pageId,
    })
  }

  const handleFirstPage = () => {
    if (pages.length > 0) onSelectPage(pages[0].id)
  }

  const handlePrevPage = () => {
    if (currentIndex > 0) onSelectPage(pages[currentIndex - 1].id)
  }

  const handleNextPage = () => {
    if (currentIndex < pages.length - 1) onSelectPage(pages[currentIndex + 1].id)
  }

  const handleLastPage = () => {
    if (pages.length > 0) onSelectPage(pages[pages.length - 1].id)
  }

  const scrollTabs = (offset: number) => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: offset, behavior: "smooth" })
      setTimeout(updateScrollIndicators, 180)
    }
  }

  // Filtered pages for jumper
  const filteredPages = pages.filter((p, idx) => {
    if (!jumperSearch.trim()) return true
    const term = jumperSearch.toLowerCase()
    return (
      p.name.toLowerCase().includes(term) ||
      `page ${idx + 1}`.includes(term) ||
      `${idx + 1}` === term
    )
  })

  return (
    <div
      id="coreldraw-document-navigator"
      className="h-8.5 w-full bg-muted/90 dark:bg-[#18181b]/95 backdrop-blur-md border-t border-border/80 flex items-center px-1.5 select-none z-20 shrink-0 font-sans text-xs relative"
    >
      {/* ─── 1. Left Navigation Controls (Authentic CorelDRAW Page Controls) ─ */}
      <div className="flex items-center gap-0.5 border-r border-border/70 pr-1.5 shrink-0">
        {/* Insert Page Before [+] (Left Side Plus: adds page before Page 1) */}
        <button
          type="button"
          onClick={() => onInsertPageBefore(pages[0]?.id || activePage?.id)}
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
          title="First Page (Home)"
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
          title="Previous Page (Page Up)"
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
              isJumperOpen && "bg-background shadow-2xs text-[#2563eb]"
            )}
            title="Click to jump to any page"
          >
            <span className="font-bold text-[#2563eb]">{currentIndex + 1}</span>
            <span className="text-muted-foreground px-0.5">of</span>
            <span>{pages.length}</span>
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
                  Document Pages ({pages.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onInsertPageAfter(pages[pages.length - 1]?.id || activePageId)
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
              {pages.length > 5 && (
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
                {filteredPages.map((p) => {
                  const pIdx = pages.findIndex((item) => item.id === p.id)
                  const isCurrent = p.id === activePageId

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onSelectPage(p.id)
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
                        <span className="truncate">{p.name}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono shrink-0 ml-2">
                        <span>{p.widthMm.toFixed(0)}×{p.heightMm.toFixed(0)}</span>
                        {isCurrent && <Check className="h-3.5 w-3.5 text-[#2563eb] ml-0.5" />}
                      </div>
                    </button>
                  )
                })}

                {filteredPages.length === 0 && (
                  <div className="py-3 text-center text-xs text-muted-foreground">
                    No matching pages found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Next Page ▶ */}
        <button
          type="button"
          disabled={currentIndex === pages.length - 1}
          onClick={handleNextPage}
          className="h-6.5 w-6 rounded hover:bg-background/80 active:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
          title="Next Page (Page Down)"
        >
          <svg viewBox="0 0 16 16" className="w-3 h-3 fill-currentColor">
            <polygon points="5,3 12,8 5,13" />
          </svg>
        </button>

        {/* Last Page ▶| */}
        <button
          type="button"
          disabled={currentIndex === pages.length - 1}
          onClick={handleLastPage}
          className="h-6.5 w-6 rounded hover:bg-background/80 active:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
          title="Last Page (End)"
        >
          <svg viewBox="0 0 16 16" className="w-3 h-3 fill-currentColor">
            <polygon points="3,3 11,8 3,13" />
            <rect x="12" y="3" width="2" height="10" rx="0.5" />
          </svg>
        </button>

        {/* Insert Page After [+] (Right Side Plus: adds page after last page) */}
        <button
          type="button"
          onClick={() => onInsertPageAfter(pages[pages.length - 1]?.id || activePage?.id)}
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

      {/* ─── 2. Scroll Left Chevron (for many pages) ────────────────────────── */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollTabs(-180)}
          className="h-6 w-5 ml-0.5 rounded hover:bg-background/90 text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer shrink-0 z-10 shadow-xs"
          title="Scroll Tabs Left"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      )}

      {/* ─── 3. Slanted Trapezoid Page Tabs (Drag & Drop Reordering, Proper 1,2,3,4 Sequence) ─ */}
      <div
        ref={tabsContainerRef}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = "move"
        }}
        onDrop={(e) => {
          // If dropped on container empty space, move dragged page to end
          e.preventDefault()
          if (draggedIndex !== null && draggedIndex !== pages.length - 1) {
            const nextPages = [...pages]
            const [draggedPage] = nextPages.splice(draggedIndex, 1)
            nextPages.push(draggedPage)
            onReorderPages?.(nextPages)
          }
          setDraggedIndex(null)
          setDropTarget(null)
        }}
        className="flex-1 flex items-end overflow-x-auto no-scrollbar pl-1 h-full scroll-smooth"
      >
        {/* Left Side Plus (+) before Page 1 */}
        <button
          type="button"
          onClick={() => onInsertPageBefore(pages[0]?.id || activePageId)}
          className="h-6 w-6 mr-1 mb-0.5 rounded-full hover:bg-background/80 active:bg-muted text-muted-foreground hover:text-[#2563eb] hover:bg-[#2563eb]/10 flex items-center justify-center transition-colors cursor-pointer shrink-0 z-10"
          title="Add Page Before Page 1 (+)"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {pages.map((page, index) => {
          const isActive = page.id === activePageId
          const isEditing = editingPageId === page.id
          const isBeingDragged = draggedIndex === index

          return (
            <div
              key={page.id}
              ref={isActive ? activeTabRef : undefined}
              draggable={!isEditing}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelectPage(page.id)}
              onDoubleClick={(e) => handleStartRename(page, e)}
              onContextMenu={(e) => handleContextMenu(e, page.id)}
              className={cn(
                "relative group h-7 px-4.5 flex items-center justify-center cursor-grab active:cursor-grabbing transition-all -ml-1 text-[11px] shrink-0 select-none",
                isActive
                  ? "bg-background text-foreground font-bold shadow-xs z-10 border-t border-border/80"
                  : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground",
                isBeingDragged && "opacity-40 scale-95 ring-1 ring-dashed ring-[#2563eb]"
              )}
              style={{
                // Authentic CorelDRAW trapezoid angled tab shape:
                clipPath: "polygon(5px 0%, calc(100% - 5px) 0%, 100% 100%, 0% 100%)",
                minWidth: "75px",
                maxWidth: "140px",
              }}
              title={`${page.name} (${page.widthMm.toFixed(1)} × ${page.heightMm.toFixed(1)} mm) - Drag to reorder, Double click to rename, Right click for options`}
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
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={handleFinishRename}
                  onKeyDown={handleKeyDownRename}
                  onClick={(e) => e.stopPropagation()}
                  className="w-18 px-1 py-0 bg-background text-foreground border border-primary text-[11px] font-bold rounded focus:outline-hidden text-center"
                />
              ) : (
                <span className="truncate select-none font-medium pointer-events-none">
                  {page.name}
                </span>
              )}
            </div>
          )
        })}

        {/* Quick Add Page (+) Tab at end (Right Side Plus: adds page after last page) */}
        <button
          type="button"
          onClick={() => onInsertPageAfter(pages[pages.length - 1]?.id || activePageId)}
          className="h-6 w-6 ml-1 mb-0.5 rounded-full hover:bg-background/80 active:bg-muted text-muted-foreground hover:text-[#16a34a] hover:bg-[#16a34a]/10 flex items-center justify-center transition-colors cursor-pointer shrink-0 z-10"
          title="Add Page After Last Page (+)"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ─── 4. Scroll Right Chevron (for many pages) ───────────────────────── */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollTabs(180)}
          className="h-6 w-5 mr-1 rounded hover:bg-background/90 text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer shrink-0 z-10 shadow-xs"
          title="Scroll Tabs Right"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}

      {/* ─── 5. Right Side: Current Page Dimensions Summary ──────────────── */}
      <div className="hidden md:flex items-center gap-2 pl-2.5 border-l border-border/70 text-[10px] text-muted-foreground font-mono shrink-0">
        <span className="truncate max-w-[130px]">
          {activePage?.name}:
        </span>
        <span className="font-semibold text-foreground/80">
          {activePage?.widthMm.toFixed(1)} × {activePage?.heightMm.toFixed(1)} mm
        </span>
        <span className="px-1 py-0.2 rounded bg-muted uppercase text-[9px] font-semibold text-foreground/80">
          {activePage?.orientation || "portrait"}
        </span>
      </div>

      {/* ─── 6. Right-Click CorelDRAW Context Menu ────────────────────────── */}
      {contextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 w-52 rounded-xl bg-card border border-border shadow-2xl p-1.5 space-y-1 text-xs animate-in fade-in zoom-in-95 duration-75"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 220),
            top: Math.max(10, contextMenu.y - 140),
          }}
        >
          <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60">
            {pages.find((p) => p.id === contextMenu.pageId)?.name || "Page Options"}
          </div>

          <button
            type="button"
            onClick={() => {
              onInsertPageAfter(contextMenu.pageId)
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
              onInsertPageBefore(contextMenu.pageId)
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
              onDuplicatePage(contextMenu.pageId)
              setContextMenu(null)
            }}
            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-muted text-foreground flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-amber-500" />
            <span>Duplicate Page</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const targetPage = pages.find((p) => p.id === contextMenu.pageId)
              if (targetPage) handleStartRename(targetPage)
            }}
            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-muted text-foreground flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Rename Page</span>
          </button>

          {pages.length > 1 && (
            <>
              <div className="h-px bg-border/60 my-1" />
              <button
                type="button"
                onClick={() => {
                  onDeletePage(contextMenu.pageId)
                  setContextMenu(null)
                }}
                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-destructive/10 text-destructive flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Page</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
