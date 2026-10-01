"use client"

import * as React from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Palette,
  Type,
  FolderTree,
  FileText,
  IdCard,
  Monitor,
  Printer,
  MonitorPlay,
  Image as ImageIcon,
  Car,
  Zap,
  Sparkles,
  Music2,
  Building2,
  Network,
  Users,
  Compass,
  ArrowRight,
  Play,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sliders,
  Layers,
  Sparkle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface PortalPageShowcaseItem {
  id: string
  title: string
  href: string
  slideIndex: number
  badgeText: string
  badgeVariant?: "default" | "emerald" | "cyan" | "purple" | "amber" | "rose" | "blue"
  category: "brand" | "studios" | "fleet" | "stationery" | "governance"
  icon: React.ElementType
  iconGradient: string
  tagline: string
  benefit: string
  bestFeatures: string[]
  stats?: string
}

export const PORTAL_PAGES_DIRECTORY: PortalPageShowcaseItem[] = [
  // 1. Dashboard
  {
    id: "dashboard",
    title: "Executive Dashboard",
    href: "/dashboard",
    slideIndex: 3,
    badgeText: "Mission Control",
    badgeVariant: "emerald",
    category: "brand",
    icon: LayoutDashboard,
    iconGradient: "from-emerald-500 to-teal-600",
    tagline: "Live Brand Command Center & Ecosystem Health",
    benefit: "Delivers an instantaneous executive birds-eye overview of the entire brand ecosystem, tracking asset updates, access requests, and download trends across all depots.",
    bestFeatures: [
      "Global keyword search across all 16+ brand modules",
      "Real-time access request alerts and pending approvals counter",
      "One-click quick launch to creative studios and high-frequency vector kits",
      "Live asset state indicators (Active, In Review, On Hold, Archived)"
    ],
    stats: "16+ Modules Synced"
  },

  // 2. Official Logo & Color
  {
    id: "logo-color",
    title: "Official Logo & Color Palette",
    href: "/logo-color",
    slideIndex: 4,
    badgeText: "Master Identity",
    badgeVariant: "emerald",
    category: "brand",
    icon: Palette,
    iconGradient: "from-emerald-600 to-green-600",
    tagline: "One Single Source of Truth for Brand Assets",
    benefit: "Guarantees absolute visual brand fidelity across print presses, digital platforms, and vendor collateral by serving only verified, lossless master vector files.",
    bestFeatures: [
      "Lossless format suite: Scalable SVG, transparent PNG, CorelDraw CDR v15 & PDF",
      "Precise hex, RGB, CMYK, and Pantone calibration (#548235 Green, #00A4EF Blue)",
      "Strict clear-space rules, minimum dimension locks & background contrast rules",
      "Auto-expiring 6-hour vendor download links for leak-free distribution"
    ],
    stats: "Zero Distortion"
  },

  // 3. Typography
  {
    id: "typography",
    title: "Typography System",
    href: "/typography",
    slideIndex: 5,
    badgeText: "Type Standards",
    badgeVariant: "blue",
    category: "brand",
    icon: Type,
    iconGradient: "from-blue-500 to-indigo-600",
    tagline: "Corporate Type Hierarchy & Font Packages",
    benefit: "Eliminates font mismatches and unapproved typefaces across corporate presentations, web applications, marketing posters, and formal stationery.",
    bestFeatures: [
      "Poppins font family hierarchy (Bold 700, SemiBold 600, Regular 400)",
      "Calibri font standards for corporate letters, spreadsheets, and contracts",
      "Web font embedding kits and desktop TrueType/OpenType font downloads",
      "Clear line-height, letter-tracking, and responsive heading sizing rules"
    ],
    stats: "100% Legibility"
  },

  // 4. Brand Philosophy
  {
    id: "brand-philosophy",
    title: "Brand Philosophy & Vision",
    href: "/brand-philosophy",
    slideIndex: 6,
    badgeText: "Corporate Ethos",
    badgeVariant: "emerald",
    category: "brand",
    icon: Compass,
    iconGradient: "from-emerald-500 to-cyan-500",
    tagline: "Sustainable Mobility & Clean Energy Vision",
    benefit: "Aligns all stakeholders, new employees, investors, and public transit partners behind Transvolt's core mission of accelerating India's transition to zero-emission mobility.",
    bestFeatures: [
      "Deep dive into the Transvolt Green & Blue arrow symbolism",
      "Core corporate pillars: Environmental Stewardship, Innovation, & Safety",
      "National clean transit impact metrics & carbon offset vision",
      "Approved corporate mission statements for press releases & speeches"
    ],
    stats: "Zero Emissions"
  },

  // 5. Letterhead
  {
    id: "letterhead",
    title: "Official Letterhead System",
    href: "/letterhead",
    slideIndex: 7,
    badgeText: "Stationery Suite",
    badgeVariant: "cyan",
    category: "stationery",
    icon: FileText,
    iconGradient: "from-cyan-500 to-blue-600",
    tagline: "Multi-Firm Entity Corporate Correspondence",
    benefit: "Eliminates document rejection and legal discrepancies by generating official letterheads pre-populated with verified corporate entities, registered offices, and GSTINs.",
    bestFeatures: [
      "Multi-entity selector: Transvolt Mobility Pvt Ltd, Regional SPVs, & Subsidiaries",
      "Direct auto-synchronization with Company Master legal directory",
      "Editable Microsoft Word (.docx) templates with locked header/footer branding",
      "High-resolution vector PDF packs calibrated for offset and digital printers"
    ],
    stats: "Multi-SPV Synced"
  },

  // 6. ID Cards & Business Cards
  {
    id: "id-business-cards",
    title: "ID & Business Cards Suite",
    href: "/id-business-cards",
    slideIndex: 8,
    badgeText: "Live Generator",
    badgeVariant: "purple",
    category: "stationery",
    icon: IdCard,
    iconGradient: "from-purple-500 to-indigo-600",
    tagline: "Site Directory & Automated Employee Cards",
    benefit: "Completely removes external graphic designer delays by enabling site managers to instantly generate, customize, and print verified PVC ID cards and NFC business cards.",
    bestFeatures: [
      "Site-wise employee rosters covering Mumbai, Pune, Ahmedabad & Head Office",
      "New Employee Photo Upload Modal with drag & drop and webcam capture",
      "Live dual-sided Front & Back PVC card customizer with dynamic QR codes",
      "Turnstile-compatible barcode generation and print-ready PDF export with crop marks"
    ],
    stats: "Instant Production"
  },

  // 7. Presentation
  {
    id: "presentation",
    title: "Presentation System",
    href: "/presentation",
    slideIndex: 9,
    badgeText: "Official Decks",
    badgeVariant: "blue",
    category: "brand",
    icon: MonitorPlay,
    iconGradient: "from-blue-600 to-cyan-600",
    tagline: "16:9 Master Decks & Interactive Web Deck Player",
    benefit: "Empowers executive leadership and sales teams to pitch to investors, transport ministries, and corporate clients with unified, high-impact storytelling.",
    bestFeatures: [
      "Built-in 28-slide interactive web presentation player with auto-play & speed controls",
      "Widescreen 16:9 editable PowerPoint (.pptx) master slide deck downloads",
      "Pre-configured layouts for financial metrics, KPI grids, roadmaps & team bios",
      "Light and dark presentation viewing modes with instant chapter jumping"
    ],
    stats: "28-Slide Interactive"
  },

  // 8. Digital Assets
  {
    id: "digital-assets",
    title: "Digital Assets Vault",
    href: "/digital-assets",
    slideIndex: 10,
    badgeText: "Online Creatives",
    badgeVariant: "cyan",
    category: "brand",
    icon: Monitor,
    iconGradient: "from-cyan-600 to-blue-500",
    tagline: "Social Media, Emailers & Web Creatives",
    benefit: "Ensures social media channels, recruitment posts, and digital campaigns remain consistently on-brand with approved aspect ratios, color grading, and typography.",
    bestFeatures: [
      "Social media post kits tailored for LinkedIn, Instagram, X (Twitter), and YouTube",
      "Corporate email newsletter banners and internal announcement templates",
      "Web banners, app headers, and responsive digital advertising graphics",
      "Pre-tested text safe-zones preventing mobile clipping on all social platforms"
    ],
    stats: "All Social Ratios"
  },

  // 9. Printing Assets
  {
    id: "printing-assets",
    title: "Printing Assets Vault",
    href: "/printing-assets",
    slideIndex: 11,
    badgeText: "Press Ready",
    badgeVariant: "amber",
    category: "stationery",
    icon: Printer,
    iconGradient: "from-amber-500 to-orange-600",
    tagline: "Press-Ready CMYK Collateral & Merchandise",
    benefit: "Protects against expensive printing reprints by supplying print vendors with 300+ DPI CMYK artwork with accurate bleeds, safe cut margins, and color profiles.",
    bestFeatures: [
      "Corporate brochures, capability booklets, flyers, and exhibition leaflets",
      "Roll-up standees, backdrop banners, stage scrims, and event podium graphics",
      "Invoice books, receipt vouchers, register covers, and corporate stationery",
      "Direct press specifications including bleed marks, folding creases, and paper stock"
    ],
    stats: "300+ DPI CMYK"
  },

  // 10. Graphics Drive
  {
    id: "graphics-drive",
    title: "Graphics Drive",
    href: "/graphics-drive",
    slideIndex: 12,
    badgeText: "Cloud Drive",
    badgeVariant: "purple",
    category: "studios",
    icon: FolderTree,
    iconGradient: "from-purple-600 to-indigo-600",
    tagline: "Hierarchical Folder Drive & Creative Cloud",
    benefit: "Replaces messy Google Drive links and USB thumb drives with a high-performance, structured corporate asset file system that makes every brand file findable in seconds.",
    bestFeatures: [
      "Intuitive Windows Explorer & Google Drive style nested folder hierarchy",
      "Multi-format instant preview modal for CDR, PDF, SVG, PNG, and JPG files",
      "One-click batch ZIP download engine for rapid bulk asset retrieval",
      "Deep asset tagging, category filtering, and instant keyword search"
    ],
    stats: "Cloud File System"
  },

  // 11. Photos and Videos Repository
  {
    id: "photos",
    title: "Photos & Videos Repository",
    href: "/photos",
    slideIndex: 13,
    badgeText: "Media Vault",
    badgeVariant: "rose",
    category: "brand",
    icon: ImageIcon,
    iconGradient: "from-rose-500 to-pink-600",
    tagline: "IndexedDB High-Capacity Media Archive",
    benefit: "Preserves high-resolution original photography of EV bus fleets, launch events, and charging depots without cloud storage compression or image downscaling.",
    bestFeatures: [
      "IndexedDB Photo Vault: Unlimited local storage with zero compression loss",
      "4K aerial drone footage, operational fleet photography & milestone flag-offs",
      "High-power DC charging depot documentation and technician team portraits",
      "Categorized by city depot, vehicle model, event date, and aspect ratio"
    ],
    stats: "4K Lossless Media"
  },

  // 12. Vehicle Branding
  {
    id: "vehicle-branding",
    title: "Vehicle Fleet Branding",
    href: "/vehicle-branding",
    slideIndex: 14,
    badgeText: "Fleet Standards",
    badgeVariant: "blue",
    category: "fleet",
    icon: Car,
    iconGradient: "from-blue-600 to-teal-600",
    tagline: "3M Vinyl Wraps & Bus/Truck Specifications",
    benefit: "Standardizes public transit livery across OEM bus manufacturers (Tata, JBM, Olectra) ensuring full compliance with municipal transit authority contracts.",
    bestFeatures: [
      "Precision body mapping for 9m, 12m, and articulated electric buses",
      "Emergency door clearances, window perforation guidelines & regulatory decals",
      "Full wrap artwork and vector decals for commercial electric delivery trucks",
      "Direct production integration with the brand-new Eva Design Tool studio"
    ],
    stats: "Multi-OEM Ready"
  },

  // 13. Charger Branding
  {
    id: "charger-branding",
    title: "EV Charger Branding",
    href: "/charger-branding",
    slideIndex: 15,
    badgeText: "Depot Plazas",
    badgeVariant: "amber",
    category: "fleet",
    icon: Zap,
    iconGradient: "from-amber-500 to-yellow-500",
    tagline: "Standardized Branding Across Charger OEMs",
    benefit: "Creates a cohesive, high-tech Transvolt brand experience across disparate charging hardware manufacturers (Exicom, Servotech, Delta, ABB) in multi-depot plazas.",
    bestFeatures: [
      "Tailored wrap templates for 60kW, 120kW, 180kW, and 240kW dual-gun chargers",
      "Precision cutouts for cooling vents, RFID payment scanners & emergency stop buttons",
      "Mandatory high-voltage danger iconography and earthing safety decals",
      "High-durability UV-resistant and weatherproof 3M vinyl material specifications"
    ],
    stats: "All Power Ratings"
  },

  // 14. Eva Design Tool (NEW)
  {
    id: "eva-design-tool",
    title: "Eva Design Tool Studio",
    href: "/eva-design-tool",
    slideIndex: 16,
    badgeText: "NEW STUDIO",
    badgeVariant: "purple",
    category: "studios",
    icon: Sparkles,
    iconGradient: "from-purple-600 via-pink-600 to-indigo-600",
    tagline: "Interactive EV Livery Studio & Vector Customizer",
    benefit: "Revolutionizes livery prototyping by allowing design teams and fleet managers to customize vehicle wraps directly in the browser, cutting mock-up turnaround from days to minutes.",
    bestFeatures: [
      "Interactive 2D/3D Fleet Canvas with Bus, Truck, Van & Passenger EV models",
      "CorelDRAW vector text panel with live curve deformation & arc envelope bending",
      "Industry-standard Bézier vector pen tool with anchor nodes & tangent handles",
      "Live layer stack (ordering, lock/unlock, opacity) & lossless vector SVG/PNG export"
    ],
    stats: "Next-Gen Livery CAD"
  },

  // 15. Generate Audio (NEW)
  {
    id: "generate-audio",
    title: "Brand Sonic Identity Studio",
    href: "/generate-audio",
    slideIndex: 17,
    badgeText: "AI AUDIO",
    badgeVariant: "cyan",
    category: "studios",
    icon: Music2,
    iconGradient: "from-cyan-500 via-teal-500 to-blue-600",
    tagline: "AI Sonic Identity & Corporate Voice Studio",
    benefit: "Establishes a recognizable acoustic brand signature and generates multilingual voiceovers and background soundtracks with pre-cleared corporate commercial rights.",
    bestFeatures: [
      "Acoustic brand signature synthesizer for video logos, apps & transit announcements",
      "Multilingual AI Text-to-Speech engine supporting regional Indian languages",
      "Atmospheric background scoring tailored for corporate presentations & launch videos",
      "Lossless 24-bit WAV & 320kbps MP3 downloads with zero copyright friction"
    ],
    stats: "100% Pre-Cleared"
  },

  // 16. Company Master (NEW)
  {
    id: "company-master",
    title: "Company Master Registry",
    href: "/company-master",
    slideIndex: 18,
    badgeText: "LEGAL TRUTH",
    badgeVariant: "emerald",
    category: "governance",
    icon: Building2,
    iconGradient: "from-emerald-600 to-teal-700",
    tagline: "Centralized Legal Entity, GSTIN & CIN Repository",
    benefit: "Guarantees corporate legal accuracy across all contracts, invoices, and stationery, ending billing rejections caused by mismatched GSTINs or obsolete office addresses.",
    bestFeatures: [
      "Master directory of all Transvolt entities, SPVs, and regional operating units",
      "Verified Corporate Identity Numbers (CIN), GSTIN certificates & PAN registry",
      "Authorized bank account numbers, IFSC codes & RTGS details for billing",
      "Direct auto-synchronization with Letterheads and procurement documentation"
    ],
    stats: "100% Tax Compliant"
  },

  // 17. Organization Chart
  {
    id: "organization-chart",
    title: "Organization Hierarchy",
    href: "/organization-chart",
    slideIndex: 19,
    badgeText: "Team Matrix",
    badgeVariant: "blue",
    category: "governance",
    icon: Network,
    iconGradient: "from-blue-600 to-indigo-700",
    tagline: "Site-Wise Interactive Operational Hierarchy",
    benefit: "Maps organizational reporting structures and leadership chains across all regional depots, making team responsibilities and escalation paths immediately transparent.",
    bestFeatures: [
      "Site-wise filter for Mumbai Central, Pune, Ahmedabad & Corporate Head Office",
      "Interactive pan-zoom auto-layout with collapsible departmental sub-trees",
      "Visual orthogonal connector paths displaying chains of operational command",
      "High-resolution vector PDF and PNG export for HR compliance and board decks"
    ],
    stats: "Site-Wise Trees"
  },

  // 18. Users & Access Management
  {
    id: "users",
    title: "Access Governance & Users",
    href: "/users",
    slideIndex: 20,
    badgeText: "Security RBAC",
    badgeVariant: "rose",
    category: "governance",
    icon: Users,
    iconGradient: "from-rose-600 to-red-700",
    tagline: "Role-Based Access Control & Security Matrix",
    benefit: "Protects proprietary corporate intellectual property by strictly controlling who can view, edit, download, or share assets on a granular per-page basis.",
    bestFeatures: [
      "6-tier capability matrix (View, Download, Share, Create, Edit, Super Admin)",
      "Dedicated access rules separating internal staff from external contract vendors",
      "Self-service access request queue with email alerts and instant admin approvals",
      "Comprehensive audit trail of file downloads and timed share link generation"
    ],
    stats: "Zero Unauthorized Access"
  },
]

