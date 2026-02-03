'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExternalLink } from 'lucide-react'

export default function NewEndorsementPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    event_id: searchParams.get('event_id') || '',
    gdrive_link: '',
    notes: '',
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      // Fetch events that don't have endorsements yet
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title, event_date, event_type')
        .order('event_date', { ascending: false })

      if (eventsData) {
        // Filter out events that already have endorsements
        const { data: endorsements } = await supabase
          .from('endorsements')
          .select('event_id')

        const endorsedEventIds = new Set(endorsements?.map(e => e.event_id) || [])
        const availableEvents = eventsData.filter(e => !endorsedEventIds.has(e.id))
        
        setEvents(availableEvents)
      }
    } catch (err) {
      console.error('Error fetching events:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be logged in to submit an endorsement')
        setLoading(false)
        return
      }

      // Validate Google Drive URL
      if (!formData.gdrive_link.includes('drive.google.com')) {
        setError('Please provide a valid Google Drive URL')
        setLoading(false)
        return
      }

      const { data, error: insertError } = await supabase
        .from('endorsements')
        .insert({
          event_id: formData.event_id,
          gdrive_link: formData.gdrive_link,
          notes: formData.notes || null,
          created_by: user.id,
          status: 'drafted',
        })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }

      router.push(`/endorsements/${data.id}`)
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Submit Endorsement</h1>
        <p className="text-gray-600 mt-1">
          Submit an endorsement letter for review
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Endorsement Details</CardTitle>
          <CardDescription>
            Provide link to your Google Drive folder containing endorsement documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Event Selection */}
            <div className="space-y-2">
              <Label htmlFor="event_id">Select Event *</Label>
              <Select
                value={formData.event_id}
                onValueChange={(value) => setFormData({ ...formData, event_id: value })}
                disabled={loading || !!searchParams.get('event_id')}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event..." />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} ({event.event_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {events.length === 0 && (
                <p className="text-sm text-gray-600">
                  No events available. All events already have endorsements or no events exist.
                </p>
              )}
            </div>

            {/* Google Drive Link */}
            <div className="space-y-2">
              <Label htmlFor="gdrive_link">Google Drive Link *</Label>
              <div className="flex gap-2">
                <Input
                  id="gdrive_link"
                  type="url"
                  value={formData.gdrive_link}
                  onChange={(e) => setFormData({ ...formData, gdrive_link: e.target.value })}
                  placeholder="https://drive.google.com/drive/folders/..."
                  required
                  disabled={loading}
                  className="flex-1"
                />
                {formData.gdrive_link && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(formData.gdrive_link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Link to your Google Drive folder containing all endorsement documents. Make sure sharing is enabled.
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes or comments..."
                rows={4}
                disabled={loading}
              />
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertDescription>
                <strong>Important:</strong> Make sure your Google Drive folder has proper sharing permissions 
                (at least "Anyone with the link can view") so reviewers can access the endorsement documents.
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-gray-900 hover:bg-gray-800 text-white"
                disabled={loading || events.length === 0}
              >
                {loading ? 'Submitting...' : 'Submit for Review'}
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
