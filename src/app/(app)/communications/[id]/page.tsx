'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, User, Calendar, Building2, Trash2, ArrowLeft, Tag } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default function CommunicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [communication, setCommunication] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    fetchCommunicationDetails()
  }, [params.id])

  const fetchCommunicationDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      setUserRole(profile?.role || null)

      const { data: commData, error: commError } = await supabase
        .from('email_logs')
        .select('*, partner:partners(id, name), officer_in_charge:users(full_name, email)')
        .eq('id', params.id)
        .single()

      if (commError) {
        setError(commError.message)
        setLoading(false)
        return
      }

      setCommunication(commData)
      setLoading(false)
    } catch (err) {
      setError('Failed to load communication details')
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this communication log? This action cannot be undone.')) {
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('email_logs')
        .delete()
        .eq('id', params.id)

      if (deleteError) {
        alert('Failed to delete communication: ' + deleteError.message)
        return
      }

      router.push('/communications')
      router.refresh()
    } catch (err) {
      alert('An unexpected error occurred')
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading communication details...</div>
      </div>
    )
  }

  if (error || !communication) {
    return (
      <div className="max-w-3xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Communication not found'}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  const canDelete = userRole === 'vp_externals' || userRole === 'junior_officer'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Link href="/communications">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Communications
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(communication.status)} border`}>
              {formatStatus(communication.status)}
            </Badge>
            <Badge variant="outline">
              {communication.email_type}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{communication.subject}</h1>
        </div>
        {canDelete && (
          <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      {/* Communication Details */}
      <Card>
        <CardHeader>
          <CardTitle>Email Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="font-semibold text-gray-900 mb-1">Recipient</div>
              <a href={`mailto:${communication.recipient}`} className="text-blue-600 hover:underline">
                {communication.recipient}
              </a>
            </div>

            <div>
              <div className="font-semibold text-gray-900 mb-1">Email Type</div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">{communication.email_type}</span>
              </div>
            </div>
          </div>

          {communication.partner && (
            <>
              <Separator />
              <div>
                <div className="font-semibold text-gray-900 mb-1">Related Partner</div>
                <Link href={`/partners/${communication.partner.id}`} className="text-blue-600 hover:underline flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {communication.partner.name}
                </Link>
              </div>
            </>
          )}

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Officer in Charge</div>
                <div className="text-gray-700">{communication.officer_in_charge?.full_name || 'Unknown'}</div>
                {communication.officer_in_charge?.email && (
                  <div className="text-sm text-gray-600">{communication.officer_in_charge.email}</div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Sent Date</div>
                <div className="text-gray-700">{format(new Date(communication.sent_at), 'MMMM dd, yyyy')}</div>
                <div className="text-sm text-gray-600">{format(new Date(communication.sent_at), 'h:mm a')}</div>
              </div>
            </div>
          </div>

          {communication.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {communication.notes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
