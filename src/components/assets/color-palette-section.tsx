"use client"

import * as React from "react"
import { toast } from "sonner"
import { Copy, Check } from "lucide-react"

interface ColorSwatch {
  name: string
  hex: string
  code: string
  copyText: string
}

interface PaletteGroup {
  id: string
  label: string
  colors: ColorSwatch[]
}

const PALETTE_GROUPS: PaletteGroup[] = [
  {
    id: "rgb",
    label: "RGB",
    colors: [
      { name: "Green", hex: "#548235", code: "R: 84  /  G: 130  /  B: 53",  copyText: "R: 84, G: 130, B: 53"  },
      { name: "Blue",  hex: "#4472C4", code: "R: 68  /  G: 114  /  B: 196", copyText: "R: 68, G: 114, B: 196" },
      { name: "Black", hex: "#000000", code: "R: 0  /  G: 0  /  B: 0",      copyText: "R: 0, G: 0, B: 0"      },
    ],
  },
  {
    id: "cmyk",
    label: "CMYK",
    colors: [
      { name: "Green", hex: "#548235", code: "C: 64  /  M: 9  /  Y: 95  /  K: 35", copyText: "C: 64, M: 9, Y: 95, K: 35"  },
      { name: "Blue",  hex: "#4472C4", code: "C: 65  /  M: 42  /  Y: 0  /  K: 23", copyText: "C: 65, M: 42, Y: 0, K: 23"  },
      { name: "Black", hex: "#000000", code: "C: 0  /  M: 0  /  Y: 0  /  K: 100",  copyText: "C: 0, M: 0, Y: 0, K: 100"   },
    ],
  },
  {
    id: "hex",
    label: "Hex Code",
    colors: [
      { name: "Green", hex: "#548235", code: "Hex: #548235", copyText: "#548235" },
      { name: "Blue",  hex: "#4472C4", code: "Hex: #4472C4", copyText: "#4472C4" },
      { name: "Black", hex: "#000000", code: "Hex: #000000", copyText: "#000000" },
    ],
  },
]

function lum(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}
const fg    = (hex: string) => lum(hex) > 0.45 ? "rgba(0,0,0,0.88)"  : "rgba(255,255,255,0.95)"
const muted = (hex: string) => lum(hex) > 0.45 ? "rgba(0,0,0,0.52)"  : "rgba(255,255,255,0.62)"

function ColorCard({ swatch }: { swatch: ColorSwatch }) {
  const [copied, setCopied] = React.useState(false)
  const fore  = fg(swatch.hex)
  const dim   = muted(swatch.hex)

  const doCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(swatch.copyText).then(() => {
      setCopied(true)
      toast.info(`Copied: ${swatch.copyText}`)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      onClick={doCopy}
      title="Click to copy"
      className="relative group rounded-2xl overflow-hidden cursor-pointer select-none transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl"
      style={{ height: "96px", backgroundColor: swatch.hex, boxShadow: "0 4px 20px rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.10)" }}
    >
      {/* depth gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(145deg,rgba(255,255,255,0.09) 0%,rgba(0,0,0,0.13) 100%)" }} />
      {/* hover ring */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" style={{ boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.28)" }} />

      {/* Color name — top left */}
      <span className="absolute top-4 left-4 text-sm font-bold uppercase tracking-widest" style={{ color: fore, textShadow: "0 1px 3px rgba(0,0,0,0.18)" }}>
        {swatch.name}
      </span>

      {/* Hover copy badge — top right */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
        style={{ background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.28)" }}>
        {copied ? <Check className="h-3 w-3" style={{ color: fore }} /> : <Copy className="h-3 w-3" style={{ color: fore }} />}
        <span className="text-[10px] font-semibold" style={{ color: fore }}>{copied ? "Copied!" : "Copy"}</span>
      </div>

      {/* Color code — bottom left */}
      <span className="absolute bottom-4 left-4 right-10 text-[14px] font-semibold font-mono leading-relaxed" style={{ color: dim }}>
        {swatch.code}
      </span>

      {/* Copy icon — bottom right, always visible */}
      <button onClick={doCopy} className="absolute bottom-3.5 right-3.5 p-1.5 rounded-lg transition-all duration-200"
        style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.22)" }}>
        {copied ? <Check className="h-3 w-3" style={{ color: fore }} /> : <Copy className="h-3 w-3" style={{ color: dim }} />}
      </button>
    </div>
  )
}

const GROUP_ACCENT: Record<string, string> = { rgb: "#548235", cmyk: "#4472C4", hex: "#333333" }

function PaletteGroupRow({ group }: { group: PaletteGroup }) {
  const accent = GROUP_ACCENT[group.id] ?? "#666"
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
        <h3 className="text-base font-extrabold tracking-tight uppercase text-foreground">{group.label}</h3>
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-xs text-muted-foreground font-medium">{group.colors.length} colors</span>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(group.colors.length, 4)}, 1fr)` }}>
        {group.colors.map((s) => <ColorCard key={`${group.id}-${s.name}`} swatch={s} />)}
      </div>
    </div>
  )
}

export function ColorPaletteSection() {
  return (
    <section className="mt-2">
      <div className="bg-muted/30 border border-border/80 rounded-2xl p-6 space-y-7">
        {/* Section header */}
        <div className="flex items-center gap-4 pb-4 border-b border-border/60">
          <h2 className="font-extrabold uppercase tracking-wider" style={{ fontSize: "22px", color: "#548235" }}>Official Color Palette</h2>
          <span className="text-xs text-muted-foreground font-medium ml-auto">3 groups · 9 colors</span>
        </div>

        {/* All groups inside one card, separated by dividers */}
        {PALETTE_GROUPS.map((group, i) => (
          <React.Fragment key={group.id}>
            {i > 0 && <div className="border-t border-border/40" />}
            <PaletteGroupRow group={group} />
          </React.Fragment>
        ))}
      </div>
    </section>
  )
}

