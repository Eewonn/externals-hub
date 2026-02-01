import { ApplicationsDashboard } from '@/components/applications-dashboard'
import { getCurrentUserProfile } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Applications Management',
  description: 'View and manage all event applications',
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const params = await searchParams
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

  const initialType = params.type === 'event' || params.type === 'competition' ? params.type : undefined

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all participant applications for endorsed or pending-endorsement events
          </p>
        </div>

        <ApplicationsDashboard initialType={initialType} />
      </div>
    </div>
  )
}
