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
import { Textarea } from "@/components/ui/textarea"
import { XCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { Candidate } from "@/lib/hiring/types"

interface RejectCandidateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: Candidate | null
  onSuccess: (updated: Candidate) => void
}

const REJECTION_REASONS = [
  "Experience mismatch with current technical requirements",
  "Selected candidate with deeper domain expertise",
  "Interview evaluation did not meet role benchmark",
  "Compensation or notice period misalignment",
  "Candidate withdrew application / declined offer",
  "Position put on hold or fulfilled internally",
  "Other",
]

export function RejectCandidateModal({
  open,
  onOpenChange,
  candidate,
  onSuccess,
}: RejectCandidateModalProps) {
  const [rejectionReason, setRejectionReason] = useState(REJECTION_REASONS[0])
  const [feedbackMessage, setFeedbackMessage] = useState(
    "Thank you for taking the time to participate in our recruitment process. After careful consideration, we have chosen to proceed with another profile whose background aligns more closely with our immediate requirements."
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!candidate) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/hiring/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REJECT",
          payload: {
            rejectionReason,
            feedbackMessage: feedbackMessage.trim(),
            decidedBy: "HR Recruitment",
          },
        }),
      })

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to reject candidate.")
      }

      toast.success(`Application marked as Not Selected. Candidate moved to Unhired Candidates.`)
      onSuccess(data.candidate)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to update candidate status.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full max-w-[95vw] p-0 overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600/10 via-red-600/10 to-transparent p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Mark Candidate as Not Selected
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Candidate: <strong className="text-zinc-800 dark:text-zinc-200">{candidate.fullName}</strong> ({candidate.id})
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Reason for Non-Selection <span className="text-red-500">*</span>
            </label>
            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {REJECTION_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Personalized Feedback Note (Delivered to candidate)
            </label>
            <Textarea
              rows={3}
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              Internal notes and evaluations will remain confidential to HR. The candidate's link will display a respectful closure message.
            </span>
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
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-5 h-9 shadow-md shadow-rose-600/20"
            >
              {isSubmitting ? "Processing..." : "Confirm Non-Selection"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

