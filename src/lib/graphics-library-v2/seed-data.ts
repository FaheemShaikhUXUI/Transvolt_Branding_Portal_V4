import { V2Folder, V2File } from "./types"

export const INITIAL_V2_FOLDERS: V2Folder[] = [
  // 1. Root Folders
  {
    id: "fld-root-guidelines",
    name: "Brand Guidelines & Rules",
    parentId: null,
    color: "#059669", // emerald
    createdAt: "2026-09-10T10:00:00Z",
    updatedAt: "2026-09-15T14:30:00Z",
  },
  {
    id: "fld-root-logos",
    name: "Official Logos & Vector Kits",
    parentId: null,
    color: "#2563eb", // blue
    createdAt: "2026-09-10T10:00:00Z",
    updatedAt: "2026-09-17T11:20:00Z",
  },
  {
    id: "fld-root-stationery",
    name: "Corporate Stationery",
    parentId: null,
    color: "#7c3aed", // purple
    createdAt: "2026-09-11T09:00:00Z",
    updatedAt: "2026-09-16T16:45:00Z",
  },
  {
    id: "fld-root-marketing",
    name: "Marketing & Expo Campaigns",
    parentId: null,
    color: "#ea580c", // orange
    createdAt: "2026-09-12T11:30:00Z",
    updatedAt: "2026-09-18T08:15:00Z",
  },

  // 2. Nested Subfolders inside "Official Logos & Vector Kits"
  {
    id: "fld-logos-vectors",
    name: "Master Vector Files (SVG & CDR)",
    parentId: "fld-root-logos",
    color: "#0284c7",
    createdAt: "2026-09-12T12:00:00Z",
    updatedAt: "2026-09-17T10:00:00Z",
  },
  {
    id: "fld-logos-raster",
    name: "Transparent PNGs (High-Res)",
    parentId: "fld-root-logos",
    color: "#3b82f6",
    createdAt: "2026-09-12T12:30:00Z",
    updatedAt: "2026-09-17T10:30:00Z",
  },

  // 3. Nested Subfolders inside "Marketing & Expo Campaigns"
  {
    id: "fld-mkt-2026-expo",
    name: "2026 Electric Mobility Expo",
    parentId: "fld-root-marketing",
    color: "#d97706",
    createdAt: "2026-09-13T14:00:00Z",
    updatedAt: "2026-09-18T08:00:00Z",
  },
  // 4. Level 3 Nested Subfolder inside "2026 Electric Mobility Expo"
  {
    id: "fld-expo-banners",
    name: "Promotional Print Banners (10x8ft)",
    parentId: "fld-mkt-2026-expo",
    color: "#b45309",
    createdAt: "2026-09-14T09:15:00Z",
    updatedAt: "2026-09-18T08:15:00Z",
  },
  {
    id: "fld-expo-social",
    name: "Social Media Stories & Reels",
    parentId: "fld-mkt-2026-expo",
    color: "#f59e0b",
    createdAt: "2026-09-14T10:00:00Z",
    updatedAt: "2026-09-18T08:10:00Z",
  },
]

