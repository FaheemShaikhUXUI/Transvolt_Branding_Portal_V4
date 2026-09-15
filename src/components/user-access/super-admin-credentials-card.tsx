"use client"

import * as React from "react"
import {
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  getSuperAdminCredentials,
  saveSuperAdminCredentials,
  verifySuperAdminPassword,
  resetSuperAdminCredentials,
  type SuperAdminCredentials,
  DEFAULT_SUPER_ADMIN_CREDENTIALS,
  isSuperAdminEmail,
} from "@/lib/auth/superadmin-credentials"
import { useAuth } from "@/lib/auth/auth-context"
import { cn } from "@/lib/utils"

export function SuperAdminCredentialsCard() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === "Super Admin" || (user?.email && isSuperAdminEmail(user.email))

  const [creds, setCreds] = React.useState<SuperAdminCredentials>(() => getSuperAdminCredentials())
  const [isEditing, setIsEditing] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  // Form states
  const [userId, setUserId] = React.useState(creds.email)
  const [name, setName] = React.useState(creds.name)
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  // Do not render anything if the user is not a Super Admin
  if (!isSuperAdmin) {
    return null
  }

  // Toggles for visibility
  const [showCurrentPw, setShowCurrentPw] = React.useState(false)
  const [showNewPw, setShowNewPw] = React.useState(false)
  const [showConfirmPw, setShowConfirmPw] = React.useState(false)

  const [isSaving, setIsSaving] = React.useState(false)

  // Sync when credentials change globally
  React.useEffect(() => {
    const handleUpdate = () => {
      const latest = getSuperAdminCredentials()
      setCreds(latest)
      setUserId(latest.email)
      setName(latest.name)
    }
    window.addEventListener("transvolt:superadmin-creds-updated", handleUpdate)
    return () => window.removeEventListener("transvolt:superadmin-creds-updated", handleUpdate)
  }, [])

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(creds.email)
    setCopied(true)
    toast.success("Super Admin User ID copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  // Password strength calculation
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: "Not set", color: "bg-muted" }
    let score = 0
    if (pw.length >= 8) score++
    if (pw.length >= 12) score++
    if (/[0-9]/.test(pw)) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++

    if (score <= 2) return { score: 1, label: "Weak", color: "bg-rose-500" }
    if (score <= 3) return { score: 2, label: "Medium", color: "bg-amber-500" }
    if (score <= 4) return { score: 3, label: "Strong", color: "bg-emerald-500" }
    return { score: 4, label: "Very Strong", color: "bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.6)]" }
  }

  const pwStrength = getPasswordStrength(newPassword)
  const isPwMismatch = newPassword && confirmPassword && newPassword !== confirmPassword

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanUserId = userId.trim().toLowerCase()
    const cleanName = name.trim()

    if (!cleanUserId) {
      toast.error("User ID / Login identifier cannot be empty.")
      return
    }

    if (!currentPassword) {
      toast.error("Please enter your Current Password to verify your identity.")
      return
    }

    if (!verifySuperAdminPassword(currentPassword)) {
      toast.error("Current password verification failed. Please check and try again.")
      return
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters long.")
        return
      }
      if (newPassword !== confirmPassword) {
        toast.error("New password and confirmation do not match.")
        return
      }
    }

    setIsSaving(true)

    try {
      const updated = saveSuperAdminCredentials({
        email: cleanUserId,
        name: cleanName || "Faheem Shaikh",
        ...(newPassword ? { password: newPassword } : {}),
      })

      setCreds(updated)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setIsEditing(false)

      toast.success(
        `Super Admin credentials updated successfully! New login ID: ${updated.email}`
      )
    } catch {
      toast.error("Failed to update credentials. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetToDefault = () => {
    if (
      window.confirm(
        "Are you sure you want to reset Super Admin credentials to factory defaults (faheem.s@transvolt.in)?\n\nThis will reset your login email to 'faheem.s@transvolt.in' and password to factory default."
      )
    ) {
      const defaultCreds = resetSuperAdminCredentials()
      setCreds(defaultCreds)
      setUserId(defaultCreds.email)
      setName(defaultCreds.name)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setIsEditing(false)
      toast.success("Super Admin credentials successfully restored to factory defaults!")
    }
  }

  const handleCancel = () => {
    setUserId(creds.email)
    setName(creds.name)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setIsEditing(false)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-b from-primary/[0.06] via-background to-background p-5 shadow-xs transition-all">
      {/* Glow accent */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />

      {/* Header bar */}
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
                Super Admin Credentials & Security Setting
              </h4>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold"
              >
                <ShieldCheck className="mr-1 h-3 w-3" />
                Active Protection
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Change your Super Admin User ID (Login Email/Identifier) and master password directly
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!isEditing ? (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-1.5 shadow-sm font-semibold rounded-xl"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Change User ID / Password</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="gap-1 rounded-xl text-xs"
            >
              <ChevronUp className="h-3.5 w-3.5" />
              <span>Collapse Form</span>
            </Button>
          )}
        </div>
      </div>

      {/* Current Active Credentials Readout Strip */}
      <div className="relative mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3 rounded-xl border border-border/60 bg-muted/30 p-3">
        {/* User ID */}
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Current User ID / Login
          </span>
          <div className="flex items-center gap-1.5 min-w-0">
            <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-mono text-xs font-semibold text-foreground truncate" title={creds.email}>
              {creds.email}
            </span>
            <button
              type="button"
              onClick={handleCopyUserId}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors ml-auto shrink-0"
              title="Copy User ID"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Display Name */}
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Admin Profile Name
          </span>
          <div className="flex items-center gap-1.5 min-w-0">
            <User className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs font-semibold text-foreground truncate">
              {creds.name || "Faheem Shaikh"}
            </span>
          </div>
        </div>

        {/* Password status */}
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Master Password
          </span>
          <div className="flex items-center gap-1.5 min-w-0">
            <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="font-mono text-xs font-semibold text-foreground tracking-widest">
              ••••••••••••
            </span>
            <Badge variant="secondary" className="ml-auto text-[9px] px-1.5 py-0 h-4 shrink-0 font-normal">
              {creds.updatedAt ? "Updated" : "Default"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Edit Form Panel */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="relative mt-5 space-y-4 rounded-xl border border-primary/20 bg-background/80 p-4 shadow-sm backdrop-blur-xs animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold text-foreground">
                Update Super Admin Account Credentials
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Instant portal sync
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Field 1: User ID / Login Identifier */}
            <div className="space-y-1.5">
              <label
                htmlFor="sa-user-id"
                className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center justify-between"
              >
                <span>Super Admin User ID / Email *</span>
                <span className="text-[10px] font-normal text-muted-foreground">Used to log in</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="sa-user-id"
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="faheem.s@transvolt.in"
                  className="pl-9 text-xs sm:text-sm font-medium h-9 rounded-xl"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Can be your Transvolt email (e.g. <span className="font-mono text-foreground">faheem.s@transvolt.in</span>) or an admin user handle.
              </p>
            </div>

            {/* Field 2: Display Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="sa-display-name"
                className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center justify-between"
              >
                <span>Display Name</span>
                <span className="text-[10px] font-normal text-muted-foreground">Card & Header title</span>
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="sa-display-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Faheem Shaikh"
                  className="pl-9 text-xs sm:text-sm font-medium h-9 rounded-xl"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Your full name shown on the Super Admin card and header badges.
              </p>
            </div>
          </div>

          {/* Current Password Verification (Mandatory for security) */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Identity Verification Required</span>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="sa-current-pw"
                className="text-[11px] font-semibold text-foreground flex items-center justify-between"
              >
                <span>Enter Current Master Password *</span>
                <span className="text-[10px] text-muted-foreground">Default: faheemmahi8080</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="sa-current-pw"
                  type={showCurrentPw ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="pl-9 pr-9 text-xs sm:text-sm font-medium h-9 rounded-xl bg-background"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-2.5 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                  title={showCurrentPw ? "Hide password" : "Show password"}
                >
                  {showCurrentPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* New Password & Confirmation */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
            {/* Field: New Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="sa-new-pw"
                className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center justify-between"
              >
                <span>New Master Password</span>
                <span className="text-[10px] font-normal text-muted-foreground">Leave blank to keep unchanged</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="sa-new-pw"
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 chars)"
                  className="pl-9 pr-9 text-xs sm:text-sm font-medium h-9 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-2.5 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                  title={showNewPw ? "Hide password" : "Show password"}
                >
                  {showNewPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword && (
                <div className="space-y-1 pt-1 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Strength:</span>
                    <span className="font-semibold text-foreground">{pwStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full transition-all duration-300", pwStrength.color)}
                      style={{ width: `${(pwStrength.score / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Field: Confirm New Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="sa-confirm-pw"
                className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center justify-between"
              >
                <span>Confirm New Password</span>
                {newPassword && confirmPassword && (
                  <span
                    className={cn(
                      "text-[10px] font-semibold",
                      newPassword === confirmPassword ? "text-emerald-500" : "text-rose-500"
                    )}
                  >
                    {newPassword === confirmPassword ? "✓ Passwords Match" : "✕ Must match"}
                  </span>
                )}
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="sa-confirm-pw"
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  disabled={!newPassword}
                  className="pl-9 pr-9 text-xs sm:text-sm font-medium h-9 rounded-xl disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-2.5 text-muted-foreground hover:text-foreground p-1 cursor-pointer disabled:opacity-50"
                  disabled={!newPassword}
                  title={showConfirmPw ? "Hide password" : "Show password"}
                >
                  {showConfirmPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Re-enter identical password to avoid lock-outs.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetToDefault}
              className="text-muted-foreground hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 rounded-xl text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to Factory Defaults</span>
            </Button>

            <div className="flex items-center gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving || (!!newPassword && newPassword !== confirmPassword)}
                className="rounded-xl text-xs font-bold gap-1.5 shadow-md"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{isSaving ? "Updating..." : "Save & Update Credentials"}</span>
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
