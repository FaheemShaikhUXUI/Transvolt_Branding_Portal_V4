import { EvaPersona } from "@/types/eva-editor"
import { PERSONA_PROFILES, getNextDynamicGreeting } from "./eva-persona-engine"

export interface VadProgressEvent {
  silenceMs: number
  progressPercent: number
  isLocked: boolean
}

export class EvaVoiceEngine {
  private recognition: any = null
  private synth: SpeechSynthesis | null = null
  private currentAudio: HTMLAudioElement | null = null
  private isListening: boolean = false
  private isMuted: boolean = false
  private isSpeaking: boolean = false
  private activePersona: EvaPersona = "basic"

  // Echo Suppression & Anti-Loop Safeguards
  private speakingCooldownUntil: number = 0
  private recentSpokenPhrases: string[] = []
  private resumeListenTimer: any = null

  // VAD & Silence tracking (2000ms exact silence threshold)
  private vadSilenceThresholdMs: number = 2000
  private vadTimer: any = null
  private vadIntervalTimer: any = null
  private lastSpeechTimestamp: number = 0
  private accumulatedTranscript: string = ""
  private manualTurnActive: boolean = false
  private latestActiveText: string = ""

  // Callbacks
  private onTranscriptCallback: ((transcript: string, isFinal: boolean) => void) | null = null
  private onWakeWordDetectedCallback: ((detected: boolean) => void) | null = null
  private onVadProgressCallback: ((event: VadProgressEvent) => void) | null = null
  private onErrorCallback: ((error: string) => void) | null = null
  private onStateChangeCallback: ((listening: boolean) => void) | null = null
  private onSpeakingStateCallback: ((speaking: boolean) => void) | null = null

  constructor(persona: EvaPersona = "basic") {
    this.activePersona = persona
    if (typeof window !== "undefined") {
      this.synth = window.speechSynthesis || null
      this.initRecognition()
    }
  }

  private initRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = true
      this.recognition.interimResults = true
      // Use Indian English for accurate tech and design command recognition
      this.recognition.lang = "en-IN"

