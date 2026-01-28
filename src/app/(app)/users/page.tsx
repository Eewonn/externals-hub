import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users as UsersIcon, UserPlus, Shield } from 'lucide-react'
import Link from 'next/link'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { UserRole } from '@/lib/supabase/types'
import UserActionsMenu from '@/app/(app)/users/user-actions-menu'

export default async function UsersPage() {
  const supabase = await createClient()
  
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !authUser) {
    redirect('/login')
  }

  // Get current user's profile with role
  const { data: currentUserProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  // Check if user has permission to manage users
  const canManageUsers = currentUserProfile?.role === 'vp_externals'

  if (!canManageUsers) {
    redirect('/dashboard')
  }

  // Fetch all users
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'vp_externals':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">VP Externals</Badge>
      case 'director_partnerships':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Director - Partnerships</Badge>
      case 'director_sponsorships':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Director - Sponsorships</Badge>
      case 'junior_officer':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Junior Officer</Badge>
      case 'adviser':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Adviser</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

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
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user roles and access permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-gray-600">{formatDate(user.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <UserActionsMenu user={user} currentUserId={authUser.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <UsersIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first user</p>
              <Link href="/users/new">
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

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
