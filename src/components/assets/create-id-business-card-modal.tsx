"use client"

import * as React from "react"
import { X, Upload, ChevronDown, ChevronUp, Edit3, Share2, Printer, Check, Copy, ExternalLink, QrCode, ZoomIn, ZoomOut, RotateCcw, Hand, Trash2, Sparkles, Scan, Loader2, CheckCircle2, BrainCircuit, Minus } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IdCardRecord } from "./id-cards-table"
import { CandidateInfo, CompanyRegularInfo, generateCardPrintHtml, generateVCardString, generateVCardQrUrl } from "@/lib/cards/card-print-utils"
import { extractCandidateFromImage } from "@/lib/cards/card-ocr-utils"
import { useCompanyMaster } from "@/lib/company-master/company-master-context"

interface CreateIdBusinessCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (record: IdCardRecord) => void
  onDelete?: (id: string, name: string) => void
  initialData?: IdCardRecord | null
}

const DEFAULT_COMPANY_INFO: CompanyRegularInfo = {
  companyFullName: "Transvolt Mobility Private Limited",
  companyAddress: "5th Floor, “A” Wing, Trade Link, Kamala Mills Compound, Lower Parel, Mumbai - 400013.",
  companyContact: "+91 8657 000 732",
  companyEmail: "info@transvolt.in",
  companyWebsite: "www.transvolt.in",
  companyLogoSvg: "/logos/Logo_Black.svg",
}

const DEFAULT_COMPANY_OPTIONS: string[] = [
  "Transvolt Mobility Private Limited",
  "Transvolt Energy Private Limited",
]

