import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/sidebar'
import FaqChatbot from '@/components/faq-chatbot'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile data on the server
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        userName={profile?.full_name || user.email || 'User'} 
        userRole={profile?.role} 
      />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8 max-w-7xl">
          {children}
        </div>
      </main>
      <FaqChatbot />
    </div>
  )
}
