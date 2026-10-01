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
import { Textarea } from "@/components/ui/textarea"
import { Bookmark, Plus, Copy, Check, Trash2, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface SavedPromptsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplyPrompt?: (promptText: string) => void
}

interface PromptItem {
  id: string
  title: string
  content: string
  tags: string[]
}

const DEFAULT_PROMPTS: PromptItem[] = [
  {
    id: "p-1",
    title: "Official Transvolt EV Bus Livery",
    content: "Create a modern 12M transit bus side wrap with Transvolt Green (#548235) primary paint, flowing aerodynamic white and cyber lime ribbons, center-aligned official logo, and bold LED route display.",
    tags: ["Fleet", "Bus", "Official"],
  },
  {
    id: "p-2",
    title: "Executive Corporate Stationery Card",
    content: "Design a clean A4 corporate document layout with 20mm margin guides, official header logo, Poppins SemiBold hierarchy, and emerald green footer accent line.",
    tags: ["Stationery", "Corporate"],
  },
  {
    id: "p-3",
    title: "Ultra Fast HyperCharge Kiosk Banner",
    content: "Generate an upright 240kW DC charging station visual with dual CCS-2 cable mounts, glowing touch matrix display, and high-visibility reflective green safety markers.",
    tags: ["Charger", "Infrastructure"],
  },
]

export function SavedPromptsModal({
  open,
  onOpenChange,
  onApplyPrompt,
}: SavedPromptsModalProps) {
  const [prompts, setPrompts] = React.useState<PromptItem[]>(DEFAULT_PROMPTS)
  const [newTitle, setNewTitle] = React.useState("")
  const [newContent, setNewContent] = React.useState("")
  const [isAdding, setIsAdding] = React.useState(false)

  const handleAdd = () => {
    if (!newTitle.trim() || !newContent.trim()) return
    const item: PromptItem = {
      id: `prompt-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      tags: ["Custom"],
    }
    setPrompts([item, ...prompts])
    setNewTitle("")
    setNewContent("")
    setIsAdding(false)
    toast.success("Design prompt saved!")
  }

  const handleDelete = (id: string) => {
    setPrompts(prompts.filter((p) => p.id !== id))
    toast.info("Prompt removed.")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden flex flex-col p-6 rounded-2xl">
        <DialogHeader className="border-b border-border/70 pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/15 text-amber-600">
              <Bookmark className="h-4 w-4 fill-amber-500" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Saved Prompts & Design Notes
            </DialogTitle>
          </div>

          <Button
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            className="h-8 gap-1 text-xs bg-[#548235] hover:bg-[#548235]/90 text-white font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Prompt
          </Button>
        </DialogHeader>

        {isAdding && (
          <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-2.5 text-xs animate-in fade-in-50">
            <Input
              placeholder="Prompt Title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="text-xs h-8"
            />
            <Textarea
              placeholder="Prompt text or instructions for Eva Bot..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="text-xs min-h-[60px]"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="h-7 text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={handleAdd} className="h-7 text-xs bg-[#548235] text-white">
                Save Note
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2.5 py-3 overlay-scrollbar text-xs">
          {prompts.map((p) => (
            <div
              key={p.id}
              className="p-3.5 rounded-xl border border-border/70 bg-card/60 hover:bg-muted/30 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{p.title}</span>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      onApplyPrompt?.(p.content)
                      onOpenChange(false)
                      toast.success("Applied prompt to Eva Bot!")
                    }}
                    className="h-7 text-xs text-[#548235] hover:bg-[#548235]/10 font-semibold gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    Use in Eva
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(p.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {p.content}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-border/70">
          <Button size="sm" onClick={() => onOpenChange(false)} className="h-8">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
