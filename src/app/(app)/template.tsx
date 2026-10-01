"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

export default function AppTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEvaTool = pathname === "/eva-design-tool" || pathname?.startsWith("/eva-design-tool")

  if (isEvaTool) {
    return <>{children}</>
  }

  return (
    <div key={pathname} className="page-transition flex-1 flex flex-col min-w-0">
      {children}
    </div>
  )
}
