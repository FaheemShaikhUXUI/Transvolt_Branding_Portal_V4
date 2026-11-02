import { NextRequest, NextResponse } from "next/server"
import { getRecruitmentSettings, updateRecruitmentSettings } from "@/lib/hiring/hiring-store"

export async function GET() {
  try {
    const settings = getRecruitmentSettings()
    return NextResponse.json({ success: true, settings })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const updated = updateRecruitmentSettings(body)
    return NextResponse.json({ success: true, settings: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

