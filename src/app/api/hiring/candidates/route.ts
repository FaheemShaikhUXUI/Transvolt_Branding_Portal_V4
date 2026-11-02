import { NextRequest, NextResponse } from "next/server"
import { getAllCandidates, createInvitation } from "@/lib/hiring/hiring-store"

export async function GET() {
  try {
    const candidates = getAllCandidates()
    return NextResponse.json({ success: true, candidates })
  } catch (error: any) {
    console.error("Failed to get candidates:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load candidates" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, appliedPosition, department, deadlineDays, customMessage, sentBy } = body

    if (!fullName || !email || !appliedPosition || !department) {
      return NextResponse.json(
        { success: false, error: "Full name, email, position, and department are required." },
        { status: 400 }
      )
    }

    const result = createInvitation({
      fullName,
      email,
      appliedPosition,
      department,
      deadlineDays: deadlineDays ? Number(deadlineDays) : undefined,
      customMessage,
      sentBy,
    })

    return NextResponse.json({
      success: true,
      candidate: result.candidate,
      applicationUrl: result.applicationUrl,
      message: `Invitation generated and dispatched to ${email}`,
    })
  } catch (error: any) {
    console.error("Failed to create candidate invitation:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create invitation" },
      { status: 500 }
    )
  }
}

