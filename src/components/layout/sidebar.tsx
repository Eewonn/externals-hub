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
  ChevronDown,
  UserCog,
  Loader2,
  Settings,
  Clock,
  Menu,
  X,
  ClipboardList,
  Trophy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTransition, useState } from 'react'
import { UserRole } from '@/lib/supabase/types'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[] },
  { 
    name: 'Events', 
    href: '/events', 
    icon: Calendar, 
    roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[],
    subItems: [
      { name: 'Events', href: '/events?type=event', icon: Calendar },
      { name: 'Competitions', href: '/events?type=competition', icon: Trophy }
    ]
  },
  { name: 'Endorsements', href: '/endorsements', icon: FileText, roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[] },
  { name: 'Applications', href: '/applications', icon: ClipboardList, roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships'] as UserRole[] },
  { name: 'Partners', href: '/partners', icon: Users, roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[] },
  { name: 'Communications', href: '/communications', icon: Mail, roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships'] as UserRole[] },
  { name: 'Templates', href: '/templates', icon: FolderOpen, roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[] },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships'] as UserRole[] },
  { name: 'Schedules', href: '/schedules', icon: Clock, roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[] },
  { name: 'Users', href: '/users', icon: UserCog, roles: ['vp_externals', 'director_partnerships', 'director_sponsorships'] as UserRole[] },
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

interface SidebarProps {
  userName: string
  userRole?: string
}

export default function Sidebar({ userName, userRole }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault()
    setIsMobileMenuOpen(false)
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Externals Hub</h1>
        <p className="text-xs text-gray-400 mt-0.5">by Ewonn</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation
          .filter(item => !userRole || item.roles.includes(userRole as UserRole))
          .map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          const hasSubItems = item.subItems && item.subItems.length > 0
          const isExpanded = expandedItem === item.name
          
          return (
            <div key={item.name}>
              {hasSubItems ? (
                <>
                  <button
                    onClick={() => setExpandedItem(isExpanded ? null : item.name)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors
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
                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subItems?.map((subItem) => {
                        const SubIcon = subItem.icon
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={(e) => {
                              handleNavigation(subItem.href, e)
                              setExpandedItem(null)
                            }}
                            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                          >
                            <SubIcon className="h-4 w-4" />
                            <span>{subItem.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
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
              )}
            </div>
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
          <DropdownMenuTrigger asChild suppressHydrationWarning>
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
    </>
  )
}
