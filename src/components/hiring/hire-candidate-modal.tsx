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
import { CheckCircle, Award, Calendar, Building2, Briefcase, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Candidate, RecruitmentSettings } from "@/lib/hiring/types"

interface HireCandidateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: Candidate | null
  settings: RecruitmentSettings
  onSuccess: (updated: Candidate) => void
}

export function HireCandidateModal({
  open,
  onOpenChange,
  candidate,
  settings,
  onSuccess,
}: HireCandidateModalProps) {
  const [offeredDesignation, setOfferedDesignation] = useState(
    candidate?.appliedPosition || ""
  )
  const [offeredDepartment, setOfferedDepartment] = useState(
    candidate?.department || settings.departments[0] || "EV Engineering"
  )
  const [joiningDate, setJoiningDate] = useState(
    new Date(Date.now() + 86400000 * 15).toISOString().split("T")[0]
  )
  const [joiningInstructions, setJoiningInstructions] = useState(
    `Report to Transvolt Mobility HQ (${settings.officeAddress}) at 9:30 AM on your joining date with original educational certificates, government photo IDs, and 3 passport photographs.`
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!candidate) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joiningDate) {
      toast.error("Please specify a joining date.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/hiring/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "HIRE",
          payload: {
            offeredDesignation: offeredDesignation.trim() || candidate.appliedPosition,
            offeredDepartment: offeredDepartment.trim() || candidate.department,
            joiningDate,
            joiningInstructions: joiningInstructions.trim(),
            decidedBy: settings.hrContactPerson,
          },
        }),
      })

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to mark candidate as hired.")
      }

      toast.success(`🎉 Congratulations! ${candidate.fullName} has been officially marked as HIRED!`)
      onSuccess(data.candidate)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to complete hiring action.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl w-full max-w-[95vw] p-0 overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600/15 via-[#548235]/15 to-transparent p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#548235] text-white flex items-center justify-center shadow-md shadow-[#548235]/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Confirm Hiring & Issue Welcome Offer
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Welcome <strong className="text-zinc-800 dark:text-zinc-200">{candidate.fullName}</strong> into Transvolt Mobility Pvt. Ltd.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-zinc-400" /> Offered Designation
              </label>
              <Input
                required
                value={offeredDesignation}
                onChange={(e) => setOfferedDesignation(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-zinc-400" /> Department
              </label>
              <select
                value={offeredDepartment}
                onChange={(e) => setOfferedDepartment(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {settings.departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" /> Official Joining Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              required
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Joining Instructions & Day 1 Reporting Notes
            </label>
            <Textarea
              rows={3}
              value={joiningInstructions}
              onChange={(e) => setJoiningInstructions(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
            Upon confirmation, the candidate's single tracking link will transform into the official <strong>"Congratulations! You're Hired!"</strong> welcome screen, and an offer notification will be delivered to <strong>{candidate.email}</strong>.
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
              className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs font-semibold px-5 h-9 shadow-md shadow-[#548235]/20"
            >
              {isSubmitting ? "Processing..." : "Confirm & Mark Hired"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

