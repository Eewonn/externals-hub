import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, Shield } from 'lucide-react'
import Link from 'next/link'
import { getCurrentUser, canManageUsers } from '@/lib/supabase/queries'
import UsersList from './users-list'

export default async function UsersPage() {
  const authUser = await getCurrentUser()
  
  if (!authUser) {
    redirect('/login')
  }

  // Check if user has permission to manage users
  const hasManagePermission = await canManageUsers()

  if (!hasManagePermission) {
    redirect('/dashboard')
  }

  // Fetch all users with only needed columns
  const supabase = await createClient()
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email, role, created_at, updated_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage user roles and permissions
          </p>
        </div>
        <Link href="/users/new">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{users?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>VP Externals</CardDescription>
            <CardTitle className="text-3xl">
              {users?.filter(u => u.role === 'vp_externals').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Directors</CardDescription>
            <CardTitle className="text-3xl">
              {users?.filter(u => u.role === 'director_partnerships' || u.role === 'director_sponsorships').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Junior Officers</CardDescription>
            <CardTitle className="text-3xl">
              {users?.filter(u => u.role === 'junior_officer').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Users Table */}
      <UsersList users={users || []} currentUserId={authUser.id} />

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">About User Roles</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li><strong>VP Externals:</strong> Full access to all features including user management</li>
                <li><strong>Directors:</strong> Can review endorsements and manage partners</li>
                <li><strong>Junior Officers:</strong> Can create events, endorsements, and manage day-to-day tasks</li>
                <li><strong>Adviser:</strong> Read-only access to all information</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
