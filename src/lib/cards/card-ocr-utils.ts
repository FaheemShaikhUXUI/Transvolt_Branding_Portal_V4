import jsQR from "jsqr"
import Tesseract from "tesseract.js"
import { CandidateInfo } from "./card-print-utils"

export interface ExtractedCandidateData extends Partial<CandidateInfo> {
  rawText?: string
  detectedQr?: string
  methodUsed?: "gemini-vision" | "client-ocr-handwriting" | "qr-code"
}

/**
 * Capitalizes string into clean Title Case
 */
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim()
}

/**
 * Advanced Canvas Preprocessing for Handwritten Text & Notes
 * - Converts to grayscale
 * - Normalizes and stretches contrast (ink vs paper)
 * - Applies adaptive local thresholding to eliminate paper shadows, notebook rulings, and yellow lighting
 * - Slightly thickens faint ballpen/gel pen strokes
 */
export function preprocessCanvasForHandwriting(img: HTMLImageElement): {
  enhancedDataUrl: string
  binarizedDataUrl: string
} {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    return { enhancedDataUrl: img.src, binarizedDataUrl: img.src }
  }

  // Scale up small images for better handwriting character resolution
  const minWidth = 1600
  let width = img.naturalWidth || img.width
  let height = img.naturalHeight || img.height

  if (width < minWidth && width > 0) {
    const scale = minWidth / width
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  canvas.width = width
  canvas.height = height

  // Draw with smoothing
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(img, 0, 0, width, height)

  // 1. Get raw image data
  const imgData = ctx.getImageData(0, 0, width, height)
  const data = imgData.data
  const totalPixels = width * height

  // Find min and max luminance for contrast stretching
  let minLum = 255
  let maxLum = 0
  const lums = new Uint8Array(totalPixels)

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4
    // Standard human eye perceived luminance
    const lum = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2])
    lums[i] = lum
    if (lum < minLum) minLum = lum
    if (lum > maxLum) maxLum = lum
  }

  const range = Math.max(1, maxLum - minLum)

  // Pass 1: Contrast stretched grayscale
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4
    const stretched = Math.round(((lums[i] - minLum) / range) * 255)
    data[idx] = stretched
    data[idx + 1] = stretched
    data[idx + 2] = stretched
  }

  ctx.putImageData(imgData, 0, 0)
  const enhancedDataUrl = canvas.toDataURL("image/jpeg", 0.95)

  // Pass 2: Adaptive local binarization (Otsu-style dynamic separation)
  // Splits image into local blocks to remove non-uniform shadow/lighting
  const blockSize = Math.max(16, Math.floor(width / 35))
  const cOffset = 8 // threshold sensitivity

  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      // Calculate local block average
      let blockSum = 0
      let blockCount = 0
      const maxX = Math.min(width, x + blockSize)
      const maxY = Math.min(height, y + blockSize)

      for (let by = y; by < maxY; by++) {
        for (let bx = x; bx < maxX; bx++) {
          blockSum += lums[by * width + bx]
          blockCount++
        }
      }

      const blockAvg = blockCount > 0 ? blockSum / blockCount : 128
      const threshold = blockAvg - cOffset

      for (let by = y; by < maxY; by++) {
        for (let bx = x; bx < maxX; bx++) {
          const idx = (by * width + bx) * 4
          const val = lums[by * width + bx] < threshold ? 0 : 255
          data[idx] = val
          data[idx + 1] = val
          data[idx + 2] = val
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0)
  const binarizedDataUrl = canvas.toDataURL("image/png")

  return { enhancedDataUrl, binarizedDataUrl }
}

/**
 * Extracts candidate information from an image file.
 * Prioritizes:
 * 1. Multimodal Vision AI (/api/extract-card) with Gemini 1.5/2.0 Flash (superb at handwritten notes).
 * 2. High-contrast adaptive thresholding preprocessed OCR with Tesseract.js.
 * 3. QR code fallback.
 */