const CATEGORY_TABS = [
  { id: "all", label: "All Pages", count: PORTAL_PAGES_DIRECTORY.length },
  { id: "brand", label: "Brand Identity", count: PORTAL_PAGES_DIRECTORY.filter((p) => p.category === "brand").length },
  { id: "studios", label: "Creative & AI Studios", count: PORTAL_PAGES_DIRECTORY.filter((p) => p.category === "studios").length },
  { id: "fleet", label: "Fleet & Depots", count: PORTAL_PAGES_DIRECTORY.filter((p) => p.category === "fleet").length },
  { id: "stationery", label: "Stationery & Cards", count: PORTAL_PAGES_DIRECTORY.filter((p) => p.category === "stationery").length },
  { id: "governance", label: "Legal & Governance", count: PORTAL_PAGES_DIRECTORY.filter((p) => p.category === "governance").length },
]

interface PresentationPagesShowcaseProps {
  onOpenSlide?: (slideIndex: number) => void
}

export function PresentationPagesShowcase({ onOpenSlide }: PresentationPagesShowcaseProps) {
  const [activeTab, setActiveTab] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredPages = React.useMemo(() => {
    return PORTAL_PAGES_DIRECTORY.filter((page) => {
      const matchesCategory = activeTab === "all" || page.category === activeTab
      const q = searchQuery.toLowerCase().trim()
      if (!q) return matchesCategory

      const matchesSearch =
        page.title.toLowerCase().includes(q) ||
        page.tagline.toLowerCase().includes(q) ||
        page.benefit.toLowerCase().includes(q) ||
        page.bestFeatures.some((f) => f.toLowerCase().includes(q)) ||
        page.badgeText.toLowerCase().includes(q)

      return matchesCategory && matchesSearch
    })
  }, [activeTab, searchQuery])

  return (
    <div className="w-full space-y-6 pt-2 pb-8 text-left">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Transvolt Portal Ecosystem Showcase
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Portal Pages: Key Benefits & Standout Features
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Every page in the Transvolt Brand Portal has been engineered to eliminate design delays, protect corporate identity, and streamline multi-depot operations. Explore the capabilities of each module below.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search pages or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-card border-border/80 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border select-none",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground border-border/60"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background text-muted-foreground border border-border/60"
                )}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* SHOWCASE GRID */}
      {filteredPages.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-dashed border-border/80 p-8 space-y-3 bg-card/40">
          <p className="text-sm font-semibold text-muted-foreground">No portal pages matched &quot;{searchQuery}&quot;</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("")
              setActiveTab("all")
            }}
            className="rounded-xl text-xs"
          >
            Clear Search Filter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPages.map((page) => {
            const Icon = page.icon
            return (
              <div
                key={page.id}
                className="group relative rounded-2xl border border-border/70 bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200 p-5 flex flex-col justify-between gap-4 overflow-hidden"
              >
                {/* Ambient Top Corner Gradient Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 via-cyan-500/5 to-transparent rounded-bl-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-3.5 relative z-10">
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-11 w-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-md shrink-0 transition-transform group-hover:scale-105",
                          page.iconGradient
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-foreground leading-tight group-hover:text-primary transition-colors">
                          {page.title}
                        </h4>
                        <span className="text-[11px] font-mono text-muted-foreground block truncate">
                          {page.href}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className="text-[10px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full shrink-0 border-border/80 bg-background/80 shadow-2xs"
                    >
                      {page.badgeText}
                    </Badge>
                  </div>

                  {/* Primary Business Benefit Callout */}
                  <div className="rounded-xl bg-muted/40 border border-border/60 p-3 text-xs leading-relaxed space-y-1">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-primary block">
                      Primary Benefit
                    </span>
                    <p className="text-muted-foreground font-medium">
                      {page.benefit}
                    </p>
                  </div>

                  {/* Best Features Bullet List */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-foreground block">
                      Best Features & Capabilities:
                    </span>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {page.bestFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-tight">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="font-normal">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 relative z-10">
                  {onOpenSlide && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenSlide(page.slideIndex)}
                      className="h-8 px-2.5 rounded-lg text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 cursor-pointer flex items-center gap-1.5"
                      title={`Open Slide ${page.slideIndex + 1} in Presentation Deck`}
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Slide #{String(page.slideIndex + 1).padStart(2, "0")}</span>
                    </Button>
                  )}

                  <Link href={page.href} className="ml-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 rounded-lg text-xs font-semibold group/btn hover:border-primary/50 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>Explore Page</span>
                      <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
