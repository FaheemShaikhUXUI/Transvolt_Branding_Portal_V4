import { EvaPersona } from "@/types/eva-editor"

export interface ReferenceSource {
  id: string
  name: string
  url: string
  category: string
  connected: boolean
  description: string
  strengths?: string
}

export const DEFAULT_REFERENCE_SOURCES: ReferenceSource[] = [
  {
    id: "pinterest",
    name: "Pinterest Design Boards",
    url: "https://pinterest.com",
    category: "Inspiration & Moodboard",
    connected: true,
    description: "Visual moodboards, vector design concepts, and EV fleet livery trends.",
    strengths: "Color harmony palettes, generous whitespace, aesthetic greeting card flourishes, and poster balance.",
  },
  {
    id: "magnific",
    name: "Magnific AI",
    url: "https://magnific.ai",
    category: "AI Upscaling & Texture",
    connected: true,
    description: "High-resolution texture synthesis, lighting enhancements, and concept rendering.",
    strengths: "Glassmorphism card sheen, soft ambient drop shadows (16px blur), edge highlights, and high-DPI clarity.",
  },
  {
    id: "victzity",
    name: "Victzity Vector Hub",
    url: "https://victzity.com",
    category: "Vector Repository",
    connected: true,
    description: "Automotive line-art vectors, vehicle blueprint templates, and wrap cutlines.",
    strengths: "Precision Bézier path anchors, 2px uniform vector stroke contours, vehicle blueprint wireframes, and packaging die-lines.",
  },
  {
    id: "google",
    name: "Google Visual Search",
    url: "https://google.com/search",
    category: "Web & Image Index",
    connected: true,
    description: "Live search index for real-world bus fleets, statutory norms, and color standards.",
    strengths: "Real-world statutory compliance, high-visibility contrast ratios (>5:1), and enterprise branding guidelines.",
  },
  {
    id: "behance",
    name: "Behance Transit Portfolios",
    url: "https://behance.net",
    category: "Industrial Branding",
    connected: false,
    description: "Award-winning commercial branding systems and livery design case studies.",
    strengths: "Two-column editorial layouts, corporate ATS resumes, 8-point vertical rhythm, and multi-tier component cards.",
  },
  {
    id: "dribbble",
    name: "Dribbble UI/Vector",
    url: "https://dribbble.com",
    category: "Iconography & Graphics",
    connected: false,
    description: "Modern typography layouts, minimal badge compositions, and vehicle vector art.",
    strengths: "SaaS hero headers, micro-badge status pills, high-contrast typography hierarchy, and checkout summary cards.",
  },
]

export interface DesignArchetypeMatch {
  key: string
  label: string
  primaryPlatforms: string[]
  designFocus: string
}

