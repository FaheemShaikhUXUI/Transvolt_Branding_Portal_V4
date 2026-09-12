"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { User } from "@/config/permissions"
import { toast } from "sonner"

interface AuthContextType {
  user: User | null
  login: (email: string, password?: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    // Check local storage for mock session
    const storedUser = localStorage.getItem("transvolt_user")
    if (storedUser) {
      try {
        const parsed: User = JSON.parse(storedUser)
        // Ensure in-house classification is recognized for @transvolt.in
        const isInternal = parsed.email?.toLowerCase().includes("@transvolt.in") || parsed.email?.toLowerCase().includes("@transvolt")
        if (isInternal) {
          parsed.userType = "INTERNAL"
          parsed.isInHouse = true
        }
        if (parsed.email?.toLowerCase() === "faheem.s@transvolt.in" || parsed.email?.toLowerCase() === "admin") {
          parsed.role = "Super Admin"
          parsed.name = "Faheem Shaikh"
          parsed.email = "faheem.s@transvolt.in"
          parsed.userType = "INTERNAL"
          parsed.isInHouse = true
        }
        setUser(parsed)
      } catch {}
    }
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== "/login") {
        router.push("/login")
      } else if (user && pathname === "/login") {
        router.push("/")
      }
    }
  }, [user, isLoading, pathname, router])

  const login = async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password?.trim() || ""

    if (!cleanEmail) {
      toast.error("Please enter your email or user ID.")
      return false
    }

    // Helper to format proper human name from email handle
    const formatDisplayName = (raw: string) => {
      const local = raw.split("@")[0]
      if (local.toLowerCase() === "faheem.s") return "Faheem Shaikh"
      return local
        .split(/[._-]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ")
    }

    // 1. Super Admin Authentication (faheem.s@transvolt.in / faheemmahi8080)
    if (cleanEmail === "faheem.s@transvolt.in" || cleanEmail === "admin") {
      // Validate password
      if (
        cleanPassword && 
        cleanPassword !== "faheemmahi8080" && 
        cleanPassword !== "admin" && 
        cleanPassword !== "••••••••••••"
      ) {
        toast.error("Invalid password for Super Admin account.")
        return false
      }

      const superAdminUser: User = {
        id: "faheem-superadmin",
        name: "Faheem Shaikh",
        email: "faheem.s@transvolt.in",
        role: "Super Admin",
        userType: "INTERNAL",
        isInHouse: true,
      }
      setUser(superAdminUser)
      localStorage.setItem("transvolt_user", JSON.stringify(superAdminUser))
      toast.success("Welcome, Faheem! Successfully authenticated as Super Admin.")
      router.push("/")
      return true
    }

    // 2. In-House Person: Anyone connecting with @transvolt.in
    const isInHousePerson = cleanEmail.endsWith("@transvolt.in") || cleanEmail.includes("@transvolt.in") || cleanEmail.includes("@transvolt")
    if (isInHousePerson) {
      const fullEmail = cleanEmail.includes("@") ? cleanEmail : `${cleanEmail}@transvolt.in`
      const formattedName = formatDisplayName(fullEmail)

      const inHouseUser: User = {
        id: `transvolt-${Date.now()}`,
        name: formattedName,
        email: fullEmail,
        role: "User",
        userType: "INTERNAL",
        isInHouse: true,
      }
      setUser(inHouseUser)
      localStorage.setItem("transvolt_user", JSON.stringify(inHouseUser))
      toast.success(`Welcome, ${formattedName}! Connected as In-House Team Member (@transvolt.in).`)
      router.push("/")
      return true
    }

    // 3. External Partner / Vendor
    const externalUser: User = {
      id: `ext-${Date.now()}`,
      name: formatDisplayName(cleanEmail),
      email: cleanEmail,
      role: "User",
      userType: "EXTERNAL",
      isInHouse: false,
    }
    setUser(externalUser)
    localStorage.setItem("transvolt_user", JSON.stringify(externalUser))
    toast.success(`Welcome, ${externalUser.name}! Connected as External Partner.`)
    router.push("/")
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("transvolt_user")
    toast.success("Successfully logged out.")
    router.push("/login")
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
