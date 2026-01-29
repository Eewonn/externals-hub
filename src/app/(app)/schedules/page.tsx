import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Clock } from 'lucide-react'
import { getCurrentUser } from '@/lib/supabase/queries'
import { PERMISSIONS } from '@/lib/auth/permissions'
import ScheduleCalendar from './schedule-calendar'
import ScheduleInputDialog from './schedule-input-dialog'

export default async function SchedulesPage() {
  const authUser = await getCurrentUser()
  
  if (!authUser) {
    redirect('/login')
  }

  const supabase = await createClient()
  
  // Get user profile with role
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', authUser.id)
    .single()
  
  if (!userProfile?.role) {
    redirect('/login')
  }
  
  // Check if user can view all schedules
  const canViewAll = PERMISSIONS.canViewAllSchedules(userProfile.role)
  
  // Fetch officer schedules with user details and entries
  // Filter to only show current user's schedule if they don't have permission to view all
  let schedulesQuery = supabase
    .from('officer_schedules')
    .select(`
      *,
      user:users(id, full_name, email, role),
      entries:schedule_entries(*)
    `)
  
  if (!canViewAll) {
    schedulesQuery = schedulesQuery.eq('user_id', authUser.id)
  }
  
  const { data: schedules } = await schedulesQuery.order('created_at', { ascending: false })

  // Fetch users for the dropdown
  // Only show current user if they don't have permission to view all
  let officersQuery = supabase
    .from('users')
    .select('id, full_name, email, role')
  
  if (!canViewAll) {
    officersQuery = officersQuery.eq('id', authUser.id)
  }
  
  const { data: officers } = await officersQuery.order('full_name')

  // Get unique academic years and semesters
  const academicYears = [...new Set(schedules?.map(s => s.academic_year) || [])]
  const semesters = [...new Set(schedules?.map(s => s.semester) || [])]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Officer Schedules</h1>
          <p className="text-gray-600 mt-1">
            View and manage officer availability
          </p>
        </div>
        <ScheduleInputDialog officers={officers || []} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Schedules</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              {schedules?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Officers with Schedules</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="h-6 w-6 text-green-600" />
              {new Set(schedules?.map(s => s.user_id) || []).size}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Academic Years</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Clock className="h-6 w-6 text-purple-600" />
              {academicYears.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Calendar View */}
      <ScheduleCalendar 
        schedules={schedules || []} 
        officers={officers || []} 
        canViewAll={canViewAll}
      />

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">How to Use</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Click "Add Schedule" to input an officer's class schedule</li>
                <li>The format supports multiple days and times separated by slashes</li>
                <li>Use the calendar view to see when officers are available</li>
                <li>Filter by specific officers to check individual availability</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
