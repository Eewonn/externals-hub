'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Building2, Mail, Phone, User, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

export default function PartnerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [partner, setPartner] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    fetchPartnerDetails()
  }, [params.id])

  const fetchPartnerDetails = async () => {
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

      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('*, created_by(full_name, email)')
        .eq('id', params.id)
        .single()

      if (partnerError) {
        setError(partnerError.message)
        setLoading(false)
        return
      }

      setPartner(partnerData)
      setNewStatus(partnerData.status)
      setLoading(false)
    } catch (err) {
      setError('Failed to load partner details')
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === partner.status) {
      return
    }

    setUpdating(true)

    try {
      const { error: updateError } = await supabase
        .from('partners')
        .update({ status: newStatus })
        .eq('id', params.id)

      if (updateError) {
        alert('Failed to update status: ' + updateError.message)
        setUpdating(false)
        return
      }

      fetchPartnerDetails()
      setUpdating(false)
    } catch (err) {
      alert('An unexpected error occurred')
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this partner? This action cannot be undone.')) {
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('partners')
        .delete()
        .eq('id', params.id)

      if (deleteError) {
        alert('Failed to delete partner: ' + deleteError.message)
        return
      }

      router.push('/partners')
      router.refresh()
    } catch (err) {
      alert('An unexpected error occurred')
    }
  }

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

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading partner details...</div>
      </div>
    )
  }

  if (error || !partner) {
    return (
      <div className="max-w-3xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Partner not found'}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const canEdit = userRole === 'vp_externals' || userRole === 'junior_officer'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Badge className={`${getStatusColor(partner.status)} border`}>
            {formatStatus(partner.status)}
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900">{partner.name}</h1>
          <p className="text-gray-600">{partner.organization_type}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Partner Information */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="font-semibold text-gray-900 mb-1">Relationship Type</div>
              <Badge className={
                partner.relationship_type === 'partner' 
                  ? 'bg-teal-100 text-teal-800 border-teal-200 border'
                  : 'bg-orange-100 text-orange-800 border-orange-200 border'
              }>
                {partner.relationship_type}
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
            <div className="space-y-3">
              {partner.contact_person && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Contact Person</div>
                    <div className="text-gray-700">{partner.contact_person}</div>
                  </div>
                </div>
              )}

              {partner.contact_email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <a href={`mailto:${partner.contact_email}`} className="text-blue-600 hover:underline">
                      {partner.contact_email}
                    </a>
                  </div>
                </div>
              )}

              {partner.contact_phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Phone</div>
                    <a href={`tel:${partner.contact_phone}`} className="text-blue-600 hover:underline">
                      {partner.contact_phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {partner.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{partner.notes}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="text-sm text-gray-600">
            <div>Added by: {partner.created_by?.full_name || 'Unknown'}</div>
            <div>Added on: {format(new Date(partner.created_at), 'MMM dd, yyyy')}</div>
            {partner.updated_at !== partner.created_at && (
              <div>Last updated: {format(new Date(partner.updated_at), 'MMM dd, yyyy')}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Management */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Partner Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus} disabled={updating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="potential">Potential</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="ongoing_coordination">Ongoing Coordination</SelectItem>
                  <SelectItem value="active_partner">Active Partner</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleStatusUpdate}
              disabled={updating || newStatus === partner.status}
              className="w-full"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
