"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface StatsContextType {
  totalDownloads: number
  incrementDownload: () => void
}

const StatsContext = createContext<StatsContextType | undefined>(undefined)

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [totalDownloads, setTotalDownloads] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("totalDownloads")
    if (saved) {
      setTotalDownloads(parseInt(saved, 10))
    }
  }, [])

  const incrementDownload = () => {
    setTotalDownloads((prev) => {
      const newCount = prev + 1
      localStorage.setItem("totalDownloads", newCount.toString())
      return newCount
    })
  }

  return (
    <StatsContext.Provider value={{ totalDownloads: mounted ? totalDownloads : 0, incrementDownload }}>
      {children}
    </StatsContext.Provider>
  )
}

export function useStats() {
  const context = useContext(StatsContext)
  if (context === undefined) {
    throw new Error("useStats must be used within a StatsProvider")
  }
  return context
}
