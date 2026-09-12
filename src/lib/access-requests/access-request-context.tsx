'use client'

import * as React from 'react'
import type { AccessRequest, AccessRequestContextType, AccessRequestStatus } from './types'
import { mockUserAccessService } from '@/lib/user-access/mock-service'
import { toast } from 'sonner'

const STORAGE_KEY = 'transvolt_access_requests'

const SEED_REQUESTS: AccessRequest[] = [
  {
    id: 'req_seed_1',
    name: 'Vikram Patel',
    email: 'vikram.p@transvolt.in',
    accessFor: 'Logo & Color / All',
    requestedAt: '2026-09-11T14:12:00.000Z',
    status: 'Pending',
  },
  {
    id: 'req_seed_2',
    name: 'Neha Sharma',
    email: 'neha.s@agency-partner.com',
    accessFor: 'Vehicle Branding',
    requestedAt: '2026-09-10T10:30:00.000Z',
    status: 'Approved',
    reviewedBy: 'faheem.s@transvolt.in',
    reviewedAt: '2026-09-10T11:05:00.000Z',
  },
  {
    id: 'req_seed_3',
    name: 'Unknown Vendor',
    email: 'unknown.vendor@spam-domain.com',
    accessFor: 'All Pages',
    requestedAt: '2026-09-08T16:45:00.000Z',
    status: 'Rejected',
    reviewedBy: 'faheem.s@transvolt.in',
    reviewedAt: '2026-09-08T17:10:00.000Z',
  },
]

const AccessRequestContext = React.createContext<AccessRequestContextType | undefined>(undefined)

export function AccessRequestProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = React.useState<AccessRequest[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Load from localStorage or initialize with seed data
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated = parsed.map((r: AccessRequest) => ({
            ...r,
            name: r.name || r.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            accessFor: r.accessFor || 'Logo & Color / All',
          }))
          setRequests(migrated)
          setIsLoading(false)
          return
        }
      }
      // Initialize with seed
      setRequests(SEED_REQUESTS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REQUESTS))
    } catch {
      setRequests(SEED_REQUESTS)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Helper to persist requests
  const saveRequests = React.useCallback((updated: AccessRequest[]) => {
    setRequests(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to persist access requests', e)
    }
  }, [])

  // Check if an email is already active in the portal
  const isEmailActive = React.useCallback((email: string): boolean => {
    const clean = email.trim().toLowerCase()
    // Hardcoded Super Admin / system accounts
    if (
      clean === 'admin@transvolt.com' ||
      clean === 'admin@transvolt.in' ||
      clean === 'faheem.s@transvolt.in' ||
      clean === 'riya.m@transvolt.in' ||
      clean === 'arjun.k@transvolt.in' ||
      clean === 'priya.sharma@vendor-agency.com'
    ) {
      return true
    }

    // Check localStorage transvolt_user or mock users if available
    try {
      const storedUser = localStorage.getItem('transvolt_user')
      if (storedUser) {
        const u = JSON.parse(storedUser)
        if (u?.email && u.email.toLowerCase() === clean) {
          return true
        }
      }
    } catch {}

    return false
  }, [])

  // Check if an email has a pending request
  const isEmailPending = React.useCallback((email: string): boolean => {
    const clean = email.trim().toLowerCase()
    return requests.some((r) => r.status === 'Pending' && r.email.toLowerCase() === clean)
  }, [requests])

  const getRequestByEmail = React.useCallback((email: string): AccessRequest | undefined => {
    const clean = email.trim().toLowerCase()
    return requests.find((r) => r.email.toLowerCase() === clean)
  }, [requests])

  // Submit a new access request
  const submitRequest = async (
    input: string | { email: string; name?: string; accessFor?: string }
  ): Promise<{ success: boolean; message: string; request?: AccessRequest }> => {
    const rawEmail = typeof input === 'string' ? input : input.email
    const rawName = typeof input === 'string' ? undefined : input.name
    const rawAccessFor = typeof input === 'string' ? undefined : input.accessFor

    const email = rawEmail.trim().toLowerCase()
    const fallbackName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    const name = rawName?.trim() || fallbackName
    const accessFor = rawAccessFor?.trim() || 'Logo & Color / All'

    // 1. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return { success: false, message: 'Please enter a valid email address.' }
    }

    // 2. Check if already active user
    // Also query active users from mockUserAccessService
    let activeInService = false
    try {
      const allUsers = await mockUserAccessService.getUsers()
      if (allUsers.some((u) => u.email.toLowerCase() === email && u.status === 'ACTIVE')) {
        activeInService = true
      }
    } catch {}

    if (activeInService || isEmailActive(email)) {
      return {
        success: false,
        message: 'This email already has access. Please use the Login option.',
      }
    }

    // 3. Check if already pending review
    if (isEmailPending(email)) {
      return {
        success: false,
        message: 'An access request from this email is already pending review.',
      }
    }

    // 4. Create new request
    const newReq: AccessRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      email,
      accessFor,
      requestedAt: new Date().toISOString(),
      status: 'Pending',
    }

    const updated = [newReq, ...requests]
    saveRequests(updated)

    return {
      success: true,
      message: 'Your access request has been sent to the administrator. You will be notified once your access is approved.',
      request: newReq,
    }
  }

  // Approve a request
  const approveRequest = async (requestId: string, reviewerEmail: string) => {
    const now = new Date().toISOString()
    const updated = requests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'Approved' as AccessRequestStatus,
            reviewedBy: reviewerEmail,
            reviewedAt: now,
          }
        : r
    )
    saveRequests(updated)
  }

  // Reject a request
  const rejectRequest = async (requestId: string, reviewerEmail: string) => {
    const now = new Date().toISOString()
    const updated = requests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'Rejected' as AccessRequestStatus,
            reviewedBy: reviewerEmail,
            reviewedAt: now,
          }
        : r
    )
    saveRequests(updated)
  }

  const pendingRequests = React.useMemo(() => {
    return requests.filter((r) => r.status === 'Pending')
  }, [requests])

  return (
    <AccessRequestContext.Provider
      value={{
        requests,
        pendingRequests,
        isLoading,
        submitRequest,
        approveRequest,
        rejectRequest,
        isEmailActive,
        isEmailPending,
        getRequestByEmail,
      }}
    >
      {children}
    </AccessRequestContext.Provider>
  )
}

export function useAccessRequests() {
  const context = React.useContext(AccessRequestContext)
  if (!context) {
    throw new Error('useAccessRequests must be used within an AccessRequestProvider')
  }
  return context
}
