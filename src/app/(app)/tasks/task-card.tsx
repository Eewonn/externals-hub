'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Calendar, User, MoreHorizontal, Clock, Play, CheckCircle2, AlertCircle, Trash2, FileText, Building2 } from 'lucide-react'
import { format, isPast, differenceInDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TaskStatus } from '@/lib/supabase/types'
import EditTaskDialog from './edit-task-dialog'

interface TaskCardProps {
  task: any
  canManage: boolean
  currentUserId: string
  allUsers: any[]
}

export default function TaskCard({ task, canManage, currentUserId, allUsers }: TaskCardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isDeleting, setIsDeleting] = useState(false)

  // Memoize date calculations to avoid recalculating on every render
  const { isOverdue, daysUntilDeadline, deadlineColor, formattedDeadline, formattedCompletedAt } = useMemo(() => {
    const deadlineDate = new Date(task.deadline)
    const now = new Date()
    const _isOverdue = isPast(deadlineDate) && task.status !== 'completed'
    const _daysUntilDeadline = differenceInDays(deadlineDate, now)
    
    let _deadlineColor = 'text-gray-600'
    if (task.status === 'completed') {
      _deadlineColor = 'text-gray-600'
    } else if (_isOverdue) {
      _deadlineColor = 'text-red-600 font-semibold'
    } else if (_daysUntilDeadline <= 3) {
      _deadlineColor = 'text-orange-600 font-semibold'
    }

    return {
      isOverdue: _isOverdue,
      daysUntilDeadline: _daysUntilDeadline,
      deadlineColor: _deadlineColor,
      formattedDeadline: format(deadlineDate, 'MMM dd, yyyy'),
      formattedCompletedAt: task.completed_at ? format(new Date(task.completed_at), 'MMM dd, yyyy') : null
    }
  }, [task.deadline, task.status, task.completed_at])

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      // Error handling
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      // Error handling
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold line-clamp-2">
              {task.title}
            </CardTitle>
            {task.description && (
              <CardDescription className="text-xs mt-1 line-clamp-2">
                {task.description}
              </CardDescription>
            )}
          </div>
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                  <Clock className="mr-2 h-4 w-4" />
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('ongoing')}>
                  <Play className="mr-2 h-4 w-4" />
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('blocked')}>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Blocked
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <EditTaskDialog task={task} allUsers={allUsers} currentUserId={currentUserId} />
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs">
            <User className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-gray-700 truncate">
              {task.assigned_to_user?.full_name}
            </span>
          </div>
          
          <div className={`flex items-center gap-1.5 text-xs ${deadlineColor}`}>
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {formattedDeadline}
              {isOverdue && ' (Overdue)'}
              {!isOverdue && daysUntilDeadline <= 3 && daysUntilDeadline >= 0 && ` (${daysUntilDeadline}d left)`}
            </span>
          </div>

          {task.event && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <FileText className="h-3.5 w-3.5" />
              <span className="truncate">{task.event.title}</span>
            </div>
          )}

          {task.partner && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Building2 className="h-3.5 w-3.5" />
              <span className="truncate">{task.partner.name}</span>
            </div>
          )}

          {task.status === 'completed' && formattedCompletedAt && (
            <div className="text-xs text-green-600 mt-2 pt-2 border-t">
              Completed {formattedCompletedAt}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
