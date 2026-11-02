"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  Mail,
  Phone,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Plus,
  Trash2,
  Download,
  ShieldCheck,
  CalendarCheck2,
  History,
  Lock,
  Volume2,
  CheckSquare,
  AlignLeft,
  ChevronDown,
  ToggleLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { AdvanceCandidateFormView } from "@/components/hiring/advance-candidate-form"
import {
  Candidate,
  EducationRecord,
  ExperienceRecord,
  InterviewMode,
  FormQuestionCategory,
  CandidateFormQuestion,
} from "@/lib/hiring/types"

export default function PublicCandidateApplicationPage() {
  const params = useParams()
  const token = params?.token as string

  const [loading, setLoading] = useState(true)
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [settings, setSettings] = useState<{
    companyName: string
    officeAddress: string
    hrContactPerson: string
    hrContactPhone: string
    recruitmentEmail: string
    questionCategories?: FormQuestionCategory[]
    candidateQuestions?: CandidateFormQuestion[]
  } | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Current wizard step for Application Pending (1 to 8)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dynamic Custom Questions Answers
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({})

  // Form State
  const [photoUrl, setPhotoUrl] = useState("")
  const [photoFileName, setPhotoFileName] = useState("")
  const [resumeUrl, setResumeUrl] = useState("")
  const [resumeFileName, setResumeFileName] = useState("")
  const [coverLetterText, setCoverLetterText] = useState("")

  // Personal Info
  const [fullName, setFullName] = useState("")
  const [fatherName, setFatherName] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("Male")
  const [mobile, setMobile] = useState("")
  const [altMobile, setAltMobile] = useState("")
  const [email, setEmail] = useState("")
  const [currentAddress, setCurrentAddress] = useState("")
  const [permanentAddress, setPermanentAddress] = useState("")
  const [city, setCity] = useState("Mumbai")
  const [state, setState] = useState("Maharashtra")
  const [pincode, setPincode] = useState("")
  const [nationality, setNationality] = useState("Indian")

  // Education Records
  const [educationList, setEducationList] = useState<EducationRecord[]>([
    {
      id: "edu-1",
      highestQual: "Graduation",
      degree: "B.E. / B.Tech",
      specialization: "Automotive / Electrical / Mechanical",
      institution: "",
      passingYear: "2022",
      score: "",
    },
  ])

  // Experience
  const [isExperienced, setIsExperienced] = useState(true)
  const [totalYears, setTotalYears] = useState("2 Years")
  const [experienceList, setExperienceList] = useState<ExperienceRecord[]>([
    {
      id: "exp-1",
      company: "",
      designation: "",
      duration: "2022 - 2024",
      responsibilities: "",
      currentCtc: "",
      expectedCtc: "",
      noticePeriod: "30 Days",
      reasonForLeaving: "",
    },
  ])

  // Job Specific
  const [preferredLocation, setPreferredLocation] = useState("Mumbai HQ / Powai")
  const [relevantSkills, setRelevantSkills] = useState("")
  const [technicalSkills, setTechnicalSkills] = useState("")
  const [toolsKnowledge, setToolsKnowledge] = useState("")
  const [whyTransvolt, setWhyTransvolt] = useState("")
  const [whyHireYou, setWhyHireYou] = useState("")
  const [relevantExperience, setRelevantExperience] = useState("")
  const [comfortableWithDuties, setComfortableWithDuties] = useState(true)
  const [willingToTravel, setWillingToTravel] = useState(true)

  // Additional Information
  const [languages, setLanguages] = useState("English, Hindi, Marathi")
  const [englishProficiency, setEnglishProficiency] = useState("Fluent")
  const [drivingLicence, setDrivingLicence] = useState("Yes (Four Wheeler)")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [emergencyContactName, setEmergencyContactName] = useState("")
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("")

  // Interview Preferences
  const [preferredDate, setPreferredDate] = useState("")
  const [preferredTime, setPreferredTime] = useState("11:00 AM")
  const [altDate, setAltDate] = useState("")
  const [altTime, setAltTime] = useState("03:00 PM")
  const [modePreference, setModePreference] = useState<InterviewMode>("ONLINE")
  const [schedulingNotes, setSchedulingNotes] = useState("")

  // Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(false)

  // Fetch Public Candidate Data
  const loadPublicData = async () => {
    if (!token) return
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/hiring/public/${token}`)
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Application link not found or expired.")
      }

      const c: Candidate = data.candidate
      setCandidate(c)
      setSettings(data.settings)

      // Initialize form fields with prefill
      setFullName(c.personalInfo?.fullName || c.fullName || "")
      setEmail(c.personalInfo?.email || c.email || "")
      setFatherName(c.personalInfo?.fatherName || "")
      setDob(c.personalInfo?.dob || "")
      setGender(c.personalInfo?.gender || "Male")
      setMobile(c.personalInfo?.mobile || c.phone || "")
      setAltMobile(c.personalInfo?.altMobile || "")
      setCurrentAddress(c.personalInfo?.currentAddress || "")
      setPermanentAddress(c.personalInfo?.permanentAddress || "")
      setCity(c.personalInfo?.city || "Mumbai")
      setState(c.personalInfo?.state || "Maharashtra")
      setPincode(c.personalInfo?.pincode || "")
      setNationality(c.personalInfo?.nationality || "Indian")

      if (c.customAnswers) {
        setCustomAnswers(c.customAnswers)
      }

      if (c.documents) {
        setPhotoUrl(c.documents.photoUrl || "")
        setPhotoFileName(c.documents.photoFileName || "")
        setResumeUrl(c.documents.resumeUrl || "")
        setResumeFileName(c.documents.resumeFileName || "")
        setCoverLetterText(c.documents.coverLetterFileName || "")
      }

      if (c.education && c.education.length > 0) {
        setEducationList(c.education)
      }

      if (c.experience) {
        setIsExperienced(c.experience.isExperienced)
        setTotalYears(c.experience.totalYears || "")
        if (c.experience.records && c.experience.records.length > 0) {
          setExperienceList(c.experience.records)
        }
      }

      if (c.jobSpecific) {
        setPreferredLocation(c.jobSpecific.preferredLocation || "Mumbai HQ")
        setRelevantSkills(c.jobSpecific.relevantSkills || "")
        setTechnicalSkills(c.jobSpecific.technicalSkills || "")
        setToolsKnowledge(c.jobSpecific.toolsKnowledge || "")
        setWhyTransvolt(c.jobSpecific.whyTransvolt || "")
        setWhyHireYou(c.jobSpecific.whyHireYou || "")
        setRelevantExperience(c.jobSpecific.relevantExperience || "")
        setComfortableWithDuties(c.jobSpecific.comfortableWithDuties ?? true)
        setWillingToTravel(c.jobSpecific.willingToTravel ?? true)
      }

      if (c.additionalInfo) {
        setLanguages(c.additionalInfo.languages?.join(", ") || "English, Hindi")
        setEnglishProficiency(c.additionalInfo.englishProficiency || "Fluent")
        setDrivingLicence(c.additionalInfo.drivingLicence || "Yes")
        setLinkedinUrl(c.additionalInfo.linkedinUrl || "")
        setPortfolioUrl(c.additionalInfo.portfolioUrl || "")
        setEmergencyContactName(c.additionalInfo.emergencyContactName || "")
        setEmergencyContactPhone(c.additionalInfo.emergencyContactPhone || "")
      }

      if (c.interviewPreferences) {
        setPreferredDate(c.interviewPreferences.preferredDate || "")
        setPreferredTime(c.interviewPreferences.preferredTime || "11:00 AM")
        setAltDate(c.interviewPreferences.altDate || "")
        setAltTime(c.interviewPreferences.altTime || "03:00 PM")
        setModePreference(c.interviewPreferences.modePreference || "ONLINE")
        setSchedulingNotes(c.interviewPreferences.notes || "")
      } else {
        const nextDate = new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]
        setPreferredDate(nextDate)
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load application.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPublicData()
  }, [token])

  // File Upload helper
  const handleFileUpload = async (file: File, type: "photo" | "resume") => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    const loadingToast = toast.loading(`Uploading ${file.name}...`)
    try {
      const res = await fetch("/api/hiring/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Upload failed")
      }

      if (type === "photo") {
        setPhotoUrl(data.url)
        setPhotoFileName(data.fileName)
        toast.success("Profile photo uploaded successfully!", { id: loadingToast })
      } else {
        setResumeUrl(data.url)
        setResumeFileName(data.fileName)
        toast.success("Resume uploaded successfully!", { id: loadingToast })
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: loadingToast })
    }
  }

  // Handle Form Submission (Step 8)
  const handleSubmitApplication = async () => {
    if (!declarationAccepted) {
      toast.error("Please accept the accuracy declaration and consent before submitting.")
      return
    }

    if (!fullName.trim() || !email.trim() || !mobile.trim()) {
      toast.error("Please ensure Full Name, Email, and Mobile Number are provided.")
      setCurrentStep(2)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        documents: {
          photoUrl: photoUrl || undefined,
          photoFileName: photoFileName || undefined,
          resumeUrl: resumeUrl || undefined,
          resumeFileName: resumeFileName || undefined,
          coverLetterFileName: coverLetterText || undefined,
        },
        personalInfo: {
          fullName: fullName.trim(),
          fatherName: fatherName.trim(),
          dob,
          gender,
          mobile: mobile.trim(),
          altMobile: altMobile.trim() || undefined,
          email: email.trim().toLowerCase(),
          currentAddress: currentAddress.trim(),
          permanentAddress: permanentAddress.trim() || currentAddress.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          nationality: nationality.trim(),
        },
        education: educationList,
        experience: {
          isExperienced,
          totalYears: isExperienced ? totalYears : "0 Years",
          records: isExperienced ? experienceList : [],
        },
        jobSpecific: {
          positionApplied: candidate?.appliedPosition || "",
          department: candidate?.department || "",
          preferredLocation,
          relevantSkills,
          technicalSkills,
          toolsKnowledge,
          whyTransvolt,
          whyHireYou,
          relevantExperience,
          comfortableWithDuties,
          willingToTravel,
        },
        additionalInfo: {
          languages: languages.split(",").map((s) => s.trim()).filter(Boolean),
          englishProficiency,
          drivingLicence,
          portfolioUrl: portfolioUrl.trim() || undefined,
          linkedinUrl: linkedinUrl.trim() || undefined,
          emergencyContactName: emergencyContactName.trim(),
          emergencyContactPhone: emergencyContactPhone.trim(),
        },
        interviewPreferences: {
          preferredDate,
          preferredTime,
          altDate: altDate || undefined,
          altTime: altTime || undefined,
          modePreference,
          notes: schedulingNotes.trim() || undefined,
        },
        customAnswers,
      }

      const res = await fetch(`/api/hiring/public/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Submission failed.")
      }

      toast.success("Application submitted successfully!")
      setCandidate(data.candidate)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate .ics calendar download for approved interview
  const handleDownloadCalendar = () => {
    if (!candidate?.interviewSchedule) return
    const sched = candidate.interviewSchedule
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Transvolt Mobility//Recruitment Interview//EN",
      "BEGIN:VEVENT",
      `SUMMARY:Transvolt Interview: ${sched.roundName}`,
      `DESCRIPTION:Interview for ${candidate.appliedPosition} at Transvolt Mobility.\\nMeeting: ${sched.meetingUrl || sched.officeAddress}`,
      `LOCATION:${sched.mode === "ONLINE" ? sched.meetingUrl : sched.officeAddress}`,
      `DTSTART:${sched.date.replace(/-/g, "")}T100000Z`,
      `DTEND:${sched.date.replace(/-/g, "")}T110000Z`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n")

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
    const link = document.createElement("a")
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute("download", `Transvolt_Interview_${candidate.id}.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Calendar invite (.ics) downloaded!")
  }

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
        <div className="h-12 w-12 rounded-2xl bg-[#548235] text-white flex items-center justify-center shadow-lg shadow-[#548235]/30 animate-pulse mb-4">
          <Briefcase className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Loading Transvolt Candidate Portal...
        </p>
      </div>
    )
  }

  // Error / Invalid Link Screen
  if (errorMsg || !candidate) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
          <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Invalid or Expired Link
          </h2>
          <p className="text-xs text-zinc-500">
            {errorMsg || "This recruitment link is not recognized or has expired. Please contact Transvolt HR for a renewed link."}
          </p>
        </div>
      </div>
    )
  }

  // RENDER DYNAMIC STATE BASED ON CANDIDATE STATUS
  return (
    <div className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Public Header with Transvolt Brand Logo */}
      <header className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 px-6 py-4 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span className="text-[#548235]">TRANSVOLT</span> MOBILITY
              </span>
            </div>
            <span className="hidden sm:inline-block text-zinc-300 dark:text-zinc-700">|</span>
            <span className="hidden sm:inline-block text-xs font-semibold text-zinc-500">
              Candidate Portal
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-zinc-500 text-[11px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
              {candidate.id}
            </span>
            <span className="p-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* ======================================================== */}
        {/* STATE 05: HIRED SCREEN (CONGRATULATIONS!)                 */}
        {/* ======================================================== */}
        {candidate.status === "HIRED" && (
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-[#548235]/40 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-[#548235] to-emerald-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-[#548235]/30">
              <Sparkles className="h-10 w-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <Badge className="bg-[#548235] text-white px-3 py-1 text-xs uppercase tracking-wider">
                Official Selection Notice
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                Congratulations, {candidate.fullName}!
              </h1>
              <p className="text-base text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto">
                We are delighted to welcome you to <strong>Transvolt Mobility Private Limited</strong>. You have successfully cleared our recruitment evaluations!
              </p>
            </div>

            {/* Offer Information Card */}
            <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 max-w-xl mx-auto text-left space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-zinc-400 block text-[11px]">Designation Offered</span>
                  <span className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                    {candidate.decision?.offeredDesignation || candidate.appliedPosition}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[11px]">Department</span>
                  <span className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                    {candidate.decision?.offeredDepartment || candidate.department}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[11px]">Official Joining Date</span>
                  <span className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                    {candidate.decision?.joiningDate || "Confirmed with HR"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[11px]">HR Contact Helpline</span>
                  <span className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                    {settings?.hrContactPhone || "+91 98200 12345"}
                  </span>
                </div>
              </div>

              {candidate.decision?.joiningInstructions && (
                <div className="pt-3 border-t border-emerald-200 dark:border-emerald-800/50">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1">
                    Day 1 Joining Instructions & Next Steps:
                  </span>
                  <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed whitespace-pre-wrap">
                    {candidate.decision.joiningInstructions}
                  </p>
                </div>
              )}
            </div>

            <div className="text-xs text-zinc-500 max-w-md mx-auto">
              Our HR onboarding team will connect with your registered email address ({candidate.email}) for formal documentation. Welcome aboard!
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STATE 06: NOT SELECTED SCREEN                            */}
        {/* ======================================================== */}
        {candidate.status === "NOT_SELECTED" && (
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6 text-center max-w-2xl mx-auto">
            <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
              <Briefcase className="h-8 w-8 stroke-1" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Thank You for Your Interest in Transvolt
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg mx-auto">
                After careful consideration and review, we regret to inform you that we will not be moving forward with your application for the <strong>{candidate.appliedPosition}</strong> position at this time.
              </p>
            </div>

            {candidate.decision?.feedbackMessage && (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 italic text-left max-w-lg mx-auto">
                "{candidate.decision.feedbackMessage}"
              </div>
            )}

            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              We sincerely appreciate the time and effort you invested in applying to Transvolt Mobility and wish you the greatest success in your professional endeavors.
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* STATE 03 & 04: INTERVIEW APPROVED / RESCHEDULED          */}
        {/* ======================================================== */}
        {(candidate.status === "INTERVIEW_SCHEDULED" ||
          candidate.status === "INTERVIEW_RESCHEDULED") &&
          candidate.interviewSchedule && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Rescheduled Notice Banner */}
              {candidate.status === "INTERVIEW_RESCHEDULED" && (
                <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <History className="h-5 w-5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <h3 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                      Your Interview Schedule Has Been Updated!
                    </h3>
                    <p className="text-amber-800 dark:text-amber-300">
                      The Transvolt HR recruitment team has adjusted the interview schedule. Please review your updated time slot below.
                    </p>
                    {candidate.interviewSchedule.previousSchedules?.[0]?.rescheduleReason && (
                      <p className="font-semibold text-amber-900 dark:text-amber-200 mt-1">
                        Reason: {candidate.interviewSchedule.previousSchedules[0].rescheduleReason}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Confirmed Interview Card */}
              <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-indigo-200 dark:border-indigo-900/60 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      Interview Confirmed
                    </span>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                      {candidate.interviewSchedule.roundName}
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Position: <strong>{candidate.appliedPosition}</strong> • Application ID: {candidate.id}
                    </p>
                  </div>

                  <Button
                    onClick={handleDownloadCalendar}
                    variant="outline"
                    className="border-indigo-300 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 shrink-0 text-xs font-semibold"
                  >
                    <CalendarCheck2 className="h-4 w-4 mr-1.5" />
                    Add to Calendar
                  </Button>
                </div>

                {/* Schedule Ticket Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[11px] flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Interview Date
                    </span>
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {candidate.interviewSchedule.date}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[11px] flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Scheduled Time
                    </span>
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {candidate.interviewSchedule.startTime} - {candidate.interviewSchedule.endTime}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[11px]">Interview Mode</span>
                    <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                      {candidate.interviewSchedule.mode === "ONLINE"
                        ? `Online (${candidate.interviewSchedule.platform})`
                        : "In-Person (HQ)"}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[11px]">HR Contact Person</span>
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {candidate.interviewSchedule.contactPerson}
                    </span>
                  </div>
                </div>

                {/* Meeting Link or Office Location */}
                {candidate.interviewSchedule.mode === "ONLINE" &&
                candidate.interviewSchedule.meetingUrl ? (
                  <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                        <Video className="h-4 w-4 text-indigo-600" />
                        Online Meeting URL ({candidate.interviewSchedule.platform})
                      </span>
                      <p className="font-mono text-xs text-indigo-700 dark:text-indigo-300 break-all">
                        {candidate.interviewSchedule.meetingUrl}
                      </p>
                    </div>
                    <Button
                      onClick={() => window.open(candidate.interviewSchedule?.meetingUrl, "_blank")}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold h-10 px-6 shrink-0 shadow-md shadow-indigo-600/20"
                    >
                      Join Interview Meeting
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-1">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-red-500" />
                      Reporting Office Location
                    </span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300">
                      {candidate.interviewSchedule.officeAddress || settings?.officeAddress}
                    </p>
                  </div>
                )}

                {/* Candidate Instructions */}
                {candidate.interviewSchedule.instructions && (
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block uppercase tracking-wider text-[10px]">
                      Candidate Instructions:
                    </span>
                    <p className="leading-relaxed">{candidate.interviewSchedule.instructions}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* ======================================================== */}
        {/* STATE 02: UNDER REVIEW SCREEN (READ-ONLY)                */}
        {/* ======================================================== */}
        {candidate.status === "UNDER_REVIEW" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Banner */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-blue-200 dark:border-blue-900/60 shadow-xl space-y-4 text-center">
              <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Your Application Has Been Successfully Submitted!
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
                  Your application is currently <strong>under review</strong> by the Transvolt HR Team. We will notify you through your registered email address (<span className="font-semibold text-zinc-900 dark:text-zinc-100">{candidate.email}</span>) regarding the interview schedule and next steps.
                </p>
              </div>

              <div className="inline-flex items-center gap-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs">
                <span>Application ID: <strong className="font-mono">{candidate.id}</strong></span>
                <span>•</span>
                <span>Status: <strong className="text-blue-600">Under Review</strong></span>
                <span>•</span>
                <span>
                  Submitted: <strong>{candidate.submission?.submittedAt ? new Date(candidate.submission.submittedAt).toLocaleDateString() : "Today"}</strong>
                </span>
              </div>
            </div>

            {/* Read-only Submission Summary */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Submitted Application Summary (Read-Only)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border space-y-1">
                  <span className="text-zinc-400 block text-[11px]">Applied Position</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{candidate.appliedPosition}</span>
                  <span className="text-[11px] text-zinc-500 block">{candidate.department}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border space-y-1">
                  <span className="text-zinc-400 block text-[11px]">Applicant Details</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{candidate.personalInfo?.fullName || candidate.fullName}</span>
                  <span className="text-[11px] text-zinc-500 block">{candidate.personalInfo?.mobile || candidate.phone}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border space-y-1">
                  <span className="text-zinc-400 block text-[11px]">Uploaded Documents</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate">
                    📄 {candidate.documents?.resumeFileName || "Resume PDF"}
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate">
                    📷 {candidate.documents?.photoFileName || "Profile Photo"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STATE 01: APPLICATION PENDING / CHANGES REQUESTED FORM   */}
        {/* ======================================================== */}
        {(candidate.status === "APPLICATION_PENDING" ||
          candidate.status === "CHANGES_REQUESTED") && (
          <div className="space-y-6">
            {/* If Changes Requested Banner */}
            {candidate.status === "CHANGES_REQUESTED" && candidate.changeRequest && (
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div className="text-xs space-y-1">
                  <h3 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                    Action Required: Information Correction Requested by HR
                  </h3>
                  <p className="text-amber-800 dark:text-amber-300">
                    "{candidate.changeRequest.remarks}"
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                    Please update your information below and re-submit your application.
                  </p>
                </div>
              </div>
            )}

            {/* Advance Form Question Page Component */}
            <AdvanceCandidateFormView
              candidate={candidate}
              token={token}
              onSubmitted={(updated) => {
                setCandidate(updated)
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
            />
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {settings?.companyName || "Transvolt Mobility Private Limited"}. All rights reserved.
          </span>
          <span className="text-[11px] text-zinc-400">
            Official Recruitment Portal • {settings?.recruitmentEmail || "careers@transvoltmobility.com"}
          </span>
        </div>
      </footer>
    </div>
  )
}

