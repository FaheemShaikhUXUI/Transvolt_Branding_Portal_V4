"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Share2, Clock, Copy, Check, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

interface ShareLinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
}

export function ShareLinkModal({
  open,
  onOpenChange,
  fileName,
}: ShareLinkModalProps) {
  const [copied, setCopied] = React.useState(false)
  const [allowDownload, setAllowDownload] = React.useState(true)

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/share/eva-${Date.now().toString(36)}`
    : "https://portal.transvolt.com/share/eva-temp"

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success("Temporary 6-hour share link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader className="border-b border-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/15 text-blue-600">
              <Share2 className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              File Share for 6 Hour Link
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Generate a secure, time-limited download link with automatic 6-hour expiration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-3 text-xs">
          <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Link Expiration: 6 Hours from now</span>
            </div>
            <span className="text-[10px] font-mono bg-blue-500/20 px-2 py-0.5 rounded text-blue-700 dark:text-blue-300">
              05:59:59
            </span>
          </div>

          <div>
            <span className="font-bold text-muted-foreground">Generated Share URL</span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Input
                readOnly
                value={shareUrl}
                className="font-mono text-xs h-9 bg-muted/30 select-all"
              />
              <Button
                size="sm"
                onClick={handleCopy}
                className="h-9 px-3.5 bg-[#548235] hover:bg-[#548235]/90 text-white shrink-0 font-bold"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20">
              <span className="font-medium text-foreground">Allow recipient to download raw vector format</span>
              <Checkbox
                checked={allowDownload}
                onCheckedChange={(c) => setAllowDownload(Boolean(c))}
              />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Transvolt Access Control: Encrypted with temporary token session</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border/70">
          <Button size="sm" onClick={() => onOpenChange(false)} className="h-9">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
