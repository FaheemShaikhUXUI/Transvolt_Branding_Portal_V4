"use client"

import * as React from "react"
import { X, Play, Download, Sparkles, ShieldCheck, Layers, FileText, CheckCircle2, ArrowRight, Zap, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PresentationModalProps {
  isOpen: boolean
  onClose: () => void
  onRequestAccess?: () => void
}

export function PresentationModal({ isOpen, onClose, onRequestAccess }: PresentationModalProps) {
  // Close on Escape
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleDownloadDeck = () => {
    const link = document.createElement("a")
    link.href = "/Transvolt_Brand_Management_Portal.pptx"
    link.download = "Transvolt_Brand_Management_Portal.pptx"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const benefits = [
    {
      icon: <Zap className="h-4 w-4 text-emerald-400" />,
      title: "Single Source of Truth",
      desc: "All official logos, brand colors, typography, and stationery assets kept perfectly up to date in one central place."
    },
    {
      icon: <Layers className="h-4 w-4 text-blue-400" />,
      title: "Multi-Format Lossless Vault",
      desc: "One-click downloads for transparent PNG, vector SVG, JPG, PDF, Word templates, CDR, and PowerPoint presentations."
    },
    {
      icon: <ShieldCheck className="h-4 w-4 text-cyan-400" />,
      title: "Fleet & Charger Standardization",
      desc: "Dedicated specifications and templates for commercial vehicle wraps, charging station branding, and site layouts."
    },
    {
      icon: <CheckCircle2 className="h-4 w-4 text-indigo-400" />,
      title: "Role-Based Governance",
      desc: "Enterprise access control with multi-tier permissions, download tracking, hold/release toggles, and admin reviews."
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[24px] border border-white/20 bg-[#0a101d]/95 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-left space-y-6"
        style={{
          boxShadow: "0 25px 60px -15px rgba(16, 185, 129, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2)"
        }}
      >
        {/* Apple specular accent line */}
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Badge & Title */}
        <div className="space-y-2 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-400/30">
            <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
            Official Portal Overview
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Transvolt Brand Portal Overview & Benefits
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The Transvolt Branding Portal provides a unified, enterprise-grade brand management platform designed to maintain consistent visual identity across all operations, fleets, and collateral.
          </p>
        </div>

        {/* Interactive Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {benefits.map((b, i) => (
            <div 
              key={i} 
              className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  {b.icon}
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-white">
                  {b.title}
                </h4>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Featured Presentation Deck Box */}
        <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-blue-500/10 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-[#D24726]/20 border border-[#D24726]/40 flex items-center justify-center shrink-0 shadow-md">
                <FileText className="h-6 w-6 text-[#F26522]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  Brand Management Presentation Deck
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">.pptx</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Official deck outlining portal architecture, asset workflows, and executive benefits.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleDownloadDeck}
              className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs h-10 px-4 rounded-xl gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Download Deck (.pptx)
            </Button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
          <span className="text-[11px] text-slate-400 text-center sm:text-left">
            Ready to explore? Sign in or request portal access.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onRequestAccess && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose()
                  onRequestAccess()
                }}
                className="flex-1 sm:flex-none border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white text-xs h-9 px-3.5 rounded-xl cursor-pointer"
              >
                Request Access
              </Button>
            )}
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white text-xs h-9 px-4 rounded-xl cursor-pointer"
            >
              Got it, thanks!
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
