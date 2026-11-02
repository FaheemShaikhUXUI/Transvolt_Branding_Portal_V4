"use client"

import React, { useState, useEffect } from "react"
import {
  Users,
  Send,
  FileCheck2,
  CalendarCheck2,
  Award,
  UserX,
  Settings,
  UserPlus,
  RefreshCw,
  TrendingUp,
  Briefcase,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Candidate, RecruitmentSettings } from "@/lib/hiring/types"

// Tabs
import { TabOverviewAnalytics } from "@/components/hiring/tabs/tab-overview-analytics"
import { TabReceivedForms } from "@/components/hiring/tabs/tab-received-forms"
import { TabUnderHiring } from "@/components/hiring/tabs/tab-under-hiring"
import { TabHiredEmployees } from "@/components/hiring/tabs/tab-hired-employees"
import { TabUnhiredCandidates } from "@/components/hiring/tabs/tab-unhired-candidates"
import { TabSentForms } from "@/components/hiring/tabs/tab-sent-forms"
import { TabSettings } from "@/components/hiring/tabs/tab-settings"

// Modals
import { HiringOptionsModal } from "@/components/hiring/hiring-options-modal"
import { CandidateDetailModal } from "@/components/hiring/candidate-detail-modal"
import { ScheduleInterviewModal } from "@/components/hiring/schedule-interview-modal"
import { InterviewEvaluationModal } from "@/components/hiring/interview-evaluation-modal"
import { HireCandidateModal } from "@/components/hiring/hire-candidate-modal"
import { RejectCandidateModal } from "@/components/hiring/reject-candidate-modal"
import { RequestInfoModal } from "@/components/hiring/request-info-modal"

type TabKey =
  | "overview"
  | "received"
  | "under_hiring"
  | "hired"
  | "unhired"
  | "sent"
  | "settings"

const DEFAULT_SETTINGS: RecruitmentSettings = {
  companyName: "Transvolt Mobility Private Limited",
  hrContactPerson: "HR Recruitment Cell (Faheem S.)",
  hrContactPhone: "+91 98200 12345",
  officeAddress: "Transvolt Mobility HQ, Powai, Mumbai, MH - 400076",
  recruitmentEmail: "careers@transvoltmobility.com",
  defaultDeadlineDays: 7,
  maxUploadSizeMb: 10,
  allowedFileTypes: [".pdf", ".jpg", ".png"],
  departments: [
    "Design & Branding",
    "EV Engineering & Powertrain",
    "Fleet Operations",
    "Software & IoT",
    "Sales & Business Development",
    "Battery Technology",
  ],
  positions: [
    "Senior EV Systems Engineer",
    "Lead UI/UX Designer",
    "Fleet Operations Manager",
    "Battery Safety Specialist",
    "Full Stack IoT Developer",
  ],
  interviewPlatforms: ["Google Meet", "Microsoft Teams", "Zoom", "In-person", "Other"],
}

