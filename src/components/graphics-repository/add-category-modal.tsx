"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  UploadCloud,
  Plus,
  Trash2,
  FolderPlus,
  Check,
} from "lucide-react"

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
import {
  GraphicCategory,
  GraphicFileFormat,
} from "@/lib/graphics-repository/types"
import {
  detectFileFormat,
  formatBytes,
  graphicsService,
} from "@/lib/graphics-repository/graphics-service"
import { GraphicsFormatBadge } from "./graphics-format-badge"
import { cn } from "@/lib/utils"

interface AssetTileItem {
  id: string
  name: string
  file: File | null
  format?: GraphicFileFormat
  size?: string
  previewUrl?: string
}

interface AddCategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: GraphicCategory[]
  preselectedCategoryId?: string
  onSuccess: (newCategoryId: string) => void
}

const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.svg,.pdf,.cdr,.ppt,.pptx,.ai,.eps"

const createEmptyTile = (): AssetTileItem => ({
  id: `tile-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  name: "",
  file: null,
})

export function AddCategoryModal({
  open,
  onOpenChange,
  categories,
  preselectedCategoryId,
  onSuccess,
}: AddCategoryModalProps) {
  const [mode, setMode] = React.useState<"new" | "existing">("new")
  const [categoryName, setCategoryName] = React.useState("")
  const [selectedCategoryId, setSelectedCategoryId] = React.useState("")
  const [assetTiles, setAssetTiles] = React.useState<AssetTileItem[]>([createEmptyTile()])
  const [isSaving, setIsSaving] = React.useState(false)

  // Sync state on open
  React.useEffect(() => {
    if (open) {
      if (preselectedCategoryId) {
        setMode("existing")
        setSelectedCategoryId(preselectedCategoryId)
      } else {
        setMode("new")
        setSelectedCategoryId(categories[0]?.id || "")
      }
      setCategoryName("")
      setAssetTiles([createEmptyTile()])
      setIsSaving(false)
    }
  }, [open, preselectedCategoryId, categories])

  const handleAddTile = () => {
    setAssetTiles((prev) => [...prev, createEmptyTile()])
  }

  const handleRemoveTile = (id: string) => {
    if (assetTiles.length <= 1) {
      setAssetTiles([createEmptyTile()])
    } else {
      setAssetTiles((prev) => prev.filter((t) => t.id !== id))
    }
  }

  const handleTileNameChange = (id: string, name: string) => {
    setAssetTiles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name } : t))
    )
  }

  const handleFileSelected = (tileId: string, files: FileList | null) => {
    if (!files || files.length === 0) return

    const firstFile = files[0]
    const format = detectFileFormat(firstFile.name)
    const isImg = ["JPG", "PNG", "SVG"].includes(format)
    const previewUrl = isImg ? URL.createObjectURL(firstFile) : undefined
    const defaultName = firstFile.name.replace(/\.[^/.]+$/, "")

    setAssetTiles((prev) =>
      prev.map((t) => {
        if (t.id === tileId) {
          return {
            ...t,
            file: firstFile,
            format,
            size: formatBytes(firstFile.size),
            previewUrl,
            name: t.name.trim() ? t.name : defaultName,
          }
        }
        return t
      })
    )

    // If multiple files selected, create additional tiles for them automatically
    if (files.length > 1) {
      const extraTiles: AssetTileItem[] = []
      for (let i = 1; i < files.length; i++) {
        const extraFile = files[i]
        const extraFmt = detectFileFormat(extraFile.name)
        const extraPreview = ["JPG", "PNG", "SVG"].includes(extraFmt)
          ? URL.createObjectURL(extraFile)
          : undefined

        extraTiles.push({
          id: `tile-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          name: extraFile.name.replace(/\.[^/.]+$/, ""),
          file: extraFile,
          format: extraFmt,
          size: formatBytes(extraFile.size),
          previewUrl: extraPreview,
        })
      }
      setAssetTiles((prev) => [...prev, ...extraTiles])
    }
  }

  const handleClearFile = (tileId: string) => {
    setAssetTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, file: null, format: undefined, size: undefined, previewUrl: undefined } : t))
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let targetCategoryId = selectedCategoryId

      if (mode === "new") {
        const trimmedName = categoryName.trim()
        if (!trimmedName) {
          toast.error("Please enter a category name.")
          setIsSaving(false)
          return
        }

        const duplicate = categories.some(
          (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
        )
        if (duplicate) {
          toast.error(`A category named "${trimmedName}" already exists. Please choose a different name or select existing category.`)
          setIsSaving(false)
          return
        }

        const createdCategory = graphicsService.addCategory(trimmedName)
        targetCategoryId = createdCategory.id
      } else {
        if (!targetCategoryId) {
          toast.error("Please select an existing category.")
          setIsSaving(false)
          return
        }
      }

      // Collect valid tiles that have files attached
      const validTiles = assetTiles.filter((t) => t.file !== null)

      // Ensure each tile has a name
      validTiles.forEach((t) => {
        if (!t.name.trim()) {
          t.name = t.file!.name.replace(/\.[^/.]+$/, "")
        }
      })

      if (validTiles.length > 0) {
        graphicsService.addFiles(
          targetCategoryId,
          validTiles.map((t) => ({
            name: t.name.trim(),
            originalFileName: t.file!.name,
            format: t.format || "OTHER",
            fileSize: t.size,
          }))
        )
      }

      toast.success(
        mode === "new"
          ? `Category created with ${validTiles.length} asset(s)!`
          : `Added ${validTiles.length} asset(s) to category!`
      )

      onSuccess(targetCategoryId)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to save category.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[92vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/60">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-[#4472C4]" />
            {preselectedCategoryId ? "Add Assets to Category" : "Add Graphics Category"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure category and add asset tiles with titles and graphic files.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Mode Selector Tabs */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Category Option
            </Label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/60 border border-border/60">
              <button
                type="button"
                onClick={() => setMode("new")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  mode === "new"
                    ? "bg-card text-[#4472C4] shadow-sm font-bold border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                Create New Category
              </button>
              <button
                type="button"
                onClick={() => setMode("existing")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  mode === "existing"
                    ? "bg-card text-[#4472C4] shadow-sm font-bold border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Check className="h-3.5 w-3.5" />
                Select Existing Category
              </button>
            </div>
          </div>

          {/* 1. Category Input / Select */}
          {mode === "new" ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="category-name-input" className="text-xs font-bold text-foreground">
                  Category Name <span className="text-red-500">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">Must be unique</span>
              </div>
              <Input
                id="category-name-input"
                placeholder="e.g. Vehicle Decals & Plotter Files"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="h-10 text-sm focus-visible:ring-[#4472C4]"
                autoFocus
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="existing-category-select" className="text-xs font-bold text-foreground">
                Select Existing Category <span className="text-red-500">*</span>
              </Label>
              <select
                id="existing-category-select"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-[#4472C4] text-foreground"
              >
                {categories.length === 0 && (
                  <option value="" disabled>No categories available</option>
                )}
                {categories.map((cat, idx) => (
                  <option key={cat.id} value={cat.id}>
                    {String(idx + 1).padStart(2, "0")} — {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 2. Add Asset Tiles Section */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Asset Tiles
                </Label>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4472C4]/10 text-[#4472C4] border border-[#4472C4]/25 font-bold">
                  {assetTiles.length} {assetTiles.length === 1 ? "Tile" : "Tiles"}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                JPG, PNG, SVG, PDF, CDR, PPT, AI, EPS
              </span>
            </div>

            {/* List of Add Asset Tiles */}
            <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
              {assetTiles.map((tile, index) => (
                <div
                  key={tile.id}
                  className="p-4 rounded-xl border border-border/80 bg-muted/20 hover:border-[#4472C4]/40 transition-all space-y-3 shadow-2xs relative group"
                >
                  {/* Tile Header Bar */}
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#4472C4]/15 text-[#4472C4] text-[10.5px] font-bold">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        Add Asset Tile {String(index + 1).padStart(2, "0")}
                      </span>
                      {tile.format && (
                        <GraphicsFormatBadge format={tile.format} size="sm" />
                      )}
                    </div>

                    {assetTiles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTile(tile.id)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:text-red-700 hover:bg-red-500/10 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove Tile
                      </button>
                    )}
                  </div>

                  {/* 1. Asset Name Input */}
                  <div className="space-y-1">
                    <Label
                      htmlFor={`asset-name-${tile.id}`}
                      className="text-xs font-bold text-foreground"
                    >
                      Asset Name
                    </Label>
                    <Input
                      id={`asset-name-${tile.id}`}
                      placeholder="e.g. Transvolt Master Fleet Vector"
                      value={tile.name}
                      onChange={(e) => handleTileNameChange(tile.id, e.target.value)}
                      className="h-9 text-xs focus-visible:ring-[#4472C4] bg-card"
                    />
                  </div>

                  {/* 2. Upload Tile */}
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-foreground">
                      Upload File
                    </Label>

                    <input
                      id={`file-input-${tile.id}`}
                      type="file"
                      multiple
                      accept={ACCEPTED_EXTENSIONS}
                      className="hidden"
                      onChange={(e) => {
                        handleFileSelected(tile.id, e.target.files)
                        e.target.value = ""
                      }}
                    />

                    {!tile.file ? (
                      /* Empty Upload Dropzone Tile */
                      <div
                        onClick={() => document.getElementById(`file-input-${tile.id}`)?.click()}
                        className="border-2 border-dashed border-border/80 hover:border-[#4472C4]/70 hover:bg-[#4472C4]/5 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all text-center bg-card select-none group/tile"
                      >
                        <div className="h-9 w-9 rounded-full bg-[#4472C4]/10 text-[#4472C4] flex items-center justify-center mb-1.5 group-hover/tile:scale-110 transition-transform">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold text-foreground group-hover/tile:text-[#4472C4] transition-colors">
                          + Upload File
                        </p>
                        <p className="text-[10.5px] text-muted-foreground mt-0.5">
                          Click to browse or drag &amp; drop creative file
                        </p>
                      </div>
                    ) : (
                      /* Attached File Tile */
                      <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-card shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <GraphicsFormatBadge format={tile.format || "OTHER"} />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span
                              className="text-xs font-bold text-foreground truncate"
                              title={tile.file.name}
                            >
                              {tile.file.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {tile.size} • {tile.format}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`file-input-${tile.id}`)?.click()}
                            className="h-7 text-[11px] px-2.5 rounded-lg text-[#4472C4] hover:bg-[#4472C4]/10 border-[#4472C4]/30 cursor-pointer"
                          >
                            Change
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClearFile(tile.id)}
                            className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                            title="Remove file"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add more button to add new "Add Asset" Tile */}
              <button
                type="button"
                onClick={handleAddTile}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#4472C4]/35 bg-[#4472C4]/5 hover:bg-[#4472C4]/10 hover:border-[#4472C4]/70 text-[#4472C4] transition-all cursor-pointer font-bold text-xs shadow-2xs group select-none"
              >
                <div className="h-6 w-6 rounded-full bg-[#4472C4]/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="h-4 w-4" />
                </div>
                <span>+ Add More Asset Tile</span>
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-3 border-t border-border/60 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="rounded-xl text-xs h-9 font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl text-xs h-9 font-bold bg-[#4472C4] hover:bg-[#3b63ab] text-white shadow-sm"
          >
            {isSaving ? "Saving..." : mode === "new" ? "Save Category & Assets" : "Save Assets"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
