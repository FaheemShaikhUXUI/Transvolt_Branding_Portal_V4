"use client"

import * as React from "react"
import { Zap, ShieldAlert, AlertTriangle } from "lucide-react"
import { PageGuidelinesAccordion } from "./page-guidelines-accordion"

export function ChargerBrandingAccordion() {
  const usageRules = [
    {
      title: "Use Approved Artwork Only",
      desc: "Use the latest approved charger branding files available on this portal.",
    },
    {
      title: "Select the Correct OEM & Model",
      desc: "Verify the charger manufacturer, model, and type before using any artwork.",
    },
    {
      title: "Follow the Approved Layout",
      desc: "Do not change the logo placement, colours, typography, graphics, or proportions.",
    },
    {
      title: "Maintain Original Proportions",
      desc: "Never stretch, compress, rotate, or distort branding elements.",
    },
    {
      title: "Consider Charger Structure",
      desc: "Ensure the artwork matches the actual dimensions, panels, curves, and available branding surfaces.",
    },
    {
      title: "Protect Functional Areas",
      desc: "Do not cover displays, charging ports, QR codes, safety labels, emergency buttons, vents, serial numbers, or technical information.",
    },
    {
      title: "Use Approved Materials",
      desc: "Follow the specified material, finish, adhesive, printing, and installation requirements.",
    },
    {
      title: "Maintain Visibility",
      desc: "Ensure Transvolt branding remains clearly visible without affecting charger operation or safety.",
    },
    {
      title: "Quality Check Before Installation",
      desc: "Verify artwork, dimensions, colours, alignment, and finishing before production.",
    },
    {
      title: "Keep OEM Designs Separate",
      desc: "Do not interchange branding artwork between different OEMs or charger models.",
    },
  ]

  return (
    <PageGuidelinesAccordion
      title="Charger Branding Guidelines"
      subtitle="Official EV charger specifications, OEM layout rules & installation standards"
      badgeText="Charger Guidelines"
      icon={<Zap className="h-4 w-4" />}
      iconBg="bg-amber-500/10"
      iconColor="text-amber-600 dark:text-amber-400"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: Context, OEM Variations & Warning */}
        <div className="lg:col-span-6 flex flex-col gap-4 text-left">
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Charger branding is an important part of Transvolt’s visual identity across charging stations, depots, project sites, and operational locations. Every branded charger should present a clean, professional, and recognizable Transvolt identity while following the officially approved artwork and branding specifications.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Since Transvolt uses charging equipment from different <strong className="text-foreground font-semibold">OEMs (Original Equipment Manufacturers)</strong>, the physical design, dimensions, panels, displays, and available branding areas may differ from one charger to another. Therefore, even chargers serving the same purpose may require different branding layouts. Always use the approved artwork that matches the <strong className="text-[#4472C4] dark:text-blue-400 font-semibold">specific OEM, charger model, and project</strong>.
            </p>
          </div>

          {/* Warning Box */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-4 space-y-2 mt-1">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Warning</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground font-semibold">
                Always verify that the charger branding artwork matches the specific OEM and charger model before production or installation.
              </strong>{" "}
              Using an incorrect, outdated, or modified artwork may result in improper fitting or inconsistent Transvolt branding.
            </p>
            <p className="text-xs font-semibold text-[#548235] dark:text-emerald-400 pt-1 border-t border-border/50">
              Use only the latest approved charger branding assets available on this portal.
            </p>
          </div>
        </div>

        {/* Right Column: Charger Branding Usage Rules */}
        <div className="lg:col-span-6 bg-card border border-border/80 rounded-xl p-4 sm:p-5 shadow-sm space-y-3 text-left">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <div className="p-1 rounded bg-[#548235]/10 text-[#548235]">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-[#548235] tracking-wide uppercase">
              Charger Branding Usage Rules
            </h3>
          </div>

          <ul className="space-y-2">
            {usageRules.map((rule, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
              >
                <span className="flex-shrink-0 mt-0.5 h-3.5 w-3.5 rounded-full bg-[#548235]/15 text-[#548235] flex items-center justify-center font-bold text-[9px]">
                  ✓
                </span>
                <span>
                  <strong className="text-foreground font-semibold">{rule.title}</strong> — {rule.desc}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageGuidelinesAccordion>
  )
}
