"use client"

import React, { useState } from "react"
import { Candidate, RecruitmentSettings } from "@/lib/hiring/types"
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Star,
  Award,
  CheckCircle2,
  XCircle,
  History,
  Eye,
  ExternalLink,
  MessageSquare,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TabUnderHiringProps {
  candidates: Candidate[]
  settings: RecruitmentSettings
  onSelectCandidate: (c: Candidate) => void
  onOpenSchedule: (c: Candidate, isReschedule?: boolean) => void
  onOpenEvaluation: (c: Candidate) => void
  onOpenHire: (c: Candidate) => void
  onOpenReject: (c: Candidate) => void
}

export function TabUnderHiring({
  candidates,
  settings,
  onSelectCandidate,
  onOpenSchedule,
  onOpenEvaluation,
  onOpenHire,
  onOpenReject,
}: TabUnderHiringProps) {
  const [search, setSearch] = useState("")

  const hiringList = candidates.filter(
    (c) =>
      c.status === "INTERVIEW_SCHEDULED" ||
      c.status === "INTERVIEW_RESCHEDULED" ||
      c.status === "INTERVIEW_COMPLETED"
  )

  const filtered = hiringList.filter((c) => {
    return (
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.appliedPosition.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search active candidates in interview process..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="text-xs text-zinc-500 font-medium">
          Active Candidates in Process: <strong>{filtered.length}</strong>
        </div>
      </div>

      {/* Grid of Active Interview Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((candidate) => {
            const sched = candidate.interviewSchedule
            const lastEval = candidate.evaluations && candidate.evaluations[candidate.evaluations.length - 1]

            return (
              <div
                key={candidate.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-400/50 dark:hover:border-indigo-600/50 transition-all shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Top Candidate Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border shrink-0">
                        {candidate.documents?.photoUrl ? (
                          <img
                            src={candidate.documents.photoUrl}
                            alt={candidate.fullName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-bold text-xs text-zinc-400 uppercase">
                            {candidate.fullName.substring(0, 2)}
                          </div>
                        )}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => onSelectCandidate(candidate)}
                          className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 text-left block"
                        >
                          {candidate.fullName}
                        </button>
                        <p className="text-xs text-zinc-500 font-medium">
                          {candidate.appliedPosition} • <span className="text-zinc-400">{candidate.department}</span>
                        </p>
                      </div>
                    </div>

                    <Badge
                      className={
                        candidate.status === "INTERVIEW_COMPLETED"
                          ? "bg-teal-600 text-white text-[11px]"
                          : candidate.status === "INTERVIEW_RESCHEDULED"
                          ? "bg-purple-600 text-white text-[11px]"
                          : "bg-indigo-600 text-white text-[11px]"
                      }
                    >
                      {candidate.status === "INTERVIEW_COMPLETED"
                        ? "Interview Done"
                        : candidate.status === "INTERVIEW_RESCHEDULED"
                        ? "Rescheduled"
                        : "Interview Confirmed"}
                    </Badge>
                  </div>

                  {/* Interview Schedule Box */}
                  {sched && (
                    <div className="mt-4 p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                          {sched.roundName}
                        </span>
                        <span className="font-mono">{sched.date}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-indigo-800 dark:text-indigo-300">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {sched.startTime} - {sched.endTime}
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          {sched.mode === "ONLINE" ? (
                            <>
                              <Video className="h-3 w-3" /> {sched.platform}
                            </>
                          ) : (
                            <>
                              <MapPin className="h-3 w-3" /> In-person HQ
                            </>
                          )}
                        </span>
                      </div>

                      {sched.meetingUrl && (
                        <div className="pt-1 flex items-center justify-between text-[11px]">
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 truncate max-w-[200px]">
                            {sched.meetingUrl}
                          </span>
                          <a
                            href={sched.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                          >
                            Launch <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Latest Evaluation Banner if completed */}
                  {lastEval && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs">
                      <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200">
                        <span>Latest Evaluation Rating:</span>
                        <span className="flex items-center gap-1 text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {lastEval.overallRating}/5
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1 line-clamp-1 italic">
                        "{lastEval.interviewerRemarks || lastEval.strengths}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectCandidate(candidate)}
                    className="h-8 text-xs font-semibold"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1 text-zinc-500" />
                    Details
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenSchedule(candidate, true)}
                      className="h-8 text-xs font-semibold text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                    >
                      Reschedule
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => onOpenEvaluation(candidate)}
                      className="h-8 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                    >
                      <Award className="h-3.5 w-3.5 mr-1" />
                      Evaluate
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => onOpenHire(candidate)}
                      className="h-8 text-xs font-bold bg-[#548235] hover:bg-[#466e2c] text-white shadow-xs"
                    >
                      Hire
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800">
          <Calendar className="h-10 w-10 mx-auto text-zinc-400 mb-2 stroke-1" />
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            No candidates under active interviews
          </h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Approve submitted candidate applications in "Received Forms" to schedule interviews and track them here.
          </p>
        </div>
      )}
    </div>
  )
}

