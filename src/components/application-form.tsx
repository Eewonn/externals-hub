'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface Event {
  id: string
  title: string
  eventDate: string
  organizer: string
  status: string
}

export function ApplicationForm() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    eventId: '',
    fullName: '',
    studentNumber: '',
    studentEmail: '',
    acmMembershipStatus: '',
    courseYearLevel: '',
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      setLoading(true)
      const response = await fetch('/api/applications')
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      setEvents(data.events)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage('Failed to load events. Please try again later.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to submit application')
        return
      }

      setSuccessMessage('Application submitted successfully! Thank you for your interest.')
      setFormData({
        eventId: '',
        fullName: '',
        studentNumber: '',
        studentEmail: '',
        acmMembershipStatus: '',
        courseYearLevel: '',
      })

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Application</CardTitle>
        <CardDescription>
          Apply to participate in ACM endorsed or pending-endorsement events and competitions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
          </Alert>
        )}

        {events.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No events are currently available for applications. Please check back later.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Selection */}
            <div>
              <Label htmlFor="eventId">Select Event or Competition *</Label>
              <Select value={formData.eventId} onValueChange={handleSelectChange('eventId')}>
                <SelectTrigger id="eventId">
                  <SelectValue placeholder="Choose an event..." />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} ({event.organizer})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Only endorsed or pending-endorsement events are shown
              </p>
            </div>

            {/* Full Name */}
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Juan dela Cruz"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Student Number */}
            <div>
              <Label htmlFor="studentNumber">Student Number *</Label>
              <Input
                id="studentNumber"
                name="studentNumber"
                type="text"
                placeholder="2021-12345"
                value={formData.studentNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Student Email */}
            <div>
              <Label htmlFor="studentEmail">Student Email *</Label>
              <Input
                id="studentEmail"
                name="studentEmail"
                type="email"
                placeholder="your.email@student.edu.ph"
                value={formData.studentEmail}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* ACM Membership Status */}
            <div>
              <Label htmlFor="acmMembership">ACM Membership Status *</Label>
              <Select
                value={formData.acmMembershipStatus}
                onValueChange={handleSelectChange('acmMembershipStatus')}
              >
                <SelectTrigger id="acmMembership">
                  <SelectValue placeholder="Select your membership status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes, I am an ACM member</SelectItem>
                  <SelectItem value="no">No, I am not an ACM member</SelectItem>
                  <SelectItem value="not_sure">Not sure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Course / Year Level */}
            <div>
              <Label htmlFor="courseYearLevel">Course / Year Level *</Label>
              <Input
                id="courseYearLevel"
                name="courseYearLevel"
                type="text"
                placeholder="e.g., BS Computer Science - 3rd Year"
                value={formData.courseYearLevel}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </form>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          * indicates required fields. Your information will be used solely for event coordination and
          endorsement purposes.
        </p>
      </CardContent>
    </Card>
  )
}
