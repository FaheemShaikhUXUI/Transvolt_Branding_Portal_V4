"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  useCircularThemeTransition,
  ThemeCircularWavePortal,
} from "./circular-theme-transition"

interface ThemeOption {
  id: string
  label: string
  color: string
  borderClass: string
}

export function ThemeSelector() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = mounted ? (theme || resolvedTheme || "light") : "light"
  const { switchTheme, wave } = useCircularThemeTransition(currentTheme, setTheme)

  const themes: ThemeOption[] = [
    {
      id: "light",
      label: "Light (White)",
      color: "#FFFFFF",
      borderClass: "border border-neutral-300 dark:border-neutral-500",
    },
    {
      id: "dark",
      label: "Pure Black",
      color: "#000000",
      borderClass: "border border-neutral-800 dark:border-neutral-600",
    },
    {
      id: "theme-navy",
      label: "Dark Navy Blue",
      color: "#0A1C3B",
      borderClass: "border border-[#0A1C3B] dark:border-blue-500/40",
    },
  ]

  const lastTriggerRef = React.useRef<{ theme: string; time: number }>({ theme: "", time: 0 })

  const activeIndex = Math.max(
    0,
    themes.findIndex((t) => t.id === currentTheme)
  )

  // Instantaneous activation on pointerdown (sub-millisecond response) + onClick fallback
  const handleActivate = (targetTheme: string, e: React.PointerEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const now = Date.now()
    if (lastTriggerRef.current.theme === targetTheme && now - lastTriggerRef.current.time < 350) {
      return
    }
    lastTriggerRef.current = { theme: targetTheme, time: now }

    const clientX = e.clientX || (e as any).nativeEvent?.clientX || 0
    const clientY = e.clientY || (e as any).nativeEvent?.clientY || 0
    const target = (e.currentTarget || e.target) as HTMLElement

    switchTheme(targetTheme, {
      clientX,
      clientY,
      currentTarget: target,
      target,
    } as any)
  }

  return (
    <>
      <ThemeCircularWavePortal wave={wave} />

      <div 
        className="relative inline-flex items-center p-0.5 rounded-full border border-border/60 bg-background/50 backdrop-blur-md shadow-xs select-none"
        role="group"
        aria-label="Theme Selection"
        style={{ cursor: "pointer" }}
      >
        {/* Smooth Sliding Active Capsule Ring Highlight */}
        {mounted && (
          <span 
            className="absolute top-[2px] left-[2px] w-[38px] h-[26px] rounded-full border-2 border-[#4472C4] shadow-[0_0_8px_rgba(68,114,196,0.35)] pointer-events-none transition-transform duration-900 ease-[cubic-bezier(0.16,1,0.3,1)] z-0"
            style={{
              transform: `translateX(${activeIndex * 40}px)`,
              cursor: "pointer",
            }}
          />
        )}

        {themes.map((t) => {
          const isActive = currentTheme === t.id

          return (
            <button
              key={t.id}
              type="button"
              onPointerDown={(e) => handleActivate(t.id, e)}
              onClick={(e) => handleActivate(t.id, e)}
              aria-label={`Switch to ${t.label}`}
              className="w-[40px] h-[26px] relative z-10 flex items-center justify-center select-none bg-transparent border-0 outline-none p-0 m-0"
              style={{ cursor: "pointer" }}
            >
              <span
                className={`w-6.5 h-3.5 rounded-full ${t.borderClass} block pointer-events-none transition-opacity duration-200 ${
                  isActive ? "opacity-100" : "opacity-80"
                }`}
                style={{
                  backgroundColor: t.color,
                  boxShadow: isActive ? "0 0 4px rgba(0,0,0,0.25)" : "0 1px 2px rgba(0,0,0,0.08)",
                  cursor: "pointer",
                }}
              />
            </button>
          )
        })}
      </div>
    </>
  )
}
