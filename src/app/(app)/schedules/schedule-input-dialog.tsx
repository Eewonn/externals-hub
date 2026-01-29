'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Upload } from 'lucide-react'

interface Officer {
  id: string
  full_name: string
  email: string
  role: string
}

interface ScheduleInputDialogProps {
  officers: Officer[]
}

export default function ScheduleInputDialog({ officers }: ScheduleInputDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedOfficer, setSelectedOfficer] = useState<string>('')
  const [academicYear, setAcademicYear] = useState('')
  const [semester, setSemester] = useState('')
  const [scheduleText, setScheduleText] = useState('')

  const parseScheduleText = (text: string) => {
    const lines = text.trim().split('\n')
    const entries = []

    for (const line of lines) {
      // Skip header lines and empty lines
      if (!line.trim() || line.includes('Courses\t') || line.includes('TOTAL UNITS')) {
        continue
      }

      const parts = line.split('\t')
      if (parts.length >= 6) {
        const courseCode = parts[0]?.trim()
        const courseTitle = parts[1]?.trim()
        const section = parts[2]?.trim()
        const units = parseInt(parts[3]?.trim()) || 0
        const daysRaw = parts[4]?.trim()
        const timeRaw = parts[5]?.trim()
        const roomRaw = parts[6]?.trim() || ''

        // Parse days (e.g., "F / W" -> ["F", "W"])
        const days = daysRaw.split('/').map(d => d.trim()).filter(d => d)
        
        // Parse time ranges (e.g., "15:00:00-16:50:00 / 15:00:00-16:50:00")
        const timeRanges = timeRaw.split('/').map(t => t.trim()).filter(t => t)
        
        // Parse rooms (e.g., "ONLINE / FTIC Presentation Room 2")
        const rooms = roomRaw.split('/').map(r => r.trim()).filter(r => r)

        if (courseCode && courseTitle && days.length > 0 && timeRanges.length > 0) {
          entries.push({
            course_code: courseCode,
            course_title: courseTitle,
            section: section,
            units: units,
            days: days,
            time_ranges: timeRanges,
            rooms: rooms.length > 0 ? rooms : ['TBD']
          })
        }
      }
    }

    return entries
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedOfficer || !academicYear || !semester || !scheduleText) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const entries = parseScheduleText(scheduleText)
      
      if (entries.length === 0) {
        alert('Could not parse any schedule entries. Please check the format.')
        setLoading(false)
        return
      }

      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedOfficer,
          academic_year: academicYear,
          semester: semester,
          entries: entries
        })
      })

      if (response.ok) {
        alert('Schedule added successfully!')
        setOpen(false)
        setSelectedOfficer('')
        setAcademicYear('')
        setSemester('')
        setScheduleText('')
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message || 'Failed to add schedule'}`)
      }
    } catch (error) {
      console.error('Error adding schedule:', error)
      alert('An error occurred while adding the schedule')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Officer Schedule</DialogTitle>
          <DialogDescription>
            Paste the schedule in tab-separated format (copy directly from spreadsheet)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="officer">Officer *</Label>
            <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
              <SelectTrigger id="officer">
                <SelectValue placeholder="Select an officer" />
              </SelectTrigger>
              <SelectContent>
                {officers.map((officer) => (
                  <SelectItem key={officer.id} value={officer.id}>
                    {officer.full_name} ({officer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academic_year">Academic Year *</Label>
              <Input
                id="academic_year"
                placeholder="e.g., 2025-2026"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester *</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Semester">First Semester</SelectItem>
                  <SelectItem value="Second Semester">Second Semester</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule Data *</Label>
            <Textarea
              id="schedule"
              placeholder="Paste tab-separated schedule data here (copy directly from Excel/Google Sheets)&#10;&#10;Example format:&#10;CS0027	CS PROJECT MANAGEMENT	TN35	3	F / W	15:00:00-16:50:00 / 15:00:00-16:50:00	ONLINE / FTIC Presentation Room 2"
              value={scheduleText}
              onChange={(e) => setScheduleText(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              required
            />
            <p className="text-sm text-gray-500">
              Copy the schedule table from your spreadsheet and paste it here. The format should include columns: 
              Course Code, Title, Section, Units, Days, Time, Room
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Upload className="mr-2 h-4 w-4" />
              {loading ? 'Adding...' : 'Add Schedule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
