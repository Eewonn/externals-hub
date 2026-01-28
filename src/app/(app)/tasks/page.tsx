import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'

export default async function TasksPage() {
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

  // Fetch tasks assigned to user or all tasks if VP
  const query = supabase
    .from('tasks')
    .select('*, assigned_to(full_name), assigned_by(full_name)')
    .order('due_date', { ascending: true })

  if (profile?.role !== 'vp_externals') {
    query.eq('assigned_to', user.id)
  }

  const { data: tasks } = await query

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const incompleteTasks = tasks?.filter(t => !t.completed) || []
  const completedTasks = tasks?.filter(t => t.completed) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tasks & Accountability</h1>
        <p className="text-gray-600 mt-1">
          Track assigned tasks and deadlines
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tasks?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Incomplete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{incompleteTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completedTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Incomplete Tasks */}
      {incompleteTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Tasks</h2>
          <div className="space-y-3">
            {incompleteTasks.map((task: any) => (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        {task.description && (
                          <CardDescription className="mt-1">{task.description}</CardDescription>
                        )}
                      </div>
                    </div>
                    <Badge className={`${getPriorityColor(task.priority)} border ml-2`}>
                      {task.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {task.assigned_to?.full_name}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Completed Tasks</h2>
          <div className="space-y-3">
            {completedTasks.map((task: any) => (
              <Card key={task.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <CardTitle className="text-lg line-through">{task.title}</CardTitle>
                        {task.description && (
                          <CardDescription className="mt-1">{task.description}</CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div>Completed: {format(new Date(task.completed_at), 'MMM dd, yyyy')}</div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {task.assigned_to?.full_name}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tasks?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks assigned</h3>
            <p className="text-gray-600">Tasks will appear here when assigned by VP Externals</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
