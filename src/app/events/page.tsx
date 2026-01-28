import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, Users } from 'lucide-react'
import { format } from 'date-fns'

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

  // Fetch all events
  const { data: events, error } = await supabase
    .from('events')
    .select('*, created_by(full_name)')
    .order('event_date', { ascending: false })

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
        {(profile?.role === 'vp_externals' || profile?.role === 'junior_officer') && (
          <Link href="/events/new">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        )}
      </div>

      {/* Events Grid */}
      {!events || events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first event</p>
            {(profile?.role === 'vp_externals' || profile?.role === 'junior_officer') && (
              <Link href="/events/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event: any) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`${getTypeColor(event.event_type)} border`}>
                      {event.event_type}
                    </Badge>
                    <Badge className={`${getStatusColor(event.status)} border`}>
                      {event.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(event.event_date), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="mr-2 h-4 w-4" />
                    {event.participant_count || 0} participant{event.participant_count !== 1 ? 's' : ''}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">School:</span> {event.school_associate}
                  </div>
                  {event.created_by && (
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Created by {event.created_by.full_name}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
