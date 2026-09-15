"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Download, FileText, ArrowLeft, Shield, Clock, AlertTriangle, CheckCircle2 } from "lucide-react"
import { PptIcon } from "@/components/assets/asset-tile"
import { Toaster, toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Asset {
  id: string
  name: string
  category: string
  status: "active" | "hold" | "hidden" | "draft"
  createdAt: string
  updatedAt: string
  createdBy: string
  formats: {
    PNG?: { fileName: string; fileData: string }
    JPG?: { fileName: string; fileData: string }
    SVG?: { fileName: string; fileData: string }
    PDF?: { fileName: string; fileData: string }
    CDR?: { fileName: string; fileData: string }
    PPT?: { fileName: string; fileData: string }
    WORD?: { fileName: string; fileData: string }
  }
  thumbnail?: string
}

const MIME_MAP = {
  JPG: "image/jpeg",
  PNG: "image/png",
  SVG: "image/svg+xml",
  PDF: "application/pdf",
  CDR: "application/octet-stream",
  PPT: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  WORD: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}

const FORMAT_DESCRIPTIONS: Record<string, string> = {
  JPG: "Image File",
  PNG: "Portable Network Graphic - Transparent",
  SVG: "Scalable Vector Graphics",
  PDF: "Portable Document Format",
  CDR: "CorelDraw File",
  PPT: "PowerPoint Presentation Template",
  WORD: "Microsoft Word Document"
}

const SEVEN_HOURS_MS = 7 * 60 * 60 * 1000 // 7 hours in milliseconds (25,200,000 ms)

function AnimatedWaveBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1

    const resize = () => {
      if (!canvas) return
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener("resize", resize)

    let mouseX = -1000
    let mouseY = -1000
    let targetMouseX = -1000
    let targetMouseY = -1000

    const handlePointerMove = (e: PointerEvent) => {
      targetMouseX = e.clientX
      targetMouseY = e.clientY
    }

    window.addEventListener("pointermove", handlePointerMove)

    let t = 0
    const TOTAL_LINES = 32
    const GAP = 8

    const render = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      ctx.clearRect(0, 0, width, height)

      t += 0.0052 // Motion speed slowed down by 50%

      mouseX += (targetMouseX - mouseX) * 0.1
      mouseY += (targetMouseY - mouseY) * 0.1

      // Cool Prismatic Spotlight
      if (mouseX > -500) {
        const broadGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 650)
        broadGlow.addColorStop(0, "rgba(255, 255, 255, 0.08)")
        broadGlow.addColorStop(0.25, "rgba(68, 114, 196, 0.06)")
        broadGlow.addColorStop(0.55, "rgba(84, 130, 53, 0.03)")
        broadGlow.addColorStop(1, "rgba(0, 0, 0, 0)")
        ctx.fillStyle = broadGlow
        ctx.fillRect(0, 0, width, height)

        const coreBeam = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 250)
        coreBeam.addColorStop(0, "rgba(255, 255, 255, 0.10)")
        coreBeam.addColorStop(0.5, "rgba(100, 200, 255, 0.04)")
        coreBeam.addColorStop(1, "rgba(0, 0, 0, 0)")
        ctx.fillStyle = coreBeam
        ctx.fillRect(0, 0, width, height)
      }

      const setHeight = (TOTAL_LINES - 1) * GAP
      const centerY = height * 0.50
      const overlapOffset = (setHeight * 0.40) / 2
      const greenCenterY = centerY - overlapOffset
      const blueCenterY = centerY + overlapOffset

      // SET 1: 32 GREEN LINES (#548235) with Left-to-Right Beam Lights
      for (let i = 0; i < TOTAL_LINES; i++) {
        const normI = (i - (TOTAL_LINES - 1) / 2) / (TOTAL_LINES / 2)
        const centerFactor = 1 - Math.abs(normI)
        const alpha = 0.22 + centerFactor * 0.55
        ctx.strokeStyle = `rgba(84, 130, 53, ${alpha})`
        ctx.lineWidth = 1.15

        ctx.beginPath()
        const step = 6
        for (let x = 0; x <= width + step; x += step) {
          const normX = x / width
          const splay = 1 + 0.85 * Math.sin(normX * 3.5 + t * 0.8) + 0.4 * Math.cos(normX * 5.5 - t * 0.55)
          const lineOffset = normI * ((TOTAL_LINES / 2) * GAP) * splay
          const phaseSplay = normI * 0.4
          const ampSplay = 1 + normI * 0.28

          const wave1 = Math.sin(normX * 4.2 + t * 0.85 + phaseSplay) * 58 * ampSplay
          const wave2 = Math.cos(normX * 2.6 - t * 0.55 - phaseSplay * 0.4) * 36
          const wave3 = Math.sin(normX * 6.5 + t * 1.1 + normI * 0.5) * 16

          const y = greenCenterY + lineOffset + wave1 + wave2 + wave3

          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()

        const beamProgress = (t * 0.35 + (i / TOTAL_LINES) * 0.75) % 1.3 - 0.15
        const beamCenter = beamProgress * width
        const beamLength = 150
        const beamStart = beamCenter - beamLength
        const beamEnd = beamCenter + beamLength

        if (beamEnd > 0 && beamStart < width) {
          ctx.beginPath()
          let beamStarted = false
          for (let bx = Math.max(0, beamStart); bx <= Math.min(width, beamEnd) + step; bx += step) {
            const normX = bx / width
            const splay = 1 + 0.85 * Math.sin(normX * 3.5 + t * 0.8) + 0.4 * Math.cos(normX * 5.5 - t * 0.55)
            const lineOffset = normI * ((TOTAL_LINES / 2) * GAP) * splay
            const phaseSplay = normI * 0.4
            const ampSplay = 1 + normI * 0.28

            const wave1 = Math.sin(normX * 4.2 + t * 0.85 + phaseSplay) * 58 * ampSplay
            const wave2 = Math.cos(normX * 2.6 - t * 0.55 - phaseSplay * 0.4) * 36
            const wave3 = Math.sin(normX * 6.5 + t * 1.1 + normI * 0.5) * 16

            const by = greenCenterY + lineOffset + wave1 + wave2 + wave3

            if (!beamStarted) {
              ctx.moveTo(bx, by)
              beamStarted = true
            } else {
              ctx.lineTo(bx, by)
            }
          }

          if (beamEnd > beamStart) {
            const beamGrad = ctx.createLinearGradient(beamStart, 0, beamEnd, 0)
            beamGrad.addColorStop(0, "rgba(160, 240, 100, 0)")
            beamGrad.addColorStop(0.5, "rgba(210, 255, 160, 0.15)")
            beamGrad.addColorStop(1, "rgba(160, 240, 100, 0)")
            ctx.strokeStyle = beamGrad
            ctx.lineWidth = 2.4
            ctx.stroke()
          }
        }
      }

      // SET 2: 32 BLUE LINES (#4472C4) with Right-to-Left Beam Lights
      for (let i = 0; i < TOTAL_LINES; i++) {
        const normI = (i - (TOTAL_LINES - 1) / 2) / (TOTAL_LINES / 2)
        const centerFactor = 1 - Math.abs(normI)
        const alpha = 0.22 + centerFactor * 0.55
        ctx.strokeStyle = `rgba(68, 114, 196, ${alpha})`
        ctx.lineWidth = 1.15

        ctx.beginPath()
        const step = 6
        for (let x = 0; x <= width + step; x += step) {
          const normX = x / width
          const splay = 1 + 0.85 * Math.sin(normX * 3.2 - t * 0.75) + 0.4 * Math.cos(normX * 5.2 + t * 0.6)
          const lineOffset = normI * ((TOTAL_LINES / 2) * GAP) * splay
          const phaseSplay = normI * 0.4
          const ampSplay = 1 + normI * 0.28

          const wave1 = Math.sin(normX * 3.8 - t * 0.75 + phaseSplay) * 62 * ampSplay
          const wave2 = Math.cos(normX * 2.9 + t * 0.65 - phaseSplay * 0.4) * 38
          const wave3 = Math.sin(normX * 6.2 - t * 1.05 + normI * 0.5) * 16

          const y = blueCenterY + lineOffset + wave1 + wave2 + wave3

          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()

        const beamProgress = 1 - ((t * 0.35 + (i / TOTAL_LINES) * 0.75) % 1.3 - 0.15)
        const beamCenter = beamProgress * width
        const beamLength = 150
        const beamStart = beamCenter - beamLength
        const beamEnd = beamCenter + beamLength

        if (beamEnd > 0 && beamStart < width) {
          ctx.beginPath()
          let beamStarted = false
          for (let bx = Math.max(0, beamStart); bx <= Math.min(width, beamEnd) + step; bx += step) {
            const normX = bx / width
            const splay = 1 + 0.85 * Math.sin(normX * 3.2 - t * 0.75) + 0.4 * Math.cos(normX * 5.2 + t * 0.6)
            const lineOffset = normI * ((TOTAL_LINES / 2) * GAP) * splay
            const phaseSplay = normI * 0.4
            const ampSplay = 1 + normI * 0.28

            const wave1 = Math.sin(normX * 3.8 - t * 0.75 + phaseSplay) * 62 * ampSplay
            const wave2 = Math.cos(normX * 2.9 + t * 0.65 - phaseSplay * 0.4) * 38
            const wave3 = Math.sin(normX * 6.2 - t * 1.05 + normI * 0.5) * 16

            const by = blueCenterY + lineOffset + wave1 + wave2 + wave3

            if (!beamStarted) {
              ctx.moveTo(bx, by)
              beamStarted = true
            } else {
              ctx.lineTo(bx, by)
            }
          }

          if (beamEnd > beamStart) {
            const beamGrad = ctx.createLinearGradient(beamStart, 0, beamEnd, 0)
            beamGrad.addColorStop(0, "rgba(100, 180, 255, 0)")
            beamGrad.addColorStop(0.5, "rgba(190, 230, 255, 0.15)")
            beamGrad.addColorStop(1, "rgba(100, 180, 255, 0)")
            ctx.strokeStyle = beamGrad
            ctx.lineWidth = 2.4
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", handlePointerMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ width: "100%", height: "100%" }}
    />
  )
}

function DownloadTab({ label, description, available, onClick }: { label: string; description: string; available: boolean; onClick: () => void }) {
  return (
    <button
      disabled={!available}
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-3.5 rounded-xl border text-sm font-semibold transition-all text-left w-full",
        available 
          ? "bg-[#4472C4] text-white border-[#4472C4] hover:bg-[#3460b0] cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99]" 
          : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
      )}
      style={{
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-sm">{label}</span>
        <span className={cn(
          "text-[11px] font-normal",
          available ? "text-white/85" : "text-white/30"
        )}>
          {description}
        </span>
      </div>
      {available ? (
        <Download className="h-4 w-4 shrink-0 text-white" />
      ) : (
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/30 shrink-0 ml-2">
          Not Available
        </span>
      )}
    </button>
  )
}

export default function ShareAssetPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = params?.id as string

  const [asset, setAsset] = React.useState<Asset | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [now, setNow] = React.useState<number>(Date.now())
  const [createdTime, setCreatedTime] = React.useState<number>(Date.now())

  // Parse or initialize creation timestamp
  React.useEffect(() => {
    if (!id) return

    // 1. Check timestamp param in URL
    const urlTimeParam = searchParams.get("t")
    let initialTime: number

    if (urlTimeParam && !isNaN(parseInt(urlTimeParam, 10))) {
      initialTime = parseInt(urlTimeParam, 10)
    } else {
      // 2. Check localStorage cache
      const storedTime = localStorage.getItem(`branding_share_${id}_time`)
      if (storedTime && !isNaN(parseInt(storedTime, 10))) {
        initialTime = parseInt(storedTime, 10)
      } else {
        // 3. First time accessed without param: stamp current time
        initialTime = Date.now()
        localStorage.setItem(`branding_share_${id}_time`, initialTime.toString())
      }
    }

    setCreatedTime(initialTime)

    // Load asset from storage
    const storedAssets = localStorage.getItem("branding_portal_assets")
    if (storedAssets) {
      try {
        const parsed = JSON.parse(storedAssets) as Asset[]
        const found = parsed.find(a => a.id === id)
        if (found) {
          setAsset(found)
        }
      } catch (e) {
        console.error("Failed to parse assets", e)
      }
    }
    setLoading(false)
  }, [id, searchParams])

  // Lock document background to black to eliminate white scrollbar gutter
  React.useEffect(() => {
    const origHtmlBg = document.documentElement.style.backgroundColor
    const origBodyBg = document.body.style.backgroundColor
    document.documentElement.style.backgroundColor = "#000000"
    document.body.style.backgroundColor = "#000000"
    return () => {
      document.documentElement.style.backgroundColor = origHtmlBg
      document.body.style.backgroundColor = origBodyBg
    }
  }, [])

  // Live countdown clock ticker (1 sec interval)
  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Calculate 7-hour expiration
  const expiresAt = createdTime + SEVEN_HOURS_MS
  const remainingMs = expiresAt - now
  const isExpired = remainingMs <= 0

  // Format remaining time into HH:MM:SS
  const formatCountdown = (ms: number) => {
    if (ms <= 0) return "00h : 00m : 00s"
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${String(hours).padStart(2, "0")}h : ${String(minutes).padStart(2, "0")}m : ${String(seconds).padStart(2, "0")}s`
  }

  const triggerDownload = (format: keyof typeof MIME_MAP) => {
    if (isExpired) {
      toast.error("This share link has expired.")
      return
    }
    if (!asset) return
    const mimeType = MIME_MAP[format] || "application/octet-stream"
    const element = document.createElement("a")
    const formatData = (asset.formats as any)?.[format]
    if (formatData?.fileData) {
      if (formatData.fileData.startsWith("data:")) {
        fetch(formatData.fileData)
          .then(res => res.blob())
          .then(blob => {
            const url = URL.createObjectURL(blob)
            element.href = url
            element.download = formatData.fileName
            document.body.appendChild(element)
            element.click()
            document.body.removeChild(element)
            URL.revokeObjectURL(url)
          })
        toast.success(`Downloaded ${formatData.fileName}`)
      } else {
        const file = new Blob([formatData.fileData], { type: mimeType })
        const url = URL.createObjectURL(file)
        element.href = url
        element.download = formatData.fileName
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
        URL.revokeObjectURL(url)
        toast.success(`Downloaded ${formatData.fileName}`)
      }
    } else if (format === "PPT" && (asset.category === "presentation" || asset.category?.toLowerCase().includes("presentation"))) {
      const file = new Blob([`Transvolt Official Presentation Template\nAsset: ${asset.name}\nGenerated: ${new Date().toLocaleString()}`], { type: mimeType })
      const url = URL.createObjectURL(file)
      element.href = url
      element.download = `${asset.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.pptx`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      URL.revokeObjectURL(url)
      toast.success(`Downloaded ${asset.name}.pptx`)
    }
  }

  const triggerZipDownload = () => {
    if (isExpired) {
      toast.error("This share link has expired.")
      return
    }
    if (!asset) return
    const availableFormats = Object.keys(asset.formats).filter(f => asset.formats[f as any])
    if (availableFormats.length === 0) {
      toast.error("No download formats available.")
      return
    }

    const mockZipContent = `ZIP file archive\nAsset: ${asset.name}\nFormats included: ${availableFormats.join(", ")}\nDownloaded: ${new Date().toLocaleString()}`
    const file = new Blob([mockZipContent], { type: "application/zip" })
    const url = URL.createObjectURL(file)
    const element = document.createElement("a")
    element.href = url
    element.download = `${asset.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_all_assets.zip`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    URL.revokeObjectURL(url)
    toast.success(`Downloaded all formats as ZIP!`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-sm font-semibold tracking-wide animate-pulse">Loading asset...</div>
      </div>
    )
  }

  // --- EXPIRED LINK STATE (Strict 7-Hour Security Enforcement) ---
  if (isExpired) {
    return (
      <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 select-none overflow-hidden">
        <AnimatedWaveBackground />

        <div 
          className="relative z-10 max-w-md w-full rounded-[24px] p-8 sm:p-10 border border-white/20 text-center space-y-6 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%), rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            boxShadow: "0 32px 64px -16px rgba(0, 0, 0, 0.8), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4)"
          }}
        >
          {/* Transvolt Logo Header */}
          <div className="flex justify-center mb-2" style={{ filter: "drop-shadow(0 2px 10px #000000)" }}>
            <Image
              src="/logos/Logo_White.svg"
              alt="Transvolt Logo"
              width={220}
              height={48}
              style={{ width: "220px", height: "auto" }}
              className="object-contain"
              priority
            />
          </div>

          {/* Expired Shield Icon */}
          <div className="mx-auto w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <Clock className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Share Link Expired
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              This secure brand asset link expired after <strong className="text-white font-semibold">7 hours</strong> in compliance with Transvolt security policy.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300/90 text-left space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Security Compliance</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Public links are automatically invalidated after 7 hours to ensure brand asset governance. Please contact the Corporate Communications team to generate a fresh link.
            </p>
          </div>

          <button
            onClick={() => router.push("/login")}
            className="w-full h-11 rounded-xl bg-gradient-to-b from-[#3B82F6] to-[#2563EB] text-white font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go to Portal Login</span>
          </button>
        </div>
      </div>
    )
  }

  // --- ASSET NOT FOUND STATE ---
  if (!asset) {
    return (
      <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 select-none overflow-hidden">
        <AnimatedWaveBackground />
        <div 
          className="relative z-10 max-w-md w-full rounded-[24px] p-8 border border-white/20 text-center space-y-6 shadow-2xl"
          style={{
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(20px)",
          }}
        >
          <Shield className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Asset Not Found</h1>
          <p className="text-sm text-neutral-400 max-w-xs mx-auto">
            The link you followed may be broken or the asset was removed.
          </p>
          <button 
            onClick={() => router.push("/login")}
            className="mt-2 inline-flex items-center justify-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Portal Login</span>
          </button>
        </div>
      </div>
    )
  }

  const imageFormat = asset.formats.PNG || asset.formats.JPG
  const hasImage = !!imageFormat?.fileData

  return (
    <div className="relative min-h-screen bg-black text-neutral-200 flex flex-col p-6 sm:p-12 overflow-hidden select-none font-sans">
      <Toaster position="bottom-center" />
      
      {/* Dynamic Animated Wave Canvas: 32 Green Lines + 32 Blue Lines from Login Page */}
      <AnimatedWaveBackground />

      {/* Brand Header */}
      <header className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-8 border-b border-white/15 relative z-10">
        
        {/* 1. Official Transvolt Logo on Top + Subtitle Line below Logo */}
        <div className="flex flex-col items-start gap-1.5">
          <div 
            className="flex items-center" 
            style={{ filter: "drop-shadow(0 2px 10px #000000) drop-shadow(0 4px 20px #000000)" }}
          >
            <Image
              src="/logos/Logo_White.svg"
              alt="Transvolt Logo"
              width={220}
              height={48}
              style={{ width: "220px", height: "auto" }}
              className="object-contain"
              priority
            />
          </div>
          <p 
            className="text-[11px] text-[#9ca3af] font-medium tracking-wide"
            style={{ textShadow: "0 1px 8px #000000, 0 2px 16px #000000" }}
          >
            Official Brand Assets Portal. Public sharing is strictly monitored and rate-limited.
          </p>
        </div>

        {/* 2. Top Right Actions: 7-Hour Live Countdown Badge + Portal Login Button */}
        <div className="flex items-center gap-3">
          
          {/* 7-Hour Live Countdown Timer Badge */}
          <div 
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-bold shadow-lg"
            style={{
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 0 16px rgba(245, 158, 11, 0.2)"
            }}
            title="This secure link is strictly available for 7 hours from generation"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="tracking-wide">
              This Link will Expires in: <span className="font-mono text-white ml-1">{formatCountdown(remainingMs)}</span>
            </span>
          </div>

          {/* Portal Login Button */}
          <Link 
            href="/login"
            className="flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white px-3 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            style={{ backdropFilter: "blur(8px)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Portal Login</span>
          </Link>
        </div>
      </header>

      {/* Primary Showcase Card Container */}
      <main className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10 flex-1">
        
        {/* Left Column: Asset Preview Card with Ultra-Transparent Glassmorphism */}
        <section 
          className="lg:col-span-7 bg-checkerboard border border-white/20 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[42vh] sm:min-h-[52vh] shadow-2xl relative overflow-hidden"
          style={{
            boxShadow: "0 32px 64px -16px rgba(0, 0, 0, 0.7), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.3)"
          }}
        >
          <div className="absolute top-3 left-3">
            <Badge className="bg-[#4472C4] hover:bg-[#4472C4] text-white text-[10px] font-bold border-none uppercase py-0.5 px-2.5 shadow-sm">
              Official Preview
            </Badge>
          </div>
          
          {hasImage && imageFormat ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={imageFormat.fileData} 
              alt={asset.name} 
              className="max-h-[45vh] max-w-full object-scale-down rounded-md animate-in fade-in duration-300 drop-shadow-md"
            />
          ) : (asset.category === "presentation" || asset.category?.toLowerCase().includes("presentation") || !!asset.formats.PPT) ? (
            <div className="flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
              <PptIcon size={80} />
              <div className="flex flex-col items-center text-center">
                <span className="text-sm font-bold text-[#D24726] tracking-wider uppercase">
                  Microsoft PowerPoint Template
                </span>
                <span className="text-xs text-neutral-400 mt-0.5">
                  Official 16:9 Master Presentation Deck
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-neutral-400">
              <FileText className="h-16 w-16 mb-2 opacity-40 text-white" />
              <span className="text-sm font-semibold">Document Asset Preview Not Available</span>
              <span className="text-xs mt-1 text-neutral-400">(PDF / CDR vector formats only)</span>
            </div>
          )}
        </section>

        {/* Right Column: Asset Metadata & Download Panel with Glassmorphism */}
        <section 
          className="lg:col-span-5 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl text-left border border-white/20 relative"
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%), rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(18px) saturate(190%) contrast(105%)",
            WebkitBackdropFilter: "blur(18px) saturate(190%) contrast(105%)",
            boxShadow: "0 32px 64px -16px rgba(0, 0, 0, 0.6), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.35)"
          }}
        >
          {/* Header Metadata info */}
          <div className="border-b border-white/15 pb-4 space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4472C4]">
              OFFICIAL ASSET
            </span>
            <h1 
              className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
              style={{ textShadow: "0 2px 10px #000000" }}
            >
              {asset.name}
            </h1>
            <p className="text-xs text-neutral-300 mt-2 flex items-center gap-1.5 font-medium">
              <span className="text-neutral-400">Category:</span>
              <span className="font-semibold text-white capitalize">{asset.category.replace(/[^a-zA-Z0-9]+/g, ' ')}</span>
              <span className="mx-1 text-white/40">•</span>
              <span className="text-neutral-400">Updated:</span>
              <span className="font-semibold text-white">{asset.updatedAt}</span>
            </p>
          </div>

          {/* Download Options */}
          <div className="flex flex-col gap-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Download Formats
            </h2>
            <div className="flex flex-col gap-2.5">
              {(["JPG", "PNG", "SVG", "PDF", "CDR", "PPT"] as const).map((format) => {
                const isAvailable = !!asset.formats[format] || (format === "PPT" && (asset.category === "presentation" || asset.category?.toLowerCase().includes("presentation")))
                const description = FORMAT_DESCRIPTIONS[format]
                const label = format === "PPT" ? "Download Presentation PPT" : `Download ${format}`
                
                return (
                  <DownloadTab 
                    key={format}
                    label={label}
                    description={description}
                    available={isAvailable}
                    onClick={() => triggerDownload(format)}
                  />
                )
              })}

              {/* Download All Zip */}
              <button
                onClick={triggerZipDownload}
                className="flex items-center justify-between p-3.5 rounded-xl text-sm font-semibold transition-all text-left w-full cursor-pointer shadow-lg border hover:scale-[1.01] active:scale-[0.99] mt-1"
                style={{
                  background: "linear-gradient(180deg, #10B981 0%, #059669 100%)",
                  borderColor: "rgba(255, 255, 255, 0.25)",
                  boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.4)"
                }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-sm text-white">Download All Formats</span>
                  <span className="text-[11px] font-normal text-white/85">
                    All available formats in a single ZIP archive
                  </span>
                </div>
                <Download className="h-4 w-4 shrink-0 text-white" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Copyright */}
      <footer className="max-w-6xl mx-auto w-full text-center text-[10px] text-neutral-500 mt-12 relative z-10 space-y-1">
        <p>© {new Date().getFullYear()} Transvolt Mobility Private Limited. All rights reserved.</p>
        <p className="text-neutral-600">Official Brand Assets Portal. Public sharing is strictly monitored and rate-limited.</p>
      </footer>
    </div>
  )
}
