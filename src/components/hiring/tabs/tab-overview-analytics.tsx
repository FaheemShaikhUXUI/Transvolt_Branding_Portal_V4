"use client"

import React from "react"
import { Candidate, RecruitmentSettings } from "@/lib/hiring/types"
import {
  Users,
  Send,
  FileCheck2,
  Clock,
  CalendarCheck2,
  Award,
  UserX,
  TrendingUp,
  ArrowRight,
  Video,
  MapPin,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface TabOverviewAnalyticsProps {
  candidates: Candidate[]
  settings: RecruitmentSettings
  onSelectCandidate: (c: Candidate) => void
  onNavigateTab: (tabId: string) => void
  onOpenInvite: () => void
}

export function TabOverviewAnalytics({
  candidates,
  settings,
  onSelectCandidate,
  onNavigateTab,
  onOpenInvite,
}: TabOverviewAnalyticsProps) {
  const total = candidates.length
  const sent = candidates.filter((c) => c.status === "APPLICATION_PENDING").length
  const received = candidates.filter((c) => c.status === "UNDER_REVIEW" || c.status === "CHANGES_REQUESTED").length
  const interviewing = candidates.filter(
    (c) =>
      c.status === "INTERVIEW_SCHEDULED" ||
      c.status === "INTERVIEW_RESCHEDULED" ||
      c.status === "INTERVIEW_COMPLETED"
  ).length
  const hired = candidates.filter((c) => c.status === "HIRED").length
  const unhired = candidates.filter((c) => c.status === "NOT_SELECTED").length

  const upcomingInterviews = candidates
    .filter(
      (c) =>
        (c.status === "INTERVIEW_SCHEDULED" || c.status === "INTERVIEW_RESCHEDULED") &&
        c.interviewSchedule?.date
    )
    .sort((a, b) => (a.interviewSchedule?.date || "").localeCompare(b.interviewSchedule?.date || ""))

  // Department counts
  const deptCounts: Record<string, number> = {}
  candidates.forEach((c) => {
    deptCounts[c.department] = (deptCounts[c.department] || 0) + 1
  })

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Candidates", value: total, icon: Users, color: "text-zinc-700 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300", targetTab: "received" },
          { label: "Invitations Sent", value: sent, icon: Send, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400", targetTab: "sent" },
          { label: "Received Forms", value: received, icon: FileCheck2, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400", targetTab: "received" },
          { label: "In Interviews", value: interviewing, icon: CalendarCheck2, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400", targetTab: "under_hiring" },
          { label: "Hired Employees", value: hired, icon: Award, color: "text-[#548235] bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400", targetTab: "hired" },
          { label: "Unhired / Closed", value: unhired, icon: UserX, color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400", targetTab: "unhired" },
        ].map((kpi, idx) => {
          const Icon = kpi.icon
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(kpi.targetTab)}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-[#548235]/40 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500 font-medium">{kpi.label}</span>
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#548235] transition-colors">
                  {kpi.value}
                </span>
                <span className="text-[11px] text-zinc-400">candidates</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Middle Grid: Recruitment Funnel & Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recruitment Funnel */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#548235]" />
                Recruitment Conversion Funnel
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Conversion from sent invitations to finalized hires.
              </p>
            </div>
            <Button
              size="sm"
              onClick={onOpenInvite}
              className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs font-semibold h-8"
            >
              + Invite Candidate
            </Button>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { stage: "Invitations Dispatched", count: total, pct: 100, barColor: "bg-blue-500" },
              { stage: "Applications Received", count: total - sent, pct: total ? Math.round(((total - sent) / total) * 100) : 0, barColor: "bg-indigo-500" },
              { stage: "Shortlisted for Interviews", count: interviewing + hired, pct: total ? Math.round(((interviewing + hired) / total) * 100) : 0, barColor: "bg-purple-500" },
              { stage: "Offered & Hired", count: hired, pct: total ? Math.round((hired / total) * 100) : 0, barColor: "bg-[#548235]" },
            ].map((step, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">{step.stage}</span>
                  <span className="text-zinc-500 font-mono">
                    <strong>{step.count}</strong> ({step.pct}%)
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${step.barColor}`}
                    style={{ width: `${Math.max(step.pct, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Department Breakdown Chips */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Applications by Department
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(deptCounts).map(([dept, count]) => (
                <span
                  key={dept}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
                >
                  {dept}
                  <strong className="text-[#548235]">{count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Confirmed Interviews */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <CalendarCheck2 className="h-4 w-4 text-indigo-600" />
              Upcoming Interviews
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400">
              {upcomingInterviews.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px]">
            {upcomingInterviews.length > 0 ? (
              upcomingInterviews.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectCandidate(c)}
                  className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      {c.fullName}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {c.interviewSchedule?.date}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 truncate">{c.appliedPosition}</p>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {c.interviewSchedule?.startTime}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                      {c.interviewSchedule?.mode === "ONLINE" ? (
                        <>
                          <Video className="h-3 w-3" /> {c.interviewSchedule.platform}
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3 w-3" /> In-person
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                <CalendarCheck2 className="h-8 w-8 mb-2 stroke-1" />
                <p className="text-xs font-medium">No upcoming interviews scheduled</p>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab("under_hiring")}
            className="w-full text-xs font-semibold justify-between"
          >
            <span>View Full Interview Pipeline</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

