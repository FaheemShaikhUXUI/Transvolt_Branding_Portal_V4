"use client"

import * as React from "react"
import { useCompanyMaster } from "@/lib/company-master/company-master-context"
import { AddCompanyAudioModal, AudioCompanyItem } from "@/components/generate-audio/add-company-audio-modal"
import { CreateAudioFolderModal } from "@/components/generate-audio/create-audio-folder-modal"
import { GenerateVoiceModal } from "@/components/generate-audio/generate-voice-modal"
import { ShareAudioModal } from "@/components/generate-audio/share-audio-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  Music2,
  Plus,
  Search,
  Building2,
  MapPin,
  Sparkles,
  Trash2,
  Radio,
  Filter,
  Folder,
  FolderPlus,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Play,
  Pause,
  Square,
  Download,
  Share2,
  CheckCircle2,
  CircleArrowDown,
  GripVertical,
  Copy,
  AlertTriangle,
  Loader2,
  Home,
  Bus,
  Route,
  Edit2,
  X,
  MoreVertical,
} from "lucide-react"
import {
  createZipBlob,
  triggerBrowserDownload,
  sanitizeFilename,
  fetchAudioData,
} from "@/lib/audio/audio-download-utils"

const STORAGE_COMPANIES_KEY = "transvolt_generate_audio_companies_v4"
const STORAGE_FOLDERS_KEY = "transvolt_generate_audio_folders_v4"
const STORAGE_UP_TRACKS_KEY = "transvolt_generate_audio_up_tracks_v4"
const STORAGE_DOWN_TRACKS_KEY = "transvolt_generate_audio_down_tracks_v4"
const STORAGE_OTHER_TRACKS_KEY = "transvolt_generate_audio_other_tracks_v4"

// Clean up stale old-versioned keys that fill the 5MB localStorage quota
if (typeof window !== "undefined") {
  const STALE_PREFIXES = [
    "transvolt_generate_audio_companies_v",
    "transvolt_generate_audio_folders_v",
    "transvolt_generate_audio_up_tracks_v",
    "transvolt_generate_audio_down_tracks_v",
    "transvolt_generate_audio_other_tracks_v",
  ]
  const CURRENT_KEYS = new Set([
    STORAGE_COMPANIES_KEY,
    STORAGE_FOLDERS_KEY,
    STORAGE_UP_TRACKS_KEY,
    STORAGE_DOWN_TRACKS_KEY,
    STORAGE_OTHER_TRACKS_KEY,
  ])
  Object.keys(localStorage).forEach((key) => {
    if (STALE_PREFIXES.some((p) => key.startsWith(p)) && !CURRENT_KEYS.has(key)) {
      localStorage.removeItem(key)
    }
  })
}


export interface AudioFolderItem {
  id: string
  companyId: string
  name: string
  colorTag: string
  createdAt: string
}

export interface StopAudioItem {
  id: string
  companyId: string
  folderId: string
  listType: "Up" | "Down" | "Others"
  stopName: string
  scriptText: string
  voiceModel: string
  voiceGender: "Male" | "Female"
  speed: number
  pitch: number
  createdAt: string
}

