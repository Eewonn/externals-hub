import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import EventsList from './events-list'

export default async function EventsPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch all events with participants
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      created_by:users(full_name),
      participants:competition_participants(
        id,
        student_name,
        year_level,
        course
      )
    `)
    .order('event_date', { ascending: false })

  const canCreate = profile?.role === 'vp_externals' || profile?.role === 'junior_officer'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events & Competitions</h1>
          <p className="text-gray-600 mt-1">
            Manage all events and competitions
          </p>
        </div>
        {canCreate && (
          <Link href="/events/new">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        )}
      </div>

      {/* Events List */}
      <EventsList events={events || []} canCreate={canCreate} />
    </div>
  )
}
