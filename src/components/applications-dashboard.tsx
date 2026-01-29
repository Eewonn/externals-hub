'use client'

import { useEffect, useState } from 'react'
import { EventApplication } from '@/lib/supabase/types'
import { EventApplicationsList } from '@/components/event-applications-list'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EventWithApplications {
  id: string
  title: string
  organizer?: string
  eventDate?: string
  applications: EventApplication[]
}

export function ApplicationsDashboard() {
  const [eventsWithApplications, setEventsWithApplications] = useState<EventWithApplications[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllApplications()
  }, [])

  async function fetchAllApplications() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/applications/all')
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }

      const data = await response.json()
      
      // Group applications by event
      const grouped = (data.applications || []).reduce(
        (acc: Record<string, EventWithApplications>, app: any) => {
          const eventId = app.event_id
          if (!acc[eventId]) {
            acc[eventId] = {
              id: eventId,
              title: app.events?.title || 'Unknown Event',
              organizer: app.events?.organizer,
              eventDate: app.events?.event_date,
              applications: [],
            }
          }
          acc[eventId].applications.push(app)
          return acc
        },
        {}
      )

      setEventsWithApplications(Object.values(grouped))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (eventId: string, eventTitle: string) => {
    const eventApps = eventsWithApplications.find((e) => e.id === eventId)
    if (!eventApps) return

    // Prepare CSV data
    const headers = [
      'Full Name',
      'Student Number',
      'Student Email',
      'ACM Membership Status',
      'Course / Year Level',
      'Date Applied',
    ]

    const rows = eventApps.applications.map((app) => [
      app.full_name,
      app.student_number,
      app.student_email,
      app.acm_membership_status === 'yes'
        ? 'ACM Member'
        : app.acm_membership_status === 'no'
          ? 'Non-Member'
          : 'Unsure',
      app.course_year_level,
      new Date(app.applied_at).toLocaleDateString('en-US'),
    ])

    const csv = [
      [`Event: ${eventTitle}`],
      [`Total Applications: ${eventApps.applications.length}`],
      [`Date Exported: ${new Date().toLocaleDateString('en-US')}`],
      [],
      headers,
      ...rows,
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${eventTitle.replace(/\s+/g, '_')}_applications.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (eventsWithApplications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Applications Yet</CardTitle>
          <CardDescription>
            Applications for events will appear here once participants start applying.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const totalApplications = eventsWithApplications.reduce(
    (sum, event) => sum + event.applications.length,
    0
  )

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Applications Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Applications</p>
              <p className="text-3xl font-bold">{totalApplications}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Events with Applications</p>
              <p className="text-3xl font-bold">{eventsWithApplications.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average per Event</p>
              <p className="text-3xl font-bold">
                {Math.round(totalApplications / eventsWithApplications.length)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications by Event */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Applications by Event</h2>
        {eventsWithApplications.map((event) => (
          <EventApplicationsList
            key={event.id}
            eventTitle={event.title}
            applications={event.applications}
            onExport={() => handleExport(event.id, event.title)}
          />
        ))}
      </div>
    </div>
  )
}
