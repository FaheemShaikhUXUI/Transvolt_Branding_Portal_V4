"use client"

import * as React from "react"
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
  MonitorPlay,
  Share2,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Star,
  BarChart3,
  Lock,
  LayoutDashboard,
  Database,
  Check,
  Network,
  Bell,
  Sliders,
  ChevronDown,
  RotateCcw,
  ExternalLink,
  Laptop
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  handleDownloadDeck: () => void
}

export function InteractivePresentationDeck({
  isOpen,
  onClose,
  onRequestAccess
}: InteractivePresentationDeckProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [showThumbnails, setShowThumbnails] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const handleDownloadDeck = () => {
    const link = document.createElement("a")
    link.href = "/Transvolt_Brand_Management_Portal.pptx"
    link.download = "Transvolt_Brand_Management_Portal.pptx"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const slides: SlideData[] = [
    // -------------------------------------------------------------
    // SLIDE 0: COVER / HOME SLIDE
    // -------------------------------------------------------------
    {
      id: 0,
      category: "Welcome",
      title: "TRANSVOLT BRAND MANAGEMENT PORTAL",
      subtitle: "One Platform. One Trusted Source for Transvolt Branding.",
      render: ({ onNext, handleDownloadDeck }) => (
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto py-8 sm:py-12 space-y-8 animate-in fade-in zoom-in-95 duration-500">
          {/* Logo Badge & Official Header */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-bold tracking-wide backdrop-blur-md shadow-lg shadow-emerald-500/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Official Corporate Presentation &amp; Architecture Overview
          </div>

          {/* Main Logo Brand Title */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                TRANSVOLT
              </span>
              <div className="flex items-center text-2xl sm:text-4xl lg:text-5xl font-black">
                <span className="text-emerald-400">❯</span>
                <span className="text-blue-500 -ml-1 sm:-ml-2">❯</span>
              </div>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-200 to-blue-400 tracking-tight">
              BRAND MANAGEMENT PORTAL
            </h1>

            <p className="text-base sm:text-xl font-medium text-slate-200 tracking-wide max-w-2xl mx-auto">
              One Platform. One Trusted Source for Transvolt Branding.
            </p>
          </div>

          {/* Description Lead */}
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed mx-auto">
            A centralized enterprise platform to manage, access, verify, generate, share, and control Transvolt&apos;s approved brand assets, corporate information, and multi-location branding resources.
          </p>

          {/* Feature Highlight Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl pt-2">
            {[
              { icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />, title: "Single Source of Truth" },
              { icon: <Zap className="h-4 w-4 text-cyan-400" />, title: "Lossless Formats Vault" },
              { icon: <Truck className="h-4 w-4 text-blue-400" />, title: "Fleet & Charger Standards" },
              { icon: <Lock className="h-4 w-4 text-indigo-400" />, title: "Role-Based Governance" }
            ].map((pill, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm flex flex-col items-center justify-center gap-2 hover:border-emerald-400/40 hover:bg-white/[0.08] transition-all"
              >
                <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  {pill.icon}
                </div>
                <span className="text-xs font-semibold text-slate-200 text-center">
                  {pill.title}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full">
            <Button
              type="button"
              onClick={onNext}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <span>Explore Presentation</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadDeck}
              className="w-full sm:w-auto h-12 px-6 rounded-xl border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              <span>Download PPT Deck (.pptx)</span>
            </Button>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 1: WHY THIS PORTAL?
    // -------------------------------------------------------------
    {
      id: 1,
      category: "01 — Why This Portal?",
      title: "Solving Real Branding & Operational Challenges",
      subtitle: "Managing approved brand assets across multiple companies, sites, and partners.",
      render: () => (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/20 text-slate-300 text-xs sm:text-sm leading-relaxed">
            As Transvolt operates across multiple states, companies, sites, projects, OEMs, stakeholders, employees, and vendors, managing the right branding information and approved assets becomes increasingly complex. The portal solves these practical challenges through <strong>one controlled and trusted platform</strong>.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[
              {
                num: "01",
                title: "Controlled Access for Everyone",
                desc: "Super Admin grants in-house employees & external stakeholders specific rights: View, Download, Share, Create, Edit, or Manage.",
                icon: <Lock className="h-5 w-5 text-emerald-400" />
              },
              {
                num: "02",
                title: "Employee ID & Business Cards",
                desc: "Maintained site-wise. Instant generation of official ID Cards and Business Cards with controlled link sharing.",
                icon: <IdCard className="h-5 w-5 text-cyan-400" />
              },
              {
                num: "03",
                title: "Organization Structure",
                desc: "Maintain site-wise hierarchy, auto-arranged interactive organizational charts, and team reporting lines.",
                icon: <Network className="h-5 w-5 text-blue-400" />
              },
              {
                num: "04",
                title: "Instant 6-Hr Vendor Logo Links",
                desc: "Generates time-limited 6-hour links with approved SVG, PNG, CDR, and exact color codes. No manual email chains.",
                icon: <Clock className="h-5 w-5 text-amber-400" />
              },
              {
                num: "05",
                title: "Multi-Firm Letterhead Hub",
                desc: "Correct letterheads for each Transvolt legal entity in one place, helping teams & Legal avoid confusion.",
                icon: <FileText className="h-5 w-5 text-indigo-400" />
              },
              {
                num: "06",
                title: "Vehicle & Charger Wrap Control",
                desc: "Store approved artwork for each specific OEM, vehicle model & charger dimension before sending to vendors.",
                icon: <Truck className="h-5 w-5 text-emerald-400" />
              }
            ].map((card, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-emerald-400/30 transition-all flex flex-col gap-2 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    {card.icon}
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase">
                    {card.num}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Core Solution Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 border border-emerald-400/40 text-center">
            <p className="text-xs sm:text-sm font-bold text-white">
              The Core Solution: &ldquo;One trusted platform to find the right information, verify the right asset, give the right access, and share the right file.&rdquo;
            </p>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 2: WHAT IS THE BRAND PORTAL?
    // -------------------------------------------------------------
    {
      id: 2,
      category: "02 — What is the Portal?",
      title: "The Single Source of Truth for Transvolt",
      subtitle: "A unified enterprise platform bringing together all brand, legal, and operational assets.",
      render: () => (
        <div className="space-y-6 max-w-5xl mx-auto">
          <p className="text-sm text-slate-300 leading-relaxed text-center max-w-3xl mx-auto">
            The portal acts as the <strong>Single Source of Truth</strong> for Transvolt&apos;s branding ecosystem, bringing every corporate department, site, and external agency into complete alignment.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { title: "Brand Identity & Guidelines", desc: "Official logos, spacing, primary & secondary palettes.", icon: <Palette className="h-5 w-5 text-emerald-400" /> },
              { title: "Corporate Documents", desc: "Verified multi-entity letterheads & official Word templates.", icon: <FileText className="h-5 w-5 text-cyan-400" /> },
              { title: "Employee Identity Data", desc: "Site-wise employee rosters & automated ID card generator.", icon: <IdCard className="h-5 w-5 text-blue-400" /> },
              { title: "Digital & Print Assets", desc: "Social media, emailers, brochures, and event collateral.", icon: <Layers className="h-5 w-5 text-indigo-400" /> },
              { title: "Graphics & Creative Vault", desc: "Greetings, invitations, festival graphics & passes.", icon: <Sparkles className="h-5 w-5 text-amber-400" /> },
              { title: "Photos & Visual Archives", desc: "Milestones, deployments, sites & employee celebrations.", icon: <ImageIcon className="h-5 w-5 text-pink-400" /> },
              { title: "Vehicle & Charger Branding", desc: "OEM-specific body wraps and charging depot specifications.", icon: <Truck className="h-5 w-5 text-emerald-400" /> },
              { title: "Organization Structures", desc: "Interactive site-wise reporting charts & leadership nodes.", icon: <Network className="h-5 w-5 text-cyan-400" /> },
              { title: "Controlled Sharing & Access", desc: "6-Hour secure link generator & role-based permissions.", icon: <Lock className="h-5 w-5 text-blue-400" /> }
            ].map((pillar, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-cyan-400/40 transition-all flex items-start gap-3"
              >
                <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  {pillar.icon}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">{pillar.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/15 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-1">Core Principle</span>
            <span className="text-base sm:text-lg font-extrabold text-white">
              Find it. Verify it. Use it. Share it. — All in One Place.
            </span>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 3: DASHBOARD
    // -------------------------------------------------------------
    {
      id: 3,
      category: "03 — Dashboard",
      title: "Brand Management at a Glance",
      subtitle: "Instant overview of brand assets, notifications, and frequently used resources.",
      render: () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center max-w-5xl mx-auto">
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-bold">
              <LayoutDashboard className="h-3.5 w-3.5" /> Central Command
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Executive Clarity, Zero Searching
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              The Dashboard gives team members and leadership a birds-eye overview of the brand ecosystem. It highlights recently added materials, pending actions, and high-frequency shortcuts.
            </p>

            <div className="space-y-2 pt-2">
              {[
                "Instant search across all 11+ brand categories",
                "Real-time notifications for updates and approvals",
                "Quick-access shortcuts to frequently downloaded files",
                "Status indicators (Active, Hold, Draft, Reviewed)"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-xs text-emerald-300 font-semibold mt-4">
              Key Benefit: Less searching. Faster access. Better visibility.
            </div>
          </div>

          <div className="lg:col-span-6 p-5 rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-xs font-mono text-slate-400 ml-2">Dashboard Preview</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">Live Hub</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Assets</span>
                <p className="text-xl font-bold text-white mt-1">240+ Files</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Active Categories</span>
                <p className="text-xl font-bold text-emerald-400 mt-1">11 Hubs</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Recent System Activity</span>
              {[
                { name: "Official Basic Logo (Full White)", format: "PNG / SVG", time: "Just now" },
                { name: "Fleet Wrap Tata Ultra 9m", format: "CDR / PDF", time: "2 hours ago" },
                { name: "Transvolt Mobility Letterhead", format: "WORD / PDF", time: "Yesterday" }
              ].map((row, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-white truncate max-w-[180px]">{row.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-cyan-300 font-mono">{row.format}</span>
                    <span className="text-[10px] text-slate-500">{row.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 4: LOGO & COLOR
    // -------------------------------------------------------------
    {
      id: 4,
      category: "04 — Logo & Color",
      title: "One Official Source for Brand Identity",
      subtitle: "Multi-format vector and transparent logos with precise color standards.",
      render: () => (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-white/10 bg-[#e7e8ea] text-neutral-900 flex flex-col items-center justify-center min-h-[140px] text-center shadow-sm">
              <span className="text-2xl font-black tracking-tight text-black">TRANSVOLT</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1">Logo Black (Transparent)</span>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-[#1e293b] text-white flex flex-col items-center justify-center min-h-[140px] text-center shadow-sm">
              <div className="flex items-center text-2xl font-black">
                <span>TRANSVOLT</span>
                <span className="text-emerald-400 ml-1">❯</span>
                <span className="text-blue-500">❯</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Logo White with Green &amp; Blue</span>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-[#0f172a] text-white flex flex-col items-center justify-center min-h-[140px] text-center shadow-sm">
              <div className="flex items-center text-2xl font-black text-white">
                <span>TRANSVOLT</span>
                <span className="text-white ml-1">❯❯</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Logo Full White</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "PNG", sub: "Transparent Lossless", bg: "bg-blue-500/20 text-blue-300 border-blue-400/30" },
              { label: "SVG", sub: "Vector Scale-Free", bg: "bg-purple-500/20 text-purple-300 border-purple-400/30" },
              { label: "CDR", sub: "CorelDraw Production", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" },
              { label: "PDF", sub: "Vector Print Ready", bg: "bg-red-500/20 text-red-300 border-red-400/30" }
            ].map((fmt, i) => (
              <div key={i} className={cn("p-3 rounded-xl border flex flex-col items-center justify-center text-center", fmt.bg)}>
                <span className="text-base font-extrabold">{fmt.label}</span>
                <span className="text-[10px] opacity-80 mt-0.5">{fmt.sub}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-emerald-900/30 border border-blue-400/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <h4 className="text-sm font-bold text-white">One Approved Source → One Correct Version → One Controlled Share</h4>
              <p className="text-xs text-slate-300 mt-0.5">Vendors and agencies receive direct 6-hour links with exact color codes and vector formats.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold shrink-0">
              Zero Guesswork
            </span>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 5: TYPOGRAPHY
    // -------------------------------------------------------------
    {
      id: 5,
      category: "05 — Typography",
      title: "Consistent Brand Communication",
      subtitle: "Official typefaces and hierarchical guidelines for digital and corporate correspondence.",
      render: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto items-stretch">
          <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-1 rounded-full">
                Primary Brand Typeface
              </span>
              <h3 className="text-3xl font-extrabold text-white mt-3 font-sans">Poppins</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Used for all brand, digital, marketing, web platforms, and visual communication. Clean, geometric, modern, and highly legible across screens and physical signage.
              </p>
            </div>

            <div className="space-y-2 border-t border-white/10 pt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-light text-slate-400">Poppins Light (300)</span>
                <span className="text-slate-300 font-light">Subtle captions</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-normal text-slate-300">Poppins Regular (400)</span>
                <span className="text-slate-200">Body text</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-emerald-300">Poppins SemiBold (600)</span>
                <span className="text-emerald-300 font-semibold">Subheadings</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">Poppins Bold (700)</span>
                <span className="text-white font-bold">Hero titles</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-blue-500/30 bg-blue-500/[0.04] flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/15 border border-blue-400/30 px-2.5 py-1 rounded-full">
                Corporate &amp; Business Documents
              </span>
              <h3 className="text-3xl font-extrabold text-white mt-3 font-sans">Calibri</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Standard typeface for formal business correspondence, legal contracts, executive memos, spreadsheets, and official documentation across all Transvolt entities.
              </p>
            </div>

            <div className="space-y-2 border-t border-white/10 pt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-normal text-slate-300">Calibri Regular (11pt / 12pt)</span>
                <span className="text-slate-200">Formal letterhead body</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="italic text-slate-300">Calibri Italic</span>
                <span className="text-slate-300 italic">Legal disclaimers</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">Calibri Bold</span>
                <span className="text-white font-bold">Section headers</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 6: BRAND PHILOSOPHY
    // -------------------------------------------------------------
    {
      id: 6,
      category: "06 — Brand Philosophy",
      title: "Understanding What Transvolt Represents",
      subtitle: "The purpose, vision, values, and symbolism powering clean mobility.",
      render: () => (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "Zero-Emission Mobility", desc: "Leading the transition to electric transit with zero direct tailpipe emissions.", icon: <Zap className="h-5 w-5 text-emerald-400" /> },
              { title: "Continuous Progress", desc: "Constant technological evolution, fleet intelligence, and operational efficiency.", icon: <ArrowRight className="h-5 w-5 text-cyan-400" /> },
              { title: "Future Energy Vision", desc: "Integrating smart charging networks with renewable energy infrastructure.", icon: <BatteryCharging className="h-5 w-5 text-blue-400" /> }
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/[0.03] text-left space-y-2">
                <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  {item.icon}
                </div>
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl border border-white/15 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-blue-950/40 space-y-4 text-left">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" /> The Meaning Behind the Dual Arrows
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-start gap-3">
                <span className="text-2xl font-black text-emerald-400">❯</span>
                <div>
                  <h5 className="text-xs font-bold text-emerald-300 uppercase">Green Arrow: Sustainability</h5>
                  <p className="text-xs text-slate-300 mt-1">Represents nature, ecological preservation, carbon reduction, and renewable energy adoption.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/30 flex items-start gap-3">
                <span className="text-2xl font-black text-blue-400">❯</span>
                <div>
                  <h5 className="text-xs font-bold text-blue-300 uppercase">Blue Arrow: Technology &amp; Velocity</h5>
                  <p className="text-xs text-slate-300 mt-1">Represents electric power, engineering excellence, rapid acceleration, and forward momentum.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 7: LETTERHEAD
    // -------------------------------------------------------------
    {
      id: 7,
      category: "07 — Letterhead",
      title: "Solving Multi-Company Letterhead Management",
      subtitle: "Correct corporate information and legal stationery for every Transvolt firm.",
      render: () => (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { title: "Select Required Entity", desc: "Choose specific company name, subsidiary, or regional SPV.", icon: <Building className="h-5 w-5 text-emerald-400" /> },
              { title: "Verify Legal Details", desc: "Corporate CIN, registered address, GST, and signatory block.", icon: <ShieldCheck className="h-5 w-5 text-cyan-400" /> },
              { title: "Download Approved Pack", desc: "Instant download of Header JPG, Footer JPG, and Word (.docx).", icon: <Download className="h-5 w-5 text-blue-400" /> }
            ].map((step, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/[0.03] text-left">
                <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                  {step.icon}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white">{step.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl border border-white/15 bg-white/[0.02] text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Problem Solved: Before vs. Portal</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">100% Legal Compliance</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 space-y-1">
                <span className="font-bold block">❌ Previous Manual Risk</span>
                <p>Teams relied on old email attachments, resulting in wrong CIN numbers, outdated registered addresses, or wrong entity letterheads being sent to banks and authorities.</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 space-y-1">
                <span className="font-bold block">✔ Centralized Single Source</span>
                <p>One-click access to the verified legal letterhead for every registered entity. Eliminates dependency on the legal team for routine requests.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 8: ID CARDS & BUSINESS CARDS
    // -------------------------------------------------------------
    {
      id: 8,
      category: "08 — ID & Business Cards",
      title: "Employee Information + Automated Identity Generation",
      subtitle: "Site-wise employee rosters with instant card production and controlled sharing.",
      render: () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center max-w-5xl mx-auto text-left">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/15 border border-cyan-400/30 px-2.5 py-1 rounded-full">
              Automated Identity Engine
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Site-Wise Employee Management &amp; Instant Output
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Maintains full employee records site-by-site across regional depots and Head Office. Eliminates manual graphic design work by generating approved ID Cards and Business Cards directly from portal data.
            </p>

            <div className="space-y-2 pt-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Site-wise employee records with blood group, designation &amp; ID</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Front &amp; Back ID card generation with official barcodes</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> High-resolution Business Cards with QR contact codes</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" /> Controlled links to share print-ready files with printers</div>
            </div>
          </div>

          <div className="lg:col-span-6 p-5 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-white">Official Identity Template</span>
              <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">Site: Mumbai Depot</span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shrink-0">
                <Users className="h-8 w-8 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-bold text-white block">Faheem Shaikh</span>
                <span className="text-xs text-emerald-400 font-semibold block">Super Admin &amp; Lead UI/UX</span>
                <span className="text-[11px] text-slate-400 block font-mono">EMP-TV-0042 • Blood Group: O+</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200">
                <span className="text-[10px] text-slate-400 block">Output Format</span>
                Print-Ready PDF
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200">
                <span className="text-[10px] text-slate-400 block">Sharing Mode</span>
                6-Hr Timed Link
              </div>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 9: PRESENTATION
    // -------------------------------------------------------------
    {
      id: 9,
      category: "09 — Presentation",
      title: "Ready-to-Use Corporate Presentation System",
      subtitle: "Standardized 16:9 master PowerPoint templates and slide layouts.",
      render: ({ handleDownloadDeck }) => (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "Official 16:9 Deck", desc: "Built with widescreen proportions for modern projectors, monitors, and laptops.", icon: <Laptop className="h-5 w-5 text-emerald-400" /> },
              { title: "Master Slide Layouts", desc: "Title slides, project milestones, metrics grids, team rosters, and charts.", icon: <Sliders className="h-5 w-5 text-cyan-400" /> },
              { title: "Pre-Configured Fonts", desc: "Poppins headings and clean contrast palettes built directly into master styles.", icon: <Type className="h-5 w-5 text-blue-400" /> }
            ].map((card, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/[0.03] text-left">
                <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                  {card.icon}
                </div>
                <h4 className="text-sm font-bold text-white">{card.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl border border-white/15 bg-gradient-to-r from-slate-900 to-[#0c1427] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h4 className="text-base font-bold text-white">Transvolt Brand Management Portal Presentation (.pptx)</h4>
              <p className="text-xs text-slate-400 mt-1">Download the official master template to assemble pitches and executive reviews.</p>
            </div>
            <Button
              type="button"
              onClick={handleDownloadDeck}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs h-10 px-5 rounded-xl gap-2 shadow-lg shadow-emerald-500/20 shrink-0 cursor-pointer"
            >
              <Download className="h-4 w-4" /> Download Official PPTX
            </Button>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 10: DIGITAL ASSETS
    // -------------------------------------------------------------
    {
      id: 10,
      category: "10 — Digital Assets",
      title: "Approved Digital Communication",
      subtitle: "Fast access to verified digital marketing materials across all social & online channels.",
      render: () => (
        <div className="space-y-6 max-w-5xl mx-auto">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-center max-w-3xl mx-auto">
            Centralized collection of digital creatives ensuring every department, agency, and regional office communicates with approved graphics and consistent brand standards.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              "Social Media Creatives",
              "Official Emailers",
              "Digital Campaigns",
              "Web & App Graphics",
              "Event Creatives",
              "Corporate Announcements",
              "Recruitment Ads",
              "Digital Web Banners"
            ].map((item, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-emerald-400/40 transition-all text-center flex flex-col items-center justify-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">{item}</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-400/20 text-center text-xs text-blue-300 font-semibold">
            Benefit: Enables rapid go-to-market communication while preserving strict brand consistency online.
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 11: PRINT ASSETS
    // -------------------------------------------------------------
    {
      id: 11,
      category: "11 — Print Assets",
      title: "Production-Ready Brand Materials",
      subtitle: "CMYK high-resolution print files designed to prevent press rework.",
      render: () => (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              "Brochures & Booklets",
              "Product Flyers",
              "Depot & Site Posters",
              "Standees & Banners",
              "Corporate Stationery",
              "Employee Certificates",
              "Wayfinding Signage",
              "Marketing Collateral",
              "High-Res Print Templates"
            ].map((item, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-cyan-400/40 transition-all flex items-center gap-3 text-left">
                <div className="h-7 w-7 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-cyan-400" />
                </div>
                <span className="text-xs font-semibold text-white">{item}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-center text-xs text-emerald-300">
            <strong>Production Guarantee:</strong> Correct vector artwork, bleed lines, and colour codes reach print vendors, reducing costly reprints and production delays.
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 12: GRAPHICS LIBRARY
    // -------------------------------------------------------------
    {
      id: 12,
      category: "12 — Graphics Library",
      title: "A Central Home for Supporting Graphics",
      subtitle: "Flexible asset repository for reusable festive, HR, and special event creative items.",
      render: () => (
        <div className="space-y-6 max-w-5xl mx-auto text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Included Categories</span>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Festival Greetings</div>
                <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Event Passes</div>
                <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Official Invitations</div>
                <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> HR Creatives</div>
                <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Employee Awards</div>
                <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Special Campaigns</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Vault Capabilities</span>
              <div className="space-y-1.5 text-xs text-slate-300">
                <p>• Category-based folder organisation</p>
                <p>• Multi-format uploads (PNG, SVG, JPG, PDF, CDR)</p>
                <p>• Upload timestamp and uploader attribution</p>
                <p>• 1-Click Replace, Delete, and Hold toggles</p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-slate-300">
            Keeps frequently requested assets organised in one place instead of scattered across personal hard drives and WhatsApp threads.
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 13: PHOTO REPOSITORY
    // -------------------------------------------------------------
    {
      id: 13,
      category: "13 — Photo Repository",
      title: "Transvolt's Visual Archive",
      subtitle: "Curated, high-resolution media gallery organized by operations and milestones.",
      render: () => (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { name: "Vehicle Deployments", tag: "Fleet in action" },
              { name: "Charging Infrastructure", tag: "Depots & Hubs" },
              { name: "Corporate Events", tag: "Town halls & AGMs" },
              { name: "Site Visits", tag: "Client walkthroughs" },
              { name: "Employee Activities", tag: "Team building" },
              { name: "Training & Safety", tag: "Driver workshops" },
              { name: "Awards & Recognitions", tag: "Industry honors" },
              { name: "Project Milestones", tag: "Flag-off ceremonies" },
              { name: "Client Interactions", tag: "Partnership meetings" }
            ].map((album, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-emerald-400/40 transition-all text-left">
                <span className="text-xs font-bold text-white block">{album.name}</span>
                <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">{album.tag}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/20 text-xs text-slate-300 text-center">
            Teams can instantly discover and download approved imagery for: <strong>Presentations • Social Media • PR &amp; Reports • Recruitment • Profiles</strong>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 14: VEHICLE BRANDING
    // -------------------------------------------------------------
    {
      id: 14,
      category: "14 — Vehicle Branding",
      title: "The Right Artwork for the Right Vehicle & Project",
      subtitle: "OEM-specific body structures, chassis dimensions, and verified wrap templates.",
      render: () => (
        <div className="space-y-6 max-w-5xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Different electric vehicles require distinct artwork due to OEM body variants (Tata, JBM, Olectra, Switch), body panel cutouts, emergency exits, and specific state transport contracts.
          </div>

          <div className="p-5 rounded-2xl border border-white/15 bg-white/[0.03] space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">System Hierarchy</span>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold">
              <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white">1. Select OEM</span>
              <span className="text-emerald-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white">2. Vehicle Model</span>
              <span className="text-emerald-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white">3. Specific Project / State</span>
              <span className="text-emerald-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">4. Approved Artwork</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-center text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">Artwork Created</div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">Internal Verification</div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">Vendor 6-Hr Share</div>
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold">Accurate Fleet Production</div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 15: CHARGER BRANDING
    // -------------------------------------------------------------
    {
      id: 15,
      category: "15 — Charger Branding",
      title: "Standardising Branding Across Charger OEMs",
      subtitle: "Enclosure specifications, screen clearances, and safety warning layouts.",
      render: () => (
        <div className="space-y-6 max-w-5xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/20 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Depot and highway chargers from different hardware manufacturers feature unique door panels, cooling vents, screen cutouts, and high-voltage warning locations.
          </div>

          <div className="p-5 rounded-2xl border border-white/15 bg-white/[0.03] space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Standardized Mapping</span>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold">
              <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white">Charger OEM</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white">Model (60kW / 120kW / 240kW)</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white">Charger Type</span>
              <span className="text-cyan-400">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">Approved Wrap Artwork</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-center text-xs text-emerald-300 font-semibold">
            Benefit: Ensures correct branding and electrical warning decals are applied during site commissioning.
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 16: ORGANIZATION CHART
    // -------------------------------------------------------------
    {
      id: 16,
      category: "16 — Organization Chart",
      title: "Site-Wise Organization Management",
      subtitle: "Visualizing organizational structures and leadership reporting lines.",
      render: () => (
        <div className="space-y-6 max-w-5xl mx-auto text-left">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
              <Sparkles className="h-3 w-3" /> Module Status: Active Development
            </div>
            <span className="text-xs text-slate-400">Site Hierarchy Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-2">
              <h4 className="text-sm font-bold text-white">Capabilities</h4>
              <div className="space-y-1.5 text-xs text-slate-300">
                <p>• Site-wise organizational structure mapping</p>
                <p>• People, departments, and regional branches</p>
                <p>• Interactive drag-and-drop auto-layout</p>
                <p>• Custom orthogonal connection paths</p>
                <p>• Export as high-resolution graphic &amp; PDF</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-2">
              <h4 className="text-sm font-bold text-white">Core Value</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Transforms complex, outdated corporate spreadsheets into an interactive, visual chart that is easy to understand, update, and share with stakeholders.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 17: CONTROLLED ACCESS & USER MANAGEMENT
    // -------------------------------------------------------------
    {
      id: 17,
      category: "17 — Access Management",
      title: "Right Person. Right Page. Right Permission.",
      subtitle: "Granular, page-by-page governance for internal teams and external vendors.",
      render: () => (
        <div className="space-y-6 max-w-5xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/20 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Super Admins control exactly what each user can see and do across every page of the portal. Access is not all-or-nothing—it is tailored to the user&apos;s exact job requirements.
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
            {[
              { name: "View", desc: "Browse only" },
              { name: "Download", desc: "Export files" },
              { name: "Share", desc: "Create 6-hr links" },
              { name: "Create", desc: "Upload new" },
              { name: "Edit", desc: "Replace variants" },
              { name: "Manage", desc: "Full controls" }
            ].map((perm, i) => (
              <div key={i} className="p-3 rounded-xl border border-white/10 bg-white/[0.03]">
                <span className="text-xs font-bold text-emerald-400 block">{perm.name}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{perm.desc}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-300">Access can be granted to: Employees, Management, Project Teams, External Vendors, and Auditors.</span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold shrink-0">
              Zero Uncontrolled Leakage
            </span>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 18: SMART ACCESS REQUEST SYSTEM
    // -------------------------------------------------------------
    {
      id: 18,
      category: "18 — Access Request System",
      title: "Simple for Users. Controlled for Admins.",
      subtitle: "Frictionless self-service request flow paired with 1-click Super Admin review.",
      render: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto text-left">
          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">User Flow (Login Page)</span>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">1. Click &ldquo;Request Portal Access&rdquo; on Login Screen</div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">2. Enter Official Email ID &amp; Purpose</div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">3. Instant confirmation &amp; request queued</div>
            </div>
            <p className="text-[11px] text-slate-400 italic">No passwords or lengthy onboarding forms required up front.</p>
          </div>

          <div className="p-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/[0.04] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Super Admin Approval Flow</span>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">1. Pulsing red badge on Top Bar Notification Bell</div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">2. Review requester name, email, and timestamp</div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">3. Select Page-level permissions &amp; 1-Click Approve</div>
            </div>
            <p className="text-[11px] text-slate-400 italic">Complete audit trail for corporate security compliance.</p>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 19: CONTROLLED SHARING
    // -------------------------------------------------------------
    {
      id: 19,
      category: "19 — Controlled Sharing",
      title: "Share with Time-Limited Security",
      subtitle: "Safe, temporary 6-hour links preventing permanent uncontrolled circulation.",
      render: () => (
        <div className="space-y-6 max-w-5xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/20 text-xs sm:text-sm text-slate-300">
            When a wrap contractor, agency, or printer needs brand assets, you no longer need to email massive ZIP files that stay in inboxes forever.
          </div>

          <div className="p-5 rounded-2xl border border-white/15 bg-white/[0.03] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase text-emerald-400">Timed Sharing Architecture</span>
              <h4 className="text-sm sm:text-base font-bold text-white">6-Hour Auto-Expiring Clean View</h4>
              <p className="text-xs text-slate-400">Vendors access only the specific asset, color hex codes, and lossless formats without viewing the rest of the portal.</p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
              <Clock className="h-7 w-7 text-emerald-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-300">1. Select Asset Variant</div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-300">2. Generate 6-Hour Link</div>
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold">3. Link Automatically Expires</div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 20: BEFORE VS WITH PORTAL
    // -------------------------------------------------------------
    {
      id: 20,
      category: "20 — The Transformation",
      title: "From Scattered Files to a Managed Brand System",
      subtitle: "A massive upgrade in efficiency, speed, and brand security.",
      render: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto text-left">
          <div className="p-5 rounded-2xl border border-red-500/30 bg-red-500/[0.04] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-red-400">Previous Manual State</span>
              <span className="text-xs font-mono text-red-400/70">Scattered &amp; Risky</span>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2 rounded bg-white/5">❌ Multiple desktop folders &amp; duplicates</div>
              <div className="p-2 rounded bg-white/5">❌ Slow email &amp; WhatsApp manual requests</div>
              <div className="p-2 rounded bg-white/5">❌ Heavy dependency on graphic designers</div>
              <div className="p-2 rounded bg-white/5">❌ Outdated logo versions sent to press</div>
              <div className="p-2 rounded bg-white/5">❌ Wrong legal letterheads used on contracts</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-400">With Transvolt Brand Portal</span>
              <span className="text-xs font-mono text-emerald-400">Unified &amp; Controlled</span>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2 rounded bg-white/5">✔ Single centralized Source of Truth</div>
              <div className="p-2 rounded bg-white/5">✔ Instant search &amp; lossless multi-format export</div>
              <div className="p-2 rounded bg-white/5">✔ Self-service with role-based permissions</div>
              <div className="p-2 rounded bg-white/5">✔ Pre-verified artwork for OEM vehicles &amp; chargers</div>
              <div className="p-2 rounded bg-white/5">✔ 6-Hour secure links for external vendors</div>
            </div>
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 21: OVERALL BUSINESS BENEFITS
    // -------------------------------------------------------------
    {
      id: 21,
      category: "21 — Business Value",
      title: "Why This Portal Matters to Transvolt",
      subtitle: "Measurable impact on speed, accuracy, risk reduction, and brand equity.",
      render: () => (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-5xl mx-auto text-left">
          {[
            { icon: <Zap className="h-4 w-4 text-emerald-400" />, title: "Saves Hours of Time", desc: "No repeated searches, manual emailing, or designer bottlenecks." },
            { icon: <ShieldCheck className="h-4 w-4 text-cyan-400" />, title: "Improves Consistency", desc: "Every depot and vendor uses 100% approved assets." },
            { icon: <Lock className="h-4 w-4 text-blue-400" />, title: "Strengthens Security", desc: "Strict page-level controls and 6-hour link expiration." },
            { icon: <CheckCircle2 className="h-4 w-4 text-indigo-400" />, title: "Eliminates Rework", desc: "Correct specs reach printers the first time." },
            { icon: <RefreshCw className="h-4 w-4 text-pink-400" />, title: "Zero Outdated Files", desc: "Old files can be locked or replaced globally." },
            { icon: <Users className="h-4 w-4 text-amber-400" />, title: "Scales with Growth", desc: "Easily onboard new depots, cities, OEMs, and employees." }
          ].map((item, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all">
              <div className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-1.5">
                {item.icon}
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white">{item.title}</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 22: FROM BRAND LIBRARY TO OPERATING SYSTEM
    // -------------------------------------------------------------
    {
      id: 22,
      category: "22 — The 7 Pillars",
      title: "From Brand Library to Brand Operating System",
      subtitle: "The complete lifecycle of how assets are governed within Transvolt.",
      render: () => (
        <div className="space-y-4 max-w-5xl mx-auto text-left">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center">
            {[
              { num: "01", name: "STORE", desc: "Centralized hub" },
              { num: "02", name: "ORGANIZE", desc: "Category & site" },
              { num: "03", name: "CONTROL", desc: "Role permissions" },
              { num: "04", name: "VERIFY", desc: "Approved specs" },
              { num: "05", name: "GENERATE", desc: "ID & bus cards" },
              { num: "06", name: "SHARE", desc: "6-Hour links" },
              { num: "07", name: "MAINTAIN", desc: "Replace & hold" }
            ].map((col, i) => (
              <div key={i} className="p-3 rounded-xl border border-white/10 bg-white/[0.03] flex flex-col items-center">
                <span className="text-[10px] font-mono text-emerald-400">{col.num}</span>
                <span className="text-xs font-bold text-white mt-1">{col.name}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{col.desc}</span>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl border border-white/15 bg-white/[0.02] text-xs text-slate-300 leading-relaxed text-center">
            The portal goes far beyond passive cloud storage. It acts as an <strong>active brand operating system</strong> that guarantees quality, legal protection, and seamless daily operations across the company.
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 23: FUTURE POSSIBILITIES
    // -------------------------------------------------------------
    {
      id: 23,
      category: "23 — The Road Ahead",
      title: "Future Roadmap & Technological Evolution",
      subtitle: "Upcoming features and intelligence planned for the portal ecosystem.",
      render: () => (
        <div className="space-y-6 max-w-5xl mx-auto text-left">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              "AI Smart Search & Auto-Tagging",
              "Multi-Tier Approval Workflows",
              "Full Asset Version History",
              "Download & Utilization Analytics",
              "Direct Vendor Sub-Portals",
              "Automated Asset Expiry Notices",
              "Automated Compliance Checks",
              "Central Brand Knowledge Base"
            ].map((feature, i) => (
              <div key={i} className="p-3 rounded-xl border border-white/10 bg-white/[0.03] flex items-center gap-2 text-xs">
                <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">{feature}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/20 text-xs text-blue-300 text-center">
            As Transvolt expands into new cities and multi-gigawatt transit projects, the portal is architected to scale without friction.
          </div>
        </div>
      )
    },

    // -------------------------------------------------------------
    // SLIDE 24: FINAL / THANK YOU SLIDE
    // -------------------------------------------------------------
    {
      id: 24,
      category: "24 — Thank You",
      title: "One Platform. One Trusted Source. One Transvolt Brand.",
      subtitle: "Moving Forward. Powering a Cleaner Future.",
      render: ({ onRequestAccess, handleDownloadDeck, onJump }) => (
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto py-6 sm:py-10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Presentation Concluded
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Thank You for Exploring
            </h2>
            <p className="text-sm sm:text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Moving Forward. Powering a Cleaner Future.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-md text-xs sm:text-sm text-slate-300 space-y-2 max-w-xl">
            <p><strong>Find the right information.</strong> Verify the right asset.</p>
            <p><strong>Give the right access.</strong> Generate the right document.</p>
            <p><strong>Share the right file.</strong> Represent Transvolt consistently.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full">
            {onRequestAccess && (
              <Button
                type="button"
                onClick={() => {
                  onClose()
                  onRequestAccess()
                }}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                <Lock className="h-4 w-4 mr-2" /> Request Portal Access
              </Button>
            )}

            <Button
              type="button"
              onClick={handleDownloadDeck}
              variant="outline"
              className="w-full sm:w-auto h-11 px-6 rounded-xl border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
            >
              <Download className="h-4 w-4 mr-2 text-emerald-400" /> Download Presentation Deck
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => onJump(0)}
              className="w-full sm:w-auto h-11 px-4 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 text-xs font-medium cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Restart from Beginning
            </Button>
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
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
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
  }, [isOpen, handleNext, handlePrev, showThumbnails, onClose, totalSlides])

  // Auto-play timer
  React.useEffect(() => {
    if (!isOpen || !isPlaying) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev < totalSlides - 1) {
          return prev + 1
        } else {
          setIsPlaying(false)
          return prev
        }
      })
    }, 8000)

    return () => clearInterval(timer)
  }, [isOpen, isPlaying, totalSlides])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {})
      setIsFullscreen(false)
    }
  }

  if (!isOpen) return null

  const activeSlide = slides[currentSlide]
  const progressPercent = Math.round(((currentSlide + 1) / totalSlides) * 100)

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-[#050912] text-white select-none overflow-hidden animate-in fade-in duration-300"
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP BAR NAVIGATION */}
      <header className="relative z-30 h-16 border-b border-white/10 bg-[#070d1a]/85 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Brand logo & Current chapter */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1 font-bold text-sm tracking-tight text-white shrink-0">
            <span>TRANSVOLT</span>
            <span className="text-emerald-400">❯❯</span>
          </div>
          <div className="h-4 w-[1px] bg-white/20 shrink-0" />
          <div className="min-w-0 flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400 truncate">
              {activeSlide.category}
            </span>
            <span className="hidden sm:inline text-slate-500 text-xs">•</span>
            <span className="hidden sm:inline text-xs text-slate-400 truncate max-w-[240px]">
              {activeSlide.title}
            </span>
          </div>
        </div>

        {/* Right: Presentation Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Slide indicator */}
          <div className="text-xs font-mono font-bold text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
            {String(currentSlide + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
          </div>

          {/* Auto-play toggle */}
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className={cn(
              "p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
              isPlaying
                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                : "border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
            )}
            title={isPlaying ? "Pause auto-slide" : "Start auto-slide (8s per slide)"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="hidden md:inline text-[11px]">{isPlaying ? "Playing" : "Auto-Play"}</span>
          </button>

          {/* Thumbnails Sitemap Modal Toggle */}
          <button
            type="button"
            onClick={() => setShowThumbnails((p) => !p)}
            className={cn(
              "p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
              showThumbnails
                ? "bg-blue-500/20 border-blue-400/40 text-blue-300"
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
            className="p-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer hidden sm:flex"
            title="Toggle fullscreen [F]"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Download Deck button */}
          <button
            type="button"
            onClick={handleDownloadDeck}
            className="p-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer hidden lg:flex items-center gap-1 text-xs"
            title="Download official presentation (.pptx)"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span className="text-[11px]">Deck</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer ml-1"
            title="Exit presentation [Esc]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* TOP PROGRESS BAR */}
      <div className="relative z-20 h-1 w-full bg-white/5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.7)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* MAIN SLIDE VIEWPORT */}
      <main className="relative flex-1 z-10 flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-6 overflow-y-auto">
        <div className="w-full max-w-6xl mx-auto my-auto">
          {activeSlide.render({
            onNext: handleNext,
            onPrev: handlePrev,
            onJump: handleJump,
            onRequestAccess,
            handleDownloadDeck
          })}
        </div>
      </main>

      {/* FLOATING BOTTOM CONTROLS */}
      <footer className="relative z-30 h-16 border-t border-white/10 bg-[#070d1a]/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
        {/* Left: Keyboard Hint */}
        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs">
          <span className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white">←</span>
          <span className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white">→</span>
          <span className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white">Space</span>
          <span>to navigate slides</span>
        </div>

        {/* Center: Slide Jump Controls */}
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="h-9 px-3 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </Button>

          {/* Slide Indicator Dots on larger screens */}
          <div className="hidden lg:flex items-center gap-1.5 max-w-md overflow-x-auto px-2 py-1">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={cn(
                  "h-2 rounded-full transition-all cursor-pointer",
                  idx === currentSlide
                    ? "w-6 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    : "w-2 bg-white/20 hover:bg-white/40"
                )}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handleNext}
            disabled={currentSlide === totalSlides - 1}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-semibold disabled:opacity-30 cursor-pointer shadow-md shadow-emerald-500/20"
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Right: Quick Jump to End or Start */}
        <div className="hidden sm:flex items-center gap-2">
          {currentSlide === totalSlides - 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentSlide(0)}
              className="h-9 px-3 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Start Over
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCurrentSlide(totalSlides - 1)}
              className="h-9 px-3 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Skip to End →
            </Button>
          )}
        </div>
      </footer>

      {/* ALL SLIDES THUMBNAIL SITEMAP DRAWER / MODAL */}
      {showThumbnails && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 max-w-6xl mx-auto w-full">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Grid className="h-5 w-5 text-emerald-400" />
                Presentation Slide Navigator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Click any slide to jump directly to it.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowThumbnails(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
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
                      ? "border-emerald-400 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">
                      #{String(idx + 1).padStart(2, "0")}
                    </span>
                    {idx === currentSlide && (
                      <span className="text-[9px] font-extrabold uppercase bg-emerald-400 text-black px-1.5 py-0.2 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block truncate">
                      {slide.category}
                    </span>
                    <h5 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 mt-0.5">
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
  )
}
