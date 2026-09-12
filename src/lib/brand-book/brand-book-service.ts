/**
 * Service for Transvolt Brand Book management:
 * Handles download, custom PDF storage, metadata tracking, and preview content.
 */

export interface BrandBookMetadata {
  title: string
  fileName: string
  lastUpdated: string
  version: string
  fileSize: string
  customUploaded: boolean
  url: string
}

const STORAGE_KEY_META = "transvolt_brand_book_meta"
const DB_NAME = "transvolt_brand_book_db"
const STORE_NAME = "brand_book_files"

// IndexedDB helper for custom uploaded brand book PDF
function openBrandBookDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window not defined"))
      return
    }
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveCustomBrandBookToDB(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openBrandBookDB()
      const reader = new FileReader()
      reader.onload = async () => {
        const base64Data = reader.result as string
        const tx = db.transaction(STORE_NAME, "readwrite")
        const store = tx.objectStore(STORE_NAME)
        store.put(base64Data, "active_brand_book")
        tx.oncomplete = () => {
          const now = new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(new Date())

          const meta: BrandBookMetadata = {
            title: "Download Transvolt Brand Book",
            fileName: file.name || "Transvolt_Brand_Book_2026.pdf",
            lastUpdated: now,
            version: "v4.2 (Updated)",
            fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            customUploaded: true,
            url: base64Data,
          }
          try {
            localStorage.setItem(STORAGE_KEY_META, JSON.stringify({
              ...meta,
              url: "", // don't bloat localStorage with base64
            }))
          } catch {}
          resolve(now)
        }
        tx.onerror = () => reject(tx.error)
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    } catch (e) {
      reject(e)
    }
  })
}

export async function getCustomBrandBookFromDB(): Promise<string | null> {
  try {
    const db = await openBrandBookDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const store = tx.objectStore(STORE_NAME)
      const req = store.get("active_brand_book")
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

export function getStoredBrandBookMetadata(): BrandBookMetadata {
  const defaultMeta: BrandBookMetadata = {
    title: "Download Transvolt Brand Book",
    fileName: "Transvolt_Brand_Book_2026.pdf",
    lastUpdated: "07 Sep 2026",
    version: "v4.2",
    fileSize: "13.1 KB",
    customUploaded: false,
    url: "/Transvolt_Brand_Book_2026.pdf",
  }

  if (typeof window === "undefined") return defaultMeta

  try {
    const stored = localStorage.getItem(STORAGE_KEY_META)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        ...defaultMeta,
        ...parsed,
        url: parsed.customUploaded ? "" : defaultMeta.url,
      }
    }
  } catch {}

  return defaultMeta
}

/**
 * Triggers download of the Transvolt Brand Book (either custom-uploaded PDF or default official PDF)
 */
