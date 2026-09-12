"use client"

import * as React from "react"
import { ShieldAlert, Check } from "lucide-react"
import { PageGuidelinesAccordion } from "./page-guidelines-accordion"

export function IdCardsAccordionMenu() {
  return (
    <PageGuidelinesAccordion
      title="ID Cards & Business Cards Guidelines & Specifications"
      subtitle="View card specifications, issuance standards, authorized templates & security policies"
      badgeText="Official Guidelines"
    >
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 items-start w-full text-left">
        {/* Left Column: Guidelines Narrative & Security Policy */}
        <div className="lg:col-span-4 flex flex-col gap-3.5 text-left">
          <div className="space-y-2.5">
            <h5 className="text-sm font-extrabold text-[#4472C4] tracking-tight uppercase">
              Brand &amp; Corporate Identity Guidelines
            </h5>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Official employee ID cards and corporate business cards represent Transvolt across professional
              engagements, client meetings, industry conferences, and operational facilities. Every card serves as
              a verified mark of corporate identity and must consistently follow approved design specifications.
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              <strong className="text-foreground font-semibold">
                Only officially authorized templates from this portal may be used.
              </strong>{" "}
              Employees and department heads must not create custom layouts, alter typography hierarchy, modify
              logo proportions, or introduce unapproved color variations.
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Verify that all personal credentials, job designations, official email addresses, and contact
              numbers are thoroughly proofread before production.{" "}
              <strong className="text-foreground font-semibold">
                Cards must be produced through authorized vendors utilizing approved high-durability print
                materials.
              </strong>
            </p>
          </div>

          {/* Policy Callout Box */}
          <div className="border-l-3 border-[#548235] pl-3.5 bg-[#548235]/10 dark:bg-[#548235]/15 py-3 rounded-r-xl text-xs text-muted-foreground leading-relaxed space-y-1">
            <strong className="text-[#548235] dark:text-emerald-400 font-bold flex items-center gap-1.5 text-xs tracking-wide uppercase">
              <span>🛡️</span>
              <span>Corporate Credential &amp; Security Policy</span>
            </strong>
            <p>
              Transvolt ID cards and business cards are official corporate credentials. Any card produced using
              unapproved layouts, modified logos, or unofficial templates shall{" "}
              <strong className="font-extrabold text-red-600 dark:text-red-400">not</strong> be recognized as
              valid corporate identification and is strictly prohibited across all facilities and external
              representation.
            </p>
          </div>
        </div>

        {/* Right Column: Standards Cards */}
        <div className="lg:col-span-3 flex flex-col gap-3.5">
          {/* Card 1: Card Specifications */}
          <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 border-b border-border/70 pb-2">
              <div className="p-1 rounded bg-[#4472C4]/10 text-[#4472C4]">
                <ShieldAlert className="h-3.5 w-3.5" />
              </div>
              <h5 className="font-bold text-xs text-[#4472C4] tracking-wide uppercase">Card Specifications</h5>
            </div>
            <ul className="space-y-1.5 text-left">
              {[
                { title: "Standard Business Card", desc: "85mm × 55mm or 3.5″ × 2″, premium 350+ GSM matte." },
                { title: "Employee ID Card", desc: "CR80 credit card standard (85.6mm × 54mm) PVC." },
                { title: "Official Lanyard", desc: "Brand green lanyard with secure breakaway clip." },
                { title: "QR / VCard Integration", desc: "Official digital contact card QR on reverse side." },
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-1.5 text-xs text-muted-foreground font-medium leading-tight"
                >
                  <span className="flex-shrink-0 mt-0.5 h-3.5 w-3.5 rounded-full bg-[#4472C4]/15 text-[#4472C4] flex items-center justify-center font-bold text-[8px]">
                    ✓
                  </span>
                  <span>
                    <strong className="text-foreground/90 font-semibold">{item.title}</strong> — {item.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Issuance & Usage Rules */}
          <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 border-b border-border/70 pb-2">
              <div className="p-1 rounded bg-[#548235]/10 text-[#548235]">
                <ShieldAlert className="h-3.5 w-3.5" />
              </div>
              <h5 className="font-bold text-xs text-[#548235] tracking-wide uppercase">
                Usage &amp; Issuance Rules
              </h5>
            </div>
            <ul className="space-y-1.5 text-left">
              {[
                { title: "Authorized Templates", desc: "Use only official Corporate Communications artwork." },
                { title: "Brand Typography", desc: "Set in approved Poppins font weights and sizes." },
                { title: "Verified Credentials", desc: "All titles, emails, and phone numbers must be validated." },
                { title: "No Custom Graphics", desc: "Do not add unauthorized badges, quotes, or art." },
                { title: "Mandatory Display", desc: "Wear ID card visibly across all Transvolt sites." },
              ].map((rule, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-1.5 text-xs text-muted-foreground font-medium leading-tight"
                >
                  <span className="flex-shrink-0 mt-0.5 h-3.5 w-3.5 rounded-full bg-[#548235]/15 text-[#548235] flex items-center justify-center font-bold text-[8px]">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>
                    <strong className="text-foreground/90 font-semibold">{rule.title}</strong> — {rule.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PageGuidelinesAccordion>
  )
}
