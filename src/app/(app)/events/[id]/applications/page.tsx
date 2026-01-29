import { getEventApplications } from '@/lib/supabase/queries'
import { EventApplicationsList } from '@/components/event-applications-list'
import { getCurrentUserProfile } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'

interface PageProps {
  params: {
    id: string
  }
}

export const metadata = {
  title: 'Event Applications',
  description: 'View and manage event applications',
}

export default async function EventApplicationsPage({ params }: PageProps) {
  const user = await getCurrentUserProfile()

  // Check if user has permission to view applications
  if (
    !user ||
    !['vp_externals', 'director_partnerships', 'director_sponsorships', 'junior_officer'].includes(
      user.role as string
    )
  ) {
    redirect('/login')
  }

  const applications = await getEventApplications(params.id)

  if (applications.length === 0 && user.role !== 'vp_externals') {
    redirect('/dashboard')
  }

  const eventTitle = applications[0]
    ? `Event Applications`
    : 'No applications found'

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Applications</h1>
          <p className="text-muted-foreground mt-2">
            View and manage participant applications for events
          </p>
        </div>

        {applications.length > 0 ? (
          <EventApplicationsList
            eventTitle={eventTitle}
            applications={applications}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No applications found for this event yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
