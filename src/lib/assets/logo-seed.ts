import { Asset } from "@/components/assets/asset-tile"

export function getInitialLogoAssets(): Asset[] {
  return [
    {
      id: "logo-asset-1",
      name: "Primary Logo (Black)",
      category: "logo-color",
      status: "active",
      createdAt: "15 Sep 2026",
      updatedAt: "15 Sep 2026",
      createdBy: "Administrator",
      titleName: "Official Logo & Color theme",
      thumbnail: "/logos/Logo_Black.svg",
      formats: {
        SVG: {
          fileName: "Transvolt_Logo_Black.svg",
          fileData: "/logos/Logo_Black.svg",
        },
        PNG: {
          fileName: "Transvolt_Logo_Black.png",
          fileData: "/logos/Primary_Logo_Black.png",
        },
      },
    },
    {
      id: "logo-asset-2",
      name: "Primary Logo (White)",
      category: "logo-color",
      status: "active",
      createdAt: "15 Sep 2026",
      updatedAt: "15 Sep 2026",
      createdBy: "Administrator",
      titleName: "Official Logo & Color theme",
      thumbnail: "/logos/Logo_White.svg",
      formats: {
        SVG: {
          fileName: "Transvolt_Logo_White.svg",
          fileData: "/logos/Logo_White.svg",
        },
      },
    },
    {
      id: "logo-asset-3",
      name: "Logo with Tagline",
      category: "logo-color",
      status: "active",
      createdAt: "15 Sep 2026",
      updatedAt: "15 Sep 2026",
      createdBy: "Administrator",
      titleName: "Official Logo & Color theme",
      thumbnail: "/logos/Logo_Black_Tagline.png",
      formats: {
        PNG: {
          fileName: "Transvolt_Logo_Tagline.png",
          fileData: "/logos/Logo_Black_Tagline.png",
        },
      },
    },
    {
      id: "logo-asset-4",
      name: "Transvolt Dual Arrow Symbol",
      category: "logo-color",
      status: "active",
      createdAt: "15 Sep 2026",
      updatedAt: "15 Sep 2026",
      createdBy: "Administrator",
      titleName: "Official Logo & Color theme",
      thumbnail: "/logos/transvolt-arrows-dual.svg",
      formats: {
        SVG: {
          fileName: "Transvolt_Dual_Arrows.svg",
          fileData: "/logos/transvolt-arrows-dual.svg",
        },
      },
    },
  ]
}