export default function GenerateAudioPage() {
  const { companies: masterCompanies } = useCompanyMaster()

  // Navigation hierarchy:
  // null = Companies View
  // activeCompany set, activeFolder null = Folders View inside Company
  // activeCompany set, activeFolder set = Dual/Triple List View (Up, Down & Others)
  const [activeCompany, setActiveCompany] = React.useState<AudioCompanyItem | null>(null)
  const [activeFolder, setActiveFolder] = React.useState<AudioFolderItem | null>(null)

  // Smart Horizontal Tab Scroll System
  const tabScrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  // Route Tab Drag & Drop Reorder State
  const [draggedRouteIndex, setDraggedRouteIndex] = React.useState<number | null>(null)
  const [dragOverRouteIndex, setDragOverRouteIndex] = React.useState<number | null>(null)
  const [dragOverPosition, setDragOverPosition] = React.useState<"left" | "right" | null>(null)

  // Route Tab Inline Rename State
  const [editingFolderId, setEditingFolderId] = React.useState<string | null>(null)
  const [editingFolderName, setEditingFolderName] = React.useState("")

  // Route Delete Modal State
  const [folderPendingDelete, setFolderPendingDelete] = React.useState<AudioFolderItem | null>(null)

  // Modals state
  const [isAddCompanyOpen, setIsAddCompanyOpen] = React.useState(false)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = React.useState(false)
  
  // Voice Modal State (Image 2)
  const [isVoiceModalOpen, setIsVoiceModalOpen] = React.useState(false)
  const [voiceModalListType, setVoiceModalListType] = React.useState<"Up" | "Down" | "Others">("Up")

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false)
  const [shareModalTitle, setShareModalTitle] = React.useState("")
  const [sharePayload, setSharePayload] = React.useState<{
    folderName?: string
    up: StopAudioItem[]
    down: StopAudioItem[]
    other: StopAudioItem[]
  }>({
    up: [],
    down: [],
    other: [],
  })

  // Data states
  const [companyList, setCompanyList] = React.useState<AudioCompanyItem[]>([])
  const [folders, setFolders] = React.useState<AudioFolderItem[]>([])
  const [upTracks, setUpTracks] = React.useState<StopAudioItem[]>([])
  const [downTracks, setDownTracks] = React.useState<StopAudioItem[]>([])
  const [otherTracks, setOtherTracks] = React.useState<StopAudioItem[]>([])

  // Active Company Folders (Routes)
  const companyFolders = React.useMemo(() => {
    if (!activeCompany) return []
    return folders.filter((f) => f.companyId === activeCompany.id)
  }, [folders, activeCompany])

  // Auto-select first route when activeCompany is chosen
  React.useEffect(() => {
    if (activeCompany) {
      if (!activeFolder || activeFolder.companyId !== activeCompany.id) {
        if (companyFolders.length > 0) {
          setActiveFolder(companyFolders[0])
        }
      }
    }
  }, [activeCompany, companyFolders, activeFolder])

  // Check tab scroll positions to toggle left/right chevron buttons
  const checkTabScroll = React.useCallback(() => {
    const el = tabScrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  const handleTabScrollLeft = () => {
    if (tabScrollRef.current) {
      tabScrollRef.current.scrollBy({ left: -240, behavior: "smooth" })
    }
  }

  const handleTabScrollRight = () => {
    if (tabScrollRef.current) {
      tabScrollRef.current.scrollBy({ left: 240, behavior: "smooth" })
    }
  }

  // Smooth mouse-wheel horizontal scrolling over tabs without page bounce
  React.useEffect(() => {
    const el = tabScrollRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [activeCompany])

  // Watch tab scroll & resize
  React.useEffect(() => {
    const el = tabScrollRef.current
    if (!el) return
    checkTabScroll()
    el.addEventListener("scroll", checkTabScroll)
    const ro = new ResizeObserver(checkTabScroll)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", checkTabScroll)
      ro.disconnect()
    }
  }, [checkTabScroll, companyFolders.length, activeCompany])

  // Auto-scroll active tab into view smoothly
  React.useEffect(() => {
    if (activeFolder) {
      const activeEl = document.getElementById(`route-tab-${activeFolder.id}`)
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
      }
    }
  }, [activeFolder?.id])

  // Search & Filter inputs
  const [globalSearch, setGlobalSearch] = React.useState("")
  const [upSearch, setUpSearch] = React.useState("")
  const [downSearch, setDownSearch] = React.useState("")
  const [otherSearch, setOtherSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "Ready" | "Draft">("all")

  // Selection states for Up, Down & Others lists
  const [selectedUpIds, setSelectedUpIds] = React.useState<string[]>([])
  const [selectedDownIds, setSelectedDownIds] = React.useState<string[]>([])
  const [selectedOtherIds, setSelectedOtherIds] = React.useState<string[]>([])

  // Row audio playback state
  const [playingTrackId, setPlayingTrackId] = React.useState<string | null>(null)
  const [loadingTrackId, setLoadingTrackId] = React.useState<string | null>(null)
  const [playbackProgress, setPlaybackProgress] = React.useState(0)
  const [playbackCurrentTime, setPlaybackCurrentTime] = React.useState(0)
  const [isAudioSoundEmitting, setIsAudioSoundEmitting] = React.useState(false)
  const [isCatVisible, setIsCatVisible] = React.useState(false)
  const activeAudioRef = React.useRef<HTMLAudioElement | null>(null)
  const playbackTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const playbackAnimFrameRef = React.useRef<number | null>(null)
  const playRequestIdRef = React.useRef<number>(0)

  const stopPlaybackLoop = React.useCallback(() => {
    if (playbackAnimFrameRef.current) {
      cancelAnimationFrame(playbackAnimFrameRef.current)
      playbackAnimFrameRef.current = null
    }
  }, [])

  const startPlaybackLoop = React.useCallback((audio: HTMLAudioElement) => {
    if (playbackAnimFrameRef.current) {
      cancelAnimationFrame(playbackAnimFrameRef.current)
      playbackAnimFrameRef.current = null
    }
    const update = () => {
      if (audio && !audio.paused && !audio.ended && audio.duration) {
        setPlaybackCurrentTime(audio.currentTime)
        setPlaybackProgress((audio.currentTime / audio.duration) * 100)
        playbackAnimFrameRef.current = requestAnimationFrame(update)
      }
    }
    playbackAnimFrameRef.current = requestAnimationFrame(update)
  }, [])

  // Sequential "Play All" List Playback State
  const [playingListType, setPlayingListType] = React.useState<"Up" | "Down" | "Others" | null>(null)

  // Talking Cat Mascot State & Playback Tracker
  const [catTalkingIndex, setCatTalkingIndex] = React.useState(0)
  const isAnyAudioPlaying = Boolean(playingTrackId || playingListType)

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
  // Only moves mouth when sound is actually being emitted through speaker
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
  const playQueueRef = React.useRef<{
    listType: "Up" | "Down" | "Others"
    tracks: StopAudioItem[]
    currentIndex: number
  } | null>(null)

  const stopSequentialPlay = React.useCallback(() => {
    playRequestIdRef.current++
    playQueueRef.current = null
    setPlayingListType(null)
    setLoadingTrackId(null)
    setIsAudioSoundEmitting(false)
    setIsCatVisible(false)
    stopPlaybackLoop()
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current)
    if (activeAudioRef.current) {
      activeAudioRef.current.pause()
      activeAudioRef.current = null
    }
    setPlayingTrackId(null)
    setPlaybackProgress(0)
    setPlaybackCurrentTime(0)
  }, [stopPlaybackLoop])

  const playTrackAtQueueIndexRef = React.useRef<
    ((listType: "Up" | "Down" | "Others", tracks: StopAudioItem[], index: number) => Promise<void>) | null
  >(null)

  const playTrackAtQueueIndex = React.useCallback(
    async (listType: "Up" | "Down" | "Others", tracks: StopAudioItem[], index: number) => {
      if (!playQueueRef.current || playQueueRef.current.listType !== listType) return

      if (index >= tracks.length) {
        stopSequentialPlay()
        toast.success(`Completed playing all ${tracks.length} ${listType} tracks!`)
        return
      }

      playQueueRef.current.currentIndex = index
      const item = tracks[index]
      const currentRequestId = ++playRequestIdRef.current

      stopPlaybackLoop()
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current)
      if (activeAudioRef.current) {
        activeAudioRef.current.pause()
        activeAudioRef.current = null
      }

      setLoadingTrackId(item.id)
      setIsAudioSoundEmitting(false)
      setPlaybackProgress(0)
      setPlaybackCurrentTime(0)

      const el = document.getElementById(`track-item-${item.id}`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }

      const textToSpeak = item.scriptText || item.stopName || `Next stop ${item.stopName}`
      let audio: HTMLAudioElement | null = null
      let audioUrlToRevoke: string | null = null

      try {
        const response = await fetch("/api/tts/dhwani", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: textToSpeak,
            gender: item.voiceGender || "Female",
            voiceModel: item.voiceModel || "hi-swara",
          }),
        })

        if (playRequestIdRef.current !== currentRequestId) return

        if (response.ok) {
          const blob = await response.blob()
          if (playRequestIdRef.current !== currentRequestId) return
          const audioUrl = URL.createObjectURL(blob)
          audioUrlToRevoke = audioUrl
          audio = new Audio(audioUrl)
        }
      } catch (err) {
        console.warn("Queue Dhwani error:", err)
      }

      if (playRequestIdRef.current !== currentRequestId) {
        if (audioUrlToRevoke) URL.revokeObjectURL(audioUrlToRevoke)
        return
      }

      if (!audio) {
        const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
          textToSpeak
        )}&tl=gu&client=tw-ob`
        audio = new Audio(fallbackUrl)
      }

      activeAudioRef.current = audio

      audio.onplay = () => {
        if (playRequestIdRef.current !== currentRequestId) return
        setLoadingTrackId(null)
        setPlayingTrackId(item.id)
        setIsAudioSoundEmitting(true)
        setIsCatVisible(true)
        startPlaybackLoop(audio!)
      }

      audio.onplaying = () => {
        if (playRequestIdRef.current !== currentRequestId) return
        setIsAudioSoundEmitting(true)
        setIsCatVisible(true)
      }

      audio.onpause = () => {
        setIsAudioSoundEmitting(false)
        stopPlaybackLoop()
      }

      audio.onended = () => {
        setIsAudioSoundEmitting(false)
        stopPlaybackLoop()
        if (audioUrlToRevoke) URL.revokeObjectURL(audioUrlToRevoke)
        setPlaybackProgress(100)

        if (playQueueRef.current && playQueueRef.current.listType === listType) {
          const nextIdx = index + 1
          if (nextIdx < tracks.length) {
            setTimeout(() => {
              if (playQueueRef.current && playQueueRef.current.listType === listType) {
                playTrackAtQueueIndexRef.current?.(listType, tracks, nextIdx)
              }
            }, 350)
          } else {
            stopSequentialPlay()
            toast.success(`Completed playing all ${tracks.length} ${listType} tracks!`)
          }
        } else {
          setPlayingTrackId(null)
          setIsCatVisible(false)
          setPlaybackProgress(0)
          setPlaybackCurrentTime(0)
        }
      }

      audio.onerror = () => {
        setIsAudioSoundEmitting(false)
        stopPlaybackLoop()
        if (audioUrlToRevoke) URL.revokeObjectURL(audioUrlToRevoke)
        if (playQueueRef.current && playQueueRef.current.listType === listType) {
          const nextIdx = index + 1
          if (nextIdx < tracks.length) {
            setTimeout(() => {
              if (playQueueRef.current && playQueueRef.current.listType === listType) {
                playTrackAtQueueIndexRef.current?.(listType, tracks, nextIdx)
              }
            }, 500)
          } else {
            stopSequentialPlay()
          }
        } else {
          stopSequentialPlay()
        }
      }

      try {
        await audio.play()
      } catch (playErr) {
        console.warn("Audio play prevented in queue:", playErr)
        if (playQueueRef.current && playQueueRef.current.listType === listType) {
          playTrackAtQueueIndexRef.current?.(listType, tracks, index + 1)
        } else {
          stopSequentialPlay()
        }
      }
    },
    [startPlaybackLoop, stopPlaybackLoop, stopSequentialPlay]
  )

  React.useEffect(() => {
    playTrackAtQueueIndexRef.current = playTrackAtQueueIndex
  }, [playTrackAtQueueIndex])

  const handleTogglePlayAll = (listType: "Up" | "Down" | "Others", tracks: StopAudioItem[]) => {
    if (playingListType === listType) {
      stopSequentialPlay()
      toast.info(`Stopped playback for ${listType} list`)
      return
    }

    if (tracks.length === 0) {
      toast.error(`No audio tracks in ${listType} list to play.`)
      return
    }

    stopSequentialPlay()

    playQueueRef.current = {
      listType,
      tracks,
      currentIndex: 0,
    }
    setPlayingListType(listType)
    toast.success(`Playing all ${tracks.length} ${listType} audio tracks one by one...`)
    playTrackAtQueueIndex(listType, tracks, 0)
  }

  React.useEffect(() => {
    return () => {
      stopSequentialPlay()
    }
  }, [stopSequentialPlay])

  const formatAudioTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "00:00"
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>, trackId: string) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = Math.max(0, Math.min(100, (clickX / rect.width) * 100))
    setPlaybackProgress(percent)

    if (playingTrackId === trackId && activeAudioRef.current && activeAudioRef.current.duration) {
      activeAudioRef.current.currentTime = (percent / 100) * activeAudioRef.current.duration
      setPlaybackCurrentTime(activeAudioRef.current.currentTime)
    }
  }

  // Drag & Drop State
  const [draggedItem, setDraggedItem] = React.useState<{
    item: StopAudioItem
    fromList: "Up" | "Down" | "Others"
    index: number
  } | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)
  const [dragOverList, setDragOverList] = React.useState<"Up" | "Down" | "Others" | null>(null)

  // Interactive Delete Confirmation State
  const [itemPendingDelete, setItemPendingDelete] = React.useState<{
    id: string
    name: string
    listType: "Up" | "Down" | "Others"
    ids?: string[]
  } | null>(null)

  // Download & ZIP Progress States
  const [downloadingTrackId, setDownloadingTrackId] = React.useState<string | null>(null)
  const [isZipping, setIsZipping] = React.useState(false)

  // Speech synthesis engine
  const [speechSynth, setSpeechSynth] = React.useState<SpeechSynthesis | null>(null)

  React.useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSynth(window.speechSynthesis)
    }
  }, [])

  // Load Companies, Folders, and Dual Up/Down Tracks from localStorage or Seed
  React.useEffect(() => {
    if (typeof window === "undefined") return

    // 1. Companies
    let loadedCompanies: AudioCompanyItem[] = []
    try {
      const savedC = localStorage.getItem(STORAGE_COMPANIES_KEY)
      if (savedC) {
        const parsed = JSON.parse(savedC)
        if (Array.isArray(parsed) && parsed.length > 0) loadedCompanies = parsed
      }
    } catch (e) {
      console.warn("Storage load exception:", e)
    }

    if (loadedCompanies.length === 0 && masterCompanies.length > 0) {
      loadedCompanies = masterCompanies.slice(0, 4).map((c, idx) => ({
        id: c.id || `audio-comp-${idx}`,
        companyName: c.companyName,
        siteLocation: c.siteLocation,
        createdAt: c.createdAt || "Jan 10, 2024",
        tracksCount: 14,
        status: idx < 2 ? "Ready" : "Draft",
      }))
    }
    setCompanyList(loadedCompanies)

    // 2. Folders (Seed 6 demo routes so tab bar and horizontal scroll are immediately active)
    let loadedFolders: AudioFolderItem[] = []
    try {
      const savedF = localStorage.getItem(STORAGE_FOLDERS_KEY)
      if (savedF) {
        const parsed = JSON.parse(savedF)
        if (Array.isArray(parsed)) loadedFolders = parsed
      }
    } catch (e) {
      console.warn("Storage load exception for folders:", e)
    }

    const DEMO_ROUTE_TEMPLATES = [
      { name: "Route 1", colorTag: "#4472C4" },
      { name: "Route 2", colorTag: "#548235" },
      { name: "Route 3", colorTag: "#ED7D31" },
      { name: "Route 4", colorTag: "#70AD47" },
      { name: "Route 5", colorTag: "#2E75B6" },
      { name: "Route 6", colorTag: "#7030A0" },
    ]

    loadedCompanies.forEach((comp) => {
      const compFolders = loadedFolders.filter((f) => f.companyId === comp.id)
      if (compFolders.length < 5) {
        DEMO_ROUTE_TEMPLATES.forEach((item, rIdx) => {
          if (!loadedFolders.some((f) => f.companyId === comp.id && f.name.toLowerCase() === item.name.toLowerCase())) {
            loadedFolders.push({
              id: `f-${comp.id}-route${rIdx + 1}`,
              companyId: comp.id,
              name: item.name,
              colorTag: item.colorTag,
              createdAt: "Jan 12, 2024",
            })
          }
        })
      }
    })
    setFolders(loadedFolders)

    // 3. Up Tracks Seed
    let loadedUp: StopAudioItem[] = []
    try {
      const savedUp = localStorage.getItem(STORAGE_UP_TRACKS_KEY)
      if (savedUp) {
        const parsed = JSON.parse(savedUp)
        if (Array.isArray(parsed)) loadedUp = parsed
      }
    } catch (e) {
      console.warn("Storage load exception for up tracks:", e)
    }

    if (loadedUp.length === 0 && loadedCompanies.length > 0) {
      loadedCompanies.forEach((comp) => {
        const fId = `f-${comp.id}-route1`
        const sampleStops = [
          "Mumbai Central Depot",
          "Dadar Station West",
          "Bandra Kurla Complex",
          "Andheri East Depot",
          "Borivali National Park",
          "Thane Station South",
          "Vashi Bus Station",
          "Mira Road Station",
        ]
        sampleStops.forEach((stop, idx) => {
          loadedUp.push({
            id: `up-${comp.id}-${idx}`,
            companyId: comp.id,
            folderId: fId,
            listType: "Up",
            stopName: stop,
            scriptText: `Next stop is ${stop}. Please mind the gap when exiting the electric bus.`,
            voiceModel: "66. Hindi (India) - IN (Swara)",
            voiceGender: "Female",
            speed: 0,
            pitch: 0,
            createdAt: "Jan 12, 2024",
          })
        })

        // Also seed Route 2 Up Stops
        const r2Id = `f-${comp.id}-route2`
        const r2Stops = [
          "Bandra Terminus",
          "BKC Diamond Bourse",
          "Kurla West Station",
          "Chembur Monorail",
          "Ghatkopar Metro Hub",
        ]
        r2Stops.forEach((stop, idx) => {
          loadedUp.push({
            id: `up-${comp.id}-r2-${idx}`,
            companyId: comp.id,
            folderId: r2Id,
            listType: "Up",
            stopName: stop,
            scriptText: `Next stop is ${stop}. Please prepare to deboard from the front doors.`,
            voiceModel: "66. Hindi (India) - IN (Swara)",
            voiceGender: "Female",
            speed: 0,
            pitch: 0,
            createdAt: "Feb 05, 2024",
          })
        })
      })
    }
    setUpTracks(loadedUp)

    // 4. Down Tracks Seed
    let loadedDown: StopAudioItem[] = []
    try {
      const savedDown = localStorage.getItem(STORAGE_DOWN_TRACKS_KEY)
      if (savedDown) {
        const parsed = JSON.parse(savedDown)
        if (Array.isArray(parsed)) loadedDown = parsed
      }
    } catch (e) {
      console.warn("Storage load exception for down tracks:", e)
    }

    if (loadedDown.length === 0 && loadedCompanies.length > 0) {
      loadedCompanies.forEach((comp) => {
        const fId = `f-${comp.id}-route1`
        const sampleStops = [
          "Mira Road Station",
          "Vashi Bus Station",
          "Thane Station South",
          "Borivali National Park",
          "Andheri East Depot",
          "Bandra Kurla Complex",
          "Dadar Station West",
          "Mumbai Central Depot",
        ]
        sampleStops.forEach((stop, idx) => {
          loadedDown.push({
            id: `down-${comp.id}-${idx}`,
            companyId: comp.id,
            folderId: fId,
            listType: "Down",
            stopName: stop,
            scriptText: `Returning stop is ${stop}. Doors opening on the left side.`,
            voiceModel: "66. Hindi (India) - IN (Swara)",
            voiceGender: "Female",
            speed: 0,
            pitch: 0,
            createdAt: "Jan 12, 2024",
          })
        })

        // Also seed Route 2 Down Stops
        const r2Id = `f-${comp.id}-route2`
        const r2DownStops = [
          "Ghatkopar Metro Hub",
          "Chembur Monorail",
          "Kurla West Station",
          "BKC Diamond Bourse",
          "Bandra Terminus",
        ]
        r2DownStops.forEach((stop, idx) => {
          loadedDown.push({
            id: `down-${comp.id}-r2-${idx}`,
            companyId: comp.id,
            folderId: r2Id,
            listType: "Down",
            stopName: stop,
            scriptText: `Returning destination ${stop}. Passengers please get ready to alight.`,
            voiceModel: "66. Hindi (India) - IN (Swara)",
            voiceGender: "Female",
            speed: 0,
            pitch: 0,
            createdAt: "Feb 05, 2024",
          })
        })
      })
    }
    setDownTracks(loadedDown)

    // 5. Other Tracks Seed
    let loadedOther: StopAudioItem[] = []
    try {
      const savedOther = localStorage.getItem(STORAGE_OTHER_TRACKS_KEY)
      if (savedOther) {
        const parsed = JSON.parse(savedOther)
        if (Array.isArray(parsed)) loadedOther = parsed
      }
    } catch (e) {
      console.warn("Storage load exception for other tracks:", e)
    }

    if (loadedOther.length === 0 && loadedCompanies.length > 0) {
      loadedCompanies.forEach((comp) => {
        const fId = `f-${comp.id}-route1`
        const sampleAnnouncements = [
          "Please stand behind the yellow safety line while the electric bus is moving.",
          "Please offer priority seating to senior citizens, women, and passengers with disabilities.",
          "Emergency exit doors and manual release levers are located near the rear exits.",
          "Digital ticketing, smart passes, and UPI QR payments are accepted on board.",
          "Transvolt Electric Mobility welcomes you on board. Have a safe and pleasant journey!",
        ]
        sampleAnnouncements.forEach((ann, idx) => {
          loadedOther.push({
            id: `other-${comp.id}-${idx}`,
            companyId: comp.id,
            folderId: fId,
            listType: "Others",
            stopName: `Safety Announcement ${idx + 1}`,
            scriptText: ann,
            voiceModel: "66. Hindi (India) - IN (Swara)",
            voiceGender: "Female",
            speed: 0,
            pitch: 0,
            createdAt: "Jan 12, 2024",
          })
        })

        // Also seed Route 2 Other Stops
        const r2Id = `f-${comp.id}-route2`
        const r2Other = [
          "Notice: CCTV surveillance is active throughout this electric bus journey.",
          "Kindly carry valid transit pass or use digital QR ticket scanning.",
          "For lost luggage inquiries, please contact Transvolt Depot Control.",
        ]
        r2Other.forEach((ann, idx) => {
          loadedOther.push({
            id: `other-${comp.id}-r2-${idx}`,
            companyId: comp.id,
            folderId: r2Id,
            listType: "Others",
            stopName: `Transit Advisory ${idx + 1}`,
            scriptText: ann,
            voiceModel: "66. Hindi (India) - IN (Swara)",
            voiceGender: "Female",
            speed: 0,
            pitch: 0,
            createdAt: "Feb 05, 2024",
          })
        })
      })
    }
    setOtherTracks(loadedOther)
  }, [masterCompanies])

  // Save Helpers
  const saveCompanies = (list: AudioCompanyItem[]) => {
    setCompanyList(list)
    try {
      localStorage.setItem(STORAGE_COMPANIES_KEY, JSON.stringify(list))
    } catch (e) {
      console.warn("localStorage quota warning:", e)
    }
  }

  const saveFolders = (list: AudioFolderItem[]) => {
    setFolders(list)
    try {
      localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(list))
    } catch (e) {
      console.warn("localStorage quota warning:", e)
    }
  }

  const saveUpTracks = (list: StopAudioItem[]) => {
    setUpTracks(list)
    try {
      localStorage.setItem(STORAGE_UP_TRACKS_KEY, JSON.stringify(list))
    } catch (e) {
      console.warn("localStorage quota warning:", e)
    }
  }

  const saveDownTracks = (list: StopAudioItem[]) => {
    setDownTracks(list)
    try {
      localStorage.setItem(STORAGE_DOWN_TRACKS_KEY, JSON.stringify(list))
    } catch (e) {
      console.warn("localStorage quota warning:", e)
    }
  }

  const saveOtherTracks = (list: StopAudioItem[]) => {
    setOtherTracks(list)
    try {
      localStorage.setItem(STORAGE_OTHER_TRACKS_KEY, JSON.stringify(list))
    } catch (e) {
      console.warn("localStorage quota warning:", e)
    }
  }

  // Handlers for Add Company & Add Folder
  const handleAddCompanySubmit = (data: { companyName: string; siteLocation: string }) => {
    const newComp: AudioCompanyItem = {
      id: `audio-comp-${Date.now()}`,
      companyName: data.companyName,
      siteLocation: data.siteLocation,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      tracksCount: 0,
      status: "Draft",
    }
    saveCompanies([newComp, ...companyList])
  }

  // Directly add the next numbered Route (e.g. Route 1, Route 2, Route 3...) without showing popout modal
  const handleAddNextRoute = () => {
    if (!activeCompany) return

    const existingNumbers = companyFolders
      .map((f) => {
        const match = f.name.match(/^Route\s*(\d+)$/i)
        return match ? parseInt(match[1], 10) : null
      })
      .filter((n): n is number => n !== null)

    let nextNum = companyFolders.length + 1
    if (existingNumbers.length > 0) {
      nextNum = Math.max(...existingNumbers) + 1
    }

    let newRouteName = `Route ${nextNum}`
    while (companyFolders.some((f) => f.name.toLowerCase() === newRouteName.toLowerCase())) {
      nextNum++
      newRouteName = `Route ${nextNum}`
    }

    const ROUTE_COLORS = ["#4472C4", "#548235", "#ED7D31", "#70AD47", "#2E75B6", "#7030A0", "#C00000"]
    const colorTag = ROUTE_COLORS[(nextNum - 1) % ROUTE_COLORS.length]

    const newFolder: AudioFolderItem = {
      id: `f-${activeCompany.id}-${Date.now()}`,
      companyId: activeCompany.id,
      name: newRouteName,
      colorTag: colorTag,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }

    const updated = [...folders, newFolder]
    saveFolders(updated)
    setActiveFolder(newFolder)
    toast.success(`"${newRouteName}" added!`)
  }

  const handleCreateFolderSubmit = (folderName: string, colorTag: string) => {
    if (!activeCompany) return
    const newFolder: AudioFolderItem = {
      id: `f-${activeCompany.id}-${Date.now()}`,
      companyId: activeCompany.id,
      name: folderName,
      colorTag: colorTag,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }
    const updated = [...folders, newFolder]
    saveFolders(updated)
    setActiveFolder(newFolder)
    toast.success(`Route "${folderName}" created successfully!`)
  }

  // Route Tab Inline Rename Handlers
  const startRenameFolder = (folder: AudioFolderItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setActiveFolder(folder)
    setEditingFolderId(folder.id)
    setEditingFolderName(folder.name)
  }

  const commitRenameFolder = () => {
    if (!editingFolderId) return
    const trimmed = editingFolderName.trim()
    if (trimmed && activeCompany) {
      const updated = folders.map((f) => (f.id === editingFolderId ? { ...f, name: trimmed } : f))
      saveFolders(updated)
      if (activeFolder?.id === editingFolderId) {
        setActiveFolder((prev) => (prev ? { ...prev, name: trimmed } : null))
      }
      toast.success(`Route renamed to "${trimmed}"`)
    }
    setEditingFolderId(null)
  }

  // Route Tab Drag & Drop Reorder Handler
  const handleTabDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedRouteIndex === null || draggedRouteIndex === dropIndex || !activeCompany) {
      setDraggedRouteIndex(null)
      setDragOverRouteIndex(null)
      setDragOverPosition(null)
      return
    }

    const currentCompanyFolders = [...companyFolders]
    const [movedFolder] = currentCompanyFolders.splice(draggedRouteIndex, 1)

    // Calculate insertion index
    let insertIdx = dropIndex
    if (draggedRouteIndex < dropIndex) {
      insertIdx = dragOverPosition === "left" ? dropIndex - 1 : dropIndex
    } else {
      insertIdx = dragOverPosition === "right" ? dropIndex + 1 : dropIndex
    }
    insertIdx = Math.max(0, Math.min(insertIdx, currentCompanyFolders.length))
    currentCompanyFolders.splice(insertIdx, 0, movedFolder)

    // Preserve routes belonging to other companies
    const otherCompanyFolders = folders.filter((f) => f.companyId !== activeCompany.id)
    const newAllFolders = [...otherCompanyFolders, ...currentCompanyFolders]
    saveFolders(newAllFolders)
    setDraggedRouteIndex(null)
    setDragOverRouteIndex(null)
    setDragOverPosition(null)
    toast.success(`Moved "${movedFolder.name}" to position ${insertIdx + 1}`)
  }

  // Route Tab Delete Handlers
  const promptDeleteFolder = (folder: AudioFolderItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const compRoutes = folders.filter((f) => f.companyId === activeCompany?.id)
    if (compRoutes.length <= 1) {
      toast.error("At least one route must remain for this company.")
      return
    }
    setFolderPendingDelete(folder)
  }

  const handleConfirmDeleteFolder = () => {
    if (!folderPendingDelete || !activeCompany) return

    const updatedFolders = folders.filter((f) => f.id !== folderPendingDelete.id)
    saveFolders(updatedFolders)

    // Remove tracks belonging to this deleted route
    const updatedUp = upTracks.filter(
      (t) => !(t.companyId === activeCompany.id && t.folderId === folderPendingDelete.id)
    )
    const updatedDown = downTracks.filter(
      (t) => !(t.companyId === activeCompany.id && t.folderId === folderPendingDelete.id)
    )
    const updatedOther = otherTracks.filter(
      (t) => !(t.companyId === activeCompany.id && t.folderId === folderPendingDelete.id)
    )
    saveUpTracks(updatedUp)
    saveDownTracks(updatedDown)
    saveOtherTracks(updatedOther)

    // If active folder was deleted, select the first remaining
    if (activeFolder?.id === folderPendingDelete.id) {
      const remaining = updatedFolders.filter((f) => f.companyId === activeCompany.id)
      if (remaining.length > 0) {
        setActiveFolder(remaining[0])
      }
    }

    toast.success(`Route "${folderPendingDelete.name}" deleted.`)
    setFolderPendingDelete(null)
  }

  // Handler when Audio is generated from Image 2 Voice Modal
  const handleGeneratedVoiceTrack = (data: {
    title: string
    scriptText: string
    voiceGender: "Male" | "Female"
    voiceModel: string
    speed: number
    pitch: number
    duration: string
    listType: "Up" | "Down" | "Others"
  }) => {
    if (!activeCompany || !activeFolder) return

    const newTrack: StopAudioItem = {
      id: `${data.listType.toLowerCase()}-${Date.now()}`,
      companyId: activeCompany.id,
      folderId: activeFolder.id,
      listType: data.listType,
      stopName: data.title,
      scriptText: data.scriptText,
      voiceModel: data.voiceModel,
      voiceGender: data.voiceGender,
      speed: data.speed,
      pitch: data.pitch,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }

    if (data.listType === "Up") {
      saveUpTracks([...upTracks, newTrack])
    } else if (data.listType === "Down") {
      saveDownTracks([...downTracks, newTrack])
    } else {
      saveOtherTracks([...otherTracks, newTrack])
    }
  }

  // Row Audio Play / Pause Handler using Original Dhwani Female Neural Voice API
  const toggleRowPlay = async (trackId: string, scriptText: string, stopName: string) => {
    if (playQueueRef.current) {
      playQueueRef.current = null
      setPlayingListType(null)
    }
    stopPlaybackLoop()
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current)
    if (activeAudioRef.current) {
      activeAudioRef.current.pause()
      activeAudioRef.current = null
    }

    // If currently playing or loading this track, stop/cancel it
    if (playingTrackId === trackId || loadingTrackId === trackId) {
      playRequestIdRef.current++
      setLoadingTrackId(null)
      setPlayingTrackId(null)
      setIsAudioSoundEmitting(false)
      setIsCatVisible(false)
      setPlaybackProgress(0)
      setPlaybackCurrentTime(0)
      return
    }

    const currentRequestId = ++playRequestIdRef.current
    setLoadingTrackId(trackId)
    setPlayingTrackId(null)
    setIsAudioSoundEmitting(false)
    setIsCatVisible(false)
    setPlaybackProgress(0)
    setPlaybackCurrentTime(0)

    const textToSpeak = scriptText || stopName || `Next stop ${stopName}`

    try {
      const response = await fetch("/api/tts/dhwani", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSpeak,
          gender: "Female",
          voiceModel: "hi-swara",
        }),
      })

      if (playRequestIdRef.current !== currentRequestId) return

      if (response.ok) {
        const blob = await response.blob()
        if (playRequestIdRef.current !== currentRequestId) return

        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)
        activeAudioRef.current = audio

        audio.onplay = () => {
          if (playRequestIdRef.current !== currentRequestId) return
          setLoadingTrackId(null)
          setPlayingTrackId(trackId)
          setIsAudioSoundEmitting(true)
          setIsCatVisible(true)
          startPlaybackLoop(audio)
        }

        audio.onplaying = () => {
          if (playRequestIdRef.current !== currentRequestId) return
          setIsAudioSoundEmitting(true)
          setIsCatVisible(true)
        }

        audio.onpause = () => {
          setIsAudioSoundEmitting(false)
          setIsCatVisible(false)
          stopPlaybackLoop()
        }

        audio.onended = () => {
          setIsAudioSoundEmitting(false)
          setIsCatVisible(false)
          stopPlaybackLoop()
          setPlayingTrackId(null)
          setPlaybackProgress(100)
          setTimeout(() => {
            setPlaybackProgress(0)
            setPlaybackCurrentTime(0)
          }, 350)
          URL.revokeObjectURL(audioUrl)
        }

        audio.onerror = () => {
          setIsAudioSoundEmitting(false)
          setIsCatVisible(false)
          stopPlaybackLoop()
          setPlayingTrackId(null)
          setPlaybackProgress(0)
          setPlaybackCurrentTime(0)
          URL.revokeObjectURL(audioUrl)
        }

        await audio.play()
        return
      }
    } catch (e) {
      console.warn("Row play Dhwani API error:", e)
    }

    if (playRequestIdRef.current !== currentRequestId) return

    // Fallback stream
    const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      textToSpeak
    )}&tl=gu&client=tw-ob`

    const audio = new Audio(fallbackUrl)
    activeAudioRef.current = audio

    audio.onplay = () => {
      if (playRequestIdRef.current !== currentRequestId) return
      setLoadingTrackId(null)
      setPlayingTrackId(trackId)
      setIsAudioSoundEmitting(true)
      setIsCatVisible(true)
      startPlaybackLoop(audio)
    }

    audio.onplaying = () => {
      if (playRequestIdRef.current !== currentRequestId) return
      setIsAudioSoundEmitting(true)
      setIsCatVisible(true)
    }

    audio.onpause = () => {
      setIsAudioSoundEmitting(false)
      setIsCatVisible(false)
      stopPlaybackLoop()
    }

    audio.onended = () => {
      setIsAudioSoundEmitting(false)
      setIsCatVisible(false)
      stopPlaybackLoop()
      setPlayingTrackId(null)
      setPlaybackProgress(100)
      setTimeout(() => {
        setPlaybackProgress(0)
        setPlaybackCurrentTime(0)
      }, 350)
    }

    audio.onerror = () => {
      setIsAudioSoundEmitting(false)
      setIsCatVisible(false)
      stopPlaybackLoop()
      setPlayingTrackId(null)
      setPlaybackProgress(0)
      setPlaybackCurrentTime(0)
    }

    audio.play().catch(() => {
      if (playRequestIdRef.current !== currentRequestId) return
      stopPlaybackLoop()
      setLoadingTrackId(null)
      setPlayingTrackId(null)
      setIsAudioSoundEmitting(false)
      setIsCatVisible(false)
      setPlaybackProgress(0)
      setPlaybackCurrentTime(0)
    })
  }

  // Delete Track Handlers with Interactive Red Alert
  const promptDeleteTrack = (id: string, name: string, listType: "Up" | "Down" | "Others") => {
    setItemPendingDelete({ id, name, listType })
  }

  const handleConfirmDelete = () => {
    if (!itemPendingDelete) return
    const { id, name, listType, ids } = itemPendingDelete
    if (ids && ids.length > 0) {
      if (listType === "Up") {
        saveUpTracks(upTracks.filter((t) => !ids.includes(t.id)))
        setSelectedUpIds([])
      } else if (listType === "Down") {
        saveDownTracks(downTracks.filter((t) => !ids.includes(t.id)))
        setSelectedDownIds([])
      } else {
        saveOtherTracks(otherTracks.filter((t) => !ids.includes(t.id)))
        setSelectedOtherIds([])
      }
      toast.error(`Deleted ${ids.length} stops from ${listType} list`, {
        description: "The audio announcements were removed from this route.",
      })
      setItemPendingDelete(null)
      return
    }

    if (listType === "Up") {
      saveUpTracks(upTracks.filter((t) => t.id !== id))
      setSelectedUpIds((prev) => prev.filter((i) => i !== id))
    } else if (listType === "Down") {
      saveDownTracks(downTracks.filter((t) => t.id !== id))
      setSelectedDownIds((prev) => prev.filter((i) => i !== id))
    } else {
      saveOtherTracks(otherTracks.filter((t) => t.id !== id))
      setSelectedOtherIds((prev) => prev.filter((i) => i !== id))
    }
    toast.error(`Deleted "${name}" from ${listType} list`, {
      description: "The audio announcement was removed from this route.",
    })
    setItemPendingDelete(null)
  }

  // Download all Up+Down+Others tracks in a Folder as one ZIP
  const handleDownloadFolderZip = async (folder: AudioFolderItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const folderUp = upTracks.filter((t) => t.folderId === folder.id && t.companyId === folder.companyId)
    const folderDown = downTracks.filter((t) => t.folderId === folder.id && t.companyId === folder.companyId)
    const folderOther = otherTracks.filter((t) => t.folderId === folder.id && t.companyId === folder.companyId)
    const total = folderUp.length + folderDown.length + folderOther.length
    if (total === 0) { toast.error(`No tracks in folder "${folder.name}" yet.`); return }

    setIsZipping(true)
    const toastId = toast.loading(`Preparing "${folder.name}" ZIP (${total} tracks)...`)
    try {
      const entries: Array<{ path: string; data: Uint8Array }> = []
      for (let i = 0; i < folderUp.length; i++) {
        const item = folderUp[i]
        toast.loading(`Up ${i + 1}/${folderUp.length}: "${item.stopName}"...`, { id: toastId })
        const buf = await fetchAudioData(item.scriptText || item.stopName, item.voiceModel || "hi-swara", item.voiceGender || "Female", item.speed || 0, item.pitch || 0)
        entries.push({ path: `Up/${String(i + 1).padStart(2, "0")} - ${sanitizeFilename(item.stopName)}.mp3`, data: buf })
      }
      for (let i = 0; i < folderDown.length; i++) {
        const item = folderDown[i]
        toast.loading(`Down ${i + 1}/${folderDown.length}: "${item.stopName}"...`, { id: toastId })
        const buf = await fetchAudioData(item.scriptText || item.stopName, item.voiceModel || "hi-swara", item.voiceGender || "Female", item.speed || 0, item.pitch || 0)
        entries.push({ path: `Down/${String(i + 1).padStart(2, "0")} - ${sanitizeFilename(item.stopName)}.mp3`, data: buf })
      }
      for (let i = 0; i < folderOther.length; i++) {
        const item = folderOther[i]
        toast.loading(`Others ${i + 1}/${folderOther.length}: "${item.stopName}"...`, { id: toastId })
        const buf = await fetchAudioData(item.scriptText || item.stopName, item.voiceModel || "hi-swara", item.voiceGender || "Female", item.speed || 0, item.pitch || 0)
        entries.push({ path: `Others/${String(i + 1).padStart(2, "0")} - ${sanitizeFilename(item.stopName)}.mp3`, data: buf })
      }
      const comp = companyList.find((c) => c.id === folder.companyId)
      const zipName = `${sanitizeFilename(comp?.companyName || "Company")}_${sanitizeFilename(folder.name)}_Audio.zip`
      triggerBrowserDownload(createZipBlob(entries), zipName)
      toast.success(`Downloaded ${zipName}!`, { id: toastId })
    } catch (err) {
      console.error("Folder ZIP error:", err)
      toast.error(`Failed to generate ZIP for "${folder.name}".`, { id: toastId })
    } finally {
      setIsZipping(false)
    }
  }

  // Download ALL tracks across all folders of a company as one ZIP
  const handleDownloadCompanyZip = async (company: AudioCompanyItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const compUp = upTracks.filter((t) => t.companyId === company.id)
    const compDown = downTracks.filter((t) => t.companyId === company.id)
    const compOther = otherTracks.filter((t) => t.companyId === company.id)
    const total = compUp.length + compDown.length + compOther.length
    if (total === 0) { toast.error(`No audio tracks for "${company.companyName}" yet.`); return }

    setIsZipping(true)
    const toastId = toast.loading(`Packaging all routes for "${company.companyName}" (${total} tracks)...`)
    try {
      const entries: Array<{ path: string; data: Uint8Array }> = []
      const compFolders = folders.filter((f) => f.companyId === company.id)

      for (const folder of compFolders) {
        const fUp = compUp.filter((t) => t.folderId === folder.id)
        const fDown = compDown.filter((t) => t.folderId === folder.id)
        const fOther = compOther.filter((t) => t.folderId === folder.id)

        for (let i = 0; i < fUp.length; i++) {
          const item = fUp[i]
          toast.loading(`[${folder.name}] Up ${i + 1}/${fUp.length}: "${item.stopName}"...`, { id: toastId })
          const buf = await fetchAudioData(item.scriptText || item.stopName, item.voiceModel || "hi-swara", item.voiceGender || "Female", item.speed || 0, item.pitch || 0)
          entries.push({ path: `${sanitizeFilename(folder.name)}/Up/${String(i + 1).padStart(2, "0")} - ${sanitizeFilename(item.stopName)}.mp3`, data: buf })
        }
        for (let i = 0; i < fDown.length; i++) {
          const item = fDown[i]
          toast.loading(`[${folder.name}] Down ${i + 1}/${fDown.length}: "${item.stopName}"...`, { id: toastId })
          const buf = await fetchAudioData(item.scriptText || item.stopName, item.voiceModel || "hi-swara", item.voiceGender || "Female", item.speed || 0, item.pitch || 0)
          entries.push({ path: `${sanitizeFilename(folder.name)}/Down/${String(i + 1).padStart(2, "0")} - ${sanitizeFilename(item.stopName)}.mp3`, data: buf })
        }
        for (let i = 0; i < fOther.length; i++) {
          const item = fOther[i]
          toast.loading(`[${folder.name}] Others ${i + 1}/${fOther.length}: "${item.stopName}"...`, { id: toastId })
          const buf = await fetchAudioData(item.scriptText || item.stopName, item.voiceModel || "hi-swara", item.voiceGender || "Female", item.speed || 0, item.pitch || 0)
          entries.push({ path: `${sanitizeFilename(folder.name)}/Others/${String(i + 1).padStart(2, "0")} - ${sanitizeFilename(item.stopName)}.mp3`, data: buf })
        }
      }

      const zipName = `${sanitizeFilename(company.companyName)}_All_Routes_Audio.zip`
      triggerBrowserDownload(createZipBlob(entries), zipName)
      toast.success(`Downloaded ${zipName}!`, { id: toastId })
    } catch (err) {
      console.error("Company ZIP error:", err)
      toast.error(`Failed to generate company ZIP.`, { id: toastId })
    } finally {
      setIsZipping(false)
    }
  }

  // 1. Download Single MP3 Track
  const handleDownloadSingleTrack = async (item: StopAudioItem, index: number) => {
    setDownloadingTrackId(item.id)
    const toastId = toast.loading(`Synthesizing MP3 for "${item.stopName}"...`)

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
      toast.success(`Downloaded: ${filename}`, { id: toastId })
    } catch (e) {
      console.error("Single track download error:", e)
      toast.error(`Failed to download audio for "${item.stopName}"`, { id: toastId })
    } finally {
      setDownloadingTrackId(null)
    }
  }

  // 2. Download Single List in ZIP (Up, Down or Others list)
  const handleDownloadListZip = async (listType: "Up" | "Down" | "Others", tracks: StopAudioItem[]) => {
    if (tracks.length === 0) {
      toast.error(`No audio tracks available in ${listType} list to download.`)
      return
    }

    setIsZipping(true)
    const toastId = toast.loading(`Packaging ${listType} list ZIP (0/${tracks.length})...`)

    try {
      const zipEntries: Array<{ path: string; data: Uint8Array }> = []
      const textLines: string[] = [
        `============================================================`,
        `TRANSVOLT MOBILITY PRIVATE LIMITED`,
        `Route Audio: ${activeFolder?.name || "Route"} - ${listType} Section`,
        `Company: ${activeCompany?.companyName || "Transvolt"}`,
        `Total Items: ${tracks.length}`,
        `Downloaded: ${new Date().toLocaleString()}`,
        `============================================================\n`,
      ]

      for (let i = 0; i < tracks.length; i++) {
        const item = tracks[i]
        toast.loading(`Synthesizing ${listType} Audio ${i + 1}/${tracks.length}: "${item.stopName}"...`, {
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

      // Add text order file
      const textContent = textLines.join("\n")
      const textBuffer = new TextEncoder().encode(textContent)
      zipEntries.push({ path: "00 - Sequence & Announcement List.txt", data: textBuffer })

      const zipBlob = createZipBlob(zipEntries)
      const zipName = `${sanitizeFilename(activeCompany?.companyName || "Transvolt")}_${sanitizeFilename(
        activeFolder?.name || "Route"
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

  // 3. Download ALL Lists in ZIP (Up, Down & Others)
  const handleDownloadAllListsZip = async () => {
    const upList = filteredUpList
    const downList = filteredDownList
    const otherList = filteredOtherList
    const totalCount = upList.length + downList.length + otherList.length

    if (totalCount === 0) {
      toast.error("No audio tracks available in any list to download.")
      return
    }

    setIsZipping(true)
    const toastId = toast.loading(`Preparing complete route ZIP (${totalCount} total tracks)...`)

    try {
      const zipEntries: Array<{ path: string; data: Uint8Array }> = []
      const textLines: string[] = [
        `============================================================`,
        `TRANSVOLT MOBILITY PRIVATE LIMITED`,
        `Complete Route Audio Package: ${activeFolder?.name || "Route 1"}`,
        `Company: ${activeCompany?.companyName || "Transvolt"}`,
        `Up Stops: ${upList.length} | Down Stops: ${downList.length} | Other Announcements: ${otherList.length}`,
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

      textLines.push(`\n--- OTHERS (GENERAL ANNOUNCEMENTS) ---`)

      // 3. Process OTHERS tracks
      for (let i = 0; i < otherList.length; i++) {
        const item = otherList[i]
        toast.loading(`Processing Others [${i + 1}/${otherList.length}]: "${item.stopName}"...`, {
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

        const filename = `Others/${String(i + 1).padStart(2, "0")} - ${sanitizeFilename(item.stopName)}.mp3`
        zipEntries.push({ path: filename, data: audioBuffer })
        textLines.push(`Other #${String(i + 1).padStart(2, "0")}: [${item.stopName}] -> "${textToSpeak}"`)
      }

      // Add comprehensive route summary
      const textContent = textLines.join("\n")
      const textBuffer = new TextEncoder().encode(textContent)
      zipEntries.push({ path: "00 - Complete Route Summary.txt", data: textBuffer })

      const zipBlob = createZipBlob(zipEntries)
      const zipName = `${sanitizeFilename(activeCompany?.companyName || "Transvolt")}_${sanitizeFilename(
        activeFolder?.name || "Route"
      )}_All_Audio_(Up_Down_Others).zip`

      triggerBrowserDownload(zipBlob, zipName)
      toast.success(`Downloaded complete package: ${zipName}!`, { id: toastId })
    } catch (e) {
      console.error("All ZIP download error:", e)
      toast.error("Failed to generate complete route ZIP.", { id: toastId })
    } finally {
      setIsZipping(false)
    }
  }

  // Drag & Drop Handlers for Reordering & Duplication across Up, Down & Others
  const handleDragStart = (e: React.DragEvent, item: StopAudioItem, fromList: "Up" | "Down" | "Others", index: number) => {
    setDraggedItem({ item, fromList, index })
    e.dataTransfer.effectAllowed = "copyMove"
    e.dataTransfer.setData("text/plain", item.id)
  }

  const handleDragOver = (e: React.DragEvent, targetList: "Up" | "Down" | "Others", index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverList(targetList)
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, targetList: "Up" | "Down" | "Others", targetIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverList(null)
    setDragOverIndex(null)

    if (!draggedItem || !activeCompany || !activeFolder) return

    const { item, fromList } = draggedItem

    // 1. Dragging within SAME list -> Reorder items
    if (fromList === targetList) {
      const currentList =
        fromList === "Up" ? [...upTracks] : fromList === "Down" ? [...downTracks] : [...otherTracks]
      const folderItems = currentList.filter(
        (t) => t.companyId === activeCompany.id && t.folderId === activeFolder.id
      )
      const otherItems = currentList.filter(
        (t) => !(t.companyId === activeCompany.id && t.folderId === activeFolder.id)
      )

      const fromIdx = folderItems.findIndex((t) => t.id === item.id)
      if (fromIdx === -1) return

      const filteredList =
        fromList === "Up" ? filteredUpList : fromList === "Down" ? filteredDownList : filteredOtherList
      const targetItem = filteredList[targetIndex]
      let toIdx = targetItem ? folderItems.findIndex((t) => t.id === targetItem.id) : folderItems.length
      if (toIdx === -1) toIdx = folderItems.length

      // Remove from current position and insert at new position
      const [moved] = folderItems.splice(fromIdx, 1)
      folderItems.splice(toIdx, 0, moved)

      const reorderedList = [...otherItems, ...folderItems]
      if (fromList === "Up") {
        saveUpTracks(reorderedList)
      } else if (fromList === "Down") {
        saveDownTracks(reorderedList)
      } else {
        saveOtherTracks(reorderedList)
      }
      toast.info(`Reordered "${item.stopName}" in ${targetList} list`)
    }
    // 2. Dragging between DIFFERENT lists -> DUPLICATE item into target list!
    else {
      const duplicatedTrack: StopAudioItem = {
        ...item,
        id: `${targetList.toLowerCase()}-dup-${Date.now()}`,
        companyId: activeCompany.id,
        folderId: activeFolder.id,
        listType: targetList,
        createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      }

      if (targetList === "Up") {
        const folderUp = upTracks.filter(
          (t) => t.companyId === activeCompany.id && t.folderId === activeFolder.id
        )
        const otherUp = upTracks.filter(
          (t) => !(t.companyId === activeCompany.id && t.folderId === activeFolder.id)
        )
        const targetItem = filteredUpList[targetIndex]
        let toIdx = targetItem ? folderUp.findIndex((t) => t.id === targetItem.id) : folderUp.length
        if (toIdx === -1) toIdx = folderUp.length
        folderUp.splice(toIdx, 0, duplicatedTrack)
        saveUpTracks([...otherUp, ...folderUp])
      } else if (targetList === "Down") {
        const folderDown = downTracks.filter(
          (t) => t.companyId === activeCompany.id && t.folderId === activeFolder.id
        )
        const otherDown = downTracks.filter(
          (t) => !(t.companyId === activeCompany.id && t.folderId === activeFolder.id)
        )
        const targetItem = filteredDownList[targetIndex]
        let toIdx = targetItem ? folderDown.findIndex((t) => t.id === targetItem.id) : folderDown.length
        if (toIdx === -1) toIdx = folderDown.length
        folderDown.splice(toIdx, 0, duplicatedTrack)
        saveDownTracks([...otherDown, ...folderDown])
      } else {
        const folderOther = otherTracks.filter(
          (t) => t.companyId === activeCompany.id && t.folderId === activeFolder.id
        )
        const otherRest = otherTracks.filter(
          (t) => !(t.companyId === activeCompany.id && t.folderId === activeFolder.id)
        )
        const targetItem = filteredOtherList[targetIndex]
        let toIdx = targetItem ? folderOther.findIndex((t) => t.id === targetItem.id) : folderOther.length
        if (toIdx === -1) toIdx = folderOther.length
        folderOther.splice(toIdx, 0, duplicatedTrack)
        saveOtherTracks([...otherRest, ...folderOther])
      }

      toast.success(`Duplicated "${item.stopName}" from ${fromList} to ${targetList} list!`)
    }

    setDraggedItem(null)
  }

  // Filtered Up, Down & Others Lists for Active Folder
  const filteredUpList = React.useMemo(() => {
    if (!activeCompany || !activeFolder) return []
    return upTracks.filter(
      (t) =>
        t.companyId === activeCompany.id &&
        t.folderId === activeFolder.id &&
        t.stopName.toLowerCase().includes(upSearch.toLowerCase().trim())
    )
  }, [upTracks, activeCompany, activeFolder, upSearch])

  const filteredDownList = React.useMemo(() => {
    if (!activeCompany || !activeFolder) return []
    return downTracks.filter(
      (t) =>
        t.companyId === activeCompany.id &&
        t.folderId === activeFolder.id &&
        t.stopName.toLowerCase().includes(downSearch.toLowerCase().trim())
    )
  }, [downTracks, activeCompany, activeFolder, downSearch])

  const filteredOtherList = React.useMemo(() => {
    if (!activeCompany || !activeFolder) return []
    return otherTracks.filter(
      (t) =>
        t.companyId === activeCompany.id &&
        t.folderId === activeFolder.id &&
        t.stopName.toLowerCase().includes(otherSearch.toLowerCase().trim())
    )
  }, [otherTracks, activeCompany, activeFolder, otherSearch])

  // Clear selection when activeFolder or activeCompany changes
  React.useEffect(() => {
    setSelectedUpIds([])
    setSelectedDownIds([])
    setSelectedOtherIds([])
  }, [activeFolder?.id, activeCompany?.id])

  // Individual Track Selection Toggles
  const toggleSelectUpTrack = (id: string) => {
    setSelectedUpIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectDownTrack = (id: string) => {
    setSelectedDownIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectOtherTrack = (id: string) => {
    setSelectedOtherIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // Toggle Select All
  const isAllUpSelected = filteredUpList.length > 0 && selectedUpIds.length === filteredUpList.length
  const toggleSelectAllUp = () => {
    if (isAllUpSelected) {
      setSelectedUpIds([])
    } else {
      setSelectedUpIds(filteredUpList.map((t) => t.id))
    }
  }

  const isAllDownSelected = filteredDownList.length > 0 && selectedDownIds.length === filteredDownList.length
  const toggleSelectAllDown = () => {
    if (isAllDownSelected) {
      setSelectedDownIds([])
    } else {
      setSelectedDownIds(filteredDownList.map((t) => t.id))
    }
  }

  const isAllOtherSelected = filteredOtherList.length > 0 && selectedOtherIds.length === filteredOtherList.length
  const toggleSelectAllOther = () => {
    if (isAllOtherSelected) {
      setSelectedOtherIds([])
    } else {
      setSelectedOtherIds(filteredOtherList.map((t) => t.id))
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 pb-12 text-left">
      {/* =========================================================================
          LEVEL 3: INSIDE FOLDER DUAL LIST VIEW (UP & DOWN) - MATCHING IMAGE 1 & NEW REQS!
          ========================================================================= */}
      {activeCompany ? (
        <div className="space-y-4">
          {/* Top Header Section: Left-aligned Company Name & Subtext | Right-aligned Actions in Column */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-border/60 pb-5">
            {/* Left: Back Button + Company Name + Subtitle (Left-aligned) */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCompany(null)
                    setActiveFolder(null)
                  }}
                  className="h-8 w-8 rounded-full flex items-center justify-center bg-card border border-border/80 hover:bg-[#4472C4]/15 text-muted-foreground hover:text-[#4472C4] transition-colors cursor-pointer shrink-0 shadow-2xs"
                  title="Back to all companies"
                >
                  <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {activeCompany.companyName}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium sm:pl-10.5">
                Organize audio tracks, announcements, and voice assets into distinct routes.
              </p>
            </div>

            {/* Right: Talking Cat Mascot (Left of buttons, appears ONLY when audio is playing) + Top Download & Share Buttons */}
            <div className="flex flex-row items-center gap-3 sm:gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
              {/* Talking Cat Mascot - Simple Cat Only, appears ONLY when any audio is actively playing sound */}
              {isCatVisible && (
                <div
                  className="relative w-16 h-16 sm:w-[74px] sm:h-[74px] shrink-0 rounded-full overflow-hidden select-none animate-cat-slide-in"
                  title="Audio is playing..."
                >
                  <img
                    src="/cat-avatar/cat-1.png?v=2"
                    alt="Talking Cat Closed"
                    className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none ${
                      catTalkingIndex === 0 ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <img
                    src="/cat-avatar/cat-2.png?v=2"
                    alt="Talking Cat Speaking"
                    className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none ${
                      catTalkingIndex === 1 ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <img
                    src="/cat-avatar/cat-3.png?v=2"
                    alt="Talking Cat Open"
                    className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none ${
                      catTalkingIndex === 2 ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
              )}

              {/* Right: Download Company (All Routes) & Share Company (All Routes) in COLUMN */}
              <div className="flex flex-col gap-2.5 items-start sm:items-end shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={(e) => handleDownloadCompanyZip(activeCompany, e)}
                  disabled={isZipping}
                  className="bg-[#548235] hover:bg-[#48732e] disabled:opacity-60 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 w-full sm:w-64 justify-center"
                  title={`Download complete audio package for ${activeCompany.companyName} (all routes and lists)`}
                >
                  {isZipping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CircleArrowDown className="h-3.5 w-3.5" />}
                  <span>Download All Routes in Zip</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const compUp = upTracks.filter((t) => t.companyId === activeCompany.id)
                    const compDown = downTracks.filter((t) => t.companyId === activeCompany.id)
                    const compOther = otherTracks.filter((t) => t.companyId === activeCompany.id)
                    setShareModalTitle(`${activeCompany.companyName} - All Routes (${compUp.length + compDown.length + compOther.length} Audio Tracks)`)
                    setSharePayload({
                      folderName: "All Routes",
                      up: compUp,
                      down: compDown,
                      other: compOther,
                    })
                    setIsShareModalOpen(true)
                  }}
                  className="bg-[#4472C4] hover:bg-[#3b63ab] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 w-full sm:w-64 justify-center"
                  title={`Share all routes and audio stops for ${activeCompany.companyName} for 6 hours`}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share All Routes For 6 Hours</span>
                </button>
              </div>
            </div>
          </div>

          {/* ROUTE PILL TABS BAR: SIMPLE CLEAN PILLS MATCHING USER REFERENCE IMAGE */}
          <div className="pt-2 pb-1 w-full">
            <div className="w-full relative">
              <div className="relative flex items-center w-full">
                {/* Left Scroll Chevron Button */}
                {canScrollLeft && (
                  <button
                    type="button"
                    onClick={handleTabScrollLeft}
                    className="absolute -left-2 top-1/2 -translate-y-1/2 z-30 h-8 w-8 rounded-full bg-card/95 hover:bg-card text-foreground hover:text-[#4472C4] shadow-md border border-border flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                    title="Scroll left"
                  >
                    <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
                  </button>
                )}

                {/* Left Gradient Fade Mask */}
                {canScrollLeft && (
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-20" />
                )}

                {/* Scrollable Pill Tabs Track */}
                <div
                  ref={tabScrollRef}
                  className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scroll-smooth w-full no-scrollbar py-1 px-0.5"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {companyFolders.map((folder, idx) => {
                    const isActive = activeFolder?.id === folder.id
                    const isEditingThis = editingFolderId === folder.id
                    const isDragged = draggedRouteIndex === idx
                    const isDragOver = dragOverRouteIndex === idx

                    return (
                      <div
                        key={folder.id}
                        id={`route-tab-${folder.id}`}
                        draggable={!isEditingThis}
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = "move"
                          e.dataTransfer.setData("text/plain", folder.id)
                          setDraggedRouteIndex(idx)
                        }}
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.dataTransfer.dropEffect = "move"
                          const rect = e.currentTarget.getBoundingClientRect()
                          const midX = rect.left + rect.width / 2
                          setDragOverRouteIndex(idx)
                          setDragOverPosition(e.clientX < midX ? "left" : "right")
                        }}
                        onDragLeave={() => {
                          if (dragOverRouteIndex === idx) {
                            setDragOverRouteIndex(null)
                            setDragOverPosition(null)
                          }
                        }}
                        onDrop={(e) => handleTabDrop(e, idx)}
                        onDragEnd={() => {
                          setDraggedRouteIndex(null)
                          setDragOverRouteIndex(null)
                          setDragOverPosition(null)
                        }}
                        onClick={() => {
                          if (isEditingThis) return
                          setActiveFolder(folder)
                          if (playingTrackId || playingListType) {
                            stopSequentialPlay()
                          }
                        }}
                        onDoubleClick={(e) => startRenameFolder(folder, e)}
                        className={`group relative flex items-center gap-2 h-9 px-4 rounded-full select-none cursor-pointer transition-all shrink-0 ${
                          isActive
                            ? "bg-[#4472C4] text-white font-bold shadow-sm shadow-[#4472C4]/30 ring-1 ring-[#4472C4]"
                            : "bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground font-semibold border border-border/60"
                        } ${
                          isDragged ? "opacity-35 scale-95" : "hover:-translate-y-0.5 active:scale-[0.98]"
                        }`}
                        title={`${folder.name} • Drag to reorder • 3 dots for options`}
                      >
                        {/* Drop Insertion Line */}
                        {isDragOver && dragOverPosition === "left" && (
                          <div className="absolute -left-1.5 top-1 bottom-1 w-1 bg-[#4472C4] rounded-full z-30 shadow-sm animate-pulse" />
                        )}
                        {isDragOver && dragOverPosition === "right" && (
                          <div className="absolute -right-1.5 top-1 bottom-1 w-1 bg-[#4472C4] rounded-full z-30 shadow-sm animate-pulse" />
                        )}

                        {/* Universal Transit Route Icon on ALL tabs */}
                        <Route
                          className={`h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-105 ${
                            isActive ? "text-white stroke-[2.4]" : "text-[#4472C4] stroke-[2.2]"
                          }`}
                        />

                        {/* Route Name or Inline Edit Input */}
                        {isEditingThis ? (
                          <input
                            type="text"
                            autoFocus
                            value={editingFolderName}
                            onChange={(e) => setEditingFolderName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitRenameFolder()
                              if (e.key === "Escape") setEditingFolderId(null)
                            }}
                            onBlur={commitRenameFolder}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-background text-foreground font-bold text-xs px-2.5 py-0.5 rounded-full border border-[#4472C4] shadow-sm outline-none w-24 text-center ring-2 ring-[#4472C4]/20"
                          />
                        ) : (
                          <span className="text-xs sm:text-[13px] tracking-wide whitespace-nowrap">
                            {folder.name}
                          </span>
                        )}

                        {/* 3-Dots Button: Shows Rename & Delete Route options */}
                        {!isEditingThis && (
                          <div className="relative shrink-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <button
                                    type="button"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`p-1 rounded-full transition-colors cursor-pointer flex items-center justify-center ${
                                      isActive
                                        ? "text-white/80 hover:text-white hover:bg-white/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`}
                                    title="Route options"
                                  >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                  </button>
                                }
                              />
                              <DropdownMenuContent
                                align="end"
                                side="bottom"
                                sideOffset={8}
                                className="w-36 min-w-[140px] bg-popover text-popover-foreground rounded-xl shadow-xl border border-border p-1 z-50 text-left"
                              >
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    startRenameFolder(folder)
                                  }}
                                  className="px-2.5 py-1.5 text-xs font-semibold text-popover-foreground hover:bg-muted hover:text-foreground rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>Rename</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    promptDeleteFolder(folder)
                                  }}
                                  className="px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                  <span>Delete Route</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Adding Pill Button in Matching Clean Style at the End */}
                  <button
                    type="button"
                    onClick={handleAddNextRoute}
                    className="h-9 px-3.5 rounded-full border border-dashed border-border bg-card hover:border-[#4472C4] hover:bg-[#4472C4]/10 hover:text-[#4472C4] text-muted-foreground font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-all select-none cursor-pointer"
                    title="Add a new route"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span className="whitespace-nowrap">Add Route</span>
                  </button>
                </div>

                {/* Right Gradient Fade Mask */}
                {canScrollRight && (
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-20" />
                )}

                {/* Right Scroll Chevron Button */}
                {canScrollRight && (
                  <button
                    type="button"
                    onClick={handleTabScrollRight}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 z-30 h-8 w-8 rounded-full bg-card/95 hover:bg-card text-foreground hover:text-[#4472C4] shadow-md border border-border flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                    title="Scroll right"
                  >
                    <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* TRIPLE COLUMNS CONTAINER: SIDE-BY-SIDE UP LIST, DOWN LIST & OTHERS */}
          {companyFolders.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center space-y-3">
              <FolderPlus className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <h3 className="text-base font-bold text-foreground">No Routes Created Yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Create your first route to start organizing audio stops and announcements for {activeCompany.companyName}.
              </p>
              <Button
                type="button"
                onClick={handleAddNextRoute}
                className="bg-[#4472C4] hover:bg-[#3862b5] text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Create Route 1</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pt-1">
            {/* =================================================================
                LEFT COLUMN: UP LIST (WITH PLAY/PAUSE, DURATION LINE & DRAG & DROP)
                ================================================================= */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverList("Up")
              }}
              onDragLeave={() => setDragOverList(null)}
              onDrop={(e) => handleDrop(e, "Up", filteredUpList.length)}
              className={`bg-card border transition-colors rounded-2xl shadow-sm p-4 flex flex-col justify-between space-y-4 ${
                dragOverList === "Up" ? "border-emerald-500 bg-emerald-500/10" : "border-border/80"
              }`}
            >
              <div className="space-y-3">
                {/* Up Column Header Bar */}
                <div className="flex items-center justify-between gap-2 pb-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-foreground tracking-tight">Up</h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/80">
                      {filteredUpList.length} Tracks
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Search Input inside Up */}
                    <div className="relative w-28 sm:w-36">
                      <input
                        type="text"
                        placeholder="Search"
                        value={upSearch}
                        onChange={(e) => setUpSearch(e.target.value)}
                        className="w-full bg-muted/40 border border-border/80 rounded-full py-1 pl-3 pr-7 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#4472C4]"
                      />
                      <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                    </div>

                    {/* Select All Checkbox */}
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isAllUpSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = selectedUpIds.length > 0 && !isAllUpSelected
                        }}
                        onChange={toggleSelectAllUp}
                        className="h-3.5 w-3.5 rounded border-border bg-background cursor-pointer accent-[#4472C4]"
                      />
                      <span>Select All{selectedUpIds.length > 0 ? ` (${selectedUpIds.length})` : ""}</span>
                    </label>

                    {/* + Audio Button (Opens Image 2 Voice Generator Popout for Up) */}
                    <button
                      type="button"
                      onClick={() => {
                        setVoiceModalListType("Up")
                        setIsVoiceModalOpen(true)
                      }}
                      className="bg-foreground hover:bg-foreground/90 text-background font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Audio</span>
                    </button>
                  </div>
                </div>

                {/* Up List Items Rows with Drag-and-Drop & Play/Pause & Duration Line */}
                <div className="border border-border/80 rounded-xl overflow-hidden divide-y divide-border/50 bg-card min-h-[380px]">
                  {filteredUpList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground text-xs">
                      Drag audio stops here or click "+ Audio" to generate.
                    </div>
                  ) : (
                    filteredUpList.map((item, idx) => {
                      const isPlayingThis = playingTrackId === item.id
                      const isDraggingThis = draggedItem?.item.id === item.id

                      return (
                        <div
                          key={item.id}
                          id={`track-item-${item.id}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item, "Up", idx)}
                          onDragOver={(e) => handleDragOver(e, "Up", idx)}
                          onDrop={(e) => handleDrop(e, "Up", idx)}
                          onDragEnd={() => { setDraggedItem(null); setDragOverList(null); setDragOverIndex(null) }}
                          className={`flex items-center justify-between px-3 py-2.5 transition-all group ${
                            isDraggingThis
                              ? "opacity-30 border-dashed border-emerald-500 bg-emerald-500/10"
                              : dragOverList === "Up" && dragOverIndex === idx
                              ? "border-t-2 border-t-emerald-500 bg-emerald-500/10"
                              : selectedUpIds.includes(item.id)
                              ? "bg-[#4472C4]/8 dark:bg-[#4472C4]/15 border-l-2 border-l-[#4472C4]"
                              : "hover:bg-muted/40"
                          }`}
                        >
                          {/* Left: Drag Handle, Checkbox, Number, Stop Name */}
                          <div className="flex items-center gap-2 min-w-0">
                            <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground cursor-grab shrink-0" />
                            <input
                              type="checkbox"
                              checked={selectedUpIds.includes(item.id)}
                              onChange={(e) => {
                                e.stopPropagation()
                                toggleSelectUpTrack(item.id)
                              }}
                              className="h-3.5 w-3.5 rounded border-border bg-background cursor-pointer shrink-0 accent-[#4472C4]"
                              title={selectedUpIds.includes(item.id) ? "Deselect stop" : "Select stop"}
                            />
                            <span className="text-xs font-bold text-muted-foreground/60 w-4 shrink-0">{idx + 1}</span>
                            <span className={`text-xs font-semibold transition-colors truncate max-w-[130px] sm:max-w-[190px] ${
                              selectedUpIds.includes(item.id)
                                ? "text-[#4472C4] font-bold"
                                : "text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                            }`}>
                              {item.stopName}
                            </span>
                          </div>

                          {/* Center/Right: Play/Pause Button, Duration Line, Download & Delete */}
                          <div className="flex items-center gap-3 shrink-0">
                            {/* Mini Interactive Audio Capsule Player - Fixed Width so button never shifts */}
                            <div
                              className={`w-[166px] h-[30px] flex items-center justify-between px-2 rounded-full border transition-colors shrink-0 select-none shadow-2xs ${
                                (isPlayingThis && isAudioSoundEmitting) || loadingTrackId === item.id
                                  ? "border-[#4472C4]/70 bg-[#4472C4]/15 ring-1 ring-[#4472C4]/25 shadow-xs"
                                  : "border-border/80 bg-muted/40 hover:bg-muted/70 hover:border-border hover:shadow-xs"
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Play / Pause Circular Button - Constant Size & Fixed Left Position */}
                              <button
                                type="button"
                                onClick={() => toggleRowPlay(item.id, item.scriptText, item.stopName)}
                                className={`h-5 w-5 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 active:scale-95 ${
                                  isPlayingThis && isAudioSoundEmitting
                                    ? "bg-[#4472C4] text-white shadow-xs"
                                    : loadingTrackId === item.id
                                    ? "bg-[#4472C4]/20 text-[#4472C4]"
                                    : "bg-muted hover:bg-[#4472C4] text-muted-foreground hover:text-white"
                                }`}
                                title={loadingTrackId === item.id ? "Loading audio..." : isPlayingThis && isAudioSoundEmitting ? "Pause audio" : "Play audio preview"}
                              >
                                {loadingTrackId === item.id ? (
                                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                ) : isPlayingThis && isAudioSoundEmitting ? (
                                  <Pause className="h-2.5 w-2.5 fill-current" />
                                ) : (
                                  <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                                )}
                              </button>

                              {/* Interactive Progress Track with Scrubbing - Flexible Width */}
                              <div
                                onClick={(e) => handleSeek(e, item.id)}
                                className="flex-1 min-w-[44px] mx-2 bg-muted hover:bg-muted/80 h-1.5 hover:h-2 rounded-full cursor-pointer relative group/track transition-all overflow-hidden"
                                title={isPlayingThis ? "Click to seek position" : "Click play to scrub"}
                              >
                                <div
                                  className={`h-full rounded-full ${
                                    isPlayingThis
                                      ? "bg-gradient-to-r from-[#4472C4] to-[#60a5fa]"
                                      : "bg-muted-foreground/30 transition-all duration-300 ease-out"
                                  }`}
                                  style={{ width: isPlayingThis ? `${playbackProgress}%` : "0%" }}
                                />
                              </div>

                              {/* Right Group: Equalizer Animation + Clock Display */}
                              <div className="flex items-center gap-1 shrink-0">
                                {/* Animated Sound Wave Equalizer Bars when Playing */}
                                {isPlayingThis && isAudioSoundEmitting && (
                                  <div className="flex items-center gap-0.5 h-3 shrink-0 animate-in fade-in-50 zoom-in-75 duration-150" title="Audio playing">
                                    <span className="w-0.5 bg-[#4472C4] rounded-full animate-bounce [animation-duration:550ms] h-2.5" />
                                    <span className="w-0.5 bg-[#4472C4] rounded-full animate-bounce [animation-duration:400ms] [animation-delay:150ms] h-3.5" />
                                    <span className="w-0.5 bg-[#4472C4] rounded-full animate-bounce [animation-duration:650ms] [animation-delay:300ms] h-2" />
                                  </div>
                                )}

                                {/* Digital Clock Display */}
                                <span
                                  className={`text-[10px] sm:text-[11px] font-mono font-bold select-none shrink-0 tracking-tight w-8 text-right ${
                                    isPlayingThis && isAudioSoundEmitting ? "text-[#4472C4]" : "text-muted-foreground"
                                  }`}
                                >
                                  {isPlayingThis && isAudioSoundEmitting
                                    ? formatAudioTime(playbackCurrentTime)
                                    : "00:04"}
                                </span>
                              </div>
                            </div>

                            {/* Green Circle Download Icon */}
                            <button
                              type="button"
                              onClick={() => handleDownloadSingleTrack(item, idx)}
                              disabled={downloadingTrackId === item.id}
                              className="text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer p-0.5 disabled:opacity-50"
                              title="Download Single MP3"
                            >
                              {downloadingTrackId === item.id
                                ? <Loader2 className="h-5 w-5 animate-spin" />
                                : <CircleArrowDown className="h-5 w-5 stroke-[1.8]" />}
                            </button>

                            {/* Red Trash Delete Icon (shows confirmation banner) */}
                            <button
                              type="button"
                              onClick={() => promptDeleteTrack(item.id, item.stopName, "Up")}
                              className="text-rose-400 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                              title="Delete Stop Audio"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Up Column Bottom Bar: Play All (Left) & Download/Share Icon Buttons (Right) */}
              <div className="flex items-center justify-between gap-2 pt-2">
                {/* Left: Play All / Stop Button */}
                <button
                  type="button"
                  onClick={() => {
                    const listToPlay = selectedUpIds.length > 0
                      ? filteredUpList.filter((t) => selectedUpIds.includes(t.id))
                      : filteredUpList
                    handleTogglePlayAll("Up", listToPlay)
                  }}
                  disabled={filteredUpList.length === 0}
                  className={`font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                    playingListType === "Up"
                      ? "bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400/40 animate-pulse"
                      : "bg-[#4472C4] hover:bg-[#3862b5] disabled:opacity-50 text-white"
                  }`}
                  title={
                    playingListType === "Up"
                      ? "Stop continuous playback"
                      : selectedUpIds.length > 0
                      ? `Play ${selectedUpIds.length} selected stops one by one`
                      : "Play all Up audio tracks one by one"
                  }
                >
                  {playingListType === "Up" ? (
                    <>
                      <Square className="h-3 w-3 fill-current" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                      <span>{selectedUpIds.length > 0 ? `Play (${selectedUpIds.length})` : "Play All"}</span>
                    </>
                  )}
                </button>

                {/* Right: Download & Share Icon Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Bulk Delete Icon Button (appears when items are selected) */}
                  {selectedUpIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setItemPendingDelete({
                          id: "bulk-up",
                          name: `${selectedUpIds.length} Selected Stops`,
                          listType: "Up",
                          ids: selectedUpIds,
                        })
                      }
                      className="h-8 w-8 rounded-lg flex items-center justify-center bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-500/30 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                      title={`Delete ${selectedUpIds.length} Selected Stops`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  {/* 1. Download Icon Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const itemsToDownload = selectedUpIds.length > 0
                        ? filteredUpList.filter((t) => selectedUpIds.includes(t.id))
                        : filteredUpList
                      handleDownloadListZip("Up", itemsToDownload)
                    }}
                    disabled={isZipping || filteredUpList.length === 0}
                    className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#548235]/10 hover:bg-[#548235] text-[#548235] hover:text-white border border-[#548235]/30 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    title={
                      selectedUpIds.length > 0
                        ? `Download ${selectedUpIds.length} Selected Stops in ZIP`
                        : "Download Up in Zip"
                    }
                  >
                    {isZipping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CircleArrowDown className="h-4 w-4" />
                    )}
                  </button>

                  {/* 2. Share Icon Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const itemsToShare = selectedUpIds.length > 0
                        ? filteredUpList.filter((t) => selectedUpIds.includes(t.id))
                        : filteredUpList
                      setShareModalTitle(
                        `${activeCompany.companyName} - ${activeFolder.name} (Up List${
                          selectedUpIds.length > 0 ? ` - ${selectedUpIds.length} stops` : ""
                        })`
                      )
                      setSharePayload({
                        folderName: `${activeFolder.name} (Up List)`,
                        up: itemsToShare,
                        down: [],
                        other: [],
                      })
                      setIsShareModalOpen(true)
                    }}
                    disabled={filteredUpList.length === 0}
                    className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#4472C4]/10 hover:bg-[#4472C4] text-[#4472C4] hover:text-white border border-[#4472C4]/30 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    title={
                      selectedUpIds.length > 0
                        ? `Share ${selectedUpIds.length} Selected Stops (6h)`
                        : "Share Up (6h)"
                    }
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* =================================================================
                RIGHT COLUMN: DOWN LIST (WITH PLAY/PAUSE, DURATION LINE & DRAG & DROP)
                ================================================================= */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverList("Down")
              }}
              onDragLeave={() => setDragOverList(null)}
              onDrop={(e) => handleDrop(e, "Down", filteredDownList.length)}
              className={`bg-card border transition-colors rounded-2xl shadow-sm p-4 flex flex-col justify-between space-y-4 ${
                dragOverList === "Down" ? "border-emerald-500 bg-emerald-500/10" : "border-border/80"
              }`}
            >
              <div className="space-y-3">
                {/* Down Column Header Bar */}
                <div className="flex items-center justify-between gap-2 pb-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-foreground tracking-tight">Down</h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/80">
                      {filteredDownList.length} Tracks
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Search Input inside Down */}
                    <div className="relative w-28 sm:w-36">
                      <input
                        type="text"
                        placeholder="Search"
                        value={downSearch}
                        onChange={(e) => setDownSearch(e.target.value)}
                        className="w-full bg-muted/40 border border-border/80 rounded-full py-1 pl-3 pr-7 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#4472C4]"
                      />
                      <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                    </div>

                    {/* Select All Checkbox */}
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isAllDownSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = selectedDownIds.length > 0 && !isAllDownSelected
                        }}
                        onChange={toggleSelectAllDown}
                        className="h-3.5 w-3.5 rounded border-border bg-background cursor-pointer accent-[#4472C4]"
                      />
                      <span>Select All{selectedDownIds.length > 0 ? ` (${selectedDownIds.length})` : ""}</span>
                    </label>

                    {/* + Audio Button (Opens Image 2 Voice Generator Popout for Down) */}
                    <button
                      type="button"
                      onClick={() => {
                        setVoiceModalListType("Down")
                        setIsVoiceModalOpen(true)
                      }}
                      className="bg-foreground hover:bg-foreground/90 text-background font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Audio</span>
                    </button>
                  </div>
                </div>

                {/* Down List Items Rows with Drag-and-Drop & Play/Pause & Duration Line */}
                <div className="border border-border/80 rounded-xl overflow-hidden divide-y divide-border/50 bg-card min-h-[380px]">
                  {filteredDownList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground text-xs">
                      Drag audio stops here or click "+ Audio" to generate.
                    </div>
                  ) : (
                    filteredDownList.map((item, idx) => {
                      const isPlayingThis = playingTrackId === item.id
                      const isDraggingThis = draggedItem?.item.id === item.id

                      return (
                        <div
                          key={item.id}
                          id={`track-item-${item.id}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item, "Down", idx)}
                          onDragOver={(e) => handleDragOver(e, "Down", idx)}
                          onDrop={(e) => handleDrop(e, "Down", idx)}
                          onDragEnd={() => { setDraggedItem(null); setDragOverList(null); setDragOverIndex(null) }}
                          className={`flex items-center justify-between px-3 py-2.5 transition-all group ${
                            isDraggingThis
                              ? "opacity-30 border-dashed border-emerald-500 bg-emerald-500/10"
                              : dragOverList === "Down" && dragOverIndex === idx
                              ? "border-t-2 border-t-emerald-500 bg-emerald-500/10"
                              : selectedDownIds.includes(item.id)
                              ? "bg-[#4472C4]/8 dark:bg-[#4472C4]/15 border-l-2 border-l-[#4472C4]"
                              : "hover:bg-muted/40"
                          }`}
                        >
                          {/* Left: Drag Handle, Checkbox, Number, Stop Name */}
                          <div className="flex items-center gap-2 min-w-0">
                            <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground cursor-grab shrink-0" />
                            <input
                              type="checkbox"
                              checked={selectedDownIds.includes(item.id)}
                              onChange={(e) => {
                                e.stopPropagation()
                                toggleSelectDownTrack(item.id)
                              }}
                              className="h-3.5 w-3.5 rounded border-border bg-background cursor-pointer shrink-0 accent-[#4472C4]"
                              title={selectedDownIds.includes(item.id) ? "Deselect stop" : "Select stop"}
                            />
                            <span className="text-xs font-bold text-muted-foreground/60 w-4 shrink-0">{idx + 1}</span>
                            <span className={`text-xs font-semibold transition-colors truncate max-w-[130px] sm:max-w-[190px] ${
                              selectedDownIds.includes(item.id)
                                ? "text-[#4472C4] font-bold"
                                : "text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                            }`}>
                              {item.stopName}
                            </span>
                          </div>

                          {/* Center/Right: Play/Pause Button, Duration Line, Download & Delete */}
                          <div className="flex items-center gap-3 shrink-0">
                            {/* Mini Interactive Audio Capsule Player - Fixed Width so button never shifts */}
                            <div
                              className={`w-[166px] h-[30px] flex items-center justify-between px-2 rounded-full border transition-colors shrink-0 select-none shadow-2xs ${
                                (isPlayingThis && isAudioSoundEmitting) || loadingTrackId === item.id
                                  ? "border-[#4472C4]/70 bg-[#4472C4]/15 ring-1 ring-[#4472C4]/25 shadow-xs"
                                  : "border-border/80 bg-muted/40 hover:bg-muted/70 hover:border-border hover:shadow-xs"
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Play / Pause Circular Button - Constant Size & Fixed Left Position */}
                              <button
                                type="button"
                                onClick={() => toggleRowPlay(item.id, item.scriptText, item.stopName)}
                                className={`h-5 w-5 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 active:scale-95 ${
                                  isPlayingThis && isAudioSoundEmitting
                                    ? "bg-[#4472C4] text-white shadow-xs"
                                    : loadingTrackId === item.id
                                    ? "bg-[#4472C4]/20 text-[#4472C4]"
                                    : "bg-muted hover:bg-[#4472C4] text-muted-foreground hover:text-white"
                                }`}
                                title={loadingTrackId === item.id ? "Loading audio..." : isPlayingThis && isAudioSoundEmitting ? "Pause audio" : "Play audio preview"}
                              >
                                {loadingTrackId === item.id ? (
                                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                ) : isPlayingThis && isAudioSoundEmitting ? (
                                  <Pause className="h-2.5 w-2.5 fill-current" />
                                ) : (
                                  <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                                )}
                              </button>

                              {/* Interactive Progress Track with Scrubbing - Flexible Width */}
                              <div
                                onClick={(e) => handleSeek(e, item.id)}
                                className="flex-1 min-w-[44px] mx-2 bg-muted hover:bg-muted/80 h-1.5 hover:h-2 rounded-full cursor-pointer relative group/track transition-all overflow-hidden"
                                title={isPlayingThis ? "Click to seek position" : "Click play to scrub"}
                              >
                                <div
                                  className={`h-full rounded-full ${
                                    isPlayingThis
                                      ? "bg-gradient-to-r from-[#4472C4] to-[#60a5fa]"
                                      : "bg-muted-foreground/30 transition-all duration-300 ease-out"
                                  }`}
                                  style={{ width: isPlayingThis ? `${playbackProgress}%` : "0%" }}
                                />
                              </div>

                              {/* Right Group: Equalizer Animation + Clock Display */}
                              <div className="flex items-center gap-1 shrink-0">
                                {/* Animated Sound Wave Equalizer Bars when Playing */}
                                {isPlayingThis && isAudioSoundEmitting && (
                                  <div className="flex items-center gap-0.5 h-3 shrink-0 animate-in fade-in-50 zoom-in-75 duration-150" title="Audio playing">
                                    <span className="w-0.5 bg-[#4472C4] rounded-full animate-bounce [animation-duration:550ms] h-2.5" />
                                    <span className="w-0.5 bg-[#4472C4] rounded-full animate-bounce [animation-duration:400ms] [animation-delay:150ms] h-3.5" />
                                    <span className="w-0.5 bg-[#4472C4] rounded-full animate-bounce [animation-duration:650ms] [animation-delay:300ms] h-2" />
                                  </div>
                                )}

                                {/* Digital Clock Display */}
                                <span
                                  className={`text-[10px] sm:text-[11px] font-mono font-bold select-none shrink-0 tracking-tight w-8 text-right ${
                                    isPlayingThis && isAudioSoundEmitting ? "text-[#4472C4]" : "text-muted-foreground"
                                  }`}
                                >
                                  {isPlayingThis && isAudioSoundEmitting
                                    ? formatAudioTime(playbackCurrentTime)
                                    : "00:04"}
                                </span>
                              </div>
                            </div>

                            {/* Green Circle Download Icon */}
                            <button
                              type="button"
                              onClick={() => handleDownloadSingleTrack(item, idx)}
                              disabled={downloadingTrackId === item.id}
                              className="text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer p-0.5 disabled:opacity-50"
                              title="Download Single MP3"
                            >
                              {downloadingTrackId === item.id
                                ? <Loader2 className="h-5 w-5 animate-spin" />
                                : <CircleArrowDown className="h-5 w-5 stroke-[1.8]" />}
                            </button>

                            {/* Red Trash Delete Icon (shows confirmation banner) */}
                            <button
                              type="button"
                              onClick={() => promptDeleteTrack(item.id, item.stopName, "Down")}
                              className="text-rose-400 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                              title="Delete Stop Audio"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Down Column Bottom Bar: Play All (Left) & Download/Share Icon Buttons (Right) */}
              <div className="flex items-center justify-between gap-2 pt-2">
                {/* Left: Play All / Stop Button */}
                <button
                  type="button"
                  onClick={() => {
                    const listToPlay = selectedDownIds.length > 0
                      ? filteredDownList.filter((t) => selectedDownIds.includes(t.id))
                      : filteredDownList
                    handleTogglePlayAll("Down", listToPlay)
                  }}
                  disabled={filteredDownList.length === 0}
                  className={`font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                    playingListType === "Down"
                      ? "bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400/40 animate-pulse"
                      : "bg-[#4472C4] hover:bg-[#3862b5] disabled:opacity-50 text-white"
                  }`}
                  title={
                    playingListType === "Down"
                      ? "Stop continuous playback"
                      : selectedDownIds.length > 0
                      ? `Play ${selectedDownIds.length} selected stops one by one`
                      : "Play all Down audio tracks one by one"
                  }
                >
                  {playingListType === "Down" ? (
                    <>
                      <Square className="h-3 w-3 fill-current" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                      <span>{selectedDownIds.length > 0 ? `Play (${selectedDownIds.length})` : "Play All"}</span>
                    </>
                  )}
                </button>

                {/* Right: Download & Share Icon Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Bulk Delete Icon Button (appears when items are selected) */}
                  {selectedDownIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setItemPendingDelete({
                          id: "bulk-down",
                          name: `${selectedDownIds.length} Selected Stops`,
                          listType: "Down",
                          ids: selectedDownIds,
                        })
                      }
                      className="h-8 w-8 rounded-lg flex items-center justify-center bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-500/30 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                      title={`Delete ${selectedDownIds.length} Selected Stops`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  {/* 1. Download Icon Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const itemsToDownload = selectedDownIds.length > 0
                        ? filteredDownList.filter((t) => selectedDownIds.includes(t.id))
                        : filteredDownList
                      handleDownloadListZip("Down", itemsToDownload)
                    }}
                    disabled={isZipping || filteredDownList.length === 0}
                    className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#548235]/10 hover:bg-[#548235] text-[#548235] hover:text-white border border-[#548235]/30 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    title={
                      selectedDownIds.length > 0
                        ? `Download ${selectedDownIds.length} Selected Stops in ZIP`
                        : "Download Down in Zip"
                    }
                  >
                    {isZipping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CircleArrowDown className="h-4 w-4" />
                    )}
                  </button>

                  {/* 2. Share Icon Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const itemsToShare = selectedDownIds.length > 0
                        ? filteredDownList.filter((t) => selectedDownIds.includes(t.id))
                        : filteredDownList
                      setShareModalTitle(
                        `${activeCompany.companyName} - ${activeFolder.name} (Down List${
                          selectedDownIds.length > 0 ? ` - ${selectedDownIds.length} stops` : ""
                        })`
                      )
                      setSharePayload({
                        folderName: `${activeFolder.name} (Down List)`,
                        up: [],
                        down: itemsToShare,
                        other: [],
                      })
                      setIsShareModalOpen(true)
                    }}
                    disabled={filteredDownList.length === 0}
                    className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#4472C4]/10 hover:bg-[#4472C4] text-[#4472C4] hover:text-white border border-[#4472C4]/30 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    title={
                      selectedDownIds.length > 0
                        ? `Share ${selectedDownIds.length} Selected Stops (6h)`
                        : "Share Down (6h)"
                    }
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* =================================================================
                THIRD COLUMN: OTHERS (FOR OTHER ANNOUNCEMENTS & VOICE ASSETS)
                ================================================================= */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverList("Others")
              }}
              onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget as Node)) return
                setDragOverList(null)
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDrop(e, "Others", filteredOtherList.length)
              }}
              className={`bg-card border transition-colors rounded-2xl shadow-sm p-4 flex flex-col justify-between space-y-4 ${
                dragOverList === "Others" ? "border-emerald-500 bg-emerald-500/10" : "border-border/80"
              }`}
            >
              <div className="space-y-3">
                {/* Others Column Header Bar */}
                <div className="flex items-center justify-between gap-2 pb-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-foreground tracking-tight">Others</h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/80">
                      {filteredOtherList.length} Tracks
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Search Input inside Others */}
                    <div className="relative w-28 sm:w-36">
                      <input
                        type="text"
                        placeholder="Search"
                        value={otherSearch}
                        onChange={(e) => setOtherSearch(e.target.value)}
                        className="w-full bg-muted/40 border border-border/80 rounded-full py-1 pl-3 pr-7 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#4472C4]"
                      />
                      <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                    </div>

                    {/* Select All Checkbox */}
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isAllOtherSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = selectedOtherIds.length > 0 && !isAllOtherSelected
                        }}
                        onChange={toggleSelectAllOther}
                        className="h-3.5 w-3.5 rounded border-border bg-background cursor-pointer accent-[#4472C4]"
                      />
                      <span>Select All{selectedOtherIds.length > 0 ? ` (${selectedOtherIds.length})` : ""}</span>
                    </label>

                    {/* + Audio Button (Opens Image 2 Voice Generator Popout for Others) */}
                    <button
                      type="button"
                      onClick={() => {
                        setVoiceModalListType("Others")
                        setIsVoiceModalOpen(true)
                      }}
                      className="bg-foreground hover:bg-foreground/90 text-background font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Audio</span>
                    </button>
                  </div>
                </div>

                {/* Others List Items Rows with Drag-and-Drop & Play/Pause & Duration Line */}
                <div className="border border-border/80 rounded-xl overflow-hidden divide-y divide-border/50 bg-card min-h-[380px]">
                  {filteredOtherList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground text-xs">
                      Drag audio stops here or click "+ Audio" to generate.
                    </div>
                  ) : (
                    filteredOtherList.map((item, idx) => {
                      const isPlayingThis = playingTrackId === item.id
                      const isDraggingThis = draggedItem?.item.id === item.id

                      return (
                        <div
                          key={item.id}
                          id={`track-item-${item.id}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item, "Others", idx)}
                          onDragOver={(e) => handleDragOver(e, "Others", idx)}
                          onDrop={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDrop(e, "Others", idx)
                          }}
                          onDragEnd={() => {
                            setDraggedItem(null)
                            setDragOverList(null)
                            setDragOverIndex(null)
                          }}
                          className={`flex items-center justify-between px-3 py-2.5 transition-all group ${
                            isDraggingThis
                              ? "opacity-30 border-dashed border-emerald-500 bg-emerald-500/10"
                              : dragOverList === "Others" && dragOverIndex === idx
                              ? "border-t-2 border-t-emerald-500 bg-emerald-500/10"
                              : selectedOtherIds.includes(item.id)
                              ? "bg-[#4472C4]/8 dark:bg-[#4472C4]/15 border-l-2 border-l-[#4472C4]"
                              : "hover:bg-muted/40"
                          }`}
                        >
                          {/* Left: Drag Handle, Checkbox, Number, Stop/Announcement Name */}
                          <div className="flex items-center gap-2 min-w-0">
                            <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground cursor-grab shrink-0" />
                            <input
                              type="checkbox"
                              checked={selectedOtherIds.includes(item.id)}
                              onChange={(e) => {
                                e.stopPropagation()
                                toggleSelectOtherTrack(item.id)
                              }}
                              className="h-3.5 w-3.5 rounded border-border bg-background cursor-pointer shrink-0 accent-[#4472C4]"
                              title={selectedOtherIds.includes(item.id) ? "Deselect stop" : "Select stop"}
                            />
                            <span className="text-xs font-bold text-muted-foreground/60 w-4 shrink-0">{idx + 1}</span>
                            <span className={`text-xs font-semibold transition-colors truncate max-w-[130px] sm:max-w-[190px] ${
                              selectedOtherIds.includes(item.id)
                                ? "text-[#4472C4] font-bold"
                                : "text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                            }`}>
                              {item.stopName}
                            </span>
                          </div>

                          {/* Center/Right: Play/Pause Button, Duration Line, Download & Delete */}
                          <div className="flex items-center gap-3 shrink-0">
                            {/* Mini Interactive Audio Capsule Player - Fixed Width so button never shifts */}
                            <div
                              className={`w-[166px] h-[30px] flex items-center justify-between px-2 rounded-full border transition-colors shrink-0 select-none shadow-2xs ${
                                (isPlayingThis && isAudioSoundEmitting) || loadingTrackId === item.id
                                  ? "border-[#4472C4]/70 bg-[#4472C4]/15 ring-1 ring-[#4472C4]/25 shadow-xs"
                                  : "border-border/80 bg-muted/40 hover:bg-muted/70 hover:border-border hover:shadow-xs"
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Play / Pause Circular Button - Constant Size & Fixed Left Position */}
                              <button
                                type="button"
                                onClick={() => toggleRowPlay(item.id, item.scriptText, item.stopName)}
                                className={`h-5 w-5 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 active:scale-95 ${
                                  isPlayingThis && isAudioSoundEmitting
                                    ? "bg-[#4472C4] text-white shadow-xs"
                                    : loadingTrackId === item.id
                                    ? "bg-[#4472C4]/20 text-[#4472C4]"
                                    : "bg-muted hover:bg-[#4472C4] text-muted-foreground hover:text-white"
                                }`}
                                title={loadingTrackId === item.id ? "Loading audio..." : isPlayingThis && isAudioSoundEmitting ? "Pause audio" : "Play audio preview"}
                              >
                                {loadingTrackId === item.id ? (
                                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                ) : isPlayingThis && isAudioSoundEmitting ? (
                                  <Pause className="h-2.5 w-2.5 fill-current" />
                                ) : (
                                  <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                                )}
                              </button>

                              {/* Interactive Progress Track with Scrubbing - Flexible Width */}
                              <div
                                onClick={(e) => handleSeek(e, item.id)}
                                className="flex-1 min-w-[44px] mx-2 bg-muted hover:bg-muted/80 h-1.5 hover:h-2 rounded-full cursor-pointer relative group/track transition-all overflow-hidden"
                                title={isPlayingThis ? "Click to seek position" : "Click play to scrub"}
                              >
                                <div
                                  className={`h-full rounded-full ${
                                    isPlayingThis
                                      ? "bg-gradient-to-r from-[#4472C4] to-[#60a5fa]"
                                      : "bg-muted-foreground/30 transition-all duration-300 ease-out"
                                  }`}
                                  style={{ width: isPlayingThis ? `${playbackProgress}%` : "0%" }}
                                />
                              </div>

                              {/* Right Group: Equalizer Animation + Clock Display */}
                              <div className="flex items-center gap-1 shrink-0">
                                {/* Animated Sound Wave Equalizer Bars when Playing */}
                                {isPlayingThis && isAudioSoundEmitting && (
                                  <div className="flex items-center gap-0.5 h-3 shrink-0 animate-in fade-in-50 zoom-in-75 duration-150" title="Audio playing">
                                    <span className="w-0.5 bg-[#4472C4] rounded-full animate-bounce [animation-duration:550ms] h-2.5" />
                                    <span className="w-0.5 bg-[#4472C4] rounded-full animate-bounce [animation-duration:400ms] [animation-delay:150ms] h-3.5" />
                                    <span className="w-0.5 bg-[#4472C4] rounded-full animate-bounce [animation-duration:650ms] [animation-delay:300ms] h-2" />
                                  </div>
                                )}

                                {/* Digital Clock Display */}
                                <span
                                  className={`text-[10px] sm:text-[11px] font-mono font-bold select-none shrink-0 tracking-tight w-8 text-right ${
                                    isPlayingThis && isAudioSoundEmitting ? "text-[#4472C4]" : "text-muted-foreground"
                                  }`}
                                >
                                  {isPlayingThis && isAudioSoundEmitting
                                    ? formatAudioTime(playbackCurrentTime)
                                    : "00:04"}
                                </span>
                              </div>
                            </div>

                            {/* Green Circle Download Icon */}
                            <button
                              type="button"
                              onClick={() => handleDownloadSingleTrack(item, idx)}
                              disabled={downloadingTrackId === item.id}
                              className="text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer p-0.5 disabled:opacity-50"
                              title="Download Single MP3"
                            >
                              {downloadingTrackId === item.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <CircleArrowDown className="h-5 w-5 stroke-[1.8]" />
                              )}
                            </button>

                            {/* Red Trash Delete Icon (shows confirmation banner) */}
                            <button
                              type="button"
                              onClick={() => promptDeleteTrack(item.id, item.stopName, "Others")}
                              className="text-rose-400 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                              title="Delete Stop Audio"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Others Column Bottom Bar: Play All (Left) & Download/Share Icon Buttons (Right) */}
              <div className="flex items-center justify-between gap-2 pt-2">
                {/* Left: Play All / Stop Button */}
                <button
                  type="button"
                  onClick={() => {
                    const listToPlay = selectedOtherIds.length > 0
                      ? filteredOtherList.filter((t) => selectedOtherIds.includes(t.id))
                      : filteredOtherList
                    handleTogglePlayAll("Others", listToPlay)
                  }}
                  disabled={filteredOtherList.length === 0}
                  className={`font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                    playingListType === "Others"
                      ? "bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400/40 animate-pulse"
                      : "bg-[#4472C4] hover:bg-[#3862b5] disabled:opacity-50 text-white"
                  }`}
                  title={
                    playingListType === "Others"
                      ? "Stop continuous playback"
                      : selectedOtherIds.length > 0
                      ? `Play ${selectedOtherIds.length} selected stops one by one`
                      : "Play all Others audio tracks one by one"
                  }
                >
                  {playingListType === "Others" ? (
                    <>
                      <Square className="h-3 w-3 fill-current" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                      <span>{selectedOtherIds.length > 0 ? `Play (${selectedOtherIds.length})` : "Play All"}</span>
                    </>
                  )}
                </button>

                {/* Right: Download & Share Icon Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Bulk Delete Icon Button (appears when items are selected) */}
                  {selectedOtherIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setItemPendingDelete({
                          id: "bulk-other",
                          name: `${selectedOtherIds.length} Selected Stops`,
                          listType: "Others",
                          ids: selectedOtherIds,
                        })
                      }
                      className="h-8 w-8 rounded-lg flex items-center justify-center bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-500/30 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                      title={`Delete ${selectedOtherIds.length} Selected Stops`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  {/* 1. Download Icon Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const itemsToDownload = selectedOtherIds.length > 0
                        ? filteredOtherList.filter((t) => selectedOtherIds.includes(t.id))
                        : filteredOtherList
                      handleDownloadListZip("Others", itemsToDownload)
                    }}
                    disabled={isZipping || filteredOtherList.length === 0}
                    className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#548235]/10 hover:bg-[#548235] text-[#548235] hover:text-white border border-[#548235]/30 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    title={
                      selectedOtherIds.length > 0
                        ? `Download ${selectedOtherIds.length} Selected Stops in ZIP`
                        : "Download Others in Zip"
                    }
                  >
                    {isZipping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CircleArrowDown className="h-4 w-4" />
                    )}
                  </button>

                  {/* 2. Share Icon Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const itemsToShare = selectedOtherIds.length > 0
                        ? filteredOtherList.filter((t) => selectedOtherIds.includes(t.id))
                        : filteredOtherList
                      setShareModalTitle(
                        `${activeCompany.companyName} - ${activeFolder.name} (Others List${
                          selectedOtherIds.length > 0 ? ` - ${selectedOtherIds.length} stops` : ""
                        })`
                      )
                      setSharePayload({
                        folderName: `${activeFolder.name} (Others List)`,
                        up: [],
                        down: [],
                        other: itemsToShare,
                      })
                      setIsShareModalOpen(true)
                    }}
                    disabled={filteredOtherList.length === 0}
                    className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#4472C4]/10 hover:bg-[#4472C4] text-[#4472C4] hover:text-white border border-[#4472C4]/30 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    title={
                      selectedOtherIds.length > 0
                        ? `Share ${selectedOtherIds.length} Selected Stops (6h)`
                        : "Share Others (6h)"
                    }
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              ACTIVE ROUTE ACTION BAR (BOTTOM OF EACH ROUTE PAGE)
              Fulfills Requirement 4: Downloads and shares this selected Route's all 3 lists
              ========================================================================= */}
          {activeFolder && (
            <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#4472C4] to-[#315ea8] text-white flex items-center justify-center shadow-md shadow-[#4472C4]/20 shrink-0">
                  <Route className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-foreground tracking-tight">{activeFolder.name}</h3>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#4472C4]/10 text-[#4472C4] border border-[#4472C4]/20">
                      Selected Route
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {filteredUpList.length + filteredDownList.length + filteredOtherList.length} total audio tracks across Up ({filteredUpList.length}), Down ({filteredDownList.length}), and Others ({filteredOtherList.length}) lists.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                {/* Download this particular selected Route's all 3 lists - Low Highlight Outline */}
                <button
                  type="button"
                  onClick={(e) => handleDownloadFolderZip(activeFolder, e)}
                  disabled={isZipping}
                  className="border border-[#548235] text-[#548235] hover:bg-[#548235]/10 dark:text-[#70ad47] dark:border-[#70ad47]/80 disabled:opacity-50 font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 active:scale-[0.98]"
                  title={`Download all 3 audio lists for ${activeFolder.name} in ZIP`}
                >
                  {isZipping ? <Loader2 className="h-4 w-4 animate-spin" /> : <CircleArrowDown className="h-4 w-4" />}
                  <span>Download {activeFolder.name} in Zip (All 3 Lists)</span>
                </button>

                {/* Share this particular selected Route for 6 Hours - Low Highlight Outline */}
                <button
                  type="button"
                  onClick={() => {
                    const rUp = upTracks.filter((t) => t.companyId === activeCompany.id && t.folderId === activeFolder.id)
                    const rDown = downTracks.filter((t) => t.companyId === activeCompany.id && t.folderId === activeFolder.id)
                    const rOther = otherTracks.filter((t) => t.companyId === activeCompany.id && t.folderId === activeFolder.id)
                    setShareModalTitle(`${activeCompany.companyName} - ${activeFolder.name} (${rUp.length + rDown.length + rOther.length} Audio Tracks)`)
                    setSharePayload({
                      folderName: activeFolder.name,
                      up: rUp,
                      down: rDown,
                      other: rOther,
                    })
                    setIsShareModalOpen(true)
                  }}
                  className="border border-[#4472C4] text-[#4472C4] hover:bg-[#4472C4]/10 dark:text-[#6ba1ff] dark:border-[#4472C4]/80 disabled:opacity-50 font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 active:scale-[0.98]"
                  title={`Share ${activeFolder.name} (all 3 lists) for 6 hours`}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share {activeFolder.name} For 6 Hours</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    ) : (
        /* =========================================================================
            LEVEL 1: COMPANY LIST VIEW (ROOT LEVEL)
            ========================================================================= */
        <div className="space-y-5">
          {/* Main Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#4472C4]/10 text-[#4472C4] shadow-xs">
                  <Music2 className="h-6 w-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#4472C4] flex items-center gap-2.5">
                  Generate Audio
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#4472C4]/10 text-[#4472C4] border border-[#4472C4]/20 normal-case">
                    AI Sound Engine
                  </span>
                </h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Manage company sites, create audio folders, and synthesize AI voice tracks.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => setIsAddCompanyOpen(true)}
              className="bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold rounded-xl h-11 px-5 shadow-sm text-sm flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98] shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Company</span>
            </Button>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 gap-3.5">
            {companyList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveCompany(item)
                    const compFolders = folders.filter((f) => f.companyId === item.id)
                    if (compFolders.length > 0) {
                      setActiveFolder(compFolders[0])
                    }
                  }}
                  className="bg-card border border-border/80 hover:border-[#4472C4]/50 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#4472C4]/10 border border-[#4472C4]/20 text-[#4472C4] group-hover:scale-105 transition-transform shrink-0">
                      <Building2 className="h-6 w-6" />
                    </div>

                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-foreground group-hover:text-[#4472C4] transition-colors">
                          {item.companyName}
                        </h3>
                        <span className="text-[10.5px] font-semibold px-2 py-0.2 rounded-full bg-[#4472C4]/10 text-[#4472C4] border border-[#4472C4]/20">
                          Company Master
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1 text-foreground/80 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-[#548235]" />
                          Site: <span className="text-foreground font-bold">{item.siteLocation}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Download All Routes Audio (green) */}
                  <div className="flex items-center gap-2.5 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                    <Button
                      type="button"
                      onClick={(e) => handleDownloadCompanyZip(item, e)}
                      disabled={isZipping}
                      className="bg-[#548235] hover:bg-[#48732e] disabled:opacity-60 text-white font-semibold rounded-xl h-9 px-4 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      {isZipping
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <CircleArrowDown className="h-3.5 w-3.5" />}
                      <span>Download All Routes Audio</span>
                    </Button>
                  </div>
                </div>
            ))}
          </div>
        </div>
      )}

      {/* Popout 1: + Add Company */}
      <AddCompanyAudioModal
        open={isAddCompanyOpen}
        onOpenChange={setIsAddCompanyOpen}
        onAddCompany={handleAddCompanySubmit}
      />

      {/* Popout 2: + New Folder inside Company */}
      <CreateAudioFolderModal
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        companyName={activeCompany?.companyName}
        siteLocation={activeCompany?.siteLocation}
        onCreateFolder={handleCreateFolderSubmit}
      />

      {/* Popout 3: Generate Voice Popout Modal (Matching Image 2 with Gujarati Dhwani) */}
      <GenerateVoiceModal
        open={isVoiceModalOpen}
        onOpenChange={setIsVoiceModalOpen}
        targetListName={voiceModalListType}
        companyName={activeCompany?.companyName}
        onAudioGenerated={handleGeneratedVoiceTrack}
      />

      {/* Popout 4: 6-Hour Share Modal */}
      <ShareAudioModal
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        shareTitle={shareModalTitle}
        companyName={activeCompany?.companyName}
        folderName={sharePayload.folderName || activeFolder?.name}
        upTracks={sharePayload.up.length > 0 ? sharePayload.up : filteredUpList}
        downTracks={sharePayload.down.length > 0 ? sharePayload.down : filteredDownList}
        otherTracks={sharePayload.other.length > 0 ? sharePayload.other : filteredOtherList}
      />

      {/* Interactive Delete Confirmation Red Banner */}
      {itemPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0">
          <div className="w-full max-w-md bg-card text-card-foreground rounded-2xl shadow-2xl border border-rose-500/30 overflow-hidden animate-in slide-in-from-bottom-4">
            {/* Red Banner Header */}
            <div className="bg-rose-600 text-white px-5 py-3.5 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-extrabold text-sm">Delete Audio Stop?</p>
                <p className="text-[11px] text-rose-200 font-medium">This action cannot be undone.</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 py-4 space-y-3">
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground font-medium mb-0.5">
                  {itemPendingDelete.ids && itemPendingDelete.ids.length > 1
                    ? `Removing ${itemPendingDelete.ids.length} audio announcements from ${itemPendingDelete.listType} list:`
                    : `Removing audio announcement from ${itemPendingDelete.listType} list:`}
                </p>
                <p className="text-sm font-extrabold text-foreground">"{itemPendingDelete.name}"</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                This will permanently remove {itemPendingDelete.ids && itemPendingDelete.ids.length > 1 ? "these audio stops" : "the audio stop"} from the <strong>{itemPendingDelete.listType}</strong> list.
                The stops can be re-added by clicking <strong>+ Audio</strong> again.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="px-5 pb-5 flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => setItemPendingDelete(null)}
                className="h-10 px-5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route Tab Delete Confirmation Modal */}
      {folderPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0">
          <div className="w-full max-w-md bg-card text-card-foreground rounded-2xl shadow-2xl border border-rose-500/30 overflow-hidden animate-in slide-in-from-bottom-4">
            {/* Red Banner Header */}
            <div className="bg-rose-600 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-extrabold text-sm">Delete Route Tab?</p>
                  <p className="text-[11px] text-rose-200 font-medium">This route and all its stops will be removed.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFolderPendingDelete(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-rose-700/50 transition-colors cursor-pointer"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4 space-y-3 text-left">
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground font-medium mb-0.5">Route to be deleted:</p>
                <p className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <Route className="h-4 w-4 text-[#4472C4]" />
                  <span>"{folderPendingDelete.name}"</span>
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Deleting this route will remove its associated Up, Down, and Others announcement lists for{" "}
                <strong>{activeCompany?.companyName}</strong>. This action cannot be reversed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="px-5 pb-5 flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => setFolderPendingDelete(null)}
                className="h-10 px-5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteFolder}
                className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Route</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
