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
import { BookOpen, Search, Upload, FileText, Check, Cpu } from "lucide-react"
import { toast } from "sonner"

interface ToolKnowledgeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface KnowledgeDoc {
  id: string
  title: string
  tool: "CorelDRAW" | "Figma" | "Photoshop" | "Illustrator" | "General Vector"
  version: string
  summary: string
  indexedDate: string
}

const DEFAULT_KNOWLEDGE: KnowledgeDoc[] = [
  {
    id: "k-1",
    title: "CorelDRAW 2026 - Vehicle Livery Vector Cutline Rules",
    tool: "CorelDRAW",
    version: "v26.1",
    summary: "Bleed margins (25mm), curve simplification, contour cuts, and CMYK process color curves.",
    indexedDate: "Sep 20, 2025",
  },
  {
    id: "k-2",
    title: "Figma Vector Networks & Bézier Control Point System",
    tool: "Figma",
    version: "2026 Edition",
    summary: "Multi-point vector networks, boolean operations, components, and responsive auto-layout constraints.",
    indexedDate: "Sep 21, 2025",
  },
  {
    id: "k-3",
    title: "Adobe Illustrator - Pantone Matching & Spot Color Channels",
    tool: "Illustrator",
    version: "CC 2026",
    summary: "Pantone 369 C spot color separation, overprint preview, and vector clipping masks.",
    indexedDate: "Sep 22, 2025",
  },
  {
    id: "k-4",
    title: "Photoshop Smart Mockup Warp & Displacement Mapping",
    tool: "Photoshop",
    version: "CC 2026",
    summary: "Surface deformation, ambient occlusion shadows, and metallic automotive paint specular highlights.",
    indexedDate: "Sep 23, 2025",
  },
]

export function ToolKnowledgeModal({
  open,
  onOpenChange,
}: ToolKnowledgeModalProps) {
  const [knowledgeList, setKnowledgeList] = React.useState<KnowledgeDoc[]>(DEFAULT_KNOWLEDGE)
  const [query, setQuery] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)

  const handleSearchAndIndex = () => {
    if (!query.trim()) return
    setIsSearching(true)
    setTimeout(() => {
      setIsSearching(false)
      const newDoc: KnowledgeDoc = {
        id: `k-${Date.now()}`,
        title: query,
        tool: "General Vector",
        version: "Custom Query",
        summary: `Indexed technical documentation and tool guidelines for: ${query}. Available for Eva Bot agentic actions.`,
        indexedDate: "Just now",
      }
      setKnowledgeList([newDoc, ...knowledgeList])
      setQuery("")
      toast.success("Knowledge indexed into Eva Bot memory!")
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden flex flex-col p-6 rounded-2xl">
        <DialogHeader className="border-b border-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-purple-500/15 text-purple-600">
              <Cpu className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Upload & Index Tool Knowledge for Eva Bot
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Search and store design application operational knowledge (CorelDRAW, Figma, Illustrator) so Eva Bot understands professional design workflows.
          </DialogDescription>
        </DialogHeader>

        {/* Search & Index Box */}
        <div className="pt-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search design application data (e.g. CorelDRAW wrap cutlines)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchAndIndex()}
                className="pl-8 text-xs h-9 bg-muted/20"
              />
            </div>
            <Button
              size="sm"
              disabled={isSearching || !query.trim()}
              onClick={handleSearchAndIndex}
              className="h-9 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-xs"
            >
              {isSearching ? "Indexing..." : "Index Knowledge"}
            </Button>
          </div>
        </div>

        {/* Knowledge Documents List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 py-3 overlay-scrollbar text-xs">
          <p className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">
            Indexed Knowledge Files ({knowledgeList.length})
          </p>

          {knowledgeList.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-xl border border-border/70 bg-card/60 hover:bg-muted/30 transition-all space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{doc.title}</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium border-purple-500/40 text-purple-600">
                  {doc.tool}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {doc.summary}
              </p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground/75 pt-1">
                <span>Version: {doc.version}</span>
                <span>Indexed: {doc.indexedDate}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-border/70">
          <Button size="sm" onClick={() => onOpenChange(false)} className="h-8">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
