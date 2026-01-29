import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { user_id, academic_year, semester, entries } = body

    // Validate required fields
    if (!user_id || !academic_year || !semester || !entries || entries.length === 0) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if schedule already exists for this user/semester/year
    const { data: existingSchedule } = await supabase
      .from('officer_schedules')
      .select('id')
      .eq('user_id', user_id)
      .eq('academic_year', academic_year)
      .eq('semester', semester)
      .single()

    let scheduleId: string

    if (existingSchedule) {
      // Update existing schedule - delete old entries first
      await supabase
        .from('schedule_entries')
        .delete()
        .eq('schedule_id', existingSchedule.id)
      
      scheduleId = existingSchedule.id
    } else {
      // Create new schedule
      const { data: newSchedule, error: scheduleError } = await supabase
        .from('officer_schedules')
        .insert({
          user_id,
          academic_year,
          semester
        })
        .select()
        .single()

      if (scheduleError) {
        console.error('Error creating schedule:', scheduleError)
        return NextResponse.json(
          { message: 'Failed to create schedule', error: scheduleError },
          { status: 500 }
        )
      }

      scheduleId = newSchedule.id
    }

    // Insert schedule entries
    const entriesWithScheduleId = entries.map((entry: any) => ({
      schedule_id: scheduleId,
      course_code: entry.course_code,
      course_title: entry.course_title,
      section: entry.section,
      units: entry.units,
      days: entry.days,
      time_ranges: entry.time_ranges,
      rooms: entry.rooms
    }))

    const { error: entriesError } = await supabase
      .from('schedule_entries')
      .insert(entriesWithScheduleId)

    if (entriesError) {
      console.error('Error creating schedule entries:', entriesError)
      return NextResponse.json(
        { message: 'Failed to create schedule entries', error: entriesError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Schedule created successfully',
      schedule_id: scheduleId
    })
  } catch (error) {
    console.error('Error in POST /api/schedules:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const academicYear = searchParams.get('academic_year')
    const semester = searchParams.get('semester')

    let query = supabase
      .from('officer_schedules')
      .select(`
        *,
        user:users(id, full_name, email, role),
        entries:schedule_entries(*)
      `)

    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (academicYear) {
      query = query.eq('academic_year', academicYear)
    }
    if (semester) {
      query = query.eq('semester', semester)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching schedules:', error)
      return NextResponse.json(
        { message: 'Failed to fetch schedules', error },
        { status: 500 }
      )
    }

    return NextResponse.json({ schedules: data })
  } catch (error) {
    console.error('Error in GET /api/schedules:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
