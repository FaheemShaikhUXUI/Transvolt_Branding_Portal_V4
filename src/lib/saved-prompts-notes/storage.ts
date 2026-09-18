import { SavedItem } from "./types"

const STORAGE_KEY = "transvolt_saved_prompts_notes_v1"

export const INITIAL_SAVED_ITEMS: SavedItem[] = [
  {
    id: "item-1",
    title: "Midjourney — Photorealistic EV Commercial Bus on Highway",
    type: "prompt",
    content: `/imagine prompt: high-end commercial electric bus with sleek aerodynamic styling, painted in metallic white and vibrant Transvolt green (#548235) accents, driving smoothly on an ultra-modern highway at sunset, cinematic lighting, ultra-detailed 8k, photorealistic octane render, shallow depth of field, corporate mobility advertisement photography --ar 16:9 --v 6.0 --style raw`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "item-2",
    title: "ChatGPT — Transvolt Brand Tone & LinkedIn Announcement Prompt",
    type: "prompt",
    content: `You are the Head of Corporate Communications for Transvolt Mobility Private Limited, India's pioneer in green electric fleet transitions and zero-emission urban transit.

Draft a compelling LinkedIn thought-leadership post announcing the deployment of 50 new fast-charging EV buses in Mumbai.

Tone: Professional, inspiring, forward-looking, sustainable, authoritative.
Key metrics to include: 50 buses, zero carbon emissions, 15-minute rapid opportunity charging, 99.4% fleet uptime.
Include 4 relevant hashtags (#TransvoltMobility #CleanEnergy #ElectricVehicles #NetZeroIndia) and a CTA directing readers to visit our branding portal.`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "item-3",
    title: "Official Brand Colors & Typography Quick Reference",
    type: "note",
    content: `TRANSVOLT BRAND IDENTITY SPECIFICATIONS

1. PRIMARY COLORS:
• Transvolt Blue: #4472C4 | RGB: 68, 114, 196 | CMYK: 70, 45, 0, 0
• Transvolt Green: #548235 | RGB: 84, 130, 53 | CMYK: 60, 10, 100, 30

2. NEUTRAL PALETTE:
• Off-Black (Headings): #1E293B
• Slate Grey (Subtext): #64748B
• Crisp White: #FFFFFF

3. TYPOGRAPHY:
• Primary Font: Poppins (Weights: 400 Regular, 600 SemiBold, 700 Bold)
• System Fallback: Inter, system-ui, -apple-system, sans-serif

*Rules: Never outline or alter the aspect ratio of official logos. Vector formats (SVG, AI, PDF) must be used for all physical prints.*`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: "item-4",
    title: "Master Links — Cloud Storage & Figma Brand Library",
    type: "link",
    content: `Official Cloud Resources & Shared Asset Drives:

• Google Drive Brand Kit: https://drive.google.com/drive/folders/transvolt-brand-kit-master
• Figma UI Component Library: https://www.figma.com/@transvolt/design-system-v4
• High-Resolution 4K Fleet B-Roll Footage: https://storage.transvolt.com/media/b-roll-2026.zip
• Corporate Letterhead & Business Card Templates: https://portal.transvolt.in/letterhead

Contact corporate communications at branding@transvolt.in for permission access.`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
]

// In-memory cache ensures zero data loss even if localStorage is full or disabled
let inMemoryItems: SavedItem[] | null = null

export function getSavedItems(): SavedItem[] {
  if (inMemoryItems !== null) {
    return [...inMemoryItems]
  }

  if (typeof window === "undefined") {
    inMemoryItems = [...INITIAL_SAVED_ITEMS]
    return inMemoryItems
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAVED_ITEMS))
      inMemoryItems = [...INITIAL_SAVED_ITEMS]
      return inMemoryItems
    }
    const parsed = JSON.parse(raw) as SavedItem[]
    inMemoryItems = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...INITIAL_SAVED_ITEMS]
    return inMemoryItems
  } catch (err) {
    console.warn("Failed to load saved prompts/notes from localStorage:", err)
    inMemoryItems = [...INITIAL_SAVED_ITEMS]
    return inMemoryItems
  }
}

export function saveItem(data: {
  id?: string
  title: string
  content: string
  type?: "prompt" | "note" | "link"
}): SavedItem {
  const current = [...getSavedItems()]
  const now = new Date().toISOString()

  let item: SavedItem

  if (data.id) {
    // Update existing item
    const existingIndex = current.findIndex((i) => i.id === data.id)
    if (existingIndex >= 0) {
      item = {
        ...current[existingIndex],
        title: data.title.trim() || "Untitled Note",
        content: data.content,
        type: data.type || current[existingIndex].type || "note",
        updatedAt: now,
      }
      // Move updated item to the front of the list so it is immediately visible!
      current.splice(existingIndex, 1)
      current.unshift(item)
    } else {
      item = {
        id: data.id,
        title: data.title.trim() || "Untitled Note",
        content: data.content,
        type: data.type || "note",
        createdAt: now,
        updatedAt: now,
      }
      current.unshift(item)
    }
  } else {
    // Create brand new item
    item = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: data.title.trim() || "Untitled Note",
      content: data.content,
      type: data.type || "note",
      createdAt: now,
      updatedAt: now,
    }
    current.unshift(item)
  }

  // Update in-memory cache
  inMemoryItems = [...current]

  // Persist to localStorage safely
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
    } catch (err) {
      console.warn("Could not save to localStorage (quota or disabled):", err)
    }
  }

  return item
}

export function deleteSavedItem(id: string): SavedItem[] {
  const current = getSavedItems().filter((item) => item.id !== id)
  inMemoryItems = [...current]
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
    } catch (err) {
      console.warn("Could not delete from localStorage:", err)
    }
  }
  return current
}

export function resetSavedItems(): SavedItem[] {
  inMemoryItems = [...INITIAL_SAVED_ITEMS]
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAVED_ITEMS))
    } catch (err) {
      console.warn("Could not reset localStorage:", err)
    }
  }
  return INITIAL_SAVED_ITEMS
}
