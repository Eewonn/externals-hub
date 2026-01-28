import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-4xl animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-9 bg-gray-200 rounded w-72"></div>
        <div className="h-5 bg-gray-200 rounded w-96"></div>
      </div>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-80"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 mt-6"></div>
        </CardContent>
      </Card>

      {/* Role Card */}
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-56 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-72"></div>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-gray-100 rounded"></div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="h-16 bg-gray-100 rounded"></div>
        </CardContent>
      </Card>
    </div>
  )
}
