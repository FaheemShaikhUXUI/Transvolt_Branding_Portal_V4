import type { ManagedUser, UserAccessService, Permission, PermissionDefinition, PageDefinition } from './types'
import { getUserType } from './permissions-utils'

// --- Permission Definitions (single source of truth) ---
export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  { key: 'UPLOAD', label: 'Upload', description: 'Allows the user to upload new assets to the portal.', dangerous: false },
  { key: 'DELETE', label: 'Delete', description: 'Allows the user to permanently delete assets.', dangerous: true, dangerNote: 'Irreversible action — deleted assets cannot be recovered.' },
  { key: 'REPLACE', label: 'Replace', description: 'Allows the user to replace existing assets with new versions.', dangerous: false },
  { key: 'HOLD', label: 'Hold', description: 'Allows the user to place assets or content on hold/suspension.', dangerous: false },
  { key: 'DOWNLOAD', label: 'Download', description: 'Allows the user to download available assets.', dangerous: false },
  { key: 'SHARE', label: 'Share', description: 'Allows the user to generate shareable links for assets.', dangerous: false },
  { key: 'CREATE_GROUP', label: 'Create New Groups', description: 'Allows the user to create new groups or categories.', dangerous: true, dangerNote: 'Can affect overall content organisation.' },
  { key: 'ADD_COMPANY', label: 'Add Company', description: 'Allows the user to add companies to Company Master.', dangerous: true, dangerNote: 'Affects company-level data across the portal.' },
  { key: 'VIEW_ALL', label: 'View Everything', description: 'Allows viewing of all content within the permitted page scope.', dangerous: false },
  { key: 'SITE_MANAGEMENT', label: 'Site Management', description: 'Allows higher-level portal configuration and management.', dangerous: true, dangerNote: 'Grants broad administrative control over portal settings.' },
]

// --- Mock seed data ---
const MOCK_USERS: ManagedUser[] = [
  {
    id: '1',
    name: 'Faheem Shaikh',
    email: 'faheem.s@transvolt.in',
    designation: 'Portal Administrator',
    role: 'SUPER_ADMIN',
    userType: 'INTERNAL',
    accessScope: 'ALL_PAGES',
    pages: [],
    permissions: ['UPLOAD','DELETE','REPLACE','HOLD','DOWNLOAD','SHARE','CREATE_GROUP','ADD_COMPANY','VIEW_ALL','SITE_MANAGEMENT'],
    status: 'ACTIVE',
    invitedAt: '2026-01-10T09:00:00Z',
    createdBy: 'system',
  },
  {
    id: '2',
    name: 'Riya Mehta',
    email: 'riya.m@transvolt.in',
    designation: 'Brand Designer',
    role: 'USER',
    userType: 'INTERNAL',
    accessScope: 'SPECIFIC_PAGES',
    pages: ['/', '/logo-color', '/typography', '/vehicle-branding', '/photos'],
    permissions: ['UPLOAD','DOWNLOAD','REPLACE','VIEW_ALL'],
    status: 'ACTIVE',
    invitedAt: '2026-03-15T10:30:00Z',
    createdBy: 'faheem.s@transvolt.in',
  },
  {
    id: '3',
    name: 'Arjun Kapoor',
    email: 'arjun.k@transvolt.in',
    designation: 'Operations Manager',
    role: 'USER',
    userType: 'INTERNAL',
    accessScope: 'SPECIFIC_PAGES',
    pages: ['/', '/photos', '/charger-branding', '/vehicle-branding'],
    permissions: ['DOWNLOAD','VIEW_ALL','SHARE'],
    status: 'ACTIVE',
    invitedAt: '2026-05-20T08:00:00Z',
    createdBy: 'faheem.s@transvolt.in',
  },
  {
    id: '4',
    name: 'Priya Sharma',
    email: 'priya.sharma@vendor-agency.com',
    designation: 'Creative Director',
    role: 'USER',
    userType: 'EXTERNAL',
    accessScope: 'SPECIFIC_PAGES',
    pages: ['/logo-color', '/typography', '/vehicle-branding', '/charger-branding', '/printing-assets'],
    permissions: ['DOWNLOAD','VIEW_ALL'],
    status: 'ACTIVE',
    invitedAt: '2026-06-01T11:00:00Z',
    createdBy: 'faheem.s@transvolt.in',
  },
  {
    id: '5',
    name: 'Carlos Mendes',
    email: 'c.mendes@global-partner.net',
    designation: 'Partnership Manager',
    role: 'USER',
    userType: 'EXTERNAL',
    accessScope: 'ALL_PAGES',
    pages: [],
    permissions: ['DOWNLOAD','SHARE','VIEW_ALL'],
    status: 'PENDING',
    invitedAt: '2026-08-30T14:00:00Z',
    createdBy: 'faheem.s@transvolt.in',
  },
]

const USERS_STORAGE_KEY = 'transvolt_managed_users'

function getStoredUsers(): ManagedUser[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
  }
  return [...MOCK_USERS]
}

function saveStoredUsers(users: ManagedUser[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    } catch {}
  }
}

let _users: ManagedUser[] = getStoredUsers()

function delay(ms = 600): Promise<void> {
  return new Promise((res) => setTimeout(res, ms))
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

// Mock service implementation — swap this entire object with real API calls
export const mockUserAccessService: UserAccessService = {
  async getUsers() {
    await delay(300)
    _users = getStoredUsers()
    return [..._users]
  },

  async addUser(userData) {
    await delay(700)
    const now = new Date().toISOString()
    const newUser: ManagedUser = {
      ...userData,
      id: generateId(),
      status: 'ACTIVE',
      invitedAt: now,
    }
    _users = [newUser, ..._users]
    saveStoredUsers(_users)
    return newUser
  },

  async updateUser(id, updates) {
    await delay(500)
    const idx = _users.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error('User not found')
    _users = _users.map((u) => (u.id === id ? { ...u, ...updates } : u))
    saveStoredUsers(_users)
    return _users.find((u) => u.id === id)!
  },

  async removeUser(id) {
    await delay(500)
    _users = _users.filter((u) => u.id !== id)
    saveStoredUsers(_users)
  },
}
