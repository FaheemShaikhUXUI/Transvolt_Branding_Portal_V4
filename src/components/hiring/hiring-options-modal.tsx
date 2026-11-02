"use client"

import React, { useState } from "react"
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
  UserPlus,
  Mail,
  Briefcase,
  Building2,
  Calendar,
  Copy,
  Check,
  ExternalLink,
  Send,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { Candidate, RecruitmentSettings } from "@/lib/hiring/types"

interface HiringOptionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvitationCreated: (candidate: Candidate) => void
  settings: RecruitmentSettings
}

export function HiringOptionsModal({
  open,
  onOpenChange,
  onInvitationCreated,
  settings,
}: HiringOptionsModalProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [appliedPosition, setAppliedPosition] = useState(
    settings.positions[0] || "Senior EV Systems Engineer"
  )
  const [department, setDepartment] = useState(
    settings.departments[0] || "EV Engineering & Powertrain"
  )
  const [deadlineDays, setDeadlineDays] = useState(
    settings.defaultDeadlineDays || 7
  )
  const [customMessage, setCustomMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdResult, setCreatedResult] = useState<{
    candidate: Candidate
    applicationUrl: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleReset = () => {
    setFullName("")
    setEmail("")
    setCustomMessage("")
    setCreatedResult(null)
    setCopied(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim()) {
      toast.error("Please enter candidate name and email address.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/hiring/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          appliedPosition,
          department,
          deadlineDays,
          customMessage: customMessage.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to generate invitation.")
      }

      setCreatedResult({
        candidate: data.candidate,
        applicationUrl: data.applicationUrl,
      })
      onInvitationCreated(data.candidate)
      toast.success(`Invitation sent to ${email.trim()}!`)
    } catch (err: any) {
      toast.error(err.message || "Failed to generate invitation.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyLink = () => {
    if (!createdResult) return
    const fullUrl = `${window.location.origin}${createdResult.applicationUrl}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    toast.success("Unique application link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleReset()
        onOpenChange(v)
      }}
    >
      <DialogContent className="sm:max-w-xl w-full max-w-[95vw] p-0 overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        {/* Header with Transvolt Brand Theme */}
        <div className="bg-gradient-to-r from-[#548235]/15 via-emerald-500/10 to-transparent p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-[#548235] text-white flex items-center justify-center shadow-md shadow-[#548235]/25">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {createdResult ? "Invitation Dispatched!" : "Hiring Options — Generate Invitation"}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {createdResult
                  ? "A unique secure application link has been generated for this candidate."
                  : "Invite a new candidate to complete their recruitment profile."}
              </DialogDescription>
            </div>
          </div>
        </div>

        {createdResult ? (
          /* Success Screen with Copy Link & Details */
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                  Invitation Sent to {createdResult.candidate.fullName}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300/90 mt-0.5">
                  Application ID: <span className="font-mono font-bold">{createdResult.candidate.id}</span>
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  Email dispatched to <span className="underline">{createdResult.candidate.email}</span>
                </p>
              </div>
            </div>

            {/* Candidate Single Tracking URL Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#548235]" />
                Candidate's Unique Application & Tracking Link
              </label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}${createdResult.applicationUrl}`}
                  className="font-mono text-xs bg-zinc-50 dark:bg-zinc-800/50 h-10 select-all"
                />
                <Button
                  onClick={handleCopyLink}
                  type="button"
                  variant="outline"
                  className="h-10 px-4 shrink-0 font-medium border-zinc-300 dark:border-zinc-700 hover:bg-[#548235]/10 hover:text-[#548235]"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-zinc-500">
                HR rule: The candidate uses this <strong>same single link</strong> throughout the entire recruitment lifecycle to submit details and view interview/hiring status.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="ghost"
                type="button"
                onClick={handleReset}
                className="text-xs text-zinc-600 dark:text-zinc-400"
              >
                + Invite Another Candidate
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    const fullUrl = `${window.location.origin}${createdResult.applicationUrl}`
                    window.open(fullUrl, "_blank")
                  }}
                  className="text-xs font-medium"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Open Candidate View
                </Button>

                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs font-semibold px-5"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Form to Generate Invitation */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Candidate Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Rahul Patil"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Candidate Email ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <Input
                    required
                    type="email"
                    placeholder="e.g. rahul.patel@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 pl-9 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Applied Position */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-zinc-400" /> Position Applied For
                </label>
                <select
                  value={appliedPosition}
                  onChange={(e) => setAppliedPosition(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {settings.positions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-zinc-400" /> Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {settings.departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submission Deadline */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" /> Application Deadline (Days to complete)
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(Number(e.target.value))}
                  className="h-9 w-24 text-sm"
                />
                <span className="text-xs text-zinc-500">
                  Link expires after {deadlineDays} days from dispatch.
                </span>
              </div>
            </div>

            {/* Custom Invitation Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Personalized Note to Candidate (Optional)
              </label>
              <Textarea
                placeholder="e.g. Dear Candidate, we reviewed your profile and would love to invite you to submit your credentials..."
                rows={2}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Footer Buttons */}
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
                className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs font-semibold px-5 h-9 shadow-md shadow-[#548235]/20"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

