'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Search } from 'lucide-react'

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I add a new event?',
        a: 'Navigate to the Events page and click the "Create Event" button. Fill in the required details including title, date, description, and participants.'
      },
      {
        q: 'How do I manage user roles?',
        a: 'Only VP Externals can manage user roles. Go to the Users page, click the three-dot menu next to a user, and select "Change Role".'
      },
      {
        q: 'What are the different user roles?',
        a: 'There are 5 roles: VP Externals (full access), Directors (review endorsements, manage partners), Junior Officers (create events/endorsements), and Adviser (read-only access).'
      }
    ]
  },
  {
    category: 'Events & Competitions',
    questions: [
      {
        q: 'How do I add participants to an event?',
        a: 'When creating or editing an event, you can add participants with their details including name, year level, and course in the participants section.'
      },
      {
        q: 'How do I export events to Excel?',
        a: 'On the Events page, use the filters to select the events you want, then click the "Export to CSV" button at the top right.'
      },
      {
        q: 'What\'s the difference between Category and Nature?',
        a: 'Category refers to the scope (Local, Regional, National), while Nature indicates if it\'s Academic or Non-Academic.'
      }
    ]
  },
  {
    category: 'Schedules',
    questions: [
      {
        q: 'Can Junior Officers see all schedules?',
        a: 'No, Junior Officers can only see their own schedules. VP Externals and Directors can view all officer schedules.'
      },
      {
        q: 'How do I add schedule blocks?',
        a: 'On the Schedules page, click "Add Schedule" and select the day, time slots, and semester. The schedule will be automatically saved.'
      }
    ]
  },
  {
    category: 'Partners & Endorsements',
    questions: [
      {
        q: 'How do I create an endorsement request?',
        a: 'Go to Endorsements page, click "Create Endorsement", fill in the organization details, purpose, and upload any required documents.'
      },
      {
        q: 'Who can approve endorsements?',
        a: 'Directors and VP Externals can review and approve endorsement requests.'
      },
      {
        q: 'How do I add a new partner organization?',
        a: 'Navigate to the Partners page and click "Add Partner". Include contact details and partnership tier information.'
      }
    ]
  }
]

export default function FaqChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFaqs = faqs.map(category => ({
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
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chatbot Panel */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
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
