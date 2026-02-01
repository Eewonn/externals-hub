'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ShieldAlert, X } from 'lucide-react'
import Link from 'next/link'

interface PasswordChangeAlertProps {
  userEmail: string
  accountCreatedAt: string
}

export default function PasswordChangeAlert({ userEmail, accountCreatedAt }: PasswordChangeAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed this alert before
    const dismissedKey = `password-alert-dismissed-${userEmail}`
    const dismissed = localStorage.getItem(dismissedKey)
    if (dismissed) {
      setIsDismissed(true)
    }
  }, [userEmail])

  const handleDismiss = () => {
    const dismissedKey = `password-alert-dismissed-${userEmail}`
    localStorage.setItem(dismissedKey, 'true')
    setIsDismissed(true)
  }

  // Check if account is new (created within last 7 days) or if user has never changed password
  // We'll show this alert for all users who haven't dismissed it yet
  if (isDismissed) {
    return null
  }

  return (
    <Alert className="border-amber-200 bg-amber-50">
      <ShieldAlert className="text-amber-600" />
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 w-full">
        <div className="flex-1 min-w-0">
          <AlertDescription className="text-amber-900">
            <strong className="font-semibold">Security Reminder:</strong> For your account security, 
            we recommend changing your password regularly. If you haven't changed your password since 
            account creation, please update it now.
          </AlertDescription>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Link href="/settings">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                Change Password
              </Button>
            </Link>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDismiss}
              className="text-amber-900 hover:text-amber-950 hover:bg-amber-100"
            >
              Dismiss
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-amber-600 hover:text-amber-800 flex-shrink-0 self-start sm:self-auto"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Alert>
  )
}
