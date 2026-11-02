import { NextRequest, NextResponse } from "next/server"
import {
  getCandidateById,
  approveAndScheduleInterview,
  rescheduleInterview,
  recordInterviewEvaluation,
  markCandidateHired,
  markCandidateRejected,
  requestAdditionalInformation,
  addInternalNote,
} from "@/lib/hiring/hiring-store"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const candidate = getCandidateById(id)
    if (!candidate) {
      return NextResponse.json({ success: false, error: "Candidate not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, candidate })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, payload } = body

    if (!action) {
      return NextResponse.json({ success: false, error: "Action is required" }, { status: 400 })
    }

    let updated = null

    switch (action) {
      case "APPROVE_SCHEDULE":
        updated = approveAndScheduleInterview(id, payload)
        break

      case "RESCHEDULE":
        updated = rescheduleInterview(id, payload)
        break

      case "EVALUATE":
        updated = recordInterviewEvaluation(id, payload)
        break

      case "HIRE":
        updated = markCandidateHired(id, payload)
        break

      case "REJECT":
        updated = markCandidateRejected(id, payload)
        break

      case "REQUEST_CHANGES":
        updated = requestAdditionalInformation(id, payload)
        break

      case "ADD_NOTE":
        updated = addInternalNote(id, payload)
        break

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Candidate not found or update failed" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, candidate: updated })
  } catch (error: any) {
    console.error("Failed to patch candidate:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

