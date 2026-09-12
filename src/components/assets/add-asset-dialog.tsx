"use client"

import * as React from "react"
import { toast } from "sonner"
import { Plus, Minus, UploadCloud, FileText, ChevronDown, Building, MapPin } from "lucide-react"

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
import { useCompanyMaster } from "@/lib/company-master/company-master-context"
import { cn } from "@/lib/utils"
import { PptIcon, WordIcon, PdfIcon } from "./asset-tile"

type FileType = "JPG" | "PNG" | "SVG" | "PDF" | "WORD" | "CDR" | "PPT"

interface AssetTileState {
  id: string;
  name: string;
  files: Record<FileType, { file: File | null; previewUrl: string | null }>;
}

interface AddAssetDialogProps {
  config: AssetPageConfig
  onAdd?: (assetData: any) => void
  categoryOverride?: string
  defaultTitleNumber?: string
  trigger?: React.ReactNode
}

function FileDropzone({ type, fileState, onChange }: { type: FileType, fileState: any, onChange: (file: File | null) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  return (
    <div 
      className={cn("relative flex flex-col items-center justify-center p-4 h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors overflow-hidden group", 
        fileState.file ? "border-green-500/50 bg-green-500/10" : "hover:bg-muted border-border"
      )}
      onClick={() => inputRef.current?.click()}
    >
      <input 
        ref={inputRef} 
        type="file" 
        className="hidden" 
        accept={type === 'JPG' ? '.jpg,.jpeg' : type === 'PNG' ? '.png' : type === 'SVG' ? '.svg' : type === 'PDF' ? '.pdf' : type === 'WORD' ? '.doc,.docx' : type === 'PPT' ? '.ppt,.pptx' : '.cdr'}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      {fileState.file ? (
        <>
          {fileState.previewUrl && (type === 'JPG' || type === 'PNG' || type === 'SVG') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fileState.previewUrl} alt="preview" className="absolute inset-0 w-full h-full object-contain p-2 opacity-30 group-hover:opacity-10 transition-opacity" />
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
            <span className="text-sm font-medium text-green-700 dark:text-green-400">{type} Uploaded</span>
            <span className="text-xs text-green-600/70 dark:text-green-400/70 mt-1 truncate max-w-[120px]">{fileState.file.name}</span>
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

export function AddAssetDialog({ config, onAdd, categoryOverride, defaultTitleNumber, trigger }: AddAssetDialogProps) {
  const { assets, customCategories, getCategoryConfig } = useAssets()
  const { getUniqueCompanyNames, getUniqueSiteLocations, isModuleConnected } = useCompanyMaster()
  const masterCompanies = getUniqueCompanyNames(config.slug)
  const isCompanyConnectedPage =
    config.slug === "charger-branding" ||
    isModuleConnected(config.slug) ||
    masterCompanies.length > 0
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [category, setCategory] = React.useState(categoryOverride || config.title)
  const [chargerSiteLocation, setChargerSiteLocation] = React.useState("")
  const isPresentation = config.slug === "presentation" || category.toLowerCase().includes("presentation")
  const [titleNumber, setTitleNumber] = React.useState(defaultTitleNumber ?? "0")
  const [titleName, setTitleName] = React.useState("")
  const [companyName, setCompanyName] = React.useState("")
  const [headerJpg, setHeaderJpg] = React.useState<File | null>(null)
  const [footerJpg, setFooterJpg] = React.useState<File | null>(null)
  const [headerWord, setHeaderWord] = React.useState<File | null>(null)
  
  const createEmptyTile = (): AssetTileState => ({
    id: crypto.randomUUID(),
    name: "",
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

  const [tiles, setTiles] = React.useState<AssetTileState[]>([createEmptyTile()])

  // Auto-calculate the next serial number across all categories
  const getNextGlobalTitleNumber = (): string => {
    if (defaultTitleNumber !== undefined) {
      return defaultTitleNumber
    }

    // Collect all letterhead assets strictly
    const letterheadAssets = assets.filter(a => {
      const catConf = getCategoryConfig(a.category)
      return (
        a.category === "letterhead" ||
        catConf?.slug === "letterhead" ||
        (catConf as any)?.parentSlug === "letterhead" ||
        a.name.toLowerCase().includes("header") ||
        a.name.toLowerCase().includes("footer") ||
        a.name.toLowerCase().includes("word")
      )
    })

    // Group into distinct company sets across all categories
    const setKeys = new Set<string>()

    letterheadAssets.forEach((asset) => {
      let key = asset.setId
      if (!key) {
        const cleaned = (asset.companyName || asset.name)
          .replace(/\s*(header|footer|word|file)\s*/gi, "")
          .trim()
        if (cleaned && cleaned.toLowerCase() !== "letterhead") {
          key = `${asset.category}_${cleaned.toLowerCase()}`
        } else {
          key = `legacy_${asset.category}`
        }
      }
      setKeys.add(key)
    })

    return String(setKeys.size)
  }

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      const initialCat = categoryOverride || config.title
      setTiles([createEmptyTile()])
      setCategory(initialCat)
      setTitleNumber(defaultTitleNumber ?? getNextGlobalTitleNumber())
      setTitleName(initialCat)
      setCompanyName("")
      setHeaderJpg(null)
      setFooterJpg(null)
      setHeaderWord(null)
      setIsSubmitting(false)
    }
  }, [open, config.title, categoryOverride, defaultTitleNumber, assets])

  const handleAddTile = () => {
    setTiles([...tiles, createEmptyTile()])
  }

  const handleRemoveTile = (id: string) => {
    if (tiles.length > 1) {
      setTiles(tiles.filter(t => t.id !== id))
    }
  }

  const handleTileNameChange = (id: string, name: string) => {
    setTiles(tiles.map(t => t.id === id ? { ...t, name } : t))
  }

  const handleFileChange = (tileId: string, type: FileType, file: File | null) => {
    let previewUrl = null;
    if (file && (file.type.startsWith('image/') || type === "SVG" || type === "PNG" || type === "JPG")) {
      previewUrl = URL.createObjectURL(file)
    }

    setTiles(tiles.map(t => {
      if (t.id === tileId) {
        // Cleanup old URL if it exists
        const oldUrl = t.files[type].previewUrl;
        if (oldUrl) URL.revokeObjectURL(oldUrl);

        return {
          ...t,
          files: {
            ...t.files,
            [type]: { file, previewUrl }
          }
        }
      }
      return t;
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (config.slug === "letterhead") {
      if (!category.trim()) {
        toast.error("Please enter the Category Name.")
        return
      }
      if (!titleName.trim()) {
        toast.error("Please enter the Title Name (e.g. General Documents).")
        return
      }
      if (!companyName.trim()) {
        toast.error("Please enter the Company Name.")
        return
      }
      if (!headerJpg && !footerJpg && !headerWord) {
        toast.error("Please upload at least one format file (Header JPG, Footer JPG, or Header Word).")
        return
      }

      setIsSubmitting(true)

      const setId = crypto.randomUUID()
      const newTiles = []
      if (headerJpg) {
        newTiles.push({
          id: crypto.randomUUID(),
          name: `${companyName} Header`,
          titleNumber,
          titleName,
          companyName,
          setId,
          files: {
            JPG: { file: headerJpg, previewUrl: URL.createObjectURL(headerJpg) },
            PNG: { file: null, previewUrl: null },
            SVG: { file: null, previewUrl: null },
            PDF: { file: null, previewUrl: null },
            WORD: { file: null, previewUrl: null },
            CDR: { file: null, previewUrl: null },
            PPT: { file: null, previewUrl: null },
          }
        })
      }
      if (footerJpg) {
        newTiles.push({
          id: crypto.randomUUID(),
          name: `${companyName} Footer`,
          titleNumber,
          titleName,
          companyName,
          setId,
          files: {
            JPG: { file: footerJpg, previewUrl: URL.createObjectURL(footerJpg) },
            PNG: { file: null, previewUrl: null },
            SVG: { file: null, previewUrl: null },
            PDF: { file: null, previewUrl: null },
            WORD: { file: null, previewUrl: null },
            CDR: { file: null, previewUrl: null },
            PPT: { file: null, previewUrl: null },
          }
        })
      }
      if (headerWord) {
        newTiles.push({
          id: crypto.randomUUID(),
          name: `${companyName} Word`,
          titleNumber,
          titleName,
          companyName,
          setId,
          files: {
            JPG: { file: null, previewUrl: null },
            PNG: { file: null, previewUrl: null },
            SVG: { file: null, previewUrl: null },
            PDF: { file: null, previewUrl: null },
            WORD: { file: headerWord, previewUrl: null },
            CDR: { file: null, previewUrl: null },
            PPT: { file: null, previewUrl: null },
          }
        })
      }

      setTimeout(() => {
        setIsSubmitting(false)
        setOpen(false)
        toast.success(`Letterhead "${titleName}" added successfully to ${category}.`)
        onAdd?.({ category, tiles: newTiles })
      }, 800)
      return
    }

    // Basic validation for other pages
    const hasEmptyNames = tiles.some(t => !t.name.trim());
    if (hasEmptyNames) {
      toast.error("Please provide a name for all asset tiles.");
      return;
    }

    if (!category.trim()) {
      toast.error("Please select or create a category.");
      return;
    }

    setIsSubmitting(true)
    
    const preparedTiles = tiles.map(t => ({
      ...t,
      companyName: isCompanyConnectedPage ? category : t.companyName,
      titleName: isCompanyConnectedPage ? chargerSiteLocation : t.titleName,
    }))

    // Mock save
    setTimeout(() => {
      setIsSubmitting(false)
      setOpen(false)
      toast.success(`${tiles.length} asset(s) added successfully to ${category}.`)
      onAdd?.({ category, tiles: preparedTiles })
    }, 800)
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

    assets.forEach((a) => {
      if (currentSlugs.has(a.category) || (a as any).parentSlug === config.slug) {
        const catConfig = customCategories[a.category] || (a.category === config.slug ? config : undefined)
        if (catConfig?.title) {
          cats.add(catConfig.title)
        } else if ((a as any).categoryTitle) {
          cats.add((a as any).categoryTitle)
        }
      }
    })

    // If charger branding or any connected company master page, include companies from Company Master
    if (isCompanyConnectedPage) {
      masterCompanies.forEach((c) => cats.add(c))
    }

    return Array.from(cats).filter(Boolean)
  }, [config, customCategories, assets, masterCompanies, isCompanyConnectedPage])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        trigger || (
          <Button className="h-11 px-5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer">
            <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
            <span>Add Asset</span>
          </Button>
        )
      } />
      <DialogContent className="sm:max-w-5xl p-[35px]">
        <DialogHeader>
          <DialogTitle className="text-[1.625rem] font-extrabold tracking-tight leading-tight">
            Add Asset
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Create a new category or select an existing one, then upload your branding assets.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2">
          
          {config.slug === "letterhead" ? (
            <>
              {/* 1) Text box With Selection Arrow: Category Name */}
              <div className="grid gap-1.5 text-left">
                <Label htmlFor="category" className="text-sm font-semibold text-foreground tracking-wide">
                  Category Name
                </Label>
                <AutocompleteInput
                  id="category"
                  options={existingCategories}
                  placeholder="Select or enter category name..."
                  value={category}
                  onChange={(val) => {
                    setCategory(val)
                    setTitleName(val)
                  }}
                  required
                />
              </div>

              {/* 2) Default Serial Number (in small Box) + Title Text Box in same row */}
              <div className="grid gap-1.5 text-left">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-foreground tracking-wide">
                    Title Number & Title Name
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Serial number automatically increments from 0
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Small Box for Serial / Title Number */}
                  <div className="w-24 shrink-0" title="Title Number (starts from 0)">
                    <Input
                      id="title-number"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={titleNumber}
                      onChange={(e) => setTitleNumber(e.target.value)}
                      required
                      className="h-11 text-center font-bold border-border/70 bg-muted/30 focus:bg-background focus:border-primary/60 transition-colors rounded-lg"
                    />
                  </div>
                  
                  {/* Title Text Box: (Ex. General Documents) */}
                  <div className="flex-1">
                    <Input
                      id="title-name"
                      placeholder="Ex. General Documents"
                      value={titleName}
                      onChange={(e) => setTitleName(e.target.value)}
                      required
                      className="h-11 border-border/70 bg-muted/30 focus:bg-background focus:border-primary/60 transition-colors rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* 3) Company Name Text Box */}
              <div className="grid gap-1.5 text-left">
                <Label htmlFor="company-name" className="text-sm font-semibold text-foreground tracking-wide">
                  Company Name
                </Label>
                <Input
                  id="company-name"
                  placeholder="Ex. Transvolt Official Document"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="h-11 border-border/70 bg-background font-bold focus:border-primary/60 transition-colors rounded-lg"
                />
              </div>

              {/* 4) 3 Upload options with increased text size */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                <div className="flex flex-col gap-2 text-left">
                  <FileDropzone 
                    type="JPG" 
                    fileState={{ file: headerJpg, previewUrl: headerJpg ? URL.createObjectURL(headerJpg) : null }} 
                    onChange={setHeaderJpg} 
                  />
                  <span className="text-sm font-bold text-foreground/85 text-center mt-1">
                    Upload Header JPG
                  </span>
                </div>

                <div className="flex flex-col gap-2 text-left">
                  <FileDropzone 
                    type="JPG" 
                    fileState={{ file: footerJpg, previewUrl: footerJpg ? URL.createObjectURL(footerJpg) : null }} 
                    onChange={setFooterJpg} 
                  />
                  <span className="text-sm font-bold text-foreground/85 text-center mt-1">
                    Upload Footer JPG
                  </span>
                </div>

                <div className="flex flex-col gap-2 text-left">
                  <FileDropzone 
                    type="WORD" 
                    fileState={{ file: headerWord, previewUrl: null }} 
                    onChange={setHeaderWord} 
                  />
                  <span className="text-sm font-bold text-foreground/85 text-center mt-1">
                    Upload Header Word
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Category / Company Selection */}
              {isCompanyConnectedPage ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-1.5 text-left">
                    <Label htmlFor="category" className="text-sm font-semibold text-foreground tracking-wide">
                      Category as Company <span className="text-red-500">*</span>
                    </Label>
                    <AutocompleteInput
                      id="category"
                      options={existingCategories}
                      placeholder="Select existing or type company name..."
                      value={category}
                      onChange={setCategory}
                      disabled={!!categoryOverride}
                      required
                      leftIcon={<Building className="h-4 w-4" />}
                    />
                  </div>

                  <div className="grid gap-1.5 text-left">
                    <Label htmlFor="charger-site" className="text-sm font-semibold text-foreground tracking-wide">
                      Site Location <span className="text-red-500">*</span>
                    </Label>
                    <AutocompleteInput
                      id="charger-site"
                      options={getUniqueSiteLocations(category, config.slug)}
                      placeholder="Select or type site location..."
                      value={chargerSiteLocation}
                      onChange={setChargerSiteLocation}
                      required
                      leftIcon={<MapPin className="h-4 w-4" />}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-1.5">
                  <Label htmlFor="category" className="text-sm font-semibold text-foreground tracking-wide">
                    Create / Select Category
                  </Label>
                  <AutocompleteInput
                    id="category"
                    options={categoryOverride ? [] : existingCategories}
                    placeholder="Select existing or type a new category..."
                    value={category}
                    onChange={setCategory}
                    disabled={!!categoryOverride}
                    required
                    leftIcon={
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    }
                  />
                </div>
              )}

              {/* Asset Tiles List */}
              <div className="space-y-6 max-h-[50vh] overflow-y-auto px-1 pb-4">
                {tiles.map((tile, index) => (
                  <div key={tile.id} className="relative border border-border/60 rounded-xl p-6 bg-muted/30">
                    {index > 0 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon-sm" 
                        className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 hover:text-destructive" 
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
                            className="pl-9 h-11 border-border/70 bg-background focus:border-primary/60 transition-colors rounded-lg"
                          />
                        </div>
                      </div>
                      
                      <div className={cn(
                        "grid gap-4 mt-2",
                        isPresentation ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-xl" : "grid-cols-2 lg:grid-cols-6"
                      )}>
                        {(isPresentation ? (["PPT"] as FileType[]) : (["JPG", "PNG", "SVG", "PDF", "WORD", "CDR"] as FileType[])).map(type => (
                          <FileDropzone
                            key={type}
                            type={type}
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
                  className="w-full border-dashed py-8" 
                  onClick={handleAddTile}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add More Asset Tiles
                </Button>
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save All Assets"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
