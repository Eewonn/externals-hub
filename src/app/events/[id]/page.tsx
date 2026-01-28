'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Users, Building2, Edit, Trash2, FileText } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

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

      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*, created_by(full_name, email)')
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
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">
                Participants ({event.participant_count || 0})
              </h3>
            </div>
            {event.participant_names && event.participant_names.length > 0 ? (
              <ul className="grid gap-2 md:grid-cols-2">
                {event.participant_names.map((name, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <span className="text-gray-400">•</span>
                    {name}
                  </li>
                ))}
              </ul>
            ) : (
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
