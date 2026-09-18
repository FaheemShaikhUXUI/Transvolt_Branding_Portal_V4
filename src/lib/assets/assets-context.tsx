"use client"

import * as React from "react"
import { assetPagesConfig, AssetPageConfig } from "@/config/asset-pages"
import { Asset, PhotoItem } from "@/components/assets/asset-tile"
export type { PhotoItem }
import {
  getOriginalPhotosMap,
  saveOriginalPhotosBatch,
  saveAllAssetsToDB,
  getAllAssetsFromDB,
} from "./photo-vault"
import { getInitialSitePhotoAssets } from "./site-photos-seed"
import { getInitialEmployeePhotoAssets } from "./employee-photos-seed"
import { getInitialLogoAssets } from "./logo-seed"
import { Palette, FileText, MonitorPlay, Monitor, Printer, IdCard, Car, Zap, Image as ImageIcon, LucideIcon, Type, Compass } from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  "logo-color": Palette,
  "typography": Type,
  "brand-philosophy": Compass,
  "letterhead": FileText,
  "presentation": MonitorPlay,
  "digital-assets": Monitor,
  "printing-assets": Printer,
  "id-business-cards": IdCard,
  "vehicle-branding": Car,
  "charger-branding": Zap,
  "photos": ImageIcon,
}

export interface NavigationItem {
  title: string
  href: string
  icon: LucideIcon
}

interface AssetsContextType {
  assets: Asset[]
  customCategories: Record<string, AssetPageConfig>
  getCategoryConfig: (slug: string) => AssetPageConfig | undefined
  getNavigationItems: () => NavigationItem[]
  addAssets: (categoryTitle: string, tiles: any[], parentSlug: string) => Promise<void>
  addCustomAsset: (asset: Asset) => void
  updateCustomAsset: (asset: Asset) => void
  updateAsset: (id: string, data: { name?: string; categoryTitle?: string; parentSlug?: string; files?: Record<string, { file: File | null; previewUrl?: string | null }> }) => Promise<void>
  updateCategoryAndAssets: (oldCategorySlug: string, newCategoryTitle: string, tiles: any[], parentSlug: string) => Promise<void>
  deleteAsset: (id: string) => void
  toggleHoldAsset: (id: string) => void
  replaceAssetFormat: (id: string, type: string, file: File) => Promise<void>
}

const AssetsContext = React.createContext<AssetsContextType | undefined>(undefined)

const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => resolve("")
  })
}

export const optimizeDataUrlThumbnail = (
  source: string,
  isEventOrSite: boolean = false
): Promise<string> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !source || !source.startsWith("data:image")) {
      resolve(source || "")
      return
    }
    const maxDim = isEventOrSite ? 144 : 480
    const quality = isEventOrSite ? 0.65 : 0.8
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      try {
        let w = img.naturalWidth || img.width
        let h = img.naturalHeight || img.height
        if (!w || !h) {
          resolve(source)
          return
        }
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w)
            w = maxDim
          } else {
            w = Math.round((w * maxDim) / h)
            h = maxDim
          }
        }
        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(source)
          return
        }
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL("image/jpeg", quality))
      } catch {
        resolve(source)
      }
    }
    img.onerror = () => resolve(source)
    img.src = source
  })
}

