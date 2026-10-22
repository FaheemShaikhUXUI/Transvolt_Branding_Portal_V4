"use client"

import * as React from "react"
import {
  ClipboardCheck,
  Copy,
  Check,
  Search,
  Filter,
  Shield,
  Layers,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Download,
  Share2,
  QrCode,
  Sparkles,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TestCase {
  id: string
  scenario: string
  steps: string
  expected: string
  criteria: string
  module: string
  severity?: "P0" | "P1" | "P2" | "P3"
}

interface Persona {
  persona: string
  role: string
  permissions: string
  focus: string
}

interface BrowserMatrixItem {
  environment: string
  resolution: string
  browser: string
  items: string
}

const PERSONAS: Persona[] = [
  {
    persona: "Super Admin",
    role: "Portal Master / Management",
    permissions: "Full read, write, upload, delete, replace format, user management",
    focus: "Asset CRUD, replace files, delete modals, credential resets, company master",
  },
  {
    persona: "In-House Employee",
    role: "Internal Marketing / Operations",
    permissions: "Full view & download all assets, create ID/business cards, generate audio",
    focus: "High-res downloads, ZIP bundling, print PDF generation, audio listening",
  },
  {
    persona: "External Agency",
    role: "Vendors, Printers, Media",
    permissions: "View approved assets, download production files, view share links",
    focus: "Rate-limited downloads, public share link countdowns, print resolution checks",
  },
  {
    persona: "Public / Guest",
    role: "Anonymous Recipient",
    permissions: "Access only via /share/* links without logging in",
    focus: "Expiration countdown (6h/7h), 100% offline QR rendering, single/ZIP downloads",
  },
]

const MODULES = [
  "All Modules",
  "Auth & Security",
  "Dashboard",
  "Logos & Colors",
  "Letterhead",
  "Presentation",
  "ID & Business Cards",
  "Audio Announcements",
  "Organization Chart",
  "Company Master",
  "Photo Vault",
]

const TEST_CASES: TestCase[] = [
  // Auth
  {
    id: "TC-AUTH-01",
    module: "Auth & Security",
    scenario: "Root URL redirect",
    steps: "Navigate to http://localhost:3000/ without an active session cookie.",
    expected: "Automatically redirects to /login with HTTP 307.",
    criteria: "Must never display blank white screen or 404.",
    severity: "P0",
  },
  {
    id: "TC-AUTH-02",
    module: "Auth & Security",
    scenario: "Super Admin authentication",
    steps: "Enter Super Admin email & password, click Sign In.",
    expected: "Navigates to /dashboard. Cookie transvolt_session=1 set.",
    criteria: "Super Admin badge visible in user menu.",
    severity: "P0",
  },
  {
    id: "TC-AUTH-03",
    module: "Auth & Security",
    scenario: "In-House role permissions",
    steps: "Log in with in-house user credentials.",
    expected: "Access portal; administrative delete/replace icons are hidden.",
    criteria: "Cannot access or view Super Admin credentials.",
    severity: "P1",
  },
  {
    id: "TC-AUTH-04",
    module: "Auth & Security",
    scenario: "Request Access form submission",
    steps: "From /login screen, click Request Access, fill form & submit.",
    expected: "Confirmation toast displays; pending request logged for Super Admin.",
    criteria: "Request state persists in context and localStorage.",
    severity: "P2",
  },
  {
    id: "TC-AUTH-05",
    module: "Auth & Security",
    scenario: "Public Share Link bypass",
    steps: "Open any /share/* link in a fresh Incognito window or different browser.",
    expected: "Page renders immediately (200 OK) without login redirect.",
    criteria: "Never redirects public guests to /login.",
    severity: "P0",
  },

  // Dashboard
  {
    id: "TC-DASH-01",
    module: "Dashboard",
    scenario: "Real-time download counter",
    steps: "Trigger download of any asset, then inspect dashboard download counter.",
    expected: "Counter increments by +1 immediately across tabs.",
    criteria: "Synchronized with StatsContext and localStorage.",
    severity: "P2",
  },
  {
    id: "TC-DASH-02",
    module: "Dashboard",
    scenario: "Quick category navigation cards",
    steps: "Click on Logos, Letterhead, Presentations, ID Cards navigation cards.",
    expected: "Smooth client-side transition to matching category page.",
    criteria: "URL updates and matching category header loads without flash.",
    severity: "P2",
  },
  {
    id: "TC-DASH-03",
    module: "Dashboard",
    scenario: "Theme switcher (Light / Dark / Navy)",
    steps: "Click theme toggle in top navigation bar.",
    expected: "App theme switches instantaneously with custom CSS tokens.",
    criteria: "Maintains WCAG AA contrast ratio in all 3 themes.",
    severity: "P3",
  },

  // Logos & Colors
  {
    id: "TC-LOGO-01",
    module: "Logos & Colors",
    scenario: "Brand guidelines accordion",
    steps: "Navigate to /logo-color and click View Information accordion toggle.",
    expected: "Accordion smoothly expands showing guidelines, palette & warnings.",
    criteria: "Chevron icon rotates 180°; text is fully legible.",
    severity: "P2",
  },
  {
    id: "TC-LOGO-02",
    module: "Logos & Colors",
    scenario: "Single format download",
    steps: "Click SVG, PNG, and CDR download buttons on Logo Black tile.",
    expected: "Direct download of files with exact matching filename.",
    criteria: "SVG vector format is valid; PNG retains transparency.",
    severity: "P1",
  },
  {
    id: "TC-LOGO-03",
    module: "Logos & Colors",
    scenario: "Download All as ZIP",
    steps: "Click dropdown options on logo tile and choose Download All (Zip).",
    expected: "Generates and downloads a single ZIP archive with all formats.",
    criteria: "ZIP file extracts properly and contains valid asset files.",
    severity: "P1",
  },
  {
    id: "TC-LOGO-04",
    module: "Logos & Colors",
    scenario: "Put asset on Hold (Super Admin)",
    steps: "As Super Admin, open asset options > click Put on Hold.",
    expected: "Asset receives amber Hold badge; non-admins restricted from download.",
    criteria: "Hold status persists across reloads in assets store.",
    severity: "P1",
  },

  // Letterhead
  {
    id: "TC-LH-01",
    module: "Letterhead",
    scenario: "Multi-entity letterhead card structure",
    steps: "Navigate to /letterhead and inspect company cards.",
    expected: "Each card displays Header, Footer, and Docx Word File preview.",
    criteria: "Numbering and entity title match company records.",
    severity: "P1",
  },
  {
    id: "TC-LH-02",
    module: "Letterhead",
    scenario: "High-resolution Lightbox zoom & pan",
    steps: "Click on any Header or Footer image preview.",
    expected: "Opens full-screen lightbox image canvas.",
    criteria: "Mouse wheel zooms in/out; click-and-drag pans image smoothly.",
    severity: "P2",
  },
  {
    id: "TC-LH-03",
    module: "Letterhead",
    scenario: "All Download ZIP button",
    steps: "Click green outline ↓ All pill button on letterhead card.",
    expected: "ZIP archive with Header JPG, Footer JPG, and Docx template downloads.",
    criteria: "Toast displays ZIP generation progress and download confirmation.",
    severity: "P1",
  },
  {
    id: "TC-LH-04",
    module: "Letterhead",
    scenario: "Replace asset graphic (Super Admin)",
    steps: "Open card menu > click Replace Image > upload new graphic.",
    expected: "Replaces image in UI and IndexedDB storage immediately.",
    criteria: "New asset renders in lightbox and is delivered in ZIP.",
    severity: "P1",
  },

  // Presentation
  {
    id: "TC-PPT-01",
    module: "Presentation",
    scenario: "Page clean layout verification",
    steps: "Navigate to /presentation.",
    expected: "Displays ONLY the top guidelines accordion & official PPT tile.",
    criteria: "No hero banner or secondary ecosystem showcase boxes.",
    severity: "P2",
  },
  {
    id: "TC-PPT-02",
    module: "Presentation",
    scenario: "PowerPoint template download",
    steps: "Click Download PPT button on official presentation tile.",
    expected: "Downloads Transvolt master presentation (.pptx) deck.",
    criteria: "File downloads with correct MIME type and opens in MS PowerPoint.",
    severity: "P1",
  },
  {
    id: "TC-PPT-03",
    module: "Presentation",
    scenario: "Share PPT link countdown",
    steps: "Click options > Share Asset > paste into browser window.",
    expected: "Public presentation showcase page opens with 7-hour live timer.",
    criteria: "Allows downloading presentation template without portal login.",
    severity: "P1",
  },

  // ID Cards
  {
    id: "TC-CARD-01",
    module: "ID & Business Cards",
    scenario: "Add Candidate & dual-side live preview",
    steps: "Click Add Candidate, enter details, observe live preview.",
    expected: "Front & Back ID/Business card previews render in real time.",
    criteria: "Strict 90° non-curved border is maintained across previews.",
    severity: "P1",
  },
  {
    id: "TC-CARD-02",
    module: "ID & Business Cards",
    scenario: "100% Offline vector QR code generation",
    steps: "Inspect business card front QR code on localhost without internet / with adblocker.",
    expected: "QR code renders as clean vector SVG Data URL (never broken image).",
    criteria: "Zero external HTTP requests to 3rd-party servers.",
    severity: "P0",
  },
  {
    id: "TC-CARD-03",
    module: "ID & Business Cards",
    scenario: "QR module size & smartphone scanning",
    steps: "Measure QR preview (28.5px, -25% size) and scan with mobile phone camera.",
    expected: "Camera instantly recognizes contact and prompts Add to Contacts.",
    criteria: "Parses Name, Phone, Email, and Organization (Transvolt) cleanly.",
    severity: "P0",
  },
  {
    id: "TC-CARD-04",
    module: "ID & Business Cards",
    scenario: "Print / Save PDF in new tab",
    steps: "Click Print / Save PDF (New Tab).",
    expected: "Opens standalone print document with exact 89mm × 51mm dimensions and 13.1mm QR.",
    criteria: "Triggers browser print dialog automatically.",
    severity: "P1",
  },
  {
    id: "TC-CARD-05",
    module: "ID & Business Cards",
    scenario: "7-Hour Secure Share Link across devices",
    steps: "Click Share PDF, copy link, open in Incognito or on mobile phone.",
    expected: "Card loads with full candidate data; no 'Credential Not Found' error.",
    criteria: "Live countdown displays remaining time until 7-hour expiration.",
    severity: "P0",
  },
  {
    id: "TC-CARD-06",
    module: "ID & Business Cards",
    scenario: "Export candidates to Excel (.xlsx)",
    steps: "Click Export Excel button on candidate table.",
    expected: "Downloads .xlsx workbook containing all personnel records.",
    criteria: "All employee fields (name, role, contact, blood group) export intact.",
    severity: "P2",
  },

  // Audio
  {
    id: "TC-AUD-01",
    module: "Audio Announcements",
    scenario: "Dual Route List tabs (Up & Down)",
    steps: "Navigate to /generate-audio and toggle between Up and Down tabs.",
    expected: "Displays corresponding list of route stops and script lines.",
    criteria: "Sequence numbers and stop names match route order.",
    severity: "P2",
  },
  {
    id: "TC-AUD-02",
    module: "Audio Announcements",
    scenario: "Interactive audio playback & progress",
    steps: "Click Play button next to any announcement stop.",
    expected: "Audio track plays, progress bar animates, previous playing track pauses.",
    criteria: "Pause button stops playback cleanly.",
    severity: "P2",
  },
  {
    id: "TC-AUD-03",
    module: "Audio Announcements",
    scenario: "Route ZIP download",
    steps: "Click Download All Audio (ZIP).",
    expected: "Packages all route MP3 audio tracks into a single named ZIP archive.",
    criteria: "ZIP file downloads and extracts into playable audio files.",
    severity: "P1",
  },
  {
    id: "TC-AUD-04",
    module: "Audio Announcements",
    scenario: "6-Hour Shareable Audio Link",
    steps: "Click Share Audio, copy URL, and open in guest browser.",
    expected: "Public audio player loads with 6-hour countdown clock.",
    criteria: "Guest can play and download tracks without portal authentication.",
    severity: "P0",
  },

  // Org Chart
  {
    id: "TC-ORG-01",
    module: "Organization Chart",
    scenario: "Tree hierarchy navigation & zoom",
    steps: "Open Organization Chart, use zoom controls and pan canvas.",
    expected: "Tree structure scales smoothly with aligned connecting vectors.",
    criteria: "Node text remains sharp and legible.",
    severity: "P2",
  },
  {
    id: "TC-ORG-02",
    module: "Organization Chart",
    scenario: "Node role & reporting edit",
    steps: "Select a node, modify employee name or designation, and save.",
    expected: "Hierarchy tree updates and persists to storage.",
    criteria: "Child reporting relationships remain intact.",
    severity: "P2",
  },

  // Company Master
  {
    id: "TC-COMP-01",
    module: "Company Master",
    scenario: "Entity addition and ID card sync",
    steps: "Add new company entity in Company Master.",
    expected: "Company appears in master table and is populated in card creator dropdowns.",
    criteria: "Registered address and website reflect on business card previews.",
    severity: "P1",
  },
  {
    id: "TC-COMP-02",
    module: "Company Master",
    scenario: "Entity contact update",
    steps: "Modify contact number or address of an existing company.",
    expected: "Updates propagate across newly generated business cards.",
    criteria: "Changes persist across reloads in company master context.",
    severity: "P2",
  },

  // Photo Vault
  {
    id: "TC-PHOTO-01",
    module: "Photo Vault",
    scenario: "Multi-gigabyte IndexedDB photo storage",
    steps: "Upload high-resolution photography files (> 10MB each).",
    expected: "Files persist directly in IndexedDB photo vault without quota errors.",
    criteria: "Zero degradation of original image resolution.",
    severity: "P1",
  },
  {
    id: "TC-PHOTO-02",
    module: "Photo Vault",
    scenario: "Search and category tag filtering",
    steps: "Type keyword into gallery search bar (e.g. 'Bus', 'Depot').",
    expected: "Gallery filters matching photos instantly with matching count.",
    criteria: "Zero UI freezing or lag during filtering.",
    severity: "P2",
  },
]

const BROWSER_MATRIX: BrowserMatrixItem[] = [
  {
    environment: "Desktop High-DPI",
    resolution: "1920 × 1080 / 2560 × 1440",
    browser: "Google Chrome / Edge",
    items: "Animated wave canvas, crisp SVG icons, modal height fit, print PDF dialog",
  },
  {
    environment: "Laptop Standard",
    resolution: "1366 × 768 / 1536 × 864",
    browser: "Chrome / Firefox",
    items: "Table horizontal scroll, modal dialog fit without overflow, lightbox controls",
  },
  {
    environment: "Tablet",
    resolution: "768 × 1024 (iPad Portrait)",
    browser: "Safari / Chrome Mobile",
    items: "Accordion touch toggle, dual-card stack responsiveness, pinch zoom canvas",
  },
  {
    environment: "Mobile Phone",
    resolution: "375 × 812 (iPhone / Android)",
    browser: "Mobile Safari / Chrome",
    items: "Public share link countdown wrap, 1-column layout, touch-friendly downloads",
  },
]

export default function HowToTestPage() {
  const [selectedModule, setSelectedModule] = React.useState("All Modules")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  // Filter test cases
  const filteredCases = React.useMemo(() => {
    return TEST_CASES.filter((tc) => {
      const matchesModule = selectedModule === "All Modules" || tc.module === selectedModule
      const query = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !query ||
        tc.id.toLowerCase().includes(query) ||
        tc.scenario.toLowerCase().includes(query) ||
        tc.steps.toLowerCase().includes(query) ||
        tc.expected.toLowerCase().includes(query) ||
        tc.module.toLowerCase().includes(query)
      return matchesModule && matchesQuery
    })
  }, [selectedModule, searchQuery])

  // Copy helper
  const copyToClipboard = (text: string, label: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success(`Copied ${label} to clipboard!`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Format full table as Markdown
  const copyAsMarkdownTable = (cases: TestCase[], title: string, id: string) => {
    let md = `### ${title}\n\n`
    md += `| Test ID | Module | Test Scenario | Steps to Execute | Expected Result | Pass/Fail Criteria | Severity |\n`
    md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`
    cases.forEach((tc) => {
      md += `| **${tc.id}** | ${tc.module} | ${tc.scenario} | ${tc.steps.replace(/\|/g, "-")} | ${tc.expected.replace(/\|/g, "-")} | ${tc.criteria.replace(/\|/g, "-")} | \`${tc.severity || "P2"}\` |\n`
    })
    copyToClipboard(md, `${title} (Markdown Table)`, id)
  }

  // Format full table as Excel/TSV
  const copyAsExcelTsv = (cases: TestCase[], title: string, id: string) => {
    let tsv = `Test ID\tModule\tTest Scenario\tSteps to Execute\tExpected Result\tPass/Fail Criteria\tSeverity\n`
    cases.forEach((tc) => {
      tsv += `${tc.id}\t${tc.module}\t${tc.scenario}\t${tc.steps}\t${tc.expected}\t${tc.criteria}\t${tc.severity || "P2"}\n`
    })
    copyToClipboard(tsv, `${title} (Excel / TSV Format)`, id)
  }

  // Copy Personas Table
  const copyPersonasTable = (asMarkdown: boolean) => {
    if (asMarkdown) {
      let md = `| Persona | Role | Default Permissions | Testing Focus |\n`
      md += `| :--- | :--- | :--- | :--- |\n`
      PERSONAS.forEach((p) => {
        md += `| **${p.persona}** | ${p.role} | ${p.permissions} | ${p.focus} |\n`
      })
      copyToClipboard(md, "User Personas (Markdown)", "personas-md")
    } else {
      let tsv = `Persona\tRole\tDefault Permissions\tTesting Focus\n`
      PERSONAS.forEach((p) => {
        tsv += `${p.persona}\t${p.role}\t${p.permissions}\t${p.focus}\n`
      })
      copyToClipboard(tsv, "User Personas (Excel / TSV)", "personas-tsv")
    }
  }

  // Copy Browser Matrix
  const copyBrowserMatrix = (asMarkdown: boolean) => {
    if (asMarkdown) {
      let md = `| Environment / Device | Screen Resolution | Target Browser | Critical Validation Items |\n`
      md += `| :--- | :--- | :--- | :--- |\n`
      BROWSER_MATRIX.forEach((b) => {
        md += `| **${b.environment}** | ${b.resolution} | ${b.browser} | ${b.items} |\n`
      })
      copyToClipboard(md, "Browser Matrix (Markdown)", "matrix-md")
    } else {
      let tsv = `Environment / Device\tScreen Resolution\tTarget Browser\tCritical Validation Items\n`
      BROWSER_MATRIX.forEach((b) => {
        tsv += `${b.environment}\t${b.resolution}\t${b.browser}\t${b.items}\n`
      })
      copyToClipboard(tsv, "Browser Matrix (Excel / TSV)", "matrix-tsv")
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-16 animate-in fade-in-50 text-left">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-[#4472C4]/5 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#4472C4]/15 border border-[#4472C4]/30 text-[#4472C4]">
              <ClipboardCheck className="h-4 w-4" />
              Official QA Testing Protocol &amp; Verification Matrix
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Portal End-to-End Testing Guide
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Exhaustive testing workflows, user journeys, pass/fail acceptance criteria, and one-click
              table copy utilities formatted for Excel, Markdown, and bug tracking systems.
            </p>
          </div>

          {/* Quick Copy Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              onClick={() => copyAsMarkdownTable(TEST_CASES, "Transvolt Complete Test Matrix", "global-md")}
              className="bg-[#4472C4] hover:bg-[#3460b0] text-white font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {copiedId === "global-md" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>Copy All (Markdown Table)</span>
            </Button>
            <Button
              onClick={() => copyAsExcelTsv(TEST_CASES, "Transvolt Complete Test Matrix", "global-tsv")}
              variant="outline"
              className="border-emerald-600/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-2 cursor-pointer"
            >
              {copiedId === "global-tsv" ? <Check className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />}
              <span>Copy for Excel (.tsv)</span>
            </Button>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/60">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Total Test Cases
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#4472C4] mt-1 block">
              {TEST_CASES.length} Cases
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Core Modules
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#548235] mt-1 block">
              10 Modules
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              User Personas
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 block">
              4 Roles
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              QR &amp; Offline
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
              100% Vector
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: User Personas Matrix */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#548235]/10 text-[#548235]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">1. User Personas &amp; Testing Roles</h2>
              <p className="text-xs text-muted-foreground">Verify permissions and UI visibility for each user type.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => copyPersonasTable(true)}
              variant="outline"
              size="sm"
              className="text-xs h-8 rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              {copiedId === "personas-md" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Copy Table (MD)</span>
            </Button>
            <Button
              onClick={() => copyPersonasTable(false)}
              variant="outline"
              size="sm"
              className="text-xs h-8 rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              {copiedId === "personas-tsv" ? <Check className="h-3.5 w-3.5" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
              <span>Copy for Excel</span>
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/70">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/80">
              <tr>
                <th className="p-3.5 font-bold">Persona</th>
                <th className="p-3.5 font-bold">Role</th>
                <th className="p-3.5 font-bold">Default Permissions</th>
                <th className="p-3.5 font-bold">Testing Focus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {PERSONAS.map((p, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5 font-bold text-foreground whitespace-nowrap">{p.persona}</td>
                  <td className="p-3.5 text-muted-foreground whitespace-nowrap">{p.role}</td>
                  <td className="p-3.5 text-muted-foreground">{p.permissions}</td>
                  <td className="p-3.5 text-foreground/90 font-medium">{p.focus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Complete Test Cases Matrix with Search & Filter */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4472C4]/10 text-[#4472C4]">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">2. Functional Test Cases by Module</h2>
              <p className="text-xs text-muted-foreground">
                Showing {filteredCases.length} of {TEST_CASES.length} test cases.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => copyAsMarkdownTable(filteredCases, `Test Cases (${selectedModule})`, "filtered-md")}
              variant="outline"
              size="sm"
              className="text-xs h-8 rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              {copiedId === "filtered-md" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Copy Filtered (MD)</span>
            </Button>
            <Button
              onClick={() => copyAsExcelTsv(filteredCases, `Test Cases (${selectedModule})`, "filtered-tsv")}
              variant="outline"
              size="sm"
              className="text-xs h-8 rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              {copiedId === "filtered-tsv" ? <Check className="h-3.5 w-3.5" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
              <span>Copy for Excel</span>
            </Button>
          </div>
        </div>

        {/* Filter Controls: Module Tabs & Search Input */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Module Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {MODULES.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedModule(m)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                  selectedModule === m
                    ? "bg-[#4472C4] text-white shadow-xs"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search test scenario, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>
        </div>

        {/* Master Test Table */}
        <div className="overflow-x-auto rounded-xl border border-border/70">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/80">
              <tr>
                <th className="p-3 font-bold w-24">Test ID</th>
                <th className="p-3 font-bold w-28">Module</th>
                <th className="p-3 font-bold w-48">Test Scenario</th>
                <th className="p-3 font-bold min-w-[220px]">Steps to Execute</th>
                <th className="p-3 font-bold min-w-[220px]">Expected Result</th>
                <th className="p-3 font-bold min-w-[200px]">Pass/Fail Criteria</th>
                <th className="p-3 font-bold w-16 text-center">Severity</th>
                <th className="p-3 font-bold w-16 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredCases.map((tc) => {
                const rowCopyText = `Test ID: ${tc.id}\nModule: ${tc.module}\nScenario: ${tc.scenario}\nSteps: ${tc.steps}\nExpected: ${tc.expected}\nCriteria: ${tc.criteria}\nSeverity: ${tc.severity || "P2"}`

                return (
                  <tr key={tc.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#4472C4] whitespace-nowrap">{tc.id}</td>
                    <td className="p-3 text-muted-foreground font-medium whitespace-nowrap">{tc.module}</td>
                    <td className="p-3 font-semibold text-foreground">{tc.scenario}</td>
                    <td className="p-3 text-muted-foreground leading-relaxed">{tc.steps}</td>
                    <td className="p-3 text-muted-foreground leading-relaxed">{tc.expected}</td>
                    <td className="p-3 text-foreground/90 font-medium leading-relaxed">{tc.criteria}</td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase",
                          tc.severity === "P0"
                            ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                            : tc.severity === "P1"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                        )}
                      >
                        {tc.severity || "P2"}
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => copyToClipboard(rowCopyText, tc.id, tc.id)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        title="Copy this test case"
                      >
                        {copiedId === tc.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Cross-Browser & Device Responsiveness Matrix */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">3. Device &amp; Browser Responsiveness Matrix</h2>
              <p className="text-xs text-muted-foreground">Viewport resolutions and device validation items.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => copyBrowserMatrix(true)}
              variant="outline"
              size="sm"
              className="text-xs h-8 rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              {copiedId === "matrix-md" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Copy Table (MD)</span>
            </Button>
            <Button
              onClick={() => copyBrowserMatrix(false)}
              variant="outline"
              size="sm"
              className="text-xs h-8 rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              {copiedId === "matrix-tsv" ? <Check className="h-3.5 w-3.5" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
              <span>Copy for Excel</span>
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/70">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/80">
              <tr>
                <th className="p-3.5 font-bold">Environment / Device</th>
                <th className="p-3.5 font-bold">Screen Resolution</th>
                <th className="p-3.5 font-bold">Target Browser</th>
                <th className="p-3.5 font-bold">Critical Validation Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {BROWSER_MATRIX.map((b, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5 font-bold text-foreground whitespace-nowrap">{b.environment}</td>
                  <td className="p-3.5 text-muted-foreground whitespace-nowrap font-mono">{b.resolution}</td>
                  <td className="p-3.5 text-muted-foreground whitespace-nowrap">{b.browser}</td>
                  <td className="p-3.5 text-foreground/90 font-medium">{b.items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: Defect Severity & Classification Guide */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/70">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">4. Defect Severity &amp; Priority Classification</h2>
            <p className="text-xs text-muted-foreground">Standard definitions for logging portal defects during UAT.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-1.5">
            <Badge className="bg-red-500 text-white font-extrabold text-[10px]">P0 - Blocker</Badge>
            <h3 className="font-bold text-sm text-foreground">Security &amp; Availability</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Login broken, public share link returns 404/500 to guests, QR code unscannable, data loss on save.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1.5">
            <Badge className="bg-amber-500 text-white font-extrabold text-[10px]">P1 - Critical</Badge>
            <h3 className="font-bold text-sm text-foreground">Core Functionality</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Asset download fails, ZIP corrupted, role permissions bypassed, Print PDF layout misalignment.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-1.5">
            <Badge className="bg-blue-500 text-white font-extrabold text-[10px]">P2 - Medium</Badge>
            <h3 className="font-bold text-sm text-foreground">UI / UX Degradation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Spacing flaws, typography misalignment, canvas wave animation jitter, timer offset by &gt; 1 minute.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-1.5">
            <Badge variant="outline" className="font-extrabold text-[10px]">P3 - Low</Badge>
            <h3 className="font-bold text-sm text-foreground">Cosmetic &amp; Minor</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Minor copy typos, subtle hover state color difference, tooltip delay timing adjustments.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
