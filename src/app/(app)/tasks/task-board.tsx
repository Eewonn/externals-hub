'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TaskStatus } from '@/lib/supabase/types'
import TaskCard from './task-card'
import { Clock, Play, CheckCircle2, AlertCircle } from 'lucide-react'

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
  const columns = [
    {
      id: 'pending' as TaskStatus,
      title: 'Pending',
      tasks: tasksByStatus.pending,
      icon: Clock,
      color: 'bg-gray-100 border-gray-300',
      badgeColor: 'bg-gray-500',
    },
    {
      id: 'ongoing' as TaskStatus,
      title: 'In Progress',
      tasks: tasksByStatus.ongoing,
      icon: Play,
      color: 'bg-blue-50 border-blue-300',
      badgeColor: 'bg-blue-500',
    },
    {
      id: 'completed' as TaskStatus,
      title: 'Completed',
      tasks: tasksByStatus.completed,
      icon: CheckCircle2,
      color: 'bg-green-50 border-green-300',
      badgeColor: 'bg-green-500',
    },
    {
      id: 'blocked' as TaskStatus,
      title: 'Blocked',
      tasks: tasksByStatus.blocked,
      icon: AlertCircle,
      color: 'bg-red-50 border-red-300',
      badgeColor: 'bg-red-500',
    },
  ]

  return (
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
  )
}
