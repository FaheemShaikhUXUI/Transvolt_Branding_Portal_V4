import { NextRequest, NextResponse } from "next/server"
import {
  getCandidateByToken,
  submitCandidateApplication,
  getRecruitmentSettings,
} from "@/lib/hiring/hiring-store"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const candidate = getCandidateByToken(token)

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired application link." },
        { status: 404 }
      )
    }

    const settings = getRecruitmentSettings()

    // Public sanitized representation (NEVER leak internal HR notes or other candidates)
    const sanitizedCandidate = {
      id: candidate.id,
      token: candidate.token,
      fullName: candidate.fullName,
      email: candidate.email,
      phone: candidate.phone,
      appliedPosition: candidate.appliedPosition,
      department: candidate.department,
      status: candidate.status,
      invitation: {
        sentAt: candidate.invitation.sentAt,
        deadline: candidate.invitation.deadline,
        customMessage: candidate.invitation.customMessage,
      },
      documents: candidate.documents || null,
      personalInfo: candidate.personalInfo || null,
      education: candidate.education || [],
      experience: candidate.experience || null,
      jobSpecific: candidate.jobSpecific || null,
      customAnswers: candidate.customAnswers || null,
      advanceForm: candidate.advanceForm || null,
      additionalInfo: candidate.additionalInfo || null,
      interviewPreferences: candidate.interviewPreferences || null,
      submission: candidate.submission || null,
      changeRequest: candidate.changeRequest || null,
      interviewSchedule: candidate.interviewSchedule
        ? {
            roundNumber: candidate.interviewSchedule.roundNumber,
            roundName: candidate.interviewSchedule.roundName,
            date: candidate.interviewSchedule.date,
            startTime: candidate.interviewSchedule.startTime,
            endTime: candidate.interviewSchedule.endTime,
            mode: candidate.interviewSchedule.mode,
            platform: candidate.interviewSchedule.platform,
            meetingUrl: candidate.interviewSchedule.meetingUrl,
            officeAddress: candidate.interviewSchedule.officeAddress,
            contactPerson: candidate.interviewSchedule.contactPerson,
            contactPhone: candidate.interviewSchedule.contactPhone,
            instructions: candidate.interviewSchedule.instructions,
            previousSchedules: candidate.interviewSchedule.previousSchedules || [],
          }
        : null,
      decision: candidate.decision
        ? {
            status: candidate.decision.status,
            decisionDate: candidate.decision.decisionDate,
            joiningDate: candidate.decision.joiningDate,
            offeredDesignation: candidate.decision.offeredDesignation,
            offeredDepartment: candidate.decision.offeredDepartment,
            joiningInstructions: candidate.decision.joiningInstructions,
            feedbackMessage: candidate.decision.feedbackMessage,
          }
        : null,
    }

    return NextResponse.json({
      success: true,
      candidate: sanitizedCandidate,
      settings: {
        companyName: settings.companyName,
        officeAddress: settings.officeAddress,
        hrContactPerson: settings.hrContactPerson,
        hrContactPhone: settings.hrContactPhone,
        recruitmentEmail: settings.recruitmentEmail,
        questionCategories: settings.questionCategories || [],
        candidateQuestions: settings.candidateQuestions || [],
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()

    // Validate token exists
    const candidate = getCandidateByToken(token)
    if (!candidate) {
      return NextResponse.json(
        { success: false, error: "Invalid application token." },
        { status: 404 }
      )
    }

    // Check if already in final status
    if (candidate.status === "HIRED" || candidate.status === "NOT_SELECTED") {
      return NextResponse.json(
        { success: false, error: "This application has already been concluded." },
        { status: 400 }
      )
    }

    const {
      documents,
      personalInfo,
      education,
      experience,
      jobSpecific,
      customAnswers,
      additionalInfo,
      interviewPreferences,
      advanceForm,
    } = body

    const candidateFullName = advanceForm?.fullName || personalInfo?.fullName
    const candidateEmail = advanceForm?.personalEmail || personalInfo?.email
    const candidateMobile = advanceForm?.contactNumber || personalInfo?.mobile

    if (!candidateFullName || !candidateEmail || !candidateMobile) {
      return NextResponse.json(
        { success: false, error: "Please complete personal details (Full Name, Email ID, Contact Number)." },
        { status: 400 }
      )
    }

    const updated = submitCandidateApplication(token, {
      documents,
      personalInfo,
      education,
      experience,
      jobSpecific,
      customAnswers,
      additionalInfo,
      interviewPreferences,
      advanceForm,
    })

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to submit application." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully! Your application is now under review.",
      candidate: updated,
    })
  } catch (error: any) {
    console.error("Failed to submit candidate application:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