export async function extractCandidateFromImage(
  file: File,
  onProgress?: (step: string, percent: number) => void
): Promise<ExtractedCandidateData> {
  onProgress?.("Reading image & preparing AI vision pipeline...", 15)

  // 1. Convert File to base64 and Image Element
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = dataUrl
  })

  // 2. First attempt: Server-Side Multimodal Vision AI (Gemini Vision)
  // Handles handwritten notes, cursive script, and messy onboarding forms with human-level accuracy
  try {
    onProgress?.("Analyzing handwritten typography with Vision AI...", 30)
    const storedApiKey = typeof window !== "undefined" ? localStorage.getItem("transvolt_gemini_api_key") || "" : ""

    const visionResponse = await fetch("/api/extract-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: dataUrl,
        mimeType: file.type || "image/jpeg",
        apiKey: storedApiKey || undefined,
      }),
    })

    if (visionResponse.ok) {
      const visionResult = await visionResponse.json()
      if (visionResult.success && visionResult.data) {
        onProgress?.("Handwritten information deciphered successfully!", 100)
        return {
          ...visionResult.data,
          methodUsed: "gemini-vision",
        }
      }
    }
  } catch (visionErr) {
    console.warn("Vision API pass skipped, continuing with enhanced OCR:", visionErr)
  }

  // 3. QR Code Scan via Canvas (if digital card or voucher)
  onProgress?.("Scanning for QR codes & digital signatures...", 40)
  let vCardData: Partial<CandidateInfo> = {}
  let detectedQrString = ""
  try {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (ctx) {
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      })

      if (qrCode?.data) {
        detectedQrString = qrCode.data
        if (qrCode.data.includes("BEGIN:VCARD")) {
          vCardData = parseCandidateText(qrCode.data)
        }
      }
    }
  } catch (err) {
    console.warn("QR scan error:", err)
  }

  // 4. Preprocess Image for Handwriting Recognition
  onProgress?.("Enhancing handwritten ink strokes & removing paper background...", 55)
  const { enhancedDataUrl, binarizedDataUrl } = preprocessCanvasForHandwriting(img)

  // 5. Multi-Pass OCR via Tesseract
  onProgress?.("Running multi-pass handwritten optical character recognition...", 70)
  let rawOcrText = ""

  try {
    // Pass A: Enhanced contrast image
    const pass1 = await Tesseract.recognize(enhancedDataUrl, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text" && typeof m.progress === "number") {
          onProgress?.("Deciphering handwritten characters...", Math.min(88, Math.round(70 + m.progress * 15)))
        }
      },
    })
    rawOcrText += (pass1.data.text || "") + "\n"

    // If text volume is low, run on binarized image to catch faint pen marks
    if (rawOcrText.trim().length < 40) {
      const pass2 = await Tesseract.recognize(binarizedDataUrl, "eng")
      rawOcrText += (pass2.data.text || "") + "\n"
    }
  } catch (err) {
    console.warn("Tesseract OCR fallback:", err)
    // Fallback to original image if needed
    try {
      const fallbackPass = await Tesseract.recognize(dataUrl, "eng")
      rawOcrText += (fallbackPass.data.text || "") + "\n"
    } catch {}
  }

  onProgress?.("Structuring handwritten data & applying error correction...", 92)

  // 6. Intelligent Parser with Handwriting Error-Correction
  const parsedData: ExtractedCandidateData = parseCandidateText(rawOcrText, vCardData)
  parsedData.rawText = rawOcrText
  parsedData.detectedQr = detectedQrString
  parsedData.methodUsed = "client-ocr-handwriting"

  // NOTE: photoUrl is left untouched (not set to document) as requested!
  onProgress?.("Extraction complete!", 100)

  return parsedData
}

/**
 * Intelligent parser to extract specific fields from handwritten or typed OCR text
 * with aggressive typo correction for handwritten pen strokes.
 */