      this.recognition.onresult = (event: any) => {
        // ─── CRITICAL ANTI-LOOP GATE 1 ───
        // Drop any incoming audio if Eva is currently speaking or in room echo cooldown!
        if (this.isSpeaking || Date.now() < this.speakingCooldownUntil) {
          return
        }

        let interim = ""
        let finalChunk = ""

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript + " "
          } else {
            interim += event.results[i][0].transcript
          }
        }

        if (finalChunk.trim()) {
          this.accumulatedTranscript = (this.accumulatedTranscript + " " + finalChunk.trim()).trim()
        }

        const currentActiveText = (this.accumulatedTranscript + " " + interim).trim()
        if (!currentActiveText) return

        // ─── CRITICAL ANTI-LOOP GATE 2 ───
        // Check if incoming interim speech matches Eva's own recently spoken text
        if (this.isAcousticEcho(currentActiveText)) {
          return
        }

        this.latestActiveText = currentActiveText

        // Check for wake word prefix
        const lower = currentActiveText.toLowerCase()
        const hasWakeWord =
          lower.startsWith("eva") ||
          lower.startsWith("hi eva") ||
          lower.startsWith("hey eva") ||
          lower.startsWith("hello eva")

        if (hasWakeWord) {
          this.onWakeWordDetectedCallback?.(true)
        }

        // Send interim transcript to UI in real-time
        this.onTranscriptCallback?.(currentActiveText, false)

        // Reset and restart 2000ms Voice Activity Detection (VAD) silence counter
        this.restartVadTimer()
      }

      this.recognition.onerror = (event: any) => {
        if (event.error !== "no-speech" && event.error !== "aborted") {
          console.warn("Speech recognition notice:", event.error)
        }
      }

      this.recognition.onend = () => {
        // If speaking or in echo cooldown, do NOT restart recognition yet;
        // it will be safely resumed after the cooldown timer expires.
        if (this.isSpeaking || Date.now() < this.speakingCooldownUntil) {
          return
        }

        if (this.isListening) {
          // If we had speech that hasn't finalized yet, finalize it now
          if (this.latestActiveText.trim()) {
            this.finalizeUserTurn()
          }
          try {
            this.recognition.start()
          } catch {
            // will restart on next cycle
          }
        } else {
          this.onStateChangeCallback?.(false)
        }
      }
    }
  }

  /**
   * Triple-defense acoustic echo detection:
   * Compares candidate speech against Eva's recent spoken phrases.
   */
  private isAcousticEcho(candidateText: string): boolean {
    const cleanCand = candidateText.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim()
    if (!cleanCand || cleanCand.length < 3) return false

    const candWords = cleanCand.split(/\s+/).filter(Boolean)
    if (candWords.length === 0) return false

    for (const phrase of this.recentSpokenPhrases) {
      const cleanPhrase = phrase.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim()
      if (!cleanPhrase) continue

      // 1. Direct substring match (either contains the other)
      if (cleanPhrase.includes(cleanCand) || cleanCand.includes(cleanPhrase)) {
        return true
      }

      // 2. Token overlap ratio (Jaccard similarity)
      const phraseWords = new Set(cleanPhrase.split(/\s+/).filter(Boolean))
      let matches = 0
      for (const w of candWords) {
        if (phraseWords.has(w)) matches++
      }
      const ratio = matches / candWords.length
      if (ratio >= 0.5) {
        return true
      }
    }
    return false
  }

  private recordSpokenPhrase(text: string) {
    if (!text || !text.trim()) return
    this.recentSpokenPhrases.unshift(text.trim())
    if (this.recentSpokenPhrases.length > 8) {
      this.recentSpokenPhrases.pop()
    }
  }

  public setPersona(persona: EvaPersona) {
    this.activePersona = persona
    if (this.recognition) {
      this.recognition.lang = persona === "basic" ? "en-IN" : "hi-IN"
    }
  }

  public getPersona(): EvaPersona {
    return this.activePersona
  }

  public isSpeechSupported(): boolean {
    return Boolean(this.recognition)
  }

  public setWakeWordCallback(cb: (detected: boolean) => void) {
    this.onWakeWordDetectedCallback = cb
  }

  public setVadProgressCallback(cb: (event: VadProgressEvent) => void) {
    this.onVadProgressCallback = cb
  }

  public setSpeakingStateCallback(cb: (speaking: boolean) => void) {
    this.onSpeakingStateCallback = cb
  }

  /**
   * Starts continuous client-side listening with 2000ms VAD and Wake-word filter
   */
  public startListening(
    onTranscript: (text: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onStateChange: (listening: boolean) => void,
    explicitTurn: boolean = false
  ) {
    this.onTranscriptCallback = onTranscript
    this.onErrorCallback = onError
    this.onStateChangeCallback = onStateChange
    this.manualTurnActive = explicitTurn
    this.accumulatedTranscript = ""
    this.latestActiveText = ""

    if (!this.recognition) {
      onError("Speech recognition is not supported in this browser. You can type commands directly in Eva Bot's chat.")
      return
    }

    try {
      this.isListening = true
      this.recognition.start()
      this.onStateChangeCallback?.(true)
    } catch {
      // already listening
    }
  }

  public stopListening() {
    this.isListening = false
    this.clearVadTimers()
    if (this.resumeListenTimer) {
      clearTimeout(this.resumeListenTimer)
      this.resumeListenTimer = null
    }
    if (this.recognition) {
      try {
        this.recognition.stop()
      } catch {}
    }
    this.onStateChangeCallback?.(false)
    this.onWakeWordDetectedCallback?.(false)
  }

  public setManualTurn(active: boolean) {
    this.manualTurnActive = active
  }

  /**
   * 2000ms Voice Activity Detection (VAD) silence counter
   */
  private restartVadTimer() {
    // If speaking, never run VAD
    if (this.isSpeaking || Date.now() < this.speakingCooldownUntil) {
      this.clearVadTimers()
      return
    }

    this.clearVadTimers()
    this.lastSpeechTimestamp = Date.now()

    // 100ms interval for smooth UI silence progress bar
    this.vadIntervalTimer = setInterval(() => {
      const elapsed = Date.now() - this.lastSpeechTimestamp
      const pct = Math.min(100, Math.round((elapsed / this.vadSilenceThresholdMs) * 100))
      this.onVadProgressCallback?.({
        silenceMs: elapsed,
        progressPercent: pct,
        isLocked: false,
      })
    }, 100)

    // Exact 2000ms Silence Lock
    this.vadTimer = setTimeout(() => {
      this.clearVadTimers()
      this.onVadProgressCallback?.({
        silenceMs: 2000,
        progressPercent: 100,
        isLocked: true,
      })
      this.finalizeUserTurn()
    }, this.vadSilenceThresholdMs)
  }

  private clearVadTimers() {
    if (this.vadTimer) {
      clearTimeout(this.vadTimer)
      this.vadTimer = null
    }
    if (this.vadIntervalTimer) {
      clearInterval(this.vadIntervalTimer)
      this.vadIntervalTimer = null
    }
  }

  /**
   * Finalizes user turn upon reaching exactly 2000ms of uninterrupted silence
   */
  private finalizeUserTurn() {
    const fullText = (this.latestActiveText || this.accumulatedTranscript).trim()
    this.latestActiveText = ""
    this.accumulatedTranscript = ""

    if (!fullText) return

    // CRITICAL ANTI-LOOP GATE 3: Final echo rejection
    if (this.isAcousticEcho(fullText)) {
      console.warn("[EvaVoiceEngine] Discarded acoustic feedback loop from Eva's speech:", fullText)
      this.onVadProgressCallback?.({ silenceMs: 0, progressPercent: 0, isLocked: false })
      return
    }

    const lower = fullText.toLowerCase()
    const hasWakeWord =
      lower.startsWith("eva") ||
      lower.startsWith("hi eva") ||
      lower.startsWith("hey eva") ||
      lower.startsWith("hello eva")

    this.onWakeWordDetectedCallback?.(hasWakeWord)
    this.manualTurnActive = false

    // Forward finalized transcript to pipeline
    this.onTranscriptCallback?.(fullText, true)
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted
    if (this.isMuted) {
      this.stopSpeaking()
    }
    return this.isMuted
  }

  public getIsMuted(): boolean {
    return this.isMuted
  }

  public stopSpeaking() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause()
        this.currentAudio.currentTime = 0
      } catch {}
      this.currentAudio = null
    }
    if (this.synth) {
      this.synth.cancel()
    }
    this.isSpeaking = false
    this.speakingCooldownUntil = 0
    this.onSpeakingStateCallback?.(false)
  }

  /**
   * Dynamic Greet on Click: Non-repeating queue (does not reuse greeting within 10 turns)
   */
  public triggerDynamicGreeting(userName: string = "", onGreet?: (text: string) => void) {
    const greetingText = getNextDynamicGreeting(this.activePersona, userName)
    onGreet?.(greetingText)
    this.speak(greetingText)
  }

  /**
   * Speaks using Neural Edge-TTS adapted to the active persona.
   * Basic: en-IN-NeerjaExpressiveNeural
   * Tapori: hi-IN-SwaraNeural
   * Bihari: hi-IN-MadhurNeural
   */
  public async speak(text: string, onEnd?: () => void) {
    if (this.isMuted) {
      onEnd?.()
      return
    }

    // 1. Record spoken text to prevent echo loop
    this.recordSpokenPhrase(text)

    // 2. Terminate any previous speech
    this.stopSpeaking()

    // 3. Enter speaking state and abort recognition so mic doesn't pick up speaker sound
    this.isSpeaking = true
    this.onSpeakingStateCallback?.(true)
    this.clearVadTimers()
    this.accumulatedTranscript = ""
    this.latestActiveText = ""
    this.onVadProgressCallback?.({ silenceMs: 0, progressPercent: 0, isLocked: false })

    if (this.recognition) {
      try {
        this.recognition.abort()
      } catch {}
    }

    const handleSpeechEnded = () => {
      // 1-second echo tail cooldown for room reverberation to settle
      this.speakingCooldownUntil = Date.now() + 1000
      this.accumulatedTranscript = ""
      this.latestActiveText = ""
      this.isSpeaking = false
      this.onSpeakingStateCallback?.(false)
      this.onVadProgressCallback?.({ silenceMs: 0, progressPercent: 0, isLocked: false })

      if (this.resumeListenTimer) {
        clearTimeout(this.resumeListenTimer)
      }

      this.resumeListenTimer = setTimeout(() => {
        if (this.isListening && !this.isSpeaking && Date.now() >= this.speakingCooldownUntil) {
          this.accumulatedTranscript = ""
          this.latestActiveText = ""
          try {
            this.recognition?.start()
          } catch {}
        }
      }, 1050)

      onEnd?.()
    }

    const profile = PERSONA_PROFILES[this.activePersona] || PERSONA_PROFILES.basic

    try {
      const response = await fetch("/api/eva-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice: profile.voiceId,
          rate: profile.rate,
          pitch: profile.pitch,
        }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        this.currentAudio = audio

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          this.currentAudio = null
          handleSpeechEnded()
        }

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl)
          this.currentAudio = null
          this.fallbackBrowserSpeak(text, handleSpeechEnded)
        }

        await audio.play()
        return
      }
    } catch (err) {
      console.warn("Neural TTS streaming error, falling back to local speech synthesis:", err)
    }

    // Fallback: Local speech synthesis
    this.fallbackBrowserSpeak(text, handleSpeechEnded)
  }

  private fallbackBrowserSpeak(text: string, onEnd?: () => void) {
    if (!this.synth) {
      this.isSpeaking = false
      this.onSpeakingStateCallback?.(false)
      onEnd?.()
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = this.activePersona === "tapori" ? 1.05 : 1.0
    utterance.pitch = this.activePersona === "tapori" ? 1.1 : 1.0
    utterance.lang = this.activePersona === "basic" ? "en-IN" : "hi-IN"

    const voices = this.synth.getVoices()
    const targetLang = utterance.lang
    const matchedVoice =
      voices.find((v) => v.lang === targetLang && (v.name.includes("Female") || v.name.includes("Neerja") || v.name.includes("Natural"))) ||
      voices.find((v) => v.lang === targetLang) ||
      voices[0]

    if (matchedVoice) {
      utterance.voice = matchedVoice
    }

    utterance.onend = () => {
      onEnd?.()
    }
    utterance.onerror = () => {
      onEnd?.()
    }

    this.synth.speak(utterance)
  }
}
