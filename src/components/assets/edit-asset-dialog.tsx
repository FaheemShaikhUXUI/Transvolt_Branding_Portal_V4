"use client"

import * as React from "react"
import { toast } from "sonner"
import { UploadCloud, FileText, Minus, Plus, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AutocompleteInput } from "@/components/ui/autocomplete-input"
import { AssetPageConfig, assetPagesConfig } from "@/config/asset-pages"
import { useAssets } from "@/lib/assets/assets-context"
import { cn } from "@/lib/utils"
import { Asset, PptIcon, WordIcon, PdfIcon } from "./asset-tile"

type FileType = "JPG" | "PNG" | "SVG" | "PDF" | "WORD" | "CDR" | "PPT"

interface EditAssetTileState {
  id: string
  name: string
  existingFormats: Asset["formats"]
  files: Record<FileType, { file: File | null; previewUrl: string | null }>
}

interface EditCategoryAssetsDialogProps {
  config: AssetPageConfig
  categorySlug: string
  categoryTitle: string
  assets: Asset[]
  trigger?: React.ReactNode
}

function FileDropzone({ 
  type, 
  existingFormat,
  fileState, 
  onChange 
}: { 
  type: FileType
  existingFormat?: { fileName: string; fileData: string }
  fileState: { file: File | null; previewUrl: string | null }
  onChange: (file: File | null) => void 
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const isUploaded = !!fileState.file || !!existingFormat?.fileData
  const preview = fileState.previewUrl || (existingFormat?.fileData?.startsWith("data:") || existingFormat?.fileData?.startsWith("http") || existingFormat?.fileData?.startsWith("/") ? existingFormat.fileData : null)
  const fileName = fileState.file?.name || existingFormat?.fileName || `${type} File`
  
  return (
    <div 
      className={cn("relative flex flex-col items-center justify-center p-4 h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors overflow-hidden group", 
        isUploaded ? "border-green-500/50 bg-green-500/10" : "hover:bg-muted border-border"
      )}
      onClick={() => inputRef.current?.click()}
      title={isUploaded ? `Click to replace ${type}` : `Click to upload ${type}`}
    >
      <input 
        ref={inputRef} 
        type="file" 
        className="hidden" 
        accept={type === 'JPG' ? '.jpg,.jpeg' : type === 'PNG' ? '.png' : type === 'SVG' ? '.svg' : type === 'PDF' ? '.pdf' : type === 'WORD' ? '.doc,.docx' : type === 'PPT' ? '.ppt,.pptx' : '.cdr'}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      {isUploaded ? (
        <>
          {preview && (type === 'JPG' || type === 'PNG' || type === 'SVG') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-contain p-2 opacity-30 group-hover:opacity-10 transition-opacity" />
          ) : type === 'PPT' ? (
            <div className="absolute inset-0 m-auto flex items-center justify-center opacity-30 group-hover:opacity-10 transition-opacity">
              <PptIcon size={40} />
            </div>
          ) : type === 'WORD' ? (
            <div className="absolute inset-0 m-auto flex items-center justify-center opacity-30 group-hover:opacity-10 transition-opacity">
              <WordIcon size={40} />
            </div>
          ) : type === 'PDF' ? (
            <div className="absolute inset-0 m-auto flex items-center justify-center opacity-30 group-hover:opacity-10 transition-opacity">
              <PdfIcon size={40} />
            </div>
          ) : (
            <FileText className="h-10 w-10 text-green-600/30 absolute inset-0 m-auto opacity-30 group-hover:opacity-10 transition-opacity" />
          )}
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-medium text-green-700 dark:text-green-400">✓ {type} Active</span>
            <span className="text-xs text-green-600/70 dark:text-green-400/70 mt-1 truncate max-w-[120px]">{fileName}</span>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
          <UploadCloud className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">Upload {type}</span>
        </div>
      )}
    </div>
  )
}

