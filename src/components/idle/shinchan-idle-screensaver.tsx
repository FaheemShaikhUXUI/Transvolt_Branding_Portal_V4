"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

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
  const [runStartX, setRunStartX] = React.useState(0)
  
  const shinchanContainerRef = React.useRef<HTMLDivElement | null>(null)
  const isRunningOutRef = React.useRef(false)
  const isIdleRef = React.useRef(false)
  const sprintTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Sync refs for event handlers
  isIdleRef.current = isIdle
  isRunningOutRef.current = isRunningOut

  // Trigger fast sprint out on click or interaction
  const triggerFastSprint = React.useCallback(() => {
    if (!isIdleRef.current || isRunningOutRef.current) return

    // Freeze current position and start sprint
    let currentX = -380
    if (shinchanContainerRef.current) {
      const rect = shinchanContainerRef.current.getBoundingClientRect()
      currentX = rect.left
    }
    setRunStartX(currentX)
    setIsRunningOut(true)

    if (sprintTimeoutRef.current) clearTimeout(sprintTimeoutRef.current)
    sprintTimeoutRef.current = setTimeout(() => {
      setIsIdle(false)
      setIsRunningOut(false)
    }, SPRINT_OUT_DURATION_MS + 50)
  }, [])

  // Start walking stroll across screen via pure GPU CSS keyframes (NO 120Hz React state re-renders)
  const startWalking = React.useCallback(() => {
    if (typeof window === "undefined") return
    if (sprintTimeoutRef.current) clearTimeout(sprintTimeoutRef.current)
    setIsRunningOut(false)
    setIsIdle(true)
  }, [])

  // Inactivity / Activity management:
  // Note: We deliberately do NOT auto-launch on an idle timer to prevent hijacking user screen.
  // The animation is triggered ONLY when clicking the smiley button in the header.
  // When active, any user activity (mousemove, keydown, click, scroll) dismisses it instantly!
  React.useEffect(() => {
    if (typeof window === "undefined" || pathname === "/login") return

    const dismissEvents = ["keydown", "touchstart", "wheel", "scroll"]

    const onUserInteraction = () => {
      if (isIdleRef.current && !isRunningOutRef.current) {
        triggerFastSprint()
      }
    }

    dismissEvents.forEach((evt) => {
      window.addEventListener(evt, onUserInteraction, { passive: true })
    })

    // Custom event dispatched by Header smiley button for intentional viewing
    const onManualTrigger = () => {
      if (isIdleRef.current && !isRunningOutRef.current) {
        triggerFastSprint()
      } else {
        startWalking()
      }
    }
    window.addEventListener("trigger-shinchan-screensaver", onManualTrigger)

    return () => {
      if (sprintTimeoutRef.current) clearTimeout(sprintTimeoutRef.current)
      dismissEvents.forEach((evt) => {
        window.removeEventListener(evt, onUserInteraction)
      })
      window.removeEventListener("trigger-shinchan-screensaver", onManualTrigger)
    }
  }, [pathname, startWalking, triggerFastSprint])

  if (pathname === "/login" || !isIdle) return null

  return (
    <>
      {/* Top Center Note: "Shinchan’s here! Click to shoo him away! 😄" */}
      <div
        className={cn(
          "fixed top-6 left-1/2 -translate-x-1/2 z-[999998] transition-all duration-500 pointer-events-auto select-none",
          isRunningOut
            ? "opacity-0 -translate-y-4 scale-95 pointer-events-none"
            : "opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-top-4"
        )}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            triggerFastSprint()
          }}
          className="group inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-black/30 text-white border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-md cursor-pointer hover:bg-black/45 hover:border-white/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <span className="text-xs sm:text-sm font-medium tracking-wide text-white drop-shadow-sm">
            Shinchan’s here! Click to shoo him away! 😄
          </span>
        </button>
      </div>

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
          onAnimationEnd={() => {
            if (!isRunningOut) {
              setIsIdle(false)
            }
          }}
          style={{
            position: "absolute",
            bottom: "0px",
            ...(isRunningOut
              ? {
                  left: `${runStartX}px`,
                  transform: "translateX(calc(100vw + 500px))",
                  transition: `transform ${SPRINT_OUT_DURATION_MS}ms cubic-bezier(0.35, 0, 0.2, 1)`,
                }
              : {
                  left: 0,
                }),
            willChange: "transform",
          }}
          className={cn("select-none", !isRunningOut && "shinchan-stroll-track")}
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
