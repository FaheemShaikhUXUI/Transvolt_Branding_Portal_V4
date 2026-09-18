"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Sparkles,
  Search,
  Plus,
  Trash2,
  Copy,
  Check,
  ArrowLeft,
  FolderArchive,
  Clock,
  Eraser,
  Save,
  Link as LinkIcon,
  StickyNote,
  PenTool,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SavedItem, SavedItemType } from "@/lib/saved-prompts-notes/types"
import {
  getSavedItems,
  saveItem,
  deleteSavedItem,
} from "@/lib/saved-prompts-notes/storage"

export function SavedPromptsNotesView() {
  const router = useRouter()

  // Ref for left list scroll
  const leftListRef = React.useRef<HTMLDivElement>(null)

  // Items list state
  const [items, setItems] = React.useState<SavedItem[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterType, setFilterType] = React.useState<"all" | SavedItemType>("all")

  // Active Editor State
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [itemType, setItemType] = React.useState<SavedItemType>("prompt")
  const [isCopied, setIsCopied] = React.useState(false)

  // Interactive Save, Placing & Deleting Animations
  const [isSaving, setIsSaving] = React.useState(false)
  const [recentlySavedId, setRecentlySavedId] = React.useState<string | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  // Load items on mount
  React.useEffect(() => {
    const loaded = getSavedItems()
    setItems(loaded)
  }, [])

  // Filtered items
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !searchQuery ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchType = filterType === "all" || item.type === filterType
      return matchSearch && matchType
    })
  }, [items, searchQuery, filterType])

  // Select an item from the left list to edit on the right side
  const handleSelectItem = (item: SavedItem) => {
    setSelectedId(item.id)
    setTitle(item.title)
    setContent(item.content)
    setItemType(item.type || "prompt")
  }

  // Create new blank item
  const handleNewItem = () => {
    setSelectedId(null)
    setTitle("")
    setContent("")
    setItemType("prompt")
    toast.info("Editor ready for a new prompt or note")
  }

  // Clear current inputs and switch to new mode
  const handleClear = () => {
    setSelectedId(null)
    setTitle("")
    setContent("")
    setItemType("prompt")
    toast.info("Editor cleared — ready for new entry")
  }

  // Save current item with interactive placing animation on the tile
  const handleSave = () => {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle && !trimmedContent) {
      toast.error("Please enter a subject or text to save.")
      return
    }

    // Auto-derive title from first line of text if user only entered content
    const derivedTitle =
      trimmedTitle ||
      (trimmedContent ? trimmedContent.split("\n")[0].slice(0, 50) : "Saved Note")

    setIsSaving(true)

    // Save to storage
    const saved = saveItem({
      id: selectedId || undefined,
      title: derivedTitle,
      content: content,
      type: itemType,
    })

    // Update input fields to match saved item
    setTitle(saved.title)
    setSelectedId(saved.id)

    // Immediately reload items from storage to update the left side list
    const updatedList = getSavedItems()
    setItems([...updatedList])

    // Scroll left list to top so the newly placed tile lands right in view
    leftListRef.current?.scrollTo({ top: 0, behavior: "smooth" })

    // Trigger the interactive placing animation on the newly saved card
    setRecentlySavedId(saved.id)

    setTimeout(() => {
      setIsSaving(false)
    }, 400)

    // Reset placing glow highlight after 3.5s
    setTimeout(() => {
      setRecentlySavedId((prev) => (prev === saved.id ? null : prev))
    }, 3500)

    toast.success("Saved to list!", {
      description: `"${saved.title}" placed in your list.`,
    })
  }

  // Delete an item with interactive dust disintegrate & smooth upward glide animation
  const handleDelete = (idToDelete: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (deletingId) return // Prevent duplicate clicks during animation

    // 1. Mark tile as deleting -> triggers the dust disintegration & height collapse
    setDeletingId(idToDelete)

    // 2. Wait for full dust disintegration and smooth height collapse (1250ms)
    setTimeout(() => {
      // 3. Actually remove from storage and React items state
      const updated = deleteSavedItem(idToDelete)
      setItems([...updated])
      setDeletingId(null)

      if (selectedId === idToDelete) {
        setSelectedId(null)
        setTitle("")
        setContent("")
      }
      toast.success("Item deleted")
    }, 1250)
  }

  // Copy content to clipboard
  const handleCopy = () => {
    if (!content) {
      toast.error("Nothing to copy")
      return
    }
    navigator.clipboard.writeText(content)
    setIsCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Format relative timestamp
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Recently"
    }
  }

  const getTypeBadge = (type: SavedItemType) => {
    switch (type) {
      case "prompt":
        return (
          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] font-semibold shrink-0">
            <Sparkles className="h-2.5 w-2.5 mr-1" />
            Prompt
          </Badge>
        )
      case "note":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold shrink-0">
            <StickyNote className="h-2.5 w-2.5 mr-1" />
            Note
          </Badge>
        )
      case "link":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] font-semibold shrink-0">
            <LinkIcon className="h-2.5 w-2.5 mr-1" />
            Link
          </Badge>
        )
    }
  }

  return (
    <div className="flex flex-col gap-4 animate-in fade-in-50 pb-8 -mt-2">
      {/* ── TOP HEADER / BREADCRUMB BAR ───────────────────────────────── */}
      <div className="border-b border-border/80 bg-card/60 backdrop-blur-md px-4 sm:px-6 py-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/graphics-library-v2"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted px-2.5 py-1.5 rounded-xl border border-border/60 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Graphics Library V2</span>
          </Link>
          <span className="text-muted-foreground/40 text-sm">/</span>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Saved Prompt & Notes
            </h1>
            <Badge variant="outline" className="text-[10px] text-muted-foreground font-semibold">
              {items.length} Saved
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button
            onClick={handleNewItem}
            size="sm"
            className="h-8 rounded-xl text-xs font-semibold gap-1.5 bg-purple-600 hover:bg-purple-700 text-white shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Prompt / Note</span>
          </Button>

          <Link href="/graphics-library-v2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl text-xs font-medium gap-1.5 cursor-pointer"
            >
              <FolderArchive className="h-3.5 w-3.5 text-emerald-600" />
              <span>Back to Explorer</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── TWO-COLUMN WORKSPACE: LEFT LIST & RIGHT HALF EDITABLE PANEL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ── LEFT SIDE: LIST OF PROMPT OR NOTE (Width: ~42%) ─────────── */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs h-[calc(100vh-190px)] min-h-[560px]">
          {/* List Header: Search & Filter Tabs */}
          <div className="p-3.5 border-b border-border/80 bg-muted/20 space-y-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search prompt or note text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs rounded-xl bg-background"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Type filter chips */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                {(["all", "prompt", "note", "link"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={cn(
                      "px-2 py-1 rounded-lg text-[11px] font-medium capitalize transition-colors cursor-pointer",
                      filterType === t
                        ? "bg-foreground text-background font-semibold"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <span className="text-[11px] text-muted-foreground font-medium">
                {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Scrollable List Items Container */}
          <div
            ref={leftListRef}
            className="flex-1 overflow-y-auto p-2 space-y-2 divide-y divide-border/20 scroll-smooth"
          >
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="h-10 w-10 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center mb-2">
                  <StickyNote className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-foreground">
                  {searchQuery ? "No matching prompts or notes" : "No saved items"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-[220px]">
                  Type any prompt or note on the right side and click <strong>Save</strong> to add it here.
                </p>
                <Button
                  size="sm"
                  onClick={handleNewItem}
                  className="mt-3.5 h-8 text-xs rounded-xl gap-1.5 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Create Blank Note</span>
                </Button>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedId === item.id
                const isJustSaved = recentlySavedId === item.id
                const isDeleting = deletingId === item.id

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "transition-all ease-in-out overflow-hidden",
                      isDeleting
                        ? "max-h-0 opacity-0 my-0 py-0 pointer-events-none duration-650 delay-500"
                        : "max-h-[380px] opacity-100 duration-500"
                    )}
                  >
                    <div
                      onClick={() => !isDeleting && handleSelectItem(item)}
                      className={cn(
                        "group relative p-3 rounded-xl cursor-pointer transition-all border text-left",
                        isDeleting
                          ? "animate-tile-body-dust border-border/40 shadow-none pointer-events-none"
                          : isJustSaved
                          ? "animate-place-tile ring-2 ring-emerald-500 bg-emerald-500/15 animate-pulse-glow shadow-xl shadow-emerald-500/25 border-emerald-500 duration-300"
                          : isSelected
                          ? "bg-purple-500/10 border-purple-500/40 shadow-xs ring-1 ring-purple-500/30 duration-300"
                          : "border-border/40 hover:bg-muted/40 hover:border-border/80 duration-300"
                      )}
                    >
                      {/* Wind-blown Sand / Dust Particles as Tile Body Crumbles */}
                      {isDeleting && (
                        <div className="absolute inset-0 pointer-events-none overflow-visible z-30">
                          {[
                            // Wave 1: Right edge crumbling (0ms - 200ms)
                            { x: "88%", y: "15%", dx: "55px", dy: "-30px", s: "3.5px", d: "40ms", c: "bg-slate-400 dark:bg-slate-300" },
                            { x: "92%", y: "40%", dx: "65px", dy: "-20px", s: "3px", d: "70ms", c: "bg-stone-400 dark:bg-stone-300" },
                            { x: "85%", y: "65%", dx: "60px", dy: "-35px", s: "4px", d: "100ms", c: "bg-slate-500 dark:bg-slate-400" },
                            { x: "90%", y: "85%", dx: "50px", dy: "-25px", s: "2.5px", d: "130ms", c: "bg-stone-300 dark:bg-stone-200" },
                            { x: "82%", y: "30%", dx: "70px", dy: "-40px", s: "3px", d: "160ms", c: "bg-slate-400 dark:bg-slate-300" },
                            { x: "80%", y: "50%", dx: "58px", dy: "-15px", s: "3.5px", d: "190ms", c: "bg-slate-300 dark:bg-slate-200" },

                            // Wave 2: Mid-right crumbling (200ms - 450ms)
                            { x: "65%", y: "20%", dx: "60px", dy: "-45px", s: "4px", d: "230ms", c: "bg-stone-400 dark:bg-stone-300" },
                            { x: "70%", y: "45%", dx: "75px", dy: "-30px", s: "3px", d: "270ms", c: "bg-slate-400 dark:bg-slate-300" },
                            { x: "60%", y: "70%", dx: "65px", dy: "-50px", s: "3.5px", d: "310ms", c: "bg-slate-500 dark:bg-slate-400" },
                            { x: "75%", y: "85%", dx: "55px", dy: "-20px", s: "2.5px", d: "350ms", c: "bg-stone-300 dark:bg-stone-200" },
                            { x: "55%", y: "35%", dx: "80px", dy: "-40px", s: "4px", d: "390ms", c: "bg-slate-400 dark:bg-slate-300" },
                            { x: "50%", y: "60%", dx: "70px", dy: "-25px", s: "3px", d: "430ms", c: "bg-stone-500 dark:bg-stone-400" },

                            // Wave 3: Center & Mid-left crumbling (450ms - 750ms)
                            { x: "40%", y: "15%", dx: "65px", dy: "-55px", s: "4px", d: "470ms", c: "bg-slate-400 dark:bg-slate-300" },
                            { x: "45%", y: "50%", dx: "85px", dy: "-35px", s: "3px", d: "510ms", c: "bg-stone-400 dark:bg-stone-300" },
                            { x: "35%", y: "75%", dx: "75px", dy: "-45px", s: "3.5px", d: "550ms", c: "bg-slate-500 dark:bg-slate-400" },
                            { x: "30%", y: "30%", dx: "90px", dy: "-30px", s: "3px", d: "590ms", c: "bg-slate-300 dark:bg-slate-200" },
                            { x: "38%", y: "85%", dx: "60px", dy: "-50px", s: "2.5px", d: "630ms", c: "bg-stone-300 dark:bg-stone-200" },
                            { x: "25%", y: "55%", dx: "80px", dy: "-40px", s: "4px", d: "670ms", c: "bg-slate-400 dark:bg-slate-300" },

                            // Wave 4: Left edge final crumbling (700ms - 950ms)
                            { x: "15%", y: "25%", dx: "75px", dy: "-60px", s: "3.5px", d: "710ms", c: "bg-stone-400 dark:bg-stone-300" },
                            { x: "20%", y: "45%", dx: "95px", dy: "-35px", s: "3px", d: "750ms", c: "bg-slate-400 dark:bg-slate-300" },
                            { x: "10%", y: "70%", dx: "85px", dy: "-45px", s: "3px", d: "790ms", c: "bg-slate-500 dark:bg-slate-400" },
                            { x: "18%", y: "85%", dx: "70px", dy: "-30px", s: "2.5px", d: "830ms", c: "bg-stone-300 dark:bg-stone-200" },
                            { x: "08%", y: "35%", dx: "90px", dy: "-50px", s: "4px", d: "870ms", c: "bg-slate-400 dark:bg-slate-300" },
                            { x: "05%", y: "55%", dx: "80px", dy: "-40px", s: "3px", d: "910ms", c: "bg-slate-300 dark:bg-slate-200" },
                          ].map((p, idx) => (
                            <span
                              key={idx}
                              className={cn(
                                "absolute rounded-full animate-sand-grain shadow-xs pointer-events-none",
                                p.c
                              )}
                              style={
                                {
                                  left: p.x,
                                  top: p.y,
                                  width: p.s,
                                  height: p.s,
                                  "--grain-dx": p.dx,
                                  "--grain-dy": p.dy,
                                  animationDelay: p.d,
                                } as React.CSSProperties
                              }
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4
                          className={cn(
                            "text-xs font-bold line-clamp-1 flex-1 transition-colors",
                            isJustSaved
                              ? "text-emerald-700 dark:text-emerald-300 font-black"
                              : isSelected
                              ? "text-purple-700 dark:text-purple-300 font-extrabold"
                              : "text-foreground"
                          )}
                        >
                          {item.title || "Untitled Note"}
                        </h4>

                        {/* Interactive Placing Badge or Type Badge */}
                        {isJustSaved ? (
                          <Badge className="bg-emerald-600 text-white border-emerald-400 font-extrabold text-[10px] shadow-xs animate-bounce shrink-0">
                            <Sparkles className="h-2.5 w-2.5 mr-1 text-emerald-200" />
                            Just Saved ✓
                          </Badge>
                        ) : (
                          getTypeBadge(item.type)
                        )}
                      </div>

                      {/* Prominently visible Text content snippet */}
                      <p
                        className={cn(
                          "text-[11px] line-clamp-3 leading-relaxed font-mono p-1.5 rounded-lg border transition-colors",
                          isJustSaved
                            ? "text-foreground bg-emerald-500/10 border-emerald-500/30 font-semibold"
                            : "text-muted-foreground/90 bg-muted/30 border-border/30"
                        )}
                      >
                        {item.content || "(Empty text content)"}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-muted-foreground/70">
                        <div className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{formatTime(item.updatedAt)}</span>
                        </div>

                        {/* Quick Delete button */}
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          disabled={isDeleting}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-opacity cursor-pointer disabled:pointer-events-none"
                          title="Delete note"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── RIGHT SIDE: SECTION ON HALF OF PAGE (Width: ~58%) ───────── */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs h-[calc(100vh-190px)] min-h-[560px]">
          {/* Top of Section: Subject or Title & Type Selector */}
          <div className="p-4 border-b border-border/80 bg-muted/15 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Subject or Title
                </span>
                {selectedId ? (
                  <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-500/30 bg-purple-500/5 font-semibold">
                    <PenTool className="h-2.5 w-2.5 mr-1" />
                    Editing Item
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/5 font-semibold">
                    <Plus className="h-2.5 w-2.5 mr-1" />
                    New Entry
                  </Badge>
                )}
              </div>

              {/* Tag Selector: Prompt | Note | Link */}
              <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/60">
                <button
                  type="button"
                  onClick={() => setItemType("prompt")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer",
                    itemType === "prompt"
                      ? "bg-card text-purple-600 shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Prompt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setItemType("note")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer",
                    itemType === "note"
                      ? "bg-card text-emerald-600 shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <StickyNote className="h-3 w-3" />
                  <span>Note</span>
                </button>
                <button
                  type="button"
                  onClick={() => setItemType("link")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer",
                    itemType === "link"
                      ? "bg-card text-blue-600 shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LinkIcon className="h-3 w-3" />
                  <span>Link</span>
                </button>
              </div>
            </div>

            {/* Title Input */}
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter subject or title (e.g. Midjourney EV Prompt, Brand Note)..."
              className="h-10 text-sm font-bold rounded-xl border-border/80 bg-background/90 focus-visible:ring-purple-500"
            />
          </div>

          {/* Full Empty Space till bottom to keep any text, link, or prompt */}
          <div className="flex-1 flex flex-col p-4 bg-background/40 relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full empty space to keep any text, link, or prompt...

Type or paste anything here:
• AI prompts for Midjourney, ChatGPT, or Claude
• Brand copywriting guidelines & marketing taglines
• Approved colour hex codes or font rules
• Drive links, Figma files, or documentation URLs"
              className="flex-1 w-full h-full p-4 rounded-xl border border-border/70 bg-card/60 focus:bg-card text-xs sm:text-sm font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all text-foreground placeholder:text-muted-foreground/50"
            />

            {/* Character & Word count pill */}
            <div className="absolute bottom-6 right-6 px-2.5 py-1 rounded-lg bg-background/80 border border-border/60 text-[10px] text-muted-foreground font-mono backdrop-blur-xs pointer-events-none">
              {content.trim() ? content.trim().split(/\s+/).length : 0} words &bull;{" "}
              {content.length} chars
            </div>
          </div>

          {/* Bottom Toolbar: In that column only at bottom show these Buttons: Save, Clear */}
          <div className="p-3.5 border-t border-border/80 bg-muted/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Copy prompt button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!content.trim()}
                className="h-9 rounded-xl text-xs gap-1.5 font-medium border-border/80 bg-background/80 hover:bg-muted cursor-pointer"
                title="Copy prompt text to clipboard"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Copy</span>
                  </>
                )}
              </Button>

              {/* Delete button (if editing existing) */}
              {selectedId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(selectedId)}
                  className="h-9 rounded-xl text-xs gap-1 text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </Button>
              )}
            </div>

            {/* User Requested Buttons at Bottom: Save, Clear */}
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="h-9 px-4 rounded-xl text-xs font-semibold gap-1.5 border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Eraser className="h-3.5 w-3.5" />
                <span>Clear</span>
              </Button>

              {/* Save Button */}
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "h-9 px-5 rounded-xl text-xs font-bold gap-1.5 transition-all duration-200 shadow-xs cursor-pointer",
                  isSaving
                    ? "bg-emerald-700 text-white scale-95 ring-4 ring-emerald-500/30"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.02] active:scale-95"
                )}
              >
                {isSaving ? (
                  <>
                    <Check className="h-3.5 w-3.5 animate-in zoom-in-50" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
