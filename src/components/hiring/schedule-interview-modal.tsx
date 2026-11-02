"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  Phone,
  FileText,
  AlertCircle,
  History,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import { Candidate, InterviewPlatform, RecruitmentSettings } from "@/lib/hiring/types"

interface ScheduleInterviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: Candidate | null
  isReschedule?: boolean
  settings: RecruitmentSettings
  onSuccess: (updated: Candidate) => void
}

export function ScheduleInterviewModal({
  open,
  onOpenChange,
  candidate,
  isReschedule = false,
  settings,
  onSuccess,
}: ScheduleInterviewModalProps) {
  const currentSchedule = candidate?.interviewSchedule

  const [roundName, setRoundName] = useState(
    currentSchedule?.roundName || "Round 1 — Technical & Role Assessment"
  )
  const [date, setDate] = useState(currentSchedule?.date || "")
  const [startTime, setStartTime] = useState(currentSchedule?.startTime || "11:00 AM")
  const [endTime, setEndTime] = useState(currentSchedule?.endTime || "12:00 PM")
  const [mode, setMode] = useState<"ONLINE" | "IN_PERSON">(
    currentSchedule?.mode || "ONLINE"
  )
  const [platform, setPlatform] = useState<InterviewPlatform>(
    currentSchedule?.platform || "Google Meet"
  )
  const [meetingUrl, setMeetingUrl] = useState(
    currentSchedule?.meetingUrl || "https://meet.google.com/tv-interview-" + Math.random().toString(36).substring(2, 7)
  )
  const [officeAddress, setOfficeAddress] = useState(
    currentSchedule?.officeAddress || settings.officeAddress
  )
  const [contactPerson, setContactPerson] = useState(
    currentSchedule?.contactPerson || settings.hrContactPerson
  )
  const [contactPhone, setContactPhone] = useState(
    currentSchedule?.contactPhone || settings.hrContactPhone
  )
  const [instructions, setInstructions] = useState(
    currentSchedule?.instructions ||
      "Please join 5 minutes early. Keep your webcam enabled and have your portfolio or project diagrams ready for screen sharing."
  )
  const [internalRemarks, setInternalRemarks] = useState(
    currentSchedule?.internalRemarks || ""
  )
  const [rescheduleReason, setRescheduleReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (candidate) {
      if (candidate.interviewSchedule && isReschedule) {
        setRoundName(candidate.interviewSchedule.roundName)
        setDate(candidate.interviewSchedule.date)
        setStartTime(candidate.interviewSchedule.startTime)
        setEndTime(candidate.interviewSchedule.endTime)
        setMode(candidate.interviewSchedule.mode)
        setPlatform(candidate.interviewSchedule.platform)
        setMeetingUrl(candidate.interviewSchedule.meetingUrl || "")
        setOfficeAddress(candidate.interviewSchedule.officeAddress || settings.officeAddress)
        setContactPerson(candidate.interviewSchedule.contactPerson || settings.hrContactPerson)
        setContactPhone(candidate.interviewSchedule.contactPhone || settings.hrContactPhone)
        setInstructions(candidate.interviewSchedule.instructions || "")
      } else {
        // Suggested date from candidate preferences if available
        const prefDate = candidate.interviewPreferences?.preferredDate
        const prefTime = candidate.interviewPreferences?.preferredTime
        setDate(prefDate || new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0])
        setStartTime(prefTime || "11:00 AM")
        setMode(candidate.interviewPreferences?.modePreference || "ONLINE")
        setPlatform(candidate.interviewPreferences?.modePreference === "IN_PERSON" ? "In-person" : "Google Meet")
      }
    }
  }, [candidate, isReschedule, settings])

  if (!candidate) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) {
      toast.error("Please select an interview date.")
      return
    }

    if (isReschedule && !rescheduleReason.trim()) {
      toast.error("Please provide a reason for rescheduling.")
      return
    }

    setIsSubmitting(true)
    try {
      const action = isReschedule ? "RESCHEDULE" : "APPROVE_SCHEDULE"
      const payload = isReschedule
        ? {
            date,
            startTime,
            endTime,
            mode,
            platform,
            meetingUrl: mode === "ONLINE" ? meetingUrl : undefined,
            officeAddress: mode === "IN_PERSON" ? officeAddress : undefined,
            instructions,
            rescheduleReason: rescheduleReason.trim(),
            actor: "HR Team",
          }
        : {
            roundNumber: (currentSchedule?.roundNumber || 0) + 1,
            roundName,
            date,
            startTime,
            endTime,
            mode,
            platform,
            meetingUrl: mode === "ONLINE" ? meetingUrl : undefined,
            officeAddress: mode === "IN_PERSON" ? officeAddress : undefined,
            contactPerson,
            contactPhone,
            instructions,
            internalRemarks,
            actor: "HR Team",
          }

      const res = await fetch(`/api/hiring/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      })

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to schedule interview.")
      }

      toast.success(
        isReschedule
          ? "Interview rescheduled & updated notification dispatched to candidate!"
          : "Interview schedule approved & confirmed with candidate!"
      )
      onSuccess(data.candidate)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to save schedule.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-full max-w-[95vw] p-0 overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/10 via-emerald-600/10 to-transparent p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {isReschedule ? "Reschedule Interview" : "Schedule Interview & Approve Application"}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Candidate: <strong className="text-zinc-800 dark:text-zinc-200">{candidate.fullName}</strong> ({candidate.id}) • {candidate.appliedPosition}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Reschedule Context / Previous Notice */}
        {isReschedule && currentSchedule && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
            <History className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                Current Schedule: {currentSchedule.date} at {currentSchedule.startTime} ({currentSchedule.mode})
              </p>
              <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                The candidate's unique tracking link will immediately update, and an updated email notification will be dispatched.
              </p>
            </div>
          </div>
        )}

        {/* Candidate preferences reminder */}
        {candidate.interviewPreferences && !isReschedule && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span>
              <strong>Candidate Preferred:</strong> {candidate.interviewPreferences.preferredDate} at {candidate.interviewPreferences.preferredTime} ({candidate.interviewPreferences.modePreference})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (candidate.interviewPreferences?.preferredDate) {
                  setDate(candidate.interviewPreferences.preferredDate)
                }
                if (candidate.interviewPreferences?.preferredTime) {
                  setStartTime(candidate.interviewPreferences.preferredTime)
                }
              }}
              className="text-[11px] h-6 px-2 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
            >
              Use Preferences
            </Button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {isReschedule && (
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                Reason for Rescheduling <span className="text-red-500">*</span>
              </label>
              <Input
                required
                placeholder="e.g. Technical panelist unavailable due to urgent client transit demo."
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          )}

          {/* Round Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Interview Round Title
            </label>
            <Input
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              placeholder="e.g. Round 1 — Powertrain Telematics Deep Dive"
              className="h-9 text-xs"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" /> Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-zinc-400" /> Start Time
              </label>
              <Input
                placeholder="11:00 AM"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-zinc-400" /> End Time
              </label>
              <Input
                placeholder="12:00 PM"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Mode & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Interview Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("ONLINE")
                    if (platform === "In-person") setPlatform("Google Meet")
                  }}
                  className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    mode === "ONLINE"
                      ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
                  }`}
                >
                  <Video className="h-3.5 w-3.5" /> Online Video
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("IN_PERSON")
                    setPlatform("In-person")
                  }}
                  className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    mode === "IN_PERSON"
                      ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" /> In-person
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as InterviewPlatform)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {settings.interviewPlatforms.map((plat) => (
                  <option key={plat} value={plat}>
                    {plat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Meeting URL or Office Location */}
          {mode === "ONLINE" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <LinkIcon className="h-3.5 w-3.5 text-zinc-400" /> Meeting URL
              </label>
              <Input
                placeholder="https://meet.google.com/..."
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-zinc-400" /> Office Address / Reporting Location
              </label>
              <Input
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          )}

          {/* HR Contact Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-zinc-400" /> HR Contact Person
              </label>
              <Input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-zinc-400" /> HR Contact Phone
              </label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Candidate Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-zinc-400" /> Candidate Instructions
            </label>
            <Textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Internal Remarks (Private to HR) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Internal HR Remarks (Not visible to candidate)
            </label>
            <Input
              placeholder="e.g. Panelists: CTO + VP Fleet Ops. Test on BMS firmware debugging."
              value={internalRemarks}
              onChange={(e) => setInternalRemarks(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 h-9 shadow-md shadow-blue-600/20"
            >
              {isSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  {isReschedule ? "Confirm Reschedule" : "Confirm Schedule & Send Email"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

