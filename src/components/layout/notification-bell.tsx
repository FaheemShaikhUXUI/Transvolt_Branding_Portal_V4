"use client"

import * as React from "react"
import { Bell, KeyRound, CheckCircle2, Clock, ChevronRight, X, UserPlus, Inbox, AlertTriangle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAccessRequests } from "@/lib/access-requests/access-request-context"
import { useUserAccess } from "@/lib/user-access/user-access-context"
import { useAuth } from "@/lib/auth/auth-context"
import type { AccessRequest } from "@/lib/access-requests/types"
import { RejectRequestDialog } from "@/components/user-access/reject-request-dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

function formatRequestTime(isoString?: string): string {
  if (!isoString) return ""
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

export function NotificationBell() {
  const { user } = useAuth()
  const { pendingRequests, rejectRequest } = useAccessRequests()
  const { reviewAccessRequest, openModal } = useUserAccess()

  const [isOpen, setIsOpen] = React.useState(false)
  const [rejectingRequest, setRejectingRequest] = React.useState<AccessRequest | null>(null)
  const [isRejecting, setIsRejecting] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Only visible to Super Admin
  const isSuperAdmin = user?.role === "Super Admin"

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Close on Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false)
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  if (!isSuperAdmin) return null

  const pendingCount = pendingRequests.length
  const hasPending = pendingCount > 0

  const handleOpenRequester = (req: AccessRequest) => {
    setIsOpen(false)
    reviewAccessRequest(req)
  }

  const handleViewAll = () => {
    setIsOpen(false)
    openModal("access-requests")
  }

  const handleConfirmReject = async () => {
    if (!rejectingRequest) return
    setIsRejecting(true)
    try {
      await rejectRequest(rejectingRequest.id, user?.email || "faheem.s@transvolt.in")
      toast.success(`Access request for ${rejectingRequest.email} rejected.`)
      setRejectingRequest(null)
    } catch {
      toast.error("Failed to reject access request.")
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* 🔔 Notification Bell Button */}
      <Button
        id="header-notification-bell-btn"
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Access Requests Notification"
        aria-expanded={isOpen}
        className={cn(
          "relative rounded-full h-9 w-9 transition-all duration-200 cursor-pointer",
          isOpen && "ring-2 ring-primary/40 bg-accent",
          hasPending && "border-amber-400/50 hover:border-amber-500"
        )}
      >
        <Bell className={cn("h-4 w-4 transition-transform", hasPending && "text-foreground")} />

        {/* Small Red Blinking Notification Dot & Badge */}
        {hasPending && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center">
            {/* Blinking outer radar ping */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
            {/* Solid core red badge */}
            <span className="relative inline-flex items-center justify-center rounded-full h-4 min-w-4 px-1 bg-rose-600 text-[9px] font-extrabold text-white shadow-sm ring-1 ring-background">
              {pendingCount}
            </span>
          </span>
        )}
      </Button>

      {/* Access Request Notification Panel Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3), 0 0 20px rgba(0,0,0,0.1)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground tracking-tight">
                  Access Requests
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  Super Admin review queue
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasPending ? (
                <Badge
                  variant="outline"
                  className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] px-2 py-0.5"
                >
                  {pendingCount} Pending
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                  0 Pending
                </Badge>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Body: Pending Requests List or Empty State */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
            {hasPending ? (
              pendingRequests.map((req) => {
                const displayName =
                  req.name?.trim() ||
                  req.email
                    .split("@")[0]
                    .replace(/[._]/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())

                return (
                  <div
                    key={req.id}
                    className="p-3.5 hover:bg-muted/40 transition-colors group flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase border border-amber-500/25">
                          {displayName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          {/* 1. Name */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-foreground block truncate">
                              {displayName}
                            </span>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              • {formatRequestTime(req.requestedAt)}
                            </span>
                          </div>

                          {/* 2. Email ID */}
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate" title={req.email}>
                            <Mail className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                            <span className="truncate font-mono text-[11px]">{req.email}</span>
                          </div>

                          {/* 3. Want Access For */}
                          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              Want Access For:
                            </span>
                            <Badge
                              variant="outline"
                              className="border-primary/30 bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0 h-5"
                            >
                              {req.accessFor || "Logo & Color / All"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-semibold px-1.5 py-0 shrink-0"
                      >
                        Pending
                      </Badge>
                    </div>

                    {/* Actions for this requester */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/30">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setRejectingRequest(req)}
                        className="h-7 px-2.5 text-[11px] font-medium text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                      >
                        Reject
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleOpenRequester(req)}
                        className="h-7 px-3 text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-xs flex items-center gap-1"
                      >
                        Review Access
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )
              })
            ) : (
              /* Empty state */
              <div className="py-8 px-4 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h5 className="text-xs font-bold text-foreground">No New Access Requests</h5>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  All access requests have been reviewed.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/60 bg-muted/20 p-2.5 text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleViewAll}
              className="w-full h-8 text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/10 rounded-xl flex items-center justify-center gap-1.5"
            >
              View All Requests
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Rejection Dialog */}
      <RejectRequestDialog
        isOpen={!!rejectingRequest}
        email={rejectingRequest?.email || ""}
        onConfirm={handleConfirmReject}
        onCancel={() => setRejectingRequest(null)}
        isRejecting={isRejecting}
      />
    </div>
  )
}
