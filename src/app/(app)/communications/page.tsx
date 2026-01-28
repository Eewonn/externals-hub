import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Plus, ExternalLink, User, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default async function CommunicationsPage() {
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

  // Fetch all communications with related data
  const { data: communications } = await supabase
    .from('email_logs')
    .select('*, partner:partners(name), officer_in_charge:users(full_name)')
    .order('sent_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'replied':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'no_response':
        return 'bg-gray-100 text-gray-800 border-gray-200'
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
          <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-600 mt-1">
            Track all email communications with partners and sponsors
          </p>
        </div>
        {(profile?.role === 'vp_externals' || profile?.role === 'junior_officer') && (
          <Link href="/communications/new">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Log Communication
            </Button>
          </Link>
        )}
      </div>

      {/* Communications List */}
      {!communications || communications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No communications logged</h3>
            <p className="text-gray-600 mb-4">Start tracking your email communications</p>
            {(profile?.role === 'vp_externals' || profile?.role === 'junior_officer') && (
              <Link href="/communications/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Log Communication
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {communications.map((comm: any) => (
            <Link key={comm.id} href={`/communications/${comm.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getStatusColor(comm.status)} border`}>
                          {formatStatus(comm.status)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {comm.email_type}
                        </Badge>
                        {comm.partner && (
                          <span className="text-sm text-gray-600">
                            → {comm.partner.name}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-xl">{comm.subject}</CardTitle>
                      <CardDescription className="mt-1">
                        To: {comm.recipient}
                      </CardDescription>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {comm.notes && (
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {comm.notes}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {comm.officer_in_charge?.full_name || 'Unknown'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(comm.sent_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">About Communications</h3>
              <p className="text-sm text-blue-800">
                Log all email communications with partners and sponsors to maintain a complete record 
                of interactions. This helps with accountability and provides context for future communications.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
