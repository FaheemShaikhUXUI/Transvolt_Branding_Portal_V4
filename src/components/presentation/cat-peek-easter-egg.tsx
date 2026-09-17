"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CatPeekEasterEggProps {
  isOpen: boolean
  isWhite?: boolean
}

/**
 * Cat Animation Easter Egg:
 * 1. Stays for exactly 5 seconds when appearing, then slowly sinks down.
 * 2. Small red dot at bottom-left side triggers it immediately when clicked.
 * 3. Also randomly and infrequently emerges on its own.
 */
export function CatPeekEasterEgg({ isOpen, isWhite }: CatPeekEasterEggProps) {
  const [catState, setCatState] = React.useState<"hidden" | "peeking" | "leaving">("hidden")

  const nextPeekTimer = React.useRef<NodeJS.Timeout | null>(null)
  const peekHoldTimer = React.useRef<NodeJS.Timeout | null>(null)
  const leaveResetTimer = React.useRef<NodeJS.Timeout | null>(null)

  const clearAllTimers = React.useCallback(() => {
    if (nextPeekTimer.current) clearTimeout(nextPeekTimer.current)
    if (peekHoldTimer.current) clearTimeout(peekHoldTimer.current)
    if (leaveResetTimer.current) clearTimeout(leaveResetTimer.current)
  }, [])

  const triggerPeek = React.useCallback(() => {
    clearAllTimers()
    setCatState("peeking")

    // Stay for exactly 5 seconds
    peekHoldTimer.current = setTimeout(() => {
      setCatState("leaving")

      // Once sinking animation completes (~1.4s), hide and schedule next random peek
      leaveResetTimer.current = setTimeout(() => {
        setCatState("hidden")
        scheduleRandomPeek(40, 85)
      }, 1400)
    }, 5000)
  }, [clearAllTimers])

  const scheduleRandomPeek = React.useCallback((minSec: number, maxSec: number) => {
    const delayMs = (Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec) * 1000
    nextPeekTimer.current = setTimeout(() => {
      triggerPeek()
    }, delayMs)
  }, [triggerPeek])

  React.useEffect(() => {
    if (!isOpen) {
      clearAllTimers()
      setCatState("hidden")
      return
    }

    // Schedule initial random peek after 12s - 24s
    scheduleRandomPeek(12, 24)

    return () => {
      clearAllTimers()
    }
  }, [isOpen, clearAllTimers, scheduleRandomPeek])

  if (!isOpen) return null

  const isVisible = catState === "peeking"

  return (
    <>
      {/* Small Red Dot at bottom-left side (static, no blinking): clicking triggers the cat */}
      <button
        type="button"
        onClick={triggerPeek}
        className="absolute bottom-[66px] left-3.5 sm:left-5 z-30 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 hover:bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.7)] hover:scale-125 active:scale-95 transition-transform cursor-pointer"
        title="🐾 Click to see the cat"
        aria-label="Trigger Cat Animation"
      />

      {/* Peeking Cat Element (70% Opacity) with nearby small gray text */}
      <div
        className={cn(
          "absolute bottom-[60px] left-6 sm:left-10 lg:left-14 z-25 select-none transition-all flex items-end gap-1.5 sm:gap-2",
          isVisible
            ? "translate-y-0 opacity-70 duration-[1400ms] ease-out pointer-events-auto"
            : "translate-y-[110%] opacity-0 duration-[1200ms] ease-in pointer-events-none"
        )}
        style={{
          filter: isWhite
            ? "drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
            : "drop-shadow(0 4px 14px rgba(0,0,0,0.9))"
        }}
        title="🐾 Meow!"
        onClick={triggerPeek}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cat-peek.png"
          alt="Peeking Cat"
          className="w-20 sm:w-24 md:w-28 h-auto object-contain transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          draggable={false}
        />

        {/* Small Gray Text nearby Cat (Text-only, no border or bg) */}
        <span
          className={cn(
            "mb-2.5 sm:mb-3 text-[11px] sm:text-xs font-normal tracking-wide whitespace-nowrap select-none transition-colors",
            isWhite
              ? "text-slate-500 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
              : "text-neutral-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
          )}
        >
          Hey Bro.. you are reading carefully na..
        </span>
      </div>
    </>
  )
}
