import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, ListTodo } from 'lucide-react'
import Link from 'next/link'
import { TaskStatus } from '@/lib/supabase/types'
import TaskBoard from './task-board'
import CreateTaskDialog from './create-task-dialog'

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

  const canAssignTasks = profile?.role === 'vp_externals' || 
                         profile?.role === 'director_partnerships' || 
                         profile?.role === 'director_sponsorships'

  // Fetch all users for assignment dropdown
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, full_name, role')
    .order('full_name')

  // Fetch tasks with user details
  const query = supabase
    .from('tasks')
    .select(`
      *,
      assigned_to_user:users!tasks_assigned_to_fkey(id, full_name, email, role),
      created_by_user:users!tasks_created_by_fkey(id, full_name),
      event:events(id, title),
      partner:partners(id, name)
    `)
    .order('deadline', { ascending: true })

  // If not VP or Director, only show tasks assigned to them
  if (!canAssignTasks) {
    query.eq('assigned_to', user.id)
  }

  const { data: tasks } = await query

  // Group tasks by status
  const tasksByStatus = {
    pending: tasks?.filter(t => t.status === 'pending') || [],
    ongoing: tasks?.filter(t => t.status === 'ongoing') || [],
    completed: tasks?.filter(t => t.status === 'completed') || [],
    blocked: tasks?.filter(t => t.status === 'blocked') || [],
  }

  const totalTasks = tasks?.length || 0
  const completedCount = tasksByStatus.completed.length
  const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks & Accountability</h1>
          <p className="text-gray-600 mt-1">
            {canAssignTasks 
              ? 'Manage and assign tasks to team members' 
              : 'Track your assigned tasks and deadlines'}
          </p>
        </div>
        {canAssignTasks && (
          <CreateTaskDialog users={allUsers || []} currentUserId={user.id} />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tasks</CardDescription>
            <CardTitle className="text-3xl">{totalTasks}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-gray-600">{tasksByStatus.pending.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{tasksByStatus.ongoing.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{tasksByStatus.completed.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      {totalTasks > 0 ? (
        <TaskBoard 
          tasksByStatus={tasksByStatus} 
          canAssignTasks={canAssignTasks}
          currentUserId={user.id}
          allUsers={allUsers || []}
        />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ListTodo className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600 mb-4">
              {canAssignTasks 
                ? 'Get started by creating your first task' 
                : 'Tasks will appear here when assigned to you'}
            </p>
            {canAssignTasks && (
              <CreateTaskDialog users={allUsers || []} currentUserId={user.id} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
