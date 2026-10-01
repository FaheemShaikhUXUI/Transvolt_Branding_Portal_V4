"use client"

import * as React from "react"
import { useParams, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Clock,
  ShieldAlert,
  Search,
  Play,
  Pause,
  CircleArrowDown,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Music2,
  Building2,
  Layers,
} from "lucide-react"
import { toast, Toaster } from "sonner"
import {
  createZipBlob,
  triggerBrowserDownload,
  sanitizeFilename,
  fetchAudioData,
} from "@/lib/audio/audio-download-utils"

interface StopAudioItem {
  id: string
  companyId: string
  folderId: string
  listType: "Up" | "Down"
  stopName: string
  scriptText: string
  voiceModel: string
  voiceGender: "Male" | "Female"
  speed: number
  pitch: number
  createdAt: string
}

interface SharedAudioData {
  id: string
  companyName: string
  folderName: string
  routeTitle: string
  upTracks: StopAudioItem[]
  downTracks: StopAudioItem[]
  createdAt: number
}

const SIX_HOURS_MS = 6 * 60 * 60 * 1000

export default function SharedAudioBothListPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params?.id as string

  const [sharedData, setSharedData] = React.useState<SharedAudioData | null>(null)
  const [createdTime, setCreatedTime] = React.useState<number>(Date.now())
  const [now, setNow] = React.useState<number>(Date.now())
  const [loading, setLoading] = React.useState(true)

  // Search filter
  const [globalSearch, setGlobalSearch] = React.useState("")
  const [upSearch, setUpSearch] = React.useState("")
  const [downSearch, setDownSearch] = React.useState("")

  // Playback state
  const [playingTrackId, setPlayingTrackId] = React.useState<string | null>(null)
  const [playbackProgress, setPlaybackProgress] = React.useState(0)
  const currentAudioRef = React.useRef<HTMLAudioElement | null>(null)

  // Download loading states
  const [downloadingTrackId, setDownloadingTrackId] = React.useState<string | null>(null)
  const [isZipping, setIsZipping] = React.useState(false)

  // Load shared data
  React.useEffect(() => {
    if (!id) return

    // 1. Creation time check
    const tParam = searchParams.get("t")
    let initialTime: number
    if (tParam && !isNaN(parseInt(tParam, 10))) {
      initialTime = parseInt(tParam, 10)
    } else {
      const storedTime = localStorage.getItem(`branding_share_audio_${id}_time`)
      if (storedTime && !isNaN(parseInt(storedTime, 10))) {
        initialTime = parseInt(storedTime, 10)
      } else {
        initialTime = Date.now()
        localStorage.setItem(`branding_share_audio_${id}_time`, initialTime.toString())
      }
    }
    setCreatedTime(initialTime)

    // 2. Load shared data from localStorage
    try {
      const saved = localStorage.getItem(`branding_share_audio_${id}_data`)
      if (saved) {
        setSharedData(JSON.parse(saved))
      } else {
        // Fallback demo data if opened in fresh window
        setSharedData({
          id,
          companyName: "Transvolt Mobility Private Limited",
          folderName: "Route 1",
          routeTitle: "Transvolt Route 1 - Dual Audio Lists",
          upTracks: [
            {
              id: "up-1",
              companyId: "c1",
              folderId: "f1",
              listType: "Up",
              stopName: "Mumbai Central Depot",
              scriptText: "Next stop is Mumbai Central Depot. Please mind the gap.",
              voiceModel: "66. Hindi (India) - IN (Swara)",
              voiceGender: "Female",
              speed: 0,
              pitch: 0,
              createdAt: "Jan 12, 2024",
            },
            {
              id: "up-2",
              companyId: "c1",
              folderId: "f1",
              listType: "Up",
              stopName: "Dadar Station West",
              scriptText: "Next stop is Dadar Station West. Doors opening on the left.",
              voiceModel: "66. Hindi (India) - IN (Swara)",
              voiceGender: "Female",
              speed: 0,
              pitch: 0,
              createdAt: "Jan 12, 2024",
            },
            {
              id: "up-3",
              companyId: "c1",
              folderId: "f1",
              listType: "Up",
              stopName: "Bandra Kurla Complex",
              scriptText: "Next stop is Bandra Kurla Complex. Interchange available.",
              voiceModel: "66. Hindi (India) - IN (Swara)",
              voiceGender: "Female",
              speed: 0,
              pitch: 0,
              createdAt: "Jan 12, 2024",
            },
            {
              id: "up-4",
              companyId: "c1",
              folderId: "f1",
              listType: "Up",
              stopName: "Andheri East Depot",
              scriptText: "Next stop is Andheri East Depot.",
              voiceModel: "66. Hindi (India) - IN (Swara)",
              voiceGender: "Female",
              speed: 0,
              pitch: 0,
              createdAt: "Jan 12, 2024",
            },
            {
              id: "up-5",
              companyId: "c1",
              folderId: "f1",
              listType: "Up",
              stopName: "Borivali National Park",
              scriptText: "Next stop is Borivali National Park.",
              voiceModel: "66. Hindi (India) - IN (Swara)",
              voiceGender: "Female",
              speed: 0,
              pitch: 0,
              createdAt: "Jan 12, 2024",
            },
          ],
          downTracks: [
            {
              id: "down-1",
              companyId: "c1",
              folderId: "f1",
              listType: "Down",
              stopName: "Mira Road Station",
              scriptText: "Returning stop is Mira Road Station.",
              voiceModel: "66. Hindi (India) - IN (Swara)",
              voiceGender: "Female",
              speed: 0,
              pitch: 0,
              createdAt: "Jan 12, 2024",
            },
            {
              id: "down-2",
              companyId: "c1",
              folderId: "f1",
              listType: "Down",
              stopName: "Vashi Bus Station",
              scriptText: "Returning stop is Vashi Bus Station.",
              voiceModel: "66. Hindi (India) - IN (Swara)",
              voiceGender: "Female",
              speed: 0,
              pitch: 0,
              createdAt: "Jan 12, 2024",
            },
            {
              id: "down-3",
              companyId: "c1",
              folderId: "f1",
              listType: "Down",
              stopName: "Thane Station South",
              scriptText: "Returning stop is Thane Station South.",
              voiceModel: "66. Hindi (India) - IN (Swara)",
              voiceGender: "Female",
              speed: 0,
              pitch: 0,
              createdAt: "Jan 12, 2024",
            },
          ],
          createdAt: initialTime,
        })
      }
    } catch (e) {
      console.error("Failed to load shared audio data:", e)
    }

    setLoading(false)
  }, [id, searchParams])

  // Live timer tick
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const expiresAt = createdTime + SIX_HOURS_MS
  const remainingMs = expiresAt - now
  const isExpired = remainingMs <= 0

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return "00h : 00m : 00s"
    const totalSecs = Math.floor(ms / 1000)
    const hours = Math.floor(totalSecs / 3600)
    const minutes = Math.floor((totalSecs % 3600) / 60)
    const seconds = totalSecs % 60
    return `${hours.toString().padStart(2, "0")}h : ${minutes
      .toString()
      .padStart(2, "0")}m : ${seconds.toString().padStart(2, "0")}s`
  }

  // Row audio play
  const togglePlayAudio = async (item: StopAudioItem) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }

    if (playingTrackId === item.id) {
      setPlayingTrackId(null)
      setPlaybackProgress(0)
      return
    }

    setPlayingTrackId(item.id)
    setPlaybackProgress(5)

    try {
      const textToSpeak = item.scriptText || item.stopName
      const audioBuffer = await fetchAudioData(
        textToSpeak,
        item.voiceModel || "hi-swara",
        item.voiceGender || "Female",
        item.speed || 0,
        item.pitch || 0
      )

      const blob = new Blob([audioBuffer.buffer as ArrayBuffer], { type: "audio/mpeg" })
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      currentAudioRef.current = audio

      audio.ontimeupdate = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setPlaybackProgress((audio.currentTime / audio.duration) * 100)
        }
      }

      audio.onended = () => {
        setPlayingTrackId(null)
        setPlaybackProgress(100)
        URL.revokeObjectURL(url)
      }

      audio.onerror = () => {
        setPlayingTrackId(null)
        URL.revokeObjectURL(url)
      }

      await audio.play()
    } catch (e) {
      console.warn("Shared audio playback error:", e)
      setPlayingTrackId(null)
      toast.error("Could not play audio track.")
    }
  }

  // Single Track Download
  const handleDownloadSingleTrack = async (item: StopAudioItem, index: number) => {
    setDownloadingTrackId(item.id)
    toast.info(`Preparing MP3 download for "${item.stopName}"...`)

    try {
      const textToSpeak = item.scriptText || item.stopName
      const audioBuffer = await fetchAudioData(
        textToSpeak,
        item.voiceModel || "hi-swara",
        item.voiceGender || "Female",
        item.speed || 0,
        item.pitch || 0
      )

      const blob = new Blob([audioBuffer.buffer as ArrayBuffer], { type: "audio/mpeg" })
      const filename = `${String(index + 1).padStart(2, "0")} - ${sanitizeFilename(item.stopName)}.mp3`
      triggerBrowserDownload(blob, filename)
      toast.success(`Downloaded: ${filename}`)
    } catch (e) {
      console.error("Single track download error:", e)
      toast.error(`Failed to download audio for "${item.stopName}"`)
    } finally {
      setDownloadingTrackId(null)
    }
  }

  // Download List in ZIP
  const handleDownloadListZip = async (listType: "Up" | "Down", tracks: StopAudioItem[]) => {
    if (tracks.length === 0) {
      toast.error(`No tracks available in ${listType} list to download.`)
      return
    }

    setIsZipping(true)
    const toastId = toast.loading(`Generating ZIP archive for ${listType} list (0/${tracks.length})...`)

    try {
      const zipEntries: Array<{ path: string; data: Uint8Array }> = []
      const textLines: string[] = [
        `============================================================`,
        `TRANSVOLT MOBILITY - ${sharedData?.companyName || "Route"}`,
        `Folder: ${sharedData?.folderName || "Route 1"} - ${listType} Direction`,
        `Total Stops: ${tracks.length}`,
        `Downloaded: ${new Date().toLocaleString()}`,
        `============================================================\n`,
      ]

      for (let i = 0; i < tracks.length; i++) {
        const item = tracks[i]
        toast.loading(`Synthesizing ${listType} Stop ${i + 1}/${tracks.length}: "${item.stopName}"...`, {
          id: toastId,
        })

        const textToSpeak = item.scriptText || item.stopName
        const audioBuffer = await fetchAudioData(
          textToSpeak,
          item.voiceModel || "hi-swara",
          item.voiceGender || "Female",
          item.speed || 0,
          item.pitch || 0
        )

        const filename = `${String(i + 1).padStart(2, "0")} - ${sanitizeFilename(item.stopName)}.mp3`
        zipEntries.push({ path: filename, data: audioBuffer })
        textLines.push(`${String(i + 1).padStart(2, "0")}. [${item.stopName}] -> "${textToSpeak}"`)
      }

      // Add text summary
      const textContent = textLines.join("\n")
      const textBuffer = new TextEncoder().encode(textContent)
      zipEntries.push({ path: "00 - Sequence & Stop List.txt", data: textBuffer })

      const zipBlob = createZipBlob(zipEntries)
      const zipName = `${sanitizeFilename(sharedData?.companyName || "Transvolt")}_${sanitizeFilename(
        sharedData?.folderName || "Route"
      )}_${listType}_Audio.zip`

      triggerBrowserDownload(zipBlob, zipName)
      toast.success(`Downloaded ${zipName} successfully!`, { id: toastId })
    } catch (e) {
      console.error("List ZIP download error:", e)
      toast.error(`Failed to package ${listType} list ZIP.`, { id: toastId })
    } finally {
      setIsZipping(false)
    }
  }

  // Download BOTH Lists in ZIP
  const handleDownloadBothZip = async () => {
    const upList = sharedData?.upTracks || []
    const downList = sharedData?.downTracks || []
    const totalCount = upList.length + downList.length

    if (totalCount === 0) {
      toast.error("No audio tracks available to download.")
      return
    }

    setIsZipping(true)
    const toastId = toast.loading(`Preparing complete route ZIP (${totalCount} total tracks)...`)

    try {
      const zipEntries: Array<{ path: string; data: Uint8Array }> = []
      const textLines: string[] = [
        `============================================================`,
        `TRANSVOLT MOBILITY PRIVATE LIMITED`,
        `Route Audio Package: ${sharedData?.folderName || "Route 1"}`,
        `Company: ${sharedData?.companyName || "Transvolt"}`,
        `Up Stops: ${upList.length} | Down Stops: ${downList.length}`,
        `Downloaded: ${new Date().toLocaleString()}`,
        `============================================================\n`,
        `--- UP LIST (FORWARD DIRECTION) ---`,
      ]

      // 1. Process UP tracks
      for (let i = 0; i < upList.length; i++) {
        const item = upList[i]
        toast.loading(`Processing Up List [${i + 1}/${upList.length}]: "${item.stopName}"...`, {
          id: toastId,
        })

        const textToSpeak = item.scriptText || item.stopName
        const audioBuffer = await fetchAudioData(
          textToSpeak,
          item.voiceModel || "hi-swara",
          item.voiceGender || "Female",
          item.speed || 0,
          item.pitch || 0
        )

        const filename = `Up/${String(i + 1).padStart(2, "0")} - ${sanitizeFilename(item.stopName)}.mp3`
        zipEntries.push({ path: filename, data: audioBuffer })
        textLines.push(`Up #${String(i + 1).padStart(2, "0")}: [${item.stopName}] -> "${textToSpeak}"`)
      }

      textLines.push(`\n--- DOWN LIST (RETURN DIRECTION) ---`)

      // 2. Process DOWN tracks
      for (let i = 0; i < downList.length; i++) {
        const item = downList[i]
        toast.loading(`Processing Down List [${i + 1}/${downList.length}]: "${item.stopName}"...`, {
          id: toastId,
        })

        const textToSpeak = item.scriptText || item.stopName
        const audioBuffer = await fetchAudioData(
          textToSpeak,
          item.voiceModel || "hi-swara",
          item.voiceGender || "Female",
          item.speed || 0,
          item.pitch || 0
        )

        const filename = `Down/${String(i + 1).padStart(2, "0")} - ${sanitizeFilename(item.stopName)}.mp3`
        zipEntries.push({ path: filename, data: audioBuffer })
        textLines.push(`Down #${String(i + 1).padStart(2, "0")}: [${item.stopName}] -> "${textToSpeak}"`)
      }

      // Add comprehensive route summary
      const textContent = textLines.join("\n")
      const textBuffer = new TextEncoder().encode(textContent)
      zipEntries.push({ path: "00 - Complete Route Summary.txt", data: textBuffer })

      const zipBlob = createZipBlob(zipEntries)
      const zipName = `${sanitizeFilename(sharedData?.companyName || "Transvolt")}_${sanitizeFilename(
        sharedData?.folderName || "Route"
      )}_Complete_Audio_(Up_&_Down).zip`

      triggerBrowserDownload(zipBlob, zipName)
      toast.success(`Downloaded complete package: ${zipName}!`, { id: toastId })
    } catch (e) {
      console.error("Both ZIP download error:", e)
      toast.error("Failed to generate complete route ZIP.", { id: toastId })
    } finally {
      setIsZipping(false)
    }
  }

  // Filtered lists
  const filteredUp = React.useMemo(() => {
    const list = sharedData?.upTracks || []
    return list.filter((t) => t.stopName.toLowerCase().includes(upSearch.toLowerCase().trim()))
  }, [sharedData, upSearch])

  const filteredDown = React.useMemo(() => {
    const list = sharedData?.downTracks || []
    return list.filter((t) => t.stopName.toLowerCase().includes(downSearch.toLowerCase().trim()))
  }, [sharedData, downSearch])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-700">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
          <p className="text-sm font-semibold">Loading shared audio route...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col">
      <Toaster position="top-right" richColors />

      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Transvolt Branding Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-sm">
              TV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                  Transvolt Mobility
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Shared Asset
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Official Route Audio Portal</p>
            </div>
          </div>

          {/* Right: Live 6-Hour Expiry Timer */}
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-1.5 shadow-inner">
            <Clock
              className={`h-4 w-4 ${isExpired ? "text-rose-500" : "text-amber-500 animate-pulse"}`}
            />
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">
                {isExpired ? "Link Status:" : "Expires in:"}
              </span>
              <span
                className={`font-mono font-bold ${
                  isExpired ? "text-rose-600" : "text-slate-900"
                }`}
              >
                {isExpired ? "EXPIRED" : formatCountdown(remainingMs)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Expired State Warning */}
      {isExpired ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-rose-200 rounded-3xl p-8 text-center space-y-4 shadow-xl">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">Share Link Expired</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                This temporary 6-hour link has expired for security purposes. Please contact the
                administrator to request a fresh share link.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>
      ) : (
        /* Main Shared Both List UI - Matching Image 1! */
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header Title & Subtitle */}
          <div className="flex flex-col items-center text-center space-y-1 pt-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {sharedData?.companyName || "Transvolt Mobility Private Limited"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
              Organize audio tracks, announcements, and voice assets into distinct folders.
            </p>
          </div>

          {/* Sub-Header Navigation Bar: Folder Name, Search Bar & Top Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            {/* Left: Route Name with Icon */}
            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
              <div className="h-7 w-7 rounded-lg bg-emerald-600/10 text-emerald-700 flex items-center justify-center">
                <Music2 className="h-4 w-4" />
              </div>
              <span>{sharedData?.folderName || "Route 1"}</span>
            </div>

            {/* Center: Search Bar */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search stop names..."
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value)
                  setUpSearch(e.target.value)
                  setDownSearch(e.target.value)
                }}
                className="w-full bg-white border border-slate-200 rounded-full py-1.5 pl-4 pr-9 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Right Top Button: Download Both in Zip */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadBothZip}
                disabled={isZipping}
                className="bg-[#548235] hover:bg-[#48732e] text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
              >
                <CircleArrowDown className="h-4 w-4" />
                <span>Download Both in Zip</span>
              </button>
            </div>
          </div>

          {/* DUAL COLUMNS CONTAINER: SIDE-BY-SIDE UP LIST & DOWN LIST */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* =================================================================
                LEFT COLUMN: UP LIST
                ================================================================= */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Column Header Bar */}
                <div className="flex items-center justify-between gap-2 pb-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Up</h2>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {filteredUp.length} Stops
                    </span>
                  </div>

                  <div className="relative w-36">
                    <input
                      type="text"
                      placeholder="Search Up..."
                      value={upSearch}
                      onChange={(e) => setUpSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-full py-1 pl-3 pr-7 text-[11px] text-slate-800 focus:outline-none"
                    />
                    <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Rows List */}
                <div className="border border-slate-200/80 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white min-h-[380px]">
                  {filteredUp.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 text-xs">
                      No audio stops found.
                    </div>
                  ) : (
                    filteredUp.map((item, idx) => {
                      const isPlayingThis = playingTrackId === item.id
                      const isDownloadingThis = downloadingTrackId === item.id

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-3 py-2.5 transition-all hover:bg-slate-50/80 group"
                        >
                          {/* Left: Number, Stop Name */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-bold text-slate-400 w-5 shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors truncate max-w-[150px] sm:max-w-[220px]">
                              {item.stopName}
                            </span>
                          </div>

                          {/* Right: Play/Pause, Duration Line & Download Button */}
                          <div className="flex items-center gap-3 shrink-0">
                            {/* Play/Pause & Duration Bar */}
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-full px-2 py-0.5">
                              <button
                                type="button"
                                onClick={() => togglePlayAudio(item)}
                                className="h-5 w-5 rounded-full bg-slate-200 hover:bg-[#4472C4] hover:text-white text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                                title={isPlayingThis ? "Pause" : "Play Swara Audio"}
                              >
                                {isPlayingThis ? (
                                  <Pause className="h-2.5 w-2.5 fill-current" />
                                ) : (
                                  <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                                )}
                              </button>

                              {/* Mini Progress Bar */}
                              <div className="w-14 sm:w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden relative">
                                <div
                                  className="bg-[#4472C4] h-full transition-all duration-150"
                                  style={{
                                    width: isPlayingThis ? `${playbackProgress}%` : "0%",
                                  }}
                                />
                              </div>

                              <span className="text-[10px] font-mono font-semibold text-slate-500">
                                00:04
                              </span>
                            </div>

                            {/* Download Single MP3 Button */}
                            <button
                              type="button"
                              onClick={() => handleDownloadSingleTrack(item, idx)}
                              disabled={isDownloadingThis}
                              className="text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer p-0.5 disabled:opacity-50"
                              title="Download Single MP3"
                            >
                              <CircleArrowDown className="h-5 w-5 stroke-[1.8]" />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Bottom: Download All in Zip */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleDownloadListZip("Up", filteredUp)}
                  disabled={isZipping}
                  className="bg-[#548235] hover:bg-[#48732e] text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  <CircleArrowDown className="h-4 w-4" />
                  <span>Download All in Zip</span>
                </button>
              </div>
            </div>

            {/* =================================================================
                RIGHT COLUMN: DOWN LIST
                ================================================================= */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Column Header Bar */}
                <div className="flex items-center justify-between gap-2 pb-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Down</h2>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {filteredDown.length} Stops
                    </span>
                  </div>

                  <div className="relative w-36">
                    <input
                      type="text"
                      placeholder="Search Down..."
                      value={downSearch}
                      onChange={(e) => setDownSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-full py-1 pl-3 pr-7 text-[11px] text-slate-800 focus:outline-none"
                    />
                    <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Rows List */}
                <div className="border border-slate-200/80 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white min-h-[380px]">
                  {filteredDown.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 text-xs">
                      No audio stops found.
                    </div>
                  ) : (
                    filteredDown.map((item, idx) => {
                      const isPlayingThis = playingTrackId === item.id
                      const isDownloadingThis = downloadingTrackId === item.id

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-3 py-2.5 transition-all hover:bg-slate-50/80 group"
                        >
                          {/* Left: Number, Stop Name */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-bold text-slate-400 w-5 shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors truncate max-w-[150px] sm:max-w-[220px]">
                              {item.stopName}
                            </span>
                          </div>

                          {/* Right: Play/Pause, Duration Line & Download Button */}
                          <div className="flex items-center gap-3 shrink-0">
                            {/* Play/Pause & Duration Bar */}
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-full px-2 py-0.5">
                              <button
                                type="button"
                                onClick={() => togglePlayAudio(item)}
                                className="h-5 w-5 rounded-full bg-slate-200 hover:bg-[#4472C4] hover:text-white text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                                title={isPlayingThis ? "Pause" : "Play Swara Audio"}
                              >
                                {isPlayingThis ? (
                                  <Pause className="h-2.5 w-2.5 fill-current" />
                                ) : (
                                  <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                                )}
                              </button>

                              {/* Mini Progress Bar */}
                              <div className="w-14 sm:w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden relative">
                                <div
                                  className="bg-[#4472C4] h-full transition-all duration-150"
                                  style={{
                                    width: isPlayingThis ? `${playbackProgress}%` : "0%",
                                  }}
                                />
                              </div>

                              <span className="text-[10px] font-mono font-semibold text-slate-500">
                                00:04
                              </span>
                            </div>

                            {/* Download Single MP3 Button */}
                            <button
                              type="button"
                              onClick={() => handleDownloadSingleTrack(item, idx)}
                              disabled={isDownloadingThis}
                              className="text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer p-0.5 disabled:opacity-50"
                              title="Download Single MP3"
                            >
                              <CircleArrowDown className="h-5 w-5 stroke-[1.8]" />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Bottom: Download All in Zip */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleDownloadListZip("Down", filteredDown)}
                  disabled={isZipping}
                  className="bg-[#548235] hover:bg-[#48732e] text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  <CircleArrowDown className="h-4 w-4" />
                  <span>Download All in Zip</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-400">
        Transvolt Mobility Private Limited &copy; {new Date().getFullYear()} &middot; Secured Shared
        Audio Announcement Link
      </footer>
    </div>
  )
}
