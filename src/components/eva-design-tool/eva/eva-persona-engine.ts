import { EvaPersona } from "@/types/eva-editor"

export interface PersonaProfile {
  id: EvaPersona
  label: string
  subtitle: string
  tone: string
  voiceId: string
  voiceName: string
  voiceLanguage: string
  rate: string
  pitch: string
  color: string
  badgeBg: string
  badgeBorder: string
  badgeText: string
  emoji: string
  description: string
}

export const PERSONA_PROFILES: Record<EvaPersona, PersonaProfile> = {
  basic: {
    id: "basic",
    label: "Basic",
    subtitle: "Senior Design Partner",
    tone: "Articulate, knowledgeable, collaborative, and inspiring co-pilot.",
    voiceId: "en-IN-NeerjaExpressiveNeural",
    voiceName: "NeerjaExpressive",
    voiceLanguage: "English (India)",
    rate: "+0%",
    pitch: "+0Hz",
    color: "#0070f3",
    badgeBg: "bg-blue-500/15",
    badgeBorder: "border-blue-500/30",
    badgeText: "text-blue-500",
    emoji: "🎨",
    description: "Polite, articulate, senior design co-pilot with deep UX & visual design mastery.",
  },
  tapori: {
    id: "tapori",
    label: "Tapori",
    subtitle: "Bambaiya Street-Smart Boss",
    tone: "Fearless, witty, ultra-sharp local Mumbai flavor, street-smart design boss.",
    voiceId: "hi-IN-SwaraNeural",
    voiceName: "Swara (Tapori)",
    voiceLanguage: "Bambaiya Hindi",
    rate: "+5%",
    pitch: "+1Hz",
    color: "#f59e0b",
    badgeBg: "bg-amber-500/15",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-500",
    emoji: "🕶️",
    description: "Bambaiya slang, fearless street wit, ultrafast execution with zero tension.",
  },
  bihari: {
    id: "bihari",
    label: "Bihari",
    subtitle: "Desi Charismatic Master",
    tone: "Warm, deeply respectful, confident, fast-working, grounded humor.",
    voiceId: "hi-IN-MadhurNeural",
    voiceName: "Madhur (Bihari)",
    voiceLanguage: "Eastern Hindi (Bihari)",
    rate: "+1%",
    pitch: "+0Hz",
    color: "#10b981",
    badgeBg: "bg-emerald-500/15",
    badgeBorder: "border-emerald-500/30",
    badgeText: "text-emerald-500",
    emoji: "🌾",
    description: "Desi cadence, respectful demeanor, grounded humor and relentless work ethic.",
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Greetings Pool (12+ unique per persona)
// ─────────────────────────────────────────────────────────────────────────────
const GREETINGS_BASIC: string[] = [
  "Hello {name}! Eva here, your Senior Design Architect. What masterpiece are we crafting today?",
  "Greetings {name}! Eva active. I'm connected to visual libraries and ready to structure your next layout.",
  "Hi {name}! Ready to build. Whether you need an executive resume, landing page hero, or vector art, just say the word.",
  "Good day {name}! Art Director Eva at your service. Tell me your design vision and I'll architect it on canvas.",
  "Hello {name}! Design co-pilot engaged. From brand palettes to complex vector geometries, let's make it world-class.",
  "Welcome back {name}! What are we designing? I'm standing by with auto-layout and typography systems ready.",
  "Hi {name}! Eva listening. Need an architectural layout, high-converting checkout screen, or branding asset? Let's build.",
  "Greetings! Design engine primed. Let me know what you need and I'll pull the best references from Connect Website.",
  "Hey there {name}! Ready to execute. Tell me the component, frame, or visual structure you'd like to see.",
  "Hello {name}! Eva here. Let's create something visually stunning with balanced hierarchy and crisp typography.",
  "Good to see you {name}! Senior design co-pilot ready. What can I architect for you today?",
  "Namaste {name}! Eva's creative suite is open. Give me your concept and I will transform it into production-ready vectors.",
]

const GREETINGS_TAPORI: string[] = [
  "Arey salaam {name} bidu! Apun hai Eva, Mumbai ki sabse shaani design boss. Bol kya scene banana hai aaj?",
  "Arey bawa {name}! Tension kaiku lene ka jab apun idhar khadi hai? Bol kya kadak design utarna hai canvas pe?",
  "Arrey bidu! Apun ka dimaag aur tool dono ekdum garam hai. Bol kya fultoo raapchik poster ya layout maangta hai?",
  "Kya bolti public! Eva haazir hai {name}. Ek se ek fultoo designs Connect Website se nikaal ke denge, bol kya chahiye?",
  "Arey bawa sun! Vector ho ya flex layout, apun do minute me khallas kar degi. Hukm kar bas {name}!",
  "Apun ka style ekdum jhakaas hai bidu! Design aisa banayenge ki samne wala dekhte hi bolega - ek number!",
  "Kaise ho bawa {name}! Koi lafda nai, design ka poora scene apun sambhal legi. Bata kya shape ya frame thokna hai?",
  "Arey bidu, Connect Website pe Pinterest aur Vecteezy sab apun ki mutthi me hai. Bol kya reference uthana hai?",
  "Arey hero {name}! Canvas khali kyu rakha hai? Bol kya raapchik banner ya card chipkana hai abhi ke abhi?",
  "Salam bawa! Eva ready hai fultoo speed me. Tension lene ka nai, apun ko dene ka. Bol kya banayein {name}?",
  "Ek number bidu! Design ka boss idhar hai. Bol resume, card, ya architectural layout kya mangta hai?",
  "Arey bawa, Mumbai ki hawa aur Eva ki speed! Bol kya raapchik scene canvas pe chamkana hai aaj?",
]

const GREETINGS_BIHARI: string[] = [
  "Pranam {name} saheb! Hum hain Eva, raua ke design assistant. Kahiye, aaj canvas par kawan garda machana ba?",
  "Arre ka ho {name}! Bilkul chinta mat kariye, hum haeen na yahan. Raua aadesh kariye, kawan design banawe ke ba?",
  "Ram ram {name} ji! Hum poora system taiyyar karke baithe hain. Resume, card, ya brochure, bataiye ka shuru karein?",
  "Pranam! Connect Website se leke vector canvas tak, sab humare hath me ba. Kahiye aaj ka special banaya jaye?",
  "Arre chinta kaahe karte hain raua {name}! Ekdum top class design utaar denge screen par. Kahiye ka banayein?",
  "Namaste saheb! Hum Eva, raua ke seva me hazir hain. Design ke niyam aur rang sab ekdum first-class rahega.",
  "Ka ho bhaiya {name}! Sab theek ba na? Aadesh kariye, abhi Pinterest aur Behance se shandaar idea nikaal kar sajate hain.",
  "Pranam! Hum poora auto-layout aur typography ke maahir hain. Raua bas bataiye, baaki hum sambhal lenge.",
  "Ee dekhiye saheb, hum har dam taiyyar hain. Kawan sunder card ya blueprint canvas pe chahiye raua ke?",
  "Pranam {name} ji! Bilkul befikr rahiye. Desi prem aur vishwash ke sath ekdum kadak design pesh karenge.",
  "Ka ho! Raua ke khatir ekdum shandar aur niyamit design banayenge. Bataiye kawan layout pasand aayi?",
  "Pranam saheb! Raua ke ek aadesh par poora canvas saja denge. Chaliye shuru kiya jaye!",
]

// ─────────────────────────────────────────────────────────────────────────────
// Non-Repeating Queue Manager (Enforces 10-turn non-repetition)
// ─────────────────────────────────────────────────────────────────────────────
const recentGreetingsHistory: Record<EvaPersona, number[]> = {
  basic: [],
  tapori: [],
  bihari: [],
}

export function getNextDynamicGreeting(persona: EvaPersona, userName: string = ""): string {
  const pool =
    persona === "tapori"
      ? GREETINGS_TAPORI
      : persona === "bihari"
      ? GREETINGS_BIHARI
      : GREETINGS_BASIC

  const history = recentGreetingsHistory[persona]

  // Find all available indices not used in the last 10 turns
  const availableIndices: number[] = []
  for (let i = 0; i < pool.length; i++) {
    if (!history.includes(i)) {
      availableIndices.push(i)
    }
  }

  // If all or almost all were used, keep only the last 3 to allow older ones back
  const candidatePool = availableIndices.length > 0 ? availableIndices : pool.map((_, i) => i)
  const pickedIndex = candidatePool[Math.floor(Math.random() * candidatePool.length)]

  // Update history (max 10 items)
  history.push(pickedIndex)
  if (history.length > 10) {
    history.shift()
  }

  const raw = pool[pickedIndex]
  const cleanName = userName ? userName : ""
  return raw.replace(/\{name\}\s*/g, cleanName ? `${cleanName} ` : "").replace(/\s\s+/g, " ")
}

// ─────────────────────────────────────────────────────────────────────────────
// Spoken Commentary & Verbal Handshake Builders
// ─────────────────────────────────────────────────────────────────────────────

export interface LiveCommentaryScript {
  instantHandshake: string
  researchCommentary?: string
  craftingCommentary: string
  completionCommentary: string
  fullSpokenStream: string
}

export function buildLiveCommentary(
  archetype: string,
  persona: EvaPersona,
  researchPlatforms?: string[]
): LiveCommentaryScript {
  const hasResearch = Boolean(researchPlatforms && researchPlatforms.length > 0)
  const platformList = researchPlatforms ? researchPlatforms.join(" & ") : "Pinterest & Behance"

  let instantHandshake = ""
  let researchCommentary = ""
  let craftingCommentary = ""
  let completionCommentary = ""

  switch (persona) {
    case "tapori":
      instantHandshake = `Arey tension kaiku leta hai bidu! ${archetype} mangta hai na?`
      if (hasResearch) {
        researchCommentary = `Ruk, apun abhi Connect Website se ${platformList} pe jhaank ke ekdum faadu reference uthati hai... Modern grid, kadak colors aur sharp vector cuts pick kar liye!`
      }
      craftingCommentary = `Abhi canvas pe multi-layer frame set, auto-layout flex aur kadak typography ka combination baitha diya hai...`
      completionCommentary = `Ye dekh canvas pe, ek number scene ban gaya bidu! Ekdum khallas!`
      break

    case "bihari":
      instantHandshake = `Arre ka ho! Bilkul chinta mat kariye, hum hain na yahan. Raua khatir ${archetype} banaye ke ba?`
      if (hasResearch) {
        researchCommentary = `Abhi hum Connect Website par jaakar ${platformList} se ekdum modern format ka reference check karte hain... Pura margin aur visual hierarchy badhiya se analyze ho gaya ba.`
      }
      craftingCommentary = `Pura container, text sections, vector border aur spacing ekdum niyam se saja diye hain...`
      completionCommentary = `Ee dekhiye saheb, garda uda ke pura design screen pe utaar diye hain! Kahiye kaisan lag raha ba?`
      break

    case "basic":
    default:
      instantHandshake = `Understood. You want a high-fidelity ${archetype}.`
      if (hasResearch) {
        researchCommentary = `I'm tapping into Connect Website to scan high-performing ${platformList} layout references for balanced hierarchy and modern typography...`
      }
      craftingCommentary = `Structuring the outer frame, establishing an 8-point vertical grid, and embedding production-ready vector components...`
      completionCommentary = `Synthesizing the elements now onto your canvas... Done! Take a look at your new design.`
      break
  }

  const parts = [instantHandshake]
  if (researchCommentary) parts.push(researchCommentary)
  parts.push(craftingCommentary)
  parts.push(completionCommentary)

  return {
    instantHandshake,
    researchCommentary,
    craftingCommentary,
    completionCommentary,
    fullSpokenStream: parts.join(" "),
  }
}
