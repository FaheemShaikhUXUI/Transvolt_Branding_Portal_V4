"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, Play, Pause, Volume2, Sparkles, Check, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface GenerateVoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetListName: "Up" | "Down" | "Others" | string
  companyName?: string
  onAudioGenerated: (track: {
    title: string
    scriptText: string
    voiceGender: "Male" | "Female"
    voiceModel: string
    speed: number
    pitch: number
    duration: string
    listType: "Up" | "Down" | "Others"
  }) => void
}

const VOICE_OPTIONS = [
  { id: "hi-swara", name: "66. Hindi (India) - IN (Swara)", lang: "hi-IN", gender: "Female" },
  { id: "gu-dhwani", name: "64. Gujarati (India) - IN (Dhwani)", lang: "gu-IN", gender: "Female" },
  { id: "gu-niranjan", name: "Gujarati (India) - Male (Niranjan)", lang: "gu-IN", gender: "Male" },
  { id: "en-aria", name: "English (India) - Female (Aria)", lang: "en-IN", gender: "Female" },
  { id: "en-prabhat", name: "English (India) - Male (Prabhat)", lang: "en-IN", gender: "Male" },
]

export function GenerateVoiceModal({
  open,
  onOpenChange,
  targetListName,
  companyName,
  onAudioGenerated,
}: GenerateVoiceModalProps) {
  const [voiceGender, setVoiceGender] = React.useState<"Male" | "Female">("Female")
  const [selectedVoiceId, setSelectedVoiceId] = React.useState("hi-swara")
  const [voiceSpeed, setVoiceSpeed] = React.useState(0) // -50% to +50% (default 0%)
  const [speechPitch, setSpeechPitch] = React.useState(0) // -50% to +50% (default 0%)
  const [textInput, setTextInput] = React.useState("")
  
  // Audio playback preview state
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isLoadingAudio, setIsLoadingAudio] = React.useState(false)
  const [isAudioSoundEmitting, setIsAudioSoundEmitting] = React.useState(false)
  const [catTalkingIndex, setCatTalkingIndex] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState(0.0)
  const [totalDuration, setTotalDuration] = React.useState(4.0)
  const [hasGenerated, setHasGenerated] = React.useState(false)

  const audioElemRef = React.useRef<HTMLAudioElement | null>(null)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  const playRequestIdRef = React.useRef<number>(0)

  // Preload all 3 cat frames on mount for instant zero-delay switching
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const img1 = new window.Image()
      img1.src = "/cat-avatar/cat-1.png?v=2"
      const img2 = new window.Image()
      img2.src = "/cat-avatar/cat-2.png?v=2"
      const img3 = new window.Image()
      img3.src = "/cat-avatar/cat-3.png?v=2"
    }
  }, [])

  // Natural speech mouth cycle: Closed (0) -> Half-Open (1) -> Open (2) -> Half-Open (1)
  // Animate mouth ONLY when audio sound is actually being emitted through speaker
  React.useEffect(() => {
    if (!isAudioSoundEmitting) {
      setCatTalkingIndex(0)
      return
    }

    const mouthSequence = [0, 1, 2, 1]
    let step = 0

    const timer = setInterval(() => {
      step = (step + 1) % mouthSequence.length
      setCatTalkingIndex(mouthSequence[step])
    }, 130)

    return () => clearInterval(timer)
  }, [isAudioSoundEmitting])

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setTextInput("")
      setVoiceSpeed(0)
      setSpeechPitch(0)
      setVoiceGender("Female")
      setSelectedVoiceId("hi-swara")
      setIsPlaying(false)
      setIsLoadingAudio(false)
      setIsAudioSoundEmitting(false)
      setCatTalkingIndex(0)
      setCurrentTime(0)
      setHasGenerated(false)
      if (audioElemRef.current) {
        audioElemRef.current.pause()
        audioElemRef.current = null
      }
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [open])

  // Automatically update selected voice when gender changes
  const handleGenderChange = (gender: "Male" | "Female") => {
    setVoiceGender(gender)
    const matchingVoice = VOICE_OPTIONS.find((v) => v.gender === gender)
    if (matchingVoice) {
      setSelectedVoiceId(matchingVoice.id)
    }
  }

  // Play natural female Hindi Swara audio stream directly from Neural API
  const playAudio = async () => {
    const trimmed = textInput.trim()
    if (!trimmed) {
      toast.error("Please enter text before playing audio.")
      return
    }

    if (timerRef.current) clearInterval(timerRef.current)
    if (audioElemRef.current) {
      audioElemRef.current.pause()
      audioElemRef.current = null
    }

    const currentReq = ++playRequestIdRef.current
    setIsLoadingAudio(true)
    setIsAudioSoundEmitting(false)
    setCurrentTime(0.0)

    try {
      const response = await fetch("/api/tts/dhwani", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          gender: voiceGender,
          voiceModel: selectedVoiceId,
          speed: voiceSpeed,
          pitch: speechPitch,
        }),
      })

      if (playRequestIdRef.current !== currentReq) return

      if (response.ok) {
        const blob = await response.blob()
        if (playRequestIdRef.current !== currentReq) return

        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)
        audioElemRef.current = audio

        audio.onloadedmetadata = () => {
          if (audio.duration && !isNaN(audio.duration)) {
            setTotalDuration(Math.max(2, Math.min(15, audio.duration)))
          }
        }

        audio.ontimeupdate = () => {
          setCurrentTime(audio.currentTime)
        }

        audio.onplay = () => {
          if (playRequestIdRef.current !== currentReq) return
          setIsLoadingAudio(false)
          setIsPlaying(true)
          setIsAudioSoundEmitting(true)
        }

        audio.onplaying = () => {
          if (playRequestIdRef.current !== currentReq) return
          setIsLoadingAudio(false)
          setIsPlaying(true)
          setIsAudioSoundEmitting(true)
        }

        audio.onpause = () => {
          setIsPlaying(false)
          setIsAudioSoundEmitting(false)
        }

        audio.onended = () => {
          setIsPlaying(false)
          setIsAudioSoundEmitting(false)
          setCurrentTime(audio.duration || 4.0)
          URL.revokeObjectURL(audioUrl)
        }

        audio.onerror = () => {
          setIsLoadingAudio(false)
          setIsPlaying(false)
          setIsAudioSoundEmitting(false)
          URL.revokeObjectURL(audioUrl)
        }

        await audio.play()
        return
      }
    } catch (err) {
      console.warn("Neural Swara TTS fetch error:", err)
    }

    if (playRequestIdRef.current !== currentReq) return

    // Fallback if stream fails
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const synth = window.speechSynthesis
      synth.cancel()
      const utterance = new SpeechSynthesisUtterance(trimmed)
      const voiceObj = VOICE_OPTIONS.find((v) => v.id === selectedVoiceId)
      utterance.lang = voiceObj ? voiceObj.lang : "hi-IN"
      utterance.pitch = voiceGender === "Female" ? 1.45 : 0.85
      utterance.rate = 0.95
      utterance.onstart = () => {
        if (playRequestIdRef.current !== currentReq) return
        setIsLoadingAudio(false)
        setIsPlaying(true)
        setIsAudioSoundEmitting(true)
      }
      utterance.onend = () => {
        setIsPlaying(false)
        setIsAudioSoundEmitting(false)
      }
      utterance.onerror = () => {
        setIsLoadingAudio(false)
        setIsPlaying(false)
        setIsAudioSoundEmitting(false)
      }
      synth.speak(utterance)
    } else {
      setIsLoadingAudio(false)
      setIsPlaying(false)
      setIsAudioSoundEmitting(false)
    }
  }

  const togglePlayPause = () => {
    if (isPlaying || isLoadingAudio || isAudioSoundEmitting) {
      playRequestIdRef.current++
      if (audioElemRef.current) {
        audioElemRef.current.pause()
        audioElemRef.current = null
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
      if (timerRef.current) clearInterval(timerRef.current)
      setIsLoadingAudio(false)
      setIsPlaying(false)
      setIsAudioSoundEmitting(false)
    } else {
      playAudio()
    }
  }

  // Handle Generate Audio Preview (plays preview and keeps modal open)
  const handleGeneratePreview = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const trimmedText = textInput.trim()
    if (!trimmedText) {
      toast.error("Please enter stop name or audio script text first.")
      return
    }

    setHasGenerated(true)
    toast.success(`Synthesizing Swara female voice for "${trimmedText}"...`)
    playAudio()
  }

  // Handle Save Button Click: Adds audio to the list and closes the popout
  const handleSaveToList = () => {
    const trimmedText = textInput.trim()
    if (!trimmedText) {
      toast.error("Please enter stop name or audio script text before saving.")
      return
    }

    const currentVoiceObj = VOICE_OPTIONS.find((v) => v.id === selectedVoiceId)

    // Save track to parent list
    onAudioGenerated({
      title: trimmedText,
      scriptText: trimmedText,
      voiceGender: voiceGender,
      voiceModel: currentVoiceObj ? currentVoiceObj.name : "66. Hindi (India) - IN (Swara)",
      speed: voiceSpeed,
      pitch: speechPitch,
      duration: "00:04",
      listType: (targetListName === "Down" ? "Down" : targetListName === "Others" ? "Others" : "Up") as "Up" | "Down" | "Others",
    })

    // Stop preview playback if running
    playRequestIdRef.current++
    if (audioElemRef.current) {
      audioElemRef.current.pause()
      audioElemRef.current = null
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setIsLoadingAudio(false)
    setIsPlaying(false)
    setIsAudioSoundEmitting(false)
    setCatTalkingIndex(0)

    toast.success(`"${trimmedText}" saved to ${targetListName} list!`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Wider 860px modal; [&>button]:hidden removes the default DialogContent X so only ours shows */}
      <DialogContent className="sm:max-w-[860px] bg-card text-card-foreground border border-border shadow-2xl p-0 overflow-hidden rounded-2xl animate-in fade-in-50 [&>button]:hidden">

        {/* ── Header: Title + single custom close button ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-card">
          <DialogTitle className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            Generate Audio For: {targetListName}
            {hasGenerated && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#4472C4]/15 text-[#4472C4] font-bold border border-[#4472C4]/25">
                Preview Ready
              </span>
            )}
          </DialogTitle>

          {/* Single red ✕ close button */}
          <button
            type="button"
            onClick={() => {
              playRequestIdRef.current++
              if (audioElemRef.current) {
                audioElemRef.current.pause()
                audioElemRef.current = null
              }
              if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel()
              }
              if (timerRef.current) clearInterval(timerRef.current)
              setIsLoadingAudio(false)
              setIsPlaying(false)
              setIsAudioSoundEmitting(false)
              setCatTalkingIndex(0)
              onOpenChange(false)
            }}
            className="h-8 w-8 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors focus:outline-none cursor-pointer"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={handleGeneratePreview} className="p-6 space-y-5">

          {/* ── Row 1: "Select Voice:" radios  |  "Voice Engine:" dropdown — all on ONE line ── */}
          <div className="flex items-center gap-5 flex-wrap">

            {/* Left cluster: Select Voice label + Male / Female radios */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-foreground shrink-0">Select Voice:</span>

              <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none">
                <input
                  type="radio"
                  name="gender"
                  checked={voiceGender === "Male"}
                  onChange={() => handleGenderChange("Male")}
                  className="h-4 w-4 text-[#4472C4] focus:ring-[#4472C4] border-border cursor-pointer"
                />
                <span>Male</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                <input
                  type="radio"
                  name="gender"
                  checked={voiceGender === "Female"}
                  onChange={() => handleGenderChange("Female")}
                  className="h-4 w-4 text-[#4472C4] focus:ring-[#4472C4] border-border cursor-pointer"
                />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Female (Swara)</span>
              </label>
            </div>

            {/* Thin vertical divider */}
            <div className="h-5 w-px bg-border" />

            {/* Right cluster: Voice Engine label + dropdown — inline, same row */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground shrink-0">Voice Engine:</span>
              <select
                value={selectedVoiceId}
                onChange={(e) => setSelectedVoiceId(e.target.value)}
                className="bg-background border border-border text-foreground font-semibold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#4472C4]/20 cursor-pointer min-w-[250px]"
              >
                {VOICE_OPTIONS.map((voice) => (
                  <option key={voice.id} value={voice.id} className="bg-popover text-popover-foreground">
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Row 2: Voice Speed & Speech Pitch sliders side-by-side ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/40 border border-border/80 rounded-xl flex items-center gap-3">
              <span className="text-xs font-bold text-foreground shrink-0 w-20">Voice Speed</span>
              <input
                type="range" min="-50" max="50" value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(Number(e.target.value))}
                className="w-full h-1.5 bg-muted-foreground/30 rounded-lg appearance-none cursor-pointer accent-[#4472C4]"
              />
              <span className="text-xs font-bold text-muted-foreground shrink-0 w-9 text-right font-mono">
                {voiceSpeed > 0 ? `+${voiceSpeed}%` : `${voiceSpeed}%`}
              </span>
            </div>

            <div className="p-3 bg-muted/40 border border-border/80 rounded-xl flex items-center gap-3">
              <span className="text-xs font-bold text-foreground shrink-0 w-20">Speech Pitch</span>
              <input
                type="range" min="-50" max="50" value={speechPitch}
                onChange={(e) => setSpeechPitch(Number(e.target.value))}
                className="w-full h-1.5 bg-muted-foreground/30 rounded-lg appearance-none cursor-pointer accent-[#4472C4]"
              />
              <span className="text-xs font-bold text-muted-foreground shrink-0 w-9 text-right font-mono">
                {speechPitch > 0 ? `+${speechPitch}%` : `${speechPitch}%`}
              </span>
            </div>
          </div>

          {/* ── Row 3: Enter Text textarea + Talking Cat Avatar ── */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-foreground">Enter Text</Label>
            <div className="flex items-center gap-3.5">
              <Textarea
                rows={4}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter Stop Name or Audio Script (e.g. મુંબઈ એચક્યુ / Versova Bridge)..."
                className="flex-1 bg-background border border-border focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 text-foreground placeholder:text-muted-foreground rounded-xl p-3 text-sm leading-relaxed font-medium resize-none"
                required
              />

              {/* Talking Cat Avatar - Pure PNG only, no borders, backgrounds, or decorative elements */}
              <div
                className="relative w-20 h-20 sm:w-[84px] sm:h-[84px] shrink-0 select-none pointer-events-none"
                title={isAudioSoundEmitting ? "Cat is speaking..." : "Cat Companion"}
              >
                <img
                  src="/cat-avatar/cat-1.png?v=2"
                  alt="Cat Idle"
                  className={`absolute inset-0 w-full h-full object-contain select-none pointer-events-none ${
                    catTalkingIndex === 0 ? "block" : "hidden"
                  }`}
                />
                <img
                  src="/cat-avatar/cat-2.png?v=2"
                  alt="Cat Speaking"
                  className={`absolute inset-0 w-full h-full object-contain select-none pointer-events-none ${
                    catTalkingIndex === 1 ? "block" : "hidden"
                  }`}
                />
                <img
                  src="/cat-avatar/cat-3.png?v=2"
                  alt="Cat Talking"
                  className={`absolute inset-0 w-full h-full object-contain select-none pointer-events-none ${
                    catTalkingIndex === 2 ? "block" : "hidden"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* ── Row 4 (BOTTOM): Audio player  +  Cancel  +  Generate Audio  +  Save — ONE single row ── */}
          <div className="flex items-center gap-3 pt-1">

            {/* Audio preview player — grows to fill space */}
            <div className="flex-1 min-w-0 bg-muted/50 border border-border/80 rounded-xl px-3 py-2 flex items-center gap-3 shadow-inner">
              <input
                type="range" min="0" max={totalDuration} step="0.1" value={currentTime}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setCurrentTime(val)
                  if (audioElemRef.current) audioElemRef.current.currentTime = val
                }}
                className="flex-1 min-w-0 h-1.5 bg-muted-foreground/30 rounded-lg appearance-none cursor-pointer accent-[#4472C4]"
              />
              <span className="text-[11px] font-semibold text-muted-foreground shrink-0 font-mono whitespace-nowrap">
                {currentTime.toFixed(2)} / {totalDuration.toFixed(2)} Sec
              </span>
              <button
                type="button"
                onClick={togglePlayPause}
                className="h-8 w-8 rounded-full bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center transition-all shrink-0 focus:outline-none cursor-pointer active:scale-95 shadow-xs border border-border/60"
                title={isLoadingAudio ? "Loading audio..." : isPlaying ? "Pause" : "Play Preview"}
              >
                {isLoadingAudio ? (
                  <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                ) : isPlaying ? (
                  <Pause className="h-4 w-4 fill-current text-foreground" />
                ) : (
                  <Play  className="h-4 w-4 fill-current text-foreground ml-0.5" />
                )}
              </button>
            </div>

            {/* Cancel */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                playRequestIdRef.current++
                if (audioElemRef.current) {
                  audioElemRef.current.pause()
                  audioElemRef.current = null
                }
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel()
                }
                if (timerRef.current) clearInterval(timerRef.current)
                setIsLoadingAudio(false)
                setIsPlaying(false)
                setIsAudioSoundEmitting(false)
                setCatTalkingIndex(0)
                onOpenChange(false)
              }}
              className="shrink-0 bg-muted hover:bg-muted/80 text-foreground border border-border/80 rounded-xl h-11 px-5 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </Button>

            {/* Generate Audio (blue) */}
            <Button
              type="button"
              disabled={isLoadingAudio}
              onClick={handleGeneratePreview}
              className="shrink-0 bg-[#4472C4] hover:bg-[#3b63ab] disabled:opacity-70 text-white font-bold rounded-xl h-11 px-5 text-xs shadow-sm border-0 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isLoadingAudio ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>{isLoadingAudio ? "Generating..." : "Generate Audio"}</span>
            </Button>

            {/* Save (green) */}
            <Button
              type="button"
              onClick={handleSaveToList}
              className="shrink-0 bg-[#548235] hover:bg-[#48732e] text-white font-bold rounded-xl h-11 px-5 text-xs shadow-md border-0 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              <span>Save</span>
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}

