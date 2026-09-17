"use client"

import * as React from "react"
import { toast } from "sonner"

export interface PortalModuleOption {
  id: string
  name: string
  slug: string
  badgeColor?: string
}

export const DEFAULT_PORTAL_MODULES: PortalModuleOption[] = [
  {
    id: "id-business-cards",
    slug: "id-business-cards",
    name: "ID Cards & Business Cards",
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
  {
    id: "vehicle-branding",
    slug: "vehicle-branding",
    name: "Vehicle Branding",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  {
    id: "charger-branding",
    slug: "charger-branding",
    name: "Charger Branding",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  {
    id: "letterhead",
    slug: "letterhead",
    name: "Letterhead",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  },
  {
    id: "presentation",
    slug: "presentation",
    name: "Presentation",
    badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  },
  {
    id: "digital-assets",
    slug: "digital-assets",
    name: "Digital Assets",
    badgeColor: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
  },
  {
    id: "printing-assets",
    slug: "printing-assets",
    name: "Printing Assets",
    badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
  },
  {
    id: "photos",
    slug: "photos",
    name: "Photos and Videos Repository",
    badgeColor: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
  },
]

export interface CompanyMasterRecord {
  id: string
  companyName: string
  siteLocation: string
  createdAt: string
  status?: "active" | "hold"
  connectedModules: string[] // slugs of connected modules, e.g. ["id-business-cards", "vehicle-branding"]
}

const STORAGE_KEY = "branding_portal_company_master"
const MODULES_STORAGE_KEY = "branding_portal_connected_modules_options"

const DEFAULT_CONNECTED_MODULES = ["id-business-cards", "vehicle-branding", "charger-branding"]

const DEFAULT_COMPANY_RECORDS: CompanyMasterRecord[] = [
  {
    id: "cm-1",
    companyName: "Transvolt Mobility Private Limited",
    siteLocation: "Mumbai HQ",
    createdAt: "Jan 10, 2024",
    status: "active",
    connectedModules: DEFAULT_CONNECTED_MODULES,
  },
  {
    id: "cm-2",
    companyName: "Transvolt Mobility Private Limited",
    siteLocation: "MBMT",
    createdAt: "Jan 15, 2024",
    status: "active",
    connectedModules: DEFAULT_CONNECTED_MODULES,
  },
  {
    id: "cm-3",
    companyName: "Transvolt Fleet Services",
    siteLocation: "Pune Hub",
    createdAt: "Feb 02, 2024",
    status: "active",
    connectedModules: DEFAULT_CONNECTED_MODULES,
  },
  {
    id: "cm-4",
    companyName: "Transvolt Logistics",
    siteLocation: "Delhi NCR Depot",
    createdAt: "Mar 12, 2024",
    status: "active",
    connectedModules: DEFAULT_CONNECTED_MODULES,
  },
  {
    id: "cm-5",
    companyName: "Transvolt Energy Private Limited",
    siteLocation: "Bengaluru Plant",
    createdAt: "Apr 05, 2024",
    status: "active",
    connectedModules: DEFAULT_CONNECTED_MODULES,
  },
  {
    id: "cm-6",
    companyName: "Transvolt EV Charging",
    siteLocation: "Hyderabad Yard",
    createdAt: "May 20, 2024",
    status: "active",
    connectedModules: DEFAULT_CONNECTED_MODULES,
  },
]

interface CompanyMasterContextType {
  companies: CompanyMasterRecord[]
  availableModules: PortalModuleOption[]
  addCompany: (companyName: string, siteLocation: string, connectedModules?: string[]) => Promise<boolean>
  updateCompany: (id: string, companyName: string, siteLocation: string, status?: "active" | "hold", connectedModules?: string[]) => boolean
  deleteCompany: (id: string) => void
  toggleHoldCompany: (id: string) => void
  addCustomModule: (name: string) => PortalModuleOption
  isCompanyOnHold: (companyName: string) => boolean
  isSiteOnHold: (companyName: string, siteLocation: string) => boolean
  isModuleConnected: (moduleSlug: string) => boolean
  getUniqueCompanyNames: (moduleSlug?: string) => string[]
  getUniqueSiteLocations: (companyFilter?: string, moduleSlug?: string) => string[]
  getSitesForCompany: (companyName: string, moduleSlug?: string) => string[]
}

const CompanyMasterContext = React.createContext<CompanyMasterContextType | undefined>(undefined)

export function CompanyMasterProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = React.useState<CompanyMasterRecord[]>(DEFAULT_COMPANY_RECORDS)
  const [availableModules, setAvailableModules] = React.useState<PortalModuleOption[]>(DEFAULT_PORTAL_MODULES)
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Load from localStorage on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return
    try {
      // Load modules
      const storedMods = localStorage.getItem(MODULES_STORAGE_KEY)
      if (storedMods) {
        const parsedMods = JSON.parse(storedMods)
        if (Array.isArray(parsedMods) && parsedMods.length > 0) {
          // Merge defaults with saved modules
          const merged = [...DEFAULT_PORTAL_MODULES]
          parsedMods.forEach((pm: PortalModuleOption) => {
            if (!merged.some((m) => m.slug === pm.slug)) {
              merged.push(pm)
            }
          })
          setAvailableModules(merged)
        }
      }

      // Load companies
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize records with status and connectedModules
          const normalized = parsed.map((item: any) => ({
            ...item,
            status: item.status || "active",
            connectedModules: Array.isArray(item.connectedModules) && item.connectedModules.length > 0
              ? item.connectedModules
              : DEFAULT_CONNECTED_MODULES,
          }))
          setCompanies(normalized)
        } else {
          setCompanies(DEFAULT_COMPANY_RECORDS)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COMPANY_RECORDS))
        }
      } else {
        setCompanies(DEFAULT_COMPANY_RECORDS)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COMPANY_RECORDS))
      }
    } catch (e) {
      console.error("Failed to load company master records", e)
      setCompanies(DEFAULT_COMPANY_RECORDS)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save to storage helper
  const saveRecords = (newRecords: CompanyMasterRecord[]) => {
    setCompanies(newRecords)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords))

        // Also sync legacy options for instant backward-compatibility (ONLY ACTIVE, non-hold records)
        const activeRecords = newRecords.filter((r) => r.status !== "hold")
        const uniqueComps = Array.from(new Set(activeRecords.map((r) => r.companyName.trim()).filter(Boolean)))
        const uniqueLocs = Array.from(new Set(activeRecords.map((r) => r.siteLocation.trim()).filter(Boolean)))
        localStorage.setItem("transvolt_company_options", JSON.stringify(uniqueComps))
        localStorage.setItem("transvolt_location_options", JSON.stringify(uniqueLocs))
      } catch (e) {
        console.error("Failed to save company master records", e)
      }
    }
  }

  // Add custom module/page
  const addCustomModule = (name: string): PortalModuleOption => {
    const trimmed = name.trim()
    const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    const existing = availableModules.find((m) => m.slug === slug || m.name.toLowerCase() === trimmed.toLowerCase())
    if (existing) return existing

    const newMod: PortalModuleOption = {
      id: slug,
      slug,
      name: trimmed,
      badgeColor: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
    }
    const updated = [...availableModules, newMod]
    setAvailableModules(updated)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {}
    }
    return newMod
  }

  // Add Company & Site with connected modules
  const addCompany = async (
    companyName: string,
    siteLocation: string,
    connectedModules: string[] = DEFAULT_CONNECTED_MODULES
  ): Promise<boolean> => {
    const trimmedComp = companyName.trim()
    const trimmedSite = siteLocation.trim()

    if (!trimmedComp) {
      toast.error("Company Name is required.")
      return false
    }

    if (!trimmedSite) {
      toast.error("Site Location is required.")
      return false
    }

    // Check duplicate
    const exists = companies.some(
      (c) =>
        c.companyName.toLowerCase() === trimmedComp.toLowerCase() &&
        c.siteLocation.toLowerCase() === trimmedSite.toLowerCase()
    )

    if (exists) {
      toast.error(`"${trimmedComp}" with site "${trimmedSite}" already exists!`)
      return false
    }

    const newRecord: CompanyMasterRecord = {
      id: `cm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      companyName: trimmedComp,
      siteLocation: trimmedSite,
      status: "active",
      connectedModules: connectedModules.length > 0 ? connectedModules : DEFAULT_CONNECTED_MODULES,
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }

    const updated = [newRecord, ...companies]
    saveRecords(updated)
    toast.success(`Company "${trimmedComp}" with site "${trimmedSite}" added successfully!`)
    return true
  }

  // Update
  const updateCompany = (
    id: string,
    companyName: string,
    siteLocation: string,
    status?: "active" | "hold",
    connectedModules?: string[]
  ): boolean => {
    const trimmedComp = companyName.trim()
    const trimmedSite = siteLocation.trim()
    if (!trimmedComp) {
      toast.error("Company Name is required.")
      return false
    }
    if (!trimmedSite) {
      toast.error("Site Location is required.")
      return false
    }

    const existsOther = companies.some(
      (c) =>
        c.id !== id &&
        c.companyName.toLowerCase() === trimmedComp.toLowerCase() &&
        c.siteLocation.toLowerCase() === trimmedSite.toLowerCase()
    )
    if (existsOther) {
      toast.error(`"${trimmedComp}" with site "${trimmedSite}" already exists!`)
      return false
    }

    const updated = companies.map((c) =>
      c.id === id
        ? {
            ...c,
            companyName: trimmedComp,
            siteLocation: trimmedSite,
            ...(status ? { status } : {}),
            ...(connectedModules ? { connectedModules } : {}),
          }
        : c
    )
    saveRecords(updated)
    toast.success("Company information updated successfully!")
    return true
  }

  // Toggle Hold Status
  const toggleHoldCompany = (id: string) => {
    const record = companies.find((c) => c.id === id)
    if (!record) return

    const newStatus: "active" | "hold" = record.status === "hold" ? "active" : "hold"
    const updated = companies.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    saveRecords(updated)

    if (newStatus === "hold") {
      toast.warning(`"${record.companyName} - ${record.siteLocation}" put on HOLD. It will not appear in any forms.`)
    } else {
      toast.success(`"${record.companyName} - ${record.siteLocation}" is now ACTIVE.`)
    }
  }

  // Delete
  const deleteCompany = (id: string) => {
    const record = companies.find((c) => c.id === id)
    const updated = companies.filter((c) => c.id !== id)
    saveRecords(updated)
    toast.success(`Removed "${record?.companyName || "Company"}" from master list.`)
  }

  // Check if company is entirely on hold
  const isCompanyOnHold = (compName: string): boolean => {
    if (!compName) return false
    const trimmed = compName.trim().toLowerCase()
    const matching = companies.filter((c) => c.companyName.trim().toLowerCase() === trimmed)
    if (matching.length === 0) return false
    return matching.every((c) => c.status === "hold")
  }

  // Check if site is on hold
  const isSiteOnHold = (compName: string, siteLoc: string): boolean => {
    if (!siteLoc) return false
    const trimmedSite = siteLoc.trim().toLowerCase()
    const trimmedComp = compName ? compName.trim().toLowerCase() : ""

    if (trimmedComp) {
      const match = companies.find(
        (c) =>
          c.companyName.trim().toLowerCase() === trimmedComp &&
          c.siteLocation.trim().toLowerCase() === trimmedSite
      )
      if (match) return match.status === "hold"
    }

    const matchingSites = companies.filter((c) => c.siteLocation.trim().toLowerCase() === trimmedSite)
    if (matchingSites.length === 0) return false
    return matchingSites.every((c) => c.status === "hold")
  }

  // Check if a module slug is connected to ANY active company
  const isModuleConnected = (moduleSlug: string): boolean => {
    return companies.some((c) => {
      if (c.status === "hold") return false
      const mods = c.connectedModules || DEFAULT_CONNECTED_MODULES
      return mods.includes(moduleSlug)
    })
  }

  // Get unique list of company names (ONLY active, non-hold records, filtered by moduleSlug if provided)
  const getUniqueCompanyNames = (moduleSlug?: string): string[] => {
    const set = new Set<string>()
    companies.forEach((c) => {
      if (c.status === "hold") return
      if (moduleSlug) {
        const mods = c.connectedModules || DEFAULT_CONNECTED_MODULES
        if (!mods.includes(moduleSlug)) return
      }
      if (c.companyName && c.companyName.trim()) {
        set.add(c.companyName.trim())
      }
    })
    return Array.from(set)
  }

  // Get unique list of site locations (ONLY active, non-hold records, filtered by moduleSlug if provided)
  const getUniqueSiteLocations = (companyFilter?: string, moduleSlug?: string): string[] => {
    const set = new Set<string>()
    companies.forEach((c) => {
      if (c.status === "hold") return
      if (moduleSlug) {
        const mods = c.connectedModules || DEFAULT_CONNECTED_MODULES
        if (!mods.includes(moduleSlug)) return
      }
      if (companyFilter && companyFilter.trim()) {
        if (c.companyName.toLowerCase() === companyFilter.trim().toLowerCase()) {
          if (c.siteLocation && c.siteLocation.trim()) set.add(c.siteLocation.trim())
        }
      } else {
        if (c.siteLocation && c.siteLocation.trim()) set.add(c.siteLocation.trim())
      }
    })

    return Array.from(set)
  }

  // Get sites specifically registered to a company (ONLY active, non-hold records, filtered by moduleSlug if provided)
  const getSitesForCompany = (companyName: string, moduleSlug?: string): string[] => {
    if (!companyName) return []
    return companies
      .filter((c) => {
        if (c.status === "hold") return false
        if (moduleSlug) {
          const mods = c.connectedModules || DEFAULT_CONNECTED_MODULES
          if (!mods.includes(moduleSlug)) return false
        }
        return c.companyName.toLowerCase() === companyName.trim().toLowerCase()
      })
      .map((c) => c.siteLocation)
  }

  return (
    <CompanyMasterContext.Provider
      value={{
        companies,
        availableModules,
        addCompany,
        updateCompany,
        deleteCompany,
        toggleHoldCompany,
        addCustomModule,
        isCompanyOnHold,
        isSiteOnHold,
        isModuleConnected,
        getUniqueCompanyNames,
        getUniqueSiteLocations,
        getSitesForCompany,
      }}
    >
      {children}
    </CompanyMasterContext.Provider>
  )
}

export function useCompanyMaster() {
  const context = React.useContext(CompanyMasterContext)
  if (!context) {
    throw new Error("useCompanyMaster must be used within a CompanyMasterProvider")
  }
  return context
}
