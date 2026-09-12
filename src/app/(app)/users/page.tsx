import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Plus, Settings } from "lucide-react"

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#4472C4]/10 text-[#4472C4] shadow-xs shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#4472C4]">User Access</h1>
          </div>
          <p className="text-muted-foreground text-sm">Manage user roles and page-level permissions.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button className="h-11 px-5 rounded-xl text-sm font-bold flex items-center gap-2">
            <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            A list of all users and their assigned roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">User List Architecture</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              This interface will eventually allow Super Admins to manage page-level access,<br />
              action-level permissions, and view existing users.
            </p>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Configure Permissions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
