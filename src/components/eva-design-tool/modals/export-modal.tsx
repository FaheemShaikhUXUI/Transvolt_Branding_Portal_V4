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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Download, Sparkles, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
  onExecuteExport: (format: string, transparentBg: boolean, scale: number) => void
}

export function ExportModal({
  open,
  onOpenChange,
  fileName,
  onExecuteExport,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = React.useState<
    "PNG" | "JPG" | "SVG" | "PDF" | "CDR" | "AI"
  >("PNG")
  const [transparentBg, setTransparentBg] = React.useState(false)
  const [scale, setScale] = React.useState(2)
  const [customFileName, setCustomFileName] = React.useState(fileName)

  React.useEffect(() => {
    setCustomFileName(fileName)
  }, [fileName])

  const formats = [
    { id: "PNG", label: "PNG", desc: "Raster with transparency" },
    { id: "JPG", label: "JPG", desc: "High quality photo print" },
    { id: "SVG", label: "SVG", desc: "Crisp vector curves" },
    { id: "PDF", label: "PDF", desc: "Print-ready document" },
    { id: "CDR", label: "CDR", desc: "CorelDRAW Vector Interchange" },
    { id: "AI", label: "AI", desc: "Adobe Illustrator Vector Spec" },
  ]

  const handleExport = () => {
    onOpenChange(false)
    if (selectedFormat === "CDR" || selectedFormat === "AI") {
      toast.info(
        `Preparing ${selectedFormat} vector interchange export format with full CMYK curve metadata...`
      )
    }
    onExecuteExport(selectedFormat, transparentBg, scale)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 rounded-2xl">
        <DialogHeader className="border-b border-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-600">
              <Download className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Export Artwork
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Choose output format and resolution settings for digital presentation or commercial printing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-3 text-xs">
          {/* File Name */}
          <div>
            <Label className="text-xs font-bold text-muted-foreground">File Name</Label>
            <Input
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              className="mt-1.5 text-xs h-9"
            />
          </div>

          {/* Formats Grid */}
          <div>
            <Label className="text-xs font-bold text-muted-foreground">Select Format</Label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {formats.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFormat(f.id as any)}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all",
                    selectedFormat === f.id
                      ? "border-[#548235] bg-[#548235]/10 shadow-xs ring-1 ring-[#548235]"
                      : "border-border/70 hover:border-border hover:bg-muted/30"
                  )}
                >
                  <p className="font-extrabold text-foreground">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Scale & Transparent BG for PNG/JPG */}
          {(selectedFormat === "PNG" || selectedFormat === "JPG") && (
            <div className="space-y-3 p-3 rounded-xl border border-border/60 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Resolution Scale</span>
                <span className="font-mono font-bold text-[#548235]">{scale}x ({scale * 100}%)</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full accent-[#548235] cursor-pointer"
              />

              {selectedFormat === "PNG" && (
                <div className="flex items-center justify-between pt-1">
                  <span className="font-medium text-foreground">Transparent Background</span>
                  <Checkbox
                    checked={transparentBg}
                    onCheckedChange={(c) => setTransparentBg(Boolean(c))}
                  />
                </div>
              )}
            </div>
          )}

          {(selectedFormat === "CDR" || selectedFormat === "AI") && (
            <div className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-cyan-950 dark:text-cyan-200 leading-relaxed">
                Vector curves, text glyphs, and Pantone swatches are preserved in SVG/PostScript interchange format for direct import into {selectedFormat === "CDR" ? "CorelDRAW 2026" : "Adobe Illustrator"}.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/70">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-9">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            className="h-9 px-5 bg-[#548235] hover:bg-[#548235]/90 text-white font-bold rounded-xl shadow-xs"
          >
            Export File
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
