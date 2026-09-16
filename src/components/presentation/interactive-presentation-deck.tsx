"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Minimize2,
  Grid,
  Sparkles,
  Download,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Layers,
  FileText,
  Image as ImageIcon,
  Users,
  Truck,
  BatteryCharging,
  Palette,
  Type,
  Compass,
  Building,
  IdCard,
  Share2,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Star,
  BarChart3,
  Lock,
  Database,
  Check,
  Network,
  Bell,
  Sliders,
  RotateCcw,
  Laptop,
  Eye,
  Mail,
  Sun,
  Moon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CatPeekEasterEgg } from "./cat-peek-easter-egg"

interface InteractivePresentationDeckProps {
  isOpen: boolean
  onClose: () => void
  onRequestAccess?: () => void
}

interface SlideData {
  id: number
  category: string
  title: string
  subtitle: string
  render: (helpers: SlideHelperProps) => React.ReactNode
}

interface SlideHelperProps {
  onNext: () => void
  onPrev: () => void
  onJump: (index: number) => void
  onRequestAccess?: () => void
}

interface SlideTile {
  title: string
  desc: string
  icon: React.ReactNode
  color?: "emerald" | "cyan" | "blue" | "purple" | "amber" | "rose" | "indigo"
}

// -------------------------------------------------------------
// THEME CONTEXT: Default (Black) & White Themes
// -------------------------------------------------------------
type PresentationTheme = "black" | "white"

const PresentationThemeContext = React.createContext<{
  theme: PresentationTheme
  setTheme: (t: PresentationTheme) => void
}>({
  theme: "black",
  setTheme: () => {}
})

// -------------------------------------------------------------
// SLIDE REUSABLE COMPONENTS & THEME STYLES (Option 1 & Option 2)
// -------------------------------------------------------------


const COLOR_STYLES_DARK = {
  emerald: {
    iconBox: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    hoverBorder: "hover:border-emerald-500/40",
    glow: "group-hover:shadow-[0_0_24px_rgba(16,185,129,0.18)]"
  },
  cyan: {
    iconBox: "bg-cyan-500/15 border-cyan-500/30 text-cyan-400",
    hoverBorder: "hover:border-cyan-500/40",
    glow: "group-hover:shadow-[0_0_24px_rgba(6,182,212,0.18)]"
  },
  blue: {
    iconBox: "bg-blue-500/15 border-blue-500/30 text-blue-400",
    hoverBorder: "hover:border-blue-500/40",
    glow: "group-hover:shadow-[0_0_24px_rgba(59,130,246,0.18)]"
  },
  purple: {
    iconBox: "bg-purple-500/15 border-purple-500/30 text-purple-400",
    hoverBorder: "hover:border-purple-500/40",
    glow: "group-hover:shadow-[0_0_24px_rgba(168,85,247,0.18)]"
  },
  amber: {
    iconBox: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    hoverBorder: "hover:border-amber-500/40",
    glow: "group-hover:shadow-[0_0_24px_rgba(245,158,11,0.18)]"
  },
  rose: {
    iconBox: "bg-rose-500/15 border-rose-500/30 text-rose-400",
    hoverBorder: "hover:border-rose-500/40",
    glow: "group-hover:shadow-[0_0_24px_rgba(244,63,94,0.18)]"
  },
  indigo: {
    iconBox: "bg-indigo-500/15 border-indigo-500/30 text-indigo-400",
    hoverBorder: "hover:border-indigo-500/40",
    glow: "group-hover:shadow-[0_0_24px_rgba(99,102,241,0.18)]"
  }
}

const COLOR_STYLES_LIGHT = {
  emerald: {
    iconBox: "bg-emerald-50 border-emerald-200 text-emerald-600",
    hoverBorder: "hover:border-emerald-400",
    glow: "group-hover:shadow-[0_8px_20px_rgba(16,185,129,0.12)]"
  },
  cyan: {
    iconBox: "bg-cyan-50 border-cyan-200 text-cyan-600",
    hoverBorder: "hover:border-cyan-400",
    glow: "group-hover:shadow-[0_8px_20px_rgba(6,182,212,0.12)]"
  },
  blue: {
    iconBox: "bg-blue-50 border-blue-200 text-blue-600",
    hoverBorder: "hover:border-blue-400",
    glow: "group-hover:shadow-[0_8px_20px_rgba(59,130,246,0.12)]"
  },
  purple: {
    iconBox: "bg-purple-50 border-purple-200 text-purple-600",
    hoverBorder: "hover:border-purple-400",
    glow: "group-hover:shadow-[0_8px_20px_rgba(168,85,247,0.12)]"
  },
  amber: {
    iconBox: "bg-amber-50 border-amber-200 text-amber-600",
    hoverBorder: "hover:border-amber-400",
    glow: "group-hover:shadow-[0_8px_20px_rgba(245,158,11,0.12)]"
  },
  rose: {
    iconBox: "bg-rose-50 border-rose-200 text-rose-600",
    hoverBorder: "hover:border-rose-400",
    glow: "group-hover:shadow-[0_8px_20px_rgba(244,63,94,0.12)]"
  },
  indigo: {
    iconBox: "bg-indigo-50 border-indigo-200 text-indigo-600",
    hoverBorder: "hover:border-indigo-400",
    glow: "group-hover:shadow-[0_8px_20px_rgba(99,102,241,0.12)]"
  }
}

/**
 * Slide Header: Static at top on EVERY slide (30px from top)
 * Left: Bold Title (+25% bigger) with vibrant brand gradient
 * Right: Official Transvolt Logo from Portal (Logo White in Black theme, Logo Black in White theme)
 */
