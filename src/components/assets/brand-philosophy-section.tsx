"use client"

import * as React from "react"
import {
  Sparkles,
  Zap,
  Leaf,
  TrendingUp,
  Atom,
  HeartHandshake,
  ArrowRight,
  ChevronRight,
  Copy,
  Check,
  ShieldCheck,
  Quote,
  Target,
  Layers,
  Award,
  Globe2,
  Flame,
  CheckCircle2,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useTheme } from "next-themes"

// --------------------------------------------------------------------------
// INTERSECTION OBSERVER HOOK (Scroll Reveal)
// --------------------------------------------------------------------------
function useInView(threshold = 0.15) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [inView, setInView] = React.useState(false)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// --------------------------------------------------------------------------
// ANIMATED COUNTER
// --------------------------------------------------------------------------
function AnimatedCounter({ target, suffix = "", prefix = "", duration = 1800 }: {
  target: number; suffix?: string; prefix?: string; duration?: number
}) {
  const { ref, inView } = useInView(0.3)
  const [count, setCount] = React.useState(0)
  React.useEffect(() => {
    if (!inView) return
    let start = 0
    const steps = 60
    const increment = target / steps
    const interval = duration / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, interval)
    return () => clearInterval(timer)
  }, [inView, target, duration])
  return (
    <div ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  )
}

// --------------------------------------------------------------------------
// FLOATING PARTICLE (decorative background element)
// --------------------------------------------------------------------------
function FloatingParticle({ x, y, size, color, delay }: {
  x: string; y: string; size: number; color: string; delay: number
}) {
  return (
    <div
      className="pointer-events-none absolute rounded-full"
      style={{
        left: x, top: y,
        width: size, height: size,
        backgroundColor: color,
        opacity: 0.5,
        animation: `floatUp 6s ease-in-out ${delay}s infinite`,
      }}
    />
  )
}

// --------------------------------------------------------------------------
// TYPING ANIMATION for quote
// --------------------------------------------------------------------------
function TypewriterText({ text, inView }: { text: string; inView: boolean }) {
  const [displayed, setDisplayed] = React.useState("")
  const [started, setStarted] = React.useState(false)
  React.useEffect(() => {
    if (!inView || started) return
    setStarted(true)
    let i = 0
    const timer = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(timer)
    }, 28)
    return () => clearInterval(timer)
  }, [inView, text, started])
  return <>{displayed}<span className="animate-pulse">|</span></>
}

