import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function TasksLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-9 bg-gray-200 rounded w-80"></div>
          <div className="h-5 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Progress Bar Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </CardContent>
      </Card>

      {/* Kanban Board Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((col) => (
          <div key={col} className="flex flex-col">
            <Card className="border-2 mb-4">
              <CardHeader className="pb-3">
                <div className="h-5 bg-gray-200 rounded w-32"></div>
              </CardHeader>
            </Card>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Card key={item}>
                  <CardHeader className="pb-3">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-28"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
