"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Globe, Search, Link2, Check, ExternalLink, Sparkles, Plus } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ReferenceSource, DEFAULT_REFERENCE_SOURCES } from "../eva/eva-research-engine"

interface ReferenceSitesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sources?: ReferenceSource[]
  onSourcesChange?: (sources: ReferenceSource[]) => void
}

export function ReferenceSitesModal({
  open,
  onOpenChange,
  sources: controlledSources,
  onSourcesChange,
}: ReferenceSitesModalProps) {
  const [internalSources, setInternalSources] = React.useState<ReferenceSource[]>(DEFAULT_REFERENCE_SOURCES)
  const [searchQuery, setSearchQuery] = React.useState("")

  const sources = controlledSources || internalSources
  const setSources = onSourcesChange || setInternalSources

  const toggleConnect = (id: string) => {
    const updated = sources.map((s) => {
      if (s.id === id) {
        const nextState = !s.connected
        toast.success(
          nextState
            ? `Connected ${s.name} to Eva Bot's research engine!`
            : `Disconnected ${s.name}`
        )
        return { ...s, connected: nextState }
      }
      return s
    })
    setSources(updated)
  }

  const handleAddCustomUrl = () => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return

    let finalUrl = trimmed
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`
    }

    try {
      const parsed = new URL(finalUrl)
      const domainName = parsed.hostname.replace("www.", "")
      const newSource: ReferenceSource = {
        id: `custom-${Date.now()}`,
        name: `${domainName.charAt(0).toUpperCase() + domainName.slice(1)} Visual Reference`,
        url: finalUrl,
        category: "Custom Reference Platform",
        connected: true,
        description: `Custom verified graphics reference site added by user for Eva Bot live study.`,
        strengths: "Real-time graphic layout analysis, bespoke color palettes, and domain aesthetics.",
      }

      setSources([newSource, ...sources])
      setSearchQuery("")
      toast.success(`Connected ${newSource.name} to Eva's active research engine!`)
    } catch {
      toast.error("Please enter a valid URL (e.g., https://behance.net or dribbble.com)")
    }
  }

  const isUrlLike =
    searchQuery.trim().includes(".") &&
    (searchQuery.trim().startsWith("http") || searchQuery.trim().startsWith("www.") || searchQuery.trim().includes(".com") || searchQuery.trim().includes(".ai") || searchQuery.trim().includes(".net") || searchQuery.trim().includes(".org") || searchQuery.trim().includes(".io"))

  const filteredSources = sources.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden flex flex-col p-6 rounded-2xl">
        <DialogHeader className="border-b border-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-cyan-500/15 text-cyan-600">
              <Globe className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Connect Reference Sites for Eva Bot Research
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Allow Eva Bot to synthesize design concepts, typography standards, and color trends from verified reference platforms.
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar & Custom URL Adder */}
        <div className="pt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search or add reference site URL (e.g. mobbin.com)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isUrlLike) {
                  handleAddCustomUrl()
                }
              }}
              className="pl-8 text-xs h-9 bg-muted/20"
            />
          </div>
          {isUrlLike && (
            <Button
              size="sm"
              onClick={handleAddCustomUrl}
              className="h-9 px-3 text-xs bg-cyan-600 hover:bg-cyan-700 text-white shrink-0 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add &amp; Connect
            </Button>
          )}
        </div>

        {/* Source Cards List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 py-3 overlay-scrollbar">
          {filteredSources.map((source) => (
            <div
              key={source.id}
              className={cn(
                "p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 text-xs",
                source.connected
                  ? "border-cyan-500/40 bg-cyan-500/5 shadow-2xs"
                  : "border-border/70 bg-card/60 opacity-80"
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-foreground">{source.name}</h4>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium">
                    {source.category}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {source.description}
                </p>
                {source.strengths && (
                  <p className="text-[10px] text-cyan-600 dark:text-cyan-400/90 font-mono">
                    ✦ Study Focus: {source.strengths}
                  </p>
                )}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline pt-0.5"
                >
                  <span>{source.url}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <Button
                size="sm"
                variant={source.connected ? "default" : "outline"}
                onClick={() => toggleConnect(source.id)}
                className={cn(
                  "h-8 text-xs font-semibold px-3 shrink-0 rounded-lg cursor-pointer",
                  source.connected
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                    : "border-border/80"
                )}
              >
                {source.connected ? "Connected" : "Connect"}
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/70 text-xs">
          <span className="text-muted-foreground">
            {sources.filter((s) => s.connected).length} of {sources.length} sources connected
          </span>
          <Button size="sm" onClick={() => onOpenChange(false)} className="h-8 cursor-pointer">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
