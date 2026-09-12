"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const IDLE_TIMEOUT_MS = 59 * 1000 // 59 seconds inactivity threshold
const WALK_DURATION_MS = 18 * 1000 // 18 seconds to leisurely stroll across the screen
const SPRINT_OUT_DURATION_MS = 420 // Fast sprint out on click

// Exactly 7 small white birds randomly flying in the upper empty space
const BIRDS = [
  { id: 1, top: "12%", width: 25, height: 14, duration: 12.0, delay: 0.0, flapDuration: 0.36, waveDuration: 2.6 },
  { id: 2, top: "18%", width: 20, height: 11, duration: 14.2, delay: 2.2, flapDuration: 0.40, waveDuration: 3.1 },
  { id: 3, top: "27%", width: 26, height: 15, duration: 11.0, delay: 0.8, flapDuration: 0.34, waveDuration: 2.4 },
  { id: 4, top: "15%", width: 18, height: 10, duration: 15.0, delay: 3.8, flapDuration: 0.42, waveDuration: 3.3 },
  { id: 5, top: "34%", width: 22, height: 12, duration: 13.0, delay: 1.6, flapDuration: 0.38, waveDuration: 2.8 },
  { id: 6, top: "22%", width: 24, height: 13, duration: 10.5, delay: 5.0, flapDuration: 0.35, waveDuration: 2.5 },
  { id: 7, top: "38%", width: 16, height: 9, duration: 13.8, delay: 2.8, flapDuration: 0.44, waveDuration: 3.0 },
]