const createThumbnail = async (file: File, isEventOrSite: boolean = false): Promise<string> => {
  if (typeof window === "undefined") return fileToDataURL(file)
  try {
    const isTransparent = file.type === "image/png" || file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".png") || file.name.toLowerCase().endsWith(".svg")
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(url)
        try {
          if (isTransparent) {
            // Never convert transparent images to JPEG (which turns transparent pixels black)
            const maxDim = isEventOrSite ? 144 : 720
            let w = img.naturalWidth || img.width
            let h = img.naturalHeight || img.height
            if (w <= maxDim && h <= maxDim) {
              fileToDataURL(file).then(resolve)
              return
            }
            if (w > h) {
              h = Math.round((h * maxDim) / w)
              w = maxDim
            } else {
              w = Math.round((w * maxDim) / h)
              h = maxDim
            }
            const canvas = document.createElement("canvas")
            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext("2d")
            if (!ctx) {
              fileToDataURL(file).then(resolve)
              return
            }
            ctx.clearRect(0, 0, w, h)
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = "high"
            ctx.drawImage(img, 0, 0, w, h)
            resolve(canvas.toDataURL("image/png"))
            return
          }

          const maxDim = isEventOrSite ? 144 : 480
          const quality = isEventOrSite ? 0.65 : 0.8
          let w = img.naturalWidth || img.width
          let h = img.naturalHeight || img.height
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w)
              w = maxDim
            } else {
              w = Math.round((w * maxDim) / h)
              h = maxDim
            }
          }
          const canvas = document.createElement("canvas")
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            fileToDataURL(file).then(resolve)
            return
          }
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0, w, h)
          resolve(canvas.toDataURL("image/jpeg", quality))
        } catch {
          fileToDataURL(file).then(resolve)
        }
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        fileToDataURL(file).then(resolve)
      }
      img.src = url
    })
  } catch {
    return fileToDataURL(file)
  }
}

