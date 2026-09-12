"use client"

import * as React from "react"
import { Car, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react"
import { PageGuidelinesAccordion } from "./page-guidelines-accordion"

export function VehicleBrandingAccordion() {
  const usageRules = [
    {
      title: "Use Approved Artwork Only",
      desc: "Use only the latest vehicle branding files available on this portal.",
    },
    {
      title: "Select the Correct Vehicle",
      desc: "Verify the OEM, vehicle model, variant, and project before using any artwork.",
    },
    {
      title: "Follow the Approved Layout",
      desc: "Do not change logo placement, colours, graphics, typography, or proportions.",
    },
    {
      title: "Maintain Original Proportions",
      desc: "Do not stretch, compress, rotate, or distort branding elements.",
    },
    {
      title: "Check Vehicle Dimensions",
      desc: "Ensure the artwork corresponds to the actual vehicle body and panel dimensions.",
    },
    {
      title: "Use Approved Materials",
      desc: "Follow the specified material, finish, printing, and installation requirements.",
    },
    {
      title: "Maintain Visibility",
      desc: "Do not cover number plates, lights, windows, sensors, safety markings, or other mandatory information.",
    },
    {
      title: "Quality Check Before Installation",
      desc: "Verify artwork, dimensions, alignment, colours, and finishing before production.",
    },
    {
      title: "Update Damaged Branding",
      desc: "Replace faded, damaged, peeling, or worn-out branding when required.",
    },
    {
      title: "Keep Project Branding Separate",
      desc: "Never interchange branding artwork between different projects or vehicle specifications.",
    },
  ]

  return (
    <PageGuidelinesAccordion
      title="Vehicle Branding Guidelines"
      subtitle="Official branding specifications, OEM layout rules & installation standards"
      badgeText="Vehicle Guidelines"
      icon={<Car className="h-4 w-4" />}
      iconBg="bg-[#4472C4]/10"
      iconColor="text-[#4472C4]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: Context, OEM Variations & Warning */}
        <div className="lg:col-span-6 flex flex-col gap-4 text-left">
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Vehicle branding is an important representation of the Transvolt brand across roads, project sites, customer locations, and daily operations. Every branded vehicle should maintain a professional, consistent, and recognizable Transvolt identity while following the approved branding artwork and installation specifications.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Since Transvolt uses vehicles from different <strong className="text-foreground font-semibold">OEMs (Original Equipment Manufacturers)</strong>, branding may vary according to the vehicle&apos;s physical design, dimensions, body panels, and model structure. Even the <strong className="text-foreground font-semibold">same vehicle model from the same OEM</strong> may have different approved Transvolt branding layouts when used for different projects. Therefore, always select the branding artwork that matches the <strong className="text-[#4472C4] dark:text-blue-400 font-semibold">specific vehicle, OEM, model, and project</strong>.
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
                Do not use a vehicle branding file unless it matches the approved artwork for the specific vehicle and project.
              </strong>{" "}
              Using an incorrect, outdated, or modified design can result in improper branding and should be corrected before production or installation.
            </p>
            <p className="text-xs font-semibold text-[#548235] dark:text-emerald-400 pt-1 border-t border-border/50">
              Always refer to the latest approved vehicle branding assets available on this portal.
            </p>
          </div>
        </div>

        {/* Right Column: Vehicle Branding Usage Rules */}
        <div className="lg:col-span-6 bg-card border border-border/80 rounded-xl p-4 sm:p-5 shadow-sm space-y-3 text-left">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <div className="p-1 rounded bg-[#548235]/10 text-[#548235]">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-[#548235] tracking-wide uppercase">
              Vehicle Branding Usage Rules
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
