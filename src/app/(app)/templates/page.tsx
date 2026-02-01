import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink, Folder, Plus } from 'lucide-react'
import Link from 'next/link'
import { PERMISSIONS } from '@/lib/auth/permissions'
import TemplateActionsMenu from './template-actions-menu'

export default async function TemplatesPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Get current user's profile with role
  const { data: currentUserProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const canManageTemplates = currentUserProfile && PERMISSIONS.canManageTemplates(currentUserProfile.role)

  // Fetch all templates
  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .order('category', { ascending: true })
    .order('title', { ascending: true })

  // Group templates by category
  const groupedTemplates = templates?.reduce((acc: any, template: any) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {}) || {}

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'endorsement':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'email':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'form':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'report':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'app':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'endorsement':
        return <FileText className="h-5 w-5" />
      case 'email':
        return <FileText className="h-5 w-5" />
      case 'form':
        return <FileText className="h-5 w-5" />
      case 'report':
        return <FileText className="h-5 w-5" />
      case 'app':
        return <Folder className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1) + 's'
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Templates & Resources</h1>
          <p className="text-gray-600 mt-1">
            Access all templates and resources for committee work
          </p>
        </div>
        {canManageTemplates && (
          <Link href="/templates/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Template
            </Button>
          </Link>
        )}
      </div>

      {/* Templates by Category */}
      {Object.keys(groupedTemplates).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates available</h3>
            <p className="text-gray-600">Templates will be added by the VP Externals</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]: [string, any]) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={`${getCategoryColor(category)} border flex items-center gap-2`}>
                  {getCategoryIcon(category)}
                  {formatCategory(category)}
                </Badge>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {categoryTemplates.map((template: any) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg flex-1">
                          {template.title}
                        </CardTitle>
                        {canManageTemplates && (
                          <TemplateActionsMenu template={template} />
                        )}
                      </div>
                      {template.description && (
                        <CardDescription className="line-clamp-2">
                          {template.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <a
                        href={template.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button className="w-full" variant="outline">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open Template
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">About Templates</h3>
              <p className="text-sm text-blue-800">
                These templates are managed by the VP Externals. All templates are stored in Google Drive 
                or other cloud platforms. Click "Open Template" to access and make a copy for your use.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
