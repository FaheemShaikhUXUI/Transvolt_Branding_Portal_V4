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
import { Share2, Clock, Copy, Check, ShieldCheck } from "lucide-react"
import { orgChartService } from "@/lib/org-chart/org-chart-service"
import { toast } from "sonner"

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chartId: string | null
  chartTitle: string
}

export function ShareChartModal({
  open,
  onOpenChange,
  chartId,
  chartTitle,
}: ShareModalProps) {
  const [shareUrl, setShareUrl] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (open && chartId) {
      setIsLoading(true)
      setCopied(false)
      orgChartService
        .generateShareLink(chartId)
        .then((res) => {
          setShareUrl(res.url)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
          toast.error("Failed to generate share link.")
        })
    }
  }, [open, chartId])

  const handleCopy = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success("Share link copied to clipboard!")
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Share Organization Chart</DialogTitle>
              <DialogDescription className="text-xs">
                Generate a secure, read-only link for external stakeholders or internal team members.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Target Chart summary */}
          <div className="rounded-lg border bg-muted/40 p-3 text-xs">
            <p className="font-semibold text-foreground truncate">{chartTitle}</p>
            <p className="text-muted-foreground text-[11px] mt-0.5">
              Read-only viewer with pan, zoom, and high-resolution export.
            </p>
          </div>

          {/* Expiry Warning Callout */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs">
            <Clock className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-bold">Shareable link expires in: 6 hours</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                For security compliance, links are temporary and cannot be modified by the recipient.
              </p>
            </div>
          </div>

          {/* Link Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Shareable URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={isLoading ? "Generating secure link..." : shareUrl}
                className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-xs font-mono select-all focus:outline-none"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCopy}
                disabled={isLoading || !shareUrl}
                className="h-9 px-3 text-xs font-bold gap-1.5 bg-[#4472C4] hover:bg-[#3b63ab] text-white cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy Link"}</span>
              </Button>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
