'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function NewPartnerPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    organization_type: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    relationship_type: 'partner' as 'partner' | 'sponsor',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be logged in to add a partner')
        setLoading(false)
        return
      }

      const { data, error: insertError } = await supabase
        .from('partners')
        .insert({
          ...formData,
          contact_person: formData.contact_person || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          notes: formData.notes || null,
          created_by: user.id,
          status: 'potential',
        })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }

      router.push(`/partners/${data.id}`)
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Partner</h1>
        <p className="text-gray-600 mt-1">
          Register a new partner or sponsor organization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partner Information</CardTitle>
          <CardDescription>
            Fill in the details about the partner or sponsor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Tech Corporation Inc."
                required
                disabled={loading}
              />
            </div>

            {/* Organization Type */}
            <div className="space-y-2">
              <Label htmlFor="organization_type">Organization Type *</Label>
              <Input
                id="organization_type"
                value={formData.organization_type}
                onChange={(e) => setFormData({ ...formData, organization_type: e.target.value })}
                placeholder="e.g., Technology Company, Educational Institution"
                required
                disabled={loading}
              />
            </div>

            {/* Relationship Type */}
            <div className="space-y-2">
              <Label htmlFor="relationship_type">Relationship Type *</Label>
              <Select
                value={formData.relationship_type}
                onValueChange={(value: 'partner' | 'sponsor') => 
                  setFormData({ ...formData, relationship_type: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="sponsor">Sponsor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              
              {/* Contact Person */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="e.g., John Doe"
                  disabled={loading}
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="contact@example.com"
                  disabled={loading}
                />
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+63 912 345 6789"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes about this partner..."
                rows={4}
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Partner'}
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
