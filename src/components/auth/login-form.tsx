"use client"

import * as React from "react"
import Image from "next/image"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Eye, EyeOff, KeyRound, Sparkles, ArrowRight, Play } from "lucide-react"
import { toast } from "sonner"
import { RequestAccessModal } from "./request-access-modal"
import { InteractivePresentationDeck } from "@/components/presentation/interactive-presentation-deck"
import { PresentationTransition } from "@/components/presentation/presentation-transition"

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

    // Interactive Spotlight Mouse Tracking with Smooth Fluid Damping
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
    const TOTAL_LINES = 32 // Exactly 32 lines per set
    const GAP = 8 // Exactly 8px gap between each line

    const render = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      ctx.clearRect(0, 0, width, height)

      t += 0.0052 // Motion speed slowed down by 50%

      // Smooth mouse interpolation for spotlight physics
      mouseX += (targetMouseX - mouseX) * 0.1
      mouseY += (targetMouseY - mouseY) * 0.1

      // --- COOL PRISMATIC CANVAS SPOTLIGHT ---
      if (mouseX > -500) {
        // Broad atmospheric color wash
        const broadGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 650)
        broadGlow.addColorStop(0, "rgba(255, 255, 255, 0.08)")
        broadGlow.addColorStop(0.25, "rgba(68, 114, 196, 0.06)")
        broadGlow.addColorStop(0.55, "rgba(84, 130, 53, 0.03)")
        broadGlow.addColorStop(1, "rgba(0, 0, 0, 0)")
        ctx.fillStyle = broadGlow
        ctx.fillRect(0, 0, width, height)

        // Focused core optic beam
        const coreBeam = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 250)
        coreBeam.addColorStop(0, "rgba(255, 255, 255, 0.10)")
        coreBeam.addColorStop(0.5, "rgba(100, 200, 255, 0.04)")
        coreBeam.addColorStop(1, "rgba(0, 0, 0, 0)")
        ctx.fillStyle = coreBeam
        ctx.fillRect(0, 0, width, height)
      }

      // Base vertical center offsets with 60% overlap between both sets
      const setHeight = (TOTAL_LINES - 1) * GAP
      const centerY = height * 0.50
      const overlapOffset = (setHeight * 0.40) / 2
      const greenCenterY = centerY - overlapOffset
      const blueCenterY = centerY + overlapOffset

      // --- SET 1: 32 GREEN LINES (#548235) with Left-to-Right Beam Lights (Reduced opacity by 40%) ---
      for (let i = 0; i < TOTAL_LINES; i++) {
        const normI = (i - (TOTAL_LINES - 1) / 2) / (TOTAL_LINES / 2) // normalized -1 to +1
        const centerFactor = 1 - Math.abs(normI)
        const alpha = 0.13 + centerFactor * 0.33
        ctx.strokeStyle = `rgba(84, 130, 53, ${alpha})` // Transvolt Green #548235
        ctx.lineWidth = 1.15

        ctx.beginPath()
        const step = 6
        for (let x = 0; x <= width + step; x += step) {
          const normX = x / width

          // Prominent Dynamic Splay: lines fan out widely at wave loops and pinch at nodes
          const splay = 1 + 0.85 * Math.sin(normX * 3.5 + t * 0.8) + 0.4 * Math.cos(normX * 5.5 - t * 0.55)
          const lineOffset = normI * ((TOTAL_LINES / 2) * GAP) * splay

          // Phase & amplitude divergence for 3D splay fan curvature
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

        // --- ONE BEAM LIGHT PER GREEN LINE: Moving Left to Right (Reduced opacity by 40%) ---
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
            beamGrad.addColorStop(0.5, "rgba(210, 255, 160, 0.09)") // 9% opacity beam light (down 40% from 15%)
            beamGrad.addColorStop(1, "rgba(160, 240, 100, 0)")
            ctx.strokeStyle = beamGrad
            ctx.lineWidth = 2.4
            ctx.stroke()
          }
        }
      }

      // --- SET 2: 32 BLUE LINES (#4472C4) with Right-to-Left Beam Lights (Reduced opacity by 40%) ---
      for (let i = 0; i < TOTAL_LINES; i++) {
        const normI = (i - (TOTAL_LINES - 1) / 2) / (TOTAL_LINES / 2) // normalized -1 to +1
        const centerFactor = 1 - Math.abs(normI)
        const alpha = 0.13 + centerFactor * 0.33
        ctx.strokeStyle = `rgba(68, 114, 196, ${alpha})` // Transvolt Blue #4472C4
        ctx.lineWidth = 1.15

        ctx.beginPath()
        const step = 6
        for (let x = 0; x <= width + step; x += step) {
          const normX = x / width

          // Counter-flowing Dynamic Splay
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

        // --- ONE BEAM LIGHT PER BLUE LINE: Moving Right to Left (Reduced opacity by 40%) ---
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
            beamGrad.addColorStop(0.5, "rgba(190, 230, 255, 0.09)") // 9% opacity beam light (down 40% from 15%)
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
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  )
}

