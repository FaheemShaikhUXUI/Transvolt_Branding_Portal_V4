"use client"

import * as React from "react"
import { Shield, Lock, CheckCircle2, AlertTriangle, Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PERMISSION_DEFINITIONS } from "@/lib/user-access/mock-service"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/auth-context"
import { isSuperAdminEmail } from "@/lib/auth/superadmin-credentials"
import { SuperAdminCredentialsCard } from "./super-admin-credentials-card"

export function TabSuperAdmin() {
  const { superAdminCredentials, user } = useAuth()
  const isSuperAdmin = user?.role === "Super Admin" || (user?.email && isSuperAdminEmail(user.email))
  const activeName = superAdminCredentials?.name || (isSuperAdmin ? user?.name : "Faheem Shaikh")
  const activeEmail = superAdminCredentials?.email || (isSuperAdmin ? user?.email : "faheem.s@transvolt.in")
  const isInHouse = activeEmail.toLowerCase().includes("@transvolt.in") || activeEmail.toLowerCase().includes("@transvolt")

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Super Admin Identity Card */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-primary/4 to-background p-6">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/6 blur-2xl" />
        <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-amber-500/8 blur-xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-primary/20">
              <Crown className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold tracking-tight text-foreground">{activeName}</h3>
                <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-400/30 text-[10px] font-bold px-2">
                  SUPER ADMIN
                </Badge>
                <Badge className="bg-[#548235]/15 text-[#548235] border border-[#548235]/30 text-[10px] font-bold px-2">
                  {isInHouse ? "IN-HOUSE (@transvolt.in)" : "PORTAL MASTER"}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                {activeEmail} · Full Unrestricted Control · All Pages · All Permissions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/8 px-3 py-1.5">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
          </div>
        </div>

        <Separator className="my-4 bg-border/40" />

        <p className="relative text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Super Admin</span> has unrestricted access to all pages, assets, companies, groups and portal controls. All permissions are permanently enabled and cannot be individually disabled.
        </p>
      </div>

      {/* Super Admin User ID & Password Management Setting Section (Exclusively rendered for Super Admin) */}
      {isSuperAdmin && <SuperAdminCredentialsCard />}

      {/* Warning Note */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-500/8 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          <strong>Important:</strong> Super Admin privileges cannot be accidentally removed via this interface. To manage Super Admin accounts, contact your system administrator.
        </p>
      </div>

      {/* Permission Matrix */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Complete Permission Set</h4>
            <p className="text-xs text-muted-foreground">All {PERMISSION_DEFINITIONS.length} permissions are permanently granted</p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Lock className="h-3 w-3" />
            All Enabled
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PERMISSION_DEFINITIONS.map((perm) => (
            <div
              key={perm.key}
              className={cn(
                "group relative flex items-start gap-3 rounded-xl border p-4 transition-all",
                perm.dangerous
                  ? "border-amber-400/20 bg-amber-500/4 hover:border-amber-400/35 hover:bg-amber-500/8"
                  : "border-border/60 bg-muted/20 hover:border-primary/20 hover:bg-primary/4"
              )}
            >
              <div className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                perm.dangerous ? "bg-amber-500/15 text-amber-500" : "bg-emerald-500/15 text-emerald-500"
              )}>
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{perm.label}</span>
                  {perm.dangerous && (
                    <Badge variant="outline" className="border-amber-400/40 bg-transparent text-amber-500 text-[9px] px-1.5 py-0 h-4">HIGH</Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">{perm.description}</p>
              </div>
              <div className="absolute right-3 top-3">
                <Lock className="h-3 w-3 text-muted-foreground/40" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Footer */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-400/20 bg-blue-500/5 px-4 py-3">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          These permission settings are read-only for Super Admin. To grant partial permissions to other users, use the{" "}
          <strong className="text-foreground">User Access</strong> tab.
        </p>
      </div>
    </div>
  )
}
