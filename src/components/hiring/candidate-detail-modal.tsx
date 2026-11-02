"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Calendar,
  GraduationCap,
  FileText,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Clock,
  Award,
  Star,
  Download,
  AlertCircle,
  HelpCircle,
  XCircle,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  History,
  MessageSquare,
  ShieldCheck,
  Send,
  Volume2,
  CheckSquare,
  Layers,
  CreditCard,
  HeartPulse,
  Heart,
  Upload,
  Camera,
} from "lucide-react"
import { toast } from "sonner"
import { Candidate, RecruitmentSettings } from "@/lib/hiring/types"

interface CandidateDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: Candidate | null
  settings: RecruitmentSettings
  onUpdateCandidate: (updated: Candidate) => void
  onOpenSchedule: (candidate: Candidate, isReschedule?: boolean) => void
  onOpenEvaluation: (candidate: Candidate) => void
  onOpenHire: (candidate: Candidate) => void
  onOpenReject: (candidate: Candidate) => void
  onOpenRequestInfo: (candidate: Candidate) => void
}

export function CandidateDetailModal({
  open,
  onOpenChange,
  candidate,
  settings,
  onUpdateCandidate,
  onOpenSchedule,
  onOpenEvaluation,
  onOpenHire,
  onOpenReject,
  onOpenRequestInfo,
}: CandidateDetailModalProps) {
  const [activeTab, setActiveTab] = useState<
    | "advanceDossier"
    | "profile"
    | "documents"
    | "education"
    | "experience"
    | "jobAnswers"
    | "interviews"
    | "notes"
  >(candidate?.advanceForm ? "advanceDossier" : "profile")
  const [newNote, setNewNote] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (candidate?.advanceForm) {
      setActiveTab("advanceDossier")
    } else {
      setActiveTab("profile")
    }
  }, [candidate?.id, candidate?.advanceForm])

  if (!candidate) return null

  const getStatusBadge = (status: Candidate["status"]) => {
    switch (status) {
      case "APPLICATION_PENDING":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Application Pending</Badge>
      case "UNDER_REVIEW":
        return <Badge className="bg-blue-600 text-white">Under Review</Badge>
      case "CHANGES_REQUESTED":
        return <Badge className="bg-amber-600 text-white">Changes Requested</Badge>
      case "INTERVIEW_SCHEDULED":
        return <Badge className="bg-indigo-600 text-white">Interview Scheduled</Badge>
      case "INTERVIEW_RESCHEDULED":
        return <Badge className="bg-purple-600 text-white">Interview Rescheduled</Badge>
      case "INTERVIEW_COMPLETED":
        return <Badge className="bg-teal-600 text-white">Interview Completed</Badge>
      case "HIRED":
        return <Badge className="bg-emerald-600 text-white">Hired</Badge>
      case "NOT_SELECTED":
        return <Badge variant="secondary" className="bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">Not Selected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/apply/${candidate.token}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    toast.success("Candidate tracking link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    setIsAddingNote(true)
    try {
      const res = await fetch(`/api/hiring/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_NOTE",
          payload: { author: settings.hrContactPerson, note: newNote.trim() },
        }),
      })
      const data = await res.json()
      if (data.success) {
        onUpdateCandidate(data.candidate)
        setNewNote("")
        toast.success("HR Note added.")
      }
    } catch {
      toast.error("Failed to add note.")
    } finally {
      setIsAddingNote(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl w-full max-w-[96vw] p-0 overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-6 pb-4 bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Profile Avatar / Photo */}
              <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-700 shrink-0 border-2 border-white dark:border-zinc-800 shadow-md">
                {candidate.documents?.photoUrl ? (
                  <img
                    src={candidate.documents.photoUrl}
                    alt={candidate.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center font-bold text-lg text-zinc-500 uppercase">
                    {candidate.fullName.substring(0, 2)}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {candidate.fullName}
                  </h2>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 font-semibold text-zinc-700 dark:text-zinc-300">
                    {candidate.id}
                  </span>
                  {getStatusBadge(candidate.status)}
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                    <Briefcase className="h-3.5 w-3.5 text-[#548235]" />
                    {candidate.appliedPosition}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                    {candidate.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-zinc-400" />
                    {candidate.email}
                  </span>
                  {candidate.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-zinc-400" />
                      {candidate.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="h-8 text-xs font-medium"
              >
                {copied ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                Copy Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/apply/${candidate.token}`, "_blank")}
                className="h-8 text-xs font-medium text-blue-600 dark:text-blue-400"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Candidate View
              </Button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1 scrollbar-none text-xs font-medium">
            {[
              ...(candidate.advanceForm ? [{ id: "advanceDossier", label: "Candidate Form Details", count: 12 }] : []),
              { id: "profile", label: "Personal Profile", count: undefined },
              { id: "documents", label: "Documents & Resume", count: candidate.documents ? 2 : undefined },
              { id: "education", label: "Education", count: candidate.education?.length },
              { id: "experience", label: "Experience", count: candidate.experience?.records.length },
              { id: "jobAnswers", label: "Job Questions", count: undefined },
              { id: "interviews", label: "Interviews & Evals", count: (candidate.interviewSchedule ? 1 : 0) + (candidate.evaluations?.length || 0) },
              { id: "notes", label: "HR Notes & Timeline", count: candidate.timeline?.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-[#548235] text-white font-semibold shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body / Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                              {/* TAB: Advance Candidate Form Dossier (Full 12 Sections) */}
          {activeTab === "advanceDossier" && candidate.advanceForm && (
            <div className="space-y-6 text-zinc-800 dark:text-zinc-200">
              {/* Header Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-zinc-50 dark:from-emerald-950/20 dark:via-zinc-800/40 dark:to-zinc-800/20 border border-emerald-200 dark:border-emerald-800/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#548235] text-white flex items-center justify-center font-bold shadow-xs">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      Transvolt Advance Candidate Form Dossier
                      <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Submitted & Verified
                      </Badge>
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Submitted on {candidate.advanceForm.submittedAt ? new Date(candidate.advanceForm.submittedAt).toLocaleString() : new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/apply/${candidate.token}`, "_blank")}
                    className="text-xs gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                    Open Live Candidate View
                  </Button>
                </div>
              </div>

              {/* 1. PERSONAL DETAILS (24 FIELDS) */}
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700/60 pb-3">
                  <User className="h-4 w-4 text-[#548235]" />
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    1. Personal Details (24 Fields)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[11px]">1. Full Name</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{candidate.advanceForm.fullName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">2. Father's Name</span>
                    <span className="font-semibold">{candidate.advanceForm.fatherName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">3. Mother's Name</span>
                    <span className="font-semibold">{candidate.advanceForm.motherName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">4. Blood Group</span>
                    <span className="font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 inline-block font-mono">
                      {candidate.advanceForm.bloodGroup || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">5. Designation</span>
                    <span className="font-semibold text-[#548235]">{candidate.advanceForm.designation || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">6. Contact Number</span>
                    <span className="font-semibold">{candidate.advanceForm.contactNumber || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">7. Emergency Contact Number</span>
                    <span className="font-semibold">{candidate.advanceForm.emergencyContactNumber || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">8. Emergency Contact Person</span>
                    <span className="font-semibold">{candidate.advanceForm.emergencyContactPerson || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">9. Emergency Person Relationship</span>
                    <span className="font-semibold">{candidate.advanceForm.emergencyContactRelation || "—"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-zinc-400 block text-[11px]">10. Personal Email ID</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{candidate.advanceForm.personalEmail || "—"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-zinc-400 block text-[11px]">11. Current Address Full</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{candidate.advanceForm.currentAddress || "—"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-zinc-400 block text-[11px]">12. Permanent Address Full</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{candidate.advanceForm.permanentAddress || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">16. Gender</span>
                    <span className="font-semibold">{candidate.advanceForm.gender || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">18. Date of Birth</span>
                    <span className="font-semibold">{candidate.advanceForm.dob || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">19. Place of Birth</span>
                    <span className="font-semibold">{candidate.advanceForm.placeOfBirth || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">20. Religion</span>
                    <span className="font-semibold">{candidate.advanceForm.religion || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">21. Mother Tongue</span>
                    <span className="font-semibold">{candidate.advanceForm.motherTongue || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">23. Marital Status</span>
                    <span className="font-semibold">{candidate.advanceForm.maritalStatus || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">24. Marriage Date</span>
                    <span className="font-semibold">{candidate.advanceForm.marriageDate || "N/A"}</span>
                  </div>
                </div>

                {/* Identity Cards & Document Links (13, 14, 15, 17) */}
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700/60">
                  <h5 className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Identity Documents (Type & Uploaded Scans)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Aadhaar */}
                    <div className="p-3 rounded-lg border bg-zinc-50 dark:bg-zinc-800/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-zinc-500">13. Aadhaar Card</span>
                        {candidate.advanceForm.aadharDocUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1.5 text-[10px] text-blue-600 dark:text-blue-400 gap-1"
                            onClick={() => window.open(candidate.advanceForm?.aadharDocUrl, "_blank")}
                          >
                            <Download className="h-3 w-3" /> View Doc
                          </Button>
                        )}
                      </div>
                      <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {candidate.advanceForm.aadharNumber || "Not Provided"}
                      </div>
                    </div>

                    {/* PAN */}
                    <div className="p-3 rounded-lg border bg-zinc-50 dark:bg-zinc-800/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-zinc-500">14. PAN Card</span>
                        {candidate.advanceForm.panDocUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1.5 text-[10px] text-blue-600 dark:text-blue-400 gap-1"
                            onClick={() => window.open(candidate.advanceForm?.panDocUrl, "_blank")}
                          >
                            <Download className="h-3 w-3" /> View Doc
                          </Button>
                        )}
                      </div>
                      <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {candidate.advanceForm.panNumber || "Not Provided"}
                      </div>
                    </div>

                    {/* Passport */}
                    <div className="p-3 rounded-lg border bg-zinc-50 dark:bg-zinc-800/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-zinc-500">15. Passport</span>
                        {candidate.advanceForm.passportDocUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1.5 text-[10px] text-blue-600 dark:text-blue-400 gap-1"
                            onClick={() => window.open(candidate.advanceForm?.passportDocUrl, "_blank")}
                          >
                            <Download className="h-3 w-3" /> View Doc
                          </Button>
                        )}
                      </div>
                      <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {candidate.advanceForm.passportNumber || "Not Provided"}
                      </div>
                    </div>

                    {/* Driving License */}
                    <div className="p-3 rounded-lg border bg-zinc-50 dark:bg-zinc-800/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-zinc-500">17. Driving License</span>
                        {candidate.advanceForm.drivingLicenseDocUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1.5 text-[10px] text-blue-600 dark:text-blue-400 gap-1"
                            onClick={() => window.open(candidate.advanceForm?.drivingLicenseDocUrl, "_blank")}
                          >
                            <Download className="h-3 w-3" /> View Doc
                          </Button>
                        )}
                      </div>
                      <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {candidate.advanceForm.drivingLicenseNumber || "Not Provided"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 22. Languages Known Matrix */}
                {candidate.advanceForm.languages && candidate.advanceForm.languages.length > 0 && (
                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700/60">
                    <h5 className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      22. Languages Known (Read, Write, Speak)
                    </h5>
                    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold border-b">
                          <tr>
                            <th className="p-2.5">Language</th>
                            <th className="p-2.5 text-center">Read</th>
                            <th className="p-2.5 text-center">Write</th>
                            <th className="p-2.5 text-center">Speak</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700/60">
                          {candidate.advanceForm.languages.map((lang, lIdx) => (
                            <tr key={lIdx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                              <td className="p-2.5 font-medium">{lang.language}</td>
                              <td className="p-2.5 text-center">
                                {lang.read ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-zinc-300">—</span>}
                              </td>
                              <td className="p-2.5 text-center">
                                {lang.write ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-zinc-300">—</span>}
                              </td>
                              <td className="p-2.5 text-center">
                                {lang.speak ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-zinc-300">—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. FAMILY DETAILS */}
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 space-y-3">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700/60 pb-3">
                  <User className="h-4 w-4 text-[#548235]" />
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    2. Family Details ({candidate.advanceForm.familyDetails?.length || 0} Members)
                  </h4>
                </div>

                <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold border-b">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Person Name</th>
                        <th className="p-2.5">Relation</th>
                        <th className="p-2.5">Gender</th>
                        <th className="p-2.5">Date of Birth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700/60">
                      {candidate.advanceForm.familyDetails && candidate.advanceForm.familyDetails.length > 0 ? (
                        candidate.advanceForm.familyDetails.map((fm, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                            <td className="p-2.5 text-zinc-400 font-mono">{idx + 1}</td>
                            <td className="p-2.5 font-semibold text-zinc-900 dark:text-zinc-100">{fm.name || "—"}</td>
                            <td className="p-2.5">{fm.relation || "—"}</td>
                            <td className="p-2.5">{fm.gender || "—"}</td>
                            <td className="p-2.5">{fm.dob || "—"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="p-4 text-center text-zinc-400">No family details provided.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. HEALTH & WELL BEING */}
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 space-y-3">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700/60 pb-3">
                  <HeartPulse className="h-4 w-4 text-[#548235]" />
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    3. For Health and Well Being
                  </h4>
                </div>

                <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold border-b">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Person Name</th>
                        <th className="p-2.5">Relation</th>
                        <th className="p-2.5">Gender</th>
                        <th className="p-2.5">Date of Birth</th>
                        <th className="p-2.5">Age</th>
                        <th className="p-2.5">Health Issue / Medical Condition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700/60">
                      {candidate.advanceForm.healthWellBeing && candidate.advanceForm.healthWellBeing.length > 0 ? (
                        candidate.advanceForm.healthWellBeing.map((hr, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                            <td className="p-2.5 text-zinc-400 font-mono">{idx + 1}</td>
                            <td className="p-2.5 font-semibold text-zinc-900 dark:text-zinc-100">{hr.name || "—"}</td>
                            <td className="p-2.5">{hr.relation || "—"}</td>
                            <td className="p-2.5">{hr.gender || "—"}</td>
                            <td className="p-2.5">{hr.dob || "—"}</td>
                            <td className="p-2.5">{hr.age || "—"}</td>
                            <td className="p-2.5 text-amber-700 dark:text-amber-400 font-medium">{hr.healthIssue || "None reported"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={7} className="p-4 text-center text-zinc-400">No health records recorded.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. MEDICLAIM COVERAGE */}
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 space-y-3">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700/60 pb-3">
                  <Heart className="h-4 w-4 text-[#548235]" />
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    4. Mediclaim Coverage (Immediate Family)
                  </h4>
                </div>

                <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold border-b">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Beneficiary Name</th>
                        <th className="p-2.5">Relation</th>
                        <th className="p-2.5">Gender</th>
                        <th className="p-2.5">Date of Birth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700/60">
                      {candidate.advanceForm.mediclaimCoverage && candidate.advanceForm.mediclaimCoverage.length > 0 ? (
                        candidate.advanceForm.mediclaimCoverage.map((mm, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                            <td className="p-2.5 text-zinc-400 font-mono">{idx + 1}</td>
                            <td className="p-2.5 font-semibold text-zinc-900 dark:text-zinc-100">{mm.name || "—"}</td>
                            <td className="p-2.5">{mm.relation || "—"}</td>
                            <td className="p-2.5">{mm.gender || "—"}</td>
                            <td className="p-2.5">{mm.dob || "—"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="p-4 text-center text-zinc-400">No mediclaim beneficiaries listed.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. BANK DETAILS */}
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700/60 pb-3">
                  <CreditCard className="h-4 w-4 text-[#548235]" />
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    5. Bank Account & Salary Crediting Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Bank Full Name</span>
                    <span className="font-semibold">{candidate.advanceForm.bankDetails?.bankName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Account Number</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{candidate.advanceForm.bankDetails?.accountNumber || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">IFSC Code</span>
                    <span className="font-mono font-bold text-[#548235]">{candidate.advanceForm.bankDetails?.ifscCode || "—"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Branch Name</span>
                    <span className="font-semibold">{candidate.advanceForm.bankDetails?.branch || "—"}</span>
                  </div>
                </div>

                {/* Cancelled Cheque / Cheque Book Upload */}
                <div className="p-3.5 rounded-lg border bg-zinc-50 dark:bg-zinc-800/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 text-[#548235] flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {candidate.advanceForm.bankDetails?.chequePhotoName || "Cancelled Cheque Photo"}
                      </p>
                      <p className="text-[11px] text-zinc-500">Official proof of bank account verification</p>
                    </div>
                  </div>
                  {candidate.advanceForm.bankDetails?.chequePhotoUrl ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(candidate.advanceForm?.bankDetails?.chequePhotoUrl, "_blank")}
                      className="text-xs gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      View Cheque Copy
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-zinc-400 text-xs">No cheque uploaded</Badge>
                  )}
                </div>
              </div>

              {/* 6. EDUCATION DETAILS */}
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 space-y-3">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700/60 pb-3">
                  <GraduationCap className="h-4 w-4 text-[#548235]" />
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    6. Education Details (SSC, HSC, Diploma, Graduation, Post-Graduate)
                  </h4>
                </div>

                <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold border-b">
                      <tr>
                        <th className="p-2.5">Level / Degree</th>
                        <th className="p-2.5">Passing Year</th>
                        <th className="p-2.5">Course Type</th>
                        <th className="p-2.5">Stream / Specialization</th>
                        <th className="p-2.5">Institute / Board / University</th>
                        <th className="p-2.5">Score (% / Grade)</th>
                        <th className="p-2.5 text-right">Marksheet Doc</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700/60">
                      {candidate.advanceForm.educationDetails && candidate.advanceForm.educationDetails.length > 0 ? (
                        candidate.advanceForm.educationDetails.map((edu, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                            <td className="p-2.5 font-bold text-zinc-900 dark:text-zinc-100">{edu.level}</td>
                            <td className="p-2.5">{edu.passingYear || "—"}</td>
                            <td className="p-2.5">{edu.courseType || "Full-Time"}</td>
                            <td className="p-2.5">{edu.specialization || "—"}</td>
                            <td className="p-2.5">{edu.institute || "—"}</td>
                            <td className="p-2.5 font-semibold text-emerald-600">
                              {edu.percentage ? `${edu.percentage}%` : "—"} {edu.grade ? `(${edu.grade})` : ""}
                            </td>
                            <td className="p-2.5 text-right">
                              {edu.documentUrl ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-[10px] text-blue-600 dark:text-blue-400 gap-1"
                                  onClick={() => window.open(edu.documentUrl, "_blank")}
                                >
                                  <Download className="h-3 w-3" /> View
                                </Button>
                              ) : (
                                <span className="text-zinc-400 text-[11px]">—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={7} className="p-4 text-center text-zinc-400">No education qualifications recorded.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 7. CERTIFICATIONS */}
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 space-y-3">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700/60 pb-3">
                  <Award className="h-4 w-4 text-[#548235]" />
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    7. Professional Certifications
                  </h4>
                </div>

                <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold border-b">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Certificate Name</th>
                        <th className="p-2.5">Specialization</th>
                        <th className="p-2.5">Institute / Issuer</th>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Validity</th>
                        <th className="p-2.5">Re-validation Date</th>
                        <th className="p-2.5 text-right">Doc</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700/60">
                      {candidate.advanceForm.certifications && candidate.advanceForm.certifications.length > 0 ? (
                        candidate.advanceForm.certifications.map((crt, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                            <td className="p-2.5 text-zinc-400 font-mono">{idx + 1}</td>
                            <td className="p-2.5 font-semibold text-zinc-900 dark:text-zinc-100">{crt.certificateName || "—"}</td>
                            <td className="p-2.5">{crt.specialization || "—"}</td>
                            <td className="p-2.5">{crt.institute || "—"}</td>
                            <td className="p-2.5">{crt.issueDate || "—"}</td>
                            <td className="p-2.5">{crt.validity || "—"}</td>
                            <td className="p-2.5">{crt.revalidationDate || "—"}</td>
                            <td className="p-2.5 text-right">
                              {crt.documentUrl ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-[10px] text-blue-600 dark:text-blue-400 gap-1"
                                  onClick={() => window.open(crt.documentUrl, "_blank")}
                                >
                                  <Download className="h-3 w-3" /> View
                                </Button>
                              ) : (
                                <span className="text-zinc-400 text-[11px]">—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={8} className="p-4 text-center text-zinc-400">No certifications recorded.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 8. PAST EXPERIENCE */}
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 space-y-3">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700/60 pb-3">
                  <Briefcase className="h-4 w-4 text-[#548235]" />
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    8. Past Employment Experience
                  </h4>
                </div>

                <div className="space-y-3">
                  {candidate.advanceForm.pastExperience && candidate.advanceForm.pastExperience.length > 0 ? (
                    candidate.advanceForm.pastExperience.map((exp, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/30 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{exp.designation || "Designation"}</h5>
                            <p className="text-xs font-semibold text-[#548235]">{exp.organizationName || "Organization"}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Tenure: {exp.tenure || "—"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                          <div>
                            <span className="text-zinc-400 block text-[11px]">Department</span>
                            <span className="font-medium">{exp.department || "—"}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[11px]">Reporting Supervisor</span>
                            <span className="font-medium">{exp.reportingSupervisor || "—"}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[11px]">Date of Joining</span>
                            <span className="font-medium">{exp.dateOfJoining || "—"}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[11px]">Last Working Date</span>
                            <span className="font-medium">{exp.lastWorkingDate || "—"}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400 p-4 text-center">No past employment experience listed.</p>
                  )}
                </div>
              </div>

              {/* 9. REFERENCE & 10. COLLEAGUES */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 9. References */}
                <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 space-y-3">
                  <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700/60 pb-3">
                    <User className="h-4 w-4 text-[#548235]" />
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                      9. Professional References ({candidate.advanceForm.references?.length || 0})
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {candidate.advanceForm.references && candidate.advanceForm.references.length > 0 ? (
                      candidate.advanceForm.references.map((ref, rIdx) => (
                        <div key={rIdx} className="space-y-1.5 p-3 rounded-lg border bg-zinc-50 dark:bg-zinc-800/50 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{ref.personName || "—"}</span>
                            <Badge variant="secondary" className="text-[10px]">
                              {ref.relationship || "Colleague"}
                            </Badge>
                          </div>
                          <div className="text-zinc-600 dark:text-zinc-300">
                            {ref.organizationName || "—"} • {ref.designation || "—"} ({ref.department || "General"})
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-zinc-500">
                            <div>Contact: <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">{ref.contactNumber || "—"}</span></div>
                            <div>Supervisor: <span className="font-medium text-zinc-800 dark:text-zinc-200">{ref.reportingSupervisor || "—"}</span></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-400">No references listed.</p>
                    )}
                  </div>
                </div>

                {/* 10. Contacts of Colleagues */}
                <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 space-y-3">
                  <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700/60 pb-3">
                    <Building2 className="h-4 w-4 text-[#548235]" />
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                      10. Colleagues from Last Org ({candidate.advanceForm.colleagueContacts?.length || 0})
                    </h4>
                  </div>
                  <div className="space-y-2.5">
                    {candidate.advanceForm.colleagueContacts && candidate.advanceForm.colleagueContacts.length > 0 ? (
                      candidate.advanceForm.colleagueContacts.map((col, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg border bg-zinc-50 dark:bg-zinc-800/50 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{col.personName || "Colleague"}</span>
                            <span className="font-mono text-zinc-600 dark:text-zinc-400">{col.contactNumber || "—"}</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            {col.designation} • {col.organizationName} ({col.department || "General"})
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-400">No colleague contacts listed.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 11. MANDATORY UPLOADS */}
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700/60 pb-3">
                  <Upload className="h-4 w-4 text-[#548235]" />
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    11. Uploaded Dossier Documents (Photo, Resume, Signature, Relieving Letter)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Photo */}
                  <div className="p-4 rounded-xl border bg-zinc-50 dark:bg-zinc-800/40 text-center space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Candidate Photo</span>
                    <div className="h-28 w-28 mx-auto rounded-xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center">
                      {candidate.advanceForm.photoUrl ? (
                        <img src={candidate.advanceForm.photoUrl} alt="Photo" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-10 w-10 text-zinc-400" />
                      )}
                    </div>
                    {candidate.advanceForm.photoUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(candidate.advanceForm?.photoUrl, "_blank")}
                        className="text-xs w-full gap-1"
                      >
                        <ExternalLink className="h-3 w-3" /> View Full Photo
                      </Button>
                    )}
                  </div>

                  {/* Resume */}
                  <div className="p-4 rounded-xl border bg-zinc-50 dark:bg-zinc-800/40 text-center space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Latest Resume / CV</span>
                    <div className="h-28 w-28 mx-auto rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center text-red-500">
                      <FileText className="h-10 w-10" />
                      <span className="text-[10px] font-bold uppercase mt-1">PDF / DOC</span>
                    </div>
                    {candidate.advanceForm.resumeUrl ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(candidate.advanceForm?.resumeUrl, "_blank")}
                        className="text-xs w-full gap-1"
                      >
                        <Download className="h-3 w-3" /> Download Resume
                      </Button>
                    ) : (
                      <span className="text-xs text-zinc-400 block pt-1">Not Uploaded</span>
                    )}
                  </div>

                  {/* Signature */}
                  <div className="p-4 rounded-xl border bg-zinc-50 dark:bg-zinc-800/40 text-center space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Digital Signature</span>
                    <div className="h-28 w-28 mx-auto rounded-xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center p-2">
                      {candidate.advanceForm.signatureUrl ? (
                        <img src={candidate.advanceForm.signatureUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-xs text-zinc-400 italic">No Signature</span>
                      )}
                    </div>
                    {candidate.advanceForm.signatureUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(candidate.advanceForm?.signatureUrl, "_blank")}
                        className="text-xs w-full gap-1"
                      >
                        <ExternalLink className="h-3 w-3" /> View Signature
                      </Button>
                    )}
                  </div>

                  {/* Relieving Letter */}
                  <div className="p-4 rounded-xl border bg-zinc-50 dark:bg-zinc-800/40 text-center space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Relieving Letter</span>
                    <div className="h-28 w-28 mx-auto rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center text-blue-500">
                      <FileText className="h-10 w-10" />
                      <span className="text-[10px] font-bold uppercase mt-1">LETTER</span>
                    </div>
                    {candidate.advanceForm.relievingLetterUrl ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(candidate.advanceForm?.relievingLetterUrl, "_blank")}
                        className="text-xs w-full gap-1"
                      >
                        <Download className="h-3 w-3" /> View Letter
                      </Button>
                    ) : (
                      <span className="text-xs text-zinc-400 block pt-1">Not Uploaded / N/A</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 12. TRANSVOLT DECLARATION */}
              <div className="p-5 rounded-xl border-2 border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Transvolt Mobility Pvt. Ltd. Declaration & Legal Undertaking
                  </h4>
                </div>
                <blockquote className="text-xs text-zinc-700 dark:text-zinc-300 italic pl-3 border-l-2 border-emerald-500">
                  "Dear Sir / Madam, I hereby declare that the information furnished above is true, complete and correct to the best of my knowledge and belief. I understand that in the event of any information being found false or incorrect at any stage, my candidature / appointment shall be liable to cancellation / termination without notice."
                </blockquote>
                <div className="flex items-center gap-2 pt-1 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Candidate accepted declaration on {candidate.advanceForm.submittedAt ? new Date(candidate.advanceForm.submittedAt).toLocaleDateString() : "submission"}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Profile & Personal Info */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {candidate.personalInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                      Identity & Demographics
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-zinc-400 block text-[11px]">Full Name</span>
                        <span className="font-semibold">{candidate.personalInfo.fullName}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[11px]">Father's Name</span>
                        <span className="font-semibold">{candidate.personalInfo.fatherName || "—"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[11px]">Date of Birth</span>
                        <span className="font-semibold">{candidate.personalInfo.dob || "—"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[11px]">Gender</span>
                        <span className="font-semibold">{candidate.personalInfo.gender || "—"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[11px]">Nationality</span>
                        <span className="font-semibold">{candidate.personalInfo.nationality || "Indian"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                      Contact Information
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-zinc-400 block text-[11px]">Mobile Number</span>
                        <span className="font-semibold">{candidate.personalInfo.mobile}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[11px]">Alternate Contact</span>
                        <span className="font-semibold">{candidate.personalInfo.altMobile || "None"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[11px]">Email Address</span>
                        <span className="font-semibold">{candidate.personalInfo.email}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[11px]">City & State</span>
                        <span className="font-semibold">{candidate.personalInfo.city}, {candidate.personalInfo.state}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[11px]">PIN Code</span>
                        <span className="font-semibold">{candidate.personalInfo.pincode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                      Addresses & Additional Info
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-zinc-400 block text-[11px]">Current Address</span>
                        <span className="font-semibold">{candidate.personalInfo.currentAddress}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[11px]">Permanent Address</span>
                        <span className="font-semibold">{candidate.personalInfo.permanentAddress}</span>
                      </div>
                      {candidate.additionalInfo && (
                        <>
                          <div>
                            <span className="text-zinc-400 block text-[11px]">Languages Known</span>
                            <span className="font-semibold">{candidate.additionalInfo.languages?.join(", ") || "—"}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[11px]">Driving Licence</span>
                            <span className="font-semibold">{candidate.additionalInfo.drivingLicence || "—"}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[11px]">Emergency Contact</span>
                            <span className="font-semibold">
                              {candidate.additionalInfo.emergencyContactName} ({candidate.additionalInfo.emergencyContactPhone})
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-dashed border-zinc-300 dark:border-zinc-700">
                  <User className="h-8 w-8 mx-auto text-zinc-400 mb-2" />
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Application Details Pending
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Candidate has received the invitation link but hasn't submitted their profile yet.
                  </p>
                </div>
              )}

              {/* Interview Preferences Card */}
              {candidate.interviewPreferences && (
                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-blue-600" />
                      Candidate's Preferred Interview Slot
                    </h4>
                    <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                      Preferred: <strong>{candidate.interviewPreferences.preferredDate}</strong> at <strong>{candidate.interviewPreferences.preferredTime}</strong> ({candidate.interviewPreferences.modePreference})
                    </p>
                    {candidate.interviewPreferences.notes && (
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 italic">
                        Notes: "{candidate.interviewPreferences.notes}"
                      </p>
                    )}
                  </div>
                  {candidate.status === "UNDER_REVIEW" && (
                    <Button
                      size="sm"
                      onClick={() => onOpenSchedule(candidate, false)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs shrink-0"
                    >
                      Approve & Schedule
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Documents & Resume */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Resume Card */}
                <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-lg bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 flex items-center justify-center font-bold text-xs">
                      PDF
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {candidate.documents?.resumeFileName || "Candidate_Resume.pdf"}
                      </p>
                      <p className="text-xs text-zinc-500">Updated Candidate Resume / CV</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (candidate.documents?.resumeUrl && candidate.documents.resumeUrl !== "#") {
                        window.open(candidate.documents.resumeUrl, "_blank")
                      } else {
                        toast.info("Viewing uploaded resume document.")
                      }
                    }}
                    className="text-xs gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download / View
                  </Button>
                </div>

                {/* Profile Photograph Card */}
                <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-700 border">
                      {candidate.documents?.photoUrl ? (
                        <img src={candidate.documents.photoUrl} alt="Photo" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-full w-full p-2 text-zinc-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {candidate.documents?.photoFileName || "Profile_Photograph.jpg"}
                      </p>
                      <p className="text-xs text-zinc-500">Official Profile Photo</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (candidate.documents?.photoUrl) {
                        window.open(candidate.documents.photoUrl, "_blank")
                      }
                    }}
                    className="text-xs gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    View Photo
                  </Button>
                </div>
              </div>

              {/* Cover Letter / Notes */}
              {candidate.documents?.coverLetterFileName && (
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2">
                    Cover Letter
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">
                    {candidate.documents.coverLetterFileName}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Education */}
          {activeTab === "education" && (
            <div className="space-y-3">
              {candidate.education && candidate.education.length > 0 ? (
                candidate.education.map((edu, idx) => (
                  <div
                    key={edu.id || idx}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/30 flex items-start justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-[#548235]/15 text-[#548235] flex items-center justify-center shrink-0">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {edu.degree}
                        </h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
                          {edu.institution} • {edu.specialization}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Passing Year: {edu.passingYear} • Score: <strong>{edu.score}</strong>
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {edu.highestQual}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 p-6 text-center">No education records submitted yet.</p>
              )}
            </div>
          )}

          {/* TAB 4: Experience */}
          {activeTab === "experience" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Experience Type:</span>
                <Badge variant={candidate.experience?.isExperienced ? "default" : "secondary"}>
                  {candidate.experience?.isExperienced ? "Experienced Professional" : "Fresher Candidate"}
                </Badge>
                {candidate.experience?.totalYears && (
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Total: <strong>{candidate.experience.totalYears}</strong>
                  </span>
                )}
              </div>

              {candidate.experience?.records && candidate.experience.records.length > 0 ? (
                candidate.experience.records.map((exp, idx) => (
                  <div
                    key={exp.id || idx}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/30 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {exp.designation}
                        </h4>
                        <p className="text-xs text-[#548235] font-semibold mt-0.5">
                          {exp.company}
                        </p>
                      </div>
                      <span className="text-xs text-zinc-500 font-medium">
                        {exp.duration}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {exp.responsibilities}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-700/60 text-[11px]">
                      <div>
                        <span className="text-zinc-400 block">Current CTC</span>
                        <span className="font-semibold">{exp.currentCtc || "—"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block">Expected CTC</span>
                        <span className="font-semibold">{exp.expectedCtc || "—"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block">Notice Period</span>
                        <span className="font-semibold">{exp.noticePeriod || "—"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block">Reason for Leaving</span>
                        <span className="font-semibold">{exp.reasonForLeaving || "—"}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 p-6 text-center">No experience records submitted.</p>
              )}
            </div>
          )}

          {/* TAB 5: Job Specific Answers */}
          {activeTab === "jobAnswers" && (
            <div className="space-y-4">
              {/* Dynamic Categorized Custom Answers */}
              {candidate.customAnswers && Object.keys(candidate.customAnswers).length > 0 ? (
                <div className="space-y-4">
                  {(() => {
                    const categories = settings?.questionCategories || []
                    const questions = settings?.candidateQuestions || []
                    const answerKeys = Object.keys(candidate.customAnswers)

                    // Find questions that have answers, plus any orphan answers
                    const answeredQuestions = answerKeys.map((key) => {
                      const qDef = questions.find((q) => q.id === key)
                      return {
                        id: key,
                        title: qDef?.title || key,
                        categoryId: qDef?.categoryId,
                        fieldType: qDef?.fieldType || "TEXT",
                        sliderConfig: qDef?.sliderConfig,
                        order: qDef?.order ?? 999,
                        value: candidate.customAnswers![key],
                      }
                    }).sort((a, b) => a.order - b.order)

                    // Group by category
                    const grouped: { categoryName: string; items: typeof answeredQuestions }[] = []

                    categories.forEach((cat) => {
                      const items = answeredQuestions.filter((q) => q.categoryId === cat.id)
                      if (items.length > 0) {
                        grouped.push({ categoryName: cat.name, items })
                      }
                    })

                    const uncategorized = answeredQuestions.filter(
                      (q) => !q.categoryId || !categories.some((c) => c.id === q.categoryId)
                    )
                    if (uncategorized.length > 0) {
                      grouped.push({
                        categoryName: grouped.length === 0 ? "Application Questions" : "Additional Questions",
                        items: uncategorized,
                      })
                    }

                    return grouped.map((grp, gIdx) => (
                      <div
                        key={gIdx}
                        className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/20 space-y-3"
                      >
                        <div className="flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-700/60 pb-2">
                          <Layers className="h-3.5 w-3.5 text-[#548235]" />
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                            {grp.categoryName}
                          </h4>
                        </div>

                        <div className="space-y-3 pt-1">
                          {grp.items.map((item) => {
                            const val = item.value

                            return (
                              <div
                                key={item.id}
                                className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/80 space-y-1.5"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                    {item.title}
                                  </span>

                                  {item.fieldType === "VOLUME_SLIDER" && (
                                    <Badge className="bg-[#548235] text-white text-[10px] px-2 py-0.5 shrink-0 flex items-center gap-1 font-mono">
                                      <Volume2 className="h-2.5 w-2.5" />
                                      {val} / {item.sliderConfig?.max || 10}
                                    </Badge>
                                  )}
                                </div>

                                {/* Render answer based on field type */}
                                {item.fieldType === "VOLUME_SLIDER" && (
                                  <div className="space-y-1 pt-1">
                                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                      <div
                                        className="bg-[#548235] h-full rounded-full transition-all"
                                        style={{
                                          width: `${Math.min(100, (Number(val) / (item.sliderConfig?.max || 10)) * 100)}%`,
                                        }}
                                      />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-zinc-400">
                                      <span>{item.sliderConfig?.leftLabel || `Min: ${item.sliderConfig?.min || 1}`}</span>
                                      <span>{item.sliderConfig?.rightLabel || `Max: ${item.sliderConfig?.max || 10}`}</span>
                                    </div>
                                  </div>
                                )}

                                {item.fieldType === "CHECKBOX" && (
                                  <div className="flex items-center gap-1.5 pt-0.5">
                                    {val ? (
                                      <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50/50 text-[11px] gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Confirmed / Yes
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="border-zinc-300 text-zinc-500 text-[11px]">
                                        Not Checked
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {item.fieldType === "MULTI_CHECKBOX" && (
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {Array.isArray(val) && val.length > 0 ? (
                                      val.map((opt: string, oIdx: number) => (
                                        <Badge
                                          key={oIdx}
                                          variant="secondary"
                                          className="text-[11px] bg-[#548235]/15 text-[#548235] font-medium"
                                        >
                                          {opt}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-xs text-zinc-400 italic">None selected</span>
                                    )}
                                  </div>
                                )}

                                {(item.fieldType === "DROPDOWN" || item.fieldType === "YES_NO") && (
                                  <div className="pt-0.5">
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-semibold border-[#548235]/30 text-zinc-800 dark:text-zinc-200"
                                    >
                                      {String(val || "—")}
                                    </Badge>
                                  </div>
                                )}

                                {(item.fieldType === "PARAGRAPH" || item.fieldType === "TEXT") && (
                                  <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed pt-0.5">
                                    {String(val || "—")}
                                  </p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              ) : null}

              {/* Standard Job Specific Details */}
              {candidate.jobSpecific && (!candidate.customAnswers || Object.keys(candidate.customAnswers).length === 0) ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700 space-y-1">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      Why do you want to join Transvolt?
                    </span>
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                      {candidate.jobSpecific.whyTransvolt || "—"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700 space-y-1">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      Why should Transvolt hire you?
                    </span>
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                      {candidate.jobSpecific.whyHireYou || "—"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700 space-y-1">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      Relevant Domain Experience & Projects
                    </span>
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                      {candidate.jobSpecific.relevantExperience || "—"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700">
                      <span className="text-zinc-400 block text-[11px]">Key Relevant Skills</span>
                      <span className="font-semibold">{candidate.jobSpecific.relevantSkills || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700">
                      <span className="text-zinc-400 block text-[11px]">Software / Tools Knowledge</span>
                      <span className="font-semibold">{candidate.jobSpecific.toolsKnowledge || "—"}</span>
                    </div>
                  </div>
                </div>
              ) : null}

              {!candidate.jobSpecific && (!candidate.customAnswers || Object.keys(candidate.customAnswers).length === 0) && (
                <p className="text-xs text-zinc-500 p-6 text-center">No job questionnaire answers submitted yet.</p>
              )}
            </div>
          )}

          {/* TAB 6: Interviews & Evaluations */}
          {activeTab === "interviews" && (
            <div className="space-y-6">
              {/* Active or Past Schedule */}
              {candidate.interviewSchedule ? (
                <div className="p-5 rounded-xl border-2 border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">
                        {candidate.interviewSchedule.roundName}
                      </span>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                        {candidate.interviewSchedule.date} • {candidate.interviewSchedule.startTime} to {candidate.interviewSchedule.endTime}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
                        Mode: <strong>{candidate.interviewSchedule.mode}</strong> via <strong>{candidate.interviewSchedule.platform}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenSchedule(candidate, true)}
                        className="text-xs"
                      >
                        Reschedule
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onOpenEvaluation(candidate)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                      >
                        <Award className="h-3.5 w-3.5 mr-1" />
                        Record Evaluation
                      </Button>
                    </div>
                  </div>

                  {candidate.interviewSchedule.meetingUrl && (
                    <div className="p-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs">
                      <span className="font-mono text-blue-600 dark:text-blue-400 truncate max-w-md">
                        {candidate.interviewSchedule.meetingUrl}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(candidate.interviewSchedule?.meetingUrl, "_blank")}
                        className="h-7 text-xs"
                      >
                        Join / Test Link
                      </Button>
                    </div>
                  )}

                  {/* Previous Schedules Reschedule History */}
                  {candidate.interviewSchedule.previousSchedules && candidate.interviewSchedule.previousSchedules.length > 0 && (
                    <div className="pt-3 border-t border-blue-200 dark:border-blue-900/50 space-y-2">
                      <h5 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <History className="h-3.5 w-3.5 text-zinc-400" />
                        Reschedule History
                      </h5>
                      {candidate.interviewSchedule.previousSchedules.map((prev, idx) => (
                        <div key={idx} className="p-2.5 rounded bg-white/70 dark:bg-zinc-800/60 text-xs text-zinc-600 dark:text-zinc-300">
                          <span className="line-through text-zinc-400 mr-2">{prev.date} ({prev.startTime})</span>
                          <span className="font-semibold text-amber-700 dark:text-amber-400">Reason: {prev.rescheduleReason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center">
                  <p className="text-xs text-zinc-500 mb-3">No interview currently scheduled.</p>
                  <Button
                    size="sm"
                    onClick={() => onOpenSchedule(candidate, false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    Schedule Interview Round
                  </Button>
                </div>
              )}

              {/* Evaluations Log */}
              {candidate.evaluations && candidate.evaluations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Interview Evaluations ({candidate.evaluations.length})
                  </h4>
                  {candidate.evaluations.map((ev) => (
                    <div key={ev.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {ev.roundName}
                          </span>
                          <p className="text-[11px] text-zinc-400">By {ev.evaluatedBy}</p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                          <Star className="h-4 w-4 fill-amber-400" />
                          {ev.overallRating}/5
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                        <div>Technical: <strong>{ev.technicalRating}/5</strong></div>
                        <div>Comms: <strong>{ev.communicationRating}/5</strong></div>
                        <div>Experience: <strong>{ev.experienceRating}/5</strong></div>
                        <div>Problem-Solving: <strong>{ev.problemSolvingRating}/5</strong></div>
                        <div>Culture: <strong>{ev.confidenceRating}/5</strong></div>
                      </div>

                      {ev.strengths && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-300">
                          <strong>Strengths:</strong> {ev.strengths}
                        </p>
                      )}
                      {ev.interviewerRemarks && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-300">
                          <strong>Remarks:</strong> {ev.interviewerRemarks}
                        </p>
                      )}

                      <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Recommendation: {ev.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: HR Notes & Timeline */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-[#548235]" />
                  Add Internal HR Note (Confidential)
                </label>
                <Textarea
                  rows={2}
                  placeholder="Record interview notes, compensation discussions, or internal observations..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="text-xs"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isAddingNote || !newNote.trim()}
                    className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs h-8 px-4"
                  >
                    Add Note
                  </Button>
                </div>
              </form>

              {/* Notes List */}
              {candidate.internalNotes && candidate.internalNotes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Internal Notes History
                  </h4>
                  {candidate.internalNotes.map((n) => (
                    <div key={n.id} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{n.author}</span>
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300">{n.note}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Activity Timeline */}
              {candidate.timeline && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Recruitment Activity Timeline
                  </h4>
                  <div className="space-y-2 border-l-2 border-zinc-200 dark:border-zinc-700 ml-2 pl-4">
                    {candidate.timeline.map((tl) => (
                      <div key={tl.id} className="relative text-xs">
                        <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#548235]" />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{tl.description}</span>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {new Date(tl.timestamp).toLocaleString()} • Actor: {tl.actor}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Persistent Bottom Action Bar */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenRequestInfo(candidate)}
              className="text-xs border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400"
            >
              <HelpCircle className="h-3.5 w-3.5 mr-1" />
              Request Corrections
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenReject(candidate)}
              className="text-xs border-rose-300 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Reject Application
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenSchedule(candidate, !!candidate.interviewSchedule)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
            >
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {candidate.interviewSchedule ? "Reschedule Interview" : "Schedule Interview"}
            </Button>

            <Button
              size="sm"
              onClick={() => onOpenHire(candidate)}
              className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs font-bold shadow-md shadow-[#548235]/25"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Hire Candidate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