import {
  getSuperAdminCredentials,
  isSuperAdminEmail,
} from "@/lib/auth/superadmin-credentials"

export function LoginForm() {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = React.useState("admin")
  const [password, setPassword] = React.useState("123")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [mousePos, setMousePos] = React.useState<{ x: number; y: number }>({ x: -1000, y: -1000 })
  const cardRef = React.useRef<HTMLDivElement | null>(null)
  const [cardMousePos, setCardMousePos] = React.useState<{ x: number; y: number }>({ x: -1000, y: -1000 })

  const [rememberMe, setRememberMe] = React.useState(true)
  const [isRequestAccessOpen, setIsRequestAccessOpen] = React.useState(false)
  const [isPresentationOpen, setIsPresentationOpen] = React.useState(false)
  const [isTransitioning, setIsTransitioning] = React.useState(false)

  const handleLaunchPresentation = () => {
    if (isTransitioning || isPresentationOpen) return
    setIsTransitioning(true)

    // 50% slower, smooth cinematic transition: allow user to enjoy the unfolding stage & slide reveal
    setTimeout(() => {
      setIsPresentationOpen(true)
    }, 1650)

    // Clean up transition overlay once deck is fully active
    setTimeout(() => {
      setIsTransitioning(false)
    }, 2250)
  }

  // Load configured credentials if custom
  React.useEffect(() => {
    const creds = getSuperAdminCredentials()
    setEmail(creds.email)
    setPassword(creds.password)
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await login(email, password)
    setIsSubmitting(false)
  }

  const handleOAuthLogin = async (provider: string) => {
    setIsSubmitting(true)
    toast.loading(`Signing in with ${provider}...`, { id: "oauth-login" })
    setTimeout(async () => {
      toast.dismiss("oauth-login")
      const creds = getSuperAdminCredentials()
      await login(email || creds.email, password || creds.password)
      setIsSubmitting(false)
    }, 600)
  }

  const handleForgotPassword = () => {
    toast.info("Please contact the Corporate Communications team to reset your password.")
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY })
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      setCardMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  if (isLoading) return null

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full bg-[#000000] text-white flex items-center justify-center p-6 lg:p-12 overflow-hidden select-none"
    >
      {/* Multi-Layer Cool Atmospheric Prismatic Spotlight Following Cursor */}
      {mousePos.x > -500 && (
        <>
          {/* Core Spotlight Beam Aura */}
          <div 
            className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
            style={{
              background: `radial-gradient(420px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.08), rgba(68, 114, 196, 0.06) 40%, rgba(84, 130, 53, 0.03) 65%, transparent 80%)`
            }}
          />
          {/* Wide Atmospheric Ambient Bloom */}
          <div 
            className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
            style={{
              background: `radial-gradient(850px circle at ${mousePos.x}px ${mousePos.y}px, rgba(68, 114, 196, 0.04) 0%, rgba(84, 130, 53, 0.02) 45%, transparent 75%)`
            }}
          />
        </>
      )}

      {/* Dynamic Animated Wave Canvas: 32 Green Lines + 32 Blue Lines with 8px Gap & Splay */}
      <AnimatedWaveBackground />

      {/* Main Grid Container */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* Left Column: Brand Story & Official Guidelines with Pure Black Shadow */}
        <div className="lg:col-span-7 flex flex-col text-left relative z-10">
          {/* Official Transvolt Logo with Pure Black Shadow */}
          <div className="mb-8 sm:mb-10" style={{ filter: "drop-shadow(0 4px 16px #000000) drop-shadow(0 0 28px #000000)" }}>
            <Image
              src="/logos/Logo_White.svg"
              alt="Transvolt Logo"
              width={355}
              height={76}
              style={{ width: "355px", height: "auto" }}
              className="object-contain"
              priority
            />
          </div>

          {/* Heading with Pure Black Shadow */}
          <h1 
            className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-[1.2] mb-6"
            style={{ textShadow: "0 2px 12px #000000, 0 4px 24px #000000, 0 0 36px #000000" }}
          >
            Welcome to Transvolt<br />
            Branding Portal
          </h1>

          {/* Subheading with Pure Black Shadow */}
          <div className="mb-6">
            <h2 
              className="text-base sm:text-lg font-bold text-white leading-snug"
              style={{ textShadow: "0 2px 10px #000000, 0 4px 20px #000000, 0 0 30px #000000" }}
            >
              One Platform. One Trusted<br />
              Source for Transvolt Branding.
            </h2>
          </div>

          {/* Paragraphs with Pure Black Shadow */}
          <div 
            className="space-y-4 text-xs sm:text-[13px] text-[#9ca3af] leading-relaxed max-w-lg"
            style={{ textShadow: "0 2px 8px #000000, 0 4px 16px #000000, 0 0 24px #000000" }}
          >
            <p>
              A centralized platform for accessing the latest and officially approved Transvolt brand assets, guidelines, templates, and resources.
            </p>
            <p>
              Enable everyone across Transvolt to maintain brand consistency with a single, trusted source for all digital, print, vehicle, charger, and corporate branding materials.
            </p>
            <p>
              Always access the right asset, the latest version, and the approved brand standards—all in one place.
            </p>
          </div>

          {/* Simple Single-Color Presentation Button */}
          <div className="mt-6 sm:mt-7 max-w-lg">
            <button
              type="button"
              id="login-watch-presentation-btn"
              onClick={handleLaunchPresentation}
              className="group w-full flex items-center justify-between gap-3 sm:gap-4 rounded-xl border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/60 p-3.5 sm:p-4 transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/10 active:scale-[0.99] text-left"
            >
              {/* Left Play Icon in single color */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <Play className="h-4 w-4 fill-current ml-0.5" />
              </div>

              {/* Text block in clean single theme */}
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-semibold tracking-tight text-white group-hover:text-blue-200 transition-colors block">
                  Watch Presentation &amp; Benefits of this Portal
                </span>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-300 truncate mt-0.5 transition-colors">
                  Explore portal overview, brand workflows &amp; enterprise benefits
                </p>
              </div>

              {/* Right Arrow CTA Badge */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Sign In Card with Ultra-Transparent Apple Glassmorphism */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div 
            ref={cardRef}
            className="relative w-full max-w-[420px] rounded-[28px] p-8 sm:p-9 space-y-5 overflow-hidden border border-white/20 transition-all duration-300"
            style={{ 
              background: cardMousePos.x > -200 
                ? `radial-gradient(380px circle at ${cardMousePos.x}px ${cardMousePos.y}px, rgba(255, 255, 255, 0.08), transparent 70%), linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%), rgba(0, 0, 0, 0.05)`
                : "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%), rgba(0, 0, 0, 0.05)", 
              backdropFilter: "blur(18px) saturate(190%) contrast(105%)", 
              WebkitBackdropFilter: "blur(18px) saturate(190%) contrast(105%)",
              boxShadow: "0 32px 64px -16px rgba(0, 0, 0, 0.5), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.05)"
            }}
          >
            {/* Apple Specular Highlight Line at the Top Edge */}
            <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

            {/* Card Title */}
            <h2 className="text-[1.35rem] font-bold text-white text-center tracking-tight drop-shadow-sm">
              Sign in to Portal
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* E-mail / User ID Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-extrabold uppercase tracking-widest text-[#94a3b8]">
                  E-MAIL / USER ID
                </Label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-[#94a3b8] pointer-events-none" />
                  <Input
                    id="email"
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin"
                    className="border border-white/15 text-white placeholder:text-[#64748b] h-11 pl-10 pr-4 rounded-xl focus-visible:ring-2 focus-visible:ring-[#548235] focus-visible:border-[#548235] focus:border-[#548235] focus:bg-[#548235]/10 text-xs sm:text-sm font-medium transition-all"
                    style={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.03)", 
                      backdropFilter: "blur(6px)", 
                      WebkitBackdropFilter: "blur(6px)",
                      boxShadow: "inset 0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 0 0 rgba(255, 255, 255, 0.06)"
                    }}
                  />
                </div>
                {(email.toLowerCase().includes("@transvolt.in") || isSuperAdminEmail(email)) && (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 pt-0.5 animate-in fade-in">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span>
                      {isSuperAdminEmail(email)
                        ? "Transvolt Super Admin Account"
                        : "Transvolt In-House Person Account (@transvolt.in)"}
                    </span>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[10px] font-extrabold uppercase tracking-widest text-[#94a3b8]">
                  PASSWORD
                </Label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-[#94a3b8] pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="border border-white/15 text-white placeholder:text-[#64748b] h-11 pl-10 pr-10 rounded-xl focus-visible:ring-2 focus-visible:ring-[#548235] focus-visible:border-[#548235] focus:border-[#548235] focus:bg-[#548235]/10 text-xs sm:text-sm font-medium transition-all"
                    style={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.03)", 
                      backdropFilter: "blur(6px)", 
                      WebkitBackdropFilter: "blur(6px)",
                      boxShadow: "inset 0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 0 0 rgba(255, 255, 255, 0.06)"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#94a3b8] hover:text-white transition-colors p-1 cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">Toggle password visibility</span>
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox & Forgot Password Row */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div 
                      className={`w-4 h-4 rounded-[5px] border transition-all flex items-center justify-center ${
                        rememberMe 
                          ? "bg-[#3B82F6] border-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                          : "border-white/20 bg-white/5 hover:border-white/40"
                      }`}
                    >
                      {rememberMe && (
                        <svg className="w-2.5 h-2.5 text-white stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-[#94a3b8] group-hover:text-white transition-colors">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button (Apple Liquid Glass Blue Button) */}
              <div className="pt-1">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm active:scale-[0.99]"
                  style={{
                    background: "linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)",
                    boxShadow: "0 12px 28px -6px rgba(37, 99, 235, 0.55), inset 0 1px 1px 0 rgba(255, 255, 255, 0.45), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.25)"
                  }}
                >
                  {isSubmitting ? (
                    "Signing in..."
                  ) : (
                    <>
                      <span>Sign In</span>
                      <span>→</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Or Continue With Divider */}
              <div className="relative flex items-center justify-center pt-2">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-transparent px-3 text-[10px] uppercase font-bold tracking-wider text-[#64748b] whitespace-nowrap">
                  or continue with
                </span>
                <div className="border-t border-white/10 w-full" />
              </div>

              {/* Social OAuth Buttons (Microsoft & Google) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Microsoft Button */}
                <button
                  type="button"
                  onClick={() => handleOAuthLogin("Microsoft")}
                  className="h-10 px-3 rounded-xl border border-white/15 hover:border-white/30 bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer group"
                  style={{
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
                  }}
                >
                  {/* Official Microsoft 4-Color Grid SVG */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                  <span className="text-xs font-semibold text-white/90 group-hover:text-white transition-colors">
                    Microsoft
                  </span>
                </button>

                {/* Google Button */}
                <button
                  type="button"
                  onClick={() => handleOAuthLogin("Google")}
                  className="h-10 px-3 rounded-xl border border-white/15 hover:border-white/30 bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer group"
                  style={{
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
                  }}
                >
                  {/* Official Google 'G' SVG */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-white/90 group-hover:text-white transition-colors">
                    Google
                  </span>
                </button>
              </div>

              {/* Highlighted Interactive Auto-Animated "Request Access" Button */}
              <div className="pt-4 border-t border-white/10 mt-2">
                <div className="mb-2 flex items-center justify-between text-xs px-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Need Access?
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    Administrator Review
                  </span>
                </div>

                <button
                  type="button"
                  id="login-request-access-btn"
                  onClick={() => setIsRequestAccessOpen(true)}
                  className="group relative w-full overflow-hidden rounded-2xl p-[1.5px] transition-all duration-300 hover:scale-[1.015] active:scale-[0.99] cursor-pointer shadow-[0_4px_24px_rgba(59,130,246,0.25)] hover:shadow-[0_8px_32px_rgba(59,130,246,0.45)]"
                >
                  {/* 1. Continuous Auto-Animated Rotating Conic Gradient Border */}
                  <span
                    className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite]"
                    style={{
                      background: "conic-gradient(from 90deg at 50% 50%, #3B82F6 0%, #10B981 25%, #06B6D4 50%, #6366F1 75%, #3B82F6 100%)",
                    }}
                  />

                  {/* 2. Inner Button Container with Deep Frosted Glass */}
                  <div className="relative flex items-center justify-between gap-3 rounded-[14.5px] bg-[#0c1427]/92 px-4 py-3 backdrop-blur-xl transition-colors duration-300 group-hover:bg-[#0c1427]/80">
                    
                    {/* Continuous Auto-Sweeping Specular Shimmer Sheen */}
                    <div
                      className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmerSweep_3.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent"
                    />

                    {/* Left Icon with subtle breathing glow */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-400/40 text-blue-300 shadow-inner group-hover:scale-105 transition-transform duration-300">
                      <KeyRound className="h-4 w-4 text-cyan-300 group-hover:rotate-12 transition-transform duration-300" />
                    </div>

                    {/* Text block */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                          Request Portal Access
                        </span>
                        <Sparkles className="h-3 w-3 text-amber-400 animate-pulse shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        No account yet? Submit email for Super Admin approval
                      </p>
                    </div>

                    {/* Right Arrow CTA Badge */}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/15 text-slate-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 shadow-sm">
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>

                {/* Shimmer Keyframes */}
                <style>{`
                  @keyframes shimmerSweep {
                    0% {
                      transform: translateX(-120%);
                    }
                    35% {
                      transform: translateX(120%);
                    }
                    100% {
                      transform: translateX(120%);
                    }
                  }
                `}</style>
              </div>
            </form>
          </div>
        </div>

        {/* Request Access Clean Modal */}
        <RequestAccessModal
          isOpen={isRequestAccessOpen}
          onClose={() => setIsRequestAccessOpen(false)}
        />

        {/* Cinematic Stage Expand Transition (50% Slower) */}
        <PresentationTransition isTransitioning={isTransitioning} />

        {/* Interactive Full Presentation Deck */}
        <InteractivePresentationDeck
          isOpen={isPresentationOpen}
          onClose={() => {
            setIsPresentationOpen(false)
            setIsTransitioning(false)
          }}
          onRequestAccess={() => setIsRequestAccessOpen(true)}
        />

      </div>
    </div>
  )
}
