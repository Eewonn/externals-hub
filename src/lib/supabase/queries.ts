import { createClient } from './server'
import { cache } from 'react'

/**
 * Cached function to get the current authenticated user
 * This prevents redundant auth checks across the app
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
})

/**
 * Cached function to get the current user's profile
 * Includes role information needed across many pages
 */
export const getCurrentUserProfile = cache(async () => {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, email, role')
    .eq('id', user.id)
    .single()

  return profile
})

/**
 * Cached function to get all users (for dropdowns, etc.)
 * Only fetches necessary columns
 */
export const getAllUsers = cache(async () => {
  const supabase = await createClient()
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email, role')
    .order('full_name')

  return users || []
})

/**
 * Check if current user has management permissions
 */
export const canManageUsers = cache(async () => {
  const profile = await getCurrentUserProfile()
  return profile?.role === 'vp_externals'
})

/**
 * Check if current user can assign tasks
 */
export const canAssignTasks = cache(async () => {
  const profile = await getCurrentUserProfile()
  return profile?.role === 'vp_externals' ||
    profile?.role === 'director_partnerships' ||
    profile?.role === 'director_sponsorships'
})

/**
 * Get dashboard statistics in parallel
 */
export const getDashboardStats = cache(async () => {
  const supabase = await createClient()

  const [
    { count: eventsCount },
    { count: endorsementsCount },
    { count: partnersCount },
    { count: tasksCount },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('endorsements').select('*', { count: 'exact', head: true }),
    supabase.from('partners').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
  ])

  return {
    eventsCount: eventsCount || 0,
    endorsementsCount: endorsementsCount || 0,
    partnersCount: partnersCount || 0,
    tasksCount: tasksCount || 0,
  }
})

/**
 * Get application statistics
 */
export const getApplicationStats = cache(async () => {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_application_stats')

  // If function doesn't exist yet (migration not run), silently return zeros
  if (error) {
    return {
      total_applications: 0,
      pending_applications: 0,
      approved_applications: 0,
      rejected_applications: 0,
    }
  }

  // RPC functions return arrays, extract the first element
  const stats = Array.isArray(data) && data.length > 0 ? data[0] : null

  return stats || {
    total_applications: 0,
    pending_applications: 0,
    approved_applications: 0,
    rejected_applications: 0,
  }
})

/**
 * Get applications for a specific event (authenticated users only)
 */
export const getEventApplications = cache(async (eventId: string) => {
  const supabase = await createClient()
  const { data: applications, error } = await supabase
    .from('event_applications')
    .select('*')
    .eq('event_id', eventId)
    .order('applied_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch applications:', error)
    return []
  }

  return applications || []
})

/**
 * Get all applications (for internal staff with permissions)
 */
export const getAllApplications = cache(async () => {
  const supabase = await createClient()
  const { data: applications, error } = await supabase
    .from('event_applications')
    .select(`
      *,
      events (
        id,
        title,
        event_date,
        event_type,
        organizer
      )
    `)
    .order('applied_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch applications:', error)
    return []
  }

  return applications || []
})