// --------------------------------------------------------------------------
// 3D TILT CARD WRAPPER
// --------------------------------------------------------------------------
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) scale3d(1.02,1.02,1.02)`
  }
  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)"
  }
  return (
    <div
      ref={ref}
      className={cn("transition-transform duration-200 ease-out will-change-transform", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

// --------------------------------------------------------------------------
// ANIMATED PROGRESS BAR
// --------------------------------------------------------------------------
function AnimatedBar({ value, color, inView }: { value: number; color: string; inView: boolean }) {
  const [width, setWidth] = React.useState(0)
  React.useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setWidth(value), 300)
    return () => clearTimeout(t)
  }, [inView, value])
  return (
    <div className="h-1.5 w-full rounded-full bg-border/50 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  )
}

// --------------------------------------------------------------------------
// SCROLL-REVEAL WRAPPER
// --------------------------------------------------------------------------
function RevealSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { ref, inView } = useInView(0.1)
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// --------------------------------------------------------------------------
// IMPACT STATS STRIP
// --------------------------------------------------------------------------
function ImpactStatsStrip() {
  const { ref, inView } = useInView(0.2)
  const stats = [
    { value: 15, suffix: "+", label: "States of Operations", color: "#548235" },
    { value: 100, suffix: "%", label: "Zero Emission Fleet", color: "#4472C4" },
    { value: 2026, suffix: "", prefix: "Est. ", label: "Year Founded", color: "#548235" },
    { value: 5, suffix: " Pillars", label: "Brand Philosophy", color: "#4472C4" },
  ]
  return (
    <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className={cn(
            "rounded-2xl border border-border/80 bg-card p-5 text-center space-y-1.5 transition-all duration-700 shadow-sm",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
          style={{ transitionDelay: `${i * 100}ms` }}
        >
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: s.color }}>
            {inView ? <AnimatedCounter target={s.value} suffix={s.suffix} prefix={s.prefix} /> : <span>0{s.suffix}</span>}
          </div>
          <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

// --------------------------------------------------------------------------
// ANIMATED JOURNEY TIMELINE
// --------------------------------------------------------------------------
function JourneyTimeline() {
  const { ref, inView } = useInView(0.2)
  const steps = [
    { title: "Electric Mobility", subtitle: "Fleet Operations", color: "#548235", icon: Zap },
    { title: "Green Energy", subtitle: "Zero-Emission Power", color: "#548235", icon: Leaf },
    { title: "Sustainable Transport", subtitle: "Pan-India Infrastructure", color: "#4472C4", icon: Globe2 },
    { title: "Future Clean Energy", subtitle: "Hydrogen & Beyond", color: "#4472C4", icon: Atom },
  ]
  return (
    <div ref={ref} className="relative py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon
          const isTransition = idx === 1
          return (
            <div
              key={idx}
              className={cn(
                "group relative flex flex-col items-center text-center gap-3 transition-all duration-700",
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
              style={{ transitionDelay: `${150 + idx * 120}ms` }}
            >
              {/* Desktop Journey Flow Connector to Next Step */}
              {idx < steps.length - 1 && (
                <div
                  className="hidden lg:flex items-center absolute top-[40px] -translate-y-1/2 left-[calc(50%+46px)] right-[calc(-50%+46px)] z-0 pointer-events-none"
                  aria-hidden="true"
                >
                  {/* Glowing progress rail */}
                  <div className="relative w-full h-[3px] rounded-full overflow-hidden bg-muted/60">
                    <div
                      className="h-full w-full transition-transform ease-out duration-1000 rounded-full"
                      style={{
                        background: isTransition
                          ? "linear-gradient(90deg, #548235 0%, #4472C4 100%)"
                          : idx === 0
                          ? "linear-gradient(90deg, #548235 0%, #548235 100%)"
                          : "linear-gradient(90deg, #4472C4 0%, #4472C4 100%)",
                        transform: inView ? "scaleX(1)" : "scaleX(0)",
                        transformOrigin: "left",
                        transitionDelay: `${350 + idx * 200}ms`,
                      }}
                    />
                  </div>

                  {/* Directional Step Bridge Indicator */}
                  <div
                    className={cn(
                      "absolute left-1/2 -translate-x-1/2 flex items-center justify-center h-6 w-6 rounded-full bg-background border shadow-sm transition-all duration-500",
                      inView ? "opacity-100 scale-100" : "opacity-0 scale-50"
                    )}
                    style={{
                      borderColor: isTransition ? "#4472C4" : step.color,
                      transitionDelay: `${600 + idx * 200}ms`,
                    }}
                  >
                    <ChevronRight
                      className="h-3 w-3"
                      style={{ color: isTransition ? "#4472C4" : step.color }}
                    />
                  </div>
                </div>
              )}

              {/* Milestone Circular Node */}
              <div
                className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-2 bg-card shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
                style={{
                  borderColor: step.color,
                  boxShadow: `0 8px 24px -4px ${step.color}30`,
                }}
              >
                {/* Inner soft wash */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${step.color}14` }}
                >
                  <Icon className="h-7 w-7" style={{ color: step.color }} />
                </div>

                {/* Step Number Badge */}
                <div
                  className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-white text-[10px] font-bold shadow-md ring-2 ring-background"
                  style={{ backgroundColor: step.color }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </div>
              </div>

              {/* Step Text Info */}
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground tracking-tight">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.subtitle}</p>
              </div>

              {/* Mobile / Tablet Connector */}
              {idx < steps.length - 1 && (
                <div className="lg:hidden flex items-center justify-center gap-2 my-2 text-muted-foreground/60">
                  <div className="w-8 h-[2px] rounded-full bg-border" />
                  <div
                    className="flex items-center justify-center w-5 h-5 rounded-full border bg-background shadow-xs"
                    style={{ borderColor: step.color }}
                  >
                    <ChevronRight className="w-3 h-3 rotate-90 sm:rotate-0" style={{ color: step.color }} />
                  </div>
                  <div className="w-8 h-[2px] rounded-full bg-border" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// REAL TRANSVOLT ARROWS SVG COMPONENTS (EXACT OFFICIAL VECTOR GEOMETRY)
// --------------------------------------------------------------------------

export function RealGreenArrowSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 779 1070"
      className={cn("w-20 sm:w-28 h-auto", className)}
      style={{
        filter: "drop-shadow(0 12px 24px rgba(84, 130, 53, 0.35))",
        ...style,
      }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <polygon
        points="0,0 395.83,0 778.77,534.52 395.83,1069.04 0,1069.04 382.93,534.52"
        fill="#548235"
      />
    </svg>
  )
}

export function RealBlueArrowSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 779 1070"
      className={cn("w-20 sm:w-28 h-auto", className)}
      style={{
        filter: "drop-shadow(0 12px 24px rgba(68, 114, 196, 0.35))",
        ...style,
      }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <polygon
        points="0,0 395.83,0 778.77,534.52 395.83,1069.04 0,1069.04 382.93,534.52"
        fill="#4472C4"
      />
    </svg>
  )
}

export function RealDualArrowsSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 1340 1070"
      className={cn("w-32 sm:w-44 h-auto", className)}
      style={{
        filter: "drop-shadow(0 14px 28px rgba(68, 114, 196, 0.3))",
        ...style,
      }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <polygon
        points="0,0 395.83,0 778.77,534.52 395.83,1069.04 0,1069.04 382.93,534.52"
        fill="#548235"
      />
      <polygon
        points="561.05,0 956.89,0 1339.8,534.52 956.89,1069.04 561.05,1069.04 943.97,534.52"
        fill="#4472C4"
      />
    </svg>
  )
}

