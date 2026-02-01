'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Search } from 'lucide-react'
import { UserRole } from '@/lib/supabase/types'

const faqs = [
  {
    category: 'Getting Started',
    roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[],
    questions: [
      {
        q: 'How do I navigate between Events and Competitions?',
        a: 'Click on "External Activities" in the sidebar to expand the dropdown, then select either "Events" or "Competitions" to view filtered results. The dropdown stays open for easy switching.',
        roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[]
      },
      {
        q: 'How do I add a new event or competition?',
        a: 'Navigate to External Activities in the sidebar, select Events or Competitions, then click the "Create Event" button. Fill in the required details including title, date, description, and participants.',
        roles: ['vp_externals', 'junior_officer', 'adviser'] as UserRole[]
      },
      {
        q: 'How do I manage user roles?',
        a: 'Only VP Externals, Directors, and Junior Officers can manage user roles. Go to the Users page, click the three-dot menu next to a user, and select "Change Role".',
        roles: ['vp_externals', 'director_partnerships', 'director_sponsorships'] as UserRole[]
      },
      {
        q: 'What are the different user roles?',
        a: 'There are 5 roles: VP Externals (full access), Director Partnerships & Director Sponsorships (manage partners and review endorsements), Junior Officers (create events/endorsements), and Adviser (can create events and partners, view most sections).',
        roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[]
      }
    ]
  },
  {
    category: 'Events & Competitions',
    roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[],
    questions: [
      {
        q: 'How do I filter between Events and Competitions?',
        a: 'Use the "External Activities" dropdown in the sidebar. Click it to expand and select either "Events" or "Competitions" to see only that type. You can also use the filter dropdown on the main page.',
        roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[]
      },
      {
        q: 'How do I add participants to an event?',
        a: 'When creating or editing an event, you can add participants with their details including name, year level, and course in the participants section.',
        roles: ['vp_externals', 'junior_officer', 'adviser'] as UserRole[]
      },
      {
        q: 'How do I export events to Excel?',
        a: 'On the Events page, use the filters to select the events you want, then click the "Export to CSV" button at the top right. The export includes all filtered results.',
        roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[]
      },
      {
        q: 'What\'s the difference between Category and Nature?',
        a: 'Category refers to the scope (Local - Regional, Local - National, International), while Nature indicates if it\'s Academic or Non-Academic.',
        roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[]
      }
    ]
  },
  {
    category: 'Partners & Sponsors',
    roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[],
    questions: [
      {
        q: 'How do I navigate between Partners and Sponsors?',
        a: 'Click on "Industry Partners" in the sidebar to expand the dropdown, then select either "Partnerships" or "Sponsorships" to view filtered results.',
        roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[]
      },
      {
        q: 'How do I add a new partner or sponsor?',
        a: 'Navigate to Industry Partners in the sidebar, select Partnerships or Sponsorships, then click "Add Partner". Include contact details and select the appropriate relationship type.',
        roles: ['vp_externals', 'junior_officer', 'adviser'] as UserRole[]
      },
      {
        q: 'Who can manage partners and sponsors?',
        a: 'VP Externals, Junior Officers, Directors, and Advisers can create and manage partner organizations.',
        roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[]
      }
    ]
  },
  {
    category: 'Applications',
    roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships'] as UserRole[],
    questions: [
      {
        q: 'How do I view event applications?',
        a: 'Click "Activity Applications" in the sidebar to expand the dropdown, then select either "Events" or "Competitions" to filter applications by type.',
        roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships'] as UserRole[]
      },
      {
        q: 'How do I export applications?',
        a: 'On the Activity Applications page, each event has an export button that downloads a CSV file with all participant information for that specific event.',
        roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships'] as UserRole[]
      }
    ]
  },
  {
    category: 'Schedules & Endorsements',
    roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[],
    questions: [
      {
        q: 'Can Junior Officers see all schedules?',
        a: 'No, Junior Officers can only see their own schedules. VP Externals and Directors can view all officer schedules.',
        roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[]
      },
      {
        q: 'How do I add schedule blocks?',
        a: 'On the Schedules page, click "Add Schedule" and select the day, time slots, and semester. The schedule will be automatically saved.',
        roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[]
      },
      {
        q: 'How do I create an endorsement request?',
        a: 'Go to Endorsements page, click "Create Endorsement", fill in the organization details, purpose, and upload any required documents.',
        roles: ['vp_externals', 'junior_officer', 'director_partnerships', 'director_sponsorships', 'adviser'] as UserRole[]
      },
      {
        q: 'Who can approve endorsements?',
        a: 'Directors and VP Externals can review and approve endorsement requests.',
        roles: ['vp_externals', 'director_partnerships', 'director_sponsorships'] as UserRole[]
      }
    ]
  }
]

interface FaqChatbotProps {
  userRole?: string
}

export default function FaqChatbot({ userRole }: FaqChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter FAQs based on user role
  const roleFaqs = useMemo(() => {
    if (!userRole) return faqs
    
    return faqs
      .filter(category => category.roles.includes(userRole as UserRole))
      .map(category => ({
        ...category,
        questions: category.questions.filter(q => q.roles.includes(userRole as UserRole))
      }))
      .filter(category => category.questions.length > 0)
  }, [userRole])

  const filteredFaqs = roleFaqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
          size="icon"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      )}

      {/* Chatbot Panel */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[calc(100vh-2rem)] sm:h-[600px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">FAQ Assistant</CardTitle>
                <CardDescription className="text-sm">
                  Get quick answers to common questions
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* FAQ Content */}
          <CardContent className="flex-1 overflow-y-auto p-4">
            {filteredFaqs.length > 0 ? (
              <div className="space-y-6">
                {filteredFaqs.map((category, idx) => (
                  <div key={idx}>
                    <h3 className="font-semibold text-sm text-gray-900 mb-3">
                      {category.category}
                    </h3>
                    <div className="space-y-4">
                      {category.questions.map((faq, qIdx) => (
                        <div key={qIdx} className="space-y-2">
                          <p className="font-medium text-sm text-gray-900">
                            {faq.q}
                          </p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium">No results found</p>
                <p className="text-gray-500 text-sm mt-1">
                  Try a different search term
                </p>
              </div>
            )}
          </CardContent>

          {/* Footer */}
          <div className="border-t p-3 text-center">
            <p className="text-xs text-gray-500">
              Still need help? Contact your VP Externals
            </p>
          </div>
        </Card>
      )}
    </>
  )
}
