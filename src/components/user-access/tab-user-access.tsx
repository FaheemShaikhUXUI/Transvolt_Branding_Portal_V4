"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import {
  Mail, Globe, Building2, CheckSquare2, Square,
  AlertTriangle, Send, CheckCircle2, Edit3, X, Info, Sparkles, Check, Lock, Crown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { navigationConfig } from "@/config/navigation"
import { PERMISSION_DEFINITIONS } from "@/lib/user-access/mock-service"
import { useUserAccess } from "@/lib/user-access/user-access-context"
import { useAccessRequests } from "@/lib/access-requests/access-request-context"
import { useAuth } from "@/lib/auth/auth-context"
import { isInternalEmail, getUserType } from "@/lib/user-access/permissions-utils"
import { isUserSuperAdmin } from "@/lib/auth/superadmin-credentials"
import { SuperAdminCredentialsCard } from "./super-admin-credentials-card"
import type { AccessFormState, Permission, AccessScope } from "@/lib/user-access/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { RejectRequestDialog } from "./reject-request-dialog"

const PAGES = navigationConfig.map((n) => ({ href: n.href, title: n.title }))
const ALL_PERMISSIONS = PERMISSION_DEFINITIONS.map((p) => p.key)

const INITIAL_FORM: AccessFormState = {
  email: "",
  accessScope: "ALL_PAGES",
  selectedPages: [],
  selectedPermissions: ["VIEW_ALL"],
}

// ─── Lightweight & Smooth Arrow Flight Overlay ──────────────────────────────
interface PaperRocketOverlayProps {
  startPos: { x: number; y: number } | null
  onDone: () => void
}

