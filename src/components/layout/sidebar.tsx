'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Users, 
  Mail, 
  FolderOpen, 
  CheckSquare,
  LogOut,
  ChevronRight,
  UserCog,
  Loader2,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTransition, useEffect, useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Endorsements', href: '/endorsements', icon: FileText },
  { name: 'Partners', href: '/partners', icon: Users },
  { name: 'Communications', href: '/communications', icon: Mail },
  { name: 'Templates', href: '/templates', icon: FolderOpen },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Users', href: '/users', icon: UserCog },
]

function getInitials(fullName: string | undefined | null): string {
  if (!fullName || fullName.trim().length === 0) {
    return 'U'
  }
  
  const names = fullName.trim().split(/\s+/)
  
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase()
  } else if (names.length === 2) {
    return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase()
  } else {
    // 3+ names: first name + middle name initials
    return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase()
  }
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()
  const [userName, setUserName] = useState('User')
  const [userRole, setUserRole] = useState<string | undefined>(undefined)

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('full_name, role')
          .eq('id', user.id)
          .single()
        
        setUserName(profile?.full_name || user.email || 'User')
        setUserRole(profile?.role)
      }
    }
    loadUserData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Externals Hub</h1>
        <p className="text-sm text-gray-500 mt-1">Committee Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavigation(item.href, e)}
              prefetch={true}
              className={`
                flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          )
        })}
      </nav>

      {/* Loading Indicator */}
      {isPending && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
          <div className="h-full bg-gray-900 animate-[loading_1s_ease-in-out_infinite]" style={{ width: '30%' }}></div>
        </div>
      )}

      {/* User Account */}
      <div className="p-4 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-left font-normal hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">{getInitials(userName)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{userRole || 'Member'}</p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
