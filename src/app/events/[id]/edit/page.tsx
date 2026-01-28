'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X, Plus } from 'lucide-react'

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'event' as 'event' | 'competition',
    school_associate: '',
    event_date: '',
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
  })
  
  const [participantNames, setParticipantNames] = useState<string[]>([''])
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    fetchEvent()
  }, [params.id])

  const fetchEvent = async () => {
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

      // Fetch event
      const { data: event, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', params.id)
        .single()

      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return
      }

      setFormData({
        title: event.title,
        description: event.description,
        event_type: event.event_type,
        school_associate: event.school_associate,
        event_date: event.event_date,
        status: event.status,
      })

      setParticipantNames(
        event.participant_names && event.participant_names.length > 0 
          ? event.participant_names 
          : ['']
      )

      setLoading(false)
    } catch (err) {
      setError('Failed to load event')
      setLoading(false)
    }
  }

  const addParticipant = () => {
    setParticipantNames([...participantNames, ''])
  }

  const removeParticipant = (index: number) => {
    setParticipantNames(participantNames.filter((_, i) => i !== index))
  }

  const updateParticipant = (index: number, value: string) => {
    const updated = [...participantNames]
    updated[index] = value
    setParticipantNames(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // Filter out empty participant names
      const validParticipants = participantNames.filter(name => name.trim() !== '')

      const { error: updateError } = await supabase
        .from('events')
        .update({
          ...formData,
          participant_names: validParticipants,
        })
        .eq('id', params.id)

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }

      router.push(`/events/${params.id}`)
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading event...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-gray-600 mt-1">
          Update event information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Modify the event information as needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={saving}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
                disabled={saving}
              />
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <Label htmlFor="event_type">Event Type *</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value: 'event' | 'competition') => 
                  setFormData({ ...formData, event_type: value })
                }
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="competition">Competition</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            {userRole === 'vp_externals' && (
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => 
                    setFormData({ ...formData, status: value })
                  }
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* School Associate */}
            <div className="space-y-2">
              <Label htmlFor="school_associate">School/Organization *</Label>
              <Input
                id="school_associate"
                value={formData.school_associate}
                onChange={(e) => setFormData({ ...formData, school_associate: e.target.value })}
                required
                disabled={saving}
              />
            </div>

            {/* Event Date */}
            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date *</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
                disabled={saving}
              />
            </div>

            {/* Participant Names */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Participant Names</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addParticipant}
                  disabled={saving}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Participant
                </Button>
              </div>
              <div className="space-y-2">
                {participantNames.map((name, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={name}
                      onChange={(e) => updateParticipant(index, e.target.value)}
                      placeholder={`Participant ${index + 1} name`}
                      disabled={saving}
                    />
                    {participantNames.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeParticipant(index)}
                        disabled={saving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
