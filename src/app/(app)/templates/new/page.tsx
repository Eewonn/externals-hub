'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { TemplateCategory } from '@/lib/supabase/types'

export default function NewTemplatePage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'email' as TemplateCategory,
    external_url: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('templates')
        .insert({
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          external_url: formData.external_url,
          created_by: user.id
        })

      if (error) throw error

      router.push('/templates')
      router.refresh()
    } catch (error: any) {
      // Error handling - could add toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/templates">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Template</h1>
        <p className="text-gray-600 mt-1">
          Create a new template resource for the committee
        </p>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
          <CardDescription>Fill in the details for the new template</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Sponsorship Email Template"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of what this template is for"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value as TemplateCategory })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="endorsement">Endorsement</SelectItem>
                  <SelectItem value="apf">APF (Activity Proposal Form)</SelectItem>
                  <SelectItem value="app">APP (Activity Proposal Plan)</SelectItem>
                  <SelectItem value="post_event_report">Post Event Report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="external_url">External URL</Label>
              <Input
                id="external_url"
                type="url"
                placeholder="https://docs.google.com/document/d/..."
                value={formData.external_url}
                onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                required
              />
              <p className="text-sm text-gray-500">
                Link to the template on Google Drive, Notion, or other platform
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Template'}
              </Button>
              <Link href="/templates">
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="max-w-2xl bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-sm text-blue-800 space-y-2">
            <p className="font-semibold">Tips for Adding Templates:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Make sure the link is accessible to all committee members</li>
              <li>Use Google Drive sharing settings to set "Anyone with the link can view"</li>
              <li>Include clear instructions within the template itself</li>
              <li>Choose the appropriate category for easier discovery</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
