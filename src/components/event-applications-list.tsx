'use client'

import { useState, useEffect } from 'react'
import { EventApplication } from '@/lib/supabase/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface EventApplicationsListProps {
  eventTitle: string
  applications: EventApplication[]
  onExport?: () => void
}

export function EventApplicationsList({
  eventTitle,
  applications,
  onExport,
}: EventApplicationsListProps) {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [localApplications, setLocalApplications] = useState(applications)
  const supabase = createClient()

  useEffect(() => {
    fetchUserRole()
  }, [])

  useEffect(() => {
    setLocalApplications(applications)
  }, [applications])

  async function fetchUserRole() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    setUserRole(profile?.role || null)
  }

  async function handleApprove(applicationId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.rpc('update_application_status', {
        p_application_id: applicationId,
        p_status: 'approved',
        p_reviewer_id: user.id
      })

      if (error) {
        alert('Failed to approve application: ' + error.message)
        return
      }

      // Update local state
      setLocalApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'approved' as any }
            : app
        )
      )
    } catch (err) {
      alert('An unexpected error occurred')
    }
  }

  async function handleReject(applicationId: string) {
    if (!confirm('Are you sure you want to reject this application?')) {
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.rpc('update_application_status', {
        p_application_id: applicationId,
        p_status: 'rejected',
        p_reviewer_id: user.id
      })

      if (error) {
        alert('Failed to reject application: ' + error.message)
        return
      }

      // Update local state
      setLocalApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'rejected' as any }
            : app
        )
      )
    } catch (err) {
      alert('An unexpected error occurred')
    }
  }
  const getMembershipStatusColor = (status: string) => {
    switch (status) {
      case 'yes':
        return 'bg-green-100 text-green-800'
      case 'no':
        return 'bg-gray-100 text-gray-800'
      case 'not_sure':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMembershipStatusLabel = (status: string) => {
    switch (status) {
      case 'yes':
        return 'ACM Member'
      case 'no':
        return 'Non-Member'
      case 'not_sure':
        return 'Unsure'
      default:
        return status
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
    }
  }

  const canReview = userRole === 'vp_externals' || 
                    userRole === 'director_partnerships' || 
                    userRole === 'director_sponsorships'

  if (localApplications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{eventTitle}</CardTitle>
          <CardDescription>No applications yet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{eventTitle}</CardTitle>
            <CardDescription>
              {localApplications.length} application{localApplications.length !== 1 ? 's' : ''} received
            </CardDescription>
          </div>
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Student Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>ACM Status</TableHead>
                <TableHead>Course / Year</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Status</TableHead>
                {canReview && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {localApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">{application.full_name}</TableCell>
                  <TableCell>{application.student_number}</TableCell>
                  <TableCell className="text-sm">{application.student_email}</TableCell>
                  <TableCell>
                    <Badge className={getMembershipStatusColor(application.acm_membership_status)}>
                      {getMembershipStatusLabel(application.acm_membership_status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{application.course_year_level}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(application.applied_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge((application as any).status || 'pending')}
                  </TableCell>
                  {canReview && (
                    <TableCell className="text-right">
                      {((application as any).status || 'pending') === 'pending' && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(application.id)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(application.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
