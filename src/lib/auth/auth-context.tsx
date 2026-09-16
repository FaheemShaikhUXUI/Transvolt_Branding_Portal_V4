"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { User } from "@/config/permissions"
import { toast } from "sonner"
import {
  getSuperAdminCredentials,
  isSuperAdminEmail,
  isUserSuperAdmin,
  verifySuperAdminPassword,
  SUPERADMIN_CREDENTIALS_EVENT,
  type SuperAdminCredentials,
} from "./superadmin-credentials"

interface AuthContextType {
  user: User | null
  login: (email: string, password?: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
  superAdminCredentials: SuperAdminCredentials
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [superAdminCreds, setSuperAdminCreds] = React.useState<SuperAdminCredentials>(() => getSuperAdminCredentials())
  const router = useRouter()
  const pathname = usePathname()

  // Sync credentials on mount & listen for updates
  React.useEffect(() => {
    const syncCreds = () => {
      const creds = getSuperAdminCredentials()
      setSuperAdminCreds(creds)
      
      setUser((prevUser) => {
        if (!prevUser) return prevUser
        if (isUserSuperAdmin(prevUser)) {
          const updated = {
            ...prevUser,
            email: creds.email,
            name: creds.name,
            role: "Super Admin" as const,
            userType: "INTERNAL" as const,
            isInHouse: true,
          }
          localStorage.setItem("transvolt_user", JSON.stringify(updated))
          return updated
        }
        return prevUser
      })
    }

    syncCreds()

    window.addEventListener(SUPERADMIN_CREDENTIALS_EVENT, syncCreds)
    window.addEventListener("storage", syncCreds)
    return () => {
      window.removeEventListener(SUPERADMIN_CREDENTIALS_EVENT, syncCreds)
      window.removeEventListener("storage", syncCreds)
    }
  }, [])

function setSessionCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "transvolt_session=1; path=/; max-age=604800; SameSite=Lax"
  }
}

function clearSessionCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "transvolt_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"
  }
}

  React.useEffect(() => {
    // Check if active session cookie is present
    const hasSessionCookie = typeof document !== "undefined" && document.cookie.includes("transvolt_session=")
    const storedUser = hasSessionCookie ? localStorage.getItem("transvolt_user") : null

    // If cookie was cleared or expired, remove stale localStorage session
    if (!hasSessionCookie && typeof localStorage !== "undefined" && localStorage.getItem("transvolt_user")) {
      localStorage.removeItem("transvolt_user")
    }

    if (storedUser) {
      try {
        const parsed: User = JSON.parse(storedUser)
        const creds = getSuperAdminCredentials()
        // Ensure in-house classification is recognized for @transvolt.in
        const isInternal = parsed.email?.toLowerCase().includes("@transvolt.in") || parsed.email?.toLowerCase().includes("@transvolt")
        if (isInternal) {
          parsed.userType = "INTERNAL"
          parsed.isInHouse = true
        }
        if (isUserSuperAdmin(parsed)) {
          parsed.role = "Super Admin"
          parsed.name = creds.name || parsed.name || "Faheem Shaikh"
          parsed.email = creds.email || parsed.email
          parsed.userType = "INTERNAL"
          parsed.isInHouse = true
          localStorage.setItem("transvolt_user", JSON.stringify(parsed))
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

    // 1. Super Admin Authentication
    if (isSuperAdminEmail(cleanEmail)) {
      // Validate password
      if (cleanPassword && !verifySuperAdminPassword(cleanPassword) && cleanPassword !== "••••••••••••") {
        toast.error("Invalid password for Super Admin account.")
        return false
      }

      const activeCreds = getSuperAdminCredentials()
      const superAdminUser: User = {
        id: "faheem-superadmin",
        name: activeCreds.name || "Faheem Shaikh",
        email: activeCreds.email,
        role: "Super Admin",
        userType: "INTERNAL",
        isInHouse: true,
      }
      setUser(superAdminUser)
      setSessionCookie()
      localStorage.setItem("transvolt_user", JSON.stringify(superAdminUser))
      toast.success(`Welcome back, ${superAdminUser.name}! Successfully authenticated as Super Admin.`)
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
      setSessionCookie()
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
    setSessionCookie()
    localStorage.setItem("transvolt_user", JSON.stringify(externalUser))
    toast.success(`Welcome, ${externalUser.name}! Connected as External Partner.`)
    router.push("/")
    return true
  }

  const logout = () => {
    setUser(null)
    clearSessionCookie()
    localStorage.removeItem("transvolt_user")
    toast.success("Successfully logged out.")
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
        superAdminCredentials: superAdminCreds,
      }}
    >
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
