"use client"

import * as React from "react"
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  Play,
  CheckCircle2,
  HelpCircle,
  X,
  GripHorizontal,
  Radio,
  Globe,
  Flame,
  Wheat,
  Palette,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EvaBotMessage, EvaExecutionMode, EvaPersona } from "@/types/eva-editor"
import { PERSONA_PROFILES, PersonaProfile } from "./eva-persona-engine"
import { cn } from "@/lib/utils"

interface EvaBotPanelProps {
  isListening: boolean
  isMuted: boolean
  isSpeaking?: boolean
  onToggleListening: () => void
  onToggleMute: () => void
  userName: string
  onUserNameChange: (name: string) => void
  messages: EvaBotMessage[]
  onSendMessage: (text: string) => void
  executionMode: EvaExecutionMode
  onExecutionModeChange: (mode: EvaExecutionMode) => void
  activePersona: EvaPersona
  onPersonaChange: (persona: EvaPersona) => void
  vadProgress?: { silenceMs: number; progressPercent: number; isLocked: boolean } | null
  wakeWordDetected?: boolean
  activeResearchSource?: string[] | null
  connectedSourcesCount?: number
  onOpenReferenceSites?: () => void
  onPlayGreeting?: () => void
  pendingAction?: { label: string; execute: () => void } | null
  onCancelPendingAction?: () => void
  onTestVoice?: () => void
  onClose?: () => void
  onDragStart?: (e: React.MouseEvent) => void
}

