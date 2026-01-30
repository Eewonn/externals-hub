import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing userId or action' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve or reject' },
        { status: 400 }
      )
    }

    // Create Supabase Admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get current admin user (who is approving)
    const authHeader = request.headers.get('authorization')
    let approvedBy: string | null = null
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabaseAdmin.auth.getUser(token)
      approvedBy = user?.id || null
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    // Update user status
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        approval_status: newStatus,
        approved_at: new Date().toISOString(),
        approved_by: approvedBy
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user status:', error)
      return NextResponse.json(
        { error: 'Failed to update user status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `User ${action}d successfully`
    })

  } catch (error: any) {
    console.error('Error in approve user API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
