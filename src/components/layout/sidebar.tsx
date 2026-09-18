"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BrandLogo } from "./brand-logo"
import { BrandBookTile } from "./brand-book-tile"
import { AboutPortalButton } from "./about-portal-button"
import { cn } from "@/lib/utils"
import { navigationConfig } from "@/config/navigation"

interface SidebarProps {
  isMobile?: boolean
  onNavigate?: () => void
}

export function Sidebar({ isMobile = false, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const navigationItems = navigationConfig
  const sidebarRef = React.useRef<HTMLDivElement>(null)

  const [isHovered, setIsHovered] = React.useState(false)
  const closeTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  // On mobile (inside Sheet drawer), sidebar is always fully expanded
  const isOpen = isMobile || isHovered

  // Open on mouse hover
  const handleMouseEnter = () => {
    if (isMobile) return
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setIsHovered(true)
  }

  // Close on mouse leave with gentle grace period (180ms) to avoid twitching
  const handleMouseLeave = () => {
    if (isMobile) return
    closeTimerRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 180)
  }

  // Close when clicking outside
  React.useEffect(() => {
    if (isMobile) return

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsHovered(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [isMobile])

  // Close when route changes
  React.useEffect(() => {
    setIsHovered(false)
  }, [pathname])

  return (
    <div
      ref={sidebarRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border/80 bg-sidebar/95 backdrop-blur-xl select-none relative z-40",
        isMobile ? "w-full" : "h-screen"
      )}
      style={
        !isMobile
          ? {
              width: isOpen ? "260px" : "68px",
              // Apple fluid ease-out deceleration curve for ultra-smooth gliding
              transition:
                "width 320ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 320ms cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: isOpen
                ? "10px 0 36px -6px rgba(0, 0, 0, 0.16), 0 0 16px rgba(0, 0, 0, 0.04)"
                : "none",
              willChange: "width, box-shadow",
            }
          : undefined
      }
    >
      {/* 1. Header / Logo Area */}
      <div className="relative flex h-14 lg:h-[60px] items-center border-b border-sidebar-border/70 px-3 overflow-hidden shrink-0">
        <Link
          href="/"
          onClick={() => {
            setIsHovered(false)
            onNavigate?.()
          }}
          className="flex items-center w-full h-full relative group"
          title="Transvolt Branding Portal"
        >
          {/* Closed Mode: Show Two Arrows of Logo on Top (standalone without any border or background) */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out",
              isOpen ? "opacity-0 scale-75 pointer-events-none" : "opacity-100 scale-100"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/transvolt-arrows-dual.svg"
              alt="Transvolt Two Arrows"
              className="h-7 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </div>

          {/* Open Mode: Full Transvolt Brand Logo */}
          <div
            className={cn(
              "flex items-center justify-center w-full transition-all duration-300 ease-out",
              isOpen ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-90 -translate-x-3 pointer-events-none"
            )}
          >
            <BrandLogo className="w-[170px] h-[46px]" />
          </div>
        </Link>
      </div>

      {/* 2. Navigation Items with Modern Floating Overlay Scrollbar */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-3 overlay-scrollbar">
        <nav className="flex flex-col gap-1 px-2.5">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isOpen ? item.title : undefined}
                onClick={() => {
                  setIsHovered(false)
                  onNavigate?.()
                }}
                className={cn(
                  "group relative flex items-center h-10 w-full px-1.5 rounded-xl text-sm transition-all duration-200 select-none overflow-hidden",
                  isActive
                    ? cn(
                        // White Theme: Clean Branding Green fill, text & border
                        "bg-[#548235]/15 text-[#548235] font-semibold border border-[#548235]/30 shadow-xs",
                        // Black Theme (Pure Black & Navy): High-contrast luminous Green highlight
                        "dark:bg-[#548235]/30 dark:text-[#7ee249] dark:border-[#548235]/80 dark:shadow-[0_0_15px_rgba(84,130,53,0.35)]"
                      )
                    : cn(
                        // Base idle state
                        "border border-transparent text-sidebar-foreground/80",
                        // Modern subtle hover effect
                        "hover:bg-[#548235]/[0.08] hover:text-[#548235] hover:border-[#548235]/20 hover:shadow-2xs",
                        "dark:hover:bg-[#548235]/15 dark:hover:text-[#7ee249] dark:hover:border-[#548235]/30 dark:hover:shadow-none"
                      )
                )}
              >
                {/* Fixed Icon slot (always perfectly positioned at left, never shifts) */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-all duration-200 group-hover:scale-110",
                      isActive
                        ? "text-[#548235] dark:text-[#7ee249]"
                        : "text-sidebar-foreground/75 group-hover:text-[#548235] dark:group-hover:text-[#7ee249]"
                    )}
                  />
                </div>

                {/* Text Label & Badge (Smooth fade and slide in/out without layout reflow) */}
                <div
                  className={cn(
                    "ml-2 flex-1 min-w-0 flex items-center justify-between transition-all duration-250 ease-out overflow-hidden whitespace-nowrap",
                    isOpen
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2.5 pointer-events-none"
                  )}
                >
                  <span className="truncate">{item.title}</span>
                  {item.tag && (
                    <span
                      className={cn(
                        "ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none shrink-0 transition-colors",
                        isActive
                          ? "bg-[#548235]/20 text-[#548235] border border-[#548235]/30 dark:bg-[#548235]/40 dark:text-[#7ee249] dark:border-[#548235]/60"
                          : "border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {item.tag}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* 2.5 About This Portal Button (Above Brand Book) */}
      <AboutPortalButton isCollapsed={!isOpen} />

      {/* 3. Brand Book Tile at Bottom */}
      <BrandBookTile isCollapsed={!isOpen} />
    </div>
  )
}
