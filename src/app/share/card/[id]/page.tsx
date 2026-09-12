"use client"

import * as React from "react"
import { useParams, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Clock, Printer, ShieldAlert, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { generateCardPrintHtml, CandidateInfo, CompanyRegularInfo, toTitleCase } from "@/lib/cards/card-print-utils"

const SEVEN_HOURS_MS = 7 * 60 * 60 * 1000

export default function ShareCardPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params?.id as string
  const typeParam = (searchParams.get("type") as "both" | "id" | "business") || "both"

  const [cardData, setCardData] = React.useState<{ candidate: CandidateInfo; company: CompanyRegularInfo } | null>(null)
  const [createdTime, setCreatedTime] = React.useState<number>(Date.now())
  const [now, setNow] = React.useState<number>(Date.now())
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!id) return

    // 1. Get or set creation time
    const tParam = searchParams.get("t")
    let initialTime: number
    if (tParam && !isNaN(parseInt(tParam, 10))) {
      initialTime = parseInt(tParam, 10)
    } else {
      const storedTime = localStorage.getItem(`branding_share_card_${id}_time`)
      if (storedTime && !isNaN(parseInt(storedTime, 10))) {
        initialTime = parseInt(storedTime, 10)
      } else {
        initialTime = Date.now()
        localStorage.setItem(`branding_share_card_${id}_time`, initialTime.toString())
      }
    }
    setCreatedTime(initialTime)

    // 2. Load card data from localStorage
    try {
      const savedCard = localStorage.getItem(`branding_share_card_${id}_data`)
      if (savedCard) {
        setCardData(JSON.parse(savedCard))
      } else {
        // Fallback: check transvolt_id_business_cards_v3
        const allCards = localStorage.getItem("transvolt_id_business_cards_v3")
        if (allCards) {
          const parsed = JSON.parse(allCards)
          const found = parsed.find((r: any) => r.id === id || r.employeeId === id)
          if (found) {
            setCardData({
              candidate: {
                fullName: found.name,
                designation: found.designation,
                email: found.email,
                contact: found.contact,
                emrContact: found.emrContact,
                bloodGroup: found.bloodGroup,
                employeeId: found.employeeId,
                company: found.company,
                siteLocation: found.siteLocation,
              },
              company: {
                companyFullName: found.company || "Transvolt Mobility Private Limited",
                companyAddress: "5th Floor, “A” Wing, Trade Link, Kamala Mills Compound, Lower Parel, Mumbai - 400013.",
                companyContact: "+91 8657 000 732",
                companyEmail: "info@transvolt.in",
                companyWebsite: "www.transvolt.in",
                companyLogoSvg: "/logos/Logo_Black.svg",
              },
            })
          }
        }
      }
    } catch (e) {
      console.error("Failed to load share data", e)
    }

    setLoading(false)
  }, [id, searchParams])

  // Live timer tick
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const expiresAt = createdTime + SEVEN_HOURS_MS
  const remainingMs = expiresAt - now
  const isExpired = remainingMs <= 0

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return "00h : 00m : 00s"
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${String(hours).padStart(2, "0")}h : ${String(minutes).padStart(2, "0")}m : ${String(seconds).padStart(2, "0")}s`
  }

  const handlePrint = () => {
    if (isExpired) {
      toast.error("This share link has expired.")
      return
    }
    if (!cardData) return
    const printWin = window.open("", "_blank")
    if (printWin) {
      printWin.document.write(generateCardPrintHtml(cardData.candidate, cardData.company, typeParam, window.location.origin))
      printWin.document.close()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#548235] border-t-transparent" />
          <span className="text-xs font-semibold text-neutral-400">Loading Secure Card Preview...</span>
        </div>
      </div>
    )
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <Clock className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Share Link Expired</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            This secure credential preview link was valid for 7 hours only and has expired. Please contact the Transvolt Branding team for a fresh share link.
          </p>
          <Link href="/id-business-cards" className="mt-4">
            <Button variant="outline" className="text-xs rounded-xl">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Return to Branding Portal
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!cardData) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-amber-500" />
          <h2 className="text-xl font-bold">Credential Not Found</h2>
          <p className="text-xs text-neutral-400">
            The requested card record could not be loaded or has been removed.
          </p>
          <Link href="/id-business-cards" className="mt-4">
            <Button variant="outline" className="text-xs rounded-xl">
              Return to Portal
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { candidate, company } = cardData
  const vCardString = `BEGIN:VCARD\nVERSION:3.0\nFN:${candidate.fullName}\nTITLE:${candidate.designation}\nORG:${company.companyFullName}\nTEL:${candidate.contact}\nEMAIL:${candidate.email}\nURL:${company.companyWebsite}\nEND:VCARD`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(vCardString)}`

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Top Banner with Countdown */}
      <header className="sticky top-0 z-50 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-base tracking-wider text-[#548235]">TRANSVOLT</span>
          <span className="text-neutral-500">|</span>
          <span className="text-xs font-semibold text-neutral-300">Official Personnel Credential Preview</span>
        </div>

        {/* 7-Hour Live Countdown Banner */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-neutral-800/90 border border-neutral-700 px-3.5 py-1.5 rounded-full text-xs font-mono">
            <Clock className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span className="text-neutral-400">Expires in:</span>
            <span className="font-bold text-amber-300">{formatCountdown(remainingMs)}</span>
          </div>

          <Button 
            onClick={handlePrint}
            className="bg-[#548235] hover:bg-[#43672a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Save PDF</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-10">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">{candidate.fullName}</h1>
          <p className="text-xs font-medium text-neutral-400">{candidate.designation} • {company.companyFullName}</p>
        </div>

        {/* 1. ID Card Preview if requested */}
        {(typeParam === "both" || typeParam === "id") && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-[#548235] uppercase tracking-wider">Employee ID Card (CR80 Standard)</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {/* ID Front - UNCLUTTERED, EXACT ALIGNMENT */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-red-400">Front: 54mm Width &amp; 86mm Height</span>
                <div className="w-[240px] h-[382px] bg-white text-neutral-900 rounded-none shadow-2xl border border-neutral-800 flex flex-col relative overflow-hidden select-none">
                  {/* Logo - Increased by 5% and moved 2% higher */}
                  <div className="pt-[56px] flex justify-center">
                    <img src="/logos/Logo_Black_Tagline.png" alt="Transvolt Logo with Tagline" className="w-[158px] object-contain" />
                  </div>

                  {/* Photo Box (20x24 mm) */}
                  <div className="mt-[22px] mx-auto w-[86px] h-[102px] bg-[#e9eef7] border border-[#b8c6dc] rounded-[6px] flex items-center justify-center overflow-hidden">
                    {candidate.photoUrl ? (
                      <img src={candidate.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-[#8fa1bc] font-medium">20x24 mm</span>
                    )}
                  </div>

                  {/* Candidate Name - Equal gap above and below (mt-[18px]) with word wrapping */}
                  <div className="mt-[18px] text-center px-4">
                    <h3 className="font-bold text-[13.5px] text-[#111111] leading-tight break-words">{toTitleCase(candidate.fullName)}</h3>
                  </div>

                  {/* 4 Details Rows - Equal gap from Name (mt-[18px]) */}
                  <div className="mt-[18px] px-[23px] space-y-[5px] text-[9.4px] text-[#1a1a1a] font-normal leading-tight">
                    <div className="flex items-center">
                      <span className="w-[107px] shrink-0 text-[#1a1a1a]">Contact:</span>
                      <span className="flex-1 text-left whitespace-nowrap text-[#1a1a1a]">{candidate.contact || "+91 0000 000 000"}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-[107px] shrink-0 text-[#1a1a1a]">Emergency Contact:</span>
                      <span className="flex-1 text-left whitespace-nowrap text-[#1a1a1a]">{candidate.emrContact || "+91 0000 000 000"}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-[107px] shrink-0 text-[#1a1a1a]">Employee ID:</span>
                      <span className="flex-1 text-left whitespace-nowrap text-[#1a1a1a]">{candidate.employeeId}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-[107px] shrink-0 text-[#1a1a1a]">Blood Group:</span>
                      <span className="flex-1 text-left whitespace-nowrap font-bold text-[#1a1a1a]">{candidate.bloodGroup}</span>
                    </div>
                  </div>

                  {/* Blue Footer Strip - EXACT 36px height, leaving EXACT 23px gap below Blood Group */}
                  <div className="absolute bottom-0 left-0 right-0 h-[36px] bg-[#3b6fb6] text-white flex items-center justify-center text-[9px] font-semibold tracking-wide">
                    {company.companyWebsite}
                  </div>
                </div>
              </div>

              {/* ID Back - UNCLUTTERED, ZERO OVERFLOW */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-red-400">Back Common: 54mm Width &amp; 86mm Height</span>
                <div className="w-[240px] h-[382px] bg-white text-neutral-900 rounded-none shadow-2xl border border-neutral-800 flex flex-col relative overflow-hidden select-none">
                  {/* Logo placed at exact 24.3% top offset (pt-[93px]) */}
                  <div className="pt-[93px] flex justify-center">
                    <img src="/logos/Logo_Black_Tagline.png" alt="Transvolt Logo with Tagline" className="w-[156px] object-contain" />
                  </div>

                  {/* Return Notice - Centered at exact 22.1% gap (mt-[84px]) */}
                  <div className="mt-[84px] text-center px-2">
                    <p className="text-[9px] font-bold text-[#737373] tracking-tight">If Found Please Return to</p>
                  </div>

                  {/* Company & Address Block - LEFT ALIGNED at exact 9.9% margin (pl-[24px]) */}
                  <div className="mt-[26px] pl-[24px] pr-[18px] text-left">
                    <strong className="block text-[9.8px] font-bold text-[#111111] leading-tight">{company.companyFullName}</strong>
                    <div className="text-[8.2px] text-[#222222] font-normal leading-[1.35] mt-[2px]">
                      5th Floor, “A” Wing, Trade Link,<br />
                      Kamala Mills Compound, Lower Parel,<br />
                      Mumbai - 400013.
                    </div>
                  </div>

                  {/* Contact Lines - LEFT ALIGNED at exact 9.9% margin (pl-[24px]), gap 5.6% (mt-[21px]) */}
                  <div className="mt-[21px] pl-[24px] pr-[18px] text-left text-[8.2px] text-[#222222] font-normal leading-[1.38]">
                    <p>Contact No.:&nbsp;&nbsp;{company.companyContact}</p>
                    <p>Email:&nbsp;&nbsp;{company.companyEmail}</p>
                    <p>Web:&nbsp;&nbsp;{company.companyWebsite}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Business Card Preview if requested */}
        {(typeParam === "both" || typeParam === "business") && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-[#548235] uppercase tracking-wider">Corporate Business Card (3.5″ × 2″)</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {/* Business Front - STRICT STRAIGHT NON-CURVED BORDER */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-red-400">Front: 89mm Width &amp; 51mm Height</span>
                <div className="w-[360px] h-[210px] bg-white text-neutral-900 rounded-none p-[22px] shadow-2xl border border-neutral-400 flex flex-col justify-between overflow-hidden relative select-none">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-bold text-[9.5px] text-neutral-900 tracking-tight leading-tight break-words">{toTitleCase(candidate.fullName)}</h3>
                      <p className="text-[8px] font-medium text-neutral-600 leading-tight mt-0.5 break-words">{candidate.designation}</p>
                    </div>
                    {/* Basic Logo (No Tagline) - Increased by 5% and 3% above */}
                    <img src="/logos/Logo_Black.svg" alt="Transvolt Basic Logo" className="h-[26px] object-contain max-w-[130px] shrink-0 -translate-y-[4.5px]" />
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div className="space-y-1 text-[8px] text-neutral-700 max-w-[210px]">
                      <strong className="block text-[8.5px] text-neutral-900 font-bold">{toTitleCase(company.companyFullName)}</strong>
                      <p className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 min-w-[14px] rounded-[2px] bg-[#3b6fb6] flex items-center justify-center text-white shrink-0">
                          <svg viewBox="0 0 24 24" className="w-2 h-2 fill-current"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.72 11.72 0 003.7.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.7 1 1 0 01-.27 1.11l-2.2 2.18z"/></svg>
                        </span>
                        <span>{candidate.contact}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 min-w-[14px] rounded-[2px] bg-[#3b6fb6] flex items-center justify-center text-white shrink-0">
                          <svg viewBox="0 0 24 24" className="w-2 h-2 fill-current"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        </span>
                        <span>{candidate.email}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 min-w-[14px] rounded-[2px] bg-[#3b6fb6] flex items-center justify-center text-white shrink-0">
                          <svg viewBox="0 0 24 24" className="w-2 h-2 fill-none stroke-current stroke-[2.5] stroke-linecap-round stroke-linejoin-round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        </span>
                        <span>{company.companyWebsite}</span>
                      </p>
                      <p className="flex items-start gap-1.5 line-clamp-2 leading-tight">
                        <span className="w-3.5 h-3.5 min-w-[14px] rounded-[2px] bg-[#3b6fb6] flex items-center justify-center text-white shrink-0 mt-0.5">
                          <svg viewBox="0 0 24 24" className="w-2 h-2 fill-current"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                        </span>
                        <span>{company.companyAddress}</span>
                      </p>
                    </div>

                    <img src={qrUrl} alt="vCard QR" className="h-14 w-14 object-contain rounded-none" />
                  </div>
                </div>
              </div>

              {/* Business Back Common - Logo with Tagline Centered */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-red-400">Back Common: 89mm Width &amp; 51mm Height</span>
                <div className="w-[360px] h-[210px] bg-white text-neutral-900 rounded-none p-5 shadow-2xl border border-neutral-400 flex flex-col items-center justify-center text-center overflow-hidden relative select-none">
                  {/* Logo with Tagline - Adjusted (+15% from 143px) */}
                  <img src="/logos/Logo_Black_Tagline.png" alt="Transvolt Logo with Tagline" className="w-[165px] object-contain" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-800 py-4 text-center text-xs text-neutral-500">
        Transvolt Mobility Private Limited • Secured with 7-Hour Time Expiration Policy
      </footer>
    </div>
  )
}
