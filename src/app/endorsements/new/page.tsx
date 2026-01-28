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
    gdocs_url: '',
    gforms_submission_url: '',
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

      // Validate Google Docs URL
      if (!formData.gdocs_url.includes('docs.google.com')) {
        setError('Please provide a valid Google Docs URL')
        setLoading(false)
        return
      }

      const { data, error: insertError } = await supabase
        .from('endorsements')
        .insert({
          event_id: formData.event_id,
          gdocs_url: formData.gdocs_url,
          gforms_submission_url: formData.gforms_submission_url || null,
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
            Provide links to your Google Docs endorsement letter and Google Forms submission
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

            {/* Google Docs URL */}
            <div className="space-y-2">
              <Label htmlFor="gdocs_url">Google Docs Letter URL *</Label>
              <div className="flex gap-2">
                <Input
                  id="gdocs_url"
                  type="url"
                  value={formData.gdocs_url}
                  onChange={(e) => setFormData({ ...formData, gdocs_url: e.target.value })}
                  placeholder="https://docs.google.com/document/d/..."
                  required
                  disabled={loading}
                  className="flex-1"
                />
                {formData.gdocs_url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(formData.gdocs_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Link to your endorsement letter in Google Docs. Make sure sharing is enabled.
              </p>
            </div>

            {/* Google Forms Submission URL */}
            <div className="space-y-2">
              <Label htmlFor="gforms_submission_url">Google Forms Submission URL (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="gforms_submission_url"
                  type="url"
                  value={formData.gforms_submission_url}
                  onChange={(e) => setFormData({ ...formData, gforms_submission_url: e.target.value })}
                  placeholder="https://docs.google.com/forms/d/..."
                  disabled={loading}
                  className="flex-1"
                />
                {formData.gforms_submission_url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(formData.gforms_submission_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Optional link to Google Forms submission if applicable.
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
                <strong>Important:</strong> Make sure your Google Docs link has proper sharing permissions 
                (at least "Anyone with the link can view") so reviewers can access the endorsement letter.
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
