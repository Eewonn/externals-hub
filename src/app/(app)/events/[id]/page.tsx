'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Users, Building2, Edit, Trash2, FileText, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface Participant {
  id: string
  student_name: string
  year_level: string
  course: string
}

interface GuestApplication {
  id: string
  full_name: string
  student_number: string
  student_email: string
  acm_membership_status: string
  course_year_level: string
  applied_at: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: { full_name: string }
  reviewed_at?: string
}

interface Event {
  id: string
  title: string
  description: string
  event_type: string
  school_associate: string
  participant_names: string[]
  participant_count: number
  event_date: string
  status: string
  created_by: any
  created_at: string
  updated_at: string
  // Competition fields
  category?: string
  nature?: string
  organizer?: string
  rank_award?: string
  group_name?: string
  competition_number?: number
  participants?: Participant[]
  event_applications?: GuestApplication[]
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [endorsement, setEndorsement] = useState<any>(null)

  useEffect(() => {
    fetchEventDetails()
  }, [params.id])

  const fetchEventDetails = async () => {
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

      // Fetch event details with participants and guest applications
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          created_by:users(full_name, email),
          participants:competition_participants(
            id,
            student_name,
            year_level,
            course
          ),
          event_applications(
            id,
            full_name,
            student_number,
            student_email,
            acm_membership_status,
            course_year_level,
            applied_at,
            status,
            reviewed_by:users(full_name),
            reviewed_at
          )
        `)
        .eq('id', params.id)
        .single()

      if (eventError) {
        setError(eventError.message)
        setLoading(false)
        return
      }

      setEvent(eventData)

      // Fetch endorsement if exists
      const { data: endorsementData } = await supabase
        .from('endorsements')
        .select('*')
        .eq('event_id', params.id)
        .single()

      setEndorsement(endorsementData)
      setLoading(false)
    } catch (err) {
      setError('Failed to load event details')
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', params.id)

      if (deleteError) {
        alert('Failed to delete event: ' + deleteError.message)
        return
      }

      router.push('/events')
      router.refresh()
    } catch (err) {
      alert('An unexpected error occurred')
    }
  }

  const handleApprove = async (applicationId: string) => {
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

      // Refresh the page to show updated status
      fetchEventDetails()
    } catch (err) {
      alert('An unexpected error occurred')
    }
  }

  const handleReject = async (applicationId: string) => {
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

      // Refresh the page to show updated status
      fetchEventDetails()
    } catch (err) {
      alert('An unexpected error occurred')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'competition' 
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : 'bg-orange-100 text-orange-800 border-orange-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading event details...</div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="max-w-3xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Event not found'}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const canEdit = userRole === 'vp_externals' || 
    (userRole === 'junior_officer' && event.created_by?.id === event.created_by)
  const canDelete = userRole === 'vp_externals'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge className={`${getTypeColor(event.event_type)} border`}>
              {event.event_type}
            </Badge>
            <Badge className={`${getStatusColor(event.status)} border`}>
              {event.status}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Link href={`/events/${event.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          )}
          {canDelete && (
            <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Event Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <div className="font-semibold text-gray-900">Event Date</div>
                <div className="text-gray-700">
                  {format(new Date(event.event_date), 'MMMM dd, yyyy')}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <div className="font-semibold text-gray-900">School/Organization</div>
                <div className="text-gray-700">{event.school_associate}</div>
              </div>
            </div>

            {event.organizer && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900">Organizer</div>
                  <div className="text-gray-700">{event.organizer}</div>
                </div>
              </div>
            )}

            {(event.category || event.nature) && (
              <div className="flex items-start gap-6">
                {event.category && (
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Category</div>
                    <Badge variant="outline">
                      {event.category.replace('_', ' - ').replace('local', 'Local').replace('regional', 'Regional').replace('national', 'National')}
                    </Badge>
                  </div>
                )}
                {event.nature && (
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Nature</div>
                    <Badge variant="outline">
                      {event.nature.replace('_', '-').replace('academic', 'Academic').replace('non', 'Non')}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {event.group_name && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900">Group/Team</div>
                  <div className="text-gray-700">{event.group_name}</div>
                </div>
              </div>
            )}

            {event.rank_award && event.rank_award !== 'None' && (
              <div className="flex items-start gap-3">
                <div>
                  <div className="font-semibold text-gray-900">Award/Rank</div>
                  <div className="text-gray-900 font-semibold flex items-center gap-2">
                    🏆 {event.rank_award}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">
                Participants ({(event.participants?.length || 0) + (event.event_applications?.length || 0)})
              </h3>
            </div>
            
            {/* Competition Participants */}
            {event.participants && event.participants.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Competition Participants</h4>
                <ul className="grid gap-2 md:grid-cols-2">
                  {event.participants.map((participant) => (
                    <li key={participant.id} className="flex items-center gap-2 text-gray-700">
                      <span className="text-gray-400">•</span>
                      {participant.student_name} ({participant.year_level} {participant.course})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Guest Applications */}
            {event.event_applications && event.event_applications.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Guest Applications</h4>
                <div className="space-y-3">
                  {event.event_applications.map((application) => {
                    const canReview = userRole === 'vp_externals' || 
                                     userRole === 'director_partnerships' || 
                                     userRole === 'director_sponsorships'
                    
                    const getStatusBadge = () => {
                      switch (application.status) {
                        case 'approved':
                          return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
                        case 'rejected':
                          return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
                        default:
                          return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                      }
                    }

                    return (
                      <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{application.full_name}</span>
                            {getStatusBadge()}
                          </div>
                          <p className="text-sm text-gray-600">{application.course_year_level}</p>
                          <p className="text-xs text-gray-500">{application.student_email}</p>
                          {application.reviewed_by && (
                            <p className="text-xs text-gray-500 mt-1">
                              Reviewed by {application.reviewed_by.full_name} on {format(new Date(application.reviewed_at!), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                        {canReview && application.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
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
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {(!event.participants || event.participants.length === 0) && 
             (!event.event_applications || event.event_applications.length === 0) && (
              <p className="text-gray-600 italic">No participants listed yet</p>
            )}
          </div>

          <Separator />

          <div className="text-sm text-gray-600">
            <div>Created by: {event.created_by?.full_name || 'Unknown'}</div>
            <div>Created on: {format(new Date(event.created_at), 'MMM dd, yyyy')}</div>
            {event.updated_at !== event.created_at && (
              <div>Last updated: {format(new Date(event.updated_at), 'MMM dd, yyyy')}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Endorsement Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Endorsement Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {endorsement ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Status:</span>
                <Badge>{endorsement.status.replace('_', ' ')}</Badge>
              </div>
              <Link href={`/endorsements/${endorsement.id}`}>
                <Button variant="outline" className="w-full">
                  View Endorsement Details
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">No endorsement submitted yet</p>
              {(userRole === 'vp_externals' || userRole === 'junior_officer') && (
                <Link href={`/endorsements/new?event_id=${event.id}`}>
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Submit Endorsement
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