export function CreateIdBusinessCardModal({
  open,
  onOpenChange,
  onSave,
  onDelete,
  initialData,
}: CreateIdBusinessCardModalProps) {
  // Candidate form state
  const [candidate, setCandidate] = React.useState<CandidateInfo>({
    fullName: "",
    designation: "",
    email: "",
    contact: "",
    emrContact: "",
    bloodGroup: "O+",
    employeeId: "",
    company: "Transvolt Mobility Private Limited",
    siteLocation: "MBMT",
    photoUrl: "",
  })

  // Status state for candidate (working | hold | consultant | resigned)
  const [status, setStatus] = React.useState<"working" | "hold" | "consultant" | "resigned">("working")

  // Company regular information state
  const [companyInfo, setCompanyInfo] = React.useState<CompanyRegularInfo>(DEFAULT_COMPANY_INFO)
  const [showRegularInfo, setShowRegularInfo] = React.useState(false)

  // Preview tab: "id" | "business"
  const [previewTab, setPreviewTab] = React.useState<"id" | "business">("id")

  // Zoom & Pan state for Card Preview canvas
  const [zoom, setZoom] = React.useState<number>(1)
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState<boolean>(false)
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setZoom((prev) => Math.min(3.0, +(prev + 0.25).toFixed(2)))
  }

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setZoom((prev) => Math.max(0.6, +(prev - 0.25).toFixed(2)))
  }

  const handleResetZoomPan = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const delta = -e.deltaY * 0.0015
    setZoom((prev) => Math.min(3.0, Math.max(0.6, +(prev + delta).toFixed(2))))
  }

  const switchPreviewTab = (tab: "id" | "business") => {
    setPreviewTab(tab)
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Helper: Title Case (First Letter Caps Only)
  const toTitleCase = (str: string): string => {
    if (!str) return ""
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Photo upload ref
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const logoInputRef = React.useRef<HTMLInputElement>(null)
  const ocrFileInputRef = React.useRef<HTMLInputElement>(null)

  // Smart Image OCR scanning state
  const [isScanning, setIsScanning] = React.useState(false)
  const [scanStep, setScanStep] = React.useState("")
  const [scanProgress, setScanProgress] = React.useState(0)
  const [scanImagePreview, setScanImagePreview] = React.useState<string | null>(null)
  const [detectedFields, setDetectedFields] = React.useState<string[]>([])
  const [showAiKeyModal, setShowAiKeyModal] = React.useState(false)
  const [geminiApiKey, setGeminiApiKey] = React.useState("")
  const [keyInput, setKeyInput] = React.useState("")

  const { getUniqueCompanyNames, getUniqueSiteLocations, getSitesForCompany, addCompany, isCompanyOnHold, isSiteOnHold } = useCompanyMaster()

  // Saved companies list state (persisted in localStorage)
  const [companiesList, setCompaniesList] = React.useState<string[]>(DEFAULT_COMPANY_OPTIONS)
  const [showCompanyDropdown, setShowCompanyDropdown] = React.useState(false)
  const companyDropdownRef = React.useRef<HTMLDivElement>(null)

  // Saved locations list state (persisted in localStorage)
  const DEFAULT_LOCATION_OPTIONS = ["MBMT", "Mumbai HQ", "Pune Hub", "Delhi NCR Depot", "Bengaluru Plant", "Hyderabad Hub"]
  const [locationsList, setLocationsList] = React.useState<string[]>(DEFAULT_LOCATION_OPTIONS)
  const [showLocationDropdown, setShowLocationDropdown] = React.useState(false)
  const locationDropdownRef = React.useRef<HTMLDivElement>(null)

  // Synchronized lists from Company Master
  const masterCompanies = getUniqueCompanyNames("id-business-cards")
  const masterLocations = getUniqueSiteLocations(candidate.company, "id-business-cards")

  const activeCompanyList = React.useMemo(() => {
    const combined = Array.from(new Set([...masterCompanies, ...companiesList]))
    return combined.filter((c) => !isCompanyOnHold(c))
  }, [masterCompanies, companiesList, isCompanyOnHold])

  const activeLocationsList = React.useMemo(() => {
    const combined = Array.from(new Set([...masterLocations, ...locationsList]))
    return combined.filter((loc) => !isSiteOnHold(candidate.company, loc))
  }, [masterLocations, locationsList, isSiteOnHold, candidate.company])

  // Load saved company list from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("transvolt_company_options")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCompaniesList(parsed)
            // Default new-form company to the last saved company
            if (!initialData) {
              setCandidate((prev) => ({ ...prev, company: parsed[parsed.length - 1] }))
            }
          }
        }
      } catch (e) {
        console.error("Failed to load company options", e)
      }

      // Load saved locations list
      try {
        const savedLoc = localStorage.getItem("transvolt_location_options")
        if (savedLoc) {
          const parsedLoc = JSON.parse(savedLoc)
          if (Array.isArray(parsedLoc) && parsedLoc.length > 0) {
            setLocationsList(parsedLoc)
            // Default new-form location to the last saved location
            if (!initialData) {
              setCandidate((prev) => ({ ...prev, siteLocation: parsedLoc[parsedLoc.length - 1] }))
            }
          }
        }
      } catch (e) {
        console.error("Failed to load location options", e)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close company dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(e.target as Node)) {
        setShowCompanyDropdown(false)
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const saveCompanyList = (newList: string[]) => {
    setCompaniesList(newList)
    try {
      localStorage.setItem("transvolt_company_options", JSON.stringify(newList))
    } catch (e) {
      console.error("Failed to persist company options", e)
    }
  }

  const handleRemoveCompany = (companyToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const updated = companiesList.filter((c) => c !== companyToRemove)
    saveCompanyList(updated)
    toast.info(`Removed "${companyToRemove}" from company list`)
  }

  const handleSelectCompany = (companyName: string) => {
    const sites = getSitesForCompany(companyName)
    setCandidate((prev) => ({
      ...prev,
      company: companyName,
      siteLocation: sites.length > 0 ? sites[0] : prev.siteLocation,
    }))
    setShowCompanyDropdown(false)
  }

  const handleAddNewCompany = () => {
    const trimmed = candidate.company.trim()
    if (!trimmed) return
    if (!companiesList.includes(trimmed)) {
      const updated = [...companiesList, trimmed]
      saveCompanyList(updated)
      toast.success(`Added "${trimmed}" to company list!`)
    }
    setShowCompanyDropdown(false)
  }

  // Location list helpers
  const saveLocationList = (newList: string[]) => {
    setLocationsList(newList)
    try {
      localStorage.setItem("transvolt_location_options", JSON.stringify(newList))
    } catch (e) {
      console.error("Failed to persist location options", e)
    }
  }

  const handleRemoveLocation = (locToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const updated = locationsList.filter((l) => l !== locToRemove)
    saveLocationList(updated)
    toast.info(`Removed "${locToRemove}" from location list`)
  }

  const handleSelectLocation = (locName: string) => {
    setCandidate((prev) => ({ ...prev, siteLocation: locName }))
    setShowLocationDropdown(false)
  }

  const handleAddNewLocation = () => {
    const trimmed = candidate.siteLocation.trim()
    if (!trimmed) return
    if (!locationsList.includes(trimmed)) {
      const updated = [...locationsList, trimmed]
      saveLocationList(updated)
      toast.success(`Added "${trimmed}" to location list!`)
    }
    setShowLocationDropdown(false)
  }

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("transvolt_gemini_api_key") || ""
      setGeminiApiKey(saved)
      setKeyInput(saved)
    }
  }, [])

  // Initialize data when editing or opening
  React.useEffect(() => {
    if (initialData) {
      const normStatus = (initialData.status === "approved" ? "working" : initialData.status) || "working"
      setStatus(normStatus as any)
      setCandidate({
        fullName: initialData.name,
        designation: initialData.designation,
        email: initialData.email,
        contact: initialData.contact,
        emrContact: initialData.emrContact,
        bloodGroup: initialData.bloodGroup,
        employeeId: initialData.employeeId || `TV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        company: initialData.company,
        siteLocation: initialData.siteLocation,
        photoUrl: "",
      })
    } else {
      setStatus("working")
      // Use last saved company from localStorage for new form default
      let defaultCompany = companiesList[companiesList.length - 1] || "Transvolt Mobility Private Limited"
      try {
        const saved = typeof window !== "undefined" && localStorage.getItem("transvolt_company_options")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            defaultCompany = parsed[parsed.length - 1]
          }
        }
      } catch (_) { /* ignore */ }
      setCandidate({
        fullName: "",
        designation: "",
        email: "",
        contact: "",
        emrContact: "",
        bloodGroup: "O+",
        employeeId: `TV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        company: defaultCompany,
        siteLocation: "MBMT",
        photoUrl: "",
      })
    }
  }, [initialData, open])

  // Format phone number live as +91 0000 000 000 (4-3-3 pattern)
  const formatPhoneNumberInput = (val: string): string => {
    if (!val) return ""
    const trimmed = val.trim()
    if (trimmed === "+" || trimmed === "+91" || trimmed === "+91 ") {
      return ""
    }
    const digits = val.replace(/\D/g, "")
    if (!digits) return ""
    if (digits === "91" && !trimmed.startsWith("+91 ")) {
      return ""
    }

    let cc = "91"
    let national = digits

    if (trimmed.startsWith("+00")) {
      cc = "00"
      national = digits.startsWith("00") ? digits.slice(2) : digits
    } else if (digits.startsWith("91") && digits.length > 2) {
      cc = "91"
      national = digits.slice(2)
    } else if (digits.length > 10) {
      cc = digits.slice(0, digits.length - 10)
      national = digits.slice(digits.length - 10)
    } else {
      cc = "91"
      national = digits
    }

    national = national.slice(0, 10)
    const parts: string[] = []
    if (national.length > 0) parts.push(national.slice(0, 4))
    if (national.length > 4) parts.push(national.slice(4, 7))
    if (national.length > 7) parts.push(national.slice(7, 10))

    return parts.length > 0 ? `+${cc} ${parts.join(" ")}` : `+${cc}`
  }

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCandidate((prev) => ({ ...prev, photoUrl: event.target?.result as string }))
        toast.success("Photo uploaded successfully!")
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle Smart "Upload Image" with animated OCR & QR extraction
  const handleOcrImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const tempUrl = URL.createObjectURL(file)
    setScanImagePreview(tempUrl)
    setIsScanning(true)
    setScanProgress(12)
    setScanStep("Initializing smart image scanner...")
    setDetectedFields([])

    try {
      const startTime = Date.now()

      const extracted = await extractCandidateFromImage(file, (step, percent) => {
        setScanStep(step)
        setScanProgress(percent)

        if (percent >= 30) setDetectedFields((prev) => Array.from(new Set([...prev, "QR Code"])))
        if (percent >= 60) setDetectedFields((prev) => Array.from(new Set([...prev, "QR Code", "Contact & Email"])))
        if (percent >= 80) setDetectedFields((prev) => Array.from(new Set([...prev, "QR Code", "Contact & Email", "Name & Role", "Employee ID"])))
      })

      // Minimum smooth animation delay for high-tech feeling
      const elapsed = Date.now() - startTime
      if (elapsed < 1600) {
        await new Promise((r) => setTimeout(r, 1600 - elapsed))
      }

      setScanProgress(100)
      setScanStep("All candidate credentials captured successfully!")
      setDetectedFields(["QR Code", "Full Name", "Designation", "Contact No.", "Email", "Employee ID", "Blood Group", "Site Location"])

      await new Promise((r) => setTimeout(r, 550))

      // Update candidate details in state
      setCandidate((prev) => ({
        ...prev,
        fullName: extracted.fullName || prev.fullName,
        designation: extracted.designation || prev.designation,
        email: extracted.email || prev.email,
        contact: extracted.contact || prev.contact,
        emrContact: extracted.emrContact || prev.emrContact,
        bloodGroup: extracted.bloodGroup || prev.bloodGroup,
        employeeId: extracted.employeeId || prev.employeeId,
        company: extracted.company || prev.company,
        siteLocation: extracted.siteLocation || prev.siteLocation,
        photoUrl: prev.photoUrl, // Keep Profile Picture untouched/empty (information image is not profile photo)
      }))

      toast.success("Candidate information successfully captured from image!")
    } catch (err: any) {
      console.error("OCR Extraction failed:", err)
      toast.error(`Image scan failed: ${err?.message || "Could not read text from image"}`)
    } finally {
      setIsScanning(false)
      setScanImagePreview(null)
      if (e.target) e.target.value = ""
    }
  }

  // Handle Logo SVG Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCompanyInfo((prev) => ({ ...prev, companyLogoSvg: event.target?.result as string }))
        toast.success("Custom Logo SVG uploaded!")
      }
      reader.readAsDataURL(file)
    }
  }

  // Generate QR Code URL
  const qrCodeUrl = React.useMemo(() => {
    const vCard = generateVCardString(candidate, companyInfo)
    return generateVCardQrUrl(vCard)
  }, [candidate, companyInfo])

  // Generate PDF (Open in New Chrome Tab)
  const handleGeneratePdf = (type: "both" | "id" | "business") => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast.error("Please allow popups to open the print preview.")
      return
    }
    const htmlContent = generateCardPrintHtml(candidate, companyInfo, type, window.location.origin)
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    toast.success(`Generated ${type === "both" ? "BOTH CARDS" : type === "id" ? "ID CARD" : "BUSINESS CARD"} PDF ready in new tab!`)
  }

  // Share PDF (7-Hour Secure Link)
  const handleSharePdf = (type: "both" | "id" | "business") => {
    const shareId = `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const now = Date.now()

    // Store share data and timestamp in localStorage
    try {
      localStorage.setItem(`branding_share_card_${shareId}_time`, now.toString())
      localStorage.setItem(
        `branding_share_card_${shareId}_data`,
        JSON.stringify({ candidate, company: companyInfo })
      )
    } catch (e) {
      console.error("Storage error", e)
    }

    const shareUrl = `${window.location.origin}/share/card/${shareId}?type=${type}&t=${now}`
    navigator.clipboard.writeText(shareUrl)

    toast.success("7-Hour Secure Share link copied to clipboard!", {
      description: "Link remains valid for 7 hours only.",
      action: {
        label: "Open Link",
        onClick: () => window.open(shareUrl, "_blank"),
      },
    })
  }

  // Handle Save
  const handleSave = () => {
    if (!candidate.fullName) {
      toast.error("Please enter Candidate Full Name.")
      return
    }

    // Automatically persist company to Company Master if company & site exist
    if (candidate.company && candidate.siteLocation) {
      addCompany(candidate.company.trim(), candidate.siteLocation.trim())
    }

    const newRecord: IdCardRecord = {
      id: initialData?.id || `id-${Date.now()}`,
      employeeId: candidate.employeeId || `TV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      name: candidate.fullName,
      designation: candidate.designation || "Executive",
      company: candidate.company || companyInfo.companyFullName,
      email: candidate.email || "info@transvolt.in",
      contact: candidate.contact || "+91 0000 000 000",
      emrContact: candidate.emrContact || candidate.contact || "+91 0000 000 000",
      bloodGroup: candidate.bloodGroup || "O+",
      siteLocation: candidate.siteLocation || "MBMT",
      cardType: "both",
      status: initialData ? status : "working",
      joiningDate: initialData?.joiningDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    }

    onSave(newRecord)
    onOpenChange(false)
    toast.success(`"${newRecord.name}" credentials saved!`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-5xl md:max-w-6xl w-[96vw] max-h-[92vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-5">
          <DialogTitle className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {initialData ? "Candidate Credentials & Cards" : "Create ID & Business Card"}
          </DialogTitle>
          <DialogClose className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </DialogClose>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* =========================================
              LEFT COLUMN: Form Inputs
             ========================================= */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/60">
              <h3 className="text-sm font-extrabold text-[#548235] uppercase tracking-wider">
                {initialData ? "Candidate Information" : "Add Candidate Information"}
              </h3>

              {/* Smart "Upload Image" Button & AI Vision Key Configuration */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => ocrFileInputRef.current?.click()}
                  disabled={isScanning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#548235] to-[#43672a] hover:from-[#43672a] hover:to-[#365322] text-white text-xs font-bold shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer select-none disabled:opacity-50"
                  title="Upload handwritten form, ID card, or business card image to auto-extract details"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                  <span>Upload Image</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAiKeyModal(true)}
                  className={`p-1.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                    geminiApiKey
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-border/80 bg-background hover:bg-muted text-muted-foreground"
                  }`}
                  title={geminiApiKey ? "AI Vision Active (Click to view/change Gemini Key)" : "Handwriting AI: Click to add free Google Gemini API Key"}
                >
                  <BrainCircuit className="h-3.5 w-3.5" />
                </button>

                <input
                  type="file"
                  ref={ocrFileInputRef}
                  onChange={handleOcrImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Extra Status Buttons for Existing Candidate Form ONLY */}
            {initialData && (
              <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/80 space-y-2 select-none shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground/85 flex items-center gap-1.5">
                    Status:
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    status === "working"
                      ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                      : status === "hold"
                      ? "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30"
                      : status === "consultant"
                      ? "text-purple-700 dark:text-purple-400 bg-purple-500/10 border-purple-500/30"
                      : "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/30"
                  }`}>
                    {status === "working" ? "Working" : status === "hold" ? "Hold" : status === "consultant" ? "Consultant" : "Resigned"}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus("working")}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                      status === "working"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-500"
                        : "bg-background hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-border/80"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${status === "working" ? "bg-white" : "bg-emerald-500"}`} />
                    <span>Working</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("hold")}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                      status === "hold"
                        ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 border border-amber-500"
                        : "bg-background hover:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-border/80"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${status === "hold" ? "bg-white" : "bg-amber-500"}`} />
                    <span>Hold</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("consultant")}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                      status === "consultant"
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-500"
                        : "bg-background hover:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-border/80"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${status === "consultant" ? "bg-white" : "bg-purple-500"}`} />
                    <span>Consultant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("resigned")}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                      status === "resigned"
                        ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 border border-rose-500"
                        : "bg-background hover:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-border/80"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${status === "resigned" ? "bg-white" : "bg-rose-500"}`} />
                    <span>Resigned</span>
                  </button>
                </div>
              </div>
            )}

            {/* Photo + Name / Designation Row */}
            <div className="grid grid-cols-12 gap-3.5">
              {/* Photo Upload Box */}
              <div className="col-span-4 flex flex-col">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="h-[120px] rounded-xl border border-border/80 bg-muted/40 hover:bg-muted/70 transition-all flex flex-col items-center justify-center p-2 text-center cursor-pointer relative overflow-hidden group shadow-xs"
                >
                  {candidate.photoUrl ? (
                    <>
                      <img
                        src={candidate.photoUrl}
                        alt="Photo Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        Change
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                      <div className="h-7 w-7 rounded-full bg-background border border-border flex items-center justify-center">
                        <Upload className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[11px] font-semibold text-foreground/80">Upload Photo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Full Name & Designation */}
              <div className="col-span-8 space-y-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground/80">Full Name</label>
                  <Input
                    placeholder="Ex. Jordan Jackson"
                    value={candidate.fullName}
                    onChange={(e) => setCandidate({ ...candidate, fullName: e.target.value })}
                    className="h-10 text-xs rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground/80">Designation/Title</label>
                  <Input
                    placeholder="Ex. Senior HR"
                    value={candidate.designation}
                    onChange={(e) => setCandidate({ ...candidate, designation: e.target.value })}
                    className="h-10 text-xs rounded-xl bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground/80">Email</label>
              <Input
                type="email"
                placeholder="name@transvolt.in"
                value={candidate.email}
                onChange={(e) => setCandidate({ ...candidate, email: e.target.value })}
                className="h-10 text-xs rounded-xl bg-background"
              />
            </div>

            {/* Contact No. & Emr. Contact No. - Auto Formatted with 4-3-3 spacing */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground/80">Contact No.</label>
                <Input
                  placeholder="+91 0000 000 000"
                  value={candidate.contact}
                  onChange={(e) => setCandidate({ ...candidate, contact: formatPhoneNumberInput(e.target.value) })}
                  className="h-10 text-xs rounded-xl bg-background font-medium tracking-wide"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground/80">Emr. Contact No.</label>
                <Input
                  placeholder="+91 0000 000 000"
                  value={candidate.emrContact}
                  onChange={(e) => setCandidate({ ...candidate, emrContact: formatPhoneNumberInput(e.target.value) })}
                  className="h-10 text-xs rounded-xl bg-background font-medium tracking-wide"
                />
              </div>
            </div>

            {/* Blood Group & Employee ID */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground/80">Blood Group</label>
                <Input
                  placeholder="Ex. AB+"
                  value={candidate.bloodGroup}
                  onChange={(e) => setCandidate({ ...candidate, bloodGroup: e.target.value })}
                  className="h-10 text-xs rounded-xl bg-background"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground/80">Employee ID</label>
                <Input
                  placeholder="Ex. TMPL00000"
                  value={candidate.employeeId}
                  onChange={(e) => setCandidate({ ...candidate, employeeId: e.target.value })}
                  className="h-10 text-xs rounded-xl bg-background font-medium tracking-wide"
                />
              </div>
            </div>

            {/* Company & Site/Location Dropdowns */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground/80">Company</label>
                  <span className="text-[10px] text-muted-foreground/80">Type or select</span>
                </div>
                <div className="relative" ref={companyDropdownRef}>
                  <div className="relative flex items-center">
                    <Input
                      type="text"
                      placeholder="Type or select company..."
                      value={candidate.company}
                      onChange={(e) => {
                        setCandidate({ ...candidate, company: e.target.value })
                        setShowCompanyDropdown(true)
                      }}
                      onFocus={() => setShowCompanyDropdown(true)}
                      className="h-10 text-xs rounded-xl bg-background pr-9 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCompanyDropdown((prev) => !prev)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors rounded-lg"
                      title="Select existing company"
                      tabIndex={-1}
                    >
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          showCompanyDropdown ? "rotate-180 text-foreground" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Dropdown Menu of Existing Companies */}
                  {showCompanyDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                      {/* Header */}
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 flex items-center justify-between bg-muted/30 sticky top-0">
                        <span>All Companies</span>
                        <span className="text-[9.5px] font-normal lowercase text-muted-foreground/70">
                          {activeCompanyList.length} saved
                        </span>
                      </div>

                      {/* Scrollable list — shows 5 rows minimum (~36px each), scrolls beyond */}
                      <div
                        className="overflow-y-auto"
                        style={{
                          minHeight: `${Math.min(companiesList.length, 5) * 36}px`,
                          maxHeight: `${5 * 36}px`,
                        }}
                      >
                        <div className="p-1 space-y-0.5">
                          {/* Create new company button — only shown when typed text isn't already in the list */}
                          {(() => {
                            const trimmed = candidate.company.trim()
                            const isExactMatch = companiesList.some(
                              (c) => c.toLowerCase() === trimmed.toLowerCase()
                            )
                            if (trimmed && !isExactMatch) {
                              return (
                                <button
                                  type="button"
                                  onClick={handleAddNewCompany}
                                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-[#548235] hover:bg-[#548235]/10 text-left transition-colors cursor-pointer border border-dashed border-[#548235]/30 mb-1"
                                >
                                  <span className="truncate">+ Create &quot;{trimmed}&quot;</span>
                                  <span className="text-[9.5px] uppercase font-bold bg-[#548235]/15 px-1.5 py-0.5 rounded text-[#548235]">
                                    New
                                  </span>
                                </button>
                              )
                            }
                            return null
                          })()}

                          {/* Full company list — always rendered; filtered only when user has typed */}
                          {(() => {
                            const trimmed = candidate.company.trim()
                            // When user typed something that exactly matches an item OR typed nothing,
                            // show all items. Otherwise filter to matching items so user can browse.
                            const showAll = !trimmed || activeCompanyList.some(
                              (c) => c.toLowerCase() === trimmed.toLowerCase()
                            )
                            const list = showAll
                              ? activeCompanyList
                              : activeCompanyList.filter((c) =>
                                  c.toLowerCase().includes(trimmed.toLowerCase())
                                )

                            if (list.length === 0) {
                              return (
                                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                                  No companies saved yet. Type a name &amp; click &quot;Create&quot; to add.
                                </div>
                              )
                            }

                            return list.map((comp) => (
                              <div
                                key={comp}
                                onClick={() => handleSelectCompany(comp)}
                                className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                                  candidate.company.trim() === comp
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "hover:bg-muted text-foreground/90"
                                }`}
                                style={{ height: "36px" }}
                              >
                                <div className="flex items-center gap-2 truncate pr-2">
                                  {candidate.company.trim() === comp && (
                                    <Check className="h-3.5 w-3.5 text-[#548235] shrink-0" />
                                  )}
                                  <span className="truncate">{comp}</span>
                                </div>

                                {/* Minus — remove from saved list */}
                                <button
                                  type="button"
                                  onClick={(e) => handleRemoveCompany(comp, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-500/15 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-all shrink-0 cursor-pointer"
                                  title={`Remove "${comp}" from list`}
                                >
                                  <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            ))
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground/80">Site/Location</label>
                  <span className="text-[10px] text-muted-foreground/80">Type or select</span>
                </div>
                <div className="relative" ref={locationDropdownRef}>
                  <div className="relative flex items-center">
                    <Input
                      type="text"
                      placeholder="Type or select location..."
                      value={candidate.siteLocation}
                      onChange={(e) => {
                        setCandidate({ ...candidate, siteLocation: e.target.value })
                        setShowLocationDropdown(true)
                      }}
                      onFocus={() => setShowLocationDropdown(true)}
                      className="h-10 text-xs rounded-xl bg-background pr-9 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLocationDropdown((prev) => !prev)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors rounded-lg"
                      title="Select existing location"
                      tabIndex={-1}
                    >
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          showLocationDropdown ? "rotate-180 text-foreground" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Location Dropdown */}
                  {showLocationDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                      {/* Header */}
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 flex items-center justify-between bg-muted/30 sticky top-0">
                        <span>All Locations</span>
                        <span className="text-[9.5px] font-normal lowercase text-muted-foreground/70">
                          {activeLocationsList.length} saved
                        </span>
                      </div>

                      {/* Scrollable list — shows 5 rows min, scrolls beyond */}
                      <div
                        className="overflow-y-auto"
                        style={{
                          minHeight: `${Math.min(locationsList.length, 5) * 36}px`,
                          maxHeight: `${5 * 36}px`,
                        }}
                      >
                        <div className="p-1 space-y-0.5">
                          {/* Create new location button */}
                          {(() => {
                            const trimmed = candidate.siteLocation.trim()
                            const isExact = locationsList.some(
                              (l) => l.toLowerCase() === trimmed.toLowerCase()
                            )
                            if (trimmed && !isExact) {
                              return (
                                <button
                                  type="button"
                                  onClick={handleAddNewLocation}
                                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-[#548235] hover:bg-[#548235]/10 text-left transition-colors cursor-pointer border border-dashed border-[#548235]/30 mb-1"
                                >
                                  <span className="truncate">+ Create &quot;{trimmed}&quot;</span>
                                  <span className="text-[9.5px] uppercase font-bold bg-[#548235]/15 px-1.5 py-0.5 rounded text-[#548235]">
                                    New
                                  </span>
                                </button>
                              )
                            }
                            return null
                          })()}

                          {/* Full location list */}
                          {(() => {
                            const trimmed = candidate.siteLocation.trim()
                            const showAll = !trimmed || activeLocationsList.some(
                              (l) => l.toLowerCase() === trimmed.toLowerCase()
                            )
                            const list = showAll
                              ? activeLocationsList
                              : activeLocationsList.filter((l) =>
                                  l.toLowerCase().includes(trimmed.toLowerCase())
                                )

                            if (list.length === 0) {
                              return (
                                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                                  No locations saved. Type a name &amp; click &quot;Create&quot; to add.
                                </div>
                              )
                            }

                            return list.map((loc) => (
                              <div
                                key={loc}
                                onClick={() => handleSelectLocation(loc)}
                                className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                                  candidate.siteLocation.trim() === loc
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "hover:bg-muted text-foreground/90"
                                }`}
                                style={{ height: "36px" }}
                              >
                                <div className="flex items-center gap-2 truncate pr-2">
                                  {candidate.siteLocation.trim() === loc && (
                                    <Check className="h-3.5 w-3.5 text-[#548235] shrink-0" />
                                  )}
                                  <span className="truncate">{loc}</span>
                                </div>

                                {/* Minus — remove from saved list */}
                                <button
                                  type="button"
                                  onClick={(e) => handleRemoveLocation(loc, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-500/15 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-all shrink-0 cursor-pointer"
                                  title={`Remove "${loc}" from list`}
                                >
                                  <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            ))
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Accordion Toggle: Update Regular Information */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowRegularInfo(!showRegularInfo)}
                className="w-full py-2.5 px-4 rounded-xl bg-muted/60 hover:bg-muted/90 text-xs font-bold text-foreground/80 flex items-center justify-center gap-2 transition-all cursor-pointer border border-border/60 select-none shadow-xs"
              >
                <span>{showRegularInfo ? "Close Update Regular Information" : "Update Regular Information"}</span>
                {showRegularInfo ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Expandable Regular Information Box (Form1 Expanded) */}
            {showRegularInfo && (
              <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-3 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-border">
                  <span className="text-xs font-bold text-[#548235] uppercase tracking-wider">
                    Update Regular Information
                  </span>
                  <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-8 space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground/70">Company Full Name</label>
                      <Input
                        value={companyInfo.companyFullName}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, companyFullName: e.target.value })}
                        className="h-9 text-xs rounded-lg bg-background"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground/70">Company Address</label>
                      <Input
                        value={companyInfo.companyAddress}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, companyAddress: e.target.value })}
                        className="h-9 text-xs rounded-lg bg-background text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Upload Logo SVG */}
                  <div className="col-span-4 flex flex-col justify-end">
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      accept=".svg,image/svg+xml"
                      className="hidden"
                    />
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="h-[80px] rounded-xl border border-border/80 bg-muted/40 hover:bg-muted/70 transition-all flex flex-col items-center justify-center p-2 text-center cursor-pointer shadow-xs"
                    >
                      <Upload className="h-3.5 w-3.5 text-muted-foreground mb-1" />
                      <span className="text-[10px] font-bold text-foreground/80">Upload Logo SVG</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground/70">Company Contact Number</label>
                  <Input
                    placeholder="+91 8657 000 732"
                    value={companyInfo.companyContact}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, companyContact: formatPhoneNumberInput(e.target.value) })}
                    className="h-9 text-xs rounded-lg bg-background font-medium tracking-wide"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground/70">Company Email</label>
                  <Input
                    value={companyInfo.companyEmail}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, companyEmail: e.target.value })}
                    className="h-9 text-xs rounded-lg bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground/70">Company Website</label>
                  <Input
                    value={companyInfo.companyWebsite}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, companyWebsite: e.target.value })}
                    className="h-9 text-xs rounded-lg bg-background font-medium tracking-wide"
                  />
                </div>
              </div>
            )}
          </div>

          {/* =========================================
              RIGHT COLUMN: Live Preview & Action Buttons
             ========================================= */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Animated Segmented Preview Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b6fb6] shadow-[0_0_8px_rgba(59,111,182,0.9)] animate-pulse" />
                  <span className="text-xs font-bold text-foreground/80 tracking-wide">Preview:</span>
                </div>

                <div className="relative flex items-center p-1 rounded-full bg-muted/80 dark:bg-muted/50 backdrop-blur-md border border-border/70 shadow-xs select-none">
                  {/* Glowing Sliding Background Indicator */}
                  <span
                    className={`absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-[#3b6fb6] via-[#4472c4] to-[#4884d6] shadow-[0_2px_12px_rgba(59,111,182,0.4)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                      previewTab === "id"
                        ? "left-1 w-[96px]"
                        : "left-[101px] w-[142px]"
                    }`}
                  />

                  {/* ID Card Tab Button */}
                  <button
                    type="button"
                    onClick={() => switchPreviewTab("id")}
                    className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 w-[96px] rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer select-none active:scale-95 group ${
                      previewTab === "id"
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`w-3.5 h-3.5 shrink-0 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round transition-transform duration-300 group-hover:scale-110 ${
                        previewTab === "id" ? "scale-105" : ""
                      }`}
                    >
                      <rect x="5" y="3" width="14" height="18" rx="2" />
                      <circle cx="12" cy="10" r="2.5" />
                      <line x1="8" y1="16" x2="16" y2="16" />
                    </svg>
                    <span className="whitespace-nowrap tracking-tight">ID Card</span>
                  </button>

                  {/* Business Card Tab Button */}
                  <button
                    type="button"
                    onClick={() => switchPreviewTab("business")}
                    className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 w-[142px] rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer select-none active:scale-95 group ${
                      previewTab === "business"
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`w-3.5 h-3.5 shrink-0 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round transition-transform duration-300 group-hover:scale-110 ${
                        previewTab === "business" ? "scale-105" : ""
                      }`}
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <circle cx="7" cy="15" r="1" />
                    </svg>
                    <span className="whitespace-nowrap tracking-tight">Business Card</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Preview Box with Zoom & Pan */}
            <div
              className={`relative p-3 sm:p-4 rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 flex flex-col items-center justify-center min-h-[390px] overflow-hidden select-none transition-colors ${
                isDragging ? "cursor-grabbing border-[#4472C4]/70 bg-muted/30" : "cursor-grab hover:border-border"
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onDoubleClick={handleResetZoomPan}
            >
              {/* Compact Floating Zoom Pill with Background Blur (Reduced by 30%) */}
              <div
                className="absolute top-2.5 right-2.5 z-30 flex items-center gap-1.5 bg-background/50 backdrop-blur-[8px] px-2.5 py-1 rounded-full border border-border/40 shadow-xs select-none"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <span
                  onClick={handleResetZoomPan}
                  title="Zoom level (Scroll to zoom, click to reset)"
                  className="text-[10.5px] font-sans font-semibold text-foreground/85 cursor-pointer hover:text-foreground transition-colors select-none"
                >
                  {Math.round(zoom * 100)}%
                </span>

                <div className="h-3 w-px bg-border/60" />

                <button
                  type="button"
                  onClick={handleResetZoomPan}
                  title="Reset View"
                  className="h-5 w-5 rounded-full hover:bg-muted/70 text-foreground/70 hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>



              {/* Transformable Canvas with Pan & Zoom */}
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.12s ease-out",
                }}
                className="w-full flex items-center justify-center pointer-events-auto"
              >
                {previewTab === "id" ? (
                /* =========================================
                   ID Card Preview (Front & Back Side-by-Side)
                   PRECISE SPACING, UNCLUTTERED, ZERO OVERFLOW
                   ========================================= */
                <div className="flex flex-row items-center justify-center gap-4 sm:gap-6 w-full">
                  {/* Front Card (54mm x 86mm) */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-red-500">
                      Front: 54mm Width &amp; 86mm Height
                    </span>
                    <div className="w-[220px] h-[350px] bg-white text-neutral-900 rounded-none shadow-md border border-neutral-800 flex flex-col relative overflow-hidden select-none">
                      {/* Top Logo - Increased by 5% (w-[145px]) and positioned 2% higher (pt-[53px]) */}
                      <div className="pt-[53px] flex justify-center">
                        <img
                          src="/logos/Logo_Black_Tagline.png"
                          alt="Transvolt Logo with Tagline"
                          className="w-[145px] object-contain"
                        />
                      </div>

                      {/* Photo Box (20x24 mm) */}
                      <div className="mt-[20px] mx-auto w-[78px] h-[92px] bg-[#e9eef7] border border-[#b8c6dc] rounded-[6px] flex items-center justify-center overflow-hidden">
                        {candidate.photoUrl ? (
                          <img src={candidate.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9.5px] text-[#8fa1bc] font-medium">20x24 mm</span>
                        )}
                      </div>

                      {/* Candidate Name - Exact Equal spacing above and below (mt-[16px]) with word wrapping */}
                      <div className="mt-[16px] text-center px-3">
                        <h4 className="font-bold text-[12px] text-[#111111] leading-tight break-words">
                          {toTitleCase(candidate.fullName || "Candidate Full Name")}
                        </h4>
                      </div>

                      {/* 4 Details Rows - Exact Equal spacing from Name (mt-[16px]) */}
                      <div className="mt-[16px] px-[21px] space-y-[4px] text-[8.6px] text-[#1a1a1a] font-normal leading-tight">
                        <div className="flex items-center">
                          <span className="w-[98px] shrink-0 whitespace-nowrap text-[#1a1a1a]">Contact:</span>
                          <span className="flex-1 text-left whitespace-nowrap text-[#1a1a1a]">{candidate.contact || "+91 0000 000 000"}</span>
                        </div>

                        <div className="flex items-center">
                          <span className="w-[98px] shrink-0 whitespace-nowrap text-[#1a1a1a]">Emergency Contact:</span>
                          <span className="flex-1 text-left whitespace-nowrap text-[#1a1a1a]">{candidate.emrContact || "+91 0000 000 000"}</span>
                        </div>

                        <div className="flex items-center">
                          <span className="w-[98px] shrink-0 whitespace-nowrap text-[#1a1a1a]">Employee ID:</span>
                          <span className="flex-1 text-left whitespace-nowrap text-[#1a1a1a]">{candidate.employeeId || "000000"}</span>
                        </div>

                        <div className="flex items-center">
                          <span className="w-[98px] shrink-0 whitespace-nowrap text-[#1a1a1a]">Blood Group:</span>
                          <span className="flex-1 text-left whitespace-nowrap font-bold text-[#1a1a1a]">{candidate.bloodGroup || "O+"}</span>
                        </div>
                      </div>

                      {/* Blue Footer Strip */}
                      <div className="absolute bottom-0 left-0 right-0 h-[32px] bg-[#3b6fb6] text-white flex items-center justify-center text-[8.5px] font-semibold tracking-wide">
                        {companyInfo.companyWebsite || "www.transvolt.in"}
                      </div>
                    </div>
                  </div>

                  {/* Back Card (54mm x 86mm) */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-red-500">
                      Back Common: 54mm Width &amp; 86mm Height
                    </span>
                    <div className="w-[220px] h-[350px] bg-white text-neutral-900 rounded-none shadow-md border border-neutral-800 flex flex-col relative overflow-hidden select-none">
                      {/* Logo placed at exact 24.3% top offset (pt-[85px]) */}
                      <div className="pt-[85px] flex justify-center">
                        <img
                          src="/logos/Logo_Black_Tagline.png"
                          alt="Transvolt Logo with Tagline"
                          className="w-[143px] object-contain"
                        />
                      </div>

                      {/* Return Notice - Centered at exact 22.1% gap (mt-[77px]) */}
                      <div className="mt-[77px] text-center px-2">
                        <p className="text-[8.2px] font-bold text-[#737373] tracking-tight">
                          If Found Please Return to
                        </p>
                      </div>

                      {/* Company & Address Block - LEFT ALIGNED at exact 9.9% margin (pl-[22px]) */}
                      <div className="mt-[24px] pl-[22px] pr-[16px] text-left">
                        <h5 className="font-bold text-[9px] text-[#111111] leading-tight">
                          {companyInfo.companyFullName || "Transvolt Mobility Pvt. Ltd."}
                        </h5>
                        <p className="text-[7.5px] text-[#222222] font-normal leading-[1.35] mt-[2px]">
                          5th Floor, “A” Wing, Trade Link,<br />
                          Kamala Mills Compound, Lower Parel,<br />
                          Mumbai - 400013.
                        </p>
                      </div>

                      {/* Contact Lines - LEFT ALIGNED at exact 9.9% margin (pl-[22px]), gap 5.6% (mt-[19px]) */}
                      <div className="mt-[19px] pl-[22px] pr-[16px] text-left text-[7.5px] text-[#222222] font-normal leading-[1.38]">
                        <p>Contact No.:&nbsp;&nbsp;{companyInfo.companyContact || "+91 8657 000 732"}</p>
                        <p>Email:&nbsp;&nbsp;{companyInfo.companyEmail || "info@transvolt.in"}</p>
                        <p>Web:&nbsp;&nbsp;{companyInfo.companyWebsite || "www.transvolt.in"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* =========================================
                   Business Card Preview (Front & Back Side-by-Side)
                   STRICT STRAIGHT BORDER (NO CURVED CORNERS)
                   ========================================= */
                <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-3 w-full">
                  {/* Front Business Card (89mm x 51mm) */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9.5px] font-bold text-red-500">
                      Front: 89mm Width &amp; 51mm Height
                    </span>
                    {/* STRICT NO CURVED BORDER: rounded-none, equal padding to all 4 sides (+5% increase) */}
                    <div className="w-[215px] sm:w-[225px] h-[126px] sm:h-[132px] bg-white text-neutral-900 rounded-none p-[12px] shadow-md border border-neutral-400 flex flex-col justify-between overflow-hidden relative select-none">
                      {/* Top Row: Name/Designation on Left, Basic Logo on Right - Multi-line wrap without ellipsis */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex-1 min-w-0 pr-1">
                          <h4 className="font-bold text-[7px] text-neutral-900 tracking-tight leading-[1.2] break-words">
                            {toTitleCase(candidate.fullName || "Candidate Full Name")}
                          </h4>
                          <p className="text-[5.8px] font-medium text-neutral-600 leading-[1.25] mt-[1.2px] break-words">
                            {candidate.designation || "Designation"}
                          </p>
                        </div>
                        {/* Basic Logo (No Tagline) - Adjusted up by 1% */}
                        <img
                          src="/logos/Logo_Black.svg"
                          alt="Transvolt Basic Logo"
                          className="h-[16.5px] object-contain max-w-[86px] shrink-0 -translate-y-[3px]"
                        />
                      </div>

                      {/* Bottom Row: Company Info & Address + Generated QR */}
                      <div className="flex items-end justify-between gap-1 pt-1">
                        <div className="space-y-0.5 text-[5.6px] text-neutral-700 max-w-[140px] leading-tight">
                          <strong className="block text-[6.2px] text-neutral-900 font-bold truncate">
                            {toTitleCase(companyInfo.companyFullName || "Transvolt Mobility Private Limited")}
                          </strong>
                          <p className="flex items-center gap-1">
                            <span className="w-[9px] h-[9px] min-w-[9px] rounded-[1.5px] bg-[#3b6fb6] flex items-center justify-center text-white shrink-0">
                              <svg viewBox="0 0 24 24" className="w-[5.5px] h-[5.5px] fill-current"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.72 11.72 0 003.7.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.7 1 1 0 01-.27 1.11l-2.2 2.18z"/></svg>
                            </span>
                            <span className="font-sans font-medium tracking-wide">{candidate.contact || "+91 0000 000 000"}</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="w-[9px] h-[9px] min-w-[9px] rounded-[1.5px] bg-[#3b6fb6] flex items-center justify-center text-white shrink-0">
                              <svg viewBox="0 0 24 24" className="w-[5.5px] h-[5.5px] fill-current"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                            </span>
                            <span className="truncate">{candidate.email || "email@transvolt.in"}</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="w-[9px] h-[9px] min-w-[9px] rounded-[1.5px] bg-[#3b6fb6] flex items-center justify-center text-white shrink-0">
                              <svg viewBox="0 0 24 24" className="w-[5.5px] h-[5.5px] fill-none stroke-current stroke-[2.5] stroke-linecap-round stroke-linejoin-round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            </span>
                            <span>{companyInfo.companyWebsite || "www.transvolt.in"}</span>
                          </p>
                          <p className="flex items-center gap-1 leading-tight text-[5.2px]">
                            <span className="w-[9px] h-[9px] min-w-[9px] rounded-[1.5px] bg-[#3b6fb6] flex items-center justify-center text-white shrink-0">
                              <svg viewBox="0 0 24 24" className="w-[5.5px] h-[5.5px] fill-current"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                            </span>
                            <span className="line-clamp-2">{companyInfo.companyAddress || "5th Floor, “A” Wing, Trade Link, Kamala Mills Compound, Lower Parel, Mumbai - 400013."}</span>
                          </p>
                        </div>

                        {/* Borderless QR Code - No "Generated QR" text */}
                        <div className="flex items-center justify-center shrink-0">
                          <img
                            src={qrCodeUrl}
                            alt="Contact QR"
                            className="w-[38px] h-[38px] object-contain rounded-none select-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Back Common Business Card */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9.5px] font-bold text-red-500">
                      Back Common: 89mm Width &amp; 51mm Height
                    </span>
                    {/* STRICT NO CURVED BORDER: rounded-none */}
                    <div className="w-[215px] sm:w-[225px] h-[126px] sm:h-[132px] bg-white text-neutral-900 rounded-none p-2.5 shadow-md border border-neutral-400 flex flex-col items-center justify-center text-center overflow-hidden relative select-none">
                      {/* Logo with Tagline (Logo Black) Centered - Adjusted (+15% from 91px) */}
                      <img
                        src="/logos/Logo_Black_Tagline.png"
                        alt="Transvolt Logo with Tagline"
                        className="w-[105px] object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* =========================================
                Save, Generate & Share Options
               ========================================= */}
            <div className="space-y-3 pt-1">
              <h3 className="text-sm font-extrabold text-[#548235] uppercase tracking-wider">
                Save, Generate &amp; Share Options
              </h3>

              {/* Generate PDF Box */}
              <div className="p-3 rounded-xl border border-border/80 bg-card space-y-2">
                <span className="text-xs font-bold text-foreground/80 block">Generate PDF</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleGeneratePdf("both")}
                    className="py-1.5 px-3 rounded-lg bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#166534] text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    Both
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGeneratePdf("id")}
                    className="py-1.5 px-3 rounded-lg bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#166534] text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    ID CARD
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGeneratePdf("business")}
                    className="py-1.5 px-3 rounded-lg bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#166534] text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    Business CARD
                  </button>
                </div>
              </div>

              {/* Share PDF Box */}
              <div className="p-3 rounded-xl border border-border/80 bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground/80">Share PDF</span>
                  <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    ⏱️ Valid for 7 Hours Only
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSharePdf("both")}
                    className="py-1.5 px-3 rounded-lg bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#166534] text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>Both</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSharePdf("id")}
                    className="py-1.5 px-3 rounded-lg bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#166534] text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>ID CARD</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSharePdf("business")}
                    className="py-1.5 px-3 rounded-lg bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#166534] text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>Business CARD</span>
                  </button>
                </div>
              </div>

              {/* Cancel, Delete & Save Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                {initialData && onDelete ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      onDelete(initialData.id, initialData.name)
                      onOpenChange(false)
                    }}
                    className="text-xs font-semibold text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete Record
                  </Button>
                ) : <div />}

                <div className="flex items-center gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="px-6 py-2 rounded-xl text-xs font-bold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-foreground border-none cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    className="px-8 py-2 rounded-xl text-xs font-bold bg-[#548235] hover:bg-[#43672a] text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            SMART SCANNING & LOADING ANIMATION OVERLAY
           ======================================================== */}
        {isScanning && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md rounded-2xl animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-700/80 rounded-2xl p-5 shadow-2xl overflow-hidden flex flex-col items-center text-center space-y-3.5 text-white select-none">
              {/* Radial glow background */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#548235]/30 rounded-full blur-2xl pointer-events-none" />

              {/* High-Tech Card Scanner Box with Laser Beam */}
              <div className="relative w-44 h-28 rounded-xl bg-neutral-950 border-2 border-[#548235]/70 overflow-hidden shadow-inner flex items-center justify-center">
                {scanImagePreview ? (
                  <img
                    src={scanImagePreview}
                    alt="Scanning Card"
                    className="w-full h-full object-cover filter contrast-125 brightness-90 opacity-75"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-800/40" />
                )}

                {/* Corner reticles */}
                <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-[#548235]" />
                <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 border-[#548235]" />
                <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 border-[#548235]" />
                <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-[#548235]" />

                {/* Animated Laser Beam */}
                <div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] transition-all duration-300 pointer-events-none"
                  style={{ top: `${Math.min(90, Math.max(10, scanProgress))}%` }}
                />

                {/* Scanner pulse badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full border border-emerald-400/40 animate-ping opacity-25" />
                  <Scan className="h-5 w-5 text-emerald-400 animate-pulse" />
                </div>
              </div>

              {/* Progress & Text */}
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-xs px-0.5">
                  <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#548235]" />
                    <span>AI Card Scanner &amp; Reader</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{scanProgress}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#548235] via-emerald-400 to-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>

                <p className="text-[11px] text-neutral-400 font-medium tracking-wide animate-pulse">
                  {scanStep || "Analyzing card content..."}
                </p>
              </div>

              {/* Extracted tags chip cloud */}
              <div className="flex flex-wrap items-center justify-center gap-1 pt-0.5">
                {["Full Name", "Designation", "Contact No.", "Email", "Employee ID", "Blood Group", "Site Location"].map((tag) => {
                  const detected = detectedFields.includes(tag)
                  return (
                    <span
                      key={tag}
                      className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full transition-all duration-300 border ${
                        detected
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 scale-105"
                          : "bg-neutral-800/60 text-neutral-500 border-neutral-700/40"
                      }`}
                    >
                      {detected ? "✓ " : "• "}{tag}
                    </span>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => setIsScanning(false)}
                className="text-[11px] text-neutral-500 hover:text-neutral-300 underline cursor-pointer pt-1"
              >
                Cancel Scan
              </button>
            </div>
          </div>
        )}

        {/* AI Vision & Handwriting Key Settings Modal */}
        {showAiKeyModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs rounded-2xl animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-card border border-border/90 rounded-2xl p-5 shadow-2xl space-y-3.5 select-none">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <BrainCircuit className="h-4 w-4 text-[#548235]" />
                  <span>Handwritten Form &amp; Vision AI Settings</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAiKeyModal(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Connect your free <strong>Google Gemini API Key</strong> to decipher cursive, slanted, or messy handwritten candidate forms with 100% human-level accuracy.
              </p>

              <div className="space-y-1">
                <label className="text-[10.5px] font-semibold text-foreground/80">Gemini API Key</label>
                <Input
                  type="password"
                  placeholder="AIzaSy..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="text-xs rounded-xl h-9 bg-background"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                <div className="flex gap-1.5">
                  {geminiApiKey && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      onClick={() => {
                        setKeyInput("")
                        setGeminiApiKey("")
                        localStorage.removeItem("transvolt_gemini_api_key")
                        toast.info("API Key removed. Falling back to local OCR preprocessor.")
                        setShowAiKeyModal(false)
                      }}
                    >
                      Clear
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 text-xs font-bold bg-[#548235] hover:bg-[#43672a] text-white shadow-sm"
                    onClick={() => {
                      const trimmed = keyInput.trim()
                      setGeminiApiKey(trimmed)
                      if (trimmed) {
                        localStorage.setItem("transvolt_gemini_api_key", trimmed)
                        toast.success("Gemini Vision AI active! Handwritten notes will now be read with 100% accuracy.")
                      } else {
                        localStorage.removeItem("transvolt_gemini_api_key")
                      }
                      setShowAiKeyModal(false)
                    }}
                  >
                    Save Key
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
