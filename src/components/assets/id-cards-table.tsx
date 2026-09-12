"use client"

import * as React from "react"
import { Search, Plus, Filter, Download, MoreHorizontal, Eye, ChevronDown, Check, Phone, Mail, MapPin, AlertCircle, ShieldCheck, Printer, IdCard, CreditCard, CheckCheck, UserMinus, UserCheck, FileSpreadsheet, Copy, CopyCheck } from "lucide-react"
import * as XLSX from "xlsx"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ApprovedStatusBadge } from "./asset-tile"
import { CreateIdBusinessCardModal } from "./create-id-business-card-modal"

export type CandidateStatus = "working" | "hold" | "consultant" | "resigned" | "approved"

export interface IdCardRecord {
  id: string
  name: string
  designation: string
  company: string
  email: string
  contact: string
  emrContact: string
  bloodGroup: string
  siteLocation: string
  cardType: "both" | "id-only" | "business-only"
  status: CandidateStatus
  employeeId?: string
  joiningDate?: string
}

// Render status as direct text badge: Working (Green), Hold (Orange), Consultant (Purple), Resigned (Red)
export function renderStatusBadge(status?: string) {
  const norm = (status || "working").toLowerCase()
  if (norm === "working" || norm === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Working
      </span>
    )
  }
  if (norm === "hold") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Hold
      </span>
    )
  }
  if (norm === "consultant") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-purple-700 dark:text-purple-400 bg-purple-500/10 border border-purple-500/25 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        Consultant
      </span>
    )
  }
  if (norm === "resigned") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-500/10 border border-rose-500/25 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Resigned
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 select-none">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Working
    </span>
  )
}

const DEFAULT_RECORDS: IdCardRecord[] = [
  {
    id: "id-1",
    employeeId: "TV-2024-001",
    name: "Rajesh Sharma",
    designation: "Chief Technology Officer",
    company: "Transvolt Mobility Private Limited",
    email: "rajesh.sharma@transvolt.in",
    contact: "+91 98201 44520",
    emrContact: "+91 98201 99882",
    bloodGroup: "O+",
    siteLocation: "Mumbai HQ",
    cardType: "both",
    status: "working",
    joiningDate: "15 Jan 2022",
  },
  {
    id: "id-2",
    employeeId: "TV-2024-002",
    name: "Ananya Verma",
    designation: "Lead EV Powertrain Engineer",
    company: "Transvolt Mobility Private Limited",
    email: "ananya.verma@transvolt.in",
    contact: "+91 98112 33491",
    emrContact: "+91 98112 77665",
    bloodGroup: "B+",
    siteLocation: "Pune Hub",
    cardType: "both",
    status: "working",
    joiningDate: "01 Mar 2022",
  },
  {
    id: "id-3",
    employeeId: "TV-2024-003",
    name: "Vikram Patel",
    designation: "Head of Charging Infrastructure",
    company: "Transvolt Energy Private Limited",
    email: "vikram.patel@transvolt.in",
    contact: "+91 97234 55678",
    emrContact: "+91 97234 11223",
    bloodGroup: "A+",
    siteLocation: "Bengaluru Plant",
    cardType: "id-only",
    status: "consultant",
    joiningDate: "10 Jun 2022",
  },
  {
    id: "id-4",
    employeeId: "TV-2024-004",
    name: "Pooja Hegde",
    designation: "Senior Brand & Communications Manager",
    company: "Transvolt Mobility Private Limited",
    email: "pooja.hegde@transvolt.in",
    contact: "+91 99345 66789",
    emrContact: "+91 99345 88990",
    bloodGroup: "AB+",
    siteLocation: "Mumbai HQ",
    cardType: "both",
    status: "hold",
    joiningDate: "12 Aug 2022",
  },
  {
    id: "id-5",
    employeeId: "TV-2024-005",
    name: "Arjun Mehta",
    designation: "Fleet Operations Lead",
    company: "Transvolt Mobility Private Limited",
    email: "arjun.mehta@transvolt.in",
    contact: "+91 98456 77890",
    emrContact: "+91 98456 33221",
    bloodGroup: "O+",
    siteLocation: "Delhi NCR Depot",
    cardType: "id-only",
    status: "resigned",
    joiningDate: "05 Nov 2022",
  },
  {
    id: "id-6",
    employeeId: "TV-2024-006",
    name: "Sunita Deshmukh",
    designation: "Corporate Strategy & Investor Relations",
    company: "Transvolt Energy Private Limited",
    email: "sunita.d@transvolt.in",
    contact: "+91 96543 21098",
    emrContact: "+91 96543 99887",
    bloodGroup: "B-",
    siteLocation: "Pune Hub",
    cardType: "business-only",
    status: "working",
    joiningDate: "20 Jan 2023",
  },
]

