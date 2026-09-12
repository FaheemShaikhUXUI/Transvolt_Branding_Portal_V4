"use client"

import * as React from "react"
import { Building2, MapPin, Plus, Trash2, Search, Building, Check, Pause, Pencil, Layers, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCompanyMaster, CompanyMasterRecord } from "@/lib/company-master/company-master-context"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

export function CompanyMasterSection() {
  const {
    companies,
    availableModules,
    addCompany,
    updateCompany,
    deleteCompany,
    toggleHoldCompany,
    addCustomModule,
  } = useCompanyMaster()

  // Default initial modules for new companies
  const DEFAULT_INITIAL_MODULES = ["id-business-cards", "vehicle-branding", "charger-branding"]

  // Add Modal State
  const [openAddModal, setOpenAddModal] = React.useState(false)
  const [companyName, setCompanyName] = React.useState("")
  const [siteLocation, setSiteLocation] = React.useState("")
  const [addConnectedModules, setAddConnectedModules] = React.useState<string[]>(DEFAULT_INITIAL_MODULES)
  const [showAddCustom, setShowAddCustom] = React.useState(false)
  const [customModuleName, setCustomModuleName] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Edit Modal State (Opened on clicking any Company Row)
  const [openEditModal, setOpenEditModal] = React.useState(false)
  const [editingRecord, setEditingRecord] = React.useState<CompanyMasterRecord | null>(null)
  const [editCompanyName, setEditCompanyName] = React.useState("")
  const [editSiteLocation, setEditSiteLocation] = React.useState("")
  const [editStatus, setEditStatus] = React.useState<"active" | "hold">("active")
  const [editConnectedModules, setEditConnectedModules] = React.useState<string[]>([])
  const [editShowAddCustom, setEditShowAddCustom] = React.useState(false)
  const [editCustomModuleName, setEditCustomModuleName] = React.useState("")
  const [isEditSubmitting, setIsEditSubmitting] = React.useState(false)

  // System Delete Confirmation Modal State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [recordToDelete, setRecordToDelete] = React.useState<CompanyMasterRecord | null>(null)

  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredCompanies = React.useMemo(() => {
    if (!searchQuery.trim()) return companies
    const query = searchQuery.toLowerCase()
    return companies.filter(
      (c) =>
        c.companyName.toLowerCase().includes(query) ||
        c.siteLocation.toLowerCase().includes(query)
    )
  }, [companies, searchQuery])

  // Save new company
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const success = await addCompany(companyName, siteLocation, addConnectedModules)
      if (success) {
        setCompanyName("")
        setSiteLocation("")
        setAddConnectedModules(DEFAULT_INITIAL_MODULES)
        setShowAddCustom(false)
        setCustomModuleName("")
        setOpenAddModal(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Edit Modal when clicking a company row
  const handleOpenEdit = (record: CompanyMasterRecord) => {
    setEditingRecord(record)
    setEditCompanyName(record.companyName)
    setEditSiteLocation(record.siteLocation)
    setEditStatus(record.status || "active")
    setEditConnectedModules(record.connectedModules || DEFAULT_INITIAL_MODULES)
    setEditShowAddCustom(false)
    setEditCustomModuleName("")
    setOpenEditModal(true)
  }

  // Update existing company
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRecord) return
    setIsEditSubmitting(true)
    try {
      const success = updateCompany(
        editingRecord.id,
        editCompanyName,
        editSiteLocation,
        editStatus,
        editConnectedModules
      )
      if (success) {
        setOpenEditModal(false)
        setEditingRecord(null)
      }
    } finally {
      setIsEditSubmitting(false)
    }
  }

  // Delete button clicked from inside Edit Modal -> opens System Confirmation Dialog
  const handleDeleteFromEdit = () => {
    if (!editingRecord) return
    setRecordToDelete(editingRecord)
    setDeleteConfirmOpen(true)
  }

  // System Confirmation Dialog confirm action
  const handleConfirmDelete = () => {
    if (!recordToDelete) return
    deleteCompany(recordToDelete.id)
    setRecordToDelete(null)
    setOpenEditModal(false)
    setEditingRecord(null)
  }

  // Helpers for module toggling in Add Modal
  const toggleAddModule = (slug: string) => {
    setAddConnectedModules((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  const handleAddModuleSelectAll = () => {
    if (addConnectedModules.length === availableModules.length) {
      setAddConnectedModules([])
    } else {
      setAddConnectedModules(availableModules.map((m) => m.slug))
    }
  }

  const handleAddNewCustomModule = () => {
    if (!customModuleName.trim()) return
    const newMod = addCustomModule(customModuleName)
    setAddConnectedModules((prev) => Array.from(new Set([...prev, newMod.slug])))
    setCustomModuleName("")
    setShowAddCustom(false)
  }

  // Helpers for module toggling in Edit Modal
  const toggleEditModule = (slug: string) => {
    setEditConnectedModules((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  const handleEditModuleSelectAll = () => {
    if (editConnectedModules.length === availableModules.length) {
      setEditConnectedModules([])
    } else {
      setEditConnectedModules(availableModules.map((m) => m.slug))
    }
  }

  const handleEditNewCustomModule = () => {
    if (!editCustomModuleName.trim()) return
    const newMod = addCustomModule(editCustomModuleName)
    setEditConnectedModules((prev) => Array.from(new Set([...prev, newMod.slug])))
    setEditCustomModuleName("")
    setEditShowAddCustom(false)
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col gap-5">
      {/* Section Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#4472C4]/10 text-[#4472C4]">
              <Building2 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Company Master</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Centralized company entities &amp; operating sites. Select exactly which branding pages each company connects to for automatic form dropdowns.
          </p>
        </div>

        {/* Single Black Button to Add Company */}
        <div className="shrink-0">
          <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
            <DialogTrigger
              render={
                <Button className="h-10 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer">
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Add Company</span>
                </Button>
              }
            />

            <DialogContent className="sm:max-w-xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
              <DialogHeader className="text-left space-y-1">
                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-[#4472C4]">
                  Add Company
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Register a company entity, site location, and configure connected pages &amp; forms.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSave} className="flex flex-col gap-5 mt-4">
                {/* 1. Text Box: Company Name */}
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="dash-company-name" className="text-xs font-bold uppercase tracking-wider text-foreground">
                    1. Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dash-company-name"
                    placeholder="e.g. Transvolt Mobility Private Limited"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-11 rounded-lg border-border/80 bg-muted/20 focus:bg-background"
                    required
                    autoFocus
                  />
                </div>

                {/* 2. Text Box: Site Location */}
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="dash-site-location" className="text-xs font-bold uppercase tracking-wider text-foreground">
                    2. Site Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dash-site-location"
                    placeholder="e.g. Mumbai HQ, MBMT Depot, Pune Hub"
                    value={siteLocation}
                    onChange={(e) => setSiteLocation(e.target.value)}
                    className="h-11 rounded-lg border-border/80 bg-muted/20 focus:bg-background"
                    required
                  />
                </div>

                {/* 3. Connected Pages Section (How many pages it should connect in form) */}
                <div className="space-y-2.5 text-left border-t border-border/70 pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        <span>3. Connected Pages &amp; Forms</span>
                        <span className="text-red-500">*</span>
                        <span className="text-[10.5px] font-semibold px-2 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20 normal-case">
                          {addConnectedModules.length} selected
                        </span>
                      </Label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        These pages will automatically have this Company and Site Location in their dropdown forms.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddModuleSelectAll}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      {addConnectedModules.length === availableModules.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  {/* Available Modules Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                    {availableModules.map((mod) => {
                      const isChecked = addConnectedModules.includes(mod.slug)
                      return (
                        <div
                          key={mod.slug}
                          onClick={() => toggleAddModule(mod.slug)}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-xs select-none",
                            isChecked
                              ? "border-primary/50 bg-primary/[0.05] text-foreground font-semibold shadow-xs"
                              : "border-border/70 hover:border-border hover:bg-muted/30 text-muted-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={cn(
                                "h-4 w-4 rounded flex items-center justify-center border transition-colors shrink-0",
                                isChecked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40"
                              )}
                            >
                              {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                            </span>
                            <span className="truncate">{mod.name}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* + Add More Pages / Custom Page Option */}
                  <div className="pt-1">
                    {showAddCustom ? (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/30 border border-border/70">
                        <Input
                          placeholder="Type page name (e.g. Merchandise, Signage)..."
                          value={customModuleName}
                          onChange={(e) => setCustomModuleName(e.target.value)}
                          className="h-8.5 text-xs rounded-lg bg-background"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddNewCustomModule()
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddNewCustomModule}
                          className="h-8.5 px-3 rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                        >
                          Add Page
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowAddCustom(false)
                            setCustomModuleName("")
                          }}
                          className="h-8.5 px-2.5 rounded-lg text-xs cursor-pointer text-muted-foreground"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddCustom(true)}
                        className="h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer border-dashed"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>+ Add More Pages</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Buttons: Cancel & Save */}
                <DialogFooter className="flex items-center justify-end gap-3 pt-3 border-t border-border/70">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpenAddModal(false)
                      setCompanyName("")
                      setSiteLocation("")
                      setAddConnectedModules(DEFAULT_INITIAL_MODULES)
                    }}
                    disabled={isSubmitting}
                    className="rounded-xl px-4 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl px-6 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold cursor-pointer shadow-sm"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Company Dialog (Opens when row is clicked) */}
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent className="sm:max-w-xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-[#4472C4]/10 text-[#4472C4]">
                <Pencil className="h-4 w-4" />
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-[#4472C4]">
                Edit Company
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Modify company information, connected branding pages, or permanently remove this record.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="flex flex-col gap-5 mt-4">
            {/* 1. Text Box: Company Name */}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="edit-company-name" className="text-xs font-bold uppercase tracking-wider text-foreground">
                1. Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-company-name"
                placeholder="Company Name"
                value={editCompanyName}
                onChange={(e) => setEditCompanyName(e.target.value)}
                className="h-11 rounded-lg border-border/80 bg-muted/20 focus:bg-background"
                required
                autoFocus
              />
            </div>

            {/* 2. Text Box: Site Location */}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="edit-site-location" className="text-xs font-bold uppercase tracking-wider text-foreground">
                2. Site Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-site-location"
                placeholder="Site Location"
                value={editSiteLocation}
                onChange={(e) => setEditSiteLocation(e.target.value)}
                className="h-11 rounded-lg border-border/80 bg-muted/20 focus:bg-background"
                required
              />
            </div>

            {/* 3. Connected Pages Section (How many pages it should connect in form) */}
            <div className="space-y-2.5 text-left border-t border-border/70 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <span>3. Connected Pages &amp; Forms</span>
                    <span className="text-[10.5px] font-semibold px-2 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20 normal-case">
                      {editConnectedModules.length} selected
                    </span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Select which pages will have this Company and Site Location available in their dropdown forms.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleEditModuleSelectAll}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  {editConnectedModules.length === availableModules.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              {/* Module Checkboxes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {availableModules.map((mod) => {
                  const isChecked = editConnectedModules.includes(mod.slug)
                  return (
                    <div
                      key={mod.slug}
                      onClick={() => toggleEditModule(mod.slug)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-xs select-none",
                        isChecked
                          ? "border-primary/50 bg-primary/[0.05] text-foreground font-semibold shadow-xs"
                          : "border-border/70 hover:border-border hover:bg-muted/30 text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={cn(
                            "h-4 w-4 rounded flex items-center justify-center border transition-colors shrink-0",
                            isChecked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40"
                          )}
                        >
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </span>
                        <span className="truncate">{mod.name}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* + Add More Pages / Custom Page Option in Edit */}
              <div className="pt-1">
                {editShowAddCustom ? (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/30 border border-border/70">
                    <Input
                      placeholder="Type page name (e.g. Merchandise, Signage)..."
                      value={editCustomModuleName}
                      onChange={(e) => setEditCustomModuleName(e.target.value)}
                      className="h-8.5 text-xs rounded-lg bg-background"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleEditNewCustomModule()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleEditNewCustomModule}
                      className="h-8.5 px-3 rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                    >
                      Add Page
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditShowAddCustom(false)
                        setEditCustomModuleName("")
                      }}
                      className="h-8.5 px-2.5 rounded-lg text-xs cursor-pointer text-muted-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditShowAddCustom(true)}
                    className="h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer border-dashed"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Add More Pages</span>
                  </Button>
                )}
              </div>
            </div>

            {/* 4. Hold Status Selector in Modal */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20">
              <div>
                <div className="text-xs font-bold text-foreground">Master Status</div>
                <div className="text-[11px] text-muted-foreground">
                  {editStatus === "hold"
                    ? "On Hold — completely hidden from all forms and dropdowns"
                    : "Active — available in the selected connected pages above"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={editStatus === "hold"}
                  onClick={() => setEditStatus((prev) => (prev === "hold" ? "active" : "hold"))}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    editStatus === "hold" ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-700"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                      editStatus === "hold" ? "translate-x-5" : "translate-x-0"
                    )}
                  >
                    {editStatus === "hold" ? (
                      <Pause className="h-2.5 w-2.5 text-amber-600 fill-amber-600" />
                    ) : (
                      <Check className="h-2.5 w-2.5 text-emerald-600 stroke-[3]" />
                    )}
                  </span>
                </button>
                <span
                  className={cn(
                    "text-xs font-bold w-12 text-left select-none tracking-tight",
                    editStatus === "hold" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {editStatus === "hold" ? "Hold" : "Active"}
                </span>
              </div>
            </div>

            {/* Dialog Footer with Delete on Left, and Cancel + Save on Right */}
            <DialogFooter className="flex items-center justify-between sm:justify-between gap-3 pt-3 border-t border-border/70">
              {/* Delete Button on Bottom Left */}
              <Button
                type="button"
                variant="ghost"
                onClick={handleDeleteFromEdit}
                disabled={isEditSubmitting}
                className="rounded-xl px-3.5 h-10 text-destructive hover:text-destructive hover:bg-destructive/10 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>

              {/* Cancel and Save on Right */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpenEditModal(false)
                    setEditingRecord(null)
                  }}
                  disabled={isEditSubmitting}
                  className="rounded-xl px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="rounded-xl px-6 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold cursor-pointer shadow-sm"
                >
                  {isEditSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Search & Counter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search companies or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-lg bg-background text-xs"
          />
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          Showing <span className="text-foreground font-bold">{filteredCompanies.length}</span> of {companies.length} registered sites
          <span className="hidden sm:inline ml-2 text-muted-foreground/80">• Click any row to edit</span>
        </div>
      </div>

      {/* Table of Companies */}
      <div className="rounded-xl border border-border/80 overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
              <tr>
                <th className="py-2.5 px-3.5 w-10 text-center">#</th>
                <th className="py-2.5 px-3.5">Company Name</th>
                <th className="py-2.5 px-3.5">Site Location</th>
                <th className="py-2.5 px-3.5 hidden md:table-cell">Connected Modules</th>
                <th className="py-2.5 px-3.5 hidden lg:table-cell">Added Date</th>
                <th className="py-2.5 px-3.5 text-right w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((item, idx) => {
                  const isHold = item.status === "hold"
                  const connected = item.connectedModules || DEFAULT_INITIAL_MODULES

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenEdit(item)}
                      className={cn(
                        "transition-colors group cursor-pointer select-none",
                        isHold
                          ? "bg-amber-500/[0.04] hover:bg-amber-500/[0.08]"
                          : "hover:bg-muted/40"
                      )}
                      title="Click to edit company details and connected pages"
                    >
                      <td className="py-3 px-3.5 text-center text-xs text-muted-foreground font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-7 w-7 rounded-md flex items-center justify-center shrink-0",
                              isHold ? "bg-amber-500/15 text-amber-600" : "bg-primary/10 text-primary"
                            )}
                          >
                            <Building className="h-3.5 w-3.5" />
                          </div>
                          <span className={cn("truncate max-w-xs sm:max-w-md", isHold && "line-through text-muted-foreground")} title={item.companyName}>
                            {item.companyName}
                          </span>
                          {isHold && (
                            <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                              Hold
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className={cn(isHold && "text-muted-foreground")}>{item.siteLocation}</span>
                        </div>
                      </td>
                      {/* Dynamic Connected Modules Badges */}
                      <td className="py-3 px-3.5 hidden md:table-cell">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-xs sm:max-w-sm">
                          {connected.length > 0 ? (
                            connected.map((slug) => {
                              const mod = availableModules.find((m) => m.slug === slug)
                              const name = mod?.name || slug
                              const shortName = name
                                .replace("ID Cards & Business Cards", "ID Cards")
                                .replace("Vehicle Branding", "Vehicle")
                                .replace("Charger Branding", "Charger")
                                .replace("Digital Assets", "Digital")
                                .replace("Printing Assets", "Printing")

                              const badgeColor = mod?.badgeColor || "bg-primary/10 text-primary border-primary/20"

                              return (
                                <Badge
                                  key={slug}
                                  variant="secondary"
                                  className={cn(
                                    "text-[9.5px] font-semibold py-0.5 px-2 border border-transparent",
                                    isHold ? "opacity-50 grayscale" : badgeColor
                                  )}
                                  title={name}
                                >
                                  {shortName}
                                </Badge>
                              )
                            })
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">None</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-xs text-muted-foreground hidden lg:table-cell">
                        {item.createdAt}
                      </td>
                      {/* Action Column with Hold Toggle */}
                      <td className="py-3 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isHold}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleHoldCompany(item.id)
                            }}
                            className={cn(
                              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                              isHold
                                ? "bg-amber-500 hover:bg-amber-600"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            )}
                            title={
                              isHold
                                ? "Currently ON HOLD (Hidden from all forms). Click to activate."
                                : "Currently ACTIVE. Click to put on HOLD (Hide from all forms)."
                            }
                          >
                            <span
                              className={cn(
                                "pointer-events-none inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                                isHold ? "translate-x-5" : "translate-x-0"
                              )}
                            >
                              {isHold ? (
                                <Pause className="h-2.5 w-2.5 text-amber-600 fill-amber-600" />
                              ) : (
                                <Check className="h-2.5 w-2.5 text-emerald-600 stroke-[3]" />
                              )}
                            </span>
                          </button>
                          <span
                            className={cn(
                              "text-xs font-bold w-12 text-left select-none tracking-tight",
                              isHold
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            )}
                          >
                            {isHold ? "Hold" : "Active"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building2 className="h-8 w-8 text-muted-foreground/40" />
                      <p className="font-semibold text-foreground text-sm">No companies found</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        {searchQuery
                          ? `No companies match "${searchQuery}".`
                          : "Add your first company and site location using the black button above."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Generated Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Company Master Record?"
        itemName={recordToDelete ? `${recordToDelete.companyName} (${recordToDelete.siteLocation})` : undefined}
        description="Are you sure you want to permanently delete this company and site location? It will be removed from all connected branding modules."
        confirmText="Yes, Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
