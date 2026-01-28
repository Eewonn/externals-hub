'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExternalLink, Calendar, FileText, User, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default function EndorsementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [endorsement, setEndorsement] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  
  const [reviewNotes, setReviewNotes] = useState('')
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    fetchEndorsementDetails()
  }, [params.id])

  const fetchEndorsementDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch user role
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      setUserRole(profile?.role || null)

      // Fetch endorsement details
      const { data: endorsementData, error: endorsementError } = await supabase
        .from('endorsements')
        .select(`
          *,
          event_id(id, title, event_type, event_date, school_associate),
          created_by(full_name, email),
          reviewed_by(full_name)
        `)
        .eq('id', params.id)
        .single()

      if (endorsementError) {
        setError(endorsementError.message)
        setLoading(false)
        return
      }

      setEndorsement(endorsementData)
      setNewStatus(endorsementData.status)
      setLoading(false)
    } catch (err) {
      setError('Failed to load endorsement details')
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === endorsement.status) {
      return
    }

    setUpdating(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const updateData: any = {
        status: newStatus,
      }

      // Add review metadata if VP is reviewing
      if (userRole === 'vp_externals' && newStatus === 'vpe_reviewed') {
        updateData.reviewed_by = user?.id
        updateData.reviewed_at = new Date().toISOString()
      }

      // Add submission metadata
      if (newStatus === 'submitted_to_sado') {
        updateData.submitted_at = new Date().toISOString()
      }

      // Add approval metadata
      if (newStatus === 'approved') {
        updateData.approved_at = new Date().toISOString()
      }

      // Update notes if provided
      if (reviewNotes) {
        updateData.notes = endorsement.notes 
          ? `${endorsement.notes}\n\n[${format(new Date(), 'MMM dd, yyyy')}] ${reviewNotes}`
          : reviewNotes
      }

      const { error: updateError } = await supabase
        .from('endorsements')
        .update(updateData)
        .eq('id', params.id)

      if (updateError) {
        alert('Failed to update status: ' + updateError.message)
        setUpdating(false)
        return
      }

      // Refresh the page
      fetchEndorsementDetails()
      setReviewNotes('')
      setUpdating(false)
    } catch (err) {
      alert('An unexpected error occurred')
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'drafted':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'vpe_reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'submitted_to_sado':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const canUpdateStatus = userRole === 'vp_externals' || 
    ['director_partnerships', 'director_sponsorships'].includes(userRole || '')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading endorsement details...</div>
      </div>
    )
  }

  if (error || !endorsement) {
    return (
      <div className="max-w-3xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Endorsement not found'}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Badge className={`${getStatusColor(endorsement.status)} border`}>
            {formatStatus(endorsement.status)}
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900">
            Endorsement for {endorsement.event_id?.title}
          </h1>
          <p className="text-gray-600">
            {endorsement.event_id?.event_type && (
              <span className="capitalize">{endorsement.event_id.event_type}</span>
            )}
            {endorsement.event_id?.event_date && (
              <> • {format(new Date(endorsement.event_id.event_date), 'MMM dd, yyyy')}</>
            )}
          </p>
        </div>
      </div>

      {/* Endorsement Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Endorsement Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">Google Docs Letter</Label>
            <div className="flex items-center gap-2 mt-2">
              <a
                href={endorsement.gdocs_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" className="w-full justify-between">
                  <span className="truncate">{endorsement.gdocs_url}</span>
                  <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0" />
                </Button>
              </a>
            </div>
          </div>

          {endorsement.gforms_submission_url && (
            <div>
              <Label className="text-sm font-semibold">Google Forms Submission</Label>
              <div className="flex items-center gap-2 mt-2">
                <a
                  href={endorsement.gforms_submission_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full justify-between">
                    <span className="truncate">{endorsement.gforms_submission_url}</span>
                    <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0" />
                  </Button>
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold">Drafted</div>
                <div className="text-sm text-gray-600">
                  Created by {endorsement.created_by?.full_name}
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(endorsement.created_at), 'MMM dd, yyyy h:mm a')}
                </div>
              </div>
            </div>

            {endorsement.reviewed_at && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">Reviewed by VP Externals</div>
                  <div className="text-sm text-gray-600">
                    Reviewed by {endorsement.reviewed_by?.full_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(endorsement.reviewed_at), 'MMM dd, yyyy h:mm a')}
                  </div>
                </div>
              </div>
            )}

            {endorsement.submitted_at && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">Submitted to SADO</div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(endorsement.submitted_at), 'MMM dd, yyyy h:mm a')}
                  </div>
                </div>
              </div>
            )}

            {endorsement.approved_at && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">Approved</div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(endorsement.approved_at), 'MMM dd, yyyy h:mm a')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {endorsement.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{endorsement.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Review Section (for VP and Directors) */}
      {canUpdateStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Update Status</CardTitle>
            <CardDescription>
              Update the endorsement status and add review notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Update Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus} disabled={updating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drafted">Drafted</SelectItem>
                  <SelectItem value="vpe_reviewed">VPE Reviewed</SelectItem>
                  <SelectItem value="submitted_to_sado">Submitted to SADO</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Add Review Notes (Optional)</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add comments or feedback..."
                rows={4}
                disabled={updating}
              />
            </div>

            <Button
              onClick={handleStatusUpdate}
              disabled={updating || newStatus === endorsement.status}
              className="w-full"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Event Link */}
      <Card>
        <CardHeader>
          <CardTitle>Related Event</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href={`/events/${endorsement.event_id?.id}`}>
            <Button variant="outline" className="w-full justify-between">
              <span>View Event: {endorsement.event_id?.title}</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
