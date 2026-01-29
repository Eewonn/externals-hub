'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Plus, Users, Search, Filter, Trophy, Building2, Award } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

type Participant = {
  id: string
  student_name: string
  year_level: string
  course: string
}

type Event = {
  id: string
  title: string
  description: string
  event_date: string
  event_type: string
  status: string
  school_associate: string
  participant_count: number | null
  created_by: { full_name: string } | null
  // Competition-specific fields
  category?: string | null
  nature?: string | null
  organizer?: string | null
  rank_award?: string | null
  group_name?: string | null
  competition_number?: number | null
  participants?: Participant[]
}

export default function EventsList({ events, canCreate }: { events: Event[]; canCreate: boolean }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const getCategoryBadge = (category: string | null | undefined) => {
    if (!category) return null
    const labels = {
      local_regional: 'Local - Regional',
      local_national: 'Local - National',
      international: 'International'
    }
    return labels[category as keyof typeof labels] || category
  }

  const getNatureBadge = (nature: string | null | undefined) => {
    if (!nature) return null
    const labels = {
      academic: 'Academic',
      non_academic: 'Non-Academic'
    }
    return labels[nature as keyof typeof labels] || nature
  }

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

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.school_associate.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter
      const matchesType = typeFilter === 'all' || event.event_type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [events, searchQuery, statusFilter, typeFilter])

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first event</p>
          {canCreate && (
            <Link href="/events/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <div className="flex gap-4 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events by title, description, or school..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="competition">Competition</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-gray-600 pt-2">
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </CardHeader>
      </Card>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2 gap-2 flex-wrap">
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={`${getTypeColor(event.event_type)} border`}>
                        {event.event_type}
                      </Badge>
                      {event.category && (
                        <Badge variant="outline" className="text-xs">
                          {getCategoryBadge(event.category)}
                        </Badge>
                      )}
                      {event.nature && (
                        <Badge variant="outline" className="text-xs">
                          {getNatureBadge(event.nature)}
                        </Badge>
                      )}
                    </div>
                    <Badge className={`${getStatusColor(event.status)} border`}>
                      {event.status}
                    </Badge>
                  </div>
                  {event.competition_number && (
                    <div className="text-xs text-gray-500 mb-1">
                      Competition #{event.competition_number}
                    </div>
                  )}
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  {event.group_name && (
                    <div className="text-sm font-medium text-gray-700 mt-1">
                      Team: {event.group_name}
                    </div>
                  )}
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.organizer && (
                    <div className="flex items-start text-sm text-gray-600">
                      <Building2 className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{event.organizer}</span>
                    </div>
                  )}
                  {event.rank_award && event.rank_award !== 'None' && (
                    <div className="flex items-center text-sm text-gray-900 font-semibold">
                      <Award className="mr-2 h-4 w-4 text-yellow-600" />
                      {event.rank_award}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(event.event_date), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="mr-2 h-4 w-4" />
                    {event.participants?.length || event.participant_count || 0} participant{(event.participants?.length || event.participant_count) !== 1 ? 's' : ''}
                  </div>
                  {event.participants && event.participants.length > 0 && (
                    <div className="text-xs text-gray-600 pt-2 border-t">
                      <div className="font-medium mb-1">Participants:</div>
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {event.participants.slice(0, 3).map((p) => (
                          <div key={p.id} className="text-xs">
                            {p.student_name} ({p.year_level} {p.course})
                          </div>
                        ))}
                        {event.participants.length > 3 && (
                          <div className="text-xs text-gray-500 italic">
                            +{event.participants.length - 3} more...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </>
  )
}
