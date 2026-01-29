'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Users, Clock } from 'lucide-react'

interface Officer {
  id: string
  full_name: string
  email: string
  role: string
}

interface ScheduleEntry {
  id: string
  schedule_id: string
  course_code: string
  course_title: string
  section: string
  units: number
  days: string[]
  time_ranges: string[]
  rooms: string[]
}

interface OfficerSchedule {
  id: string
  user_id: string
  academic_year: string
  semester: string
  user: Officer
  entries: ScheduleEntry[]
}

interface ScheduleCalendarProps {
  schedules: OfficerSchedule[]
  officers: Officer[]
  canViewAll: boolean
}

const DAYS = [
  { code: 'M', name: 'Monday' },
  { code: 'T', name: 'Tuesday' },
  { code: 'W', name: 'Wednesday' },
  { code: 'Th', name: 'Thursday' },
  { code: 'F', name: 'Friday' },
  { code: 'S', name: 'Saturday' }
]

const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
]

export default function ScheduleCalendar({ schedules, officers, canViewAll }: ScheduleCalendarProps) {
  const [selectedOfficer, setSelectedOfficer] = useState<string>('all')
  const [selectedSemester, setSelectedSemester] = useState<string>('all')
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('all')

  // Get unique academic years and semesters
  const academicYears = useMemo(() => 
    [...new Set(schedules.map(s => s.academic_year))],
    [schedules]
  )
  
  const semesters = useMemo(() => 
    [...new Set(schedules.map(s => s.semester))],
    [schedules]
  )

  // Filter schedules based on selections
  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      if (selectedOfficer !== 'all' && schedule.user_id !== selectedOfficer) return false
      if (selectedSemester !== 'all' && schedule.semester !== selectedSemester) return false
      if (selectedAcademicYear !== 'all' && schedule.academic_year !== selectedAcademicYear) return false
      return true
    })
  }, [schedules, selectedOfficer, selectedSemester, selectedAcademicYear])

  // Build calendar data
  const calendarData = useMemo(() => {
    const data: Record<string, Record<string, Array<{
      officer: string
      course: string
      room: string
      color: string
    }>>> = {}

    // Initialize calendar structure
    DAYS.forEach(day => {
      data[day.code] = {}
      TIME_SLOTS.forEach(time => {
        data[day.code][time] = []
      })
    })

    // Colors for different officers
    const colors = [
      'bg-blue-100 border-blue-300 text-blue-800',
      'bg-green-100 border-green-300 text-green-800',
      'bg-purple-100 border-purple-300 text-purple-800',
      'bg-orange-100 border-orange-300 text-orange-800',
      'bg-pink-100 border-pink-300 text-pink-800',
      'bg-yellow-100 border-yellow-300 text-yellow-800',
      'bg-red-100 border-red-300 text-red-800',
      'bg-indigo-100 border-indigo-300 text-indigo-800',
    ]

    const officerColors: Record<string, string> = {}
    let colorIndex = 0

    // Populate calendar with schedule entries
    filteredSchedules.forEach(schedule => {
      // Skip if user data is missing
      if (!schedule.user) return
      
      // Assign color to officer if not already assigned
      if (!officerColors[schedule.user_id]) {
        officerColors[schedule.user_id] = colors[colorIndex % colors.length]
        colorIndex++
      }

      schedule.entries.forEach(entry => {
        entry.days.forEach((day, dayIndex) => {
          const timeRange = entry.time_ranges[dayIndex] || entry.time_ranges[0]
          const room = entry.rooms[dayIndex] || entry.rooms[0] || 'TBD'
          
          // Parse time range (e.g., "15:00:00-16:50:00")
          const [startTime] = timeRange.split('-')
          const startHour = startTime.substring(0, 5) // Get HH:MM

          if (data[day] && data[day][startHour] !== undefined) {
            data[day][startHour].push({
              officer: schedule.user.full_name,
              course: `${entry.course_code}: ${entry.course_title}`,
              room: room,
              color: officerColors[schedule.user_id]
            })
          }
        })
      })
    })

    return data
  }, [filteredSchedules])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Schedule Calendar</span>
          <div className="flex gap-3">
            <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {academicYears.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {semesters.map(sem => (
                  <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Officer" />
              </SelectTrigger>
              <SelectContent>
                {canViewAll && <SelectItem value="all">All Officers</SelectItem>}
                {officers.map(officer => (
                  <SelectItem key={officer.id} value={officer.id}>
                    {officer.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredSchedules.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No schedules found for the selected filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border bg-gray-50 p-2 text-left font-semibold w-24">Time</th>
                  {DAYS.map(day => (
                    <th key={day.code} className="border bg-gray-50 p-2 text-center font-semibold">
                      {day.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map(time => (
                  <tr key={time}>
                    <td className="border bg-gray-50 p-2 text-sm font-medium text-gray-600">
                      {time}
                    </td>
                    {DAYS.map(day => (
                      <td key={`${day.code}-${time}`} className="border p-1 align-top min-w-[180px]">
                        <div className="space-y-1">
                          {calendarData[day.code][time]?.map((item, idx) => (
                            <div
                              key={idx}
                              className={`text-xs p-2 rounded border ${item.color}`}
                            >
                              <div className="font-semibold truncate" title={item.officer}>
                                {item.officer}
                              </div>
                              <div className="truncate" title={item.course}>
                                {item.course}
                              </div>
                              <div className="text-[10px] opacity-80 truncate" title={item.room}>
                                📍 {item.room}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        {filteredSchedules.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Officers:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredSchedules.map(schedule => {
                // Skip schedules without user data
                if (!schedule.user) return null
                
                const colorIndex = filteredSchedules.indexOf(schedule) % 8
                const colors = [
                  'bg-blue-100 text-blue-800 border-blue-300',
                  'bg-green-100 text-green-800 border-green-300',
                  'bg-purple-100 text-purple-800 border-purple-300',
                  'bg-orange-100 text-orange-800 border-orange-300',
                  'bg-pink-100 text-pink-800 border-pink-300',
                  'bg-yellow-100 text-yellow-800 border-yellow-300',
                  'bg-red-100 text-red-800 border-red-300',
                  'bg-indigo-100 text-indigo-800 border-indigo-300',
                ]
                return (
                  <Badge key={schedule.id} className={`${colors[colorIndex]} border`}>
                    {schedule.user.full_name}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
