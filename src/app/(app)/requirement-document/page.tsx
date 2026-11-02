"use client"

import React, { useState, useMemo } from "react"
import {
  FileText,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Building2,
  ChevronRight,
  Sparkles,
  ExternalLink,
  BookOpen,
  Filter,
  ArrowUpRight,
  Copy,
  Check,
  LayoutDashboard,
  Palette,
  Type,
  FolderTree,
  IdCard,
  Monitor,
  Printer,
  MonitorPlay,
  ImageIcon,
  Car,
  Zap,
  Music2,
  Network,
  Compass,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { PORTAL_REQUIREMENTS_DATA, ModuleRequirement } from "@/lib/docs/requirement-document-data"
import { downloadWordDocument } from "@/lib/docs/word-export"

// Icon resolver helper
function getModuleIcon(iconName: string) {
  const iconMap: Record<string, any> = {
    LayoutDashboard,
    Palette,
    Type,
    FolderTree,
    FileText,
    IdCard,
    Monitor,
    Printer,
    MonitorPlay,
    ImageIcon,
    Car,
    Zap,
    Sparkles,
    Music2,
    Network,
    Compass,
    ShieldCheck,
    Building2,
  }

  const IconComponent = iconMap[iconName] || FileText
  return <IconComponent className="h-5 w-5" />
}

export default function RequirementDocumentPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [isDownloading, setIsDownloading] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const doc = PORTAL_REQUIREMENTS_DATA

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(doc.modules.map((m) => m.category))
    return ["All", ...Array.from(set)]
  }, [doc.modules])

  // Filtered modules based on search and category
  const filteredModules = useMemo(() => {
    return doc.modules.filter((m) => {
      const matchesCategory = selectedCategory === "All" || m.category === selectedCategory
      const q = searchQuery.toLowerCase().trim()
      if (!q) return matchesCategory

      const matchesSearch =
        m.title.toLowerCase().includes(q) ||
        m.route.toLowerCase().includes(q) ||
        m.requirementParagraph.toLowerCase().includes(q) ||
        m.problem.title.toLowerCase().includes(q) ||
        m.problem.description.toLowerCase().includes(q) ||
        m.solution.title.toLowerCase().includes(q) ||
        m.solution.description.toLowerCase().includes(q)

      return matchesCategory && matchesSearch
    })
  }, [doc.modules, selectedCategory, searchQuery])

  // Handler for MS Word download
  const handleDownloadWord = () => {
    setIsDownloading(true)
    try {
      downloadWordDocument(doc)
      toast.success("Requirement Document downloaded successfully!", {
        description: "Formatted Microsoft Word (.doc) specification file is ready.",
      })
    } catch (err) {
      toast.error("Failed to generate Word document")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      toast.info("Page link copied to clipboard")
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  return (
    <div
      className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 pb-28 w-full"
      style={{ fontSize: "110%" }}
    >
      {/* 1. HERO / HEADER BAR - Full Width with Left & Right Padding */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30 transition-all w-full">
        <div className="w-full px-5 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#548235] to-[#385723] text-white flex items-center justify-center shadow-md shadow-[#548235]/20 shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#548235] dark:text-[#70ad47]">
                  Transvolt Mobility Pvt. Ltd.
                </span>
                <Badge variant="outline" className="text-xs border-[#548235]/30 text-[#548235] bg-[#548235]/10">
                  {doc.version}
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                System Requirement Document (SRS & PRD)
              </h1>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyShareLink}
              className="text-xs sm:text-sm gap-1.5 h-10 px-3.5 border-zinc-300 dark:border-zinc-700"
            >
              {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              Share Link
            </Button>

            <Button
              onClick={handleDownloadWord}
              disabled={isDownloading}
              className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs sm:text-sm font-semibold h-10 px-5 shadow-sm shadow-[#548235]/20 gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloading ? "Generating Word Doc..." : "Download Requirement Document in Word"}</span>
            </Button>
          </div>
        </div>

        {/* Telemetry quick strip - Full Width */}
        <div className="border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 w-full px-5 sm:px-8 lg:px-12 xl:px-16 py-3">
          <div className="w-full flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-4 flex-wrap">
              <span>
                Document ID: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{doc.documentId}</strong>
              </span>
              <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
              <span>
                Modules Specified: <strong className="text-[#548235] font-bold">{doc.modules.length} Modules</strong>
              </span>
              <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
              <span>
                Security: <strong className="text-zinc-900 dark:text-zinc-100">Zero-Trust 10-Point RBAC</strong>
              </span>
            </div>
            <div className="text-xs text-zinc-500">
              Last Updated: {doc.lastUpdated} • Product Engineering Group
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTAINER - Full Width with Left & Right Padding */}
      <div className="w-full px-5 sm:px-8 lg:px-12 xl:px-16 pt-8 space-y-12">
        {/* EXECUTIVE OVERVIEW CARD (Big Paragraph & Key Points) */}
        <section className="relative overflow-hidden rounded-2xl border-2 border-[#548235]/30 bg-white dark:bg-zinc-900 shadow-sm p-7 sm:p-10 space-y-7">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#548235]/10 via-[#548235]/5 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex items-center gap-2.5">
            <Badge className="bg-[#548235] text-white text-xs px-3 py-0.5">Section 01</Badge>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-500">
              Enterprise Specification
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Complete Portal Requirement Overview
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Unified Digital Brand Operating System & Multi-Site Governance Platform
            </p>
          </div>

          {/* Big Paragraph */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-50/50 via-zinc-50 to-zinc-50 dark:from-emerald-950/20 dark:via-zinc-850/50 dark:to-zinc-900 border border-emerald-100 dark:border-emerald-900/30">
            <p className="text-base sm:text-lg text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal text-justify">
              {doc.executiveSummaryParagraph}
            </p>
          </div>

          {/* Key Requirement Points */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#548235]" />
              Core System Capabilities & Governance Objectives:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs sm:text-sm">
              {doc.executiveSummaryPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 flex items-start gap-3 transition-colors hover:border-[#548235]/40"
                >
                  <div className="h-6 w-6 rounded-full bg-[#548235]/15 text-[#548235] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    {idx + 1}
                  </div>
                  <span className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Architectural Pillars */}
          <div className="pt-5 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#548235]" />
              Architectural Pillars:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
              {doc.architecturalPillars.map((pillar, pIdx) => (
                <div
                  key={pIdx}
                  className="p-4 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-2"
                >
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm text-[#548235]">
                    {pillar.title}
                  </h4>
                  <p className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. SEARCH & CATEGORY FILTER TOOLBAR */}
        <div className="space-y-4 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-[#548235] text-white text-xs px-3 py-0.5">Section 02</Badge>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-500">
                  Detailed Module Specifications
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                Module-by-Module Requirements with Problem & Solution
              </h2>
            </div>

            {/* Quick search input */}
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search modules, problems, solutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-xs sm:text-sm h-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-lg"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs sm:text-sm">
            <span className="text-xs font-semibold text-zinc-400 mr-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#548235] text-white shadow-xs font-semibold"
                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                {cat}
                {cat === "All" && ` (${doc.modules.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* 4. MODULE CARDS CONTAINER - Full Width */}
        <div className="space-y-9 w-full">
          {filteredModules.length === 0 ? (
            <div className="p-14 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
              <Search className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
                No matching requirements found
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Try searching with different terms or selecting "All" categories.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("All")
                }}
                className="mt-5 text-xs sm:text-sm"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            filteredModules.map((module, idx) => (
              <article
                key={module.id}
                id={module.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden transition-all hover:border-zinc-300 dark:hover:border-zinc-700 w-full"
              >
                {/* Module Header Bar */}
                <div className="p-6 sm:p-7 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-zinc-50/70 via-white to-white dark:from-zinc-850 dark:via-zinc-900 dark:to-zinc-900 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#548235]/15 text-[#548235] dark:text-[#70ad47] flex items-center justify-center font-bold shrink-0">
                      {getModuleIcon(module.iconName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {module.route}
                        </span>
                        <Badge variant="outline" className="text-xs border-zinc-300 dark:border-zinc-700">
                          {module.category}
                        </Badge>
                        <Badge
                          className={
                            module.badge === "Hold"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold text-xs"
                              : "bg-[#548235] text-white text-xs"
                          }
                        >
                          {module.badge}
                        </Badge>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1.5">
                        {idx + 1}. {module.title}
                      </h3>
                    </div>
                  </div>

                  {/* Route Jump link */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.open(module.route, "_blank")
                      }
                    }}
                    className="text-xs sm:text-sm gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 h-9"
                  >
                    Open Page <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Module Content Body */}
                <div className="p-6 sm:p-8 space-y-7">
                  {/* Part 1: Requirements Overview Paragraph */}
                  <div className="space-y-3.5">
                    <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#548235]" />
                      1. Module Requirement Overview
                    </h4>
                    <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed text-justify">
                      {module.requirementParagraph}
                    </p>

                    {/* Requirement Points */}
                    <div className="pt-2 space-y-2">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                        Detailed Functional Specifications:
                      </span>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                        {module.requirementPoints.map((rp, rIdx) => (
                          <li
                            key={rIdx}
                            className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5"
                          >
                            <span className="text-[#548235] font-bold shrink-0">•</span>
                            <span className="leading-snug">{rp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Part 2: Problem Callout Box */}
                  <div className="p-5 sm:p-6 rounded-xl border-l-4 border-l-rose-500 border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 space-y-3.5">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      <h5 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-rose-900 dark:text-rose-300">
                        Operational Problem: {module.problem.title}
                      </h5>
                    </div>
                    <p className="text-xs sm:text-sm text-rose-900/90 dark:text-rose-200 leading-relaxed">
                      {module.problem.description}
                    </p>
                    <div className="pt-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 block mb-1.5">
                        Operational & Business Consequences:
                      </span>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-rose-800 dark:text-rose-300">
                        {module.problem.impactPoints.map((ip, ipIdx) => (
                          <li key={ipIdx} className="flex items-start gap-2">
                            <span className="text-rose-500 font-bold shrink-0">✕</span>
                            <span>{ip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Part 3: Solution Callout Box */}
                  <div className="p-5 sm:p-6 rounded-xl border-l-4 border-l-emerald-600 border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3.5">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <h5 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                        Engineered Solution: {module.solution.title}
                      </h5>
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-900/90 dark:text-emerald-200 leading-relaxed">
                      {module.solution.description}
                    </p>
                    <div className="pt-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1.5">
                        Engineered Capabilities in Portal V4:
                      </span>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
                        {module.solution.keyFeatures.map((kf, kfIdx) => (
                          <li key={kfIdx} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                            <span>{kf}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* 5. FOOTER DOWNLOAD CALLOUT BANNER - Full Width */}
        <div className="rounded-2xl p-7 sm:p-10 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-zinc-700 w-full">
          <div className="space-y-2.5 text-center md:text-left">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#70ad47]">
              Complete Official Specification Document
            </span>
            <h3 className="text-xl sm:text-2xl font-bold">
              Download Full Transvolt Branding Portal V4 Requirement Document
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Includes comprehensive system architecture, active module requirements, complete operational problem & solution analysis, zero-trust RBAC specifications, and SLA commitments in Microsoft Word format.
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleDownloadWord}
            disabled={isDownloading}
            className="bg-[#548235] hover:bg-[#466e2c] text-white font-bold text-xs sm:text-sm h-12 px-7 shadow-lg shadow-[#548235]/30 gap-2 shrink-0 cursor-pointer"
          >
            <Download className="h-5 w-5" />
            {isDownloading ? "Generating Word Document..." : "Download Requirement Document in Word"}
          </Button>
        </div>
      </div>
    </div>
  )
}
