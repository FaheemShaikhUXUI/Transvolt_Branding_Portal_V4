"use client"

import * as React from "react"
import {
  Search, CheckCircle2, Clock, XCircle, AlertTriangle,
  UserCheck, Shield, ExternalLink, Filter, Mail, ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAccessRequests } from "@/lib/access-requests/access-request-context"
import { useUserAccess } from "@/lib/user-access/user-access-context"
import { useAuth } from "@/lib/auth/auth-context"
import type { AccessRequest, AccessRequestStatus } from "@/lib/access-requests/types"
import { isInternalEmail } from "@/lib/user-access/permissions-utils"
import { RejectRequestDialog } from "./reject-request-dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type FilterStatus = "ALL" | "Pending" | "Approved" | "Rejected"

function formatDate(isoString?: string): string {
  if (!isoString) return "—"
  try {
    const d = new Date(isoString)
    return d.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } catch {
    return isoString
  }
}

export function TabAccessRequests() {
  const { requests, rejectRequest } = useAccessRequests()
  const { reviewAccessRequest } = useUserAccess()
  const { user } = useAuth()

  const [search, setSearch] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState<FilterStatus>("ALL")
  const [selectedRequestForReject, setSelectedRequestForReject] = React.useState<AccessRequest | null>(null)
  const [isRejecting, setIsRejecting] = React.useState(false)

  // Counts
  const stats = React.useMemo(() => {
    const total = requests.length
    const pending = requests.filter((r) => r.status === "Pending").length
    const approved = requests.filter((r) => r.status === "Approved").length
    const rejected = requests.filter((r) => r.status === "Rejected").length
    return { total, pending, approved, rejected }
  }, [requests])

  // Filtered requests
  const filteredRequests = React.useMemo(() => {
    return requests.filter((r) => {
      const matchesFilter = filterStatus === "ALL" || r.status === filterStatus
      const matchesSearch =
        !search ||
        r.email.toLowerCase().includes(search.toLowerCase()) ||
        (r.reviewedBy && r.reviewedBy.toLowerCase().includes(search.toLowerCase()))
      return matchesFilter && matchesSearch
    })
  }, [requests, filterStatus, search])

  const handleReview = (req: AccessRequest) => {
    reviewAccessRequest(req)
  }

  const handleConfirmReject = async () => {
    if (!selectedRequestForReject) return
    setIsRejecting(true)
    try {
      await rejectRequest(
        selectedRequestForReject.id,
        user?.email || "faheem.s@transvolt.in"
      )
      toast.success(`Access request for ${selectedRequestForReject.email} rejected.`)
      setSelectedRequestForReject(null)
    } catch {
      toast.error("Failed to reject access request.")
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="flex h-full flex-col space-y-5 p-6">
      {/* Top Header & Metrics Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">Access Request History</h3>
            <Badge variant="secondary" className="font-mono text-xs">
              {stats.total} Total
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit log of all pending, approved, and rejected access requests.
          </p>
        </div>

        {/* Status Counters Pill Group */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 font-medium text-amber-700 dark:text-amber-300">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Pending: <strong>{stats.pending}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Approved: <strong>{stats.approved}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 font-medium text-rose-700 dark:text-rose-300">
            <XCircle className="h-3.5 w-3.5 text-rose-500" />
            <span>Rejected: <strong>{stats.rejected}</strong></span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search email or reviewer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-muted/40"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/30 p-1">
          {(["ALL", "Pending", "Approved", "Rejected"] as FilterStatus[]).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-semibold transition-all",
                filterStatus === st
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {st === "ALL" ? "All Requests" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 overflow-auto rounded-2xl border border-border/70 bg-card shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-md border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4 w-14">Sr. No.</th>
              <th className="py-3 px-4">Requester</th>
              <th className="py-3 px-4">Want Access For</th>
              <th className="py-3 px-4">Requested Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Reviewed By</th>
              <th className="py-3 px-4">Reviewed Date</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req, index) => {
                const isInternal = isInternalEmail(req.email)
                const displayName =
                  req.name?.trim() ||
                  req.email
                    .split("@")[0]
                    .replace(/[._]/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())

                return (
                  <tr key={req.id} className="hover:bg-muted/30 transition-colors group">
                    {/* Sr. No. */}
                    <td className="py-3.5 px-4 font-mono text-muted-foreground font-medium">
                      #{index + 1}
                    </td>

                    {/* Requester & Email */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase">
                          {displayName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground truncate block">
                            {displayName}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono truncate block">
                            {req.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Want Access For */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className="border-primary/30 bg-primary/10 text-primary text-[11px] font-semibold px-2 py-0.5"
                      >
                        {req.accessFor || "Logo & Color / All"}
                      </Badge>
                    </td>

                    {/* Requested Date */}
                    <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(req.requestedAt)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {req.status === "Pending" && (
                        <Badge
                          variant="outline"
                          className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1.5 font-semibold text-[11px] px-2.5 py-0.5"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pending
                        </Badge>
                      )}
                      {req.status === "Approved" && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1.5 font-semibold text-[11px] px-2.5 py-0.5"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Approved
                        </Badge>
                      )}
                      {req.status === "Rejected" && (
                        <Badge
                          variant="outline"
                          className="border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 gap-1.5 font-semibold text-[11px] px-2.5 py-0.5"
                        >
                          <XCircle className="h-3 w-3" />
                          Rejected
                        </Badge>
                      )}
                    </td>

                    {/* Reviewed By */}
                    <td className="py-3.5 px-4 text-foreground truncate max-w-[160px]">
                      {req.reviewedBy ? (
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {req.reviewedBy}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>

                    {/* Reviewed Date */}
                    <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(req.reviewedAt)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {req.status === "Pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            className="h-7 text-xs font-bold px-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                            onClick={() => handleReview(req)}
                          >
                            Review & Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs px-2 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setSelectedRequestForReject(req)}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : req.status === "Approved" ? (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Access Active
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Archived
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">No access requests found</p>
                    <p className="text-xs text-muted-foreground/70">
                      Try adjusting your search query or filter selection.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Rejection Dialog */}
      <RejectRequestDialog
        isOpen={!!selectedRequestForReject}
        email={selectedRequestForReject?.email || ""}
        onConfirm={handleConfirmReject}
        onCancel={() => setSelectedRequestForReject(null)}
        isRejecting={isRejecting}
      />
    </div>
  )
}
