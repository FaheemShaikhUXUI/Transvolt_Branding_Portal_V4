"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

const RUN_INTERVAL_MS = 2 * 1000 // 2 seconds between runs
const DRIVE_DURATION_MS = 22000 // 22 seconds for ultra-smooth, slow majestic glide across the screen

export function VehicleLineArtRunner() {
  const pathname = usePathname()
  // Only render on Login Page; remove from inside the portal
  const isLoginPage = pathname === "/login"

  const [isDriving, setIsDriving] = React.useState(false)
  const [screenWidth, setScreenWidth] = React.useState(1920)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  const driveTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  // Track window width safely
  React.useEffect(() => {
    if (!isLoginPage) return
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isLoginPage])

  // Trigger vehicle drive sequence
  const startDrive = React.useCallback(() => {
    setIsDriving(true)

    if (driveTimerRef.current) clearTimeout(driveTimerRef.current)

    // After drive duration, reset position and schedule next run in 2 seconds
    driveTimerRef.current = setTimeout(() => {
      setIsDriving(false)

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        startDrive()
      }, RUN_INTERVAL_MS)
    }, DRIVE_DURATION_MS + 200)
  }, [])

  // Start the continuous loop on mount
  React.useEffect(() => {
    if (!isLoginPage) return

    // Initial start after a brief 1.5s delay on page load
    const initialDelay = setTimeout(() => {
      startDrive()
    }, 1500)

    // Listen for custom trigger if needed
    const handleCustomTrigger = () => {
      startDrive()
    }
    window.addEventListener("trigger-vehicle-line-art", handleCustomTrigger)

    return () => {
      clearTimeout(initialDelay)
      if (timerRef.current) clearTimeout(timerRef.current)
      if (driveTimerRef.current) clearTimeout(driveTimerRef.current)
      window.removeEventListener("trigger-vehicle-line-art", handleCustomTrigger)
    }
  }, [isLoginPage, startDrive])

  // Check if presentation deck is active
  const [isPresentationActive, setIsPresentationActive] = React.useState(false)

  React.useEffect(() => {
    if (!isLoginPage) return
    const checkState = () => {
      const modal = document.getElementById("presentation-deck")
      const hasClass = document.body.classList.contains("presentation-deck-open")
      setIsPresentationActive(Boolean(modal || hasClass))
    }
    checkState()
    const observer = new MutationObserver(checkState)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true })
    window.addEventListener("presentation-deck-toggle", checkState)
    return () => {
      observer.disconnect()
      window.removeEventListener("presentation-deck-toggle", checkState)
    }
  }, [isLoginPage])

  // If inside the portal or presentation is open, do not render vehicle line art runner
  if (!isLoginPage || isPresentationActive) {
    return null
  }

  // Standard size on login page (1.0x)
  const baseWidth = Math.min(480, Math.max(320, screenWidth * 0.28))
  const vehicleWidth = Math.round(baseWidth)
  const vehicleHeight = 44
  const wrapperHeight = 65

  return (
    <div
      id="vehicle-line-art-runner"
      data-vehicle-runner="true"
      aria-hidden="true"
      className="fixed inset-x-0 bottom-0 pointer-events-none z-40 overflow-hidden select-none"
      style={{
        height: `${wrapperHeight}px`,
        // Strictly NO backdrop blur or background dimming
        backgroundColor: "transparent",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
      }}
    >
      {/* Moving Vehicle Container */}
      <div
        className="absolute bottom-0 select-none pointer-events-none"
        style={{
          width: `${vehicleWidth}px`,
          height: `${vehicleHeight}px`,
          left: 0,
          // Moves from offscreen left (-vehicleWidth) to offscreen right (screenWidth + 20px)
          transform: isDriving
            ? `translateX(${screenWidth + 40}px)`
            : `translateX(-${vehicleWidth + 40}px)`,
          transition: isDriving
            ? `transform ${DRIVE_DURATION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
            : "none",
          willChange: "transform",
        }}
      >
        {/* Flipped from Left to Right (scaleX(1)) */}
        <div
          className="relative w-full h-full"
          style={{
            transform: "none",
            transformOrigin: "center center",
          }}
        >
          {/* Subtle soft tire contact shadow along the bottom */}
          <div
            className="absolute -bottom-0.5 inset-x-4 h-1 rounded-full opacity-40 blur-[1.5px]"
            style={{
              background: "radial-gradient(ellipse at center, rgba(84, 130, 53, 0.6) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
            }}
          />

          {/* Vehicle Line Art SVG — Touches bottom of screen directly */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/vehicle-line-art.svg"
            alt="Transvolt Vehicle Line Art"
            className="w-full h-full object-contain object-bottom drop-shadow-[0_2px_8px_rgba(84,130,53,0.35)]"
            draggable={false}
          />
        </div>
      </div>
    </div>
  )
}