const COMPANIES = [
  "All",
  "Transvolt Mobility Private Limited",
  "Transvolt Energy Private Limited",
]

const CARD_TYPES = [
  { label: "All Types", value: "All" },
  { label: "Both (ID + Business)", value: "both" },
  { label: "Only ID Card", value: "id-only" },
  { label: "Only Business Card", value: "business-only" },
]

const LOCATIONS = [
  "All",
  "Mumbai HQ",
  "Pune Hub",
  "Delhi NCR Depot",
  "Bengaluru Plant",
  "Hyderabad Hub",
]

export function IdCardsTable() {
  const [records, setRecords] = React.useState<IdCardRecord[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCompany, setSelectedCompany] = React.useState("All")
  const [selectedStatus, setSelectedStatus] = React.useState("All")
  const [selectedCardType, setSelectedCardType] = React.useState("All")
  const [selectedLocation, setSelectedLocation] = React.useState("All")
  
  // Dialogs
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [selectedRecordForEdit, setSelectedRecordForEdit] = React.useState<IdCardRecord | null>(null)
  const [previewCard, setPreviewCard] = React.useState<IdCardRecord | null>(null)
  const [cardSide, setCardSide] = React.useState<"front" | "back">("front")
  const [cardType, setCardType] = React.useState<"id" | "business">("id")
  const excelInputRef = React.useRef<HTMLInputElement>(null)

  // Load from localStorage on mount (with cardType and status normalization)
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("transvolt_id_business_cards_v3")
      if (saved) {
        const parsed: IdCardRecord[] = JSON.parse(saved)
        const normalized = parsed.map((r) => ({
          ...r,
          status: (r.status === ("approved" as any) ? "working" : r.status) || "working",
        }))
        setRecords(normalized)
      } else {
        setRecords(DEFAULT_RECORDS)
        localStorage.setItem("transvolt_id_business_cards_v3", JSON.stringify(DEFAULT_RECORDS))
      }
    } catch {
      setRecords(DEFAULT_RECORDS)
    }
  }, [])

  // Save to localStorage when records change
  const saveRecords = (newRecords: IdCardRecord[]) => {
    setRecords(newRecords)
    try {
      localStorage.setItem("transvolt_id_business_cards_v3", JSON.stringify(newRecords))
    } catch (e) {
      console.error("Failed to save records", e)
    }
  }

  // Filtered records
  const filteredRecords = React.useMemo(() => {
    return records.filter((r) => {
      // Company filter
      if (selectedCompany !== "All" && r.company !== selectedCompany) {
        return false
      }
      // Status filter
      if (selectedStatus !== "All") {
        const target = selectedStatus.toLowerCase()
        const recordStatus = (r.status === ("approved" as any) ? "working" : r.status) || "working"
        if (recordStatus.toLowerCase() !== target) {
          return false
        }
      }
      // Card Type filter
      if (selectedCardType !== "All" && r.cardType !== selectedCardType) {
        return false
      }
      // Location filter
      if (selectedLocation !== "All" && r.siteLocation !== selectedLocation) {
        return false
      }
      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase()
        const matchName = r.name.toLowerCase().includes(q)
        const matchDesig = r.designation.toLowerCase().includes(q)
        const matchEmail = r.email.toLowerCase().includes(q)
        const matchContact = r.contact.includes(q)
        const matchLoc = r.siteLocation.toLowerCase().includes(q)
        const matchEmpId = r.employeeId?.toLowerCase().includes(q)
        const matchCardType = r.cardType?.toLowerCase().includes(q)
        const matchStatus = r.status?.toLowerCase().includes(q)
        if (!matchName && !matchDesig && !matchEmail && !matchContact && !matchLoc && !matchEmpId && !matchCardType && !matchStatus) {
          return false
        }
      }
      return true
    })
  }, [records, selectedCompany, selectedStatus, selectedCardType, selectedLocation, searchQuery])

  // Handle Save Record from CreateIdBusinessCardModal
  const handleSaveRecord = (savedRecord: IdCardRecord) => {
    const idx = records.findIndex((r) => r.id === savedRecord.id)
    let updated: IdCardRecord[]
    if (idx >= 0) {
      updated = [...records]
      updated[idx] = savedRecord
    } else {
      updated = [savedRecord, ...records]
    }
    saveRecords(updated)
  }

  // Handle delete
  const handleDelete = (id: string, name: string) => {
    const updated = records.filter((r) => r.id !== id)
    saveRecords(updated)
    toast.error(`"${name}" removed from directory.`)
  }

  // Handle toggle status (Hold / Approve)
  const handleToggleStatus = (id: string) => {
    const updated = records.map((r) => {
      if (r.id === id) {
        const nextStatus = r.status === "approved" ? "hold" : "approved"
        toast.info(`Status for "${r.name}" updated to: ${nextStatus}`)
        return { ...r, status: nextStatus as any }
      }
      return r
    })
    saveRecords(updated)
  }

  // Handle Toggle Resigned / Unresigned
  const handleToggleResign = (id: string) => {
    const updated = records.map((r) => {
      if (r.id === id) {
        if (r.status === "resigned") {
          toast.success(`"${r.name}" unresigned and restored to Active status.`)
          return { ...r, status: "approved" as const }
        } else {
          toast.info(`"${r.name}" marked as Resigned (data retained at 45% opacity).`)
          return { ...r, status: "resigned" as const }
        }
      }
      return r
    })
    saveRecords(updated)
  }

  // Handle Excel / CSV Sheet Upload & Smart Parsing
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      if (!sheetName) {
        toast.error("No sheets found in the uploaded Excel file.")
        return
      }
      const worksheet = workbook.Sheets[sheetName]
      const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" })

      if (!rawJson || rawJson.length === 0) {
        toast.error("The uploaded Excel sheet contains no data rows.")
        return
      }

      let addedCount = 0
      let updatedCount = 0
      const currentList = [...records]

      rawJson.forEach((row, idx) => {
        // Normalize keys to lowercase alphanumeric for robust column matching
        const normalizedRow: Record<string, any> = {}
        Object.keys(row).forEach((k) => {
          const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, "")
          normalizedRow[cleanKey] = row[k]
        })

        const getValue = (...possibleKeys: string[]): string => {
          for (const key of possibleKeys) {
            const clean = key.toLowerCase().replace(/[^a-z0-9]/g, "")
            if (normalizedRow[clean] !== undefined && String(normalizedRow[clean]).trim() !== "") {
              return String(normalizedRow[clean]).trim()
            }
          }
          return ""
        }

        const name = getValue("fullname", "name", "employeename", "candidatename", "empname", "personnelname", "personnel")
        if (!name) return // Skip rows without candidate name

        const employeeIdRaw = getValue("employeeid", "empid", "id", "code", "empcode", "staffid")
        const employeeId = employeeIdRaw || `TV-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`

        const designation = getValue("designation", "title", "role", "jobtitle", "position") || "Executive"

        const companyRaw = getValue("company", "organization", "companyname", "org")
        const company = companyRaw.toLowerCase().includes("energy")
          ? "Transvolt Energy Private Limited"
          : "Transvolt Mobility Private Limited"

        const emailRaw = getValue("email", "emailid", "mail", "officialemail")
        const email = emailRaw || `${name.toLowerCase().replace(/\s+/g, ".")}@transvolt.in`

        const contactRaw = getValue("contact", "contactno", "contactnumber", "phone", "phonenumber", "mobile", "mobileno")
        const contact = contactRaw || "+91 0000 000 000"

        const emrContactRaw = getValue("emergencycontact", "emrcontact", "emergencyno", "emergencyphone", "emergency")
        const emrContact = emrContactRaw || contact

        const bloodGroupRaw = getValue("bloodgroup", "blood", "bg", "bloodtype") || "O+"
        const bloodGroup = bloodGroupRaw.toUpperCase()

        const siteLocationRaw = getValue("sitelocation", "site", "location", "office", "branch", "depot", "hub", "plant")
        const siteLocation = siteLocationRaw || "Mumbai HQ"

        // Card Type parsing: Both / ID Only / Business Only
        const cardTypeRaw = getValue("cardtype", "type", "card", "cards", "availability").toLowerCase()
        let cardType: "both" | "id-only" | "business-only" = "both"
        if (cardTypeRaw.includes("business") && !cardTypeRaw.includes("id")) {
          cardType = "business-only"
        } else if (cardTypeRaw.includes("id") && !cardTypeRaw.includes("business")) {
          cardType = "id-only"
        }

        // Status parsing: Working, Hold, Consultant, Resigned
        const statusRaw = getValue("status", "employmentstatus", "empstatus").toLowerCase()
        let status: CandidateStatus = "working"
        if (statusRaw.includes("hold")) {
          status = "hold"
        } else if (statusRaw.includes("consultant")) {
          status = "consultant"
        } else if (statusRaw.includes("resign") || statusRaw.includes("former") || statusRaw.includes("inactive") || statusRaw.includes("left")) {
          status = "resigned"
        }

        const joiningDate = getValue("joiningdate", "doj", "dateofjoining", "joindate") || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

        // Check if existing record exists by employeeId or email
        const existingIndex = currentList.findIndex(
          (r) =>
            (r.employeeId && employeeId && r.employeeId.toLowerCase() === employeeId.toLowerCase()) ||
            (r.email && email && r.email.toLowerCase() === email.toLowerCase())
        )

        const recordData: IdCardRecord = {
          id: existingIndex >= 0 ? currentList[existingIndex].id : `id_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          employeeId,
          name,
          designation,
          company,
          email,
          contact,
          emrContact,
          bloodGroup,
          siteLocation,
          cardType,
          status,
          joiningDate,
        }

        if (existingIndex >= 0) {
          currentList[existingIndex] = recordData
          updatedCount++
        } else {
          currentList.push(recordData)
          addedCount++
        }
      })

      if (addedCount === 0 && updatedCount === 0) {
        toast.error("No valid employee rows found. Please ensure the Excel sheet includes columns like 'Name' and 'Designation'.")
        return
      }

      saveRecords(currentList)
      toast.success(`Excel Upload Complete: ${addedCount} added, ${updatedCount} updated (${currentList.length} total records).`)
    } catch (err: any) {
      console.error("Excel upload error:", err)
      toast.error(`Failed to parse Excel: ${err?.message || "Unknown error"}`)
    } finally {
      if (e.target) {
        e.target.value = ""
      }
    }
  }

  // Download current filtered list as Excel
  const downloadCurrentList = () => {
    if (filteredRecords.length === 0) {
      toast.error("No records to export. Adjust your filters and try again.")
      return
    }

    const rows = filteredRecords.map((r, idx) => ({
      "Sr.": idx + 1,
      "Employee ID": r.employeeId || "",
      "Full Name": r.name,
      "Designation": r.designation,
      "Company": r.company,
      "Site / Location": r.siteLocation,
      "Email": r.email,
      "Contact No": r.contact,
      "Emergency Contact": r.emrContact,
      "Blood Group": r.bloodGroup,
      "Card Type": r.cardType === "both" ? "Both (ID + Business)" : r.cardType === "id-only" ? "ID Card Only" : "Business Card Only",
      "Status": r.status.charAt(0).toUpperCase() + r.status.slice(1),
      "Joining Date": r.joiningDate || "",
    }))

    const ws = XLSX.utils.json_to_sheet(rows)

    // Auto-fit column widths
    const colWidths = Object.keys(rows[0]).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String((r as any)[key] ?? "").length)) + 2,
    }))
    ws["!cols"] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "ID & Business Cards")

    const dateStr = new Date().toISOString().slice(0, 10)
    const filterTag = selectedStatus !== "All" ? `_${selectedStatus}` : ""
    const compTag = selectedCompany !== "All" ? `_${selectedCompany.split(" ")[0]}` : ""
    XLSX.writeFile(wb, `Transvolt_Cards${filterTag}${compTag}_${dateStr}.xlsx`)
    toast.success(`Exported ${filteredRecords.length} record${filteredRecords.length !== 1 ? "s" : ""} to Excel.`)
  }

  // Open Preview Modal with Smart Default
  const handleOpenPreview = (record: IdCardRecord, preferredType?: "id" | "business") => {
    setSelectedRecordForEdit(record)
    setIsCreateModalOpen(true)
  }


  // Track which record's email was recently copied (for icon flash)
  const [copiedEmailId, setCopiedEmailId] = React.useState<string | null>(null)

  const handleCopyEmail = (e: React.MouseEvent, record: IdCardRecord) => {
    e.stopPropagation()
    if (!record.email) return
    navigator.clipboard.writeText(record.email).then(() => {
      setCopiedEmailId(record.id)
      toast.success(`Copied: ${record.email}`, { duration: 2000 })
      setTimeout(() => setCopiedEmailId(null), 2000)
    }).catch(() => {
      toast.error("Failed to copy email")
    })
  }

  return (

    <div className="w-full flex flex-col gap-4 text-left">
      {/* 1. Control Bar: Title (left), Search (center), Filter + Buttons (right) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
        {/* Left: Bold section title */}
        <div className="w-full sm:w-auto flex items-center">
          <h2 className="text-base font-extrabold text-foreground tracking-tight select-none">
            ID &amp; Business Card List
          </h2>
        </div>

        {/* Center: Search Input Bar (Pill with right magnifying glass) */}
        <div className="relative w-full sm:max-w-md flex items-center justify-center">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full h-10 rounded-full border border-border/80 bg-card px-4 pr-10 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 shadow-xs focus:outline-none focus:ring-1 focus:ring-[#548235] transition-all"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Search className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* Right: Filter Dropdown & + ID & Business Card Button */}
        <div className="w-full sm:w-auto flex items-center justify-end gap-2.5 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold shadow-xs transition-colors cursor-pointer select-none ${
                (selectedStatus !== "All" || selectedCompany !== "All")
                  ? "border-[#548235]/60 bg-[#548235]/10 text-[#548235] font-bold"
                  : "border-border/80 bg-card hover:bg-muted/50 text-foreground"
              }`}>
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{
                  selectedStatus !== "All" && selectedCompany !== "All"
                    ? `Filter: ${selectedStatus} · ${selectedCompany.replace("Private Limited", "").trim()}`
                    : selectedStatus !== "All"
                    ? `Filter: ${selectedStatus}`
                    : selectedCompany !== "All"
                    ? `Company: ${selectedCompany.replace("Private Limited", "").trim()}`
                    : "Filter"
                }</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            } />
            <DropdownMenuContent align="end" className="w-64 bg-card border border-border p-2 rounded-xl shadow-xl space-y-1">
              {/* ── Status Section ── */}
              <div className="text-[11px] font-bold text-muted-foreground uppercase px-2.5 py-1.5 tracking-wider select-none">
                Filter by Status:
              </div>
              
              <DropdownMenuItem
                onClick={() => setSelectedStatus("All")}
                className="flex items-center justify-between text-xs px-2.5 py-2 rounded-lg cursor-pointer hover:bg-muted font-medium"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  <span>All ({records.length})</span>
                </div>
                {selectedStatus === "All" && <Check className="h-3.5 w-3.5 text-[#548235]" />}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {[
                { key: "Working", label: "Working", color: "bg-emerald-500", count: records.filter(r => ((r.status === ("approved" as any) ? "working" : r.status) || "working") === "working").length },
                { key: "Hold", label: "Hold", color: "bg-amber-500", count: records.filter(r => r.status === "hold").length },
                { key: "Consultant", label: "Consultant", color: "bg-purple-500", count: records.filter(r => r.status === "consultant").length },
                { key: "Resigned", label: "Resigned", color: "bg-rose-500", count: records.filter(r => r.status === "resigned").length },
              ].map((st) => (
                <DropdownMenuItem
                  key={st.key}
                  onClick={() => setSelectedStatus(st.key)}
                  className="flex items-center justify-between text-xs px-2.5 py-2 rounded-lg cursor-pointer hover:bg-muted font-medium"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${st.color}`} />
                    <span>{st.label} ({st.count})</span>
                  </div>
                  {selectedStatus === st.key && <Check className="h-3.5 w-3.5 text-[#548235]" />}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              {/* ── Company Section ── */}
              <div className="text-[11px] font-bold text-muted-foreground uppercase px-2.5 py-1.5 tracking-wider select-none">
                Filter by Company:
              </div>
              {COMPANIES.map((comp) => (
                <DropdownMenuItem
                  key={comp}
                  onClick={() => setSelectedCompany(comp)}
                  className="flex items-center justify-between text-xs font-medium px-2.5 py-2 rounded-lg cursor-pointer hover:bg-muted"
                >
                  <span className="truncate">{comp}</span>
                  {selectedCompany === comp && <Check className="h-3.5 w-3.5 text-[#548235]" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Upload Excel Button & Sample Download */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => excelInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border/80 bg-card hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-400 text-xs font-semibold text-foreground shadow-xs transition-colors cursor-pointer select-none"
              title="Upload Excel or CSV Sheet with personnel data"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Upload Excel</span>
            </button>
            <input
              type="file"
              ref={excelInputRef}
              onChange={handleExcelUpload}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
            <button
              onClick={downloadCurrentList}
              className="p-2.5 rounded-xl border border-border/80 bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground shadow-xs transition-colors cursor-pointer select-none"
              title={`Export current list (${filteredRecords.length} record${filteredRecords.length !== 1 ? "s" : ""}) to Excel`}
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* + ID & Business Card Button */}
          <button
            onClick={() => {
              setSelectedRecordForEdit(null)
              setIsCreateModalOpen(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer select-none"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>+ ID &amp; Business Card</span>
          </button>
        </div>
      </div>

      {/* 2. Table Header Bar & Rows with Serial Number and ID/Business Columns */}
      <div className="w-full overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left min-w-[1050px]">
            {/* Table Header Row */}
            <thead>
              <tr className="bg-neutral-100 dark:bg-neutral-800/90 border-b border-border text-xs font-semibold text-foreground/80 divide-x divide-border/60">
                {/* 1. Serial Number */}
                <th className="py-2.5 px-3 text-left w-12 text-[11px] font-bold tracking-tight text-foreground/70 whitespace-nowrap">
                  Sr.
                </th>

                {/* 2. Name */}
                <th className="py-2.5 px-3 text-left tracking-tight font-bold min-w-[160px] whitespace-nowrap">
                  Name
                </th>

                {/* 3. Designation */}
                <th className="py-2.5 px-3 text-left tracking-tight font-bold min-w-[140px] whitespace-nowrap">
                  Designation
                </th>

                {/* 4. Company */}
                <th className="py-2.5 px-3 text-left tracking-tight font-bold min-w-[180px] whitespace-nowrap">
                  Company
                </th>

                {/* 5. Email */}
                <th className="py-2.5 px-3 text-left tracking-tight font-bold min-w-[150px] whitespace-nowrap">
                  Email
                </th>

                {/* 5. Contact */}
                <th className="py-2.5 px-3 text-left tracking-tight font-bold min-w-[130px] whitespace-nowrap">
                  Contact
                </th>

                {/* 6. Emr. Contact */}
                <th className="py-2.5 px-3 text-left tracking-tight font-bold min-w-[130px] whitespace-nowrap">
                  Emr. Contact
                </th>

                {/* 7. Blood Group */}
                <th className="py-2.5 px-3 text-left tracking-tight font-bold min-w-[110px] whitespace-nowrap">
                  Blood Group
                </th>

                {/* 9. Status */}
                <th className="py-2.5 px-3 text-left tracking-tight font-bold min-w-[100px] whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-border/50 text-xs">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record, idx) => (
                  <tr 
                    key={record.id}
                    className={`transition-all group cursor-pointer select-none ${
                      record.status === "resigned"
                        ? "opacity-45 hover:opacity-70 bg-neutral-100/50 dark:bg-neutral-900/40"
                        : "hover:bg-muted/40"
                    }`}
                    onClick={() => handleOpenPreview(record)}
                  >
                    {/* 1. Serial Number */}
                    <td className="py-3 px-3 text-left text-[11px] font-bold text-muted-foreground/80 w-12 select-none">
                      {String(idx + 1).padStart(2, "0")}
                    </td>

                    {/* 2. Name */}
                    <td className="py-3 px-3 font-semibold text-foreground text-left">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 border border-border/60 ${
                          record.status === "resigned" 
                            ? "bg-neutral-200 dark:bg-neutral-800 text-muted-foreground" 
                            : "bg-gradient-to-br from-[#548235]/20 to-[#4472C4]/20 text-foreground"
                        }`}>
                          {record.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="flex flex-col min-w-0 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-bold text-xs line-clamp-1 transition-colors ${
                              record.status === "resigned" 
                                ? "text-muted-foreground line-through decoration-muted-foreground/60" 
                                : "text-foreground group-hover:text-[#548235]"
                            }`}>
                              {record.name}
                            </span>
                            {record.status === "resigned" && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                                (Resigned)
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground line-clamp-1">
                            {record.employeeId || "TV-STAFF"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Designation */}
                    <td className="py-3 px-3 text-foreground/85 font-medium text-left">
                      <span className="line-clamp-1" title={record.designation}>
                        {record.designation}
                      </span>
                    </td>

                    {/* 4. Company (bold name + small site/location below) */}
                    <td className="py-3 px-3 text-left">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs text-foreground line-clamp-1" title={record.company}>
                          {record.company}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="h-2.5 w-2.5 text-muted-foreground/70 shrink-0" />
                          <span className="text-[10px] text-muted-foreground/75 line-clamp-1" title={record.siteLocation}>
                            {record.siteLocation}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 5. Email — click to copy */}
                    <td className="py-3 px-3 text-left">
                      <button
                        type="button"
                        onClick={(e) => handleCopyEmail(e, record)}
                        title={record.email ? `Click to copy: ${record.email}` : "No email"}
                        className="group flex items-center gap-1.5 text-muted-foreground hover:text-[#4472C4] transition-colors cursor-pointer"
                      >
                        <span className="text-[11px] line-clamp-1 text-left group-hover:underline underline-offset-2">
                          {record.email || "—"}
                        </span>
                        <span className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {copiedEmailId === record.id
                            ? <CopyCheck className="h-3 w-3 text-emerald-500" />
                            : <Copy className="h-3 w-3" />
                          }
                        </span>
                      </button>
                    </td>

                    {/* 5. Contact */}
                    <td className="py-3 px-3 text-left text-[11px] text-muted-foreground">
                      <a 
                        href={`tel:${record.contact}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-foreground"
                      >
                        {record.contact}
                      </a>
                    </td>

                    {/* 6. Emr. Contact */}
                    <td className="py-3 px-3 text-left text-[11px] text-muted-foreground">
                      <span className="text-destructive/80 font-medium">
                        {record.emrContact}
                      </span>
                    </td>

                    {/* 7. Blood Group */}
                    <td className="py-3 px-3 text-left">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-bold text-[10.5px]">
                        {record.bloodGroup}
                      </span>
                    </td>

                    {/* 9. Status */}
                    <td className="py-3 px-3 text-left">
                      {renderStatusBadge(record.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm font-semibold text-foreground">No records match your search or filter</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your search terms or filters.</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSearchQuery("")
                          setSelectedCompany("All")
                          setSelectedStatus("All")
                          setSelectedCardType("All")
                          setSelectedLocation("All")
                        }}
                        className="mt-2 rounded-lg text-xs"
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Count */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20 text-xs text-muted-foreground font-medium">
          <span>Showing {filteredRecords.length} of {records.length} personnel cards</span>
          <span className="text-[11px] font-mono">Transvolt Security &amp; Identity System</span>
        </div>
      </div>

      {/* 3. Create / Edit ID & Business Card Modal */}
      <CreateIdBusinessCardModal
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open)
          if (!open) setSelectedRecordForEdit(null)
        }}
        onSave={handleSaveRecord}
        onDelete={handleDelete}
        initialData={selectedRecordForEdit}
      />

      {/* 4. Dedicated Card Preview Modal (Flip between Front and Back / ID Card and Business Card) */}
      <Dialog open={!!previewCard} onOpenChange={(open) => !open && setPreviewCard(null)}>
        <DialogContent className="sm:max-w-xl bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-base font-extrabold text-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4 text-[#4472C4]" />
                  Card Preview: {previewCard?.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {previewCard?.designation} • {previewCard?.company}
                </DialogDescription>
              </div>

              {/* Type Switcher: ID Card vs Business Card (Smartly disabled if only one is available) */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
                <button
                  disabled={previewCard?.cardType === "business-only"}
                  onClick={() => setCardType("id")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewCard?.cardType === "business-only" 
                      ? "opacity-30 cursor-not-allowed text-muted-foreground"
                      : cardType === "id" 
                        ? "bg-background text-foreground shadow-xs" 
                        : "text-muted-foreground hover:text-foreground"
                  }`}
                  title={previewCard?.cardType === "business-only" ? "Only Business Card is available for this personnel" : "View ID Card"}
                >
                  ID Card
                </button>
                <button
                  disabled={previewCard?.cardType === "id-only"}
                  onClick={() => setCardType("business")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewCard?.cardType === "id-only" 
                      ? "opacity-30 cursor-not-allowed text-muted-foreground"
                      : cardType === "business" 
                        ? "bg-background text-foreground shadow-xs" 
                        : "text-muted-foreground hover:text-foreground"
                  }`}
                  title={previewCard?.cardType === "id-only" ? "Only ID Card is available for this personnel" : "View Business Card"}
                >
                  Business Card
                </button>
              </div>
            </div>
          </DialogHeader>

          {/* Resigned Personnel Alert Banner in Preview Modal */}
          {previewCard?.status === "resigned" && (
            <div className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserMinus className="h-4 w-4 text-amber-600" />
                <span>Former Employee (Resigned) — Archived Record</span>
              </span>
              <button 
                onClick={() => {
                  if (previewCard) {
                    handleToggleResign(previewCard.id)
                    setPreviewCard({ ...previewCard, status: "approved" })
                  }
                }}
                className="text-[11px] underline hover:text-[#548235] font-bold cursor-pointer"
              >
                Unresign (Make Active)
              </button>
            </div>
          )}

          {/* Visual Card Canvas */}
          <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-2xl border border-border/70 relative">
            {/* Front / Back Toggle */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setCardSide("front")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  cardSide === "front" ? "bg-[#548235] text-white shadow-xs" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Front Side
              </button>
              <button
                onClick={() => setCardSide("back")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  cardSide === "back" ? "bg-[#548235] text-white shadow-xs" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Back Side
              </button>
            </div>

            {/* Simulated Printed Card Representation */}
            {cardType === "id" ? (
              // ID Card (Vertical Badge Format)
              <div className="w-[280px] h-[430px] rounded-2xl bg-gradient-to-b from-white via-neutral-50 to-neutral-100 text-neutral-900 border-2 border-neutral-300 shadow-2xl flex flex-col justify-between overflow-hidden relative p-5 select-none">
                {/* Lanyard Hole Clip */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-12 h-2.5 rounded-full bg-neutral-200 border border-neutral-400/40" />

                {cardSide === "front" ? (
                  <>
                    {/* Header */}
                    <div className="flex flex-col items-center text-center mt-3 space-y-1">
                      <span className="text-sm font-black text-[#548235] tracking-wider uppercase">
                        TRANSVOLT
                      </span>
                      <span className="text-[9px] font-bold text-neutral-500 tracking-widest uppercase">
                        Safety and Sustainability
                      </span>
                    </div>

                    {/* Photo Placeholder */}
                    <div className="flex flex-col items-center my-2">
                      <div className="w-24 h-28 rounded-xl bg-gradient-to-tr from-[#548235]/20 to-[#4472C4]/20 border-2 border-[#548235] flex items-center justify-center shadow-md">
                        <span className="text-2xl font-black text-neutral-700">
                          {previewCard?.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </span>
                      </div>
                    </div>

                    {/* Personnel Info */}
                    <div className="flex flex-col items-center text-center space-y-1">
                      <h4 className="font-extrabold text-sm text-neutral-900 leading-tight">
                        {previewCard?.name}
                      </h4>
                      <p className="text-[11px] font-bold text-[#4472C4] leading-tight">
                        {previewCard?.designation}
                      </p>
                      <span className="text-[9.5px] font-mono text-neutral-500 font-bold">
                        ID: {previewCard?.employeeId}
                      </span>
                    </div>

                    {/* Metadata strip */}
                    <div className="grid grid-cols-2 gap-1 border-t border-b border-neutral-200 py-1.5 text-[9.5px] mt-2">
                      <div>
                        <span className="text-neutral-400 font-semibold block">Blood Group</span>
                        <span className="font-bold text-red-600">{previewCard?.bloodGroup}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 font-semibold block">Site Location</span>
                        <span className="font-bold text-neutral-800">{previewCard?.siteLocation}</span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="text-center pt-2 text-[8px] font-bold text-neutral-400 uppercase tracking-wider">
                      Authorized Transvolt Identity
                    </div>
                  </>
                ) : (
                  <>
                    {/* Back of ID Card */}
                    <div className="space-y-3 mt-4 text-[10px] text-neutral-700">
                      <div className="text-center pb-2 border-b border-neutral-200">
                        <span className="font-bold text-neutral-900 block">Emergency Contact</span>
                        <span className="font-bold text-red-600">{previewCard?.emrContact}</span>
                      </div>

                      <div className="space-y-1 text-left">
                        <span className="font-bold text-neutral-900 text-[10.5px]">Terms of Use:</span>
                        <p className="text-[8.5px] text-neutral-500 leading-tight">
                          1. This card is corporate property and must be displayed on premises.
                          <br />2. Report loss immediately to security and HR.
                          <br />3. Return card upon separation from company.
                        </p>
                      </div>

                      <div className="space-y-1 text-left">
                        <span className="font-bold text-neutral-900 text-[10.5px]">Head Office:</span>
                        <p className="text-[8.5px] text-neutral-500 leading-tight">
                          Transvolt Mobility Pvt Ltd, Mumbai, Maharashtra, India.
                        </p>
                      </div>

                      {/* Fake Barcode / QR */}
                      <div className="flex flex-col items-center pt-4">
                        <div className="w-full h-8 bg-neutral-900 rounded flex items-center justify-center">
                          <span className="font-mono text-white text-[9px] tracking-widest">
                            ||| | |||| | ||| |||| |
                          </span>
                        </div>
                        <span className="text-[8px] font-mono text-neutral-400 mt-1">{previewCard?.employeeId}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Business Card (Horizontal Standard Format: 3.5" x 2")
              <div className="w-[380px] h-[220px] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-950 text-white border border-neutral-700 shadow-2xl flex flex-col justify-between p-6 select-none relative overflow-hidden">
                {cardSide === "front" ? (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-lg font-black text-[#548235] tracking-wider">
                          TRANSVOLT
                        </span>
                        <span className="block text-[8px] font-bold text-neutral-400 tracking-widest uppercase">
                          Safety and Sustainability
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#548235] px-2 py-0.5 rounded bg-[#548235]/15 border border-[#548235]/30">
                        OFFICIAL
                      </span>
                    </div>

                    <div className="space-y-0.5 text-left">
                      <h3 className="text-base font-extrabold text-white tracking-tight">{previewCard?.name}</h3>
                      <p className="text-xs font-semibold text-[#548235]">{previewCard?.designation}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[9.5px] text-neutral-400 border-t border-neutral-800 pt-3 text-left">
                      <div>
                        <span className="block text-white">{previewCard?.contact}</span>
                        <span className="block truncate">{previewCard?.email}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-white font-medium">{previewCard?.siteLocation}</span>
                        <span className="block text-neutral-500">transvolt.in</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-full flex flex-col items-center justify-center space-y-2">
                      <span className="text-2xl font-black text-[#548235] tracking-widest">
                        TRANSVOLT
                      </span>
                      <p className="text-[9.5px] text-neutral-400 text-center max-w-[240px]">
                        Leading the transition to electric mobility and clean transportation across India.
                      </p>
                      <span className="text-[9px] font-mono text-[#548235] pt-2">www.transvolt.in</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full pt-2">
            <span className="text-[11px] text-muted-foreground font-medium">
              Standard production artwork verified for print.
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  toast.success(`Printing artwork for "${previewCard?.name}" generated.`)
                }}
                className="text-xs rounded-xl flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </Button>
              <Button 
                size="sm"
                onClick={() => {
                  toast.success(`Download started for "${previewCard?.name}" vector artwork.`)
                }}
                className="bg-[#548235] hover:bg-[#43672a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