// --------------------------------------------------------------------------
// DUAL ARROWS LOGO INTERACTIVE VISUALIZER (ENHANCED)
// --------------------------------------------------------------------------
function DualArrowsVisualizer({
  activeArrow,
  setActiveArrow,
}: {
  activeArrow: "both" | "green" | "blue"
  setActiveArrow: (arrow: "both" | "green" | "blue") => void
}) {
  const [viewMode, setViewMode] = React.useState<"cards" | "full-logo" | "nested">("cards")
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [arrowAnim, setArrowAnim] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])
  React.useEffect(() => {
    setArrowAnim(true)
    const t = setTimeout(() => setArrowAnim(false), 600)
    return () => clearTimeout(t)
  }, [activeArrow])

  const isDark = mounted && (resolvedTheme === "dark" || resolvedTheme === "theme-navy")
  const logoSrc = isDark ? "/logos/Logo_White.svg" : "/logos/Logo_Black.svg"

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/95 to-muted/30 p-6 sm:p-10 shadow-sm">
      {/* Animated ambient blobs */}
      <div
        className={cn(
          "pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full blur-3xl transition-all duration-1000",
          activeArrow === "blue" ? "opacity-15 bg-[#4472C4]" : "opacity-30 bg-[#548235]"
        )}
        style={{ animation: "blobPulse 5s ease-in-out infinite" }}
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full blur-3xl transition-all duration-1000",
          activeArrow === "green" ? "opacity-15 bg-[#548235]" : "opacity-30 bg-[#4472C4]"
        )}
        style={{ animation: "blobPulse 5s ease-in-out 2.5s infinite" }}
      />

      <div className="relative z-10 flex flex-col items-center text-center space-y-7">
        {/* Top Control Bar: Mode and Quick Switchers */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* View Modes */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/70 border border-border/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                viewMode === "cards"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Side-by-Side Transition
            </button>
            <button
              type="button"
              onClick={() => setViewMode("full-logo")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                viewMode === "full-logo"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Full Official Logo
            </button>
            <button
              type="button"
              onClick={() => setViewMode("nested")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                viewMode === "nested"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Unified Insignia (Nested)
            </button>
          </div>

          {/* Master Full Logo SVG Download Shortcut */}
          <a
            href={logoSrc}
            download={isDark ? "Transvolt_Logo_White.svg" : "Transvolt_Logo_Black.svg"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-background/80 hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Download Full Logo</span>
          </a>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: SIDE-BY-SIDE TRANSITION (WITH MASTER LOGO SHOWCASE) */}
        {/* ------------------------------------------------------------- */}
        {viewMode === "cards" ? (
          <div className="w-full flex flex-col items-center gap-6 my-1">
            {/* Master Full Logo Showcase Banner */}
            <div className="w-full max-w-2xl rounded-2xl border border-border/80 bg-background/85 dark:bg-card/75 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex flex-col items-center sm:items-start gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#4472C4]">
                    Full Master Logo
                  </span>
                  <span className="text-muted-foreground/50 text-xs">â€¢</span>
                  <span className="text-xs text-muted-foreground font-medium">
                    Wordmark with Integrated Dual Arrows
                  </span>
                </div>
                <div className="relative h-11 w-64 sm:w-80 my-1">
                  <Image
                    src={logoSrc}
                    alt="Transvolt Full Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={logoSrc}
                  download={isDark ? "Transvolt_Logo_White.svg" : "Transvolt_Logo_Black.svg"}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-muted/60 hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs"
                >
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Save Full Logo</span>
                </a>
              </div>
            </div>

            {/* Visual Divider / Callout */}
            <div className="flex items-center gap-3 w-full max-w-md my-0.5">
              <div className="h-px bg-border/70 flex-1" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/75">
                Logo Arrows Symbol Breakdown
              </span>
              <div className="h-px bg-border/70 flex-1" />
            </div>

            {/* Side-by-Side Arrow Cards with 3D tilt & pulse animation */}
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-10">
              {/* Green Arrow Card */}
              <TiltCard className="w-full max-w-[290px] sm:max-w-[330px]">
                <div
                  onClick={() => setActiveArrow(activeArrow === "green" ? "both" : "green")}
                  className={cn(
                    "group relative w-full rounded-3xl border p-7 sm:p-9 flex flex-col items-center justify-between text-center gap-6 cursor-pointer transition-all duration-500 select-none",
                    activeArrow === "green" || activeArrow === "both"
                      ? "border-[#8cb673] dark:border-[#548235]/60 bg-[#f4f8f1] dark:bg-[#548235]/15 ring-2 ring-[#548235]/30 shadow-xl shadow-[#548235]/10"
                      : "border-border/60 bg-muted/20 opacity-55 hover:opacity-90"
                  )}
                >
                  <div
                    className={cn(
                      "py-3 sm:py-5 flex items-center justify-center transition-all duration-500",
                      arrowAnim && (activeArrow === "green" || activeArrow === "both") ? "scale-110" : "scale-100"
                    )}
                  >
                    <RealGreenArrowSVG className="transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#548235]">GREEN ARROW</span>
                    <span className="text-base sm:text-xl font-bold text-foreground">Green Energy</span>
                    <span className="mt-1 inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold text-[#548235] bg-[#548235]/10 border border-[#548235]/30">
                      Where We Are Today
                    </span>
                  </div>
                  <a
                    href="/logos/transvolt-arrow-green.svg"
                    download="Transvolt_Green_Arrow.svg"
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-[#548235] hover:underline font-medium inline-flex items-center gap-1 mt-[-8px]"
                  >
                    <Download className="h-3 w-3" />
                    <span>Save Green Arrow SVG</span>
                  </a>
                </div>
              </TiltCard>

              {/* Animated Transition Separator */}
              <div className="flex flex-col items-center justify-center py-2 text-muted-foreground select-none shrink-0">
                <ArrowRight className="h-7 w-7 sm:h-9 sm:w-9 text-muted-foreground/75 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/80 mt-1">TRANSITION</span>
              </div>

              {/* Blue Arrow Card */}
              <TiltCard className="w-full max-w-[290px] sm:max-w-[330px]">
                <div
                  onClick={() => setActiveArrow(activeArrow === "blue" ? "both" : "blue")}
                  className={cn(
                    "group relative w-full rounded-3xl border p-7 sm:p-9 flex flex-col items-center justify-between text-center gap-6 cursor-pointer transition-all duration-500 select-none",
                    activeArrow === "blue" || activeArrow === "both"
                      ? "border-[#8eb5eb] dark:border-[#4472C4]/60 bg-[#edf3fc] dark:bg-[#4472C4]/15 ring-2 ring-[#4472C4]/30 shadow-xl shadow-[#4472C4]/10"
                      : "border-border/60 bg-muted/20 opacity-55 hover:opacity-90"
                  )}
                >
                  <div
                    className={cn(
                      "py-3 sm:py-5 flex items-center justify-center transition-all duration-500",
                      arrowAnim && (activeArrow === "blue" || activeArrow === "both") ? "scale-110" : "scale-100"
                    )}
                  >
                    <RealBlueArrowSVG className="transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#4472C4]">BLUE ARROW</span>
                    <span className="text-base sm:text-xl font-bold text-foreground">Hydrogen Energy</span>
                    <span className="mt-1 inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold text-[#4472C4] bg-[#4472C4]/10 border border-[#4472C4]/30">
                      Where We Are Heading Tomorrow
                    </span>
                  </div>
                  <a
                    href="/logos/transvolt-arrow-blue.svg"
                    download="Transvolt_Blue_Arrow.svg"
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-[#4472C4] hover:underline font-medium inline-flex items-center gap-1 mt-[-8px]"
                  >
                    <Download className="h-3 w-3" />
                    <span>Save Blue Arrow SVG</span>
                  </a>
                </div>
              </TiltCard>
            </div>
          </div>
        ) : viewMode === "full-logo" ? (
          /* ------------------------------------------------------------- */
          /* VIEW 2: FULL OFFICIAL LOGO PRESENTATION */
          /* ------------------------------------------------------------- */
          <div className="py-4 flex flex-col items-center justify-center gap-6 w-full max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {/* Light Background Frame */}
              <div className="p-8 rounded-2xl border border-border/80 bg-white text-black shadow-sm flex flex-col items-center justify-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  On Light Background (Standard)
                </span>
                <div className="relative h-12 w-64 sm:w-72">
                  <Image
                    src="/logos/Logo_Black.svg"
                    alt="Transvolt Logo Black"
                    fill
                    className="object-contain"
                  />
                </div>
                <a
                  href="/logos/Logo_Black.svg"
                  download="Transvolt_Logo_Black.svg"
                  className="text-xs font-semibold text-[#4472C4] hover:underline inline-flex items-center gap-1 mt-1"
                >
                  <Download className="h-3 w-3" />
                  <span>Download Light Logo (SVG)</span>
                </a>
              </div>

              {/* Dark Background Frame */}
              <div className="p-8 rounded-2xl border border-white/10 bg-[#0F172A] text-white shadow-sm flex flex-col items-center justify-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  On Dark Background (Inverted)
                </span>
                <div className="relative h-12 w-64 sm:w-72">
                  <Image
                    src="/logos/Logo_White.svg"
                    alt="Transvolt Logo White"
                    fill
                    className="object-contain"
                  />
                </div>
                <a
                  href="/logos/Logo_White.svg"
                  download="Transvolt_Logo_White.svg"
                  className="text-xs font-semibold text-[#4472C4] hover:underline inline-flex items-center gap-1 mt-1"
                >
                  <Download className="h-3 w-3" />
                  <span>Download Dark Logo (SVG)</span>
                </a>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed text-center max-w-xl">
              The full Transvolt wordmark features our bespoke geometric letterforms paired with the forward-facing dual arrows, symbolizing our transition into cleaner transportation.
            </p>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* VIEW 3: UNIFIED DUAL ARROWS INSIGNIA (OFFICIAL LOGO COMPOSITION) */
          /* ------------------------------------------------------------- */
          <div className="py-6 flex flex-col items-center justify-center gap-4">
            <div className="p-8 sm:p-12 rounded-3xl border border-border/80 bg-background/80 backdrop-blur-md shadow-inner flex items-center justify-center">
              <RealDualArrowsSVG className="w-40 sm:w-56 h-auto" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Official Transvolt Logo Symbol
              </span>
              <p className="text-sm font-semibold text-foreground">
                Green Arrow (Present Responsibility) + Blue Arrow (Future Ambition)
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Detailed Narrative Breakdown */}
        <p className="max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
          The two forward-facing arrows symbolise <strong className="text-foreground">movement, progress, direction, and looking ahead</strong>â€”reflecting Transvolt&apos;s commitment to continuously move the transportation industry towards a more sustainable future.
        </p>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// MAIN BRAND PHILOSOPHY COMPONENT (ENHANCED)
// --------------------------------------------------------------------------
export function BrandPhilosophySection() {
  const [activeArrow, setActiveArrow] = React.useState<"both" | "green" | "blue">("both")
  const [copiedQuote, setCopiedQuote] = React.useState(false)
  const quoteRef = React.useRef<HTMLDivElement>(null)
  const [quoteInView, setQuoteInView] = React.useState(false)

  React.useEffect(() => {
    const el = quoteRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setQuoteInView(true); obs.disconnect() }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const coreQuote = "The future of transportation must be cleaner, smarter, and more sustainable."

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(coreQuote)
    setCopiedQuote(true)
    toast.success("Philosophy quote copied to clipboard!")
    setTimeout(() => setCopiedQuote(false), 2000)
  }

  const handleCopyFullPhilosophy = () => {
    const text = `Transvolt Brand Philosophy
Powering the Transition to a Cleaner Future

Transvolt is more than a businessâ€”it is a commitment to creating a cleaner, more sustainable future through zero-emission mobility.
As a fully electric vehicle operator with operations across multiple states in India, Transvolt is working to transform the transportation sector by reducing pollution and accelerating the transition towards cleaner mobility solutions.

Core Belief:
"The future of transportation must be cleaner, smarter, and more sustainable."

We are committed to building and operating a green mobility platform that delivers zero-emission transportation solutions while contributing to improved air quality, reduced environmental impact, and a more sustainable future for generations to come.

The Meaning Behind the Transvolt Logo:
The Transvolt logo represents our forward-looking vision, continuous progress, and transition towards a cleaner energy future.
The two forward-facing arrows symbolise movement, progress, direction, and looking ahead.

Green Arrow â€” Green Energy (Where we are today):
- Clean and sustainable transportation
- Zero-emission electric mobility
- Our commitment to reducing pollution
- The transition towards cleaner energy
- A greener and more responsible transportation ecosystem

Blue Arrow â€” Hydrogen Energy (Where we are heading tomorrow):
- Future-ready energy solutions
- Continuous innovation and progress
- Our vision beyond today's mobility technologies
- Exploration of emerging clean-energy opportunities
- A long-term commitment to sustainable transportation

Five Fundamental Principles:
01 â€” Zero-Emission Mobility: We are committed to accelerating the adoption of electric mobility and enabling cleaner transportation solutions.
02 â€” Sustainability: We aim to reduce the environmental impact of transportation and contribute towards a cleaner, healthier environment.
03 â€” Progress: The forward movement of our logo represents our mindsetâ€”we continuously move ahead, innovate, and improve.
04 â€” Future Energy: Our vision extends beyond today's technology. We remain focused on the evolution of clean energy and the opportunities it can create for future mobility.
05 â€” Positive Impact: Every vehicle operated, every solution developed, and every step forward contributes to our larger purpose of creating a more sustainable transportation ecosystem.

From Today to Tomorrow:
Electric Mobility -> Green Energy -> Sustainable Transportation -> Future Clean Energy

Our Vision:
To help shape a transportation ecosystem where clean mobility is not an alternative, but the standard.
Purpose: To power a cleaner, more sustainable future for transportation.
Motto: Moving Forward. Powering a Cleaner Future.`

    navigator.clipboard.writeText(text)
    toast.success("Full Brand Philosophy text copied to clipboard!")
  }

  const greenPoints = [
    "Clean and sustainable transportation",
    "Zero-emission electric mobility",
    "Our commitment to reducing pollution",
    "The transition towards cleaner energy",
    "A greener and more responsible transportation ecosystem",
  ]

  const bluePoints = [
    "Future-ready energy solutions",
    "Continuous innovation and progress",
    "Our vision beyond today's mobility technologies",
    "Exploration of emerging clean-energy opportunities",
    "A long-term commitment to sustainable transportation",
  ]

  const fivePrinciples = [
    { num: "01", title: "Zero-Emission Mobility", desc: "We are committed to accelerating the adoption of electric mobility and enabling cleaner transportation solutions.", icon: Zap, accent: "#548235", badge: "Electric Adoption", progress: 92 },
    { num: "02", title: "Sustainability", desc: "We aim to reduce the environmental impact of transportation and contribute towards a cleaner, healthier environment.", icon: Leaf, accent: "#548235", badge: "Ecological Focus", progress: 87 },
    { num: "03", title: "Progress", desc: "The forward movement of our logo represents our mindsetâ€”we continuously move ahead, innovate, and improve.", icon: TrendingUp, accent: "#4472C4", badge: "Forward Mindset", progress: 95 },
    { num: "04", title: "Future Energy", desc: "Our vision extends beyond today's technology. We remain focused on the evolution of clean energy and the opportunities it can create for future mobility.", icon: Flame, accent: "#4472C4", badge: "Hydrogen & Next-Gen", progress: 78 },
    { num: "05", title: "Positive Impact", desc: "Every vehicle operated, every solution developed, and every step forward contributes to our larger purpose of creating a more sustainable transportation ecosystem.", icon: HeartHandshake, accent: "#4472C4", badge: "Ecosystem Value", progress: 90 },
  ]

  const whatWeStandFor = [
    {
      title: "Cleaner Mobility",
      desc: "Enabling transportation with significantly lower environmental impact.",
      icon: Globe2,
      color: "text-[#548235]",
      border: "hover:border-[#548235]/40",
      bg: "bg-[#548235]/10",
    },
    {
      title: "Zero Emissions",
      desc: "Supporting the transition away from conventional fossil-fuel-based transportation.",
      icon: Zap,
      color: "text-[#548235]",
      border: "hover:border-[#548235]/40",
      bg: "bg-[#548235]/10",
    },
    {
      title: "Green Energy",
      desc: "Building our present mobility ecosystem around electric and cleaner energy solutions.",
      icon: Leaf,
      color: "text-[#548235]",
      border: "hover:border-[#548235]/40",
      bg: "bg-[#548235]/10",
    },
    {
      title: "Future Thinking",
      desc: "Looking beyond today's technology towards the next generation of clean energy.",
      icon: Atom,
      color: "text-[#4472C4]",
      border: "hover:border-[#4472C4]/40",
      bg: "bg-[#4472C4]/10",
    },
    {
      title: "Continuous Progress",
      desc: "Always moving forward, improving, and innovating.",
      icon: TrendingUp,
      color: "text-[#4472C4]",
      border: "hover:border-[#4472C4]/40",
      bg: "bg-[#4472C4]/10",
    },
    {
      title: "Sustainable Impact",
      desc: "Creating long-term value for people, businesses, communities, and the environment.",
      icon: Award,
      color: "text-[#4472C4]",
      border: "hover:border-[#4472C4]/40",
      bg: "bg-[#4472C4]/10",
    },
  ]

  return (
    <>
      {/* Inject keyframe animations globally */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0px) scale(1); opacity: 0.5; }
          50% { transform: translateY(-18px) scale(1.1); opacity: 0.2; }
          100% { transform: translateY(0px) scale(1); opacity: 0.5; }
        }
        @keyframes blobPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes arrowGlideArea {
          0%, 100% { transform: translateX(20px); }
          50% { transform: translateX(-190px); }
        }
        @media (max-width: 640px) {
          @keyframes arrowGlideArea {
            0%, 100% { transform: translateX(10px); }
            50% { transform: translateX(-80px); }
          }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <div className="flex flex-col gap-10 pb-16 w-full text-left">

        {/* SECTION 1: CINEMATIC HERO */}
        <RevealSection>
          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card/95 to-muted/40 p-6 sm:p-10 shadow-sm min-h-[340px]">
          {/* Floating decorative particles */}
          <FloatingParticle x="8%" y="18%" size={6} color="#548235" delay={0} />
          <FloatingParticle x="22%" y="72%" size={4} color="#4472C4" delay={1.5} />
          <FloatingParticle x="78%" y="12%" size={8} color="#4472C4" delay={0.8} />
          <FloatingParticle x="88%" y="62%" size={5} color="#548235" delay={2.2} />
          <FloatingParticle x="55%" y="82%" size={4} color="#548235" delay={3} />

          {/* Ambient glows */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#4472C4]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#548235]/10 blur-3xl" />

          {/* Dual arrows watermark: fixed rightward direction, glides left-right across right area */}
          <div className="pointer-events-none absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 opacity-[0.055] select-none">
            <div
              className="will-change-transform"
              style={{ animation: "arrowGlideArea 7s ease-in-out infinite" }}
            >
              <RealDualArrowsSVG className="w-64 sm:w-80 h-auto" />
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-6">
            {/* Top Tag & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#4472C4]/10 text-[#4472C4] hover:bg-[#4472C4]/20 border-[#4472C4]/30 font-semibold px-3 py-1">
                  Official Brand Guidelines
                </Badge>
                <Badge variant="outline" className="text-muted-foreground border-border text-xs">
                  Transvolt Identity 2026
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyFullPhilosophy}
                className="h-8 text-xs gap-1.5 cursor-pointer font-medium"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Full Text</span>
              </Button>
            </div>

            {/* Animated gradient headline */}
            <div className="space-y-4 max-w-4xl">
              <h2
                className="text-2xl sm:text-4xl font-extrabold tracking-tight"
                style={{
                  backgroundImage: "linear-gradient(90deg, #548235, #4472C4, #548235, #4472C4)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "gradientShift 5s ease infinite",
                }}
              >
                Powering the Transition to a Cleaner Future
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Transvolt is more than a businessâ€”it is a commitment to creating a cleaner, more sustainable future through{" "}
                <strong className="text-foreground font-semibold">zero-emission mobility</strong>.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                As a fully electric vehicle operator with operations across multiple states in India, Transvolt is working to transform the transportation sector by reducing pollution and accelerating the transition towards cleaner mobility solutions.
              </p>
            </div>

            {/* Typewriter Blockquote */}
            <div
              ref={quoteRef}
              className="group relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-[#548235]/10 via-background to-[#4472C4]/10 p-6 sm:p-8 shadow-inner"
            >
              <div className="absolute top-4 left-4 text-[#4472C4]/10 pointer-events-none">
                <Quote className="h-20 w-20" />
              </div>
              {/* Shimmer bar on hover */}
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(68,114,196,0.05) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2s linear infinite",
                }}
              />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#4472C4]">Our Core Belief</span>
                  <blockquote className="text-lg sm:text-2xl font-bold tracking-tight text-foreground italic leading-snug min-h-[2.5em]">
                    &ldquo;{quoteInView ? <TypewriterText text={coreQuote} inView={quoteInView} /> : ""}&rdquo;
                  </blockquote>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyQuote}
                  className="shrink-0 h-9 px-3 gap-1.5 text-xs font-medium cursor-pointer border border-border/60 hover:bg-background/80"
                >
                  {copiedQuote ? (
                    <><Check className="h-3.5 w-3.5 text-emerald-500" /><span>Copied</span></>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" /><span>Copy Quote</span></>
                  )}
                </Button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-4xl">
              We are committed to building and operating a green mobility platform that delivers zero-emission transportation solutions while contributing to improved air quality, reduced environmental impact, and a more sustainable future for generations to come.
            </p>
          </div>
        </div>
      </RevealSection>

      {/* Impact Stats Strip */}
      <RevealSection delay={100}>
        <ImpactStatsStrip />
      </RevealSection>

      {/* ============================================================ */}
      {/* SECTION 2: INTERACTIVE LOGO MEANING */}
      {/* ============================================================ */}
      <RevealSection delay={100}>
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#4472C4]/10 text-[#4472C4]">
                <Target className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                The Meaning Behind the Transvolt Logo
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Transvolt logo represents our{" "}
              <strong className="text-foreground">forward-looking vision, continuous progress, and transition towards a cleaner energy future</strong>.
            </p>
          </div>

          {/* Interactive Dual Arrow Graphic Canvas */}
          <DualArrowsVisualizer activeArrow={activeArrow} setActiveArrow={setActiveArrow} />

          {/* Detailed Arrow Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Green Arrow Card */}
            <div
            className={cn(
              "flex flex-col justify-between rounded-2xl border p-6 sm:p-7 transition-all duration-300",
              activeArrow === "green" || activeArrow === "both"
                ? "border-[#548235]/60 bg-gradient-to-b from-[#548235]/10 via-card to-card shadow-sm ring-1 ring-[#548235]/20"
                : "border-border/60 bg-card/60 opacity-60 hover:opacity-100"
            )}
          >
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <RealGreenArrowSVG className="w-6 sm:w-7 h-auto shrink-0" />
                  <div>
                    <h4 className="text-lg font-bold text-[#548235] tracking-tight">
                      Green Arrow â€” Green Energy
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      Our present commitment to Green Energy and Electric Mobility
                    </p>
                  </div>
                </div>
                <Badge className="bg-[#548235]/15 text-[#548235] border-[#548235]/30 font-semibold text-[10px] uppercase tracking-wider">
                  Today
                </Badge>
              </div>

              {/* Bullet Points */}
              <ul className="space-y-3">
                {greenPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-foreground/90">
                    <CheckCircle2 className="h-4 w-4 text-[#548235] shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Callout */}
            <div className="mt-6 rounded-xl border border-[#548235]/30 bg-[#548235]/10 p-3.5 text-xs text-foreground/90 font-medium leading-relaxed">
              <strong className="text-[#548235] font-bold">Green represents where we are today</strong>â€”building and operating electric mobility solutions that contribute to a cleaner future.
            </div>
          </div>

          {/* Blue Arrow Card */}
          <div
            className={cn(
              "flex flex-col justify-between rounded-2xl border p-6 sm:p-7 transition-all duration-300",
              activeArrow === "blue" || activeArrow === "both"
                ? "border-[#4472C4]/60 bg-gradient-to-b from-[#4472C4]/10 via-card to-card shadow-sm ring-1 ring-[#4472C4]/20"
                : "border-border/60 bg-card/60 opacity-60 hover:opacity-100"
            )}
          >
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <RealBlueArrowSVG className="w-6 sm:w-7 h-auto shrink-0" />
                  <div>
                    <h4 className="text-lg font-bold text-[#4472C4] tracking-tight">
                      Blue Arrow â€” Hydrogen Energy
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      Our vision for the future of clean energy, particularly Hydrogen Energy
                    </p>
                  </div>
                </div>
                <Badge className="bg-[#4472C4]/15 text-[#4472C4] border-[#4472C4]/30 font-semibold text-[10px] uppercase tracking-wider">
                  Tomorrow
                </Badge>
              </div>

              {/* Bullet Points */}
              <ul className="space-y-3">
                {bluePoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-foreground/90">
                    <CheckCircle2 className="h-4 w-4 text-[#4472C4] shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Callout */}
            <div className="mt-6 rounded-xl border border-[#4472C4]/30 bg-[#4472C4]/10 p-3.5 text-xs text-foreground/90 font-medium leading-relaxed">
              <strong className="text-[#4472C4] font-bold">Blue represents where we are heading tomorrow</strong>â€”continuing to look beyond today&apos;s solutions and embracing the possibilities of future clean-energy technologies.
            </div>
          </div>
        </div>
      </div>
      </RevealSection>

      {/* SECTION 3: FIVE FUNDAMENTAL PRINCIPLES */}
      <RevealSection delay={100}>
        <div className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#548235]/10 text-[#548235]">
                <Layers className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Our Brand Philosophy</h3>
            </div>
            <p className="text-sm text-muted-foreground">Our philosophy can be expressed through five fundamental principles:</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {fivePrinciples.map((item, idx) => {
              const Icon = item.icon
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const { ref: cardRef, inView: cardInView } = useInView(0.2)
              return (
                <div
                  key={idx}
                  ref={cardRef}
                  className={cn(
                    "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-500 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-1",
                    cardInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  )}
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  <div className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ backgroundColor: item.accent }} />
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black tracking-tight" style={{ color: item.accent }}>{item.num}</span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" style={{ backgroundColor: `${item.accent}15`, color: item.accent }}>
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground tracking-tight">{item.title}</h4>
                      <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <div className="mt-5 pt-3 border-t border-border/50 relative z-10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{item.badge}</span>
                      <span className="text-[10px] font-bold" style={{ color: item.accent }}>{item.progress}%</span>
                    </div>
                    <AnimatedBar value={item.progress} color={item.accent} inView={cardInView} />
                  </div>
                </div>
              )
            })}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#4472C4]/40 bg-gradient-to-br from-[#548235]/10 via-card to-[#4472C4]/15 p-6 shadow-sm transition-all duration-500 hover:border-foreground/30 hover:shadow-lg hover:-translate-y-1">
              <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl opacity-30 bg-gradient-to-br from-[#548235] to-[#4472C4]" />
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#548235] to-[#4472C4] text-white shadow-sm">Core Commitment</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#4472C4]/30 bg-[#4472C4]/10 text-[#4472C4] transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground tracking-tight">Powering a Cleaner Future</h4>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">Clean mobility is not an alternative, but the standard. These five principles guide every aspect of the Transvolt brand, operations, and vision across India.</p>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-border/50 relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">Guiding North Star</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* SECTION 4: ANIMATED JOURNEY TIMELINE */}
      <RevealSection delay={100}>
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-muted/20 to-card p-6 sm:p-8 shadow-sm space-y-8">
          <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "repeating-linear-gradient(0deg, #548235 0, #548235 1px, transparent 0, transparent 50%), repeating-linear-gradient(90deg, #4472C4 0, #4472C4 1px, transparent 0, transparent 50%)", backgroundSize: "40px 40px" }} />
          <div className="flex flex-col gap-1.5 relative z-10">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#4472C4]/10 text-[#4472C4]"><TrendingUp className="h-3.5 w-3.5" /></span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">From Today to Tomorrow</h3>
            </div>
            <p className="text-sm text-muted-foreground">Transvolt&apos;s journey represents a continuous transition:</p>
          </div>
          <div className="relative z-10"><JourneyTimeline /></div>
          <div className="rounded-xl border border-border/60 bg-muted/30 p-5 space-y-3 text-xs sm:text-sm leading-relaxed text-muted-foreground relative z-10">
            <p>The Green and Blue arrows together tell this story. They represent both <strong className="text-foreground font-semibold">our present responsibility and our future ambition</strong> &mdash; moving forward from today&apos;s electric mobility solutions towards a broader and cleaner energy ecosystem.</p>
            <p>With a dedicated team and the support of leading infrastructure funds and financial institutions, Transvolt is driving the adoption of sustainable transportation solutions across India while continuously looking towards the future.</p>
          </div>
        </div>
      </RevealSection>

      {/* SECTION 5: WHAT TRANSVOLT STANDS FOR */}
      <RevealSection delay={100}>
        <div className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#548235]/10 text-[#548235]"><ShieldCheck className="h-3.5 w-3.5" /></span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">What Transvolt Stands For</h3>
            </div>
            <p className="text-sm text-muted-foreground">Core pillars driving our organization, partnerships, and operations across India:</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {whatWeStandFor.map((item, idx) => {
              const Icon = item.icon
              return (
                <TiltCard key={idx}>
                  <div className={cn("flex items-start gap-4 p-5 rounded-2xl border border-border/80 bg-card transition-all duration-300 shadow-sm cursor-default hover:shadow-md", item.border)}>
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", item.bg, item.color)}><Icon className="h-5 w-5" /></div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground tracking-tight">{item.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </TiltCard>
              )
            })}
          </div>
        </div>
      </RevealSection>

      {/* SECTION 6: CINEMATIC VISION CLOSING CARD */}
      <RevealSection delay={100}>
        <div className="relative overflow-hidden rounded-3xl border border-border/80 p-6 sm:p-12 shadow-sm text-center">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#4472C4]/10 via-card to-[#548235]/10" />
          <div className="pointer-events-none absolute left-[-20px] top-1/2 -translate-y-1/2 opacity-[0.06]"><RealDualArrowsSVG className="w-40 h-auto" /></div>
          <div className="pointer-events-none absolute right-[-20px] top-1/2 -translate-y-1/2 opacity-[0.06]"><RealDualArrowsSVG className="w-40 h-auto" /></div>
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <Badge className="bg-[#4472C4] text-white font-semibold text-xs px-3 py-1">Our Vision</Badge>
            <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Clean Mobility Not as an Alternative,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#548235] to-[#4472C4]">but the Standard</span>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              To help shape a transportation ecosystem where <strong className="text-foreground font-semibold">clean mobility is not an alternative, but the standard</strong>.
            </p>
          </div>
          <div className="max-w-3xl mx-auto mt-8 rounded-2xl border border-border/80 bg-background/90 p-6 sm:p-8 shadow-sm backdrop-blur-md space-y-5 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#548235]">One Clear Purpose</span>
            <p className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">&ldquo;To power a cleaner, more sustainable future for transportation.&rdquo;</p>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-border text-sm font-bold" style={{ backgroundImage: "linear-gradient(90deg, #548235, #4472C4, #548235)", backgroundSize: "200% auto", animation: "shimmer 3s linear infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Moving Forward. Powering a Cleaner Future.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-2 border-t border-border/50">
              {[{ label: "Purpose", value: "Zero Emissions", color: "#548235" }, { label: "Motto", value: "Moving Forward", color: "#4472C4" }, { label: "Focus", value: "Clean Energy", color: "#548235" }].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{s.label}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="max-w-3xl mx-auto mt-6 text-xs text-muted-foreground leading-relaxed italic border-t border-border/60 pt-5 relative z-10">
            This philosophy should guide every aspect of the Transvolt brandâ€”from how we operate our vehicles and charging infrastructure to how we communicate, design, and represent Transvolt across every brand touchpoint.
          </p>
        </div>
      </RevealSection>

      </div>
    </>
  )
}
