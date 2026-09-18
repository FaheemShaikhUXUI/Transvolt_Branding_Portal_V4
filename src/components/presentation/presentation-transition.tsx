"use client"

import * as React from "react"
import { createPortal } from "react-dom"

interface PresentationTransitionProps {
  isTransitioning: boolean
}

export function PresentationTransition({ isTransitioning }: PresentationTransitionProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!isTransitioning || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999999] pointer-events-none flex items-center justify-center overflow-hidden select-none">
      {/* 1. Cinema Dark Auditorium Backdrop */}
      <div className="absolute inset-0 bg-[#080a0f]/96 backdrop-blur-2xl animate-stage-backdrop-slow" />

      {/* 2. Top & Bottom Cinematic Shutter Blades that slowly glide outward */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-black border-b border-emerald-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-shutter-top-slow" />
      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-black border-t border-cyan-500/40 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] animate-shutter-bottom-slow" />

      {/* 3. Glowing Horizontal Stage Horizon Laser Line */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_30px_rgba(16,185,129,0.9)] animate-stage-horizon-slow" />

      {/* 4. The 3D Keynote Slide 0 Expanding Canvas */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center p-8 sm:p-10 max-w-4xl w-full mx-4 rounded-3xl bg-[#101218] border border-white/15 shadow-[0_30px_100px_rgba(0,0,0,0.85),0_0_70px_rgba(16,185,129,0.25)] animate-slide-canvas-expand-slow">
        {/* Soft Ambient Light inside Slide */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Transvolt Logo */}
        <div className="mb-4 pt-2 flex items-center justify-center animate-slide-logo-slow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/Logo_White.svg"
            alt="Transvolt Logo"
            className="h-11 sm:h-13 w-auto object-contain drop-shadow-[0_2px_14px_rgba(255,255,255,0.25)]"
          />
        </div>

        {/* Keynote Cover Title */}
        <h1
          className="text-2xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text animate-slide-title-slow"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #22C55E 0%, #10B981 30%, #06B6D4 70%, #3B82F6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 4px 24px rgba(34, 197, 94, 0.35))",
          }}
        >
          BRAND MANAGEMENT PORTAL
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-300 font-medium tracking-wide mt-3 max-w-xl mx-auto animate-slide-subtitle-slow">
          One Platform. One Trusted Source for Transvolt Branding.
        </p>

        {/* Status Indicator */}
        <div className="mt-7 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-semibold animate-slide-badge-slow">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Launching Interactive Deck • Page 1</span>
        </div>
      </div>

      {/* 50% Slower Keyframes (Graceful & Luxurious Cinema Easing) */}
      <style>{`
        @keyframes stageBackdropFadeSlow {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-stage-backdrop-slow {
          animation: stageBackdropFadeSlow 0.75s ease-out forwards;
        }

        @keyframes shutterTopGlideSlow {
          0% { transform: translateY(0%); }
          32% { transform: translateY(0%); }
          100% { transform: translateY(-100%); }
        }
        .animate-shutter-top-slow {
          animation: shutterTopGlideSlow 1.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes shutterBottomGlideSlow {
          0% { transform: translateY(0%); }
          32% { transform: translateY(0%); }
          100% { transform: translateY(100%); }
        }
        .animate-shutter-bottom-slow {
          animation: shutterBottomGlideSlow 1.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes stageHorizonBeamSlow {
          0% { transform: translateY(-50%) scaleX(0); opacity: 0; }
          25% { transform: translateY(-50%) scaleX(1); opacity: 1; }
          75% { transform: translateY(-50%) scaleX(1.15); opacity: 0.8; }
          100% { transform: translateY(-50%) scaleX(1.4); opacity: 0; }
        }
        .animate-stage-horizon-slow {
          animation: stageHorizonBeamSlow 1.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes slideCanvasExpandSlow {
          0% {
            opacity: 0;
            transform: scale(0.72) translateY(36px) perspective(1200px) rotateX(8deg);
            filter: blur(12px);
          }
          38% {
            opacity: 1;
            filter: blur(0px);
          }
          100% {
            opacity: 1;
            transform: scale(1.02) translateY(0) perspective(1200px) rotateX(0deg);
            filter: blur(0px);
          }
        }
        .animate-slide-canvas-expand-slow {
          animation: slideCanvasExpandSlow 1.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideLogoRevealSlow {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-slide-logo-slow {
          animation: slideLogoRevealSlow 1.05s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }

        @keyframes slideTitleRevealSlow {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-title-slow {
          animation: slideTitleRevealSlow 1.15s cubic-bezier(0.16, 1, 0.3, 1) 0.48s both;
        }

        @keyframes slideSubtitleRevealSlow {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-subtitle-slow {
          animation: slideSubtitleRevealSlow 1.15s cubic-bezier(0.16, 1, 0.3, 1) 0.66s both;
        }

        @keyframes slideBadgeRevealSlow {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-slide-badge-slow {
          animation: slideBadgeRevealSlow 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.84s both;
        }
      `}</style>
    </div>,
    document.body
  )
}