function SlideHeader({ title }: { title: string }) {
  const { theme } = React.useContext(PresentationThemeContext)
  const isWhite = theme === "white"

  return (
    <div className={cn(
      "flex items-center justify-between pb-2.5 sm:pb-3 border-b mb-4 sm:mb-5 w-full select-none transition-colors",
      isWhite ? "border-slate-200" : "border-white/10"
    )}>
      <h2
        className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight leading-tight text-transparent bg-clip-text"
        style={{
          backgroundImage: isWhite
            ? "linear-gradient(90deg, #16a34a 0%, #0284c7 70%, #2563eb 100%)"
            : "linear-gradient(90deg, #22C55E 0%, #10B981 30%, #06B6D4 70%, #3B82F6 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: isWhite ? "none" : "drop-shadow(0 2px 14px rgba(34, 197, 94, 0.2))",
        }}
      >
        {title}
      </h2>
      <div className="flex items-center select-none shrink-0 pl-4">
        {/* Official Portal Logo: Logo White on Black theme, Logo Black on White theme */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={isWhite ? "/logos/Logo_Black.svg" : "/logos/Logo_White.svg"}
          alt="Transvolt Logo"
          className="h-[19px] sm:h-[22px] md:h-6 w-auto object-contain transition-all"
          draggable={false}
        />
      </div>
    </div>
  )
}

/**
 * Option 1 Style (Content size decreased by 15% for optimal viewport fit):
 * - Static space from top
 * - Full-width Content Headline & Paragraph (15% more compact)
 * - Lower Section: Left = Vertical Bullet points list; Right = 3x2 Grid of Slightly Colorful Tiles
 */
function SlideLayoutOption1({
  title,
  headline,
  paragraph,
  bullets,
  tiles
}: {
  title: string
  headline: string
  paragraph: string
  bullets: string[]
  tiles: SlideTile[]
}) {
  const { theme } = React.useContext(PresentationThemeContext)
  const isWhite = theme === "white"
  const stylesMap = isWhite ? COLOR_STYLES_LIGHT : COLOR_STYLES_DARK
  const colorKeys = Object.keys(stylesMap) as (keyof typeof stylesMap)[]

  return (
    <div className="w-full text-left">
      <div className="step-reveal-1">
        <SlideHeader title={title} />
      </div>

      {/* Top Headline & Paragraph (Decreased by 15%) */}
      <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-5 step-reveal-2">
        <h3 className={cn(
          "text-xl sm:text-2xl lg:text-[29px] font-bold tracking-tight leading-snug transition-colors",
          isWhite ? "text-slate-900" : "text-white"
        )}>
          {headline}
        </h3>
        <p className={cn(
          "text-sm sm:text-base lg:text-[15.5px] leading-relaxed max-w-6xl font-normal transition-colors",
          isWhite ? "text-slate-600" : "text-[#b4b4bc]"
        )}>
          {paragraph}
        </p>
      </div>

      {/* Lower Section: Bullets Left, 3x2 Tiles Right (Decreased by 15%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Bullets List */}
        <div className="lg:col-span-4 space-y-2.5 sm:space-y-3 pr-2">
          {bullets.map((point, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 text-sm sm:text-base lg:text-[15.5px]"
              style={{
                animation: `stepReveal 0.58s cubic-bezier(0.16, 1, 0.3, 1) ${0.18 + idx * 0.05}s both`,
                willChange: "opacity, transform"
              }}
            >
              <span className={cn(
                "text-lg sm:text-xl select-none leading-none mt-0.5 shrink-0 transition-colors",
                isWhite ? "text-emerald-600" : "text-white"
              )}>•</span>
              <span className={cn(
                "font-medium leading-snug transition-colors",
                isWhite ? "text-slate-800" : "text-slate-100"
              )}>{point}</span>
            </div>
          ))}
        </div>

        {/* Right Tiles Grid (3 columns on desktop) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
          {tiles.map((tile, idx) => {
            const colorKey = tile.color || colorKeys[idx % colorKeys.length]
            const style = stylesMap[colorKey]
            return (
              <div
                key={idx}
                className={cn(
                  "group rounded-2xl p-4 sm:p-4.5 transition-all duration-200 flex flex-col justify-center gap-1.5",
                  isWhite
                    ? "bg-white hover:bg-slate-50/80 border border-slate-200/90 shadow-sm hover:shadow-md"
                    : "bg-[#1c1c20] hover:bg-[#24242a] border border-white/[0.09] shadow-lg",
                  style.hoverBorder,
                  style.glow
                )}
                style={{
                  animation: `stepReveal 0.64s cubic-bezier(0.16, 1, 0.3, 1) ${0.24 + idx * 0.06}s both`,
                  willChange: "opacity, transform"
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn("h-9 w-9 sm:h-9.5 sm:w-9.5 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", style.iconBox)}>
                    {tile.icon}
                  </div>
                  <h4 className={cn(
                    "text-sm sm:text-base lg:text-[15.5px] font-bold transition-colors leading-tight",
                    isWhite ? "text-slate-900 group-hover:text-emerald-600" : "text-white group-hover:text-cyan-300"
                  )}>
                    {tile.title}
                  </h4>
                </div>
                <p className={cn(
                  "text-xs sm:text-[12.5px] leading-relaxed pl-11.5 sm:pl-12 transition-colors",
                  isWhite ? "text-slate-600" : "text-slate-300"
                )}>
                  {tile.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * Option 2 Style (Content size decreased by 15% for optimal viewport fit):
 * - Static space from top
 * - Split 2-Column: Left = Headline + Paragraph + Bullets; Right = 2x3 Grid of Slightly Colorful Tiles
 */
function SlideLayoutOption2({
  title,
  headline,
  paragraph,
  bullets,
  tiles
}: {
  title: string
  headline: string
  paragraph: string
  bullets: string[]
  tiles: SlideTile[]
}) {
  const { theme } = React.useContext(PresentationThemeContext)
  const isWhite = theme === "white"
  const stylesMap = isWhite ? COLOR_STYLES_LIGHT : COLOR_STYLES_DARK
  const colorKeys = Object.keys(stylesMap) as (keyof typeof stylesMap)[]

  return (
    <div className="w-full text-left">
      <div className="step-reveal-1">
        <SlideHeader title={title} />
      </div>

      {/* Two-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-9 items-start">
        {/* Left Column: Headline, Paragraph, Bullets (Decreased by 15%) */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-3.5">
          <div className="space-y-2 sm:space-y-2.5 step-reveal-2">
            <h3 className={cn(
              "text-xl sm:text-2xl lg:text-[29px] font-bold tracking-tight leading-snug transition-colors",
              isWhite ? "text-slate-900" : "text-white"
            )}>
              {headline}
            </h3>
            <p className={cn(
              "text-sm sm:text-base lg:text-[15.5px] leading-relaxed font-normal transition-colors",
              isWhite ? "text-slate-600" : "text-[#b4b4bc]"
            )}>
              {paragraph}
            </p>
          </div>

          <div className="space-y-2.5 sm:space-y-3 pt-1">
            {bullets.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-sm sm:text-base lg:text-[15.5px]"
                style={{
                  animation: `stepReveal 0.58s cubic-bezier(0.16, 1, 0.3, 1) ${0.18 + idx * 0.05}s both`,
                  willChange: "opacity, transform"
                }}
              >
                <span className={cn(
                  "text-lg sm:text-xl select-none leading-none mt-0.5 shrink-0 transition-colors",
                  isWhite ? "text-emerald-600" : "text-white"
                )}>•</span>
                <span className={cn(
                  "font-medium leading-snug transition-colors",
                  isWhite ? "text-slate-800" : "text-slate-100"
                )}>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: 2 columns of Tiles (Decreased by 15%) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
          {tiles.map((tile, idx) => {
            const colorKey = tile.color || colorKeys[idx % colorKeys.length]
            const style = stylesMap[colorKey]
            return (
              <div
                key={idx}
                className={cn(
                  "group rounded-2xl p-4 sm:p-4.5 transition-all duration-200 flex flex-col justify-center gap-1.5",
                  isWhite
                    ? "bg-white hover:bg-slate-50/80 border border-slate-200/90 shadow-sm hover:shadow-md"
                    : "bg-[#1c1c20] hover:bg-[#24242a] border border-white/[0.09] shadow-lg",
                  style.hoverBorder,
                  style.glow
                )}
                style={{
                  animation: `stepReveal 0.64s cubic-bezier(0.16, 1, 0.3, 1) ${0.24 + idx * 0.06}s both`,
                  willChange: "opacity, transform"
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn("h-9 w-9 sm:h-9.5 sm:w-9.5 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", style.iconBox)}>
                    {tile.icon}
                  </div>
                  <h4 className={cn(
                    "text-sm sm:text-base lg:text-[15.5px] font-bold transition-colors leading-tight",
                    isWhite ? "text-slate-900 group-hover:text-emerald-600" : "text-white group-hover:text-cyan-300"
                  )}>
                    {tile.title}
                  </h4>
                </div>
                <p className={cn(
                  "text-xs sm:text-[12.5px] leading-relaxed pl-11.5 sm:pl-12 transition-colors",
                  isWhite ? "text-slate-600" : "text-slate-300"
                )}>
                  {tile.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// SPEED DURATION CONFIGURATION (Matches Reference Image)
// 11 Ticks across 10 Segments; Index 5 is Center Default (x1 = 8.0s)
// -------------------------------------------------------------
const SPEED_CONFIGS = [
  { speed: 0.5, label: "x0.5", durationMs: 28800 },
  { speed: 0.6, label: "x0.6", durationMs: 22000 },
  { speed: 0.7, label: "x0.7", durationMs: 17000 },
  { speed: 0.8, label: "x0.8", durationMs: 13000 },
  { speed: 0.9, label: "x0.9", durationMs: 10000 },
  { speed: 1.0, label: "x1",   durationMs: 8000 },
  { speed: 1.2, label: "x1.2", durationMs: 6667 },
  { speed: 1.4, label: "x1.4", durationMs: 5714 },
  { speed: 1.6, label: "x1.6", durationMs: 5000 },
  { speed: 1.8, label: "x1.8", durationMs: 4444 },
  { speed: 2.0, label: "x2",   durationMs: 4000 },
]

// -------------------------------------------------------------
// MAIN PRESENTATION DECK COMPONENT
// -------------------------------------------------------------

export function InteractivePresentationDeck({
  isOpen,
  onClose,
  onRequestAccess
}: InteractivePresentationDeckProps) {
  const [theme, setTheme] = React.useState<PresentationTheme>("black")
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(true)
  const [isPaused, setIsPaused] = React.useState(false)
  const [showThumbnails, setShowThumbnails] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  // Speed Duration Slider (default index 2 = x0.7, 17.0s per slide)
  const [speedIndex, setSpeedIndex] = React.useState<number>(2)
  const currentSpeed = SPEED_CONFIGS[speedIndex] || SPEED_CONFIGS[5]
  const slideDurationMs = currentSpeed.durationMs

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Strictly eliminate and suppress running vehicle SVG while presentation is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add("presentation-deck-open")
      window.dispatchEvent(new Event("presentation-deck-toggle"))
      return () => {
        document.body.classList.remove("presentation-deck-open")
        window.dispatchEvent(new Event("presentation-deck-toggle"))
      }
    }
  }, [isOpen])

  const isWhite = theme === "white"

  const slides: SlideData[] = [
    // -------------------------------------------------------------
    // SLIDE 0: COVER / HOME SLIDE (PRESERVED PER USER REQUEST)
    // -------------------------------------------------------------
    {
      id: 0,
      category: "Welcome",
      title: "TRANSVOLT BRAND MANAGEMENT PORTAL",
      subtitle: "One Platform. One Trusted Source for Transvolt Branding.",
      render: ({ onNext }) => (
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto py-2 sm:py-3.5">
          {/* Transvolt Logo with Equal Breathing Space (Step 1, decreased by 15%) */}
          <div
            className="pt-2 sm:pt-3 pb-4 sm:pb-5 flex items-center justify-center step-reveal-1"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isWhite ? "/logos/Logo_Black.svg" : "/logos/Logo_White.svg"}
              alt="Transvolt Logo"
              className="h-10 sm:h-13 md:h-16 w-auto object-contain transition-all drop-shadow-sm"
              draggable={false}
            />
          </div>

          {/* Content Below the Transvolt Logo */}
          <div className="space-y-5 sm:space-y-6 w-full">
            {/* Main Title & Tagline (Step 2, decreased by 15%) */}
            <div className="space-y-2.5 sm:space-y-3 step-reveal-2">
              <h1
                className="text-xl sm:text-3xl lg:text-[41px] font-extrabold text-transparent bg-clip-text tracking-tight"
                style={{
                  backgroundImage: isWhite
                    ? "linear-gradient(90deg, #16a34a 0%, #0284c7 70%, #2563eb 100%)"
                    : "linear-gradient(90deg, #22C55E 0%, #10B981 30%, #06B6D4 70%, #3B82F6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: isWhite ? "none" : "drop-shadow(0 4px 20px rgba(34, 197, 94, 0.25))",
                }}
              >
                BRAND MANAGEMENT PORTAL
              </h1>

              <p className={cn(
                "text-base sm:text-xl font-medium tracking-wide max-w-2xl mx-auto transition-colors",
                isWhite ? "text-slate-700" : "text-slate-200"
              )}>
                One Platform. One Trusted Source for Transvolt Branding.
              </p>
            </div>

            {/* Description Lead (Step 3, decreased by 15%) */}
            <p
              className={cn(
                "text-xs sm:text-sm max-w-2xl leading-relaxed mx-auto transition-colors step-reveal-3",
                isWhite ? "text-slate-600" : "text-slate-300"
              )}
            >
              A centralized enterprise platform to manage, access, verify, generate, share, and control Transvolt&apos;s approved brand assets, corporate information, and multi-location branding resources.
            </p>

            {/* Feature Highlight Pills (Step 4 - Cascading Stagger, decreased by 15%) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-2xl mx-auto pt-1">
              {[
                { icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />, title: "Single Source of Truth" },
                { icon: <Zap className="h-4 w-4 text-cyan-500" />, title: "Lossless Formats Vault" },
                { icon: <Truck className="h-4 w-4 text-blue-500" />, title: "Fleet & Charger Standards" },
                { icon: <Lock className="h-4 w-4 text-indigo-500" />, title: "Role-Based Governance" }
              ].map((pill, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all",
                    isWhite
                      ? "border-slate-200 bg-white hover:bg-slate-50 shadow-sm"
                      : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                  )}
                  style={{
                    animation: `stepReveal 0.58s cubic-bezier(0.16, 1, 0.3, 1) ${0.26 + idx * 0.06}s both`,
                    willChange: "opacity, transform"
                  }}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg border flex items-center justify-center",
                    isWhite ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                  )}>
                    {pill.icon}
                  </div>
                  <span className={cn(
                    "text-[11px] sm:text-xs font-semibold text-center transition-colors",
                    isWhite ? "text-slate-800" : "text-slate-200"
                  )}>
                    {pill.title}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Actions (Step 5, decreased by 15%) */}
            <div
              className="flex items-center justify-center pt-2 sm:pt-3 w-full"
              style={{
                animation: "stepReveal 0.64s cubic-bezier(0.16, 1, 0.3, 1) 0.52s both",
                willChange: "opacity, transform"
              }}
            >
              <Button
                type="button"
                onClick={onNext}
                className="w-full sm:w-auto h-10 sm:h-11 px-6 sm:px-7 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <span>Explore Presentation</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Bottom-left Notice per user requirement (Orange color) */}
            <div className="w-full text-left pt-4 sm:pt-6">
              <p className="text-[10px] sm:text-[11px] text-orange-400 font-medium tracking-wide select-none flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                <span>Note: For portal demonstration only — not an official presentation theme.</span>
              </p>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 1: WHY THIS PORTAL? (OPTION 1 STYLE)
    // -------------------------------------------------------------
    {
      id: 1,
      category: "01 — Why This Portal?",
      title: "Why This Portal?",
      subtitle: "Solving Real Branding & Operational Challenges across India.",
      render: () => (
        <SlideLayoutOption1
          title="Why This Portal?"
          headline="Solving Real Branding & Operational Challenges"
          paragraph="As Transvolt operates across multiple states, companies, sites, projects, OEMs, stakeholders, employees, and vendors, managing the right branding information and approved assets becomes increasingly complex. The portal solves these practical operational challenges through one controlled and trusted platform."
          bullets={[
            "Multi-state transit operations across India",
            "Multiple legal entities & operating subsidiaries",
            "Frequent vendor logo & high-res artwork requests",
            "Site-wise depot teams needing rapid brand access",
            "Zero tolerance for unapproved brand circulation",
            "Need for verifiable corporate legal credentials"
          ]}
          tiles={[
            {
              title: "Controlled Access",
              desc: "Super Admin grants in-house employees & external partners exact permissions (View, Download, Edit, Manage).",
              icon: <Lock className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Employee ID & Cards",
              desc: "Maintained site-wise. Instant generation of official ID Cards and Business Cards with secure timed links.",
              icon: <IdCard className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Org Hierarchy",
              desc: "Maintains site-wise team hierarchy, auto-arranged reporting structures, and interactive department trees.",
              icon: <Network className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "6-Hour Vendor Links",
              desc: "Generates time-limited 6-hour links with approved SVG, PNG, CDR, and exact color codes. No manual email chains.",
              icon: <Clock className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "Multi-Firm Letterheads",
              desc: "Correct letterheads for each Transvolt legal entity in one place, ensuring Legal and Tax compliance.",
              icon: <FileText className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Fleet Wrap Control",
              desc: "Store approved artwork for each specific OEM chassis, vehicle model & charger dimension before press.",
              icon: <Truck className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 2: WHAT IS THE BRAND PORTAL? (OPTION 2 STYLE)
    // -------------------------------------------------------------
    {
      id: 2,
      category: "02 — What is the Portal?",
      title: "What is the Brand Portal?",
      subtitle: "The Single Source of Truth for Transvolt Branding.",
      render: () => (
        <SlideLayoutOption2
          title="What is the Brand Portal?"
          headline="The Single Source of Truth for Transvolt"
          paragraph="The portal acts as the centralized enterprise platform for Transvolt's branding ecosystem, bringing every corporate department, regional depot, and external agency into complete brand alignment."
          bullets={[
            "One trusted destination for every approved file",
            "100% loss-free vector & print assets (SVG, CDR, PDF)",
            "Real-time synchronization across all regional depots",
            "Direct self-service for authorized team members",
            "Multi-entity legal stationery compliance guaranteed",
            "Zero dependency on ad-hoc email chains or WhatsApp"
          ]}
          tiles={[
            {
              title: "Brand Identity Hub",
              desc: "Official logos, clear space, primary and secondary brand palettes.",
              icon: <Palette className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Corporate Documents",
              desc: "Verified multi-entity letterheads & official Word stationery templates.",
              icon: <FileText className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Employee Identity Data",
              desc: "Site-wise employee rosters & automated official ID card generator.",
              icon: <IdCard className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Digital & Print Collateral",
              desc: "Social media, official emailers, brochures, and depot signage templates.",
              icon: <Layers className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Fleet & Charger Wraps",
              desc: "OEM-specific body wraps and high-voltage charging depot specifications.",
              icon: <Truck className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "Controlled Timed Sharing",
              desc: "6-Hour secure link generator & granular role-based permissions.",
              icon: <Lock className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 3: DASHBOARD (OPTION 2 STYLE)
    // -------------------------------------------------------------
    {
      id: 3,
      category: "03 — Dashboard",
      title: "Dashboard Overview",
      subtitle: "Brand Management at a Glance with Executive Clarity.",
      render: () => (
        <SlideLayoutOption2
          title="Dashboard Overview"
          headline="Brand Management at a Glance"
          paragraph="The Dashboard gives team members and leadership an executive birds-eye overview of the brand ecosystem, highlighting recently updated assets, pending approvals, and high-frequency quick links."
          bullets={[
            "Global instant search across all 11+ brand categories",
            "Real-time notifications for updates, requests, and approvals",
            "Quick-access shortcuts to frequently downloaded files",
            "Clear lifecycle indicators (Active, Hold, Draft, Reviewed)",
            "Live repository metrics tracking total assets and downloads"
          ]}
          tiles={[
            {
              title: "Global Search Engine",
              desc: "Type keywords to locate exact files, color specs, or documents instantly.",
              icon: <Sparkles className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Live Activity Feed",
              desc: "Audit log of recently uploaded artwork, edits, and team access requests.",
              icon: <Clock className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Rapid Download Hub",
              desc: "1-Click downloads of standard brand kits, logos, and vector suites.",
              icon: <Download className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Multi-Category Matrix",
              desc: "Direct navigation to Letterhead, Vehicles, Typography, and Identity.",
              icon: <Grid className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Asset Status Control",
              desc: "Instantly toggle assets to On Hold or Inactive to block downloads.",
              icon: <ShieldCheck className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "Notification Center",
              desc: "Interactive bell notifying admins of pending portal access requests.",
              icon: <Bell className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 4: LOGO & COLOR (OPTION 1 STYLE)
    // -------------------------------------------------------------
    {
      id: 4,
      category: "04 — Logo & Color",
      title: "Logo & Color System",
      subtitle: "One Official Source for Transvolt Brand Identity.",
      render: () => (
        <SlideLayoutOption1
          title="Logo & Color System"
          headline="One Official Source for Brand Identity"
          paragraph="Multi-format vector and transparent logos with precise hex, RGB, and CMYK color standards. Eliminates outdated logos and pixelated low-res assets across all digital platforms, physical signage, and print collateral."
          bullets={[
            "Primary White Logo with Signature Green & Blue Arrows",
            "Secondary Monochrome, Black & Full White Variants",
            "Lossless transparent PNG, scalable SVG, CDR & PDF",
            "High-resolution vector outputs calibrated for print presses",
            "Exact hex codes (#548235 Green, #00A4EF / #3B82F6 Blue)",
            "Pre-approved clear space rules & minimum dimension limits"
          ]}
          tiles={[
            {
              title: "Transparent PNG Vault",
              desc: "Ultra-sharp alpha channel PNGs for digital apps, slides, and web interfaces.",
              icon: <ImageIcon className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Scalable Vector SVG",
              desc: "Infinitely scalable vector assets that never lose crispness or resolution.",
              icon: <Layers className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "CorelDraw CDR Suite",
              desc: "Native CDR artwork files required by vinyl wrap cutters and outdoor signboards.",
              icon: <FileText className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Vector PDF Standards",
              desc: "Commercial print-ready files embedding spot colors and outlined fonts.",
              icon: <Download className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Exact Brand Palettes",
              desc: "Standardized color codes: HEX, RGB, CMYK, and Pantone matching.",
              icon: <Palette className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "6-Hour Vendor Links",
              desc: "Generate timed direct download links for external printers with 1 click.",
              icon: <Share2 className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 5: TYPOGRAPHY (OPTION 2 STYLE)
    // -------------------------------------------------------------
    {
      id: 5,
      category: "05 — Typography",
      title: "Typography Guidelines",
      subtitle: "Consistent Corporate & Digital Brand Communication.",
      render: () => (
        <SlideLayoutOption2
          title="Typography Guidelines"
          headline="Consistent Brand Communication"
          paragraph="Official typefaces and hierarchical typography guidelines ensuring clean, legible, and authoritative communication across digital interfaces, marketing collateral, and corporate legal correspondence."
          bullets={[
            "Poppins: Primary Brand & Digital Typeface across web & marketing",
            "Calibri: Corporate, Formal & Legal Correspondence standard",
            "Standardized font weights from Light (300) to Bold (700)",
            "Strict hierarchy rules for hero headlines, subheads, and body copy",
            "Guaranteed cross-platform compatibility across Windows, Mac, & mobile"
          ]}
          tiles={[
            {
              title: "Poppins Bold (700)",
              desc: "High-impact headlines, hero display titles, and prominent billboard branding.",
              icon: <Type className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Poppins SemiBold (600)",
              desc: "Section headers, button text, navigation labels, and modal titles.",
              icon: <Type className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Poppins Regular (400)",
              desc: "Digital body copy, feature bullet points, and web application descriptions.",
              icon: <Type className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Calibri Regular (11pt)",
              desc: "Standard body text for formal business letters, notices, and agreements.",
              icon: <FileText className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Calibri Bold",
              desc: "Clause headers, signatory designations, and formal document sub-headings.",
              icon: <FileText className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "Web & Print Packages",
              desc: "1-Click download of approved font installation files for all workstations.",
              icon: <Laptop className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 6: BRAND PHILOSOPHY (OPTION 1 STYLE)
    // -------------------------------------------------------------
    {
      id: 6,
      category: "06 — Brand Philosophy",
      title: "Brand Philosophy",
      subtitle: "Understanding What Transvolt Represents.",
      render: () => (
        <SlideLayoutOption1
          title="Brand Philosophy"
          headline="Understanding What Transvolt Represents"
          paragraph="The purpose, vision, and symbolism powering clean mobility. Transvolt stands at the forefront of sustainable transit, pairing environmental stewardship with high-performance electrical engineering and smart charging infrastructure."
          bullets={[
            "Zero tailpipe emissions accelerating clean city transit",
            "High-efficiency commercial electric bus and fleet operations",
            "Smart megawatt charging networks powered by renewable energy",
            "Green Arrow represents Sustainability, Nature & Clean Ecology",
            "Blue Arrow represents Electric Velocity, Technology & Speed",
            "Dual Chevron symbol embodies continuous forward progress"
          ]}
          tiles={[
            {
              title: "Zero-Emission Mobility",
              desc: "Accelerating the national transition to zero-emission public transit.",
              icon: <Zap className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Continuous Progress",
              desc: "Constant technological evolution, fleet intelligence, and operational efficiency.",
              icon: <ArrowRight className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Future Energy Vision",
              desc: "Integrating smart charging networks with renewable energy infrastructure.",
              icon: <BatteryCharging className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Green Arrow Symbol",
              desc: "Nature, ecological preservation, carbon reduction, and clean green energy.",
              icon: <Compass className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Blue Arrow Symbol",
              desc: "Electric power, engineering excellence, rapid acceleration, and momentum.",
              icon: <Zap className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "National Commitment",
              desc: "A trusted brand powering smart cities and municipal transportation networks.",
              icon: <ShieldCheck className="h-5 w-5" />,
              color: "amber"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 7: LETTERHEAD (OPTION 2 STYLE)
    // -------------------------------------------------------------
    {
      id: 7,
      category: "07 — Letterhead",
      title: "Multi-Firm Letterheads",
      subtitle: "Solving Multi-Company Letterhead Management.",
      render: () => (
        <SlideLayoutOption2
          title="Multi-Firm Letterheads"
          headline="Solving Multi-Company Letterhead Management"
          paragraph="Transvolt operates through multiple legal corporate entities, operating companies, and regional SPVs. The portal provides instant access to verified letterheads with accurate CIN, registered addresses, and GST details."
          bullets={[
            "Dedicated official letterheads for each legal corporate entity",
            "Verified Corporate Identification Numbers (CIN) & GSTINs",
            "Official registered office addresses updated and verified",
            "Standardized Word (.docx) documents and high-res image headers",
            "Prevents outdated address info on tenders, bank notices & contracts",
            "Eliminates repeated requests to the Legal & Secretarial team"
          ]}
          tiles={[
            {
              title: "Transvolt Mobility Pvt Ltd",
              desc: "Master parent company stationery with verified CIN & registered address.",
              icon: <Building className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Regional SPVs & Entities",
              desc: "Separate stationery packs for state-specific operating project companies.",
              icon: <Building className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Verified Legal Details",
              desc: "Registered office, corporate CIN, email, website, and GST credentials.",
              icon: <ShieldCheck className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Header & Footer JPGs",
              desc: "Crisp high-resolution images ready for digital insertion into letters.",
              icon: <ImageIcon className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Editable Word Templates",
              desc: "Pre-configured .docx files with official margins, headers, and Calibri font.",
              icon: <FileText className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "Print-Ready PDF Packs",
              desc: "Vector stationery layouts ready for commercial depot stationery printing.",
              icon: <Download className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 8: ID CARDS & BUSINESS CARDS (OPTION 1 STYLE)
    // -------------------------------------------------------------
    {
      id: 8,
      category: "08 — ID & Business Cards",
      title: "ID & Business Cards",
      subtitle: "Employee Information + Automated Identity Generation.",
      render: () => (
        <SlideLayoutOption1
          title="ID & Business Cards"
          headline="Employee Records + Automated Identity Generation"
          paragraph="Maintains full employee records site-by-site across regional depots and Head Office. Eliminates manual graphic design work by generating approved ID Cards and Business Cards directly from verified portal data."
          bullets={[
            "Site-wise employee rosters with designation & employee IDs",
            "Front & back automated ID card generator with official barcodes",
            "High-resolution Business Cards with QR contact codes",
            "Emergency blood group and depot contact integration",
            "Direct print-ready PDF export calibrated for card printers",
            "Controlled 6-hour printer sharing links for regional vendors"
          ]}
          tiles={[
            {
              title: "Site Employee Directory",
              desc: "Organized by Mumbai Depot, Pune, Delhi NCR, Ahmedabad, and Head Office.",
              icon: <Users className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Instant ID Generator",
              desc: "One-click generation of official Front and Back PVC ID card layouts.",
              icon: <IdCard className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Executive Business Cards",
              desc: "Professional business cards with dynamic QR codes for vCard contact sharing.",
              icon: <IdCard className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Barcode & Security Codes",
              desc: "Standardized employee code encoding compatible with depot turnstiles.",
              icon: <ShieldCheck className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Print-Ready PDF Output",
              desc: "Standard 85.6mm x 54mm card proportions with 3mm bleed margins.",
              icon: <FileText className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "Vendor Print Sharing",
              desc: "Send high-res files directly to ID card printers via secure timed links.",
              icon: <Clock className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 9: PRESENTATION (OPTION 2 STYLE)
    // -------------------------------------------------------------
    {
      id: 9,
      category: "09 — Presentation",
      title: "Presentation Deck System",
      subtitle: "Ready-to-Use Corporate Presentation System.",
      render: () => (
        <SlideLayoutOption2
          title="Presentation Deck System"
          headline="Ready-to-Use Corporate Presentation System"
          paragraph="Standardized 16:9 master PowerPoint templates and slide layouts built for widescreen displays, board presentations, investor meetings, client pitches, and operational briefings."
          bullets={[
            "Modern 16:9 widescreen layout standard optimized for laptop screens",
            "Pre-formatted master slide layouts, title dividers, and agenda decks",
            "Pre-configured Poppins font styles and high-contrast color palettes",
            "Standardized charts, milestone timelines, metrics, and team rosters",
            "Instant download in native editable PowerPoint (.pptx) format"
          ]}
          tiles={[
            {
              title: "16:9 Master Template",
              desc: "Widescreen proportions calibrated for modern monitors and projectors.",
              icon: <Laptop className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Milestone Roadmaps",
              desc: "Pre-designed timeline slides to showcase project rollouts and phases.",
              icon: <Sliders className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "KPI & Metrics Grids",
              desc: "Data presentation cards to highlight fleet mileage, uptime, and energy stats.",
              icon: <BarChart3 className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Team & Leadership Slides",
              desc: "Consistent team roster layouts with designation tags and photo slots.",
              icon: <Users className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Pre-Configured Typography",
              desc: "Built-in Poppins headings and clean contrast palettes in master styles.",
              icon: <Type className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "1-Click PPTX Export",
              desc: "Download the complete official template to assemble executive presentations.",
              icon: <Download className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 10: DIGITAL ASSETS (OPTION 1 STYLE)
    // -------------------------------------------------------------
    {
      id: 10,
      category: "10 — Digital Assets",
      title: "Digital Assets Vault",
      subtitle: "Approved Digital Communication Across All Channels.",
      render: () => (
        <SlideLayoutOption1
          title="Digital Assets Vault"
          headline="Approved Digital Communication"
          paragraph="Fast access to verified digital marketing materials across all social, web, and internal communications. Ensures marketing teams and creative agencies use only current campaigns and approved branding."
          bullets={[
            "Social media campaign creatives (LinkedIn, X, Instagram, Facebook)",
            "Official corporate emailer banners, footers, and HTML templates",
            "High-resolution web and mobile app interface graphics",
            "Event announcement banners, webinars, and digital posters",
            "Recruitment, employee spotlight, and employer branding collateral",
            "Instant export in optimized web formats (PNG, JPG, WebP)"
          ]}
          tiles={[
            {
              title: "Social Media Posts",
              desc: "Square (1:1), portrait (4:5), and banner formats for all digital networks.",
              icon: <Sparkles className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Corporate Emailers",
              desc: "Approved email banners, announcement headers, and newsletter headers.",
              icon: <Mail className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Web & App Graphics",
              desc: "Lossless banners, icons, and hero illustrations for digital platforms.",
              icon: <Laptop className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Event & Webinar Assets",
              desc: "Clean digital passes, speaker announcement cards, and backdrop banners.",
              icon: <Layers className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Recruitment Campaigns",
              desc: "Standardized hiring banners with official Transvolt job identity.",
              icon: <Users className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "Digital PR Kits",
              desc: "Approved press-release banners, executive photos, and brand summaries.",
              icon: <Share2 className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 11: PRINT ASSETS (OPTION 2 STYLE)
    // -------------------------------------------------------------
    {
      id: 11,
      category: "11 — Print Assets",
      title: "Print-Ready Collateral",
      subtitle: "Production-Ready Brand Materials with Zero Press Rework.",
      render: () => (
        <SlideLayoutOption2
          title="Print-Ready Collateral"
          headline="Production-Ready Brand Materials"
          paragraph="High-resolution CMYK print files designed to prevent press rework, incorrect color rendering, and expensive reprints across regional depots, trade exhibitions, and corporate offices."
          bullets={[
            "Official corporate brochures, booklets, and capability portfolios",
            "Depot safety posters, electrical hazard charts, and site signage",
            "Exhibition standees, conference backdrops, and trade show banners",
            "High-resolution vector artwork with 3mm bleed lines and crop marks",
            "Zero costly reprints due to incorrect file formats or wrong colors"
          ]}
          tiles={[
            {
              title: "Brochures & Booklets",
              desc: "Multi-page corporate profiles with high-res images and spot varnish layers.",
              icon: <FileText className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Depot Safety Posters",
              desc: "OSHA & state regulatory electrical safety charts for EV maintenance depots.",
              icon: <ShieldCheck className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Standees & Banners",
              desc: "Standard 6x3 ft and 8x4 ft roll-up standees ready for immediate production.",
              icon: <Layers className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Corporate Stationery",
              desc: "Standardized business envelopes, folders, notepads, and visitor lanyards.",
              icon: <FileText className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Wayfinding & Signage",
              desc: "Exterior depot entrance boards, bay markers, and parking indicators.",
              icon: <Compass className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "CMYK Vector Packs",
              desc: "100% press-ready vector PDFs with outlined fonts and color separation.",
              icon: <Download className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 12: GRAPHICS LIBRARY (OPTION 1 STYLE)
    // -------------------------------------------------------------
    {
      id: 12,
      category: "12 — Graphics Library",
      title: "Graphics & Creative Library",
      subtitle: "A Central Home for Supporting Creatives & Reusable Assets.",
      render: () => (
        <SlideLayoutOption1
          title="Graphics & Creative Library"
          headline="A Central Home for Supporting Graphics"
          paragraph="Flexible asset repository for reusable festive greetings, HR creatives, event passes, and special occasion graphics organized by category and accessible to all approved staff."
          bullets={[
            "Festival greetings (Diwali, Eid, Christmas, Independence Day)",
            "Official corporate event passes and visitor badge templates",
            "Formal company invitations and stakeholder announcements",
            "Employee recognition certificates and milestone celebration graphics",
            "Multi-format uploads (PNG, SVG, JPG, CDR, print PDF)",
            "1-Click Replace, Delete, and On Hold controls for Super Admins"
          ]}
          tiles={[
            {
              title: "Festival Greetings",
              desc: "Approved holiday creative templates ready for immediate team sharing.",
              icon: <Sparkles className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Event Passes & Invites",
              desc: "VIP launch invitations, depot inauguration passes, and conference badges.",
              icon: <IdCard className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "HR & Employee Awards",
              desc: "Star of the Month, annual awards, and training completion certificates.",
              icon: <Users className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Multi-Format Vault",
              desc: "Store and retrieve CDR, PDF, SVG, and high-res PNG from one interface.",
              icon: <Database className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Attribution Tracking",
              desc: "Clear timestamps and uploader history for internal accountability.",
              icon: <Clock className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "Admin Lifecycle Controls",
              desc: "Archive, replace, or hold graphics to prevent outdated circulation.",
              icon: <Sliders className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 13: PHOTO REPOSITORY (OPTION 2 STYLE)
    // -------------------------------------------------------------
    {
      id: 13,
      category: "13 — Photo Repository",
      title: "Photo Repository",
      subtitle: "Transvolt's High-Resolution Visual Archive.",
      render: () => (
        <SlideLayoutOption2
          title="Photo Repository"
          headline="Transvolt's Visual Archive"
          paragraph="Curated, high-resolution media gallery organized by operational milestones, site deployments, fleet rollouts, and employee achievements across all regional operations."
          bullets={[
            "Electric bus & commercial vehicle fleet rollouts on the road",
            "High-power charging depot infrastructure in daily operation",
            "Official flag-off ceremonies with state transport ministers",
            "Driver training, workshop safety drills, and technician teams",
            "Instant search and download for PR, presentations, and media kits"
          ]}
          tiles={[
            {
              title: "Fleet Deployments",
              desc: "On-road electric transit vehicles operating across municipal routes.",
              icon: <Truck className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Depot Infrastructure",
              desc: "High-voltage charging hubs, overhead gantries, and sub-stations.",
              icon: <BatteryCharging className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Flag-Off Milestones",
              desc: "Official state inaugurations, ribbon-cuttings, and partnership launches.",
              icon: <Star className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Leadership & Site Visits",
              desc: "Client walkthroughs, OEM factory tours, and executive board meetings.",
              icon: <Building className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Training & Safety",
              desc: "EV driver training academies, mechanical workshops, and safety gear.",
              icon: <ShieldCheck className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "High-Res Image Vault",
              desc: "Tagged, high-resolution original photography ready for print and media.",
              icon: <ImageIcon className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 14: VEHICLE BRANDING (OPTION 1 STYLE)
    // -------------------------------------------------------------
    {
      id: 14,
      category: "14 — Vehicle Branding",
      title: "Vehicle Fleet Branding",
      subtitle: "The Right Artwork for the Right Vehicle & Project.",
      render: () => (
        <SlideLayoutOption1
          title="Vehicle Fleet Branding"
          headline="The Right Artwork for the Right Vehicle & Project"
          paragraph="Different electric vehicles require distinct artwork due to OEM body variants, emergency exit placements, window cuts, and specific state transport authority contracts."
          bullets={[
            "OEM-specific body structures (Tata Motors, JBM, Olectra, Switch Mobility)",
            "Exact window cutouts and emergency door clearance specifications",
            "State transport & municipal fleet contract guidelines (BEST, MSRTC, etc.)",
            "Pre-verified full body wrap and partial decal layouts",
            "Direct sharing of production CDR files with wrap vendors",
            "Eliminates costly measurement errors during vinyl application"
          ]}
          tiles={[
            {
              title: "OEM Structure Mapping",
              desc: "Specific body layouts for 9-meter, 12-meter, and articulated electric buses.",
              icon: <Truck className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Chassis Sizing",
              desc: "Dimension-accurate blueprint templates reflecting real panel seam lines.",
              icon: <Sliders className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "State Contract Specs",
              desc: "Specific municipal transport color schemes and official state logos.",
              icon: <Building className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Full Body Wraps",
              desc: "Pre-approved print-ready artwork formatted for wide-format vinyl printers.",
              icon: <Layers className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Decal & Warning Sets",
              desc: "Emergency door instructions, high-voltage indicators, and fleet numbering.",
              icon: <ShieldCheck className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "6-Hour Wrap Links",
              desc: "Share production CDR/EPS files directly with wrap contractors securely.",
              icon: <Share2 className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 15: CHARGER BRANDING (OPTION 2 STYLE)
    // -------------------------------------------------------------
    {
      id: 15,
      category: "15 — Charger Branding",
      title: "EV Charger Branding",
      subtitle: "Standardising Branding Across Charger OEMs.",
      render: () => (
        <SlideLayoutOption2
          title="EV Charger Branding"
          headline="Standardising Branding Across Charger OEMs"
          paragraph="Depot and public chargers from different hardware manufacturers feature unique cabinet geometries, cooling vents, screen cutouts, and high-voltage electrical safety guidelines."
          bullets={[
            "Cabinet dimensions mapped for 60kW, 120kW, and 240kW DC fast chargers",
            "Clearances for cooling vents, cable holsters, and digital touchscreens",
            "Mandatory electrical safety warnings and high-voltage decal layouts",
            "Pre-verified wrap artwork matching specific hardware models",
            "Guaranteed visual uniformity across all Transvolt depot sites nationwide"
          ]}
          tiles={[
            {
              title: "Multi-OEM Hardware",
              desc: "Tailored wrap artwork for Exicom, Servotech, Delta, and ABB enclosures.",
              icon: <BatteryCharging className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Power Rating Variants",
              desc: "Standardized templates for 60kW, 120kW, 180kW, and 240kW dual-gun chargers.",
              icon: <Zap className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Screen Clearances",
              desc: "Precise cutouts for RFID scanners, touchscreens, and emergency stop buttons.",
              icon: <Sliders className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Electrical Hazard Decals",
              desc: "Compliant danger icons, high-voltage warnings, and earthing markers.",
              icon: <AlertTriangle className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Depot Uniformity",
              desc: "Consistent Transvolt livery across all regional charging plazas.",
              icon: <Compass className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "Print-Ready Vector Files",
              desc: "Direct CDR and vector PDF downloads for enclosure wrap manufacturers.",
              icon: <Download className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 16: ORGANIZATION CHART (OPTION 1 STYLE)
    // -------------------------------------------------------------
    {
      id: 16,
      category: "16 — Organization Chart",
      title: "Organization Hierarchy",
      subtitle: "Site-Wise Interactive Organization Management.",
      render: () => (
        <SlideLayoutOption1
          title="Organization Hierarchy"
          headline="Site-Wise Organization Management"
          paragraph="Visualizing organizational structures and leadership reporting lines across depots, regional hubs, and corporate departments. Replaces outdated corporate spreadsheets with an interactive visual hierarchy."
          bullets={[
            "Site-wise organizational structure mapping across all depots",
            "Clear departmental hierarchy and executive team reporting lines",
            "Interactive auto-layout with intuitive drag-and-drop navigation",
            "Dynamic orthogonal connection lines showing reporting paths",
            "High-resolution export for board presentations, compliance & HR audits",
            "Real-time updates whenever staffing or reporting changes"
          ]}
          tiles={[
            {
              title: "Site-Wise Hierarchy",
              desc: "Filter structure by Mumbai Central, Pune, Ahmedabad, or Head Office.",
              icon: <Network className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Role & Department Nodes",
              desc: "Clear job titles, departmental tags, and team reporting relationships.",
              icon: <Users className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Interactive Layout",
              desc: "Smooth zoom, pan, and collapsible sub-trees for large regional teams.",
              icon: <Sliders className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Reporting Lines",
              desc: "Visual orthogonal connector paths displaying operational chains of command.",
              icon: <ArrowRight className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "High-Res Export",
              desc: "Export the full organizational chart as crisp PNG or printable vector PDF.",
              icon: <Download className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "Depot Staff Overview",
              desc: "Instant insight into site managers, lead engineers, and field technicians.",
              icon: <Building className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 17: CONTROLLED ACCESS & USER MANAGEMENT (OPTION 2 STYLE)
    // -------------------------------------------------------------
    {
      id: 17,
      category: "17 — Access Management",
      title: "Controlled Access Governance",
      subtitle: "Right Person. Right Page. Right Permission.",
      render: () => (
        <SlideLayoutOption2
          title="Controlled Access Governance"
          headline="Right Person. Right Page. Right Permission."
          paragraph="Super Admins control exactly what each user can see and do across every page of the portal. Access is not all-or-nothing—it is tailored to the user's specific operational requirements."
          bullets={[
            "Granular page-by-page permission matrix for every portal category",
            "6 distinct capability tiers (View, Download, Share, Create, Edit, Manage)",
            "Independent access rules for in-house employees vs. external vendors",
            "Complete protection against unapproved asset tampering or deletions",
            "Zero uncontrolled circulation of sensitive corporate documents"
          ]}
          tiles={[
            {
              title: "View Permission",
              desc: "Browse-only access for general team members and auditors.",
              icon: <Eye className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Download Permission",
              desc: "Enables authorized staff to download high-res vectors and stationery.",
              icon: <Download className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Share Permission",
              desc: "Allows verified managers to generate 6-hour expiring vendor links.",
              icon: <Share2 className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Create Permission",
              desc: "Empowers creative leads to upload new approved graphics and photos.",
              icon: <Sparkles className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Edit Permission",
              desc: "Allows replacing outdated asset variants with new versions cleanly.",
              icon: <RefreshCw className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "Super Admin Control",
              desc: "Full administrative control over user accounts, roles, and master settings.",
              icon: <Lock className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 18: SMART ACCESS REQUEST SYSTEM (OPTION 1 STYLE)
    // -------------------------------------------------------------
    {
      id: 18,
      category: "18 — Access Request System",
      title: "Smart Access Request",
      subtitle: "Simple for Users. Controlled for Admins.",
      render: () => (
        <SlideLayoutOption1
          title="Smart Access Request"
          headline="Simple for Users. Controlled for Admins."
          paragraph="Frictionless self-service access request flow paired with one-click Super Admin review. New employees and vendors request access in seconds directly from the login page without passwords."
          bullets={[
            "1-Click 'Request Access' button prominently located on Login screen",
            "Requester submits official email, name, and operational purpose",
            "Instant notification alert bell triggered for the Super Admin",
            "1-Click approval with custom page-by-page permissions assigned",
            "Automated confirmation email delivered to the approved requester",
            "Full enterprise security audit trail of all access approvals and rejections"
          ]}
          tiles={[
            {
              title: "Self-Service Flow",
              desc: "Users submit their official email and intended purpose directly from login.",
              icon: <Users className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Instant Bell Alert",
              desc: "Pulsing red notification indicator immediately alerts the Super Admin.",
              icon: <Bell className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Granular Controls",
              desc: "Check off specific categories the user is allowed to access before approving.",
              icon: <Sliders className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "1-Click Approvals",
              desc: "Approve or decline requests with a single click in the Super Admin modal.",
              icon: <CheckCircle2 className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Instant Activation",
              desc: "Account credentials are activated immediately upon Super Admin approval.",
              icon: <Mail className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "Audit Trail",
              desc: "Complete history of who requested access, when, and who approved it.",
              icon: <ShieldCheck className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 19: CONTROLLED SHARING (OPTION 2 STYLE)
    // -------------------------------------------------------------
    {
      id: 19,
      category: "19 — Controlled Sharing",
      title: "Timed Controlled Sharing",
      subtitle: "Share with Time-Limited Security.",
      render: () => (
        <SlideLayoutOption2
          title="Timed Controlled Sharing"
          headline="Share with Time-Limited Security"
          paragraph="Safe, temporary 6-hour links preventing permanent uncontrolled circulation. When a contractor, printer, or agency needs assets, send an auto-expiring portal link instead of large email attachments."
          bullets={[
            "Auto-expiring 6-hour secure vendor view that terminates automatically",
            "Recipient accesses only requested files and exact color specifications",
            "Rest of the portal remains completely locked and invisible to the vendor",
            "Prevents outdated files from sitting indefinitely in third-party mailboxes",
            "Eliminates large email attachments, WeTransfer links, and bounced mail"
          ]}
          tiles={[
            {
              title: "6-Hour Auto Expiry",
              desc: "Links become completely inactive after 6 hours to prevent file leakage.",
              icon: <Clock className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Isolated Vendor View",
              desc: "Third parties see only the single asset without access to internal data.",
              icon: <Lock className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Exact Color Codes",
              desc: "Displays HEX, RGB, and CMYK codes directly alongside downloadable files.",
              icon: <Palette className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Lossless Formats",
              desc: "Vendors download verified PNG, SVG, CDR, or PDF files in full resolution.",
              icon: <Download className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Zero Attachment Bloat",
              desc: "No massive 100MB ZIP files clogging corporate email inboxes.",
              icon: <Mail className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "Sharing Log",
              desc: "Super Admins can audit all active shared links and revoke them on demand.",
              icon: <ShieldCheck className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 20: THE TRANSFORMATION (OPTION 1 STYLE)
    // -------------------------------------------------------------
    {
      id: 20,
      category: "20 — The Transformation",
      title: "Before vs. With Portal",
      subtitle: "From Scattered Files to a Managed Brand Operating System.",
      render: () => (
        <SlideLayoutOption1
          title="Before vs. With Portal"
          headline="From Scattered Files to a Managed Brand System"
          paragraph="A dramatic transformation in corporate efficiency, production accuracy, and brand protection across all of Transvolt's operational divisions."
          bullets={[
            "Before: Files scattered across personal laptops & Google Drive links",
            "Before: Endless email chains and WhatsApp requests for high-res logos",
            "Before: Printers using incorrect low-res logos and mismatched colors",
            "With Portal: Single centralized source of truth for the entire company",
            "With Portal: Instant self-service for all verified staff & vendors",
            "With Portal: 100% verified vector files and approved press specifications"
          ]}
          tiles={[
            {
              title: "Centralized Truth",
              desc: "Replaces scattered desktop folders with one unified, searchable vault.",
              icon: <Database className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Instant Self-Service",
              desc: "Authorized staff get approved assets in 5 seconds instead of waiting days.",
              icon: <Zap className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Zero Print Reprints",
              desc: "Correct vector specs reach print vendors the first time, saving lakhs.",
              icon: <CheckCircle2 className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Strict Governance",
              desc: "Granular page permissions protect intellectual property from leakage.",
              icon: <Lock className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "OEM Wrap Precision",
              desc: "Vehicle & charger artwork matched to exact hardware models.",
              icon: <Truck className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "Automated ID Cards",
              desc: "Instant employee ID cards eliminate reliance on outside graphic designers.",
              icon: <IdCard className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 21: BUSINESS VALUE (OPTION 2 STYLE)
    // -------------------------------------------------------------
    {
      id: 21,
      category: "21 — Business Value",
      title: "Business Value & ROI",
      subtitle: "Why This Portal Matters to Transvolt.",
      render: () => (
        <SlideLayoutOption2
          title="Business Value & ROI"
          headline="Why This Portal Matters to Transvolt"
          paragraph="Measurable business impact on operational speed, corporate consistency, legal risk reduction, and long-term brand equity as Transvolt expands nationwide."
          bullets={[
            "Saves hundreds of executive and staff hours spent searching for files",
            "Enforces strict brand consistency across all regional transit depots",
            "Protects legal entities with verified corporate stationery & CIN details",
            "Eliminates costly print and vehicle wrap rework across vendors",
            "Scales effortlessly as new cities, transit depots, and OEMs are onboarded"
          ]}
          tiles={[
            {
              title: "Saves Hours of Time",
              desc: "No repeated searches, manual emailing, or creative designer bottlenecks.",
              icon: <Clock className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Improves Consistency",
              desc: "Every depot, partner, and vendor uses 100% approved official brand assets.",
              icon: <ShieldCheck className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Strengthens Security",
              desc: "Strict role-based governance and auto-expiring 6-hour sharing links.",
              icon: <Lock className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Eliminates Rework",
              desc: "Correct vector files and color specs reach print presses the first time.",
              icon: <CheckCircle2 className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Zero Outdated Files",
              desc: "Old versions are locked or archived globally across all depots.",
              icon: <RefreshCw className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "Scales with Growth",
              desc: "Easily onboard new transit depots, cities, OEMs, and employees.",
              icon: <BarChart3 className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 22: THE 7 PILLARS (OPTION 1 STYLE)
    // -------------------------------------------------------------
    {
      id: 22,
      category: "22 — The 7 Pillars",
      title: "Brand Operating System",
      subtitle: "From Brand Library to Brand Operating System.",
      render: () => (
        <SlideLayoutOption1
          title="Brand Operating System"
          headline="From Brand Library to Brand Operating System"
          paragraph="The complete lifecycle of how branding and corporate assets are created, verified, governed, and deployed across Transvolt's rapidly growing mobility ecosystem."
          bullets={[
            "Active governance instead of passive cloud storage",
            "End-to-end asset lifecycle from upload to vendor press handoff",
            "Integrated tools for automated document generation and sharing",
            "Dynamic organization by legal entity, regional site, and vehicle OEM",
            "Constant audit readiness for corporate governance and legal compliance",
            "Built to power Transvolt's multi-state transit operations"
          ]}
          tiles={[
            {
              title: "01 STORE",
              desc: "Centralized, secure digital repository for all Transvolt creative assets.",
              icon: <Database className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "02 ORGANIZE",
              desc: "Structured hierarchy by company entity, depot site, and media type.",
              icon: <Grid className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "03 CONTROL",
              desc: "Granular role-based permissions preventing unauthorized modifications.",
              icon: <Lock className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "04 VERIFY",
              desc: "Pre-checked vector specs, exact color codes, and legal compliance.",
              icon: <ShieldCheck className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "05 GENERATE",
              desc: "Automated site-wise ID cards and business cards with zero designer delay.",
              icon: <IdCard className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "06 SHARE",
              desc: "6-Hour auto-expiring links for safe, leak-free vendor asset handoffs.",
              icon: <Share2 className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 23: FUTURE ROADMAP (OPTION 2 STYLE)
    // -------------------------------------------------------------
    {
      id: 23,
      category: "23 — The Road Ahead",
      title: "Future Roadmap",
      subtitle: "Future Roadmap & Technological Evolution.",
      render: () => (
        <SlideLayoutOption2
          title="Future Roadmap"
          headline="Future Roadmap & Technological Evolution"
          paragraph="Upcoming intelligent capabilities and automated features planned to scale the portal as Transvolt expands into new cities and transit projects nationwide."
          bullets={[
            "AI Smart Search with automated visual tagging and color detection",
            "Multi-tier approval workflows for corporate marketing collateral",
            "Complete file version history, audit logs, and rollback capabilities",
            "Detailed analytics on asset downloads, popular files, and vendor shares",
            "Dedicated external vendor sub-portals for certified printers & wrap shops"
          ]}
          tiles={[
            {
              title: "AI Visual Search",
              desc: "Find assets using natural language search and automated visual tags.",
              icon: <Sparkles className="h-5 w-5" />,
              color: "emerald"
            },
            {
              title: "Multi-Tier Approvals",
              desc: "Configurable approval chains from branch managers to Head of Marketing.",
              icon: <Sliders className="h-5 w-5" />,
              color: "cyan"
            },
            {
              title: "Version Rollback",
              desc: "Complete change history with 1-click restore for previous asset versions.",
              icon: <RefreshCw className="h-5 w-5" />,
              color: "blue"
            },
            {
              title: "Usage Analytics",
              desc: "Real-time metrics on asset popularity, downloads, and regional depot activity.",
              icon: <BarChart3 className="h-5 w-5" />,
              color: "purple"
            },
            {
              title: "Vendor Sub-Portals",
              desc: "Dedicated secure portals for certified wrap shops and advertising partners.",
              icon: <Users className="h-5 w-5" />,
              color: "amber"
            },
            {
              title: "Auto-Expiry Notices",
              desc: "Automated alerts when seasonal graphics or temporary contracts expire.",
              icon: <Clock className="h-5 w-5" />,
              color: "rose"
            }
          ]}
        />
      )
    },

    // -------------------------------------------------------------
    // SLIDE 24: FINAL / THANK YOU SLIDE
    // -------------------------------------------------------------
    {
      id: 24,
      category: "24 — Thank You",
      title: "Conclusion & Access",
      subtitle: "One Platform. One Trusted Source. One Transvolt Brand.",
      render: ({ onRequestAccess, onJump }) => (
        <div className="w-full text-left">
          <div className="step-reveal-1">
            <SlideHeader title="Conclusion & Access" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-9 items-center">
            {/* Left Narrative (Step 2, decreased by 15%) */}
            <div className="lg:col-span-6 space-y-3 sm:space-y-4 step-reveal-2">
              <div className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors",
                isWhite
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                  : "bg-emerald-500/15 border border-emerald-400/30 text-emerald-300"
              )}>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Presentation Concluded
              </div>

              <h3 className={cn(
                "text-2xl sm:text-3xl lg:text-[36px] font-extrabold tracking-tight leading-tight transition-colors",
                isWhite ? "text-slate-900" : "text-white"
              )}>
                One Platform.<br />
                One Trusted Source.<br />
                One Transvolt Brand.
              </h3>

              <p className={cn(
                "text-sm sm:text-base lg:text-[16px] leading-relaxed font-normal transition-colors",
                isWhite ? "text-slate-600" : "text-[#b4b4bc]"
              )}>
                Moving Forward. Powering a Cleaner Future. The Transvolt Brand Management Portal guarantees brand consistency, security, and operational efficiency across all transit depots and corporate divisions.
              </p>

              {/* Step 3: Staggered Checklist */}
              <div className="space-y-2.5 pt-1.5">
                {[
                  { text: "Find the right information", desc: "instantly across all categories" },
                  { text: "Verify the right asset", desc: "with 100% loss-free vector standards" },
                  { text: "Share the right file", desc: "with auto-expiring 6-hour links" }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={cn("flex items-center gap-2.5 text-sm sm:text-base transition-colors", isWhite ? "text-slate-800" : "text-slate-100")}
                    style={{
                      animation: `stepReveal 0.58s cubic-bezier(0.16, 1, 0.3, 1) ${0.20 + idx * 0.07}s both`,
                      willChange: "opacity, transform"
                    }}
                  >
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span><strong>{item.text}</strong> {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Action Card (Step 4, decreased by 15%) */}
            <div
              className={cn(
                "lg:col-span-6 rounded-2xl p-5 sm:p-6 space-y-5 text-center transition-all",
                isWhite
                  ? "bg-white border border-slate-200 shadow-xl"
                  : "bg-[#1c1c20] border border-white/10 shadow-2xl"
              )}
              style={{
                animation: "stepReveal 0.64s cubic-bezier(0.16, 1, 0.3, 1) 0.32s both",
                willChange: "opacity, transform"
              }}
            >
              <div className="space-y-1.5">
                <h4 className={cn(
                  "text-lg sm:text-xl font-bold transition-colors",
                  isWhite ? "text-slate-900" : "text-white"
                )}>
                  Ready to Experience the Portal?
                </h4>
                <p className={cn(
                  "text-xs sm:text-sm transition-colors",
                  isWhite ? "text-slate-600" : "text-slate-400"
                )}>
                  Explore approved brand assets or submit an access request to get started.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-1.5">
                {onRequestAccess && (
                  <Button
                    type="button"
                    onClick={() => {
                      onClose()
                      onRequestAccess()
                    }}
                    className="w-full h-10 sm:h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/20 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <Lock className="h-3.5 w-3.5 mr-2" /> Request Portal Access Now
                  </Button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onJump(0)}
                  className={cn(
                    "w-full h-9 rounded-xl text-xs font-medium cursor-pointer transition-colors",
                    isWhite
                      ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Restart Presentation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  const totalSlides = slides.length

  const handleNext = React.useCallback(() => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : prev))
  }, [totalSlides])

  const handlePrev = React.useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev))
  }, [])

  const handleJump = (index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentSlide(index)
      setShowThumbnails(false)
    }
  }

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault()
        if (isPlaying) {
          // In Auto Play: clicking space stops the page and releases on clicking again!
          setIsPaused((prev) => !prev)
        } else {
          // Normal manual slide progression when not in auto-play
          handleNext()
        }
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault()
        handleNext()
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault()
        handlePrev()
      } else if (e.key === "Escape") {
        if (showThumbnails) {
          setShowThumbnails(false)
        } else {
          onClose()
        }
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault()
        toggleFullscreen()
      } else if (e.key === "t" || e.key === "T" || e.key === "m" || e.key === "M") {
        e.preventDefault()
        setShowThumbnails((prev) => !prev)
      } else if (e.key === "Home") {
        e.preventDefault()
        setCurrentSlide(0)
      } else if (e.key === "End") {
        e.preventDefault()
        setCurrentSlide(totalSlides - 1)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, handleNext, handlePrev, showThumbnails, onClose, totalSlides, isPlaying])

  // Auto-play timer with dynamic duration controlled by speed duration slider
  React.useEffect(() => {
    if (!isOpen || !isPlaying || isPaused) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev < totalSlides - 1) {
          return prev + 1
        } else {
          setIsPlaying(false)
          setIsPaused(false)
          return prev
        }
      })
    }, slideDurationMs)

    return () => clearInterval(timer)
  }, [isOpen, isPlaying, isPaused, totalSlides, currentSlide, slideDurationMs])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {})
      setIsFullscreen(false)
    }
  }

  if (!isOpen || !mounted) return null

  const activeSlide = slides[currentSlide]
  const progressPercent = Math.round(((currentSlide + 1) / totalSlides) * 100)

  // Portal directly to document.body with z-[999999] so it cleanly overlays everything
  return createPortal(
    <PresentationThemeContext.Provider value={{ theme, setTheme }}>
      <div
        id="presentation-deck"
        ref={containerRef}
        className={cn(
          "fixed inset-0 z-[999999] flex flex-col select-none overflow-hidden animate-in fade-in duration-300 transition-colors",
          isWhite ? "bg-[#f8fafc] text-slate-900" : "bg-[#0e0f12] text-white"
        )}
      >
        {/* Subtle Ambient Background Glows */}
        <div className={cn(
          "absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors",
          isWhite ? "bg-emerald-500/5" : "bg-emerald-500/5"
        )} />
        <div className={cn(
          "absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors",
          isWhite ? "bg-blue-500/5" : "bg-blue-500/5"
        )} />

        {/* TOP CONTROL BAR */}
        <header className={cn(
          "relative z-30 h-14 border-b px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 transition-colors backdrop-blur-xl",
          isWhite
            ? "bg-white/95 border-slate-200 text-slate-900 shadow-sm"
            : "bg-[#121216]/90 border-white/10 text-white"
        )}>
          {/* Left: Current chapter */}
          <div className="min-w-0 flex items-center gap-2">
            <span className={cn(
              "text-xs font-semibold truncate transition-colors",
              isWhite ? "text-emerald-600" : "text-emerald-400"
            )}>
              {activeSlide.category}
            </span>
            <span className={cn("hidden sm:inline text-xs", isWhite ? "text-slate-400" : "text-slate-500")}>•</span>
            <span className={cn(
              "hidden sm:inline text-xs truncate max-w-[240px] transition-colors",
              isWhite ? "text-slate-600" : "text-slate-400"
            )}>
              {activeSlide.title}
            </span>
          </div>

          {/* Right: Presentation Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Theme Toggle: 1. Default (Black) | 2. White */}
            <div className={cn(
              "flex items-center p-0.5 rounded-xl border text-xs font-semibold select-none transition-colors",
              isWhite ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/10"
            )}>
              <button
                type="button"
                onClick={() => setTheme("black")}
                className={cn(
                  "px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer text-xs",
                  !isWhite
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-900"
                )}
                title="Default Black Theme"
              >
                <Moon className="h-3 w-3" />
                <span>Black</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("white")}
                className={cn(
                  "px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer text-xs",
                  isWhite
                    ? "bg-white text-slate-900 border border-slate-200 shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                )}
                title="White Theme"
              >
                <Sun className="h-3 w-3 text-amber-500" />
                <span>White</span>
              </button>
            </div>

            {/* Slide indicator */}
            <div className={cn(
              "text-xs font-mono font-bold px-2.5 py-1 rounded-lg border transition-colors",
              isWhite
                ? "bg-slate-100 text-slate-700 border-slate-200"
                : "bg-white/5 text-slate-300 border-white/10"
            )}>
              {String(currentSlide + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
            </div>

            {/* Highlighted & Continuously Color-Changing Auto-Play Button (Green to Blue to Green) */}
            <button
              type="button"
              onClick={() => {
                if (isPlaying && isPaused) {
                  setIsPaused(false)
                } else {
                  setIsPlaying((p) => !p)
                  setIsPaused(false)
                }
              }}
              className={cn(
                "h-9 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer select-none group",
                isPlaying
                  ? isPaused
                    ? "bg-amber-500/20 text-amber-300 border-2 border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.4)] scale-[1.02]"
                    : "text-white border-2 shadow-lg scale-[1.02] hover:scale-105 active:scale-95 autoplay-btn-active"
                  : "text-emerald-300 border-2 hover:text-white hover:scale-105 active:scale-95 transition-all autoplay-btn-idle"
              )}
              title={
                isPlaying
                  ? isPaused
                    ? "Auto-play paused [Press Space to release or click to resume]"
                    : "Auto-play active [Press Space to stop or click to turn off]"
                  : "Start continuous auto-play presentation"
              }
            >
              {isPlaying ? (
                isPaused ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    <Play className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                    <span className="tracking-wide text-amber-300 font-extrabold">Paused (Space)</span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    <Pause className="h-3.5 w-3.5 fill-white text-white shrink-0" />
                    <span className="tracking-wide font-extrabold">Playing ({currentSpeed.label})</span>
                  </>
                )
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current transition-transform group-hover:scale-110 shrink-0" />
                  <span className="tracking-wide">Auto-Play</span>
                </>
              )}
            </button>

            {/* Thumbnails Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowThumbnails((p) => !p)}
              className={cn(
                "p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
                showThumbnails
                  ? isWhite
                    ? "bg-blue-50 border-blue-300 text-blue-700 font-bold"
                    : "bg-blue-500/20 border-blue-400/40 text-blue-300"
                  : isWhite
                    ? "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    : "border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
              )}
              title="Toggle slide thumbnail drawer [T]"
            >
              <Grid className="h-4 w-4" />
              <span className="hidden md:inline text-[11px]">All Slides</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className={cn(
                "p-2 rounded-xl border transition-colors cursor-pointer hidden sm:flex",
                isWhite
                  ? "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
              )}
              title="Toggle fullscreen [F]"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "p-2 rounded-xl border transition-colors cursor-pointer ml-1",
                isWhite
                  ? "border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-300"
                  : "border-white/10 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/40"
              )}
              title="Exit presentation [Esc]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* TOP PROGRESS BAR */}
        <div className={cn(
          "relative z-20 h-1 w-full overflow-hidden shrink-0 transition-colors",
          isWhite ? "bg-slate-200" : "bg-white/5"
        )}>
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 transition-all duration-300 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* MAIN SLIDE VIEWPORT: Static space from top on ALL slides (Optimized 15% compact scale) */}
        <main className="relative flex-1 z-10 flex flex-col justify-start items-center px-5 sm:px-8 lg:px-12 pt-[22px] pb-6 overflow-y-auto">
          <div
            key={`slide-view-${currentSlide}`}
            className="w-full max-w-[1360px] animate-slide-fade"
          >
            {activeSlide.render({
              onNext: handleNext,
              onPrev: handlePrev,
              onJump: handleJump,
              onRequestAccess
            })}
          </div>
        </main>

        {/* Cat Animation Easter Egg: Slowly comes from bottom's top with 30% opacity at random infrequent times */}
        <CatPeekEasterEgg isOpen={isOpen} isWhite={isWhite} />

        {/* FLOATING BOTTOM CONTROLS */}
        <footer className={cn(
          "relative z-30 h-15 border-t px-4 sm:px-8 flex items-center justify-between shrink-0 transition-colors backdrop-blur-xl",
          isWhite
            ? "bg-white/95 border-slate-200 text-slate-700 shadow-sm"
            : "bg-[#121216]/90 border-white/10 text-slate-300"
        )}>
          {/* Simple Gray Running Line: Page Staying Time-Line (Runs Left to Right on the footer top border during Auto-Play) */}
          {isPlaying && (
            <div className="absolute -top-[1px] left-0 right-0 h-[2px] overflow-hidden pointer-events-none z-40">
              <div
                key={`autoplay-timeline-${currentSlide}-${slideDurationMs}`}
                className={cn(
                  "h-full transition-colors",
                  isWhite ? "bg-slate-400" : "bg-neutral-500"
                )}
                style={{
                  animation: `autoplayBeamProgress ${slideDurationMs}ms linear forwards`,
                  animationPlayState: isPaused ? "paused" : "running"
                }}
              />
            </div>
          )}

          {/* Left: Keyboard Hint */}
          {isPlaying ? (
            <div className={cn(
              "hidden sm:flex items-center gap-1.5 text-xs font-medium transition-colors",
              isPaused ? "text-amber-400" : isWhite ? "text-slate-600" : "text-slate-300"
            )}>
              <span className={cn(
                "px-2 py-0.5 rounded font-mono text-[10px] font-bold border transition-colors",
                isPaused
                  ? "bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-sm"
                  : isWhite
                    ? "bg-slate-200 text-slate-800 border-slate-300"
                    : "bg-white/10 text-white border-white/20"
              )}>
                Space
              </span>
              <span>{isPaused ? "to release Auto-Play" : "to stop / pause Auto-Play"}</span>
            </div>
          ) : (
            <div className={cn("hidden sm:flex items-center gap-2 text-xs", isWhite ? "text-slate-500" : "text-slate-400")}>
              <span className={cn("px-1.5 py-0.5 rounded font-mono text-[10px]", isWhite ? "bg-slate-200 text-slate-800" : "bg-white/10 text-white")}>←</span>
              <span className={cn("px-1.5 py-0.5 rounded font-mono text-[10px]", isWhite ? "bg-slate-200 text-slate-800" : "bg-white/10 text-white")}>→</span>
              <span className={cn("px-1.5 py-0.5 rounded font-mono text-[10px]", isWhite ? "bg-slate-200 text-slate-800" : "bg-white/10 text-white")}>Space</span>
              <span>to navigate slides</span>
            </div>
          )}

          {/* Center: Slide Jump Controls (Circle Arrows Only, Centered at Dead Center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-auto select-none z-10">
            {/* Prev Button: Circle Arrow */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className={cn(
                "h-9 w-9 rounded-full border flex items-center justify-center disabled:opacity-20 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm",
                isWhite
                  ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-800 hover:border-slate-400"
                  : "border-white/20 bg-white/5 hover:bg-white/15 text-white hover:border-white/40"
              )}
              title="Previous slide [←]"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Slide Indicator Dots on larger screens */}
            <div className="hidden md:flex items-center gap-1.5 max-w-xs overflow-x-auto px-2 py-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={cn(
                    "h-2 rounded-full transition-all cursor-pointer",
                    idx === currentSlide
                      ? "w-6 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                      : isWhite
                        ? "w-2 bg-slate-300 hover:bg-slate-400"
                        : "w-2 bg-white/20 hover:bg-white/40"
                  )}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Next Button: Circle Arrow */}
            <button
              type="button"
              onClick={handleNext}
              disabled={currentSlide === totalSlides - 1}
              className="h-9 w-9 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white flex items-center justify-center border border-white/15 disabled:opacity-20 cursor-pointer shadow-md shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
              title="Next slide [→]"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Right: Sweet & Simple Speed Duration Control (Only shown in Auto-Play, 30% smaller UI) & Jump Controls */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Speed Control Container (Visible ONLY in Auto-Play) */}
            {isPlaying && (
              <div className="flex items-center gap-2 sm:gap-3 select-none animate-in fade-in slide-in-from-right-3 duration-200">
                {isPaused && (
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                    Stopped
                  </span>
                )}

                {/* Left Label: "Speed" */}
                <span className={cn(
                  "text-[11px] sm:text-xs font-medium tracking-tight shrink-0 transition-colors",
                  isWhite ? "text-slate-700" : "text-slate-200"
                )}>
                  Speed
                </span>

                {/* Slider Track with Custom Capsule Thumb & 11 Ticks (30% smaller footprint) */}
                <div className="relative w-28 sm:w-36 md:w-44 lg:w-48 h-5 flex items-center shrink-0">
                  {/* Inner Track Wrapper: 5px padding on left/right ensures 10px thumb capsule centers precisely over 0% and 100% boundary ticks */}
                  <div className="relative w-full h-full flex items-center mx-[5px]">
                    {/* 11 Vertical Tick Marks across 10 Segments (from 0% to 100%) */}
                    <div className="absolute inset-0 pointer-events-none flex items-center">
                      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tickPercent, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "absolute w-[1px] h-[12px] -translate-x-1/2 pointer-events-none transition-colors",
                            isWhite ? "bg-slate-300" : "bg-white/20"
                          )}
                          style={{ left: `${tickPercent}%` }}
                        />
                      ))}
                    </div>

                    {/* Horizontal Inactive Track Line (Dark Neutral Gray) */}
                    <div className={cn(
                      "absolute inset-x-0 h-[2px] rounded-full pointer-events-none transition-colors",
                      isWhite ? "bg-slate-300" : "bg-[#4b5563]"
                    )} />

                    {/* Horizontal Active Track Line: Vibrant Green-to-Blue Gradient (From 0% to thumb center) */}
                    <div
                      className="absolute left-0 h-[2px] rounded-full pointer-events-none transition-all duration-75"
                      style={{
                        width: `${(speedIndex / 10) * 100}%`,
                        background: "linear-gradient(90deg, #22c55e 0%, #10b981 35%, #06b6d4 70%, #2563eb 100%)"
                      }}
                    />

                    {/* Custom Capsule/Pill Thumb with 3 Subtle Vertical Grip Lines (10px x 18px) */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-75 flex items-center justify-center rounded-full border-[1.5px] border-white shadow-[0_1px_5px_rgba(0,0,0,0.5)] z-20"
                      style={{
                        left: `${(speedIndex / 10) * 100}%`,
                        width: "10px",
                        height: "18px",
                        backgroundColor: "#52832e"
                      }}
                    >
                      {/* 3 Vertical Grip Lines inside the thumb */}
                      <div className="flex items-center justify-center gap-[1px]">
                        <span className="w-[0.75px] h-1.5 bg-black/40 rounded-full" />
                        <span className="w-[0.75px] h-1.5 bg-black/40 rounded-full" />
                        <span className="w-[0.75px] h-1.5 bg-black/40 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Native Range Input (Transparent Overlay for Seamless Drag, Click, & Keyboard Accessibility) */}
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={speedIndex}
                    onChange={(e) => setSpeedIndex(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 outline-none"
                    title={`Speed: ${currentSpeed.label} (${(currentSpeed.durationMs / 1000).toFixed(1)}s per slide)`}
                    aria-label="Presentation playback speed"
                  />
                </div>

                {/* Right Label: Multiplier (shows "x1" at center index 5) */}
                <span className={cn(
                  "text-[11px] sm:text-xs font-semibold tracking-tight w-5 sm:w-6 text-left shrink-0 transition-colors",
                  isWhite ? "text-slate-800" : "text-white"
                )}>
                  {currentSpeed.label}
                </span>
              </div>
            )}

            {/* Skip to End / Start Over */}
            {currentSlide === totalSlides - 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentSlide(0)}
                className={cn(
                  "h-9 px-3 rounded-xl text-xs cursor-pointer transition-colors",
                  isWhite
                    ? "border-slate-300 bg-white hover:bg-slate-100 text-slate-800"
                    : "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                )}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Start Over
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentSlide(totalSlides - 1)}
                className={cn(
                  "h-9 px-3 rounded-xl text-xs cursor-pointer transition-colors",
                  isWhite
                    ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                Skip to End →
              </Button>
            )}
          </div>
        </footer>

        {/* ALL SLIDES THUMBNAIL SITEMAP DRAWER / MODAL */}
        {showThumbnails && (
          <div className={cn(
            "fixed inset-0 z-50 backdrop-blur-xl flex flex-col p-4 sm:p-8 animate-in fade-in duration-200 transition-colors",
            isWhite ? "bg-white/95 text-slate-900" : "bg-black/85 text-white"
          )}>
            <div className={cn(
              "flex items-center justify-between pb-4 border-b max-w-6xl mx-auto w-full",
              isWhite ? "border-slate-200" : "border-white/10"
            )}>
              <div>
                <h3 className={cn(
                  "text-lg font-bold flex items-center gap-2",
                  isWhite ? "text-slate-900" : "text-white"
                )}>
                  <Grid className="h-5 w-5 text-emerald-500" />
                  Presentation Slide Navigator
                </h3>
                <p className={cn("text-xs mt-0.5", isWhite ? "text-slate-500" : "text-slate-400")}>
                  Click any slide to jump directly to it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowThumbnails(false)}
                className={cn(
                  "p-2 rounded-xl transition-colors cursor-pointer",
                  isWhite
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
                    : "bg-white/10 hover:bg-white/20 text-white"
                )}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 max-w-6xl mx-auto w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => handleJump(idx)}
                    className={cn(
                      "p-3.5 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer group",
                      idx === currentSlide
                        ? isWhite
                          ? "border-emerald-500 bg-emerald-50 shadow-md scale-[1.02]"
                          : "border-emerald-400 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02]"
                        : isWhite
                          ? "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-sm"
                          : "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono font-bold text-emerald-500">
                        #{String(idx + 1).padStart(2, "0")}
                      </span>
                      {idx === currentSlide && (
                        <span className="text-[9px] font-extrabold uppercase bg-emerald-500 text-white px-1.5 py-0.2 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <div>
                      <span className={cn(
                        "text-[11px] font-bold block truncate transition-colors",
                        isWhite ? "text-slate-500" : "text-slate-400"
                      )}>
                        {slide.category}
                      </span>
                      <h5 className={cn(
                        "text-xs font-bold line-clamp-2 mt-0.5 transition-colors",
                        isWhite
                          ? "text-slate-900 group-hover:text-emerald-600"
                          : "text-white group-hover:text-emerald-300"
                      )}>
                        {slide.title}
                      </h5>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PresentationThemeContext.Provider>,
    document.body
  )
}
