export type AccessRequestStatus = 'Pending' | 'Approved' | 'Rejected'

export interface AccessRequest {
  id: string
  name?: string
  email: string
  accessFor?: string // e.g. "Logo & Color / All"
  requestedAt: string // ISO string
  status: AccessRequestStatus
  reviewedBy?: string
  reviewedAt?: string // ISO string
  notes?: string
}

export interface SubmitRequestInput {
  email: string
  name?: string
  accessFor?: string
}

export interface AccessRequestContextType {
  requests: AccessRequest[]
  pendingRequests: AccessRequest[]
  isLoading: boolean
  submitRequest: (input: string | SubmitRequestInput) => Promise<{ success: boolean; message: string; request?: AccessRequest }>
  approveRequest: (requestId: string, reviewerEmail: string) => Promise<void>
  rejectRequest: (requestId: string, reviewerEmail: string) => Promise<void>
  isEmailActive: (email: string) => boolean
  isEmailPending: (email: string) => boolean
  getRequestByEmail: (email: string) => AccessRequest | undefined
}
