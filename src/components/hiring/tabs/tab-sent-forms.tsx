"use client"

import React, { useState } from "react"
import { Candidate, RecruitmentSettings } from "@/lib/hiring/types"
import {
  Send,
  Calendar,
  Clock,
  Copy,
  Check,
  Mail,
  ExternalLink,
  Search,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface TabSentFormsProps {
  candidates: Candidate[]
  settings: RecruitmentSettings
  onSelectCandidate: (c: Candidate) => void
  onOpenInvite: () => void
}

export function TabSentForms({
  candidates,
  settings,
  onSelectCandidate,
  onOpenInvite,
}: TabSentFormsProps) {
  const [search, setSearch] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [resendingId, setResendingId] = useState<string | null>(null)

  const sentList = candidates.filter((c) => c.status === "APPLICATION_PENDING")

  const filtered = sentList.filter((c) => {
    return (
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.appliedPosition.toLowerCase().includes(search.toLowerCase())
    )
  })

  const handleCopy = (candidate: Candidate) => {
    const fullUrl = `${window.location.origin}/apply/${candidate.token}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(candidate.id)
    toast.success(`Application link for ${candidate.fullName} copied!`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleResend = async (candidate: Candidate) => {
    setResendingId(candidate.id)
    try {
      const res = await fetch("/api/hiring/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: candidate.id,
          emailType: "INVITATION_REMINDER",
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Invitation reminder re-dispatched to ${candidate.email}!`)
      }
    } catch {
      toast.error("Failed to resend invitation.")
    } finally {
      setResendingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search sent invitations by name, email, position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 font-medium">
            Pending Submissions: <strong>{sentList.length}</strong>
          </span>
          <Button
            size="sm"
            onClick={onOpenInvite}
            className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs font-semibold h-8"
          >
            + New Invitation
          </Button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Candidate Name & Email</th>
                  <th className="py-3 px-4">Invited Position</th>
                  <th className="py-3 px-4">Date Dispatched</th>
                  <th className="py-3 px-4">Submission Deadline</th>
                  <th className="py-3 px-4">Email Status</th>
                  <th className="py-3 px-4 text-right">Link & Resend Actions</th>
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
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                          {candidate.fullName}
                        </span>
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

                    <td className="py-3.5 px-4 text-zinc-500">
                      {new Date(candidate.invitation.sentAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      {candidate.invitation.deadline ? (
                        <span className="font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded text-[11px]">
                          {candidate.invitation.deadline}
                        </span>
                      ) : (
                        <span className="text-zinc-400">Open</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                        {candidate.invitation.emailStatus || "Delivered"}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(candidate)}
                          className="h-8 text-xs font-semibold px-2.5"
                          title="Copy Unique Application Link"
                        >
                          {copiedId === candidate.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              Copy Link
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={resendingId === candidate.id}
                          onClick={() => handleResend(candidate)}
                          className="h-8 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 px-2.5"
                          title="Resend Invitation Email"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${resendingId === candidate.id ? "animate-spin" : ""}`} />
                          Resend
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`/apply/${candidate.token}`, "_blank")}
                          className="h-8 text-xs p-2 text-zinc-500 hover:text-zinc-900"
                          title="Preview Candidate Portal"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
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
          <Send className="h-10 w-10 mx-auto text-zinc-400 mb-2 stroke-1" />
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            No pending candidate invitations
          </h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Click "+ New Invitation" above or "Hiring Options" to invite candidates with their individual application links.
          </p>
        </div>
      )}
    </div>
  )
}

