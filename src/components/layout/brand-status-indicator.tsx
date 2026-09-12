"use client"

import * as React from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function BrandStatusIndicator() {
  const [mounted, setMounted] = React.useState(false)
  const [isState1, setIsState1] = React.useState(true)

  React.useEffect(() => {
    setMounted(true)

    // Shift chevrons every 1.2s
    const chevronTimer = setInterval(() => {
      setIsState1((prev) => !prev)
    }, 1200)

    // Function to completely remove/suppress default Next.js devtools portal / triangle overlay
    const suppressNextDevOverlay = () => {
      const portals = document.querySelectorAll("nextjs-portal, [data-nextjs-toast], [data-next-badge], #nextjs-dev-overlay")
      portals.forEach((el) => {
        const htmlEl = el as HTMLElement
        htmlEl.style.setProperty("display", "none", "important")
        htmlEl.style.setProperty("opacity", "0", "important")
        htmlEl.style.setProperty("visibility", "hidden", "important")
        htmlEl.style.setProperty("pointer-events", "none", "important")
        htmlEl.style.setProperty("width", "0px", "important")
        htmlEl.style.setProperty("height", "0px", "important")
        htmlEl.style.setProperty("overflow", "hidden", "important")

        if (htmlEl.shadowRoot) {
          const style = document.createElement("style")
          style.textContent = `
            * {
              display: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
              pointer-events: none !important;
            }
          `
          try {
            htmlEl.shadowRoot.appendChild(style)
          } catch (e) {}
        }
      })
    }

    suppressNextDevOverlay()

    const observer = new MutationObserver(() => {
      suppressNextDevOverlay()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    const interval = setInterval(suppressNextDevOverlay, 500)

    return () => {
      observer.disconnect()
      clearInterval(interval)
      clearInterval(chevronTimer)
    }
  }, [])

  if (!mounted) return null

  // State 1: Left = Light Green (#A9D18E), Right = Dark Blue (#4472C4)
  // State 2: Left = Dark Green (#548235), Right = Light Blue (#B4C6E7)
  const leftColor = isState1 ? "#A9D18E" : "#548235"
  const rightColor = isState1 ? "#4472C4" : "#B4C6E7"

  return (
    <div className="fixed bottom-3 left-3 z-[99999] pointer-events-auto select-none">
      <Tooltip>
        <TooltipTrigger render={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-background/80 hover:bg-background/95 backdrop-blur-xl shadow-lg transition-all duration-300 cursor-pointer text-xs font-semibold text-foreground hover:scale-105">
            
            {/* Shifting Transvolt Double Chevrons */}
            <svg 
              viewBox="0 0 1340 1070" 
              className="w-4 h-3.5 shrink-0 transition-all duration-200"
              style={{ filter: `drop-shadow(0 0 4px ${isState1 ? "#4472C4" : "#548235"})` }}
            >
              {/* Left Chevron */}
              <polygon 
                points="0,0 395.83,0 778.77,534.52 395.83,1069.04 0,1069.04 382.93,534.52" 
                fill={leftColor}
                className="transition-colors duration-150"
              />
              {/* Right Chevron */}
              <polygon 
                points="561.05,0 956.89,0 1339.8,534.52 956.89,1069.04 561.05,1069.04 943.97,534.52" 
                fill={rightColor}
                className="transition-colors duration-150"
              />
            </svg>

            <span className="tracking-wide text-foreground/90 font-bold">
              Transvolt
            </span>
          </div>
        } />
        <TooltipContent side="top">
          <p className="text-xs font-semibold">Transvolt Brand Portal • Active</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