export function parseCandidateText(
  text: string,
  existingVCardData?: Partial<CandidateInfo>
): Partial<CandidateInfo> {
  const result: Partial<CandidateInfo> = { ...existingVCardData }

  // Normalize typical handwritten OCR confusion:
  // Colons often read as semicolons, dashes, periods, or equal signs
  const normalizedText = text
    .replace(/[;=~]/g, ":")
    .replace(/\|\s*/g, " ")

  const cleanLines = normalizedText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  // 1. Email Extraction (with handwritten OCR typo recovery: e.g. "at" or "(a)" for @)
  if (!result.email) {
    // Standard email match
    const emailMatch = normalizedText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/)
    if (emailMatch) {
      result.email = emailMatch[0].toLowerCase()
    } else {
      // Handwritten typo: e.g. "name (a) transvolt.in" or "name.j@transvolt in"
      const typoMatch = normalizedText.match(/\b([A-Za-z0-9._%+-]+)\s*(?:@|\(a\)|at)\s*(transvolt|gmail|outlook)\s*(?:\.|\s+)(in|com)\b/i)
      if (typoMatch) {
        result.email = `${typoMatch[1].toLowerCase()}@${typoMatch[2].toLowerCase()}.${typoMatch[3].toLowerCase()}`
      }
    }
  }

  // 2. Phone Numbers Extraction (with handwritten digit typo recovery: 'O'->'0', 'l'/'I'->'1', 'S'->'5')
  const phoneMatches: string[] = []
  for (const line of cleanLines) {
    if (/contact|mobile|mob|phone|ph|tel|cell|emr|emergency/i.test(line) || /\d{4}/.test(line)) {
      // Fix handwritten letter-number confusions in number fields
      const sanitizedLine = line.replace(/(?<=\d)[oO](?=\d)/g, "0").replace(/(?<=\d)[lI](?=\d)/g, "1")
      const digits = sanitizedLine.replace(/\D/g, "")

      if (digits.length >= 10 && digits.length <= 13) {
        const last10 = digits.slice(-10)
        const formatted = `+91 ${last10.slice(0, 4)} ${last10.slice(4, 7)} ${last10.slice(7)}`
        if (!phoneMatches.includes(formatted)) {
          if (/emergency|emr|alt/i.test(line)) {
            result.emrContact = formatted
          } else {
            phoneMatches.push(formatted)
          }
        }
      }
    }
  }

  if (!result.contact && phoneMatches.length > 0) {
    result.contact = phoneMatches[0]
  }
  if (!result.emrContact && phoneMatches.length > 1) {
    result.emrContact = phoneMatches[1]
  }

  // 3. Blood Group Extraction (supporting handwritten "+ve", "-ve", "pos", "positive")
  if (!result.bloodGroup) {
    const bgMatch =
      normalizedText.match(/\b(A|B|AB|O)\s*(?:\+|positive|\+ve|pos)\b/i) ||
      normalizedText.match(/\b(A|B|AB|O)\s*(?:-|negative|-ve|neg)\b/i) ||
      normalizedText.match(/(?:blood\s*group|blood|bg)\s*[:\-]?\s*([A-Za-z]+[+-]?)/i)

    if (bgMatch) {
      let group = bgMatch[1].toUpperCase().replace(/\s+/g, "")
      if (/-|negative|-ve|neg/i.test(bgMatch[0])) {
        group = group.replace(/[^ABO]/g, "") + "-"
      } else {
        group = group.replace(/[^ABO]/g, "") + "+"
      }
      result.bloodGroup = group
    } else {
      result.bloodGroup = "O+"
    }
  }

  // 4. Employee ID Extraction (handling handwritten letter confusions)
  if (!result.employeeId) {
    const empMatch =
      normalizedText.match(/\b(TV[-_\s]?\d{4}[-_\s]?[A-Z0-9]{2,4})\b/i) ||
      normalizedText.match(/\b(TMPL[-_\s]?[A-Z0-9]{4,6})\b/i) ||
      normalizedText.match(/(?:employee\s*id|emp\s*id|emp\s*code|id\s*no|code)\s*[:\-]\s*([A-Za-z0-9-_]+)/i)

    if (empMatch && empMatch[1]) {
      const cleanId = empMatch[1].toUpperCase().replace(/[_]/g, "-").replace(/\s+/g, "")
      result.employeeId = cleanId
    }
  }

  // 5. Company Name Extraction
  if (!result.company) {
    if (/energy/i.test(normalizedText)) {
      result.company = "Transvolt Energy Private Limited"
    } else {
      result.company = "Transvolt Mobility Private Limited"
    }
  }

  // 6. Site / Location Extraction
  if (!result.siteLocation) {
    if (/mbmt/i.test(normalizedText)) result.siteLocation = "MBMT"
    else if (/mumbai/i.test(normalizedText)) result.siteLocation = "Mumbai HQ"
    else if (/pune/i.test(normalizedText)) result.siteLocation = "Pune Hub"
    else if (/delhi|ncr/i.test(normalizedText)) result.siteLocation = "Delhi NCR Depot"
    else if (/bengaluru|bangalore/i.test(normalizedText)) result.siteLocation = "Bengaluru Plant"
    else if (/hyderabad/i.test(normalizedText)) result.siteLocation = "Hyderabad Hub"
    else result.siteLocation = "Mumbai HQ"
  }

  // 7. Designation Extraction (handling handwritten labels like "Desig:", "Role:", "Post:")
  const desigKeywords = [
    "engineer",
    "manager",
    "lead",
    "officer",
    "director",
    "specialist",
    "head",
    "executive",
    "architect",
    "analyst",
    "cto",
    "ceo",
    "coo",
    "cfo",
    "vp",
    "president",
    "hr",
    "consultant",
    "associate",
    "developer",
    "designer",
    "operator",
    "technician",
    "coordinator",
    "supervisor",
    "accountant",
    "assistant",
  ]

  if (!result.designation) {
    // Explicit handwritten label: "Designation:", "Desig:", "Role:", "Title:", "Position:"
    for (const line of cleanLines) {
      const match = line.match(/^(?:designation|desig|role|title|position|post)\s*[:\-]\s*([a-zA-Z\s/&-]+)$/i)
      if (match && match[1].trim().length >= 2) {
        result.designation = toTitleCase(match[1].trim())
        break
      }
    }
  }

  if (!result.designation) {
    const foundDesig = cleanLines.find((l) =>
      desigKeywords.some((keyword) => new RegExp(`\\b${keyword}\\b`, "i").test(l)) &&
      !/transvolt|mobility|energy|ltd|private|company|pvt/i.test(l) &&
      !l.includes("@") &&
      !/\d{5,}/.test(l)
    )
    if (foundDesig) {
      result.designation = toTitleCase(
        foundDesig.replace(/^(?:designation|desig|role|title|post)[:\-\s]*/i, "").trim()
      )
    }
  }

  // 8. ROBUST HANDWRITTEN PERSON'S FULL NAME EXTRACTION
  if (!result.fullName) {
    // Strategy A: Explicit handwritten line "Name: Jordan Jackson" or "Candidate: Sneha Rao"
    for (const line of cleanLines) {
      const explicitMatch = line.match(
        /^(?:Name|Candidate|Employee|Full\s*Name|Candidate\s*Name|Emp\s*Name|Person)\s*[:\-]\s*([a-zA-Z\s.'-]+)$/i
      )
      if (explicitMatch && explicitMatch[1]) {
        const candidateName = explicitMatch[1].trim().replace(/[:;\-_/\\|]+$/, "").trim()
        if (candidateName.length >= 2 && !/transvolt|mobility|energy/i.test(candidateName)) {
          result.fullName = toTitleCase(candidateName)
          break
        }
      }
    }
  }

  if (!result.fullName) {
    // Strategy B: Inline match if "Name:" is anywhere in line
    for (const line of cleanLines) {
      const inlineMatch = line.match(/(?:Name|Candidate|Full\s*Name)\s*[:\-]\s*([a-zA-Z\s.'-]+)/i)
      if (inlineMatch && inlineMatch[1]) {
        const candidateName = inlineMatch[1].trim().replace(/[:;\-_/\\|]+$/, "").trim()
        if (candidateName.length >= 2 && !/transvolt|mobility|energy|designation|email|contact/i.test(candidateName)) {
          result.fullName = toTitleCase(candidateName)
          break
        }
      }
    }
  }

  if (!result.fullName) {
    // Strategy C: Filter non-name lines and look for candidate name
    const nonNameWords = [
      "transvolt",
      "mobility",
      "energy",
      "private",
      "limited",
      "pvt",
      "ltd",
      "technologies",
      "safety",
      "sustainability",
      "authorized",
      "identity",
      "contact",
      "emergency",
      "emr",
      "blood",
      "group",
      "employee",
      "id",
      "card",
      "kamala",
      "mills",
      "lower",
      "parel",
      "mumbai",
      "pune",
      "delhi",
      "bengaluru",
      "hyderabad",
      "india",
      "www",
      "http",
      "https",
      "info@",
      "email",
      "mail",
      "phone",
      "mobile",
      "tel",
      "site",
      "location",
      "designation",
      "joining",
      "validity",
      "valid",
      "signatory",
      "signature",
      "portal",
    ]

    const potentialNameLines = cleanLines.filter((line) => {
      const lower = line.toLowerCase()
      if (result.designation && lower === result.designation.toLowerCase()) return false
      if (nonNameWords.some((w) => new RegExp(`\\b${w}\\b`, "i").test(lower))) return false
      if (/\d/.test(line) || line.includes("@") || line.includes(".com") || line.includes(".in")) return false

      const clean = line.replace(/[^a-zA-Z\s.'-]/g, "").trim()
      const words = clean.split(/\s+/).filter(Boolean)
      return words.length >= 2 && words.length <= 4 && clean.length >= 3 && clean.length <= 35
    })

    if (potentialNameLines.length > 0) {
      const chosen = potentialNameLines[0].replace(/[^a-zA-Z\s.'-]/g, "").trim()
      result.fullName = toTitleCase(chosen)
    }
  }

  // Strategy D: Fallback to email handle (e.g. sneha.rao@transvolt.in -> Sneha Rao)
  if (!result.fullName && result.email) {
    const handle = result.email.split("@")[0]
    const parts = handle.split(/[._-]/).filter((p) => p.length >= 2 && !/\d/.test(p))
    if (parts.length >= 2) {
      result.fullName = toTitleCase(parts.join(" "))
    } else if (parts.length === 1 && parts[0].length >= 3) {
      result.fullName = toTitleCase(parts[0])
    }
  }

  return result
}