function PaperRocketOverlay({ startPos, onDone }: PaperRocketOverlayProps) {
  const arrowRef = React.useRef<HTMLDivElement>(null)
  const onDoneRef = React.useRef(onDone)
  onDoneRef.current = onDone

  // Measure window safely
  const w = typeof window !== "undefined" ? window.innerWidth : 1920
  const h = typeof window !== "undefined" ? window.innerHeight : 1080
  const startX = startPos?.x ?? w * 0.78
  const startY = startPos?.y ?? h * 0.88

  // Smooth S-Curve waypoints:
  // Starts directly at the Send button's arrow position
  // 1. Curves up and Left
  // 2. Inflects and curves up and Right
  // 3. Exits top-right offscreen
  const p0 = { x: startX, y: startY }
  const c1 = { x: startX - 60, y: startY - 110 }
  const c2 = { x: startX - 260, y: startY - 170 }
  const pMid = { x: startX - 230, y: startY - 300 }
  const c3 = { x: startX - 200, y: startY - 430 }
  const c4 = { x: startX + 120, y: startY - 510 }
  const pEnd = { x: Math.max(w + 180, startX + 650), y: startY - 650 }

  function getPoint(tGlobal: number) {
    if (tGlobal <= 0.44) {
      const u = tGlobal / 0.44
      const inv = 1 - u
      const x = inv * inv * inv * p0.x + 3 * inv * inv * u * c1.x + 3 * inv * u * u * c2.x + u * u * u * pMid.x
      const y = inv * inv * inv * p0.y + 3 * inv * inv * u * c1.y + 3 * inv * u * u * c2.y + u * u * u * pMid.y
      const vx = 3 * inv * inv * (c1.x - p0.x) + 6 * inv * u * (c2.x - c1.x) + 3 * u * u * (pMid.x - c2.x)
      const vy = 3 * inv * inv * (c1.y - p0.y) + 6 * inv * u * (c2.y - c1.y) + 3 * u * u * (pMid.y - c2.y)
      return { x, y, angle: (Math.atan2(vy, vx) * 180) / Math.PI }
    } else {
      const u = (tGlobal - 0.44) / 0.56
      const inv = 1 - u
      const x = inv * inv * inv * pMid.x + 3 * inv * inv * u * c3.x + 3 * inv * u * u * c4.x + u * u * u * pEnd.x
      const y = inv * inv * inv * pMid.y + 3 * inv * inv * u * c3.y + 3 * inv * u * u * c4.y + u * u * u * pEnd.y
      const vx = 3 * inv * inv * (c3.x - pMid.x) + 6 * inv * u * (c4.x - c3.x) + 3 * u * u * (pEnd.x - c4.x)
      const vy = 3 * inv * inv * (c3.y - pMid.y) + 6 * inv * u * (c4.y - c3.y) + 3 * u * u * (pEnd.y - c4.y)
      return { x, y, angle: (Math.atan2(vy, vx) * 180) / Math.PI }
    }
  }

  // Precompute 10 soft smoke trail points along the curve
  const smokePoints = React.useMemo(() => {
    const pts: { x: number; y: number; delay: number; scale: number }[] = []
    for (let i = 0; i < 11; i++) {
      const u = i / 10
      const pt = getPoint(u)
      pts.push({
        x: pt.x,
        y: pt.y,
        delay: u * 1.05,
        scale: 0.8 + u * 1.1,
      })
    }
    return pts
  }, [startX, startY, w])

  React.useEffect(() => {
    let animId: number
    const DURATION = 1200 // 1.2s smooth and light flight
    const startTime = performance.now()

    function step(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / DURATION)

      // Continuous smoothstep easing — no intermediate stops
      const t = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2

      const pt = getPoint(t)
      // Smooth continuous scaling from 1.0 (exact button arrow size) to 2.4
      const scale = 1.0 + t * 1.45
      // Lucide Send icon points at -45 deg, so rotate by (angle + 45 deg)
      const rot = pt.angle + 45

      if (arrowRef.current) {
        arrowRef.current.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0) rotate(${rot}deg) scale(${scale})`
        arrowRef.current.style.opacity = progress > 0.9 ? `${(1 - progress) / 0.1}` : "1"
      }

      if (progress < 1) {
        animId = requestAnimationFrame(step)
      } else {
        onDoneRef.current()
      }
    }

    animId = requestAnimationFrame(step)

    // Hard fallback timer: guaranteed to close modal even if browser tab sleeps
    const safetyTimer = setTimeout(() => {
      onDoneRef.current()
    }, 1350)

    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(safetyTimer)
    }
  }, []) // Empty deps: runs once on mount, immune to parent re-renders!

  if (typeof document === "undefined") return null

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden">
      {/* Subtle backdrop dim */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px] transition-opacity duration-300 animate-in fade-in" />

      {/* Lightweight CSS Smoke Trail Puffs along the path */}
      <div className="absolute inset-0 pointer-events-none">
        {smokePoints.map((pt, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${pt.x}px`,
              top: `${pt.y}px`,
              width: `${22 * pt.scale}px`,
              height: `${22 * pt.scale}px`,
              marginLeft: `-${(22 * pt.scale) / 2}px`,
              marginTop: `-${(22 * pt.scale) / 2}px`,
              background: "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(241,245,249,0.5) 50%, transparent 80%)",
              filter: "blur(5px)",
              animation: `lightSmokePuff 0.85s ease-out forwards ${pt.delay.toFixed(3)}s`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes lightSmokePuff {
          0% {
            opacity: 0;
            transform: scale(0.35);
          }
          20% {
            opacity: 0.7;
            transform: scale(1.1);
          }
          100% {
            opacity: 0;
            transform: scale(2.2);
          }
        }
      `}</style>

      {/* The Same Arrow Button Icon flying smoothly from start to end */}
      <div
        ref={arrowRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          width: "24px",
          height: "24px",
          marginLeft: "-12px",
          marginTop: "-12px",
          transformOrigin: "center center",
          willChange: "transform, opacity",
        }}
      >
        <div className="flex items-center justify-center w-full h-full text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
          {/* Exact same Send arrow icon as the button */}
          <Send className="h-5 w-5 fill-white stroke-white stroke-[2.5]" />
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Amazing Interactive Email Input Component ──────────────────────────────
interface EmailInputProps {
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  disabled?: boolean
  error?: string
  touched?: boolean
  isLocked?: boolean
}

function AmazingEmailInput({ value, onChange, onBlur, disabled, error, touched, isLocked }: EmailInputProps) {
  const [focused, setFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  const isInternal = isInternalEmail(value)
  const hasValue = value.length > 0
  const hasAt = value.includes("@")

  function appendDomain(domain: string) {
    if (!value) {
      onChange("user" + domain)
    } else if (hasAt) {
      const prefix = value.split("@")[0]
      onChange(prefix + domain)
    } else {
      onChange(value + domain)
    }
    inputRef.current?.focus()
  }

  function clearEmail() {
    onChange("")
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* Main Interactive Card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
          focused
            ? "border-primary bg-primary/[0.02] shadow-[0_0_25px_rgba(0,0,0,0.08)] ring-4 ring-primary/10"
            : error && touched
            ? "border-destructive/70 bg-destructive/[0.02] ring-2 ring-destructive/10"
            : hasValue && emailValid
            ? isInternal
              ? "border-emerald-500/60 bg-emerald-500/[0.02] ring-2 ring-emerald-500/10"
              : "border-amber-500/60 bg-amber-500/[0.02] ring-2 ring-amber-500/10"
            : "border-border bg-card/80 hover:border-border/90 hover:bg-muted/20"
        )}
      >
        {/* Subtle Top Gradient Accent Bar */}
        <div
          className={cn(
            "h-1 w-full transition-all duration-500",
            focused
              ? "bg-gradient-to-r from-primary via-sky-500 to-primary"
              : error && touched
              ? "bg-destructive"
              : hasValue && emailValid
              ? isInternal
                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : "bg-gradient-to-r from-amber-500 to-orange-400"
              : "bg-transparent"
          )}
        />

        <div className="p-4 sm:p-5">
          {/* Header Row: Label & Live Detection Badge */}
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-300",
                  focused
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <label
                  htmlFor="ua-email"
                  className="cursor-pointer text-xs font-bold uppercase tracking-wider text-foreground"
                >
                  Recipient Email
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Corporate or external account
                </p>
              </div>
            </div>

            {/* Dynamic Status / Domain Pill */}
            <div>
              {isLocked ? (
                <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                  <Lock className="h-3 w-3 text-primary" />
                  <span>Request Locked</span>
                </div>
              ) : hasValue && emailValid ? (
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-xs animate-in fade-in zoom-in-95 duration-200",
                    isInternal
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                  )}
                >
                  {isInternal ? (
                    <>
                      <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>In-House Person (@transvolt.in)</span>
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 ml-0.5" />
                    </>
                  ) : (
                    <>
                      <Globe className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      <span>External Partner</span>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary/70" />
                  <span>Auto-detect Domain</span>
                </div>
              )}
            </div>
          </div>

          {/* Actual Input Container */}
          <div className="relative mt-2 flex items-center rounded-xl border border-input bg-background/90 px-3.5 py-2.5 shadow-xs transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <input
              ref={inputRef}
              id="ua-email"
              type="email"
              placeholder="e.g. name@transvolt.in or partner@client.com"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false)
                onBlur()
              }}
              disabled={disabled}
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50"
              autoComplete="email"
            />

            {/* Clear Button */}
            {hasValue && !disabled && (
              <button
                type="button"
                onClick={clearEmail}
                className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Clear email"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Valid Checkmark Icon / Lock Indicator */}
            {isLocked ? (
              <div className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary" title="Email locked from access request">
                <Lock className="h-3.5 w-3.5" />
              </div>
            ) : hasValue && emailValid ? (
              <div className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            ) : null}
          </div>

          {/* Quick Domain Completion Chips */}
          {!hasAt && !isLocked && (
            <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-muted-foreground text-[11px]">Quick suggestion:</span>
              <button
                type="button"
                onClick={() => appendDomain("@transvolt.in")}
                className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
              >
                + @transvolt.in
                <span className="text-[10px] opacity-75 font-normal">(In-House)</span>
              </button>
              <button
                type="button"
                onClick={() => appendDomain("@gmail.com")}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-muted-foreground transition-all hover:border-primary/30 hover:bg-muted hover:text-foreground active:scale-95"
              >
                + @gmail.com
              </button>
            </div>
          )}

          {/* Helper / Error Status Text */}
          <div className="mt-2.5">
            {isLocked ? (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                Email populated automatically from access request 🔒 (Super Admin review active)
              </p>
            ) : touched && error ? (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            ) : hasValue && emailValid ? (
              <p
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  isInternal
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-amber-700 dark:text-amber-300"
                )}
              >
                {isInternal
                  ? "✓ Internal Transvolt user verified — grants corporate access permissions."
                  : "✓ External partner detected — grants restricted portal access invitation."}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Enter the email address of the team member or external vendor to configure access.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main TabUserAccess Component ───────────────────────────────────────────
export function TabUserAccess() {
  const { user } = useAuth()
  const isSuperAdmin = isUserSuperAdmin(user)
  const {
    addUser,
    updateUser,
    editingUser,
    clearEdit,
    closeModal,
    activeAccessRequest,
    clearAccessRequest,
  } = useUserAccess()
  const { approveRequest, rejectRequest } = useAccessRequests()

  const [form, setForm] = React.useState<AccessFormState>(INITIAL_FORM)
  const [emailTouched, setEmailTouched] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [emailError, setEmailError] = React.useState("")
  const [showRocket, setShowRocket] = React.useState(false)
  const [rocketStartPos, setRocketStartPos] = React.useState<{ x: number; y: number } | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false)
  const [isRejecting, setIsRejecting] = React.useState(false)
  const sendBtnRef = React.useRef<HTMLButtonElement>(null)

  // Populate form when editing or reviewing access request
  React.useEffect(() => {
    if (activeAccessRequest) {
      setForm({
        email: activeAccessRequest.email,
        accessScope: "ALL_PAGES",
        selectedPages: [],
        selectedPermissions: ["VIEW_ALL", "DOWNLOAD", "SHARE"],
      })
      setEmailTouched(true)
    } else if (editingUser) {
      setForm({
        email: editingUser.email,
        accessScope: editingUser.accessScope,
        selectedPages: editingUser.pages,
        selectedPermissions: editingUser.permissions,
        editingUserId: editingUser.id,
      })
      setEmailTouched(true)
    } else {
      setForm(INITIAL_FORM)
      setEmailTouched(false)
    }
  }, [activeAccessRequest, editingUser])

  const isEditing = !!editingUser
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
  const userType = form.email ? getUserType(form.email) : null

  function setEmail(v: string) {
    setForm((f) => ({ ...f, email: v }))
    setEmailError("")
  }

  function setScope(v: AccessScope) {
    setForm((f) => ({
      ...f,
      accessScope: v,
      selectedPages: v === "ALL_PAGES" ? [] : f.selectedPages,
    }))
  }

  function togglePage(href: string) {
    setForm((f) => ({
      ...f,
      selectedPages: f.selectedPages.includes(href)
        ? f.selectedPages.filter((p) => p !== href)
        : [...f.selectedPages, href],
    }))
  }

  function togglePermission(p: Permission) {
    setForm((f) => ({
      ...f,
      selectedPermissions: f.selectedPermissions.includes(p)
        ? f.selectedPermissions.filter((x) => x !== p)
        : [...f.selectedPermissions, p],
    }))
  }

  function selectAllPages() {
    setForm((f) => ({ ...f, selectedPages: PAGES.map((p) => p.href) }))
  }

  function clearPages() {
    setForm((f) => ({ ...f, selectedPages: [] }))
  }

  function selectAllPerms() {
    setForm((f) => ({ ...f, selectedPermissions: [...ALL_PERMISSIONS] }))
  }

  function clearPerms() {
    setForm((f) => ({ ...f, selectedPermissions: [] }))
  }

  function validate(): boolean {
    if (!form.email.trim()) {
      setEmailTouched(true)
      setEmailError("Email address is required.")
      toast.error("Please enter an email address.")
      return false
    }
    if (!emailValid) {
      setEmailTouched(true)
      setEmailError("Please enter a valid email address (e.g. name@transvolt.in).")
      toast.error("Invalid email address format.")
      return false
    }
    if (form.accessScope === "SPECIFIC_PAGES" && form.selectedPages.length === 0) {
      toast.error("Please select at least one page to grant access to.")
      return false
    }
    if (form.selectedPermissions.length === 0) {
      toast.error("Please select at least one permission control.")
      return false
    }
    return true
  }

  async function handleSendEmail() {
    if (!validate()) return
    setIsSubmitting(true)

    // Instantly capture the exact screen coordinate of the Send button arrow
    if (sendBtnRef.current) {
      const rect = sendBtnRef.current.getBoundingClientRect()
      setRocketStartPos({
        x: rect.left + 22,
        y: rect.top + rect.height / 2,
      })
    }

    // Instantly launch paper rocket S-curve animation upon click
    setShowRocket(true)

    try {
      if (isEditing && editingUser) {
        await updateUser(editingUser.id, form)
        clearEdit()
      } else if (activeAccessRequest) {
        await addUser(form, user?.email ?? "faheem.s@transvolt.in")
        await approveRequest(activeAccessRequest.id, user?.email ?? "faheem.s@transvolt.in")
        clearAccessRequest()
      } else {
        await addUser(form, user?.email ?? "admin")
      }
    } catch {
      toast.error("Failed to save access settings. Please try again.")
      setIsSubmitting(false)
      setShowRocket(false)
    }
  }

  function handleRocketDone() {
    const savedEmail = form.email
    const wasReviewing = !!activeAccessRequest
    setShowRocket(false)
    setIsSubmitting(false)
    setForm(INITIAL_FORM)
    setEmailTouched(false)
    closeModal()
    if (wasReviewing) {
      toast.success("Access Granted Successfully", {
        description: `Access has been granted to ${savedEmail}.`,
        duration: 5500,
      })
    } else {
      toast.success(`🎉 Access invitation sent successfully!`, {
        description: `Permissions for ${savedEmail} have been applied and notification email dispatched.`,
        duration: 5500,
      })
    }
  }

  function handleCancel() {
    clearEdit()
    clearAccessRequest()
    setForm(INITIAL_FORM)
    setEmailTouched(false)
    closeModal()
  }

  function handleDone() {
    clearEdit()
    clearAccessRequest()
    closeModal()
  }

  const handleConfirmReject = async () => {
    if (!activeAccessRequest) return
    setIsRejecting(true)
    try {
      await rejectRequest(activeAccessRequest.id, user?.email ?? "faheem.s@transvolt.in")
      toast.success(`Access request for ${activeAccessRequest.email} rejected.`)
      setRejectDialogOpen(false)
      clearAccessRequest()
      closeModal()
    } catch {
      toast.error("Failed to reject access request.")
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <>
      {/* Paper Rocket Flight & Smoke Animation */}
      {showRocket && <PaperRocketOverlay startPos={rocketStartPos} onDone={handleRocketDone} />}

      {/* Main Full-Height Container with dedicated scrolling */}
      <div className="flex h-full flex-col overflow-hidden">
        
        {/* Scrollable Form Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">

          {/* Reviewing access request notice */}
          {activeAccessRequest && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
              <div className="flex items-start sm:items-center gap-2.5">
                <Lock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
                <div className="text-xs text-amber-700 dark:text-amber-300">
                  <span>Reviewing access request for </span>
                  <strong className="font-bold text-foreground">
                    {activeAccessRequest.name || activeAccessRequest.email.split("@")[0]}
                  </strong>
                  <span className="text-muted-foreground font-mono ml-1.5">({activeAccessRequest.email})</span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Requested Access:</span>
                    <Badge variant="outline" className="border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-1.5 py-0">
                      {activeAccessRequest.accessFor || "Logo & Color / All"}
                    </Badge>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold shrink-0 self-start sm:self-center">
                Pending Review
              </Badge>
            </div>
          )}

          {/* Editing notice if editing an existing user */}
          {isEditing && (
            <div className="flex items-center justify-between rounded-xl border border-sky-400/40 bg-sky-500/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-sky-500" />
                <p className="text-sm font-medium text-sky-700 dark:text-sky-300">
                  Editing access permissions for <strong>{editingUser?.name || editingUser?.email}</strong>
                </p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* 👑 Super Admin Master Settings & Password (Exclusively visible to Super Admin in this form) */}
          {isSuperAdmin && (
            <div className="space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-4 shadow-xs">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/30">
                    <Crown className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-foreground">
                        Super Admin Settings &amp; Password Management
                      </h3>
                      <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[9px] font-bold px-1.5 py-0">
                        SUPER ADMIN ONLY
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Confidential master credentials. Invisible to other portal users. You can change your Super Admin User ID and Master Password here anytime.
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold gap-1">
                  <Lock className="h-3 w-3" />
                  Private Master Access
                </Badge>
              </div>

              <div className="pt-1">
                <SuperAdminCredentialsCard />
              </div>
            </div>
          )}

          {/* Step 1: User Email — Amazing Interactive UI */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                1
              </div>
              <h4 className="text-sm font-bold text-foreground">User Email</h4>
            </div>

            <AmazingEmailInput
              value={form.email}
              onChange={setEmail}
              onBlur={() => setEmailTouched(true)}
              disabled={isEditing || !!activeAccessRequest}
              isLocked={!!activeAccessRequest}
              error={emailError}
              touched={emailTouched}
            />
          </div>

          <Separator className="bg-border/50" />

          {/* Step 2: Page Access Scope */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                2
              </div>
              <h4 className="text-sm font-bold text-foreground">Page Access Scope</h4>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(["ALL_PAGES", "SPECIFIC_PAGES"] as AccessScope[]).map((scope) => {
                const selected = form.accessScope === scope
                return (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => setScope(scope)}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
                      selected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs"
                        : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                          selected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/40"
                        )}
                      >
                        {selected && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {scope === "ALL_PAGES" ? "All Pages" : "Specific Pages"}
                      </span>
                    </div>
                    <p className="pl-7 text-xs text-muted-foreground leading-relaxed">
                      {scope === "ALL_PAGES"
                        ? "User can access every page in the portal (current and future pages)."
                        : "Manually choose which pages this user can access."}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 3: Specific Pages Multi-Select (shown only when Specific Pages chosen) */}
          {form.accessScope === "SPECIFIC_PAGES" && (
            <>
              <Separator className="bg-border/50" />
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      3
                    </div>
                    <h4 className="text-sm font-bold text-foreground">
                      Select Pages
                      {form.selectedPages.length > 0 && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          ({form.selectedPages.length}/{PAGES.length})
                        </span>
                      )}
                    </h4>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAllPages}>
                      <CheckSquare2 className="mr-1 h-3.5 w-3.5" /> All
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearPages}>
                      <Square className="mr-1 h-3.5 w-3.5" /> Clear
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {PAGES.map((page) => {
                    const checked = form.selectedPages.includes(page.href)
                    return (
                      <label
                        key={page.href}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-all",
                          checked
                            ? "border-primary/60 bg-primary/10 ring-1 ring-primary/25"
                            : "border-border/60 bg-muted/20 hover:border-primary/30 hover:bg-muted/40"
                        )}
                      >
                        <Checkbox checked={checked} onCheckedChange={() => togglePage(page.href)} />
                        <span className="text-sm font-medium text-foreground">{page.title}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          <Separator className="bg-border/50" />

          {/* Step 4: Permission Controls */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {form.accessScope === "SPECIFIC_PAGES" ? "4" : "3"}
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  Permission Controls
                  {form.selectedPermissions.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      ({form.selectedPermissions.length}/{PERMISSION_DEFINITIONS.length})
                    </span>
                  )}
                </h4>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAllPerms}>
                  <CheckSquare2 className="mr-1 h-3.5 w-3.5" /> All
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearPerms}>
                  <Square className="mr-1 h-3.5 w-3.5" /> Clear
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PERMISSION_DEFINITIONS.map((perm) => {
                const checked = form.selectedPermissions.includes(perm.key)
                return (
                  <label
                    key={perm.key}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all",
                      checked
                        ? perm.dangerous
                          ? "border-amber-500/60 bg-amber-500/10 ring-1 ring-amber-400/30"
                          : "border-primary/60 bg-primary/10 ring-1 ring-primary/25"
                        : perm.dangerous
                        ? "border-amber-400/25 bg-amber-500/[0.02] hover:border-amber-400/40 hover:bg-amber-500/5"
                        : "border-border/60 bg-muted/20 hover:border-primary/30 hover:bg-muted/40"
                    )}
                  >
                    <Checkbox
                      className="mt-0.5"
                      checked={checked}
                      onCheckedChange={() => togglePermission(perm.key)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{perm.label}</span>
                        {perm.dangerous && (
                          <Badge
                            variant="outline"
                            className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] px-1.5 py-0 h-4 gap-1 font-bold"
                          >
                            <AlertTriangle className="h-2.5 w-2.5" /> HIGH RISK
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {perm.description}
                      </p>
                      {perm.dangerous && perm.dangerNote && checked && (
                        <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                          ⚠ {perm.dangerNote}
                        </p>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Access Summary Card */}
          <div className="rounded-xl border border-border/70 bg-muted/25 p-4 shadow-xs">
            <div className="mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Access Summary</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg bg-background/60 px-3 py-2 border border-border/40">
                <span className="text-muted-foreground text-xs font-medium">Target Email:</span>
                <span className="font-semibold text-foreground truncate ml-2">
                  {form.email || <span className="italic text-muted-foreground/60">Not set</span>}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background/60 px-3 py-2 border border-border/40">
                <span className="text-muted-foreground text-xs font-medium">User Type:</span>
                <span className="font-semibold text-foreground">
                  {userType === "INTERNAL"
                    ? "Internal (Transvolt Team)"
                    : userType === "EXTERNAL"
                    ? "External Collaborator"
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background/60 px-3 py-2 border border-border/40">
                <span className="text-muted-foreground text-xs font-medium">Page Access:</span>
                <span className="font-semibold text-foreground">
                  {form.accessScope === "ALL_PAGES"
                    ? "All Pages (Full Scope)"
                    : form.selectedPages.length === 0
                    ? "None selected"
                    : `${form.selectedPages.length} specific page(s)`}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background/60 px-3 py-2 border border-border/40">
                <span className="text-muted-foreground text-xs font-medium">Permissions:</span>
                <span className="font-semibold text-foreground">
                  {form.selectedPermissions.length === 0
                    ? "None selected"
                    : `${form.selectedPermissions.length} of ${PERMISSION_DEFINITIONS.length} active`}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Fixed Bottom Action Bar: Always Visible at bottom ── */}
        <div className="shrink-0 border-t border-border/70 bg-background/95 backdrop-blur-xl px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 z-10 shadow-lg">
          {/* Reject Request (When reviewing pending request) */}
          {activeAccessRequest && (
            <Button
              id="ua-reject-request-btn"
              type="button"
              variant="outline"
              className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive mr-auto font-semibold text-xs h-10"
              onClick={() => setRejectDialogOpen(true)}
              disabled={isSubmitting || isRejecting}
            >
              <AlertTriangle className="h-4 w-4" />
              Reject Request
            </Button>
          )}

          {/* Cancel */}
          <Button
            id="ua-cancel-btn"
            variant="ghost"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleCancel}
            disabled={isSubmitting || isRejecting}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>

          {/* Done */}
          <Button
            id="ua-done-btn"
            variant="outline"
            className="gap-2 font-medium"
            onClick={handleDone}
            disabled={isSubmitting || isRejecting}
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Done
          </Button>

          {/* Send Email / Approve & Create Access — Main CTA */}
          <Button
            ref={sendBtnRef}
            id="ua-send-email-btn"
            className="group gap-2 font-bold px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25 transition-all duration-200 active:scale-95"
            onClick={handleSendEmail}
            disabled={isSubmitting || isRejecting}
          >
            {isSubmitting && !showRocket ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                {activeAccessRequest ? "Approving Access..." : "Sending Invitation..."}
              </>
            ) : (
              <>
                <Send className={cn("h-4 w-4 transition-all duration-200", showRocket && "opacity-0 scale-0")} />
                {activeAccessRequest
                  ? "Approve & Create Access"
                  : isEditing
                  ? "Update Access"
                  : "Send Email"}
              </>
            )}
          </Button>
        </div>

      </div>

      {/* Rejection Confirmation Dialog */}
      <RejectRequestDialog
        isOpen={rejectDialogOpen}
        email={activeAccessRequest?.email || ""}
        onConfirm={handleConfirmReject}
        onCancel={() => setRejectDialogOpen(false)}
        isRejecting={isRejecting}
      />
    </>
  )
}
