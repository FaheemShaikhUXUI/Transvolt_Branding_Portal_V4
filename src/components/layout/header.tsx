"use client"

import * as React from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, Users, LogOut, Menu, Smile } from "lucide-react"
import { BrandLogo } from "./brand-logo"
import { useAuth } from "@/lib/auth/auth-context"
import { useUserAccess } from "@/lib/user-access/user-access-context"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeSelector } from "@/components/theme/theme-selector"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { NotificationBell } from "./notification-bell"

export function Header() {
  const { logout, user } = useAuth()
  const { openModal } = useUserAccess()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = React.useState(searchParams.get("q") ?? "")

  // Sync input if URL param changes externally (e.g. navigation)
  React.useEffect(() => {
    setQuery(searchParams.get("q") ?? "")
  }, [searchParams])

  // Debounced push to URL
  React.useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (query) params.set("q", query)
      else params.delete("q")
      router.replace(`${pathname}?${params.toString()}`)
    }, 300)
    return () => clearTimeout(t)
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps
  
  return (
    <header 
      className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border/40 bg-background/40 backdrop-blur-xl px-4 lg:h-[60px] lg:px-6 transition-all duration-200"
      style={{
        backdropFilter: "blur(18px) saturate(180%) contrast(102%)",
        WebkitBackdropFilter: "blur(18px) saturate(180%) contrast(102%)",
      }}
    >
      <Sheet>
        <SheetTrigger render={<Button size="icon" variant="outline" className="sm:hidden" />}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-[260px] p-0 sm:max-w-none">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Sidebar isMobile={true} />
        </SheetContent>
      </Sheet>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden">
        <BrandLogo className="w-[156px] h-[44px]" />
      </div>

      <div className="hidden lg:flex flex-1 items-center">
        <h1 className="text-xl font-bold text-foreground drop-shadow-sm">
          Transvolt Branding Portal
        </h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search assets..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg bg-background/50 hover:bg-background/70 focus:bg-background/85 border-border/50 backdrop-blur-md pl-8 md:w-[200px] lg:w-[320px] transition-all"
            />
          </div>

        {/* Notification Bell (Only visible to Super Admin) */}
        <NotificationBell />

        <Tooltip>
          <TooltipTrigger render={
            <Button
              id="header-user-access-btn"
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => openModal('active-users')}
            />
          }>
            <Users className="h-4 w-4" />
            <span className="sr-only">User Access</span>
          </TooltipTrigger>
          <TooltipContent>User Access Management</TooltipContent>
        </Tooltip>

        <ThemeSelector />

        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" size="icon" className="rounded-full" onClick={logout} />}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Logout</span>
          </TooltipTrigger>
          <TooltipContent>Logout</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={
            <button 
              id="header-avatar-btn" 
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-border/80 hover:border-primary/50 bg-background/80 hover:bg-muted/40 transition-all cursor-pointer select-none" 
              onClick={() => openModal('super-admin')} 
            />
          }>
            <Avatar className="h-7 w-7 ring-2 ring-primary/20 shrink-0">
              <AvatarImage src="" alt={user?.name || "User"} />
              <AvatarFallback className="text-[11px] font-bold bg-[#548235]/15 text-[#548235]">
                {user?.name?.slice(0, 2).toUpperCase() || "TV"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-foreground truncate max-w-[130px]">
                {user?.name || "User"}
              </span>
              <span className="text-[10px] font-semibold text-[#548235] flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#548235] animate-pulse" />
                {user?.role === "Super Admin" ? "Super Admin" : "In-House"}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>{user?.email} ({user?.role === "Super Admin" ? "Super Admin" : "In-House Person"})</TooltipContent>
        </Tooltip>

        {/* 1) Small Smiley Button at Absolute Right Side to View Shinchan Animation Immediately */}
        <Tooltip>
          <TooltipTrigger
            onClick={(e) => {
              e.stopPropagation()
              window.dispatchEvent(new CustomEvent("trigger-shinchan-screensaver"))
            }}
            render={
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-8 w-8 border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 hover:text-amber-600 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  window.dispatchEvent(new CustomEvent("trigger-shinchan-screensaver"))
                }}
              />
            }
          >
            <Smile className="h-4 w-4" />
            <span className="sr-only">Shinchan Animation</span>
          </TooltipTrigger>
          <TooltipContent>Watch Shinchan Animation :)</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
