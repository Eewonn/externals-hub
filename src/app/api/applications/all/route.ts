import { getAllApplications } from '@/lib/supabase/queries'
import { getCurrentUserProfile } from '@/lib/supabase/queries'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getCurrentUserProfile()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has permission to view applications
    if (
      !['vp_externals', 'director_partnerships', 'director_sponsorships', 'junior_officer'].includes(
        user.role as string
      )
    ) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const applications = await getAllApplications()

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Failed to fetch applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
