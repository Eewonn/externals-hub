'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, User, Mail } from 'lucide-react'

interface ProfileFormProps {
  userId: string
  initialData: {
    full_name: string
    email: string
  }
}

export default function ProfileForm({ userId, initialData }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    full_name: initialData.full_name,
    email: initialData.email,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      // Update user profile in the users table
      const { error: profileError } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          email: formData.email,
        })
        .eq('id', userId)

      if (profileError) throw profileError

      // If email changed, update auth email as well
      if (formData.email !== initialData.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: formData.email,
        })

        if (authError) {
          // Revert the profile update if auth update fails
          await supabase
            .from('users')
            .update({ email: initialData.email })
            .eq('id', userId)
          
          throw new Error('Failed to update email. Please check if the email is already in use.')
        }

        setMessage({
          type: 'success',
          text: 'Profile updated! Please check your new email for a confirmation link.'
        })
      } else {
        setMessage({
          type: 'success',
          text: 'Profile updated successfully!'
        })
      }

      router.refresh()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update profile. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasChanges = formData.full_name !== initialData.full_name || formData.email !== initialData.email

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            Full Name
          </Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Enter your full name"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter your email"
            required
            disabled={isSubmitting}
          />
          {formData.email !== initialData.email && (
            <p className="text-sm text-amber-600">
              Changing your email will require verification. You'll receive a confirmation link.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t">
        <Button 
          type="submit" 
          disabled={isSubmitting || !hasChanges}
          className="min-w-32"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
        
        {hasChanges && !isSubmitting && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setFormData(initialData)}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
