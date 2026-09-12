"use client"

import * as React from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { SidebarProvider } from "./sidebar-context"

interface AppShellProps {
  children: React.ReactNode
}

function AppShellContent({ children }: AppShellProps) {
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
      <AppShellContent>{children}</AppShellContent>
    </SidebarProvider>
  )
}
