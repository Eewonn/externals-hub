'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X, Plus } from 'lucide-react'

export default function NewEventPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'event' as 'event' | 'competition',
    school_associate: '',
    event_date: '',
  })
  
  const [participantNames, setParticipantNames] = useState<string[]>([''])

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
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be logged in to create an event')
        setLoading(false)
        return
      }

      // Filter out empty participant names
      const validParticipants = participantNames.filter(name => name.trim() !== '')

      const { data, error: insertError } = await supabase
        .from('events')
        .insert({
          ...formData,
          participant_names: validParticipants,
          created_by: user.id,
          status: 'upcoming',
        })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }

      router.push(`/events/${data.id}`)
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-600 mt-1">
          Add a new competition or event to the system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Fill in the information about the event or competition
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
                placeholder="e.g., National Programming Competition 2026"
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide details about the event..."
                rows={4}
                required
                disabled={loading}
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
                disabled={loading}
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

            {/* School Associate */}
            <div className="space-y-2">
              <Label htmlFor="school_associate">School/Organization *</Label>
              <Input
                id="school_associate"
                value={formData.school_associate}
                onChange={(e) => setFormData({ ...formData, school_associate: e.target.value })}
                placeholder="e.g., University of the Philippines"
                required
                disabled={loading}
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
                disabled={loading}
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
                  disabled={loading}
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
                      disabled={loading}
                    />
                    {participantNames.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeParticipant(index)}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Add the names of participants. Leave blank if not yet determined.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
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