export function EditCategoryAssetsDialog({
  config,
  categorySlug,
  categoryTitle,
  assets,
  trigger
}: EditCategoryAssetsDialogProps) {
  const { assets: allAssets, customCategories, updateCategoryAndAssets } = useAssets()
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [category, setCategory] = React.useState(categoryTitle)

  const isPresentation = config.slug === "presentation" || categorySlug === "presentation" || category.toLowerCase().includes("presentation")

  const createEmptyTile = (): EditAssetTileState => ({
    id: crypto.randomUUID(),
    name: "",
    existingFormats: {},
    files: {
      JPG:  { file: null, previewUrl: null },
      PNG:  { file: null, previewUrl: null },
      SVG:  { file: null, previewUrl: null },
      PDF:  { file: null, previewUrl: null },
      WORD: { file: null, previewUrl: null },
      CDR:  { file: null, previewUrl: null },
      PPT:  { file: null, previewUrl: null },
    }
  })

  const [tiles, setTiles] = React.useState<EditAssetTileState[]>([])

  // Initialize form state when opened
  React.useEffect(() => {
    if (open) {
      setCategory(categoryTitle)
      if (assets && assets.length > 0) {
        setTiles(
          assets.map((a) => ({
            id: a.id,
            name: a.name,
            existingFormats: { ...a.formats },
            files: {
              JPG:  { file: null, previewUrl: null },
              PNG:  { file: null, previewUrl: null },
              SVG:  { file: null, previewUrl: null },
              PDF:  { file: null, previewUrl: null },
              WORD: { file: null, previewUrl: null },
              CDR:  { file: null, previewUrl: null },
              PPT:  { file: null, previewUrl: null },
            }
          }))
        )
      } else {
        setTiles([createEmptyTile()])
      }
      setIsSubmitting(false)
    }
  }, [open, categoryTitle, assets])

  const handleAddTile = () => {
    setTiles((prev) => [...prev, createEmptyTile()])
  }

  const handleRemoveTile = (id: string) => {
    if (tiles.length > 1) {
      setTiles((prev) => prev.filter((t) => t.id !== id))
    }
  }

  const handleTileNameChange = (id: string, name: string) => {
    setTiles((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)))
  }

  const handleFileChange = (tileId: string, type: FileType, file: File | null) => {
    let previewUrl = null
    if (file && (file.type.startsWith('image/') || type === "SVG" || type === "PNG" || type === "JPG")) {
      previewUrl = URL.createObjectURL(file)
    }

    setTiles((prev) =>
      prev.map((t) => {
        if (t.id === tileId) {
          const oldUrl = t.files[type].previewUrl
          if (oldUrl) URL.revokeObjectURL(oldUrl)
          return {
            ...t,
            files: {
              ...t.files,
              [type]: { file, previewUrl }
            }
          }
        }
        return t
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category.trim()) {
      toast.error("Please enter a category name.")
      return
    }

    // Verify all tiles have names
    const emptyTile = tiles.find((t) => !t.name.trim())
    if (emptyTile) {
      toast.error("Please give every asset tile a name.")
      return
    }

    setIsSubmitting(true)
    try {
      await updateCategoryAndAssets(
        categorySlug,
        category.trim(),
        tiles,
        config.slug
      )
      toast.success(`Category "${category.trim()}" updated successfully!`)
      setOpen(false)
    } catch (err) {
      console.error("Error updating category assets:", err)
      toast.error("Failed to update assets.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const existingCategories = React.useMemo(() => {
    const cats = new Set<string>()

    // 1. Current Page's Primary Title
    if (config.title) {
      cats.add(config.title)
    }

    // 2. Custom categories belonging strictly to this current page
    Object.values(customCategories).forEach((c) => {
      if ((c as any).parentSlug === config.slug || c.slug === config.slug) {
        if (c.title) cats.add(c.title)
      }
    })

    // 3. Category names from existing assets belonging to this current page
    const currentSlugs = new Set<string>([config.slug])
    Object.values(customCategories).forEach((c) => {
      if ((c as any).parentSlug === config.slug) {
        currentSlugs.add(c.slug)
      }
    })

    const sourceAssets = (allAssets && allAssets.length > 0) ? allAssets : assets
    sourceAssets.forEach((a) => {
      if (currentSlugs.has(a.category) || (a as any).parentSlug === config.slug) {
        const catConfig = customCategories[a.category] || (a.category === config.slug ? config : undefined)
        if (catConfig?.title) {
          cats.add(catConfig.title)
        } else if ((a as any).categoryTitle) {
          cats.add((a as any).categoryTitle)
        }
      }
    })

    return Array.from(cats).filter(Boolean)
  }, [config, customCategories, allAssets, assets])

  const activeTypes: FileType[] = isPresentation 
    ? ["PPT"] 
    : ["JPG", "PNG", "SVG", "PDF", "WORD", "CDR"]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger render={
          <Button 
            variant="ghost" 
            size="icon-sm" 
            className="h-7 w-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
            title={`Edit ${categoryTitle} assets`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        } />
      )}
      <DialogContent className="sm:max-w-4xl p-[35px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[1.625rem] font-extrabold tracking-tight leading-tight">
            Edit Asset
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Update the category name, asset names, or replace file formats.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Category Selection */}
          <div className="grid gap-1.5">
            <Label htmlFor="category" className="text-sm font-semibold text-foreground tracking-wide">
              Category Name
            </Label>
            <AutocompleteInput
              id="category"
              options={existingCategories}
              placeholder="Enter category name..."
              value={category}
              onChange={setCategory}
              required
              leftIcon={
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              }
            />
          </div>

          {/* Asset Tiles List */}
          <div className="space-y-6 max-h-[50vh] overflow-y-auto px-1 pb-4">
            {tiles.map((tile, index) => (
              <div key={tile.id} className="relative border border-border/60 rounded-xl p-6 bg-muted/30">
                {tiles.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon-sm" 
                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer" 
                    onClick={() => handleRemoveTile(tile.id)}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Remove tile</span>
                  </Button>
                )}
                
                <div className="grid gap-4">
                  <div className="grid gap-1.5 max-w-sm">
                    <Label htmlFor={`name-${tile.id}`} className="text-sm font-semibold text-foreground tracking-wide">
                      Asset Name
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                      </span>
                      <Input
                        id={`name-${tile.id}`}
                        placeholder={isPresentation ? "E.g. Corporate Profile Deck" : "E.g. Primary Logo"}
                        value={tile.name}
                        onChange={(e) => handleTileNameChange(tile.id, e.target.value)}
                        required
                        className="pl-9 h-11 border-border/70 bg-background focus:border-primary/60 transition-colors rounded-lg font-medium"
                      />
                    </div>
                  </div>
                  
                  <div className={cn(
                    "grid gap-4 mt-2",
                    isPresentation ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-xl" : "grid-cols-2 lg:grid-cols-6"
                  )}>
                    {activeTypes.map(type => (
                      <FileDropzone
                        key={type}
                        type={type}
                        existingFormat={tile.existingFormats?.[type as keyof typeof tile.existingFormats]}
                        fileState={tile.files[type]}
                        onChange={(file) => handleFileChange(tile.id, type, file)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-dashed py-8 cursor-pointer hover:bg-muted/50 transition-colors" 
              onClick={handleAddTile}
            >
              <Plus className="mr-2 h-4 w-4" /> Add More Asset Tiles
            </Button>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="font-bold">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
