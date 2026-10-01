"use client"

import * as React from "react"
import { Search, ChevronDown, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FontItem {
  name: string
  category: "Sans-Serif" | "Serif" | "Display" | "Monospace" | "Script"
  fontFamily: string
}

export const CURATED_FONTS: FontItem[] = [
  // ─── Sans-Serif Fonts ──────────────────────────────────
  { name: "Poppins", category: "Sans-Serif", fontFamily: "Poppins, sans-serif" },
  { name: "Inter", category: "Sans-Serif", fontFamily: "Inter, sans-serif" },
  { name: "Roboto", category: "Sans-Serif", fontFamily: "Roboto, sans-serif" },
  { name: "Montserrat", category: "Sans-Serif", fontFamily: "Montserrat, sans-serif" },
  { name: "Outfit", category: "Sans-Serif", fontFamily: "Outfit, sans-serif" },
  { name: "Open Sans", category: "Sans-Serif", fontFamily: "'Open Sans', sans-serif" },
  { name: "Lato", category: "Sans-Serif", fontFamily: "Lato, sans-serif" },
  { name: "Arial", category: "Sans-Serif", fontFamily: "Arial, sans-serif" },
  { name: "Segoe UI", category: "Sans-Serif", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  { name: "Trebuchet MS", category: "Sans-Serif", fontFamily: "'Trebuchet MS', sans-serif" },
  { name: "Verdana", category: "Sans-Serif", fontFamily: "Verdana, sans-serif" },
  { name: "Tahoma", category: "Sans-Serif", fontFamily: "Tahoma, sans-serif" },

  // ─── Serif Fonts ───────────────────────────────────────
  { name: "Playfair Display", category: "Serif", fontFamily: "'Playfair Display', serif" },
  { name: "Merriweather", category: "Serif", fontFamily: "Merriweather, serif" },
  { name: "Georgia", category: "Serif", fontFamily: "Georgia, serif" },
  { name: "Times New Roman", category: "Serif", fontFamily: "'Times New Roman', Times, serif" },
  { name: "Garamond", category: "Serif", fontFamily: "Garamond, Baskerville, serif" },
  { name: "Palatino", category: "Serif", fontFamily: "'Palatino Linotype', Palatino, serif" },
  { name: "Cinzel", category: "Serif", fontFamily: "Cinzel, serif" },

  // ─── Display & Title Fonts ─────────────────────────────
  { name: "Oswald", category: "Display", fontFamily: "Oswald, sans-serif" },
  { name: "Bebas Neue", category: "Display", fontFamily: "'Bebas Neue', sans-serif" },
  { name: "Impact", category: "Display", fontFamily: "Impact, Haettenschweiler, sans-serif" },
  { name: "Anton", category: "Display", fontFamily: "Anton, sans-serif" },
  { name: "Righteous", category: "Display", fontFamily: "Righteous, cursive" },

  // ─── Monospace Fonts ───────────────────────────────────
  { name: "Fira Code", category: "Monospace", fontFamily: "'Fira Code', monospace" },
  { name: "Courier New", category: "Monospace", fontFamily: "'Courier New', Courier, monospace" },
  { name: "Consolas", category: "Monospace", fontFamily: "Consolas, 'Lucida Console', monospace" },
  { name: "Space Mono", category: "Monospace", fontFamily: "'Space Mono', monospace" },

  // ─── Script & Handwriting Fonts ────────────────────────
  { name: "Great Vibes", category: "Script", fontFamily: "'Great Vibes', cursive" },
  { name: "Pacifico", category: "Script", fontFamily: "Pacifico, cursive" },
  { name: "Dancing Script", category: "Script", fontFamily: "'Dancing Script', cursive" },
  { name: "Caveat", category: "Script", fontFamily: "Caveat, cursive" },
  { name: "Lobster", category: "Script", fontFamily: "Lobster, cursive" },
  { name: "Brush Script MT", category: "Script", fontFamily: "'Brush Script MT', cursive" },
]

export interface FontPickerProps {
  value: string
  onChange: (fontName: string) => void
  className?: string
}

export function FontPicker({ value, onChange, className }: FontPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<string>("All")
  const [localFonts, setLocalFonts] = React.useState<FontItem[]>(CURATED_FONTS)
  const [hasQueriedLocal, setHasQueriedLocal] = React.useState(false)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Optional: Query Installed Local Fonts (Chrome/Edge Local Font Access API)
  const querySystemFonts = React.useCallback(async () => {
    if (typeof window !== "undefined" && "queryLocalFonts" in window && !hasQueriedLocal) {
      try {
        const availableFonts = await (window as any).queryLocalFonts()
        if (availableFonts && availableFonts.length > 0) {
          const namesSeen = new Set<string>()
          const discovered: FontItem[] = []
          for (const f of availableFonts) {
            const family = f.family
            if (!namesSeen.has(family)) {
              namesSeen.add(family)
              discovered.push({
                name: family,
                category: "Sans-Serif",
                fontFamily: `"${family}", sans-serif`,
              })
            }
          }
          // Merge with curated fonts
          const merged = [...CURATED_FONTS]
          for (const d of discovered) {
            if (!merged.some((m) => m.name.toLowerCase() === d.name.toLowerCase())) {
              merged.push(d)
            }
          }
          setLocalFonts(merged)
          setHasQueriedLocal(true)
        }
      } catch {
        // User dismissed permission; fall back to curated fonts
      }
    }
  }, [hasQueriedLocal])

  // Click outside & Escape dismiss
  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  // Filtered fonts
  const filteredFonts = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return localFonts.filter((f) => {
      const matchesCat = activeCategory === "All" || f.category === activeCategory
      const matchesSearch = !q || f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
      return matchesCat && matchesSearch
    })
  }, [localFonts, search, activeCategory])

  const activeFont = localFonts.find((f) => f.name.toLowerCase() === (value || "").toLowerCase()) || {
    name: value || "Poppins",
    fontFamily: value || "Poppins, sans-serif",
    category: "Sans-Serif" as const,
  }

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => {
            const next = !prev
            if (next) {
              setSearch("")
              setTimeout(() => searchInputRef.current?.focus(), 50)
            }
            return next
          })
        }}
        className={cn(
          "w-full h-9 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all bg-background cursor-pointer",
          isOpen
            ? "border-primary ring-1 ring-primary/40 text-foreground"
            : "border-border/70 hover:border-border text-foreground hover:bg-muted/40"
        )}
      >
        <span className="truncate text-sm" style={{ fontFamily: activeFont.fontFamily }}>
          {activeFont.name}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-1.5",
            isOpen && "transform rotate-180 text-primary"
          )}
        />
      </button>

      {/* Popover Dropdown (Like Photoshop / CorelDRAW Font Picker) */}
      {isOpen && (
        <div className="absolute top-full mt-1.5 left-0 z-50 w-full sm:w-[320px] rounded-xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl p-2 flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Search Bar */}
          <div className="relative flex items-center mb-2">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search font family..."
              className="w-full pl-8 pr-6 py-1.5 text-xs rounded-lg bg-muted/40 border border-border/60 placeholder:text-muted-foreground focus:outline-hidden focus:border-primary focus:bg-background transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 text-[10px] text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1.5 border-b border-border/50 scrollbar-none">
            {["All", "Sans-Serif", "Serif", "Display", "Monospace", "Script"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 cursor-pointer transition-colors",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Optional System Font Access scan button */}
          {typeof window !== "undefined" && "queryLocalFonts" in window && !hasQueriedLocal && (
            <button
              type="button"
              onClick={querySystemFonts}
              className="mt-1.5 mb-1 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 rounded-md border border-primary/20 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Scan OS Installed Fonts (Local Font API)
            </button>
          )}

          {/* Fonts List with Each Font Styled in Its Own Style */}
          <div className="max-h-[300px] overflow-y-auto divide-y divide-border/30 scrollbar-thin py-1 pr-1">
            {filteredFonts.map((f) => {
              const isSelected = (value || "").toLowerCase() === f.name.toLowerCase()
              return (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => {
                    onChange(f.name)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full px-2.5 py-2 rounded-lg text-left flex items-center justify-between transition-colors cursor-pointer group my-0.5",
                    isSelected
                      ? "bg-primary/15 text-primary"
                      : "hover:bg-muted/60 text-foreground"
                  )}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      {/* Font name styled in its own font family */}
                      <span
                        className="text-sm font-semibold truncate leading-tight"
                        style={{ fontFamily: f.fontFamily }}
                      >
                        {f.name}
                      </span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-muted text-muted-foreground">
                        {f.category}
                      </span>
                    </div>
                    {/* Live typography preview sample text */}
                    <span
                      className="text-xs text-muted-foreground group-hover:text-foreground/80 mt-1 truncate"
                      style={{ fontFamily: f.fontFamily }}
                    >
                      The quick brown fox jumps over 123
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary shrink-0 ml-1.5" />
                  )}
                </button>
              )
            })}

            {filteredFonts.length === 0 && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No fonts found matching &ldquo;{search}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
