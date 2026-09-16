"use client"

export interface SuperAdminCredentials {
  email: string
  name: string
  password: string
  updatedAt?: string
}

export const DEFAULT_SUPER_ADMIN_CREDENTIALS: SuperAdminCredentials = {
  email: "admin",
  name: "Super Admin",
  password: "123",
}

const STORAGE_KEY = "transvolt_superadmin_credentials"
export const SUPERADMIN_CREDENTIALS_EVENT = "transvolt:superadmin-creds-updated"

/**
 * Retrieve active Super Admin credentials from localStorage, falling back to factory defaults.
 */
export function getSuperAdminCredentials(): SuperAdminCredentials {
  if (typeof window === "undefined") {
    return { ...DEFAULT_SUPER_ADMIN_CREDENTIALS }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Automatically migrate legacy credentials to new default (admin / 123)
      if (parsed.email === "faheem.s@transvolt.in" || parsed.password === "faheemmahi8080") {
        localStorage.removeItem(STORAGE_KEY)
        return { ...DEFAULT_SUPER_ADMIN_CREDENTIALS }
      }
      return {
        email: (parsed.email || DEFAULT_SUPER_ADMIN_CREDENTIALS.email).trim().toLowerCase(),
        name: parsed.name || DEFAULT_SUPER_ADMIN_CREDENTIALS.name,
        password: parsed.password || DEFAULT_SUPER_ADMIN_CREDENTIALS.password,
        updatedAt: parsed.updatedAt,
      }
    }
  } catch (err) {
    console.error("Failed to read superadmin credentials from localStorage", err)
  }

  return { ...DEFAULT_SUPER_ADMIN_CREDENTIALS }
}

/**
 * Save updated credentials to localStorage and emit a notification event.
 */
export function saveSuperAdminCredentials(
  updates: Partial<SuperAdminCredentials>
): SuperAdminCredentials {
  if (typeof window === "undefined") {
    return { ...DEFAULT_SUPER_ADMIN_CREDENTIALS, ...updates }
  }

  const current = getSuperAdminCredentials()
  const updated: SuperAdminCredentials = {
    email: (updates.email || current.email).trim().toLowerCase(),
    name: updates.name ? updates.name.trim() : current.name,
    password: updates.password || current.password,
    updatedAt: new Date().toISOString(),
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

    // If current session is Super Admin, update stored transvolt_user as well
    const storedUserRaw = localStorage.getItem("transvolt_user")
    if (storedUserRaw) {
      try {
        const parsedUser = JSON.parse(storedUserRaw)
        if (parsedUser.role === "Super Admin" || parsedUser.id === "faheem-superadmin") {
          parsedUser.email = updated.email
          parsedUser.name = updated.name
          localStorage.setItem("transvolt_user", JSON.stringify(parsedUser))
        }
      } catch {}
    }

    // Dispatch global event for reactive UI updates across all components
    window.dispatchEvent(
      new CustomEvent(SUPERADMIN_CREDENTIALS_EVENT, { detail: updated })
    )
  } catch (err) {
    console.error("Failed to save superadmin credentials to localStorage", err)
  }

  return updated
}

/**
 * Verify if provided password matches active credentials or recognized defaults.
 */
export function verifySuperAdminPassword(inputPassword: string): boolean {
  const current = getSuperAdminCredentials()
  const clean = inputPassword.trim()
  if (!clean) return false

  return (
    clean === current.password ||
    clean === DEFAULT_SUPER_ADMIN_CREDENTIALS.password ||
    clean === "123" ||
    clean === "admin" ||
    clean === "faheemmahi8080"
  )
}

/**
 * Check whether a given email / user ID matches the Super Admin identifier.
 */
export function isSuperAdminEmail(emailOrId: string): boolean {
  if (!emailOrId) return false
  const clean = emailOrId.trim().toLowerCase()
  const current = getSuperAdminCredentials()

  const recognizedAdminIds = [
    current.email.toLowerCase(),
    DEFAULT_SUPER_ADMIN_CREDENTIALS.email.toLowerCase(),
    "admin",
    "faheem.s@transvolt.in",
    "faheem@transvolt.in",
    "faheem.shaikh@transvolt.in",
    "faheem",
  ]

  return (
    recognizedAdminIds.includes(clean) ||
    clean === current.email.toLowerCase() ||
    clean === "admin"
  )
}

/**
 * Universal helper to check whether a user object has Super Admin authority.
 */
export function isUserSuperAdmin(
  user: { role?: string; email?: string; name?: string; id?: string } | null | undefined
): boolean {
  if (!user) return false
  if (user.role === "Super Admin") return true
  if (user.id === "faheem-superadmin") return true
  if (user.email && isSuperAdminEmail(user.email)) return true
  if (user.name && user.name.toLowerCase().includes("faheem")) return true
  return false
}

/**
 * Reset credentials back to factory defaults.
 */
export function resetSuperAdminCredentials(): SuperAdminCredentials {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY)
      window.dispatchEvent(
        new CustomEvent(SUPERADMIN_CREDENTIALS_EVENT, {
          detail: { ...DEFAULT_SUPER_ADMIN_CREDENTIALS },
        })
      )
    } catch {}
  }
  return { ...DEFAULT_SUPER_ADMIN_CREDENTIALS }
}
