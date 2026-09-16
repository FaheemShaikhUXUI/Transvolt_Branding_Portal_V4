"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import { createPortal } from "react-dom"

export interface ThemeWaveState {
  x: number
  y: number
  endRadius: number
  glowColor: string
  accentColor: string
  key: number
}

/**
 * Returns tailored soft gradient aura colors for each target theme
 */
export function getThemeGlowColors(targetTheme: string): { glowColor: string; accentColor: string } {
  switch (targetTheme) {
    case "dark":
      return {
        glowColor: "rgba(68, 114, 196, 0.55)",
        accentColor: "rgba(0, 0, 0, 0.85)",
      }
    case "theme-navy":
      return {
        glowColor: "rgba(68, 114, 196, 0.65)",
        accentColor: "rgba(10, 28, 59, 0.9)",
      }
    case "light":
    default:
      return {
        glowColor: "rgba(68, 114, 196, 0.4)",
        accentColor: "rgba(255, 255, 255, 0.85)",
      }
  }
}

/**
 * Hook to trigger a smooth, circular, soft-gradient theme transition
 * radiating outward from the user's mouse click coordinates.
 */
export function useCircularThemeTransition(
  currentTheme: string,
  setTheme: (theme: string) => void
) {
  const [wave, setWave] = React.useState<ThemeWaveState | null>(null)
  const isTransitioningRef = React.useRef(false)

  const switchTheme = React.useCallback(
    (targetTheme: string, event: React.MouseEvent<HTMLButtonElement | HTMLElement>) => {
      if (targetTheme === currentTheme) return

      // Reduced motion accessibility check
      if (
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setTheme(targetTheme)
        return
      }

      // Calculate origin coordinates (mouse click area)
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX > 0 ? event.clientX : rect.left + rect.width / 2
      const y = event.clientY > 0 ? event.clientY : rect.top + rect.height / 2

      // Calculate radius to furthest viewport corner
      const w = window.innerWidth
      const h = window.innerHeight
      const endRadius = Math.hypot(Math.max(x, w - x), Math.max(y, h - y))
      const targetRadius = endRadius + 600

      // Set CSS variables on documentElement for the 520px soft feathered radial-gradient mask (ultra-deep soft diffusion)
      document.documentElement.style.setProperty("--theme-x", `${x}px`)
      document.documentElement.style.setProperty("--theme-y", `${y}px`)
      document.documentElement.style.setProperty("--mask-radius", "0px")

      // Colors for the soft gradient wave
      const { glowColor, accentColor } = getThemeGlowColors(targetTheme)

      // Trigger soft gradient circular wave overlay
      setWave({
        x,
        y,
        endRadius,
        glowColor,
        accentColor,
        key: Date.now(),
      })

      const duration = 1860 // 50% slower, ultra-luxurious and silky smooth (was 1240ms)

      // Clean up wave overlay and CSS variables after animation duration
      setTimeout(() => {
        setWave(null)
        isTransitioningRef.current = false
        document.documentElement.style.removeProperty("--theme-x")
        document.documentElement.style.removeProperty("--theme-y")
        document.documentElement.style.removeProperty("--mask-radius")
      }, duration + 160)

      isTransitioningRef.current = true

      // Modern View Transitions API check (Chrome 111+, Edge, Safari 18+)
      const doc = document as any
      if (typeof doc.startViewTransition === "function") {
        const transition = doc.startViewTransition(() => {
          flushSync(() => {
            setTheme(targetTheme)
          })
        })

        transition.ready
          .then(() => {
            // Animate --mask-radius smoothly on each frame using requestAnimationFrame
            // This guarantees a 520px ultra-deep soft-feathered, misty gradient expansion!
            const startTime = performance.now()

            // Also trigger Web Animations API on root for compositor acceleration if supported
            try {
              (document.documentElement as HTMLElement).animate(
                {
                  "--mask-radius": ["0px", `${targetRadius}px`],
                },
                {
                  duration,
                  easing: "cubic-bezier(0.12, 1, 0.28, 1)",
                  pseudoElement: "::view-transition-new(root)",
                }
              )
            } catch {}

            function animateMask(now: number) {
              const elapsed = now - startTime
              const progress = Math.min(1, elapsed / duration)
              // Smooth quintic-out curve for seamless glide
              const eased = 1 - Math.pow(1 - progress, 3.6)
              const currentR = eased * targetRadius

              document.documentElement.style.setProperty("--mask-radius", `${currentR.toFixed(1)}px`)

              if (progress < 1) {
                requestAnimationFrame(animateMask)
              }
            }

            requestAnimationFrame(animateMask)
          })
          .catch(() => {
            setTheme(targetTheme)
          })
      } else {
        // Fallback for browsers without View Transitions API
        setTimeout(() => {
          setTheme(targetTheme)
        }, 850)
      }
    },
    [currentTheme, setTheme]
  )

  return {
    switchTheme,
    wave,
  }
}

/**
 * Renders the expanding soft circular gradient aura wave at the mouse click location
 */
export function ThemeCircularWavePortal({ wave }: { wave: ThemeWaveState | null }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !wave) return null

  const diameter = Math.round(wave.endRadius * 2.8)

  return createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999999] overflow-hidden select-none"
    >
      <div
        key={wave.key}
        className="theme-circular-wave-anim rounded-full"
        style={{
          position: "absolute",
          left: `${wave.x}px`,
          top: `${wave.y}px`,
          width: `${diameter}px`,
          height: `${diameter}px`,
          background: `radial-gradient(circle at center, transparent 0%, transparent 35%, ${wave.glowColor} 65%, ${wave.accentColor} 82%, transparent 100%)`,
          filter: "blur(72px)",
        }}
      />
    </div>,
    document.body
  )
}
