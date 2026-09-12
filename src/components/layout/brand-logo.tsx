"use client"

import * as React from "react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function BrandLogo({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={cn("w-[182px] h-[52px]", className)} />
  }

  const isDarkTheme = resolvedTheme === "dark" || resolvedTheme === "theme-navy"
  const logoSrc = isDarkTheme ? "/logos/Logo_White.svg" : "/logos/Logo_Black.svg"

  return (
    <div className={cn("relative w-[182px] h-[52px]", className)}>
      <Image
        src={logoSrc}
        alt="Transvolt Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  )
}
