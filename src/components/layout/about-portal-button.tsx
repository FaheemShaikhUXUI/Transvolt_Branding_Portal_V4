"use client"

import * as React from "react"
import { MonitorPlay } from "lucide-react"
import { InteractivePresentationDeck } from "@/components/presentation/interactive-presentation-deck"
import { PresentationTransition } from "@/components/presentation/presentation-transition"
import { cn } from "@/lib/utils"

interface AboutPortalButtonProps {
  isCollapsed?: boolean
}

export function AboutPortalButton({ isCollapsed = false }: AboutPortalButtonProps) {
  const [isPresentationOpen, setIsPresentationOpen] = React.useState(false)
  const [isTransitioning, setIsTransitioning] = React.useState(false)

  const handleLaunchPresentation = () => {
    if (isTransitioning || isPresentationOpen) return
    setIsTransitioning(true)

    // 50% slower, extra smooth cinematic transition: allows user to enjoy the unfolding stage & slide reveal
    setTimeout(() => {
      setIsPresentationOpen(true)
    }, 1650)

    // Clean up transition overlay once deck is fully active
    setTimeout(() => {
      setIsTransitioning(false)
    }, 2250)
  }

  const handleClosePresentation = () => {
    setIsPresentationOpen(false)
    setIsTransitioning(false)
  }

  return (
    <>
      {/* ── BUTTON (With distinct light gray background) ──────────────── */}
      <div className={cn("px-2.5 py-1", isCollapsed && "px-1.5")}>
        {isCollapsed ? (
          /* Collapsed Mode: Clean light-gray icon button */
          <button
            type="button"
            onClick={handleLaunchPresentation}
            className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-neutral-100 hover:bg-neutral-200/90 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/90 text-foreground border border-neutral-200/90 dark:border-neutral-700/80 shadow-2xs transition-colors cursor-pointer"
            title="About This Portal"
            aria-label="About This Portal"
          >
            <MonitorPlay className="h-[18px] w-[18px] text-foreground/80" />
          </button>
        ) : (
          /* Expanded Mode: Distinct light-gray background tile */
          <button
            type="button"
            onClick={handleLaunchPresentation}
            className="group flex items-center h-10 w-full px-2.5 rounded-xl text-xs font-semibold transition-all duration-150 select-none overflow-hidden bg-neutral-100/90 hover:bg-neutral-200/90 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/80 text-foreground border border-neutral-200/90 dark:border-neutral-700/80 shadow-2xs cursor-pointer"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-neutral-200/70 dark:bg-neutral-700/70">
              <MonitorPlay className="h-3.5 w-3.5 text-foreground/85 group-hover:text-foreground transition-colors" />
            </div>
            <span className="ml-2.5 tracking-tight text-foreground truncate">
              About This Portal
            </span>
          </button>
        )}
      </div>

      {/* ── CINEMATIC KEYNOTE STAGE EXPAND TRANSITION (50% SLOWER) ──── */}
      <PresentationTransition isTransitioning={isTransitioning} />

      {/* ── FULL INTERACTIVE PRESENTATION DECK (Starts on Slide 0) ─── */}
      <InteractivePresentationDeck
        isOpen={isPresentationOpen}
        onClose={handleClosePresentation}
      />
    </>
  )
}