export default function HiringProcessPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [settings, setSettings] = useState<RecruitmentSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  // Modals state
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const [scheduleCandidate, setScheduleCandidate] = useState<Candidate | null>(null)
  const [isRescheduleMode, setIsRescheduleMode] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)

  const [evalCandidate, setEvalCandidate] = useState<Candidate | null>(null)
  const [isEvalOpen, setIsEvalOpen] = useState(false)

  const [hireCandidate, setHireCandidate] = useState<Candidate | null>(null)
  const [isHireOpen, setIsHireOpen] = useState(false)

  const [rejectCandidate, setRejectCandidate] = useState<Candidate | null>(null)
  const [isRejectOpen, setIsRejectOpen] = useState(false)

  const [reqInfoCandidate, setReqInfoCandidate] = useState<Candidate | null>(null)
  const [isReqInfoOpen, setIsReqInfoOpen] = useState(false)

  // Fetch Candidates & Settings
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [candRes, setRes] = await Promise.all([
        fetch("/api/hiring/candidates"),
        fetch("/api/hiring/settings"),
      ])
      const candData = await candRes.json()
      const setData = await setRes.json()

      if (candData.success) {
        setCandidates(candData.candidates || [])
      }
      if (setData.success && setData.settings) {
        setSettings(setData.settings)
      }
    } catch (e) {
      console.error("Failed to load hiring process data:", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Candidate Status Counts
  const counts = {
    received: candidates.filter(
      (c) =>
        c.status === "UNDER_REVIEW" ||
        c.status === "CHANGES_REQUESTED" ||
        c.status === "INTERVIEW_COMPLETED"
    ).length,
    under_hiring: candidates.filter(
      (c) =>
        c.status === "INTERVIEW_SCHEDULED" ||
        c.status === "INTERVIEW_RESCHEDULED" ||
        c.status === "INTERVIEW_COMPLETED"
    ).length,
    hired: candidates.filter((c) => c.status === "HIRED").length,
    unhired: candidates.filter((c) => c.status === "NOT_SELECTED").length,
    sent: candidates.filter((c) => c.status === "APPLICATION_PENDING").length,
  }

  const handleUpdateCandidate = (updated: Candidate) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    )
    if (selectedCandidate && selectedCandidate.id === updated.id) {
      setSelectedCandidate(updated)
    }
  }

  const handleInvitationCreated = (newCand: Candidate) => {
    setCandidates((prev) => [newCand, ...prev])
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 pb-16">
      {/* Top Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800 px-6 py-5 sticky top-0 z-30 shadow-2xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-[#548235] text-white flex items-center justify-center shadow-md shadow-[#548235]/25">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Hiring Process
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#548235]/15 text-[#548235] border border-[#548235]/20">
                  RMS Module
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Transvolt Recruitment Lifecycle Management • Single Unique Link Architecture
              </p>
            </div>
          </div>

          {/* Top Actions: Prominent "Hiring Options" Button */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isLoading}
              className="h-9 px-3 text-xs text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
              title="Refresh Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>

            <Button
              onClick={() => setIsInviteOpen(true)}
              className="bg-[#548235] hover:bg-[#466e2c] text-white text-xs font-bold h-9 px-4.5 rounded-xl shadow-md shadow-[#548235]/25 gap-2 transition-all hover:scale-[1.02]"
            >
              <UserPlus className="h-4 w-4" />
              <span>Hiring Options</span>
            </Button>
          </div>
        </div>

        {/* Clean Horizontal Navigation Menu */}
        <div className="max-w-7xl mx-auto mt-5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
          {[
            { id: "overview", label: "Overview & Analytics", icon: TrendingUp, count: undefined },
            { id: "received", label: "Received Forms", icon: FileCheck2, count: counts.received },
            { id: "under_hiring", label: "Under Hiring Process", icon: CalendarCheck2, count: counts.under_hiring },
            { id: "hired", label: "Hired Employees", icon: Award, count: counts.hired },
            { id: "unhired", label: "Unhired Candidates", icon: UserX, count: counts.unhired },
            { id: "sent", label: "Sent Forms", icon: Send, count: counts.sent },
            { id: "settings", label: "Settings", icon: Settings, count: undefined },
          ].map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabKey)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none ${
                  isActive
                    ? "bg-[#548235] text-white shadow-sm shadow-[#548235]/20"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 pt-6 flex-1 w-full">
        {activeTab === "overview" && (
          <TabOverviewAnalytics
            candidates={candidates}
            settings={settings}
            onSelectCandidate={(c) => {
              setSelectedCandidate(c)
              setIsDetailOpen(true)
            }}
            onNavigateTab={(tab) => setActiveTab(tab as TabKey)}
            onOpenInvite={() => setIsInviteOpen(true)}
          />
        )}

        {activeTab === "received" && (
          <TabReceivedForms
            candidates={candidates}
            settings={settings}
            onSelectCandidate={(c) => {
              setSelectedCandidate(c)
              setIsDetailOpen(true)
            }}
            onOpenSchedule={(c) => {
              setScheduleCandidate(c)
              setIsRescheduleMode(false)
              setIsScheduleOpen(true)
            }}
            onOpenReject={(c) => {
              setRejectCandidate(c)
              setIsRejectOpen(true)
            }}
            onOpenRequestInfo={(c) => {
              setReqInfoCandidate(c)
              setIsReqInfoOpen(true)
            }}
          />
        )}

        {activeTab === "under_hiring" && (
          <TabUnderHiring
            candidates={candidates}
            settings={settings}
            onSelectCandidate={(c) => {
              setSelectedCandidate(c)
              setIsDetailOpen(true)
            }}
            onOpenSchedule={(c, isResched) => {
              setScheduleCandidate(c)
              setIsRescheduleMode(!!isResched)
              setIsScheduleOpen(true)
            }}
            onOpenEvaluation={(c) => {
              setEvalCandidate(c)
              setIsEvalOpen(true)
            }}
            onOpenHire={(c) => {
              setHireCandidate(c)
              setIsHireOpen(true)
            }}
            onOpenReject={(c) => {
              setRejectCandidate(c)
              setIsRejectOpen(true)
            }}
          />
        )}

        {activeTab === "hired" && (
          <TabHiredEmployees
            candidates={candidates}
            settings={settings}
            onSelectCandidate={(c) => {
              setSelectedCandidate(c)
              setIsDetailOpen(true)
            }}
          />
        )}

        {activeTab === "unhired" && (
          <TabUnhiredCandidates
            candidates={candidates}
            settings={settings}
            onSelectCandidate={(c) => {
              setSelectedCandidate(c)
              setIsDetailOpen(true)
            }}
          />
        )}

        {activeTab === "sent" && (
          <TabSentForms
            candidates={candidates}
            settings={settings}
            onSelectCandidate={(c) => {
              setSelectedCandidate(c)
              setIsDetailOpen(true)
            }}
            onOpenInvite={() => setIsInviteOpen(true)}
          />
        )}

        {activeTab === "settings" && (
          <TabSettings
            settings={settings}
            onUpdateSettings={(newSet) => setSettings(newSet)}
          />
        )}
      </div>

      {/* MODALS */}

      {/* 1. Hiring Options / Invitation Generator */}
      <HiringOptionsModal
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        onInvitationCreated={handleInvitationCreated}
        settings={settings}
      />

      {/* 2. Candidate Detail View */}
      <CandidateDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        candidate={selectedCandidate}
        settings={settings}
        onUpdateCandidate={handleUpdateCandidate}
        onOpenSchedule={(c, isResched) => {
          setScheduleCandidate(c)
          setIsRescheduleMode(!!isResched)
          setIsScheduleOpen(true)
        }}
        onOpenEvaluation={(c) => {
          setEvalCandidate(c)
          setIsEvalOpen(true)
        }}
        onOpenHire={(c) => {
          setHireCandidate(c)
          setIsHireOpen(true)
        }}
        onOpenReject={(c) => {
          setRejectCandidate(c)
          setIsRejectOpen(true)
        }}
        onOpenRequestInfo={(c) => {
          setReqInfoCandidate(c)
          setIsReqInfoOpen(true)
        }}
      />

      {/* 3. Schedule & Reschedule Interview Modal */}
      <ScheduleInterviewModal
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        candidate={scheduleCandidate}
        isReschedule={isRescheduleMode}
        settings={settings}
        onSuccess={handleUpdateCandidate}
      />

      {/* 4. Interview Evaluation Modal */}
      <InterviewEvaluationModal
        open={isEvalOpen}
        onOpenChange={setIsEvalOpen}
        candidate={evalCandidate}
        onSuccess={handleUpdateCandidate}
      />

      {/* 5. Hire Candidate Modal */}
      <HireCandidateModal
        open={isHireOpen}
        onOpenChange={setIsHireOpen}
        candidate={hireCandidate}
        settings={settings}
        onSuccess={handleUpdateCandidate}
      />

      {/* 6. Reject Candidate Modal */}
      <RejectCandidateModal
        open={isRejectOpen}
        onOpenChange={setIsRejectOpen}
        candidate={rejectCandidate}
        onSuccess={handleUpdateCandidate}
      />

      {/* 7. Request Info Modal */}
      <RequestInfoModal
        open={isReqInfoOpen}
        onOpenChange={setIsReqInfoOpen}
        candidate={reqInfoCandidate}
        onSuccess={handleUpdateCandidate}
      />
    </div>
  )
}

