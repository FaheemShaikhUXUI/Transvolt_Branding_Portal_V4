"use client"

import * as React from "react"
import {
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  FileText,
  Globe,
  Printer,
  ShieldCheck,
  Type,
  RotateCcw,
  SlidersHorizontal,
  Grid3X3,
  AlignLeft,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PageGuidelinesAccordion } from "./page-guidelines-accordion"

// --------------------------------------------------------------------------
// POFFINS SPECIMEN COMPONENT
// --------------------------------------------------------------------------

function PoppinsSpecimen() {
  const [activeTab, setActiveTab] = React.useState<"tester" | "glyphs" | "hierarchy">("tester")
  const [activeWeight, setActiveWeight] = React.useState<number>(600)
  const [fontSize, setFontSize] = React.useState<number>(36)
  const [customText, setCustomText] = React.useState<string>(
    "The quick brown fox jumps over the lazy dog."
  )

  const quickPhrases = [
    "Transvolt Mobility",
    "Clean Electric Mobility",
    "Aa Bb Cc 123 !@#",
    "The quick brown fox...",
  ]

  const weights = [
    { label: "Light", weight: 300, tag: "300" },
    { label: "Regular", weight: 400, tag: "400" },
    { label: "Medium", weight: 500, tag: "500" },
    { label: "SemiBold", weight: 600, tag: "600" },
    { label: "Bold", weight: 700, tag: "700" },
    { label: "ExtraBold", weight: 800, tag: "800" },
  ]

  const glyphsUppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
  const glyphsLowercase = "abcdefghijklmnopqrstuvwxyz".split("")
  const glyphsNumbers = "0123456789".split("")
  const glyphsSymbols = ["&", "@", "#", "$", "€", "£", "%", "*", "+", "=", "!", "?", "/", "(", ")"].map(s => s)

  return (
    <div
      className="rounded-2xl border border-border/80 bg-gradient-to-b from-muted/40 to-muted/10 p-5 space-y-4 select-none relative overflow-hidden shadow-inner"
      style={{ fontFamily: "var(--font-sans), 'Poppins', sans-serif" }}
    >
      {/* Background Typographic Watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -right-6 text-[180px] font-black leading-none text-[#4472C4]/5 select-none"
      >
        Aa
      </span>

      {/* Top Controls: Mode Switcher & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 relative z-10">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-background/80 border border-border/80 text-xs shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("tester")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
              activeTab === "tester"
                ? "bg-[#4472C4] text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <AlignLeft className="h-3.5 w-3.5" />
            <span>Interactive Tester</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("glyphs")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
              activeTab === "glyphs"
                ? "bg-[#4472C4] text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            <span>Glyphs</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("hierarchy")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
              activeTab === "hierarchy"
                ? "bg-[#4472C4] text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Hierarchy</span>
          </button>
        </div>

        {/* Font Size Quick Slider/Buttons */}
        {activeTab === "tester" && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium hidden sm:inline">Size:</span>
            <div className="flex items-center gap-1 bg-background/80 border border-border/80 p-0.5 rounded-lg">
              {[20, 32, 44].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer",
                    fontSize === size
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {size}px
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveWeight(600)
                setFontSize(36)
                setCustomText("The quick brown fox jumps over the lazy dog.")
              }}
              title="Reset tester"
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: INTERACTIVE LIVE TESTER */}
      {activeTab === "tester" && (
        <div className="space-y-4 relative z-10">
          {/* Blueprint Display Canvas with Baseline and Cap-Height Guidelines */}
          <div className="relative rounded-xl border border-border/80 bg-background/90 p-6 min-h-[140px] flex flex-col justify-center overflow-hidden shadow-xs transition-all">
            {/* Typographic metric reference lines (Blueprint effect) */}
            <div className="absolute inset-x-0 top-6 border-b border-dashed border-[#4472C4]/20 pointer-events-none flex justify-between px-3">
              <span className="text-[9px] font-mono text-[#4472C4]/50 uppercase tracking-widest">Cap Height</span>
            </div>
            <div className="absolute inset-x-0 bottom-6 border-b border-dashed border-[#4472C4]/20 pointer-events-none flex justify-between px-3">
              <span className="text-[9px] font-mono text-[#4472C4]/50 uppercase tracking-widest">Baseline</span>
            </div>

            {/* Editable Live Specimen Text */}
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              style={{
                fontWeight: activeWeight,
                fontSize: `${fontSize}px`,
                lineHeight: 1.25,
              }}
              className="w-full bg-transparent border-none outline-none text-foreground tracking-tight text-left transition-all duration-150 focus:ring-0 placeholder:text-muted-foreground/40"
              placeholder="Type custom text..."
            />
          </div>

          {/* Quick Preset Phrases Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-muted-foreground font-medium mr-1">Presets:</span>
            {quickPhrases.map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => setCustomText(phrase)}
                className="px-2.5 py-1 rounded-full text-[11px] bg-background/80 hover:bg-muted border border-border/70 text-foreground/80 hover:text-foreground font-medium transition-colors cursor-pointer"
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* Interactive Weight Selector Pills */}
          <div className="space-y-1.5 pt-1 text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Select Weight ({activeWeight}):
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {weights.map((w) => {
                const isActive = activeWeight === w.weight
                return (
                  <button
                    key={w.weight}
                    type="button"
                    onClick={() => setActiveWeight(w.weight)}
                    className={cn(
                      "p-2 rounded-xl border text-center transition-all cursor-pointer select-none",
                      isActive
                        ? "bg-[#4472C4] text-white border-[#4472C4] shadow-md shadow-[#4472C4]/20 scale-[1.02]"
                        : "bg-background/80 border-border/70 text-foreground/80 hover:bg-muted/70 hover:text-foreground"
                    )}
                  >
                    <span
                      className="block text-xs truncate"
                      style={{ fontWeight: w.weight }}
                    >
                      {w.label}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] block tracking-wider font-mono",
                        isActive ? "text-white/80" : "text-muted-foreground"
                      )}
                    >
                      {w.tag}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GLYPH MATRIX */}
      {activeTab === "glyphs" && (
        <div className="space-y-3 relative z-10 text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Uppercase Alphabet
            </span>
            <div className="flex flex-wrap gap-1 bg-background/90 p-2.5 rounded-xl border border-border/70">
              {glyphsUppercase.map((char) => (
                <span
                  key={char}
                  className="h-7 w-7 rounded-lg bg-muted/30 hover:bg-[#4472C4]/15 hover:text-[#4472C4] flex items-center justify-center text-xs font-semibold transition-all cursor-default hover:scale-110"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Lowercase Alphabet
            </span>
            <div className="flex flex-wrap gap-1 bg-background/90 p-2.5 rounded-xl border border-border/70">
              {glyphsLowercase.map((char) => (
                <span
                  key={char}
                  className="h-7 w-7 rounded-lg bg-muted/30 hover:bg-[#4472C4]/15 hover:text-[#4472C4] flex items-center justify-center text-xs font-semibold transition-all cursor-default hover:scale-110"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Numerals
              </span>
              <div className="flex flex-wrap gap-1 bg-background/90 p-2.5 rounded-xl border border-border/70">
                {glyphsNumbers.map((char) => (
                  <span
                    key={char}
                    className="h-7 w-7 rounded-lg bg-muted/30 hover:bg-[#4472C4]/15 hover:text-[#4472C4] flex items-center justify-center text-xs font-bold transition-all cursor-default hover:scale-110"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Special Characters
              </span>
              <div className="flex flex-wrap gap-1 bg-background/90 p-2.5 rounded-xl border border-border/70">
                {glyphsSymbols.map((char, i) => (
                  <span
                    key={i}
                    className="h-7 w-7 rounded-lg bg-muted/30 hover:bg-[#4472C4]/15 hover:text-[#4472C4] flex items-center justify-center text-xs font-bold transition-all cursor-default hover:scale-110"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HIERARCHY APPLICATION PREVIEW */}
      {activeTab === "hierarchy" && (
        <div className="space-y-3 relative z-10 text-left">
          <div className="bg-background/90 p-4 rounded-xl border border-border/70 space-y-3">
            <div>
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground border-b border-border/40 pb-1 mb-1.5">
                <span>Display Heading (Bold 28px)</span>
                <span>H1 Hero Headline</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Empowering Clean Urban Fleet Mobility
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground border-b border-border/40 pb-1 mb-1.5">
                <span>Section Subtitle (SemiBold 16px)</span>
                <span>H2 Subhead</span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-[#4472C4]">
                Next-Generation Commercial EV Charging Infrastructure
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground border-b border-border/40 pb-1 mb-1.5">
                <span>Body Paragraph (Regular 13px)</span>
                <span>Body Copy</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                Transvolt delivers tailored turnkey charging hubs, asset management standards, and fleet electrification for seamless enterprise logistics.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --------------------------------------------------------------------------
// CALIBRI SPECIMEN COMPONENT
// --------------------------------------------------------------------------

function CalibriSpecimen() {
  const [activeTab, setActiveTab] = React.useState<"tester" | "glyphs" | "hierarchy">("tester")
  const [activeStyle, setActiveStyle] = React.useState<"regular" | "italic" | "bold" | "bold-italic">("regular")
  const [fontSize, setFontSize] = React.useState<number>(32)
  const [customText, setCustomText] = React.useState<string>(
    "The quick brown fox jumps over the lazy dog."
  )

  const quickPhrases = [
    "Transvolt Mobility Private Limited",
    "Official Corporate Agreement",
    "Board of Directors Resolution",
    "Annual Operational Report",
  ]

  const styles = [
    { id: "regular", label: "Regular", weight: 400, italic: false, tag: "Normal" },
    { id: "italic", label: "Italic", weight: 400, italic: true, tag: "Oblique" },
    { id: "bold", label: "Bold", weight: 700, italic: false, tag: "Strong" },
    { id: "bold-italic", label: "Bold Italic", weight: 700, italic: true, tag: "Emphasis" },
  ] as const

  const currentStyleConfig = styles.find((s) => s.id === activeStyle) || styles[0]

  const glyphsUppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
  const glyphsLowercase = "abcdefghijklmnopqrstuvwxyz".split("")
  const glyphsNumbers = "0123456789".split("")
  const glyphsSymbols = ["&", "@", "#", "$", "€", "£", "%", "*", "+", "=", "!", "?", "/", "(", ")"].map(s => s)

  return (
    <div
      className="rounded-2xl border border-border/80 bg-gradient-to-b from-muted/40 to-muted/10 p-5 space-y-4 select-none relative overflow-hidden shadow-inner"
      style={{ fontFamily: "Calibri, 'Segoe UI', Arial, sans-serif" }}
    >
      {/* Background Typographic Watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -right-6 text-[180px] font-black leading-none text-[#548235]/5 select-none"
      >
        Aa
      </span>

      {/* Top Controls: Mode Switcher & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 relative z-10">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-background/80 border border-border/80 text-xs shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("tester")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
              activeTab === "tester"
                ? "bg-[#548235] text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <AlignLeft className="h-3.5 w-3.5" />
            <span>Interactive Tester</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("glyphs")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
              activeTab === "glyphs"
                ? "bg-[#548235] text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            <span>Glyphs</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("hierarchy")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
              activeTab === "hierarchy"
                ? "bg-[#548235] text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Doc Styles</span>
          </button>
        </div>

        {/* Font Size Quick Buttons */}
        {activeTab === "tester" && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium hidden sm:inline">Size:</span>
            <div className="flex items-center gap-1 bg-background/80 border border-border/80 p-0.5 rounded-lg">
              {[18, 28, 38].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer",
                    fontSize === size
                      ? "bg-[#548235]/15 text-[#548235]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {size}px
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveStyle("regular")
                setFontSize(32)
                setCustomText("The quick brown fox jumps over the lazy dog.")
              }}
              title="Reset tester"
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: INTERACTIVE LIVE TESTER */}
      {activeTab === "tester" && (
        <div className="space-y-4 relative z-10">
          {/* Blueprint Display Canvas */}
          <div className="relative rounded-xl border border-border/80 bg-background/90 p-6 min-h-[140px] flex flex-col justify-center overflow-hidden shadow-xs transition-all">
            {/* Typographic metric reference lines */}
            <div className="absolute inset-x-0 top-6 border-b border-dashed border-[#548235]/20 pointer-events-none flex justify-between px-3">
              <span className="text-[9px] font-mono text-[#548235]/50 uppercase tracking-widest">Cap Height</span>
            </div>
            <div className="absolute inset-x-0 bottom-6 border-b border-dashed border-[#548235]/20 pointer-events-none flex justify-between px-3">
              <span className="text-[9px] font-mono text-[#548235]/50 uppercase tracking-widest">Baseline</span>
            </div>

            {/* Editable Live Specimen Text */}
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              style={{
                fontWeight: currentStyleConfig.weight,
                fontStyle: currentStyleConfig.italic ? "italic" : "normal",
                fontSize: `${fontSize}px`,
                lineHeight: 1.25,
              }}
              className="w-full bg-transparent border-none outline-none text-foreground tracking-tight text-left transition-all duration-150 focus:ring-0 placeholder:text-muted-foreground/40"
              placeholder="Type custom text..."
            />
          </div>

          {/* Quick Preset Phrases Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-muted-foreground font-medium mr-1">Presets:</span>
            {quickPhrases.map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => setCustomText(phrase)}
                className="px-2.5 py-1 rounded-full text-[11px] bg-background/80 hover:bg-muted border border-border/70 text-foreground/80 hover:text-foreground font-medium transition-colors cursor-pointer"
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* Interactive Style Selector Pills */}
          <div className="space-y-1.5 pt-1 text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Select Style ({currentStyleConfig.label}):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {styles.map((s) => {
                const isActive = activeStyle === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveStyle(s.id)}
                    className={cn(
                      "p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none",
                      isActive
                        ? "bg-[#548235] text-white border-[#548235] shadow-md shadow-[#548235]/20 scale-[1.02]"
                        : "bg-background/80 border-border/70 text-foreground/80 hover:bg-muted/70 hover:text-foreground"
                    )}
                  >
                    <span
                      className="block text-sm truncate"
                      style={{
                        fontWeight: s.weight,
                        fontStyle: s.italic ? "italic" : "normal",
                      }}
                    >
                      {s.label}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] block tracking-wider font-mono mt-0.5",
                        isActive ? "text-white/80" : "text-muted-foreground"
                      )}
                    >
                      {s.tag}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GLYPH MATRIX */}
      {activeTab === "glyphs" && (
        <div className="space-y-3 relative z-10 text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Uppercase Alphabet
            </span>
            <div className="flex flex-wrap gap-1 bg-background/90 p-2.5 rounded-xl border border-border/70">
              {glyphsUppercase.map((char) => (
                <span
                  key={char}
                  className="h-7 w-7 rounded-lg bg-muted/30 hover:bg-[#548235]/15 hover:text-[#548235] flex items-center justify-center text-xs font-semibold transition-all cursor-default hover:scale-110"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Lowercase Alphabet
            </span>
            <div className="flex flex-wrap gap-1 bg-background/90 p-2.5 rounded-xl border border-border/70">
              {glyphsLowercase.map((char) => (
                <span
                  key={char}
                  className="h-7 w-7 rounded-lg bg-muted/30 hover:bg-[#548235]/15 hover:text-[#548235] flex items-center justify-center text-xs font-semibold transition-all cursor-default hover:scale-110"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Numerals
              </span>
              <div className="flex flex-wrap gap-1 bg-background/90 p-2.5 rounded-xl border border-border/70">
                {glyphsNumbers.map((char) => (
                  <span
                    key={char}
                    className="h-7 w-7 rounded-lg bg-muted/30 hover:bg-[#548235]/15 hover:text-[#548235] flex items-center justify-center text-xs font-bold transition-all cursor-default hover:scale-110"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Punctuation &amp; Legal
              </span>
              <div className="flex flex-wrap gap-1 bg-background/90 p-2.5 rounded-xl border border-border/70">
                {glyphsSymbols.map((char, i) => (
                  <span
                    key={i}
                    className="h-7 w-7 rounded-lg bg-muted/30 hover:bg-[#548235]/15 hover:text-[#548235] flex items-center justify-center text-xs font-bold transition-all cursor-default hover:scale-110"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENT HIERARCHY APPLICATION PREVIEW */}
      {activeTab === "hierarchy" && (
        <div className="space-y-3 relative z-10 text-left">
          <div className="bg-background/90 p-4 rounded-xl border border-border/70 space-y-3">
            <div>
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground border-b border-border/40 pb-1 mb-1.5">
                <span>Executive Document Heading (Bold 18pt)</span>
                <span>Title 1</span>
              </div>
              <p className="text-lg sm:text-xl font-bold tracking-normal text-foreground">
                CORPORATE SERVICE LEVEL AGREEMENT &amp; SPECIFICATIONS
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground border-b border-border/40 pb-1 mb-1.5">
                <span>Clause Subheading (Bold 13pt)</span>
                <span>Section Header</span>
              </div>
              <p className="text-sm font-bold text-[#548235]">
                Section 4.2 — Operational Compliance and Depot Maintenance Standards
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground border-b border-border/40 pb-1 mb-1.5">
                <span>Formal Body Text (Regular 11pt, 1.15 Line Spacing)</span>
                <span>Document Paragraph</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                This memorandum confirms the authorized operating procedures across all Transvolt Mobility logistics hubs. All regional personnel shall adhere strictly to the governance guidelines issued herein.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --------------------------------------------------------------------------
// MAIN TYPOGRAPHY SECTION COMPONENT
// --------------------------------------------------------------------------

export function TypographySection() {
  const [copiedFont, setCopiedFont] = React.useState<string | null>(null)

  const handleCopyCss = (fontFamilyName: string, cssSnippet: string) => {
    navigator.clipboard.writeText(cssSnippet)
    setCopiedFont(fontFamilyName)
    toast.success(`Copied CSS for ${fontFamilyName} to clipboard!`)
    setTimeout(() => {
      setCopiedFont(null)
    }, 2000)
  }

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Overview Guidelines Accordion */}
      <PageGuidelinesAccordion
        title="Transvolt Typography Standards & Font System"
        subtitle="Official brand typeface hierarchy, digital & print standards, and documentation guidelines"
        badgeText="Typography System"
        icon={<Type className="h-4 w-4" />}
        iconBg="bg-[#4472C4]/10"
        iconColor="text-[#4472C4]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left text-xs leading-relaxed text-muted-foreground">
          <div className="lg:col-span-6 space-y-3">
            <h4 className="text-sm font-bold text-[#4472C4] tracking-tight">The Role of Typography</h4>
            <p>
              Typography is one of the foundational elements of Transvolt&apos;s brand identity. It conveys our core values of innovation, clean energy, precision engineering, and professional integrity.
            </p>
            <p>
              To maintain consistency across diverse platforms, Transvolt strictly governs its typeface usage into two distinct categories: <strong className="text-foreground font-semibold">Poppins</strong> as our primary brand font for all public-facing media, and <strong className="text-foreground font-semibold">Calibri</strong> strictly for internal and formal documentation.
            </p>
          </div>

          <div className="lg:col-span-6 bg-card border border-border/80 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#548235]">Quick Usage Rules</h4>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="h-3 w-3 mt-0.5 rounded-full bg-[#548235]/15 text-[#548235] flex items-center justify-center font-bold text-[8px] shrink-0">✓</span>
                <span><strong className="text-foreground">Never substitute:</strong> Do not replace Poppins with Arial, Roboto, or Inter on brand assets.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-3 w-3 mt-0.5 rounded-full bg-[#548235]/15 text-[#548235] flex items-center justify-center font-bold text-[8px] shrink-0">✓</span>
                <span><strong className="text-foreground">Preserve proportions:</strong> Never condense, stretch, skew, or outline the fonts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-3 w-3 mt-0.5 rounded-full bg-[#548235]/15 text-[#548235] flex items-center justify-center font-bold text-[8px] shrink-0">✓</span>
                <span><strong className="text-foreground">Document boundary:</strong> Keep Calibri exclusively for documents; never use it in branding graphics.</span>
              </li>
            </ul>
          </div>
        </div>
      </PageGuidelinesAccordion>

      {/* Two Main Font Tiles: Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* TILE 1: Poppins Font Family */}
        <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-6 relative overflow-hidden group">
          {/* Subtle brand glow in corner */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#4472C4]/10 blur-2xl transition-all duration-500 group-hover:scale-125" />

          <div className="space-y-5 relative z-10 text-left">
            {/* Header: Title & Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2
                    className="font-extrabold tracking-tight text-foreground"
                    style={{ fontSize: "24px", fontFamily: "var(--font-sans), 'Poppins', sans-serif" }}
                  >
                    Poppins Font Family
                  </h2>
                  <Badge className="bg-[#4472C4]/10 text-[#4472C4] border-[#4472C4]/30 font-bold text-[10px] uppercase tracking-wider">
                    Primary Brand Font
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Geometric Sans-Serif Typeface by Jonny Pinhorn &amp; Indian Type Foundry
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#3564BD] via-[#4472C4] to-[#224FA9] text-white shadow-lg shadow-[#4472C4]/40 ring-4 ring-[#4472C4]/25 border border-white/30 text-xs sm:text-[13px] font-bold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#4472C4]/50 select-none">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/90 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white shadow-xs"></span>
                  </span>
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-white/20 shadow-inner shrink-0">
                    <Globe className="h-3.5 w-3.5 text-white stroke-[2.5]" />
                  </div>
                  <span className="font-extrabold tracking-wide drop-shadow-xs">Digital &amp; Print</span>
                </div>
              </div>
            </div>

            {/* UPGRADED INTERACTIVE SPECIMEN BOX */}
            <PoppinsSpecimen />

            {/* Enhanced Highlighted Description */}
            <div className="rounded-xl border border-[#4472C4]/20 bg-[#4472C4]/5 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-[#4472C4]">
                <Sparkles className="h-4 w-4 shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Mandatory Brand Application Guidelines
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
                Use the <strong className="font-bold text-[#4472C4]">Poppins Font Family</strong> for all <strong className="font-semibold text-foreground">Digital and Print Media</strong> across Transvolt. In digital media, this encompasses Web Applications, Mobile Applications, User Interfaces, Corporate Emailers, Social Media Posts, Festive Greetings, and Digital Newsletters. In print media, Poppins is mandatory for official Business Cards, Identity Cards, Banners, Collateral, Flyers, Exhibition Stalls, and all Marketing Communications. Its clean, modern geometric structure ensures exceptional legibility and consistent brand authority across all company touchpoints.
              </p>
            </div>

            {/* Application Scope Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1.5">
                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                  <Globe className="h-3.5 w-3.5 text-[#4472C4]" />
                  <span>Digital Media Scope</span>
                </div>
                <ul className="text-muted-foreground space-y-1 text-[11px]">
                  <li>• Web Applications &amp; Client Portals</li>
                  <li>• Mobile Applications &amp; UI Dashboards</li>
                  <li>• Corporate Emailers &amp; Newsletters</li>
                  <li>• Social Media Creatives &amp; Greetings</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1.5">
                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                  <Printer className="h-3.5 w-3.5 text-[#548235]" />
                  <span>Print Media Scope</span>
                </div>
                <ul className="text-muted-foreground space-y-1 text-[11px]">
                  <li>• Official Business Cards &amp; ID Badges</li>
                  <li>• Event Backdrops, Stalls &amp; Banners</li>
                  <li>• Marketing Brochures &amp; Catalogs</li>
                  <li>• Vehicle &amp; Charger Decals/Signage</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/60 relative z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopyCss("Poppins", "font-family: 'Poppins', var(--font-sans), sans-serif;")}
              className="text-xs font-semibold gap-1.5 rounded-xl cursor-pointer"
            >
              {copiedFont === "Poppins" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>CSS Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy CSS</span>
                </>
              )}
            </Button>

            <a
              href="https://fonts.google.com/specimen/Poppins"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4472C4] hover:underline"
            >
              <span>Download on Google Fonts</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* TILE 2: Calibri Font Family */}
        <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-6 relative overflow-hidden group">
          {/* Subtle ambient green glow in corner */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#548235]/10 blur-2xl transition-all duration-500 group-hover:scale-125" />

          <div className="space-y-5 relative z-10 text-left">
            {/* Header: Title & Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2
                    className="font-extrabold tracking-tight text-foreground"
                    style={{ fontSize: "24px", fontFamily: "Calibri, 'Segoe UI', Arial, sans-serif" }}
                  >
                    Calibri Font Family
                  </h2>
                  <Badge className="bg-[#548235]/10 text-[#548235] border-[#548235]/30 font-bold text-[10px] uppercase tracking-wider">
                    Documentation Standard
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Humanist Sans-Serif Typeface by Luc(as) de Groot (Microsoft Office Default)
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#446F29] via-[#548235] to-[#2E501A] text-white shadow-lg shadow-[#548235]/40 ring-4 ring-[#548235]/25 border border-white/30 text-xs sm:text-[13px] font-bold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#548235]/50 select-none">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/90 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white shadow-xs"></span>
                  </span>
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-white/20 shadow-inner shrink-0">
                    <FileText className="h-3.5 w-3.5 text-white stroke-[2.5]" />
                  </div>
                  <span className="font-extrabold tracking-wide drop-shadow-xs">Documentation Only</span>
                </div>
              </div>
            </div>

            {/* UPGRADED INTERACTIVE SPECIMEN BOX */}
            <CalibriSpecimen />

            {/* Enhanced Highlighted Description */}
            <div className="rounded-xl border border-[#548235]/20 bg-[#548235]/5 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-[#548235]">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Official Documentation Policy
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
                Use the <strong className="font-bold text-[#548235]">Calibri Font Family</strong> exclusively for <strong className="font-semibold text-foreground">Documentation use and official documents</strong> across the entire Transvolt organization. This includes formal corporate letters, executive correspondence, contracts, legal agreements, internal memoranda, official reports, corporate policies, financial filings, and spreadsheets. Calibri provides clean readability, balanced typographic proportions, and universal cross-platform fidelity across Microsoft Office, desktop operating systems, and official document archives throughout all departments.
              </p>
            </div>

            {/* Application Scope Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1.5">
                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                  <FileText className="h-3.5 w-3.5 text-[#548235]" />
                  <span>Approved Document Scope</span>
                </div>
                <ul className="text-muted-foreground space-y-1 text-[11px]">
                  <li>• Official Transvolt Letters &amp; Notices</li>
                  <li>• Internal Memoranda &amp; Circulars</li>
                  <li>• Legal Contracts, Agreements &amp; MoUs</li>
                  <li>• Financial Spreadsheets &amp; Audit Reports</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1.5">
                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#4472C4]" />
                  <span>Strict Governance Rules</span>
                </div>
                <ul className="text-muted-foreground space-y-1 text-[11px]">
                  <li>• Restricted strictly to documentation</li>
                  <li>• Never use for official logo recreation</li>
                  <li>• Do not use for marketing hoardings/flyers</li>
                  <li>• Default size: 11pt with 1.15 line spacing</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/60 relative z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopyCss("Calibri", "font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;")}
              className="text-xs font-semibold gap-1.5 rounded-xl cursor-pointer"
            >
              {copiedFont === "Calibri" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>CSS Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy CSS</span>
                </>
              )}
            </Button>

            <span className="text-xs text-muted-foreground font-medium">
              Standard Microsoft &amp; System Font
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
