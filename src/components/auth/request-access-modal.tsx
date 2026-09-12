"use client"

import * as React from "react"
import { X, Mail, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, User, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAccessRequests } from "@/lib/access-requests/access-request-context"
import { toast } from "sonner"

interface RequestAccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RequestAccessModal({ isOpen, onClose }: RequestAccessModalProps) {
  const { submitRequest } = useAccessRequests()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [accessFor, setAccessFor] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [submittedData, setSubmittedData] = React.useState<{ name: string; email: string; accessFor: string }>({
    name: "",
    email: "",
    accessFor: "",
  })

  // Reset states on open/close
  React.useEffect(() => {
    if (isOpen) {
      setName("")
      setEmail("")
      setAccessFor("")
      setErrorMessage(null)
      setIsSubmitted(false)
      setIsSubmitting(false)
    }
  }, [isOpen])

  // Close on Escape
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const cleanEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!cleanEmail) {
      setErrorMessage("Email address is required.")
      return
    }
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address.")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitRequest({
        email: cleanEmail,
        name: name.trim(),
        accessFor: accessFor.trim() || "Logo & Color / All",
      })
      if (!result.success) {
        setErrorMessage(result.message)
        setIsSubmitting(false)
        return
      }

      // Success
      setSubmittedData({
        name: name.trim() || cleanEmail.split("@")[0],
        email: cleanEmail,
        accessFor: accessFor.trim() || "Logo & Color / All",
      })
      setIsSubmitted(true)
      setIsSubmitting(false)
      toast.success("Access request sent to administrator")
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-[#0d1527]/95 p-6 shadow-2xl backdrop-blur-2xl text-white animate-in zoom-in-95 duration-200"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(59, 130, 246, 0.15)",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {!isSubmitted ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Request Portal Access
                </h3>
                <p className="text-xs text-slate-400">
                  Transvolt Mobility Branding & Asset Portal
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Submit your details and required modules. Your request will be routed directly to the Super Admin for permission assignment.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* 1. Full Name */}
              <div className="space-y-1">
                <Label htmlFor="req-name" className="text-[10px] font-extrabold uppercase tracking-widest text-[#94a3b8]">
                  FULL NAME
                </Label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 h-4 w-4 text-[#94a3b8] pointer-events-none" />
                  <Input
                    id="req-name"
                    type="text"
                    placeholder="e.g. Rohit Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border border-white/15 text-white placeholder:text-[#64748b] h-10 pl-10 pr-4 rounded-xl focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:border-[#3B82F6] text-xs sm:text-sm font-medium transition-all"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                  />
                </div>
              </div>

              {/* 2. Email Address */}
              <div className="space-y-1">
                <Label htmlFor="req-email" className="text-[10px] font-extrabold uppercase tracking-widest text-[#94a3b8]">
                  EMAIL ADDRESS <span className="text-rose-400">*</span>
                </Label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-[#94a3b8] pointer-events-none" />
                  <Input
                    id="req-email"
                    type="email"
                    required
                    placeholder="name@transvolt.in or partner email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errorMessage) setErrorMessage(null)
                    }}
                    className="border border-white/15 text-white placeholder:text-[#64748b] h-10 pl-10 pr-4 rounded-xl focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:border-[#3B82F6] text-xs sm:text-sm font-medium transition-all"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                  />
                </div>
                {email.toLowerCase().includes("@transvolt.in") && (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span>Recognized as Transvolt In-House Team Member</span>
                  </div>
                )}
                {errorMessage && (
                  <div className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* 3. Want Access For ? Text Box */}
              <div className="space-y-1">
                <Label htmlFor="req-access-for" className="text-[10px] font-extrabold uppercase tracking-widest text-[#94a3b8]">
                  WANT ACCESS FOR ?
                </Label>
                <div className="relative flex items-center">
                  <Layers className="absolute left-3.5 h-4 w-4 text-[#94a3b8] pointer-events-none" />
                  <Input
                    id="req-access-for"
                    type="text"
                    placeholder="e.g. Logo & Color/All"
                    value={accessFor}
                    onChange={(e) => setAccessFor(e.target.value)}
                    className="border border-white/15 text-white placeholder:text-[#64748b] h-10 pl-10 pr-4 rounded-xl focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:border-[#3B82F6] text-xs sm:text-sm font-medium transition-all"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                  />
                </div>

                {/* Quick suggestion chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                  <span className="text-slate-500 text-[10px]">Quick Suggestions:</span>
                  {["Logo & Color/All", "All Pages", "Vehicle Branding", "Photo Vault"].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setAccessFor(chip)}
                      className="px-2 py-0.5 rounded-md border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 hover:text-white transition-all text-[10px] cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-[11px] text-slate-400 leading-normal">
                🔒 <strong className="text-slate-300">No password required:</strong> Super Admin will review your identity and configure role-based access before activating your account.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="h-10 px-4 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-5 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all"
                  style={{
                    background: "linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)",
                    boxShadow: "0 8px 20px -4px rgba(37, 99, 235, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.2)"
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Request Access
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="py-2 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight mb-2">
              Access Request Submitted
            </h3>

            <p className="text-xs text-slate-300 mb-4 px-2 leading-relaxed">
              Your access request has been sent to the administrator. You will be notified once your access is approved.
            </p>

            <div className="mb-6 space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300">
              {submittedData.name && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Name:</span>
                  <span className="font-semibold text-white truncate max-w-[210px]">
                    {submittedData.name}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-emerald-400 truncate max-w-[210px]">
                  {submittedData.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Want Access For:</span>
                <span className="font-semibold text-cyan-400 truncate max-w-[210px]">
                  {submittedData.accessFor}
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={onClose}
              className="w-full h-11 text-white font-semibold rounded-xl text-xs bg-slate-800 hover:bg-slate-700 border border-white/15 transition-all cursor-pointer"
            >
              Return to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