export function EvaBotPanel({
  isListening,
  isMuted,
  isSpeaking = false,
  onToggleListening,
  onToggleMute,
  userName,
  onUserNameChange,
  messages,
  onSendMessage,
  executionMode,
  onExecutionModeChange,
  activePersona,
  onPersonaChange,
  vadProgress,
  wakeWordDetected = false,
  activeResearchSource = null,
  connectedSourcesCount = 4,
  onOpenReferenceSites,
  onPlayGreeting,
  pendingAction,
  onCancelPendingAction,
  onTestVoice,
  onClose,
  onDragStart,
}: EvaBotPanelProps) {
  const [inputText, setInputText] = React.useState("")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const currentProfile: PersonaProfile = PERSONA_PROFILES[activePersona] || PERSONA_PROFILES.basic

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, pendingAction, activeResearchSource])

  const handleSend = () => {
    if (!inputText.trim()) return
    onSendMessage(inputText.trim())
    setInputText("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSummarizePrompt = () => {
    if (!inputText.trim()) {
      if (activePersona === "tapori") {
        setInputText("Apun ko ek ekdum faadu landing page hero section maangta hai glassmorphism cards ke sath.")
      } else if (activePersona === "bihari") {
        setInputText("Raua khatir ekdum shandaar modern executive resume layout canvas par saja dijiye.")
      } else {
        setInputText("Create an executive landing page hero section with glassmorphism cards, auto-layout flex, and high-contrast typography.")
      }
      return
    }
    // Enhance prompt
    setInputText(`Design high-fidelity production component: ${inputText.trim()} using balanced 8pt vertical rhythm, brand tokens, and clean vector geometry.`)
  }

  return (
    <div className="flex flex-col w-full rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300">
      {/* ─── Top Window Header / Drag Bar ─── */}
      <div
        className={cn(
          "px-3 py-1.5 bg-muted/80 border-b border-border/70 flex items-center justify-between select-none",
          onDragStart ? "cursor-grab active:cursor-grabbing" : ""
        )}
        onMouseDown={onDragStart}
      >
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
          <GripHorizontal className="h-3.5 w-3.5 text-muted-foreground/70" />
          <span className="font-bold text-foreground">Eva Architect Agent</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 font-mono">
            V4 PRO
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="h-5 w-5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            title="Close Eva Bot"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ─── PERSONA TOGGLE DOCK (Basic | Tapori | Bihari) ─────────────── */}
      <div className="px-2.5 py-2 bg-background/80 border-b border-border/60 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="font-semibold uppercase tracking-wider text-[9px]">Select Persona Tone:</span>
          <span className="font-medium text-foreground/80 flex items-center gap-1">
            <span>{currentProfile.emoji}</span>
            <span className="font-bold">{currentProfile.label}</span>
          </span>
        </div>

        {/* 3 High-Density Micro-Pills (Segmented Control) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/70">
          {/* Button 1: Basic */}
          <button
            type="button"
            onClick={() => onPersonaChange("basic")}
            className={cn(
              "flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer select-none",
              activePersona === "basic"
                ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            )}
            title="Basic: Polite, articulate, senior design co-pilot (English / Hinglish)"
          >
            <Palette className="h-3 w-3 shrink-0" />
            <span>Basic</span>
          </button>

          {/* Button 2: Tapori */}
          <button
            type="button"
            onClick={() => onPersonaChange("tapori")}
            className={cn(
              "flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer select-none",
              activePersona === "tapori"
                ? "bg-amber-600 text-white shadow-sm ring-1 ring-amber-400"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            )}
            title="Tapori: Street-smart, authentic Mumbaikar Bambaiya slang (Fearless & Witty)"
          >
            <Flame className="h-3 w-3 shrink-0" />
            <span>Tapori</span>
          </button>

          {/* Button 3: Bihari */}
          <button
            type="button"
            onClick={() => onPersonaChange("bihari")}
            className={cn(
              "flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer select-none",
              activePersona === "bihari"
                ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            )}
            title="Bihari: Desi, respectful, charismatic eastern Hindi cadence (Grounded & Confident)"
          >
            <Wheat className="h-3 w-3 shrink-0" />
            <span>Bihari</span>
          </button>
        </div>

        {/* Connect Reference Sites Research Bar */}
        {onOpenReferenceSites && (
          <button
            type="button"
            onClick={onOpenReferenceSites}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[10px] font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 transition-all cursor-pointer select-none"
            title="Manage connected reference sites (Pinterest, Magnific AI, Victzity Vector Hub)"
          >
            <div className="flex items-center gap-1.5">
              <Globe className="h-3 w-3 text-cyan-500 animate-pulse" />
              <span>Reference Sites Research:</span>
              <span className="font-bold text-foreground bg-cyan-500/20 px-1.5 py-0.2 rounded-full">
                {connectedSourcesCount} Active
              </span>
            </div>
            <span className="text-[9px] underline opacity-80 hover:opacity-100">Study Sources &rarr;</span>
          </button>
        )}
      </div>

      {/* ─── 1. Header: Eva Bot Listening Button + Waveform + Mute ────── */}
      <div className="p-3 bg-muted/30 border-b border-border/70 flex items-center justify-between gap-2">
        {/* Full Interactive Eva Bot Button */}
        <button
          onClick={onToggleListening}
          className={cn(
            "flex-1 flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm cursor-pointer select-none",
            isListening
              ? "bg-[#0070f3] text-white shadow-[0_0_18px_rgba(0,112,243,0.5)] ring-2 ring-blue-400"
              : "bg-[#0070f3]/15 text-[#0070f3] hover:bg-[#0070f3]/25 border border-[#0070f3]/30"
          )}
          title={isListening ? "Listening with 2000ms VAD (Say 'Hi Eva' or tap to speak)" : "Click to Start Voice Commands with Eva"}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                isListening ? "bg-white animate-ping" : "bg-[#0070f3]"
              )}
            />
            <div className="flex flex-col text-left">
              <span className="font-extrabold tracking-wide leading-none">Eva Bot</span>
              <span className="text-[9px] opacity-80 font-normal mt-0.5">
                {wakeWordDetected ? "Wake Detected!" : isListening ? "Listening (2s VAD)" : "Voice Ready"}
              </span>
            </div>
          </div>

          {/* Real Audio Waveform Visualization */}
          <div className="flex items-center gap-0.5 h-4 px-2">
            {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
              <span
                key={bar}
                className={cn(
                  "w-1 rounded-full transition-all duration-150",
                  isListening ? "bg-white animate-pulse" : "bg-[#0070f3]/40"
                )}
                style={{
                  height: isListening
                    ? `${Math.max(4, Math.sin(bar * 0.8) * 14 + 8)}px`
                    : "4px",
                  animationDelay: `${bar * 90}ms`,
                }}
              />
            ))}
          </div>

          <Mic className={cn("h-4 w-4", isListening ? "text-white" : "text-[#0070f3]")} />
        </button>

        {/* Independent Speaker Audio Stop / Mute Button */}
        <Button
          size="icon"
          variant="outline"
          onClick={onToggleMute}
          className={cn(
            "h-9 w-9 rounded-xl shrink-0 transition-colors",
            isMuted
              ? "text-destructive border-destructive/40 bg-destructive/10"
              : "text-foreground/80 hover:text-foreground"
          )}
          title={isMuted ? "Unmute Eva Voice" : "Stop Eva's Audio Voice (Mute)"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* ─── 2000ms VAD Silence Countdown Progress Bar ───────────────── */}
      {isListening && vadProgress && vadProgress.silenceMs > 0 && (
        <div className="px-3 py-1 bg-blue-500/10 border-b border-blue-500/20 flex flex-col gap-0.5 text-[10px] text-blue-600 dark:text-blue-400">
          <div className="flex items-center justify-between font-mono text-[9px]">
            <span>VAD Silence Detection (2000ms):</span>
            <span className="font-bold">{vadProgress.silenceMs}ms / 2000ms</span>
          </div>
          <div className="w-full h-1 bg-blue-500/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-100 rounded-full"
              style={{ width: `${vadProgress.progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* ─── Connect Website Live Research Banner ─────────────────────── */}
      {activeResearchSource && activeResearchSource.length > 0 && (
        <div className="px-3 py-1.5 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 animate-pulse">
          <div className="flex items-center gap-1.5 font-medium">
            <Globe className="h-3 w-3 animate-spin text-emerald-500" />
            <span>Connect Website Researching:</span>
            <span className="font-bold underline">{activeResearchSource.join(" & ")}</span>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 font-bold">
            Live
          </span>
        </div>
      )}

      {/* ─── Active Voice Profile + Dynamic Greet Trigger ─────────────── */}
      <div className="px-3.5 py-1.5 border-b border-border/40 bg-muted/20 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Volume2 className={cn("h-3.5 w-3.5", isSpeaking ? "text-emerald-500 animate-bounce" : "text-primary")} />
          <span>Voice:</span>
          <span className="font-semibold text-foreground">{currentProfile.voiceName}</span>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-bold border border-border">
            {currentProfile.voiceLanguage}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onPlayGreeting && (
            <button
              onClick={onPlayGreeting}
              className="flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-primary/10"
              title="Trigger non-repeating dynamic greeting for current persona"
            >
              <Sparkles className="h-2.5 w-2.5 text-primary" />
              <span>Greet</span>
            </button>
          )}

          {onTestVoice && (
            <button
              onClick={onTestVoice}
              className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:opacity-80 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-emerald-500/10"
              title="Test Voice Synthesis"
            >
              <Play className="h-2.5 w-2.5 fill-current" />
              <span>Sample</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── User Name Field & Wake Word Rule Tag ─────────────────────── */}
      <div className="px-3.5 py-1.5 border-b border-border/50 bg-background/50 flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 flex-1">
          <span className="font-semibold text-muted-foreground whitespace-nowrap">
            User:
          </span>
          <input
            type="text"
            value={userName}
            onChange={(e) => onUserNameChange(e.target.value)}
            placeholder="Enter Name"
            className="flex-1 bg-transparent text-xs font-medium text-foreground focus:outline-hidden placeholder:text-muted-foreground/60"
          />
        </div>
        <span className="text-[9px] text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.5 rounded">
          Wake: &quot;Hi Eva&quot;
        </span>
      </div>

      {/* ─── Conversation Timeline History ───────────────────────────── */}
      <div className="flex-1 min-h-[140px] max-h-[190px] overflow-y-auto p-3 space-y-2.5 overlay-scrollbar text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[92%] rounded-xl px-3 py-2 text-xs",
              msg.sender === "user"
                ? "ml-auto bg-[#0070f3] text-white rounded-br-2xs"
                : "mr-auto bg-muted/80 text-foreground rounded-bl-2xs border border-border/60"
            )}
          >
            <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-0.5">
              <span className="font-bold flex items-center gap-1">
                {msg.sender === "user" ? (
                  userName || "You"
                ) : (
                  <>
                    <span>Eva</span>
                    {msg.persona && (
                      <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-background/50 uppercase">
                        {msg.persona}
                      </span>
                    )}
                  </>
                )}
              </span>
              <span>{msg.timestamp}</span>
            </div>
            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

            {msg.actionPerformed && (
              <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>{msg.actionPerformed}</span>
              </div>
            )}
          </div>
        ))}

        {/* Pending Action Confirmation Banner (Ask For Proceed Mode) */}
        {pendingAction && (
          <div className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs space-y-2 animate-in fade-in-50">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <HelpCircle className="h-4 w-4 shrink-0" />
              <span>Permission Confirmation</span>
            </div>
            <p className="text-[11px] text-foreground/90">
              Eva is ready to architect: <strong>{pendingAction.label}</strong>. Proceed?
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                onClick={pendingAction.execute}
                className="h-7 text-xs px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
              >
                Proceed
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onCancelPendingAction}
                className="h-7 text-xs px-2.5 border-border cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── Smart Visual Audit & Polish Chips ──────────────────────── */}
      <div className="px-2.5 py-1.5 border-t border-border/50 bg-muted/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onSendMessage("Critique the design on canvas")}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 transition-all shrink-0 cursor-pointer select-none"
          title="Ask Eva to judge canvas layout, alignment, colors, and typography"
        >
          <Eye className="h-2.5 w-2.5" />
          <span>Judge Canvas</span>
        </button>

        <button
          type="button"
          onClick={() => onSendMessage("Fix alignment")}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 transition-all shrink-0 cursor-pointer select-none"
          title="Auto-align canvas objects to central axis and consistent 8pt margins"
        >
          <Sparkles className="h-2.5 w-2.5" />
          <span>Fix Alignment</span>
        </button>

        <button
          type="button"
          onClick={() => onSendMessage("Fix colors and improve contrast")}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/25 transition-all shrink-0 cursor-pointer select-none"
          title="Enhance color harmony and optimize WCAG text contrast"
        >
          <Palette className="h-2.5 w-2.5" />
          <span>Fix Colors</span>
        </button>
      </div>

      {/* ─── Quick Text Prompt Input ─────────────────────────────────── */}
      <div className="p-2 border-t border-border/60 bg-background/40 flex items-center gap-1.5">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Eva: 'Build an ATS resume', 'Create house plan'..."
          className="text-xs h-8 rounded-lg bg-background/80"
        />
        <Button
          size="icon"
          onClick={handleSend}
          className="h-8 w-8 rounded-lg bg-[#0070f3] hover:bg-[#0070f3]/90 text-white shrink-0 cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* ─── Bottom Controls: Auto Proceed & Summarize ───────────────── */}
      <div className="p-2.5 bg-muted/20 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Mode Radio Selection */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px]">
            <input
              type="radio"
              name="eva_execution_mode"
              checked={executionMode === "auto"}
              onChange={() => onExecutionModeChange("auto")}
              className="accent-[#0070f3] cursor-pointer"
            />
            <span className="font-semibold text-foreground">Auto Proceed</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px]">
            <input
              type="radio"
              name="eva_execution_mode"
              checked={executionMode === "ask"}
              onChange={() => onExecutionModeChange("ask")}
              className="accent-[#0070f3] cursor-pointer"
            />
            <span className="text-muted-foreground">Ask For Proceed</span>
          </label>
        </div>

        {/* Action Buttons: Summarize / Proceed */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSummarizePrompt}
            className="h-7 text-[11px] px-2.5 border-border/70 hover:border-[#0070f3]/40 cursor-pointer"
            title="Enhance sentence structure with AI design architect rules"
          >
            Summarize
          </Button>

          {pendingAction && (
            <Button
              size="sm"
              onClick={pendingAction.execute}
              className="h-7 text-[11px] px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
            >
              Proceed
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