export async function downloadTransvoltBrandBook(variant: "standard" | "print" | "web" = "standard"): Promise<void> {
  if (typeof window === "undefined") return

  // Check if custom file exists in IndexedDB
  const customData = await getCustomBrandBookFromDB()
  const meta = getStoredBrandBookMetadata()

  const defaultFileName =
    variant === "print"
      ? "Transvolt_Brand_Book_Print_300DPI.pdf"
      : variant === "web"
      ? "Transvolt_Brand_Book_Web.pdf"
      : meta.fileName || "Transvolt_Brand_Book_2026.pdf"

  if (customData) {
    const link = document.createElement("a")
    link.href = customData
    link.download = defaultFileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return
  }

  // Use the verified static PDF in /public
  const link = document.createElement("a")
  link.href = "/Transvolt_Brand_Book_2026.pdf"
  link.download = defaultFileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Content for the interactive Brand Book Preview Modal
 */
export const brandBookPreviewPages = [
  {
    id: "page-1",
    pageNum: 1,
    title: "Brand Overview & Purpose",
    badge: "IDENTITY STANDARDS",
    summary: "Transvolt Mobility Private Limited is India's premier commercial electric vehicle fleet operator.",
    sections: [
      {
        heading: "1. Brand Mission & Overview",
        content:
          "Transvolt Mobility operates turnkey zero-emission fleet systems for enterprise corporations, public transit networks, and industrial campuses across India. This Brand Book establishes rigorous visual and communication standards to ensure brand consistency across all touchpoints.",
      },
      {
        heading: "2. Core Brand Values",
        content:
          "• Sustainability: Zero tailpipe emissions, certified green depot operations.\n• Engineering Precision: High-uptime vehicle telematics and smart charger dispatch.\n• Corporate Excellence: Executive-grade business transit and verified safety.\n• Future Readiness: Continual adoption of next-generation commercial EV platforms.",
      },
      {
        heading: "3. Brand Voice & Tone",
        content:
          "Our tone is authoritative, technologically sophisticated, environmentally accountable, and trustworthy. We avoid frivolous hyperbole and let real operational data, safety metrics, and emission reduction speak with clarity.",
      },
    ],
  },
  {
    id: "page-2",
    pageNum: 2,
    title: "Logo Identity & Clear Space",
    badge: "LOGO SYSTEM",
    summary: "Official logomark construction, clear space exclusion zones, and contrast rules.",
    sections: [
      {
        heading: "1. Primary Logomark Construction",
        content:
          "The Transvolt mark embodies continuous kinetic motion, clean energy, and automotive elegance. It pairs our iconic lightning arrow emblem with the bold corporate wordmark. Always use official vector (SVG) or master lossless PNG assets from the portal.",
      },
      {
        heading: "2. Exclusion Zone (Clear Space)",
        content:
          "Maintain an isolation zone equal to 1.5x the height of the primary logomark symbol on all four sides. No competing graphic element, typography, or screen border may encroach into this protective zone.",
      },
      {
        heading: "3. Background Contrast & Legibility",
        content:
          "• On white or light surfaces (#FFFFFF, #F8FAFC): Use the Dark Navy/Black Transvolt logo.\n• On deep surfaces (#1F4E79, #0F172A, #000000): Use the Inverted Pure White Transvolt logo.\n• Never place the logo on busy photographic textures without an approved contrast shield.",
      },
      {
        heading: "4. Prohibited Usages",
        content:
          "DO NOT stretch, condense, or distort proportions. DO NOT alter logo gradients or apply drop shadows, outlines, glows, or 3D extrusions. DO NOT rotate the logo off its baseline.",
      },
    ],
  },
  {
    id: "page-3",
    pageNum: 3,
    title: "Official Color Palette",
    badge: "COLOR PALETTE",
    summary: "Curated corporate color system with exact HEX, RGB, and CMYK specifications.",
    swatches: [
      {
        name: "Electric Cobalt Blue",
        role: "Primary Brand CTA",
        hex: "#4472C4",
        rgb: "68, 114, 196",
        cmyk: "75, 48, 0, 0",
        colorClass: "bg-[#4472C4]",
      },
      {
        name: "Deep Fleet Navy",
        role: "Corporate Foundation",
        hex: "#1F4E79",
        rgb: "31, 78, 121",
        cmyk: "90, 65, 20, 30",
        colorClass: "bg-[#1F4E79]",
      },
      {
        name: "Charging Amber",
        role: "Warning & Charging",
        hex: "#ED7D31",
        rgb: "237, 125, 49",
        cmyk: "0, 60, 85, 0",
        colorClass: "bg-[#ED7D31]",
      },
      {
        name: "Eco Emerald Green",
        role: "Operational Ready",
        hex: "#70AD47",
        rgb: "112, 173, 71",
        cmyk: "60, 0, 85, 0",
        colorClass: "bg-[#70AD47]",
      },
      {
        name: "Fleet Charcoal",
        role: "Neutral Typography",
        hex: "#262626",
        rgb: "38, 38, 38",
        cmyk: "70, 60, 60, 80",
        colorClass: "bg-[#262626]",
      },
      {
        name: "Pure Canvas White",
        role: "Clean Background",
        hex: "#FFFFFF",
        rgb: "255, 255, 255",
        cmyk: "0, 0, 0, 0",
        colorClass: "bg-white border border-border",
      },
    ],
  },
  {
    id: "page-4",
    pageNum: 4,
    title: "Typography & Content Hierarchy",
    badge: "TYPOGRAPHY",
    summary: "Corporate typography standards, weights, line-heights, and accessibility.",
    sections: [
      {
        heading: "1. Corporate Typeface: Inter",
        content:
          "Inter is the standard corporate font across web portals, mobile interfaces, and presentations. Fallback fonts: Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif.",
      },
      {
        heading: "2. Typographic Hierarchy Scale",
        content:
          "• Display / Hero Headings: Inter Bold (700) | 28pt–36pt\n• Page Titles & Section Banners: Inter Bold (700) | 20pt–24pt\n• Sub-headings & Card Labels: Inter SemiBold (600) | 13pt–15pt\n• Body Paragraphs & Tables: Inter Regular (400) | 10pt–11pt (1.5 line height)\n• Badges & Metadata: Inter Medium (500) | 8.5pt–10pt (Uppercase)",
      },
      {
        heading: "3. Digital Accessibility (WCAG AA)",
        content:
          "All body text must maintain a contrast ratio of at least 4.5:1 against its background. Interactive buttons, links, and forms must provide distinct focus and hover states.",
      },
    ],
  },
  {
    id: "page-5",
    pageNum: 5,
    title: "Fleet Livery, Hubs & Collateral",
    badge: "FLEET & COLLATERAL",
    summary: "Vehicle wraps, high-voltage hub signage, stationery, and legal custodianship.",
    sections: [
      {
        heading: "1. Commercial Fleet Graphics (EV Bus & Cab)",
        content:
          "Vehicle wraps must use premium 3M automotive-grade cast vinyl with anti-UV gloss lamination. The Transvolt primary wordmark must be centered on the upper front quarter and emergency egress side.",
      },
      {
        heading: "2. Charging Hub & Depot Signage",
        content:
          "Hub entry totem must display corporate brandmark and 24/7 emergency hotline. Charger pedestals must feature standardized high-voltage pictograms and reflective bay markings.",
      },
      {
        heading: "3. Stationery & Inquiries",
        content:
          "Letterheads, business cards, ID badges, and investor presentations must strictly adhere to the templates in the Branding Portal.\n\nBrand Custodianship Office:\nTransvolt Mobility Private Limited\nEmail: branding@transvolt.in | Web: www.transvolt.in",
      },
    ],
  },
]