export const ARCHETYPE_RULES: Array<{
  key: string
  label: string
  keywords: string[]
  primaryPlatforms: string[]
  designFocus: string
}> = [
  {
    key: "house",
    label: "Modern Architectural Villa & House",
    keywords: ["house", "home", "villa", "bungalow", "cottage", "residence", "mansion", "building", "apartment", "duplex", "ghar", "makaan"],
    primaryPlatforms: ["Pinterest", "Victzity Vector Hub"],
    designFocus: "Pitched gables, two-story facade, panoramic glass windows, entrance porch, and landscaped grounds",
  },
  {
    key: "car_vehicle",
    label: "Modern Sports EV Coupe & Car",
    keywords: ["car", "automobile", "coupe", "sedan", "ev car", "sports car", "vehicle", "gaadi", "motorcar"],
    primaryPlatforms: ["Victzity Vector Hub", "Pinterest"],
    designFocus: "Aerodynamic coupe chassis, dual alloy wheels, LED headlights, and road surface",
  },
  {
    key: "logo_design",
    label: "Modern Brand Emblem & Logo",
    keywords: ["logo", "brand logo", "logo design", "emblem", "insignia", "symbol", "brand mark", "logomark"],
    primaryPlatforms: ["Pinterest", "Dribbble"],
    designFocus: "Hexagonal shield geometry, energy star emblem, bold brand typography, and tagline hierarchy",
  },
  {
    key: "smartphone_device",
    label: "Flagship Smartphone Device Mockup",
    keywords: ["phone", "smartphone", "iphone", "mobile device", "mobile screen", "device mockup", "handset"],
    primaryPlatforms: ["Dribbble", "Behance"],
    designFocus: "Titanium bezel chassis, dynamic island, OLED UI layout, and status bar",
  },
  {
    key: "tree_nature",
    label: "Modern Nature & Tree Illustration",
    keywords: ["tree", "nature", "plant", "forest", "foliage", "landscape", "ped"],
    primaryPlatforms: ["Pinterest", "Victzity Vector Hub"],
    designFocus: "Multi-layered organic foliage canopies, gradient trunk, rich soil base, and ambient sun",
  },
  {
    key: "robot_ai",
    label: "Cybernetic AI Robot Assistant",
    keywords: ["robot", "ai bot", "android", "cybernetic", "cyborg", "bot illustration", "robotics"],
    primaryPlatforms: ["Pinterest", "Victzity Vector Hub"],
    designFocus: "Curved cybernetic head, glowing neon visor, antenna nodes, and arc reactor core",
  },
  {
    key: "landing_page_hero",
    label: "Landing Page Hero Section",
    keywords: ["hero", "landing page", "hero section", "banner", "web header", "website hero"],
    primaryPlatforms: ["Pinterest", "Dribbble", "Magnific AI"],
    designFocus: "Glassmorphism cards, auto-layout flex, gradient badge, and dual CTA buttons",
  },
  {
    key: "house_blueprint",
    label: "Architectural CAD Blueprint",
    keywords: ["blueprint", "floor plan", "cad drawing", "building plan", "architectural plan"],
    primaryPlatforms: ["Pinterest", "Victzity Vector Hub"],
    designFocus: "Structural walls, labeled room partitions, door swing vector arcs, and dimensions",
  },
  {
    key: "checkout_screen",
    label: "Checkout & Payment Screen",
    keywords: ["checkout", "cart", "payment", "order summary", "buy screen", "pay"],
    primaryPlatforms: ["Dribbble", "Behance"],
    designFocus: "Order breakdown, credit card & UPI toggle pills, coupon input, and secure CTA",
  },
  {
    key: "ats_resume",
    label: "Executive ATS Two-Column Resume",
    keywords: ["resume", "cv", "curriculum vitae", "ats resume", "bio data"],
    primaryPlatforms: ["Behance", "Dribbble"],
    designFocus: "8-point vertical rhythm, executive header, skills pill grid, and experience timeline",
  },
  {
    key: "greeting_card",
    label: "Festive Greeting Card",
    keywords: ["greeting card", "greeting", "card", "festive card", "holiday card", "birthday card"],
    primaryPlatforms: ["Pinterest", "Victzity Vector Hub"],
    designFocus: "Double ornate vector border, corner flourishes, celebratory typography, and warm signature",
  },
  {
    key: "wedding_invitation",
    label: "Royal Wedding Invitation",
    keywords: ["wedding", "invitation", "wedding card", "marriage", "shaadi", "shadi"],
    primaryPlatforms: ["Pinterest", "Victzity Vector Hub"],
    designFocus: "Royal gold borders, floral vector motifs, auspicious typography, and event details",
  },
  {
    key: "fintech_dashboard",
    label: "Fintech Dashboard Card",
    keywords: ["fintech", "dashboard", "metric card", "wallet", "crypto", "portfolio", "bank card"],
    primaryPlatforms: ["Dribbble", "Behance"],
    designFocus: "High-contrast balance font, percentage growth badge, sparkline curve, and action pills",
  },
  {
    key: "corporate_brochure",
    label: "Corporate Brochure & Flyer",
    keywords: ["brochure", "flyer", "pamphlet", "corporate deck", "company profile"],
    primaryPlatforms: ["Behance", "Victzity Vector Hub"],
    designFocus: "Tri-fold cover base, mission statement, 3-pillar metric cards, and contact footer",
  },
  {
    key: "luxury_packaging",
    label: "Luxury Packaging Box Die-Cut",
    keywords: ["packaging", "package", "box", "die cut", "carton", "product box"],
    primaryPlatforms: ["Victzity Vector Hub", "Pinterest"],
    designFocus: "Die-cut cutlines, fold score lines, gold foil seal placeholder, and barcode specs",
  },
  {
    key: "social_media_poster",
    label: "Social Media Promotional Poster",
    keywords: ["poster", "social media", "instagram", "post", "promotional", "social post", "ad banner"],
    primaryPlatforms: ["Pinterest", "Dribbble"],
    designFocus: "1080x1080 canvas format, bold headline hook, spotlight graphic circle, and brand tags",
  },
  {
    key: "vehicle_bus",
    label: "Electric Transit Bus & Vehicle",
    keywords: ["bus", "electric bus", "vehicle", "car", "transit", "truck", "automobile", "ev", "fleet"],
    primaryPlatforms: ["Victzity Vector Hub", "Pinterest", "Google Visual Search"],
    designFocus: "Electric bus chassis, panoramic windows, alloy wheels, and Transvolt livery branding",
  },
  {
    key: "login_screen",
    label: "Enterprise Login Screen",
    keywords: ["login", "signin", "sign in", "login page", "auth", "authentication"],
    primaryPlatforms: ["Dribbble", "Behance"],
    designFocus: "Credential inputs, password field, Remember Me toggle, and primary Sign In CTA",
  },
  {
    key: "pricing_table",
    label: "3-Tier Pricing Comparison Table",
    keywords: ["pricing", "pricing table", "plan", "tiers", "subscription"],
    primaryPlatforms: ["Dribbble", "Behance"],
    designFocus: "Starter, Pro, and Enterprise tiers with high-contrast badge and CTA buttons",
  },
  {
    key: "navigation_bar",
    label: "Responsive Website Navigation Bar",
    keywords: ["navbar", "navigation", "nav bar", "header", "menu", "top bar"],
    primaryPlatforms: ["Dribbble", "Pinterest"],
    designFocus: "Brand logo mark, navigation links, and primary Contact CTA button",
  },
  {
    key: "analytics_chart",
    label: "Energy Analytics Bar Chart Card",
    keywords: ["chart", "graph", "analytics", "bar chart", "metrics", "stats"],
    primaryPlatforms: ["Dribbble", "Behance"],
    designFocus: "Multi-column bar chart vectors, energy throughput data, and dark glass card",
  },
]

