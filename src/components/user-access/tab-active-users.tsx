"use client"

import * as React from "react"
import {
  Search, Users, Building2, Globe, Edit3, Trash2,
  Shield, User, ChevronDown, Clock, CheckCircle2, AlertCircle,
  LayoutGrid, Key
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useUserAccess } from "@/lib/user-access/user-access-context"
import { useAuth } from "@/lib/auth/auth-context"
import { formatDate } from "@/lib/user-access/permissions-utils"
import { PERMISSION_DEFINITIONS } from "@/lib/user-access/mock-service"
import type { ManagedUser, FilterType } from "@/lib/user-access/types"
import { cn } from "@/lib/utils"

type FilterOption = { value: FilterType | "ALL"; label: string }
const FILTER_OPTIONS: FilterOption[] = [
  { value: "ALL", label: "All Users" },
  { value: "INTERNAL", label: "In-House (@transvolt.in)" },
  { value: "EXTERNAL", label: "External" },
  { value: "SUPER_ADMIN", label: "Super Admins" },
]

function RemoveConfirmDialog({ user, onConfirm, onCancel, isLoading }: {
  user: ManagedUser
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-popover p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <Trash2 className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Remove User Access</h3>
            <p className="text-xs text-muted-foreground">This action cannot be undone</p>
          </div>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          Are you sure you want to remove access for{" "}
          <strong className="text-foreground">{user.name || user.email}</strong>?
          They will lose all portal access immediately.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button variant="destructive" className="flex-1 gap-2" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive-foreground/30 border-t-destructive-foreground" /> : <Trash2 className="h-4 w-4" />}
            {isLoading ? "Removing..." : "Remove Access"}
          </Button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: ManagedUser["status"] }) {
  if (status === "ACTIVE") return (
    <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30 text-[10px]">
      <CheckCircle2 className="h-2.5 w-2.5" /> Active
    </Badge>
  )
  if (status === "PENDING") return (
    <Badge className="gap-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/30 text-[10px]">
      <Clock className="h-2.5 w-2.5" /> Pending
    </Badge>
  )
  return (
    <Badge className="gap-1 bg-muted text-muted-foreground border text-[10px]">
      <AlertCircle className="h-2.5 w-2.5" /> Revoked
    </Badge>
  )
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

function getPermLabel(key: string): string {
  return PERMISSION_DEFINITIONS.find((p) => p.key === key)?.label ?? key
}

export function TabActiveUsers() {
  const { user: currentUser } = useAuth()
  const { users, isLoading, startEdit, removeUser } = useUserAccess()

  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<FilterType | "ALL">("ALL")
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [removingUser, setRemovingUser] = React.useState<ManagedUser | null>(null)
  const [isRemoving, setIsRemoving] = React.useState(false)

  const filtered = React.useMemo(() => {
    return users.filter((u) => {
      const q = query.toLowerCase()
      const matchesQuery = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.designation?.toLowerCase().includes(q)
      const matchesFilter =
        filter === "ALL" ||
        (filter === "INTERNAL" && u.userType === "INTERNAL") ||
        (filter === "EXTERNAL" && u.userType === "EXTERNAL") ||
        (filter === "SUPER_ADMIN" && u.role === "SUPER_ADMIN")
      return matchesQuery && matchesFilter
    })
  }, [users, query, filter])

  const stats = {
    total: users.length,
    internal: users.filter((u) => u.userType === "INTERNAL").length,
    external: users.filter((u) => u.userType === "EXTERNAL").length,
    superAdmin: users.filter((u) => u.role === "SUPER_ADMIN").length,
  }

  async function handleRemove(u: ManagedUser) {
    setIsRemoving(true)
    try { await removeUser(u.id) }
    finally { setIsRemoving(false); setRemovingUser(null) }
  }

  return (
    <>
      {removingUser && (
        <RemoveConfirmDialog
          user={removingUser}
          onConfirm={() => handleRemove(removingUser)}
          onCancel={() => setRemovingUser(null)}
          isLoading={isRemoving}
        />
      )}

      <div className="flex flex-col gap-6 p-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Users", value: stats.total, icon: Users, color: "text-primary", bg: "bg-primary/10" },
            { label: "In-House", value: stats.internal, icon: Building2, color: "text-[#548235]", bg: "bg-[#548235]/10" },
            { label: "External", value: stats.external, icon: Globe, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
            { label: "Super Admins", value: stats.superAdmin, icon: Shield, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", s.bg)}>
                <s.icon className={cn("h-4 w-4", s.color)} />
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="ua-user-search"
              placeholder="Search by name, email, or designation..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <Button
              variant="outline"
              className="gap-2 w-full sm:w-auto"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              {FILTER_OPTIONS.find((f) => f.value === filter)?.label ?? "Filter"}
              <ChevronDown className={cn("h-4 w-4 transition-transform", filterOpen && "rotate-180")} />
            </Button>
            {filterOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-border bg-popover p-1 shadow-xl">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      filter === opt.value
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted"
                    )}
                    onClick={() => { setFilter(opt.value); setFilterOpen(false) }}
                  >
                    {filter === opt.value && <CheckCircle2 className="h-3 w-3" />}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Cards (responsive) */}
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border text-center">
            <Users className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No users found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60">
            {/* Table Header */}
            <div className="hidden grid-cols-[2rem_1fr_1fr_6rem_7rem_7rem] items-center gap-4 border-b border-border/50 bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
              <span>#</span>
              <span>User</span>
              <span>Controls</span>
              <span>Access</span>
              <span>Type</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-border/40">
              {filtered.map((u, idx) => {
                const isSelf = u.email === currentUser?.email
                const isSuperAdmin = u.role === "SUPER_ADMIN"

                return (
                  <div
                    key={u.id}
                    className={cn(
                      "flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-muted/20 sm:grid sm:grid-cols-[2rem_1fr_1fr_6rem_7rem_7rem] sm:items-center sm:gap-4",
                      u.userType === "EXTERNAL" && "bg-amber-500/2"
                    )}
                  >
                    {/* Sr. No */}
                    <span className="hidden text-xs text-muted-foreground sm:block">{idx + 1}</span>

                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className={cn(
                          "text-xs font-bold",
                          isSuperAdmin
                            ? "bg-violet-500/15 text-violet-600 dark:text-violet-400"
                            : u.userType === "INTERNAL"
                            ? "bg-primary/15 text-primary"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        )}>
                          {getInitials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-semibold text-foreground truncate">{u.name}</p>
                          {isSelf && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-primary/40 text-primary">You</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        {u.designation && <p className="text-xs text-muted-foreground/60 truncate">{u.designation}</p>}
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="flex flex-wrap gap-1">
                      {isSuperAdmin ? (
                        <Badge className="bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-400/25 text-[10px] gap-1">
                          <Shield className="h-2.5 w-2.5" /> Full Control
                        </Badge>
                      ) : u.permissions.length === 0 ? (
                        <span className="text-xs text-muted-foreground/60 italic">No permissions</span>
                      ) : (
                        <>
                          {u.permissions.slice(0, 3).map((p) => (
                            <Badge key={p} variant="secondary" className="text-[10px] px-1.5">
                              {getPermLabel(p)}
                            </Badge>
                          ))}
                          {u.permissions.length > 3 && (
                            <Badge variant="outline" className="text-[10px] px-1.5">
                              +{u.permissions.length - 3}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>

                    {/* Page Access */}
                    <div>
                      {isSuperAdmin || u.accessScope === "ALL_PAGES" ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-400/25 text-[10px] gap-1">
                          <LayoutGrid className="h-2.5 w-2.5" /> All
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <Key className="h-2.5 w-2.5" /> {u.pages.length} pages
                        </Badge>
                      )}
                    </div>

                    {/* User Type */}
                    <div>
                      {u.userType === "INTERNAL" || u.email?.toLowerCase().includes("@transvolt.in") ? (
                        <Badge className="bg-[#548235]/15 text-[#548235] border border-[#548235]/30 text-[10px] gap-1 font-bold">
                          <Building2 className="h-2.5 w-2.5" /> In-House
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/25 text-[10px] gap-1">
                          <Globe className="h-2.5 w-2.5" /> External
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2">
                      {!isSuperAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => startEdit(u)}
                            title="Edit Access"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setRemovingUser(u)}
                            disabled={isSelf}
                            title={isSelf ? "Cannot remove yourself" : "Remove Access"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      {isSuperAdmin && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">Protected</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="text-right text-xs text-muted-foreground">
          Showing {filtered.length} of {users.length} users
        </div>
      </div>
    </>
  )
}
