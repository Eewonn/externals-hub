import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Shield } from 'lucide-react'
import { getCurrentUser, getCurrentUserProfile } from '@/lib/supabase/queries'
import ProfileForm from './profile-form'

export default async function AccountSettingsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const profile = await getCurrentUserProfile()

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'vp_externals':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'director_partnerships':
      case 'director_sponsorships':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'junior_officer':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'adviser':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatRole = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your profile information and account settings
        </p>
      </div>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm 
            userId={user.id}
            initialData={{
              full_name: profile?.full_name || '',
              email: profile?.email || user.email || '',
            }}
          />
        </CardContent>
      </Card>

      {/* Role Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Role & Permissions</CardTitle>
          <CardDescription>
            Your current role and access level in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Current Role</label>
                <div className="mt-1">
                  <Badge className={`${getRoleBadgeColor(profile?.role || '')} border`}>
                    {formatRole(profile?.role || '')}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Your role is managed by the VP Externals and determines your access permissions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Email Verification</h3>
              <p className="text-sm text-blue-800">
                Your email is verified and connected to your account. If you need to change your login email, 
                please contact the system administrator.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
