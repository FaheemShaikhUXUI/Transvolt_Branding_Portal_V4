"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { SidebarProvider } from "./sidebar-context"

interface AppShellProps {
  children: React.ReactNode
}

function AppShellContent({ children }: AppShellProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isEvaTool = pathname === "/eva-design-tool" || pathname?.startsWith("/eva-design-tool")
  const isOrgBuilder =
    (pathname === "/organization-chart" || pathname?.startsWith("/organization-chart") || pathname?.includes("/organization-chart")) &&
    searchParams.get("mode") === "builder"

  // For Eva Design Tool and while creating/editing Org Chart, remove portal's left sidebar, top header, and margins completely
  React.useEffect(() => {
    if (isEvaTool || isOrgBuilder) {
      const origHtmlOverflow = document.documentElement.style.overflow
      const origBodyOverflow = document.body.style.overflow
      const origGutter = document.documentElement.style.scrollbarGutter
      document.documentElement.style.overflow = "hidden"
      document.body.style.overflow = "hidden"
      document.documentElement.style.scrollbarGutter = "auto"
      return () => {
        document.documentElement.style.overflow = origHtmlOverflow
        document.body.style.overflow = origBodyOverflow
        document.documentElement.style.scrollbarGutter = origGutter
      }
    }
  }, [isEvaTool, isOrgBuilder])

  if (isEvaTool || isOrgBuilder) {
    return (
      <main className="fixed inset-0 h-screen h-[100dvh] w-screen w-[100dvw] overflow-hidden bg-background flex flex-col z-30">
        {children}
      </main>
    )
  }

  return (
    <div className="min-h-screen w-full md:grid md:grid-cols-[68px_1fr]">
      {/* Desktop Sidebar: Occupies fixed 68px slot; expands above page on hover with zero page shaking */}
      <aside className="hidden md:block relative z-40">
        <div className="fixed top-0 left-0 h-screen z-40">
          <Sidebar />
        </div>
      </aside>

      {/* Main Content Area: Perfectly stable layout, never shifts or shakes */}
      <div className="flex flex-col min-w-0">
        <Header />
        <main className="flex flex-1 flex-col p-[20px]">
          {children}
        </main>
      </div>
    </div>
  )
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <React.Suspense fallback={<div className="min-h-screen w-full bg-background">{children}</div>}>
        <AppShellContent>{children}</AppShellContent>
      </React.Suspense>
    </SidebarProvider>
  )
}
