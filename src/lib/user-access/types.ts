// Complete types for the User Access Management system
// Structured to connect to any backend (Supabase, Firebase, REST API, etc.)

export type Permission =
  | 'UPLOAD'
  | 'DELETE'
  | 'REPLACE'
  | 'HOLD'
  | 'DOWNLOAD'
  | 'SHARE'
  | 'CREATE_GROUP'
  | 'ADD_COMPANY'
  | 'VIEW_ALL'
  | 'SITE_MANAGEMENT'

export type AccessScope = 'ALL_PAGES' | 'SPECIFIC_PAGES'
export type UserRole = 'SUPER_ADMIN' | 'USER'
export type UserType = 'INTERNAL' | 'EXTERNAL'
export type UserStatus = 'ACTIVE' | 'PENDING' | 'REVOKED'
export type FilterType = 'ALL' | 'INTERNAL' | 'EXTERNAL' | 'SUPER_ADMIN' | 'CUSTOM_ACCESS' | 'VIEW_ONLY' | 'RECENTLY_ADDED'

export interface ManagedUser {
  id: string
  name: string
  email: string
  designation?: string
  role: UserRole
  userType: UserType
  accessScope: AccessScope
  pages: string[]
  permissions: Permission[]
  status: UserStatus
  invitedAt: string
  lastActiveAt?: string
  createdBy: string
}

export interface PermissionDefinition {
  key: Permission
  label: string
  description: string
  dangerous: boolean
  dangerNote?: string
}

export interface PageDefinition {
  title: string
  href: string
  description: string
}

export interface UserAccessService {
  getUsers: () => Promise<ManagedUser[]>
  addUser: (user: Omit<ManagedUser, 'id' | 'invitedAt' | 'status'>) => Promise<ManagedUser>
  updateUser: (id: string, updates: Partial<ManagedUser>) => Promise<ManagedUser>
  removeUser: (id: string) => Promise<void>
}

export interface AccessFormState {
  email: string
  accessScope: AccessScope
  selectedPages: string[]
  selectedPermissions: Permission[]
  editingUserId?: string
}
