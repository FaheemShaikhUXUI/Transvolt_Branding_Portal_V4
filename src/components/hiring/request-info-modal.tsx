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
import { HelpCircle, Send } from "lucide-react"
import { toast } from "sonner"
import { Candidate } from "@/lib/hiring/types"

interface RequestInfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: Candidate | null
  onSuccess: (updated: Candidate) => void
}

export function RequestInfoModal({
  open,
  onOpenChange,
  candidate,
  onSuccess,
}: RequestInfoModalProps) {
  const [remarks, setRemarks] = useState(
    "Please upload an updated PDF resume with your current CTC/notice period, or clarify your latest degree score."
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!candidate) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!remarks.trim()) {
      toast.error("Please enter the required information or correction details.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/hiring/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REQUEST_CHANGES",
          payload: {
            remarks: remarks.trim(),
            requestedBy: "HR Recruitment",
          },
        }),
      })

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to request information.")
      }

      toast.success(`Request sent! Candidate notified to resubmit through their unique link.`)
      onSuccess(data.candidate)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full max-w-[95vw] p-0 overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <div className="bg-gradient-to-r from-amber-600/10 via-yellow-600/10 to-transparent p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Request Additional Information / Resubmission
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Candidate: <strong className="text-zinc-800 dark:text-zinc-200">{candidate.fullName}</strong> ({candidate.id})
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Required Information or Correction Notes <span className="text-red-500">*</span>
            </label>
            <Textarea
              rows={4}
              required
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="text-xs"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              The candidate will receive an email and will see these instructions prominently when opening their application link, allowing them to edit and resubmit.
            </p>
          </div>

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
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-5 h-9 shadow-md shadow-amber-600/20"
            >
              {isSubmitting ? "Sending..." : "Send Request & Notify"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

