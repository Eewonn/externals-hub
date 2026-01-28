import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'

export default async function EndorsementsPage() {
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

  // Fetch all endorsements with event details
  const { data: endorsements } = await supabase
    .from('endorsements')
    .select('*, event_id(title, event_type, event_date), created_by(full_name)')
    .order('created_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'drafted':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'vpe_reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'submitted_to_sado':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Endorsements</h1>
          <p className="text-gray-600 mt-1">
            Track endorsement letters and their approval status
          </p>
        </div>
        {(profile?.role === 'vp_externals' || profile?.role === 'junior_officer') && (
          <Link href="/endorsements/new">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Submit Endorsement
            </Button>
          </Link>
        )}
      </div>

      {/* Endorsements List */}
      {!endorsements || endorsements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No endorsements yet</h3>
            <p className="text-gray-600 mb-4">Submit your first endorsement letter</p>
            {(profile?.role === 'vp_externals' || profile?.role === 'junior_officer') && (
              <Link href="/endorsements/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Submit Endorsement
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {endorsements.map((endorsement: any) => (
            <Link key={endorsement.id} href={`/endorsements/${endorsement.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getStatusColor(endorsement.status)} border`}>
                          {formatStatus(endorsement.status)}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">
                        {endorsement.event_id?.title || 'Untitled Event'}
                      </CardTitle>
                      <CardDescription>
                        {endorsement.event_id?.event_type && (
                          <span className="capitalize">{endorsement.event_id.event_type}</span>
                        )}
                        {endorsement.event_id?.event_date && (
                          <> • {format(new Date(endorsement.event_id.event_date), 'MMM dd, yyyy')}</>
                        )}
                      </CardDescription>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                      Submitted by {endorsement.created_by?.full_name || 'Unknown'}
                    </div>
                    <div className="text-gray-500">
                      {format(new Date(endorsement.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  {endorsement.notes && (
                    <div className="mt-3 text-sm text-gray-700 line-clamp-2">
                      <span className="font-medium">Notes:</span> {endorsement.notes}
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