export function AssetsProvider({ children }: { children: React.ReactNode }) {
  const [assets, setAssets] = React.useState<Asset[]>([])
  const [customCategories, setCustomCategories] = React.useState<Record<string, AssetPageConfig>>({})

  React.useEffect(() => {
    async function initializeAssets() {
      try {
        // 1. Check IndexedDB Photo Vault first (unlimited multi-gigabyte storage, zero loss)
        const dbAssets = await getAllAssetsFromDB()
        let sourceAssets: Asset[] | null = dbAssets && dbAssets.length > 0 ? dbAssets : null

        // 2. Fallback to localStorage if IndexedDB is empty (first migration)
        if (!sourceAssets) {
          const storedAssets = localStorage.getItem("branding_portal_assets")
          if (storedAssets) {
            try {
              const parsed = JSON.parse(storedAssets)
              if (Array.isArray(parsed) && parsed.length > 0) {
                sourceAssets = parsed
              }
            } catch {
              sourceAssets = null
            }
          }
        }

        let finalAssets: Asset[] = sourceAssets || []

        // Handle legacy migration if needed
        const isOldFormat = finalAssets.length > 0 && !(finalAssets[0] as any).formats
        if (isOldFormat) {
          const grouped: Record<string, Asset> = {}
          finalAssets.forEach((oldAsset: any) => {
            const groupKey = `${oldAsset.name}-${oldAsset.category}`
            if (!grouped[groupKey]) {
              grouped[groupKey] = {
                id: oldAsset.id,
                name: oldAsset.name,
                category: oldAsset.category || "logo-color",
                status: (oldAsset.status === "hidden" ? "hold" : oldAsset.status) || "active",
                createdAt: oldAsset.updatedAt || new Date().toLocaleDateString("en-US"),
                updatedAt: oldAsset.updatedAt || new Date().toLocaleDateString("en-US"),
                createdBy: oldAsset.createdBy || "Administrator",
                formats: {},
                thumbnail: oldAsset.thumbnail,
              }
            }
            const type = oldAsset.type as "PNG" | "SVG" | "PDF" | "CDR"
            if (type) {
              grouped[groupKey].formats[type] = {
                fileName: oldAsset.description || `${oldAsset.name}.${type.toLowerCase()}`,
                fileData: oldAsset.thumbnail || "mock-data",
              }
              if (type === "PNG") {
                grouped[groupKey].formats.JPG = {
                  fileName: (oldAsset.description || `${oldAsset.name}.png`).replace(/\.png$/i, ".jpg"),
                  fileData: oldAsset.thumbnail || "mock-data",
                }
              }
            }
          })
          finalAssets = Object.values(grouped)
        }

        // Ensure default Logo, Site and Employee seed assets exist
        const logoAssets = finalAssets.filter((a) => a.category === "logo-color")
        if (logoAssets.length < 6) {
          const nonLogoAssets = finalAssets.filter((a) => a.category !== "logo-color")
          finalAssets = [...getInitialLogoAssets(), ...nonLogoAssets]
        }

        const hasSite = finalAssets.some((a) => a.category === "photos" && a.subCategory === "Site")
        if (!hasSite) {
          finalAssets = [...finalAssets, ...getInitialSitePhotoAssets()]
        } else {
          // Ensure existing stored site collections include seed video items
          finalAssets = finalAssets.map((asset) => {
            if (asset.id === "photo_col_site_bkc_hub" && !asset.photos?.some((p) => p.type?.includes("video") || p.name?.endsWith(".mp4"))) {
              const seedBkc = getInitialSitePhotoAssets().find((a) => a.id === "photo_col_site_bkc_hub")
              if (seedBkc?.photos) {
                return { ...asset, photos: seedBkc.photos }
              }
            }
            if (asset.id === "photo_col_site_bengaluru_depot" && !asset.photos?.some((p) => p.type?.includes("video") || p.name?.endsWith(".mp4"))) {
              const seedBlr = getInitialSitePhotoAssets().find((a) => a.id === "photo_col_site_bengaluru_depot")
              if (seedBlr?.photos) {
                return { ...asset, photos: seedBlr.photos }
              }
            }
            return asset
          })
        }

        const hasEmployee = finalAssets.some((a) => a.category === "photos" && a.subCategory === "Employee")
        if (!hasEmployee) {
          finalAssets = [...finalAssets, ...getInitialEmployeePhotoAssets()]
        }

        // Clean up any black thumbnails and ensure Logo tiles use transparent PNG files
        finalAssets = finalAssets.map((asset) => {
          const catConfig = customCategories[asset.category] || assetPagesConfig[asset.category]
          const isLogo = asset.category === "logo-color"
            || (catConfig as any)?.parentSlug === "logo-color"
            || (asset as any).parentSlug === "logo-color"
            || asset.category?.toLowerCase().includes("logo")
            || asset.titleName?.toLowerCase().includes("logo")
            || asset.name?.toLowerCase().includes("logo")

          const pngData = asset.formats?.PNG?.fileData || (asset.formats as any)?.png?.fileData

          if (isLogo && pngData) {
            return {
              ...asset,
              thumbnail: pngData,
            }
          }
          if (asset.thumbnail?.startsWith("data:image/jpeg") && pngData) {
            return {
              ...asset,
              thumbnail: pngData,
            }
          }
          return asset
        })

        // Set state & persist master assets to IndexedDB
        setAssets(finalAssets)
        saveAllAssetsToDB(finalAssets).catch(() => {})
      } catch (e) {
        console.error("Failed to initialize assets:", e)
      }
    }

    initializeAssets()

    const storedCats = localStorage.getItem("branding_portal_custom_categories")
    if (storedCats) {
      try {
        const parsed = JSON.parse(storedCats)
        let changed = false
        Object.keys(parsed).forEach((key) => {
          if (!parsed[key].parentSlug) {
            parsed[key].parentSlug = "logo-color"
            changed = true
          }
        })
        setCustomCategories(parsed)
        if (changed) {
          localStorage.setItem("branding_portal_custom_categories", JSON.stringify(parsed))
        }
      } catch (e) {
        console.error("Failed to parse custom categories", e)
      }
    }
  }, [])

  const saveAssetsToStorage = (newAssets: Asset[]) => {
    // 1. Immediate in-memory React state update (reactive UI)
    setAssets(newAssets)

    // 2. Persist full-resolution assets to IndexedDB photo vault (unlimited quota)
    saveAllAssetsToDB(newAssets).catch((err) => {
      console.warn("Failed to persist assets to IndexedDB vault:", err)
    })

    // 3. Batch save any photo items to the photo vault key-value store
    const itemsToVault: { id: string; data: string }[] = []
    newAssets.forEach((a) => {
      if (a.category === "photos") {
        a.photos?.forEach((p) => {
          const orig = (p as any).originalUrl || p.url
          if (p.id && orig && typeof orig === "string" && orig.startsWith("data:")) {
            itemsToVault.push({ id: p.id, data: orig })
          }
        })
        const prim = a.formats?.PNG?.fileData || a.formats?.JPG?.fileData
        if (a.id && prim && typeof prim === "string" && prim.startsWith("data:")) {
          itemsToVault.push({ id: a.id, data: prim })
        }
      }
    })
    if (itemsToVault.length > 0) {
      saveOriginalPhotosBatch(itemsToVault).catch(() => {})
    }

    // 4. Mirror lightweight metadata to localStorage (always sanitize first to prevent memory spikes)
    try {
      const sanitized = newAssets.map((a) => {
        if (a.category !== "photos") return a
        return {
          ...a,
          thumbnail: a.thumbnail && a.thumbnail.length > 25000 ? "" : a.thumbnail,
          formats: a.formats
            ? Object.fromEntries(
                Object.entries(a.formats).map(([fmt, val]) => [
                  fmt,
                  {
                    ...val,
                    fileData: val.fileData && val.fileData.length > 25000 ? "vault-stored" : val.fileData,
                  },
                ])
              )
            : a.formats,
          photos: a.photos?.map((p) => ({
            ...p,
            url: p.url && p.url.length > 25000 ? "" : p.url,
            thumbnailUrl: p.thumbnailUrl && p.thumbnailUrl.length > 25000 ? "" : p.thumbnailUrl,
            originalUrl: undefined,
          })),
        }
      })
      localStorage.setItem("branding_portal_assets", JSON.stringify(sanitized))
    } catch {
      // Quota limit or serialization fallback: IndexedDB holds master assets
    }
  }

  const saveCustomCategoriesToStorage = (newCats: Record<string, AssetPageConfig>) => {
    setCustomCategories(newCats)
    localStorage.setItem("branding_portal_custom_categories", JSON.stringify(newCats))
  }

  const getCategoryConfig = (slug: string): AssetPageConfig | undefined => {
    if (assetPagesConfig[slug]) return assetPagesConfig[slug]
    return customCategories[slug]
  }

  const getNavigationItems = (): NavigationItem[] => {
    const defaultNav = [
      { title: "Dashboard", href: "/dashboard", icon: iconMap["dashboard"] || FileText },
      { title: "Logo & Color", href: "/logo-color", icon: Palette },
      { title: "Typography", href: "/typography", icon: Type },
      { title: "Brand Philosophy", href: "/brand-philosophy", icon: Compass },
      { title: "Letterhead", href: "/letterhead", icon: FileText },
      { title: "Presentation", href: "/presentation", icon: MonitorPlay },
      { title: "Digital Assets", href: "/digital-assets", icon: Monitor },
      { title: "Printing Assets", href: "/printing-assets", icon: Printer },
      { title: "ID Cards & Business Cards", href: "/id-business-cards", icon: IdCard },
      { title: "Vehicle Branding", href: "/vehicle-branding", icon: Car },
      { title: "Charger Branding", href: "/charger-branding", icon: Zap },
      { title: "Photos and Videos Repository", href: "/photos", icon: ImageIcon },
    ]

    const customNav: NavigationItem[] = Object.values(customCategories).map((cat) => ({
      title: cat.title,
      href: `/${cat.slug}`,
      icon: iconMap[cat.slug] || FileText,
    }))

    return [...defaultNav, ...customNav]
  }

  const addAssets = async (categoryTitle: string, tiles: any[], parentSlug: string) => {
    let slug = Object.keys(assetPagesConfig).find(
      (key) => assetPagesConfig[key].title.toLowerCase() === categoryTitle.toLowerCase()
    )

    if (!slug) {
      slug = Object.keys(customCategories).find(
        (key) => customCategories[key].title.toLowerCase() === categoryTitle.toLowerCase()
      )
    }

    if (!slug) {
      const tempSlug = categoryTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      if (assetPagesConfig[tempSlug]) {
        slug = tempSlug
      } else if (customCategories[tempSlug]) {
        slug = tempSlug
      }
    }

    if (!slug) {
      slug = categoryTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      const newCat: AssetPageConfig = {
        slug,
        title: categoryTitle,
        description: `The ${categoryTitle} contains official templates, materials and visual guides approved by Transvolt branding standards.`,
        emptyStateTitle: `No ${categoryTitle} assets found`,
        emptyStateDescription: `Get started by adding your first asset in the ${categoryTitle} category.`,
        ...({ parentSlug } as any)
      }
      saveCustomCategoriesToStorage({
        ...customCategories,
        [slug]: newCat,
      })
    }

    const newlyCreatedAssets: Asset[] = []

    for (const tile of tiles) {
      // Support pre-processed custom variants (Vehicle Branding)
      if (tile.variants && Array.isArray(tile.variants) && tile.variants.length > 0) {
        const firstVariant = tile.variants[0]
        const thumb = firstVariant.thumbnail || firstVariant.formats?.JPG?.fileData || ""
        const newAsset: Asset = {
          id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          name: tile.name || `${tile.companyName || "Vehicle"} - ${tile.titleName || "Branding"}`,
          category: slug,
          status: "active",
          createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          createdBy: "Administrator",
          formats: firstVariant.formats || {},
          thumbnail: thumb,
          categoryNumber: tile.categoryNumber || tile.titleNumber,
          titleNumber: tile.titleNumber || tile.categoryNumber,
          titleName: tile.titleName,
          companyName: tile.companyName,
          setId: tile.setId,
          variants: tile.variants
        }
        newlyCreatedAssets.push(newAsset)
        continue
      }

      // Support pre-processed tile with formats (e.g. separate vehicle branding variant tiles)
      if (tile.formats && Object.keys(tile.formats).length > 0) {
        const thumb = tile.thumbnail || tile.formats.JPG?.fileData || tile.formats.PNG?.fileData || ""
        const newAsset: Asset = {
          id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          name: tile.name,
          category: slug,
          status: tile.status || "active",
          createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          createdBy: "Administrator",
          formats: tile.formats,
          thumbnail: thumb,
          categoryNumber: tile.categoryNumber || tile.titleNumber,
          titleNumber: tile.titleNumber || tile.categoryNumber,
          titleName: tile.titleName,
          companyName: tile.companyName,
          setId: tile.setId,
        }
        newlyCreatedAssets.push(newAsset)
        continue
      }

      const formats: Asset["formats"] = {}
      let thumbnail = ""

      const isLogoSlug = slug === "logo-color" 
        || parentSlug === "logo-color" 
        || slug.toLowerCase().includes("logo") 
        || categoryTitle.toLowerCase().includes("logo") 
        || tile.name?.toLowerCase().includes("logo")

      if (tile.files?.PNG?.file) {
        const file = tile.files.PNG.file
        const originalData = await fileToDataURL(file)
        thumbnail = originalData
        formats.PNG = { fileName: file.name, fileData: originalData }
        if (!formats.JPG) {
          formats.JPG = { fileName: file.name.replace(/\.png$/i, ".jpg"), fileData: originalData }
        }
      }

      if (tile.files?.JPG?.file) {
        const file = tile.files.JPG.file
        const originalData = await fileToDataURL(file)
        const thumb = await createThumbnail(file)
        if (!thumbnail && !isLogoSlug) thumbnail = thumb || originalData
        formats.JPG = { fileName: file.name, fileData: originalData }
      }

      if (tile.files?.SVG?.file) {
        const file = tile.files.SVG.file
        const text = await fileToDataURL(file)
        formats.SVG = { fileName: file.name, fileData: text }
        if (!thumbnail && !formats.PNG) thumbnail = text
      }

      if (tile.files?.PDF?.file) {
        const file = tile.files.PDF.file
        formats.PDF = { fileName: file.name, fileData: "mock-pdf-data" }
      }

      if (tile.files?.WORD?.file) {
        const file = tile.files.WORD.file
        formats.WORD = { fileName: file.name, fileData: "mock-word-data" }
      }

      if (tile.files?.CDR?.file) {
        const file = tile.files.CDR.file
        formats.CDR = { fileName: file.name, fileData: "mock-cdr-data" }
      }

      if (tile.files?.PPT?.file) {
        const file = tile.files.PPT.file
        const fileData = await fileToDataURL(file)
        formats.PPT = { fileName: file.name, fileData: fileData || "mock-ppt-data" }
      }

      if (Object.keys(formats).length > 0) {
        const newAsset: Asset = {
          id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          name: tile.name,
          category: slug,
          status: "active",
          createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          createdBy: "Administrator",
          formats,
          thumbnail: (isLogoSlug && formats.PNG?.fileData)
            ? formats.PNG.fileData 
            : (thumbnail || formats.PNG?.fileData || formats.JPG?.fileData || formats.SVG?.fileData || ""),
          categoryNumber: tile.categoryNumber || tile.titleNumber,
          titleNumber: tile.titleNumber || tile.categoryNumber,
          titleName: tile.titleName,
          companyName: tile.companyName,
          setId: tile.setId
        }
        newlyCreatedAssets.push(newAsset)
      }
    }

    saveAssetsToStorage([...assets, ...newlyCreatedAssets])
  }

  const deleteAsset = (id: string) => {
    saveAssetsToStorage(assets.filter((a) => a.id !== id))
  }

  const toggleHoldAsset = (id: string) => {
    const updated = assets.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          status: a.status === "hold" ? ("active" as const) : ("hold" as const),
          updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        }
      }
      return a
    })
    saveAssetsToStorage(updated)
  }

  const replaceAssetFormat = async (id: string, type: string, file: File) => {
    let fileData = await fileToDataURL(file)
    let thumbnailUpdate = {}
    if (type === "PNG" || type === "JPG" || type === "SVG") {
      thumbnailUpdate = { thumbnail: await createThumbnail(file) }
    }

    const updated = assets.map((a) => {
      if (a.id === id) {
        const newFormats = {
          ...a.formats,
          [type]: { fileName: file.name, fileData }
        }
        if (type === "PNG") {
          newFormats.JPG = {
            fileName: file.name.replace(/\.png$/i, ".jpg"),
            fileData: fileData
          }
        }
        let updatedVariants = a.variants
        if (updatedVariants && updatedVariants.length > 0) {
          updatedVariants = updatedVariants.map((v, i) => {
            if (i === 0) {
              return {
                ...v,
                formats: {
                  ...v.formats,
                  [type]: { fileName: file.name, fileData }
                }
              }
            }
            return v
          })
        }
        return {
          ...a,
          ...thumbnailUpdate,
          formats: newFormats,
          variants: updatedVariants,
          updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        }
      }
      return a
    })
    saveAssetsToStorage(updated)
  }

  const updateAsset = async (
    id: string, 
    data: {
      name?: string;
      categoryTitle?: string;
      parentSlug?: string;
      files?: Record<string, { file: File | null; previewUrl?: string | null }>;
    }
  ) => {
    let targetCategorySlug: string | undefined = undefined
    if (data.categoryTitle && data.categoryTitle.trim().length > 0) {
      const slug = data.categoryTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      targetCategorySlug = slug
      if (!assetPagesConfig[slug] && !customCategories[slug]) {
        const newCat: AssetPageConfig = {
          slug,
          title: data.categoryTitle.trim(),
          description: `Assets for ${data.categoryTitle.trim()}`,
          emptyStateTitle: `No assets in ${data.categoryTitle.trim()}`,
          emptyStateDescription: "Upload assets for this category.",
          ...(data.parentSlug ? { parentSlug: data.parentSlug } : {})
        }
        saveCustomCategoriesToStorage({
          ...customCategories,
          [slug]: newCat,
        })
      }
    }

    const updated = await Promise.all(assets.map(async (a) => {
      if (a.id === id) {
        const newFormats = { ...a.formats }
        let newThumbnail = a.thumbnail

        if (data.files) {
          for (const [fmt, fileObj] of Object.entries(data.files)) {
            if (fileObj.file) {
              const file = fileObj.file
              const originalData = await fileToDataURL(file)
              if (fmt === "PNG" || fmt === "JPG" || fmt === "SVG") {
                const thumb = await createThumbnail(file)
                newThumbnail = thumb || originalData
              }
              (newFormats as any)[fmt] = { fileName: file.name, fileData: originalData }
            }
          }
        }

        return {
          ...a,
          name: data.name?.trim() || a.name,
          category: targetCategorySlug || a.category,
          titleName: data.categoryTitle?.trim() || a.titleName || a.category,
          formats: newFormats,
          thumbnail: newThumbnail,
          updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        }
      }
      return a
    }))

    saveAssetsToStorage(updated)
  }

  const updateCategoryAndAssets = async (
    oldCategorySlug: string,
    newCategoryTitle: string,
    tiles: Array<{
      id?: string;
      name: string;
      files: Record<string, { file: File | null; previewUrl?: string | null }>;
      existingFormats?: Record<string, { fileName: string; fileData: string }>;
      categoryNumber?: string;
      titleNumber?: string;
      titleName?: string;
      companyName?: string;
      setId?: string;
    }>,
    parentSlug: string
  ) => {
    const trimmedTitle = newCategoryTitle.trim()
    const newSlug = trimmedTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || oldCategorySlug

    // Update categories
    const nextCustomCats = { ...customCategories }
    if (newSlug !== oldCategorySlug && !assetPagesConfig[oldCategorySlug]) {
      delete nextCustomCats[oldCategorySlug]
    }
    if (!assetPagesConfig[newSlug]) {
      nextCustomCats[newSlug] = {
        slug: newSlug,
        title: trimmedTitle,
        description: `Assets for ${trimmedTitle}`,
        emptyStateTitle: `No assets in ${trimmedTitle}`,
        emptyStateDescription: "Upload assets for this category.",
        ...(parentSlug ? { parentSlug } : {})
      }
    } else {
      nextCustomCats[newSlug] = {
        ...assetPagesConfig[newSlug],
        title: trimmedTitle,
      }
    }
    saveCustomCategoriesToStorage(nextCustomCats)

    // Process all tiles
    const updatedCategoryAssets: Asset[] = []

    for (const tile of tiles) {
      const formats: Asset["formats"] = { ...(tile.existingFormats || {}) }
      let thumbnail = ""

      // Find if there was an original asset to keep its thumbnail
      const existingAsset = tile.id ? assets.find(a => a.id === tile.id) : undefined
      if (existingAsset?.thumbnail) {
        thumbnail = existingAsset.thumbnail
      }

      for (const [fmt, fileObj] of Object.entries(tile.files)) {
        if (fileObj?.file) {
          const file = fileObj.file
          const originalData = await fileToDataURL(file)
          if (fmt === "PNG" || fmt === "JPG" || fmt === "SVG") {
            const thumb = await createThumbnail(file)
            thumbnail = thumb || originalData
          }
          (formats as any)[fmt] = { fileName: file.name, fileData: originalData }
          if (fmt === "PNG" && !formats.JPG) {
            formats.JPG = { fileName: file.name.replace(/\.png$/i, ".jpg"), fileData: originalData }
          }
        }
      }

      if (Object.keys(formats).length > 0) {
        const assetId = tile.id || (Math.random().toString(36).substring(2, 9) + Date.now().toString(36))
        const existing = assets.find(a => a.id === assetId)

        const assetObj: Asset = {
          id: assetId,
          name: tile.name.trim() || existing?.name || "Untitled Asset",
          category: newSlug,
          status: existing?.status || "active",
          createdAt: existing?.createdAt || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          createdBy: existing?.createdBy || "Administrator",
          formats,
          thumbnail: thumbnail || formats.PNG?.fileData || formats.JPG?.fileData || formats.SVG?.fileData || "",
          categoryNumber: tile.categoryNumber || existing?.categoryNumber,
          titleNumber: tile.titleNumber || existing?.titleNumber,
          titleName: trimmedTitle,
          companyName: tile.companyName || existing?.companyName,
          setId: tile.setId || existing?.setId,
        }
        updatedCategoryAssets.push(assetObj)
      }
    }

    // Keep assets that do not belong to the old category or the updated tiles
    const tileIds = new Set(tiles.map(t => t.id).filter(Boolean))
    const remainingAssets = assets.filter(a => a.category !== oldCategorySlug && !tileIds.has(a.id))
    const finalAssets = [...remainingAssets, ...updatedCategoryAssets]
    saveAssetsToStorage(finalAssets)
  }

  const addCustomAsset = (newAsset: Asset) => {
    if (newAsset.category === "photos") {
      const itemsToVault: { id: string; data: string }[] = []
      if (newAsset.photos) {
        newAsset.photos.forEach((p) => {
          const original = (p as any).originalUrl || p.url
          if (p.id && original) itemsToVault.push({ id: p.id, data: original })
        })
      }
      const primaryOriginal = newAsset.formats?.PNG?.fileData || newAsset.formats?.JPG?.fileData
      if (primaryOriginal) {
        itemsToVault.push({ id: newAsset.id, data: primaryOriginal })
      }
      if (itemsToVault.length > 0) {
        saveOriginalPhotosBatch(itemsToVault).catch(() => {})
      }
    }
    saveAssetsToStorage([newAsset, ...assets])
  }

  const updateCustomAsset = (updatedAsset: Asset) => {
    if (updatedAsset.category === "photos") {
      const itemsToVault: { id: string; data: string }[] = []
      if (updatedAsset.photos) {
        updatedAsset.photos.forEach((p) => {
          const original = (p as any).originalUrl || p.url
          if (p.id && original) itemsToVault.push({ id: p.id, data: original })
        })
      }
      const primaryOriginal = updatedAsset.formats?.PNG?.fileData || updatedAsset.formats?.JPG?.fileData
      if (primaryOriginal) {
        itemsToVault.push({ id: updatedAsset.id, data: primaryOriginal })
      }
      if (itemsToVault.length > 0) {
        saveOriginalPhotosBatch(itemsToVault).catch(() => {})
      }
    }
    const updated = assets.map((a) => (a.id === updatedAsset.id ? updatedAsset : a))
    saveAssetsToStorage(updated)
  }

  return (
    <AssetsContext.Provider
      value={{
        assets,
        customCategories,
        getCategoryConfig,
        getNavigationItems,
        addAssets,
        addCustomAsset,
        updateCustomAsset,
        updateAsset,
        updateCategoryAndAssets,
        deleteAsset,
        toggleHoldAsset,
        replaceAssetFormat,
      }}
    >
      {children}
    </AssetsContext.Provider>
  )
}

export function useAssets() {
  const context = React.useContext(AssetsContext)
  if (context === undefined) {
    throw new Error("useAssets must be used within an AssetsProvider")
  }
  return context
}
