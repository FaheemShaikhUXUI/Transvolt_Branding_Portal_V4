"use client"

import * as React from "react"
import { Car, MapPin, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAssets } from "@/lib/assets/assets-context"
import { VehicleBrandingTile, VehicleVariantItem } from "./vehicle-branding-tile"
import { AddVehicleBrandingModal } from "./add-vehicle-branding-modal"
import { toast } from "sonner"

interface VehicleBrandingSectionProps {
  searchQuery?: string
}

interface VehicleGroup {
  key: string
  companyName: string
  siteLocation: string
  variants: VehicleVariantItem[]
}

export function VehicleBrandingSection({ searchQuery = "" }: VehicleBrandingSectionProps) {
  const { assets, deleteAsset, toggleHoldAsset } = useAssets()

  // Extract all vehicle branding variants into flat display items
  const allVariants = React.useMemo(() => {
    const items: VehicleVariantItem[] = []

    assets.forEach((asset) => {
      // Check if this asset belongs to vehicle branding
      const isVehicleBranding =
        asset.category === "vehicle-branding" ||
        asset.category?.toLowerCase().includes("vehicle") ||
        (asset as any).parentSlug === "vehicle-branding"

      if (!isVehicleBranding) return

      // Handle legacy assets with embedded variants array
      if (asset.variants && Array.isArray(asset.variants) && asset.variants.length > 0) {
        asset.variants.forEach((v, idx) => {
          items.push({
            id: `${asset.id}_var_${idx}`,
            name: v.name || asset.name,
            companyName: asset.companyName || "Transvolt Mobility",
            siteLocation: asset.titleName || "Main Depot",
            thumbnail: v.thumbnail || v.formats?.JPG?.fileData || asset.thumbnail,
            formats: v.formats || {},
            status: (asset.status as "active" | "hold") || "active",
            assetId: asset.id,
            variantIndex: idx,
          })
        })
      } else {
        // Individual variant tile asset
        items.push({
          id: asset.id,
          name: asset.name,
          companyName: asset.companyName || "Transvolt Mobility",
          siteLocation: asset.titleName || "Main Depot",
          thumbnail: asset.thumbnail || asset.formats?.JPG?.fileData,
          formats: asset.formats || {},
          status: (asset.status as "active" | "hold") || "active",
          assetId: asset.id,
        })
      }
    })

    return items
  }, [assets])

  // Filter variants by search query
  const filteredVariants = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return allVariants

    return allVariants.filter(
      (v) =>
        v.name.toLowerCase().includes(query) ||
        v.companyName.toLowerCase().includes(query) ||
        v.siteLocation.toLowerCase().includes(query)
    )
  }, [allVariants, searchQuery])

  // Group variants by: Company Name and Site
  const groups = React.useMemo(() => {
    const map = new Map<string, VehicleGroup>()

    filteredVariants.forEach((variant) => {
      const company = variant.companyName.trim() || "Unspecified Company"
      const site = variant.siteLocation.trim() || "Main Site"
      const groupKey = `${company}____${site}`

      if (!map.has(groupKey)) {
        map.set(groupKey, {
          key: groupKey,
          companyName: company,
          siteLocation: site,
          variants: [],
        })
      }

      map.get(groupKey)!.variants.push(variant)
    })

    return Array.from(map.values()).sort((a, b) => {
      const compCompare = a.companyName.localeCompare(b.companyName)
      if (compCompare !== 0) return compCompare
      return a.siteLocation.localeCompare(b.siteLocation)
    })
  }, [filteredVariants])

  // Handle variant deletion
  const handleDeleteVariant = (variant: VehicleVariantItem) => {
    deleteAsset(variant.assetId)
    toast.success(`Variant "${variant.name}" deleted successfully.`)
  }

  // Handle variant hold toggle
  const handleHoldToggle = (variant: VehicleVariantItem) => {
    toggleHoldAsset(variant.assetId)
    toast.success(
      variant.status === "hold"
        ? `Released hold on "${variant.name}".`
        : `Put "${variant.name}" on hold.`
    )
  }

  if (allVariants.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-border/60 rounded-2xl bg-card/40 p-8 my-4">
        <div className="p-3.5 rounded-full bg-[#4472C4]/10 text-[#4472C4] mb-3">
          <Car className="h-10 w-10 stroke-[1.75]" />
        </div>
        <h3 className="text-lg font-bold text-foreground">No Vehicle Branding Assets Yet</h3>
        <p className="text-xs text-muted-foreground max-w-md mt-1.5 leading-relaxed">
          Create groups organized by Company Name and Site, and add vehicle variant tiles with JPG preview, PDF specs, and CDR source files.
        </p>
        <div className="mt-5">
          <AddVehicleBrandingModal
            trigger={
              <Button className="h-10 px-5 rounded-xl text-xs font-bold gap-2 bg-[#4472C4] hover:bg-[#4472C4]/90 text-white shadow-sm cursor-pointer">
                <Plus className="h-4 w-4" />
                <span>Add Vehicle Branding</span>
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="py-14 flex flex-col items-center justify-center text-center border-2 border-dashed border-border/60 rounded-2xl bg-card/40 p-8 my-4">
        <Search className="h-9 w-9 text-muted-foreground/40 mb-2.5" />
        <h3 className="text-base font-semibold text-foreground">No Matching Vehicle Variants</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          No vehicle variants match &quot;{searchQuery}&quot;. Try searching by vehicle name, company, or site.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div
          key={group.key}
          className="bg-muted/30 border border-border/80 rounded-2xl p-6 space-y-5 w-full"
        >
          {/* Group Header: Company Name & Site Location */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/60 gap-3">
            <div className="flex flex-col text-left gap-1">
              {/* Company Name */}
              <h2
                className="font-extrabold uppercase tracking-wider text-left leading-tight"
                style={{ fontSize: "22px", color: "#548235" }}
              >
                {group.companyName}
              </h2>

              {/* Site Location in simple thin light text */}
              <p className="text-sm font-normal text-muted-foreground tracking-wide flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                <span>Site: <span className="font-medium text-foreground/90">{group.siteLocation}</span></span>
              </p>
            </div>

            {/* Right Controls: Variant Count and + Add Variant to this group */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <span className="text-xs text-muted-foreground font-medium mr-1">
                {group.variants.length} variant{group.variants.length === 1 ? "" : "s"}
              </span>

              {/* + Add Variant Button pre-filled with this group's Company and Site */}
              <AddVehicleBrandingModal
                defaultCompany={group.companyName}
                defaultSiteLocation={group.siteLocation}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 rounded-full hover:bg-muted text-muted-foreground flex items-center justify-center cursor-pointer"
                    title={`Add variant to ${group.companyName} (${group.siteLocation})`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </div>

          {/* Grid of Variant Tiles (Separate tiles like Logo Tile Style) */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {group.variants.map((variant) => (
              <VehicleBrandingTile
                key={variant.id}
                variant={variant}
                onDelete={() => handleDeleteVariant(variant)}
                onHoldToggle={() => handleHoldToggle(variant)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
