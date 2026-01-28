'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { TaskStatus } from '@/lib/supabase/types'
import TaskCard from './task-card'
import { Clock, Play, CheckCircle2, AlertCircle, Search } from 'lucide-react'

interface TaskBoardProps {
  tasksByStatus: {
    pending: any[]
    ongoing: any[]
    completed: any[]
    blocked: any[]
  }
  canAssignTasks: boolean
  currentUserId: string
  allUsers: any[]
}

export default function TaskBoard({ tasksByStatus, canAssignTasks, currentUserId, allUsers }: TaskBoardProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter tasks based on search query
  const filteredTasksByStatus = useMemo(() => {
    if (!searchQuery.trim()) {
      return tasksByStatus
    }

    const filterTasks = (tasks: any[]) => 
      tasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assigned_to?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )

    return {
      pending: filterTasks(tasksByStatus.pending),
      ongoing: filterTasks(tasksByStatus.ongoing),
      completed: filterTasks(tasksByStatus.completed),
      blocked: filterTasks(tasksByStatus.blocked),
    }
  }, [tasksByStatus, searchQuery])

  // Memoize column configuration
  const columns = useMemo(() => [
    {
      id: 'pending' as TaskStatus,
      title: 'Pending',
      tasks: filteredTasksByStatus.pending,
      icon: Clock,
      color: 'bg-gray-100 border-gray-300',
      badgeColor: 'bg-gray-500',
    },
    {
      id: 'ongoing' as TaskStatus,
      title: 'In Progress',
      tasks: filteredTasksByStatus.ongoing,
      icon: Play,
      color: 'bg-blue-50 border-blue-300',
      badgeColor: 'bg-blue-500',
    },
    {
      id: 'completed' as TaskStatus,
      title: 'Completed',
      tasks: filteredTasksByStatus.completed,
      icon: CheckCircle2,
      color: 'bg-green-50 border-green-300',
      badgeColor: 'bg-green-500',
    },
    {
      id: 'blocked' as TaskStatus,
      title: 'Blocked',
      tasks: filteredTasksByStatus.blocked,
      icon: AlertCircle,
      color: 'bg-red-50 border-red-300',
      badgeColor: 'bg-red-500',
    },
  ], [filteredTasksByStatus])

  const totalTasks = tasksByStatus.pending.length + tasksByStatus.ongoing.length + 
                     tasksByStatus.completed.length + tasksByStatus.blocked.length
  const filteredTotal = filteredTasksByStatus.pending.length + filteredTasksByStatus.ongoing.length + 
                        filteredTasksByStatus.completed.length + filteredTasksByStatus.blocked.length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks by title, description, or assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 mt-2">
              Showing {filteredTotal} of {totalTasks} tasks
            </p>
          )}
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const Icon = column.icon
          return (
            <div key={column.id} className="flex flex-col">
              <Card className={`${column.color} border-2 mb-4`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-gray-700" />
                      <CardTitle className="text-base font-semibold">{column.title}</CardTitle>
                    </div>
                    <Badge className={`${column.badgeColor} text-white`}>
                      {column.tasks.length}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              <div className="space-y-3 flex-1">
                {column.tasks.length > 0 ? (
                  column.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      canManage={canAssignTasks}
                      currentUserId={currentUserId}
                      allUsers={allUsers}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
