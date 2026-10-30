"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Network, Sparkles, Building2, MapPin, User, CheckCircle2 } from "lucide-react"
import { OrganizationChart } from "@/lib/org-chart/types"

interface CreateChartV2ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (initialChart: OrganizationChart) => void
}

export function CreateChartV2Modal({
  open,
  onOpenChange,
  onConfirm,
}: CreateChartV2ModalProps) {
  const [companyName, setCompanyName] = React.useState("Transvolt Mobility Private Limited")
  const [siteName, setSiteName] = React.useState("")
  const [siteLocation, setSiteLocation] = React.useState("")
  const [projectManager, setProjectManager] = React.useState("")

  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Reset or initialize on open
  React.useEffect(() => {
    if (open) {
      setCompanyName("Transvolt Mobility Private Limited")
      setSiteName("")
      setSiteLocation("")
      setProjectManager("")
      setErrors({})
    }
  }, [open])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!companyName.trim()) newErrors.companyName = "Company Name is required"
    if (!siteName.trim()) newErrors.siteName = "Site / Branch Name is required"
    if (!siteLocation.trim()) newErrors.siteLocation = "Site Location is required"
    if (!projectManager.trim()) newErrors.projectManager = "Project Manager is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const now = new Date().toISOString()
    const dateOnly = now.split("T")[0]
    const chartId = `org-chart-${Date.now()}`

    const newChart: OrganizationChart = {
      id: chartId,
      title: `Organization Structure: ${siteName.trim()}`,
      chartType: "PROJECT_SITE",
      siteId: `site-${Date.now()}`,
      siteName: siteName.trim(),
      siteLocation: siteLocation.trim(),
      companyName: companyName.trim(),
      projectManager: projectManager.trim(),
      version: "v1.0",
      status: "DRAFT",
      effectiveFrom: dateOnly,
      createdAt: now,
      updatedAt: now,
      createdBy: "Super Admin",
      updatedBy: "Super Admin",
      changeSummary: "Initial project site structure created.",
      canvasSettings: {
        zoom: 0.9,
        pan: { x: 80, y: 40 },
        gridSnap: true,
        gridVisible: true,
        printArea: "A3_LANDSCAPE",
        showPrintBounds: true,
      },
      boundaries: [],
      nodes: [
        {
          id: `node-pm-${Date.now()}`,
          type: "EXECUTIVE",
          label: projectManager.trim(),
          parentId: null,
          position: { x: 680, y: 50 },
          width: 220,
          height: 60,
          metadata: {
            name: projectManager.trim(),
            designation: "Project Manager / Site Head",
            department: "Project Leadership",
            employmentType: "EMPLOYEE",
            color: "#0f172a",
          },
        },
      ],
      connections: [],
      annotations: [
        {
          id: `ann-${Date.now()}`,
          text: `Project site operational structure established for ${siteLocation.trim()}.\nApproved by Executive Office.`,
          position: { x: 70, y: 220 },
          fontSize: 12,
          fontWeight: "500",
          color: "#475569",
          borderColor: "#cbd5e1",
          bgColor: "rgba(255, 255, 255, 0.85)",
        },
      ],
      footer: {
        enabled: true,
        projectInfo: {
          projectName: siteName.trim(),
          projectLocation: siteLocation.trim(),
          projectCode: `TV-${siteName.trim().slice(0, 4).toUpperCase()}`,
          projectManager: projectManager.trim(),
          effectiveDate: dateOnly,
          companyName: companyName.trim(),
        },
        manpowerColumns: [
          { id: "pilots", label: "Pilots" },
          { id: "onRoll", label: "Staff On Roll" },
          { id: "outsource", label: "Staff Outsource" },
        ],
        manpowerRows: [
          { key: "REQUIRED", label: "Required", values: { pilots: 30, onRoll: 6, outsource: 4 } },
          { key: "AVAILABLE", label: "Available", values: { pilots: 30, onRoll: 6, outsource: 4 } },
          { key: "GAP", label: "Gap", values: { pilots: 0, onRoll: 0, outsource: 0 } },
        ],
        vehicleMatrix: {
          vehicles: { required: 25, available: 25 },
          chargers: { required: 6, available: 6 },
          infrastructure: { required: 2, available: 2 },
        },
        legendItems: [
          { id: "leg-req", label: "Required Position", color: "#64748b", type: "REQUIRED_POSITION" },
          { id: "leg-emp", label: "Employee (On Roll)", color: "#16a34a", type: "EMPLOYEE" },
          { id: "leg-con", label: "Consultant (Agency)", color: "#ea580c", type: "CONSULTANT" },
        ],
        customNotes: `Approved organization chart for ${siteName.trim()} operations.`,
      },
    }

    onConfirm(newChart)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#548235]/10 text-[#548235] shadow-xs">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Create Organization Chart V2
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Initialize project site context before opening the workspace
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Field 1: Company Name */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Company Name *</span>
            </Label>
            <Input
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value)
                if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: "" }))
              }}
              placeholder="e.g. Transvolt Mobility Private Limited"
              className="h-8 text-xs bg-background"
            />
            {errors.companyName && (
              <p className="text-[11px] text-destructive font-medium">{errors.companyName}</p>
            )}
          </div>

          {/* Field 2: Site Name */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Site / Project Name *</span>
            </Label>
            <Input
              value={siteName}
              onChange={(e) => {
                setSiteName(e.target.value)
                if (errors.siteName) setErrors((prev) => ({ ...prev, siteName: "" }))
              }}
              placeholder="e.g. MBMT Transport Division Depot"
              className="h-8 text-xs bg-background"
            />
            {errors.siteName && (
              <p className="text-[11px] text-destructive font-medium">{errors.siteName}</p>
            )}
          </div>

          {/* Field 3: Site Location */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Site Location *</span>
            </Label>
            <Input
              value={siteLocation}
              onChange={(e) => {
                setSiteLocation(e.target.value)
                if (errors.siteLocation) setErrors((prev) => ({ ...prev, siteLocation: "" }))
              }}
              placeholder="e.g. Mira-Bhayandar, Maharashtra"
              className="h-8 text-xs bg-background"
            />
            {errors.siteLocation && (
              <p className="text-[11px] text-destructive font-medium">{errors.siteLocation}</p>
            )}
          </div>

          {/* Field 4: Project Manager */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Project Manager / Lead *</span>
            </Label>
            <Input
              value={projectManager}
              onChange={(e) => {
                setProjectManager(e.target.value)
                if (errors.projectManager) setErrors((prev) => ({ ...prev, projectManager: "" }))
              }}
              placeholder="e.g. Rajesh Verma"
              className="h-8 text-xs bg-background"
            />
            {errors.projectManager && (
              <p className="text-[11px] text-destructive font-medium">{errors.projectManager}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 px-3 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 px-4 text-xs font-bold gap-1.5 bg-[#548235] hover:bg-[#466f2c] text-white cursor-pointer shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Save &amp; Open Canvas</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
