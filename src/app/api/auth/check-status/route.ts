import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user data
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    if (dbError) {
      console.error('Error fetching user data:', dbError)
      return NextResponse.json(
        { error: 'Error checking user status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      role: userData.role,
      full_name: userData.full_name
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
