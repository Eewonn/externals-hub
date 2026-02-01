import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import PartnersList from './partners-list'

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: { type?: string }
}) {
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

  // Fetch all partners
  const { data: partners } = await supabase
    .from('partners')
    .select('*, created_by(full_name)')
    .order('created_at', { ascending: false })

  const canCreate = profile?.role === 'vp_externals' || profile?.role === 'junior_officer' || profile?.role === 'adviser'

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Partners & Sponsors</h1>
          <p className="text-gray-600 mt-1">
            Manage relationships with partners and sponsors
          </p>
        </div>
        {canCreate && (
          <Link href="/partners/new" className="w-full sm:w-auto">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Partner
            </Button>
          </Link>
        )}
      </div>

      {/* Partners List */}
      <PartnersList partners={partners || []} canCreate={canCreate} initialType={searchParams.type} />
    </div>
  )
}
