import { ApplicationForm } from '@/components/application-form'

export const metadata = {
  title: 'Event Application',
  description: 'Apply to participate in ACM endorsed or pending-endorsement events',
}

export default function ApplicationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-12 md:py-20 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Event Application Portal
            </h1>
            <p className="text-xl text-muted-foreground">
              Apply to participate in ACM endorsed or pending-endorsement events and competitions
            </p>
          </div>

          {/* Application Form */}
          <ApplicationForm />

          {/* Information Section */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-semibold mb-2">About This Portal</h3>
              <p className="text-sm text-muted-foreground">
                This application portal allows ACM members and non-members to apply for participation in
                endorsed or pending-endorsement competitions and events organized in coordination with the
                Association for Computing Machinery.
              </p>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-semibold mb-2">Your Information</h3>
              <p className="text-sm text-muted-foreground">
                The information you provide will be securely stored and used only for event coordination,
                participant lists, and endorsement requirement fulfillment. Your data is never shared with
                third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
