export type ActionType = "View" | "Create" | "Edit" | "Replace" | "Delete" | "Hide" | "Download"

export interface PagePermissions {
  [action: string]: boolean
}

export interface UserPermissions {
  [pageSlug: string]: PagePermissions
}

export interface User {
  id: string
  name: string
  email: string
  role: "Super Admin" | "User"
  userType?: "INTERNAL" | "EXTERNAL"
  isInHouse?: boolean
  permissions?: UserPermissions
}
