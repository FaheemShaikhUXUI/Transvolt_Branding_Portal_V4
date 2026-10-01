"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Share2, Clock, Copy, Check, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface ShareAudioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shareTitle: string
  companyName?: string
  folderName?: string
  upTracks?: any[]
  downTracks?: any[]
  otherTracks?: any[]
}

export function ShareAudioModal({
  open,
  onOpenChange,
  shareTitle,
  companyName,
  folderName,
  upTracks = [],
  downTracks = [],
  otherTracks = [],
}: ShareAudioModalProps) {
  const [shareUrl, setShareUrl] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setCopied(false)
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
      const timestamp = Date.now() + 6 * 60 * 60 * 1000 // 6 hours expiration
      const id = Math.random().toString(36).substring(2, 10)
      const url = `${origin}/share/audio/${id}?t=${timestamp}`
      setShareUrl(url)

      // Save share snapshot into localStorage
      try {
        const payload = {
          id,
          companyName: companyName || "Transvolt Mobility Private Limited",
          folderName: folderName || "Route 1",
          routeTitle: shareTitle,
          upTracks: upTracks || [],
          downTracks: downTracks || [],
          otherTracks: otherTracks || [],
          createdAt: Date.now(),
        }
        localStorage.setItem(`branding_share_audio_${id}_data`, JSON.stringify(payload))
        localStorage.setItem(`branding_share_audio_${id}_time`, Date.now().toString())
      } catch (err) {
        console.error("Failed to save share snapshot:", err)
      }
    }
  }, [open])

  const handleCopy = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success("6-Hour Shareable Link copied to clipboard!")
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card text-card-foreground border-border shadow-2xl p-6 rounded-2xl">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4472C4]/10 text-[#4472C4]">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[#4472C4]">
                Share Audio Assets (6 Hours)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Generate a temporary 6-hour shareable link for audio tracks and stop announcements.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-left">
          {/* Target Summary */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 text-xs">
            <p className="font-bold text-foreground truncate">{shareTitle}</p>
            {companyName && (
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Company: <strong className="text-foreground">{companyName}</strong> &middot; Route:{" "}
                <strong className="text-foreground">{folderName || "Route 1"}</strong>
              </p>
            )}
            <p className="text-muted-foreground text-[11px] mt-0.5">
              Included: <strong className="text-foreground">{upTracks.length} Up</strong> stops &amp;{" "}
              <strong className="text-foreground">{downTracks.length} Down</strong> stops
            </p>
          </div>

          {/* Expiry Warning Callout */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs">
            <Clock className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-bold">Shareable link expires in: 6 Hours</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                External stakeholders can listen &amp; download both Up &amp; Down lists with interactive
                audio playback before access automatically expires.
              </p>
            </div>
          </div>

          {/* Link Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">
              Shareable URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="h-10 w-full rounded-lg border border-border/80 bg-muted/20 px-3 text-xs font-mono text-foreground focus:outline-none"
              />
              <Button
                type="button"
                onClick={handleCopy}
                className="h-10 px-4 bg-[#4472C4] hover:bg-[#3b63ab] text-white font-bold text-xs rounded-lg shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border/70 flex items-center justify-between sm:justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-4 text-xs cursor-pointer"
          >
            Close
          </Button>

          {shareUrl && (
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
            >
              <span>Open Shared Link</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