export const INITIAL_V2_FILES: V2File[] = [
  // Files in "Brand Guidelines & Rules"
  {
    id: "file-guidelines-pdf",
    folderId: "fld-root-guidelines",
    name: "Transvolt_Master_Brand_Identity_v4.pdf",
    originalFileName: "Transvolt_Master_Brand_Identity_v4.pdf",
    format: "PDF",
    fileSize: "4.8 MB",
    fileData: "/logos/SVG/Logo_Black.svg",
    createdAt: "2026-09-10T10:30:00Z",
    updatedAt: "2026-09-15T14:30:00Z",
  },
  {
    id: "file-color-guide",
    folderId: "fld-root-guidelines",
    name: "Official_Color_Palettes_CMYK_HEX.pdf",
    originalFileName: "Official_Color_Palettes_CMYK_HEX.pdf",
    format: "PDF",
    fileSize: "1.2 MB",
    fileData: "/logos/SVG/Logo_Black.svg",
    createdAt: "2026-09-11T11:00:00Z",
    updatedAt: "2026-09-15T12:00:00Z",
  },

  // Files in "Master Vector Files (SVG & CDR)"
  {
    id: "file-logo-black-svg",
    folderId: "fld-logos-vectors",
    name: "Transvolt_Primary_Logo_Black.svg",
    originalFileName: "Transvolt_Primary_Logo_Black.svg",
    format: "SVG",
    fileSize: "145 KB",
    fileData: "/logos/SVG/Logo_Black.svg",
    createdAt: "2026-09-12T13:00:00Z",
    updatedAt: "2026-09-17T09:00:00Z",
  },
  {
    id: "file-logo-white-svg",
    folderId: "fld-logos-vectors",
    name: "Transvolt_Primary_Logo_White.svg",
    originalFileName: "Transvolt_Primary_Logo_White.svg",
    format: "SVG",
    fileSize: "142 KB",
    fileData: "/logos/SVG/Logo_White.svg",
    createdAt: "2026-09-12T13:05:00Z",
    updatedAt: "2026-09-17T09:05:00Z",
  },
  {
    id: "file-logo-cdr",
    folderId: "fld-logos-vectors",
    name: "Transvolt_CorelDraw_Vectors_15.cdr",
    originalFileName: "Transvolt_CorelDraw_Vectors_15.cdr",
    format: "CDR",
    fileSize: "2.4 MB",
    fileData: "/logos/CDR/Logo_Black_CDR15.cdr",
    createdAt: "2026-09-12T13:10:00Z",
    updatedAt: "2026-09-17T09:10:00Z",
  },

  // Files in "Transparent PNGs (High-Res)"
  {
    id: "file-logo-black-png",
    folderId: "fld-logos-raster",
    name: "Transvolt_Logo_Black_Transparent_4K.png",
    originalFileName: "Transvolt_Logo_Black_Transparent_4K.png",
    format: "PNG",
    fileSize: "680 KB",
    fileData: "/logos/PNG/Logo_Black.png",
    createdAt: "2026-09-12T14:00:00Z",
    updatedAt: "2026-09-17T10:00:00Z",
  },
  {
    id: "file-logo-white-png",
    folderId: "fld-logos-raster",
    name: "Transvolt_Logo_White_Transparent_4K.png",
    originalFileName: "Transvolt_Logo_White_Transparent_4K.png",
    format: "PNG",
    fileSize: "620 KB",
    fileData: "/logos/PNG/Logo_White.png",
    createdAt: "2026-09-12T14:05:00Z",
    updatedAt: "2026-09-17T10:05:00Z",
  },

  // Files in "Corporate Stationery"
  {
    id: "file-letterhead-docx",
    folderId: "fld-root-stationery",
    name: "Official_Corporate_Letterhead_Template.docx",
    originalFileName: "Official_Corporate_Letterhead_Template.docx",
    format: "WORD",
    fileSize: "840 KB",
    fileData: "/shinchan-face.png",
    createdAt: "2026-09-11T10:00:00Z",
    updatedAt: "2026-09-16T16:00:00Z",
  },
  {
    id: "file-stationery-presentation",
    folderId: "fld-root-stationery",
    name: "Company_Master_Pitch_Deck_2026.pptx",
    originalFileName: "Company_Master_Pitch_Deck_2026.pptx",
    format: "PPT",
    fileSize: "6.5 MB",
    fileData: "/shinchan-face.png",
    createdAt: "2026-09-11T10:30:00Z",
    updatedAt: "2026-09-16T16:30:00Z",
  },

  // Files in Level 3 Folder "Promotional Print Banners (10x8ft)"
  {
    id: "file-expo-backdrop",
    folderId: "fld-expo-banners",
    name: "Main_Expo_Stage_Backdrop_HighRes.jpg",
    originalFileName: "Main_Expo_Stage_Backdrop_HighRes.jpg",
    format: "JPG",
    fileSize: "8.2 MB",
    fileData: "/shinchan-face.png",
    createdAt: "2026-09-14T09:30:00Z",
    updatedAt: "2026-09-18T08:15:00Z",
  },
  {
    id: "file-expo-standee",
    folderId: "fld-expo-banners",
    name: "Rollup_Vertical_Standee_PrintReady.pdf",
    originalFileName: "Rollup_Vertical_Standee_PrintReady.pdf",
    format: "PDF",
    fileSize: "3.7 MB",
    fileData: "/logos/SVG/Logo_Black.svg",
    createdAt: "2026-09-14T09:40:00Z",
    updatedAt: "2026-09-18T08:05:00Z",
  },

  // Root File (file located directly at root)
  {
    id: "file-root-readme",
    folderId: null,
    name: "Transvolt_Design_Repository_Overview.pdf",
    originalFileName: "Transvolt_Design_Repository_Overview.pdf",
    format: "PDF",
    fileSize: "950 KB",
    fileData: "/logos/SVG/Logo_Black.svg",
    createdAt: "2026-09-10T09:00:00Z",
    updatedAt: "2026-09-18T09:00:00Z",
  },
]
