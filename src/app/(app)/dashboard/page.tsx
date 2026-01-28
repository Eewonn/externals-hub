import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, FileText, Users, CheckSquare } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch user profile with role
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch dashboard statistics
  const [
    { count: eventsCount },
    { count: endorsementsCount },
    { count: partnersCount },
    { count: tasksCount },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('endorsements').select('*', { count: 'exact', head: true }),
    supabase.from('partners').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    {
      title: 'Total Events',
      value: eventsCount || 0,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Endorsements',
      value: endorsementsCount || 0,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Partners',
      value: partnersCount || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Tasks',
      value: tasksCount || 0,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's an overview of the Externals Committee activities
          </p>
        </div>
        <Badge className={`${getRoleBadgeColor(profile?.role || '')} px-4 py-2 text-sm font-semibold`}>
          {formatRole(profile?.role || '')}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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
    </div>
  )
}
