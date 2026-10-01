"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCompanyMaster } from "@/lib/company-master/company-master-context"
import { toast } from "sonner"
import {
  Building2,
  MapPin,
  ChevronDown,
  Check,
  Plus,
  Building,
  Search,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface AudioCompanyItem {
  id: string
  companyName: string
  siteLocation: string
  createdAt: string
  tracksCount: number
  lastGenerated?: string
  status: "Ready" | "Generating" | "Draft"
}

interface AddCompanyAudioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCompany: (company: { companyName: string; siteLocation: string }) => void
}

export function AddCompanyAudioModal({
  open,
  onOpenChange,
  onAddCompany,
}: AddCompanyAudioModalProps) {
  const { companies, getUniqueCompanyNames, getSitesForCompany, addCompany } = useCompanyMaster()

  const [companyName, setCompanyName] = React.useState("")
  const [siteLocation, setSiteLocation] = React.useState("")
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
  const [searchFilter, setSearchFilter] = React.useState("")
  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = React.useState(false)

  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const siteDropdownRef = React.useRef<HTMLDivElement>(null)

  // Fetch unique company names from Company Master
  const masterCompanyNames = React.useMemo(() => {
    const names = getUniqueCompanyNames()
    if (names.length > 0) return names
    return Array.from(new Set(companies.map((c) => c.companyName))).filter(Boolean)
  }, [getUniqueCompanyNames, companies])

  // Filtered master companies based on user typing inside dropdown search
  const filteredMasterCompanies = React.useMemo(() => {
    if (!searchFilter.trim()) return masterCompanyNames
    return masterCompanyNames.filter((name) =>
      name.toLowerCase().includes(searchFilter.toLowerCase().trim())
    )
  }, [masterCompanyNames, searchFilter])

  // Sites associated with the currently entered / selected company
  const availableSitesForSelectedCompany = React.useMemo(() => {
    if (!companyName.trim()) return []
    const sitesFromMaster = getSitesForCompany(companyName.trim())
    if (sitesFromMaster.length > 0) return sitesFromMaster
    
    return companies
      .filter((c) => c.companyName.toLowerCase() === companyName.trim().toLowerCase())
      .map((c) => c.siteLocation)
      .filter(Boolean)
  }, [companyName, getSitesForCompany, companies])

  // Handle clicking outside dropdowns to close them
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (siteDropdownRef.current && !siteDropdownRef.current.contains(event.target as Node)) {
        setIsSiteDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setCompanyName("")
      setSiteLocation("")
      setSearchFilter("")
      setIsDropdownOpen(false)
      setIsSiteDropdownOpen(false)
    }
  }, [open])

  // Function to handle selecting a company from Company Master dropdown
  const handleSelectCompany = (selectedName: string) => {
    setCompanyName(selectedName)
    setIsDropdownOpen(false)

    // Fetch site location associated with this company
    const sites = getSitesForCompany(selectedName)
    if (sites.length > 0) {
      setSiteLocation(sites[0])
      toast.info(`Fetched site "${sites[0]}" from Company Master`)
    } else {
      const foundRec = companies.find(
        (c) => c.companyName.toLowerCase() === selectedName.toLowerCase()
      )
      if (foundRec && foundRec.siteLocation) {
        setSiteLocation(foundRec.siteLocation)
        toast.info(`Fetched site "${foundRec.siteLocation}" from Company Master`)
      }
    }
  }

  // Handle Form Submit (Add Company)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedCompany = companyName.trim()
    const trimmedSite = siteLocation.trim()

    if (!trimmedCompany) {
      toast.error("Please enter or select a Company Name.")
      return
    }

    if (!trimmedSite) {
      toast.error("Please enter a Site Location.")
      return
    }

    try {
      await addCompany(trimmedCompany, trimmedSite, ["generate-audio"])
    } catch (e) {
      console.log("Company master sync status:", e)
    }

    onAddCompany({
      companyName: trimmedCompany,
      siteLocation: trimmedSite,
    })

    toast.success(`Added company "${trimmedCompany} - ${trimmedSite}" to Audio Generation list`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-card text-card-foreground border-border shadow-2xl p-6 rounded-2xl">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#4472C4]/10 text-[#4472C4]">
              <Building2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-[#4472C4]">
              Add Company
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Select a company from Company Master or enter a custom company and site location to generate audio assets.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-left">
          {/* Question 1: Text Box + Selection Box for Company Name */}
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <div className="flex items-center justify-between">
              <Label htmlFor="companyName" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                1. Company Name <span className="text-red-500">*</span>
              </Label>
              <span className="text-[11px] text-[#4472C4] font-semibold">
                Connected with Company Master
              </span>
            </div>

            <div className="relative flex items-center">
              <Input
                id="companyName"
                type="text"
                placeholder="Enter Company Name or select from dropdown..."
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value)
                  setSearchFilter(e.target.value)
                  if (!isDropdownOpen && e.target.value) {
                    setIsDropdownOpen(true)
                  }
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="pr-10 h-11 rounded-lg border-border/80 bg-muted/20 focus:bg-background text-foreground text-sm font-medium"
                required
              />

              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md bg-muted hover:bg-accent text-foreground flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
                title="Select from Company Master"
              >
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">
                <div className="p-2 border-b border-border bg-muted/30 flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-muted-foreground ml-1 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Company Master..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    autoFocus
                  />
                  {searchFilter && (
                    <button
                      type="button"
                      onClick={() => setSearchFilter("")}
                      className="text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="max-h-52 overflow-y-auto p-1.5 space-y-1">
                  <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold text-[#4472C4] flex items-center justify-between">
                    <span>Company Master Records</span>
                    <span className="text-muted-foreground">{filteredMasterCompanies.length} available</span>
                  </div>

                  {filteredMasterCompanies.length === 0 ? (
                    <div className="p-3 text-center text-xs text-muted-foreground">
                      No matching company found. You can type to enter a custom company.
                    </div>
                  ) : (
                    filteredMasterCompanies.map((name) => {
                      const isSelected = companyName.toLowerCase() === name.toLowerCase()
                      const sites = getSitesForCompany(name)
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => handleSelectCompany(name)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer",
                            isSelected
                              ? "bg-[#4472C4]/10 text-[#4472C4] border border-[#4472C4]/30"
                              : "text-foreground hover:bg-muted/60"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Building2 className="h-3.5 w-3.5 text-[#4472C4] shrink-0" />
                            <span className="truncate">{name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {sites.length > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                {sites.length} {sites.length === 1 ? "site" : "sites"}
                              </span>
                            )}
                            {isSelected && <Check className="h-3.5 w-3.5 text-[#4472C4]" />}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Question 2: Text Box: Enter Site */}
          <div className="space-y-1.5 relative" ref={siteDropdownRef}>
            <div className="flex items-center justify-between">
              <Label htmlFor="siteLocation" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                2. Enter Site <span className="text-red-500">*</span>
              </Label>
              {availableSitesForSelectedCompany.length > 0 && (
                <span className="text-[11px] text-[#548235] font-semibold">
                  Auto-fetched from Company Master
                </span>
              )}
            </div>

            <div className="relative flex items-center">
              <Input
                id="siteLocation"
                type="text"
                placeholder="Enter Site location (e.g. Mumbai HQ, Pune Hub)..."
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                onFocus={() => {
                  if (availableSitesForSelectedCompany.length > 0) {
                    setIsSiteDropdownOpen(true)
                  }
                }}
                className="pr-10 h-11 rounded-lg border-border/80 bg-muted/20 focus:bg-background text-foreground text-sm font-medium"
                required
              />

              {availableSitesForSelectedCompany.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md bg-muted hover:bg-accent text-foreground flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
                  title="Select from fetched site locations"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isSiteDropdownOpen ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>

            {/* Sites Suggestion Dropdown */}
            {isSiteDropdownOpen && availableSitesForSelectedCompany.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in-50">
                <div className="p-2 border-b border-border bg-muted/30">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#548235]">
                    Fetched Site Locations for {companyName}
                  </span>
                </div>
                <div className="p-1 space-y-1 max-h-36 overflow-y-auto">
                  {availableSitesForSelectedCompany.map((site) => (
                    <button
                      key={site}
                      type="button"
                      onClick={() => {
                        setSiteLocation(site)
                        setIsSiteDropdownOpen(false)
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-[#548235]/10 hover:text-[#548235] flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-[#548235]" />
                        <span>{site}</span>
                      </div>
                      {siteLocation.toLowerCase() === site.toLowerCase() && (
                        <Check className="h-3 w-3 text-[#548235]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Question 3: Buttons: Cancel & Add Company */}
          <DialogFooter className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-4 cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="rounded-xl px-6 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold cursor-pointer shadow-sm"
            >
              Add Company
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
