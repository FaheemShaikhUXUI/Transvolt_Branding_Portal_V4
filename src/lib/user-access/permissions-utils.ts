import type { ManagedUser, Permission, UserRole, UserType } from './types'

// Internal / In-House domain check
export const INTERNAL_DOMAIN = '@transvolt.in'

export function isInternalEmail(email: string): boolean {
  if (!email) return false
  const clean = email.trim().toLowerCase()
  return clean.endsWith(INTERNAL_DOMAIN) || clean.includes('@transvolt.in') || clean.endsWith('@transvolt.com')
}

export function getUserType(email: string): UserType {
  return isInternalEmail(email) ? 'INTERNAL' : 'EXTERNAL'
}

export function isInHouse(emailOrUser: string | { email: string; userType?: UserType }): boolean {
  if (typeof emailOrUser === 'string') {
    return isInternalEmail(emailOrUser)
  }
  return emailOrUser.userType === 'INTERNAL' || isInternalEmail(emailOrUser.email)
}

export function isSuperAdmin(user: Pick<ManagedUser, 'role'>): boolean {
  return user.role === 'SUPER_ADMIN'
}

// Super Admin automatically passes every permission check
export function hasPermission(
  user: Pick<ManagedUser, 'role' | 'permissions'>,
  permission: Permission
): boolean {
  if (isSuperAdmin(user)) return true
  return user.permissions.includes(permission)
}

// Super Admin has access to all pages
export function hasPageAccess(
  user: Pick<ManagedUser, 'role' | 'accessScope' | 'pages'>,
  pageHref: string
): boolean {
  if (isSuperAdmin(user)) return true
  if (user.accessScope === 'ALL_PAGES') return true
  return user.pages.includes(pageHref)
}

// Check if an email is already a Super Admin (used to prevent re-invite)
export function getDisplayName(email: string): string {
  const local = email.split('@')[0]
  return local
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}
