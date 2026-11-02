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
import { Star, Award, CheckCircle2, UserCheck, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { Candidate } from "@/lib/hiring/types"

interface InterviewEvaluationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: Candidate | null
  onSuccess: (updated: Candidate) => void
}

export function InterviewEvaluationModal({
  open,
  onOpenChange,
  candidate,
  onSuccess,
}: InterviewEvaluationModalProps) {
  const [roundName, setRoundName] = useState(
    candidate?.interviewSchedule?.roundName || "Round 1 — Technical Assessment"
  )
  const [evaluatedBy, setEvaluatedBy] = useState("HR Panel & Lead Architect")
  const [technicalRating, setTechnicalRating] = useState(4)
  const [communicationRating, setCommunicationRating] = useState(4)
  const [experienceRating, setExperienceRating] = useState(4)
  const [problemSolvingRating, setProblemSolvingRating] = useState(4)
  const [confidenceRating, setConfidenceRating] = useState(4)
  const [overallRating, setOverallRating] = useState(4)
  const [strengths, setStrengths] = useState("")
  const [improvements, setImprovements] = useState("")
  const [interviewerRemarks, setInterviewerRemarks] = useState("")
  const [recommendation, setRecommendation] = useState<
    "NEXT_ROUND" | "ANOTHER_INTERVIEW" | "HOLD" | "HIRE" | "REJECT"
  >("HIRE")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!candidate) return null

  const handleRatingSelect = (currentVal: number, setFn: (val: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFn(star)}
            className={`p-1 rounded transition-colors ${
              star <= currentVal
                ? "text-amber-500 hover:text-amber-600"
                : "text-zinc-200 dark:text-zinc-700 hover:text-amber-300"
            }`}
          >
            <Star className={`h-4 w-4 ${star <= currentVal ? "fill-amber-400" : ""}`} />
          </button>
        ))}
        <span className="text-xs font-semibold ml-1.5 text-zinc-600 dark:text-zinc-300">
          {currentVal}/5
        </span>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/hiring/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "EVALUATE",
          payload: {
            roundName,
            evaluatedBy: evaluatedBy.trim() || "Technical Panel",
            technicalRating,
            communicationRating,
            experienceRating,
            problemSolvingRating,
            confidenceRating,
            overallRating,
            strengths: strengths.trim(),
            improvements: improvements.trim(),
            interviewerRemarks: interviewerRemarks.trim(),
            recommendation,
          },
        }),
      })

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to submit evaluation.")
      }

      toast.success("Interview evaluation submitted & saved successfully!")
      onSuccess(data.candidate)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to save evaluation.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-full max-w-[95vw] p-0 overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-transparent p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Record Interview Evaluation
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Candidate: <strong className="text-zinc-800 dark:text-zinc-200">{candidate.fullName}</strong> ({candidate.id}) • {candidate.appliedPosition}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Evaluation Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Interview Round Name
              </label>
              <Input
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Evaluator / Panel Name
              </label>
              <Input
                value={evaluatedBy}
                onChange={(e) => setEvaluatedBy(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Ratings Grid */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Assessment Criteria (1 to 5 Stars)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600 dark:text-zinc-300">Technical Knowledge</span>
                {handleRatingSelect(technicalRating, setTechnicalRating)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600 dark:text-zinc-300">Communication Skills</span>
                {handleRatingSelect(communicationRating, setCommunicationRating)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600 dark:text-zinc-300">Relevant Experience</span>
                {handleRatingSelect(experienceRating, setExperienceRating)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600 dark:text-zinc-300">Problem-Solving Ability</span>
                {handleRatingSelect(problemSolvingRating, setProblemSolvingRating)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600 dark:text-zinc-300">Confidence & Culture Fit</span>
                {handleRatingSelect(confidenceRating, setConfidenceRating)}
              </div>

              <div className="flex items-center justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-200 dark:border-zinc-700 font-bold">
                <span className="text-xs text-zinc-900 dark:text-zinc-100">Overall Rating</span>
                {handleRatingSelect(overallRating, setOverallRating)}
              </div>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Key Strengths
              </label>
              <Textarea
                rows={2}
                placeholder="e.g. Deep understanding of CAN telematics and lithium battery cell degradation curves."
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Areas for Improvement
              </label>
              <Textarea
                rows={2}
                placeholder="e.g. Needs exposure to Transvolt proprietary fast-charging protocol stack."
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Interviewer Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Interviewer Remarks & Summary
            </label>
            <Textarea
              rows={2}
              placeholder="e.g. Recommended for immediate offer. Outstanding cultural alignment with our EV mission."
              value={interviewerRemarks}
              onChange={(e) => setInterviewerRemarks(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Final Recommendation */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Final Recommendation Action
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: "HIRE", label: "Hire Candidate", color: "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" },
                { id: "NEXT_ROUND", label: "Next Round", color: "border-blue-600 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" },
                { id: "ANOTHER_INTERVIEW", label: "Another Interview", color: "border-indigo-600 bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300" },
                { id: "HOLD", label: "Keep on Hold", color: "border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" },
                { id: "REJECT", label: "Reject Candidate", color: "border-rose-600 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRecommendation(item.id as any)}
                  className={`p-2 rounded-lg border text-center text-[11px] font-semibold transition-all ${
                    recommendation === item.id
                      ? `${item.color} ring-2 ring-offset-1 ring-zinc-400 dark:ring-zinc-600`
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
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
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-5 h-9 shadow-md shadow-purple-600/20"
            >
              {isSubmitting ? "Saving..." : "Submit Evaluation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

