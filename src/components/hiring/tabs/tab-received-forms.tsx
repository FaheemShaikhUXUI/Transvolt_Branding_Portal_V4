"use client"

import React, { useState } from "react"
import { Candidate, RecruitmentSettings } from "@/lib/hiring/types"
import {
  Search,
  Filter,
  Download,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Sparkles,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TabReceivedFormsProps {
  candidates: Candidate[]
  settings: RecruitmentSettings
  onSelectCandidate: (c: Candidate) => void
  onOpenSchedule: (c: Candidate) => void
  onOpenReject: (c: Candidate) => void
  onOpenRequestInfo: (c: Candidate) => void
}

export function TabReceivedForms({
  candidates,
  settings,
  onSelectCandidate,
  onOpenSchedule,
  onOpenReject,
  onOpenRequestInfo,
}: TabReceivedFormsProps) {
  const [search, setSearch] = useState("")
  const [selectedDept, setSelectedDept] = useState("ALL")
  const [selectedPos, setSelectedPos] = useState("ALL")

  // Filter candidates whose forms have been received
  const receivedList = candidates.filter(
    (c) =>
      c.status === "UNDER_REVIEW" ||
      c.status === "CHANGES_REQUESTED" ||
      c.status === "INTERVIEW_COMPLETED"
  )

  const filtered = receivedList.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.appliedPosition.toLowerCase().includes(search.toLowerCase())

    const matchesDept = selectedDept === "ALL" || c.department === selectedDept
    const matchesPos = selectedPos === "ALL" || c.appliedPosition === selectedPos

    return matchesSearch && matchesDept && matchesPos
  })

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search & Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search candidate name, ID, email, position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-2xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="ALL">All Departments</option>
            {settings.departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Position Filter */}
          <select
            value={selectedPos}
            onChange={(e) => setSelectedPos(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-2xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="ALL">All Positions</option>
            {settings.positions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidates List Table / Cards */}
      {filtered.length > 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Candidate Profile</th>
                  <th className="py-3 px-4">Position & Dept</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4">Review Status</th>
                  <th className="py-3 px-4 text-right">Quick HR Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* Candidate Profile Photo & Details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border shrink-0">
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
                            className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-[#548235] text-left block text-xs"
                          >
                            {candidate.fullName}
                          </button>
                          <span className="font-mono text-[10px] text-zinc-400 block mt-0.5">
                            {candidate.id}
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            {candidate.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Position & Department */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                        {candidate.appliedPosition}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {candidate.department}
                      </span>
                    </td>

                    {/* Experience */}
                    <td className="py-3.5 px-4">
                      {candidate.experience?.isExperienced ? (
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {candidate.experience.totalYears || "Experienced"}
                        </span>
                      ) : (
                        <span className="text-zinc-400">Fresher</span>
                      )}
                    </td>

                    {/* Submission Date */}
                    <td className="py-3.5 px-4 text-zinc-500">
                      {candidate.submission?.submittedAt ? (
                        new Date(candidate.submission.submittedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {candidate.status === "UNDER_REVIEW" && (
                        <Badge className="bg-blue-600 text-white text-[11px]">Under Review</Badge>
                      )}
                      {candidate.status === "CHANGES_REQUESTED" && (
                        <Badge className="bg-amber-600 text-white text-[11px]">Changes Requested</Badge>
                      )}
                      {candidate.status === "INTERVIEW_COMPLETED" && (
                        <Badge className="bg-teal-600 text-white text-[11px]">Interview Completed</Badge>
                      )}
                    </td>

                    {/* Quick HR Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSelectCandidate(candidate)}
                          className="h-8 text-xs font-semibold px-2.5"
                          title="View Complete Profile & Documents"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1 text-zinc-500" />
                          Review
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => onOpenSchedule(candidate)}
                          className="h-8 text-xs font-semibold px-3 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                          title="Approve Application & Schedule Interview"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onOpenRequestInfo(candidate)}
                          className="h-8 text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 p-2"
                          title="Request Additional Information / Corrections"
                        >
                          <HelpCircle className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onOpenReject(candidate)}
                          className="h-8 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-2"
                          title="Reject Application"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800">
          <Briefcase className="h-10 w-10 mx-auto text-zinc-400 mb-2 stroke-1" />
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            No applications match your criteria
          </h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Candidates who submit their application form through their unique links will appear here automatically for HR review.
          </p>
        </div>
      )}
    </div>
  )
}

