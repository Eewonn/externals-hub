'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users as UsersIcon, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { UserRole } from '@/lib/supabase/types'
import UserActionsMenu from '@/app/(app)/users/user-actions-menu'

type User = {
  id: string
  full_name: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
  approval_status?: string
}

export default function UsersList({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Pending Approval</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      default:
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
    }
  }

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

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || (user.approval_status || 'approved') === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchQuery, roleFilter, statusFilter])

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
        <CardDescription>Manage user roles and access permissions</CardDescription>
        
        {/* Search and Filter Controls */}
        <div className="flex gap-4 pt-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="vp_externals">VP Externals</SelectItem>
              <SelectItem value="director_partnerships">Director - Partnerships</SelectItem>
              <SelectItem value="director_sponsorships">Director - Sponsorships</SelectItem>
              <SelectItem value="junior_officer">Junior Officer</SelectItem>
              <SelectItem value="adviser">Adviser</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredUsers.length > 0 ? (
          <>
            <div className="text-sm text-gray-600 mb-4">
              Showing {filteredUsers.length} of {users.length} users
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.approval_status)}</TableCell>
                    <TableCell className="text-gray-600">{formatDate(user.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <UserActionsMenu user={user} currentUserId={currentUserId} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <UsersIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || roleFilter !== 'all' ? 'No users found' : 'No users yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || roleFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first user'
              }
            </p>
            {!searchQuery && roleFilter === 'all' && (
              <Link href="/users/new">
                <Button>Add User</Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
