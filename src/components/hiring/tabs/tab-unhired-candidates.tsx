"use client"

import React, { useState } from "react"
import { Candidate, RecruitmentSettings } from "@/lib/hiring/types"
import {
  UserX,
  Calendar,
  Eye,
  Search,
  AlertTriangle,
  Mail,
  Building2,
  Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface TabUnhiredCandidatesProps {
  candidates: Candidate[]
  settings: RecruitmentSettings
  onSelectCandidate: (c: Candidate) => void
}

export function TabUnhiredCandidates({
  candidates,
  settings,
  onSelectCandidate,
}: TabUnhiredCandidatesProps) {
  const [search, setSearch] = useState("")

  const unhiredList = candidates.filter((c) => c.status === "NOT_SELECTED")

  const filtered = unhiredList.filter((c) => {
    return (
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.appliedPosition.toLowerCase().includes(search.toLowerCase()) ||
      (c.decision?.rejectionReason || "").toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search unhired candidates or reasons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="text-xs text-zinc-500 font-medium">
          Total Unhired: <strong>{unhiredList.length}</strong>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Position & Dept</th>
                  <th className="py-3 px-4">Rejection Reason</th>
                  <th className="py-3 px-4">Decision Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <button
                          type="button"
                          onClick={() => onSelectCandidate(candidate)}
                          className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-rose-600 text-left block"
                        >
                          {candidate.fullName}
                        </button>
                        <span className="font-mono text-[10px] text-zinc-400 block mt-0.5">
                          {candidate.id}
                        </span>
                        <span className="text-[11px] text-zinc-500">{candidate.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                        {candidate.appliedPosition}
                      </span>
                      <span className="text-[11px] text-zinc-400">{candidate.department}</span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="space-y-1">
                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                          {candidate.decision?.rejectionReason || "Not Selected"}
                        </Badge>
                        {candidate.decision?.feedbackMessage && (
                          <p className="text-[11px] text-zinc-500 line-clamp-1 italic">
                            "{candidate.decision.feedbackMessage}"
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-500">
                      {candidate.decision?.decisionDate
                        ? new Date(candidate.decision.decisionDate).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelectCandidate(candidate)}
                        className="h-8 text-xs font-semibold px-2.5"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1 text-zinc-500" />
                        View History
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800">
          <UserX className="h-10 w-10 mx-auto text-zinc-400 mb-2 stroke-1" />
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            No unhired candidate records
          </h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Candidates who are not selected or withdraw their application will be safely archived here.
          </p>
        </div>
      )}
    </div>
  )
}

