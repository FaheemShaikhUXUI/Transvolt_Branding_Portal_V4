'use client'

import * as React from 'react'
import type { ManagedUser, AccessFormState, Permission } from './types'
import type { AccessRequest } from '@/lib/access-requests/types'
import { mockUserAccessService } from './mock-service'
import { getUserType, getDisplayName } from './permissions-utils'
import { navigationConfig } from '@/config/navigation'
import { toast } from 'sonner'

interface UserAccessContextType {
  // Modal state
  isModalOpen: boolean
  openModal: (defaultTab?: string) => void
  closeModal: () => void
  defaultTab: string

  // Users
  users: ManagedUser[]
  isLoading: boolean
  addUser: (form: AccessFormState, createdBy: string) => Promise<void>
  updateUser: (id: string, form: Omit<AccessFormState, 'email'>) => Promise<void>
  removeUser: (id: string) => Promise<void>

  // Form for edit
  editingUser: ManagedUser | null
  startEdit: (user: ManagedUser) => void
  clearEdit: () => void

  // Review pending access request
  activeAccessRequest: AccessRequest | null
  reviewAccessRequest: (request: AccessRequest) => void
  clearAccessRequest: () => void
}

const UserAccessContext = React.createContext<UserAccessContextType | undefined>(undefined)

export function UserAccessProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [defaultTab, setDefaultTab] = React.useState('super-admin')
  const [users, setUsers] = React.useState<ManagedUser[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [editingUser, setEditingUser] = React.useState<ManagedUser | null>(null)
  const [activeAccessRequest, setActiveAccessRequest] = React.useState<AccessRequest | null>(null)

  // Load users on mount
  React.useEffect(() => {
    mockUserAccessService.getUsers().then((data) => {
      setUsers(data)
      setIsLoading(false)
    })
  }, [])

  const openModal = (tab = 'super-admin') => {
    setDefaultTab(tab)
    setIsModalOpen(true)
  }
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    setActiveAccessRequest(null)
  }

  const reviewAccessRequest = (request: AccessRequest) => {
    setEditingUser(null)
    setActiveAccessRequest(request)
    openModal('user-access')
  }
  const clearAccessRequest = () => setActiveAccessRequest(null)

  const addUser = async (form: AccessFormState, createdBy: string) => {
    const email = form.email.trim().toLowerCase()
    const userType = getUserType(email)
    const name = getDisplayName(email)

    const newUser = await mockUserAccessService.addUser({
      name,
      email,
      role: 'USER',
      userType,
      accessScope: form.accessScope,
      pages: form.accessScope === 'ALL_PAGES' ? [] : form.selectedPages,
      permissions: form.selectedPermissions,
      createdBy,
    })
    setUsers((prev) => [...prev, newUser])
  }

  const updateUser = async (id: string, form: Omit<AccessFormState, 'email'>) => {
    const updated = await mockUserAccessService.updateUser(id, {
      accessScope: form.accessScope,
      pages: form.accessScope === 'ALL_PAGES' ? [] : form.selectedPages,
      permissions: form.selectedPermissions,
    })
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
  }

  const removeUser = async (id: string) => {
    await mockUserAccessService.removeUser(id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
    toast.success('User access removed successfully.')
  }

  const startEdit = (user: ManagedUser) => {
    setEditingUser(user)
    openModal('user-access')
  }
  const clearEdit = () => setEditingUser(null)

  return (
    <UserAccessContext.Provider
      value={{
        isModalOpen, openModal, closeModal, defaultTab,
        users, isLoading, addUser, updateUser, removeUser,
        editingUser, startEdit, clearEdit,
        activeAccessRequest, reviewAccessRequest, clearAccessRequest,
      }}
    >
      {children}
    </UserAccessContext.Provider>
  )
}

export function useUserAccess() {
  const ctx = React.useContext(UserAccessContext)
  if (!ctx) throw new Error('useUserAccess must be used within UserAccessProvider')
  return ctx
}
