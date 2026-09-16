"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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

  const activeIndex = Math.max(
    0,
    themes.findIndex((t) => t.id === currentTheme)
  )

  return (
    <>
      <ThemeCircularWavePortal wave={wave} />

      <div 
        className="relative flex items-center gap-1.5 p-1 rounded-full border border-border/60 bg-background/50 hover:bg-background/80 backdrop-blur-md transition-all shadow-xs"
        role="group"
        aria-label="Theme Selection"
      >
        {/* Smooth Sliding Active Capsule Ring Highlight (50% slower, gentle gliding) */}
        {mounted && (
          <span 
            className="absolute top-1 left-1 w-9 h-6 rounded-full border-2 border-[#4472C4] shadow-[0_0_8px_rgba(68,114,196,0.35)] pointer-events-none transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              transform: `translateX(${activeIndex * 42}px)`
            }}
          />
        )}

        {themes.map((t) => {
          const isActive = currentTheme === t.id

          return (
            <Tooltip key={t.id}>
              <TooltipTrigger render={
                <button
                  type="button"
                  onClick={(e) => switchTheme(t.id, e)}
                  aria-label={`Switch to ${t.label}`}
                  className="w-9 h-6 rounded-full relative z-10 flex items-center justify-center cursor-pointer transition-transform duration-200 active:scale-90 hover:scale-105"
                >
                  <span
                    className={`w-6.5 h-3.5 rounded-full ${t.borderClass} transition-transform duration-300 block ${
                      isActive ? "scale-105" : "scale-95 opacity-90"
                    }`}
                    style={{
                      backgroundColor: t.color,
                      boxShadow: isActive ? "0 0 4px rgba(0,0,0,0.25)" : "0 1px 2px rgba(0,0,0,0.08)",
                    }}
                  />
                </button>
              } />
              <TooltipContent side="bottom">
                <p className="text-xs font-semibold">{t.label}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </>
  )
}