export function ShinchanIdleScreensaver() {
  const pathname = usePathname()
  const [isIdle, setIsIdle] = React.useState(false)
  const [isRunningOut, setIsRunningOut] = React.useState(false)
  const [shinchanPos, setShinchanPos] = React.useState({ x: -380, y: 0 })
  const [runStartX, setRunStartX] = React.useState(0)
  
  const idleTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const walkAnimFrameRef = React.useRef<number | null>(null)
  const walkStartTimeRef = React.useRef<number>(0)
  const shinchanContainerRef = React.useRef<HTMLDivElement | null>(null)
  const isRunningOutRef = React.useRef(false)
  const isIdleRef = React.useRef(false)

  // Sync refs for event handlers
  isIdleRef.current = isIdle
  isRunningOutRef.current = isRunningOut

  // Reset the 35s inactivity timer
  const resetIdleTimer = React.useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
    }
    idleTimerRef.current = setTimeout(() => {
      // If a modal or popout is actively open, postpone screensaver
      const hasOpenModal = typeof document !== "undefined" && document.querySelector('.z-\\[100\\], [role="dialog"]')
      if (hasOpenModal) {
        resetIdleTimer()
        return
      }
      startWalking()
    }, IDLE_TIMEOUT_MS)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Start walking stroll across screen (grounded at bottom: 0px)
  const startWalking = React.useCallback(() => {
    if (typeof window === "undefined") return

    if (walkAnimFrameRef.current) {
      cancelAnimationFrame(walkAnimFrameRef.current)
      walkAnimFrameRef.current = null
    }

    setIsIdle(true)
    setIsRunningOut(false)

    const screenWidth = window.innerWidth
    const startX = -620
    const endX = screenWidth + 360
    const distance = endX - startX

    walkStartTimeRef.current = performance.now()

    const step = (now: number) => {
      if (isRunningOutRef.current) return

      const elapsed = now - walkStartTimeRef.current
      const progress = elapsed / WALK_DURATION_MS

      if (progress >= 1) {
        // Shinchan finished walking across screen
        walkStartTimeRef.current = now
      }

      const currentX = startX + (progress % 1) * distance
      setShinchanPos({ x: currentX, y: 0 })
      walkAnimFrameRef.current = requestAnimationFrame(step)
    }

    walkAnimFrameRef.current = requestAnimationFrame(step)
  }, [])

  // Trigger fast sprint out on CLICK anywhere in screen
  // (Applies to BOTH 20s idle mode and Smiley Button mode: clicking anywhere moves Shinchan fast!)
  const triggerFastSprint = React.useCallback(() => {
    if (!isIdleRef.current || isRunningOutRef.current) return

    if (walkAnimFrameRef.current) {
      cancelAnimationFrame(walkAnimFrameRef.current)
      walkAnimFrameRef.current = null
    }

    // Freeze current position and start sprint
    let currentX = -380
    if (shinchanContainerRef.current) {
      const rect = shinchanContainerRef.current.getBoundingClientRect()
      currentX = rect.left
    }
    setRunStartX(currentX)
    setIsRunningOut(true)

    // After sprint finishes (420ms), hide screensaver and reset 20s idle timer
    setTimeout(() => {
      setIsIdle(false)
      setIsRunningOut(false)
      resetIdleTimer()
    }, SPRINT_OUT_DURATION_MS + 50)
  }, [resetIdleTimer])

  // Inactivity detection: ONLY resets 20s timer while screensaver is NOT active
  // Mouse movement or hover while screensaver is visible DOES NOT dismiss or sprint Shinchan!
  React.useEffect(() => {
    if (typeof window === "undefined" || pathname === "/login") return

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "wheel",
      "scroll",
    ]

    const onUserActivity = () => {
      // If screensaver is NOT active, reset the 20-second inactivity timer
      if (!isIdleRef.current) {
        resetIdleTimer()
      }
      // Note: While screensaver is active, mousemove or hover does NOT dismiss Shinchan!
    }

    // Start initial 20s timer
    resetIdleTimer()

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, onUserActivity, { passive: true })
    })

    // Custom event dispatched by Header smiley button for immediate view / run
    const onImmediateTrigger = () => {
      if (isIdleRef.current && !isRunningOutRef.current) {
        triggerFastSprint()
      } else {
        startWalking()
      }
    }
    window.addEventListener("trigger-shinchan-screensaver", onImmediateTrigger)

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (walkAnimFrameRef.current) cancelAnimationFrame(walkAnimFrameRef.current)
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, onUserActivity)
      })
      window.removeEventListener("trigger-shinchan-screensaver", onImmediateTrigger)
    }
  }, [pathname, resetIdleTimer, startWalking, triggerFastSprint])

  if (pathname === "/login" || !isIdle) return null

  return (
    <>
      {/* 1) 20% Background Blur & Dimming Overlay - Click anywhere triggers fast sprint */}
      <div
        aria-hidden="true"
        onClick={triggerFastSprint}
        className={cn(
          "fixed inset-0 z-[999990] transition-all duration-700 select-none cursor-pointer",
          isRunningOut
            ? "opacity-0 backdrop-blur-none pointer-events-none"
            : "opacity-100 backdrop-blur-[6px] bg-black/20 dark:bg-black/35 pointer-events-auto"
        )}
      />

      {/* 2) 7 Small White Birds Randomly Flying in the Upper Empty Space */}
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-[999992] pointer-events-none overflow-hidden select-none transition-opacity duration-500",
          isRunningOut ? "opacity-0" : "opacity-95"
        )}
      >
        {BIRDS.map((b) => (
          <div
            key={b.id}
            className="bird-flight-item"
            style={{
              top: b.top,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
            }}
          >
            <div
              className="bird-wave-inner"
              style={{
                animationDuration: `${b.waveDuration}s`,
              }}
            >
              <svg
                viewBox="0 0 30 16"
                width={b.width}
                height={b.height}
                className="bird-wing-svg text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
                style={{
                  animationDuration: `${b.flapDuration}s`,
                }}
                fill="currentColor"
              >
                {/* Curved aerodynamic wings and body silhouette */}
                <path d="M 1 9 C 6 2, 10 1, 15 7 C 20 1, 24 2, 29 9 C 23 6, 18 6, 15 10 C 12 6, 7 6, 1 9 Z" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* 3) Shinchan & Dog Touching Screen Bottom with Smooth Stepping Legs */}
      <div
        aria-hidden="true"
        onClick={triggerFastSprint}
        className="fixed inset-0 z-[999995] pointer-events-auto cursor-pointer overflow-hidden select-none"
      >
        <div
          ref={shinchanContainerRef}
          style={{
            position: "absolute",
            bottom: "0px", // Touching the bottom of screen directly (no flying)
            left: isRunningOut ? `${runStartX}px` : `${shinchanPos.x}px`,
            transform: isRunningOut
              ? "translateX(calc(100vw + 500px))"
              : "none",
            transition: isRunningOut
              ? `transform ${SPRINT_OUT_DURATION_MS}ms cubic-bezier(0.35, 0, 0.2, 1)`
              : "none",
            willChange: "transform, left",
          }}
          className="select-none"
        >
          {/* 1) Pure White Text on the Back Side (Left Side) of Shinchan - Full Visibility, No BG, No Shaking */}
          <div
            className="absolute z-[10] pointer-events-none select-none transition-opacity duration-300 text-right"
            style={{
              bottom: "135px",
              right: "calc(100% - 15px)", // Positioned directly to the left/back side of Shinchan
              width: "250px",
              opacity: isRunningOut ? 0 : 1,
            }}
          >
            <p
              className="text-white text-[13px] sm:text-[14px] font-bold tracking-wide leading-tight whitespace-pre-line select-none text-right"
              style={{
                textShadow: "0 1px 3px rgba(0,0,0,0.48), 0 0 4px rgba(0,0,0,0.42)",
              }}
            >
              {"Searching for Faheem,\nwho makes me walk here\nfor no reason with my dog."}
            </p>
          </div>

          {/* Master Walking Stride Container: 360x321 Aspect Ratio (z-[20] in front of text) */}
          <div
            className={cn(
              "relative w-64 sm:w-72 md:w-80 aspect-[360/321] select-none pointer-events-none transition-transform z-[20]",
              isRunningOut ? "shinchan-sprint-master" : "shinchan-walk-master"
            )}
          >
            {/* Whistling musical notes floating while leisurely strolling (clear of text) */}
            {!isRunningOut && (
              <>
                <span
                  className="whistle-note-1 absolute -top-4 left-24 text-lg font-bold text-[#4472C4] drop-shadow-sm select-none z-30"
                >
                  ♪
                </span>
                <span
                  className="whistle-note-2 absolute -top-8 left-32 text-base font-bold text-amber-500 drop-shadow-sm select-none z-30"
                >
                  ♫
                </span>
              </>
            )}

            {/* Startled sweat drop / exclamation mark when user clicks */}
            {isRunningOut && (
              <div className="absolute -top-12 left-20 z-40 flex items-center gap-1 bg-red-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-lg animate-bounce">
                <span>!</span>
                <span className="text-[10px] font-semibold">Running!</span>
              </div>
            )}

            {/* 1. Shinchan Left Leg (Back Leg - Smooth sinusoidal stride from hip) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/shinchan-leg-left.png"
              alt="Shinchan Left Leg"
              className={cn(
                "absolute inset-0 w-full h-full object-contain pointer-events-none z-10",
                isRunningOut ? "shinchan-leg-left-sprint" : "shinchan-smooth-leg-left"
              )}
              draggable={false}
            />

            {/* 2. Shiro Rear Legs (Back Paws - Smooth dog trotting stride) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/shiro-legs-back.png"
              alt="Shiro Rear Paws"
              className={cn(
                "absolute inset-0 w-full h-full object-contain pointer-events-none z-12",
                isRunningOut ? "shiro-legs-back-sprint" : "shiro-smooth-legs-back"
              )}
              draggable={false}
            />

            {/* 3. Shinchan Right Leg (Front Leg - Smooth opposite stride) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/shinchan-leg-right.png"
              alt="Shinchan Right Leg"
              className={cn(
                "absolute inset-0 w-full h-full object-contain pointer-events-none z-14",
                isRunningOut ? "shinchan-leg-right-sprint" : "shinchan-smooth-leg-right"
              )}
              draggable={false}
            />

            {/* 4. Shiro Front Legs (Front Paws - Smooth dog trotting stride) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/shiro-legs-front.png"
              alt="Shiro Front Paws"
              className={cn(
                "absolute inset-0 w-full h-full object-contain pointer-events-none z-16",
                isRunningOut ? "shiro-legs-front-sprint" : "shiro-smooth-legs-front"
              )}
              draggable={false}
            />

            {/* 5. Master Body Layer (Torso, Shirt, Full Shorts & Dog Belly - z-20 on top) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/shinchan-body.png"
              alt="Shinchan and Dog Body"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20 drop-shadow-xl"
              draggable={false}
            />

            {/* Fast cartoon dash dust clouds when running out */}
            {isRunningOut && (
              <div className="absolute bottom-0 -left-8 z-30 flex gap-1 items-center pointer-events-none">
                <span className="h-3 w-5 rounded-full bg-white/70 animate-ping" />
                <span className="h-4 w-6 rounded-full bg-white/80 animate-pulse" />
                <span className="h-2 w-4 rounded-full bg-white/60" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