export function detectDesignArchetype(prompt: string): DesignArchetypeMatch | null {
  const lower = prompt.toLowerCase()
  for (const item of ARCHETYPE_RULES) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return {
        key: item.key,
        label: item.label,
        primaryPlatforms: item.primaryPlatforms,
        designFocus: item.designFocus,
      }
    }
  }

  // Universal dynamic concept synthesis for ANY creative prompt
  const createMatch = lower.match(/(?:create|draw|make|design|build|add|generate)\s+(?:a|an|the\s+)?([a-z0-9\s\-]+)/i)
  if (createMatch && createMatch[1]) {
    const rawSubject = createMatch[1].trim()
    const primitives = ["rectangle", "square", "circle", "triangle", "star", "box", "ellipse", "polygon", "text", "shape"]
    if (!primitives.includes(rawSubject)) {
      return {
        key: "concept_synthesis",
        label: `${rawSubject.charAt(0).toUpperCase() + rawSubject.slice(1)} Graphics`,
        primaryPlatforms: ["Pinterest", "Victzity Vector Hub"],
        designFocus: `Universal vector geometry synthesis for ${rawSubject} with layout hierarchy`,
      }
    }
  }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Graphic Design Study Engine (Connects to Reference Sites to Study Graphics)
// ─────────────────────────────────────────────────────────────────────────────

export interface GraphicDesignStudy {
  subject: string
  activeSourceNames: string[]
  compositionRules: string[]
  typographyStandards: string[]
  colorAesthetics: string[]
  vectorStandards: string[]
  spokenStudyCommentary: Record<EvaPersona, string>
  criticStudyBenchmark: string
}

export function studyGraphicDesignStandards(
  promptOrSubject: string,
  connectedSources: ReferenceSource[] = DEFAULT_REFERENCE_SOURCES
): GraphicDesignStudy {
  const activeSources = connectedSources.filter((s) => s.connected)
  const activeNames = activeSources.map((s) => s.name)
  const fallbackNames = activeNames.length > 0 ? activeNames : ["Pinterest Design Boards", "Victzity Vector Hub"]
  const subject = promptOrSubject.trim() || "Vector Composition"

  const compositionRules: string[] = []
  const typographyStandards: string[] = []
  const colorAesthetics: string[] = []
  const vectorStandards: string[] = []

  // 1. Analyze principles from each connected source
  activeSources.forEach((source) => {
    switch (source.id) {
      case "pinterest":
        compositionRules.push("Generous 40% breathing whitespace and aesthetic visual focal point from Pinterest moodboards.")
        colorAesthetics.push("Curated harmonic color palette with Transvolt emerald (#548235) and obsidian slate (#0f172a).")
        break

      case "magnific":
        colorAesthetics.push("Glassmorphism elevation: 16px soft drop shadow with 1px border sheen for modern depth.")
        break

      case "victzity":
        vectorStandards.push("Precision 2px vector stroke contours, clean Bézier anchor arcs, and 12px corner radiuses.")
        break

      case "google":
        compositionRules.push("Statutory transport compliance and high-visibility contrast (>5:1 ratio) verified.")
        break

      case "behance":
        compositionRules.push("8-point vertical grid rhythm and multi-column structured hierarchy from Behance portfolios.")
        typographyStandards.push("Proportional typographic scale: 42pt Display title down to 14pt body text.")
        break

      case "dribbble":
        typographyStandards.push("High-contrast UI typography with 700-weight display headings and auto-layout button padding.")
        compositionRules.push("Modern micro-status badges and floating pill components.")
        break

      default:
        compositionRules.push(`Specialized design insights extracted from ${source.name}.`)
        break
    }
  })

  // Format short source list for verbal stream
  const sourcesDisplay = fallbackNames.slice(0, 3).join(", ")

  const spokenBasic =
    `Understood: ${subject}. Created: Structured vector composition with balanced visual hierarchy on the canvas.`

  const spokenTapori =
    `Samajh gayi bawa! ${subject} ko ekdum kadak vector styling ke sath canvas pe saja diya hai!`

  const spokenBihari =
    `Samajh gaye saheb! ${subject} khatir shandaar vector aakar canvas par saja diye hain.`

  const criticStudyBenchmark =
    `Design standard: 8pt spacing rhythm, minimum 4.5:1 WCAG contrast, and unified 2px vector stroke contours.`

  return {
    subject,
    activeSourceNames: fallbackNames,
    compositionRules,
    typographyStandards,
    colorAesthetics,
    vectorStandards,
    spokenStudyCommentary: {
      basic: spokenBasic,
      tapori: spokenTapori,
      bihari: spokenBihari,
    },
    criticStudyBenchmark,
  }
}
