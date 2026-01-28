'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function NewCommunicationPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [partners, setPartners] = useState<any[]>([])
  const [selectedPartner, setSelectedPartner] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    partner_id: '',
    subject: '',
    recipient: '',
    email_type: '',
    status: 'sent' as 'sent' | 'replied' | 'no_response',
    notes: '',
  })

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    const { data } = await supabase
      .from('partners')
      .select('*')
      .order('name', { ascending: true })
    
    if (data) {
      setPartners(data)
    }
  }

  const handlePartnerChange = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId)
    setSelectedPartner(partner)
    setFormData({
      ...formData,
      partner_id: partnerId,
      recipient: partner?.contact_email || '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be logged in to log a communication')
        setLoading(false)
        return
      }

      const { data, error: insertError } = await supabase
        .from('email_logs')
        .insert({
          partner_id: formData.partner_id,
          subject: formData.subject,
          recipient: formData.recipient,
          email_type: formData.email_type,
          status: formData.status,
          notes: formData.notes || null,
          officer_in_charge: user.id,
          sent_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }

      router.push(`/communications/${data.id}`)
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Log Communication</h1>
        <p className="text-gray-600 mt-1">
          Record an email or communication with a partner or sponsor
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Communication Details</CardTitle>
          <CardDescription>
            Fill in the details about the email or communication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Partner Selection */}
            <div className="space-y-2">
              <Label htmlFor="partner_id">Partner/Sponsor *</Label>
              <Select
                value={formData.partner_id}
                onValueChange={handlePartnerChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a partner..." />
                </SelectTrigger>
                <SelectContent>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Select the partner this communication is related to
              </p>
            </div>

            {/* Recipient Email */}
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Email *</Label>
              <Input
                id="recipient"
                type="email"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                placeholder="recipient@example.com"
                required
                disabled={loading}
              />
            </div>

            {/* Email Type */}
            <div className="space-y-2">
              <Label htmlFor="email_type">Email Type *</Label>
              <Input
                id="email_type"
                value={formData.email_type}
                onChange={(e) => setFormData({ ...formData, email_type: e.target.value })}
                placeholder="e.g., Partnership Proposal, Follow-up, Thank You"
                required
                disabled={loading}
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Partnership Proposal for Tech Summit 2024"
                required
                disabled={loading}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'sent' | 'replied' | 'no_response') => 
                  setFormData({ ...formData, status: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="no_response">No Response</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional context or notes about this communication..."
                rows={4}
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-gray-900 hover:bg-gray-800 text-white"
                disabled={loading}
              >
                {loading ? 'Logging...' : 'Log Communication'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
