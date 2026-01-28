import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Mail, Phone, Building2 } from 'lucide-react'

export default async function PartnersPage() {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'potential':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'contacted':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ongoing_coordination':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'active_partner':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'partner' 
      ? 'bg-teal-100 text-teal-800 border-teal-200'
      : 'bg-orange-100 text-orange-800 border-orange-200'
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partners & Sponsors</h1>
          <p className="text-gray-600 mt-1">
            Manage relationships with partners and sponsors
          </p>
        </div>
        {(profile?.role === 'vp_externals' || profile?.role === 'junior_officer') && (
          <Link href="/partners/new">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Partner
            </Button>
          </Link>
        )}
      </div>

      {/* Partners Grid */}
      {!partners || partners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No partners yet</h3>
            <p className="text-gray-600 mb-4">Add your first partner or sponsor</p>
            {(profile?.role === 'vp_externals' || profile?.role === 'junior_officer') && (
              <Link href="/partners/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Partner
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner: any) => (
            <Link key={partner.id} href={`/partners/${partner.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`${getTypeColor(partner.relationship_type)} border`}>
                      {partner.relationship_type}
                    </Badge>
                    <Badge className={`${getStatusColor(partner.status)} border`}>
                      {formatStatus(partner.status)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{partner.name}</CardTitle>
                  <CardDescription>
                    {partner.organization_type}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {partner.contact_person && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="mr-2 h-4 w-4" />
                      {partner.contact_person}
                    </div>
                  )}
                  {partner.contact_email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="mr-2 h-4 w-4" />
                      <span className="truncate">{partner.contact_email}</span>
                    </div>
                  )}
                  {partner.contact_phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="mr-2 h-4 w-4" />
                      {partner.contact_phone}
                    </div>
                  )}
                  {partner.created_by && (
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Added by {partner.created_by.full_name}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
