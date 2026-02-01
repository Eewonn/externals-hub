'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Plus, Users, Search, Filter, Trophy, Building2, Award, Download } from 'lucide-react'
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

export default function EventsList({ events, canCreate, initialType }: { events: Event[]; canCreate: boolean; initialType?: string }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>(initialType || 'all')
  const [sortOrder, setSortOrder] = useState<string>('newest')

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

  const exportToCSV = () => {
    // Define CSV headers
    const headers = [
      'Name',
      'Type',
      'Category',
      'Nature',
      'Organizer',
      'Award/Rank',
      'Date',
      'Group',
      'Status',
      'Participants',
      'Description'
    ]

    // Map events to CSV rows
    const rows = filteredEvents.map(event => {
      // Get all participant names
      const participantNames = event.participants?.map(p => 
        `${p.student_name} (${p.year_level} ${p.course})`
      ).join('; ') || ''

      return [
        event.title,
        event.event_type,
        event.category ? getCategoryBadge(event.category) : '',
        event.nature ? getNatureBadge(event.nature) : '',
        event.organizer || '',
        event.rank_award && event.rank_award !== 'None' ? event.rank_award : '',
        format(new Date(event.event_date), 'MMM dd, yyyy'),
        event.group_name || '',
        event.status,
        participantNames,
        event.description.replace(/,/g, ';') // Replace commas to avoid CSV issues
      ]
    })

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `events_competitions_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
    }).sort((a, b) => {
      const dateA = new Date(a.event_date).getTime()
      const dateB = new Date(b.event_date).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })
  }, [events, searchQuery, statusFilter, typeFilter, sortOrder])

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <CardTitle>Search & Filter</CardTitle>
            <Button 
              onClick={exportToCSV} 
              variant="outline"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Export to CSV
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events by title, description, or school..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
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
          </div>
          <p className="text-sm text-gray-600 pt-2">
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </CardHeader>
      </Card>

      {/* Events Table */}
      {filteredEvents.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6 py-3">Name</TableHead>
                    <TableHead className="px-6 py-3">Category/Nature</TableHead>
                    <TableHead className="px-6 py-3">Organizer</TableHead>
                    <TableHead className="px-6 py-3">Award/Rank</TableHead>
                    <TableHead className="px-6 py-3">Date</TableHead>
                    <TableHead className="px-6 py-3">Group</TableHead>
                    <TableHead className="text-center px-6 py-3">Participants</TableHead>
                    <TableHead className="px-6 py-3">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event, index) => (
                    <TableRow key={event.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell className="px-6 py-4">
                        <Link href={`/events/${event.id}`} className="hover:underline">
                          <div className="flex items-start gap-2">
                            <div>
                              <div className="font-semibold text-gray-900 mb-1">
                                {event.title}
                              </div>
                              <Badge className={`${getTypeColor(event.event_type)} border text-xs`}>
                                {event.event_type}
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="space-y-1">
                          {event.category && (
                            <Badge variant="outline" className="text-xs mr-1">
                              {getCategoryBadge(event.category)}
                            </Badge>
                          )}
                          {event.nature && (
                            <Badge variant="outline" className="text-xs">
                              {getNatureBadge(event.nature)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs line-clamp-2">
                          {event.organizer || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {event.rank_award && event.rank_award !== 'None' ? (
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                            <span className="text-sm font-semibold text-gray-900">
                              {event.rank_award}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 px-6 py-4">
                        {format(new Date(event.event_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {event.group_name || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="max-w-xs">
                          {event.participants && event.participants.length > 0 ? (
                            <div className="text-sm text-gray-600">
                              {event.participants.slice(0, 2).map((p, idx) => (
                                <div key={p.id}>
                                  {p.student_name}
                                </div>
                              ))}
                              {event.participants.length > 2 && (
                                <div className="text-xs text-gray-500 italic">
                                  +{event.participants.length - 2} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge className={`${getStatusColor(event.status)} border`}>
                          {event.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
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
