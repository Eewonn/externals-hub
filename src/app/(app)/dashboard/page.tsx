import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, FileText, Users, CheckSquare, Clock, AlertCircle } from 'lucide-react'
import { getCurrentUser, getCurrentUserProfile, getDashboardStats, getApplicationStats } from '@/lib/supabase/queries'
import Link from 'next/link'
import { format } from 'date-fns'

// Revalidate every 60 seconds for dashboard stats
export const revalidate = 60

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Fetch profile, stats, application stats, and tasks in parallel
  const [profile, stats, appStats, { data: recentTasks }, { data: upcomingTasks }] = await Promise.all([
    getCurrentUserProfile(),
    getDashboardStats(),
    getApplicationStats(),
    supabase
      .from('tasks')
      .select('id, title, status, deadline, assigned_to:users!tasks_assigned_to_fkey(full_name), event:events(title), partner:partners(organization_name)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('tasks')
      .select('id, title, status, deadline, assigned_to:users!tasks_assigned_to_fkey(full_name)')
      .in('status', ['pending', 'ongoing'])
      .gte('deadline', new Date().toISOString().split('T')[0])
      .order('deadline', { ascending: true })
      .limit(5)
  ])

  const statsCards = [
    {
      title: 'Total Events',
      value: stats.eventsCount,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Endorsements',
      value: stats.endorsementsCount,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Partners',
      value: stats.partnersCount,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Applications',
      value: appStats.total_applications,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Active Tasks',
      value: stats.tasksCount,
      icon: CheckSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'vp_externals':
        return 'bg-gray-900 text-white'
      case 'director_partnerships':
      case 'director_sponsorships':
        return 'bg-gray-700 text-white'
      case 'junior_officer':
        return 'bg-gray-600 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const formatRole = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Pending</Badge>
      case 'ongoing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>
      case 'blocked':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Blocked</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Here's an overview of the Externals Committee activities
          </p>
        </div>
        <Badge className={`${getRoleBadgeColor(profile?.role || '')} px-4 py-2 text-sm font-semibold w-fit`}>
          {formatRole(profile?.role || '')}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-5">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <a
              href="/events/new"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                  Create Event
                </div>
                <div className="text-sm text-gray-600">
                  Add a new competition or event
                </div>
              </div>
            </a>
            
            <a
              href="/endorsements/new"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
            >
              <FileText className="h-6 w-6 text-purple-600" />
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-purple-600">
                  Submit Endorsement
                </div>
                <div className="text-sm text-gray-600">
                  Submit an endorsement letter
                </div>
              </div>
            </a>
            
            <a
              href="/partners/new"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <Users className="h-6 w-6 text-green-600" />
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-green-600">
                  Add Partner
                </div>
                <div className="text-sm text-gray-600">
                  Register a new partner or sponsor
                </div>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>Latest tasks across all members</CardDescription>
              </div>
              <Link href="/tasks">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTasks && recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.map((task: any) => (
                  <div key={task.id} className="flex items-start justify-between gap-3 pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {task.title}
                        </p>
                        {getStatusBadge(task.status)}
                      </div>
                      <p className="text-xs text-gray-600">
                        Assigned to: {task.assigned_to?.full_name || 'Unknown'}
                      </p>
                      {task.event && (
                        <p className="text-xs text-gray-500">Event: {task.event.title}</p>
                      )}
                      {task.partner && (
                        <p className="text-xs text-gray-500">Partner: {task.partner.organization_name}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className={`flex items-center gap-1 text-xs ${isOverdue(task.deadline) && task.status !== 'completed' ? 'text-red-600' : 'text-gray-600'}`}>
                        <Clock className="h-3 w-3" />
                        {format(new Date(task.deadline), 'MMM dd')}
                      </div>
                      {isOverdue(task.deadline) && task.status !== 'completed' && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckSquare className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium">No tasks yet</p>
                <p className="text-gray-500 text-sm mt-1">Create your first task to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Tasks due soon</CardDescription>
              </div>
              <Link href="/tasks">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingTasks && upcomingTasks.length > 0 ? (
              <div className="space-y-4">
                {upcomingTasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between gap-3 pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {task.title}
                        </p>
                        {getStatusBadge(task.status)}
                      </div>
                      <p className="text-xs text-gray-600">
                        Assigned to: {task.assigned_to?.full_name || 'Unknown'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(task.deadline), 'MMM dd, yyyy')}
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium">No upcoming deadlines</p>
                <p className="text-gray-500 text-sm mt-1">All caught up!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
