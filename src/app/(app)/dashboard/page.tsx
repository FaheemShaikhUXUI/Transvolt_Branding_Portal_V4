"use client"

import { Palette, FileText, MonitorPlay, Users, Download, LayoutDashboard } from "lucide-react"
import { useStats } from "@/lib/stats/stats-context"
import { useAssets } from "@/lib/assets/assets-context"
import { PageGuidelinesAccordion } from "@/components/assets/page-guidelines-accordion"
import { CompanyMasterSection } from "@/components/company-master/company-master-section"

export default function DashboardPage() {
  const { totalDownloads } = useStats()
  const { assets, customCategories } = useAssets()

  const totalCategories = 8 + (customCategories ? Object.keys(customCategories).length : 0)
  const totalAssetsCount = assets && assets.length > 0 ? assets.length : "---"

  const statCards = [
    {
      title: "Total Branding Categories",
      value: totalCategories,
      description: "Active categories",
      icon: Palette,
      badgeBg: "bg-rose-500/10 dark:bg-rose-500/20",
      badgeBorder: "border-rose-500/25 dark:border-rose-400/30",
      badgeColor: "text-rose-600 dark:text-rose-400",
      valueColor: "text-rose-600 dark:text-rose-400",
      glowBg: "bg-rose-500/15 dark:bg-rose-500/20",
      hoverBorder: "hover:border-rose-500/40 dark:hover:border-rose-400/40",
    },
    {
      title: "Total Downloads Assets",
      value: totalDownloads,
      description: "All time downloads",
      icon: Download,
      badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      badgeBorder: "border-emerald-500/25 dark:border-emerald-400/30",
      badgeColor: "text-emerald-600 dark:text-emerald-400",
      valueColor: "text-emerald-600 dark:text-emerald-400",
      glowBg: "bg-emerald-500/15 dark:bg-emerald-500/20",
      hoverBorder: "hover:border-emerald-500/40 dark:hover:border-emerald-400/40",
    },
    {
      title: "Total Assets",
      value: totalAssetsCount,
      description: "Placeholder data",
      icon: FileText,
      badgeBg: "bg-blue-500/10 dark:bg-blue-500/20",
      badgeBorder: "border-blue-500/25 dark:border-blue-400/30",
      badgeColor: "text-blue-600 dark:text-blue-400",
      valueColor: "text-blue-600 dark:text-blue-400",
      glowBg: "bg-blue-500/15 dark:bg-blue-500/20",
      hoverBorder: "hover:border-blue-500/40 dark:hover:border-blue-400/40",
    },
    {
      title: "Recently Updated",
      value: "---",
      description: "Placeholder data",
      icon: MonitorPlay,
      badgeBg: "bg-purple-500/10 dark:bg-purple-500/20",
      badgeBorder: "border-purple-500/25 dark:border-purple-400/30",
      badgeColor: "text-purple-600 dark:text-purple-400",
      valueColor: "text-purple-600 dark:text-purple-400",
      glowBg: "bg-purple-500/15 dark:bg-purple-500/20",
      hoverBorder: "hover:border-purple-500/40 dark:hover:border-purple-400/40",
    },
    {
      title: "Active Users",
      value: "---",
      description: "Placeholder data",
      icon: Users,
      badgeBg: "bg-amber-500/10 dark:bg-amber-500/20",
      badgeBorder: "border-amber-500/25 dark:border-amber-400/30",
      badgeColor: "text-amber-600 dark:text-amber-400",
      valueColor: "text-amber-600 dark:text-amber-400",
      glowBg: "bg-amber-500/15 dark:bg-amber-500/20",
      hoverBorder: "hover:border-amber-500/40 dark:hover:border-amber-400/40",
    },
  ]

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#4472C4]/10 text-[#4472C4] shadow-xs shrink-0">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#4472C4]">Dashboard</h1>
        </div>
        <p className="text-muted-foreground text-sm">Welcome to the Transvolt Branding Portal.</p>
      </div>

      {/* Top Glassmorphic Stat Tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
              key={idx}
              className={`glass-tile group relative p-4 transition-all duration-300 ${card.hoverBorder}`}
            >
              {/* Subtle ambient glass corner illumination */}
              <div
                className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full ${card.glowBg} blur-xl transition-all duration-500 group-hover:scale-150`}
              />

              <div className="relative z-10 flex flex-col justify-between h-full gap-3">
                {/* Header: Title & Frosted Glass Icon Badge */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs sm:text-sm font-semibold tracking-tight text-foreground/85 dark:text-foreground/90 line-clamp-1">
                    {card.title}
                  </span>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${card.badgeBorder} ${card.badgeBg} ${card.badgeColor} shadow-xs backdrop-blur-md transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                {/* Stat Value & Subtext with Crystal Clear Visibility */}
                <div>
                  <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${card.valueColor}`}>
                    {card.value}
                  </div>
                  <p className="mt-1 text-xs font-medium text-muted-foreground dark:text-muted-foreground/90">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <PageGuidelinesAccordion
        title="Transvolt Branding Portal Overview & Governance"
        subtitle="Centralized brand assets, corporate identity standards, vector templates & guidelines"
        badgeText="Portal Overview"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-muted-foreground leading-relaxed">
          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-[#4472C4] tracking-tight">Single Source of Truth</h4>
            <p>
              The Transvolt Branding Portal is the official repository for all company brand assets, templates, and corporate communications material. Every asset hosted here has been verified and approved for corporate use.
            </p>
            <p>
              Always download assets directly from this portal to ensure you are utilizing the latest high-resolution files, exact brand color codes, and authorized layouts.
            </p>
          </div>
          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-[#548235] tracking-tight">Brand Governance &amp; Compliance</h4>
            <p>
              Any marketing collateral, client presentation, letterhead, or ID credential prepared using unapproved or self-modified artwork will not be recognized as valid corporate identification.
            </p>
            <p>
              For custom requirements or brand queries, please contact the Corporate Communications team.
            </p>
          </div>
        </div>
      </PageGuidelinesAccordion>

      {/* Company Master Section (Replaced Recent Activity & Quick Access placeholders) */}
      <CompanyMasterSection />
    </div>
  )
}
