"use client"

import * as React from "react"
import { X, Crown, UserCog, Users, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUserAccess } from "@/lib/user-access/user-access-context"
import { useAccessRequests } from "@/lib/access-requests/access-request-context"
import { useAuth } from "@/lib/auth/auth-context"
import { isSuperAdminEmail, isUserSuperAdmin } from "@/lib/auth/superadmin-credentials"
import { TabSuperAdmin } from "./tab-super-admin"
import { TabUserAccess } from "./tab-user-access"
import { TabActiveUsers } from "./tab-active-users"
import { TabAccessRequests } from "./tab-access-requests"
import { cn } from "@/lib/utils"

type TabId = "super-admin" | "user-access" | "active-users" | "access-requests"

const TABS: { id: TabId; label: string; icon: React.ElementType; description: string }[] = [
  { id: "super-admin", label: "Super Admin Settings", icon: Crown, description: "Master ID & Password" },
  { id: "user-access", label: "User Access", icon: UserCog, description: "Assign permissions" },
  { id: "active-users", label: "Active Users", icon: Users, description: "Manage users" },
  { id: "access-requests", label: "Access Requests", icon: Inbox, description: "Review requests & history" },
]

export function UserAccessModal() {
  const { isModalOpen, closeModal, defaultTab } = useUserAccess()
  const { pendingRequests } = useAccessRequests()
  const { user } = useAuth()
  const isSuperAdmin = isUserSuperAdmin(user)

  const visibleTabs = React.useMemo(() => {
    return TABS.filter((tab) => tab.id !== "super-admin" || isSuperAdmin)
  }, [isSuperAdmin])

  const [activeTab, setActiveTab] = React.useState<TabId>(isSuperAdmin ? "super-admin" : "active-users")

  React.useEffect(() => {
    if (isModalOpen) {
      if (defaultTab === "super-admin" && !isSuperAdmin) {
        setActiveTab("active-users")
      } else {
        setActiveTab((defaultTab as TabId) || (isSuperAdmin ? "super-admin" : "active-users"))
      }
    }
  }, [isModalOpen, defaultTab, isSuperAdmin])

  // Close on Escape key
  React.useEffect(() => {
    if (!isModalOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isModalOpen, closeModal])

  if (!isModalOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* Modal */}
      <div
        className="relative z-10 flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
        style={{ width: "clamp(320px, 90vw, 1400px)" }}
      >
        {/* Sticky Modal Header */}
        <div className="sticky top-0 z-20 flex shrink-0 flex-col gap-0 border-b border-border/60 bg-background/95 backdrop-blur-xl">
          {/* Title Row */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/20">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  User Access & Control
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage portal access, roles, request workflow and permission levels
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={closeModal}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tab Bar */}
          <div className="flex border-t border-border/40 px-6">
            {visibleTabs.map((tab) => {
              const active = activeTab === tab.id
              const isAccessRequests = tab.id === "access-requests"
              const pendingCount = pendingRequests.length

              return (
                <button
                  key={tab.id}
                  id={`ua-tab-${tab.id}`}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all relative",
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <tab.icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.id === "super-admin" && (
                    <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                      Password &amp; ID
                    </span>
                  )}
                  <span className="sm:hidden">
                    {tab.id === "super-admin"
                      ? "Admin"
                      : tab.id === "user-access"
                      ? "Access"
                      : tab.id === "active-users"
                      ? "Users"
                      : "Requests"}
                  </span>

                  {isAccessRequests && pendingCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white shadow-xs">
                      {pendingCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {activeTab === "super-admin" && isSuperAdmin && (
            <ScrollArea className="flex-1 min-h-0">
              <TabSuperAdmin />
            </ScrollArea>
          )}
          {activeTab === "user-access" && <TabUserAccess />}
          {activeTab === "active-users" && (
            <ScrollArea className="flex-1 min-h-0">
              <TabActiveUsers />
            </ScrollArea>
          )}
          {activeTab === "access-requests" && <TabAccessRequests />}
        </div>
      </div>
    </div>
  )
}
