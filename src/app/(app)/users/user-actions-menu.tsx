'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoreHorizontal, UserCog, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/supabase/types'

interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
  updated_at: string
  approval_status?: string
}

interface UserActionsMenuProps {
  user: User
  currentUserId: string
}

export default function UserActionsMenu({ user, currentUserId }: UserActionsMenuProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role)
  const [isLoading, setIsLoading] = useState(false)

  const isCurrentUser = user.id === currentUserId
  const isPending = user.approval_status === 'pending'

  const handleRoleChange = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: selectedRole })
        .eq('id', user.id)

      if (error) throw error

      setIsRoleDialogOpen(false)
      router.refresh()
    } catch (error) {
      // Error handling
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    setIsLoading(true)
    try {
      // Delete from public.users table (auth.users will cascade)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

      if (error) return

      setIsDeleteDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      // Error handling
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveUser = async () => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/users/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          action: 'approve'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve user')
      }

      setIsApproveDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      // Error handling
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectUser = async () => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/users/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          action: 'reject'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject user')
      }

      setIsRejectDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      // Error handling
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isPending && (
            <>
              <DropdownMenuItem 
                onClick={() => setIsApproveDialogOpen(true)}
                className="text-green-600"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve User
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setIsRejectDialogOpen(true)}
                className="text-red-600"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem 
            onClick={() => {
              setSelectedRole(user.role)
              setIsRoleDialogOpen(true)
            }}
          >
            <UserCog className="mr-2 h-4 w-4" />
            Change Role
          </DropdownMenuItem>
          {!isCurrentUser && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Deactivate User
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {user.full_name} ({user.email})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="role">Select Role</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <SelectTrigger id="role" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vp_externals">VP Externals</SelectItem>
                <SelectItem value="director_partnerships">Director - Partnerships</SelectItem>
                <SelectItem value="director_sponsorships">Director - Sponsorships</SelectItem>
                <SelectItem value="junior_officer">Junior Officer</SelectItem>
                <SelectItem value="adviser">Adviser</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate {user.full_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isLoading}>
              {isLoading ? 'Deactivating...' : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve User Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve User</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {user.full_name} ({user.email})? They will be able to sign in and access the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleApproveUser} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? 'Approving...' : 'Approve User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject User Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject User</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject {user.full_name} ({user.email})? They will not be able to sign in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectUser} disabled={isLoading}>
              {isLoading ? 'Rejecting...' : 'Reject User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
