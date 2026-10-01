import { Asset } from "@/components/assets/asset-tile"
import { AssetPageConfig } from "@/config/asset-pages"

export const DEFAULT_LOGO_CATEGORIES: Record<string, AssetPageConfig> = {
  "basic-logo": {
    slug: "basic-logo",
    title: "Basic Logo",
    description: "Official Transvolt basic logos in black, white, and full white formats.",
    emptyStateTitle: "No basic logos found",
    emptyStateDescription: "Add basic logo assets.",
    parentSlug: "logo-color",
  } as any,
  "logo-with-tag-line": {
    slug: "logo-with-tag-line",
    title: "Logo With Tag Line",
    description: "Official Transvolt logos with safety and sustainability tagline.",
    emptyStateTitle: "No tagline logos found",
    emptyStateDescription: "Add logo with tagline assets.",
    parentSlug: "logo-color",
  } as any,
}

export const DEFAULT_LOGO_ASSETS: Asset[] = [
  // 1. Basic Logo Set
  {
    id: "logo-basic-black",
    name: "Logo Black",
    category: "basic-logo",
    status: "active",
    createdAt: "15 Sep 2026",
    updatedAt: "15 Sep 2026",
    createdBy: "Administrator",
    titleName: "Basic Logo",
    thumbnail: "/logos/PNG/Logo_Black.png",
    formats: {
      SVG: {
        fileName: "Logo_Black.svg",
        fileData: "/logos/SVG/Logo_Black.svg",
      },
      PNG: {
        fileName: "Logo_Black.png",
        fileData: "/logos/PNG/Logo_Black.png",
      },
      CDR: {
        fileName: "Logo_Black_CDR15.cdr",
        fileData: "/logos/CDR/Logo_Black_CDR15.cdr",
      },
    },
  },
  {
    id: "logo-basic-white",
    name: "Logo White",
    category: "basic-logo",
    status: "active",
    createdAt: "15 Sep 2026",
    updatedAt: "15 Sep 2026",
    createdBy: "Administrator",
    titleName: "Basic Logo",
    thumbnail: "/logos/PNG/Logo_White.png",
    formats: {
      SVG: {
        fileName: "Logo_White.svg",
        fileData: "/logos/SVG/Logo_White.svg",
      },
      PNG: {
        fileName: "Logo_White.png",
        fileData: "/logos/PNG/Logo_White.png",
      },
      CDR: {
        fileName: "Logo_White_CDR15.cdr",
        fileData: "/logos/CDR/Logo_White_CDR15.cdr",
      },
    },
  },
  {
    id: "logo-basic-full-white",
    name: "Logo Full White",
    category: "basic-logo",
    status: "active",
    createdAt: "15 Sep 2026",
    updatedAt: "15 Sep 2026",
    createdBy: "Administrator",
    titleName: "Basic Logo",
    thumbnail: "/logos/PNG/Logo_Full_White.png",
    formats: {
      SVG: {
        fileName: "Logo_Full_White.svg",
        fileData: "/logos/SVG/Logo_Full_White.svg",
      },
      PNG: {
        fileName: "Logo_Full_White.png",
        fileData: "/logos/PNG/Logo_Full_White.png",
      },
      CDR: {
        fileName: "Logo_Full_White_CDR15.cdr",
        fileData: "/logos/CDR/Logo_Full_White_CDR15.cdr",
      },
    },
  },

  // 2. Logo With Tag Line Set
  {
    id: "logo-tagline-black",
    name: "Logo Black",
    category: "logo-with-tag-line",
    status: "active",
    createdAt: "15 Sep 2026",
    updatedAt: "15 Sep 2026",
    createdBy: "Administrator",
    titleName: "Logo With Tag Line",
    thumbnail: "/logos/PNG/Logo_Black_Tagline.png",
    formats: {
      SVG: {
        fileName: "Logo_Black_Tagline.svg",
        fileData: "/logos/SVG/Logo_Black_Tagline.svg",
      },
      PNG: {
        fileName: "Logo_Black_Tagline.png",
        fileData: "/logos/PNG/Logo_Black_Tagline.png",
      },
      CDR: {
        fileName: "Logo_Black_Tagline_CDR15.cdr",
        fileData: "/logos/CDR/Logo_Black_Tagline_CDR15.cdr",
      },
    },
  },
  {
    id: "logo-tagline-white",
    name: "Logo White",
    category: "logo-with-tag-line",
    status: "active",
    createdAt: "15 Sep 2026",
    updatedAt: "15 Sep 2026",
    createdBy: "Administrator",
    titleName: "Logo With Tag Line",
    thumbnail: "/logos/PNG/Logo_White_Tagline.png",
    formats: {
      SVG: {
        fileName: "Logo_White_Tagline.svg",
        fileData: "/logos/SVG/Logo_White_Tagline.svg",
      },
      PNG: {
        fileName: "Logo_White_Tagline.png",
        fileData: "/logos/PNG/Logo_White_Tagline.png",
      },
      CDR: {
        fileName: "Logo_White_Tagline_CDR15.cdr",
        fileData: "/logos/CDR/Logo_White_Tagline_CDR15.cdr",
      },
    },
  },
  {
    id: "logo-tagline-full-white",
    name: "Logo Full White",
    category: "logo-with-tag-line",
    status: "active",
    createdAt: "15 Sep 2026",
    updatedAt: "15 Sep 2026",
    createdBy: "Administrator",
    titleName: "Logo With Tag Line",
    thumbnail: "/logos/PNG/Logo_Full_White_Tagline.png",
    formats: {
      SVG: {
        fileName: "Logo_Full_White_Tagline.svg",
        fileData: "/logos/SVG/Logo_Full_White_Tagline.svg",
      },
      PNG: {
        fileName: "Logo_Full_White_Tagline.png",
        fileData: "/logos/PNG/Logo_Full_White_Tagline.png",
      },
      CDR: {
        fileName: "Logo_Full_White_Tagline_CDR15.cdr",
        fileData: "/logos/CDR/Logo_Full_White_Tagline_CDR15.cdr",
      },
    },
  },
]

export function getInitialLogoAssets(): Asset[] {
  return DEFAULT_LOGO_ASSETS
}
