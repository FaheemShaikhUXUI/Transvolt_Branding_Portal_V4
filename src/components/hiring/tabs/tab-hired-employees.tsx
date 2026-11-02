"use client"

import React, { useState } from "react"
import { Candidate, RecruitmentSettings } from "@/lib/hiring/types"
import {
  Award,
  Calendar,
  Building2,
  Briefcase,
  Mail,
  Phone,
  Eye,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface TabHiredEmployeesProps {
  candidates: Candidate[]
  settings: RecruitmentSettings
  onSelectCandidate: (c: Candidate) => void
}

export function TabHiredEmployees({
  candidates,
  settings,
  onSelectCandidate,
}: TabHiredEmployeesProps) {
  const [search, setSearch] = useState("")

  const hiredList = candidates.filter((c) => c.status === "HIRED")

  const filtered = hiredList.filter((c) => {
    return (
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.appliedPosition.toLowerCase().includes(search.toLowerCase()) ||
      (c.decision?.offeredDesignation || "").toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search hired employees by name, designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="text-xs text-zinc-500 font-medium">
          Total Hired: <strong className="text-[#548235]">{hiredList.length}</strong>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <div
              key={emp.id}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-[#548235]/50 transition-all shadow-xs flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header with Photo & Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border shrink-0">
                      {emp.documents?.photoUrl ? (
                        <img
                          src={emp.documents.photoUrl}
                          alt={emp.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-bold text-xs text-zinc-400 uppercase">
                          {emp.fullName.substring(0, 2)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#548235] transition-colors">
                        {emp.fullName}
                      </h4>
                      <p className="text-xs font-semibold text-[#548235]">
                        {emp.decision?.offeredDesignation || emp.appliedPosition}
                      </p>
                      <p className="text-[11px] text-zinc-400">{emp.decision?.offeredDepartment || emp.department}</p>
                    </div>
                  </div>

                  <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-[#548235]">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                </div>

                {/* Joining Date Banner */}
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 text-xs">
                  <div className="flex items-center justify-between text-emerald-900 dark:text-emerald-200 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#548235]" />
                      Official Joining Date:
                    </span>
                    <span className="font-bold">{emp.decision?.joiningDate || "Confirmed"}</span>
                  </div>
                  {emp.decision?.joiningInstructions && (
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1.5 line-clamp-2">
                      {emp.decision.joiningInstructions}
                    </p>
                  )}
                </div>

                {/* Contact Coordinates */}
                <div className="space-y-1 text-xs text-zinc-500 pt-1">
                  <p className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-zinc-400" /> {emp.email}
                  </p>
                  {emp.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-zinc-400" /> {emp.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectCandidate(emp)}
                  className="h-8 text-xs font-semibold"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View Dossier
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`/apply/${emp.token}`, "_blank")}
                  className="h-8 text-xs font-semibold text-blue-600 dark:text-blue-400"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Hired Portal Screen
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800">
          <Award className="h-10 w-10 mx-auto text-zinc-400 mb-2 stroke-1" />
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            No hired employees in this filter
          </h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Candidates who receive and accept the final offer will be listed here with full joining schedules.
          </p>
        </div>
      )}
    </div>
  )
}

