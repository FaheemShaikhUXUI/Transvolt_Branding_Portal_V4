import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { imageBase64, mimeType = "image/jpeg", apiKey: clientApiKey } = body

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: "Missing imageBase64" }, { status: 400 })
    }

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        reason: "NO_API_KEY",
        message: "No Gemini Vision API key found. Falling back to client-side handwriting OCR.",
      })
    }

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "")

    // Call Gemini 1.5 Flash / 2.0 Flash Vision API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an expert AI OCR assistant specialized in reading ID cards, corporate business cards, and handwritten employee joining/onboarding forms.
Examine this image carefully (especially any handwritten, cursive, or printed text).
Extract the candidate's details into a clean JSON object with the following exact keys:
- fullName: candidate full name (Title Case, e.g. "Jordan Jackson", "Sneha Rao")
- designation: job title or role (e.g. "Lead Engineer", "Senior HR")
- email: corporate or candidate email address (lowercase)
- contact: primary contact or mobile phone number (e.g. "+91 98201 00112")
- emrContact: emergency contact number
- bloodGroup: blood group (e.g. "O+", "A+", "B+", "AB-")
- employeeId: employee code or ID (e.g. "TV-2024-001" or "TMPL00001")
- company: company name ("Transvolt Mobility Private Limited" or "Transvolt Energy Private Limited")
- siteLocation: workplace location (e.g. "MBMT", "Mumbai HQ", "Pune Hub", "Delhi NCR Depot", "Bengaluru Plant", "Hyderabad Hub")

Return ONLY the raw JSON object without markdown formatting, code fences, or any other explanation.`,
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 800,
          },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.warn("Gemini API returned error:", response.status, errText)
      return NextResponse.json({ success: false, error: errText }, { status: response.status })
    }

    const data = await response.json()
    const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    // Strip markdown code fences if model included them
    const cleanJson = contentText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim()
    const parsed = JSON.parse(cleanJson)

    return NextResponse.json({
      success: true,
      method: "gemini-vision",
      data: parsed,
    })
  } catch (error: any) {
    console.error("Gemini Vision processing error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process image with Vision AI" },
      { status: 500 }
    )
  }
}
