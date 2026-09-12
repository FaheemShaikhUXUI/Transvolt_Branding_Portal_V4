"use client"

import * as React from "react"
import { BookOpen, ChevronDown } from "lucide-react"

interface PageGuidelinesAccordionProps {
  title: string
  subtitle: string
  badgeText?: string
  icon?: React.ReactNode
  iconBg?: string
  iconColor?: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function PageGuidelinesAccordion({
  title,
  subtitle,
  badgeText = "Official Guidelines",
  icon,
  iconBg = "bg-[#4472C4]/10",
  iconColor = "text-[#4472C4]",
  children,
  defaultOpen = false,
}: PageGuidelinesAccordionProps) {
  const [isOpen, setIsOpen] = React.useState<boolean>(defaultOpen)

  return (
    <div className="w-full text-left select-none mb-3">
      <div className="border border-border/80 rounded-2xl bg-card overflow-hidden shadow-xs transition-all duration-200">
        {/* Accordion Header Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor} shrink-0`}>
              {icon || <BookOpen className="h-4 w-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-foreground tracking-tight">
                  {title}
                </h4>
                {badgeText && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary hidden sm:inline-block">
                    {badgeText}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground shrink-0">
            <span className="text-xs font-semibold text-[#4472C4] dark:text-blue-400 hidden sm:inline transition-colors duration-200">
              {isOpen ? "Hide Information" : "View Information"}
            </span>
            <div
              className={`p-1 rounded-full hover:bg-muted transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isOpen ? "rotate-180 text-foreground" : "text-muted-foreground"
              }`}
            >
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </button>

        {/* Accordion Content Body with Ultra-Smooth Height & Opacity Transition */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
        >
          <div className="overflow-hidden">
            <div className="p-5 border-t border-border/70 bg-muted/15 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
